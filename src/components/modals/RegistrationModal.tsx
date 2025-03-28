import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface RegistrationModalProps {
    open: boolean; // Controls modal visibility
    onClose: () => void; // Handles modal close action
    onRegister: (userData: { userName: string; displayName: string; password: string }) => Promise<void>; // Handles registration logic
}

export default function RegistrationModal({
    open,
    onClose,
    onRegister,
}: RegistrationModalProps) {
    const [userName, setUserName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onRegister({ userName, displayName, password });
            onClose(); // Close modal after successful registration
        } catch (err) {
            console.error("Error during registration:", err);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="registration-modal-title"
            aria-describedby="registration-modal-description"
        >
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    backgroundColor: "white",
                    padding: 20,
                    border: "2px solid #000",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
                }}
            >
                <h2 id="registration-modal-title">Complete Your Profile</h2>
                <form onSubmit={handleFormSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </Modal>
    );
}