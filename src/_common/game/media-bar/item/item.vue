<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppImgResponsive from '../../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../../media-item/backdrop/AppMediaItemBackdrop.vue';

export const MediaBarItemMaxHeight = 150;

@Options({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
})
export default class AppGameMediaBarItem extends Vue {
	@Prop(Object) item!: any;

	width = 'auto';
	height = 'auto';

	created() {
		// We set the dimensions on the thumbnails manually.
		// This way we can size it correct before it loads.
		if (this.item.media_type === 'image') {
			const dimensions = this.item.media_item.getDimensions(400, MediaBarItemMaxHeight);
			this.width = dimensions.width + 'px';
			this.height = dimensions.height + 'px';
		} else if (this.item.media_type === 'sketchfab') {
			// Sketchfab thumbnails are hardcoded to this width.
			this.height = `${MediaBarItemMaxHeight}px`;
			this.width = MediaBarItemMaxHeight / 0.5625 + 'px';
		} else {
			// Video thumbnails are hardcoded to this width.
			this.width = '200px';
		}
	}
}
</script>

<template>
	<div class="media-bar-item" :style="{ width, height }">
		<a class="-wrapper" :style="{ height }">
			<slot />
			<AppMediaItemBackdrop class="-backdrop" :media-item="item.media_item" radius="lg">
				<AppImgResponsive
					v-if="item.media_type !== 'sketchfab'"
					:src="item.img_thumbnail"
					:title="item.media_type == 'image' ? item.caption : item.title"
					alt=""
				/>

				<img v-else class="img-responsive" :src="item.img_thumbnail" alt="" />
			</AppMediaItemBackdrop>

			<span class="-play" v-if="item.media_type === 'video'">
				<AppJolticon icon="play" />
			</span>

			<span class="-play" v-if="item.media_type === 'sketchfab'">
				<AppJolticon icon="sketchfab" />
			</span>
		</a>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
