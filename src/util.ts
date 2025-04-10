import path from "path";
import { GitExtension } from "./test/git";
import * as vscode from "vscode";

export function getRepoInfoFromRemoteUrl(url: string) {
  // Regex for HTTPS URLs (with optional auth and optional .git)
  const httpsRegex =
    /^(?:https?:\/\/)?(?:[^@/]+@)?([^/:]+)\/([^/]+)\/([^/.]+?)(?:\.git)?$/;
  const httpsMatch = url.match(httpsRegex);
  if (httpsMatch) {
    return { author: httpsMatch[2], repository: httpsMatch[3] };
  }

  // Regex for SSH URLs (user@host:owner/repo)
  const sshAtRegex = /^[^@]+@([^:]+):([^/]+)\/([^/.]+?)(?:\.git)?$/;
  const sshAtMatch = url.match(sshAtRegex);
  if (sshAtMatch) {
    return { author: sshAtMatch[2], repository: sshAtMatch[3] };
  }

  // Regex for SSH URLs (ssh://user@host/owner/repo)
  const sshProtocolRegex =
    /^ssh:\/\/([^@]+@)?([^/]+)\/([^/]+)\/([^/.]+?)(?:\.git)?$/;
  const sshProtocolMatch = url.match(sshProtocolRegex);
  if (sshProtocolMatch) {
    return { author: sshProtocolMatch[3], repository: sshProtocolMatch[4] };
  }

  // Regex for Git protocol URLs (git://host/owner/repo)
  const gitRegex = /^git:\/\/([^/]+)\/([^/]+)\/([^/.]+?)(?:\.git)?$/;
  const gitMatch = url.match(gitRegex);
  if (gitMatch) {
    return { author: gitMatch[2], repository: gitMatch[3] };
  }

  return null;
}

export function getRepoForFile(fileUri: vscode.Uri): {
  branch: string | undefined;
  remote: string | undefined;
  remoteUrl: string | undefined;
} {
  let gitExtension = vscode.extensions
    .getExtension<GitExtension>("vscode.git")
    ?.exports.getAPI(1);

  if (!gitExtension) {
    return { branch: undefined, remote: undefined, remoteUrl: undefined };
  }

  let repo = gitExtension.getRepository(fileUri);
  if (!repo) {
    return { branch: undefined, remote: undefined, remoteUrl: undefined };
  }

  let head = repo.state.HEAD;
  if (!head) {
    return { branch: undefined, remote: undefined, remoteUrl: undefined };
  }

  let remoteUrl: string | undefined;
  for (const remote of repo.state.remotes) {
    if (remote.name === head.upstream?.remote) {
      remoteUrl = remote.fetchUrl || remote.pushUrl;
      break;
    }
  }
  return { branch: head.name, remote: head.upstream?.remote, remoteUrl };
}

export function getGitHubUrl(
  author: string,
  repository: string,
  branch: string,
  fileName: string,
  start: number,
  end: number
) {
  let str = `https://github.com/${author}/${repository}/blob/${branch}/${fileName}#L${start}`;
  if (start !== end) {
    str += `-L${end}`;
  }
  return str;
}

export function getRelativePathToRepoRoot(resourceUri: vscode.Uri) {
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (!gitExtension) {
    console.warn("Git extension not found.");
    return null;
  }

  const gitApi = gitExtension.getAPI(1);
  const repository = gitApi.getRepository(resourceUri);

  if (!repository) {
    console.warn("No Git repository found for the given resource.");
    return null;
  }

  const rootUri = repository.rootUri;
  if (!rootUri) {
    console.warn("Could not determine repository root.");
    return null;
  }

  // Ensure the resourceUri is within the repository
  if (!resourceUri.fsPath.startsWith(rootUri.fsPath)) {
    console.warn("Resource is not within the repository.");
    return null;
  }

  const relativePath = path.relative(rootUri.fsPath, resourceUri.fsPath);
  return relativePath.replace(/\\/g, "/"); // Normalize path separators for consistency
}

export async function openBrowser(url: string): Promise<boolean> {
  try {
    const uri = vscode.Uri.parse(url);
    return await vscode.env.openExternal(uri);
  } catch (error) {
    console.error("Failed to open external URL:", error);
    vscode.window.showErrorMessage(`Failed to open URL: ${url}`);
    return false;
  }
}
