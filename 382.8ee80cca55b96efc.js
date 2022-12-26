"use strict";(self.webpackChunkAdventOfCode=self.webpackChunkAdventOfCode||[]).push([[382],{382:(Le,V,K)=>{K.r(V),K.d(V,{MapControls:()=>ue,OrbitControls:()=>Z});const z={type:"change"},k={type:"start"},_={type:"end"};class Z extends THREE.EventDispatcher{constructor(H,w){super(),this.object=H,this.domElement=w,this.object=H,this.domElement=w,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new THREE.Vector3,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=2*Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN},this.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return s.phi},this.getAzimuthalAngle=function(){return s.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(t){t.addEventListener("keydown",ie),this._domElementKeyEvents=t},this.saveState=function(){e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=function(){e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(z),e.update(),i=a.NONE},this.update=function(){const t=new THREE.Vector3,n=(new THREE.Quaternion).setFromUnitVectors(H.up,new THREE.Vector3(0,1,0)),c=n.clone().invert(),r=new THREE.Vector3,l=new THREE.Quaternion,R=2*Math.PI;return function(){const le=e.object.position;t.copy(le).sub(e.target),t.applyQuaternion(n),s.setFromVector3(t),e.autoRotate&&i===a.NONE&&A(function he(){return 2*Math.PI/60/60*e.autoRotateSpeed}()),e.enableDamping?(s.theta+=u.theta*e.dampingFactor,s.phi+=u.phi*e.dampingFactor):(s.theta+=u.theta,s.phi+=u.phi);let p=e.minAzimuthAngle,h=e.maxAzimuthAngle;return isFinite(p)&&isFinite(h)&&(p<-Math.PI?p+=R:p>Math.PI&&(p-=R),h<-Math.PI?h+=R:h>Math.PI&&(h-=R),s.theta=p<=h?Math.max(p,Math.min(h,s.theta)):s.theta>(p+h)/2?Math.max(p,s.theta):Math.min(h,s.theta)),s.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,s.phi)),s.makeSafe(),s.radius*=L,s.radius=Math.max(e.minDistance,Math.min(e.maxDistance,s.radius)),!0===e.enableDamping?e.target.addScaledVector(T,e.dampingFactor):e.target.add(T),t.setFromSpherical(s),t.applyQuaternion(c),le.copy(e.target).add(t),e.object.lookAt(e.target),!0===e.enableDamping?(u.theta*=1-e.dampingFactor,u.phi*=1-e.dampingFactor,T.multiplyScalar(1-e.dampingFactor)):(u.set(0,0,0),T.set(0,0,0)),L=1,!!(S||r.distanceToSquared(e.object.position)>F||8*(1-l.dot(e.object.quaternion))>F)&&(e.dispatchEvent(z),r.copy(e.object.position),l.copy(e.object.quaternion),S=!1,!0)}}(),this.dispose=function(){e.domElement.removeEventListener("contextmenu",se),e.domElement.removeEventListener("pointerdown",ne),e.domElement.removeEventListener("pointercancel",oe),e.domElement.removeEventListener("wheel",ae),e.domElement.removeEventListener("pointermove",x),e.domElement.removeEventListener("pointerup",U),null!==e._domElementKeyEvents&&e._domElementKeyEvents.removeEventListener("keydown",ie)};const e=this,a={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let i=a.NONE;const F=1e-6,s=new THREE.Spherical,u=new THREE.Spherical;let L=1;const T=new THREE.Vector3;let S=!1;const m=new THREE.Vector2,f=new THREE.Vector2,b=new THREE.Vector2,d=new THREE.Vector2,E=new THREE.Vector2,y=new THREE.Vector2,g=new THREE.Vector2,O=new THREE.Vector2,M=new THREE.Vector2,o=[],D={};function N(){return Math.pow(.95,e.zoomSpeed)}function A(t){u.theta-=t}function C(t){u.phi-=t}const X=function(){const t=new THREE.Vector3;return function(c,r){t.setFromMatrixColumn(r,0),t.multiplyScalar(-c),T.add(t)}}(),v=function(){const t=new THREE.Vector3;return function(c,r){!0===e.screenSpacePanning?t.setFromMatrixColumn(r,1):(t.setFromMatrixColumn(r,0),t.crossVectors(e.object.up,t)),t.multiplyScalar(c),T.add(t)}}(),P=function(){const t=new THREE.Vector3;return function(c,r){const l=e.domElement;if(e.object.isPerspectiveCamera){t.copy(e.object.position).sub(e.target);let j=t.length();j*=Math.tan(e.object.fov/2*Math.PI/180),X(2*c*j/l.clientHeight,e.object.matrix),v(2*r*j/l.clientHeight,e.object.matrix)}else e.object.isOrthographicCamera?(X(c*(e.object.right-e.object.left)/e.object.zoom/l.clientWidth,e.object.matrix),v(r*(e.object.top-e.object.bottom)/e.object.zoom/l.clientHeight,e.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}}();function I(t){e.object.isPerspectiveCamera?L/=t:e.object.isOrthographicCamera?(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom*t)),e.object.updateProjectionMatrix(),S=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function W(t){e.object.isPerspectiveCamera?L*=t:e.object.isOrthographicCamera?(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/t)),e.object.updateProjectionMatrix(),S=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function B(t){m.set(t.clientX,t.clientY)}function G(t){d.set(t.clientX,t.clientY)}function q(){1===o.length?m.set(o[0].pageX,o[0].pageY):m.set(.5*(o[0].pageX+o[1].pageX),.5*(o[0].pageY+o[1].pageY))}function Q(){1===o.length?d.set(o[0].pageX,o[0].pageY):d.set(.5*(o[0].pageX+o[1].pageX),.5*(o[0].pageY+o[1].pageY))}function J(){const t=o[0].pageX-o[1].pageX,n=o[0].pageY-o[1].pageY,c=Math.sqrt(t*t+n*n);g.set(0,c)}function $(t){if(1==o.length)f.set(t.pageX,t.pageY);else{const c=Y(t);f.set(.5*(t.pageX+c.x),.5*(t.pageY+c.y))}b.subVectors(f,m).multiplyScalar(e.rotateSpeed);const n=e.domElement;A(2*Math.PI*b.x/n.clientHeight),C(2*Math.PI*b.y/n.clientHeight),m.copy(f)}function ee(t){if(1===o.length)E.set(t.pageX,t.pageY);else{const n=Y(t);E.set(.5*(t.pageX+n.x),.5*(t.pageY+n.y))}y.subVectors(E,d).multiplyScalar(e.panSpeed),P(y.x,y.y),d.copy(E)}function te(t){const n=Y(t),c=t.pageX-n.x,r=t.pageY-n.y,l=Math.sqrt(c*c+r*r);O.set(0,l),M.set(0,Math.pow(O.y/g.y,e.zoomSpeed)),I(M.y),g.copy(O)}function ne(t){!1!==e.enabled&&(0===o.length&&(e.domElement.setPointerCapture(t.pointerId),e.domElement.addEventListener("pointermove",x),e.domElement.addEventListener("pointerup",U)),function we(t){o.push(t)}(t),"touch"===t.pointerType?function Me(t){switch(re(t),o.length){case 1:switch(e.touches.ONE){case THREE.TOUCH.ROTATE:if(!1===e.enableRotate)return;q(),i=a.TOUCH_ROTATE;break;case THREE.TOUCH.PAN:if(!1===e.enablePan)return;Q(),i=a.TOUCH_PAN;break;default:i=a.NONE}break;case 2:switch(e.touches.TWO){case THREE.TOUCH.DOLLY_PAN:if(!1===e.enableZoom&&!1===e.enablePan)return;(function ye(){e.enableZoom&&J(),e.enablePan&&Q()})(),i=a.TOUCH_DOLLY_PAN;break;case THREE.TOUCH.DOLLY_ROTATE:if(!1===e.enableZoom&&!1===e.enableRotate)return;(function ge(){e.enableZoom&&J(),e.enableRotate&&q()})(),i=a.TOUCH_DOLLY_ROTATE;break;default:i=a.NONE}break;default:i=a.NONE}i!==a.NONE&&e.dispatchEvent(k)}(t):function Re(t){let n;switch(t.button){case 0:n=e.mouseButtons.LEFT;break;case 1:n=e.mouseButtons.MIDDLE;break;case 2:n=e.mouseButtons.RIGHT;break;default:n=-1}switch(n){case THREE.MOUSE.DOLLY:if(!1===e.enableZoom)return;(function me(t){g.set(t.clientX,t.clientY)})(t),i=a.DOLLY;break;case THREE.MOUSE.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(!1===e.enablePan)return;G(t),i=a.PAN}else{if(!1===e.enableRotate)return;B(t),i=a.ROTATE}break;case THREE.MOUSE.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(!1===e.enableRotate)return;B(t),i=a.ROTATE}else{if(!1===e.enablePan)return;G(t),i=a.PAN}break;default:i=a.NONE}i!==a.NONE&&e.dispatchEvent(k)}(t))}function x(t){!1!==e.enabled&&("touch"===t.pointerType?function Ae(t){switch(re(t),i){case a.TOUCH_ROTATE:if(!1===e.enableRotate)return;$(t),e.update();break;case a.TOUCH_PAN:if(!1===e.enablePan)return;ee(t),e.update();break;case a.TOUCH_DOLLY_PAN:if(!1===e.enableZoom&&!1===e.enablePan)return;(function Oe(t){e.enableZoom&&te(t),e.enablePan&&ee(t)})(t),e.update();break;case a.TOUCH_DOLLY_ROTATE:if(!1===e.enableZoom&&!1===e.enableRotate)return;(function Pe(t){e.enableZoom&&te(t),e.enableRotate&&$(t)})(t),e.update();break;default:i=a.NONE}}(t):function He(t){switch(i){case a.ROTATE:if(!1===e.enableRotate)return;!function fe(t){f.set(t.clientX,t.clientY),b.subVectors(f,m).multiplyScalar(e.rotateSpeed);const n=e.domElement;A(2*Math.PI*b.x/n.clientHeight),C(2*Math.PI*b.y/n.clientHeight),m.copy(f),e.update()}(t);break;case a.DOLLY:if(!1===e.enableZoom)return;!function de(t){O.set(t.clientX,t.clientY),M.subVectors(O,g),M.y>0?I(N()):M.y<0&&W(N()),g.copy(O),e.update()}(t);break;case a.PAN:if(!1===e.enablePan)return;!function Ee(t){E.set(t.clientX,t.clientY),y.subVectors(E,d).multiplyScalar(e.panSpeed),P(y.x,y.y),d.copy(E),e.update()}(t)}}(t))}function U(t){ce(t),0===o.length&&(e.domElement.releasePointerCapture(t.pointerId),e.domElement.removeEventListener("pointermove",x),e.domElement.removeEventListener("pointerup",U)),e.dispatchEvent(_),i=a.NONE}function oe(t){ce(t)}function ae(t){!1===e.enabled||!1===e.enableZoom||i!==a.NONE||(t.preventDefault(),e.dispatchEvent(k),function Te(t){t.deltaY<0?W(N()):t.deltaY>0&&I(N()),e.update()}(t),e.dispatchEvent(_))}function ie(t){!1===e.enabled||!1===e.enablePan||function be(t){let n=!1;switch(t.code){case e.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?C(2*Math.PI*e.rotateSpeed/e.domElement.clientHeight):P(0,e.keyPanSpeed),n=!0;break;case e.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?C(-2*Math.PI*e.rotateSpeed/e.domElement.clientHeight):P(0,-e.keyPanSpeed),n=!0;break;case e.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?A(2*Math.PI*e.rotateSpeed/e.domElement.clientHeight):P(e.keyPanSpeed,0),n=!0;break;case e.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?A(-2*Math.PI*e.rotateSpeed/e.domElement.clientHeight):P(-e.keyPanSpeed,0),n=!0}n&&(t.preventDefault(),e.update())}(t)}function se(t){!1!==e.enabled&&t.preventDefault()}function ce(t){delete D[t.pointerId];for(let n=0;n<o.length;n++)if(o[n].pointerId==t.pointerId)return void o.splice(n,1)}function re(t){let n=D[t.pointerId];void 0===n&&(n=new THREE.Vector2,D[t.pointerId]=n),n.set(t.pageX,t.pageY)}function Y(t){return D[(t.pointerId===o[0].pointerId?o[1]:o[0]).pointerId]}e.domElement.addEventListener("contextmenu",se),e.domElement.addEventListener("pointerdown",ne),e.domElement.addEventListener("pointercancel",oe),e.domElement.addEventListener("wheel",ae,{passive:!1}),this.update()}}class ue extends Z{constructor(H,w){super(H,w),this.screenSpacePanning=!1,this.mouseButtons.LEFT=THREE.MOUSE.PAN,this.mouseButtons.RIGHT=THREE.MOUSE.ROTATE,this.touches.ONE=THREE.TOUCH.PAN,this.touches.TWO=THREE.TOUCH.DOLLY_ROTATE}}}}]);