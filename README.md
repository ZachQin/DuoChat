# Checkmate

Checkmate is an advanced conversation system built on top of language models, allowing for iterative refinement of tasks via an executor-verifier duo. Inspired and structurally referencing the [TypeChat](https://github.com/microsoft/TypeChat) project by Microsoft, Checkmate aims to further the capabilities of iterative model refinement.

A special thanks to the Microsoft TypeChat team for paving the way.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Support](#contact--support)

## Features

- **Executor-Verifier Duo**: A dynamic duo of executor and verifier roles ensures improved results over iterations.
- **Iterative Refinement**: Perform multiple rounds of task execution and verification.
- **Extensibility**: Can be used with any language model compatible with the TypeChat-like architecture.
- **Debugging Support**: Detailed logging and warning features for developers.

## Installation

   ```
   npm install checkmate
   ```

## Usage

Here's a simple example to get you started:

```typescript
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
```

For detailed usage, configuration options, and other advanced features, refer to the inline documentation in the `checkmate.ts` file.

## Contributing

We welcome contributions! Please follow the below steps:

1. Fork the repository.
2. Create a new branch for your features or fixes.
3. Submit a pull request, and provide a detailed description of your changes.

## License

This project is licensed under the MIT License. Refer to the `LICENSE` file for detailed information.

## Contact & Support

For any queries, bug reports, or feature requests, open an issue on GitHub.

---

Happy refining with Checkmate! 🏁