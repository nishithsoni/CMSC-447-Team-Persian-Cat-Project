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
    level = request.form['level']
    session['username'] = username
    session['level'] = level
    conn = sqlite3.connect(LEADERBOARD)
    c = conn.cursor()
    c.execute(f"INSERT INTO leaderboard (username, curr_level, num_solved) VALUES ('{username}', {level}, 0)")
    conn.commit()
    conn.close()
    return 'Success!'


if __name__ == "__main__":
    app.run(debug=True)
