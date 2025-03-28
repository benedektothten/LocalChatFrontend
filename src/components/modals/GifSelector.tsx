import React from "react";
import { Box, Dialog, Typography } from "@mui/material";
import { Grid, SearchBar, SearchContext, SearchContextManager, SuggestionBar } from "@giphy/react-components";

interface GifSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelectGif: (gifId: string) => void;
}
const giphyApiKey = import.meta.env.VITE_REACT_APP_GIPHY_API_KEY!;

const GifSelector: React.FC<GifSelectorProps> = ({ open, onClose, onSelectGif }) => {
    // Component that wraps the Search Grid logic
    const Components = () => {
        const { fetchGifs, searchKey } = React.useContext(SearchContext);

        // Handle GIF click
        const handleGifClick = (gif: any, e: React.SyntheticEvent) => {
            e.preventDefault();
            onSelectGif(gif.id); // Send the selected GIF ID to the parent
            onClose(); // Close the modal
        };

        return (
            <>
                <SearchBar placeholder="Search for GIFs" />
                <SuggestionBar />
                <Box
                    sx={{
                        minHeight: 300, // Ensures the modal content doesn't shrink too much
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Grid
                        key={searchKey} // Recreate Grid on search key change to reset GIFs
                        columns={3}
                        width={800}
                        fetchGifs={fetchGifs} // Fetch GIFs from search context
                        onGifClick={handleGifClick} // Call when a GIF is clicked
                    />
                </Box>
            </>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <Box p={2}>
                <Typography variant="h6" gutterBottom>
                    Search and Select a GIF
                </Typography>
                {/* Wrap everything in the SearchContextManager */}
                <SearchContextManager apiKey={giphyApiKey}>
                    <Components />
                </SearchContextManager>
            </Box>
        </Dialog>
    );
};

export default GifSelector;

