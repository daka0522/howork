// @Documnet element references
// Clock 
const clock = document.getElementById('clock')

// Buttons 
const startCountBtn = document.getElementById('startCount')
const stopCountBtn = document.getElementById('stopCount')
const resetCountBtn = document.getElementById('resetCount')

// Temp
const info = document.getElementById('info')

// Count functions
function timer() {
    let now = new Date 
    let startTime = 0
    
    chrome.storage.sync.get('startTime', function(result) {
      console.log(result);
      
      startTime = result.key
      info.innerHTML = result.key
    })
    /* let milli = now.getMilliseconds()
    let sec = now.getSeconds()
    let min = now.getMinutes()
    let hour = now.getTime() */
    clock.innerHTML = now - startTime
}

var countTime 

// Start count
function startCount(event) {
  chrome.browserAction.setBadgeText({text: 'ON'})

  const startTime = new Date()
  chrome.storage.sync.set({'startTime': new Date()})

  
  countTime = setInterval(timer, 1)
}
// Stop count 
function stopCount(event) {
  chrome.browserAction.setBadgeText({text: ''})

  const stopTime = new Date 
  chrome.storage.sync.set({'stopTime': stopTime})

  clearInterval(countTime)
}







// Events
startCountBtn.addEventListener('click', startCount)
stopCountBtn.addEventListener('click', stopCount)