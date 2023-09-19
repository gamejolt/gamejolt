<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ComponentProps } from '../../../../../_common/component-helpers';
import { showErrorGrowl, showInfoGrowl } from '../../../../../_common/growls/growls.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { styleFlexCenter } from '../../../../../_styles/mixins';
import { sleep } from '../../../../../utils/utils';
import AppDashShopItem from '../AppDashShopItem.vue';
import { ShopManagerGroupItem, ShopManagerStore } from '../RouteDashShop.vue';
import type { ShopChangesType } from './modal.service';

type BulkAction = 'submit-changes' | 'publish' | 'cancel';
interface ListData {
	label: string;
	items: ShopManagerGroupItem[];
	bulkActions?: BulkAction[];
}

const props = defineProps({
	controller: {
		type: Object as PropType<ShopManagerStore>,
		required: true,
	},
	manageType: {
		type: String as PropType<ShopChangesType>,
		required: true,
	},
});

const { controller, manageType } = toRefs(props);

const isButtonBusy = ref(false);

const listData = computed<ListData>(() => {
	const { approved, inReview, rejected, draft } = controller.value.changes;
	const type = manageType.value;

	if (type === 'approved') {
		return {
			label: $gettext(`Approved changes`),
			items: approved.value.items,
			bulkActions: ['publish'],
		};
	} else if (type === 'inReview') {
		return {
			label: $gettext(`In review`),
			items: inReview.value.items,
			bulkActions: ['cancel'],
		};
	} else if (type === 'rejected') {
		return {
			label: $gettext(`Rejected changes`),
			items: rejected.value.items,
			bulkActions: ['cancel'],
		};
	} else if (type === 'draft') {
		const { avatarFrames, backgrounds, stickerPacks, stickers } = controller.value;
		const draftIds = draft.value.ids;

		const items = [
			...avatarFrames.value.items,
			...backgrounds.value.items,
			...stickerPacks.value.items,
			...stickers.value.items,
		].reduce((result, i) => {
			if (draftIds.has(i.id)) {
				result.push(i);
			}
			return result;
		}, [] as ShopManagerGroupItem[]);

		return {
			label: $gettext(`Draft changes`),
			items,
			bulkActions: ['submit-changes'],
		};
	}

	throw Error('Missing implementation for type: ' + type);
});

function getBulkActionLabel(action: BulkAction) {
	switch (action) {
		case 'publish':
			return $gettext(`Publish all`);

		case 'cancel':
			return $gettext(`Cancel all`);

		case 'submit-changes':
			return $gettext(`Submit all changes`);
	}
}

async function onClickAction(action: BulkAction) {
	if (isButtonBusy.value) {
		return;
	}
	isButtonBusy.value = true;
	switch (action) {
		case 'publish':
			await _publish();
			break;

		case 'cancel':
			await _cancel();
			break;

		case 'submit-changes':
			await _submitChanges();
			break;
	}

	isButtonBusy.value = false;
}

async function getButtonProps(action: BulkAction) {
	const props: ComponentProps<typeof AppButton> = {
		primary: true,
		onClick: () => onClickAction(action),
	};

	switch (action) {
		case 'publish':
			props.solid = true;
			break;

		case 'cancel':
			// Nothing to do.
			break;

		case 'submit-changes':
			props.solid = true;
			break;
	}

	return props;
}

// TODO(creator-shops) messaging for actions
async function _publish() {
	await sleep(1_000);
	// TODO(creator-shops) publish all
	if (Math.random() > 0.5) {
		showInfoGrowl(
			$gettext(`Success! Please wait a few minutes for items to show in the shop.`)
		);
		// TODO(creator-shops) This should modify state for items and update
		// lists as needed. Resolve modal only after handing new item state.
		modal.resolve();
		return;
	}

	// TODO(creator-shops) should this force a refresh of our data?
	showErrorGrowl($gettext(`Failed to publish items. Please try again after a few minutes.`));
}

async function _cancel() {
	await sleep(1_000);
	// TODO(creator-shops) cancel all
	if (Math.random() > 0.5) {
		showInfoGrowl($gettext(`Your pending shop products were canceled.`));
		modal.resolve();
		return;
	}

	showErrorGrowl($gettext(`Failed to items. Please try again after a few minutes.`));
}

async function _submitChanges() {
	await sleep(1_000);
	// TODO(creator-shops) submit all changes
	if (Math.random() > 0.5) {
		showInfoGrowl(
			$gettext(`Your items were submitted for review. Please allow a few days for review.`)
		);
		modal.resolve();
		return;
	}

	showErrorGrowl($gettext(`Failed to items. Please try again after a few minutes.`));
}

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2
				class="modal-title sans-margin-bottom"
				:style="{
					display: `flex`,
					alignItems: `flex-start`,
				}"
			>
				<span>
					{{ listData.label }}
				</span>

				<div
					v-if="listData.bulkActions?.length"
					:style="[
						styleFlexCenter({ display: `inline-flex` }),
						{
							gap: `12px`,
							marginLeft: `auto`,
							flexWrap: `wrap`,
						},
					]"
				>
					<AppButton
						v-for="action in listData.bulkActions"
						v-bind="getButtonProps(action)"
						:key="action"
						:loading="isButtonBusy"
					>
						{{ getBulkActionLabel(action) }}
					</AppButton>
				</div>
			</h2>
		</div>

		<div class="modal-body">
			<!-- TODO(creator-shops) might want to split items by their item
			type. grid styling looks strange because of sticker packs. -->
			<div
				:style="{
					display: `grid`,
					gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
					gap: `12px 16px`,
					alignItems: `start`,
					alignContent: `start`,
				}"
			>
				<!-- TODO(creator-shops) need a better key for this so multiple
				resource types don't collide -->
				<AppDashShopItem v-for="item in listData.items" :key="item.id" :item="item" />
			</div>
		</div>
	</AppModal>
</template>
