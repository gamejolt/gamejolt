<script lang="ts" setup>
import FormGamePackage from '~app/components/forms/game/package/FormGamePackage.vue';
import {
	GameDashRouteController,
	provideGameDashRouteController,
} from '~app/views/dashboard/games/manage/manage.store';
import AppButton from '~common/button/AppButton.vue';
import { GamePackageModel } from '~common/game/package/package.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { SellableModel } from '~common/sellable/sellable.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

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
