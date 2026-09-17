# THE LORD’S TABLE — BIBLE GAMES ✝️

A mobile-first, real-time multiplayer Bible game web application built for live group Christian fellowship events, dinner tables, and cell groups (20–30 guests).

---

## 🌟 Key Features

- **Mobile-First & Player Friendly**:
  - **Zero player accounts, no signup, no email, no password**.
  - Guests join with a simple **4-digit Game Code** (e.g. `2741`) and their **Name / Table**.
  - Session auto-reconnect: refreshing the phone browser never loses player identity, room connection, or score.
- **Three Distinct Game Modes**:
  1. **👍 👎 Game 1 — Agree or Disagree**:
     - Large biblical statements (e.g. *“Daniel spent three days and three nights inside a great fish.”*).
     - Single answer locking (`ANSWER LOCKED 🔒`).
     - Reveal answer shows correct answer, explanation, scripture citation (e.g. *Jonah 1:17*), confetti, and updated player score.
  2. **📚 Game 2 — Bible Categories**:
     - Challenges like *“NAME 5 WOMEN IN THE OLD TESTAMENT”*.
     - Verbal table discussion with synchronized countdown.
     - Host reveals list of approved answers and can click `+1 Point` for table teams.
  3. **⏳ Game 3 — Put It In Order**:
     - Four Bible events displayed in **randomized order**.
     - Touch drag-and-drop cards + Up/Down quick tap buttons for mobile phones.
     - Host reveals correct chronological order (1st to 4th) with biblical timelines and automatic scoring.
- **Host / Admin Dashboard**:
  - Protected by a simple **Admin PIN** (Default: `1234`).
  - Configure game mode, round count (3, 5, 7, 10, or All), difficulty (Easy, Medium, Hard, All), and timer length (10s, 15s, 20s, 30s, 45s, 60s, or Custom).
  - Full synchronized timer controls: Start, Pause, Resume, Reset, and End Round Early.
  - High-urgency warning at 5 seconds with pulsing visual countdown and audio cues.
  - Live response tally (see who answered Agree vs Disagree, who ordered, etc.).
  - Broadcast / Hide Leaderboard with podium rankings (🥇, 🥈, 🥉).
  - Full **Question Bank CRUD**: Add, Edit, Delete questions, and customize the question pool with 30 preloaded authentic Bible questions!
- **Sound Effects**:
  - Built-in Web Audio API synthesizer: timer ticks, 5-second countdown pulse, gong, chime, and victory fanfare (with navbar mute toggle).
- **The Lord's Table Dinner Aesthetic**:
  - Warm linen cream (`#FBF8F3`), deep espresso typography (`#241A15`), royal purple accents (`#5C2483`), muted antique gold (`#C5A059`), terracotta warning (`#C85A32`), and Playfair Display editorial typography.

---

## 🚀 How to Run the Game

You have **two easy ways** to run and host the event:

### Option 1: Local Venue WiFi Server (Fastest & Zero Setup! ⚡)

No accounts or internet cloud configuration needed! The host runs this on their laptop connected to the venue WiFi, and all guests join from their phones.

1. Open PowerShell or Terminal in this directory:
   ```powershell
   node server.js
   ```
2. The terminal will print:
   ```
   👑 Host / Laptop URL:   http://localhost:3000
   📱 Player / Venue WiFi: http://192.168.1.X:3000
   ```
3. Open `http://localhost:3000` on your laptop to Host.
4. Tell guests to connect their phones to the venue WiFi and open `http://192.168.1.X:3000`!

---

### Option 2: Deploy to the Cloud (Vercel / Firebase)

If you want an internet link (e.g. `https://lords-table.vercel.app`) that players can access anywhere over 4G/5G mobile data:

1. **Deploy to Vercel**:
   - Push this folder to a GitHub repository or drag-and-drop to [Vercel Dashboard](https://vercel.com/new).
   - Vercel automatically deploys `index.html`.
2. **Connect Free Firebase Firestore**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and create a free project.
   - Under **Build** → **Authentication**, enable **Anonymous Auth**.
   - Under **Build** → **Firestore Database**, create a database and paste the rules from `firestore.rules`:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /games/{gameCode} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
   - In your app, click the **⚙️ (Sliders)** icon in the top right, paste your Firebase web config, and click **Save & Connect Cloud**!

---

## 👑 Host Admin Details

- **Admin PIN**: Default is `1234`.
- **Question Bank**: Accessible via the Host Dashboard. You can add new questions, edit existing questions, or remove questions at any time. All changes are saved to browser storage.
- **Manual Scoring**: The Host can add or subtract points for any player/team at any time from the Scoreboard card.
- **Leaderboard**: The Host can toggle the Leaderboard on/off so it only displays between rounds without interrupting questions.
