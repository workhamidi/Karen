// import React, { useState, useEffect, useCallback } from 'react';
// import CssBaseline from '@mui/material/CssBaseline';
// import Box from '@mui/material/Box';
// import CircularProgress from '@mui/material/CircularProgress';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Alert from '@mui/material/Alert';
// import { BrowserRouter, Link as RouterLink } from 'react-router-dom'; // Import BrowserRouter
// import AppRouter from './AppRouter';
// import { SettingsProvider, useSettings } from './context/SettingsContext';
// import { getAllWords as fetchAllWordsFromSheet, updateWord as updateSheetWord } from './Api/GoogleSheetApi'; // Import new API functions

// // Main App Component content
// function AppContent() {
//   const { googleAuthToken, spreadsheetId, updateAuthToken, isSettingsLoaded } = useSettings();
//   const [allWords, setAllWords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isGapiReady, setIsGapiReady] = useState(false);

//   const handleGoogleSignIn = () => {
//      console.log("Placeholder: Initiate Google Sign-In Flow");
//      const fakeToken = 'FAKE_ACCESS_TOKEN_FOR_TESTING';
//      updateAuthToken(fakeToken);
//      setError(null);
//   };

//   const handleGoogleSignOut = () => {
//       console.log("Placeholder: Sign Out");
//       updateAuthToken(null);
//       setAllWords([]);
//       setError(null);
//   };

//   useEffect(() => {
//      const checkGapi = () => {
//        if (window.gapi) {
//          setIsGapiReady(true);
//        } else {
//          setTimeout(checkGapi, 500);
//        }
//      };
//      checkGapi();
//    }, []);

//   useEffect(() => {
//     const fetchWords = async () => {
//       setError(null);
//       setLoading(true);
//       setAllWords([]);
//       try {
//         const words = await fetchAllWordsFromSheet(googleAuthToken, spreadsheetId);
//         setAllWords(words);
//       } catch (err) {
//         console.error("Error fetching words via GAPI:", err);
//         let userErrorMessage = `Failed to load word data: ${err.message || 'Unknown error'}.`;
//         if (err.message?.toLowerCase().includes("not found") || err.status === 404){
//              userErrorMessage += " Please ensure the Spreadsheet ID is correct and you have access permission.";
//         } else if (err.message?.includes("token") || err.status === 401 || err.status === 403) {
//             userErrorMessage += " Authentication failed. Please try logging out and in again.";
//         } else {
//             userErrorMessage += " Please check your internet connection and Sheet configuration.";
//         }
//         setError(userErrorMessage);
//         setAllWords([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isSettingsLoaded && isGapiReady && googleAuthToken && spreadsheetId) {
//       fetchWords();
//     } else {
//        setLoading(false);
//     }

//   }, [googleAuthToken, spreadsheetId, isSettingsLoaded, isGapiReady]);

//   const handleUpdateWord = useCallback(async (originalWordId, updatesToApply) => {
//         if (!googleAuthToken || !spreadsheetId) {
//             setError("Cannot update word: Missing authentication or Spreadsheet ID.");
//             return;
//         }
//         const wordToUpdate = allWords.find(w => w.word === originalWordId);
//         if (!wordToUpdate) {
//             console.error(`Cannot update word: Original word "${originalWordId}" not found.`);
//             setError(`Failed to save review: Word "${originalWordId}" not found locally.`);
//             return;
//         }
//         const updatedWordData = { ...wordToUpdate, ...updatesToApply };
//         try {
//              setError(null);
//              await updateSheetWord(googleAuthToken, spreadsheetId, originalWordId, updatedWordData);
//              setAllWords(currentWords => currentWords.map(w =>
//                 w.word === originalWordId ? updatedWordData : w
//              ));
//         } catch (error) {
//              console.error(`Failed to update word "${originalWordId}" in Sheet:`, error);
//              setError(`Failed to save review for "${originalWordId}". Please try again.`);
//         }
//   }, [googleAuthToken, spreadsheetId, allWords]);


//   if (!isSettingsLoaded || !isGapiReady) {
//      return (
//        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//          <CircularProgress /> <Typography sx={{ ml: 2 }}>Initializing App...</Typography>
//        </Box>
//      );
//   }

//   if (!googleAuthToken) {
//       return (
//           <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3, textAlign: 'center' }}>
//                <Alert severity="info" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
//                    Please sign in with Google to access your words.
//                </Alert>
//                <Button variant="contained" onClick={handleGoogleSignIn}>Sign In with Google</Button>
//                 {error && <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: 400 }}>{error}</Alert>}
//           </Box>
//       );
//   }

//   if (!spreadsheetId) {
//       return (
//           <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3, textAlign: 'center' }}>
//               <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
//                     Please configure your Google Spreadsheet ID in the settings page.
//               </Alert>
//               <Button variant="contained" component={RouterLink} to="/settings">
//                     Go to Settings
//               </Button>
//                <Button variant="outlined" onClick={handleGoogleSignOut} sx={{mt: 2}}>Log Out</Button>
//           </Box>
//       );
//   }


//   return (
//      <>
//         {error && (
//             <Alert severity="error" sx={{ m: 1 }} onClose={() => setError(null)}>
//                 {error}
//             </Alert>
//         )}
//         {loading && (
//              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1 }}>
//                  <CircularProgress size={20} />
//                  <Typography sx={{ ml: 1 }} variant="caption">Loading Words...</Typography>
//              </Box>
//         )}

//         <AppRouter wordsData={allWords} onUpdateWordCallback={handleUpdateWord} />

//          <Box sx={{ position: 'fixed', bottom: 10, right: 10, zIndex: 10 }}>
//              <Button size="small" variant="contained" color="secondary" onClick={handleGoogleSignOut}>
//                  Logout
//              </Button>
//          </Box>
//      </>
//   );
// }


// function App() {
//   return (
//     <SettingsProvider>
//       <BrowserRouter>
//         <CssBaseline />
//         <AppContent />
//       </BrowserRouter>
//     </SettingsProvider>
//   );
// }

// export default App;





import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <CssBaseline />
        <AppRouter />
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;