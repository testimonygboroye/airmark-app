import { useParams, Link } from "react-router";
import { HELP_ARTICLES } from "@/data/helpArticles";

export function HelpArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const article = HELP_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-standby-slate">Article not found.</p>
        <Link to="/help" className="text-xs text-accent-teal font-medium">
          Back to Help
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/help" className="text-xs text-accent-teal font-medium mb-4 inline-block">
        ← Back to Help
      </Link>
      <p className="text-[10px] uppercase tracking-wide text-standby-slate mb-1">{article.category}</p>
      <h1 className="font-display text-2xl font-semibold mb-4">{article.title}</h1>
      <div className="text-sm text-navy dark:text-surface-light leading-relaxed whitespace-pre-line">
        {article.content}
      </div>
    </div>
  );
}
