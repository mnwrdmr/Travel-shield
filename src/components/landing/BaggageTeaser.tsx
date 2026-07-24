"use client";

import Link from "next/link";
import { Camera, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function BaggageTeaser() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & Features */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles size={14} className="animate-pulse" />
              <span>Sprint 3 Canlı Özellik: 3D Baggage AI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Kapı Cezasından Önce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Bavulunuzu 3D AI ile Tarayın
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ryanair, Wizz Air ve EasyJet kapı görevlilerinin en küçük aşımda kestiği €70 cezalara son. 
              Kameranızla çantanızın fotoğrafını çekin; yapay zekamız milimetrik kabin uyum kontrolü yapsın.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Anında 3D Boyut Tespit Rozetleri (En × Boy × Derinlik)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Havayolu Resmi Kabin Limiti Kıyaslaması</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Kapı Cezası Risk Hesabı & Online İndirimli Yükseltme Tavsiyesi</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Camera size={18} />
                <span>Bavulunu Şimdi Tara</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual AR Scanner Mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-xl shadow-2xl overflow-hidden">
              
              {/* Camera Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">AR_BAGGAGE_SCANNER_v3.2</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CONFIDENCE: 94%
                </span>
              </div>

              {/* AR Viewport Frame */}
              <div className="relative aspect-[4/3] rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                {/* Simulated Luggage Silhouette & Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                {/* Simulated Luggage Bag Box */}
                <div className="relative w-48 h-56 border-2 border-dashed border-red-500 rounded-lg bg-red-500/10 flex flex-col items-center justify-center p-3 transition-all">
                  
                  {/* Corner AR Markers */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-400" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-red-400" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-red-400" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-400" />

                  {/* Dimension Badges */}
                  <div className="absolute -top-7 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    En: 42 cm (Limit: 40 cm) ⚠️
                  </div>
                  <div className="absolute -right-16 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    Boy: 22 cm (+2)
                  </div>
                  <div className="absolute -bottom-7 bg-emerald-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    Derinlik: 25 cm ✓
                  </div>

                  <div className="text-center space-y-1">
                    <ShieldAlert size={28} className="text-red-400 mx-auto animate-bounce" />
                    <p className="text-xs font-bold text-red-300">RYANAIR OVERSIZED</p>
                    <p className="text-[10px] text-slate-300">Kapıda Olası Ceza: €70</p>
                  </div>
                </div>
              </div>

              {/* Bottom Result Preview Pill */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Tahmini Çözüm: </span>
                  <span className="text-emerald-400 font-semibold">€18'e Online Yükselt</span>
                </div>
                <span className="text-slate-400">Net Tasarruf: <strong className="text-white">€52</strong></span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
