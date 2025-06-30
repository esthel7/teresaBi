import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teresa Bi',
  description: 'Designer'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
