<script lang="ts" setup>
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { illMobileKikkerstein } from '../../../../../_common/illustration/illustrations';
import { useAppStore } from '../../../../store/index';

const modal = useModal()!;
const { clearPanes, visibleLeftPane, toggleLeftPane } = useAppStore();

// TODO(creator-shops): when this modal closes and it routes away, the panes end up closing
function gotoQuests() {
	// Close the modal, indicating that we're doing some form of redirect.
	modal.resolve(true);

	// Go to quests page if we're not already there.
	if (visibleLeftPane.value !== 'quests') {
		toggleLeftPane('quests');
		return;
	}

	// Already on quests page, close any open shell sidebar.
	clearPanes();
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title sans-margin-bottom">
				{{ $gettext(`Looking for Coins?`) }}
			</h2>
		</div>

		<div class="modal-body">
			<AppIllustration :asset="illMobileKikkerstein" />

			<p class="text-center">
				{{ $gettext(`You can earn Coins by completing quests!`) }}
			</p>

			<AppSpacer vertical :scale="4" />

			<AppButton block solid primary @click="gotoQuests()">
				{{ $gettext(`View current quests`) }}
			</AppButton>
		</div>
	</AppModal>
</template>
