import { useState, useEffect } from 'react';

function createFinalPrompt(chatHistory, persona) {
  // convert to ChatML prompt format
  let finalPrompt =`<|im_start|>system\n${JSON.stringify(persona)}\n!<|im_end|>\n`;

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
