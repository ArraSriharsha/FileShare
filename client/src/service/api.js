import axios from 'axios'

const API_URL = 'http://localhost:8000'

export const uploadFile = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/upload`,data);
        return response.data;
    } catch (error) {
        console.error('Error while calling the api',error);
    }
}

export const fetchFiles = async () => {
    try {
        const response = await axios.get(`${API_URL}/files`);
        return response.data;
    } catch (error) {
        console.error('Error fetching files', error);
    }
}

export const getShareLink = async (fileId) => {
    try {
        const response = await axios.get(`${API_URL}/share/${fileId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting share link', error);
    }
}