import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Stack - Vertical or horizontal stack with configurable gap
 * Uses explicit mapping to ensure Tailwind JIT picks up classes
 */

// Explicit gap mapping (prevents Tailwind JIT issues)
const gapMap = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
}

/**
 * Stack - Flexible stack layout component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to stack
 * @param {string} props.className - Additional classes
 * @param {0|1|2|3|4|5|6|8|10|12|16|20|24} props.gap - Gap between items (default: 4)
 * @param {'row'|'column'} props.direction - Stack direction (default: 'column')
 * @param {'start'|'center'|'end'|'stretch'} props.align - Alignment (default: 'stretch')
 * @param {'start'|'center'|'end'|'between'|'around'|'evenly'} props.justify - Justification (default: 'start')
 */
function Stack({
  children,
  className,
  gap = 4,
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  ...props
}) {
  const gapClass = gapMap[gap] || gapMap[4]
  
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col'
  
  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }
  const alignClass = alignMap[align] || alignMap.stretch
  
  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }
  const justifyClass = justifyMap[justify] || justifyMap.start

  return (
    <div
      className={cn(
        "flex",
        directionClass,
        gapClass,
        alignClass,
        justifyClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Stack }

