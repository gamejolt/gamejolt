export class MicrodataContainer {
	microdata: any | undefined;

	set(microdata: any) {
		this.microdata = microdata;

		if (import.meta.env.SSR) {
			return;
		}

		let elem = document.head.querySelector<HTMLScriptElement>(
			'script[type="application/ld+json"]'
		);
		if (elem) {
			this.clear();
		}

		elem = document.createElement('script');
		elem.type = 'application/ld+json';
		elem.text = JSON.stringify(microdata);
		document.head.appendChild(elem);
	}

	clear() {
		this.microdata = undefined;

		if (import.meta.env.SSR) {
			return;
		}

		const elem = document.head.querySelector<HTMLScriptElement>(
			'script[type="application/ld+json"]'
		);
		if (elem) {
			document.head.removeChild(elem);
		}
	}
}

export function ssrRenderMicrodata(container: MicrodataContainer) {
	if (!container.microdata || typeof container.microdata !== 'object') {
		return '';
	}

	return (
		`<script type="application/ld+json">${JSON.stringify(container.microdata)}</script>` + '\n'
	);
}
