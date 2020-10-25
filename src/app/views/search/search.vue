<script lang="ts" src="./search"></script>

<template>
	<div>
		<app-page-header should-affix-nav :hide-nav="!hasSearch">
			<template v-if="Screen.isXs">
				<label>
					<translate>Enter your search</translate>
				</label>
				<!--
					If they click into a tag (which goes to search page), we
					don't want to autofocus the input since they're trying to
					see results. Only autofocus search on mobile if they haven't
					searched for anything yet.
				-->
				<app-search autocomplete-disabled :autofocus="!hasSearch" />
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

			<nav v-if="hasSearch" slot="nav" class="platform-list inline">
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
						<router-link
							:to="{ name: 'search.users', query: { q: query } }"
							active-class="active"
						>
							<translate>search.results.users_tab</translate>
							<span class="badge">{{ searchPayload.usersCount | number }}</span>
						</router-link>
					</li>
					<li v-if="searchPayload.gamesCount">
						<router-link
							:to="{ name: 'search.games', query: { q: query } }"
							active-class="active"
						>
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

		<div id="search-results" class="fill-backdrop">
			<app-search-suggestion v-if="hasSuggestion" :data="searchPayload.suggestions" />

			<router-view />

			<br />

			<app-pagination
				v-if="searchPayload.perPage && searchPayload.count"
				class="text-center"
				:items-per-page="searchPayload.perPage"
				:total-items="searchPayload.count"
				:current-page="searchPayload.page"
				@pagechange="Scroll.to('search-results', { animate: false })"
			/>
		</div>
	</div>
</template>
