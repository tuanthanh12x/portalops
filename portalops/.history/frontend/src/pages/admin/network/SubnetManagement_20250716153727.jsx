import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Descriptions, Tag, Spin, Alert } from 'antd';
import axios from 'axios'; // Hoặc axiosInstance của bạn

// Giả lập axiosInstance nếu bạn chưa có
const axiosInstance = axios.create({
  baseURL: 'https://your-api-base-url.com/', // Thay thế bằng URL cơ sở của bạn
  // Các cấu hình khác của axios...
});

// --- COMPONENT CHÍNH ---
const SubnetListPage = () => {
  // --- State Management ---
  const [subnets, setSubnets] = useState([]); // State để lưu danh sách subnet
  const [loading, setLoading] = useState(true); // State cho trạng thái loading
  const [error, setError] = useState(null); // State để xử lý lỗi
  const [isModalVisible, setIsModalVisible] = useState(false); // State để ẩn/hiện modal
  const [selectedSubnet, setSelectedSubnet] = useState(null); // State cho subnet được chọn

  // --- Data Fetching ---
  useEffect(() => {
    const fetchSubnets = async () => {
      try {
        setLoading(true);
        // Thay thế mock data bằng lời gọi API thật
        const response = await axiosInstance.get('openstack/network/subnet-list/');
        // Giả sử API trả về một mảng trực tiếp. Nếu nó được bọc trong một đối tượng (vd: response.data.results), hãy điều chỉnh cho phù hợp.
        setSubnets(response.data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi fetch subnet:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubnets();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component được mount

  // --- Event Handlers ---
  const showDetailsModal = (subnet) => {
    setSelectedSubnet(subnet);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedSubnet(null); // Xóa dữ liệu khi đóng modal
  };

  // --- Table Columns Definition ---
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
    },
    {
      title: 'IP Version',
      dataIndex: 'ip_version',
      key: 'ip_version',
      render: (version) => (
        <Tag color={version === 6 ? 'blue' : 'green'}>{`IPv${version}`}</Tag>
      ),
      filters: [
        { text: 'IPv4', value: 4 },
        { text: 'IPv6', value: 6 },
      ],
      onFilter: (value, record) => record.ip_version === value,
    },
    {
      title: 'Gateway IP',
      dataIndex: 'gateway_ip',
      key: 'gateway_ip',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => showDetailsModal(record)}>
          View Details
        </Button>
      ),
    },
  ];

  // --- Render Logic ---
  if (loading) {
    return <Spin tip="Loading Subnets..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <>
      {/* Bảng hiển thị danh sách Subnet */}
      <Table
        columns={columns}
        dataSource={subnets}
        rowKey="id" // Sử dụng 'id' làm key duy nhất cho mỗi hàng
        loading={loading}
      />

      {/* Modal hiển thị chi tiết Subnet */}
      {selectedSubnet && (
        <Modal
          title={`Subnet Details: ${selectedSubnet.name}`}
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={[
            <Button key="close" onClick={handleModalCancel}>
              Close
            </Button>,
          ]}
          width={800} // Tăng chiều rộng modal để hiển thị tốt hơn
        >
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedSubnet.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedSubnet.name}</Descriptions.Item>
            <Descriptions.Item label="CIDR">{selectedSubnet.cidr}</Descriptions.Item>
            <Descriptions.Item label="IP Version">{`IPv${selectedSubnet.ip_version}`}</Descriptions.Item>
            <Descriptions.Item label="Gateway IP">{selectedSubnet.gateway_ip}</Descriptions.Item>
            <Descriptions.Item label="DHCP Enabled">{selectedSubnet.enable_dhcp ? 'Yes' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Network ID">{selectedSubnet.network_id}</Descriptions.Item>
            <Descriptions.Item label="Project ID">{selectedSubnet.project_id}</Descriptions.Item>
            <Descriptions.Item label="Allocation Pools">
              {selectedSubnet.allocation_pools.map((pool, index) => (
                <div key={index}>{`${pool.start} - ${pool.end}`}</div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="DNS Nameservers">
                {selectedSubnet.dns_nameservers.length > 0 ? selectedSubnet.dns_nameservers.join(', ') : 'N/A'}
            </Descriptions.Item>
             <Descriptions.Item label="Host Routes">
                {selectedSubnet.host_routes.length > 0 ? selectedSubnet.host_routes.join(', ') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </>
  );
};

export default SubnetListPage;