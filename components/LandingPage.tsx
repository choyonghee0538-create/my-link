"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Link as LinkIcon, 
  BarChart3, 
  Terminal, 
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock
} from "lucide-react"

// 커스텀 GitHub 아이콘
const GithubIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

interface LandingPageProps {
  onLogin: () => void
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="flex-1 w-full bg-gradient-to-br from-slate-955 via-zinc-950 to-cyan-950/20 text-slate-100 overflow-y-auto overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* 백그라운드 그리드 패턴 */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-slate-955/80 to-transparent pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 flex flex-col gap-24">
        
        {/* 1. Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            MY LINK 2.0 BETA
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-100 drop-shadow-xl leading-tight">
            단 하나의 링크로,<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 animate-pulse">당신의 모든 세계</span>를 연결하세요.
          </h1>
          
          <p className="mt-2 text-base md:text-lg text-slate-400 max-w-2xl font-mono leading-relaxed">
            복잡한 프로필 관리는 그만. 쉽고 빠르고 직관적인 마이링크 빌더로 나만의 브랜드 랜딩 페이지를 3초만에 완성하세요. 
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={onLogin}
              className="cursor-pointer w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold font-mono px-8 py-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] active:scale-95 transition-all text-sm group border-none"
            >
              구글 계정으로 3초만에 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <a href="#preview-section" className="cursor-pointer w-full sm:w-auto px-8 py-6 rounded-2xl flex items-center justify-center gap-2 font-bold font-mono text-slate-300 bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-sm group">
              데모 확인하기
            </a>
          </div>
        </section>

        {/* 2. Feature Section */}
        <section className="flex flex-col gap-10 mt-12 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-200">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-slate-200">
              강력하고 단순한 기능
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-mono">My Link가 제공하는 핵심 가치들을 만나보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="flex flex-col bg-slate-900/40 border border-cyan-500/10 hover:border-cyan-400/40 p-8 rounded-[2rem] backdrop-blur-md shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all group">
              <div className="w-14 h-14 bg-cyan-950/50 border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform mb-6 text-cyan-400">
                <LinkIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 tracking-tight">초간편 링크 관리</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                드래그 앤 드롭으로 링크 순서를 변경하고, 스위치 하나로 노출 상태를 실시간으로 제어할 수 있습니다. 
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col bg-slate-900/40 border border-indigo-500/10 hover:border-indigo-400/40 p-8 rounded-[2rem] backdrop-blur-md shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all group">
              <div className="w-14 h-14 bg-indigo-950/50 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform mb-6 text-indigo-400">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 tracking-tight">강력한 트래픽 분석</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                실시간 클릭 통계를 통해 내 방문자들이 어떤 링크에 가장 많은 관심을 가지는지 직관적으로 분석하세요.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col bg-slate-900/40 border border-emerald-500/10 hover:border-emerald-400/40 p-8 rounded-[2rem] backdrop-blur-md shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all group">
              <div className="w-14 h-14 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform mb-6 text-emerald-400">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 tracking-tight">나만의 고유 주소</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                mylink.dev/@username 형식의 깔끔하고 직관적인 나만의 퍼스널 URL을 소유하여 어디든 손쉽게 공유하세요.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Preview Section */}
        <section id="preview-section" className="flex flex-col lg:flex-row items-center gap-16 mt-12 bg-slate-950/40 border border-cyan-500/10 rounded-[3rem] p-8 lg:p-16 backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Left Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Mobile First Design
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              가장 아름다운<br />
              <span className="text-cyan-400">퍼스널 링크 스페이스</span>
            </h2>
            <p className="mt-6 text-slate-400 text-base md:text-lg font-mono leading-relaxed max-w-md">
              글래스모피즘과 사이버 네온 이펙트가 결합된 트렌디한 디자인이 방문자의 시선을 즉시 사로잡습니다. 인스타그램, 틱톡, 깃허브 등 모든 소셜 프로필에 단 하나의 링크만 추가하세요.
            </p>

            <ul className="mt-8 space-y-3 font-mono text-sm text-slate-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> 커스텀 테크 아바타 </li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> 즉각적인 반응형 레이아웃</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> 라이트/다크 테마 1초 스위치</li>
            </ul>

            <Button
              onClick={onLogin}
              className="mt-10 cursor-pointer bg-slate-100 hover:bg-white text-slate-950 font-bold font-mono px-8 py-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 transition-all text-sm border-none group"
            >
              지금 바로 내 페이지 만들기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Mockup */}
          <div className="flex-1 flex justify-center z-10 w-full relative">
            <div className="relative w-[280px] sm:w-[320px] h-[550px] sm:h-[620px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden ring-1 ring-cyan-500/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              
              {/* Dynamic Island Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3 shadow-inner border border-slate-800">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-900 rounded-full" />
                </div>
                <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
              </div>

              <div className="flex-1 h-full flex flex-col pt-12 pb-6 px-4 bg-gradient-to-b from-slate-955 via-zinc-900 to-cyan-950/20 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
                
                <div className="relative z-10 flex flex-col items-center mt-6">
                  <div className="w-20 h-20 rounded-full bg-slate-950 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden mb-4">
                    <Terminal className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100 font-mono">Dev Creator</h3>
                  <span className="text-xs text-cyan-400 font-mono tracking-wider bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-full mt-1.5">@dev_creator</span>
                  
                  <div className="w-full mt-8 flex flex-col gap-3">
                    {[
                      { title: "GitHub Repository", icon: <GithubIcon className="w-5 h-5 text-indigo-400" /> },
                      { title: "Tech Blog", icon: <Terminal className="w-5 h-5 text-emerald-400" /> },
                      { title: "Portfolio", icon: <ExternalLink className="w-5 h-5 text-cyan-400" /> }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-row items-center p-4 gap-4 w-full bg-slate-950/50 backdrop-blur-md border border-cyan-500/10 rounded-2xl shadow-lg">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="font-semibold text-sm text-slate-200 font-mono flex-1">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 4. Footer */}
      <footer className="w-full border-t border-cyan-500/10 bg-slate-950/90 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              &gt;_
            </div>
            <span className="font-bold text-slate-300 font-mono">My Link</span>
          </div>
          
          <div className="text-xs text-slate-500 font-mono text-center md:text-left">
            © {new Date().getFullYear()} 한양대 바이브 코딩 (Hanyang Univ Vibe Coding). All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/choyonghee0538-create/my-link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm font-mono"
            >
              <GithubIcon className="w-5 h-5" /> GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
