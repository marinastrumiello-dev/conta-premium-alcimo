import {Link} from 'react-router';

const ALCIMO_COLLECTION_URL = 'https://alcimo.com/collections/all';

export function LastOrderCard({order}) {
  if (!order) {
    return <EmptyOrderCard />;
  }

  const lineItems = order?.lineItems?.nodes || [];
  const firstItem = lineItems[0] || null;
  const image = firstItem?.image;
  const orderId = getOrderId(order.id);

  return (
    <section className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white">
      <div className="grid min-h-[365px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col px-7 py-8 sm:px-9 sm:py-9">
          <p className="m-0 font-serif text-[22px] font-normal text-neutral-950">
            Último pedido
          </p>

          <div className="mt-5">
            <OrderStatus status={order.fulfillmentStatus} />
          </div>

          <h2 className="m-0 mt-7 font-serif text-[38px] font-normal leading-none text-neutral-950">
            {formatOrderName(order)}
          </h2>

          <p className="m-0 mt-4 text-[12px] leading-5 text-neutral-600">
            Realizado em {formatDate(order.createdAt)}
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-neutral-200 pt-5">
            <p className="m-0 text-[13px] text-neutral-950">
              {getItemsLabel(lineItems)}
            </p>

            <p className="m-0 text-[13px] font-medium text-neutral-950">
              {formatMoney(order.totalPrice)}
            </p>
          </div>

          <Link
            to={`/account/orders/${orderId}`}
            className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-[5px] border border-neutral-950 bg-neutral-950 px-6 text-[10px] font-medium uppercase tracking-[0.14em] !text-white no-underline transition hover:bg-neutral-800 hover:!text-white"
          >
            Ver detalhes do pedido
          </Link>

          <Link
            to="/account/orders"
            className="mt-5 inline-flex w-fit text-[11px] !text-[#755537] underline underline-offset-4"
          >
            Ver todos os pedidos
          </Link>
        </div>

        <div className="min-h-[320px] bg-[#f3f1ed] p-5 lg:min-h-full">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.altText || firstItem?.name || 'Produto ALCIMO'}
              className="h-full min-h-[300px] w-full rounded-[9px] object-cover"
            />
          ) : (
            <ProductFallback />
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyOrderCard() {
  return (
    <section className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white">
      <div className="grid min-h-[365px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col px-7 py-8 sm:px-9 sm:py-9">
          <p className="m-0 font-serif text-[22px] font-normal text-neutral-950">
            Último pedido
          </p>

          <div className="mt-5">
            <span className="inline-flex rounded-full bg-[#f2eee8] px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-[#755537]">
              Nenhum pedido
            </span>
          </div>

          <h2 className="m-0 mt-7 max-w-[360px] font-serif text-[30px] font-normal leading-[1.15] text-neutral-950">
            Você ainda não realizou nenhuma compra
          </h2>

          <p className="m-0 mt-5 max-w-[390px] text-[13px] leading-6 text-neutral-600">
            Conheça a coleção ALCIMO e descubra peças desenvolvidas para
            acompanhar todos os momentos da sua jornada.
          </p>

          <a
            href={ALCIMO_COLLECTION_URL}
            className="mt-8 inline-flex min-h-[50px] w-full items-center justify-center rounded-[5px] border border-neutral-950 bg-neutral-950 px-6 text-[10px] font-medium uppercase tracking-[0.14em] !text-white no-underline transition hover:bg-neutral-800 hover:!text-white"
          >
            Conhecer a coleção
          </a>
        </div>

        <div className="min-h-[320px] bg-[#f3f1ed] p-5 lg:min-h-full">
          <ProductFallback />
        </div>
      </div>
    </section>
  );
}

function ProductFallback() {
  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-[9px] bg-[#ebe8e2]">
      <div className="absolute right-[-30px] top-[35px] h-[310px] w-[240px] rotate-[12deg] rounded-t-[110px] border border-black/5 bg-gradient-to-b from-neutral-900 to-black shadow-2xl" />

      <div className="absolute right-[55px] top-[105px] h-[120px] w-[120px] rounded-full border border-white/10" />

      <p className="relative z-10 text-[9px] uppercase tracking-[0.28em] text-white/70">
        ALCIMO &amp; CO.
      </p>
    </div>
  );
}

function OrderStatus({status}) {
  const fulfilled = status === 'FULFILLED';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-4 py-2 text-[9px] uppercase tracking-[0.15em]',
        fulfilled
          ? 'bg-[#e2efe5] text-[#315f40]'
          : 'bg-[#f2eee8] text-[#755537]',
      ].join(' ')}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusLabel(status) {
  const statuses = {
    FULFILLED: 'Entregue',
    UNFULFILLED: 'Em preparação',
    PARTIALLY_FULFILLED: 'Envio parcial',
    IN_PROGRESS: 'Em andamento',
    ON_HOLD: 'Em análise',
    SCHEDULED: 'Agendado',
  };

  return statuses[status] || 'Pedido confirmado';
}

function formatOrderName(order) {
  if (order?.name) {
    return order.name;
  }

  if (order?.confirmationNumber) {
    return `#${order.confirmationNumber}`;
  }

  return 'Pedido ALCIMO';
}

function getItemsLabel(items) {
  const quantity = items.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0,
  );

  if (quantity === 1) {
    return '1 item';
  }

  return `${quantity || items.length} itens`;
}

function formatDate(date) {
  if (!date) {
    return 'data não disponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function formatMoney(money) {
  if (!money?.amount) {
    return 'Valor não disponível';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: money.currencyCode || 'BRL',
  }).format(Number(money.amount));
}

function getOrderId(id) {
  if (!id) {
    return '';
  }

  return id.split('/').pop();
}