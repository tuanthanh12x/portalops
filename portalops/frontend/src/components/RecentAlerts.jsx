export default function RecentAlerts() {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
      <ul className="list-disc list-inside space-y-1 text-red-600">
        <li>System Maintenance</li>
        <li>Low Credits Warning</li>
      </ul>
    </div>
  );
}
