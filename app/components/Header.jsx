import {Suspense, useState} from 'react';
import {Await, NavLink, useMatches} from 'react-router';
import {useAside} from '~/components/Aside';
import accountContent from '~/config/accountContent';
import {
  buildStoreSyncUrl,
  handleStoreNavigation,
} from '~/lib/favoritesSync';

/**
 * Cabeçalho principal do portal ALCIMO.
 *
 * Todos os textos e links vêm de:
 * app/config/accountContent.js
 *
 * @param {HeaderProps}
 */
export function Header({isLoggedIn}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {brand, header, storeLinks} = accountContent;

  function toggleSearch() {
    setIsSearchOpen((currentValue) => !currentValue);
  }

  function closeSearch() {
    setIsSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex h-[74px] w-full max-w-[1920px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a
          href={buildStoreSyncUrl(storeLinks.home)}
          onClick={(event) =>
            handleStoreNavigation(
              event,
              storeLinks.home,
            )
          }
          aria-label={`Ir para a página inicial da ${brand.name}`}
          className="shrink-0 no-underline !text-white"
        >
          <img
            src="/alcimo-logo-branca.png"
            alt="ALCIMO | & CO."
            width="1603"
            height="246"
            className="block h-auto w-[185px] object-contain sm:w-[215px]"
          />
        </a>

        <HeaderMenu viewport="desktop" />

        <HeaderCtas
          isLoggedIn={isLoggedIn}
          isSearchOpen={isSearchOpen}
          onSearchToggle={toggleSearch}
        />
      </div>

      <HeaderSearch
        isOpen={isSearchOpen}
        onClose={closeSearch}
      />
    </header>
  );
}

/**
 * Menu principal do cabeçalho.
 *
 * @param {{
 *   viewport: Viewport;
 * }}
 */
export function HeaderMenu({viewport}) {
  const {close} = useAside();

  const {brand, header, storeLinks} = accountContent;
  const menuItems = header.navigation;

  if (viewport === 'mobile') {
    return (
      <nav
        className="flex flex-col"
        role="navigation"
        aria-label="Menu principal"
      >
        <a
          href={buildStoreSyncUrl(storeLinks.home)}
          onClick={(event) => {
            close();
            handleStoreNavigation(
              event,
              storeLinks.home,
            );
          }}
          className="border-b border-neutral-200 px-1 py-5 text-sm uppercase tracking-[0.14em] !text-neutral-950 no-underline"
        >
          Início
        </a>

        {menuItems.map((item) => (
          <a
            key={item.id}
            href={buildStoreSyncUrl(item.href)}
            onClick={(event) => {
              close();
              handleStoreNavigation(
                event,
                item.href,
              );
            }}
            className="border-b border-neutral-200 px-1 py-5 text-sm uppercase tracking-[0.14em] !text-neutral-950 no-underline"
          >
            {item.label}
          </a>
        ))}

        <NavLink
          to={header.icons.account.href}
          onClick={close}
          className="border-b border-neutral-200 px-1 py-5 text-sm uppercase tracking-[0.14em] !text-neutral-950 no-underline"
        >
          {header.icons.account.label}
        </NavLink>

        <MobileSearchForm onSubmit={close} />

        <a
          href={buildStoreSyncUrl(
            header.icons.cart.href,
          )}
          onClick={(event) => {
            close();
            handleStoreNavigation(
              event,
              header.icons.cart.href,
            );
          }}
          className="border-b border-neutral-200 px-1 py-5 text-sm uppercase tracking-[0.14em] !text-neutral-950 no-underline"
        >
          {header.icons.cart.label}
        </a>

        <p className="px-1 pt-8 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          {brand.name}
        </p>
      </nav>
    );
  }

  return (
    <nav
      className="hidden items-center gap-8 lg:flex"
      role="navigation"
      aria-label="Menu principal"
    >
      {menuItems.map((item) => (
        <a
          key={item.id}
          href={buildStoreSyncUrl(item.href)}
          onClick={(event) =>
            handleStoreNavigation(
              event,
              item.href,
            )
          }
          className="relative py-2 text-[11px] uppercase tracking-[0.17em] !text-white no-underline opacity-80 transition hover:opacity-100"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Ícones do cabeçalho.
 *
 * @param {{
 *   isLoggedIn: Promise<boolean>;
 *   isSearchOpen: boolean;
 *   onSearchToggle: () => void;
 * }}
 */
function HeaderCtas({
  isLoggedIn,
  isSearchOpen,
  onSearchToggle,
}) {
  const {header} = accountContent;
  const matches = useMatches();
  const customer = matches.find((match) => match.data?.customer)?.data?.customer;
  const customerFirstName =
    customer?.firstName?.trim() ||
    customer?.displayName?.trim().split(/\s+/)[0] ||
    'Cliente';

  return (
    <nav
      className="flex items-center gap-3 sm:gap-5"
      role="navigation"
      aria-label="Ações da conta"
    >
      <HeaderMenuMobileToggle />

      <button
        type="button"
        onClick={onSearchToggle}
        aria-label={
          isSearchOpen
            ? header.search.closeLabel
            : header.icons.search.ariaLabel
        }
        title={header.icons.search.label}
        aria-expanded={isSearchOpen}
        className="hidden h-10 w-10 items-center justify-center border-0 bg-transparent p-0 !text-white transition hover:opacity-70 sm:flex"
      >
        {isSearchOpen ? <CloseIcon /> : <SearchIcon />}
      </button>

      <NavLink
        prefetch="intent"
        to={header.icons.account.href}
        aria-label={header.icons.account.ariaLabel}
        title={header.icons.account.label}
        className="flex h-10 items-center justify-center !text-white no-underline transition hover:opacity-70"
      >
        <Suspense fallback={<AccountIcon />}>
          <Await
            resolve={isLoggedIn}
            errorElement={<AccountIcon />}
          >
            {(loggedIn) =>
              loggedIn ? (
                <>
                  <span className="hidden whitespace-nowrap text-[12px] font-normal tracking-[0.035em] lg:inline">
                    Olá, {customerFirstName}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center lg:hidden">
                    <AccountIcon />
                  </span>
                </>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center">
                  <AccountIcon />
                </span>
              )
            }
          </Await>
        </Suspense>
      </NavLink>

      <a
        href={buildStoreSyncUrl(
          header.icons.cart.href,
        )}
        onClick={(event) =>
          handleStoreNavigation(
            event,
            header.icons.cart.href,
          )
        }
        aria-label={header.icons.cart.ariaLabel}
        title={header.icons.cart.label}
        className="relative flex h-10 w-10 items-center justify-center !text-white no-underline transition hover:opacity-70"
      >
        <CartIcon />
      </a>
    </nav>
  );
}

/**
 * Área de pesquisa do cabeçalho desktop.
 *
 * Ao pesquisar, o cliente é enviado para:
 *
 * https://alcimo.com/search?q=TERMO
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 * }}
 */
function HeaderSearch({isOpen, onClose}) {
  const {header, storeLinks} = accountContent;

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full w-full border-t border-white/10 bg-black shadow-2xl">
      <div className="mx-auto w-full max-w-[1920px] px-5 py-6 sm:px-8 lg:px-10">
        <form
          action={storeLinks.search}
          method="get"
          role="search"
          className="mx-auto flex w-full max-w-[900px] items-center border-b border-white/40"
        >
          <label htmlFor="alcimo-header-search" className="sr-only">
            {header.icons.search.label}
          </label>

          <SearchIcon />

          <input
            id="alcimo-header-search"
            type="search"
            name="q"
            placeholder={header.search.placeholder}
            autoComplete="off"
            autoFocus
            required
            className="h-14 min-w-0 flex-1 border-0 bg-transparent px-4 text-[15px] tracking-[0.02em] text-white outline-none placeholder:text-white/45"
          />

          <button
            type="submit"
            className="shrink-0 border-0 bg-transparent px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:opacity-65 sm:px-5"
          >
            {header.search.buttonLabel}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={header.search.closeLabel}
            className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-white transition hover:opacity-65"
          >
            <CloseIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Pesquisa exibida dentro do menu móvel.
 *
 * @param {{
 *   onSubmit: () => void;
 * }}
 */
function MobileSearchForm({onSubmit}) {
  const {header, storeLinks} = accountContent;

  return (
    <form
      action={storeLinks.search}
      method="get"
      role="search"
      onSubmit={onSubmit}
      className="border-b border-neutral-200 py-4"
    >
      <label
        htmlFor="alcimo-mobile-search"
        className="mb-3 block px-1 text-sm uppercase tracking-[0.14em] text-neutral-950"
      >
        {header.icons.search.label}
      </label>

      <div className="flex items-center border border-neutral-300 bg-white">
        <input
          id="alcimo-mobile-search"
          type="search"
          name="q"
          placeholder={header.search.placeholder}
          autoComplete="off"
          required
          className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
        />

        <button
          type="submit"
          aria-label={header.search.buttonLabel}
          className="flex h-12 w-12 shrink-0 items-center justify-center border-0 border-l border-neutral-300 bg-transparent text-neutral-950"
        >
          <SearchIcon />
        </button>
      </div>
    </form>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();

  return (
    <button
      type="button"
      aria-label="Abrir menu"
      className="flex h-10 w-10 items-center justify-center border-0 bg-transparent p-0 !text-white lg:hidden"
      onClick={() => open('mobile')}
    >
      <MenuIcon />
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[23px] w-[23px] shrink-0"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[24px] w-[24px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[23px] w-[23px]"
      aria-hidden="true"
    >
      <path d="M5 8h14l-1 13H6L5 8Z" />
      <path d="M9 9V5.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[22px] w-[22px]"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}



/** @typedef {'desktop' | 'mobile'} Viewport */

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */