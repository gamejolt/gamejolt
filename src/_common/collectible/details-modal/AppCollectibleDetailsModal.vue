<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { JoltydexFeed } from '../../joltydex/joltydex-feed';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { $gettext } from '../../translate/translate.service';
import AppCollectibleThumbDetails from '../AppCollectibleThumbDetails.vue';
import { CollectibleModel } from '../collectible.model';

defineProps({
	collectible: {
		type: Object as PropType<CollectibleModel>,
		required: true,
	},
	feed: {
		type: Object as PropType<JoltydexFeed>,
		required: true,
	},
});

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<AppCollectibleThumbDetails :collectible="collectible" :feed="feed" />
		</div>
	</AppModal>
</template>
