<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppImgResponsive from '../../../../../../_common/img/AppImgResponsive.vue';
import { MediaItemModel } from '../../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppFormPostMediaItem extends Vue {
	@Prop(Object)
	item!: MediaItemModel;

	width = 'auto';
	height = 'auto';

	@Emit('remove')
	emitRemove() {}

	created() {
		const dimensions = this.item.getDimensions(300, 130);
		this.width = dimensions.width + 'px';
		this.height = dimensions.height + 'px';
	}
}
</script>

<template>
	<div class="-item" :style="{ width, height }">
		<div class="-controls theme-dark">
			<AppButton icon="remove" overlay sparse @click.capture="emitRemove()" />
		</div>

		<AppImgResponsive :src="item.mediaserver_url" alt="" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-item
	rounded-corners-lg()
	change-bg('bg-subtle')
	position: relative
	display: inline-block
	vertical-align: top
	cursor: move
	// Spacing through margins.
	margin-right: $-padding

	&:last-child
		margin-right: 0

	img
		rounded-corners-lg()
		z-index: 1

.-controls
	position: absolute
	top: 3px
	right: 3px
	z-index: 2
</style>
