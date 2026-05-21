import pymysql
try:
    conn = pymysql.connect(host='localhost', user='root', password='Priyanshu02', port=3306)
    print("MySQL Connection Successful")
    conn.close()
except Exception as e:
    print(f"MySQL Connection Failed: {e}")
