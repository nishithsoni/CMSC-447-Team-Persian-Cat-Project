import sqlite3

DATABASE = 'leaderboard.db'

def create_leaderboard():
    # delete leaderboard if it already exists
    try:
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''DROP TABLE leaderboard''')
        conn.commit()
        conn.close()
    except:
        pass
    conn = sqlite3.connect(DATABASE)
    print("Opened database successfully")
    c = conn.cursor()
    c.execute('''CREATE TABLE leaderboard (username text, curr_level int, num_solved int)''')
    print("Table created successfully")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_leaderboard()