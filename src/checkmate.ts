import { TypeChatLanguageModel } from "./model";

export interface Checkmate {
    executor: TypeChatLanguageModel;
    verifier: TypeChatLanguageModel;
    refinementRounds: number;
    maxAttempts: number;
    debug: boolean;

    createExecuteInitialPrompt(taskDescription: string): string;
    createExecuteFollowupPrompt(taskDescription: string, previousExecutorSolution: string, verifierFeedback: string): string;
    createVerifyInitialPrompt(taskDescription: string, executorSolution: string): string;
    createVerifyFollowupPrompt(taskDescription: string, executorSolution: string): string;
    perform(taskDescription: string): Promise<string>;
}

interface RoundRecord {
    executorPrompt: string;
    executorSolution: string;
    verifierPrompt: string;
    verifierFeedback: string;
}

export function createCheckMate(executor: TypeChatLanguageModel, verifier: TypeChatLanguageModel, refinementRounds = 3): Checkmate {
    const checkmate = {
        executor,
        verifier,
        refinementRounds,
        maxAttempts: refinementRounds + 2,
        debug: false,
        createExecuteInitialPrompt,
        createExecuteFollowupPrompt,
        createVerifyInitialPrompt,
        createVerifyFollowupPrompt,
        perform,
    };
    return checkmate;

    function logForDebug(message?: any, ...optionalParams: any[]): void {
        if (checkmate.debug) {
            console.log(message, ...optionalParams);
        }
    }

    function warnForDebug(message?: any, ...optionalParams: any[]): void {
        if (checkmate.debug) {
            console.warn(message, ...optionalParams);
        }
    }

    function createExecuteInitialPrompt(taskDescription: string): string {
        return `As the task executor, your job is to complete the task described below:\n\`\`\`\n${taskDescription}\n\`\`\`\nGenerate a solution accordingly.`;
    }
    
    function createExecuteFollowupPrompt(taskDescription: string, previousExecutorSolution: string, verifierFeedback: string): string {
        return `As the task executor, based on the verifier's feedback, refine the solution for the following task:\n\`\`\`\n${taskDescription}\n\`\`\`\nYour previous solution was: \n\`\`\`\n${previousExecutorSolution}\n\`\`\`\nThe verifier's feedback on your previous solution was: \n\`\`\`\n${verifierFeedback}\n\`\`\`\nPlease provide an updated solution accordingly.`;
    }
    
    function createVerifyInitialPrompt(taskDescription: string, executorSolution: string): string {
        return `As the task verifier, critically review the solution for the task described below:\n\`\`\`\n${taskDescription}\n\`\`\`\nThe provided solution is: \n\`\`\`\n${executorSolution}\n\`\`\`\nHighlight any areas for improvement.`;
    }
    
    function createVerifyFollowupPrompt(taskDescription: string, executorSolution: string): string {
        return `As the task verifier, based on the refined solution, please review it again for the following task:\n\`\`\`\n${taskDescription}\n\`\`\`\nThe updated solution is: \n\`\`\`\n${executorSolution}\n\`\`\`\nIdentify any remaining areas that need further refinement.`;
    }

    async function perform(taskDescription: string): Promise<string> {
        const recordHistory: RoundRecord[] = [];
        let attempt = 0;
        while (recordHistory.length < checkmate.refinementRounds && attempt < checkmate.maxAttempts) {
            const round = recordHistory.length + 1;
            try {
                const lastRoundRecord = recordHistory[recordHistory.length - 1];
                const executorPrompt = recordHistory.length === 0 ?
                    createExecuteInitialPrompt(taskDescription) :
                    createExecuteFollowupPrompt(taskDescription, lastRoundRecord.executorSolution, lastRoundRecord.verifierFeedback);
                logForDebug(`>>>> Round ${round} executor prompt:\n${executorPrompt}\n`);
                const executorSolution = await executor.complete(executorPrompt);
                logForDebug(`<<<< Round ${round} executor solution:\n${executorSolution}\n`);
                if (recordHistory.length === checkmate.refinementRounds - 1) {
                    return executorSolution;
                }
                const verifierPrompt = recordHistory.length === 0 ?
                    createVerifyInitialPrompt(taskDescription, executorSolution) :
                    createVerifyFollowupPrompt(taskDescription, executorSolution);
                logForDebug(`>>>> Round ${round} verifier prompt:\n${verifierPrompt}\n`);
                const verifierFeedback = await verifier.complete(verifierPrompt);
                logForDebug(`<<<< Round ${round} verifier feedback:\n${verifierFeedback}\n`);
                recordHistory.push({
                    executorPrompt,
                    executorSolution,
                    verifierPrompt,
                    verifierFeedback,
                });
            } catch (error) {
                warnForDebug(`⚠︎⚠︎⚠︎⚠︎ Round ${round} error: `, error);
            } finally {
                attempt++;
            }
        }
        if (recordHistory.length === 0) {
            throw new Error(`Failed to generate a solution in ${attempt} attempts.`);
        }
        return recordHistory[recordHistory.length - 1].executorSolution;
    }
}