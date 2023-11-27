import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import * as Tone from 'tone';

const Neurofeedback = () => {
  const [chartData, setChartData] = useState({});
  const [fBandValue, setFBandValue] = useState(0); // State for F band value
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseFrequency = 220; // Base frequency for the binaural beat
  const binauralFrequency = 260; // Slightly different to create the binaural effect

  // Create a lowpass filter
  const filter = new Tone.Filter({
    type: 'lowpass',
    frequency: 800, // Adjust the frequency to control the 'softness' of the sound
  }).toDestination();

  // Create an LFO to modulate the filter frequency
  const lfo = new Tone.LFO({
    type: 'sine',
    min: 500,  // Minimum frequency of the filter
    max: 1200, // Maximum frequency of the filter
    frequency: 0.25 // Speed of the modulation
  }).connect(filter.frequency);

  // Start the LFO
  //lfo.start();

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await fetch('http://localhost:5000/api/fetch-data');
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
      const intervalId = setInterval(fetchData, 500);

      return () => clearInterval(intervalId);
  }, []);

  const mapValueToRange = (value, minInput, maxInput, minOutput, maxOutput) => {
      // Scale factor to transform the range
      const scaleFactor = (maxOutput - minOutput) / (maxInput - minInput);

      // Shift value and scale
      let newValue = minOutput + (value - minInput) * scaleFactor;

      // Ensure the output is within bounds
      return Math.max(minOutput, Math.min(maxOutput, Math.round(newValue)));
  };


  const adjustBinauralBeatVolume = (bandFValue) => {
        const volume = -30 + bandFValue * 10; // Map Band F value to volume
        const volumeValue = Math.max(-60, Math.min(0, volume)); // Limit volume between -60 and 0 dB


        // Update state for F band value
        setFBandValue(mapValueToRange(bandFValue, -1, 2.5, 1, 100));
    };

  const processChartData = (data) => {
      // Constants for configuration
      const bandColors = ['indigo', 'violet', 'blue', 'green', 'orange', 'red', 'yellow'];
      const bandLabels = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E', 'Band F', 'Band G'];

      // Initialize bands
      const bands = Array(bandColors.length).fill().map(() => []);

      // Process data
      data.forEach(point => {
          point.split(',').map(parseFloat).forEach((value, index) => bands[index].push(value));
      });

      // Update chart data
      setChartData({
          labels: data.map((_, index) => index + 1),
          datasets: bands.map((bandData, index) => ({
              label: bandLabels[index],
              data: bandData,
              borderColor: bandColors[index],
              fill: false,
          })),
      });

      // Adjust binaural beat volume
      if (data.length) {
          const latestData = data.at(-1).split(',').map(parseFloat);
          setFBandValue(latestData[0]); // Update F band value
          adjustBinauralBeatVolume(latestData[5]); // Use index 5 for Band F
      }
  };
    const circleSize = Math.max(10, fBandValue * 5); // Calculate circle size based on F band value


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div id='eeg'>
            <h2>EEG Data</h2>
            <div style={{
                display: 'flex', // Flex container for centering
                justifyContent: 'center', // Center horizontally
                alignItems: 'center', // Center vertically
                width: '250px', // Fixed width of the container
                height: '250px', // Fixed height of the container
                margin: '20px auto', // Margin for some spacing and auto for centering horizontally
                border: '1px solid #ddd', // Optional border for visual clarity
                borderRadius: '50%', // Optional to make the container circle-shaped
                overflow: 'hidden' // To ensure contents do not overflow the container bounds
            }}>
                <div style={{
                    width: `${fBandValue * 7}px`,
                    height: `${fBandValue * 7}px`,
                    borderRadius: '50%',
                    background: 'red',
                    transition: 'width 1s ease-in-out, height 1s ease-in-out' // Smooth transition for size change
                }} />
            </div>

            <Line data={chartData} />
        </div>
    );
};

export default Neurofeedback;
