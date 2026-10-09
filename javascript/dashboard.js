function searchFunction() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const listItems = document.querySelectorAll("#resultList li");

  listItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(input) ? "" : "none";
  });
}

let token = window.sessionStorage.getItem('apiToken')
console.log(token)
while (!token) {
  token = window.sessionStorage.getItem('apiToken')

}

async function getStats() {
  let stats = await getDashboardStats(token)
  document.getElementById("stats-scenarios").innerHTML = stats.scenarios
  document.getElementById("stats-characters").innerHTML = stats.characters
  document.getElementById("stats-dialogue").innerHTML = stats.dialogue
  document.getElementById("stats-environment").innerHTML = stats.environment
  console.log(stats);
}

getStats();

console.log("dit is nieuw");