export function DashboardHeader({customer}) {
  const firstName = getCustomerFirstName(customer);

  return (
    <header className="pb-2">
      <h1 className="m-0 font-serif text-[38px] font-normal leading-none tracking-[-0.02em] text-neutral-950 sm:text-[44px]">
        Olá, {firstName}.
      </h1>

      <p className="m-0 mt-4 text-[13px] leading-6 text-neutral-500">
        Bem-vindo à sua conta ALCIMO &amp; CO.
      </p>
    </header>
  );
}

function getCustomerFirstName(customer) {
  const firstName = customer?.firstName?.trim();

  if (firstName) {
    return firstName;
  }

  const displayName = customer?.displayName?.trim();

  if (displayName && !displayName.includes('@')) {
    return displayName.split(/\s+/)[0];
  }

  return 'Cliente';
}