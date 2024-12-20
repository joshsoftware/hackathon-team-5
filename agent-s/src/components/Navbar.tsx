import { Bot } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from './ThemeToggle'

const Navbar = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link className="flex items-center justify-center" href="#">
          <Bot className="h-6 w-6 mr-2" />
          <span className="font-bold">Agent-S</span>
        </Link>
        <ThemeToggle />
      </header>
  )
}

export default Navbar