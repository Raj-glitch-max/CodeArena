 import { useState, useEffect } from 'react'
 
 export function useDebounce<T>(value: T, delay: number = 300): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value)
   
   useEffect(() => {
     const timer = setTimeout(() => {
       setDebouncedValue(value)
     }, delay)
     
     return () => {
       clearTimeout(timer)
     }
   }, [value, delay])
   
   return debouncedValue
 }
 
 export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
   callback: T,
   delay: number = 300
 ): T {
   const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
   
   const debouncedCallback = ((...args: Parameters<T>) => {
     if (timeoutId) {
       clearTimeout(timeoutId)
     }
     
     const id = setTimeout(() => {
       callback(...args)
     }, delay)
     
     setTimeoutId(id)
   }) as T
   
   useEffect(() => {
     return () => {
       if (timeoutId) {
         clearTimeout(timeoutId)
       }
     }
   }, [timeoutId])
   
   return debouncedCallback
 }