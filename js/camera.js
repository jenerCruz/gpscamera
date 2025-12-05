export let stream = null;

export async function startCamera(videoEl) {
  const spinner = document.getElementById('loading-spinner');
  spinner.classList.remove('hidden');

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });

    videoEl.srcObject = stream;
    await videoEl.play();
    spinner.classList.add('hidden');

    return true;
  } catch (e) {
    spinner.classList.add('hidden');
    return false;
  }
}
