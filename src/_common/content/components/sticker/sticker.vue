<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import AppLoading from '../../../loading/loading.vue';
import { Sticker } from '../../../sticker/sticker.model';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';

@Options({
	components: {
		AppImgResponsive,
		AppLoading,
	},
})
export default class AppContentSticker extends Vue {
	@Prop({ type: Number, required: true }) stickerId!: number;
	@Prop(Boolean) isEditing!: boolean;
	@Prop(Boolean) isDisabled!: boolean;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	sticker: Sticker | null = null;
	hasError = false;
	imageLoaded = false;

	created() {
		this.owner.hydrator.useData('sticker-id', this.stickerId.toString(), data => {
			if (data) {
				this.sticker = new Sticker(data);
			} else {
				this.hasError = true;
			}
		});
	}
}
</script>

<template>
	<div class="-sticker">
		<template v-if="sticker">
			<app-img-responsive class="content-image" :src="sticker.img_url" />
		</template>
		<template v-else-if="hasError">
			<translate>Error loading sticker</translate>
		</template>
		<template v-else>
			<app-loading />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-sticker
	width: 64px
	height: 64px
</style>
