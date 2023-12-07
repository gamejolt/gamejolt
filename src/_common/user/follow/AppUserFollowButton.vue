<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { UserFollowLocation } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatNumber } from '../../filters/number';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext } from '../../translate/translate.service';
import { $toggleUserFollow, UserModel } from '../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	location: {
		type: String as PropType<UserFollowLocation>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
	sm: {
		type: Boolean,
	},
	hideCount: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
	forceHover: {
		type: Boolean,
	},
});

const emit = defineEmits({
	follow: () => true,
	unfollow: () => true,
});

const { user, hideCount, location, disabled } = toRefs(props);
const { user: sessionUser } = useCommonStore();

const isProcessing = ref(false);

const shouldShow = computed(() => {
	if (!sessionUser.value) {
		return true;
	}
	if (sessionUser.value.id !== user.value.id && !user.value.hasAnyBlock) {
		return true;
	}
	return false;
});

const badge = computed(() => {
	return !hideCount.value && user.value.follower_count
		? formatNumber(user.value.follower_count)
		: '';
});

const tooltip = computed(() => {
	return !user.value.is_following
		? $gettext(`Follow this user to get their posts in your feed!`)
		: undefined;
});

const isDisabled = computed(() => disabled.value || isProcessing.value);

async function onClick() {
	if (!sessionUser.value || isDisabled.value) {
		return;
	}

	const isFollowing = user.value.is_following !== true;
	const success = await $toggleUserFollow(user.value, location.value);
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
