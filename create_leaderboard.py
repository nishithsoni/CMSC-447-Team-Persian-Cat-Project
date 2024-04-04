import sqlite3

DATABASE = 'leaderboard.db'

def create_leaderboard():
    conn = sqlite3.connect(DATABASE)
    print("Opened database successfully")
    c = conn.cursor()
    c.execute('''CREATE TABLE leaderboard (username text, num_solved int)''')
    print("Table created successfully")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_leaderboard()