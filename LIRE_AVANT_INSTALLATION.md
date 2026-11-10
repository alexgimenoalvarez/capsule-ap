# Capsule AP V5 — Coach de révision (10 novembre 2026)

## Contenu de cette livraison

La version V5 conserve les 217 capsules, les 2 170 QCM de la V4, les comptes Supabase facultatifs, la progression des QCM, la bibliothèque de documents privés et les fonctions de recherche locale. Elle ajoute :

1. **Coach / planning hebdomadaire** : choix des jours, durée par jour, matière prioritaire, tâches cochables et suivi des activités de la semaine.
2. **Séances rapides** : 5, 15, 30 ou 60 minutes, avec étapes à réaliser selon l'objectif (points faibles, nouvelle notion, entraînement examen).
3. **Flashcards** : cartes construites à partir des questions/corrections des capsules existantes, filtres par matière, révision espacée selon « À revoir / Bien / Facile ».
4. **QRC** : sujets d'entraînement générés à partir des sections réelles de chaque capsule, rédaction libre, éléments de référence et grille d'autoévaluation. **Il n'y a pas de note IA.**
5. **Export et import des données du Coach** : sauvegarde JSON indépendante pour planning, cartes et QRC.

### Limites importantes
- Les nouvelles données du **Coach** sont stockées localement dans le navigateur ; elles ne sont **pas synchronisées par Supabase**. Le login n'est pas obligatoire.
- Les évaluations QRC sont une **autoévaluation de l'étudiant**, pas un corrigé officiel, ni une correction automatique fiable.
- Les flashcards reprennent les QCM et leurs corrections, dont certaines questions d'approfondissement demandent une relecture pédagogique.
- La bibliothèque V4 fonctionne sans nouveau compte. Aucun PDF CNED n'est joint au ZIP. Chaque étudiant importe les PDF qu'il a le droit d'utiliser.
- La fonction d'IA générative de la V4 reste **facultative** et non activée automatiquement. Le code optionnel est présent dans `OPTION_IA_SUPABASE/` ; il nécessite un déploiement et une clé serveur séparés.
- SMTP, limitation d'e-mails Supabase et redirection 404 relèvent de la configuration Auth ; cette mise à jour ne les résout pas à elle seule.

## Installation dans le dépôt existant

**Avant de commencer :** dans GitHub → `alexgimenoalvarez/capsule-ap` → bouton vert **Code → Download ZIP** pour sauvegarder la version actuelle. Le dépôt ne doit PAS être supprimé.

1. Télécharge et décompresse le ZIP **Capsule_AP_V5_Coach_2026_2027.zip**.
2. Ouvre le dossier décompressé. Sélectionne **les fichiers contenus dans le dossier**, pas le dossier lui-même.
3. Dans `https://github.com/alexgimenoalvarez/capsule-ap`, clique sur **Add file → Upload files**.
4. Dépose les fichiers dans la **racine** du dépôt, au même niveau que `README.md` et `index.html`. Remplace les fichiers ayant le même nom, puis **Commit changes**.
5. Vérifie `Settings → Pages` : **Deploy from a branch → main → /(root)**, comme pour la version actuelle.
6. Ouvre `https://alexgimenoalvarez.github.io/capsule-ap/` et actualise avec **Ctrl + F5** (ordinateur). Sur mobile, ferme complètement l'app et rouvre-la ; si la V4 reste figée, actualise le site dans Safari/Chrome ou réinstalle le raccourci PWA.
7. L'onglet **Coach** doit apparaître dans la barre du bas. Teste une séance, une carte et une QRC.

**Fichiers indispensables à remplacer** : `index.html`, `app.js`, `style.css`, `sw.js`. **Fichiers nouveaux à ajouter** : `v5-coach.js`, `v5-coach.css`. Les fichiers `lessons.js`, `programme.js`, `v4-docs.js`, `auth.js` et les icônes restent fournis dans le ZIP pour un déploiement complet.

Le fichier `auth-config.js` joint contient **la configuration publique** de ton projet Supabase existant (clé publishable uniquement). Si tu as modifié celle-ci depuis, garde de préférence ta configuration actuelle ; n'ajoute jamais de clés `service_role`, SMTP ou OpenAI au dépôt GitHub.

## Sur iPhone et Android

- **iPhone** : Safari → lien Capsule AP → bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**.
- **Android** : Chrome → lien Capsule AP → menu `⋮` → **Installer l'application** ou **Ajouter à l'écran d'accueil**.
- Pour utiliser **hors connexion**, ouvre une fois l'application lorsque tu as Internet pour charger ses fichiers. Ensuite, mets le téléphone en mode avion et teste le Coach et les QCM. Les PDF importés dans Documents doivent l'être *avant* de passer hors ligne.

## Comment utiliser les nouveautés

1. Ouvre **Coach** depuis la barre du bas.
2. **Planning** : coche les jours disponibles, choisis 15/30/45/60 minutes et éventuellement une matière, puis sauvegarde. Tu peux cocher chaque activité après l'avoir effectuée.
3. **Vue d'ensemble** : sélectionne 5, 15, 30 ou 60 minutes et l'objectif du jour, puis **Préparer ma séance**. Ouvre les exercices proposés et coche les étapes complétées.
4. **Flashcards** : choisis la matière et démarre une session, réponds sans regarder, retourne la carte, puis indique « À revoir », « Bien » ou « Facile ». Les cartes reviennent à une date ultérieure.
5. **QRC** : demande un sujet, rédige une réponse, puis affiche le passage de référence et coche les éléments que tu as réellement traités. Enregistre ton autoévaluation.
6. **Sauvegarde** : dans Coach → Vue d'ensemble → **Exporter mon Coach**. Conserve le JSON ; pour rétablir le travail sur un autre appareil, utilise **Importer un Coach**. L'export des QCM reste distinct, dans **Compte → Exporter**.

## Confidentialité et continuité

Les données du Coach ne quittent pas l'appareil par défaut. Ne partage pas la sauvegarde JSON d'un étudiant sans son accord (elle peut contenir des réponses rédigées). En navigation privée ou après effacement des données du navigateur, la progression locale peut être perdue. Sauvegarde périodiquement les deux exports (QCM et Coach).

## Vérifications / dépannage

- **Page blanche ou ancienne version** : vérifie `index.html` à la racine, l'onglet **Actions** de GitHub, puis rafraîchis le cache. Le service worker utilise la version `capsule-ap-v5-20261110b`.
- **Pas d'onglet Coach** : vérifie le chargement de `v5-coach.js`, `v5-coach.css` et la mise à jour de `app.js` et `index.html`.
- **Cartes dues = 0** : change la matière ou reviens à la date indiquée par la révision espacée.
- **QRC** : la notation est volontairement manuelle, aucun modèle d'IA ne corrige les copies dans la V5.
- **Problèmes de login/SMTP** : les fonctions de révision restent utilisables sans compte ; reporte-toi à la configuration Supabase distincte.
- **Cours complets** : même principe qu'en V4, importer des PDF et leurs index `.txt` personnels dans Documents, sans publier les PDF dans GitHub.
