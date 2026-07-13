# Pokkhi — Sreemangal Acoustic Field Catalogue

An interactive, high-fidelity acoustic directory of local birds in Sreemangal, Bangladesh. Built with React, TypeScript, and Tailwind CSS.

---

## 🚀 Deploying Directly from the `main` Branch to GitHub Pages

By default, GitHub Pages is a static file server and cannot build raw TypeScript/React source files directly. You must first build your application to production-ready static assets and configure GitHub Pages to serve them.

To make deploying from your **`main`** branch as simple and direct as possible, we have configured the build system to output to the **`docs`** folder. 

Follow these **3 quick steps** to publish your application:

### Step 1: Build your application locally
In your terminal, run the following command to build the production assets into the `docs/` folder:
```bash
npm run build
```

### Step 2: Commit and push the `docs` folder to GitHub
Add, commit, and push the newly generated `docs/` folder to your `main` branch:
```bash
git add docs/
git commit -m "build: compile assets to docs for GitHub Pages"
git push origin main
```

### Step 3: Configure GitHub Pages to use the `docs` folder
1. Go to your repository on **GitHub.com**.
2. Click the **Settings** tab at the top.
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - Set **Source** to **Deploy from a branch**.
   - Set the branch to **`main`**.
   - Change the folder from `/ (root)` to **`/docs`**.
5. Click **Save**.

Your app will be live at your GitHub Pages URL in less than a minute!

---

## 🛠️ Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```
