import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', contactNumber: '', address: '', 
    guardianName: '', emergencyContact: '', bloodGroup: '', courseDetails: '',
    profilePic: '', idProof: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert uploaded image to Base64
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check on frontend
        setError(`File is too large. Please upload an image under 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-200 p-8">
        <div className="text-center mb-8">
          <p className="text-blue-600 font-bold uppercase tracking-[0.25em] text-xs">Join HostelCore</p>
          <h2 className="text-4xl font-black text-slate-900 mt-3">Resident Application</h2>
          <p className="text-slate-500 mt-2">Fill out the form below to apply for a hostel room.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-6 font-semibold">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100 mb-6 font-semibold">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text" name="name" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <input type="email" name="email" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input type="password" name="password" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input type="text" name="contactNumber" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Permanent Address *</label>
                <textarea name="address" rows="3" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"></textarea>
              </div>
            </div>

            {/* Section 2: Hostel & Emergency Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course/Year *</label>
                  <input type="text" name="courseDetails" placeholder="e.g. B.Tech 1st Yr" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <input type="text" name="bloodGroup" placeholder="e.g. O+" onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Guardian Name *</label>
                <input type="text" name="guardianName" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Number *</label>
                <input type="text" name="emergencyContact" required onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
              </div>

              {/* File Uploads */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePic')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID Proof (Aadhar/Passport) *</label>
                <input type="file" accept="image/*,application/pdf" required onChange={(e) => handleFileUpload(e, 'idProof')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
            </p>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 py-3 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition shadow-md`}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;