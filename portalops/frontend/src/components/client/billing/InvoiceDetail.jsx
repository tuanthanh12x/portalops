import React from "react";

const InvoiceDetail = ({ invoice }) => {
  if (!invoice)
    return (
      <div className="text-center text-gray-400 py-10 text-lg font-medium">
        Select an invoice to see details
      </div>
    );

  return (
    <section className="mx-auto px-4 py-10 max-w-5xl">
      <header className="mb-6">
        <h2 className="text-4xl font-bold tracking-tight text-indigo-400 drop-shadow-md">
          🧾 Invoice Detail: {invoice.id}
        </h2>
        <p className="text-gray-300 mt-1">
          Date: {new Date(invoice.date).toLocaleDateString()}
        </p>
        <p className="text-gray-300">
          Status:{" "}
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              invoice.status.toLowerCase() === "paid"
                ? "bg-green-800 text-green-300"
                : invoice.status.toLowerCase() === "pending"
                ? "bg-yellow-800 text-yellow-300"
                : "bg-red-800 text-red-300"
            }`}
          >
            {invoice.status}
          </span>
        </p>
        <p className="text-gray-300 mt-1 font-semibold">
          Total: ${invoice.total.toFixed(2)}
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-200">
          <thead className="bg-gray-800 uppercase text-xs tracking-wider text-gray-300">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Service</th>
              <th className="px-6 py-3 text-left font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left font-semibold">Unit Price</th>
              <th className="px-6 py-3 text-left font-semibold">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoice.items.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-900/30 transition-colors cursor-default"
              >
                <td className="px-6 py-4">{item.service}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">${item.unit_price.toFixed(2)}</td>
                <td className="px-6 py-4">${item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InvoiceDetail;
