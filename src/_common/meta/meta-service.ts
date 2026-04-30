import { reactive } from 'vue';
import { Router } from 'vue-router';

import { getSsrContext } from '~common/environment/environment.service';
import { FbMetaContainer } from '~common/meta/fb-meta-container';
import { MetaContainer, ssrRenderMetaContainer } from '~common/meta/meta-container';
import { MicrodataContainer, ssrRenderMicrodata } from '~common/meta/microdata-container';
import { SeoMetaContainer, ssrRenderSeoMetaContainer } from '~common/meta/seo-meta-container';
import { TwitterMetaContainer } from '~common/meta/twitter-meta-container';
import { defineIsolatedState } from '~common/ssr/isolated-state';

export function escapeString(str: string) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');
}

const originalSuffix = ' - Game Jolt';

interface MetaState {
	titleSuffix: string;
	_title: string;
	_originalTitle: string | null;
	_base: MetaContainer;
	_fb: FbMetaContainer;
	_twitter: TwitterMetaContainer;
	_microdata: MicrodataContainer;
	_seo: SeoMetaContainer;
	_baseTitle: string | null;
	_notificationsCount: number;
}

/**
 * Per-request metadata state. Held inside `defineIsolatedState` so concurrent
 * SSR requests don't stomp on each other's `<meta>` tags; `MetaService`
 * exposes each field as a getter/setter that delegates to this state, giving
 * callers the familiar `Meta.foo = x` ergonomics without a `Proxy`.
 */
const _state = defineIsolatedState<MetaState>(
	() =>
		reactive({
			titleSuffix: originalSuffix,
			_title: '',
			_originalTitle: !import.meta.env.SSR ? document.title : null,
			_base: new MetaContainer(),
			_fb: new FbMetaContainer(),
			_twitter: new TwitterMetaContainer(),
			_microdata: new MicrodataContainer(),
			_seo: new SeoMetaContainer(),
			_baseTitle: null,
			_notificationsCount: 0,
		}) as unknown as MetaState
);

class MetaService {
	get titleSuffix() {
		return _state().titleSuffix;
	}
	set titleSuffix(value: string) {
		_state().titleSuffix = value;
	}

	get _title() {
		return _state()._title;
	}
	set _title(value: string) {
		_state()._title = value;
	}

	get _originalTitle() {
		return _state()._originalTitle;
	}
	set _originalTitle(value: string | null) {
		_state()._originalTitle = value;
	}

	get _base() {
		return _state()._base;
	}

	get _fb() {
		return _state()._fb;
	}

	get _twitter() {
		return _state()._twitter;
	}

	get _microdata() {
		return _state()._microdata;
	}

	get _seo() {
		return _state()._seo;
	}

	get _baseTitle() {
		return _state()._baseTitle;
	}
	set _baseTitle(value: string | null) {
		_state()._baseTitle = value;
	}

	get _notificationsCount() {
		return _state()._notificationsCount;
	}
	set _notificationsCount(value: number) {
		_state()._notificationsCount = value;
	}

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

export const Meta: MetaService = /** @__PURE__ */ new MetaService();

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
		getSsrContext().meta.title = title;
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
