import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"
export const alt = "My Link Profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Google Fonts에서 TTF 폰트를 동적으로 가져오는 함수
async function getNotoSansKR() {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700`
  const css = await fetch(url, {
    headers: {
      // WOFF2 대신 TTF를 강제하기 위해 구형 User-Agent 사용
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text())

  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status === 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error("Failed to load font data")
}

export default async function Image({
  params,
}: {
  params: { username: string }
}) {
  const fontData = await getNotoSansKR()
  const username = params.username

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
        {/* 장식용 원형 패턴 */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />

        {/* 로고 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #06b6d4, #4f46e5)",
              borderRadius: "24px",
              fontSize: "48px",
              fontWeight: "bold",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            &gt;_
          </div>
          <h1
            style={{
              fontSize: "80px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              textShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            마이링크
          </h1>
        </div>

        {/* 유저 이름 (Username) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 60px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "100px",
            border: "2px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#22d3ee", // cyan-400
              marginRight: "8px",
            }}
          >
            @
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {username}
          </span>
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
