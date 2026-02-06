
import React, { useState } from 'react';
import { User, Mail, Phone, Notebook, PlusCircle, Users, Sparkles, Edit, Trash2, XCircle } from 'lucide-react';
import { Client } from '../types';

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      setValidationError('Client name and email are required.');
      return;
    }
    setValidationError('');

    if (editingClient) {
      // Update existing client
      setClients(clients.map(client =>
        client.id === editingClient.id
          ? { ...client, name: newClientName, email: newClientEmail, phone: newClientPhone, notes: newClientNotes }
          : client
      ));
      setEditingClient(null); // Exit editing mode
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(), // Simple unique ID generation
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone,
        notes: newClientNotes,
        lastSession: undefined,
      };
      setClients([...clients, newClient]);
    }

    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClientName(client.name);
    setNewClientEmail(client.email);
    setNewClientPhone(client.phone);
    setNewClientNotes(client.notes);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to form
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      setClients(clients.filter(client => client.id !== id));
      if (editingClient?.id === id) {
        setEditingClient(null);
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPhone('');
        setNewClientNotes('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
    setValidationError('');
  };

  return (
    <div className="space-y-8">
      {/* Add/Edit New Client Form */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" ref={formRef}>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          {editingClient ? <Edit className="w-5 h-5 text-indigo-500" /> : <PlusCircle className="w-5 h-5 text-indigo-500" />}
          {editingClient ? 'Edit Client Details' : 'Add New Client'}
        </h3>
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4" />
            <p className="text-sm">{validationError}</p>
          </div>
        )}
        <form onSubmit={handleSubmitClient} className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 mt-4 mb-2">Client Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Client Full Name *"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                required
                aria-label="Client Full Name"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address *"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                required
                aria-label="Email Address"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                aria-label="Phone Number"
              />
            </div>
          </div>
          <div className="relative">
            <Notebook className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea
              placeholder="Notes (e.g., initial consultation highlights, client goals)"
              value={newClientNotes}
              onChange={(e) => setNewClientNotes(e.target.value)}
              className="w-full h-24 pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y text-slate-700"
              aria-label="Client Notes"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
              disabled={!newClientName || !newClientEmail}
            >
              {editingClient ? (
                <><Edit className="w-5 h-5" /> Update Client</>
              ) : (
                <><PlusCircle className="w-5 h-5" /> Add Client</>
              )}
            </button>
            {editingClient && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-none w-auto px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-100"
              >
                <XCircle className="w-5 h-5" /> Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Client List */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          My Clients ({clients.length})
        </h3>
        {clients.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-200" />
            <p className="font-medium">No clients added yet.</p>
            <p className="text-sm text-slate-400">Add your first client above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-slate-800">{client.name}</h4>
                  <p className="text-sm text-slate-500">{client.email}</p>
                  {client.phone && <p className="text-xs text-slate-400 mt-0.5">{client.phone}</p>}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={() => handleEditClient(client)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={`Edit ${client.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={`Delete ${client.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientManager;
