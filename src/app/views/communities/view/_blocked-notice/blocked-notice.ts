import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { getCommunityBlockReasons } from '../../../../../_common/user/action-reasons';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppBlockedNotice extends Vue {
	@Prop({ type: Object, required: true }) community!: Community;

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
