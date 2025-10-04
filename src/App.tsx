import { useState, useRef } from 'react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const handleJoin = () => {
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {

      alert("connection is alredy there and open")
      return;
    }
    if (roomId.trim() === '') {
      alert('Please enter a room ID.');
      return;
    }
    const backendUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
    const socket = new WebSocket(backendUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      socket.send(JSON.stringify({
        type: 'join',
        payload: { roomId: roomId },
      }));
    };
    socket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data);
        if (receivedData.type === 'join-success') {
          setIsConnected(true);
          return;
        }
        if (receivedData.type === 'chat' && typeof receivedData.payload === 'string') {
          setChatLog(prevLog => [...prevLog, receivedData.payload]);
        }
      } catch (error) {
        console.error("Failed to parse incoming message:", error);
      }
    };
    socket.onclose = () => {
      console.log('WebSocket connection closed.');
      setIsConnected(false);
      setChatLog([]);
    };
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    socketRef.current = socket;
  };

  const handleSendMessage = () => {
    if (message.trim() !== '' && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        payload: {
          message: message,
        },
      }));
      setMessage('');
    }
  };
  const backgroundImageUrl = 'https://plus.unsplash.com/premium_photo-1670595337767-1af7ce73df5c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hhdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D'
  return (
    //image with main container
    <main
      className="h-screen bg-[#CDDDFB] font-sans flex items-center justify-center p-4 transition-all duration-500"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >

      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg w-full max-w-2xl border border-white/80">

        {!isConnected ? (
          //lobby me aa gye
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">
              Chat Room
            </h1>
            <p className="text-slate-500 mb-8">Enter a room name to join or create</p>
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g., 'project-alpha'"
                className="bg-white/70 border-2 border-slate-300 focus:border-indigo-500 text-slate-900 p-3 rounded-lg focus:ring-0 focus:outline-none w-full sm:w-auto flex-grow transition-all duration-300 mb-2 sm:mb-0 sm:mr-2"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                className="p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all duration-300 w-full sm:w-auto shadow-lg hover:shadow-indigo-500/50"
              >
                Join Room
              </button>
            </div>
          </div>
        ) : (
          //chat room
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center text-slate-700">
              Room: <span className="font-bold text-indigo-600">{roomId}</span>
            </h2>

            <div className="border border-slate-200 bg-white/40 h-80 overflow-y-auto p-4 mb-4 rounded-lg space-y-3">
              {chatLog.map((msg, index) => (
                <p key={index} className="bg-white/80 text-slate-700 rounded-xl p-3 break-words shadow-sm">
                  {msg}
                </p>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-white/70 border-2 border-slate-300 focus:border-indigo-500 text-slate-900 p-3 rounded-l-lg focus:ring-0 focus:outline-none flex-grow transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-indigo-600 text-white font-bold rounded-r-lg hover:bg-indigo-700 transition-all duration-300"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
