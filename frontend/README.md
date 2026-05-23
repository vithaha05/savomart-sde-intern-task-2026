# Savomart Loyalty Companion App - Frontend

A clean, minimal React 19 + Vite frontend for the Savomart Loyalty Companion App with authentication screens and mobile-first design.

## 🎨 Design System

- **Primary Color**: Purple (#782B90) - dominant brand color
- **Accent Color**: Yellow (#FFF200) - highlights and call-to-action only
- **Typography**: Inter font from Google Fonts
- **Aesthetic**: Clean, minimal, generous whitespace, mobile-first
- **Framework**: Tailwind CSS v3 (no custom CSS except globals)

## 🏗️ Project Structure

```
src/
├── api/
│   └── axios.js           # Configured Axios instance with interceptors
├── context/
│   └── AuthContext.jsx    # Authentication state management
├── pages/
│   └── LoginPage.jsx      # Two-step login (mobile → OTP)
├── components/
│   └── Layout.jsx         # Main layout with bottom/top nav
├── App.jsx                # Router setup and protected routes
├── main.jsx              # Entry point
└── index.css             # Global styles + Tailwind directives
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_URL` to match your backend URL.

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser.

## 📦 Key Dependencies

- **React 19** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Query (TanStack)** - Data fetching and state management
- **Tailwind CSS v3** - Utility-first CSS framework
- **@tailwindcss/postcss** - Tailwind PostCSS plugin

## 🔧 Configuration

### Tailwind Colors
Edit `tailwind.config.js` to customize brand colors:
```javascript
colors: {
  brand: {
    purple: '#782B90',
    yellow: '#FFF200',
    'purple-light': '#F3E8F7',
    'purple-dark': '#5a1f6e',
  },
}
```

### API Base URL
Edit `.env` and set `VITE_API_URL`:
```
VITE_API_URL=http://localhost:3000/api
```

## 🔐 Authentication Flow

### Two-Step Login

**Step 1: Mobile Number**
- 10-digit Indian mobile number validation
- Calls `POST /auth/send-otp`
- Moves to OTP step on success

**Step 2: OTP Verification**
- 6 individual digit boxes (auto-advance on input)
- Backspace support to delete digits
- 30-second cooldown timer for resend
- Dev mode: Shows OTP in yellow banner if `dev_otp` returned
- Calls `POST /auth/verify-otp`
- On success, stores JWT in localStorage and redirects to home

### API Interceptors
- **Request**: Automatically attaches JWT token from localStorage
- **Response**: On 401, clears token and redirects to `/login`

## 📱 Layout Components

### Mobile Navigation (< md)
- **Bottom Nav**: Fixed nav bar with 4 primary screens
  - Home, Offers, Stores, Support
  - Icons only, labeled with text
  - Active state highlighted in purple

### Top Nav
- Savomart logo on left
- Profile icon (logout button) on right

### Desktop Navigation
- Top horizontal nav (hidden on mobile)
- Main content area with proper spacing

## 🎯 Pages

- **`/login`** - Authentication (public)
- **`/`** - Home (protected)
- **`/offers`** - Special offers (protected)
- **`/stores`** - Store locator (protected)
- **`/support`** - Customer support (protected)

## 🏗️ Build & Deploy

**Development:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
```
Output: `dist/` folder ready for deployment

**Preview build locally:**
```bash
npm run preview
```

**Linting:**
```bash
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## 🎨 Styling Guidelines

- Use Tailwind utility classes only (no custom CSS)
- Mobile-first: start with mobile styles, add `md:` breakpoints for desktop
- Color values from Tailwind config (use `bg-brand-purple`, not hex)
- Consistent spacing using Tailwind scale
- Rounded buttons use `rounded-full` for pill shape

### Common Patterns

**Button (Full Width):**
```jsx
<button className="w-full py-3 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 transition-all">
  Action
</button>
```

**Error Text:**
```jsx
<p className="text-red-500 text-sm">{error}</p>
```

**Input (Clean Bottom Border):**
```jsx
<input className="py-3 bg-transparent border-b-2 border-brand-purple outline-none" />
```

## 🔄 State Management

### Authentication Context
```javascript
const { user, token, login, logout, loading } = useAuth();
```

- `user` - Current user object
- `token` - JWT token
- `login(token, userData)` - Set auth state
- `logout()` - Clear auth state
- `loading` - Initial load state

## 🚨 Error Handling

- Inline error messages (red text below inputs)
- No alert dialogs (poor UX)
- Network errors caught by Axios response interceptor
- 401 responses automatically redirect to login

## 📱 Responsive Design

- **Mobile** (< 768px): Full width, bottom nav, stacked layout
- **Desktop** (≥ 768px): Sidebar/top nav, multi-column layouts

## 🧪 Development Tips

1. **Hot Module Replacement (HMR)**: Changes auto-reload without losing state
2. **React DevTools**: Install browser extension for debugging
3. **Network Tab**: Monitor API calls in browser DevTools
4. **Tailwind IntelliSense**: VS Code extension for autocomplete

## 📄 License

Part of Savomart Loyalty Companion App

