import React from 'react';

const InstancesTable = ({ instances }) => {
  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold text-gray-200 mb-4 font-fantasy">
        My Instances
      </h2>
      <div className="bg-[#1a1a2e] rounded shadow p-4 overflow-x-auto border border-[#2c2c3e]">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-4 bg-[#2c2c3e] text-gray-300 text-sm p-3 rounded-t">
            <div>Name</div>
            <div>Status</div>
            <div>IP</div>
            <div>Flavor</div>
            <div>Region</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-[#33344a]">
            {instances.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                No instances found.
              </div>
            ) : (
              instances.map((instance) => (
                <div
                  key={instance.id}
                  className="grid grid-cols-7 gap-4 p-3 hover:bg-[#26263b] transition-colors"
                >
                  <div className="text-gray-200">{instance.name}</div>
                  <div
                    className={
                      instance.status.toLowerCase() === 'online'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {instance.status}
                  </div>
                  <div className="text-gray-300">{instance.ip}</div>
                  <div className="text-gray-300">{instance.plan || '-'}</div>
                  <div className="text-gray-300">{instance.region}</div>
                  <div className="text-gray-300">
                    {new Date(instance.created).toLocaleString()}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button className="bg-[#3a3a5e] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#50507b] transition-colors">
                      Power On
                    </button>
                    <button className="bg-[#333350] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#46466a] transition-colors">
                      Shut Down
                    </button>
                    <button className="bg-[#2d2d4a] text-gray-200 px-3 py-1 rounded text-xs hover:bg-[#42425f] transition-colors">
                      Console
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstancesTable;
