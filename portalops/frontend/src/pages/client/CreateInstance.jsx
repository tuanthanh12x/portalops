import React, { useState } from 'react';

const CreateInstancePage = () => {

  const [region, setRegion] = useState('region-3');
  const [imageTab, setImageTab] = useState('distribution');
  const [image, setImage] = useState('windows-server-2022');
  const [plan, setPlan] = useState('basic');
  const [options, setOptions] = useState({
    ha: true,
    floatingIp: false,
    backups: true,
  });
  const [authMethod, setAuthMethod] = useState('ssh');
  const [sshKey, setSshKey] = useState('default-key');

  const handleToggle = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = () => {
    alert('Instance creation submitted!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create New Instance</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Select Region */}
        <div>
          <h2 className="text-lg font-medium mb-2">1. Select Region</h2>
          <div className="flex gap-4">
            {['region-1', 'region-2', 'region-3', 'region-4'].map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={r}
                  checked={region === r}
                  onChange={() => setRegion(r)}
                />
                <span className="capitalize">{r.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Select Image */}
        <div>
          <h2 className="text-lg font-medium mb-2">2. Select Image</h2>
          <div className="flex gap-4 border-b pb-2">
            {['distribution', 'marketplace', 'my-images', 'iso'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-1 rounded ${
                  imageTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
                onClick={() => setImageTab(tab)}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-4 flex-wrap">
            {['ubuntu-22.04', 'centos-7', 'windows-server-2022'].map((img) => (
              <label key={img} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={img}
                  checked={image === img}
                  onChange={() => setImage(img)}
                />
                <span className="capitalize">{img.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Select Plan */}
        <div>
          <h2 className="text-lg font-medium mb-2">3. Select Plan</h2>
          {[
            { value: 'basic', label: 'Basic: 1 CPU, 2GB RAM, 20GB SSD - $5/month' },
            { value: 'standard', label: 'Standard: 2 CPU, 4GB RAM, 40GB SSD - $10/month' },
            { value: 'premium', label: 'Premium: 4 CPU, 8GB RAM, 80GB SSD - $20/month' },
          ].map((planItem) => (
            <label key={planItem.value} className="flex items-center gap-2 block mt-1">
              <input
                type="radio"
                name="plan"
                value={planItem.value}
                checked={plan === planItem.value}
                onChange={() => setPlan(planItem.value)}
              />
              {planItem.label}
            </label>
          ))}
        </div>


        <div>
          <h2 className="text-lg font-medium mb-2">4. Additional Options</h2>
          {[
            { key: 'ha', label: 'Enable High Availability' },
            { key: 'floatingIp', label: 'Add Floating IP (+$1/month)' },
            { key: 'backups', label: 'Enable Backups (+$2/month)' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 block mt-1">
              <input
                type="checkbox"
                checked={options[opt.key]}
                onChange={() => handleToggle(opt.key)}
              />
              {opt.label}
            </label>
          ))}
        </div>


        <div>
          <h2 className="text-lg font-medium mb-2">5. Authentication</h2>
          <div className="flex gap-4">
            {['ssh', 'password'].map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={method}
                  checked={authMethod === method}
                  onChange={() => setAuthMethod(method)}
                />
                <span>{method.toUpperCase()}</span>
              </label>
            ))}
          </div>
          {authMethod === 'ssh' && (
            <select
              value={sshKey}
              onChange={(e) => setSshKey(e.target.value)}
              className="mt-2 border rounded px-3 py-2 w-full"
            >
              <option value="default-key">default-key</option>
              <option value="admin-key">admin-key</option>
            </select>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-gray-600">
            Estimated Monthly Cost: <strong>$8/month</strong>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded">Back</button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create Instance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInstancePage;

