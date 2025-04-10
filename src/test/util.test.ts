import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { getRepoInfoFromRemoteUrl } from "../util";
// import * as myExtension from '../../extension';


suite("getRepoInfoFromRemoteUrl", () => {
  test("should correctly parse a standard HTTPS GitHub URL", () => {
    const url = "https://github.com/octocat/Spoon-Knife.git";
    const expected = { author: "octocat", repository: "Spoon-Knife" };
    assert.deepStrictEqual(getRepoInfoFromRemoteUrl(url), expected);
  });

  test("should correctly parse a standard SSH GitHub URL", () => {
    const url = "git@github.com:octocat/Spoon-Knife";
    const expected = { author: "octocat", repository: "Spoon-Knife" };
    assert.deepStrictEqual(getRepoInfoFromRemoteUrl(url), expected);
  });

  test("should correctly parse an SSH GitLab URL with a user", () => {
    const url = "ssh://git@gitlab.com:user/my-project.git";
    const expected = { author: "user", repository: "my-project" };
    assert.deepStrictEqual(getRepoInfoFromRemoteUrl(url), expected);
  });

  test("should correctly parse an HTTPS Bitbucket URL with a team", () => {
    const url = "https://user:pass@bitbucket.org/team/another-repo";
    const expected = { author: "team", repository: "another-repo" };
    assert.deepStrictEqual(getRepoInfoFromRemoteUrl(url), expected);
  });

  test("should correctly parse a Git protocol URL", () => {
    const url = "git://my-server/owner/simple-repo";
    const expected = { author: "owner", repository: "simple-repo" };
    assert.deepStrictEqual(getRepoInfoFromRemoteUrl(url), expected);
  });

  test("should return null for an invalid URL", () => {
    const url = "invalid-url";
    assert.strictEqual(getRepoInfoFromRemoteUrl(url), null);
  });
});
