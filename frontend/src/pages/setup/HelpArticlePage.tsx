import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router";
import { HELP_ARTICLES } from "@/data/helpArticles";
import { useAuthStore } from "@/store/authStore";
import { BackToTopButton } from "@/components/ui/BackToTopButton";

const LAST_OPENED_KEY = "airmark-help-last-opened";

export function HelpArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { user } = useAuthStore();
  const article = HELP_ARTICLES.find((a) => a.id === articleId);

  useEffect(() => {
    if (articleId) localStorage.setItem(LAST_OPENED_KEY, articleId);
  }, [articleId]);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-standby-slate">Article not found.</p>
        <Link to="/help" className="text-xs text-accent-teal font-medium">Back to Help</Link>
      </div>
    );
  }

  if (article.founderOnly && !user?.isSuperAdmin) {
    return <Navigate to="/help" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/help" className="text-xs text-accent-teal font-medium mb-4 inline-block">← Back to Help</Link>
      <p className="text-[10px] uppercase tracking-wide text-standby-slate mb-1">{article.category}</p>
      <h1 className="font-display text-2xl font-semibold mb-4">{article.title}</h1>

      {article.images && article.images.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {article.images.map((img) => (
            <div key={img.src} className="text-center">
              <img src={img.src} alt={img.alt} className="w-24 h-24 rounded-xl object-contain bg-navy p-2" />
              {img.caption && <p className="text-[10px] text-standby-slate mt-1">{img.caption}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-navy dark:text-surface-light leading-relaxed whitespace-pre-line">{article.content}</div>
      <BackToTopButton />
    </div>
  );
}
