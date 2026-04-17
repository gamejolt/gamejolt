<script lang="ts">
import { CSSProperties, ref } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { kFontSizeSmall } from '~styles/variables';

export const StickerPackRatio = 2 / 3;

/**
 * Styles for the expiry ribbon on a sticker pack. Use with the
 * `change-bg-black-54` class (from tailwind.css) to get the translucent
 * background.
 */
export const StickerPackExpiryStyles: CSSProperties = {
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
type Props = {
	pack: StickerPackModel;
	showName?: boolean;
	canClickPack?: boolean;
	forceElevate?: boolean;
};
const { canClickPack } = defineProps<Props>();

const emit = defineEmits<{
	clickPack: [];
}>();

const loadedImage = ref(false);

function onClickPack() {
	if (canClickPack) {
		emit('clickPack');
	}
}
</script>

<template>
	<div>
		<div class="relative">
			<a :class="{ '!cursor-[inherit]': !canClickPack }" @click="onClickPack()">
				<AppAspectRatio :ratio="StickerPackRatio" show-overflow>
					<AppMediaItemBackdrop
						:class="[
							'elevate-transition',
							{ 'shadow-elevate-xs': forceElevate, 'cursor-pointer': canClickPack },
						]"
						:style="{
							width: `100%`,
							height: `100%`,
						}"
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
							@dragstart.prevent
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
