import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate for buttons
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// IconButton removed - no back button needed
import Typography from '@mui/material/Typography';
// ArrowBackIcon removed
import BookSearchIcon from '@mui/icons-material/Search'; // Use the correct icon name found previously
import AddBoxIcon from '@mui/icons-material/AddBox';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import ActionButton from './ActionButton';
import { colors } from '../styles/colors';

const MainScreen = () => {
  const navigate = useNavigate(); // Still needed for navigating to other screens

  // handleGoBack function removed

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: '30px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Center vertically
          alignItems: 'center', // Center horizontally
          height: '100%', // Ensure the box takes up the full height
        }}
      >
        <ActionButton
          title="Review Words"
          IconComponent={BookSearchIcon}
          color={colors.primary}
          onClick={() => navigate('/review')} // Navigate to review screen
        />
        <ActionButton
          title="Add Words"
          IconComponent={AddBoxIcon}
          color={colors.secondary}
          onClick={() => navigate('/add')} // Navigate to add screen
        />
        <ActionButton
          title="Set Keys"
          IconComponent={VpnKeyIcon}
          color={colors.tertiary}
          onClick={() => navigate('/settings')} // Navigate to settings screen
        />
      </Box>
    </Box>
  );
};

export default MainScreen;