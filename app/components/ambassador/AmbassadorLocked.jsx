import {AmbassadorIcon} from './AmbassadorIcon';

export function AmbassadorLocked({spent, minimumSpend, currencyCode}) {
  const remaining = Math.max(minimumSpend - spent, 0);
  const progress = Math.min((spent / minimumSpend) * 100, 100);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="px-7 py-9 sm:px-10 sm:py-12">
            <div className="flex items-center gap-3 text-[#8a633d]">
              <AmbassadorIcon />
              <p className="m-0 text-[10px] uppercase tracking-[0.24em]">
                Acesso exclusivo
              </p>
            </div>

            <h2 className="m-0 mt-7 max-w-[650px] font-serif text-[34px] font-normal leading-[1.1] text-neutral-950 sm:text-[44px]">
              Vista a marca. Compartilhe o propósito.
            </h2>

            <p className="m-0 mt-6 max-w-[650px] text-[13px] leading-7 text-neutral-600">
              O Programa Embaixador ALCIMO é liberado para clientes que já
              conhecem nossas peças e atingem o valor mínimo em compras
              confirmadas.
            </p>
          </div>

          <div className="flex min-h-[260px] flex-col justify-between bg-neutral-950 px-7 py-9 text-white sm:px-10 sm:py-12">
            <div>
              <p className="m-0 text-[9px] uppercase tracking-[0.22em] text-white/55">
                Seu progresso
              </p>
              <p className="m-0 mt-4 font-serif text-[34px] font-normal">
                {formatMoney(spent, currencyCode)}
              </p>
              <p className="m-0 mt-2 text-[11px] text-white/55">
                de {formatMoney(minimumSpend, currencyCode)} em compras válidas
              </p>
            </div>

            <div className="mt-10">
              <div className="h-[6px] overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500"
                  style={{width: `${progress}%`}}
                />
              </div>
              <p className="m-0 mt-4 text-[11px] leading-5 text-white/65">
                Faltam {formatMoney(remaining, currencyCode)} para desbloquear
                sua inscrição.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Benefit title="Cupom próprio" text="Um código exclusivo para compartilhar com sua comunidade." />
        <Benefit title="Crédito ALCIMO" text="Acumule 3% das vendas válidas realizadas com o seu cupom." />
        <Benefit title="Evolução por níveis" text="Avance no programa conforme suas vendas forem confirmadas." />
      </section>

      <div className="flex justify-start">
        <a
          href="https://alcimo.com/collections/all"
          className="inline-flex min-h-[48px] items-center justify-center bg-neutral-950 px-7 text-[10px] uppercase tracking-[0.16em] !text-white no-underline"
        >
          Conhecer a coleção
        </a>
      </div>
    </div>
  );
}

function Benefit({title, text}) {
  return (
    <article className="rounded-[12px] border border-neutral-200 bg-white p-6">
      <h3 className="m-0 font-serif text-[21px] font-normal text-neutral-950">{title}</h3>
      <p className="m-0 mt-3 text-[12px] leading-6 text-neutral-600">{text}</p>
    </article>
  );
}

function formatMoney(value, currencyCode = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode || 'BRL',
  }).format(Number(value) || 0);
}
