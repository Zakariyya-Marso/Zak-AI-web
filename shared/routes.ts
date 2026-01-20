import { z } from "zod";
import { insertConversationSchema, insertMessageSchema, conversations, messages } from "./models/chat";
import { users } from "./models/auth";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    user: {
      method: "GET" as const,
      path: "/api/auth/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        302: z.void(), // Redirects
      },
    },
  },
  conversations: {
    list: {
      method: "GET" as const,
      path: "/api/conversations",
      responses: {
        200: z.array(z.custom<typeof conversations.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/conversations/:id",
      responses: {
        200: z.custom<typeof conversations.$inferSelect & { messages: typeof messages.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/conversations",
      input: insertConversationSchema.pick({ title: true }).optional(),
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/conversations/:id",
      responses: {
        204: z.void(),
      },
    },
    messages: {
      create: {
        method: "POST" as const,
        path: "/api/conversations/:id/messages",
        input: z.object({ content: z.string() }),
        responses: {
          200: z.void(), // SSE stream, so standard JSON response isn't the main thing
        },
      },
    },
  },
  images: {
    generate: {
      method: "POST" as const,
      path: "/api/generate-image",
      input: z.object({ prompt: z.string() }),
      responses: {
        200: z.object({
          b64_json: z.string(),
          mimeType: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
