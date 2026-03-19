import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-900">
        {/* Header/Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="relative px-8 pb-12">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-8 h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-gray-200 shadow-md dark:border-zinc-900">
            <div className="flex h-full w-full items-center justify-center bg-gray-300 text-4xl text-gray-600">
              👤
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-20">
            <h1 className="text-3xl font-bold tracking-tight">홍길동 (Hong Gil-dong)</h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-zinc-400 font-medium">Full-stack Developer & UI Designer</p>
            
            <p className="mt-4 max-w-prose leading-relaxed text-gray-700 dark:text-zinc-300">
              안녕하세요! 저는 사용자 경험을 중요하게 생각하는 개발자입니다. 
              Next.js와 TypeScript를 활용하여 빠르고 확장성 있는 웹 애플리케이션을 만드는 것을 즐깁니다.
            </p>
          </div>

          {/* Skills */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"].map((skill) => (
                <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://github.com"
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              GitHub 팔로우
            </a>
            <a
              href="mailto:contact@example.com"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold transition-all hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              이메일 보내기
            </a>
          </div>
        </div>
      </main>
      
      <footer className="mt-8 text-sm text-gray-500 dark:text-zinc-500">
        © 2024 Profile Page. Built with Next.js
      </footer>
    </div>
  );
}
