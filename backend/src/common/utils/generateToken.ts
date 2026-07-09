import crypto from "crypto";

const generateAccessTokenSecret = crypto.randomBytes(32).toString("hex");

const generateRefreshTokenSecret = crypto.randomBytes(32).toString("hex");

console.log(`The access token secret is : ${generateAccessTokenSecret}`);
console.log(`The refresh token secret is : ${generateRefreshTokenSecret}`);
