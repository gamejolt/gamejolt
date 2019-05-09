import {
	$joinCommunity,
	$leaveCommunity,
	Community,
} from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppCommunityThumbnailImg,
	},
})
export default class AppOnboardingFollowsCommunityItem extends Vue {
	@Prop(Community)
	community!: Community;

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}

	async toggleJoin() {
		if (!this.community.is_member) {
			$joinCommunity(this.community);
		} else {
			$leaveCommunity(this.community);
		}
	}
}
