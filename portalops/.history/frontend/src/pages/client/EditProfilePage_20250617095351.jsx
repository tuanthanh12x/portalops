import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';

const EditProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    company: '',
    timezone: 'UTC',
    customer_id: '',
    openstack_user_id: '',
    project_id: '',
    credits: '',
    is_staff: false,
    two_factor_enabled: false,
  });

  const [timezones, setTimezones] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    axiosInstance.get('/auth/profile/info/')
      .then((res) => {
        const data = res.data;
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          company: data.company || '',
          timezone: data.timezone || 'UTC',
          customer_id: data.customer_id || '',
          openstack_user_id: data.openstack_user_id || '',
          project_id: data.project_id || '',
          credits: data.credits || '',
          is_staff: data.is_staff || false,
          two_factor_enabled: data.two_factor_enabled || false,
        });
        setTimezones(data.timezones || []);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put('/auth/profile/update/', formData);
      setMessage({ type: 'success', text: res.data.message || 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Update failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-black/30 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6 drop-shadow-md">📝 Edit Profile</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Editable Fields */}
          {[
            { label: "Full Name", name: "full_name" },
            { label: "Phone Number", name: "phone_number" },
            { label: "Company", name: "company" },
            { label: "Address", name: "address", type: "textarea" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block mb-1 font-semibold text-gray-300">{label}</label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}

          {/* Timezone */}
          <div>
            <label className="block mb-1 font-semibold text-gray-300">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Read-only Fields */}
          {[
            { label: "Email", value: formData.email },
            { label: "Customer ID", value: formData.customer_id },
            { label: "OpenStack User ID", value: formData.openstack_user_id },
            { label: "Project ID", value: formData.project_id },
            { label: "Credits", value: formData.credits },
            { label: "2FA Enabled", value: formData.two_factor_enabled ? "Yes" : "No" },
            { label: "Staff Access", value: formData.is_staff ? "Yes" : "No" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block mb-1 font-semibold text-gray-300">{label}</label>
              <input
                type="text"
                value={value}
                disabled
                className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded-lg border border-gray-600 cursor-not-allowed"
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              💾 Save Changes
            </button>

            <button
              type="button"
              onClick={() => navigate('/setup-2fa')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              🔐 Setup 2FA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
