<script lang="ts" setup>
import { computed } from 'vue';

import { formatNumber } from '~common/filters/number';
import { GameTrophyModel } from '~common/game/trophy/trophy.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTrophyThumbnail from '~common/trophy/thumbnail/AppTrophyThumbnail.vue';
import {
	indexAchievedGameTrophies,
	UserGameTrophyModel,
} from '~common/user/trophy/game-trophy.model';

type Props = {
	trophies: GameTrophyModel[];
	achieved: UserGameTrophyModel[];
};
const { achieved } = defineProps<Props>();

const achievedIndexed = computed(() => indexAchievedGameTrophies(achieved));
</script>

<template>
	<div class="trophy-list">
		<div v-for="trophy of trophies" :key="trophy.id" class="trophy-list-item">
			<div class="trophy-list-item-thumbnail">
				<AppTrophyThumbnail :trophy="trophy" />
			</div>

			<div class="trophy-list-item-content">
				<h4 class="trophy-list-item-heading sans-margin">
					{{ trophy.title }}
				</h4>

				<!--
					We have to keep the trophy description secret unless they've achieved it, or if they're the dev.
					The API should return garbage for the description, so let's put our own text in there.
				-->
				<div
					v-if="!trophy.secret || achievedIndexed[trophy.id]"
					class="trophy-list-item-description small"
				>
					{{ trophy.description }}
				</div>

				<div v-else class="trophy-list-item-description small text-muted">
					<em>
						{{ $gettext(`Achieve this trophy to view the description.`) }}
					</em>
				</div>

				<div class="trophy-list-item-meta">
					<span
						v-app-tooltip="$gettext(`The amount of EXP gained from this trophy.`)"
						class="text-muted"
					>
						<AppJolticon icon="exp" class="middle" />
						{{ ' ' + formatNumber(trophy.experience) + ' ' }}
						{{ $gettext(`EXP`) }}
					</span>

					<template v-if="achievedIndexed[trophy.id]">
						<span class="dot-separator hidden-xs" />
						<br class="visible-xs" />

						<span class="tag tag-highlight">
							{{ $gettext(`Achieved!`) }}
						</span>
						<span class="dot-separator" />
						<small class="text-muted">
							<AppTimeAgo :date="achievedIndexed[trophy.id].logged_on" />
						</small>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$trophy-list-thumbnail-size-xs = 70px
$trophy-list-thumbnail-size = 100px
$trophy-list-gutter-xs = ($grid-gutter-width-xs / 2)
$trophy-list-gutter = ($grid-gutter-width / 2)

.trophy-list-item
	clearfix()

.trophy-list-item + .trophy-list-item
	margin-top: $line-height-computed

.trophy-list-item-thumbnail
	float: left
	width: $trophy-list-thumbnail-size-xs

.trophy-list-item-content
	margin-left: $trophy-list-thumbnail-size-xs + $trophy-list-gutter-xs

@media $media-sm-up
	.trophy-list-item-thumbnail
		width: $trophy-list-thumbnail-size

	.trophy-list-item-content
		margin-left: $trophy-list-thumbnail-size + $trophy-list-gutter

	.trophy-list-item-description
		margin-bottom: $font-size-base
</style>
