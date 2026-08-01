const ALCIMO_COLLECTION_URL = 'https://alcimo.com/collections/all';

/*
 * Quando tivermos a imagem definitiva da campanha,
 * substituiremos a string vazia pelo endereço da imagem.
 */
const COLLECTION_IMAGE_URL = '';

export function CollectionBanner() {
  const backgroundStyle = COLLECTION_IMAGE_URL
    ? {
        backgroundImage: `linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.92) 0%,
          rgba(0, 0, 0, 0.72) 48%,
          rgba(0, 0, 0, 0.18) 100%
        ), url("${COLLECTION_IMAGE_URL}")`,
      }
    : {
        backgroundImage:
          'radial-gradient(circle at 80% 30%, rgba(117,85,55,.55), transparent 30%), linear-gradient(130deg, #050505 0%, #17130f 58%, #392b20 100%)',
      };

  return (
    <section
      className="relative min-h-[330px] overflow-hidden rounded-[12px] bg-black bg-cover bg-center text-white"
      style={backgroundStyle}
    >
      <div className="relative z-10 flex min-h-[330px] max-w-[390px] flex-col px-8 py-8 sm:px-10 sm:py-9">
        <p className="text-[9px] uppercase tracking-[0.28em] text-white/65">
          ALCIMO &amp; CO.
        </p>

        <h2 className="mt-5 font-serif text-[34px] font-normal leading-[1.08] text-white">
          Conheça a coleção
        </h2>

        <div className="mt-6 h-px w-12 bg-[#b99a74]" />

        <p className="mt-6 text-[13px] leading-6 text-white/80">
          Peças atemporais desenvolvidas para homens que carregam propósito,
          excelência e identidade.
        </p>

        <div className="mt-auto pt-8">
          <a
            href={ALCIMO_COLLECTION_URL}
            className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] !text-white no-underline transition hover:opacity-75"
          >
            Explorar agora
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>

      {!COLLECTION_IMAGE_URL ? (
        <>
          <div className="pointer-events-none absolute bottom-[-90px] right-[-25px] h-[320px] w-[230px] rotate-[12deg] rounded-t-[115px] border border-white/10 bg-gradient-to-b from-white/10 to-transparent opacity-60" />

          <div className="pointer-events-none absolute right-[55px] top-[55px] h-[170px] w-[170px] rounded-full bg-[#8a633d]/10 blur-3xl" />
        </>
      ) : null}
    </section>
  );
}