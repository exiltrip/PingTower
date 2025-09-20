import React, { useEffect, useState } from "react";
import { Card, Typography, Select, Table, Row, Col, Spin, Form, Input, Button, message, Tooltip as AntdTooltip, Modal } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { api } from "@/shared/api/privateApi";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Loading from "../../../shared/ui/Loading";
import LoadingMini from "../../../shared/ui/LoadingMini";

const { Title } = Typography;
const { confirm } = Modal;

const checkTypeOptions = [
  { value: "http", label: "HTTP/HTTPS", description: "Проверка доступности сайта или API" },
  { value: "tcp", label: "TCP", description: "Проверка TCP-подключения (например, база данных)" },
  { value: "ping", label: "Ping (ICMP)", description: "Проверка сетевой доступности по ICMP" },
];

const DeepStatisticsPage: React.FC = () => {
  const [checks, setChecks] = useState<any[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<number | "all">("all");
  const [historyMap, setHistoryMap] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchChecks = async () => {
    try {
      const res = await api.get("/api/v1/checks");
      setChecks(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (checkId: number) => {
    try {
      const res = await api.get(`/api/v1/checks/${checkId}/history`);
      setHistoryMap((prev) => ({ ...prev, [checkId]: res.data.data }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  useEffect(() => {
    if (checks.length === 0) return;

    const loadHistories = async () => {
      setLoading(true);
      try {
        if (selectedCheck === "all") {
          await Promise.all(checks.map((c) => fetchHistory(c.id)));
        } else if (typeof selectedCheck === "number") {
          await fetchHistory(selectedCheck);
        }
      } finally {
        setLoading(false);
      }
    };
    loadHistories();
  }, [checks, selectedCheck]);

  const handleCreateCheck = async (values: any) => {
    setCreating(true);
    try {
      await api.post("/api/v1/checks", values);
      message.success("Проверка успешно создана");
      fetchChecks();
    } catch (e) {
      console.error(e);
      message.error("Ошибка при создании проверки");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCheck = (checkId: number) => {
    confirm({
      title: 'Удалить проверку?',
      content: 'Это действие необратимо и удалит всю историю выполнения.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await api.delete(`/api/v1/checks/${checkId}`);
          message.success('Проверка удалена');
          fetchChecks();
        } catch (e) {
          console.error(e);
          message.error('Ошибка при удалении');
        }
      },
    });
  };

  const handleUpdateCheck = async (checkId: number, values: any) => {
    try {
      await api.put(`/api/v1/checks/${checkId}`, values);
      message.success('Проверка обновлена');
      fetchChecks();
    } catch (e) {
      console.error(e);
      message.error('Ошибка при обновлении');
    }
  };

  const renderCheckCard = (check: any) => {
    const history = historyMap[check.id] || [];
    const successCount = history.filter((h) => h.success).length;
    const failCount = history.length - successCount;

    const pieData = [
      { name: "Success", value: successCount },
      { name: "Fail", value: failCount },
    ];
    const COLORS = ["#52c41a", "#f5222d"];

    const columns = [
      { title: "Time", dataIndex: "createdAt", key: "createdAt", render: (t: string) => new Date(t).toLocaleString() },
      { title: "Status", dataIndex: "status", key: "status" },
      { title: "Code", dataIndex: "statusCode", key: "statusCode" },
      { title: "Latency (ms)", dataIndex: "latencyMs", key: "latencyMs" },
    ];

    return (
        <Card
            key={check.id}
            title={check.name}
            extra={
              <div className="flex gap-2">
                <Button type="primary" onClick={() => handleUpdateCheck(check.id, check)}><EditOutlined style={{fontSize: "1rem"}}/></Button>
                <Button type="primary" danger onClick={() => handleDeleteCheck(check.id)}><DeleteOutlined style={{fontSize: "1rem"}}/></Button>
              </div>
            }
            style={{ marginBottom: 24 }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Card size="small" title="Latency (ms) во времени">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="createdAt" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="latencyMs" stroke="#1890ff" dot={false} name="Latency" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col span={8}>
              <Card size="small" title="Успешность">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="История проверок" style={{ marginTop: 16 }}>
            <Table rowKey="id" dataSource={history} columns={columns} pagination={{ pageSize: 5 }} />
          </Card>
        </Card>
    );
  };

  return (
      <div style={{ padding: 24 }}>

        <Card title="Создать новую проверку" style={{ marginBottom: 24 }}>
          <Form layout="inline" onFinish={handleCreateCheck}>
            <Form.Item name="name" rules={[{ required: true, message: "Введите имя" }]}>
              <Input placeholder="Имя" />
            </Form.Item>
            <Form.Item name="type" rules={[{ required: true, message: "Выберите тип" }]}>
              <Select placeholder="Тип проверки" style={{ width: 200 }}>
                {checkTypeOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      <AntdTooltip title={opt.description}>{opt.label}</AntdTooltip>
                    </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="target" rules={[{ required: true, message: "Введите target" }]}>
              <Input placeholder="Target (URL/host)" />
            </Form.Item>
            <Form.Item name="interval" initialValue={300}>
              <Input placeholder="Интервал (сек)" type="number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={creating}>
                Создать
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Фильтр чеков */}
        <Card style={{ marginBottom: 24 }}>
          <Select
              style={{ width: 400 }}
              placeholder="Фильтр проверок"
              onChange={(id) => setSelectedCheck(id)}
              value={selectedCheck}
          >
            <Select.Option key="all" value="all">Все проверки</Select.Option>
            {checks.map((check) => (
                <Select.Option key={check.id} value={check.id}>{check.name}</Select.Option>
            ))}
          </Select>
        </Card>

        {loading ? (
            <LoadingMini />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedCheck === "all"
                  ? checks.map((check) => renderCheckCard(check))
                  : checks.filter((c) => c.id === selectedCheck).map((check) => renderCheckCard(check))}
            </div>
        )}
      </div>
  );
};

export default DeepStatisticsPage;
