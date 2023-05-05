from flask import Flask
# from flask_cors import CORS, cross_origin



# Initializing flask app
app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'

# for the simple test below
import datetime
x = datetime.datetime.now()

@app.route("/api/data")
def getData(): 
    return {
            'Name':"geek", 
            "Age":"22",
            "Date":x.strftime("%m/%d/%Y %H:%M:%S"),
            "programming":"python"
        }

      
# Running app
if __name__ == '__main__':
    app.run(debug = True, port = 5000)

