import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Perfil | ALCIMO & CO.'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method.toUpperCase() !== 'POST') {
    return data(
      {
        error: 'Ação não permitida.',
        success: null,
        customer: null,
      },
      {
        status: 405,
      },
    );
  }

  const form = await request.formData();

  const intent = getFormValue(form, 'intent');

  if (intent !== 'update-profile') {
    return data(
      {
        error: 'Ação não reconhecida.',
        success: null,
        customer: null,
      },
      {
        status: 400,
      },
    );
  }

  const firstName = normalizeName(
    getFormValue(form, 'firstName'),
  );

  const lastName = normalizeName(
    getFormValue(form, 'lastName'),
  );

  if (firstName.length < 2) {
    return data(
      {
        error: 'Informe um nome válido com pelo menos 2 caracteres.',
        success: null,
        customer: null,
      },
      {
        status: 400,
      },
    );
  }

  if (lastName.length < 2) {
    return data(
      {
        error:
          'Informe um sobrenome válido com pelo menos 2 caracteres.',
        success: null,
        customer: null,
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer: {
            firstName,
            lastName,
          },
          language: customerAccount.i18n.language,
        },
      },
    );

    if (result.errors?.length) {
      throw new Error(
        result.errors
          .map((error) => error?.message)
          .filter(Boolean)
          .join(' '),
      );
    }

    const userErrors =
      result.data?.customerUpdate?.userErrors || [];

    if (userErrors.length) {
      throw new Error(
        userErrors
          .map((error) => error?.message)
          .filter(Boolean)
          .join(' '),
      );
    }

    const updatedCustomer =
      result.data?.customerUpdate?.customer;

    if (!updatedCustomer) {
      throw new Error(
        'A Shopify não confirmou a atualização do perfil.',
      );
    }

    return {
      error: null,
      success: 'Seus dados foram atualizados com sucesso.',
      customer: updatedCustomer,
    };
  } catch (error) {
    return data(
      {
        error: translateProfileError(
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar o perfil.',
        ),
        success: null,
        customer: null,
      },
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const navigation = useNavigation();

  /** @type {ActionReturnData} */
  const actionData = useActionData();

  const customer =
    actionData?.customer || account?.customer || {};

  const isUpdating =
    navigation.state !== 'idle' &&
    navigation.formData?.get('intent') ===
      'update-profile';

  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';
  const email = getCustomerEmail(customer);

  const fullName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    'Cliente ALCIMO';

  const initials = getInitials(firstName, lastName);

  return (
    <div className="w-full min-w-0 pb-8">
      <header className="mb-8 border-b border-neutral-200 pb-7 sm:mb-10">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Dados da conta
        </p>

        <h1 className="font-serif text-[30px] font-normal leading-tight text-neutral-950 sm:text-[38px]">
          Perfil
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
          Mantenha suas informações pessoais atualizadas para uma
          experiência mais completa na ALCIMO.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ProfileForm
          customer={customer}
          isUpdating={isUpdating}
          actionData={actionData}
        />

        <aside className="space-y-5">
          <ProfileSummary
            initials={initials}
            fullName={fullName}
            email={email}
          />

          <AccountSecurity email={email} />
        </aside>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   customer: CustomerFragment;
 *   isUpdating: boolean;
 *   actionData: ActionReturnData;
 * }}
 */
function ProfileForm({
  customer,
  isUpdating,
  actionData,
}) {
  return (
    <section className="overflow-hidden border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-6 sm:px-7 lg:px-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          Informações pessoais
        </p>

        <h2 className="mt-2 font-serif text-2xl font-normal text-neutral-950">
          Seus dados
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
          Essas informações são utilizadas para identificar sua conta
          e personalizar sua experiência.
        </p>
      </div>

      <Form
        method="post"
        className="!m-0 !block !w-full !max-w-none px-5 py-6 sm:px-7 sm:py-7 lg:px-8"
      >
        <fieldset className="!m-0 !w-full border-0 !p-0">
          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField
              id="firstName"
              name="firstName"
              label="Nome"
              placeholder="Digite seu nome"
              defaultValue={customer?.firstName || ''}
              autoComplete="given-name"
              minLength={2}
              required
            />

            <ProfileField
              id="lastName"
              name="lastName"
              label="Sobrenome"
              placeholder="Digite seu sobrenome"
              defaultValue={customer?.lastName || ''}
              autoComplete="family-name"
              minLength={2}
              required
            />

            <div className="sm:col-span-2">
              <ReadOnlyEmailField
                email={getCustomerEmail(customer)}
              />
            </div>
          </div>

          <div className="mt-6 border border-neutral-200 bg-neutral-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <InfoIcon />

              <div>
                <p className="text-xs font-medium leading-5 text-neutral-950">
                  Alteração do e-mail
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  O e-mail é utilizado para acessar sua conta e receber
                  informações sobre os pedidos. Por segurança, ele não
                  pode ser alterado neste formulário.
                </p>
              </div>
            </div>
          </div>

          {actionData?.error && (
            <div
              role="alert"
              className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {actionData.error}
            </div>
          )}

          {actionData?.success && (
            <div
              role="status"
              className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
            >
              <div className="flex items-start gap-3">
                <SuccessIcon />

                <span>{actionData.success}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end border-t border-neutral-200 pt-6">
            <button
              type="submit"
              name="intent"
              value="update-profile"
              disabled={isUpdating}
              className="inline-flex min-h-12 w-full items-center justify-center bg-neutral-950 px-8 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <LoadingIcon />
                  Salvando alterações...
                </>
              ) : (
                'Salvar alterações'
              )}
            </button>
          </div>
        </fieldset>
      </Form>
    </section>
  );
}

/**
 * @param {{
 *   id: string;
 *   name: string;
 *   label: string;
 *   placeholder: string;
 *   defaultValue: string;
 *   autoComplete?: string;
 *   minLength?: number;
 *   required?: boolean;
 * }}
 */
function ProfileField({
  id,
  name,
  label,
  placeholder,
  defaultValue,
  autoComplete,
  minLength,
  required = false,
}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-2.5 block text-xs text-neutral-700"
      >
        {label}
        {required ? ' *' : ''}
      </label>

      <input
        id={id}
        name={name}
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={label}
        defaultValue={defaultValue}
        minLength={minLength}
        required={required}
        className="!m-0 h-12 !w-full !min-w-0 !max-w-none rounded-none border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-0"
      />
    </div>
  );
}

/**
 * @param {{email: string}}
 */
function ReadOnlyEmailField({email}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor="profile-email"
        className="mb-2.5 flex items-center justify-between gap-3 text-xs text-neutral-700"
      >
        <span>E-mail da conta</span>

        <span className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
          Protegido
        </span>
      </label>

      <div className="relative">
        <input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          aria-label="E-mail da conta"
          className="!m-0 h-12 !w-full !min-w-0 !max-w-none cursor-not-allowed rounded-none border border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm text-neutral-600 outline-none"
        />

        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-400">
          <LockIcon />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   initials: string;
 *   fullName: string;
 *   email: string;
 * }}
 */
function ProfileSummary({
  initials,
  fullName,
  email,
}) {
  return (
    <section className="border border-neutral-200 bg-white p-6 sm:p-7">
      <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
        Sua conta
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 font-serif text-xl text-white">
          {initials}
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-serif text-xl font-normal text-neutral-950">
            {fullName}
          </h2>

          <p className="mt-1 truncate text-xs text-neutral-500">
            {email}
          </p>
        </div>
      </div>

      <div className="mt-7 border-t border-neutral-200 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-700">
            <ProfileIcon />
          </div>

          <div>
            <p className="text-xs font-medium text-neutral-950">
              Perfil identificado
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Seus dados estão vinculados à sua conta ALCIMO.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * @param {{email: string}}
 */
function AccountSecurity({email}) {
  return (
    <section className="border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700">
        <ShieldIcon />
      </div>

      <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        Segurança
      </p>

      <h2 className="mt-2 font-serif text-xl font-normal text-neutral-950">
        Acesso protegido
      </h2>

      <p className="mt-3 text-xs leading-6 text-neutral-600">
        O acesso à sua conta é confirmado por meio do código enviado
        para:
      </p>

      <p className="mt-3 break-all text-xs font-medium leading-6 text-neutral-950">
        {email}
      </p>
    </section>
  );
}

function getCustomerEmail(customer) {
  if (
    typeof customer?.emailAddress?.emailAddress === 'string'
  ) {
    return customer.emailAddress.emailAddress;
  }

  if (typeof customer?.emailAddress === 'string') {
    return customer.emailAddress;
  }

  if (typeof customer?.email === 'string') {
    return customer.email;
  }

  return 'E-mail não informado';
}

function getInitials(firstName, lastName) {
  const firstInitial = String(firstName || '')
    .trim()
    .charAt(0);

  const lastInitial = String(lastName || '')
    .trim()
    .charAt(0);

  const initials = `${firstInitial}${lastInitial}`
    .toUpperCase()
    .trim();

  return initials || 'AC';
}

function normalizeName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function getFormValue(form, key) {
  const value = form.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

function translateProfileError(message) {
  const normalized = String(message || '').toLowerCase();

  if (
    normalized.includes('first name') ||
    normalized.includes('firstname')
  ) {
    return 'Informe um nome válido.';
  }

  if (
    normalized.includes('last name') ||
    normalized.includes('lastname')
  ) {
    return 'Informe um sobrenome válido.';
  }

  if (
    normalized.includes('unauthorized') ||
    normalized.includes('logged') ||
    normalized.includes('session')
  ) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }

  if (
    normalized.includes('customer profile update failed') ||
    normalized.includes('customer update')
  ) {
    return 'Não foi possível atualizar o perfil.';
  }

  return message || 'Não foi possível atualizar o perfil.';
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m7.5 12 3 3 6-7" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="mr-3 h-4 w-4 shrink-0 animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="5.5" y="10" width="13" height="10" rx="1" />
      <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 3 19 6v5c0 4.6-2.8 8.1-7 10-4.2-1.9-7-5.4-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   success: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */