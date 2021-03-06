const { v4: uuid } = require("uuid");
const faker = require("faker");
faker.locale = "es";

const {
  password,
  image,
  genders,
  categories,
  tags,
} = require("../core/constants");
const { rand, randArr } = require("../core/utils");

class Populator {
  constructor(db, comicSamples, startingDate) {
    this.db = db;
    this.comicSamples = comicSamples;
    this.lastDate = startingDate;

    this.events = [];

    this.users = {};
    this.publications = {};
    this.collections = {};

    this.publicationFavorites = [];
    this.collectionFavorites = [];
    this.views = [];
    this.readings = [];
    this.likes = [];
    this.reviews = [];
    this.follows = [];

    this.subscriptions = [];
    this.contracts = [];
    this.donations = [];
  }

  nextDate() {
    const date = new Date(this.lastDate);
    date.setSeconds(date.getSeconds() + 10);

    this.lastDate = date;

    return date;
  }

  addEvent(topic, code, payload) {
    const id = uuid();
    this.events.push({
      id,
      topic,
      code,
      timestamp: this.nextDate(),
      payload,
    });
  }

  createUser({ username }) {
    const id = uuid();

    const user = {
      id,
      provider: "local",
      username,
      email: `${username}@omics.com`,
      password,
      name: faker.name.firstName(),
      lastname: faker.name.lastName(),
      birthdate: `${rand(1980, 2005)}-08-01 15:30:00Z`,
      gender: randArr(genders),
      biography: faker.lorem.paragraph(),
      profile_image: image(200),
      role_id: "user",
      followers: 0,
      publications: 0,
      subscribed: false,
      created_at: this.nextDate(),
      updated_at: this.nextDate(),
    };

    this.users[id] = user;

    this.addEvent("user", "registered", {
      Registered: {
        id: user.id,
        username: user.username,
        email: user.email,
        validation_code: "#fake-code",
      },
    });
    this.addEvent("user", "validated", { Validated: { id: user.id } });
    this.addEvent("user", "updated", {
      Updated: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        birthdate: user.birthdate,
        gender: user.gender,
        biography: user.biography,
        profile_image: user.profile_image,
      },
    });

    return user;
  }

  createPublication({ userId, pageCount, status }) {
    const id = uuid();
    const sample = randArr(this.comicSamples);
    const publication = {
      id,
      author_id: userId,
      name: sample.title || faker.name.findName(),
      synopsis: sample.description || faker.lorem.paragraph(),
      category_id: randArr(categories),
      tags: randArr(tags, true),
      cover: `${sample.images[0].path}.${sample.images[0].extension}`,
      // cover: image(250)// ,
      statistics: {
        views: 0,
        unique_views: 0,
        readings: 0,
        likes: 0,
        reviews: 0,
        stars: 0.0,
      },
      pages: [],
      status_history: [],
      created_at: this.nextDate(),
      updated_at: this.nextDate(),
    };
    this.addEvent("publication", "created", {
      Created: {
        id: publication.id,
        author_id: publication.author_id,
        name: publication.name,
        synopsis: publication.synopsis,
        category_id: publication.category_id,
        tags: publication.tags.map((t) => t.name),
        cover: publication.cover,
      },
    });

    pageCount = pageCount || 0;
    const pages = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        number: i,
        images: [
          {
            url: image("663x1024"),
          },
        ],
      });
    }
    publication.pages = pages;
    this.addEvent("publication", "pages-updated", {
      PagesUpdated: {
        id: publication.id,
        pages_count: publication.pages.length,
      },
    });

    const statusHistory = [
      {
        status: "draft",
        datetime: this.nextDate(),
      },
    ];

    if (status) {
      statusHistory.push({
        status: "waiting-approval",
        datetime: this.nextDate(),
      });
      this.addEvent("publication", "approval-waited", {
        ApprovalWaited: {
          id: publication.id,
        },
      });

      if (status === "published") {
        statusHistory.push({
          status: "published",
          admin_id: {
            id: "00000000-0000-0000-0000-000000000002",
          },
          comment: {
            comment: faker.lorem.paragraph(),
          },
          datetime: this.nextDate(),
        });
        this.addEvent("publication", "published", {
          Published: {
            id: publication.id,
            author_id: publication.author_id,
            name: publication.name,
            synopsis: publication.synopsis,
            category_id: publication.category_id,
            tags: publication.tags.map((t) => t.name),
            cover: publication.cover,
            pages_count: publication.pages.length,
          },
        });
      } else if (status === "rejected") {
        statusHistory.push({
          status: "rejected",
          admin_id: {
            id: "00000000-0000-0000-0000-000000000002",
          },
          comment: {
            comment: faker.lorem.paragraph(),
          },
          datetime: this.nextDate(),
        });
        this.addEvent("publication", "rejected", {
          Rejected: {
            id: publication.id,
          },
        });
      }
    }
    publication.status_history = statusHistory;

    this.publications[id] = publication;
    this.users[userId].publications += 1;

    return publication;
  }

  createCollection({ userId, publicationIds }) {
    const id = uuid();
    const sample = randArr(this.comicSamples);
    const collection = {
      id,
      author_id: userId,
      name: sample.title || faker.name.findName(),
      synopsis: sample.description || faker.lorem.paragraph(),
      category_id: randArr(categories),
      tags: randArr(tags, true),
      cover: `${sample.images[0].path}.${sample.images[0].extension}`,
      // cover: image(250),
      items: publicationIds.map((id) => ({
        publication_id: { id },
        date: this.nextDate(),
      })),
      created_at: this.nextDate(),
      updated_at: this.nextDate(),
    };

    this.addEvent("collection", "created", {
      Created: {
        id: collection.id,
        author_id: collection.author_id,
        name: collection.name,
        synopsis: collection.synopsis,
        category_id: collection.category_id,
        tags: collection.tags.map((t) => t.name),
        cover: collection.cover,
      },
    });
    collection.items.forEach((item) => {
      this.addEvent("collection", "publication-added", {
        PublicationAdded: {
          id: collection.id,
          publication_id: item.publication_id.id,
        },
      });
    });

    this.collections[id] = collection;

    return collection;
  }

  createView({ userId, publicationId, unique }) {
    this.views.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
      is_unique: unique,
    });
    this.addEvent("publication", "viewed", {
      Viewed: {
        reader_id: userId,
        publication_id: publicationId,
        unique,
      },
    });

    this.publications[publicationId].statistics.views += 1;
  }

  createReading({ userId, publicationId }) {
    this.readings.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
    });
    this.addEvent("publication", "read", {
      Read: {
        reader_id: userId,
        publication_id: publicationId,
      },
    });

    this.publications[publicationId].statistics.readings += 1;
  }

  createLike({ userId, publicationId }) {
    this.likes.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
    });
    this.addEvent("publication", "liked", {
      Liked: {
        reader_id: userId,
        publication_id: publicationId,
      },
    });

    this.publications[publicationId].statistics.likes += 1;
  }

  createReview({ userId, publicationId }) {
    const stars = rand(0, 6);
    const comment = faker.lorem.paragraph();

    this.reviews.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
      stars,
      comment,
    });

    this.publications[publicationId].statistics.reviews += 1;

    const publicationReviews = this.reviews.filter(
      (r) => r.publication_id === publicationId
    );

    const avgStars =
      publicationReviews.reduce((acc, r) => acc + r.stars, 0.0) /
      publicationReviews.length;

    this.publications[publicationId].statistics.stars = +avgStars.toFixed(2);

    this.addEvent("publication", "reviewed", {
      Reviewed: {
        reader_id: userId,
        publication_id: publicationId,
        stars,
        comment,
      },
    });
  }

  createPublicationFavorite({ userId, publicationId }) {
    this.publicationFavorites.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
    });
    this.addEvent("reader", "publication-added-to-favorites", {
      PublicationAddedToFavorites: {
        reader_id: userId,
        publication_id: publicationId,
      },
    });
  }

  createCollectionFavorite({ userId, publicationId }) {
    this.collectionFavorites.push({
      reader_id: userId,
      publication_id: publicationId,
      datetime: this.nextDate(),
    });
    this.addEvent("reader", "collection-added-to-favorites", {
      CollectionAddedToFavorites: {
        reader_id: userId,
        publication_id: publicationId,
      },
    });
  }

  createFollow({ readerId, authorId }) {
    this.follows.push({
      reader_id: readerId,
      author_id: authorId,
      datetime: this.nextDate(),
    });
    this.addEvent("author", "followed", {
      Followed: {
        author_id: authorId,
        reader_id: readerId,
      },
    });

    this.users[authorId].followers += 1;
  }

  createSubscription({ userId, planPrice }) {
    const id = uuid();
    const subscription = {
      id,
      user_id: userId,
      plan: {
        plan_id: {
          id: "basic",
        },
        price: planPrice,
        assigned_at: this.nextDate(),
      },
      payments: [
        {
          kind: "income",
          amount: planPrice,
          datetime: this.nextDate(),
        },
      ],
      status_history: [
        {
          status: "waiting-for-payment",
          datetime: this.nextDate(),
        },
        {
          status: "active",
          datetime: this.nextDate(),
        },
      ],
      created_at: this.nextDate(),
      updated_at: this.nextDate(),
    };
    this.addEvent("subscription", "created", {
      Created: {
        id,
        user_id: userId,
        plan_id: "basic",
      },
    });
    this.addEvent("subscription", "payment-added", {
      PaymentAdded: {
        id,
        user_id: userId,
        amount: subscription.plan.price,
      },
    });

    this.subscriptions.push(subscription);
    this.users[userId].subscribed = true;

    return subscription;
  }

  createContract({ publicationId, userId }) {
    const id = uuid();
    const contract = {
      id,
      publication_id: publicationId,
      status_history: [
        {
          status: "requested",
          datetime: new Date(),
        },
        {
          status: "approved",
          admin_id: {
            id: "00000000-0000-0000-0000-000000000002",
          },
          datetime: new Date(),
        },
      ],
      created_at: new Date(),
    };

    this.addEvent("contract", "requested", {
      Requested: {
        id,
        publication_id: publicationId,
        author_id: userId,
      },
    });
    this.addEvent("contract", "approved", {
      Approved: {
        id,
        publication_id: publicationId,
        admin_id: "00000000-0000-0000-0000-000000000002",
      },
    });

    this.contracts.push(contract);

    this.publications[publicationId].contract = true;

    return contract;
  }

  generateSummariesForContracts() {
    const total = this.subscriptions.reduce(
      (acc, s) => acc + s.payments[0].amount,
      0
    );
    const amount = total * 0.3;

    for (const contract of this.contracts) {
      const summaries = [];
      const summaryCount = 6;
      const date = new Date(this.nextDate());

      for (let i = 0; i < summaryCount; i++) {
        date.setHours(date.getHours() + 6);
        const to = new Date(date);
        to.setHours(date.getHours() + 6);

        const statistics = {
          views: rand(100, 1000),
          unique_views: rand(100, 1000),
          readings: rand(100, 1000),
          likes: rand(100, 1000),
          reviews: rand(100, 1000),
          stars: rand(0, 6) * 1.0,
        };

        const summary = {
          statistics,
          total: rand(1000, 10000) * 1.0,
          amount: 0,
          paid: i / summaryCount <= 0.3,
          from: new Date(date),
          to,
        };

        summaries.push(summary);
      }

      contract.summaries = summaries;
    }

    const totalViews = this.contracts.reduce(
      (acc, contract) =>
        acc +
        contract.summaries.reduce(
          (acc, summary) => acc + summary.statistics.views,
          0
        ),
      0
    );

    for (const contract of this.contracts) {
      for (const summary of contract.summaries) {
        const percentage = summary.statistics.views / totalViews;
        summary.amount = amount * percentage;

        this.addEvent("contract", "summary-added", {
          SummaryAdded: {
            id: contract.id,
            publication_id: contract.publication_id,
            total: summary.total,
            amount: summary.amount,
            from: summary.from,
            to: summary.to,
          },
        });
      }
    }

    for (const contract of this.contracts) {
      contract.payments = [
        {
          kind: "outcome",
          amount: contract.summaries
            .filter((s) => s.paid)
            .reduce((acc, s) => acc + s.amount, 0.0),
          datetime: new Date(),
        },
      ];
      this.addEvent("contract", "payment-added", {
        PaymentAdded: {
          id: contract.id,
          publication_id: contract.publication_id,
          amount: contract.payments[0].amount,
        },
      });
    }
  }

  async createDonation({ readerId, authorId }) {
    const id = uuid();
    const total = rand(20, 5000);
    const percentage = 0.7;
    const subtotal = total * percentage;

    this.donations.push({
      id,
      author_id: authorId,
      reader_id: readerId,
      total,
      subtotal,
      author_percentage: percentage,
      comment: "Gracias por existir",
      reader_payment: {
        kind: "income",
        amount: total,
        datetime: new Date(),
      },
      author_charge: {
        kind: "outcome",
        amount: subtotal,
        datetime: new Date(),
      },
      status_history: [
        {
          status: "waiting-for-payment",
          datetime: new Date(),
        },
        {
          status: "paid",
          datetime: new Date(),
        },
        {
          status: "charged",
          datetime: new Date(),
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async saveItems(items, dbTable) {
    try {
      const columns = items.length > 0 ? Object.keys(items[0]).length : 0;
      const max = Math.ceil(30000 / columns);

      for (; items.length > 0; ) {
        const slice = items.splice(0, max);
        await this.db(dbTable).insert(slice);
      }
    } catch (err) {
      console.log("Table:", dbTable);
      console.log(err);
    }
  }

  async save() {
    const users = Object.values(this.users);
    await this.saveItems(users, "users");

    const publications = Object.values(this.publications).map((p) => ({
      ...p,
      tags: JSON.stringify(p.tags),
      pages: JSON.stringify(p.pages),
      status_history: JSON.stringify(p.status_history),
    }));
    await this.saveItems(publications, "publications");

    const collections = Object.values(this.collections).map((c) => ({
      ...c,
      tags: JSON.stringify(c.tags),
      items: JSON.stringify(c.items),
    }));
    await this.saveItems(collections, "collections");

    await this.saveItems(this.views, "views");
    await this.saveItems(this.readings, "readings");
    await this.saveItems(this.likes, "likes");
    await this.saveItems(this.reviews, "reviews");
    await this.saveItems(this.publicationFavorites, "publication_favorites");
    await this.saveItems(this.collectionFavorites, "collection_favorites");
    await this.saveItems(this.follows, "follows");

    const contracts = this.contracts.map((c) => ({
      ...c,
      summaries: JSON.stringify(c.summaries),
      payments: JSON.stringify(c.payments),
      status_history: JSON.stringify(c.status_history),
    }));
    await this.saveItems(contracts, "contracts");

    const subscriptions = this.subscriptions.map((s) => ({
      ...s,
      payments: JSON.stringify(s.payments),
      status_history: JSON.stringify(s.status_history),
    }));
    await this.saveItems(subscriptions, "subscriptions");

    const donations = this.donations.map((d) => ({
      ...d,
      status_history: JSON.stringify(d.status_history),
    }));
    await this.saveItems(donations, "donations");

    // Events
    await this.saveItems(this.events, "events");
  }
}

module.exports = Populator;
