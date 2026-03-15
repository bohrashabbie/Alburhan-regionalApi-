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
  FormControlLabel,
  Switch,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete as DeleteIcon, Refresh } from '@mui/icons-material';
import { Box as MuiBox } from '@mui/system';

type Branch = {
  id: number;
  countryid?: number | null;
  email?: string | null;
  countrycode?: string | null;
  branchname?: string | null;
  branchaddress?: string | null;
  contact1?: string | null;
  contact2?: string | null;
  isactive?: boolean | null;
};

type Country = {
  id: number;
  countrynameen?: string | null;
  countrynamear?: string | null;
};

type CountryOption = {
  id: number;
  englishName: string;
  arabicName?: string;
  displayLabel: string;
};

type ApiResult<T> = {
  result: T;
  statusCode: number;
  success: boolean;
  error?: string | null;
};

const initialForm: Omit<Branch, 'id'> & { selectedCountryName?: string } = {
  countryid: undefined,
  email: '',
  countrycode: '',
  branchname: '',
  branchaddress: '',
  contact1: '',
  contact2: '',
  isactive: true,
  selectedCountryName: '',
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<Omit<Branch, 'id'> & { selectedCountryName?: string }>(initialForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const isEmailValid = useMemo(() => {
    if (!form.email) return true;
    return emailPattern.test(form.email.trim());
  }, [form.email]);

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') return 'http://127.0.0.1:8000/api';
    return `${window.location.origin.replace('3001', '8000').replace('3000', '8000')}/api`;
  }, []);

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const countryOptions = useMemo<CountryOption[]>(() => {
    return countries.map((country) => {
      const english = country.countrynameen?.trim() || '';
      const arabic = country.countrynamear?.trim() || '';
      const fallback = english || arabic || `Country #${country.id}`;
      return {
        id: country.id,
        englishName: english || fallback,
        arabicName: arabic || undefined,
        displayLabel: arabic ? `${fallback} / ${arabic}` : fallback,
      };
    });
  }, [countries]);

  const selectedCountryOption = useMemo(() => {
    if (!form.countryid) return null;
    return countryOptions.find((option) => option.id === form.countryid) || null;
  }, [countryOptions, form.countryid]);

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      const [resBranch, resCountry] = await Promise.all([
        fetch(`${apiBase}/branches/`),
        fetch(`${apiBase}/countries/`),
      ]);

      const dataBranch: ApiResult<Branch[]> = await resBranch.json();
      const dataCountry: ApiResult<Country[]> = await resCountry.json();

      if (dataBranch.success) setBranches(dataBranch.result || []);
      if (dataCountry.success) setCountries(dataCountry.result || []);
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

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    
    // Find country name from the existing countries list directly
    const matchingCountry = branch.countryid 
      ? countries.find((c) => c.id === branch.countryid) 
      : null;
      
    setForm({
      countryid: branch.countryid,
      email: branch.email ?? '',
      countrycode: branch.countrycode ?? '',
      branchname: branch.branchname ?? '',
      branchaddress: branch.branchaddress ?? '',
      contact1: branch.contact1 ?? '',
      contact2: branch.contact2 ?? '',
      isactive: branch.isactive ?? true,
      selectedCountryName: matchingCountry?.countrynameen ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.branchname?.trim()) {
      showMessage('Branch name is required', 'error');
      return;
    }
    
    // Email validation
    if (!isEmailValid) {
      showMessage('Invalid email address format', 'error');
      return;
    }

    try {
      let finalCountryId = form.countryid;
      const selectedName = form.selectedCountryName?.trim();
      const containsArabicChars = selectedName ? /[\u0600-\u06FF]/.test(selectedName) : false;

      // Automatically create or fetch the country from db if they selected a name
      if (!finalCountryId && selectedName) {
        const existing = countries.find(
          (c) => c.countrynameen === selectedName || c.countrynamear === selectedName
        );
        if (existing) {
          finalCountryId = existing.id;
        } else {
          // Create matching country in db
          const cRes = await fetch(`${apiBase}/countries/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              countrynameen: containsArabicChars ? undefined : selectedName,
              countrynamear: containsArabicChars ? selectedName : undefined,
              isactive: true,
            })
          });
          const cData: ApiResult<Country> = await cRes.json();
          if (cData.success && cData.result) {
            finalCountryId = cData.result.id;
          }
        }
      } else if (!selectedName) {
        finalCountryId = undefined; // Cleared
      }

      const payload = {
        ...form,
        countryid: finalCountryId,
      };
      delete payload.selectedCountryName;

      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/branches/${editing.id}` : `${apiBase}/branches/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiResult<Branch> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Operation failed', 'error');
        return;
      }
      setDialogOpen(false);
      setEditing(null);
      showMessage(editing ? 'Branch updated' : 'Branch created', 'success');
      fetchDependencies();
    } catch (err) {
      console.error(err);
      showMessage('Error saving branch', 'error');
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!window.confirm(`Delete branch "${branch.branchname}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/branches/${branch.id}`, { method: 'DELETE' });
      const data: ApiResult<Branch> = await res.json();
      if (!data.success) {
        showMessage(data.error || 'Failed to delete branch', 'error');
        return;
      }
      showMessage('Branch deleted', 'success');
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
    } catch (err) {
      console.error(err);
      showMessage('Error deleting branch', 'error');
    }
  };

  const getCountryName = (countryId?: number | null) => {
    if (!countryId) return '—';
    const match = countries.find((c) => c.id === countryId);
    if (!match) return `ID: ${countryId}`;
    if (match.countrynameen && match.countrynamear) {
      return `${match.countrynameen} / ${match.countrynamear}`;
    }
    return match.countrynameen || match.countrynamear || `ID: ${countryId}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Branches</Typography>
          <Typography variant="body2" color="text.secondary">Manage company branch locations.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDependencies} disabled={loading}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 999 }} onClick={openCreate}>
            New Branch
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch, index) => (
              <TableRow key={branch.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{branch.branchname}</TableCell>
                <TableCell>{getCountryName(branch.countryid)}</TableCell>
                <TableCell>{branch.email || '—'}</TableCell>
                <TableCell>{branch.contact1 || '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={branch.isactive ? 'Active' : 'Inactive'}
                    color={branch.isactive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(branch)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(branch)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && branches.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">No branches yet. Click &quot;New Branch&quot; to create one.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Branch' : 'New Branch'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Autocomplete
            freeSolo
            options={countryOptions}
            value={
              selectedCountryOption
                ? selectedCountryOption
                : form.selectedCountryName
                ? form.selectedCountryName
                : null
            }
            inputValue={
              form.selectedCountryName || selectedCountryOption?.englishName || ''
            }
            onInputChange={(_, newInputValue) =>
              setForm((f) => ({ ...f, selectedCountryName: newInputValue }))
            }
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                setForm((f) => ({ ...f, selectedCountryName: newValue, countryid: undefined }));
              } else if (newValue) {
                setForm((f) => ({
                  ...f,
                  selectedCountryName: newValue.englishName,
                  countryid: newValue.id,
                }));
              } else {
                setForm((f) => ({ ...f, selectedCountryName: '', countryid: undefined }));
              }
            }}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.displayLabel
            }
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <MuiBox sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.englishName}
                  </Typography>
                  {option.arabicName && (
                    <Typography variant="caption" color="text.secondary">
                      {option.arabicName}
                    </Typography>
                  )}
                </MuiBox>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                margin="normal"
                fullWidth
                helperText="Select an existing country or type a new name"
              />
            )}
          />
          <TextField
            margin="normal"
            label="Branch Name"
            fullWidth
            required
            value={form.branchname ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, branchname: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Branch Address"
            multiline
            rows={2}
            fullWidth
            value={form.branchaddress ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, branchaddress: e.target.value }))}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="normal"
              label="Country Code"
              sx={{ width: '40%' }}
              value={form.countrycode ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, countrycode: e.target.value }))}
            />
            <TextField
              margin="normal"
              label="Contact 1"
              fullWidth
              value={form.contact1 ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, contact1: e.target.value }))}
            />
          </Box>
          <TextField
            margin="normal"
            label="Contact 2"
            fullWidth
            value={form.contact2 ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contact2: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Email"
            type="email"
            fullWidth
            value={form.email ?? ''}
            error={!isEmailValid}
            helperText={!isEmailValid ? 'Enter a valid email address' : undefined}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
