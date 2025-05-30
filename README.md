# ✨ AstroGit - Your Coding Horoscope

<div align="center">

![AstroGit Banner](https://i.imgur.com/JZ3zXyD.png)

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

🌟 **Discover your coding destiny based on your GitHub activity** 🌟

[Features](#-features) • [Demo](https://astrogit-frontend.onrender.com) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

## 🚀 Introduction

AstroGit generates your personalized coding horoscope by analyzing your GitHub profile. Simply enter your GitHub username, and the cosmic algorithm will reveal insights about your coding style based on:

- **Energy** 🔋 - Derived from your commit frequency
- **Charisma** ✨ - Based on stars your repositories have received
- **Creativity** 🎨 - Measured by the variety of repositories you maintain
- **Collaboration** 👥 - Reflected in your follower count and network

No authentication required - just pure cosmic coding insights!

![AstroGit Screenshot](https://i.imgur.com/fTVQxDs.png)

## ✨ Features

- 🔮 **Personalized Horoscopes** - Unique insights based on your GitHub activity
- 📊 **Beautiful Visualizations** - See your cosmic coding traits with stunning graphics
- 🚫 **No Authentication** - Just enter a GitHub username and get started
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🌐 **Social Sharing** - Share your coding destiny with friends and colleagues
- 💫 **Cosmic UI** - Immersive starry interface that brings your horoscope to life

## 🌐 Live Demo

Experience AstroGit in action: [astrogit](https://astrogit-frontend.onrender.com)

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A GitHub account (for testing with your own profile)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nandanaaaaaa/AstroGit.git
cd AstroGit
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file based on `.env.example`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the development server:

```bash
npm run dev
```

### 3. Backend Setup

```bash
cd ../backend
npm install
```

Create a `.env` file based on `.env.example`:

```
PORT=3001
```

Start the backend server:

```bash
npm run dev
```

Now you can access the application at http://localhost:3000 🎉

## 🔍 Usage

1. **Enter a GitHub Username** - Type any valid GitHub username in the input field
2. **View Your Horoscope** - See your coding traits and personalized message
3. **Share Your Results** - Copy your horoscope or share it directly on Twitter
4. **Explore Your Traits** - Switch between tabs to see detailed insights about your coding style

## ⚠️ Troubleshooting

### GitHub API Access Issues

1. **Rate Limiting**
   - The GitHub API has rate limits for unauthenticated requests
   - If you hit limits, wait an hour or consider implementing a token-based approach

2. **User Not Found**
   - Ensure the GitHub username exists
   - Check for typos in the username

3. **API Changes**
   - If the GitHub API changes, the application might need updates
   - Check the GitHub API documentation for recent changes

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ and cosmic coding energy</p>
  <p>© 2025 AstroGit</p>
</div>
