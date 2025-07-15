// mockData.js
export const mockProjects = [
    {
        id: "proj-001",
        name: "Web Frontend",
        description: "Frontend application servers",
        status: "Active",
        created: "2024-01-15",
        package: "Standard",
        pricing: {
            monthly: 299,
            currency: "USD"
        },
        resources: {
            instances: 3,
            vcpus: 12,
            memory: "24 GB",
            storage: "500 GB",
            networks: 2,
            floatingIPs: 2
        },
        usage: {
            cpu: 65,
            memory: 78,
            storage: 45
        },
        region: "us-east-1"
    },
    {
        id: "proj-002", 
        name: "Database Cluster",
        description: "MySQL cluster for production",
        status: "Active",
        created: "2024-02-20",
        package: "Premium",
        pricing: {
            monthly: 599,
            currency: "USD"
        },
        resources: {
            instances: 5,
            vcpus: 20,
            memory: "80 GB", 
            storage: "2 TB",
            networks: 3,
            floatingIPs: 1
        },
        usage: {
            cpu: 45,
            memory: 82,
            storage: 67
        },
        region: "us-west-2"
    },
    {
        id: "proj-003",
        name: "Development Environment",
        description: "Development and testing environment",
        status: "Suspended",
        created: "2024-03-10",
        package: "Basic",
        pricing: {
            monthly: 99,
            currency: "USD"
        },
        resources: {
            instances: 1,
            vcpus: 4,
            memory: "8 GB",
            storage: "100 GB", 
            networks: 1,
            floatingIPs: 1
        },
        usage: {
            cpu: 25,
            memory: 35,
            storage: 28
        },
        region: "eu-central-1"
    }
];

export const packageOptions = [
    { name: "Basic", price: 99, vcpus: 4, memory: "8 GB", storage: "100 GB", color: "bg-blue-500" },
    { name: "Standard", price: 299, vcpus: 12, memory: "24 GB", storage: "500 GB", color: "bg-purple-500" },
    { name: "Premium", price: 599, vcpus: 20, memory: "80 GB", storage: "2 TB", color: "bg-orange-500" },
    { name: "Enterprise", price: 1299, vcpus: 40, memory: "160 GB", storage: "5 TB", color: "bg-red-500" },
];