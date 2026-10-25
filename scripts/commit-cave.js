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

async function listWorkflowResults(repo) {
  const result = { successfulRuns: 0, failedRuns: 0, pendingRuns: 0, checkedRuns: 0, latestConclusion: null, latestRunAt: null, latestRunUrl: null, runs: [] };
  try {
    const payload = await getJson('https://api.github.com/repos/' + encodeURIComponent(login) + '/' + encodeURIComponent(repo.name) + '/actions/runs?per_page=30');
    const relevant = (payload.workflow_runs || []).filter(run => {
      const label = ((run.name || '') + ' ' + (run.path || '')).toLowerCase();
      return /test|ci|quality|e2e|playwright|cypress|postman|newman|automation|spec/.test(label);
    }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    // Count only the latest run for each workflow so an old failure does not
    // keep the cave red after a newer successful run of the same workflow.
    const latestByWorkflow = new Map();
    for (const run of relevant) {
      const key = String(run.workflow_id || run.name || run.path);
      if (!latestByWorkflow.has(key)) latestByWorkflow.set(key, run);
    }
    for (const run of latestByWorkflow.values()) {
      result.checkedRuns++;
      if (run.status !== 'completed') result.pendingRuns++;
      else if (run.conclusion === 'success') result.successfulRuns++;
      else if (['failure', 'timed_out', 'cancelled', 'action_required'].includes(run.conclusion)) result.failedRuns++;
      result.runs.push({
        name: run.name || 'GitHub Actions',
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        url: run.html_url,
        repository: repo.name
      });
    }
    result.runs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (result.runs.length) {
      result.latestConclusion = result.runs[0].conclusion || result.runs[0].status;
      result.latestRunAt = result.runs[0].createdAt;
      result.latestRunUrl = result.runs[0].url;
    }
  } catch (error) {
    console.log('Actions indisponível em ' + repo.name + ': ' + error.message);
  }
  return result;
}

async function main() {
  const repos = await listAllPublicRepos();
  const all = [];
  const ci = { successfulRuns: 0, failedRuns: 0, pendingRuns: 0, checkedRuns: 0, latestConclusion: null, latestRunAt: null, latestRunUrl: null, runs: [] };
  // Sequential requests reduce API bursts and keep collection within rate limits.
  for (const repo of repos) {
    const commits = await listMyCommits(repo);
    all.push(...commits);
    const workflow = await listWorkflowResults(repo);
    ci.successfulRuns += workflow.successfulRuns;
    ci.failedRuns += workflow.failedRuns;
    ci.pendingRuns += workflow.pendingRuns;
    ci.checkedRuns += workflow.checkedRuns;
    ci.runs.push(...workflow.runs);
    console.log(repo.full_name + ': ' + commits.length + ' commits; ' + workflow.checkedRuns + ' relevant workflow runs');
  }
  ci.runs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (ci.runs.length) {
    ci.latestConclusion = ci.runs[0].conclusion || ci.runs[0].status;
    ci.latestRunAt = ci.runs[0].createdAt;
    ci.latestRunUrl = ci.runs[0].url;
  }
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  const data = {
    owner: login,
    generatedAt: new Date().toISOString(),
    repositoriesScanned: repos.length,
    totalCommits: all.length,
    lastCommit: all[0] || null,
    ci,
    commits: all
  };
  const output = path.join(process.cwd(), 'commit-cave', 'data', 'commits.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(data, null, 2) + '\n');
  console.log('Wrote ' + all.length + ' commits to ' + output);
}

main().catch(error => { console.error(error); process.exit(1); });