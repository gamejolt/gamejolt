<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { trackUserFollow, UserFollowLocation } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppTranslate from '../../translate/AppTranslate.vue';
import { $gettext } from '../../translate/translate.service';
import { followUser, unfollowUser, User } from '../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<User>,
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
});

const emit = defineEmits({
	follow: () => true,
	unfollow: () => true,
});

const { user, hideCount, location } = toRefs(props);
const { user: sessionUser } = useCommonStore();

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

async function onClick() {
	if (!sessionUser.value) {
		return;
	}

	let failed = false,
		result: boolean | undefined = undefined;

	if (!user.value.is_following) {
		try {
			await followUser(user.value);
			emit('follow');
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext(`Something has prevented you from following this user.`));
		} finally {
			trackUserFollow(true, { failed, location: location.value });
		}
	} else {
		try {
			result = await ModalConfirm.show(
				$gettext(`Are you sure you want to unfollow this user?`),
				$gettext(`Unfollow user?`)
			);

			if (!result) {
				return;
			}

			await unfollowUser(user.value);
			emit('unfollow');
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext(`For some reason we couldn't unfollow this user.`));
		} finally {
			// Finally is always triggered, even if you return early, so we
			// don't want to track if they canceled.
			if (result !== undefined) {
				trackUserFollow(false, { failed, location: location.value });
			}
		}
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
		:disabled="disabled"
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
