"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { dummyLinks, LinkItem } from "@/data/links"
import { Card, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  BookOpen,
  User,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Eye,
  Settings2,
  FileText,
  Link,
  Laptop,
  Terminal,
  Cpu,
  Atom,
} from "lucide-react"

// Firebase Firestore 관련 기능 임포트
import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore"

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

// 아이콘 데이터 리스트 (다이얼로그에서 선택 시 사용)
const AVAILABLE_ICONS = [
  { value: "instagram", label: "인스타그램", color: "text-cyan-400" },
  { value: "youtube", label: "유튜브", color: "text-red-400" },
  { value: "github", label: "깃허브", color: "text-indigo-400 dark:text-indigo-300" },
  { value: "book-open", label: "블로그", color: "text-teal-400" },
  { value: "shopping-bag", label: "쇼핑/마켓", color: "text-emerald-400" },
  { value: "user", label: "개인홈피", color: "text-blue-400" },
  { value: "sparkles", label: "기타(별빛)", color: "text-cyan-400" },
]

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 상태 관리 (State Management)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [profile, setProfile] = useState({
    name: "데브 로그 (DevLog) ⚡",
    bio: "오픈소스 기여, AI 트렌드, 그리고 프론트엔드 아키텍처에 관심이 많은 테크 크리에이터입니다. 최신 정보는 아래 링크에서 확인하세요!",
    avatarUrl: ""
  })

  // UI 뷰 모드 및 추가 다이얼로그 상태
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // 링크 추가 폼 상태
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newIcon, setNewIcon] = useState("sparkles")

  // Hydration mismatch 방지 및 Firestore 실시간 동기화 구독
  useEffect(() => {
    setMounted(true)

    // users/anonymous/links 컬렉션을 order 필드 기준으로 정렬하여 구독
    const linksRef = collection(db, "users/anonymous/links")
    const q = query(linksRef, orderBy("order", "asc"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // 1. 만약 데이터가 아예 없다면 dummyLinks를 최초 데이터로 자동 시딩 (Wow Factor 1)
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db)
          dummyLinks.forEach((link, idx) => {
            const docRef = doc(db, "users/anonymous/links", link.id)
            batch.set(docRef, {
              id: link.id,
              title: link.title,
              url: link.url,
              icon: link.icon,
              isActive: link.isActive,
              order: idx,
            })
          })
          await batch.commit()
        } catch (err) {
          console.error("Error seeding dummy links to Firestore:", err)
        }
      } else {
        // 2. 데이터가 존재한다면 상태에 매핑 연동 (실시간 양방향)
        const loadedLinks: LinkItem[] = []
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data()
          loadedLinks.push({
            id: docSnapshot.id,
            title: data.title || "",
            url: data.url || "",
            icon: data.icon || "sparkles",
            isActive: data.isActive !== undefined ? data.isActive : true,
          })
        })
        setLinks(loadedLinks)
      }
    }, (error) => {
      console.error("Error subscribing to Firestore links:", error)
    })

    return () => unsubscribe()
  }, [])

  // 키보드로 다크 모드 토글 단축키 활성화 (d)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && e.target === document.body) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [resolvedTheme, setTheme])

  // 링크 생성 핸들러 (Create -> Firestore setDoc 연동)
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTitle.trim()) {
      alert("링크 제목을 입력해주세요.")
      return
    }
    if (!newUrl.trim()) {
      alert("연결할 URL을 입력해주세요.")
      return
    }

    let correctedUrl = newUrl.trim()
    if (!/^https?:\/\//i.test(correctedUrl)) {
      correctedUrl = `https://${correctedUrl}`
    }

    const newId = Date.now().toString()
    const nextOrder = links.length // 현재 마지막 항목 순서 배정

    try {
      await setDoc(doc(db, "users/anonymous/links", newId), {
        id: newId,
        title: newTitle.trim(),
        url: correctedUrl,
        icon: newIcon,
        isActive: true,
        order: nextOrder,
      })

      // 폼 초기화 및 다이얼로그 닫기
      setNewTitle("")
      setNewUrl("")
      setNewIcon("sparkles")
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Error creating link in Firestore:", err)
      alert("링크를 데이터베이스에 추가하지 못했습니다.")
    }
  }

  // 링크 활성화 ON/OFF 토글 핸들러 (Update -> Firestore updateDoc 연동)
  const handleToggleLink = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "users/anonymous/links", id), {
        isActive: !currentActive,
      })
    } catch (err) {
      console.error("Error updating link active state in Firestore:", err)
    }
  }

  // 링크 삭제 핸들러 (Delete -> Firestore deleteDoc 및 order 순서 재인덱싱)
  const handleDeleteLink = async (id: string) => {
    if (!confirm("정말로 이 링크를 삭제하시겠습니까?")) return

    try {
      // 1. 해당 문서 영구 삭제
      await deleteDoc(doc(db, "users/anonymous/links", id))

      // 2. 삭제 후 남은 링크들의 order 필드를 0부터 다시 순차 매핑하여 인덱싱 일관성 보존 (Wow factor 2)
      const remainingLinks = links.filter((link) => link.id !== id)
      const batch = writeBatch(db)
      remainingLinks.forEach((link, idx) => {
        const docRef = doc(db, "users/anonymous/links", link.id)
        batch.update(docRef, { order: idx })
      })
      await batch.commit()
    } catch (err) {
      console.error("Error deleting link in Firestore:", err)
      alert("링크 삭제 중 오류가 발생했습니다.")
    }
  }

  // 인라인 텍스트 필드 수정 (Local UI State만 먼저 즉각 반영 - 최상의 타이핑 반응성)
  const handleLocalUpdateField = (id: string, field: "title" | "url", value: string) => {
    setLinks(
      links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    )
  }

  // 인라인 인풋 포커스 아웃 (onBlur) 시점에 Firestore 최종 영구 커밋 (Wow factor 3 - 성능 최적화)
  const handleSaveFieldToFirestore = async (id: string, field: "title" | "url", value: string) => {
    try {
      await updateDoc(doc(db, "users/anonymous/links", id), {
        [field]: value.trim(),
      })
    } catch (err) {
      console.error(`Error saving ${field} to Firestore:`, err)
    }
  }

  // 링크 순서 위로 이동 (Up -> Firestore WriteBatch 순서 교환)
  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    try {
      const batch = writeBatch(db)
      const currentLink = links[index]
      const targetLink = links[index - 1]

      const currentRef = doc(db, "users/anonymous/links", currentLink.id)
      const targetRef = doc(db, "users/anonymous/links", targetLink.id)

      batch.update(currentRef, { order: index - 1 })
      batch.update(targetRef, { order: index })

      await batch.commit()
    } catch (err) {
      console.error("Error moving link up in Firestore:", err)
    }
  }

  // 링크 순서 아래로 이동 (Down -> Firestore WriteBatch 순서 교환)
  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1) return
    try {
      const batch = writeBatch(db)
      const currentLink = links[index]
      const targetLink = links[index + 1]

      const currentRef = doc(db, "users/anonymous/links", currentLink.id)
      const targetRef = doc(db, "users/anonymous/links", targetLink.id)

      batch.update(currentRef, { order: index + 1 })
      batch.update(targetRef, { order: index })

      await batch.commit()
    } catch (err) {
      console.error("Error moving link down in Firestore:", err)
    }
  }

  // 활성화된 링크만 필터링 (우측 프리뷰 렌더링용)
  const activeLinks = links.filter((link) => link.isActive)

  // 테크 네온 터미널 아바타 컴포넌트
  const TechAvatar = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
    const isLg = size === "lg"
    return (
      <div className={`relative ${
        isLg ? "w-18 h-18 sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"
      } rounded-full bg-slate-950 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center overflow-hidden group/avatar`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-indigo-500/20 opacity-80 group-hover/avatar:rotate-180 transition-transform duration-1000" />
        <Terminal className={`${
          isLg ? "w-7 h-7 sm:w-8 h-8" : "w-5 h-5 sm:w-6 h-6"
        } text-cyan-400 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]`} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none" />
      </div>
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-zinc-900 to-cyan-950/20 dark:from-slate-950 dark:via-neutral-950 dark:to-cyan-950/30 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* 테크 배경 미세 그리드 패턴 장식 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* 글로벌 상단 헤더 바 */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg shadow-cyan-950/10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-mono font-bold text-lg border border-cyan-400/20">
            &gt;_
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2 font-mono">
              My Link <span className="text-[10px] font-sans bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-semibold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.2)]">Dev Dashboard</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">파이어베이스 Cloud DB(Firestore) 실시간 데이터 마이그레이션 완료</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 테마 토글 버튼 */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/25 bg-slate-900/60 backdrop-blur-xs text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:scale-105 active:scale-95 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-400" />
            )}
          </button>
        </div>
      </header>

      {/* 모바일 뷰 전용 네비게이션 탭 */}
      <div className="flex md:hidden sticky top-[73px] z-30 border-b border-cyan-500/10 bg-slate-950/90 backdrop-blur-md px-4 py-2 gap-2">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300 font-mono ${
            activeTab === "edit"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold"
              : "text-slate-400 hover:bg-slate-900/50"
          }`}
        >
          <Edit3 className="w-4 h-4" /> &gt;_ 편집 모드
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300 font-mono ${
            activeTab === "preview"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold"
              : "text-slate-400 hover:bg-slate-900/50"
          }`}
        >
          <Eye className="w-4 h-4" /> [모바일 프리뷰]
        </button>
      </div>

      {/* 대시보드 바디 (2분할 레이아웃) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row h-[calc(100vh-73px)] md:h-[calc(100vh-73px)] overflow-hidden z-10">
        
        {/* 1. 좌측 편집 패널 */}
        <main className={`flex-1 h-full overflow-y-auto p-6 lg:p-8 flex flex-col gap-8 ${
          activeTab === "edit" ? "block" : "hidden md:block"
        }`}>
          
          {/* A. 프로필 설정 카드 */}
          <section className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-3">
              <Settings2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-200 font-mono">system_branding_config</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* 원형 아바타 */}
              <div className="flex justify-center w-full sm:w-auto">
                {profile.avatarUrl ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-cyan-500 shadow-md">
                    <Image
                      src={profile.avatarUrl}
                      alt="Profile Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <TechAvatar size="sm" />
                )}
              </div>

              {/* 닉네임, 소개글 입력 */}
              <div className="flex-1 w-full grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-name" className="text-xs text-cyan-400 font-semibold font-mono">
                    PROMPT_NAME (닉네임 - 최대 30자)
                  </Label>
                  <Input
                    id="profile-name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value.slice(0, 30) })}
                    placeholder="프로필명을 입력하세요"
                    className="bg-slate-950/60 border-cyan-500/15 text-slate-200 focus-visible:border-cyan-400 font-mono text-sm placeholder:text-slate-600"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="profile-bio" className="text-xs text-cyan-400 font-semibold font-mono">
                    BIO_DESCRIPTION (한 줄 소개 - 최대 80자)
                  </Label>
                  <Input
                    id="profile-bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 80) })}
                    placeholder="소개글을 입력하세요"
                    className="bg-slate-955/60 border-cyan-500/15 text-slate-200 focus-visible:border-cyan-400 text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* B. 링크 블록 관리 패널 */}
          <section className="flex-1 flex flex-col gap-4 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-200 font-mono">link_block_builder (Cloud DB)</h2>
              </div>

              {/* 링크 추가 다이얼로그 (Dialog) */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger render={
                  <Button className="cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-mono gap-1.5 px-4 py-2 h-9 rounded-xl shadow-md shadow-cyan-500/10 active:scale-95 transition-all duration-200 border-none" />
                }>
                  <Plus className="w-4.5 h-4.5" /> ADD_NEW_BLOCK
                </DialogTrigger>
                
                <DialogContent className="border border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.2)] rounded-2xl max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2 font-mono border-b border-cyan-500/10 pb-2">
                      <Terminal className="w-5 h-5 text-cyan-400" /> create_link_block
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateLink} className="space-y-4 py-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="link-title" className="text-xs font-semibold text-cyan-400 font-mono">BLOCK_TITLE (링크 제목)</Label>
                      <Input
                        id="link-title"
                        placeholder="예: Github 저장소, 기술 블로그 등"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="bg-slate-900/60 border-cyan-500/20 text-slate-200 focus-visible:border-cyan-400 text-sm font-mono placeholder:text-slate-600"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="link-url" className="text-xs font-semibold text-cyan-400 font-mono">TARGET_URL (연결 URL)</Label>
                      <Input
                        id="link-url"
                        placeholder="예: github.com/username"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        required
                        className="bg-slate-900/60 border-cyan-500/20 text-slate-200 focus-visible:border-cyan-400 text-sm font-mono placeholder:text-slate-600"
                      />
                    </div>

                    {/* 아이콘 선택 */}
                    <div className="grid gap-2">
                      <Label className="text-xs font-semibold text-cyan-400 font-mono">SELECT_BLOCK_ICON (아이콘)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVAILABLE_ICONS.map((iconOpt) => (
                          <button
                            key={iconOpt.value}
                            type="button"
                            onClick={() => setNewIcon(iconOpt.value)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              newIcon === iconOpt.value
                                ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] text-cyan-300"
                                : "border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 text-slate-400"
                            }`}
                          >
                            <div className="mb-1">{getIcon(iconOpt.value, iconOpt.color)}</div>
                            <span className="text-[10px] font-mono tracking-tighter truncate max-w-full">
                              {iconOpt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="flex sm:flex-row gap-2 pt-2 border-t border-cyan-500/10 mt-4">
                      <DialogClose render={
                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-9 font-semibold font-mono border-slate-800 hover:bg-slate-900 text-slate-300" />
                      }>
                        CANCEL
                      </DialogClose>
                      <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-mono rounded-xl h-9">
                        CONFIRM
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* 링크 리스트 카드 */}
            {links.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-cyan-500/20 rounded-2xl bg-slate-950/30">
                <FileText className="w-10 h-10 text-cyan-500/20 mb-3" />
                <h3 className="text-sm font-semibold text-slate-400 font-mono">database_is_empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-mono">
                  우측 상단의 "ADD_NEW_BLOCK" 버튼을 클릭하여 테크니컬 바로가기 블록을 생성하세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {links.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 bg-slate-900/30 backdrop-blur-xs border border-cyan-500/10 rounded-xl hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.06)] transition-all duration-200 group"
                  >
                    
                    {/* 상하 이동 순서 제어기 */}
                    <div className="flex flex-row sm:flex-col gap-1 w-full sm:w-auto items-center justify-between sm:justify-center border-b sm:border-b-0 pb-2 sm:pb-0 border-slate-850">
                      <div className="flex items-center gap-1 sm:flex-col">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-850 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === links.length - 1}
                          className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-850 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 아이콘 표시 */}
                      <div className="h-9 w-9 rounded-full bg-slate-950 border border-cyan-500/10 flex items-center justify-center shadow-xs">
                        {getIcon(link.icon)}
                      </div>
                    </div>

                    {/* 인라인 제목 / URL 텍스트 편집 */}
                    <div className="flex-1 w-full grid gap-2">
                      <div className="grid gap-1">
                        <Input
                          value={link.title}
                          onChange={(e) => handleLocalUpdateField(link.id, "title", e.target.value)}
                          onBlur={(e) => handleSaveFieldToFirestore(link.id, "title", e.target.value)}
                          placeholder="링크 제목"
                          className="h-7 text-sm font-semibold border-none hover:bg-slate-850 focus-visible:bg-slate-800 px-1 py-0 shadow-none focus-visible:ring-0 rounded-md text-slate-200 font-mono"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Input
                          value={link.url}
                          onChange={(e) => handleLocalUpdateField(link.id, "url", e.target.value)}
                          onBlur={(e) => handleSaveFieldToFirestore(link.id, "url", e.target.value)}
                          placeholder="연결 URL (예: https://example.com)"
                          className="h-6 text-xs text-cyan-400/80 border-none hover:bg-slate-850 focus-visible:bg-slate-800 px-1 py-0 shadow-none focus-visible:ring-0 rounded-md font-mono"
                        />
                      </div>
                    </div>

                    {/* 노출 스위치 및 삭제 버튼 */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold font-mono">
                          {link.isActive ? "ACTIVE" : "HIDDEN"}
                        </span>
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={() => handleToggleLink(link.id, link.isActive)}
                          aria-label="Toggle link active state"
                          className="data-checked:bg-cyan-500"
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                        title="링크 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* 2. 우측 실시간 모바일 프리뷰 (Firestore 데이터 실시간 연동) */}
        <aside className={`w-full md:w-[380px] lg:w-[420px] h-full items-center justify-center bg-slate-950/30 md:border-l border-cyan-500/10 p-6 md:p-8 flex-col ${
          activeTab === "preview" ? "flex" : "hidden md:flex"
        }`}>
          
          <div className="text-center mb-4 hidden md:block">
            <span className="text-[10px] bg-slate-900 border border-cyan-500/25 text-cyan-400 font-semibold font-mono px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Cpu className="w-3.5 h-3.5 animate-spin" /> LIVE_CLOUD_DATABASE_SYNC
            </span>
          </div>

          {/* 스마트폰 기기 프레임 */}
          <div className="relative w-[300px] sm:w-[320px] h-[580px] sm:h-[620px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.12)] flex flex-col justify-between overflow-hidden ring-1 ring-cyan-500/20">
            
            {/* 다이내믹 아일랜드 노치 */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3 shadow-inner border border-slate-800">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-900 rounded-full" />
              </div>
              <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* 모바일 화면 상단 그라데이션 및 바디 콘텐츠 */}
            <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col pt-12 pb-6 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              
              {/* 모바일 프로필 헤더 */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-18 h-18 rounded-full flex items-center justify-center border border-cyan-500/30 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  {profile.avatarUrl ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={profile.avatarUrl}
                        alt="Dev Avatar"
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <TechAvatar size="sm" />
                  )}
                </div>
                <h3 className="mt-3 font-bold text-base text-slate-100 tracking-tight flex items-center gap-1 font-mono">
                  {profile.name || "dev_name"}
                </h3>
                <p className="mt-1.5 text-[11px] text-slate-400 max-w-[220px] leading-relaxed break-all font-mono">
                  {profile.bio || "no bio info loaded."}
                </p>
              </div>

              {/* 활성화된 모바일 링크 목록 */}
              <div className="flex-1 w-full flex flex-col gap-3">
                {activeLinks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 border border-cyan-500/10 rounded-xl">
                    <Atom className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                    <p className="text-[10px] text-slate-400 font-mono">
                      NO_ACTIVE_BLOCK_LOADED<br />시스템 링크를 활성화하세요.
                    </p>
                  </div>
                ) : (
                  activeLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl transition-all duration-200"
                    >
                      {/* 네온 글로우 테크 글래스 카드 */}
                      <Card className="flex flex-row items-center p-3 gap-3 w-full cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/10 hover:border-cyan-400/40 bg-slate-900/50 backdrop-blur-md shadow-lg">
                        
                        {/* 아이콘 */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/20 text-cyan-400 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
                          {getIcon(link.icon)}
                        </div>

                        {/* 제목 */}
                        <div className="flex-1 text-left pr-1 truncate">
                          <CardTitle className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-cyan-400 transition-colors font-mono">
                            {link.title || "untitled_block"}
                          </CardTitle>
                        </div>

                        {/* 아이콘 화살표 */}
                        <div className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </Card>
                    </a>
                  ))
                )}
              </div>

              {/* 프리뷰 모바일 하단 로고 */}
              <div className="mt-8 text-center text-[9px] text-cyan-500/20 font-mono tracking-widest">
                SYSTEM DEV_LINK ⚡
              </div>

            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
