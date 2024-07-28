import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	env;
	state;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.state = state;
		this.env = env;
	}

	async save(name: string): Promise<string> {
		await this.state.storage.put('name', name);
		return await this.state.storage.get('name') || 'Anonymous';
	}

	async say(): Promise<string> {
		return `Hi, ${await this.state.storage.get('name') || 'Anonymous'}!`;
	}
}

export const worker: ExportedHandler<Env> = {
	async fetch(request, env, _ctx): Promise<Response> {
		const host = new URL(request.url).host
		const search = new URL(request.url).search
		const pathname = new URL(request.url).pathname
		const name = new URLSearchParams(search).get('name') as string
		const key = env.MY_DURABLE_OBJECT.idFromName(host);
		const obj = env.MY_DURABLE_OBJECT.get(key);

		switch (pathname) {
			case '/save': {
				return Response.json({ Saved: await obj.save(name) });
			}

			default: {
				return new  Response(await obj.say());
			}
		}
	},
}

export interface Env {
	MY_DURABLE_OBJECT: DurableObjectNamespace<MyDurableObject>;
}

export default worker
