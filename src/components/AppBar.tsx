import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Login from './Login.tsx';

interface ButtonAppBarProps {
    title: string;
    showMenu: boolean;
    toogleMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ButtonAppBar({ title, showMenu, toogleMenu }: ButtonAppBarProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed"
                sx={{
                    transition: "width 0.3s",
                    height: "64px", // Fixed height
                    zIndex: 1201, // Ensure it's on top of the ChatList

                }}
            >
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={()=>toogleMenu(!showMenu)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    <Login color="inherit">Login</Login>
                </Toolbar>
            </AppBar>
        </Box>
    );
}