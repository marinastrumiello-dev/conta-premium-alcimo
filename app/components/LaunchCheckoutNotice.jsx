import {CartForm} from '@shopify/hydrogen';
import {useId, useState} from 'react';

const LAUNCH_ACCEPTANCE_NOTE =
  'COLEÇÃO DE LANÇAMENTO ALCIMO & CO. — Cliente confirmou estar ciente de que o pedido de lançamento será enviado até 15/10/2026 e deseja prosseguir com a compra.';

/**
 * Mandatory launch-collection acknowledgement shown before checkout.
 * The checkout action first persists the acknowledgement as a cart note,
 * then redirects the customer to Shopify checkout.
 *
 * @param {{checkoutUrl?: string; layout?: 'page' | 'aside'}} props
 */
export function LaunchCheckoutNotice({checkoutUrl, layout = 'page'}) {
  const [accepted, setAccepted] = useState(false);
  const checkboxId = useId();

  if (!checkoutUrl) return null;

  return (
    <section
      className={`launch-checkout-notice launch-checkout-notice--${layout}`}
      aria-labelledby={`${checkboxId}-title`}
    >
      <div className="launch-checkout-notice__heading">
        <div>
          <p className="launch-checkout-notice__eyebrow">ALCIMO &amp; CO.</p>
          <h3 id={`${checkboxId}-title`}>Coleção de Lançamento</h3>
        </div>
        <span className="launch-checkout-notice__box-icon" aria-hidden="true">
          ◇
        </span>
      </div>

      <div className="launch-checkout-notice__content">
        <p>
          Sua peça faz parte da nossa primeira coleção e está atualmente em
          produção.
        </p>
        <p>
          Os pedidos realizados durante o período de lançamento{' '}
          <strong>serão enviados até 15 de outubro de 2026.</strong>
        </p>
        <p>
          Após a postagem, o prazo de entrega seguirá a modalidade de frete
          escolhida no momento da compra.
        </p>
      </div>

      <label className="launch-checkout-notice__accept" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.currentTarget.checked)}
        />
        <span>
          Estou ciente de que este é um pedido de lançamento, com envio até 15
          de outubro de 2026, e desejo prosseguir com a compra.
        </span>
      </label>

      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.NoteUpdate}
        inputs={{note: LAUNCH_ACCEPTANCE_NOTE}}
      >
        {(fetcher) => {
          const isSubmitting = fetcher.state !== 'idle';

          return (
            <>
              <input type="hidden" name="redirectTo" value={checkoutUrl} />
              <button
                className="launch-checkout-notice__checkout"
                type="submit"
                disabled={!accepted || isSubmitting}
                aria-disabled={!accepted || isSubmitting}
              >
                <span aria-hidden="true">{accepted ? '✓' : '▢'}</span>
                {isSubmitting ? 'SALVANDO ACEITE...' : 'FINALIZAR COMPRA'}
              </button>
            </>
          );
        }}
      </CartForm>

      <p className="launch-checkout-notice__footnote">
        Ao finalizar sua compra, você confirma que leu e está de acordo com as
        condições de envio da coleção de lançamento.
      </p>
    </section>
  );
}
