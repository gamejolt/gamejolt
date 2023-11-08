<script lang="ts">
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import { kFontSizeSmall } from '../../../_styles/variables';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { StickerPackModel } from './pack.model';

export const StickerPackRatio = 2 / 3;

export const StickerPackExpiryStyles: CSSProperties = {
	...styleChangeBgRgba(`0, 0, 0`, 0.54),
	...styleBorderRadiusLg,
	position: `absolute`,
	padding: `2px 6px`,
	color: `white`,
	fontWeight: 700,
	fontSize: kFontSizeSmall.px,
	right: `4px`,
	top: `4px`,
};
</script>

<script lang="ts" setup>
interface StickerPackDetails {
	name?: boolean;
}

type PackDetailsOptions = boolean | StickerPackDetails;

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPackModel>,
		required: true,
	},
	showDetails: {
		type: [Object, Boolean] as PropType<PackDetailsOptions>,
		default: false,
	},
	canClickPack: {
		type: Boolean,
	},
	forceElevate: {
		type: Boolean,
	},
	borderRadius: {
		type: Number,
		default: undefined,
	},
});

const emit = defineEmits({
	clickPack: () => true,
});

const { pack, showDetails, canClickPack, forceElevate } = toRefs(props);

const loadedImage = ref(false);

const showName = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.name === true;
});

function onClickPack() {
	if (canClickPack.value) {
		emit('clickPack');
	}
}
</script>

<template>
	<div>
		<div :style="{ position: `relative` }">
			<a
				:style="
					styleWhen(!canClickPack, {
						// Do this instead of a <component> tag to prevent image flickering.
						cursor: `inherit`,
					})
				"
				@click="onClickPack()"
			>
				<AppAspectRatio :ratio="StickerPackRatio" show-overflow>
					<AppMediaItemBackdrop
						:style="[
							styleWhen(forceElevate, styleElevate(1)),
							styleWhen(canClickPack, {
								cursor: `pointer`,
							}),
							{
								width: `100%`,
								height: `100%`,
							},
						]"
						:media-item="pack.media_item"
						:color-opacity="loadedImage ? 0 : 1"
					>
						<AppImgResponsive
							:src="pack.media_item.mediaserver_url"
							:style="{
								width: `100%`,
								height: `100%`,
								objectFit: `cover`,
							}"
							alt=""
							draggable="false"
							ondragstart="return false"
							@imgloadchange="loadedImage = $event"
						/>
					</AppMediaItemBackdrop>
				</AppAspectRatio>
			</a>

			<slot name="overlay-children" />
		</div>

		<div
			v-if="showName"
			:style="{
				marginTop: `4px`,
				fontWeight: 700,
			}"
		>
			{{ pack.name }}
		</div>
	</div>
</template>
