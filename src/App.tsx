/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  Map as MapIcon, 
  Target, 
  Activity, 
  Info, 
  Search, 
  AlertTriangle,
  ChevronRight,
  Crosshair,
  Layers
} from 'lucide-react';
import MapComponent from './components/MapComponent';
import { analyzeArea, getQuickSearchPrompt } from './services/geminiService';
import { Crater } from './types';
import { PELHAM_RANGE_CENTER } from './constants';

export default function App() {
  const [center, setCenter] = useState<[number, number]>(PELHAM_RANGE_CENTER);
  const [zoom, setZoom] = useState(15);
  const [craters, setCraters] = useState<Crater[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'intel' | 'markers'>('scan');

  // Initial historical markers
  useEffect(() => {
    const initialMarkers: Crater[] = [
      {
        id: 'HIST-001',
        lat: 33.7380,
        lng: -85.8150,
        type: 'impact',
        confidence: 0.95,
        description: 'Primary impact zone at Pelham Range. Dense cluster of circular depressions visible in satellite imagery.',
        timestamp: new Date().toISOString()
      },
      {
        id: 'HIST-002',
        lat: 33.7195,
        lng: -85.7877,
        type: 'structure',
        confidence: 0.88,
        description: 'Former training barracks and parade grounds. Potential foundational remnants.',
        timestamp: new Date().toISOString()
      }
    ];
    setCraters(initialMarkers);
  }, []);

  const handleAreaChange = (lat: number, lng: number, z: number) => {
    setCenter([lat, lng]);
    setZoom(z);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeArea(center[0], center[1], zoom);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const results = await getQuickSearchPrompt(searchQuery);
    setSearchResults(results);
  };

  const addCrater = (lat: number, lng: number) => {
    const newCrater: Crater = {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng,
      type: 'unknown',
      confidence: 0.5,
      description: 'User manual identification.',
      timestamp: new Date().toISOString()
    };
    setCraters([...craters, newCrater]);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F4F0] text-[#1A1A1A] font-sans selection:bg-accent selection:text-white" id="main-container">
      {/* Sidebar */}
      <aside className="w-[420px] flex flex-col border-r border-[#1A1A1A]/10 bg-[#F9F8F6] z-50 overflow-hidden relative shadow-2xl" id="left-sidebar">
        {/* Masthead */}
        <header className="p-10 border-b border-[#1A1A1A]/10 shrink-0" id="sidebar-header">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Section 4.1</span>
            <div className="h-px flex-1 bg-[#1A1A1A]/10" />
          </div>
          <h1 className="text-4xl font-serif italic leading-none mb-4 tracking-tight">The Crater <br/>Census</h1>
          <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-30 mb-8">Fort McClellan Survey // AL-36205</p>
          
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Objective</p>
              <p className="text-[11px] leading-relaxed italic">Analysis of historical subsurface disturbances across the Pelham Range impacts sectors.</p>
            </div>
            <div className="w-px bg-[#1A1A1A]/10" />
            <div className="w-24">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Status</p>
              <p className="text-[10px] font-mono leading-relaxed text-accent">LOCKED_IN</p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b border-[#1A1A1A]/10 px-8 bg-white/50">
          {[
            { id: 'scan', label: 'Scan', icon: Target },
            { id: 'intel', label: 'History', icon: Info },
            { id: 'markers', label: 'Findings', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === tab.id 
                  ? 'border-accent text-accent' 
                  : 'border-transparent opacity-30 hover:opacity-100'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'scan' && (
              <motion.div 
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-40">Strategic Search</h2>
                  <form onSubmit={handleSearch} className="flex border-b border-[#1A1A1A]/20 pb-2 focus-within:border-accent group transition-all">
                    <input 
                      type="text" 
                      placeholder="SEARCH RANGES, BUILDINGS, FEATURES..." 
                      className="flex-1 bg-transparent border-none text-xs font-serif italic placeholder:opacity-30 focus:outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="opacity-40 hover:opacity-100 transition-opacity">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="grid gap-3">
                      {searchResults.map((res: any, i) => (
                        <div 
                          key={i}
                          onClick={() => {
                            setCenter([res.lat, res.lng]);
                            setZoom(16);
                          }}
                          className="editorial-card group cursor-pointer hover:border-accent transition-all duration-300"
                        >
                          <p className="text-[8px] font-mono opacity-30 mb-1 tracking-widest uppercase">Registry Ref: MCC-00{i+1}</p>
                          <h4 className="font-serif text-lg leading-tight group-hover:italic mb-2 transition-all">{res.name}</h4>
                          <p className="text-[10px] leading-relaxed opacity-50">{res.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-40">Viewport Analysis</h2>
                  <div className="editorial-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Target className="w-12 h-12 rotate-45" />
                    </div>
                    <p className="text-[11px] leading-relaxed italic mb-6 opacity-70">
                      Cross-reference overhead imagery with historical training records to isolate crater signatures.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-accent text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:grayscale disabled:opacity-50 relative overflow-hidden group/btn flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Radar className="w-4 h-4 animate-pulse" />
                            ANALYZING DEPTHS...
                          </>
                        ) : (
                          <>INITIATE SECTOR SCAN</>
                        )}
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      </button>
                      
                      <button 
                        onClick={() => addCrater(center[0], center[1])}
                        className="w-full py-4 border border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#1A1A1A]/5 transition-all flex items-center justify-center gap-2"
                      >
                        <Crosshair className="w-4 h-4 opacity-40 font-bold" /> 
                        RECORD ANOMALY
                      </button>
                    </div>
                  </div>
                </div>

                {analysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="editorial-card border-l-4 border-l-accent"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Intelligence Report</h4>
                    </div>
                    <div className="text-[13px] font-serif leading-relaxed text-[#1A1A1A]/80 whitespace-pre-wrap italic">
                      {analysis}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'intel' && (
              <motion.div 
                key="intel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-40">Tactical & Historical Briefing</h2>
                  
                  <div className="editorial-card relative space-y-5">
                    <p className="text-[9px] font-mono opacity-30 mb-2">ARCHIVE_SUMMARY // AL-36205</p>
                    <p className="text-sm font-serif italic leading-relaxed">
                      Fort McClellan served as a premier U.S. Army installation from 1917 until its BRAC closure in 1999. Known primarily as the home of the <strong>U.S. Army Chemical School</strong> and <strong>Military Police School</strong>, the base also hosted extensive infantry replacement training during WWII and the Women's Army Corps (WAC).
                    </p>
                    <div className="h-px bg-[#1A1A1A]/10 w-full my-4" />
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Major Deployment Eras</h3>
                      <ul className="text-[11px] leading-relaxed opacity-70 space-y-2 list-disc pl-4">
                        <li><strong>WWI & WWII (1917-1945):</strong> Massive infantry maneuvers, trench digging, and conventional artillery training across the sprawling 20,000+ acre <em>Pelham Range</em>.</li>
                        <li><strong>Cold War Expansion (1950s-1980s):</strong> Specialized chemical warfare defensive training. Implementation of live-agent ranges and smoke/incendiary munition testing.</li>
                        <li><strong>Modern Era (1990s-Closure):</strong> Continued use of live-fire impact zones, specifically bounded areas against the Choccolocco mountain ridge serving as backstops.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-40">Documented Ordnance & Impacts</h2>
                  <div className="grid gap-4">
                    <div className="editorial-card group hover:border-[#8C2F1E]/30 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Crosshair className="w-4 h-4 opacity-40" />
                        <h4 className="font-serif italic font-bold">High-Explosive Artillery</h4>
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-60">
                        105mm and 155mm howitzer shells were fired heavily into the Pelham Range impact area. These produce the most identifiable "classic" craters: large circular depressions (3-8 meters wide) often showing distinct raised 'ejecta' rims, visible in pre-1990s aerial surveys before pine canopy reclamation.
                      </p>
                    </div>

                    <div className="editorial-card group hover:border-[#8C2F1E]/30 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-4 h-4 opacity-40" />
                        <h4 className="font-serif italic font-bold">Mortars & Rockets</h4>
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-60">
                        60mm and 81mm mortar rounds, alongside anti-tank rockets, were utilized in close-quarters infantry maneuver ranges. These leave smaller, clustered pockmarks, often obscured by secondary vegetative bias but detectable via LiDAR or winter-canopy satellite imagery.
                      </p>
                    </div>

                    <div className="editorial-card group hover:border-[#8C2F1E]/30 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Layers className="w-4 h-4 opacity-40" />
                        <h4 className="font-serif italic font-bold">Chemical & Incendiary</h4>
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-60">
                        Due to the Chemical School's presence, areas of McClellan saw deployment of smoke munitions, White Phosphorus (WP), and simulated/live chemical agents (Mustard gas, nerve agents). While air-bursts leave no craters, surface detonations created localized soil contamination and distressed vegetation circles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-40">Subsurface Disturbances</h2>
                  <div className="pl-4 border-l-2 border-[#1A1A1A]/10 space-y-3">
                    <p className="text-[11px] leading-relaxed opacity-70">
                      <strong>Trench Architecture:</strong> WWI-era training involved the construction of elaborate trench networks. While eventually filled, the disturbed subsoil settles differently, creating linear depressions and unique drainage signatures visible from orbit.
                    </p>
                    <p className="text-[11px] leading-relaxed opacity-70">
                      <strong>Base Infrastructure:</strong> Post-closure demolition of motor pools, barracks slabs, and the Chemical Defense Training Facility (CDTF) left massive rectangular scars and altered soil composition where concrete foundations were excavated.
                    </p>
                  </div>
                </div>

                <div className="p-8 border border-accent/20 bg-accent/5 italic shadow-sm mt-8">
                  <div className="flex gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    <span className="font-bold uppercase tracking-[0.3em] text-[10px] text-accent">Subsurface Integrity Warning</span>
                  </div>
                  <p className="opacity-80 leading-relaxed text-[11px] mb-4">
                    Unexploded Ordnance (UXO) density in the Pelham Range impact zones remains critically high. Additionally, certain historical training areas harbor residual environmental contamination. Remote satellite analysis is the primary authorized method for initial architectural review.
                  </p>
                  <div className="h-px bg-accent/10 w-full mb-4" />
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Protocol: Virtual Analysis Only via GEMINI_SCAN</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'markers' && (
              <motion.div 
                key="markers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Census Findings</h2>
                  <span className="text-[10px] font-mono px-3 py-1 bg-[#1A1A1A] text-white rounded-full">{craters.length} POINTS</span>
                </div>

                {craters.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-[#1A1A1A]/10 rounded-sm">
                    <MapIcon className="w-10 h-10 opacity-10 mx-auto mb-4" />
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-30">No anomalies recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {craters.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setCenter([c.lat, c.lng]);
                          setZoom(18);
                        }}
                        className="editorial-card group cursor-pointer hover:translate-x-2 transition-all duration-500"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{c.type || 'Anomaly'}</span>
                          <span className="text-[9px] opacity-30 font-mono italic">{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1 mb-4">
                          <div className="text-[11px] font-mono tracking-tighter opacity-40 uppercase">Lat: {c.lat.toFixed(6)}</div>
                          <div className="text-[11px] font-mono tracking-tighter opacity-40 uppercase">Lng: {c.lng.toFixed(6)}</div>
                        </div>
                        <p className="text-[12px] font-serif italic opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="p-8 border-t border-[#1A1A1A]/10 bg-white/50 shrink-0" id="sidebar-footer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent animate-ping opacity-20" />
              </div>
              <div className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-40">System Live</div>
            </div>
            <div className="flex items-center gap-4 text-[9px] opacity-20 font-bold uppercase tracking-widest">
              <span>AL-CRT-882</span>
              <div className="w-px h-3 bg-[#1A1A1A]" />
              <span>C.2024</span>
            </div>
          </div>
        </footer>
      </aside>

      {/* Main Map View */}
      <main className="flex-1 relative bg-[#E5E2DD] overflow-hidden" id="map-view">
        <MapComponent 
          craters={craters}
          center={center}
          zoom={zoom}
          onAreaChange={handleAreaChange}
          onMarkerAdd={addCrater}
        />

        {/* HUD - Clean Editorial Layout */}
        <div className="absolute top-10 left-10 pointer-events-none z-[1000] flex flex-col gap-px">
          <div className="bg-[#F9F8F6] px-6 py-2 border border-[#1A1A1A]/10 border-b-0 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">North </span>
            <span className="text-[13px] font-serif italic ml-4">{center[0].toFixed(6)}°</span>
          </div>
          <div className="bg-[#F9F8F6] px-6 py-2 border border-[#1A1A1A]/10 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">West </span>
            <span className="text-[13px] font-serif italic ml-4">{center[1].toFixed(6)}°</span>
          </div>
        </div>

        <div className="absolute top-10 right-10 pointer-events-none z-[1000]">
          <div className="bg-[#F9F8F6] px-6 py-3 border border-[#1A1A1A]/10 shadow-sm flex items-center gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Magnification</span>
            <div className="h-4 w-[1px] bg-[#1A1A1A]/10" />
            <span className="text-[13px] font-serif italic">{zoom}X</span>
          </div>
        </div>

        {/* Crosshair Overlay - Minimalist */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000]">
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-[#1A1A1A]/20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-[#1A1A1A]/20" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-[#1A1A1A]/20" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-[#1A1A1A]/20" />
            
            <div className="absolute inset-8 border border-[#1A1A1A]/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-accent rounded-full opacity-40" />
          </div>
        </div>

        {/* Interactive Guide Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-[#F9F8F6] border border-[#1A1A1A]/10 p-4 shadow-2xl flex items-center gap-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#1A1A1A]/5 flex items-center justify-center bg-white">
              <span className="text-[10px] font-bold opacity-30">01</span>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-30">Interaction</p>
              <p className="text-[11px] font-serif italic">Double click to mark anomaly</p>
            </div>
          </div>
          <div className="w-px h-6 bg-[#1A1A1A]/10" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#1A1A1A]/5 flex items-center justify-center bg-white cursor-pointer hover:bg-accent transition-colors group">
              <Target className="w-4 h-4 opacity-30 group-hover:text-white" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-30">Scan</p>
              <p className="text-[11px] font-serif italic">Center view for AI analysis</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
