'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Person, Lock, Email, Brightness4, Brightness7 } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useThemeContext } from '../context/ThemeContext';

export default function AuthPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useThemeContext();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <>
      {/* Animated Background Orbs */}
      <div className="bg-animation">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Container */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
          zIndex: 1, // Stay above the fixed background
        }}
      >
        {/* Theme Toggle Button */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ bgcolor: 'background.paper' }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              mb: 2,
              p: 1.5,
              borderRadius: 999,
              bgcolor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Image
              src="/alburhan-logo.png"
              alt="Al Burhan Group logo"
              width={80}
              height={80}
              className="brand-logo"
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Alburhan Regional
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administration Portal
          </Typography>
        </Box>

        {/* Auth Card */}
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 3,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(20px)',
            background: mode === 'dark' ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <CardContent sx={{ p: '0 !important' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {isLogin ? 'Sign in to your account' : 'Register for a new account'}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Common Fields */}
              <TextField
                fullWidth
                id="username"
                label="Username"
                placeholder={isLogin ? 'Enter your username' : 'Choose a username'}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              {!isLogin && (
                <>
                  <TextField
                    fullWidth
                    id="fullname"
                    label="Full Name"
                    placeholder="Your full name"
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="Your email address"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}

              <TextField
                fullWidth
                id="password"
                type="password"
                label="Password"
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, height: 48, fontWeight: 600, fontSize: '1.05rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              <Typography variant="body2" align="center">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setIsLogin(!isLogin)}
                  underline="hover"
                  sx={{ fontWeight: 600 }}
                >
                  {isLogin ? 'Create one' : 'Sign in'}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
