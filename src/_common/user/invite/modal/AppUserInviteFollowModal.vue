<script lang="ts" setup>
import { PropType } from 'vue';
import { useModal } from '../../../modal/modal.service';
import { User } from '../../user.model';
import AppModal from '../../../modal/AppModal.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import AppButton from '../../../button/AppButton.vue';
import AppUserAvatarImg from '../../user-avatar/img/img.vue';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import AppUserFollowWidget from '../../follow/widget.vue';

defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
});

const modal = useModal<boolean>()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<div class="-user-info">
				<div class="-avatar">
					<AppUserAvatarImg :user="user" />
				</div>
				<AppSpacer horizontal :scale="2" />
				<div class="-text">
					<AppTranslate :translate-params="{ user: '@' + user.username }">
						%{ user } invites you to follow them!
					</AppTranslate>
				</div>
			</div>

			<AppSpacer vertical :scale="6" />

			<AppUserFollowWidget
				:user="user"
				primary
				block
				solid
				location="inviteFollow"
				@follow="modal.resolve(true)"
			/>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-user-info
	display: flex
	flex-direction: row
	align-items: center

.-avatar
	width: 48px

.-text
	font-size: 17px
	font-weight: 700
	line-height: 23px
</style>
