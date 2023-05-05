from flask import Flask
from flask_restful import Api, Resource

# from flask_cors import CORS, cross_origin



# Initializing flask app
app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'
# RESTful API

api = Api(app)


# for the simple test below
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
        return {
                'Name':"geek", 
                "Age":"22",
                "Date":x.strftime("%m/%d/%Y %H:%M:%S"),
                "programming":"python"
            }
api.add_resource(getData, '/api/data')


# Running app
if __name__ == '__main__':
    app.run(debug = True, port = 5000)

