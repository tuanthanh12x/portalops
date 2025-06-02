import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/Navbar";

const ImageListPage = () => {
  const [images, setImages] = useState([]);
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
    <div className="min-h-screen bg-[#0f0f1c] text-white">
      <Navbar credits={150} />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-200 font-fantasy">
            Images
          </h2>
          <Link
            to="/create-image"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
          >
            + Create Image
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading images...</div>
        ) : (
          <div className="bg-[#1a1a2e] rounded shadow p-4 overflow-auto border border-[#2c2c3e]">
            <div className="min-w-[1000px] w-full">
              <div className="grid grid-cols-7 gap-4 bg-[#2c2c3e] text-gray-300 text-sm p-3 rounded-t">
                <div>Name</div>
                <div>OS Type</div>
                <div>Status</div>
                <div>Size (GB)</div>
                <div>Visibility</div>
                <div>Created</div>
                <div className="text-right">ID</div>
              </div>

              <div className="divide-y divide-[#33344a]">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 p-3 hover:bg-[#26263b] text-gray-300"
                  >
                    <div>{image.name}</div>
                    <div>{image.os_type || "-"}</div>
                    <div className={image.status === "active" ? "text-green-400" : "text-yellow-400"}>
                      {image.status}
                    </div>
                    <div>{(image.size / (1024 ** 3)).toFixed(2)} GB</div>
                    <div>{image.visibility}</div>
                    <div>{new Date(image.created_at).toLocaleString()}</div>
                    <div className="text-right text-xs break-words">{image.id}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageListPage;
