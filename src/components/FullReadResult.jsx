import { Clipboard, Download } from "lucide-react"

function FullReadResult({ result }) {
  if (!result) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold">결과</h2>
        <p className="mt-3 text-sm text-zinc-500">
          파일을 올리고 읽기를 누르세요.
        </p>
      </section>
    )
  }

  function copyCleanedText() {
    navigator.clipboard.writeText(result.cleanedText || result.rawText || "")
  }

  function downloadText() {
    const blob = new Blob([result.cleanedText || result.rawText || ""], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "full-read.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">결과</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800"
            type="button"
            onClick={copyCleanedText}
          >
            <Clipboard className="h-4 w-4" />
            복사
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800"
            type="button"
            onClick={downloadText}
          >
            <Download className="h-4 w-4" />
            TXT
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextBlock title="원문" text={result.rawText} />
        <TextBlock title="정리본" text={result.cleanedText} />
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">수정 포인트</h3>
        {result.corrections?.length ? (
          <div className="mt-3 space-y-3">
            {result.corrections.map((item, index) => (
              <div
                className="rounded-md border border-zinc-200 bg-white p-3 text-sm"
                key={`${item.before}-${index}`}
              >
                <p className="text-zinc-500">전: {item.before}</p>
                <p className="mt-1 font-medium text-zinc-900">후: {item.after}</p>
                <p className="mt-1 text-zinc-600">{item.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">수정된 부분 없음</p>
        )}
      </div>
    </section>
  )
}

function TextBlock({ title, text }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <pre className="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {text || "-"}
      </pre>
    </div>
  )
}

export default FullReadResult
