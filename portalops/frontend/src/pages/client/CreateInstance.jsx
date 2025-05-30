import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';  // Đường dẫn tùy dự án
import Navbar from '../../components/Navbar';

const CreateInstancePage = () => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [imageTab, setImageTab] = useState('my-images');
  const [image, setImage] = useState('');
  const [plan, setPlan] = useState('');
  const [network, setNetwork] = useState('');  // Thêm state chọn network
  const [options, setOptions] = useState({
    ha: true,
    floatingIp: false,
    backups: true,
  });
  const [authMethod, setAuthMethod] = useState('ssh');
  const [sshKey, setSshKey] = useState('default-key');

  // Dữ liệu option lấy từ API
  const [instanceOptions, setInstanceOptions] = useState({
    regions: [],
    plans: [],
    images: {
      distribution: [],
      marketplace: [],
      my_images: [],
      iso: [],
    },
    networks: [],  // Thêm networks
  });

  useEffect(() => {
    axiosInstance.get('/openstack/instance-option')
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
        console.error('❌ Failed to fetch instance options:', err);
      });
  }, []);

  const handleToggle = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = async () => {
  if (!image || !plan || !network || !sshKey) {
    alert("❌ Please fill all required fields.");
    return;
  }

  const payload = {
    name: name || 'my-instance',
    image_id: image,
    flavor_id: plan,
    network_id: network,
  };

  console.log("📤 Sending create-instance payload:", payload);

  try {
    const res = await axiosInstance.post('/openstack/compute/instances/', payload);
    alert('✅ Instance created successfully!');
    console.log(res.data);
  } catch (err) {
    console.error('❌ Failed to create instance:', err.response?.data || err.message);
    alert(`❌ ${err.response?.data?.error || 'Failed to create instance. Check console.'}`);
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
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="fixed top-4 right-4 z-[100] space-y-2" id="toast-container" data-turbo-permanent="" />

      <Navbar credits={150} />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-white">Create New Instance</h1>

        <div className="bg-gray-800 rounded-xl shadow p-6 space-y-6">
          {/* Select Region */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">1. Select Region</h2>
            <div className="flex gap-4">
              {instanceOptions.regions.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    value={r}
                    checked={region === r}
                    onChange={() => setRegion(r)}
                    className="accent-blue-500"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>


          {/* Instance Name */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">Instance Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter instance name"
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            />
          </div>


          {/* Select Image */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">2. Select Image</h2>
            <div className="flex gap-4 border-b border-gray-700 pb-2">
              {['distribution', 'marketplace', 'my-images', 'iso'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-1 rounded ${imageTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setImageTab(tab)}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
              {renderImagesByTab()}
            </div>
          </div>

          {/* Select Plan */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">3. Select Plan</h2>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {instanceOptions.plans.map(planItem => (
                <label key={planItem.id} className="flex items-center gap-2 cursor-pointer">
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
          </div>

          {/* Select Network */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">4. Select Network</h2>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {instanceOptions.networks.map(net => (
                <label key={net.id} className="flex items-center gap-2 cursor-pointer">
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
          </div>

          {/* Additional Options */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">5. Additional Options</h2>
            {[{ key: 'ha', label: 'Enable High Availability' },
            { key: 'floatingIp', label: 'Add Floating IP (+$1/month)' },
            { key: 'backups', label: 'Enable Backups (+$2/month)' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 block mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[opt.key]}
                  onChange={() => handleToggle(opt.key)}
                  className="accent-blue-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Authentication */}
          <div>
            <h2 className="text-lg font-medium mb-2 text-white">6. Authentication</h2>
            <div className="flex gap-4">
              {['ssh', 'password'].map(method => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
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
                className="mt-2 border border-gray-700 rounded px-3 py-2 w-full bg-gray-700 text-gray-100"
              >
                <option value="default-key">default-key</option>
                <option value="admin-key">admin-key</option>
              </select>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-gray-300">
              Estimated Monthly Cost: <strong>$8/month</strong>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:border-gray-400 hover:text-white transition"
                onClick={() => alert('Back button clicked')}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create Instance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInstancePage;
