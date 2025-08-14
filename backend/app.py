from flask import Flask, request, jsonify, send_from_directory
import qrcode
import uuid
from datetime import datetime, timedelta
import google_sheets

app = Flask(__name__, static_folder='../frontend')

# In-memory storage for QR code data
qr_code_data = {}

@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    data = request.json
    minutes_valid = int(data.get('minutes_valid', 1))
    max_uses = int(data.get('max_uses', 1))

    token = str(uuid.uuid4())
    expiration_time = datetime.utcnow() + timedelta(minutes=minutes_valid)

    qr_code_data[token] = {
        'expiration_time': expiration_time,
        'max_uses': max_uses,
        'uses': 0,
        'attendees': []
    }

    # Generate QR code
    qr_url = request.host_url + 'attend/' + token
    img = qrcode.make(qr_url)
    img_path = f"backend/static/{token}.png"
    img.save(img_path)

    return jsonify({'qr_code_url': f'/static/{token}.png', 'token': token})

@app.route('/attend/<token>')
def attend(token):
    if token not in qr_code_data:
        return "Invalid QR Code", 404

    data = qr_code_data[token]

    if datetime.utcnow() > data['expiration_time']:
        return "QR Code has expired", 403

    if data['uses'] >= data['max_uses']:
        return "QR Code has reached its maximum number of uses", 403

    return send_from_directory('../frontend', 'index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    token = data.get('token')
    name = data.get('name')

    if not token or not name:
        return "Invalid request", 400

    if token not in qr_code_data:
        return "Invalid token", 404

    qr_data = qr_code_data[token]

    if datetime.utcnow() > qr_data['expiration_time']:
        return "Session has expired", 403

    if qr_data['uses'] >= qr_data['max_uses']:
        return "Session is full", 403

    qr_data['uses'] += 1
    qr_data['attendees'].append(name)

    # Save to Google Sheets
    try:
        google_sheets.record_attendance(name)
    except Exception as e:
        print(f"Error recording attendance to Google Sheets: {e}")
        # Optionally, return an error to the user
        # return jsonify({'message': 'Could not record attendance to Google Sheets'}), 500

    return jsonify({'message': 'Attendance recorded successfully'})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
