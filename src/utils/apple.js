import jwt from "jsonwebtoken";
import qs from "querystring";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const signWithApplePrivateKey = process.env.APPLE_SECRETKEY;

export const createSignWithAppleSecret = () => {

    const token = jwt.sign({}, signWithApplePrivateKey, {
        algorithm: 'ES256',
        expiresIn: '1h',
        audience: 'https://appleid.apple.com',
        issuer: process.env.APPLE_TEAM_ID, // TEAM_ID
        subject: process.env.APPLE_CLIENT_ID, // Service ID
        keyid: process.env.APPLE_KEY_ID, // KEY_ID
      });

      return token;
    };

export const getAppleToken = async (code) =>
    axios.post(
      'https://appleid.apple.com/auth/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        client_secret: createSignWithAppleSecret(),
        client_id: process.env.APPLE_CLIENT_ID,
        redirect_uri: process.env.APPLE_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );