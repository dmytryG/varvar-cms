import React, {useEffect, useState} from "react";
import {APIService, type User} from "../services/apiService.ts";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export function SideMenu() {
    const [version, setVersion] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        const getVersion = async () => {
            const version = await APIService.version()
            setVersion(version)
        }

        getVersion();
    }, []);

    return (
        <div className={'side-menu-box'}>
            <Link to={'/admin/dashboard'}>Dashboard</Link>
            <Link to={'/admin/projects'}>Projects</Link>
            <Link to={'/admin/user-management'}>User management</Link>
            <span>BE version: {version}</span>
        </div>
    )
}