# Spécification et Conception Frontend — GymOn

Ce document constitue la **source de vérité** pour le développement du frontend de GymOn.
Il définit l'architecture logicielle, la stack technique, les parcours utilisateurs et le plan de développement étape par étape.

---

## 1. Vision du Produit & Expérience Utilisateur

GymOn est une application web **mobile-first** conçue pour permettre à des sportifs de trouver rapidement un partenaire d'entraînement en salle selon :
- La proximité géographique des salles de sport partenaires.
- Les créneaux horaires disponibles.
- Le niveau sportif (Débutant, Intermédiaire, Avancé) et le type de séance (Push, Pull, Legs, Full Body, etc.).

L'application consomme exclusivement l'API REST sécurisée développée dans `server/` (`/api/v1`).

---

## 2. Stack Technique Frontend

| Outil / Bibliothèque | Version / Type | Rôle & Justification |
|---|---|---|
| **React JS** | 18+ (JavaScript ESM) | Interface utilisateur déclarative et composants réutilisables (sans TypeScript pour rester simple et accessible). |
| **Vite** | Dernière LTS | Outil de build et serveur de développement ultra-rapide (HMR instantané). |
| **Tailwind CSS** | 3.4+ | Framework utilitaire CSS pour concevoir une interface moderne, sobre et responsive sans quitter le JSX. |
| **React Router** | 6+ | Gestion de la navigation côté client, historique et protection des routes membres (`<ProtectedRoute>`). |
| **Zustand** | 4+ | Gestion de l'état global côté client : session utilisateur, token JWT et persistance dans `localStorage`. |
| **TanStack Query** | v5 (React Query) | Gestion du cache serveur, des requêtes API asynchrones, du rafraîchissement automatique et de la synchronisation de l'état distant. |
| **Axios** | 1.7+ | Client HTTP avec configuration de l'URL de base (`http://localhost:3000/api/v1`) et intercepteurs automatiques (injection du `Bearer token` et gestion du 401). |
| **Motion** (`framer-motion`) | 11+ | Moteur d'animations physiques (ressorts Apple, transitions fluides, bottom sheets interruptibles, micro-interactions tactiles). |
| **Lucide React** | Dernière version | Bibliothèque d'icônes vectorielles légères et cohérentes (haltères, calendrier, carte, utilisateur, etc.). |

---

## 3. Architecture des Dossiers (`client/src`)

Pour garantir une maintenance facile et respecter la séparation des responsabilités, le code source du client est structuré ainsi :

```text
client/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── api/                     # Instances Axios et fonctions d'appels API
    │   ├── apiClient.js         # Instance Axios avec intercepteurs JWT & 401
    │   ├── auth.api.js          # signup, login, logout
    │   ├── user.api.js          # getMe, updateMe, deleteMe
    │   ├── gym.api.js           # listGyms, getGymById, suggestGym
    │   ├── session.api.js       # listSessions, getSessionById, createSession, updateSession, getMyHostedSessions
    │   └── participation.api.js # requestParticipation, getSessionParticipations, updateStatus, getMyParticipations
    │
    ├── store/                   # État global client (Zustand)
    │   └── authStore.js         # token, user, isAuthenticated, login, logout
    │
    ├── hooks/                   # Hooks personnalisés TanStack Query
    │   ├── useAuth.js           # Wrappers mutations auth
    │   ├── useSessions.js       # useQuery séances, useMutation création/annulation
    │   └── useParticipations.js # useQuery participations, useMutation statut
    │
    ├── components/              # Composants réutilisables
    │   ├── ui/                  # Éléments atomiques (Button, Input, Badge, Card, Modal, Spinner)
    │   ├── layout/              # Navbar, MobileNav (barre de navigation basse sur mobile), Layout principal
    │   └── sessions/            # SessionCard, SessionFilters, ParticipantList
    │
    ├── pages/                   # Vues complètes de l'application
    │   ├── LoginPage.jsx        # Connexion
    │   ├── SignupPage.jsx       # Inscription
    │   ├── ExplorePage.jsx      # Découverte et liste filtrable des séances
    │   ├── SessionDetailPage.jsx# Détail d'une séance + bouton Rejoindre / Gérer
    │   ├── CreateSessionPage.jsx# Formulaire de création de séance
    │   ├── MySessionsPage.jsx   # Espace Hôte : séances créées et candidatures reçues
    │   ├── MyParticipationsPage.jsx # Espace Participant : suivi de ses demandes
    │   ├── ProfilePage.jsx      # Mon profil (consultation et modification)
    │   └── NotFoundPage.jsx     # Erreur 404
    │
    ├── routes/                  # Configuration du routage
    │   ├── AppRoutes.jsx        # Table de navigation React Router
    │   └── ProtectedRoute.jsx   # Garde de route (redirection vers /login si non authentifié)
    │
    ├── App.jsx                  # Montage des providers (QueryClientProvider, BrowserRouter)
    ├── main.jsx                 # Point d'entrée Vite
    └── index.css                # Directives Tailwind CSS et styles globaux
```

---

## 4. Parcours Utilisateur & Écrans Clés

### 4.1 Authentification (`/login` et `/signup`)
- **Inscription** : Formulaire avec nom, email, mot de passe, niveau sportif initial (Débutant, Intermédiaire, Avancé) et sports pratiqués.
- **Connexion** : Formulaire email + mot de passe. À la validation, le token est enregistré dans le store Zustand et persisté dans `localStorage`.
- Si l'utilisateur est déjà connecté, redirection automatique vers la page d'exploration `/sessions`.

### 4.2 Découverte & Exploration des Séances (`/sessions` ou `/`)
- **Affichage** : Liste de cartes de séances à venir avec badges de niveau, durée, type d'activité (ex: "Hypertrophie Dos"), salle de sport et nombre de places restantes (`1/2 places disponibles`).
- **Filtres interactifs** : Par niveau, par salle, et date.
- Bouton d'action flottant (+) pour créer une séance.

### 4.3 Détail d'une Séance (`/sessions/:id`)
- Fiche complète : date/heure, durée, adresse de la salle, profil de l'hôte (prénom, niveau, bio).
- Liste des participants déjà acceptés.
- **Bouton d'action dynamique** :
  - Si l'utilisateur connecté est l'hôte : bouton « Gérer les demandes » ou « Annuler la séance ».
  - Si la séance est pleine (`FULL`) : badge "Complet".
  - Si le sportif a déjà postulé : badge "Demande envoyée (En attente)" ou "Participation confirmée".
  - Sinon : bouton bien visible « Demander à rejoindre ».

### 4.4 Création d'une Séance (`/sessions/new`)
- Formulaire épuré :
  - Sélection de la salle (dropdown ou recherche rapide parmi les salles existantes).
  - Date et heure (sélecteur avec validation : obligatoirement dans le futur).
  - Durée (en minutes, avec suggestions : 45 min, 60 min, 90 min, 120 min).
  - Type d'activité (texte libre : Musculation, Push/Pull/Legs, Cross-training, etc.).
  - Niveau recommandé (BEGINNER, INTERMEDIATE, ADVANCED).
  - Capacité totale (2 ou 3 personnes, hôte inclus).

### 4.5 Espace Hôte — « Mes Séances Créées » (`/my-sessions`)
- Liste des séances organisées par l'utilisateur connecté.
- Pour chaque séance :
  - Statut de la séance (`OPEN`, `FULL`, `CANCELLED`).
  - Bloc des candidatures reçues avec le profil du candidat (prénom, niveau, sports, bio).
  - Actions immédiates : bouton vert « Accepter » et bouton rouge « Refuser ».
  - Si la séance est pleine, bouton « Accepter » désactivé automatiquement.

### 4.6 Espace Sportif — « Mes Participations » (`/my-participations`)
- Liste des séances auxquelles le sportif a postulé.
- Badge d'état clair pour chaque candidature :
  - `PENDING` (En attente de la réponse de l'hôte) : bouton « Annuler ma demande ».
  - `ACCEPTED` (Confirmé !) : détails complets de la séance et bouton « Annuler ma venue ».
  - `DECLINED` (Demande refusée).
  - `CANCELLED` (Annulée).

### 4.7 Mon Profil (`/profile`)
- Consultation et modification de ses informations (prénom, niveau, sports, bio).
- Bouton de déconnexion sécurisée (appelle l'API `POST /auth/logout` pour révoquer le token et nettoie le `localStorage`).
- Option de suppression du compte (Soft-delete).

---

## 5. Gestion de l'Authentification & Sécurité Client

1. **Intercepteur Axios (Requêtes)** :
   - Chaque requête sortante injecte automatiquement le header :
     `Authorization: Bearer <token>` récupéré du store Zustand.
2. **Intercepteur Axios (Réponses)** :
   - Si l'API renvoie un code HTTP `401 Unauthorized` (token expiré ou révoqué suite à une déconnexion) :
     - Le store Zustand déclenche automatiquement `logout()`.
     - L'utilisateur est redirigé immédiatement vers la page de connexion avec un message explicatif.
3. **Protection des routes** :
   - Le composant `<ProtectedRoute>` enveloppe toutes les pages privées. Si aucun token n'est présent, redirection automatique vers `/login`.

---

## 6. Découpage en Étapes de Développement (Méthodologie Progressive)

Pour respecter le **mode apprentissage** (3 à 4 fichiers par étape, explications avant/après, validation explicite par l'utilisateur), le frontend sera construit dans l'ordre suivant :

1. **Étape 1 : Initialisation & Socle technique**
   - Création du projet Vite dans `client/`.
   - Installation et configuration de Tailwind CSS, React Router, Zustand, TanStack Query et Axios.
   - Configuration du client Axios (`apiClient.js`) et de la variable d'environnement `VITE_API_BASE_URL`.

2. **Étape 2 : Store d'authentification & Pages Connexion / Inscription**
   - Store Zustand `authStore.js`.
   - Pages `LoginPage.jsx` et `SignupPage.jsx` avec design moderne Tailwind.
   - Composant `<ProtectedRoute.jsx>`.

3. **Étape 3 : Navigation principale & Page Profil**
   - Mise en page globale (`Navbar` desktop + `MobileNav` basse sur mobile).
   - Page `ProfilePage.jsx` (lecture du profil et mise à jour des informations).
   - Déconnexion fonctionnelle.

4. **Étape 4 : Exploration & Détail des séances**
   - Hooks TanStack Query pour lister et filtrer les séances (`useSessions.js`).
   - Page `ExplorePage.jsx` avec cartes interactives et filtres.
   - Page `SessionDetailPage.jsx` avec consultation complète.

5. **Étape 5 : Création d'une séance**
   - Page `CreateSessionPage.jsx` avec sélection des salles et validations.
   - Redirection automatique vers la séance créée après succès.

6. **Étape 6 : Workflow complet des candidatures (Hôte & Participant)**
   - Page `MySessionsPage.jsx` : validation/refus des candidatures avec rafraîchissement automatique du cache.
   - Page `MyParticipationsPage.jsx` : suivi des candidatures et annulation.
   - Bouton « Demander à rejoindre » opérationnel sur `SessionDetailPage.jsx`.

7. **Étape 7 : Polissage UI/UX, gestion des états vides & Responsive**
   - États de chargement (*skeletons* pulsés), messages d'erreur conviviaux, états vides (« Aucune séance trouvée »).

---

## 7. Directives UI/UX Senior & Finitions Mobile-Native (Inspirées d'Apple & Emil Kowalski)

Pour que GymOn ne ressemble pas à un simple site web responsive mais offre une **sensation d'application native installée**, nous appliquons rigoureusement les standards de nos skills spécialisés (`mobile-native`, `apple-design`, `emil-design-eng`) :

### 7.1 Élimination des défauts web sur mobile (`mobile-native`)

| Défaut Web classique | Solution Senior adoptée | Raison technique |
|---|---|---|
| **Flash gris/bleu au tap** | `-webkit-tap-highlight-color: transparent;` | Supprime le rectangle gris disgracieux natif d'iOS et Android. |
| **Hover collé sur tactile** | `future: { hoverOnlyWhenSupported: true }` dans Tailwind | Sur smartphone, le premier tap figeait l'état `:hover`. Seuls les vrais curseurs souris doivent déclencher le survol. |
| **Hauteur 100vh instable** | Utilisation de `100dvh` (app shell/tiroirs) et `100svh` | `100vh` déborde sous la barre d'adresse mobile. `dvh` s'adapte dynamiquement. |
| **Zoom automatique sur input** | Taille de police minimale de `16px` (`text-base`) | iOS Safari zoome brutalement la page dès qu'un champ texte a une taille < 16px. |
| **Latence au toucher (300ms)** | `touch-action: manipulation;` | Supprime le délai d'attente du double-tap du navigateur. |
| **Bouton sous l'encoche/home bar** | `viewport-fit=cover` + `env(safe-area-inset-bottom)` | Protège la barre de navigation mobile des gestes de balayage du système. |
| **Sélection de texte involontaire** | `user-select: none;` sur boutons, badges et onglets | Empêche la bulle de sélection de texte lors d'un appui prolongé sur un bouton. |

### 7.2 Principes de Motion & Design d'Interaction (`apple-design` & `emil-design-eng`)

1. **Feedback tactile instantané (`:active`)** :
   - Tout élément cliquable réagit immédiatement au `pointerdown` avec une légère compression physique :
     `transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);` et `active:scale-[0.97]`.
   - L'interface prouve instantanément à l'utilisateur qu'elle a reçu son intention.

2. **Animations physiques par ressorts (*Springs*)** :
   - Abandon des courbes molles `ease-in` au profit d'animations de ressorts physiques (via `framer-motion` / Motion).
   - Paramètres Apple par défaut : amortissement critique (*critically damped* `damping: 1.0`) pour un arrêt net et élégant sans oscillations artificielles.
   - Durées d'action courtes (< 250ms) pour maximiser la sensation de rapidité (*perceived performance*).

3. **Entrées visuelles naturelles (Bannir `scale(0)`)** :
   - Dans le monde réel, aucun objet ne surgit du néant absolu.
   - Les modales et cartes entrent toujours depuis `scale(0.95)` avec une transition d'opacité `opacity: 0 -> 1`.

4. **Profondeur & Matériaux translucides (*Glassmorphism*)** :
   - La barre de navigation fixe et la barre mobile basse utilisent un matériau dépoli :
     `backdrop-blur-md bg-zinc-950/80 border-t border-zinc-800/60`.
   - Donne une impression d'immersion où le contenu défile sous une surface de verre.

5. **Hiérarchie typographique athlétique** :
   - Police moderne et dense avec un crénage resserré sur les titres et chiffres (`tracking-tight font-semibold`).
   - Contraste élevé adapté aux environnements lumineux de salle de sport.
   - Squelettes de chargement animés (*Skeleton shimmer*) calqués sur la structure finale pour éviter tout saut de mise en page (*layout shift*).
