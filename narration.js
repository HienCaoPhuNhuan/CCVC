window.createCcvcNarration = function createCcvcNarration(sources) {
  const audio = new Audio();
  audio.id = 'ccvc-voice';
  audio.preload = 'auto';
  audio.hidden = true;
  document.body.append(audio);
  let generation = 0;
  let prompt;
  let tailBase = null;
  let tailStarted = null;
  let paused = false;
  function removePrompt() { prompt?.remove(); prompt = null; }
  async function play() {
    const token = generation;
    try {
      await audio.play();
      if (token !== generation) return;
      removePrompt();
      document.documentElement.dataset.narration = 'playing';
    } catch (error) {
      if (token !== generation || error.name === 'AbortError') return;
      document.documentElement.dataset.narration = 'blocked';
      if (prompt) return;
      prompt = document.createElement('button');
      prompt.type = 'button';
      prompt.className = 'narration-start';
      prompt.textContent = error.name === 'NotAllowedError' ? 'Bật tiếng và bắt đầu' : 'Thử phát lời đọc lại';
      prompt.addEventListener('click', play);
      document.body.append(prompt);
    }
  }
  audio.addEventListener('ended', () => {
    tailBase = audio.currentTime;
    tailStarted = paused ? null : performance.now();
    document.documentElement.dataset.narration = 'holding';
  });
  return {
    setSlide(index) {
      generation++;
      paused = false;
      tailBase = tailStarted = null;
      audio.pause();
      audio.src = sources[index].voice;
      audio.dataset.slide = String(index + 1);
      audio.load();
      removePrompt();
      play();
    },
    elapsed() {
      return tailBase === null ? audio.currentTime : tailBase + (tailStarted === null ? 0 : (performance.now() - tailStarted) / 1000);
    },
    pause() {
      paused = true;
      if (tailStarted !== null) {
        tailBase += (performance.now() - tailStarted) / 1000;
        tailStarted = null;
      }
      audio.pause();
    },
    resume() {
      paused = false;
      if (tailBase !== null) tailStarted = performance.now();
      else play();
    }
  };
};
