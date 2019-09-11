export class MicrodataContainer {
	microdata: any | undefined;

	set(microdata: any) {
		this.microdata = microdata;

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
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

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
		if (elem) {
			document.head.removeChild(elem);
		}
	}

	render() {
		if (!this.microdata || typeof this.microdata !== 'object') {
			return '';
		}

		return (
			`<script type="application/ld+json">${JSON.stringify(this.microdata)}</script>` + '\n'
		);
	}
}
