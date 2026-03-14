'use client'
import { useState } from 'react'
import { BookOpen, Shield, AlertTriangle, ChevronDown, ChevronRight, Phone, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

const scamGuides = [
  {
    title: 'Phishing Emails',
    icon: '📧',
    severity: 'high',
    howItWorks: 'Scammers send emails disguised as banks, government agencies, or popular services. They create urgency (e.g., "Your account will be suspended!") and direct victims to fake websites that steal credentials.',
    redFlags: [
      'Sender email doesn\'t match the official domain',
      'Urgent language demanding immediate action',
      'Links that don\'t match the company\'s real URL',
      'Requests for passwords, OTP, or personal info',
      'Generic greetings like "Dear Customer"',
    ],
    protectYourself: [
      'Always check the sender\'s actual email address',
      'Never click links — go directly to the website',
      'Enable 2FA on all your accounts',
      'Report suspicious emails before deleting',
    ],
  },
  {
    title: 'Investment Fraud',
    icon: '💰',
    severity: 'high',
    howItWorks: 'Fraudsters promise unrealistically high returns (30%+ monthly) through WhatsApp or Telegram groups. They show fabricated profit screenshots and use early "success stories" to build trust before taking victims\' money.',
    redFlags: [
      'Promises of guaranteed high returns',
      'Pressure to recruit friends and family',
      'Requests to invest via cryptocurrency or direct bank transfer',
      'No verifiable registration with Bank Negara or SC',
      'Fake testimonials and profit screenshots',
    ],
    protectYourself: [
      'Verify investment platforms with Bank Negara Malaysia',
      'Never invest money you can\'t afford to lose',
      'Be skeptical of unrealistic return promises',
      'Check the SC\'s Investor Alert List',
    ],
  },
  {
    title: 'Fake Job Offers',
    icon: '💼',
    severity: 'medium',
    howItWorks: 'Scammers post attractive job listings or contact victims directly via WhatsApp/social media, offering high-paying remote work. They request a "registration fee," "training materials cost," or personal banking details.',
    redFlags: [
      'Requesting payment before employment begins',
      'Job offer without a formal interview',
      'Salary far above market rate for simple tasks',
      'Vague company information or no company registration',
      'Communication only through personal messaging apps',
    ],
    protectYourself: [
      'Never pay money to get a job',
      'Verify the company through official channels',
      'Research the company on LinkedIn and official websites',
      'Be wary of "too good to be true" offers',
    ],
  },
  {
    title: 'Romance Scams',
    icon: '❤️',
    severity: 'high',
    howItWorks: 'Scammers build emotional relationships over weeks or months via social media or dating apps. They create elaborate fake identities (often claiming to be overseas professionals) and request money for emergencies, travel, or "investment opportunities".',
    redFlags: [
      'Profile photos too perfect — often stolen from models',
      'Claims to be working overseas in military, oil rigs, or medicine',
      'Moving very quickly to profess love or deep feelings',
      'Avoids video calls or always has technical difficulties',
      'Eventually asks for money, gift cards, or cryptocurrency',
    ],
    protectYourself: [
      'Reverse image search profile photos',
      'Never send money to someone you haven\'t met in person',
      'Be cautious of relationships that escalate unusually fast',
      'Talk to a trusted friend or family member about the relationship',
    ],
  },
  {
    title: 'Tech Support Scams',
    icon: '💻',
    severity: 'medium',
    howItWorks: 'Victims receive calls from "Microsoft," "Apple," or "Telco support" claiming their device has been hacked. They convince victims to install remote access software, then steal banking credentials or charge for fake "repairs."',
    redFlags: [
      'Unsolicited calls about your device or account',
      'Requests to install remote desktop software',
      'Claiming to be from Microsoft, Apple, or your bank',
      'Pop-up messages with alarming virus warnings',
      'Requests for payment via gift cards or wire transfer',
    ],
    protectYourself: [
      'Hang up immediately on unsolicited tech support calls',
      'Never give remote access to strangers',
      'Microsoft and Apple will never call you proactively',
      'Contact companies directly through official websites',
    ],
  },
  {
    title: 'Parcel/SMS Scams',
    icon: '📦',
    severity: 'medium',
    howItWorks: 'Fake SMS messages claim a parcel is held at customs or needs a small fee. The link leads to a convincing fake website that harvests banking credentials. Similar methods used for fake utility bills or government notifications.',
    redFlags: [
      'Unexpected SMS about a package you didn\'t order',
      'Links in SMS — especially shortened URLs',
      'Requests for credit card details to pay small fees',
      'Urgency with short deadlines to respond',
    ],
    protectYourself: [
      'Track parcels only through official carrier websites',
      'Never click SMS links — visit official sites directly',
      'Be suspicious of unexpected fees',
      'Check with the actual company if unsure',
    ],
  },
]

const resources = [
  { name: 'PDRM Cyber Crime Division', desc: 'Report cyber crime to Malaysian police', url: 'https://ccid.rmp.gov.my', icon: '🚔' },
  { name: 'Bank Negara LINK', desc: 'Report financial scams and fraud', url: 'https://bnmlink.bnm.gov.my', icon: '🏦' },
  { name: 'NACSA Cyber999', desc: 'National Cyber Security Agency helpline', url: 'https://www.nacsa.gov.my', icon: '🛡️' },
  { name: 'Securities Commission', desc: 'Report investment fraud', url: 'https://www.sc.com.my', icon: '📋' },
  { name: 'Semak Mule', desc: 'Check if a bank account is flagged for scams', url: 'https://semakmule.rmp.gov.my', icon: '🔍' },
  { name: 'CCID Scam Alert', desc: 'Commercial Crime Investigation Department portal', url: 'https://ccid.rmp.gov.my/scamalert', icon: '⚠️' },
]

export default function LearnPage() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="p-8 min-h-screen grid-bg">
      <div className="mb-8">
        <div className="font-mono text-xs text-safe tracking-wider mb-2">DIGITAL LITERACY</div>
        <h1 className="font-display font-black text-4xl text-frost">Learn & Protect</h1>
        <p className="text-muted-light mt-1 text-sm">Understanding scam tactics is the first line of defence</p>
      </div>

      <div>
        {/* Quick Test Banner */}
        <div className="card-dark rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{ borderColor: 'rgba(200, 255, 0, 0.15)' }}>
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)', filter: 'blur(20px)' }} />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-acid/10 border border-acid/20">
              <BookOpen size={24} className="text-acid" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-frost">Are you scam-savvy?</h3>
              <p className="text-muted text-sm mt-0.5">Read the guides below, then test your knowledge with real scam examples.</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(200, 255, 0, 0.08)', border: '1px solid rgba(200, 255, 0, 0.2)', color: '#C8FF00' }}>
              <Shield size={12} />
              6 GUIDES
            </div>
          </div>
        </div>

        {/* Scam Guides Accordion */}
        <div className="space-y-3 mb-8">
          {scamGuides.map((guide, i) => (
            <div key={guide.title} className="card-dark rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full p-5 flex items-center gap-4 text-left group hover:bg-acid/3"
              >
                <span className="text-2xl">{guide.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-frost group-hover:text-acid transition-colors">{guide.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono badge-${guide.severity}`}>
                      {guide.severity.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
                {expanded === i ? (
                  <ChevronDown size={18} className="text-acid flex-shrink-0" />
                ) : (
                  <ChevronRight size={18} className="text-muted flex-shrink-0 group-hover:text-acid transition-colors" />
                )}
              </button>

              {expanded === i && (
                <div className="px-5 pb-5 border-t border-ink-border">
                  <div className="pt-4 space-y-5">
                    {/* How it works */}
                    <div>
                      <h4 className="font-mono text-xs text-acid uppercase tracking-wider mb-2">How It Works</h4>
                      <p className="text-sm text-muted-light leading-relaxed">{guide.howItWorks}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Red flags */}
                      <div>
                        <h4 className="font-mono text-xs text-signal uppercase tracking-wider mb-3 flex items-center gap-2">
                          <XCircle size={12} />
                          Red Flags
                        </h4>
                        <ul className="space-y-2">
                          {guide.redFlags.map(flag => (
                            <li key={flag} className="flex items-start gap-2 text-sm text-muted">
                              <span className="text-signal text-xs mt-1">✗</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Protect yourself */}
                      <div>
                        <h4 className="font-mono text-xs text-safe uppercase tracking-wider mb-3 flex items-center gap-2">
                          <CheckCircle size={12} />
                          Protect Yourself
                        </h4>
                        <ul className="space-y-2">
                          {guide.protectYourself.map(tip => (
                            <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                              <span className="text-safe text-xs mt-1">✓</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reporting Resources */}
        <div>
          <h2 className="font-display font-bold text-2xl text-frost mb-4 flex items-center gap-3">
            <Phone size={20} className="text-acid" />
            Reporting Resources
          </h2>
          <p className="text-muted text-sm mb-5">If you've been scammed, report it. Every report helps authorities detect patterns and prevent future victims.</p>
          
          <div className="grid grid-cols-2 gap-3">
            {resources.map(({ name, desc, url, icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-dark rounded-xl p-4 flex items-start gap-3 group hover:-translate-y-0.5 transition-transform"
              >
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-frost text-sm group-hover:text-acid transition-colors truncate">{name}</h4>
                    <ExternalLink size={10} className="text-muted flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Vulnerable Groups Note */}
        <div className="mt-6 p-5 rounded-2xl" style={{ background: 'rgba(255, 149, 0, 0.05)', border: '1px solid rgba(255, 149, 0, 0.15)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-warn mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-display font-semibold text-frost mb-2">Protecting Vulnerable Groups</h4>
              <p className="text-sm text-muted leading-relaxed">
                The elderly, teenagers, and non-tech-savvy individuals are most at risk. Share this platform with your family members. 
                Discuss these scam types openly — awareness is the most powerful protection. 
                If someone you know has been scammed, help them report it here and contact the relevant authorities. 
                There is no shame in falling victim — scammers are highly sophisticated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
