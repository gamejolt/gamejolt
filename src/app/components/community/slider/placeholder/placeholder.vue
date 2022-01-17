<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppCommunitySliderPlaceholder extends Vue {
	// How many community placeholders we want, not including Add or Discover.
	@Prop({ type: Number, required: true })
	num!: number;

	/**
	 * Adds a second non-community bubble
	 * if we want the 'add' placeholder to show.
	 */
	@Prop({ type: Boolean, default: false })
	withAddButton!: number;
}
</script>

<template>
	<div class="-list">
		<app-scroll-scroller class="-scroller" thin horizontal>
			<div class="-flex">
				<template v-for="n in num" :key="n">
					<div class="-container">
						<div class="-item" />
						<div class="-text" />
					</div>
				</template>

				<div v-if="withAddButton" class="-container">
					<div class="-item" />
				</div>
				<div class="-container">
					<div class="-item -last" />
				</div>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" src="./placeholder.styl" scoped></style>
