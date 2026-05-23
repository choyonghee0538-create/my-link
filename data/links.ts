export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean; // PRD 내 '노출 활성화 토글' 반영
}

export const dummyLinks: LinkItem[] = [
  {
    id: "1",
    title: "인스타그램",
    url: "https://instagram.com",
    icon: "instagram",
    isActive: true,
  },
  {
    id: "2",
    title: "유튜브",
    url: "https://youtube.com",
    icon: "youtube",
    isActive: true,
  },
  {
    id: "3",
    title: "블로그",
    url: "https://blog.naver.com",
    icon: "book-open",
    isActive: true,
  },
  {
    id: "4",
    title: "깃허브",
    url: "https://github.com",
    icon: "github",
    isActive: true,
  },
];
