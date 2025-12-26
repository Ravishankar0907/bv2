import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, Briefcase, Minus, Plus, Save } from 'lucide-react';
import { Button, Input } from '../../components/UI';

const AdminDashboard: React.FC = () => {
  const { orders, globalFinancials, updateGlobalFinancials } = useStore();

  // 1. Calculate Revenue (Only from Confirmed/Delivered/Returned/Completed orders)
  const validStatuses = [OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.RETURNED, OrderStatus.COMPLETED];
  const revenueOrders = orders.filter(o => validStatuses.includes(o.status));
  const totalRevenue = revenueOrders.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);

  // 2. Calculate Direct Expenses (Tagged to orders)
  const totalDirectExpenses = orders.reduce((acc, order) => {
    const orderExpenses = order.expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
    return acc + orderExpenses;
  }, 0);

  // 3. Calculate Overheads
  // Explicitly cast Object.values to number[] to avoid TypeScript inference issues with arithmetic operations
  const totalOverheads = (Object.values(globalFinancials) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);

  // 4. Net Profit
  const netProfit = totalRevenue - totalDirectExpenses - totalOverheads;

  // Chart Data
  const revenueData = [
    { name: 'Revenue', value: totalRevenue, color: '#22c55e' },
    { name: 'Direct Exp', value: totalDirectExpenses, color: '#ef4444' },
    { name: 'Overheads', value: totalOverheads, color: '#f59e0b' },
    { name: 'Profit', value: netProfit, color: netProfit >= 0 ? '#3b82f6' : '#ec4899' },
  ];

  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <h4 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h4>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700`}>
        <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
      </div>
    </div>
  );

  // Local state for financials form
  const [localFinancials, setLocalFinancials] = useState(globalFinancials);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when global updates (e.g. initial fetch)
  React.useEffect(() => {
    setLocalFinancials(globalFinancials);
  }, [globalFinancials]);

  const handleFinancialChange = (field: keyof typeof globalFinancials, value: number) => {
    setLocalFinancials(prev => ({ ...prev, [field]: value }));
    setHasChanges(true); // Enable save button
  };

  const saveFinancials = () => {
    updateGlobalFinancials(localFinancials);
    setHasChanges(false);
  };

  const OverheadInput = ({ label, field }: { label: string, field: keyof typeof globalFinancials }) => {
    const [adjustment, setAdjustment] = useState<string>('');

    const handleUpdate = () => {
      const value = parseInt(adjustment);
      if (!isNaN(value) && value !== 0) {
        handleFinancialChange(field, Math.max(0, localFinancials[field] + value));
        setAdjustment('');
      }
    };

    return (
      <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 flex items-center justify-between hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-4">
          <div className="bg-slate-700 p-3 rounded-lg text-slate-300">
            <Briefcase size={20} />
          </div>
          <span className="font-medium text-slate-200 text-lg w-32">{label}</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Current Value (Read-only) */}
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase tracking-wider mb-1">Current</span>
            <span className="font-mono font-bold text-white text-2xl">₹{localFinancials[field].toLocaleString()}</span>
          </div>

          {/* Adjustment Input */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 text-2xl font-light">|</span>
            <input
              type="number"
              placeholder="+/-"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              className="bg-slate-900/50 text-right w-24 py-2 px-3 rounded-lg font-mono text-base outline-none border border-slate-700 focus:border-brand-500 transition-colors placeholder:text-slate-600 text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
            <button
              onClick={handleUpdate}
              disabled={!adjustment}
              className="p-2.5 bg-slate-700 hover:bg-brand-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-bold">Financial Dashboard</h2>
        <p className="text-slate-400">Real-time overview of revenue, expenses, and profitability.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtext={`${revenueOrders.length} processed orders`}
          color="text-green-500"
        />
        <StatCard
          icon={Activity}
          label="Order Expenses"
          value={`₹${totalDirectExpenses.toLocaleString()}`}
          subtext="Shipping, Repairs, Damages"
          color="text-red-400"
        />
        <StatCard
          icon={Briefcase}
          label="Fixed Overheads"
          value={`₹${totalOverheads.toLocaleString()}`}
          subtext="Salaries, Rent, Ads"
          color="text-yellow-500"
        />
        <StatCard
          icon={Wallet}
          label="Net Profit"
          value={`₹${netProfit.toLocaleString()}`}
          subtext="Revenue - (Expenses + Overheads)"
          color={netProfit >= 0 ? "text-blue-500" : "text-pink-500"}
        />
      </div>

      <div className="space-y-8">
        {/* Chart Section - Now Full Width */}
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 h-[400px]">
          <h3 className="text-lg font-bold mb-6">Financial Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                cursor={{ fill: '#334155', opacity: 0.2 }}
              />
              <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overhead Management - Now Full Width & Larger */}
        <div className="bg-dark-card p-8 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Overhead Management</h3>
              <p className="text-slate-400">Manage monthly fixed operations expenses.</p>
            </div>
            {hasChanges && (
              <Button onClick={saveFinancials} className="px-6 py-3 text-sm h-12 bg-green-600 hover:bg-green-500 animate-pulse font-bold tracking-wide">
                <Save size={18} className="mr-2" /> Save Changes
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OverheadInput label="Salaries" field="salary" />
            <OverheadInput label="EMI / Rent" field="emi" />
            <OverheadInput label="Subscriptions" field="subscriptions" />
            <OverheadInput label="Marketing / Ads" field="ads" />
            <div className="md:col-span-2">
              <OverheadInput label="Miscellaneous" field="other" />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-700 flex justify-end items-center gap-6">
            <span className="text-slate-400 text-lg">Total Monthly Overhead:</span>
            <span className="font-bold text-4xl text-white">₹{totalOverheads.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;