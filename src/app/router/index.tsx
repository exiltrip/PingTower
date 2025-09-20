import React, {Suspense, lazy} from "react";
import {createBrowserRouter} from "react-router-dom";
import Loading from "@/shared/ui/Loading";
import DeepStatisticsPage from "../../pages/deepStatistics/ui/DeepStatisticsPage";

const HomePage = lazy(() => import("@/pages/home/ui/HomePage"));
const LoginPage = lazy(() => import("@/pages/login/ui/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/register/ui/RegisterPage"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <Suspense fallback={<Loading/>}>
                <HomePage/>
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
                <DeepStatisticsPage/>
            </Suspense>
        ),
    },
]);