import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

export const worker: ExportedHandler<Env> = {
	async fetch(request, env, _ctx): Promise<Response> {
		let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);

		let stub = env.MY_DURABLE_OBJECT.get(id);

		let greeting = await stub.sayHello("world");

		return new Response(greeting);
	},
}

export interface Env {
	MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
}

export default worker
