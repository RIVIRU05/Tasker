# Tasker — Setup & Deploy

This covers taking the app from local mock data to a real, hosted, multi-user app.

## 1. Firebase (real accounts + database)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it (e.g. "tasker").
2. **Build → Authentication** → Get started → enable the **Email/Password** provider.
3. **Build → Firestore Database** → Create database → **production mode** → pick a region close to Sri Lanka (`asia-south1` is a good choice).
4. **Firestore → Rules** tab → replace the contents with `firestore.rules` from this repo → Publish.
5. **Build → Storage** → Get started → **production mode** → same region as Firestore. This is where uploaded task/completion photos live.
6. **Storage → Rules** tab → replace the contents with `storage.rules` from this repo → Publish.
7. **Project settings** (gear icon) → **General** → scroll to "Your apps" → click the **Web** icon (`</>`) → register an app (any nickname) → copy the `firebaseConfig` values shown.

## 2. Wire the config in

Both apps read the same Firebase project through env vars — copy the example file and fill in the values from step 1.5:

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Edit both files:
- Fill in every `FIREBASE_*` value from the Firebase console.
- Set `NEXT_PUBLIC_USE_MOCK=false` (web) and `EXPO_PUBLIC_USE_MOCK=false` (mobile) to switch off mock data.

Restart `npm run dev` / `npx expo start` after editing.

## 3. GitHub

```bash
git init   # already done
git add -A
git commit -m "Tasker: full marketplace app"
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

## 4. Vercel (hosting the website)

1. [vercel.com](https://vercel.com) → sign up with GitHub → **Add New → Project** → import the repo you just pushed.
2. **Root Directory**: set to `apps/web` (important — this is a monorepo).
3. Framework preset: Next.js (auto-detected).
4. Add the same env vars from `apps/web/.env.local` under **Environment Variables**.
5. Deploy. You'll get a `*.vercel.app` URL immediately.

### Custom domain
Vercel project → **Settings → Domains** → add your domain → it shows you 1-2 DNS records (usually an `A` record or `CNAME`) → add those at your domain registrar (Namecheap/Porkbun/etc, wherever you bought it) → propagation is usually minutes, sometimes a few hours.

## 5. Mobile app

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with the **Expo Go** app (Play Store) on your Android phone. Real accounts, real posting/bidding — same Firebase backend as the website.

### Standalone installable APK (no Play Store needed)
Once things are stable:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```
This produces a downloadable `.apk` link — install it directly on any Android phone (enable "install unknown apps" once). No Play Store review needed.

## Notes / known simplifications (given the timeline)

- **Firestore and Storage security rules are permissive** — any signed-in user can write most collections/paths. Fine for a demo/launch; tighten later (e.g. only a task's owner can edit it).
- **Task and completion photos are real uploads** to Firebase Storage (camera roll on mobile, file picker on web) — completion photos are automatically deleted from Storage once a customer approves payment with no dispute filed.
- **No real payment processing** — the Koko Pay flow is a mockup, as originally scoped.
