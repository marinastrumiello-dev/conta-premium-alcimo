import {Form, useNavigation} from 'react-router';
import {AmbassadorIcon} from './AmbassadorIcon';

export function AmbassadorEligible({actionData}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white">
      <div className="grid lg:grid-cols-[1fr_.82fr]">
        <div className="px-7 py-9 sm:px-10 sm:py-12">
          <div className="flex items-center gap-3 text-[#8a633d]">
            <AmbassadorIcon />
            <p className="m-0 text-[10px] uppercase tracking-[0.24em]">
              Programa desbloqueado
            </p>
          </div>

          <h2 className="m-0 mt-7 font-serif text-[36px] font-normal leading-[1.08] text-neutral-950 sm:text-[46px]">
            Você já pode solicitar sua participação.
          </h2>

          <p className="m-0 mt-6 max-w-[660px] text-[13px] leading-7 text-neutral-600">
            Sua inscrição será analisada pela equipe ALCIMO. Após a aprovação,
            seu cupom exclusivo e o dashboard completo serão liberados nesta
            mesma página.
          </p>

          {actionData?.error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-[12px] leading-6 text-red-800">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="!m-0 mt-8">
            <input type="hidden" name="intent" value="apply" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[50px] border-0 bg-neutral-950 px-8 text-[10px] uppercase tracking-[0.16em] text-white disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Enviando solicitação...' : 'Solicitar participação'}
            </button>
          </Form>
        </div>

        <div className="bg-[#f3eee6] px-7 py-9 sm:px-10 sm:py-12">
          <p className="m-0 text-[9px] uppercase tracking-[0.22em] text-neutral-500">
            Como funcionará
          </p>
          <ol className="m-0 mt-7 space-y-6 p-0 list-none">
            <Step number="01" text="A equipe ALCIMO analisa sua solicitação." />
            <Step number="02" text="Seu cupom exclusivo é criado após a aprovação." />
            <Step number="03" text="Você acompanha vendas, saldo e nível pelo dashboard." />
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({number, text}) {
  return (
    <li className="flex gap-4 border-b border-neutral-300 pb-6 last:border-b-0 last:pb-0">
      <span className="font-serif text-[22px] text-[#8a633d]">{number}</span>
      <p className="m-0 pt-1 text-[12px] leading-6 text-neutral-700">{text}</p>
    </li>
  );
}
