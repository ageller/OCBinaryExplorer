from flask import Flask, request, jsonify
from flask_restful import Api, Resource

# from flask_cors import CORS, cross_origin

import sqlite3
import os
import pandas as pd
import numpy as np
import pygwalker as pyg

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
    # sort this so that the files with "posterior_for_id_" come last
    first = []
    last = []
    for t in tables:
        if ("posterior_for_id_" in t):
            last.append(t)
        else:
            first.append(t)
            
    return first + last

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
api.add_resource(getAvailableClusters, '/ocbexapi/getAvailableClusters')

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
api.add_resource(setCluster, '/ocbexapi/setCluster')

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
api.add_resource(setTable, '/ocbexapi/setTable')

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
api.add_resource(setXColumn, '/ocbexapi/setXColumn')

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
api.add_resource(setYColumn, '/ocbexapi/setYColumn')

class setColorColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        color_data = []
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            if (cursor and data['table'] != '' and data['color_column'] != ''):
                color_data = get_column_data(cursor, data['table'], data['color_column'])
        return {"color_data": color_data}, 200
api.add_resource(setColorColumn, '/ocbexapi/setColorColumn')

class setTableData(Resource):
    # set the database and return the available tables
    def post(self):
        data = request.json
        table_data_df = pd.DataFrame()
        if (data['cluster'] != ''):
            conn = sqlite3.connect(os.path.join(data_dir, str.replace(data['cluster'],' ','_') + '.db'))
            cursor = conn.cursor()
            table_columns_use = []
            for key, value in data['table_columns'].items():
                if (value):
                    table_columns_use.append(key)
            if (cursor and data['table'] != '' and len(table_columns_use) > 0):
                for c in table_columns_use:
                    try:
                        col_data = get_column_data(cursor, data['table'], c)
                        table_data_df[c] = col_data
                    except:
                        pass
        table_data_df.fillna('', inplace=True)
        return {"table_data": table_data_df.to_dict(orient = 'records')}, 200
api.add_resource(setTableData, '/ocbexapi/setTableData')

class myPygwalker(Resource):
    # create the pyGwalker data explorer
    # I created a plot that had configs I liked, and copied that config line below
    def post(self):
        data = request.json
        pyg_html_str = "Error creating PyGwalker instance"
        if (len(data['table_data']) > 0):
            df = pd.DataFrame(data['table_data'])  
            pyg_html_str = pyg.to_html(df, appearance = 'light', 
                spec = r"""{"config":[{"config":{"defaultAggregated":false,"geoms":["tick"],"coordSystem":"generic","limit":-1},"encodings":{"dimensions":[{"fid":"stage","name":"stage","semanticType":"quantitative","analyticType":"dimension","offset":0}],"measures":[{"fid":"iteration","name":"iteration","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"logAge","name":"logAge","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"FeH","name":"FeH","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"modulus","name":"modulus","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"absorption","name":"absorption","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"logPost","name":"logPost","semanticType":"quantitative","analyticType":"measure","offset":0},{"fid":"gw_count_fid","name":"Row count","analyticType":"measure","semanticType":"quantitative","aggName":"sum","computed":true,"expression":{"op":"one","params":[],"as":"gw_count_fid"}}],"rows":[],"columns":[],"color":[],"opacity":[],"size":[],"shape":[],"radius":[],"theta":[],"longitude":[],"latitude":[],"geoId":[],"details":[],"filters":[],"text":[]},"layout":{"showActions":false,"showTableSummary":false,"stack":"none","interactiveScale":false,"zeroScale":false,"size":{"mode":"auto","width":320,"height":200},"format":{},"geoKey":"name","resolve":{"x":false,"y":false,"color":false,"opacity":false,"shape":false,"size":false},"scaleIncludeUnmatchedChoropleth":false,"showAllGeoshapeInChoropleth":false,"colorPalette":"","useSvg":false,"scale":{"opacity":{},"size":{}}},"visId":"f59bfc375cfee","name":"Chart 1"}],"chart_map":{},"workflow_list":[{"workflow":[{"type":"view","query":[{"op":"raw","fields":[]}]}]}],"version":"0.4.9.11"}"""
            )
        return {"pyg_html_str": pyg_html_str}, 200
api.add_resource(myPygwalker, '/ocbexapi/myPygwalker')

# Running app
if __name__ == '__main__':
    app.run(debug = True, port = 5000)


