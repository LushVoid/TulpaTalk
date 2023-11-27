// Assuming fetch is available in your environment
// If using Node.js, you might need to install and import a fetch polyfill

export function createModelfileString(parsedJson) {
    let modelfileString = '';

    // Add SYSTEM section
    if (parsedJson.system) {
        modelfileString += 'SYSTEM """\n' + parsedJson.system + '\n"""\n';
    }

    // Add TEMPLATE section
    if (parsedJson.template) {
        modelfileString += 'TEMPLATE """\n' + parsedJson.template + '\n"""\n';
    }

    // Add PARAMETER sections
    for (const [param, value] of Object.entries(parsedJson.parameters)) {
        if (value !== 'none') {
            modelfileString += `PARAMETER ${param} ${value}\n`;
        }
    }

    return modelfileString;
}

export function parseModelfileToJson(modelfile, parametersList) {
    const jsonResult = {
        parameters: [...parametersList], // Copy the parametersList structure
        system: '',
        template: ''
    };

    // Function to extract content within triple quotes
    const extractTripleQuoteContent = (lines, startIdx) => {
        let content = '';
        let i = startIdx;
        while (i < lines.length && !lines[i].endsWith('"""')) {
            content += lines[i] + '\n';
            i++;
        }
        if (i < lines.length) {
            content += lines[i].slice(0, -3); // Remove closing triple quotes
        }
        return { content, nextIdx: i + 1 };
    };

    const lines = modelfile.split('\n');

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('SYSTEM """')) {
            const { content, nextIdx } = extractTripleQuoteContent(lines, i + 1);
            jsonResult.system = content;
            i = nextIdx - 1;
        } else if (lines[i].startsWith('TEMPLATE """')) {
            const { content, nextIdx } = extractTripleQuoteContent(lines, i + 1);
            jsonResult.template = content;
            i = nextIdx - 1;
        } else {
            jsonResult.parameters.forEach(param => {
                if (lines[i].startsWith(`PARAMETER ${param.name} `)) {
                    const paramValue = lines[i].substring(`PARAMETER ${param.name} `.length).trim();
                    // Parse the value based on the type of the parameter
                    if (param.type === 'int') {
                        param.value = parseInt(paramValue, 10);
                    } else if (param.type === 'float') {
                        param.value = parseFloat(paramValue);
                    } else {
                        param.value = paramValue;
                    }
                }
            });
        }
    }

    return jsonResult;
}


// Define the parameters list based on the boilerplate

export const parametersList = [
    {
        name: 'mirostat',
        type: 'int',
        value: 0,
        min: 0,
        max: 2,
        description: 'Enable Mirostat sampling for controlling perplexity.'
    },
    {
        name: 'mirostat_eta',
        type: 'float',
        value: 0.1,
        description: 'Influences how quickly the algorithm responds to feedback.'
    },
    {
        name: 'mirostat_tau',
        type: 'float',
        value: 5.0,
        description: 'Controls the balance between coherence and diversity of the output.'
    },
    {
        name: 'num_ctx',
        type: 'int',
        value: 2048,
        description: 'Sets the size of the context window used to generate the next token.'
    },
    {
        name: 'num_gqa',
        type: 'int',
        value: 8,
        description: 'The number of GQA groups in the transformer layer.'
    },
    {
        name: 'num_gpu',
        type: 'int',
        value: 1,
        description: 'The number of layers to send to the GPU(s).'
    },
    {
        name: 'num_thread',
        type: 'int',
        value: 8,
        description: 'Sets the number of threads to use during computation.'
    },
    {
        name: 'repeat_last_n',
        type: 'int',
        value: 64,
        min: 0,
        description: 'Sets how far back for the model to look back to prevent repetition.'
    },
    {
        name: 'repeat_penalty',
        type: 'float',
        value: 1.1,
        description: 'Sets how strongly to penalize repetitions.'
    },
    {
        name: 'temperature',
        type: 'float',
        value: 0.8,
        description: 'The temperature of the model.'
    },
    {
        name: 'seed',
        type: 'int',
        value: 0,
        description: 'Sets the random number seed for generation.'
    },
    {
        name: 'stop',
        type: 'string',
        value: '',
        description: 'Sets the stop sequences for the LLM.'
    },
    {
        name: 'tfs_z',
        type: 'float',
        value: 1,
        description: 'Tail free sampling setting.'
    },
    {
        name: 'num_predict',
        type: 'int',
        value: 128,
        min: -2,
        description: 'Maximum number of tokens to predict when generating text.'
    },
    {
        name: 'top_k',
        type: 'int',
        value: 40,
        description: 'Reduces the probability of generating nonsense.'
    },
    {
        name: 'top_p',
        type: 'float',
        value: 0.9,
        description: 'Works together with top-k for text diversity.'
    }
];
