function loadBugs(){
    fetch('/api/bug')
    .then(res => res.json())
    .then(bugs => {
        const elPre = document.querySelector('pre')
        elPre.innerHTML = JSON.stringify(bugs, null, 2)
    })
}