import Server from "https://deno.land/x/lume@v2.0.3/core/server.ts";

const port = 8000;
const server = new Server({
  root: `${Deno.cwd()}/_lume/_site`,
  port,
})

server.start();

console.log(`http://localhost:${port}`);
