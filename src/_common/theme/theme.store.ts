import { computed, inject, InjectionKey, ref } from 'vue';
import { arrayRemove } from '../../utils/array';
import { SettingThemeAlwaysOurs, SettingThemeDark } from '../settings/settings.service';
import { CommonStore } from '../store/common-store';
import { ThemeModel } from './theme.model';

export const ThemeStoreKey: InjectionKey<ThemeStore> = Symbol('theme-store');

export type ThemeStore = ReturnType<typeof createThemeStore>;

export function useThemeStore() {
	return inject(ThemeStoreKey)!;
}

interface PageTheme {
	key: string;
	theme: ThemeModel | null;
}

export function createThemeStore({ commonStore: { user } }: { commonStore: CommonStore }) {
	const isDark = ref(SettingThemeDark.get());
	const _alwaysOurs = ref(SettingThemeAlwaysOurs.get());
	const _formTheme = ref<ThemeModel | null>(null);

	/**
	 * Page themes are a stack so that we can route between different pages and
	 * the clearing of one page's theme won't clear out the new page's theme.
	 */
	const _pageThemeStack = ref<PageTheme[]>([]);

	const userTheme = computed(() => (user.value && user.value.theme) || null);

	const pageTheme = computed(() => {
		return _pageThemeStack.value.length > 0
			? _pageThemeStack.value[_pageThemeStack.value.length - 1].theme
			: null;
	});

	const theme = computed(() => {
		return _alwaysOurs.value
			? _formTheme.value ?? userTheme.value
			: _formTheme.value ?? pageTheme.value ?? userTheme.value;
	});

	function setDark(state: boolean) {
		isDark.value = state;
	}

	function setAlwaysOurs(state: boolean) {
		_alwaysOurs.value = state;
	}

	function setPageTheme({ key, theme }: PageTheme) {
		const existingPageTheme = _pageThemeStack.value.find(i => i.key === key);
		if (existingPageTheme) {
			// If we already have a page theme for this page's key, just update it.
			existingPageTheme.theme = theme;
		} else {
			// Otherwise it's a new page theme we need to keep track of.
			_pageThemeStack.value.push({ key, theme });
		}
	}

	function clearPageTheme(key: string) {
		arrayRemove(_pageThemeStack.value, i => i.key === key);
	}

	function setFormTheme(theme: ThemeModel | null) {
		_formTheme.value = theme;
	}

	return {
		isDark,
		userTheme,
		pageTheme,
		theme,
		setDark,
		setAlwaysOurs,
		setPageTheme,
		clearPageTheme,
		setFormTheme,
	};
}
