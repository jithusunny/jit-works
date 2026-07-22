#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  field,
  issueRef,
  matchingItems,
  normalizeRestItem,
  planRows,
  sameTitle,
  scopeProductItems,
  title,
  url,
} from './work-lib.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CONFIG_PATH = resolve(ROOT, '.work/config.json');
let metadataCache;

function die(message, code = 1) {
  console.error(message);
  process.exitCode = code;
}

function command(binary, args, options = {}) {
  return execFileSync(binary, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    input: options.input,
    stdio: options.input === undefined ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function attempt(binary, args, options = {}) {
  return spawnSync(binary, args, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    input: options.input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function gh(args, options) {
  return command('gh', args, options);
}

function config() {
  if (!existsSync(CONFIG_PATH)) throw new Error(`missing ${CONFIG_PATH}`);
  const value = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  for (const key of ['owner', 'project', 'productRepo']) {
    if (!value[key]) throw new Error(`work config is missing ${key}`);
  }
  return value;
}

function ownerArgs(value) {
  return value.ownerType === 'org' ? ['--org', value.owner] : ['--user', value.owner];
}

function apiOwnerPath(value) {
  return value.ownerType === 'org' ? `orgs/${value.owner}` : `users/${value.owner}`;
}

function items(value) {
  const ids = Object.values(value.fieldIds || {});
  if (!ids.length) throw new Error('work config is missing fieldIds');
  const endpoint = `${apiOwnerPath(value)}/projectsV2/${value.project}/items?per_page=100&fields=${ids.join(',')}`;
  const raw = gh([
    'api', '--paginate', '--jq', '.[]',
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2026-03-10',
    endpoint,
  ]);
  return raw.split('\n').filter(Boolean).map((line) => normalizeRestItem(JSON.parse(line)));
}

function projectMetadata(value) {
  if (metadataCache) return metadataCache;
  const fields = JSON.parse(gh([
    'api',
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2026-03-10',
    `${apiOwnerPath(value)}/projectsV2/${value.project}/fields`,
  ]));
  metadataCache = { fields };
  return metadataCache;
}

function optionName(option) {
  return option.name?.raw ?? option.name;
}

function setFields(value, item, selections) {
  const metadata = projectMetadata(value);
  const updates = [];
  for (const [name, option] of Object.entries(selections)) {
    if (!option) continue;
    const projectField = metadata.fields.find((candidate) => candidate.name === name);
    const selected = projectField?.options?.find((candidate) => optionName(candidate).toLowerCase() === option.toLowerCase());
    if (!projectField || !selected) throw new Error(`Unknown ${name} option: ${option}`);
    updates.push({ id: projectField.id, value: selected.id });
  }
  if (!updates.length) return;
  gh([
    'api', '--method', 'PATCH',
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'X-GitHub-Api-Version: 2026-03-10',
    `${apiOwnerPath(value)}/projectsV2/${value.project}/items/${item.restId}`,
    '--input', '-',
  ], { input: JSON.stringify({ fields: updates }) });
}

function setField(value, item, name, option) {
  setFields(value, item, { [name]: option });
}

function projectItem(value, issueUrl) {
  return items(value).find((item) => url(item) === issueUrl || item.content?.url === issueUrl);
}

function productItems(value, all = items(value)) {
  return scopeProductItems(all, {
    repository: `${value.owner}/${value.productRepo}`,
    product: value.productName,
  });
}

function assertProductIssue(value, item) {
  const repository = `${value.owner}/${value.productRepo}`.toLowerCase();
  if (item.content?.repository?.toLowerCase() !== repository) {
    throw new Error(`Issue belongs to ${item.content?.repository || 'another repository'}, not ${repository}`);
  }
  if (value.productName && field(item, 'Product').toLowerCase() !== value.productName.toLowerCase()) {
    throw new Error(`Issue belongs to ${field(item, 'Product') || 'no product'}, not ${value.productName}`);
  }
}

function addIssueToProject(value, issueUrl) {
  gh([
    'projects', 'item-add', String(value.project), ...ownerArgs(value),
    '--url', issueUrl, '--format', 'json',
  ]);
  for (let attemptNumber = 0; attemptNumber < 5; attemptNumber += 1) {
    const item = projectItem(value, issueUrl);
    if (item?.restId) return item;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  throw new Error(`Issue was created but not visible in the Project: ${issueUrl}`);
}

function printItems(selected) {
  for (const item of selected) {
    const labels = [field(item, 'Workflow'), field(item, 'Product'), field(item, 'Phase'), field(item, 'Area')].filter(Boolean).join(' / ');
    console.log(`- ${title(item)}${labels ? ` [${labels}]` : ''}`);
    if (url(item)) console.log(`  ${url(item)}`);
  }
}

function brief(value) {
  const all = productItems(value);
  const withWorkflow = (name) => all.filter((item) => field(item, 'Workflow').toLowerCase() === name.toLowerCase());
  const active = withWorkflow('In progress');
  const ready = withWorkflow('Ready').slice(0, 3);
  const blocked = withWorkflow('Blocked');
  const done = withWorkflow('Done').slice(-3).reverse();
  const phases = [...new Set(active.map((item) => field(item, 'Phase')).filter(Boolean))];

  console.log(`Phase: ${phases.join(', ') || 'not selected'}`);
  console.log(`Active: ${active.length ? active.map(title).join(' | ') : 'none'}`);
  console.log(`Next: ${ready.length ? ready.map(title).join(' | ') : 'none ready'}`);
  console.log(`Blocked: ${blocked.length ? blocked.map(title).join(' | ') : 'none'}`);
  console.log(`Recently done: ${done.length ? done.map(title).join(' | ') : 'none recorded'}`);
  if (active[0] && url(active[0])) console.log(`Open: ${url(active[0])}`);
  if (active.length > 3) console.log(`Warning: ${active.length} items are in progress; reduce WIP.`);
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return '';
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

function showPlan(value, args) {
  const product = value.productName;
  const phase = option(args, '--phase');
  const area = option(args, '--area');
  const includeInactive = args.includes('--all');
  const rows = planRows(productItems(value), { product, phase, area, includeInactive });
  if (!rows.length) {
    console.log('No matching planned work.');
    return;
  }
  let lastGroup = '';
  for (const row of rows) {
    const group = `${row.product || 'No product'} | ${row.phase || 'No phase'} | ${row.area || 'No area'}`;
    if (group !== lastGroup) {
      if (lastGroup) console.log('');
      console.log(group);
      lastGroup = group;
    }
    console.log(`- ${row.workflow || 'No workflow'} · ${row.type || 'No type'} · ${row.priority || 'No priority'} · ${row.title}`);
    console.log(`  ${row.url}`);
  }
}

function search(value, args) {
  const query = args.filter((arg) => !arg.startsWith('--')).join(' ').trim();
  if (!query) throw new Error('Usage: npm run work -- search <text>');
  const matches = matchingItems(productItems(value), query);
  console.log(matches.length ? `Issue matches (${matches.length}):` : 'Issue matches: none');
  printItems(matches);

  const paths = ['docs', 'README.md'];
  const result = attempt('rg', ['-n', '-i', '--glob', '*.md', '--glob', '*.json', '--', query, ...paths], { cwd: ROOT });
  if (result.status === 0) console.log(`\nKnowledge matches:\n${result.stdout.trim()}`);
  else if (result.status === 1) console.log('\nKnowledge matches: none');
  else console.log(`\nKnowledge search unavailable: ${result.stderr.trim()}`);
}

function capture(value, args) {
  const issueTitle = args[0];
  if (!issueTitle) {
    throw new Error('Usage: npm run work -- capture "title" [--type ... --area ... --phase ... --priority ... --size ... --body-file path --confirm-new]');
  }
  const repo = `${value.owner}/${value.productRepo}`;
  const repositoryIssues = JSON.parse(gh(['issue', 'list', '--repo', repo, '--state', 'all', '--limit', '1000', '--json', 'title,url,state']));
  const exact = repositoryIssues.find((issue) => sameTitle(issue.title, issueTitle));
  if (exact) {
    const projectItems = items(value);
    if (String(exact.state).toLowerCase() === 'open' && !projectItems.some((item) => url(item) === exact.url)) {
      const item = addIssueToProject(value, exact.url);
      setFields(value, item, {
        Workflow: 'Inbox',
        Product: value.productName,
        Type: option(args, '--type'),
        Area: option(args, '--area'),
        Phase: option(args, '--phase'),
        Priority: option(args, '--priority'),
        Size: option(args, '--size'),
      });
      console.log(`Recovered existing issue into Inbox: ${exact.url}`);
    } else {
      console.log(`Existing issue: ${exact.url}`);
    }
    return;
  }

  const matches = matchingItems(items(value), issueTitle, { fuzzy: true });
  if (matches.length && !args.includes('--confirm-new')) {
    console.log('Possible existing work:');
    printItems(matches.slice(0, 8));
    throw new Error('Review these results, then update an existing item or repeat with --confirm-new');
  }

  const bodyPath = option(args, '--body-file');
  const body = bodyPath
    ? readFileSync(resolve(bodyPath), 'utf8')
    : `## Goal\n\n${issueTitle}\n\n## Why\n\nCaptured for Inbox triage.\n\n## Source\n\nCaptured through the work command.`;
  const issueUrl = gh(['issue', 'create', '--repo', repo, '--title', issueTitle, '--body', body]);
  const item = addIssueToProject(value, issueUrl);
  const selections = {
    Workflow: 'Inbox',
    Product: value.productName,
    Type: option(args, '--type'),
    Area: option(args, '--area'),
    Phase: option(args, '--phase'),
    Priority: option(args, '--priority'),
    Size: option(args, '--size'),
  };
  setFields(value, item, selections);
  console.log(`Captured in Inbox: ${issueUrl}`);
}

function dependencyData(ref, relation) {
  const result = attempt('gh', ['api', `repos/${ref.owner}/${ref.repo}/issues/${ref.number}/dependencies/${relation}`]);
  if (result.status !== 0) {
    const detail = result.stderr.trim();
    if (/404|Not Found/.test(detail)) return [];
    throw new Error(detail);
  }
  const parsed = JSON.parse(result.stdout || '[]');
  return Array.isArray(parsed) ? parsed : parsed.items || [];
}

function subIssues(ref) {
  const result = attempt('gh', ['api', `repos/${ref.owner}/${ref.repo}/issues/${ref.number}/sub_issues`]);
  if (result.status !== 0) {
    const detail = result.stderr.trim();
    if (/404|Not Found/.test(detail)) return [];
    throw new Error(detail);
  }
  return JSON.parse(result.stdout || '[]');
}

function start(value, args) {
  const issueUrl = args.find((arg) => !arg.startsWith('--'));
  const ref = issueRef(issueUrl);
  const all = items(value);
  const selected = all.find((item) => url(item) === ref.url);
  if (!selected) throw new Error(`Issue is not in the Project: ${ref.url}`);
  assertProductIssue(value, selected);
  if (field(selected, 'Workflow').toLowerCase() !== 'ready') throw new Error('Only a Ready item can start');
  if (field(selected, 'Type').toLowerCase() === 'epic') throw new Error('Split the epic into S slices before starting');
  if (field(selected, 'Size').toLowerCase() !== 's') throw new Error('Only an S item can start');
  for (const name of ['Product', 'Phase', 'Area', 'Priority', 'Type']) {
    if (!field(selected, name)) throw new Error(`The item is missing ${name}`);
  }
  const blockers = dependencyData(ref, 'blocked_by').filter((issue) => issue.state !== 'closed');
  if (blockers.length) throw new Error(`Open blocker: ${blockers[0].html_url}`);
  const active = all.filter((item) => field(item, 'Workflow').toLowerCase() === 'in progress');
  if (active.length && !args.includes('--parallel')) throw new Error(`Another item is active: ${url(active[0])}`);
  if (active.length >= 3) throw new Error('Three items are already active');
  if (args.includes('--parallel')) {
    console.log('Parallel work requires a separate branch or worktree with independent files and dependencies.');
  }
  setField(value, selected, 'Workflow', 'In progress');
  console.log(`Started: ${ref.url}`);
}

function finish(value, args) {
  const issueUrl = args.find((arg) => !arg.startsWith('--'));
  const evidencePath = option(args, '--evidence-file');
  if (!evidencePath) throw new Error('finish requires --evidence-file <path>');
  const evidence = readFileSync(resolve(evidencePath), 'utf8').trim();
  if (evidence.length < 40) throw new Error('Evidence is too short; include checks, runtime review, and a commit or PR link');
  if (!/(https:\/\/github\.com\/[^\s]+\/(?:commit|pull)\/|\b[0-9a-f]{7,40}\b)/i.test(evidence)) {
    throw new Error('Evidence must link a commit or PR, or include a commit hash');
  }
  const ref = issueRef(issueUrl);
  const selected = projectItem(value, ref.url);
  if (!selected) throw new Error(`Issue is not in the Project: ${ref.url}`);
  assertProductIssue(value, selected);
  if (field(selected, 'Workflow').toLowerCase() !== 'in progress') throw new Error('Only an In progress item can finish');
  const openChildren = subIssues(ref).filter((issue) => issue.state !== 'closed');
  if (openChildren.length) throw new Error(`Open sub-issue: ${openChildren[0].html_url}`);
  gh(['issue', 'comment', ref.url, '--body', `## Verification\n\n${evidence}`]);
  gh(['issue', 'close', ref.url]);
  setField(value, selected, 'Workflow', 'Done');
  console.log(`Finished: ${ref.url}`);
}

function audit(value) {
  const all = productItems(value);
  const active = all.filter((item) => field(item, 'Workflow').toLowerCase() === 'in progress');
  const ready = all.filter((item) => field(item, 'Workflow').toLowerCase() === 'ready');
  const controlled = all.filter((item) => ['ready', 'in progress', 'blocked'].includes(field(item, 'Workflow').toLowerCase()));
  const problems = [];
  if (active.length > 3) problems.push(`${active.length} items are in progress (maximum 3)`);
  if (ready.length > 5) problems.push(`${ready.length} items are ready (maximum 5)`);
  const inbox = all.filter((item) => field(item, 'Workflow').toLowerCase() === 'inbox');
  if (inbox.length >= 10) problems.push(`${inbox.length} items are in Inbox; triage before adding more`);
  for (const item of controlled) {
    for (const name of ['Product', 'Phase', 'Area', 'Priority', 'Type', 'Size']) {
      if (!field(item, name)) problems.push(`${field(item, 'Workflow')} item has no ${name}: ${title(item)}`);
    }
  }
  for (const item of [...active, ...ready]) {
    if (field(item, 'Type').toLowerCase() === 'epic') problems.push(`${field(item, 'Workflow')} epic must be split: ${title(item)}`);
    if (field(item, 'Size').toLowerCase() !== 's') problems.push(`${field(item, 'Workflow')} item is not S: ${title(item)}`);
  }
  for (const item of all) {
    const workflow = field(item, 'Workflow').toLowerCase();
    const builtInStatus = field(item, 'Status').toLowerCase();
    if (builtInStatus === 'done' && workflow && workflow !== 'done') problems.push(`closed issue is not Workflow Done: ${title(item)}`);
    if (builtInStatus && builtInStatus !== 'done' && workflow === 'done') problems.push(`open issue is Workflow Done: ${title(item)}`);
  }
  const now = Date.now();
  for (const item of active) {
    if (!url(item).includes('/issues/')) {
      problems.push(`active item is not a GitHub issue: ${title(item)}`);
      continue;
    }
    if (now - Date.parse(item.updatedAt) > 7 * 86_400_000) problems.push(`active item has not changed for 7 days: ${title(item)}`);
  }
  for (const item of inbox) {
    if (!url(item).includes('/issues/')) {
      problems.push(`Inbox item is not a GitHub issue: ${title(item)}`);
      continue;
    }
    if (now - Date.parse(item.createdAt) > 14 * 86_400_000) problems.push(`Inbox item is older than 14 days: ${title(item)}`);
  }
  if (value.retiredPlans) {
    for (const path of value.forbiddenPlanPaths || []) {
      if (existsSync(resolve(ROOT, path))) problems.push(`retired planning source still exists: ${path}`);
    }
  }
  if (problems.length) {
    console.error(problems.map((problem) => `- ${problem}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Work system audit passed.');
  }
}

function help() {
  console.log(`Usage: npm run work -- <command>

brief                          Show this product's active work, next three, blockers, and recent wins
plan [--phase X] [--area X]
                               Show planned work; add --all for Done/Deferred
search <text>                  Search this product's work and durable knowledge
capture TITLE                  Search first, then add a public Inbox issue
start ISSUE_URL                Validate and start one Ready S item; --parallel is explicit
finish ISSUE_URL --evidence-file FILE
                               Record verification, close the issue, and mark it Done
audit                          Fail on WIP, field, size, state, or retired-plan drift`);
}

function main() {
  const value = config();
  const [name = 'brief', ...args] = process.argv.slice(2);
  if (name === 'brief') brief(value);
  else if (name === 'plan') showPlan(value, args);
  else if (name === 'search') search(value, args);
  else if (name === 'capture') capture(value, args);
  else if (name === 'start') start(value, args);
  else if (name === 'finish') finish(value, args);
  else if (name === 'audit') audit(value);
  else if (name === 'help' || name === '--help' || name === '-h') help();
  else throw new Error(`Unknown command: ${name}`);
}

try {
  main();
} catch (error) {
  const detail = error?.stderr?.toString().trim() || error.message;
  die(`Work command failed: ${detail}`);
}
