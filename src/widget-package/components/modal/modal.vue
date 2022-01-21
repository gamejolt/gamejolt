<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppModal extends Vue {
	@Prop(Boolean) hideClose!: boolean;

	@Emit('close')
	emitClose() {}

	close() {
		this.emitClose();
	}
}
</script>

<!-- TODO(vue3): check to make sure the animation still triggers like this -->
<template>
	<app-scroll-scroller class="-modal fill-darker anim-fade-in-shrink anim-fade-leave-enlarge">
		<app-button v-if="!hideClose" sm sparse icon="remove" class="-close" @click="close" />
		<slot />
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
.-modal
	rounded-corners()
	position: absolute
	top: $shell-padding
	right: $shell-padding
	bottom: $shell-padding
	left: $shell-padding
	padding: $grid-gutter-width
	box-shadow: 0 0 5px $black
	border: 1px solid $gray
	z-index: 10

.-close
	float: right
	margin-left: $shell-padding
	margin-bottom: $shell-padding
</style>
