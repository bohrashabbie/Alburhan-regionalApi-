'use client';

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
import { Add, Edit, Delete as DeleteIcon, Refresh, ImageIcon } from '@mui/icons-material';

type ProjectImage = {
  id: number;
  projectid?: number | null;
  projectimageurl?: string | null;
  sequencenumber?: number | null;
  isactive?: boolean | null;
};

type Project = {
  id: number;
  projectname: string;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<ProjectImage, 'id'> = {
  projectid: undefined,
  projectimageurl: '',
  sequencenumber: undefined,
  isactive: true,
};

export default function ProjectImagesPage() {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectImage | null>(null);
  const [form, setForm] = useState<Omit<ProjectImage, 'id'>>(initialForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') return 'http://127.0.0.1:8000/api';
    return `${window.location.origin.replace('3001', '8000').replace('3000', '8000')}/api`;
  }, []);

  const backendBase = useMemo(() => apiBase.replace(/\/api$/, ''), [apiBase]);

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      const [resImg, resProj] = await Promise.all([
        fetch(`${apiBase}/project-images/`),
        fetch(`${apiBase}/projects/`),
      ]);

      const dataImg: ApiResult<ProjectImage[]> = await resImg.json();
      const dataProj: ApiResult<Project[]> = await resProj.json();

      if (dataImg.success) setImages(dataImg.result || []);
      if (dataProj.success) setProjects(dataProj.result || []);
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

  const openEdit = (image: ProjectImage) => {
    setEditing(image);
    setForm({
      projectid: image.projectid,
      projectimageurl: image.projectimageurl ?? '',
      sequencenumber: image.sequencenumber,
      isactive: image.isactive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/project-images/${editing.id}` : `${apiBase}/project-images/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResult<ProjectImage> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Image updated' : 'Image created', 'success');
      fetchDependencies();
    } catch (err) {
      console.error(err);
      showMessage('Error saving project image', 'error');
    }
  };

  const handleDelete = async (image: ProjectImage) => {
    if (!window.confirm(`Delete this image?`)) return;
    try {
      const res = await fetch(`${apiBase}/project-images/${image.id}`, { method: 'DELETE' });
      const data: ApiResult<ProjectImage> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete image', 'error');
        return;
      }
      showMessage('Image deleted', 'success');
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting image', 'error');
    }
  };
  
  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${apiBase}/banners/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data: ApiResult<{ url: string }> = await res.json();
      if (!data.success || !data.result?.url) {
        showMessage(data.error || 'Failed to upload image', 'error');
        return;
      }

      setForm((prev) => ({ ...prev, projectimageurl: data.result.url }));
      showMessage('Image uploaded', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Error uploading image', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const getProjectName = (projectId?: number | null) => {
    if (!projectId) return '—';
    return projects.find((p) => p.id === projectId)?.projectname || `ID: ${projectId}`;
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${backendBase}${url}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Project Images</Typography>
          <Typography variant="body2" color="text.secondary">Manage images for your projects.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDependencies} disabled={loading}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 999 }} onClick={openCreate}>
            New Image
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Image</TableCell>
              <TableCell align="center">Sequence</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {images.map((image, index) => (
              <TableRow key={image.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{getProjectName(image.projectid)}</TableCell>
                <TableCell sx={{ maxWidth: 120 }}>
                  {image.projectimageurl ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(image.projectimageurl)}
                      alt="Project"
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell align="center">{image.sequencenumber ?? '-'}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={image.isactive ? 'Active' : 'Inactive'}
                    color={image.isactive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(image)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(image)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && images.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">No images yet. Click &quot;New Image&quot; to create one.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Image' : 'New Image'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              label="Project"
              value={form.projectid ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, projectid: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.projectname}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleUploadImage} />
            </Button>
            {form.projectimageurl && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color="text.secondary">
                Uploaded: {form.projectimageurl}
              </Typography>
            )}
          </Box>
          <TextField
            margin="normal"
            label="Sequence Number"
            type="number"
            fullWidth
            value={form.sequencenumber ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                sequencenumber: e.target.value === '' ? undefined : Number(e.target.value),
              }))
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!form.isactive}
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
