import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
    Image as ImageIcon, X, CloudRain, AlertTriangle, Sun, Leaf,
    Share2, TrendingUp, Users, Camera, MapPin, Smile,
    ChevronDown, Loader2, Trash2, HelpCircle, Bot, ThumbsUp,
    MessageSquare, Sprout, CheckCircle2, Mic, Speaker, Square, Play, Pause, Volume2
} from 'lucide-react';
import {
    getFeedPosts, createPost, deletePost,
    toggleLike, toggleSave,
    getComments, addComment, deleteComment,
    getTrendingTags, getFollowSuggestions, getStories, followFarmer,
    getAiSuggestion
} from '../api/feedApi';

// ─── Constants ───────────────────────────────────────────────────────────────
const POSTS_PER_PAGE = 10;

const CROP_TYPES = [
    'Rice', 'Tomato', 'Cotton', 'Sugarcane', 'Turmeric',
    'Onion', 'Corn', 'Wheat', 'Chilli', 'Banana',
    'Coconut', 'Groundnut', 'Other'
];

const TAG_STYLES = {
    question: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: HelpCircle, label: 'Question' },
    alert: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: AlertTriangle, label: 'Alert' },
    update: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: Leaf, label: 'Harvest' },
    tip: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Sun, label: 'Tip' },
    rain: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: CloudRain, label: 'Rain' },
};

const EMOJIS = ['😊', '🌾', '🌽', '🍅', '🌧️', '☀️', '💪', '🔥', '✅', '🎉', '🌱', '🚜', '💧', '🌡️'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

const AvatarCircle = ({ avatar, name, size = 10, className = '' }) => {
    const isEmoji = avatar && /\p{Extended_Pictographic}/u.test(avatar);
    const isUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/'));
    const sizeClasses = {
        8: 'w-8 h-8',
        9: 'w-9 h-9',
        10: 'w-10 h-10',
        12: 'w-12 h-12',
        14: 'w-14 h-14',
    };

    if (isUrl) {
        const src = avatar.startsWith('/') ? `http://localhost:5000${avatar}` : avatar;
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClasses[size] || 'w-10 h-10'} rounded-full object-cover ${className}`}
            />
        );
    }
    return (
        <div className={`${sizeClasses[size] || 'w-10 h-10'} rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}>
            {isEmoji ? <span className="text-xl">{avatar}</span> : <span className="text-sm">{(name || '?')[0].toUpperCase()}</span>}
        </div>
    );
};

// ─── Image Gallery + Lightbox ────────────────────────────────────────────────
const ImageGallery = ({ imageUrl }) => {
    const [lightbox, setLightbox] = useState(null);
    if (!imageUrl) return null;

    // Backend provides relative path, ensure it's full URL if needed
    const src = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;

    return (
        <>
            <div className="mt-3 rounded-xl overflow-hidden cursor-zoom-in" onClick={() => setLightbox(src)}>
                <img src={src} alt="" className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity" />
            </div>
            {lightbox && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                    <button className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30">
                        <X size={22} />
                    </button>
                </div>
            )}
        </>
    );
};

// ─── Voice Player ───────────────────────────────────────────────────────────
const VoicePlayer = ({ audioUrl }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);
    if (!audioUrl) return null;

    const src = audioUrl.startsWith('http') ? audioUrl : `http://localhost:5000${audioUrl}`;

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="mt-3 bg-green-50/50 border border-green-100 rounded-2xl p-3 flex items-center space-x-3">
            <button 
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm"
            >
                {playing ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
            </button>
            <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Voice Update</p>
                <div className="h-1 bg-green-200 rounded-full mt-1.5 relative overflow-hidden">
                    <div className={`h-full bg-green-500 absolute left-0 top-0 transition-all ${playing ? 'w-full duration-[10s]' : 'w-0'}`} />
                </div>
            </div>
            <audio 
                ref={audioRef} 
                src={src} 
                onEnded={() => setPlaying(false)}
                className="hidden" 
            />
        </div>
    );
};

// ─── AI Suggestion Panel ─────────────────────────────────────────────────────
const AiSuggestionPanel = ({ postId, t }) => {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (suggestion) return;
        setLoading(true);
        getAiSuggestion(postId)
            .then((res) => {
                setSuggestion(res.data.suggestion);
                setLoaded(true);
            })
            .catch(() => {
                setSuggestion('AI Advisor is currently busy. Please try again later.');
            })
            .finally(() => setLoading(false));
    }, [postId]);

    // Convert markdown-style bold to spans
    const formatText = (text) => {
        if (!text) return '';
        return text.split('\n').map((line, i) => {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
        });
    };

    return (
        <div className="mx-4 mb-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-100/80 to-teal-100/60 border-b border-emerald-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                    <Bot size={15} className="text-white" />
                </div>
                <div>
                    <p className="text-xs font-bold text-emerald-800">{t('feed.aiCropDoctor', '🤖 AI Crop Doctor')}</p>
                    <p className="text-[10px] text-emerald-600">{t('feed.aiPowered', 'Powered by Gemini AI')}</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
                {loading ? (
                    <div className="flex items-center justify-center py-4 space-x-2">
                        <Loader2 size={18} className="animate-spin text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium">{t('feed.aiAnalyzing', 'Analyzing your question...')}</span>
                    </div>
                ) : suggestion ? (
                    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
                        {formatText(suggestion)}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-3">{t('feed.aiUnavailable', 'AI suggestion unavailable')}</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-50/50 border-t border-emerald-100">
                <p className="text-[10px] text-emerald-500 italic">{t('feed.aiDisclaimer', '⚠️ AI suggestions are for guidance only. Consult local experts for confirmed advice.')}</p>
            </div>
        </div>
    );
};

// ─── Comments Panel ──────────────────────────────────────────────────────────
const CommentsPanel = ({ postId, initialComments, initialCount, t }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const user = getUser();

    useEffect(() => {
        setLoading(true);
        getComments(postId)
            .then((res) => setComments(res.data))
            .catch(() => setComments(initialComments || []))
            .finally(() => setLoading(false));
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        const optimistic = { id: `temp-${Date.now()}`, author: user.name || 'You', avatar: user.avatar || null, text: text.trim(), time: t('common.justNow', 'Just now') };
        setComments((prev) => [...prev, optimistic]);
        setText('');
        setShowEmoji(false);
        setSubmitting(true);
        try {
            const res = await addComment(postId, optimistic.text);
            setComments((prev) => prev.map((c) => c.id === optimistic.id ? res.data : c));
        } catch {
            // Keep optimistic on failure
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        try { await deleteComment(postId, commentId); } catch { }
    };

    return (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 pt-3 pb-4 space-y-3">
            {loading && <div className="flex justify-center py-2"><Loader2 size={18} className="animate-spin text-green-600" /></div>}

            {!loading && comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">{t('feed.noCommentsYet', 'No comments yet. Be the first!')}</p>
            )}

            {comments.map((c) => (
                <div key={c.id} className="flex items-start space-x-2.5 group">
                    <AvatarCircle avatar={c.avatar} name={c.author} size={8} className="bg-green-100 text-green-800 shrink-0" />
                    <div className="flex-1 bg-white rounded-2xl px-3 py-2 border border-gray-200 shadow-sm relative">
                        <div className="flex items-center space-x-2 mb-0.5">
                            <span className="text-xs font-bold text-gray-900">{c.author}</span>
                            <span className="text-[10px] text-gray-400">{c.time}</span>
                        </div>
                        <p className="text-sm text-gray-700">{c.text}</p>
                        {c.author === (user.name || 'You') && (
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="absolute top-2 right-2 hidden group-hover:block text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* Comment input */}
            <div className="flex items-start space-x-2.5 pt-1">
                <AvatarCircle avatar={null} name={user.name} size={8} className="bg-green-600 text-white shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                    <form onSubmit={handleSubmit} className="flex items-center bg-white border border-gray-200 rounded-full pl-4 pr-2 py-1.5 shadow-sm focus-within:border-green-400 transition-colors">
                        <button type="button" onClick={() => setShowEmoji((v) => !v)} className="text-gray-400 hover:text-yellow-500 mr-2">
                            <Smile size={16} />
                        </button>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('feed.writeComment', "Write a comment...")}
                            className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                        />
                        <button type="submit" disabled={!text.trim() || submitting} className="ml-2 text-green-600 disabled:text-gray-300 transition-colors">
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        </button>
                    </form>
                    {showEmoji && (
                        <div className="flex flex-wrap gap-1.5 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                            {EMOJIS.map((e) => (
                                <button key={e} type="button" onClick={() => setText((p) => p + e)} className="text-lg hover:scale-125 transition-transform">
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Post Card ───────────────────────────────────────────────────────────────
const PostCard = ({ post, currentUserId, onLike, onSave, onDelete, t }) => {
    const [showComments, setShowComments] = useState(false);
    const [showAi, setShowAi] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const tagStyle = TAG_STYLES[post.tag] || TAG_STYLES.update;
    const TagIcon = tagStyle.icon;
    const isOwner = currentUserId && (post.userId === currentUserId || post.username === getUser().username);

    const handleListen = () => {
        if (isListening) {
            window.speechSynthesis.cancel();
            setIsListening(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(post.content);
        // Autodetect Tamil vs English
        utterance.lang = post.content.match(/[\u0B80-\u0BFF]/) ? 'ta-IN' : 'en-US';
        utterance.onend = () => setIsListening(false);
        setIsListening(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <article className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center space-x-3.5">
                    <div className="ring-2 ring-emerald-400 ring-offset-2 rounded-full shadow-sm">
                        <AvatarCircle
                            avatar={post.avatar}
                            name={post.author}
                            size={12}
                            className="bg-gradient-to-br from-emerald-400 to-green-600 text-white"
                        />
                    </div>
                    <div>
                        <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{post.author}</p>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <MapPin size={12} className="text-emerald-500" />
                            <span className="truncate max-w-[150px]">{typeof post.location === 'string' ? post.location : 'Location'}</span>
                            <span>·</span>
                            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : t('common.justNow', 'Just now')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 relative">
                    {/* Crop Type */}
                    {post.cropType && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 italic">
                            <Sprout size={12} />
                            <span>{post.cropType}</span>
                        </span>
                    )}
                    <button className="text-gray-300 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50" onClick={() => setMenuOpen((v) => !v)}>
                        <MoreHorizontal size={22} />
                    </button>
                    {menuOpen && (
                        <div className="absolute top-10 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 py-2 w-48 text-sm animate-in fade-in slide-in-from-top-2">
                            {isOwner && (
                                <button
                                    className="w-full flex items-center space-x-2 text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium"
                                    onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                                >
                                    <Trash2 size={16} /> <span>{t('feed.deletePost', 'Delete Update')}</span>
                                </button>
                            )}
                            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Save to My Farms</button>
                            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium border-t border-gray-50" onClick={() => setMenuOpen(false)}>Report Post</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content & Listen */}
            <div className="px-5 pt-1 pb-3 relative group/content">
                <p className="text-gray-800 text-[16px] leading-[1.65] whitespace-pre-line font-medium">{post.content}</p>
                <button 
                   onClick={handleListen}
                   className={`absolute bottom-3 right-5 p-2 rounded-full shadow-lg border transition-all ${isListening ? 'bg-orange-500 text-white animate-pulse' : 'bg-white text-emerald-600 hover:scale-110 opacity-0 group-hover/content:opacity-100'}`}
                >
                    {isListening ? <Volume2 size={18} /> : <Speaker size={18} />}
                </button>
            </div>

            {/* Media: Image or Voice */}
            <div className="px-5 pb-4">
                {post.image_url && <ImageGallery imageUrl={post.image_url} />}
                {post.audio_url && <VoicePlayer audioUrl={post.audio_url} />}
            </div>

            {/* AI Advisor Trigger (Smart Button) */}
            <div className="px-5 pb-5">
                {!showAi ? (
                    <button 
                        onClick={() => setShowAi(true)}
                        className="w-full py-3.5 px-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group/ai"
                    >
                        <Bot size={18} className="group-hover/ai:animate-bounce" />
                        <span>Get Professional AI Advice</span>
                        <ChevronDown size={14} />
                    </button>
                ) : (
                    <AiSuggestionPanel postId={post.id} t={t} />
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between px-4 py-1.5 text-xs text-gray-400 border-t border-gray-50">
                <span className="flex items-center gap-1">
                    <ThumbsUp size={11} />
                    {post.likes} {t('feed.helpful', 'Helpful')}
                </span>
                <button className="hover:underline cursor-pointer" onClick={() => setShowComments((v) => !v)}>
                    {post.commentsCount ?? post.comments?.length ?? 0} {t('feed.comments', 'comments')}
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-100">
                <div className="flex items-center flex-1">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${post.likedByMe ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <ThumbsUp size={18} fill={post.likedByMe ? 'currentColor' : 'none'} strokeWidth={post.likedByMe ? 0 : 1.8} />
                        <span className="hidden sm:block">{t('feed.helpful', 'Helpful')}</span>
                    </button>
                    <button
                        onClick={() => setShowComments((v) => !v)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <MessageCircle size={18} strokeWidth={1.8} />
                        <span className="hidden sm:block">{t('feed.comment', 'Comment')}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                        <Share2 size={18} strokeWidth={1.8} />
                        <span className="hidden sm:block">{t('feed.share', 'Share')}</span>
                    </button>
                </div>
                <button
                    onClick={() => onSave(post.id)}
                    className={`p-2 rounded-xl transition-colors ${post.savedByMe ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Bookmark size={18} fill={post.savedByMe ? 'currentColor' : 'none'} />
                </button>
            </div>

            {/* Comments Panel */}
            {showComments && (
                <CommentsPanel
                    postId={post.id}
                    initialComments={post.comments}
                    initialCount={post.commentsCount}
                    t={t}
                />
            )}
        </article>
    );
};

// ─── 3 Action Tiles ──────────────────────────────────────────────────────────
const ActionTiles = ({ onSelectAction, t }) => {
    const tiles = [
        {
            id: 'question',
            icon: HelpCircle,
            label: t('feed.askQuestion', 'Ask a Question'),
            desc: t('feed.askQuestionDesc', 'Get help from farmers & AI'),
            gradient: 'from-purple-500 to-indigo-600',
            bgLight: 'bg-purple-50 hover:bg-purple-100',
            textColor: 'text-purple-700',
            borderColor: 'border-purple-200 hover:border-purple-300',
        },
        {
            id: 'photo',
            icon: Camera,
            label: t('feed.shareCropPhoto', 'Share Crop Photo'),
            desc: t('feed.shareCropPhotoDesc', 'Show your crop condition'),
            gradient: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50 hover:bg-emerald-100',
            textColor: 'text-emerald-700',
            borderColor: 'border-emerald-200 hover:border-emerald-300',
        },
        {
            id: 'update',
            icon: MessageSquare,
            label: t('feed.shareUpdate', 'Share an Update'),
            desc: t('feed.shareUpdateDesc', 'Tips, alerts, or harvest news'),
            gradient: 'from-blue-500 to-cyan-600',
            bgLight: 'bg-blue-50 hover:bg-blue-100',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200 hover:border-blue-300',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {tiles.map((tile) => (
                <button
                    key={tile.id}
                    onClick={() => onSelectAction(tile.id)}
                    className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 ${tile.borderColor} ${tile.bgLight} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
                >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${tile.gradient} flex items-center justify-center shadow-lg mb-2.5 group-hover:shadow-xl transition-shadow`}>
                        <tile.icon size={24} className="text-white" strokeWidth={2} />
                    </div>
                    <p className={`text-xs sm:text-sm font-bold ${tile.textColor} text-center leading-tight`}>{tile.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 text-center hidden sm:block">{tile.desc}</p>
                </button>
            ))}
        </div>
    );
};

// ─── Create Post Box ──────────────────────────────────────────────────────────
const CreatePost = ({ onCreated, t }) => {
    const [open, setOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [text, setText] = useState('');
    const [tag, setTag] = useState('update');
    const [cropType, setCropType] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [previews, setPreviews] = useState({ image: null, audio: null });
    const [showEmoji, setShowEmoji] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recTime, setRecTime] = useState(0);
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const timerRef = useRef(null);

    const textareaRef = useRef(null);
    const fileRef = useRef(null);
    const user = getUser();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];
            
            mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
                setAudioFile(file);
                setPreviews(p => ({ ...p, audio: URL.createObjectURL(blob) }));
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setRecTime(0);
            timerRef.current = setInterval(() => setRecTime(r => r + 1), 1000);
        } catch (err) {
            console.error(err);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const handleSelectAction = (action) => {
        setActionType(action);
        setOpen(true);
        setTag(action === 'question' ? 'question' : 'update');
        if (action === 'photo') setTimeout(() => fileRef.current?.click(), 100);
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviews(p => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const reset = () => {
        setText(''); setTag('update'); setCropType(''); setImageFile(null); setAudioFile(null);
        setPreviews({ image: null, audio: null }); setError(''); setOpen(false); setActionType(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imageFile && !audioFile) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await createPost({ 
                content: text.trim(), 
                tag, 
                cropType, 
                image: imageFile, 
                audio: audioFile 
            });
            onCreated(res.data);
            reset();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to post update.');
        } finally {
            setSubmitting(false);
        }
    };

    const placeholders = {
        question: t('feed.questionPlaceholder', "What farming problem do you need help with? Describe your issue clearly..."),
        photo: t('feed.photoPlaceholder', "Describe your crop condition (e.g., 'Leaves turning yellow on my tomato plants')..."),
        update: t('feed.updatePlaceholder', "Share harvest updates, weather alerts, or farming tips with the community..."),
    };

    if (!open) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                    <AvatarCircle avatar={user.avatar} name={user.name} size={10} className="bg-gradient-to-br from-green-400 to-emerald-600 text-white shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-gray-800">{t('feed.whatsHappening', "What's happening on your farm?")}</p>
                        <p className="text-xs text-gray-400">{t('feed.chooseAction', "Choose an action below")}</p>
                    </div>
                </div>
                <ActionTiles onSelectAction={handleSelectAction} t={t} />
            </div>
        );
    }

    const activeAction = actionType === 'question' ? {
        title: t('feed.askQuestionTitle', '❓ Ask the Community'),
        color: 'purple',
    } : actionType === 'photo' ? {
        title: t('feed.shareCropPhotoTitle', '📸 Share Crop Photo'),
        color: 'emerald',
    } : {
        title: t('feed.shareUpdateTitle', '📝 Share an Update'),
        color: 'blue',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className={`flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100`}>
                <p className="text-sm font-bold text-gray-800">{activeAction.title}</p>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>

            {error && (
                <div className="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-3 px-4 pt-4">
                    <AvatarCircle avatar={user.avatar} name={user.name} size={10} className="bg-gradient-to-br from-green-400 to-emerald-600 text-white shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{user.name || 'Farmer'}</p>
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={placeholders[actionType] || placeholders.update}
                            rows={4}
                            className="w-full mt-2 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed"
                        />
                    </div>
                </div>

                {/* Previews: Image or Voice */}
                <div className="px-4 pb-3 flex flex-wrap gap-3">
                    {previews.image && (
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200">
                            <img src={previews.image} className="w-full h-full object-cover" />
                            <button onClick={() => { setImageFile(null); setPreviews(p=>({...p, image:null})); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={14}/></button>
                        </div>
                    )}
                    {previews.audio && (
                       <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-100">
                           <Play size={14} className="text-emerald-600" />
                           <span className="text-xs font-bold text-emerald-700">Voice Message recorded</span>
                           <button onClick={() => { setAudioFile(null); setPreviews(p=>({...p, audio:null})); }} className="text-emerald-400 hover:text-red-500"><X size={14}/></button>
                       </div>
                    )}
                </div>

                {/* Emoji picker */}
                {showEmoji && (
                    <div className="px-4 pb-3">
                        <div className="flex flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                            {EMOJIS.map((e) => (
                                <button key={e} type="button" onClick={() => { setText((p) => p + e); textareaRef.current?.focus(); }} className="text-xl hover:scale-125 transition-transform">
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Crop Type Selector */}
                <div className="px-4 pb-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        <Sprout size={11} className="inline mr-1" />
                        {t('feed.cropType', 'Crop Type')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {CROP_TYPES.map((crop) => (
                            <button
                                key={crop} type="button"
                                onClick={() => setCropType(cropType === crop ? '' : crop)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${cropType === crop
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 scale-105'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-amber-200 hover:text-amber-700'
                                    }`}
                            >
                                {t(`crops.${crop}`, crop)}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Tags (for Update type — question and photo auto-set tags) */}
                {actionType === 'update' && (
                    <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('feed.tagAs', 'Tag as:')}</span>
                        {Object.entries(TAG_STYLES).filter(([k]) => k !== 'question').map(([key, style]) => (
                            <button
                                key={key} type="button" onClick={() => setTag(key)}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-full border font-semibold transition-all ${tag === key ? `${style.bg} ${style.text} ${style.border} scale-105` : 'border-gray-200 text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <style.icon size={11} /> <span>{t(`feed.${key}`, style.label)}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Question indicator */}
                {actionType === 'question' && (
                    <div className="px-4 pb-3">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                            <Bot size={16} className="text-purple-600" />
                            <p className="text-xs text-purple-700 font-medium">{t('feed.aiWillRespond', '🤖 AI Crop Doctor will automatically analyze your question and suggest solutions')}</p>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 pb-5 border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => fileRef.current?.click()} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm">
                            <ImageIcon size={22} />
                        </button>
                        <button 
                            type="button" 
                            className={`p-3 rounded-2xl transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                        >
                            <Mic size={22} />
                        </button>
                        {isRecording && <span className="text-xs font-extrabold text-red-600 ml-2 animate-pulse">{recTime}s Recording...</span>}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    <button
                        type="submit"
                        disabled={(!text.trim() && !imageFile && !audioFile) || submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-full text-[14px] font-extrabold disabled:opacity-30 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <span>{t('feed.post', 'Share Update')}</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── Climate Alert Banner ────────────────────────────────────────────────────
const ClimateAlertBanner = ({ t }) => {
    return (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <AlertTriangle size={22} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold">{t('feed.weatherAlert', '⚠️ Weather Alert for Your Region')}</p>
                    <p className="text-xs opacity-90 mt-0.5">{t('feed.weatherAlertDesc', 'Heavy rainfall expected in Tamil Nadu over next 48 hours. Protect harvested crops!')}</p>
                </div>
            </div>
        </div>
    );
};

// ─── Right Sidebar ───────────────────────────────────────────────────────────
const RightSidebar = ({ t }) => {
    const [trends, setTrends] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [followed, setFollowed] = useState({});

    useEffect(() => {
        getTrendingTags().then((r) => setTrends(r.data)).catch(() =>
            setTrends([
                { tag: '#TomatoHarvest', posts: 342 },
                { tag: '#ClimateAlert', posts: 218 },
                { tag: '#RiceSeason', posts: 187 },
                { tag: '#PestControl', posts: 156 },
                { tag: '#CropPrice', posts: 98 },
            ])
        );
        getFollowSuggestions().then((r) => setSuggestions(r.data)).catch(() =>
            setSuggestions([
                { id: 'u1', name: 'Priya Farms', location: 'Trichy', avatar: '👩‍🌾' },
                { id: 'u2', name: 'Karthik Agri', location: 'Erode', avatar: '🧑‍🌾' },
                { id: 'u3', name: 'Meena Crops', location: 'Vellore', avatar: '👩‍🌾' },
            ])
        );
    }, []);

    const handleFollow = async (userId) => {
        setFollowed((prev) => ({ ...prev, [userId]: !prev[userId] }));
        try { await followFarmer(userId); } catch { setFollowed((prev) => ({ ...prev, [userId]: !prev[userId] })); }
    };

    return (
        <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                    <Sprout size={14} />
                    {t('feed.communityStats', 'Community Stats')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/70 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-green-700">428</p>
                        <p className="text-[10px] text-gray-500 font-medium">{t('feed.activeFarmers', 'Active Farmers')}</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-blue-700">56</p>
                        <p className="text-[10px] text-gray-500 font-medium">{t('feed.questionsAnswered', 'Questions Today')}</p>
                    </div>
                </div>
            </div>

            {/* Trending */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp size={16} className="text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">{t('feed.trending', 'Trending')}</h3>
                </div>
                {trends.map((trend) => (
                    <div key={trend.tag} className="flex justify-between items-center py-1.5 hover:bg-gray-50 rounded-lg px-1 cursor-pointer group">
                        <span className="text-sm font-bold text-green-700 group-hover:underline">{trend.tag}</span>
                        <span className="text-xs text-gray-400">{trend.posts} {t('feed.posts', 'posts')}</span>
                    </div>
                ))}
            </div>

            {/* Follow suggestions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                    <Users size={16} className="text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">{t('feed.farmersToFollow', 'Farmers to Follow')}</h3>
                </div>
                {suggestions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                            <AvatarCircle avatar={s.avatar} name={s.name} size={9} className="bg-green-50 border border-green-200" />
                            <div>
                                <p className="text-xs font-bold text-gray-800">{s.name}</p>
                                <p className="text-[10px] text-gray-400">{typeof s.location === 'string' ? t(`location.${s.location}`, s.location) : 'Unknown'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleFollow(s.id)}
                            className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${followed[s.id] ? 'bg-gray-100 text-gray-600 border-gray-200' : 'text-green-600 border-green-600 hover:bg-green-50'
                                }`}
                        >
                            {followed[s.id] ? t('feed.following', 'Following') : t('feed.follow', 'Follow')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const CommunityFeed = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    const user = getUser();

    const fetchPosts = useCallback(async (pageNum = 1, tagFilter = 'all', replace = true) => {
        replace ? setLoading(true) : setLoadingMore(true);
        setError('');
        try {
            const res = await getFeedPosts(pageNum, POSTS_PER_PAGE, tagFilter);
            const { posts: newPosts, pages } = res.data;
            const normalised = newPosts.map((p) => ({ ...p, likedByMe: p.likedByMe || false, savedByMe: p.savedByMe || false }));
            setPosts((prev) => replace ? normalised : [...prev, ...normalised]);
            setHasMore(pageNum < pages);
        } catch {
            setError(t('feed.errorLoad', 'Could not load posts. Check your connection.'));
        } finally {
            replace ? setLoading(false) : setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, filter, true);
    }, [filter, fetchPosts]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPosts(next, filter, false);
    };

    const handleLike = async (postId) => {
        setPosts((prev) => prev.map((p) =>
            p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 } : p
        ));
        try {
            const res = await toggleLike(postId);
            setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likedByMe: res.data.liked, likes: res.data.likes } : p));
        } catch { }
    };

    const handleSave = async (postId) => {
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, savedByMe: !p.savedByMe } : p));
        try {
            const res = await toggleSave(postId);
            setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, savedByMe: res.data.saved } : p));
        } catch { }
    };

    const handleDelete = async (postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        try { await deletePost(postId); } catch { fetchPosts(1, filter, true); }
    };

    const handleCreated = (newPost) => {
        setPosts((prev) => [{ ...newPost, likedByMe: false, savedByMe: false }, ...prev]);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        <span className="text-3xl">🌾</span>
                        {t('feed.title', 'Community Feed')}
                    </h1>
                    <p className="text-sm text-gray-500">{t('feed.subtitle', 'Ask questions, share updates, and help fellow farmers')}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main column */}
                <div className="flex-1 space-y-4 min-w-0">
                    {/* Climate Alert Banner */}
                    <ClimateAlertBanner t={t} />

                    {/* Create Post with 3 Action Tiles */}
                    <CreatePost onCreated={handleCreated} t={t} />

                    {/* Filter tabs */}
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                        {[['all', t('feed.allPosts', 'All Posts')], ...Object.entries(TAG_STYLES).map(([k, s]) => [k, t(`feed.${k}`, s.label)])].map(([key, label]) => {
                            const style = TAG_STYLES[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${filter === key
                                        ? style ? `${style.bg} ${style.text} ${style.border}` : 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => fetchPosts(1, filter, true)} className="underline font-bold">{t('feed.retry', 'Retry')}</button>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 animate-pulse">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div className="space-y-1 flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                                            <div className="h-2 bg-gray-200 rounded w-1/4" />
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                                    <div className="h-3 bg-gray-200 rounded w-3/5" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && posts.length === 0 && !error && (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-5xl mb-3">🌾</p>
                            <p className="font-semibold">{t('feed.noPosts', 'No posts yet. Be the first to share!')}</p>
                        </div>
                    )}

                    {/* Posts */}
                    {!loading && posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user.id}
                            onLike={handleLike}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            t={t}
                        />
                    ))}

                    {/* Load more */}
                    {!loading && hasMore && (
                        <div className="flex justify-center pt-2 pb-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full hover:border-green-500 hover:text-green-700 transition-colors shadow-sm disabled:opacity-60"
                            >
                                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                                <span>{loadingMore ? t('feed.loading', 'Loading...') : t('feed.loadMore', 'Load More')}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="sticky top-20">
                        <RightSidebar t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityFeed;
