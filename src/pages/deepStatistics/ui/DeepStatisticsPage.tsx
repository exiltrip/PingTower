import React, { useEffect, useState } from "react";
import { Card, Select, Table, Row, Col, Form, Input, Button, message, Tooltip as AntdTooltip, Modal } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "@/shared/api/privateApi";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import LoadingMini from "../../../shared/ui/LoadingMini";


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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCheck, setEditingCheck] = useState<any | null>(null);
  const [editForm] = Form.useForm();

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
    Modal.confirm({
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

  const openEditModal = (check: any) => {
    setEditingCheck(check);
    editForm.setFieldsValue(check);
    setIsEditModalVisible(true);
  };

  const handleUpdateCheck = async (values: any) => {
    if (!editingCheck) return;
    try {
      await api.put(`/api/v1/checks/${editingCheck.id}`, values);
      message.success('Проверка обновлена');
      setIsEditModalVisible(false);
      fetchChecks();
    } catch (e) {
      console.error(e);
      message.error('Ошибка при обновлении');
    }
  };

  const renderCheckCard = (check: any) => {
    const history = historyMap[check.id] || [];

    const columns = [
      { title: "Time", dataIndex: "createdAt", key: "createdAt", render: (t: string) => new Date(t).toLocaleString() },
      { title: "Status", dataIndex: "status", key: "status" },
      { title: "Code", dataIndex: "statusCode", key: "statusCode" },
      { title: "Latency (ms)", dataIndex: "latencyMs", key: "latencyMs" },
    ];

    const processedHistory = history.map(h => ({
      ...h,
      successRate: h.success ? 1 : 0,
    })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const allSuccess = processedHistory.length > 0 && processedHistory.every(h => h.successRate === 1);
    const allFail = processedHistory.length > 0 && processedHistory.every(h => h.successRate === 0);

    let successStrokeColor: string;
    const solidSuccessColor = "#98d8ad";
    const solidFailColor = "#ff8c8c";

    if (allSuccess) {
      successStrokeColor = solidSuccessColor;
    } else if (allFail) {
      successStrokeColor = solidFailColor;
    } else {
      successStrokeColor = `url(#colorSuccess-${check.id})`;
    }


    const tooltipWrapperStyle = {
      backgroundColor: 'rgb(12, 14, 18)',
      border: '1px solid #25272A',
      borderRadius: '8px',
    };

    const tooltipTextStyle = {
      // backgroundColor: 'rgb(17,19,27)',
      // border: '1px solid #25272A',
      // borderRadius: '8px',
      color: '#d1d5db'
    };

    return (
        <Card
            key={check.id}
            title={check.name}
            extra={
              <div className="flex gap-2">
                <Button type="primary" onClick={() => openEditModal(check)}><EditOutlined style={{fontSize: "1rem"}}/></Button>
                <Button type="primary" danger onClick={() => handleDeleteCheck(check.id)}><DeleteOutlined style={{fontSize: "1rem"}}/></Button>
              </div>
            }
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Latency (ms)">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={processedHistory}>
                    <XAxis dataKey="createdAt" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip
                        labelFormatter={(t) => new Date(t).toLocaleString()}
                        wrapperStyle={tooltipWrapperStyle}
                        contentStyle={tooltipWrapperStyle}
                        labelStyle={tooltipTextStyle}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="latencyMs"
                        stroke={"#56B3F4"}
                        strokeWidth={3}
                        dot={{r: 1}}
                        activeDot={{ r: 2 }}
                        name="Latency"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Успешность (1 - Success, 0 - Fail)">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={processedHistory}>
                    <defs>
                      <linearGradient id={`colorSuccess-${check.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff8c8c" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#98d8ad" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="createdAt" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis domain={[0, 1]} ticks={[0, 1]} />
                    <Tooltip
                        labelFormatter={(t) => new Date(t).toLocaleString()}
                        wrapperStyle={tooltipWrapperStyle}
                        contentStyle={tooltipWrapperStyle}
                        labelStyle={tooltipTextStyle}
                    />
                    <Legend />
                    <Line
                        type="stepAfter"
                        dataKey="successRate"
                        stroke={successStrokeColor}
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Success Rate"
                    />
                  </LineChart>
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
            <div className={`grid grid-cols-1 lg:grid-cols-2 ${selectedCheck !== "all" && "!grid-cols-1"} gap-6`}>
              {selectedCheck === "all"
                  ? checks.map((check) => renderCheckCard(check))
                  : checks.filter((c) => c.id === selectedCheck).map((check) => renderCheckCard(check))}
            </div>
        )}

        <Modal
            title="Редактировать проверку"
            open={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
        >
          <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateCheck}
          >
            <Form.Item name="name" label="Имя" rules={[{ required: true, message: "Введите имя" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Тип проверки" rules={[{ required: true, message: "Выберите тип" }]}>
              <Select>
                {checkTypeOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="target" label="Target (URL/host)" rules={[{ required: true, message: "Введите target" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="interval" label="Интервал (сек)">
              <Input type="number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Обновить
              </Button>
            </Form.Item>
          </Form>
        </Modal>

      </div>
  );
};

export default DeepStatisticsPage;