import { AuthProvider } from '@/src/contexts/AuthContext';
import { AppRouter } from './router';

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
