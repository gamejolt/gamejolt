<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';

@Options({
	components: {
		AppThemeSvg,
	},
})
export default class AppGameOgrsTag extends Vue {
	@Prop(Object) game!: Game;
	@Prop(Boolean) full?: boolean;

	readonly assetPaths = import.meta.glob('./*.svg', { eager: true });

	get imgTag() {
		if (this.game) {
			if (this.game.tigrs_age === 1) {
				return 'all-ages';
			} else if (this.game.tigrs_age === 2) {
				return 'teen';
			} else if (this.game.tigrs_age === 3) {
				return 'mature';
			}
		}

		return '';
	}

	get imgUrl() {
		return this.assetPaths[`./${this.imgTag}.svg`].default;
	}

	get imgTagUrl() {
		return this.assetPaths[`./${this.imgTag}-tag.svg`].default;
	}

	get imgTagHeight() {
		if (this.full) {
			return 100;
		}

		return 16;
	}
}
</script>

<template>
	<div class="game-ogrs-tag theme-dark">
		<AppThemeSvg
			class="-tag"
			:src="imgTagUrl"
			width="80"
			height="16"
			:alt="imgTag"
			strict-colors
		/>
		<template v-if="full">
			<AppThemeSvg class="-face" :src="imgUrl" width="80" height="80" alt="" strict-colors />
			<img
				class="-logo"
				:src="assetPaths['./ogrs-logo.svg'].default"
				width="76"
				height="8"
				alt="OGRS"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.game-ogrs-tag
	display: inline-block
	margin-bottom: 0
	vertical-align: middle
	border: 4px solid $black
	background: $black

	::v-deep(img)
		display: block
		margin-left: auto
		margin-right: auto

.-face
.-logo
	margin-top: 4px
</style>
