import React from "react";

const PaymentHistory = ({ payments }) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-lg font-medium">
        🧾 No payment history available.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-indigo-400 drop-shadow-md">
          🧾 Payment History
        </h2>
      </header>
      <div className="overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-200">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {["Payment ID", "Date", "Amount", "Method", "Status"].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-900/30 transition">
                <td className="px-6 py-4 font-medium">{p.id}</td>
                <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">${p.amount.toFixed(2)}</td>
                <td className="px-6 py-4">{p.method}</td>
                <td className="px-6 py-4">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PaymentHistory;
