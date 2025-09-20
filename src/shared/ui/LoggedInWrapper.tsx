import React, { useEffect, useState } from 'react';
import Navbar from "./Navbar";

const LoggedInWrapper = ({ children }: any) => {
    const [navbarWidth, setNavbarWidth] = useState(0);

    useEffect(() => {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;

        const updateWidth = () => {
            setNavbarWidth(navbar.getBoundingClientRect().width);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(navbar);

        window.addEventListener("resize", updateWidth);
    }, []);

    return (
        <div className="w-screen flex ">
            <Navbar />
            <div
                className=" transition-all duration-30"
                style={{ marginLeft: navbarWidth, width: `calc(100% - ${navbarWidth+8}px)` }}
            >
                {children}
            </div>
        </div>
    );
};

export default LoggedInWrapper;