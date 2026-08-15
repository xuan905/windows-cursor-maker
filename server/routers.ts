import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  cursor: router({
    generateSheet: publicProcedure
      .input(z.object({ theme: z.string().min(1).max(80), character: z.string().min(1).max(120), prompt: z.string().min(40).max(12000) }))
      .mutation(async ({ input }) => {
        const result = await generateImage({ prompt: input.prompt, model: "MODEL_GPT_IMAGE_2", quality: "medium" });
        if (!result.url) throw new Error("圖片生成服務沒有回傳圖片網址");
        return { ...result, theme: input.theme, character: input.character };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
