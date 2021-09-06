import { useStore } from 'vuex';
import { namespace } from 'vuex-class';
import { arrayRemove } from '../../utils/array';
import { StoreKey, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { appStore } from '../store/app-store';
import { Theme } from './theme.model';

export const ThemeStoreNamespace = 'theme';
export const {
	State: ThemeState,
	Action: ThemeAction,
	Mutation: ThemeMutation,
} = namespace(ThemeStoreNamespace);

export type ThemeActions = {};

export type ThemeMutations = {
	'theme/sync': void;
	'theme/setDark': boolean;
	'theme/setAlwaysOurs': boolean;
	'theme/setUserTheme': Theme | null;
	'theme/setPageTheme': PageTheme;
	'theme/clearPageTheme': string;
	'theme/setFormTheme': Theme | null;
};

export const useThemeStore = () => useStore(StoreKey).state.theme as ThemeStore;

interface PageTheme {
	key: string;
	theme: Theme | null;
}

@VuexModule()
export class ThemeStore extends VuexStore<ThemeStore, ThemeActions, ThemeMutations> {
	isDark = false;
	alwaysOurs = false;
	formTheme: Theme | null = null;

	// Page themes are a stack so that we can route between different pages and
	// the clearing of one page's theme won't clear out the new page's theme.
	pageThemeStack: PageTheme[] = [];

	get userTheme() {
		return (appStore.state.user && appStore.state.user.theme) || null;
	}

	get pageTheme() {
		return this.pageThemeStack.length > 0
			? this.pageThemeStack[this.pageThemeStack.length - 1].theme
			: null;
	}

	get theme() {
		return this.alwaysOurs
			? this.formTheme ?? this.userTheme
			: this.formTheme ?? this.pageTheme ?? this.userTheme;
	}

	@VuexMutation
	setDark(state: ThemeMutations['theme/setDark']) {
		this.isDark = state;
	}

	@VuexMutation
	setAlwaysOurs(state: ThemeMutations['theme/setAlwaysOurs']) {
		this.alwaysOurs = state;
	}

	@VuexMutation
	setUserTheme(theme: ThemeMutations['theme/setUserTheme']) {
		if (appStore.state.user) {
			appStore.state.user.theme = theme;
		}
	}

	@VuexMutation
	setPageTheme({ key, theme }: ThemeMutations['theme/setPageTheme']) {
		const existingPageTheme = this.pageThemeStack.find(i => i.key === key);
		if (existingPageTheme) {
			// If we already have a page theme for this page's key, just update it.
			existingPageTheme.theme = theme;
		} else {
			// Otherwise it's a new page theme we need to keep track of.
			this.pageThemeStack.push({ key, theme });
		}
	}

	@VuexMutation
	clearPageTheme(key: ThemeMutations['theme/clearPageTheme']) {
		arrayRemove(this.pageThemeStack, i => i.key === key);
	}

	@VuexMutation
	setFormTheme(theme: ThemeMutations['theme/setFormTheme']) {
		this.formTheme = theme;
	}
}
