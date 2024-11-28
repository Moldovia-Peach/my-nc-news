const request = require("supertest");
require("jest-sorted");
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
  test("200: responds with an array of topic objects, each containing a slug and description", () => {
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
  test("200: responds with an article object with correct properties and types when given a valid article id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  describe("404 errors", () => {
    test("404: responds with an error when trying to get an article id that does not exist", () => {
      return request(app)
        .get("/api/articles/10000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if the article id is invalid", () => {
      return request(app)
        .get("/api/articles/notAnId")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
});

describe("GET /api/articles", () => {
  test("200: filters articles by topic", () => {
    return request(app)
      .get("/api/articles?topic=technology")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("technology");
        });
      });
  });

  test("200: returns an empty array if the topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=nonexistent")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
  test("200: responds with articles sorted by created at in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  describe("200: sorting and ordering articles", () => {
    test("200: sorts by title in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("title", { ascending: true });
        });
    });

    test("200: sorts by votes in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("votes", { descending: true });
        });
    });

    test("200: sorts by author in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("author", { ascending: true });
        });
    });

    test("200: sorts by comment count in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("comment_count", {
            descending: true,
          });
        });
    });
  });

  describe("200: filtering topics", () => {
    test("200: filters articles by topic", () => {
      return request(app)
        .get("/api/articles?topic=technology")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeInstanceOf(Array);
          body.articles.forEach((article) => {
            expect(article.topic).toBe("technology");
          });
        });
    });

    test("200: returns an empty array if the topic does not exist", () => {
      return request(app)
        .get("/api/articles?topic=nonexistent")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
        });
    });
  });

  describe("400 errors", () => {
    test("400: responds with an error when given an invalid sort by column", () => {
      return request(app)
        .get("/api/articles?sort_by=not_a_column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });

    test("400: responds with an error when given an invalid order query", () => {
      return request(app)
        .get("/api/articles?order=not_valid")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });

  test("400: responds with error when sort by and order queries are invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=not_a_column&order=not_valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: comments array has expected properties and types", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(11);
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
          expect(comment.article_id).toBe(1);
        });
      });
  });

  test("200: responds with comments sorted by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: responds with an empty array if article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  describe("404 errors", () => {
    test("404: responds with an error if the article does not exist", () => {
      return request(app)
        .get("/api/articles/1000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if the article_id is invalid", () => {
      return request(app)
        .get("/api/articles/notAnId/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
});

describe("GET *", () => {
  test("404: responds with an error if the route does not exist", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Resource Not Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: posts a new comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge", body: "Wow! This is amazing!" })
      .expect(201)
      .then((response) => {
        expect(response.status).toBe(201);
        expect(response.body.comment).toHaveProperty("comment_id");
        expect(response.body.comment.author).toBe("butter_bridge");
        expect(response.body.comment.body).toBe("Wow! This is amazing!");
      });
  });
  test("201: posts a new comment when there are new properties in the request body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "Wow! This is amazing!",
        new_property: "new_value",
      })
      .expect(201)
      .then((response) => {
        expect(response.status).toBe(201);
        expect(response.body.comment).toHaveProperty("comment_id");
        expect(response.body.comment.author).toBe("butter_bridge");
        expect(response.body.comment.body).toBe("Wow! This is amazing!");
        expect(response.body.comment.extra_property).toBeUndefined();
      });
  });
  describe("400 errors", () => {
    test("400: returns an error if the request body is missing required fields", () => {
      const missingFields = [
        { body: {}, msg: "Bad Request" },
        { body: { body: "Wow! This is amazing!" }, msg: "Bad Request" },
        { body: { username: "butter_bridge" }, msg: "Bad Request" },
      ];
      return Promise.all(
        missingFields.map(({ body, msg }) => {
          return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe(msg);
            });
        })
      );
    });

    test("400: returns an error if the article id is invalid", () => {
      return request(app)
        .post("/api/articles/notAnId/comments")
        .send({ username: "butter_bridge", body: "Wow! This is amazing!" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("404 errors", () => {
    test("404: returns an error if the article does not exist", () => {
      return request(app)
        .post("/api/articles/1000/comments")
        .send({ username: "butter_bridge", body: "Wow! This is amazing!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });

    test("404: returns an error if the username does not exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "nonexistent_user", body: "Wow! This is amazing!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: increments article votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(1);
        expect(body.article.title).toBe("Living in the shadow of a great man");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.author).toBe("butter_bridge");
        expect(body.article.votes).toBe(101);
      });
  });

  test("200: decrements article votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(1);
        expect(body.article.title).toBe("Living in the shadow of a great man");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.author).toBe("butter_bridge");
        expect(body.article.votes).toBe(99);
      });
  });
  describe("400 errors", () => {
    test("400: responds with an error for invalid inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "string" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });

    test("400: responds with an error if the body does not contain the correct fields", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("404 errors", () => {
    test("404: responds with an error if article_id does not exist", () => {
      return request(app)
        .patch("/api/articles/10000")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes a comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  describe("404 errors", () => {
    test("404: responds with an error when trying to delete a non-existent comment_id", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource Not Found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if comment_id is not valid", () => {
      return request(app)
        .delete("/api/comments/not-a-number")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
});

describe("GET /api/users", () => {
  test("200: user array has expected properties and correct types", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
