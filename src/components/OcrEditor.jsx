import { Save } from "lucide-react"

function OcrEditor({ receipt, onChange, onSave }) {
  if (!receipt) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold">수정</h2>
        <p className="mt-3 text-sm text-zinc-500">OCR 결과가 없습니다.</p>
      </section>
    )
  }

  function updateField(field, value) {
    onChange({
      ...receipt,
      [field]: field === "amount" ? Number(value.replaceAll(",", "")) || "" : value,
    })
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">수정</h2>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          type="button"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="날짜"
          type="date"
          value={receipt.date}
          onChange={(value) => updateField("date", value)}
        />
        <Field
          label="시간"
          type="time"
          value={receipt.time}
          onChange={(value) => updateField("time", value)}
        />
        <Field
          label="상호명"
          type="text"
          value={receipt.storeName}
          onChange={(value) => updateField("storeName", value)}
        />
        <Field
          label="금액"
          type="text"
          value={receipt.amount ? receipt.amount.toLocaleString() : ""}
          onChange={(value) => updateField("amount", value)}
        />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-zinc-700">전체 텍스트</span>
        <textarea
          className="mt-2 min-h-52 w-full resize-y rounded-md border border-zinc-300 px-3 py-2 text-sm leading-6 outline-none focus:border-zinc-900"
          value={receipt.rawText}
          onChange={(event) => updateField("rawText", event.target.value)}
        />
      </label>
    </section>
  )
}

function Field({ label, type, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default OcrEditor
