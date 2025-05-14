
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  phone?: string;
  profile_image: string;
  join_date: string;
  status: 'active' | 'inactive' | 'on_leave';
}

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New employee form state
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: '',
    name: '',
    department: '',
    position: '',
    email: '',
    phone: '',
  });
  
  // Employee edit state
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

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

    fetchEmployees();
  }, [navigate]);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      // Basic validation
      if (!newEmployee.id || !newEmployee.name || !newEmployee.department || !newEmployee.position) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Check if ID follows the pattern K followed by 5 digits
      const idPattern = /^K\d{5}$/;
      if (!idPattern.test(newEmployee.id)) {
        toast({
          title: "Invalid Employee ID",
          description: "ID must be in format K followed by 5 digits (e.g., K14050)",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('employees')
        .insert([{
          id: newEmployee.id,
          name: newEmployee.name,
          department: newEmployee.department,
          position: newEmployee.position,
          email: newEmployee.email || null,
          phone: newEmployee.phone || null,
          profile_image: '/placeholder.svg'
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee added successfully"
      });
      
      // Reset form and refresh list
      setNewEmployee({
        id: '',
        name: '',
        department: '',
        position: '',
        email: '',
        phone: ''
      });
      setShowNewEmployeeForm(false);
      fetchEmployees();
      
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployee(employee);
    setShowEditForm(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editEmployee) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: editEmployee.name,
          department: editEmployee.department,
          position: editEmployee.position,
          email: editEmployee.email || null,
          phone: editEmployee.phone || null,
          status: editEmployee.status
        })
        .eq('id', editEmployee.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee updated successfully"
      });
      
      setShowEditForm(false);
      fetchEmployees();
      
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee deleted successfully"
      });
      
      fetchEmployees();
      
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-amber-100 text-amber-800">On Leave</Badge>;
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
            <h1 className="text-xl font-bold text-primary">Employee Management</h1>
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
                <CardTitle>Employees</CardTitle>
                <CardDescription>Manage all employees</CardDescription>
              </div>
              <Button onClick={() => setShowNewEmployeeForm(true)}>
                Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search by name, ID, department, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No employees found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees.map(employee => (
                  <div key={employee.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:space-x-4">
                          <span>ID: {employee.id}</span>
                          <span>{employee.department} - {employee.position}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                      {getStatusBadge(employee.status)}
                      <Button variant="outline" size="sm" onClick={() => handleEditEmployee(employee)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteEmployee(employee.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Employee Dialog */}
      <Dialog open={showNewEmployeeForm} onOpenChange={setShowNewEmployeeForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details for the new employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee ID *</label>
              <Input 
                placeholder="K followed by 5 digits (e.g., K14050)"
                value={newEmployee.id}
                onChange={(e) => setNewEmployee({...newEmployee, id: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input 
                placeholder="Full name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Input 
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position *</label>
              <Input 
                placeholder="Job position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                placeholder="Email address"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input 
                placeholder="Phone number"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEmployeeForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information
            </DialogDescription>
          </DialogHeader>
          {editEmployee && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-gray-500">
                Employee ID: {editEmployee.id}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={editEmployee.name}
                  onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input 
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({...editEmployee, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input 
                  value={editEmployee.position}
                  onChange={(e) => setEditEmployee({...editEmployee, position: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={editEmployee.email || ''}
                  onChange={(e) => setEditEmployee({...editEmployee, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editEmployee.status}
                  onChange={(e) => setEditEmployee({...editEmployee, status: e.target.value as 'active' | 'inactive' | 'on_leave'})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
