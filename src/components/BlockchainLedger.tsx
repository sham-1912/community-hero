import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Edit3, RefreshCw, Lock } from 'lucide-react';
import { calculateBlockHash, validateChain } from '../utils/blockchain';
import type { Block } from '../utils/blockchain';

interface BlockchainLedgerProps {
  blockchain: Block[];
  onTamperBlock: (index: number, newTitle: string) => void;
  onRestoreChain: () => void;
}

export const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({
  blockchain,
  onTamperBlock,
  onRestoreChain,
}) => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [tamperIndex, setTamperIndex] = useState<number | null>(null);
  const [tamperValue, setTamperValue] = useState('');

  const handleVerifyLedger = () => {
    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const result = validateChain(blockchain);
      setVerificationResult(result);
      setVerifying(false);
    }, 1000);
  };

  const handleTamperSubmit = (idx: number) => {
    if (!tamperValue.trim()) return;
    onTamperBlock(idx, tamperValue);
    setTamperIndex(null);
    setTamperValue('');
    // Automatically re-verify to show it broken
    const result = validateChain(blockchain);
    setVerificationResult(result);
  };

  const getVerificationStatus = () => {
    if (verifying) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <RefreshCw size={16} className="cat-pothole" style={{ animation: 'spin 2s infinite linear' }} />
          <span>Executing cryptographic sha256 checksums...</span>
        </div>
      );
    }

    if (verificationResult === null) {
      // Check if chain is already broken in silent check
      const silentCheck = validateChain(blockchain);
      if (!silentCheck.isValid) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--rose)', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
            <ShieldAlert size={20} />
            <div>
              <strong>LEDGER INTEGRITY BREACHED:</strong> Silent verification detected block tampering!
              <button onClick={onRestoreChain} className="btn btn-secondary" style={{ marginLeft: '12px', padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)' }}>
                Restore Ledger Integrity
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Ledger contains <strong>{blockchain.length} blocks</strong> secured with SHA-256 links.
          </span>
          <button onClick={handleVerifyLedger} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} /> Run Ledger Integrity Check
          </button>
        </div>
      );
    }

    if (verificationResult.isValid) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--emerald)',
          width: '100%'
        }}>
          <ShieldCheck size={24} />
          <div>
            <strong>Verification Result: PASS (0 Anomalies)</strong>
            <p style={{ fontSize: '0.8rem', color: 'rgba(16, 185, 129, 0.85)', margin: 0 }}>
              All block hashes correspond to their dataset payloads. Previous-hash pointers are perfectly linear.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'start',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--rose)',
          width: '100%'
        }}>
          <ShieldAlert size={24} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Verification Result: FAIL (Security Breach Detected)</strong>
            <p style={{ fontSize: '0.8rem', color: '#FCA5A5', margin: '4px 0 10px 0' }}>
              Block #{verificationResult.errorIndex} has been modified. The calculated hash does not match the stored block signature.
            </p>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', overflowX: 'auto', marginBottom: '10px' }}>
              <div>Stored Hash: <span style={{ color: 'var(--rose)' }}>{verificationResult.actualHash}</span></div>
              <div>Expected: <span style={{ color: 'var(--emerald)' }}>{verificationResult.expectedHash}</span></div>
            </div>
            <button onClick={onRestoreChain} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <RefreshCw size={12} /> Re-Sync & Repair Chain State
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Ledger Header Status Panel */}
      <div className="glass-card p-4 mb-6 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {getVerificationStatus()}
      </div>

      {/* Render Blocks Chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {blockchain.map((block, idx) => {
          // Perform a local fast-check on this block specifically
          const blockWithoutHash = {
            index: block.index,
            timestamp: block.timestamp,
            data: block.data,
            previousHash: block.previousHash,
            nonce: block.nonce
          };
          const computedHash = calculateBlockHash(blockWithoutHash);
          const isTampered = block.hash !== computedHash;
          
          // Check link breakage
          let isLinkBroken = false;
          if (idx > 0) {
            const prevBlock = blockchain[idx - 1];
            if (block.previousHash !== prevBlock.hash) {
              isLinkBroken = true;
            }
          }

          return (
            <div key={block.index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Connector Link */}
              {idx > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  margin: '-12px 0',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: isLinkBroken ? 'linear-gradient(var(--rose), var(--rose))' : 'linear-gradient(var(--emerald), var(--primary))',
                    boxShadow: isLinkBroken ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
                  }} />
                  <div style={{
                    background: isLinkBroken ? 'rgba(239,68,68,0.2)' : 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: isLinkBroken ? 'var(--rose)' : 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isLinkBroken ? '#FFA1A1' : 'var(--text-secondary)'
                  }}>
                    {isLinkBroken ? 'BROKEN LINK' : `PREV_HASH MATCH`}
                  </div>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: isLinkBroken ? 'linear-gradient(var(--rose), var(--rose))' : 'linear-gradient(var(--primary), var(--emerald))',
                    boxShadow: isLinkBroken ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
                  }} />
                </div>
              )}

              {/* Block card */}
              <div
                className="glass-card"
                style={{
                  width: '100%',
                  padding: '20px',
                  borderWidth: isTampered || isLinkBroken ? '2px' : '1px',
                  borderColor: isTampered || isLinkBroken ? 'var(--rose)' : 'var(--border)',
                  background: isTampered ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-card)',
                  boxShadow: isTampered ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={14} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      BLOCK #{block.index} {block.index === 0 && '(GENESIS)'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Timestamp: {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Content Payload preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {block.data.title}
                    </strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {block.data.description}
                    </p>
                  </div>
                  
                  {/* Meta tag displays */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Category:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{block.data.category}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Status Log:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{block.data.status}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Signee Hash:</span>{' '}
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{block.data.reporterHash}</span>
                    </div>
                  </div>
                </div>

                {/* Hashes Section */}
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', gap: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>PREVIOUS HASH:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{block.previousHash}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', gap: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>BLOCK HASH:</span>
                    <span style={{ color: isTampered ? 'var(--rose)' : 'var(--emerald)', fontWeight: 700 }}>
                      {block.hash} {isTampered && '(TAMPERED!)'}
                    </span>
                  </div>
                </div>

                {/* Edit block data simulator (Genesis Block cannot be tempered) */}
                {block.index !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    {tamperIndex === block.index ? (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input
                          type="text"
                          value={tamperValue}
                          onChange={(e) => setTamperValue(e.target.value)}
                          placeholder="Change Title to simulate tampering"
                          className="form-input"
                          style={{ flex: 1, padding: '4px 10px', fontSize: '0.8rem' }}
                        />
                        <button
                          onClick={() => handleTamperSubmit(block.index)}
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          Corrupt Data
                        </button>
                        <button
                          onClick={() => setTamperIndex(null)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setTamperIndex(block.index); setTamperValue(block.data.title); }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.05)' }}
                      >
                        <Edit3 size={12} /> Inject Tamper Simulation
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
