'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, IconButton, Fade } from '@mui/material';
import { People, Business, AccountTree, Image as ImageIcon, Category, Flag } from '@mui/icons-material';

const stats = [
  { title: 'Total Users', value: 154, icon: <People fontSize="large" />, color: '#d32f2f' },
  { title: 'Total Projects', value: 42, icon: <AccountTree fontSize="large" />, color: '#1976d2' },
  { title: 'Branches', value: 8, icon: <Business fontSize="large" />, color: '#388e3c' },
  { title: 'Categories', value: 12, icon: <Category fontSize="large" />, color: '#f57c00' },
  { title: 'Countries Supported', value: 5, icon: <Flag fontSize="large" />, color: '#7b1fa2' },
  { title: 'Project Images', value: 340, icon: <ImageIcon fontSize="large" />, color: '#0097a7' },
];

export default function DashboardHome() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Fade in timeout={500 + i * 150}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  transform: 'translateY(0)',
                  transition: 'transform 200ms ease-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    mr: 2,
                    borderRadius: 2,
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: '0 !important' }}>
                  <Typography color="text.secondary" variant="subtitle2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
