# Class Attendance Monitor

This application helps monitor class attendance using dynamic QR codes.

## Features

- Generate dynamic QR codes with time and usage limits.
- Students can scan the QR code to access a web page and enter their name.
- Attendance is recorded and can be integrated with Google Sheets.

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd class-attendance-monitor
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google Sheets API credentials:**
   - Follow the [Google Cloud documentation](https://developers.google.com/workspace/guides/create-credentials) to create a service account and download the credentials as a JSON file.
   - Rename the downloaded file to `credentials.json` and place it in the `backend` directory.
   - Share your Google Sheet with the client email address found in the `credentials.json` file.

4. **Run the application:**
   ```bash
   python backend/app.py
   ```

## Usage

1. **Generate a QR code:**
   - Send a POST request to `http://127.0.0.1:5000/generate_qr` with the following JSON body:
     ```json
     {
       "minutes_valid": 5,
       "max_uses": 10
     }
     ```
   - This will return a URL to the QR code image.

2. **Scan the QR code:**
   - Students can scan the generated QR code to open the attendance page.

3. **Submit attendance:**
   - Students enter their name and click "Submit".

## Project Structure

- `backend/`: Contains the Flask backend code.
  - `app.py`: The main Flask application.
  - `google_sheets.py`: Helper functions for Google Sheets integration.
  - `static/`: Stores the generated QR code images.
  - `credentials.json`: (To be added) Google Sheets API credentials.
- `frontend/`: Contains the frontend code.
  - `index.html`: The attendance page.
  - `style.css`: Styles for the attendance page.
  - `script.js`: JavaScript for handling form submission.
- `requirements.txt`: Python dependencies.
- `README.md`: This file.
