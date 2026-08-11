import React, { useState, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  organization?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
}

interface Props {
  value?: string; // Client ID
  onChange: (clientId: string) => void;
  onClientData?: (client: Client) => void;
}

export const HadaraClientCombobox: React.FC<Props> = ({ value, onChange, onClientData }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', organization: '', whatsapp: '', email: '', address: '' });
  
  useEffect(() => {
    // Ideally fetch from real API here
    // fetch('/api/clients/').then(r => r.json()).then(setClients)
    // For now we'll mock or leave it ready for integration
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.organization && c.organization.toLowerCase().includes(search.toLowerCase())) ||
    (c.whatsapp && c.whatsapp.includes(search))
  );

  const selectedClient = clients.find(c => c.id === value);

  const handleCreate = async () => {
    if (!newClient.name || !newClient.whatsapp) return;
    
    // Call API to create client
    // const res = await fetch('/api/clients/', { method: 'POST', body: JSON.stringify(newClient) });
    // const created = await res.json();
    
    const created: Client = {
      id: `CLT-${Math.floor(Math.random()*1000)}`,
      ...newClient
    };
    
    setClients(prev => [created, ...prev]);
    onChange(created.id);
    onClientData?.(created);
    setIsCreating(false);
    setIsOpen(false);
    setNewClient({ name: '', organization: '', whatsapp: '', email: '', address: '' });
  };

  return (
    <div className="relative">
      <div 
        className="w-full bg-[#111827] border border-[#335A79] rounded-xl p-3 text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Client</span>
          <span className="font-medium">{selectedClient ? selectedClient.name : 'Sélectionner un client...'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-[#335A79] rounded-xl shadow-xl z-50 overflow-hidden">
          {!isCreating ? (
            <>
              <div className="p-3 border-b border-[#1f2937] flex items-center">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  className="bg-transparent text-white outline-none w-full"
                  placeholder="Rechercher (nom, organisation, whatsapp)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredClients.map(c => (
                  <div 
                    key={c.id} 
                    className="p-3 hover:bg-[#1f2937] cursor-pointer flex justify-between items-center"
                    onClick={() => { onChange(c.id); onClientData?.(c); setIsOpen(false); }}
                  >
                    <div>
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-sm text-gray-400">{c.whatsapp} • {c.organization}</div>
                    </div>
                    {value === c.id && <Check size={16} className="text-[#00C9A7]" />}
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <div className="p-3 text-gray-400 text-center">Aucun client trouvé.</div>
                )}
              </div>
              <div 
                className="p-3 border-t border-[#1f2937] text-[#00C9A7] font-medium cursor-pointer hover:bg-[#1f2937] flex items-center justify-center"
                onClick={() => setIsCreating(true)}
              >
                <Plus size={16} className="mr-2" /> Créer un nouveau client
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <h3 className="text-white font-medium mb-2">Nouveau Client</h3>
              <input type="text" placeholder="Nom *" className="w-full bg-[#070B18] border border-[#335A79] rounded p-2 text-white" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              <input type="text" placeholder="Organisation" className="w-full bg-[#070B18] border border-[#335A79] rounded p-2 text-white" value={newClient.organization} onChange={e => setNewClient({...newClient, organization: e.target.value})} />
              <input type="text" placeholder="WhatsApp *" className="w-full bg-[#070B18] border border-[#335A79] rounded p-2 text-white" value={newClient.whatsapp} onChange={e => setNewClient({...newClient, whatsapp: e.target.value})} />
              <input type="email" placeholder="Email" className="w-full bg-[#070B18] border border-[#335A79] rounded p-2 text-white" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              <input type="text" placeholder="Adresse" className="w-full bg-[#070B18] border border-[#335A79] rounded p-2 text-white" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} />
              <div className="flex space-x-2 pt-2">
                <button className="flex-1 p-2 bg-gray-700 text-white rounded" onClick={() => setIsCreating(false)}>Annuler</button>
                <button className="flex-1 p-2 bg-[#00C9A7] text-[#070B18] font-medium rounded" onClick={handleCreate} disabled={!newClient.name || !newClient.whatsapp}>Créer</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
