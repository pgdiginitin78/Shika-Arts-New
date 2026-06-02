# Shopify Customer Account API Setup Guide

## Step 1: Create a Customer Account API App in Shopify Admin

1. Go to: https://admin.shopify.com/store/shika-arts-premium-gifts-jmx4i/settings/customer_accounts
2. Enable "New customer accounts" if not already enabled
3. Click on **"Develop apps for your headless storefront"** or find the **"Customer Account API"** section
4. Create a new app client (or find an existing one)

## Step 2: Configure the App Client

In your app client settings, add these **Allowed redirect URIs** (for login callback):
```
https://your-website.com/auth/callback
http://localhost:5173/auth/callback   (for local development)
```

Add these **Allowed logout redirect URIs** (this fixes the sign-out redirect!):
```
https://your-website.com
http://localhost:5173
```

> Replace `https://your-website.com` with your actual deployed website URL.

## Step 3: Copy the Client ID

Copy the **Client ID** from the app client settings page.

## Step 4: Set Up the Environment Variable

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace `your_client_id_here` with your actual Client ID:

```
VITE_SHOPIFY_CLIENT_ID=shp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Test the Fix

1. Run: `npm run dev` or `yarn dev`
2. Click the User icon in the header → you'll be redirected to Shopify login
3. After login, you'll be redirected back to your website (the `/auth/callback` route handles this)
4. Click Sign Out → you'll be redirected back to your **website homepage** (no more Lovable redirect!)

## Why the Lovable URL was appearing

The old Lovable URL (`go.to.lovable.app/password?t=...`) was appearing because:
- When the project was on Lovable, the Shopify app's redirect URI was set to the Lovable URL
- After moving away from Lovable, Shopify still redirected to that registered URL

**The fix**: By properly implementing the OAuth `end_session_endpoint` with `post_logout_redirect_uri=your-website.com`, sign-out now redirects to your website homepage.
