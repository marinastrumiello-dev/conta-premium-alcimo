import {useEffect, useMemo, useState} from 'react';
import {Form, NavLink} from 'react-router';
import accountContent from '~/config/accountContent';
import {getCustomerFavoriteIds} from '~/lib/favorites';
import {
  buildStoreSyncUrl,
  handleStoreNavigation,
  normalizeFavoriteIds,
  writeAccountFavoriteIds,
} from '~/lib/favoritesSync';

export function AccountSidebar({customer}) {
  const sidebar = accountContent.sidebar;

  const accountSection =
    sidebar.sections.find(
      (section) => section.id === 'account',
    ) || sidebar.sections[0];

  const alcimoSection =
    sidebar.sections.find(
      (section) => section.id === 'alcimo',
    ) || sidebar.sections[1];

  const storeItem = sidebar.footerItems.find(
    (item) => item.id === 'store',
  );

  const logoutItem = sidebar.footerItems.find(
    (item) => item.id === 'logout',
  );

  const customerName = getCustomerName(
    customer,
    sidebar.customerFallbackName,
  );

  const customerEmail =
    getCustomerEmail(customer) ||
    sidebar.customerFallbackEmail;

  const initialFavoriteIds = useMemo(
    () => getCustomerFavoriteIds(customer),
    [customer],
  );

  const [favoriteIds, setFavoriteIds] =
    useState(initialFavoriteIds);

  /*
   * Ao abrir ou atualizar a Área do Cliente, o metafield vindo
   * do servidor é a fonte oficial. Nunca recuperamos uma lista
   * antiga do sessionStorage para substituir o servidor.
   */
  useEffect(() => {
    const nextIds =
      normalizeFavoriteIds(
        initialFavoriteIds,
      );

    setFavoriteIds(nextIds);
    writeAccountFavoriteIds(nextIds);
  }, [initialFavoriteIds]);

  useEffect(() => {
    function handleFavoritesChange(event) {
      const detail = event.detail || {};

      if (Array.isArray(detail.favoriteIds)) {
        const nextIds =
          normalizeFavoriteIds(
            detail.favoriteIds,
          );

        setFavoriteIds(nextIds);
        writeAccountFavoriteIds(nextIds);
        return;
      }

      if (!detail.productId) return;

      setFavoriteIds((currentIds) => {
        let nextIds = currentIds;

        if (detail.type === 'removed') {
          nextIds = currentIds.filter(
            (id) => id !== detail.productId,
          );
        }

        if (detail.type === 'added') {
          nextIds = normalizeFavoriteIds([
            ...currentIds,
            detail.productId,
          ]);
        }

        writeAccountFavoriteIds(nextIds);
        return nextIds;
      });
    }

    window.addEventListener(
      'alcimo:favorites-changed',
      handleFavoritesChange,
    );

    return () => {
      window.removeEventListener(
        'alcimo:favorites-changed',
        handleFavoritesChange,
      );
    };
  }, []);

  const favoritesCount = favoriteIds.length;

  const storeReturnUrl = useMemo(
    () =>
      buildStoreSyncUrl(
        storeItem?.href,
        favoriteIds,
      ),
    [storeItem?.href, favoriteIds],
  );

  function handleStoreReturn(event) {
    const latestFavoriteIds =
      writeAccountFavoriteIds(
        favoriteIds,
      );

    handleStoreNavigation(
      event,
      storeItem?.href,
      latestFavoriteIds,
    );
  }

  return (
    <div className="border-b border-neutral-200 bg-white lg:min-h-[calc(100vh-74px)] lg:w-[245px] lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-4 py-6 sm:px-6 lg:min-h-[calc(100vh-74px)] lg:px-4 lg:py-10">
        <CustomerIdentity
          customer={customer}
          customerName={customerName}
          customerEmail={customerEmail}
        />

        <nav
          aria-label={
            accountSection?.label ||
            'Navegação da conta'
          }
          className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:mt-8 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
        >
          {(accountSection?.items || []).map((item) => (
            <SidebarMenuItem
              key={item.id}
              item={item}
              end={item.id === 'dashboard'}
              badge={
                item.id === 'favorites'
                  ? favoritesCount
                  : null
              }
            />
          ))}
        </nav>

        <div className="my-5 hidden border-t border-neutral-200 lg:block" />

        <nav
          aria-label={
            alcimoSection?.label ||
            'Serviços ALCIMO'
          }
          className="hidden flex-col gap-1 lg:flex"
        >
          {(alcimoSection?.items || []).map((item) => (
            <SidebarMenuItem
              key={item.id}
              item={item}
            />
          ))}
        </nav>

        <div className="mt-auto hidden pt-8 lg:block">
          <div className="border-t border-neutral-200 pt-6">
            {storeItem && (
              <a
                href={storeReturnUrl}
                onClick={handleStoreReturn}
                className="flex min-h-[46px] items-center gap-3 rounded-[8px] px-4 py-3 !text-neutral-700 no-underline transition hover:bg-[#f5f1eb] hover:!text-neutral-950"
              >
                <SidebarIcon name={storeItem.icon} />

                <span className="text-[11px] uppercase tracking-[0.12em]">
                  {storeItem.label}
                </span>
              </a>
            )}

            {logoutItem && (
              <Form
                method="post"
                action={logoutItem.href}
                className="!m-0"
              >
                <button
                  type="submit"
                  className="flex min-h-[46px] w-full items-center gap-3 rounded-[8px] border-0 bg-transparent px-4 py-3 text-left !text-neutral-700 transition hover:bg-[#f5f1eb] hover:!text-neutral-950"
                >
                  <SidebarIcon name={logoutItem.icon} />

                  <span className="text-[11px] uppercase tracking-[0.12em]">
                    {logoutItem.label}
                  </span>
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




function SidebarMenuItem({
  item,
  end = false,
  badge = null,
}) {
  const isHashLink =
    typeof item.href === 'string' &&
    item.href.includes('#');

  if (item.external || isHashLink) {
    return (
      <a
        href={item.href}
        className="flex min-h-[49px] shrink-0 items-center gap-3 whitespace-nowrap rounded-[8px] px-4 py-3 !text-neutral-800 no-underline transition hover:bg-[#f7f4ef] hover:!text-neutral-950 lg:w-full"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-neutral-900">
          <SidebarIcon name={item.icon} />
        </span>

        <span className="text-[12px] tracking-[0.01em]">
          {item.label}
        </span>

        <SidebarBadge value={badge} />
      </a>
    );
  }

  return (
    <AccountNavLink
      to={item.href}
      end={end}
      icon={<SidebarIcon name={item.icon} />}
      badge={badge}
    >
      {item.label}
    </AccountNavLink>
  );
}

function CustomerIdentity({
  customer,
  customerName,
  customerEmail,
}) {
  return (
    <div className="flex items-center gap-4 lg:flex-col lg:text-center">
      <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full bg-neutral-950 font-serif text-[23px] font-light uppercase text-white">
        {getInitials(customer)}
      </div>

      <div className="min-w-0">
        <p className="truncate font-serif text-[18px] font-normal text-neutral-950 lg:mt-3">
          {customerName}
        </p>

        <p className="mt-1 truncate text-[11px] text-neutral-500">
          {customerEmail}
        </p>
      </div>
    </div>
  );
}

function AccountNavLink({
  to,
  end = false,
  icon,
  children,
  badge = null,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({isActive, isPending}) =>
        [
          'flex min-h-[49px] shrink-0 items-center gap-3 whitespace-nowrap rounded-[8px] border-0 px-4 py-3 no-underline transition lg:w-full',
          isActive
            ? '!bg-[#f3eee7] !text-neutral-950'
            : '!bg-transparent !text-neutral-800 hover:!bg-[#f7f4ef] hover:!text-neutral-950',
          isPending ? 'opacity-50' : '',
        ].join(' ')
      }
    >
      {({isActive}) => (
        <>
          <span
            className={[
              'flex h-5 w-5 shrink-0 items-center justify-center',
              isActive
                ? 'text-[#7b5a36]'
                : 'text-neutral-900',
            ].join(' ')}
          >
            {icon}
          </span>

          <span className="text-[12px] tracking-[0.01em]">
            {children}
          </span>

          <SidebarBadge
            value={badge}
            active={isActive}
          />
        </>
      )}
    </NavLink>
  );
}

function SidebarBadge({value, active = false}) {
  if (
    value === null ||
    value === undefined ||
    Number(value) <= 0
  ) {
    return null;
  }

  const formattedValue =
    Number(value) > 99 ? '99+' : String(value);

  return (
    <span
      className={[
        'ml-auto inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-1 text-[9px] font-medium leading-none tabular-nums transition',
        active
          ? 'bg-neutral-950 text-white'
          : 'bg-[#eee7de] text-[#6f5133]',
      ].join(' ')}
      aria-label={`${formattedValue} produtos favoritos`}
    >
      {formattedValue}
    </span>
  );
}

function SidebarIcon({name}) {
  switch (name) {
    case 'package':
    case 'orders':
      return <OrdersIcon />;

    case 'heart':
    case 'favorites':
      return <HeartIcon />;

    case 'mapPin':
    case 'address':
    case 'addresses':
      return <AddressIcon />;

    case 'user':
    case 'profile':
      return <ProfileIcon />;

    case 'crown':
    case 'program':
      return <CrownIcon />;

    case 'gift':
    case 'benefits':
      return <GiftIcon />;

    case 'messageCircle':
    case 'support':
    case 'contact':
      return <SupportIcon />;

    case 'arrowLeft':
    case 'store':
      return <StoreIcon />;

    case 'logOut':
    case 'logout':
      return <LogoutIcon />;

    case 'home':
    case 'dashboard':
    default:
      return <HomeIcon />;
  }
}

function getCustomerName(customer, fallback) {
  const firstName = customer?.firstName?.trim();
  const lastName = customer?.lastName?.trim();
  const displayName = customer?.displayName?.trim();

  if (firstName || lastName) {
    return [firstName, lastName]
      .filter(Boolean)
      .join(' ');
  }

  if (displayName && !displayName.includes('@')) {
    return displayName;
  }

  return fallback || 'Cliente ALCIMO';
}

function getCustomerEmail(customer) {
  if (
    typeof customer?.emailAddress?.emailAddress ===
    'string'
  ) {
    return customer.emailAddress.emailAddress;
  }

  if (typeof customer?.emailAddress === 'string') {
    return customer.emailAddress;
  }

  if (typeof customer?.email === 'string') {
    return customer.email;
  }

  return '';
}

function getInitials(customer) {
  const firstName = customer?.firstName?.trim() || '';
  const lastName = customer?.lastName?.trim() || '';

  if (firstName || lastName) {
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();

    return initials.toUpperCase() || 'AC';
  }

  const displayName = customer?.displayName?.trim();

  if (displayName && !displayName.includes('@')) {
    const parts = displayName
      .split(/\s+/)
      .filter(Boolean);

    const firstInitial =
      parts[0]?.charAt(0) || '';

    const lastInitial =
      parts.length > 1
        ? parts[parts.length - 1]?.charAt(0) || ''
        : '';

    return `${firstInitial}${lastInitial}`.toUpperCase() || 'AC';
  }

  return 'AC';
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="4.5"
        y="5.5"
        width="15"
        height="15"
        rx="1.5"
      />

      <path d="M8 3.5v4M16 3.5v4M8 11h8M8 15h5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function AddressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m3.5 7 4.5 4 4-7 4 7 4.5-4-2 11h-13l-2-11Z" />
      <path d="M6 21h12" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="9"
        width="17"
        height="11.5"
        rx="1"
      />

      <path d="M12 9v11.5M3.5 13h17M6 9c-1.5 0-2.5-.9-2.5-2.1S4.4 5 5.7 5C8.1 5 10 9 10 9M18 9c1.5 0 2.5-.9 2.5-2.1S19.6 5 18.3 5C15.9 5 14 9 14 9" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4.5 5.5h15v11h-8l-4.5 3v-3H4.5v-11Z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M11 5 4 12l7 7" />
      <path d="M4 12h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}