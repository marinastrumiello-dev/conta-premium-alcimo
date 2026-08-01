import {redirect, useLoaderData, NavLink} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const orderName = data?.order?.name || '';

  return [
    {
      title: orderName
        ? `Pedido ${orderName} | ALCIMO & CO.`
        : 'Detalhes do pedido | ALCIMO & CO.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;

  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Pedido não encontrado.');
  }

  const {order} = data;

  const lineItems = order.lineItems?.nodes || [];
  const discountApplications = order.discountApplications?.nodes || [];
  const fulfillmentStatus = order.fulfillments?.nodes?.[0]?.status ?? 'UNFULFILLED';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();

  const formattedDate = formatDate(order.processedAt);
  const translatedStatus = translateFulfillmentStatus(fulfillmentStatus);

  return (
    <div className="mx-auto w-full max-w-[1180px] pb-8">
      <div className="mb-7 flex flex-col gap-5 border-b border-neutral-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
            Detalhes da compra
          </p>

          <h1 className="font-serif text-3xl font-normal text-neutral-950 sm:text-4xl">
            Pedido {order.name}
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Realizado em {formattedDate}
          </p>

          {order.confirmationNumber && (
            <p className="mt-1 text-xs text-neutral-500">
              Confirmação: {order.confirmationNumber}
            </p>
          )}
        </div>

        <NavLink
          to="/account/orders"
          className="inline-flex min-h-11 items-center justify-center border border-neutral-950 px-5 text-[10px] uppercase tracking-[0.17em] !text-neutral-950 no-underline transition hover:bg-neutral-950 hover:!text-white"
        >
          Voltar aos pedidos
        </NavLink>
      </div>

      <div className="overflow-hidden border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[minmax(0,1.7fr)_0.7fr_0.5fr_0.7fr] border-b border-neutral-200 bg-neutral-50 px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:grid">
          <span>Produto</span>
          <span>Preço</span>
          <span>Quantidade</span>
          <span>Total</span>
        </div>

        <div>
          {lineItems.map((lineItem, lineItemIndex) => (
            <OrderLineRow
              key={lineItem.id || lineItemIndex}
              lineItem={lineItem}
            />
          ))}
        </div>

        <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-6 sm:px-7">
          <div className="ml-auto w-full max-w-md space-y-4">
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <SummaryRow
                label="Descontos"
                value={
                  discountPercentage ? (
                    <span>-{discountPercentage}%</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )
                }
              />
            )}

            <SummaryRow
              label="Subtotal"
              value={<Money data={order.subtotal} />}
            />

            <SummaryRow
              label="Impostos"
              value={<Money data={order.totalTax} />}
            />

            <div className="flex items-center justify-between border-t border-neutral-300 pt-4">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-950">
                Total
              </span>

              <span className="font-serif text-2xl text-neutral-950">
                <Money data={order.totalPrice} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="border border-neutral-200 bg-white p-6 sm:p-7">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Entrega
          </p>

          <h2 className="font-serif text-2xl font-normal text-neutral-950">
            Endereço de entrega
          </h2>

          <div className="mt-5 text-sm leading-7 text-neutral-600">
            {order?.shippingAddress ? (
              <address className="not-italic">
                {order.shippingAddress.name && (
                  <p className="font-medium text-neutral-950">
                    {order.shippingAddress.name}
                  </p>
                )}

                {formatAddressLines(order.shippingAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            ) : (
              <p>Nenhum endereço de entrega foi informado.</p>
            )}
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6 sm:p-7">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Acompanhamento
          </p>

          <h2 className="font-serif text-2xl font-normal text-neutral-950">
            Status do pedido
          </h2>

          <div className="mt-5">
            <span className="inline-flex min-h-9 items-center border border-neutral-300 bg-neutral-50 px-4 text-[10px] uppercase tracking-[0.16em] text-neutral-700">
              {translatedStatus}
            </span>
          </div>

          {order.statusPageUrl && (
            <a
              target="_blank"
              href={order.statusPageUrl}
              rel="noreferrer"
              className="mt-7 inline-flex min-h-11 items-center justify-center bg-neutral-950 px-6 text-[10px] uppercase tracking-[0.17em] !text-white no-underline transition hover:bg-neutral-800"
            >
              Acompanhar pedido
            </a>
          )}
        </section>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  const lineTotal = getLineTotal(lineItem);

  return (
    <article className="grid gap-5 border-b border-neutral-200 px-5 py-6 last:border-b-0 md:grid-cols-[minmax(0,1.7fr)_0.7fr_0.5fr_0.7fr] md:items-center md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {lineItem?.image ? (
          <div className="h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
            <Image
              data={lineItem.image}
              width={160}
              height={192}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-24 w-20 shrink-0 items-center justify-center bg-neutral-100 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            Sem imagem
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium leading-6 text-neutral-950">
            {lineItem.title}
          </p>

          {lineItem.variantTitle && (
            <p className="mt-1 text-xs text-neutral-500">
              {lineItem.variantTitle}
            </p>
          )}
        </div>
      </div>

      <OrderMobileLabel label="Preço">
        <Money data={lineItem.price} />
      </OrderMobileLabel>

      <OrderMobileLabel label="Quantidade">
        {lineItem.quantity}
      </OrderMobileLabel>

      <OrderMobileLabel label="Total">
        {lineTotal ? <Money data={lineTotal} /> : <Money data={lineItem.price} />}
      </OrderMobileLabel>
    </article>
  );
}

/**
 * @param {{
 *   label: string;
 *   children: React.ReactNode;
 * }}
 */
function OrderMobileLabel({label, children}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm md:block">
      <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 md:hidden">
        {label}
      </span>

      <span className="text-neutral-950">{children}</span>
    </div>
  );
}

/**
 * @param {{
 *   label: string;
 *   value: React.ReactNode;
 * }}
 */
function SummaryRow({label, value}) {
  return (
    <div className="flex items-center justify-between gap-5 text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className="text-neutral-950">{value}</span>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'data não informada';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function translateFulfillmentStatus(status) {
  const statuses = {
    SUCCESS: 'Enviado',
    OPEN: 'Em processamento',
    PENDING: 'Pendente',
    FAILURE: 'Falha no envio',
    CANCELLED: 'Cancelado',
    CANCELED: 'Cancelado',
    ERROR: 'Erro no envio',
    UNFULFILLED: 'Aguardando envio',
    PARTIALLY_FULFILLED: 'Parcialmente enviado',
    FULFILLED: 'Enviado',
    IN_PROGRESS: 'Em preparação',
    ON_HOLD: 'Em espera',
    SCHEDULED: 'Envio agendado',
    N_A: 'Não informado',
    'N/A': 'Não informado',
  };

  return statuses[status] || String(status).replaceAll('_', ' ').toLowerCase();
}

function formatAddressLines(address) {
  if (!address) return [];

  if (Array.isArray(address.formatted)) {
    return address.formatted.filter(Boolean);
  }

  if (typeof address.formatted === 'string' && address.formatted.trim()) {
    return address.formatted
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [
    address.address1,
    address.address2,
    [address.city, address.provinceCode].filter(Boolean).join(' - '),
    address.zip,
    address.country,
  ].filter(Boolean);
}

function getLineTotal(lineItem) {
  if (lineItem?.totalPrice) return lineItem.totalPrice;

  if (!lineItem?.price?.amount || !lineItem?.quantity) return null;

  return {
    amount: String(
      Number(lineItem.price.amount) * Number(lineItem.quantity),
    ),
    currencyCode: lineItem.price.currencyCode,
  };
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */