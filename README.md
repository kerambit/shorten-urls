# URL Shorten

## Installation

1. Clone repo
2. Run command in terminal in repo directory:

```bash
docker compose up -d
```

3. Open url `http://localhost:3000/` in browser

## API endpoints

### Create Short URL

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com/",
    "expiresAt": "2025-10-31T23:59:59.000Z",
    "alias": "my-cool-alias"
  }'
```

### Delete URL

```bash
curl -X DELETE http://localhost:3000/delete/my-cool-alias
```

### Redirect URL

```bash
curl -X GET http://localhost:3000/my-cool-alias
```

### URL info

```bash
curl -X GET http://localhost:3000/info/my-cool-alias
```

### URL analytics

```bash
curl -X GET http://localhost:3000/analytics/my-cool-alias
```
