const request = require("supertest");
const app = require("../app");
const endpointsJson = require("../endpoints.json");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects, each containing slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        expect(body.topics).toBeInstanceOf(Array);

        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an article object when given valid article id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("author");
        expect(body.article).toHaveProperty("title");
        expect(body.article).toHaveProperty("article_id");
        expect(body.article).toHaveProperty("body");
        expect(body.article).toHaveProperty("topic");
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("votes");
        expect(body.article).toHaveProperty("article_img_url");
      });
  });

  test("404: responds with an error when trying to get an article id that does not exist", () => {
    return request(app)
      .get("/api/articles/10000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article with id 10000 not found");
      });
  });

  test("400: responds with an error if the article id is invalid", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article id format");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles containing the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles).toHaveLength(13);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("200: responds with articles sorted by created_at in descending order", () => {
    return request(app)
      .get("/api/articles")
      .then((response) => {
        const body = response.body;
        for (let i = 0; i < body.articles.length - 1; i++) {
          const currentArticleDate = new Date(
            body.articles[i].created_at
          ).getTime();
          const nextArticleDate = new Date(
            body.articles[i + 1].created_at
          ).getTime();
          expect(currentArticleDate).toBeGreaterThanOrEqual(nextArticleDate);
        }
      });
  });
  test("400: responds with error when invalid query parameters are passed", () => {
    return request(app)
      .get("/api/articles?sort=invalid")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Invalid query parameter");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with array of comments for the article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBeGreaterThan(0);
        expect(body.comments[0]).toHaveProperty("comment_id");
        expect(body.comments[0]).toHaveProperty("votes");
        expect(body.comments[0]).toHaveProperty("created_at");
        expect(body.comments[0]).toHaveProperty("author");
        expect(body.comments[0]).toHaveProperty("body");
        expect(body.comments[0]).toHaveProperty("article_id");
      });
  });

  test("200: responds with comments sorted by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;
        for (let i = 0; i < comments.length - 1; i++) {
          const currentCommentDate = new Date(comments[i].created_at).getTime();
          const nextCommentDate = new Date(
            comments[i + 1].created_at
          ).getTime();
          expect(currentCommentDate).toBeGreaterThanOrEqual(nextCommentDate);
        }
      });
  });

  test("404: responds with an error if no comments are found for the given article_id", () => {
    return request(app)
      .get("/api/articles/1000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments found for article 1000");
      });
  });

  test("400: responds with an error if the article_id is invalid", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid article id format");
      });
  });
});

describe("GET *", () => {
  test("404: responds with an error if the route does not exist", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 Not Found");
      });
  });
});
