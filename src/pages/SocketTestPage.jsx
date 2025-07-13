import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components';
import { 
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const SocketTestPage = () => {
  const { socket, isConnected, onlineUsers, joinRoom } = useSocket();
  const { user } = useAuth();
  const [testMessages, setTestMessages] = useState([]);
  const [testRoom, setTestRoom] = useState('test-room-1');

  useEffect(() => {
    if (socket) {
      // Listen for backend events
      socket.on('welcome', (data) => {
        addTestMessage('Welcome received', data);
      });

      socket.on('connection_confirmed', (data) => {
        addTestMessage('Connection confirmed', data);
      });

      socket.on('room_joined', (data) => {
        addTestMessage('Room joined', data);
      });

      return () => {
        socket.off('welcome');
        socket.off('connection_confirmed');
        socket.off('room_joined');
      };
    }
  }, [socket]);

  const addTestMessage = (event, data) => {
    const message = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event,
      data: JSON.stringify(data, null, 2)
    };
    setTestMessages(prev => [...prev.slice(-9), message]); // Keep only last 10 messages
  };

  const handleTestConnection = () => {
    if (socket) {
      socket.emit('test_connection');
      addTestMessage('Test connection sent', { user: user?.firstName });
    }
  };

  const handleJoinRoom = () => {
    if (socket && testRoom) {
      socket.emit('join_room', testRoom);
      addTestMessage('Join room requested', { room: testRoom });
    }
  };

  const handleLeaveRoom = () => {
    if (socket && testRoom) {
      socket.emit('leave_room', testRoom);
      addTestMessage('Leave room requested', { room: testRoom });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Socket.IO Test Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Test real-time connectivity and events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connection Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                )}
                <span className={`font-medium ${isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Online Users: {onlineUsers.length}
                </span>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={!isConnected}
                  className="w-full"
                >
                  <WifiIcon className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </div>
          </Card>

          {/* Room Management */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Room Management
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Room ID
                </label>
                <input
                  type="text"
                  value={testRoom}
                  onChange={(e) => setTestRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter room ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleJoinRoom}
                  disabled={!isConnected || !testRoom}
                  variant="outline"
                  className="w-full"
                >
                  Join Room
                </Button>
                <Button
                  onClick={handleLeaveRoom}
                  disabled={!isConnected || !testRoom}
                  variant="outline"
                  className="w-full"
                >
                  Leave Room
                </Button>
              </div>
            </div>
          </Card>

          {/* Event Log */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Real-time Event Log
            </h2>
            
            <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
              {testMessages.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No events yet. Test the connection to see real-time events.
                </div>
              ) : (
                <div className="space-y-2">
                  {testMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="text-green-400 font-mono">
                        [{message.timestamp}] {message.event}
                      </div>
                      <pre className="text-gray-300 text-xs mt-1 ml-4 overflow-x-auto">
                        {message.data}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setTestMessages([])}
                variant="outline"
                size="sm"
              >
                Clear Log
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => window.open('/chat/demo-conversation', '_blank')}
                className="w-full"
              >
                Open Chat Demo
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
              
              <Button
                onClick={() => window.open('http://localhost:4000', '_blank')}
                variant="outline"
                className="w-full"
              >
                Backend Status
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocketTestPage;
