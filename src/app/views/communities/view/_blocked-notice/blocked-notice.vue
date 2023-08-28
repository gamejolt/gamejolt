<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { getCommunityBlockReasons } from '../../../../../_common/user/action-reasons';

@Options({
	components: {
		AppTimeAgo,
	},
})
export default class AppBlockedNotice extends Vue {
	@Prop({ type: Object, required: true }) community!: CommunityModel;

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
			<AppJolticon icon="notice" />
			<span>
				<b><AppTranslate>You have been blocked from this community.</AppTranslate></b>
				<br />
				<AppTranslate>The reason for your block is as follows:</AppTranslate>
			</span>
			<br />

			<em>
				<strong>
					{{ communityBlockReason }}
				</strong>
			</em>
		</p>

		<div>
			<AppTranslate>
				You are unable to create any new posts in this community until your block gets
				lifted or expires.
			</AppTranslate>
		</div>

		<div v-if="community.user_block && community.user_block.doesExpire">
			Your block will expire in
			<b><AppTimeAgo :date="community.user_block.expires_on" without-suffix /></b>
		</div>
	</div>
</template>
