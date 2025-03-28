import { useEffect, useState } from "react";
import { Gif } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Typography } from "@mui/material";

const giphyApiKey = import.meta.env.VITE_REACT_APP_GIPHY_API_KEY!;
const gf = new GiphyFetch(giphyApiKey);

function GifRenderer({ gifId }: { gifId: string }) {
    const [gifData, setGifData] = useState<any | null>(null);

    useEffect(() => {
        const fetchGif = async () => {
            try {
                const { data } = await gf.gif(gifId || "");
                setGifData(data); // Store the GIF data
            } catch (err) {
                console.error("Failed to fetch GIF:", err);
            }
        };

        fetchGif();
    }, [gifId]);

    return gifData ? (
        <Gif gif={gifData} width={200} noLink />
    ) : (
        <Typography>Loading...</Typography> // Placeholder while loading
    );
}

export default GifRenderer;