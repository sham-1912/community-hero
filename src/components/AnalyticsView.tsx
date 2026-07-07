import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, CloudRain, BrainCircuit, Activity, CheckSquare, Brain, Sliders, Database, Play } from 'lucide-react';
import { resolutionTimeData } from '../utils/mockData';
import type { Issue } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface AnalyticsViewProps {
  issues: Issue[];
  onAddNotification: (text: string) => void;
}

interface TrainingSample {
  id: string;
  source: 'User Report' | 'Public Dataset';
  category: string;
  mediaSrc: string;
  title: string;
  status: 'Ready' | 'Trained';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  issues,
  onAddNotification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forecasts' | 'trainer'>('forecasts');
  const [rainfallValue, setRainfallValue] = useState<number>(180);

  // AI Trainer States
  const [epochs, setEpochs] = useState<number>(10);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [training, setTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState<number>(85.4);
  const [loss, setLoss] = useState<number>(0.54);
  
  // Custom training curves data for SVG graph
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [accHistory, setAccHistory] = useState<number[]>([]);

  // Dataset states (combining public seed images and user-uploaded complaints)
  const [dataset, setDataset] = useState<TrainingSample[]>([]);

  // Seeding initial dataset: public images + any citizen reports with custom uploads
  useEffect(() => {
    // 1. Seed public dataset images (e.g. from Kaggle/COCO)
    const publicSeeds: TrainingSample[] = [
      {
        id: 'public-1',
        source: 'Public Dataset',
        category: 'Pothole',
        mediaSrc: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=300&auto=format&fit=crop&q=60',
        title: 'COCO-Asphalt Pothole #882',
        status: 'Ready'
      },
      {
        id: 'public-2',
        source: 'Public Dataset',
        category: 'Waste Management',
        mediaSrc: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&auto=format&fit=crop&q=60',
        title: 'Roboflow-SolidDebris #14',
        status: 'Ready'
      },
      {
        id: 'public-3',
        source: 'Public Dataset',
        category: 'Water Leakage',
        mediaSrc: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=60',
        title: 'Kaggle-SubSurfaceBurst #102',
        status: 'Ready'
      },
      {
        id: 'public-4',
        source: 'Public Dataset',
        category: 'Streetlight Failure',
        mediaSrc: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?w=300&auto=format&fit=crop&q=60',
        title: 'OpenImages-DarkFixture #55',
        status: 'Ready'
      }
    ];

    // 2. Load custom user images from active complaints list
    const userUploaded: TrainingSample[] = issues
      .filter(issue => issue.mediaCID) // must have a media attachment
      .map(issue => ({
        id: `user-${issue.id}`,
        source: 'User Report',
        category: issue.category,
        mediaSrc: issue.mediaCID || '',
        title: `Citizen Upload: ${issue.title.substring(0, 20)}...`,
        status: 'Ready'
      }));

    // Combine them
    setDataset([...userUploaded, ...publicSeeds]);
  }, [issues]);

  // Dynamic calculations based on slider (Monsoon Predictive Model)
  const getMonsoonPrediction = (rain: number) => {
    if (rain <= 50) return { potholes: 15, confidence: 95, level: 'Low' };
    if (rain <= 100) return { potholes: 28, confidence: 92, level: 'Medium' };
    if (rain <= 180) return { potholes: 45, confidence: 89, level: 'High' };
    if (rain <= 250) return { potholes: 72, confidence: 84, level: 'High' };
    return { potholes: 105, confidence: 78, level: 'Critical' };
  };

  const prediction = getMonsoonPrediction(rainfallValue);

  // Import online pre-labeled dataset simulator
  const handleImportPublicDataset = () => {
    const onlineImports: TrainingSample[] = [
      {
        id: `online-${Date.now()}-1`,
        source: 'Public Dataset',
        category: 'Pothole',
        mediaSrc: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=300&auto=format&fit=crop&q=60',
        title: 'COCO-Pavement Wear #301',
        status: 'Ready'
      },
      {
        id: `online-${Date.now()}-2`,
        source: 'Public Dataset',
        category: 'Waste Management',
        mediaSrc: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=60',
        title: 'Roboflow-PlasticWaste #88',
        status: 'Ready'
      },
      {
        id: `online-${Date.now()}-3`,
        source: 'Public Dataset',
        category: 'Pothole',
        mediaSrc: 'https://images.unsplash.com/photo-1621259182978-f09e5e2b07ae?w=300&auto=format&fit=crop&q=60',
        title: 'COCO-DeepCrater #1023',
        status: 'Ready'
      }
    ];

    setDataset(prev => [...onlineImports, ...prev]);
    onAddNotification('Fetched 3 pre-labeled pothole/waste dataset instances from Roboflow/COCO API.');
    confetti({ particleCount: 40, spread: 30 });
  };

  // Fine-tuning epoch loop simulator
  const handleTrainModel = () => {
    if (dataset.length === 0) {
      alert('Dataset is empty. Upload reports or fetch public instances first.');
      return;
    }
    setTraining(true);
    setCurrentEpoch(0);
    setTrainingLogs(['Initializing dataset data tensors...', 'Shuffling training/validation split (80-20)...']);
    setLossHistory([]);
    setAccHistory([]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentEpoch(step);

      // Simulate backpropagation gradients
      const newLoss = Math.max(0.05, 0.54 - (step * (0.45 / epochs)) - (Math.random() * 0.03));
      const newAcc = Math.min(99.4, 85.4 + (step * (13.5 / epochs)) + (Math.random() * 0.5));

      setLoss(Number(newLoss.toFixed(3)));
      setAccuracy(Number(newAcc.toFixed(1)));

      setLossHistory(prev => [...prev, newLoss]);
      setAccHistory(prev => [...prev, newAcc]);

      setTrainingLogs(prev => [
        `Epoch ${step}/${epochs}: Training Loss = ${newLoss.toFixed(3)} | Validation Accuracy = ${newAcc.toFixed(1)}%`,
        ...prev
      ]);

      if (step >= epochs) {
        clearInterval(interval);
        setTraining(false);
        // Mark all ready blocks as trained
        setDataset(prev => prev.map(sample => ({ ...sample, status: 'Trained' })));
        
        // Save fine-tuned status
        localStorage.setItem('civic_model_finetuned', 'true');
        localStorage.setItem('civic_model_accuracy', newAcc.toFixed(1));

        onAddNotification(`FINE-TUNING COMPLETE: Model optimized on ${dataset.length} samples. Accuracy: ${newAcc.toFixed(1)}%. Checksum committed.`);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 800);
  };

  // Convert histories into SVG path coordinates
  // Range: index [0, epochs] to X [20, 280]
  // Range: Loss [0.6, 0.0] to Y [110, 10]
  // Range: Accuracy [80, 100] to Y [110, 10]
  const getLossPath = () => {
    if (lossHistory.length === 0) return '';
    return lossHistory.map((val, idx) => {
      const x = 20 + (idx / (epochs - 1)) * 260;
      const y = 110 - ((val - 0) / 0.6) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAccPath = () => {
    if (accHistory.length === 0) return '';
    return accHistory.map((val, idx) => {
      const x = 20 + (idx / (epochs - 1)) * 260;
      const y = 110 - ((val - 75) / 25) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Top row: Summary widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--secondary)' }}>
            <Activity size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Decentralized Audits</span>
            <strong style={{ fontSize: '1.2rem' }}>100% Pass</strong>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--emerald)' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Avg. Resolution Time</span>
            <strong style={{ fontSize: '1.2rem' }}>3.2 Days</strong>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '8px', color: 'var(--amber)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Predictive Warnings</span>
            <strong style={{ fontSize: '1.2rem' }}>2 Sectors</strong>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="glass-card p-2 border border-white/10" style={{ display: 'flex', gap: '10px', borderRadius: '12px', width: 'fit-content' }}>
        <button
          onClick={() => setActiveSubTab('forecasts')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: activeSubTab === 'forecasts' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: activeSubTab === 'forecasts' ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <CloudRain size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Climate Forecast Models
        </button>
        <button
          onClick={() => setActiveSubTab('trainer')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: activeSubTab === 'trainer' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
            color: activeSubTab === 'trainer' ? '#34D399' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Brain size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          AI Fine-Tuning Console
        </button>
      </div>

      {/* Render Subtab 1: Climate Forecast */}
      {activeSubTab === 'forecasts' && (
        <>
          <div className="dashboard-grid">
            {/* Monsoon Simulator Card */}
            <div className="glass-card p-6 border border-white/10" style={{
              background: 'linear-gradient(135deg, rgba(22, 28, 50, 0.45) 0%, rgba(59, 130, 246, 0.03) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CloudRain size={22} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Monsoon Pothole forecasting Model</h3>
              </div>

              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Adjust the projected monthly rainfall slider to simulate how moisture saturation levels impact local pavement wear and forecast pothole incidence.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>
                  <span>Projected Rainfall:</span>
                  <span style={{ color: 'var(--secondary)' }}>{rainfallValue} mm / month</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  value={rainfallValue}
                  onChange={(e) => setRainfallValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>50mm (Light rain)</span>
                  <span>200mm (Heavy monsoon)</span>
                  <span>350mm (Extreme rain)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Predicted New Potholes</span>
                  <strong style={{ fontSize: '1.6rem', color: prediction.level === 'Critical' ? 'var(--rose)' : prediction.level === 'High' ? 'var(--amber)' : '#FFF' }}>
                    ~ {prediction.potholes}
                  </strong>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>AI Model Confidence</span>
                  <strong style={{ fontSize: '1.6rem', color: 'var(--emerald)' }}>
                    {prediction.confidence}%
                  </strong>
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '14px', display: 'flex', gap: '10px' }}>
                <BrainCircuit size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--amber)', display: 'block' }}>Municipal Action Recommendation:</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {prediction.level === 'Low' && 'Road structure stable. Schedule routine checks.'}
                    {prediction.level === 'Medium' && 'Drain cleaning in Sector 4 is advised to prevent sidewalk standing water accumulation.'}
                    {prediction.level === 'High' && 'Pre-emptive crack sealing in Sector 4 (Old Town) highly recommended. Drainage clearing in Sector 9.'}
                    {prediction.level === 'Critical' && 'EMERGENCY WARNING: High asphalt erosion risk. Deploy pre-monsoon road fortification and divert heavy trucks from Sector 4.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Trends Charts */}
            <div className="glass-card p-6 border border-white/10" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Monthly Reports trend (Jan - Jun)</h3>
              </div>

              <div style={{ width: '100%', height: '180px', marginTop: '10px' }}>
                <svg viewBox="0 0 300 150" width="100%" height="100%">
                  <line x1="25" y1="125" x2="280" y2="125" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="25" y1="15" x2="25" y2="125" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="25" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="25" y1="55" x2="280" y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="25" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  <path d="M 45 112 L 88 108 L 131 105 L 174 95 L 217 80 L 260 62" fill="none" stroke="var(--primary)" strokeWidth="2" />
                  <circle cx="45" cy="112" r="3" fill="var(--primary)" />
                  <circle cx="88" cy="108" r="3" fill="var(--primary)" />
                  <circle cx="131" cy="105" r="3" fill="var(--primary)" />
                  <circle cx="174" cy="95" r="3" fill="var(--primary)" />
                  <circle cx="217" cy="80" r="3" fill="var(--primary)" />
                  <circle cx="260" cy="62" r="3" fill="var(--primary)" />

                  <path d="M 45 95 L 88 90 L 131 98 L 174 85 L 217 78 L 260 70" fill="none" stroke="#EC4899" strokeWidth="2" />
                  <circle cx="45" cy="95" r="3" fill="#EC4899" />
                  <circle cx="88" cy="90" r="3" fill="#EC4899" />
                  <circle cx="131" cy="98" r="3" fill="#EC4899" />
                  <circle cx="174" cy="85" r="3" fill="#EC4899" />
                  <circle cx="217" cy="78" r="3" fill="#EC4899" />
                  <circle cx="260" cy="70" r="3" fill="#EC4899" />

                  <text x="45" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Jan</text>
                  <text x="88" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Feb</text>
                  <text x="131" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Mar</text>
                  <text x="174" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Apr</text>
                  <text x="217" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">May</text>
                  <text x="260" y="140" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Jun</text>

                  <text x="18" y="128" fill="var(--text-muted)" fontSize="8" textAnchor="end">0</text>
                  <text x="18" y="93" fill="var(--text-muted)" fontSize="8" textAnchor="end">15</text>
                  <text x="18" y="58" fill="var(--text-muted)" fontSize="8" textAnchor="end">30</text>
                  <text x="18" y="23" fill="var(--text-muted)" fontSize="8" textAnchor="end">45</text>
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: 'var(--primary)' }}></span> Road Potholes</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#EC4899' }}></span> Overflowing Waste</span>
              </div>
            </div>
          </div>

          {/* Resolution Velocity Table */}
          <div className="glass-card p-6 border border-white/10">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Resolution Velocity by Issue Classification</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>Avg. Resolution Time</th>
                    <th style={{ padding: '10px' }}>Active Backlog</th>
                    <th style={{ padding: '10px' }}>Total Resolved</th>
                    <th style={{ padding: '10px' }}>SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {resolutionTimeData.map((row) => (
                    <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '12px 10px', color: '#FFF' }}>{row.days} days</td>
                      <td style={{ padding: '12px 10px', color: 'var(--amber)' }}>{row.active} issues</td>
                      <td style={{ padding: '12px 10px', color: 'var(--emerald)' }}>{row.resolved} items</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: row.name === 'Pothole' ? '92%' : row.name === 'Waste Mgmt' ? '98%' : '88%',
                              height: '100%',
                              background: 'var(--emerald)'
                            }} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{row.name === 'Pothole' ? '92%' : row.name === 'Waste Mgmt' ? '98%' : '88%'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Render Subtab 2: AI Dataset Fine-Tuning */}
      {activeSubTab === 'trainer' && (
        <div className="dashboard-grid">
          {/* Hyperparameters Config & Training Status Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card p-6 border border-white/10">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--primary)" /> Training Parameters
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Epochs</label>
                  <select
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="form-select"
                    disabled={training}
                  >
                    <option value="5">5 Epochs</option>
                    <option value="10">10 Epochs</option>
                    <option value="15">15 Epochs</option>
                    <option value="20">20 Epochs</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Learning Rate</label>
                  <select
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="form-select"
                    disabled={training}
                  >
                    <option value="0.01">0.01 (Fast)</option>
                    <option value="0.001">0.001 (Normal)</option>
                    <option value="0.0001">0.0001 (Slow)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="form-select"
                    disabled={training}
                  >
                    <option value="8">8 Samples</option>
                    <option value="16">16 Samples</option>
                    <option value="32">32 Samples</option>
                  </select>
                </div>
              </div>

              {/* Status summary info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                <span>Active Dataset Size: <strong>{dataset.length} instances</strong></span>
                <span>Accuracy: <strong style={{ color: 'var(--emerald)' }}>{accuracy}%</strong></span>
                <span>Loss: <strong style={{ color: 'var(--rose)' }}>{loss}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleImportPublicDataset}
                  disabled={training}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  <Database size={14} color="var(--primary)" /> Fetch Online Dataset
                </button>
                <button
                  onClick={handleTrainModel}
                  disabled={training || dataset.length === 0}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: '#10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                >
                  <Play size={14} /> {training ? `Training... (${currentEpoch}/${epochs})` : 'Run Fine-Tuning'}
                </button>
              </div>
            </div>

            {/* Live curves graphs during training */}
            {(training || lossHistory.length > 0) && (
              <div className="glass-card p-6 border border-white/10 animate-fade-in">
                <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-secondary)' }}>Live Loss & Accuracy Curves</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '140px' }}>
                  
                  {/* Loss plot */}
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.65rem', color: 'var(--rose)', fontWeight: 600 }}>LOSS (Minimizing)</div>
                    <svg viewBox="0 0 300 120" width="100%" height="100%">
                      <line x1="20" y1="110" x2="280" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="20" y1="10" x2="20" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      {lossHistory.length > 0 && (
                        <path d={getLossPath()} fill="none" stroke="var(--rose)" strokeWidth="2" />
                      )}
                    </svg>
                  </div>

                  {/* Accuracy plot */}
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: 600 }}>ACCURACY (Maximizing)</div>
                    <svg viewBox="0 0 300 120" width="100%" height="100%">
                      <line x1="20" y1="110" x2="280" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="20" y1="10" x2="20" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      {accHistory.length > 0 && (
                        <path d={getAccPath()} fill="none" stroke="var(--emerald)" strokeWidth="2" />
                      )}
                    </svg>
                  </div>

                </div>
              </div>
            )}

            {/* Active Training Log Terminal Console */}
            {(training || trainingLogs.length > 0) && (
              <div className="glass-card p-4 border border-white/10 animate-fade-in" style={{
                background: 'rgba(0,0,0,0.35)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Training Logs Console Output:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {trainingLogs.map((log, idx) => (
                    <div key={idx} style={{ color: idx === 0 ? 'var(--emerald)' : 'var(--text-secondary)' }}>
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dataset Grid Column */}
          <div className="glass-card p-6 border border-white/10" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="var(--emerald)" /> Training Dataset
              </h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                {dataset.length} Samples
              </span>
            </div>

            {/* List of samples */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {dataset.map((sample) => (
                <div
                  key={sample.id}
                  className="glass-card"
                  style={{
                    padding: '8px',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: '100%', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {sample.mediaSrc.startsWith('data:video/') ? (
                      <video src={sample.mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={sample.mediaSrc} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  
                  {/* Info details */}
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {sample.title}
                    </strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      <span>Label: <strong>{sample.category}</strong></span>
                      <span style={{ color: sample.status === 'Trained' ? 'var(--emerald)' : 'var(--amber)', fontWeight: 700 }}>
                        {sample.status}
                      </span>
                    </div>
                  </div>

                  {/* Source Badge tag */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: sample.source === 'User Report' ? 'var(--primary)' : 'rgba(0,0,0,0.6)',
                    color: '#FFF',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontSize: '0.6rem',
                    fontWeight: 700
                  }}>
                    {sample.source === 'User Report' ? 'USER COMPLAINT' : 'PUBLIC'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
