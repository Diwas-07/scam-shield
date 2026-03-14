'use client'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, Shield, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { SCAM_TYPES } from '@/lib/constants'

const platforms = [
  'WhatsApp', 'Facebook', 'Instagram', 'Telegram', 'Email', 'Phone/SMS',
  'TikTok', 'Twitter/X', 'LinkedIn', 'Online Marketplace', 'Dating App', 'Other'
]

const ageGroups = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Prefer not to say']

const regions = [
  'Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Perak', 'Sabah', 
  'Sarawak', 'Negeri Sembilan', 'Pahang', 'Kedah', 'Kelantan', 
  'Terengganu', 'Melaka', 'Perlis', 'Putrajaya', 'Labuan', 'Other'
]

interface FormData {
  scamType: string
  platform: string
  description: string
  financialLoss: string
  currency: string
  victimAge: string
  contactMethod: string
  region: string
  evidence: string
  anonymous: boolean
  agreed: boolean
}

const initialForm: FormData = {
  scamType: '',
  platform: '',
  description: '',
  financialLoss: '0',
  currency: 'MYR',
  victimAge: '',
  contactMethod: '',
  region: '',
  evidence: '',
  anonymous: false,
  agreed: false,
}

export default function ReportPage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState('')

  const update = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = () => {
    if (step === 1) return form.scamType && form.platform && form.description.length >= 30
    if (step === 2) return form.region
    if (step === 3) return form.agreed
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setReportId(data.report.id)
        setSubmitted(true)
        toast.success('Report submitted successfully!')
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-8 min-h-screen grid-bg flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-safe/10 border-2 border-safe flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 0 40px rgba(0, 214, 143, 0.15)' }}>
            <CheckCircle size={36} className="text-safe" />
          </div>
          <h2 className="font-display font-black text-3xl text-frost mb-3">Report Submitted</h2>
          <p className="text-muted-light mb-2">Your report has been recorded and will help protect others.</p>
          <p className="font-mono text-xs text-acid mb-8">Reference ID: {reportId.slice(0, 8).toUpperCase()}</p>
          
          <div className="card-dark rounded-2xl p-5 text-left mb-6">
            <h4 className="font-display font-semibold text-frost mb-3 text-sm">What happens next?</h4>
            <div className="space-y-3">
              {[
                { title: 'Review', desc: 'Your report is logged in AWS RDS and queued for review.' },
                { title: 'Analysis', desc: 'Our system cross-references this with other reports for pattern detection.' },
                { title: 'Action', desc: 'Verified patterns are escalated to relevant authorities.' },
              ].map(({ title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-acid/10 border border-acid/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-acid text-xs font-mono font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-frost">{title}</div>
                    <div className="text-xs text-muted">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm(initialForm); setStep(1) }}
              className="flex-1 btn-outline py-3 rounded-xl text-sm font-display uppercase tracking-wide">
              Submit Another
            </button>
            <a href="/dashboard" className="flex-1 btn-acid py-3 rounded-xl text-sm font-display uppercase tracking-wide text-center">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  const steps = ['Scam Details', 'Your Info', 'Review & Submit']

  return (
    <div className="p-8 min-h-screen grid-bg">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-signal tracking-wider mb-2">INCIDENT REPORTING</div>
        <h1 className="font-display font-black text-4xl text-frost">Report a Scam</h1>
        <p className="text-muted-light mt-1 text-sm">Stored securely in AWS RDS. Anonymous reporting available.</p>
      </div>

      <div>
        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => {
            const num = i + 1
            const isDone = num < step
            const isCurrent = num === step
            return (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${isCurrent || isDone ? 'text-frost' : 'text-muted'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isDone ? 'bg-acid text-ink' : isCurrent ? 'bg-acid/20 text-acid border border-acid' : 'bg-ink-border text-muted'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className="text-xs font-mono hidden sm:block">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${num < step ? 'bg-acid/40' : 'bg-ink-border'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-ink-border">
            <h2 className="font-display font-bold text-xl text-frost">{steps[step - 1]}</h2>
          </div>
          
          <div className="p-6 space-y-5">
            {step === 1 && (
              <>
                {/* Scam Type */}
                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    Scam Type <span className="text-signal">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SCAM_TYPES.slice(0, 12).map(type => (
                      <button
                        key={type}
                        onClick={() => update('scamType', type)}
                        className={`p-2.5 cursor-pointer rounded-lg text-xs text-left transition-all ${
                          form.scamType === type 
                            ? 'bg-acid/15 border border-acid/40 text-acid' 
                            : 'bg-ink-soft border border-ink-border text-muted hover:border-acid/20 hover:text-muted-light'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    Platform / Channel <span className="text-signal">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {platforms.map(p => (
                      <button
                        key={p}
                        onClick={() => update('platform', p)}
                        className={`p-2 cursor-pointer rounded-lg text-xs transition-all ${
                          form.platform === p 
                            ? 'bg-acid/15 border border-acid/40 text-acid' 
                            : 'bg-ink-soft border border-ink-border text-muted hover:border-acid/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    Description <span className="text-signal">*</span>
                    <span className="ml-2">(min 30 chars)</span>
                  </label>
                  <textarea
                    className="input-dark w-full rounded-xl p-3 text-sm resize-none"
                    rows={4}
                    placeholder="Describe what happened — the more detail, the more helpful for analysis and pattern detection..."
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                  />
                  <div className="text-xs text-muted font-mono mt-1 text-right">{form.description.length} chars</div>
                </div>

                {/* Financial Loss */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">Financial Loss</label>
                    <input
                      type="number"
                      className="input-dark w-full rounded-xl p-3 text-sm"
                      placeholder="0"
                      value={form.financialLoss}
                      onChange={e => update('financialLoss', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">Currency</label>
                    <select
                      className="input-dark w-full rounded-xl p-3 text-sm"
                      value={form.currency}
                      onChange={e => update('currency', e.target.value)}
                    >
                      <option value="MYR">MYR (Malaysian Ringgit)</option>
                      <option value="SGD">SGD</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    Evidence / Additional Info <span className="text-muted">(optional)</span>
                  </label>
                  <textarea
                    className="input-dark w-full rounded-xl p-3 text-sm resize-none"
                    rows={2}
                    placeholder="URLs, phone numbers, account names, email addresses involved..."
                    value={form.evidence}
                    onChange={e => update('evidence', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="p-4 rounded-xl flex items-start gap-3"
                  style={{ background: 'rgba(200, 255, 0, 0.05)', border: '1px solid rgba(200, 255, 0, 0.1)' }}>
                  <Info size={16} className="text-acid mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-light leading-relaxed">
                    Personal information helps improve analysis accuracy but is never shared publicly. 
                    You can enable anonymous mode to exclude identifying details.
                  </p>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(10, 10, 15, 0.5)', border: '1px solid #1E1E2A' }}>
                  <div>
                    <div className="text-sm font-medium text-frost flex items-center gap-2">
                      <Shield size={14} className="text-acid" />
                      Anonymous Reporting
                    </div>
                    <div className="text-xs text-muted mt-0.5">Hide your identifying information</div>
                  </div>
                  <button
                    onClick={() => update('anonymous', !form.anonymous)}
                    className={`w-12 h-6 rounded-full transition-all relative ${form.anonymous ? 'bg-acid' : 'bg-ink-border'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      form.anonymous ? 'left-7 bg-ink' : 'left-1 bg-muted'
                    }`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                      Age Group <span className="text-muted">(optional)</span>
                    </label>
                    <select
                      className="input-dark w-full rounded-xl p-3 text-sm"
                      value={form.victimAge}
                      onChange={e => update('victimAge', e.target.value)}
                    >
                      <option value="">Prefer not to say</option>
                      {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                      Region / State <span className="text-signal">*</span>
                    </label>
                    <select
                      className="input-dark w-full rounded-xl p-3 text-sm"
                      value={form.region}
                      onChange={e => update('region', e.target.value)}
                    >
                      <option value="">Select region...</option>
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    How were you contacted? <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-dark w-full rounded-xl p-3 text-sm"
                    placeholder="e.g. Received a call, Link in email, DM on Facebook..."
                    value={form.contactMethod}
                    onChange={e => update('contactMethod', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="card-dark rounded-xl p-4 space-y-3">
                  <h4 className="font-mono text-xs text-acid uppercase tracking-wider">Report Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted">Scam Type</div>
                    <div className="text-frost font-medium">{form.scamType || '—'}</div>
                    <div className="text-muted">Platform</div>
                    <div className="text-frost">{form.platform || '—'}</div>
                    <div className="text-muted">Financial Loss</div>
                    <div className="text-warn font-mono">
                      {parseFloat(form.financialLoss) > 0 ? `${form.currency} ${parseFloat(form.financialLoss).toLocaleString()}` : 'None reported'}
                    </div>
                    <div className="text-muted">Region</div>
                    <div className="text-frost">{form.region || '—'}</div>
                    <div className="text-muted">Age Group</div>
                    <div className="text-frost">{form.victimAge || 'Not provided'}</div>
                    <div className="text-muted">Anonymous</div>
                    <div className={form.anonymous ? 'text-acid' : 'text-muted-light'}>{form.anonymous ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="pt-2 border-t border-ink-border">
                    <div className="text-muted text-xs mb-1">Description</div>
                    <div className="text-sm text-muted-light leading-relaxed">{form.description}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(255, 59, 92, 0.05)', border: '1px solid rgba(255, 59, 92, 0.15)' }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreed}
                      onChange={e => update('agreed', e.target.checked)}
                      className="mt-1 accent-acid"
                    />
                    <span className="text-sm text-muted-light leading-relaxed">
                      I confirm that the information I have provided is truthful and accurate to the best of my knowledge. 
                      I agree to have this report stored in the ScamShield database to help protect others.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(200, 255, 0, 0.04)', border: '1px solid rgba(200, 255, 0, 0.08)' }}>
                  <Shield size={16} className="text-acid flex-shrink-0" />
                  <p className="text-xs text-muted">
                    Data is encrypted and stored in AWS RDS. No personally identifiable 
                    information is shared publicly.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-ink-border flex items-center justify-between">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn-outline px-6 py-2.5 rounded-xl text-sm font-display uppercase tracking-wide disabled:opacity-30"
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => validateStep() && setStep(s => s + 1)}
                disabled={!validateStep()}
                className="btn-acid px-8 py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed font-display uppercase tracking-wide"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!form.agreed || submitting}
                className="btn-acid px-8 py-2.5 rounded-xl text-sm disabled:opacity-40 flex items-center gap-2 font-display uppercase tracking-wide"
              >
                {submitting ? (
                  <>
                    <span className="w-3 h-3 border border-ink/40 border-t-ink rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    Submit Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
