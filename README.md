# Inquisit Communication App

This is a Flask web application that communicates with Inquisit to manage participant conditions and track completions.

## Features

- Assigns a condition to a participant based on the number of completions for each condition.
- Redirects the participant to the Inquisit experiment with the assigned condition and a unique subject ID.
- Receives a completion code from Inquisit and updates the database.
- Provides a simple dashboard to view the status of participants and conditions.

## Setup and Configuration

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure the Inquisit URL:**
   Open `app.py` and change the `INQUISIT_URL` to your Inquisit script's launch URL.
   ```python
   app.config['INQUISIT_URL'] = 'https://mili2nd.co/your-inquisit-script-name'
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```
   The application will be available at `http://127.0.0.1:5000`.

## How it Works

1. The participant opens the application in their browser.
2. They click the "Start" button.
3. The application determines the next condition and creates a new participant record in the database.
4. The participant is redirected to the Inquisit experiment.
5. After completing the experiment, Inquisit redirects the participant back to the application's `/complete` endpoint.
6. The application updates the participant's status to "completed" and increments the completion count for the condition.

## Endpoints

- `/`: The main page where participants start the experiment.
- `/complete`: The endpoint that Inquisit redirects to upon completion.
- `/stats`: A page to view the current stats of the experiment.
