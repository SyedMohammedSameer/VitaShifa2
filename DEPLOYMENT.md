# VitaShifa Deployment Guide (Netlify)

## Prerequisites
- Groq API Key ([Get one here](https://console.groq.com/keys))
- Firebase project with Admin SDK credentials
- Netlify account

## Environment Variables Setup

### 1. Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the key for use in Netlify

### 2. Prepare Firebase Credentials
For `FIREBASE_SERVICE_ACCOUNT_BASE64`:
```bash
# On Linux/Mac:
cat path/to/serviceAccountKey.json | base64 -w 0

# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content path/to/serviceAccountKey.json -Raw)))
```

### 3. Configure Netlify Environment Variables

Go to your Netlify site: **Site settings → Environment variables**

Add the following variables:

#### Secret Variables (Server-side only)
- `GROQ_API_KEY` - Your Groq API key
- `FIREBASE_SERVICE_ACCOUNT_BASE64` - Base64 encoded Firebase service account JSON

#### Public Variables (Client-side)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Deployment Steps

### Option 1: Deploy via Netlify UI
1. Push your code to GitHub/GitLab/Bitbucket
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure environment variables as listed above
6. Deploy!

### Option 2: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables (do this for each variable)
netlify env:set GROQ_API_KEY "your_groq_api_key"
netlify env:set FIREBASE_SERVICE_ACCOUNT_BASE64 "your_base64_encoded_json"
# ... add all other variables

# Deploy
netlify deploy --prod
```

## Security Notes

✅ **GROQ_API_KEY is secure** - Only used in API routes (server-side)
✅ **Firebase credentials are secure** - Service account is Base64 encoded and server-side only
✅ **No secrets in frontend code** - All sensitive keys use `process.env` without `NEXT_PUBLIC_` prefix
✅ **.env files are gitignored** - Only `.env.example` is committed

## Groq Model Information

This app uses the following Groq models:
- **llama-3.3-70b-versatile** - For medical consultations and wellness planning
  - Free tier available
  - High rate limits
  - Excellent for medical/healthcare queries

## Troubleshooting

### Build fails with "GROQ_API_KEY is undefined"
- Ensure environment variables are set in Netlify UI
- Redeploy after adding environment variables

### API routes return 500 errors
- Check Netlify function logs
- Verify all environment variables are correctly set
- Ensure Firebase credentials are properly Base64 encoded

### Rate limiting issues
- Groq free tier has generous rate limits
- Check your current limits at [Groq Console](https://console.groq.com/settings/limits)
- Upgrade to Developer tier if needed for higher limits

## Next Steps After Deployment

1. Test all features:
   - Medical consultation chat
   - AI diagnosis (now text-based symptoms only)
   - Wellness planning

2. Monitor usage:
   - Check Groq usage at [Groq Console](https://console.groq.com)
   - Monitor Netlify function invocations

3. Set up custom domain (optional):
   - Go to Netlify site settings → Domain management
   - Add your custom domain
