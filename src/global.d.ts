declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

declare const process: {
  argv: string[];
  exitCode?: number;
};

declare namespace NodeJS {
  interface ReadableStream extends AsyncIterable<string> {
    pipe(destination: any): any;
    setEncoding?(encoding: string): void;
  }

  interface ReadWriteStream extends ReadableStream {}
}

declare module "fs" {
  const fs: any;
  export = fs;
}

declare module "path" {
  const path: any;
  export = path;
}

declare module "readline" {
  const readline: any;
  export = readline;
}

declare module "dns/promises" {
  const dnsPromises: any;
  export = dnsPromises;
}
