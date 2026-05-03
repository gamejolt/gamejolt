<script lang="ts">
import { computed, onMounted } from 'vue';

import { trackExperimentEngagement } from '~common/analytics/analytics.service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import AppButton from '~common/button/AppButton.vue';
import { configGuestNoAuthRequired } from '~common/config/config.service';
import { formatFuzzynumber } from '~common/filters/fuzzynumber';
import { GameModel } from '~common/game/game.model';
import {
	$removeGameRating,
	$saveGameRating,
	GameRatingModel,
} from '~common/game/rating/rating.model';
import { GameRatingValueDislike, GameRatingValueLike } from '~common/game/rating/rating.model';
import { showErrorGrowl } from '~common/growls/growls.service';
import { showLikersModal } from '~common/likers/modal.service';
import { EventTopic } from '~common/system/event/event-topic';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

export const RatingWidgetOnChange = 'GameRating.changed';
export interface RatingWidgetOnChangePayload {
	gameId: number;
	userRating?: GameRatingModel;
}

export const onRatingWidgetChange = new EventTopic<RatingWidgetOnChangePayload>();
</script>

<script lang="ts" setup>
type Props = {
	game: GameModel;
	userRating?: GameRatingModel;
	hideCount?: boolean;
};
const { game, userRating, hideCount } = defineProps<Props>();

const hasLiked = computed(() => userRating?.rating === GameRatingValueLike);
const hasDisliked = computed(() => userRating?.rating === GameRatingValueDislike);

onMounted(() => {
	trackExperimentEngagement(configGuestNoAuthRequired);
});

function showLikers() {
	showLikersModal({ count: game.like_count, resource: game });
}

function like() {
	updateVote(GameRatingValueLike);
}

function dislike() {
	updateVote(GameRatingValueDislike);
}

async function updateVote(rating: number) {
	// when a rating with the same value already exists, remove it instead
	const oldUserRating = userRating;
	let operation = 0;

	try {
		if (oldUserRating?.rating === rating) {
			if (rating === GameRatingValueLike) {
				operation = -1;
			}

			game.like_count += operation;

			onRatingWidgetChange.next({
				gameId: game.id,
				userRating: undefined,
			});

			await $removeGameRating(oldUserRating);
		} else {
			const newUserRating = new GameRatingModel({
				game_id: game.id,
				rating: rating,
			});

			// We don't show dislikes, only the amount of likes.
			// no old rating, new rating like => +1
			// no old rating, new rating dislike => 0
			// old rating dislike, new rating like => +1
			// old rating like, new rating dislike => -1
			const oldRating = oldUserRating ? oldUserRating.rating : null;
			if (rating === GameRatingValueLike) {
				operation = 1;
			} else if (oldRating === GameRatingValueLike) {
				operation = -1;
			}

			game.like_count += operation;

			onRatingWidgetChange.next({
				gameId: game.id,
				userRating: newUserRating,
			});

			await $saveGameRating(newUserRating);
		}
	} catch (e) {
		console.error(e);
		game.like_count -= operation;
		onRatingWidgetChange.next({
			gameId: game.id,
			userRating: oldUserRating,
		});
		showErrorGrowl($gettext(`Can't do that right now. Try again later?`));
	}
}
</script>

<template>
	<div v-if="!configGuestNoAuthRequired.value" class="rating-widget">
		<span v-app-auth-required>
			<AppButton
				class="-like-button"
				icon="thumbs-up"
				circle
				trans
				:primary="hasLiked"
				:solid="hasLiked"
				@click="like()"
			/>
		</span>

		<template v-if="!hideCount">
			<a
				v-if="game.like_count > 0"
				v-app-tooltip="$gettext(`View all people that liked this game`)"
				class="blip"
				:class="{ 'blip-active': userRating }"
				@click="showLikers()"
			>
				{{ formatFuzzynumber(game.like_count) }}
			</a>
			<span v-else class="blip-missing" />
		</template>
		<span v-else class="blip-missing" />

		<span v-app-auth-required>
			<AppButton
				icon="thumbs-down"
				circle
				trans
				:primary="hasDisliked"
				:solid="hasDisliked"
				@click="dislike()"
			/>
		</span>
	</div>
</template>
