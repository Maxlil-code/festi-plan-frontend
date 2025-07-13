import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import { Button, Card, Spinner } from '../components';
import { 
  PaperAirplaneIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

const ChatPage = () => {
  const { conversationId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversationData();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (socket && conversationId) {
      // Join conversation room using backend event
      socket.emit('join_room', `conversation_${conversationId}`);

      // Listen for room join confirmation
      socket.on('room_joined', (data) => {
        console.log('Joined chat room:', data);
      });

      // Listen for new messages (when backend implements chat events)
      socket.on('message:new', handleNewMessage);
      
      // Listen for typing indicators (when backend implements)
      socket.on('typing:start', handleTypingStart);
      socket.on('typing:stop', handleTypingStop);

      // Mark messages as read when conversation is viewed
      socket.emit('messages:read', conversationId);

      return () => {
        // Leave room and cleanup
        socket.emit('leave_room', `conversation_${conversationId}`);
        socket.off('room_joined');
        socket.off('message:new');
        socket.off('typing:start');
        socket.off('typing:stop');
      };
    }
  }, [socket, conversationId]);

  const fetchConversationData = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getConversationMessages(conversationId);
      setConversation(response.conversation);
      setMessages(response.messages || []);
    } catch (error) {
      setError('Failed to load conversation');
      console.error('Error fetching conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversationId === conversationId) {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if the message is not from current user
      if (message.senderId !== user.id && socket) {
        socket.emit('message:read', message.id);
      }
    }
  };

  const handleTypingStart = ({ userId, userName }) => {
    if (userId !== user.id) {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === userId);
        if (!existing) {
          return [...prev, { userId, userName }];
        }
        return prev;
      });
    }
  };

  const handleTypingStop = ({ userId }) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await messageService.sendMessage(conversationId, {
        content: messageText,
        type: 'text',
      });

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('message:send', {
          conversationId,
          content: messageText,
          type: 'text',
        });
        
        // Stop typing indicator
        socket.emit('typing:stop', { conversationId });
      }

    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Emit typing start
    if (socket && !isTyping) {
      socket.emit('typing:start', { conversationId });
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing:stop', { conversationId });
      }
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, prevMessage) => {
    if (!prevMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(prevMessage.createdAt).toDateString();
    
    return currentDate !== prevDate;
  };

  const getOtherParticipant = () => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p.id !== user.id);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conversation Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button as={Link} to="/chat">
            Back to Conversations
          </Button>
        </Card>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              as={Link}
              to="/chat"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {otherParticipant?.firstName} {otherParticipant?.lastName}
                </h1>
                <p className="text-sm text-gray-500 capitalize">
                  {otherParticipant?.role}
                </p>
              </div>
            </div>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId === user.id;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              )}

              {/* Message */}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs ml-2">
                  {typingUsers[0].userName} is typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-primary-500 focus:border-primary-500"
              disabled={isSending}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="rounded-full p-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
