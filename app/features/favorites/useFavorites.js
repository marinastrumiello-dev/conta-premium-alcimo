import {
  useCallback,
  useEffect,
  useState,
} from 'react';

const FAVORITES_EVENT =
  'alcimo:favorites-changed';

export function useFavorites({
  initialProducts = [],
  productSaved = false,
}) {
  const [products, setProducts] =
    useState(initialProducts);

  const [removingIds, setRemovingIds] =
    useState([]);

  const [toast, setToast] =
    useState(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (!productSaved) return;

    setToast({
      type: 'success',
      title: 'Produto salvo',
      message:
        'A peça foi adicionada aos seus favoritos.',
    });
  }, [productSaved]);

  useEffect(() => {
    function handleFavoritesChange(event) {
      const detail = event.detail || {};

      if (
        detail.type === 'removed' &&
        detail.productId
      ) {
        removeProductWithAnimation(
          detail.productId,
        );

        setToast({
          type: 'removed',
          title: 'Produto removido',
          message:
            'A peça foi retirada dos seus favoritos.',
        });

        return;
      }

      if (detail.type === 'added') {
        setToast({
          type: 'success',
          title: 'Produto salvo',
          message:
            'A peça foi adicionada aos seus favoritos.',
        });

        return;
      }

      if (detail.type === 'error') {
        setToast({
          type: 'error',
          title:
            'Não foi possível atualizar',
          message:
            detail.message ||
            'Tente novamente em alguns instantes.',
        });
      }
    }

    window.addEventListener(
      FAVORITES_EVENT,
      handleFavoritesChange,
    );

    return () => {
      window.removeEventListener(
        FAVORITES_EVENT,
        handleFavoritesChange,
      );
    };
  }, []);

  const removeProductWithAnimation =
    useCallback((productId) => {
      setRemovingIds((currentIds) => {
        if (
          currentIds.includes(productId)
        ) {
          return currentIds;
        }

        return [
          ...currentIds,
          productId,
        ];
      });

      window.setTimeout(() => {
        setProducts((currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !== productId,
          ),
        );

        setRemovingIds((currentIds) =>
          currentIds.filter(
            (id) => id !== productId,
          ),
        );
      }, 360);
    }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    products,
    productsCount: products.length,
    removingIds,
    toast,
    closeToast,
  };
}