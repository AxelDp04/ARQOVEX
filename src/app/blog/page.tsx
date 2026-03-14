import MainLayout from "@/components/layout/MainLayout";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { articles } from "@/data/blog-articles";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

export default function BlogPage() {
    return (
        <MainLayout>
            <div className="pt-24 min-h-screen">
                {/* Header */}
                <section className="py-20 bg-brand-slate-deeper relative overflow-hidden">
                    <div className="container-section text-center space-y-4">
                        <div className="badge-blue mx-auto w-fit italic">Inspiración &amp; Conocimiento</div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Blog Arquitectónico</h1>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Explora las últimas tendencias en arquitectura, tecnología de construcción y el mercado inmobiliario en República Dominicana.
                        </p>
                    </div>
                </section>

                {/* Articles Grid */}
                <section className="py-20 container-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <article key={article.id} className="group glass-card-hover overflow-hidden flex flex-col h-full border-white/5">
                                <div className="relative h-56 overflow-hidden">
                                    <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-1 rounded">
                                            {article.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {article.date}</span>
                                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {article.author}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-brand-blue transition-colors leading-tight">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm leading-relaxed flex-1">
                                        {article.excerpt}
                                    </p>
                                    <div className="pt-4 mt-auto">
                                        <Link href={`/blog/${article.slug}`} className="text-brand-blue text-sm font-bold flex items-center gap-2 group/link">
                                            Leer más <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Empty State / Newsletter */}
                    <div className="mt-24 p-8 md:p-16 glass-card text-center space-y-6 bg-brand-gradient/5">
                        <BookOpen className="w-12 h-12 text-brand-blue/40 mx-auto" />
                        <h3 className="text-2xl font-display font-bold text-white">¿Quieres contenido exclusivo?</h3>
                        <p className="text-gray-500 max-w-md mx-auto italic">
                            Pronto lanzaremos nuestra newsletter con planos exclusivos y consejos de construcción directamente en tu bandeja de entrada.
                        </p>
                        <NewsletterForm />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
