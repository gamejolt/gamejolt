<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { kFontSizeLarge, kFontSizeSmall } from '~styles/variables';

type Props = {
	giftUser: UserModel;
};
const { giftUser } = defineProps<Props>();

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
			<div class="text-center flex flex-col items-center justify-center">
				<div
					class="change-bg-bg-offset flex max-w-full flex-col items-center justify-center rounded-lg p-[12px]"
				>
					<AppUserAvatarBubble class="w-[128px] max-w-full" :user="giftUser" />
					<AppSpacer :scale="2" vertical />
					<div :style="{ fontSize: kFontSizeSmall.px }">@{{ giftUser.username }}</div>
					<div class="font-bold" :style="{ fontSize: kFontSizeLarge.px }">
						{{ giftUser.display_name }}
					</div>
				</div>
			</div>

			<AppSpacer :scale="6" vertical />

			<div>
				{{ $gettext(`Double check that you're sending this to the correct friend.`) }}
			</div>

			<AppSpacer :scale="6" vertical />

			<div class="flex">
				<AppButton class="ml-auto" solid primary @click="modal.resolve(true)">
					{{ $gettext(`Purchase`) }}
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>
