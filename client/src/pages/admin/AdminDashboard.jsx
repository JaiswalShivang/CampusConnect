import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, MessageCircle, TrendingUp, Plus, Clock, Settings } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    pendingRequests: 0,
    upcomingEvents: 0
  });
  const [myClubs, setMyClubs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const clubsResponse = await axios.get('/club/all');
      const clubsRaw = clubsResponse.data.clubs;
      const allClubs = Array.isArray(clubsRaw) ? clubsRaw : [];
      const adminClubs = allClubs.filter(club => club.admin?._id === user?._id);
      const totalClubs = adminClubs.length;
      const totalMembers = adminClubs.reduce((sum, club) => sum + (club.members?.length || 0), 0);
      const pendingRequests = adminClubs.reduce((sum, club) => sum + (club.pendingRequests?.length || 0), 0);
      setStats({
        totalClubs,
        totalMembers,
        pendingRequests,
        upcomingEvents: 0
      });
      setMyClubs(adminClubs);
      const allPendingRequests = [];
      adminClubs.forEach(club => {
        if (club.pendingRequests && club.pendingRequests.length > 0) {
          club.pendingRequests.forEach(request => {
            allPendingRequests.push({
              ...request,
              clubName: club.name,
              clubId: club._id
            });
          });
        }
      });
      setPendingRequests(allPendingRequests.slice(0, 5));
    } catch (error) {
      setStats({ totalClubs: 0, totalMembers: 0, pendingRequests: 0, upcomingEvents: 0 });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage your clubs, events, and member requests</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Clubs</p>
                <p className="text-2xl font-bold text-gray-900">{myClubs.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myClubs.length === 0 ? (
              <Link to="/admin/create-club" className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Plus className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-gray-900">Create New Club</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                <Plus className="h-6 w-6" />
                <span className="font-medium">You can only create one club</span>
              </div>
            )}
            <Link to="/clubs" className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-medium text-gray-900">Manage Clubs</span>
            </Link>
            <Link to="/chats" className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <MessageCircle className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-gray-900">Club Chats</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Clubs</h2>
          {myClubs.length === 0 ? (
            <p className="text-gray-500">You have not created any clubs yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <div key={club._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col">
                  <div className="flex items-center mb-2">
                    <img src={club.photos?.[0] || 'https://via.placeholder.com/48'} alt={club.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{club.name}</h3>
                      <p className="text-sm text-gray-500">{club.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{club.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Link to={`/admin/edit-club/${club._id}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Edit Club</Link>
                    <Link to={`/admin/pending-requests/${club._id}`} className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 relative">
                      Pending Requests
                      {club.pendingRequests && club.pendingRequests.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{club.pendingRequests.length}</span>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;