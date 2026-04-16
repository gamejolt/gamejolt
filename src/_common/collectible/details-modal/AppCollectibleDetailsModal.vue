<script lang="ts" setup>
import AppButton from '../../button/AppButton.vue';
import { JoltydexFeed } from '../../joltydex/joltydex-feed';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { $gettext } from '../../translate/translate.service';
import AppCollectibleThumbDetails from '../AppCollectibleThumbDetails.vue';
import { CollectibleModel } from '../collectible.model';

type Props = {
	collectible: CollectibleModel;
	feed: JoltydexFeed;
};
const { collectible, feed } = defineProps<Props>();

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
