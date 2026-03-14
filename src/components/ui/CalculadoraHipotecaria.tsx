"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, Percent, Calendar, DollarSign, Info } from "lucide-react";

interface CalculadoraHipotecariaProps {
    precioProperty: number;
}

export default function CalculadoraHipotecaria({ precioProperty }: CalculadoraHipotecariaProps) {
    const [inicialPercent, setInicialPercent] = useState(30);
    const [tasaAnual, setTasaAnual] = useState(9.5);
    const [plazoAnos, setPlazoAnos] = useState(20);
    const [cuotaMensual, setCuotaMensual] = useState(0);

    const calcularCuota = useCallback(() => {
        const montoInicial = precioProperty * (inicialPercent / 100);
        const principal = precioProperty - montoInicial;
        const tasaMensual = (tasaAnual / 100) / 12;
        const numeroPagos = plazoAnos * 12;

        if (principal <= 0) return 0;

        // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
        const cuota = principal * (tasaMensual * Math.pow(1 + tasaMensual, numeroPagos)) / (Math.pow(1 + tasaMensual, numeroPagos) - 1);

        return isNaN(cuota) ? 0 : cuota;
    }, [precioProperty, inicialPercent, tasaAnual, plazoAnos]);

    useEffect(() => {
        setCuotaMensual(calcularCuota());
    }, [calcularCuota]);

    const formatCurrency = (amount: number) => {
        return "US$ " + new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="glass-card p-6 border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Calculadora Hipotecaria</h3>
                    <p className="text-xs text-gray-500">Estimado financiero para tu compra</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Inicial */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 text-gray-400">
                            <Percent className="w-4 h-4" />
                            Inicial ({inicialPercent}%)
                        </label>
                        <span className="text-white font-medium">{formatCurrency(precioProperty * (inicialPercent / 100))}</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={inicialPercent}
                        onChange={(e) => setInicialPercent(Number(e.target.value))}
                        className="w-full accent-brand-blue h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Tasa y Plazo Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-gray-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            Tasa Anual (%)
                        </label>
                        <input
                            type="number"
                            value={tasaAnual}
                            onChange={(e) => setTasaAnual(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-blue/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Plazo (Años)
                        </label>
                        <select
                            value={plazoAnos}
                            onChange={(e) => setPlazoAnos(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-brand-blue/50"
                        >
                            {[5, 10, 15, 20, 25, 30].map(yr => (
                                <option key={yr} value={yr} className="bg-[#090b14]">{yr} Años</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cuota Mensual Estimada</span>
                    <Info className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-2xl font-black text-white">
                    {formatCurrency(cuotaMensual)}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                    *Este cálculo es informativo y puede variar según la entidad bancaria elegida.
                </p>
            </div>
        </div>
    );
}
