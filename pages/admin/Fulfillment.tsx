import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, User, Order } from '../../types';
import { Button, Modal, Input } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { Truck, MapPin, Gamepad2, CheckCircle2, CreditCard, StickyNote, Save, DollarSign, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

const Fulfillment: React.FC = () => {
    const { orders, updateOrderStatus, allUsers, updateUserNotes, addOrderExpense, removeOrderExpense } = useStore();
    const confirmedOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED);

    // Modal States
    const [selectedUserForNotes, setSelectedUserForNotes] = useState<User | null>(null);
    const [selectedOrderForExpenses, setSelectedOrderForExpenses] = useState<Order | null>(null);

    const [noteDraft, setNoteDraft] = useState('');
    const [expenseForm, setExpenseForm] = useState({ label: '', amount: '' });

    const handleMarkDelivered = (orderId: string) => {
        // Directly update status without blocking confirm dialog
        updateOrderStatus(orderId, OrderStatus.DELIVERED);
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
                <h2 className="text-3xl font-bold">Fulfillment</h2>
                <p className="text-slate-400">Manage delivery logistics and track shipping costs.</p>
            </div>

            {confirmedOrders.length === 0 ? (
                <div className="bg-dark-card p-12 rounded-2xl border border-slate-700 text-center">
                    <Truck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Pending Deliveries</h3>
                    <p className="text-slate-400">All approved orders have been fulfilled.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {confirmedOrders.map(order => {
                        const user = allUsers.find(u => u.id === order.userId);
                        const hasNotes = user?.notes && user.notes.trim().length > 0;
                        const totalExpenses = order.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
                        const isEarlyDelivery = order.rentalStartDate && new Date(order.rentalStartDate) > new Date();

                        return (
                            <div key={order.id} className="bg-dark-card p-6 rounded-2xl border border-slate-700 border-l-4 border-l-blue-500 shadow-lg">
                                <div className="flex flex-col lg:flex-row gap-8 justify-between">

                                    {/* Order & Product Details */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <ProductImage mainSrc={order.productImageUrl} fallbackSrc={order.productImage} alt="" className="w-20 h-20 rounded-lg object-cover bg-slate-800" />
                                            <div>
                                                <h4 className="font-bold text-lg">{order.productName}</h4>
                                                <p className="text-sm text-slate-400">Order #{order.id}</p>

                                                {order.rentalStartDate && (
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-200 bg-blue-500/10 px-2 py-1 rounded w-fit border border-blue-500/20">
                                                        <Calendar size={14} />
                                                        <span className="font-semibold">Deliver by: {new Date(order.rentalStartDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}

                                                {isEarlyDelivery && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-yellow-500">
                                                        <AlertCircle size={10} />
                                                        <span>Early delivery allowed</span>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                        {order.duration} {order.period}
                                                    </div>
                                                    {order.psPlusExtra && (
                                                        <div className="text-xs bg-brand-500/20 text-brand-400 px-2 py-1 rounded flex items-center gap-1 border border-brand-500/30">
                                                            <CreditCard size={10} /> PS Plus Extra
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className="flex-1 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-8">
                                        <h5 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-2">Delivery Details</h5>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-lg">{user?.name}</p>
                                            {user && (
                                                <button
                                                    onClick={() => handleOpenNotes(user)}
                                                    className={`text-xs px-2 py-1 rounded border flex items-center gap-1 transition-colors ${hasNotes ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                                                >
                                                    <StickyNote size={12} /> {hasNotes ? 'Edit Notes' : 'Add Note'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <p className="text-sm text-white mb-1">{order.deliveryLocation.name}</p>
                                            <p className="text-xs text-slate-400">{order.deliveryLocation.address}</p>
                                            <p className="text-xs text-slate-500">PIN: {order.deliveryLocation.pincode}</p>
                                            {order.deliveryLocation.lat && order.deliveryLocation.lng && (
                                                <a
                                                    href={`https://maps.google.com/?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-brand-400 hover:underline flex items-center gap-1 mt-2 text-xs"
                                                >
                                                    <MapPin className="w-3 h-3" /> View on Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions & Expenses */}
                                    <div className="flex flex-col gap-3 justify-center min-w-[200px] border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-8 lg:border-l border-slate-700">
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleMarkDelivered(order.id);
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-500"
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> Mark Delivered
                                        </Button>

                                        <button
                                            onClick={() => setSelectedOrderForExpenses(order)}
                                            className="w-full py-2 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center justify-between text-sm transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-slate-300"><DollarSign size={14} /> Expenses</span>
                                            <span className={`font-bold ${totalExpenses > 0 ? 'text-red-400' : 'text-slate-500'}`}>₹{totalExpenses}</span>
                                        </button>
                                    </div>

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
            <Modal isOpen={!!selectedOrderForExpenses} onClose={() => setSelectedOrderForExpenses(null)} title="Manage Order Expenses">
                <div className="space-y-6">
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
                            <p className="text-sm text-slate-500 text-center py-4">No expenses recorded for this order yet.</p>
                        )}
                    </div>

                    <form onSubmit={handleAddExpense} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 space-y-3">
                        <h5 className="font-bold text-sm text-slate-300">Add New Cost</h5>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Label (e.g. Shipping, Packaging)"
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
                            <Plus size={14} /> Add Expense
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Fulfillment;