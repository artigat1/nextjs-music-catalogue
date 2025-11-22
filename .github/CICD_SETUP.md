# GitHub Actions CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment.

## Workflow Overview

The CI/CD pipeline runs on every push to `master` or `main` branch and includes:

1. **Lint** - Runs ESLint to check code quality
2. **Test** - Runs unit tests (if present)
3. **Build** - Builds the Next.js application
4. **Deploy** - Deploys to Firebase Hosting (only after all checks pass)

All jobs (lint, test, build) run in parallel for faster feedback.

## Setup Instructions

### 1. Generate Firebase Service Account

To enable automatic deployment, you need to create a Firebase service account:

```bash
# Login to Firebase (if not already logged in)
firebase login

# Generate a service account key
firebase init hosting:github
```

Follow the prompts:
- Select your Firebase project (`music-catalogue`)
- Choose your GitHub repository
- Set up the workflow for automatic deployment

This will automatically:
- Create a service account in your Firebase project
- Add the `FIREBASE_SERVICE_ACCOUNT` secret to your GitHub repository
- Generate the workflow file (you can skip this as we already have one)

### 2. Manual Setup (Alternative)

If you prefer to set up manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`music-catalogue`)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely

Then add it to GitHub:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Paste the entire contents of the JSON file
6. Click "Add secret"

### 3. Verify Setup

Once configured, every push to `master` or `main` will:
1. Run linting, tests, and build in parallel
2. If all pass, deploy to Firebase Hosting
3. You can view the progress in the "Actions" tab of your GitHub repository

## Local Development

The workflow uses the same commands you run locally:

```bash
# Lint
npm run lint

# Test
npm test

# Build
npm run build

# Deploy (manual)
firebase deploy
```

## Troubleshooting

### Build Fails
- Check the Actions tab for detailed error logs
- Ensure all dependencies are in `package.json`
- Test the build locally: `npm run build`

### Deployment Fails
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- Check Firebase project ID matches in the workflow file
- Ensure the service account has necessary permissions

### Secrets Not Working
- Secrets are only available in the repository where they're defined
- Forks don't have access to secrets (security feature)
- Re-generate the service account if needed
