function w(){const t=document.getElementById("page-download-toast");t&&t.remove();const e=document.createElement("div");e.id="page-download-toast",e.setAttribute("role","alert"),e.setAttribute("aria-live","assertive"),e.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(42, 42, 46, 0.97);
      color: #f8f8f8;
      padding: 16px;
      border-radius: 8px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: none;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      max-width: 400px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255, 255, 255, 0.1);
  `;const n=document.createElement("style");n.textContent=`
      .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
      }
  `,document.head.appendChild(n);const o=document.createElement("div");o.style.cssText=`
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 12px;
  `;const l=document.createElement("div");l.textContent="Page Download",l.style.cssText=`
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
  `;const c=document.createElement("button");c.innerHTML="&times;",c.style.cssText=`
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      font-size: 28px;
      font-weight: 300;
      cursor: pointer;
      padding: 0 8px;
      line-height: 0.8;
      margin-right: -6px;
      margin-top: -6px;
      transition: color 0.2s ease;
  `,c.onmouseover=()=>{c.style.color="white"},c.onmouseout=()=>{c.style.color="rgba(255, 255, 255, 0.8)"},c.onclick=()=>{E()},o.appendChild(l),o.appendChild(c),e.appendChild(o);const u=document.createElement("div");u.id="page-download-status",u.textContent="Downloading page: 0%",u.style.cssText=`
    font-size: 11px;
  `,e.appendChild(u);const s=document.createElement("div");s.id="page-download-progress-bar",s.style.cssText=`
      width: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      height: 6px;
      margin-top: 10px;
      margin-bottom: 14px;
      border-radius: 6px;
      overflow: hidden;
  `;const g=document.createElement("div");g.id="page-download-progress-fill",g.style.cssText=`
      height: 100%;
      background-color: #4688F1;
      width: 0%;
      transition: width 0.3s ease;
  `,s.appendChild(g),e.appendChild(s);const f=document.createElement("div");f.id="file-status-container",f.style.cssText=`
      max-height: 250px;
      overflow-y: auto;
      margin-top: 12px;
      font-size: 11px;
      display: none;
      padding-right: 5px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  `,["success","skipped","failed"].forEach(r=>{const h=document.createElement("div");h.id=`${r}-files`,h.style.cssText=`
          margin-bottom: 10px;
          display: none;
      `;const y=document.createElement("div");y.style.cssText=`
          font-weight: bold;
          margin-bottom: 5px;
          color: ${r==="success"?"#4CAF50":r==="skipped"?"#FFC107":"#F44336"};
      `,y.textContent=r==="success"?"Downloaded Files:":r==="skipped"?"Skipped Files:":"Failed Files:";const x=document.createElement("ul");x.id=`${r}-list`,x.style.cssText=`
          list-style-type: none;
          padding-left: 0;
          margin: 0;
      `,h.appendChild(y),h.appendChild(x),f.appendChild(h)}),e.appendChild(f),document.body.appendChild(e);const a=e.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),d=a[0],p=a[a.length-1];return e.addEventListener("keydown",function(r){r.key==="Tab"?r.shiftKey&&document.activeElement===d?(r.preventDefault(),p.focus()):!r.shiftKey&&document.activeElement===p&&(r.preventDefault(),d.focus()):r.key==="Escape"&&E()}),e}function b(){const t=document.getElementById("page-download-toast");if(t){document.getElementById("success-list").innerHTML="",document.getElementById("skipped-list").innerHTML="",document.getElementById("failed-list").innerHTML="",document.getElementById("success-files").style.display="none",document.getElementById("skipped-files").style.display="none",document.getElementById("failed-files").style.display="none",document.getElementById("file-status-container").style.display="none";const e=document.getElementById("page-download-status");e.textContent="Downloading page: 0%";const n=document.getElementById("page-download-progress-fill");n&&(n.style.width="0%",n.style.backgroundColor="#4688F1"),t.style.display="flex",t.style.opacity="1"}else w(),b()}function E(){const t=document.getElementById("page-download-toast");t&&(t.style.opacity="0",setTimeout(()=>{t.style.display="none"},300))}function C(t){if(document.getElementById("page-download-toast")){const n=document.getElementById("page-download-status");n.textContent=`Downloading page: ${t}%`;const o=document.getElementById("page-download-progress-fill");o&&(o.style.width=`${t}%`)}}function A(t){if(document.getElementById("page-download-toast")){const n=document.getElementById("page-download-status");n.textContent=`Download complete: ${t}`;const o=document.getElementById("page-download-progress-fill");o&&(o.style.width="100%",o.style.backgroundColor="#4CAF50");const l=document.getElementById("file-status-container");l&&(document.getElementById("success-list").children.length>0||document.getElementById("skipped-list").children.length>0||document.getElementById("failed-list").children.length>0)&&(l.style.display="block")}}function T(t,e,n){if(!document.getElementById("page-download-toast"))return;const l=`${e}-list`,c=document.getElementById(l);if(!c)return;document.getElementById(`${e}-files`).style.display="block",document.getElementById("file-status-container").style.display="block";const u=document.createElement("li");u.style.cssText=`
    margin-bottom: 3px;
    display: flex;
    align-items: flex-start;
  `;const s=document.createElement("span");s.style.cssText=`
    margin-right: 5px;
    font-weight: bold;
  `;const g=t.split("/").pop().split("?")[0];let f=g.length>30?g.substring(0,27)+"...":g;const i=document.createElement("div");if(i.style.wordBreak="break-word",e==="success"){s.innerHTML="\u2713",s.setAttribute("aria-hidden","true"),s.style.color="#4CAF50";const a=document.createElement("span");a.textContent="Success: ",a.className="sr-only";const d=document.createElement("span");if(d.setAttribute("title",t),d.textContent=f,i.appendChild(a),i.appendChild(d),n){i.appendChild(document.createElement("br"));const p=document.createElement("small");p.textContent=n,i.appendChild(p)}}else if(e==="skipped"){s.innerHTML="\u26A0\uFE0F",s.setAttribute("aria-hidden","true"),s.style.color="#FFC107";const a=document.createElement("span");a.textContent="Skipped: ",a.className="sr-only";const d=document.createElement("span");if(d.setAttribute("title",t),d.textContent=f,i.appendChild(a),i.appendChild(d),n){i.appendChild(document.createElement("br"));const p=document.createElement("small");p.textContent=n,i.appendChild(p)}}else{s.innerHTML="\u2717",s.setAttribute("aria-hidden","true"),s.style.color="#F44336";const a=document.createElement("span");a.textContent="Failed: ",a.className="sr-only";const d=document.createElement("span");if(d.setAttribute("title",t),d.textContent=f,i.appendChild(a),i.appendChild(d),n){i.appendChild(document.createElement("br"));const p=document.createElement("small");p.textContent=n,i.appendChild(p)}}u.appendChild(s),u.appendChild(i),c.appendChild(u)}function v(t){const n=new DOMParser().parseFromString(t,"text/html"),o=n.getElementById("page-download-toast");return o&&o.remove(),n.querySelectorAll("#page-download-progress-bar, #page-download-progress-fill, #page-download-status, #file-status-container, .page-download-extension-element").forEach(c=>c.remove()),n.documentElement.outerHTML}function m(t,e,n){try{if(!t||t.startsWith("data:")&&e!=="image")return;const o=t.replace(/^['"](.*)['"]$/,"$1"),l=new URL(o,window.location.href).href;n.has(l)||n.set(l,{url:l,type:e,filename:o.startsWith("data:")?`data-image-${n.size}.png`:l.split("/").pop().split("?")[0]})}catch(o){console.warn(`Skipping invalid URL: ${t}`,o)}}function B(){const t=new Map;return document.querySelectorAll("img[src]").forEach(e=>{m(e.getAttribute("src"),"image",t)}),document.querySelectorAll("link[rel='stylesheet'][href]").forEach(e=>{m(e.getAttribute("href"),"css",t)}),document.querySelectorAll("script[src]").forEach(e=>{m(e.getAttribute("src"),"js",t)}),document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(e=>{m(e.getAttribute("href"),"font",t)}),document.querySelectorAll("video source[src]").forEach(e=>{m(e.getAttribute("src"),"video",t)}),document.querySelectorAll("[style]").forEach(e=>{const n=e.getAttribute("style"),o=/url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;let l;for(;(l=o.exec(n))!==null;)m(l[2],"image",t)}),document.querySelectorAll("style").forEach(e=>{const n=e.textContent,o=/url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;let l;for(;(l=o.exec(n))!==null;)m(l[2],"image",t)}),document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(e=>{m(e.getAttribute("href"),"font",t)}),document.querySelectorAll("link[href]").forEach(e=>{const n=e.getAttribute("href");n&&/\.(woff2?|ttf|otf|eot)($|\?)/.test(n)&&m(n,"font",t)}),document.querySelectorAll("style").forEach(e=>{const n=e.textContent,o=/url\s*\(\s*['"]?([^'")]+\.(woff2?|ttf|otf|eot))['"]?\s*\)/gi;let l;for(;(l=o.exec(n))!==null;)m(l[1],"font",t)}),[...t.values()]}(function(){w();function t(){try{const n=window.location.hostname.replace(/^www\./,""),o=v(document.documentElement.outerHTML),l=B();console.log("Resources found:",l),chrome.runtime.sendMessage({type:"PAGE_DATA",data:{domain:n,html:o,resources:l,url:window.location.href}})}catch(e){console.error("Error in content script:",e)}}chrome.runtime.onMessage.addListener((e,n,o)=>(e.type==="DOWNLOAD_PROGRESS"?C(e.percentage):e.type==="DOWNLOAD_COMPLETE"?A(e.filename):e.type==="DOWNLOAD_STARTED"?b():e.type==="FILE_STATUS"?T(e.url,e.status,e.reason):e.type==="LOG"?e.level&&console[e.level]?console[e.level](`[Background] ${e.message}`):console.log(`[Background] ${e.message}`):e.type==="TRIGGER_DOWNLOAD"&&(t(),o&&o({success:!0})),!0))})();
