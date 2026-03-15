let audioContext: AudioContext | null = null;

function playNotificationBeep() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  audioContext = audioContext || new AudioCtx();
  const ctx = audioContext;

  const now = ctx.currentTime;
  const notes = [880, 1175];

  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.14 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + index * 0.14);
    osc.stop(now + index * 0.14 + 0.12);
  });
}

export async function requestLeadNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // Ignore permission errors and keep in-app toast only.
    }
  }
}

export function notifyNewLeads(newLeadsCount: number) {
  if (newLeadsCount <= 0) return;
  playNotificationBeep();

  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const body =
    newLeadsCount === 1
      ? "1 novo lead acabou de chegar."
      : `${newLeadsCount} novos leads acabaram de chegar.`;

  try {
    new Notification("Novo lead recebido", { body });
  } catch {
    // Silent fallback to in-app toast.
  }
}
