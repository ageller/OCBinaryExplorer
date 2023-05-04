function connectSocket(){
	document.addEventListener("DOMContentLoaded", function(event) { 
		params.socketio.socket.on('socket_connected', function(msg) {
			console.log('socket connected', msg);
		});

	});
}

defineParams();
connectSocket();