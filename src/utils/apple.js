import dotenv from "dotenv";
dotenv.config();


export const appleKey = {
    
    client_id: process.env.APPLE_SERVICE_ID,
    team_id: process.env.APPLE_TEAM_ID,
    key_id: process.env.APPLE_KEY_ID,
    redirect_uri:process.env.APPLE_REDIRECT_URI,
    scope:"name email"
}