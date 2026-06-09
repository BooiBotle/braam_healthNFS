import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, Users, Activity } from 'lucide-react';

const PeakHours = () => {
  const { user } = useAuth();
  const [hourlyData, setHourlyData] = useState<number[]>(Array(24).fill(0));
  const [loading, setLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      let query = supabase.from('consultations').select('created_at');
      
      if (user?.clinicId) {
        query = query.eq('clinic_id', user.clinicId);
      }

      const { data } = await query;
      
      if (data) {
        setTotalVisits(data.length);
        const hours = Array(24).fill(0);
        data.forEach(visit => {
          const date = new Date(visit.created_at);
          const hour = date.getHours();
          hours[hour]++;
        });
        setHourlyData(hours);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  

  // Only show hours from 6 AM to 8 PM for relevance if 24hr isn't needed, but 24 is fine.
  const displayHours = hourlyData.slice(6, 20); // 6 AM to 7 PM
  const labels = ['6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM'];
  const displayMax = Math.max(...displayHours, 1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--sp-1)' }}>
          Peak Hours Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize clinic visitation patterns.</p>
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
           <div style={{ padding: 'var(--sp-4)', background: 'var(--accent-subtle)', color: 'var(--navy)', borderRadius: 'var(--radius-lg)' }}>
             <Users size={24} />
           </div>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Historical Visits</div>
             <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)' }}>{totalVisits}</div>
           </div>
        </div>
        <div className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
           <div style={{ padding: 'var(--sp-4)', background: 'var(--gold-subtle)', color: 'var(--gold)', borderRadius: 'var(--radius-lg)' }}>
             <Activity size={24} />
           </div>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Busiest Time</div>
             <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-heading)' }}>
               {loading ? '-' : `${labels[displayHours.indexOf(displayMax)] || 'N/A'}`}
             </div>
           </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-8)' }}>
          <BarChart2 size={20} color="var(--navy)" />
          <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Visitation Frequency by Hour</h2>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-12)', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating analytics...</div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: 'var(--sp-2)', paddingBottom: 'var(--sp-8)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
             {displayHours.map((count, index) => {
               const heightPercent = (count / displayMax) * 100;
               return (
                 <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                   {count > 0 && (
                     <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 'var(--sp-1)' }}>{count}</span>
                   )}
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${heightPercent}%` }}
                     transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' as any }}
                     style={{ 
                       width: '100%', 
                       maxWidth: '40px', 
                       background: heightPercent === 100 ? 'var(--gold)' : 'var(--navy)', 
                       borderRadius: '4px 4px 0 0',
                       minHeight: count > 0 ? '4px' : '0'
                     }}
                   />
                   <div style={{ position: 'absolute', bottom: '-30px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                     {labels[index]}
                   </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default PeakHours;




