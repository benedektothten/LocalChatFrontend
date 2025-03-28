import * as signalR from "@microsoft/signalr";

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private readonly backendUrl = import.meta.env.VITE_BACKEND_URL;
    private readonly hubUrl = `${this.backendUrl}/hubs/chat`;

    // Initialize the SignalR connection
    public async connect(): Promise<void> {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/hubs/chat",{
                withCredentials: true,
                accessTokenFactory: () => localStorage.getItem("authToken")
            }) // Backend hub endpoint
            .withAutomaticReconnect() // Optional: Reconnect automatically on disconnection
            .build();

        // Event triggered when the connection starts
        this.connection.onreconnecting(() => {
            console.log("SignalR reconnecting...");
        });

        this.connection.onreconnected(() => {
            console.log("SignalR reconnected.");
        });

        this.connection.onclose(() => {
            console.log("SignalR connection closed.");
        });

        try {
            await this.connection.start();
            console.log("SignalR connected successfully.");
        } catch (err) {
            console.error("Error connecting to SignalR:", err);
        }
    }

    // Join a specific chat room by ID
    public async joinChatRoom(chatRoomId: string): Promise<void> {
        if (this.connection) {
            await this.connection.invoke("JoinChatRoom", chatRoomId);
        }
    }

    // Leave a specific chat room by ID
    public async leaveChatRoom(chatRoomId: string): Promise<void> {
        if (this.connection) {
            await this.connection.invoke("LeaveChatRoom", chatRoomId);
        }
    }

    // Send a message to a specific chat room
    public async sendMessage(chatRoomId: string, userId: number, message: string): Promise<void> {
        if (this.connection) {
            await this.connection.invoke("SendMessage", chatRoomId, userId, message);
        }
    }

    // Subscribe to receiving messages
    public onReceiveMessage(handler: (chatRoomId: string, userId: number, userName: string, message: string) => void): void {
        if (this.connection) {
            this.connection.off("ReceiveMessage");
            this.connection.on("ReceiveMessage", handler);
        }
    }

    // Disconnect the SignalR connection
    public async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            console.log("SignalR disconnected.");
        }
    }
}

export const signalRService = new SignalRService();