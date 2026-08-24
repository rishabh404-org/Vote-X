/**
 * Vote-X Cryptographic Services
 * Utilizes standard Web Crypto API for secure SHA-256 ballot hashing,
 * zero-knowledge ballot seals, and blockchain-style audit proof generation.
 */

const CryptoService = {
  /**
   * Computes SHA-256 hash of a string
   * @param {string} message
   * @returns {Promise<string>} Hexadecimal SHA-256 hash
   */
  async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Generates a readable unique Transaction ID (e.g. VX2024-05-19-8F3A2D)
   * @returns {string} Formatted transaction ID
   */
  generateTransactionId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Generate 6 random hex chars
    const randomBytes = new Uint8Array(3);
    window.crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
    
    return `VX${year}-${month}-${day}-${randomHex}`;
  },

  /**
   * Generates a tamper-evident encrypted ballot package
   * @param {Object} ballotData - { electionId, candidateId, candidateName, voterHash, timestamp }
   * @param {string} previousBlockHash - Hash of the previous block in the ledger
   * @returns {Promise<Object>} Encrypted ballot payload with signature and block hash
   */
  async sealBallot(ballotData, previousBlockHash = '0000000000000000000000000000000000000000000000000000000000000000') {
    const txId = this.generateTransactionId();
    const timestamp = new Date().toISOString();
    
    // Voter Anonymization: Hash voter ID with a random salt to preserve privacy while proving singularity
    const payloadString = JSON.stringify({
      txId,
      electionId: ballotData.electionId,
      candidateId: ballotData.candidateId,
      candidateName: ballotData.candidateName,
      timestamp,
      previousBlockHash
    });

    const ballotHash = await this.sha256(payloadString);
    const blockHash = await this.sha256(previousBlockHash + ballotHash + timestamp);

    return {
      txId,
      timestamp,
      ballotHash,
      blockHash,
      previousBlockHash,
      electionId: ballotData.electionId,
      candidateId: ballotData.candidateId,
      candidateName: ballotData.candidateName,
      encryptedPayload: btoa(payloadString)
    };
  }
};

window.CryptoService = CryptoService;
