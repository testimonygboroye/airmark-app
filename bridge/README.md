# Airmark OBS Bridge

This is a small local relay that connects your OBS Studio (running on this
laptop) to Airmark's director controls on your phone.

## Setup (one-time, on the venue laptop)

1. Install [Node.js](https://nodejs.org) (v22 or later) if not already installed.
2. In OBS Studio: **Tools → WebSocket Server Settings** → enable the
   WebSocket server, note the port (default `4455`) and password if set.
3. In this folder, run: npm install

## Running it (every time before a live event)

1. Make sure OBS Studio is open.
2. In Airmark, as Director: open your event → **Go Live** → **Connect OBS**
→ copy the pairing code shown (valid for 10 minutes).
3. In this folder, run: npm start
4. Paste the pairing code when prompted.
5. You should see `✓ Connected to OBS Studio` and `✓ Connected to Airmark
backend`. Leave this window open for the duration of the event.

If your OBS WebSocket server has a password set, create a `.env` file
(copy `.env.example`) and fill in `OBS_PASSWORD` before running `npm start`
— otherwise the connection to OBS will fail.
