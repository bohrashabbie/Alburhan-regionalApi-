import type { Metadata } from 'next';
import ThemeRegistry from '../theme/ThemeRegistry';
import { ThemeContextProvider } from '../context/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alburhan Regional — Admin Portal',
  description: 'Alburhan Regional Administration Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeRegistry>
          <ThemeContextProvider>
            {children}
          </ThemeContextProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
