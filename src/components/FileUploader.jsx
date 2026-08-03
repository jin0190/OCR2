import { Upload } from "lucide-react"

function FileUploader({
  selectedFile,
  selectedFiles = [],
  multiple = false,
  onFileSelect,
  onFilesSelect,
}) {
  function handleChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (multiple) {
      onFilesSelect(files)
    } else {
      onFileSelect(files[0])
    }

    event.target.value = ""
  }

  const fileCount = multiple ? selectedFiles.length : selectedFile ? 1 : 0

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-zinc-600" />
        <h2 className="text-base font-semibold">업로드</h2>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center transition hover:border-zinc-500 hover:bg-zinc-50">
        <span className="text-sm font-medium text-zinc-800">
          {multiple ? "이미지 또는 PDF 여러 개 선택" : "이미지 또는 PDF 선택"}
        </span>
        <span className="mt-1 text-xs text-zinc-500">
          PNG, JPG, JPEG, WebP, PDF 지원
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          multiple={multiple}
          onChange={handleChange}
        />
      </label>

      {fileCount > 0 ? (
        <p className="mt-3 text-sm text-zinc-600">
          선택:{" "}
          <span className="font-medium">
            {multiple ? `${fileCount}개 파일` : selectedFile.name}
          </span>
        </p>
      ) : null}
    </section>
  )
}

export default FileUploader
