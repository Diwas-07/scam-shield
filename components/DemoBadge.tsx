export default function DemoBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
      style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.2)', color: '#FF9500' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
      DEMO MODE — Connect AWS DynamoDB to use live data
    </div>
  )
}
