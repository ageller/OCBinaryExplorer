//all "global" variables are contained within params object
var params;

function defineParams(){
	params = new function() {

		this.socketio = new function() {
			//flask + socketio
			this.namespace = '/base9';
			
			// Connect to the Socket.IO server.
			// The connection URL has the following format:
			//     http[s]://<domain>:<port>[/<namespace>]
			this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + this.namespace);
		}
	}
}
