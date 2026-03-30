import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Shield } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function AdminUsers() {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at');

    if (profilesError) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      toast.error('Failed to load roles');
      setLoading(false);
      return;
    }

    const { data: authUsers } = await supabase
      .rpc('get_users_with_emails');

    const combinedUsers = (profiles || []).map((profile: any) => {
      const userRole = roles?.find((r: any) => r.user_id === profile.id);
      const authUser = authUsers?.find((u: any) => u.id === profile.id);
      
      return {
        id: profile.id,
        email: authUser?.email || 'N/A',
        full_name: profile.full_name,
        phone: profile.phone,
        role: userRole?.role || 'traveler',
        created_at: profile.created_at
      };
    });

    setUsers(combinedUsers);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: newRole,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to update role');
      console.error(error);
    } else {
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase.rpc('delete_user', { user_id: userId });

    if (error) {
      toast.error('Failed to delete user');
      console.error(error);
    } else {
      toast.success('User deleted');
      fetchUsers();
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      case 'traveler': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Badge className="bg-red-100 text-red-800">Admin Only</Badge>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Phone: {user.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={user.role} 
                    onValueChange={(val) => updateRole(user.id, val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traveler">Traveler</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
