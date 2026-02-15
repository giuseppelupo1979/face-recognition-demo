import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, UserPlus, Video, Target, BarChart3, Cpu, Settings,
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/enrollment', icon: UserPlus, label: 'Enrollment' },
  { path: '/recognition', icon: Video, label: 'Recognition' },
  { path: '/challenges', icon: Target, label: 'Challenges' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/tech', icon: Cpu, label: 'Tech' },
]

export default function Sidebar() {
  return (
    <aside className="w-20 bg-dark-800 border-r border-dark-600 flex flex-col items-center py-6 gap-2">
      {/* Logo */}
      <div className="mb-6">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg font-bold">FR</span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-accent-cyan bg-dark-600'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-dark-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="text-[10px] relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <button className="text-gray-400 hover:text-white p-3 rounded-xl hover:bg-dark-700 transition-colors">
        <Settings size={20} />
      </button>
    </aside>
  )
}
