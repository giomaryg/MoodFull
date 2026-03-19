import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavigationHeader from '@/components/navigation/NavigationHeader';
import { SafeAreaContainer } from '@/components/ui/SafeAreaContainer';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { NavigationStackProvider, useNavigationStack } from '@/lib/NavigationStackContext';
import { ThemeProvider } from '@/lib/ThemeProvider';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#6b9b76] rounded-full animate-spin"></div>
  </div>
);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </Layout>
  : <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <SafeAreaContainer left right>
      <AnimatedRoutes />
    </SafeAreaContainer>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { direction } = useNavigationStack();
  
  const variants = {
    initial: (direction) => ({
      x: direction === 'backward' ? '-30%' : '100%',
      opacity: direction === 'backward' ? 0.5 : 1,
      boxShadow: direction === 'backward' ? 'none' : '-10px 0 20px rgba(0,0,0,0.1)'
    }),
    animate: {
      x: 0,
      opacity: 1,
      boxShadow: 'none'
    },
    exit: (direction) => ({
      x: direction === 'backward' ? '100%' : '-30%',
      opacity: direction === 'backward' ? 1 : 0.5,
      boxShadow: direction === 'backward' ? '-10px 0 20px rgba(0,0,0,0.1)' : 'none'
    })
  };

  return (
    <>
      <NavigationHeader />
      <AnimatePresence mode="wait" custom={direction}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div 
              custom={direction}
              variants={variants}
              initial="initial" 
              animate="animate" 
              exit="exit" 
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }} 
              className="w-full h-full min-h-screen bg-background absolute top-0 left-0"
            >
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            </motion.div>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <motion.div 
                  custom={direction}
                  variants={variants}
                  initial="initial" 
                  animate="animate" 
                  exit="exit" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  className="w-full h-full min-h-screen bg-background"
                >
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                </motion.div>
              }
            />
          ))}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};


function App() {

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationStackProvider>
              <NavigationTracker />
              <AuthenticatedApp />
            </NavigationStackProvider>
          </Router>
          <Toaster />
          <VisualEditAgent />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App