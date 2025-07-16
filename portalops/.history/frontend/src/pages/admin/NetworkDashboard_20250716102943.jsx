import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
          <div className="mt-4">{/* Network list table placeholder */}
            <p className="text-muted-foreground">Network table coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="subnets">
          <div className="mt-4">{/* Subnet list placeholder */}
            <p className="text-muted-foreground">Subnet list coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="ports">
          <div className="mt-4">{/* Ports list placeholder */}
            <p className="text-muted-foreground">Port table coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="mt-4">{/* Security group rules placeholder */}
            <p className="text-muted-foreground">Security groups will be listed here...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
