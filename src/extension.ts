// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios from "axios";
import * as dotenv from "dotenv";
const debounce = require("lodash.debounce");

dotenv.config();

export async function explainSelection(selection: string): Promise<string> {
  const openaiApiKey = process.env.OPEN_AI_API_KEY;

  console.log({ openaiApiKey });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "text-davinci-002",
        document: `Explain the meaning of the following regular expression pattern:\n\n${selection}`,
        query: "",
        examples: [],
        temperature: 0.5,
        max_tokens: 50,
        stop: ["\n", "Explanation:"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const explanation = response.data.explanations[0].text;
    return explanation;
  } catch (error) {
    console.error(error);
  }
  return "";
}

export const debouncedExplainRegex = debounce(explainSelection, 1000);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "helloworld-sample" is now active!'
  );

  const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
    const selectedText = event.textEditor.document.getText(event.selections[0]);
    if (selectedText && isValidRegex(selectedText)) {
      const e = debouncedExplainRegex(selectedText);
      vscode.window.showInformationMessage(`Explanation: ${e}`);
    }
  });

  context.subscriptions.push(disposable);
}

function isValidRegex(regex: string): boolean {
  const [pattern, options] = regex.split("/");
  try {
    new RegExp(pattern, options);
    return true;
  } catch (e) {
    return false;
  }
}
