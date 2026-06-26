import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { articles } from "@/data/blog-articles";
import { sanitizeTrustedHtml } from "@/lib/security/sanitize";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
        notFound();
    }

    return (
        <MainLayout>
            <div className="pt-24 min-h-screen">
                {/* Hero Image */}
                <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-slate-deeper via-brand-slate-deeper/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                        <div className="container-section space-y-4">
                            <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                                <Tag className="w-3 h-3" />
                                {article.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white max-w-3xl leading-tight">
                                {article.title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-brand-blue" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-brand-blue" />
                                    {article.author}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Article Content */}
                <section className="py-16 md:py-24">
                    <div className="container-section max-w-3xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-brand-blue hover:text-brand-blue-light transition-colors mb-10 group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Volver al Blog
                        </Link>

                        <div
                            className="prose prose-invert prose-lg max-w-none
                                prose-headings:font-display prose-headings:text-white
                                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-gray-200
                                prose-h4:text-lg prose-h4:text-brand-blue prose-h4:mt-6
                                prose-p:text-gray-400 prose-p:leading-relaxed
                                prose-li:text-gray-400
                                prose-strong:text-white
                                prose-blockquote:border-brand-blue prose-blockquote:bg-brand-blue/5 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic
                                prose-blockquote:text-gray-300
                                prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                                prose-table:border-white/10
                                prose-th:text-white prose-th:border-white/10 prose-th:px-4 prose-th:py-2
                                prose-td:text-gray-400 prose-td:border-white/10 prose-td:px-4 prose-td:py-2
                                prose-hr:border-white/10
                            "
                            dangerouslySetInnerHTML={{
                                __html: sanitizeTrustedHtml(convertMarkdownToHtml(article.content)),
                            }}
                        />

                        {/* CTA */}
                        <div className="mt-16 p-8 glass-card text-center space-y-4 border-white/5">
                            <h3 className="text-xl font-display font-bold text-white">
                                ¿Listo para tu próximo proyecto?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Explora nuestro catálogo de planos arquitectónicos diseñados para el mercado dominicano.
                            </p>
                            <Link href="/catalogo" className="btn-primary inline-flex">
                                Ver Catálogo
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

/**
 * Lightweight markdown-to-HTML converter for article content.
 * Handles headings, bold, italic, lists, blockquotes, links, tables, and hr.
 */
function convertMarkdownToHtml(md: string): string {
    let html = md.trim();

    // Tables
    html = html.replace(
        /(?:^|\n)\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gm,
        (_match, headerRow: string, bodyRows: string) => {
            const headers = headerRow.split("|").map((h: string) => h.trim()).filter(Boolean);
            const rows = bodyRows.trim().split("\n").map((row: string) =>
                row.split("|").map((cell: string) => cell.trim()).filter(Boolean)
            );
            return `<table><thead><tr>${headers.map((h: string) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r: string[]) => `<tr>${r.map((c: string) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        }
    );

    // Blockquotes
    html = html.replace(/^>\s*(.+)$/gm, "<blockquote><p>$1</p></blockquote>");

    // Headings
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");

    // Horizontal rules
    html = html.replace(/^---$/gm, "<hr />");

    // Bold + italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Ordered lists
    html = html.replace(
        /((?:^\d+\..+$\n?)+)/gm,
        (block) => {
            const items = block.trim().split("\n").map((line) =>
                line.replace(/^\d+\.\s*/, "").trim()
            );
            return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
        }
    );

    // Unordered lists (- items)
    html = html.replace(
        /((?:^- .+$\n?)+)/gm,
        (block) => {
            const items = block.trim().split("\n").map((line) =>
                line.replace(/^- /, "").trim()
            );
            return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        }
    );

    // Unordered lists (❌/🏆/📈 emoji bullets)
    html = html.replace(
        /((?:^(?:❌|✅|🏆|📈) .+$\n?)+)/gm,
        (block) => {
            const items = block.trim().split("\n");
            return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        }
    );

    // Paragraphs — wrap loose lines
    html = html
        .split("\n\n")
        .map((block) => {
            const trimmed = block.trim();
            if (!trimmed) return "";
            if (
                trimmed.startsWith("<h") ||
                trimmed.startsWith("<ul") ||
                trimmed.startsWith("<ol") ||
                trimmed.startsWith("<blockquote") ||
                trimmed.startsWith("<table") ||
                trimmed.startsWith("<hr")
            ) {
                return trimmed;
            }
            return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
        })
        .join("\n");

    return html;
}
