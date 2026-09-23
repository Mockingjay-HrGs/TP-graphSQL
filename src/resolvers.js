import { GraphQLError } from 'graphql';
import { db, findById, nextId } from './db.js';

// Les resolvers : pour chaque champ du schéma, la fonction qui va chercher
// la valeur. Un resolver reçoit quatre arguments, dont les deux premiers
// suffisent ici :
//   parent  la valeur renvoyée par le resolver du champ parent
//   args    les arguments passés dans la requête
//   context des données partagées par toute la requête (non utilisé dans ce TP)
//   info    des métadonnées sur la requête en cours
//
// Un champ sans resolver explicite est résolu par défaut : Apollo lit la
// propriété du même nom sur l'objet parent. C'est pour cela que Product.name
// fonctionne sans que rien ne soit écrit ici.
//
// Les commentaires "TODO Exercice n" marquent les endroits à compléter
// pendant la partie 2 du TP, en miroir de ceux de src/typeDefs.js.

export const resolvers = {
  Query: {
    product: (_parent, args) => findById(db.products, args.id),
    users: () => db.users,
    user: (_parent, args) => findById(db.users, args.id),
    orders: () => db.orders,
    order: (_parent, args) => findById(db.orders, args.id),

    // TODO Exercice 1 : brands
    brands: () => db.brands,

    // TODO Exercice 2 : brand
    brand: (_parent, args) => findById(db.brands, args.id),

    // TODO Exercice 6 : filtrer products selon args.brandId et args.maxPrice
    products: (_parent, { brandId, maxPrice }) =>
        db.products.filter((product) =>
            (brandId == null || product.brandId === brandId) &&
            (maxPrice == null || product.price <= maxPrice)
        ),

    // TODO Exercice 7 : warehouses
    warehouses: () => db.warehouses,
  },

  Product: {
    // TODO Exercice 3 : brand, à retrouver depuis product.brandId
    brand: (product) => findById(db.brands, product.brandId),

    // TODO Exercice 7 : stockByWarehouse, à construire depuis db.stocks
    stockByWarehouse: (product) =>
        db.stocks
            .filter((entry) => entry.productId === product.id)
            .map((entry) => ({
              warehouse: findById(db.warehouses, entry.warehouseId),
              quantity: entry.quantity,
            })),
  },

  Brand: {
    products: (brand) =>
        db.products.filter((product) => product.brandId === brand.id),
  },

  User: {
    // parent vaut ici l'utilisateur renvoyé par Query.user ou Query.users.
    orders: (user) => db.orders.filter((order) => order.userId === user.id),

    // TODO Exercice 5 : ordersCount
    ordersCount: (user) =>
        db.orders.filter((order) => order.userId === user.id).length,
  },

  Order: {
    // Le champ s'appelle customer côté schéma alors que la donnée stockée
    // est userId : c'est le resolver qui fait le pont entre les deux.
    customer: (order) => findById(db.users, order.userId),

    // TODO Exercice 5 : total
    total: (order) =>
        order.lines.reduce(
            (sum, line) => sum + line.quantity * line.unitPrice,
            0
        ),
  },

  OrderLine: {
    product: (line) => findById(db.products, line.productId),
  },

  Mutation: {
    createUser: (_parent, { input }) => {
      if (!input.email.includes('@')) {
        throw new GraphQLError(`Email invalide : ${input.email}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = { id: nextId(db.users), ...input };
      db.users.push(user);
      return user;
    },

    createProduct: (_parent, { input }) => {
      if (input.price < 0) {
        throw new GraphQLError('Le prix ne peut pas être négatif.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const product = { id: nextId(db.products), brandId: null, ...input };
      db.products.push(product);
      return product;
    },

    updateOrderStatus: (_parent, { orderId, status }) => {
      const order = findById(db.orders, orderId);

      // Une erreur métier se signale avec GraphQLError. Le code placé dans
      // extensions permet au client de distinguer les cas sans lire le message.
      if (!order) {
        throw new GraphQLError(`Commande introuvable : ${orderId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      order.status = status;
      return order;
    },

    // TODO Exercice 6 : createBrand
    createBrand: (_parent, { input }) => {
      const brand = { id: nextId(db.brands), ...input };
      db.brands.push(brand);
      return brand;
    },

    // TODO Exercice 7 : restockProduct
    restockProduct: (_parent, { productId, warehouseId, quantity }) => {
      const product = findById(db.products, productId);
      const warehouse = findById(db.warehouses, warehouseId);

      if (!product) {
        throw new GraphQLError(`Article introuvable : ${productId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (!warehouse) {
        throw new GraphQLError(`Entrepôt introuvable : ${warehouseId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (quantity <= 0) {
        throw new GraphQLError('La quantité doit être strictement positive.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const entry = db.stocks.find(
          (stock) =>
              stock.productId === product.id &&
              stock.warehouseId === warehouse.id
      );

      if (entry) {
        entry.quantity += quantity;
      } else {
        db.stocks.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity,
        });
      }

      product.stock += quantity;
      return product;
    },

    // TODO Exercice 8 : createOrder
  },
};
