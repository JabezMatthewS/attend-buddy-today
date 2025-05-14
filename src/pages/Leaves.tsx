
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, subDays, compareAsc } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaveRecord {
  date: string;
  type: 'pl' | 'sh' | 'cl' | 'absent' | 'wo';
  reason: string;
}

const Leaves = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 60));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [leaveType, setLeaveType] = useState<string>("all");
  
  // Mock leave data
  const mockLeaves: LeaveRecord[] = [
    { date: '2023-05-03', type: 'pl', reason: 'Personal leave' },
    { date: '2023-05-06', type: 'wo', reason: 'Week off' },
    { date: '2023-05-07', type: 'wo', reason: 'Week off' },
    { date: '2023-04-15', type: 'sh', reason: 'Sick leave' },
    { date: '2023-04-22', type: 'cl', reason: 'Casual leave' },
    { date: '2023-04-29', type: 'wo', reason: 'Week off' },
    { date: '2023-04-30', type: 'wo', reason: 'Week off' },
    { date: '2023-03-18', type: 'pl', reason: 'Personal leave' },
    { date: '2023-03-25', type: 'absent', reason: 'Unplanned absence' },
  ];
  
  // Function to filter and group records by month
  const getFilteredAndGroupedRecords = () => {
    // Filter records by date range and type
    const filtered = mockLeaves.filter(record => {
      const date = new Date(record.date);
      const matchesDateRange = (!fromDate || compareAsc(date, fromDate) >= 0) && 
                              (!toDate || compareAsc(date, toDate) <= 0);
      const matchesType = leaveType === 'all' || record.type === leaveType;
      
      return matchesDateRange && matchesType;
    });
      
    // Group by month
    const grouped = filtered.reduce((acc, record) => {
      const date = new Date(record.date);
      const month = format(date, 'MMMM yyyy');
      
      if (!acc[month]) {
        acc[month] = [];
      }
      
      acc[month].push(record);
      return acc;
    }, {} as Record<string, LeaveRecord[]>);
    
    // Sort each month's records by date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => compareAsc(new Date(b.date), new Date(a.date)));
    });
    
    return grouped;
  };
  
  const groupedRecords = getFilteredAndGroupedRecords();
  
  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'pl':
        return <Badge className="bg-blue-100 text-blue-800">Paid Leave</Badge>;
      case 'sh':
        return <Badge className="bg-amber-100 text-amber-800">Sick Holiday</Badge>;
      case 'cl':
        return <Badge className="bg-purple-100 text-purple-800">Casual Leave</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'wo':
        return <Badge className="bg-gray-100 text-gray-800">Week Off</Badge>;
      default:
        return <Badge>{type}</Badge>;
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
            <h1 className="text-xl font-semibold text-gray-900">Leaves</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
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
              <div>
                <div className="text-sm font-medium mb-2">Leave Type</div>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pl">Paid Leave (PL)</SelectItem>
                    <SelectItem value="sh">Sick Holiday (SH)</SelectItem>
                    <SelectItem value="cl">Casual Leave (CL)</SelectItem>
                    <SelectItem value="wo">Week Off (WO)</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Leave Records by Month */}
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
                              {record.reason}
                            </div>
                          </div>
                          <div>
                            {getLeaveTypeBadge(record.type)}
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
              <p className="text-gray-500">No leave records found for the selected criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaves;
