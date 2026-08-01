import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {FavoriteButton} from '~/features/favorites/FavoriteButton';
import {useVariantUrl} from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <article className="product-item group relative">
      <div className="relative overflow-hidden">
        <Link
          prefetch="intent"
          to={variantUrl}
          aria-label={`Ver ${product.title}`}
          className="block"
        >
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="h-auto w-full transition duration-500 ease-out group-hover:scale-[1.015]"
            />
          ) : (
            <div
              className="aspect-square w-full bg-neutral-100"
              aria-hidden="true"
            />
          )}
        </Link>

        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <Link
        prefetch="intent"
        to={variantUrl}
        className="block text-inherit no-underline"
      >
        <h4>{product.title}</h4>

        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </Link>
    </article>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */