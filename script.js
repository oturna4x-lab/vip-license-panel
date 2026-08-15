const devices = document.getElementById("devices");
const duration = document.getElementById("duration");
const estimate = document.getElementById("estimate");
const generate = document.getElementById("generate");
const modal = document.getElementById("modal");
const newKey = document.getElementById("newKey");
const keyList = document.getElementById("keyList");
const keysPanel = document.getElementById("keysPanel");

function updateEstimate(){
  const price = Number(duration.selectedOptions[0].dataset.price);
  estimate.value = (price * Math.max(1, Number(devices.value) || 1)).toFixed(2);
}
devices.addEventListener("input", updateEstimate);
duration.addEventListener("change", updateEstimate);

function randomKey(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part=()=>Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
  return `VIP-${part()}-${part()}-${part()}`;
}
function saveKey(key){
  const keys=JSON.parse(localStorage.getItem("demoVipKeys")||"[]");
  keys.unshift({key,app:document.getElementById("app").value,created:new Date().toLocaleString()});
  localStorage.setItem("demoVipKeys",JSON.stringify(keys.slice(0,20)));
  renderKeys();
}
function renderKeys(){
  const keys=JSON.parse(localStorage.getItem("demoVipKeys")||"[]");
  keyList.innerHTML=keys.length ? keys.map(x=>`
    <div class="key-row"><code>${x.key}</code><button class="small-copy" data-key="${x.key}">Copy</button></div>
  `).join("") : "<p>No demo keys generated yet.</p>";
  document.querySelectorAll(".small-copy").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.dataset.key));
}
generate.onclick=()=>{
  const key=randomKey();
  newKey.textContent=key;
  saveKey(key);
  modal.classList.remove("hidden");
};
document.getElementById("closeModal").onclick=()=>modal.classList.add("hidden");
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden")});
document.getElementById("copy").onclick=async()=>{
  await navigator.clipboard.writeText(newKey.textContent);
  document.getElementById("copy").textContent="Copied!";
  setTimeout(()=>document.getElementById("copy").textContent="Copy Key",1200);
};
document.getElementById("viewKeys").onclick=()=>{keysPanel.classList.remove("hidden");keysPanel.scrollIntoView({behavior:"smooth"})};
document.getElementById("closeKeys").onclick=()=>keysPanel.classList.add("hidden");
updateEstimate();
renderKeys();
