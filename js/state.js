/**
 * Vote-X Central State & Storage Management
 * Handles persistent state in localStorage with reactive event dispatching.
 */

const STORAGE_KEY = 'votex_app_state_v1';

const DEFAULT_STATE = {
  activeElectionId: 'ELEC-2024-NAT',
  elections: [
    {
      id: 'ELEC-2024-NAT',
      title: 'National General Election 2024',
      description: 'Federal Presidential & Parliamentary Executive Mandate',
      category: 'Federal',
      startDate: '2024-05-15T08:00:00Z',
      endDate: '2024-05-25T20:00:00Z',
      status: 'Active',
      totalRegisteredVoters: 12546,
      candidates: [
        {
          id: 'CAND-1',
          name: 'Arjun Sharma',
          party: 'Progressive Party',
          icon: 'park',
          color: '#10B981',
          tagline: 'Sustainable Future, Digital Innovation & Universal Healthcare',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          votes: 3840
        },
        {
          id: 'CAND-2',
          name: 'Vikram Singh',
          party: 'Unity Front',
          icon: 'shield',
          color: '#3B82F6',
          tagline: 'Economic Resilience, National Security & Infrastructure Expansion',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          votes: 2980
        },
        {
          id: 'CAND-3',
          name: 'Rohan Verma',
          party: "People's Alliance",
          icon: 'flare',
          color: '#F59E0B',
          tagline: 'Empowering Communities, Fair Wages & Accessible Education',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
          votes: 1912
        }
      ]
    },
    {
      id: 'ELEC-2024-LOCAL',
      title: 'Metropolitan City Council 2024',
      description: 'Civic governance, zoning, public transit, and municipal budget',
      category: 'Municipal',
      startDate: '2024-05-18T09:00:00Z',
      endDate: '2024-05-28T18:00:00Z',
      status: 'Active',
      totalRegisteredVoters: 8420,
      candidates: [
        {
          id: 'CAND-L1',
          name: 'Dr. Priya Patel',
          party: 'Civic Action Coalition',
          icon: 'location_city',
          color: '#8B5CF6',
          tagline: 'Clean Transit, Modern Schools & Smart Urban Planning',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          votes: 4210
        },
        {
          id: 'CAND-L2',
          name: 'Kabir Mehta',
          party: 'Urban Reformists',
          icon: 'handshake',
          color: '#EC4899',
          tagline: 'Affordable Housing, Green Spaces & Small Business Grants',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
          votes: 3105
        }
      ]
    }
  ],
  voters: [
    {
      voterId: 'VTX-8921',
      name: 'Rahul Sharma',
      dob: '1992-06-14',
      phone: '+91 98765 43242',
      maskedPhone: '+91 98******42',
      constituency: 'District 4 - Metro Central',
      nationalId: 'IND-8842-9901',
      status: 'Eligible', // 'Eligible' | 'Voted'
      votedAt: null,
      transactionId: null
    },
    {
      voterId: 'VTX-5102',
      name: 'Aarav Patel',
      dob: '1988-11-23',
      phone: '+91 98123 45678',
      maskedPhone: '+91 98******78',
      constituency: 'District 2 - North Ridge',
      nationalId: 'IND-3391-2210',
      status: 'Eligible',
      votedAt: null,
      transactionId: null
    },
    {
      voterId: 'VTX-7744',
      name: 'Sunita Roy',
      dob: '1995-03-09',
      phone: '+91 97555 12390',
      maskedPhone: '+91 97******90',
      constituency: 'District 4 - Metro Central',
      nationalId: 'IND-6712-4456',
      status: 'Eligible',
      votedAt: null,
      transactionId: null
    },
    {
      voterId: 'VTX-1039',
      name: 'Devraj Singh',
      dob: '1984-08-30',
      phone: '+91 99887 76655',
      maskedPhone: '+91 99******55',
      constituency: 'District 1 - South Bay',
      nationalId: 'IND-9011-8843',
      status: 'Voted',
      votedAt: '2024-05-19T14:32:10Z',
      transactionId: 'VX2024-05-19-4A9B11'
    }
  ],
  auditLedger: [
    {
      blockIndex: 0,
      timestamp: '2024-05-15T08:00:00Z',
      txId: 'GENESIS-BLOCK-0000',
      electionId: 'ELEC-2024-NAT',
      candidateName: 'GENESIS VOTEX ROOT',
      ballotHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      blockHash: '000000008f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2',
      previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000'
    },
    {
      blockIndex: 1,
      timestamp: '2024-05-19T14:32:10Z',
      txId: 'VX2024-05-19-4A9B11',
      electionId: 'ELEC-2024-NAT',
      candidateName: 'Arjun Sharma',
      ballotHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      blockHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      previousBlockHash: '000000008f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2'
    }
  ],
  activities: [
    { text: 'New voter registered', subtext: 'ID: VTX-8921', time: '2 mins ago', type: 'voter', color: 'emerald' },
    { text: 'Vote cast successfully', subtext: 'District 4', time: '3 mins ago', type: 'vote', color: 'primary' },
    { text: 'New candidate added', subtext: 'Progressive Party', time: '15 mins ago', type: 'candidate', color: 'emerald' },
    { text: 'Election updated', subtext: 'Local Council 2024', time: '1 hour ago', type: 'election', color: 'amber' },
    { text: 'Results published', subtext: 'District 2 By-election', time: '2 hours ago', type: 'results', color: 'primary' }
  ]
};

class StateStore {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read localStorage, using default state', e);
    }
    this.saveState(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState(stateToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave || this.state));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.notify();
  }

  // Voter operations
  getVoter(voterId) {
    const cleanId = String(voterId).trim().toUpperCase();
    return this.state.voters.find(v => v.voterId.toUpperCase() === cleanId);
  }

  addVoter(voter) {
    const exists = this.getVoter(voter.voterId);
    if (exists) throw new Error(`Voter with ID ${voter.voterId} already exists`);
    
    const newVoter = {
      voterId: voter.voterId.toUpperCase(),
      name: voter.name,
      dob: voter.dob || '1995-01-01',
      phone: voter.phone,
      maskedPhone: voter.phone.replace(/(\+\d{2}\s?\d{2})\d{4}(\d{2})/, '$1******$2'),
      constituency: voter.constituency || 'General Ward',
      nationalId: voter.nationalId || 'NAT-0000-0000',
      status: 'Eligible',
      votedAt: null,
      transactionId: null
    };

    this.state.voters.unshift(newVoter);
    this.addActivity('New voter registered', `ID: ${newVoter.voterId}`, 'emerald');
    this.notify();
    return newVoter;
  }

  // Election operations
  getActiveElection() {
    return this.state.elections.find(e => e.id === this.state.activeElectionId) || this.state.elections[0];
  }

  setActiveElection(electionId) {
    this.state.activeElectionId = electionId;
    this.notify();
  }

  addElection(election) {
    const newElection = {
      id: `ELEC-${Date.now()}`,
      title: election.title,
      description: election.description || '',
      category: election.category || 'General',
      startDate: election.startDate || new Date().toISOString(),
      endDate: election.endDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'Active',
      totalRegisteredVoters: election.totalRegisteredVoters || 1000,
      candidates: []
    };
    this.state.elections.push(newElection);
    this.addActivity('New election created', newElection.title, 'amber');
    this.notify();
    return newElection;
  }

  addCandidate(electionId, candidate) {
    const election = this.state.elections.find(e => e.id === electionId);
    if (!election) throw new Error('Election not found');

    const newCandidate = {
      id: `CAND-${Date.now()}`,
      name: candidate.name,
      party: candidate.party,
      icon: candidate.icon || 'star',
      color: candidate.color || '#7C3AED',
      tagline: candidate.tagline || '',
      photo: candidate.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      votes: 0
    };

    election.candidates.push(newCandidate);
    this.addActivity('New candidate added', `${newCandidate.name} (${newCandidate.party})`, 'emerald');
    this.notify();
    return newCandidate;
  }

  // Vote Casting Operation
  async recordVote(voterId, electionId, candidateId) {
    const voter = this.getVoter(voterId);
    if (!voter) throw new Error('Voter record not found');
    if (voter.status === 'Voted') throw new Error('This voter has already submitted a ballot in this election.');

    const election = this.state.elections.find(e => e.id === electionId);
    if (!election) throw new Error('Election not found');

    const candidate = election.candidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found');

    // Get previous block hash
    const prevBlock = this.state.auditLedger[this.state.auditLedger.length - 1];
    const prevHash = prevBlock ? prevBlock.blockHash : '0000000000000000000000000000000000000000000000000000000000000000';

    // Seal ballot cryptographically
    const sealed = await window.CryptoService.sealBallot({
      electionId,
      candidateId,
      candidateName: candidate.name,
      voterHash: await window.CryptoService.sha256(voter.voterId + voter.nationalId),
    }, prevHash);

    // Update candidate votes
    candidate.votes = (candidate.votes || 0) + 1;

    // Update voter status
    voter.status = 'Voted';
    voter.votedAt = sealed.timestamp;
    voter.transactionId = sealed.txId;

    // Append to immutable audit ledger
    const blockIndex = this.state.auditLedger.length;
    this.state.auditLedger.push({
      blockIndex,
      timestamp: sealed.timestamp,
      txId: sealed.txId,
      electionId: sealed.electionId,
      candidateName: sealed.candidateName,
      ballotHash: sealed.ballotHash,
      blockHash: sealed.blockHash,
      previousBlockHash: sealed.previousBlockHash
    });

    // Add activity
    this.addActivity('Vote cast successfully', `${voter.constituency || 'District 4'} (Encrypted)`, 'primary');

    this.notify();
    return sealed;
  }

  addActivity(text, subtext, color = 'primary') {
    this.state.activities.unshift({
      text,
      subtext,
      time: 'Just now',
      color
    });
    if (this.state.activities.length > 20) {
      this.state.activities.pop();
    }
  }

  // Statistics Computations
  getStats() {
    const election = this.getActiveElection();
    const totalVoters = this.state.voters.length;
    const votesCast = election.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const turnoutPct = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : '0.0';
    const activeElectionsCount = this.state.elections.filter(e => e.status === 'Active').length;

    return {
      totalVoters,
      votesCast,
      turnoutPct,
      activeElectionsCount,
      activeElection: election
    };
  }
}

window.StateStore = new StateStore();
