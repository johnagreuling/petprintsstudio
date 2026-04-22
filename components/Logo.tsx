import Image from 'next/image'

/**
 * Pet Prints Studio brand logo. Uses /public/logo.png (1536×1024, 1.5:1).
 * Specify height — width auto-derives from aspect.
 *
 * Usage:
 *   <Logo height={48} />              // nav header
 *   <Logo height={24} />              // footer
 *   <Logo height={64} priority />     // above-fold, preloaded
 */
export function Logo({
  height = 48,
  className,
  priority = false,
}: {
  height?: number
  className?: string
  priority?: boolean
}) {
  const width = Math.round(height * 1.5)
  return (
    <Image
      src="/logo.png"
      alt="Pet Prints Studio"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
}

export default Logo
