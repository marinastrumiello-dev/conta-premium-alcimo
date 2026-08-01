import {AmbassadorIcon} from './AmbassadorIcon';

export function AmbassadorPending({application}) {
  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white px-7 py-10 sm:px-10 sm:py-14">
      <div className="flex items-center gap-3 text-[#8a633d]">
        <AmbassadorIcon />
        <p className="m-0 text-[10px] uppercase tracking-[0.24em]">Solicitação recebida</p>
      </div>
      <h2 className="m-0 mt-7 font-serif text-[38px] font-normal text-neutral-950">
        Sua inscrição está em análise.
      </h2>
      <p className="m-0 mt-5 max-w-[680px] text-[13px] leading-7 text-neutral-600">
        A equipe ALCIMO avaliará seu perfil antes de liberar o cupom e o dashboard.
        Você acompanhará qualquer mudança de status nesta página.
      </p>
      {application?.requestedAt && (
        <p className="m-0 mt-8 text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          Solicitação enviada em {new Intl.DateTimeFormat('pt-BR').format(new Date(application.requestedAt))}
        </p>
      )}
    </section>
  );
}
