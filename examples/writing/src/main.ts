import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { createLanguageModel, DuoChatLanguageModel } from 'duochat';
import { createDuoChat, DuoChat } from 'duochat';

// Create executor and verifier
const executor: DuoChatLanguageModel = createLanguageModel(process.env);
const verifier: DuoChatLanguageModel = createLanguageModel(process.env);

// Create DuoChat instance
const duochat: DuoChat = createDuoChat(executor, verifier);
duochat.debug = true;

// Define task description
const taskDescription = 'Write an introduction for a blog post about the importance of digital privacy.';

// Run DuoChat
async function main(): Promise<void> {
  const result = await duochat.perform(taskDescription);
  console.log('Final result:\n', result);
}

main();