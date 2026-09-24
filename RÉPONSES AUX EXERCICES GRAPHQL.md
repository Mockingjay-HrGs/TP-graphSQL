
# PARTIE 1 — Prendre en main Apollo Sandbox  
  
## **1.1 — Explorer le schéma**  
  
### Le type Query propose 6 points d'entrée :  
- products : récupérer tous les articles.  
- product(id: ID!) : récupérer un article par son identifiant.  
- users : récupérer tous les clients.  
- user(id: ID!) : récupérer un client par son identifiant.  
- orders : récupérer toutes les commandes.  
- order(id: ID!) : récupérer une commande par son identifiant.  
  
### Le type Product possède 5 champs :  
- id : ID!  
- name : String!  
- price : Float!  
- stock : Int!  
- brandId : ID  
  
Le symbole ! signifie que la valeur ne peut pas être null.  
  
OrderStatus peut prendre 4 valeurs :  
- PENDING : en attente.  
- SHIPPED : expédiée.  
- DELIVERED : livrée.  
- CANCELLED : annulée.  
  
Réponses vérifiées à partir du schéma initial dans src/typeDefs.js.  
  
  
## 1.2 — Votre première query  
  
Requête initiale : récupérer l'identifiant, le nom et le prix des articles.  
  
query AllProducts {  
  products {  
    id  
    name  
    price  
  }  
}  
  
#### 1) Récupérer uniquement le nom :  
  
query AllProducts {  
  products {  
    name  
  }  
}  
  
#### 2) Ajouter le stock :  
  
query AllProducts {  
  products {  
    name  
    stock  
  }  
}  
  
#### Puis ajouter l'identifiant de la marque :  
  
query AllProducts {  
  products {  
    name  
    stock  
    brandId  
  }  
}  
  
Extrait de la réponse à cette dernière requête (premier article) :  
  
{  
  "name": "Lampe de bureau Arc",  
  "stock": 24,  
  "brandId": "2"  
}  
  
  
## 1.3 — Une query avec un argument  
  
#### 1) Récupérer le nom et le prix de l'article d'identifiant 3 :  
  
query ProductById {  
  product(id: "3") {  
    name  
    price  
  }  
}  
  
Réponse :  
  
{  
  "data": {  
    "product": {  
      "name": "Clavier mécanique K2",  
      "price": 89.5  
    }  
  }  
}  
  
#### 2) Utiliser une variable pour transmettre l'identifiant :  
  
query ProductById($id: ID!) {  
  product(id: $id) {  
    name  
    price  
  }  
}  
  
Dans le panneau Variables de Sandbox, saisir :  
  
{  
  "id": "3"  
}  
  
#### 3) Tester un identifiant inexistant :  
  
Conserver la même requête et remplacer le contenu du panneau Variables par :  
  
{  
  "id": "999"  
}  
  
Réponse :  
  
{  
  "data": {  
    "product": null  
  }  
}  
  
  
## 1.4 — Suivre les relations  
  
#### 4) Récupérer les commandes avec le client et les articles commandés :  
  
query OrdersWithDetails {  
  orders {  
    id  
    status  
    customer {  
      email  
    }  
    lines {  
      quantity  
      product {  
        name  
      }  
    }  
  }  
}  
  
Résultat vérifié :  
  
- Commande 1 : DELIVERED, camille.ferrand@example.com.  
  Articles : 1 Clavier mécanique K2 et 2 Tapis de souris XL.  
- Commande 2 : SHIPPED, yanis.bouali@example.com.  
  Article : 1 Chaise ergonomique Fjord.  
- Commande 3 : PENDING, camille.ferrand@example.com.  
  Articles : 2 Lampe de bureau Arc, 1 Casque audio Silent et 1 Bouilloire Nord.  
  
#### 2) Partir du client 1 pour retrouver ses commandes :  
  
query UserWithOrders {  
  user(id: "1") {  
    firstName  
    orders {  
      id  
      status  
    }  
  }  
}  
  
Réponse :  
  
{  
  "data": {  
    "user": {  
      "firstName": "Camille",  
      "orders": [  
        {  
          "id": "1",  
          "status": "DELIVERED"  
        },  
        {  
          "id": "3",  
          "status": "PENDING"  
        }  
      ]  
    }  
  }  
}  
  
## 1.5 — Alias et fragments  
  
Récupérer les articles 1 et 8 avec les champs id, name et price :  
  
query TwoProducts {  
  first: product(id: "1") {  
    ...ProductFields  
  }  
  second: product(id: "8") {  
    ...ProductFields  
  }  
}  
  
fragment ProductFields on Product {  
  id  
  name  
  price  
}  
  
Réponse :  
  
{  
  "data": {  
    "first": {  
      "id": "1",  
      "name": "Lampe de bureau Arc",  
      "price": 59.9  
    },  
    "second": {  
      "id": "8",  
      "name": "Bureau assis-debout",  
      "price": 499  
    }  
  }  
}  
  
Explications :  
- first et second sont des alias : ils donnent des noms distincts aux deux  
  résultats. Sans alias, les deux champs product auraient le même nom dans  
  la réponse mais des arguments différents, ce qui provoque un conflit.  
- ProductFields est un fragment défini sur le type Product. Il regroupe  
  les champs id, name et price pour éviter de répéter leur liste.  
- ...ProductFields insère cette sélection de champs à chaque emplacement.  
  Le fragment ne crée pas de niveau supplémentaire dans la réponse.  
  
  
1.6 — Créer des données  
  
#### 1) Créer un client et récupérer son identifiant et son email :  
  
mutation CreateCustomer {  
  createUser(input: {  
    firstName: "Alex"  
    lastName: "Martin"  
    email: "alex.martin@example.com"  
  }) {  
    id  
    email  
  }  
}  
  
Réponse obtenue à partir des données initiales :  
  
{  
  "data": {  
    "createUser": {  
      "id": "5",  
      "email": "alex.martin@example.com"  
    }  
  }  
}  
  
#### 2) Vérifier que le client apparaît dans la liste :  
  
query AllUsers {  
  users {  
    id  
    email  
  }  
}  
  
La liste contient maintenant 5 clients, dont alex.martin@example.com.  
Identifiant du nouveau client lors de cet essai : "5".  
  
#### 3) Créer un article associé à la marque d'identifiant "2" :  
  
mutation CreateArticle {  
  createProduct(input: {  
    name: "Lampe de chevet"  
    price: 29.9  
    stock: 10  
    brandId: "2"  
  }) {  
    id  
    name  
    price  
    stock  
    brandId  
  }  
}  
  
Réponse obtenue à partir des données initiales :  
  
{  
  "data": {  
    "createProduct": {  
      "id": "9",  
      "name": "Lampe de chevet",  
      "price": 29.9,  
      "stock": 10,  
      "brandId": "2"  
    }  
  }  
}  
  
Vérifier l'article avec l'identifiant renvoyé par la mutation :  
  
query CreatedProduct {  
  product(id: "9") {  
    id  
    name  
    price  
    stock  
    brandId  
  }  
}  

#### 4) Essayer de créer un client avec un email sans arobase :  
  
mutation InvalidEmail {  
  createUser(input: {  
    firstName: "Alex"  
    lastName: "Martin"  
    email: "bonjour"  
  }) {  
    id  
    email  
  }  
}  
  
Extrait de la réponse d'erreur (champs utiles) :  
  
{  
  "errors": [  
    {  
      "message": "Email invalide : bonjour",  
      "extensions": {  
        "code": "BAD_USER_INPUT"  
      }  
    }  
  ],  
  "data": null  
}  
  
## 1.7 — Modifier des données, et lire les erreurs  
  
#### 1) Faire passer la commande 2 à l'état DELIVERED :  
  
mutation DeliverOrder {  
  updateOrderStatus(orderId: "2", status: DELIVERED) {  
    id  
    status  
  }  
}  
  
Réponse :  
  
{  
  "data": {  
    "updateOrderStatus": {  
      "id": "2",  
      "status": "DELIVERED"  
    }  
  }  
}  
  
#### 2) Vérifier la modification avec une query :  
  
query CheckOrder {  
  order(id: "2") {  
    id  
    status  
  }  
}  
  
Réponse :  
  
{  
  "data": {  
    "order": {  
      "id": "2",  
      "status": "DELIVERED"  
    }  
  }  
}  
  
#### 3) Provoquer une erreur avec une commande inexistante :  
  
mutation UnknownOrder {  
  updateOrderStatus(orderId: "99", status: DELIVERED) {  
    id  
    status  
  }  
}  
  
Message : Commande introuvable : 99  
extensions.code : NOT_FOUND  
La réponse contient errors et data: null.  
  
#### 4) Provoquer une erreur avec un état inconnu :  
  
mutation InvalidStatus {  
  updateOrderStatus(orderId: "2", status: ENVOYEE) {  
    id  
    status  
  }  
}  
  
Message : Value "ENVOYEE" does not exist in "OrderStatus" enum.  
extensions.code : GRAPHQL_VALIDATION_FAILED  
  
#### 5) Provoquer une erreur avec un champ inconnu :  
  
query InvalidField {  
  product(id: "1") {  
    taille  
  }  
}  
  
Message : Cannot query field "taille" on type "Product".  
extensions.code : GRAPHQL_VALIDATION_FAILED  
  
Réponse à la question :  
  
GRAPHQL_VALIDATION_FAILED indique que la requête ne respecte pas le schéma.  
ENVOYEE n'est pas une valeur de OrderStatus et taille n'est pas un champ  
de Product. Ces erreurs sont détectées lors de la validation, avant  
l'exécution des resolvers. Ces deux réponses contiennent errors, sans  
champ data, car l'exécution n'a pas commencé.  
  
NOT_FOUND est ici une erreur métier déclenchée pendant l'exécution du  
resolver updateOrderStatus. La requête respecte le schéma : "99" est un  
identifiant valide et DELIVERED est un état autorisé. Mais en cherchant  
dans les données, le resolver constate que la commande n'existe pas et  
lève un GraphQLError avec le code NOT_FOUND.  
  
  
## 1.8 — Ce qui manque  
  
Requête testée :  
  
query {  
  product(id: "1") {  
    name  
    brandId  
    brand {  
      name  
    }  
  }  
}  
  
Erreur obtenue :  
Message : "Cannot query field \"brand\" on type \"Product\". Did you mean \"brandId\"?"  
extensions.code : GRAPHQL_VALIDATION_FAILED  
  
Réponse en une phrase :  
Le serveur refuse le champ brand parce qu'il n'est pas déclaré sur le type  
Product dans le schéma GraphQL, même si les marques et les identifiants  
brandId existent dans les données.  
  