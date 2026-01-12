# Deployment Instructions

## The Fix

The main issue was that the `services/geminiService.ts` file was missing or had the wrong Gemini model name.

**What was changed:**
- Line 12 in `services/geminiService.ts`: Changed from `model: "gemini-1.5-flash"` to `model: "gemini-1.5-flash-latest"`

## How to Deploy

### Option 1: Replace in GitHub Repository

1. Go to your repository: https://github.com/shareli-create/social-psych-app

2. Upload/replace these files:
   - `services/geminiService.ts` (THE CRITICAL FIX)
   - `components/LectureTopicList.tsx`
   - `components/AnalysisDisplay.tsx`
   - `components/Introduction.tsx`
   - `components/icons/Icons.tsx`
   - `index.css`

3. Commit and push the changes

4. Netlify will automatically redeploy

### Option 2: Create New Repository

If the structure is completely broken, you can:

1. Delete the old repository (or rename it to `social-psych-app-old`)

2. Create a new repository called `social-psych-app`

3. Upload all files from this folder

4. In Netlify:
   - Go to Site settings → Build & deploy → Link repository
   - Connect to the new GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

5. In Netlify:
   - Go to Site settings → Environment variables
   - Add: `VITE_GEMINI_API_KEY` = your Gemini API key

### Option 3: Manual Netlify Deploy

1. In this folder, run:
   ```bash
   npm install
   npm run build
   ```

2. Go to Netlify dashboard → Deploys tab

3. Drag and drop the `dist` folder directly onto the deploy area

4. Make sure environment variable `VITE_GEMINI_API_KEY` is set in Site settings

## Verify the Fix

After deployment, visit: https://sweet-biscotti-0e2ded.netlify.app/

1. Click on any lecture topic
2. You should see 3 news analyses appear
3. No more "404 models/gemini-1.5-flash is not found" error

## Environment Variables Required

Make sure these are set in Netlify (Site settings → Environment variables):
- `VITE_GEMINI_API_KEY` = your Google Gemini API key
