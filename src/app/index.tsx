import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import {ConfigProvider, theme} from "antd";
import { SnackbarProvider } from 'notistack';
import { router } from "@/app/router";
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
            token: {
                colorPrimary: '#56B3F4',
                colorText: '#DBDBDC',
                colorTextSecondary: '#595959',
                colorBgContainer: 'rgb(12,14,18)',
                colorBorder: '#25272A',
                borderRadius: 24,
                boxShadow: 'none',
            },
            components: {
                Menu: {
                    itemSelectedBg: '#56B3F4',
                    itemSelectedColor: "#fff",
                    itemBorderRadius: 8,
                },
                Button: {
                    primaryShadow: 'none',
                    primaryColor: '#FFF',
                    colorPrimary: '#56B3F4',
                    colorPrimaryBg: '#56B3F4',
                },
                Card: {
                    colorBorderSecondary: '#25272A'
                }
            },
        }}>
                    <RouterProvider router={router} />
        </ConfigProvider>
    </SnackbarProvider>
);