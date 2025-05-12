
// Types
export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'present' | 'late' | 'absent' | 'weekend' | 'holiday';
  notes?: string;
}

export interface DailyAttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
}

// Helper to format dates
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date | null): string => {
  if (!date) return '–';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Generate mock attendance data for the current month
export const generateMonthlyAttendance = (employeeId: string): AttendanceRecord[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Calculate first and last day of current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
  const records: AttendanceRecord[] = [];
  
  // Generate attendance for each day of the month up to today
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    
    // Skip future dates
    if (date > today) {
      break;
    }
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    // Skip weekends with weekend status
    if (isWeekend) {
      records.push({
        date: formatDate(date),
        checkIn: '',
        checkOut: null,
        status: 'weekend'
      });
      continue;
    }
    
    // Random status generation for past dates, with bias toward "present"
    const randomValue = Math.random();
    let status: 'present' | 'late' | 'absent';
    let checkIn = '';
    let checkOut = null;
    
    if (randomValue < 0.8) {
      // Present (80% probability)
      status = 'present';
      const baseHour = 8; // 8 AM base time
      const randomMinutes = Math.floor(Math.random() * 15); // 0-15 minutes variation
      const checkInDate = new Date(date);
      checkInDate.setHours(baseHour, randomMinutes, 0);
      checkIn = formatTime(checkInDate);
      
      // Set checkout time (roughly 8 hours later)
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(checkOutDate.getHours() + 8);
      checkOutDate.setMinutes(checkOutDate.getMinutes() + Math.floor(Math.random() * 30)); // 0-30 minutes variation
      checkOut = formatTime(checkOutDate);
      
    } else if (randomValue < 0.95) {
      // Late (15% probability)
      status = 'late';
      const lateHour = 9; // 9 AM or later is considered late
      const randomMinutes = Math.floor(15 + Math.random() * 45); // 15-60 minutes variation
      const checkInDate = new Date(date);
      checkInDate.setHours(lateHour, randomMinutes, 0);
      checkIn = formatTime(checkInDate);
      
      // Set checkout time
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(checkOutDate.getHours() + 8);
      checkOut = formatTime(checkOutDate);
      
    } else {
      // Absent (5% probability)
      status = 'absent';
    }
    
    // For today, potentially not checked out yet
    if (day === today.getDate() && Math.random() > 0.5) {
      checkOut = null;
    }
    
    records.push({
      date: formatDate(date),
      checkIn,
      checkOut,
      status
    });
  }
  
  return records;
};

// Get today's attendance
export const getTodayAttendance = (employeeId: string): AttendanceRecord | null => {
  const monthlyAttendance = generateMonthlyAttendance(employeeId);
  const today = formatDate(new Date());
  
  return monthlyAttendance.find(record => record.date === today) || null;
};

// Calculate attendance summary for the month
export const calculateAttendanceSummary = (records: AttendanceRecord[]): DailyAttendanceSummary => {
  const workingDays = records.filter(r => r.status !== 'weekend' && r.status !== 'holiday');
  const totalWorkingDays = workingDays.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  
  const attendanceRate = totalWorkingDays > 0 
    ? Math.round(((presentDays + lateDays) / totalWorkingDays) * 100) 
    : 0;
  
  return {
    totalWorkingDays,
    presentDays,
    lateDays,
    absentDays,
    attendanceRate
  };
};
