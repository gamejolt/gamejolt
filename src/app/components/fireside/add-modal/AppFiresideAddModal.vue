<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import AppAlertBox from '../../../../_common/alert/AppAlertBox.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresideModel } from '../../../../_common/fireside/fireside.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { RealmModel } from '../../../../_common/realm/realm-model';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppFormFiresideAdd from '../../forms/fireside/AppFormFiresideAdd.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		default: undefined,
	},
	realms: {
		type: Array as PropType<RealmModel[]>,
		default: () => [],
	},
});

const { community, realms } = toRefs(props);

const modal = useModal()!;

function onSubmit(fireside: FiresideModel) {
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
			<AppAlertBox icon="notice">
				We will be removing firesides as a feature on October 16th.
				<br />
				<a
					href="https://gamejolt.com/p/hey-it-s-atcros-taking-over-the-game-jolt-page-for-a-tough-message-fgbsrckb"
				>
					Read more here
				</a>
			</AppAlertBox>

			<AppSpacer vertical :scale="4" />

			<p>
				<AppTranslate>
					Firesides are temporary pop-up rooms where you can chat and stream with your
					friends, followers, and communities!
				</AppTranslate>
			</p>

			<AppFormFiresideAdd :community="community" :realms="realms" @submit="onSubmit" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
