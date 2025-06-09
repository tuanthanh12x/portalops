import React from "react";

const BillingOverview = ({ data }) => {
  return (
    <section className="mx-auto px-4 py-10 max-w-4xl">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          💳 Billing Overview
        </h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Summary</h3>
          <div className="space-y-3 text-gray-200 text-base">
            <div>
              Total Revenue:{" "}
              <strong className="text-green-400">
                ${data.total_revenue.toFixed(2)}
              </strong>
            </div>
            <div>
              Outstanding Balance:{" "}
              <strong className="text-red-400">
                ${data.outstanding_balance.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Revenue Chart (Last 7 Days)
          </h3>
          {/* Placeholder for chart component */}
          <ul className="text-gray-200 text-sm space-y-1 max-h-48 overflow-auto">
            {data.recent_revenue_chart.map((item, idx) => (
              <li key={idx} className="hover:text-indigo-400 transition-colors">
                {item.date}:{" "}
                <span className="font-semibold">${item.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BillingOverview;
