import React from 'react';
import { motion } from 'framer-motion';
import './InstancesTable.css';

const InstancesTable = ({ instances }) => {
  const tableVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="relative"
      variants={tableVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-3xl font-bold text-white mb-6 font-fantasy holographic-text">
        My Instances
      </h2>
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl shadow-2xl p-4 overflow-x-auto futuristic-table">
        <div className="absolute inset-0 neon-glow" />
        <div className="absolute inset-0 particle-bg">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-4 bg-gray-900/50 text-white font-fantasy text-sm p-4 rounded-t-xl">
            <div>Name</div>
            <div>Status</div>
            <div>IP</div>
            <div>Flavor</div>
            <div>Region</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-purple-900/50">
            {instances.length === 0 ? (
              <div className="text-center p-6 text-gray-300 font-fantasy holographic-text">
                No instances found.
              </div>
            ) : (
              instances.map((instance, index) => (
                <motion.div
                  key={instance.id}
                  className="grid grid-cols-7 gap-4 p-4 hover:bg-purple-900/30 transition-colors duration-300"
                  variants={rowVariants}
                  custom={index}
                >
                  <div className="text-white data-stream">{instance.name}</div>
                  <div
                    className={`text-sm data-stream ${
                      instance.status.toLowerCase() === 'online'
                        ? 'text-cyan-400'
                        : 'text-pink-400'
                    }`}
                  >
                    <span className="status-badge">{instance.status}</span>
                  </div>
                  <div className="text-white data-stream">{instance.ip}</div>
                  <div className="text-gray-300 data-stream">
                    {instance.plan || '-'}
                  </div>
                  <div className="text-white data-stream">{instance.region}</div>
                  <div className="text-gray-300 data-stream">
                    {new Date(instance.created).toLocaleString()}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      className="bg-cyan-500 text-white px-3 py-1 rounded text-xs shadow-neon"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Power On
                    </motion.button>
                    <motion.button
                      className="bg-pink-500 text-white px-3 py-1 rounded text-xs shadow-neon"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Shut Down
                    </motion.button>
                    <motion.button
                      className="bg-purple-500 text-white px-3 py-1 rounded text-xs shadow-neon"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Console
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstancesTable;