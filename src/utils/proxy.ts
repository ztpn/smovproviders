import { flags } from '@/entrypoint/utils/targets';
import { Stream } from '@/providers/streams';

export function requiresProxy(stream: Stream): boolean {
  if (!stream.flags.includes('cors-allowed') && !!(stream.headers && Object.keys(stream.headers).length > 0))
    return true;
  return false;
}

export function setupProxy(stream: Stream): Stream {
  const headers =
    stream.headers && Object.keys(stream.headers).length > 0
      ? encodeURIComponent(JSON.stringify(stream.headers))
      : null;

  if (stream.type === 'hls')
    stream.playlist = `https://proxy.nsbx.ru/hls/${encodeURIComponent(stream.playlist)}/${headers}`;

  if (stream.type === 'file')
    Object.entries(stream.qualities).forEach((entry) => {
      entry[1].url = `https://proxy.nsbx.ru/mp4/${encodeURIComponent(entry[1].url)}/${headers}`;
    });

  stream.headers = {};
  stream.flags = [flags.CORS_ALLOWED];
  return stream;
}
