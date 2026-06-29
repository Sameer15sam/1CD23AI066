from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.notifications import notifications_bp
from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
app.register_blueprint(auth_bp,          url_prefix="/api/auth")


@app.route("/api/health")
def health():
    return {"status": "ok", "service": "campus-notification-api"}, 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
