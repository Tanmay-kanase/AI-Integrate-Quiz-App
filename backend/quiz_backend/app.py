from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS

app = Flask(__name__)
# Enable CORS for all routes, allowing requests from your Angular frontend (localhost:4200)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})

# Dummy quiz data (replace with actual data generation logic later)
# In a real application, you might generate this based on the 'topic'
# or fetch it from a database/LLM.
QUIZ_DATA = [
    {
        "question": "What is the capital of France?",
        "op1": "Berlin",
        "op2": "Madrid",
        "op3": "Paris",
        "op4": "Rome",
        "ans": "Paris"
    },
    {
        "question": "Which planet is known as the Red Planet?",
        "op1": "Earth",
        "op2": "Mars",
        "op3": "Jupiter",
        "op4": "Venus",
        "ans": "Mars"
    },
    {
        "question": "What is the largest ocean on Earth?",
        "op1": "Atlantic Ocean",
        "op2": "Indian Ocean",
        "op3": "Arctic Ocean",
        "op4": "Pacific Ocean",
        "ans": "Pacific Ocean"
    },
    {
        "question": "Who painted the Mona Lisa?",
        "op1": "Vincent van Gogh",
        "op2": "Pablo Picasso",
        "op3": "Leonardo da Vinci",
        "op4": "Claude Monet",
        "ans": "Leonardo da Vinci"
    },
    {
        "question": "What is the chemical symbol for water?",
        "op1": "O2",
        "op2": "H2O",
        "op3": "CO2",
        "op4": "NaCl",
        "ans": "H2O"
    }
]

@app.route('/api/quiz-generation/<string:topic>', methods=['GET'])
def get_quiz_by_topic(topic):
    """
    Endpoint to generate quiz questions based on a given topic.
    For this example, it returns static data. In a real app, 'topic'
    would influence the questions generated.
    """
    print(f"Received request for topic: {topic}")
    # In a real application, you would use the 'topic' variable
    # to generate relevant questions.
    # For now, we return the dummy data.
    return jsonify(QUIZ_DATA)

@app.route('/')
def home():
    """Basic home route for the backend."""
    return "Python Quiz Backend is running!"

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
