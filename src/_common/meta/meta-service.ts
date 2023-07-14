import { reactive } from 'vue';
import { Router } from 'vue-router';
import { Environment } from '../environment/environment.service';
import { FbMetaContainer } from './fb-meta-container';
import { MetaContainer, ssrRenderMetaContainer } from './meta-container';
import { MicrodataContainer, ssrRenderMicrodata } from './microdata-container';
import { SeoMetaContainer, ssrRenderSeoMetaContainer } from './seo-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';

export function escapeString(str: string) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');
}

const originalSuffix = ' - Game Jolt';

class MetaService extends MetaContainer {
	titleSuffix = originalSuffix;

	_title = '';
	_originalTitle = !import.meta.env.SSR ? document.title : null;
	_base = new MetaContainer();
	_fb = new FbMetaContainer();
	_twitter = new TwitterMetaContainer();
	_microdata = new MicrodataContainer();
	_seo = new SeoMetaContainer();

	_baseTitle: string | null = null;
	_notificationsCount = 0;

	set title(title: string | null) {
		setMetaTitle(title);
	}

	get title(): string {
		return this._title;
	}

	set description(value: string | null) {
		this._base.set('description', value);
	}

	get description(): string | null {
		return this._base.get('description');
	}

	set fb(values: any) {
		Object.assign(this._fb, values);
	}

	get fb(): FbMetaContainer {
		return this._fb;
	}

	set twitter(values: any) {
		Object.assign(this._twitter, values);
	}

	get twitter(): TwitterMetaContainer {
		return this._twitter;
	}

	set microdata(microdata: any) {
		if (!microdata || typeof microdata !== 'object') {
			this._microdata.clear();
			return;
		}

		this._microdata.set(microdata);
	}

	get seo(): SeoMetaContainer {
		return this._seo;
	}

	set notificationsCount(count: number) {
		this._notificationsCount = count;
		_updatePageTitle();
	}
}

export const Meta = reactive(new MetaService()) as MetaService;

export function initMetaService(router: Router) {
	router.beforeEach((_to, _from, next) => {
		_clearMeta();
		next();
	});
}

export function setMetaTitle(title: string | null, withoutSuffix?: boolean) {
	Meta._baseTitle = title;

	if (withoutSuffix) {
		Meta.titleSuffix = '';
	} else {
		Meta.titleSuffix = originalSuffix;
	}

	_updatePageTitle();
}

export function ssrRenderMeta() {
	return (
		ssrRenderMetaContainer(Meta._base) +
		ssrRenderMetaContainer(Meta._fb.meta) +
		ssrRenderMetaContainer(Meta._twitter.meta) +
		ssrRenderSeoMetaContainer(Meta._seo) +
		ssrRenderMicrodata(Meta._microdata)
	);
}

function _updatePageTitle() {
	let title = Meta._baseTitle;

	if (title) {
		title += Meta.titleSuffix;
	} else {
		title = Meta._originalTitle;
	}

	if (Meta._notificationsCount > 0) {
		const notificationsCount =
			Meta._notificationsCount > 99 ? '99+' : Meta._notificationsCount + '';
		title = `(${notificationsCount}) ${title}`;
	}

	if (title) {
		if (!import.meta.env.SSR) {
			document.title = title;
		}
		Meta._title = title;

		// We escape in the template, so no need to escape here.
		Environment.ssrContext.meta.title = title;
	}
}

function _clearMeta() {
	Meta.description = null;

	Meta.fb = {
		title: null,
		description: null,
		url: null,
		type: null,
		image: null,
		profileId: null,
	};

	Meta.twitter = {
		title: null,
		description: null,
		card: null,
		image: null,
		url: null,
		shareMessage: null,
	};

	Meta._microdata.clear();
	Meta._seo.clear();
}
