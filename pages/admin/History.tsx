import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Order } from '../../types';
import { Button, Modal, Badge, Input } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { Archive, CheckCircle, DollarSign, Plus, Trash2, Search, ArrowUpRight } from 'lucide-react';

const History: React.FC = () => {
    const { orders, updateOrderStatus, addOrderExpense, removeOrderExpense, deleteOrder } = useStore();

    // Filter for Returned (Needs settlement) and Completed (Done)
    const historyOrders = orders.filter(o => o.status === OrderStatus.RETURNED || o.status === OrderStatus.COMPLETED);

    const [selectedOrderForExpenses, setSelectedOrderForExpenses] = useState<Order | null>(null);
    const [expenseForm, setExpenseForm] = useState({ label: '', amount: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = historyOrders.filter(o =>
        o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.includes(searchTerm)
    );

    const handleMarkCompleted = (orderId: string) => {
        updateOrderStatus(orderId, OrderStatus.COMPLETED);
    };

    const handleDeleteOrder = (orderId: string) => {
        if (window.confirm("Are you sure you want to delete this order? This will remove all associated financials (revenue, expenses, profit).")) {
            deleteOrder(orderId);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold">Order History</h2>
                    <p className="text-slate-400">View returned items and settle completed orders.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-dark-card border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-dark-card p-12 rounded-2xl border border-slate-700 text-center">
                        <Archive className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-500">No History Found</h3>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const totalExpenses = order.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
                        const netRevenue = order.totalPrice - totalExpenses;
                        const isReturned = order.status === OrderStatus.RETURNED;

                        return (
                            <div key={order.id} className={`bg-dark-card p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center ${isReturned ? 'border-brand-500/50' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <ProductImage
                                        mainSrc={order.productImageUrl}
                                        fallbackSrc={order.productImage}
                                        alt=""
                                        className="w-12 h-12 rounded bg-slate-800 object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-white">{order.productName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>#{order.id}</span>
                                            <span>•</span>
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase">Net Revenue</p>
                                        <p className="font-bold text-green-400">₹{netRevenue}</p>
                                        {totalExpenses > 0 && <p className="text-xs text-red-400">-₹{totalExpenses} Exp</p>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge color={isReturned ? 'yellow' : 'green'}>
                                            {isReturned ? 'Returned (Pending Close)' : 'Completed'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedOrderForExpenses(order)}
                                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title="Manage Expenses"
                                        >
                                            <DollarSign size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                            title="Delete Order"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {isReturned && (
                                            <Button
                                                onClick={() => handleMarkCompleted(order.id)}
                                                className="py-1 px-3 text-xs h-8 bg-brand-600 hover:bg-brand-500"
                                            >
                                                Settle Order
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Expense Modal */}
            <Modal isOpen={!!selectedOrderForExpenses} onClose={() => setSelectedOrderForExpenses(null)} title={`Expenses: #${selectedOrderForExpenses?.id}`}>
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
                            <p className="text-sm text-slate-500 text-center py-4">No expenses recorded.</p>
                        )}
                    </div>

                    <form onSubmit={handleAddExpense} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 space-y-3">
                        <h5 className="font-bold text-sm text-slate-300">Add Post-Order Expense</h5>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Reason (e.g. Late fee refund, repairs)"
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

export default History;