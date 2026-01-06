import { createSocket } from "@/lib/socket";

export const GET = () => {
  if (!(global as any).io) {
    (global as any).io = createSocket((global as any).server);
  }
  return new Response("socket ready");
};
