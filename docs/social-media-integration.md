# Meta Graph API Social Media Integration Guide

This guide details the integration architecture, required Meta Graph API permissions, environment setup procedures, and endpoint reference for the **FIDSOR Social Media CMS**.

---

## 1. Meta Graph API Permissions Required

To fully enable publishing, profile details fetching, post history, and analytics features across Facebook Pages and Instagram Business accounts, your Meta Developer App requires the following Graph API permissions:

| Permission Name | Scope | Purpose |
| :--- | :--- | :--- |
| `pages_read_engagement` | Facebook Page | Allows reading page profile info, follower counts, page post stats, comments, and likes summaries. |
| `pages_show_list` | Facebook Page | Allows retrieving the list of Facebook Pages managed by the authenticated Meta account. |
| `pages_manage_posts` | Facebook Page | Enables posting photos, captions, and status updates directly to Facebook Pages. |
| `instagram_basic` | Instagram Business | Allows reading Instagram Business account profile metadata, username, avatar, and media objects. |
| `instagram_manage_insights` | Instagram Business | Provides access to media insights, follower metrics, comment counts, and like counts. |
| `instagram_content_publish` | Instagram Business | Enables two-step container creation and publishing for photos and media on Instagram Business accounts. |

---

## 2. Step-by-Step Meta Credentials Setup

### Step 1: Create Meta Developer App
1. Go to the [Meta Developer Portal](https://developers.facebook.com/) and sign in.
2. Click **My Apps** > **Create App**.
3. Select **Business** as the app type.
4. Enter an App Name (e.g. `Fidsor CMS Integrator`) and link your Business Account.

### Step 2: Acquire Facebook Page ID & Access Token
1. In Meta Developer Portal, navigate to **Tools** > **Graph API Explorer**.
2. Select your App from the dropdown.
3. Under **User or Page**, select **Get Page Access Token** and choose your target Facebook Page.
4. Add the permissions: `pages_read_engagement`, `pages_show_list`, `pages_manage_posts`.
5. Click **Generate Access Token** and grant permissions in the Meta popup.
6. Copy the Page Access Token. (For production, exchange this short-lived token for a long-lived Page Access Token using the Graph API token exchange endpoint).
7. Retrieve your **Facebook Page ID**:
   - Make a `GET /v19.0/me?fields=id,name` query in Graph API Explorer, or read it from your Facebook Page's **About** page.

### Step 3: Link Instagram Business Account & Find ID
1. Ensure your Instagram Account is converted to a **Business / Creator Account**.
2. Link your Instagram Business Account to your Facebook Page in Facebook Page Settings > **Linked Accounts** > **Instagram**.
3. In Graph API Explorer, make a GET request to query your linked Instagram Business ID:
   ```http
   GET /v19.0/{page-id}?fields=instagram_business_account
   ```
4. Copy the returned `instagram_business_account.id` value.

### Step 4: Configure Server Environment Variables
Open or create `server/.env` and configure the Meta API variables:

```env
PORT=5000
SERVER_URL=http://localhost:5000
JWT_SECRET=your_super_secret_jwt_key_fidsor_cms

# Meta Graph API Credentials
META_PAGE_ID=109283746501928
META_PAGE_ACCESS_TOKEN=EAAG...your_meta_page_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841409281726
```

---

## 3. Backend REST API Documentation (`/api/social/*`)

All endpoints require a valid JWT bearer token in the HTTP Authorization header:
`Authorization: Bearer <your_jwt_token>`

---

### 1. `GET /api/social/account-info`
Fetches basic profile information and follower metrics for connected Facebook Page and Instagram Business accounts.

- **Query Parameters**:
  - `forceRefresh` *(optional, boolean)*: Set to `true` to bypass backend in-memory cache.

- **Example Response (200 OK)**:
```json
{
  "facebook": {
    "connected": true,
    "platform": "facebook",
    "id": "109283746501928",
    "name": "Fidsor Official Page",
    "username": "fidsorofficial",
    "picture": "https://scontent.ffsd1-1.fna.fbcdn.net/...",
    "followersCount": 14850,
    "fanCount": 14200
  },
  "instagram": {
    "connected": true,
    "platform": "instagram",
    "id": "17841409281726",
    "name": "Fidsor CMS Studio",
    "username": "fidsor_cms",
    "profilePictureUrl": "https://scontent.ffsd1-1.fna.fbcdn.net/...",
    "followersCount": 28400,
    "mediaCount": 184
  },
  "fetchedAt": "2026-08-10T02:45:00.000Z"
}
```

---

### 2. `GET /api/social/analytics`
Aggregates summary statistics across platforms (total uploaded posts/media count combined and per-platform breakdown).

- **Query Parameters**:
  - `forceRefresh` *(optional, boolean)*: Set to `true` to bypass backend in-memory cache.

- **Example Response (200 OK)**:
```json
{
  "summary": {
    "totalPosts": 342,
    "totalFollowers": 43250,
    "connectedPlatformsCount": 2
  },
  "platforms": {
    "facebook": {
      "connected": true,
      "totalPosts": 158,
      "followersCount": 14850,
      "fanCount": 14200,
      "name": "Fidsor Official Page",
      "error": null
    },
    "instagram": {
      "connected": true,
      "totalMedia": 184,
      "followersCount": 28400,
      "mediaCount": 184,
      "name": "Fidsor CMS Studio",
      "error": null
    }
  },
  "fetchedAt": "2026-08-10T02:45:00.000Z"
}
```

---

### 3. `GET /api/social/posts`
Fetches recent published posts and media items from Facebook and Instagram, normalized into a single array ordered by timestamp descending (newest first).

- **Query Parameters**:
  - `forceRefresh` *(optional, boolean)*: Set to `true` to bypass backend in-memory cache.

- **Example Response (200 OK)**:
```json
{
  "posts": [
    {
      "id": "17841409281726_101",
      "platform": "instagram",
      "caption": "🚀 Excited to announce our newest features in Fidsor Social Media CMS!",
      "imageUrl": "https://scontent.cdninstagram.com/...",
      "mediaType": "IMAGE",
      "permalink": "https://www.instagram.com/p/C3x9a10b/",
      "timestamp": "2026-08-09T20:30:00.000Z",
      "likeCount": 412,
      "commentCount": 38
    },
    {
      "id": "109283746501928_202",
      "platform": "facebook",
      "caption": "Build, schedule, and analyze your social campaigns with integrated Meta Graph API.",
      "imageUrl": "https://scontent.ffsd1-1.fna.fbcdn.net/...",
      "permalink": "https://www.facebook.com/109283746501928/posts/202/",
      "timestamp": "2026-08-09T18:15:00.000Z",
      "likeCount": 189,
      "commentCount": 15
    }
  ],
  "summary": {
    "total": 2,
    "facebookCount": 1,
    "instagramCount": 1
  },
  "platforms": {
    "facebook": { "connected": true, "count": 1, "error": null },
    "instagram": { "connected": true, "count": 1, "error": null }
  },
  "fetchedAt": "2026-08-10T02:45:00.000Z"
}
```

---

### 4. `POST /api/social/publish`
Publishes an uploaded image and caption to Facebook Pages and/or Instagram Business accounts.

- **Request Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (JPEG, PNG, WEBP, max 10MB)
  - `caption`: Post text description
  - `platforms`: JSON string array, e.g. `["facebook", "instagram"]`

---

## 4. Error & Partial Failure Handling

If one platform's credentials fail (e.g. invalid Facebook page ID or expired token), the backend gracefully isolates the error:
- Returns `connected: false` and the specific error string for that platform.
- Continues fetching and returning live data for any healthy connected platforms.
- Frontend displays visual status badges ("Connected" vs "Connection Error") and troubleshooting alert banners without crashing.
