<template>
	<div>
		<app-page-header>
			<div class="row">
				<div class="col-sm-9 col-sm-offset-3 col-md-8 col-md-offset-2 col-lg-6">
					<h1>
						<translate>settings.heading</translate>
					</h1>
				</div>
			</div>
		</app-page-header>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-sm-3 col-md-2 hidden-xs">
						<app-scroll-affix>
							<nav class="platform-list">
								<ul>
									<li v-for="(label, section) of sections" :key="section">
										<a v-app-scroll-to="`settings-${section}`">
											{{ label }}
										</a>
									</li>
								</ul>
							</nav>
						</app-scroll-affix>
					</div>
					<div class="col-sm-9 col-md-8 col-lg-6">
						<form-settings />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./settings"></script>
