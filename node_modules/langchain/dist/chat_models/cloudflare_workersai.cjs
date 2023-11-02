"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCloudflareWorkersAI = void 0;
const base_js_1 = require("./base.cjs");
const index_js_1 = require("../schema/index.cjs");
const env_js_1 = require("../util/env.cjs");
/**
 * A class that enables calls to the Cloudflare Workers AI API to access large language
 * models in a chat-like fashion. It extends the SimpleChatModel class and
 * implements the CloudflareWorkersAIInput interface.
 */
class ChatCloudflareWorkersAI extends base_js_1.SimpleChatModel {
    static lc_name() {
        return "ChatCloudflareWorkersAI";
    }
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "@cf/meta/llama-2-7b-chat-int8"
        });
        Object.defineProperty(this, "cloudflareAccountId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cloudflareApiToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = fields?.model ?? this.model;
        this.cloudflareAccountId =
            fields?.cloudflareAccountId ??
                (0, env_js_1.getEnvironmentVariable)("CLOUDFLARE_ACCOUNT_ID");
        this.cloudflareApiToken =
            fields?.cloudflareApiToken ??
                (0, env_js_1.getEnvironmentVariable)("CLOUDFLARE_API_TOKEN");
        this.baseUrl =
            fields?.baseUrl ??
                `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/ai/run`;
        if (this.baseUrl.endsWith("/")) {
            this.baseUrl = this.baseUrl.slice(0, -1);
        }
    }
    _llmType() {
        return "cloudflare";
    }
    /** Get the identifying parameters for this LLM. */
    get identifyingParams() {
        return { model: this.model };
    }
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(_options) {
        return {
            model: this.model,
        };
    }
    _combineLLMOutput() {
        return {};
    }
    /**
     * Method to validate the environment.
     */
    validateEnvironment() {
        if (!this.cloudflareAccountId) {
            throw new Error(`No Cloudflare account ID found. Please provide it when instantiating the CloudflareWorkersAI class, or set it as "CLOUDFLARE_ACCOUNT_ID" in your environment variables.`);
        }
        if (!this.cloudflareApiToken) {
            throw new Error(`No Cloudflare API key found. Please provide it when instantiating the CloudflareWorkersAI class, or set it as "CLOUDFLARE_API_KEY" in your environment variables.`);
        }
    }
    _formatMessages(messages) {
        const formattedMessages = messages.map((message) => {
            let role;
            if (message._getType() === "human") {
                role = "user";
            }
            else if (message._getType() === "ai") {
                role = "assistant";
            }
            else if (message._getType() === "system") {
                role = "system";
            }
            else if (index_js_1.ChatMessage.isInstance(message)) {
                role = message.role;
            }
            else {
                console.warn(`Unsupported message type passed to Cloudflare: "${message._getType()}"`);
                role = "user";
            }
            return {
                role,
                content: message.content,
            };
        });
        return formattedMessages;
    }
    /** @ignore */
    async _call(messages, options) {
        this.validateEnvironment();
        const url = `${this.baseUrl}/${this.model}`;
        const headers = {
            Authorization: `Bearer ${this.cloudflareApiToken}`,
            "Content-Type": "application/json",
        };
        const formattedMessages = this._formatMessages(messages);
        const data = { messages: formattedMessages };
        const responseData = await this.caller.call(async () => {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(data),
                signal: options.signal,
            });
            if (!response.ok) {
                const error = new Error(`Cloudflare LLM call failed with status code ${response.status}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error.response = response;
                throw error;
            }
            return response.json();
        });
        return responseData.result.response;
    }
}
exports.ChatCloudflareWorkersAI = ChatCloudflareWorkersAI;
