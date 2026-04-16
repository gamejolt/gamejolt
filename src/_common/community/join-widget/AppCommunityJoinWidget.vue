<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useGridStore } from '~app/components/grid/grid-store';
import { useAppStore } from '~app/store/index';
import { CommunityJoinLocation } from '~common/analytics/analytics.service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel } from '~common/community/community.model';
import { formatNumber } from '~common/filters/number';
import { showErrorGrowl } from '~common/growls/growls.service';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	community: CommunityModel;
	location: CommunityJoinLocation;
	block?: boolean;
	hideCount?: boolean;
	solid?: boolean;
	disabled?: boolean;
};

const {
	community,
	location,
	block = false,
	hideCount = false,
	solid = false,
	disabled = false,
} = defineProps<Props>();

const { joinCommunity, leaveCommunity } = useAppStore();
const { user } = useCommonStore();
const { grid } = useGridStore();

const isProcessing = ref(false);

const badge = computed(() =>
	!hideCount && community.member_count
		? formatNumber(community.member_count)
		: ''
);

// Guests should always be allowed to attempt to join stuff.
// When they log in, we can check if they are actually allowed.
const canJoin = computed(
	() => !user.value || (!!user.value.can_join_communities && !community.user_block)
);

const isDisabled = computed(() => {
	if (disabled || isProcessing.value) {
		return true;
	}

	// Always allow users to leave a community
	if (community.is_member) {
		return false;
	}

	return !canJoin.value;
});

async function onClick() {
	if (!user.value || isProcessing.value) {
		return;
	}

	isProcessing.value = true;

	if (!community.is_member) {
		try {
			await joinCommunity(community, {
				grid: grid.value,
				location: location,
			});
		} catch (e: any) {
			console.log(e);
			let message = $gettext(`Something has prevented you from joining this community.`);
			if (e.errors && e.errors['limit-reached']) {
				message = $gettext(`You already joined too many communities!`);
			}

			showErrorGrowl(message);
		}
	} else {
		try {
			await leaveCommunity(community, {
				grid: grid.value,
				location: location,
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
