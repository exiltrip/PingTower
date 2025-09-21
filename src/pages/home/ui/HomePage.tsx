import { useEffect, useRef, useState } from "react";
import { Card, Spin, Alert, Space, Tooltip, Row, Col, Tag, Select, DatePicker, Divider, InputNumber } from "antd";
import { getStatusTimeline } from "../api/reports";
const { Option } = Select;
const { RangePicker } = DatePicker;
import dayjs from "dayjs";


const STATUS_COLORS = {
    UP: "#52c41a",
    PARTIAL: "#faad14",
    DOWN: "#ff4d4f",
    NO_DATA: "#8c8c8c",
};

const getStatusColor = (interval) => {
    if (interval >= 99) return STATUS_COLORS.UP;
    if (interval >= 50) return STATUS_COLORS.PARTIAL;
    return STATUS_COLORS.DOWN;
};

const HomePage = () => {
    const [timelineData, setTimelineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [range, setRange] = useState("30d");
    const [granularity, setGranularity] = useState("hour");
    const [checkId, setCheckId] = useState(null);
    const [customRange, setCustomRange] = useState(null);
    const [maxIntervals, setMaxIntervals] = useState(granularity === "hour" ? 168 : 90);

    const debounceRef = useRef(null);

    // Создаем массив рефов для каждого таймлайна
    const timelineRefs = useRef([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                granularity,
                max_intervals: maxIntervals,
                ...(checkId && { check_id: checkId }),
            };
            if (customRange) {
                params.startDate = customRange[0].toISOString();
                params.endDate = customRange[1].toISOString();
            } else {
                params.range = range;
            }

            const data = await getStatusTimeline(params);
            setTimelineData(data);
            setError(null);
        } catch (err) {
            setError(`Ошибка загрузки данных: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            loadData();
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [range, granularity, checkId, customRange, maxIntervals]);

    // Эффект для прокрутки, который срабатывает после загрузки данных
    useEffect(() => {
        // Проверяем, что данные загружены
        if (timelineData && timelineData.checks) {
            // Итерируем по всем рефам и прокручиваем каждый
            timelineRefs.current.forEach((ref) => {
                if (ref) {
                    ref.scrollLeft = ref.scrollWidth;
                }
            });
        }
    }, [timelineData]);

    if (loading || error) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                }}
            >
                {loading && <Spin size="large" />}
                {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
            </div>
        );
    }

    const checkOptions = timelineData.checks.map((check) => ({
        label: check.checkName,
        value: check.checkId,
    }));


    return (
        <Card
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: "12px 0" }}>
                    {/* Левая часть: фильтры */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 24 }}>Статистика</span>

                        {/* Первый ряд: периоды */}
                        <Space wrap align="center" size="middle">
                            <Space size={4} align="center">
                                <span>Период:</span>
                                <Select
                                    value={customRange ? undefined : range}
                                    onChange={setRange}
                                    disabled={!!customRange}
                                    style={{ width: 120 }}
                                    size="middle"
                                >
                                    <Option value="24h">24 часа</Option>
                                    <Option value="7d">7 дней</Option>
                                    <Option value="30d">30 дней</Option>
                                </Select>
                            </Space>

                            <Space size={4} align="center">
                                <span>Выбор периода:</span>
                                <RangePicker
                                    value={customRange}
                                    onChange={(dates) => setCustomRange(dates)}
                                    allowClear
                                    size="middle"
                                />
                            </Space>
                        </Space>

                        {/* Второй ряд: разбивка, ресурс, max intervals */}
                        <Space wrap align="center" size="middle">
                            <Space size={4} align="center">
                                <span>Разбивка:</span>
                                <Select value={granularity} onChange={setGranularity} style={{ width: 120 }} size="middle">
                                    <Option value="hour">Часовое</Option>
                                    <Option value="day">Дневное</Option>
                                </Select>
                            </Space>

                            <Space size={4} align="center">
                                <span>Ресурс:</span>
                                <Select
                                    allowClear
                                    placeholder="Все"
                                    value={checkId}
                                    onChange={setCheckId}
                                    style={{ width: 160 }}
                                    size="middle"
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            {checkId && (
                                                <div
                                                    style={{ display: "flex", alignItems: "center", padding: 8, cursor: "pointer" }}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => setCheckId(null)}
                                                >
                                                    Очистить фильтр
                                                </div>
                                            )}
                                        </>
                                    )}
                                    options={checkOptions}
                                />
                            </Space>

                            <Space>
                                <span>Максимум интервалов:</span>
                                <InputNumber
                                    min={1}
                                    max={720}
                                    value={maxIntervals}
                                    onChange={(value) => setMaxIntervals(Number(value) || 1)}
                                    style={{ width: 80 }}
                                />
                            </Space>
                        </Space>
                    </div>

                    {/* Правая часть: общий uptime */}
                    <div>
                        <Tag
                            color={getStatusColor(timelineData.overallUptimePercentage.toFixed(2))}
                            style={{ fontSize: 32, padding: "8px 16px", borderRadius: 8}}
                        >
                            {timelineData.overallUptimePercentage.toFixed(2)}%
                        </Tag>
                    </div>
                </div>
            }
            style={{ margin: 24 }}
        >
            {/* Общая информация */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <b>Период:</b> {new Date(timelineData.periodStart).toLocaleDateString()} — {new Date(timelineData.periodEnd).toLocaleDateString()}
                </Col>
                <Col span={8}>
                    <b>Интервалов:</b> {timelineData.totalIntervals}
                </Col>
            </Row>

            {/* Таймлайны каждого check */}
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {timelineData.checks.map((check, index) => {
                    if (!check) return null;

                    return (
                        <div key={index} style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 6,
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 18 }}>{check.checkName || `Check #${index + 1}`}</h3>
                                    {check.checkUrl && (
                                        <a
                                            href={check.checkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#1890ff" }}
                                        >
                                            {check.checkUrl}
                                        </a>
                                    )}
                                </div>
                                {check.overallUptimePercentage !== undefined && (
                                    <Tag color={getStatusColor(check.overallUptimePercentage)}>
                                        {check.overallUptimePercentage.toFixed(2)}%
                                    </Tag>
                                )}
                            </div>
                            <div
                                className="overflow-x-scroll"
                                style={{ display: "flex", gap: 4 }}
                                ref={(el) => (timelineRefs.current[index] = el)} // Используем функцию для привязки рефов
                            >
                                {check.intervals.map((interval, i) => (
                                    <Tooltip
                                        key={i}
                                        title={
                                            <div style={{ minWidth: 200 }}>
                                                <div><b>Статус:</b> {interval.status}</div>
                                                <div><b>Uptime:</b> {interval.uptimePercentage}%</div>
                                                <div><b>Всего проверок:</b> {interval.totalChecks}</div>
                                                <div><b>UP:</b> {interval.upChecks}</div>
                                                <div><b>DOWN:</b> {interval.downChecks}</div>
                                                <div><b>Средняя задержка:</b> {interval.avgLatencyMs} ms</div>
                                                <div><b>Инциденты:</b> {interval.incidentsCount}</div>
                                                <div>
                                                    <b>Период:</b>{" "}
                                                    {new Date(interval.startTime).toLocaleDateString()} —{" "}
                                                    {new Date(interval.endTime).toLocaleDateString()}
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div
                                            style={{
                                                minWidth: 12,
                                                height: 24,
                                                backgroundColor: STATUS_COLORS[interval.status] || "#d9d9d9",
                                                borderRadius: 2,
                                            }}
                                        />
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </Space>
        </Card>
    );
};

export default HomePage;