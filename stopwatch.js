// # Query selector
// 1. Elements - Stopwatch
const startTimeRef = document.querySelector('#startTime')
const stopTimeRef = document.querySelector('#stopTime')

const clock = document.querySelector('#clock')
const stopwatch = document.querySelector('#stopwatch')

// 2. Buttons - Stopwatch
const startBtn = document.querySelector('#startBtn')
const stopBtn = document.querySelector('#stopBtn')
const resetBtn = document.querySelector('#resetBtn')
const saveBtn = document.querySelector('#saveBtn')

// 3. Record 
const recordHistoryRef = document.querySelector('#recordHistory')
const clearRecordBtn = document.querySelector('#clearRecordBtn')

// # Button actions & events
// 1. Stopwatch
startBtn.addEventListener('click', () => {
  currentTimer.startCounting()
})
stopBtn.addEventListener('click', () => {
  currentTimer.stopCounting()
})
resetBtn.addEventListener('click', () => {
  currentTimer.reset()
})
saveBtn.addEventListener('click', () => {
  currentTimer.save()
})
// 2. Record
clearRecordBtn.addEventListener('click', () => {
  record.clear()
})


// # Time class
class CountTime {
  constructor() {
    this.startTime = null
    this.stop = null
    this.elapsed = null

    
  }
  get start() {
    return this.startTime
  }
  set start(value) {
    this.startTime = value

    // Display
    if (!this.stop) {
      // Render
      startTimeRef.textContent = new Date(value).toLocaleString()
    }
  }

  startCounting() {
    let now = new Date
    this.start = now
    
    // DB
    record.create({startTime: now.getTime()})

    this.startTimer()
  }

  stopCounting() {
    if (this.startTime) {
      let now = new Date
      this.stop = now
      this.stopTimer()

      // DB
      record.create({stopTime: now.getTime()})

      // Render
      stopTimeRef.textContent = now.toLocaleString()

    } else {
      throw Error('Start counting firstly please')
    }
  }

  reset() {
    /* Clear every datas */

    this.start = null
    this.stop = null
    this.elapsed = null

    // DB
    record.delete(['startTime', 'stopTime'])

    // Render
    startTimeRef.textContent = null
    stopTimeRef.textContent = null
    clock.textContent = null

    // Stop timer
    this.stopTimer()
  }
  // Save the elapsed time 
  save() {
    let now = Date.now()

    // DB
    let data = {}
    data[now] = this.elapsed
    record.create(data)

    // Stop timer
    this.stopTimer()

    // Reset 
    this.reset()

    // Record history reload 
    record.timeHistory()
  }

  startTimer() {
    let interval = 1000 // 1sec

    // get start time 
    let pre_elapsed = 0
    if (this.elapsed) {
      pre_elapsed = this.start.getTime() - this.elapsed
    } else {
      pre_elapsed = this.start
    }

    this.counting = setInterval(() => {
      // Problem: calculating costs than maybe increasing numbers
      let current_elapsed = Date.now() - pre_elapsed

      this.elapsed = current_elapsed

      let elapsed_format = getTime(current_elapsed)

      clock.textContent = `${elapsed_format[2]}:${elapsed_format[1]}:${elapsed_format[0]}`
    }, interval)

    // Ball effect
    stopwatch.setAttribute('state', 'on')

    // Badge effect ON
    chrome.browserAction.setBadgeText({text: "ON"}, ()=>{})
  }
  stopTimer() {
    clearInterval(this.counting)
    stopwatch.setAttribute('state', 'off')
    // Badge effect OFF
    chrome.browserAction.setBadgeText({text: ""}, ()=>{})
  }
}


// # Record class
class Record {
  constructor() {
    this.historyData = ['a']
  }
  // 1. Create, Update
  create(data) {
    chrome.storage.sync.set(data, () => {
      // alert('Stored successfully in sync storage: ', data)
    })
  }

  // 2. Read
  // Read specified key
  read(key) {
    let data 
    chrome.storage.sync.get(key, function(result) {
      if (result.isEmpty()) {
        // alert("The object is empty in sync storage: ", key, result)
        data = null 
      } else {
        let item = result[key]
        data =   item
      }
    })
    return data

  }

  // 4. Delete
  // Reset some specified value in sync
  delete(datakeys) {
    chrome.storage.sync.remove(datakeys, () => {
      // alert("Delete successfully in sync storage: ", datakeys)
    })
  }
  // Clear all data in sync
  clear() {
    chrome.storage.sync.clear(()=>{
      // alert("Storage cleared successfully!")
    })
  }

  timeHistory(){
    // init
    recordHistoryRef.innerHTML = ''

    chrome.storage.sync.get(
      null,
      function(result) {
        let keys = Object.keys(result)
        // Read only the elapsed time datas
        keys = keys.filter(e => e.match(/\d+/))
        
        let total 

        keys.forEach(key => {
          let value = result[key]

          let savedDate = new Date(parseInt(key))
          let savedDay = savedDate.getDate()

          let today = new Date().getDate()
          let dayGap = today - savedDay

          let day
          if (0 <= dayGap < 4) {
            switch (dayGap) {
              case 0: day = 'Today'; break; 
              case 1: day = 'Yesterday'; break;
              case 2: day = '2 days ago'; break;
              case 3: day = '3 days ago'; break;
            }
          } else { day = savedDay }

          let id = day.toLowerCase()

          // 1. List container job
          let ol 
          
          

          if (document.getElementById(id)) {
            ol = document.getElementById(id)
          } else {
            // Create new list
            ol = document.createElement('ol')
            ol.id = id
            ol.setAttribute('order', dayGap)

            // And create day name
            let dayTitle = document.createElement('h4')
            dayTitle.textContent = day.toUpperCase()

            // Create total sum
            let sumNode = document.createElement('p')
            sumNode.id = `record-total-${id}`
            sumNode.className = 'time record-total'
            // sumNode.className = 'record-total'

            let tempFrg = new DocumentFragment()
            tempFrg.appendChild(dayTitle)
            tempFrg.appendChild(sumNode)

            ol.appendChild(tempFrg)

            // Initialize total value
            total = 0
          }

          // 2. List item job 
          let li = document.createElement('li')
          li.className = 'record-item'

          // 3. Contents in List item job 
          // title - saved date
          let savedDateNode = document.createElement('p')
          savedDateNode.textContent = savedDate.toLocaleTimeString()
          savedDateNode.className = 'record-item-date'
          
          // content - elapsed time
          let content = document.createElement('p')
          // Time formatting - return array sec, min, hour
          let t = getTime(value)
          content.textContent = `${t[2]}:${t[1]}:${t[0]}` 
          content.className = 'record-item-value'

          // Get total sum 
          total += value 

          let dayTotalNode = document.querySelector(`#record-total-${id}`)
          if (dayTotalNode) {
            let t = getTime(total)
            dayTotalNode.textContent = `${t[2]}:${t[1]}:${t[0]}` 
            console.log(dayTotalNode);
          }
          
          
          
          // dayTotalNode.textContent += value

          // let frag1 = new DocumentFragment()
          li.appendChild(savedDateNode)
          li.appendChild(content)

          let frag = new DocumentFragment()
          frag.appendChild(li)

          ol.appendChild(frag)
          
          recordHistoryRef.appendChild(ol)          
        })
      }
    )

    
  }
}


// # Utils 
// - Some prototypings
// Number prototype of padding two prefix
Number.prototype.padNum = function() {
  return this.toString().padStart(2, 0).slice(0, 2)
}
// Check this object is empty
Object.prototype.isEmpty = function() {
  for (var key in this) {
    return this.hasOwnProperty(key) ? false : true
  }
}

// - Time utils (Converting)
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
  return [s, m, h].map(e => Math.floor(e).padNum())
}



// Document element create function
function createElem(tagName, parentElemId, content) {
  let elem = document.createElement(tagName)
  let parent = document.querySelector(parentElemId)

  // Content work
  elem.textContent = content

  // Document Fragment
  let frag = new DocumentFragment()
  frag.appendChild(elem)

  // Append it to parent 
  parent.appendChild(frag)
}


// # Initializing

const currentTimer = new CountTime
const record = new Record 

function init() {
  
  
  chrome.storage.sync.get('startTime', (result) => {
    if (!result.isEmpty()) {
      currentTimer.start = result.startTime
      currentTimer.startTimer()
      
    }
  })

  record.timeHistory()
}

init()