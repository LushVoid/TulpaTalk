"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLlamaCpp = void 0;
const node_llama_cpp_1 = require("node-llama-cpp");
const base_js_1 = require("./base.cjs");
/**
 *  To use this model you need to have the `node-llama-cpp` module installed.
 *  This can be installed using `npm install -S node-llama-cpp` and the minimum
 *  version supported in version 2.0.0.
 *  This also requires that have a locally built version of Llama2 installed.
 */
class ChatLlamaCpp extends base_js_1.SimpleChatModel {
    static lc_name() {
        return "ChatLlamaCpp";
    }
    constructor(inputs) {
        super(inputs);
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contextSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "embedding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "f16Kv", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gpuLayers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logitsAll", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lowVram", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "seed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "useMlock", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "useMmap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vocabOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "modelPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_session", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.batchSize = inputs?.batchSize;
        this.contextSize = inputs?.contextSize;
        this.embedding = inputs?.embedding;
        this.f16Kv = inputs?.f16Kv;
        this.gpuLayers = inputs?.gpuLayers;
        this.logitsAll = inputs?.logitsAll;
        this.lowVram = inputs?.lowVram;
        this.modelPath = inputs.modelPath;
        this.seed = inputs?.seed;
        this.useMlock = inputs?.useMlock;
        this.useMmap = inputs?.useMmap;
        this.vocabOnly = inputs?.vocabOnly;
        this._model = new node_llama_cpp_1.LlamaModel(inputs);
        this._context = new node_llama_cpp_1.LlamaContext({ model: this._model });
        this._session = null;
    }
    _llmType() {
        return "llama2_cpp";
    }
    invocationParams() {
        return {
            batchSize: this.batchSize,
            contextSize: this.contextSize,
            embedding: this.embedding,
            f16Kv: this.f16Kv,
            gpuLayers: this.gpuLayers,
            logitsAll: this.logitsAll,
            lowVram: this.lowVram,
            modelPath: this.modelPath,
            seed: this.seed,
            useMlock: this.useMlock,
            useMmap: this.useMmap,
            vocabOnly: this.vocabOnly,
        };
    }
    /** @ignore */
    _combineLLMOutput() {
        return {};
    }
    /** @ignore */
    async _call(messages, options) {
        let prompt = "";
        if (messages.length > 1) {
            // We need to build a new _session
            prompt = this._buildSession(messages);
        }
        else if (!this._session) {
            prompt = this._buildSession(messages);
        }
        else {
            // If we already have a session then we should just have a single prompt
            prompt = messages[0].content;
        }
        try {
            // @ts-expect-error - TS2531: Object is possibly 'null'.
            const completion = await this._session.prompt(prompt, options);
            return completion;
        }
        catch (e) {
            throw new Error("Error getting prompt completion.");
        }
    }
    // This constructs a new session if we need to adding in any sys messages or previous chats
    _buildSession(messages) {
        let prompt = "";
        let sysMessage = "";
        let noSystemMessages = [];
        let interactions = [];
        // Let's see if we have a system message
        if (messages.findIndex((msg) => msg._getType() === "system") !== -1) {
            const sysMessages = messages.filter((message) => message._getType() === "system");
            // Only use the last provided system message
            sysMessage = sysMessages[sysMessages.length - 1].content;
            // Now filter out the system messages
            noSystemMessages = messages.filter((message) => message._getType() !== "system");
        }
        else {
            noSystemMessages = messages;
        }
        // Lets see if we just have a prompt left or are their previous interactions?
        if (noSystemMessages.length > 1) {
            // Is the last message a prompt?
            if (noSystemMessages[noSystemMessages.length - 1]._getType() === "human") {
                prompt = noSystemMessages[noSystemMessages.length - 1].content;
                interactions = this._convertMessagesToInteractions(noSystemMessages.slice(0, noSystemMessages.length - 1));
            }
            else {
                interactions = this._convertMessagesToInteractions(noSystemMessages);
            }
        }
        else {
            // If there was only a single message we assume it's a prompt
            prompt = noSystemMessages[0].content;
        }
        // Now lets construct a session according to what we got
        if (sysMessage !== "" && interactions.length > 0) {
            this._session = new node_llama_cpp_1.LlamaChatSession({
                context: this._context,
                conversationHistory: interactions,
                systemPrompt: sysMessage,
            });
        }
        else if (sysMessage !== "" && interactions.length === 0) {
            this._session = new node_llama_cpp_1.LlamaChatSession({
                context: this._context,
                systemPrompt: sysMessage,
            });
        }
        else if (sysMessage === "" && interactions.length > 0) {
            this._session = new node_llama_cpp_1.LlamaChatSession({
                context: this._context,
                conversationHistory: interactions,
            });
        }
        else {
            this._session = new node_llama_cpp_1.LlamaChatSession({
                context: this._context,
            });
        }
        return prompt;
    }
    // This builds a an array of interactions
    _convertMessagesToInteractions(messages) {
        const result = [];
        for (let i = 0; i < messages.length; i += 2) {
            if (i + 1 < messages.length) {
                result.push({
                    prompt: messages[i].content,
                    response: messages[i + 1].content,
                });
            }
        }
        return result;
    }
}
exports.ChatLlamaCpp = ChatLlamaCpp;
