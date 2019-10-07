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
					<translate>Overview</translate>
				</router-link>
			</li>
		</ul>
		<hr />
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
					active-class="active"
					exact
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
					exact
				>
					<translate>Game Jolt Trophies</translate>
					<span class="badge">{{ siteTrophyCount | number }}</span>
				</router-link>
			</li>
		</ul>
		<template v-if="hasGames">
			<hr />
			<ul class="sans-margin">
				<li v-for="game of games" :key="game.id">
					<router-link
						:to="{
							name: 'profile.trophies.game',
							params: {
								id: game.id,
							},
						}"
						active-class="active"
					>
						{{ game.title }}
						<span class="badge">{{ game.trophyCount | number }}</span>
					</router-link>
				</li>
			</ul>
		</template>
	</nav>
</template>

<style lang="stylus" scoped>

</style>

<script lang="ts" src="./nav"></script>
