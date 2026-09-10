import { lookup } from "node:dns/promises";
import net from "node:net";

type MysqlMode = "unknown" | "up" | "down";

let mode: MysqlMode = "unknown";

export function setMysqlMode(next: MysqlMode) {
  mode = next;
}

export function markMysqlDown() {
  mode = "down";
}

export function getMysqlTarget(
  databaseUrl = process.env.DATABASE_URL,
): { host: string; port: number } | null {
  if (!databaseUrl) {
    return null;
  }

  try {
    const url = new URL(databaseUrl);
    if (!url.hostname) {
      return null;
    }

    return { host: url.hostname, port: Number(url.port || 3306) };
  } catch {
    return null;
  }
}

export function isUnreachableError(error: unknown): boolean {
  if (typeof error === "object" && error && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "P1001" || code === "P1002" || code === "P1011" || code === "P1017") {
      return true;
    }
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("can't reach database server") ||
    message.includes("enotfound") ||
    message.includes("econnrefused") ||
    message.includes("etimedout")
  );
}

async function probeMysql(): Promise<boolean> {
  const target = getMysqlTarget();
  if (!target) {
    return false;
  }

  try {
    await lookup(target.host);
  } catch {
    return false;
  }

  return new Promise((resolve) => {
    const socket = net.connect({
      host: target.host,
      port: target.port,
      timeout: 2500,
    });

    const finish = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };

    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

export async function mysqlEnabled(): Promise<boolean> {
  if (mode === "up") {
    return true;
  }

  if (mode === "down") {
    return false;
  }

  const reachable = await probeMysql();
  mode = reachable ? "up" : "down";

  if (!reachable) {
    const target = getMysqlTarget();
    const location = target ? `${target.host}:${target.port}` : "DATABASE_URL";
    console.error(`MySQL is unreachable at ${location}. Using in-memory demo store.`);
  }

  return reachable;
}
