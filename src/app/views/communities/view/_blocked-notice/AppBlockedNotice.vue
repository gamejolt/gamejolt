<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { getCommunityBlockReasons } from '../../../../../_common/user/action-reasons';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
});

const { community } = toRefs(props);

const communityBlockReason = computed(() => {
	if (!community.value.user_block) {
		return '';
	}

	const reason = community.value.user_block.reason;
	const reasons = getCommunityBlockReasons();
	if (reasons[reason]) {
		return reasons[reason];
	}
	return reason;
});
</script>

<template>
	<div v-if="community.isBlocked" class="alert alert-notice">
		<p>
			<AppJolticon icon="notice" />
			<span>
				<b>
					{{ $gettext(`You have been blocked from this community.`) }}
				</b>
				<br />
				{{ $gettext(`The reason for your block is as follows:`) }}
			</span>
			<br />

			<em>
				<strong>
					{{ communityBlockReason }}
				</strong>
			</em>
		</p>

		<div>
			{{
				$gettext(`You are unable to create any new posts in this community until your block gets
				lifted or expires.`)
			}}
		</div>

		<div v-if="community.user_block && community.user_block.doesExpire">
			Your block will expire in
			<b><AppTimeAgo :date="community.user_block.expires_on" without-suffix /></b>
		</div>
	</div>
</template>
