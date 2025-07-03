import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Plus
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    upcomingEvents: 0
  });
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userClubs, setUserClubs] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clubs
      const clubsResponse = await axios.get('/club/all');
      const clubsRaw = clubsResponse.data.clubs;
      const clubs = Array.isArray(clubsRaw) ? clubsRaw : [];
      // Get clubs where user is a member
      const myClubs = clubs.filter(club => club.members?.some(m => m._id === user._id));
      setUserClubs(myClubs);
      // Aggregate events and announcements
      let allEvents = [];
      let allAnnouncements = [];
      myClubs.forEach(club => {
        if (Array.isArray(club.events)) {
          club.events.forEach(event => allEvents.push({ ...event, clubName: club.name, clubId: club._id, clubPhoto: club.photos?.[0] }));
        }
        if (Array.isArray(club.announcement)) {
          club.announcement.forEach(ann => allAnnouncements.push({ ...ann, clubName: club.name, clubId: club._id, clubPhoto: club.photos?.[0] }));
        }
      });
      // Sort events by date (upcoming first)
      allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Sort announcements by createdAt (latest first)
      allAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUserEvents(allEvents);
      setUserAnnouncements(allAnnouncements);
      // Calculate stats
      const totalClubs = clubs.length;
      const totalMembers = clubs.reduce((sum, club) => sum + (club.members?.length || 0), 0);
      setStats({
        totalClubs,
        totalMembers,
        upcomingEvents: allEvents.length
      });
      // Get recent clubs (limit to 6)
      setRecentClubs(clubs.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-blue-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4">
            <img
              src={user?.photo || 'https://via.placeholder.com/80'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20 mx-auto sm:mx-0"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                {isAdmin ? 'Manage your clubs and connect with students' : 'Discover clubs and stay updated with campus activities'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/clubs"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-gray-900">Browse Clubs</span>
            </Link>
            <Link
              to="/chats"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span className="font-medium text-gray-900">Join Chats</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin/create-club"
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-purple-600" />
                <span className="font-medium text-gray-900">Create Club</span>
              </Link>
            )}
          </div>
        </div>

        {/* Your Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Upcoming Events</h2>
          {userEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {userEvents.map(event => (
                <Link key={event._id} to={`/clubs/${event.clubId}`} className="block">
                  <div className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 shadow-sm border border-blue-100 transition flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <img src={event.clubPhoto || 'https://via.placeholder.com/40'} alt={event.clubName} className="w-10 h-10 rounded-lg object-cover mr-3" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-blue-900 truncate">{event.name}</h4>
                        <p className="text-xs text-blue-700 truncate">{event.clubName}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">{event.description}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-auto">
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{event.category}</span>
                      <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" />{new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" />{event.venue}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming events in your clubs</p>
            </div>
          )}
        </div>

        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Announcements</h2>
          {userAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {userAnnouncements.map(ann => (
                <Link key={ann._id} to={`/clubs/${ann.clubId}`} className="block">
                  <div className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 shadow-sm border border-yellow-100 transition flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <img src={ann.clubPhoto || 'https://via.placeholder.com/40'} alt={ann.clubName} className="w-10 h-10 rounded-lg object-cover mr-3" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-yellow-900 truncate">{ann.title}</h4>
                        <p className="text-xs text-yellow-700 truncate">{ann.clubName}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">{ann.content}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-auto">
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Announcement</span>
                      <span className="flex items-center space-x-1">{new Date(ann.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No announcements in your clubs</p>
            </div>
          )}
        </div>

        {/* Recent Clubs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Clubs</h2>
            <Link
              to="/clubs"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all clubs
            </Link>
          </div>
          {recentClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {recentClubs.map((club) => (
                <Link
                  key={club._id}
                  to={`/clubs/${club._id}`}
                  className="block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50 md:bg-white mb-2 md:mb-0"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={club.photos?.[0] || 'https://via.placeholder.com/48'}
                      alt={club.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{club.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{club.members?.length || 0} members</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No clubs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
