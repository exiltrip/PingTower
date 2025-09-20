import React, {useEffect, useState, useCallback} from "react";
import {
    Card,
    Select,
    Table,
    Row,
    Col,
    Form,
    Input,
    Button,
    message,
    Tooltip as AntdTooltip,
    Modal,
    Space,
    Radio,
    ColorPicker,
    Divider,
} from "antd";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";
import {api} from "@/shared/api/privateApi";
import {
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import LoadingMini from "../../../shared/ui/LoadingMini";
import {LineType} from "recharts/types/chart/types";

const useLocalStorage = <T, >(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue] as const;
};

type ChartType = "LineChart" | "BarChart" | "AreaChart" | "PieChart";
type ChartSettings = {
    type: ChartType;
    lineColor: string;
    dynamicColoring: boolean;
};

const checkTypeOptions = [
    {
        value: "http",
        label: "HTTP/HTTPS",
        description: "Проверка доступности сайта или API",
    },
    {
        value: "tcp",
        label: "TCP",
        description: "Проверка TCP-подключения (например, база данных)",
    },
    {
        value: "ping",
        label: "Ping (ICMP)",
        description: "Проверка сетевой доступности по ICMP",
    },
];

const DeepStatisticsPage: React.FC = () => {
    const [checks, setChecks] = useState<any[]>([]);
    const [selectedCheck, setSelectedCheck] = useState<number | "all">("all");
    const [historyMap, setHistoryMap] = useState<Record<number, any[]>>({});
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [editingCheck, setEditingCheck] = useState<any | null>(null);
    const [editForm] = Form.useForm();

    const [latencyChartSettings, setLatencyChartSettings] =
        useLocalStorage<ChartSettings>("latencyChartSettings", {
            type: "LineChart",
            lineColor: "#56B3F4",
            dynamicColoring: true,
        });
    const [successChartSettings, setSuccessChartSettings] =
        useLocalStorage<ChartSettings>("successChartSettings", {
            type: "LineChart",
            lineColor: "#98d8ad",
            dynamicColoring: true,
        });
    const [lineType, setLineType] = useLocalStorage<LineType>(
        "lineType",
        "monotone"
    );

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
            setHistoryMap((prev) => ({...prev, [checkId]: res.data.data}));
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
            title: "Удалить проверку?",
            content: "Это действие необратимо и удалит всю историю выполнения.",
            okText: "Удалить",
            okType: "danger",
            cancelText: "Отмена",
            onOk: async () => {
                try {
                    await api.delete(`/api/v1/checks/${checkId}`);
                    message.success("Проверка удалена");
                    fetchChecks();
                } catch (e) {
                    console.error(e);
                    message.error("Ошибка при удалении");
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
            message.success("Проверка обновлена");
            setIsEditModalVisible(false);
            fetchChecks();
        } catch (e) {
            console.error(e);
            message.error("Ошибка при обновлении");
        }
    };

    const getLatencyColor = (value: number) => {
        if (value < 100) return "#98d8ad";
        if (value < 500) return "#ffd700";
        return "#ff8c8c";
    };

    const getSuccessColor = (value: number) => {
        if (value === 1) return "#98d8ad";
        return "#ff8c8c";
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const reorderedChecks = Array.from(checks);
        const [removed] = reorderedChecks.splice(result.source.index, 1);
        reorderedChecks.splice(result.destination.index, 0, removed);

        setChecks(reorderedChecks);
    };

    const renderChart = (
        chartSettings: ChartSettings,
        dataKey: string,
        history: any[],
        yDomain?: [number, number],
        yTicks?: number[]
    ) => {
        const commonProps = {
            data: history,
            margin: {top: 5, right: 30, left: 20, bottom: 5},
        };

        let dynamicYDomain: [number, number] | undefined;
        if (dataKey === 'latencyMs' && history.length > 0) {
            const values = history.map((item) => item.latencyMs);
            const minVal = Math.min(...values);
            const maxVal = Math.max(...values);
            const range = maxVal - minVal;
            const padding = range * 0.1;
            dynamicYDomain = [
                Math.max(0, minVal - padding),
                maxVal + padding,
            ];
        } else {
            dynamicYDomain = yDomain;
        }


        const commonAxisProps = () => (
            <>
                <XAxis
                    dataKey="createdAt"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis width={40} domain={dynamicYDomain} ticks={yTicks}/>
                <Tooltip
                    labelFormatter={(t) => new Date(t).toLocaleString()}
                    wrapperStyle={{
                        backgroundColor: "rgb(12, 14, 18)",
                        border: "1px solid #25272A",
                        borderRadius: "8px",
                    }}
                    contentStyle={{
                        backgroundColor: "rgb(12, 14, 18)",
                        border: "1px solid #25272A",
                        borderRadius: "8px",
                    }}
                    labelStyle={{color: "#d1d5db"}}
                />
                <Legend/>
            </>
        );

        const commonDataProps = {
            dataKey: dataKey,
            stroke: chartSettings.lineColor,
            strokeWidth: 3,
            name: dataKey.replace("Ms", " (ms)").replace("successRate", "Success Rate"),
        };

        if (chartSettings.type === "PieChart") {
            const successfulChecks = history.filter(
                (item) => item.successRate === 1
            ).length;
            const failedChecks = history.length - successfulChecks;
            const pieData = [
                {name: "Успешно", value: successfulChecks, color: getSuccessColor(1)},
                {name: "Неуспешно", value: failedChecks, color: getSuccessColor(0)},
            ];
            return (
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color}/>
                        ))}
                    </Pie>
                    <Tooltip/>
                    <Legend/>
                </PieChart>
            );
        }

        const renderBaseChart = (
            ChartComponent: any,
            DataComponent: any,
            strokeColor: string
        ) => (
            <ChartComponent {...commonProps}>
                {commonAxisProps()}
                {chartSettings.dynamicColoring ? (
                    <DataComponent
                        data={history.map((entry) => ({
                            ...entry,
                            color:
                                dataKey === "latencyMs"
                                    ? getLatencyColor(entry.latencyMs)
                                    : getSuccessColor(entry.successRate),
                        }))}
                        dataKey={dataKey}
                        strokeWidth={3}
                        isAnimationActive={false}
                        type={lineType}
                        dot={({stroke, ...rest}: any) => {
                            const color =
                                dataKey === "latencyMs"
                                    ? getLatencyColor(rest.payload.latencyMs)
                                    : getSuccessColor(rest.payload.successRate);
                            return <circle {...rest} stroke={color} fill={color} r={2}/>;
                        }}
                        stroke={commonDataProps.stroke}
                    >
                        {history.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                stroke={
                                    dataKey === "latencyMs"
                                        ? getLatencyColor(entry.latencyMs)
                                        : getSuccessColor(entry.successRate)
                                }
                            />
                        ))}
                    </DataComponent>
                ) : (
                    <DataComponent
                        {...commonDataProps}
                        type={lineType}
                        fill={strokeColor}
                        dot={{r: 2}}
                    />
                )}
            </ChartComponent>
        );

        switch (chartSettings.type) {
            case "LineChart":
                return (
                    <LineChart {...commonProps}>
                        {commonAxisProps()}
                        <Line
                            type={lineType}
                            {...commonDataProps}
                            dot={{r: 1}}
                            activeDot={{r: 2}}
                        />
                    </LineChart>
                );
            case "BarChart":
                return (
                    <BarChart {...commonProps}>
                        {commonAxisProps()}
                        <Bar {...commonDataProps} fill={chartSettings.lineColor}>
                            {history.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        chartSettings.dynamicColoring
                                            ? dataKey === "latencyMs"
                                                ? getLatencyColor(entry.latencyMs)
                                                : getSuccessColor(entry.successRate)
                                            : chartSettings.lineColor
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                );
            case "AreaChart":
                return (
                    <AreaChart {...commonProps}>
                        {commonAxisProps()}
                        <Area
                            type={lineType}
                            {...commonDataProps}
                            fill={chartSettings.lineColor}>
                            {history.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        chartSettings.dynamicColoring
                                            ? dataKey === "latencyMs"
                                                ? getLatencyColor(entry.latencyMs)
                                                : getSuccessColor(entry.successRate)
                                            : chartSettings.lineColor
                                    }
                                />
                            ))}
                        </Area>
                    </AreaChart>
                );
            default:
                return null;
        }
    };

    const renderCheckCard = (check: any) => {
        const history = historyMap[check.id] || [];
        const columns = [
            {
                title: "Time",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (t: string) => new Date(t).toLocaleString(),
            },
            {title: "Status", dataIndex: "status", key: "status"},
            {title: "Code", dataIndex: "statusCode", key: "statusCode"},
            {title: "Latency (ms)", dataIndex: "latencyMs", key: "latencyMs"},
        ];
        const processedHistory = history
            .map((h) => ({
                ...h,
                successRate: h.success ? 1 : 0,
            }))
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

        return (
            <Card
                key={check.id}
                title={check.name}
                extra={
                    <div className="flex gap-2">
                        <Button type="primary" onClick={() => openEditModal(check)}>
                            <EditOutlined style={{fontSize: "1rem"}}/>
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={() => handleDeleteCheck(check.id)}
                        >
                            <DeleteOutlined style={{fontSize: "1rem"}}/>
                        </Button>
                    </div>
                }
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Card size="small" title="Latency (ms)">
                            <ResponsiveContainer width="100%" height={250}>
                                {renderChart(
                                    latencyChartSettings,
                                    "latencyMs",
                                    processedHistory
                                )}
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" title="Успешность (1 - Success, 0 - Fail)">
                            <ResponsiveContainer width="100%" height={250}>
                                {renderChart(
                                    successChartSettings,
                                    "successRate",
                                    processedHistory,
                                    [0, 1],
                                    [0, 1]
                                )}
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
                <Card size="small" title="История проверок" style={{marginTop: 16}}>
                    <Table
                        rowKey="id"
                        dataSource={history}
                        columns={columns}
                        pagination={{pageSize: 5}}
                    />
                </Card>
            </Card>
        );
    };

    const visibleChecks =
        selectedCheck === "all"
            ? checks
            : checks.filter((c) => c.id === selectedCheck);

    return (
        <div style={{padding: 24}}>
            <Card title="Создать новую проверку" style={{marginBottom: 24}}>
                <Form layout="inline" onFinish={handleCreateCheck}>
                    <Form.Item
                        name="name"
                        rules={[{required: true, message: "Введите имя"}]}
                    >
                        <Input placeholder="Имя"/>
                    </Form.Item>
                    <Form.Item
                        name="type"
                        rules={[{required: true, message: "Выберите тип"}]}
                    >
                        <Select placeholder="Тип проверки" style={{width: 200}}>
                            {checkTypeOptions.map((opt) => (
                                <Select.Option key={opt.value} value={opt.value}>
                                    <AntdTooltip title={opt.description}>
                                        {opt.label}
                                    </AntdTooltip>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target"
                        rules={[{required: true, message: "Введите target"}]}
                    >
                        <Input placeholder="Target (URL/host)"/>
                    </Form.Item>
                    <Form.Item name="interval" initialValue={300}>
                        <Input placeholder="Интервал (сек)" type="number"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={creating}>
                            Создать
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card style={{marginBottom: 24}}>
                <div className="w-full flex justify-between items-center">
                    <Select
                        style={{width: 400}}
                        placeholder="Фильтр проверок"
                        onChange={(id) => setSelectedCheck(id)}
                        value={selectedCheck}
                    >
                        <Select.Option key="all" value="all">
                            Все проверки
                        </Select.Option>
                        {checks.map((check) => (
                            <Select.Option key={check.id} value={check.id}>
                                {check.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="primary"
                        icon={<SettingOutlined/>}
                        onClick={() => setIsSettingsModalVisible(true)}
                    >
                        Настройки графиков
                    </Button>
                </div>
            </Card>

            {loading ? (
                <LoadingMini/>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="checks-droppable" direction="horizontal">
                        {(provided) => (
                            <div
                                className={`grid grid-cols-1 lg:grid-cols-2 ${
                                    selectedCheck !== "all" && "!grid-cols-1"
                                } gap-6`}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {visibleChecks.map((check, index) => (
                                    <Draggable
                                        key={check.id}
                                        draggableId={String(check.id)}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                {renderCheckCard(check)}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            <Modal
                title="Редактировать проверку"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateCheck}>
                    <Form.Item
                        name="name"
                        label="Имя"
                        rules={[{required: true, message: "Введите имя"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Тип проверки"
                        rules={[{required: true, message: "Выберите тип"}]}
                    >
                        <Select>
                            {checkTypeOptions.map((opt) => (
                                <Select.Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target"
                        label="Target (URL/host)"
                        rules={[{required: true, message: "Введите target"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item name="interval" label="Интервал (сек)">
                        <Input type="number"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full">
                            Обновить
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Настройки графиков"
                open={isSettingsModalVisible}
                onCancel={() => setIsSettingsModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical">
                    <Divider orientation="left">
                        Настройки для графика Latency
                    </Divider>
                    <Form.Item label="Тип графика">
                        <Select
                            value={latencyChartSettings.type}
                            onChange={(value) =>
                                setLatencyChartSettings({...latencyChartSettings, type: value})
                            }
                        >
                            <Select.Option value="LineChart">Линейный</Select.Option>
                            <Select.Option value="BarChart">Столбчатый</Select.Option>
                            <Select.Option value="AreaChart">Областной</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Включить динамическую подсветку">
                        <Radio.Group
                            onChange={(e) =>
                                setLatencyChartSettings({
                                    ...latencyChartSettings,
                                    dynamicColoring: e.target.value,
                                })
                            }
                            value={latencyChartSettings.dynamicColoring}
                        >
                            <Radio value={true}>Да</Radio>
                            <Radio value={false}>Нет</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {!latencyChartSettings.dynamicColoring && (
                        <Form.Item label="Цвет">
                            <ColorPicker
                                value={latencyChartSettings.lineColor}
                                onChange={(color) =>
                                    setLatencyChartSettings({
                                        ...latencyChartSettings,
                                        lineColor: color.toHexString(),
                                    })
                                }
                            />
                        </Form.Item>
                    )}

                    <Divider orientation="left">
                        Настройки для графика Успешности
                    </Divider>
                    <Form.Item label="Тип графика">
                        <Select
                            value={successChartSettings.type}
                            onChange={(value) =>
                                setSuccessChartSettings({...successChartSettings, type: value})
                            }
                        >
                            <Select.Option value="LineChart">Линейный</Select.Option>
                            <Select.Option value="BarChart">Столбчатый</Select.Option>
                            <Select.Option value="AreaChart">Областной</Select.Option>
                            <Select.Option value="PieChart">Круговая</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Включить динамическую подсветку">
                        <Radio.Group
                            onChange={(e) =>
                                setSuccessChartSettings({
                                    ...successChartSettings,
                                    dynamicColoring: e.target.value,
                                })
                            }
                            value={successChartSettings.dynamicColoring}
                        >
                            <Radio value={true}>Да</Radio>
                            <Radio value={false}>Нет</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {!successChartSettings.dynamicColoring && (
                        <Form.Item label="Цвет">
                            <ColorPicker
                                value={successChartSettings.lineColor}
                                onChange={(color) =>
                                    setSuccessChartSettings({
                                        ...successChartSettings,
                                        lineColor: color.toHexString(),
                                    })
                                }
                            />
                        </Form.Item>
                    )}

                    <Divider orientation="left">Общие настройки линий</Divider>
                    <Form.Item label="Тип линии">
                        <Radio.Group
                            onChange={(e) => setLineType(e.target.value as LineType)}
                            value={lineType}
                        >
                            <Radio.Button value="monotone">Сглаженная</Radio.Button>
                            <Radio.Button value="linear">Прямая</Radio.Button>
                            <Radio.Button value="stepAfter">Ступенчатая</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DeepStatisticsPage;