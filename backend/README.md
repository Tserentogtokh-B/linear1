# Task System — Backend

Linear-style task онооx систем. Express + Prisma + SQLite + JWT.

## Ажиллуулах

```bash
cd backend
npm install
npx prisma migrate dev   # DB үүсгэх (анх удаа)
npm run dev              # http://localhost:4000
```

## API endpoints

| Method | Зам              | Тайлбар                                                      | Auth |
| ------ | ---------------- | ------------------------------------------------------------ | ---- |
| POST   | `/auth/register` | Бүртгүүлэх                                                   | ❌   |
| POST   | `/auth/login`    | Нэвтрэх → JWT                                                | ❌   |
| GET    | `/users`         | Хэрэглэгчдийн жагсаалт (assign хийхэд)                       | ✅   |
| GET    | `/tasks`         | Task жагсаалт (`?assignee=me`, `?mine=true`, `?status=todo`) | ✅   |
| GET    | `/tasks/:id`     | Нэг task                                                     | ✅   |
| POST   | `/tasks`         | Task үүсгэх + onoоx                                          | ✅   |
| PATCH  | `/tasks/:id`     | Status солих / дахин assign / засах                          | ✅   |
| DELETE | `/tasks/:id`     | Устгах                                                       | ✅   |

Auth шаардлагатай endpoint-д header дамжуулна: `Authorization: Bearer <token>`

## Жишээ урсгал

```bash
# 1. Бүртгүүлэх
curl -X POST localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bat@test.mn","name":"Bat","password":"secret123"}'

# 2. Task үүсгэж хүнд onoоx (token-оо тавина)
curl -X POST localhost:4000/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Login хуудас хийх","priority":"high","assignedToId":"<USER_ID>"}'

# 3. Надад onooгдсон task-ууд
curl "localhost:4000/tasks?assignee=me" -H "Authorization: Bearer <TOKEN>"

# 4. Status солих
curl -X PATCH localhost:4000/tasks/<TASK_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

## PostgreSQL руу шилжих

1. `prisma/schema.prisma` → `provider = "postgresql"`
2. `.env` → `DATABASE_URL` -ийг postgres connection string-ээр солих
3. `npx prisma migrate dev`
