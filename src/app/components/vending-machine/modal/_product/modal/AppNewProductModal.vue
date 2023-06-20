<script lang="ts" setup>
import { CSSProperties, PropType, ref, toRaw, toRefs } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../../../_common/background/background.model';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import AppIllustration from '../../../../../../_common/illustration/AppIllustration.vue';
import AppMediaItemBackdrop from '../../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { UserAvatarFrame } from '../../../../../../_common/user/user-avatar/frame/frame.model';
import {
	styleAbsoluteFill,
	styleFlexCenter,
	styleMaxWidthForOptions,
} from '../../../../../../_styles/mixins';
import { illPointyThing } from '../../../../../img/ill/illustrations';
import AppUserAvatarBubble from '../../../../user/AppUserAvatarBubble.vue';

const props = defineProps({
	product: {
		type: Object as PropType<UserAvatarFrame | Background>,
		required: true,
	},
});

const { product } = toRefs(props);

const { user: myUser } = useCommonStore();
const modal = useModal()!;

const equipFrameState = ref<'done' | 'processing' | 'standby'>('standby');

async function equipAvatarFrame() {
	if (equipFrameState.value !== 'standby' || !isUserAvatarFrame(product.value)) {
		return;
	}
	equipFrameState.value = 'processing';
	try {
		const response = await Api.sendRequest(
			`/web/dash/profile/save`,
			{ avatar_frame: product.value.avatar_frame.id },
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

function isUserAvatarFrame(item: typeof props.product): item is UserAvatarFrame {
	return toRaw(item) instanceof UserAvatarFrame;
}

function isBackground(item: typeof props.product): item is Background {
	return toRaw(item) instanceof Background;
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
					{{ $gettext(`You can use this background when creating posts and firesides!`) }}
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
