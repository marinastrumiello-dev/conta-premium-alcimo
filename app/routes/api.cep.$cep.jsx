import {data} from 'react-router';

/**
 * Consulta um CEP brasileiro pelo servidor do Hydrogen.
 *
 * Exemplo:
 * /api/cep/06414007
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const cep = String(params.cep || '').replace(/\D/g, '');

  if (cep.length !== 8) {
    return data(
      {
        success: false,
        error: 'Informe um CEP válido com oito números.',
      },
      {
        status: 400,
      },
    );
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      return data(
        {
          success: false,
          error: 'Não foi possível consultar o CEP.',
        },
        {
          status: 502,
        },
      );
    }

    const result = await response.json();

    if (result?.erro) {
      return data(
        {
          success: false,
          error: 'CEP não encontrado.',
        },
        {
          status: 404,
        },
      );
    }

    return data({
      success: true,
      address: {
        zip: result.cep || '',
        street: result.logradouro || '',
        complement: result.complemento || '',
        neighborhood: result.bairro || '',
        city: result.localidade || '',
        state: result.uf || '',
      },
    });
  } catch {
    return data(
      {
        success: false,
        error: 'O serviço de consulta de CEP está indisponível.',
      },
      {
        status: 503,
      },
    );
  }
}

/** @typedef {import('./+types/api.cep.$cep').Route} Route */