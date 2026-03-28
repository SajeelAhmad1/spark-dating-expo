import { useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { z, type ZodTypeAny } from 'zod';
import { zodResolver } from '@/utils/zodResolver';

export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: UseFormProps<z.infer<TSchema>>,
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    ...options,
    resolver: zodResolver(schema),
  });
}

