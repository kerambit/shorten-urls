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
