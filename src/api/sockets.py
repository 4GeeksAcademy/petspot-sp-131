from flask_socketio import emit, join_room, leave_room
from ..app import socketio

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join')
def handle_join(data):
    """
    Data should contain:
    - id: user_id or place_id
    - type: 'user' or 'place'
    """
    room = f"{data['type']}_{data['id']}"
    join_room(room)
    print(f"Client joined room: {room}")
    emit('joined', {'status': 'success', 'room': room})

@socketio.on('leave')
def handle_leave(data):
    room = f"{data['type']}_{data['id']}"
    leave_room(room)
    print(f"Client left room: {room}")
