import axios from 'axios'

const API_URL = 'https://api.airfetch.online'

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const uploadFile = async (data) => {
    try {
        const response = await api.post(`/upload`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (error) {
        console.error('Error while calling the api', error);
        throw error;
    }
}

export const fetchFiles = async () => {
    try {
        const response = await api.get(`/files`);
        return response;
    } catch (error) {
        console.error('Error fetching files', error);
        throw error;
    }
}

export const getShareLink = async (fileId) => {
    try {
        const response = await api.get(`/share/${fileId}`);
        return response;
    } catch (error) {
        console.error('Error getting share link', error);
        throw error;
    }
}

export const deleteFile = async (fileId) => {
    try {
        const response = await api.delete(`/files/${fileId}`);
        return response;
    } catch (error) {
        console.error('Error deleting file', error);
        throw error;
    }
}

export const renameFile = async (fileId, newName) => {
    try {
        const response = await api.put(`/files/${fileId}`, { name: newName });
        return response;
    } catch (error) {
        console.error('Error renaming file', error);
        throw error;
    }
}

export const login = async (formData) => {
    try {
        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Error logging in', error);
        throw error;
    }
}

export const register = async (formData) => {
    try {
        const response = await api.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Error registering', error);
        throw error;
    }
}

export const checkAuth = async () => {
    try {
        const response = await api.get('/auth/check');
        return response;
    } catch (error) {
        console.error('Error checking auth', error);
        throw error;
    }
}

export const googleAuth = async (token) => {
    try {
        const response = await api.post('/auth/google', { token }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Error with Google auth', error);
        throw error;
    }
}