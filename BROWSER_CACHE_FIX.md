# Browser Cache Fix Instructions

If you see "Something went wrong" even after rebuilding:

## Step 1: Hard Refresh the Browser
**Windows/Linux:** Press `Ctrl + Shift + R` or `Ctrl + F5`
**Mac:** Press `Cmd + Shift + R`

## Step 2: Clear Browser Cache Completely

### Chrome/Edge
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"

### Firefox
1. Press `Ctrl + Shift + Delete`
2. Select "Everything"
3. Check "Cache"
4. Click "Clear Now"

## Step 3: Open Developer Tools
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for any RED errors
4. Take a screenshot and share if you see errors

## Step 4: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page (`F5`)
3. Look for any requests that are RED or show errors
4. Check if the request to `http://localhost:9000/api/v1/problems` succeeds

## Step 5: Access the Site
Go to: **http://localhost:8082**
Login with:
- Email: `dev@example.com`  
- Password: `password123`
