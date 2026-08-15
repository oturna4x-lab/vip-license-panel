const devices=document.getElementById("devices"),duration=document.getElementById("duration"),estimate=document.getElementById("estimate"),count=document.getElementById("count");

function updateEstimate(){
  const price=+duration.selectedOptions[0].dataset.price;
  estimate.value=(price*Math.max(1,+devices.value||1)).toFixed(2);
}
devices.oninput=updateEstimate;
duration.onchange=updateEstimate;

const modal=document.getElementById("modal"),newKey=document.getElementById("newKey"),keyList=document.getElementById("keyList");
function randomKey(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const p=()=>Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join("");
  return`ADM-${p()}-${p()}-${p()}`;
}
function getKeys(){return JSON.parse(localStorage.getItem("adminPremiumKeys")||"[]")}
function render(){
  const keys=getKeys();
  count.textContent=keys.length;
  keyList.innerHTML=keys.length?keys.map(x=>`<div class="key-row"><code>${x.key}</code><button class="small-copy" data-key="${x.key}">Copy</button></div>`).join(""):"<p style='color:#8f869f'>No demo keys generated yet.</p>";
  document.querySelectorAll(".small-copy").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.dataset.key));
}

function showModal(key){
  newKey.textContent=key;
  render();
  modal.classList.remove("hidden");
}

function generateLicense(){
  const key=randomKey();
  const keys=getKeys();
  keys.unshift({key,time:Date.now()});
  localStorage.setItem("adminPremiumKeys",JSON.stringify(keys.slice(0,30)));
  showModal(key);
}

document.getElementById("generate").onclick=generateLicense;
document.getElementById("closeModal").onclick=()=>modal.classList.add("hidden");
modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};
document.getElementById("copy").onclick=async()=>{
  await navigator.clipboard.writeText(newKey.textContent);
  document.getElementById("copy").textContent="Copied ✓";
  setTimeout(()=>document.getElementById("copy").textContent="Copy License Key",1200);
};
document.getElementById("viewKeys").onclick=()=>{
  document.getElementById("keysPanel").classList.remove("hidden");
  document.getElementById("keysPanel").scrollIntoView({behavior:"smooth"});
};
document.getElementById("closeKeys").onclick=()=>document.getElementById("keysPanel").classList.add("hidden");

const menuBtn=document.getElementById("menuBtn");
const sideMenu=document.getElementById("sideMenu");
const backdrop=document.getElementById("menuBackdrop");
const sideClose=document.getElementById("sideClose");
const toast=document.getElementById("toast");

function openMenu(){
  sideMenu.classList.add("open");
  backdrop.classList.remove("hidden");
  menuBtn.classList.add("active");
  menuBtn.setAttribute("aria-expanded","true");
  sideMenu.setAttribute("aria-hidden","false");
}
function closeMenu(){
  sideMenu.classList.remove("open");
  backdrop.classList.add("hidden");
  menuBtn.classList.remove("active");
  menuBtn.setAttribute("aria-expanded","false");
  sideMenu.setAttribute("aria-hidden","true");
}
menuBtn.onclick=()=>sideMenu.classList.contains("open")?closeMenu():openMenu();
sideClose.onclick=closeMenu;
backdrop.onclick=closeMenu;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

let toastTimer;
function showToast(message){
  clearTimeout(toastTimer);
  toast.textContent=message;
  toast.classList.add("show");
  toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);
}

document.querySelectorAll(".nav-item").forEach(item=>{
  item.addEventListener("click",()=>{
    const action=item.dataset.action;
    if(action==="keys"){
      closeMenu();
      document.getElementById("keysPanel").classList.remove("hidden");
      document.getElementById("keysPanel").scrollIntoView({behavior:"smooth"});
      return;
    }
    if(action==="random"){
      closeMenu();
      generateLicense();
      return;
    }
    if(action==="custom"){
      closeMenu();
      showToast("Custom Key: enter your custom key in the next version.");
      return;
    }
    if(action==="online"){
      closeMenu();
      showToast("Online System • Connected");
      return;
    }
    if(action==="settings"){
      closeMenu();
      showToast("Settings panel is ready for customization.");
      return;
    }
    const labels={
      lib:"Online LIB",
      extend:"Extend Key",
      balance:"Add Balance",
      duration:"Add Duration",
      name:"Change Name",
      license:"Change Licence",
      users:"Manage Users",
      referral:"Create Referral"
    };
    if(labels[action]){
      closeMenu();
      showToast(labels[action]+" • UI action ready");
      return;
    }
    if(action==="logout"){
      closeMenu();
      showToast("Logout is disabled in demo mode.");
    }
  });
});

updateEstimate();
render();
