import { useContext, useEffect, useMemo, useState } from 'react';
import { WidgetContext } from '../lib/context';
import { PollsApi, type Poll, type PollQuestion, type PollResults } from '../lib/polls-api';

type SelectionMap = Record<string, string[]>; // question_id -> selected option ids

function QuestionView({
  q,
  selected,
  freeText,
  onChange,
  onFreeTextChange,
}: {
  q: PollQuestion;
  selected: string[];
  freeText: Record<string, string>;
  onChange: (next: string[]) => void;
  onFreeTextChange: (optionId: string, value: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isSingle = q.type === 'single_choice' || q.type === 'ab_test';
  const max = q.type === 'multiple_choice' ? q.multiple_max_choices ?? Infinity : 1;

  function toggleOption(id: string) {
    if (isSingle) {
      onChange([id]);
    } else {
      const exists = selected.includes(id);
      let next = exists ? selected.filter((x) => x !== id) : [...selected, id];
      if (next.length > max) next = next.slice(0, max);
      onChange(next);
    }
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='space-y-2'>
        <div className='text-sm text-slate-500 dark:text-slate-300'>Question</div>
        <h4 className='text-base font-semibold text-slate-800 dark:text-white'>{q.prompt_text}</h4>
        {q.image ? (
          <div className='pt-1'>
            <img
              src={q.image}
              alt='Question image'
              onClick={(e) => {
                e.stopPropagation();
                setPreviewUrl(q.image!);
              }}
              className='w-full max-h-64 object-cover rounded border border-gray-200 dark:border-gray-800'
            />
          </div>
        ) : null}
      </div>
      <div className='space-y-2'>
        {q.options
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((opt) => {
            const checked = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type='button'
                onClick={() => toggleOption(opt.id)}
                className={`w-full text-left px-3 py-2 rounded border ${checked
                  ? 'border-primary-400 bg-primary-50/70 dark:bg-amber-400/10'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-widget-bg-dark'
                  }`}
              >
                <div className='flex items-center gap-3'>
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] border ${checked ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-400'
                      }`}
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <span className='text-sm text-slate-800 dark:text-white'>{opt.label_text}</span>
                  {opt.image ? (
                    <img
                      src={opt.image}
                      alt=''
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(opt.image!);
                      }}
                      className='ml-auto h-10 w-10 object-cover rounded border border-gray-200 dark:border-gray-800 cursor-zoom-in'
                    />
                  ) : null}
                </div>
                {opt.free_text && checked ? (
                  <div className='mt-2'>
                    <textarea
                      className='w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-widget-bg-dark text-sm text-slate-800 dark:text-white px-3 py-2'
                      rows={3}
                      placeholder='Type your answer here...'
                      value={freeText[opt.id] || ''}
                      onChange={(e) => onFreeTextChange(opt.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : null}
              </button>
            );
          })}
      </div>
      {previewUrl ? (
        <div
          className='fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4'
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt='Preview'
            className='max-w-[90vw] max-h-[85vh] object-contain rounded shadow-lg'
          />
        </div>
      ) : null}
      {q.type === 'multiple_choice' && q.multiple_max_choices ? (
        <div className='text-xs text-slate-500 dark:text-slate-300'>
          Select up to {q.multiple_max_choices}
        </div>
      ) : null}
    </div>
  );
}

function Intro({ poll, onStart }: { poll: Poll; onStart: () => void }) {
  return (
    <div className='p-4 space-y-4'>
      {poll.description ? (
        <p className='text-sm text-slate-700 dark:text-slate-200'>{poll.description}</p>
      ) : null}
      {poll.intro_heading ? (
        <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>{poll.intro_heading}</h3>
      ) : null}
      {poll.intro_text ? (
        <p className='text-sm text-slate-600 dark:text-slate-300'>{poll.intro_text}</p>
      ) : null}
      <button
        type='button'
        onClick={onStart}
        className='inline-flex items-center gap-1 px-3 py-2 text-sm rounded border border-primary-300 text-primary-700 hover:bg-primary-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10'
      >
        Start
      </button>
    </div>
  );
}

function ResultsView({
  results,
  myAnswers,
  myFreeText,
}: {
  results: PollResults;
  myAnswers?: SelectionMap;
  myFreeText?: Record<string, Record<string, string>>;
}) {
  return (
    <div className='p-4 space-y-4'>
      <div className='space-y-1'>
        <h4 className='text-base font-semibold text-slate-800 dark:text-white'>Results</h4>
        <div className='text-xs text-slate-500 dark:text-slate-300'>Total responses: {results.total_responses}</div>
      </div>
      <div className='space-y-4'>
        {results.questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q) => {
            const total = q.responses_count || 0;
            const mine = myAnswers?.[q.id] || [];
            const myTexts = myFreeText?.[q.id] || {};
            return (
              <div key={q.id} className='space-y-2'>
                <div className='text-sm font-medium text-slate-800 dark:text-white'>{q.prompt_text}</div>
                <div className='space-y-2'>
                  {q.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((o) => {
                      const pct = total > 0 ? Math.round((o.votes_count / total) * 100) : 0;
                      const isMine = mine.includes(o.id);
                      const myTextRaw = myTexts[o.id];
                      const myText = typeof myTextRaw === 'string' ? myTextRaw.trim() : '';
                      return (
                        <div
                          key={o.id}
                          className={`space-y-1 rounded ${isMine
                            ? 'border border-primary-400 dark:border-amber-400/60 bg-primary-50/30 dark:bg-amber-400/5 p-2'
                            : ''
                            }`}
                        >
                          <div className='flex items-center justify-between text-xs text-slate-600 dark:text-slate-300'>
                            <span className={`${isMine ? 'font-semibold text-primary-700 dark:text-amber-300' : ''}`}>{o.label_text}</span>
                            <span>
                              {o.votes_count} ({pct}%)
                            </span>
                          </div>
                          {isMine && o.free_text && myText ? (
                            <div className='mt-1 text-[11px] text-slate-600 dark:text-slate-300'>
                              <strong>Your answer:</strong> {myText}
                            </div>
                          ) : null}
                          <div className='w-full h-2 bg-gray-200 dark:bg-gray-800 rounded'>
                            <div
                              className={`h-2 rounded ${isMine ? 'bg-primary-500 dark:bg-amber-400' : 'bg-primary-400 dark:bg-amber-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function Outro({ poll }: { poll: Poll }) {
  return (
    <div className='p-4 space-y-3'>
      <h3 className='text-lg font-semibold text-slate-800 dark:text-white'>Thank you!</h3>
      {poll.outro_heading ? (
        <div className='text-base font-semibold text-slate-800 dark:text-white'>{poll.outro_heading}</div>
      ) : null}
      {poll.outro_text ? (
        <p className='text-sm text-slate-600 dark:text-slate-300'>{poll.outro_text}</p>
      ) : (
        <p className='text-sm text-slate-600 dark:text-slate-300'>Your responses have been submitted.</p>
      )}
    </div>
  );
}

function ContributorStep({
  email,
  name,
  setEmail,
  setName,
  onBack,
  onSkip,
  onSubmit,
  submitting,
  error,
}: {
  email: string;
  name: string;
  setEmail: (v: string) => void;
  setName: (v: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className='p-4 space-y-4'>
      <div className='space-y-1'>
        <div className='text-sm text-slate-600 dark:text-slate-300'>Optional</div>
        <h4 className='text-base font-semibold text-slate-800 dark:text-white'>Tell us about you</h4>
        <p className='text-xs text-slate-500 dark:text-slate-400'>You can leave these blank.</p>
      </div>
      <div className='space-y-3'>
        <div className='space-y-1'>
          <label className='text-xs text-slate-600 dark:text-slate-300'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-widget-bg-dark text-sm text-slate-800 dark:text-white'
            placeholder='you@example.com'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-slate-600 dark:text-slate-300'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-widget-bg-dark text-sm text-slate-800 dark:text-white'
            placeholder='Your name'
          />
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={onBack}
            className='inline-flex items-center gap-1 px-3 py-2 text-sm rounded border border-gray-200 text-slate-700 hover:bg-gray-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-widget-input-dark'
            disabled={submitting}
          >
            Back
          </button>
          <button
            type='button'
            onClick={onSkip}
            className='text-xs text-slate-600 dark:text-slate-300 hover:underline'
            disabled={submitting}
          >
            Skip
          </button>
        </div>
        <button
          type='button'
          onClick={onSubmit}
          disabled={submitting}
          className='inline-flex items-center gap-1 px-3 py-2 text-sm rounded border border-primary-300 text-primary-700 hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10'
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
      {error ? (
        <div className='text-xs text-danger-600 dark:text-red-300'>{error}</div>
      ) : null}
    </div>
  );
}

export default function PollRunner({ onPollTitle }: { onPollTitle?: (title: string) => void } = {}) {
  const { clientKey: token, externalId, contributorEmail: initEmail, contributorName: initName, poll } = useContext(WidgetContext);
  const api = useMemo(() => new PollsApi(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<number>(-1); // -1 intro, 0..n-1 questions, n outro
  const [selected, setSelected] = useState<SelectionMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState<string>(initEmail || '');
  const [name, setName] = useState<string>(initName || '');
  const [results, setResults] = useState<PollResults | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [freeText, setFreeText] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!poll) return;
    let cancelled = false;
    async function checkAlreadySubmitted() {
      try {
        setLoading(true);
        await api.getPoll(token, externalId);
        if (cancelled) return;
        setIndex(-1);
        setError(null);
      } catch (e: unknown) {
        const err = e as { code?: number } | Error;
        if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 409) {
          setError('You have already submitted this poll.');
        } else {
          setError('Unable to load poll.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    checkAlreadySubmitted();
    return () => {
      cancelled = true;
    };
  }, [poll, token, externalId, api]);

  useEffect(() => {
    if (!poll || !onPollTitle) return;
    onPollTitle(poll.title);
  }, [poll, onPollTitle]);

  const questions = poll?.questions || [];
  const current = index >= 0 && index < questions.length ? questions[index] : null;
  const contributorStepIndex = questions.length; // after last question
  const outroIndex = questions.length + 1;
  const needContributorStep = !(initEmail || initName); // show if both missing from init

  function onStart() {
    setIndex(questions.length > 0 ? 0 : questions.length);
  }

  function onSelect(next: string[]) {
    if (!current) return;
    setSelected((prev) => ({ ...prev, [current.id]: next }));
  }

  function onFreeTextChange(optionId: string, value: string) {
    if (!current) return;
    setFreeText((prev) => {
      const perQ = prev[current.id] || {};
      return { ...prev, [current.id]: { ...perQ, [optionId]: value } };
    });
  }

  const canProceed = useMemo(() => {
    if (!current) return false;
    const sel = selected[current.id] || [];
    if (sel.length === 0) return false;

    const requiresText = (current.options || []).filter((o) => o.free_text);
    if (requiresText.length > 0) {
      const perQ = freeText[current.id] || {};
      const missing = requiresText.some((o) => {
        if (!sel.includes(o.id)) return false;
        const v = (perQ[o.id] || '').trim();
        return v === '';
      });
      if (missing) return false;
    }

    if (current.type === 'multiple_choice') {
      return sel.length > 0;
    }
    return sel.length === 1;
  }, [current, selected, freeText]);

  async function onNext() {
    if (!current) return;
    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      // After last question: either go to contributor collection or submit
      if (!externalId || externalId.trim() === '') {
        setError('Missing external id.');
        return;
      }
      if (needContributorStep) {
        setIndex(contributorStepIndex);
      } else {
        await doSubmit();
      }
    }
  }

  function onPrev() {
    // From contributor step back to last question
    if (index === contributorStepIndex && needContributorStep) {
      setIndex(questions.length - 1);
      return;
    }
    // From first question back to intro
    if (index === 0) {
      setIndex(-1);
      return;
    }
    // From questions back by one
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  async function doSubmit() {
    setSubmitting(true);
    try {
      const answers = questions.map((q) => {
        const option_ids = selected[q.id] || [];
        const perQ = freeText[q.id] || {};
        const response_texts: Record<string, string> = {};
        (q.options || [])
          .filter((o) => o.free_text && option_ids.includes(o.id))
          .forEach((o) => {
            const v = (perQ[o.id] || '').trim();
            if (v !== '') {
              response_texts[o.id] = v;
            }
          });
        return Object.keys(response_texts).length > 0
          ? { question_id: q.id, option_ids, response_texts }
          : { question_id: q.id, option_ids };
      });
      const contributor = (email || name) ? { email, name } : undefined;
      await api.submitPoll(token, externalId!, answers, contributor);
      setSubmitted(true);
      setIndex(outroIndex);
    } catch (e: unknown) {
      const err = e as { code?: number } | Error;
      if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 409) {
        setError('You have already submitted this poll.');
        setIndex(outroIndex);
      } else if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 422) {
        setError((err as Error).message || 'Validation failed.');
      } else {
        setError('Failed to submit.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!poll?.show_results_public) return;
      if (index < outroIndex) return;
      try {
        setResultsLoading(true);
        const r = await api.getResults(token);
        if (!cancelled) setResults(r);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [index, outroIndex, poll, api, token]);

  if (loading) {
    return <div className='p-4 text-sm text-slate-500 dark:text-slate-300'>Loading…</div>;
  }
  if (error && !poll) {
    return <div className='p-4 text-sm text-red-600'>{error}</div>;
  }
  if (!poll) return null;

  // Intro
  if (index < 0 && !submitted) {
    return <Intro poll={poll} onStart={onStart} />;
  }

  // Outro
  if (index >= outroIndex) {
    return (
      <div className='space-y-2'>
        <Outro poll={poll} />
        {poll.show_results_public ? (
          results ? (
            <ResultsView results={results} myAnswers={selected} myFreeText={freeText} />
          ) : (
            <div className='p-4 text-sm text-slate-500 dark:text-slate-300'>
              {resultsLoading ? 'Loading results…' : 'Results not available.'}
            </div>
          )
        ) : null}
      </div>
    );
  }

  if (index === contributorStepIndex && needContributorStep) {
    return (
      <ContributorStep
        email={email}
        name={name}
        setEmail={setEmail}
        setName={setName}
        onBack={onPrev}
        onSkip={doSubmit}
        onSubmit={doSubmit}
        submitting={submitting}
        error={error}
      />
    );
  }

  // Question view
  return (
    <div className='flex flex-col h-full'>
      <QuestionView
        q={current!}
        selected={selected[current!.id] || []}
        freeText={freeText[current!.id] || {}}
        onChange={onSelect}
        onFreeTextChange={onFreeTextChange}
      />
      <div className='flex items-center justify-between px-4 pb-4'>
        <div className='flex items-center gap-3'>
          {index >= 0 ? (
            <button
              type='button'
              onClick={onPrev}
              disabled={submitting}
              className='inline-flex items-center gap-1 px-3 py-2 text-sm rounded border border-gray-200 text-slate-700 hover:bg-gray-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-widget-input-dark'
            >
              Back
            </button>
          ) : null}
          <div className='text-xs text-danger-600 dark:text-red-300'>{error}</div>
        </div>
        <button
          type='button'
          onClick={onNext}
          disabled={!canProceed || submitting}
          className='inline-flex items-center gap-1 px-3 py-2 text-sm rounded border border-primary-300 text-primary-700 hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10'
        >
          {index + 1 < questions.length
            ? 'Next'
            : submitting
              ? 'Submitting…'
              : needContributorStep
                ? 'Next'
                : 'Submit'}
        </button>
      </div>
    </div>
  );
}
