<script lang="ts" setup>
import AppButton from '../../../button/AppButton.vue';
import { formatNumber } from '../../../filters/number';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { useStickerStore } from '../../sticker-store';

const modal = useModal()!;

const { chargeCost } = useStickerStore();
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate> Charge </AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate>
					Complete daily quests to fill your charge orbs. Each day you miss a daily, your
					charge goes down.
				</AppTranslate>
			</p>

			<p>
				<AppTranslate
					:translate-n="chargeCost"
					:translate-params="{ count: formatNumber(chargeCost) }"
					translate-plural="Once all your charge orbs are full, you can support your favorite creators by giving them a charged sticker! Every charged sticker uses %{ count } charge orbs and puts 💰💰💰 in their IRL pockets."
				>
					Once all your charge orbs are full, you can support your favorite creators by
					giving them a charged sticker! Every charged sticker uses 1 charge orb and puts
					💰💰💰 in their IRL pockets.
				</AppTranslate>
			</p>
		</div>
	</AppModal>
</template>
