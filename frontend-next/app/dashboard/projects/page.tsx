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
} from '@mui/material';
import { Add, Edit, Delete as DeleteIcon, Refresh } from '@mui/icons-material';

type Project = {
  id: number;
  categoryid?: number | null;
  projectname: string;
  projectdescription?: string | null;
};

type Category = {
  id: number;
  category_name: string;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<Project, 'id'> = {
  categoryid: undefined,
  projectname: '',
  projectdescription: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(initialForm);
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

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      const [resProj, resCat] = await Promise.all([
        fetch(`${apiBase}/projects/`),
        fetch(`${apiBase}/project-categories/`),
      ]);

      const dataProj: ApiResult<Project[]> = await resProj.json();
      const dataCat: ApiResult<Category[]> = await resCat.json();

      if (dataProj.success) setProjects(dataProj.result || []);
      if (dataCat.success) setCategories(dataCat.result || []);
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      categoryid: project.categoryid,
      projectname: project.projectname,
      projectdescription: project.projectdescription ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.projectname?.trim()) {
      showMessage('Project name is required', 'error');
      return;
    }

    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/projects/${editing.id}` : `${apiBase}/projects/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResult<Project> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Project updated' : 'Project created', 'success');
      fetchDependencies();
    } catch (err) {
      console.error(err);
      showMessage('Error saving project', 'error');
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete project "${project.projectname}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/projects/${project.id}`, { method: 'DELETE' });
      const data: ApiResult<Project> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete project', 'error');
        return;
      }
      showMessage('Project deleted', 'success');
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting project', 'error');
    }
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId) return '—';
    return categories.find((c) => c.id === categoryId)?.category_name || `ID: ${categoryId}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Projects</Typography>
          <Typography variant="body2" color="text.secondary">Manage your projects.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDependencies} disabled={loading}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 999 }} onClick={openCreate}>
            New Project
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={project.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{project.projectname}</TableCell>
                <TableCell>{getCategoryName(project.categoryid)}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}><Typography noWrap variant="body2">{project.projectdescription || '—'}</Typography></TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(project)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(project)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">No projects yet. Click &quot;New Project&quot; to create one.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Project' : 'New Project'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              label="Category"
              value={form.categoryid ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryid: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.category_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            label="Project Name"
            fullWidth
            required
            value={form.projectname ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, projectname: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Project Description"
            multiline
            rows={3}
            fullWidth
            value={form.projectdescription ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, projectdescription: e.target.value }))}
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
