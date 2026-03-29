"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
// src/utils/cloudinaryHelper.ts
const cloudinary_1 = __importDefault(require("../config/cloudinary")); // ඔයාගේ cloudinary config ෆයිල් එක
const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
