<script lang="ts" setup>
import { computed, triggerRef } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { Clipboard } from '~common/clipboard/clipboard-service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { showShareModal } from '~common/share/card/_modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { UserModel } from '~common/user/user.model';

type Props = {
	/** Should only be your own user. */
	user: UserModel;
};
const { user } = defineProps<Props>();
const modal = useModal()!;

const url = computed(() => `https://gamejolt.com/invite/${user.username}`);

function onCopy() {
	Clipboard.copy(url.value);
}

function onShare() {
	showShareModal({
		resource: 'user',
		url: url.value,
	});
}

function onInput() {
	// Trigger a rebuild with this ref so the input doesn't display anything
	// different.
	triggerRef(url);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title sans-margin-bottom">
				<AppTranslate> Invite a friend </AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate>
					It's dangerous to go alone! Accounts created using your invite link
					automatically become your followers.
				</AppTranslate>
			</p>

			<div class="-img">
				<img src="~common/invite/modal/high-five.png" />
			</div>

			<input class="-url form-control" :value="url" @input="onInput" />

			<div class="-actions">
				<AppButton @click="onCopy">
					<AppTranslate>Copy link</AppTranslate>
				</AppButton>
				<AppButton primary @click="onShare">
					<AppTranslate>Share</AppTranslate>
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-img
	width: 100%
	display: flex
	justify-content: center

	> img
		width: 70%

.-url
	height: $button-md-line-height

.-actions
	display: flex
	grid-gap: 8px
	margin-top: @grid-gap

	> *
		flex: auto
</style>
