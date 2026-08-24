/**
 * Vote-X Voting Flow Controller
 * Manages the linear 5-step transactional voting process:
 * Step 1: Identity (Voter ID Verification)
 * Step 2: 6-Digit OTP Verification
 * Step 3: Biometric Fingerprint Authentication
 * Step 4: Choose Candidate
 * Step 5: Review & Cryptographic Confirmation
 * Step 6: Confirmation & Digital Receipt
 */

class VotingFlowController {
  constructor() {
    this.currentStep = 1;
    this.currentVoter = null;
    this.currentElection = null;
    this.selectedCandidate = null;
    this.generatedOtp = '849201';
    this.otpTimerInterval = null;
    this.otpSecondsLeft = 30;
    this.latestReceipt = null;

    this.init();
  }

  init() {
    this.setupOtpListeners();
    this.setupBiometricListeners();
    this.setupConfetti();
  }

  resetSession() {
    this.currentStep = 1;
    this.currentVoter = null;
    this.selectedCandidate = null;
    this.latestReceipt = null;
    if (this.otpTimerInterval) clearInterval(this.otpTimerInterval);
    
    // Clear inputs
    const voterIdInput = document.getElementById('voter-id-input');
    if (voterIdInput) voterIdInput.value = '';
    
    document.querySelectorAll('.otp-input').forEach(inp => inp.value = '');
    
    this.showStep(1);
  }

  showStep(stepNumber) {
    this.currentStep = stepNumber;
    
    // Hide all step sections
    for (let i = 1; i <= 6; i++) {
      const stepEl = document.getElementById(`voting-step-${i}`);
      if (stepEl) {
        if (i === stepNumber) {
          stepEl.classList.remove('hidden');
          stepEl.classList.add('flex');
        } else {
          stepEl.classList.add('hidden');
          stepEl.classList.remove('flex');
        }
      }
    }

    // Scroll to top of voting view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Step-specific initializations
    if (stepNumber === 2) {
      this.initStep2Otp();
    } else if (stepNumber === 4) {
      this.renderCandidateCards();
    } else if (stepNumber === 5) {
      this.renderReviewSummary();
    } else if (stepNumber === 6) {
      this.renderConfirmation();
    }
  }

  // STEP 1: IDENTITY VERIFICATION
  submitIdentity() {
    const input = document.getElementById('voter-id-input');
    if (!input) return;

    const voterId = input.value.trim().toUpperCase();
    if (!voterId) {
      window.App.showToast('Please enter your Voter ID (e.g., VTX-8921)', 'error');
      input.focus();
      return;
    }

    const voter = window.StateStore.getVoter(voterId);
    if (!voter) {
      window.App.showToast(`No voter found with ID "${voterId}". Try demo ID VTX-8921.`, 'error');
      return;
    }

    if (voter.status === 'Voted') {
      window.App.showToast(`Voter ${voter.name} (${voter.voterId}) has ALREADY voted in this election!`, 'warning');
      return;
    }

    this.currentVoter = voter;
    this.currentElection = window.StateStore.getActiveElection();
    
    window.SoundFX.playSuccess();
    window.App.showToast(`Identity verified: ${voter.name}`, 'success');

    // Proceed to Step 2
    this.showStep(2);
  }

  // STEP 2: OTP VERIFICATION
  initStep2Otp() {
    const maskedPhoneEl = document.getElementById('otp-masked-phone');
    if (maskedPhoneEl && this.currentVoter) {
      maskedPhoneEl.textContent = this.currentVoter.maskedPhone || '+91 98******42';
    }

    // Generate simulated OTP
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Show user a helpful toast with demo OTP
    setTimeout(() => {
      window.App.showToast(`Demo SMS Received: Your Vote-X OTP is ${this.generatedOtp}`, 'info', 6000);
    }, 600);

    // Auto focus first OTP input
    const firstInput = document.querySelector('.otp-input');
    if (firstInput) {
      firstInput.focus();
      firstInput.value = '';
    }

    this.startOtpTimer();
  }

  startOtpTimer() {
    if (this.otpTimerInterval) clearInterval(this.otpTimerInterval);
    this.otpSecondsLeft = 30;
    
    const timerText = document.getElementById('otp-timer-text');
    const resendBtn = document.getElementById('otp-resend-btn');
    
    if (timerText) timerText.textContent = `Resend OTP in 00:${this.otpSecondsLeft.toString().padStart(2, '0')}`;
    if (resendBtn) resendBtn.classList.add('pointer-events-none', 'opacity-50');

    this.otpTimerInterval = setInterval(() => {
      this.otpSecondsLeft--;
      if (this.otpSecondsLeft <= 0) {
        clearInterval(this.otpTimerInterval);
        if (timerText) timerText.textContent = 'You can now resend OTP';
        if (resendBtn) resendBtn.classList.remove('pointer-events-none', 'opacity-50');
      } else {
        if (timerText) {
          timerText.textContent = `Resend OTP in 00:${this.otpSecondsLeft.toString().padStart(2, '0')}`;
        }
      }
    }, 1000);
  }

  resendOtp() {
    if (this.otpSecondsLeft > 0) return;
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    window.SoundFX.playClick();
    window.App.showToast(`New OTP Sent: ${this.generatedOtp}`, 'info', 5000);
    this.startOtpTimer();
  }

  setupOtpListeners() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        window.SoundFX.playClick();
        if (e.target.value.length > 1) {
          e.target.value = e.target.value.slice(-1);
        }
        if (e.target.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        } else if (e.key === 'Enter') {
          this.verifyOtp();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\d{6}$/.test(pasted)) {
          inputs.forEach((inp, i) => {
            inp.value = pasted[i] || '';
          });
          inputs[5].focus();
          window.SoundFX.playSuccess();
        }
      });
    });
  }

  verifyOtp() {
    const inputs = document.querySelectorAll('.otp-input');
    let entered = '';
    inputs.forEach(inp => entered += inp.value);

    if (entered.length < 6) {
      window.App.showToast('Please enter all 6 digits of the OTP', 'error');
      return;
    }

    // In demo mode accept either the generated OTP or '123456' / exact match
    if (entered === this.generatedOtp || entered === '123456') {
      window.SoundFX.playSuccess();
      window.App.showToast('OTP verified successfully!', 'success');
      this.showStep(3);
    } else {
      window.App.showToast(`Invalid OTP. Please check your SMS or enter ${this.generatedOtp}`, 'error');
    }
  }

  // STEP 3: BIOMETRIC AUTHENTICATION
  setupBiometricListeners() {
    const startBtn = document.getElementById('start-scan-btn');
    const scanLine = document.getElementById('biometric-scan-line');
    const scannerArea = document.getElementById('biometric-scanner-area');

    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
      if (startBtn.getAttribute('data-scanning') === 'true') return;

      startBtn.setAttribute('data-scanning', 'true');
      startBtn.innerHTML = `
        <span class="inline-block animate-spin material-symbols-outlined text-[20px] mr-2">progress_activity</span>
        Scanning Fingerprint...
      `;
      startBtn.classList.add('opacity-90');

      if (scanLine) {
        scanLine.classList.remove('hidden');
        scanLine.classList.add('scanning-line');
      }

      window.SoundFX.playScanLaser();

      setTimeout(() => {
        if (scanLine) {
          scanLine.classList.add('hidden');
          scanLine.classList.remove('scanning-line');
        }

        startBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px] mr-2">check_circle</span>
          Biometrics Verified
        `;
        startBtn.classList.remove('bg-primary', 'opacity-90');
        startBtn.classList.add('bg-emerald-600', 'text-white');

        window.SoundFX.playSuccess();
        window.App.showToast('Biometric fingerprint match confirmed (Match Confidence: 99.8%)', 'success');

        setTimeout(() => {
          startBtn.removeAttribute('data-scanning');
          startBtn.className = 'w-full bg-primary text-white font-semibold py-4 rounded-xl shadow-md hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 group mb-6';
          startBtn.innerHTML = 'Start Scanning';
          this.showStep(4);
        }, 900);
      }, 2200);
    });
  }

  // STEP 4: CANDIDATE SELECTION
  renderCandidateCards() {
    const election = this.currentElection || window.StateStore.getActiveElection();
    const container = document.getElementById('candidates-grid-container');
    const electionTitleEl = document.getElementById('voting-election-title');

    if (electionTitleEl) {
      electionTitleEl.textContent = election.title;
    }

    if (!container) return;

    container.innerHTML = '';

    election.candidates.forEach((cand, idx) => {
      const isSelected = this.selectedCandidate && this.selectedCandidate.id === cand.id;
      const card = document.createElement('label');
      card.className = 'cursor-pointer group relative block h-full select-none';
      card.innerHTML = `
        <input type="radio" name="candidate_vote" value="${cand.id}" class="peer sr-only candidate-radio" ${isSelected ? 'checked' : ''} />
        <div class="candidate-card h-full flex flex-col items-center text-center p-6 bg-white rounded-2xl border-2 border-slate-200 transition-all duration-200 hover:shadow-lg">
          <div class="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md relative candidate-img-ring">
            <img src="${cand.photo}" alt="${cand.name}" class="w-full h-full object-cover" />
            <div class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">${cand.icon || 'star'}</span>
            </div>
          </div>
          
          <h3 class="font-bold text-lg text-on-surface mb-1">${cand.name}</h3>
          <p class="text-sm font-medium text-primary mb-2">${cand.party}</p>
          <p class="text-xs text-slate-500 line-clamp-2 mb-6">${cand.tagline || ''}</p>
          
          <div class="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100 w-full justify-center">
            <div class="w-6 h-6 rounded-full border-2 border-slate-300 candidate-radio-indicator flex items-center justify-center transition-all">
              <div class="w-2.5 h-2.5 rounded-full bg-white opacity-0 candidate-radio-dot transition-opacity"></div>
            </div>
            <span class="text-xs font-semibold text-slate-600">Select</span>
          </div>
        </div>
      `;

      card.querySelector('input').addEventListener('change', () => {
        window.SoundFX.playClick();
        this.selectedCandidate = cand;
      });

      container.appendChild(card);
    });
  }

  submitCandidateSelection() {
    const selectedInput = document.querySelector('input[name="candidate_vote"]:checked');
    if (!selectedInput) {
      window.App.showToast('Please select a candidate to continue', 'warning');
      return;
    }

    const election = this.currentElection || window.StateStore.getActiveElection();
    this.selectedCandidate = election.candidates.find(c => c.id === selectedInput.value);

    window.SoundFX.playClick();
    this.showStep(5);
  }

  // STEP 5: REVIEW VOTE
  renderReviewSummary() {
    if (!this.selectedCandidate) {
      this.showStep(4);
      return;
    }

    const nameEl = document.getElementById('review-candidate-name');
    const partyEl = document.getElementById('review-candidate-party');
    const photoEl = document.getElementById('review-candidate-photo');
    const iconEl = document.getElementById('review-candidate-icon');
    const constituencyEl = document.getElementById('review-voter-constituency');

    if (nameEl) nameEl.textContent = this.selectedCandidate.name;
    if (partyEl) partyEl.textContent = this.selectedCandidate.party;
    if (photoEl) photoEl.src = this.selectedCandidate.photo;
    if (iconEl) iconEl.textContent = this.selectedCandidate.icon || 'star';
    if (constituencyEl && this.currentVoter) {
      constituencyEl.textContent = this.currentVoter.constituency || 'National Electorate';
    }
  }

  async confirmVote() {
    if (!this.currentVoter || !this.selectedCandidate) {
      window.App.showToast('Session expired. Please restart the voting process.', 'error');
      this.resetSession();
      return;
    }

    const election = this.currentElection || window.StateStore.getActiveElection();
    const confirmBtn = document.getElementById('confirm-vote-btn');

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <span class="inline-block animate-spin material-symbols-outlined text-[20px] mr-2">lock</span>
        Encrypting & Casting Ballot...
      `;
    }

    try {
      // Record vote into state and blockchain ledger
      const sealed = await window.StateStore.recordVote(
        this.currentVoter.voterId,
        election.id,
        this.selectedCandidate.id
      );

      this.latestReceipt = sealed;

      window.SoundFX.playVoteCastChime();
      this.showStep(6);
    } catch (err) {
      window.App.showToast(err.message || 'Failed to submit vote', 'error');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
          Confirm Vote
          <span class="material-symbols-outlined">arrow_forward</span>
        `;
      }
    }
  }

  // STEP 6: CONFIRMATION & RECEIPT
  renderConfirmation() {
    if (!this.latestReceipt) return;

    const txIdEl = document.getElementById('confirmation-tx-id');
    const timestampEl = document.getElementById('confirmation-timestamp');
    const blockHashEl = document.getElementById('confirmation-block-hash');

    if (txIdEl) txIdEl.textContent = this.latestReceipt.txId;
    if (timestampEl) timestampEl.textContent = new Date(this.latestReceipt.timestamp).toLocaleString();
    if (blockHashEl) blockHashEl.textContent = this.latestReceipt.blockHash.slice(0, 24) + '...';

    // Trigger celebration confetti
    this.launchConfetti();
  }

  copyTransactionId() {
    if (!this.latestReceipt) return;
    navigator.clipboard.writeText(this.latestReceipt.txId).then(() => {
      window.SoundFX.playClick();
      window.App.showToast('Transaction ID copied to clipboard!', 'success');
    });
  }

  openReceiptModal() {
    if (!this.latestReceipt || !this.currentVoter || !this.selectedCandidate) return;

    const modal = document.getElementById('receipt-modal');
    if (!modal) return;

    document.getElementById('receipt-modal-voter-name').textContent = this.currentVoter.name;
    document.getElementById('receipt-modal-voter-id').textContent = this.currentVoter.voterId;
    document.getElementById('receipt-modal-constituency').textContent = this.currentVoter.constituency;
    document.getElementById('receipt-modal-tx-id').textContent = this.latestReceipt.txId;
    document.getElementById('receipt-modal-candidate').textContent = `${this.selectedCandidate.name} (${this.selectedCandidate.party})`;
    document.getElementById('receipt-modal-ballot-hash').textContent = this.latestReceipt.ballotHash;
    document.getElementById('receipt-modal-block-hash').textContent = this.latestReceipt.blockHash;
    document.getElementById('receipt-modal-date').textContent = new Date(this.latestReceipt.timestamp).toUTCString();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  printReceipt() {
    window.print();
  }

  setupConfetti() {
    this.confettiCanvas = document.getElementById('confetti-canvas');
  }

  launchConfetti() {
    const container = document.getElementById('confetti-canvas');
    if (!container) return;

    container.innerHTML = '';
    const colors = ['#7c3aed', '#630ed4', '#d2bbff', '#eaddff', '#10B981', '#3B82F6', '#F59E0B'];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animDuration = Math.random() * 2.5 + 2;
      const delay = Math.random() * 1.5;

      confetti.style.left = `${left}%`;
      confetti.style.top = `-10%`;
      confetti.style.backgroundColor = color;

      if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
      }

      container.appendChild(confetti);

      confetti.animate([
        { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate3d(${Math.random() * 200 - 100}px, ${window.innerHeight * 0.9}px, 0) rotate(${Math.random() * 720}deg)`,
          opacity: 0
        }
      ], {
        duration: animDuration * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(.25, .8, .25, 1)',
        fill: 'forwards'
      });
    }
  }
}

window.VotingFlowController = VotingFlowController;
