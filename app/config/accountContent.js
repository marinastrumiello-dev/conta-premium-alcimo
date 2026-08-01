/**
 * ============================================================
 * CONTEÚDO CENTRAL — ÁREA DO CLIENTE ALCIMO & CO.
 * ============================================================
 *
 * Este arquivo centraliza:
 *
 * - URLs da loja;
 * - rotas da Área do Cliente;
 * - textos;
 * - botões;
 * - imagens;
 * - menu do cabeçalho;
 * - menu lateral;
 * - banner da coleção;
 * - Programa ALCIMO;
 * - benefícios;
 * - atendimento;
 * - mensagens para estados vazios.
 *
 * Posteriormente, este conteúdo poderá ser substituído pelos
 * Metaobjects da Shopify sem precisar reconstruir o layout.
 */

const STORE_URL = 'https://alcimo.com';

/**
 * Monta uma URL completa da loja.
 *
 * Exemplo:
 * buildStoreUrl('/collections/all')
 * Resultado:
 * https://alcimo.com/collections/all
 */
export function buildStoreUrl(path = '') {
  if (!path) return STORE_URL;

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:')
  ) {
    return path;
  }

  return `${STORE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Monta a URL da pesquisa da Shopify.
 *
 * Exemplo:
 * buildSearchUrl('polo')
 * Resultado:
 * https://alcimo.com/search?q=polo
 */
export function buildSearchUrl(searchTerm = '') {
  const term = String(searchTerm).trim();

  if (!term) {
    return buildStoreUrl('/search');
  }

  return `${buildStoreUrl('/search')}?q=${encodeURIComponent(term)}`;
}

export const accountContent = {
  /**
   * ----------------------------------------------------------
   * MARCA
   * ----------------------------------------------------------
   */

  brand: {
    name: 'ALCIMO & CO.',
    shortName: 'ALCIMO',
    storeUrl: STORE_URL,
    accountUrl: 'https://conta.alcimo.com',
    slogan: 'Elevados por Deus',
  },

  /**
   * ----------------------------------------------------------
   * LINKS OFICIAIS DA LOJA
   * ----------------------------------------------------------
   */

  storeLinks: {
    home: buildStoreUrl('/'),
    collection: buildStoreUrl('/collections/all'),
    history: buildStoreUrl('/pages/nossa-historia'),
    manifesto: buildStoreUrl('/pages/manifesto'),
    contact: buildStoreUrl('/pages/contato'),
    search: buildStoreUrl('/search'),
    cart: buildStoreUrl('/cart'),
  },

  /**
   * ----------------------------------------------------------
   * ROTAS INTERNAS DA ÁREA DO CLIENTE
   * ----------------------------------------------------------
   *
   * Estas rotas permanecem dentro de conta.alcimo.com.
   */

  accountRoutes: {
    dashboard: '/account',
    orders: '/account/orders',
    favorites: '/account/favorites',
    addresses: '/account/addresses',
    profile: '/account/profile',
    program: '/account/ambassador',
    benefits: '/account#beneficios',
    logout: '/account/logout',
  },

  /**
   * ----------------------------------------------------------
   * CABEÇALHO
   * ----------------------------------------------------------
   */

  header: {
    logoAlt: 'ALCIMO & CO.',

    navigation: [
      {
        id: 'store',
        label: 'Loja',
        href: buildStoreUrl('/collections/all'),
        external: true,
      },
      {
        id: 'history',
        label: 'Nossa História',
        href: buildStoreUrl('/pages/nossa-historia'),
        external: true,
      },
      {
        id: 'manifesto',
        label: 'Manifesto',
        href: buildStoreUrl('/pages/manifesto'),
        external: true,
      },
      {
        id: 'contact',
        label: 'Contato',
        href: buildStoreUrl('/pages/contato'),
        external: true,
      },
    ],

    icons: {
      search: {
        label: 'Pesquisar',
        href: buildStoreUrl('/search'),
        ariaLabel: 'Abrir pesquisa',
      },

      account: {
        label: 'Minha conta',
        href: '/account',
        ariaLabel: 'Acessar minha conta',
      },

      cart: {
        label: 'Carrinho',
        href: buildStoreUrl('/cart'),
        ariaLabel: 'Abrir carrinho',
      },
    },

    search: {
      placeholder: 'O que você está procurando?',
      buttonLabel: 'Pesquisar',
      closeLabel: 'Fechar pesquisa',
      emptyMessage: 'Digite o nome de um produto.',
    },
  },

  /**
   * ----------------------------------------------------------
   * MENU LATERAL
   * ----------------------------------------------------------
   */

  sidebar: {
    customerFallbackName: 'Cliente ALCIMO',
    customerFallbackEmail: 'Sua conta ALCIMO',

    sections: [
      {
        id: 'account',
        label: 'Minha conta',
        items: [
          {
            id: 'dashboard',
            label: 'Visão geral',
            href: '/account',
            icon: 'home',
          },
          {
            id: 'orders',
            label: 'Meus pedidos',
            href: '/account/orders',
            icon: 'package',
          },
          {
            id: 'favorites',
            label: 'Favoritos',
            href: '/account/favorites',
            icon: 'heart',
          },
          {
            id: 'addresses',
            label: 'Endereços',
            href: '/account/addresses',
            icon: 'mapPin',
          },
          {
            id: 'profile',
            label: 'Perfil',
            href: '/account/profile',
            icon: 'user',
          },
        ],
      },

      {
        id: 'alcimo',
        label: 'Universo ALCIMO',
        items: [
          {
            id: 'program',
            label: 'Programa ALCIMO',
            href: '/account/ambassador',
            icon: 'crown',
          },
          {
            id: 'benefits',
            label: 'Benefícios',
            href: '/account#beneficios',
            icon: 'gift',
          },
          {
            id: 'contact',
            label: 'Contato',
            href: buildStoreUrl('/pages/contato'),
            external: true,
            icon: 'messageCircle',
          },
        ],
      },
    ],

    footerItems: [
      {
        id: 'store',
        label: 'Voltar à loja',
        href: buildStoreUrl('/'),
        external: true,
        icon: 'arrowLeft',
      },
      {
        id: 'logout',
        label: 'Sair da conta',
        href: '/account/logout',
        icon: 'logOut',
      },
    ],
  },

  /**
   * ----------------------------------------------------------
   * TOPO DO DASHBOARD
   * ----------------------------------------------------------
   */

  dashboard: {
    greeting: {
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa noite',
    },

    titleFallback: 'Bem-vindo à sua conta',

    welcomeText:
      'Acompanhe seus pedidos, atualize seus dados e descubra tudo o que preparamos para você.',

    eyebrow: 'Sua conta ALCIMO',
  },

  /**
   * ----------------------------------------------------------
   * ÚLTIMO PEDIDO
   * ----------------------------------------------------------
   */

  lastOrder: {
    eyebrow: 'Sua última compra',
    title: 'Último pedido',

    labels: {
      order: 'Pedido',
      date: 'Realizado em',
      total: 'Total',
      status: 'Status',
    },

    buttons: {
      viewOrder: 'Ver detalhes do pedido',
      viewAllOrders: 'Ver todos os pedidos',
      startShopping: 'Conhecer a coleção',
    },

    links: {
      allOrders: '/account/orders',
      collection: buildStoreUrl('/collections/all'),
    },

    emptyState: {
      title: 'Você ainda não fez seu primeiro pedido.',
      description:
        'Descubra peças criadas para homens que carregam propósito em cada detalhe.',
      buttonLabel: 'Conhecer a coleção',
      buttonHref: buildStoreUrl('/collections/all'),

      /**
       * A imagem deverá ficar dentro da pasta:
       *
       * public/images/account/
       *
       * Nome sugerido:
       * empty-order.jpg
       */
      image: '/images/account/empty-order.jpg',
      imageAlt: 'Coleção masculina premium ALCIMO & CO.',
    },
  },

  /**
   * ----------------------------------------------------------
   * ACESSO RÁPIDO
   * ----------------------------------------------------------
   */

  quickAccess: {
    eyebrow: 'Sua conta',
    title: 'Acesso rápido',

    items: [
      {
        id: 'orders',
        title: 'Meus pedidos',
        description: 'Acompanhe suas compras e consulte todos os detalhes.',
        buttonLabel: 'Ver pedidos',
        href: '/account/orders',
        icon: 'package',
      },
      {
        id: 'favorites',
        title: 'Favoritos',
        description: 'Encontre novamente as peças que chamaram sua atenção.',
        buttonLabel: 'Ver favoritos',
        href: '/account/favorites',
        icon: 'heart',
      },
      {
        id: 'addresses',
        title: 'Endereços',
        description: 'Cadastre e gerencie seus endereços de entrega.',
        buttonLabel: 'Gerenciar endereços',
        href: '/account/addresses',
        icon: 'mapPin',
      },
      {
        id: 'profile',
        title: 'Perfil',
        description: 'Mantenha seus dados pessoais sempre atualizados.',
        buttonLabel: 'Editar perfil',
        href: '/account/profile',
        icon: 'user',
      },
    ],
  },

  /**
   * ----------------------------------------------------------
   * PROGRAMA ALCIMO
   * ----------------------------------------------------------
   */

  loyaltyProgram: {
    eyebrow: 'Exclusividade',
    title: 'Programa ALCIMO',

    statusLabel: 'Em preparação',

    description:
      'Uma experiência criada para reconhecer clientes que caminham com a ALCIMO & CO.',

    secondaryText:
      'Benefícios especiais, experiências exclusivas e novidades reservadas aos membros.',

    buttonLabel: 'Conhecer o programa',
    buttonHref: '/account/ambassador',

    progress: {
      enabled: false,
      currentValue: 0,
      maximumValue: 100,
      currentLabel: '0 pontos',
      nextLevelLabel: 'Próximo nível',
    },
  },

  /**
   * ----------------------------------------------------------
   * BANNER DA COLEÇÃO
   * ----------------------------------------------------------
   */

  collectionBanner: {
    eyebrow: 'ALCIMO & CO.',
    title: 'Conheça a coleção',

    description:
      'Peças desenvolvidas para homens que carregam propósito, presença e identidade.',

    buttonLabel: 'Explorar a coleção',
    buttonHref: buildStoreUrl('/collections/all'),

    /**
     * Coloque a imagem dentro de:
     *
     * public/images/account/
     *
     * Nome sugerido:
     * collection-banner.jpg
     */
    image: '/images/account/collection-banner.jpg',
    imageAlt: 'Homem vestindo polo premium ALCIMO & CO.',

    overlay: true,
  },

  /**
   * ----------------------------------------------------------
   * BENEFÍCIOS
   * ----------------------------------------------------------
   */

  benefits: {
    eyebrow: 'Feito para você',
    title: 'Benefícios ALCIMO',

    items: [
      {
        id: 'exclusive-access',
        icon: 'lock',
        title: 'Acesso exclusivo',
        description:
          'Tenha acesso antecipado a lançamentos, novidades e seleções especiais.',
      },
      {
        id: 'personal-service',
        icon: 'messageCircle',
        title: 'Atendimento próximo',
        description:
          'Conte com um atendimento cuidadoso em todas as etapas da sua experiência.',
      },
      {
        id: 'premium-experience',
        icon: 'sparkles',
        title: 'Experiência premium',
        description:
          'Do produto à entrega, cada detalhe é pensado para representar a excelência ALCIMO.',
      },
    ],

    buttonLabel: 'Ver todos os benefícios',
    buttonHref: '/account#beneficios',
  },

  /**
   * ----------------------------------------------------------
   * ATENDIMENTO
   * ----------------------------------------------------------
   */

  support: {
    eyebrow: 'Atendimento ALCIMO',
    title: 'Precisa de ajuda?',

    description:
      'Nossa equipe está à disposição para ajudar com pedidos, produtos, entregas ou qualquer dúvida.',

    buttonLabel: 'Entrar em contato',
    buttonHref: buildStoreUrl('/pages/contato'),

    secondaryButtonLabel: 'Ver meus pedidos',
    secondaryButtonHref: '/account/orders',
  },

  /**
   * ----------------------------------------------------------
   * FAVORITOS
   * ----------------------------------------------------------
   */

  favorites: {
    eyebrow: 'Sua seleção',
    title: 'Favoritos',

    emptyState: {
      title: 'Sua lista de favoritos está vazia.',
      description:
        'Salve suas peças preferidas para encontrá-las facilmente quando desejar.',
      buttonLabel: 'Explorar a coleção',
      buttonHref: buildStoreUrl('/collections/all'),
    },
  },

  /**
   * ----------------------------------------------------------
   * PEDIDOS
   * ----------------------------------------------------------
   */

  orders: {
    eyebrow: 'Histórico',
    title: 'Meus pedidos',

    emptyState: {
      title: 'Você ainda não possui pedidos.',
      description:
        'Quando você realizar uma compra, todos os detalhes aparecerão aqui.',
      buttonLabel: 'Conhecer a coleção',
      buttonHref: buildStoreUrl('/collections/all'),
    },
  },

  /**
   * ----------------------------------------------------------
   * ENDEREÇOS
   * ----------------------------------------------------------
   */

  addresses: {
    eyebrow: 'Entregas',
    title: 'Meus endereços',

    emptyState: {
      title: 'Nenhum endereço cadastrado.',
      description:
        'Adicione um endereço para tornar suas próximas compras mais rápidas.',
      buttonLabel: 'Adicionar endereço',
    },

    buttons: {
      add: 'Adicionar endereço',
      edit: 'Editar',
      remove: 'Excluir',
      save: 'Salvar endereço',
      cancel: 'Cancelar',
    },
  },

  /**
   * ----------------------------------------------------------
   * PERFIL
   * ----------------------------------------------------------
   */

  profile: {
    eyebrow: 'Dados pessoais',
    title: 'Meu perfil',

    description:
      'Mantenha seus dados atualizados para uma experiência mais segura e personalizada.',

    buttons: {
      edit: 'Editar dados',
      save: 'Salvar alterações',
      cancel: 'Cancelar',
    },
  },

  /**
   * ----------------------------------------------------------
   * RODAPÉ
   * ----------------------------------------------------------
   */

  footer: {
    brandName: 'ALCIMO & CO.',

    description:
      'Moda masculina premium criada para homens que vivem com propósito.',

    copyright: `© ${new Date().getFullYear()} ALCIMO & CO. Todos os direitos reservados.`,

    navigation: [
      {
        id: 'store',
        label: 'Loja',
        href: buildStoreUrl('/collections/all'),
      },
      {
        id: 'history',
        label: 'Nossa História',
        href: buildStoreUrl('/pages/nossa-historia'),
      },
      {
        id: 'manifesto',
        label: 'Manifesto',
        href: buildStoreUrl('/pages/manifesto'),
      },
      {
        id: 'contact',
        label: 'Contato',
        href: buildStoreUrl('/pages/contato'),
      },
    ],
  },
};

export default accountContent;