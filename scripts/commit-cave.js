const fs = require('node:fs');
const path = require('node:path');

const login = process.env.GITHUB_LOGIN || 'Estevam98';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN não está disponível.');

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + token,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Commit-Cave-Portfolio'
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error('GitHub API ' + response.status + ' em ' + url + ': ' + detail.slice(0, 250));
  }
  return response.json();
}

async function listAllPublicRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await getJson('https://api.github.com/users/' + encodeURIComponent(login) + '/repos?type=public&per_page=100&page=' + page);
    repos.push(...batch.filter(repo => !repo.fork && !repo.archived));
    if (batch.length < 100) break;
  }
  return repos;
}

async function listMyCommits(repo) {
  const found = [];
  for (let page = 1; ; page++) {
    const batch = await getJson('https://api.github.com/repos/' + encodeURIComponent(login) + '/' + encodeURIComponent(repo.name) + '/commits?per_page=100&page=' + page);
    for (const item of batch) {
      // Keep commits attributed by GitHub to the profile owner.
      if (item.author && item.author.login && item.author.login.toLowerCase() === login.toLowerCase()) {
        found.push({
          sha: item.sha,
          date: item.commit.author?.date || item.commit.committer?.date,
          message: (item.commit.message || '').split('\n')[0].slice(0, 120),
          url: item.html_url,
          repository: repo.name
        });
      }
    }
    if (batch.length < 100) break;
  }
  return found;
}

async function main() {
  const repos = await listAllPublicRepos();
  const all = [];
  // Sequential requests are deliberate to avoid bursting the GitHub API rate limit.
  for (const repo of repos) {
    const commits = await listMyCommits(repo);
    all.push(...commits);
    console.log(repo.full_name + ': ' + commits.length + ' commits attributed to ' + login);
  }
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  const data = {
    owner: login,
    generatedAt: new Date().toISOString(),
    repositoriesScanned: repos.length,
    totalCommits: all.length,
    lastCommit: all[0] || null,
    commits: all
  };
  const output = path.join(process.cwd(), 'commit-cave', 'data', 'commits.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(data, null, 2) + '\n');
  console.log('Wrote ' + all.length + ' commits to ' + output);
}

main().catch(error => { console.error(error); process.exit(1); });