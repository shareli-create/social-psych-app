from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Condition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    completions = db.Column(db.Integer, default=0)
    participants = db.relationship('Participant', backref='condition', lazy=True)

class Participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.String(50), unique=True, nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    condition_id = db.Column(db.Integer, db.ForeignKey('condition.id'), nullable=False)
