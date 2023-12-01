import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const BAND_COLORS = ['indigo', 'violet', 'blue', 'green', 'orange', 'red', 'yellow'];
const BAND_LABELS = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Band F', 'Band G'];

const Neurofeedback = () => {
  const [chartData, setChartData] = useState({});
  const [selectedBands, setSelectedBands] = useState(new Set());
  const [bandValues, setBandValues] = useState(Array(BAND_COLORS.length).fill(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fetch-data');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const json = await response.json();
        processChartData(json.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000); // Reduced frequency to every 5 seconds
    return () => clearInterval(intervalId);
  }, [selectedBands]);

  const processChartData = (data) => {
    const bands = Array(BAND_COLORS.length).fill().map(() => []);
    data.forEach(point => point.split(',').map(parseFloat).forEach((value, index) => bands[index].push(value)));

    setChartData({
      labels: data.map((_, index) => index + 1),
      datasets: bands.map((bandData, index) => ({
        label: BAND_LABELS[index],
        data: bandData,
        borderColor: BAND_COLORS[index],
        fill: false,
      })),
    });

    if (data.length > 0) {
      const latestData = data.at(-1).split(',').map(parseFloat);
      setBandValues(bandValues.map((_, index) => {
        if (selectedBands.has(index)) {
          return mapValueToRange(latestData[index], -1.5, 2.5, 1, 100);
        }
        return bandValues[index];
      }));
    }
  };

  const handleBandSelectionChange = (index) => {
    const newSelectedBands = new Set(selectedBands);
    if (newSelectedBands.has(index)) {
      newSelectedBands.delete(index);
    } else {
      newSelectedBands.add(index);
    }
    setSelectedBands(newSelectedBands);
  };

  const mapValueToRange = (value, minInput, maxInput, minOutput, maxOutput) => {
    const scaleFactor = (maxOutput - minOutput) / (maxInput - minInput);
    return Math.max(minOutput, Math.min(maxOutput, Math.round(minOutput + (value - minInput) * scaleFactor)));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div id='eeg'>
      <h2>EEG Data</h2>
      <div id='band-selection'>
        {BAND_LABELS.map((label, index) => (
          <div key={label} className="band-checkbox">
            <input
              type="checkbox"
              checked={selectedBands.has(index)}
              onChange={() => handleBandSelectionChange(index)}
            />
            {label}
          </div>
        ))}
      </div>

      <div id="eeg-container">
        <div className="circle-200" />
        <div className="circle-150" />
        <div className="circle-100" />
        <div className="circle-50" />
        {Array.from(selectedBands)
          .map(index => ({ index, value: bandValues[index] }))
          .sort((a, b) => a.value - b.value) // Sort bands by their values in ascending order
          .reverse() // Reverse the order to have lower values on top
          .map((band, zIndex) => (
            <div
              key={band.index}
              className="dynamic-circle"
              style={{
                width: `${band.value}%`,
                height: `${band.value}%`,
                opacity: `${band.value}%`,
                backgroundColor: BAND_COLORS[band.index],
                zIndex: selectedBands.size - zIndex // Higher zIndex for lower values
              }}
            />
          ))
        }
      </div>
      <Line data={chartData} />
    </div>
  );
};

export default Neurofeedback;
