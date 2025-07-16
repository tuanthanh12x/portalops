// Custom UI Components
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Tabs Component
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
  return <div className="flex border-b border-gray-300 mb-4 space-x-2">{children}</div>;
}

export function TabsTrigger({ value, active, setActive, children }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors duration-200 ${
        isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children }) {
  return active === value ? <div>{children}</div> : null;
}

// Card Component
export function Card({ children }) {
  return <div className="bg-white rounded-xl shadow-md p-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="space-y-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold text-gray-800">{children}</h3>;
}

// Button Component
export function Button({ variant = "default", children, ...props }) {
  const base = "px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>;
}

// Main Page Component
export default function NetworkDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Network Management</h1>
        <div className="space-x-2">
          <Link to="/network/routers">
            <Button variant="secondary">Manage Routers</Button>
          </Link>
          <Link to="/network/ips">
            <Button variant="secondary">Floating IPs</Button>
          </Link>
          <Link to="/network/topology">
            <Button variant="secondary">View Topology</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <CardTitle>Total Networks</CardTitle>
            <p className="text-2xl font-semibold mt-2">23</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CardTitle>Floating IPs</CardTitle>
            <p className="text-2xl font-semibold mt-2">78 / 200</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CardTitle>Active Routers</CardTitle>
            <p className="text-2xl font-semibold mt-2">6</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Section */}
      <Tabs defaultValue="networks">
        <TabsList>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="subnets">Subnets</TabsTrigger>
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="security">Security Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="networks">
          <div className="mt-4">
            <p className="text-muted-foreground">Network table coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="subnets">
          <div className="mt-4">
            <p className="text-muted-foreground">Subnet list coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="ports">
          <div className="mt-4">
            <p className="text-muted-foreground">Port table coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="mt-4">
            <p className="text-muted-foreground">Security groups will be listed here...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}