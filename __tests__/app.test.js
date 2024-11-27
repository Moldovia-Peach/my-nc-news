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
  describe("404 errors", () => {
    test("404: responds with an error when trying to get an article id that does not exist", () => {
      return request(app)
        .get("/api/articles/10000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Article with id 10000 not found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if the article id is invalid", () => {
      return request(app)
        .get("/api/articles/notAnId")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid article id format");
        });
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
  describe("400 errors", () => {
    test("400: responds with error when invalid query parameters are passed", () => {
      return request(app)
        .get("/api/articles?sort=invalid")
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body.msg).toBe("Invalid query parameter");
        });
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: comments array has expected properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });

  test("200: responds with array of comments for the article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(11);

        expect(body.comments[0]).toEqual({
          comment_id: 5,
          votes: 0,
          created_at: "2020-11-03T21:00:00.000Z",
          author: "icellusedkars",
          body: "I hate streaming noses",
          article_id: 1,
        });

        body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });

        expect(body.comments[1]).toEqual({
          comment_id: 2,
          votes: 14,
          created_at: "2020-10-31T03:03:00.000Z",
          author: "butter_bridge",
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          article_id: 1,
        });
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
          expect(body.msg).toBe("Article with id 1000 not found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if the article_id is invalid", () => {
      return request(app)
        .get("/api/articles/notAnId/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid article id format");
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
        expect(body.msg).toBe("404 Not Found");
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
  describe("400 errors", () => {
    test("400: returns an error if the request body is empty", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Username and body are required");
        });
    });

    test("400: returns an error if username is missing", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "Wow! This is amazing!" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Username and body are required");
        });
    });

    test("400: returns an error if comment body is missing", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Username and body are required");
        });
    });

    test("400: returns an error if the article_id is invalid", () => {
      return request(app)
        .post("/api/articles/notAnId/comments")
        .send({ username: "butter_bridge", body: "Wow! This is amazing!" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid article id format");
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
          expect(body.msg).toBe("Article with id 1000 not found");
        });
    });

    test("404: returns an error if the username does not exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "nonexistent_user", body: "Wow! This is amazing!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Username does not exist");
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
          expect(body.msg).toBe("Invalid vote value");
        });
    });

    test("400: responds with an error if the body does not contain the correct fields", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid vote value");
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
          expect(body.msg).toBe("Article not found");
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
          expect(body.msg).toBe("Comment with id 9999 not found");
        });
    });
  });
  describe("400 errors", () => {
    test("400: responds with an error if comment_id is not valid", () => {
      return request(app)
        .delete("/api/comments/not-a-number")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid comment id format");
        });
    });
  });
});

describe("GET /api/users", () => {
  test("200: user array has expected properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        body.users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });

  test("200: responds with an array of user objects containing username, name, and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length).toBe(4);
        expect(body.users[0]).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
        expect(body.users[3]).toEqual({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });

  describe("404 errors", () => {
    test("404: responds with an error if the user does not exist", () => {
      return request(app)
        .get("/api/notAUser")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404 Not Found");
        });
    });
  });
});
