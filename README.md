# DuoChat

DuoChat is an advanced language model interaction framework, designed to allow one model to execute a task and another model to verify or refine that task through a set number of rounds. This iterative process promotes the generation of more refined content by engaging two models in a back-and-forth conversation.

## Inspiration

This project is inspired by and extends the concepts from [TypeChat](https://github.com/microsoft/TypeChat). We would like to express our gratitude to the original TypeChat project by Microsoft for laying the groundwork.

## Features

- **Dual Model Interactions**: One model as the executor, the other as the verifier.
- **Iterative Refinement**: Multiple rounds of task refinement to improve accuracy and quality.
- **Configurable Rounds**: Adjust the number of refinement rounds as per your needs.
- **Debug Mode**: Enhanced logging for debugging and insight purposes.

## How to Use

To use DuoChat, you need to:

1. Initialize your executor and verifier models.
2. Define your task.
3. Call the `perform` method to get the models to interact and refine the task solution.

## Installation

```bash
npm install duochat
```

## Example

```typescript
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
```

## Acknowledgements

Special thanks to [TypeChat](https://github.com/microsoft/TypeChat) for providing the foundational ideas and structure for this project.

## License

[MIT License](LICENSE)
