from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import sqlite3

LEADERBOARD = 'leaderboard.db'

app = Flask(__name__)
app.secret_key = 'many random bytes'

@app.route("/")
def index():
    defaultGuesses = 6
    return render_template("index.html", numGuesses=defaultGuesses)

@app.route('/save_username', methods=['POST'])
def save_username():
    username = request.form['username']
    session['username'] = username
    conn = sqlite3.connect(LEADERBOARD)
    c = conn.cursor()
    # Check if user already exists in leaderboard
    c.execute(f"SELECT * FROM leaderboard WHERE username = '{username}'")
    user = c.fetchone()
    if user is None:
        c.execute(f"INSERT INTO leaderboard (username, num_solved) VALUES ('{username}', 0)")

    conn.commit()
    conn.close()
    return 'Success!'

@app.route('/update_leaderboard', methods=['POST'])
def update_leaderboard():
    username = session['username']
    conn = sqlite3.connect(LEADERBOARD)
    c = conn.cursor()
    c.execute(f"UPDATE leaderboard SET num_solved = num_solved + 1 WHERE username = '{username}'")
    conn.commit()
    conn.close()
    return 'Success!'

@app.route('/get_leaderboard', methods=['GET'])
def get_leaderboard():
    conn = sqlite3.connect(LEADERBOARD)
    c = conn.cursor()
    # get top 5 usernames with most solved puzzles
    c.execute("SELECT * FROM leaderboard ORDER BY num_solved DESC LIMIT 5")
    leaderboard_data = c.fetchall()
    conn.close()
    return jsonify(leaderboard_data)


if __name__ == "__main__":
    app.run(debug=True)
