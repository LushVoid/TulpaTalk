import { useState, useEffect } from 'react';

const useChartData = (url, interval) => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();
                processChartData(json.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, interval);

        return () => clearInterval(intervalId);
    }, [url, interval]);

    const processChartData = (data) => {
        const bandLabels = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Band F', 'Band G'];
        const bandColors = ['indigo', 'violet', 'blue', 'green', 'orange', 'red', 'yellow'];

        // Initialize datasets
        const datasets = bandLabels.map((label, index) => ({
            label: label,
            data: [],
            borderColor: bandColors[index],
            fill: false,
        }));

        // Populate datasets with data
        data.forEach(point => {
            bandLabels.forEach((label, index) => {
                datasets[index].data.push(point[label]);
            });
        });

        setChartData({
            labels: data.map((_, index) => index + 1),
            datasets: datasets
        });
    };


    return { chartData, loading, error };
};

export default useChartData;
