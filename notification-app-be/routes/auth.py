from flask import Blueprint, request, jsonify
from db import query

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    body         = request.get_json(silent=True) or {}
    student_code = body.get("student_id", "").strip()

    if not student_code:
        return jsonify({"error": "student_id is required"}), 400

    rows = query(
        "SELECT id, name, email, department, year FROM students WHERE student_id = %s",
        (student_code,)
    )

    if not rows:
        return jsonify({"error": "Student not found"}), 404

    student    = dict(rows[0])
    mock_token = f"mock-token-{student['id']}"

    return jsonify({"token": mock_token, "student": student}), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    sid = int(request.headers.get("X-Student-ID", 0))
    if not sid:
        return jsonify({"error": "Not authenticated"}), 401

    rows = query(
        "SELECT id, name, email, department, year FROM students WHERE id = %s",
        (sid,)
    )
    if not rows:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"data": dict(rows[0])}), 200
