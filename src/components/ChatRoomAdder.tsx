import React, { useState, useEffect } from "react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import {useUserStore} from "../stores/userStore.ts";
import {useChatRoomStore} from "../stores/chatRoomStore.ts";

export default function ChatRoomAdder() {
    const [open, setOpen] = useState(false);
    const [chatRoomName, setChatRoomName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const {userId, isLoggedIn} = useUserStore();
    const {fetchChatRooms } = useChatRoomStore();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL!;

    // Fetch users upon modal open
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                const response = await axios.get(`${backendUrl}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsers(response.data);
                // Add the current user
                setSelectedUserIds(selectedUserIds.concat(userId));
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchUsers();
        }
    }, [open]);

    const handleCheckboxChange = (userId) => {
        setSelectedUserIds((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId]
        );
    };

    const createChatRoom = async () => {
        if (!chatRoomName.trim()) {
            alert("Please enter a chat room name.");
            return;
        }

        setCreatingRoom(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(
                `${backendUrl}/api/chatrooms`,
                {
                    name: chatRoomName,
                    isPrivate: selectedUserIds.length > 0,
                    membersToAdd: selectedUserIds
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOpen(false);
            setChatRoomName("");
            setSelectedUserIds([]);
            fetchChatRooms(userId);
        } catch (err) {
            console.error("Error creating chat room:", err);

        } finally {
            setCreatingRoom(false);
        }
    };

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        border: "2px solid #000",
        borderRadius: "8px",
        boxShadow: 24,
        p: 4
    };

    return (
        <>
            {/* Floating Button */}
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpen}
                sx={{
                    position: "absolute",
                    bottom: "2rem",
                    left: "2.5rem", // Not fully in the corner
                }}
            >
                <AddIcon />
            </Fab>

            {/* Modal */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6" component="h2" marginBottom={2}>
                        Create a New Chat Room
                    </Typography>
                    <TextField
                        id="chat-room-name"
                        label="Chat Room Name"
                        variant="outlined"
                        fullWidth
                        value={chatRoomName}
                        onChange={(e) => setChatRoomName(e.target.value)}
                        margin="normal"
                    />

                    <Typography variant="subtitle1" marginTop={2} marginBottom={1}>
                        Select Members
                    </Typography>

                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <List>
                            {users.map((user) => (
                                <ListItem
                                    key={user.userId}
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.userId)}
                                        onChange={() => handleCheckboxChange(user.userId)}
                                        disabled={user.userId === userId}
                                    />
                                    <Avatar
                                        alt={user.displayName}
                                        src={user.avatarUrl || "https://via.placeholder.com/150"}
                                    />
                                    <Typography>{user.displayName}</Typography>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={createChatRoom}
                        disabled={creatingRoom}
                        sx={{ marginTop: 2 }}
                    >
                        {creatingRoom ? "Creating…" : "Create Chat Room"}
                    </Button>
                </Box>
            </Modal>
        </>
    );
};