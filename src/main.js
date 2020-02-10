// Document handling
// Theme
themeSelector = document.querySelector('#themeSelector')
appRef = document.querySelector('#app')

function themeChanger() {
  // Default mode - unchecked
  if (!themeSelector.checked) {
    appRef.setAttribute('theme', 'default')
  } else if (themeSelector.checked) {
    appRef.setAttribute('theme', 'dark')
  } else {
    return 
  }
}