import { namespace } from 'vuex-class';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';

export const SidebarStoreNamespace = 'sidebar';
export const { State: SidebarState, Action: SidebarAction, Mutation: SidebarMutation } = namespace(
	SidebarStoreNamespace
);

export type SidebarActions = {
	'sidebar/clearSidebarContext': void;
};

export type SidebarMutations = {
	'sidebar/setSidebarComponent': Vue | null;
	'sidebar/setSidebarProps': Record<string, unknown> | null;
};

@VuexModule()
export class SidebarStore extends VuexStore<SidebarStore, SidebarActions, SidebarMutations> {
	_sidebarComponent: Vue | null = null;
	_sidebarProps: Record<string, any> | null = null;

	get sidebarProps() {
		return this._sidebarProps;
	}

	get sidebarComponent() {
		return this._sidebarComponent;
	}

	@VuexAction
	async clearSidebarContext() {
		this.setSidebarComponent(null);
		this.setSidebarProps(null);
	}

	@VuexMutation
	setSidebarComponent(component: SidebarMutations['sidebar/setSidebarComponent']) {
		this._sidebarComponent = component;
	}

	@VuexMutation
	setSidebarProps(props: SidebarMutations['sidebar/setSidebarProps']) {
		this._sidebarProps = props;
	}
}
