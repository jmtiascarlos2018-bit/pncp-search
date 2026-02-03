const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const searchTenders = async (searchParams) => {
    try {
        // Construct query string
        const params = new URLSearchParams();
        if (searchParams.niche) params.append('q', searchParams.niche);
        if (searchParams.uf) params.append('uf', searchParams.uf);
        if (searchParams.dateStart) params.append('dateStart', searchParams.dateStart);
        if (searchParams.dateEnd) params.append('dateEnd', searchParams.dateEnd);
        if (searchParams.page) params.append('page', searchParams.page);

        const response = await fetch(`${API_URL}/search?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
