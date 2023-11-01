import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:11434/api/tags';

export default function useFetchModels() {
    const [models, setModels] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocalModels = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data.models && data.models.length > 0) {
                    setModels(data.models.map(model => model.name.split(':latest')[0]));
                }
            } catch (error) {
                setError('Failed to fetch local models');
                console.error('Failed to fetch local models:', error);
            }
        };

        fetchLocalModels();
    }, []);

    return { models, error };
}
