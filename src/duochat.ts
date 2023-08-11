import { DuoChatLanguageModel } from "./model";

/**
 * DuoChat Interface
 * This interface defines the structure of the DuoChat system that uses two language models (executor and verifier) 
 * to iteratively perform and refine tasks.
 */
export interface DuoChat {
    /** 
     * The executor language model responsible for performing the task based on the provided description.
     */
    executor: DuoChatLanguageModel;
    /** 
     * The verifier language model responsible for reviewing the solution generated by the executor 
     * and providing feedback.
     */
    verifier: DuoChatLanguageModel;
    /**
     * Number of rounds during which the executor's solution will be refined based on verifier's feedback.
     */
    refinementRounds: number;
    /**
     * Maximum number of attempts allowed to generate a solution. This includes initial attempts and refinements.
     */
    maxAttempts: number;
    /**
     * A flag to indicate if the system should log debug messages.
     */
    debug: boolean;
    /**
     * Generate the initial prompt for the executor to produce a solution based on the task description.
     * @param taskDescription Description of the task to be executed.
     * @returns A prompt string for the executor.
     */
    createExecuteInitialPrompt(taskDescription: string): string;
    /**
     * Generate a follow-up prompt for the executor to refine the solution based on verifier's feedback.
     * @param taskDescription Original task description.
     * @param previousExecutorSolution Solution provided by the executor in the previous round.
     * @param verifierFeedback Feedback provided by the verifier on the previous solution.
     * @returns A prompt string for refining the executor's solution.
     */
    createExecuteFollowupPrompt(taskDescription: string, previousExecutorSolution: string, verifierFeedback: string): string;
    /**
     * Generate the initial prompt for the verifier to review the solution produced by the executor.
     * @param taskDescription Original task description.
     * @param executorSolution Solution provided by the executor.
     * @returns A prompt string for the verifier to review the solution.
     */
    createVerifyInitialPrompt(taskDescription: string, executorSolution: string): string;
    /**
     * Generate a follow-up prompt for the verifier to review the refined solution.
     * @param taskDescription Original task description.
     * @param executorSolution Refined solution provided by the executor.
     * @returns A prompt string for the verifier to review the refined solution.
     */
    createVerifyFollowupPrompt(taskDescription: string, executorSolution: string): string;
    /**
     * Main function to iteratively perform and refine tasks using the executor and verifier.
     * @param taskDescription Description of the task to be executed.
     * @returns The final refined solution.
     */
    perform(taskDescription: string): Promise<string>;
}

interface RoundRecord {
    executorPrompt: string;
    executorSolution: string;
    verifierPrompt: string;
    verifierFeedback: string;
}

/**
 * Creates an instance of the DuoChat system.
 * @param executor The language model to perform the tasks.
 * @param verifier The language model to verify and provide feedback.
 * @param refinementRounds Number of rounds to refine the solution.
 * @returns DuoChat instance.
 */
export function createDuoChat(executor: DuoChatLanguageModel, verifier: DuoChatLanguageModel): DuoChat {
    const duochat = {
        executor,
        verifier,
        refinementRounds: 3,
        maxAttempts: 5,
        debug: false,
        createExecuteInitialPrompt,
        createExecuteFollowupPrompt,
        createVerifyInitialPrompt,
        createVerifyFollowupPrompt,
        perform,
    };
    return duochat;

    function logForDebug(message?: any, ...optionalParams: any[]): void {
        if (duochat.debug) {
            console.log(message, ...optionalParams);
        }
    }

    function warnForDebug(message?: any, ...optionalParams: any[]): void {
        if (duochat.debug) {
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
        while (recordHistory.length < duochat.refinementRounds && attempt < duochat.maxAttempts) {
            const round = recordHistory.length + 1;
            try {
                const lastRoundRecord = recordHistory[recordHistory.length - 1];
                const executorPrompt = recordHistory.length === 0 ?
                    createExecuteInitialPrompt(taskDescription) :
                    createExecuteFollowupPrompt(taskDescription, lastRoundRecord.executorSolution, lastRoundRecord.verifierFeedback);
                logForDebug(`>>>> Round ${round} executor prompt:\n${executorPrompt}\n`);
                const executorSolution = await executor.complete(executorPrompt);
                logForDebug(`<<<< Round ${round} executor solution:\n${executorSolution}\n`);
                if (recordHistory.length === duochat.refinementRounds - 1) {
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