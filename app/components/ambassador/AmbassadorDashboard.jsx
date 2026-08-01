import {AmbassadorIcon} from './AmbassadorIcon';

export function AmbassadorDashboard({application}) {
  const coupon = application?.coupon || 'EM DEFINIÇÃO';
  const availableCredit = Number(application?.availableCredit || 0);
  const pendingCredit = Number(application?.pendingCredit || 0);
  const confirmedSales = Number(application?.confirmedSales || 0);
  const totalSold = Number(application?.totalSold || 0);
  const level = application?.level || 'Bronze';

  return (
    <div className="space-y-5">
      <section className="rounded-[14px] bg-neutral-950 px-7 py-9 text-white sm:px-10 sm:py-11">
        <div className="flex items-center gap-3 text-[#c8a77e]">
          <AmbassadorIcon />
          <p className="m-0 text-[10px] uppercase tracking-[0.24em]">Embaixador ALCIMO</p>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="m-0 text-[9px] uppercase tracking-[0.2em] text-white/50">Seu cupom</p>
            <p className="m-0 mt-3 font-serif text-[40px] font-normal tracking-[0.04em]">{coupon}</p>
          </div>
          <div className="md:text-right">
            <p className="m-0 text-[9px] uppercase tracking-[0.2em] text-white/50">Nível atual</p>
            <p className="m-0 mt-3 font-serif text-[30px]">{level}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saldo disponível" value={formatMoney(availableCredit)} />
        <Stat label="Saldo pendente" value={formatMoney(pendingCredit)} />
        <Stat label="Vendas confirmadas" value={String(confirmedSales)} />
        <Stat label="Total vendido" value={formatMoney(totalSold)} />
      </section>

      <section className="rounded-[14px] border border-neutral-200 bg-white p-7 sm:p-9">
        <h2 className="m-0 font-serif text-[27px] font-normal text-neutral-950">Histórico de indicações</h2>
        <p className="m-0 mt-3 text-[12px] leading-6 text-neutral-600">
          As vendas aparecerão aqui depois da integração dos pedidos com os cupons do programa.
        </p>
        <div className="mt-8 border border-dashed border-neutral-300 px-5 py-10 text-center text-[12px] text-neutral-500">
          Nenhuma indicação registrada até o momento.
        </div>
      </section>
    </div>
  );
}

function Stat({label, value}) {
  return (
    <article className="rounded-[12px] border border-neutral-200 bg-white p-6">
      <p className="m-0 text-[9px] uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="m-0 mt-4 font-serif text-[28px] font-normal text-neutral-950">{value}</p>
    </article>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(Number(value) || 0);
}
