import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/data/helpArticles";

const SCROLL_KEY = "airmark-help-scroll";

export function HelpPage() {
  const [query, setQuery] = useState("");
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
    }
    restoredRef.current = true;
  }, []);

  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return HELP_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-[57px] md:top-0 z-20 bg-surface-light dark:bg-navy px-4 pt-6 pb-4 border-b border-standby-slate/10">
        <h1 className="font-display text-2xl font-semibold mb-1">Help & Guide</h1>
        <p className="text-sm text-standby-slate mb-4">
          Search for anything — how to create a team, what a Director does, how OBS pairing works.
        </p>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="w-full text-sm rounded-lg border border-standby-slate/30 px-4 py-3 bg-white dark:bg-navy/60"
        />
      </div>

      <div className="px-4 py-6">
        {filtered ? (
          <>
            <p className="text-xs text-standby-slate mb-3">{filtered.length} result(s)</p>
            <div className="flex flex-col gap-2">
              {filtered.map((a) => (
                <Link
                  key={a.id}
                  to={`/help/${a.id}`}
                  className="block rounded-xl border border-standby-slate/15 px-4 py-3 hover:border-accent-teal/50 transition-colors"
                >
                  <p className="text-[10px] uppercase tracking-wide text-standby-slate">{a.category}</p>
                  <p className="text-sm font-medium mt-0.5">{a.title}</p>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-standby-slate text-center py-8">
                  No articles match "{query}" — try a different word.
                </p>
              )}
            </div>
          </>
        ) : (
          HELP_CATEGORIES.map((category) => (
            <div key={category} className="mb-6">
              <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-2">
                {category}
              </h2>
              <div className="flex flex-col gap-2">
                {HELP_ARTICLES.filter((a) => a.category === category).map((a) => (
                  <Link
                    key={a.id}
                    to={`/help/${a.id}`}
                    className="block rounded-xl border border-standby-slate/15 px-4 py-3 hover:border-accent-teal/50 transition-colors"
                  >
                    <p className="text-sm font-medium">{a.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
