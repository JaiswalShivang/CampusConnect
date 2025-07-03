import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Upload, X } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    collegemailid: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phone: '',
    photo: null,
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const userData = new FormData();
      userData.append('name', formData.name);
      userData.append('collegemailid', formData.collegemailid);
      userData.append('password', formData.password);
      userData.append('gender', formData.gender);
      userData.append('phone', formData.phone);
      // Capitalize role for backend compatibility
      userData.append('role', formData.role.charAt(0).toUpperCase() + formData.role.slice(1));
      if (formData.photo) userData.append('photo', formData.photo);
      const user = await signup(userData);
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Show backend error if available
      alert(error.response?.data?.message || 'Signup failed');
      console.error('Signup error:', error.response?.data || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#222' }}>Create your account</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: '#666' }}>Join CampusConnect and connect with your college community</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, border: '1px solid #eee' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit}>
            <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Full Name" style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }} />
            <input id="collegemailid" name="collegemailid" type="email" required value={formData.collegemailid} onChange={handleChange} placeholder="College Email" style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }} />
            <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }} />
            <select id="gender" name="gender" required value={formData.gender} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select id="role" name="role" required value={formData.role} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="Password" style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }} />
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }} />
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, color: '#444' }}>Profile Photo (Optional)</label>
              <div style={{ marginTop: 8 }}>
                {photoPreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={photoPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid #ccc' }} />
                    <button type="button" onClick={removePhoto} style={{ position: 'absolute', top: -8, right: -8, background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="photo" style={{ width: 64, height: 64, border: '2px dashed #ccc', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={28} color="#bbb" />
                    <input id="photo" name="photo" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 14, color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
