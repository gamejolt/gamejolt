<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import { GameTrophy } from '../../../../_common/game/trophy/trophy.model';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppTrophyThumbnail,
		AppTimeAgo,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppTrophyList extends Vue {
	@Prop(Array) trophies!: GameTrophy[];
	@Prop(Array) achieved!: UserGameTrophy[];

	readonly formatNumber = formatNumber;

	get achievedIndexed() {
		return UserGameTrophy.indexAchieved(this.achieved);
	}
}
</script>

<template>
	<div class="trophy-list">
		<div v-for="trophy of trophies" :key="trophy.id" class="trophy-list-item">
			<div class="trophy-list-item-thumbnail">
				<AppTrophyThumbnail :trophy="trophy" :is-achieved="!!achievedIndexed[trophy.id]" />
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
						<AppTranslate>Achieve this trophy to view the description.</AppTranslate>
					</em>
				</div>

				<div class="trophy-list-item-meta">
					<span
						v-app-tooltip="$gettext(`The amount of EXP gained from this trophy.`)"
						class="text-muted"
					>
						<AppJolticon icon="exp" class="middle" />
						{{ ' ' + formatNumber(trophy.experience) + ' ' }}
						<AppTranslate
							class="small"
							translate-comment="As in abbreviation for experience. If one doesnt exist for your language, or if its not a short word just leave it as EXP."
						>
							EXP
						</AppTranslate>
					</span>

					<template v-if="achievedIndexed[trophy.id]">
						<span class="dot-separator hidden-xs" />
						<br class="visible-xs" />

						<span class="tag tag-highlight">
							<AppTranslate>Achieved!</AppTranslate>
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
