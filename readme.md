# BCN - API Server

## Deployment steps

1. Close local front-end server
2. Close local admin server
3. Close local back-end server
4. Check front-end build `make build`
5. Check admin build `make build`
6. Check [front-end](https://www.bcnindia.com/version.txt) version matches with production
7. Check [admin](https://admin.bcnindia.com//version.txt) version matches with production
8. Check [back-end](https://api.bcnindia.com/version) version matches with production
9. Tag front-end version `npm version major|minor|patch`
10. Tag admin version `npm version major|minor|patch`
11. Tag back-end version `npm version major|minor|patch`
12. Push front-end code `git push origin frontend`
13. Push admin code `git push origin admin`
14. Push back-end code `git push origin backend`
15. Sync back-end code `make sync-prod`
16. Backup DB
17. Login server
18. Stop server `pm2 stop prod`
19. Run migration script
20. start server using `pm2 start prod`
21. Check server status `pm2 logs`
22. Sync front-end `make sync-prod`
23. Sync admin `make sync-prod`
24. Check [front-end](https://www.bcnindia.com/version.txt) version
25. Check [admin](https://admin.bcnindia.com//version.txt) version
26. Check [back-end](https://api.bcnindia.com/version) version
27. Logout server

## Project setup

Create new `.env` from `.env.dummy`.

```bash
npm i
make
```

## Sync

Dev

```bash
make sync-dev
```

Prod

```bash
make sync-prod
```
