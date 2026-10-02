from flask import Flask, render_template, request, jsonify
import mysql.connector

app = Flask(__name__, static_folder='static', template_folder='templates')


def get_db_connection():
    return mysql.connector.connect(
        host="",
        user="",
        password="",
        database=""
    )

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/forklift/<int:forklift_id>')
def forklift(forklift_id):
    return render_template('terkep.html', forklift_id=forklift_id)


@app.route('/api/positions', methods=['GET'])
def get_positions():
    date = request.args.get("date")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    forklift_id = request.args.get("forklift_id")

    if not date or not forklift_id:
        return jsonify([])

    allowed_tables = {
        "1": "teszt1",
        "2" : "teszt2",
        "3":"teszt3",
        "4": "teszt4",
                "5" : "teszt5",
                "6":"teszt6",
    }

    table_name = allowed_tables.get(forklift_id)
    if not table_name:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = f"""
        SELECT latitude AS lat, longitude AS lon, datum, time
        FROM {table_name}
        WHERE datum = %s
    """

    params = [date]

    if start_time and end_time:
        query += " AND time BETWEEN %s AND %s"
        params.extend([start_time, end_time])

    query += " ORDER BY time ASC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)


if __name__ == '__main__':
    app.run(host='', port=5000, debug=True)
