import { useEffect, useMemo, useState } from "react"
import { ScanText } from "lucide-react"
import CombinationPanel from "./components/CombinationPanel.jsx"
import FilePreview from "./components/FilePreview.jsx"
import FileUploader from "./components/FileUploader.jsx"
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

function App() {
  const [activeTab, setActiveTab] = useState("organize")
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedReceipt, setParsedReceipt] = useState(null)
  const [savedReceipts, setSavedReceipts] = useState([])
  const [selectedReceiptIds, setSelectedReceiptIds] = useState([])
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  })
  const [combinationResult, setCombinationResult] = useState(null)
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [ocrError, setOcrError] = useState("")

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

  function handleFileSelect(file) {
    setSelectedFile(file)
    setParsedReceipt(null)
    setOcrError("")
  }

  async function handleRunOcr() {
    if (!selectedFile) return

    setIsOcrLoading(true)
    setOcrError("")

    try {
      const response = await requestOcr(selectedFile)
      setParsedReceipt(response)
    } catch (error) {
      setOcrError(error.message)
    } finally {
      setIsOcrLoading(false)
    }
  }

  function handleSaveReceipt() {
    if (!parsedReceipt) return

    setSavedReceipts((currentReceipts) => [
      {
        ...parsedReceipt,
        id: crypto.randomUUID(),
        fileName: selectedFile?.name || "",
        savedAt: new Date().toISOString(),
      },
      ...currentReceipts,
    ])
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
    setSelectedReceiptIds((currentIds) => {
      if (currentIds.includes(receiptId)) {
        return currentIds.filter((id) => id !== receiptId)
      }

      return [...currentIds, receiptId]
    })
  }

  function handleToggleAll() {
    setSelectedReceiptIds((currentIds) => {
      const sortedIds = sortedReceipts.map((receipt) => receipt.id)
      const allSelected =
        sortedIds.length > 0 && sortedIds.every((id) => currentIds.includes(id))

      if (allSelected) {
        return currentIds.filter((id) => !sortedIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...sortedIds]))
    })
  }

  function handleExportAllReceipts() {
    exportReceiptsToExcel(sortedReceipts, "ocr-list.xlsx")
  }

  function handleExportSelectedReceipts() {
    exportReceiptsToExcel(selectedReceipts, "selected-ocr-list.xlsx")
  }

  function handleFindCombination() {
    setCombinationResult(findBestCombination(selectedReceipts))
  }

  function handleExportCombination() {
    exportCombinationToExcel(combinationResult, "ocr-combination.xlsx")
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
                <li>파일 업로드 → OCR → 수정 → 저장</li>
                <li>정리, 전체 읽기, 엑셀 다운로드</li>
              </ul>
            </div>
            <TabNav activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </header>

        {activeTab === "organize" ? (
          <>
            <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="flex flex-col gap-5">
                <FileUploader
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                />

                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <ScanText className="h-5 w-5 text-zinc-600" />
                    <h2 className="text-base font-semibold">OCR</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {isApiProxyEnabled()
                      ? "업로드한 파일을 읽어 JSON으로 정리합니다."
                      : "로컬 실행 중입니다. mock 데이터로 확인합니다."}
                  </p>
                  <button
                    className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                    type="button"
                    disabled={!selectedFile || isOcrLoading}
                    onClick={handleRunOcr}
                  >
                    {isOcrLoading ? "처리 중" : "OCR 실행"}
                  </button>
                  {ocrError ? (
                    <p className="mt-3 rounded-md bg-red-50 p-3 text-sm leading-6 text-red-700">
                      {ocrError}
                    </p>
                  ) : null}
                </section>
              </div>

              <div className="flex flex-col gap-5">
                <FilePreview file={selectedFile} previewUrl={previewUrl} />

                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h2 className="text-base font-semibold">요약</h2>
                  {parsedReceipt ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <Info label="날짜" value={parsedReceipt.date} />
                      <Info label="시간" value={parsedReceipt.time} />
                      <Info label="상호명" value={parsedReceipt.storeName} />
                      <Info
                        label="금액"
                        value={`${Number(parsedReceipt.amount || 0).toLocaleString()}원`}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-zinc-500">
                      OCR 실행 후 결과가 표시됩니다.
                    </p>
                  )}
                </section>

                <OcrEditor
                  receipt={parsedReceipt}
                  onChange={setParsedReceipt}
                  onSave={handleSaveReceipt}
                />
              </div>
            </section>

            <ReceiptTable
              receipts={sortedReceipts}
              selectedReceiptIds={selectedReceiptIds}
              sortConfig={sortConfig}
              onSort={handleSort}
              onToggleReceipt={handleToggleReceipt}
              onToggleAll={handleToggleAll}
              onExportAll={handleExportAllReceipts}
              onExportSelected={handleExportSelectedReceipts}
            />

            <CombinationPanel
              selectedReceipts={selectedReceipts}
              combinationResult={combinationResult}
              onFindCombination={handleFindCombination}
              onExportCombination={handleExportCombination}
            />
          </>
        ) : (
          <FullReadPage />
        )}
      </div>
    </main>
  )
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
