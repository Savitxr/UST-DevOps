# Watch Marketplace API Examples

## Gateway

- Health: `GET /health`

## User Service (via Gateway)

- Signup: `POST /api/users/signup`
  - Body: `{ "email": "user@example.com", "password": "secret", "displayName": "Alex" }`

- Login: `POST /api/users/login`
  - Body: `{ "email": "user@example.com", "password": "secret" }`

- Profile: `GET /api/users/profile`
  - Header: `Authorization: Bearer <jwt>`

## Product Service

- List watches: `GET /api/products`
- Search: `GET /api/products?brand=Omega&category=Dive`
- Create listing: `POST /api/products`
  - Body: `{ "name": "Seamaster", "brand": "Omega", "category": "Dive", "priceCents": 450000 }`

## Cart Service

- Add item: `POST /api/cart/items`
  - Body: `{ "userId": "<uuid>", "productId": "<uuid>", "quantity": 1 }`

- View cart: `GET /api/cart/items?userId=<uuid>`

## Order Service

- Checkout: `POST /api/orders`
  - Body: `{ "userId": "<uuid>", "totalCents": 450000 }`

## Review Service

- Add review: `POST /api/reviews`
  - Body: `{ "userId": "<uuid>", "productId": "<uuid>", "rating": 5, "comment": "Great watch" }`

- List reviews: `GET /api/reviews?productId=<uuid>`
