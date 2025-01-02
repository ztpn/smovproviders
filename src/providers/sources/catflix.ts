import { load } from 'cheerio';

import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';

const baseUrl = 'https://catflix.su';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const movieId = ctx.media.tmdbId;
  const mediaTitle = ctx.media.title.replace(/ /g, '-').replace(/[():]/g, '').toLowerCase();
  let watchPageUrl: string | undefined;

  if (ctx.media.type === 'movie') {
    watchPageUrl = `${baseUrl}/movie/${mediaTitle}-${movieId}`;
  } else if (ctx.media.type === 'show') {
    const seasonNumber = ctx.media.season.number;
    const episodeNumber = ctx.media.episode.number;
    const episodeId = ctx.media.episode.tmdbId;

    if (!episodeId) {
      throw new Error('Missing episode ID for show');
    }

    watchPageUrl = `${baseUrl}/episode/${mediaTitle}-season-${seasonNumber}-episode-${episodeNumber}/eid-${episodeId}`;
  }
  if (!watchPageUrl) {
    throw new Error('Failed to generate watch page URL');
  }

  ctx.progress(60);

  const WatchPage = await ctx.proxiedFetcher(watchPageUrl);
  const $WatchPage = load(WatchPage);

  const scriptContent = $WatchPage('script')
    .toArray()
    .find((script) => {
      return (
        script.children[0] && script.children[0].type === 'text' && script.children[0].data.includes('main_origin =')
      );
    });

  if (!scriptContent) {
    throw new Error('Script containing main_origin not found');
  }

  const mainOriginScript = scriptContent.children[0].type === 'text' ? scriptContent.children[0].data : '';
  const mainOriginMatch = mainOriginScript.match(/main_origin = "(.*?)";/);

  if (!mainOriginMatch) {
    throw new Error('Unable to extract main_origin value');
  }

  const Catflix1 = mainOriginMatch[1];

  const decodedUrl = atob(Catflix1);

  ctx.progress(90);

  return {
    embeds: [
      {
        embedId: 'turbovid',
        url: decodedUrl,
      },
    ],
  };
}

export const catflixScraper = makeSourcerer({
  id: 'catflix',
  name: 'Catflix',
  rank: 170,
  flags: [],
  disabled: false,
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
