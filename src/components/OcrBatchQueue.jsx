import { Check, LoaderCircle, RefreshCw, Trash2 } from "lucide-react"

const STATUS_LABELS = {
  queued: "대기",
  processing: "처리 중",
  review: "검토",
  saved: "저장됨",
  failed: "실패",
}

function OcrBatchQueue({
  jobs,
  activeJobId,
  onSelect,
  onToggleApproval,
  onRetry,
  onRemove,
  onSaveApproved,
}) {
  if (jobs.length === 0) return null

  const approvableCount = jobs.filter(
    (job) => job.status === "review" && job.approved,
  ).length

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">OCR 작업 목록</h2>
          <p className="mt-1 text-sm text-zinc-500">
            전체 {jobs.length}개 · 승인 대기 {approvableCount}개
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
          type="button"
          disabled={approvableCount === 0}
          onClick={onSaveApproved}
        >
          <Check className="h-4 w-4" />
          승인 항목 일괄 저장
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="w-12 py-2 pr-3 font-medium">승인</th>
              <th className="py-2 pr-3 font-medium">파일</th>
              <th className="py-2 pr-3 font-medium">상태</th>
              <th className="py-2 pr-3 font-medium">날짜</th>
              <th className="py-2 pr-3 font-medium">시간</th>
              <th className="py-2 pr-3 font-medium">상호명</th>
              <th className="py-2 pr-3 text-right font-medium">금액</th>
              <th className="w-24 py-2 text-right font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const needsReview =
                job.status === "review" &&
                (!job.result?.amount || !job.result?.storeName)

              return (
                <tr
                  className={`cursor-pointer border-b border-zinc-100 ${
                    activeJobId === job.id ? "bg-zinc-50" : "hover:bg-zinc-50"
                  }`}
                  key={job.id}
                  onClick={() => onSelect(job.id)}
                >
                  <td className="py-3 pr-3" onClick={(event) => event.stopPropagation()}>
                    <input
                      aria-label={`${job.file.name} 승인`}
                      className="h-4 w-4"
                      type="checkbox"
                      disabled={job.status !== "review"}
                      checked={job.approved}
                      onChange={() => onToggleApproval(job.id)}
                    />
                  </td>
                  <td className="max-w-64 truncate py-3 pr-3 font-medium">
                    {job.file.name}
                    {job.error ? (
                      <p className="mt-1 truncate text-xs font-normal text-red-600">
                        {job.error}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">
                    <span className={needsReview ? "font-medium text-amber-700" : "text-zinc-600"}>
                      {job.status === "processing" ? (
                        <LoaderCircle className="mr-1 inline h-4 w-4 animate-spin" />
                      ) : null}
                      {needsReview ? "확인 필요" : STATUS_LABELS[job.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pr-3">
                    {job.result?.date || "-"}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-3">
                    {job.result?.time || "-"}
                  </td>
                  <td className="max-w-52 truncate py-3 pr-3">
                    {job.result?.storeName || "-"}
                  </td>
                  <td className={`py-3 pr-3 text-right ${!job.result?.amount && job.status === "review" ? "font-semibold text-amber-700" : ""}`}>
                    {job.result ? `${Number(job.result.amount || 0).toLocaleString()}원` : "-"}
                  </td>
                  <td className="py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    {job.status === "failed" ? (
                      <button
                        aria-label={`${job.file.name} 재시도`}
                        className="rounded p-2 text-zinc-600 hover:bg-zinc-100"
                        type="button"
                        onClick={() => onRetry(job.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      aria-label={`${job.file.name} 제거`}
                      className="rounded p-2 text-zinc-600 hover:bg-zinc-100 disabled:text-zinc-300"
                      type="button"
                      disabled={job.status === "processing"}
                      onClick={() => onRemove(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default OcrBatchQueue
