from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from datetime import datetime
from json import dumps


app = Flask(__name__) 
app.config['SECRET_KEY'] = 'BASE-9visualizer!'

async_mode = "eventlet" #"eventlet" is WAY better than "threading"
socketio = SocketIO(app, async_mode = async_mode)

namespace = '/base9'


# will fire when user connects
@socketio.on('connect', namespace = namespace)
def connect():
	print('======= socket connected', datetime.now());
	emit('socket_connected', {'date': datetime.now().strftime("%m/%d/%Y %H:%M:%S")}, namespace = namespace)


##############

#flask stuff   
@app.route("/")
def default(): 
    return render_template("index.html")
@app.route("/default")
def default1(): 
    return render_template("index.html")
@app.route("/index")
def default2(): 
    return render_template("index.html")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port = 5000, use_reloader = True)