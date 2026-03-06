
import React, { useState, useEffect } from 'react';
import { Page, CleaningTask, TaskStatus, Cleaner, AirolaNotification, Property } from '../types';
import { db } from '../db';
import { fetchFromSheet } from '../sheets';
import { 
  Search, 
  Briefcase, 
  Users, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Trash2, 
  Phone, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  X, 
  FileText, 
  AlertTriangle, 
  ChevronDown, 
  Database, 
  UserPlus, 
  Clock,
  Home,
  ListFilter
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<Cleaner[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'properties'>('tasks');
  
  // Vetting can now target either a Task or a Property
  const [vettingTarget, setVettingTarget] = useState<{ type: 'task' | 'property', id: string } | null>(null);
  const [etaInputs, setEtaInputs] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // 1. Fetch live data from Google Sheets
      const sheetData = await fetchFromSheet('Sheet1');
      
      // 2. Fetch local data for staff, properties, and tasks
      let dbStaff: Cleaner[] = [];
      let dbProps: Property[] = [];
      let dbTasks: CleaningTask[] = [];
      let deletedTaskIds: string[] = [];

      try {
        const [staff, props, tasks, deleted] = await Promise.all([
          db.getStaff().catch(() => []),
          db.getProperties().catch(() => []),
          db.getTasks().catch(() => []),
          db.getDeletedTasks().catch(() => [])
        ]);
        dbStaff = staff;
        dbProps = props;
        dbTasks = tasks;
        deletedTaskIds = deleted;
      } catch (e) {
        console.error("Error fetching local DB data:", e);
      }

      // 3. Map Google Sheet rows to CleaningTask objects, merging with local data
      // Sheet columns: Timestamp (0), Name (1), Email (2), Phone (3), Property Name (4), Address (5), Beds (6), Baths (7), Type (8), Frequency (9), Price (10), Notes (11), TaskId (12)
      const tasksToSync: CleaningTask[] = [];
      const liveTasks: CleaningTask[] = sheetData
        .map((row: any[], index: number) => {
          // Use the taskId from the sheet if it exists, otherwise fall back to index-based
          // We use a more stable fallback: REQ-SHEET-[index] to distinguish from random IDs
          const taskId = row[12] || `REQ-S-${index + 1}`;
          const existingTask = dbTasks.find(t => t.id === taskId);
          
          const task: CleaningTask = {
            id: taskId,
            propertyId: existingTask ? existingTask.propertyId : `PROP-${index}`,
            propertyName: row[4] || 'N/A',
            propertyAddress: row[5] || 'N/A',
            ownerName: row[1] || 'N/A',
            ownerPhone: row[3] || 'N/A',
            ownerEmail: row[2] || 'N/A',
            beds: parseInt(row[6]) || 0,
            baths: parseInt(row[7]) || 0,
            type: (row[8] || 'basic') as 'basic' | 'standard' | 'premium',
            // Preserve local state if it exists
            status: existingTask ? existingTask.status : ('pending' as TaskStatus),
            scheduledAt: row[0] || new Date().toISOString(),
            price: parseFloat(row[10]) || 0,
            notes: row[11] || '',
            verificationStatus: existingTask ? existingTask.verificationStatus : ('unverified' as const),
            cleanerName: existingTask ? existingTask.cleanerName : undefined,
            cleanerPhone: existingTask ? existingTask.cleanerPhone : undefined,
            cleanerRole: existingTask ? existingTask.cleanerRole : undefined,
            estimatedArrival: existingTask ? existingTask.estimatedArrival : undefined,
          };

          return { task, existing: !!existingTask };
        })
        .filter(item => !deletedTaskIds.includes(item.task.id))
        .map(item => {
          // If this is a new task from the sheet that isn't in our DB yet, collect it for syncing
          if (!item.existing) {
            tasksToSync.push(item.task);
          }
          return item.task;
        });

      // Sync new tasks to DB sequentially or in parallel
      if (tasksToSync.length > 0) {
        await Promise.all(tasksToSync.map(task => db.saveTask(task, 'AdminDashboard')));
      }

      setTasks(liveTasks);
      setStaff(dbStaff);
      setProperties(dbProps);
    } catch (error) {
      console.error("Error loading live data from Google Sheets:", error);
      // Fallback to local DB if Sheets fails
      try {
        const [dbTasks, dbStaff, dbProps, deletedTaskIds] = await Promise.all([
          db.getTasks().catch(() => []), 
          db.getStaff().catch(() => []),
          db.getProperties().catch(() => []),
          db.getDeletedTasks().catch(() => [])
        ]);
        setTasks(dbTasks.filter(t => !deletedTaskIds.includes(t.id)));
        setStaff(dbStaff);
        setProperties(dbProps);
      } catch (e) {
        console.error("Critical error in fallback load:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for storage updates from other tabs/windows
    const handleStorageChange = (e: any) => {
      // Only reload if the event didn't come from this specific component's actions
      // (Optimistic updates already handled local changes)
      if (e.detail?.source !== 'AdminDashboard') {
        loadData();
      }
    };

    window.addEventListener('storage_update', handleStorageChange);
    return () => window.removeEventListener('storage_update', handleStorageChange);
  }, []);

  const handleUpdateVerification = async (target: { type: 'task' | 'property', id: string }, status: 'verified' | 'rejected') => {
    if (target.type === 'task') {
      const task = tasks.find(t => t.id === target.id);
      if (!task) return;
      
      const updatedTask = { ...task, verificationStatus: status };
      
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === target.id ? updatedTask : t));
      
      await db.saveTask(updatedTask, 'AdminDashboard');

      // Also update the underlying property
      const prop = properties.find(p => p.id === task.propertyId);
      if (prop) {
        const updatedProp = { ...prop, verificationStatus: status };
        setProperties(prev => prev.map(p => p.id === prop.id ? updatedProp : p));
        await db.saveProperty(updatedProp, 'AdminDashboard');
      }
    } else {
      const prop = properties.find(p => p.id === target.id);
      if (!prop) return;

      const updatedProp = { ...prop, verificationStatus: status };
      
      // Optimistic update
      setProperties(prev => prev.map(p => p.id === target.id ? updatedProp : p));
      
      await db.saveProperty(updatedProp, 'AdminDashboard');

      // Also update all tasks for this property
      const relatedTasks = tasks.filter(t => t.propertyId === prop.id);
      setTasks(prev => prev.map(t => t.propertyId === prop.id ? { ...t, verificationStatus: status } : t));
      
      for (const t of relatedTasks) {
        await db.saveTask({ ...t, verificationStatus: status }, 'AdminDashboard');
      }
    }
    setVettingTarget(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Permanently delete this task from the database?")) {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      await db.deleteTask(taskId, 'AdminDashboard');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask: CleaningTask = { ...task, status: newStatus };
      
      // 1. Optimistic local state update (Immediate UI feedback)
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      
      // 2. Persist to DB
      await db.saveTask(updatedTask, 'AdminDashboard');
      
      if (newStatus === 'completed') {
        await handleCompleteTask(taskId);
      }
    }
  };

  const handleAssignCleaner = async (taskId: string, cleanerId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const cleaner = staff.find(s => s.id === cleanerId);
    const eta = etaInputs[taskId] || '10:00 - 12:00';

    if (task) {
      // Check if another task for the same property already has a cleaner assigned
      const propertyTasks = tasks.filter(t => t.propertyId === task.propertyId && t.id !== task.id);
      const alreadyAssigned = propertyTasks.find(t => t.cleanerName && t.cleanerName !== 'Unassigned' && t.status !== 'completed');
      
      if (alreadyAssigned && cleanerId !== 'Unassigned') {
        if (!window.confirm(`Another task for this property is already assigned to ${alreadyAssigned.cleanerName}. Are you sure you want to assign a different team to this task?`)) {
          return;
        }
      }

      let updatedTask: CleaningTask;

      if (!cleanerId || cleanerId === 'Unassigned') {
        updatedTask = { 
          ...task, 
          cleanerName: 'Unassigned', 
          cleanerPhone: '',
          cleanerRole: '',
          estimatedArrival: '',
          status: 'pending' 
        };
      } else if (cleaner) {
        updatedTask = { 
          ...task, 
          cleanerName: cleaner.name, 
          cleanerPhone: cleaner.phone,
          cleanerRole: cleaner.role,
          estimatedArrival: eta,
          status: 'in-progress' 
        };

        // Async notification
        const notification: AirolaNotification = {
          id: `DISPATCH-${Date.now()}`,
          type: 'dispatch',
          title: 'Cleaner Dispatched',
          subject: `Turnover Assigned: ${task.propertyName}`,
          body: `Great news! We have dispatched a cleaning professional to your property.\n\nAssigned: ${cleaner.name}\nTeam Role: ${cleaner.role.toUpperCase()}\nLead Contact: ${cleaner.phone}\nEstimated Arrival: ${eta}`,
          timestamp: new Date().toISOString(),
          read: false,
          recipientRole: 'owner',
          recipientEmail: task.ownerEmail
        };
        db.addNotification(notification);
      } else {
        return;
      }

      // 1. Optimistic local state update (Immediate UI feedback)
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

      // 2. Persist to DB
      await db.saveTask(updatedTask, 'AdminDashboard');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask: CleaningTask = { ...task, status: 'completed' as TaskStatus };
      await db.saveTask(updatedTask);

      // Automated completion notification to the host
      const notification: AirolaNotification = {
        id: `COMPLETE-${Date.now()}`,
        type: 'cleaning_complete',
        title: 'Turnover Completed',
        subject: `Cleaning Finished: ${task.propertyName}`,
        body: `Your property turnover is complete and staged for the next guest. Our personnel have finished the ${task.type} clean.\n\nProperty: ${task.propertyName}\nPersonnel: ${task.cleanerName}\nCompletion Time: ${new Date().toLocaleTimeString()}\n\nInventory has been verified and restocked where required.`,
        timestamp: new Date().toISOString(),
        read: false,
        recipientRole: 'owner',
        recipientEmail: task.ownerEmail
      };
      await db.addNotification(notification);
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-[rgb(204,236,229)] text-[rgb(45,110,95)] border-[rgb(172,216,206)]';
      case 'in-progress': return 'bg-[rgb(204,236,229)] text-[rgb(45,110,95)] border-[rgb(172,216,206)]';
      case 'pending': return 'bg-[rgb(204,236,229)] text-[rgb(45,110,95)] border-[rgb(172,216,206)] font-bold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Vetting Target Helpers
  const currentVettingObject = vettingTarget 
    ? (vettingTarget.type === 'task' 
        ? tasks.find(t => t.id === vettingTarget.id) 
        : properties.find(p => p.id === vettingTarget.id))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2 rounded-lg text-[rgb(235,247,244)]0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          </div>
          <div className="flex items-center space-x-3 ml-11">
             <p className="text-slate-500 font-medium">UK Operations Database & Fleet Logistics.</p>
             {isLoading && <span className="text-[10px] font-black text-[rgb(61,141,122)] uppercase tracking-widest flex items-center"><Database className="w-3 h-3 mr-1" /> Syncing...</span>}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={loadData} className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:text-[rgb(61,141,122)] transition-all flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => onNavigate(Page.STAFF_MANAGEMENT)} className="bg-slate-900 px-8 py-3 rounded-2xl text-white font-bold flex items-center shadow-xl hover:bg-slate-800 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
             <Users className="w-5 h-5 mr-2" /> Dispatch Fleet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-[rgb(204,236,229)]">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Pipeline</p>
           <h3 className="text-3xl font-black text-slate-900">{tasks.filter(t => t.status !== 'completed').length} Tasks</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-[rgb(204,236,229)]">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Properties</p>
           <h3 className="text-3xl font-black text-slate-900">{properties.length} Units</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:border-red-100">
           <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Pending Vetting</p>
           <h3 className="text-3xl font-black text-red-600">{properties.filter(p => p.verificationStatus === 'unverified').length} Unverified</h3>
        </div>
        <div className="bg-[rgb(61,141,122)] p-8 rounded-[2rem] text-white shadow-xl flex justify-between items-center cursor-pointer hover:bg-[rgb(45,110,95)] transition-all" onClick={() => onNavigate(Page.STAFF_MANAGEMENT)}>
           <div><p className="text-[10px] font-black text-[rgb(172,216,206)] uppercase tracking-widest mb-1">Fleet Status</p><h3 className="text-3xl font-black">{staff.length} Active</h3></div>
           <ArrowRight className="w-8 h-8 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-8 pt-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'tasks' ? 'text-[rgb(61,141,122)]' : 'text-slate-400 hover:text-slate-600 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]'}`}
            >
              Task Pipeline
              {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgb(61,141,122)] rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('properties')}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'properties' ? 'text-[rgb(61,141,122)]' : 'text-slate-400 hover:text-slate-600 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]'}`}
            >
              Property Registry
              {activeTab === 'properties' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgb(61,141,122)] rounded-full" />}
            </button>
          </div>
          <div className="relative w-full max-w-md mb-4 lg:mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {activeTab === 'tasks' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-6">Ref</th><th className="px-8 py-6">Host</th><th className="px-8 py-6">Property</th><th className="px-8 py-6">Vetting</th><th className="px-8 py-6">Assigned</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length === 0 ? (<tr><td colSpan={7} className="px-8 py-20 text-center text-slate-300 font-bold">No active cleaning tasks.</td></tr>) : (
                  tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <tr onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)} className={`hover:bg-slate-50/80 transition-all cursor-pointer ${expandedTaskId === task.id ? 'bg-[rgb(235,247,244)]/30' : ''}`}>
                        <td className="px-8 py-8 font-mono text-[10px] font-bold text-slate-400">{task.id}</td>
                        <td className="px-8 py-8"><div className="flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserIcon className="w-4 h-4" /></div><div><p className="font-bold text-slate-900 text-sm">{task.ownerName}</p><p className="text-[10px] text-slate-400 font-medium">{task.ownerEmail}</p></div></div></td>
                        <td className="px-8 py-8"><p className="font-bold text-slate-900 text-sm">{task.propertyName}</p><div className="flex items-center text-[10px] text-slate-400 mt-1"><MapPin className="w-3 h-3 mr-1" /> {task.propertyAddress}</div></td>
                        <td className="px-8 py-8">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase flex items-center w-fit border ${
                            task.verificationStatus === 'verified' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]' :
                            task.verificationStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]'
                          }`}>
                            {task.verificationStatus === 'verified' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                            {task.verificationStatus}
                          </span>
                        </td>
                        <td className="px-8 py-8 font-bold text-sm">{task.cleanerName || 'Unassigned'}</td>
                        <td className="px-8 py-8"><span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>{task.status}</span></td>
                        <td className="px-8 py-8 text-right font-black">£{task.price}</td>
                      </tr>
                      {expandedTaskId === task.id && (
                        <tr className="bg-slate-50"><td colSpan={7} className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Host Contacts</h4>
                              <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-900 flex items-center"><UserIcon className="w-3.5 h-3.5 mr-2 text-[rgb(235,247,244)]0" /> {task.ownerName}</p>
                                <p className="text-sm font-bold text-slate-900 flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-[rgb(235,247,244)]0" /> {task.ownerPhone}</p>
                              </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vetting Status</h4>
                              <button onClick={() => setVettingTarget({ type: 'task', id: task.id })} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 mr-2" /> Verify Documents
                              </button>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Status & Fleet</h4>
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase">Assignment</p>
                                  <select 
                                    value={staff.find(s => s.name === task.cleanerName)?.id || 'Unassigned'}
                                    onChange={(e) => handleAssignCleaner(task.id, e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[rgb(235,247,244)]0/20 outline-none transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                                  >
                                    <option value="Unassigned">Standby</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase">Operational Status</p>
                                  <select 
                                    value={task.status}
                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[rgb(235,247,244)]0/20 outline-none"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>

                                {task.status === 'in-progress' && (
                                  <button 
                                    onClick={() => handleUpdateStatus(task.id, 'completed')} 
                                    className="w-full py-3 bg-[rgb(61,141,122)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[rgb(45,110,95)] transition-all flex items-center justify-center shadow-lg shadow-[rgb(204,236,229)]"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm">
                              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Management</h4>
                              <button onClick={() => handleDeleteTask(task.id)} className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Task
                              </button>
                            </div>
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-6">ID</th><th className="px-8 py-6">Property Name</th><th className="px-8 py-6">Host Email</th><th className="px-8 py-6">Status</th><th className="px-8 py-6">Specs</th><th className="px-8 py-6 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.length === 0 ? (<tr><td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-bold">No registered properties in database.</td></tr>) : (
                  properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-8 font-mono text-[10px] font-bold text-slate-400">{prop.id}</td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[rgb(235,247,244)] text-[rgb(61,141,122)] rounded-xl flex items-center justify-center"><Home className="w-5 h-5" /></div>
                          <div><p className="font-bold text-slate-900 text-sm">{prop.name}</p><p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{prop.address}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-8 font-medium text-slate-600 text-sm">{prop.ownerEmail}</td>
                      <td className="px-8 py-8">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase flex items-center w-fit border ${
                          prop.verificationStatus === 'verified' ? 'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]' :
                          prop.verificationStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-[rgb(235,247,244)] text-[rgb(61,141,122)] border-[rgb(204,236,229)]'
                        }`}>
                          {prop.verificationStatus === 'verified' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                          {prop.verificationStatus}
                        </span>
                      </td>
                      <td className="px-8 py-8 font-bold text-xs text-slate-400">{prop.beds}B / {prop.baths}Ba</td>
                      <td className="px-8 py-8 text-right">
                        <button onClick={() => setVettingTarget({ type: 'property', id: prop.id })} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                          Verify Registry
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {vettingTarget && currentVettingObject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setVettingTarget(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
              <div>
                <p className="text-[rgb(106,176,160)] text-[10px] font-black uppercase tracking-widest mb-1">On-Boarding Protocol</p>
                <h2 className="text-3xl font-black tracking-tight">{vettingTarget.type === 'task' ? (currentVettingObject as CleaningTask).propertyName : (currentVettingObject as Property).name}</h2>
              </div>
              <button onClick={() => setVettingTarget(null)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Details</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-sm font-bold text-slate-900 flex items-center"><UserIcon className="w-4 h-4 mr-2 text-[rgb(235,247,244)]0" /> {currentVettingObject.ownerName || 'Host Identified'}</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center mt-2"><Phone className="w-4 h-4 mr-2 text-[rgb(235,247,244)]0" /> {(currentVettingObject as any).ownerPhone || 'Not Provided'}</p>
                    <p className="text-xs text-slate-500">{currentVettingObject.ownerEmail}</p>
                    <p className="text-xs text-slate-500 flex items-start"><MapPin className="w-3 h-3 mr-2 mt-0.5 text-slate-300" /> {vettingTarget.type === 'task' ? (currentVettingObject as CleaningTask).propertyAddress : (currentVettingObject as Property).address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Link</h4>
                  {currentVettingObject.listingDocUrl ? (
                    <a href={currentVettingObject.listingDocUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-[rgb(235,247,244)] text-[rgb(61,141,122)] rounded-2xl border border-[rgb(204,236,229)] flex items-center justify-between hover:bg-[rgb(204,236,229)] transition-all hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]">
                      <div className="flex items-center"><FileText className="w-5 h-5 mr-3" /><span className="font-bold">Check Live Listing</span></div>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 flex items-center italic text-xs">No documentation URL provided.</div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-[rgb(235,247,244)] rounded-2xl border border-[rgb(204,236,229)] flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[rgb(235,247,244)]0 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[rgb(30,80,68)] leading-relaxed font-medium">Please cross-reference the property address with official UK council records before final verification.</p>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleUpdateVerification(vettingTarget, 'verified')} className="flex-grow py-5 bg-[rgb(61,141,122)] text-white rounded-2xl font-black text-lg hover:bg-[rgb(45,110,95)] shadow-xl flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]">
                <CheckCircle2 className="w-6 h-6 mr-2" /> Verify Registry
              </button>
              <button onClick={() => handleUpdateVerification(vettingTarget, 'rejected')} className="flex-grow py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                <XCircle className="w-6 h-6 mr-2" /> Reject Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
