export const mockOcrResponse = {
  rawText: `스타커피 강남점
서울시 강남구 테헤란로 123
2026-05-18 14:35
아메리카노 4,500
샌드위치 7,800
합계 12,300원
카드 승인 완료`,
}

export function requestMockOcr() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(mockOcrResponse)
    }, 500)
  })
}
