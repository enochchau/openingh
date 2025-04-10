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
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "openingh.openInGitHubFile",
    () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      let { branch, remoteUrl, commit } = getRepoForFile(editor.document.uri);
      if (!branch && !commit) {
        vscode.window.showErrorMessage("Branch or commit not found.");
        return;
      }
      if (!remoteUrl) {
        vscode.window.showErrorMessage("No remote repository found.");
        return;
      }

      let repoInfo = getRepoInfoFromRemoteUrl(remoteUrl);
      if (!repoInfo) {
        vscode.window.showErrorMessage(
          `Repository info could not be parsed from: ${remoteUrl}.`
        );
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
        {
          author: repoInfo.author,
          repository: repoInfo.repository,
          branch: (branch || commit) as string,
        },
        { fileName: relativePath }
      );
      openBrowser(githubUrl);
    }
  );

  const disposable3 = vscode.commands.registerCommand(
    "openingh.openInGitHubLines",
    () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      let { branch, remoteUrl, commit } = getRepoForFile(editor.document.uri);
      if (!branch && !commit) {
        vscode.window.showErrorMessage("Branch or commit not found.");
        return;
      }
      if (!remoteUrl) {
        vscode.window.showErrorMessage("No remote repository found.");
        return;
      }
      let repoInfo = getRepoInfoFromRemoteUrl(remoteUrl);
      if (!repoInfo) {
        vscode.window.showErrorMessage(
          `Repository info could not be parsed from: ${remoteUrl}.`
        );
        return;
      }

      let relativePath = getRelativePathToRepoRoot(editor.document.uri);
      if (!relativePath) {
        vscode.window.showErrorMessage(
          "Could not find the relative path to the repository root."
        );
        return;
      }

      let start = editor.selection.start.line;
      let end = editor.selection.end.line;
      let githubUrl = getGitHubUrl(
        {
          author: repoInfo.author,
          repository: repoInfo.repository,
          branch: (branch || commit) as string,
        },
        {
          fileName: relativePath,
          start,
          end,
        }
      );
      openBrowser(githubUrl);
    }
  );

  const disposable2 = vscode.commands.registerCommand(
    "openingh.openInGitHubRepo",
    () => {
      let editor = vscode.window.activeTextEditor;
      let { branch, remoteUrl, commit } = getRepoForFile(editor?.document.uri);
      if (!branch && !commit) {
        vscode.window.showErrorMessage("Branch or commit not found.");
        return;
      }
      if (!remoteUrl) {
        vscode.window.showErrorMessage("No remote repository found.");
        return;
      }

      let repoInfo = getRepoInfoFromRemoteUrl(remoteUrl);
      if (!repoInfo) {
        vscode.window.showErrorMessage(
          `Repository info could not be parsed from: ${remoteUrl}.`
        );
        return;
      }

      let githubUrl = getGitHubUrl({
        author: repoInfo.author,
        repository: repoInfo.repository,
        branch: (branch || commit) as string,
      });

      openBrowser(githubUrl);
    }
  );

  context.subscriptions.push(disposable, disposable2, disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() {}
