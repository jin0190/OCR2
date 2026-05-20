function TabNav({ activeTab, onChange }) {
  const tabs = [
    { id: "organize", label: "정리" },
    { id: "full-read", label: "전체 읽기" },
  ]

  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.id
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          }`}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNav
