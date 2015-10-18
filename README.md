# led_brick_socket_io

For playing a tetris game on the RMM LEDMatrix screen.

Dependencies:
```
sudo apt-get install libevent-dev
pip install pyramid gevent gevent-socketio gevent-subprocess
pip install pyramid_socketio
```

Setup:
```
. env/bin/activate
python setup.py develop
```


Commands to start it running:
```cd led_brick_socket_io```
```pserve --reload development.ini```
