import axiosClient from './axiosClient';

const petApi = {
    getPets: () => axiosClient.get('/pets'),
    
    getPetById: (id: string) => axiosClient.get(`/pets/${id}`),
    
    createPet: (formData: any) =>
        axiosClient.post('/pets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        
    updatePet: (id: string, formData: any) =>
        axiosClient.put(`/pets/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        
    deletePet: (id: string) => axiosClient.delete(`/pets/${id}`),
    
    getLeaderboard: (species?: string, currentPetId?: string, timeFilter?: string) => 
        axiosClient.get('/pets/leaderboard', { params: { species, currentPetId, timeFilter } }),
};

export default petApi;
