<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppStickerPack from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPack } from '../../../../../_common/sticker/pack/pack.model';
import { VendingMachinePurchaseResult } from './modal.service';

defineProps({
	pack: {
		type: Object as PropType<StickerPack>,
		required: true,
	},
});

const modal = useModal<VendingMachinePurchaseResult>()!;
</script>

<template>
	<AppModal class="-purchase-modal">
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Are you sure you want to purchase this pack?`) }}
			</h2>
		</div>

		<div class="modal-body">
			<div class="-pack-info">
				<AppStickerPack
					class="-pack"
					:pack="pack"
					:show-details="{
						name: true,
						cost: true,
						contents: true,
					}"
					force-elevate
				/>
			</div>
		</div>

		<div class="modal-footer">
			<div class="-confirm-row">
				<AppButton primary solid @click="modal.resolve('purchase')">
					{{ $gettext(`Purchase`) }}
				</AppButton>

				<AppButton primary solid @click="modal.resolve('purchase-and-open')">
					{{ $gettext(`Purchase and open`) }}
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-purchase-modal
	--gap-base: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		--gap-base: ($grid-gutter-width / 2)

.-pack-info
	display: flex
	flex-direction: column
	align-items: center
	margin-top: var(--gap-base)
	margin-bottom: var(--gap-base)

.-pack
	width: 100%
	max-width: 160px

.-confirm-row
	display: inline-flex
	flex: 0 1 auto
	min-width: 0
	flex-wrap: wrap
	justify-content: flex-end
	gap: 8px
</style>
