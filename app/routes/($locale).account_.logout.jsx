import {redirect} from 'react-router';

const LOGOUT_COMPLETE_PATH = '/account/logout-complete';

// Evita que uma visita GET a /account/logout tente executar o logout.
export async function loader() {
  return redirect('/account');
}

/**
 * Encerra a sessão da Customer Account API e pede ao Shopify que retorne
 * para uma rota intermediária do Hydrogen. Essa rota, por sua vez,
 * redireciona para a loja com o marcador que limpa o cache local do header.
 *
 * @param {Route.ActionArgs}
 */
export async function action({context}) {
  return context.customerAccount.logout({
    postLogoutRedirectUri: LOGOUT_COMPLETE_PATH,
  });
}

/** @typedef {import('./+types/account_.logout').Route} Route */
