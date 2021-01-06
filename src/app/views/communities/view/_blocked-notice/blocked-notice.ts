import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { getCommunityBlockReasons } from '../../../../../_common/user/action-reasons';

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppBlockedNotice extends Vue {
	@Prop(propRequired(Community)) community!: Community;

	get communityBlockReason() {
		if (!this.community.user_block) {
			return '';
		}

		const reason = this.community.user_block.reason;
		const reasons = getCommunityBlockReasons();
		if (reasons[reason]) {
			return reasons[reason];
		}
		return reason;
	}
}
