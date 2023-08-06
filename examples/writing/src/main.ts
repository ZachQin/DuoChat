import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { createLanguageModel, CheckmateLanguageModel } from 'checkmate';
import { createCheckMate, Checkmate } from 'checkmate';

// Create executor and verifier
const executor: CheckmateLanguageModel = createLanguageModel(process.env);
const verifier: CheckmateLanguageModel = createLanguageModel(process.env);

// Create Checkmate instance
const checkmate: Checkmate = createCheckMate(executor, verifier);
checkmate.debug = true;

// Define task description
const taskDescription = 'Write an introduction for a blog post about the importance of digital privacy.';

// Run Checkmate
async function main(): Promise<void> {
  const result = await checkmate.perform(taskDescription);
  console.log('Final result:\n', result);
}

main();