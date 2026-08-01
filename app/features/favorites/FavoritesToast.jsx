import {useEffect} from 'react';
import {
  buildStoreSyncUrl,
  handleStoreNavigation,
} from '~/lib/favoritesSync';

const ALCIMO_COLLECTION_URL = 'https://alcimo.com/collections/all';

export function FavoritesToast({
  toast,
  onClose,
}) {
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(
      onClose,
      3800,
    );

    return () =>
      window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError =
    toast.type === 'error';

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
    <div
      className="fixed bottom-5 left-5 right-5 z-[100] sm:left-auto sm:right-6 sm:w-[390px]"
      role={
        isError ? 'alert' : 'status'
      }
      aria-live="polite"
    >
      <div className="flex items-start gap-4 border border-neutral-200 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
        <div
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isError
              ? 'bg-[#7a2929] text-white'
              : 'bg-neutral-950 text-white',
          ].join(' ')}
        >
          {isError ? (
            <ErrorIcon />
          ) : (
            <CheckIcon />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-950">
            {toast.title}
          </p>

          <p className="mt-2 text-[12px] leading-5 text-neutral-600">
            {toast.message}
          </p>

          {!isError && (
            <a
              href={storeReturnUrl}
              onClick={handleContinueShopping}
              className="mt-3 inline-block text-[9px] uppercase tracking-[0.14em] !text-neutral-950 underline underline-offset-4"
            >
              Continuar explorando
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center border-0 bg-transparent text-neutral-500 transition hover:text-neutral-950"
          aria-label="Fechar aviso"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 7v6" />
      <path d="M12 17.5h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
