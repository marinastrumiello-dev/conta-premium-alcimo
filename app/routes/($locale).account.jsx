import {data as remixData, Outlet, useLoaderData} from 'react-router';
import {AccountSidebar} from '~/components/account/AccountSidebar';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate({
  formAction,
  formMethod,
  defaultShouldRevalidate,
}) {
  /*
   * O toggle de Favoritos já devolve a lista atualizada na resposta da action
   * e sincroniza o estado no navegador por evento. Revalidar o loader pai logo
   * depois pode trazer, por alguns instantes, o metafield anterior da Customer
   * Account API e sobrescrever a lista recém-atualizada no sessionStorage.
   *
   * Portanto, mantemos o estado local confirmado pela action apenas para essa
   * mutation. Todas as outras navegações e ações continuam usando a regra
   * normal de revalidação do React Router.
   */
  if (
    formMethod?.toUpperCase() !== 'GET' &&
    typeof formAction === 'string'
  ) {
    try {
      const actionPath = new URL(
        formAction,
        'https://conta.alcimo.com',
      ).pathname;

      if (actionPath.endsWith('/account/favorites')) {
        return false;
      }
    } catch {
      // Em caso de URL inesperada, preserva o comportamento padrão.
    }
  }

  return defaultShouldRevalidate;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;

  const {data, errors} = await customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
    {
      variables: {
        language: customerAccount.i18n.language,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    console.error('Customer Account API errors:', errors);
    throw new Error('Customer not found');
  }

  return remixData(
    {
      customer: data.customer,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-neutral-950">
      <div className="mx-auto min-h-screen max-w-[1920px] lg:flex">
        <AccountSidebar customer={customer} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
            <Outlet context={{customer}} />
          </div>
        </main>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */