<template>
	<div>
		<div v-if="Screen.isMobile" class="container">
			<br />
			<app-nav-tab-list>
				<app-manage-game-api-nav />
			</app-nav-tab-list>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
						<nav class="platform-list">
							<app-manage-game-api-nav />
						</nav>
					</div>
					<div class="col-xs-12 col-md-10">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./api"></script>
