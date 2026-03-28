import { useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { z, type ZodTypeAny } from 'zod';

export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: UseFormProps<z.infer<TSchema>>,
): UseFormReturn<z.infer<TSchema>> {
  // Currently we only use Zod for typing/validation helpers and call safeParse manually
  // where needed. If you want, this helper can be extended later to plug in
  // zodResolver from @hookform/resolvers.
  return useForm<z.infer<TSchema>>(options);
}

