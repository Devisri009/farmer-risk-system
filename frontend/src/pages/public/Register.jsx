import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import registerIllustration from '../../assets/register-illustration.png';

/* ── Reusable input renderer ── */
const InputField = ({ label, name, type = 'text', placeholder, value, onChange, error, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm
                ${error
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500'
                }`}
        />
        {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>
        )}
    </div>
);

const SelectField = ({ label, name, options, value, onChange, error, required = true, placeholder = "Select option" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm appearance-none bg-white
                ${error
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500'
                }`}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>
        )}
    </div>
);

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();



    const [role, setRole] = useState('farmer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        government_id_type: '',
        government_id_number: '',
        state: '',
        district: '',
        taluk: '',
        village: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = t('register.nameRequired', 'Full name is required');
        if (!formData.username.trim()) newErrors.username = t('register.usernameRequired', 'Username is required');
        if (!formData.phone.trim()) {
            newErrors.phone = t('register.phoneRequired', 'Phone number is required');
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = t('register.phoneInvalid', 'Enter a valid 10-digit phone number');
        }

        if (!formData.password) {
            newErrors.password = t('register.passwordRequired', 'Password is required');
        } else if (formData.password.length < 6) {
            newErrors.password = t('register.passwordMin', 'Password must be at least 6 characters');
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('register.confirmRequired', 'Please confirm your password');
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('register.passMismatch', 'Passwords do not match');
        }

        if (!formData.government_id_type) {
            newErrors.government_id_type = t('register.idTypeRequired', 'ID type is required');
        }

        if (!formData.government_id_number.trim()) {
            newErrors.government_id_number = t('register.idNumRequired', 'ID number is required');
        } else {
            const idNumber = formData.government_id_number.trim();
            if (formData.government_id_type === 'Aadhaar Number') {
                if (!/^\d{12}$/.test(idNumber)) {
                    newErrors.government_id_number = t('register.aadhaarDigits', 'Aadhaar must be 12 digits');
                }
            } else if (formData.government_id_type === 'PAN Number') {
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idNumber)) {
                    newErrors.government_id_number = t('register.panFormat', 'PAN must be format ABCDE1234F');
                }
            } else if (formData.government_id_type === 'Voter ID') {
                if (!/^[A-Z]{3}[0-9]{7}$/.test(idNumber)) {
                    newErrors.government_id_number = t('register.voterFormat', 'Voter ID must be format ABC1234567');
                }
            }
        }

        if (!formData.state) newErrors.state = t('register.stateRequired', 'State is required');
        if (!formData.district) newErrors.district = t('register.districtRequired', 'District is required');
        if (!formData.taluk) newErrors.taluk = t('register.talukRequired', 'Taluk is required');
        if (!formData.village) newErrors.village = t('register.villageRequired', 'Village is required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMsg('');

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const payload = {
                role,
                name: formData.name.trim(),
                username: formData.username.trim().toLowerCase(),
                phone: formData.phone.replace(/\s/g, ''),
                password: formData.password,
                government_id_type: formData.government_id_type,
                government_id_number: formData.government_id_number.trim(),
                state: formData.state,
                district: formData.district,
                taluk: formData.taluk,
                village: formData.village
            };

            const response = await apiClient.post('/auth/register', payload);
            const { access_token, user } = response.data;

            // Log the user in immediately
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setSuccessMsg(t('register.successMsg', 'Account created successfully! Welcome to FarmVista.'));

            setTimeout(() => {
                if (user.role === 'farmer') {
                    navigate('/farmer/dashboard');
                } else {
                    navigate('/consumer/dashboard');
                }
            }, 1000);
        } catch (err) {
            const message = dir => (dir.response?.data?.detail || dir.response?.data?.message || t('register.failMsg', 'Registration failed.'));
            setApiError(err.response?.data?.detail || err.response?.data?.message || t('register.failMsg', 'Registration failed.'));
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* ════════════ LEFT — Platform Introduction ════════════ */}
            <div className="lg:w-[48%] w-full flex flex-col justify-center items-center px-8 py-12 lg:py-0"
                style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)' }}>

                <div className="max-w-md w-full space-y-6">
                    <span className="inline-block text-xs font-bold tracking-[0.2em] text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase">
                        FarmVista
                    </span>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                        {t('register.heading', 'Smart Digital')}<br />{t('register.subheading', 'Agriculture Platform')}
                    </h1>

                    <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                        {t('register.description', 'FarmVista helps farmers and retailers connect through a climate-aware agricultural marketplace. Monitor climate risks, track crop batches, and trade crops with full transparency.')}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {[
                            { id: '1', label: t('register.feat1', 'Climate Monitoring') },
                            { id: '2', label: t('register.feat2', 'Crop Tracking') },
                            { id: '3', label: t('register.feat3', 'Secure Trading') }
                        ].map((f) => (
                            <span key={f.id} className="text-xs font-medium text-green-800 bg-white/70 border border-green-200 px-3 py-1 rounded-full backdrop-blur-sm">
                                {f.label}
                            </span>
                        ))}
                    </div>

                    <div className="pt-4">
                        <img
                            src={registerIllustration}
                            alt="Sustainable agriculture — farmers working in a field"
                            className="w-full max-w-lg mx-auto rounded-3xl shadow-xl hover:scale-[1.02] transition-transform duration-500 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* ════════════ RIGHT — Register Form ════════════ */}
            <div className="lg:w-[52%] w-full flex items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-10">
                        <div className="mb-7">
                            <h2 className="text-2xl font-bold text-gray-900">{t('register.createAccountTitle', 'Create Account')}</h2>
                            <p className="text-gray-500 text-sm mt-1">{t('register.createAccountSub', 'Register to start using FarmVista.')}</p>
                            <p className="text-gray-400 text-xs mt-2">{t('register.requiredFields', 'Fields marked with * are required.')}</p>
                        </div>

                        {apiError && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {apiError}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.selectRole', 'Select Role')} <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'farmer', label: t('register.farmer', 'Farmer'), icon: '🌾' },
                                        { value: 'consumer', label: t('register.consumer', 'Consumer'), icon: '🛒' },
                                    ].map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200
                                                ${role === r.value
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-lg">{r.icon}</span>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <InputField
                                label={t('register.fullName', 'Full Name')}
                                name="name"
                                placeholder={t('register.fullNamePlaceholder', 'e.g. Ramesh Kumar')}
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                            />

                            <InputField
                                label={t('register.username', 'Username')}
                                name="username"
                                placeholder={t('register.usernamePl', 'e.g. ramesh_farmer')}
                                value={formData.username}
                                onChange={handleChange}
                                error={errors.username}
                            />

                            <InputField
                                label={t('register.phone', 'Phone Number')}
                                name="phone"
                                type="tel"
                                placeholder={t('register.phonePl', '9876543210')}
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                            />

                            <InputField
                                label={t('register.password', 'Password')}
                                name="password"
                                type="password"
                                placeholder={t('register.passwordPl', 'Min. 6 characters')}
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                            />

                            <InputField
                                label={t('register.confirmPassword', 'Confirm Password')}
                                name="confirmPassword"
                                type="password"
                                placeholder={t('register.confirmPasswordPl', 'Re-enter password')}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                            />

                            <div className="pt-2 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('register.govDetailsTitle', 'Government ID Details')}</h3>
                                <div className="space-y-4">
                                    <SelectField
                                        label={t('register.govIdType', 'Government ID Type')}
                                        name="government_id_type"
                                        options={["Aadhaar Number", "PAN Number", "Voter ID"]}
                                        value={formData.government_id_type}
                                        onChange={handleChange}
                                        error={errors.government_id_type}
                                        placeholder={t('register.govIdTypePl', 'Select ID Type')}
                                    />
                                    <InputField
                                        label={t('register.idNumber', 'ID Number')}
                                        name="government_id_number"
                                        placeholder={
                                            formData.government_id_type === 'Aadhaar Number' ? t('register.aadhaarPl', "Enter Aadhaar Number (12 digits)") :
                                                formData.government_id_type === 'PAN Number' ? t('register.panPl', "Enter PAN Number (ABCDE1234F)") :
                                                    formData.government_id_type === 'Voter ID' ? t('register.voterPl', "Enter Voter ID (ABC1234567)") :
                                                        t('register.idNumberPl', 'Enter ID number')
                                        }
                                        value={formData.government_id_number}
                                        onChange={handleChange}
                                        error={errors.government_id_number}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('register.locDetailsTitle', 'Location Details')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label={t('register.state', 'State')}
                                        name="state"
                                        placeholder={t('register.statePl', 'e.g. Tamil Nadu')}
                                        value={formData.state}
                                        onChange={handleChange}
                                        error={errors.state}
                                    />
                                    <InputField
                                        label={t('register.district', 'District')}
                                        name="district"
                                        placeholder={t('register.districtPl', 'e.g. Madurai')}
                                        value={formData.district}
                                        onChange={handleChange}
                                        error={errors.district}
                                    />
                                    <InputField
                                        label={t('register.taluk', 'Taluk')}
                                        name="taluk"
                                        placeholder={t('register.talukPl', 'e.g. Melur')}
                                        value={formData.taluk}
                                        onChange={handleChange}
                                        error={errors.taluk}
                                    />
                                    <InputField
                                        label={t('register.village', 'Village')}
                                        name="village"
                                        placeholder={t('register.villagePl', 'e.g. Kottampatti')}
                                        value={formData.village}
                                        onChange={handleChange}
                                        error={errors.village}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-4
                                    ${isSubmitting
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-sm hover:shadow'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('register.creatingAccount', 'Creating Account...')}
                                    </span>
                                ) : (
                                    t('register.createAccount', 'Create Account')
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            {t('register.alreadyAccount', 'Already have an account?')} {' '}
                            <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
                                {t('register.loginHere', 'Login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
