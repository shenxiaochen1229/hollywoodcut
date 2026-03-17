"use client";

import { useState, useEffect } from "react";
import { Camera, Upload, Clapperboard, User, Sparkles, Loader2, CheckCircle2, RefreshCw, Film, Search, ArrowRight, Image as ImageIcon } from "lucide-react";
import { searchMovie, getMovieCredits } from "@/lib/tmdb_client";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [movieName, setMovieName] = useState("");
  const debouncedMovieName = useDebounce(movieName, 500);
  
  // UI States
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  // User Upload State
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);

  // Generation Flow States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<1 | 2>(1); 
  const [finalImage, setFinalImage] = useState<string | null>(null);

  // API Call: Search Movies
  useEffect(() => {
    if (!debouncedMovieName) {
      setSearchResults([]);
      return;
    }
    if (selectedMovie && selectedMovie.title === debouncedMovieName) {
      return;
    }
    const fetchMovies = async () => {
      setIsSearching(true);
      const results = await searchMovie(debouncedMovieName);
      setSearchResults(results.slice(0, 5));
      setIsSearching(false);
    };
    fetchMovies();
  }, [debouncedMovieName, selectedMovie]);

  const handleSelectMovie = async (movie: any) => {
    setSelectedMovie(movie);
    setMovieName(movie.title);
    setSearchResults([]);
    setSelectedCharacter(null);
    setCharacters([]);
    setFinalImage(null);
    
    setIsLoadingCharacters(true);
    const credits = await getMovieCredits(movie.id);
    setCharacters(credits);
    setIsLoadingCharacters(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImageBase64(reader.result as string);
        setFinalImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCharacter || !userImageBase64) return;
    
    setIsGenerating(true);
    setGenerationStep(1);
    
    try {
      const targetPrompt = `A grainy mobile phone snapshot of ${selectedCharacter.character} (played by ${selectedCharacter.name}) in ${selectedMovie?.title} posing side-by-side with the user (face reference provided), behind the scenes of a movie set, film lighting equipment in background.`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           prompt: targetPrompt,
           userImageBase64: userImageBase64,
           backdropPath: selectedMovie?.backdrop_path
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }

      setGenerationStep(2); 
      setFinalImage(data.result);

      setTimeout(() => {
        window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
      }, 300);

    } catch (e: any) {
      alert(`生成出错: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Animation variants
  const fadeIn: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[120px] bg-emerald-900/40 opacity-50 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[150px] bg-blue-900/40 opacity-40 delay-1000 animate-pulse" />
      </div>

      <main className="relative z-10 p-6 sm:p-10 max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="text-center pt-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-xs font-medium tracking-wide text-slate-300 uppercase">AI 驱动的电影片场体验</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">Cine</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500 drop-shadow-sm">Snapshot</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            上传你的肖像，选择一个电影宇宙，瞬间跨入拍摄现场，开启与大牌影星的幕后抓拍时刻。
          </p>
        </motion.header>

        {/* Main Flow Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:gap-8 lg:grid-cols-2 mt-12"
        >
          {/* Step 1: Upload Card */}
          <motion.div variants={fadeIn} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent rounded-3xl blur-xl transition-all duration-500 group-hover:from-blue-500/20" />
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl h-full flex flex-col relative shadow-2xl transition-all duration-300 hover:border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <User size={18} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">1. 你的自拍</h2>
              </div>
              
              <label className={`flex-1 min-h-[300px] rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-500 cursor-pointer overflow-hidden relative ${userImageBase64 ? 'border-none ring-2 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'}`}>
                <AnimatePresence mode="wait">
                  {userImageBase64 ? (
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img src={userImageBase64} alt="Portrait" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full text-white font-medium shadow-2xl border border-white/30 backdrop-blur-md">
                           <RefreshCw size={18} /> 更换照片
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 p-8 text-center z-10"
                    >
                      <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center -mb-2 shadow-inner border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Upload className="text-blue-400" size={32} />
                      </div>
                      <span className="text-lg font-medium text-slate-200">上传高清人像</span>
                      <span className="text-sm text-slate-500 font-light">正脸照将能获得最佳的换脸效果</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </motion.div>

          {/* Step 2: Casting Card */}
          <motion.div variants={fadeIn} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-3xl blur-xl transition-all duration-500 group-hover:from-emerald-500/20" />
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl h-[460px] flex flex-col relative shadow-2xl transition-all duration-300 hover:border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Film size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">2. 电影试镜</h2>
              </div>
              
              <div className="flex flex-col flex-1 gap-5 relative">
                {/* Search Input */}
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Search size={18} className="text-slate-400 group-focus-within/input:text-emerald-400 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="搜寻一部电影..."
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-slate-100 transition-all font-medium placeholder:text-slate-500 shadow-inner"
                    value={movieName}
                    onChange={(e) => setMovieName(e.target.value)}
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-emerald-500" size={18} />
                    </div>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[68px] z-50 w-full bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] max-h-60 overflow-y-auto backdrop-blur-3xl"
                    >
                      {searchResults.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleSelectMovie(movie)}
                          className="w-full text-left px-5 py-3 hover:bg-white/5 text-slate-300 text-sm flex gap-4 items-center border-b border-white/5 last:border-0 transition-colors cursor-pointer"
                        >
                          {movie.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="w-10 h-14 object-cover rounded-md shadow-md" />
                          ) : (
                            <div className="w-10 h-14 bg-white/5 rounded-md flex items-center justify-center shadow-md border border-white/5"><Clapperboard size={14} className="text-slate-600" /></div>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <div className="font-bold truncate text-slate-200 text-base">{movie.title}</div>
                            <div className="text-xs text-emerald-400/80 mt-1 font-medium tracking-wide">{movie.release_date?.substring(0, 4) || '未知年份'}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Character List */}
                <div className="flex-1 bg-black/30 rounded-2xl p-2 border border-white/5 overflow-y-auto w-full custom-scrollbar relative">
                  {isLoadingCharacters ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-emerald-500/80" size={32} />
                      <span className="text-emerald-500/60 font-medium text-sm tracking-widest uppercase">正在检索卡司...</span>
                    </div>
                  ) : characters.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {characters.map((char) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={char.id}
                          onClick={() => {
                            setSelectedCharacter(char);
                            setFinalImage(null);
                          }}
                          className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden group/char ${
                            selectedCharacter?.id === char.id 
                              ? 'bg-gradient-to-r from-emerald-500/20 to-transparent border border-emerald-500/50 shadow-[inset_4px_0_0_rgba(16,185,129,1)]' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {char.profile_path ? (
                            <img src={`https://image.tmdb.org/t/p/w185${char.profile_path}`} alt={char.name} className="w-12 h-12 object-cover rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shadow-inner border border-white/10"><User size={20} className="text-slate-500" /></div>
                          )}
                          <div className="flex-1 overflow-hidden z-10">
                            <div className="font-bold text-slate-100 text-sm md:text-base truncate transition-colors group-hover/char:text-emerald-300">{char.character}</div>
                            <div className="text-xs text-slate-500 truncate mt-0.5 font-light">{char.name}</div>
                          </div>
                          {selectedCharacter?.id === char.id && (
                            <motion.div layoutId="check" className="absolute right-4 text-emerald-400">
                              <CheckCircle2 size={22} fill="rgba(16,185,129,0.2)" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center italic text-slate-500 gap-3 px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/5">
                        <User size={28} className="text-slate-600" />
                      </div>
                      <span className="text-sm font-medium">{selectedMovie ? "未检索到相关演员信息" : "搜索电影以探索角色列表"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Engine */}
        <motion.div variants={fadeIn} className="flex flex-col items-center pt-8">
          <button 
            onClick={handleGenerate}
            disabled={!selectedCharacter || !userImageBase64 || isGenerating}
            className={`cursor-pointer group relative flex items-center justify-center gap-3 px-8 sm:px-14 py-5 rounded-full font-extrabold text-lg sm:text-xl transition-all duration-500 w-full sm:w-auto min-w-[320px] overflow-hidden ${
              selectedCharacter && userImageBase64 && !isGenerating
                ? 'text-black shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:-translate-y-1 transform active:scale-95' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
          >
            {/* Button Gradient Background - only visible when active */}
            {(selectedCharacter && userImageBase64 && !isGenerating) && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 transition-transform duration-500 group-hover:scale-105" />
            )}
            
            <div className="relative z-10 flex items-center gap-3">
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin text-emerald-400" size={24} />
                  <span className="text-slate-300 font-medium tracking-wide">
                    {generationStep === 1 ? "正在合成场景..." : "正深度适配人像..."}
                  </span>
                </>
              ) : (
                 <>
                  <span>初始化瞬间创作</span>
                  <ArrowRight className="transform group-hover:translate-x-1 transition-transform" size={22} />
                 </>
              )}
            </div>
          </button>
        </motion.div>

        {/* Blueprint & Results Engine */}
        <motion.div variants={fadeIn} className="pt-8 pb-24 relative z-20">
          <AnimatePresence mode="wait">
            {finalImage ? (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="max-w-5xl mx-auto"
               >
                 <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-2 sm:p-4 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden relative group">
                    {/* Glowing edges */}
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500/30 via-transparent to-blue-500/30 rounded-[2rem] z-0 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative z-10 bg-black rounded-[1.5rem] overflow-hidden">
                       {/* Header row */}
                       <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                             <h3 className="font-bold text-sm tracking-widest text-slate-200 uppercase">绝密抓拍已就位</h3>
                          </div>
                          <button 
                             onClick={() => {
                                const a = document.createElement('a');
                                a.href = finalImage;
                                a.download = `CineSnapshot-${selectedMovie?.title}.png`;
                                a.click();
                             }}
                             className="cursor-pointer text-xs bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg flex items-center gap-2"
                          >
                            <ImageIcon size={14} /> 下载高清合照
                          </button>
                       </div>
                       
                       {/* Image Wrapper */}
                       <div className="w-full aspect-[4/3] sm:aspect-video relative bg-[#050505] flex items-center justify-center">
                          <img src={finalImage} alt="Final Generation" className="w-full h-full object-contain" />
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none opacity-50">
                             <div className="text-[10px] font-mono tracking-widest text-white/50 bg-black/40 px-2 py-1 rounded backdrop-blur-md">CS-XR-瞬间生成</div>
                             <div className="text-[10px] font-mono text-white/50 bg-black/40 px-2 py-1 rounded backdrop-blur-md">V1.0.0</div>
                          </div>
                       </div>
                    </div>
                 </div>
               </motion.div>
            ) : (
               <motion.div 
                 key="blueprint"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="max-w-3xl mx-auto mt-4"
               >
                 {selectedCharacter && userImageBase64 ? (
                   <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-3xl border border-white/5 p-8 flex flex-col gap-5 shadow-2xl relative overflow-hidden group">
                     {/* Decorative subtle gradient */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
                     
                     <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                       <Clapperboard size={20} className="text-emerald-400" />
                       <span className="font-bold uppercase tracking-widest text-sm text-slate-200">引擎指令蓝图</span>
                     </div>
                     <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-slate-300 font-mono text-sm leading-8 shadow-inner relative">
                       <span className="text-emerald-400/80">"</span>
                       <span className="text-white font-medium">A grainy mobile phone snapshot</span> of{" "}
                       <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md mx-1">{selectedCharacter.character}</span>{" "}
                       <span className="opacity-40 text-xs">({selectedCharacter.name})</span> in{" "}
                       <span className="text-cyan-400 font-medium italic select-all cursor-pointer">"{selectedMovie?.title}"</span>{" "}
                       posing side-by-side with the user (face reference provided), behind the scenes of a movie set, film lighting equipment in background.
                       <span className="text-emerald-400/80">"</span>
                     </div>
                     <div className="flex justify-between items-center px-2 pt-2">
                        <div className="flex items-center gap-2">
                           <span className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                           </span>
                           <span className="text-slate-500 text-xs tracking-widest uppercase font-semibold">创作引擎就绪</span>
                        </div>
                        <span className="text-slate-600 text-[10px] font-mono uppercase">Node Sequence : Locked</span>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-[#0a0a0a]/40 backdrop-blur-md rounded-3xl border border-white/5 p-10 flex flex-col items-center justify-center gap-4 shadow-xl h-[300px]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                        <Camera size={40} className="text-slate-700 relative z-10" />
                      </div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 mt-2">
                         {userImageBase64 ? "等待角色选择" : selectedCharacter ? "等待肖像上传" : "等待创作参数就绪"}
                      </span>
                   </div>
                 )}
               </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
