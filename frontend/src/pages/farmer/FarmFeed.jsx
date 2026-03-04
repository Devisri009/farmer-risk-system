import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send } from 'lucide-react';

const FarmFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = async () => {
        try {
            const response = await apiClient.get('/api/posts');
            // If API fails or is empty, we will have a default state below, 
            // but let's assume it returns { data: [...] }
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            // Fallback for demonstration since backend might not be ready
            setPosts([
                {
                    id: 1,
                    farmerName: 'Ravi Kumar',
                    location: 'Tamil Nadu, India',
                    content: 'Just harvested my first batch of organic tomatoes! The climate alerts really helped me avoid the heavy rains last week.',
                    timePosted: '2 hours ago',
                    likes: 24,
                    comments: []
                },
                {
                    id: 2,
                    farmerName: 'Anita Singh',
                    location: 'Punjab, India',
                    content: 'Anyone facing issues with the new wheat seeds? Yield seems lower than expected.',
                    timePosted: '5 hours ago',
                    likes: 5,
                    comments: [{ user: 'Raj', text: 'Yes, same here in Haryana.' }]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/api/posts', {
                content: newPost,
                // Mocking user details for now
                farmerName: 'Current User',
                location: 'My Farm'
            });
            // Prepend the new post
            if (response.data) {
                setPosts([response.data, ...posts]);
            } else {
                // Fallback simulation
                const mockPost = {
                    id: Date.now(),
                    farmerName: 'Current User',
                    location: 'My Farm',
                    content: newPost,
                    timePosted: 'Just now',
                    likes: 0,
                    comments: []
                };
                setPosts([mockPost, ...posts]);
            }
            setNewPost('');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to publish post. (Simulated success for UI demonstration)');
            const mockPost = {
                id: Date.now(),
                farmerName: 'Current User',
                location: 'My Farm',
                content: newPost,
                timePosted: 'Just now',
                likes: 0,
                comments: []
            };
            setPosts([mockPost, ...posts]);
            setNewPost('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const likePost = (id) => {
        setPosts(posts.map(post => {
            if (post.id === id) {
                return { ...post, likes: post.likes + 1 };
            }
            return post;
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Farm Feed</h2>
                <p className="text-gray-500">Connect with the farming community, share updates, and ask for advice.</p>
            </div>

            {/* Create Post Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handlePostSubmit}>
                    <textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-green focus:bg-white outline-none resize-none transition-all"
                        rows="3"
                        placeholder="What's happening on your farm today?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                    ></textarea>
                    <div className="flex items-center justify-between mt-4">
                        <button type="button" className="text-gray-500 hover:text-primary-green p-2 rounded-full hover:bg-green-50 transition-colors">
                            <ImageIcon size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newPost.trim()}
                            className="bg-primary-green text-white px-6 py-2.5 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Posting...' : <><Send size={16} /> Post</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-primary-green font-bold text-lg border border-green-100">
                                    {post.farmerName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{post.farmerName}</h3>
                                    <p className="text-xs text-gray-500">{post.location} • {post.timePosted}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-800 mb-6 leading-relaxed">
                            {post.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                                onClick={() => likePost(post.id)}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
                            >
                                <Heart size={20} className={post.likes > 0 ? "fill-current text-red-500" : ""} /> {post.likes} Likes
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors font-medium text-sm">
                                <MessageCircle size={20} /> {post.comments?.length || 0} Comments
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-medium text-sm">
                                <Share2 size={20} /> Share
                            </button>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">No posts yet. Be the first to start a conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmFeed;
