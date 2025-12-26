import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Badge } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { OrderStatus } from '../../types';

const UserOrders: React.FC = () => {
  const { orders, auth } = useStore();
  const myOrders = orders.filter(o => o.userId === auth.user?.id);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED: return 'green';
      case OrderStatus.PENDING: return 'yellow';
      case OrderStatus.REJECTED: return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold">My Rentals</h2>

      {myOrders.length === 0 ? (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-slate-800">
          <p className="text-slate-400 mb-4">You haven't rented anything yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} className="bg-dark-card p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
              <ProductImage mainSrc={order.productImageUrl} fallbackSrc={order.productImage} alt={order.productName} className="w-24 h-24 object-cover rounded-lg bg-slate-800" />

              <div className="flex-grow text-center md:text-left">
                <h3 className="font-bold text-lg">{order.productName}</h3>
                <div className="flex flex-col md:flex-row gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
                  <span>Duration: {order.duration} {order.period.toLowerCase()}</span>
                  <span>•</span>
                  <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.rentalStartDate && order.rentalEndDate && (
                  <div className="mt-2 inline-block bg-slate-800 px-3 py-1 rounded text-xs text-slate-300">
                    {new Date(order.rentalStartDate).toLocaleDateString()} — {new Date(order.rentalEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-brand-400 mb-2">₹{order.totalPrice}</p>
                <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;