import { useState, useEffect } from 'react';

// chatHelpers.js
export async function fetchBotReply(messageId, chatHistory, updateBotReply, persona, dispatch) {
  try {
    const cutoffString = `",\n    "content": "`;
    const cPrompt = JSON.stringify(chatHistory, null, 2);
    const cutoffIndex = cPrompt.lastIndexOf(cutoffString);
    const chatPrompt = cPrompt.substring(0, cutoffIndex + cutoffString.length);
    const systemPrompt = JSON.stringify(persona, null, 2);
    const finalPrompt = `${systemPrompt}\n\n${chatPrompt}`;
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
