<script lang="ts" setup>
import AppShareControl from '../share/AppShareControl.vue';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { UserModel } from '../user/user.model';

type Props = {
	user: UserModel;
	elevate?: boolean;
};
const { user, elevate } = defineProps<Props>();
</script>

<template>
	<div class="sheet" :class="{ 'sheet-elevate': elevate }">
		<h4 class="sans-margin-top">
			<AppTranslate>Your invite link</AppTranslate>
		</h4>

		<AppShareControl resource="user" :url="`gamejolt.com/invite/${user!.username}`" />

		<AppSpacer vertical :scale="2" />

		<div class="small">
			<AppTranslate>
				Accounts created using your invite link automatically become your followers.
			</AppTranslate>
		</div>
	</div>
</template>

<style lang="stylus" scoped></style>
