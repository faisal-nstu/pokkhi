# Pokkhi — Sreemangal Acoustic Field Catalogue

An interactive, high-fidelity acoustic directory of local birds in Sreemangal, Bangladesh. Built with React, TypeScript, and Tailwind CSS.

---

## 🚀 Deploying to GitHub Pages

The error you encountered:
> *`Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`*

occurs because **GitHub Pages is a static file host** and cannot compile raw `.tsx` (TypeScript) source files directly in the browser. You must build your application to static HTML, CSS, and JS first, and host those built files (the `dist/` directory) rather than your raw source code.

We have included two highly reliable ways to deploy this project properly.

---

### Option A: Fully Automated Deployment (Recommended)
We have added a **GitHub Actions** workflow that automatically builds and deploys your application every time you push to your `main` or `master` branch.

1. **Commit and Push** your changes to your GitHub repository (including the new `.github/workflows/deploy.yml` file).
2. Go to your repository on GitHub and navigate to the **Settings** tab.
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - Set **Source** to **Deploy from a branch**.
   - Set **Branch** to `gh-pages` and folder to `/ (root)`.
   - Click **Save**.
5. Once saved, your app will automatically compile and serve the pristine production bundle at your GitHub Pages URL!

---

### Option B: Manual Terminal Deployment
If you prefer to deploy manually from your terminal, you can build and publish using the `gh-pages` package:

1. **Install the deployment tool**:
   ```bash
   npm install --save-dev gh-pages
   ```
2. **Add scripts to `package.json`**:
   Open `package.json` and add these two lines under the `"scripts"` section:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. **Deploy with a single command**:
   ```bash
   npm run deploy
   ```
   This compiles your application to the `dist` directory and pushes it automatically to your `gh-pages` branch. Then, configure your GitHub Pages settings to serve from the `gh-pages` branch.

---

## 🛠️ Development

To run the application locally in development mode:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
