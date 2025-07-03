import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CreateClub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    links: [''],
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [hasClub, setHasClub] = useState(null);

  const categories = [
    'Technology', 'Sports', 'Cultural', 'Academic', 'Arts', 
    'Music', 'Dance', 'Photography', 'Other'
  ];

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

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData({
      ...formData,
      links: newLinks
    });
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, '']
    });
  };

  const removeLink = (index) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      links: newLinks
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.photos.length === 0) {
      alert('Please upload at least one club photo');
      return;
    }
    if (formData.links.filter(link => link.trim() !== '').length === 0) {
      alert('Please provide at least one external link');
      return;
    }
    setLoading(true);
    try {
      const clubData = new FormData();
      clubData.append('name', formData.name);
      clubData.append('description', formData.description);
      clubData.append('category', formData.category);
      formData.links.filter(link => link.trim() !== '').forEach(link => {
        clubData.append('links', link);
      });
      formData.photos.forEach(photo => {
        clubData.append('images', photo);
      });
      await axios.post('/club/create', clubData);
      navigate('/admin');
    } catch (error) {
      alert('Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminClub = async () => {
      if (!user?._id) return;
      try {
        const response = await axios.get('/club/all');
        const clubsRaw = response.data.clubs;
        const adminClubs = Array.isArray(clubsRaw) ? clubsRaw.filter(club => club.admin?._id === user._id) : [];
        setHasClub(adminClubs.length > 0);
        if (adminClubs.length > 0) {
          // Redirect to admin dashboard if already has a club
          setTimeout(() => navigate('/admin'), 2000);
        }
      } catch (e) {
        setHasClub(false);
      }
    };
    checkAdminClub();
  }, [user, navigate]);

  if (hasClub === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (hasClub) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You have already created a club.</h2>
        <p className="text-gray-600 mb-6">Admins can only create one club. Redirecting to your dashboard...</p>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Club</h1>
          <p className="text-gray-600 mt-2">Set up a new club and start building your community</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Club Photos *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">External Links *</label>
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input type="url" value={link} onChange={e => handleLinkChange(idx, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com" required={idx === 0} />
                  {formData.links.length > 1 && <button type="button" onClick={() => removeLink(idx)} className="ml-2 text-red-500"><X size={16} /></button>}
                </div>
              ))}
              <button type="button" onClick={addLink} className="mt-2 text-blue-600 flex items-center"><Plus size={16} className="mr-1" />Add Link</button>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Creating...' : 'Create Club'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClub;