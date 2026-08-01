import {useOutletContext} from 'react-router';
import {AccountSupport} from '~/components/account/AccountSupport';
import {BenefitsGrid} from '~/components/account/BenefitsGrid';
import {CollectionBanner} from '~/components/account/CollectionBanner';
import {DashboardHeader} from '~/components/account/DashboardHeader';
import {LastOrderCard} from '~/components/account/LastOrderCard';
import {LoyaltyCard} from '~/components/account/LoyaltyCard';
import {QuickAccess} from '~/components/account/QuickAccess';

export default function AccountDashboard() {
  const {customer} = useOutletContext();
  const lastOrder = customer?.orders?.nodes?.[0] || null;

  return (
    <div className="space-y-8 pb-6 lg:space-y-10">
      <DashboardHeader customer={customer} />

      <LastOrderCard order={lastOrder} />

      <QuickAccess />

      <div className="grid gap-5 lg:grid-cols-2">
        <LoyaltyCard />
        <CollectionBanner />
      </div>

      <BenefitsGrid />

      <AccountSupport />

      <footer className="pb-2 text-center">
        <p className="text-[10px] text-neutral-500">
          © {new Date().getFullYear()} ALCIMO &amp; CO. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}