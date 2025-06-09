import React from "react";

const PaymentAlerts = ({ alerts }) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6 text-lg font-medium">
        ✅ No payment alerts.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-red-500 drop-shadow-md">
          ⚠️ Payment Alerts
        </h2>
      </header>
      <ul className="list-disc list-inside space-y-2 text-red-400 font-semibold bg-red-900/30 rounded-lg p-4 border border-red-700 shadow-md">
        {alerts.map((alert, idx) => (
          <li key={idx} className="hover:text-red-300 transition-colors">
            {alert.message}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PaymentAlerts;
