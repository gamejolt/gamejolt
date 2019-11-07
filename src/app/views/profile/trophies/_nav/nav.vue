<template>
	<nav>
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies',
					}"
					active-class="active"
					exact
				>
					<translate>Latest Activity</translate>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
					active-class="active"
				>
					<translate>All Trophies</translate>
					<span class="badge">{{ trophyCount | number }}</span>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.site',
					}"
					active-class="active"
				>
					<translate>Game Jolt Trophies</translate>
					<span class="badge">{{ siteTrophyCount | number }}</span>
				</router-link>
			</li>
		</ul>
		<template v-if="hasGames">
			<hr />
			<app-list-group-selector :items="games" :current="currentGame" @change="changeGame($event)">
				<template v-slot="{ item }">
					<translate v-if="!item">Choose a game...</translate>
					<template v-else>
						<span class="badge" :class="{ 'badge-notice': gameHasUnviewedTrophies(item.id) }">
							{{ item.trophyCount | number }}
						</span>
						{{ item.title }}
					</template>
				</template>
			</app-list-group-selector>
		</template>
	</nav>
</template>

<script lang="ts" src="./nav"></script>
