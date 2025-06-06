import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

const ImageListPage = () => {
  const [images, setImages] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axiosInstance.get("/openstack/image/images/");
        setImages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <section className="min-h-screen text-white">
      <Navbar credits={150} />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-green-400 drop-shadow-md font-fantasy">
          🖼️ My Images
        </h2>
        <Link
          to="/create-image"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Create Image
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl items-center  justify-between overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {["Name", "OS Type","Type", "Status", "Size (GB)", "Visibility", "Created", "ID"].map(
                (header) => (
                  <th key={header} className="px-6 py-4 text-left font-semibold">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading images...
                </td>
              </tr>
            ) : images.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No images found.
                </td>
              </tr>
            ) : (
              images.map((image) => (
  <tr key={image.id} className="hover:bg-gray-900/30 transition">
    <td className="px-6 py-4 font-medium">{image.name}</td>
    <td className="px-6 py-4">{image.os_type || "-"}</td>
    <td className="px-6 py-4">
      {image.image_type === "snapshot" ? "backup" : image.image_type || "-"}
    </td>
    <td className="px-6 py-4">
      <span
        className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
          image.status === "active"
            ? "bg-green-800 text-green-300"
            : "bg-yellow-800 text-yellow-300"
        }`}
      >
        {image.status}
      </span>
    </td>
    <td className="px-6 py-4">{(image.size / (1024 ** 3)).toFixed(2)}</td>
    <td className="px-6 py-4">{image.visibility || "-"}</td>
    <td
      className="px-6 py-4"
      title={new Date(image.created_at).toLocaleString()}
    >
      {new Date(image.created_at).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 text-xs break-words">{image.id}</td>
  </tr>
))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ImageListPage;
