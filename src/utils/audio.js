export function playBeep(){
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [0,0.18].forEach(delay=>{
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime+delay);
      g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime+delay+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+delay+0.16);
      o.start(ctx.currentTime+delay);
      o.stop(ctx.currentTime+delay+0.18);
    });
    setTimeout(()=>ctx.close(),600);
  }catch(e){
    /* audio not available */
  }
}
