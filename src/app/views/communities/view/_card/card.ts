import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../../utils/vue';
import AppCommunityCardBaseInline from '../../../../../_common/community/card-base/card-base-inline.vue';
import AppCommunityCardBase from '../../../../../_common/community/card-base/card-base.vue';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { CommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';

@Component({
	components: {
		AppCommunityCardBase,
		AppCommunityCardBaseInline,
		AppEditableThumbnail,
	},
})
export default class AppCommunitiesViewCard extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;
	@Prop(propOptional(Boolean, false)) overflow!: boolean;
	@Prop(propOptional(Boolean, false)) inline!: boolean;
	@Prop(propOptional(Boolean, false)) asHeader!: boolean;

	get cardComponent() {
		return this.inline ? AppCommunityCardBaseInline : AppCommunityCardBase;
	}

	get cardProps() {
		const props = {
			community: this.community,
			overflow: this.overflow,
		};

		if (this.inline) {
			Object.assign(props, {
				routeStore: this.routeStore,
				asHeader: this.asHeader,
			});
		}

		return props;
	}

	get community() {
		return this.routeStore.community;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.routeStore.community);
	}
}
