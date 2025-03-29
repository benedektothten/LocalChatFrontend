import { create } from "zustand";

interface UserState {
    userId: number | null;
    isLoggedIn: boolean;
    avatarUrl: string | null;
    ownedChatRooms: number[];
    selectUser: (selectedUserId: number) => void;
    logoutUser: () => void;
    selectAvatarUrl: (selectedAvatarUrl: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
    userId: null,
    isLoggedIn: false,
    avatarUrl: null,
    ownedChatRooms: [],
    selectUser: (selectedUserId) => {
        set({ userId: selectedUserId, isLoggedIn: true });
    },
    logoutUser: () =>
        set({ userId: null, avatarUrl: null, isLoggedIn: false }),
    selectAvatarUrl: (selectedAvatarUrl) =>{
        set({avatarUrl: selectedAvatarUrl});
    }
}));