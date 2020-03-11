<template>
	<div>
		<div id="page-ad-scroll">
			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-md-8 col-lg-7">
							<h2 class="section-header">
								<translate :translate-params="{ game: game.title }">
									Downloading soundtrack for %{ game }...
								</translate>
							</h2>

							<p class="small text-muted">
								<translate>game.download.soundtrack.downloading_wait_message</translate>
							</p>

							<!--
								Set visibility so that the page height doesn't
								change when we hide. We don't want to change if
								they're trying to click something.
							-->
							<app-loading
								:style="{ visibility: started ? 'hidden' : undefined }"
								:hide-label="true"
							/>

							<app-ad-widget size="video" placement="content" />
						</div>

						<!--
							Will overflow a little on md, but what can ya do,
							amirite?
						-->
						<div class="col-md-4 col-lg-5 text-right" v-if="Screen.isDesktop">
							<app-ad-widget size="rectangle" placement="side" />
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script lang="ts" src="./soundtrack"></script>
