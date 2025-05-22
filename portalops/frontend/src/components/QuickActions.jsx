export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl">Create new Instance</button>
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl">Add Block Storage</button>
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl">View Billing</button>
      </div>
    </div>
  );
}
