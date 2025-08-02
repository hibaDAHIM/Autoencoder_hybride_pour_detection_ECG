# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, date
from sqlalchemy import event
from werkzeug.security import generate_password_hash, check_password_hash
import torch.nn as nn


db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False) 
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  
    created_at = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_authenticated(self):
        return True

class Doctor(db.Model):
    __tablename__ = 'doctors'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    # relation avec User
    user = db.relationship('User', backref=db.backref('doctor', uselist=False))
    # relation avec Patients
    patients = db.relationship('Patients', back_populates='doctor', cascade="all, delete-orphan")

    def __init__(self, user):
        self.user = user

    def __repr__(self):
        return (
            f"<Doctor {self.id}: {self.user}>"
        )
       

class Patients(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String)
    date_naissance = db.Column(db.Date, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    address = db.Column(db.String(200))
    ecg_records = db.relationship('ECGRecord', back_populates='patient', cascade="all, delete-orphan")
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    doctor = db.relationship('Doctor', back_populates='patients')

    __table_args__ = (
        db.UniqueConstraint('email', 'doctor_id', name='unique_patient_email_per_doctor'),
    )

    def __init__(self, name, age, gender, date_naissance, email, phone, address, doctor):
        self.name = name
        self.age = age
        self.gender = gender
        self.date_naissance = date_naissance
        self.email = email
        self.phone = phone
        self.address = address
        self.doctor=doctor

    def __repr__(self):
        return (
            f"<Patient {self.id}: {self.name}, {self.age} y, "
            f"{self.email}, {self.phone}, {self.gender}, {self.created_at}, {self.address}>"
        )

    def get_age(self):
        if self.age is not None:
            return self.age
        if self.date_naissance is None:
            return None
        if isinstance(self.date_naissance, str):
            self.date_naissance = datetime.strptime(self.date_naissance, "%Y-%m-%d").date()
        today = date.today()
        return today.year - self.date_naissance.year - ((today.month, today.day) < (self.date_naissance.month, self.date_naissance.day))

@event.listens_for(Patients, 'before_insert')
def set_age(mapper, connection, target):
    if target.age is None and target.date_naissance:
        target.age = target.get_age()

class ECGRecord(db.Model):
    __tablename__ = 'ecg_records'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    file_path = db.Column(db.Text, nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    has_anomaly = db.Column(db.Boolean, nullable=True)
    loss_score = db.Column(db.Float, nullable=True)
    plot_path = db.Column(db.Text, nullable=True)
    patient = db.relationship('Patients', back_populates='ecg_records')
    
    def __repr__(self):
        return f"<ECGRecord id={self.id} patient_id={self.patient_id} anomaly={self.has_anomaly}>"
    
class LstmCnn_AutoEncoder(nn.Module):
    def __init__(self, seq_len, n_features, hidden_dim=64, latent_dim=32):
        super(LstmCnn_AutoEncoder, self).__init__()
        
        self.seq_len = seq_len
        self.n_features = n_features
        self.hidden_dim = hidden_dim
        self.latent_dim = latent_dim
        
        # Encodeur
        # Partie CNN pour extraction de features locales
        self.encoder_conv1 = nn.Conv1d(n_features, 32, kernel_size=3, padding=1)
        self.encoder_conv2 = nn.Conv1d(32, 64, kernel_size=3, padding=1)
        self.encoder_pool = nn.MaxPool1d(2)
        
        # Partie LSTM pour capturer les dépendances temporelles
        self.encoder_lstm = nn.LSTM(64, hidden_dim, batch_first=True)
        self.encoder_fc = nn.Linear(hidden_dim, latent_dim)
        
        # Décodeur
        self.decoder_fc = nn.Linear(latent_dim, hidden_dim)
        self.decoder_lstm = nn.LSTM(hidden_dim, 64, batch_first=True)
        
        # Reconstruction CNN
        self.decoder_conv1 = nn.ConvTranspose1d(64, 32, kernel_size=3, padding=1)
        self.decoder_conv2 = nn.ConvTranspose1d(32, n_features, kernel_size=3, padding=1)
        self.decoder_upsample = nn.Upsample(scale_factor=2)
        
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        batch_size = x.size(0)
        
        # Encodeur
        # CNN part (batch_size, seq_len, features) -> (batch_size, features, seq_len)
        x_conv = x.transpose(1, 2)
        x_conv = self.relu(self.encoder_conv1(x_conv))
        x_conv = self.encoder_pool(x_conv)
        x_conv = self.relu(self.encoder_conv2(x_conv))
        x_conv = self.encoder_pool(x_conv)
        
        # Back to (batch_size, seq_len, features)
        x_conv = x_conv.transpose(1, 2)
        
        # LSTM part
        lstm_out, (hidden, cell) = self.encoder_lstm(x_conv)
        # Prendre la dernière sortie
        encoded = self.encoder_fc(lstm_out[:, -1, :])
        
        # Décodeur
        decoded = self.relu(self.decoder_fc(encoded))
        # Répéter pour la séquence
        decoded = decoded.unsqueeze(1).repeat(1, x_conv.size(1), 1)
        
        # LSTM decoder
        lstm_out, _ = self.decoder_lstm(decoded)
        
        # CNN decoder
        x_deconv = lstm_out.transpose(1, 2)
        x_deconv = self.decoder_upsample(x_deconv)
        x_deconv = self.relu(self.decoder_conv1(x_deconv))
        x_deconv = self.decoder_upsample(x_deconv)
        x_deconv = self.sigmoid(self.decoder_conv2(x_deconv))
        
        # Ajuster la taille finale
        x_deconv = x_deconv.transpose(1, 2)
        # Redimensionner pour correspondre à l'entrée originale
        if x_deconv.size(1) != self.seq_len:
            x_deconv = nn.functional.interpolate(
                x_deconv.transpose(1, 2), 
                size=self.seq_len, 
                mode='linear', 
                align_corners=False
            ).transpose(1, 2)
        
        return x_deconv