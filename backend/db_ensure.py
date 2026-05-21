import pymysql
try:
    conn = pymysql.connect(host='localhost', user='root', password='Priyanshu02', port=3306)
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES LIKE 'asset_management'")
    result = cursor.fetchone()
    if result:
        print("Database 'asset_management' exists")
    else:
        print("Database 'asset_management' does NOT exist")
        cursor.execute("CREATE DATABASE asset_management")
        print("Database 'asset_management' created")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
