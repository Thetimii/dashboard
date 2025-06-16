'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

export function Logo({ size = 'md', className = '', priority = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Dark logo for light backgrounds */}
      <Image
        src="/Logo Symbol dark - no bg.png"
        alt="Customer Flows Logo"
        width={80}
        height={80}
        priority={priority}
        className="object-contain dark:hidden"
      />
      
      {/* Light logo for dark backgrounds */}
      <Image
        src="/Logo Symbol light no bg.png"
        alt="Customer Flows Logo"
        width={80}
        height={80}
        priority={priority}
        className="object-contain hidden dark:block"
      />
    </div>
  )
}
