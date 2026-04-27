from flask_socketio import emit, join_room, leave_room

def setup_sockets(socketio):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('join')
    def handle_join(data):
        if not data or 'type' not in data or 'id' not in data:
            print("Invalid join data received")
            return
            
        room = f"{data['type']}_{data['id']}"
        join_room(room)
        print(f"Client joined room: {room}")
        emit('joined', {'status': 'success', 'room': room})

    @socketio.on('leave')
    def handle_leave(data):
        if not data or 'type' not in data or 'id' not in data:
            return
            
        room = f"{data['type']}_{data['id']}"
        leave_room(room)
        print(f"Client left room: {room}")
