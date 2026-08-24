/**
 * Vote-X Admin Dashboard Controller
 * Provides real-time metrics, election lifecycle management,
 * voter registry search, and immutable blockchain ledger inspection.
 */

class AdminController {
  constructor() {
    this.currentTab = 'overview';
    this.init();
  }

  init() {
    // Subscribe to state updates
    window.StateStore.subscribe((state) => {
      this.render();
    });

    this.render();
  }

  setTab(tabName) {
    this.currentTab = tabName;
    window.SoundFX.playClick();

    // Update active tab styles in sidebar
    document.querySelectorAll('.admin-nav-item').forEach(el => {
      if (el.getAttribute('data-tab') === tabName) {
        el.className = 'admin-nav-item flex items-center gap-3 bg-primary text-white rounded-xl px-4 py-3 mx-2 shadow-sm transition-all';
      } else {
        el.className = 'admin-nav-item flex items-center gap-3 text-surface-variant hover:text-white px-4 py-3 mx-2 transition-colors hover:bg-white/5 rounded-xl';
      }
    });

    // Show appropriate tab content section
    const tabs = ['overview', 'elections', 'candidates', 'voters', 'ledger'];
    tabs.forEach(t => {
      const section = document.getElementById(`admin-tab-${t}`);
      if (section) {
        if (t === tabName) {
          section.classList.remove('hidden');
          section.classList.add('block');
        } else {
          section.classList.add('hidden');
          section.classList.remove('block');
        }
      }
    });

    this.render();
  }

  render() {
    const stats = window.StateStore.getStats();
    const state = window.StateStore.getState();

    // Update Top Stat Cards
    const totalVotersEl = document.getElementById('admin-stat-total-voters');
    const votesCastEl = document.getElementById('admin-stat-votes-cast');
    const turnoutPctEl = document.getElementById('admin-stat-turnout-pct');
    const activeElectionsEl = document.getElementById('admin-stat-active-elections');

    if (totalVotersEl) totalVotersEl.textContent = stats.totalVoters.toLocaleString();
    if (votesCastEl) votesCastEl.textContent = stats.votesCast.toLocaleString();
    if (turnoutPctEl) turnoutPctEl.textContent = `${stats.turnoutPct}%`;
    if (activeElectionsEl) activeElectionsEl.textContent = stats.activeElectionsCount;

    // Progress Bar
    const progressFill = document.getElementById('admin-turnout-progress-fill');
    const progressLabel = document.getElementById('admin-turnout-progress-label');
    if (progressFill) progressFill.style.width = `${Math.min(stats.turnoutPct, 100)}%`;
    if (progressLabel) progressLabel.textContent = `${stats.turnoutPct}% Completed`;

    // Candidate Results Grid / List in Overview
    this.renderCandidateLiveResults(stats.activeElection);

    // Recent Activity Feed
    this.renderActivityFeed(state.activities);

    // Tab-specific views
    if (this.currentTab === 'elections') {
      this.renderElectionsList(state.elections);
    } else if (this.currentTab === 'candidates') {
      this.renderCandidatesManagement(state.elections);
    } else if (this.currentTab === 'voters') {
      this.renderVotersRegistry(state.voters);
    } else if (this.currentTab === 'ledger') {
      this.renderAuditLedger(state.auditLedger);
    }
  }

  renderCandidateLiveResults(election) {
    const container = document.getElementById('admin-candidate-results-container');
    if (!container || !election) return;

    container.innerHTML = '';
    const totalVotes = election.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

    // Sort by highest votes
    const sorted = [...election.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));

    sorted.forEach((cand, idx) => {
      const pct = totalVotes > 0 ? (((cand.votes || 0) / totalVotes) * 100).toFixed(1) : '0.0';
      const isLeader = idx === 0 && (cand.votes || 0) > 0;

      const item = document.createElement('div');
      item.className = 'p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm flex flex-col gap-3';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${cand.photo}" alt="${cand.name}" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-on-surface text-sm">${cand.name}</span>
                ${isLeader ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">trophy</span> Leader</span>' : ''}
              </div>
              <span class="text-xs text-slate-500">${cand.party}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="font-bold text-on-surface text-sm">${(cand.votes || 0).toLocaleString()} votes</span>
            <span class="block text-xs font-semibold text-primary">${pct}%</span>
          </div>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div class="bg-primary h-full rounded-full transition-all duration-700" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  renderActivityFeed(activities) {
    const container = document.getElementById('admin-activity-feed-container');
    if (!container) return;

    container.innerHTML = '';
    activities.slice(0, 6).forEach(act => {
      const div = document.createElement('div');
      div.className = 'flex items-start gap-4';
      
      const dotColor = act.color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                       act.color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                       'bg-primary shadow-[0_0_8px_rgba(99,14,212,0.5)]';

      div.innerHTML = `
        <div class="w-2.5 h-2.5 mt-1.5 rounded-full ${dotColor} shrink-0"></div>
        <div class="flex-1">
          <p class="font-medium text-sm text-on-surface">${act.text}</p>
          <p class="text-xs text-slate-500 mt-0.5">${act.subtext}</p>
        </div>
        <span class="text-xs text-slate-400 whitespace-nowrap">${act.time}</span>
      `;
      container.appendChild(div);
    });
  }

  // ELECTIONS TAB
  renderElectionsList(elections) {
    const container = document.getElementById('admin-elections-table-body');
    if (!container) return;

    container.innerHTML = '';
    elections.forEach(elec => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 transition-colors';
      tr.innerHTML = `
        <td class="py-4 px-6 font-semibold text-on-surface text-sm">
          <div>${elec.title}</div>
          <div class="text-xs text-slate-400 font-normal">${elec.id}</div>
        </td>
        <td class="py-4 px-6 text-sm text-slate-600">${elec.category}</td>
        <td class="py-4 px-6 text-sm text-slate-600">${elec.candidates.length} Candidates</td>
        <td class="py-4 px-6 text-sm text-slate-600">${new Date(elec.startDate).toLocaleDateString()}</td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${elec.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
            ${elec.status}
          </span>
        </td>
        <td class="py-4 px-6 text-right">
          <button class="text-primary hover:text-primary-hover text-sm font-semibold p-1 hover:bg-primary/10 rounded" onclick="Admin.setActiveElection('${elec.id}')">
            ${elec.id === window.StateStore.getState().activeElectionId ? 'Active Selection' : 'Set Active'}
          </button>
        </td>
      `;
      container.appendChild(tr);
    });
  }

  setActiveElection(id) {
    window.StateStore.setActiveElection(id);
    window.App.showToast('Active election updated', 'success');
  }

  // VOTERS REGISTRY TAB
  renderVotersRegistry(voters) {
    const container = document.getElementById('admin-voters-table-body');
    const searchInput = document.getElementById('admin-voter-search-input');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (!container) return;

    const filtered = voters.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.voterId.toLowerCase().includes(query) ||
      v.constituency.toLowerCase().includes(query)
    );

    container.innerHTML = '';
    filtered.forEach(voter => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 transition-colors';
      tr.innerHTML = `
        <td class="py-4 px-6 font-mono font-bold text-primary text-sm">${voter.voterId}</td>
        <td class="py-4 px-6 font-medium text-on-surface text-sm">${voter.name}</td>
        <td class="py-4 px-6 text-sm text-slate-600">${voter.phone}</td>
        <td class="py-4 px-6 text-sm text-slate-600">${voter.constituency}</td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${voter.status === 'Voted' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}">
            ${voter.status}
          </span>
        </td>
        <td class="py-4 px-6 text-right font-mono text-xs text-slate-400">
          ${voter.transactionId || '—'}
        </td>
      `;
      container.appendChild(tr);
    });
  }

  // CANDIDATES TAB
  renderCandidatesManagement(elections) {
    const container = document.getElementById('admin-candidates-grid');
    if (!container) return;

    const activeElection = window.StateStore.getActiveElection();
    container.innerHTML = '';

    activeElection.candidates.forEach(cand => {
      const div = document.createElement('div');
      div.className = 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center';
      div.innerHTML = `
        <img src="${cand.photo}" alt="${cand.name}" class="w-20 h-20 rounded-full object-cover border-2 border-primary mb-3 shadow-sm" />
        <h4 class="font-bold text-on-surface text-base mb-0.5">${cand.name}</h4>
        <p class="text-xs font-semibold text-primary mb-2">${cand.party}</p>
        <p class="text-xs text-slate-500 mb-4">${cand.tagline || ''}</p>
        <div class="mt-auto w-full pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <span class="text-slate-500">Votes Recorded:</span>
          <span class="font-bold text-on-surface">${(cand.votes || 0).toLocaleString()}</span>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // AUDIT LEDGER BLOCKCHAIN EXPLORER TAB
  renderAuditLedger(ledger) {
    const container = document.getElementById('admin-ledger-blocks-container');
    if (!container) return;

    container.innerHTML = '';

    [...ledger].reverse().forEach(block => {
      const isGenesis = block.blockIndex === 0;
      const card = document.createElement('div');
      card.className = 'p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 transition-all hover:shadow-md';
      card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center font-mono font-bold text-primary text-sm">
              #${block.blockIndex}
            </span>
            <div>
              <span class="font-bold text-on-surface text-sm">${isGenesis ? 'Genesis Root Block' : 'Verified Cryptographic Vote Block'}</span>
              <span class="block text-xs text-slate-400">${new Date(block.timestamp).toUTCString()}</span>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">verified_user</span> SHA-256 Validated
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-hidden">
            <span class="text-slate-400 block mb-1">Transaction ID:</span>
            <span class="text-primary font-bold break-all">${block.txId}</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-hidden">
            <span class="text-slate-400 block mb-1">Ballot Hash:</span>
            <span class="text-slate-700 break-all">${block.ballotHash}</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-hidden md:col-span-2">
            <span class="text-slate-400 block mb-1">Current Block Hash:</span>
            <span class="text-slate-800 font-bold break-all">${block.blockHash}</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-hidden md:col-span-2">
            <span class="text-slate-400 block mb-1">Previous Block Hash:</span>
            <span class="text-slate-500 break-all">${block.previousBlockHash}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // QUICK ACTIONS MODALS
  openAddElectionModal() {
    const modal = document.getElementById('admin-modal-add-election');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeAddElectionModal() {
    const modal = document.getElementById('admin-modal-add-election');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  submitNewElection() {
    const title = document.getElementById('new-election-title').value.trim();
    const category = document.getElementById('new-election-category').value;
    const desc = document.getElementById('new-election-desc').value.trim();

    if (!title) {
      window.App.showToast('Please enter an election title', 'error');
      return;
    }

    window.StateStore.addElection({
      title,
      category,
      description: desc
    });

    window.SoundFX.playSuccess();
    window.App.showToast('New election created successfully!', 'success');
    this.closeAddElectionModal();
  }

  openAddCandidateModal() {
    const modal = document.getElementById('admin-modal-add-candidate');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeAddCandidateModal() {
    const modal = document.getElementById('admin-modal-add-candidate');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  submitNewCandidate() {
    const name = document.getElementById('new-candidate-name').value.trim();
    const party = document.getElementById('new-candidate-party').value.trim();
    const tagline = document.getElementById('new-candidate-tagline').value.trim();
    const photo = document.getElementById('new-candidate-photo').value.trim();

    if (!name || !party) {
      window.App.showToast('Candidate name and party are required', 'error');
      return;
    }

    const activeElection = window.StateStore.getActiveElection();
    window.StateStore.addCandidate(activeElection.id, {
      name,
      party,
      tagline,
      photo: photo || undefined
    });

    window.SoundFX.playSuccess();
    window.App.showToast('New candidate added to election!', 'success');
    this.closeAddCandidateModal();
  }

  openAddVoterModal() {
    const modal = document.getElementById('admin-modal-add-voter');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeAddVoterModal() {
    const modal = document.getElementById('admin-modal-add-voter');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  submitNewVoter() {
    const voterId = document.getElementById('new-voter-id').value.trim();
    const name = document.getElementById('new-voter-name').value.trim();
    const phone = document.getElementById('new-voter-phone').value.trim();
    const constituency = document.getElementById('new-voter-constituency').value.trim();

    if (!voterId || !name || !phone) {
      window.App.showToast('Voter ID, name, and phone are required', 'error');
      return;
    }

    try {
      window.StateStore.addVoter({
        voterId,
        name,
        phone,
        constituency
      });

      window.SoundFX.playSuccess();
      window.App.showToast(`Voter registered: ${voterId}`, 'success');
      this.closeAddVoterModal();
    } catch (err) {
      window.App.showToast(err.message, 'error');
    }
  }

  exportReport() {
    const state = window.StateStore.getState();
    const stats = window.StateStore.getStats();

    const report = {
      generatedAt: new Date().toISOString(),
      system: 'Vote-X Cryptographic Online Voting System',
      activeElection: stats.activeElection,
      statistics: stats,
      auditLedger: state.auditLedger
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VOTEX-AUDIT-REPORT-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    window.SoundFX.playSuccess();
    window.App.showToast('Audit report downloaded successfully', 'success');
  }
}

window.AdminController = AdminController;
