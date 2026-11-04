CAPSULE AP — VERSION 3.0 | L3 ADMINISTRATION PUBLIQUE 2026–2027
Mis à jour le 4 novembre 2026.

CONTENU
- 217 capsules de révision (S5 et S6) conservées.
- 2 170 questions (10 par capsule), dont 868 questions d'origine.
- 1 302 nouvelles questions d'approfondissement générées à partir des sections
  de synthèse existantes. IMPORTANT : ces questions de repérage et de raisonnement
  nécessitent une relecture pédagogique et juridique avant publication large.
  Elles NE constituent PAS 1 302 cas pratiques originaux vérifiés.
- Correction et explication pour chaque choix, résultats /10.
- Rubrique « Proposer une amélioration » dans Espace perso.
- Support des comptes par e-mail, stockage et synchronisation facultatifs via Supabase.

INSTALLATION LOCALE / DEMO SANS COMPTE
- Décompresser l'archive complète puis ouvrir index.html dans un navigateur.
- Les résultats restent sur l'appareil via localStorage.
- Les suggestions sont enregistrées localement (non envoyées) :
  Espace perso > Exporter mes suggestions.
- Pour iPhone, héberger le dossier sur HTTPS (GitHub Pages ou Netlify), puis
  Safari > Partager > Sur l'écran d'accueil.

ACTIVER LES COMPTES INDIVIDUELS ET LES SUGGESTIONS COLLABORATIVES
1. Créer un projet sur https://supabase.com (formule gratuite possible,
   sous réserve des quotas et conditions en vigueur).
2. Dans le projet, ouvrir SQL Editor et exécuter le fichier schema.sql.
3. Dans Authentication > Providers, autoriser l'e-mail et décider si l'e-mail
   de confirmation est obligatoire (fortement recommandé).
4. Dans Authentication > URL Configuration, renseigner l'URL HTTPS finale
   de Capsule AP et ses URL de redirection si nécessaire.
5. Dans Project Settings > API, récupérer l'URL du projet et sa clé
   « anon/public » (ou clé publique publishable compatible).
6. Modifier auth-config.js : remplir url et anonKey.
   Ne JAMAIS placer de clé secret/service_role dans ce fichier.
7. Déployer TOUS les fichiers sur un hébergement HTTPS.
8. Chaque étudiant peut créer son compte depuis « Espace perso ».
   Il peut enregistrer sa progression et envoyer des suggestions.
9. L'administrateur retrouve les suggestions dans Supabase > Table Editor >
   public.suggestions. Les règles RLS empêchent les étudiants de consulter
   les données privées des autres comptes.

MISE À JOUR DE LA VERSION GITHUB
- Remplacer les fichiers du dépôt d'origine par ceux de cette archive.
- La nouvelle version du service worker force le rafraîchissement du cache.
- Les anciens résultats locaux sont conservés sur le même appareil.
- La migration vers les comptes s'effectue au premier login ; l'utilisateur
  doit choisir s'il conserve la progression distante lorsque celle-ci existe.
- Il n'y a pas de création ni de déploiement automatique du projet Supabase.

SÉCURITÉ / CONFIDENTIALITÉ
- Ne partagez jamais de mot de passe, de clé Supabase service_role ou de contenu
  des supports CNED protégés.
- Les données sont hébergées chez Supabase UNIQUEMENT si l'administrateur
  configure le service ET si les étudiants s'inscrivent.
- L'administrateur doit mettre en place une information sur la confidentialité,
  la finalité des traitements et la durée de conservation avant déploiement.
- Les suggestions non envoyées restent dans le navigateur local.
- L'outil est une aide à la révision NON OFFICIELLE de l'IPAG ou du CNED.
