export async function getInstagramReelViews(videoUrl: string, username: string): Promise<number> {
    const APIFY_API_KEY = process.env.APIFY_API_KEY;
    const APIFY_ACTOR_ID = "apify~instagram-reel-scraper";

    if (!username) {
        throw new Error("Failed to extract Instagram username from URL.");
    }


    // Fetch all reels for the user
    const response = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: [username], // ✅ Scraper requires a username
                resultsLimit: 10, // Fetch up to 10 recent reels
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Apify API Error:", errorText);
        throw new Error(`Failed to fetch Instagram Reels: ${errorText}`);
    }

    const data = await response.json();
    // console.log("Fetched Reels Data:", data);

    // Extract Reel ID from the URL
    const reelId = extractReelId(videoUrl);
    if (!reelId) {
        throw new Error("Invalid Instagram Reel URL");
    }

    // Find the Reel in the fetched data
    const matchedReel = data.find((reel: any) => reel.shortCode === reelId);

    if (!matchedReel) {
        throw new Error("Reel not found for this user.");
    }

    return matchedReel.videoViewCount || 0;
}

// Extract Reel ID from Instagram URL
function extractReelId(videoUrl: string): string | null {
    const match = videoUrl.match(/instagram\.com\/reel\/([^/?]+)/);
    return match ? match[1] : null;
}