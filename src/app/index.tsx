import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import { router } from "@/app/router";
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
        <RouterProvider router={router} />
    </ConfigProvider>
);