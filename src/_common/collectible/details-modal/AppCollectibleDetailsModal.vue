<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppCollectibleThumbDetails from '~common/collectible/AppCollectibleThumbDetails.vue';
import { CollectibleModel } from '~common/collectible/collectible.model';
import { JoltydexFeed } from '~common/joltydex/joltydex-feed';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

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
