'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al suscribirse');
            }

            setStatus('success');
            setMessage(data.message);
            setEmail('');
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            setStatus('error');
            setMessage('Algo salió mal. Por favor, intenta de nuevo.');
        }
    };

    if (status === 'success') {
        return (
            <div className="max-w-md mx-auto p-6 glass-card border-brand-blue/20 bg-brand-blue/5 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-brand-blue" />
                    <h4 className="text-xl font-bold text-white">{message}</h4>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="text-brand-blue text-sm hover:underline mt-2"
                    >
                        Volver a intentar con otro correo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="input-field flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-blue/50 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary min-w-[140px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        'Suscribirse'
                    )}
                </button>
            </div>
            
            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}
        </form>
    );
}
