<script lang="ts" src="./mention"></script>

<template>
	<span class="user-mention">
		<template v-if="user">
			<app-user-card-hover :user="user">
				<router-link :to="user.url">
					<span>
						<slot />
						{{ ' ' }}
						<span class="avatar-container">
							<img
								:src="user.img_avatar"
								class="img-responsive mention-avatar-img"
								alt=""
							/>
							<app-jolticon
								v-if="user.is_verified"
								class="mention-verified"
								icon="verified"
							/>
						</span>
					</span>
				</router-link>
			</app-user-card-hover>
		</template>
		<!-- Placeholder until the user data is hydrated: -->
		<template v-else>
			<router-link :to="'/@' + username">
				<span :title="'@' + username">
					<slot />
				</span>
			</router-link>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
.user-mention
	display: inline-block
	white-space: normal

.avatar-container
	position: relative
	display: inline-block

.mention-avatar-img
	display: inline
	height: 1.5em
	img-circle()

.mention-verified
	position: absolute
	right: -4px
	bottom: -4px
	change-bg('bg-offset')
	border-radius: 100%
</style>
