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
const totalSelector = document.querySelector('#givenDay')
const totalElem = document.querySelector('#total')


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
            // Record history reload 
        record.load()
})
// 2. Record

clearRecordBtn.addEventListener('click', () => {
    record.clear()
    recordHistoryRef.innerHTML = ''
})
totalSelector.addEventListener('change', (e) => {
    let selected = parseInt(e.target.value)
    const data = Object.values(record.historyData).reverse()
    
    let total = 0
    if (selected === 0) {
        selected = data.length
    }
    
    data.slice(0, selected).forEach(function(elem){
        total += elem.total
    })   
    totalElem.textContent = ms2time(total)
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
        record.create({
            startTime: now.getTime()
        })

        this.startTimer()
    }

    stopCounting() {
        if (this.startTime) {
            let now = new Date
            this.stop = now
            this.stopTimer()

            // DB
            record.create({
                stopTime: now.getTime()
            })

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
        if (this.elapsed) {
            let now = Date.now()

            // DB
            let data = {}
            data[now] = this.elapsed
            record.create(data)
        }
        // Stop timer
        this.stopTimer()

        // Reset 
        this.reset()
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

            clock.textContent = ms2time(current_elapsed)
        }, interval)

        // Ball effect
        stopwatch.setAttribute('state', 'on')

        // Badge effect ON
        chrome.browserAction.setBadgeText({
            text: "ON"
        }, () => {})
    }
    stopTimer() {
        clearInterval(this.counting)
        stopwatch.setAttribute('state', 'off')
            // Badge effect OFF
        chrome.browserAction.setBadgeText({
            text: ""
        }, () => {})
    }
}


// # Record class
class Record {
    constructor() {
            this.historyData 
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
                data = null
            } else {
                let item = result[key]
                data = item
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
        chrome.storage.sync.clear(() => {
            // alert("Storage cleared successfully!")
        })
    }

    load() {
        chrome.storage.sync.get(
            null,
            result => {
                let keys = Object.keys(result).filter(key => key.match(/[^\d{13,13}]+/))
                keys.forEach(e => {
                    delete result[e]
                })

                this.render(result)
            }
        )
    }
    render(record) {
        recordHistoryRef.innerHTML = ''
        let data = new Object

        Object.entries(record).forEach((item, index) => {
            const key = item[0]
            const value = item[1]

            let savedDateObj = new Date(parseInt(key))
            let savedDate = savedDateObj.toDateString()
            let savedTime = savedDateObj.toLocaleTimeString()

            // Initialize
            let ol
            if (!data[savedDate]) {
                data[savedDate] = new Object
                data[savedDate]['total'] = 0

                ol = document.createElement('ol')
                ol.id = savedDate
            } else {
                ol = document.getElementById(savedDate)
            }

            data[savedDate][savedTime] = value
            data[savedDate]['total'] += value

            const li = document.createElement('li')
            li.className = 'record-item'

            // Record Item
            const item_date = document.createElement('p')
            item_date.textContent = savedTime
            item_date.className = 'record-item-date'

            const item_value = document.createElement('p')
            item_value.textContent = ms2time(value)
            item_value.className = 'record-item-value'

            li.appendChild(item_date)
            li.appendChild(item_value)

            ol.appendChild(li)

            // Check out it's the last item of,
            // If it's the last then append it to ol 
            const next_key = Object.keys(record)[index + 1]

            if (next_key) {
                const next_date = new Date(parseInt(next_key)).toDateString()

                // If the next day is another day
                if (savedDate != next_date) {
                    const totalElem = document.createElement('p')
                    totalElem.classList = 'time total-sum'
                    totalElem.textContent = ms2time(data[savedDate]['total'])

                    const day = document.createElement('h4')
                    day.textContent = savedDate

                    ol.prepend(totalElem)
                    ol.prepend(day)
                }
            } else {
                const totalElem = document.createElement('p')
                totalElem.classList = 'time total-sum'
                totalElem.textContent = ms2time(data[savedDate]['total'])

                const day = document.createElement('h4')
                day.textContent = savedDate

                ol.prepend(totalElem)
                ol.prepend(day)
            }

            recordHistoryRef.prepend(ol)
        })
        // For get total time
        this.historyData = data
        const historyLength = Object.keys(this.historyData).length
        for (let i=0; i < historyLength; i++) {
            const op = document.createElement('option')
            op.value = i+1
            op.textContent = `In ${i+1} day`
            totalSelector.appendChild(op)
        }
        let totalSum = 0
        Object.values(data).forEach(e => {
            totalSum += e.total
        })
        totalElem.textContent = ms2time(totalSum)
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
function ms2time(ms) {
    let s = m = h = d = 0
    s = ms / 1000

    if (s >= 60) {
        m = s / 60
        s = s % 60

        if (m >= 60) {
            h = m / 60
            m = m % 60

            if (h >= 24) {
                d = h / 24 
                h = h % 24 
            }
        }

    }
    const time = [s, m, h].map(e => Math.floor(e).padNum())
    let result = d ? `${Math.floor(d)} Days ${time[2]}:${time[1]}:${time[0]}` : `${time[2]}:${time[1]}:${time[0]}`
    return result
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

    record.load()

}

init()
