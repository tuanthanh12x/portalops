import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/client/Navbar';
import Popup from "../../components/client/Popup";
const CreateVolumePage = () => {
  const [name, setName] = useState('');
  const [size, setSize] = useState(10);
  const [description, setDescription] = useState('');
  const [volumeType, setVolumeType] = useState('');
  const [availabilityZone, setAvailabilityZone] = useState('');
  const [isBootable, setIsBootable] = useState(false);
  const [sourceImage, setSourceImage] = useState('');
  const [sourceVolume, setSourceVolume] = useState('');
  const [sourceSnapshot, setSourceSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState(null);
  const [options, setOptions] = useState({
    volume_types: [],
    availability_zones: [],
    images: [],
    volumes: [],
    snapshots: []
  });

  useEffect(() => {
    axiosInstance.get('/openstack/volume-option/')
      .then(res => {
        setOptions(res.data);
        setVolumeType(res.data.volume_types[0]?.id || '');
        setAvailabilityZone(res.data.availability_zones[0] || '');
        setSourceImage(res.data.images[0]?.id || '');
        setSourceVolume(res.data.volumes[0]?.id || '');
        setSourceSnapshot(res.data.snapshots[0]?.id || '');
      })
      .catch(err => {
        setPopup({ message: "❌ Failed to load volume options: ", type: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateVolume = async () => {
  if (!name || !size || !volumeType || !availabilityZone) {
    setPopup({ message: "❌ Please fill all required fields.", type: "error" });
    return;
  }

  const payload = {
    name,
    size,
    description,
    volume_type: volumeType,
    availability_zone: availabilityZone,
    bootable: isBootable,
    source_image: isBootable ? sourceImage : null,
    source_volume: sourceVolume || null,
    source_snapshot: sourceSnapshot || null,
  };

  try {
    const res = await axiosInstance.post('/openstack/storage/volumes/', payload);
    setPopup({ message: "✅ Volume created successfully!", type: "success" });
  } catch (err) {
    console.error('❌ Failed to create volume:', err);
    setPopup({ message: "❌ Failed to create volume. Check console.", type: "error" });
  }
};

  if (loading) {
    return <div className="text-center text-gray-300 mt-10">Loading volume options...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-gray-100 min-h-screen">
      <Navbar />
{popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-2xl mx-auto p-8 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide drop-shadow mb-6">
          📦 Create New Volume
        </h1>

        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
          <div>
            <label className="block mb-2 text-white font-semibold">Volume Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter volume name"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Size (GB)</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Volume Type</label>
            <select
              value={volumeType}
              onChange={(e) => setVolumeType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            >
              {options.volume_types.map((type) => (
                <option key={type.id} value={type.id} className="bg-gray-900 text-white">{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Availability Zone</label>
            <select
              value={availabilityZone}
              onChange={(e) => setAvailabilityZone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            >
              {options.availability_zones.map((zone, index) => (
                <option key={index} value={zone} className="bg-gray-900 text-white">{zone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="inline-flex items-center text-white font-semibold">
              <input
                type="checkbox"
                checked={isBootable}
                onChange={() => setIsBootable(!isBootable)}
                className="accent-blue-500 form-checkbox mr-2"
              />
              Bootable Volume
            </label>
          </div>

          {isBootable && (
            <div>
              <label className="block mb-2 text-white font-semibold">Source Image</label>
              <select
                value={sourceImage}
                onChange={(e) => setSourceImage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
              >
                {options.images.map((img) => (
                  <option key={img.id} value={img.id} className="bg-gray-900 text-white">{img.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-2 text-white font-semibold">Source Volume (optional)</label>
            <select
              value={sourceVolume}
              onChange={(e) => setSourceVolume(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-gray-900 text-white">None</option>
              {options.volumes.map((vol) => (
                <option key={vol.id} value={vol.id} className="bg-gray-900 text-white">{vol.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-white font-semibold">Source Snapshot (optional)</label>
            <select
              value={sourceSnapshot}
              onChange={(e) => setSourceSnapshot(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="" className="bg-gray-900 text-white">None</option>
              {options.snapshots.map((snap) => (
                <option key={snap.id} value={snap.id} className="bg-gray-900 text-white">{snap.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateVolume}
              className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Create Volume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVolumePage;
