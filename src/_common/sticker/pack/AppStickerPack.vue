<script lang="ts">
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import { shorthandReadableTime } from '../../filters/duration';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { StickerPack } from './pack.model';

export const StickerPackRatio = 2 / 3;
</script>

<script lang="ts" setup>
interface StickerPackDetails {
	name?: boolean;
}

type PackDetailsOptions = boolean | StickerPackDetails;

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPack>,
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
	expiryInfo: {
		type: Number,
		default: undefined,
	},
});

const emit = defineEmits({
	clickPack: () => true,
});

const { pack, showDetails, canClickPack, forceElevate, expiryInfo } = toRefs(props);

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

const overlayedStyle: CSSProperties = {
	...styleChangeBgRgba(`0, 0, 0`, 0.54),
	...styleBorderRadiusLg,
	position: `absolute`,
	padding: `2px 6px`,
	color: `white`,
	fontWeight: 700,
};
</script>

<template>
	<!-- AppStickerPack -->
	<div>
		<div :style="{ position: `relative` }">
			<component :is="canClickPack ? 'a' : 'div'" @click="onClickPack()">
				<AppAspectRatio :ratio="StickerPackRatio" show-overflow>
					<AppMediaItemBackdrop
						:style="{
							...styleWhen(forceElevate, styleElevate(1)),
							...styleWhen(canClickPack, {
								cursor: `pointer`,
							}),
							width: `100%`,
							height: `100%`,
						}"
						:media-item="pack.media_item"
						radius="lg"
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
						/>
					</AppMediaItemBackdrop>
				</AppAspectRatio>
			</component>

			<div
				v-if="expiryInfo"
				:style="{
					...overlayedStyle,
					right: `4px`,
					top: `4px`,
				}"
			>
				{{
					shorthandReadableTime(expiryInfo, {
						allowFuture: true,
						precision: 'rough',
						nowText: $gettext(`Expired`),
					})
				}}
			</div>

			<slot name="overlay-children" />
		</div>

		<div
			v-if="showName"
			:style="{
				marginTop: `8px`,
				fontWeight: 700,
			}"
		>
			{{ pack.name }}
		</div>
	</div>
</template>
