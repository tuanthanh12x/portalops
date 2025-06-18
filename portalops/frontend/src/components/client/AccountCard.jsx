import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // adjust the path as needed
import Popup from "../../components/client/Popup"
const AccountCard = () => {
  const [account, setAccount] = useState(null);
  const [popup, setPopup] = useState(null);
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axiosInstance.get("/auth/userinfo/");
        setAccount(res.data);
      } catch (err) {
        setPopup({ message: 'Failed to load user info',type: 'error' });
      }
    };

    fetchAccount();
  }, []);

  return (
    <div className="relative bg-black/30 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl overflow-hidden text-sm text-gray-300 font-sans">
      <h4 className="text-2xl font-bold text-indigo-400 mb-6 tracking-wide drop-shadow-md font-fantasy">
        👤 Account Overview
      </h4>

      <div className="space-y-5">
        <Info label="Email" value={account?.email || "Loading..."} />
        <Info
          label="2FA"
          value={
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono border 
              ${account?.two_factor_enabled
                  ? "bg-green-900 text-green-400 border-green-600"
                  : "bg-yellow-900 text-yellow-400 border-yellow-600"
                }`}
            >
              {account
                ? account.two_factor_enabled
                  ? "On"
                  : "Off"
                : "Loading..."}
            </span>
          }
        />
        <Info
          label="Last Login"
          value={
            account
              ? new Date(account.last_login).toLocaleString("en-US")
              : "Loading..."
          }
        />
        <Info label="Timezone" value={account?.timezone || "UTC"} />
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="font-semibold text-gray-400">{label}</span>
    <span className="text-right text-xs font-mono text-gray-300 max-w-[200px] truncate">
      {value}
    </span>
  </div>
);

export default AccountCard;
