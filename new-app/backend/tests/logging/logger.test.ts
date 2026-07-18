import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "../../src/logging/logger";
import { requestLog } from "../../src/middleware/requestLog";
import { errorHandler } from "../../src/middleware/errorHandler";
import { EventEmitter } from "events";

describe("createLogger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it("emits JSON with level, msg, time", () => {
    const log = createLogger({}, "info");
    log.info("hello", { a: 1 });
    expect(logSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
      level: string;
      msg: string;
      time: string;
      a: number;
    };
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("hello");
    expect(parsed.a).toBe(1);
    expect(parsed.time).toEqual(expect.any(String));
  });

  it("filters debug when minLevel is info", () => {
    const log = createLogger({}, "info");
    log.debug("skip");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("child merges requestId", () => {
    const log = createLogger({}, "info").child({ requestId: "rid-1" });
    log.info("with-id");
    const parsed = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
      requestId: string;
    };
    expect(parsed.requestId).toBe("rid-1");
  });

  it("error writes to console.error", () => {
    const log = createLogger({}, "info");
    log.error("boom");
    expect(errSpy).toHaveBeenCalledOnce();
  });
});

describe("requestLog", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("logs http.access on finish with requestId", () => {
    const res = new EventEmitter() as unknown as Response & EventEmitter;
    (res as { statusCode: number }).statusCode = 200;
    const req = {
      method: "GET",
      originalUrl: "/api/health",
      url: "/api/health",
      requestId: "abc-123",
    } as Request;
    const next = vi.fn() as NextFunction;
    requestLog(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    res.emit("finish");
    expect(logSpy).toHaveBeenCalled();
    const parsed = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
      msg: string;
      method: string;
      path: string;
      statusCode: number;
      requestId: string;
      durationMs: number;
    };
    expect(parsed.msg).toBe("http.access");
    expect(parsed.method).toBe("GET");
    expect(parsed.path).toBe("/api/health");
    expect(parsed.statusCode).toBe(200);
    expect(parsed.requestId).toBe("abc-123");
    expect(parsed.durationMs).toEqual(expect.any(Number));
  });
});

describe("errorHandler logging", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errSpy.mockRestore();
  });

  it("logs Unhandled with requestId for unknown errors", () => {
    const res = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json() {
        return this;
      },
    } as unknown as Response;
    errorHandler(
      new Error("secret-sql"),
      { requestId: "rid-err" } as Request,
      res,
      vi.fn() as NextFunction,
    );
    expect(errSpy).toHaveBeenCalled();
    const parsed = JSON.parse(String(errSpy.mock.calls[0]?.[0])) as {
      msg: string;
      requestId: string;
      err: string;
    };
    expect(parsed.msg).toBe("Unhandled");
    expect(parsed.requestId).toBe("rid-err");
    expect(parsed.err).toBe("secret-sql");
  });
});
