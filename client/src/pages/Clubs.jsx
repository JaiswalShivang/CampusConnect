import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Users, 
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Clubs = () => {
  const { user, isStudent } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [joiningClub, setJoiningClub] = useState(null);

  const categories = ['All', 'Technology', 'Sports', 'Cultural', 'Academic', 'Arts', 'Music', 'Dance', 'Photography', 'Other'];

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm, selectedCategory]);

  const fetchClubs = async () => {
    try {
      const response = await axios.get('/club/all');
      const clubsRaw = response.data.clubs;
      setClubs(Array.isArray(clubsRaw) ? clubsRaw : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = Array.isArray(clubs) ? clubs : [];

    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }

    setFilteredClubs(filtered);
  };

  const handleJoinClub = async (clubId) => {
    if (!clubId) {
      toast.error('Invalid club ID');
      return;
    }
    if (!user || !user._id) {
      toast.error('You must be logged in to join a club.');
      return;
    }
    if (!isStudent) {
      toast.error('Only students can join clubs.');
      return;
    }
    if (isUserMember({ members: clubs.find(c => c._id === clubId)?.members || [] })) {
      toast.error('You are already a member of this club.');
      return;
    }
    if (isUserPending({ pendingRequests: clubs.find(c => c._id === clubId)?.pendingRequests || [] })) {
      toast.error('Join request already sent.');
      return;
    }
    setJoiningClub(clubId);
    try {
      console.debug('Join club debug:', { clubId, user, isStudent });
      const response = await axios.post('/club/join', { clubId });
      console.debug('Join response:', response.data);
      toast.success('Join request sent successfully!');

      fetchClubs();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      console.error('Join request error:', error, 'Backend message:', backendMessage);
      if (backendMessage === 'Join request already sent') {
        toast.success('Join request sent successfully!');
      } else {
        const message = backendMessage || 'Failed to send join request';
        toast.error(message);
      }
    } finally {
      setJoiningClub(null);
    }
  };

  const isUserMember = (club) => {
    return club.members?.some(member => member._id === user?._id);
  };

  const isUserPending = (club) => {
    return club.pendingRequests?.some(request => request._id === user?._id);
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
      
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Clubs</h1>
            <p className="text-gray-600 mt-2">
              Join clubs that match your interests and connect with like-minded students
            </p>
          </div>
          <Link 
            to="/my-clubs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Users className="h-4 w-4 mr-2" />
            My Clubs
          </Link>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
          <div className="mt-4 text-sm text-gray-600">
            {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filteredClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clubs found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No clubs are available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(filteredClubs) ? filteredClubs.map((club) => (
              <div
                key={club._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
        
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
                    
                    {isUserMember(club) ? (
                      <span className="flex-1 text-center py-2 px-4 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        Member
                      </span>
                    ) : isUserPending(club) ? (
                      <span className="flex-1 text-center py-2 px-4 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinClub(club._id)}
                        disabled={joiningClub === club._id || isUserMember(club) || isUserPending(club) || !isStudent}
                        title={
                          !isStudent ? 'Only students can join clubs.' :
                          isUserMember(club) ? 'You are already a member' :
                          isUserPending(club) ? 'Join request pending' : ''
                        }
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {joiningClub === club._id ? 'Joining...' : 'Join Club'}
                      </button>
                    )}
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

export default Clubs;
