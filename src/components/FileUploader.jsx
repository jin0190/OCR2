import { Upload } from "lucide-react"

function FileUploader({ selectedFile, onFileSelect }) {
  function handleChange(event) {
    const file = event.target.files[0]
    if (!file) return

    onFileSelect(file)
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-zinc-600" />
        <h2 className="text-base font-semibold">파일 업로드</h2>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center transition hover:border-zinc-500 hover:bg-zinc-50">
        <span className="text-sm font-medium text-zinc-800">
          PNG 또는 PDF 파일 선택
        </span>
        <span className="mt-1 text-xs text-zinc-500">
          업로드한 파일은 미리보기 후 OCR로 처리할 수 있습니다.
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/png,application/pdf"
          onChange={handleChange}
        />
      </label>

      {selectedFile ? (
        <p className="mt-3 text-sm text-zinc-600">
          선택됨: <span className="font-medium">{selectedFile.name}</span>
        </p>
      ) : null}
    </section>
  )
}

export default FileUploader
