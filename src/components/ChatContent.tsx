import { useState, useEffect, useRef } from "react";
import {
    Box,
    Paper,
    Avatar,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Dialog
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternate";
import GifBoxIcon from '@mui/icons-material/GifBox';
import { useChatRoomStore } from "../stores/chatRoomStore";
import { useUserStore } from "../stores/userStore";
import { chatRoomService } from "../services/chatRoomService"; // Import the service
import { signalRService } from "../services/signalRChatService"; // Import SignalR service
import debounce from "lodash.debounce";
import { Gif } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from "@giphy/react-components";
import GifRenderer from "./GifRenderer.tsx"
import GifSelector from "./modals/GifSelector";


interface ChatMessage{
    id: number;
    text: string;
    sender: string;
    avatar: string;
    isgif: boolean;
}

interface ChatContentProps {
    userId: number
}

const giphyApiKey = import.meta.env.VITE_REACT_APP_GIPHY_API_KEY!;

function ChatContent() {
    const {userId, isLoggedIn} = useUserStore();
    const {
        messages,
        userAvatars,
        selectedChatRoomId,
        chatRoomMessagesLoading,
        error,
        fetchChatRoomMessages,
        addSlimMessageToChatRoom
    } = useChatRoomStore();
    const [newMessage, setNewMessage] = useState("");
    const [gifDialogOpen, setGifDialogOpen] = useState(false); // State for GIF selector dialog
    const [gf] = useState(new GiphyFetch(giphyApiKey));
    const [selectedGif, setSelectedGif] = useState(null);

    const debouncedFetchChatRoomMessages = debounce((chatRoomId, userId) => {
        fetchChatRoomMessages(chatRoomId, userId);
    }, 300); // Debounce by 300ms

    useEffect(() => {
        if (selectedChatRoomId !== null) {
            debouncedFetchChatRoomMessages(selectedChatRoomId, userId);
        }

        return () => debouncedFetchChatRoomMessages.cancel(); // Clean up debounce on unmount
    }, [selectedChatRoomId, userId]);


    // Reference to messages list for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Automatically scroll to the bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Handle sending new message
    const handleSend = async (gifId?: string) => {
        const contentToSend = gifId || newMessage.trim(); // Use the passed GIF ID or default to the message
        console.log("Sending message:", contentToSend);
        if (!contentToSend || !selectedChatRoomId) return;

        try {
            // Call the backend to send the message
            await chatRoomService.sendMessage({
                chatRoomId: selectedChatRoomId,
                senderId: userId,
                content: contentToSend,
                isGif: !!gifId, // Mark it as a GIF if selected
            });

            // Clear the input field
            setNewMessage("");
            setSelectedGif(null);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleGifSelect = (gifId: string) => {
        handleSend(gifId); // Send the selected GIF ID
        setGifDialogOpen(false); // Close the GIF selector
    };


    // Connect to SignalR and join the selected chat room
    useEffect(() => {
        async function initializeSignalR() {
            if (selectedChatRoomId) {
                try {
                    // Prevent multiple SignalR connections
                    if (!signalRService.connection || signalRService.connection.state === "Disconnected") {
                        await signalRService.connect();
                    }

                    // Listen for incoming messages
                    signalRService.onReceiveMessage(( messageId, chatRoomId, senderId, userName, messageContent, isGif) => {
                        if(messageContent){
                            addSlimMessageToChatRoom(chatRoomId, messageId, senderId, userName, messageContent, isGif);
                        }
                    });

                    // Join the chat room
                    await signalRService.joinChatRoom(selectedChatRoomId.toString());
                } catch (err) {
                    console.error("Error initializing SignalR:", err);
                }
            }

            return () => {
                // Leave the chat room and disconnect on component unmount
                if (selectedChatRoomId) {
                    signalRService.leaveChatRoom(selectedChatRoomId.toString());
                }
                signalRService.disconnect();
            };
        }

        initializeSignalR();
    }, [selectedChatRoomId, fetchChatRoomMessages, userId]);

    // Handle loading state
    if (chatRoomMessagesLoading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle error state
    if (error) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column", // Ensures vertical alignment
                height: "100vh", // Full viewport height
                width: "100%",
                backgroundColor: "#f4f4f4",
            }}
        >
            {/* Messages List */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end", // Messages start from the bottom
                }}
            >
                {messages.map((message) => {
                        const avatarEntry = userAvatars.find((avatar) => avatar.userId === message.senderId);
                        const avatarUrl = avatarEntry?.avatarUrl;

                        return (
                        <Paper
                            key={message.messageId}
                            elevation={2}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                                p: 1,
                                borderRadius: 2,
                                maxWidth: "75%",
                                backgroundColor: message.sender === "Me" ? "#e0f7fa" : "#fff",
                                alignSelf: message.sender === "Me" ? "flex-end" : "flex-start",
                                position: "relative",
                                ":hover .reply-button": {
                                    opacity: 1, // Show reply button on hover
                                },
                            }}
                        >
                            {/* Avatar */}
                            <Avatar
                                alt={message.senderUsername}
                                src={avatarUrl} // Dynamically resolve avatar
                                sx={{
                                    bgcolor: avatarUrl ? "transparent" : "#1976d2", // Fallback if no avatar is found
                                    mr: 2,
                                }}
                            >
                                {!avatarUrl
                                    ? message.senderUsername.slice(0, 2).toUpperCase() // Default initials if no avatar
                                    : null}
                            </Avatar>


                            {/* Message Content */}
                            {message.isGif ? (
                                <GifRenderer gifId={message.content} />
                            ) : (
                                <Typography variant="body1" sx={{ wordWrap: "break-word" }}>
                                    {message.content}
                                </Typography>
                            )}

                            {/* Reply Button (appears on hover) */}
                            <IconButton
                                className="reply-button"
                                size="small"
                                sx={{
                                    position: "absolute",
                                    right: -30,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    bgcolor: "#e0e0e0",
                                    opacity: 0,
                                    transition: "opacity 0.3s",
                                    borderRadius: "50%",
                                    ":hover": {
                                        bgcolor: "#c0c0c0",
                                    },
                                }}
                            >
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    )
                }

                )}
                <div ref={messagesEndRef}></div>
            </Box>

            {/* Input to send new messages */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderTop: "1px solid #ddd",
                    backgroundColor: "#fff",
                    position: "sticky", // Stick the input box to the bottom
                    bottom: 0, // Position fixed to bottom
                    zIndex: 1, // Ensure it's above other content
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSend(); // Trigger send message function
                            e.preventDefault(); // Prevent newline in TextField
                        }
                    }}
                    sx={{
                        mr: 2,
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={() => setGifDialogOpen(true)}
                    aria-label="send gif"
                >
                    <GifBoxIcon />
                </IconButton>

                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={!newMessage.trim()} // Disable button if input is empty
                >
                    Send
                </Button>
            </Box>
            {/* Use GifSelector Component */}
            <GifSelector
                open={gifDialogOpen}
                onClose={() => setGifDialogOpen(false)}
                onSelectGif={handleGifSelect}
            />

        </Box>
    );
}

export default ChatContent;