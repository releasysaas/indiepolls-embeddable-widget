import { X } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { WidgetContext } from '../lib/context';
import { PollsApi } from '../lib/polls-api';
import PollRunner from './poll-runner';

export function Widget() {
  const { isOpen, setIsOpen, className, clientKey, poll, setPoll } = useContext(WidgetContext);
  const [pollTitle, setPollTitle] = useState<string>('');

  const api = useMemo(() => new PollsApi(), []);

  useEffect(() => {
    let cancelled = false;
    async function loadPoll() {
      if (poll) return;
      try {
        const p = await api.getPoll(clientKey);
        if (cancelled) return;
        const normalized = { ...p, questions: p.questions.slice().sort((a, b) => a.order - b.order) };
        setPoll(normalized);
        setPollTitle(normalized.title);
      } catch {
        // if loading the poll fails, leave poll as null; PollRunner will show its own error
      }
    }
    loadPoll();
    return () => {
      cancelled = true;
    };
  }, [api, clientKey, poll, setPoll]);

  const isAllowed = useMemo(() => {
    if (!poll) return false; // hide by default until we know the poll and its allowlist
    const domain = (poll.website_domain || '').trim();
    if (!domain) return true;

    const host = window.location.hostname;
    if (host !== domain) return false;

    const rawPaths: string[] | string | undefined = (poll as unknown as { widget_paths?: string[] | string }).widget_paths;
    const paths: string[] = Array.isArray(rawPaths)
      ? rawPaths
      : typeof rawPaths === 'string'
        ? rawPaths
          .split(/\r?\n/) // support one pattern per line
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
        : [];
    if (!paths.length) return true;

    const currentPath = window.location.pathname;
    const matches = paths.some((pattern) => {
      try {
        const re = new RegExp(pattern);
        return re.test(currentPath);
      } catch {
        return false;
      }
    });

    return matches;
  }, [poll]);

  if (!isAllowed) {
    return null;
  }

  return (
    <>
      <div className={className}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className='fixed bottom-0 right-0 flex items-center gap-2 m-6 px-1 py-1
                       bg-widget-bg-light hover:bg-widget-input-light dark:bg-widget-input-dark text-white rounded-full shadow-lg
                       transition-colors duration-200 z-50'
            aria-label='Open feature request form'
          >
            <img
              src='https://indiepolls.s3.us-east-1.amazonaws.com/public/logo_icon_light.svg'
              alt='Indie Polls'
              className='w-12 h-12'
            />
          </button>
        ) : (
          <div
            className='fixed inset-0 bg-widget-bg-light dark:bg-widget-bg-dark lg:right-0 lg:left-auto lg:w-[500px]
                        flex flex-col shadow-xl z-50 animate-in slide-in-from-right duration-200'
          >
            <div className='flex items-center justify-between p-4 border-b border-1 dark:border-gray-800'>
              <a href='https://indiepolls.io' target='_blank'>
                <img
                  src='https://indiepolls.s3.us-east-1.amazonaws.com/public/logo_icon.svg'
                  alt='Indie Polls'
                  className='h-9'
                />
              </a>
              <h3 className='text-md font-semibold text-slate-700 dark:text-white'>
                {pollTitle || poll?.title || 'Loading…'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className='p-2 text-slate-700 dark:text-white hover:bg-widget-input-light dark:bg-widget-input-dark rounded-full transition-colors'
                aria-label='Close feature request form'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto'>
              <PollRunner onPollTitle={setPollTitle} />
            </div>

            <div className='p-3 border-t border-1 dark:border-gray-800 flex items-center justify-center'>
              <a
                href='https://indiepolls.io'
                target='_blank'
                rel='noreferrer noopener'
                className='inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:underline'
              >
                <span>Powered by</span>
                <img
                  src='https://indiepolls.s3.us-east-1.amazonaws.com/public/logo_dark.svg'
                  alt='IndiePolls'
                  className='h-8 hidden dark:block'
                />
                <img
                  src='https://indiepolls.s3.us-east-1.amazonaws.com/public/logo_light.svg'
                  alt='IndiePolls'
                  className='h-8 dark:hidden'
                />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
