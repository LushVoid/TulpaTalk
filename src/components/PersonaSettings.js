import React from 'react';

function newSysPrompt(modelfile, systemprompt) {
  // Regular expression to match the SYSTEM line and any number of following lines
  // until another block is detected or end of string
  const systemSectionRegex = /(SYSTEM\s*"""\s*)(.*?)(\s*"""(?=\s*(?:PARAMETER|TEMPLATE|FROM|$)))/gs;

  // Replacement string with new system prompt enclosed in triple quotes
  const replacement = `$1${systemprompt}$3`;

  // Replace the existing SYSTEM section with the new system prompt
  const newModelfile = modelfile.replace(systemSectionRegex, replacement);

  return newModelfile;
};


function PersonaSettings({ persona, onChange, onSubmit, models, updateModels }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...persona, [name]: value });
  };

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    onChange({ ...persona, model: newModel });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit();
    try {
        const response = await fetch('http://localhost:11434/api/show', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: persona.model
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        const wario = newSysPrompt(data.modelfile, persona.system);
        const modelData = {
          // Replace this with the actual model file content you want to send
          modelfile: wario,
          name: persona.name
        };

        try {
          const response = await fetch('http://localhost:5000/api/build-model', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(modelData),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }

          const data = await response.json();
          // Process the response data as needed
          //console.log(data);
        } catch (error) {
          console.error('There was an error!', error);
        }

    } catch (error) {
        console.error('There was an error saving the model!', error);
    }
    console.log(persona);
    updateModels();
  };


  return (
    <div className="persona-settings">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tulpa</label>
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
        <div className="form-group-long">
          <label>System:</label>
          <input
            type="text"
            name="system"
            value={persona.system}
            onChange={handleChange}
            rows="5"
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default PersonaSettings;
