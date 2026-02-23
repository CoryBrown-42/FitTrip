# FitTrip — Your Fitness Journey

A modern fitness tracking web app built with React, Tailwind CSS, and Vite. Log workouts, set goals, track body composition, and get personalized advice from an AI coach powered by Google Gemini.

---

## Features

- **Dashboard** — Overview of your workout stats, weekly activity charts, workout-type distribution, recent workouts, active goals, and Renpho body-composition snapshot.
- **Workouts** — Log training sessions with name, type, muscle group, duration, calories, individual exercises (sets/reps/weight), and notes. Search and filter your workout history.
- **Goals** — Create fitness goals with target values, deadlines, and categories. Track progress with visual progress bars and mark goals complete.
- **AI Coach** — Chat with a Gemini-powered AI fitness coach that has context about your workouts, goals, and body data. Quick-prompt buttons for workout suggestions, progress analysis, nutrition tips, and motivation.
- **Connections** — Connect Fitbit to sync steps, calories, heart rate, sleep, and weight data. Import Renpho smart-scale CSV exports for body-composition tracking with trend charts. Sample data available for demo.
- **Profile** — Update your display name, weight, height, age, and weekly workout target. View lifetime stats and manage stored data.

All data is persisted in the browser's `localStorage` — no server or account required.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/CoryBrown-42/FitTrip.git
cd FitTrip

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app opens automatically at **http://localhost:3000**.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with hot-reload |
| `npm run build` | Create a production build in the `dist/` folder |
| `npm run preview` | Preview the production build locally |

---

## Using the App

### Logging a Workout

1. Navigate to **Workouts** from the sidebar.
2. Click **Log Workout**.
3. Fill in the workout name, date, type, muscle group, duration, and estimated calories.
4. Optionally add individual exercises with sets, reps, and weight.
5. Add any notes, then click **Save Workout**.

### Setting Goals

1. Navigate to **Goals** from the sidebar.
2. Click **New Goal**.
3. Enter a goal name, category, unit, current value, target value, and optional deadline.
4. Click **Create Goal**.
5. Update progress directly from the goal card or mark it complete.

### AI Fitness Coach

1. Navigate to **AI Coach** from the sidebar.
2. Type a question or tap a quick-prompt button (e.g., *Suggest a workout*, *Analyze my progress*).
3. The AI uses your workout history, active goals, and body data to give personalized responses.

> **Note:** The AI Coach requires an active internet connection and uses the built-in Gemini API key.

### Importing Body Composition Data (Renpho)

1. Navigate to **Connections** from the sidebar.
2. Under **Renpho Scale**, click **Import Renpho CSV** and select a CSV file exported from the Renpho app.
3. Alternatively, click **Load Sample Data** to explore with demo data.
4. Weight, body fat, and muscle mass trends will appear in charts on the Connections page and Dashboard.

### Connecting Fitbit (Optional)

Fitbit integration requires registering a developer app:

1. Go to [Fitbit Developer](https://dev.fitbit.com/apps) and register a new app.
2. Set **OAuth 2.0 Application Type** to "Client" (for implicit grant).
3. Set **Callback URL** to `http://localhost:3000/connections`.
4. Copy the **Client ID** (OAuth 2.0 Client ID) into `src/services/fitbit.js` (the `FITBIT_CLIENT_ID` constant).
5. Navigate to **Connections** in the app and click **Connect Fitbit**.
6. Authorize with your Fitbit account — steps, heart rate, sleep, and weight data will sync automatically.

### Profile

1. Navigate to **Profile** from the sidebar.
2. Update your name, weight, height, age, and weekly workout target.
3. Click **Save Profile** — these values help the AI Coach personalize its advice.
4. Use **Clear All Data** in the Danger Zone to reset the app.

---

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Recharts** — Charts and data visualization
- **Lucide React** — Icon library
- **Google Generative AI (Gemini)** — AI fitness coaching
- **date-fns** — Date formatting utilities
- **Vite 5** — Build tool and dev server

---

## Project Structure

```
FitTrip/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS theme/colors
├── postcss.config.js       # PostCSS plugins
├── public/                 # Static assets
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Route definitions
    ├── index.css           # Global styles & Tailwind directives
    ├── components/
    │   └── Layout.jsx      # Sidebar navigation & page shell
    ├── context/
    │   └── AppContext.jsx   # Global state (workouts, goals, profile)
    ├── pages/
    │   ├── Dashboard.jsx   # Stats overview & charts
    │   ├── Workouts.jsx    # Workout logging & history
    │   ├── Goals.jsx       # Goal tracking
    │   ├── AICoach.jsx     # Gemini AI chat interface
    │   ├── GoogleFit.jsx   # Device connections (Fitbit & Renpho)
    │   └── Profile.jsx     # User profile & settings
    └── services/
        ├── gemini.js       # Gemini AI API integration
        ├── fitbit.js       # Fitbit Web API client
        ├── googleFit.js    # Google Fit REST API client (deprecated)
        ├── renpho.js       # Renpho CSV parser & sample data
```

---

## License

See [LICENSE](LICENSE) for details.
