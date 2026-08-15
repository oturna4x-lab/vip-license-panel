const devices=document.getElementById("devices"),duration=document.getElementById("duration"),estimate=document.getElementById("estimate"),count=document.getElementById("count");
function updateEstimate(){const price=+duration.selectedOptions[0].dataset.price;estimate.value=(price*Math.max(1,+devices.value||1)).toFixed(2)}
devices.oninput=updateEstimate;duration.onchange=updateEstimate;
const modal=document.getElementById("modal"),newKey=document.getElementById("newKey"),keyList=document.getElementById("keyList");
function randomKey(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",p=()=>Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join("");return`ADM-${p()}-${p()}-${p()}`}
function getKeys(){return JSON.parse(localStorage.getItem("adminPremiumKeys")||"[]")}
function render(){const keys=getKeys();count.textContent=keys.length;keyList.innerHTML=keys.length?keys.map(x=>`<div class="key-row"><code>${x.key}</code><button class="small-copy" data-key="${x.key}">Copy</button></div>`).join(""):"<p style='color:#8f869f'>No demo keys generated yet.</p>";document.querySelectorAll(".small-copy").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.dataset.key))}
document.getElementById("generate").onclick=()=>{const key=randomKey();const keys=getKeys();keys.unshift({key,time:Date.now()});localStorage.setItem("adminPremiumKeys",JSON.stringify(keys.slice(0,30)));newKey.textContent=key;render();modal.classList.remove("hidden")};
document.getElementById("closeModal").onclick=()=>modal.classList.add("hidden");modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};
document.getElementById("copy").onclick=async()=>{await navigator.clipboard.writeText(newKey.textContent);document.getElementById("copy").textContent="Copied ✓";setTimeout(()=>document.getElementById("copy").textContent="Copy License Key",1200)};
document.getElementById("viewKeys").onclick=()=>{document.getElementById("keysPanel").classList.remove("hidden");document.getElementById("keysPanel").scrollIntoView({behavior:"smooth"})};
document.getElementById("closeKeys").onclick=()=>document.getElementById("keysPanel").classList.add("hidden");
updateEstimate();render();
