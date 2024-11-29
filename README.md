# My NC News API

### Project Summary

My NC News API is a backend service built using Node.js, Express.js, and PostgreSQL. Users can interact with various endpoints to fetch articles, topics, comments, users, and post new comments or even vote on articles.

#### Hosted Version

Feel free to check out the [hosted API here](https://my-nc-news-zyxm.onrender.com/api).

## Getting Started

### Prerequisites

To run the project _locally_, ensure you have the following installed:

- Node.js
- PostgreSQL
- npm

## Setup Instructions

1. **Clone the repository**

Use the following commands to clone the repo and navigate into the project folder.

```
git clone https://github.com/Moldovia-Peach/my-nc-news.git
cd nc-news

```

2. **Install dependencies**

Run the following command to install all required dependencies:

```
npm install

```

3. **Create environment variables and setup the databases**

You will need two **.env** files to configure your local database:

- **.env.development:** For local development.

```
PGDATABASE=nc_news

```

- **.env.test:** For running tests.

```
PGDATABASE=nc_news_test

```

4. **Seed the databases**

```
npm run seed-dev
npm run seed-test

```

## Running Tests

This project was developed with Test-Driven Development (TDD).

To run the test suite:

```
npm run test

```

All test data is reset before each test to ensure consistency.

## Endpoints

The API's functionality is accessible through various endpoints. The complete list is provided in the endpoints.json file. When the API is live, you can view the documentation at /api.

### Example endpoints include:

| Endpoint                                |                Description                |
| --------------------------------------- | :---------------------------------------: |
| GET /api/topics                         |            Fetches all topics.            |
| GET /api/articles                       | Fetches all articles with comment counts. |
| GET /api/articles/:article_id           |         Fetches an article by ID.         |
| POST /api/articles/:article_id/comments |  Posts a comment on a specific article.   |

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Jest
- Supertest

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
