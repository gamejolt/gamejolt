<script lang="ts" src="./controls"></script>

<template>
	<div
		ref="container"
		:style="{
			top: top,
			left: left,
			bottom: bottom,
			visibility: showControl ? 'visible' : 'hidden',
		}"
		class="-container"
	>
		<transition name="fade">
			<div v-if="visible" ref="list" class="-autocomplete">
				<app-loading
					v-if="isLoading && isInverted"
					class="-loading-top"
					centered
					hide-label
				/>

				<template v-if="users.length">
					<button
						v-for="user of displayUsers"
						:key="user.id"
						class="-suggestion"
						:class="{ '-suggestion-selected': isSelected(user.id) }"
						@click.prevent="onClickInsert(user)"
					>
						<div v-if="user.is_following" class="-follow-indicator">
							<small class="text-muted">
								<app-jolticon icon="user" />
								<translate v-if="user.follows_you">You follow each other</translate>
								<translate v-else>Following</translate>
							</small>
						</div>
						<div class="-user">
							<app-user-avatar-img class="-avatar" :user="user" />
							<div class="-names">
								<div class="-name-row">
									<strong>{{ user.display_name }}</strong>
									<app-user-verified-tick :user="user" />
								</div>
								<div>
									<small>@{{ user.username }}</small>
								</div>
							</div>
						</div>
					</button>
				</template>

				<app-loading
					v-if="isLoading && !isInverted"
					class="-loading-bottom"
					centered
					hide-label
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./controls.styl" scoped></style>
