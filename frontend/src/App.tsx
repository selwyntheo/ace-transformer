import { ThemeProvider, createTheme } from '@mui/material/styles'
import { 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box
} from '@mui/material'
import { 
  Transform as TransformIcon
} from '@mui/icons-material'
import AdvancedTransform from './pages/AdvancedTransform'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <TransformIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AceTransformer
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Universal Data Transformation Platform
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Tab Content */}
        <Container maxWidth={false} disableGutters>
          <AdvancedTransform />
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
