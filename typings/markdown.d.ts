export interface ViteMarkdownExport {
	attributes: Record<string, unknown>;
	html: string;
}

declare module '*.md' {
	const attributes: Record<string, unknown>;
	const html: string;

	export { attributes, html };
}
