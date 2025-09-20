import {Suspense, lazy} from "react";
import {createBrowserRouter} from "react-router-dom";
import Loading from "@/shared/ui/Loading";
import DeepStatisticsPage from "../../pages/deepStatistics/ui/DeepStatisticsPage";
import LoggedInWrapper from "../../shared/ui/LoggedInWrapper";

const HomePage = lazy(() => import("@/pages/home/ui/HomePage"));
const LoginPage = lazy(() => import("@/pages/auth/ui/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/ui/RegisterPage"));
const AlertsPage = lazy(() => import("@/pages/alerts/ui/AlertsPage"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <Suspense fallback={<Loading/>}>
                <LoggedInWrapper>
                    <HomePage/>
                </LoggedInWrapper>
            </Suspense>
        ),
    },
    {
        path: "/login",
        element: (
            <Suspense fallback={<Loading/>}>
                <LoginPage/>
            </Suspense>
        ),
    },
    {
        path: "/register",
        element: (
            <Suspense fallback={<Loading/>}>
                <RegisterPage/>
            </Suspense>
        ),
    },
    {
        path: "/statistics_full",
        element: (
            <Suspense fallback={<Loading/>}>
                <LoggedInWrapper>
                    <DeepStatisticsPage/>
                </LoggedInWrapper>
            </Suspense>
        ),
    },
    {
        path: "/alerts",
        element: (
            <Suspense fallback={<Loading/>}>
                <LoggedInWrapper>
                    <AlertsPage/>
                </LoggedInWrapper>
            </Suspense>
        ),
    },
]);