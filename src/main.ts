import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<button id="counter" type="button" class="counter"></button>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
