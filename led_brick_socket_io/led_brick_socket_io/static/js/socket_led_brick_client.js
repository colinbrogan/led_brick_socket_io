$(document).ready(function() {
	var socket = io.connect("/led_brick");
	socket.emit("wpixel",{x: 10, y: 10, color: '#eaeaea' })
	console.log("here");
	socket.on('sine', function(data) {
		console.log(data);
	});
});