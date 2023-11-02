import { Runnable, RunnableBatchOptions } from "./base.js";
import { RunnableConfig } from "./config.js";
import { IterableReadableStream } from "../../util/stream.js";
import { CallbackManagerForChainRun } from "../../callbacks/manager.js";
type RemoteRunnableOptions = {
    timeout?: number;
};
export declare class RemoteRunnable<RunInput, RunOutput, CallOptions extends RunnableConfig> extends Runnable<RunInput, RunOutput, CallOptions> {
    private url;
    private options?;
    lc_namespace: string[];
    constructor(fields: {
        url: string;
        options?: RemoteRunnableOptions;
    });
    private post;
    invoke(input: RunInput, options?: Partial<CallOptions>): Promise<RunOutput>;
    _batch(inputs: RunInput[], options?: Partial<CallOptions>[], _?: (CallbackManagerForChainRun | undefined)[], batchOptions?: RunnableBatchOptions): Promise<(RunOutput | Error)[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions & {
        returnExceptions?: false;
    }): Promise<RunOutput[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions & {
        returnExceptions: true;
    }): Promise<(RunOutput | Error)[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions): Promise<(RunOutput | Error)[]>;
    stream(input: RunInput, options?: Partial<CallOptions>): Promise<IterableReadableStream<RunOutput>>;
}
export {};
