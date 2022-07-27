import { z } from 'zod';

export const mockSocialConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type MockSocialConfig = z.infer<typeof mockSocialConfigGuard>;

export const mockSocialDataGuard = z.object({
  sub: z.string(),
});
