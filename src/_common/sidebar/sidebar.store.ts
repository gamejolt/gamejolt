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
	sidebarComponent: Vue | null = null;
	sidebarProps: Record<string, any> | null = null;

	@VuexAction
	async clearSidebarContext() {
		this.setSidebarComponent(null);
		this.setSidebarProps(null);
	}

	@VuexMutation
	setSidebarComponent(component: SidebarMutations['sidebar/setSidebarComponent']) {
		this.sidebarComponent = component;
	}

	@VuexMutation
	setSidebarProps(props: SidebarMutations['sidebar/setSidebarProps']) {
		this.sidebarProps = props;
	}
}
