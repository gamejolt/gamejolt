<script lang="ts" setup>
import { toRefs } from 'vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import { validateMaxLength } from '../../../../_common/form-vue/validators';
import { useAppStore } from '../../../../_common/store/app-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';

const { user } = toRefs(useAppStore());
</script>

<template>
	<div class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<app-user-avatar-img :user="user" />
		</span>
		<div class="-input">
			<AppFormControl
				type="text"
				:validators="[validateMaxLength(100)]"
				:placeholder="$gettext(`Share your creations!`)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../add-button'

.post-add-button
	margin-bottom: 0

.-input > input
	border: none
	padding: 0
	margin: 0
	display: inline-block
	color:  var(--theme-fg-muted)
	background-color: transparent
</style>
