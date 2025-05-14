import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { format, subDays } from 'date-fns';
import { CalendarIcon, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string; // Added for display
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  check_in?: string;
  check_out?: string;
}

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'K14050', name: 'Jane Smith', department: 'Engineering' },
    { id: 'K14051', name: 'John Doe', department: 'Marketing' }
  ]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  
  // Filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New attendance record state
  const [showNewAttendanceForm, setShowNewAttendanceForm] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present',
    check_in: '09:00',
    check_out: '17:00'
  });

  // Check admin authentication
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      toast({
        title: "Authentication Required",
        description: "Please login as admin to access this page",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    generateMockAttendanceData();
  }, [navigate]);
  
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, department')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    }
  };

  // Generate mock attendance data
  const generateMockAttendanceData = () => {
    setLoading(true);
    // This would be replaced with a real API call in production
    setTimeout(() => {
      // Generate last 30 days of mock data
      const records: AttendanceRecord[] = [];
      const today = new Date();
      
      // Generate mock data for each employee
      for (let i = 0; i < 2; i++) { // For our 2 mock employees
        const employeeId = i === 0 ? 'K14050' : 'K14051';
        const employeeName = i === 0 ? 'Jane Smith' : 'John Doe';
        
        // Generate data for last 30 days
        for (let j = 0; j < 30; j++) {
          const date = new Date(today);
          date.setDate(today.getDate() - j);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Skip weekends
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          
          // Randomize status
          const rand = Math.random();
          let status: 'present' | 'absent' | 'late' | 'on_leave';
          let checkIn: string | undefined;
          let checkOut: string | undefined;
          
          if (rand < 0.7) { // 70% present
            status = 'present';
            checkIn = `0${Math.floor(Math.random() * 2) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
            checkOut = `1${Math.floor(Math.random() * 2) + 6}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          } else if (rand < 0.85) { // 15% late
            status = 'late';
            checkIn = `${Math.floor(Math.random() * 2) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
            checkOut = `1${Math.floor(Math.random() * 2) + 7}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          } else if (rand < 0.95) { // 10% absent
            status = 'absent';
          } else { // 5% on leave
            status = 'on_leave';
          }
          
          records.push({
            id: `mock-${employeeId}-${dateStr}`,
            employee_id: employeeId,
            employee_name: employeeName,
            date: dateStr,
            status,
            check_in: checkIn,
            check_out: checkOut
          });
        }
      }
      
      setAttendance(records);
      setLoading(false);
    }, 1000);
  };

  const applyFilters = () => {
    if (attendance.length === 0) return;
    
    let filtered = [...attendance];
    
    // Apply date filters based on active tab
    if (activeTab === 'daily') {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(a => a.date === dateStr);
    } else if (activeTab === 'range' && fromDate && toDate) {
      const fromDateStr = format(fromDate, 'yyyy-MM-dd');
      const toDateStr = format(toDate, 'yyyy-MM-dd');
      filtered = filtered.filter(a => 
        a.date >= fromDateStr && a.date <= toDateStr
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    setFilteredAttendance(filtered);
  };

  const handleAddAttendance = async () => {
    try {
      // Basic validation
      if (!newAttendance.employee_id || !newAttendance.date || !newAttendance.status) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // For demo purposes, we'll just add to our local state
      const employee = employees.find(e => e.id === newAttendance.employee_id);
      
      const newRecord: AttendanceRecord = {
        id: `new-${Date.now()}`,
        employee_id: newAttendance.employee_id,
        employee_name: employee?.name,
        date: newAttendance.date,
        status: newAttendance.status as 'present' | 'absent' | 'late' | 'on_leave',
        check_in: newAttendance.status === 'present' || newAttendance.status === 'late' ? newAttendance.check_in : undefined,
        check_out: newAttendance.status === 'present' || newAttendance.status === 'late' ? newAttendance.check_out : undefined
      };
      
      setAttendance(prev => [newRecord, ...prev]);
      
      toast({
        title: "Success",
        description: "Attendance record added successfully"
      });
      
      // Reset form
      setNewAttendance({
        employee_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
        check_in: '09:00',
        check_out: '17:00'
      });
      setShowNewAttendanceForm(false);
      
    } catch (error: any) {
      console.error("Error adding attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add attendance record",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Present
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Late
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Absent
          </Badge>
        );
      case 'on_leave':
        return (
          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" /> Leave
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </Button>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-bold text-primary">Attendance Management</h1>
          </div>
          <div>
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>View and manage attendance</CardDescription>
              </div>
              <Button onClick={() => setShowNewAttendanceForm(true)}>
                Add Attendance Record
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily">Daily View</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="mt-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium mb-1 block">Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                          {format(selectedDate, 'MMM dd, yyyy')}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="range" className="mt-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium mb-1 block">From Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                          {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <span className="text-sm font-medium mb-1 block">To Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                          {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          disabled={!fromDate ? undefined : (date) => date < fromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by employee name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No attendance records found for the selected criteria
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAttendance.map(record => (
                  <div key={record.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{record.employee_name}</span>
                        <span className="text-sm text-gray-500">({record.employee_id})</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {format(new Date(record.date), 'EEEE, MMM d, yyyy')}
                      </div>
                      {(record.status === 'present' || record.status === 'late') && record.check_in && (
                        <div className="text-sm text-gray-600 mt-1">
                          {record.check_in} - {record.check_out || 'Not checked out'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Attendance Dialog */}
      <Dialog open={showNewAttendanceForm} onOpenChange={setShowNewAttendanceForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attendance Record</DialogTitle>
            <DialogDescription>
              Create a new attendance record for an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee *</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newAttendance.employee_id}
                onChange={(e) => setNewAttendance({...newAttendance, employee_id: e.target.value})}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input 
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newAttendance.status}
                onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            {(newAttendance.status === 'present' || newAttendance.status === 'late') && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check In Time</label>
                  <Input 
                    type="time"
                    value={newAttendance.check_in}
                    onChange={(e) => setNewAttendance({...newAttendance, check_in: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check Out Time</label>
                  <Input 
                    type="time"
                    value={newAttendance.check_out}
                    onChange={(e) => setNewAttendance({...newAttendance, check_out: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAttendanceForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAttendance}>
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
