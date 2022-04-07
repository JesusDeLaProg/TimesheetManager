import { Drash } from "/deps.ts";
import { HomeResource } from "/resources/home.resource.ts"

const server = new Drash.Server({
    hostname: "127.0.0.1",
    port: 8080,
    protocol: "http",
    resources: [HomeResource]
});

server.run();
