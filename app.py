from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3

DATABASE = 'database.db'

app = Flask(__name__)
app.secret_key = 'many random bytes'

@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)