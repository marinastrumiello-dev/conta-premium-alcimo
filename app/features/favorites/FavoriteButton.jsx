import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {useFetcher} from 'react-router';
import {
  dispatchFavoritesChanged,
  normalizeFavoriteIds,
  writeAccountFavoriteIds,
} from '~/lib/favoritesSync';

/**
 * Botão reutilizável de Favoritos da ALCIMO & CO.
 *
 * Pode ser usado em:
 * - cards de coleção;
 * - resultados de busca;
 * - recomendações;
 * - página do produto;
 * - página de Favoritos.
 */
export function FavoriteButton({
  productId,
  initialFavorite = false,
  variant = 'card',
  className = '',
  onFavoriteChange,
}) {
  const fetcher = useFetcher();

  const [isFavorite, setIsFavorite] =
    useState(initialFavorite);

  const [isAnimating, setIsAnimating] =
    useState(false);

  const previousFavoriteState = useRef(
    initialFavorite,
  );

  const lastHandledData = useRef(null);

  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    setIsFavorite(initialFavorite);
    previousFavoriteState.current =
      initialFavorite;
  }, [initialFavorite]);

  useEffect(() => {
    if (!fetcher.data) return;

    if (
      lastHandledData.current ===
      fetcher.data
    ) {
      return;
    }

    lastHandledData.current =
      fetcher.data;

    if (fetcher.data.ok === false) {
      setIsFavorite(
        previousFavoriteState.current,
      );

      dispatchFavoritesChanged({
        type: 'error',
        productId,
        isFavorite:
          previousFavoriteState.current,
        message:
          fetcher.data.error ||
          'Não foi possível atualizar os favoritos.',
      });

      return;
    }

    if (
      typeof fetcher.data.isFavorite !==
      'boolean'
    ) {
      return;
    }

    const nextFavoriteState =
      fetcher.data.isFavorite;

    const favoriteIds =
      normalizeFavoriteIds(
        fetcher.data.favoriteIds,
      );

    writeAccountFavoriteIds(
      favoriteIds,
    );

    setIsFavorite(nextFavoriteState);

    onFavoriteChange?.(
      nextFavoriteState,
      productId,
    );

    dispatchFavoritesChanged({
      type: nextFavoriteState
        ? 'added'
        : 'removed',
      productId,
      isFavorite: nextFavoriteState,
      favoriteIds,
    });
  }, [
    fetcher.data,
    onFavoriteChange,
    productId,
  ]);

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!productId || isSubmitting) {
      return;
    }

    const nextFavoriteState =
      !isFavorite;

    previousFavoriteState.current =
      isFavorite;

    setIsFavorite(nextFavoriteState);
    setIsAnimating(true);

    window.setTimeout(() => {
      setIsAnimating(false);
    }, 420);

    fetcher.submit(
      {
        intent: 'toggle-favorite',
        productId,
      },
      {
        method: 'post',
        action: '/account/favorites',
      },
    );
  }

  if (variant === 'remove') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className={[
          'group/remove inline-flex min-h-11 items-center justify-center gap-2',
          'border border-neutral-300 bg-white px-5',
          'text-[9px] uppercase tracking-[0.16em] text-neutral-800',
          'transition duration-300',
          'hover:border-neutral-950 hover:bg-neutral-950 hover:text-white',
          'disabled:cursor-wait disabled:opacity-60',
          isAnimating
            ? 'scale-[0.97]'
            : 'scale-100',
          className,
        ].join(' ')}
        aria-label="Remover produto dos favoritos"
      >
        <span
          className={[
            'flex items-center justify-center transition duration-300',
            isAnimating
              ? 'scale-125'
              : 'scale-100',
          ].join(' ')}
        >
          <HeartIcon
            filled
            className="group-hover/remove:scale-110"
          />
        </span>

        <span>
          {isSubmitting
            ? 'Removendo...'
            : 'Remover'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className={[
        'group/favorite relative flex h-10 w-10 items-center justify-center',
        'rounded-full border bg-white/95 text-neutral-950 shadow-sm',
        'backdrop-blur-sm transition duration-300',
        'hover:scale-105 disabled:cursor-wait disabled:opacity-60',
        isFavorite
          ? 'border-neutral-950'
          : 'border-black/10 hover:border-black/30',
        isAnimating
          ? 'scale-110'
          : 'scale-100',
        className,
      ].join(' ')}
      aria-label={
        isFavorite
          ? 'Remover produto dos favoritos'
          : 'Adicionar produto aos favoritos'
      }
      aria-pressed={isFavorite}
      title={
        isFavorite
          ? 'Remover dos favoritos'
          : 'Adicionar aos favoritos'
      }
    >
      <span
        className={[
          'flex items-center justify-center transition duration-300',
          isAnimating
            ? 'scale-125'
            : 'scale-100',
        ].join(' ')}
      >
        <HeartIcon
          filled={isFavorite}
        />
      </span>

      {isSubmitting && (
        <span
          className="absolute inset-[-3px] animate-spin rounded-full border border-transparent border-t-neutral-950"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function HeartIcon({
  filled = false,
  className = '',
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={
        filled
          ? 'currentColor'
          : 'none'
      }
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        'h-[18px] w-[18px] transition duration-300',
        'group-hover/favorite:scale-110',
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}