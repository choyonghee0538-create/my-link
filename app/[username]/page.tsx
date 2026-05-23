"use client"

import React, { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Card, CardTitle } from "@/components/ui/card"
import {
  ShoppingBag,
  BookOpen,
  User,
  ExternalLink,
  Sparkles,
  Terminal,
  Cpu,
  Atom,
  AlertTriangle,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react"

// Firebase 클라이언트 연동
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  collectionGroup,
  where,
  setDoc,
} from "firebase/firestore"

// 링크 아이템 타입 정의
interface FirestoreLinkItem {
  id: string
  title: string
  url: string
  icon: string
  isActive: boolean
  createdAt?: any
}

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
const getIcon = (iconName: string, activeColorClass?: string) => {
  const iconClass = "h-5 w-5 transition-all duration-300 group-hover:scale-110"
  switch (iconName) {
    case "instagram":
      return <InstagramIcon className={`${iconClass} ${activeColorClass || "text-cyan-400 dark:text-cyan-400"}`} />
    case "shopping-bag":
      return <ShoppingBag className={`${iconClass} ${activeColorClass || "text-emerald-400"}`} />
    case "youtube":
      return <YoutubeIcon className={`${iconClass} ${activeColorClass || "text-red-400"}`} />
    case "book-open":
      return <BookOpen className={`${iconClass} ${activeColorClass || "text-teal-400"}`} />
    case "github":
      return <GithubIcon className={`${iconClass} ${activeColorClass || "text-indigo-400 dark:text-indigo-300"}`} />
    case "user":
      return <User className={`${iconClass} ${activeColorClass || "text-blue-400"}`} />
    default:
      return <Sparkles className={`${iconClass} ${activeColorClass || "text-cyan-400 animate-pulse"}`} />
  }
}

interface PageProps {
  params: Promise<{ username: string }>
}

export default function UsernamePage({ params }: PageProps) {
  const { username: rawUsername } = use(params)
  const username = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "")

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [is404, setIs404] = useState(false)

  const [profile, setProfile] = useState({
    username: "",
    name: "",
    bio: "",
    avatarUrl: "",
  })
  const [links, setLinks] = useState<FirestoreLinkItem[]>([])

  useEffect(() => {
    setMounted(true)

    const loadData = async () => {
      try {
        // 1. usernames/{username} 문서 단건 조회로 uid 고속 색인
        const usernameRef = doc(db, "usernames", username)
        const usernameSnap = await getDoc(usernameRef)

        let userId = ""
        if (usernameSnap.exists()) {
          userId = usernameSnap.data().uid
        } else {
          // Fallback: usernames 인덱스 테이블에 유실된 경우, profile 서브컬렉션 그룹을 직접 쿼리하여 유저 색인
          const profileQuery = query(
            collectionGroup(db, "profile"),
            where("username", "==", username)
          )
          const profileQuerySnap = await getDocs(profileQuery)
          
          if (!profileQuerySnap.empty) {
            const matchedDoc = profileQuerySnap.docs[0]
            if (matchedDoc.ref.parent.parent) {
              userId = matchedDoc.ref.parent.parent.id
              
              // 자기치유(Self-healing): usernames 역인덱스 문서 복구 자동화
              try {
                await setDoc(doc(db, "usernames", username), { uid: userId })
              } catch (e) {
                console.warn("Index auto-healing failed:", e)
              }
            }
          }
        }

        // 3. Fallback: 만약 username 자체가 userId(UID)인 경우 직접 조회
        if (!userId) {
          const directProfileRef = doc(db, "users", username, "profile", "info")
          const directProfileSnap = await getDoc(directProfileRef)
          if (directProfileSnap.exists()) {
            userId = username
            
            // 자기치유(Self-healing): usernames 역인덱스 문서 복구 자동화
            try {
              await setDoc(doc(db, "usernames", username), { uid: userId })
            } catch (e) {
              console.warn("Index auto-healing failed:", e)
            }
          }
        }

        if (!userId) {
          setIs404(true)
          setLoading(false)
          return
        }

        // 2. 해당 uid의 프로필 정보 조회
        const profileRef = doc(db, "users", userId, "profile", "info")
        const profileSnap = await getDoc(profileRef)

        if (profileSnap.exists()) {
          const profileData = profileSnap.data()
          const loadedProfile = {
            username: profileData.username || username,
            name: profileData.name || "Developer",
            bio: profileData.bio || "반갑습니다! 저의 링크 스페이스입니다.",
            avatarUrl: profileData.avatarUrl || "",
          }
          setProfile(loadedProfile)

          // 브라우저 탭 타이틀 고도화
          document.title = `${loadedProfile.name} (@${loadedProfile.username}) - My Link ⚡`
        } else {
          setProfile({
            username: username,
            name: username,
            bio: "설정된 프로필 소개 정보가 없습니다.",
            avatarUrl: "",
          })
          document.title = `${username} - My Link`
        }

        // 3. 해당 uid의 링크 컬렉션 조회
        const linksRef = collection(db, "users", userId, "links")
        const q = query(linksRef, orderBy("createdAt", "desc"))
        const linksSnap = await getDocs(q)

        const loadedLinks: FirestoreLinkItem[] = []
        linksSnap.forEach((docSnap) => {
          const data = docSnap.data()
          // 활성화된 링크 블록만 필터링
          if (data.isActive !== false) {
            loadedLinks.push({
              id: docSnap.id,
              title: data.title || "",
              url: data.url || "",
              icon: data.icon || "sparkles",
              isActive: true,
            })
          }
        })
        setLinks(loadedLinks)

      } catch (error) {
        console.error("데이터 로드 중 치명적인 오류가 발생했습니다:", error)
        setIs404(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [username])

  // 테크 네온 터미널 아바타 컴포넌트
  const TechAvatar = ({ avatarUrl }: { avatarUrl?: string }) => {
    if (avatarUrl) {
      return (
        <div className="relative w-20 h-20 rounded-full border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] overflow-hidden flex items-center justify-center bg-slate-950">
          <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
        </div>
      )
    }

    return (
      <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden group/avatar">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-indigo-500/20 opacity-80 group-hover/avatar:rotate-180 transition-transform duration-1000" />
        <Terminal className="w-8 h-8 text-cyan-400 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none" />
      </div>
    )
  }

  if (!mounted) return null

  // 1. 전체 화면 로딩 스피너
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-955 flex flex-col items-center justify-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-mono animate-pulse">resolving_shared_node_runtime...</p>
      </div>
    )
  }

  // 2. 존재하지 않는 사용자 (404) 터미널 스타일 뷰
  if (is404) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-955 via-neutral-950 to-red-950/20 flex flex-col items-center justify-center p-6 font-sans relative selection:bg-red-500/20 selection:text-red-300">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="max-w-md w-full flex flex-col items-center gap-6 bg-slate-900/35 border border-red-500/20 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden ring-1 ring-red-500/10 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-bounce">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-xl font-bold text-slate-200 font-mono tracking-tight">
              system_error: 404_not_found
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              요청하신 공유 식별자(<span className="text-red-400 font-mono">@{username}</span>)를 찾을 수 없습니다.<br />
              아이디가 변경되었거나 삭제된 노드 스페이스일 수 있습니다.
            </p>
          </div>

          <Link
            href="/"
            className="w-full cursor-pointer bg-red-950/30 hover:bg-red-900/35 border border-red-500/30 hover:border-red-450 text-red-400 hover:text-red-300 font-bold font-mono py-4 rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all group shadow-[0_0_15px_rgba(239,68,68,0.05)] text-center text-xs"
          >
            메인 화면으로 돌아가기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  // 3. 정상 퍼블릭 랜딩 페이지 뷰 (모바일 퍼스트 글래스모피즘 카드 레이아웃)
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-955 via-zinc-900 to-cyan-950/20 dark:from-slate-955 dark:via-neutral-950 dark:to-cyan-950/30 flex flex-col items-center justify-start p-6 font-sans relative selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* 테크 배경 미세 그리드 패턴 장식 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* 우측 상단 플로팅 테마 전환 기믹 */}
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="cursor-pointer p-2.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-cyan-500/10 hover:border-cyan-400/40 text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)] transition-all"
          title="테마 전환"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-indigo-400" />
          )}
        </button>
      </div>

      {/* 메인 퍼블릭 포커스 카드 컨테이너 (Wow Factor 2) */}
      <main className="max-w-md w-full bg-slate-900/35 border border-cyan-500/10 rounded-[36px] p-8 md:p-10 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col items-center mt-12 md:mt-20 z-10 backdrop-blur-md ring-1 ring-cyan-500/5 select-none animate-in fade-in duration-300">
        
        {/* 모바일 프로필 정보 헤더 */}
        <div className="flex flex-col items-center text-center w-full mb-8">
          <div className="relative p-0.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] bg-slate-950 mb-4 animate-in zoom-in-50 duration-500">
            <TechAvatar avatarUrl={profile.avatarUrl} />
          </div>
          
          <h3 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1 font-mono">
            {profile.name}
          </h3>
          
          <span className="text-xs text-cyan-400 font-mono font-semibold tracking-wider bg-cyan-950/30 border border-cyan-500/20 px-3 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.15)] mt-1.5 animate-pulse">
            @{profile.username}
          </span>
          
          <p className="mt-4 text-xs text-slate-400 leading-relaxed font-mono max-w-[320px] break-all border-t border-cyan-500/5 pt-3 w-full">
            {profile.bio}
          </p>
        </div>

        {/* 모바일 링크 블록 목록 */}
        <div className="w-full flex flex-col gap-4">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-955/20 border border-dashed border-cyan-500/10 rounded-2xl">
              <Atom className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                NO_ACTIVE_BLOCK_LOADED<br />아직 활성화된 링크 노드가 존재하지 않습니다.
              </p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl transition-all duration-200"
              >
                {/* 네온 글로우 테크 카드 */}
                <Card className="flex flex-row items-center p-4 gap-4 w-full cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.22)] border border-cyan-500/10 hover:border-cyan-400/50 bg-slate-950/50 backdrop-blur-md shadow-xl rounded-2xl">
                  {/* 아이콘 */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-400 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
                    {getIcon(link.icon)}
                  </div>
                  
                  {/* 제목 */}
                  <div className="flex-1 text-left pr-1 truncate">
                    <CardTitle className="text-sm font-semibold text-slate-200 leading-tight group-hover:text-cyan-400 transition-colors font-mono">
                      {link.title || "untitled_block"}
                    </CardTitle>
                  </div>
                  
                  {/* 외부 링크 화살표 아이콘 */}
                  <div className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors mr-1">
                    <ExternalLink className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                </Card>
              </a>
            ))
          )}
        </div>

        {/* 프리뷰 모바일 하단 로고 */}
        <div className="mt-12 text-center flex flex-col gap-1 w-full border-t border-cyan-500/5 pt-4">
          <Link href="/" className="text-[10px] text-cyan-500/20 hover:text-cyan-400/40 font-mono tracking-widest uppercase transition-colors">
            POWERED BY MY LINK ⚡
          </Link>
        </div>

      </main>

    </div>
  )
}
