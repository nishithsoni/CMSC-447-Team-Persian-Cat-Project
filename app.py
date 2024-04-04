from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3

DATABASE = 'database.db'

app = Flask(__name__)
app.secret_key = 'many random bytes'

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/save_username', methods=['POST'])
def save_username():
    username = request.form['username']
    conn = sqlite3.connect('leaderboard.db')
    c = conn.cursor()
    c.execute("INSERT INTO leaderboard (username) VALUES (?)", (username,))
    conn.commit()
    conn.close()
    return 'Success'


if __name__ == "__main__":
    app.run(debug=True)