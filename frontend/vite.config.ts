 import { defineConfig } from "vite"
 import react from "@vitejs/plugin-react"
 import path from "path"
 
 export default defineConfig(({ mode }) => {
   // Only import componentTagger in development to avoid ESM issues in production builds
   const plugins = [react()]
   
   if (mode === 'development') {
     import('lovable-tagger').then(({ componentTagger }) => {
       plugins.push(componentTagger())
     }).catch(() => {
       // Silent fail if tagger not available
     })
   }
   
   return {
     plugins,
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
     server: {
       host: "::",
       port: 8080,
     },
   }
 })