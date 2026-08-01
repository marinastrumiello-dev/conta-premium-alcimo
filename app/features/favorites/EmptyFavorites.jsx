import {Link} from 'react-router';

export function EmptyFavorites() {
  return (
    <section className="mt-10 flex min-h-[420px] animate-[fadeIn_.45s_ease-out] flex-col items-center justify-center rounded-[12px] border border-neutral-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200">
        <HeartIcon />
      </div>

      <h2 className="mt-6 font-serif text-[24px] font-normal text-neutral-950">
        Nenhum produto favorito
      </h2>

      <p className="mt-3 max-w-md text-[13px] leading-6 text-neutral-600">
        Salve suas peças preferidas diretamente
        na loja para encontrá-las facilmente
        nesta página.
      </p>

      <a
        href="https://alcimo.com/collections/all"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[5px] bg-neutral-950 px-8 text-[10px] uppercase tracking-[0.15em] !text-white no-underline transition hover:bg-neutral-800"
      >
        Conhecer a coleção
      </a>

      <Link
        to="/account"
        className="mt-5 text-[10px] uppercase tracking-[0.14em] !text-neutral-700 underline underline-offset-4"
      >
        Voltar para a visão geral
      </Link>
    </section>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}