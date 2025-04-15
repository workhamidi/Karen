import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import BookSearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ActionButton from './ActionButton';
import { useSettings } from '../context/SettingsContext';
import theme from '../styles/theme';

const MainScreen = () => {
  const navigate = useNavigate();
  const { appLanguage, selectedTheme } = useSettings();

  // Get theme colors
  const primaryColor = theme.palette.primary.main(selectedTheme);
  const secondaryColor = theme.palette.secondary.main(selectedTheme);
  const errorColor = theme.palette.error.main(selectedTheme); // Using error color for the third button

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${theme.palette.background.gradientStart(selectedTheme)}, ${theme.palette.background.gradientEnd(selectedTheme)})`,
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
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <ActionButton
          title={appLanguage === 'fa' ? 'مرور کلمات' : 'Review Words'}
          IconComponent={BookSearchIcon}
          color={primaryColor}
          onClick={() => navigate('/review')}
        />
        <ActionButton
          title={appLanguage === 'fa' ? 'افزودن کلمات' : 'Add Words'}
          IconComponent={AddBoxIcon}
          color={secondaryColor}
          onClick={() => navigate('/add')}
        />
        <ActionButton
          title={appLanguage === 'fa' ? 'تنظیم کلیدها' : 'Set Keys'}
          IconComponent={VpnKeyIcon}
          color={errorColor} // Changed from tertiary to error color
          onClick={() => navigate('/settings')}
        />
      </Box>
    </Box>
  );
};

export default MainScreen;