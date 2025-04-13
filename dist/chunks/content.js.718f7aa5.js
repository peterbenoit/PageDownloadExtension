(function(){function x(){const e=document.getElementById("page-download-toast");e&&e.remove();const o=document.createElement("div");o.id="page-download-toast",o.setAttribute("role","alert"),o.setAttribute("aria-live","assertive"),o.style.cssText=`
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
        `;const l=document.createElement("style");l.textContent=`
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
        `,document.head.appendChild(l);const a=document.createElement("div");a.style.cssText=`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            padding-bottom: 12px;
        `;const i=document.createElement("div");i.textContent="Page Download",i.style.cssText=`
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
        `,c.onmouseover=()=>{c.style.color="white"},c.onmouseout=()=>{c.style.color="rgba(255, 255, 255, 0.8)"},c.onclick=()=>{w()},a.appendChild(i),a.appendChild(c),o.appendChild(a);const t=document.createElement("div");t.id="page-download-status",t.textContent="Downloading page: 0%",t.style.cssText=`
			font-size: 11px;
		`,o.appendChild(t);const n=document.createElement("div");n.id="page-download-progress-bar",n.style.cssText=`
            width: 100%;
            background-color: rgba(255, 255, 255, 0.1);
            height: 6px;
            margin-top: 10px;
            margin-bottom: 14px;
            border-radius: 6px;
            overflow: hidden;
        `;const d=document.createElement("div");d.id="page-download-progress-fill",d.style.cssText=`
            height: 100%;
            background-color: #4688F1;
            width: 0%;
            transition: width 0.3s ease;
        `,n.appendChild(d),o.appendChild(n);const s=document.createElement("div");s.id="file-status-container",s.style.cssText=`
            max-height: 250px;
            overflow-y: auto;
            margin-top: 12px;
            font-size: 11px;
            display: none;
            padding-right: 5px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        `,["success","skipped","failed"].forEach(u=>{const f=document.createElement("div");f.id=`${u}-files`,f.style.cssText=`
                margin-bottom: 10px;
                display: none;
            `;const h=document.createElement("div");h.style.cssText=`
                font-weight: bold;
                margin-bottom: 5px;
                color: ${u==="success"?"#4CAF50":u==="skipped"?"#FFC107":"#F44336"};
            `,h.textContent=u==="success"?"Downloaded Files:":u==="skipped"?"Skipped Files:":"Failed Files:";const y=document.createElement("ul");y.id=`${u}-list`,y.style.cssText=`
                list-style-type: none;
                padding-left: 0;
                margin: 0;
            `,f.appendChild(h),f.appendChild(y),s.appendChild(f)}),o.appendChild(s),document.body.appendChild(o);const p=o.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),m=p[0],g=p[p.length-1];return o.addEventListener("keydown",function(u){u.key==="Tab"?u.shiftKey&&document.activeElement===m?(u.preventDefault(),g.focus()):!u.shiftKey&&document.activeElement===g&&(u.preventDefault(),m.focus()):u.key==="Escape"&&w()}),o}x(),chrome.runtime.onMessage.addListener((e,o,l)=>{e.type==="DOWNLOAD_PROGRESS"?b(e.percentage):e.type==="DOWNLOAD_COMPLETE"?C(e.filename):e.type==="DOWNLOAD_STARTED"?E():e.type==="FILE_STATUS"?A(e.url,e.status,e.reason):e.type==="LOG"&&(e.level&&console[e.level]?console[e.level](`[Background] ${e.message}`):console.log(`[Background] ${e.message}`))});function E(){const e=document.getElementById("page-download-toast");if(e){document.getElementById("success-list").innerHTML="",document.getElementById("skipped-list").innerHTML="",document.getElementById("failed-list").innerHTML="",document.getElementById("success-files").style.display="none",document.getElementById("skipped-files").style.display="none",document.getElementById("failed-files").style.display="none",document.getElementById("file-status-container").style.display="none";const o=document.getElementById("page-download-status");o.textContent="Downloading page: 0%";const l=document.getElementById("page-download-progress-fill");l&&(l.style.width="0%",l.style.backgroundColor="#4688F1"),e.style.display="flex",e.style.opacity="1"}else x(),E()}function w(){const e=document.getElementById("page-download-toast");e&&(e.style.opacity="0",setTimeout(()=>{e.style.display="none"},300))}function b(e){if(document.getElementById("page-download-toast")){const l=document.getElementById("page-download-status");l.textContent=`Downloading page: ${e}%`;const a=document.getElementById("page-download-progress-fill");a&&(a.style.width=`${e}%`)}}function C(e){if(document.getElementById("page-download-toast")){const l=document.getElementById("page-download-status");l.textContent=`Download complete: ${e}`;const a=document.getElementById("page-download-progress-fill");a&&(a.style.width="100%",a.style.backgroundColor="#4CAF50");const i=document.getElementById("file-status-container");i&&(document.getElementById("success-list").children.length>0||document.getElementById("skipped-list").children.length>0||document.getElementById("failed-list").children.length>0)&&(i.style.display="block")}}function A(e,o,l){if(!document.getElementById("page-download-toast"))return;const i=`${o}-list`,c=document.getElementById(i);if(!c)return;document.getElementById(`${o}-files`).style.display="block",document.getElementById("file-status-container").style.display="block";const t=document.createElement("li");t.style.cssText=`
			margin-bottom: 3px;
			display: flex;
			align-items: flex-start;
		`;const n=document.createElement("span");n.style.cssText=`
			margin-right: 5px;
			font-weight: bold;
		`;const d=e.split("/").pop().split("?")[0];let s=d.length>30?d.substring(0,27)+"...":d;const r=document.createElement("div");if(r.style.wordBreak="break-word",o==="success"){n.innerHTML="\u2713",n.setAttribute("aria-hidden","true"),n.style.color="#4CAF50";const p=document.createElement("span");p.textContent="Success: ",p.className="sr-only";const m=document.createElement("span");if(m.setAttribute("title",e),m.textContent=s,r.appendChild(p),r.appendChild(m),l){r.appendChild(document.createElement("br"));const g=document.createElement("small");g.textContent=l,r.appendChild(g)}}else if(o==="skipped"){n.innerHTML="\u26A0\uFE0F",n.setAttribute("aria-hidden","true"),n.style.color="#FFC107";const p=document.createElement("span");p.textContent="Skipped: ",p.className="sr-only";const m=document.createElement("span");if(m.setAttribute("title",e),m.textContent=s,r.appendChild(p),r.appendChild(m),l){r.appendChild(document.createElement("br"));const g=document.createElement("small");g.textContent=l,r.appendChild(g)}}else{n.innerHTML="\u2717",n.setAttribute("aria-hidden","true"),n.style.color="#F44336";const p=document.createElement("span");p.textContent="Failed: ",p.className="sr-only";const m=document.createElement("span");if(m.setAttribute("title",e),m.textContent=s,r.appendChild(p),r.appendChild(m),l){r.appendChild(document.createElement("br"));const g=document.createElement("small");g.textContent=l,r.appendChild(g)}}t.appendChild(n),t.appendChild(r),c.appendChild(t)}function T(e){const l=new DOMParser().parseFromString(e,"text/html"),a=l.getElementById("page-download-toast");return a&&a.remove(),l.querySelectorAll("#page-download-progress-bar, #page-download-progress-fill, #page-download-status, #file-status-container, .page-download-extension-element").forEach(c=>c.remove()),l.documentElement.outerHTML}try{let i=function(t,n){try{if(!t||t.startsWith("data:")&&n!=="image")return;const d=t.replace(/^['"](.*)['"]$/,"$1"),s=new URL(d,window.location.href).href;a.has(s)||a.set(s,{url:s,type:n,filename:d.startsWith("data:")?`data-image-${a.size}.png`:s.split("/").pop().split("?")[0]})}catch(d){console.warn(`Skipping invalid URL: ${t}`,d)}};var v=i;const o=window.location.hostname.replace(/^www\./,""),l=T(document.documentElement.outerHTML),a=new Map;document.querySelectorAll("img[src]").forEach(t=>{i(t.getAttribute("src"),"image")}),document.querySelectorAll("link[rel='stylesheet'][href]").forEach(t=>{i(t.getAttribute("href"),"css")}),document.querySelectorAll("script[src]").forEach(t=>{i(t.getAttribute("src"),"js")}),document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(t=>{i(t.getAttribute("href"),"font")}),document.querySelectorAll("video source[src]").forEach(t=>{i(t.getAttribute("src"),"video")}),document.querySelectorAll("[style]").forEach(t=>{const n=t.getAttribute("style"),d=/url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;let s;for(;(s=d.exec(n))!==null;)i(s[2],"image")}),document.querySelectorAll("style").forEach(t=>{const n=t.textContent,d=/url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;let s;for(;(s=d.exec(n))!==null;)i(s[2],"image")}),document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(t=>{i(t.getAttribute("href"),"font")}),document.querySelectorAll("link[href]").forEach(t=>{const n=t.getAttribute("href");n&&/\.(woff2?|ttf|otf|eot)($|\?)/.test(n)&&i(n,"font")}),document.querySelectorAll("style").forEach(t=>{const n=t.textContent,d=/url\s*\(\s*['"]?([^'")]+\.(woff2?|ttf|otf|eot))['"]?\s*\)/gi;let s;for(;(s=d.exec(n))!==null;)i(s[1],"font")});const c=[...a.values()];console.log("Resources found:",c),chrome.runtime.sendMessage({type:"PAGE_DATA",data:{domain:o,html:l,resources:c,url:window.location.href}})}catch(e){console.error("Error in content script:",e)}})();
