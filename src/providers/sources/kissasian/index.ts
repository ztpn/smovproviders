import { load } from 'cheerio';

import { flags } from '@/main/targets';
import { makeSourcerer } from '@/providers/base';
import { NotFoundError } from '@/utils/errors';

import { getEmbeds } from './getEmbeds';
import { getEpisodes } from './getEpisodes';
import { search } from './search';

export const kissAsianScraper = makeSourcerer({
  id: 'kissasian',
  name: 'KissAsian',
  rank: 130,
  flags: [flags.NO_CORS],

  async scrapeShow(ctx) {
    const seasonNumber = ctx.media.season.number;
    const episodeNumber = ctx.media.episode.number;

    const dramas = await search(ctx, ctx.media.title, seasonNumber);

    const targetDrama = dramas.find((d) => d.name?.toLowerCase() === ctx.media.title.toLowerCase()) ?? dramas[0];
    if (!targetDrama) throw new Error('Drama not found');

    ctx.progress(30);

    const drama = await ctx.fetcher<any>(targetDrama.url);

    const dramaPage = load(drama);

    const episodes = await getEpisodes(dramaPage);

    const targetEpisode = episodes.find((e) => e.number === `${episodeNumber}`);
    if (!targetEpisode?.url) throw new NotFoundError('Episode not found');

    ctx.progress(70);

    const embeds = await getEmbeds(ctx, targetEpisode);

    return {
      embeds,
    };
  },
  async scrapeMovie(ctx) {
    const dramas = await search(ctx, ctx.media.title, undefined);

    const targetDrama = dramas.find((d) => d.name?.toLowerCase() === ctx.media.title.toLowerCase()) ?? dramas[0];
    if (!targetDrama) throw new Error('Drama not found');

    ctx.progress(30);

    const drama = await ctx.fetcher<any>(targetDrama.url);

    const dramaPage = load(drama);

    const episodes = await getEpisodes(dramaPage);

    const targetEpisode = episodes[0];
    if (!targetEpisode?.url) throw new NotFoundError('Episode not found');

    ctx.progress(70);

    const embeds = await getEmbeds(ctx, targetEpisode);

    return {
      embeds,
    };
  },
});
