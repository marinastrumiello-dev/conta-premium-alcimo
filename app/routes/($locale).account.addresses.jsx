import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export const meta = () => {
  return [{title: 'Endereços | ALCIMO & CO.'}];
};

export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const intent = getFormValue(form, 'intent');
    const addressId = getFormValue(form, 'addressId');

    if (!addressId) {
      throw new Error('Não foi possível identificar o endereço.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();

    if (!isLoggedIn) {
      return data(
        {
          error: {
            [addressId]:
              'Sua sessão expirou. Entre novamente para continuar.',
          },
        },
        {status: 401},
      );
    }

    /*
     * A exclusão é processada antes da validação dos campos.
     * O formulário de exclusão envia somente intent e addressId.
     */
    if (intent === 'delete') {
      return deleteAddress({
        addressId,
        request,
        customerAccount,
      });
    }

    if (intent !== 'create' && intent !== 'update') {
      return data(
        {
          error: {
            [addressId]: 'Ação não reconhecida.',
          },
        },
        {status: 400},
      );
    }

    const defaultAddress =
      getFormValue(form, 'defaultAddress') === 'on';

    const street = getFormValue(form, 'street');
    const number = getFormValue(form, 'number');
    const complement = getFormValue(form, 'complement');
    const neighborhood = getFormValue(form, 'neighborhood');
    const city = getFormValue(form, 'city');
    const zoneCode = getFormValue(form, 'zoneCode').toUpperCase();
    const zip = getFormValue(form, 'zip');

    const validationError = validateAddressFields({
      street,
      number,
      neighborhood,
      city,
      zoneCode,
      zip,
    });

    if (validationError) {
      return addressActionError(addressId, validationError);
    }

    const address = {
      firstName: getFormValue(form, 'firstName'),
      lastName: getFormValue(form, 'lastName'),
      company: getFormValue(form, 'company'),
      address1: buildAddressLine1(street, number),
      address2: buildAddressLine2(complement, neighborhood),
      city,
      zoneCode,
      zip: formatZipForSubmission(zip),
      territoryCode: 'BR',
      phoneNumber: normalizePhoneNumber(
        getFormValue(form, 'phoneNumber'),
      ),
    };

    if (intent === 'create') {
      return createAddress({
        addressId,
        address,
        defaultAddress,
        customerAccount,
      });
    }

    return updateAddress({
      addressId,
      address,
      defaultAddress,
      customerAccount,
    });
  } catch (error) {
    return data(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível processar a solicitação.',
      },
      {status: 400},
    );
  }
}

async function createAddress({
  addressId,
  address,
  defaultAddress,
  customerAccount,
}) {
  try {
    const result = await customerAccount.mutate(
      CREATE_ADDRESS_MUTATION,
      {
        variables: {
          address,
          defaultAddress,
          language: customerAccount.i18n.language,
        },
      },
    );

    throwMutationErrors(
      result.errors,
      result.data?.customerAddressCreate?.userErrors,
    );

    const createdAddress =
      result.data?.customerAddressCreate?.customerAddress;

    if (!createdAddress) {
      throw new Error('Não foi possível cadastrar o endereço.');
    }

    return {
      error: null,
      success: {
        type: 'created',
        addressId,
        message: 'Endereço cadastrado com sucesso.',
      },
      createdAddress,
    };
  } catch (error) {
    return addressActionError(addressId, error);
  }
}

async function updateAddress({
  addressId,
  address,
  defaultAddress,
  customerAccount,
}) {
  try {
    const result = await customerAccount.mutate(
      UPDATE_ADDRESS_MUTATION,
      {
        variables: {
          address,
          addressId: decodeURIComponent(addressId),
          defaultAddress,
          language: customerAccount.i18n.language,
        },
      },
    );

    throwMutationErrors(
      result.errors,
      result.data?.customerAddressUpdate?.userErrors,
    );

    const updatedAddress =
      result.data?.customerAddressUpdate?.customerAddress;

    if (!updatedAddress) {
      throw new Error('Não foi possível atualizar o endereço.');
    }

    return {
      error: null,
      success: {
        type: 'updated',
        addressId,
        message: 'Endereço atualizado com sucesso.',
      },
      updatedAddress,
    };
  } catch (error) {
    return addressActionError(addressId, error);
  }
}

async function deleteAddress({
  addressId,
  request,
  customerAccount,
}) {
  try {
    const result = await customerAccount.mutate(
      DELETE_ADDRESS_MUTATION,
      {
        variables: {
          addressId: decodeURIComponent(addressId),
          language: customerAccount.i18n.language,
        },
      },
    );

    throwMutationErrors(
      result.errors,
      result.data?.customerAddressDelete?.userErrors,
    );

    const deletedAddressId =
      result.data?.customerAddressDelete?.deletedAddressId;

    if (!deletedAddressId) {
      throw new Error(
        'A Shopify não confirmou a exclusão do endereço.',
      );
    }

    const currentUrl = new URL(request.url);

    return redirect(
      `${currentUrl.pathname}?deleted=${Date.now()}`,
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, max-age=0',
        },
      },
    );
  } catch (error) {
    return addressActionError(addressId, error);
  }
}

function throwMutationErrors(errors, userErrors) {
  if (errors?.length) {
    throw new Error(
      errors
        .map((error) => error?.message)
        .filter(Boolean)
        .join(' '),
    );
  }

  if (userErrors?.length) {
    throw new Error(
      userErrors
        .map((error) => error?.message)
        .filter(Boolean)
        .join(' '),
    );
  }
}

function validateAddressFields({
  street,
  number,
  neighborhood,
  city,
  zoneCode,
  zip,
}) {
  if (!street) {
    return 'Informe o nome da rua.';
  }

  if (!number) {
    return 'Informe o número do endereço.';
  }

  if (!neighborhood) {
    return 'Informe o bairro.';
  }

  if (!city) {
    return 'Informe a cidade.';
  }

  if (!zoneCode) {
    return 'Selecione o estado.';
  }

  if (zip.replace(/\D/g, '').length !== 8) {
    return 'Informe um CEP válido.';
  }

  return null;
}

export default function Addresses() {
  const {customer} = useOutletContext();

  const addresses = customer?.addresses?.nodes || [];
  const defaultAddress = customer?.defaultAddress || null;

  const [isNewAddressOpen, setIsNewAddressOpen] = useState(
    addresses.length === 0,
  );

  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.success?.type === 'created') {
      setIsNewAddressOpen(false);
    }
  }, [actionData]);

  return (
    <div className="w-full min-w-0 pb-8">
      <header className="mb-8 border-b border-neutral-200 pb-7">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Informações de entrega
        </p>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-[30px] font-normal leading-tight text-neutral-950 sm:text-[38px]">
              Endereços
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
              Cadastre e gerencie os endereços utilizados nas suas
              compras.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsNewAddressOpen((current) => !current)
            }
            aria-expanded={isNewAddressOpen}
            className="inline-flex min-h-12 w-full items-center justify-center bg-neutral-950 px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 sm:w-fit"
          >
            {isNewAddressOpen ? (
              <>
                <CloseIcon />
                Fechar formulário
              </>
            ) : (
              <>
                <PlusIcon />
                Adicionar endereço
              </>
            )}
          </button>
        </div>
      </header>

      {isNewAddressOpen && (
        <section className="mb-8 overflow-hidden border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-6 sm:px-7 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Novo endereço
            </p>

            <h2 className="mt-2 font-serif text-2xl font-normal text-neutral-950">
              Adicionar endereço de entrega
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
              Digite o CEP para preencher automaticamente a rua,
              bairro, cidade e estado.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <NewAddressForm customer={customer} />
          </div>
        </section>
      )}

      <AddressesSection
        addresses={addresses}
        defaultAddress={defaultAddress}
        customer={customer}
        onAddAddress={() => setIsNewAddressOpen(true)}
      />
    </div>
  );
}

function NewAddressForm({customer}) {
  const newAddress = {
    id: 'new',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    zoneCode: '',
    zip: '',
    phoneNumber: '',
  };

  return (
    <AddressForm
      addressId="NEW_ADDRESS_ID"
      address={newAddress}
      defaultAddress={null}
      mode="create"
    >
      {({stateForIntent}) => {
        const isCreating =
          stateForIntent('create') !== 'idle';

        return (
          <div className="mt-8 flex justify-end border-t border-neutral-200 pt-6">
            <button
              type="submit"
              name="intent"
              value="create"
              disabled={isCreating}
              className="inline-flex min-h-12 w-full items-center justify-center bg-neutral-950 px-8 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isCreating
                ? 'Salvando endereço...'
                : 'Salvar endereço'}
            </button>
          </div>
        );
      }}
    </AddressForm>
  );
}

function AddressesSection({
  addresses,
  defaultAddress,
  customer,
  onAddAddress,
}) {
  if (!addresses.length) {
    return <EmptyAddresses onAddAddress={onAddAddress} />;
  }

  return (
    <section>
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          Endereços cadastrados
        </p>

        <p className="mt-2 text-sm text-neutral-600">
          {addresses.length}{' '}
          {addresses.length === 1
            ? 'endereço cadastrado'
            : 'endereços cadastrados'}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {addresses.map((address, index) => (
          <ExistingAddressCard
            key={address.id}
            address={address}
            defaultAddress={defaultAddress}
            customer={customer}
            index={index}
            addressesCount={addresses.length}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyAddresses({onAddAddress}) {
  return (
    <section className="border border-neutral-200 bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
        <LocationIcon />
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
        Sua conta ALCIMO
      </p>

      <h2 className="mt-3 font-serif text-2xl font-normal text-neutral-950 sm:text-[30px]">
        Você ainda não possui endereços.
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600">
        Cadastre um endereço para facilitar suas próximas compras e
        entregas.
      </p>

      <button
        type="button"
        onClick={onAddAddress}
        className="mt-8 inline-flex min-h-12 items-center justify-center bg-neutral-950 px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
      >
        <PlusIcon />
        Adicionar endereço
      </button>
    </section>
  );
}

function ExistingAddressCard({
  address,
  defaultAddress,
  customer,
  index,
  addressesCount,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const actionData = useActionData();

  const isDefaultAddress = defaultAddress?.id === address.id;

  const isOnlyDefaultAddress =
    isDefaultAddress && addressesCount === 1;

  useEffect(() => {
    if (
      actionData?.success?.type === 'updated' &&
      actionData.success.addressId === address.id
    ) {
      setIsEditing(false);
    }
  }, [actionData, address.id]);

  return (
    <article className="flex min-h-full flex-col border border-neutral-200 bg-white">
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              {isDefaultAddress
                ? 'Endereço principal'
                : `Endereço ${index + 1}`}
            </p>

            <h2 className="mt-3 font-serif text-2xl font-normal text-neutral-950">
              {getAddressCardTitle(address)}
            </h2>
          </div>

          {isDefaultAddress && (
            <span className="inline-flex min-h-7 shrink-0 items-center border border-neutral-300 bg-neutral-50 px-3 text-[9px] uppercase tracking-[0.15em] text-neutral-600">
              Padrão
            </span>
          )}
        </div>

        {!isEditing ? (
          <>
            <AddressSummary address={address} />

            <div className="mt-auto border-t border-neutral-200 pt-6">
              {isOnlyDefaultAddress ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex min-h-11 w-full items-center justify-center border border-neutral-950 px-5 text-[10px] font-medium uppercase tracking-[0.17em] text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
                  >
                    <EditIcon />
                    Editar endereço
                  </button>

                  <div className="border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <InfoIcon />

                      <div>
                        <p className="text-xs font-medium leading-5 text-neutral-950">
                          Este é o seu único endereço principal.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-600">
                          Para removê-lo, cadastre outro endereço e
                          defina o novo como principal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center border border-neutral-950 px-5 text-[10px] font-medium uppercase tracking-[0.17em] text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
                  >
                    <EditIcon />
                    Editar
                  </button>

                  <DeleteAddressForm
                    address={address}
                    isDefaultAddress={isDefaultAddress}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-7 border-t border-neutral-200 pt-7">
            <AddressForm
              addressId={address.id}
              address={{
                ...address,
                firstName:
                  address.firstName ||
                  customer?.firstName ||
                  '',
                lastName:
                  address.lastName ||
                  customer?.lastName ||
                  '',
              }}
              defaultAddress={defaultAddress}
              mode="edit"
            >
              {({stateForIntent}) => {
                const isSaving =
                  stateForIntent('update') !== 'idle';

                return (
                  <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-6 text-[10px] font-medium uppercase tracking-[0.17em] text-neutral-950 transition hover:border-neutral-950 disabled:opacity-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      name="intent"
                      value="update"
                      disabled={isSaving}
                      className="inline-flex min-h-11 items-center justify-center bg-neutral-950 px-7 text-[10px] font-medium uppercase tracking-[0.17em] text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {isSaving
                        ? 'Salvando...'
                        : 'Salvar alterações'}
                    </button>
                  </div>
                );
              }}
            </AddressForm>
          </div>
        )}
      </div>
    </article>
  );
}

function DeleteAddressForm({address, isDefaultAddress}) {
  const navigation = useNavigation();
  const actionData = useActionData();

  const submittedIntent =
    navigation.formData?.get('intent');

  const submittedAddressId =
    navigation.formData?.get('addressId');

  const isDeleting =
    navigation.state !== 'idle' &&
    submittedIntent === 'delete' &&
    submittedAddressId === address.id;

  const deleteError =
    typeof actionData?.error === 'object'
      ? actionData.error?.[address.id]
      : null;

  function handleDelete(event) {
    const confirmed = window.confirm(
      isDefaultAddress
        ? 'Este é o seu endereço principal. Deseja realmente excluí-lo?'
        : 'Deseja realmente excluir este endereço?',
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Form
        method="post"
        onSubmit={handleDelete}
        className="!m-0 flex w-full"
      >
        <input
          type="hidden"
          name="intent"
          value="delete"
        />

        <input
          type="hidden"
          name="addressId"
          value={address.id}
        />

        <button
          type="submit"
          disabled={isDeleting}
          className="inline-flex min-h-11 w-full items-center justify-center border border-neutral-300 px-5 text-[10px] font-medium uppercase tracking-[0.17em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <TrashIcon />

          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </Form>

      {deleteError && (
        <div
          role="alert"
          className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
        >
          {translateAddressError(deleteError)}
        </div>
      )}
    </div>
  );
}

function AddressSummary({address}) {
  const lines = useMemo(
    () => getAddressDisplayLines(address),
    [address],
  );

  return (
    <address className="my-7 not-italic text-sm leading-7 text-neutral-600">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={
            index === 0
              ? 'font-medium text-neutral-950'
              : ''
          }
        >
          {line}
        </p>
      ))}

      {address.phoneNumber && (
        <p className="mt-3">
          Telefone: {formatPhoneDisplay(address.phoneNumber)}
        </p>
      )}
    </address>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  mode,
  children,
}) {
  const navigation = useNavigation();
  const actionData = useActionData();

  const parsedAddress = useMemo(
    () => parseShopifyAddress(address),
    [address],
  );

  const initialZip = formatZipDisplay(address?.zip || '');
  const initialZipDigits = initialZip.replace(/\D/g, '');

  const [zip, setZip] = useState(initialZip);
  const [street, setStreet] = useState(parsedAddress.street);
  const [number, setNumber] = useState(parsedAddress.number);
  const [complement, setComplement] = useState(
    parsedAddress.complement,
  );
  const [neighborhood, setNeighborhood] = useState(
    parsedAddress.neighborhood,
  );
  const [city, setCity] = useState(address?.city || '');
  const [zoneCode, setZoneCode] = useState(
    address?.zoneCode || '',
  );
  const [phoneNumber, setPhoneNumber] = useState(
    formatPhoneDisplay(address?.phoneNumber || ''),
  );

  const [cepStatus, setCepStatus] = useState('idle');
  const [cepMessage, setCepMessage] = useState('');

  const lastSearchedCep = useRef(
    mode === 'edit' ? initialZipDigits : '',
  );

  const isDefaultAddress =
    defaultAddress?.id === addressId;

  const fieldSuffix = sanitizeFieldId(addressId);

  const error =
    typeof actionData?.error === 'object'
      ? actionData.error?.[addressId]
      : actionData?.error;

  const success =
    actionData?.success?.addressId === addressId
      ? actionData.success.message
      : null;

  useEffect(() => {
    const addressWasSaved =
      actionData?.success?.addressId === addressId &&
      (actionData.success.type === 'created' ||
        actionData.success.type === 'updated');

    if (!addressWasSaved) {
      return;
    }

    setCepStatus('idle');
    setCepMessage('');

    lastSearchedCep.current = zip.replace(/\D/g, '');
  }, [actionData, addressId, zip]);

  useEffect(() => {
    const digits = zip.replace(/\D/g, '');

    if (digits.length !== 8) {
      setCepStatus('idle');
      setCepMessage('');
      return;
    }

    if (lastSearchedCep.current === digits) {
      return;
    }

    lastSearchedCep.current = digits;

    const controller = new AbortController();

    async function searchZipCode() {
      setCepStatus('loading');
      setCepMessage('Consultando CEP...');

      try {
        const response = await fetch(`/api/cep/${digits}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          setCepStatus('error');
          setCepMessage(
            result?.error ||
              'CEP não encontrado. Preencha o endereço manualmente.',
          );
          return;
        }

        const returnedAddress = result.address || {};

        setStreet(returnedAddress.street || '');
        setNeighborhood(
          returnedAddress.neighborhood || '',
        );
        setCity(returnedAddress.city || '');
        setZoneCode(returnedAddress.state || '');

        if (!complement && returnedAddress.complement) {
          setComplement(returnedAddress.complement);
        }

        setCepStatus('success');
        setCepMessage('Endereço localizado com sucesso.');
      } catch (fetchError) {
        if (fetchError?.name === 'AbortError') {
          return;
        }

        setCepStatus('error');
        setCepMessage(
          'Não foi possível consultar o CEP. Preencha o endereço manualmente.',
        );
      }
    }

    searchZipCode();

    return () => controller.abort();
  }, [zip, complement]);

  function stateForIntent(intent) {
    const submittedIntent =
      navigation.formData?.get('intent');

    const submittedAddressId =
      navigation.formData?.get('addressId');

    if (
      submittedIntent === intent &&
      submittedAddressId === addressId
    ) {
      return navigation.state;
    }

    return 'idle';
  }

  function clearCepError() {
    if (cepStatus !== 'error') {
      return;
    }

    setCepStatus('idle');
    setCepMessage('');
  }

  function handleZipChange(event) {
    const formattedZip = formatZipDisplay(
      event.target.value,
    );

    const newDigits = formattedZip.replace(/\D/g, '');

    setZip(formattedZip);

    if (newDigits !== lastSearchedCep.current) {
      lastSearchedCep.current = '';
    }

    if (newDigits.length < 8) {
      setCepStatus('idle');
      setCepMessage('');
    }
  }

  function handlePhoneChange(event) {
    setPhoneNumber(
      formatPhoneDisplay(event.target.value),
    );
  }

  return (
    <Form
      method="post"
      id={`address-form-${fieldSuffix}`}
      className="!m-0 !block !w-full !max-w-none"
    >
      <fieldset className="!m-0 !w-full border-0 !p-0">
        <input
          type="hidden"
          name="addressId"
          value={addressId}
        />

        <input
          type="hidden"
          name="firstName"
          value={address?.firstName || ''}
        />

        <input
          type="hidden"
          name="lastName"
          value={address?.lastName || ''}
        />

        <input
          type="hidden"
          name="company"
          value={address?.company || ''}
        />

        <input
          type="hidden"
          name="territoryCode"
          value="BR"
        />

        <div className="space-y-7">
          <section>
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Localização
            </p>

            <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.45fr)_minmax(0,1fr)]">
              <AddressField
                id={`zip-${fieldSuffix}`}
                name="zip"
                label="CEP"
                placeholder="00000-000"
                value={zip}
                onChange={handleZipChange}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={9}
                required
              />

              <CepStatusMessage
                status={cepStatus}
                message={cepMessage}
              />
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-7">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Endereço
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
              <div className="sm:col-span-2 lg:col-span-9">
                <AddressField
                  id={`street-${fieldSuffix}`}
                  name="street"
                  label="Rua"
                  placeholder="Nome da rua ou avenida"
                  value={street}
                  onChange={(event) => {
                    setStreet(event.target.value);
                    clearCepError();
                  }}
                  autoComplete="address-line1"
                  required
                />
              </div>

              <div className="lg:col-span-3">
                <AddressField
                  id={`number-${fieldSuffix}`}
                  name="number"
                  label="Número"
                  placeholder="Ex.: 1000"
                  value={number}
                  onChange={(event) =>
                    setNumber(event.target.value)
                  }
                  required
                />
              </div>

              <div className="lg:col-span-6">
                <AddressField
                  id={`complement-${fieldSuffix}`}
                  name="complement"
                  label="Complemento"
                  optional
                  placeholder="Apartamento, bloco ou referência"
                  value={complement}
                  onChange={(event) =>
                    setComplement(event.target.value)
                  }
                  autoComplete="address-line2"
                />
              </div>

              <div className="lg:col-span-6">
                <AddressField
                  id={`neighborhood-${fieldSuffix}`}
                  name="neighborhood"
                  label="Bairro"
                  placeholder="Nome do bairro"
                  value={neighborhood}
                  onChange={(event) => {
                    setNeighborhood(event.target.value);
                    clearCepError();
                  }}
                  required
                />
              </div>

              <div className="lg:col-span-8">
                <AddressField
                  id={`city-${fieldSuffix}`}
                  name="city"
                  label="Cidade"
                  placeholder="Digite a cidade"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    clearCepError();
                  }}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="lg:col-span-4">
                <StateSelect
                  id={`zoneCode-${fieldSuffix}`}
                  value={zoneCode}
                  onChange={(event) => {
                    setZoneCode(event.target.value);
                    clearCepError();
                  }}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-7">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Contato para entrega
            </p>

            <div className="max-w-xl">
              <AddressField
                id={`phoneNumber-${fieldSuffix}`}
                name="phoneNumber"
                label="Telefone"
                optional
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneChange}
                autoComplete="tel"
                inputMode="tel"
                maxLength={15}
              />
            </div>
          </section>
        </div>

        <div className="mt-7 flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-4">
          <input
            defaultChecked={isDefaultAddress}
            id={`defaultAddress-${fieldSuffix}`}
            name="defaultAddress"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
          />

          <label
            htmlFor={`defaultAddress-${fieldSuffix}`}
            className="cursor-pointer"
          >
            <span className="block text-sm font-medium text-neutral-950">
              Tornar este meu endereço principal
            </span>

            <span className="mt-1 block text-xs leading-5 text-neutral-500">
              Este endereço será selecionado automaticamente nas
              próximas compras.
            </span>
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {translateAddressError(error)}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {mode === 'create' && (
          <p className="mt-5 text-xs text-neutral-500">
            Os campos indicados com * são obrigatórios.
          </p>
        )}

        {children({stateForIntent})}
      </fieldset>
    </Form>
  );
}

function CepStatusMessage({status, message}) {
  const visibleMessage =
    message ||
    'Digite um CEP válido para preencher o endereço automaticamente.';

  return (
    <div
      className={`flex min-h-12 items-center border px-4 ${
        status === 'error'
          ? 'border-red-200 bg-red-50'
          : status === 'success'
            ? 'border-green-200 bg-green-50'
            : 'border-neutral-200 bg-neutral-50'
      }`}
    >
      {status === 'loading' && <LoadingIcon />}
      {status === 'success' && <CheckIcon />}
      {status === 'error' && <AlertIcon />}

      <p
        className={`text-xs leading-5 ${
          status === 'error'
            ? 'text-red-700'
            : status === 'success'
              ? 'text-green-800'
              : 'text-neutral-500'
        }`}
      >
        {visibleMessage}
      </p>
    </div>
  );
}

function AddressField({
  id,
  name,
  label,
  optional = false,
  placeholder,
  value,
  onChange,
  autoComplete,
  inputMode,
  maxLength,
  required = false,
}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-2.5 flex items-center justify-between gap-3 text-xs text-neutral-700"
      >
        <span>
          {label}
          {required ? ' *' : ''}
        </span>

        {optional && (
          <span className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            Opcional
          </span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        className="!m-0 h-12 !w-full !min-w-0 !max-w-none rounded-none border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-0"
      />
    </div>
  );
}

function StateSelect({id, value, onChange}) {
  return (
    <div className="w-full min-w-0">
      <label
        htmlFor={id}
        className="mb-2.5 block text-xs text-neutral-700"
      >
        Estado *
      </label>

      <select
        id={id}
        name="zoneCode"
        value={value}
        onChange={onChange}
        autoComplete="address-level1"
        required
        className="!m-0 h-12 !w-full !min-w-0 !max-w-none rounded-none border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-0"
      >
        <option value="" disabled>
          Selecione
        </option>

        {BRAZILIAN_STATES.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildAddressLine1(street, number) {
  return [street, number].filter(Boolean).join(', ');
}

function buildAddressLine2(complement, neighborhood) {
  if (complement && neighborhood) {
    return `${complement} — ${neighborhood}`;
  }

  return complement || neighborhood || '';
}

function parseShopifyAddress(address) {
  const address1 = String(address?.address1 || '').trim();
  const address2 = String(address?.address2 || '').trim();

  let street = address1;
  let number = '';

  const lastCommaIndex = address1.lastIndexOf(',');

  if (lastCommaIndex >= 0) {
    const possibleStreet = address1
      .slice(0, lastCommaIndex)
      .trim();

    const possibleNumber = address1
      .slice(lastCommaIndex + 1)
      .trim();

    if (possibleNumber) {
      street = possibleStreet;
      number = possibleNumber;
    }
  }

  let complement = '';
  let neighborhood = '';

  if (address2.includes(' — ')) {
    const separatorIndex = address2.lastIndexOf(' — ');

    complement = address2
      .slice(0, separatorIndex)
      .trim();

    neighborhood = address2
      .slice(separatorIndex + 3)
      .trim();
  } else if (address2) {
    neighborhood = address2;
  }

  return {
    street,
    number,
    complement,
    neighborhood,
  };
}

function getAddressDisplayLines(address) {
  const parsed = parseShopifyAddress(address);

  const streetAndNumber = [
    parsed.street,
    parsed.number,
  ]
    .filter(Boolean)
    .join(', ');

  const complementAndNeighborhood = [
    parsed.complement,
    parsed.neighborhood,
  ]
    .filter(Boolean)
    .join(' — ');

  const cityAndState = [
    address?.city,
    address?.zoneCode,
  ]
    .filter(Boolean)
    .join(' - ');

  return [
    streetAndNumber,
    complementAndNeighborhood,
    cityAndState,
    address?.zip
      ? `CEP ${formatZipDisplay(address.zip)}`
      : '',
    'Brasil',
  ].filter(Boolean);
}

function getAddressCardTitle(address) {
  return address?.city || 'Endereço de entrega';
}

function getFormValue(form, key) {
  const value = form.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

function addressActionError(addressId, error) {
  const message =
    error instanceof Error
      ? error.message
      : String(error || '');

  return data(
    {
      error: {
        [addressId]: translateAddressError(message),
      },
    },
    {status: 400},
  );
}

function translateAddressError(message) {
  const normalized = String(message || '').toLowerCase();

  if (
    normalized.includes('phone') ||
    normalized.includes('telefone')
  ) {
    return 'Informe um telefone válido com DDD.';
  }

  if (
    normalized.includes('zip') ||
    normalized.includes('postal') ||
    normalized.includes('cep')
  ) {
    return 'Informe um CEP válido.';
  }

  if (
    normalized.includes('zone') ||
    normalized.includes('province') ||
    normalized.includes('estado')
  ) {
    return 'Selecione um estado válido.';
  }

  if (
    normalized.includes('unauthorized') ||
    normalized.includes('sessão')
  ) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }

  if (normalized.includes('delete')) {
    return 'Não foi possível excluir o endereço.';
  }

  return message || 'Não foi possível processar o endereço.';
}

function normalizePhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const brazilianNumber =
    digits.startsWith('55') && digits.length > 11
      ? digits.slice(2)
      : digits;

  return `+55${brazilianNumber}`;
}

function formatPhoneDisplay(phoneNumber) {
  let digits = String(phoneNumber || '').replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      6,
    )}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(
    2,
    7,
  )}-${digits.slice(7)}`;
}

function formatZipDisplay(zip) {
  const digits = String(zip || '')
    .replace(/\D/g, '')
    .slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatZipForSubmission(zip) {
  return formatZipDisplay(zip);
}

function sanitizeFieldId(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(-60);
}

const BRAZILIAN_STATES = [
  {code: 'AC', name: 'Acre'},
  {code: 'AL', name: 'Alagoas'},
  {code: 'AP', name: 'Amapá'},
  {code: 'AM', name: 'Amazonas'},
  {code: 'BA', name: 'Bahia'},
  {code: 'CE', name: 'Ceará'},
  {code: 'DF', name: 'Distrito Federal'},
  {code: 'ES', name: 'Espírito Santo'},
  {code: 'GO', name: 'Goiás'},
  {code: 'MA', name: 'Maranhão'},
  {code: 'MT', name: 'Mato Grosso'},
  {code: 'MS', name: 'Mato Grosso do Sul'},
  {code: 'MG', name: 'Minas Gerais'},
  {code: 'PA', name: 'Pará'},
  {code: 'PB', name: 'Paraíba'},
  {code: 'PR', name: 'Paraná'},
  {code: 'PE', name: 'Pernambuco'},
  {code: 'PI', name: 'Piauí'},
  {code: 'RJ', name: 'Rio de Janeiro'},
  {code: 'RN', name: 'Rio Grande do Norte'},
  {code: 'RS', name: 'Rio Grande do Sul'},
  {code: 'RO', name: 'Rondônia'},
  {code: 'RR', name: 'Roraima'},
  {code: 'SC', name: 'Santa Catarina'},
  {code: 'SP', name: 'São Paulo'},
  {code: 'SE', name: 'Sergipe'},
  {code: 'TO', name: 'Tocantins'},
];

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mr-3 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
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
      className="mr-3 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mr-3 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M13.5 6.5 17.5 10.5" />
      <path d="m4 20 3.8-.8L19 8a2.1 2.1 0 0 0-3-3L4.8 16.2 4 20Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mr-3 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="h-6 w-6 text-neutral-700"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
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

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="mr-3 h-4 w-4 shrink-0 animate-spin text-neutral-500"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mr-3 h-4 w-4 shrink-0 text-green-700"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mr-3 h-4 w-4 shrink-0 text-red-700"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('./+types/account.addresses').Route} Route */