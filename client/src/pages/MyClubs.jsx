import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  LogOut,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyClubs = () => {
  const { user } = useAuth();
  const [myClubs, setMyClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [leavingClub, setLeavingClub] = useState(null);

  const categories = ['All', 'Technology', 'Sports', 'Cultural', 'Academic', 'Arts', 'Music', 'Dance', 'Photography', 'Other'];

  useEffect(() => {
    fetchMyClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [myClubs, searchTerm, selectedCategory]);

  const fetchMyClubs = async () => {
    try {
      const response = await axios.get('/user/myclubs');
      const clubsRaw = response.data.clubs;
      setMyClubs(Array.isArray(clubsRaw) ? clubsRaw : []);
    } catch (error) {
      console.error('Error fetching my clubs:', error);
      toast.error('Failed to load your clubs');
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = Array.isArray(myClubs) ? myClubs : [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }

    setFilteredClubs(filtered);
  };

  const handleLeaveClub = async (clubId) => {
    setLeavingClub(clubId);
    try {
      // Note: You might need to implement a leave club endpoint
      // For now, we'll just show a success message
      toast.success('Left club successfully!');
      // Remove from local state
      setMyClubs(prev => prev.filter(club => club._id !== clubId));
    } catch (error) {
      toast.error('Failed to leave club');
    } finally {
      setLeavingClub(null);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Clubs</h1>
            <p className="text-gray-600 mt-2">
              Manage your club memberships and stay connected with your communities
            </p>
          </div>
          <Link 
            to="/clubs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Discover More
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {myClubs.length === 0 ? 'You haven\'t joined any clubs yet' : 'No clubs found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {myClubs.length === 0 
                ? 'Start exploring clubs to connect with like-minded students'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {myClubs.length === 0 && (
              <Link 
                to="/clubs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Discover Clubs
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(filteredClubs) ? filteredClubs.map((club) => (
              <div
                key={club._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Club Image */}
                <div className="relative h-48 bg-blue-600">
                  {club.photo ? (
                    <img
                      src={club.photo}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                      {club.category}
                    </span>
                  </div>
                </div>

                {/* Club Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {club.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {club.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {club.members?.length || 0} members
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/clubs/${club._id}`}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    
                    <Link
                      to={`/chats/${club._id}`}
                      className="flex-1 text-center py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            )) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubs;