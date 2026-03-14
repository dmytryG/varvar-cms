import {useEffect, useState} from "react";
import {APIService, type User} from "../services/APIService.ts";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

export function Header({strictAuth, toDashIfLoggedIn}: { strictAuth?: boolean, toDashIfLoggedIn?: boolean }) {
    const [user, setUser] = useState<User>();
    const navigate = useNavigate();

    useEffect(() => {
        const effect = async() =>
        {
            if (APIService.getCurrentUser) {
                setUser(APIService.getCurrentUser!)
                if (toDashIfLoggedIn) navigate("/admin/dashboard")
            } else {
                try {
                    await APIService.checkAuth()
                    setUser(APIService.getCurrentUser!)
                    if (toDashIfLoggedIn) navigate("/admin/dashboard")
                } catch (e) {
                    if (strictAuth) {
                        toast.error("You must be logged in to access this page")
                        navigate("/admin/login")
                    }
                }
            }
        }

        effect()
    }, [])

    async function logout() {
        try {
            await APIService.logout();
            setUser(undefined);
            navigate("/admin/login");
        } catch (e) {
            toast.error(`Failed to logout: ${(e as Error).message}`)
        }
    }


    return (
        <div>
            Varvar CMS
            {user?.email ? (
                <div>
                    Welcome {user.email} ({user.role})
                    <button onClick={(e) => {
                        e.preventDefault();
                        logout();
                    }}>Logout</button>
                </div>
            ) : <></>}
        </div>
    )
}