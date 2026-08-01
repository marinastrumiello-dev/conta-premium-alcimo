import {data as remixData, useActionData, useLoaderData} from 'react-router';
import {AmbassadorDashboard} from '~/components/ambassador/AmbassadorDashboard';
import {AmbassadorEligible} from '~/components/ambassador/AmbassadorEligible';
import {AmbassadorLocked} from '~/components/ambassador/AmbassadorLocked';
import {AmbassadorPending} from '~/components/ambassador/AmbassadorPending';
import ambassadorConfig from '~/config/ambassadorConfig';
import {CUSTOMER_AMBASSADOR_MUTATION} from '~/graphql/customer-account/CustomerAmbassadorMutation';
import {CUSTOMER_AMBASSADOR_QUERY} from '~/graphql/customer-account/CustomerAmbassadorQuery';

export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_AMBASSADOR_QUERY, {
    variables: {language: customerAccount.i18n.language},
  });

  if (errors?.length || !data?.customer) {
    console.error('Customer Ambassador API errors:', errors);
    throw new Error('Não foi possível carregar o Programa Embaixador ALCIMO.');
  }

  const orders = data.customer.orders?.nodes || [];
  const validOrders = orders.filter(isValidPurchase);
  const spent = validOrders.reduce(
    (sum, order) => sum + Number(order.totalPrice?.amount || 0),
    0,
  );
  const currencyCode =
    validOrders[0]?.totalPrice?.currencyCode ||
    orders[0]?.totalPrice?.currencyCode ||
    'BRL';

  return remixData(
    {
      customer: data.customer,
      application: parseApplication(data.customer.ambassador?.value),
      spent,
      currencyCode,
      eligible: spent >= ambassadorConfig.minimumSpend,
      minimumSpend: ambassadorConfig.minimumSpend,
    },
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

export async function action({request, context}) {
  const formData = await request.formData();
  if (formData.get('intent') !== 'apply') {
    return remixData({error: 'Solicitação inválida.'}, {status: 400});
  }

  const {customerAccount} = context;
  const {data: customerData, errors: customerErrors} = await customerAccount.query(
    CUSTOMER_AMBASSADOR_QUERY,
    {variables: {language: customerAccount.i18n.language}},
  );

  if (customerErrors?.length || !customerData?.customer) {
    return remixData(
      {error: 'Não foi possível confirmar os dados da sua conta.'},
      {status: 400},
    );
  }

  const spent = (customerData.customer.orders?.nodes || [])
    .filter(isValidPurchase)
    .reduce((sum, order) => sum + Number(order.totalPrice?.amount || 0), 0);

  if (spent < ambassadorConfig.minimumSpend) {
    return remixData(
      {error: 'O valor mínimo em compras ainda não foi atingido.'},
      {status: 403},
    );
  }

  const currentApplication = parseApplication(
    customerData.customer.ambassador?.value,
  );

  if (currentApplication?.status) {
    return remixData({ok: true, status: currentApplication.status});
  }

  const application = {
    status: 'pending',
    requestedAt: new Date().toISOString(),
    customerDiscountPercentage:
      ambassadorConfig.customerDiscountPercentage,
    ambassadorCreditPercentage:
      ambassadorConfig.ambassadorCreditPercentage,
  };

  const {data, errors} = await customerAccount.mutate(
    CUSTOMER_AMBASSADOR_MUTATION,
    {
      variables: {
        metafields: [
          {
            ownerId: customerData.customer.id,
            namespace: ambassadorConfig.metafield.namespace,
            key: ambassadorConfig.metafield.key,
            type: ambassadorConfig.metafield.type,
            value: JSON.stringify(application),
          },
        ],
      },
    },
  );

  const userErrors = data?.metafieldsSet?.userErrors || [];
  if (errors?.length || userErrors.length) {
    console.error('Ambassador metafield errors:', errors, userErrors);
    return remixData(
      {
        error:
          userErrors[0]?.message ||
          'Não foi possível registrar a solicitação. Verifique a definição do metafield custom.embaixador_alcimo no Shopify Admin.',
      },
      {status: 400},
    );
  }

  return remixData({ok: true, status: 'pending'});
}

export default function AccountAmbassador() {
  const {application, spent, currencyCode, eligible, minimumSpend} =
    useLoaderData();
  const actionData = useActionData();
  const effectiveStatus = actionData?.status || application?.status;

  return (
    <div className="space-y-8 pb-12">
      <header className="border-b border-neutral-200 pb-8">
        <p className="m-0 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          Universo ALCIMO
        </p>
        <h1 className="m-0 mt-4 font-serif text-[38px] font-normal text-neutral-950 sm:text-[44px]">
          Embaixador ALCIMO
        </h1>
        <p className="m-0 mt-4 max-w-[760px] text-[13px] leading-7 text-neutral-600">
          Um programa exclusivo para clientes que vestem a ALCIMO, compartilham
          seu propósito e desejam crescer junto com a marca.
        </p>
      </header>

      {!eligible && (
        <AmbassadorLocked
          spent={spent}
          minimumSpend={minimumSpend}
          currencyCode={currencyCode}
        />
      )}

      {eligible && !effectiveStatus && (
        <AmbassadorEligible actionData={actionData} />
      )}

      {eligible && effectiveStatus === 'pending' && (
        <AmbassadorPending application={application || {requestedAt: new Date().toISOString()}} />
      )}

      {eligible && effectiveStatus === 'approved' && (
        <AmbassadorDashboard application={application} />
      )}

      {eligible && ['rejected', 'suspended'].includes(effectiveStatus) && (
        <section className="rounded-[14px] border border-neutral-200 bg-white p-8 sm:p-10">
          <h2 className="m-0 font-serif text-[32px] font-normal text-neutral-950">
            Programa Embaixador ALCIMO
          </h2>
          <p className="m-0 mt-5 max-w-[680px] text-[13px] leading-7 text-neutral-600">
            Sua participação não está ativa neste momento. Entre em contato com
            a equipe ALCIMO para consultar o status da sua inscrição.
          </p>
        </section>
      )}
    </div>
  );
}

function isValidPurchase(order) {
  const financialStatus = String(order?.financialStatus || '').toUpperCase();
  return !['REFUNDED', 'VOIDED', 'PENDING', 'EXPIRED'].includes(financialStatus);
}

function parseApplication(value) {
  if (!value) return null;
  try {
    const application = JSON.parse(value);
    return application && typeof application === 'object' ? application : null;
  } catch (error) {
    console.warn('Metafield do Programa Embaixador inválido.', error);
    return null;
  }
}

/** @typedef {import('./+types/account.ambassador').Route} Route */
