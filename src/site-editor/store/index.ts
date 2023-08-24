import { inject, InjectionKey, ref } from 'vue';
import { SiteModel } from '../../_common/site/site-model';
import { SiteTemplateModel } from '../../_common/site/template/template-model';
import { SiteThemeModel } from '../../_common/site/theme/theme-model';

type Tab = 'theme' | 'content';

export const SiteEditorStoreKey: InjectionKey<SiteEditorStore> = Symbol('site-editor-store');

export type SiteEditorStore = ReturnType<typeof createSiteEditorStore>;

export function useSiteEditorStore() {
	return inject(SiteEditorStoreKey)!;
}

export function createSiteEditorStore() {
	const isLoaded = ref(false);
	const tab = ref<Tab>('theme');
	const site = ref<SiteModel>();
	const siteTemplates = ref<SiteTemplateModel[]>([]);
	const currentTemplateId = ref(0);
	const siteTheme = ref<SiteThemeModel>();
	const isDirty = ref(false);

	function bootstrapTab(newTab: Tab, payload: any) {
		tab.value = newTab;
		isLoaded.value = true;
		site.value = new SiteModel(payload.site);
		siteTemplates.value = SiteTemplateModel.populate(payload.templates);

		if (site.value.theme) {
			currentTemplateId.value = site.value.theme.template.id;
			siteTheme.value = site.value.theme;
		}
	}

	function setTemplateId(id: number) {
		currentTemplateId.value = id;
		isDirty.value = true;
	}

	function setThemeData(themeData: any) {
		siteTheme.value!.data = themeData;
		isDirty.value = true;
	}

	function setContentEdited() {
		isDirty.value = true;
	}

	function clearIsDirty() {
		isDirty.value = false;
	}

	return {
		isLoaded,
		tab,
		site,
		siteTemplates,
		currentTemplateId,
		siteTheme,
		isDirty,

		bootstrapTab,
		setTemplateId,
		setThemeData,
		setContentEdited,
		clearIsDirty,
	};
}
