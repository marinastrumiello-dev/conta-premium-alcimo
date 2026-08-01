const benefits = [
  {
    title: 'Frete grátis',
    description: 'Condições especiais de frete conforme as campanhas vigentes.',
    icon: <TruckIcon />,
  },
  {
    title: 'Trocas e devoluções',
    description: 'Processo de troca acompanhado pela equipe ALCIMO.',
    icon: <ExchangeIcon />,
  },
  {
    title: 'Atendimento exclusivo',
    description: 'Suporte dedicado para dúvidas sobre pedidos e produtos.',
    icon: <ShieldIcon />,
  },
  {
    title: 'Acesso antecipado',
    description: 'Novidades e lançamentos apresentados aos clientes ALCIMO.',
    icon: <GiftIcon />,
  },
];

export function BenefitsGrid() {
  return (
    <section id="beneficios" aria-labelledby="benefits-title">
      <h2
        id="benefits-title"
        className="mb-5 font-serif text-[25px] font-normal text-neutral-950"
      >
        Benefícios para você
      </h2>

      <div className="grid overflow-hidden rounded-[12px] border border-neutral-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.title}
            className={[
              'min-h-[180px] p-6 sm:p-7',
              index !== benefits.length - 1
                ? 'border-b border-neutral-200 xl:border-b-0 xl:border-r'
                : '',
              index === 1 ? 'sm:border-b-0 xl:border-r' : '',
              index === 2 ? 'sm:border-r' : '',
            ].join(' ')}
          >
            <div className="text-[#8a633d]">{benefit.icon}</div>

            <h3 className="mt-5 text-[14px] font-semibold text-neutral-950">
              {benefit.title}
            </h3>

            <p className="mt-2 text-[12px] leading-5 text-neutral-600">
              {benefit.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M3 6h11v11H3V6ZM14 10h4l3 3v4h-7v-7Z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M4 7h16M16 3l4 4-4 4M20 17H4M8 13l-4 4 4 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M4 10h16v11H4V10ZM2.5 6h19v4h-19V6Z" />
      <path d="M12 6v15M12 6H8.5A2.5 2.5 0 1 1 11 3.5L12 6ZM12 6h3.5A2.5 2.5 0 1 0 13 3.5L12 6Z" />
    </svg>
  );
}