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

    this.reverb = new Tone.Reverb(10)

    this.aPan = new Tone.Panner(-1)
    this.bPan = new Tone.Panner(1)

    this.a = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, release: 1 }
    })
    this.a.connect(this.aPan)
    this.a.chain(this.wf, this.fft, this.reverb, this.aPan, Tone.Master)

    this.b = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, release: 1 }
    })
    this.b.connect(this.bPan)
    this.b.chain(this.wf, this.fft, this.reverb, this.bPan, Tone.Master)

    this.c = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, release: 1 }
    })
    this.c.chain(this.wf, this.fft, this.reverb, Tone.Master)

    this.playing = false
  }

  init () {
    window.addEventListener('mousedown', e => {
      this.playing = !this.playing
      if (this.playing) {
        this.a.triggerAttack(50 + 150 * e.clientY / window.innerHeight)
        this.b.triggerAttack(50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth)
        this.c.triggerAttack(200)
      } else {
        this.a.triggerRelease()
        this.b.triggerRelease()
        this.c.triggerRelease()
      }
    })

    window.addEventListener('mousemove', e => {
      this.a.frequency.value = 50 + 150 * e.clientY / window.innerHeight
      this.b.frequency.value = 50 + 10 * e.clientY / window.innerHeight + 200 * e.clientX / window.innerWidth
      this.txt.querySelector('.a').textContent = Math.round(this.a.frequency.value)
      this.txt.querySelector('.b').textContent = Math.round(this.b.frequency.value)
      this.txt.querySelector('.a').style.fontVariationSettings = `'wdth' ${map(this.a.frequency.value, 50, 260, 0, 1000)}`
      this.txt.querySelector('.b').style.fontVariationSettings = `'wdth' ${map(this.b.frequency.value, 50, 260, 0, 1000)}`
    })

    window.addEventListener('wheel', e => {
      this.c.frequency.value += e.deltaY
      this.txt.querySelector('.c').textContent = Math.round(this.c.frequency.value)
      this.txt.querySelector('.c').style.fontVariationSettings = `'wdth' ${map(this.c.frequency.value, 50, 260, 0, 1000)}`
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
