import {Link} from 'react-router';

const accessItems = [
  {
    title: 'Meus pedidos',
    description: 'Acompanhe seus pedidos, entregas e histórico de compras.',
    to: '/account/orders',
    icon: <OrdersIcon />,
  },
  {
    title: 'Favoritos',
    description: 'Veja os produtos que você salvou para consultar depois.',
    to: '/account/favorites',
    icon: <HeartIcon />,
  },
  {
    title: 'Endereços',
    description: 'Gerencie seus endereços de entrega salvos.',
    to: '/account/addresses',
    icon: <AddressIcon />,
  },
  {
    title: 'Perfil',
    description: 'Atualize seus dados pessoais e informações da conta.',
    to: '/account/profile',
    icon: <ProfileIcon />,
  },
];

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <div className="mb-5">
        <p className="text-[9px] uppercase tracking-[0.26em] text-neutral-500">
          Navegação
        </p>

        <h2
          id="quick-access-title"
          className="mt-2 font-serif text-[25px] font-normal text-neutral-950"
        >
          Acesso rápido
        </h2>
      </div>

      <div className="grid overflow-hidden rounded-[12px] border border-neutral-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {accessItems.map((item, index) => (
          <Link
            key={item.title}
            to={item.to}
            className={[
              'group flex min-h-[220px] flex-col p-6 !text-neutral-950 no-underline transition hover:bg-[#f7f4ef] sm:p-7',
              index !== accessItems.length - 1
                ? 'border-b border-neutral-200 xl:border-b-0 xl:border-r'
                : '',
              index === 1 ? 'sm:border-b-0 xl:border-r' : '',
              index === 2 ? 'sm:border-r' : '',
            ].join(' ')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-neutral-200 bg-white text-neutral-950">
              {item.icon}
            </div>

            <h3 className="mt-7 font-serif text-[19px] font-normal text-neutral-950">
              {item.title}
            </h3>

            <p className="mt-3 max-w-[220px] text-[12px] leading-5 text-neutral-600">
              {item.description}
            </p>

            <span className="mt-auto inline-flex items-center justify-end gap-3 pt-7 text-[10px] uppercase tracking-[0.14em] text-[#755537]">
              Acessar
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M5 7h14l-1 14H6L5 7Z" />
      <path d="M9 9V5a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function AddressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}