import React, { useEffect } from "react";

const Popup = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "12px 20px",
        borderRadius: 6,
        color: "#fff",
        backgroundColor: type === "success" ? "#38a169" : "#e53e3e",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 1000,
        minWidth: 250,
        fontWeight: "600",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
};

export default Popup;
