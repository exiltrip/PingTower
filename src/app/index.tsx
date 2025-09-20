import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import { SnackbarProvider } from 'notistack';
import { router } from "@/app/router";
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
            <RouterProvider router={router} />
        </ConfigProvider>
    </SnackbarProvider>
);