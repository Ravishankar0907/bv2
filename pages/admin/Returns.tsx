import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, User, Order } from '../../types';
import { Button, Modal, Input } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { RotateCcw, MapPin, Calendar, Clock, AlertCircle, CheckCircle2, Phone, StickyNote, Save, DollarSign, Plus, Trash2, Info } from 'lucide-react';

const Returns: React.FC = () => {
    const { orders, updateOrderStatus, allUsers, updateUserNotes, addOrderExpense, removeOrderExpense } = useStore();

    // States
    const [selectedUserForNotes, setSelectedUserForNotes] = useState<User | null>(null);
    const [selectedOrderForExpenses, setSelectedOrderForExpenses] = useState<Order | null>(null);

    const [noteDraft, setNoteDraft] = useState('');
    const [expenseForm, setExpenseForm] = useState({ label: '', amount: '' });

    // Filter for orders that are currently with the customer (DELIVERED)
    const activeRentals = orders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .sort((a, b) => {
            const dateA = a.rentalEndDate ? new Date(a.rentalEndDate).getTime() : 0;
            const dateB = b.rentalEndDate ? new Date(b.rentalEndDate).getTime() : 0;
            return dateA - dateB;
        });

    const handleMarkReturned = (orderId: string) => {
        // Removed native confirm to allow immediate early collection/return processing
        updateOrderStatus(orderId, OrderStatus.RETURNED);
    };

    const getDaysRemaining = (endDateStr?: string) => {
        if (!endDateStr) return 0;
        const end = new Date(endDateStr);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleOpenNotes = (user: User) => {
        setSelectedUserForNotes(user);
        setNoteDraft(user.notes || '');
    };

    const handleSaveNote = () => {
        if (selectedUserForNotes) {
            updateUserNotes(selectedUserForNotes.id, noteDraft);
            setSelectedUserForNotes(null);
        }
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOrderForExpenses && expenseForm.label && expenseForm.amount) {
            addOrderExpense(selectedOrderForExpenses.id, {
                label: expenseForm.label,
                amount: parseFloat(expenseForm.amount)
            });
            setExpenseForm({ label: '', amount: '' });
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-3xl font-bold">Returns Management</h2>
                <p className="text-slate-400">Track active rentals, schedule collections, and manage return costs.</p>
            </div>

            {activeRentals.length === 0 ? (
                <div className="bg-dark-card p-12 rounded-2xl border border-slate-700 text-center">
                    <RotateCcw className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Active Returns</h3>
                    <p className="text-slate-400">There are no items currently out for rent awaiting return.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {activeRentals.map(order => {
                        const user = allUsers.find(u => u.id === order.userId);
                        const daysRemaining = getDaysRemaining(order.rentalEndDate);
                        const isOverdue = daysRemaining < 0;
                        const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;
                        const isEarly = daysRemaining > 3;
                        const hasNotes = user?.notes && user.notes.trim().length > 0;
                        const totalExpenses = order.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

                        return (
                            <div key={order.id} className={`bg-dark-card p-6 rounded-2xl border shadow-lg flex flex-col lg:flex-row gap-6 ${isOverdue ? 'border-red-500/50' : isDueSoon ? 'border-yellow-500/50' : 'border-slate-700'}`}>

                                {/* Date & Status Indicator */}
                                <div className="lg:w-48 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-700 pb-4 lg:pb-0 lg:pr-6 text-center lg:text-left">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Collection Due</span>
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                        <Calendar className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-slate-100'}`} />
                                        <span className={`text-lg font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                                            {order.rentalEndDate ? new Date(order.rentalEndDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>

                                    {isOverdue && (
                                        <div className="inline-flex items-center gap-1 justify-center lg:justify-start text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">
                                            <AlertCircle size={12} /> OVERDUE ({Math.abs(daysRemaining)} days)
                                        </div>
                                    )}
                                    {isDueSoon && (
                                        <div className="inline-flex items-center gap-1 justify-center lg:justify-start text-yellow-400 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded">
                                            <Clock size={12} /> Due in {daysRemaining} days
                                        </div>
                                    )}
                                    {isEarly && (
                                        <div className="inline-flex items-center gap-1 justify-center lg:justify-start text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded">
                                            <Info size={12} /> Early Return Allowed
                                        </div>
                                    )}
                                </div>

                                {/* Product & User Details */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <ProductImage mainSrc={order.productImageUrl} fallbackSrc={order.productImage} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">{order.productName}</h4>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-400">Rented by <span className="text-white font-medium">{user?.name}</span></p>
                                                {user && (
                                                    <button
                                                        onClick={() => handleOpenNotes(user)}
                                                        className={`text-xs px-2 py-1 rounded border flex items-center gap-1 transition-colors ${hasNotes ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                                                    >
                                                        <StickyNote size={12} /> {hasNotes ? 'Edit Notes' : 'Add Note'}
                                                    </button>
                                                )}
                                            </div>
                                            {user?.phone && (
                                                <div className="flex items-center gap-2 text-xs text-brand-400 mt-1">
                                                    <Phone size={12} /> {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Collection Address</p>
                                            <p className="text-xs text-slate-400">{order.deliveryLocation.address}</p>
                                            <p className="text-xs text-slate-500">PIN: {order.deliveryLocation.pincode}</p>
                                            {order.deliveryLocation.lat && order.deliveryLocation.lng && (
                                                <a
                                                    href={`https://maps.google.com/?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-brand-400 hover:underline flex items-center gap-1 mt-1 text-xs"
                                                >
                                                    View on Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 justify-center min-w-[200px] border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-6 lg:border-l border-slate-700">
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMarkReturned(order.id);
                                        }}
                                        className="w-full bg-slate-700 hover:bg-brand-600 border border-slate-600"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> {isEarly ? 'Collect Early' : 'Confirm Return'}
                                    </Button>

                                    <button
                                        onClick={() => setSelectedOrderForExpenses(order)}
                                        className="w-full py-2 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center justify-between text-sm transition-colors"
                                        title="Add damages or pickup costs"
                                    >
                                        <span className="flex items-center gap-2 text-slate-300"><DollarSign size={14} /> Expenses</span>
                                        <span className={`font-bold ${totalExpenses > 0 ? 'text-red-400' : 'text-slate-500'}`}>₹{totalExpenses}</span>
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* User Notes Modal */}
            <Modal isOpen={!!selectedUserForNotes} onClose={() => setSelectedUserForNotes(null)} title={`Notes: ${selectedUserForNotes?.name}`}>
                <div className="space-y-4">
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-white min-h-[120px]"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setSelectedUserForNotes(null)}>Cancel</Button>
                        <Button onClick={handleSaveNote} className="flex items-center gap-2"><Save size={16} /> Save Notes</Button>
                    </div>
                </div>
            </Modal>

            {/* Expense Modal */}
            <Modal isOpen={!!selectedOrderForExpenses} onClose={() => setSelectedOrderForExpenses(null)} title="Return Costs & Expenses">
                <div className="space-y-6">
                    <p className="text-sm text-slate-400">Log pickup charges, damages, or cleaning fees associated with this return.</p>
                    <div className="space-y-2">
                        {selectedOrderForExpenses?.expenses && selectedOrderForExpenses.expenses.length > 0 ? (
                            selectedOrderForExpenses.expenses.map(exp => (
                                <div key={exp.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <div>
                                        <p className="font-medium text-sm">{exp.label}</p>
                                        <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-red-400">-₹{exp.amount}</span>
                                        <button onClick={() => removeOrderExpense(selectedOrderForExpenses.id, exp.id)} className="text-slate-500 hover:text-red-400">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No expenses recorded.</p>
                        )}
                    </div>

                    <form onSubmit={handleAddExpense} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 space-y-3">
                        <h5 className="font-bold text-sm text-slate-300">Add New Expense</h5>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Reason (e.g. Broken Controller)"
                                    value={expenseForm.label}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, label: e.target.value })}
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    type="number"
                                    placeholder="₹"
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="secondary" className="w-full py-2 text-sm" disabled={!expenseForm.label || !expenseForm.amount}>
                            <Plus size={14} /> Add Cost
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Returns;