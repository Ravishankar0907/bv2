import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { Badge } from '../../components/UI';
import { ArrowRight } from 'lucide-react';
import { ProductImage } from '../../components/ProductImage';

const Catalog: React.FC<{ onProductSelect: (id: string) => void }> = ({ onProductSelect }) => {
  const { products } = useStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Game Vault</h2>
        <p className="text-slate-400">Next-gen consoles, VR, and accessories ready for deployment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -5, shadow: "0 20px 40px -20px rgba(0,0,0,0.5)" }}
            className="bg-dark-card rounded-2xl overflow-hidden border border-slate-800 group cursor-pointer flex flex-col h-full"
            onClick={() => onProductSelect(product.id)}
          >
            <div className="relative h-48 overflow-hidden">
              <ProductImage
                mainSrc={product.imageUrl}
                fallbackSrc={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2">
                <Badge color={product.stock > 0 ? 'green' : 'red'}>
                  {product.stock > 0 ? `${product.stock}/${product.totalStock} left` : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <div className="text-xs text-brand-400 font-semibold mb-1">{product.category}</div>
              <h3 className="text-lg font-bold mb-2 leading-tight">{product.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                <div>
                  <span className="text-xl font-bold text-white">₹{product.pricePerWeek}</span>
                  <span className="text-xs text-slate-500"> / week</span>
                </div>
                <button className="p-2 rounded-full bg-slate-800 text-white group-hover:bg-brand-500 transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;