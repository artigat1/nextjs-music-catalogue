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

3.  **Grant Required Permissions:**
    *   Go to the [Google Cloud Console IAM & Admin](https://console.cloud.google.com/iam-admin/iam) page.
    *   Select your project: `music-catalogue`.
    *   Find the service account you just created (it will look like `firebase-adminsdk-xxxxx@music-catalogue.iam.gserviceaccount.com`).
    *   Click the **Pencil icon** (Edit principal).
    *   Add the following roles:
        *   **Firebase App Hosting Admin** (or `Firebase Admin`)
        *   **Cloud Functions Admin** (Required for Next.js SSR/API routes)
        *   **Service Account User** (Required to deploy functions)
        *   **Artifact Registry Writer** (Required for storing build artifacts)
        *   **Firebase Rules Admin** (`roles/firebaserules.admin`, required to publish rules)
    *   Click **Save**.

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

## Private catalogue rollout

Deploying Hosting alone does not protect the data. The root `AppAccess` component
blocks page content, but Firestore and Storage rules enforce access to the data.
Only `/login` is public. Static app assets remain downloadable; they contain no
catalogue records. `robots.txt` and `noindex` are crawler instructions, not access
controls. Previously indexed URLs may need removal through search-engine tools;
blocking crawls does not remove existing search results.

Before deploying this change:

1. Confirm the site owner has a `users/<lowercase-email>` document with the `admin`
   role and an `email` field matching its lowercase document ID. Audit all user
   documents for that shape before enabling the stricter write rules. Other entries must have `viewer`, `editor`, or `admin`. Google and Microsoft
   sessions must have a verified email claim. Login sends an email verification
   link when needed, then signs the account out. Follow that link and sign in
   again before testing access. An authenticated account outside
   this allowlist must not gain catalogue access.
2. Grant the Storage service agent access to Firestore before the first CI
   deployment. Non-interactive Firebase CLI skips the interactive IAM setup;
   deploying rules alone will not supply the missing permission. An authorized
   project administrator can grant the binding once:

   ```sh
   PROJECT_NUMBER=$(gcloud projects describe music-catalogue --format='value(projectNumber)')
   gcloud projects add-iam-policy-binding music-catalogue \
     --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-firebasestorage.iam.gserviceaccount.com" \
     --role=roles/firebaserules.firestoreServiceAgent
   ```

   The deployment identity separately needs Firebase Rules Admin. Do not replace
   the allowlist check with a generic signed-in check to work around an IAM error.
3. Apply the bucket CORS configuration for authenticated browser downloads:

   ```sh
   gsutil cors set storage.cors.json gs://music-catalogue.firebasestorage.app
   ```

   Audit bucket names in both `imageUrl` and `galleryImages`. Apply CORS and
   private rules to every referenced owned bucket, not just the default bucket.
   Legacy `storage.googleapis.com` URLs use authenticated SDK downloads too.
   Add custom hosting origins if used. CORS does not grant access without valid
   authentication. Firebase documents this requirement for
   [direct SDK downloads](https://firebase.google.com/docs/storage/web/download-files#download_data_directly_from_the_sdk).
4. Deploy both sets of rules, then Hosting:

   ```sh
   firebase deploy --project music-catalogue --only firestore:rules,storage
   firebase deploy --project music-catalogue --only hosting
   ```

   The GitHub deployment job follows this order. Keep these steps together for
   later deployments. A rules deployment failure must stop Hosting deployment.
5. Revoke previously issued Firebase Storage download tokens for catalogue
   objects. The app now saves `gs://` references and downloads through the
   authenticated SDK, including when reading legacy token URLs. Changing rules
   does not revoke old bearer links. This is a separate production migration,
   not something this code change performs. Remove public bucket/object IAM
   access if present, set existing objects to `Cache-Control: private,no-store`,
   and review cache retention for previously public images. New uploads use this
   cache policy. Images intentionally refetch after remount rather than retaining
   private blobs across sessions. Downloads remain viewport-lazy.
6. Review OneDrive sharing separately. Firestore rules hide the stored links but
   cannot revoke a previously copied OneDrive link or make externally hosted
   images private. Restrict those files at their source or move them into the
   protected bucket. Previously downloaded copies cannot be recalled.
7. Verify signed out in a fresh browser. `/`, `/search`, recording deep links and
   `/admin` must show only login. Anonymous Firestore list/get and tokenless
   Storage requests must fail. Previously issued download links must fail after
   revocation. Then check viewer browsing/images and editor/admin operations with
   real Google and Microsoft accounts. Confirm `/robots.txt` returns `Disallow: /`
   and page responses contain `X-Robots-Tag: noindex, nofollow, noarchive`.

Do not report production as private until the rules, hosting deployment, token
revocation, external sharing review, and signed-in checks have completed.

## Security rules tests

Run `npm run test:rules` with Java 21 or later installed. The command uses pinned
Firebase CLI 15.24.0 through `npx`, and CI runs it before deployment.
The suite uses a `demo-` project and local Firestore/Storage emulators. It never
writes test fixtures into the production project. It checks anonymous, unlisted,
unverified, viewer, editor and admin access, including user-management privileges.
