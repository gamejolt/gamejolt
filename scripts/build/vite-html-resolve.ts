import { IndexHtmlTransformHook, Plugin } from 'vite';

export type HtmlResolvePluginOptions = {
	namespace?: number;
};

export type TransformIndexHtmlFunc = (
	resolvedPaths: Map<string, string>,
	...args: Parameters<IndexHtmlTransformHook>
) => ReturnType<IndexHtmlTransformHook>;

export type ResolveOptions =
	// Explicitly typed reference.
	| {
			path: string;
			type: 'image';
	  }
	// Inferred type reference.
	| string;

export default function viteHtmlResolve(options?: HtmlResolvePluginOptions) {
	const namespace = options?.namespace ?? 0;

	// Will be populated with the resolved paths after the post plugin runs.
	const resolvePaths = new Map<string, string>();

	let nextId = 0;
	const name2Id = new Map<string, number>();
	const id2Name = new Map<number, string>();

	function makeResolveTag(strToResolve) {
		let id: number;
		if (name2Id.has(strToResolve)) {
			id = name2Id.get(strToResolve)!;
		} else {
			id = nextId;
			nextId++;

			name2Id.set(strToResolve, id);
			id2Name.set(id, strToResolve);
		}

		return `gj-html-resolve="${namespace}:${id}"`;
	}

	const matchUnescaped = '(?<!\\\\)(?:\\\\\\\\)*';
	const captureString = `"(.*?${matchUnescaped})"`;
	const captureResolveId = `gj-html-resolve="${namespace}:(\\d+)"`;

	function createPrePlugin(resolve: ResolveOptions[]) {
		const prePlugin: Plugin = {
			name: 'gj:html-resolve:pre',
			enforce: 'pre',
			transformIndexHtml: {
				enforce: 'pre',
				transform: html => {
					const injects: string[] = [];

					for (let entry of resolve) {
						if (typeof entry === 'string') {
							entry = { path: entry, type: 'image' };
						}

						switch (entry.type) {
							case 'image':
								injects.push(
									`<img ${makeResolveTag(entry.path)} src="${entry.path}">`
								);
								break;

							default:
								throw new Error(
									`Unsupported resolver type '${entry.type}' for entry '${entry.path}'`
								);
						}
					}

					let htmlResolveTag = 'gj:html-resolve';
					if (options?.namespace !== undefined) {
						htmlResolveTag += `:${options.namespace}`;
					}

					return html.replace(`<!-- ${htmlResolveTag} -->`, injects.join(''));
				},
			},
		};

		return prePlugin;
	}

	function createPostPlugin(cb?: TransformIndexHtmlFunc) {
		const cb2 = cb ?? ((_resolved: any, html: string) => html);

		const postPlugin: Plugin = {
			name: 'gj:html-resolve:post',
			enforce: 'post',
			transformIndexHtml: {
				enforce: 'post',
				transform: (html, ctx) => {
					const imgMatcher = new RegExp(`<img ${captureResolveId} src=${captureString}>`);

					let match: RegExpExecArray | null;
					while ((match = imgMatcher.exec(html)) !== null) {
						// Remove the match from html.
						html =
							html.slice(0, match.index) + html.slice(match.index + match[0].length);

						const id = parseInt(match[1]);
						const resolvedPath = match[2];

						if (!id2Name.has(id)) {
							console.warn(
								'Encountered an html-resolve tag we did not make. Do you have multiple html-resolve plugin instances using the same namespace?'
							);
							continue;
						}

						resolvePaths.set(id2Name.get(id)!, resolvedPath);
					}

					return cb2(resolvePaths, html, ctx);
				},
			},
		};

		return postPlugin;
	}

	return {
		prePlugin: (resolve: ResolveOptions[]) => createPrePlugin(resolve),
		postPlugin: (transformIndexHtml?: TransformIndexHtmlFunc) =>
			createPostPlugin(transformIndexHtml),
		resolved: resolvePaths,
	};
}
