from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import sqlite3

DATABASE = 'database.db'
LEADERBOARD = 'leaderboard.db'
WORDS = 'words.db'

# Connect to the words.db database
conn = sqlite3.connect(WORDS)
c = conn.cursor()

# Clear the tables so that duplicates don't get loaded into each word table every time the app is refreshed
c.execute("DELETE FROM guessable_words")
c.execute("DELETE FROM answer_words")

with open('guessable_words.txt') as f:
    guessable_words = [word.strip() for word in f.readlines()]

with open('answer_words.txt') as f:
    answer_words = [word.strip() for word in f.readlines()]

# Create the table for the guessable words
c.execute("""CREATE TABLE IF NOT EXISTS guessable_words (word TEXT NOT NULL)""")

# Create the table 'answer_words' in words.db to hold on the valid answer words
c.execute("""CREATE TABLE IF NOT EXISTS answer_words (word TEXT NOT NULL)""")

# Insert the words into the guessable_words table in words.db
c.executemany("""INSERT INTO guessable_words (word) VALUES (?)""", [(word,) for word in guessable_words])

# Insert the words into the answer_words table in words.db
c.executemany("""INSERT INTO answer_words (word) VALUES (?)""", [(word,) for word in answer_words])

conn.commit()
conn.close()

app = Flask(__name__)
app.secret_key = 'many random bytes'

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/save_username', methods=['POST'])
def save_username():
    username = request.form['username']
    conn = sqlite3.connect(LEADERBOARD)
    c = conn.cursor()
    c.execute("INSERT INTO leaderboard (username) VALUES (?)", (username,))
    conn.commit()
    conn.close()
    return 'Success'

@app.route('/guessable_words')
def guessable_words():
    conn = sqlite3.connect(WORDS)
    c = conn.cursor()
    c.execute("SELECT word FROM guessable_words")
    words = [row[0] for row in c.fetchall()]
    conn.close()
    return jsonify(words)

@app.route('/answer_words')
def answer_words():
    conn = sqlite3.connect(WORDS)
    c = conn.cursor()
    c.execute("SELECT word FROM answer_words")
    words = [row[0] for row in c.fetchall()]
    conn.close()
    return jsonify(words)


if __name__ == "__main__":
    app.run(debug=True)
