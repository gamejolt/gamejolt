<script lang="ts">
import { PropType, computed, toRefs } from 'vue';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import AppButton from '../../button/AppButton.vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { showErrorGrowl } from '../../growls/growls.service';
import { showLikersModal } from '../../likers/modal.service';
import { EventTopic } from '../../system/event/event-topic';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import { Game } from '../game.model';
import { GameRating, GameRatingValue } from './rating.model';

export const RatingWidgetOnChange = 'GameRating.changed';
export interface RatingWidgetOnChangePayload {
	gameId: number;
	userRating?: GameRating;
}

export const onRatingWidgetChange = new EventTopic<RatingWidgetOnChangePayload>();
</script>

<script lang="ts" setup>
const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
	userRating: {
		type: Object as PropType<GameRating>,
		default: undefined,
	},
	hideCount: {
		type: Boolean,
	},
});

const { game, userRating, hideCount } = toRefs(props);

const hasLiked = computed(() => userRating?.value?.rating === GameRatingValue.Like);
const hasDisliked = computed(() => userRating?.value?.rating === GameRatingValue.Dislike);

function showLikers() {
	showLikersModal({ count: game.value.like_count, resource: game.value });
}

function like() {
	updateVote(GameRatingValue.Like);
}

function dislike() {
	updateVote(GameRatingValue.Dislike);
}

async function updateVote(rating: number) {
	// when a rating with the same value already exists, remove it instead
	const oldUserRating = userRating?.value;
	let operation = 0;

	try {
		if (oldUserRating?.rating === rating) {
			if (rating === GameRatingValue.Like) {
				operation = -1;
			}

			game.value.like_count += operation;

			onRatingWidgetChange.next({
				gameId: game.value.id,
				userRating: undefined,
			});

			await oldUserRating.$remove();
		} else {
			const newUserRating = new GameRating({
				game_id: game.value.id,
				rating: rating,
			});

			// We don't show dislikes, only the amount of likes.
			// no old rating, new rating like => +1
			// no old rating, new rating dislike => 0
			// old rating dislike, new rating like => +1
			// old rating like, new rating dislike => -1
			const oldRating = oldUserRating ? oldUserRating.rating : null;
			if (rating === GameRatingValue.Like) {
				operation = 1;
			} else if (oldRating === GameRatingValue.Like) {
				operation = -1;
			}

			game.value.like_count += operation;

			onRatingWidgetChange.next({
				gameId: game.value.id,
				userRating: newUserRating,
			});

			await newUserRating.$save();
		}
	} catch (e) {
		console.error(e);
		game.value.like_count -= operation;
		onRatingWidgetChange.next({
			gameId: game.value.id,
			userRating: oldUserRating,
		});
		showErrorGrowl($gettext(`Can't do that right now. Try again later?`));
	}
}
</script>

<template>
	<div class="rating-widget">
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
