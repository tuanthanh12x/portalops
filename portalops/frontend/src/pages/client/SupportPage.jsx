import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar from "../../components/client/Navbar";

const FAQ_ITEMS = [
  { question: "How to install my VPS?" },
  { question: "How to SSH into Ubuntu server?" },
  { question: "How to reset my VPS password?" },
  { question: "How to upgrade my server plan?" },
  { question: "How to monitor server performance?" },
  { question: "How to create a snapshot of VPS?" },
  { question: "How to enable automatic backups?" },
  { question: "How to configure firewall settings?" },
  { question: "How to migrate VPS to a new data center?" },
  { question: "How to recover deleted files?" },
  { question: "How to change the server hostname?" },
  { question: "How to set up a domain name?" },
  { question: "How to troubleshoot network connectivity issues?" },
  { question: "How to manage SSH keys?" },
  { question: "How to request a refund?" },
];

const ITEMS_PER_PAGE = 5;

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    description: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/support/tickets");
      const result = res.data;
      const ticketList = Array.isArray(result) ? result : result.tickets || [];
      setTickets(ticketList);
    } catch {
      setError("Cannot load tickets.");
      setTickets([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData((prev) => ({ ...prev, attachment: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("subject", formData.subject);
      data.append("category", formData.category);
      data.append("description", formData.description);
      if (formData.attachment) {
        data.append("attachment", formData.attachment);
      }

      await axios.post("/api/support/tickets", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ subject: "", category: "", description: "", attachment: null });
      fetchTickets();
    } catch {
      setError("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFaq = useMemo(() => {
    if (!searchTerm.trim()) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(({ question }) =>
      question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredFaq.length / ITEMS_PER_PAGE);
  const currentFaqItems = filteredFaq.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum);
  };

  return (
    <div className="dark">
      <div className="fixed top-4 right-4 z-[100] space-y-2" id="toast-container" />
      <Navbar credits={150} />

      <div className="max-w-5xl mx-auto p-5 flex gap-10 text-gray-200 bg-black/30 backdrop-blur-lg rounded-lg">
        {/* Left Panel */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-6 text-indigo-400 drop-shadow-md">
            Support Center
          </h1>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Submit a Support Ticket</h2>
            {error && <p className="text-red-300 mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200"
                >
                  <option value="">-- Select category --</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical issue</option>
                  <option value="general">General question</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full p-2 border border-gray-700 rounded resize-none bg-gray-900 text-gray-200"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium">Attachment (optional)</label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                  className="text-gray-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-white rounded ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Your Tickets</h2>
            {!Array.isArray(tickets) || tickets.length === 0 ? (
              <p>You have no support tickets.</p>
            ) : (
              <ul className="space-y-4">
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    className="border border-gray-700 p-4 rounded shadow-sm hover:bg-gray-900/30"
                  >
                    <strong className="block text-lg text-white-400">{t.subject}</strong>
                    <p>Category: {t.category}</p>
                    <p>
                      Status:{" "}
                      <em
                        className={
                          t.status.toLowerCase() === "open"
                            ? "text-green-300"
                            : "text-red-300"
                        }
                      >
                        {t.status}
                      </em>
                    </p>
                    <p>Created: {new Date(t.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Panel */}
        <div className="w-72">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              Frequently Asked Questions (FAQ)
            </h2>

            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full mb-4 p-2 rounded bg-gray-900 border border-gray-700 text-gray-200"
            />

            <ul className="space-y-3 max-h-96 overflow-auto">
              {currentFaqItems.length === 0 ? (
                <li className="text-gray-400">No matching questions found.</li>
              ) : (
                currentFaqItems.map(({ question }, idx) => (
                  <li
                    key={idx}
                    className="border border-gray-700 p-3 rounded bg-gray-800 cursor-default"
                  >
                    <strong className="text-white-400">{question}</strong>
                  </li>
                ))
              )}
            </ul>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 text-gray-300">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? "bg-indigo-400 text-black font-semibold"
                        : "bg-gray-700 hover:bg-indigo-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
