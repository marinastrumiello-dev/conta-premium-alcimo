import {FavoriteCard} from '~/features/favorites/FavoriteCard';
import {
  buildStoreSyncUrl,
  handleStoreNavigation,
} from '~/lib/favoritesSync';

const ALCIMO_COLLECTION_URL = 'https://alcimo.com/collections/all';

export function FavoritesGrid({
  products,
  removingIds = [],
}) {
  const storeReturnUrl = buildStoreSyncUrl(
    ALCIMO_COLLECTION_URL,
  );

  function handleContinueShopping(event) {
    handleStoreNavigation(
      event,
      ALCIMO_COLLECTION_URL,
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between gap-5 border-b border-neutral-200 pb-4">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-neutral-600"
          aria-live="polite"
        >
          {products.length}{' '}
          {products.length === 1
            ? 'produto salvo'
            : 'produtos salvos'}
        </p>

        <a
          href={storeReturnUrl}
          onClick={handleContinueShopping}
          className="shrink-0 text-[9px] uppercase tracking-[0.15em] !text-neutral-700 underline underline-offset-4"
        >
          Continuar explorando
        </a>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <FavoriteCard
            key={product.id}
            product={product}
            isRemoving={removingIds.includes(
              product.id,
            )}
          />
        ))}
      </div>
    </section>
  );
}
