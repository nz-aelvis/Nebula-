# Deployment Guide

Nebula ERP consists of two parts: the Frontend Application and the Backend AI Worker.

## 1. Frontend Deployment

The frontend is a static React application (Vite-compatible structure).

### Build
Run the build command to generate static assets:
```bash
npm run build
```
This produces a `dist/` or `build/` folder.

### Hosting Options
You can host the static files on any provider:
*   **Cloudflare Pages**: Connect your Git repo and set the build command.
*   **Vercel / Netlify**: Drag and drop the build folder or connect Git.
*   **S3 / Azure Blob**: Upload static files and configure index document.

## 2. Backend Deployment (Cloudflare Worker)

To secure your Gemini API Key in production, do not bundle it in the frontend code. Instead, deploy the `worker.ts` file.

### Prerequisites
*   Cloudflare Account
*   Wrangler CLI (`npm install -g wrangler`)

### Steps
1.  **Configure Wrangler**:
    Login to your account.
    ```bash
    wrangler login
    ```

2.  **Set Secrets**:
    Store your Google Gemini API Key securely.
    ```bash
    wrangler secret put API_KEY
    ```
    (Enter your key when prompted).

3.  **Deploy**:
    Deploy the worker code located in `worker.ts`.
    ```bash
    wrangler deploy worker.ts --name nebula-ai-proxy
    ```

4.  **Update Frontend**:
    In `services/geminiService.ts`, update the `getAI` function to fetch from your new Worker URL instead of using `process.env.API_KEY` directly.

    ```typescript
    // Example Change
    const response = await fetch('https://nebula-ai-proxy.your-subdomain.workers.dev', {
        method: 'POST',
        body: JSON.stringify({ prompt: ... })
    });
    ```

## 3. Environment Variables

If running entirely client-side (for demo/internal use), create a `.env` file in the root:

```env
API_KEY=your_google_gemini_api_key
```

**Warning**: In client-side only mode, the API key is exposed to the browser. Use the Cloudflare Worker method for production.
