import { InjectionKey, computed, inject, markRaw, ref, type Component } from 'vue';
import { arrayRemove } from '../../utils/array';

export const SidebarStoreKey: InjectionKey<SidebarStore> = Symbol('sidebar-store');

export type SidebarStore = ReturnType<typeof createSidebarStore>;

export function useSidebarStore() {
	return inject(SidebarStoreKey)!;
}

export interface ContextPane {
	readonly component: Component;
	props: Record<string, any>;
}

export function createSidebarStore() {
	const _contextPanes = ref<ContextPane[]>([]);

	/** Whether or not we should hide any panes automatically */
	const hideOnRouteChange = ref(true);

	/** Whether or not we should show any panes automatically */
	const showOnRouteChange = ref(false);

	/** The most recently set context pane */
	const activeContextPane = computed(() => {
		if (_contextPanes.value.length > 0) {
			return _contextPanes.value[_contextPanes.value.length - 1];
		}

		return null;
	});

	function addContextPane(component?: Component, props?: Record<string, any>) {
		if (component) {
			_contextPanes.value.push({
				component: markRaw(component),
				props: props || {},
			});
		}
		hideOnRouteChange.value = false;
	}

	/**
	 * Pass the local 'contextPane' variable to remove the contextPane from the
	 * store.
	 *
	 * This should generally be triggered within routeDestroyed().
	 */
	function removeContextPane(pane?: ContextPane | null) {
		if (pane) {
			arrayRemove(_contextPanes.value, i => i === pane);
		}
		hideOnRouteChange.value = true;
	}

	/**
	 * Whether or not to show the context pane after the route changes - resets
	 * to 'false' after route changes.
	 */
	function showContextOnRouteChange(shouldShow: boolean) {
		showOnRouteChange.value = shouldShow;
	}

	return {
		hideOnRouteChange,
		showOnRouteChange,
		activeContextPane,
		addContextPane,
		removeContextPane,
		showContextOnRouteChange,
	};
}
