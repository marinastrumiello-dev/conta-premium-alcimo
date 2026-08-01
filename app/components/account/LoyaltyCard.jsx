import {Link} from 'react-router';

export function LoyaltyCard() {
  return (
    <section
      className="relative flex min-h-[350px] w-full flex-col overflow-hidden rounded-[12px] border border-neutral-200 bg-white"
    >
      <div className="flex h-full flex-1 flex-col px-8 py-8 sm:px-9 sm:py-9">
        <div className="flex items-center gap-3">
          <CrownIcon />

          <h2 className="m-0 font-serif text-[22px] font-normal leading-none text-neutral-950">
            Programa ALCIMO
          </h2>
        </div>

        <div className="mt-9 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="shrink-0">
            <p className="m-0 text-[9px] uppercase tracking-[0.22em] text-neutral-500">
              Programa exclusivo
            </p>

            <p className="m-0 mt-3 font-serif text-[27px] font-normal leading-none text-neutral-950">
              Embaixador ALCIMO
            </p>
          </div>

          <p className="m-0 max-w-[280px] text-[12px] leading-5 text-neutral-500 sm:text-right">
            Desbloqueie sua inscrição, acompanhe seu progresso e conheça os
            benefícios do Programa Embaixador ALCIMO.
          </p>
        </div>

        <div className="mt-9 w-full">
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#eeeeec]">
            <div className="h-full w-[18%] rounded-full bg-neutral-950" />
          </div>
        </div>

        <p className="m-0 mt-7 max-w-[520px] text-[12px] leading-6 text-neutral-600">
          Clientes elegíveis podem solicitar um cupom próprio, acumular crédito
          ALCIMO e avançar por níveis conforme suas vendas forem confirmadas.
        </p>

        <div className="mt-auto pt-8">
          <Link
            to="/account/ambassador"
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] !text-[#755537] no-underline"
          >
            Conhecer o programa
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className="h-6 w-6 shrink-0 text-[#8a633d]"
      aria-hidden="true"
    >
      <path d="m3.5 7 4.5 4 4-7 4 7 4.5-4-2 11h-13l-2-11Z" />
      <path d="M6 21h12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m15 8 4 4-4 4" />
    </svg>
  );
}