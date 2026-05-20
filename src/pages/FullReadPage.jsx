import { useEffect, useMemo, useState } from "react"
import { ScanLine } from "lucide-react"
import FilePreview from "../components/FilePreview.jsx"
import FileUploader from "../components/FileUploader.jsx"
import FullReadResult from "../components/FullReadResult.jsx"
import {
  isFullReadApiEnabled,
  requestFullRead,
} from "../lib/fullReadClient.js"

function FullReadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const previewUrl = useMemo(() => {
    if (!selectedFile) return ""
    if (
      !selectedFile.type.startsWith("image/") &&
      selectedFile.type !== "application/pdf"
    ) {
      return ""
    }

    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileSelect(file) {
    setSelectedFile(file)
    setResult(null)
    setError("")
  }

  async function handleRead() {
    if (!selectedFile) return

    setIsLoading(true)
    setError("")

    try {
      setResult(await requestFullRead(selectedFile))
    } catch (readError) {
      setError(readError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-5">
        <FileUploader selectedFile={selectedFile} onFileSelect={handleFileSelect} />

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-zinc-600" />
            <h2 className="text-base font-semibold">전체 읽기</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {isFullReadApiEnabled()
              ? "문서 전체를 읽고 정리본을 만듭니다."
              : "로컬 실행 중입니다. mock 데이터로 확인합니다."}
          </p>
          <button
            className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
            type="button"
            disabled={!selectedFile || isLoading}
            onClick={handleRead}
          >
            {isLoading ? "읽는 중" : "읽기"}
          </button>
          {error ? (
            <p className="mt-3 rounded-md bg-red-50 p-3 text-sm leading-6 text-red-700">
              {error}
            </p>
          ) : null}
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <FilePreview file={selectedFile} previewUrl={previewUrl} />
        <FullReadResult result={result} />
      </div>
    </section>
  )
}

export default FullReadPage
