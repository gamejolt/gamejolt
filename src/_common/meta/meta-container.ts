import { escapeString } from './meta-service';

export class MetaField {
	original: string | null = null;
	current: string | null = null;
}

export class MetaContainer {
	_attr = 'name';
	_fields: Record<string, MetaField> = {};

	set(name: string, content: string | null) {
		this._storeField(name, content);

		if (import.meta.env.SSR) {
			return;
		}

		let elem = document.head.querySelector<HTMLMetaElement>(`meta[${this._attr}="${name}"]`);

		// Remove if we're nulling it out.
		if (!content) {
			if (elem) {
				document.head.removeChild(elem);
			}
			return;
		}

		// Create if not exists.
		if (!elem) {
			elem = document.createElement('meta');
			elem.setAttribute(this._attr, name);
			document.head.appendChild(elem);
		}

		elem.content = content;
	}

	get(name: string) {
		return this._fields[name] ? this._fields[name].current : null;
	}

	protected _storeField(name: string, content: string | null) {
		if (!this._fields[name]) {
			const field = new MetaField();

			if (!import.meta.env.SSR) {
				const elem = document.head.querySelector<HTMLMetaElement>(
					`meta[${this._attr}="${name}"]`
				);
				if (elem) {
					field.original = elem.content;
				}
			}

			this._fields[name] = field;
		}

		this._fields[name].current = content;
	}
}

export function renderMetaContainer(container: MetaContainer) {
	let output = '';

	for (const key in container._fields) {
		const field = container._fields[key];
		if (field.current) {
			output +=
				`<meta ${container._attr}="${key}" content="${escapeString(field.current)}" />` +
				'\n';
		}
	}

	return output;
}
