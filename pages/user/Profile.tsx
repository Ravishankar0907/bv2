import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Input, FileUpload, Badge } from '../../components/UI';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { VerificationStatus } from '../../types';

const Profile: React.FC = () => {
  const { auth, updateProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
    age: auth.user?.age || ''
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
        alert("Name is required.");
        return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        alert("Invalid Phone Number: Please enter a valid 10-digit mobile number.");
        return;
    }
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      age: Number(formData.age)
    });
    setIsEditing(false);
  };

  const handleIdUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        updateProfile({ 
            idProofUrl: reader.result as string,
            idVerificationStatus: VerificationStatus.PENDING
        });
    };
    reader.readAsDataURL(file);
  };

  const status = auth.user?.idVerificationStatus || VerificationStatus.NONE;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <h2 className="text-3xl font-bold">My Profile</h2>

      <div className="bg-dark-card p-8 rounded-2xl border border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            disabled={!isEditing}
          />
          <Input 
            label="Email" 
            value={auth.user?.email || ''} 
            disabled={true}
            className="opacity-60 cursor-not-allowed"
          />
          <Input 
            label="Phone Number" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            disabled={!isEditing}
          />
          <Input 
            label="Age" 
            type="number"
            value={formData.age} 
            onChange={e => setFormData({...formData, age: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        
        <div className="flex justify-end pt-4">
          {isEditing ? (
            <div className="flex gap-2">
               <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button onClick={handleSave}>Save Changes</Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Details</Button>
          )}
        </div>
      </div>

      <div className="bg-dark-card p-8 rounded-2xl border border-slate-700 space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">ID Verification</h3>
            <Badge color={status === VerificationStatus.VERIFIED ? 'green' : status === VerificationStatus.PENDING ? 'yellow' : 'red'}>
                {status}
            </Badge>
        </div>
        <p className="text-slate-400 text-sm">Upload a government-issued ID to approve your rental requests.</p>

        {status === VerificationStatus.VERIFIED ? (
           <div className="flex items-center gap-4 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
              <CheckCircle className="text-green-500" />
              <div>
                <p className="font-semibold text-green-400">ID Verified</p>
                <p className="text-xs text-slate-400">Your identity has been confirmed. You can place orders instantly.</p>
              </div>
           </div>
        ) : status === VerificationStatus.PENDING ? (
            <div className="flex items-center gap-4 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
              <Clock className="text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-400">Verification Pending</p>
                <p className="text-xs text-slate-400">Our team is reviewing your ID document. This usually takes 24 hours.</p>
              </div>
           </div>
        ) : (
          <div className="space-y-4">
              <div className="flex items-center gap-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                 <AlertTriangle className="text-red-400" />
                 <p className="text-xs text-red-300">Please upload a valid ID proof (Passport, Driver's License).</p>
              </div>
              <FileUpload onFileSelect={handleIdUpload} />
          </div>
        )}
      </div>
      
      {/* Saved Locations List */}
      <div className="bg-dark-card p-8 rounded-2xl border border-slate-700 space-y-6">
        <h3 className="text-xl font-bold">Saved Locations</h3>
        {auth.user?.savedLocations && auth.user.savedLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auth.user.savedLocations.map(loc => (
                    <div key={loc.id} className="p-4 border border-slate-700 rounded-xl bg-slate-800/30">
                        <p className="font-bold">{loc.name}</p>
                        <p className="text-sm text-slate-400">{loc.address}</p>
                        <p className="text-xs text-slate-500 mt-1">PIN: {loc.pincode}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-slate-500 text-sm">No locations saved yet. Add one during checkout.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;