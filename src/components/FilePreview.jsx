import { FileText, ImageIcon } from "lucide-react"

function FilePreview({ file, previewUrl }) {
  if (!file) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold">미리보기</h2>
        <p className="mt-3 text-sm text-zinc-500">
          업로드한 파일이 여기에 표시됩니다.
        </p>
      </section>
    )
  }

  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf"

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-zinc-600" />
        ) : (
          <FileText className="h-5 w-5 text-zinc-600" />
        )}
        <h2 className="text-base font-semibold">미리보기</h2>
      </div>

      <p className="mt-3 text-sm text-zinc-500">
        {file.name} · {formatFileSize(file.size)}
      </p>

      {isImage && previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <img
            className="max-h-[560px] w-full object-contain"
            src={previewUrl}
            alt="업로드한 영수증 미리보기"
          />
        </div>
      ) : null}

      {isPdf && previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <iframe
            className="h-[640px] w-full bg-white"
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            title="업로드한 PDF 영수증 미리보기"
          />
        </div>
      ) : null}
    </section>
  )
}

function formatFileSize(size) {
  if (!size) return "0 KB"

  const kilobytes = size / 1024
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`
}

export default FilePreview
