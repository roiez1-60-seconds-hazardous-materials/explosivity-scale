import './globals.css';

export const metadata = {
  title: 'סקאלת טווח נפיצות',
  description: 'כלי אינטראקטיבי להצגת טווחי נפיצות',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
