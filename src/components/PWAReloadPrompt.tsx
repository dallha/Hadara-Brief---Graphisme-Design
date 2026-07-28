import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

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
    <div className="fixed bottom-4 right-4 z-50">
      { (offlineReady || needRefresh)
        && <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-4 md:p-6 text-slate-100 max-w-sm flex flex-col gap-4 animate-in slide-in-from-bottom-5">
            <div className="text-sm font-medium">
              { offlineReady
                ? <span>L'application est prête à fonctionner hors ligne.</span>
                : <span>Nouveau contenu disponible, cliquez sur recharger.</span>
              }
            </div>
            <div className="flex gap-2 justify-end">
              { needRefresh && (
                <button 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors" 
                  onClick={() => updateServiceWorker(true)}
                >
                  Recharger
                </button> 
              )}
              <button 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-lg transition-colors" 
                onClick={() => close()}
              >
                Fermer
              </button>
            </div>
        </div>
      }
    </div>
  )
}

export default PWAReloadPrompt
