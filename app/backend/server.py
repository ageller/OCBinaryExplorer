from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging

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

# Rate limiting — counts per worker process (9 workers → multiply by 9 for true max).
# For a global limit across all workers, add nginx rate limiting (see README or comments below).
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["120 per minute"],
    storage_uri="memory://",
)

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# directory where all of the sqlite database files are stored (one per cluster)
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')

def get_available_clusters():
    # get all the available clusters
    clusters = []
    contents = os.listdir(data_dir)
    for item in contents:
        if os.path.isfile(os.path.join(data_dir, item)) and '.db' in item:
            clusters.append(str.replace(item, '.db',''))

    # Sort the list alphabetically
    clusters.sort()

    # Create a new list with priority items first
    # priority_items = ["hdbscan_cluster_params", "cluster_summary"]
    # clusters_sorted = [item for item in priority_items if item in clusters] + \
    #                   [item for item in clusters if item not in priority_items]

    return clusters

def _get_db_path(cluster):
    """Return the real path to an existing cluster DB, or None if invalid."""
    # Normalize the same way the endpoints always did
    cluster = str.replace(cluster, ' ', '_')
    # Whitelist: only connect to clusters that already exist on disk
    if cluster not in get_available_clusters():
        return None
    data_dir_real = os.path.realpath(data_dir)
    db_path = os.path.realpath(os.path.join(data_dir_real, cluster + '.db'))
    # Prevent path traversal: resolved path must stay inside data_dir
    if not db_path.startswith(data_dir_real + os.sep):
        return None
    return db_path

def _qi(name):
    """Quote an SQL identifier with double-quotes (SQLite standard)."""
    return '"' + name.replace('"', '""') + '"'

def _validate_request(str_fields=(), dict_fields=()):
    """Check that request.json is present and each named field has the expected type.
    Returns (data, None) on success or (None, (error_dict, status)) on failure."""
    data = request.json
    if data is None:
        return None, ({"error": "request body must be JSON"}, 400)
    for f in str_fields:
        if f not in data:
            return None, ({"error": f"missing field: {f}"}, 400)
        if not isinstance(data[f], str):
            return None, ({"error": f"field must be a string: {f}"}, 400)
    for f in dict_fields:
        if f not in data:
            return None, ({"error": f"missing field: {f}"}, 400)
        if not isinstance(data[f], dict):
            return None, ({"error": f"field must be an object: {f}"}, 400)
    return data, None

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
    # Validate table_name against the actual tables in this DB before using it
    if table_name not in get_available_tables(cursor):
        return []
    cursor.execute(f"PRAGMA table_info({_qi(table_name)})")
    table_info = cursor.fetchall()
    column_names = [row[1] for row in table_info]
    return column_names

def get_column_data(cursor, table_name, column):
    # Validate column against the actual columns in this table before using it
    if column not in get_available_columns(cursor, table_name):
        return []
    cursor.execute(f"SELECT {_qi(column)} FROM {_qi(table_name)}")
    dd = cursor.fetchall()
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
        data, err = _validate_request(str_fields=('cluster',))
        if err: return err
        tables = []
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            tables = get_available_tables(conn.cursor())
        return {"tables": tables}, 200
api.add_resource(setCluster, '/ocbexapi/setCluster')

class setTable(Resource):
    # set the database and return the available tables
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table'))
        if err: return err
        columns = []
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            if data['table'] != '':
                columns = get_available_columns(conn.cursor(), data['table'])
        return {"columns": columns}, 200
api.add_resource(setTable, '/ocbexapi/setTable')

class setXColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table', 'x_column', 'x2_column'))
        if err: return err
        x1_data = []
        x2_data = []
        x_data = []
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            if data['table'] != '' and data['x_column'] != '':
                x1_data = get_column_data(cursor, data['table'], data['x_column'])
                x_data = x1_data
            if data['table'] != '' and data['x2_column'] != '' and data['x2_column'] != 'None':
                x2_data = get_column_data(cursor, data['table'], data['x2_column'])
                x_data = [None if (x1 is None or x2 is None) else x1 - x2 for (x1, x2) in zip(x1_data, x2_data)]
        return {"x_data": x_data}, 200
api.add_resource(setXColumn, '/ocbexapi/setXColumn')

class setYColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table', 'y_column'))
        if err: return err
        y_data = []
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            if data['table'] != '' and data['y_column'] != '':
                y_data = get_column_data(conn.cursor(), data['table'], data['y_column'])
        return {"y_data": y_data}, 200
api.add_resource(setYColumn, '/ocbexapi/setYColumn')

class setColorColumn(Resource):
    # set the database and return the available tables
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table', 'color_column'))
        if err: return err
        color_data = []
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            if data['table'] != '' and data['color_column'] != '':
                color_data = get_column_data(conn.cursor(), data['table'], data['color_column'])
        return {"color_data": color_data}, 200
api.add_resource(setColorColumn, '/ocbexapi/setColorColumn')

class setTableData(Resource):
    decorators = [limiter.limit("60 per minute")]
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table'), dict_fields=('table_columns',))
        if err: return err
        table_data_df = pd.DataFrame()
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            table_columns_use = [key for key, value in data['table_columns'].items() if value]
            if data['table'] != '' and len(table_columns_use) > 0:
                for c in table_columns_use:
                    try:
                        col_data = get_column_data(cursor, data['table'], c)
                        table_data_df[c] = col_data
                    except Exception as e:
                        logging.warning("setTableData: error fetching column %r: %s", c, e)
        table_data_df.fillna('', inplace=True)
        return {"table_data": table_data_df.to_dict(orient = 'records')}, 200
api.add_resource(setTableData, '/ocbexapi/setTableData')

class myPygwalker(Resource):
    decorators = [limiter.limit("30 per minute")]
    # I created a plot that had configs I liked, and copied that config line below
    # note that this requires pygwalker version 0.4.9.11
    def post(self):
        data, err = _validate_request(str_fields=('cluster', 'table'), dict_fields=('table_columns',))
        if err: return err
        pyg_html_str = "Attempting to create PyGwalker instance..."
        if data['cluster'] != '':
            db_path = _get_db_path(data['cluster'])
            if db_path is None:
                return {"error": "invalid cluster"}, 400
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            table_columns_use = [key for key, value in data['table_columns'].items() if value]
            if data['table'] != '' and len(table_columns_use) > 0:
                table_data_df = pd.DataFrame()
                for c in table_columns_use:
                    try:
                        col_data = get_column_data(cursor, data['table'], c)
                        table_data_df[c] = col_data
                    except Exception as e:
                        logging.warning("myPygwalker: error fetching column %r: %s", c, e)
                if len(table_data_df) > 0:
                    pyg_html_str = pyg.to_html(table_data_df, appearance = 'light',
                        spec = r"""{"config":[{"config":{"defaultAggregated":false,"geoms":["tick"],"coordSystem":"generic","limit":-1},"encodings":{"dimensions":[{"fid":"stage","name":"stage","semanticType":"quantitative","analyticType":"dimension","offset":0}],"measures":[{"fid":"gw_count_fid","name":"Row count","analyticType":"measure","semanticType":"quantitative","aggName":"sum","computed":true,"expression":{"op":"one","params":[],"as":"gw_count_fid"}}],"rows":[],"columns":[],"color":[],"opacity":[],"size":[],"shape":[],"radius":[],"theta":[],"longitude":[],"latitude":[],"geoId":[],"details":[],"filters":[],"text":[]},"layout":{"showActions":false,"showTableSummary":false,"stack":"none","interactiveScale":false,"zeroScale":false,"size":{"mode":"auto","width":320,"height":200},"format":{},"geoKey":"name","resolve":{"x":false,"y":false,"color":false,"opacity":false,"shape":false,"size":false},"scaleIncludeUnmatchedChoropleth":false,"showAllGeoshapeInChoropleth":false,"colorPalette":"","useSvg":false,"scale":{"opacity":{},"size":{}}},"visId":"f59bfc375cfee","name":"Chart 1"}],"chart_map":{},"workflow_list":[{"workflow":[{"type":"view","query":[{"op":"raw","fields":[]}]}]}],"version":"0.4.9.11"}"""
                    )
        return {"pyg_html_str": pyg_html_str}, 200
api.add_resource(myPygwalker, '/ocbexapi/myPygwalker')

# Running app
if __name__ == '__main__':
    app.run(debug = False, port = 5000)


