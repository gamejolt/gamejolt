import { computed, markRaw, ref } from 'vue';
const { EventEmitter } = require('events') as typeof import('events');

const asgNative = require('asg-prebuilt');
const process = require('process') as typeof import('process');

const SampleRate = 44100;
const NumChannels = 1;
const Format: AudioSampleFormat = 'f32';

export type ASGControllerStatus = 'starting' | 'started' | 'stopping' | 'stopped';

export type ASGController = Awaited<ReturnType<typeof startDesktopAudioCapture>>;

export async function startDesktopAudioCapture(writableStream: WritableStream<AudioData>) {
	// We get the parent process's pid since it would also contain all the child
	// pids under it then.
	const appPid = process.ppid;

	const writer = markRaw(writableStream.getWriter());
	const emitter = markRaw(new EventEmitter());
	const uid = ref('');
	const status = ref<ASGControllerStatus>('starting');

	let _stopResolver: () => void;
	const _stopPromise = new Promise<void>(resolve => {
		_stopResolver = resolve;
	});

	emitter
		.on('status_update', (text: string) => {
			console.log('Status update: ' + text);

			// This will happen when stop() is called and we tell the recording
			// to end. When ASG finalizes it'll send this status update and we
			// can finally resolve the stop().
			if (text === 'end_recording') {
				// ASG takes a literal second to stop, so we have to mimic it
				// here. Ugh.
				setTimeout(() => _stopResolver(), 1_000);
			}
		})
		.on('error', (text: string) => {
			console.log('Caught error: ' + text);
			// TODO abort the stream and dispose of resources
		})
		.on('data', (data: Float32Array, timestamp: number) => {
			try {
				if (status.value !== 'started') {
					return;
				}

				const audioData = new AudioData({
					format: Format,
					numberOfChannels: NumChannels,
					numberOfFrames: data.length,
					timestamp,
					sampleRate: SampleRate,
					data,
				});

				writer.write(audioData);
			} catch (err) {
				console.error(err);
			}
		});

	try {
		uid.value = asgNative.startCapture(appPid, emitter.emit.bind(emitter));
		status.value = 'started';
	} catch (error) {
		console.error('Got error while starting ASG capture', error);
		await _cleanup();
	}

	async function stop() {
		if (status.value === 'stopping' || status.value === 'stopped') {
			return;
		}

		status.value = 'stopping';
		asgNative.endCapture(uid.value);
		status.value = 'stopped';

		// We need to wait for ASG to tell us that it's fully finished before
		// cleaning up and releasing control back to the caller. This will
		// happen through the event emitter.
		await _stopPromise;
		await _cleanup();
	}

	async function _cleanup() {
		emitter.removeAllListeners();
		await writer.close();
	}

	return {
		// readonly
		pid: computed(() => appPid),
		writer,
		emitter,
		uid,
		status,

		stop,
	};
}
