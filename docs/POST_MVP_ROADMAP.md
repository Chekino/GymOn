# Feuille de route Post-MVP (Backlog & Dette Technique)

Ce document centralise l'ensemble des tâches, optimisations et fonctionnalités reportées après la livraison du MVP de GymOn. Il est mis à jour au fil du développement.

---

## 1. Tâches de fond et automatisation (Cron & Maintenance)

- **Purge des tokens révoqués expirés** :
  - *Contexte* : La table `revoked_tokens` stocke les empreintes des jetons invalidés lors de la déconnexion.
  - *À faire* : Mettre en place un cron régulier (ex: quotidien) pour exécuter `DELETE FROM revoked_tokens WHERE expires_at < NOW()`.
- **Suppression définitive des comptes (Hard Delete après Soft Delete)** :
  - *Contexte* : Lors d'un `DELETE /users/me`, le compte est marqué avec `deleted_at = NOW()`.
  - *À faire* : Mettre en place un cron pour purger définitivement les données personnelles (conformité RGPD) après un délai de grâce (ex: 30 jours) : `DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days'`.
- **Gestion des séances orphelines à la suppression d'un hôte** :
  - *Contexte* : Si un hôte supprime son compte alors qu'il a des séances futures ouvertes ou pleines.
  - *À faire* : Basculer automatiquement ces séances au statut `CANCELLED` et informer les participants.

---

## 2. Fonctionnalités applicatives (Hors MVP)

- **Notifications par email transactionnels (Post-Frontend)** :
  - *Décision* : Les notifications critiques seront envoyées par email (ex: Nodemailer / Resend / Brevo).
  - *Planning* : À implémenter une fois le frontend React terminé.
  - *Cas d'usage prioritaires demandés* :
    - **Email à l'hôte lors d'une nouvelle adhésion** : Dès qu'un sportif postule pour rejoindre sa séance (`status: PENDING`), l'hôte reçoit un email avec le prénom du candidat, son niveau, sa bio et un bouton direct pour accepter ou refuser.
    - **Email au sportif lors de l'acceptation** : Dès que l'hôte clique sur « Accepter » (`status: ACCEPTED`), le sportif reçoit immédiatement un email de confirmation avec l'adresse exacte de la salle, l'heure du rendez-vous et les coordonnées du binôme.
    - **Email au sportif en cas de refus** (`status: DECLINED`) pour lui permettre de chercher un autre créneau sans attendre.
    - **Email à tous les participants en cas d'annulation de séance** (`status: CANCELLED`) par l'hôte.
- **Messagerie instantanée** : Chat entre participants d'une même séance acceptée (WebSockets ou solution gérée).
- **Modération & Sécurité** : Signalement de profils et blocage mutuel d'utilisateurs (les relations SQL ont été anticipées pour cela).
- **Avis et réputation** : Évaluation mutuelle entre sportifs après le déroulement d'une séance (`DONE`).
- **Gestion avancée du compte & Authentification robuste** :
  - *Changement d'email sécurisé et réinitialisation de mot de passe* : Par lien magique / token temporaire envoyé par email.
  - *Couple Access Token / Refresh Token avec rotation (OWASP)* :
    - *Contexte actuel* : Un jeton JWT unique de 7 jours est émis, avec révocation immédiate via empreinte SHA-256 dans `revoked_tokens` à la déconnexion.
    - *À faire Post-MVP* :
      1. Émettre un **Access Token** court (durée 15 minutes) transmis dans le header `Authorization: Bearer <token>`.
      2. Émettre un **Refresh Token** long (durée 30 jours) stocké dans un cookie sécurisé non lisible en JavaScript (`httpOnly`, `Secure`, `SameSite=Strict`).
      3. Créer une route `POST /api/v1/auth/refresh` qui effectue une rotation à chaque appel (l'ancien refresh token est invalidé, un nouveau couple est généré).
      4. Mettre en place un intercepteur Axios côté frontend pour rafraîchir le jeton de manière totalement transparente pour l'utilisateur en cas d'expiration 401.
- **Salles favorites & Séances récurrentes** : Mémorisation de salles préférées et planification hebdomadaire automatique.
