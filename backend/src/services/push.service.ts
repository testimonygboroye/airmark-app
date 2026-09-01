import webPush from "web-push";
import { PushSubscription } from "../models/PushSubscription.model";
import { env } from "../config/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webPush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body?: string }
): Promise<void> {
  ensureConfigured();
  const subscriptions = await PushSubscription.find({ userId });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        // Expired/invalid subscription (410 Gone / 404) — clean it up silently.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
}
