// Post service for community forum functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class PostService {
  private baseURL = `${API_BASE_URL}/posts`;

  async getPosts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get posts');
      }

      return data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  }

  async getPost(postId: string) {
    try {
      const response = await fetch(`${this.baseURL}/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get post');
      }

      return data;
    } catch (error) {
      console.error('Get post error:', error);
      throw error;
    }
  }

  async createPost(postData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      return data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async updatePost(postId: string, updateData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post');
      }

      return data;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  }

  async deletePost(postId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }

      return data;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  }

  async likePost(postId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to like post');
      }

      return data;
    } catch (error) {
      console.error('Like post error:', error);
      throw error;
    }
  }

  async dislikePost(postId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dislike post');
      }

      return data;
    } catch (error) {
      console.error('Dislike post error:', error);
      throw error;
    }
  }

  async removeReaction(postId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/reaction`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove reaction');
      }

      return data;
    } catch (error) {
      console.error('Remove reaction error:', error);
      throw error;
    }
  }

  async addReply(postId: string, replyData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add reply');
      }

      return data;
    } catch (error) {
      console.error('Add reply error:', error);
      throw error;
    }
  }

  async deleteReply(postId: string, replyId: string) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/reply/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete reply');
      }

      return data;
    } catch (error) {
      console.error('Delete reply error:', error);
      throw error;
    }
  }

  async reportPost(postId: string, reportData: any) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/${postId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to report post');
      }

      return data;
    } catch (error) {
      console.error('Report post error:', error);
      throw error;
    }
  }

  async getTrendingPosts(limit: number = 10) {
    try {
      const response = await fetch(`${this.baseURL}/trending/list?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get trending posts');
      }

      return data;
    } catch (error) {
      console.error('Get trending posts error:', error);
      throw error;
    }
  }

  async searchPosts(query: string, params: any = {}) {
    try {
      const searchParams = { ...params, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`${this.baseURL}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search posts');
      }

      return data;
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string, params: any = {}) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const queryParams = new URLSearchParams(params).toString();
      
      const response = await fetch(`${this.baseURL}/user/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user posts');
      }

      return data;
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }

  async getPostStatistics(postId: string) {
    try {
      const response = await fetch(`${this.baseURL}/${postId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get post statistics');
      }

      return data;
    } catch (error) {
      console.error('Get post statistics error:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
