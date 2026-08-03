import { useEffect, useMemo, useState } from "react"
import { ScanText } from "lucide-react"
import CombinationPanel from "./components/CombinationPanel.jsx"
import FilePreview from "./components/FilePreview.jsx"
import FileUploader from "./components/FileUploader.jsx"
import OcrBatchQueue from "./components/OcrBatchQueue.jsx"
import OcrEditor from "./components/OcrEditor.jsx"
import ReceiptTable from "./components/ReceiptTable.jsx"
import TabNav from "./components/TabNav.jsx"
import FullReadPage from "./pages/FullReadPage.jsx"
import {
  exportCombinationToExcel,
  exportReceiptsToExcel,
} from "./lib/exportExcel.js"
import { findBestCombination } from "./lib/findCombination.js"
import { isApiProxyEnabled, requestOcr } from "./lib/ocrClient.js"

const OCR_CONCURRENCY = 4
const OCR_MODELS = [
  { id: "gpt-5-mini", label: "GPT-5 mini", note: "기본·저비용" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", note: "고성능·고비용" },
]

function App() {
  const [activeTab, setActiveTab] = useState("organize")
  const [selectedModel, setSelectedModel] = useState("gpt-5-mini")
  const [ocrJobs, setOcrJobs] = useState([])
  const [activeJobId, setActiveJobId] = useState("")
  const [savedReceipts, setSavedReceipts] = useState([])
  const [selectedReceiptIds, setSelectedReceiptIds] = useState([])
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  })
  const [combinationResult, setCombinationResult] = useState(null)

  const activeJob = useMemo(
    () => ocrJobs.find((job) => job.id === activeJobId) || ocrJobs[0] || null,
    [activeJobId, ocrJobs],
  )

  const previewUrl = useMemo(() => {
    if (!activeJob?.file) return ""
    return URL.createObjectURL(activeJob.file)
  }, [activeJob?.file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const queuedCount = ocrJobs.filter((job) => job.status === "queued").length
  const isOcrLoading = ocrJobs.some((job) => job.status === "processing")

  const sortedReceipts = useMemo(() => {
    return [...savedReceipts].sort((first, second) => {
      const firstValue = first[sortConfig.field] || ""
      const secondValue = second[sortConfig.field] || ""

      if (sortConfig.field === "amount") {
        return sortConfig.direction === "asc"
          ? Number(firstValue) - Number(secondValue)
          : Number(secondValue) - Number(firstValue)
      }

      const result = String(firstValue).localeCompare(String(secondValue), "ko")
      return sortConfig.direction === "asc" ? result : -result
    })
  }, [savedReceipts, sortConfig])

  const selectedReceipts = useMemo(() => {
    return savedReceipts.filter((receipt) =>
      selectedReceiptIds.includes(receipt.id),
    )
  }, [savedReceipts, selectedReceiptIds])

  useEffect(() => {
    setCombinationResult(null)
  }, [selectedReceiptIds])

  function handleFilesSelect(files) {
    const existingKeys = new Set(
      ocrJobs.map((job) => getFileKey(job.file)),
    )
    const newJobs = files
      .filter((file) => !existingKeys.has(getFileKey(file)))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "queued",
        result: null,
        error: "",
        approved: false,
        retryCount: 0,
      }))

    if (newJobs.length === 0) return

    setOcrJobs((currentJobs) => [...currentJobs, ...newJobs])
    setActiveJobId((currentId) => currentId || newJobs[0].id)
  }

  async function handleRunOcr() {
    if (isOcrLoading) return

    const pendingJobs = ocrJobs.filter((job) => job.status === "queued")
    if (pendingJobs.length === 0) return

    const pendingIds = new Set(pendingJobs.map((job) => job.id))
    setOcrJobs((currentJobs) =>
      currentJobs.map((job) =>
        pendingIds.has(job.id)
          ? { ...job, status: "processing", error: "" }
          : job,
      ),
    )

    let nextIndex = 0
    async function worker() {
      while (nextIndex < pendingJobs.length) {
        const job = pendingJobs[nextIndex]
        nextIndex += 1
        await processJob(job)
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(OCR_CONCURRENCY, pendingJobs.length) },
        () => worker(),
      ),
    )
  }

  async function processJob(job) {
    try {
      const result = await requestOcr(job.file, selectedModel)
      const approved = Boolean(result.amount && result.storeName)
      setOcrJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === job.id
            ? {
                ...currentJob,
                status: "review",
                result,
                error: "",
                approved,
              }
            : currentJob,
        ),
      )
    } catch (error) {
      setOcrJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === job.id
            ? {
                ...currentJob,
                status: "failed",
                error: error.message,
                approved: false,
              }
            : currentJob,
        ),
      )
    }
  }

  async function handleRetry(jobId) {
    const job = ocrJobs.find((item) => item.id === jobId)
    if (!job || job.status === "processing") return

    setOcrJobs((currentJobs) =>
      currentJobs.map((currentJob) =>
        currentJob.id === jobId
          ? {
              ...currentJob,
              status: "processing",
              error: "",
              retryCount: currentJob.retryCount + 1,
            }
          : currentJob,
      ),
    )
    await processJob(job)
  }

  function handleUpdateActiveResult(result) {
    if (!activeJob) return
    setOcrJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === activeJob.id
          ? {
              ...job,
              result,
              approved: Boolean(result.amount && result.storeName),
            }
          : job,
      ),
    )
  }

  function handleToggleApproval(jobId) {
    setOcrJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId ? { ...job, approved: !job.approved } : job,
      ),
    )
  }

  function handleRemoveJob(jobId) {
    setOcrJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId))
    if (activeJobId === jobId) {
      const nextJob = ocrJobs.find((job) => job.id !== jobId)
      setActiveJobId(nextJob?.id || "")
    }
  }

  function handleSaveActiveReceipt() {
    if (!activeJob?.result || activeJob.status !== "review") return
    saveJobs([activeJob])
  }

  function handleSaveApproved() {
    const approvedJobs = ocrJobs.filter(
      (job) => job.status === "review" && job.approved && job.result,
    )
    saveJobs(approvedJobs)
  }

  function saveJobs(jobs) {
    if (jobs.length === 0) return
    const savedAt = new Date().toISOString()
    const jobIds = new Set(jobs.map((job) => job.id))

    setSavedReceipts((currentReceipts) => [
      ...jobs.map((job) => ({
        ...job.result,
        id: crypto.randomUUID(),
        fileName: job.file.name,
        sourceJobId: job.id,
        savedAt,
      })),
      ...currentReceipts,
    ])
    setOcrJobs((currentJobs) =>
      currentJobs.map((job) =>
        jobIds.has(job.id)
          ? { ...job, status: "saved", approved: false }
          : job,
      ),
    )
  }

  function handleSort(field) {
    setSortConfig((currentConfig) => {
      if (currentConfig.field !== field) {
        return { field, direction: "asc" }
      }
      return {
        field,
        direction: currentConfig.direction === "asc" ? "desc" : "asc",
      }
    })
  }

  function handleToggleReceipt(receiptId) {
    setSelectedReceiptIds((currentIds) =>
      currentIds.includes(receiptId)
        ? currentIds.filter((id) => id !== receiptId)
        : [...currentIds, receiptId],
    )
  }

  function handleToggleAll() {
    setSelectedReceiptIds((currentIds) => {
      const sortedIds = sortedReceipts.map((receipt) => receipt.id)
      const allSelected =
        sortedIds.length > 0 && sortedIds.every((id) => currentIds.includes(id))
      return allSelected
        ? currentIds.filter((id) => !sortedIds.includes(id))
        : Array.from(new Set([...currentIds, ...sortedIds]))
    })
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-sm font-medium text-zinc-500">OCR Manager</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">OCR 정리</h1>
              <ul className="mt-3 space-y-1 text-sm leading-6 text-zinc-600">
                <li>여러 파일 업로드 → 일괄 OCR → 검토 → 저장</li>
                <li>정리, 전체 읽기, 엑셀 다운로드</li>
              </ul>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-500">
                  OCR 모델
                </span>
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 outline-none focus:border-zinc-900"
                  value={selectedModel}
                  disabled={isOcrLoading}
                  onChange={(event) => setSelectedModel(event.target.value)}
                >
                  {OCR_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label} · {model.note}
                    </option>
                  ))}
                </select>
              </label>
              <TabNav activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </div>
        </header>

        {activeTab === "organize" ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="flex flex-col gap-5">
                <FileUploader
                  multiple
                  selectedFiles={ocrJobs.map((job) => job.file)}
                  onFilesSelect={handleFilesSelect}
                />

                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <ScanText className="h-5 w-5 text-zinc-600" />
                    <h2 className="text-base font-semibold">일괄 OCR</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {isApiProxyEnabled()
                      ? `최대 ${OCR_CONCURRENCY}개씩 처리합니다.`
                      : "로컬 실행 중입니다. mock 데이터로 확인합니다."}
                  </p>
                  <button
                    className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                    type="button"
                    disabled={queuedCount === 0 || isOcrLoading}
                    onClick={handleRunOcr}
                  >
                    {isOcrLoading
                      ? "처리 중"
                      : queuedCount > 0
                        ? `${queuedCount}개 OCR 실행`
                        : "대기 파일 없음"}
                  </button>
                </section>
              </div>

              <div className="flex flex-col gap-5">
                <FilePreview file={activeJob?.file} previewUrl={previewUrl} />

                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h2 className="text-base font-semibold">선택 결과</h2>
                  {activeJob?.result ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <Info label="날짜" value={activeJob.result.date} />
                      <Info label="시간" value={activeJob.result.time} />
                      <Info label="상호명" value={activeJob.result.storeName} />
                      <Info
                        label="금액"
                        value={`${Number(activeJob.result.amount || 0).toLocaleString()}원`}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-zinc-500">
                      작업 목록에서 파일을 선택하면 결과가 표시됩니다.
                    </p>
                  )}
                </section>

                <OcrEditor
                  receipt={activeJob?.result}
                  onChange={handleUpdateActiveResult}
                  onSave={handleSaveActiveReceipt}
                />
              </div>
            </section>

            <OcrBatchQueue
              jobs={ocrJobs}
              activeJobId={activeJob?.id || ""}
              onSelect={setActiveJobId}
              onToggleApproval={handleToggleApproval}
              onRetry={handleRetry}
              onRemove={handleRemoveJob}
              onSaveApproved={handleSaveApproved}
            />

            <ReceiptTable
              receipts={sortedReceipts}
              selectedReceiptIds={selectedReceiptIds}
              sortConfig={sortConfig}
              onSort={handleSort}
              onToggleReceipt={handleToggleReceipt}
              onToggleAll={handleToggleAll}
              onExportAll={() => exportReceiptsToExcel(sortedReceipts, "ocr-list.xlsx")}
              onExportSelected={() => exportReceiptsToExcel(selectedReceipts, "selected-ocr-list.xlsx")}
            />

            <CombinationPanel
              selectedReceipts={selectedReceipts}
              combinationResult={combinationResult}
              onFindCombination={() => setCombinationResult(findBestCombination(selectedReceipts))}
              onExportCombination={() => exportCombinationToExcel(combinationResult, "ocr-combination.xlsx")}
            />
          </>
        ) : (
          <FullReadPage model={selectedModel} />
        )}
      </div>
    </main>
  )
}

function getFileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
        {value || "-"}
      </p>
    </div>
  )
}

export default App
