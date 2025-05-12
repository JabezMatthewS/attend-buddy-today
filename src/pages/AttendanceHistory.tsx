
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { 
  generateMonthlyAttendance, 
  AttendanceRecord,
} from '@/utils/attendanceUtils';
import { CheckCircle, AlertCircle, Clock, Calendar as CalendarIcon, Search, XCircle } from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  
  useEffect(() => {
    if (user?.id) {
      const records = generateMonthlyAttendance(user.id);
      setAttendanceRecords(records);
      setFilteredRecords(records);
    }
  }, [user?.id]);

  useEffect(() => {
    // Filter records based on selected date range
    if (fromDate || toDate) {
      const filtered = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        
        if (fromDate && toDate) {
          return recordDate >= fromDate && recordDate <= toDate;
        } else if (fromDate) {
          return recordDate >= fromDate;
        } else if (toDate) {
          return recordDate <= toDate;
        }
        
        return true;
      });
      
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(attendanceRecords);
    }
  }, [fromDate, toDate, attendanceRecords]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Present
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Late
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Absent
          </Badge>
        );
      case 'weekend':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" /> Weekend
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM d');
  };

  const resetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };
  
  // Group records by month
  const groupedRecords: Record<string, AttendanceRecord[]> = {};
  filteredRecords.forEach(record => {
    const date = new Date(record.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groupedRecords[monthYear]) {
      groupedRecords[monthYear] = [];
    }
    groupedRecords[monthYear].push(record);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Attendance History" />
      
      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Date Filter</CardTitle>
            <CardDescription>
              Select a date range to filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">From Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      {fromDate ? format(fromDate, 'MMM d, yyyy') : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">To Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      {toDate ? format(toDate, 'MMM d, yyyy') : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => fromDate ? date < fromDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={resetFilters} 
                  className="h-10"
                  disabled={!fromDate && !toDate}
                >
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              {fromDate && toDate ? (
                <p className="text-sm text-muted-foreground">
                  Showing results from {format(fromDate, 'MMM d, yyyy')} to {format(toDate, 'MMM d, yyyy')}
                </p>
              ) : fromDate ? (
                <p className="text-sm text-muted-foreground">
                  Showing results from {format(fromDate, 'MMM d, yyyy')} onwards
                </p>
              ) : toDate ? (
                <p className="text-sm text-muted-foreground">
                  Showing results until {format(toDate, 'MMM d, yyyy')}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
        
        {Object.keys(groupedRecords).length > 0 ? (
          Object.keys(groupedRecords).map(month => (
            <Card key={month} className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{month}</CardTitle>
                <CardDescription>Daily attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {groupedRecords[month].map((record, index) => (
                    <div key={record.date}>
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium">{formatDate(record.date)}</p>
                          {record.status !== 'weekend' && (
                            <div className="text-sm text-gray-500 mt-1">
                              {record.checkIn && (
                                <span>
                                  {record.checkIn} - {record.checkOut || 'Not checked out'}
                                </span>
                              )}
                              {!record.checkIn && record.status === 'absent' && (
                                <span>No attendance recorded</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                      {index < groupedRecords[month].length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Search className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No attendance records found for the selected dates</p>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default AttendanceHistory;
