import { create } from "zustand";
import { chatRoomService, ChatRoom } from "../services/chatRoomService";

interface Message {
    messageId: number;
    chatRoomId: number;
    senderId: number;
    content: string;
    sentAt: string;
    senderUsername: string;
    isGif: boolean;
}

interface UserAvatars {
    userId: number;
    avatarUrl: string;
}

interface ChatRoomState {
    chatRooms: ChatRoom[]; // List of chat rooms
    messages: Message[]; // Messages in the currently selected chat room
    userAvatars: UserAvatars[];
    selectedChatRoomId: number | null; // ID of the currently selected chat room
    chatListLoading: boolean; // General loading state
    chatRoomMessagesLoading: boolean;
    error: string | null; // Error message state

    fetchChatRooms: (userId: number) => Promise<void>; // Fetch chat rooms method
    fetchChatRoomMessages: (chatRoomId: number, userId: number) => Promise<void>; // Fetch messages method
    addSlimMessageToChatRoom: (chatRoomId: string, messageId: number, userId: number, messageContent: string) => void;
    selectChatRoom: (chatRoomId: number) => void; // Set selected chat room
}

// Zustand store
export const useChatRoomStore = create<ChatRoomState>((set) => ({
    chatRooms: [],
    messages: [],
    userAvatars: [],
    selectedChatRoomId: null,
    chatListLoading: false, // New loading state for chat list
    chatRoomMessagesLoading: false, // Separate loading state for chat room messages
    error: null,

    // Fetch chat rooms for a given user
    fetchChatRooms: async (userId) => {
        if(!userId)
            return;
        set({ chatListLoading: true, error: null });
        try {
            const response = await chatRoomService.getChatRooms(userId);
            set({ chatRooms: response, chatListLoading: false });
        } catch (err: any) {
            set({ error: err.message || "Failed to fetch chat rooms", chatListLoading: false });
        }
    },

    // Fetch chat room messages
    fetchChatRoomMessages: async (chatRoomId, userId) => {
        set({ chatRoomMessagesLoading: true, error: null });
        try {
            const response = await chatRoomService.getChatRoomMessages(chatRoomId, userId);
            set({ messages: response.messages ?? [], userAvatars: response.avatars ?? [], chatRoomMessagesLoading: false, selectedChatRoomId: chatRoomId });
        } catch (err: any) {
            set({ error: err.message || "Failed to fetch messages", chatRoomMessagesLoading: false });
        }
    },

    // Set the selected chat room
    selectChatRoom: (chatRoomId) => {
        set({ selectedChatRoomId: chatRoomId });
    },
    addSlimMessageToChatRoom: (chatRoomId: string, messageId: number, userId: number, userName: string, messageContent: string, isGif: boolean) => {
        if(messageContent){
            const newMessage = { chatRoomId, messageId: messageId, senderId: userId, content: messageContent, senderUsername: userName, isGif: isGif };
            // Update the matching chat room's latestMessage
            set((state) => {
                const updatedChatRooms = state.chatRooms.map((chatRoom) => {
                    if (chatRoom.chatRoomId === chatRoomId) {
                        return {
                            ...chatRoom,
                            latestMessage: {
                                senderUsername: userName,
                                content: messageContent,
                            },
                        };
                    }
                    return chatRoom; // Keep other chat rooms unchanged
                });
                // Avoid adding the same message if duplicates exist
                const isDuplicate = state.messages.some(
                    (m) =>
                        m.chatRoomId === newMessage.chatRoomId &&
                        m.senderId === newMessage.senderId &&
                        m.content === newMessage.content
                ); // bugs here. cannot add new message with the same content

                if (!isDuplicate) {
                    return {
                        messages: [...state.messages, newMessage],
                        chatRooms: updatedChatRooms, // Update chatRooms with modified latestMessage
                    };
                }

                return { chatRooms: updatedChatRooms };
                // Leave the state unchanged
            });
        }
    }
}));