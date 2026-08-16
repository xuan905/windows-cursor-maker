import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { z } from "zod";
import { lookup } from "node:dns/promises";
import net from "node:net";

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return true;
}

async function assertPublicImageUrl(imageUrl: string) {
  const parsed = new URL(imageUrl);
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "metadata.google.internal" || hostname.endsWith(".local") || hostname.endsWith(".internal") || isPrivateIp(hostname)) throw new Error("圖片網址主機不是公開網路位置");
  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error("圖片網址解析到非公開網路位置");
}

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
    uploadReferenceUrl: publicProcedure
      .input(z.object({ imageUrl: z.string().url().refine((value) => value.startsWith("https://"), "圖片網址必須使用 HTTPS"), fileName: z.string().min(1).max(180).default("reference-from-url") }))
      .mutation(async ({ input, ctx }) => {
        await assertPublicImageUrl(input.imageUrl);
        const response = await fetch(input.imageUrl, { redirect: "error", signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`圖片網址回應失敗（HTTP ${response.status}）`);
        const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
        if (!("image/png" === contentType || "image/jpeg" === contentType || "image/webp" === contentType)) throw new Error("網址必須直接回傳 PNG、JPEG 或 WebP 圖片");
        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength > 15_000_000) throw new Error("參考圖不可超過 15 MB");
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.byteLength > 15_000_000) throw new Error("參考圖不可超過 15 MB");
        const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
        const stored = await storagePut(`cursor-references/url-${Date.now()}.${extension}`, bytes, contentType);
        const forwardedProto = typeof ctx.req.headers?.["x-forwarded-proto"] === "string" ? ctx.req.headers["x-forwarded-proto"] : undefined;
        const protocol = forwardedProto || (ctx.req as any).protocol || "https";
        const host = ctx.req.headers?.host || "localhost";
        return { ...stored, url: `${protocol}://${host}${stored.url}`, mimeType: contentType, fileName: input.fileName, sourceUrl: input.imageUrl };
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
