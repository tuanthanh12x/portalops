import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
  const [authStatus, setAuthStatus] = useState("unauthenticated");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAuthStatus("unauthenticated");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded?.project_id) {
        setAuthStatus("project_selected");
      } else {
        setAuthStatus("awaiting_project");
      }
    } catch {
      setAuthStatus("unauthenticated");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

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
    <div className="home-container min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-blue-900 text-white relative">
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

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-green-900 via-teal-900 to-blue-900 bg-opacity-80 backdrop-blur-md shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                GreenCloud
              </span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition duration-300">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition duration-300">Pricing</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition duration-300">Contact</a>

              {authStatus === "unauthenticated" && (
                <a href="/login" className="text-gray-300 hover:text-white transition duration-300">Login</a>
              )}

              {authStatus === "awaiting_project" && (
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Logout
                </button>
              )}

              {authStatus === "project_selected" && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24">
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
      <section id="features" className="py-16 px-4 md:px-8">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 md:px-8 bg-gradient-to-br from-green-900/50 to-teal-900/50">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
          Choose Your Resource Pack
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Starter Pack',
              price: '$8/mo',
              specs: ['1 vCPU', '2 GB RAM', '40 GB SSD', '1 TB Bandwidth']
            },
            {
              name: 'Pro Builder',
              price: '$18/mo',
              specs: ['2 vCPU', '4 GB RAM', '80 GB SSD', '2 TB Bandwidth']
            },
            {
              name: 'Enterprise Kit',
              price: '$45/mo',
              specs: ['4 vCPU', '8 GB RAM', '160 GB SSD', '5 TB Bandwidth']
            }
          ].map((pack, index) => (
            <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-green-800/50 to-teal-800/50 backdrop-blur-md hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50">
              <h3 className="text-2xl font-semibold text-green-300">{pack.name}</h3>
              <p className="mt-2 text-3xl font-bold text-white">{pack.price}</p>
              <ul className="mt-4 text-gray-300 space-y-1">
                {pack.specs.map((spec, i) => <li key={i}>{spec}</li>)}
              </ul>
              <button className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-400 hover:to-teal-400 transition-all duration-300">
                Build with {pack.name.split(' ')[0]}
              </button> 
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 text-center text-gray-300">
        <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
        <p>Email us at <a href="mailto:support@greencloud.com" className="underline text-teal-300">support@greencloud.com</a></p>
      </section>
    </div>
  );
};

export default Home;
