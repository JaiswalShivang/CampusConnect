import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

const CreateEvent = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    links: ['']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    'Workshop', 'Competition', 'Seminar', 'Webinar', 'Other'
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

  const handleLinkChange = (idx, value) => {
    setFormData({
      ...formData,
      links: formData.links.map((l, i) => i === idx ? value : l)
    });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...formData.links, ''] });
  };

  const removeLink = (idx) => {
    setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.date || !formData.venue) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      let eventDate = formData.date;
      if (formData.time) {
        eventDate = new Date(`${formData.date}T${formData.time}`).toISOString();
      }
      const eventData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        links: formData.links.length > 0 ? formData.links : [''],
        date: eventDate,
        venue: formData.venue,
        clubId
      };
      await axios.post('/event/create', eventData);
      navigate(`/clubs/${clubId}`);
    } catch (error) {
      alert('Failed to create event');
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
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-gray-600 mt-2">Create a new event for {club.name}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter event name" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea id="description" name="description" required rows={4} value={formData.description} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe the event details..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
                  <input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock className="h-5 w-5 text-gray-400" /></div>
                  <input id="time" name="time" type="time" value={formData.time} onChange={handleChange} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
                  <input id="venue" name="venue" type="text" required value={formData.venue} onChange={handleChange} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter venue" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">External Links</label>
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input type="url" value={link} onChange={e => handleLinkChange(idx, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com" required={idx === 0} />
                  {formData.links.length > 1 && <button type="button" onClick={() => removeLink(idx)} className="ml-2 text-red-500">Remove</button>}
                </div>
              ))}
              <button type="button" onClick={addLink} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">Add Link</button>
            </div>
            <button type="submit" disabled={saving} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Creating...' : 'Create Event'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 