import { Perm } from 'game-jolt-frontend-lib/components/collaborator/collaboratable';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import {
	RouteStore,
	RouteStoreName,
} from '../../../views/communities/view/overview/edit/edit.store';

@Component({})
export class AppCommunityPerms extends Vue {
	@Prop(Community) community?: Community;
	@Prop({ type: String, default: '' })
	required!: string;
	@Prop(Boolean) either?: boolean;
	@Prop({ type: String, default: 'span' })
	tag!: string;

	get targetCommunity() {
		if (this.community) {
			return this.community;
		}

		const store: RouteStore | null = this.$store.state[RouteStoreName];
		if (store) {
			return store.community;
		}

		return null;
	}

	get hasPerms() {
		const perms: Perm[] = (this.required as any).split(',');

		if (!this.targetCommunity) {
			throw new Error(`Target community doesn't exist for app-community-perms component.`);
		}

		return this.targetCommunity.hasPerms(perms.filter(perm => !!perm), this.either);
	}

	render(h: CreateElement) {
		if (this.hasPerms) {
			return h(this.tag, this.$slots.default);
		}
	}
}
