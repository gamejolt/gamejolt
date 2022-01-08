import Vue, { Component, markRaw } from 'vue';
import { namespace } from 'vuex-class';
import { arrayRemove } from '../../utils/array';
import { VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';

const SidebarStoreNamespace = 'sidebar';
export const {
	State: SidebarState,
	Action: SidebarAction,
	Mutation: SidebarMutation,
} = namespace(SidebarStoreNamespace);

export type SidebarActions = Record<string, any>;

export type SidebarMutations = {
	'sidebar/addContextPane': typeof Vue;
	'sidebar/removeContextPane': ContextPane | null;
	'sidebar/showContextOnRouteChange': boolean;
};

export class ContextPane {
	readonly component: Component;

	constructor(component: Component, public props: Record<string, any> = {}) {
		this.component = markRaw(component);
	}
}

/**
 * 1. Initialize what we need for the context pane:
 *   - readonly sidebarComponent = /* the Vue component to use *\/
 *   - contextPane: null | ContextPane = null
 *
 * 2. routeCreated() - 'if (!this.contextPane)':
 *   - this.addContextPane(this.sidebarComponent)
 *   - this.contextPane = this.activeContextPane
 *
 * 3. If the context component needs any props:
 *   - this.contextPane.props = { /* required props *\/ };
 *
 * 4. routeDestroyed() - Panes will hide if there's no activeContextPane:
 *   - this.removeContextPane(this.contextPane)
 */
@VuexModule()
export class SidebarStore extends VuexStore<SidebarStore, SidebarActions, SidebarMutations> {
	private _contextPanes: ContextPane[] = [];
	/** Whether or not we should hide any panes automatically */
	hideOnRouteChange = true;
	/** Whether or not we should show any panes automatically */
	showOnRouteChange = false;

	/** The most recently set context pane */
	get activeContextPane() {
		if (this._contextPanes.length > 0) {
			return this._contextPanes[this._contextPanes.length - 1];
		}

		return null;
	}

	@VuexMutation
	addContextPane(
		component?: SidebarMutations['sidebar/addContextPane'],
		props?: Record<string, any>
	) {
		if (component) {
			const pane = new ContextPane(component, props);
			this._contextPanes.push(pane);
		}
		this.hideOnRouteChange = false;
	}

	/**
	 * Pass the local 'contextPane' variable to remove the contextPane from the store.
	 *
	 * This should generally be triggered within routeDestroyed().
	 */
	@VuexMutation
	removeContextPane(pane?: SidebarMutations['sidebar/removeContextPane']) {
		if (pane) {
			arrayRemove(this._contextPanes, i => i === pane);
		}
		this.hideOnRouteChange = true;
	}

	/**
	 * Whether or not to show the context pane after the route changes - resets to 'false' after route changes.
	 */
	@VuexMutation
	showContextOnRouteChange(shouldShow: SidebarMutations['sidebar/showContextOnRouteChange']) {
		this.showOnRouteChange = shouldShow;
	}
}
