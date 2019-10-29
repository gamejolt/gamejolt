<template>
	<div>
		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-3">
						<nav class="platform-list">
							<app-profile-trophies-nav
								:games="games"
								:site-trophy-count="siteTrophyCount"
								:unviewed-games="unviewedGames"
							/>
						</nav>
					</div>
					<div class="col-xs-12 col-md-9">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./trophies"></script>
