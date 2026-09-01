export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
}

export const HELP_ARTICLES: HelpArticle[] = [
  // ===== ABOUT AIRMARK =====
  {
    id: "what-is-airmark",
    category: "About Airmark",
    title: "What is Airmark?",
    keywords: ["what", "airmark", "about", "purpose", "why"],
    content: `Airmark is a live-production coordination and broadcast engine built for camera operators and production crews at live-streamed events — churches, conferences, weddings, and school events.

The core problem it solves: camera operators often don't know in real time whether their camera is the one currently live, which leads to unstable footage reaching the audience when they reposition without realizing they're on-air. Airmark also solves the broader coordination chaos of running a multi-camera production with a volunteer team that has no professional intercom systems or broadcast tally hardware.

Airmark has two tiers. The Coordination Layer works on any phone, with zero extra hardware — live tally, run-of-show sync, discreet crew signals, and more. The Production Engine remotely controls free OBS Studio software on a venue laptop, giving volunteer teams professional-broadcast-level output — scene switching, overlays, and reliability failsafes — without professional broadcast budgets.`,
  },
  {
    id: "about-founder",
    category: "About Airmark",
    title: "Who built Airmark? About the founder",
    keywords: ["founder", "who", "built", "testimony", "gboroye", "creator"],
    content: `Airmark was built by Testimony Oluwatimilehin Gboroye, founder of TGO DevStudio, a technology studio based in Akure, Ondo State, Nigeria. Airmark is one of TGO DevStudio's flagship projects — built entirely from a phone using Termux, without a traditional laptop-based development setup.`,
  },
  {
    id: "about-tgo-devstudio",
    category: "About Airmark",
    title: "About TGO DevStudio",
    keywords: ["tgo", "devstudio", "brand", "company", "studio"],
    content: `TGO DevStudio is the technology studio behind Airmark, founded by Testimony Oluwatimilehin Gboroye. Airmark is built as a fully independent, standalone product — it doesn't share branding or infrastructure with any other TGO DevStudio project. You'll see TGO DevStudio credited as "Built by" in small attribution spots (like the app footer), while Airmark has its own separate visual identity — its own logo, its own colors, its own name — because it's meant to stand on its own as a product any team can trust and use, regardless of who built it.`,
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
    content: `After creating an account, Airmark sends a verification link to your email. Click it to activate your account. If you signed up through a team invite, verifying your email also automatically adds you to that team the moment you click the link — no separate step needed.

If the link expired or you lost the email, go to the Login page and try logging in — since your account isn't verified yet, you'll see an error message with a "Resend verification email" option right there. Requesting a new link automatically invalidates the old one.`,
  },
  {
    id: "login",
    category: "Getting Started",
    title: "How to log in",
    keywords: ["login", "log in", "sign in"],
    content: `Enter your email and password on the Login page. If your account has two-factor authentication enabled, you'll be asked for a 6-digit code from your authenticator app after your password is accepted. If you haven't verified your email yet, you'll see a message explaining that, with an option to resend the verification link.`,
  },
  {
    id: "forgot-password",
    category: "Getting Started",
    title: "How to reset a forgotten password",
    keywords: ["forgot", "password", "reset"],
    content: `On the Login page, tap "Forgot password?" and enter your email. If that email is registered, you'll receive a reset link valid for 1 hour. Clicking it lets you set a new password. For security, this immediately logs you out of all other devices, so you'll need to log in again everywhere with your new password.`,
  },
  {
    id: "logout",
    category: "Getting Started",
    title: "How to log out",
    keywords: ["logout", "log out", "sign out"],
    content: `Tap "Log out" in the sidebar (desktop) or the mobile menu. You'll be asked to confirm before it actually logs you out, so you can't do it by accident.`,
  },
  {
    id: "two-factor-auth",
    category: "Getting Started",
    title: "Two-factor authentication (2FA) — what it is and how to set it up",
    keywords: ["2fa", "two-factor", "authentication", "security", "authenticator"],
    content: `Two-factor authentication adds a second lock to your account — your password proves you know the secret, and 2FA proves you also have your phone with an authenticator app on it. Both are required to log in once enabled.

To set it up: go to Profile → "Set up 2FA." Airmark generates a fresh secret and shows it as a QR code (with a download button) plus text you can enter manually. Scan it with a free app like Google Authenticator or Microsoft Authenticator, then enter the 6-digit code it shows to confirm. You'll then see 8 one-time backup codes — save these somewhere safe immediately; each works once if you ever lose your authenticator app.

2FA doesn't expire. If you lose both your phone and your backup codes, use "Lost access to your authenticator app?" on the 2FA login screen to get an email-based recovery link that disables 2FA so you can log back in and set it up fresh.`,
  },
  {
    id: "delete-account",
    category: "Getting Started",
    title: "How to delete your account",
    keywords: ["delete", "account", "close", "remove"],
    content: `Go to Profile → Danger Zone → "Delete my account." You must type the exact phrase "DELETE MY ACCOUNT" and enter your password to confirm — this prevents accidental deletion. If you're the Team Owner of any team that still has other members, you must remove them (or transfer/delete the team) first; Airmark won't let you delete your account while a team still depends on you as its owner.`,
  },

  // ===== TEAMS =====
  {
    id: "what-is-a-team",
    category: "Teams",
    title: "What is a team?",
    keywords: ["team", "what"],
    content: `A team represents your organization's production crew — for example, a church's media team. Everything in Airmark (events, roles, schedules) belongs to a specific team. You can be a member of multiple teams at once, each with its own role.`,
  },
  {
    id: "create-team",
    category: "Teams",
    title: "How to create a team",
    keywords: ["create", "team", "new"],
    content: `From your Dashboard, tap "+ New team," enter a name, and submit. You're automatically set as Team Owner — the highest authority on that team, with full control over everything in it.`,
  },
  {
    id: "rename-team",
    category: "Teams",
    title: "How to rename a team",
    keywords: ["rename", "edit", "team", "name"],
    content: `Go to your team's Members page and tap "Rename" next to the team name. Only someone with the "team:manage" permission (Team Owner by default) can do this.`,
  },
  {
    id: "delete-team",
    category: "Teams",
    title: "How to delete a team",
    keywords: ["delete", "team", "remove"],
    content: `Only the Team Owner can delete a team, from the Members page's Danger Zone. You must first remove every other member from the team — Airmark won't let you delete a team that still has other people depending on it. Once everyone else is removed, you must type "DELETE" followed by the exact team name to confirm. This permanently deletes the team, its events, cameras, roles, and all related data.`,
  },
  {
    id: "transfer-ownership",
    category: "Teams",
    title: "How to transfer team ownership",
    keywords: ["transfer", "ownership", "owner"],
    content: `Only the current Team Owner can do this, from the Members page. Select another team member to become the new Team Owner — you automatically become a Director on the team instead. This is useful if you're stepping back from leading the team but want to stay involved.`,
  },
  {
    id: "invite-members",
    category: "Teams",
    title: "How to invite someone to your team",
    keywords: ["invite", "member", "add", "join"],
    content: `From the Members page, enter the person's email and choose a role, then send the invite. If they don't have an Airmark account yet, they receive an email with a signup link — once they register and verify their email, they automatically join your team with the role you picked. If they already have a verified Airmark account, they instead get an in-app notification and must accept or decline it themselves from their Invites page — no one is ever added to a team without their own confirmation.`,
  },
  {
    id: "accept-decline-invite",
    category: "Teams",
    title: "How to accept or decline a team invite",
    keywords: ["accept", "decline", "invite", "invites"],
    content: `Go to "Invites" in the sidebar or mobile menu. Any pending invites show there with the team name, role offered, and who invited you. Tap Accept to join, or Decline to dismiss it — either way you'll see a confirmation message.`,
  },
  {
    id: "remove-members",
    category: "Teams",
    title: "How to remove a team member",
    keywords: ["remove", "member", "kick"],
    content: `From the Members page, tap "Remove" next to a member's name — you'll be asked to confirm first. Requires the "member:remove" permission. The Team Owner can never be removed this way; ownership must be transferred first.`,
  },
  {
    id: "revoke-invite",
    category: "Teams",
    title: "How to revoke a pending invite",
    keywords: ["revoke", "cancel", "invite"],
    content: `Pending invites appear on the Members page. Tap "Revoke" next to one to cancel it before it's accepted — you'll be asked to confirm.`,
  },

  // ===== ROLES =====
  {
    id: "understanding-roles",
    category: "Roles & Permissions",
    title: "Understanding roles — overview",
    keywords: ["role", "roles", "permission", "difference"],
    content: `Airmark uses a dynamic role system — every team has its own set of roles, and a Team Owner can create custom roles with any combination of permissions. Every action in the app (going live, editing events, managing checklists) is gated behind a specific permission, checked against whatever role a person holds on that specific team. The five default roles, from highest to lowest authority, are: Team Owner, Director, Operator, Editor, and Viewer.`,
  },
  {
    id: "role-team-owner",
    category: "Roles & Permissions",
    title: "What is a Team Owner? Their role explained",
    keywords: ["team owner", "owner", "role"],
    content: `The Team Owner has complete, unrestricted control over their team — every permission, with no exceptions. Only the Team Owner can delete the team, transfer ownership, or edit the Team Owner role itself (which can't be modified, to guarantee the team always has someone with full control). Typically the person who created the team.`,
  },
  {
    id: "role-director",
    category: "Roles & Permissions",
    title: "What is a Director? Their role explained",
    keywords: ["director", "role", "who"],
    content: `The Director runs live events — they're the person who controls the tally system (deciding which camera is live), manages the run-of-show, sends discreet cues to operators, controls OBS if connected, and generally acts as the person in charge during an actual live broadcast. Directors can also create and manage events, invite members, and manage checklists — essentially everything short of deleting the team or transferring ownership.`,
  },
  {
    id: "role-operator",
    category: "Roles & Permissions",
    title: "What is an Operator? Their role explained",
    keywords: ["operator", "videographer", "camera", "role"],
    content: `The Operator (sometimes called videographer or camera crew) is assigned to a specific camera for an event. Their job during a live event is to watch their phone's LIVE/STANDBY status and keep their camera framed steadily — repositioning only when their screen shows STANDBY. Operators can send discreet signals (battery low, need backup), report equipment issues, mark highlights, and complete pre-event checklists. See "How the operator connects to the director" for the full technical explanation of how this works.`,
  },
  {
    id: "role-editor",
    category: "Roles & Permissions",
    title: "What is an Editor? Their role explained",
    keywords: ["editor", "role", "post-event"],
    content: `The Editor works after events end, not during them — they have no live control access. Their job is reviewing timestamped highlight markers from a completed event to help produce social media clips or a recording, without needing to rewatch the entire event. Editors land on a dedicated Post-Event Review workspace after logging in, showing all ended events ready for review.`,
  },
  {
    id: "role-viewer",
    category: "Roles & Permissions",
    title: "What is a Viewer? Their role explained",
    keywords: ["viewer", "guest", "role"],
    content: `The Viewer role is read-only — for someone like a pastor or event organizer who wants to glance at run-of-show status or tally state without operating anything themselves.`,
  },
  {
    id: "custom-roles",
    category: "Roles & Permissions",
    title: "How to create and manage custom roles",
    keywords: ["custom", "role", "manage", "permission", "create role"],
    content: `From a team's Roles page (accessible to whoever has "role:manage" permission), you can create entirely new roles with any combination of permissions checked individually, or edit/delete existing custom roles. Built-in roles (Team Owner, Director, Operator, Editor, Viewer) can't be deleted, and the Team Owner role's permissions can't be modified, to guarantee every team always has one role with full control.`,
  },
  {
    id: "operator-director-connection",
    category: "Roles & Permissions",
    title: "How does the operator (videographer) connect to the director?",
    keywords: ["operator", "director", "connect", "videographer", "how", "work together"],
    content: `Airmark doesn't show live video on any phone — it's purely a coordination layer, never a video pipeline. Here's the real connection: the director assigns each operator to a specific camera slot from the Event page. When that operator opens Go Live for the same event, the app automatically shows their dedicated LIVE/STANDBY screen based on that assignment — no manual connecting step.

Separately, actual video flows one of two ways depending on the team's setup. Simple teams: someone (often the director, or a physical switcher box) manually chooses which camera's video actually reaches the audience, and the director taps the matching camera in Airmark the instant they make that switch — this is what makes every operator's phone update instantly. Teams with OBS: each camera feeds into a venue laptop running OBS, the director controls OBS remotely through Airmark's bridge, and tapping a camera in Airmark really does switch OBS's live broadcast output. Either way, the operator's entire job is: hold their camera steady, watch their phone, and never move while it says LIVE.`,
  },

  // ===== EVENTS =====
  {
    id: "what-is-an-event",
    category: "Events",
    title: "What is an event?",
    keywords: ["event", "what"],
    content: `An event represents a single live production — a Sunday service, a conference session, a wedding. Creating one automatically sets up camera slots based on how many cameras you specify, ready to be assigned to operators.`,
  },
  {
    id: "create-event",
    category: "Events",
    title: "How to create an event",
    keywords: ["create", "event", "new", "schedule"],
    content: `From a team's Events page, tap "+ New event." Enter a title, start time, and number of cameras (1–20, must be a whole number). Camera slots are created automatically — you can add or remove them later even after the event exists.`,
  },
  {
    id: "edit-event",
    category: "Events",
    title: "How to edit an event",
    keywords: ["edit", "event", "change"],
    content: `From the Event Detail page, tap "Edit" to change the title or start time. You can't edit an event while it's currently live.`,
  },
  {
    id: "delete-event",
    category: "Events",
    title: "How to delete an event",
    keywords: ["delete", "event", "remove"],
    content: `From the Event Detail page, tap "Delete event" and confirm. You can't delete an event that's currently live — end it first.`,
  },
  {
    id: "event-statuses",
    category: "Events",
    title: "Event statuses explained: scheduled, live, ended",
    keywords: ["status", "scheduled", "live", "ended", "state"],
    content: `Every event is in one of three states. "Scheduled" — created but not yet started; the Go Live page shows a red "Start Event" button. "Live" — actively broadcasting; the Go Live page shows a neutral "End Event" button instead. "Ended" — finished; no more Start/End buttons appear, and the event moves into post-event review (highlights, etc). If an event was ended by mistake, a Director/Team Owner can tap "Reopen as live" on the Event Detail page to bring it back to live status.`,
  },
  {
    id: "camera-assignments",
    category: "Events",
    title: "Camera assignments explained",
    keywords: ["camera", "assignment", "assign", "operator"],
    content: `Each event has a set of camera slots, created automatically when the event is made. From the Event Detail page, anyone with event-management permission can assign a specific team member as the operator for each camera, using the dropdown next to each camera row.`,
  },
  {
    id: "add-remove-cameras",
    category: "Events",
    title: "How to add or remove cameras from an event",
    keywords: ["add", "remove", "camera", "delete camera"],
    content: `From the Event Detail page, tap "+ Add camera" to create a new camera slot at any time, even after the event exists. To remove one, tap "Remove" next to it and confirm — but a camera currently live can't be removed; switch the broadcast to a different camera first. This means you can safely add or remove cameras mid-event without disrupting whatever is currently on-air.`,
  },

  // ===== LIVE MODE =====
  {
    id: "what-is-tally",
    category: "Live Mode",
    title: "What is the tally system?",
    keywords: ["tally", "what", "live", "standby"],
    content: `Tally is the core feature Airmark exists for: showing each operator, in real time, whether their specific camera is currently the one being shown to the audience. When the director marks a camera as live, that operator's phone instantly turns red and shows "LIVE" — every other operator's phone shows "STANDBY." This mirrors physical tally-light hardware used in professional studios, at zero cost.`,
  },
  {
    id: "go-live-director",
    category: "Live Mode",
    title: "How to go live as a Director",
    keywords: ["go live", "director", "start"],
    content: `Open an event and tap "Go Live." You'll see every camera as a tile — tap any camera to instantly make it the live one; every operator's phone updates immediately. Tap "Start Event" (red button) before your broadcast begins, and "End Event" once it's over. Header and bottom navigation stay visible so you can quickly step away to fix something (like inviting an operator) without losing your place.`,
  },
  {
    id: "go-live-operator",
    category: "Live Mode",
    title: "How to go live as an Operator",
    keywords: ["go live", "operator", "camera"],
    content: `Once a Director has assigned you to a camera, open the event and tap "Go Live" — you'll see your dedicated screen showing LIVE (red) or STANDBY (dark), matching your assigned camera. Wait until it clearly shows LIVE before repositioning your physical camera. Airmark never shows actual camera video here — see "How does the operator connect to the director" for why, and what your actual job is.`,
  },
  {
    id: "run-of-show",
    category: "Live Mode",
    title: "What is Run-of-Show and how to use it",
    keywords: ["run of show", "ros", "segment", "program"],
    content: `Run-of-Show lets a Director build a list of segments for an event (like "Welcome," "Announcements," "Sermon") ahead of time, then tap through them live — every team member's screen instantly shows the current and next segment. This replaces shouting across a room to coordinate what's happening next. Set it up from the Event Detail page's "Run of show" button before going live.`,
  },
  {
    id: "countdown",
    category: "Live Mode",
    title: "What is the countdown feature, and how to use it",
    keywords: ["countdown", "timer", "start", "seconds"],
    content: `The countdown shows a synced timer on every connected phone simultaneously — useful for coordinating exactly when a broadcast starts (e.g. "we go live in 2 minutes") without anyone needing to watch a separate clock or shout out time remaining. From the Director's Go Live page, tap "Start countdown," set hours/minutes/seconds (minimum 5 seconds), and it counts down identically on every device at once, regardless of each phone's network speed. If your team uses OBS, you can also push this same countdown directly onto the broadcast output itself, so the audience sees it too — via "Push countdown to broadcast."`,
  },
  {
    id: "discreet-signals",
    category: "Live Mode",
    title: "What are discreet signals, and how to send one",
    keywords: ["signal", "discreet", "battery", "backup", "audio issue"],
    content: `Discreet signals let crew silently alert the Director about a problem — "Battery low," "Need backup," or "Audio issue" — without disrupting the live event with a phone call or shout. As an Operator, tap the signal icon on your Go Live screen and pick the issue; the Director sees it appear instantly in their signal inbox, showing who sent it and when, and can tap "Ack" once handled.`,
  },
  {
    id: "director-talkback",
    category: "Live Mode",
    title: "What is Director Talkback, and how to use it",
    keywords: ["talkback", "message", "director", "cue"],
    content: `Talkback lets a Director send a short live text message to a specific operator — like "Camera 2, tighten your shot" — without a professional intercom headset. From the Director's Go Live page, tap "Send message," choose the operator, and type your cue. It appears briefly on that operator's screen as a banner.`,
  },
  {
    id: "highlight-marker",
    category: "Live Mode",
    title: "How to mark a highlight moment",
    keywords: ["mark", "highlight", "clip", "moment"],
    content: `During a live event, anyone with permission can tap "Mark" on the Go Live screen to timestamp a moment worth clipping later — like a great worship moment or a key announcement. You can optionally add a short label. After the event ends, Editors can review every marked timestamp on the Highlights page to produce social clips without rewatching the whole recording.`,
  },
  {
    id: "equipment-status",
    category: "Live Mode",
    title: "How to report and resolve equipment issues",
    keywords: ["equipment", "battery", "storage", "issue", "report"],
    content: `Operators can report equipment problems (battery low, storage almost full, equipment fault) from their Go Live screen. Whoever has equipment-management permission sees these on the Equipment Status page and can mark them "Resolved" once handled — keeping a clear record of what happened during the event.`,
  },
  {
    id: "checklists",
    category: "Live Mode",
    title: "Pre-event checklists — setup and use",
    keywords: ["checklist", "pre-event", "readiness"],
    content: `Each role can have its own reusable checklist (like "Confirm mic is unmuted," "Check tripod is stable") set up once from the Roles page and reused for every event. Before going live, team members tick off their own checklist items from the event's "My checklist" page. Directors can view everyone's readiness at a glance from "Crew readiness," showing exactly who's checked off everything and who hasn't.`,
  },

  // ===== SCHEDULING =====
  {
    id: "media-scheduling",
    category: "Scheduling",
    title: "How to use the team schedule",
    keywords: ["schedule", "rotation", "duty", "assign"],
    content: `From a team's Schedule page, someone with scheduling permission can assign team members to specific roles on specific dates — like "Sarah is on Camera duty this Sunday." Everyone can view the upcoming schedule; only those with permission can add or remove assignments.`,
  },

  // ===== OBS / PRODUCTION ENGINE =====
  {
    id: "what-is-obs-bridge",
    category: "OBS Production Engine",
    title: "What is the OBS bridge, and do I need it?",
    keywords: ["obs", "bridge", "what", "need"],
    content: `The OBS bridge is a small program that connects your team's OBS Studio software (running on a venue laptop) to Airmark's remote controls on your phone. You only need this if your team uses OBS for real multi-camera video switching — teams using a simple physical switch or no switching setup don't need it at all; Tier 2's tally and coordination features work with zero extra hardware. Setup requires a laptop or PC — OBS doesn't run on phones.`,
  },
  {
    id: "connect-obs",
    category: "OBS Production Engine",
    title: "How to connect OBS to Airmark",
    keywords: ["connect", "obs", "pair", "pairing"],
    content: `From the Director's Go Live page, tap "Connect OBS" to generate a pairing code (valid 10 minutes). On the venue laptop, run the Airmark bridge script and paste that code when prompted — it will confirm connection to both OBS and Airmark's backend. Once connected, "OBS Connected" shows in green on the Go Live page, and scene controls appear.`,
  },
  {
    id: "obs-scene-switching",
    category: "OBS Production Engine",
    title: "How to switch OBS scenes from Airmark",
    keywords: ["scene", "switch", "obs"],
    content: `Once OBS is connected, a row of scene buttons appears on the Director's Go Live page — tap any scene to instantly switch OBS's live broadcast output to it, exactly as if you'd clicked it in OBS itself on the laptop.`,
  },
  {
    id: "obs-transitions",
    category: "OBS Production Engine",
    title: "How to change transition style and duration",
    keywords: ["transition", "cut", "fade", "duration"],
    content: `With OBS connected, the "Transition" controls let you pick which transition style (cut, fade, etc — whatever's configured in your OBS) applies on every scene switch, and adjust its duration with the slider.`,
  },
  {
    id: "obs-scene-items",
    category: "OBS Production Engine",
    title: "How to toggle sources (like a PIP overlay) on/off within a scene",
    keywords: ["source", "toggle", "pip", "overlay", "scene item"],
    content: `The "Sources in current scene" panel lists every element inside your currently-live OBS scene (like a picture-in-picture camera or a lower-third graphic) with a toggle switch for each — letting you show or hide individual pieces of a scene without switching the whole scene.`,
  },
  {
    id: "obs-text-overlay",
    category: "OBS Production Engine",
    title: "How to update text overlays (lower-thirds, quotes) live",
    keywords: ["text", "overlay", "lower third", "caption", "quote"],
    content: `Tap "Edit text overlay" to pick any text source already built in your OBS setup (like a name caption or scripture verse overlay) and update its content live, without touching the laptop.`,
  },
  {
    id: "obs-watermark",
    category: "OBS Production Engine",
    title: "How to set up and toggle a watermark",
    keywords: ["watermark", "logo overlay"],
    content: `Tap "Set watermark" once to designate which OBS source is your watermark/logo. After that, a quick toggle button lets you turn it on or off during the broadcast at any time.`,
  },
  {
    id: "obs-audio",
    category: "OBS Production Engine",
    title: "How to mute/unmute audio sources",
    keywords: ["audio", "mute", "unmute", "sound"],
    content: `Tap "Audio" on the Go Live page to see every audio input already set up in OBS (any microphone or sound source your team has configured) with Mute/Unmute buttons for each. This works with any existing setup — no extra audio hardware required for basic mute control.`,
  },
  {
    id: "obs-replay",
    category: "OBS Production Engine",
    title: "How to use Instant Replay",
    keywords: ["replay", "instant replay"],
    content: `OBS's replay buffer starts automatically once connected. Tap "Save Instant Replay" at any moment to save the last several seconds as a clip — useful for replaying a great moment.`,
  },
  {
    id: "obs-failsafe",
    category: "OBS Production Engine",
    title: "Technical Difficulties fallback — setup and use",
    keywords: ["fallback", "technical difficulties", "failsafe"],
    content: `Set up a "Technical Difficulties" scene in OBS yourself first (a simple graphic works). Then on Airmark, tap "Set up fallback scene" and select it. During a live event, a single red "⚠ Technical Difficulties" button appears — one tap instantly switches to that scene if something goes wrong.`,
  },
  {
    id: "obs-stream-record",
    category: "OBS Production Engine",
    title: "How to start/stop streaming and recording",
    keywords: ["stream", "record", "start", "stop"],
    content: `The "Start Stream" / "Start Recording" buttons on the Go Live page tell OBS to begin streaming to wherever it's configured (YouTube, Facebook Live, etc) or recording locally to the laptop. If you've set an intro/outro scene, it plays automatically for the configured duration when you start/stop streaming.`,
  },
  {
    id: "obs-audience-overlays",
    category: "OBS Production Engine",
    title: "How to set up audience overlay favorites (QR code, polls, etc)",
    keywords: ["audience", "overlay", "qr", "poll", "favorite"],
    content: `Build your QR donation code, poll, or social-follow overlay as ordinary sources in OBS first. Then in Airmark, tap "Edit" next to the Overlays row and pick which sources to favorite — they'll appear as one-tap buttons during live events.`,
  },
  {
    id: "obs-intro-outro",
    category: "OBS Production Engine",
    title: "How to set up automatic intro/outro",
    keywords: ["intro", "outro", "auto insert"],
    content: `Tap "Intro/Outro" on the Go Live page to pick which OBS scenes play automatically when you start and stop streaming, and for how many seconds each shows before switching to your main broadcast.`,
  },

  // ===== NOTIFICATIONS =====
  {
    id: "notifications-overview",
    category: "Notifications",
    title: "How notifications work",
    keywords: ["notification", "alert", "bell"],
    content: `Airmark sends you an in-app notification (and a push notification to your device, even if the app isn't open) whenever something needs your attention — a director's cue, a crew signal, an equipment report, or a team invite. Tap the bell icon to see recent ones, or "Alerts" in the bottom nav for the full list with filtering.`,
  },
  {
    id: "notification-read-unread",
    category: "Notifications",
    title: "How to mark notifications read/unread and filter them",
    keywords: ["read", "unread", "filter", "mark"],
    content: `On the Notifications page, use the All/Unread/Read filter buttons at the top to narrow the list. Tap "Mark read" or "Mark unread" on any notification to toggle its status, or tap the notification itself to see its full details (like who sent it and exactly when) on its own page.`,
  },

  // ===== ADMIN =====
  {
    id: "system-console",
    category: "Admin",
    title: "What is the System Console?",
    keywords: ["admin", "system console", "founder"],
    content: `The System Console is visible only to the Founder/Super Admin account — it shows every team and user across all of Airmark, with stats on total teams, users, and email verification status. It's for platform-wide oversight, not day-to-day team management.`,
  },

  // ===== HELP =====
  {
    id: "using-this-help-guide",
    category: "Help & Guide",
    title: "How to use this Help & Guide",
    keywords: ["help", "guide", "search", "how to use"],
    content: `Use the search box at the top to find articles by typing anything — a word, a question, a feature name. Matching articles filter instantly as you type. Tap any article to read its full content; tap back to return to exactly where you left off in the list, not the top.`,
  },
];

export const HELP_CATEGORIES = Array.from(new Set(HELP_ARTICLES.map((a) => a.category)));
