/**@type{HTMLCanvasElement} */
window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    const seahorse = this.document.getElementById('seahorse')
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight
    let softVolume = 0

class Bar{
    constructor(x, y, width, height, color, index){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.index = index;
    }
    update(micInput){
        const sound = micInput * 1000
        if(sound > this.height){
            this.height = sound
        }else{
            this.height -= this.height * 0.03
        }
    }
    draw(context){
            if(this.index % 2 === 0){
            context.strokeStyle = this.color
            context.lineWidth = this.width
            context.save()
            context.rotate(this.index * -0.004)
            context.beginPath()
            context.moveTo(0, this.y)
            context.bezierCurveTo(this.x - this.height * 0.8, this.y + this.height * 0.2, this.height *  0.5, this.height + 2, -this.height * 3, this.y)
            context.stroke()
            context.beginPath()
            context.fillStyle = this.color
            context.arc(-this.height * 2, this.y, this.height * 0.1, 0, Math.PI * 2 )
            context.fill()

            if(this.index % 3 === 0){
            context.beginPath()
            context.moveTo(0, this.y)
            context.lineTo(this.x - this.height * 0.5, this.y + this.height * 10)
            context.stroke()
            }
            

            context.restore()
        }
    }
 }
        
class Microphone{
    constructor(fftSize){
        this.initialized = false
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream){
            this.audioContext = new AudioContext()
            this.microphone = this.audioContext.createMediaStreamSource(stream)
            this.analyser = this.audioContext.createAnalyser()
            this.analyser.fftSize = fftSize
            const bufferLength = this.analyser.frequencyBinCount
            this.dataArray = new Uint8Array(bufferLength)
            this.microphone.connect(this.analyser)
            this.initialized = true
        }.bind(this)).catch(function(err){
            alert(err)
        }) 
    }
    getSamples(){
        this.analyser.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e/128-1)
        return normSamples
    }
    getVolume(){
        this.analyser.getByteTimeDomainData(this.dataArray)
        let normSamples = [...this.dataArray].map(e => e/128-1)
        let sum = 0
        for(let i = 0; i < normSamples.length; i++){
            sum += normSamples[i] * normSamples[i]
        }
        let volume = Math.sqrt(sum / normSamples.length)
        return volume
    }
}
let fftSize = 512
const microphone = new Microphone(fftSize)
let bars = []
let barWidth = canvas.width / (fftSize / 2)
function createBars(){
    for(let i = 1; i < (fftSize / 2); i++){
        let color = ' hsl(' + i + ', 100%, 50%)'     
        bars.push(new Bar(0, i * 0.9, 1, 50, color, i))
    }
}
createBars()
// console.log(bars)


function animate(){
    if(microphone.initialized === true){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const samples = microphone.getSamples()
        const volume = microphone.getVolume()
        // console.log(samples)
        ctx.save()
        ctx.translate(canvas.width/2 + 150, canvas.height/2 + 10)
        ctx.rotate(-2.00)
        bars.forEach(function(bar, i){
            bar.update(samples[i])
            bar.draw(ctx)
        })
        ctx.restore()
        softVolume = softVolume * 0.5 + volume + 0.1
        seahorse.style.transform = 'translate(-50%, -50%) scale(' + (1 + softVolume * 3), (1 + softVolume) + ')'
    }
    requestAnimationFrame(animate)
}
animate()

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})


});



