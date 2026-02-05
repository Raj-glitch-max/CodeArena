 import { useState, useEffect, useCallback } from 'react'
 
 export function useLocalStorage<T>(
   key: string,
   initialValue: T
 ): [T, (value: T | ((prev: T) => T)) => void, () => void] {
   // Get initial value from localStorage or use provided default
   const readValue = useCallback((): T => {
     if (typeof window === 'undefined') {
       return initialValue
     }
     
     try {
       const item = window.localStorage.getItem(key)
       return item ? (JSON.parse(item) as T) : initialValue
     } catch (error) {
       console.warn(`Error reading localStorage key "${key}":`, error)
       return initialValue
     }
   }, [key, initialValue])
   
   const [storedValue, setStoredValue] = useState<T>(readValue)
   
   // Update localStorage when state changes
   const setValue = useCallback(
     (value: T | ((prev: T) => T)) => {
       try {
         const newValue = value instanceof Function ? value(storedValue) : value
         window.localStorage.setItem(key, JSON.stringify(newValue))
         setStoredValue(newValue)
         
         // Dispatch storage event for cross-tab sync
         window.dispatchEvent(new StorageEvent('storage', {
           key,
           newValue: JSON.stringify(newValue),
         }))
       } catch (error) {
         console.warn(`Error setting localStorage key "${key}":`, error)
       }
     },
     [key, storedValue]
   )
   
   // Remove from localStorage
   const removeValue = useCallback(() => {
     try {
       window.localStorage.removeItem(key)
       setStoredValue(initialValue)
     } catch (error) {
       console.warn(`Error removing localStorage key "${key}":`, error)
     }
   }, [key, initialValue])
   
   // Listen for changes in other tabs
   useEffect(() => {
     const handleStorageChange = (event: StorageEvent) => {
       if (event.key === key && event.newValue !== null) {
         setStoredValue(JSON.parse(event.newValue))
       }
     }
     
     window.addEventListener('storage', handleStorageChange)
     return () => window.removeEventListener('storage', handleStorageChange)
   }, [key])
   
   return [storedValue, setValue, removeValue]
 }