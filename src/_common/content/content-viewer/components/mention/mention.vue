<template>
	<span class="user-mention">
		<template v-if="user">
			<app-user-card-hover :user="user">
				<router-link :to="user.url">
					<span>
						<slot />
						<span class="avatar-container">
							<img
								key="user"
								:src="user.img_avatar"
								class="img-responsive mention-avatar-img"
								alt=""
							/>
							<app-jolticon class="mention-verified" v-if="user.is_verified" icon="verified" />
						</span>
					</span>
				</router-link>
			</app-user-card-hover>
		</template>
		<!-- Placeholder until the user data is hydrated: -->
		<template v-else>
			<router-link :to="'@' + username">
				<span :title="'@' + username">
					<slot />
				</span>
			</router-link>
		</template>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.user-mention
	display: inline-block

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

<script lang="ts" src="./mention"></script>
