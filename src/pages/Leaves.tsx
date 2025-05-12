
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';

interface Leave {
  id: string;
  date: string;
  type: 'PL' | 'CL' | 'SL' | 'OD' | 'Other';
  reason: string;
  approved: boolean;
}

// Function to generate mock leave data
const generateMockLeaves = (userId: string): Leave[] => {
  const leaves: Leave[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Generate leaves for past 6 months
  for (let month = 0; month < 6; month++) {
    const monthDate = new Date(currentYear, currentDate.getMonth() - month, 1);
    const leaveCount = Math.floor(Math.random() * 3); // 0-2 leaves per month
    
    for (let i = 0; i < leaveCount; i++) {
      const leaveTypes = ['PL', 'CL', 'SL', 'OD', 'Other'] as const;
      const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const day = Math.floor(Math.random() * 28) + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      
      let reason = '';
      switch(type) {
        case 'PL':
          reason = 'Personal leave';
          break;
        case 'CL':
          reason = 'Casual leave';
          break;
        case 'SL':
          reason = 'Sick leave - Fever';
          break;
        case 'OD':
          reason = 'Official duty - Client meeting';
          break;
        case 'Other':
          reason = 'Family function';
          break;
      }
      
      leaves.push({
        id: `${userId}-${date.getTime()}`,
        date: date.toISOString().split('T')[0],
        type,
        reason,
        approved: Math.random() > 0.2 // 80% chance of approval
      });
    }
  }

  // Sort leaves by date (newest first)
  return leaves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getLeaveTypeColor = (type: Leave['type']): string => {
  switch(type) {
    case 'PL':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'CL':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'SL':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'OD':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'Other':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
  }
};

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      const mockLeaves = generateMockLeaves(user.id);
      setLeaves(mockLeaves);
    }
  }, [user?.id]);
  
  // Group leaves by month
  const groupedLeaves: Record<string, Leave[]> = {};
  leaves.forEach(leave => {
    const date = new Date(leave.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groupedLeaves[monthYear]) {
      groupedLeaves[monthYear] = [];
    }
    groupedLeaves[monthYear].push(leave);
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Leave History" />
      
      <main className="container mx-auto px-4 py-6">
        {Object.keys(groupedLeaves).length > 0 ? (
          Object.keys(groupedLeaves).map(month => (
            <Card key={month} className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{month}</CardTitle>
                <CardDescription>Leave history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {groupedLeaves[month].map((leave, index) => (
                    <div key={leave.id}>
                      <div className="flex justify-between items-center py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{format(new Date(leave.date), 'EEE, MMM d')}</p>
                            <Badge className={getLeaveTypeColor(leave.type)}>
                              {leave.type}
                            </Badge>
                            {leave.approved ? (
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{leave.reason}</p>
                        </div>
                      </div>
                      {index < groupedLeaves[month].length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-center items-center">
              <p className="text-gray-500">No leave history found</p>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default Leaves;
