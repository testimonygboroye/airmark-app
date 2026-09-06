export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
  founderOnly?: boolean;
  images?: { src: string; alt: string; caption?: string }[];
}

export const HELP_ARTICLES: HelpArticle[] = [
  // ===== ABOUT AIRMARK =====
  {
    id: "what-is-airmark",
    category: "About Airmark",
    title: "What is Airmark?",
    keywords: ["what", "airmark", "about", "purpose", "why"],
    images: [{ src: "/icons/icon-512.png", alt: "Airmark app icon", caption: "The Airmark app icon" }],
    content: `Airmark is a live-production coordination and broadcast engine built for camera operators and production crews at live-streamed events — churches, conferences, weddings, and school events.

The core problem it solves: camera operators often don't know in real time whether their camera is the one currently live, which leads to unstable footage reaching the audience when they reposition without realizing they're on-air. Airmark also solves the broader coordination chaos of running a multi-camera production with a volunteer team that has no professional intercom systems or broadcast tally hardware.

Airmark has two tiers. The Coordination Layer works on any phone, with zero extra hardware — live tally, run-of-show sync, discreet crew signals, and more. The Production Engine remotely controls free OBS Studio software on a venue laptop, giving volunteer teams professional-broadcast-level output — scene switching, overlays, and reliability failsafes — without professional broadcast budgets.

Airmark never processes, streams, or stores video itself — see "Why can't I see live video in Airmark?" for exactly what that means and why.`,
  },
  {
    id: "why-no-video-preview",
    category: "About Airmark",
    title: "Why can't I see live video in Airmark?",
    keywords: ["video", "preview", "camera", "see", "why", "watch"],
    content: `Airmark is a coordination and control layer — it never captures, streams, or stores actual video, on purpose. This keeps it genuinely free to run forever, with no video-hosting costs that would eventually force fees onto volunteer teams.

This does not mean operators can't see what they're filming. If you're using a phone as your camera, you see through that phone's own normal camera app — Airmark typically runs on a second device (or you glance between the two) purely for the LIVE/STANDBY status. If you're using a real camera (DSLR, camcorder), you see through that camera's own screen or viewfinder exactly as you always would — Airmark was never meant to replace that.

For directors: if your team uses OBS, the multi-camera preview lives on the OBS laptop itself (its built-in Studio Mode shows every camera at once) — that's the real preview screen, and Airmark doesn't need to duplicate it. Without OBS, directors typically need a physical line of sight to operators or a venue monitor, same as any production without dedicated video-preview hardware.`,
  },
  {
    id: "about-founder",
    category: "About Airmark",
    title: "Who built Airmark? About the founder",
    keywords: ["founder", "who", "built", "testimony", "gboroye", "creator"],
    images: [{ src: "/icons/mark-transparent-512.png", alt: "Airmark mark", caption: "The Airmark beacon mark" }],
    content: `Airmark was built by Testimony Oluwatimilehin Gboroye, founder of TGO DevStudio, a technology studio based in Akure, Ondo State, Nigeria. Airmark is one of TGO DevStudio's flagship projects, built from the ground up with a strong focus on reliability for teams that can't afford professional broadcast equipment.`,
  },
  {
    id: "about-tgo-devstudio",
    category: "About Airmark",
    title: "About TGO DevStudio",
    keywords: ["tgo", "devstudio", "brand", "company", "studio"],
    content: `TGO DevStudio is the technology studio behind Airmark, founded by Testimony Oluwatimilehin Gboroye. Airmark is built as a fully independent, standalone product — it doesn't share branding or infrastructure with any other TGO DevStudio project. TGO DevStudio is credited in small attribution spots (like the app footer), while Airmark has its own separate visual identity, because it's meant to stand on its own as a product any team can trust and use.`,
  },
  {
    id: "why-airmark-was-built",
    category: "About Airmark",
    title: "Why was Airmark built?",
    keywords: ["why", "reason", "problem", "solve"],
    content: `Airmark exists to solve a real, recurring, poorly-solved problem: production crews — especially volunteer teams at churches, schools, and community events — regularly show their live audience shaky, unstable footage because a camera operator didn't realize they were the one currently on-air when they moved their camera. Professional productions solve this with expensive tally-light hardware and intercom systems most volunteer teams simply can't afford. Airmark solves the same problem using only the phones people already own.`,
  },
  {
    id: "brand-and-logo",
    category: "About Airmark",
    title: "About the Airmark brand and logo",
    keywords: ["logo", "brand", "colors", "design", "mark"],
    images: [
      { src: "/icons/mark-transparent-512.png", alt: "Airmark beacon mark", caption: "The Airmark mark, standalone" },
      { src: "/icons/icon-512.png", alt: "Airmark app icon on navy background", caption: "The full app icon" },
    ],
    content: `Airmark's identity is built around a "beacon" mark — a simple arc and dot shape evoking a broadcast tally light — in signal red on a navy background. Red is used only to represent the LIVE state throughout the entire app, never decoratively, so it always means the same thing wherever you see it. The name "Airmark" combines "on-air" with "mark" — marking a live moment or cue, which is the app's central purpose.`,
  },

  // ===== GETTING STARTED / AUTH =====
  {
    id: "create-account",
    category: "Getting Started",
    title: "How to create an account",
    keywords: ["create", "account", "register", "sign up", "signup"],
    content: `Go to the Register page and enter your first name, optional middle name, last name, email, and a password. Your password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character. Names can only contain letters and single hyphens between words (like "El-rufai") — no spaces, numbers, or symbols. After submitting, check your email for a verification link — you must click it before you can log in.`,
  },
  {
    id: "verify-email",
    category: "Getting Started",
    title: "How to verify your email",
    keywords: ["verify", "email", "verification", "confirm"],
    content: `After creating an account, Airmark sends a verification link to your email. Click it to activate your account. If you signed up through a team invite, verifying your email also automatically adds you to that team the moment you click the link.

If the link expired or you lost the email, go to the Login page and try logging in — you'll see an unverified-account error with a "Resend verification email" option right there. Requesting a new link automatically invalidates the old one.`,
  },
  {
    id: "login",
    category: "Getting Started",
    title: "How to log in",
    keywords: ["login", "log in", "sign in"],
    content: `Enter your email and password on the Login page. If your account has two-factor authentication enabled, you'll be asked for a 6-digit code from your authenticator app after your password is accepted.`,
  },
  {
    id: "forgot-password",
    category: "Getting Started",
    title: "How to reset a forgotten password",
    keywords: ["forgot", "password", "reset"],
    content: `On the Login page, tap "Forgot password?" and enter your email. If that email is registered, you'll receive a reset link valid for 1 hour. This immediately logs you out of all other devices for security.`,
  },
  {
    id: "logout",
    category: "Getting Started",
    title: "How to log out",
    keywords: ["logout", "log out", "sign out"],
    content: `Tap "Log out" in the sidebar or mobile menu. You'll be asked to confirm before it actually logs you out.`,
  },
  {
    id: "two-factor-auth",
    category: "Getting Started",
    title: "Two-factor authentication (2FA) — what it is and how to set it up",
    keywords: ["2fa", "two-factor", "authentication", "security", "authenticator"],
    content: `Two-factor authentication adds a second lock to your account. To set it up: Profile → "Set up 2FA." Scan the QR code (downloadable) with Google Authenticator or similar, enter the 6-digit code to confirm, and save the 8 backup codes shown — each works once if you lose your authenticator app. If you lose both, use "Lost access to your authenticator app?" on the 2FA login screen for an email recovery link.`,
  },
  {
    id: "delete-account",
    category: "Getting Started",
    title: "How to delete your account",
    keywords: ["delete", "account", "close", "remove"],
    content: `Go to Profile → Danger Zone → "Delete my account," type "DELETE MY ACCOUNT" exactly, and enter your password. If you own a team with other members, remove them (or transfer/delete the team) first.`,
  },

  // ===== TEAMS =====
  {
    id: "what-is-a-team",
    category: "Teams",
    title: "What is a team?",
    keywords: ["team", "what"],
    content: `A team represents your production crew — for example, a church's media team. Events, roles, and schedules all belong to a specific team. You can belong to multiple teams with different roles on each.`,
  },
  {
    id: "create-team",
    category: "Teams",
    title: "How to create a team",
    keywords: ["create", "team", "new"],
    content: `From your Dashboard, tap "+ New team," enter a name (3–80 characters), and submit. You're automatically set as Team Owner.`,
  },
  {
    id: "rename-team",
    category: "Teams",
    title: "How to rename a team",
    keywords: ["rename", "edit", "team", "name"],
    content: `On the team's Members page, tap "Rename" next to the team name. Requires the "team:manage" permission.`,
  },
  {
    id: "delete-team",
    category: "Teams",
    title: "How to delete a team",
    keywords: ["delete", "team", "remove"],
    content: `Only the Team Owner, from the Members page's Danger Zone. Every other member must be removed first. Then type "DELETE" followed by the exact team name to confirm — this permanently deletes the team and all its data.`,
  },
  {
    id: "transfer-ownership",
    category: "Teams",
    title: "How to transfer team ownership",
    keywords: ["transfer", "ownership", "owner"],
    content: `From the Members page, the current Team Owner can enter any email address — a current member, a registered non-member, or someone with no Airmark account yet. If they're already registered, ownership transfers immediately (you become Director). If they're unregistered, they receive an invite email, and ownership transfers automatically the moment they accept it. Either way, this requires typed confirmation before proceeding.`,
  },
  {
    id: "invite-members",
    category: "Teams",
    title: "How to invite someone to your team",
    keywords: ["invite", "member", "add", "join"],
    content: `From the Members page, enter their email and a role, then send. If they don't have an account, they get a signup link and join automatically once they register and verify. If they already have a verified account, they get an in-app notification and must accept or decline it themselves — no one joins a team without confirming.`,
  },
  {
    id: "accept-decline-invite",
    category: "Teams",
    title: "How to accept or decline a team invite",
    keywords: ["accept", "decline", "invite", "invites"],
    content: `Go to "Invites" in the sidebar. Pending invites show the team, role offered, and who invited you. Tap Accept or Decline — you'll see a confirmation message either way.`,
  },
  {
    id: "remove-members",
    category: "Teams",
    title: "How to remove a team member",
    keywords: ["remove", "member", "kick"],
    content: `From the Members page, tap "Remove" and confirm. The Team Owner can never be removed this way — ownership must be transferred first.`,
  },
  {
    id: "revoke-invite",
    category: "Teams",
    title: "How to revoke a pending invite",
    keywords: ["revoke", "cancel", "invite"],
    content: `From the Members page, tap "Revoke" next to a pending invite and confirm.`,
  },

  // ===== ROLES =====
  {
    id: "understanding-roles",
    category: "Roles & Permissions",
    title: "Understanding roles — overview",
    keywords: ["role", "roles", "permission", "difference"],
    content: `Every team has its own roles, and a Team Owner can create custom roles with any combination of permissions. Every action is gated behind a specific permission checked against your role on that specific team. The five default roles, highest to lowest authority: Team Owner, Director, Operator, Editor, Viewer.`,
  },
  {
    id: "role-team-owner",
    category: "Roles & Permissions",
    title: "What is a Team Owner? Their role explained",
    keywords: ["team owner", "owner", "role"],
    content: `Complete, unrestricted control over their team. Only the Team Owner can delete the team or transfer ownership. The Team Owner role's permissions can't be edited, guaranteeing every team always has one role with full control.`,
  },
  {
    id: "role-director",
    category: "Roles & Permissions",
    title: "What is a Director? Their role explained",
    keywords: ["director", "role", "who"],
    content: `Runs live events — controls tally (which camera is live), manages run-of-show, sends discreet cues, controls OBS. Can also create/manage events, invite members, and manage checklists.`,
  },
  {
    id: "role-operator",
    category: "Roles & Permissions",
    title: "What is an Operator? Their role explained",
    keywords: ["operator", "videographer", "camera", "role"],
    content: `Assigned to a specific camera. During a live event, watches their LIVE/STANDBY status and repositions only when it shows STANDBY. Can send discreet signals, report equipment issues, mark highlights, and complete checklists. See "Why can't I see live video in Airmark?" for how this connects to actually filming.`,
  },
  {
    id: "role-editor",
    category: "Roles & Permissions",
    title: "What is an Editor? Their role explained",
    keywords: ["editor", "role", "post-event"],
    content: `Works after events end — reviews timestamped highlight markers to help produce clips, with no live control access. Lands on a dedicated Post-Event Review workspace.`,
  },
  {
    id: "role-viewer",
    category: "Roles & Permissions",
    title: "What is a Viewer? Their role explained",
    keywords: ["viewer", "guest", "role"],
    content: `Read-only — for someone who wants to glance at status without operating anything.`,
  },
  {
    id: "custom-roles",
    category: "Roles & Permissions",
    title: "How to create and manage custom roles",
    keywords: ["custom", "role", "manage", "permission", "create role"],
    content: `From a team's Roles page, create new roles with any permission combination, or edit/delete existing custom ones. Built-in roles can't be deleted, and Team Owner's permissions can't be modified.`,
  },
  {
    id: "operator-director-connection",
    category: "Roles & Permissions",
    title: "How does the operator (videographer) connect to the director?",
    keywords: ["operator", "director", "connect", "videographer", "how", "work together"],
    content: `The director assigns each operator to a camera slot on the Event page. When that operator opens Go Live, their screen automatically reflects that assignment.

Actual video flows separately: simple teams have someone physically choosing which camera reaches the audience, and the director taps the matching camera in Airmark the instant they switch — updating every phone instantly. Teams with OBS have the director controlling OBS remotely through Airmark, so tapping a camera really does switch OBS's broadcast. Either way, the operator's job is: hold their camera steady, watch their phone, never move while it says LIVE.`,
  },

  // ===== EVENTS =====
  {
    id: "what-is-an-event",
    category: "Events",
    title: "What is an event?",
    keywords: ["event", "what"],
    content: `A single live production — a Sunday service, a conference session. Creating one sets up camera slots automatically based on how many you specify.`,
  },
  {
    id: "create-event",
    category: "Events",
    title: "How to create an event",
    keywords: ["create", "event", "new", "schedule"],
    content: `From a team's Events page, tap "+ New event." Enter a title (3–100 characters), start time, and number of cameras (a whole number, 1–20). Camera slots are created automatically — add or remove them later at any time.`,
  },
  {
    id: "edit-event",
    category: "Events",
    title: "How to edit an event",
    keywords: ["edit", "event", "change"],
    content: `From the Event Detail page, tap "Edit" to change the title or start time. You can't edit an event while it's live.`,
  },
  {
    id: "delete-event",
    category: "Events",
    title: "How to delete an event",
    keywords: ["delete", "event", "remove"],
    content: `From the Event Detail page, tap "Delete event" and confirm. Can't delete a currently-live event.`,
  },
  {
    id: "event-statuses",
    category: "Events",
    title: "Event statuses explained: scheduled, live, ended — and what Start/End Event actually do",
    keywords: ["status", "scheduled", "live", "ended", "state", "start event", "end event", "usefulness"],
    content: `Every event is "scheduled," "live," or "ended." The key thing Start/End Event actually control: tally (choosing which camera is live) is completely blocked until you tap "Start Event" — this exists specifically so operators can never be accidentally marked live while a team is still setting up, testing camera assignments, or running through a checklist. Once you tap Start Event, the camera-switching buttons become active and every camera tap really does go live.

"End Event" stops tally control again and marks the event finished, moving it into post-event review. If ended by mistake, tap "Reopen as live" on the Event Detail page to bring it back.`,
  },
  {
    id: "camera-assignments",
    category: "Events",
    title: "Camera assignments explained",
    keywords: ["camera", "assignment", "assign", "operator"],
    content: `Each event has camera slots, created automatically. From the Event Detail page, assign a team member as operator for each camera using the dropdown.`,
  },
  {
    id: "add-remove-cameras",
    category: "Events",
    title: "How to add or remove cameras from an event",
    keywords: ["add", "remove", "camera", "delete camera"],
    content: `Tap "+ Add camera" any time, even mid-event. To remove one, tap "Remove" and confirm — a camera currently live can't be removed until the broadcast switches away from it, so this is always safe to do without disrupting what's on-air.`,
  },

  // ===== LIVE MODE =====
  {
    id: "what-is-tally",
    category: "Live Mode",
    title: "What is the tally system?",
    keywords: ["tally", "what", "live", "standby"],
    content: `Tally shows each operator, in real time, whether their camera is currently on-air. When the director marks a camera live, that operator's phone turns red and shows "LIVE" — everyone else shows "STANDBY." Mirrors professional tally-light hardware at zero cost.`,
  },
  {
    id: "go-live-director",
    category: "Live Mode",
    title: "How to go live as a Director",
    keywords: ["go live", "director", "start"],
    content: `Open an event and tap "Go Live." Tap "Start Event" (red) before switching cameras is allowed. Tap any camera tile to make it live instantly. Tap "End Event" when finished. Header and bottom nav stay visible so you can quickly step away (e.g. to invite an operator) without losing your place.`,
  },
  {
    id: "go-live-operator",
    category: "Live Mode",
    title: "How to go live as an Operator",
    keywords: ["go live", "operator", "camera"],
    content: `Once assigned to a camera, open the event and tap "Go Live" to see your LIVE/STANDBY screen. Wait for LIVE before repositioning your physical camera. See "Why can't I see live video in Airmark?" for how this connects to your actual filming.`,
  },
  {
    id: "run-of-show",
    category: "Live Mode",
    title: "What is Run-of-Show and how to use it",
    keywords: ["run of show", "ros", "segment", "program"],
    content: `Lets a Director build a segment list ahead of time, then tap through them live — every screen shows current and next segment instantly, replacing shouted coordination. Set it up from the Event Detail page before going live.`,
  },
  {
    id: "countdown",
    category: "Live Mode",
    title: "What is the countdown feature, and how to use it",
    keywords: ["countdown", "timer", "start", "seconds", "pause", "resume"],
    content: `Shows a synced timer on every connected phone simultaneously — useful for "we go live in 2 minutes" coordination. Set hours/minutes/seconds (minimum 5 seconds total) and tap Start. While running, you can Pause (freezes the remaining time) and Resume later, or Cancel entirely to remove it. If your team uses OBS, you can also push the same countdown onto the actual broadcast output via "Push countdown to broadcast."`,
  },
  {
    id: "discreet-signals",
    category: "Live Mode",
    title: "What are discreet signals, and how to send one",
    keywords: ["signal", "discreet", "battery", "backup", "audio issue"],
    content: `Silent alerts to the Director — "Battery low," "Need backup," "Audio issue" — without disrupting the event. Tap the signal icon on your Go Live screen and pick the issue. The Director sees who sent it, when, and can tap "Ack" once handled.`,
  },
  {
    id: "director-talkback",
    category: "Live Mode",
    title: "What is Director Talkback, and how to use it",
    keywords: ["talkback", "message", "director", "cue"],
    content: `Lets a Director send a short text cue to a specific operator — like "Camera 2, tighten your shot." From the Go Live page, tap "Send message," pick the operator, type the cue. It shows briefly as a banner on their screen.`,
  },
  {
    id: "highlight-marker",
    category: "Live Mode",
    title: "How to mark a highlight moment",
    keywords: ["mark", "highlight", "clip", "moment"],
    content: `Tap "Mark" on the Go Live screen to timestamp a moment worth clipping, with an optional label. After the event, Editors review every marked timestamp on the Highlights page without rewatching the whole recording.`,
  },
  {
    id: "equipment-status",
    category: "Live Mode",
    title: "How to report and resolve equipment issues",
    keywords: ["equipment", "battery", "storage", "issue", "report"],
    content: `Operators report battery/storage/equipment problems from their Go Live screen. Managers see these on the Equipment Status page and mark them "Resolved" once handled.`,
  },
  {
    id: "checklists",
    category: "Live Mode",
    title: "Pre-event checklists — setup and use",
    keywords: ["checklist", "pre-event", "readiness"],
    content: `Each role can have a reusable checklist, set up once from the Roles page. Before going live, members tick off their own items. Directors view team-wide readiness from "Crew readiness."`,
  },

  // ===== SCHEDULING =====
  {
    id: "media-scheduling",
    category: "Scheduling",
    title: "How to use the team schedule",
    keywords: ["schedule", "rotation", "duty", "assign"],
    content: `From a team's Schedule page, assign members to roles on specific dates. Everyone can view; only those with permission add or remove assignments.`,
  },

  // ===== OBS / PRODUCTION ENGINE =====
  {
    id: "what-is-obs-bridge",
    category: "OBS Production Engine",
    title: "What is the OBS bridge, and do I need it?",
    keywords: ["obs", "bridge", "what", "need"],
    content: `A small program connecting your team's OBS Studio (on a venue laptop) to Airmark. Only needed for real multi-camera video switching via OBS — Tier 2's coordination features work with zero extra hardware regardless. Requires a laptop or PC — OBS doesn't run on phones.`,
  },
  {
    id: "connect-obs",
    category: "OBS Production Engine",
    title: "How to connect OBS to Airmark",
    keywords: ["connect", "obs", "pair", "pairing"],
    content: `Director's Go Live page → "Connect OBS" generates a pairing code (10 minutes). Run the bridge script on the laptop and paste the code. "OBS Connected" shows green once linked.`,
  },
  {
    id: "obs-scene-switching",
    category: "OBS Production Engine",
    title: "How to switch OBS scenes from Airmark",
    keywords: ["scene", "switch", "obs"],
    content: `Once connected, scene buttons appear on the Go Live page — tapping one switches OBS's live output exactly as if clicked on the laptop.`,
  },
  {
    id: "obs-transitions",
    category: "OBS Production Engine",
    title: "How to change transition style and duration",
    keywords: ["transition", "cut", "fade", "duration"],
    content: `Transition controls let you pick the style applied on scene switches and adjust duration with the slider.`,
  },
  {
    id: "obs-scene-items",
    category: "OBS Production Engine",
    title: "How to toggle sources (like a PIP overlay) on/off within a scene",
    keywords: ["source", "toggle", "pip", "overlay", "scene item"],
    content: `The "Sources in current scene" panel lists every element in your live scene with individual toggles.`,
  },
  {
    id: "obs-text-overlay",
    category: "OBS Production Engine",
    title: "How to update text overlays (lower-thirds, quotes) live",
    keywords: ["text", "overlay", "lower third", "caption", "quote"],
    content: `Tap "Edit text overlay" to pick a text source and update its content live.`,
  },
  {
    id: "obs-watermark",
    category: "OBS Production Engine",
    title: "How to set up and toggle a watermark",
    keywords: ["watermark", "logo overlay"],
    content: `Set the source once via "Set watermark," then toggle it on/off any time during the broadcast.`,
  },
  {
    id: "obs-audio",
    category: "OBS Production Engine",
    title: "How to mute/unmute audio sources",
    keywords: ["audio", "mute", "unmute", "sound"],
    content: `Tap "Audio" for Mute/Unmute buttons on every audio source already set up in OBS — no extra hardware required for basic control.`,
  },
  {
    id: "obs-replay",
    category: "OBS Production Engine",
    title: "How to use Instant Replay",
    keywords: ["replay", "instant replay"],
    content: `The replay buffer starts automatically once connected. Tap "Save Instant Replay" to save the last several seconds.`,
  },
  {
    id: "obs-failsafe",
    category: "OBS Production Engine",
    title: "Technical Difficulties fallback — setup and use",
    keywords: ["fallback", "technical difficulties", "failsafe"],
    content: `Build a "Technical Difficulties" scene in OBS first, select it via "Set up fallback scene," then a single red button appears to instantly switch to it if something goes wrong.`,
  },
  {
    id: "obs-stream-record",
    category: "OBS Production Engine",
    title: "How to start/stop streaming and recording",
    keywords: ["stream", "record", "start", "stop"],
    content: `"Start Stream"/"Start Recording" tell OBS to begin streaming or recording locally. Configured intro/outro scenes play automatically.`,
  },
  {
    id: "obs-audience-overlays",
    category: "OBS Production Engine",
    title: "How to set up audience overlay favorites (QR code, polls, etc)",
    keywords: ["audience", "overlay", "qr", "poll", "favorite"],
    content: `Build your overlay sources in OBS first, then favorite them in Airmark for one-tap access during live events.`,
  },
  {
    id: "obs-intro-outro",
    category: "OBS Production Engine",
    title: "How to set up automatic intro/outro",
    keywords: ["intro", "outro", "auto insert"],
    content: `Pick which scenes auto-play at stream start/stop, and for how long, via "Intro/Outro" on the Go Live page.`,
  },

  // ===== NOTIFICATIONS =====
  {
    id: "notifications-overview",
    category: "Notifications",
    title: "How notifications work",
    keywords: ["notification", "alert", "bell"],
    content: `You get an in-app notification (and a push notification, even with the app closed) for director cues, crew signals, equipment reports, and team invites. Tap any notification to see full details, including the sender's email.`,
  },
  {
    id: "notification-read-unread",
    category: "Notifications",
    title: "How to mark notifications read/unread and filter them",
    keywords: ["read", "unread", "filter", "mark"],
    content: `Use the All/Unread/Read filters at the top of the Notifications page. Tap "Mark read/unread" to toggle, or tap the notification to see its full detail page.`,
  },

  // ===== ADMIN =====
  {
    id: "system-console",
    category: "Admin",
    title: "What is the System Console?",
    keywords: ["admin", "system console", "founder"],
    founderOnly: true,
    content: `Visible only to the Founder/Super Admin account — shows every team and user across all of Airmark, with platform-wide stats. Founders can also remove accounts (like leftover test accounts) directly from here.`,
  },

  // ===== HELP =====
  {
    id: "using-this-help-guide",
    category: "Help & Guide",
    title: "How to use this Help & Guide",
    keywords: ["help", "guide", "search", "how to use"],
    content: `Type anything into the search box — a word, question, or feature name — to filter articles instantly. Tap any article to read it; going back returns you to exactly where you scrolled. Your most recently opened article is marked with a highlighted border in the list.`,
  },
];

export const HELP_CATEGORIES = Array.from(new Set(HELP_ARTICLES.map((a) => a.category)));
HELP_ARTICLES.push(
  {
    id: "operator-video-preview",
    category: "Live Mode",
    title: "How the operator's camera preview works, and what to do on a weak connection",
    keywords: ["video", "preview", "camera", "director", "see", "connection", "weak", "rural"],
    content: `Your Go Live screen shows your own camera's live feed directly on your phone — no separate camera app needed. The Director's phone can also see this same feed on their camera grid, sent directly phone-to-phone (never through Airmark's servers, so it costs nothing and stays fast).

On a weak or rural connection, Airmark automatically requests a smaller, lower-frame-rate picture specifically because it's far more likely to connect and stay connected than a crisp one that keeps failing — a blurrier picture that works beats a clear one that doesn't. If a connection drops, it retries automatically every few seconds without you needing to do anything. The Director's camera tile will show "Connecting…" or "Reconnecting — weak signal?" while this happens, and switches to your live video the moment it succeeds.

If a connection genuinely cannot be established (extremely poor signal), that camera simply won't show live video to the Director — but tally (LIVE/STANDBY) still works normally regardless, since that's a tiny text message, not video.`,
  },
  {
    id: "countdown-controls-explained",
    category: "Live Mode",
    title: "Countdown: Pause, Resume, and Stop explained",
    keywords: ["countdown", "pause", "resume", "stop", "cancel"],
    content: `Once a countdown is running, two buttons appear: "Pause" (highlighted, the primary action — freezes the remaining time exactly where it is) and "Stop countdown" (removes it entirely). While paused, "Resume" picks up from exactly where you left off, or "Stop countdown" cancels it completely. While setting up a new countdown before starting it, "Close" simply dismisses that setup box without starting anything — different from "Stop countdown," which only appears once a countdown is actually running or paused.`,
  },
  {
    id: "settings-vs-profile",
    category: "Getting Started",
    title: "Settings vs. Profile — what's the difference?",
    keywords: ["settings", "profile", "difference", "zoom", "preferences"],
    content: `Profile holds anything tied to your account identity: your name, password, two-factor authentication, and account deletion. Settings (a separate page in the sidebar) holds general app preferences that aren't account-security related — currently your camera zoom limit, which controls how far the zoom slider goes on your Go Live camera preview.`,
  },
  {
    id: "camera-zoom",
    category: "Live Mode",
    title: "How to use and adjust camera zoom",
    keywords: ["zoom", "camera", "pinch"],
    content: `On your Go Live screen, a zoom slider appears beneath your camera preview if your device supports it (most Android phones; not currently supported on iOS Safari — a browser limitation, not something Airmark controls). Drag it to zoom in or out live. To set how far that slider can go, visit Settings in the sidebar and adjust your camera zoom limit — this is a one-time preference, not something you set during a live event.`,
  }
);
