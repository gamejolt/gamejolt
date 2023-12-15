<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../../../_common/user/user.model';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleFlexCenter,
} from '../../../../../../_styles/mixins';
import { kFontSizeLarge, kFontSizeSmall } from '../../../../../../_styles/variables';

defineProps({
	giftUser: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const modal = useModal<boolean>()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`You're sending a gift to the following friend.`) }}
			</h2>
		</div>

		<div class="modal-body">
			<div
				class="text-center"
				:style="{
					...styleFlexCenter({
						direction: `column`,
					}),
				}"
			>
				<div
					:style="{
						...styleFlexCenter({ direction: `column` }),
						...styleBorderRadiusLg,
						...styleChangeBg('bg-offset'),
						padding: `12px`,
						maxWidth: `100%`,
					}"
				>
					<AppUserAvatarBubble
						:style="{ maxWidth: `100%`, width: `128px` }"
						:user="giftUser"
					/>
					<AppSpacer :scale="2" vertical />
					<div :style="{ fontSize: kFontSizeSmall.px }">@{{ giftUser.username }}</div>
					<div :style="{ fontSize: kFontSizeLarge.px, fontWeight: `bold` }">
						{{ giftUser.display_name }}
					</div>
				</div>
			</div>

			<AppSpacer :scale="6" vertical />

			<div>
				{{ $gettext(`Double check that you're sending this to the correct friend.`) }}
			</div>

			<AppSpacer :scale="6" vertical />

			<div :style="{ display: `flex` }">
				<AppButton
					:style="{ marginLeft: `auto` }"
					solid
					primary
					@click="modal.resolve(true)"
				>
					{{ $gettext(`Purchase`) }}
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>
