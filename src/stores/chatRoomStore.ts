import { create } from "zustand";
import { chatRoomService, ChatRoom } from "../services/chatRoomService";

interface Message {
    messageId: string;
    chatRoomId: string;
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
    selectedChatRoomId: string | null; // ID of the currently selected chat room
    chatListLoading: boolean; // General loading state
    chatRoomMessagesLoading: boolean;
    error: string | null; // Error message state

    fetchChatRooms: (userId: number) => Promise<void>; // Fetch chat rooms method
    fetchChatRoomMessages: (chatRoomId: string, userId: number) => Promise<void>; // Fetch messages method
    addSlimMessageToChatRoom: (chatRoomId: string, messageId: string, userId: number, userName: string, messageContent: string, isGif: boolean) => void;
    selectChatRoom: (chatRoomId: string) => void; // Set selected chat room
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
    selectChatRoom: (chatRoomId: string) => {
        set({ selectedChatRoomId: chatRoomId });
    },
    addSlimMessageToChatRoom: (chatRoomId: string, messageId: string, userId: number, userName: string, messageContent: string, isGif: boolean) => {
        if (messageContent) {
            const newMessage = {
                chatRoomId,
                messageId,
                senderId: userId,
                content: messageContent,
                sentAt: new Date().toISOString(), // Example - Assign current timestamp
                senderUsername: userName,
                isGif,
            };

            // Update the matching chat room's latestMessage
            set((state) => {
                const updatedChatRooms = state.chatRooms.map((chatRoom) => {
                    if (chatRoom.chatRoomId === chatRoomId) {
                        return {
                            ...chatRoom,
                            latestMessage: {
                                messageId: newMessage.messageId,
                                content: newMessage.content,
                                sentAt: newMessage.sentAt,
                                senderId: newMessage.senderId,
                                senderUsername: newMessage.senderUsername,
                                isGif: newMessage.isGif,
                            },
                        };
                    }
                    return chatRoom; // Keep other chat rooms unchanged
                });

                // Avoid adding the same message if duplicates exist
                const isDuplicate = state.messages.some(
                    (m) =>
                        m.senderId === newMessage.senderId &&
                        m.content === newMessage.content
                );

                return {
                    chatRooms: updatedChatRooms,
                    messages: isDuplicate ? state.messages : [...state.messages, newMessage],
                };
            });
        }
    }
}));