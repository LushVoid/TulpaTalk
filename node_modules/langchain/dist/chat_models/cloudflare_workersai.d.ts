import { SimpleChatModel, BaseChatModelParams } from "./base.js";
import { BaseLanguageModelCallOptions } from "../base_language/index.js";
import { BaseMessage } from "../schema/index.js";
import { CloudflareWorkersAIInput } from "../llms/cloudflare_workersai.js";
/**
 * An interface defining the options for a Cloudflare Workers AI call. It extends
 * the BaseLanguageModelCallOptions interface.
 */
export interface ChatCloudflareWorkersAICallOptions extends BaseLanguageModelCallOptions {
}
/**
 * A class that enables calls to the Cloudflare Workers AI API to access large language
 * models in a chat-like fashion. It extends the SimpleChatModel class and
 * implements the CloudflareWorkersAIInput interface.
 */
export declare class ChatCloudflareWorkersAI extends SimpleChatModel implements CloudflareWorkersAIInput {
    static lc_name(): string;
    lc_serializable: boolean;
    model: string;
    cloudflareAccountId?: string;
    cloudflareApiToken?: string;
    baseUrl: string;
    constructor(fields?: CloudflareWorkersAIInput & BaseChatModelParams);
    _llmType(): string;
    /** Get the identifying parameters for this LLM. */
    get identifyingParams(): {
        model: string;
    };
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(_options?: this["ParsedCallOptions"]): {
        model: string;
    };
    _combineLLMOutput(): {};
    /**
     * Method to validate the environment.
     */
    validateEnvironment(): void;
    protected _formatMessages(messages: BaseMessage[]): {
        role: string;
        content: string;
    }[];
    /** @ignore */
    _call(messages: BaseMessage[], options: this["ParsedCallOptions"]): Promise<string>;
}
