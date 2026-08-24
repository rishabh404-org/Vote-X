/**
 * Vote-X Automated Git Synchronization Engine
 * Automatically detects changes, validates security constraints, stages files,
 * creates meaningful commits, safely pulls/rebases, and pushes to origin main.
 *
 * Usage:
 *   node scripts/auto-sync.js --once       # Perform single sync
 *   node scripts/auto-sync.js --watch      # Run continuous background watcher (default)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REMOTE = 'origin';
const BRANCH = 'main';
const DEBOUNCE_MS = 3500;

// Sensitive filename patterns that must NEVER be committed
const SENSITIVE_PATTERNS = [
  /^\.env/i,
  /\.pem$/i,
  /\.key$/i,
  /\.cert$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /id_rsa/i,
  /credentials\.json$/i,
  /secrets?\//i,
  /\.token$/i,
  /\.secret$/i
];

function runGit(command, options = {}) {
  try {
    return execSync(`git ${command}`, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    }).trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : '';
    const stdout = err.stdout ? err.stdout.toString().trim() : '';
    throw new Error(stderr || stdout || err.message);
  }
}

function getChangedFiles() {
  const statusOutput = runGit('status --porcelain');
  if (!statusOutput) return [];

  const lines = statusOutput.split('\n');
  const files = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const statusCode = line.substring(0, 2).trim();
    const filePath = line.substring(3).trim().replace(/^"|"$/g, '');
    files.push({ status: statusCode, path: filePath });
  }

  return files;
}

function checkSensitiveFiles(changedFiles) {
  for (const file of changedFiles) {
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(file.path)) {
        throw new Error(`SECURITY ALERT: Attempted to stage potentially sensitive file '${file.path}'. Commit aborted.`);
      }
    }
  }
}

function generateCommitMessage(changedFiles) {
  const fileNames = changedFiles.map(f => path.basename(f.path));
  const uniqueNames = Array.from(new Set(fileNames));
  const preview = uniqueNames.slice(0, 3).join(', ') + (uniqueNames.length > 3 ? ` (+${uniqueNames.length - 3} more)` : '');
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return `Auto-sync: update ${preview} [${timestamp}]`;
}

function syncNow(customMessage = null) {
  console.log('\n[Auto-Sync] Checking for workspace changes...');

  try {
    // 1. Verify remote and branch
    const currentBranch = runGit('rev-parse --abbrev-ref HEAD');
    if (currentBranch !== BRANCH) {
      console.log(`[Auto-Sync] Switching branch from '${currentBranch}' to '${BRANCH}'...`);
      runGit(`checkout ${BRANCH}`);
    }

    // 2. Check for local changes
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      console.log('[Auto-Sync] Working tree is clean. Checking for remote updates...');
      try {
        runGit(`fetch ${REMOTE} ${BRANCH}`);
        const localCommit = runGit(`rev-parse HEAD`);
        const remoteCommit = runGit(`rev-parse ${REMOTE}/${BRANCH}`);
        if (localCommit !== remoteCommit) {
          console.log('[Auto-Sync] Pulling remote updates with rebase...');
          runGit(`pull --rebase ${REMOTE} ${BRANCH}`);
          console.log('[Auto-Sync] Synced successfully with remote changes.');
        } else {
          console.log('[Auto-Sync] Already up-to-date with GitHub main.');
        }
      } catch (fetchErr) {
        console.warn(`[Auto-Sync] Note during remote check: ${fetchErr.message}`);
      }
      return { status: 'up-to-date', files: [] };
    }

    console.log(`[Auto-Sync] Detected ${changedFiles.length} changed file(s):`);
    changedFiles.forEach(f => console.log(`  - [${f.status || 'M'}] ${f.path}`));

    // 3. Security verification
    checkSensitiveFiles(changedFiles);

    // 4. Stage files
    console.log('[Auto-Sync] Staging files...');
    runGit('add .');

    // 5. Commit
    const commitMsg = customMessage || generateCommitMessage(changedFiles);
    console.log(`[Auto-Sync] Creating commit: "${commitMsg}"`);
    runGit(`commit -m "${commitMsg}"`);

    // 6. Safe pull/rebase before pushing
    console.log(`[Auto-Sync] Fetching ${REMOTE}/${BRANCH}...`);
    try {
      runGit(`fetch ${REMOTE} ${BRANCH}`);
      runGit(`pull --rebase ${REMOTE} ${BRANCH}`);
    } catch (pullErr) {
      console.log(`[Auto-Sync] Remote check status: ${pullErr.message}`);
    }

    // 7. Push to GitHub
    console.log(`[Auto-Sync] Pushing changes to ${REMOTE} ${BRANCH}...`);
    runGit(`push ${REMOTE} ${BRANCH}`);

    const latestCommit = runGit('rev-parse --short HEAD');
    console.log(`[Auto-Sync] SUCCESS! Pushed commit ${latestCommit} to https://github.com/rishabh404-org/Vote-X (branch: ${BRANCH})`);

    return {
      status: 'pushed',
      commit: latestCommit,
      message: commitMsg,
      files: changedFiles.map(f => f.path)
    };
  } catch (err) {
    console.error(`[Auto-Sync ERROR] ${err.message}`);
    return { status: 'error', error: err.message };
  }
}

function startWatcher() {
  console.log('====================================================');
  console.log('  Vote-X Continuous Auto-Sync Watcher Started');
  console.log(`  Target: https://github.com/rishabh404-org/Vote-X.git`);
  console.log(`  Branch: ${BRANCH}`);
  console.log('====================================================\n');

  // Initial sync check
  syncNow();

  let debounceTimer = null;

  const ignoredDirs = ['.git', 'node_modules', '.cache'];

  fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    // Ignore changes in git directory and temporary files
    for (const ignored of ignoredDirs) {
      if (filename.startsWith(ignored) || filename.includes(`/${ignored}/`) || filename.includes(`\\${ignored}\\`)) {
        return;
      }
    }

    if (filename.endsWith('.log') || filename.endsWith('~') || filename.startsWith('.tmp')) {
      return;
    }

    console.log(`[Watcher] File change detected: ${filename}`);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncNow();
    }, DEBOUNCE_MS);
  });

  console.log('[Watcher] Watching for local file modifications...\n');
}

// CLI Argument Handling
const args = process.argv.slice(2);
if (args.includes('--once')) {
  const result = syncNow();
  process.exit(result.status === 'error' ? 1 : 0);
} else {
  startWatcher();
}
