# AirFetch

A modern, full-stack file sharing and storage platform.
![AirFetch Home Screenshot](./Home.png)

<p align="center"><b>AirFetch Home - Modern, Responsive File Sharing</b></p>

## 🚀 Features

- **User Authentication**
  - Email/password registration and login
  - Google OAuth login
  - Secure JWT-based sessions (cookies, httpOnly, SameSite, Secure)
  - Password set/reset for Google accounts

- **File Management**
  - Upload files (up to 50MB per file, configurable)
  - View files in grid or list view
  - Download, rename, and delete files
  - File type icons and previews (image, video, audio, PDF, text/code, etc.)
  - Responsive drag-and-drop upload UI

- **Protected Routes**
  - Only authenticated users can access file management
  - Backend route protection with JWT middleware

- **Public Sharing**
  - Generate shareable links for any file
  - Anyone with the link can preview or download the file
  - Beautiful, full-screen preview page for shared files (supports images, video, audio, PDF, text/code, etc.)
  - Direct download from share page


- **Cloudflare R2 & CDN-Ready Architecture**
  - Files are uploaded and stored in Cloudflare R2 object storage
  - Backend streams files to and from R2 for upload, preview, and download
  - Ready for direct-to-cloud uploads and CDN edge delivery
  - Easily adaptable to other S3-compatible storage providers

- **Security**
  - CORS and cookie settings for cross-domain authentication
  - Secure file access and sharing

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Multer, Cloud Storage (R2/S3-ready)
- **Auth:** JWT, Google OAuth
- **Deployment:** Vercel (frontend), Render/Cloudflare (backend)

## ⚡ Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/airfetch.git
cd airfetch
```

### 2. Setup Environment Variables
- Copy `.env.example` to `.env` in both `client/` and `server/` folders.
- Set your MongoDB URI, JWT secret, Google OAuth client ID, and (optionally) cloud storage credentials.

### 3. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 4. Run Locally
- **Backend:**
  ```bash
  cd server
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd client
  npm run dev
  ```

### 5. Build for Production
- **Frontend:**
  ```bash
  cd client
  npm run build
  ```

## 🌐 Usage
- Register or login (email/password or Google)
- Upload, preview, download, rename, or delete files
- Click the share button to copy a public preview link
- Open the share link in any browser/device to preview or download the file

## 🏗️ CDN/Cloud Storage Ready
- Easily upgrade to direct-to-cloud uploads for large files
- Ready for S3, R2, or any compatible object storage

## 🛡️ Security Notes
- Cookies are set with `SameSite=None; Secure; domain=.airfetch.online` for cross-subdomain auth
- CORS is configured for secure cross-origin requests
- All sensitive routes are protected by JWT middleware

## 💡 Customization
- Change file size limits in `server/routes/file.js`
- Add more file type previews in `client/src/components/SharedFilePreview.jsx`
- Integrate with your preferred cloud storage/CDN


**Enjoy fast, secure, and beautiful file sharing with AirFetch!** 

## ☁️ Cloudflare R2 File Storage

- All user files are stored in Cloudflare R2, a highly scalable, S3-compatible object storage solution.
- The backend uses the AWS SDK to upload, stream, and manage files in R2.
- File upload, preview, and download routes interact directly with R2 for efficient, scalable storage.
- The architecture is ready for direct-to-R2 uploads (bypassing server RAM/disk for large files).
- Files can be served via a CDN (e.g., Cloudflare) for fast, global access.
- Easily switch to other S3-compatible storage if needed. 