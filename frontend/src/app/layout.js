import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'DSCLUB EXPENSE TRACKER - Data Science Club',
  description: 'Centralized financial management portal for Data Science Club expenses, reimbursements, sponsors, budgets, and transactions.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="max-w-full overflow-x-hidden">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen max-w-full overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
