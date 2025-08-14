import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime

def get_sheet():
    # Replace with your own credentials and sheet name
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file('credentials.json', scopes=scope)
    client = gspread.authorize(creds)
    sheet = client.open("Class Attendance").sheet1
    return sheet

def record_attendance(name):
    sheet = get_sheet()
    sheet.append_row([name, str(datetime.now())])
