<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { GamePackageModel } from '../../../../../_common/game/package/package.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { SellableModel } from '../../../../../_common/sellable/sellable.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import {
	GameDashRouteController,
	provideGameDashRouteController,
} from '../../../../views/dashboard/games/manage/manage.store';
import FormGamePackage from '../../../forms/game/package/package.vue';

const props = defineProps({
	routeController: {
		type: Object as PropType<GameDashRouteController>,
		required: true,
	},
	gamePackage: {
		type: Object as PropType<GamePackageModel>,
		default: undefined,
	},
	sellable: {
		type: Object as PropType<SellableModel>,
		default: undefined,
	},
});

provideGameDashRouteController(props.routeController);

const modal = useModal<GamePackageModel>()!;

function onSubmitted(gamePackage: GamePackageModel) {
	modal.resolve(gamePackage);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<FormGamePackage
				:model="gamePackage"
				:game="routeController.game"
				:sellable="sellable"
				@submit="onSubmitted"
			/>
		</div>
	</AppModal>
</template>
