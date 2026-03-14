export const SCAM_TYPES = [
  'Phishing Email',
  'Fake Job Offer',
  'Romance Scam',
  'Investment Fraud',
  'Online Shopping Fraud',
  'Tech Support Scam',
  'Social Media Impersonation',
  'Lottery/Prize Scam',
  'Advance Fee Fraud',
  'Cryptocurrency Scam',
  'SMS/WhatsApp Scam',
  'Other',
] as const

export type ScamType = typeof SCAM_TYPES[number]
