<script lang="ts" setup>
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import { validateMaxLength } from '../../../../_common/form-vue/validators';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';

const { user } = useCommonStore();
</script>

<template>
	<div class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<AppUserAvatarImg :user="user" />
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
@import './add-button'

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
