import { Download, Search } from "lucide-react"

function CombinationPanel({
  selectedReceipts,
  combinationResult,
  onFindCombination,
  onExportCombination,
}) {
  const selectedTotal = selectedReceipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount || 0),
    0,
  )

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">100만원 맞추기</h2>
          <p className="mt-1 text-sm text-zinc-500">
            선택 {selectedReceipts.length}건 · 합계{" "}
            {selectedTotal.toLocaleString()}원
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
            type="button"
            disabled={selectedReceipts.length === 0}
            onClick={onFindCombination}
          >
            <Search className="h-4 w-4" />
            찾기
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-300"
            type="button"
            disabled={!combinationResult || combinationResult.items.length === 0}
            onClick={onExportCombination}
          >
            <Download className="h-4 w-4" />
            엑셀
          </button>
        </div>
      </div>

      {combinationResult ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-900">
            {combinationResult.type === "exact"
              ? "정확히 1,000,000원"
              : "1,000,000원 미만 최대"}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            합계 {combinationResult.total.toLocaleString()}원
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2 pr-3 font-medium">날짜</th>
                  <th className="py-2 pr-3 font-medium">상호명</th>
                  <th className="py-2 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {combinationResult.items.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-zinc-200">
                    <td className="py-2 pr-3">{receipt.date || "-"}</td>
                    <td className="py-2 pr-3">{receipt.storeName || "-"}</td>
                    <td className="py-2 text-right">
                      {Number(receipt.amount || 0).toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          항목을 선택한 뒤 찾기를 누르세요.
        </p>
      )}
    </section>
  )
}

export default CombinationPanel
