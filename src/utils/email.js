import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const smtpTransport = nodemailer.createTransport({
    service: "naver",
    host:"smtp.naver.com",
    port:587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
    tls: {
        rejectUnauthorized:false
    }
});