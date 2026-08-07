import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

function PWAReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 md:bottom-28 right-4 left-4 md:left-auto md:w-96 z-[9999]"
        >
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
            <div className="flex justify-between items-start">
              <h3 className="text-white font-bold font-sans">
                {offlineReady ? 'Application prête !' : 'Mise à jour disponible'}
              </h3>
              <button onClick={close} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm">
              {offlineReady 
                ? 'Hadara Studio fonctionne désormais hors-ligne.' 
                : 'Une nouvelle version de l\'application est disponible.'}
            </p>

            {needRefresh && (
              <button 
                onClick={() => updateServiceWorker(true)}
                className="bg-amber-400 text-slate-900 font-bold py-2 rounded-xl flex items-center justify-center gap-2 mt-2 hover:bg-amber-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Mettre à jour maintenant
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAReloadPrompt
