# Setup Instructions for "Proof" PWA

To get this project running locally, you need to provide your Firebase configuration in a `.env.local` file.

1. Create a file named `.env.local` in the project root.
2. Add the following variables with your Firebase project details:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.
5. To test the PWA features, run `npm run build` and then `npm run preview`.

## GitHub Pages Deployment

This project is configured to deploy to GitHub Pages via GitHub Actions.

1.  **Repository Name:** Ensure your GitHub repository is named `proof`. If it's different, update the `base` property in `vite.config.ts`.
2.  **GitHub Secrets:** Go to your repository **Settings > Secrets and variables > Actions** and add the same environment variables as secrets (e.g., `VITE_FIREBASE_API_KEY`, etc.).
3.  **Deploy:** Pushing to the `main` branch will automatically trigger the deployment.
4.  **Routing:** The app uses `HashRouter` to ensure navigation works correctly on static hosting without additional server configuration.
