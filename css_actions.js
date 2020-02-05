// Toggle
const recordHead = document.getElementById('recordHead')
// const recordContent = document.getElementById('recordContent')

recordHead.addEventListener('click', () => {
  
  if (recordContent.style.display === 'none') {
    recordContent.style.display = 'block'
  } else {
    recordContent.style.display = 'none'
  }
})