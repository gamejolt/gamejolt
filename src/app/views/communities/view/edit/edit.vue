<template>
	<div>
		<section class="section fill-backdrop">
			<div class="container">
				<div class="row" v-if="!!community.game">
					<div class="col-md-2"></div>
					<div class="col-xs-12 col-md-10">
						<app-communities-edit-notice :community="community" />
					</div>
				</div>
				<div class="row">
					<div class="col-md-2">
						<nav class="platform-list">
							<app-communities-view-edit-nav />
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

<script lang="ts" src="./edit"></script>
