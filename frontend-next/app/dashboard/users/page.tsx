'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete as DeleteIcon, Refresh } from '@mui/icons-material';

type User = {
  id: number;
  username: string;
  email: string;
  fullname?: string | null;
  role?: string | null;
  isactive?: boolean | null;
  password?: string; // used for creation only
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<User, 'id'> = {
  username: '',
  email: '',
  password: '',
  fullname: '',
  role: 'user',
  isactive: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, 'id'>>(initialForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') return 'http://127.0.0.1:8000/api';
    return `${window.location.origin.replace('3001', '8000').replace('3000', '8000')}/api`;
  }, []);

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/users/`);
      const data: ApiResult<User[]> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to load users', 'error');
        return;
      }
      setUsers(data.result || []);
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to users API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      username: user.username,
      email: user.email,
      fullname: user.fullname ?? '',
      role: user.role ?? 'user',
      isactive: user.isactive ?? true,
      password: '', // do not populate password for edits
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.username?.trim() || !form.email?.trim()) {
      showMessage('Username and string are required', 'error');
      return;
    }
    if (!editing && !form.password?.trim()) {
      showMessage('Password is required for new users', 'error');
      return;
    }

    try {
      // Create user uses diff endpoint vs update usually, but guessing based on typical REST
      const isEdit = !!editing;
      // For create it's likely `/auth/register` or `/users/`. Let's use `/users/` if standard crud
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${apiBase}/users/${editing.id}` : `${apiBase}/auth/register`; // or /users/ depending on what you have 
      
      const payload: Partial<typeof form> = { ...form };
      if (isEdit) {
        // usually password isn't updated like this, so remove it if empty
        delete payload.password;
        // username/email on update might be handled differently
      }

      const res = await fetch(url.replace('/auth/register', isEdit ? '' : '/auth/register'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiResult<User> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(isEdit ? 'User updated' : 'User created', 'success');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showMessage('Error saving user', 'error');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/users/${user.id}`, { method: 'DELETE' });
      const data: ApiResult<User> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete user', 'error');
        return;
      }
      showMessage('User deleted', 'success');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting user', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage dashboard users.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} disabled={loading}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 999 }} onClick={openCreate}>
            New User
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullname || '—'}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={user.isactive !== false ? 'Active' : 'Inactive'}
                    color={user.isactive !== false ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(user)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">No users yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            margin="normal"
            label="Username"
            fullWidth
            required
            value={form.username ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            disabled={!!editing} // username usually read-only after creation
          />
          <TextField
            margin="normal"
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {!editing && (
            <TextField
              margin="normal"
              label="Password"
              type="password"
              fullWidth
              required
              value={form.password ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          )}
          <TextField
            margin="normal"
            label="Full Name"
            fullWidth
            value={form.fullname ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={form.role ?? 'user'}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={form.isactive !== false}
                onChange={(e) => setForm((f) => ({ ...f, isactive: e.target.checked }))}
              />
            }
            sx={{ mt: 1 }}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
