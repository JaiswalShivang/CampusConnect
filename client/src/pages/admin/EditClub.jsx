import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EditClub = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    links: [''],
    photos: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const { user } = useAuth();

  const categories = [
    'Technology', 'Sports', 'Cultural', 'Academic', 'Arts', 
    'Music', 'Dance', 'Photography', 'Other'
  ];

  useEffect(() => {
    fetchClub();
  }, [clubId]);

  const fetchClub = async () => {
    try {
      const response = await axios.get('/club/all');
      const clubsRaw = response.data.clubs;
      const clubData = clubsRaw.find(c => c._id === clubId);
      if (clubData) {
        setClub(clubData);
        setFormData({
          name: clubData.name || '',
          description: clubData.description || '',
          category: clubData.category || '',
          links: clubData.links?.length > 0 ? clubData.links : [''],
          photos: []
        });
        setPhotoPreviews(clubData.photos || []);
      } else {
        navigate('/admin');
      }
    } catch (error) {
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files]
    });
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const clubData = new FormData();
      clubData.append('name', formData.name);
      clubData.append('description', formData.description);
      clubData.append('category', formData.category);
      formData.links.filter(link => link.trim() !== '').forEach(link => {
        clubData.append('links', link);
      });
      formData.photos.forEach(photo => {
        clubData.append('photos', photo);
      });
      await axios.put('/club/update', clubData);
      navigate('/admin');
    } catch (error) {
      alert('Failed to update club');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!club) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Club not found</h2>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Admin</button>
      </div>
    );
  }
  if (club.admin?._id !== user?._id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">You are not the admin of this club and cannot edit its details.</p>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Admin</button>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Actions Section */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          onClick={() => navigate(`/admin/edit-club/${clubId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Edit Club
        </button>
        <button
          onClick={() => navigate(`/admin/create-event/${clubId}`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          Create Event
        </button>
        <button
          onClick={() => navigate(`/admin/create-announcement/${clubId}`)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
        >
          Create Announcement
        </button>
        <button
          onClick={() => navigate(`/admin/pending-requests/${clubId}`)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600"
        >
          Pending Requests
        </button>
      </div>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Club</h1>
          <p className="text-gray-600 mt-2">Update your club information and settings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Club Name *</label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter club name" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select id="category" name="category" required value={formData.category} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea id="description" name="description" required rows={4} value={formData.description} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe your club, its purpose, and activities..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club Photos</label>
              <div className="flex flex-wrap gap-4 mb-2">
                {photoPreviews.map((preview, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img src={preview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-300" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={14} /></button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer">
                  <Upload size={24} color="#bbb" />
                  <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">External Links</label>
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input type="url" value={link} onChange={e => handleChange({ target: { name: 'links', value: formData.links.map((l, i) => i === idx ? e.target.value : l) } })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com" required={idx === 0} />
                  {formData.links.length > 1 && <button type="button" onClick={() => removePhoto(idx)} className="ml-2 text-red-500"><X size={16} /></button>}
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClub;