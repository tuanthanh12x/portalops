import React from "react";

const PaymentMethods = ({ methods }) => {
  if (!Array.isArray(methods) || methods.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-lg font-medium">
        ⚠️ No payment methods available.
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-indigo-400 drop-shadow-md">
          💳 Payment Methods
        </h2>
      </header>

      <ul className="space-y-3 text-gray-200 bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-gray-700">
        {methods.map((m) => (
          <li
            key={m.id}
            className="px-4 py-3 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-default"
          >
            <span className="font-semibold text-indigo-300">{m.type}</span>:{" "}
            <span>{m.details}</span>
          </li>
        ))}
      </ul>

      {/* Future: Add form here to add/edit payment methods */}
    </section>
  );
};

export default PaymentMethods;
