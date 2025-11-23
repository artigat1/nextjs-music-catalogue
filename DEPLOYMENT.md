# Deployment Setup Guide

The CI/CD pipeline is configured to automatically deploy to Firebase Hosting when changes are pushed to the `master` branch. However, for the deployment to succeed, you need to configure a secret in your GitHub repository.

## Prerequisite: Firebase Service Account

1.  **Go to Firebase Console:**
    *   Open the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project: `music-catalogue`.

2.  **Generate Private Key:**
    *   Click the **Gear icon** (Settings) > **Project settings**.
    *   Go to the **Service accounts** tab.
    *   Click **Generate new private key**.
    *   Confirm by clicking **Generate key**.
    *   A JSON file containing your service account credentials will be downloaded. **Keep this file secure.**

## Configure GitHub Secret

1.  **Go to GitHub Repository:**
    *   Navigate to your repository: `https://github.com/artigat1/nextjs-music-catalogue`.

2.  **Add Secret:**
    *   Go to **Settings** > **Secrets and variables** > **Actions**.
    *   Click **New repository secret**.
    *   **Name:** `FIREBASE_SERVICE_ACCOUNT`
    *   **Secret:** Paste the *entire contents* of the JSON file you downloaded in the previous step.
    *   Click **Add secret**.

## Trigger Deployment

Once the secret is added:
1.  Go to the **Actions** tab in your GitHub repository.
2.  Select the failed workflow run.
3.  Click **Re-run jobs** > **Re-run failed jobs**.

The deployment step should now succeed!
