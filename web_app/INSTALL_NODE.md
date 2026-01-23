# Installing Node.js and npm

Since npm comes bundled with Node.js, you just need to install Node.js. Here are the easiest methods for macOS:

## Method 1: Official Installer (Recommended - Easiest)

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the instructions
4. This will install both Node.js and npm

After installation, verify it worked by opening Terminal and running:
```bash
node --version
npm --version
```

## Method 2: Using Homebrew (If you have it)

If you already have Homebrew installed, you can install Node.js with:
```bash
brew install node
```

## Method 3: Using nvm (Node Version Manager)

If you want to manage multiple Node.js versions:

1. Install nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal or run:
   ```bash
   source ~/.bash_profile
   # or
   source ~/.zshrc
   ```

3. Install Node.js:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## After Installation

Once Node.js and npm are installed, you can proceed with setting up the Upper Crust web app:

```bash
# Install backend dependencies
cd web_app/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Then you can start the servers as described in the README.md file.
