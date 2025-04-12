import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Image, Send } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export function Home() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data || []);
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user?.id,
        content,
        image_url: imageUrl || null,
      });

    if (error) {
      console.error('Error creating post:', error);
      return;
    }

    setContent('');
    setImageUrl('');
    fetchPosts();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={createPost}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <div className="flex items-center mt-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="flex-1 p-2 border rounded-lg mr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Post
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              {post.profiles.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{post.profiles.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-800 mb-4">{post.content}</p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="rounded-lg w-full object-cover max-h-96"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}