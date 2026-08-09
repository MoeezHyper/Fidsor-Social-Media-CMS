# Fidsor Social Media CMS - Meta Graph API Social Media Publisher

A complete, production-grade **Social Media Publisher** module built inside a React (Vite) and Express (Node.js) Admin CMS Dashboard. It enables publishing images with captions directly to **Facebook Pages** and **Instagram Business** accounts using the official **Meta Graph API**.

---

## Features

- **Direct Meta Graph API Integration**:
  - **Facebook Page**: Publishes page photos using `POST /v19.0/{page-id}/photos`.
  - **Instagram Business**: Full 2-step media container publishing (`POST /v19.0/{ig-user-id}/media` -> `POST /v19.0/{ig-user-id}/media_publish`).
- **Image Upload & Validation**:
  - Upload JPG, JPEG, or PNG images up to 8MB.
  - Interactive drag-and-drop zone with instant live image preview and replacement options.
- **Caption Editor**: Multi-line textarea with a dynamic 2,200 character counter.
- **Platform Selection**: Interactive toggle cards for Facebook and Instagram selection.
- **Publish Button States**: Enabled strictly when an image is selected AND at least one platform is checked; features loading spinner & duplicate click prevention.
- **Per-Platform Results Reporting**: Displays individual status badges and detailed error reasons for each selected platform (e.g., partial success or specific token failures).

---

## Quick Start

### 1. Install Dependencies

In the root directory, run:
```bash
npm run install:all
```
*Or install separately:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the `server/` directory:
```bash
cp server/.env.example server/.env
```

Configure your Meta Graph API credentials:
```env
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_PAGE_ID=your_facebook_page_id
META_PAGE_ACCESS_TOKEN=your_facebook_page_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id

PORT=5000
SERVER_URL=http://localhost:5000
```

> **Note on Instagram Image URL Accessibility**:
> Instagram Graph API requires an accessible public URL (`image_url`) to create a media container. When testing locally, you can use `ngrok` to expose port 5000:
> ```bash
> ngrok http 5000
> ```
> Then set `SERVER_URL=https://your-ngrok-subdomain.ngrok-free.app` in `server/.env`.

### 3. Running Development Servers

Start the Express backend API (Port 5000):
```bash
npm run server:dev
```

In a separate terminal, start the React frontend (Port 3000):
```bash
npm run client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

### `POST /api/social/publish`

**Content-Type**: `multipart/form-data`

**Form Data Fields**:
- `image`: Uploaded image file (JPG, JPEG, PNG, max 8MB)
- `caption`: String (Optional)
- `platforms`: JSON string array, e.g. `["facebook", "instagram"]`

**Success Response (200 OK)**:
```json
{
  "results": [
    {
      "platform": "facebook",
      "success": true,
      "postId": "1234567890_9876543210"
    },
    {
      "platform": "instagram",
      "success": true,
      "mediaId": "17912345678901234"
    }
  ]
}
```

**Partial Success / Failure Response (200 OK)**:
```json
{
  "results": [
    {
      "platform": "facebook",
      "success": true,
      "postId": "1234567890_9876543210"
    },
    {
      "platform": "instagram",
      "success": false,
      "message": "Invalid or expired Access Token. Please refresh META_PAGE_ACCESS_TOKEN."
    }
  ]
}
```
