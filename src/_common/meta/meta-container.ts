import { escapeString } from './meta-service';

export class MetaField {
	original: string | null = null;
	current: string | null = null;
}

export class MetaContainer {
	constructor(readonly attr = 'name') {}

	fields: Record<string, MetaField> = {};

	set(name: string, content: string | null) {
		this._storeField(name, content);

		if (import.meta.env.SSR) {
			return;
		}

		let elem = document.head.querySelector<HTMLMetaElement>(`meta[${this.attr}="${name}"]`);
		if (elem) {
			document.head.removeChild(elem);
		}

		if (!content) {
			return;
		}

		elem = document.createElement('meta');
		elem.setAttribute(this.attr, name);
		elem.content = content;
		document.head.appendChild(elem);
	}

	get(name: string) {
		return this.fields[name] ? this.fields[name].current : null;
	}

	protected _storeField(name: string, content: string | null) {
		if (!this.fields[name]) {
			const field = new MetaField();

			if (!import.meta.env.SSR) {
				const elem = document.head.querySelector<HTMLMetaElement>(
					`meta[${this.attr}="${name}"]`
				);
				if (elem) {
					field.original = elem.content;
				}
			}

			this.fields[name] = field;
		}

		this.fields[name].current = content;
	}
}

export function ssrRenderMetaContainer(container: MetaContainer) {
	let output = '';

	for (const key in container.fields) {
		const field = container.fields[key];
		if (field.current) {
			output +=
				`<meta ${container.attr}="${key}" content="${escapeString(field.current)}" />` +
				'\n';
		}
	}

	return output;
}
