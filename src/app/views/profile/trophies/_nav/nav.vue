<script lang="ts" src="./nav"></script>

<template>
	<nav>
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies',
					}"
					exact-active-class="active"
				>
					<translate>Latest Activity</translate>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
					exact-active-class="active"
				>
					<translate>All Trophies</translate>
					<span class="badge">{{ formatNumber(trophyCount) }}</span>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.site',
					}"
					exact-active-class="active"
				>
					<translate>Game Jolt Trophies</translate>
					<span class="badge">{{ formatNumber(siteTrophyCount) }}</span>
				</router-link>
			</li>
		</ul>
		<template v-if="hasGames">
			<hr />
			<app-list-group-selector
				:items="games"
				:current="currentGame"
				@change="changeGame($event)"
			>
				<template #default="{ item }">
					<translate v-if="!item">Choose a game...</translate>
					<template v-else>
						<span
							class="badge"
							:class="{ 'badge-notice': gameHasUnviewedTrophies(item.id) }"
						>
							{{ formatNumber(item.trophyCount) }}
						</span>
						{{ item.title }}
					</template>
				</template>
			</app-list-group-selector>
		</template>
	</nav>
</template>
