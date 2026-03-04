import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { MessageSquare, Heart, Share2, User, Send, CloudRain, AlertTriangle } from 'lucide-react';
import { getFeedPosts } from '../api/feedApi';

const FarmFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await getFeedPosts();
                setPosts(res.data);
            } catch (err) {
                console.error("Fetch Feed Error:", err);
                // Fallback for demo
                setPosts([
                    {
                        id: 1,
                        author: 'Ramesh',
                        location: 'Madurai',
                        content: 'Heavy rainfall expected tomorrow. Stored tomatoes in covered shed to prevent spoilage. Farmers near Madurai, take precautions!',
                        likes: 12,
                        comments: 3,
                        time: '2h ago',
                        type: 'alert'
                    },
                    {
                        id: 2,
                        author: 'Sita',
                        location: 'Salem',
                        content: 'Just harvested my first batch of organic turmeric. Quality looks great! Anyone looking for buyers in Erode?',
                        likes: 45,
                        comments: 8,
                        time: '5h ago',
                        type: 'post'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
                <div className="flex gap-2">
                    <span className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-extrabold rounded-full border border-green-100">All Posts</span>
                    <span className="px-4 py-1.5 bg-white text-gray-400 text-xs font-extrabold rounded-full border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">Climate Alerts</span>
                </div>
            </div>

            {/* Create Post */}
            <Card>
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-700 font-bold border border-green-200">
                        <User size={20} />
                    </div>
                    <div className="flex-1 space-y-3">
                        <textarea
                            placeholder="Share an update or climate observation..."
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-400 transition-all min-h-[100px] font-medium text-gray-700"
                        ></textarea>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <button className="text-gray-400 hover:text-green-600 flex items-center gap-1.5 text-sm font-extrabold transition-all">
                                    <CloudRain size={18} />
                                    Climate Alert
                                </button>
                                <button className="text-gray-400 hover:text-green-600 flex items-center gap-1.5 text-sm font-extrabold transition-all">
                                    <Share2 size={18} />
                                    Photo
                                </button>
                            </div>
                            <button className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-900/10 hover:bg-green-700 transition-all active:scale-95">
                                Post Update
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Feed Posts */}
            <div className="space-y-6">
                {posts.map(post => (
                    <Card key={post.id} className="group hover:border-green-100 transition-all">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{post.author}</h4>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{post.location} • {post.time}</p>
                                    </div>
                                    {post.type === 'alert' && (
                                        <span className="flex items-center gap-1 text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 h-fit">
                                            <AlertTriangle size={14} />
                                            Climate Alert
                                        </span>
                                    )}
                                </div>

                                <p className="mt-4 text-gray-700 leading-relaxed font-medium">
                                    {post.content}
                                </p>

                                <div className="mt-6 flex items-center gap-6 border-t border-gray-50 pt-4">
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all font-bold text-sm">
                                        <Heart size={20} className="LucideHeart" />
                                        {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-all font-bold text-sm">
                                        <MessageSquare size={20} />
                                        {post.comments}
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-all font-bold text-sm">
                                        <Share2 size={20} />
                                        Share
                                    </button>
                                </div>

                                <div className="mt-4 relative group/input">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-400 transition-all text-sm font-medium"
                                    />
                                    <button className="absolute right-2 top-2 p-1 text-green-600 hover:bg-green-50 rounded-lg transition-all opacity-0 group-focus-within/input:opacity-100">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FarmFeed;
