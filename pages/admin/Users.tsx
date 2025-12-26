import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Role, VerificationStatus } from '../../types';
import { Badge, Modal, Button } from '../../components/UI';
import { User as UserIcon, Shield, Search, FileText, CheckCircle, Clock, AlertTriangle, Save, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

const Users: React.FC = () => {
  const { allUsers, orders, updateUserNotes, createAdmin, deleteUser, transferPrimaryStatus, auth } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Add Admin State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });

  const handleOpenUser = (user: User) => {
    setSelectedUser(user);
    setNoteDraft(user.notes || '');
  };

  // ... inside render ...


  const handleCreateAdmin = () => {
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      alert("Please fill all fields");
      return;
    }
    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      name: newAdminData.name,
      email: newAdminData.email,
      role: Role.ADMIN,
      password: newAdminData.password,
      savedLocations: [],
      idVerificationStatus: VerificationStatus.VERIFIED
    };
    createAdmin(newAdmin);
    setIsAddAdminOpen(false);
    setNewAdminData({ name: '', email: '', password: '' });
  };

  const handleTransferPrimary = (targetUserId: string) => {
    if (window.confirm("Are you sure you want to make this user the Primary Admin? You will lose exclusive privileges.")) {
      transferPrimaryStatus(targetUserId);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(userId);
      if (selectedUser?.id === userId) setSelectedUser(null);
    }
  };

  const handleSaveNote = () => {
    if (selectedUser) {
      updateUserNotes(selectedUser.id, noteDraft);
      alert('Notes updated successfully');
    }
  };

  const userOrders = selectedUser ? orders.filter(o => o.userId === selectedUser.id) : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-slate-400">View registered users, verify IDs, and manage customer notes.</p>
        </div>
        {/* Only Primary Admin can add new admins */}
        {auth.user?.isPrimary && (
          <Button onClick={() => setIsAddAdminOpen(true)}>
            <Plus size={18} className="mr-2" /> Add Admin
          </Button>
        )}
      </div>

      {/* User List Table */}
      <div className="bg-dark-card rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">ID Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <span className="font-medium block">{user.name}</span>
                      {user.isPrimary && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">Primary</span>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{user.email}</td>
                  <td className="p-4 text-slate-400">{user.phone || '-'}</td>
                  <td className="p-4">
                    <Badge color={user.role === Role.ADMIN ? 'red' : 'blue'}>{user.role}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge color={
                      user.idVerificationStatus === VerificationStatus.VERIFIED ? 'green' :
                        user.idVerificationStatus === VerificationStatus.PENDING ? 'yellow' : 'red'
                    }>
                      {user.idVerificationStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenUser(user)}
                      className="text-brand-400 hover:text-white text-sm font-medium"
                    >
                      View
                    </button>
                    {/* Only allow deletion if not self and (if target is admin) only if current user is Primary */}
                    {user.id !== auth.user?.id && (
                      (user.role !== Role.ADMIN || auth.user?.isPrimary) && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )
                    )}

                    {/* Transfer Primary Status */}
                    {auth.user?.isPrimary && user.role === Role.ADMIN && user.id !== auth.user.id && (
                      <button
                        onClick={() => handleTransferPrimary(user.id)}
                        className="text-yellow-500 hover:text-yellow-400 text-sm font-medium ml-2"
                      >
                        Make Primary
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal isOpen={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} title="Create New Admin">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Name</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
              placeholder="Admin Name"
              value={newAdminData.name}
              onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
              placeholder="admin@example.com"
              value={newAdminData.email}
              onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
              placeholder="Secure Password"
              value={newAdminData.password}
              onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
            />
          </div>
          <Button onClick={handleCreateAdmin} className="w-full mt-4">Create Admin</Button>
        </div>
      </Modal>

      {/* User Detail Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
        {selectedUser && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-500 text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                {selectedUser.phone && (
                  <p className="text-slate-400 text-sm">📱 {selectedUser.phone}</p>
                )}
                <p className="text-slate-500 text-xs mt-1">ID: {selectedUser.id}</p>
              </div>
            </div>

            {/* ID Proof Section */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Shield size={18} className="text-brand-500" /> Identity Proof
              </h4>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <Badge color={
                    selectedUser.idVerificationStatus === VerificationStatus.VERIFIED ? 'green' :
                      selectedUser.idVerificationStatus === VerificationStatus.PENDING ? 'yellow' : 'red'
                  }>
                    Status: {selectedUser.idVerificationStatus}
                  </Badge>
                </div>
                {(selectedUser.hasIdProof || selectedUser.idProofUrl) ? (
                  <img
                    src={`${API_BASE_URL}/api/users/${selectedUser.id}/proof?ngrok-skip-browser-warning=true`}
                    alt="ID Proof"
                    className="w-full h-auto rounded-lg max-h-64 object-contain bg-black"
                  />
                ) : (
                  <p className="text-slate-500 italic text-sm">No ID proof uploaded.</p>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <FileText size={18} className="text-yellow-500" /> Admin Notes
              </h4>
              <p className="text-xs text-slate-400 mb-2">Internal notes about this user (visible only to admins).</p>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white min-h-[100px]"
                placeholder="Add notes here..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handleSaveNote} className="py-2 px-4 text-sm">
                  <Save size={14} /> Save Note
                </Button>
              </div>
            </div>

            {/* Rental History */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Clock size={18} className="text-brand-500" /> Rental History
              </h4>
              {userOrders.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {userOrders.map(order => (
                    <div key={order.id} className="bg-slate-800/30 p-3 rounded-lg flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold">{order.productName}</p>
                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">₹{order.totalPrice}</p>
                        <span className={`text-xs ${order.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No rental history found.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;