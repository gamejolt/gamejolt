<template>
	<div>
		<app-page-header should-affix-nav :hide-nav="!hasSearch">
			<template v-if="Screen.isXs">
				<app-search ref="search" autocomplete-disabled />
			</template>
			<template v-else>
				<template v-if="!hasSearch">
					<p class="text-center text-muted">
						<app-jolticon icon="chevron-up" />
						<translate>search.results_placeholder</translate>
						<app-jolticon icon="chevron-up" />
					</p>
				</template>
				<template v-else>
					<div class="small text-upper text-muted">
						<translate>search.showing_label</translate>
					</div>

					<h2 class="sans-margin-top">
						{{ query }}
					</h2>

					<br />
				</template>
			</template>

			<nav slot="nav" class="platform-list inline" v-if="hasSearch">
				<ul>
					<li>
						<router-link
							:to="{ name: 'search.results', query: { q: query } }"
							active-class="active"
							exact
						>
							<translate>search.results.overview_tab</translate>
						</router-link>
					</li>
					<li v-if="searchPayload.usersCount">
						<router-link :to="{ name: 'search.users', query: { q: query } }" active-class="active">
							<translate>search.results.users_tab</translate>
							<span class="badge">{{ searchPayload.usersCount | number }}</span>
						</router-link>
					</li>
					<li v-if="searchPayload.gamesCount">
						<router-link :to="{ name: 'search.games', query: { q: query } }" active-class="active">
							<translate>search.results.games_tab</translate>
							<span class="badge">{{ searchPayload.gamesCount | number }}</span>
						</router-link>
					</li>
				</ul>
			</nav>
		</app-page-header>

		<app-expand :when="noResults">
			<section class="section fill-offset">
				<div class="container">
					<translate>search.results.no_results</translate>
				</div>
			</section>
		</app-expand>

		<div id="search-results">
			<router-view />

			<br />

			<app-pagination
				class="text-center"
				v-if="searchPayload.perPage && searchPayload.count"
				:items-per-page="searchPayload.perPage"
				:total-items="searchPayload.count"
				:current-page="searchPayload.page"
				@pagechange="Scroll.to('search-results', { animate: false })"
			/>
		</div>
	</div>
</template>

<script lang="ts" src="./search"></script>
