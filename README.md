# 📚 HComic App - Online Comic & Manga Reader Platform

**HComic App** is a modern, high-performance web application designed for reading comics and manga online with a sleek, eye-friendly user interface. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**, the application seamlessly integrates with a Spring Boot RESTful API backend, supporting JWT authentication, comic management, chapter publishing, likes, ratings, and comment discussions.

---

## 🌟 Key Features

### 📖 For Readers
- **Intuitive Home Page**: Search comics by title, filter by genres, view view counts, like counts, and average star ratings.
- **Crisp Chapter Reader**:
  - High-resolution image list rendering.
  - Smooth chapter navigation (Previous / Next / Quick Chapter Selector).
  - Automatic reading history tracking.
  - In-chapter comment discussions.
- **Interactions & Community**:
  - Favorite / Like comics.
  - Rate comics with 1 to 5 stars (⭐).
  - Comment & discuss under comics or specific chapters.
- **User Profile & Authentication**:
  - Secure Register / Login powered by JWT Token.
  - Profile management & avatar updates.

### ✍️ For Authors & Uploaders (Uploader / Admin / Translator)
- **Comic Management (My Comics)**:
  - Create new comic series (Title, Author, Description, Cover Image, Status: *ONGOING*, *COMPLETED*, *PAUSED*, *CANCELLED*).
  - Update comic details & publication status.
  - Delete comic series.
- **Chapter Management**:
  - Publish new chapters for comic series (Chapter number, Chapter title, upload page images).
  - Edit chapter details & manage chapter images.
  - Delete chapters.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library.
- **TypeScript 6.0** - Type-safe, scalable codebase.
- **Vite 8** - Fast build tool & Dev Server with Hot Module Replacement (HMR).
- **Tailwind CSS v4** - Utility-first styling with sleek, eye-friendly color palettes.
- **React Router v7** - Client-side Single Page Application (SPA) routing.
- **Lucide React** - Clean, modern icon set.
- **Axios** - HTTP client with request/response interceptors for automatic JWT Bearer token injection and global error handling.

### Backend Integration
- **RESTful APIs**: Connected to Spring Boot Backend at `https://localhost:8080`.
- **Authentication**: JWT Bearer Authentication stored in `localStorage`.

---

## 📁 Project Directory Structure

```text
h/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ChapterModal.tsx       # Modal for adding/editing chapters
│   │   ├── ComicCard.tsx          # Card component displaying comic info
│   │   ├── ComicModal.tsx          # Modal for creating/editing comics
│   │   ├── CommentSection.tsx      # Interactive comment section
│   │   ├── Navbar.tsx              # Main navigation header
│   │   ├── RatingStars.tsx         # Star rating component
│   │   ├── StatusBadge.tsx         # Comic status badge
│   │   └── UserProfileModal.tsx    # User profile edit modal
│   ├── context/            # React Context (AuthContext for user session)
│   ├── pages/              # Main page views
│   │   ├── HomePage.tsx           # Homepage & comic catalog
│   │   ├── ComicDetailPage.tsx    # Comic info & chapter listing
│   │   ├── ChapterReaderPage.tsx  # Interactive chapter reader
│   │   ├── MyComicsPage.tsx       # Author comic management dashboard
│   │   ├── LoginPage.tsx          # User login page
│   │   ├── RegisterPage.tsx       # User registration page
│   │   └── ProfilePage.tsx        # User profile page
│   ├── services/           # Backend API integration (Axios services)
│   │   ├── apiClient.ts           # Axios instance, interceptors & image URL helper
│   │   ├── authService.ts         # Authentication API (Login/Register)
│   │   ├── comicService.ts        # Comic CRUD API
│   │   ├── chapterService.ts      # Chapter CRUD API
│   │   ├── commentService.ts      # Comment API
│   │   ├── likeService.ts         # Favorite / Like API
│   │   └── rateService.ts         # Rating API
│   ├── types/              # TypeScript interfaces & type definitions
│   │   └── index.ts               # Data types (Comic, Chapter, User, Auth, etc.)
│   ├── App.tsx             # Root component & route definitions
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global CSS & Tailwind configuration
├── package.json            # Dependencies & npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build tool configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** (comes with Node.js), **yarn**, or **pnpm**

### Installation & Execution

1. **Navigate to the project root**:
   ```bash
   cd d:/projects/h
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to: `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## ⚡ Code Quality & Linting

Run ESLint to check for code quality and syntax issues:
```bash
npm run lint
```

---

## 📝 License

**HComic App © 2026** - High-resolution & eye-friendly online comic reading platform.


