 import { useState } from 'react'
 import { motion } from 'framer-motion'
 import { useAuth } from '@/contexts/AuthContext'
 import {
   User, Bell, Palette, Shield, Code, Monitor,
   Moon, Sun, Volume2, VolumeX, Globe, Key,
   Save, ChevronRight, AlertTriangle, LogOut, Trash2
 } from 'lucide-react'
 
 type TabType = 'account' | 'preferences' | 'editor' | 'notifications' | 'privacy'
 
 export default function Settings() {
   const { user, logout } = useAuth()
   const [activeTab, setActiveTab] = useState<TabType>('account')
   const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
   const [language, setLanguage] = useState('python')
   const [fontSize, setFontSize] = useState(14)
   const [soundEnabled, setSoundEnabled] = useState(true)
   const [emailNotifs, setEmailNotifs] = useState(true)
   const [battleNotifs, setBattleNotifs] = useState(true)
   const [saving, setSaving] = useState(false)
 
   const tabs: { id: TabType; label: string; icon: typeof User }[] = [
     { id: 'account', label: 'Account', icon: User },
     { id: 'preferences', label: 'Preferences', icon: Palette },
     { id: 'editor', label: 'Editor', icon: Code },
     { id: 'notifications', label: 'Notifications', icon: Bell },
     { id: 'privacy', label: 'Privacy', icon: Shield },
   ]
 
   const handleSave = async () => {
     setSaving(true)
     await new Promise(r => setTimeout(r, 1000))
     setSaving(false)
   }
 
   return (
     <div className="page-shell pt-8 max-w-5xl">
       {/* Header */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-10"
       >
         <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
         <p className="text-muted-foreground">Manage your account and preferences</p>
       </motion.div>
 
       <div className="flex flex-col lg:flex-row gap-8">
         {/* Sidebar */}
         <motion.aside
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="lg:w-56 shrink-0"
         >
           <nav className="space-y-1">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                   activeTab === tab.id
                     ? 'bg-primary/12 text-primary border border-primary/30'
                     : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                 }`}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label}
               </button>
             ))}
           </nav>
 
           <div className="mt-8 pt-8 border-t border-border/40">
             <button
               onClick={logout}
               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
             >
               <LogOut className="w-4 h-4" />
               Log Out
             </button>
           </div>
         </motion.aside>
 
         {/* Content */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="flex-1"
         >
           {/* Account */}
           {activeTab === 'account' && (
             <div className="space-y-6">
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6">Profile Information</h2>
                 <div className="space-y-5">
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Username</label>
                     <input
                       type="text"
                       defaultValue={user?.username}
                       className="premium-input"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Email</label>
                     <input
                       type="email"
                       defaultValue={user?.email}
                       className="premium-input"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Bio</label>
                     <textarea
                       placeholder="Tell others about yourself..."
                       rows={3}
                       className="premium-input resize-none"
                     />
                   </div>
                 </div>
               </div>
 
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Key className="w-5 h-5" />
                   Security
                 </h2>
                 <div className="space-y-4">
                   <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40 hover:border-primary/30 transition-colors">
                     <div>
                       <div className="font-medium">Change Password</div>
                       <div className="text-sm text-muted-foreground">Update your password</div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted-foreground" />
                   </button>
                   <button className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40 hover:border-primary/30 transition-colors">
                     <div>
                       <div className="font-medium">Two-Factor Authentication</div>
                       <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted-foreground" />
                   </button>
                 </div>
               </div>
             </div>
           )}
 
           {/* Preferences */}
           {activeTab === 'preferences' && (
             <div className="space-y-6">
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Palette className="w-5 h-5" />
                   Appearance
                 </h2>
                 <div className="space-y-5">
                   <div>
                     <label className="text-sm font-medium mb-3 block">Theme</label>
                     <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: 'dark', label: 'Dark', icon: Moon },
                         { id: 'light', label: 'Light', icon: Sun },
                         { id: 'system', label: 'System', icon: Monitor },
                       ].map(t => (
                         <button
                           key={t.id}
                           onClick={() => setTheme(t.id as any)}
                           className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                             theme === t.id
                               ? 'bg-primary/10 border-primary/50 text-primary'
                               : 'bg-surface-2 border-border/40 text-muted-foreground hover:text-foreground'
                           }`}
                         >
                           <t.icon className="w-5 h-5" />
                           <span className="text-sm font-medium">{t.label}</span>
                         </button>
                       ))}
                     </div>
                   </div>
 
                   <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40">
                     <div className="flex items-center gap-3">
                       {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                       <div>
                         <div className="font-medium">Sound Effects</div>
                         <div className="text-sm text-muted-foreground">Battle sounds and notifications</div>
                       </div>
                     </div>
                     <button
                       onClick={() => setSoundEnabled(!soundEnabled)}
                       className={`w-12 h-7 rounded-full transition-colors ${
                         soundEnabled ? 'bg-primary' : 'bg-secondary'
                       }`}
                     >
                       <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                         soundEnabled ? 'translate-x-6' : 'translate-x-1'
                       }`} />
                     </button>
                   </div>
                 </div>
               </div>
 
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Globe className="w-5 h-5" />
                   Language & Region
                 </h2>
                 <div>
                   <label className="text-sm font-medium mb-2.5 block">Display Language</label>
                   <select className="premium-input">
                     <option value="en">English</option>
                     <option value="es">Español</option>
                     <option value="fr">Français</option>
                     <option value="de">Deutsch</option>
                     <option value="ja">日本語</option>
                   </select>
                 </div>
               </div>
             </div>
           )}
 
           {/* Editor */}
           {activeTab === 'editor' && (
             <div className="space-y-6">
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Code className="w-5 h-5" />
                   Editor Settings
                 </h2>
                 <div className="space-y-5">
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Default Language</label>
                     <select
                       value={language}
                       onChange={e => setLanguage(e.target.value)}
                       className="premium-input"
                     >
                       <option value="python">Python</option>
                       <option value="javascript">JavaScript</option>
                       <option value="java">Java</option>
                       <option value="cpp">C++</option>
                       <option value="rust">Rust</option>
                     </select>
                   </div>
 
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Font Size: {fontSize}px</label>
                     <input
                       type="range"
                       min="12"
                       max="20"
                       value={fontSize}
                       onChange={e => setFontSize(parseInt(e.target.value))}
                       className="w-full accent-primary"
                     />
                   </div>
 
                   <div>
                     <label className="text-sm font-medium mb-2.5 block">Editor Theme</label>
                     <select className="premium-input">
                       <option value="vs-dark">VS Dark</option>
                       <option value="monokai">Monokai</option>
                       <option value="dracula">Dracula</option>
                       <option value="github-dark">GitHub Dark</option>
                     </select>
                   </div>
 
                   <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40">
                     <div>
                       <div className="font-medium">Line Numbers</div>
                       <div className="text-sm text-muted-foreground">Show line numbers in editor</div>
                     </div>
                     <button className="w-12 h-7 rounded-full bg-primary transition-colors">
                       <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                     </button>
                   </div>
 
                   <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40">
                     <div>
                       <div className="font-medium">Minimap</div>
                       <div className="text-sm text-muted-foreground">Show code minimap</div>
                     </div>
                     <button className="w-12 h-7 rounded-full bg-secondary transition-colors">
                       <div className="w-5 h-5 rounded-full bg-white translate-x-1" />
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}
 
           {/* Notifications */}
           {activeTab === 'notifications' && (
             <div className="space-y-6">
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Bell className="w-5 h-5" />
                   Notification Preferences
                 </h2>
                 <div className="space-y-4">
                   {[
                     { label: 'Email Notifications', desc: 'Receive updates via email', enabled: emailNotifs, toggle: setEmailNotifs },
                     { label: 'Battle Invites', desc: 'Get notified when challenged', enabled: battleNotifs, toggle: setBattleNotifs },
                     { label: 'Leaderboard Updates', desc: 'Weekly ranking changes', enabled: true, toggle: () => {} },
                     { label: 'New Features', desc: 'Product updates and announcements', enabled: true, toggle: () => {} },
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40">
                       <div>
                         <div className="font-medium">{item.label}</div>
                         <div className="text-sm text-muted-foreground">{item.desc}</div>
                       </div>
                       <button
                         onClick={() => item.toggle(!item.enabled)}
                         className={`w-12 h-7 rounded-full transition-colors ${
                           item.enabled ? 'bg-primary' : 'bg-secondary'
                         }`}
                       >
                         <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                           item.enabled ? 'translate-x-6' : 'translate-x-1'
                         }`} />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
 
           {/* Privacy */}
           {activeTab === 'privacy' && (
             <div className="space-y-6">
               <div className="premium-card">
                 <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                   <Shield className="w-5 h-5" />
                   Privacy Settings
                 </h2>
                 <div className="space-y-4">
                   {[
                     { label: 'Public Profile', desc: 'Allow others to view your profile' },
                     { label: 'Show Battle History', desc: 'Display your recent battles publicly' },
                     { label: 'Show on Leaderboard', desc: 'Appear in global rankings' },
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/40">
                       <div>
                         <div className="font-medium">{item.label}</div>
                         <div className="text-sm text-muted-foreground">{item.desc}</div>
                       </div>
                       <button className="w-12 h-7 rounded-full bg-primary transition-colors">
                         <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
 
               <div className="premium-card border-destructive/30">
                 <h2 className="font-display text-lg font-bold mb-4 text-destructive flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5" />
                   Danger Zone
                 </h2>
                 <p className="text-muted-foreground text-sm mb-6">
                   These actions are permanent and cannot be undone.
                 </p>
                 <div className="flex gap-4">
                   <button className="btn-neon-ghost text-destructive border-destructive/30 hover:bg-destructive/10">
                     <Trash2 className="w-4 h-4" />
                     Delete Account
                   </button>
                 </div>
               </div>
             </div>
           )}
 
           {/* Save button */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex justify-end mt-8"
           >
             <button onClick={handleSave} disabled={saving} className="btn-neon-primary">
               <Save className="w-4 h-4" />
               {saving ? 'Saving...' : 'Save Changes'}
             </button>
           </motion.div>
         </motion.div>
       </div>
     </div>
   )
 }