import React, { useState } from "react";
import { Button, Menu } from "antd";
import {
    DesktopOutlined,
    PieChartOutlined,
    MailOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const Navbar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const items: MenuItem[] = [
        { key: "/", icon: <DesktopOutlined />, label: "Статистика" },
        { key: "/statistics_full", icon: <PieChartOutlined />, label: "Подробная Статистика" },
        { key: "/alerts", icon: <MailOutlined />, label: "Алерты" },
        { key: "/settings", icon: <SettingOutlined />, label: "Настройки" },
    ];

    return (
        <div
            id="navbar"
            className="left-0 fixed bg-[rgb(12,14,18)] h-screen p-2"
        >
            <Button
                variant="outlined"
                color="primary"
                onClick={toggleCollapsed}
                style={{ marginBottom: 16, borderRadius: 8, width: "100%" }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
                mode="inline"
                inlineCollapsed={collapsed}
                items={items}
                // ставим активный ключ в зависимости от текущего pathname
                selectedKeys={[location.pathname]}
                onClick={(e) => navigate(e.key)} // переход по клику
            />
        </div>
    );
};

export default Navbar;