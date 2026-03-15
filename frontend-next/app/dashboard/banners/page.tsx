'use client';

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Fade,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Image as ImageIcon,
  Add,
  Edit,
  Delete as DeleteIcon,
  Refresh,
} from '@mui/icons-material';

type Banner = {
  id: number;
  bannername: string;
  bannerdescription?: string | null;
  info1?: string | null;
  countryid?: number | null;
  bannertype?: string | null;
  isactive?: boolean | null;
  sequencenumber?: number | null;
  bannerurl?: string | null;
  position?: string | null;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<Banner, 'id'> = {
  bannername: '',
  bannerdescription: '',
  info1: '',
  countryid: undefined,
  bannertype: '',
  isactive: true,
  sequencenumber: undefined,
  bannerurl: '',
  position: '',
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, 'id'>>(initialForm);
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

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/banners/`);
      const data: ApiResult<Banner[]> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to load banners', 'error');
        return;
      }
      setBanners(data.result || []);
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to banner API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      bannername: banner.bannername,
      bannerdescription: banner.bannerdescription ?? '',
      info1: banner.info1 ?? '',
      countryid: banner.countryid ?? undefined,
      bannertype: banner.bannertype ?? '',
      isactive: banner.isactive ?? true,
      sequencenumber: banner.sequencenumber ?? undefined,
      bannerurl: banner.bannerurl ?? '',
      position: banner.position ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.bannername.trim()) {
      showMessage('Banner name is required', 'error');
      return;
    }

    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/banners/${editing.id}` : `${apiBase}/banners/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResult<Banner> = await res.json();

      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }

      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Banner updated' : 'Banner created', 'success');
      fetchBanners();
    } catch (err) {
      console.error(err);
      showMessage('Error saving banner', 'error');
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Delete banner "${banner.bannername}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/banners/${banner.id}`, { method: 'DELETE' });
      const data: ApiResult<Banner> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete banner', 'error');
        return;
      }
      showMessage('Banner deleted', 'success');
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting banner', 'error');
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
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

      setForm((prev) => ({ ...prev, bannerurl: data.result.url }));
      showMessage('Image uploaded', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Error uploading image', 'error');
    } finally {
      // reset so the same file can be selected again
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
            Banners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hero banners and promotional visuals across the portal.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchBanners} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 999 }}
            onClick={openCreate}
          >
            New Banner
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {banners.map((banner, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={banner.id}>
            <Fade in timeout={450 + index * 150}>
              <Card
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    background:
                      'radial-gradient(circle at 0 0, rgba(211,47,47,0.5), transparent 60%)',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ImageIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {banner.bannername}
                        </Typography>
                        {banner.bannertype && (
                          <Typography variant="caption" color="text.secondary">
                            Type: {banner.bannertype}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={banner.isactive ? 'Active' : 'Inactive'}
                      size="small"
                      color={banner.isactive ? 'success' : 'default'}
                    />
                  </Box>

                  {banner.bannerdescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {banner.bannerdescription}
                    </Typography>
                  )}
                  {banner.bannerurl && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box
                        component="img"
                        src={resolveImageUrl(banner.bannerurl)}
                        alt={banner.bannername}
                        sx={{
                          width: '100%',
                          maxHeight: 140,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(banner)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(banner)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}

        {!loading && banners.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No banners yet. Click &quot;New Banner&quot; to create one.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            margin="normal"
            label="Banner Name"
            fullWidth
            required
            value={form.bannername}
            onChange={(e) => setForm((f) => ({ ...f, bannername: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={form.bannerdescription ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, bannerdescription: e.target.value }))}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            {form.bannerurl && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Image:
                </Typography>
                <Box
                  component="img"
                  src={resolveImageUrl(form.bannerurl)}
                  alt="Banner Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 140,
                    objectFit: 'cover',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}
            <Button variant="outlined" component="label">
              {form.bannerurl ? 'Change Image' : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
          </Box>
          <TextField
            margin="normal"
            label="Type"
            fullWidth
            value={form.bannertype ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, bannertype: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Position"
            fullWidth
            value={form.position ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
          />
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
