<script lang="ts" setup>
import { computed, HTMLAttributes, ref } from 'vue';

import { UserFollowLocation } from '~common/analytics/analytics.service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { formatNumber } from '~common/filters/number';
import { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { $toggleUserFollow, UserModel } from '~common/user/user.model';

type Props = {
	user: UserModel;
	location: UserFollowLocation;
	overlay?: boolean;
	block?: boolean;
	sm?: boolean;
	hideCount?: boolean;
	disabled?: boolean;
	forceHover?: boolean;
	icon?: Jolticon;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	user,
	location,
	overlay = false,
	block = false,
	sm = false,
	hideCount = false,
	disabled = false,
	forceHover = false,
	icon = undefined,
} = defineProps<Props>();

const emit = defineEmits<{
	follow: [];
	unfollow: [];
}>();

const { user: sessionUser } = useCommonStore();

const isProcessing = ref(false);

const shouldShow = computed(() => {
	if (!sessionUser.value) {
		return true;
	}
	if (sessionUser.value.id !== user.id && !user.hasAnyBlock) {
		return true;
	}
	return false;
});

const badge = computed(() => {
	return !hideCount && user.follower_count
		? formatNumber(user.follower_count)
		: '';
});

const tooltip = computed(() => {
	return !user.is_following
		? $gettext(`Follow this user to get their posts in your feed!`)
		: undefined;
});

const isDisabled = computed(() => disabled || isProcessing.value);

async function onClick() {
	if (!sessionUser.value || isDisabled.value) {
		return;
	}

	const isFollowing = user.is_following !== true;
	const success = await $toggleUserFollow(user, location);
	// Either failed or didn't confirm the action.
	if (!success) {
		return;
	}

	if (isFollowing) {
		emit('follow');
	} else {
		emit('unfollow');
	}
}
</script>

<template>
	<AppButton
		v-if="shouldShow"
		v-app-auth-required
		v-app-tooltip.bottom="tooltip"
		class="user-follow-widget"
		primary
		:overlay="overlay"
		:block="block"
		:sm="sm"
		:solid="user.is_following"
		:badge="badge"
		:disabled="isDisabled"
		:force-hover="forceHover"
		:icon="icon"
		@click.stop="onClick"
	>
		<template v-if="!user.is_following">
			<AppTranslate>Follow</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Following</AppTranslate>
		</template>
	</AppButton>
</template>
