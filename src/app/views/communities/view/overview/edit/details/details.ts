import Component from 'vue-class-component';
import { enforceLocation } from '../../../../../../../utils/router';
import AppCommunityThumbnailImg from '../../../../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../../../../_common/editable-overlay/editable-overlay.vue';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import FormCommunity from '../../../../../../components/forms/community/community.vue';
import { CommunityThumbnailModal } from '../../../../../../components/forms/community/thumbnail/modal/modal.service';
import { RouteStore, RouteStoreModule } from '../edit.store';

@Component({
	name: 'RouteCommunitiesViewEditDetails',
	components: {
		AppCommunityPerms,
		AppEditableOverlay,
		AppCommunityThumbnailImg,
		FormCommunity,
	},
})
export default class RouteCommunitiesViewEditDetails extends BaseRouteComponent {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	collaboration!: RouteStore['collaboration'];

	@RouteStoreModule.Action
	removeCommunity!: RouteStore['removeCommunity'];

	@RouteStoreModule.Action
	leaveCommunity!: RouteStore['leaveCommunity'];

	readonly Screen = Screen;

	get shouldShowThumbnail() {
		return Screen.isXs;
	}

	get isOwner() {
		// The owner's collaboration is not returned from backend.
		return this.collaboration === null;
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.community);
	}

	onDetailsChange() {
		// If the community path changes, we need to replace the route,
		// otherwise when navigating to the community view routes, it'll attempt to navigate
		// to the old name.
		if (this.community.path !== this.$route.params.path) {
			const newLocation = enforceLocation(this.$route, { path: this.community.path });
			if (newLocation) {
				this.$router.replace(newLocation.location);
			}
		}

		this.$emit('details-change', this.community);
	}
}
