# iMovieDB - Movie and TV-Shows Database RESTful API

This documentation provides a guide to the iMovieDB RESTful API, which offers a range of functionalities for accessing and managing movie and TV show data.

## Installation

1. Clone this repository: `git clone https://github.com/hatrieudat/imoviedb.git`
2. Navigate to the project directory: `cd imoviedb`
3. Install dependencies: `npm install`

## API References

### Auth

| Method | URI                   | Description          |
| ------ | --------------------- | -------------------- |
| `POST` | `/auth/register`      | Register user        |
| `POST` | `/auth/login`         | Login user           |
| `POST` | `/auth/logout`        | Logout user          |
| `POST` | `/auth/refresh-token` | Refresh access token |

### User

| Method   | URI                       | Description                      |
| -------- | ------------------------- | -------------------------------- |
| `GET`    | `/users`                  | Get all users                    |
| `POST`   | `/users`                  | Add user                         |
| `PUT`    | `/users`                  | Update user                      |
| `GET`    | `/users/:id`              | Get user by ID                   |
| `DELETE` | `/users/:id`              | Delete user by ID                |
| `GET`    | `/users/me`               | Get own user                     |
| `PUT`    | `/users/me`               | Update own user                  |
| `GET`    | `/users/saved-movies`     | Get saved movies of user         |
| `POST`   | `/users/saved-movies/:id` | Add saved movie                  |
| `DELETE` | `/users/saved-movies/:id` | Delete a movie from saved movies |

### Movie

| Method   | URI                      | Description                  |
| -------- | ------------------------ | ---------------------------- |
| `GET`    | `/movies`                | Get all movies               |
| `POST`   | `/movies`                | Add a movie                  |
| `UPDATE` | `/movies`                | Update a movie               |
| `DELETE` | `/movies`                | Delete a movie               |
| `GET`    | `/movies/:id`            | Get movie by ID              |
| `GET`    | `/movies/top-rated`      | Get 10 top rated movies      |
| `GET`    | `/movies/random`         | Get 10 random movies         |
| `GET`    | `/movies/search`         | Search movies                |
| `GET`    | `/movies/genres`         | Get all genres               |
| `POST`   | `/movies/genres`         | Add a genre                  |
| `PUT`    | `/movies/genres`         | Update genre                 |
| `DELETE` | `/movies/genres`         | Delete genre                 |
| `GET`    | `/movies/countries`      | Get all countries            |
| `POST`   | `/movies/countries`      | Add a country                |
| `PUT`    | `/movies/countries`      | Update country               |
| `DELETE` | `/movies/countries`      | Delete genre                 |
| `POST`   | `/movies/countries/list` | Add list countries           |
| `GET`    | `/movies/:id/comments`   | Get all comments for a movie |
| `POST`   | `/movies/:id/comments`   | Add a comment for a movie    |

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

- Application configuration
  ```
  HOSTNAME=
  PORT=
  ```
- JWT configuration

  ```
  JWT_ACCESSTOKEN_SECRET=
  JWT_REFRESHTOKEN_SECRET=
  JWT_ACCESSTOKEN_EXPIRES_IN=
  JWT_REFRESHTOKEN_EXPIRES_IN=
  ```

- MongoDB configuration

  ```
  MONGODB_USERNAME=
  MONGODB_PASSWORD=
  MONGODB_CLUSTER_URL=
  MONGODB_DBNAME=
  ```

- Firebase credential
  ```
  FIREBASE_TYPE=
  FIREBASE_PROJECT_ID=
  FIREBASE_PRIVATE_ID=
  FIREBASE_PRIVATE_KEY=
  FIREBASE_CLIENT_EMAIL=
  FIREBASE_CLIENT_ID=
  FIREBASE_CLIENT_X509_CERT_URL=
  FIREBASE_STORAGE_BUCKET=
  ```

Or you can rename the `.env.example` file to `.env` and update the environment variables.
