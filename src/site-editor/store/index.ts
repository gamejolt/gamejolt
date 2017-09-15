import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { Site } from '../../lib/gj-lib-client/components/site/site-model';
import { SiteTemplate } from '../../lib/gj-lib-client/components/site/template/template-model';
import { SiteTheme } from '../../lib/gj-lib-client/components/site/theme/theme-model';
import {
	VuexStore,
	VuexModule,
	VuexAction,
	VuexMutation,
} from '../../lib/gj-lib-client/utils/vuex';
import {
	AppStore,
	Mutations as AppMutations,
	Actions as AppActions,
	appStore,
} from '../../lib/gj-lib-client/vue/services/app/app-store';

type Tab = 'theme' | 'editor';

export type Actions = AppActions & {
	bootstrapTab: {
		tab: Tab;
		siteId: number;
	};
};

export type Mutations = AppMutations & {
	_bootstrapTab: {
		tab: Tab;
		response: any;
	};
};

@VuexModule({
	store: true,
	modules: {
		app: appStore,
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app: AppStore;

	isLoaded = false;
	tab: Tab = 'theme';
	site: Site = null as any;
	templates: SiteTemplate[] = [];
	currentTemplateId = 0;
	theme: SiteTheme = null as any;

	@VuexAction
	async bootstrapTab({ tab, siteId }: Actions['bootstrapTab']) {
		const response = await Api.sendRequest(`/web/dash/sites/editor/${siteId}`);
		this._bootstrapTab({ tab, response });
	}

	@VuexMutation
	_bootstrapTab({ tab, response }: Mutations['_bootstrapTab']) {
		this.tab = tab;
		this.isLoaded = true;
		this.site = new Site(response.site);
		this.templates = SiteTemplate.populate(response.templates);

		if (this.site.theme) {
			this.currentTemplateId = this.site.theme.template.id;
			this.theme = this.site.theme;
		}
	}
}

export const store = new Store();
