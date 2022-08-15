<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { Game } from '../../../../_common/game/game.model';
import { GameRating } from '../../../../_common/game/rating/rating.model';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { LikersModal } from '../../../../_common/likers/modal.service';
import { EventTopic } from '../../../../_common/system/event/event-topic';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';

export const RatingWidgetOnChange = 'GameRating.changed';
export interface RatingWidgetOnChangePayload {
	gameId: number;
	userRating?: GameRating;
}

export const onRatingWidgetChange = new EventTopic<RatingWidgetOnChangePayload>();

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
	},
})
export default class AppRatingWidget extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop(Object)
	userRating?: GameRating;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop(String)
	eventLabel?: string;

	readonly formatFuzzynumber = formatFuzzynumber;

	get hasLiked() {
		return this.userRating && this.userRating.rating === GameRating.RATING_LIKE;
	}

	get hasDisliked() {
		return this.userRating && this.userRating.rating === GameRating.RATING_DISLIKE;
	}

	showLikers() {
		LikersModal.show({ count: this.game.like_count, resource: this.game });
	}

	like() {
		Analytics.trackEvent('game-rating', 'like', this.eventLabel);
		this.updateVote(GameRating.RATING_LIKE);
	}

	dislike() {
		Analytics.trackEvent('game-rating', 'dislike', this.eventLabel);
		this.updateVote(GameRating.RATING_DISLIKE);
	}

	private async updateVote(rating: number) {
		// when a rating with the same value already exists, remove it instead
		const oldUserRating = this.userRating;
		let operation = 0;

		try {
			if (oldUserRating && oldUserRating.rating === rating) {
				if (rating === GameRating.RATING_LIKE) {
					operation = -1;
				}

				this.game.like_count += operation;

				onRatingWidgetChange.next({
					gameId: this.game.id,
					userRating: undefined,
				});

				await oldUserRating.$remove();
			} else {
				const newUserRating = new GameRating({
					game_id: this.game.id,
					rating: rating,
				});

				// We only show likes, not dislikes.
				const oldRating = oldUserRating ? oldUserRating.rating : null;
				if (rating === GameRating.RATING_LIKE) {
					operation = 1;
				} else if (oldRating === GameRating.RATING_LIKE) {
					operation = -1;
				}

				this.game.like_count += operation;

				onRatingWidgetChange.next({
					gameId: this.game.id,
					userRating: newUserRating,
				});

				await newUserRating.$save();
			}
		} catch (e) {
			console.error(e);
			this.game.like_count -= operation;
			onRatingWidgetChange.next({
				gameId: this.game.id,
				userRating: oldUserRating,
			});
			showErrorGrowl(this.$gettext(`Can't do that right now. Try again later?`));
		}
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
				class="blip"
				:class="{ 'blip-active': userRating }"
				@click="showLikers()"
				v-app-tooltip="$gettext(`View all people that liked this game`)"
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
