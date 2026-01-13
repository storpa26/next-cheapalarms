import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Grid - Responsive grid layout with configurable columns and gap
 * Uses explicit mapping to ensure Tailwind JIT picks up classes
 */

// Explicit gap mapping
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

// Explicit column mapping
const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
}

/**
 * Grid - Responsive grid layout component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {string} props.className - Additional classes
 * @param {Object} props.cols - Column configuration { sm?: number, md?: number, lg?: number, xl?: number }
 * @param {0|1|2|3|4|5|6|8|10|12|16|20|24} props.gap - Gap between items (default: 4)
 */
function Grid({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 4,
  ...props
}) {
  const gapClass = gapMap[gap] || gapMap[4]
  
  // Build responsive column classes (only add if value exists in map)
  const colClasses = []
  if (cols.sm !== undefined) {
    const smClass = colsMap[cols.sm]
    if (smClass) colClasses.push(smClass)
  }
  if (cols.md !== undefined) {
    const mdClass = colsMap[cols.md]
    if (mdClass) colClasses.push(`md:${mdClass}`)
  }
  if (cols.lg !== undefined) {
    const lgClass = colsMap[cols.lg]
    if (lgClass) colClasses.push(`lg:${lgClass}`)
  }
  if (cols.xl !== undefined) {
    const xlClass = colsMap[cols.xl]
    if (xlClass) colClasses.push(`xl:${xlClass}`)
  }
  
  // Default: 1 column if no valid cols specified
  if (colClasses.length === 0) {
    colClasses.push(colsMap[1])
  }

  return (
    <div
      className={cn(
        "grid",
        gapClass,
        ...colClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Grid }

