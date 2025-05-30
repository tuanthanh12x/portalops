import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';

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
        console.error('Failed to load volume options:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateVolume = async () => {
    if (!name || !size || !volumeType || !availabilityZone) {
      alert('Please fill all required fields.');
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
      alert('Volume created successfully!');
      console.log(res.data);
    } catch (err) {
      console.error('Failed to create volume:', err);
      alert('Failed to create volume. Check console.');
    }
  };

  if (loading) {
    return <div className="text-center text-white mt-10">Loading volume options...</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Create New Volume</h1>

        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          <div>
            <label className="block mb-1">Volume Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter volume name"
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">Size (GB)</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">Volume Type</label>
            <select
              value={volumeType}
              onChange={(e) => setVolumeType(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            >
              {options.volume_types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Availability Zone</label>
            <select
              value={availabilityZone}
              onChange={(e) => setAvailabilityZone(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            >
              {options.availability_zones.map((zone, index) => (
                <option key={index} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isBootable}
                onChange={() => setIsBootable(!isBootable)}
                className="form-checkbox mr-2"
              />
              Bootable Volume
            </label>
          </div>

          {isBootable && (
            <div>
              <label className="block mb-1">Source Image</label>
              <select
                value={sourceImage}
                onChange={(e) => setSourceImage(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
              >
                {options.images.map((img) => (
                  <option key={img.id} value={img.id}>{img.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1">Source Volume (optional)</label>
            <select
              value={sourceVolume}
              onChange={(e) => setSourceVolume(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            >
              <option value="">None</option>
              {options.volumes.map((vol) => (
                <option key={vol.id} value={vol.id}>{vol.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Source Snapshot (optional)</label>
            <select
              value={sourceSnapshot}
              onChange={(e) => setSourceSnapshot(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600"
            >
              <option value="">None</option>
              {options.snapshots.map((snap) => (
                <option key={snap.id} value={snap.id}>{snap.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateVolume}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
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