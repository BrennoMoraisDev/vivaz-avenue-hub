import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
