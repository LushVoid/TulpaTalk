import React from 'react';


function PersonaSettings({ persona, onChange, onSubmit, models }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...persona, [name]: value });
  };

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    onChange({ ...persona, model: newModel });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };


  return (
    <div className="persona-settings">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Model:</label>
          <select name="model" value={persona.model} onChange={handleModelChange}>
            {models.map((model, index) => (
              <option key={index} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={persona.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Personality:</label>
          <input
            type="text"
            name="personality"
            value={persona.personality}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Expertise:</label>
          <input
            type="text"
            name="expertise"
            value={persona.expertise}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Rules:</label>
          <input
            type="text"
            name="rules"
            value={persona.rules}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default PersonaSettings;
