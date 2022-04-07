import { Drash } from "/deps.ts"

export class HomeResource extends Drash.Resource {
    public override paths = ["/"];

    public GET(request: Drash.Request, response: Drash.Response): void {
        response.send("plain-text", `Hello, ${request.queryParam("name") ?? "World"}!`);
    }
}