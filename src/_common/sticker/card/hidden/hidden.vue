<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppStickerCardHidden extends Vue {
	@Prop({ type: Number, default: 0 }) count!: number;
	@Prop({ type: Boolean, default: false }) disabled!: boolean;
}
</script>

<template>
	<div class="-card" :class="{ '-redeemable': !disabled, '-disabled': disabled }">
		<div class="-img">
			<AppJolticon class="-icon jolticon-3x" icon="sticker" />
		</div>
		<div class="-pocket fill-darkest">
			<AppTranslate
				:translate-n="count + 1"
				:translate-params="{ count: count }"
				translate-plural="Unlock %{count}"
			>
				Unlocking...
			</AppTranslate>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-redeemable
	elevate-hover-1()

.-disabled
	cursor: not-allowed
	opacity: 0.5

.-card
	change-bg('bg-offset')
	rounded-corners-lg()
	width: 150px
	position: relative
	overflow: hidden

.-img
	margin: 12px
	width: 126px
	height: 126px
	display: flex
	justify-content: center
	align-items: center

.-pocket
	padding: 12px
	display: flex
	flex-direction: column
	align-items: center
	font-weight: bold
</style>
