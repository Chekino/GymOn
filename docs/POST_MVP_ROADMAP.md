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

- **Notifications par email (Post-Frontend)** :
  - *Décision* : Les notifications seront gérées par l'envoi d'emails transactionnels (ex: Nodemailer / Resend / Brevo).
  - *Planning* : À implémenter une fois le frontend React terminé.
  - *Cas d'usage* :
    - Email à l'hôte lors d'une nouvelle demande de participation reçue.
    - Email au demandeur lorsque son statut passe à `ACCEPTED` ou `DECLINED`.
    - Email aux participants acceptés en cas d'annulation ou de modification de la séance par l'hôte.
- **Messagerie instantanée** : Chat entre participants d'une même séance acceptée (WebSockets ou solution gérée).
- **Modération & Sécurité** : Signalement de profils et blocage mutuel d'utilisateurs (les relations SQL ont été anticipées pour cela).
- **Avis et réputation** : Évaluation mutuelle entre sportifs après le déroulement d'une séance (`DONE`).
- **Gestion avancée du compte** : Changement d'email sécurisé et réinitialisation de mot de passe par lien magique / token temporaire par email.
- **Salles favorites & Séances récurrentes** : Mémorisation de salles préférées et planification hebdomadaire automatique.
