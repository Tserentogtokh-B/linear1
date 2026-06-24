# Task System — Frontend

React + Vite + TypeScript. Backend (`../backend`) -тэй ярьдаг.

## Ажиллуулах

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

> Backend-ийг эхлээд асаасан байх ёстой (`cd backend && npm run dev`).
> Backend хаяг `.env` доторх `VITE_API_URL` -ээр тохирно (default: http://localhost:4000).

## Бүтэц

```
src/
├── main.tsx              # эхлэл цэг (Router + AuthProvider)
├── App.tsx               # route: /login, / (board)
├── api.ts                # fetch wrapper (JWT header автоматаар)
├── auth.tsx              # нэвтрэлтийн context (localStorage)
├── types.ts              # User, Task type-ууд
├── pages/
│   ├── Login.tsx         # нэвтрэх / бүртгүүлэх
│   └── Board.tsx         # task самбар (3 багана + шүүлтүүр)
└── components/
    ├── TaskForm.tsx      # task үүсгэх + хүнд onoox
    └── TaskCard.tsx      # нэг task, status солих, устгах
```

## Боломжууд

- Бүртгүүлэх / нэвтрэх (JWT localStorage-д хадгална)
- Task үүсгэж хэрэглэгчид **onoox** (assignee dropdown)
- Status баганаар харах: Todo / In Progress / Done
- Шүүлтүүр: Бүгд / Надад onooгдсон / Миний үүсгэсэн
- Status солих, task устгах
