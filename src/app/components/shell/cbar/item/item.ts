import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { Store } from '../../../../store/index';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarItem extends Vue {
	@Prop(Community)
	community!: Community;

	@State
	communityStates!: Store['communityStates'];

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get isUnread() {
		return this.communityState.isUnread;
	}

	get featureCount() {
		return this.communityState.unreadFeatureCount;
	}

	get featureCountText() {
		if (this.featureCount > 99) {
			return '99+';
		}
		return this.featureCount.toString();
	}

	get isActive() {
		return (
			this.$route.name &&
			this.$route.name.indexOf('communities.view') === 0 &&
			this.$route.params.path === this.community!.path
		);
	}

	get highlight() {
		if (this.isActive) {
			const highlight = this.community.theme && this.community.theme.highlight_;
			if (highlight) {
				return '#' + highlight;
			}
		}
		return null;
	}
}
