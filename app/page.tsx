"use client"

import React, { useEffect, useState, useRef, Suspense } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { dummyLinks, LinkItem } from "@/data/links"
import { Card, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
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
  Check,
  X,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react"

// Firebase 클라이언트 모듈 연동
import { auth, db } from "@/lib/firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore"

// Firestore 특화 데이터 모델 정의
interface FirestoreLinkItem extends LinkItem {
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

// 아이콘 데이터 리스트
const AVAILABLE_ICONS = [
  { value: "instagram", label: "인스타그램", color: "text-cyan-400" },
  { value: "youtube", label: "유튜브", color: "text-red-400" },
  { value: "github", label: "깃허브", color: "text-indigo-400 dark:text-indigo-300" },
  { value: "book-open", label: "블로그", color: "text-teal-400" },
  { value: "shopping-bag", label: "쇼핑/마켓", color: "text-emerald-400" },
  { value: "user", label: "개인홈피", color: "text-blue-400" },
  { value: "sparkles", label: "기타(별빛)", color: "text-cyan-400" },
]

function MyLinkApp() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 사용자 로그인 및 로딩 세션 상태 (Wow Factor 1)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 프로필 드롭다운 제어 상태 및 링크 복사 기믹 (Wow Factor)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 상태 관리 (인수 인증 연동에 맞춰 비로그인 시 dummyLinks 세팅)
  const [links, setLinks] = useState<FirestoreLinkItem[]>([])
  const [profile, setProfile] = useState({
    username: "",
    name: "데브 로그 (DevLog) ⚡",
    bio: "오픈소스 기여, AI 트렌드, 그리고 프론트엔드 아키텍처에 관심이 많은 테크 크리에이터입니다. 최신 정보는 아래 링크에서 확인하세요!",
    avatarUrl: ""
  })
  const [usernameError, setUsernameError] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // 쿼리 파라미터 파싱 및 권한 경계 식별
  const searchParams = useSearchParams()
  const queryUid = searchParams.get("uid")
  const targetUid = queryUid || (user ? user.uid : null)
  const isEditable = user !== null && targetUid === user.uid

  // UI 뷰 모드 및 추가 다이얼로그 상태
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // 링크 추가 폼 상태
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newIcon, setNewIcon] = useState("sparkles")

  // 인라인 편집 관련 상태
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState("")
  const [tempUrl, setTempUrl] = useState("")

  // 실수 삭제 방지용 커스텀 모달 상태
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)

  // 1. Hydration mismatch 방지 및 Firebase Auth 관측기 연동
  useEffect(() => {
    setMounted(true)

    // 로그인 세션 실시간 감시 (onAuthStateChanged)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => {
      unsubscribeAuth()
    }
  }, [])

  // 2. targetUid 실시간 데이터 동적 스냅샷 결합 (Wow Factor)
  useEffect(() => {
    let unsubscribeLinks: (() => void) | null = null
    let unsubscribeProfile: (() => void) | null = null

    if (targetUid) {
      // 대상 targetUid의 프로필 실시간 구독 및 소유자 최초 로그인 시딩
      const profileRef = doc(db, "users", targetUid, "profile", "info")
      unsubscribeProfile = onSnapshot(profileRef, async (profileSnapshot) => {
        if (!profileSnapshot.exists()) {
          // 만약 현재 로그인된 본인의 UID이고 프로필이 없다면 (최초 로그인 유저용 시딩)
          if (user && targetUid === user.uid) {
            // 이메일 ID 추출 및 공백/특수문자 제외
            const baseUsername = user.email
              ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
              : "user_" + Math.floor(Math.random() * 1000)

            let finalUsername = baseUsername
            let counter = 1
            let isUnique = false

            // 최대 100회 돌며 고유한 username 탐색
            while (!isUnique && counter < 100) {
              const usernameRef = doc(db, "usernames", finalUsername)
              const usernameSnap = await getDoc(usernameRef)
              if (!usernameSnap.exists()) {
                isUnique = true
              } else {
                finalUsername = `${baseUsername}_${counter}`
                counter++
              }
            }

            const defaultProfile = {
              username: finalUsername,
              name: user.displayName || finalUsername || "Tech Pioneer",
              bio: "오픈소스 기여와 신기술 트렌드에 기여하고 있습니다. 나만의 테크 링크를 즉시 완성해 보세요!",
              avatarUrl: user.photoURL || "",
            }

            try {
              // usernames 최상위 인덱스 테이블에 uid 점유 등록
              await setDoc(doc(db, "usernames", finalUsername), { uid: user.uid })
              
              // 사용자 프로필 저장
              await setDoc(profileRef, defaultProfile)
              setProfile(defaultProfile)
            } catch (err) {
              console.error("Error seeding profile: ", err)
            }
          } else {
            // 타인 계정인데 프로필 정보가 아예 없는 경우
            setProfile({
              username: "anonymous",
              name: "anonymous_creator",
              bio: "정보가 채워지지 않은 링크트리 공간입니다.",
              avatarUrl: ""
            })
          }
        } else {
          const data = profileSnapshot.data()
          // 만약 기존 문서가 존재하지만 username 필드가 비어있거나 없는 경우, 구글 이메일 앞부분을 기본값으로 자동 추출
          let finalUsername = data.username || ""
          if (!finalUsername && user && targetUid === user.uid) {
            finalUsername = user.email
              ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
              : ""
          }

          // 데이터베이스에 username 매핑과 필드가 항시 안전하게 연동되도록 보장 (유실 완벽 차단)
          if (finalUsername && user && targetUid === user.uid) {
            try {
              const batch = writeBatch(db)
              batch.set(doc(db, "usernames", finalUsername), { uid: user.uid })
              if (!data.username) {
                batch.set(profileRef, { username: finalUsername }, { merge: true })
              }
              batch.commit()
            } catch (err) {
              console.warn("Silent profile username healing failed:", err)
            }
          }

          setProfile({
            username: finalUsername,
            name: data.name || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
          })
        }
      })

      // 대상 targetUid의 링크 컬렉션 실시간 구독
      const linksRef = collection(db, "users", targetUid, "links")
      const q = query(linksRef, orderBy("createdAt", "desc"))
      unsubscribeLinks = onSnapshot(q, (snapshot) => {
        const loadedLinks: FirestoreLinkItem[] = []
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data()
          loadedLinks.push({
            id: docSnapshot.id,
            title: data.title || "",
            url: data.url || "",
            icon: data.icon || "sparkles",
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt,
          })
        })
        setLinks(loadedLinks)
      }, (error) => {
        console.error("Error subscribing to links:", error)
      })
    } else {
      // targetUid가 전혀 없는 비로그인 메인 상태: dummyLinks 데모 가동
      setLinks(dummyLinks)
      setProfile({
        username: "devlog",
        name: "데브 로그 (DevLog) ⚡",
        bio: "오픈소스 기여, AI 트렌드, 그리고 프론트엔드 아키텍처에 관심이 많은 테크 크리에이터입니다. 최신 정보는 아래 링크에서 확인하세요!",
        avatarUrl: ""
      })
    }

    return () => {
      if (unsubscribeLinks) unsubscribeLinks()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [user, targetUid])

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

  // Google 소셜 로그인 핸들러
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error("Google Authentication error:", err)
      alert("구글 로그인 진행 도중 에러가 발생했습니다.")
    }
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut(auth)
      // 로그아웃 시 대시보드 상태값 리셋
      setLinks(dummyLinks)
      setEditingLinkId(null)
      setDeletingLinkId(null)
    } catch (err) {
      console.error("Firebase SignOut error:", err)
    }
  }

  // 개인화 공개 랜딩 주소 복사 핸들러
  const handleCopyLink = async () => {
    if (!user) return
    const publicUrl = `${window.location.origin}?uid=${user.uid}`
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  // 링크 생성 핸들러 (개인화 동적 경로 이식)
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isEditable) return

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

    try {
      await setDoc(doc(db, "users", user.uid, "links", newId), {
        id: newId,
        title: newTitle.trim(),
        url: correctedUrl,
        icon: newIcon,
        isActive: true,
        createdAt: serverTimestamp(),
      })

      setNewTitle("")
      setNewUrl("")
      setNewIcon("sparkles")
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Error creating personal link:", err)
      alert("링크를 데이터베이스에 추가하지 못했습니다.")
    }
  }

  // 링크 활성화 ON/OFF 토글 핸들러
  const handleToggleLink = async (id: string, currentActive: boolean) => {
    if (!user || !isEditable) return
    try {
      await updateDoc(doc(db, "users", user.uid, "links", id), {
        isActive: !currentActive,
      })
    } catch (err) {
      console.error("Error updating active toggle:", err)
    }
  }

  // 링크 삭제 요청 핸들러 (모달 오픈)
  const handleDeleteLink = (id: string) => {
    setDeletingLinkId(id)
  }

  // 링크 삭제 확정 및 집행
  const handleConfirmDelete = async () => {
    if (!user || !deletingLinkId || !isEditable) return

    try {
      await deleteDoc(doc(db, "users", user.uid, "links", deletingLinkId))
      setDeletingLinkId(null)
    } catch (err) {
      console.error("Error deleting link in personal firestore path:", err)
      alert("삭제 처리 중 문제가 발생했습니다.")
    }
  }

  // 인라인 편집 수정 시작
  const handleStartEdit = (link: FirestoreLinkItem) => {
    setEditingLinkId(link.id)
    setTempTitle(link.title)
    setTempUrl(link.url)
  }

  // 인라인 편집 취소
  const handleCancelEdit = () => {
    setEditingLinkId(null)
    setTempTitle("")
    setTempUrl("")
  }

  // 인라인 편집 저장
  const handleSaveEdit = async (id: string) => {
    if (!user || !isEditable) return
    if (!tempTitle.trim()) {
      alert("링크 제목을 입력해주세요.")
      return
    }
    if (!tempUrl.trim()) {
      alert("연결할 URL을 입력해주세요.")
      return
    }

    let correctedUrl = tempUrl.trim()
    if (!/^https?:\/\//i.test(correctedUrl)) {
      correctedUrl = `https://${correctedUrl}`
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "links", id), {
        title: tempTitle.trim(),
        url: correctedUrl,
      })
      
      setEditingLinkId(null)
      setTempTitle("")
      setTempUrl("")
    } catch (err) {
      console.error("Error saving inline edit:", err)
      alert("수정 내역을 저장하는 중 오류가 발생했습니다.")
    }
  }

  // 프로필 편집 필드 변경 (로컬 입력용)
  const handleLocalUpdateProfile = (field: "username" | "name" | "bio", value: string) => {
    // username의 경우 영어 소문자, 숫자, 언더바(_)만 허용하도록 정규식 처리
    if (field === "username") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "")
      setProfile(prev => ({ ...prev, username: sanitized }))
      
      // 실시간 간단 정합성 피드백
      if (sanitized.length < 3) {
        setUsernameError("식별자는 최소 3자 이상이어야 합니다.")
      } else {
        setUsernameError("")
      }
      return
    }

    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 프로필 정보 통합 일괄 저장 핸들러 (username 중복 검증 & 원자적 Batch 처리)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isEditable) return

    const sanitizedUsername = profile.username.trim()
    const sanitizedName = profile.name.trim()
    const sanitizedBio = profile.bio.trim()

    if (sanitizedUsername.length < 3) {
      setUsernameError("식별자는 최소 3자 이상이어야 합니다.")
      alert("식별자(username) 형식이 올바르지 않습니다.")
      return
    }
    if (!sanitizedName) {
      alert("표시 이름을 입력해 주세요.")
      return
    }

    setIsSavingProfile(true)
    setUsernameError("")

    try {
      // 1. 기존 DB의 내 고유 프로필 정보를 getDoc으로 조회하여 현재 저장되어 있던 기존 username 파악
      const profileRef = doc(db, "users", user.uid, "profile", "info")
      const currentProfileSnap = await getDoc(profileRef)
      
      let oldUsername = ""
      if (currentProfileSnap.exists()) {
        oldUsername = currentProfileSnap.data().username || ""
      }

      // 2. username이 변경되었을 경우에만 중복 검사 시행
      if (sanitizedUsername !== oldUsername) {
        const usernameRef = doc(db, "usernames", sanitizedUsername)
        const usernameSnap = await getDoc(usernameRef)
        
        if (usernameSnap.exists()) {
          // 중복 발견!
          setUsernameError("이미 다른 사용자가 사용 중인 식별자입니다.")
          alert("이미 사용 중인 식별자(username)입니다. 다른 이름으로 입력해주세요.")
          setIsSavingProfile(false)
          return
        }
      }

      // 3. 중복 없음이 확인되면, writeBatch를 가동하여 원자적(Atomic)으로 일괄 쓰기 수행
      const batch = writeBatch(db)

      // (A) 만약 username이 바뀌었고 기존에 oldUsername 점유 문서가 있었다면 이전 점유 문서 제거
      if (sanitizedUsername !== oldUsername) {
        if (oldUsername) {
          batch.delete(doc(db, "usernames", oldUsername))
        }
        // (B) 새 username 점유 문서 등록
        batch.set(doc(db, "usernames", sanitizedUsername), { uid: user.uid })
      }

      // (C) 프로필 본문 문서 정보 업데이트
      batch.set(profileRef, {
        username: sanitizedUsername,
        name: sanitizedName,
        bio: sanitizedBio,
        avatarUrl: profile.avatarUrl,
      }, { merge: true })

      await batch.commit()

      // 저장 성공 2초 녹색 성공 톤 피드백 활성화
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)

    } catch (err) {
      console.error("Error saving profile details:", err)
      alert("프로필 저장 중 시스템 에러가 발생했습니다.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // 링크 순서 위로 이동 (Up)
  const handleMoveUp = async (index: number) => {
    if (!user || index === 0 || !isEditable) return
    try {
      const batch = writeBatch(db)
      const currentLink = links[index]
      const targetLink = links[index - 1]

      if (!currentLink.createdAt || !targetLink.createdAt) return

      const currentRef = doc(db, "users", user.uid, "links", currentLink.id)
      const targetRef = doc(db, "users", user.uid, "links", targetLink.id)

      batch.update(currentRef, { createdAt: targetLink.createdAt })
      batch.update(targetRef, { createdAt: currentLink.createdAt })

      await batch.commit()
    } catch (err) {
      console.error("Error moving link up:", err)
    }
  }

  // 링크 순서 아래로 이동 (Down)
  const handleMoveDown = async (index: number) => {
    if (!user || index === links.length - 1 || !isEditable) return
    try {
      const batch = writeBatch(db)
      const currentLink = links[index]
      const targetLink = links[index + 1]

      if (!currentLink.createdAt || !targetLink.createdAt) return

      const currentRef = doc(db, "users", user.uid, "links", currentLink.id)
      const targetRef = doc(db, "users", user.uid, "links", targetLink.id)

      batch.update(currentRef, { createdAt: targetLink.createdAt })
      batch.update(targetRef, { createdAt: currentLink.createdAt })

      await batch.commit()
    } catch (err) {
      console.error("Error moving link down:", err)
    }
  }

  // 활성화된 링크만 필터링
  const activeLinks = links.filter((link) => link.isActive)

  // 테크 네온 터미널 아바타 컴포넌트
  const TechAvatar = ({ size = "lg", avatarUrl }: { size?: "sm" | "lg"; avatarUrl?: string }) => {
    const isLg = size === "lg"
    
    // 만약 전달받은 고해상도 아바타 URL이 있다면 직접 이미지 렌더링
    if (avatarUrl) {
      return (
        <div className={`relative ${
          isLg ? "w-18 h-18 sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"
        } rounded-full border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] overflow-hidden flex items-center justify-center bg-slate-955`}>
          <Image src={avatarUrl} alt="Branded Avatar" fill className="object-cover" />
        </div>
      )
    }

    return (
      <div className={`relative ${
        isLg ? "w-18 h-18 sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"
      } rounded-full bg-slate-955 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center overflow-hidden group/avatar`}>
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-955 via-zinc-900 to-cyan-950/20 dark:from-slate-955 dark:via-neutral-950 dark:to-cyan-950/30 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* 테크 배경 미세 그리드 패턴 장식 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* 글로벌 상단 헤더 바 (Google 소셜 로그인 버튼 탑재) */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg shadow-cyan-950/10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-mono font-bold text-lg border border-cyan-400/20">
            &gt;_
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2 font-mono">
              My Link <span className="text-[10px] font-sans bg-cyan-955/60 border border-cyan-500/30 text-cyan-400 font-semibold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.2)]">Dev Dashboard</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">구글 소셜 로그인을 통해 나만의 링크 빌더를 가동해 보세요</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 구글 소셜 로그인 / 로그아웃 & 프리미엄 프로필 드롭다운 인터페이스 (Wow Factor 4) */}
          {user ? (
            <div className="relative flex items-center border-l border-cyan-500/20 pl-3" ref={dropdownRef}>
              {/* 클릭 가능한 원형 아바타 버튼 */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`relative w-8 h-8 rounded-full overflow-hidden border transition-all duration-300 focus:outline-none cursor-pointer flex items-center justify-center bg-slate-955 ${
                  isDropdownOpen
                    ? "border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105"
                    : "border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                }`}
                title="프로필 메뉴 열기"
              >
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="User Photo" fill className="object-cover" />
                ) : (
                  <User className="w-full h-full text-cyan-400 p-1.5" />
                )}
              </button>

              {/* 하이엔드 테크 다크 글래스모피즘 드롭다운 박스 */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-11 w-64 bg-slate-955 border border-cyan-500/20 rounded-2xl p-4 shadow-[0_15px_35px_rgba(6,182,212,0.18)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* 프로필 정보 헤더 */}
                  <div className="flex flex-col items-start gap-1 pb-3 border-b border-cyan-500/10">
                    <span className="text-[10px] text-cyan-400 font-bold font-mono tracking-widest uppercase">
                      SYSTEM_USER_SESSION
                    </span>
                    <span className="text-xs text-slate-100 font-bold font-mono truncate max-w-full text-left" title={profile.name || "User"}>
                      {profile.name || "User"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-full text-left" title={user.email || ""}>
                      {user.email || "no-email@auth"}
                    </span>
                  </div>

                  {/* 클라우드 링크 데이터 실시간 지표 (Metrics) */}
                  <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-cyan-500/10 text-left">
                    <div className="bg-slate-900/50 border border-cyan-500/5 rounded-xl p-2.5 flex flex-col justify-center">
                      <span className="text-[9px] text-slate-500 font-bold font-mono">TOTAL_BLOCKS</span>
                      <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{links.length}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-cyan-500/5 rounded-xl p-2.5 flex flex-col justify-center">
                      <span className="text-[9px] text-slate-500 font-bold font-mono">ACTIVE_BLOCKS</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{activeLinks.length}</span>
                    </div>
                  </div>

                  {/* 고유 URL 원클릭 복사 영역 */}
                  <div className="py-3 border-b border-cyan-500/10">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-slate-500 font-bold font-mono tracking-tight text-left">PUBLIC_LANDING_URL</span>
                      <div className="flex items-center gap-1.5 bg-slate-900/80 border border-cyan-500/10 rounded-xl p-1.5 pl-2.5">
                        <span className="text-[9px] text-cyan-400/80 font-mono truncate flex-1 text-left">
                          mylink.dev/{profile.username || user.uid.slice(0, 8)}...
                        </span>
                        <button
                          onClick={handleCopyLink}
                          className={`cursor-pointer px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${
                            copied
                              ? "bg-emerald-950/30 border-emerald-500/35 text-emerald-400 animate-pulse"
                              : "bg-slate-950 border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:shadow-[0_0_6px_rgba(6,182,212,0.15)] active:scale-95"
                          }`}
                        >
                          {copied ? "COPIED" : "COPY"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 통합 숏컷 액션 (테마 변경 및 로그아웃) */}
                  <div className="flex flex-col gap-2 pt-3">
                    {/* 테마 슬라이드 토글 */}
                    <button
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="cursor-pointer w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/30 border border-cyan-500/5 hover:border-cyan-500/15 hover:bg-slate-900/60 transition-all text-slate-300 hover:text-cyan-400"
                    >
                      <span className="text-[10px] font-mono font-bold flex items-center gap-2">
                        {resolvedTheme === "dark" ? (
                          <>
                            <Sun className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            LIGHT_MODE_SWITCH
                          </>
                        ) : (
                          <>
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                            DARK_MODE_SWITCH
                          </>
                        )}
                      </span>
                      <span className="text-[8px] bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono px-2 py-0.5 rounded-full uppercase">
                        {resolvedTheme}
                      </span>
                    </button>

                    {/* 로그아웃 버튼 */}
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-955 border border-red-500/30 hover:border-red-400 hover:bg-red-950/15 text-red-400 text-[10px] font-mono font-bold transition-all active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.05)]"
                    >
                      LOGOUT_SESSION
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={handleGoogleLogin}
              className="cursor-pointer bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 text-[10px] font-mono font-bold h-8 px-3 rounded-lg shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
            >
              GOOGLE SIGN IN
            </Button>
          )}
        </div>
      </header>

      {/* 모바일 뷰 전용 네비게이션 탭 (소유자 편집 모드일 때만 노출) */}
      {isEditable && (
        <div className="flex md:hidden sticky top-[73px] z-30 border-b border-cyan-500/10 bg-slate-955/90 backdrop-blur-md px-4 py-2 gap-2">
          <button
            onClick={() => setActiveTab("edit")}
            disabled={!user}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300 font-mono disabled:opacity-40 disabled:pointer-events-none ${
              activeTab === "edit"
                ? "bg-cyan-500 text-slate-955 shadow-lg shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:bg-slate-900/50"
            }`}
          >
            <Edit3 className="w-4 h-4" /> &gt;_ 편집 모드
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300 font-mono ${
              activeTab === "preview"
                ? "bg-cyan-500 text-slate-955 shadow-lg shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:bg-slate-900/50"
            }`}
          >
            <Eye className="w-4 h-4" /> [모바일 프리뷰]
          </button>
        </div>
      )}

      {/* 대시보드 바디 (소유자 편집 권한 여부에 따라 2분할 대시보드 또는 1분할 전체화면 조회용 랜딩 페이지 렌더링) */}
      {!isEditable && targetUid ? (
        /* [V-A. 타인 계정 또는 로그인 안 된 특정 유저의 링크트리: 조회 전용 전체화면 랜딩 뷰] */
        <main className="flex-1 w-full h-[calc(100vh-73px)] flex items-center justify-center p-6 sm:p-12 overflow-y-auto z-10 animate-in fade-in duration-300">
          <div className="relative w-[300px] sm:w-[320px] h-[580px] sm:h-[620px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 shadow-[0_0_40px_rgba(6,182,212,0.18)] flex flex-col justify-between overflow-hidden ring-1 ring-cyan-500/20">
            {/* 다이내믹 아일랜드 노치 */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3 shadow-inner border border-slate-800">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-900 rounded-full" />
              </div>
              <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* 모바일 화면 콘텐츠 */}
            <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col pt-12 pb-6 px-4 bg-gradient-to-b from-slate-955 via-slate-900 to-slate-955">
              
              {/* 모바일 프로필 헤더 */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-18 h-18 rounded-full flex items-center justify-center border border-cyan-500/30 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.2)] bg-slate-950">
                  <TechAvatar size="sm" avatarUrl={profile.avatarUrl} />
                </div>
                <h3 className="mt-3 font-bold text-base text-slate-100 tracking-tight flex items-center gap-1 font-mono">
                  {profile.name || "dev_name"}
                </h3>
                {profile.username && (
                  <span className="text-[10px] text-cyan-400/80 font-mono font-semibold tracking-wider">
                    @{profile.username}
                  </span>
                )}
                <p className="mt-2 text-[11px] text-slate-400 max-w-[220px] leading-relaxed break-all font-mono">
                  {profile.bio || "no bio info loaded."}
                </p>
              </div>

              {/* 활성화된 모바일 링크 목록 */}
              <div className="flex-1 w-full flex flex-col gap-3">
                {activeLinks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 border border-cyan-500/10 rounded-xl">
                    <Atom className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                    <p className="text-[10px] text-slate-400 font-mono">
                      NO_ACTIVE_BLOCK_LOADED<br />조회 가능한 링크가 없습니다.
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
                      {/* 네온 글로우 테크 카드 */}
                      <Card className="flex flex-row items-center p-3 gap-3 w-full cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/10 hover:border-cyan-400/40 bg-slate-900/50 backdrop-blur-md shadow-lg">
                        {/* 아이콘 */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-955 border border-cyan-500/20 text-cyan-400 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
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
        </main>
      ) : (
        /* [V-B. 소유자 편집 모드 또는 비로그인 기본 데모 상태: 2분할 대시보드 가동] */
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row h-[calc(100vh-73px)] md:h-[calc(100vh-73px)] overflow-hidden z-10">
        
          {/* 1. 좌측 편집 패널 (로딩 / 비로그인 안내 / 로그인 편집 UI 3단계 구성) */}
          {loading ? (
            /* [A. 초기 로딩 화면] */
            <main className="flex-1 h-full flex flex-col items-center justify-center p-6 gap-3">
              <Cpu className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-500 font-mono animate-pulse">authorizing_system_session...</p>
            </main>
          ) : !user ? (
            /* [B. 비로그인 대시보드 안내 화면] (Wow Factor 5) */
            <main className="flex-1 h-full flex flex-col items-center justify-center p-8 lg:p-12 text-center bg-slate-950/20">
              <div className="max-w-md flex flex-col items-center gap-6 bg-slate-900/35 border border-cyan-500/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden ring-1 ring-cyan-500/10">
                
                {/* 장식용 네온 모듈 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-bl-full pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-200 font-mono tracking-tight">
                    build_system: access_denied
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    로그인 이후에 나만의 테크니컬 마이링크를 빌드하고 실시간으로 관리할 수 있습니다. 구글 간편 연동을 통해 나만의 소셜 채널을 세상에 배포해 보세요!
                  </p>
                  <div className="text-[10px] text-cyan-500/40 font-mono">
                    - 3초만에 구글 계정으로 안전하게 로그인 가능<br />
                    - 로그인 즉시 나만의 전용 UID 클라우드 공간 제공
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  className="w-full cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold font-mono py-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all group border-none"
                >
                  GOOGLE 소셜 로그인으로 시작하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </main>
          ) : (
            /* [C. 로그인 상태: 실제 개인화된 에디터 대시보드] */
            <main className={`flex-1 h-full overflow-y-auto p-6 lg:p-8 flex flex-col gap-8 ${
              activeTab === "edit" ? "block" : "hidden md:block"
            }`}>
              
              {/* A. 프로필 설정 카드 */}
              <form onSubmit={handleSaveProfile} className="bg-slate-900/40 backdrop-blur-md border border-cyan-500/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-slate-200 font-mono">system_branding_config</h2>
                  </div>
                  
                  {/* 정보 일괄 저장 버튼 */}
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className={`cursor-pointer font-bold font-mono text-xs px-5 py-2 h-9 rounded-xl transition-all duration-300 ${
                      profileSaved
                        ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 animate-pulse"
                        : "bg-cyan-500 hover:bg-cyan-600 text-slate-955 active:scale-95 shadow-md shadow-cyan-500/10 border-none"
                    }`}
                  >
                    {isSavingProfile ? "SAVING..." : profileSaved ? "✓ SAVED" : "SAVE PROFILE"}
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* 원형 아바타 (개인화된 구글 이미지 또는 템플릿 아바타 연동) */}
                  <div className="flex justify-center w-full md:w-auto md:pt-1">
                    <TechAvatar size="sm" avatarUrl={profile.avatarUrl} />
                  </div>

                  {/* 입력 필드 레이아웃 */}
                  <div className="flex-1 w-full grid gap-4">
                    {/* Username 필드 */}
                    <div className="grid gap-1.5 text-left">
                      <Label htmlFor="profile-username" className="text-xs text-cyan-400 font-semibold font-mono flex items-center gap-1.5">
                        PROMPT_USERNAME (공유 식별자 - 영문 소문자, 숫자, 언더바만 가능)
                      </Label>
                      <Input
                        id="profile-username"
                        value={profile.username}
                        onChange={(e) => handleLocalUpdateProfile("username", e.target.value.slice(0, 30))}
                        placeholder="예: devlog_john"
                        required
                        className="bg-slate-955/60 border-cyan-500/15 text-slate-200 focus-visible:border-cyan-400 font-mono text-sm placeholder:text-slate-600"
                      />
                      {usernameError ? (
                        <p className="text-[10px] text-red-400 font-mono mt-0.5 animate-pulse text-left">{usernameError}</p>
                      ) : (
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 text-left">
                          내 퍼블릭 랜딩 주소: {typeof window !== "undefined" ? window.location.origin : ""}/?uid={user?.uid}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* DisplayName 필드 */}
                      <div className="grid gap-1.5 text-left">
                        <Label htmlFor="profile-name" className="text-xs text-cyan-400 font-semibold font-mono">
                          DISPLAY_NAME (표시 이름 - 최대 40자)
                        </Label>
                        <Input
                          id="profile-name"
                          value={profile.name}
                          onChange={(e) => handleLocalUpdateProfile("name", e.target.value.slice(0, 40))}
                          placeholder="표시될 이름을 입력하세요"
                          required
                          className="bg-slate-955/60 border-cyan-500/15 text-slate-200 focus-visible:border-cyan-400 text-sm placeholder:text-slate-600"
                        />
                      </div>

                      {/* Bio 필드 */}
                      <div className="grid gap-1.5 text-left">
                        <Label htmlFor="profile-bio" className="text-xs text-cyan-400 font-semibold font-mono">
                          BIO_DESCRIPTION (한 줄 소개 - 최대 80자)
                        </Label>
                        <Input
                          id="profile-bio"
                          value={profile.bio}
                          onChange={(e) => handleLocalUpdateProfile("bio", e.target.value.slice(0, 80))}
                          placeholder="소개글을 입력하세요"
                          className="bg-slate-955/60 border-cyan-500/15 text-slate-200 focus-visible:border-cyan-400 text-sm placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </form>

              {/* B. 링크 블록 관리 패널 */}
              <section className="flex-1 flex flex-col gap-4 min-h-[300px]">
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-slate-200 font-mono">link_block_builder (Cloud DB)</h2>
                  </div>

                  {/* 링크 추가 다이얼로그 */}
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger render={
                      <Button className="cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold font-mono gap-1.5 px-4 py-2 h-9 rounded-xl shadow-md shadow-cyan-500/10 active:scale-95 transition-all duration-200 border-none" />
                    }>
                      <Plus className="w-4.5 h-4.5" /> ADD_NEW_BLOCK
                    </DialogTrigger>
                    
                    <DialogContent className="border border-cyan-500/20 bg-slate-955/95 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.2)] rounded-2xl max-w-sm">
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
                          <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold font-mono rounded-xl h-9 border-none">
                            CONFIRM
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* 링크 리스트 카드 */}
                {links.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-cyan-500/20 rounded-2xl bg-slate-955/30">
                    <FileText className="w-10 h-10 text-cyan-500/20 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-400 font-mono">database_is_empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-mono">
                      우측 상단의 "ADD_NEW_BLOCK" 버튼을 클릭하여 나만의 퍼스널 테크 바로가기 블록을 생성하세요.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {links.map((link, index) => {
                      const isEditing = link.id === editingLinkId

                      return (
                        <div
                          key={link.id}
                          className={`flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 bg-slate-900/35 backdrop-blur-xs border rounded-xl transition-all duration-200 group text-left ${
                            isEditing
                              ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-slate-900/60"
                              : "border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                          }`}
                        >
                          {/* 상하 이동 순서 제어기 */}
                          <div className="flex flex-row sm:flex-col gap-1 w-full sm:w-auto items-center justify-between sm:justify-center border-b sm:border-b-0 pb-2 sm:pb-0 border-slate-850">
                            <div className="flex items-center gap-1 sm:flex-col">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0 || isEditing}
                                className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-850 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="위로 이동"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === links.length - 1 || isEditing}
                                className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-850 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="아래로 이동"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* 아이콘 표시 */}
                            <div className="h-9 w-9 rounded-full bg-slate-955 border border-cyan-500/10 flex items-center justify-center shadow-xs">
                              {getIcon(link.icon)}
                            </div>
                          </div>

                          {/* 링크 정보 영역 (인라인 편집 분기) */}
                          <div className="flex-1 w-full grid gap-2">
                            {isEditing ? (
                              /* [편집 상태 뷰] */
                              <div className="grid gap-2">
                                <div className="grid gap-1">
                                  <Label className="text-[10px] text-cyan-400 font-mono font-semibold">BLOCK_TITLE (제목)</Label>
                                  <Input
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    placeholder="링크 제목"
                                    className="h-7 text-xs font-semibold bg-slate-955/80 border-cyan-500/30 text-slate-200 focus-visible:border-cyan-400 font-mono shadow-inner rounded-md px-2"
                                  />
                                </div>
                                <div className="grid gap-1">
                                  <Label className="text-[10px] text-cyan-400 font-mono font-semibold">TARGET_URL (연결 주소)</Label>
                                  <Input
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-7 text-xs bg-slate-955/80 border-cyan-500/30 text-cyan-400 focus-visible:border-cyan-400 font-mono shadow-inner rounded-md px-2"
                                  />
                                </div>
                              </div>
                            ) : (
                              /* [일반 상태 뷰] */
                              <div className="flex flex-col gap-1.5 text-left">
                                <h4 className="text-sm font-bold text-slate-200 font-mono transition-colors group-hover:text-cyan-400 leading-tight">
                                  {link.title}
                                </h4>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-cyan-400/80 hover:text-cyan-300 font-mono hover:underline inline-flex items-center gap-1.5 max-w-full truncate"
                                >
                                  <span className="truncate">{link.url}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* 노출 스위치 및 제어 버튼 영역 */}
                          <div className="flex items-center justify-between w-full sm:w-auto gap-3.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                            {isEditing ? (
                              /* [편집 상태 제어 버튼: 저장/취소] */
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button
                                  onClick={() => handleSaveEdit(link.id)}
                                  className="flex items-center justify-center p-2 rounded-lg bg-emerald-955/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-400 transition-all cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                                  title="저장"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
                                  title="취소"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              /* [일반 상태 제어 버튼: 수정/토글/삭제] */
                              <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end">
                                
                                {/* 인라인 수정 모드 진입 버튼 */}
                                <button
                                  onClick={() => handleStartEdit(link)}
                                  className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-900 transition-all cursor-pointer"
                                  title="링크 수정"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-bold font-mono">
                                    {link.isActive ? "ON" : "OFF"}
                                  </span>
                                  <Switch
                                    checked={link.isActive}
                                    onCheckedChange={() => handleToggleLink(link.id, link.isActive)}
                                    aria-label="Toggle link active state"
                                    className="data-checked:bg-cyan-500"
                                  />
                                </div>

                                {/* 삭제 버튼 */}
                                <button
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                                  title="링크 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </div>
                            )}
                          </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </main>
          )}

          {/* 2. 우측 실시간 모바일 프리뷰 (비로그인 데모 및 로그인 개인화 뷰가 완벽 작동) */}
          <aside className={`w-full md:w-[380px] lg:w-[420px] h-full items-center justify-center bg-slate-950/30 md:border-l border-cyan-500/10 p-6 md:p-8 flex-col ${
            activeTab === "preview" ? "flex" : "hidden md:flex"
          }`}>
            
            <div className="text-center mb-4 hidden md:block">
              <span className="text-[10px] bg-slate-900 border border-cyan-500/25 text-cyan-400 font-semibold font-mono px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <Cpu className="w-3.5 h-3.5 animate-spin" /> {user ? "LIVE_CLOUD_PERSONAL_SYNC" : "LIVE_CLOUD_DEMO_PREVIEW"}
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

              {/* 모바일 화면 상단 콘텐츠 */}
              <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col pt-12 pb-6 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                
                {/* 모바일 프로필 헤더 */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative w-18 h-18 rounded-full flex items-center justify-center border border-cyan-500/30 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.2)] bg-slate-950">
                    <TechAvatar size="sm" avatarUrl={profile.avatarUrl} />
                  </div>
                  <h3 className="mt-3 font-bold text-base text-slate-100 tracking-tight flex items-center gap-1 font-mono">
                    {profile.name || "dev_name"}
                  </h3>
                  {profile.username && (
                    <span className="text-[10px] text-cyan-400/80 font-mono font-semibold tracking-wider">
                      @{profile.username}
                    </span>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400 max-w-[220px] leading-relaxed break-all font-mono">
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
                        {/* 네온 글로우 테크 카드 */}
                        <Card className="flex flex-row items-center p-3 gap-3 w-full cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/10 hover:border-cyan-400/40 bg-slate-900/50 backdrop-blur-md shadow-lg">
                          
                          {/* 아이콘 */}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-955 border border-cyan-500/20 text-cyan-400 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
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
      )}

      {/* C. 실수 삭제 방지용 프리미엄 UX 삭제 확인 모달 */}
      <Dialog open={deletingLinkId !== null} onOpenChange={(open) => !open && setDeletingLinkId(null)}>
        <DialogContent className="border border-red-500/20 bg-slate-955/95 backdrop-blur-xl shadow-[0_0_35px_rgba(239,68,68,0.15)] rounded-2xl max-w-xs p-5">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-bounce">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            
            <DialogTitle className="text-base font-bold text-slate-100 font-mono border-b border-red-500/10 pb-1.5 w-full">
              system_warning: delete_block
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-center">
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              정말로 이 링크 block을 삭제하시겠습니까?
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 leading-snug">
              이 작업은 즉시 집행되며 되돌릴 수 없습니다.<br />모바일 랜딩 리스트에서도 즉각 반영 소멸됩니다.
            </p>
          </div>

          <DialogFooter className="flex sm:flex-row gap-2 pt-3 border-t border-slate-850 mt-3.5">
            <button
              onClick={() => setDeletingLinkId(null)}
              className="flex-1 py-2 text-xs font-bold font-mono rounded-xl bg-slate-900/60 border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 py-2 text-xs font-bold font-mono rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] border-none transition-all duration-200 active:scale-95 cursor-pointer"
            >
              DELETE
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-slate-955 flex flex-col items-center justify-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-mono animate-pulse">loading_application_runtime...</p>
      </div>
    }>
      <MyLinkApp />
    </Suspense>
  )
}
