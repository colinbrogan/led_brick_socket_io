from pyramid.view import view_config

# Start LED_BRICK communication

from time import time, sleep
from math import sin, pi
from PIL import Image, ImageDraw
from colorsys import hsv_to_rgb
import os


# if os.access("/dev/spidev1.0", os.R_OK|os.W_OK):
#	from LedMatrix_ws2803 import LedMatrix
# from LedMatrix_n5110 import LedMatrix
# else:
from LedMatrix_pygame import LedMatrix
#from LedMatrix_ascii import LedMatrix


SIZE = (29, 6)

lm = None

frame = None

# End LED_BRICK communication

from socketio.namespace import BaseNamespace
class LEDBrickNamespace(BaseNamespace):
	def initialize(self):
		global lm
		lm = LedMatrix(SIZE)
		global frame
		frame = Image.new('RGB', SIZE, (0,0,0))
		lm.put(frame)
		print "INIT"
	def on_wpixel(self, data):
		global frame
		print "Writing Pixels ", data
		if len(data['color']) > 7 or data['color'][0] != "#":
			print "Error: needs hexcode"
			return False
		r, g, b = int(data['color'][1:3],16), int(data['color'][3:5],16), int(data['color'][5:], 16)
		color = (r,g,b)
		x = data['x']
		y = data['y']
		if x < SIZE[0] and y < SIZE[1]:
			frame.putpixel((int(x), int(y)), color)
	def on_fbegin(self, data):
		global frame
		frame = Image.new('RGB', SIZE, (255,255,255))
		print "fbegin", data
	def on_fend(self, data):
		global lm
		lm.put(frame)
		print "fend", data

@view_config(route_name="socketio")
def socketio(request):
	print "SOMETHING"
	from socketio import socketio_manage
	socketio_manage(request.environ, {"/led_brick": LEDBrickNamespace},
					request=request)
#	return {'project': 'led_brick_socket_io'}


@view_config(route_name='home', renderer='templates/mytemplate.pt')
def my_view(request):
    return {'project': 'led_brick_socket_io'}


@view_config(route_name='hello', renderer='templates/mytemplate.pt')
def hello(request):
	return {'project': 'led_brick_socket_io'}


@view_config(route_name="angular", renderer='templates/angular.pt')
def angular(request):
	return {'project': 'led_brick_socket_io'}