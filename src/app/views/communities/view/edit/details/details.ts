import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { enforceLocation } from '../../../../../../utils/router';
import AppAlertDismissable from '../../../../../../_common/alert/dismissable/dismissable.vue';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { ThemeMutation, ThemeStore } from '../../../../../../_common/theme/theme.store';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import FormCommunity from '../../../../../components/forms/community/community.vue';
import FormCommunityDescription from '../../../../../components/forms/community/description/description.vue';
import { CommunityHeaderModal } from '../../../../../components/forms/community/header/modal/modal.service';
import { CommunityThumbnailModal } from '../../../../../components/forms/community/thumbnail/modal/modal.service';
import AppPageHeader from '../../../../../components/page-header/page-header.vue';
import { Store } from '../../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditDetails',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppPageHeader,
		AppEditableOverlay,
		AppCommunityThumbnailImg,
		FormCommunity,
		FormCommunityDescription,
		AppAlertDismissable,
	},
})
export default class RouteCommunitiesViewEditDetails extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@ThemeMutation setPageTheme!: ThemeStore['setPageTheme'];
	@Action('leaveCommunity') leaveCommunityAction!: Store['leaveCommunity'];

	get community() {
		return this.routeStore.community;
	}

	get collaborator() {
		return this.routeStore.collaborator;
	}

	get isOwner() {
		// The owner's collaboration is not returned from backend.
		return this.collaborator === null;
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.community);
	}

	showEditHeader() {
		CommunityHeaderModal.show(this.community);
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

		this.setPageTheme(this.community.theme || null);
	}

	async removeCommunity() {
		const result = await ModalConfirm.show(
			this.$gettext(
				`Are you sure you want to permanently remove your community? Once it's gone, it's gone forever.`
			)
		);
		if (!result) {
			return;
		}

		await this.community.$remove();
		await this.leaveCommunityAction(this.community);

		Growls.info(
			this.$gettext(`Your community has been removed from the site.`),
			this.$gettext(`Community Removed`)
		);

		this.$router.push({ name: 'home' });
	}

	async leaveCommunity() {
		if (!this.collaborator) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to leave this community?`),
			this.$gettext(`Leave community?`),
			'yes'
		);
		if (!result) {
			return;
		}

		await this.collaborator.$remove();
		await this.leaveCommunityAction(this.community);

		Growls.success(
			this.$gettext(`You left the community. You will be missed! ;A;`),
			this.$gettext(`Left Community`)
		);

		this.$router.push({ name: 'home' });
	}
}
