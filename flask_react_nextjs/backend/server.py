from flask import Flask, request
from flask_restful import Api, Resource

# from flask_cors import CORS, cross_origin

import sqlite3
import os
import numpy as np

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

def get_column_data(cursor, table_name, column):
    # select the data from the table
    cursor.execute(f"SELECT {column} FROM {table_name}")
    
    # Fetch all the rows of that result
    dd = cursor.fetchall()
    
    # return the data
    data = [d[0] for d in dd]
    return data



# RESTful api below
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
            if (cursor and data['table'] != ''):
                columns = get_available_columns(cursor, data['table'])
        return {"columns": columns}, 200
api.add_resource(setTable, '/api/setTable')

class setXColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        x1_data = []
        x2_data = []
        x_data = []
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            if (cursor and data['table'] != '' and data['x_column'] != ''):
                x1_data = get_column_data(cursor, data['table'], data['x_column'])
                x_data = x1_data
            if (cursor and data['table'] != '' and data['x2_column'] != '' and data['x2_column'] != 'None'):
                x2_data = get_column_data(cursor, data['table'], data['x2_column'])
                x_data = [None if (x1 is None or x2 is None) else x1 - x2 for (x1, x2) in zip(x1_data, x2_data)]
        return {"x_data": x_data}, 200
api.add_resource(setXColumn, '/api/setXColumn')

class setYColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        y_data = []
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            if (cursor and data['table'] != '' and data['y_column'] != ''):
                y_data = get_column_data(cursor, data['table'], data['y_column'])
        return {"y_data": y_data}, 200
api.add_resource(setYColumn, '/api/setYColumn')

# Running app
if __name__ == '__main__':
    app.run(debug = True, port = 5000)

