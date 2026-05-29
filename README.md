# Sleeping-dogs_garage

Ceci est le contenu des ECF 6 et 7 (les derniers) pour montrer ma compréhension des connaissances nécessaires en vue de la validation de fin de formation. 
L’interface a été gardée volontairement sobre pour mettre en avant la lisibilité du code, la séparation front/back et la robustesse des fonctionnalités.

## Stacks utilisées

- Côté backend : Node.js / Express, JSON Web Token pour l’authentification, base de données MySQL/MariaDB.
- Côté frontend : HTML / CSS / JavaScript vanilla, appels `fetch` vers l’API, `localStorage` pour le token et l’état du vote.

Fonctionnalités clés : gestion des utilisateurs (register / login), gestion des véhicules (CRUD complet), système de vote avec protection anti double-vote.

## Choses notables et petites modifications

À date, j’ai surtout préparé toute la structure de base et connecté le serveur à la base de données afin de préparer le terrain pour un projet stable.  
Je me suis simplement permis d’ajuster légèrement le schéma de dossier demandé afin de le faire correspondre un peu plus à ma façon de travailler, comme par exemple l’insertion d’un dossier `src/`, ainsi que la modification de `cars` en `vehicle`. Il s’agit certes d’un garage de jeu vidéo, mais il ne faut pas oublier la présence de nos amis motards ! (L’association pour laquelle j’ai fait le site me servant de dossier de fin de formation m’en voudrait sans doute, eheh.)

## fonctionnement backend :

voici déjà ma base de donnée, créée et utilisée pour l'occasion.

![Ma_BDD](public/src/img/readme/1.%20BDD.png)

et voici ici la suite de requêtes postman utilisées pour vérifier les différentes étapes :

1. le lien entre le localhost et l'API.
![réponse_serveur](public/src/img/readme/3.%20connexion%20serveur%20O.K.png)

2. l'inscription d'un compte utilisateur.
![inscription](public/src/img/readme/5.%20register%20requête%20POST.png)

3. la connexion au dit compte utilisateur.
![connexion](public/src/img/readme/6.%20me%20voilà%20connecté..png)

4. l'ajout d'un premier véhicule :
![ajout_vehicule](public/src/img/readme/8,1.png)

5. Modification du dit véhicule.
![modif_vehicule](public/src/img/readme/8,2%20Véhicle%20modifié%20!.png)

6. Suppression du dit véhicule.
![supp_vehicule](public/src/img/readme/8,3.%20Véhicle%20supprimé%20!.png)

7. vote pour un véhicule :
![vote_vehicule](public/src/img/readme/8,4.%20voté%20pour%20le%20véhicule%20!.png)

8. obtenir tous les véhicule.
![get_vehicules](public/src/img/readme/8,5.%20getAllvehicules%20ok%20!.png)

9. Un véhicule pour les gouverner tous... non, attendez... 
![getVehicleById](public/src/img/readme/8,6.%20vehiculebyid%20ok.png)

10. voir les votes
![quels_votes](public/src/img/readme/8,7.getvehiculevote%20ok%20!.png)

## la logique frontend

Voilà une idée de la logique front : 

Un formulaire "ajout" qui prends la place d'un modificateur quand on appuie sur le bouton lié d'un véhicule (pour compte connecté)

![formulaire](public/src/img/readme/Ajouter%20formulaire.png)

Des cartes assez simples pour les lister et pour les modales, afin de démontrer l’utilisation de `getElementById` et la manipulation du DOM.

![cartes](public/src/img/readme/visuel%20des%20cartes.png)

Une barre de recherche fonctionnelle qui peut filtrer les véhicules selon leur nom ou leur catégorie :

![search_bar](public/src/img/readme/barre%20de%20recherche%20fonctionnelle.png)

Tout est ici bien connecté et fonctionnel sur cette logique, j'ai pensé à la petite subtilité demandée, comme le fait d'ajouter un bouton visuellement différent pour ce qui est du vote déjà accompli.

![vote_button](public/src/img/readme/déjà%20voté%20bouton.png)

Et voici un exemple de fonction de mon `script.js` (front) avec `fetch` pour récupérer les données en backend :

![exemple_function](public/src/img/readme/exemple%20fonction%20avec%20fetch.png)

## Interface JavaScript dynamique

L’interface repose sur une logique JavaScript dynamique permettant de mettre à jour l’affichage sans rechargement complet de la page.  
Par exemple, les véhicules sont affichés dynamiquement depuis les données récupérées en backend via `fetch`, le formulaire change de rôle selon le contexte (ajout ou modification), les modales s’ouvrent selon le véhicule sélectionné, la barre de recherche filtre les résultats en temps réel, et le bouton de vote adapte visuellement son état lorsqu’un vote a déjà été effectué.

## quelque chose à ajouter ?

L’interface visuelle reste extrêmement simple, puisque je me suis concentré sur l’aspect technique du travail afin d’être certain de ne rien rater d’important au niveau du barème.  
Tout le reste me semble assez accessible via le code fourni ici. Merci donc d’avoir lu tout ceci et bonne journée !