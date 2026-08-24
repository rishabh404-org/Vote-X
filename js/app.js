/**
 * Vote-X Main Application Controller
 * Handles top-level routing, modals, toasts, role navigation, and demo initialization.
 */

class VoteXApp {
  constructor() {
    this.currentView = 'landing'; // 'landing' | 'voting' | 'admin'
    this.init();
  }

  init() {
    // Instantiate sub-controllers
    window.VotingFlow = new window.VotingFlowController();
    window.Admin = new window.AdminController();

    // Setup global navigation
    this.setupNavigation();
    this.setupToastSystem();

    // Initialize 3D & WebGL Shaders
    setTimeout(() => {
      if (typeof window.initShaderBackground === 'function') {
        window.initShaderBackground('shader-canvas-ANIMATION_4');
      }
      if (typeof window.initThreeBackground === 'function') {
        window.initThreeBackground('threejs-container-ANIMATION_5');
      }
    }, 100);

    // Check hash for direct route
    this.handleRouteHash();
    window.addEventListener('hashchange', () => this.handleRouteHash());
  }

  handleRouteHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') {
      this.setView('admin');
    } else if (hash === 'vote') {
      this.startVotingFlow();
    } else {
      this.setView('landing');
    }
  }

  setupNavigation() {
    // Nav Links
    document.querySelectorAll('[data-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.getAttribute('data-route');
        if (route === 'vote') {
          this.startVotingFlow();
        } else if (route === 'admin') {
          this.setView('admin');
        } else {
          this.setView('landing');
        }
      });
    });
  }

  setView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName === 'landing' ? '' : viewName;

    const landingView = document.getElementById('view-landing');
    const votingView = document.getElementById('view-voting');
    const adminView = document.getElementById('view-admin');
    const mainNav = document.getElementById('main-top-nav');

    if (viewName === 'landing') {
      if (landingView) landingView.classList.remove('hidden');
      if (votingView) votingView.classList.add('hidden');
      if (adminView) adminView.classList.add('hidden');
      if (mainNav) mainNav.classList.remove('hidden');
    } else if (viewName === 'voting') {
      if (landingView) landingView.classList.add('hidden');
      if (votingView) votingView.classList.remove('hidden');
      if (adminView) adminView.classList.add('hidden');
      if (mainNav) mainNav.classList.remove('hidden');
    } else if (viewName === 'admin') {
      if (landingView) landingView.classList.add('hidden');
      if (votingView) votingView.classList.add('hidden');
      if (adminView) adminView.classList.remove('hidden');
      if (mainNav) mainNav.classList.add('hidden'); // Admin has its own sidebar & top bar
      window.Admin.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startVotingFlow(demoVoterId = null) {
    this.setView('voting');
    window.VotingFlow.resetSession();

    if (demoVoterId) {
      const input = document.getElementById('voter-id-input');
      if (input) input.value = demoVoterId;
      window.VotingFlow.submitIdentity();
    }
  }

  fillDemoVoter(voterId = 'VTX-8921') {
    const input = document.getElementById('voter-id-input');
    if (input) {
      input.value = voterId;
      window.SoundFX.playClick();
      this.showToast(`Loaded Demo Voter: ${voterId}`, 'info');
    }
  }

  toggleSound() {
    window.SoundFX.enabled = !window.SoundFX.enabled;
    const soundIcons = document.querySelectorAll('.sound-toggle-icon');
    soundIcons.forEach(icon => {
      icon.textContent = window.SoundFX.enabled ? 'volume_up' : 'volume_off';
    });
    this.showToast(`Audio Feedback: ${window.SoundFX.enabled ? 'Enabled' : 'Disabled'}`, 'info');
    if (window.SoundFX.enabled) window.SoundFX.playClick();
  }

  resetAllData() {
    if (confirm('Reset all election data, registered voters, and ledger back to defaults?')) {
      window.StateStore.resetToDefault();
      this.showToast('System data reset to initial demo state', 'success');
      this.setView('landing');
    }
  }

  // GLOBAL TOAST NOTIFICATION SYSTEM
  setupToastSystem() {
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none';
      document.body.appendChild(this.toastContainer);
    }
  }

  showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto transform translate-y-2 opacity-0 transition-all duration-300 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium';

    let bg = 'bg-slate-900 text-white border-slate-700';
    let icon = 'info';

    if (type === 'success') {
      bg = 'bg-emerald-900 text-emerald-50 border-emerald-700';
      icon = 'check_circle';
    } else if (type === 'error') {
      bg = 'bg-red-900 text-red-50 border-red-700';
      icon = 'error';
    } else if (type === 'warning') {
      bg = 'bg-amber-900 text-amber-50 border-amber-700';
      icon = 'warning';
    } else if (type === 'info') {
      bg = 'bg-primary text-white border-purple-400/40';
      icon = 'notifications';
    }

    toast.className += ` ${bg}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px] shrink-0" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      <span class="flex-1">${message}</span>
      <button class="text-white/60 hover:text-white shrink-0 ml-1" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    this.toastContainer.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App = new VoteXApp();
});
