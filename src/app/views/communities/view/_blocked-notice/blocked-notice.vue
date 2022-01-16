<script lang="ts">
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
</script>

<template>
	<div v-if="community.isBlocked" class="alert alert-notice">
		<p>
			<app-jolticon icon="notice" />
			<span>
				<b><translate>You have been blocked from this community.</translate></b>
				<br />
				<translate>The reason for your block is as follows:</translate>
			</span>
			<br />

			<em>
				<strong>
					{{ communityBlockReason }}
				</strong>
			</em>
		</p>

		<div>
			<translate>
				You are unable to create any new posts in this community until your block gets
				lifted or expires.
			</translate>
		</div>

		<div v-if="community.user_block && community.user_block.doesExpire">
			Your block will expire in
			<b><app-time-ago :date="community.user_block.expires_on" without-suffix /></b>
		</div>
	</div>
</template>
