import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { HomePage } from '@/src/pages/public/HomePage';
import { AboutPage } from '@/src/pages/public/AboutPage';
import { HowItWorksPage } from '@/src/pages/public/HowItWorksPage';
import { OpportunitiesPage } from '@/src/pages/public/OpportunitiesPage';
import { PricingPage } from '@/src/pages/public/PricingPage';
import { ContactPage } from '@/src/pages/public/ContactPage';
import { LegalPage } from '@/src/pages/public/LegalPage';
import { LoginPage } from '@/src/pages/auth/LoginPage';
import { RegisterPage } from '@/src/pages/auth/RegisterPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <PublicLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PublicLayout>
    </BrowserRouter>
  );
}
