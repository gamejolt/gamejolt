import { MetaContainer, ssrRenderMetaContainer } from './meta-container';

export class SeoMetaContainer {
	readonly meta = new MetaContainer();
	private _canonicalLink: string | null = null;

	set canonicalLink(link: string | null) {
		this._canonicalLink = link;

		if (import.meta.env.SSR) {
			return;
		}

		let elem = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (elem) {
			document.head.removeChild(elem);
		}

		if (!link) {
			return;
		}

		elem = document.createElement('link');
		elem.rel = 'canonical';
		elem.href = link;
		document.head.appendChild(elem);
	}

	get canonicalLink() {
		return this._canonicalLink;
	}

	deindex() {
		this.meta.set('robots', 'noindex');
	}

	clear() {
		this.meta.set('robots', null);
		this.canonicalLink = null;
	}
}

export function ssrRenderSeoMetaContainer(seo: SeoMetaContainer) {
	return ssrRenderMetaContainer(seo.meta) + `<link rel="canonical" href="${seo.canonicalLink}">`;
}
