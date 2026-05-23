import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

// 웹 앱의 파이어베이스 설정 객체 (환경 변수 매핑)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Next.js SSR/핫리로드 환경에서 중복 초기화를 막기 위한 싱글톤 디자인 패턴
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// 파이어베이스 제품군 모듈 인스턴스 초기화
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Analytics 런타임 세이프 가드 (브라우저 환경 검증 및 지원 모듈 확인)
let analytics: ReturnType<typeof getAnalytics> | null = null
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics is not supported in this environment:", err)
    })
}

export { app, auth, db, storage, analytics }
export default app
