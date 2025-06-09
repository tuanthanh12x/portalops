import React from "react";

const InvoicesList = ({ invoices, onSelectInvoice }) => {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 text-lg font-medium">
        🚫 No invoices found.
      </div>
    );
  }

  return (
    <section className="mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          📄 Invoices
        </h2>
      </header>

      <div className="overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-200">
          <thead className="bg-gray-800 uppercase text-xs tracking-wider text-gray-300">
            <tr>
              <th className="px-6 py-3 text-left font-semibold cursor-default">Invoice ID</th>
              <th className="px-6 py-3 text-left font-semibold cursor-default">Date</th>
              <th className="px-6 py-3 text-left font-semibold cursor-default">Status</th>
              <th className="px-6 py-3 text-left font-semibold cursor-default">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoices.map((inv) => {
              const statusLower = inv.status.toLowerCase();
              const statusColor =
                statusLower === "paid"
                  ? "bg-green-800 text-green-300"
                  : statusLower === "pending"
                  ? "bg-yellow-800 text-yellow-300"
                  : "bg-red-800 text-red-300";

              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv.id)}
                  className="hover:bg-gray-900/30 transition-colors cursor-pointer"
                  title={`Click to view invoice ${inv.id}`}
                >
                  <td className="px-6 py-4 font-medium">{inv.id}</td>
                  <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">${inv.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InvoicesList;
