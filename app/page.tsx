"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { dummyLinks } from "@/data/links"
import { Card, CardTitle } from "@/components/ui/card"
import {
  ShoppingBag,
  BookOpen,
  User,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react"

// 커스텀 Instagram 아이콘 컴포넌트
const InstagramIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

// 커스텀 Youtube 아이콘 컴포넌트
const YoutubeIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.969.503 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.969 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

// 커스텀 GitHub 아이콘 컴포넌트
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

// 아이콘 매핑 헬퍼 함수
const getIcon = (iconName: string) => {
  const iconClass = "h-5 w-5 transition-transform duration-300"
  switch (iconName) {
    case "instagram":
      return <InstagramIcon className={`${iconClass} text-pink-600 dark:text-pink-400`} />
    case "shopping-bag":
      return <ShoppingBag className={`${iconClass} text-pink-500`} />
    case "youtube":
      return <YoutubeIcon className={`${iconClass} text-red-500`} />
    case "book-open":
      return <BookOpen className={`${iconClass} text-emerald-500`} />
    case "github":
      return <GithubIcon className={`${iconClass} text-slate-800 dark:text-slate-200`} />
    case "user":
      return <User className={`${iconClass} text-blue-500`} />
    default:
      return <Sparkles className={`${iconClass} text-amber-500`} />
  }
}

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hydration mismatch 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  // 활성화된 링크만 필터링 (isActive: true)
  const activeLinks = dummyLinks.filter((link) => link.isActive)

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-rose-50/40 via-background to-rose-50/10 dark:from-neutral-950 dark:via-background dark:to-neutral-900/50 flex flex-col justify-between p-6">
      
      {/* 테마 토글 버튼 (우측 상단 플로팅) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 backdrop-blur-md text-foreground shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* 메인 콘텐츠 영역 (모바일 퍼스트 세로 나열, 중앙 정렬) */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center pt-10 pb-8">
        
        {/* 프로필 헤더 */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-xl hover:scale-105 transition-transform duration-500 ease-out group">
            <Image
              src="/miso_avatar.png"
              alt="Miso Beauty Avatar"
              fill
              priority
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
          <h1 className="mt-4 font-bold text-2xl tracking-tight text-foreground flex items-center gap-1.5">
            미소 뷰티 🌸
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
            봄 맞이 데일리 메이크업 정보와 뷰티 팁을 공유합니다. 아래 링크에서 실시간 특가와 새로운 영상을 만나보세요!
          </p>
        </div>

        {/* 링크 카드 리스트 (세로 정렬, 중앙 정렬) */}
        <div className="w-full flex flex-col gap-4">
          {activeLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl transition-all duration-200"
            >
              <Card className="flex flex-row items-center p-4 gap-4 w-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] border border-border/50 hover:border-pink-300/50 dark:hover:border-pink-500/30 bg-card/60 backdrop-blur-md shadow-sm">
                
                {/* 아이콘 컨테이너 */}
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-secondary/80 text-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                  {getIcon(link.icon)}
                </div>

                {/* 제목 */}
                <div className="flex-1 text-left pr-2">
                  <CardTitle className="text-sm font-semibold text-foreground/90 leading-snug group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200">
                    {link.title}
                  </CardTitle>
                </div>

                {/* 외부 링크 아이콘 */}
                <div className="text-muted-foreground/30 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all duration-300">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="w-full max-w-md mx-auto text-center mt-auto pt-6 border-t border-border/20">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} My Link. All rights reserved.
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
          (Press <kbd className="px-1.5 py-0.5 rounded border border-border/40 bg-muted text-[9px] font-sans">d</kbd> to toggle dark mode)
        </p>
      </footer>

    </div>
  )
}
