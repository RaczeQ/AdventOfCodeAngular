(()=>{"use strict";var e,m={3666:(e,f,i)=>{var _=i(8239);function o(u,t,a){u>0&&(t.filter(n=>"working"===n.state).forEach((n,p)=>{a.set(n.material,a.get(n.material)+u)}),t.filter(n=>"building"===n.state).forEach((n,p)=>{a.set(n.material,a.get(n.material)+u-1),n.state="working"}))}function s(u,t,a,n,p,v){if(void 0===n&&(n=new Map([["ore",0],["clay",0],["obsidian",0],["geode",0]])),void 0===p&&(p=new Map(["ore","clay","obsidian"].map(l=>[l,Math.max(...u.recipes.filter(c=>c.cost.has(l)).map(c=>c.cost.get(l)))]))).set("geode",1/0),void 0===v&&(v={materials:new Map([["ore",0],["clay",0],["obsidian",0],["geode",0]]),robots:a}),0==t)return{materials:n,robots:a};var x=function d(u,t,a){return u.get("geode")+t.filter(n=>"geode"===n.material&&"working"===n.state).length*a+t.filter(n=>"geode"===n.material&&"building"===n.state).length*(a-1)+Array.range(1,a).sum()}(n,a,t);if(x<=v.materials.get("geode"))return{materials:n,robots:a};if(a.some(l=>"building"===l.state))return o(1,a,n),s(u,t-1,a,n,p,v);var M=u.recipes.filter(l=>Array.from(l.cost.keys()).every(c=>a.some(h=>h.material===c))&&a.filter(c=>c.material===l.material).length<p.get(l.material)&&a.filter(c=>c.material===l.material).length*t+n.get(l.material)<p.get(l.material)*t).map(l=>{var c=new Map(Array.from(l.cost.entries()).map(([k,w])=>[k,Math.max(0,w-n.get(k))]));return{minutesToWait:Math.max(...Array.from(c.entries()).map(([k,w])=>Math.ceil(w/a.filter(T=>T.material===k).length))),recipe:l}}).filter(({minutesToWait:l})=>l<t&&t-l>1);if(M.length>0){for(let l=0;l<M.length;l++){const{minutesToWait:c,recipe:h}=M[l];var O=Object.assign([],a),y=new Map(n);o(c,O,y),h.cost.forEach((k,w)=>{y.set(w,y.get(w)-k)}),O.push({state:"building",material:h.material,minutesWorked:t-c-1});var A=s(u,t-c,O,y,p,v),P=A.materials;P.get("geode")>v.materials.get("geode")&&(v.materials=P,v.robots=A.robots)}return v}return o(t,a,n),{materials:n,robots:a}}i(6464),addEventListener("message",function(){var u=(0,_.Z)(function*({data:t}){console.log("Worker start",t[0].id);var{materials:a,robots:n}=s(t[0],t[1],t[2]);postMessage({blueprint:t[0],materials:a,robots:n})});return function(t){return u.apply(this,arguments)}}())}},b={};function r(e){var f=b[e];if(void 0!==f)return f.exports;var i=b[e]={exports:{}};return m[e](i,i.exports,r),i.exports}r.m=m,r.x=()=>{var e=r.O(void 0,[592],()=>r(3666));return r.O(e)},e=[],r.O=(f,i,_,g)=>{if(!i){var o=1/0;for(d=0;d<e.length;d++){for(var[i,_,g]=e[d],s=!0,u=0;u<i.length;u++)(!1&g||o>=g)&&Object.keys(r.O).every(x=>r.O[x](i[u]))?i.splice(u--,1):(s=!1,g<o&&(o=g));if(s){e.splice(d--,1);var t=_();void 0!==t&&(f=t)}}return f}g=g||0;for(var d=e.length;d>0&&e[d-1][2]>g;d--)e[d]=e[d-1];e[d]=[i,_,g]},r.d=(e,f)=>{for(var i in f)r.o(f,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:f[i]})},r.f={},r.e=e=>Promise.all(Object.keys(r.f).reduce((f,i)=>(r.f[i](e,f),f),[])),r.u=e=>"common.0c2750a1da74321c.js",r.miniCssF=e=>{},r.o=(e,f)=>Object.prototype.hasOwnProperty.call(e,f),(()=>{var e;r.tt=()=>(void 0===e&&(e={createScriptURL:f=>f},typeof trustedTypes<"u"&&trustedTypes.createPolicy&&(e=trustedTypes.createPolicy("angular#bundler",e))),e)})(),r.tu=e=>r.tt().createScriptURL(e),r.p="",(()=>{var e={150:1};r.f.i=(g,d)=>{e[g]||importScripts(r.tu(r.p+r.u(g)))};var i=self.webpackChunkAdventOfCode=self.webpackChunkAdventOfCode||[],_=i.push.bind(i);i.push=g=>{var[d,o,s]=g;for(var u in o)r.o(o,u)&&(r.m[u]=o[u]);for(s&&s(r);d.length;)e[d.pop()]=1;_(g)}})(),(()=>{var e=r.x;r.x=()=>r.e(592).then(e)})(),r.x()})();