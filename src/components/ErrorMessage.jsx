import React from 'react';
import Alert from '@mui/material/Alert';

const ErrorMessage = ({ error, sx }) => {
    if (!error) return null;
    return (
        <Alert severity="error" sx={{ mt: 2, mb: 2, ...sx }}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
    );
};

export default ErrorMessage;