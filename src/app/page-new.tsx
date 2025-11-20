import { MainNav } from '@/components/layout/MainNav';
import { HomePage } from './home-page';
import { Footer } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <HomePage />
      <Footer />
    </div>
  );
}
