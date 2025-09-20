import React, {Suspense, lazy} from "react";
import {createBrowserRouter} from "react-router-dom";
import Loading from "@/shared/ui/Loading";

const HomePage = lazy(() => import("@/pages/home/ui/HomePage"));
const LoginPage = lazy(() => import("@/pages/login/ui/LoginPage"));

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
        path: "/about",
        element: (
            <Suspense fallback={<Loading/>}>
                <LoginPage/>
            </Suspense>
        ),
    },
]);