import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Brain, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Upload, AlertTriangle } from 'lucide-react';
import type { Issue } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface ReportWizardProps {
  existingIssues: Issue[];
  onSubmitIssue: (newIssue: Omit<Issue, 'id' | 'upvotes' | 'verifications' | 'createdAt' | 'comments'>) => void;
  onAddPoints: (points: number) => void;
  onAddNotification: (text: string) => void;
  currentUsername: string;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  existingIssues,
  onSubmitIssue,
  onAddPoints,
  onAddNotification,
  currentUsername,
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Geolocation states
  const [lat, setLat] = useState<number>(40.730610);
  const [lng, setLng] = useState<number>(-73.935242);
  const [address, setAddress] = useState('Detecting location...');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'failed'>('idle');
  
  // Proximity duplicates
  const [duplicateFound, setDuplicateFound] = useState<Issue | null>(null);
  
  // AI states
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisLogs, setAiAnalysisLogs] = useState<string[]>([]);
  const [aiCategory, setAiCategory] = useState<'Pothole' | 'Waste Management' | 'Water Leakage' | 'Streetlight Failure'>('Pothole');
  const [aiPriority, setAiPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState('');

  // Preset sample files for quick demo
  const samplePresets = [
    {
      label: 'Sample Pothole',
      title: 'Deep Asphalt Crater',
      description: 'A dangerous pothole is growing in size, collecting water and causing cars to swerve.',
      category: 'Pothole',
      priority: 'High',
      confidence: 96.4,
      image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      address: '102 Broadway Ave, Sector 4'
    },
    {
      label: 'Sample Garbage Dump',
      title: 'Overflowing Waste Containers',
      description: 'Illegal dumping has accumulated at the corner. Industrial trash bag pile-up attracting rodents.',
      category: 'Waste Management',
      priority: 'Medium',
      confidence: 94.1,
      image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      address: 'Sector 5 School Road'
    },
    {
      label: 'Sample Water Leak',
      title: 'Sprung Water Main Flow',
      description: 'Sidewalk pipe joint has fractured, spraying clean water into the road and eroding asphalt.',
      category: 'Water Leakage',
      priority: 'Critical',
      confidence: 97.8,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      address: '32 River Rd, Sector 2'
    }
  ];

  // Auto Geolocate
  const handleGeolocate = () => {
    setLocationStatus('fetching');
    setAddress('Accessing GPS satellites...');
    
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
            setAddress(`Gps Coordinate Point (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`);
            setLocationStatus('success');
            checkProximity(position.coords.latitude, position.coords.longitude);
          },
          () => {
            // Fallback to random coordinates around New York
            const mockLat = 40.7250 + (Math.random() - 0.5) * 0.02;
            const mockLng = -73.9350 + (Math.random() - 0.5) * 0.02;
            setLat(mockLat);
            setLng(mockLng);
            setAddress(`Auto-Resolved: ${Math.floor(Math.random() * 200) + 1} Elm Street, Sector 4`);
            setLocationStatus('success');
            checkProximity(mockLat, mockLng);
          }
        );
      } else {
        const mockLat = 40.7250 + (Math.random() - 0.5) * 0.02;
        const mockLng = -73.9350 + (Math.random() - 0.5) * 0.02;
        setLat(mockLat);
        setLng(mockLng);
        setAddress('Auto-Resolved: 45 Park Lane, Sector 9');
        setLocationStatus('success');
        checkProximity(mockLat, mockLng);
      }
    }, 1200);
  };

  // Proximity checker (Haversine formula approximation)
  const checkProximity = (latitude: number, longitude: number) => {
    let nearest: Issue | null = null;
    let minDistance = Infinity;

    existingIssues.forEach(issue => {
      // rough distance calculation in meters
      const dy = (issue.location.lat - latitude) * 111320;
      const dx = (issue.location.lng - longitude) * 40075000 * Math.cos(latitude * Math.PI / 180) / 360;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100 && dist < minDistance) { // within 100 meters
        minDistance = dist;
        nearest = issue;
      }
    });

    setDuplicateFound(nearest);
  };

  // Run AI Analyzer simulation
  const runAIAnalysis = () => {
    setAiAnalyzing(true);
    setAiAnalysisLogs([]);
    
    const logs = [
      'Initializing Gemini Multimodal Pipeline...',
      'Decoding image parameters and color histograms...',
      'Running image semantic segmentation (visual damage check)...',
      'Running text sentiment & keyword correlation model...',
      'Resolving class features to civic taxonomy groups...',
      'Calculating priority weighting index...'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setAiAnalysisLogs(prev => [...prev, log]);
        
        if (index === logs.length - 1) {
          // Finished analysis
          let detectedCategory: typeof aiCategory = 'Pothole';
          let detectedPriority: typeof aiPriority = 'Medium';
          let confidence = 85.5;
          let summary = 'AI Summary: Structural issue detected needing standard review.';

          // Smart classification based on text keywords
          const fullText = (title + ' ' + description).toLowerCase();
          
          if (fullText.includes('pothole') || fullText.includes('crater') || fullText.includes('road') || fullText.includes('asphalt')) {
            detectedCategory = 'Pothole';
            detectedPriority = 'High';
            confidence = 94.2;
            summary = 'AI Insight: Severe roadway asphalt degradation detected. Pothole poses immediate vehicle collision risk.';
          } else if (fullText.includes('garbage') || fullText.includes('waste') || fullText.includes('trash') || fullText.includes('dump')) {
            detectedCategory = 'Waste Management';
            detectedPriority = 'Medium';
            confidence = 91.5;
            summary = 'AI Insight: Accumulation of debris/solid waste. Biohazard risk identified due to public exposure.';
          } else if (fullText.includes('water') || fullText.includes('leak') || fullText.includes('pipe') || fullText.includes('burst') || fullText.includes('flooding')) {
            detectedCategory = 'Water Leakage';
            detectedPriority = 'Critical';
            confidence = 97.4;
            summary = 'AI Insight: Subsurface fluid main rupture suspected. High volume clean water wastage with potential pavement erosion.';
          } else if (fullText.includes('light') || fullText.includes('dark') || fullText.includes('lamp') || fullText.includes('electricity')) {
            detectedCategory = 'Streetlight Failure';
            detectedPriority = 'Low';
            confidence = 89.9;
            summary = 'AI Insight: Luminaire malfunction. Illumination levels below safety standard for night-time pedestrians.';
          }

          const isFinetuned = localStorage.getItem('civic_model_finetuned') === 'true';
          const savedAccuracy = localStorage.getItem('civic_model_accuracy');
          
          let finalConfidence = confidence;
          let finalSummary = summary;
          
          if (isFinetuned && savedAccuracy) {
            finalConfidence = Math.min(99.8, parseFloat(savedAccuracy) + (Math.random() * 0.4));
            finalSummary += ` [FINE-TUNED MODEL CHECKPASS: Accuracy optimized to ${savedAccuracy}%]`;
          }

          setAiCategory(detectedCategory);
          setAiPriority(detectedPriority);
          setAiConfidence(Number(finalConfidence.toFixed(1)));
          setAiSummary(finalSummary);
          setAiAnalyzing(false);
        }
      }, (index + 1) * 700);
    });
  };

  useEffect(() => {
    if (step === 3) {
      runAIAnalysis();
    }
  }, [step]);

  const selectPreset = (preset: typeof samplePresets[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setImageFile(preset.image);
    setImageName(preset.label + '.jpg');
    setAddress(preset.address);
    setLocationStatus('success');
    
    // Set custom coordinates depending on category
    if (preset.category === 'Pothole') {
      setLat(40.730610);
      setLng(-73.935242);
    } else if (preset.category === 'Waste Management') {
      setLat(40.725910);
      setLng(-73.931890);
    } else {
      setLat(40.735820);
      setLng(-73.940250);
    }
    
    checkProximity(lat, lng);
  };

  const handleNextStep = () => {
    if (step === 1 && (!title || !description)) {
      alert('Please fill out the title and description.');
      return;
    }
    if (step === 2 && locationStatus !== 'success') {
      alert('Please detect your location to proceed.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Commit logic
    const mediaCID = imageFile ? 'Qm' + Array.from({length: 44}, () => Math.floor(Math.random()*36).toString(36)).join('') : undefined;
    
    onSubmitIssue({
      title,
      description,
      category: aiCategory,
      priority: aiPriority,
      location: {
        lat,
        lng,
        address,
      },
      status: 'Pending',
      reporterHash: `${currentUsername} (0x${Array.from({length: 6}, () => Math.floor(Math.random()*16).toString(16)).join('')})`,
      mediaCID,
    });

    // Award Points
    onAddPoints(50);
    onAddNotification(`Report submitted! SECURE LEDGER SIGNED: Created Block for "${title}". +50 Karma Points awarded.`);
    
    // Confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Reset states
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImageName('');
    setLocationStatus('idle');
    setDuplicateFound(null);
    setStep(1);
  };

  return (
    <div className="glass-card p-6 border border-white/10" style={{ width: '100%' }}>
      {/* Step Indicator Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} className="cat-pothole" /> File Citizen Report
        </h2>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
          <span style={{ color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>1. Info</span>
          <ChevronRight size={14} color="var(--text-muted)" />
          <span style={{ color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>2. Geo-Tag</span>
          <ChevronRight size={14} color="var(--text-muted)" />
          <span style={{ color: step >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>3. AI Scan</span>
        </div>
      </div>

      {/* Step 1: Info and Media */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="input-group">
            <label className="input-label">Select Demo Presets (Saves Typing!):</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(preset)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  📸 {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="report-title">Issue Title</label>
            <input
              id="report-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken streetlight causing pitch black corner"
              className="form-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="report-desc">Description</label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a description of the issue. Be specific about scope, damage, or duration."
              className="form-textarea"
            />
          </div>

          {/* Media upload */}
          <div className="input-group">
            <label className="input-label">Attach Media Evidence (Image/Video)</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,video/*"
            />
            <div
              style={{
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '30px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'border var(--transition-fast)'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageFile ? (
                <div>
                  {imageFile.startsWith('data:video/') || imageName.toLowerCase().endsWith('.mp4') || imageName.toLowerCase().endsWith('.mov') || imageName.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={imageFile}
                      controls
                      onClick={(e) => e.stopPropagation()}
                      style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <img
                      src={imageFile}
                      alt="Preview"
                      style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                  )}
                  <div style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: 600 }}>
                    ✓ Attached: {imageName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Click to replace
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={32} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Drag & drop files or click to upload
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, MP4 up to 50MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              onClick={handleNextStep}
              className="btn btn-primary"
              disabled={!title || !description}
            >
              Next Step: Geo-Tag <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Geolocation & Duplicate Detection */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label">Auto-Tag Geolocation</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleGeolocate}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <MapPin size={18} color="var(--primary)" />
                {locationStatus === 'fetching' ? 'Requesting GPS...' : 'Fetch My Location'}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <MapPin size={18} color="var(--emerald)" />
              <strong style={{ fontSize: '0.9rem' }}>Report Coordinates</strong>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {address}
            </div>
            {locationStatus === 'success' && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Lat: {lat.toFixed(6)}</span>
                <span>Lng: {lng.toFixed(6)}</span>
              </div>
            )}
          </div>

          {/* Duplicate Detection Alert Card */}
          {duplicateFound && (
            <div className="glass-card pulse-border" style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.3)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                <AlertTriangle size={24} color="var(--amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--amber)', fontWeight: 700, margin: '0 0 6px 0' }}>
                    Potential Duplicate Issue Detected Nearby!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Another citizen reported <strong>"{duplicateFound.title}"</strong> ({duplicateFound.location.address}) within 100 meters of your coordinates.
                  </p>
                  
                  {/* Duplicate details */}
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '16px',
                    borderLeft: '3px solid var(--amber)'
                  }}>
                    <div style={{ fontWeight: 600 }}>{duplicateFound.title}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Status: {duplicateFound.status} | Upvotes: {duplicateFound.upvotes}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        // Trigger mock duplicate upvote
                        onAddPoints(20);
                        onAddNotification(`Upvoted existing report "${duplicateFound.title}" to prevent duplication. +20 Karma points awarded!`);
                        confetti({ particleCount: 50, spread: 40 });
                        setTitle('');
                        setDescription('');
                        setImageFile(null);
                        setImageName('');
                        setStep(1);
                      }}
                      className="btn btn-primary"
                      style={{ background: 'var(--amber)', fontSize: '0.85rem', padding: '8px 16px' }}
                    >
                      Upvote Existing Instead (+20 Karma)
                    </button>
                    <button
                      onClick={() => setDuplicateFound(null)} // dismiss and allow submitting anyway
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                    >
                      Create Separate Report anyway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button onClick={handlePrevStep} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleNextStep}
              className="btn btn-primary"
              disabled={locationStatus !== 'success'}
            >
              Analyze with Multimodal AI <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Scanner & Category/Priority Suggestion */}
      {step === 3 && (
        <div className="animate-fade-in">
          {aiAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '20px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                {imageFile ? (
                  <img
                    src={imageFile}
                    alt="Scanning"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={48} color="var(--text-muted)" />
                  </div>
                )}
                {/* Horizontal scanner beam */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'var(--primary)',
                  boxShadow: '0 0 12px var(--primary)',
                  animation: 'scannerLine 2s infinite ease-in-out'
                }}></div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Brain className="cat-pothole" style={{ animation: 'spin 4s infinite linear' }} size={24} />
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>Gemini Multimodal AI Processing...</strong>
              </div>

              {/* Console logs box */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {aiAnalysisLogs.map((log, index) => (
                  <div key={index} style={{ color: index === aiAnalysisLogs.length - 1 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    &gt; {log}
                  </div>
                ))}
              </div>
              
              {/* Scan beam animation styling */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scannerLine {
                  0%, 100% { top: 0%; }
                  50% { top: 96%; }
                }
              `}} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <Brain className="cat-pothole" size={24} />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Gemini AI Model Results</h3>
                <span className="glass-card" style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--emerald)', fontWeight: 700 }}>
                  Confidence: {aiConfidence}%
                </span>
              </div>

              {/* AI Categorized Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">AI Categorized Tag</label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Streetlight Failure">Streetlight Failure</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Suggested Priority</label>
                  <select
                    value={aiPriority}
                    onChange={(e) => setAiPriority(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* AI Auto Summary Box */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.9rem',
                marginBottom: '28px'
              }}>
                <strong>Summary description auto-generated:</strong>
                <p style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {aiSummary}
                </p>
              </div>

              {/* Blockchain commit panel */}
              <div style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0 }} />
                <span>
                  By submitting, this complaint data will be cryptographically locked in a block and committed to the <strong>tamper-proof blockchain ledger</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                <button onClick={handlePrevStep} className="btn btn-secondary">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleSubmit} className="btn btn-primary">
                  Cryptographically Sign & Submit <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
