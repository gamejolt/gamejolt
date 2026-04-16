<script lang="ts" setup>
import { CSSProperties, ref, toRaw } from 'vue';

import { Api } from '~common/api/api.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '~common/background/AppBackground.vue';
import { BackgroundModel } from '~common/background/background.model';
import AppButton from '~common/button/AppButton.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illPointyThing } from '~common/illustration/illustrations';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { Screen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';
import {
	styleAbsoluteFill,
	styleFlexCenter,
	styleMaxWidthForOptions,
} from '~styles/mixins';

type ProductModel = UserAvatarFrameModel | BackgroundModel;
type Props = {
	product: ProductModel;
};
const { product } = defineProps<Props>();

const { user: myUser } = useCommonStore();
const modal = useModal()!;

const equipFrameState = ref<'done' | 'processing' | 'standby'>('standby');

async function equipAvatarFrame() {
	if (equipFrameState.value !== 'standby' || !isUserAvatarFrame(product)) {
		return;
	}
	equipFrameState.value = 'processing';
	try {
		const response = await Api.sendRequest(
			`/web/dash/profile/save`,
			{ avatar_frame: product.avatar_frame.id },
			{ detach: true }
		);

		if (response.success === false) {
			throw new Error('Request was not successful.');
		}

		if (response.user) {
			// Update the user model with the new avatar frame.
			myUser.value?.assign(response.user);
		}

		equipFrameState.value = 'done';
	} catch (e) {
		console.error('Failed to equip avatar frame', e);
		equipFrameState.value = 'standby';
	}
}

function isUserAvatarFrame(item: ProductModel): item is UserAvatarFrameModel {
	return toRaw(item) instanceof UserAvatarFrameModel;
}

function isBackground(item: ProductModel): item is BackgroundModel {
	return toRaw(item) instanceof BackgroundModel;
}

function getStyles(ratio: number): CSSProperties {
	return {
		...styleMaxWidthForOptions({
			ratio,
			maxHeight: Screen.height * 0.4,
			maxWidth: 240,
		}),
		width: `100%`,
	};
}
</script>

<template>
	<AppModal class="anim-fade-in" force-theme="dark">
		<div
			class="theme-dark"
			:style="{
				...styleFlexCenter({
					direction: `column`,
				}),
				...styleAbsoluteFill(),
				padding: Screen.isXs ? `16px` : `32px`,
			}"
		>
			<h2 class="modal-title text-center" :style="{ margin: 0 }">
				<template v-if="isUserAvatarFrame(product)">
					{{ $gettext(`New avatar frame!`) }}
				</template>
				<template v-else-if="isBackground(product)">
					{{ $gettext(`New background!`) }}
				</template>
				<template v-else>
					{{ $gettext(`New item!`) }}
				</template>
			</h2>

			<AppSpacer vertical :scale="4" />

			<AppUserAvatarBubble
				v-if="isUserAvatarFrame(product)"
				:style="getStyles(1)"
				:user="myUser"
				:frame-override="product.avatar_frame"
				show-frame
				smoosh
				disable-link
			/>
			<template v-else-if="isBackground(product)">
				<div :style="getStyles(1)">
					<AppAspectRatio :ratio="1">
						<AppMediaItemBackdrop :media-item="product.media_item" radius="lg">
							<AppBackground :style="getStyles(1)" :background="product" darken>
								<AppAspectRatio :ratio="1" />
							</AppBackground>
						</AppMediaItemBackdrop>
					</AppAspectRatio>
				</div>
			</template>
			<AppIllustration
				v-else
				:style="{ margin: 0 }"
				:asset="illPointyThing"
				:max-width="getStyles(illPointyThing.width / illPointyThing.height).maxWidth"
			/>

			<AppSpacer vertical :scale="4" />

			<template v-if="isUserAvatarFrame(product)">
				<AppExpand :when="equipFrameState !== 'done'">
					<AppButton
						solid
						overlay
						primary
						:disabled="equipFrameState !== 'standby'"
						@click="equipAvatarFrame()"
					>
						{{ $gettext(`Equip item`) }}
					</AppButton>

					<AppSpacer vertical :scale="4" />
				</AppExpand>
			</template>
			<template v-else-if="isBackground(product)">
				<div>
					{{ $gettext(`You can use this background when creating posts!`) }}
				</div>

				<AppSpacer vertical :scale="4" />
			</template>

			<AppButton
				solid
				overlay
				:style="{
					minWidth: `160px`,
					maxWidth: `100%`,
				}"
				@click="modal.dismiss()"
			>
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
::v-deep(.modal)
	change-bg-rgba('0, 0, 0', 0.87, true)
</style>
