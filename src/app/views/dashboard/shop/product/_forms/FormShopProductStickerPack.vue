<script lang="ts" setup>
import { CSSProperties, Ref, computed, ref, toRefs, watch } from 'vue';
import AppAlertBox from '../../../../../../_common/alert/AppAlertBox.vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { storeModelList } from '../../../../../../_common/model/model-store.service';
import AppOnHover from '../../../../../../_common/on/AppOnHover.vue';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import AppStickerStackItem from '../../../../../../_common/sticker/stack/AppStickerStackItem.vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeBg, kThemeBgOffset, kThemeFg } from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '../../../../../../_styles/mixins';
import { kStrongEaseOut } from '../../../../../../_styles/variables';
import FormShopProductBase, {
	ShopProductPaymentType,
	createShopProductBaseForm,
} from './FormShopProductBase.vue';
import { showFormStickerSelectorModal } from './_sticker-selector/modal.service';

const props = defineProps({
	...defineFormProps<StickerPackModel>(),
});

const { model } = toRefs(props);

const minStickers = ref(3);
const maxStickers = ref(5);
const stickers = ref([]) as Ref<StickerModel[]>;

const data = createShopProductBaseForm({
	typename: 'Sticker_Pack',
	baseModel: model?.value,
	fields: {
		stickers: [] as number[],
	},
	complexFields: ['stickers'],
	onLoad(payload) {
		minStickers.value = payload.minStickers || minStickers.value;
		maxStickers.value = payload.maxStickers || maxStickers.value;
		_setStickers(true, storeModelList(StickerModel, payload.currentStickers));
	},
});

const { form, paymentType } = data;

const stickersError = computed(() => {
	if (stickers.value.length < minStickers.value) {
		return $gettext(`You must have at least %{ count } sticker(s) in a pack.`, {
			count: minStickers.value,
		});
	} else if (stickers.value.length > maxStickers.value) {
		// This shouldn't really happen, but better to be safe.
		return $gettext(`You can only have %{ count } sticker in a pack. Please remove some.`, {
			count: maxStickers.value,
		});
	}

	return null;
});

watch(stickersError, stickersError => {
	if (stickersError) {
		form.setCustomError('stickers');
	} else {
		form.clearCustomError('stickers');
	}
});

function _setStickers(isInitial: boolean, newStickers: StickerModel[] | undefined) {
	if (!newStickers || !newStickers.length) {
		return;
	}

	stickers.value = newStickers;
	form.formModel.stickers = stickers.value.map(i => i.id);

	if (!isInitial) {
		form.triggerChanged();
	}
}

async function addStickers() {
	// Will return all the stickers (the current in pack as well as new).
	const newStickers = await showFormStickerSelectorModal({
		stickerPackId: model?.value?.id,
		premium: paymentType.value === ShopProductPaymentType.Premium,
		currentStickers: stickers.value,
		availableSlots: maxStickers.value,
	});

	_setStickers(false, newStickers);
}

async function removeSticker(sticker: StickerModel) {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove this sticker from the pack?`)
	);
	if (!result) {
		return;
	}

	_setStickers(
		false,
		stickers.value.filter(i => i !== sticker)
	);
}

const stickerGridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
	gap: `12px`,
};

const stickerItemStyles: CSSProperties = {
	...styleBorderRadiusLg,
	backgroundColor: kThemeBgOffset,
	padding: `12px`,
	position: `relative`,
};
</script>

<template>
	<FormShopProductBase :data="data">
		<template #default>
			<h2>{{ $gettext(`Stickers`) }}</h2>

			<div>
				<AppButton solid :disabled="stickers.length >= maxStickers" @click="addStickers()">
					{{ $gettext(`Add stickers`) }}
				</AppButton>
			</div>
			<AppSpacer vertical :scale="4" />

			<template v-if="stickers.length >= maxStickers">
				<AppAlertBox fill-color="offset" icon="info-circle">
					{{
						$gettext(
							`You've reached the limit of how many stickers you can add into this pack.`
						)
					}}
				</AppAlertBox>
				<AppSpacer vertical :scale="4" />
			</template>

			<div :style="stickerGridStyles">
				<AppOnHover
					v-for="sticker of stickers"
					:key="sticker.id"
					v-slot="{ hoverBinding, hovered }"
				>
					<div v-bind="hoverBinding" :style="stickerItemStyles">
						<div
							:style="[
								{
									position: `absolute`,
									padding: `20px`,
									top: `-${20 + 8}px`,
									right: `-${20 + 8}px`,
									opacity: 0,
									transform: `scale(0)`,
									transition: `all 300ms ${kStrongEaseOut}`,
									pointerEvents: `none`,
									cursor: `pointer`,
								},
								styleWhen(hovered, {
									opacity: 1,
									transform: `scale(1)`,
									pointerEvents: `initial`,
								}),
							]"
							@click="removeSticker(sticker)"
						>
							<div
								:style="[
									styleFlexCenter(),
									{
										width: `30px`,
										height: `30px`,
										borderRadius: `50%`,
										backgroundColor: kThemeFg,
										color: kThemeBg,
									},
								]"
							>
								<AppJolticon icon="remove" />
							</div>
						</div>
						<AppStickerStackItem :img-url="sticker.img_url" />
					</div>
				</AppOnHover>
			</div>

			<template v-if="stickersError">
				<div class="control-erros">
					<p class="help-block error anim-fade-in">
						{{ stickersError }}
					</p>
				</div>
			</template>

			<AppSpacer vertical :scale="6" />
		</template>
	</FormShopProductBase>
</template>
