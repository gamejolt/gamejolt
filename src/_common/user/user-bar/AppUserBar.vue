<script lang="ts" setup>
import { Environment } from '~common/environment/environment.service';
import { getScreen } from '~common/screen/screen-service';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';
import { styleWhen } from '~styles/mixins';

type Props = {
	user: UserModel | null | undefined;
};
const { user } = defineProps<Props>();

const { isXs, isDesktop } = getScreen();
</script>

<template>
	<div
		class="container"
		:style="{
			...styleWhen(isXs, {
				paddingLeft: 0,
				paddingRight: 0,
			}),
		}"
	>
		<nav class="navbar">
			<div class="navbar-center">
				<div class="links">
					<slot />
				</div>
			</div>

			<div v-if="user" class="navbar-right">
				<ul class="navbar-items">
					<li>
						<a
							:style="{
								paddingTop: `10px !important`,
								paddingBottom: `10px !important`,
							}"
							:href="Environment.baseUrl + '/dashboard'"
						>
							<AppUserAvatarImg
								:style="{
									display: `inline-block`,
									width: `30px`,
									height: `30px`,
									verticalAlign: `middle`,
								}"
								:user="user"
							/>

							<span
								v-if="isDesktop"
								:style="{
									display: `inline-block`,
									marginLeft: `10px`,
								}"
							>
								{{ user.username }}
							</span>
						</a>
					</li>
				</ul>
			</div>
		</nav>
	</div>
</template>
