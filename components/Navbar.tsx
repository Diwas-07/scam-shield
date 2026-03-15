'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Shield, BarChart3, AlertTriangle, BookOpen, 
  TrendingUp, Home, ExternalLink, Zap, LogOut, User
} from 'lucide-react'

const navItems = [
  { href: '/home', icon: Home, label: 'Home', exact: true },
  { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/report', icon: AlertTriangle, label: 'Report Scam' },
  { href: '/trends', icon: TrendingUp, label: 'Trends' },
  { href: '/learn', icon: BookOpen, label: 'Learn & Protect' },
]

const adminNavItem = { href: '/admin', icon: Shield, label: 'Admin Panel', adminOnly: true }

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r border-ink-border z-40 flex flex-col"
      style={{ background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)' }}>
      
      {/* Logo */}
      <div className="p-6 border-b border-ink-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-acid flex items-center justify-center">
              <Shield size={16} className="text-ink" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-signal pulse-dot" />
          </div>
          <div>
            <div className="font-display font-bold text-frost text-sm tracking-wide">SCAM</div>
            <div className="font-display font-bold text-acid text-sm tracking-wider -mt-1">SHIELD</div>
          </div>
        </Link>
      </div>

      {/* Live indicator */}
      <div className="px-4 py-2 border-b border-ink-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: 'rgba(255, 59, 92, 0.05)' }}>
          <div className="pulse-dot" />
          <span className="text-signal text-xs font-mono">LIVE TRACKING ACTIVE</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                isActive 
                  ? 'active text-acid bg-acid/5 border-l-acid font-medium' 
                  : 'text-muted-light hover:text-acid'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-acid' : 'text-muted'} />
              {label}
              {label === 'Report Scam' && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-signal text-white font-mono">!</span>
              )}
            </Link>
          )
        })}
        
        {/* Admin Panel - Only for admins */}
        {session?.user?.role === 'admin' && (
          <>
            <div className="border-t border-ink-border my-2" />
            <Link
              href={adminNavItem.href}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                pathname.startsWith(adminNavItem.href)
                  ? 'active text-signal bg-signal/5 border-l-signal font-medium' 
                  : 'text-muted-light hover:text-signal'
              }`}
            >
              <adminNavItem.icon size={16} className={pathname.startsWith(adminNavItem.href) ? 'text-signal' : 'text-muted'} />
              {adminNavItem.label}
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-signal text-white font-mono">A</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ink-border space-y-3">
        {session?.user && (
          <div className="card-dark rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-acid" />
              <span className="text-xs font-medium text-frost truncate">{session.user.name}</span>
            </div>
            <p className="text-xs text-muted truncate mb-2">{session.user.email}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-signal hover:text-signal/80 transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        )}
        <div className="card-dark rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-acid" />
            <span className="text-xs font-mono text-acid">AWS POWERED</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Backend by RDS MySQL. Deployed on EC2.
          </p>
        </div>
        <a 
          href="https://cybersecurity.my" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted hover:text-muted-light transition-colors"
        >
          <ExternalLink size={12} />
          Report to NACSA
        </a>
      </div>
    </aside>
  )
}
