import {
  Image,
  Money,
} from '@shopify/hydrogen';

import {FavoriteButton} from '~/features/favorites/FavoriteButton';

export function FavoriteCard({
  product,
  isRemoving = false,
}) {
  const productUrl =
    `https://alcimo.com/products/${product.handle}`;

  const image = product.featuredImage;

  return (
    <article
      className={[
        'group transform-gpu transition-all duration-[360ms] ease-out',
        isRemoving
          ? 'pointer-events-none translate-y-2 scale-[0.97] opacity-0'
          : 'translate-y-0 scale-100 opacity-100',
      ].join(' ')}
    >
      <div className="relative overflow-hidden bg-neutral-100">
        <a
          href={productUrl}
          className="block"
          aria-label={`Ver ${product.title}`}
        >
          {image ? (
            <Image
              data={image}
              alt={
                image.altText ||
                product.title
              }
              aspectRatio="1/1"
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div
              className="aspect-square w-full bg-neutral-100"
              aria-hidden="true"
            />
          )}
        </a>
      </div>

      <div className="border-b border-neutral-200 pb-6 pt-5">
        <a
          href={productUrl}
          className="block !text-neutral-950 no-underline"
        >
          <h2 className="text-center font-serif text-[19px] font-normal">
            {product.title}
          </h2>

          <p className="mt-2 text-center text-[12px] text-neutral-700">
            <Money
              data={
                product.priceRange
                  .minVariantPrice
              }
            />
          </p>
        </a>

        <div className="mt-5 flex justify-center">
          <FavoriteButton
            productId={product.id}
            initialFavorite
            variant="remove"
          />
        </div>
      </div>
    </article>
  );
}