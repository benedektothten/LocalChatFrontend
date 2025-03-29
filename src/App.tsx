import {FormEvent, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import ButtonAppBar from './components/AppBar';
import ChatList from './components/ChatList';
import ChatContent from './components/ChatContent';
import { useUserStore } from './stores/userStore';
import './App.css'
import {useChatRoomStore} from "./stores/chatRoomStore.ts";
import ChatRoomAdder from "./components/ChatRoomAdder";
import axios from "axios";

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL!;

function App() {
    const [sessionRestored, setSessionRestored] = useState(false); // Track session restoration
    const [showMenu, toogleMenu] = useState(true);
    const { selectUser, selectAvatarUrl, isLoggedIn } = useUserStore();
    const { selectedChatRoomId } = useChatRoomStore();
    const { fetchChatRooms } = useChatRoomStore();


    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("authToken");
            const userId = localStorage.getItem("userId");
            const avatarUrl = localStorage.getItem("avatarUrl");

            if (token && userId) {
                try {
                    const res = await axios.get(`${backendUrl}/validate-token`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.status === 200) {
                        selectUser(Number(userId));
                        selectAvatarUrl(avatarUrl || "");
                        fetchChatRooms(Number(userId));
                    } else {
                        // Remove invalid session
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("userId");
                        localStorage.removeItem("avatarUrl");
                    }
                } catch (err) {
                    console.error("Token validation failed, logging out...");
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("avatarUrl");
                }
            }

            setSessionRestored(true); // Mark session restoration as complete
        };

        restoreSession();
    }, [selectUser, selectAvatarUrl]);

    if (!sessionRestored) {
        return <div>Loading session...</div>;
    }

    return (
        <div
            style={{
                display: "flex", // Flexbox layout
                flexDirection: "column", // AppBar and ChatList are side by side in a row
                height: "100vh", // Full viewport height
            }}
        >
            {/* AppBar */}
            <div
                style={{
                    width: "100vh", // Full height to align with the viewport
                    flexShrink: 0,
                    minHeight: "65px"
                }}
            >
                <ButtonAppBar
                    title="Welcome to LocalChat!"
                    showMenu={showMenu}
                    toogleMenu={toogleMenu}
                />
            </div>
            <Grid container spacing={2}>
                <Grid size={4}>
                    {showMenu && (
                        <div
                            style={{
                                marginTop: "60px"
                            }}
                        >
                            <ChatList sessionRestored={sessionRestored} />
                            {isLoggedIn && (
                                <ChatRoomAdder />
                            )}
                        </div>
                    )}
                </Grid>
                <Grid size={8}>
                    {isLoggedIn && selectedChatRoomId &&(
                        <ChatContent />
                    )}
                </Grid>
            </Grid>
        </div>

    )
}

export default App
