const ALCIMO_CONTACT_URL = 'https://alcimo.com/pages/contato';

export function AccountSupport() {
  return (
    <section className="w-full overflow-hidden rounded-[12px] border border-neutral-200 bg-white">
      <div className="grid min-h-[150px] grid-cols-1 items-center gap-8 px-8 py-8 sm:px-10 lg:grid-cols-[1fr_auto] lg:gap-12 lg:px-12">
        <div className="flex items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#8a633d]">
            <SupportIcon />
          </div>

          <div>
            <h2 className="m-0 font-serif text-[22px] font-normal leading-tight text-neutral-950">
              Precisa de ajuda?
            </h2>

            <p className="m-0 mt-3 max-w-[620px] text-[13px] leading-6 text-neutral-600">
              Nossa equipe está à disposição para acompanhar suas solicitações e
              oferecer o suporte necessário.
            </p>
          </div>
        </div>

        <div className="flex w-full justify-start lg:w-auto lg:justify-end">
          <a
            href={ALCIMO_CONTACT_URL}
            className="inline-flex h-[50px] min-w-[205px] items-center justify-center rounded-[5px] no-underline"
            style={{
              backgroundColor: '#0a0a0a',
              color: '#ffffff',
              border: '1px solid #0a0a0a',
              textDecoration: 'none',
              boxShadow: 'none',
              marginRight: '2px',
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.15em]"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                border: 'none',
                background: 'transparent',
              }}
            >
              Falar com a ALCIMO
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function SupportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className="h-11 w-11"
      aria-hidden="true"
    >
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13v4a2 2 0 0 0 2 2h2v-8H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z" />
      <path d="M16 19c0 1.1-.9 2-2 2h-2" />
    </svg>
  );
}