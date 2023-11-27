import { useState, useEffect, useCallback } from 'react';
import { parseModelfileToJson, parametersList } from './modelfileHandler'; // Assumed to be utility functions for parsing
const { Ollama } = require("langchain/llms/ollama");
const { StringOutputParser } = require("langchain/schema");



function createFinalPrompt(chatHistory, persona) {
  // convert to ChatML prompt format
  let finalPrompt =``;

  // Loop through the chatHistory
  chatHistory.forEach((message) => {
    switch (message.role) {
      case 'user':
        // Append user messages prefixed with 'user'
        finalPrompt += `<|im_start|>user\n${message.content}\n!<|im_end|>\n`;
        break;
      case persona.name:
        // Append assistant messages with the 'assistant' tag and include the start tag
        finalPrompt += `<|im_start|>${persona.name}\n${message.content}!<|im_end|>\n`;
        break;
      default:
        // Handle any other roles or ignore them
        break;
    }
  });


  const target = '!<|im_end|>\n';
  const lastIndex = finalPrompt.lastIndexOf(target);
  if (lastIndex !== -1 && lastIndex === finalPrompt.length - target.length) {
    // It's at the end, so remove it
    finalPrompt = finalPrompt.substring(0, lastIndex);
  }

  return finalPrompt;
}

function fetchPromptFormats() {
  const apiTagsEndpoint = "http://localhost:11434/api/tags";
  const apiShowEndpoint = "http://localhost:11434/api/show";

  // This function now returns a Promise that resolves with the unique templates array
  return new Promise(async (resolve, reject) => {
    const uniqueTemplates = new Set(); // A set to hold unique templates

    try {
      // Fetch the list of models
      const tagsResponse = await fetch(apiTagsEndpoint);
      if (!tagsResponse.ok) throw new Error('Failed to fetch model tags.');
      const tagsData = await tagsResponse.json();

      // Extract model names and fetch their templates
      for (const model of tagsData.models) {
        const modelName = model.name;

        // Make the POST request to fetch the model's template
        const showResponse = await fetch(apiShowEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName }),
        });

        if (!showResponse.ok) {
          console.error(`Failed to fetch template for model: ${modelName}`);
          continue; // Skip to the next model if the fetch failed
        }

        const templateData = await showResponse.json();
        if (templateData && templateData['template']) {
          uniqueTemplates.add(templateData['template']); // Add the template to the Set
        }
      }

      // Convert the Set of unique templates to an Array and resolve the Promise with it
      resolve([...uniqueTemplates]);
    } catch (error) {
      console.error("Error in fetching models and templates:", error);
      reject(error); // Reject the Promise if there is an error
    }
  });
}




// chatHelpers.js
export async function fetchBotReply(messageId, chatHistory, updateBotReply, persona, dispatch) {
  try {

    // Use the new function to create the final prompt
    const finalPrompt = createFinalPrompt(chatHistory, persona);
    console.log('-'.repeat(12)); // Corrected '*' to '-' and use 'repeat'
    console.log(finalPrompt);
    console.log();

    dispatch({ type: 'SET_LOADING_STATE', payload: true });

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: persona.model,
        prompt: finalPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reader = response.body.getReader();
    let partialLine = '';
    let finalResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        updateBotReply(messageId, finalResponse, false); // Ensure typing is set to false when done
        break;
      }

      const text = new TextDecoder().decode(value);
      const lines = (partialLine + text).split('\n');
      partialLine = lines.pop();

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            finalResponse += json.response;
            updateBotReply(messageId, finalResponse, true);
          }
        } catch (error) {
          console.error('Error parsing JSON line:', line, error);
        }
      }
    }
  } catch (error) {
    console.error('Fetching bot response failed:', error);
    updateBotReply(messageId, "Sorry, an error occurred. Please try again later.", false);
  } finally {
    // Ensure that the loading state is set to false when done
    dispatch({ type: 'SET_LOADING_STATE', payload: false });
  }
}

export const useModelParameters = (persona) => {
    const [parameters, setParameters] = useState({
        mirostat: '1',
        temperature: '0.7',
        num_ctx: '4096',
    });

    const fetchAndSetParameters = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:11434/api/show', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: persona.model }),
            });

            if (!response.ok) {
                throw new Error(`Error fetching model: ${response.status}`);
            }

            const data = await response.json();
            const parsed = parseModelfileToJson(data.modelfile, parametersList);
            setParameters(parsed.parameters);
        } catch (error) {
            console.error('Error fetching modelfile:', error);
        }
    }, [persona.model]);

    return { parameters, fetchAndSetParameters };
}


export const useSubmitHandler = ({ persona, onSubmit, updateModels, newSysPrompt }) => {
    return useCallback(async (event) => {
        event.preventDefault();
        onSubmit(); // Assuming this is a necessary function call prior to the fetch requests

        try {
            const showResponse = await fetch('http://localhost:11434/api/show', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: persona.model }),
            });

            if (!showResponse.ok) {
                throw new Error(`Show API response error: ${showResponse.status}`);
            }

            const showData = await showResponse.json();
            const updatedModelfile = newSysPrompt(showData.modelfile, persona.system);

            const buildModelResponse = await fetch('http://localhost:5000/api/build-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelfile: updatedModelfile, name: persona.name }),
            });

            if (!buildModelResponse.ok) {
                throw new Error(`Build Model API response error: ${buildModelResponse.status}`);
            }

            await buildModelResponse.json(); // Assuming you might need to do something with this response
            updateModels(); // Update models after successful submission

        } catch (error) {
            console.error('Error during form submission:', error);
        }
    }, [persona, onSubmit, updateModels, newSysPrompt]);
}
