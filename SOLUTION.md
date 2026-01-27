# Image Loading Troubleshooting

## Quick Fix Steps:

### 1. Clear Browser Cache
- **Chrome/Edge**: Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
- Select "Cached images and files"
- Click "Clear data"
- Or do a hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### 2. Use a Local Web Server (RECOMMENDED)
The `file://` protocol can have issues. Use a web server instead:

**Option A: Python (if installed)**
```bash
cd /Users/peterharvey/Desktop/uppercrust
python3 -m http.server 8000
```
Then open: http://localhost:8000/index.html

**Option B: VS Code Live Server**
- Install "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

**Option C: Node.js http-server**
```bash
npx http-server -p 8000
```

### 3. Check Browser Console
1. Open `index.html` in your browser
2. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
3. Go to the "Console" tab
4. Look for any red error messages about images
5. Go to the "Network" tab
6. Refresh the page
7. Look for failed image requests (they'll be red)

### 4. Test with Debug Page
Open `debug-images.html` in your browser - it will show you exactly which images are loading and which are failing.

### 5. Verify File Structure
Make sure your folder structure looks like this:
```
uppercrust/
├── index.html
├── order.html
├── styles.css
├── script.js
└── images/
    ├── With-font.jpg
    ├── jam-02.jpg
    ├── jam01.jpg
    ├── new-headshot.jpg
    └── jam-and-cream-grain.jpg
```

## Current Status:
✅ All image files have been renamed (no spaces)
✅ All HTML paths have been updated
✅ All files exist and are valid JPEGs

If images still don't load after trying the above, please:
1. Open the browser console (F12)
2. Take a screenshot or copy the error messages
3. Let me know what you see
