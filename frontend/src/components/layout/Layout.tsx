import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-navy antialiased overflow-x-clip w-full">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 md:px-6 py-4 md:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
