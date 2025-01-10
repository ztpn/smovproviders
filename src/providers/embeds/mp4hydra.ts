import { flags } from '@/entrypoint/utils/targets';
import { makeEmbed } from '@/providers/base';

const providers = [
  {
    id: 'mp4hydra-1',
    name: 'Server 1',
    rank: 36,
  },
  {
    id: 'mp4hydra-2',
    name: 'Server 2',
    rank: 35,
  },
];

function embed(provider: { id: string; name: string; rank: number; disabled?: boolean }) {
  return makeEmbed({
    id: provider.id,
    name: provider.name,
    disabled: provider.disabled,
    rank: provider.rank,
    async scrape(ctx) {
      return {
        stream: [
          {
            id: 'primary',
            type: 'file',
            qualities: {
              unknown: { url: ctx.url, type: 'mp4' },
            },
            flags: [flags.CORS_ALLOWED],
            captions: [],
          },
        ],
      };
    },
  });
}

export const [mp4hydraServer1Scraper, mp4hydraServer2Scraper] = providers.map(embed);
