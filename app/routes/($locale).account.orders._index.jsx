import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import accountContent from '~/config/accountContent';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {
      title: 'Meus pedidos | ALCIMO & CO.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
        query,
        language: customerAccount.i18n.language,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw new Error(
      'Não foi possível carregar os pedidos. Tente novamente.',
    );
  }

  return {
    customer: data.customer,
    filters,
  };
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const orders = customer?.orders;

  return (
    <div className="w-full min-w-0 pb-8">
      <OrdersHeader />

      <OrderSearchForm currentFilters={filters} />

      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersHeader() {
  return (
    <header className="mb-8 border-b border-neutral-200 pb-7 sm:mb-10">
      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        Histórico de compras
      </p>

      <h1 className="font-serif text-[30px] font-normal leading-tight text-neutral-950 sm:text-[38px]">
        Meus pedidos
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
        Acompanhe suas compras, consulte os detalhes dos pedidos e verifique
        o status de cada entrega.
      </p>
    </header>
  );
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = Boolean(
    filters?.name || filters?.confirmationNumber,
  );

  const hasOrders = Boolean(orders?.nodes?.length);

  return (
    <section
      className="mt-7 w-full min-w-0 sm:mt-8"
      aria-live="polite"
      aria-label="Lista de pedidos"
    >
      {hasOrders ? (
        <div className="w-full space-y-4">
          <PaginatedResourceSection connection={orders}>
            {({node: order}) => (
              <OrderItem key={order.id} order={order} />
            )}
          </PaginatedResourceSection>
        </div>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </section>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  const emptyState = accountContent?.orders?.emptyState;

  const collectionUrl =
    accountContent?.storeLinks?.collection ||
    accountContent?.storeLinks?.shop ||
    'https://alcimo.com/collections/all';

  const title = hasFilters
    ? 'Nenhum pedido foi encontrado.'
    : emptyState?.title || 'Você ainda não possui pedidos.';

  const description = hasFilters
    ? 'Não encontramos pedidos correspondentes aos dados informados. Verifique os números digitados ou remova os filtros.'
    : emptyState?.description ||
      'Quando você realizar uma compra, todos os detalhes aparecerão aqui.';

  const buttonLabel =
    emptyState?.buttonLabel || 'Conhecer a coleção';

  return (
    <div className="w-full border border-neutral-200 bg-white px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-14">
      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        {hasFilters ? 'Resultado da pesquisa' : 'Sua conta ALCIMO'}
      </p>

      <h2 className="font-serif text-2xl font-normal leading-tight text-neutral-950 sm:text-[30px]">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
        {description}
      </p>

      <div className="mt-8 flex justify-center">
        {hasFilters ? (
          <Link
            to="/account/orders"
            className="inline-flex min-h-12 items-center justify-center border border-neutral-950 bg-white px-7 text-[10px] font-medium uppercase tracking-[0.18em] !text-neutral-950 no-underline transition duration-200 hover:bg-neutral-950 hover:!text-white"
          >
            Limpar pesquisa
          </Link>
        ) : (
          <a
            href={collectionUrl}
            className="inline-flex min-h-12 items-center justify-center bg-neutral-950 px-7 text-[10px] font-medium uppercase tracking-[0.18em] !text-white no-underline transition duration-200 hover:bg-neutral-800"
          >
            {buttonLabel}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const formRef = useRef(null);

  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('/account/orders');

  const hasFilters = Boolean(
    currentFilters?.name ||
      currentFilters?.confirmationNumber,
  );

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const orderNumber = formData
      .get(ORDER_FILTER_FIELDS.NAME)
      ?.toString()
      .trim();

    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (orderNumber) {
      params.set(ORDER_FILTER_FIELDS.NAME, orderNumber);
    }

    if (confirmationNumber) {
      params.set(
        ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER,
        confirmationNumber,
      );
    }

    setSearchParams(params);
  }

  function handleClearFilters() {
    setSearchParams(new URLSearchParams());
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Localizar um pedido"
      className="!m-0 !block !w-full !min-w-0 !max-w-none border border-neutral-200 bg-white p-5 sm:p-7 lg:p-8"
      style={{
        width: '100%',
        maxWidth: 'none',
      }}
    >
      <fieldset className="!m-0 !w-full !min-w-0 !max-w-none border-0 !p-0">
        <legend className="mb-6 block w-full p-0 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          Localizar pedido
        </legend>

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[minmax(220px,0.8fr)_minmax(300px,1.2fr)_auto] xl:items-end">
          <OrderSearchField
            id="order-number"
            name={ORDER_FILTER_FIELDS.NAME}
            label="Número do pedido"
            placeholder="Ex.: 1001"
            defaultValue={currentFilters?.name || ''}
          />

          <OrderSearchField
            id="confirmation-number"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            label="Número de confirmação"
            placeholder="Digite o número de confirmação"
            defaultValue={
              currentFilters?.confirmationNumber || ''
            }
          />

          <div className="flex w-full flex-col gap-3 md:col-span-2 sm:flex-row xl:col-span-1 xl:w-auto">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center border border-neutral-950 bg-neutral-950 px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto xl:min-w-[150px]"
            >
              {isSearching ? 'Pesquisando...' : 'Pesquisar'}
            </button>

            {hasFilters && (
              <button
                type="button"
                disabled={isSearching}
                onClick={handleClearFilters}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center border border-neutral-300 bg-white px-6 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-950 transition duration-200 hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}

/**
 * @param {{
 *   id: string;
 *   name: string;
 *   label: string;
 *   placeholder: string;
 *   defaultValue: string;
 * }}
 */
function OrderSearchField({
  id,
  name,
  label,
  placeholder,
  defaultValue,
}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-2.5 block whitespace-nowrap text-xs font-normal text-neutral-700"
      >
        {label}
      </label>

      <input
        id={id}
        type="search"
        name={name}
        placeholder={placeholder}
        aria-label={label}
        defaultValue={defaultValue}
        autoComplete="off"
        className="!m-0 h-12 !w-full !min-w-0 !max-w-none rounded-none border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-0"
        style={{
          width: '100%',
          maxWidth: 'none',
        }}
      />
    </div>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status;

  const orderUrl = `/account/orders/${btoa(order.id)}`;

  const financialStatus = translateFinancialStatus(
    order.financialStatus,
  );

  const translatedFulfillmentStatus =
    translateFulfillmentStatus(fulfillmentStatus);

  return (
    <article className="group w-full overflow-hidden border border-neutral-200 bg-white transition duration-200 hover:border-neutral-400">
      <div className="grid w-full gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to={orderUrl}
              className="font-serif text-2xl font-normal leading-tight !text-neutral-950 no-underline transition group-hover:opacity-70"
            >
              Pedido #{order.number}
            </Link>

            <StatusBadge status={translatedFulfillmentStatus} />
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
            <OrderInformation
              label="Data do pedido"
              value={formatDate(order.processedAt)}
            />

            {order.confirmationNumber ? (
              <OrderInformation
                label="Confirmação"
                value={order.confirmationNumber}
              />
            ) : (
              <OrderInformation
                label="Confirmação"
                value="Não informada"
              />
            )}

            <OrderInformation
              label="Pagamento"
              value={financialStatus}
            />

            <div>
              <p className="mb-1.5 text-[9px] uppercase tracking-[0.17em] text-neutral-500">
                Total
              </p>

              <div className="text-sm font-medium text-neutral-950">
                <Money data={order.totalPrice} />
              </div>
            </div>
          </div>
        </div>

        <Link
          to={orderUrl}
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center border border-neutral-950 bg-white px-6 text-[10px] font-medium uppercase tracking-[0.18em] !text-neutral-950 no-underline transition duration-200 hover:bg-neutral-950 hover:!text-white lg:w-auto"
        >
          Ver detalhes
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

/**
 * @param {{status: string}}
 */
function StatusBadge({status}) {
  return (
    <span className="inline-flex min-h-7 w-fit items-center border border-neutral-300 bg-neutral-50 px-3 text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-600">
      {status}
    </span>
  );
}

/**
 * @param {{
 *   label: string;
 *   value: string;
 * }}
 */
function OrderInformation({label, value}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[9px] uppercase tracking-[0.17em] text-neutral-500">
        {label}
      </p>

      <p className="break-words text-sm leading-6 text-neutral-950">
        {value}
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="ml-3 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Data não informada';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function translateFinancialStatus(status) {
  const statuses = {
    AUTHORIZED: 'Autorizado',
    PAID: 'Pago',
    PARTIALLY_PAID: 'Parcialmente pago',
    PARTIALLY_REFUNDED: 'Parcialmente reembolsado',
    PENDING: 'Pendente',
    REFUNDED: 'Reembolsado',
    VOIDED: 'Cancelado',
    EXPIRED: 'Expirado',
  };

  if (!status) {
    return 'Não informado';
  }

  return statuses[status] || formatUnknownStatus(status);
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
  };

  if (!status) {
    return 'Aguardando envio';
  }

  return statuses[status] || formatUnknownStatus(status);
}

function formatUnknownStatus(status) {
  const normalizedStatus = String(status)
    .replaceAll('_', ' ')
    .toLocaleLowerCase('pt-BR');

  return (
    normalizedStatus.charAt(0).toLocaleUpperCase('pt-BR') +
    normalizedStatus.slice(1)
  );
}

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */