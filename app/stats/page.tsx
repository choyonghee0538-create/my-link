"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { BarChart3, ArrowLeft, MousePointerClick, Cpu, Terminal, ExternalLink } from "lucide-react"

interface StatLinkItem {
  id: string
  title: string
  url: string
  clickCount: number
}

export default function StatsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState<StatLinkItem[]>([])
  const [totalClicks, setTotalClicks] = useState(0)

  useEffect(() => {
    setMounted(true)

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // 비로그인 시 메인 페이지로 리다이렉트
        router.push("/")
        return
      }
      setUser(currentUser)
      
      try {
        const linksRef = collection(db, "users", currentUser.uid, "links")
        // 요구사항: orderBy('clickCount','desc') 사용
        const q = query(linksRef, orderBy("clickCount", "desc"))
        const snapshot = await getDocs(q)
        
        const loadedLinks: StatLinkItem[] = []
        let sum = 0
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          const count = data.clickCount || 0
          sum += count
          loadedLinks.push({
            id: docSnap.id,
            title: data.title || "untitled_block",
            url: data.url || "",
            clickCount: count
          })
        })
        
        setLinks(loadedLinks)
        setTotalClicks(sum)
      } catch (err) {
        console.error("통계 데이터 로드 에러:", err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-955 flex flex-col items-center justify-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-mono animate-pulse">loading_statistics_engine...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-955 via-zinc-900 to-cyan-950/20 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center shadow-lg shadow-cyan-950/10">
        <div className="flex flex-1 items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="p-2 rounded-xl bg-slate-900/50 border border-cyan-500/10 hover:border-cyan-400/50 text-cyan-400 transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="font-bold text-lg text-slate-100 tracking-tight font-mono">
              Link Statistics <span className="text-[10px] font-sans bg-cyan-955/60 border border-cyan-500/30 text-cyan-400 font-semibold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.2)] ml-2">Live Data</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-8 z-10">
        
        {/* 상단: 총 클릭수 */}
        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 group-hover:from-cyan-500/10 group-hover:to-indigo-500/10 transition-colors" />
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400">
                  <Terminal className="w-5 h-5" />
                  <span className="text-sm font-bold font-mono tracking-widest uppercase">Total Clicks</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-100 tracking-tighter drop-shadow-md whitespace-nowrap">
                  모든 링크 합산 클릭수
                </h2>
                <p className="text-sm text-slate-400 font-mono mt-2">
                  생성된 모든 링크에서 발생한 총 트래픽입니다.
                </p>
              </div>

              <div className="flex items-center justify-center bg-slate-950/80 border border-cyan-500/30 rounded-full w-40 h-40 md:w-48 md:h-48 shadow-[0_0_40px_rgba(6,182,212,0.2)] ring-4 ring-cyan-950 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-6xl font-black text-cyan-400 tracking-tighter" style={{ textShadow: "0 0 20px rgba(6,182,212,0.5)" }}>
                    {totalClicks}
                  </span>
                  <span className="text-xs text-cyan-500/60 font-mono font-bold uppercase mt-1 tracking-widest">
                    Clicks
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 하단: 링크별 클릭수 */}
        <section className="flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-2 mb-2 pl-2 border-l-4 border-cyan-400">
            <MousePointerClick className="w-5 h-5 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-200 font-mono">링크별 클릭수 랭킹</h3>
          </div>

          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-cyan-500/20 rounded-2xl bg-slate-900/20">
              <Cpu className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 font-mono">데이터가 존재하지 않습니다.<br/>새로운 링크를 추가하고 트래픽을 만들어보세요.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map((link, idx) => (
                <div 
                  key={link.id} 
                  className="flex items-center justify-between p-5 bg-slate-900/35 border border-cyan-500/10 hover:border-cyan-400/40 rounded-2xl shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-black font-mono text-lg text-slate-600 group-hover:text-cyan-500/50 transition-colors">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-200 font-mono truncate">
                        {link.title}
                      </h4>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-cyan-400 font-mono truncate flex items-center gap-1.5 transition-colors">
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2 bg-slate-950/80 border border-cyan-500/20 px-4 py-2 rounded-xl">
                    <span className="text-xl font-bold text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                      {link.clickCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
                      Clicks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
