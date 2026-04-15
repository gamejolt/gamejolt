<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import { GameFollowLocation, trackGameFollow } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { showModalConfirm } from '../../modal/confirm/confirm-service';
import AppPopper from '../../popper/AppPopper.vue';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import AppUserFollowButton from '../../user/follow/AppUserFollowButton.vue';
import { UserFollowSuggestion } from '../../user/follow/suggestion.service';
import { followGame, GameModel, unfollowGame } from '../game.model';

type Props = {
	game: GameModel;
	location: GameFollowLocation;
	overlay?: boolean;
	circle?: boolean;
	block?: boolean;
	lg?: boolean;
	solid?: boolean;
	primary?: boolean;
	showUserFollow?: boolean;
	hideCount?: boolean;
};

const {
	game,
	location,
	overlay = false,
	circle = false,
	block = false,
	lg = false,
	solid = false,
	primary = false,
	showUserFollow = false,
	hideCount = false,
} = defineProps<Props>();
const { user } = useCommonStore();

const isShowingFollowPopover = ref(false);

const shouldShowFollow = computed(() => {
	if (!showUserFollow) {
		return false;
	}

	if (
		(user.value && user.value.id === game.developer.id) ||
		game.developer.is_following
	) {
		return false;
	}

	return true;
});

const widgetId = toRef(() => `game-follow-widget-${game.id}`);

const badge = computed(() =>
	!circle && !hideCount && game.follower_count
		? formatNumber(game.follower_count)
		: ''
);

const tooltip = computed(() =>
	!game.is_following
		? $gettext(
				`Follow this game to add it to your Library and be notified when new posts are added.`
				// eslint-disable-next-line no-mixed-spaces-and-tabs
		  )
		: undefined
);

const icon = toRef(() => {
	if (!circle) {
		return undefined;
	}

	return !game.is_following ? 'subscribe' : 'subscribed';
});

async function onClick() {
	if (!user.value) {
		return;
	}

	let failed = false;
	if (!game.is_following) {
		// Do this before attempting to follow.
		// We don't want to wait till the follow is confirmed to show the dialog,
		// and even if the follow fails it's not like we'll close it.
		// The user follow suggestion is not reactive, so we call it on impulse like this
		// instead of putting it in the shouldShowFollow getter.
		if (shouldShowFollow.value && UserFollowSuggestion.canSuggest(game.developer.id)) {
			isShowingFollowPopover.value = true;
		}

		try {
			await followGame(game);
		} catch (e) {
			failed = true;
			showErrorGrowl($gettext('Something has prevented you from following this game.'));
		} finally {
			trackGameFollow(true, { failed, location: location });
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
			await unfollowGame(game);
		} catch (e) {
			failed = true;
			showErrorGrowl(
				$gettext('Uh-oh, something has prevented you from unfollowing this game.'),
				$gettext('Oh no!')
			);
		} finally {
			trackGameFollow(false, { failed, location: location });
		}
	}
}

function onFollowPopoverDismissed() {
	isShowingFollowPopover.value = false;

	if (!game.developer.is_following) {
		UserFollowSuggestion.doNotSuggest(game.developer.id);
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
