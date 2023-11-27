// chartUtils.js
export const processDataForChart = (rawData) => {
    const bands = Array(7).fill(null).map(() => []);
    const bandColors = ['indigo', 'violet', 'blue', 'green', 'orange', 'red', 'yellow'];
    const bandLabels = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Band F', 'Band G'];

    rawData.forEach(point => {
        const values = point.split(',').map(val => parseFloat(val));
        values.forEach((value, index) => bands[index].push(value));
    });

    return {
        labels: rawData.map((_, index) => index + 1),
        datasets: bands.map((bandData, index) => ({
            label: bandLabels[index],
            data: bandData,
            borderColor: bandColors[index],
            fill: false,
        })),
    };
};
