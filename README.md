# Book Store REST API — DevCamp BE2

Rješenje domaćeg zadatka iz DevCamp Dio 2.

## Što je implementirano

- TypeScript + Express server
- Prisma ORM
- SQLite baza radi jednostavnog lokalnog pokretanja
- `Book` model: `id`, `title`, `author`, `isbn`, `price`, `inStock`
- CRUD:
  - `GET /books`
  - `GET /books/:id`
  - `POST /books`
  - `PUT /books/:id`
  - `DELETE /books/:id`
- Validacija:
  - `title` obavezan
  - `author` obavezan
  - `isbn` obavezan
  - `price > 0`
- Bonus: `GET /books?author=Tolkien`
- Postman kolekcija u `postman/` folderu

## Pokretanje

```bash
npm install
copy .env.example .env
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Server: `http://localhost:3000`

## Primjer POST bodyja

```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "9780261102217",
  "price": 14.99,
  "inStock": true
}
```
