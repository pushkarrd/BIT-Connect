<div align="center">

# 🎓 BIT Connect — Academic Resource Hub

### *By the Students, for the Students.*

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

**A zero-friction, open-access academic repository and community hub for [Bangalore Institute of Technology](https://bit-bangalore.edu.in/) students.**

Browse notes, internal question papers, and SEE PYQs instantly — **no sign-up required**.

[🌐 **Visit Live App**](https://bit-connect-hub.vercel.app/) · [🐛 Report a Bug](https://github.com/pushkarrd/BIT-Connect/issues) · [💡 Request a Feature](https://github.com/pushkarrd/BIT-Connect/issues)

</div>

---

## 🤔 The Problem We Solved

We've all been there — it's the night before an internal test or the dreaded **Semester End Examinations (SEE)**, and the college WhatsApp groups are in pure chaos. Everyone's stressed, scrambling, and endlessly scrolling just to find that one elusive set of **previous year question papers** or the right **module notes**.

> **BIT Connect** was born out of that shared frustration. We built a single, organized platform where finding study materials is no longer a scavenger hunt — it's instant.

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 📚 **Resource Vault** | Browse organized notes, internal papers & PYQs across **13 UG branches** and **semesters 3–8** |
| 🎓 **1st Year Hub** | Dedicated section for 1st year students with **4 streams** (EEE, CSE, ME, CV) and **P/C Cycle** support |
| 🔍 **Global Search** | Instantly search across all uploaded resources — find what you need in seconds |
| 🧮 **SEE Grade Calculator** | Enter your CIE marks, pick your target grade (O, A+, A, B+…) — instantly know your required SEE score |
| 💬 **Community Board** | Anonymous discussion forum — ask doubts, share tips, post updates filtered by branch |
| 📤 **Easy Upload System** | Upload PDFs, images, or Word docs (up to 50 MB) — images are auto-stitched into clean PDFs |
| 🔐 **Admin Approval Flow** | Every upload goes through admin review before going live — keeping content quality high |
| 🔔 **Push Notifications** | Admins receive real-time web push alerts (via Firebase Cloud Messaging) when new uploads arrive |
| 🌗 **Dark / Light Mode** | Gorgeous themed UI that respects your system preference, toggleable anytime |
| 👥 **Interactive Contact Page** | Beautiful 3D-tilt profile cards with developer info and social links |
| 📊 **Vercel Analytics** | Built-in analytics for tracking usage and performance |
| 🗺️ **SEO Optimized** | Sitemap, meta tags, Google Search Console verified — easily discoverable |

---

## 📸 What It Looks Like

### 🏠 Home Page — Hero & Branch Selection
> A clean, animated landing page with a tagline, call-to-action buttons, and a grid of all 13 branches.

### 📖 Resource Vault
> Select your branch → pick a semester → choose a category → download instantly. That's it!

### 🧮 SEE Grade Calculator
> Enter your CIE marks out of 50, pick a target grade, and see exactly how much you need to score in the SEE to achieve it — powered by real VTU grade rules.

### 💬 Community Board
> Post anonymously, filter by branch, upvote helpful content — a student discussion space right inside the app.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) (metadata, posts, approvals) |
| **File Storage** | [Supabase Storage](https://supabase.com/storage) (PDFs, documents) |
| **Notifications** | [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) (web push) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |
| **Fonts** | [Geist](https://vercel.com/font) + [Fredoka](https://fonts.google.com/specimen/Fredoka) via `next/font` |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```
BIT-Connect/
├── public/
│   ├── favicon.png                    # App icon
│   ├── firebase-messaging-sw.js      # Push notification service worker
│   └── ...
├── src/
│   ├── app/
│   │   ├── page.tsx                   # 🏠 Home page (hero, branch grid, about)
│   │   ├── layout.tsx                 # Root layout with fonts & analytics
│   │   ├── globals.css                # Global styles & design tokens
│   │   ├── sitemap.ts                 # Dynamic sitemap for SEO
│   │   ├── vault/
│   │   │   ├── [branch]/              # 📚 Dynamic branch resource pages
│   │   │   └── first-year/            # 🎓 1st year stream & cycle pages
│   │   ├── calculator/                # 🧮 SEE Grade Calculator
│   │   ├── community/                 # 💬 Community discussion board
│   │   ├── contact/                   # 👥 Contact page with profile cards
│   │   ├── admin/                     # 🔐 Admin approval dashboard
│   │   └── api/
│   │       ├── admin/                 # Admin authentication API
│   │       ├── notify-admin/          # Push notification trigger API
│   │       └── search/                # Global search API
│   ├── components/
│   │   ├── Navbar.tsx                 # Navigation with search bar
│   │   ├── Footer.tsx                 # Site footer with credits
│   │   ├── AppShell.tsx               # Layout wrapper (navbar + footer)
│   │   ├── UploadModal.tsx            # File upload dialog
│   │   ├── UploaderGuideSection.tsx   # Step-by-step upload guide
│   │   ├── PostCard.tsx               # Community post card
│   │   ├── NewPostModal.tsx           # Create new post dialog
│   │   ├── FileCard.tsx               # Resource file card
│   │   ├── VoteButton.tsx             # Upvote/downvote button
│   │   ├── ProfileCard.tsx            # 3D-tilt interactive profile card
│   │   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   │   ├── ThemeProvider.tsx          # Theme context provider
│   │   └── ui/                        # shadcn/ui primitives
│   ├── data/
│   │   └── branches.ts               # Branch, semester & category definitions
│   └── lib/
│       ├── firebase.ts                # Firebase client config
│       ├── supabase.ts                # Supabase client config
│       ├── grades.ts                  # VTU grade calculation engine
│       ├── icons.ts                   # Icon utilities
│       └── utils.ts                   # General utilities
├── .env.example                       # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)
- A **Firebase** project ([create one here](https://console.firebase.google.com/))
- A **Supabase** project ([create one here](https://supabase.com/dashboard))

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/pushkarrd/BIT-Connect.git
cd BIT-Connect
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser — you're up and running! 🎉

---

## 📚 Supported Branches

BIT Connect covers all **13 undergraduate engineering branches** at BIT:

| # | Branch | Code |
|---|--------|------|
| 1 | Electronics and Instrumentation Engineering | EIE |
| 2 | Civil Engineering | CE |
| 3 | Mechanical Engineering | ME |
| 4 | Electrical and Electronics Engineering | EEE |
| 5 | Electronics and Communication Engineering | ECE |
| 6 | Computer Science and Engineering | CSE |
| 7 | Electronics Engineering (VLSI Design & Technology) | VLSI |
| 8 | Electronics and Telecommunication Engineering | ETE |
| 9 | Information Science and Engineering | ISE |
| 10 | Artificial Intelligence and Machine Learning | AIML |
| 11 | CSE (IOT & Cyber Security, Blockchain Technology) | CSE-ICB |
| 12 | Computer Science & Engineering (Data Science) | CSE-DS |
| 13 | Robotics & Artificial Intelligence | RAI |

**Resource Categories:**
- 📝 **Class Notes** — Curated lecture notes by module
- 📋 **Internal Question Papers** — IA/CIE question papers
- 🎓 **SEE PYQs** — Previous Year Question Papers for Semester End Exams

---

## 🧮 How the Grade Calculator Works

The **SEE Grade Calculator** follows the official **VTU grading system**:

```
Final Total = CIE (out of 50) + (SEE_raw / 100) × 50
```

| Grade | Minimum Total | Grade Points |
|-------|:------------:|:------------:|
| O (Outstanding) | 90 | 10 |
| A+ | 80 | 9 |
| A | 70 | 8 |
| B+ | 60 | 7 |
| B | 55 | 6 |
| C | 50 | 5 |
| P (Pass) | 40 | 4 |

> ⚠️ **VTU Rule:** A minimum of **36/100 marks in SEE** is mandatory to pass, regardless of CIE score.

**How to use it:**
1. Enter your **CIE marks** (out of 50)
2. Select your **target grade** (e.g., A+)
3. Instantly see the **exact SEE marks** you need to achieve it ✅

---

## 📤 How to Upload Resources

Contributing to BIT Connect is super easy — here's how:

1. **Click Upload** → Choose your **Branch** (Sem 3–8) or **1st Year Stream** (P/C Cycle)
2. **Select Files** → PDFs, Word docs, or even **multiple images** (they get auto-stitched into a single clean PDF!)
3. **Enter Details** → Type the **Subject Name** and an optional **Alias** (stay anonymous if you want)
4. **Submit** → Your upload gets a quick **admin review** and goes live for everyone 🎉

> 💡 **Pro Tip:** Snap photos of your internal question paper pages → upload them all → BIT Connect automatically creates a single, named PDF. No extra apps needed!

**Supported formats:** PDF, PNG, JPG, JPEG, DOC, DOCX  
**Max file size:** 50 MB

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🤝 Contributing

We love contributions! If you're a BIT student (or anyone who wants to help), here's how you can contribute:

1. **Fork** this repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

> 💬 Found a bug? Have an idea? [Open an issue](https://github.com/pushkarrd/BIT-Connect/issues) — we read every one of them!

---

## 👨‍💻 Team

<div align="center">

| Role | Name |
|------|------|
| 🛠️ **Designer & Developer** | **Pushkar R Deshpande** |
| 💡 **Ideator** | **Hemsagar B C** |

</div>

---

## 📄 License

This project is open source and available for educational use. Built with ❤️ for the students of **Bangalore Institute of Technology**.

---

<div align="center">

**⭐ If BIT Connect helped you ace an exam, give us a star!**

*Let's ace these exams together.* 🎓

</div>
