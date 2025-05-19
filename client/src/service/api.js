import axios from 'axios'

const API_URL = 'http://localhost:8000'

export const uploadFile = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/upload`,data); //response.data because axios returs various data like status,data,headers etc and data has the main response body;
        return response.data;
    } catch (error) {
        console.error('Error while calling the api',error);
    }
}