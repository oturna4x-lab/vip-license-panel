const $ = id => document.getElementById(id);
const devices=$("devices"), duration=$("duration"), estimate=$("estimate"), count=$("count");

const DBKEY="adminPremiumDB";
const defaultDB={name:"ADMIN",balance:5000,keys:[],users:[],referrals:[],online:true};

function db(){return JSON.parse(localStorage.getItem(DBKEY)||JSON.stringify(defaultDB))}
function save(x){localStorage.setItem(DBKEY,JSON.stringify(x))}
function updateEstimate(){
  const price=+duration.selectedOptions[0].dataset.price;
  estimate.value=(price*Math.max(1,+devices.value||1)).toFixed(2);
}
devices.oninput=updateEstimate; duration.onchange=updateEstimate;

function keyCode(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const p=()=>Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join("");
  return `ADM-${p()}-${p()}-${p()}`;
}
function renderKeys(){
  const d=db(); count.textContent=d.keys.length;
  $("keyList").innerHTML=d.keys.length?d.keys.map((x,i)=>`
    <div class="key-row"><code>${x.key}</code><span style="color:#8f869f;font-size:10px">${x.app} • ${x.devices} device${x.devices>1?"s":""}</span>
    <button class="small-copy" data-copy="${x.key}">Copy</button>
    <button class="small-copy" data-delete="${i}">Delete</button></div>`).join(""):"<p style='color:#8f869f'>No demo keys yet.</p>";
  document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copyText(b.dataset.copy));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{let d=db();d.keys.splice(+b.dataset.delete,1);save(d);renderKeys();toast("Key deleted");});
}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast("Copied ✓")}catch{toast("Copy unavailable")}}
function generate(app=$("app").value, dev=Math.max(1,+devices.value||1), hours=+$("duration").value){
  const d=db(), key=keyCode();
  d.keys.unshift({key,app,devices:dev,hours,created:Date.now()}); save(d); renderKeys(); return key;
}
function showModal(key){$("newKey").textContent=key;$("modal").classList.remove("hidden")}
function generateLicense(){showModal(generate())}

$("generate").onclick=generateLicense;
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.add("hidden")};
$("copy").onclick=()=>copyText($("newKey").textContent);
$("viewKeys").onclick=()=>{$("keysPanel").classList.remove("hidden");$("keysPanel").scrollIntoView({behavior:"smooth"})};
$("closeKeys").onclick=()=>$("keysPanel").classList.add("hidden");

const menuBtn=$("menuBtn"),sideMenu=$("sideMenu"),backdrop=$("menuBackdrop"),sideClose=$("sideClose");
function openMenu(){sideMenu.classList.add("open");backdrop.classList.remove("hidden");menuBtn.classList.add("active");menuBtn.setAttribute("aria-expanded","true")}
function closeMenu(){sideMenu.classList.remove("open");backdrop.classList.add("hidden");menuBtn.classList.remove("active");menuBtn.setAttribute("aria-expanded","false")}
menuBtn.onclick=()=>sideMenu.classList.contains("open")?closeMenu():openMenu();
sideClose.onclick=closeMenu;backdrop.onclick=closeMenu;
document.onkeydown=e=>{if(e.key==="Escape")closeMenu()};

let timer;
function toast(msg){
  const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(timer);
  timer=setTimeout(()=>t.classList.remove("show"),1800);
}
function ask(title,label,value="",type="text"){
  return new Promise(resolve=>{
    const v=prompt(`${title}\n${label}`,value);
    resolve(v===null?null:v.trim());
  });
}
function openKeys(){closeMenu();$("keysPanel").classList.remove("hidden");$("keysPanel").scrollIntoView({behavior:"smooth"});renderKeys()}

document.querySelectorAll(".nav-item").forEach(item=>item.onclick=async()=>{
  const a=item.dataset.action, d=db();
  if(a==="keys"){openKeys();return}
  if(a==="random"){closeMenu();showModal(generate());return}
  if(a==="custom"){
    const k=await ask("Custom Key","Enter your custom license key:");
    if(!k)return;
    if(d.keys.some(x=>x.key===k)){toast("That key already exists");return}
    d.keys.unshift({key:k,app:"Custom",devices:1,hours:24,created:Date.now()});save(d);renderKeys();closeMenu();showModal(k);return
  }
  if(a==="settings"){
    const n=await ask("Settings","Admin display name:",d.name);
    if(n){d.name=n;save(d);document.querySelector(".brand strong").textContent=n;toast("Name updated")}
    return
  }
  if(a==="online"){
    d.online=!d.online;save(d);document.querySelector(".status").innerHTML=`<span></span> ${d.online?"System Online":"System Offline"}`;toast(d.online?"System is online":"System is offline");return
  }
  if(a==="lib"){closeMenu();toast("Online LIB • 0 connected");return}
  if(a==="extend"){
    if(!d.keys.length){toast("Generate a key first");return}
    const k=await ask("Extend Key","Enter the key to extend:",d.keys[0].key);
    const found=d.keys.find(x=>x.key===k);if(!found){toast("Key not found");return}
    const h=await ask("Extend Key","Add hours:",24);
    if(h&&+h>0){found.hours+=+h;save(d);renderKeys();closeMenu();toast(`Extended by ${h} hours`)}return
  }
  if(a==="balance"){
    const n=await ask("Add Balance","Amount to add (₹):","500");
    if(n&&+n>0){d.balance+=+n;save(d);closeMenu();toast(`Balance: ₹${d.balance.toFixed(2)}`)}return
  }
  if(a==="duration"){
    if(!d.keys.length){toast("Generate a key first");return}
    const k=await ask("Add Duration","Enter the key:",d.keys[0].key), f=d.keys.find(x=>x.key===k);
    if(!f){toast("Key not found");return}
    const h=await ask("Add Duration","Hours to add:","24");
    if(h&&+h>0){f.hours+=+h;save(d);renderKeys();closeMenu();toast("Duration added")}return
  }
  if(a==="name"){
    const n=await ask("Change Name","New admin name:",d.name);
    if(n){d.name=n;save(d);document.querySelector(".brand strong").textContent=n;closeMenu();toast("Admin name changed")}return
  }
  if(a==="license"){
    if(!d.keys.length){toast("Generate a key first");return}
    const old=await ask("Change Licence","Current key:",d.keys[0].key), f=d.keys.find(x=>x.key===old);
    if(!f){toast("Key not found");return}
    const nk=await ask("Change Licence","New license key:",keyCode());
    if(nk){f.key=nk;save(d);renderKeys();closeMenu();toast("License changed")}return
  }
  if(a==="users"){
    const name=await ask("Manage Users","Enter a username to add:");
    if(name){d.users.push({name,created:Date.now()});save(d);closeMenu();toast(`${name} added • ${d.users.length} user(s)`)}return
  }
  if(a==="referral"){
    const code="REF-"+Math.random().toString(36).slice(2,8).toUpperCase();
    d.referrals.push(code);save(d);closeMenu();showModal(code);return
  }
  if(a==="logout"){closeMenu();toast("Demo logout completed");}
});

$("app").onchange=()=>{};
document.querySelector(".brand strong").textContent=db().name;
$("count").textContent=db().keys.length;
updateEstimate();renderKeys();
