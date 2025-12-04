export type PollOption = {
  id: string;
  label_text: string;
  order: number;
  image?: string | null;
  free_text?: boolean;
};

export type PollQuestion = {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'ab_test';
  prompt_text: string;
  order: number;
  multiple_max_choices?: number | null;
  image?: string | null;
  options: PollOption[];
};

export type Poll = {
  title: string;
  description?: string | null;
  intro_heading?: string | null;
  intro_text?: string | null;
  outro_heading?: string | null;
  outro_text?: string | null;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  public_token: string;
  show_results_public?: boolean;
  website_domain?: string | null;
  widget_paths: string[];
  questions: PollQuestion[];
};

export type SubmitAnswer = {
  question_id: string;
  option_ids: string[];
  response_texts?: Record<string, string>;
};
export type Contributor = { email?: string | null; name?: string | null };

export type PollResults = {
  title: string;
  description?: string | null;
  public_token: string;
  total_responses: number;
  questions: PollResultQuestion[];
};

export type PollResultQuestion = {
  id: string;
  prompt_text: string;
  type: PollQuestion['type'];
  order: number;
  responses_count: number;
  options: PollResultOption[];
};

export type PollResultOption = {
  id: string;
  label_text: string;
  order: number;
  votes_count: number;
  free_text?: boolean;
};

export class PollsApi {
  private base: string;

  constructor(base?: string) {
    // Default to env WIDGET_API_BASE, fallback to provided base, else same-origin '/api'
    const envBase = (process.env.WIDGET_API_BASE as string | undefined)?.trim();
    this.base = envBase && envBase.length > 0 ? envBase : base || '/api';
  }

  async getPoll(token: string, externalId?: string | null): Promise<Poll> {
    const url = new URL(
      `${this.base}/polls/${encodeURIComponent(token)}`,
      window.location.origin,
    );
    if (externalId) {
      url.searchParams.set('external_user_id', externalId);
      url.searchParams.set('external_id', externalId);
    }
    const res = await fetch(url.toString(), { credentials: 'same-origin' });
    if (res.status === 409) {
      throw Object.assign(new Error('Already submitted'), {
        code: 409 as const,
      });
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Get poll failed: ${res.status} ${res.statusText} ${text}`,
      );
    }
    return (await res.json()) as Poll;
  }

  async getResults(token: string): Promise<PollResults> {
    const url = new URL(
      `${this.base}/polls/${encodeURIComponent(token)}/results`,
      window.location.origin,
    );
    const res = await fetch(url.toString(), { credentials: 'same-origin' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Get results failed: ${res.status} ${res.statusText} ${text}`,
      );
    }
    return (await res.json()) as PollResults;
  }

  async submitPoll(
    token: string,
    externalId: string,
    answers: SubmitAnswer[],
    contributor?: Contributor,
  ): Promise<{ ok: true }> {
    const url = `${this.base}/polls/${encodeURIComponent(token)}`;
    const payload: {
      external_user_id: string;
      external_id: string;
      answers: SubmitAnswer[];
      contributor?: Contributor;
    } = {
      external_user_id: externalId,
      external_id: externalId,
      answers,
    };
    if (contributor && (contributor.email || contributor.name)) {
      payload.contributor = contributor;
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    if (res.status === 409) {
      throw Object.assign(new Error('Already submitted'), {
        code: 409 as const,
      });
    }
    if (res.status === 422) {
      let validationMessage = 'Validation failed.';
      try {
        const data = (await res.json()) as unknown;
        const errors = (data as { errors?: Record<string, unknown> })?.errors;
        if (errors && typeof errors === 'object') {
          const parts: string[] = [];
          for (const [field, msgs] of Object.entries(errors)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              const first = String(msgs[0]).trim();
              if (first) {
                parts.push(`${field} ${first}`);
              }
            }
          }
          if (parts.length > 0) {
            validationMessage = parts.join('; ');
          }
        }
      } catch {
        // ignore parsing errors, keep default message
      }
      throw Object.assign(new Error(validationMessage), {
        code: 422 as const,
      });
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Submit failed: ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as { ok: true };
  }
}
