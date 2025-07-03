import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const PendingRequests = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [clubId]);

  const fetchData = async () => {
    try {
     
      const clubsResponse = await axios.get('/club/all');
      const clubsRaw = clubsResponse.data.clubs;
      const clubData = clubsRaw.find(c => c._id === clubId);
      setClub(clubData);

      const requestsResponse = await axios.get(`/club/pending/${clubId}`);
      setPendingRequests(requestsResponse.data.pendingRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post('/club/approve', { clubId, studentId: userId });
      toast.success('Request approved successfully!');
      fetchData(); 
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (userId) => {
    if (!clubId || !userId) {
      toast.error('Invalid club or user ID');
      return;
    }
    try {
      await axios.post('/club/reject', { clubId, studentId: userId });
      toast.success('Request rejected successfully!');
      fetchData(); 
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject request';
      toast.error(message);
    }
  };

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
        <Link to="/admin">
          <Button>Back to Admin</Button>
        </Link>
      </div>
    );
  }


  if (club.admin?._id !== user?._id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You are not the admin of this club and cannot view or manage its pending requests.
        </p>
        <Link to="/admin">
          <Button>Back to Admin</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
    
      <div className="flex items-center space-x-4 mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow">Pending Requests</h1>
          <p className="text-blue-100 mt-2">Manage join requests for <span className="font-semibold text-white">{club.name}</span></p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow border border-blue-100 dark:border-gray-700 p-6 flex items-center gap-5">
        <img
          src={club.photos?.[0] || 'https://via.placeholder.com/60'}
          alt={club.name}
          className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200 dark:border-purple-700 shadow"
        />
        <div>
          <h2 className="text-xl font-semibold text-blue-900 dark:text-white">{club.name}</h2>
          <p className="text-blue-600 dark:text-blue-200">{club.category} • {club.members?.length || 0} members</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-white">Join Requests ({pendingRequests.length})</h2>
          <div className="flex items-center space-x-2 text-sm text-blue-500 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <span>Awaiting your approval</span>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <Users className="h-14 w-14 text-blue-200 dark:text-blue-700 mb-4" />
            <h3 className="text-lg font-medium text-blue-900 dark:text-white mb-2">No pending requests</h3>
            <p className="text-blue-500 dark:text-blue-300">All join requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-blue-100 dark:border-blue-700 rounded-xl bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 hover:shadow-xl transition-all gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={request.photo || 'https://via.placeholder.com/48'}
                    alt={request.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-purple-700 shadow"
                  />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-white">{request.name}</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{request.collegemailid}</p>
                    <p className="text-xs text-blue-400">Requested {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2 self-end md:self-auto">
                  <Button
                    size="sm"
                    variant="success"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow"
                    onClick={() => handleApprove(request._id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="bg-rose-500 hover:bg-rose-600 text-white border-none shadow"
                    onClick={() => handleReject(request._id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow border border-blue-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/clubs/${clubId}`}>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-100 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors cursor-pointer">
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-white">View Club</span>
            </div>
          </Link>
          <Link to={`/admin/edit-club/${clubId}`}>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-green-100 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900 transition-colors cursor-pointer">
              <Users className="h-6 w-6 text-emerald-600" />
              <span className="font-medium text-green-900 dark:text-white">Edit Club</span>
            </div>
          </Link>
          <Link to="/admin">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-purple-100 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors cursor-pointer">
              <Users className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-purple-900 dark:text-white">Back to Admin</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingRequests; 