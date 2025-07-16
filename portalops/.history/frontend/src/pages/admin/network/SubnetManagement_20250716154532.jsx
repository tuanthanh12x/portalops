import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import hook để điều hướng
import Header from '../../../components/admin/Navbar';
import axiosInstance from "../../../api/axiosInstance";



// Button Component
function Button({ variant = "default", children, className = "", ...props }) {
    const base = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
    const variants = {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
        success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg",
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// Card Component
function Card({ children, className = "" }) {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="space-y-3">{children}</div>;
}

function CardTitle({ children, icon }) {
    return (
        <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-lg font-semibold text-gray-100">{children}</h3>
        </div>
    );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 text-xl"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// Input Component
function Input({ label, type = "text", value, onChange, placeholder, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={required}
            />
        </div>
    );
}

// Select Component
function Select({ label, value, onChange, options, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={required}
            >
                <option value="">Select {label}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
export function Tabs({ defaultValue, children }) {
    const [active, setActive] = useState(defaultValue);
    return (
        <div>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { active, setActive })
            )}
        </div>
    );
}

export function TabsList({ children }) {
    return (
        <div className="flex border-b border-gray-700 mb-8 space-x-0 overflow-x-auto">
            {children}
        </div>
    );
}

// TabsTrigger đã được sửa để chấp nhận prop 'onClick' cho việc điều hướng
export function TabsTrigger({ value, active, setActive, children, onClick }) {
    const isActive = active === value;

    const handleClick = () => {
        // Nếu có hàm onClick tùy chỉnh (để điều hướng), thì gọi nó
        if (onClick) {
            onClick();
        } else {
            // Nếu không, chỉ cập nhật state như bình thường
            setActive(value);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${isActive
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                }`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, active, children }) {
    return active === value ? <div className="animate-in fade-in duration-300">{children}</div> : null;
}
// Main Subnet Management Component
export default function SubnetManagement() {
    const [subnets, setSubnets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubnet, setSelectedSubnet] = useState(null);
    const navigate=useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        network_id: '',
        cidr: '',
        ip_version: '4',
        gateway_ip: '',
        enable_dhcp: true,
        description: ''
    });

    // Mock data for demonstration
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
      const response = await axiosInstance.get('openstack/network/subnet-list/');
          setSubnets(response.data);
            // Mock subnets data
            const mockSubnets = [
                {
                    id: "subnet-001",
                    name: "Production Subnet",
                    network_id: "net-001",
                    network_name: "Production Network",
                    cidr: "10.0.1.0/24",
                    ip_version: "4",
                    gateway_ip: "10.0.1.1",
                    enable_dhcp: true,
                    allocation_pools: [{ start: "10.0.1.10", end: "10.0.1.250" }],
                    dns_nameservers: ["8.8.8.8", "8.8.4.4"],
                    status: "active",
                    description: "Main production subnet"
                },
                {
                    id: "subnet-002",
                    name: "Development Subnet",
                    network_id: "net-002",
                    network_name: "Development Network",
                    cidr: "10.0.2.0/24",
                    ip_version: "4",
                    gateway_ip: "10.0.2.1",
                    enable_dhcp: true,
                    allocation_pools: [{ start: "10.0.2.10", end: "10.0.2.250" }],
                    dns_nameservers: ["8.8.8.8"],
                    status: "active",
                    description: "Development environment subnet"
                },
                {
                    id: "subnet-003",
                    name: "Testing Subnet",
                    network_id: "net-003",
                    network_name: "Testing Network",
                    cidr: "10.0.3.0/24",
                    ip_version: "4",
                    gateway_ip: "10.0.3.1",
                    enable_dhcp: false,
                    allocation_pools: [{ start: "10.0.3.10", end: "10.0.3.100" }],
                    dns_nameservers: [],
                    status: "inactive",
                    description: "Testing subnet with static IPs"
                }
            ];

            setTimeout(() => {
                setSubnets(mockSubnets);
                setLoading(false);
            }, 1000);
        };

        fetchData();
    }, []);


    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

            <Header />
     
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-lg">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Subnet Management
                </h1>
                <p className="text-gray-400 mt-1">Configure and manage network subnets</p>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <span>+</span>
              Create Subnet
            </Button>
          </div>
        </div>
      </header>
      
        
      <div className="px-6 lg:px-8 py-8">
       <TabsList>
                  <TabsTrigger
                   value="networks"
                    onClick={() => navigate('/admin/network')} 
                   >
                   📡 Networks
                  </TabsTrigger>
                  
                  <TabsTrigger
                    value="subnets"
                    onClick={() => navigate('/admin/subnet')} // Thay đổi '/admin/subnets' thành route bạn muốn
                  >
                    🔗 Subnets
                  </TabsTrigger>
                   <TabsTrigger
                    value="ports"
                    onClick={() => navigate('/admin/route')} // Thay đổi '/admin/subnets' thành route bạn muốn
                  >
                    🔌 Routes
                  </TabsTrigger>
                   <TabsTrigger
                    value="security"
                    onClick={() => navigate('/admin/security-group')} // Thay đổi '/admin/subnets' thành route bạn muốn
                  >
                    🛡️ Security Groups
                  </TabsTrigger>
                </TabsList>
        {/* Subnets Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  {[
                    { key: 'name', label: 'Subnet Name' },
                    { key: 'network', label: 'Network' },
                    { key: 'cidr', label: 'CIDR' },
                    { key: 'gateway', label: 'Gateway' },
                    { key: 'dhcp', label: 'DHCP' },
                    { key: 'status', label: 'Status' },
                    { key: 'actions', label: 'Actions' }
                  ].map(header => (
                    <th key={header.key} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                        <span className="text-gray-400">Loading subnets...</span>
                      </div>
                    </td>
                  </tr>
                ) : subnets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">🔗</div>
                        <p className="font-medium">No subnets found</p>
                        <p className="text-sm text-gray-600 mt-1">Create your first subnet to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  subnets.map((subnet) => (
                    <tr key={subnet.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-green-400 text-sm">🔗</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-200">{subnet.name}</span>
                            {subnet.description && (
                              <p className="text-xs text-gray-400 mt-1">{subnet.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                          {subnet.network_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                          {subnet.cidr}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-300">{subnet.gateway_ip}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subnet.enable_dhcp 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {subnet.enable_dhcp ? '● Enabled' : '○ Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subnet.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {subnet.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
         
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button 
    
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div >
  );
}