import React, { useEffect, useRef } from 'react';

const FeatureCard = ({ title, description, delay }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in');
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="p-6 rounded-xl bg-gradient-to-br from-green-800/50 to-teal-800/50 backdrop-blur-md hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50 opacity-0"
      style={{ animationDelay: `${delay}s` }}
    >
      <h3 className="text-2xl font-semibold text-green-300">{title}</h3>
      <p className="mt-4 text-gray-300">{description}</p>
    </div>
  );
};

const Home = () => {
  useEffect(() => {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    const root = document.querySelector('.home-container');
    if (root) root.prepend(particlesContainer);
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${Math.random() * 5 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particlesContainer.appendChild(particle);
    }
    return () => particlesContainer.remove();
  }, []);

  return (
    <div className="home-container min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-900 text-white">
      <style>{`
        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        .particle {
          position: absolute;
          background: rgba(0, 255, 200, 0.5);
          border-radius: 50%;
          animation: float 10s infinite;
        }
        @keyframes float {
          0% { transform: translateY(0); opacity: 0.5; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0.5; }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500 animate-pulse">
          GreenCloud Builder
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl">
          Build your own VPS from flexible resource bundles. Total control. Maximum performance.
        </p>
        <button className="mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold text-lg hover:from-green-400 hover:to-teal-400 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/50">
          Explore Resource Packs
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
          Why Build with GreenCloud?
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="Flexible Resources"
            description="Mix and match CPU, RAM, and storage to create your perfect VPS environment."
            delay={0}
          />
          <FeatureCard
            title="Self-Service Control"
            description="Deploy and manage your own VPS anytime, without waiting or support tickets."
            delay={0.2}
          />
          <FeatureCard
            title="Developer-Friendly"
            description="API access and automation-ready infrastructure to streamline your workflow."
            delay={0.4}
          />
        </div>
      </section>

      {/* Resource Packages Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-green-900/50 to-teal-900/50">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
          Choose Your Resource Pack
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-800/50 to-teal-800/50 backdrop-blur-md hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50">
            <h3 className="text-2xl font-semibold text-green-300">Starter Pack</h3>
            <p className="mt-2 text-3xl font-bold text-white">$8/mo</p>
            <ul className="mt-4 text-gray-300">
              <li>1 vCPU</li>
              <li>2 GB RAM</li>
              <li>40 GB SSD</li>
              <li>1 TB Bandwidth</li>
            </ul>
            <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-400 hover:to-teal-400 transition-all duration-300">
              Build with Starter
            </button>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-800/50 to-teal-800/50 backdrop-blur-md hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50">
            <h3 className="text-2xl font-semibold text-green-300">Pro Builder</h3>
            <p className="mt-2 text-3xl font-bold text-white">$18/mo</p>
            <ul className="mt-4 text-gray-300">
              <li>2 vCPU</li>
              <li>4 GB RAM</li>
              <li>80 GB SSD</li>
              <li>2 TB Bandwidth</li>
            </ul>
            <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-400 hover:to-teal-400 transition-all duration-300">
              Build with Pro
            </button>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-800/50 to-teal-800/50 backdrop-blur-md hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50">
            <h3 className="text-2xl font-semibold text-green-300">Enterprise Kit</h3>
            <p className="mt-2 text-3xl font-bold text-white">$45/mo</p>
            <ul className="mt-4 text-gray-300">
              <li>4 vCPU</li>
              <li>8 GB RAM</li>
              <li>160 GB SSD</li>
              <li>5 TB Bandwidth</li>
            </ul>
            <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-400 hover:to-teal-400 transition-all duration-300">
              Build with Enterprise
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
