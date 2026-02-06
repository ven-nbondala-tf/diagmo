/**
 * Throttle function execution using requestAnimationFrame.
 * Only the latest call within a frame will be executed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttleRAF<T extends (...args: any[]) => void>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastArgs: any[] | null = null

  return (...args: Parameters<T>) => {
    lastArgs = args

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs)
        }
        rafId = null
        lastArgs = null
      })
    }
  }
}

/**
 * Debounce function execution.
 * Waits for a period of inactivity before executing.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle function execution with a minimum interval.
 * Executes immediately on first call, then limits subsequent calls.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastArgs: any[] | null = null

  return (...args: Parameters<T>) => {
    const now = Date.now()
    lastArgs = args

    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        if (lastArgs) {
          fn(...lastArgs)
        }
        timeoutId = null
      }, interval - (now - lastTime))
    }
  }
}
