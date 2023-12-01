import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import { useModelParameters, useSubmitHandler } from '../hooks'; // Custom hooks

function PersonaSettings({ persona, onChange, onSubmit, models, updateModels }) {
    const [isEditing, setIsEditing] = useState(false);
    const { parameters, fetchAndSetParameters } = useModelParameters(persona);
    const handleSubmit = useSubmitHandler({ persona, onSubmit, updateModels });
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            fetchAndSetParameters();
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...persona, [name]: value });
    };
    const handleParamChange = (e) => {
        const { name, value } = e.target;
        fetchAndSetParameters(name, value);
    };
    const handleModelChange = (e) => {
        onChange({ ...persona, model: e.target.value });
    };
    const renderInputField = (paramObj) => {
      let inputField;

      if (paramObj.type === 'int' && paramObj.max === 1) {
          // Switch for boolean-like values
          inputField = (
              <Switch
                  checked={paramObj.value === 1}
                  onChange={(e) => handleParamChange(paramObj.name, e.target.checked ? 1 : 0)}
                  name={paramObj.name}
              />
          );
      } else if ((paramObj.type === 'int' || paramObj.type === 'float') && 'min' in paramObj && 'max' in paramObj) {
          // Slider for numeric values with defined min and max
          inputField = (
              <Slider
                  value={paramObj.value}
                  onChange={(e, newValue) => handleParamChange(paramObj.name, newValue)}
                  step={paramObj.type === 'float' ? 0.01 : 1}
                  min={paramObj.min}
                  max={paramObj.max}
                  name={paramObj.name}
              />
          );
      } else if (paramObj.type === 'int' || paramObj.type === 'float') {
          // Numeric input for numeric values without defined range
          inputField = (
              <input
                  type="number"
                  id={`param-${paramObj.name}`}
                  name={paramObj.name}
                  value={paramObj.value}
                  onChange={(e) => handleParamChange(paramObj.name, e.target.value)}
                  step={paramObj.type === 'float' ? '0.01' : '1'}
              />
          );
      } else {
          // Default to text input for other types
          inputField = (
              <input
                  type="text"
                  id={`param-${paramObj.name}`}
                  name={paramObj.name}
                  value={paramObj.value}
                  onChange={(e) => handleParamChange(paramObj.name, e.target.value)}
              />
          );
      }

      return (
          <div key={paramObj.name} className="parameter-input">
              <label htmlFor={`param-${paramObj.name}`}>{paramObj.name}:</label>
              {inputField}
              <p className="parameter-description">{paramObj.description}</p>
          </div>
      );
  };



    useEffect(() => {
        if (persona.model) {
            fetchAndSetParameters();
        }
    }, [persona.model, fetchAndSetParameters]);

    return (
        <div className="persona-settings">
            <div id='edit-container'>
                <button type="button" onClick={toggleEdit} id='edit-button'>
                    {isEditing ? <CloseIcon /> : <EditIcon />}
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ display: isEditing ? 'none' : 'block' }}>
                    <label htmlFor="model-select">Model:</label>
                    <select id="model-select" name="model" value={persona.model} onChange={handleModelChange}>
                        {models.map((model, index) => (
                            <option key={index} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </div>
                {isEditing && (
                    <>
                       <h2>{persona.model}</h2>
                        <div className="form-group-long">
                            <label htmlFor="system-textarea">System:</label>
                            <textarea
                                id='system-textarea'
                                name="system"
                                value={persona.system}
                                onChange={handleChange}
                                rows="5"
                            />
                        </div>
                        <div className="form-group">
                            {parameters.map((paramObj) => (
                                <div key={paramObj.name}>
                                    {renderInputField(paramObj)}
                                </div>
                            ))}
                        </div>
                        <button type="submit">Save</button>
                    </>
                )}
            </form>
        </div>
    );
}

export default PersonaSettings;
