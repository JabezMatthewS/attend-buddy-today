
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, subDays, addDays, parse, compareAsc } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AttendanceRecord {
  date: string;
  workingTime: string;
  status: 'present' | 'wo' | 'sh' | 'pl' | 'cl' | 'absent';
  checkIn?: string;
  checkOut?: string;
}

const AttendanceHistory = () => {
  const navigate = useNavigate();
  
  // Date filter state
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  
  // Mock attendance data
  const mockAttendance: AttendanceRecord[] = [
    // May 2023
    { date: '2023-05-01', workingTime: '9:00 - 17:00', status: 'present', checkIn: '9:00', checkOut: '17:00' },
    { date: '2023-05-02', workingTime: '9:00 - 17:30', status: 'present', checkIn: '9:00', checkOut: '17:30' },
    { date: '2023-05-03', workingTime: 'N/A', status: 'pl' },
    { date: '2023-05-04', workingTime: '9:15 - 17:00', status: 'present', checkIn: '9:15', checkOut: '17:00' },
    { date: '2023-05-05', workingTime: '9:00 - 17:00', status: 'present', checkIn: '9:00', checkOut: '17:00' },
    { date: '2023-05-06', workingTime: 'N/A', status: 'wo' },
    { date: '2023-05-07', workingTime: 'N/A', status: 'wo' },
    // April 2023
    { date: '2023-04-28', workingTime: '9:00 - 17:00', status: 'present', checkIn: '9:00', checkOut: '17:00' },
    { date: '2023-04-29', workingTime: 'N/A', status: 'wo' },
    { date: '2023-04-30', workingTime: 'N/A', status: 'wo' },
  ];
  
  // Function to filter and group records by month
  const getFilteredAndGroupedRecords = () => {
    // Filter records by date range
    const filtered = fromDate && toDate 
      ? mockAttendance.filter(record => {
          const date = new Date(record.date);
          return compareAsc(date, fromDate) >= 0 && compareAsc(date, toDate) <= 0;
        })
      : mockAttendance;
      
    // Group by month
    const grouped = filtered.reduce((acc, record) => {
      const date = new Date(record.date);
      const month = format(date, 'MMMM yyyy');
      
      if (!acc[month]) {
        acc[month] = [];
      }
      
      acc[month].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);
    
    // Sort each month's records by date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => compareAsc(new Date(b.date), new Date(a.date)));
    });
    
    return grouped;
  };
  
  const groupedRecords = getFilteredAndGroupedRecords();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'pl':
        return <Badge className="bg-blue-100 text-blue-800">PL</Badge>;
      case 'cl':
        return <Badge className="bg-purple-100 text-purple-800">CL</Badge>;
      case 'sh':
        return <Badge className="bg-amber-100 text-amber-800">SH</Badge>;
      case 'wo':
        return <Badge className="bg-gray-100 text-gray-800">Week Off</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Attendance History</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Date Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-sm font-medium mb-2">From Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">To Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => date < (fromDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance Records by Month */}
        <div className="space-y-6">
          {Object.keys(groupedRecords).length > 0 ? (
            Object.keys(groupedRecords).map((month) => (
              <Card key={month} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <CardTitle>{month}</CardTitle>
                  <CardDescription>
                    {groupedRecords[month].length} records
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {groupedRecords[month].map((record, idx) => (
                      <div key={`${record.date}-${idx}`} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {record.workingTime}
                              </div>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(record.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No attendance records found for the selected period.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceHistory;
