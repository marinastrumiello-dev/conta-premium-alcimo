import {useLoaderData} from 'react-router';
import {EmptyFavorites} from '~/features/favorites/EmptyFavorites';
import {FavoritesGrid} from '~/features/favorites/FavoritesGrid';
import {FavoritesToast} from '~/features/favorites/FavoritesToast';
import {
  favoritesAction,
  favoritesLoader,
} from '~/features/favorites/favorites.server';
import {useFavorites} from '~/features/favorites/useFavorites';

export const loader = favoritesLoader;
export const action = favoritesAction;

export default function AccountFavorites() {
  const {products: initialProducts, productSaved} = useLoaderData();

  const {
    products,
    removingIds,
    toast,
    closeToast,
  } = useFavorites({
    initialProducts,
    productSaved,
  });

  return (
    <div className="pb-16">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
          Sua seleção
        </p>

        <h1 className="mt-4 font-serif text-[38px] font-normal text-neutral-950">
          Favoritos
        </h1>

        <p className="mt-4 max-w-2xl text-[13px] leading-6 text-neutral-600">
          Encontre novamente as peças que chamaram sua atenção.
        </p>
      </header>

      {products.length ? (
        <FavoritesGrid
          products={products}
          removingIds={removingIds}
        />
      ) : (
        <EmptyFavorites />
      )}

      <FavoritesToast toast={toast} onClose={closeToast} />
    </div>
  );
}

/** @typedef {import('./+types/account.favorites').Route} Route */
