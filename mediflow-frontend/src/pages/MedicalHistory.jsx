import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  Clock, 
  ArrowDownCircle, 
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MedicalHistory = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track expanded items
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const url = patientId 
        ? `/patients/${patientId}/history` 
        : '/patients/my-history';
      const response = await API.get(url);
      setHistory(response.data);
    } catch (err) {
      setError('Failed to load clinical timeline history.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case 'PRESCRIPTION':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'VISIT':
        return <Stethoscope className="w-5 h-5 text-rose-500" />;
      default:
        return <Heart className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatEventDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-slate-500 text-xs font-semibold">Retrieving medical timeline history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {!patientId && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">My Medical History</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Chronological timeline of consultations, prescriptions, and clinic visits</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500 font-bold text-sm">No historical medical records available on this timeline.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
          {history.map((item, idx) => {
            const itemId = `${item.type}-${item.id}`;
            const isExpanded = !!expandedItems[itemId];
            
            return (
              <div key={itemId} className="relative group animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Timeline Dot Indicator */}
                <span className="absolute -left-[37px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:border-slate-300 transition-colors">
                  {getIcon(item.type)}
                </span>

                {/* Timeline Card */}
                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60">
                          {item.type}
                        </span>
                        {item.status && (
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getBadgeStyle(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatEventDate(item.date)}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.subtitle}</p>
                    </div>

                    {item.details && (
                      <div className="pt-2 border-t border-slate-100/80">
                        <button
                          onClick={() => toggleExpand(itemId)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? 'Hide clinical details' : 'View clinical details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/50 text-[11px] leading-relaxed text-slate-600 font-medium whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-250">
                            {item.details}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
