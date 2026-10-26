CAPSULE AP — APPLICATION DE RÉVISION IPHONE / L3 ADMINISTRATION PUBLIQUE
Version 1.0 — 25 octobre 2026

CONTENU
- 11 capsules S5 (droit constitutionnel, politiques publiques, nouvelle gestion publique,
  droit de la fonction publique, ressources humaines) et 44 questions explicatives.
- Chaque capsule : cours synthétisé et sourcé, environ 10 minutes de lecture attentive,
  4 questions à choix unique ou multiple, correction argumentée par option et pilule de théorie.
- Résultats, rappels des erreurs et notes personnelles sauvegardés localement.
- Export/import de la progression et import de nouvelles capsules par JSON.
- Interface prévue pour l'écran d'un iPhone ; application hors connexion après première visite.

ESSAI SANS INSTALLATION
Pour tester sur un ordinateur, ouvrir Capsule_AP_DEMO.html (fichier fourni séparément).
Le fichier index.html a besoin des fichiers voisins pour fonctionner correctement.

INSTALLER COMME UNE APPLICATION IPHONE — HÉBERGEMENT GRATUIT
1. Créer un compte (ou se connecter) sur https://github.com
2. Créer un nouveau dépôt PUBLIC nommé « capsule-ap ».
3. Y envoyer tous les fichiers de ce dossier : index.html, app.js, style.css,
   lessons.js, manifest.webmanifest, sw.js, icon-192.png, icon-512.png.
   Important : les fichiers doivent être à la racine du dépôt, PAS dans un sous-dossier.
4. Dans GitHub : Settings > Pages > Build and deployment > Deploy from a branch
   puis Main / (root) > Save.
5. Ouvrir https://VOTRE-PSEUDO.github.io/capsule-ap/ quand la publication est active.
6. Sur l'iPhone, ouvrir ce lien avec SAFARI > Partager > Sur l'écran d'accueil >
   activer « Ouvrir comme app web » > Ajouter.
7. Ouvrir ensuite Capsule AP depuis l'écran d'accueil. Une première visite
   en ligne permet de mettre en cache les fichiers pour l'utilisation hors connexion.

IMPORTANT : GitHub Pages héberge des pages publiques. Ne publiez ni dossier CNED
intégral ni informations personnelles dans le dépôt ! Les synthèses ici sont
originales et ne contiennent pas vos relevés ou informations privées.

NOTES ET DONNÉES
Vos résultats sont uniquement stockés dans la mémoire locale du navigateur,
non dans votre compte Gmail ou chez nous. Si vous videz les données Safari,
vos scores et notes peuvent disparaître : utiliser l'export de progression.
L'importation d'un nouveau fichier de capsules s'effectue via « Options ».
Ces capsules sont un outil personnel ; elles ne remplacent pas les programmes,
corrections ni consignes officiels de l'IPAG/CNED.

FICHIERS CLÉS
index.html = page de lancement
style.css = design mobile
app.js = logique de quiz, correction, stockage et navigation
lessons.js = capsules et questions
sw.js = disponibilité hors connexion
manifest.webmanifest + icônes = installation sur l'écran d'accueil

PROCHAINES ÉTAPES POSSIBLES
Ajouter les cours S6, un mode questions aléatoires / révision espacée,
un calendrier synchronisé et une sauvegarde sur compte personnel (ces trois
fonctions nécessiteront une version supérieure avec, pour certaines, un serveur).
