import {redirect} from 'react-router';

const STORE_LOGOUT_URL = 'https://alcimo.com/?alcimoLogout=1';

/**
 * O Shopify retorna para esta rota após concluir o logout.
 * Em seguida, voltamos para a loja principal com um marcador de uso único.
 * O header da loja remove os favoritos locais e apaga o marcador da URL.
 */
export async function loader() {
  return redirect(STORE_LOGOUT_URL);
}
