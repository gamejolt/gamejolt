<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppFormFiresideAdd from '../../forms/fireside/AppFormFiresideAdd.vue';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		default: undefined,
	},
});

const { community } = toRefs(props);

const modal = useModal()!;

function onSubmit(fireside: Fireside) {
	modal.resolve(fireside);
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
			<p>
				<AppTranslate>
					Firesides are temporary pop-up rooms where you can chat and stream with your
					friends, followers, and communities!
				</AppTranslate>
			</p>

			<AppFormFiresideAdd :community="community" @submit="onSubmit" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
