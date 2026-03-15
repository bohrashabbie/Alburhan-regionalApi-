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
  Chip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import { Flag, Add, Edit, Delete as DeleteIcon, Refresh } from '@mui/icons-material';
import { getData } from 'country-list';

type Country = {
  id: number;
  countrynameen?: string | null;
  countrynamear?: string | null;
  isactive?: boolean | null;
  sequencenumber?: number | null;
  logourl?: string | null;
  countryurl?: string | null;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<Country, 'id'> = {
  countrynameen: '',
  countrynamear: '',
  isactive: true,
  sequencenumber: undefined,
  logourl: '',
  countryurl: '',
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [form, setForm] = useState<Omit<Country, 'id'>>(initialForm);
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

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/countries/`);
      const data: ApiResult<Country[]> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to load countries', 'error');
        return;
      }
      setCountries(data.result || []);
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to country API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (country: Country) => {
    setEditing(country);
    setForm({
      countrynameen: country.countrynameen ?? '',
      countrynamear: country.countrynamear ?? '',
      isactive: country.isactive ?? true,
      sequencenumber: country.sequencenumber ?? undefined,
      logourl: country.logourl ?? '',
      countryurl: country.countryurl ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.countrynameen?.trim()) {
      showMessage('English country name is required', 'error');
      return;
    }

    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/countries/${editing.id}` : `${apiBase}/countries/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResult<Country> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Country updated' : 'Country created', 'success');
      fetchCountries();
    } catch (err) {
      console.error(err);
      showMessage('Error saving country', 'error');
    }
  };

  const handleDelete = async (country: Country) => {
    if (!window.confirm(`Delete country "${country.countrynameen}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/countries/${country.id}`, { method: 'DELETE' });
      const data: ApiResult<Country> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete country', 'error');
        return;
      }
      showMessage('Country deleted', 'success');
      setCountries((prev) => prev.filter((c) => c.id !== country.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting country', 'error');
    }
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiBase}/countries/upload-logo`, {
        method: 'POST',
        body: formData,
      });

      const data: ApiResult<{ url: string }> = await res.json();
      if (!data.success || !data.result?.url) {
        showMessage(data.error || 'Failed to upload logo', 'error');
        return;
      }

      setForm((prev) => ({ ...prev, logourl: data.result.url }));
      showMessage('Logo uploaded', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Error uploading logo', 'error');
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
            Countries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage supported countries for Alburhan operations.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCountries} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 999 }}
            onClick={openCreate}
          >
            New Country
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>English Name</TableCell>
              <TableCell>Arabic Name</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>Country URL</TableCell>
              <TableCell align="center">Sequence</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {countries.map((country, index) => (
              <TableRow key={country.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{country.countrynameen}</TableCell>
                <TableCell>{country.countrynamear}</TableCell>
                <TableCell sx={{ maxWidth: 120 }}>
                  {country.logourl ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(country.logourl)}
                      alt={country.countrynameen || ''}
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: '50%',
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
                <TableCell sx={{ maxWidth: 160 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {country.countryurl}
                  </Typography>
                </TableCell>
                <TableCell align="center">{country.sequencenumber ?? '-'}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={country.isactive ? 'Active' : 'Inactive'}
                    color={country.isactive ? 'success' : 'default'}
                    icon={<Flag fontSize="small" />}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(country)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(country)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {!loading && countries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography variant="body2" color="text.secondary">
                    No countries yet. Click &quot;New Country&quot; to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Country' : 'New Country'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Autocomplete
            options={getData().map((c) => c.name)}
            value={form.countrynameen || null}
            onChange={(_, newValue) => setForm((f) => ({ ...f, countrynameen: newValue || '' }))}
            renderInput={(params) => <TextField {...params} label="Country Name (English)" margin="normal" fullWidth required />}
          />
          <TextField
            margin="normal"
            label="Country Name (Arabic)"
            fullWidth
            value={form.countrynamear ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, countrynamear: e.target.value }))}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Upload Logo
              <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </Button>
            {form.logourl && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color="text.secondary">
                Uploaded: {form.logourl}
              </Typography>
            )}
          </Box>
          <TextField
            margin="normal"
            label="Country URL"
            fullWidth
            value={form.countryurl ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, countryurl: e.target.value }))}
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

