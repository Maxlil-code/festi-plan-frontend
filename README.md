# EventPlanner POC - Frontend

> React + Tailwind CSS frontend pour la plateforme EventPlanner. Interface moderne et responsive permettant aux organisateurs d'événements de planifier, gérer et coordonner leurs événements avec des prestataires de services.

## 🚀 Fonctionnalités Implémentées

### ✅ Authentification & Gestion des Utilisateurs
- **Inscription/Connexion** avec validation des formulaires
- **Gestion des rôles** : Organizer, Provider, Admin
- **Authentification JWT** avec refresh token automatique
- **Gestion de session** avec localStorage et contexte global

### ✅ Dashboards par Rôle

#### Dashboard Organisateur
- Vue d'ensemble des événements (total, à venir, terminés)
- Budget total et statistiques
- Liste des événements avec statuts
- Accès rapide : Créer événement, Voir quotes, Parcourir venues

#### Dashboard Provider
- Statistiques des quotes (total, en attente, acceptées)
- Revenus et bookings
- Liste des quotes récentes avec liens directs
- Liste des bookings confirmés

#### Dashboard Admin
- Vue d'ensemble globale de la plateforme
- Gestion des utilisateurs et métriques

### ✅ Gestion des Événements
- **Create Event Wizard** multi-étapes :
  - Informations de base (titre, description, type)
  - Date, heure et localisation
  - Nombre d'invités et budget
  - Recommandations AI automatiques de venues
- **Event Detail Page** avec gestion complète
- **Liste des événements** avec filtres et tri

### ✅ Catalogue de Venues
- **VenueListPage** : Parcours et recherche de venues
- **VenueDetail** : 
  - Galerie d'images
  - Calendrier de disponibilité
  - Modal de demande de quote
  - Policies et détails complets

### ✅ Système de Quotes Complet

#### QuoteListPage (Organisateurs)
- Liste filtrée des quotes reçues
- Filtres par statut (pending, accepted, rejected)
- Tri par date, montant, date d'événement
- Statistiques et moyennes des quotes

#### QuoteDetailPage (Providers & Organisateurs)
- Détails complets de la quote et de l'événement
- Actions provider : Accepter/Rejeter/Modifier quote
- Modal d'édition des quotes (montant, notes, validité)
- Modal de rejet avec raison
- Informations client/provider complètes
- Contact direct via chat ou email

### ✅ Système de Bookings
- **BookingDetailPage** avec tous les détails
- Gestion des statuts (pending, confirmed, completed, cancelled)
- Informations de paiement
- Actions : Confirmer, Annuler, Imprimer
- Contact direct entre parties

### ✅ Chat & Notifications Temps Réel

#### ChatPage
- Messagerie instantanée avec Socket.IO
- Historique des conversations
- Typing indicators en temps réel
- Interface moderne et responsive

#### Système de Notifications
- **NotificationBell** dans la navbar
- Badge avec compteur de notifications non lues
- Notifications temps réel via WebSocket
- Hook `useNotifications` pour la gestion

### ✅ Composants UI Réutilisables
- **Button** : Variants (primary, secondary, outline), sizes, loading states
- **Input** : Validation, labels, error states
- **Card** : Container modulaire avec shadows
- **Badge** : Variants colorés selon le contexte
- **Modal** : Overlay responsive avec gestion du focus
- **Spinner** : Loading states avec différentes tailles
- **Toast** : Notifications contextuelles (success, error, warning, info)

### ✅ Gestion des Erreurs & UX
- **ErrorBoundary** : Capture et affichage gracieux des erreurs
- **ToastProvider** : Notifications globales cohérentes
- **Hook useError** : Gestion centralisée des erreurs API
- Messages d'erreur contextuels et informatifs

### ✅ Theming & Dark Mode
- **ThemeProvider** : Gestion du theme global
- **ThemeToggle** : Bouton dans la navbar
- Sauvegarde de préférence dans localStorage
- Support système preference detection
- Classes Tailwind dark: complètes

### ✅ Design System & Responsive
- **Palette de couleurs cohérente** : Primary, Accent, Neutral
- **Typographie Inter** avec poids appropriés
- **Mobile-first** design avec breakpoints
- **Spacing consistant** selon l'échelle Tailwind
- **Composants accessibles** avec focus management

## 🛠 Technologies Utilisées

- **React 18** avec hooks modernes
- **React Router v6** pour le routing
- **Tailwind CSS** pour le styling
- **HeadlessUI** pour les composants accessibles
- **Heroicons** pour l'iconographie
- **Socket.IO Client** pour le temps réel
- **Axios** pour les appels API
- **Vite** comme bundler de développement

## 📁 Structure du Projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   ├── Badge.jsx
│   ├── Spinner.jsx
│   ├── Toast.jsx
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── NotificationBell.jsx
│   ├── ThemeToggle.jsx
│   ├── ErrorBoundary.jsx
│   └── index.js
├── contexts/            # Contextes React
│   ├── AuthContext.jsx     # Authentification globale
│   ├── SocketContext.jsx   # WebSocket connection
│   ├── ToastContext.jsx    # Notifications
│   └── ThemeContext.jsx    # Gestion du theme
├── hooks/               # Hooks personnalisés
│   ├── useNotifications.js
│   └── useError.js
├── pages/               # Pages de l'application
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardRouter.jsx
│   ├── DashboardOrganizer.jsx
│   ├── DashboardProvider.jsx
│   ├── DashboardAdmin.jsx
│   ├── CreateEventWizard.jsx
│   ├── EventDetail.jsx
│   ├── VenueListPage.jsx
│   ├── VenueDetail.jsx
│   ├── QuoteListPage.jsx
│   ├── QuoteDetailPage.jsx
│   ├── BookingDetailPage.jsx
│   └── ChatPage.jsx
├── router/              # Configuration du routing
│   ├── AppRouter.jsx
│   └── PrivateRoute.jsx
├── services/            # Services API
│   ├── api.js              # Configuration Axios
│   ├── authService.js      # Authentification
│   ├── eventService.js     # Gestion des événements
│   ├── venueService.js     # Gestion des venues
│   ├── quoteService.js     # Gestion des quotes
│   ├── bookingService.js   # Gestion des bookings
│   ├── messageService.js   # Chat & messages
│   ├── userService.js      # Gestion des utilisateurs
│   └── aiService.js        # Recommandations AI
└── assets/              # Assets statiques
```

## 🎯 Routing & Navigation

| Route | Composant | Accès | Description |
|-------|-----------|-------|-------------|
| `/login` | LoginPage | Public | Connexion |
| `/register` | RegisterPage | Public | Inscription |
| `/dashboard` | DashboardRouter | Protégé | Dashboard par rôle |
| `/events/new` | CreateEventWizard | Organizer | Création d'événement |
| `/events/:id` | EventDetail | Organizer | Détails d'événement |
| `/venues` | VenueListPage | Authentifié | Catalogue des venues |
| `/venues/:id` | VenueDetail | Authentifié | Détails d'une venue |
| `/quotes` | QuoteListPage | Organizer | Liste des quotes |
| `/quotes/:id` | QuoteDetailPage | Authentifié | Détails d'une quote |
| `/bookings/:id` | BookingDetailPage | Authentifié | Détails d'un booking |
| `/chat/:conversationId` | ChatPage | Authentifié | Messagerie |

## 🔄 Flux Utilisateur Principal

### Pour un Organisateur :
1. **Inscription/Connexion** → Dashboard
2. **Créer un événement** → Wizard multi-étapes → Recommandations AI
3. **Parcourir les venues** → Demander des quotes
4. **Gérer les quotes** → Accepter/Négocier → Booking
5. **Chat avec providers** → Coordination
6. **Suivi des bookings** → Gestion de l'événement

### Pour un Provider :
1. **Inscription/Connexion** → Dashboard Provider
2. **Recevoir des demandes de quotes** → Notification
3. **Créer/Modifier quotes** → Envoyer à l'organisateur
4. **Gérer les bookings** → Confirmer les services
5. **Chat avec clients** → Support et coordination

## 🚀 Démarrage Rapide

### Prérequis
- Node.js v18+
- npm v10+
- Backend EventPlanner en cours d'exécution sur `http://localhost:4000`

### Installation

```bash
# Clone et navigation
cd event-planner-poc-frontend

# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### Variables d'Environnement

Créer un fichier `.env` :

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### Build de Production

```bash
# Build optimisé
npm run build

# Preview du build
npm run preview
```

## 📱 Responsive Design

L'application est entièrement responsive avec breakpoints :
- **Mobile** : < 640px
- **Tablet** : 640px - 1024px  
- **Desktop** : > 1024px

Tous les composants s'adaptent automatiquement avec des layouts flexibles et des grilles CSS responsives.

## 🔧 Configuration Tailwind

Palette de couleurs personnalisée et configuration optimisée dans `tailwind.config.js` :

```javascript
colors: {
  primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
  accent: { 50: '#ecfeff', 500: '#06b6d4' },
  neutral: { 50: '#f9fafb', 600: '#4b5563', 900: '#111827' }
}
```

## 🤝 Contribution

Pour contribuer au projet :

1. Respecter la structure des composants
2. Utiliser les conventions de nommage (PascalCase pour composants)
3. Maintenir la cohérence du design system
4. Tester la responsivité sur tous les breakpoints
5. Valider l'accessibilité des nouveaux composants

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.

---

**Note** : Cette application est un POC (Proof of Concept) démontrant une plateforme complète de gestion d'événements avec interface moderne, temps réel et expérience utilisateur optimisée.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
