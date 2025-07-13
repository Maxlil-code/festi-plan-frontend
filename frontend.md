# Frontend Implementation Guide – EventPlanner (POC)

> Follow the steps below to spin up the React + Tailwind front‑end that consumes the backend API and demonstrates all key flows on a single laptop.

## 0. Prerequisites

* **Node.js v18+**, **npm v10+**
* Google Chrome (recommended)
* The backend running at `http://localhost:4000`

## 1. Repository bootstrap

```bash
npm create vite@latest event-planner-poc-frontend -- --template react (deja fait)
cd event-planner-poc-frontend (you are already in the project directory)
npm i
```

## 2. Dependencies

```bash
npm i axios react-router-dom@6 @headlessui/react @heroicons/react \
      socket.io-client tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Tailwind setup

Edit **tailwind.config.js**

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
theme: { extend: {} },
plugins: [],
```

Create **src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 4. Project structure

```
src/
  assets/
  components/
  contexts/
  hooks/
  pages/
  services/
  router/
```

> **Tip:** keep filenames in *PascalCase* for components.

## 5. Global state

Create **src/contexts/AuthContext.jsx** using `createContext` + `useReducer`.

* Store `user`, `token`, `role`.
* Provide `login`, `logout`, `refreshToken`.

## 6. Routing (React Router v6)

| Path                    | Component         | Access                |
| ----------------------- | ----------------- | --------------------- |
| `/login`                | `LoginPage`       | public                |
| `/register`             | `RegisterPage`    | public                |
| `/dashboard`            | `DashboardRouter` | protected, role‑based |
| `/events/:id`           | `EventDetail`     | organizer             |
| `/venues/:id`           | `VenueDetail`     | all                   |
| `/chat/:conversationId` | `ChatPage`        | authenticated         |

Implement **PrivateRoute** HOC.

## 7. Services layer

Create **src/services/api.js**:

```js
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
```

Add specific service files per resource (`authService.js`, `eventService.js`, …) mapping to endpoints listed in §5 of the specfileciteturn1file2.

## 8. Feature‑by‑feature build order

1. **Authentication (0 h 30):**

   * `LoginPage`, `RegisterPage`
   * Call `/auth/login` & `/auth/register`.
   * Store token + user in context/localStorage.

2. **Role dashboards (1 h):**

   * `DashboardOrganizer` (list of events) – GET `/events`.
   * `DashboardProvider` (list of quotes & bookings) – GET `/quotes` & `/bookings`.
   * `DashboardAdmin` – stub with counts.

3. **Create Event Wizard (1 h):**

   * Multi‑step form (event type, date, guests, budget).
   * On submit, POST `/events`.
   * Immediately call `/ai/recommendations` to show venue suggestions.

4. **Venue Catalogue & Detail (0 h 45):**

   * `VenueListPage` – GET `/venues`, simple search field.
   * `VenueDetailPage` – show gallery, availability calendar.

5. **Chat & Notifications (1 h):**

   * Initialise `socket.io-client` once in `App.jsx`.
   * `ChatPage` – load history via GET `/messages/conversations/:id`.
   * Listen for `message:new` events; emit on send.
   * Global `NotificationBell` component highlights unread counts (GET `/users/notifications`).

6. **Quote Flow (0 h 45):**

   * `QuoteDetailPage` shows price breakdown.
   * Organizer can accept/reject via POST `/quotes/:id/accept`.

## 9. Design & Style Guide

Apply a **minimal but cohesive theme** so reviewers instantly recognise the brand across every screen while keeping implementation time ⩽ 30 min.

### 9.1 Color palette (Tailwind custom tokens)

Add the snippet below to the `theme.extend` section of **tailwind.config.js**:

```js
colors: {
  primary: {
    50:  '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',   // buttons, links
    600: '#4f46e5',   // hover
    700: '#4338ca',
  },
  accent: {
    50:  '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',   // highlights, chips
  },
  neutral: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#4b5563',   // body text
    900: '#111827',
  },
}
```

All custom components must consume `bg-primary-500`, `hover:bg-primary-600`, etc. to stay consistent.

### 9.2 Typography

* Import **Inter** once in `index.html`:

  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
  ```
* Extend Tailwind fonts:

  ```js
  fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
  ```
* Use font weights:

  * Heading 1‑2: `font-bold`
  * Heading 3‑4: `font-semibold`
  * Body: `font-normal`

### 9.3 Spacing & Layout

* Stick to Tailwind spacing scale (multiples of `0.5rem`).
* Global wrapper: `<div className="container mx-auto px-4 lg:px-8 max-w-7xl">`.
* Cards: `rounded-2xl shadow-lg p-6 bg-white` (dark → `bg-neutral-900`).
* Mobile‑first: Components must not rely on fixed widths; use `flex-wrap` or CSS grid with `auto-fit`.

### 9.4 Dark mode (optional POC flair – 5 min)

Add to **tailwind.config.js**:

```js
darkMode: 'class',
```

Switch by toggling `class="dark"` on `<html>`.  Default remains light; provide a tiny toggle in the navbar if time allows.

### 9.5 Component conventions

| Element       | Class pattern                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Primary Btn   | `inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40` |
| Secondary Btn | `bg-neutral-200 text-neutral-900 hover:bg-neutral-300`                                                                   |
| Input         | `w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500`                                   |
| Badge         | `inline-block rounded-full px-3 py-1 text-xs bg-accent-100 text-accent-600`                                              |

Implement each as a functional component under `src/components/` so markup stays DRY.

***Time‑box :*** The whole styling pass (config, typography, palette, sample buttons) doit prendre **≤ 30 min**.

---

# AI‑Powered Flows – Frontend Add‑on

---

## 10. AI‑powered flows in the UI

### 10.1 Overview

The wizard now drives **three** calls to the backend:

1. **`POST /events`** – create a *draft* event as soon as the user finishes Step 1.  Returns `eventId`.
2. **`PATCH /events/:id`** – progressively enrich the draft after Steps 2‑4.
3. **`POST /ai/analyze-requirements`** – once *guestCount* **and** *budget* are known, ask GPT‑4o‑mini to structure the requirements.
4. **`POST /ai/recommendations`** – get the 3 best venues.
5. **`POST /ai/generate-quote`** – build a quote for the selected venue.

> The IA sees only the minimal data it needs (**guestCount, budget, services**).  City name is ignored for now, but included in the prompt for future geospatial ranking.

### 10.2 Wizard → API mapping

| Wizard Step                                  | Frontend Action                                           | API Endpoint                                           | Payload                                        |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| **1 · Basics**<br>(title, type, description) | `createDraft()` → store `eventId` in React state          | `POST /events`                                         | `{ title, type, description, status:"DRAFT" }` |
| **2 · Date & Time**                          | `updateEventDates()`                                      | `PATCH /events/:id`                                    | `{ date, startTime, endTime }`                 |
| **3 · Location & Guests**                    | `updateLocationGuests()`                                  | `PATCH /events/:id`                                    | `{ city, guestCount }`                         |
| **4 · Budget & Services**                    | 1) `updateBudgetServices()`<br>2) `analyzeRequirements()` | `PATCH /events/:id`<br>`POST /ai/analyze-requirements` | `{ budget, services }`<br>`{ eventId }`        |
| **5 · Venue suggestions**                    | `fetchRecommendations()`                                  | `POST /ai/recommendations`                             | `{ guestCount, budget }`                       |
| **6 · Quote modal**                          | `fetchQuote()`                                            | `POST /ai/generate-quote`                              | `{ eventId, venueId }`                         |

### 10.3 Fixed lists

* **Services**: `["catering","dj","decor","photography"]`  (update once in `const SERVICES = [...]`).
* **Event types**: `["wedding","birthday","corporate","cocktail","concert"]`.
* Both lists populate `<select>` components; store values as lowercase strings.

### 10.4 React service helpers (`src/services/aiService.js`)

```js
export const analyzeRequirements = (eventId) =>
  api.post('/ai/analyze-requirements', { eventId });

export const fetchRecommendations = (guestCount, budget) =>
  api.post('/ai/recommendations', { guestCount, budget });

export const fetchQuote = (venueId, eventId) =>
  api.post('/ai/generate-quote', { venueId, eventId });
```

### 10.5 Skeleton code – Step 4 submit

```jsx
// WizardStep4.jsx – after formik handleSubmit
await updateBudgetServices({ eventId, budget, services });
await analyzeRequirements(eventId);
next(); // go to suggestions step
```

### 10.6 Skeleton UI – Venue suggestions

```jsx
const { data: venues, isLoading } = useQuery(['reco', guestCount, budget],
  () => fetchRecommendations(guestCount, budget));

if (isLoading) return <Spinner />;
return (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {venues.map(v => <VenueCard key={v.id} venue={v} onQuote={() => openModal(v.id)} />)}
  </div>
);
```

### 10.7 Quote Modal flow

```jsx
const { data: quote, isLoading } = useQuery(['quote', venueId, eventId],
  () => fetchQuote(venueId, eventId));
```

Display `quote.items[]`, `quote.total`.  On **Accept** call `POST /quotes/:id/accept`.

### 10.8 Draft persistence UX

* Dashboard *My events* lists all events where `status==='DRAFT'` first under *Drafts* header.
* Clicking a draft opens the wizard at **the first incomplete step** (infer by checking missing fields).

### 10.9 Error / Retry pattern

* If any AI endpoint <code>500</code> or times out: show toast "Service temporarily unavailable – please retry" + *Retry* button bound to `queryClient.invalidateQueries`.

---

## 11. UI components

Leverage Tailwind + HeadlessUI. Important shared components:

* `Button`, `Input`, `Modal`, `Card`, `Spinner`, `Badge`. Follow *mobile‑first* design; allow wrapping flex items for small screens.

## 12. Running the app

```bash
npm run dev
```

Open `http://localhost:5173` and:

1. Register as **Organizer**.
2. Create an event → AI suggests venues.
3. Open a venue, request a quote → Provider sees it.
4. Accept quote → Booking appears.

---

*End‑to‑end demo time: ≈4 min once databases are seeded.* fileciteturn1file0
