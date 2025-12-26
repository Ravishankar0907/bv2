import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, X } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline', isLoading?: boolean }> = ({ 
  children, variant = 'primary', isLoading, className, ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-900/20",
    secondary: "bg-dark-card hover:bg-slate-700 text-white border border-slate-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-500/10"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-medium text-dark-muted">{label}</label>}
    <input 
      className={`bg-dark-card border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-500 ${className}`} 
      {...props} 
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, color?: 'green' | 'yellow' | 'red' | 'blue' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    red: 'bg-red-500/20 text-red-400 border-red-500/50',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const FileUpload: React.FC<{ onFileSelect: (file: File) => void, label?: string }> = ({ onFileSelect, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-dark-muted">{label}</label>}
      <div 
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all group"
      >
        <Upload className="w-8 h-8 text-slate-500 group-hover:text-brand-500 mb-2 transition-colors" />
        <p className="text-sm text-slate-400 group-hover:text-brand-400">
          Drag & drop or click to upload
        </p>
        <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
      </div>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-card border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};