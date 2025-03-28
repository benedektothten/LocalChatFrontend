import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useUserStore } from "../stores/userStore";

export default function AvatarMenu() {
    const { avatarUrl, logoutUser } = useUserStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget); // Open menu below avatar
    };

    const handleMenuClose = () => {
        setAnchorEl(null); // Close the menu
    };

    const handleLogout = () => {
        // Clear user data and remove token
        logoutUser();
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("avatarUrl");
        console.log("User logged out successfully!");
        handleMenuClose();
    };

    return (
        <div>
            {/* Avatar with click action */}
            <Avatar
                alt="User Avatar"
                src={avatarUrl}
                sx={{
                    width: 40,
                    height: 40,
                    cursor: "pointer",
                    border: "2px solid white",
                    ":hover": {
                        borderColor: "rgba(255, 255, 255, 0.8)",
                        boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.7)"
                    }
                }}
                onClick={handleAvatarClick}
            />
            {/* Menu under Avatar */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
            >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </div>
    );
}