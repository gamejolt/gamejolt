import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Component } from 'vue-property-decorator';
import { CommunityTag } from '../../../../../../lib/gj-lib-client/components/community/tag/tag.model';
import FormCommunityTag from '../../../../../components/forms/community/tag/tag.vue';
import { RouteStore, RouteStoreModule } from '../edit.store';

const draggable = require('vuedraggable');

@Component({
	name: 'RouteCommunitiesViewEditTags',
	components: {
		FormCommunityTag,
		draggable,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/tags/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditTags extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	tags: CommunityTag[] = [];

	get routeTitle() {
		if (this.community) {
			return this.$gettextInterpolate(`Edit Tags for %{ community }`, {
				community: this.community.name,
			});
		}
		return null;
	}

	routeResolved(payload: any) {
		this.tags = CommunityTag.populate(payload.tags);
	}

	async saveSort() {
		await CommunityTag.$saveSort(this.community.id, this.tags.map(i => i.id));
	}

	onTagAdded(tag: CommunityTag) {
		this.tags.unshift(tag);
	}

	async onTagRemove(tag: CommunityTag) {
		try {
			await tag.$remove();
		} catch (e) {
			console.error(e);
			Growls.error('Could not remove tag');
		}

		if (tag._removed) {
			this.tags = this.tags.filter(i => i.id !== tag.id);
		}
	}
}
