import {Navigate, Route, Routes} from "react-router-dom";
import SignUp from "./pages/auth/signup/SignUp";
import LoginPage from "./pages/auth/login/LoginPage.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import Sidebar from "./components/common/Sidebar.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import NotificationsPage from "./pages/notification/NotificationPage.tsx";
import RightPanel from "./components/common/RightPanel.tsx";
import {Toaster} from "react-hot-toast";
import {useQuery} from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.tsx";
import apiClient, {ApiError} from "./api/client.ts";
import type {User} from "./types/types.ts";

function App() {

    const {data: authUser, isLoading} = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const data = await apiClient.get<User | { errors?: unknown[] } | null>('/auth/me');
                if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
                    return null;
                }
                return data as User | null;
            } catch (e) {
                if (e instanceof ApiError && e.status === 401) {
                    return null;
                }
                console.error("Error fetching user data:", e);
                throw e;
            }
        },
        retry: false,
    })
    if (isLoading) {
        return (
            <div className='h-screen flex justify-center items-center'>
                <LoadingSpinner size='lg'/>
            </div>
        );
    }
    return (
        <div
            className="flex  mx-auto w-full  bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.35),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)]">
            <Toaster/>
            <Sidebar/>
            <Routes>
                <Route path="/" element={authUser ?  <HomePage/> : <Navigate to="/login"/>}/>
                <Route path="/login" element={authUser ? <Navigate to="/"/> : <LoginPage/>}/>
                <Route path="/signup" element={authUser ? <Navigate to="/"/> : <SignUp/>}/>
                <Route path="/profile/:username" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
                <Route path="/notifications" element={authUser ? <NotificationsPage/> : <Navigate to="/login"/>}/>
            </Routes>
            {authUser && <RightPanel/>}
        </div>
    )
}

export default App
