import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';
import Popup from '../../components/client/Popup';
import { useNavigate } from "react-router-dom";
const CreateInstancePage = () => {
  
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [imageTab, setImageTab] = useState('my-images');
  const [image, setImage] = useState('');
  const [plan, setPlan] = useState('');
  const [network, setNetwork] = useState('');
  const [options, setOptions] = useState({ ha: true, floatingIp: false, backups: true });
  const [authMethod, setAuthMethod] = useState('ssh');
  const [sshKey, setSshKey] = useState('default-key');
  const [popup, setPopup] = useState(null);
const navigate = useNavigate();
  const [instanceOptions, setInstanceOptions] = useState({
    regions: [],
    plans: [],
    images: { distribution: [], marketplace: [], my_images: [], iso: [] },
    networks: [],
  });

  useEffect(() => {
    axiosInstance.get('/openstack/instance-option/')
      .then(res => {
        const data = res.data;
        setInstanceOptions(data);
        setRegion(data.regions[0] || '');
        if (data.images.my_images.length > 0) {
          setImageTab('my-images');
          setImage(data.images.my_images[0].id);
        } else if (data.images.distribution.length > 0) {
          setImageTab('distribution');
          setImage(data.images.distribution[0].id);
        } else {
          setImage('');
        }
        setPlan(data.plans[0]?.id || '');
        setNetwork(data.networks[0]?.id || '');
      })
      .catch(err => {
          setPopup({ message: 'Failed to load instance options.', type: 'error' });
      });
  }, []);

  const handleToggle = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = async () => {
    if (!image || !plan || !network || !sshKey) {
   setPopup({ message: "❌ Please fill all required fields.", type: "error" });
      return;
    }
    const payload = {
      name: name || 'my-instance',
      image_id: image,
      flavor_id: plan,
      network_id: network,
    };
    try {
  const res = await axiosInstance.post('/openstack/compute/instances/', payload);
  setPopup({ message: res.data.message || "Instance created successfully", type: "success" });
} catch (err) {
  setPopup({ 
    message: err.response?.data?.error || 'Failed to create instance. Check console.', 
    type: "error" 
  });
}

  };

  const renderImagesByTab = () => {
    let imagesToShow = [];
    switch (imageTab) {
      case 'distribution': imagesToShow = instanceOptions.images.distribution; break;
      case 'marketplace': imagesToShow = instanceOptions.images.marketplace; break;
      case 'my-images': imagesToShow = instanceOptions.images.my_images; break;
      case 'iso': imagesToShow = instanceOptions.images.iso; break;
      default: imagesToShow = [];
    }
    if (imagesToShow.length === 0) {
      return <p className="text-gray-400">No images available in this category.</p>;
    }
    return imagesToShow.map(img => (
      <label key={img.id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="image"
          value={img.id}
          checked={image === img.id}
          onChange={() => setImage(img.id)}
          className="accent-blue-500"
        />
        <span>{img.name || img.id}</span>
      </label>
    ));
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Navbar credits={150} />
       {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-5xl mx-auto p-8 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide drop-shadow">🚀 Launch a New Cloud Instance</h1>
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
          {/* Region Selection */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Select Region</h2>
            <div className="flex flex-wrap gap-4">
              {instanceOptions.regions.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
                  <input
                    type="radio"
                    name="region"
                    value={r}
                    checked={region === r}
                    onChange={() => setRegion(r)}
                    className="accent-blue-500"
                  />
                  <span className="capitalize">🌐 {r}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Instance Name */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Instance Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., nebula-x01"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </section>

          {/* Image Selection */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Select Image</h2>
            <div className="flex gap-2 border-b border-gray-700 pb-3 mb-3">
              {['distribution', 'marketplace', 'my-images', 'iso'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full transition text-sm font-medium ${imageTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setImageTab(tab)}
                >
                  {tab.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {renderImagesByTab()}
            </div>
          </section>

          {/* Plan Selection */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Select Plan</h2>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {instanceOptions.plans.map(planItem => (
                <label key={planItem.id} className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
                  <input
                    type="radio"
                    name="plan"
                    value={planItem.id}
                    checked={plan === planItem.id}
                    onChange={() => setPlan(planItem.id)}
                    className="accent-blue-500"
                  />
                  <span>{planItem.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Network Selection */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Select Network</h2>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {instanceOptions.networks.map(net => (
                <label key={net.id} className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
                  <input
                    type="radio"
                    name="network"
                    value={net.id}
                    checked={network === net.id}
                    onChange={() => setNetwork(net.id)}
                    className="accent-blue-500"
                  />
                  <span>{net.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Additional Options */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Additional Options</h2>
            {[{ key: 'ha', label: 'Enable High Availability' },
              { key: 'floatingIp', label: 'Add Floating IP (+$1/month)' },
              { key: 'backups', label: 'Enable Backups (+$2/month)' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[opt.key]}
                  onChange={() => handleToggle(opt.key)}
                  className="accent-blue-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </section>

          {/* Authentication Method */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Authentication Method</h2>
            <div className="flex gap-6">
              {['ssh', 'password'].map(method => (
                <label key={method} className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
                  <input
                    type="radio"
                    name="authMethod"
                    value={method}
                    checked={authMethod === method}
                    onChange={() => setAuthMethod(method)}
                    className="accent-blue-500"
                  />
                  <span>{method.toUpperCase()}</span>
                </label>
              ))}
            </div>
            {authMethod === 'ssh' && (
              <select
                value={sshKey}
                onChange={(e) => setSshKey(e.target.value)}
                className="mt-3 border border-gray-700 rounded px-4 py-2 w-full bg-gray-800 text-gray-100"
              >
                <option value="default-key">default-key</option>
                <option value="admin-key">admin-key</option>
              </select>
            )}
          </section>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <div className="text-gray-400">
              🧮 Estimated Monthly Cost: <strong className="text-blue-400">$8/month</strong>
            </div>
            <div className="flex gap-4">
             <button
      className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:border-gray-400 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={() => navigate("/dashboard")}
      aria-label="Go back to home page"
    >
      Back
    </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                🚀 Create Instance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInstancePage;