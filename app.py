import uuid
from flask import Flask, redirect, render_template, request, url_for, render_template_string
from models import db, Condition, Participant

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/project.db'
app.config['INQUISIT_URL'] = 'https://mili2nd.co/your-inquisit-script-name'
db.init_app(app)

with app.app_context():
    db.create_all()
    # Create default conditions if they don't exist
    if Condition.query.count() == 0:
        db.session.add(Condition(name='ConditionA'))
        db.session.add(Condition(name='ConditionB'))
        db.session.commit()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Determine the next condition
        condition = Condition.query.order_by(Condition.completions).first()

        # Create a new participant
        participant = Participant(
            subject_id=str(uuid.uuid4()),
            condition_id=condition.id
        )
        db.session.add(participant)
        db.session.commit()

        # Redirect to Inquisit
        inquisit_url = f"{app.config['INQUISIT_URL']}?subjectid={participant.subject_id}&condition={condition.name}"
        return redirect(inquisit_url)

    return render_template('index.html')

@app.route('/complete')
def complete():
    subject_id = request.args.get('subjectid')
    completion_code = request.args.get('completion_code') # Assuming inquisit sends a completion code

    # For now, we'll assume any return to this page is a completion.
    # In a real scenario, you might want to check the completion_code.

    participant = Participant.query.filter_by(subject_id=subject_id).first()

    if participant and not participant.completed:
        participant.completed = True
        participant.condition.completions += 1
        db.session.commit()

    return render_template('complete.html')

@app.route('/stats')
def stats():
    conditions = Condition.query.all()
    participants = Participant.query.all()
    return render_template_string("""
    <h1>Stats</h1>
    <h2>Conditions</h2>
    <ul>
    {% for condition in conditions %}
        <li>{{ condition.name }}: {{ condition.completions }} completions</li>
    {% endfor %}
    </ul>
    <h2>Participants</h2>
    <ul>
    {% for participant in participants %}
        <li>{{ participant.subject_id }} ({{ participant.condition.name }}): {{ 'Completed' if participant.completed else 'Not Completed' }}</li>
    {% endfor %}
    </ul>
    """, conditions=conditions, participants=participants)

if __name__ == '__main__':
    app.run(debug=True)
