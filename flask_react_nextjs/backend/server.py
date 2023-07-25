from flask import Flask, request
from flask_restful import Api, Resource

# from flask_cors import CORS, cross_origin

import sqlite3
import os

# Initializing flask app
app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'
# RESTful API

api = Api(app)

# directory where all of the sqlite database files are stored (one per cluster)
data_dir = os.path.join(os.getcwd(), 'database')

def get_available_clusters():
    # get all the available clusters
    clusters = []
    contents = os.listdir(data_dir)
    for item in contents:
        if os.path.isfile(os.path.join(data_dir, item)) and '.db' in item:
            clusters.append(str.replace(item, '.db',''))

    return clusters

def get_available_tables(cursor):
    # get all the available tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tbls = cursor.fetchall()
    tables = [t[0] for t in tbls]
    return tables

def get_available_columns(cursor, table_name):
    # Execute the PRAGMA to get table information
    cursor.execute(f"PRAGMA table_info({table_name})")

    # Fetch all rows of the result
    table_info = cursor.fetchall()

    # Print the column names
    column_names = [row[1] for row in table_info]
    return column_names


# for the simple test below
# import time
import datetime
x = datetime.datetime.now()


# regular version
# @app.route("/api/data")
# def getData(): 
#     return {
#             'Name':"geek", 
#             "Age":"22",
#             "Date":x.strftime("%m/%d/%Y %H:%M:%S"),
#             "programming":"python"
#         }

# RESTful version
class getData(Resource):
    def get(self):
        # time.sleep(2) # to set the conditional that would say loading
        return {
                'Name':"geek", 
                "Age":"22",
                "Date":x.strftime("%m/%d/%Y %H:%M:%S"),
                "programming":"python"
            }
api.add_resource(getData, '/api/data')

class getAvailableClusters(Resource):
    def get(self):
        clusters = get_available_clusters()
        return {'clusters':clusters}
api.add_resource(getAvailableClusters, '/api/getAvailableClusters')

class setCluster(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        tables = []
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            if (cursor):
                tables = get_available_tables(cursor)
        return {"tables": tables}, 200
api.add_resource(setCluster, '/api/setCluster')

class setTable(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        columns = []
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            if (cursor):
                columns = get_available_columns(cursor, data['table'])
        return {"columns": columns}, 200
api.add_resource(setTable, '/api/setTable')

# Running app
if __name__ == '__main__':
    app.run(debug = True, port = 5000)

