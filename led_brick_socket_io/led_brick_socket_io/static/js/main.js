angular.module('led_brick_socket_io', [])
	.controller('led_brick_ctrl', function($scope, $socketio) {
		$scope.name = 'Joe';
		console.log("We're in!");
		$socketio.on('sine', function(data) {
			console.log("GOT SINE DATA", data);
		});
		$socketio.emit('wpixel', {
									x:5,
									y:10,
									color: "#ffffff"
								}
		);
//		$socketio.emit('boo', 'blah');
	})	

	.factory('$socketio', function($rootScope) {
		var socket = io.connect('/led_brick');
		return {
			on: function(eventName, callback) {
				socket.on(eventName, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					})
				})
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					})
				})
			}
		}
	})


;