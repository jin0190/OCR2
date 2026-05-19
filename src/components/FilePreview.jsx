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

  const isPng = file.type === "image/png"
  const isPdf = file.type === "application/pdf"

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {isPng ? (
          <ImageIcon className="h-5 w-5 text-zinc-600" />
        ) : (
          <FileText className="h-5 w-5 text-zinc-600" />
        )}
        <h2 className="text-base font-semibold">미리보기</h2>
      </div>

      {isPng && previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <img
            className="max-h-[520px] w-full object-contain"
            src={previewUrl}
            alt="업로드한 영수증 미리보기"
          />
        </div>
      ) : null}

      {isPdf ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-800">{file.name}</p>
          <p className="mt-1 text-sm text-zinc-500">
            PDF 미리보기는 다음 단계에서 필요하면 추가하고, 지금은 업로드 상태만
            표시합니다.
          </p>
        </div>
      ) : null}
    </section>
  )
}

export default FilePreview
