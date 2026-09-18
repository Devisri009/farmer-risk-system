import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Building, Home, Calendar, Edit2, Save, X, CheckCircle, Camera, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        state: '',
        district: '',
        taluk: '',
        village: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            setUser(response.data);
            setFormData({
                name: response.data.name || '',
                phone: response.data.phone || '',
                state: response.data.state || '',
                district: response.data.district || '',
                taluk: response.data.taluk || '',
                village: response.data.village || ''
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await apiClient.put('/auth/profile-update', formData);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            window.dispatchEvent(new Event('profile-update'));
            setIsEditing(false);
            setMessage({ type: 'success', text: t('profile.updateSuccess', 'Profile updated successfully!') });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: t('profile.updateError', 'Failed to update profile. Please try again.') });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setAvatarUploading(true);
        try {
            const response = await apiClient.post('/auth/avatar-update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            window.dispatchEvent(new Event('profile-update'));
            setMessage({ type: 'success', text: t('profile.avatarUpdateSuccess', 'Profile picture updated!') });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setMessage({ type: 'error', text: t('profile.avatarUpdateError', 'Failed to upload photo.') });
        } finally {
            setAvatarUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div 
                            className="w-24 h-24 rounded-full bg-white p-1 shadow-md relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center text-green-600 overflow-hidden relative">
                                {avatarUploading ? (
                                    <Loader2 className="animate-spin" size={30} />
                                ) : user?.avatar && user.avatar.startsWith('/') ? (
                                    <img 
                                        src={`http://localhost:5000${user.avatar}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <User size={40} />
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                className="hidden" 
                                accept="image/*" 
                            />
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                        <p className="text-gray-500 flex items-center gap-1">
                            <span className="capitalize">{user?.role ? t(`register.${user.role.toLowerCase()}`, user.role) : ''}</span> • {t('profile.joined')} {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow-md"
                        >
                            <Edit2 size={18} />
                            {t('profile.editProfile')}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-medium"
                            >
                                <X size={18} />
                                {t('profile.cancel')}
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save size={18} />
                                )}
                                {t('profile.saveChanges')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-green-600" />
                        {t('profile.personalInfo')}
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.fullName')}</label>
                            {isEditing ? (
                                <input 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1">{user?.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.username')}</label>
                            <p className="text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{user?.username}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.phone')}</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-800 font-medium flex items-center gap-2 px-1">
                                    <Phone size={16} className="text-gray-400" />
                                    {user?.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-green-600" />
                        {t('profile.locationDetails')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.state')}</label>
                            {isEditing ? (
                                <input 
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1 capitalize">{user?.state}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.district')}</label>
                            {isEditing ? (
                                <input 
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1 capitalize">{user?.district}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.taluk')}</label>
                            {isEditing ? (
                                <input 
                                    name="taluk"
                                    value={formData.taluk}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1 capitalize">{user?.taluk}</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">{t('profile.village')}</label>
                            {isEditing ? (
                                <input 
                                    name="village"
                                    value={formData.village}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1 capitalize">{user?.village}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Verification Details */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        {t('profile.identityVerification')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('profile.idType')}</label>
                            <p className="text-gray-800 font-semibold">{user?.governmentIdType || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('profile.idNumber')}</label>
                            <p className="text-gray-800 font-semibold">•••• •••• {user?.governmentIdNumber?.slice(-4)}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 italic">
                        {t('profile.idPrivacyNote')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
