# RJB Art Studio — HOW-TO Guide

Plain-English instructions for managing your art studio website.  
No coding knowledge required for day-to-day tasks.

---

## Table of Contents
1. [Starting the local admin](#1-starting-the-local-admin)
2. [Adding a painting (photo)](#2-adding-a-painting-photo-only)
3. [Adding a painting (YouTube video)](#3-adding-a-painting-from-youtube)
4. [Editing or deleting a painting](#4-editing-or-deleting-a-painting)
5. [Setting painting status (For Sale, Sold, etc.)](#5-setting-painting-status)
6. [Hiding a painting temporarily](#6-hiding-a-painting)
7. [Syncing YouTube playlists](#7-syncing-youtube-playlists)
8. [Editing page text (bio, services, awards, contact)](#8-editing-page-text)
9. [Previewing changes locally](#9-previewing-changes-locally)
10. [Publishing to the live website](#10-publishing-to-the-live-website)
11. [Running a site health check](#11-running-a-site-health-check)
12. [Emergency deploy (no git commit)](#12-emergency-deploy-skip-git)
13. [Manual git steps](#13-manual-git-steps)
14. [Getting a YouTube API key](#14-getting-a-youtube-api-key)
15. [Netlify CLI cheat sheet](#15-netlify-cli-cheat-sheet)

---

## 1. Starting the Local Admin

Open a terminal (PowerShell or Command Prompt) in the `rjb-art-studio` folder and run:

```
npm run dev
```

Then open your browser to: **http://localhost:5180/admin**

> The admin only works while `npm run dev` is running. Stop it with `Ctrl+C`.

---

## 2. Adding a Painting (Photo Only)

1. Go to the **Add Single Painting** tab in the admin.
2. Make sure **Photo only** mode is selected (left button in the mode toggle).
3. Drag and drop one or more photo files onto the drop zone, or click **Browse**.
4. For **multiple files**: all files are uploaded at once and each gets its own catalog entry. Fill in the shared fields (medium, size, categories) before uploading — they apply to all.
5. Each photo is automatically resized to:
   - **1600px wide WebP** — full-quality display image
   - **500px wide thumbnail** — used in gallery cards
6. Fill in the title, year, medium, size, categories, and status.
7. Click **Save Painting**.

---

## 3. Adding a Painting (From YouTube)

1. Go to the **Add Single Painting** tab.
2. Click **From YouTube video** mode.
3. Paste the YouTube video URL into the URL field and click **Fetch Info**.
4. The title and best-available thumbnail are filled in automatically.
5. *(Optional)* Upload a high-res photo via the Photo drop zone to override the thumbnail.
6. Fill in any remaining fields and click **Save Painting**.

### Bulk import (multiple YouTube videos at once)
1. Go to the **Bulk Importer** tab.
2. Paste lines in the format: `URL | Playlist Name`
   ```
   https://www.youtube.com/watch?v=abc123 | Landscapes & Seascapes
   https://www.youtube.com/watch?v=xyz789 | Portraits
   ```
3. The playlist name must match an existing playlist exactly (case-insensitive).
4. Click **Process**.

---

## 4. Editing or Deleting a Painting

1. Go to the **Paintings** tab.
2. Find the item in the list (use the search box to filter).
3. Click the **pencil icon** to edit — the form opens in *Edit Painting* mode at the top.
4. Make your changes and click **Save Painting**.
5. To delete: click the **trash icon** and confirm. *This cannot be undone.*

---

## 5. Setting Painting Status

Each painting can show one of these badges in the gallery:

| Status | Badge Color | Buy Button? |
|---|---|---|
| For Sale | Green | ✅ Yes (shows price if set) |
| Sold | Red | ❌ No |
| Reserved | Amber | ❌ No |
| Not Available for Sale | Gray | ❌ No |
| *(none)* | None | ❌ No |

**To change status:**
- **Single item**: use the dropdown in the *Paintings* tab next to the item, or edit the painting and change the *Status Badge* field.
- **Multiple items**: check the checkboxes next to items, choose a status from *Bulk Set Status*, and click **Apply to Selected**.

---

## 6. Hiding a Painting

In the **Paintings** tab, click the **eye icon** next to any item.

- The painting disappears from the public Gallery but stays in the admin list (shown dimmed).
- Click the eye again to make it visible again.
- Useful for: works-in-progress, seasonal items, temporarily removed pieces.

---

## 7. Syncing YouTube Playlists

### Via the admin panel
1. Go to the **Playlists** tab.
2. Click **Sync** next to a playlist to fetch the latest videos from YouTube.
   - New videos are added.
   - Existing videos and your custom edits are **never overwritten**.
3. Click **Sync All** to update every playlist in one go.

### Adding a new playlist
1. Paste the YouTube playlist URL (or just the playlist ID starting with `PL`) into the *Add Playlist* field.
2. Click **Add & Sync**.

> **Requires a YouTube API key.** See [Getting a YouTube API key](#14-getting-a-youtube-api-key).

### Via command line (syncs all playlists)
```
npm run sync-playlists
```
This reads `YOUTUBE_API_KEY` from your `.env` file automatically.

---

## 8. Editing Page Text

Use the **Page Text & Content** tab (or the Quick Page Editor dropdown at the top of the admin) to edit:

- **Home**: hero heading, tagline, bio, highlighted paintings section
- **About**: bio, studio photo, Mayoral Artist of the Month awards and photos
- **Commissions & Prints**: service descriptions (custom paintings, giclée prints, etc.)
- **Contact**: direct email address, contact page intro text, Google Forms URLs

Click **Save Page Content Changes** when done.

Changes are saved to `src/data/site.json` on your computer. They appear in your local preview immediately and go live when you publish.

**If you make a mistake**, click *Restore Defaults* to reload the original text.

---

## 9. Previewing Changes Locally

Click **View Website** in the admin top bar, or open:  
**http://localhost:5180**

Changes appear instantly — no publishing needed. The local preview is a full replica of the live site.

---

## 10. Publishing to the Live Website

Open a terminal in the project folder and run:

```
npm run publish
```

Or with a custom commit message:

```
npm run publish -- "Added new seascape paintings"
```

This automatically:
1. Stages all changed files (`git add -A`)
2. Commits with your message (or the default)
3. Pushes to GitHub (`git push origin main`)
4. Builds the production bundle (`npm run build`)
5. Deploys to Netlify (`netlify deploy --prod`)

**Your live site is at:** https://rjbart.netlify.app

---

## 11. Running a Site Health Check

Before publishing, you can verify the site is healthy:

```
npm run check
```

This checks (without opening a browser):
- All JSON data files parse correctly
- No placeholder text remains
- Key pages have content
- The production build is clean
- Bundle size is under 500 KB
- Footer social links and price list thumbnails are present

---

## 12. Emergency Deploy (Skip Git)

If you just need to push a fresh build to Netlify without a git commit:

```
npm run deploy
```

---

## 13. Manual Git Steps

If you prefer to commit manually before running the full publish:

```powershell
git add -A
git commit -m "Your description of changes"
git push origin main
npm run build
npx netlify deploy --prod --dir=dist
```

To check what files changed:
```
git status
```

To see recent commits:
```
git log --oneline -10
```

---

## 14. Getting a YouTube API Key

You need this once to enable playlist syncing.

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one).
3. Search for **YouTube Data API v3** and enable it.
4. Go to **Credentials → Create Credentials → API Key**.
5. Copy the key.
6. Open (or create) the file `.env` in the project root and add:
   ```
   YOUTUBE_API_KEY=your_key_here
   ```
7. The key is never committed to GitHub (`.env` is in `.gitignore`).

---

## 15. Netlify CLI Cheat Sheet

```powershell
# Deploy to production
npx netlify deploy --prod --dir=dist

# Deploy a draft/preview URL (won't affect live site)
npx netlify deploy --dir=dist

# Check current site status
npx netlify status

# Open Netlify dashboard in browser
npx netlify open
```
