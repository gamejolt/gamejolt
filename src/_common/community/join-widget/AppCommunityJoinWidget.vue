<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { useGridStore } from '../../../app/components/grid/grid-store';
import { useAppStore } from '../../../app/store/index';
import { CommunityJoinLocation } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import { CommunityModel } from '../community.model';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	location: {
		type: String as PropType<CommunityJoinLocation>,
		required: true,
	},
	block: {
		type: Boolean,
	},
	hideCount: {
		type: Boolean,
	},
	solid: {
		type: Boolean,
	},
});

const { joinCommunity, leaveCommunity } = useAppStore();
const { user } = useCommonStore();
const { grid } = useGridStore();

const { community, location, hideCount } = toRefs(props);
const isProcessing = ref(false);

const badge = computed(() =>
	!hideCount.value && community.value.member_count
		? formatNumber(community.value.member_count)
		: ''
);

// Guests should always be allowed to attempt to join stuff.
// When they log in, we can check if they are actually allowed.
const canJoin = computed(() => !user.value || !!user.value.can_join_communities);

const isDisabled = computed(() => {
	if (isProcessing.value) {
		return true;
	}

	// Always allow users to leave a community
	if (community.value.is_member) {
		return false;
	}

	return !canJoin.value;
});

async function onClick() {
	if (!user.value || isProcessing.value) {
		return;
	}

	isProcessing.value = true;

	if (!community.value.is_member) {
		try {
			await joinCommunity(community.value, {
				grid: grid.value,
				location: location.value,
			});
		} catch (e) {
			console.log(e);
			let message = $gettext(`Something has prevented you from joining this community.`);
			if (e.errors && e.errors['limit-reached']) {
				message = $gettext(`You already joined too many communities!`);
			}

			showErrorGrowl(message);
		}
	} else {
		try {
			await leaveCommunity(community.value, {
				grid: grid.value,
				location: location.value,
				shouldConfirm: true,
			});
		} catch (e) {
			showErrorGrowl($gettext(`For some reason we couldn't leave this community.`));
		}
	}
	isProcessing.value = false;
}
</script>

<template>
	<AppButton
		v-app-auth-required
		v-app-tooltip="canJoin ? '' : $gettext(`You already joined too many communities`)"
		class="community-follow-widget"
		primary
		:block="block"
		:solid="community.is_member || solid"
		:badge="badge"
		:disabled="isDisabled"
		@click="onClick"
	>
		<template v-if="!community.is_member">{{ $gettext(`Join Community`) }} </template>
		<template v-else>{{ $gettext(`Joined`) }} </template>
	</AppButton>
</template>
