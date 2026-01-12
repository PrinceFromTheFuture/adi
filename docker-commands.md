# Docker PostgreSQL Setup Commands

## Start PostgreSQL Container

```bash
docker-compose up -d
```

## Check if Container is Running

```bash
docker-compose ps
```

## View Container Logs

```bash
docker-compose logs -f postgres
```

## Stop the Container

```bash
docker-compose down
```

## Stop and Remove All Data (Fresh Start)

```bash
docker-compose down -v
```

## Connect to PostgreSQL Inside Container

```bash
docker exec -it adi-postgres psql -U postgres -d adi
```

## Quick Commands Summary

1. **Start**: `docker-compose up -d`
2. **Stop**: `docker-compose down`
3. **Restart**: `docker-compose restart`
4. **View logs**: `docker-compose logs -f`

---

## After Starting Docker Container

1. Wait a few seconds for PostgreSQL to start
2. Test connection: `node test-db-connection.js`
3. Run migrations: `npx drizzle-kit generate && npx drizzle-kit migrate`
4. Start your app: `npm run dev`

