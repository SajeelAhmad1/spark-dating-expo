import type { FieldError, FieldErrors, FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

function setIssueAtPath(errors: FieldErrors, path: (string | number)[], error: FieldError): void {
  let curr: Record<string, unknown> = errors as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const key = String(seg);
    if (!curr[key] || typeof curr[key] !== 'object') {
      curr[key] = typeof path[i + 1] === 'number' ? [] : {};
    }
    curr = curr[key] as Record<string, unknown>;
  }
  const last = String(path[path.length - 1]);
  (curr as Record<string, FieldError>)[last] = error;
}

/**
 * Maps Zod safeParse failures to react-hook-form field errors (no extra dependency).
 */
export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodTypeAny,
): (
  values: TFieldValues,
  _context: unknown | undefined,
  _options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as TFieldValues, errors: {} };
    }
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.filter((p): p is string | number => p !== undefined && p !== '');
      if (path.length === 0) continue;
      setIssueAtPath(errors, path, {
        type: issue.code,
        message: issue.message,
      });
    }
    return { values: {} as TFieldValues, errors };
  };
}
