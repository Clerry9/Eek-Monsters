import React, { useState } from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import { MathGateReview, ColorPalette, MathMode } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AfterActionReportProps {
  currentRunReviews: MathGateReview[];
  historicalReviews: MathGateReview[];
  palette: ColorPalette;
  onBack: () => void;
}

export default function AfterActionReport({ 
  currentRunReviews, 
  historicalReviews, 
  palette, 
  onBack 
}: AfterActionReportProps) {
  const [viewScope, setViewScope] = useState<'current' | 'all-time'>('current');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'performance' | 'review'>('dashboard');
  
  // Sandbox quiz / interactive scratchpad review state
  const [selectedReviewForQuiz, setSelectedReviewForQuiz] = useState<MathGateReview | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Parse review arrays
  const activeReviews = viewScope === 'current' ? currentRunReviews : historicalReviews;

  // Helper to categorize reviews
  const getCategoryLabel = (mode?: MathMode, leftText?: string): string => {
    if (mode) {
      if (mode === 'addition') return 'Addition';
      if (mode === 'subtraction') return 'Subtraction';
      if (mode === 'multiplication') return 'Multiplication';
      if (mode === 'division') return 'Division';
      if (mode === 'algebraic') return 'Algebra';
      if (mode === 'fractions') return 'Fractions';
      if (mode === 'percentages') return 'Percentages';
      if (mode === 'exponents') return 'Exponents';
    }
    
    const text = (leftText || '').toLowerCase();
    if (text.includes('solve') || text.includes('x =') || text.includes('y =')) return 'Algebra';
    if (text.includes('½') || text.includes('¼') || text.includes('¾') || (text.includes('/') && !text.includes('÷'))) return 'Fractions';
    if (text.includes('%')) return 'Percentages';
    if (text.includes('²') || text.includes('³') || text.includes('^')) return 'Exponents';
    if (text.includes('+') || text.includes('add')) return 'Addition';
    if (text.includes('-') || text.includes('sub') || text.includes('minus')) return 'Subtraction';
    if (text.includes('×') || text.includes('*') || text.includes('x') || text.includes('times')) return 'Multiplication';
    if (text.includes('÷') || text.includes('div')) return 'Division';
    return 'General';
  };

  // Group stats by Category
  const categoryStatsMap: Record<string, { total: number; correct: number }> = {};
  
  // Make sure we have records for standard categories so they always render nicely
  const standardCategories = ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Algebra', 'Fractions', 'Percentages', 'Exponents'];
  standardCategories.forEach(cat => {
    categoryStatsMap[cat] = { total: 0, correct: 0 };
  });

  activeReviews.forEach(review => {
    const cat = getCategoryLabel(review.mode, review.leftText);
    if (!categoryStatsMap[cat]) {
      categoryStatsMap[cat] = { total: 0, correct: 0 };
    }
    categoryStatsMap[cat].total += 1;
    if (review.isBetterChoice) {
      categoryStatsMap[cat].correct += 1;
    }
  });

  // Convert map to Recharts compatible dataset
  const chartData = Object.entries(categoryStatsMap).map(([name, stats]) => {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      name,
      'Total Encounted': stats.total,
      'Optimal Decisions': stats.correct,
      'Suboptimal Choices': stats.total - stats.correct,
      Accuracy: accuracy,
    };
  }).filter(item => item['Total Encounted'] > 0 || viewScope === 'all-time'); // only show categories with data in current run to save screen space

  // If there's no data whatsoever, fall back to showing everything
  const displayChartData = chartData.length > 0 ? chartData : Object.entries(categoryStatsMap).map(([name, stats]) => ({
    name,
    'Total Encounted': 0,
    'Optimal Decisions': 0,
    'Suboptimal Choices': 0,
    Accuracy: 0,
  }));

  // Diagnostic parameters
  const totalQuestions = activeReviews.length;
  const correctQuestions = activeReviews.filter(r => r.isBetterChoice).length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  // Find strongest and weakest subjects
  let strongestSubject = 'None';
  let strongestAcc = -1;
  let weakestSubject = 'None';
  let weakestAcc = 101;

  Object.entries(categoryStatsMap).forEach(([name, stats]) => {
    if (stats.total > 0) {
      const acc = stats.correct / stats.total;
      if (acc > strongestAcc) {
        strongestAcc = acc;
        strongestSubject = name;
      }
      if (acc < weakestAcc) {
        weakestAcc = acc;
        weakestSubject = name;
      }
    }
  });

  // Diagnostic rankings / math ratings
  let performanceRank = 'Math Initiate';
  let rankColorClass = 'text-slate-400';
  let rankSubText = 'Start traversing math portals in gameplay to evaluate dynamic math diagnostic ratings.';

  if (totalQuestions > 0) {
    if (overallAccuracy >= 90) {
      performanceRank = 'Arithmancer Supreme';
      rankColorClass = 'text-yellow-400';
      rankSubText = 'Incredible mathematical comprehension! Your strategy and calculation speeds are professional.';
    } else if (overallAccuracy >= 75) {
      performanceRank = 'Squad Commander';
      rankColorClass = 'text-cyan-400';
      rankSubText = 'Solid mathematical intuition and tactical portal-choice control. Keep pushing high scores!';
    } else if (overallAccuracy >= 55) {
      performanceRank = 'Battle Corporal';
      rankColorClass = 'text-indigo-400';
      rankSubText = 'Good basic operational knowledge. Try focusing on the operations with lower accuracy parameters.';
    } else {
      performanceRank = 'Recruit trainee';
      rankColorClass = 'text-rose-400';
      rankSubText = 'Needs calculation refinement. Look at the Review Room of incorrect equations below to learn!';
    }
  }

  // Handle sandbox custom try quiz submission
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForQuiz) return;

    const parsedInput = parseFloat(quizAnswer.trim());
    if (isNaN(parsedInput)) {
      setQuizFeedback({ isCorrect: false, message: 'Please input a valid numeric sum or product.' });
      return;
    }

    // Determine target value for the correct ideal path compared to incorrect
    const targetVal = selectedReviewForQuiz.isBetterChoice 
      ? selectedReviewForQuiz.outcomeValue 
      : selectedReviewForQuiz.alternateValue;

    if (parsedInput === targetVal) {
      setQuizFeedback({
        isCorrect: true,
        message: `🌟 Amazing job! ${parsedInput} is absolutely correct! Parents & commanders approve!`,
      });
    } else {
      setQuizFeedback({
        isCorrect: false,
        message: `❌ Not quite! Review the formula condition: base count was ${selectedReviewForQuiz.initialSoldiers} clones. Target was ${targetVal}.`,
      });
    }
  };

  // Get specific guidance tips per Math Topic
  const getDiagnosticGuidance = (subjectName: string): string => {
    switch (subjectName) {
      case 'Addition':
        return '💡 Combine numbers in blocks of 10s. E.g. for (X + 28), think of it as X + 30 - 2 which is much faster to evaluate in hot patrols!';
      case 'Subtraction':
        return '💡 Subtraction measures distance between numbers. To do (X - 9) quickly, subtract 10 and then add 1 back!';
      case 'Multiplication':
        return '💡 Multiplication is repeated addition of equal groups. Build speed by practicing basic multiplication grids up to 12s.';
      case 'Division':
        return '💡 Remember division is simply inverse multiplication. When evaluating (X ÷ 4), you are finding what number fits 4 times of group size.';
      case 'Algebra':
        return "💡 The Golden Rule of Algebra: Always perform identical operations to both sides of the equal sign to preserve balance!";
      case 'Fractions':
        return '💡 Fractions represent parts of a whole. Multiplying by 1/4 is identical to dividing by 4! Smaller denominators represent larger slices.';
      case 'Percentages':
        return '💡 Percentages are parts out of 100! 50% means exactly half, 10% is division by 10, and 25% is division by 4.';
      case 'Exponents':
        return '💡 Exponents indicate how many times a base number is multiplied by itself. 5² is 5 × 5 = 25, while 2³ is 2 × 2 × 2 = 8!';
      default:
        return '💡 Direct focused operational exercises to establish dynamic operational fluency.';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6 font-mono text-slate-100 select-none pb-20 animate-fade-in">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3 text-left">
          <button
            onClick={onBack}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl transition cursor-pointer"
            title="Return to Main Command"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-5 h-5 text-rose-400" />
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-rose-400">
                After Action Report (AAR)
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              DIAGNOSTIC EDUCATION PORTAL FOR COGNITIVE PROGRESS TRACKING
            </p>
          </div>
        </div>

        {/* VIEW FILTER SETTINGS */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-900 self-start md:self-auto">
          <button
            onClick={() => { setViewScope('current'); setSelectedReviewForQuiz(null); }}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              viewScope === 'current'
                ? 'bg-rose-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🪂 CURRENT MISSION
          </button>
          <button
            onClick={() => { setViewScope('all-time'); setSelectedReviewForQuiz(null); }}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              viewScope === 'all-time'
                ? 'bg-rose-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 ALL-TIME ARCHIVE ({historicalReviews.length})
          </button>
        </div>
      </div>

      {/* CORE RUN STATS STAT BOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/45 border border-slate-800/80 rounded-2xl text-left flex flex-col gap-1">
          <span className="text-[8px] tracking-widest text-slate-500 font-bold uppercase">GLOBAL STATS COUNT</span>
          <span className="text-xl font-black text-white">{totalQuestions}</span>
          <span className="text-[9px] text-slate-400">Traversed Gates</span>
        </div>

        <div className="p-4 bg-slate-900/45 border border-slate-800/80 rounded-2xl text-left flex flex-col gap-1">
          <span className="text-[8px] tracking-widest text-slate-500 font-bold uppercase">DIAGNOSTIC ACCURACY</span>
          <span className={`text-xl font-black ${
            overallAccuracy >= 80 ? 'text-emerald-400' :
            overallAccuracy >= 60 ? 'text-yellow-405 text-yellow-400' : 'text-rose-450 text-rose-400'
          }`}>
            {overallAccuracy}%
          </span>
          <span className="text-[9px] text-slate-400">Optimal Math Choice Rate</span>
        </div>

        <div className="p-4 bg-slate-900/45 border border-slate-800/80 rounded-2xl text-left flex flex-col gap-1">
          <span className="text-[8px] tracking-widest text-slate-500 font-bold uppercase">CORE MATH STRENGTH</span>
          <span className="text-sm font-extrabold text-emerald-400 uppercase truncate mt-1">
            {strongestSubject !== 'None' ? strongestSubject : 'TBD'}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {strongestAcc >= 0 ? `${Math.round(strongestAcc * 100)}% accuracy rate` : 'Complete exercises'}
          </span>
        </div>

        <div className="p-4 bg-slate-900/45 border border-slate-800/80 rounded-2xl text-left flex flex-col gap-1">
          <span className="text-[8px] tracking-widest text-slate-500 font-bold uppercase">SKILL RECOMMENDATION</span>
          <span className="text-sm font-extrabold text-orange-400 uppercase truncate mt-1">
            {weakestSubject !== 'None' && weakestAcc < 100 ? weakestSubject : 'Excelled'}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {weakestAcc < 101 ? `Lowest category: ${Math.round(weakestAcc * 100)}%` : 'Perfect evaluation score'}
          </span>
        </div>
      </div>

      {/* COGNITIVE RANK / DIAGNOSTIC REPORT HEADLINE */}
      <div className="p-4 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 text-left">
        <div className="p-3.5 bg-slate-950 border border-slate-805 border-slate-800/60 rounded-xl shrink-0 flex items-center justify-center">
          <Award className={`w-8 h-8 ${rankColorClass}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-pink-500 font-bold tracking-widest uppercase">DYNAMIC COGNITIVE PATROL RATING</span>
            <span className="bg-rose-950 border border-rose-900/35 text-rose-400 font-mono uppercase text-[7.5px] px-1.5 py-0.5 rounded leading-none">REALTIME</span>
          </div>
          <h2 className={`text-base md:text-lg font-black uppercase mt-0.5 ${rankColorClass}`}>
            {performanceRank}
          </h2>
          <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 leading-normal">
            {rankSubText}
          </p>
        </div>
      </div>

      {/* THREEWAY SUB-TAB SECTION SELECTION */}
      <div className="flex border-b border-slate-800 font-mono text-[10px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-1.5 px-4 py-2 border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-rose-400 text-rose-405 text-rose-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>GRAPHICAL METRICS</span>
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center space-x-1.5 px-4 py-2 border-b-2 transition-all ${
            activeTab === 'performance'
              ? 'border-rose-400 text-rose-405 text-rose-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>CONCEPT ACCURACIES & TUTORIALS</span>
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center space-x-1.5 px-4 py-2 border-b-2 transition-all relative ${
            activeTab === 'review'
              ? 'border-rose-400 text-rose-405 text-rose-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>REVIEW ROOM & SANDBOX QUIZ</span>
          {activeReviews.filter(r => !r.isBetterChoice).length > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-rose-500 text-slate-950 font-black font-sans text-[7.5px] px-1 rounded-full animate-bounce h-3.5 min-w-3.5 flex items-center justify-center">
              {activeReviews.filter(r => !r.isBetterChoice).length}
            </span>
          )}
        </button>
      </div>

      {/* VIEWPORT CONTROLLER CONTENT */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 bg-slate-900/35 border border-slate-800/80 rounded-2xl text-left select-none">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Mathematics Performance Matrix
                </h3>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  Comparison log showing optimal math gate choices vs suboptimal choices per topic.
                </p>
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Interactive Graph</span>
            </div>

            {totalQuestions === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/40 rounded-xl gap-2 py-8 text-center px-4">
                <BarChart2 className="w-8 h-8 text-slate-650 text-slate-600 animate-pulse" />
                <p className="text-[10px] text-slate-400 leading-normal max-w-xs font-mono">
                  There are no math equations logged under the <span className="font-extrabold text-white text-rose-350">{viewScope === 'current' ? 'current' : 'historical'}</span> archive yet. Choose math portals during active gameplay to inspect evaluation charts.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full text-[9px] font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayChartData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#212529" strokeOpacity={0.4} />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Optimal Decisions" name="Optimal Choice (Correct)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Suboptimal Choices" name="Inferior Choice (Better available)" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* PARENT QUICK SUMMARY METRICS CARD */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-left select-none">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-widest flex items-center gap-1.5 text-rose-450 border-b border-rose-900/20 pb-2 mb-3">
              <span>📌 PARENT INTELLIGENCE BRIEF</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px] leading-relaxed">
              <div className="space-y-2">
                <p className="text-slate-300 font-bold">🔍 Diagnostic Summary:</p>
                <p className="text-slate-400">
                  This cognitive tracker logs mathematical portals chosen during defensive runs. Portals are designated as <strong className="text-emerald-450 text-emerald-400">Optimal</strong> if they evaluate to the mathematically superior squad multiplier. Optimal selections allow students to generate larger backup squads to maintain defenses.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-300 font-bold">🎯 Targeted Action Advice:</p>
                {strongestSubject !== 'None' && strongestAcc > 0 ? (
                  <p className="text-slate-400">
                    Your student is excelling in <strong className="text-emerald-400">{strongestSubject}</strong> (accuracy of {Math.round(strongestAcc * 100)}%). However, we recommend focusing practice sessions on <strong className="text-orange-400">{weakestSubject !== 'None' ? weakestSubject : 'Equations'}</strong>, where their decision accuracy is {weakestAcc < 101 ? `${Math.round(weakestAcc * 100)}%` : 'in development'}.
                  </p>
                ) : (
                  <p className="text-slate-400">
                    No active performance baseline established. Maintain high scores and traverse mixed/algebraic gateways to generate fully optimized, actionable analytics grids!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="flex flex-col gap-4 text-left">
          <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-2xl">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3">
              Topic Accuracies & Quick Tutorials
            </h3>
            
            <div className="flex flex-col gap-4">
              {Object.entries(categoryStatsMap).map(([catName, stats], idx) => {
                const total = stats.total;
                const correct = stats.correct;
                const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
                
                // Color mapping logic
                const barColorClass = acc >= 80 ? 'bg-emerald-500' : acc >= 55 ? 'bg-yellow-500' : 'bg-rose-500';
                const textColorClass = acc >= 80 ? 'text-emerald-400' : acc >= 55 ? 'text-yellow-405 text-yellow-400' : 'text-rose-450 text-rose-400';

                return (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-black text-[11px] uppercase">{catName}</span>
                        <span className="text-[8px] text-slate-500">({total} gates faced)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500 font-bold">Accuracy:</span>
                        <span className={`font-black ${textColorClass}`}>{total > 0 ? `${acc}%` : 'No Data'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColorClass} transition-all duration-500`}
                        style={{ width: `${total > 0 ? acc : 0}%` }}
                      />
                    </div>

                    {/* Educational Helper Tip */}
                    <p className="text-[9.5px] text-slate-400 leading-normal italic mt-0.5 bg-slate-900/30 p-2 border border-slate-900/50 rounded-lg">
                      {getDiagnosticGuidance(catName)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
          
          {/* INCORRECT QUESTIONS LIST */}
          <div className="p-4 bg-slate-900/35 border border-slate-800 rounded-2xl md:col-span-7 flex flex-col gap-3">
            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-305 text-slate-300 tracking-wider">
                Incorrect Equation Journal
              </h3>
              <span className="text-[8px] font-mono px-2 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-900/40 rounded-full lowercase font-bold">
                click to try correcting
              </span>
            </div>

            {activeReviews.filter(r => !r.isBetterChoice).length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-950/30 border border-dashed border-slate-850 border-slate-800 rounded-xl gap-1.5">
                <CheckCircle className="w-7 h-7 text-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
                  FLAWLESS RECORD DETECTED!
                </p>
                <p className="text-[9px] text-slate-400 max-w-xs leading-normal">
                  No suboptimal math choices logged in this operational view! Keep up the high calculations accuracy.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {activeReviews.filter(r => !r.isBetterChoice).map((review, rIdx) => {
                  const category = getCategoryLabel(review.mode, review.leftText);
                  return (
                    <div
                      key={review.id || rIdx}
                      onClick={() => {
                        setSelectedReviewForQuiz(review);
                        setQuizAnswer('');
                        setQuizFeedback(null);
                      }}
                      className={`p-3 bg-slate-950 hover:bg-slate-900 border transition-all rounded-xl cursor-pointer flex flex-col gap-1.5 select-none ${
                        selectedReviewForQuiz?.id === review.id 
                          ? 'border-rose-405 border-rose-500' 
                          : 'border-slate-850 hover:border-slate-700 border-slate-800/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7.5px] px-1.5 py-0.5 bg-rose-950 text-rose-400 rounded uppercase font-bold tracking-widest">
                            {category}
                          </span>
                          <span className="text-[8px] text-slate-500">Run dist: {review.distance}M</span>
                        </div>
                        <span className="text-[8px] text-slate-400 text-rose-300 font-black uppercase hover:underline flex items-center gap-1">
                          <span>QUIZ NOW</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 border border-slate-905 border-slate-900/40 rounded-lg text-[9px]">
                        <span className="text-slate-500">Choice:</span>
                        <strong className="text-rose-400 text-[9.5px] bg-slate-950 px-1 py-0.5 rounded border border-rose-950/20">{review.choice === 'left' ? review.leftText : review.rightText}</strong>
                        <span className="text-slate-600">vs</span>
                        <span className="text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded border border-emerald-950/20">{review.choice === 'left' ? review.rightText : review.leftText}</span>
                      </div>
                      
                      <p className="text-[8.5px] text-slate-400 line-clamp-2">
                        {review.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INTERACTIVE QUIZ SIDEBAR PANEL */}
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl md:col-span-5 flex flex-col gap-4.5 select-none">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-801 border-slate-800/60 pb-2 flex items-center gap-1.5">
              <span>🧠 CORRECTION SANDBOX</span>
            </h3>

            {!selectedReviewForQuiz ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-850 border-slate-800 bg-slate-950/30 rounded-xl gap-2 text-center p-4 py-12">
                <Settings className="w-7 h-7 text-slate-700 animate-spin" />
                <p className="text-[10px] text-slate-400 leading-normal font-mono max-w-xs">
                  Select any incorrect equation from the list and test yourself to correct it!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 text-[10px]">
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[7.5px] block text-slate-500 font-bold uppercase mb-1">EQUATION REVIEW UNIT</span>
                  <div className="flex gap-2 items-center bg-slate-900 p-1.5 rounded-lg text-xs justify-center font-bold font-mono">
                    <span className="px-1.5 rounded bg-slate-950 text-slate-300">{selectedReviewForQuiz.leftText}</span>
                    <span className="text-slate-650 text-slate-600">vs</span>
                    <span className="px-1.5 rounded bg-slate-950 text-slate-300">{selectedReviewForQuiz.rightText}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col gap-2">
                  <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">Sandbox Condition:</span>
                  <p className="text-[9.5px] text-slate-350 leading-relaxed">
                     Your squad was patrolling with <strong className="text-white bg-slate-900 px-1 py-0.5 rounded">{selectedReviewForQuiz.initialSoldiers} clones</strong> when they faced this option.
                  </p>
                  <p className="text-[9.5px] text-slate-400 leading-normal border-t border-slate-900 pt-2 font-black text-rose-300">
                    What is the mathematically ideal, maximum output total soldiers for of this gate?
                  </p>
                </div>

                {/* FORM CHECK INPUT */}
                <form onSubmit={handleQuizSubmit} className="flex flex-col gap-2">
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      placeholder="Calculate target outcome..."
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl p-2.5 outline-none font-mono text-center text-xs text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-rose-505 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-xl active:scale-95 transition cursor-pointer text-xs"
                    >
                      CHECK
                    </button>
                  </div>
                </form>

                {quizFeedback && (
                  <div className={`p-3 rounded-xl border text-[9px] leading-relaxed transition-all ${
                    quizFeedback.isCorrect 
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' 
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  }`}>
                    {quizFeedback.message}
                  </div>
                )}

                <div className="text-[8.5px] text-slate-500 leading-normal">
                  ✨ Correcting your errors improves mathematical agility. Check choices carefully!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
