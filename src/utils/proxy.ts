import { flags } from '@/entrypoint/utils/targets';
import { Stream } from '@/providers/streams';

export function requiresProxy(stream: Stream): boolean {
  if (!stream.flags.includes(flags.CORS_ALLOWED) && !!(stream.headers && Object.keys(stream.headers).length > 0))
    return true;
  return false;
}

export function setupProxy(stream: Stream): Stream {
  const headers =
    stream.headers && Object.keys(stream.headers).length > 0 ? btoa(JSON.stringify(stream.headers)) : null;

  const options = btoa(
    JSON.stringify({
      ...(stream.type === 'hls' && { depth: stream.proxyDepth ?? 0 }),
    }),
  );

  if (stream.type === 'hls')
    stream.playlist = `https://proxy.nsbx.ru/hls/${btoa(stream.playlist)}/${headers}/${options}`;

  if (stream.type === 'file')
    Object.entries(stream.qualities).forEach((entry) => {
      entry[1].url = `https://proxy.nsbx.ru/mp4/${btoa(entry[1].url)}/${headers}/${options}`;
    });

  stream.headers = {};
  stream.flags = [flags.CORS_ALLOWED];
  return stream;
}
