import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
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
    uploadReference: publicProcedure
      .input(z.object({ dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/).max(15_000_000), mimeType: z.string().regex(/^image\/(png|jpeg|webp)$/), fileName: z.string().min(1).max(180) }))
      .mutation(async ({ input, ctx }) => {
        const comma = input.dataUrl.indexOf(",");
        const bytes = Buffer.from(input.dataUrl.slice(comma + 1), "base64");
        const stored = await storagePut(`cursor-references/${input.fileName}`, bytes, input.mimeType);
        const forwardedProto = typeof ctx.req.headers?.["x-forwarded-proto"] === "string" ? ctx.req.headers["x-forwarded-proto"] : undefined;
        const protocol = forwardedProto || (ctx.req as any).protocol || "https";
        const host = ctx.req.headers?.host || "localhost";
        return { ...stored, url: `${protocol}://${host}${stored.url}`, mimeType: input.mimeType, fileName: input.fileName };
      }),
    generateSheet: publicProcedure
      .input(z.object({ theme: z.string().min(1).max(80), character: z.string().min(1).max(120), prompt: z.string().min(40).max(12000), referenceImage: z.object({ url: z.string().min(1).max(15_000_000), mimeType: z.string().regex(/^image\/(png|jpeg|webp)$/) }).optional() }))
      .mutation(async ({ input }) => {
        const result = await generateImage({ prompt: input.prompt, model: "MODEL_GPT_IMAGE_2", quality: "medium", originalImages: input.referenceImage ? [input.referenceImage] : undefined });
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
