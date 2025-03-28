import axios from "axios";

// Define interfaces for type safety
export interface ChatRoom {
    chatRoomId: number;
    name: string;
    isPrivate: boolean;
    createdAt: string;
    latestMessage?: {
        messageId: number;
        content: string;
        sentAt: string;
        senderId: number;
        senderUsername: string;
        isGif: boolean;
    };
}

export interface CreateChatRoomRequest {
    name: string;
    isPrivate: boolean;
}

export interface SendMessageRequest {
    chatRoomId: number;
    senderId: number;
    content: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Define the ChatRoom API service
const API_BASE_URL = `${backendUrl}/api`; // This should be your backend base URL

const getAuthToken = (): string | null => {
    return localStorage.getItem("authToken"); // Retrieve token from localStorage
};

export const chatRoomService = {
    // Fetch all chat rooms for a specific user (sender)
    async getChatRooms(senderId: number): Promise<ChatRoom[]> {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/chatrooms`, {
            headers: {
                Authorization: `Bearer ${token}`, // Add Bearer token
            },
            params: { senderId },
        });
        return response.data;
    },

    // Create a new chat room
    async createChatRoom(request: CreateChatRoomRequest): Promise<ChatRoom> {
        const token = getAuthToken();
        const response = await axios.post(`${API_BASE_URL}/chatrooms`, request, {
            headers: {
                Authorization: `Bearer ${token}`, // Add Bearer token
            },
        });
        return response.data;
    },


    // Fetch messages for a specific chat room
    async getChatRoomMessages(chatRoomId: number, senderId: number) {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_BASE_URL}/chatrooms/${chatRoomId}/messages`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Add Bearer token
                },
                params: { senderId },
            }
        );
        return response.data;
    },


    async sendMessage(request: SendMessageRequest): Promise<void> {
        const token = getAuthToken();
        await axios.post(`${API_BASE_URL}/messages`, request, {
            headers: {
                Authorization: `Bearer ${token}`, // Add Bearer token
            },
        });
    },
};