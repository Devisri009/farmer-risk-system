import React, { useState, useEffect } from 'react';
import { 
  User, 
  Globe, 
  Bell, 
  MapPin, 
  Sprout, 
  TrendingUp, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Shield,
  Phone,
  MessageCircle,
  AlertTriangle,
  X,
  Check,
  Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'location', 'crops'

  // Edit States
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    state: 'Tamil Nadu',
    crops: []
  });

  const allCrops = ['Paddy', 'Tomato', 'Onion', 'Banana', 'Cotton', 'Turmeric', 'Coconut', 'Sugarcane'];

  // Notification states
  const [notifications, setNotifications] = useState({
    weather: true,
    market: true,
    disease: false,
    community: true,
    priceChange: true
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditData({
        name: parsedUser.name || '',
        phone: parsedUser.phone || '',
        village: parsedUser.village || '',
        district: parsedUser.district || '',
        state: parsedUser.state || 'Tamil Nadu',
        crops: parsedUser.crops || []
      });
    }
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    toast.success(lang === 'ta' ? 'தமிழ் மாற்றப்பட்டது' : 'Language changed to English');
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = () => {
    const updatedUser = { ...user, ...editData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setActiveModal(null);
    toast.success(t('settings.saveSuccess', 'Settings saved successfully!'));
  };

  const toggleCrop = (crop) => {
    setEditData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop) 
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success(t('auth.logoutSuccess', 'Logged out successfully'));
    navigate('/login');
  };

  const SettingRow = ({ icon: Icon, title, subtitle, onClick, rightElement, color = "text-gray-600", bgColor = "bg-gray-50" }) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 mb-3 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {rightElement ? rightElement : <ChevronRight size={20} className="text-gray-300 group-hover:text-green-500 transition-colors" />}
    </div>
  );

  const Toggle = ({ active, onToggle }) => (
    <div 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${active ? 'bg-green-600' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${active ? 'left-7' : 'left-1'} shadow-sm`} />
    </div>
  );

  const Modal = ({ title, children, onSave }) => (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6 mb-8">
          {children}
        </div>

        <button 
          onClick={onSave}
          className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {t('settings.save', 'Save Changes')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 p-4 md:p-0 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings.title', 'Settings')}</h1>
        <p className="text-gray-500 font-medium">{t('settings.subtitle', 'Manage your profile and app preferences')}</p>
      </div>

      {/* Profile Header */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-green-900/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 text-2xl font-black">
              {user?.name?.[0] || 'F'}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.name || 'Farmer Name'}</h3>
              <p className="text-green-100 font-medium opacity-90">{user?.village || 'Location not set'}</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('profile')}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md transition-all"
          >
            <User size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 px-2">
          <Shield size={18} className="text-green-600" />
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('settings.account', 'Account & Preferences')}</h2>
        </div>
        
        <SettingRow 
          icon={User} 
          title={t('settings.personalInfo', 'Personal Information')}
          subtitle={t('settings.editInfo', 'Update name and phone')}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          onClick={() => setActiveModal('profile')}
        />
        <SettingRow 
          icon={MapPin} 
          title={t('settings.location', 'My Location')}
          subtitle={user?.village ? `${user.village}, ${user.district}` : t('settings.setLocation', 'Village, District, State')}
          color="text-orange-600"
          bgColor="bg-orange-50"
          onClick={() => setActiveModal('location')}
        />
        <SettingRow 
          icon={Sprout} 
          title={t('settings.cropPreferences', 'My Crops')}
          subtitle={user?.crops?.length > 0 ? user.crops.join(', ') : t('settings.selectCrops', 'Choose what you grow')}
          color="text-green-600"
          bgColor="bg-green-50"
          onClick={() => setActiveModal('crops')}
        />
      </section>

      {/* Language Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Globe size={18} className="text-blue-600" />
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('settings.language', 'Language')}</h2>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-gray-100 gap-2">
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 py-3 rounded-xl font-black transition-all ${i18n.language === 'en' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            English
          </button>
          <button 
            onClick={() => handleLanguageChange('ta')}
            className={`flex-1 py-3 rounded-xl font-black transition-all ${i18n.language === 'ta' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            தமிழ்
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Bell size={18} className="text-amber-600" />
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('settings.notifications', 'Alert Settings')}</h2>
        </div>
        
        <SettingRow 
          icon={AlertTriangle} 
          title={t('settings.weatherAlerts', 'Weather Alerts')}
          subtitle={t('settings.weatherAlertsSub', 'Get storm and rain warnings')}
          color="text-amber-600"
          bgColor="bg-amber-50"
          rightElement={<Toggle active={notifications.weather} onToggle={() => toggleNotification('weather')} />}
        />
        <SettingRow 
          icon={TrendingUp} 
          title={t('settings.marketPriceAlerts', 'Market Price Alerts')}
          subtitle={t('settings.marketPriceAlertsSub', 'When prices change significantly')}
          color="text-blue-600"
          bgColor="bg-blue-50"
          rightElement={<Toggle active={notifications.market} onToggle={() => toggleNotification('market')} />}
        />
        <SettingRow 
          icon={Shield} 
          title={t('settings.diseaseAlerts', 'Crop Disease Alerts')}
          subtitle={t('settings.diseaseAlertsSub', 'Early warning for pest outbreaks')}
          color="text-red-600"
          bgColor="bg-red-50"
          rightElement={<Toggle active={notifications.disease} onToggle={() => toggleNotification('disease')} />}
        />
      </section>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-black border border-red-100 active:scale-95 shadow-lg shadow-red-900/5 mb-10"
      >
        <LogOut size={24} />
        {t('settings.logout', 'Logout')}
      </button>

      {/* --- MODALS --- */}

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <Modal title={t('settings.editProfile', 'Edit Profile')} onSave={saveSettings}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
              <input 
                value={editData.name}
                onChange={e => setEditData({...editData, name: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Ex: Kalaiselvan"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone Number</label>
              <input 
                value={editData.phone}
                onChange={e => setEditData({...editData, phone: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="+91 00000 00000"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Location Modal */}
      {activeModal === 'location' && (
        <Modal title={t('settings.editLocation', 'Edit Location')} onSave={saveSettings}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Village</label>
              <input 
                value={editData.village}
                onChange={e => setEditData({...editData, village: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter village name"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">District</label>
              <input 
                value={editData.district}
                onChange={e => setEditData({...editData, district: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter district"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Crops Modal */}
      {activeModal === 'crops' && (
        <Modal title={t('settings.editCrops', 'My Crops')} onSave={saveSettings}>
          <p className="text-sm text-gray-500 font-medium mb-4">Select the crops you grow for personal alerts.</p>
          <div className="grid grid-cols-2 gap-3">
            {allCrops.map(crop => {
              const selected = editData.crops.includes(crop);
              return (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all font-bold ${selected ? 'border-green-600 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 text-gray-500'}`}
                >
                  {crop}
                  {selected ? <Check size={18} /> : <div className="w-[18px]" />}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      <div className="text-center text-gray-300 text-xs font-bold pb-10 uppercase tracking-widest">
        FarmVista v1.2.0 • Made with ❤️ for Farmers
      </div>
    </div>
  );
};

export default Settings;
