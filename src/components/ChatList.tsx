import * as React from "react";
import { useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useChatRoomStore } from "../stores/chatRoomStore"; // Import Zustand store
import { useUserStore} from "../stores/userStore.ts"; // Import Zustand shallow equality checker
import { signalRService } from "../services/signalRChatService.ts";

interface ChatListProps {
    sessionRestored: boolean; // Indicates if the session has been restored
}


export default function ChatList({ sessionRestored }: ChatListProps) {
    const { chatRooms, chatListLoading, error, fetchChatRooms } = useChatRoomStore();
    const { userId, isLoggedIn } = useUserStore();

    useEffect(() => {
        // Fetch chat rooms on mount and when userId changes
        if (sessionRestored && userId) {
            fetchChatRooms(userId);
        }

        // Subscribe to the SignalR "ChatRoomCreated" event
        const handleChatRoomCreated = (newChatRoom) => {
            console.log("New chat room created:", newChatRoom);
            fetchChatRooms(userId); // Refresh chat rooms list
        };

        // Ensure SignalR connection and set up the listener
        const initializeSignalR = async () => {
            try {
                if (!signalRService.connection || signalRService.connection.state === "Disconnected") {
                    await signalRService.connect();
                }
                signalRService.connection?.off("ChatRoomCreated");
                signalRService.connection?.on("ChatRoomCreated", handleChatRoomCreated);
            } catch (err) {
                console.error("Error setting up SignalR connection:", err);
            }
        };

        initializeSignalR();

        // Cleanup SignalR listener on component unmount
        return () => {
            signalRService.connection?.off("ChatRoomCreated", handleChatRoomCreated);
        };
    }, [sessionRestored, fetchChatRooms, userId]);


    if(userId === null || !isLoggedIn){
        return <Typography color="info">Login to see chat topics</Typography>;
    }
    if (chatListLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <List
            sx={{ width: "100%", transition: "width 0.4s", bgcolor: "background.paper" }}
        >
            {chatRooms.map((chatRoom) => (
                <React.Fragment key={chatRoom.chatRoomId}>
                    <ListItem
                        alignItems="flex-start"
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "lightgrey",
                            },
                        }}
                        onClick={() => useChatRoomStore.getState().selectChatRoom(chatRoom.chatRoomId)}
                    >
                        <ListItemAvatar>
                            <Avatar alt={chatRoom.name} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={chatRoom.name}
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ color: "text.primary", display: "inline" }}
                                    >
                                        {chatRoom.latestMessage?.senderUsername || "Unknown"}
                                    </Typography>
                                    {" — "}
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{
                                            display: "-webkit-box", // Enables truncating
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            WebkitLineClamp: 2, // Limits to 2 lines
                                        }}
                                    >
                                        {chatRoom.latestMessage
                                            ? chatRoom.latestMessage.isGif
                                                ? "Gif" // Show "Gif" if it's a GIF
                                                : chatRoom.latestMessage.content // Show the text otherwise
                                            : "No messages yet"}

                                    </Typography>

                                </React.Fragment>
                            }
                        />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </React.Fragment>
            ))}
        </List>
    );
}