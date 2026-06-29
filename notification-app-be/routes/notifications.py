from flask import Blueprint, request, jsonify
from db import query, execute

notifications_bp = Blueprint("notifications", __name__)


def _student_id_from_request():
    sid = request.headers.get("X-Student-ID", "1")
    return int(sid)


def _paginate(request):
    page     = max(1, int(request.args.get("page", 1)))
    per_page = min(50, int(request.args.get("per_page", 20)))
    offset   = (page - 1) * per_page
    return page, per_page, offset


@notifications_bp.route("/", methods=["GET"])
def list_notifications():
    student_id             = _student_id_from_request()
    page, per_page, offset = _paginate(request)

    filter_type   = request.args.get("type")
    filter_status = request.args.get("status")
    sort_by       = request.args.get("sort", "newest")

    conditions = [
        "ns.student_id = %s",
        "ns.is_deleted = FALSE",
        "(n.expires_at IS NULL OR n.expires_at > NOW())",
    ]
    params     = [student_id]

    if filter_type:
        conditions.append("nt.slug = %s")
        params.append(filter_type)

    if filter_status == "read":
        conditions.append("ns.is_read = TRUE")
    elif filter_status == "unread":
        conditions.append("ns.is_read = FALSE")

    order_clause = {
        "newest":   "n.created_at DESC",
        "oldest":   "n.created_at ASC",
        "priority": "nt.priority ASC, n.created_at DESC",
    }.get(sort_by, "n.created_at DESC")

    where = " AND ".join(conditions)

    sql = f"""
        SELECT
            n.id, n.title, n.body, n.created_at, n.expires_at,
            nt.slug AS type, nt.label AS type_label, nt.priority,
            ns.is_read, ns.read_at
        FROM notification_status ns
        JOIN notifications      n  ON n.id  = ns.notification_id
        JOIN notification_types nt ON nt.id = n.type_id
        WHERE {where}
        ORDER BY {order_clause}
        LIMIT %s OFFSET %s
    """
    params.extend([per_page, offset])
    rows = query(sql, params)

    count_sql = f"""
        SELECT COUNT(*) AS total
        FROM notification_status ns
        JOIN notifications      n  ON n.id  = ns.notification_id
        JOIN notification_types nt ON nt.id = n.type_id
        WHERE {where}
    """
    total = query(count_sql, params[:-2])[0]["total"]

    return jsonify({
        "data": [dict(r) for r in rows],
        "meta": {
            "page":        page,
            "per_page":    per_page,
            "total":       total,
            "total_pages": -(-total // per_page)
        }
    }), 200


@notifications_bp.route("/<int:notification_id>", methods=["GET"])
def get_notification(notification_id):
    student_id = _student_id_from_request()
    rows = query("""
        SELECT
            n.id, n.title, n.body, n.created_at, n.expires_at,
            nt.slug AS type, nt.label AS type_label, nt.priority,
            ns.is_read, ns.read_at
        FROM notification_status ns
        JOIN notifications      n  ON n.id  = ns.notification_id
        JOIN notification_types nt ON nt.id = n.type_id
        WHERE ns.student_id = %s AND n.id = %s AND ns.is_deleted = FALSE
          AND (n.expires_at IS NULL OR n.expires_at > NOW())
    """, (student_id, notification_id))

    if not rows:
        return jsonify({"error": "Notification not found"}), 404

    return jsonify({"data": dict(rows[0])}), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PATCH"])
def mark_read(notification_id):
    student_id = _student_id_from_request()
    affected = execute("""
        UPDATE notification_status
        SET    is_read = TRUE, read_at = NOW()
        WHERE  student_id = %s AND notification_id = %s AND is_read = FALSE
    """, (student_id, notification_id))

    if affected == 0:
        return jsonify({"message": "Already read or not found"}), 200

    return jsonify({"message": "Marked as read"}), 200


@notifications_bp.route("/read-all", methods=["PATCH"])
def mark_all_read():
    student_id = _student_id_from_request()
    execute("""
        UPDATE notification_status
        SET    is_read = TRUE, read_at = NOW()
        WHERE  student_id = %s AND is_read = FALSE AND is_deleted = FALSE
    """, (student_id,))
    return jsonify({"message": "All notifications marked as read"}), 200


@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    student_id = _student_id_from_request()
    affected = execute("""
        UPDATE notification_status
        SET    is_deleted = TRUE, deleted_at = NOW()
        WHERE  student_id = %s AND notification_id = %s AND is_deleted = FALSE
    """, (student_id, notification_id))

    if affected == 0:
        return jsonify({"error": "Not found or already deleted"}), 404

    return jsonify({"message": "Notification deleted"}), 200


@notifications_bp.route("/unread-count", methods=["GET"])
def unread_count():
    student_id = _student_id_from_request()
    rows = query("""
        SELECT COUNT(*) AS count
        FROM notification_status
        WHERE student_id = %s AND is_read = FALSE AND is_deleted = FALSE
    """, (student_id,))
    return jsonify({"unread_count": rows[0]["count"]}), 200


@notifications_bp.route("/statistics", methods=["GET"])
def statistics():
    student_id = _student_id_from_request()
    rows = query("""
        SELECT
            nt.slug  AS type,
            nt.label AS type_label,
            COUNT(*) AS total,
            SUM(CASE WHEN ns.is_read = FALSE THEN 1 ELSE 0 END) AS unread
        FROM notification_status ns
        JOIN notifications      n  ON n.id  = ns.notification_id
        JOIN notification_types nt ON nt.id = n.type_id
        WHERE ns.student_id = %s AND ns.is_deleted = FALSE
          AND (n.expires_at IS NULL OR n.expires_at > NOW())
        GROUP BY nt.slug, nt.label, nt.priority
        ORDER BY nt.priority
    """, (student_id,))
    return jsonify({"data": [dict(r) for r in rows]}), 200
