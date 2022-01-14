<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppEditableOverlay,
	},
})
export default class AppCommunityChannelCardEdit extends Vue {
	@Prop({ type: Object, default: null }) background!: MediaItem | null;

	@Emit('click') emitClick() {}

	onClickEdit() {
		this.emitClick();
	}
}
</script>

<template>
	<app-editable-overlay class="-background-overlay" @click="onClickEdit">
		<template #overlay>
			<span>
				<translate>Change Background</translate>
			</span>
		</template>

		<template #default>
			<div class="-background-preview">
				<img
					v-if="background"
					:src="background.mediaserver_url"
					:alt="background.mediaserver_url"
				/>
			</div>
		</template>
	</app-editable-overlay>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-background-overlay
	rounded-corners-lg()
	overflow: hidden
	width: $card-width
	height: $card-height

.-background-preview
	rounded-corners-lg()
	display: flex
	align-items: center
	width: $card-width
	height: $card-height
	overflow: hidden

	img
		width: 100%
</style>
