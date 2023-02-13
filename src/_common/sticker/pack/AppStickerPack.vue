<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import {
	styleBorderRadiusLg,
	styleChangeBgRgba,
	styleElevate,
	styleWhen,
} from '../../../_styles/mixins';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppCurrencyPill from '../../currency/AppCurrencyPill.vue';
import { shorthandReadableTime } from '../../filters/duration';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppPopperConfirmWrapper from '../../popper/confirm-wrapper/AppPopperConfirmWrapper.vue';
import { StickerPack } from './pack.model';

interface StickerPackDetails {
	name?: boolean;
	cost?: boolean;
	contents?: boolean;
	expiry?: boolean;
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
	hoverTitle: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	clickPack: () => true,
});

const { pack, showDetails, canClickPack, forceElevate } = toRefs(props);

const showName = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.name === true;
});

const showCost = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.cost === true;
});

const showExpiry = computed(() => {
	if (!showDetails.value) {
		return false;
	}
	return showDetails.value === true || showDetails.value.expiry === true;
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
			<AppAspectRatio :ratio="pack.media_item.aspectRatio" show-overflow>
				<AppPopperConfirmWrapper
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:overlay-radius="12"
					:disabled="!canClickPack"
					:initial-text="hoverTitle"
					@confirm="onClickPack()"
				>
					<AppMediaItemBackdrop
						:style="{
							...styleWhen(forceElevate, styleElevate(1)),
							...styleWhen(canClickPack, {
								cursor: `pointer`,
							}),
						}"
						:media-item="pack.media_item"
						radius="lg"
					>
						<AppImgResponsive
							:src="pack.media_item.mediaserver_url"
							alt=""
							draggable="false"
							ondragstart="return false"
						/>
					</AppMediaItemBackdrop>

					<slot name="overlay" />
				</AppPopperConfirmWrapper>
			</AppAspectRatio>

			<div
				v-if="showCost"
				:style="{
					position: `absolute`,
					bottom: '4px',
					right: '4px',
				}"
			>
				<AppCurrencyPill currency="coins" :amount="pack.cost_coins" />
			</div>

			<div
				v-if="showExpiry && pack.ends_on"
				:style="{
					...overlayedStyle,
					right: `4px`,
					top: `4px`,
				}"
			>
				{{
					shorthandReadableTime(pack.ends_on, {
						allowFuture: true,
						precision: 'rough',
					})
				}}
			</div>
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
