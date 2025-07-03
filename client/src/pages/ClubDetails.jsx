import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  MessageCircle,
  Clock,
  Bell,
  Edit,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClubDetails = () => {
  const { clubId } = useParams();
  const { user, isAdmin } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningClub, setJoiningClub] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderInterval = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  // Auto-advance slider
  useEffect(() => {
    if (!club || !club.photos || club.photos.length <= 1) return;
    sliderInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % club.photos.length);
    }, 3500);
    return () => clearInterval(sliderInterval.current);
  }, [club]);

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/club/all`);
      const clubsRaw = response.data.clubs;
      const clubData = clubsRaw.find(c => c._id === clubId);
      if (clubData) {
        setClub(clubData);
      } else {
        toast.error('Club not found');
      }
    } catch (error) {
      console.error('Error fetching club details:', error);
      toast.error('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    setJoiningClub(true);
    try {
      await axios.post('/club/join', { clubId });
      toast.success('Join request sent successfully!');
      fetchClubDetails(); // Refresh to update status
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send join request';
      toast.error(message);
    } finally {
      setJoiningClub(false);
    }
  };

  const isUserMember = () => {
    return club?.members?.some(member => member._id === user?._id);
  };

  const isUserPending = () => {
    return club?.pendingRequests?.some(request => request._id === user?._id);
  };

  const isUserAdmin = () => {
    return club?.admin?._id === user?._id;
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
        <Link to="/clubs">
          <Button>Back to Clubs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
      {/* Club Header */}
      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:space-x-8 gap-6 md:gap-8">
        {/* Club Info */}
        <div className="flex-1 text-white drop-shadow-lg mb-6 md:mb-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{club.name}</h1>
          <p className="text-base sm:text-lg text-white/90 mb-2">{club.category}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{club.members?.length || 0} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{club.events?.length || 0} events</span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isAdmin && (
              isUserMember() ? (
                <Link to={`/chats/${clubId}`}>
                  <Button variant="primary">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </Link>
              ) : isUserPending() ? (
                <Button variant="secondary" disabled>
                  Pending Approval
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={joiningClub}
                  onClick={handleJoinClub}
                >
                  Join Club
                </Button>
              )
            )}
            {(isUserAdmin() || isAdmin) && (
              <Link to={`/admin/edit-club/${clubId}`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Club Gallery Section */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Club Gallery</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{club.photos?.length || 0} images</span>
            </h2>
            {club.photos && club.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {club.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    className="group relative rounded-xl overflow-hidden focus:outline-none border border-gray-200 shadow-sm hover:shadow-lg transition"
                    onClick={() => { setModalImage(photo); setShowImageModal(true); }}
                  >
                    <img
                      src={photo}
                      alt={`Club ${club.name} photo ${idx + 1}`}
                      className="w-full h-28 sm:h-36 md:h-44 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90 rounded-xl"
                    />
                    <span className="absolute bottom-2 right-2 bg-white/90 text-xs text-gray-800 px-2 py-0.5 rounded shadow">View</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-full h-28 sm:h-36 md:h-44 flex items-center justify-center bg-blue-50 rounded-xl">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300" />
                <span className="ml-2 text-gray-400">No images yet</span>
              </div>
            )}
          </div>
        </div>
        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-2" onClick={() => setShowImageModal(false)}>
            <div className="relative w-full max-w-2xl mx-auto" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white" onClick={() => setShowImageModal(false)}>
                <span className="text-lg font-bold">&times;</span>
              </button>
              <img src={modalImage} alt="Club full view" className="w-full max-h-[70vh] object-contain rounded-xl shadow-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              key="overview"
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {(isUserMember() || isUserAdmin()) && (
              <>
                <button
                  key="events"
                  onClick={() => setActiveTab('events')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === 'events'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Events
                </button>
                <button
                  key="announcements"
                  onClick={() => setActiveTab('announcements')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === 'announcements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Announcements
                </button>
              </>
            )}
            <button
              key="members"
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {club.description}
                </p>
              </div>

              {club.links && club.links.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Links
                  </h3>
                  <div className="space-y-2">
                    {club.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Link {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Club Admin
                  </h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={club.admin?.photo || 'https://via.placeholder.com/40'}
                      alt={club.admin?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {club.admin?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {club.admin?.collegemailid}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Quick Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium text-gray-900">
                        {club.members?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Events:</span>
                      <span className="font-medium text-gray-900">
                        {club.events?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Announcements:</span>
                      <span className="font-medium text-gray-900">
                        {club.announcement?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab - Only for members or admin */}
          {(activeTab === 'events') && (isUserMember() || isUserAdmin()) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
                {(isUserAdmin() || isAdmin) && (
                  <Link to={`/admin/create-event/${clubId}`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                )}
              </div>
              {club.events && club.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {club.events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg p-4 shadow-sm transition"
                    >
                      <div className="flex items-center mb-2">
                        <img src={club.photos?.[0] || 'https://via.placeholder.com/40'} alt={club.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                        <div>
                          <h4 className="font-semibold text-blue-900">{event.name}</h4>
                          <p className="text-xs text-blue-700">{club.name}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2 line-clamp-2">{event.description}</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full">{event.category}</span>
                        <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" />{new Date(event.date).toLocaleDateString()}</span>
                        <span className="flex items-center space-x-1"><MapPin className="h-4 w-4" />{event.venue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No events scheduled yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab - Only for members or admin */}
          {(activeTab === 'announcements') && (isUserMember() || isUserAdmin()) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Latest Announcements
                </h3>
                {(isUserAdmin() || isAdmin) && (
                  <Link to={`/admin/create-announcement/${clubId}`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  </Link>
                )}
              </div>
              {club.announcement && club.announcement.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {club.announcement.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg p-4 shadow-sm transition"
                    >
                      <div className="flex items-center mb-2">
                        <img src={club.photos?.[0] || 'https://via.placeholder.com/40'} alt={club.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                        <div>
                          <h4 className="font-semibold text-green-900">{announcement.name}</h4>
                          <p className="text-xs text-green-700">{club.name}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2 line-clamp-2">{announcement.description}</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">{announcement.category}</span>
                        <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" />{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No announcements yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Club Members
              </h3>
              {club.members && club.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {club.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 border border-gray-100"
                    >
                      <img
                        src={member.photo || 'https://via.placeholder.com/48'}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {member.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {member.collegemailid}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No members yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetails; 