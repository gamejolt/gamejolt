<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { GameFollowLocation, trackGameFollow } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { showModalConfirm } from '../../modal/confirm/confirm-service';
import AppPopper from '../../popper/AppPopper.vue';
import { useCommonStore } from '../../store/common-store';
import { $gettext } from '../../translate/translate.service';
import AppUserFollowButton from '../../user/follow/AppUserFollowButton.vue';
import { UserFollowSuggestion } from '../../user/follow/suggestion.service';
import { GameModel, followGame, unfollowGame } from '../game.model';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	location: {
		type: String as PropType<GameFollowLocation>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	circle: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
	lg: {
		type: Boolean,
	},
	solid: {
		type: Boolean,
	},
	showUserFollow: {
		type: Boolean,
	},
	hideCount: {
		type: Boolean,
	},
});

const { user } = useCommonStore();
const { game, hideCount, location, circle, showUserFollow } = toRefs(props);
const isShowingFollowPopover = ref(false);

const shouldShowFollow = computed(() => {
	if (!showUserFollow.value) {
		return false;
	}

	if (
		(user.value && user.value.id === game.value.developer.id) ||
		game.value.developer.is_following
	) {
		return false;
	}

	return true;
});

const widgetId = computed(() => `game-follow-widget-${game.value.id}`);

const badge = computed(() =>
	!circle.value && !hideCount.value && game.value.follower_count
		? formatNumber(game.value.follower_count)
		: ''
);

const tooltip = computed(() =>
	!game.value.is_following
		? $gettext(
				`Follow this game to add it to your Library and be notified when new posts are added.`
				// eslint-disable-next-line no-mixed-spaces-and-tabs
		  )
		: undefined
);

const icon = computed(() => {
	if (!circle.value) {
		return '';
	}

	return !game.value.is_following ? 'subscribe' : 'subscribed';
});

async function onClick() {
	if (!user.value) {
		return;
	}

	let failed = false;
	if (!game.value.is_following) {
		// Do this before attempting to follow.
		// We don't want to wait till the follow is confirmed to show the dialog,
		// and even if the follow fails it's not like we'll close it.
		// The user follow suggestion is not reactive, so we call it on impulse like this
		// instead of putting it in the shouldShowFollow getter.
		if (shouldShowFollow.value && UserFollowSuggestion.canSuggest(game.value.developer.id)) {
			isShowingFollowPopover.value = true;
		}

		try {
			await followGame(game.value);
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext('Something has prevented you from following this game.'));
		} finally {
			trackGameFollow(true, { failed, location: location.value });
		}
	} else {
		if (isShowingFollowPopover.value) {
			onFollowPopoverDismissed();
		}

		const result = await showModalConfirm(
			$gettext(`Are you sure you want to unfollow this game?`),
			$gettext(`Unfollow game?`)
		);

		if (!result) {
			return;
		}

		try {
			await unfollowGame(game.value);
		} catch (e) {
			failed = true;
			showErrorGrowl(
				$gettext('Uh-oh, something has prevented you from unfollowing this game.'),
				$gettext('Oh no!')
			);
		} finally {
			trackGameFollow(false, { failed, location: location.value });
		}
	}
}

function onFollowPopoverDismissed() {
	isShowingFollowPopover.value = false;

	if (!game.value.developer.is_following) {
		UserFollowSuggestion.doNotSuggest(game.value.developer.id);
	}
}
</script>

<template>
	<AppPopper
		class="game-follow-widget"
		popover-class="fill-darkest"
		trigger="manual"
		track-trigger-width
		:manual-show="isShowingFollowPopover"
		:block="block"
		@click-away="onFollowPopoverDismissed"
	>
		<AppButton
			:id="widgetId"
			v-app-auth-required
			v-app-tooltip="tooltip"
			primary
			:icon="icon"
			:circle="circle"
			:overlay="overlay"
			:block="block"
			:lg="lg"
			:solid="game.is_following || solid"
			:badge="badge"
			@click="onClick"
		>
			<template v-if="!circle">
				<template v-if="!game.is_following">
					{{ $gettext(`Follow`) }}
				</template>
				<template v-else>
					{{ $gettext(`Following`) }}
				</template>
			</template>
		</AppButton>

		<template #popover>
			<div class="well">
				<p class="small">
					{{
						$gettext(`Would you also like to follow this developer? You will get notified when
						they release new games.`)
					}}
				</p>
				<AppUserFollowButton :user="game.developer" block location="gameFollow" />
			</div>
		</template>
	</AppPopper>
</template>
