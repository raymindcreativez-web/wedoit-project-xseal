import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  UserCheck, 
  BookOpen, 
  Menu, 
  Bell, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet,
  FileText,
  X,
  Users,
  UserPlus,
  Trash2,
  TableProperties,
  UploadCloud,
  BookOpenCheck,
  ClipboardList,
  Plus,
  Bookmark,
  CalendarDays,
  LayoutGrid,
  BarChart,
  Printer,
  ArrowLeftRight,
  PieChart,
  Upload,
  Contact2,
  Edit2,
  Settings2,
  GripVertical,
  RefreshCw,
  Save,
  ListOrdered,
  FileEdit,
  Activity,
  BellOff
} from 'lucide-react';

// --- UTILITIES ---
const generateScheduleString = (sessions) => {
  if (!sessions || sessions.length === 0) return 'No Schedule';
  const byTime = {};
  sessions.forEach(s => {
    if (!byTime[s.time]) byTime[s.time] = [];
    byTime[s.time].push(s.day);
  });
  return Object.entries(byTime).map(([time, days]) => `${days.map(d=>d.substring(0,3)).join('-')} ${time}`).join(' | ');
};

// Parse a 12-hour time string into total minutes for accurate sorting
const parseTimeToMinutes = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (hours === 12 && modifier === 'AM') hours = 0;
  if (hours !== 12 && modifier === 'PM') hours += 12;
  return hours * 60 + parseInt(minutes, 10);
};

// Format 24-hour input (from input type="time") back to 12-hour "hh:mm AM/PM"
const formatTimeFromInput = (time24) => {
  if (!time24) return '';
  let [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hStr = h < 10 ? '0' + h : h;
  return `${hStr}:${minutes} ${ampm}`;
};

// --- INITIAL MOCK DATA ---
const INITIAL_CLASSES = [
  { id: 'c1', grade: 'Grade 9', section: 'Rizal', subject: 'Mathematics', 
    sessions: [{day: 'Mon', time: '08:00 AM'}, {day: 'Tue', time: '08:00 AM'}, {day: 'Wed', time: '08:00 AM'}, {day: 'Thu', time: '08:00 AM'}],
    schedule: 'Mon-Tue-Wed-Thu 08:00 AM' 
  },
  { id: 'c2', grade: 'Grade 10', section: 'Mabini', subject: 'Science', 
    sessions: [{day: 'Mon', time: '10:00 AM'}, {day: 'Tue', time: '10:00 AM'}, {day: 'Wed', time: '10:00 AM'}, {day: 'Thu', time: '10:00 AM'}],
    schedule: 'Mon-Tue-Wed-Thu 10:00 AM' 
  },
  { id: 'c3', grade: 'Grade 11', section: 'Bonifacio', subject: 'Gen Math', 
    sessions: [{day: 'Mon', time: '01:00 PM'}, {day: 'Tue', time: '01:00 PM'}, {day: 'Wed', time: '01:00 PM'}, {day: 'Thu', time: '01:00 PM'}],
    schedule: 'Mon-Tue-Wed-Thu 01:00 PM' 
  }
];

const INITIAL_TIME_SLOTS = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const INITIAL_STUDENTS = [
  { id: 's1', classId: 'c1', lrn: '109876543210', lastName: 'Dela Cruz', firstName: 'Juan', gender: 'M', address: 'Poblacion', learningStyle: 'Visual', birthMonth: 1, performanceLevel: 'High', role: 'Leader' },
  { id: 's2', classId: 'c1', lrn: '109876543211', lastName: 'Garcia', firstName: 'Maria', gender: 'F', address: 'San Isidro', learningStyle: 'Auditory', birthMonth: 5, performanceLevel: 'Average', role: 'Member' },
  { id: 's3', classId: 'c1', lrn: '109876543212', lastName: 'Reyes', firstName: 'Mark', gender: 'M', address: 'Poblacion', learningStyle: 'Kinesthetic', birthMonth: 8, performanceLevel: 'Average', role: 'Member' },
  { id: 's4', classId: 'c2', lrn: '109876543213', lastName: 'Santos', firstName: 'Ana', gender: 'F', address: 'Bgy 1', learningStyle: 'Visual', birthMonth: 11, performanceLevel: 'High', role: 'Leader' },
  { id: 's5', classId: 'c2', lrn: '109876543214', lastName: 'Bautista', firstName: 'Paul', gender: 'M', address: 'Bgy 2', learningStyle: 'Kinesthetic', birthMonth: 3, performanceLevel: 'Struggling', role: 'Member' },
  { id: 's6', classId: 'c3', lrn: '109876543215', lastName: 'Aquino', firstName: 'Diana', gender: 'F', address: 'Poblacion', learningStyle: 'Auditory', birthMonth: 7, performanceLevel: 'High', role: 'Leader' },
];

const INITIAL_CALENDAR = [
  { id: 1, date: '2026-08-21', title: 'Ninoy Aquino Day', type: 'holiday', reminder: false },
  { id: 2, date: '2026-10-15', title: 'End of Quarter 1', type: 'deadline', reminder: true },
  { id: 3, date: '2026-10-22', title: 'Distribution of Cards', type: 'reminder', reminder: true },
  { id: 4, date: '2026-11-01', title: 'All Saints Day', type: 'holiday', reminder: false },
];

const INITIAL_ASSESSMENTS = [
  { id: 'ww1', classId: 'c1', name: 'Quiz 1', description: 'Equations and inequalities basics.', category: 'WW', maxScore: 20, date: '2026-08-15' },
  { id: 'ww2', classId: 'c1', name: 'Quiz 2', description: 'Factoring polynomials.', category: 'WW', maxScore: 20, date: '2026-08-28' },
  { id: 'pt1', classId: 'c1', name: 'Math Poster', description: 'Real-world math application poster.', category: 'PT', maxScore: 30, date: '2026-08-20' },
  { id: 'pt2', classId: 'c1', name: 'Group Report', description: 'Presenting data findings.', category: 'PT', maxScore: 30, date: '2026-09-10' },
  { id: 'sa1', classId: 'c1', name: 'Unit 1 Test', description: 'Summative assessment covering weeks 1-4.', category: 'SA', maxScore: 50, date: '2026-09-15' },
  { id: 'tea1', classId: 'c1', name: 'Quarter 1 Exam', description: 'Comprehensive Term-End Assessment.', category: 'TEA', maxScore: 50, date: '2026-10-10' },
];

const MOCK_GRADES = {
  's1': { 'ww1': 18, 'ww2': 20, 'pt1': 25, 'pt2': 28, 'sa1': 45, 'tea1': 45 },
  's2': { 'ww1': 20, 'ww2': 20, 'pt1': 30, 'pt2': 30, 'sa1': 40, 'tea1': 48 },
  's3': { 'ww1': 15, 'ww2': 12, 'pt1': 20, 'pt2': 22, 'sa1': 30, 'tea1': 35 },
};

const INITIAL_ANECDOTAL = [
  { id: 'a1', studentId: 's1', date: '2026-06-08', behavior: 'Actively assisted struggling classmates during seatwork on quadratic equations.', action: 'Praised in front of class.', type: 'positive' }
];

const INITIAL_COMPETENCIES = [
  { id: 'comp1', classId: 'c1', code: 'M9GE-IIIa-1', description: 'Illustrates central angles, inscribed angles, secants, and tangents.', status: 'completed', date: '2026-06-05' },
  { id: 'comp2', classId: 'c1', code: 'M9GE-IIIb-1', description: 'Proves theorems related to central angles.', status: 'in-progress', date: '' }
];

const MAX_SCORES = { WW1: 20, WW2: 20, PT1: 30, PT2: 30, QA: 50 };

const calculateDynamicGrade = (scores, classAssessments) => {
  if (!scores) return { initial: 0, transmuted: 0 };
  
  let totals = { WW: 0, PT: 0, SA: 0, TEA: 0 };
  let maxes = { WW: 0, PT: 0, SA: 0, TEA: 0 };

  classAssessments.forEach(a => {
    maxes[a.category] += Number(a.maxScore) || 0;
    totals[a.category] += Number(scores[a.id]) || 0;
  });

  const wwPct = maxes.WW ? (totals.WW / maxes.WW) * 100 : 0;
  const ptPct = maxes.PT ? (totals.PT / maxes.PT) * 100 : 0;
  const saPct = maxes.SA ? (totals.SA / maxes.SA) * 100 : 0;
  const teaPct = maxes.TEA ? (totals.TEA / maxes.TEA) * 100 : 0;

  // Standard Weights adapted for MVP: WW 30%, PT 40%, SA 10%, TEA 20%
  let initial = 0;
  let totalWeight = 0;
  
  if (maxes.WW) { initial += wwPct * 0.30; totalWeight += 0.30; }
  if (maxes.PT) { initial += ptPct * 0.40; totalWeight += 0.40; }
  if (maxes.SA) { initial += saPct * 0.10; totalWeight += 0.10; }
  if (maxes.TEA) { initial += teaPct * 0.20; totalWeight += 0.20; }

  initial = totalWeight > 0 ? (initial / totalWeight) : 0;

  let transmuted = 75;
  if(initial >= 90) transmuted = 95 + (initial-90)*0.5;
  else if(initial >= 80) transmuted = 85 + (initial-80);
  else if(initial >= 70) transmuted = 78 + (initial-70)*0.7;
  else transmuted = 70 + (initial/10);

  return { initial: initial.toFixed(2), transmuted: Math.min(Math.round(transmuted), 100) };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // App Core States
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState(INITIAL_CLASSES[0]?.id || '');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [anecdotal, setAnecdotal] = useState(INITIAL_ANECDOTAL);
  const [competencies, setCompetencies] = useState(INITIAL_COMPETENCIES);
  const [timeSlots, setTimeSlots] = useState(INITIAL_TIME_SLOTS);
  const [grades, setGrades] = useState(MOCK_GRADES);
  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS);
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CALENDAR);

  // Attendance stored by date
  const [attendanceRecords, setAttendanceRecords] = useState({}); 

  useEffect(() => {
    if (classes.length > 0 && !classes.find(c => c.id === selectedClassId)) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => {
      if (!prev[today]) {
        const init = {};
        students.forEach(s => { init[s.id] = 'present'; });
        return { ...prev, [today]: init };
      }
      return prev;
    });
  }, [students]);

  const currentClass = classes.find(c => c.id === selectedClassId) || { grade: 'N/A', section: 'No Class Selected', subject: 'N/A', schedule: 'N/A' };
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <DashboardView setActiveTab={setActiveTab} currentClass={currentClass} students={classStudents} classes={classes} competencies={competencies} selectedClassId={selectedClassId} calendarEvents={calendarEvents} />;
      case 'classes':
        return <ClassesView showToast={showToast} classes={classes} setClasses={setClasses} students={students} setStudents={setStudents} timeSlots={timeSlots} setTimeSlots={setTimeSlots} />;
      case 'roster': 
        return <RosterView showToast={showToast} currentClass={currentClass} students={students} setStudents={setStudents} selectedClassId={selectedClassId} />;
      case 'demographics':
        return <DemographicsView currentClass={currentClass} students={classStudents} />;
      case 'seating':
        return <SeatingView showToast={showToast} currentClass={currentClass} students={classStudents} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />;
      case 'attendance': 
        return <AttendanceView showToast={showToast} currentClass={currentClass} students={classStudents} attendanceRecords={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />;
      case 'grades': 
        return <GradebookView showToast={showToast} currentClass={currentClass} students={classStudents} grades={grades} setGrades={setGrades} assessments={assessments} setAssessments={setAssessments} selectedClassId={selectedClassId} />;
      case 'anecdotal':
        return <AnecdotalView showToast={showToast} currentClass={currentClass} students={classStudents} anecdotal={anecdotal} setAnecdotal={setAnecdotal} />;
      case 'competencies':
        return <CompetenciesView showToast={showToast} currentClass={currentClass} competencies={competencies} setCompetencies={setCompetencies} selectedClassId={selectedClassId} />;
      case 'reports':
        return <ReportsView showToast={showToast} currentClass={currentClass} students={students} anecdotal={anecdotal} competencies={competencies} selectedClassId={selectedClassId} grades={grades} classes={classes} assessments={assessments} />;
      case 'calendar': 
        return <CalendarView showToast={showToast} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} />;
      default: 
        return <DashboardView setActiveTab={setActiveTab} currentClass={currentClass} students={classStudents} classes={classes} competencies={competencies} selectedClassId={selectedClassId} calendarEvents={calendarEvents} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-[#1e3a8a] text-white shadow-xl z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">PROJECT RAI</h1>
          <p className="text-blue-200 text-[10px] leading-tight mt-1 font-medium">Rapid Advancement in Instruction</p>
          <p className="text-blue-200 text-xs mt-3 italic">"Advancing Instruction. Empowering Teachers."</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Bookmark size={18} />} label="My Classes" isActive={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
          <NavItem icon={<Users size={18} />} label="Class Roster" isActive={activeTab === 'roster'} onClick={() => setActiveTab('roster')} />
          <NavItem icon={<PieChart size={18} />} label="Demographics" isActive={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')} />
          <NavItem icon={<LayoutGrid size={18} />} label="Seating Plan" isActive={activeTab === 'seating'} onClick={() => setActiveTab('seating')} />
          <NavItem icon={<UserCheck size={18} />} label="Attendance" isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
          <NavItem icon={<BookOpen size={18} />} label="Class Record" isActive={activeTab === 'grades'} onClick={() => setActiveTab('grades')} />
          <NavItem icon={<ClipboardList size={18} />} label="Anecdotal Logs" isActive={activeTab === 'anecdotal'} onClick={() => setActiveTab('anecdotal')} />
          <NavItem icon={<BookOpenCheck size={18} />} label="Competencies" isActive={activeTab === 'competencies'} onClick={() => setActiveTab('competencies')} />
          <NavItem icon={<BarChart size={18} />} label="Analytics & Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <NavItem icon={<CalendarIcon size={18} />} label="School Calendar" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">R</div>
            <div>
              <p className="text-sm font-medium">Teacher Raymond</p>
              <p className="text-xs text-blue-300">Math Dept.</p>
            </div>
          </div>
          <div className="text-[10px] text-blue-400/80 leading-tight space-y-2">
            <p>©2016-2026 wedoIT™Solutions<br/>All rights reserved</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button className="md:hidden mr-4 p-2 text-slate-500" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
            <h2 className="text-xl font-semibold text-slate-800 capitalize hidden sm:block">{activeTab.replace('-', ' ')}</h2>
            
            {classes.length > 0 && (
              <select 
                className="ml-0 sm:ml-4 bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] max-w-[200px] truncate"
                value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.section} ({c.subject})</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="md:hidden w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-sm">R</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="w-64 bg-[#1e3a8a] text-white h-full relative flex flex-col shadow-2xl">
            <div className="p-4 flex flex-col border-b border-blue-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg">PROJECT RAI</span>
                <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
              </div>
              <p className="text-blue-200 text-[10px] leading-tight mb-3 font-medium">Rapid Advancement in Instruction</p>
              <p className="text-blue-200 text-[10px] italic">"Advancing Instruction. Empowering Teachers."</p>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} />
              <NavItem icon={<Bookmark size={18} />} label="My Classes" isActive={activeTab === 'classes'} onClick={() => { setActiveTab('classes'); setMobileMenuOpen(false); }} />
              <NavItem icon={<Users size={18} />} label="Class Roster" isActive={activeTab === 'roster'} onClick={() => { setActiveTab('roster'); setMobileMenuOpen(false); }} />
              <NavItem icon={<PieChart size={18} />} label="Demographics" isActive={activeTab === 'demographics'} onClick={() => { setActiveTab('demographics'); setMobileMenuOpen(false); }} />
              <NavItem icon={<LayoutGrid size={18} />} label="Seating Plan" isActive={activeTab === 'seating'} onClick={() => { setActiveTab('seating'); setMobileMenuOpen(false); }} />
              <NavItem icon={<UserCheck size={18} />} label="Attendance" isActive={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }} />
              <NavItem icon={<BookOpen size={18} />} label="Class Record" isActive={activeTab === 'grades'} onClick={() => { setActiveTab('grades'); setMobileMenuOpen(false); }} />
              <NavItem icon={<ClipboardList size={18} />} label="Anecdotal Logs" isActive={activeTab === 'anecdotal'} onClick={() => { setActiveTab('anecdotal'); setMobileMenuOpen(false); }} />
              <NavItem icon={<BookOpenCheck size={18} />} label="Competencies" isActive={activeTab === 'competencies'} onClick={() => { setActiveTab('competencies'); setMobileMenuOpen(false); }} />
              <NavItem icon={<BarChart size={18} />} label="Analytics & Reports" isActive={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} />
              <NavItem icon={<CalendarIcon size={18} />} label="School Calendar" isActive={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setMobileMenuOpen(false); }} />
            </nav>

            <div className="p-4 border-t border-blue-800">
              <div className="text-[10px] text-blue-400/80 leading-tight space-y-2">
                <p>©2016-2026 wedoIT™Solutions<br/>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-bounce">
          <CheckCircle2 size={20} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// --- CORE UTILITY COMPONENTS ---

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-700 text-white font-medium shadow-sm' : 'text-blue-100 hover:bg-blue-800'}`}>
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, highlight, subtext }) {
  return (
    <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
      <p className="text-blue-100 text-xs mb-1">{title}</p>
      <p className={`text-xl md:text-2xl font-bold ${highlight ? 'text-[#fbbf24]' : 'text-white'}`}>{value}</p>
      {subtext && <p className="text-[10px] text-blue-200 mt-1">{subtext}</p>}
    </div>
  );
}

function StatCardDark({ title, value, subtext }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <p className="text-slate-500 text-xs mb-1 font-medium">{title}</p>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col items-start h-full group">
      <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors mb-3">{icon}</div>
      <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
    </button>
  );
}

function ProgressBar({ label, value, max, colorClass, onClick }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors group" onClick={onClick}>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700 group-hover:text-[#1e3a8a]">{label}</span>
        <span className="text-slate-500">{percent}% ({value})</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView({ setActiveTab, currentClass, students, classes, competencies, selectedClassId, calendarEvents }) {
  const currentCompetencies = competencies.filter(c => c.classId === selectedClassId);
  const completedCount = currentCompetencies.filter(c => c.status === 'completed').length;
  const coveragePercent = currentCompetencies.length > 0 ? Math.round((completedCount / currentCompetencies.length) * 100) : 0;

  const activeReminders = [...calendarEvents]
     .filter(e => e.reminder)
     .sort((a,b) => new Date(a.date) - new Date(b.date))
     .slice(0,3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Magandang Araw, Teacher Raymond!</h2>
            <p className="text-blue-100 text-sm">Managing instruction progress and daily tasks for {currentClass.grade} - {currentClass.section} ({currentClass.subject}).</p>
          </div>
          <div className="hidden md:flex flex-col items-end bg-black/20 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-blue-200 font-medium uppercase tracking-wider mb-1 flex items-center"><Clock size={12} className="mr-1"/> Class Schedule</span>
            <span className="text-sm font-bold">{currentClass.schedule}</span>
          </div>
        </div>
        
        <div className="md:hidden mt-4 bg-black/20 p-3 rounded-lg border border-white/10 backdrop-blur-sm inline-block">
          <span className="text-xs text-blue-200 font-medium uppercase tracking-wider mb-1 flex items-center"><Clock size={12} className="mr-1"/> Schedule: <span className="text-white font-bold ml-1">{currentClass.schedule}</span></span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard title="Total Handled Classes" value={classes.length} />
          <StatCard title="Section Learners" value={students.length} />
          <StatCard title="Competencies Taught" value={`${coveragePercent}%`} highlight />
          <StatCard title="Current Term" value="Q1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-base text-slate-700">Quick Operations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionCard icon={<Users size={24} className="text-blue-600" />} title="Class Roster" desc="Add/edit learners in bulk" onClick={() => setActiveTab('roster')} />
            <ActionCard icon={<PieChart size={24} className="text-indigo-600" />} title="Demographics" desc="View student profiles" onClick={() => setActiveTab('demographics')} />
            <ActionCard icon={<LayoutGrid size={24} className="text-emerald-600" />} title="Seating & Attendance" desc="Interactive visual plan" onClick={() => setActiveTab('seating')} />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mt-4">
             <h3 className="font-semibold text-base text-slate-700 mb-4 flex items-center"><Bell size={18} className="mr-2 text-amber-500" /> Active Calendar Alarms & Reminders</h3>
             {activeReminders.length > 0 ? (
               <div className="space-y-3">
                 {activeReminders.map(event => (
                   <div key={event.id} className="flex items-center p-3 bg-amber-50/50 border border-amber-100 rounded-lg border-l-4 border-l-amber-400">
                     <div className="flex-1">
                       <p className="text-sm font-bold text-slate-800">{event.title}</p>
                       <p className="text-xs text-slate-500 flex items-center mt-1"><CalendarIcon size={12} className="mr-1"/> {event.date}</p>
                     </div>
                     <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] rounded font-bold uppercase">{event.type}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-slate-500">No active alarms set in the calendar.</p>
             )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base text-slate-700 mb-2 flex items-center"><BookOpenCheck size={18} className="mr-2 text-[#1e3a8a]" /> Pacing Status</h3>
            <p className="text-xs text-slate-500 mb-4">Competency coverage tracker for this handled subject.</p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${coveragePercent}%` }}></div></div>
            <p className="text-xs font-medium text-slate-700 mb-4">{completedCount} of {currentCompetencies.length} completed</p>
          </div>
          <button onClick={() => setActiveTab('competencies')} className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors">Update Competencies List</button>
        </div>
      </div>
    </div>
  );
}

// 1. CLASSES MANAGEMENT VIEW
function ClassesView({ showToast, classes, setClasses, students, setStudents, timeSlots, setTimeSlots }) {
  const [editingId, setEditingId] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDays, setNewDays] = useState(['Mon', 'Tue', 'Wed', 'Thu']);
  const [newTime, setNewTime] = useState('');
  
  const [isManagingBells, setIsManagingBells] = useState(false);
  const [newTimeSlotInput, setNewTimeSlotInput] = useState('');
  const [dragMode, setDragMode] = useState('group'); // 'group' or 'individual'

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  useEffect(() => {
    if (!newTime && timeSlots.length > 0 && !editingId) setNewTime(timeSlots[0]);
  }, [timeSlots, newTime, editingId]);

  const toggleDay = (d) => setNewDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!newGrade || !newSection || !newSubject || newDays.length === 0 || !newTime) return showToast("Please fill all details and select at least one day and time.");
    
    // Conflict detection across all requested new sessions
    let hasConflict = false;
    for (let d of newDays) {
       if (classes.some(c => c.id !== editingId && c.sessions.some(s => s.day === d && s.time === newTime))) {
          hasConflict = true; break;
       }
    }
    if (hasConflict) return showToast("Conflict Detected! One or more selected days at this time are already occupied by another class.");

    const sessions = newDays.map(d => ({day: d, time: newTime}));
    const classObj = { 
      id: editingId || ('c' + Date.now()), 
      grade: newGrade, section: newSection, subject: newSubject, 
      sessions,
      schedule: generateScheduleString(sessions)
    };

    if (editingId) {
      setClasses(classes.map(c => c.id === editingId ? classObj : c));
      showToast(`Class ${newGrade} - ${newSection} updated successfully!`);
    } else {
      setClasses([...classes, classObj]);
      showToast(`Added class ${newGrade} - ${newSection} successfully!`);
    }
    setEditingId(null); setNewGrade(''); setNewSection(''); setNewSubject(''); setNewDays(['Mon', 'Tue', 'Wed', 'Thu']); setNewTime(timeSlots[0] || '');
  };

  const handleEditClass = (c) => {
    setEditingId(c.id); setNewGrade(c.grade); setNewSection(c.section); setNewSubject(c.subject);
    setNewDays([...new Set(c.sessions.map(s => s.day))]); setNewTime(c.sessions[0]?.time || timeSlots[0] || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClass = (classId, className) => {
    setClasses(classes.filter(c => c.id !== classId)); setStudents(students.filter(s => s.classId !== classId));
    if (editingId === classId) { setEditingId(null); setNewGrade(''); setNewSection(''); setNewSubject(''); setNewDays(['Mon', 'Tue', 'Wed', 'Thu']); }
    showToast(`Deleted class ${className}. Students deleted automatically.`);
  };

  const handleAddBell = () => {
    if (!newTimeSlotInput) return showToast("Please select a time.");
    const formattedTime = formatTimeFromInput(newTimeSlotInput);
    
    if (!timeSlots.includes(formattedTime)) {
      const updated = [...timeSlots, formattedTime].sort((a,b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
      setTimeSlots(updated); setNewTimeSlotInput('');
      showToast("Bell time added to matrix.");
    } else {
      showToast("Time slot already exists.");
    }
  };

  const handleDeleteBell = (time) => { setTimeSlots(timeSlots.filter(t => t !== time)); showToast("Bell time removed from matrix."); };
  
  const handleDragStart = (e, classId, sourceDay, sourceTime) => { 
    e.dataTransfer.setData('application/json', JSON.stringify({ classId, sourceDay, sourceTime })); 
  };
  
  const handleDragOver = (e) => { e.preventDefault(); };
  
  const handleDrop = (e, targetDay, targetTime) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;
    const { classId, sourceDay, sourceTime } = JSON.parse(dataStr);
    
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    const dayShift = DAYS.indexOf(targetDay) - DAYS.indexOf(sourceDay);
    let newSessions = [];
    let outOfBounds = false;

    if (dragMode === 'group') {
      newSessions = targetClass.sessions.map(s => {
        const newDayIdx = DAYS.indexOf(s.day) + dayShift;
        if (newDayIdx < 0 || newDayIdx > 4) outOfBounds = true;
        return { day: DAYS[newDayIdx], time: targetTime };
      });
    } else {
      newSessions = targetClass.sessions.map(s => {
        if (s.day === sourceDay && s.time === sourceTime) return { day: targetDay, time: targetTime };
        return s;
      });
    }

    if (outOfBounds) return showToast("Move Aborted: A group move would shift some days outside Monday-Friday.");

    let hasConflict = false;
    for (let s of newSessions) {
      if (classes.some(c => c.id !== classId && c.sessions.some(os => os.day === s.day && os.time === s.time))) {
        hasConflict = true; break;
      }
    }
    
    if (hasConflict) return showToast("Conflict Detected! Time slot already occupied by another class.");

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, sessions: newSessions, schedule: generateScheduleString(newSessions) };
      }
      return c;
    }));
    showToast(`Schedule adjusted successfully!`);
  };

  const isClassInSlot = (c, day, time) => c.sessions.some(s => s.day === day && s.time === time);
  const forceRefreshGrid = () => { setTimeSlots([...timeSlots]); showToast("Schedule grid manually refreshed and synced."); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">My Handled Classes</h2>
          <p className="text-sm text-slate-500">Add, edit, or delete the sections, subjects, and schedules you handle this academic term.</p>
        </div>

        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
            {editingId ? <Edit2 size={16} className="mr-1 text-[#1e3a8a]"/> : <Plus size={16} className="mr-1 text-[#1e3a8a]" />} 
            {editingId ? 'Edit Class Details' : 'Add New Handled Section'}
          </h3>
          <form onSubmit={handleSaveClass} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Grade (e.g. Grade 9)" value={newGrade} onChange={e => setNewGrade(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" required />
              <input type="text" placeholder="Section (e.g. Rizal)" value={newSection} onChange={e => setNewSection(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" required />
              <input type="text" placeholder="Subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" required />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3 flex-wrap">
                <span className="text-xs font-bold text-slate-600 mr-2">Days:</span>
                {DAYS.map(d => (
                  <label key={d} className="flex items-center text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={newDays.includes(d)} onChange={() => toggleDay(d)} className="mr-1.5 h-4 w-4 text-[#1e3a8a] rounded border-slate-300 focus:ring-[#1e3a8a]" /> {d}
                  </label>
                ))}
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-600">Time:</span>
                <select value={newTime} onChange={e => setNewTime(e.target.value)} className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm flex-1 md:w-48 bg-slate-50" required>
                  <option value="" disabled>Select Bell Time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button type="submit" className="px-5 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  {editingId ? 'Update Class' : 'Save Class'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setNewGrade(''); setNewSection(''); setNewSubject(''); setNewDays(['Mon', 'Tue', 'Wed', 'Thu']); setNewTime(timeSlots[0]); }} className="px-3 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.length === 0 ? <p className="text-sm text-slate-500 py-4 col-span-full text-center">No active classes handled.</p> : classes.map(c => {
              const studentCount = students.filter(s => s.classId === c.id).length;
              return (
                <div key={c.id} className={`p-4 border rounded-xl transition-all flex items-start justify-between bg-white ${editingId === c.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}>
                  <div>
                    <h4 className="font-bold text-[#1e3a8a] text-lg">{c.grade} - {c.section}</h4>
                    <p className="text-sm text-slate-700 font-medium mt-1">{c.subject}</p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center"><Clock size={12} className="mr-1"/> {c.schedule}</p>
                    <div className="mt-3 inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{studentCount} Learners</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button onClick={() => handleEditClass(c)} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-[#1e3a8a] rounded-lg transition-colors" title="Edit Class"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClass(c.id, `${c.grade} - ${c.section}`)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Delete Class Section"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center"><CalendarDays size={18} className="mr-2 text-[#1e3a8a]" /> Master Schedule Matrix</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={forceRefreshGrid} className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white text-slate-600 border-slate-300 hover:bg-slate-50 transition-colors flex items-center">
              <RefreshCw size={14} className="mr-1.5" /> Refresh Grid
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setDragMode('group')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${dragMode === 'group' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Move as Group</button>
              <button onClick={() => setDragMode('individual')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${dragMode === 'individual' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Move Individually</button>
            </div>
            <button onClick={() => setIsManagingBells(!isManagingBells)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center ${isManagingBells ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
              <Settings2 size={14} className="mr-1.5" /> Edit Time Bells
            </button>
          </div>
        </div>

        {isManagingBells && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Manage Grid Time Slots</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {timeSlots.map(t => (
                 <span key={t} className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 flex items-center shadow-sm">
                   {t} 
                   <button onClick={() => handleDeleteBell(t)} className="ml-2 text-slate-400 hover:text-red-500 focus:outline-none"><X size={12} /></button>
                 </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input type="time" value={newTimeSlotInput} onChange={e => setNewTimeSlotInput(e.target.value)} className="p-1.5 border border-slate-300 rounded text-sm w-32 focus:ring-2 focus:ring-[#1e3a8a] outline-none cursor-pointer" />
              <button onClick={handleAddBell} className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors">Add Time Row</button>
            </div>
          </div>
        )}

        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3 flex items-center">
          <ArrowLeftRight size={14} className="mr-1.5 inline"/> <strong>Interactive Matrix:</strong> Drag and drop classes horizontally/vertically to auto-update schedules.
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-center border-collapse border border-slate-200 min-w-[700px] select-none">
             <thead>
               <tr>
                 <th className="border border-slate-200 p-3 bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Time / Day</th>
                 {DAYS.map(d => <th key={d} className="border border-slate-200 p-3 bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/5">{d}</th>)}
               </tr>
             </thead>
             <tbody>
               {timeSlots.map(time => (
                 <tr key={time}>
                   <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">{time}</td>
                   {DAYS.map(day => {
                     const matchedClasses = classes.filter(c => isClassInSlot(c, day, time));
                     return (
                       <td 
                         key={`${day}-${time}`} 
                         className="border border-slate-200 p-2 text-xs min-h-[4rem] relative align-top bg-white transition-colors hover:bg-slate-50"
                         onDragOver={handleDragOver}
                         onDrop={(e) => handleDrop(e, day, time)}
                       >
                          {matchedClasses.map(c => (
                            <div 
                              key={c.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, c.id, day, time)}
                              className="group flex flex-col bg-blue-50 border border-blue-200 rounded-lg p-2 mb-1.5 shadow-sm text-left cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors"
                              title={`Drag ${dragMode === 'group' ? 'entire group' : 'individual slot'} to change time`}
                            >
                              <div className="flex justify-between items-start mb-0.5">
                                <p className="font-bold text-[#1e3a8a] text-[11px] leading-tight">{c.grade}-{c.section}</p>
                                <GripVertical size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-slate-600 text-[10px] truncate w-full">{c.subject}</p>
                            </div>
                          ))}
                       </td>
                     );
                   })}
                 </tr>
               ))}
               {timeSlots.length === 0 && (
                 <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-sm">No time bells defined. Add some above.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. ROSTER VIEW
function RosterView({ showToast, currentClass, students, setStudents, selectedClassId }) {
  const [search, setSearch] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const [newStudent, setNewStudent] = useState({ lrn: '', lastName: '', firstName: '', gender: 'M', address: '', learningStyle: 'Unknown', birthMonth: 1, performanceLevel: 'Average', role: 'Member' });
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const handleAddSingle = (e) => {
    e.preventDefault();
    if (!newStudent.lrn || !newStudent.lastName || !newStudent.firstName) return showToast("Please fill up all required fields.");
    const studentObj = { ...newStudent, id: 's' + Math.random().toString(36).substr(2, 9), classId: selectedClassId };
    setStudents([...students, studentObj]);
    setNewStudent({ lrn: '', lastName: '', firstName: '', gender: 'M', address: '', learningStyle: 'Unknown', birthMonth: 1, performanceLevel: 'Average', role: 'Member' });
    showToast(`${newStudent.firstName} added to ${currentClass.section} successfully!`);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return showToast("Please paste student data first.");
    const lines = bulkText.split('\n');
    const newStudents = [];
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        newStudents.push({
          id: 's' + Math.random().toString(36).substr(2, 9), classId: selectedClassId,
          lrn: parts[0], lastName: parts[1], firstName: parts[2], gender: parts[3] || 'M',
          address: parts[4] || 'Unknown', learningStyle: parts[5] || 'Unknown', birthMonth: parseInt(parts[6]) || 1, performanceLevel: parts[7] || 'Average', role: parts[8] || 'Member'
        });
      }
    });
    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setBulkText(''); setIsBulkMode(false);
      showToast(`Successfully imported ${newStudents.length} learners!`);
    } else {
      showToast("Invalid format. Follow the requested CSV structure.");
    }
  };

  const handleDelete = (id, name) => { setStudents(students.filter(s => s.id !== id)); showToast(`${name} removed from roster.`); };
  const filteredStudents = classStudents.filter(s => s.lastName.toLowerCase().includes(search.toLowerCase()) || s.firstName.toLowerCase().includes(search.toLowerCase()) || s.lrn.includes(search));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Class Roster</h2>
          <p className="text-sm text-slate-500">{currentClass.grade} - {currentClass.section} | {classStudents.length} Learners</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button onClick={() => setIsBulkMode(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${!isBulkMode ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Single Add</button>
          <button onClick={() => setIsBulkMode(true)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${isBulkMode ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}><UploadCloud size={14} className="mr-1" /> Bulk Import</button>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
        {isBulkMode ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center"><Upload className="mr-2 text-blue-600" size={16}/> Paste CSV Masterlist</h3>
            <p className="text-xs text-slate-500">Includes advanced personal records mapping. Format: <strong>LRN, Last Name, First Name, Gender(M/F), Address, LearningStyle(Visual/Auditory/Kinesthetic), BirthMonth(1-12), PerformanceLevel, Role</strong></p>
            <textarea 
              className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm font-mono bg-white"
              placeholder="1098712345, Cruz, Juan, M, Poblacion, Visual, 1, High, Leader&#10;1098712346, Santos, Maria, F, Bgy 1, Auditory, 5, Average, Member"
              value={bulkText} onChange={(e) => setBulkText(e.target.value)}
            />
            <button onClick={handleBulkAdd} className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center">Execute Bulk Import</button>
          </div>
        ) : (
          <form onSubmit={handleAddSingle} className="animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center"><Contact2 size={16} className="mr-2 text-blue-600"/> Learner Basic Personal Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <input type="text" placeholder="LRN (12 Digits)" required value={newStudent.lrn} onChange={e => setNewStudent({...newStudent, lrn: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" />
              <input type="text" placeholder="Last Name" required value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" />
              <input type="text" placeholder="First Name" required value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" />
              <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white">
                <option value="M">Male (M)</option><option value="F">Female (F)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="text" placeholder="Barangay / Address" required value={newStudent.address} onChange={e => setNewStudent({...newStudent, address: e.target.value})} className="md:col-span-2 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" />
              <select value={newStudent.learningStyle} onChange={e => setNewStudent({...newStudent, learningStyle: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white">
                <option value="Unknown">-- Learning Style --</option><option value="Visual">Visual</option><option value="Auditory">Auditory</option><option value="Kinesthetic">Kinesthetic</option>
              </select>
              <select value={newStudent.performanceLevel} onChange={e => setNewStudent({...newStudent, performanceLevel: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white">
                <option value="Average">Average</option><option value="High">High Performer</option><option value="Struggling">Needs Intervention</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center justify-center"><UserPlus size={16} className="mr-2" /> Save Record</button>
            </div>
          </form>
        )}
      </div>

      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search roster by name or LRN..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-slate-50" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Learner Details</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-center">Gender</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-center">Address</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-500">No learners registered in this class roster.</td></tr>
            ) : (
              filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{idx + 1}</div>
                      <div>
                        <p className="font-medium text-slate-800">{student.lastName}, {student.firstName}</p>
                        <p className="text-xs text-slate-400 font-mono">LRN: {student.lrn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center"><span className={`px-2 py-1 text-xs rounded-md font-medium ${student.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{student.gender}</span></td>
                  <td className="py-3 px-6 text-center text-xs text-slate-600 font-medium">{student.address}</td>
                  <td className="py-3 px-6 text-right"><button onClick={() => handleDelete(student.id, student.firstName)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. DEMOGRAPHICS VIEW
function DemographicsView({ currentClass, students }) {
  const [modalData, setModalData] = useState(null); 

  if (students.length === 0) {
    return (
      <div className="bg-slate-100 rounded-xl border border-slate-200 p-12 text-center max-w-4xl mx-auto">
        <PieChart size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Demographics Data Available</h2>
        <p className="text-slate-500 font-medium">Please add students to {currentClass.section} in the Class Roster to see their demographics.</p>
      </div>
    );
  }

  const total = students.length;
  const genderCount = { M: 0, F: 0 };
  const prefCount = { Visual: 0, Auditory: 0, Kinesthetic: 0, Unknown: 0 };
  const perfCount = { High: 0, Average: 0, Struggling: 0 };
  const addressCount = {};

  students.forEach(s => {
    genderCount[s.gender] = (genderCount[s.gender] || 0) + 1;
    prefCount[s.learningStyle] = (prefCount[s.learningStyle] || 0) + 1;
    perfCount[s.performanceLevel] = (perfCount[s.performanceLevel] || 0) + 1;
    addressCount[s.address] = (addressCount[s.address] || 0) + 1;
  });

  const showCategoryModal = (title, filterFn) => setModalData({ type: 'category', title, data: students.filter(filterFn) });
  const showStudentModal = (student) => setModalData({ type: 'student', title: 'Student Profile', data: student });

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800">Learner Demographics Profile</h2>
        <p className="text-sm text-slate-500">Visual breakdown of your class composition to aid in differentiated instruction. Click any bar to see specific students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center border-b pb-2"><Users size={16} className="mr-2 text-[#1e3a8a]"/> Sex (Gender) Distribution</h3>
          <ProgressBar label="Male" value={genderCount.M} max={total} colorClass="bg-blue-500" onClick={() => showCategoryModal('Male Students', s => s.gender === 'M')} />
          <ProgressBar label="Female" value={genderCount.F} max={total} colorClass="bg-pink-500" onClick={() => showCategoryModal('Female Students', s => s.gender === 'F')} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center border-b pb-2"><BookOpen size={16} className="mr-2 text-[#1e3a8a]"/> Learning Preference (VAK)</h3>
          <ProgressBar label="Visual Learners" value={prefCount.Visual} max={total} colorClass="bg-emerald-500" onClick={() => showCategoryModal('Visual Learners', s => s.learningStyle === 'Visual')} />
          <ProgressBar label="Auditory Learners" value={prefCount.Auditory} max={total} colorClass="bg-amber-500" onClick={() => showCategoryModal('Auditory Learners', s => s.learningStyle === 'Auditory')} />
          <ProgressBar label="Kinesthetic Learners" value={prefCount.Kinesthetic} max={total} colorClass="bg-purple-500" onClick={() => showCategoryModal('Kinesthetic Learners', s => s.learningStyle === 'Kinesthetic')} />
          {prefCount.Unknown > 0 && <ProgressBar label="Unassessed" value={prefCount.Unknown} max={total} colorClass="bg-slate-300" onClick={() => showCategoryModal('Unassessed Preference', s => s.learningStyle === 'Unknown')} />}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center border-b pb-2"><BarChart size={16} className="mr-2 text-[#1e3a8a]"/> Historic Performance Level</h3>
          <ProgressBar label="High Achievers" value={perfCount.High} max={total} colorClass="bg-[#1e3a8a]" onClick={() => showCategoryModal('High Achievers', s => s.performanceLevel === 'High')} />
          <ProgressBar label="Average Performers" value={perfCount.Average} max={total} colorClass="bg-blue-400" onClick={() => showCategoryModal('Average Performers', s => s.performanceLevel === 'Average')} />
          <ProgressBar label="Struggling / Needs Intervention" value={perfCount.Struggling} max={total} colorClass="bg-red-500" onClick={() => showCategoryModal('Needs Intervention', s => s.performanceLevel === 'Struggling')} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center border-b pb-2"><LayoutGrid size={16} className="mr-2 text-[#1e3a8a]"/> Home Addresses (Barangay)</h3>
          <div className="space-y-2">
            {Object.entries(addressCount).sort((a,b) => b[1] - a[1]).map(([address, count]) => (
              <ProgressBar key={address} label={address} value={count} max={total} colorClass="bg-slate-700" onClick={() => showCategoryModal(`Students from ${address}`, s => s.address === address)} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center"><Contact2 size={18} className="mr-2 text-[#1e3a8a]" /> Directory: Basic Personal Records</h3>
        <p className="text-xs text-slate-500 mb-4">Click any row below to view full student profile details.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">LRN</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Full Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">Sex</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">B.Month</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Address</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Learning Style</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.sort((a,b) => a.lastName.localeCompare(b.lastName)).map((s) => (
                <tr key={s.id} onClick={() => showStudentModal(s)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                  <td className="py-3 px-4 font-mono text-slate-600 text-xs group-hover:text-blue-700">{s.lrn}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-[#1e3a8a]">{s.lastName}, {s.firstName}</td>
                  <td className="py-3 px-4 text-center">{s.gender}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{s.birthMonth}</td>
                  <td className="py-3 px-4 text-slate-600">{s.address}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">{s.learningStyle}</span></td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-medium ${s.performanceLevel === 'High' ? 'bg-blue-50 text-blue-700' : s.performanceLevel === 'Struggling' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{s.performanceLevel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#1e3a8a] text-lg">{modalData.title}</h3>
              <button onClick={() => setModalData(null)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {modalData.type === 'category' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modalData.data.map(s => (
                    <div key={s.id} className="p-3 border border-slate-200 rounded-lg flex items-center space-x-3 hover:border-blue-300">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${s.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>{s.firstName[0]}{s.lastName[0]}</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{s.lastName}, {s.firstName}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">LRN: {s.lrn}</p>
                      </div>
                    </div>
                  ))}
                  {modalData.data.length === 0 && <p className="text-slate-500 text-sm col-span-2">No students match this category.</p>}
                </div>
              )}

              {modalData.type === 'student' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 border-b border-slate-100 pb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-md ${modalData.data.gender === 'M' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}>
                      {modalData.data.firstName[0]}{modalData.data.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">{modalData.data.lastName}, {modalData.data.firstName}</h2>
                      <p className="text-slate-500 font-mono font-medium">{modalData.data.lrn}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sex</p><p className="font-semibold text-slate-800">{modalData.data.gender === 'M' ? 'Male' : 'Female'}</p></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Birth Month</p><p className="font-semibold text-slate-800">Month {modalData.data.birthMonth}</p></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p><p className="font-semibold text-slate-800">{modalData.data.address}</p></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role/Assignment</p><p className="font-semibold text-slate-800">{modalData.data.role}</p></div>
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                       <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider mb-3">Academic & Learning Profile</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-xs text-slate-500 mb-1">Learning Preference</p><p className="font-bold text-slate-700">{modalData.data.learningStyle} Learner</p></div>
                          <div><p className="text-xs text-slate-500 mb-1">Performance Track</p><p className="font-bold text-slate-700">{modalData.data.performanceLevel}</p></div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setModalData(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. FLEXIBLE SEATING ARRANGEMENT & ATTENDANCE VIEW
function SeatingView({ showToast, currentClass, students, attendanceRecords, setAttendanceRecords }) {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [sortBy, setSortBy] = useState('alphabetical');
  const [seatingMap, setSeatingMap] = useState([]);
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);
  const [interactionMode, setInteractionMode] = useState('arrange'); 
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const arrangeSeats = () => {
    let sortedStudents = [...students];
    switch(sortBy) {
      case 'alphabetical': sortedStudents.sort((a, b) => a.lastName.localeCompare(b.lastName)); break;
      case 'gender': sortedStudents.sort((a, b) => a.gender.localeCompare(b.gender) || a.lastName.localeCompare(b.lastName)); break;
      case 'address': sortedStudents.sort((a, b) => (a.address || '').localeCompare(b.address || '')); break;
      case 'birthMonth': sortedStudents.sort((a, b) => (a.birthMonth || 0) - (b.birthMonth || 0)); break;
      case 'performance':
        const perfWeight = { 'High': 1, 'Average': 2, 'Struggling': 3 };
        sortedStudents.sort((a, b) => (perfWeight[a.performanceLevel] || 2) - (perfWeight[b.performanceLevel] || 2)); break;
      case 'learningStyle': sortedStudents.sort((a, b) => (a.learningStyle || '').localeCompare(b.learningStyle || '')); break;
      case 'role':
        const roleWeight = { 'Leader': 1, 'Member': 2 };
        sortedStudents.sort((a, b) => (roleWeight[a.role] || 2) - (roleWeight[b.role] || 2)); break;
      default: break;
    }

    const totalSeats = rows * cols;
    const newMap = new Array(totalSeats).fill(null);
    sortedStudents.forEach((student, index) => { if (index < totalSeats) newMap[index] = student; });
    setSeatingMap(newMap); setSelectedSeatIndex(null);
    showToast(`Arranged ${sortedStudents.length} students by ${sortBy}.`);
  };

  useEffect(() => { arrangeSeats(); }, [students, rows, cols, sortBy]);

  const handleSeatClick = (index) => {
    if (interactionMode === 'attendance') {
      const student = seatingMap[index];
      if (!student) return;
      
      setAttendanceRecords(prev => {
        const dateRecords = prev[currentDate] || {};
        const currentStatus = dateRecords[student.id] || 'present';
        const nextStatus = currentStatus === 'present' ? 'absent' : currentStatus === 'absent' ? 'late' : 'present';
        return { ...prev, [currentDate]: { ...dateRecords, [student.id]: nextStatus } };
      });
      return;
    }

    if (selectedSeatIndex === null) {
      setSelectedSeatIndex(index);
    } else {
      const newMap = [...seatingMap];
      const temp = newMap[index];
      newMap[index] = newMap[selectedSeatIndex];
      newMap[selectedSeatIndex] = temp;
      setSeatingMap(newMap); setSelectedSeatIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-w-6xl mx-auto overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dynamic Seating & Attendance</h2>
          <p className="text-sm text-slate-500">{currentClass.grade} - {currentClass.section} | Customizable grid</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-300">
          <button onClick={() => setInteractionMode('arrange')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${interactionMode === 'arrange' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Edit Seating</button>
          <button onClick={() => setInteractionMode('attendance')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center ${interactionMode === 'attendance' ? 'bg-emerald-500 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}><UserCheck size={14} className="mr-1"/> Check Attendance</button>
        </div>
      </div>

      {interactionMode === 'arrange' && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 border-b border-slate-200 shadow-sm px-6">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Grid:</label>
            <input type="number" min="1" max="10" value={rows} onChange={e => setRows(Number(e.target.value))} className="w-12 p-1 border rounded text-sm text-center focus:ring-1 focus:ring-[#1e3a8a] focus:outline-none" title="Rows" />
            <span className="text-slate-400 text-xs">x</span>
            <input type="number" min="1" max="15" value={cols} onChange={e => setCols(Number(e.target.value))} className="w-12 p-1 border rounded text-sm text-center focus:ring-1 focus:ring-[#1e3a8a] focus:outline-none" title="Columns" />
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Arrange By:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-1.5 border rounded text-sm focus:ring-1 focus:ring-[#1e3a8a] focus:outline-none bg-slate-50">
              <option value="alphabetical">Alphabetical</option><option value="gender">Sex (Gender)</option>
              <option value="performance">Intelligence / Performance</option><option value="role">Leaders & Members</option>
              <option value="learningStyle">Learning Preference</option><option value="address">Home Address</option>
              <option value="birthMonth">Birth Month</option>
            </select>
          </div>
          <button onClick={arrangeSeats} className="px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-bold rounded hover:bg-blue-800 transition-colors">Auto Arrange</button>
        </div>
      )}

      {interactionMode === 'attendance' && (
         <div className="flex flex-wrap items-center gap-3 bg-emerald-50 p-3 border-b border-emerald-200 shadow-sm px-6">
            <label className="text-sm font-bold text-emerald-800 flex items-center"><CalendarIcon size={16} className="mr-2"/> Attendance Date:</label>
            <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} className="p-1.5 border border-emerald-300 rounded text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-800 font-medium"/>
            <span className="text-xs text-emerald-600 ml-4 hidden sm:block">Click on a student's seat to toggle Present (Green), Absent (Red), or Late (Yellow).</span>
         </div>
      )}

      <div className={`p-3 text-center text-sm font-medium border-b border-slate-200 ${interactionMode === 'attendance' ? 'hidden' : 'bg-blue-50 text-blue-700'}`}>
        <span><ArrowLeftRight size={14} className="inline mr-1"/> <strong>Tip:</strong> Click on any two seats to manually swap students.</span>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-100 flex justify-center items-start">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {seatingMap.map((student, idx) => {
            const isSelected = selectedSeatIndex === idx;
            const status = student ? ((attendanceRecords[currentDate] || {})[student.id] || 'present') : null;
            
            let seatClasses = "border-dashed border-slate-300 bg-transparent";
            if (student) {
              if (interactionMode === 'attendance') {
                seatClasses = status === 'present' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : status === 'absent' ? 'border-red-500 bg-red-50 shadow-sm opacity-60' : 'border-amber-400 bg-amber-50 shadow-sm';
              } else {
                seatClasses = isSelected ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 shadow-sm';
              }
            }

            return (
              <div 
                key={idx} onClick={() => handleSeatClick(idx)}
                className={`w-28 h-24 md:w-32 md:h-28 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center p-2 text-center transition-all relative ${seatClasses}`}
              >
                {student ? (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 text-white ${student.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>{student.firstName[0]}{student.lastName[0]}</div>
                    <p className={`text-xs font-bold leading-tight line-clamp-1 ${interactionMode === 'attendance' && status === 'absent' ? 'text-red-700 line-through' : 'text-slate-800'}`}>{student.lastName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate w-full">{student.firstName}</p>
                    
                    {interactionMode === 'arrange' && sortBy === 'role' && student.role === 'Leader' && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" title="Leader"></span>}
                    {interactionMode === 'arrange' && sortBy === 'performance' && student.performanceLevel === 'Struggling' && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" title="Needs Support"></span>}
                    {interactionMode === 'attendance' && <div className={`absolute top-1 right-1 font-black text-xs px-1.5 py-0.5 rounded ${status === 'present' ? 'text-emerald-700 bg-emerald-200' : status === 'absent' ? 'text-red-700 bg-red-200' : 'text-amber-800 bg-amber-200'}`}>{status === 'present' ? 'P' : status === 'absent' ? 'A' : 'L'}</div>}
                  </>
                ) : <span className="text-xs font-medium text-slate-400">Empty Seat</span>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-slate-200 py-3 text-center border-t border-slate-300">
        <span className="px-12 py-2 bg-slate-400 text-white rounded-t-lg text-xs font-bold tracking-widest uppercase">Teacher's Desk (Front)</span>
      </div>
    </div>
  );
}

// 5. DAILY ATTENDANCE VIEW
function AttendanceView({ showToast, currentClass, students, attendanceRecords, setAttendanceRecords }) {
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const attendance = attendanceRecords[currentDate] || {};

  const handleMark = (id, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [currentDate]: { ...(prev[currentDate] || {}), [id]: status }
    }));
  };

  const handleBulkPresent = () => {
    const updated = { ...(attendanceRecords[currentDate] || {}) };
    students.forEach(s => updated[s.id] = 'present');
    setAttendanceRecords(prev => ({ ...prev, [currentDate]: updated }));
    showToast(`All students marked present for ${currentDate}.`);
  };

  const handleExportSheets = () => {
    let csvContent = "data:text/csv;charset=utf-8,LRN,Last Name,First Name,Status,Date\n";
    students.forEach(s => {
      const status = attendance[s.id] || 'present';
      csvContent += `${s.lrn},${s.lastName},${s.firstName},${status},${currentDate}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${currentClass.section}_${currentDate}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast("Downloaded Google Sheets format! File saved locally.");
  };

  const filteredStudents = students.filter(s => s.lastName.toLowerCase().includes(search.toLowerCase()) || s.firstName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daily Attendance List View</h2>
          <p className="text-sm text-slate-500">{currentClass.grade} - {currentClass.section}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportSheets} className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center"><TableProperties size={16} className="mr-2" /> Google Sheets Export</button>
          <button onClick={handleBulkPresent} className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors">Bulk Present</button>
          <button onClick={() => showToast("Saving attendance to local storage index...")} className="px-4 py-2 bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-lg text-sm font-medium shadow-sm transition-colors">Save Record</button>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <label className="text-sm font-bold text-slate-700 ml-2">Date:</label>
          <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="p-1.5 border-none outline-none text-[#1e3a8a] font-bold text-sm cursor-pointer"/>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search student..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] bg-white text-sm shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr><th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Learner</th><th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-center">Status ({currentDate})</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 && <tr><td colSpan="2" className="text-center py-8 text-slate-500">No learners found. Add them to your roster first.</td></tr>}
            {filteredStudents.map((student, idx) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{idx + 1}</div>
                    <div><p className={`font-medium ${attendance[student.id] === 'absent' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{student.lastName}, {student.firstName}</p><p className="text-xs text-slate-400">LRN: {student.lrn}</p></div>
                  </div>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="inline-flex bg-slate-100 rounded-lg p-1">
                    <button onClick={() => handleMark(student.id, 'present')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-all ${attendance[student.id] === 'present' || !attendance[student.id] ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}><CheckCircle2 size={14} className="mr-1" /> P</button>
                    <button onClick={() => handleMark(student.id, 'absent')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-all ${attendance[student.id] === 'absent' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}><XCircle size={14} className="mr-1" /> A</button>
                    <button onClick={() => handleMark(student.id, 'late')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center transition-all ${attendance[student.id] === 'late' ? 'bg-[#fbbf24] text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}><Clock size={14} className="mr-1" /> L</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 6. GRADEBOOK VIEW
function GradebookView({ showToast, currentClass, students, grades, setGrades, assessments, setAssessments, selectedClassId }) {
  const [viewMode, setViewMode] = useState('record');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [localGrades, setLocalGrades] = useState({});

  const [newAssmt, setNewAssmt] = useState({ name: '', date: '', description: '', category: 'WW', maxScore: 10 });
  const [activeAssmtModal, setActiveAssmtModal] = useState(null);

  const classAssessments = assessments.filter(a => a.classId === selectedClassId);
  const wwAssessments = classAssessments.filter(a => a.category === 'WW');
  const ptAssessments = classAssessments.filter(a => a.category === 'PT');
  const saAssessments = classAssessments.filter(a => a.category === 'SA');
  const teaAssessments = classAssessments.filter(a => a.category === 'TEA');

  useEffect(() => { setLocalGrades(grades); }, [grades, isEditing]);

  const handleExport = (type) => showToast(`Generating ${type} report form for ${currentClass.section}...`);

  const handleScoreChange = (studentId, field, val) => {
    setLocalGrades(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [field]: val } }));
  };

  const handleSaveGrades = () => {
    setGrades(localGrades); setIsEditing(false); showToast("Student scores have been saved successfully!");
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return showToast("Paste CSV data first.");
    const lines = bulkText.split('\n');
    const newGrades = { ...grades };
    let imported = 0;
    const orderedIds = classAssessments.map(a => a.id);

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) { 
        const student = students.find(s => s.lrn === parts[0]);
        if (student) {
          const studentScores = { ...(newGrades[student.id] || {}) };
          orderedIds.forEach((assmtId, idx) => {
             if(parts[idx + 1]) studentScores[assmtId] = parseFloat(parts[idx + 1]) || 0;
          });
          newGrades[student.id] = studentScores; imported++;
        }
      }
    });
    setGrades(newGrades); setBulkText(''); setIsBulkMode(false);
    showToast(`Bulk imported scores for ${imported} learners!`);
  };

  const handleAddAssessment = (e) => {
    e.preventDefault();
    if(!newAssmt.name || !newAssmt.date || !newAssmt.maxScore) return showToast("Please complete required fields.");
    const id = `${newAssmt.category.toLowerCase()}_${Date.now()}`;
    const newObj = { ...newAssmt, id, classId: selectedClassId };
    setAssessments([...assessments, newObj]);
    setNewAssmt({ name: '', date: '', description: '', category: 'WW', maxScore: 10 });
    showToast(`Added new assessment: ${newObj.name}`);
  };

  const openAssmtDetails = (assmt) => {
    const scores = students.map(s => Number((grades[s.id] || {})[assmt.id] || 0));
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length) : 0;
    const passRate = scores.length ? Math.round((scores.filter(sc => (sc/assmt.maxScore) >= 0.75).length / scores.length)*100) : 0;

    setActiveAssmtModal({
       ...assmt, avgScore: avg.toFixed(1), passRate,
       analysis: `The class achieved a ${passRate}% passing rate. Item analysis indicates mastery in foundational knowledge, but significant difficulty with application and synthesis questions.`,
       recommendation: `Incorporate more guided practice on real-world application scenarios. Re-teach the specific competencies tied to the most missed items before proceeding.`,
       intervention: `Schedule a 15-minute pull-out session for the ${100 - passRate}% of learners who scored below the standard threshold. Provide them with alternative simplified worksheets.`
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-w-6xl mx-auto">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">E-Class Record (Gradebook)</h2>
          <p className="text-sm text-slate-500">Quarter 1 | {currentClass.grade} - {currentClass.section}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
            <button onClick={() => setViewMode('record')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'record' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Class Record</button>
            <button onClick={() => setViewMode('assessments')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'assessments' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}><BookOpenCheck size={14} className="mr-1" /> Manage Assessments</button>
          </div>

          {viewMode === 'record' && (
            isEditing ? (
              <button onClick={handleSaveGrades} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"><Save size={16} className="mr-2"/> Save Grades</button>
            ) : (
              <>
                <button onClick={() => setIsBulkMode(!isBulkMode)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${isBulkMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-[#1e3a8a] hover:bg-slate-200'}`}><UploadCloud size={16} className="mr-2"/> Bulk Scores</button>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"><Edit2 size={16} className="mr-2"/> Input Grades</button>
                <button onClick={() => handleExport('Excel')} className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"><FileSpreadsheet size={16} /></button>
              </>
            )
          )}
        </div>
      </div>

      {viewMode === 'assessments' ? (
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 flex flex-col gap-6">
           <form onSubmit={handleAddAssessment} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-[#1e3a8a] mb-4 flex items-center"><FileEdit size={16} className="mr-2"/> Add New Assessment Task</h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
               <input type="text" placeholder="Assessment Name (e.g. Quiz 1)" value={newAssmt.name} onChange={e => setNewAssmt({...newAssmt, name: e.target.value})} className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm" required />
               <input type="date" value={newAssmt.date} onChange={e => setNewAssmt({...newAssmt, date: e.target.value})} className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm text-slate-700" required />
               <select value={newAssmt.category} onChange={e => setNewAssmt({...newAssmt, category: e.target.value})} className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm">
                 <option value="WW">Written Work</option><option value="PT">Performance Task</option>
                 <option value="SA">Summative Assessment</option><option value="TEA">Term-End Assessment</option>
               </select>
               <input type="number" placeholder="Highest Possible Score" min="1" value={newAssmt.maxScore} onChange={e => setNewAssmt({...newAssmt, maxScore: Number(e.target.value)})} className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm" required />
             </div>
             <textarea placeholder="Description / Competency Covered" value={newAssmt.description} onChange={e => setNewAssmt({...newAssmt, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm mb-4 h-20 resize-none" />
             <button type="submit" className="px-5 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">Create Assessment</button>
           </form>

           <div className="space-y-6">
             {[{title: 'Written Works', data: wwAssessments}, {title: 'Performance Tasks', data: ptAssessments}, {title: 'Summative Assessments', data: saAssessments}, {title: 'Term-End Assessments', data: teaAssessments}].map((group, idx) => (
                <div key={idx}>
                  <h4 className="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-1">{group.title} ({group.data.length})</h4>
                  {group.data.length === 0 ? <p className="text-sm text-slate-400 italic">No assessments added to this category.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {group.data.map(a => (
                        <div key={a.id} onClick={() => openAssmtDetails(a)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#1e3a8a] cursor-pointer transition-colors group">
                          <div className="flex justify-between items-start mb-2"><h5 className="font-bold text-slate-800 group-hover:text-[#1e3a8a]">{a.name}</h5><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{a.maxScore} pts</span></div>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.description || 'No description provided.'}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center"><CalendarIcon size={12} className="mr-1"/> {a.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             ))}
           </div>
           
           {activeAssmtModal && (
             <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <div>
                     <h3 className="font-bold text-[#1e3a8a] text-lg">{activeAssmtModal.name}</h3>
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{activeAssmtModal.category === 'WW' ? 'Written Work' : activeAssmtModal.category === 'PT' ? 'Performance Task' : activeAssmtModal.category === 'SA' ? 'Summative Assessment' : 'Term-End Assessment'} • {activeAssmtModal.date}</p>
                   </div>
                   <button onClick={() => setActiveAssmtModal(null)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors"><X size={20}/></button>
                 </div>
                 <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                      <p className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded border border-slate-100">{activeAssmtModal.description}</p>
                      <div className="grid grid-cols-3 gap-4 mb-2 text-center">
                        <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Max Score</p><p className="text-xl font-bold text-slate-800">{activeAssmtModal.maxScore}</p></div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Class Average</p><p className="text-xl font-bold text-blue-600">{activeAssmtModal.avgScore}</p></div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Passing Rate</p><p className={`text-xl font-bold ${activeAssmtModal.passRate >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>{activeAssmtModal.passRate}%</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center mb-2"><Activity size={16} className="mr-2 text-[#1e3a8a]"/> Automated Item Analysis</h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100">{activeAssmtModal.analysis}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><h4 className="font-bold text-emerald-800 text-sm mb-2">Teaching Recommendations</h4><p className="text-sm text-emerald-700 leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-100">{activeAssmtModal.recommendation}</p></div>
                      <div><h4 className="font-bold text-amber-800 text-sm mb-2">Intervention Plan</h4><p className="text-sm text-amber-700 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">{activeAssmtModal.intervention}</p></div>
                    </div>
                 </div>
                 <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                   <button onClick={() => setActiveAssmtModal(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors">Close Details</button>
                 </div>
               </div>
             </div>
           )}
        </div>
      ) : (
        <>
          {isBulkMode && !isEditing && (
            <div className="p-4 bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center mb-2"><Upload className="mr-2 text-blue-600" size={16}/> Paste Scores CSV</h3>
              <p className="text-xs text-slate-500 mb-3">Copy directly from your Excel tracker. Format: <strong>LRN, {classAssessments.map(a => a.name).join(', ')}</strong></p>
              <textarea 
                className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm font-mono bg-white"
                placeholder={`109876543210, ${classAssessments.map(()=>'15').join(', ')}\n109876543211, ${classAssessments.map(()=>'20').join(', ')}`}
                value={bulkText} onChange={(e) => setBulkText(e.target.value)}
              />
              <button onClick={handleBulkAdd} className="mt-3 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center">Process Upload</button>
            </div>
          )}
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th rowSpan={2} className="py-2 px-4 text-xs font-semibold text-slate-600 border-r border-slate-200 bg-slate-50">Learner Name</th>
                  <th colSpan={wwAssessments.length || 1} className="py-2 px-4 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 bg-blue-50/50">Written Works (30%)</th>
                  <th colSpan={ptAssessments.length || 1} className="py-2 px-4 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 bg-amber-50/50">Perf. Tasks (40%)</th>
                  <th colSpan={saAssessments.length || 1} className="py-2 px-4 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 bg-emerald-50/50">Summative (10%)</th>
                  <th colSpan={teaAssessments.length || 1} className="py-2 px-4 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 bg-purple-50/50">Term-End (20%)</th>
                  <th rowSpan={2} className="py-2 px-4 text-xs font-bold text-slate-700 text-center bg-slate-100 border-r border-slate-200">Initial</th>
                  <th rowSpan={2} className="py-2 px-4 text-xs font-bold text-[#1e3a8a] text-center bg-blue-100">Final Grade</th>
                </tr>
                <tr>
                  {wwAssessments.length ? wwAssessments.map(a => <th key={a.id} className="py-2 px-4 text-[10px] text-slate-500 text-center border-r border-slate-200 bg-blue-50/30" title={a.name}>{a.name.substring(0,8)} ({a.maxScore})</th>) : <th className="py-2 px-4 text-xs text-slate-400 text-center border-r border-slate-200 bg-blue-50/30">-</th>}
                  {ptAssessments.length ? ptAssessments.map(a => <th key={a.id} className="py-2 px-4 text-[10px] text-slate-500 text-center border-r border-slate-200 bg-amber-50/30" title={a.name}>{a.name.substring(0,8)} ({a.maxScore})</th>) : <th className="py-2 px-4 text-xs text-slate-400 text-center border-r border-slate-200 bg-amber-50/30">-</th>}
                  {saAssessments.length ? saAssessments.map(a => <th key={a.id} className="py-2 px-4 text-[10px] text-slate-500 text-center border-r border-slate-200 bg-emerald-50/30" title={a.name}>{a.name.substring(0,8)} ({a.maxScore})</th>) : <th className="py-2 px-4 text-xs text-slate-400 text-center border-r border-slate-200 bg-emerald-50/30">-</th>}
                  {teaAssessments.length ? teaAssessments.map(a => <th key={a.id} className="py-2 px-4 text-[10px] text-slate-500 text-center border-r border-slate-200 bg-purple-50/30" title={a.name}>{a.name.substring(0,8)} ({a.maxScore})</th>) : <th className="py-2 px-4 text-xs text-slate-400 text-center border-r border-slate-200 bg-purple-50/30">-</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-slate-500">No students registered. Add learners in Class Roster.</td></tr>}
                {students.map((student) => {
                  const scores = isEditing ? localGrades[student.id] : grades[student.id];
                  const calculated = calculateDynamicGrade(scores, classAssessments);
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 border-r border-slate-200 font-medium text-slate-800 text-sm">{student.lastName}, {student.firstName}</td>
                      {wwAssessments.length ? wwAssessments.map(a => (
                        <td key={a.id} className="py-1 px-2 border-r border-slate-200 text-center">
                          {isEditing ? <input type="number" min="0" max={a.maxScore} value={scores?.[a.id] || ''} onChange={e => handleScoreChange(student.id, a.id, e.target.value)} className="w-12 p-1 border rounded text-center text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none" /> : <span className="text-sm">{scores?.[a.id] ?? '-'}</span>}
                        </td>
                      )) : <td className="py-2.5 px-4 text-center border-r border-slate-200 text-sm text-slate-400">-</td>}

                      {ptAssessments.length ? ptAssessments.map(a => (
                        <td key={a.id} className="py-1 px-2 border-r border-slate-200 text-center">
                          {isEditing ? <input type="number" min="0" max={a.maxScore} value={scores?.[a.id] || ''} onChange={e => handleScoreChange(student.id, a.id, e.target.value)} className="w-12 p-1 border rounded text-center text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none" /> : <span className="text-sm">{scores?.[a.id] ?? '-'}</span>}
                        </td>
                      )) : <td className="py-2.5 px-4 text-center border-r border-slate-200 text-sm text-slate-400">-</td>}

                      {saAssessments.length ? saAssessments.map(a => (
                        <td key={a.id} className="py-1 px-2 border-r border-slate-200 text-center">
                          {isEditing ? <input type="number" min="0" max={a.maxScore} value={scores?.[a.id] || ''} onChange={e => handleScoreChange(student.id, a.id, e.target.value)} className="w-12 p-1 border rounded text-center text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none" /> : <span className="text-sm">{scores?.[a.id] ?? '-'}</span>}
                        </td>
                      )) : <td className="py-2.5 px-4 text-center border-r border-slate-200 text-sm text-slate-400">-</td>}

                      {teaAssessments.length ? teaAssessments.map(a => (
                        <td key={a.id} className="py-1 px-2 border-r border-slate-200 text-center">
                          {isEditing ? <input type="number" min="0" max={a.maxScore} value={scores?.[a.id] || ''} onChange={e => handleScoreChange(student.id, a.id, e.target.value)} className="w-12 p-1 border rounded text-center text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none" /> : <span className="text-sm font-medium">{scores?.[a.id] ?? '-'}</span>}
                        </td>
                      )) : <td className="py-2.5 px-4 text-center border-r border-slate-200 text-sm text-slate-400">-</td>}
                      
                      <td className="py-2.5 px-4 text-center border-r border-slate-200 text-sm text-slate-500 bg-slate-50">{calculated.initial}</td>
                      <td className="py-2.5 px-4 text-center text-sm font-bold text-[#1e3a8a] bg-blue-50/50">{calculated.transmuted}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// 7. ANECDOTAL RECORDS VIEW
function AnecdotalView({ showToast, currentClass, students, anecdotal, setAnecdotal }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [behaviorText, setBehaviorText] = useState('');
  const [actionText, setActionText] = useState('');
  const [logType, setLogType] = useState('positive');

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!selectedStudentId || !behaviorText || !actionText) return showToast("Please complete all log fields.");
    const newLog = { id: 'a' + (anecdotal.length + 1), studentId: selectedStudentId, date: new Date().toISOString().split('T')[0], behavior: behaviorText, action: actionText, type: logType };
    setAnecdotal([newLog, ...anecdotal]);
    setBehaviorText(''); setActionText('');
    showToast("Anecdotal entry saved successfully!");
  };

  const handleDeleteLog = (id) => { setAnecdotal(anecdotal.filter(a => a.id !== id)); showToast("Anecdotal log deleted."); };
  const classStudentIds = students.map(s => s.id);
  const filteredLogs = anecdotal.filter(log => classStudentIds.includes(log.studentId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800">Anecdotal Records</h2>
        <p className="text-sm text-slate-500">Record classroom behaviors, critical incidents, and actions taken for guidance/counseling filing.</p>
        
        <form onSubmit={handleAddLog} className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Log Student Behavior incident</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Select Student</label>
              <select className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required>
                <option value="">-- Select Learner --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Behavior Type</label>
              <select className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none" value={logType} onChange={e => setLogType(e.target.value)}>
                <option value="positive">Positive / Exemplary Behavior</option><option value="improvement">Needs Improvement</option>
              </select>
            </div>
            <div className="flex items-end"><button type="submit" className="w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">Save Anecdotal Record</button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Observation Details</label><textarea placeholder="Observed behavior, context, setting..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none h-20 resize-none" value={behaviorText} onChange={e => setBehaviorText(e.target.value)} required /></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Action Taken</label><textarea placeholder="Guidance measures, home-visitation, parental callback, warning, etc." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none h-20 resize-none" value={actionText} onChange={e => setActionText(e.target.value)} required /></div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4">Observation Log Feed - {currentClass.section}</h3>
        {filteredLogs.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">No anecdotal logs recorded for this section.</p> : (
          <div className="space-y-4">
            {filteredLogs.map(log => {
              const student = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="p-4 border border-slate-200 rounded-xl relative hover:border-slate-300 transition-all">
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${log.type === 'positive' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{log.type}</span>
                    <button onClick={() => handleDeleteLog(log.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="mb-2"><h4 className="font-bold text-slate-800 text-sm">{student ? `${student.lastName}, ${student.firstName}` : 'Unknown Student'}</h4><p className="text-[10px] text-slate-400 font-medium">Logged Date: {log.date}</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div><p className="font-bold text-slate-500 mb-0.5">Observation:</p><p className="text-slate-700 leading-relaxed">{log.behavior}</p></div>
                    <div><p className="font-bold text-slate-500 mb-0.5">Action Taken:</p><p className="text-slate-700 leading-relaxed">{log.action}</p></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 8. COMPETENCIES VIEW
function CompetenciesView({ showToast, currentClass, competencies, setCompetencies, selectedClassId }) {
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const currentCompetencies = competencies.filter(c => c.classId === selectedClassId);

  const handleAddCompetency = (e) => {
    e.preventDefault();
    if (!newCode || !newDesc) return showToast("Please enter both Competency Code and Description.");
    setCompetencies([...competencies, { id: 'comp' + (competencies.length + 1), classId: selectedClassId, code: newCode, description: newDesc, status: 'pending', date: '' }]);
    setNewCode(''); setNewDesc(''); showToast(`Added competency ${newCode}!`);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return showToast("Please paste competency data first.");
    const lines = bulkText.split('\n');
    const newComps = [];
    lines.forEach(line => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        newComps.push({
          id: 'comp_bulk_' + Math.random().toString(36).substr(2, 9), classId: selectedClassId, code: parts[0].trim(), description: parts.slice(1).join(',').trim(), status: 'pending', date: ''
        });
      }
    });
    if (newComps.length > 0) { setCompetencies([...competencies, ...newComps]); setBulkText(''); setIsBulkMode(false); showToast(`Successfully imported ${newComps.length} competencies!`); } 
    else { showToast("Invalid format. Please use: Code, Description"); }
  };

  const handleUpdateStatus = (id, newStatus) => {
    const today = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : '';
    setCompetencies(competencies.map(c => c.id === id ? { ...c, status: newStatus, date: today } : c));
    showToast(`Updated competency status to ${newStatus}.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Learning Competencies Tracker</h2>
            <p className="text-sm text-slate-500">Track your pacing and coverage against the DepEd MATATAG curriculum guidelines for {currentClass.subject}.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setIsBulkMode(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${!isBulkMode ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Single Add</button>
            <button onClick={() => setIsBulkMode(true)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${isBulkMode ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}><UploadCloud size={14} className="mr-1" /> Bulk Import</button>
          </div>
        </div>

        {isBulkMode ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800 flex items-center"><Upload className="mr-2 text-blue-600" size={16}/> Paste Competencies (CSV/Tab)</h3>
            <textarea className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none text-sm font-mono bg-white" placeholder="M9GE-IIIa-1, Illustrates central angles and arcs" value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
            <button onClick={handleBulkAdd} className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center">Execute Bulk Import</button>
          </div>
        ) : (
          <form onSubmit={handleAddCompetency} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-[#1e3a8a]">Register Single Curriculum Competency</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" placeholder="Competency Code" value={newCode} onChange={e => setNewCode(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white md:col-span-1" required />
              <input type="text" placeholder="Competency Statement / Description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white md:col-span-2" required />
              <button type="submit" className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">Add Objective</button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4">Competency Pacing Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Code</th><th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Description</th><th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th><th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">Date Fully Taught</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentCompetencies.length === 0 ? <tr><td colSpan="4" className="py-6 text-center text-slate-500">No registered competencies found. Input a standard curriculum goal above.</td></tr> : currentCompetencies.map(comp => (
                  <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-700 font-mono">{comp.code}</td><td className="py-4 px-4 text-slate-600 font-medium max-w-sm truncate whitespace-normal">{comp.description}</td>
                    <td className="py-4 px-4 text-center">
                      <select value={comp.status} onChange={e => handleUpdateStatus(comp.id, e.target.value)} className={`p-1.5 rounded-lg border text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${comp.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : comp.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <option value="pending">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed / Fully Taught</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 font-mono">{comp.status === 'completed' ? comp.date : '—'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 9. PROGRESS REPORTS VIEW (With Student Ranking)
function ReportsView({ showToast, currentClass, students, anecdotal, competencies, selectedClassId, grades, classes, assessments }) {
  const [reportType, setReportType] = useState('class');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rankingScope, setRankingScope] = useState('section'); // 'section' or 'grade'

  const currentCompetencies = competencies.filter(c => c.classId === selectedClassId);
  const compCoverage = currentCompetencies.length ? Math.round((currentCompetencies.filter(c => c.status === 'completed').length / currentCompetencies.length) * 100) : 0;
  
  // Dynamic Ranking Logic
  const targetStudents = rankingScope === 'section' 
    ? students.filter(s => s.classId === selectedClassId)
    : students.filter(s => {
        const c = classes.find(cl => cl.id === s.classId);
        return c && c.grade === currentClass.grade && c.subject === currentClass.subject; 
      });

  const rankedStudents = targetStudents.map(s => {
    const classAssessments = assessments.filter(a => a.classId === s.classId);
    const g = grades[s.id] ? calculateDynamicGrade(grades[s.id], classAssessments).transmuted : 0;
    const parentClass = classes.find(c => c.id === s.classId) || currentClass;
    return { ...s, finalGrade: Number(g) || 0, classNameStr: `${parentClass.grade} - ${parentClass.section}` };
  }).sort((a,b) => b.finalGrade - a.finalGrade);

  let totalGrade = 0, gradedStudents = 0;
  rankedStudents.forEach(s => { if (s.finalGrade > 0) { totalGrade += s.finalGrade; gradedStudents++; }});
  const avgGrade = gradedStudents ? Math.round(totalGrade / gradedStudents) : 0;

  const handlePrint = () => { showToast("Generating official printable PDF report..."); setTimeout(() => window.print(), 500); };
  const activeStudent = students.find(s => s.id === selectedStudentId);
  
  const classAssessments = assessments.filter(a => a.classId === selectedClassId);
  const activeStudentGrades = activeStudent ? calculateDynamicGrade(grades[activeStudent.id], classAssessments) : null;
  const activeStudentLogs = activeStudent ? anecdotal.filter(a => a.studentId === activeStudent.id) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:space-y-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div><h2 className="text-xl font-bold text-slate-800">Progress Reports & Analytics</h2><p className="text-sm text-slate-500">Generate class office summaries or individual parent-teacher reports.</p></div>
        <div className="flex space-x-2">
          <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
            <button onClick={() => setReportType('class')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${reportType === 'class' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Class Summary</button>
            <button onClick={() => setReportType('individual')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${reportType === 'individual' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-500 hover:text-slate-700'}`}>Individual Learner</button>
          </div>
          <button onClick={handlePrint} className="px-4 py-1.5 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center"><Printer size={16} className="mr-2" /> Print</button>
        </div>
      </div>

      {reportType === 'class' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-none print:shadow-none print:p-0">
          <div className="text-center mb-8 border-b-2 border-[#1e3a8a] pb-6">
            <h1 className="text-2xl font-bold text-[#1e3a8a] uppercase tracking-wide">Official Class Progress Report</h1>
            <p className="text-sm font-medium text-slate-600 mt-1">S.Y. 2026-2027 | Quarter 1</p>
            <div className="flex justify-center gap-8 mt-4 text-sm font-medium text-slate-800">
              <p>Section: <span className="text-blue-600">{currentClass.grade} - {currentClass.section}</span></p>
              <p>Subject: <span className="text-blue-600">{currentClass.subject}</span></p>
              <p>Adviser/Teacher: <span className="text-blue-600">Raymond</span></p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <StatCardDark title={`${rankingScope === 'section' ? 'Section' : 'Grade Level'} Average`} value={`${avgGrade}%`} subtext="Based on transmuted scores" />
             <StatCardDark title="Competency Coverage" value={`${compCoverage}%`} subtext="Budget of Work Progress" />
             <StatCardDark title="Total Evaluated" value={rankedStudents.length} subtext="Active Learners in Roster" />
          </div>

          <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-lg flex items-center"><ListOrdered size={18} className="mr-2 text-[#1e3a8a]"/> Learner Masterlist & Academic Ranking</h3>
            <select value={rankingScope} onChange={e => setRankingScope(e.target.value)} className="p-1.5 border border-slate-200 rounded text-xs font-bold text-slate-600 focus:ring-1 focus:ring-[#1e3a8a] outline-none bg-slate-50 print:hidden cursor-pointer">
               <option value="section">Rank Within Section ({currentClass.section})</option>
               <option value="grade">Rank Across Grade Level ({currentClass.grade})</option>
            </select>
          </div>

          <table className="w-full text-left border-collapse border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2 px-4 border border-slate-200 text-xs font-bold text-[#1e3a8a] uppercase text-center w-16">Rank</th>
                <th className="py-2 px-4 border border-slate-200 text-xs font-semibold text-slate-600 uppercase">Learner Name</th>
                {rankingScope === 'grade' && <th className="py-2 px-4 border border-slate-200 text-xs font-semibold text-slate-600 uppercase text-center">Section</th>}
                <th className="py-2 px-4 border border-slate-200 text-xs font-semibold text-slate-600 uppercase text-center">Gender</th>
                <th className="py-2 px-4 border border-slate-200 text-xs font-semibold text-slate-600 uppercase text-center">Final Grade</th>
                <th className="py-2 px-4 border border-slate-200 text-xs font-semibold text-slate-600 uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rankedStudents.map((s, idx) => {
                const status = s.finalGrade ? (s.finalGrade >= 75 ? 'Passed' : 'Needs Intervention') : 'No Data';
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2 px-4 border border-slate-200 text-center font-black text-slate-500 bg-slate-50">{s.finalGrade > 0 ? `#${idx + 1}` : '—'}</td>
                    <td className="py-2 px-4 border border-slate-200 font-medium text-slate-800">{s.lastName}, {s.firstName}</td>
                    {rankingScope === 'grade' && <td className="py-2 px-4 border border-slate-200 text-center text-xs font-medium text-slate-600">{s.classNameStr}</td>}
                    <td className="py-2 px-4 border border-slate-200 text-center">{s.gender}</td>
                    <td className="py-2 px-4 border border-slate-200 text-center font-bold text-[#1e3a8a]">{s.finalGrade || '—'}</td>
                    <td className={`py-2 px-4 border border-slate-200 text-center font-semibold ${status === 'Passed' ? 'text-emerald-600' : status === 'Needs Intervention' ? 'text-red-500' : 'text-slate-400'}`}>{status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'individual' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center print:hidden">
             <label className="text-sm font-bold text-slate-700 mr-4">Select Learner to view Card:</label>
             <select className="flex-1 max-w-sm p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                <option value="">-- Choose Learner --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>)}
              </select>
          </div>
          {activeStudent ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-none print:shadow-none print:p-0">
               <div className="text-center mb-8 border-b-2 border-slate-800 pb-6"><h1 className="text-2xl font-black text-slate-800 uppercase">Learner Progress Report</h1><p className="text-sm font-medium text-slate-600 mt-1">Parent-Teacher Conference Copy</p></div>
               <div className="grid grid-cols-2 gap-4 mb-8 text-sm border-b border-slate-200 pb-6"><div><p className="text-slate-500 mb-1">Name of Learner:</p><p className="text-lg font-bold text-slate-800 uppercase">{activeStudent.lastName}, {activeStudent.firstName}</p></div><div><p className="text-slate-500 mb-1">Learner Reference Number (LRN):</p><p className="text-lg font-bold text-slate-800 font-mono">{activeStudent.lrn}</p></div><div><p className="text-slate-500 mb-1">Grade & Section:</p><p className="font-semibold text-slate-800">{currentClass.grade} - {currentClass.section}</p></div><div><p className="text-slate-500 mb-1">Learning Area / Subject:</p><p className="font-semibold text-slate-800">{currentClass.subject}</p></div></div>
               <div className="mb-8">
                 <h3 className="font-bold text-slate-800 text-lg mb-4 bg-slate-100 p-2 rounded">1. Academic Performance (Quarter 1)</h3>
                 {activeStudentGrades ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {(() => {
                       let totals = { WW: 0, PT: 0, SA: 0, TEA: 0 };
                       let maxes = { WW: 0, PT: 0, SA: 0, TEA: 0 };
                       classAssessments.forEach(a => {
                         maxes[a.category] += Number(a.maxScore) || 0;
                         totals[a.category] += Number((grades[activeStudent.id] || {})[a.id]) || 0;
                       });
                       return (
                         <>
                           <div className="p-4 border border-slate-200 rounded-lg text-center"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Written Works</p><p className="text-xl font-bold text-slate-800">{totals.WW} / {maxes.WW}</p></div>
                           <div className="p-4 border border-slate-200 rounded-lg text-center"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Perf. Tasks</p><p className="text-xl font-bold text-slate-800">{totals.PT} / {maxes.PT}</p></div>
                           <div className="p-4 border border-slate-200 rounded-lg text-center"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Assessments</p><p className="text-xl font-bold text-slate-800">{totals.SA + totals.TEA} / {maxes.SA + maxes.TEA}</p></div>
                           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"><p className="text-xs text-blue-600 uppercase font-bold mb-1">Transmuted Grade</p><p className="text-3xl font-black text-[#1e3a8a]">{activeStudentGrades.transmuted}</p></div>
                         </>
                       );
                     })()}
                   </div>
                 ) : (<p className="text-sm text-slate-500 italic">No grades recorded for this quarter yet.</p>)}
               </div>
               <div className="mb-8"><h3 className="font-bold text-slate-800 text-lg mb-4 bg-slate-100 p-2 rounded">2. Anecdotal & Behavioral Logs</h3>{activeStudentLogs.length > 0 ? (<ul className="space-y-3">{activeStudentLogs.map(log => (<li key={log.id} className="border-l-4 p-3 bg-slate-50 text-sm" style={{ borderColor: log.type === 'positive' ? '#10b981' : '#f59e0b' }}><span className="font-bold text-slate-700 mr-2">{log.date}:</span><span className="text-slate-600">{log.behavior}</span><p className="text-xs text-slate-500 mt-1 italic">Action Taken: {log.action}</p></li>))}</ul>) : (<p className="text-sm text-slate-500 italic">No specific behavioral incidents recorded.</p>)}</div>
               <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-sm"><div><div className="border-b border-slate-800 pb-1 mb-1 font-bold">Teacher Raymond</div><p className="text-slate-500 text-xs">Subject Adviser</p></div><div><div className="border-b border-slate-800 pb-1 mb-1 text-transparent select-none">Signature</div><p className="text-slate-500 text-xs">Parent/Guardian Signature over Printed Name</p></div></div>
            </div>
          ) : (<div className="bg-slate-100 rounded-xl border border-slate-200 p-12 text-center print:hidden"><UserCheck size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-500 font-medium">Please select a student from the dropdown above to generate their individual report.</p></div>)}
        </div>
      )}
    </div>
  );
}

// 10. CALENDAR VIEW (With Event Scheduling & Reminders)
function CalendarView({ showToast, calendarEvents, setCalendarEvents }) {
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'assessment', reminder: false });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if(!newEvent.title || !newEvent.date) return showToast("Provide a title and date.");
    setCalendarEvents([...calendarEvents, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', date: '', type: 'assessment', reminder: false });
    showToast("Event scheduled successfully!");
  };

  const toggleReminder = (id) => {
    setCalendarEvents(calendarEvents.map(ev => ev.id === id ? { ...ev, reminder: !ev.reminder } : ev));
    showToast("Alarm setting updated.");
  };

  const handleDeleteEvent = (id) => {
    setCalendarEvents(calendarEvents.filter(ev => ev.id !== id));
    showToast("Event removed from calendar.");
  };

  const sortedEvents = [...calendarEvents].sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center"><CalendarDays className="mr-2 text-[#1e3a8a]" /> Academic Calendar S.Y. 2026-2027</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-[#1e3a8a] rounded-lg p-4 bg-blue-50"><h3 className="font-bold text-[#1e3a8a] text-sm">Term 1 (Q1)</h3><p className="text-xs text-slate-600 mt-1">Aug 03 - Oct 15</p></div>
          <div className="border border-slate-200 rounded-lg p-4 opacity-70"><h3 className="font-bold text-slate-700 text-sm">Term 2 (Q2 & Q3)</h3><p className="text-xs text-slate-500 mt-1">Oct 26 - Mar 20</p></div>
          <div className="border border-slate-200 rounded-lg p-4 opacity-70"><h3 className="font-bold text-slate-700 text-sm">Term 3 (Q4)</h3><p className="text-xs text-slate-500 mt-1">Mar 22 - Jun 04</p></div>
        </div>

        {/* Schedule New Event Form */}
        <form onSubmit={handleAddEvent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-[#1e3a8a] flex items-center"><Plus size={16} className="mr-1"/> Schedule New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Event Title (e.g. Q1 Exam)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white" required />
            <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white text-slate-700" required />
            <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] text-sm bg-white">
              <option value="assessment">Assessment / Exam</option>
              <option value="activity">School Activity</option>
              <option value="deadline">Deadline</option>
              <option value="holiday">Holiday</option>
              <option value="reminder">General Reminder</option>
            </select>
            <div className="flex items-center space-x-2 p-2.5 bg-white border border-slate-200 rounded-lg">
              <input type="checkbox" id="reminder-check" checked={newEvent.reminder} onChange={e => setNewEvent({...newEvent, reminder: e.target.checked})} className="h-4 w-4 text-[#1e3a8a] rounded border-slate-300 focus:ring-[#1e3a8a]" />
              <label htmlFor="reminder-check" className="text-sm text-slate-700 cursor-pointer font-medium flex items-center select-none"><Bell size={14} className={`mr-1 ${newEvent.reminder ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`}/> Set Alarm</label>
            </div>
          </div>
          <button type="submit" className="px-5 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">Add to Calendar</button>
        </form>

        <h3 className="font-semibold text-slate-800 text-base mb-4 border-b pb-2">Upcoming School-Wide Events & Schedule</h3>
        <div className="space-y-0">
          {sortedEvents.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">No upcoming events scheduled.</p> : sortedEvents.map((event) => (
            <div key={event.id} className="flex items-center py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group px-2 rounded-lg">
              <div className="w-16 flex flex-col items-center justify-center mr-4 flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-xl font-bold text-slate-800 leading-none">{new Date(event.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 text-sm truncate">{event.title}</h4>
                <p className="text-[10px] capitalize text-slate-500 flex items-center">
                   {event.type}
                   {event.reminder && <span className="ml-2 text-amber-500 flex items-center font-semibold"><Bell size={10} className="mr-0.5 fill-amber-500"/> Alarm Active</span>}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2 flex items-center space-x-2">
                 {event.type === 'holiday' && <span className="hidden sm:inline-block px-2 py-1 bg-red-50 text-red-600 text-[10px] rounded-full font-medium">Holiday</span>}
                 {event.type === 'deadline' && <span className="hidden sm:inline-block px-2 py-1 bg-amber-50 text-amber-600 text-[10px] rounded-full font-medium">Deadline</span>}
                 {event.type === 'assessment' && <span className="hidden sm:inline-block px-2 py-1 bg-purple-50 text-purple-600 text-[10px] rounded-full font-medium">Exam</span>}
                 {event.type === 'activity' && <span className="hidden sm:inline-block px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] rounded-full font-medium">Activity</span>}
                 {event.type === 'reminder' && <span className="hidden sm:inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium">Reminder</span>}

                 <button onClick={() => toggleReminder(event.id)} className={`p-1.5 rounded-full transition-colors ${event.reminder ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`} title={event.reminder ? "Turn Alarm Off" : "Turn Alarm On"}>
                   {event.reminder ? <Bell size={14} className="fill-amber-500" /> : <BellOff size={14} />}
                 </button>
                 <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100" title="Delete Event">
                    <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}