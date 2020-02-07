// # Documnet element references
// Clock 
const startTime = document.getElementById('startTime')
const stopTime = document.getElementById('stopTime')
const elapsedTime = document.getElementById('elapsedTime')

// Earth time effect
const earth = document.querySelector('#earth-cont')

// Buttons 
const startCountBtn = document.getElementById('startCount')
const stopCountBtn = document.getElementById('stopCount')
const resetCountBtn = document.getElementById('resetCount')
const clearStorageBtn = document.getElementById('clearStorageBtn')
const loadRecordBtn = document.getElementById('loadRecordBtn')

// Record section
const recordContainer = document.getElementById('record-container')
const saveBtn = document.getElementById('saveBtn')

// # Variables 
let now
let elapsed
let start_time
let stop_time

// # Event listeners 
// Stopwatch
startCountBtn.addEventListener('click', () => {
  startCounting();
  earth.setAttribute('state', 'on')
})
stopCountBtn.addEventListener('click', () => {
  stopCounting()
  earth.setAttribute('state', 'off')
})
resetCountBtn.addEventListener('click', () => {
  reset()
  earth.setAttribute('state', 'off')
})
saveBtn.addEventListener('click', () => {
  if (elapsed) {
    record(Date.now(), elapsed)
  } else {
    // saveBtn.disabled = true
  }
})

// Record
loadRecordBtn.addEventListener('click', () => {
  loadData()
})
clearStorageBtn.addEventListener('click', () => {
  chrome.storage.sync.clear(
    () => {alert("Your all record is cleared.")}
  )
})

// # Initializing
function init() {
  // Load stored started data 
  chrome.storage.sync.get(
    'startTime',
    function(result) {
      if (result.isEmpty()) {
        start_time = null
      } else {
        let st = result['startTime']
        start_time = st 
        startTime.textContent = dateFormat(new Date(st)) + timeFormat(new Date(st))

        earth.setAttribute('state', 'on')
      }
    }
  )

  loadData()
}

// # Functions 
function loadData() {
  // Download all the records
  chrome.storage.sync.get(
    null,
    function (result) {
      let keys = Object.keys(result)
      console.log('keys', keys);
      
      let records = keys.filter(e => e.match(/\d+/))

      recordContainer.innerHTML =''

      let total

      records.forEach(e => {
        value = result[e]
        console.log("v ", value);
        

        // Day formatting i.g.) Today, Yeseterday, 1day ago, 2days ago, til 3days ago 
        let now = new Date().getDate()
        let storedDate = new Date(parseInt(e))
        let storedDay = storedDate.getDate()
        let dayGap = now - storedDay
        let day
        if (dayGap < 4) {
          switch (dayGap) {
            case 0: day = 'Today'; break;
            case 1: day = 'Yesterday'; break; 
            case 2: day = '2 days ago'; break; 
            case 3: day = '3 days ago'; break
          }
        } else { day = storedDay}
        // Month 
        let month = storedDate.getMonth()+1
        // Year
        let year = storedDate.getFullYear()

        // @ Create li items under today
        // 1. make ol tag the name depends on day name
        let id = day.toLowerCase()

        let ol 
        let wrapper
        let createTotal
        // If there's no day tags then create new 
        if (document.getElementById(id))  {
          ol = document.getElementById(id)
        } else {
          ol = document.createElement('ol')
          ol.id = id 
          ol.className = 'record-item'

          // Initialize total value when it's newly created  and create element
          
          // total = 0
        }
        createTotal = document.createElement('p')

        if (ol && !ol.hasAttribute('order')) {
          ol.setAttribute ('order', dayGap)
        }
        
        // 2. Unnamed lists
        let li = document.createElement('li')

        // 3. Contents in li
        let createTitle = document.createElement('p')
        let createContent = document.createElement('p')

        // 4. Title is date
        // `${year} ${month} ${day} `
        createTitle.textContent = timeFormat(storedDate)
        createTitle.className = 'record-item-time'
        
        // Content is the recorded elapse time.
        createContent.textContent = value 
        createContent.className = 'record-item-value'

        // 5. Get total sum
        total += value
        createTotal.textContent = total

        // Finally, append childs 
        li.appendChild(createTitle)
        li.appendChild(createContent)

        ol.appendChild(li)
        recordContainer.appendChild(ol)
      })
      console.log("can i?", total);
      
      // Prepend list title i.e.) Today, yesterday
      let cont = recordContainer
      for (i=0; i < cont.childElementCount; i++) {
        console.log(cont.children[i])
        let child = cont.children[i]
        if (!child.firstChild.id) {
          let listName = document.createElement('h5')
          listName.id = 'record-item-' + child.id
          listName.textContent = child.id.toUpperCase()
          child.insertBefore(listName, child.firstChild)
        }

        // Sort record-item by order attribute
        let order = child.getAttribute('order')
        if (order < cont.children[0]) {
          cont.insertBefore(child, cont.children[0])          
        }
      }
    }
  )
}




function record(savedTime, data) {
  let form = {}
  form[savedTime] = data 

  chrome.storage.sync.set(
    form,
    function() {
      alert("Successfully recored.")
    }
  )
  reset()
}

// # Functions
// 1. Start
function startCounting() {
  // Get the now time
  start_time = Date.now()

  // Save to storage
  chrome.storage.sync.set({
    'startTime': start_time
  })
  // And update the info in the document
  startTime.textContent = dateFormat(start_time) + timeFormat(start_time)
}

// 2. Stop
function stopCounting() {
  // Firstly check if there's the started time
  if (!start_time) {
    return 
  } else {
    // Get the now time 
    let now = Date.now()
    
    // Save to storage 
    chrome.storage.sync.set({
      'stopTime': now
    })
    
    // And update the info in the document
    stopTime.textContent = dateFormat(now) + timeFormat(now)
    // Finally update the elapsed time!  
    elapsed = now - start_time
  
    let time = getTime(elapsed)
    
    ms = time[0]
    s = time[1]
    m = time[2]
    h = time[3]
    // day
    // d = time[4]
    elapsed_time = `${h}:${m}:${s}:${ms}`
    elapsedTime.textContent = elapsed_time
  }
}

// 3. Reset
function reset() {
  chrome.storage.sync.remove(['startTime', 'stopTime'],
  () => {
    alert("Remove times in storage. successfully")
  })
  startTime.textContent = null
  stopTime.textContent = null
  elapsedTime.textContent = null
}

// @ get time
function getTime(ms) {
  let s = m = h = 0
  s = ms / 1000

  if (s >= 60) {
    m = s / 60 
    s = s % 60

    if (m >= 60) {
      h = m / 60 
      m = m % 60 
    }
  }
  return [ms, s, m, h].map(e => Math.floor(e).padNum())
}

function dateFormat(time) {
  let date = new Date(time)

  // Year?
  let year = date.getFullYear()

  // Month?
  let month = date.getMonth() + 1

  // Day?
  let day = date.getDate()

  return `${year} ${month} ${day}, `
}

function timeFormat(time) {
  let date = new Date(time)

  // Hour?
  let h = date.getHours().padNum()

  // Minute?
  let min = date.getMinutes().padNum()

  // Seconds?
  let s = date.getSeconds().padNum()

  // Milli seconds?
  let ms = date.getMilliseconds().padNum()
  ms 

  return `${h}:${min}:${s}`
}




// # Utils 
// - Some prototypings
// Number prototype of padding two prefix
Number.prototype.padNum = function() {return  this.toString().padStart(2, 0).slice(0, 2) } 
// Check this object is empty
Object.prototype.isEmpty = function() { for (var key in this) { return this.hasOwnProperty(key) ? false : true }}



init()