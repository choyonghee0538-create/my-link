import { ImageResponse } from "next/og"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, getDocs, query, collectionGroup, where } from "firebase/firestore"

export const alt = "My Link Profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Google Fonts에서 TTF 폰트를 동적으로 가져오는 함수
async function getNotoSansKR() {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700`
  const css = await fetch(url, {
    headers: {
      // WOFF2 대신 TTF를 강제하기 위해 구형 User-Agent 사용
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text())

  // 700(Bold) 폰트 버퍼 파싱
  const boldResource = css.match(/font-weight: 700[\s\S]*?src: url\((.+?)\) format\('(opentype|truetype)'\)/)
  const regularResource = css.match(/font-weight: 400[\s\S]*?src: url\((.+?)\) format\('(opentype|truetype)'\)/)

  // 700 폰트 (메인)
  let fontData = null
  if (boldResource) {
    const response = await fetch(boldResource[1])
    if (response.status === 200) {
      fontData = await response.arrayBuffer()
    }
  }
  
  // 400 폰트를 못 찾으면 그냥 700 리턴
  if (!fontData) throw new Error("Failed to load font data")
  return fontData
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const fontData = await getNotoSansKR()
  const { username } = await params

  let userId = null
  let profile = { name: username, avatarUrl: "", bio: "" }
  let linksCount = 0

  try {
    // 1. Username으로 UID 조회
    const usernameRef = doc(db, "usernames", username)
    const usernameSnap = await getDoc(usernameRef)
    
    if (usernameSnap.exists()) {
      userId = usernameSnap.data().uid
    } else {
      const profileQuery = query(collectionGroup(db, "profile"), where("username", "==", username))
      const profileQuerySnap = await getDocs(profileQuery)
      if (!profileQuerySnap.empty) {
        userId = profileQuerySnap.docs[0].ref.parent.parent?.id
      }
    }

    // 2. 프로필 및 링크 통계 조회
    if (userId) {
      const profileRef = doc(db, "users", userId, "profile", "info")
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        const data = profileSnap.data()
        profile.name = data.name || username
        profile.avatarUrl = data.avatarUrl || ""
        profile.bio = data.bio || ""
      }

      const linksRef = collection(db, "users", userId, "links")
      const linksSnap = await getDocs(linksRef)
      linksSnap.forEach((docSnap) => {
        if (docSnap.data().isActive !== false) {
          linksCount++
        }
      })
    }
  } catch (error) {
    console.error("OG Image 데이터 조회 오류:", error)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#5B5FC7",
          color: "white",
          fontFamily: '"Noto Sans KR"',
        }}
      >
        {/* 장식용 우주적 원형 배경 패턴 */}
        <div
          style={{
            position: "absolute",
            top: -250,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        {/* 1. 프로필 이미지, 이름, 소개글 영역 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "100px",
                border: "8px solid rgba(255,255,255,0.2)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "200px",
                height: "200px",
                borderRadius: "100px",
                border: "8px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(0,0,0,0.3)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                fontSize: "80px",
                fontWeight: "bold",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1
            style={{
              fontSize: "64px",
              fontWeight: 700,
              marginTop: "40px",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
              textShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            {profile.name}
          </h1>

          {profile.bio && (
            <p
              style={{
                fontSize: "32px",
                color: "rgba(255,255,255,0.8)",
                margin: 0,
                marginBottom: "32px",
                textAlign: "center",
                maxWidth: "800px",
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* 2. 링크 뱃지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 32px",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "50px",
              border: "2px solid rgba(255,255,255,0.3)",
              fontSize: "28px",
              fontWeight: 700,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <span style={{ color: "#22d3ee", marginRight: "12px" }}>⚡</span>
            {linksCount}개의 링크 스페이스
          </div>
        </div>

        {/* 3. 하단 브랜드 로고 및 URL 영역 */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 60px",
            zIndex: 10,
          }}
        >
          {/* 로고 */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #06b6d4, #4f46e5)",
                borderRadius: "12px",
                fontSize: "24px",
                fontWeight: "bold",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
              }}
            >
              &gt;_
            </div>
            <span style={{ fontSize: "32px", fontWeight: 700 }}>마이링크</span>
          </div>

          {/* URL */}
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            mylink.dev/@{username}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  )
}
