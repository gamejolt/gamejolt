<script lang="ts" setup>
import { PropType } from 'vue';
import AppShareControl from '../share/AppShareControl.vue';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { User } from '../user/user.model';

defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
	elevate: {
		type: Boolean,
	},
});
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
