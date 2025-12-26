import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { RentalPeriod, SavedLocation, VerificationStatus, OrderStatus, User } from '../../types';
import { Button, Badge, Input, FileUpload } from '../../components/UI';
import { ProductImage } from '../../components/ProductImage';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, CheckCircle, Plus, Home, Navigation, AlertCircle, Lock, Gamepad2, CreditCard, Phone, Truck, Clock, Target, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onOrderSuccess: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onOrderSuccess }) => {
  const { products, placeOrder, auth, addLocation, updateProfile, orders, addonSettings } = useStore();
  const product = products.find(p => p.id === productId);

  const [period, setPeriod] = useState<RentalPeriod>(RentalPeriod.WEEKS);
  const [duration, setDuration] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [includePsPlusExtra, setIncludePsPlusExtra] = useState(false);
  const [includeExtraController, setIncludeExtraController] = useState(false);
  const [phone, setPhone] = useState(auth.user?.phone || '');

  // Calendar Tab State: 0 = Current Month, 1 = Next Month
  const [calendarTab, setCalendarTab] = useState<0 | 1>(0);

  // Location State
  const [viewMode, setViewMode] = useState<'SELECT' | 'ADD'>(
    (auth.user?.savedLocations && auth.user.savedLocations.length > 0) ? 'SELECT' : 'ADD'
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    auth.user?.savedLocations?.[0]?.id || null
  );

  const [newLocation, setNewLocation] = useState({
    name: 'Home',
    pincode: '',
    lat: 0,
    lng: 0
  });

  const [addressDetails, setAddressDetails] = useState({
    houseNo: '',
    building: '',
    street: '',
    landmark: ''
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [uploadedIdUrl, setUploadedIdUrl] = useState<string | null>(null);

  // Calendar Helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return { days, monthName: date.toLocaleString('default', { month: 'long', year: 'numeric' }) };
  };

  const currentMonthData = useMemo(() => getDaysInMonth(new Date()), []);
  const nextMonthData = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return getDaysInMonth(d);
  }, []);

  // Availability Logic
  const getBookedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (!product) return counts;

    orders
      .filter(o => o.productId === product.id && o.status === OrderStatus.CONFIRMED)
      .forEach(o => {
        if (!o.rentalStartDate || !o.rentalEndDate) return;
        let d = new Date(o.rentalStartDate);
        const end = new Date(o.rentalEndDate);
        while (d <= end) {
          const key = d.toDateString();
          counts.set(key, (counts.get(key) || 0) + 1);
          d.setDate(d.getDate() + 1);
        }
      });
    return counts;
  }, [orders, product]);

  const isDateFullyBooked = (date: Date) => {
    if (!product) return false;
    return (getBookedCounts.get(date.toDateString()) || 0) >= product.totalStock;
  };

  if (!product) return <div>Product not found</div>;

  const pricePerUnit = period === RentalPeriod.WEEKS ? product.pricePerWeek : product.pricePerMonth;
  const rentalPrice = pricePerUnit * duration;

  // Calculate Add-on Costs dynamically based on Period (Week/Month) and Duration
  const psPlusUnitPrice = period === RentalPeriod.WEEKS ? addonSettings.psPlusPriceWeek : addonSettings.psPlusPriceMonth;
  const controllerUnitPrice = period === RentalPeriod.WEEKS ? addonSettings.controllerPriceWeek : addonSettings.controllerPriceMonth;

  // Cost = Unit Price * Duration (since price is per week/month)
  const psPlusCost = includePsPlusExtra ? psPlusUnitPrice * duration : 0;
  const controllerCost = includeExtraController ? controllerUnitPrice * duration : 0;

  const totalPrice = rentalPrice + psPlusCost + controllerCost;

  const getEndDate = () => {
    if (!startDate) return null;
    const end = new Date(startDate);
    if (period === RentalPeriod.WEEKS) {
      end.setDate(end.getDate() + (duration * 7));
    } else {
      end.setMonth(end.getMonth() + duration);
    }
    return end;
  };

  const endDate = getEndDate();

  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setNewLocation(prev => ({
        ...prev,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }));
      setGpsAccuracy(position.coords.accuracy);
      setLocationLoading(false);
    };

    const onHighAccuracyError = (error: GeolocationPositionError) => {
      console.warn("High accuracy failed, attempting fallback:", error.message);
      // Fallback to low accuracy without alerting
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onFinalError,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    };

    const onFinalError = (error: GeolocationPositionError) => {
      console.error("Location error:", error);
      let msg = "Unable to retrieve location. Please check your device settings.";
      if (error.code === 1) msg = "Location permission denied. Please allow location access.";

      alert(msg);
      setLocationLoading(false);
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onHighAccuracyError,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSaveLocation = () => {
    if (!newLocation.name || !newLocation.pincode || newLocation.lat === 0 || !addressDetails.houseNo || !addressDetails.street) {
      alert("Please capture GPS location and fill in the mandatory address details (House No, Street, Pincode).");
      return;
    }

    // Construct robust address string
    const fullAddress = `${addressDetails.houseNo}, ${addressDetails.building ? addressDetails.building + ', ' : ''}${addressDetails.street}${addressDetails.landmark ? ', Landmark: ' + addressDetails.landmark : ''}`;

    const locationData: SavedLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocation.name,
      address: fullAddress,
      pincode: newLocation.pincode,
      lat: newLocation.lat,
      lng: newLocation.lng
    };

    addLocation(locationData);
    setSelectedLocationId(locationData.id);
    setViewMode('SELECT');
    setNewLocation({ name: 'Home', pincode: '', lat: 0, lng: 0 });
    setAddressDetails({ houseNo: '', building: '', street: '', landmark: '' });
    setGpsAccuracy(null);
  };

  const handleIdUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedIdUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isVerified = auth.user?.idVerificationStatus === VerificationStatus.VERIFIED;
  const isPending = auth.user?.idVerificationStatus === VerificationStatus.PENDING;
  // User is considered "Ready" if verified, pending (previously uploaded), or currently uploaded
  const hasIdProof = isVerified || isPending || !!uploadedIdUrl;

  const handleOrder = async () => {
    if (!auth.user) return;
    if (!startDate || !endDate) {
      alert("Please select a valid start date.");
      return;
    }

    if (auth.user.savedLocations.length === 0) {
      alert("You need to save a location before placing an order. Please add a new location.");
      return;
    }

    const deliveryLoc = auth.user.savedLocations.find(l => l.id === selectedLocationId);

    if (!deliveryLoc) {
      alert("Please select a delivery location.");
      return;
    }

    if (!hasIdProof) {
      alert("Please upload an ID proof to continue.");
      return;
    }

    // Phone Validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 10 || phoneDigits.length > 15) {
      alert("Invalid Phone Number: Please enter a valid 10-digit mobile number.");
      return;
    }

    // Prepare Profile Updates (Batching)
    const profileUpdates: Partial<User> = {};

    if (auth.user.phone !== phone) {
      profileUpdates.phone = phone;
    }

    if (auth.user.idVerificationStatus === VerificationStatus.NONE || auth.user.idVerificationStatus === VerificationStatus.REJECTED) {
      if (uploadedIdUrl) {
        profileUpdates.idProofUrl = uploadedIdUrl;
        profileUpdates.idVerificationStatus = VerificationStatus.PENDING;
      }
    }

    // Execute Updates if any
    if (Object.keys(profileUpdates).length > 0) {
      await updateProfile(profileUpdates);
    }

    await placeOrder({
      userId: auth.user.id,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      duration,
      period,
      totalPrice,
      deliveryLocation: deliveryLoc,
      rentalStartDate: startDate.toISOString(),
      rentalEndDate: endDate.toISOString(),
      psPlusExtra: includePsPlusExtra,
      extraController: includeExtraController
    });
    onOrderSuccess();
  };

  const CalendarGrid = ({ data }: { data: { days: (Date | null)[], monthName: string } }) => {
    const availableSaturdays = data.days.some(d => {
      if (!d) return false;
      const isSat = d.getDay() === 6;
      const isFuture = d >= today;
      const isBooked = isDateFullyBooked(d);
      return isSat && isFuture && !isBooked;
    });

    return (
      <div className="relative">
        <div className="bg-slate-800/50 p-4 rounded-b-xl rounded-tr-xl border-b border-l border-r border-slate-700/50 min-h-[280px]">
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3 text-slate-500">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div className="text-brand-400 font-bold">Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {data.days.map((date, i) => {
              if (!date) return <div key={i} />;

              const isSaturday = date.getDay() === 6;
              const isPast = date < today;
              const isFullyBooked = isDateFullyBooked(date);
              const isSelected = startDate && date.toDateString() === startDate.toDateString();
              const isDisabled = !isSaturday || isPast || isFullyBooked;

              // Green if available Saturday, Red if booked Saturday
              let className = "aspect-square rounded-lg flex items-center justify-center text-sm transition-all ";

              if (isSelected) {
                className += "bg-brand-500 text-white shadow-lg shadow-brand-500/50 font-bold";
              } else if (isDisabled) {
                if (isSaturday && isFullyBooked && !isPast) {
                  className += "bg-red-500/20 text-red-400 border border-red-500/50 cursor-not-allowed";
                } else {
                  className += "text-slate-600 cursor-not-allowed opacity-50";
                }
              } else {
                // Available Saturday
                className += "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 cursor-pointer font-medium";
              }

              return (
                <button
                  key={i}
                  onClick={() => !isDisabled && setStartDate(date)}
                  disabled={isDisabled}
                  className={className}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay for fully booked month */}
        {!availableSaturdays && (
          <div className="absolute inset-0 bg-dark-card/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 rounded-b-xl border border-slate-700/50">
            <Lock className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-white font-semibold">Fully Booked</p>
            <p className="text-xs text-slate-400 mt-1">We are fully booked for this month. Please check the next month.</p>
          </div>
        )}
      </div>
    )
  };

  const psPlusDisabled = addonSettings.psPlusStock <= 0;
  const controllerDisabled = addonSettings.controllerStock <= 0;
  const isPhoneValid = phone && phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 15;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-10">

      <div className="lg:col-span-12">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-2">
          <ArrowLeft size={18} /> Back to Catalog
        </button>
      </div>

      {/* Left Column: Product & Config */}
      <div className="lg:col-span-7 space-y-8">

        {/* Product Card */}
        <div className="bg-dark-card rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row gap-6">
          <ProductImage
            mainSrc={product.imageUrl}
            fallbackSrc={product.image}
            alt={product.name}
            className="w-full md:w-48 h-48 object-cover rounded-xl"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
              <Badge color={product.stock > 0 ? 'green' : 'red'}>
                {product.stock > 0 ? `${product.stock}/${product.totalStock} Available` : 'Out of Stock'}
              </Badge>
            </div>
            <p className="text-brand-400 font-medium mb-4">{product.category}</p>
            <p className="text-slate-400 text-sm">{product.description}</p>
          </div>
        </div>

        {/* Combined Date & Duration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection (Tabbed Calendar) */}
          <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base"><CalendarIcon className="w-4 h-4 text-brand-500" /> Start Date</h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCalendarTab(0)}
                className={`flex-1 py-1.5 rounded-t-lg text-xs font-medium transition-colors ${calendarTab === 0 ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {currentMonthData.monthName}
              </button>
              <button
                onClick={() => setCalendarTab(1)}
                className={`flex-1 py-1.5 rounded-t-lg text-xs font-medium transition-colors ${calendarTab === 1 ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {nextMonthData.monthName}
              </button>
            </div>

            <div className="flex-1">
              <CalendarGrid data={calendarTab === 0 ? currentMonthData : nextMonthData} />
            </div>

            {startDate && (
              <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-xs border border-slate-700 mt-auto">
                <span className="text-slate-400">Selected:</span>
                <span className="font-bold text-white">{startDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Duration Config */}
          <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-6 flex flex-col h-full">
            <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base"><CalendarIcon className="w-4 h-4 text-brand-500" /> Rental Duration</h3>

            <div className="flex bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPeriod(RentalPeriod.WEEKS)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${period === RentalPeriod.WEEKS ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Weeks
              </button>
              <button
                onClick={() => setPeriod(RentalPeriod.MONTHS)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${period === RentalPeriod.MONTHS ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Months
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="font-bold text-white text-lg">{duration} {period === RentalPeriod.WEEKS ? 'Week(s)' : 'Month(s)'}</span>
              </div>
              <input
                type="range"
                min="1"
                max={period === RentalPeriod.WEEKS ? 12 : 6}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Add-ons Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-slate-400">Add-ons</h4>

              {/* PS Plus Extra */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${psPlusDisabled ? 'border-slate-800 bg-slate-800/30 opacity-50 cursor-not-allowed' :
                  includePsPlusExtra ? 'border-brand-500/50 bg-brand-500/10' : 'border-slate-700 hover:border-slate-500'
                  }`}
                onClick={() => !psPlusDisabled && setIncludePsPlusExtra(!includePsPlusExtra)}
              >
                <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${includePsPlusExtra ? 'bg-brand-500 border-brand-500' : 'border-slate-500 bg-transparent'}`}>
                  {includePsPlusExtra && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      <CreditCard size={14} className="text-brand-400" /> PS Plus Extra
                    </div>
                    <span className="text-xs font-bold text-brand-400">₹{psPlusUnitPrice}/{period === RentalPeriod.WEEKS ? 'wk' : 'mo'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Access 100+ games & online multiplayer.</p>
                </div>
              </div>

              {/* Extra Controller */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${controllerDisabled ? 'border-slate-800 bg-slate-800/30 opacity-50 cursor-not-allowed' :
                  includeExtraController ? 'border-brand-500/50 bg-brand-500/10' : 'border-slate-700 hover:border-slate-500'
                  }`}
                onClick={() => !controllerDisabled && setIncludeExtraController(!includeExtraController)}
              >
                <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${includeExtraController ? 'bg-brand-500 border-brand-500' : 'border-slate-500 bg-transparent'}`}>
                  {includeExtraController && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      <Gamepad2 size={14} className="text-brand-400" /> Request Extra Controller
                    </div>
                    <span className="text-xs font-bold text-brand-400">₹{controllerUnitPrice}/{period === RentalPeriod.WEEKS ? 'wk' : 'mo'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Add a second controller to your order.</p>
                </div>
              </div>
            </div>

            {startDate && endDate && (
              <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-700/50 mt-auto">
                <span className="text-slate-500">Rental Ends:</span>
                <span className="text-brand-300 font-medium">{endDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Details */}
      <div className="lg:col-span-5 space-y-6">

        {/* Logistics Notice */}
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex gap-3 items-start">
          <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400 mt-1">
            <Truck size={20} />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Logistics Schedule</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2"><Clock size={12} className="text-brand-400" /> Delivery: <span className="text-slate-300">Saturdays, 12:00 PM – 6:00 PM</span></p>
              <p className="flex items-center gap-2"><Clock size={12} className="text-red-400" /> Pickup: <span className="text-slate-300">Saturdays, 8:00 AM – 12:00 PM</span></p>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">
              Please ensure availability at the registered address during these windows.
            </p>
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-500" /> Delivery Location</h3>
            {viewMode === 'SELECT' && (
              <button onClick={() => setViewMode('ADD')} className="text-xs text-brand-400 font-medium flex items-center gap-1 hover:text-brand-300">
                <Plus size={14} /> Add New
              </button>
            )}
            {viewMode === 'ADD' && auth.user?.savedLocations && auth.user.savedLocations.length > 0 && (
              <button onClick={() => setViewMode('SELECT')} className="text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'SELECT' ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {auth.user?.savedLocations.map(loc => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${selectedLocationId === loc.id ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <div className={`mt-1 rounded-full p-1.5 ${selectedLocationId === loc.id ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <Home size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{loc.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{loc.address}</p>
                      <p className="text-xs text-slate-500 mt-1">PIN: {loc.pincode}</p>
                    </div>
                    {selectedLocationId === loc.id && <CheckCircle size={18} className="ml-auto text-brand-500" />}
                  </div>
                ))}
                {auth.user?.savedLocations.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">No saved locations.</div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* GPS Capture Button */}
                <Button
                  variant="secondary"
                  onClick={handleUseCurrentLocation}
                  isLoading={locationLoading}
                  className={`w-full py-3 text-sm flex items-center justify-center gap-2 ${newLocation.lat !== 0 ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' : ''}`}
                >
                  <Target className="w-4 h-4" />
                  {newLocation.lat !== 0 ? 'Update GPS Location' : 'Capture GPS Location'}
                </Button>

                {/* Accuracy Indicator */}
                {newLocation.lat !== 0 && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${(gpsAccuracy || 100) < 20 ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      (gpsAccuracy || 100) < 100 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                        'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                      <div className="flex items-center gap-2">
                        <Target size={14} />
                        <span>Accuracy: ±{Math.round(gpsAccuracy || 0)} meters</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${newLocation.lat},${newLocation.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:underline font-medium"
                      >
                        Verify on Map <ExternalLink size={10} />
                      </a>
                    </div>
                    {(gpsAccuracy || 0) > 50 && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        GPS Accuracy: ±{Math.round(gpsAccuracy || 0)}m. We'll use your written address for precision.
                      </p>
                    )}
                  </div>
                )}

                {/* Address Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Location Name"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    />
                    <Input
                      placeholder="Pincode"
                      value={newLocation.pincode}
                      onChange={(e) => setNewLocation({ ...newLocation, pincode: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Flat / House No / Floor"
                    value={addressDetails.houseNo}
                    onChange={(e) => setAddressDetails({ ...addressDetails, houseNo: e.target.value })}
                  />
                  <Input
                    placeholder="Building / Apartment Name"
                    value={addressDetails.building}
                    onChange={(e) => setAddressDetails({ ...addressDetails, building: e.target.value })}
                  />
                  <Input
                    placeholder="Street / Area / Colony"
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                  />
                  <Input
                    placeholder="Landmark (Optional)"
                    value={addressDetails.landmark}
                    onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveLocation} className="w-full py-2" disabled={newLocation.lat === 0}>
                  Save Location
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact Details */}
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Phone className="w-5 h-5 text-brand-500" /> Contact Details</h3>
          <Input
            label="Phone Number"
            placeholder="Enter your mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-slate-500">We will call this number for delivery coordination.</p>
        </div>

        {/* ID Proof Verification */}
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5 text-brand-500" /> ID Verification</h3>

          {isVerified ? (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1 text-white"><CheckCircle size={16} /></div>
              <div>
                <p className="text-green-400 font-semibold text-sm">ID Verified</p>
                <p className="text-green-500/60 text-xs">One-time verification complete.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                {isPending ? 'Your ID is under review. You can upload a new one if needed.' : 'Upload a government ID for verification. This is a one-time process.'}
              </p>
              {uploadedIdUrl ? (
                <div className="relative rounded-xl overflow-hidden h-32 border border-slate-700">
                  <img src={uploadedIdUrl} alt="ID Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2"><CheckCircle size={16} /> Ready to submit</p>
                  </div>
                </div>
              ) : (
                <FileUpload onFileSelect={handleIdUpload} label="" />
              )}
            </div>
          )}
        </div>

        {/* Summary & Pay */}
        <div className="bg-dark-card p-6 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <span className="text-slate-400">Total Payable</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-white">₹{totalPrice}</span>
              <div className="flex flex-col items-end gap-1 mt-1">
                {includePsPlusExtra && <span className="text-xs text-brand-400">+ PS Plus Extra (₹{psPlusCost})</span>}
                {includeExtraController && <span className="text-xs text-brand-400">+ Extra Controller (₹{controllerCost})</span>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleOrder}
              className="w-full text-lg py-4"
              disabled={product.stock === 0 || !startDate || !hasIdProof || !selectedLocationId || !isPhoneValid}
            >
              {product.stock === 0 ? 'Currently Unavailable' :
                !startDate ? 'Select Date' :
                  !hasIdProof ? 'Upload ID to Continue' :
                    !selectedLocationId ? 'Select Delivery Location' :
                      !isPhoneValid ? 'Enter Valid Phone' :
                        'Place Request'}
            </Button>
            <p className="text-center text-xs text-slate-500">
              Payment collected via Cash/UPI on Delivery (POD).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;