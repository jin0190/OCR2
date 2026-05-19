import { ArrowDown, ArrowUp, Download } from "lucide-react"

function ReceiptTable({
  receipts,
  selectedReceiptIds,
  sortConfig,
  onSort,
  onToggleReceipt,
  onToggleAll,
  onExportAll,
  onExportSelected,
}) {
  const allSelected =
    receipts.length > 0 &&
    receipts.every((receipt) => selectedReceiptIds.includes(receipt.id))

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">목록</h2>
          <p className="mt-1 text-sm text-zinc-500">
            전체 {receipts.length}건 · 선택 {selectedReceiptIds.length}건
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-300"
            type="button"
            disabled={receipts.length === 0}
            onClick={onExportAll}
          >
            <Download className="h-4 w-4" />
            전체 엑셀
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-300"
            type="button"
            disabled={selectedReceiptIds.length === 0}
            onClick={onExportSelected}
          >
            <Download className="h-4 w-4" />
            선택 엑셀
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="w-10 py-2 pr-3">
                <input
                  className="h-4 w-4"
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                />
              </th>
              <SortableHeader
                label="날짜"
                field="date"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <SortableHeader
                label="시간"
                field="time"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <SortableHeader
                label="상호명"
                field="storeName"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <SortableHeader
                align="right"
                label="금액"
                field="amount"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <th className="py-2 pl-3 font-medium">텍스트</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-zinc-500" colSpan="6">
                  저장된 항목이 없습니다.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-3">
                    <input
                      className="h-4 w-4"
                      type="checkbox"
                      checked={selectedReceiptIds.includes(receipt.id)}
                      onChange={() => onToggleReceipt(receipt.id)}
                    />
                  </td>
                  <td className="py-3 pr-3">{receipt.date || "-"}</td>
                  <td className="py-3 pr-3">{receipt.time || "-"}</td>
                  <td className="py-3 pr-3 font-medium">
                    {receipt.storeName || "-"}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {Number(receipt.amount || 0).toLocaleString()}원
                  </td>
                  <td className="max-w-[320px] truncate py-3 pl-3 text-zinc-500">
                    {receipt.rawText || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SortableHeader({ label, field, sortConfig, onSort, align = "left" }) {
  const isActive = sortConfig.field === field
  const Icon = sortConfig.direction === "asc" ? ArrowUp : ArrowDown

  return (
    <th className={`py-2 pr-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        className={`inline-flex items-center gap-1 rounded px-1 py-1 hover:bg-zinc-100 ${
          align === "right" ? "justify-end" : ""
        }`}
        type="button"
        onClick={() => onSort(field)}
      >
        <span>{label}</span>
        {isActive ? <Icon className="h-3.5 w-3.5" /> : null}
      </button>
    </th>
  )
}

export default ReceiptTable
