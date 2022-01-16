<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { User } from '../../user.model';
import guestImage from '../guest.png';

@Options({})
export default class AppUserAvatarImg extends Vue {
	@Prop(Object) user?: User;

	hasError = false;

	readonly guestImage = guestImage;
}
</script>

<template>
	<span class="user-avatar-img">
		<img
			v-if="user && !hasError"
			:src="user.img_avatar"
			class="img-responsive"
			alt=""
			@error="hasError = true"
		/>
		<img v-else :src="guestImage" class="img-responsive" alt="" />
	</span>
</template>

<style lang="stylus" scoped>
.user-avatar-img
	display: block
	position: relative

	img
		img-responsive()
		img-circle()
</style>
