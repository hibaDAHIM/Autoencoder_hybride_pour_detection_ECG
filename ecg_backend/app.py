# app.py
from flask import Flask, jsonify, request,render_template, session
from flask_login import LoginManager, login_user, login_required, current_user, logout_user
from flask_migrate import Migrate
from model import Doctor, db, User, Patients,ECGRecord, LstmCnn_AutoEncoder
from datetime import datetime, timedelta
import torch
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import torch.nn as nn
import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
import pandas as pd
import joblib
import os
import pandas as pd
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_session import Session 


app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:chaimaa@localhost/ECG'
app.config['SECRET_KEY'] = 'secret'
app.config['SESSION_TYPE'] = 'filesystem'  # Can be 'redis', 'memcached', etc. in production
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # Session expiry

CORS(app,origins=["http://localhost:3000"], supports_credentials=True,)
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)
app.config['SESSION_PERMANENT'] = True

# Initialize Flask-Session
Session(app)

db.init_app(app)
migrate = Migrate(app, db)

# Create tables
with app.app_context():
    db.create_all()  # This creates all tables defined in your models


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):

    return User.query.get(user_id)

def format_patient(patient):
    return {
        "id" : patient.id,
        "name" : patient.name,
        "gender" : patient.gender,
        "age" : patient.age,
        "date_naissance" : patient.date_naissance,
        "email" : patient.email,
        "phone" : patient.phone,
        "address" : patient.address ,
        "created_at" : patient.created_at,
        "doctor_name": patient.doctor.user.name if patient.doctor and patient.doctor.user else None,
    }

def format_doctor(doctor):
    return {
        "id" : doctor.id,
        "name": doctor.user.name,
        "username" : doctor.user.username,
        "password": doctor.user.password_hash,
        "email" : doctor.user.email,
        "created_at" : doctor.user.created_at
    }

def format_ecg_record(record):
    return {
        'id': record.id,
        'patient_id': record.patient_id,
        'file_path': record.file_path,
        'plot_path': record.plot_path,
        'has_anomaly': record.has_anomaly,
        'loss_score': record.loss_score,
        'upload_date': record.upload_date.isoformat(),
        'patient_name': record.patient.name if record.patient else None,
        'doctor_name':  record.patient.doctor.user.name if record.patient.doctor.user else None
    }

#model part 
# # Désactive la protection
# Set a threshold manually (you can adjust based on training)
threshold = 5.7897
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
def load_model():
    from model import LstmCnn_AutoEncoder
    return torch.load("modelFinal.pth", map_location=torch.device("cpu"),weights_only=False)


# Function to preprocess and scale the signal
def preprocess_signal(df):
    # Convert to numpy array (shape: [1, 140])
    signal = df.values.astype(np.float32)
    scaler = joblib.load('scalerFinal.pkl')

    # Use it on any input (e.g. test data or new sample)
    signal_normalized = scaler.transform(signal)
    
    # Reshape for LSTM/CNN (batch, timesteps, features)
    signal_reshaped = signal_normalized.reshape(1, 140, 1)
    
    return signal_reshaped


def predict_model(dataset):
    predictions, losses = [], []
    criterion = nn.L1Loss(reduction='sum').to(device)
    model = load_model()
    with torch.no_grad():
        model = model.eval()
        for seq_true in dataset:
            seq_true = torch.tensor(seq_true, dtype=torch.float32).unsqueeze(0).to(device)
            seq_pred = model(seq_true)

            loss = criterion(seq_pred, seq_true)

            predictions.append(seq_pred.cpu().numpy().flatten())
            losses.append(loss.item())
    return predictions, losses

def plot_single_prediction(data, pred, loss, title):
    """
    Affiche un seul graphique avec le signal original et reconstruit
    
    Args:
        data: Signal original (shape: [1, seq_length])
        pred: Signal reconstruit (shape: [1, seq_length])
        loss: Valeur de perte pour ce signal
        title: Titre du graphique
    """
    fig, ax = plt.subplots(figsize=(10, 4))
    
    ax.plot(data[0], label='Signal original')
    ax.plot(pred[0], label='Signal reconstruit', linestyle='--')
    ax.set_title(f'{title} (Perte: {np.around(loss[0], 2)})')
    ax.legend()
    ax.grid(True)
    
    plt.tight_layout()
    return fig

#make prediction
def process_ecg_prediction(file, threshold, upload_folder='static/uploaded_files', plot_folder='static/plots'):
    # Ensure folders exist
    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(plot_folder, exist_ok=True)
    model = load_model()
    # Get secure filename and paths
    filename = secure_filename(file.filename)
    file_path = os.path.join(upload_folder, filename)

    # Save file only if not already saved
    if not os.path.exists(file_path):
        file.save(file_path)
        print(f"File saved to {file_path}")

    # Plot will be named like the file, but with .png
    base_name = os.path.splitext(filename)[0]
    plot_filename = f"{base_name}.png"
    plot_path = os.path.join(plot_folder, plot_filename)

    # Generate plot only if not already exists
    if not os.path.exists(plot_path):
        with open(file_path, encoding="utf-8") as f:
            content = f.read().strip()
        
        # Nettoyage du BOM éventuel
        content = content.lstrip('\ufeff')
        separator = ';' if ';' in content else ','
        data = [float(x) for x in content.split(separator) if x]
        df = pd.DataFrame([data])

        original = preprocess_signal(df)
        pred, loss = predict_model(original)

        fig = plot_single_prediction(original, pred, loss, title='ECG Reconstruction')
        fig.savefig(plot_path)
        plt.close(fig)

        computed_loss = loss[0]
        is_anomaly = loss[0] > threshold
    else:
        # Just re-read data to recompute prediction
        with open(file_path, encoding="utf-8") as f:
            content = f.read().strip()
        # Nettoyage du BOM éventuel
        content = content.lstrip('\ufeff')
        # Détection du séparateur : ; ou ,
        separator = ';' if ';' in content else ','
        data = [float(x) for x in content.split(separator) if x]
        df = pd.DataFrame([data])

        original = preprocess_signal(df)
        pred, loss = predict_model(original)

        computed_loss = loss[0]
        is_anomaly = loss[0] > threshold

    print(f"is anomaly: {is_anomaly}")
    
    

    return {
        'file_path': file_path,
        'plot_path': plot_path,
        'loss': computed_loss,
        'is_anomaly': is_anomaly,
    }

@app.route("/")
@app.route("/api")
def home():
    return "ECG Anomaly Detection API"

@app.route('/login', methods=['POST'])
def login():
    print(current_user)
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if user is None:
         return jsonify({'error': 'Invalid email or password'}), 401
    if user and user.check_password(password):
        login_user(user, remember=True) 
        print(user)
        session['user'] = user.username
        session.permanent = True  # Make session persistent
        return jsonify({'message': 'Logged in successfully', 'is_admin': user.is_admin},), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401


@app.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'username': current_user.username,
    })

@app.route('/check_session')
@login_required
def check_session():
    user=session.get('user', 'anonymous')
    print(user)
    return jsonify({'user': session.get('user', 'anonymous')})

import logging
logging.basicConfig(level=logging.DEBUG)


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@app.route("/predict", methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        file = request.files['file']
        result = process_ecg_prediction(file, threshold)

        prediction = "Anomaly" if result['is_anomaly'] else "Normal"

        return render_template(
            'predict.html',
            plot_path=result['plot_path'],
            prediction=prediction,
            loss=result['loss']
        )

    return render_template('predict.html')

#create ecg record
@login_required
@app.route('/patients/analyze/<id>', methods=['POST','GET'])
def add_ecg_record(id):
    file = request.files['file']
    patient_id = id
    model = torch.load("modelFinal.pth", map_location=torch.device("cpu"),weights_only=False)
    result = process_ecg_prediction(file,threshold)
    query = Patients.query
    patients = query.filter_by(id=patient_id).one()

    record = ECGRecord(
        patient_id=patient_id,
        file_path=result['file_path'],
        plot_path=result['plot_path'],
        has_anomaly=result['is_anomaly'],
        loss_score=result['loss'],
        upload_date=datetime.utcnow(),
        patient=patients
    )

    db.session.add(record)
    db.session.commit()
    return jsonify({ 'message': 'ECG record saved', **format_ecg_record(record) })

#gel all records
@login_required
@app.route("/ecg_records",methods=['GET'])
def get_records():
    # Vérifier si l'utilisateur est un docteur (et pas admin)
    if current_user.is_admin:
        return {"error": "Access denied"}, 403
    # Trouver le docteur lié à cet utilisateur
    doctor = Doctor.query.filter_by(id=current_user.id).first()
    if not doctor:
        return {"error": "Doctor not found"}, 404
    # Récupérer tous les patients liés à ce docteur
    patient_ids = [patient.id for patient in doctor.patients]
     # Récupérer les enregistrements ECG liés à ces patients
    records = ECGRecord.query.filter(ECGRecord.patient_id.in_(patient_ids)).order_by(ECGRecord.id.asc()).all()
   # Formatter les résultats
    record_list = [format_ecg_record(record) for record in records]
    return {'records': record_list}

#admin gel all records
@login_required
@app.route("/admin/ecg_records",methods=['GET'])
def get_all_records():
    records = ECGRecord.query.order_by(ECGRecord.id.asc()).all()
    record_list = []
    for record in records:
        record_list.append(format_ecg_record(record))
    return {'records': record_list}

#get patient by parametre
@login_required
@app.route("/ecg_records/search", methods=['GET'])
def search_records():
    query = ECGRecord.query
    
    id = request.args.get('id')
    patient_id = request.args.get('patient_id')
    file_path = request.args.get('file_path')
    plot_path = request.args.get('plot_path')
    has_anomaly = request.args.get('has_anomaly')
    loss_score = request.args.get('loss_score')

    if id:
        query = query.filter_by(id=id)
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    if file_path:
        query = query.filter(ECGRecord.file_path.ilike(f"%{file_path}%"))
    if plot_path:
        query = query.filter(ECGRecord.plot_path.ilike(f"%{plot_path}%"))
    if has_anomaly:
        if has_anomaly.lower() == 'true':
            query = query.filter_by(has_anomaly=True)
        elif has_anomaly.lower() == 'false':
            query = query.filter_by(has_anomaly=False)
    if loss_score:
        query = query.filter_by(loss_score=loss_score)
    records = query.all()
    formatted = [format_ecg_record(p) for p in records]

    return {'records': formatted}

#delete record
@login_required
@app.route("/ecg_records/<id>",methods=['DELETE'])
def delete_record(id):
    record = ECGRecord.query.filter_by(id=id).one()
    db.session.delete(record)
    db.session.commit()
    return f'Record id:{id} deleted!'

#create doctor
@app.route('/admin/doctors/add', methods=['POST'])
@login_required
def create_doctor():
    if not current_user.is_admin:
        return jsonify({'error': 'Access forbidden'})

    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'})

    user = User(
        name= data['name'].title(),
        username=data['username'],
        email=data['email'],
        is_admin=False
    )
    user.set_password(data['password'])
    doctor=Doctor(
        user=user,
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({'message': 'Doctor created successfully'})



#get all doctors 
@app.route('/admin/doctors', methods=['GET'])
@login_required
def get_all_doctors():
    print(current_user)
    if not current_user.is_admin:
        return jsonify({'error': 'Access forbidden'})
    doctors = Doctor.query.order_by(Doctor.id.asc()).all()
    doctors_list = []
    for doctor in doctors:
        doctors_list.append(format_doctor(doctor))
    return {'doctors': doctors_list}

#get a doctor 
@app.route('/admin/doctors/<id>', methods=['GET'])
@login_required
def get_doctor(id):
    if not current_user.is_admin:
        return jsonify({'error': 'Access forbidden'})
    doctor = Doctor.query.filter_by(id=id).one()

    return {'doctor':format_doctor(doctor)}
#get doctor by parametre
@login_required
@app.route("/admin/doctors/search", methods=['GET'])
def search_doctors():
    if not current_user.is_admin:
        return jsonify({'error': 'Access forbidden'}), 403
    query = User.query.filter_by(is_admin=False)

    user_id = request.args.get('id')
    username = request.args.get('username')
    email = request.args.get('email')

    if user_id:
        query = query.filter_by(id=user_id)
    if username:
        query = query.filter(User.username.ilike(f"%{username}%"))
    if email:
        query = query.filter(User.email.ilike(f"%{email}%"))
    doctors = query.all()
    formatted = [format_doctor(p) for p in doctors]
    return {'doctors': formatted}

#delete doctor
@login_required
@app.route("/admin/doctors/<id>", methods=['DELETE'])
def delete_doctor(id):
    
    if not current_user.is_admin:
        return jsonify({'error': 'Access forbidden'}), 403

    doctor = Doctor.query.filter_by(id=id).first()
    if doctor is None:
        return jsonify({'error': 'Doctor not found'}), 404
    
    user=doctor.user
    db.session.delete(doctor)
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'Doctor with ID {id} has been deleted successfully'}), 200

#edit_a_doctor
@login_required
@app.route("/admin/doctors/update/<id>", methods=['PUT'])
def update_doctor(id):
    if not current_user.is_admin :
        return jsonify({'error': 'Access forbidden'}), 403

    doctor = Doctor.query.filter_by(id=id).first()
    if doctor is None:
        return jsonify({"error": "Doctor not found"}), 404

    data = request.get_json()
    # 🔒 Remove created_at to protect it
    data.pop('created_at', None)

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if 'username' in data:
        doctor.user.username = data['username']
    if 'email' in data:
        doctor.user.email = data['email']
    if 'name' in data:
        doctor.user.name = data['name'].title()


    db.session.commit()
    return jsonify({"message": f"Doctor {id} updated successfully"}), 200

@app.route("/admin/doctors/change-password/<int:doctor_id>", methods=["PUT"])
@login_required
def admin_change_doctor_password(doctor_id):
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_password = data.get("password")

    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

   
    doctor.user.set_password(new_password)

    db.session.commit()
    return jsonify({"message": "Mot de passe du docteur mis à jour"}), 200

#create_patient
@login_required
@app.route("/patients/add",methods=['POST'])
def create_patient() :
    data = request.get_json()
        # Required fields check
    required_fields = ['name', 'date_naissance', 'email']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    # Validate date_naissance format (YYYY-MM-DD)
    try:
        date_naissance = datetime.strptime(data.get('date_naissance'), '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format for date_naissance, expected YYYY-MM-DD"}), 400

    # Validate age if provided
    age = data.get('age')
    if age is not None:
        try:
            age = int(age)
            if age < 0 or age > 120:
                return jsonify({"error": "Age must be between 0 and 120"}), 400
        except ValueError:
            return jsonify({"error": "Age must be an integer"}), 400
    # Check if the email already exists
    existing_patient = Patients.query.filter_by(email=data.get('email'), doctor_id=current_user.id).first()
    
    if existing_patient:
        return jsonify({"error": "Email already in use"}), 400
    doctor_id=current_user.id
    doctor=Doctor.query.filter_by(id=doctor_id).first()
    patient = Patients(
        name=data.get('name').title(),
        age=data.get('age'),
        gender=data.get('gender'),
        date_naissance=data.get('date_naissance'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        doctor= doctor,
    )
    db.session.add(patient)
    db.session.commit()
    return format_patient(patient)

#admin get all patient
@login_required
@app.route("/admin/patients",methods=['GET'])
def get_all_patients():
    patients = Patients.query.order_by(Patients.id.asc()).all()
    patient_list = []
    for patient in patients:
        patient_list.append(format_patient(patient))
    return {'patients': patient_list}

#get all patient
@login_required
@app.route("/patients",methods=['GET'])
def get_patients():
    print(current_user)
    doctor_id=current_user.id
    patients = Patients.query.filter_by(doctor_id=doctor_id).order_by(Patients.id.asc()).all()
    patient_list = []
    for patient in patients:
        patient_list.append(format_patient(patient))
    return {'patients': patient_list}

#get a patient
@login_required
@app.route("/patients/<id>",methods=['GET'])
def get_patient(id):
    patient = Patients.query.filter_by(id=id).one()

    return {'patient':format_patient(patient)}

#get patient by parametre
@login_required
@app.route("/patients/search", methods=['GET'])
def search_patients():
    query = Patients.query

    patient_id = request.args.get('id')
    name = request.args.get('name')
    age = request.args.get('age')
    gender = request.args.get('gender')
    date_naissance = request.args.get('date_naissance')
    email = request.args.get('email')
    phone = request.args.get('phone')
    address = request.args.get('address')

    if patient_id:
        query = query.filter_by(id=patient_id)
    if name:
        query = query.filter(Patients.name.ilike(f"%{name}%"))
    if age:
        query = query.filter_by(age=age)
    if gender:
        query = query.filter_by(gender=gender)
    if date_naissance:
        query = query.filter_by(date_naissance=date_naissance)
    if email:
        query = query.filter(Patients.email.ilike(f"%{email}%"))
    if phone:
        query = query.filter(Patients.phone.ilike(f"%{phone}%"))
    if address:
        query = query.filter(Patients.address.ilike(f"%{address}%"))
    patients = query.all()
    formatted = [format_patient(p) for p in patients]

    return {'patients': formatted}

#delete patient
@login_required
@app.route("/patients/<id>",methods=['DELETE'])
def delete_patient(id):
    patient = Patients.query.filter_by(id=id).one()
    db.session.delete(patient)
    db.session.commit()
    return f'Patient id:{id} deleted!'

#edit_a_patient
@login_required
@app.route("/patients/update/<id>", methods=["PUT"])
def update_patient(id):
    patient = Patients.query.filter_by(id=id).first()

    if patient is None:
        return {"error": "Patient not found"}, 404

    data = request.get_json()
    # 🔒 Remove created_at to protect it
    data.pop('created_at', None)

    # Update only the fields that are provided in the request
    if 'name' in data:
        patient.name = data['name'].title()
    if 'age' in data:
        patient.age = data['age']
    if 'gender' in data:
        patient.gender = data['gender']
    if 'date_naissance' in data:
        patient.date_naissance = data['date_naissance']
    if 'email' in data:
        patient.email = data['email']
    if 'phone' in data:
        patient.phone = data['phone']
    if 'address' in data:
        patient.address = data['address']

    db.session.commit()
    return {"message": f"Patient {id} updated successfully"}, 200

if __name__ == "__main__":
    app.run(debug=True)