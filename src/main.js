import Tone from 'tone'
import { map } from './assets/js/utils'

class Synth {
  constructor (wf, fft, txt) {
    this.txt = txt instanceof HTMLElement ? txt : document.querySelector(txt)

    this.wfCanvas = wf instanceof HTMLElement ? wf : document.querySelector(wf)
    this.wfCtx = this.wfCanvas.getContext('2d')
    this.wf = new Tone.Waveform(1024).toMaster()

    this.fftCanvas = fft instanceof HTMLElement ? fft : document.querySelector(fft)
    this.fftCtx = this.fftCanvas.getContext('2d')
    this.fft = new Tone.FFT(2048).toMaster()

    this.lp = new Tone.Filter({
      type : 'lowpass',
      frequency : 110,
      rolloff : -12,
      Q : 6
    })

    this.hp = new Tone.Filter({
      type : 'highpass',
      frequency : 400,
      rolloff : -12,
      Q : 6
    }).toMaster()

    this.reverb = new Tone.Reverb(10)

    this.aPan = new Tone.Panner(-1)
    this.bPan = new Tone.Panner(1)

    this.a = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, release: 1 }
    }).chain(this.lp, this.hp, this.wf, this.fft, this.aPan, this.reverb, Tone.Master)

    this.b = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.5, release: 1 }
    }).chain(this.lp, this.hp, this.wf, this.fft, this.bPan, this.reverb, Tone.Master)  
  }

  init () {
    window.addEventListener('mousedown', e => {
      this.a.triggerAttack(50 + 150 * e.clientY / window.innerHeight)
      this.b.triggerAttack(50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth)
    })
    window.addEventListener('touchstart', e => {
      this.a.triggerAttack(50 + 150 * e.clientY / window.innerHeight)
      this.b.triggerAttack(50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth)
    })

    window.addEventListener('mousemove', e => {
      this.a.frequency.value = 50 + 150 * e.clientY / window.innerHeight
      this.b.frequency.value = 50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth
      this.txt.querySelector('.a').textContent = Math.round(this.a.frequency.value)
      this.txt.querySelector('.b').textContent = Math.round(this.b.frequency.value)
      this.txt.querySelector('.a').style.fontVariationSettings = `'wdth' ${map(this.a.frequency.value, 50, 260, 0, 1000)}`
      this.txt.querySelector('.b').style.fontVariationSettings = `'wdth' ${map(this.b.frequency.value, 50, 260, 0, 1000)}`
    })
    window.addEventListener('touchmove', e => {
      this.a.frequency.value = 50 + 150 * e.clientY / window.innerHeight
      this.b.frequency.value = 50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth
      this.txt.querySelector('.a').textContent = Math.round(this.a.frequency.value)
      this.txt.querySelector('.b').textContent = Math.round(this.b.frequency.value)
      this.txt.querySelector('.a').style.fontVariationSettings = `'wdth' ${map(this.a.frequency.value, 50, 260, 0, 1000)}`
      this.txt.querySelector('.b').style.fontVariationSettings = `'wdth' ${map(this.b.frequency.value, 50, 260, 0, 1000)}`
    })

    window.addEventListener('mouseup', () => {
      this.a.triggerRelease()
      this.b.triggerRelease()
    })
    window.addEventListener('touchend', () => {
      this.a.triggerRelease()
      this.b.triggerRelease()
    })

    requestAnimationFrame(this.update.bind(this))
  }

  update () {
    requestAnimationFrame(this.update.bind(this))
    this.updateWF(this.wfCtx)
    this.updateFFT(this.fftCtx)
  }

  updateWF (ctx) {
    ctx.clearRect(0, 0, this.wfCanvas.width, this.wfCanvas.height)
    ctx.strokeStyle = 'currentColor'

    const vals = this.wf.getValue()

    ctx.beginPath()
    ctx.moveTo(0, vals[0] * 200 + this.wfCanvas.height / 2)
    vals.forEach((val, i) => {
      ctx.lineTo(i / 1024 * this.wfCanvas.width, val * 200 + this.wfCanvas.height / 2)
    })
    ctx.stroke()
  }

  updateFFT (ctx) {
    ctx.clearRect(0, 0, this.fftCanvas.width, this.fftCanvas.height)
    ctx.strokeStyle = 'currentColor'

    const vals = this.fft.getValue()

    ctx.beginPath()
    vals.forEach((val, i) => {
      ctx.moveTo(i / 50 * this.fftCanvas.width, this.fftCanvas.height)
      ctx.lineTo(i / 50 * this.fftCanvas.width, -val)
    })
    ctx.stroke()
  }
}

const s = new Synth('#wf', '#fft', '.freqs')
s.init()
