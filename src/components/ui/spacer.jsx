import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Spacer - Vertical or horizontal spacing component
 * Uses explicit mapping to ensure Tailwind JIT picks up classes
 */

// Explicit height mapping
const heightMap = {
  0: "h-0",
  1: "h-1",
  2: "h-2",
  3: "h-3",
  4: "h-4",
  5: "h-5",
  6: "h-6",
  8: "h-8",
  10: "h-10",
  12: "h-12",
  16: "h-16",
  20: "h-20",
  24: "h-24",
  32: "h-32",
  40: "h-40",
  48: "h-48",
  64: "h-64",
}

// Explicit width mapping
const widthMap = {
  0: "w-0",
  1: "w-1",
  2: "w-2",
  3: "w-3",
  4: "w-4",
  5: "w-5",
  6: "w-6",
  8: "w-8",
  10: "w-10",
  12: "w-12",
  16: "w-16",
  20: "w-20",
  24: "w-24",
  32: "w-32",
  40: "w-40",
  48: "w-48",
  64: "w-64",
}

/**
 * Spacer - Flexible spacing component
 * 
 * @param {Object} props
 * @param {string} props.className - Additional classes
 * @param {'vertical'|'horizontal'} props.axis - Spacing direction (default: 'vertical')
 * @param {0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|64} props.size - Spacing size (default: 4)
 */
function Spacer({
  className,
  axis = 'vertical',
  size = 4,
  ...props
}) {
  if (axis === 'horizontal') {
    const widthClass = widthMap[size] || widthMap[4]
    return (
      <span
        className={cn("inline-block", widthClass, className)}
        {...props}
      />
    )
  }
  
  const heightClass = heightMap[size] || heightMap[4]
  return (
    <div
      className={cn(heightClass, className)}
      {...props}
    />
  )
}

export { Spacer }

