<script lang="ts" src="./supporters"></script>

<template>
	<div class="-supporters">
		<h4 class="-heading">
			<translate>Supporters</translate>
			<app-jolticon
				v-app-tooltip.touchable="
					$gettext(
						`The kind people that supported by paying more than the minimum. Sorted by amount contributed.`
					)
				"
				class="text-muted"
				icon="help-circle"
			/>
		</h4>

		<div class="-list">
			<div class="-list-fade" />
			<div v-for="user of supporters.slice(0, 16)" :key="user.id" class="-supporter">
				<app-user-card-hover :user="user">
					<router-link class="user-avatar" :to="user.url">
						<app-user-avatar-img :user="user" />
					</router-link>
				</app-user-card-hover>
			</div>
		</div>

		<div class="-all">
			<app-button trans @click="viewAll()">
				<translate>View All</translate>
			</app-button>
		</div>
	</div>
</template>

<style lang="stylus" src="./supporters.styl" scoped></style>
