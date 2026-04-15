<script lang="ts" setup>
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
import FormGamePackage from '../../../forms/game/package/FormGamePackage.vue';

type Props = {
	routeController: GameDashRouteController;
	gamePackage?: GamePackageModel;
	sellable?: SellableModel;
};
const { routeController, gamePackage, sellable } = defineProps<Props>();

const { game } = routeController;

provideGameDashRouteController(routeController);

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
				:game="game!"
				:sellable="sellable"
				@submit="onSubmitted"
			/>
		</div>
	</AppModal>
</template>
