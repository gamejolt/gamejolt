<script lang="ts" setup>
import { PropType } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { Environment } from '../../environment/environment.service';
import { Screen } from '../../screen/screen-service';
import AppUserAvatarImg from '../user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../user.model';

defineProps({
	user: {
		type: Object as PropType<UserModel | null | undefined>,
		required: true,
	},
});
</script>

<template>
	<div
		class="container"
		:style="{
			...styleWhen(Screen.isXs, {
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
								v-if="Screen.isDesktop"
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
