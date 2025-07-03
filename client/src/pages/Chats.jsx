import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { 
  Send, 
  Users, 
  ArrowLeft,
  MessageCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

const Chats = () => {
  const { clubId } = useParams();
  const { user, isAdmin, isStudent } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [club, setClub] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [adminClubCheck, setAdminClubCheck] = useState(isAdmin);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && !clubId) {
      setAdminClubCheck(true);
      axios.get('/club/all').then(response => {
        const clubsRaw = response.data.clubs;
        const adminClubs = Array.isArray(clubsRaw) ? clubsRaw.filter(club => club.admin?._id === user?._id) : [];
        setUserClubs(adminClubs);
        if (adminClubs.length === 1) {
          navigate(`/chats/${adminClubs[0]._id}`);
        }
      }).catch(() => {
        setUserClubs([]);
      }).finally(() => {
        setAdminClubCheck(false);
      });
    }
  }, [isAdmin, clubId, user?._id, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminClub();
    } else {
      fetchUserClubs();
    }
    if (clubId) {
      fetchClubDetails();
      fetchMessages();
    }
  }, [clubId, isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (clubId && user?._id && club) {
      // Connect to socket and join club room
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      }
      socketRef.current.emit('join', {
        userId: user._id,
        username: user.name,
        clubId,
      });
      socketRef.current.on('receive', (data) => {
        setMessages((prev) => [
          ...prev,
          {
            _id: data._id || Date.now().toString() + Math.random(),
            content: data.message,
            sender: {
              name: data.username,
              photo: data.photo || defaultUserImg,
              _id: data.userId, // Ensure sender._id is present for alignment
            },
            timestamp: data.timestamp || new Date(),
          },
        ]);
      });
      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, [clubId, user?._id, club]);

  const fetchUserClubs = async () => {
    try {
      const response = await axios.get('/user/myclubs');
      const clubsRaw = response.data.clubs;
      setUserClubs(Array.isArray(clubsRaw) ? clubsRaw : []);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  const fetchAdminClub = async () => {
    try {
      const response = await axios.get('/club/all');
      const clubsRaw = response.data.clubs;
      const adminClubs = Array.isArray(clubsRaw) ? clubsRaw.filter(club => club.admin?._id === user?._id) : [];
      setUserClubs(adminClubs);
      // If admin has a club and is not on a club chat, auto-navigate to its chat
      if (adminClubs.length === 1 && !clubId) {
        // Instead of window.location.replace, use navigate to allow React Router to render the chat
        navigate(`/chats/${adminClubs[0]._id}`);
      }
    } catch (error) {
      console.error('Error fetching admin club:', error);
    }
  };

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get('/club/all');
      const clubsRaw = response.data.clubs;
      const clubData = clubsRaw.find(c => c._id === clubId);
      setClub(clubData);
    } catch (error) {
      console.error('Error fetching club details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/messages/${clubId}`);
      const messagesRaw = response.data.messages || [];
      setMessages(messagesRaw.map(msg => ({
        _id: msg._id,
        content: msg.content,
        sender: { name: msg.sender?.name || 'Unknown', photo: msg.sender?.photo || undefined, _id: msg.sender?._id },
        timestamp: msg.timestamp,
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    setSending(true);
    try {
      socketRef.current.emit('chat', { message: newMessage });
      // Do NOT optimistically add the message here; wait for socket receive
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isUserMember = (club) => {
    // Allow access if user is a member OR is the admin of the club
    return club?.members?.some(member => member._id === user?._id) || club?.admin?._id === user?._id;
  };

  if (!clubId) {
    if (isAdmin) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chats</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {userClubs.length === 0
                  ? 'You have not created a club yet.'
                  : 'Select your club to start chatting.'}
              </p>
            </div>
          </div>
          {userClubs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No club to chat in
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a club to start chatting with members
              </p>
              <Link to="/admin/create-club">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Create Club
                </Button>
              </Link>
            </div>
          )}
        </div>
      );
    }
    // For students, show club selection
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chats</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select a club to start chatting with members
            </p>
          </div>
        </div>
        {userClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clubs to chat in
            </h3>
            <p className="text-gray-600 mb-6">
              Join some clubs to start chatting with members
            </p>
            <Link to="/clubs">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Discover Clubs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {(Array.isArray(userClubs) ? userClubs : []).map((club) => (
              <div
                key={club._id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Club Image */}
                <div className="relative h-32 sm:h-40 bg-blue-100 flex items-center justify-center">
                  {club.photos?.[0] ? (
                    <img
                      src={club.photos[0]}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="h-16 w-16 text-blue-400" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow">
                      {club.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      {club.name}
                    </h3>
                    <span className="text-xs text-gray-500">{club.members?.length || 0} members</span>
                  </div>
                  <Button onClick={() => navigate(`/chats/${club._id}`)} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isAdmin && !clubId && adminClubCheck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Club not found
        </h2>
        <Link to="/chats">
          <Button>Back to Chats</Button>
        </Link>
      </div>
    );
  }

  if (!isUserMember(club)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to be a member or admin of this club to access the chat
        </p>
        <Link to={`/clubs/${clubId}`}>
          <Button>View Club</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <Link to="/chats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <img
            src={club.photos?.[0] || 'https://via.placeholder.com/40'}
            alt={club.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {club.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {club.members?.length || 0} members online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.sender._id === user._id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <img
                    src={message.sender.photo || defaultUserImg}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className={`${message.sender._id === user._id ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender._id === user._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <Button
            type="submit"
            loading={sending}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chats;
