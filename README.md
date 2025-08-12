ECG Anomaly Detection using Hybrid Autoencoder (LSTM + CNN)
📋 Description
    This project implements a hybrid autoencoder combining LSTM and CNN architectures for detecting anomalies in ECG (Electrocardiogram) signals. The system can identify irregular heartbeat patterns and potential cardiac anomalies using deep learning techniques.
    Key Features

🧠 Hybrid Architecture: Combines LSTM for temporal patterns and CNN for spatial feature extraction
📊 Real-time Detection: Flask API for real-time ECG anomaly detection
🔍 Anomaly Scoring: Provides confidence scores for detected anomalies
📈 Visualization: Interactive plots for ECG signals and detected anomalies
🌐 Web Interface: User-friendly web interface for uploading and analyzing ECG data

🏗️ Project Structure
Autoencoder_hybride_pour_detection_ECG/

    ├── ecg_backend/
    │   ├── app.py                 
    │   ├── model.py
    │   ├── modelFinal.pth
    │   ├── scalerFinal.pkl
    ├── ecg_frontend/                  # Web interface 
    ├── requirements.txt           # Python dependencies
    ├── vercel.json               # Vercel deployment config
    └── README.md                 # This file

🚀 Quick Start
  Prerequisites

    Python 3.8+
    pip or conda package manager

  Installation

    Clone the repository
    git clone https://github.com/hibaDAHIM/Autoencoder_hybride_pour_detection_ECG.git
    cd Autoencoder_hybride_pour_detection_ECG

  Create virtual environment
    python -m venv ecg_env
    source ecg_env/bin/activate  # On Windows: ecg_env\Scripts\activate

  Install dependencies
    pip install -r requirements.txt

  Run the Flask API
    cd ecg_backend
    python app.py

  Access the application
  
    API: http://localhost:5000
    login: http://localhost:5000/login

🧠 Model Architecture
  Hybrid Autoencoder Design
  The model combines two powerful architectures:

    LSTM Component
    
      Captures temporal dependencies in ECG signals
      Processes sequential heartbeat patterns
      Encodes time-series information
    
    
    CNN Component
    
      Extracts spatial features from ECG segments
      Detects local anomalous patterns
      Provides robust feature representation
    
    
    Fusion Layer
    
      Combines LSTM and CNN features
      Learns optimal feature weighting
      Produces final anomaly score



Training Process

    - Data Preprocessing: Normalize ECG signals, segment into fixed-length windows
    - Feature Extraction: Extract both temporal (LSTM) and spatial (CNN) features
    - Reconstruction Training: Train autoencoder to reconstruct normal ECG patterns
    - Anomaly Detection: Use reconstruction error to identify anomalies

📊 Performance Metrics
      |       Metric        |  Value |
      |---------------------|--------|
      | Accuracy            | 97.03% |
      | Precision (Normal)  | 98%    |
      | Precision (Anomaly) | 96%    |
      | Recall (Normal)     | 96%    |
      | Recall (Anomaly)    | 98%    |
      | F1-Score (Normal)   | 97%    |
      | F1-Score (Anomaly)  | 97%    |
      | Total Test Samples  | 438    |

🗂️ Datasets
The model is trained and tested on:
  -ECG5000

👥 Authors

Hiba DAHIM  - dahim.hiba@gmail.com
Chaimaa BDRI - badrichaimaa17@gmail.com

**Supervised by:** Prof. Yann BENMAISSA  

📧 Contact

Email: [dahim.hiba@gmail.com]
Project Link: https://github.com/hibaDAHIM/Autoencoder_hybride_pour_detection_ECG