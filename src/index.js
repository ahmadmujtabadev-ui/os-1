import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes/index.js';


const app = express();
const corsOptions = {
  origin: ['*'], 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use(routes);

app.get("/", (_req, res) => {
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Canvastry Wholesale • API</title>
  <meta name="description" content="Canvastry Wholesale backend API" />
  <link rel="icon" href="/public/favicon.ico" />
  <!-- Tailwind via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 text-gray-800 antialiased">
  <div class="mx-auto max-w-4xl px-6 py-14">
    <header class="flex items-center gap-3">
      <div class="h-12 w-12 rounded-2xl bg-gray-900 text-white grid place-items-center font-semibold">CW</div>
      <div>
        <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">Canvastry Wholesale — Backend</h1>
        <p class="text-sm text-gray-500">A clean API surface with versioned base URL</p>
      </div>
    </header>

    <main class="mt-10 grid gap-6">
      <!-- Status Card -->
      <section class="rounded-2xl border bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium">Server Status</h2>
          <span class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Running
          </span>
        </div>
        <div class="mt-4 grid gap-2 text-sm text-gray-600">
          <p><span class="font-medium text-gray-900">Environment:</span> ${process.env.NODE_ENV || "development"}</p>
          <p><span class="font-medium text-gray-900">Timestamp:</span> ${new Date().toISOString()}</p>
        </div>
      </section>
     
      <!-- Footer -->
      <footer class="text-center text-xs text-gray-500 mt-4">
        © ${new Date().getFullYear()} Canvastry Wholesale. All rights reserved.
      </footer>
    </main>
  </div>
</body>
</html>`);
});
/* eslint-disable no-undef */
const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 8080;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));

