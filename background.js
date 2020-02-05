chrome.storage.sync.get(null, function(result) {
  console.log(result);
  // console.log(result.key);
  
})

chrome.storage.onChanged.addListener(function(changes, namespace){
  for (var key in changes) {
    var storageChange = changes[key]
    console.log(`Storage key ${key} in namespace ${namespace} changed. Old value was ${storageChange.oldValue}, new value is ${storageChange.newValue}`);

  }
})