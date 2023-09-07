<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { kThemeBiBg, kThemeBiFg } from '../../../../../_common/theme/variables';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleChangeBg,
	styleFlexCenter,
	styleLineClamp,
	styleWhen,
} from '../../../../../_styles/mixins';
import { kFontSizeLarge } from '../../../../../_styles/variables';
import { showStickerEditModal } from '../../../../components/forms/sticker/modal.service';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerModel>,
		default: undefined,
	},
	stickers: {
		type: Array as PropType<StickerModel[]>,
		default: undefined,
	},
	showName: {
		type: Boolean,
	},
	currentEmojiPrefix: {
		type: String,
		default: undefined,
	},
	disabled: {
		type: Boolean,
	},
	canActivate: {
		type: Boolean,
	},
	warnDeactivate: {
		type: Boolean,
	},
});

const { sticker, stickers, showName, currentEmojiPrefix, disabled, canActivate, warnDeactivate } =
	toRefs(props);

const emit = defineEmits({
	pack: (_payloadPack: StickerPackModel | undefined) => true,
});

const hasClickAction = computed(() => !!sticker?.value || !!stickers?.value);

function onClickTile() {
	if (disabled.value) {
		return;
	}

	showStickerEditModal({
		sticker: sticker?.value || null,
		stickers: stickers?.value,
		updatePack: pack => emit('pack', pack),
		emojiPrefix: currentEmojiPrefix?.value,
		canActivate: canActivate?.value,
		warnDeactivate: warnDeactivate?.value,
	});
}
</script>

<template>
	<div>
		<div
			:style="{
				...styleBorderRadiusLg,
				...styleChangeBg('bg-offset'),
			}"
		>
			<AppAspectRatio
				:style="{
					width: `100%`,
				}"
				:ratio="1"
				:inner-styles="styleFlexCenter()"
			>
				<div
					v-if="sticker"
					:style="{
						width: `50%`,
						height: `50%`,
						position: `relative`,
						zIndex: 0,
					}"
				>
					<img
						:style="[
							'user-drag: none',
							{
								width: `100%`,
								height: `auto`,
							},
						]"
						:src="sticker.img_url"
						draggable="false"
						@mousedown.prevent
					/>
				</div>
				<template v-else>
					<slot name="no-sticker">
						<div
							:style="{
								width: `50%`,
								height: `50%`,
								position: `relative`,
								zIndex: 0,
							}"
						>
							<div
								:style="{
									...styleChangeBg('bg-offset'),
									width: `100%`,
									height: `100%`,
									borderRadius: `50%`,
								}"
							/>
						</div>
					</slot>
				</template>

				<div
					v-if="hasClickAction"
					:style="{
						...styleAbsoluteFill({
							zIndex: 1,
						}),
						...styleWhen(!disabled, {
							cursor: `pointer`,
						}),
					}"
					@click="onClickTile"
				>
					<AppJolticon
						v-if="sticker"
						icon="edit"
						:style="{
							position: `absolute`,
							top: `16px`,
							left: `16px`,
							margin: 0,
							fontSize: kFontSizeLarge.px,
						}"
					/>
				</div>

				<div
					v-if="sticker && sticker.is_active"
					:style="{
						...styleFlexCenter(),
						pointerEvents: `none`,
						position: `absolute`,
						top: `16px`,
						right: `16px`,
						width: `24px`,
						height: `24px`,
						borderRadius: `50%`,
						zIndex: 2,
						backgroundColor: kThemeBiBg,
					}"
				>
					<AppJolticon
						:style="{
							margin: 0,
							color: kThemeBiFg,
						}"
						icon="check"
					/>
				</div>
			</AppAspectRatio>
		</div>

		<div
			v-if="showName && sticker?.name"
			:title="sticker.name"
			:style="{
				...styleLineClamp(2),
				marginTop: `4px`,
				fontWeight: `bold`,
			}"
		>
			{{ sticker.name }}
		</div>
	</div>
</template>
