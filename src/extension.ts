// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  getGitHubUrl,
  getRelativePathToRepoRoot,
  getRepoForFile,
  getRepoInfoFromRemoteUrl,
  openBrowser,
} from "./util";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "openingh" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "openingh.openInGitHub",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from openingh!");

      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let start = editor.selection.start.line;
      let end = editor.selection.end.line;

      let { branch, remote, remoteUrl } = getRepoForFile(editor.document.uri);
      // TODO: make sure the remote exists
      if (branch && remoteUrl) {
        let repoInfo = getRepoInfoFromRemoteUrl(remoteUrl);
        if (!repoInfo) {
          return;
        }

        let relativePath = getRelativePathToRepoRoot(editor.document.uri);
        if (!relativePath) {
          vscode.window.showErrorMessage(
            "Could not find the relative path to the repository root."
          );
          return;
        }

        let githubUrl = getGitHubUrl(
          repoInfo.author,
          repoInfo.repository,
          branch,
          relativePath,
          start,
          end
        );
        openBrowser(githubUrl);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
