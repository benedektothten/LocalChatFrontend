import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useUserStore} from "../stores/userStore.ts";
import { useState } from 'react';
import Button from '@mui/material/Button';
import AvatarMenu from "./AvatarMenu.tsx";
import RegistrationModal from "./modals/RegistrationModal.tsx";


export default function Login() {
    const { selectUser, selectAvatarUrl, isLoggedIn, logoutUser} = useUserStore();
    const [showModal, setShowModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL!;
    console.log("Environment variables:", import.meta.env);

    const handleGoogleLogin = async (response) => {
        try {
            // Get the ID token from Google
            const idToken = response.credential;

            // Send the token to your backend for validation
            const res = await axios.post(`${backendUrl}/verify-token`, {
                token: idToken,
            });

            if(res && res.data){

                const { isNewUser, jwtToken} = res.data;
                selectUser(res.data.userId);
                selectAvatarUrl(res.data.avatarUrl);
                localStorage.setItem("authToken", jwtToken);
                localStorage.setItem("userId", res.data.userId);
                localStorage.setItem("avatarUrl", res.data.avatarUrl);


                if (isNewUser) {
                    //setIsNewUser(true);
                    setShowModal(true);
                }
            }
        } catch (err) {
            console.error("Error during login:", err);
        }
    };

    const handleLogout = () => {
        // Clear user data and remove token
        logoutUser(); // Clear user data from the store
        localStorage.removeItem("authToken"); // Clear auth token
        console.log("User logged out successfully!");
        setAnchorEl(null);
    };


    const handleRegister = async ({
                                      userName,
                                      displayName,
                                      password,
                                  }) => {
        try {
            const token = localStorage.getItem("authToken");

            await axios.patch(
                `${backendUrl}/api/users`,
                { userName, displayName, password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Registration successful!");
            //setIsNewUser(false); // Mark user as registered
        } catch (err) {
            console.error("Error during registration:", err);
        }
    };

    return (
        <div>
            {isLoggedIn ? (
                // Show the AvatarMenu for logged-in users
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <AvatarMenu />
                    <Button
                        sx={{
                            color: "white",
                            borderColor: "white", // Outline color
                            ":hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.15)", // Brighten background on hover
                                borderColor: "rgba(255, 255, 255, 0.5)", // Optional: Lighten border
                            },
                        }}
                        variant="outlined"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>


            ) : (
                // Show the login button/modal for logged-out users
                // Google Login Button for unlogged users
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log("Login Failed")}
                />
            )}


            <RegistrationModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onRegister={handleRegister}
            />

        </div>
    );
}