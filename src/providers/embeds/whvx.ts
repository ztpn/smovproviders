import { EmbedOutput, makeEmbed } from '@/providers/base';
import { NotFoundError } from '@/utils/errors';

import { baseUrl } from '../sources/whvx';

const providers = [
  {
    id: 'nova',
    name: 'VidBinge Nova',
    rank: 700,
  },
  {
    id: 'astra',
    name: 'VidBinge Astra',
    rank: 701,
  },
];

function embed(provider: { id: string; name: string; rank: number }) {
  return makeEmbed({
    id: provider.id,
    name: provider.name,
    rank: provider.rank,
    disabled: false,
    async scrape(ctx) {
      const query = ctx.url;

      const search = await ctx.fetcher.full('/search', {
        query: {
          query,
          provider: provider.id,
        },
        baseUrl,
      });

      if (search.statusCode === 429) throw new Error('Rate limited');
      if (search.statusCode !== 200) throw new NotFoundError('Failed to search');

      ctx.progress(50);

      const result = await ctx.fetcher('/source', {
        query: {
          resourceId: search.body.url,
          provider: provider.id,
        },
        baseUrl,
      });

      ctx.progress(100);

      return result as EmbedOutput;
    },
  });
}

export const [novaScraper, astraScraper] = providers.map(embed);
