import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-brand-900 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90">
          J&amp;S Niagara Tours
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-100 transition-colors">
            Tours
          </Link>
        </div>
      </div>
    </nav>
  )
}
