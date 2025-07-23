import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const res = await axiosInstance.put('/auth/profile/update/', formData);
      setMessage({ type: 'success', text: 'Update info sucessfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Update failes. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'company', label: 'Company Info', icon: '🏢' },
    { id: 'account', label: 'Account & Security', icon: '🔐' },
  ];

  const PersonalSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
            Fullname
          </label>
          <div className="relative">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
              placeholder="Enter your fullname"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">👤</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
              placeholder="+84 xxx xxx xxx"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">📱</span>
            </div>
          </div>
        </div>
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
          Address
        </label>
        <div className="relative">
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50 resize-none"
            placeholder="Enter your address"
          />
          <div className="absolute top-3 right-3">
            <span className="text-gray-400">📍</span>
          </div>
        </div>
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
          Timezone
        </label>
        <div className="relative">
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50 appearance-none cursor-pointer"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-gray-800">
                {tz.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400">🌍</span>
          </div>
        </div>
      </div>
    </div>
  );

  const CompanySection = () => (
    <div className="space-y-6">
      <div className="group">
        <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
          Company name
        </label>
        <div className="relative">
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full bg-gray-800/50 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
            placeholder="Enter company name"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-400">🏢</span>
          </div>
        </div>
      </div>
    </div>
  );

  const AccountSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-2xl border border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">📧 Account Infomation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="bg-gray-700/30 text-gray-300 px-4 py-3 rounded-xl border border-gray-600/50">
              {formData.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Customer ID</label>
            <div className="bg-gray-700/30 text-gray-300 px-4 py-3 rounded-xl border border-gray-600/50 font-mono text-sm">
              {formData.customer_id}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6 rounded-2xl border border-green-500/20">
        <h3 className="text-lg font-semibold text-green-300 mb-4">☁️ OpenStack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
            <div className="bg-gray-700/30 text-gray-300 px-4 py-3 rounded-xl border border-gray-600/50 font-mono text-sm">
              {formData.openstack_user_id}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Project ID</label>
            <div className="bg-gray-700/30 text-gray-300 px-4 py-3 rounded-xl border border-gray-600/50 font-mono text-sm">
              {formData.project_id}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 rounded-2xl border border-orange-500/20">
        <h3 className="text-lg font-semibold text-orange-300 mb-4">💳 Account & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Credits</label>
            <div className="bg-gray-700/30 text-green-400 px-4 py-3 rounded-xl border border-gray-600/50 font-semibold">
              ${formData.credits}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">2FA</label>
            <div className={`px-4 py-3 rounded-xl border font-medium ${
              formData.two_factor_enabled 
                ? 'bg-green-900/30 text-green-400 border-green-600/50' 
                : 'bg-red-900/30 text-red-400 border-red-600/50'
            }`}>
              {formData.two_factor_enabled ? '✅ Đã bật' : '❌ Chưa bật'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Staff</label>
            <div className={`px-4 py-3 rounded-xl border font-medium ${
              formData.is_staff 
                ? 'bg-purple-900/30 text-purple-400 border-purple-600/50' 
                : 'bg-gray-700/30 text-gray-400 border-gray-600/50'
            }`}>
              {formData.is_staff ? '👑 Admin' : '👤 User'}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/setup-2fa')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            🔐 Setup 2FA
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'personal': return <PersonalSection />;
      case 'company': return <CompanySection />;
      case 'account': return <AccountSection />;
      default: return <PersonalSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto pt-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            ⚙️ Account Settings
          </h1>
          <p className="text-gray-400">Manage Account Info & Security</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-2xl backdrop-blur-sm border ${
            message.type === 'success' 
              ? 'bg-green-900/40 border-green-500/50 text-green-300' 
              : 'bg-red-900/40 border-red-500/50 text-red-300'
          } animate-pulse`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>

              {/* Profile Summary */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{formData.full_name || 'Nameless'}</div>
                    <div className="text-sm text-gray-400">{formData.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                {renderSection()}

                {/* Save Button - Only show for editable sections */}
                {(activeSection === 'personal' || activeSection === 'company') && (
                  <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>💾</span>
                          <span>Save</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;