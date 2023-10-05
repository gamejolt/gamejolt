<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppGameFollowWidget from '../../../../_common/game/follow-widget/AppGameFollowWidget.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
		AppGameFollowWidget,
	},
})
export default class AppGameBadge extends Vue {
	@Prop({ type: Object, required: true }) game!: GameModel;
	@Prop({ type: Boolean, default: false }) fullBleed!: boolean;
}
</script>

<template>
	<AppTheme
		class="-game-container fill-darkest"
		:class="{ '-full-bleed': fullBleed }"
		:theme="game.theme"
	>
		<AppMediaItemBackdrop
			v-if="game.header_media_item"
			class="-backdrop"
			:media-item="game.header_media_item"
			radius="lg"
		>
			<div
				class="-header"
				:style="{
					'background-image': 'url(' + game.header_media_item.mediaserver_url + ')',
				}"
			>
				<div class="-header-gradient" />
			</div>
		</AppMediaItemBackdrop>

		<div class="-content">
			<router-link class="-link" :to="game.getUrl()" />

			<div class="-details">
				<div class="tag">
					<AppTranslate>Game</AppTranslate>
				</div>
				<div class="-name">
					{{ game.title }}
				</div>
			</div>

			<div class="-follow-button">
				<AppGameFollowWidget :game="game" overlay hide-count location="badge" />
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static

.-game-container
	clearfix()
	rounded-corners-lg()
	elevate-hover-2()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	padding: 10px 15px

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

	&.-full-bleed
		full-bleed-xs()

		@media $media-sm-up
			margin-left: -15px
			margin-right: -15px

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	transition: background-size 250ms, filter 250ms
	z-index: 0

	&-gradient
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

.-content
	display: flex
	align-items: center
	justify-content: space-between
	z-index: 1

.-details
	min-width: 0
	z-index: 1

.tag
	// This makes all the text align at the left.
	margin-left: -4px

.-name
	text-overflow()
	font-weight: bolder
	font-size: $font-size-h4
	color: var(--dark-theme-fg)

.-follow-button
	margin-left: 16px
	flex: none
	z-index: 3

.-link
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 2
</style>
