import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, VerificationStatus } from '../../types';
import { Button, Badge, Modal } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { Check, X, MapPin, User, FileText, ExternalLink, ShieldCheck, Calendar, Gamepad2, CreditCard } from 'lucide-react';

import { API_BASE_URL } from '../../constants';

const Requests: React.FC = () => {
  const { orders, updateOrderStatus, verifyUserId, allUsers, deleteOrder } = useStore();
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);

  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const handleVerifyUser = (userId: string) => {
    verifyUserId(userId);
  };



  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Request Queue</h2>
        <p className="text-slate-400">Review and approve customer rentals.</p>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="bg-dark-card p-12 rounded-2xl border border-slate-700 text-center">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold">All caught up!</h3>
          <p className="text-slate-400">There are no pending rental requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingOrders.map(order => {
            // Find the actual user for this order from the registry to get live status
            const user = allUsers.find(u => u.id === order.userId);
            const isVerified = user?.idVerificationStatus === VerificationStatus.VERIFIED;

            return (
              <div key={order.id} className="bg-dark-card rounded-2xl border border-slate-700 overflow-hidden flex flex-col lg:flex-row">
                {/* Product Info */}
                <div className="p-6 bg-slate-800/30 min-w-[300px] flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <ProductImage mainSrc={order.productImageUrl} fallbackSrc={order.productImage} alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold">{order.productName}</h4>
                      <p className="text-sm text-slate-400">ID: {order.productId}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span>{order.duration} {order.period}</span>
                    </div>

                    {/* Add-on Badges */}
                    {(order.psPlusExtra || order.extraController) && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/50">
                        {order.psPlusExtra && (
                          <div className="flex justify-between items-center bg-brand-500/10 p-2 rounded border border-brand-500/30">
                            <span className="text-brand-400 flex items-center gap-1 text-xs"><CreditCard size={12} /> PS Plus Extra:</span>
                            <span className="font-bold text-white text-xs">Included</span>
                          </div>
                        )}
                        {order.extraController && (
                          <div className="flex justify-between items-center bg-brand-500/10 p-2 rounded border border-brand-500/30">
                            <span className="text-brand-400 flex items-center gap-1 text-xs"><Gamepad2 size={12} /> Extra Controller:</span>
                            <span className="font-bold text-white text-xs">Included</span>
                          </div>
                        )}
                      </div>
                    )}

                    {order.rentalStartDate && order.rentalEndDate && (
                      <div className="flex justify-between items-start gap-4 pt-2">
                        <span className="text-slate-400">Dates:</span>
                        <div className="text-right text-slate-300">
                          <div>{new Date(order.rentalStartDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">to</div>
                          <div>{new Date(order.rentalEndDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Revenue:</span>
                      <span className="font-bold text-green-400">₹{order.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* User Info & Actions */}
                <div className="p-6 flex-1 flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-500" />
                      <span className="font-semibold">User Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <span className="text-slate-400">User Name:</span>
                      <span>{user?.name || order.userId}</span>

                      <span className="text-slate-400">Delivery To:</span>
                      <div>
                        <p className="font-medium text-white">{order.deliveryLocation?.name}</p>
                        <p className="text-xs text-slate-400">{order.deliveryLocation?.address}</p>
                        <p className="text-xs text-slate-500">PIN: {order.deliveryLocation?.pincode}</p>
                        {order.deliveryLocation && (
                          <a
                            href={`https://maps.google.com/?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-400 hover:underline flex items-center gap-1 mt-1"
                          >
                            <MapPin className="w-3 h-3" /> View on Map
                          </a>
                        )}
                      </div>

                      <span className="text-slate-400">ID Status:</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge color={isVerified ? 'green' : 'yellow'}>
                            {isVerified ? 'Verified' : 'Pending Review'}
                          </Badge>
                          {!user && <span className="text-xs text-red-400">(User not found)</span>}
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-slate-500 mb-2">ID Proof Document:</p>
                          <img
                            src={`${API_BASE_URL}/api/users/${order.userId}/proof?ngrok-skip-browser-warning=true`}
                            alt="ID Proof"
                            className="w-full max-w-sm h-auto rounded-lg border border-slate-700 bg-black"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.opacity = '0.3';
                              target.alt = 'Failed to load';
                            }}
                          />
                        </div>
                        {!isVerified && (
                          <button
                            onClick={() => {
                              console.log('Verifying user:', order.userId, 'User found:', !!user);
                              handleVerifyUser(order.userId);
                            }}
                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded border border-green-500 flex items-center gap-1 w-max mt-2"
                          >
                            <ShieldCheck size={12} /> Mark ID as Verified
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3 min-w-[150px] border-l border-slate-700 pl-6 border-t lg:border-t-0 pt-6 lg:pt-0">
                    <Button
                      onClick={() => updateOrderStatus(order.id, OrderStatus.CONFIRMED)}
                      className="bg-green-600 hover:bg-green-500 w-full"
                      disabled={!isVerified}
                      title={!isVerified ? "Please verify user ID first" : ""}
                    >
                      <Check className="w-4 h-4" /> {isVerified ? 'Approve Order' : 'Verify ID First'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (window.confirm("Reject and delete this request?")) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 w-full"
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={!!viewProofUrl}
        onClose={() => setViewProofUrl(null)}
        title="Identity Proof Document"
      >
        {viewProofUrl && (
          <img src={viewProofUrl} alt="User ID Proof" className="w-full h-auto rounded-lg" />
        )}
      </Modal>
    </div>
  );
};

export default Requests;