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
} from '@mui/material';
import { Add, Edit, Delete as DeleteIcon, Refresh } from '@mui/icons-material';

type Category = {
  id: number;
  category_name: string;
  cover_image_url?: string | null;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<Category, 'id'> = {
  category_name: '',
  cover_image_url: '',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(initialForm);
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/project-categories/`);
      const data: ApiResult<Category[]> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to load categories', 'error');
        return;
      }
      setCategories(data.result || []);
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to categories API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      category_name: category.category_name ?? '',
      cover_image_url: category.cover_image_url ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.category_name?.trim()) {
      showMessage('Category name is required', 'error');
      return;
    }

    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/project-categories/${editing.id}` : `${apiBase}/project-categories/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResult<Category> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Category updated' : 'Category created', 'success');
      fetchCategories();
    } catch (err) {
      console.error(err);
      showMessage('Error saving category', 'error');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.category_name}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/project-categories/${category.id}`, { method: 'DELETE' });
      const data: ApiResult<Category> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete category', 'error');
        return;
      }
      showMessage('Category deleted', 'success');
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting category', 'error');
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Assuming banner-like or project-like image upload endpoint. 
      // If project-categories lacks a dedicated image upload endpoint, you may want to re-use an existing one or provide a URL manually.
      showMessage('Image upload might need a dedicated endpoint backend side, using URL for now if fails', 'success');
      
      const res = await fetch(`${apiBase}/banners/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data: ApiResult<{ url: string }> = await res.json();
      if (!data.success || !data.result?.url) {
        showMessage(data.error || 'Failed to upload image', 'error');
        return;
      }

      setForm((prev) => ({ ...prev, cover_image_url: data.result.url }));
      showMessage('Image uploaded', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Error uploading image', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${backendBase}${url}`;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Project Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage project categories.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCategories} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 999 }}
            onClick={openCreate}
          >
            New Category
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Category Name</TableCell>
              <TableCell>Cover Image</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{category.category_name}</TableCell>
                <TableCell sx={{ maxWidth: 120 }}>
                  {category.cover_image_url ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(category.cover_image_url)}
                      alt={category.category_name || ''}
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
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(category)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(category)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No categories yet. Click &quot;New Category&quot; to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            margin="normal"
            label="Category Name"
            fullWidth
            required
            value={form.category_name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Upload Image (uses general upload)
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {form.cover_image_url && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color="text.secondary">
                Uploaded: {form.cover_image_url}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
