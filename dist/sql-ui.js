"use strict";var XRAYSqlUI=(()=>{var xO=Object.create;var pp=Object.defineProperty;var gO=Object.getOwnPropertyDescriptor;var yO=Object.getOwnPropertyNames;var bO=Object.getPrototypeOf,IO=Object.prototype.hasOwnProperty;var vO=(t,e,n)=>e in t?pp(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var F=(t,e,n)=>()=>{if(n)throw n[0];try{return t&&(e=t(t=0)),e}catch(r){throw n=[r],r}};var An=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var wO=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of yO(e))!IO.call(t,o)&&o!==n&&pp(t,o,{get:()=>e[o],enumerable:!(r=gO(e,o))||r.enumerable});return t};var J=(t,e,n)=>(n=t!=null?xO(bO(t)):{},wO(e||!t||!t.__esModule?pp(n,"default",{value:t,enumerable:!0}):n,t));var ar=(t,e,n)=>vO(t,typeof e!="symbol"?e+"":e,n);var R0=An(De=>{"use strict";function gp(t,e){var n=t.length;t.push(e);e:for(;0<n;){var r=n-1>>>1,o=t[r];if(0<Uf(o,e))t[r]=e,t[n]=o,n=r;else break e}}function jn(t){return t.length===0?null:t[0]}function Vf(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var r=0,o=t.length,a=o>>>1;r<a;){var i=2*(r+1)-1,l=t[i],s=i+1,f=t[s];if(0>Uf(l,n))s<o&&0>Uf(f,l)?(t[r]=f,t[s]=n,r=s):(t[r]=l,t[i]=n,r=i);else if(s<o&&0>Uf(f,n))t[r]=f,t[s]=n,r=s;else break e}}return e}function Uf(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}De.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(w0=performance,De.unstable_now=function(){return w0.now()}):(mp=Date,S0=mp.now(),De.unstable_now=function(){return mp.now()-S0});var w0,mp,S0,ir=[],Vr=[],SO=1,an=null,pt=3,yp=!1,Al=!1,Tl=!1,bp=!1,A0=typeof setTimeout=="function"?setTimeout:null,T0=typeof clearTimeout=="function"?clearTimeout:null,k0=typeof setImmediate<"u"?setImmediate:null;function jf(t){for(var e=jn(Vr);e!==null;){if(e.callback===null)Vf(Vr);else if(e.startTime<=t)Vf(Vr),e.sortIndex=e.expirationTime,gp(ir,e);else break;e=jn(Vr)}}function Ip(t){if(Tl=!1,jf(t),!Al)if(jn(ir)!==null)Al=!0,ja||(ja=!0,Ua());else{var e=jn(Vr);e!==null&&vp(Ip,e.startTime-t)}}var ja=!1,Ml=-1,M0=5,D0=-1;function O0(){return bp?!0:!(De.unstable_now()-D0<M0)}function hp(){if(bp=!1,ja){var t=De.unstable_now();D0=t;var e=!0;try{e:{Al=!1,Tl&&(Tl=!1,T0(Ml),Ml=-1),yp=!0;var n=pt;try{t:{for(jf(t),an=jn(ir);an!==null&&!(an.expirationTime>t&&O0());){var r=an.callback;if(typeof r=="function"){an.callback=null,pt=an.priorityLevel;var o=r(an.expirationTime<=t);if(t=De.unstable_now(),typeof o=="function"){an.callback=o,jf(t),e=!0;break t}an===jn(ir)&&Vf(ir),jf(t)}else Vf(ir);an=jn(ir)}if(an!==null)e=!0;else{var a=jn(Vr);a!==null&&vp(Ip,a.startTime-t),e=!1}}break e}finally{an=null,pt=n,yp=!1}e=void 0}}finally{e?Ua():ja=!1}}}var Ua;typeof k0=="function"?Ua=function(){k0(hp)}:typeof MessageChannel<"u"?(xp=new MessageChannel,C0=xp.port2,xp.port1.onmessage=hp,Ua=function(){C0.postMessage(null)}):Ua=function(){A0(hp,0)};var xp,C0;function vp(t,e){Ml=A0(function(){t(De.unstable_now())},e)}De.unstable_IdlePriority=5;De.unstable_ImmediatePriority=1;De.unstable_LowPriority=4;De.unstable_NormalPriority=3;De.unstable_Profiling=null;De.unstable_UserBlockingPriority=2;De.unstable_cancelCallback=function(t){t.callback=null};De.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):M0=0<t?Math.floor(1e3/t):5};De.unstable_getCurrentPriorityLevel=function(){return pt};De.unstable_next=function(t){switch(pt){case 1:case 2:case 3:var e=3;break;default:e=pt}var n=pt;pt=e;try{return t()}finally{pt=n}};De.unstable_requestPaint=function(){bp=!0};De.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=pt;pt=t;try{return e()}finally{pt=n}};De.unstable_scheduleCallback=function(t,e,n){var r=De.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,t){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,t={id:SO++,callback:e,priorityLevel:t,startTime:n,expirationTime:o,sortIndex:-1},n>r?(t.sortIndex=n,gp(Vr,t),jn(ir)===null&&t===jn(Vr)&&(Tl?(T0(Ml),Ml=-1):Tl=!0,vp(Ip,n-r))):(t.sortIndex=o,gp(ir,t),Al||yp||(Al=!0,ja||(ja=!0,Ua()))),t};De.unstable_shouldYield=O0;De.unstable_wrapCallback=function(t){var e=pt;return function(){var n=pt;pt=e;try{return t.apply(this,arguments)}finally{pt=n}}}});var E0=An((zP,B0)=>{"use strict";B0.exports=R0()});var V0=An(W=>{"use strict";var kp=Symbol.for("react.transitional.element"),kO=Symbol.for("react.portal"),CO=Symbol.for("react.fragment"),AO=Symbol.for("react.strict_mode"),TO=Symbol.for("react.profiler"),MO=Symbol.for("react.consumer"),DO=Symbol.for("react.context"),OO=Symbol.for("react.forward_ref"),RO=Symbol.for("react.suspense"),BO=Symbol.for("react.memo"),P0=Symbol.for("react.lazy"),EO=Symbol.for("react.activity"),F0=Symbol.iterator;function FO(t){return t===null||typeof t!="object"?null:(t=F0&&t[F0]||t["@@iterator"],typeof t=="function"?t:null)}var _0={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},z0=Object.assign,H0={};function Ga(t,e,n){this.props=t,this.context=e,this.refs=H0,this.updater=n||_0}Ga.prototype.isReactComponent={};Ga.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Ga.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function U0(){}U0.prototype=Ga.prototype;function Cp(t,e,n){this.props=t,this.context=e,this.refs=H0,this.updater=n||_0}var Ap=Cp.prototype=new U0;Ap.constructor=Cp;z0(Ap,Ga.prototype);Ap.isPureReactComponent=!0;var L0=Array.isArray;function Sp(){}var Se={H:null,A:null,T:null,S:null},j0=Object.prototype.hasOwnProperty;function Tp(t,e,n){var r=n.ref;return{$$typeof:kp,type:t,key:e,ref:r!==void 0?r:null,props:n}}function LO(t,e){return Tp(t.type,e,t.props)}function Mp(t){return typeof t=="object"&&t!==null&&t.$$typeof===kp}function NO(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var N0=/\/+/g;function wp(t,e){return typeof t=="object"&&t!==null&&t.key!=null?NO(""+t.key):e.toString(36)}function qO(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(Sp,Sp):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Va(t,e,n,r,o){var a=typeof t;(a==="undefined"||a==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(a){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case kp:case kO:i=!0;break;case P0:return i=t._init,Va(i(t._payload),e,n,r,o)}}if(i)return o=o(t),i=r===""?"."+wp(t,0):r,L0(o)?(n="",i!=null&&(n=i.replace(N0,"$&/")+"/"),Va(o,e,n,"",function(f){return f})):o!=null&&(Mp(o)&&(o=LO(o,n+(o.key==null||t&&t.key===o.key?"":(""+o.key).replace(N0,"$&/")+"/")+i)),e.push(o)),1;i=0;var l=r===""?".":r+":";if(L0(t))for(var s=0;s<t.length;s++)r=t[s],a=l+wp(r,s),i+=Va(r,e,n,a,o);else if(s=FO(t),typeof s=="function")for(t=s.call(t),s=0;!(r=t.next()).done;)r=r.value,a=l+wp(r,s++),i+=Va(r,e,n,a,o);else if(a==="object"){if(typeof t.then=="function")return Va(qO(t),e,n,r,o);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Gf(t,e,n){if(t==null)return t;var r=[],o=0;return Va(t,r,"","",function(a){return e.call(n,a,o++)}),r}function PO(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var q0=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},_O={map:Gf,forEach:function(t,e,n){Gf(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Gf(t,function(){e++}),e},toArray:function(t){return Gf(t,function(e){return e})||[]},only:function(t){if(!Mp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};W.Activity=EO;W.Children=_O;W.Component=Ga;W.Fragment=CO;W.Profiler=TO;W.PureComponent=Cp;W.StrictMode=AO;W.Suspense=RO;W.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Se;W.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Se.H.useMemoCache(t)}};W.cache=function(t){return function(){return t.apply(null,arguments)}};W.cacheSignal=function(){return null};W.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var r=z0({},t.props),o=t.key;if(e!=null)for(a in e.key!==void 0&&(o=""+e.key),e)!j0.call(e,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&e.ref===void 0||(r[a]=e[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var i=Array(a),l=0;l<a;l++)i[l]=arguments[l+2];r.children=i}return Tp(t.type,o,r)};W.createContext=function(t){return t={$$typeof:DO,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:MO,_context:t},t};W.createElement=function(t,e,n){var r,o={},a=null;if(e!=null)for(r in e.key!==void 0&&(a=""+e.key),e)j0.call(e,r)&&r!=="key"&&r!=="__self"&&r!=="__source"&&(o[r]=e[r]);var i=arguments.length-2;if(i===1)o.children=n;else if(1<i){for(var l=Array(i),s=0;s<i;s++)l[s]=arguments[s+2];o.children=l}if(t&&t.defaultProps)for(r in i=t.defaultProps,i)o[r]===void 0&&(o[r]=i[r]);return Tp(t,a,o)};W.createRef=function(){return{current:null}};W.forwardRef=function(t){return{$$typeof:OO,render:t}};W.isValidElement=Mp;W.lazy=function(t){return{$$typeof:P0,_payload:{_status:-1,_result:t},_init:PO}};W.memo=function(t,e){return{$$typeof:BO,type:t,compare:e===void 0?null:e}};W.startTransition=function(t){var e=Se.T,n={};Se.T=n;try{var r=t(),o=Se.S;o!==null&&o(n,r),typeof r=="object"&&r!==null&&typeof r.then=="function"&&r.then(Sp,q0)}catch(a){q0(a)}finally{e!==null&&n.types!==null&&(e.types=n.types),Se.T=e}};W.unstable_useCacheRefresh=function(){return Se.H.useCacheRefresh()};W.use=function(t){return Se.H.use(t)};W.useActionState=function(t,e,n){return Se.H.useActionState(t,e,n)};W.useCallback=function(t,e){return Se.H.useCallback(t,e)};W.useContext=function(t){return Se.H.useContext(t)};W.useDebugValue=function(){};W.useDeferredValue=function(t,e){return Se.H.useDeferredValue(t,e)};W.useEffect=function(t,e){return Se.H.useEffect(t,e)};W.useEffectEvent=function(t){return Se.H.useEffectEvent(t)};W.useId=function(){return Se.H.useId()};W.useImperativeHandle=function(t,e,n){return Se.H.useImperativeHandle(t,e,n)};W.useInsertionEffect=function(t,e){return Se.H.useInsertionEffect(t,e)};W.useLayoutEffect=function(t,e){return Se.H.useLayoutEffect(t,e)};W.useMemo=function(t,e){return Se.H.useMemo(t,e)};W.useOptimistic=function(t,e){return Se.H.useOptimistic(t,e)};W.useReducer=function(t,e,n){return Se.H.useReducer(t,e,n)};W.useRef=function(t){return Se.H.useRef(t)};W.useState=function(t){return Se.H.useState(t)};W.useSyncExternalStore=function(t,e,n){return Se.H.useSyncExternalStore(t,e,n)};W.useTransition=function(){return Se.H.useTransition()};W.version="19.2.6"});var bt=An((UP,G0)=>{"use strict";G0.exports=V0()});var X0=An(vt=>{"use strict";var zO=bt();function Q0(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Gr(){}var It={d:{f:Gr,r:function(){throw Error(Q0(522))},D:Gr,C:Gr,L:Gr,m:Gr,X:Gr,S:Gr,M:Gr},p:0,findDOMNode:null},HO=Symbol.for("react.portal");function UO(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:HO,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}var Dl=zO.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Qf(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}vt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=It;vt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Q0(299));return UO(t,e,null,n)};vt.flushSync=function(t){var e=Dl.T,n=It.p;try{if(Dl.T=null,It.p=2,t)return t()}finally{Dl.T=e,It.p=n,It.d.f()}};vt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,It.d.C(t,e))};vt.prefetchDNS=function(t){typeof t=="string"&&It.d.D(t)};vt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,r=Qf(n,e.crossOrigin),o=typeof e.integrity=="string"?e.integrity:void 0,a=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?It.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:r,integrity:o,fetchPriority:a}):n==="script"&&It.d.X(t,{crossOrigin:r,integrity:o,fetchPriority:a,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};vt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Qf(e.as,e.crossOrigin);It.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&It.d.M(t)};vt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,r=Qf(n,e.crossOrigin);It.d.L(t,n,{crossOrigin:r,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};vt.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Qf(e.as,e.crossOrigin);It.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else It.d.m(t)};vt.requestFormReset=function(t){It.d.r(t)};vt.unstable_batchedUpdates=function(t,e){return t(e)};vt.useFormState=function(t,e,n){return Dl.H.useFormState(t,e,n)};vt.useFormStatus=function(){return Dl.H.useHostTransitionStatus()};vt.version="19.2.6"});var Dp=An((VP,K0)=>{"use strict";function W0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(W0)}catch(t){console.error(t)}}W0(),K0.exports=X0()});var lS=An(gu=>{"use strict";var Ke=E0(),vv=bt(),jO=Dp();function D(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function wv(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function hs(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Sv(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function kv(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Y0(t){if(hs(t)!==t)throw Error(D(188))}function VO(t){var e=t.alternate;if(!e){if(e=hs(t),e===null)throw Error(D(188));return e!==t?null:t}for(var n=t,r=e;;){var o=n.return;if(o===null)break;var a=o.alternate;if(a===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===a.child){for(a=o.child;a;){if(a===n)return Y0(o),t;if(a===r)return Y0(o),e;a=a.sibling}throw Error(D(188))}if(n.return!==r.return)n=o,r=a;else{for(var i=!1,l=o.child;l;){if(l===n){i=!0,n=o,r=a;break}if(l===r){i=!0,r=o,n=a;break}l=l.sibling}if(!i){for(l=a.child;l;){if(l===n){i=!0,n=a,r=o;break}if(l===r){i=!0,r=a,n=o;break}l=l.sibling}if(!i)throw Error(D(189))}}if(n.alternate!==r)throw Error(D(190))}if(n.tag!==3)throw Error(D(188));return n.stateNode.current===n?t:e}function Cv(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=Cv(t),e!==null)return e;t=t.sibling}return null}var Ae=Object.assign,GO=Symbol.for("react.element"),Xf=Symbol.for("react.transitional.element"),ql=Symbol.for("react.portal"),Ja=Symbol.for("react.fragment"),Av=Symbol.for("react.strict_mode"),fm=Symbol.for("react.profiler"),Tv=Symbol.for("react.consumer"),mr=Symbol.for("react.context"),oh=Symbol.for("react.forward_ref"),cm=Symbol.for("react.suspense"),um=Symbol.for("react.suspense_list"),ah=Symbol.for("react.memo"),Qr=Symbol.for("react.lazy"),dm=Symbol.for("react.activity"),QO=Symbol.for("react.memo_cache_sentinel"),J0=Symbol.iterator;function Ol(t){return t===null||typeof t!="object"?null:(t=J0&&t[J0]||t["@@iterator"],typeof t=="function"?t:null)}var XO=Symbol.for("react.client.reference");function pm(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===XO?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Ja:return"Fragment";case fm:return"Profiler";case Av:return"StrictMode";case cm:return"Suspense";case um:return"SuspenseList";case dm:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case ql:return"Portal";case mr:return t.displayName||"Context";case Tv:return(t._context.displayName||"Context")+".Consumer";case oh:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case ah:return e=t.displayName||null,e!==null?e:pm(t.type)||"Memo";case Qr:e=t._payload,t=t._init;try{return pm(t(e))}catch{}}return null}var Pl=Array.isArray,G=vv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ie=jO.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Xo={pending:!1,data:null,method:null,action:null},mm=[],$a=-1;function Wn(t){return{current:t}}function et(t){0>$a||(t.current=mm[$a],mm[$a]=null,$a--)}function be(t,e){$a++,mm[$a]=t.current,t.current=e}var Xn=Wn(null),ts=Wn(null),ro=Wn(null),Ac=Wn(null);function Tc(t,e){switch(be(ro,e),be(ts,t),be(Xn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?ov(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=ov(e),t=X1(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}et(Xn),be(Xn,t)}function xi(){et(Xn),et(ts),et(ro)}function hm(t){t.memoizedState!==null&&be(Ac,t);var e=Xn.current,n=X1(e,t.type);e!==n&&(be(ts,t),be(Xn,n))}function Mc(t){ts.current===t&&(et(Xn),et(ts)),Ac.current===t&&(et(Ac),ds._currentValue=Xo)}var Op,$0;function jo(t){if(Op===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Op=e&&e[1]||"",$0=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Op+t+$0}var Rp=!1;function Bp(t,e){if(!t||Rp)return"";Rp=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(e){var u=function(){throw Error()};if(Object.defineProperty(u.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(u,[])}catch(p){var d=p}Reflect.construct(t,[],u)}else{try{u.call()}catch(p){d=p}t.call(u.prototype)}}else{try{throw Error()}catch(p){d=p}(u=t())&&typeof u.catch=="function"&&u.catch(function(){})}}catch(p){if(p&&d&&typeof p.stack=="string")return[p.stack,d.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=r.DetermineComponentFrameRoot(),i=a[0],l=a[1];if(i&&l){var s=i.split(`
`),f=l.split(`
`);for(o=r=0;r<s.length&&!s[r].includes("DetermineComponentFrameRoot");)r++;for(;o<f.length&&!f[o].includes("DetermineComponentFrameRoot");)o++;if(r===s.length||o===f.length)for(r=s.length-1,o=f.length-1;1<=r&&0<=o&&s[r]!==f[o];)o--;for(;1<=r&&0<=o;r--,o--)if(s[r]!==f[o]){if(r!==1||o!==1)do if(r--,o--,0>o||s[r]!==f[o]){var c=`
`+s[r].replace(" at new "," at ");return t.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",t.displayName)),c}while(1<=r&&0<=o);break}}}finally{Rp=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?jo(n):""}function WO(t,e){switch(t.tag){case 26:case 27:case 5:return jo(t.type);case 16:return jo("Lazy");case 13:return t.child!==e&&e!==null?jo("Suspense Fallback"):jo("Suspense");case 19:return jo("SuspenseList");case 0:case 15:return Bp(t.type,!1);case 11:return Bp(t.type.render,!1);case 1:return Bp(t.type,!0);case 31:return jo("Activity");default:return""}}function Z0(t){try{var e="",n=null;do e+=WO(t,n),n=t,t=t.return;while(t);return e}catch(r){return`
Error generating stack: `+r.message+`
`+r.stack}}var xm=Object.prototype.hasOwnProperty,ih=Ke.unstable_scheduleCallback,Ep=Ke.unstable_cancelCallback,KO=Ke.unstable_shouldYield,YO=Ke.unstable_requestPaint,Qt=Ke.unstable_now,JO=Ke.unstable_getCurrentPriorityLevel,Mv=Ke.unstable_ImmediatePriority,Dv=Ke.unstable_UserBlockingPriority,Dc=Ke.unstable_NormalPriority,$O=Ke.unstable_LowPriority,Ov=Ke.unstable_IdlePriority,ZO=Ke.log,eR=Ke.unstable_setDisableYieldValue,xs=null,Xt=null;function $r(t){if(typeof ZO=="function"&&eR(t),Xt&&typeof Xt.setStrictMode=="function")try{Xt.setStrictMode(xs,t)}catch{}}var Wt=Math.clz32?Math.clz32:rR,tR=Math.log,nR=Math.LN2;function rR(t){return t>>>=0,t===0?32:31-(tR(t)/nR|0)|0}var Wf=256,Kf=262144,Yf=4194304;function Vo(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function tu(t,e,n){var r=t.pendingLanes;if(r===0)return 0;var o=0,a=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var l=r&134217727;return l!==0?(r=l&~a,r!==0?o=Vo(r):(i&=l,i!==0?o=Vo(i):n||(n=l&~t,n!==0&&(o=Vo(n))))):(l=r&~a,l!==0?o=Vo(l):i!==0?o=Vo(i):n||(n=r&~t,n!==0&&(o=Vo(n)))),o===0?0:e!==0&&e!==o&&(e&a)===0&&(a=o&-o,n=e&-e,a>=n||a===32&&(n&4194048)!==0)?e:o}function gs(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function oR(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Rv(){var t=Yf;return Yf<<=1,(Yf&62914560)===0&&(Yf=4194304),t}function Fp(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ys(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function aR(t,e,n,r,o,a){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var l=t.entanglements,s=t.expirationTimes,f=t.hiddenUpdates;for(n=i&~n;0<n;){var c=31-Wt(n),u=1<<c;l[c]=0,s[c]=-1;var d=f[c];if(d!==null)for(f[c]=null,c=0;c<d.length;c++){var p=d[c];p!==null&&(p.lane&=-536870913)}n&=~u}r!==0&&Bv(t,r,0),a!==0&&o===0&&t.tag!==0&&(t.suspendedLanes|=a&~(i&~e))}function Bv(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var r=31-Wt(e);t.entangledLanes|=e,t.entanglements[r]=t.entanglements[r]|1073741824|n&261930}function Ev(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-Wt(n),o=1<<r;o&e|t[r]&e&&(t[r]|=e),n&=~o}}function Fv(t,e){var n=e&-e;return n=(n&42)!==0?1:lh(n),(n&(t.suspendedLanes|e))!==0?0:n}function lh(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function sh(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Lv(){var t=ie.p;return t!==0?t:(t=window.event,t===void 0?32:oS(t.type))}function eI(t,e){var n=ie.p;try{return ie.p=t,e()}finally{ie.p=n}}var go=Math.random().toString(36).slice(2),st="__reactFiber$"+go,Ft="__reactProps$"+go,Ti="__reactContainer$"+go,gm="__reactEvents$"+go,iR="__reactListeners$"+go,lR="__reactHandles$"+go,tI="__reactResources$"+go,bs="__reactMarker$"+go;function fh(t){delete t[st],delete t[Ft],delete t[gm],delete t[iR],delete t[lR]}function Za(t){var e=t[st];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Ti]||n[st]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=fv(t);t!==null;){if(n=t[st])return n;t=fv(t)}return e}t=n,n=t.parentNode}return null}function Mi(t){if(t=t[st]||t[Ti]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function _l(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(D(33))}function fi(t){var e=t[tI];return e||(e=t[tI]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Ze(t){t[bs]=!0}var Nv=new Set,qv={};function ra(t,e){gi(t,e),gi(t+"Capture",e)}function gi(t,e){for(qv[t]=e,t=0;t<e.length;t++)Nv.add(e[t])}var sR=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),nI={},rI={};function fR(t){return xm.call(rI,t)?!0:xm.call(nI,t)?!1:sR.test(t)?rI[t]=!0:(nI[t]=!0,!1)}function uc(t,e,n){if(fR(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var r=e.toLowerCase().slice(0,5);if(r!=="data-"&&r!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Jf(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function lr(t,e,n,r){if(r===null)t.removeAttribute(n);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+r)}}function sn(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Pv(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function cR(t,e,n){var r=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var o=r.get,a=r.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return o.call(this)},set:function(i){n=""+i,a.call(this,i)}}),Object.defineProperty(t,e,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function ym(t){if(!t._valueTracker){var e=Pv(t)?"checked":"value";t._valueTracker=cR(t,e,""+t[e])}}function _v(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=Pv(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function Oc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var uR=/[\n"\\]/g;function un(t){return t.replace(uR,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function bm(t,e,n,r,o,a,i,l){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+sn(e)):t.value!==""+sn(e)&&(t.value=""+sn(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?Im(t,i,sn(e)):n!=null?Im(t,i,sn(n)):r!=null&&t.removeAttribute("value"),o==null&&a!=null&&(t.defaultChecked=!!a),o!=null&&(t.checked=o&&typeof o!="function"&&typeof o!="symbol"),l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?t.name=""+sn(l):t.removeAttribute("name")}function zv(t,e,n,r,o,a,i,l){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(t.type=a),e!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||e!=null)){ym(t);return}n=n!=null?""+sn(n):"",e=e!=null?""+sn(e):n,l||e===t.value||(t.value=e),t.defaultValue=e}r=r??o,r=typeof r!="function"&&typeof r!="symbol"&&!!r,t.checked=l?t.checked:!!r,t.defaultChecked=!!r,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),ym(t)}function Im(t,e,n){e==="number"&&Oc(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function ci(t,e,n,r){if(t=t.options,e){e={};for(var o=0;o<n.length;o++)e["$"+n[o]]=!0;for(n=0;n<t.length;n++)o=e.hasOwnProperty("$"+t[n].value),t[n].selected!==o&&(t[n].selected=o),o&&r&&(t[n].defaultSelected=!0)}else{for(n=""+sn(n),e=null,o=0;o<t.length;o++){if(t[o].value===n){t[o].selected=!0,r&&(t[o].defaultSelected=!0);return}e!==null||t[o].disabled||(e=t[o])}e!==null&&(e.selected=!0)}}function Hv(t,e,n){if(e!=null&&(e=""+sn(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+sn(n):""}function Uv(t,e,n,r){if(e==null){if(r!=null){if(n!=null)throw Error(D(92));if(Pl(r)){if(1<r.length)throw Error(D(93));r=r[0]}n=r}n==null&&(n=""),e=n}n=sn(e),t.defaultValue=n,r=t.textContent,r===n&&r!==""&&r!==null&&(t.value=r),ym(t)}function yi(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var dR=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function oI(t,e,n){var r=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?r?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":r?t.setProperty(e,n):typeof n!="number"||n===0||dR.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function jv(t,e,n){if(e!=null&&typeof e!="object")throw Error(D(62));if(t=t.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||e!=null&&e.hasOwnProperty(r)||(r.indexOf("--")===0?t.setProperty(r,""):r==="float"?t.cssFloat="":t[r]="");for(var o in e)r=e[o],e.hasOwnProperty(o)&&n[o]!==r&&oI(t,o,r)}else for(var a in e)e.hasOwnProperty(a)&&oI(t,a,e[a])}function ch(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var pR=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),mR=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function dc(t){return mR.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function hr(){}var vm=null;function uh(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var ei=null,ui=null;function aI(t){var e=Mi(t);if(e&&(t=e.stateNode)){var n=t[Ft]||null;e:switch(t=e.stateNode,e.type){case"input":if(bm(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+un(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var o=r[Ft]||null;if(!o)throw Error(D(90));bm(r,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(e=0;e<n.length;e++)r=n[e],r.form===t.form&&_v(r)}break e;case"textarea":Hv(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&ci(t,!!n.multiple,e,!1)}}}var Lp=!1;function Vv(t,e,n){if(Lp)return t(e,n);Lp=!0;try{var r=t(e);return r}finally{if(Lp=!1,(ei!==null||ui!==null)&&(pu(),ei&&(e=ei,t=ui,ui=ei=null,aI(e),t)))for(e=0;e<t.length;e++)aI(t[e])}}function ns(t,e){var n=t.stateNode;if(n===null)return null;var r=n[Ft]||null;if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(D(231,e,typeof n));return n}var Ir=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),wm=!1;if(Ir)try{Qa={},Object.defineProperty(Qa,"passive",{get:function(){wm=!0}}),window.addEventListener("test",Qa,Qa),window.removeEventListener("test",Qa,Qa)}catch{wm=!1}var Qa,Zr=null,dh=null,pc=null;function Gv(){if(pc)return pc;var t,e=dh,n=e.length,r,o="value"in Zr?Zr.value:Zr.textContent,a=o.length;for(t=0;t<n&&e[t]===o[t];t++);var i=n-t;for(r=1;r<=i&&e[n-r]===o[a-r];r++);return pc=o.slice(t,1<r?1-r:void 0)}function mc(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function $f(){return!0}function iI(){return!1}function Lt(t){function e(n,r,o,a,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=a,this.target=i,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(a):a[l]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?$f:iI,this.isPropagationStopped=iI,this}return Ae(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=$f)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=$f)},persist:function(){},isPersistent:$f}),e}var oa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},nu=Lt(oa),Is=Ae({},oa,{view:0,detail:0}),hR=Lt(Is),Np,qp,Rl,ru=Ae({},Is,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ph,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Rl&&(Rl&&t.type==="mousemove"?(Np=t.screenX-Rl.screenX,qp=t.screenY-Rl.screenY):qp=Np=0,Rl=t),Np)},movementY:function(t){return"movementY"in t?t.movementY:qp}}),lI=Lt(ru),xR=Ae({},ru,{dataTransfer:0}),gR=Lt(xR),yR=Ae({},Is,{relatedTarget:0}),Pp=Lt(yR),bR=Ae({},oa,{animationName:0,elapsedTime:0,pseudoElement:0}),IR=Lt(bR),vR=Ae({},oa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),wR=Lt(vR),SR=Ae({},oa,{data:0}),sI=Lt(SR),kR={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},CR={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},AR={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function TR(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=AR[t])?!!e[t]:!1}function ph(){return TR}var MR=Ae({},Is,{key:function(t){if(t.key){var e=kR[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=mc(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?CR[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ph,charCode:function(t){return t.type==="keypress"?mc(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?mc(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),DR=Lt(MR),OR=Ae({},ru,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),fI=Lt(OR),RR=Ae({},Is,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ph}),BR=Lt(RR),ER=Ae({},oa,{propertyName:0,elapsedTime:0,pseudoElement:0}),FR=Lt(ER),LR=Ae({},ru,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),NR=Lt(LR),qR=Ae({},oa,{newState:0,oldState:0}),PR=Lt(qR),_R=[9,13,27,32],mh=Ir&&"CompositionEvent"in window,Ul=null;Ir&&"documentMode"in document&&(Ul=document.documentMode);var zR=Ir&&"TextEvent"in window&&!Ul,Qv=Ir&&(!mh||Ul&&8<Ul&&11>=Ul),cI=" ",uI=!1;function Xv(t,e){switch(t){case"keyup":return _R.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Wv(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var ti=!1;function HR(t,e){switch(t){case"compositionend":return Wv(e);case"keypress":return e.which!==32?null:(uI=!0,cI);case"textInput":return t=e.data,t===cI&&uI?null:t;default:return null}}function UR(t,e){if(ti)return t==="compositionend"||!mh&&Xv(t,e)?(t=Gv(),pc=dh=Zr=null,ti=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Qv&&e.locale!=="ko"?null:e.data;default:return null}}var jR={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function dI(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!jR[t.type]:e==="textarea"}function Kv(t,e,n,r){ei?ui?ui.push(r):ui=[r]:ei=r,e=Wc(e,"onChange"),0<e.length&&(n=new nu("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var jl=null,rs=null;function VR(t){V1(t,0)}function ou(t){var e=_l(t);if(_v(e))return t}function pI(t,e){if(t==="change")return e}var Yv=!1;Ir&&(Ir?(ec="oninput"in document,ec||(_p=document.createElement("div"),_p.setAttribute("oninput","return;"),ec=typeof _p.oninput=="function"),Zf=ec):Zf=!1,Yv=Zf&&(!document.documentMode||9<document.documentMode));var Zf,ec,_p;function mI(){jl&&(jl.detachEvent("onpropertychange",Jv),rs=jl=null)}function Jv(t){if(t.propertyName==="value"&&ou(rs)){var e=[];Kv(e,rs,t,uh(t)),Vv(VR,e)}}function GR(t,e,n){t==="focusin"?(mI(),jl=e,rs=n,jl.attachEvent("onpropertychange",Jv)):t==="focusout"&&mI()}function QR(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return ou(rs)}function XR(t,e){if(t==="click")return ou(e)}function WR(t,e){if(t==="input"||t==="change")return ou(e)}function KR(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Yt=typeof Object.is=="function"?Object.is:KR;function os(t,e){if(Yt(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!xm.call(e,o)||!Yt(t[o],e[o]))return!1}return!0}function hI(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function xI(t,e){var n=hI(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=hI(n)}}function $v(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?$v(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Zv(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Oc(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Oc(t.document)}return e}function hh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var YR=Ir&&"documentMode"in document&&11>=document.documentMode,ni=null,Sm=null,Vl=null,km=!1;function gI(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;km||ni==null||ni!==Oc(r)||(r=ni,"selectionStart"in r&&hh(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Vl&&os(Vl,r)||(Vl=r,r=Wc(Sm,"onSelect"),0<r.length&&(e=new nu("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=ni)))}function Uo(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var ri={animationend:Uo("Animation","AnimationEnd"),animationiteration:Uo("Animation","AnimationIteration"),animationstart:Uo("Animation","AnimationStart"),transitionrun:Uo("Transition","TransitionRun"),transitionstart:Uo("Transition","TransitionStart"),transitioncancel:Uo("Transition","TransitionCancel"),transitionend:Uo("Transition","TransitionEnd")},zp={},ew={};Ir&&(ew=document.createElement("div").style,"AnimationEvent"in window||(delete ri.animationend.animation,delete ri.animationiteration.animation,delete ri.animationstart.animation),"TransitionEvent"in window||delete ri.transitionend.transition);function aa(t){if(zp[t])return zp[t];if(!ri[t])return t;var e=ri[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in ew)return zp[t]=e[n];return t}var tw=aa("animationend"),nw=aa("animationiteration"),rw=aa("animationstart"),JR=aa("transitionrun"),$R=aa("transitionstart"),ZR=aa("transitioncancel"),ow=aa("transitionend"),aw=new Map,Cm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Cm.push("scrollEnd");function Dn(t,e){aw.set(t,e),ra(e,[t])}var Rc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ln=[],oi=0,xh=0;function au(){for(var t=oi,e=xh=oi=0;e<t;){var n=ln[e];ln[e++]=null;var r=ln[e];ln[e++]=null;var o=ln[e];ln[e++]=null;var a=ln[e];if(ln[e++]=null,r!==null&&o!==null){var i=r.pending;i===null?o.next=o:(o.next=i.next,i.next=o),r.pending=o}a!==0&&iw(n,o,a)}}function iu(t,e,n,r){ln[oi++]=t,ln[oi++]=e,ln[oi++]=n,ln[oi++]=r,xh|=r,t.lanes|=r,t=t.alternate,t!==null&&(t.lanes|=r)}function gh(t,e,n,r){return iu(t,e,n,r),Bc(t)}function ia(t,e){return iu(t,null,null,e),Bc(t)}function iw(t,e,n){t.lanes|=n;var r=t.alternate;r!==null&&(r.lanes|=n);for(var o=!1,a=t.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(t=a.stateNode,t===null||t._visibility&1||(o=!0)),t=a,a=a.return;return t.tag===3?(a=t.stateNode,o&&e!==null&&(o=31-Wt(n),t=a.hiddenUpdates,r=t[o],r===null?t[o]=[e]:r.push(e),e.lane=n|536870912),a):null}function Bc(t){if(50<Zl)throw Zl=0,Qm=null,Error(D(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var ai={};function eB(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Vt(t,e,n,r){return new eB(t,e,n,r)}function yh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function gr(t,e){var n=t.alternate;return n===null?(n=Vt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function lw(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function hc(t,e,n,r,o,a){var i=0;if(r=t,typeof t=="function")yh(t)&&(i=1);else if(typeof t=="string")i=rE(t,n,Xn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case dm:return t=Vt(31,n,e,o),t.elementType=dm,t.lanes=a,t;case Ja:return Wo(n.children,o,a,e);case Av:i=8,o|=24;break;case fm:return t=Vt(12,n,e,o|2),t.elementType=fm,t.lanes=a,t;case cm:return t=Vt(13,n,e,o),t.elementType=cm,t.lanes=a,t;case um:return t=Vt(19,n,e,o),t.elementType=um,t.lanes=a,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case mr:i=10;break e;case Tv:i=9;break e;case oh:i=11;break e;case ah:i=14;break e;case Qr:i=16,r=null;break e}i=29,n=Error(D(130,t===null?"null":typeof t,"")),r=null}return e=Vt(i,n,e,o),e.elementType=t,e.type=r,e.lanes=a,e}function Wo(t,e,n,r){return t=Vt(7,t,r,e),t.lanes=n,t}function Hp(t,e,n){return t=Vt(6,t,null,e),t.lanes=n,t}function sw(t){var e=Vt(18,null,null,0);return e.stateNode=t,e}function Up(t,e,n){return e=Vt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var yI=new WeakMap;function dn(t,e){if(typeof t=="object"&&t!==null){var n=yI.get(t);return n!==void 0?n:(e={value:t,source:e,stack:Z0(e)},yI.set(t,e),e)}return{value:t,source:e,stack:Z0(e)}}var ii=[],li=0,Ec=null,as=0,fn=[],cn=0,po=null,Vn=1,Gn="";function dr(t,e){ii[li++]=as,ii[li++]=Ec,Ec=t,as=e}function fw(t,e,n){fn[cn++]=Vn,fn[cn++]=Gn,fn[cn++]=po,po=t;var r=Vn;t=Gn;var o=32-Wt(r)-1;r&=~(1<<o),n+=1;var a=32-Wt(e)+o;if(30<a){var i=o-o%5;a=(r&(1<<i)-1).toString(32),r>>=i,o-=i,Vn=1<<32-Wt(e)+o|n<<o|r,Gn=a+t}else Vn=1<<a|n<<o|r,Gn=t}function bh(t){t.return!==null&&(dr(t,1),fw(t,1,0))}function Ih(t){for(;t===Ec;)Ec=ii[--li],ii[li]=null,as=ii[--li],ii[li]=null;for(;t===po;)po=fn[--cn],fn[cn]=null,Gn=fn[--cn],fn[cn]=null,Vn=fn[--cn],fn[cn]=null}function cw(t,e){fn[cn++]=Vn,fn[cn++]=Gn,fn[cn++]=po,Vn=e.id,Gn=e.overflow,po=t}var ft=null,Ce=null,re=!1,oo=null,pn=!1,Am=Error(D(519));function mo(t){var e=Error(D(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw is(dn(e,t)),Am}function bI(t){var e=t.stateNode,n=t.type,r=t.memoizedProps;switch(e[st]=t,e[Ft]=r,n){case"dialog":$("cancel",e),$("close",e);break;case"iframe":case"object":case"embed":$("load",e);break;case"video":case"audio":for(n=0;n<cs.length;n++)$(cs[n],e);break;case"source":$("error",e);break;case"img":case"image":case"link":$("error",e),$("load",e);break;case"details":$("toggle",e);break;case"input":$("invalid",e),zv(e,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case"select":$("invalid",e);break;case"textarea":$("invalid",e),Uv(e,r.value,r.defaultValue,r.children)}n=r.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||r.suppressHydrationWarning===!0||Q1(e.textContent,n)?(r.popover!=null&&($("beforetoggle",e),$("toggle",e)),r.onScroll!=null&&$("scroll",e),r.onScrollEnd!=null&&$("scrollend",e),r.onClick!=null&&(e.onclick=hr),e=!0):e=!1,e||mo(t,!0)}function II(t){for(ft=t.return;ft;)switch(ft.tag){case 5:case 31:case 13:pn=!1;return;case 27:case 3:pn=!0;return;default:ft=ft.return}}function Xa(t){if(t!==ft)return!1;if(!re)return II(t),re=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Jm(t.type,t.memoizedProps)),n=!n),n&&Ce&&mo(t),II(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(D(317));Ce=sv(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(D(317));Ce=sv(t)}else e===27?(e=Ce,yo(t.type)?(t=th,th=null,Ce=t):Ce=e):Ce=ft?hn(t.stateNode.nextSibling):null;return!0}function $o(){Ce=ft=null,re=!1}function jp(){var t=oo;return t!==null&&(Bt===null?Bt=t:Bt.push.apply(Bt,t),oo=null),t}function is(t){oo===null?oo=[t]:oo.push(t)}var Tm=Wn(null),la=null,xr=null;function Wr(t,e,n){be(Tm,e._currentValue),e._currentValue=n}function yr(t){t._currentValue=Tm.current,et(Tm)}function Mm(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Dm(t,e,n,r){var o=t.child;for(o!==null&&(o.return=t);o!==null;){var a=o.dependencies;if(a!==null){var i=o.child;a=a.firstContext;e:for(;a!==null;){var l=a;a=o;for(var s=0;s<e.length;s++)if(l.context===e[s]){a.lanes|=n,l=a.alternate,l!==null&&(l.lanes|=n),Mm(a.return,n,t),r||(i=null);break e}a=l.next}}else if(o.tag===18){if(i=o.return,i===null)throw Error(D(341));i.lanes|=n,a=i.alternate,a!==null&&(a.lanes|=n),Mm(i,n,t),i=null}else i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===t){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}}function Di(t,e,n,r){t=null;for(var o=e,a=!1;o!==null;){if(!a){if((o.flags&524288)!==0)a=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var i=o.alternate;if(i===null)throw Error(D(387));if(i=i.memoizedProps,i!==null){var l=o.type;Yt(o.pendingProps.value,i.value)||(t!==null?t.push(l):t=[l])}}else if(o===Ac.current){if(i=o.alternate,i===null)throw Error(D(387));i.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(t!==null?t.push(ds):t=[ds])}o=o.return}t!==null&&Dm(e,t,n,r),e.flags|=262144}function Fc(t){for(t=t.firstContext;t!==null;){if(!Yt(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Zo(t){la=t,xr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function ct(t){return uw(la,t)}function tc(t,e){return la===null&&Zo(t),uw(t,e)}function uw(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},xr===null){if(t===null)throw Error(D(308));xr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else xr=xr.next=e;return n}var tB=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,r){t.push(r)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},nB=Ke.unstable_scheduleCallback,rB=Ke.unstable_NormalPriority,Ge={$$typeof:mr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function vh(){return{controller:new tB,data:new Map,refCount:0}}function vs(t){t.refCount--,t.refCount===0&&nB(rB,function(){t.controller.abort()})}var Gl=null,Om=0,bi=0,di=null;function oB(t,e){if(Gl===null){var n=Gl=[];Om=0,bi=Qh(),di={status:"pending",value:void 0,then:function(r){n.push(r)}}}return Om++,e.then(vI,vI),e}function vI(){if(--Om===0&&Gl!==null){di!==null&&(di.status="fulfilled");var t=Gl;Gl=null,bi=0,di=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function aB(t,e){var n=[],r={status:"pending",value:null,reason:null,then:function(o){n.push(o)}};return t.then(function(){r.status="fulfilled",r.value=e;for(var o=0;o<n.length;o++)(0,n[o])(e)},function(o){for(r.status="rejected",r.reason=o,o=0;o<n.length;o++)(0,n[o])(void 0)}),r}var wI=G.S;G.S=function(t,e){C1=Qt(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&oB(t,e),wI!==null&&wI(t,e)};var Ko=Wn(null);function wh(){var t=Ko.current;return t!==null?t:he.pooledCache}function xc(t,e){e===null?be(Ko,Ko.current):be(Ko,e.pool)}function dw(){var t=wh();return t===null?null:{parent:Ge._currentValue,pool:t}}var Oi=Error(D(460)),Sh=Error(D(474)),lu=Error(D(542)),Lc={then:function(){}};function SI(t){return t=t.status,t==="fulfilled"||t==="rejected"}function pw(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(hr,hr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,CI(t),t;default:if(typeof e.status=="string")e.then(hr,hr);else{if(t=he,t!==null&&100<t.shellSuspendCounter)throw Error(D(482));t=e,t.status="pending",t.then(function(r){if(e.status==="pending"){var o=e;o.status="fulfilled",o.value=r}},function(r){if(e.status==="pending"){var o=e;o.status="rejected",o.reason=r}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,CI(t),t}throw Yo=e,Oi}}function Go(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Yo=n,Oi):n}}var Yo=null;function kI(){if(Yo===null)throw Error(D(459));var t=Yo;return Yo=null,t}function CI(t){if(t===Oi||t===lu)throw Error(D(483))}var pi=null,ls=0;function nc(t){var e=ls;return ls+=1,pi===null&&(pi=[]),pw(pi,t,e)}function Bl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function rc(t,e){throw e.$$typeof===GO?Error(D(525)):(t=Object.prototype.toString.call(e),Error(D(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function mw(t){function e(m,g){if(t){var x=m.deletions;x===null?(m.deletions=[g],m.flags|=16):x.push(g)}}function n(m,g){if(!t)return null;for(;g!==null;)e(m,g),g=g.sibling;return null}function r(m){for(var g=new Map;m!==null;)m.key!==null?g.set(m.key,m):g.set(m.index,m),m=m.sibling;return g}function o(m,g){return m=gr(m,g),m.index=0,m.sibling=null,m}function a(m,g,x){return m.index=x,t?(x=m.alternate,x!==null?(x=x.index,x<g?(m.flags|=67108866,g):x):(m.flags|=67108866,g)):(m.flags|=1048576,g)}function i(m){return t&&m.alternate===null&&(m.flags|=67108866),m}function l(m,g,x,I){return g===null||g.tag!==6?(g=Hp(x,m.mode,I),g.return=m,g):(g=o(g,x),g.return=m,g)}function s(m,g,x,I){var v=x.type;return v===Ja?c(m,g,x.props.children,I,x.key):g!==null&&(g.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Qr&&Go(v)===g.type)?(g=o(g,x.props),Bl(g,x),g.return=m,g):(g=hc(x.type,x.key,x.props,null,m.mode,I),Bl(g,x),g.return=m,g)}function f(m,g,x,I){return g===null||g.tag!==4||g.stateNode.containerInfo!==x.containerInfo||g.stateNode.implementation!==x.implementation?(g=Up(x,m.mode,I),g.return=m,g):(g=o(g,x.children||[]),g.return=m,g)}function c(m,g,x,I,v){return g===null||g.tag!==7?(g=Wo(x,m.mode,I,v),g.return=m,g):(g=o(g,x),g.return=m,g)}function u(m,g,x){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return g=Hp(""+g,m.mode,x),g.return=m,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Xf:return x=hc(g.type,g.key,g.props,null,m.mode,x),Bl(x,g),x.return=m,x;case ql:return g=Up(g,m.mode,x),g.return=m,g;case Qr:return g=Go(g),u(m,g,x)}if(Pl(g)||Ol(g))return g=Wo(g,m.mode,x,null),g.return=m,g;if(typeof g.then=="function")return u(m,nc(g),x);if(g.$$typeof===mr)return u(m,tc(m,g),x);rc(m,g)}return null}function d(m,g,x,I){var v=g!==null?g.key:null;if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return v!==null?null:l(m,g,""+x,I);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Xf:return x.key===v?s(m,g,x,I):null;case ql:return x.key===v?f(m,g,x,I):null;case Qr:return x=Go(x),d(m,g,x,I)}if(Pl(x)||Ol(x))return v!==null?null:c(m,g,x,I,null);if(typeof x.then=="function")return d(m,g,nc(x),I);if(x.$$typeof===mr)return d(m,g,tc(m,x),I);rc(m,x)}return null}function p(m,g,x,I,v){if(typeof I=="string"&&I!==""||typeof I=="number"||typeof I=="bigint")return m=m.get(x)||null,l(g,m,""+I,v);if(typeof I=="object"&&I!==null){switch(I.$$typeof){case Xf:return m=m.get(I.key===null?x:I.key)||null,s(g,m,I,v);case ql:return m=m.get(I.key===null?x:I.key)||null,f(g,m,I,v);case Qr:return I=Go(I),p(m,g,x,I,v)}if(Pl(I)||Ol(I))return m=m.get(x)||null,c(g,m,I,v,null);if(typeof I.then=="function")return p(m,g,x,nc(I),v);if(I.$$typeof===mr)return p(m,g,x,tc(g,I),v);rc(g,I)}return null}function h(m,g,x,I){for(var v=null,w=null,S=g,k=g=0,M=null;S!==null&&k<x.length;k++){S.index>k?(M=S,S=null):M=S.sibling;var C=d(m,S,x[k],I);if(C===null){S===null&&(S=M);break}t&&S&&C.alternate===null&&e(m,S),g=a(C,g,k),w===null?v=C:w.sibling=C,w=C,S=M}if(k===x.length)return n(m,S),re&&dr(m,k),v;if(S===null){for(;k<x.length;k++)S=u(m,x[k],I),S!==null&&(g=a(S,g,k),w===null?v=S:w.sibling=S,w=S);return re&&dr(m,k),v}for(S=r(S);k<x.length;k++)M=p(S,m,k,x[k],I),M!==null&&(t&&M.alternate!==null&&S.delete(M.key===null?k:M.key),g=a(M,g,k),w===null?v=M:w.sibling=M,w=M);return t&&S.forEach(function(_){return e(m,_)}),re&&dr(m,k),v}function y(m,g,x,I){if(x==null)throw Error(D(151));for(var v=null,w=null,S=g,k=g=0,M=null,C=x.next();S!==null&&!C.done;k++,C=x.next()){S.index>k?(M=S,S=null):M=S.sibling;var _=d(m,S,C.value,I);if(_===null){S===null&&(S=M);break}t&&S&&_.alternate===null&&e(m,S),g=a(_,g,k),w===null?v=_:w.sibling=_,w=_,S=M}if(C.done)return n(m,S),re&&dr(m,k),v;if(S===null){for(;!C.done;k++,C=x.next())C=u(m,C.value,I),C!==null&&(g=a(C,g,k),w===null?v=C:w.sibling=C,w=C);return re&&dr(m,k),v}for(S=r(S);!C.done;k++,C=x.next())C=p(S,m,k,C.value,I),C!==null&&(t&&C.alternate!==null&&S.delete(C.key===null?k:C.key),g=a(C,g,k),w===null?v=C:w.sibling=C,w=C);return t&&S.forEach(function(L){return e(m,L)}),re&&dr(m,k),v}function b(m,g,x,I){if(typeof x=="object"&&x!==null&&x.type===Ja&&x.key===null&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case Xf:e:{for(var v=x.key;g!==null;){if(g.key===v){if(v=x.type,v===Ja){if(g.tag===7){n(m,g.sibling),I=o(g,x.props.children),I.return=m,m=I;break e}}else if(g.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Qr&&Go(v)===g.type){n(m,g.sibling),I=o(g,x.props),Bl(I,x),I.return=m,m=I;break e}n(m,g);break}else e(m,g);g=g.sibling}x.type===Ja?(I=Wo(x.props.children,m.mode,I,x.key),I.return=m,m=I):(I=hc(x.type,x.key,x.props,null,m.mode,I),Bl(I,x),I.return=m,m=I)}return i(m);case ql:e:{for(v=x.key;g!==null;){if(g.key===v)if(g.tag===4&&g.stateNode.containerInfo===x.containerInfo&&g.stateNode.implementation===x.implementation){n(m,g.sibling),I=o(g,x.children||[]),I.return=m,m=I;break e}else{n(m,g);break}else e(m,g);g=g.sibling}I=Up(x,m.mode,I),I.return=m,m=I}return i(m);case Qr:return x=Go(x),b(m,g,x,I)}if(Pl(x))return h(m,g,x,I);if(Ol(x)){if(v=Ol(x),typeof v!="function")throw Error(D(150));return x=v.call(x),y(m,g,x,I)}if(typeof x.then=="function")return b(m,g,nc(x),I);if(x.$$typeof===mr)return b(m,g,tc(m,x),I);rc(m,x)}return typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint"?(x=""+x,g!==null&&g.tag===6?(n(m,g.sibling),I=o(g,x),I.return=m,m=I):(n(m,g),I=Hp(x,m.mode,I),I.return=m,m=I),i(m)):n(m,g)}return function(m,g,x,I){try{ls=0;var v=b(m,g,x,I);return pi=null,v}catch(S){if(S===Oi||S===lu)throw S;var w=Vt(29,S,null,m.mode);return w.lanes=I,w.return=m,w}}}var ea=mw(!0),hw=mw(!1),Xr=!1;function kh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Rm(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function ao(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function io(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,(ae&2)!==0){var o=r.pending;return o===null?e.next=e:(e.next=o.next,o.next=e),r.pending=e,e=Bc(t),iw(t,null,n),e}return iu(t,r,e,n),Bc(t)}function Ql(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Ev(t,n)}}function Vp(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?o=a=i:a=a.next=i,n=n.next}while(n!==null);a===null?o=a=e:a=a.next=e}else o=a=e;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Bm=!1;function Xl(){if(Bm){var t=di;if(t!==null)throw t}}function Wl(t,e,n,r){Bm=!1;var o=t.updateQueue;Xr=!1;var a=o.firstBaseUpdate,i=o.lastBaseUpdate,l=o.shared.pending;if(l!==null){o.shared.pending=null;var s=l,f=s.next;s.next=null,i===null?a=f:i.next=f,i=s;var c=t.alternate;c!==null&&(c=c.updateQueue,l=c.lastBaseUpdate,l!==i&&(l===null?c.firstBaseUpdate=f:l.next=f,c.lastBaseUpdate=s))}if(a!==null){var u=o.baseState;i=0,c=f=s=null,l=a;do{var d=l.lane&-536870913,p=d!==l.lane;if(p?(te&d)===d:(r&d)===d){d!==0&&d===bi&&(Bm=!0),c!==null&&(c=c.next={lane:0,tag:l.tag,payload:l.payload,callback:null,next:null});e:{var h=t,y=l;d=e;var b=n;switch(y.tag){case 1:if(h=y.payload,typeof h=="function"){u=h.call(b,u,d);break e}u=h;break e;case 3:h.flags=h.flags&-65537|128;case 0:if(h=y.payload,d=typeof h=="function"?h.call(b,u,d):h,d==null)break e;u=Ae({},u,d);break e;case 2:Xr=!0}}d=l.callback,d!==null&&(t.flags|=64,p&&(t.flags|=8192),p=o.callbacks,p===null?o.callbacks=[d]:p.push(d))}else p={lane:d,tag:l.tag,payload:l.payload,callback:l.callback,next:null},c===null?(f=c=p,s=u):c=c.next=p,i|=d;if(l=l.next,l===null){if(l=o.shared.pending,l===null)break;p=l,l=p.next,p.next=null,o.lastBaseUpdate=p,o.shared.pending=null}}while(!0);c===null&&(s=u),o.baseState=s,o.firstBaseUpdate=f,o.lastBaseUpdate=c,a===null&&(o.shared.lanes=0),xo|=i,t.lanes=i,t.memoizedState=u}}function xw(t,e){if(typeof t!="function")throw Error(D(191,t));t.call(e)}function gw(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)xw(n[t],e)}var Ii=Wn(null),Nc=Wn(0);function AI(t,e){t=kr,be(Nc,t),be(Ii,e),kr=t|e.baseLanes}function Em(){be(Nc,kr),be(Ii,Ii.current)}function Ch(){kr=Nc.current,et(Ii),et(Nc)}var Jt=Wn(null),mn=null;function Kr(t){var e=t.alternate;be(ze,ze.current&1),be(Jt,t),mn===null&&(e===null||Ii.current!==null||e.memoizedState!==null)&&(mn=t)}function Fm(t){be(ze,ze.current),be(Jt,t),mn===null&&(mn=t)}function yw(t){t.tag===22?(be(ze,ze.current),be(Jt,t),mn===null&&(mn=t)):Yr(t)}function Yr(){be(ze,ze.current),be(Jt,Jt.current)}function jt(t){et(Jt),mn===t&&(mn=null),et(ze)}var ze=Wn(0);function qc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Zm(n)||eh(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var vr=0,K=null,me=null,je=null,Pc=!1,mi=!1,ta=!1,_c=0,ss=0,hi=null,iB=0;function Ne(){throw Error(D(321))}function Ah(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Yt(t[n],e[n]))return!1;return!0}function Th(t,e,n,r,o,a){return vr=a,K=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,G.H=t===null||t.memoizedState===null?Kw:Ph,ta=!1,a=n(r,o),ta=!1,mi&&(a=Iw(e,n,r,o)),bw(t),a}function bw(t){G.H=fs;var e=me!==null&&me.next!==null;if(vr=0,je=me=K=null,Pc=!1,ss=0,hi=null,e)throw Error(D(300));t===null||Qe||(t=t.dependencies,t!==null&&Fc(t)&&(Qe=!0))}function Iw(t,e,n,r){K=t;var o=0;do{if(mi&&(hi=null),ss=0,mi=!1,25<=o)throw Error(D(301));if(o+=1,je=me=null,t.updateQueue!=null){var a=t.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}G.H=Yw,a=e(n,r)}while(mi);return a}function lB(){var t=G.H,e=t.useState()[0];return e=typeof e.then=="function"?ws(e):e,t=t.useState()[0],(me!==null?me.memoizedState:null)!==t&&(K.flags|=1024),e}function Mh(){var t=_c!==0;return _c=0,t}function Dh(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Oh(t){if(Pc){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Pc=!1}vr=0,je=me=K=null,mi=!1,ss=_c=0,hi=null}function wt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return je===null?K.memoizedState=je=t:je=je.next=t,je}function He(){if(me===null){var t=K.alternate;t=t!==null?t.memoizedState:null}else t=me.next;var e=je===null?K.memoizedState:je.next;if(e!==null)je=e,me=t;else{if(t===null)throw K.alternate===null?Error(D(467)):Error(D(310));me=t,t={memoizedState:me.memoizedState,baseState:me.baseState,baseQueue:me.baseQueue,queue:me.queue,next:null},je===null?K.memoizedState=je=t:je=je.next=t}return je}function su(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function ws(t){var e=ss;return ss+=1,hi===null&&(hi=[]),t=pw(hi,t,e),e=K,(je===null?e.memoizedState:je.next)===null&&(e=e.alternate,G.H=e===null||e.memoizedState===null?Kw:Ph),t}function fu(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return ws(t);if(t.$$typeof===mr)return ct(t)}throw Error(D(438,String(t)))}function Rh(t){var e=null,n=K.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var r=K.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(e={data:r.data.map(function(o){return o.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=su(),K.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),r=0;r<t;r++)n[r]=QO;return e.index++,n}function wr(t,e){return typeof e=="function"?e(t):e}function gc(t){var e=He();return Bh(e,me,t)}function Bh(t,e,n){var r=t.queue;if(r===null)throw Error(D(311));r.lastRenderedReducer=n;var o=t.baseQueue,a=r.pending;if(a!==null){if(o!==null){var i=o.next;o.next=a.next,a.next=i}e.baseQueue=o=a,r.pending=null}if(a=t.baseState,o===null)t.memoizedState=a;else{e=o.next;var l=i=null,s=null,f=e,c=!1;do{var u=f.lane&-536870913;if(u!==f.lane?(te&u)===u:(vr&u)===u){var d=f.revertLane;if(d===0)s!==null&&(s=s.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),u===bi&&(c=!0);else if((vr&d)===d){f=f.next,d===bi&&(c=!0);continue}else u={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=u,i=a):s=s.next=u,K.lanes|=d,xo|=d;u=f.action,ta&&n(a,u),a=f.hasEagerState?f.eagerState:n(a,u)}else d={lane:u,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=d,i=a):s=s.next=d,K.lanes|=u,xo|=u;f=f.next}while(f!==null&&f!==e);if(s===null?i=a:s.next=l,!Yt(a,t.memoizedState)&&(Qe=!0,c&&(n=di,n!==null)))throw n;t.memoizedState=a,t.baseState=i,t.baseQueue=s,r.lastRenderedState=a}return o===null&&(r.lanes=0),[t.memoizedState,r.dispatch]}function Gp(t){var e=He(),n=e.queue;if(n===null)throw Error(D(311));n.lastRenderedReducer=t;var r=n.dispatch,o=n.pending,a=e.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do a=t(a,i.action),i=i.next;while(i!==o);Yt(a,e.memoizedState)||(Qe=!0),e.memoizedState=a,e.baseQueue===null&&(e.baseState=a),n.lastRenderedState=a}return[a,r]}function vw(t,e,n){var r=K,o=He(),a=re;if(a){if(n===void 0)throw Error(D(407));n=n()}else n=e();var i=!Yt((me||o).memoizedState,n);if(i&&(o.memoizedState=n,Qe=!0),o=o.queue,Eh(kw.bind(null,r,o,t),[t]),o.getSnapshot!==e||i||je!==null&&je.memoizedState.tag&1){if(r.flags|=2048,vi(9,{destroy:void 0},Sw.bind(null,r,o,n,e),null),he===null)throw Error(D(349));a||(vr&127)!==0||ww(r,e,n)}return n}function ww(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=K.updateQueue,e===null?(e=su(),K.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function Sw(t,e,n,r){e.value=n,e.getSnapshot=r,Cw(e)&&Aw(t)}function kw(t,e,n){return n(function(){Cw(e)&&Aw(t)})}function Cw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Yt(t,n)}catch{return!0}}function Aw(t){var e=ia(t,2);e!==null&&Et(e,t,2)}function Lm(t){var e=wt();if(typeof t=="function"){var n=t;if(t=n(),ta){$r(!0);try{n()}finally{$r(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:wr,lastRenderedState:t},e}function Tw(t,e,n,r){return t.baseState=n,Bh(t,me,typeof r=="function"?r:wr)}function sB(t,e,n,r,o){if(uu(t))throw Error(D(485));if(t=e.action,t!==null){var a={payload:o,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){a.listeners.push(i)}};G.T!==null?n(!0):a.isTransition=!1,r(a),n=e.pending,n===null?(a.next=e.pending=a,Mw(e,a)):(a.next=n.next,e.pending=n.next=a)}}function Mw(t,e){var n=e.action,r=e.payload,o=t.state;if(e.isTransition){var a=G.T,i={};G.T=i;try{var l=n(o,r),s=G.S;s!==null&&s(i,l),TI(t,e,l)}catch(f){Nm(t,e,f)}finally{a!==null&&i.types!==null&&(a.types=i.types),G.T=a}}else try{a=n(o,r),TI(t,e,a)}catch(f){Nm(t,e,f)}}function TI(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(r){MI(t,e,r)},function(r){return Nm(t,e,r)}):MI(t,e,n)}function MI(t,e,n){e.status="fulfilled",e.value=n,Dw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,Mw(t,n)))}function Nm(t,e,n){var r=t.pending;if(t.pending=null,r!==null){r=r.next;do e.status="rejected",e.reason=n,Dw(e),e=e.next;while(e!==r)}t.action=null}function Dw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function Ow(t,e){return e}function DI(t,e){if(re){var n=he.formState;if(n!==null){e:{var r=K;if(re){if(Ce){t:{for(var o=Ce,a=pn;o.nodeType!==8;){if(!a){o=null;break t}if(o=hn(o.nextSibling),o===null){o=null;break t}}a=o.data,o=a==="F!"||a==="F"?o:null}if(o){Ce=hn(o.nextSibling),r=o.data==="F!";break e}}mo(r)}r=!1}r&&(e=n[0])}}return n=wt(),n.memoizedState=n.baseState=e,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ow,lastRenderedState:e},n.queue=r,n=Qw.bind(null,K,r),r.dispatch=n,r=Lm(!1),a=qh.bind(null,K,!1,r.queue),r=wt(),o={state:e,dispatch:null,action:t,pending:null},r.queue=o,n=sB.bind(null,K,o,a,n),o.dispatch=n,r.memoizedState=t,[e,n,!1]}function OI(t){var e=He();return Rw(e,me,t)}function Rw(t,e,n){if(e=Bh(t,e,Ow)[0],t=gc(wr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var r=ws(e)}catch(i){throw i===Oi?lu:i}else r=e;e=He();var o=e.queue,a=o.dispatch;return n!==e.memoizedState&&(K.flags|=2048,vi(9,{destroy:void 0},fB.bind(null,o,n),null)),[r,a,t]}function fB(t,e){t.action=e}function RI(t){var e=He(),n=me;if(n!==null)return Rw(e,n,t);He(),e=e.memoizedState,n=He();var r=n.queue.dispatch;return n.memoizedState=t,[e,r,!1]}function vi(t,e,n,r){return t={tag:t,create:n,deps:r,inst:e,next:null},e=K.updateQueue,e===null&&(e=su(),K.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t),t}function Bw(){return He().memoizedState}function yc(t,e,n,r){var o=wt();K.flags|=t,o.memoizedState=vi(1|e,{destroy:void 0},n,r===void 0?null:r)}function cu(t,e,n,r){var o=He();r=r===void 0?null:r;var a=o.memoizedState.inst;me!==null&&r!==null&&Ah(r,me.memoizedState.deps)?o.memoizedState=vi(e,a,n,r):(K.flags|=t,o.memoizedState=vi(1|e,a,n,r))}function BI(t,e){yc(8390656,8,t,e)}function Eh(t,e){cu(2048,8,t,e)}function cB(t){K.flags|=4;var e=K.updateQueue;if(e===null)e=su(),K.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function Ew(t){var e=He().memoizedState;return cB({ref:e,nextImpl:t}),function(){if((ae&2)!==0)throw Error(D(440));return e.impl.apply(void 0,arguments)}}function Fw(t,e){return cu(4,2,t,e)}function Lw(t,e){return cu(4,4,t,e)}function Nw(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function qw(t,e,n){n=n!=null?n.concat([t]):null,cu(4,4,Nw.bind(null,e,t),n)}function Fh(){}function Pw(t,e){var n=He();e=e===void 0?null:e;var r=n.memoizedState;return e!==null&&Ah(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function _w(t,e){var n=He();e=e===void 0?null:e;var r=n.memoizedState;if(e!==null&&Ah(e,r[1]))return r[0];if(r=t(),ta){$r(!0);try{t()}finally{$r(!1)}}return n.memoizedState=[r,e],r}function Lh(t,e,n){return n===void 0||(vr&1073741824)!==0&&(te&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=T1(),K.lanes|=t,xo|=t,n)}function zw(t,e,n,r){return Yt(n,e)?n:Ii.current!==null?(t=Lh(t,n,r),Yt(t,e)||(Qe=!0),t):(vr&42)===0||(vr&1073741824)!==0&&(te&261930)===0?(Qe=!0,t.memoizedState=n):(t=T1(),K.lanes|=t,xo|=t,e)}function Hw(t,e,n,r,o){var a=ie.p;ie.p=a!==0&&8>a?a:8;var i=G.T,l={};G.T=l,qh(t,!1,e,n);try{var s=o(),f=G.S;if(f!==null&&f(l,s),s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=aB(s,r);Kl(t,e,c,Kt(t))}else Kl(t,e,r,Kt(t))}catch(u){Kl(t,e,{then:function(){},status:"rejected",reason:u},Kt())}finally{ie.p=a,i!==null&&l.types!==null&&(i.types=l.types),G.T=i}}function uB(){}function qm(t,e,n,r){if(t.tag!==5)throw Error(D(476));var o=Uw(t).queue;Hw(t,o,e,Xo,n===null?uB:function(){return jw(t),n(r)})}function Uw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Xo,baseState:Xo,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:wr,lastRenderedState:Xo},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:wr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function jw(t){var e=Uw(t);e.next===null&&(e=t.alternate.memoizedState),Kl(t,e.next.queue,{},Kt())}function Nh(){return ct(ds)}function Vw(){return He().memoizedState}function Gw(){return He().memoizedState}function dB(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Kt();t=ao(n);var r=io(e,t,n);r!==null&&(Et(r,e,n),Ql(r,e,n)),e={cache:vh()},t.payload=e;return}e=e.return}}function pB(t,e,n){var r=Kt();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},uu(t)?Xw(e,n):(n=gh(t,e,n,r),n!==null&&(Et(n,t,r),Ww(n,e,r)))}function Qw(t,e,n){var r=Kt();Kl(t,e,n,r)}function Kl(t,e,n,r){var o={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(uu(t))Xw(e,o);else{var a=t.alternate;if(t.lanes===0&&(a===null||a.lanes===0)&&(a=e.lastRenderedReducer,a!==null))try{var i=e.lastRenderedState,l=a(i,n);if(o.hasEagerState=!0,o.eagerState=l,Yt(l,i))return iu(t,e,o,0),he===null&&au(),!1}catch{}if(n=gh(t,e,o,r),n!==null)return Et(n,t,r),Ww(n,e,r),!0}return!1}function qh(t,e,n,r){if(r={lane:2,revertLane:Qh(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},uu(t)){if(e)throw Error(D(479))}else e=gh(t,n,r,2),e!==null&&Et(e,t,2)}function uu(t){var e=t.alternate;return t===K||e!==null&&e===K}function Xw(t,e){mi=Pc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Ww(t,e,n){if((n&4194048)!==0){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Ev(t,n)}}var fs={readContext:ct,use:fu,useCallback:Ne,useContext:Ne,useEffect:Ne,useImperativeHandle:Ne,useLayoutEffect:Ne,useInsertionEffect:Ne,useMemo:Ne,useReducer:Ne,useRef:Ne,useState:Ne,useDebugValue:Ne,useDeferredValue:Ne,useTransition:Ne,useSyncExternalStore:Ne,useId:Ne,useHostTransitionStatus:Ne,useFormState:Ne,useActionState:Ne,useOptimistic:Ne,useMemoCache:Ne,useCacheRefresh:Ne};fs.useEffectEvent=Ne;var Kw={readContext:ct,use:fu,useCallback:function(t,e){return wt().memoizedState=[t,e===void 0?null:e],t},useContext:ct,useEffect:BI,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,yc(4194308,4,Nw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return yc(4194308,4,t,e)},useInsertionEffect:function(t,e){yc(4,2,t,e)},useMemo:function(t,e){var n=wt();e=e===void 0?null:e;var r=t();if(ta){$r(!0);try{t()}finally{$r(!1)}}return n.memoizedState=[r,e],r},useReducer:function(t,e,n){var r=wt();if(n!==void 0){var o=n(e);if(ta){$r(!0);try{n(e)}finally{$r(!1)}}}else o=e;return r.memoizedState=r.baseState=o,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:o},r.queue=t,t=t.dispatch=pB.bind(null,K,t),[r.memoizedState,t]},useRef:function(t){var e=wt();return t={current:t},e.memoizedState=t},useState:function(t){t=Lm(t);var e=t.queue,n=Qw.bind(null,K,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Fh,useDeferredValue:function(t,e){var n=wt();return Lh(n,t,e)},useTransition:function(){var t=Lm(!1);return t=Hw.bind(null,K,t.queue,!0,!1),wt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var r=K,o=wt();if(re){if(n===void 0)throw Error(D(407));n=n()}else{if(n=e(),he===null)throw Error(D(349));(te&127)!==0||ww(r,e,n)}o.memoizedState=n;var a={value:n,getSnapshot:e};return o.queue=a,BI(kw.bind(null,r,a,t),[t]),r.flags|=2048,vi(9,{destroy:void 0},Sw.bind(null,r,a,n,e),null),n},useId:function(){var t=wt(),e=he.identifierPrefix;if(re){var n=Gn,r=Vn;n=(r&~(1<<32-Wt(r)-1)).toString(32)+n,e="_"+e+"R_"+n,n=_c++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=iB++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Nh,useFormState:DI,useActionState:DI,useOptimistic:function(t){var e=wt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=qh.bind(null,K,!0,n),n.dispatch=e,[t,e]},useMemoCache:Rh,useCacheRefresh:function(){return wt().memoizedState=dB.bind(null,K)},useEffectEvent:function(t){var e=wt(),n={impl:t};return e.memoizedState=n,function(){if((ae&2)!==0)throw Error(D(440));return n.impl.apply(void 0,arguments)}}},Ph={readContext:ct,use:fu,useCallback:Pw,useContext:ct,useEffect:Eh,useImperativeHandle:qw,useInsertionEffect:Fw,useLayoutEffect:Lw,useMemo:_w,useReducer:gc,useRef:Bw,useState:function(){return gc(wr)},useDebugValue:Fh,useDeferredValue:function(t,e){var n=He();return zw(n,me.memoizedState,t,e)},useTransition:function(){var t=gc(wr)[0],e=He().memoizedState;return[typeof t=="boolean"?t:ws(t),e]},useSyncExternalStore:vw,useId:Vw,useHostTransitionStatus:Nh,useFormState:OI,useActionState:OI,useOptimistic:function(t,e){var n=He();return Tw(n,me,t,e)},useMemoCache:Rh,useCacheRefresh:Gw};Ph.useEffectEvent=Ew;var Yw={readContext:ct,use:fu,useCallback:Pw,useContext:ct,useEffect:Eh,useImperativeHandle:qw,useInsertionEffect:Fw,useLayoutEffect:Lw,useMemo:_w,useReducer:Gp,useRef:Bw,useState:function(){return Gp(wr)},useDebugValue:Fh,useDeferredValue:function(t,e){var n=He();return me===null?Lh(n,t,e):zw(n,me.memoizedState,t,e)},useTransition:function(){var t=Gp(wr)[0],e=He().memoizedState;return[typeof t=="boolean"?t:ws(t),e]},useSyncExternalStore:vw,useId:Vw,useHostTransitionStatus:Nh,useFormState:RI,useActionState:RI,useOptimistic:function(t,e){var n=He();return me!==null?Tw(n,me,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Rh,useCacheRefresh:Gw};Yw.useEffectEvent=Ew;function Qp(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Ae({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Pm={enqueueSetState:function(t,e,n){t=t._reactInternals;var r=Kt(),o=ao(r);o.payload=e,n!=null&&(o.callback=n),e=io(t,o,r),e!==null&&(Et(e,t,r),Ql(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=Kt(),o=ao(r);o.tag=1,o.payload=e,n!=null&&(o.callback=n),e=io(t,o,r),e!==null&&(Et(e,t,r),Ql(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Kt(),r=ao(n);r.tag=2,e!=null&&(r.callback=e),e=io(t,r,n),e!==null&&(Et(e,t,n),Ql(e,t,n))}};function EI(t,e,n,r,o,a,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,a,i):e.prototype&&e.prototype.isPureReactComponent?!os(n,r)||!os(o,a):!0}function FI(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Pm.enqueueReplaceState(e,e.state,null)}function na(t,e){var n=e;if("ref"in e){n={};for(var r in e)r!=="ref"&&(n[r]=e[r])}if(t=t.defaultProps){n===e&&(n=Ae({},n));for(var o in t)n[o]===void 0&&(n[o]=t[o])}return n}function Jw(t){Rc(t)}function $w(t){console.error(t)}function Zw(t){Rc(t)}function zc(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(r){setTimeout(function(){throw r})}}function LI(t,e,n){try{var r=t.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function _m(t,e,n){return n=ao(n),n.tag=3,n.payload={element:null},n.callback=function(){zc(t,e)},n}function e1(t){return t=ao(t),t.tag=3,t}function t1(t,e,n,r){var o=n.type.getDerivedStateFromError;if(typeof o=="function"){var a=r.value;t.payload=function(){return o(a)},t.callback=function(){LI(e,n,r)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){LI(e,n,r),typeof o!="function"&&(lo===null?lo=new Set([this]):lo.add(this));var l=r.stack;this.componentDidCatch(r.value,{componentStack:l!==null?l:""})})}function mB(t,e,n,r,o){if(n.flags|=32768,r!==null&&typeof r=="object"&&typeof r.then=="function"){if(e=n.alternate,e!==null&&Di(e,n,o,!0),n=Jt.current,n!==null){switch(n.tag){case 31:case 13:return mn===null?Gc():n.alternate===null&&qe===0&&(qe=3),n.flags&=-257,n.flags|=65536,n.lanes=o,r===Lc?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([r]):e.add(r),rm(t,r,o)),!1;case 22:return n.flags|=65536,r===Lc?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([r]):n.add(r)),rm(t,r,o)),!1}throw Error(D(435,n.tag))}return rm(t,r,o),Gc(),!1}if(re)return e=Jt.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=o,r!==Am&&(t=Error(D(422),{cause:r}),is(dn(t,n)))):(r!==Am&&(e=Error(D(423),{cause:r}),is(dn(e,n))),t=t.current.alternate,t.flags|=65536,o&=-o,t.lanes|=o,r=dn(r,n),o=_m(t.stateNode,r,o),Vp(t,o),qe!==4&&(qe=2)),!1;var a=Error(D(520),{cause:r});if(a=dn(a,n),$l===null?$l=[a]:$l.push(a),qe!==4&&(qe=2),e===null)return!0;r=dn(r,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=o&-o,n.lanes|=t,t=_m(n.stateNode,r,t),Vp(n,t),!1;case 1:if(e=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(lo===null||!lo.has(a))))return n.flags|=65536,o&=-o,n.lanes|=o,o=e1(o),t1(o,t,n,r),Vp(n,o),!1}n=n.return}while(n!==null);return!1}var _h=Error(D(461)),Qe=!1;function lt(t,e,n,r){e.child=t===null?hw(e,null,n,r):ea(e,t.child,n,r)}function NI(t,e,n,r,o){n=n.render;var a=e.ref;if("ref"in r){var i={};for(var l in r)l!=="ref"&&(i[l]=r[l])}else i=r;return Zo(e),r=Th(t,e,n,i,a,o),l=Mh(),t!==null&&!Qe?(Dh(t,e,o),Sr(t,e,o)):(re&&l&&bh(e),e.flags|=1,lt(t,e,r,o),e.child)}function qI(t,e,n,r,o){if(t===null){var a=n.type;return typeof a=="function"&&!yh(a)&&a.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=a,n1(t,e,a,r,o)):(t=hc(n.type,null,r,e,e.mode,o),t.ref=e.ref,t.return=e,e.child=t)}if(a=t.child,!zh(t,o)){var i=a.memoizedProps;if(n=n.compare,n=n!==null?n:os,n(i,r)&&t.ref===e.ref)return Sr(t,e,o)}return e.flags|=1,t=gr(a,r),t.ref=e.ref,t.return=e,e.child=t}function n1(t,e,n,r,o){if(t!==null){var a=t.memoizedProps;if(os(a,r)&&t.ref===e.ref)if(Qe=!1,e.pendingProps=r=a,zh(t,o))(t.flags&131072)!==0&&(Qe=!0);else return e.lanes=t.lanes,Sr(t,e,o)}return zm(t,e,n,r,o)}function r1(t,e,n,r){var o=r.children,a=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode==="hidden"){if((e.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,t!==null){for(r=e.child=t.child,o=0;r!==null;)o=o|r.lanes|r.childLanes,r=r.sibling;r=o&~a}else r=0,e.child=null;return PI(t,e,a,n,r)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&xc(e,a!==null?a.cachePool:null),a!==null?AI(e,a):Em(),yw(e);else return r=e.lanes=536870912,PI(t,e,a!==null?a.baseLanes|n:n,n,r)}else a!==null?(xc(e,a.cachePool),AI(e,a),Yr(e),e.memoizedState=null):(t!==null&&xc(e,null),Em(),Yr(e));return lt(t,e,o,n),e.child}function zl(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function PI(t,e,n,r,o){var a=wh();return a=a===null?null:{parent:Ge._currentValue,pool:a},e.memoizedState={baseLanes:n,cachePool:a},t!==null&&xc(e,null),Em(),yw(e),t!==null&&Di(t,e,r,!0),e.childLanes=o,null}function bc(t,e){return e=Hc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function _I(t,e,n){return ea(e,t.child,null,n),t=bc(e,e.pendingProps),t.flags|=2,jt(e),e.memoizedState=null,t}function hB(t,e,n){var r=e.pendingProps,o=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(re){if(r.mode==="hidden")return t=bc(e,r),e.lanes=536870912,zl(null,t);if(Fm(e),(t=Ce)?(t=K1(t,pn),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:po!==null?{id:Vn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},n=sw(t),n.return=e,e.child=n,ft=e,Ce=null)):t=null,t===null)throw mo(e);return e.lanes=536870912,null}return bc(e,r)}var a=t.memoizedState;if(a!==null){var i=a.dehydrated;if(Fm(e),o)if(e.flags&256)e.flags&=-257,e=_I(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(D(558));else if(Qe||Di(t,e,n,!1),o=(n&t.childLanes)!==0,Qe||o){if(r=he,r!==null&&(i=Fv(r,n),i!==0&&i!==a.retryLane))throw a.retryLane=i,ia(t,i),Et(r,t,i),_h;Gc(),e=_I(t,e,n)}else t=a.treeContext,Ce=hn(i.nextSibling),ft=e,re=!0,oo=null,pn=!1,t!==null&&cw(e,t),e=bc(e,r),e.flags|=4096;return e}return t=gr(t.child,{mode:r.mode,children:r.children}),t.ref=e.ref,e.child=t,t.return=e,t}function Ic(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(D(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function zm(t,e,n,r,o){return Zo(e),n=Th(t,e,n,r,void 0,o),r=Mh(),t!==null&&!Qe?(Dh(t,e,o),Sr(t,e,o)):(re&&r&&bh(e),e.flags|=1,lt(t,e,n,o),e.child)}function zI(t,e,n,r,o,a){return Zo(e),e.updateQueue=null,n=Iw(e,r,n,o),bw(t),r=Mh(),t!==null&&!Qe?(Dh(t,e,a),Sr(t,e,a)):(re&&r&&bh(e),e.flags|=1,lt(t,e,n,a),e.child)}function HI(t,e,n,r,o){if(Zo(e),e.stateNode===null){var a=ai,i=n.contextType;typeof i=="object"&&i!==null&&(a=ct(i)),a=new n(r,a),e.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Pm,e.stateNode=a,a._reactInternals=e,a=e.stateNode,a.props=r,a.state=e.memoizedState,a.refs={},kh(e),i=n.contextType,a.context=typeof i=="object"&&i!==null?ct(i):ai,a.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Qp(e,n,i,r),a.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(i=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),i!==a.state&&Pm.enqueueReplaceState(a,a.state,null),Wl(e,r,a,o),Xl(),a.state=e.memoizedState),typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!0}else if(t===null){a=e.stateNode;var l=e.memoizedProps,s=na(n,l);a.props=s;var f=a.context,c=n.contextType;i=ai,typeof c=="object"&&c!==null&&(i=ct(c));var u=n.getDerivedStateFromProps;c=typeof u=="function"||typeof a.getSnapshotBeforeUpdate=="function",l=e.pendingProps!==l,c||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(l||f!==i)&&FI(e,a,r,i),Xr=!1;var d=e.memoizedState;a.state=d,Wl(e,r,a,o),Xl(),f=e.memoizedState,l||d!==f||Xr?(typeof u=="function"&&(Qp(e,n,u,r),f=e.memoizedState),(s=Xr||EI(e,n,s,r,d,f,i))?(c||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=f),a.props=r,a.state=f,a.context=i,r=s):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{a=e.stateNode,Rm(t,e),i=e.memoizedProps,c=na(n,i),a.props=c,u=e.pendingProps,d=a.context,f=n.contextType,s=ai,typeof f=="object"&&f!==null&&(s=ct(f)),l=n.getDerivedStateFromProps,(f=typeof l=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(i!==u||d!==s)&&FI(e,a,r,s),Xr=!1,d=e.memoizedState,a.state=d,Wl(e,r,a,o),Xl();var p=e.memoizedState;i!==u||d!==p||Xr||t!==null&&t.dependencies!==null&&Fc(t.dependencies)?(typeof l=="function"&&(Qp(e,n,l,r),p=e.memoizedState),(c=Xr||EI(e,n,c,r,d,p,s)||t!==null&&t.dependencies!==null&&Fc(t.dependencies))?(f||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(r,p,s),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(r,p,s)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=p),a.props=r,a.state=p,a.context=s,r=c):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),r=!1)}return a=r,Ic(t,e),r=(e.flags&128)!==0,a||r?(a=e.stateNode,n=r&&typeof n.getDerivedStateFromError!="function"?null:a.render(),e.flags|=1,t!==null&&r?(e.child=ea(e,t.child,null,o),e.child=ea(e,null,n,o)):lt(t,e,n,o),e.memoizedState=a.state,t=e.child):t=Sr(t,e,o),t}function UI(t,e,n,r){return $o(),e.flags|=256,lt(t,e,n,r),e.child}var Xp={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Wp(t){return{baseLanes:t,cachePool:dw()}}function Kp(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Gt),t}function o1(t,e,n){var r=e.pendingProps,o=!1,a=(e.flags&128)!==0,i;if((i=a)||(i=t!==null&&t.memoizedState===null?!1:(ze.current&2)!==0),i&&(o=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(re){if(o?Kr(e):Yr(e),(t=Ce)?(t=K1(t,pn),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:po!==null?{id:Vn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},n=sw(t),n.return=e,e.child=n,ft=e,Ce=null)):t=null,t===null)throw mo(e);return eh(t)?e.lanes=32:e.lanes=536870912,null}var l=r.children;return r=r.fallback,o?(Yr(e),o=e.mode,l=Hc({mode:"hidden",children:l},o),r=Wo(r,o,n,null),l.return=e,r.return=e,l.sibling=r,e.child=l,r=e.child,r.memoizedState=Wp(n),r.childLanes=Kp(t,i,n),e.memoizedState=Xp,zl(null,r)):(Kr(e),Hm(e,l))}var s=t.memoizedState;if(s!==null&&(l=s.dehydrated,l!==null)){if(a)e.flags&256?(Kr(e),e.flags&=-257,e=Yp(t,e,n)):e.memoizedState!==null?(Yr(e),e.child=t.child,e.flags|=128,e=null):(Yr(e),l=r.fallback,o=e.mode,r=Hc({mode:"visible",children:r.children},o),l=Wo(l,o,n,null),l.flags|=2,r.return=e,l.return=e,r.sibling=l,e.child=r,ea(e,t.child,null,n),r=e.child,r.memoizedState=Wp(n),r.childLanes=Kp(t,i,n),e.memoizedState=Xp,e=zl(null,r));else if(Kr(e),eh(l)){if(i=l.nextSibling&&l.nextSibling.dataset,i)var f=i.dgst;i=f,r=Error(D(419)),r.stack="",r.digest=i,is({value:r,source:null,stack:null}),e=Yp(t,e,n)}else if(Qe||Di(t,e,n,!1),i=(n&t.childLanes)!==0,Qe||i){if(i=he,i!==null&&(r=Fv(i,n),r!==0&&r!==s.retryLane))throw s.retryLane=r,ia(t,r),Et(i,t,r),_h;Zm(l)||Gc(),e=Yp(t,e,n)}else Zm(l)?(e.flags|=192,e.child=t.child,e=null):(t=s.treeContext,Ce=hn(l.nextSibling),ft=e,re=!0,oo=null,pn=!1,t!==null&&cw(e,t),e=Hm(e,r.children),e.flags|=4096);return e}return o?(Yr(e),l=r.fallback,o=e.mode,s=t.child,f=s.sibling,r=gr(s,{mode:"hidden",children:r.children}),r.subtreeFlags=s.subtreeFlags&65011712,f!==null?l=gr(f,l):(l=Wo(l,o,n,null),l.flags|=2),l.return=e,r.return=e,r.sibling=l,e.child=r,zl(null,r),r=e.child,l=t.child.memoizedState,l===null?l=Wp(n):(o=l.cachePool,o!==null?(s=Ge._currentValue,o=o.parent!==s?{parent:s,pool:s}:o):o=dw(),l={baseLanes:l.baseLanes|n,cachePool:o}),r.memoizedState=l,r.childLanes=Kp(t,i,n),e.memoizedState=Xp,zl(t.child,r)):(Kr(e),n=t.child,t=n.sibling,n=gr(n,{mode:"visible",children:r.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Hm(t,e){return e=Hc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Hc(t,e){return t=Vt(22,t,null,e),t.lanes=0,t}function Yp(t,e,n){return ea(e,t.child,null,n),t=Hm(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function jI(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),Mm(t.return,e,n)}function Jp(t,e,n,r,o,a){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o,treeForkCount:a}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=o,i.treeForkCount=a)}function a1(t,e,n){var r=e.pendingProps,o=r.revealOrder,a=r.tail;r=r.children;var i=ze.current,l=(i&2)!==0;if(l?(i=i&1|2,e.flags|=128):i&=1,be(ze,i),lt(t,e,r,n),r=re?as:0,!l&&t!==null&&(t.flags&128)!==0)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&jI(t,n,e);else if(t.tag===19)jI(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(o){case"forwards":for(n=e.child,o=null;n!==null;)t=n.alternate,t!==null&&qc(t)===null&&(o=n),n=n.sibling;n=o,n===null?(o=e.child,e.child=null):(o=n.sibling,n.sibling=null),Jp(e,!1,o,n,a,r);break;case"backwards":case"unstable_legacy-backwards":for(n=null,o=e.child,e.child=null;o!==null;){if(t=o.alternate,t!==null&&qc(t)===null){e.child=o;break}t=o.sibling,o.sibling=n,n=o,o=t}Jp(e,!0,n,null,a,r);break;case"together":Jp(e,!1,null,null,void 0,r);break;default:e.memoizedState=null}return e.child}function Sr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),xo|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(Di(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(D(153));if(e.child!==null){for(t=e.child,n=gr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=gr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function zh(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&Fc(t)))}function xB(t,e,n){switch(e.tag){case 3:Tc(e,e.stateNode.containerInfo),Wr(e,Ge,t.memoizedState.cache),$o();break;case 27:case 5:hm(e);break;case 4:Tc(e,e.stateNode.containerInfo);break;case 10:Wr(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Fm(e),null;break;case 13:var r=e.memoizedState;if(r!==null)return r.dehydrated!==null?(Kr(e),e.flags|=128,null):(n&e.child.childLanes)!==0?o1(t,e,n):(Kr(e),t=Sr(t,e,n),t!==null?t.sibling:null);Kr(e);break;case 19:var o=(t.flags&128)!==0;if(r=(n&e.childLanes)!==0,r||(Di(t,e,n,!1),r=(n&e.childLanes)!==0),o){if(r)return a1(t,e,n);e.flags|=128}if(o=e.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),be(ze,ze.current),r)break;return null;case 22:return e.lanes=0,r1(t,e,n,e.pendingProps);case 24:Wr(e,Ge,t.memoizedState.cache)}return Sr(t,e,n)}function i1(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Qe=!0;else{if(!zh(t,n)&&(e.flags&128)===0)return Qe=!1,xB(t,e,n);Qe=(t.flags&131072)!==0}else Qe=!1,re&&(e.flags&1048576)!==0&&fw(e,as,e.index);switch(e.lanes=0,e.tag){case 16:e:{var r=e.pendingProps;if(t=Go(e.elementType),e.type=t,typeof t=="function")yh(t)?(r=na(t,r),e.tag=1,e=HI(null,e,t,r,n)):(e.tag=0,e=zm(null,e,t,r,n));else{if(t!=null){var o=t.$$typeof;if(o===oh){e.tag=11,e=NI(null,e,t,r,n);break e}else if(o===ah){e.tag=14,e=qI(null,e,t,r,n);break e}}throw e=pm(t)||t,Error(D(306,e,""))}}return e;case 0:return zm(t,e,e.type,e.pendingProps,n);case 1:return r=e.type,o=na(r,e.pendingProps),HI(t,e,r,o,n);case 3:e:{if(Tc(e,e.stateNode.containerInfo),t===null)throw Error(D(387));r=e.pendingProps;var a=e.memoizedState;o=a.element,Rm(t,e),Wl(e,r,null,n);var i=e.memoizedState;if(r=i.cache,Wr(e,Ge,r),r!==a.cache&&Dm(e,[Ge],n,!0),Xl(),r=i.element,a.isDehydrated)if(a={element:r,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=a,e.memoizedState=a,e.flags&256){e=UI(t,e,r,n);break e}else if(r!==o){o=dn(Error(D(424)),e),is(o),e=UI(t,e,r,n);break e}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,Ce=hn(t.firstChild),ft=e,re=!0,oo=null,pn=!0,n=hw(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if($o(),r===o){e=Sr(t,e,n);break e}lt(t,e,r,n)}e=e.child}return e;case 26:return Ic(t,e),t===null?(n=uv(e.type,null,e.pendingProps,null))?e.memoizedState=n:re||(n=e.type,t=e.pendingProps,r=Kc(ro.current).createElement(n),r[st]=e,r[Ft]=t,ut(r,n,t),Ze(r),e.stateNode=r):e.memoizedState=uv(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return hm(e),t===null&&re&&(r=e.stateNode=Y1(e.type,e.pendingProps,ro.current),ft=e,pn=!0,o=Ce,yo(e.type)?(th=o,Ce=hn(r.firstChild)):Ce=o),lt(t,e,e.pendingProps.children,n),Ic(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&re&&((o=r=Ce)&&(r=VB(r,e.type,e.pendingProps,pn),r!==null?(e.stateNode=r,ft=e,Ce=hn(r.firstChild),pn=!1,o=!0):o=!1),o||mo(e)),hm(e),o=e.type,a=e.pendingProps,i=t!==null?t.memoizedProps:null,r=a.children,Jm(o,a)?r=null:i!==null&&Jm(o,i)&&(e.flags|=32),e.memoizedState!==null&&(o=Th(t,e,lB,null,null,n),ds._currentValue=o),Ic(t,e),lt(t,e,r,n),e.child;case 6:return t===null&&re&&((t=n=Ce)&&(n=GB(n,e.pendingProps,pn),n!==null?(e.stateNode=n,ft=e,Ce=null,t=!0):t=!1),t||mo(e)),null;case 13:return o1(t,e,n);case 4:return Tc(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=ea(e,null,r,n):lt(t,e,r,n),e.child;case 11:return NI(t,e,e.type,e.pendingProps,n);case 7:return lt(t,e,e.pendingProps,n),e.child;case 8:return lt(t,e,e.pendingProps.children,n),e.child;case 12:return lt(t,e,e.pendingProps.children,n),e.child;case 10:return r=e.pendingProps,Wr(e,e.type,r.value),lt(t,e,r.children,n),e.child;case 9:return o=e.type._context,r=e.pendingProps.children,Zo(e),o=ct(o),r=r(o),e.flags|=1,lt(t,e,r,n),e.child;case 14:return qI(t,e,e.type,e.pendingProps,n);case 15:return n1(t,e,e.type,e.pendingProps,n);case 19:return a1(t,e,n);case 31:return hB(t,e,n);case 22:return r1(t,e,n,e.pendingProps);case 24:return Zo(e),r=ct(Ge),t===null?(o=wh(),o===null&&(o=he,a=vh(),o.pooledCache=a,a.refCount++,a!==null&&(o.pooledCacheLanes|=n),o=a),e.memoizedState={parent:r,cache:o},kh(e),Wr(e,Ge,o)):((t.lanes&n)!==0&&(Rm(t,e),Wl(e,null,null,n),Xl()),o=t.memoizedState,a=e.memoizedState,o.parent!==r?(o={parent:r,cache:r},e.memoizedState=o,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=o),Wr(e,Ge,r)):(r=a.cache,Wr(e,Ge,r),r!==o.cache&&Dm(e,[Ge],n,!0))),lt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(D(156,e.tag))}function sr(t){t.flags|=4}function $p(t,e,n,r,o){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(o&335544128)===o)if(t.stateNode.complete)t.flags|=8192;else if(O1())t.flags|=8192;else throw Yo=Lc,Sh}else t.flags&=-16777217}function VI(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!Z1(e))if(O1())t.flags|=8192;else throw Yo=Lc,Sh}function oc(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?Rv():536870912,t.lanes|=e,wi|=e)}function El(t,e){if(!re)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function ke(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&65011712,r|=o.flags&65011712,o.return=t,o=o.sibling;else for(o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=t,o=o.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function gB(t,e,n){var r=e.pendingProps;switch(Ih(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ke(e),null;case 1:return ke(e),null;case 3:return n=e.stateNode,r=null,t!==null&&(r=t.memoizedState.cache),e.memoizedState.cache!==r&&(e.flags|=2048),yr(Ge),xi(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(Xa(e)?sr(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,jp())),ke(e),null;case 26:var o=e.type,a=e.memoizedState;return t===null?(sr(e),a!==null?(ke(e),VI(e,a)):(ke(e),$p(e,o,null,r,n))):a?a!==t.memoizedState?(sr(e),ke(e),VI(e,a)):(ke(e),e.flags&=-16777217):(t=t.memoizedProps,t!==r&&sr(e),ke(e),$p(e,o,t,r,n)),null;case 27:if(Mc(e),n=ro.current,o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&sr(e);else{if(!r){if(e.stateNode===null)throw Error(D(166));return ke(e),null}t=Xn.current,Xa(e)?bI(e,t):(t=Y1(o,r,n),e.stateNode=t,sr(e))}return ke(e),null;case 5:if(Mc(e),o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&sr(e);else{if(!r){if(e.stateNode===null)throw Error(D(166));return ke(e),null}if(a=Xn.current,Xa(e))bI(e,a);else{var i=Kc(ro.current);switch(a){case 1:a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":a=i.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof r.is=="string"?i.createElement("select",{is:r.is}):i.createElement("select"),r.multiple?a.multiple=!0:r.size&&(a.size=r.size);break;default:a=typeof r.is=="string"?i.createElement(o,{is:r.is}):i.createElement(o)}}a[st]=e,a[Ft]=r;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)a.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=a;e:switch(ut(a,o,r),o){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}r&&sr(e)}}return ke(e),$p(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==r&&sr(e);else{if(typeof r!="string"&&e.stateNode===null)throw Error(D(166));if(t=ro.current,Xa(e)){if(t=e.stateNode,n=e.memoizedProps,r=null,o=ft,o!==null)switch(o.tag){case 27:case 5:r=o.memoizedProps}t[st]=e,t=!!(t.nodeValue===n||r!==null&&r.suppressHydrationWarning===!0||Q1(t.nodeValue,n)),t||mo(e,!0)}else t=Kc(t).createTextNode(r),t[st]=e,e.stateNode=t}return ke(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(r=Xa(e),n!==null){if(t===null){if(!r)throw Error(D(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(D(557));t[st]=e}else $o(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;ke(e),t=!1}else n=jp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(jt(e),e):(jt(e),null);if((e.flags&128)!==0)throw Error(D(558))}return ke(e),null;case 13:if(r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(o=Xa(e),r!==null&&r.dehydrated!==null){if(t===null){if(!o)throw Error(D(318));if(o=e.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(D(317));o[st]=e}else $o(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;ke(e),o=!1}else o=jp(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=o),o=!0;if(!o)return e.flags&256?(jt(e),e):(jt(e),null)}return jt(e),(e.flags&128)!==0?(e.lanes=n,e):(n=r!==null,t=t!==null&&t.memoizedState!==null,n&&(r=e.child,o=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(o=r.alternate.memoizedState.cachePool.pool),a=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(a=r.memoizedState.cachePool.pool),a!==o&&(r.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),oc(e,e.updateQueue),ke(e),null);case 4:return xi(),t===null&&Xh(e.stateNode.containerInfo),ke(e),null;case 10:return yr(e.type),ke(e),null;case 19:if(et(ze),r=e.memoizedState,r===null)return ke(e),null;if(o=(e.flags&128)!==0,a=r.rendering,a===null)if(o)El(r,!1);else{if(qe!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(a=qc(t),a!==null){for(e.flags|=128,El(r,!1),t=a.updateQueue,e.updateQueue=t,oc(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)lw(n,t),n=n.sibling;return be(ze,ze.current&1|2),re&&dr(e,r.treeForkCount),e.child}t=t.sibling}r.tail!==null&&Qt()>jc&&(e.flags|=128,o=!0,El(r,!1),e.lanes=4194304)}else{if(!o)if(t=qc(a),t!==null){if(e.flags|=128,o=!0,t=t.updateQueue,e.updateQueue=t,oc(e,t),El(r,!0),r.tail===null&&r.tailMode==="hidden"&&!a.alternate&&!re)return ke(e),null}else 2*Qt()-r.renderingStartTime>jc&&n!==536870912&&(e.flags|=128,o=!0,El(r,!1),e.lanes=4194304);r.isBackwards?(a.sibling=e.child,e.child=a):(t=r.last,t!==null?t.sibling=a:e.child=a,r.last=a)}return r.tail!==null?(t=r.tail,r.rendering=t,r.tail=t.sibling,r.renderingStartTime=Qt(),t.sibling=null,n=ze.current,be(ze,o?n&1|2:n&1),re&&dr(e,r.treeForkCount),t):(ke(e),null);case 22:case 23:return jt(e),Ch(),r=e.memoizedState!==null,t!==null?t.memoizedState!==null!==r&&(e.flags|=8192):r&&(e.flags|=8192),r?(n&536870912)!==0&&(e.flags&128)===0&&(ke(e),e.subtreeFlags&6&&(e.flags|=8192)):ke(e),n=e.updateQueue,n!==null&&oc(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),r=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),r!==n&&(e.flags|=2048),t!==null&&et(Ko),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),yr(Ge),ke(e),null;case 25:return null;case 30:return null}throw Error(D(156,e.tag))}function yB(t,e){switch(Ih(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return yr(Ge),xi(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Mc(e),null;case 31:if(e.memoizedState!==null){if(jt(e),e.alternate===null)throw Error(D(340));$o()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(jt(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(D(340));$o()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return et(ze),null;case 4:return xi(),null;case 10:return yr(e.type),null;case 22:case 23:return jt(e),Ch(),t!==null&&et(Ko),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return yr(Ge),null;case 25:return null;default:return null}}function l1(t,e){switch(Ih(e),e.tag){case 3:yr(Ge),xi();break;case 26:case 27:case 5:Mc(e);break;case 4:xi();break;case 31:e.memoizedState!==null&&jt(e);break;case 13:jt(e);break;case 19:et(ze);break;case 10:yr(e.type);break;case 22:case 23:jt(e),Ch(),t!==null&&et(Ko);break;case 24:yr(Ge)}}function Ss(t,e){try{var n=e.updateQueue,r=n!==null?n.lastEffect:null;if(r!==null){var o=r.next;n=o;do{if((n.tag&t)===t){r=void 0;var a=n.create,i=n.inst;r=a(),i.destroy=r}n=n.next}while(n!==o)}}catch(l){fe(e,e.return,l)}}function ho(t,e,n){try{var r=e.updateQueue,o=r!==null?r.lastEffect:null;if(o!==null){var a=o.next;r=a;do{if((r.tag&t)===t){var i=r.inst,l=i.destroy;if(l!==void 0){i.destroy=void 0,o=e;var s=n,f=l;try{f()}catch(c){fe(o,s,c)}}}r=r.next}while(r!==a)}}catch(c){fe(e,e.return,c)}}function s1(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{gw(e,n)}catch(r){fe(t,t.return,r)}}}function f1(t,e,n){n.props=na(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(r){fe(t,e,r)}}function Yl(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var r=t.stateNode;break;case 30:r=t.stateNode;break;default:r=t.stateNode}typeof n=="function"?t.refCleanup=n(r):n.current=r}}catch(o){fe(t,e,o)}}function Qn(t,e){var n=t.ref,r=t.refCleanup;if(n!==null)if(typeof r=="function")try{r()}catch(o){fe(t,e,o)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(o){fe(t,e,o)}else n.current=null}function c1(t){var e=t.type,n=t.memoizedProps,r=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&r.focus();break e;case"img":n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(o){fe(t,t.return,o)}}function Zp(t,e,n){try{var r=t.stateNode;PB(r,t.type,n,e),r[Ft]=e}catch(o){fe(t,t.return,o)}}function u1(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&yo(t.type)||t.tag===4}function em(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||u1(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&yo(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Um(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=hr));else if(r!==4&&(r===27&&yo(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Um(t,e,n),t=t.sibling;t!==null;)Um(t,e,n),t=t.sibling}function Uc(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(r===27&&yo(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(Uc(t,e,n),t=t.sibling;t!==null;)Uc(t,e,n),t=t.sibling}function d1(t){var e=t.stateNode,n=t.memoizedProps;try{for(var r=t.type,o=e.attributes;o.length;)e.removeAttributeNode(o[0]);ut(e,r,n),e[st]=t,e[Ft]=n}catch(a){fe(t,t.return,a)}}var pr=!1,Ve=!1,tm=!1,GI=typeof WeakSet=="function"?WeakSet:Set,$e=null;function bB(t,e){if(t=t.containerInfo,Km=Zc,t=Zv(t),hh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,a=r.focusNode;r=r.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break e}var i=0,l=-1,s=-1,f=0,c=0,u=t,d=null;t:for(;;){for(var p;u!==n||o!==0&&u.nodeType!==3||(l=i+o),u!==a||r!==0&&u.nodeType!==3||(s=i+r),u.nodeType===3&&(i+=u.nodeValue.length),(p=u.firstChild)!==null;)d=u,u=p;for(;;){if(u===t)break t;if(d===n&&++f===o&&(l=i),d===a&&++c===r&&(s=i),(p=u.nextSibling)!==null)break;u=d,d=u.parentNode}u=p}n=l===-1||s===-1?null:{start:l,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ym={focusedElem:t,selectionRange:n},Zc=!1,$e=e;$e!==null;)if(e=$e,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,$e=t;else for(;$e!==null;){switch(e=$e,a=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)o=t[n],o.ref.impl=o.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&a!==null){t=void 0,n=e,o=a.memoizedProps,a=a.memoizedState,r=n.stateNode;try{var h=na(n.type,o);t=r.getSnapshotBeforeUpdate(h,a),r.__reactInternalSnapshotBeforeUpdate=t}catch(y){fe(n,n.return,y)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)$m(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":$m(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(D(163))}if(t=e.sibling,t!==null){t.return=e.return,$e=t;break}$e=e.return}}function p1(t,e,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:cr(t,n),r&4&&Ss(5,n);break;case 1:if(cr(t,n),r&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){fe(n,n.return,i)}else{var o=na(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(o,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){fe(n,n.return,i)}}r&64&&s1(n),r&512&&Yl(n,n.return);break;case 3:if(cr(t,n),r&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{gw(t,e)}catch(i){fe(n,n.return,i)}}break;case 27:e===null&&r&4&&d1(n);case 26:case 5:cr(t,n),e===null&&r&4&&c1(n),r&512&&Yl(n,n.return);break;case 12:cr(t,n);break;case 31:cr(t,n),r&4&&x1(t,n);break;case 13:cr(t,n),r&4&&g1(t,n),r&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=MB.bind(null,n),QB(t,n))));break;case 22:if(r=n.memoizedState!==null||pr,!r){e=e!==null&&e.memoizedState!==null||Ve,o=pr;var a=Ve;pr=r,(Ve=e)&&!a?ur(t,n,(n.subtreeFlags&8772)!==0):cr(t,n),pr=o,Ve=a}break;case 30:break;default:cr(t,n)}}function m1(t){var e=t.alternate;e!==null&&(t.alternate=null,m1(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&fh(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Oe=null,Rt=!1;function fr(t,e,n){for(n=n.child;n!==null;)h1(t,e,n),n=n.sibling}function h1(t,e,n){if(Xt&&typeof Xt.onCommitFiberUnmount=="function")try{Xt.onCommitFiberUnmount(xs,n)}catch{}switch(n.tag){case 26:Ve||Qn(n,e),fr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Ve||Qn(n,e);var r=Oe,o=Rt;yo(n.type)&&(Oe=n.stateNode,Rt=!1),fr(t,e,n),es(n.stateNode),Oe=r,Rt=o;break;case 5:Ve||Qn(n,e);case 6:if(r=Oe,o=Rt,Oe=null,fr(t,e,n),Oe=r,Rt=o,Oe!==null)if(Rt)try{(Oe.nodeType===9?Oe.body:Oe.nodeName==="HTML"?Oe.ownerDocument.body:Oe).removeChild(n.stateNode)}catch(a){fe(n,e,a)}else try{Oe.removeChild(n.stateNode)}catch(a){fe(n,e,a)}break;case 18:Oe!==null&&(Rt?(t=Oe,iv(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),Ai(t)):iv(Oe,n.stateNode));break;case 4:r=Oe,o=Rt,Oe=n.stateNode.containerInfo,Rt=!0,fr(t,e,n),Oe=r,Rt=o;break;case 0:case 11:case 14:case 15:ho(2,n,e),Ve||ho(4,n,e),fr(t,e,n);break;case 1:Ve||(Qn(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"&&f1(n,e,r)),fr(t,e,n);break;case 21:fr(t,e,n);break;case 22:Ve=(r=Ve)||n.memoizedState!==null,fr(t,e,n),Ve=r;break;default:fr(t,e,n)}}function x1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Ai(t)}catch(n){fe(e,e.return,n)}}}function g1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Ai(t)}catch(n){fe(e,e.return,n)}}function IB(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new GI),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new GI),e;default:throw Error(D(435,t.tag))}}function ac(t,e){var n=IB(t);e.forEach(function(r){if(!n.has(r)){n.add(r);var o=DB.bind(null,t,r);r.then(o,o)}})}function Dt(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r],a=t,i=e,l=i;e:for(;l!==null;){switch(l.tag){case 27:if(yo(l.type)){Oe=l.stateNode,Rt=!1;break e}break;case 5:Oe=l.stateNode,Rt=!1;break e;case 3:case 4:Oe=l.stateNode.containerInfo,Rt=!0;break e}l=l.return}if(Oe===null)throw Error(D(160));h1(a,i,o),Oe=null,Rt=!1,a=o.alternate,a!==null&&(a.return=null),o.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)y1(e,t),e=e.sibling}var Mn=null;function y1(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Dt(e,t),Ot(t),r&4&&(ho(3,t,t.return),Ss(3,t),ho(5,t,t.return));break;case 1:Dt(e,t),Ot(t),r&512&&(Ve||n===null||Qn(n,n.return)),r&64&&pr&&(t=t.updateQueue,t!==null&&(r=t.callbacks,r!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var o=Mn;if(Dt(e,t),Ot(t),r&512&&(Ve||n===null||Qn(n,n.return)),r&4){var a=n!==null?n.memoizedState:null;if(r=t.memoizedState,n===null)if(r===null)if(t.stateNode===null){e:{r=t.type,n=t.memoizedProps,o=o.ownerDocument||o;t:switch(r){case"title":a=o.getElementsByTagName("title")[0],(!a||a[bs]||a[st]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=o.createElement(r),o.head.insertBefore(a,o.querySelector("head > title"))),ut(a,r,n),a[st]=t,Ze(a),r=a;break e;case"link":var i=pv("link","href",o).get(r+(n.href||""));if(i){for(var l=0;l<i.length;l++)if(a=i[l],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(l,1);break t}}a=o.createElement(r),ut(a,r,n),o.head.appendChild(a);break;case"meta":if(i=pv("meta","content",o).get(r+(n.content||""))){for(l=0;l<i.length;l++)if(a=i[l],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(l,1);break t}}a=o.createElement(r),ut(a,r,n),o.head.appendChild(a);break;default:throw Error(D(468,r))}a[st]=t,Ze(a),r=a}t.stateNode=r}else mv(o,t.type,t.stateNode);else t.stateNode=dv(o,r,t.memoizedProps);else a!==r?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,r===null?mv(o,t.type,t.stateNode):dv(o,r,t.memoizedProps)):r===null&&t.stateNode!==null&&Zp(t,t.memoizedProps,n.memoizedProps)}break;case 27:Dt(e,t),Ot(t),r&512&&(Ve||n===null||Qn(n,n.return)),n!==null&&r&4&&Zp(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Dt(e,t),Ot(t),r&512&&(Ve||n===null||Qn(n,n.return)),t.flags&32){o=t.stateNode;try{yi(o,"")}catch(h){fe(t,t.return,h)}}r&4&&t.stateNode!=null&&(o=t.memoizedProps,Zp(t,o,n!==null?n.memoizedProps:o)),r&1024&&(tm=!0);break;case 6:if(Dt(e,t),Ot(t),r&4){if(t.stateNode===null)throw Error(D(162));r=t.memoizedProps,n=t.stateNode;try{n.nodeValue=r}catch(h){fe(t,t.return,h)}}break;case 3:if(Sc=null,o=Mn,Mn=Yc(e.containerInfo),Dt(e,t),Mn=o,Ot(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Ai(e.containerInfo)}catch(h){fe(t,t.return,h)}tm&&(tm=!1,b1(t));break;case 4:r=Mn,Mn=Yc(t.stateNode.containerInfo),Dt(e,t),Ot(t),Mn=r;break;case 12:Dt(e,t),Ot(t);break;case 31:Dt(e,t),Ot(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,ac(t,r)));break;case 13:Dt(e,t),Ot(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(du=Qt()),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,ac(t,r)));break;case 22:o=t.memoizedState!==null;var s=n!==null&&n.memoizedState!==null,f=pr,c=Ve;if(pr=f||o,Ve=c||s,Dt(e,t),Ve=c,pr=f,Ot(t),r&8192)e:for(e=t.stateNode,e._visibility=o?e._visibility&-2:e._visibility|1,o&&(n===null||s||pr||Ve||Qo(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){s=n=e;try{if(a=s.stateNode,o)i=a.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{l=s.stateNode;var u=s.memoizedProps.style,d=u!=null&&u.hasOwnProperty("display")?u.display:null;l.style.display=d==null||typeof d=="boolean"?"":(""+d).trim()}}catch(h){fe(s,s.return,h)}}}else if(e.tag===6){if(n===null){s=e;try{s.stateNode.nodeValue=o?"":s.memoizedProps}catch(h){fe(s,s.return,h)}}}else if(e.tag===18){if(n===null){s=e;try{var p=s.stateNode;o?lv(p,!0):lv(s.stateNode,!1)}catch(h){fe(s,s.return,h)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}r&4&&(r=t.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,ac(t,n))));break;case 19:Dt(e,t),Ot(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,ac(t,r)));break;case 30:break;case 21:break;default:Dt(e,t),Ot(t)}}function Ot(t){var e=t.flags;if(e&2){try{for(var n,r=t.return;r!==null;){if(u1(r)){n=r;break}r=r.return}if(n==null)throw Error(D(160));switch(n.tag){case 27:var o=n.stateNode,a=em(t);Uc(t,a,o);break;case 5:var i=n.stateNode;n.flags&32&&(yi(i,""),n.flags&=-33);var l=em(t);Uc(t,l,i);break;case 3:case 4:var s=n.stateNode.containerInfo,f=em(t);Um(t,f,s);break;default:throw Error(D(161))}}catch(c){fe(t,t.return,c)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function b1(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;b1(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function cr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)p1(t,e.alternate,e),e=e.sibling}function Qo(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:ho(4,e,e.return),Qo(e);break;case 1:Qn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&f1(e,e.return,n),Qo(e);break;case 27:es(e.stateNode);case 26:case 5:Qn(e,e.return),Qo(e);break;case 22:e.memoizedState===null&&Qo(e);break;case 30:Qo(e);break;default:Qo(e)}t=t.sibling}}function ur(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var r=e.alternate,o=t,a=e,i=a.flags;switch(a.tag){case 0:case 11:case 15:ur(o,a,n),Ss(4,a);break;case 1:if(ur(o,a,n),r=a,o=r.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(f){fe(r,r.return,f)}if(r=a,o=r.updateQueue,o!==null){var l=r.stateNode;try{var s=o.shared.hiddenCallbacks;if(s!==null)for(o.shared.hiddenCallbacks=null,o=0;o<s.length;o++)xw(s[o],l)}catch(f){fe(r,r.return,f)}}n&&i&64&&s1(a),Yl(a,a.return);break;case 27:d1(a);case 26:case 5:ur(o,a,n),n&&r===null&&i&4&&c1(a),Yl(a,a.return);break;case 12:ur(o,a,n);break;case 31:ur(o,a,n),n&&i&4&&x1(o,a);break;case 13:ur(o,a,n),n&&i&4&&g1(o,a);break;case 22:a.memoizedState===null&&ur(o,a,n),Yl(a,a.return);break;case 30:break;default:ur(o,a,n)}e=e.sibling}}function Hh(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&vs(n))}function Uh(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&vs(t))}function Tn(t,e,n,r){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)I1(t,e,n,r),e=e.sibling}function I1(t,e,n,r){var o=e.flags;switch(e.tag){case 0:case 11:case 15:Tn(t,e,n,r),o&2048&&Ss(9,e);break;case 1:Tn(t,e,n,r);break;case 3:Tn(t,e,n,r),o&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&vs(t)));break;case 12:if(o&2048){Tn(t,e,n,r),t=e.stateNode;try{var a=e.memoizedProps,i=a.id,l=a.onPostCommit;typeof l=="function"&&l(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(s){fe(e,e.return,s)}}else Tn(t,e,n,r);break;case 31:Tn(t,e,n,r);break;case 13:Tn(t,e,n,r);break;case 23:break;case 22:a=e.stateNode,i=e.alternate,e.memoizedState!==null?a._visibility&2?Tn(t,e,n,r):Jl(t,e):a._visibility&2?Tn(t,e,n,r):(a._visibility|=2,Ka(t,e,n,r,(e.subtreeFlags&10256)!==0||!1)),o&2048&&Hh(i,e);break;case 24:Tn(t,e,n,r),o&2048&&Uh(e.alternate,e);break;default:Tn(t,e,n,r)}}function Ka(t,e,n,r,o){for(o=o&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var a=t,i=e,l=n,s=r,f=i.flags;switch(i.tag){case 0:case 11:case 15:Ka(a,i,l,s,o),Ss(8,i);break;case 23:break;case 22:var c=i.stateNode;i.memoizedState!==null?c._visibility&2?Ka(a,i,l,s,o):Jl(a,i):(c._visibility|=2,Ka(a,i,l,s,o)),o&&f&2048&&Hh(i.alternate,i);break;case 24:Ka(a,i,l,s,o),o&&f&2048&&Uh(i.alternate,i);break;default:Ka(a,i,l,s,o)}e=e.sibling}}function Jl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,r=e,o=r.flags;switch(r.tag){case 22:Jl(n,r),o&2048&&Hh(r.alternate,r);break;case 24:Jl(n,r),o&2048&&Uh(r.alternate,r);break;default:Jl(n,r)}e=e.sibling}}var Hl=8192;function Wa(t,e,n){if(t.subtreeFlags&Hl)for(t=t.child;t!==null;)v1(t,e,n),t=t.sibling}function v1(t,e,n){switch(t.tag){case 26:Wa(t,e,n),t.flags&Hl&&t.memoizedState!==null&&oE(n,Mn,t.memoizedState,t.memoizedProps);break;case 5:Wa(t,e,n);break;case 3:case 4:var r=Mn;Mn=Yc(t.stateNode.containerInfo),Wa(t,e,n),Mn=r;break;case 22:t.memoizedState===null&&(r=t.alternate,r!==null&&r.memoizedState!==null?(r=Hl,Hl=16777216,Wa(t,e,n),Hl=r):Wa(t,e,n));break;default:Wa(t,e,n)}}function w1(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Fl(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];$e=r,k1(r,t)}w1(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)S1(t),t=t.sibling}function S1(t){switch(t.tag){case 0:case 11:case 15:Fl(t),t.flags&2048&&ho(9,t,t.return);break;case 3:Fl(t);break;case 12:Fl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,vc(t)):Fl(t);break;default:Fl(t)}}function vc(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];$e=r,k1(r,t)}w1(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:ho(8,e,e.return),vc(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,vc(e));break;default:vc(e)}t=t.sibling}}function k1(t,e){for(;$e!==null;){var n=$e;switch(n.tag){case 0:case 11:case 15:ho(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:vs(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,$e=r;else e:for(n=t;$e!==null;){r=$e;var o=r.sibling,a=r.return;if(m1(r),r===n){$e=null;break e}if(o!==null){o.return=a,$e=o;break e}$e=a}}}var vB={getCacheForType:function(t){var e=ct(Ge),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return ct(Ge).controller.signal}},wB=typeof WeakMap=="function"?WeakMap:Map,ae=0,he=null,Z=null,te=0,se=0,Ut=null,eo=!1,Ri=!1,jh=!1,kr=0,qe=0,xo=0,Jo=0,Vh=0,Gt=0,wi=0,$l=null,Bt=null,jm=!1,du=0,C1=0,jc=1/0,Vc=null,lo=null,We=0,so=null,Si=null,br=0,Vm=0,Gm=null,A1=null,Zl=0,Qm=null;function Kt(){return(ae&2)!==0&&te!==0?te&-te:G.T!==null?Qh():Lv()}function T1(){if(Gt===0)if((te&536870912)===0||re){var t=Kf;Kf<<=1,(Kf&3932160)===0&&(Kf=262144),Gt=t}else Gt=536870912;return t=Jt.current,t!==null&&(t.flags|=32),Gt}function Et(t,e,n){(t===he&&(se===2||se===9)||t.cancelPendingCommit!==null)&&(ki(t,0),to(t,te,Gt,!1)),ys(t,n),((ae&2)===0||t!==he)&&(t===he&&((ae&2)===0&&(Jo|=n),qe===4&&to(t,te,Gt,!1)),Kn(t))}function M1(t,e,n){if((ae&6)!==0)throw Error(D(327));var r=!n&&(e&127)===0&&(e&t.expiredLanes)===0||gs(t,e),o=r?CB(t,e):nm(t,e,!0),a=r;do{if(o===0){Ri&&!r&&to(t,e,0,!1);break}else{if(n=t.current.alternate,a&&!SB(n)){o=nm(t,e,!1),a=!1;continue}if(o===2){if(a=e,t.errorRecoveryDisabledLanes&a)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var l=t;o=$l;var s=l.current.memoizedState.isDehydrated;if(s&&(ki(l,i).flags|=256),i=nm(l,i,!1),i!==2){if(jh&&!s){l.errorRecoveryDisabledLanes|=a,Jo|=a,o=4;break e}a=Bt,Bt=o,a!==null&&(Bt===null?Bt=a:Bt.push.apply(Bt,a))}o=i}if(a=!1,o!==2)continue}}if(o===1){ki(t,0),to(t,e,0,!0);break}e:{switch(r=t,a=o,a){case 0:case 1:throw Error(D(345));case 4:if((e&4194048)!==e)break;case 6:to(r,e,Gt,!eo);break e;case 2:Bt=null;break;case 3:case 5:break;default:throw Error(D(329))}if((e&62914560)===e&&(o=du+300-Qt(),10<o)){if(to(r,e,Gt,!eo),tu(r,0,!0)!==0)break e;br=e,r.timeoutHandle=W1(QI.bind(null,r,n,Bt,Vc,jm,e,Gt,Jo,wi,eo,a,"Throttled",-0,0),o);break e}QI(r,n,Bt,Vc,jm,e,Gt,Jo,wi,eo,a,null,-0,0)}}break}while(!0);Kn(t)}function QI(t,e,n,r,o,a,i,l,s,f,c,u,d,p){if(t.timeoutHandle=-1,u=e.subtreeFlags,u&8192||(u&16785408)===16785408){u={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:hr},v1(e,a,u);var h=(a&62914560)===a?du-Qt():(a&4194048)===a?C1-Qt():0;if(h=aE(u,h),h!==null){br=a,t.cancelPendingCommit=h(WI.bind(null,t,e,a,n,r,o,i,l,s,c,u,null,d,p)),to(t,a,i,!f);return}}WI(t,e,a,n,r,o,i,l,s)}function SB(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var o=n[r],a=o.getSnapshot;o=o.value;try{if(!Yt(a(),o))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function to(t,e,n,r){e&=~Vh,e&=~Jo,t.suspendedLanes|=e,t.pingedLanes&=~e,r&&(t.warmLanes|=e),r=t.expirationTimes;for(var o=e;0<o;){var a=31-Wt(o),i=1<<a;r[a]=-1,o&=~i}n!==0&&Bv(t,n,e)}function pu(){return(ae&6)===0?(ks(0,!1),!1):!0}function Gh(){if(Z!==null){if(se===0)var t=Z.return;else t=Z,xr=la=null,Oh(t),pi=null,ls=0,t=Z;for(;t!==null;)l1(t.alternate,t),t=t.return;Z=null}}function ki(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,HB(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),br=0,Gh(),he=t,Z=n=gr(t.current,null),te=e,se=0,Ut=null,eo=!1,Ri=gs(t,e),jh=!1,wi=Gt=Vh=Jo=xo=qe=0,Bt=$l=null,jm=!1,(e&8)!==0&&(e|=e&32);var r=t.entangledLanes;if(r!==0)for(t=t.entanglements,r&=e;0<r;){var o=31-Wt(r),a=1<<o;e|=t[o],r&=~a}return kr=e,au(),n}function D1(t,e){K=null,G.H=fs,e===Oi||e===lu?(e=kI(),se=3):e===Sh?(e=kI(),se=4):se=e===_h?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Ut=e,Z===null&&(qe=1,zc(t,dn(e,t.current)))}function O1(){var t=Jt.current;return t===null?!0:(te&4194048)===te?mn===null:(te&62914560)===te||(te&536870912)!==0?t===mn:!1}function R1(){var t=G.H;return G.H=fs,t===null?fs:t}function B1(){var t=G.A;return G.A=vB,t}function Gc(){qe=4,eo||(te&4194048)!==te&&Jt.current!==null||(Ri=!0),(xo&134217727)===0&&(Jo&134217727)===0||he===null||to(he,te,Gt,!1)}function nm(t,e,n){var r=ae;ae|=2;var o=R1(),a=B1();(he!==t||te!==e)&&(Vc=null,ki(t,e)),e=!1;var i=qe;e:do try{if(se!==0&&Z!==null){var l=Z,s=Ut;switch(se){case 8:Gh(),i=6;break e;case 3:case 2:case 9:case 6:Jt.current===null&&(e=!0);var f=se;if(se=0,Ut=null,si(t,l,s,f),n&&Ri){i=0;break e}break;default:f=se,se=0,Ut=null,si(t,l,s,f)}}kB(),i=qe;break}catch(c){D1(t,c)}while(!0);return e&&t.shellSuspendCounter++,xr=la=null,ae=r,G.H=o,G.A=a,Z===null&&(he=null,te=0,au()),i}function kB(){for(;Z!==null;)E1(Z)}function CB(t,e){var n=ae;ae|=2;var r=R1(),o=B1();he!==t||te!==e?(Vc=null,jc=Qt()+500,ki(t,e)):Ri=gs(t,e);e:do try{if(se!==0&&Z!==null){e=Z;var a=Ut;t:switch(se){case 1:se=0,Ut=null,si(t,e,a,1);break;case 2:case 9:if(SI(a)){se=0,Ut=null,XI(e);break}e=function(){se!==2&&se!==9||he!==t||(se=7),Kn(t)},a.then(e,e);break e;case 3:se=7;break e;case 4:se=5;break e;case 7:SI(a)?(se=0,Ut=null,XI(e)):(se=0,Ut=null,si(t,e,a,7));break;case 5:var i=null;switch(Z.tag){case 26:i=Z.memoizedState;case 5:case 27:var l=Z;if(i?Z1(i):l.stateNode.complete){se=0,Ut=null;var s=l.sibling;if(s!==null)Z=s;else{var f=l.return;f!==null?(Z=f,mu(f)):Z=null}break t}}se=0,Ut=null,si(t,e,a,5);break;case 6:se=0,Ut=null,si(t,e,a,6);break;case 8:Gh(),qe=6;break e;default:throw Error(D(462))}}AB();break}catch(c){D1(t,c)}while(!0);return xr=la=null,G.H=r,G.A=o,ae=n,Z!==null?0:(he=null,te=0,au(),qe)}function AB(){for(;Z!==null&&!KO();)E1(Z)}function E1(t){var e=i1(t.alternate,t,kr);t.memoizedProps=t.pendingProps,e===null?mu(t):Z=e}function XI(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=zI(n,e,e.pendingProps,e.type,void 0,te);break;case 11:e=zI(n,e,e.pendingProps,e.type.render,e.ref,te);break;case 5:Oh(e);default:l1(n,e),e=Z=lw(e,kr),e=i1(n,e,kr)}t.memoizedProps=t.pendingProps,e===null?mu(t):Z=e}function si(t,e,n,r){xr=la=null,Oh(e),pi=null,ls=0;var o=e.return;try{if(mB(t,o,e,n,te)){qe=1,zc(t,dn(n,t.current)),Z=null;return}}catch(a){if(o!==null)throw Z=o,a;qe=1,zc(t,dn(n,t.current)),Z=null;return}e.flags&32768?(re||r===1?t=!0:Ri||(te&536870912)!==0?t=!1:(eo=t=!0,(r===2||r===9||r===3||r===6)&&(r=Jt.current,r!==null&&r.tag===13&&(r.flags|=16384))),F1(e,t)):mu(e)}function mu(t){var e=t;do{if((e.flags&32768)!==0){F1(e,eo);return}t=e.return;var n=gB(e.alternate,e,kr);if(n!==null){Z=n;return}if(e=e.sibling,e!==null){Z=e;return}Z=e=t}while(e!==null);qe===0&&(qe=5)}function F1(t,e){do{var n=yB(t.alternate,t);if(n!==null){n.flags&=32767,Z=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){Z=t;return}Z=t=n}while(t!==null);qe=6,Z=null}function WI(t,e,n,r,o,a,i,l,s){t.cancelPendingCommit=null;do hu();while(We!==0);if((ae&6)!==0)throw Error(D(327));if(e!==null){if(e===t.current)throw Error(D(177));if(a=e.lanes|e.childLanes,a|=xh,aR(t,n,a,i,l,s),t===he&&(Z=he=null,te=0),Si=e,so=t,br=n,Vm=a,Gm=o,A1=r,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,OB(Dc,function(){return _1(),null})):(t.callbackNode=null,t.callbackPriority=0),r=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||r){r=G.T,G.T=null,o=ie.p,ie.p=2,i=ae,ae|=4;try{bB(t,e,n)}finally{ae=i,ie.p=o,G.T=r}}We=1,L1(),N1(),q1()}}function L1(){if(We===1){We=0;var t=so,e=Si,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=G.T,G.T=null;var r=ie.p;ie.p=2;var o=ae;ae|=4;try{y1(e,t);var a=Ym,i=Zv(t.containerInfo),l=a.focusedElem,s=a.selectionRange;if(i!==l&&l&&l.ownerDocument&&$v(l.ownerDocument.documentElement,l)){if(s!==null&&hh(l)){var f=s.start,c=s.end;if(c===void 0&&(c=f),"selectionStart"in l)l.selectionStart=f,l.selectionEnd=Math.min(c,l.value.length);else{var u=l.ownerDocument||document,d=u&&u.defaultView||window;if(d.getSelection){var p=d.getSelection(),h=l.textContent.length,y=Math.min(s.start,h),b=s.end===void 0?y:Math.min(s.end,h);!p.extend&&y>b&&(i=b,b=y,y=i);var m=xI(l,y),g=xI(l,b);if(m&&g&&(p.rangeCount!==1||p.anchorNode!==m.node||p.anchorOffset!==m.offset||p.focusNode!==g.node||p.focusOffset!==g.offset)){var x=u.createRange();x.setStart(m.node,m.offset),p.removeAllRanges(),y>b?(p.addRange(x),p.extend(g.node,g.offset)):(x.setEnd(g.node,g.offset),p.addRange(x))}}}}for(u=[],p=l;p=p.parentNode;)p.nodeType===1&&u.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<u.length;l++){var I=u[l];I.element.scrollLeft=I.left,I.element.scrollTop=I.top}}Zc=!!Km,Ym=Km=null}finally{ae=o,ie.p=r,G.T=n}}t.current=e,We=2}}function N1(){if(We===2){We=0;var t=so,e=Si,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=G.T,G.T=null;var r=ie.p;ie.p=2;var o=ae;ae|=4;try{p1(t,e.alternate,e)}finally{ae=o,ie.p=r,G.T=n}}We=3}}function q1(){if(We===4||We===3){We=0,YO();var t=so,e=Si,n=br,r=A1;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?We=5:(We=0,Si=so=null,P1(t,t.pendingLanes));var o=t.pendingLanes;if(o===0&&(lo=null),sh(n),e=e.stateNode,Xt&&typeof Xt.onCommitFiberRoot=="function")try{Xt.onCommitFiberRoot(xs,e,void 0,(e.current.flags&128)===128)}catch{}if(r!==null){e=G.T,o=ie.p,ie.p=2,G.T=null;try{for(var a=t.onRecoverableError,i=0;i<r.length;i++){var l=r[i];a(l.value,{componentStack:l.stack})}}finally{G.T=e,ie.p=o}}(br&3)!==0&&hu(),Kn(t),o=t.pendingLanes,(n&261930)!==0&&(o&42)!==0?t===Qm?Zl++:(Zl=0,Qm=t):Zl=0,ks(0,!1)}}function P1(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,vs(e)))}function hu(){return L1(),N1(),q1(),_1()}function _1(){if(We!==5)return!1;var t=so,e=Vm;Vm=0;var n=sh(br),r=G.T,o=ie.p;try{ie.p=32>n?32:n,G.T=null,n=Gm,Gm=null;var a=so,i=br;if(We=0,Si=so=null,br=0,(ae&6)!==0)throw Error(D(331));var l=ae;if(ae|=4,S1(a.current),I1(a,a.current,i,n),ae=l,ks(0,!1),Xt&&typeof Xt.onPostCommitFiberRoot=="function")try{Xt.onPostCommitFiberRoot(xs,a)}catch{}return!0}finally{ie.p=o,G.T=r,P1(t,e)}}function KI(t,e,n){e=dn(n,e),e=_m(t.stateNode,e,2),t=io(t,e,2),t!==null&&(ys(t,2),Kn(t))}function fe(t,e,n){if(t.tag===3)KI(t,t,n);else for(;e!==null;){if(e.tag===3){KI(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(lo===null||!lo.has(r))){t=dn(n,t),n=e1(2),r=io(e,n,2),r!==null&&(t1(n,r,e,t),ys(r,2),Kn(r));break}}e=e.return}}function rm(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new wB;var o=new Set;r.set(e,o)}else o=r.get(e),o===void 0&&(o=new Set,r.set(e,o));o.has(n)||(jh=!0,o.add(n),t=TB.bind(null,t,e,n),e.then(t,t))}function TB(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,he===t&&(te&n)===n&&(qe===4||qe===3&&(te&62914560)===te&&300>Qt()-du?(ae&2)===0&&ki(t,0):Vh|=n,wi===te&&(wi=0)),Kn(t)}function z1(t,e){e===0&&(e=Rv()),t=ia(t,e),t!==null&&(ys(t,e),Kn(t))}function MB(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),z1(t,n)}function DB(t,e){var n=0;switch(t.tag){case 31:case 13:var r=t.stateNode,o=t.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=t.stateNode;break;case 22:r=t.stateNode._retryCache;break;default:throw Error(D(314))}r!==null&&r.delete(e),z1(t,n)}function OB(t,e){return ih(t,e)}var Qc=null,Ya=null,Xm=!1,Xc=!1,om=!1,no=0;function Kn(t){t!==Ya&&t.next===null&&(Ya===null?Qc=Ya=t:Ya=Ya.next=t),Xc=!0,Xm||(Xm=!0,BB())}function ks(t,e){if(!om&&Xc){om=!0;do for(var n=!1,r=Qc;r!==null;){if(!e)if(t!==0){var o=r.pendingLanes;if(o===0)var a=0;else{var i=r.suspendedLanes,l=r.pingedLanes;a=(1<<31-Wt(42|t)+1)-1,a&=o&~(i&~l),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,YI(r,a))}else a=te,a=tu(r,r===he?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),(a&3)===0||gs(r,a)||(n=!0,YI(r,a));r=r.next}while(n);om=!1}}function RB(){H1()}function H1(){Xc=Xm=!1;var t=0;no!==0&&zB()&&(t=no);for(var e=Qt(),n=null,r=Qc;r!==null;){var o=r.next,a=U1(r,e);a===0?(r.next=null,n===null?Qc=o:n.next=o,o===null&&(Ya=n)):(n=r,(t!==0||(a&3)!==0)&&(Xc=!0)),r=o}We!==0&&We!==5||ks(t,!1),no!==0&&(no=0)}function U1(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,o=t.expirationTimes,a=t.pendingLanes&-62914561;0<a;){var i=31-Wt(a),l=1<<i,s=o[i];s===-1?((l&n)===0||(l&r)!==0)&&(o[i]=oR(l,e)):s<=e&&(t.expiredLanes|=l),a&=~l}if(e=he,n=te,n=tu(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r=t.callbackNode,n===0||t===e&&(se===2||se===9)||t.cancelPendingCommit!==null)return r!==null&&r!==null&&Ep(r),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||gs(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(r!==null&&Ep(r),sh(n)){case 2:case 8:n=Dv;break;case 32:n=Dc;break;case 268435456:n=Ov;break;default:n=Dc}return r=j1.bind(null,t),n=ih(n,r),t.callbackPriority=e,t.callbackNode=n,e}return r!==null&&r!==null&&Ep(r),t.callbackPriority=2,t.callbackNode=null,2}function j1(t,e){if(We!==0&&We!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(hu()&&t.callbackNode!==n)return null;var r=te;return r=tu(t,t===he?r:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r===0?null:(M1(t,r,e),U1(t,Qt()),t.callbackNode!=null&&t.callbackNode===n?j1.bind(null,t):null)}function YI(t,e){if(hu())return null;M1(t,e,!0)}function BB(){UB(function(){(ae&6)!==0?ih(Mv,RB):H1()})}function Qh(){if(no===0){var t=bi;t===0&&(t=Wf,Wf<<=1,(Wf&261888)===0&&(Wf=256)),no=t}return no}function JI(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:dc(""+t)}function $I(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function EB(t,e,n,r,o){if(e==="submit"&&n&&n.stateNode===o){var a=JI((o[Ft]||null).action),i=r.submitter;i&&(e=(e=i[Ft]||null)?JI(e.formAction):i.getAttribute("formAction"),e!==null&&(a=e,i=null));var l=new nu("action","action",null,r,o);t.push({event:l,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(no!==0){var s=i?$I(o,i):new FormData(o);qm(n,{pending:!0,data:s,method:o.method,action:a},null,s)}}else typeof a=="function"&&(l.preventDefault(),s=i?$I(o,i):new FormData(o),qm(n,{pending:!0,data:s,method:o.method,action:a},a,s))},currentTarget:o}]})}}for(ic=0;ic<Cm.length;ic++)lc=Cm[ic],ZI=lc.toLowerCase(),ev=lc[0].toUpperCase()+lc.slice(1),Dn(ZI,"on"+ev);var lc,ZI,ev,ic;Dn(tw,"onAnimationEnd");Dn(nw,"onAnimationIteration");Dn(rw,"onAnimationStart");Dn("dblclick","onDoubleClick");Dn("focusin","onFocus");Dn("focusout","onBlur");Dn(JR,"onTransitionRun");Dn($R,"onTransitionStart");Dn(ZR,"onTransitionCancel");Dn(ow,"onTransitionEnd");gi("onMouseEnter",["mouseout","mouseover"]);gi("onMouseLeave",["mouseout","mouseover"]);gi("onPointerEnter",["pointerout","pointerover"]);gi("onPointerLeave",["pointerout","pointerover"]);ra("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ra("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ra("onBeforeInput",["compositionend","keypress","textInput","paste"]);ra("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ra("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ra("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var cs="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),FB=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(cs));function V1(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],o=r.event;r=r.listeners;e:{var a=void 0;if(e)for(var i=r.length-1;0<=i;i--){var l=r[i],s=l.instance,f=l.currentTarget;if(l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){Rc(c)}o.currentTarget=null,a=s}else for(i=0;i<r.length;i++){if(l=r[i],s=l.instance,f=l.currentTarget,l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){Rc(c)}o.currentTarget=null,a=s}}}}function $(t,e){var n=e[gm];n===void 0&&(n=e[gm]=new Set);var r=t+"__bubble";n.has(r)||(G1(e,t,2,!1),n.add(r))}function am(t,e,n){var r=0;e&&(r|=4),G1(n,t,r,e)}var sc="_reactListening"+Math.random().toString(36).slice(2);function Xh(t){if(!t[sc]){t[sc]=!0,Nv.forEach(function(n){n!=="selectionchange"&&(FB.has(n)||am(n,!1,t),am(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[sc]||(e[sc]=!0,am("selectionchange",!1,e))}}function G1(t,e,n,r){switch(oS(e)){case 2:var o=sE;break;case 8:o=fE;break;default:o=Jh}n=o.bind(null,e,n,t),o=void 0,!wm||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(o=!0),r?o!==void 0?t.addEventListener(e,n,{capture:!0,passive:o}):t.addEventListener(e,n,!0):o!==void 0?t.addEventListener(e,n,{passive:o}):t.addEventListener(e,n,!1)}function im(t,e,n,r,o){var a=r;if((e&1)===0&&(e&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var l=r.stateNode.containerInfo;if(l===o)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&i.stateNode.containerInfo===o)return;i=i.return}for(;l!==null;){if(i=Za(l),i===null)return;if(s=i.tag,s===5||s===6||s===26||s===27){r=a=i;continue e}l=l.parentNode}}r=r.return}Vv(function(){var f=a,c=uh(n),u=[];e:{var d=aw.get(t);if(d!==void 0){var p=nu,h=t;switch(t){case"keypress":if(mc(n)===0)break e;case"keydown":case"keyup":p=DR;break;case"focusin":h="focus",p=Pp;break;case"focusout":h="blur",p=Pp;break;case"beforeblur":case"afterblur":p=Pp;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=lI;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=gR;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=BR;break;case tw:case nw:case rw:p=IR;break;case ow:p=FR;break;case"scroll":case"scrollend":p=hR;break;case"wheel":p=NR;break;case"copy":case"cut":case"paste":p=wR;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=fI;break;case"toggle":case"beforetoggle":p=PR}var y=(e&4)!==0,b=!y&&(t==="scroll"||t==="scrollend"),m=y?d!==null?d+"Capture":null:d;y=[];for(var g=f,x;g!==null;){var I=g;if(x=I.stateNode,I=I.tag,I!==5&&I!==26&&I!==27||x===null||m===null||(I=ns(g,m),I!=null&&y.push(us(g,I,x))),b)break;g=g.return}0<y.length&&(d=new p(d,h,null,n,c),u.push({event:d,listeners:y}))}}if((e&7)===0){e:{if(d=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",d&&n!==vm&&(h=n.relatedTarget||n.fromElement)&&(Za(h)||h[Ti]))break e;if((p||d)&&(d=c.window===c?c:(d=c.ownerDocument)?d.defaultView||d.parentWindow:window,p?(h=n.relatedTarget||n.toElement,p=f,h=h?Za(h):null,h!==null&&(b=hs(h),y=h.tag,h!==b||y!==5&&y!==27&&y!==6)&&(h=null)):(p=null,h=f),p!==h)){if(y=lI,I="onMouseLeave",m="onMouseEnter",g="mouse",(t==="pointerout"||t==="pointerover")&&(y=fI,I="onPointerLeave",m="onPointerEnter",g="pointer"),b=p==null?d:_l(p),x=h==null?d:_l(h),d=new y(I,g+"leave",p,n,c),d.target=b,d.relatedTarget=x,I=null,Za(c)===f&&(y=new y(m,g+"enter",h,n,c),y.target=x,y.relatedTarget=b,I=y),b=I,p&&h)t:{for(y=LB,m=p,g=h,x=0,I=m;I;I=y(I))x++;I=0;for(var v=g;v;v=y(v))I++;for(;0<x-I;)m=y(m),x--;for(;0<I-x;)g=y(g),I--;for(;x--;){if(m===g||g!==null&&m===g.alternate){y=m;break t}m=y(m),g=y(g)}y=null}else y=null;p!==null&&tv(u,d,p,y,!1),h!==null&&b!==null&&tv(u,b,h,y,!0)}}e:{if(d=f?_l(f):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var w=pI;else if(dI(d))if(Yv)w=WR;else{w=QR;var S=GR}else p=d.nodeName,!p||p.toLowerCase()!=="input"||d.type!=="checkbox"&&d.type!=="radio"?f&&ch(f.elementType)&&(w=pI):w=XR;if(w&&(w=w(t,f))){Kv(u,w,n,c);break e}S&&S(t,d,f),t==="focusout"&&f&&d.type==="number"&&f.memoizedProps.value!=null&&Im(d,"number",d.value)}switch(S=f?_l(f):window,t){case"focusin":(dI(S)||S.contentEditable==="true")&&(ni=S,Sm=f,Vl=null);break;case"focusout":Vl=Sm=ni=null;break;case"mousedown":km=!0;break;case"contextmenu":case"mouseup":case"dragend":km=!1,gI(u,n,c);break;case"selectionchange":if(YR)break;case"keydown":case"keyup":gI(u,n,c)}var k;if(mh)e:{switch(t){case"compositionstart":var M="onCompositionStart";break e;case"compositionend":M="onCompositionEnd";break e;case"compositionupdate":M="onCompositionUpdate";break e}M=void 0}else ti?Xv(t,n)&&(M="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(M="onCompositionStart");M&&(Qv&&n.locale!=="ko"&&(ti||M!=="onCompositionStart"?M==="onCompositionEnd"&&ti&&(k=Gv()):(Zr=c,dh="value"in Zr?Zr.value:Zr.textContent,ti=!0)),S=Wc(f,M),0<S.length&&(M=new sI(M,t,null,n,c),u.push({event:M,listeners:S}),k?M.data=k:(k=Wv(n),k!==null&&(M.data=k)))),(k=zR?HR(t,n):UR(t,n))&&(M=Wc(f,"onBeforeInput"),0<M.length&&(S=new sI("onBeforeInput","beforeinput",null,n,c),u.push({event:S,listeners:M}),S.data=k)),EB(u,t,f,n,c)}V1(u,e)})}function us(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Wc(t,e){for(var n=e+"Capture",r=[];t!==null;){var o=t,a=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||a===null||(o=ns(t,n),o!=null&&r.unshift(us(t,o,a)),o=ns(t,e),o!=null&&r.push(us(t,o,a))),t.tag===3)return r;t=t.return}return[]}function LB(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function tv(t,e,n,r,o){for(var a=e._reactName,i=[];n!==null&&n!==r;){var l=n,s=l.alternate,f=l.stateNode;if(l=l.tag,s!==null&&s===r)break;l!==5&&l!==26&&l!==27||f===null||(s=f,o?(f=ns(n,a),f!=null&&i.unshift(us(n,f,s))):o||(f=ns(n,a),f!=null&&i.push(us(n,f,s)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var NB=/\r\n?/g,qB=/\u0000|\uFFFD/g;function nv(t){return(typeof t=="string"?t:""+t).replace(NB,`
`).replace(qB,"")}function Q1(t,e){return e=nv(e),nv(t)===e}function pe(t,e,n,r,o,a){switch(n){case"children":typeof r=="string"?e==="body"||e==="textarea"&&r===""||yi(t,r):(typeof r=="number"||typeof r=="bigint")&&e!=="body"&&yi(t,""+r);break;case"className":Jf(t,"class",r);break;case"tabIndex":Jf(t,"tabindex",r);break;case"dir":case"role":case"viewBox":case"width":case"height":Jf(t,n,r);break;case"style":jv(t,r,a);break;case"data":if(e!=="object"){Jf(t,"data",r);break}case"src":case"href":if(r===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(r==null||typeof r=="function"||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=dc(""+r),t.setAttribute(n,r);break;case"action":case"formAction":if(typeof r=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(e!=="input"&&pe(t,e,"name",o.name,o,null),pe(t,e,"formEncType",o.formEncType,o,null),pe(t,e,"formMethod",o.formMethod,o,null),pe(t,e,"formTarget",o.formTarget,o,null)):(pe(t,e,"encType",o.encType,o,null),pe(t,e,"method",o.method,o,null),pe(t,e,"target",o.target,o,null)));if(r==null||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=dc(""+r),t.setAttribute(n,r);break;case"onClick":r!=null&&(t.onclick=hr);break;case"onScroll":r!=null&&$("scroll",t);break;case"onScrollEnd":r!=null&&$("scrollend",t);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(D(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(D(60));t.innerHTML=n}}break;case"multiple":t.multiple=r&&typeof r!="function"&&typeof r!="symbol";break;case"muted":t.muted=r&&typeof r!="function"&&typeof r!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(r==null||typeof r=="function"||typeof r=="boolean"||typeof r=="symbol"){t.removeAttribute("xlink:href");break}n=dc(""+r),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""+r):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":r&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":r===!0?t.setAttribute(n,""):r!==!1&&r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,r):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":r!=null&&typeof r!="function"&&typeof r!="symbol"&&!isNaN(r)&&1<=r?t.setAttribute(n,r):t.removeAttribute(n);break;case"rowSpan":case"start":r==null||typeof r=="function"||typeof r=="symbol"||isNaN(r)?t.removeAttribute(n):t.setAttribute(n,r);break;case"popover":$("beforetoggle",t),$("toggle",t),uc(t,"popover",r);break;case"xlinkActuate":lr(t,"http://www.w3.org/1999/xlink","xlink:actuate",r);break;case"xlinkArcrole":lr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",r);break;case"xlinkRole":lr(t,"http://www.w3.org/1999/xlink","xlink:role",r);break;case"xlinkShow":lr(t,"http://www.w3.org/1999/xlink","xlink:show",r);break;case"xlinkTitle":lr(t,"http://www.w3.org/1999/xlink","xlink:title",r);break;case"xlinkType":lr(t,"http://www.w3.org/1999/xlink","xlink:type",r);break;case"xmlBase":lr(t,"http://www.w3.org/XML/1998/namespace","xml:base",r);break;case"xmlLang":lr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",r);break;case"xmlSpace":lr(t,"http://www.w3.org/XML/1998/namespace","xml:space",r);break;case"is":uc(t,"is",r);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=pR.get(n)||n,uc(t,n,r))}}function Wm(t,e,n,r,o,a){switch(n){case"style":jv(t,r,a);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(D(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(D(60));t.innerHTML=n}}break;case"children":typeof r=="string"?yi(t,r):(typeof r=="number"||typeof r=="bigint")&&yi(t,""+r);break;case"onScroll":r!=null&&$("scroll",t);break;case"onScrollEnd":r!=null&&$("scrollend",t);break;case"onClick":r!=null&&(t.onclick=hr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!qv.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(o=n.endsWith("Capture"),e=n.slice(2,o?n.length-7:void 0),a=t[Ft]||null,a=a!=null?a[n]:null,typeof a=="function"&&t.removeEventListener(e,a,o),typeof r=="function")){typeof a!="function"&&a!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,r,o);break e}n in t?t[n]=r:r===!0?t.setAttribute(n,""):uc(t,n,r)}}}function ut(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":$("error",t),$("load",t);var r=!1,o=!1,a;for(a in n)if(n.hasOwnProperty(a)){var i=n[a];if(i!=null)switch(a){case"src":r=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(D(137,e));default:pe(t,e,a,i,n,null)}}o&&pe(t,e,"srcSet",n.srcSet,n,null),r&&pe(t,e,"src",n.src,n,null);return;case"input":$("invalid",t);var l=a=i=o=null,s=null,f=null;for(r in n)if(n.hasOwnProperty(r)){var c=n[r];if(c!=null)switch(r){case"name":o=c;break;case"type":i=c;break;case"checked":s=c;break;case"defaultChecked":f=c;break;case"value":a=c;break;case"defaultValue":l=c;break;case"children":case"dangerouslySetInnerHTML":if(c!=null)throw Error(D(137,e));break;default:pe(t,e,r,c,n,null)}}zv(t,a,l,s,f,i,o,!1);return;case"select":$("invalid",t),r=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(l=n[o],l!=null))switch(o){case"value":a=l;break;case"defaultValue":i=l;break;case"multiple":r=l;default:pe(t,e,o,l,n,null)}e=a,n=i,t.multiple=!!r,e!=null?ci(t,!!r,e,!1):n!=null&&ci(t,!!r,n,!0);return;case"textarea":$("invalid",t),a=o=r=null;for(i in n)if(n.hasOwnProperty(i)&&(l=n[i],l!=null))switch(i){case"value":r=l;break;case"defaultValue":o=l;break;case"children":a=l;break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(D(91));break;default:pe(t,e,i,l,n,null)}Uv(t,r,o,a);return;case"option":for(s in n)n.hasOwnProperty(s)&&(r=n[s],r!=null)&&(s==="selected"?t.selected=r&&typeof r!="function"&&typeof r!="symbol":pe(t,e,s,r,n,null));return;case"dialog":$("beforetoggle",t),$("toggle",t),$("cancel",t),$("close",t);break;case"iframe":case"object":$("load",t);break;case"video":case"audio":for(r=0;r<cs.length;r++)$(cs[r],t);break;case"image":$("error",t),$("load",t);break;case"details":$("toggle",t);break;case"embed":case"source":case"link":$("error",t),$("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in n)if(n.hasOwnProperty(f)&&(r=n[f],r!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(D(137,e));default:pe(t,e,f,r,n,null)}return;default:if(ch(e)){for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!==void 0&&Wm(t,e,c,r,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(r=n[l],r!=null&&pe(t,e,l,r,n,null))}function PB(t,e,n,r){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,a=null,i=null,l=null,s=null,f=null,c=null;for(p in n){var u=n[p];if(n.hasOwnProperty(p)&&u!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":s=u;default:r.hasOwnProperty(p)||pe(t,e,p,null,r,u)}}for(var d in r){var p=r[d];if(u=n[d],r.hasOwnProperty(d)&&(p!=null||u!=null))switch(d){case"type":a=p;break;case"name":o=p;break;case"checked":f=p;break;case"defaultChecked":c=p;break;case"value":i=p;break;case"defaultValue":l=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(D(137,e));break;default:p!==u&&pe(t,e,d,p,r,u)}}bm(t,i,l,s,f,c,a,o);return;case"select":p=i=l=d=null;for(a in n)if(s=n[a],n.hasOwnProperty(a)&&s!=null)switch(a){case"value":break;case"multiple":p=s;default:r.hasOwnProperty(a)||pe(t,e,a,null,r,s)}for(o in r)if(a=r[o],s=n[o],r.hasOwnProperty(o)&&(a!=null||s!=null))switch(o){case"value":d=a;break;case"defaultValue":l=a;break;case"multiple":i=a;default:a!==s&&pe(t,e,o,a,r,s)}e=l,n=i,r=p,d!=null?ci(t,!!n,d,!1):!!r!=!!n&&(e!=null?ci(t,!!n,e,!0):ci(t,!!n,n?[]:"",!1));return;case"textarea":p=d=null;for(l in n)if(o=n[l],n.hasOwnProperty(l)&&o!=null&&!r.hasOwnProperty(l))switch(l){case"value":break;case"children":break;default:pe(t,e,l,null,r,o)}for(i in r)if(o=r[i],a=n[i],r.hasOwnProperty(i)&&(o!=null||a!=null))switch(i){case"value":d=o;break;case"defaultValue":p=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(D(91));break;default:o!==a&&pe(t,e,i,o,r,a)}Hv(t,d,p);return;case"option":for(var h in n)d=n[h],n.hasOwnProperty(h)&&d!=null&&!r.hasOwnProperty(h)&&(h==="selected"?t.selected=!1:pe(t,e,h,null,r,d));for(s in r)d=r[s],p=n[s],r.hasOwnProperty(s)&&d!==p&&(d!=null||p!=null)&&(s==="selected"?t.selected=d&&typeof d!="function"&&typeof d!="symbol":pe(t,e,s,d,r,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var y in n)d=n[y],n.hasOwnProperty(y)&&d!=null&&!r.hasOwnProperty(y)&&pe(t,e,y,null,r,d);for(f in r)if(d=r[f],p=n[f],r.hasOwnProperty(f)&&d!==p&&(d!=null||p!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(D(137,e));break;default:pe(t,e,f,d,r,p)}return;default:if(ch(e)){for(var b in n)d=n[b],n.hasOwnProperty(b)&&d!==void 0&&!r.hasOwnProperty(b)&&Wm(t,e,b,void 0,r,d);for(c in r)d=r[c],p=n[c],!r.hasOwnProperty(c)||d===p||d===void 0&&p===void 0||Wm(t,e,c,d,r,p);return}}for(var m in n)d=n[m],n.hasOwnProperty(m)&&d!=null&&!r.hasOwnProperty(m)&&pe(t,e,m,null,r,d);for(u in r)d=r[u],p=n[u],!r.hasOwnProperty(u)||d===p||d==null&&p==null||pe(t,e,u,d,r,p)}function rv(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function _B(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),r=0;r<n.length;r++){var o=n[r],a=o.transferSize,i=o.initiatorType,l=o.duration;if(a&&l&&rv(i)){for(i=0,l=o.responseEnd,r+=1;r<n.length;r++){var s=n[r],f=s.startTime;if(f>l)break;var c=s.transferSize,u=s.initiatorType;c&&rv(u)&&(s=s.responseEnd,i+=c*(s<l?1:(l-f)/(s-f)))}if(--r,e+=8*(a+i)/(o.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Km=null,Ym=null;function Kc(t){return t.nodeType===9?t:t.ownerDocument}function ov(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function X1(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Jm(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var lm=null;function zB(){var t=window.event;return t&&t.type==="popstate"?t===lm?!1:(lm=t,!0):(lm=null,!1)}var W1=typeof setTimeout=="function"?setTimeout:void 0,HB=typeof clearTimeout=="function"?clearTimeout:void 0,av=typeof Promise=="function"?Promise:void 0,UB=typeof queueMicrotask=="function"?queueMicrotask:typeof av<"u"?function(t){return av.resolve(null).then(t).catch(jB)}:W1;function jB(t){setTimeout(function(){throw t})}function yo(t){return t==="head"}function iv(t,e){var n=e,r=0;do{var o=n.nextSibling;if(t.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"||n==="/&"){if(r===0){t.removeChild(o),Ai(e);return}r--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")r++;else if(n==="html")es(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,es(n);for(var a=n.firstChild;a;){var i=a.nextSibling,l=a.nodeName;a[bs]||l==="SCRIPT"||l==="STYLE"||l==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=i}}else n==="body"&&es(t.ownerDocument.body);n=o}while(n);Ai(e)}function lv(t,e){var n=t;t=0;do{var r=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=r}while(n)}function $m(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":$m(n),fh(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function VB(t,e,n,r){for(;t.nodeType===1;){var o=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!r&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(r){if(!t[bs])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(a=t.getAttribute("rel"),a==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(a!==o.rel||t.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||t.getAttribute("title")!==(o.title==null?null:o.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(a=t.getAttribute("src"),(a!==(o.src==null?null:o.src)||t.getAttribute("type")!==(o.type==null?null:o.type)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&a&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var a=o.name==null?null:""+o.name;if(o.type==="hidden"&&t.getAttribute("name")===a)return t}else return t;if(t=hn(t.nextSibling),t===null)break}return null}function GB(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=hn(t.nextSibling),t===null))return null;return t}function K1(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=hn(t.nextSibling),t===null))return null;return t}function Zm(t){return t.data==="$?"||t.data==="$~"}function eh(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function QB(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var r=function(){e(),n.removeEventListener("DOMContentLoaded",r)};n.addEventListener("DOMContentLoaded",r),t._reactRetry=r}}function hn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var th=null;function sv(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return hn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function fv(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function Y1(t,e,n){switch(e=Kc(n),t){case"html":if(t=e.documentElement,!t)throw Error(D(452));return t;case"head":if(t=e.head,!t)throw Error(D(453));return t;case"body":if(t=e.body,!t)throw Error(D(454));return t;default:throw Error(D(451))}}function es(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);fh(t)}var xn=new Map,cv=new Set;function Yc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Cr=ie.d;ie.d={f:XB,r:WB,D:KB,C:YB,L:JB,m:$B,X:eE,S:ZB,M:tE};function XB(){var t=Cr.f(),e=pu();return t||e}function WB(t){var e=Mi(t);e!==null&&e.tag===5&&e.type==="form"?jw(e):Cr.r(t)}var Bi=typeof document>"u"?null:document;function J1(t,e,n){var r=Bi;if(r&&typeof e=="string"&&e){var o=un(e);o='link[rel="'+t+'"][href="'+o+'"]',typeof n=="string"&&(o+='[crossorigin="'+n+'"]'),cv.has(o)||(cv.add(o),t={rel:t,crossOrigin:n,href:e},r.querySelector(o)===null&&(e=r.createElement("link"),ut(e,"link",t),Ze(e),r.head.appendChild(e)))}}function KB(t){Cr.D(t),J1("dns-prefetch",t,null)}function YB(t,e){Cr.C(t,e),J1("preconnect",t,e)}function JB(t,e,n){Cr.L(t,e,n);var r=Bi;if(r&&t&&e){var o='link[rel="preload"][as="'+un(e)+'"]';e==="image"&&n&&n.imageSrcSet?(o+='[imagesrcset="'+un(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(o+='[imagesizes="'+un(n.imageSizes)+'"]')):o+='[href="'+un(t)+'"]';var a=o;switch(e){case"style":a=Ci(t);break;case"script":a=Ei(t)}xn.has(a)||(t=Ae({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),xn.set(a,t),r.querySelector(o)!==null||e==="style"&&r.querySelector(Cs(a))||e==="script"&&r.querySelector(As(a))||(e=r.createElement("link"),ut(e,"link",t),Ze(e),r.head.appendChild(e)))}}function $B(t,e){Cr.m(t,e);var n=Bi;if(n&&t){var r=e&&typeof e.as=="string"?e.as:"script",o='link[rel="modulepreload"][as="'+un(r)+'"][href="'+un(t)+'"]',a=o;switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Ei(t)}if(!xn.has(a)&&(t=Ae({rel:"modulepreload",href:t},e),xn.set(a,t),n.querySelector(o)===null)){switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(As(a)))return}r=n.createElement("link"),ut(r,"link",t),Ze(r),n.head.appendChild(r)}}}function ZB(t,e,n){Cr.S(t,e,n);var r=Bi;if(r&&t){var o=fi(r).hoistableStyles,a=Ci(t);e=e||"default";var i=o.get(a);if(!i){var l={loading:0,preload:null};if(i=r.querySelector(Cs(a)))l.loading=5;else{t=Ae({rel:"stylesheet",href:t,"data-precedence":e},n),(n=xn.get(a))&&Wh(t,n);var s=i=r.createElement("link");Ze(s),ut(s,"link",t),s._p=new Promise(function(f,c){s.onload=f,s.onerror=c}),s.addEventListener("load",function(){l.loading|=1}),s.addEventListener("error",function(){l.loading|=2}),l.loading|=4,wc(i,e,r)}i={type:"stylesheet",instance:i,count:1,state:l},o.set(a,i)}}}function eE(t,e){Cr.X(t,e);var n=Bi;if(n&&t){var r=fi(n).hoistableScripts,o=Ei(t),a=r.get(o);a||(a=n.querySelector(As(o)),a||(t=Ae({src:t,async:!0},e),(e=xn.get(o))&&Kh(t,e),a=n.createElement("script"),Ze(a),ut(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function tE(t,e){Cr.M(t,e);var n=Bi;if(n&&t){var r=fi(n).hoistableScripts,o=Ei(t),a=r.get(o);a||(a=n.querySelector(As(o)),a||(t=Ae({src:t,async:!0,type:"module"},e),(e=xn.get(o))&&Kh(t,e),a=n.createElement("script"),Ze(a),ut(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function uv(t,e,n,r){var o=(o=ro.current)?Yc(o):null;if(!o)throw Error(D(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Ci(n.href),n=fi(o).hoistableStyles,r=n.get(e),r||(r={type:"style",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Ci(n.href);var a=fi(o).hoistableStyles,i=a.get(t);if(i||(o=o.ownerDocument||o,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(t,i),(a=o.querySelector(Cs(t)))&&!a._p&&(i.instance=a,i.state.loading=5),xn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},xn.set(t,n),a||nE(o,t,n,i.state))),e&&r===null)throw Error(D(528,""));return i}if(e&&r!==null)throw Error(D(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Ei(n),n=fi(o).hoistableScripts,r=n.get(e),r||(r={type:"script",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};default:throw Error(D(444,t))}}function Ci(t){return'href="'+un(t)+'"'}function Cs(t){return'link[rel="stylesheet"]['+t+"]"}function $1(t){return Ae({},t,{"data-precedence":t.precedence,precedence:null})}function nE(t,e,n,r){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?r.loading=1:(e=t.createElement("link"),r.preload=e,e.addEventListener("load",function(){return r.loading|=1}),e.addEventListener("error",function(){return r.loading|=2}),ut(e,"link",n),Ze(e),t.head.appendChild(e))}function Ei(t){return'[src="'+un(t)+'"]'}function As(t){return"script[async]"+t}function dv(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var r=t.querySelector('style[data-href~="'+un(n.href)+'"]');if(r)return e.instance=r,Ze(r),r;var o=Ae({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(t.ownerDocument||t).createElement("style"),Ze(r),ut(r,"style",o),wc(r,n.precedence,t),e.instance=r;case"stylesheet":o=Ci(n.href);var a=t.querySelector(Cs(o));if(a)return e.state.loading|=4,e.instance=a,Ze(a),a;r=$1(n),(o=xn.get(o))&&Wh(r,o),a=(t.ownerDocument||t).createElement("link"),Ze(a);var i=a;return i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),ut(a,"link",r),e.state.loading|=4,wc(a,n.precedence,t),e.instance=a;case"script":return a=Ei(n.src),(o=t.querySelector(As(a)))?(e.instance=o,Ze(o),o):(r=n,(o=xn.get(a))&&(r=Ae({},n),Kh(r,o)),t=t.ownerDocument||t,o=t.createElement("script"),Ze(o),ut(o,"link",r),t.head.appendChild(o),e.instance=o);case"void":return null;default:throw Error(D(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(r=e.instance,e.state.loading|=4,wc(r,n.precedence,t));return e.instance}function wc(t,e,n){for(var r=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=r.length?r[r.length-1]:null,a=o,i=0;i<r.length;i++){var l=r[i];if(l.dataset.precedence===e)a=l;else if(a!==o)break}a?a.parentNode.insertBefore(t,a.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Wh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Kh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Sc=null;function pv(t,e,n){if(Sc===null){var r=new Map,o=Sc=new Map;o.set(n,r)}else o=Sc,r=o.get(n),r||(r=new Map,o.set(n,r));if(r.has(t))return r;for(r.set(t,null),n=n.getElementsByTagName(t),o=0;o<n.length;o++){var a=n[o];if(!(a[bs]||a[st]||t==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var i=a.getAttribute(e)||"";i=t+i;var l=r.get(i);l?l.push(a):r.set(i,[a])}}return r}function mv(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function rE(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function Z1(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function oE(t,e,n,r){if(n.type==="stylesheet"&&(typeof r.media!="string"||matchMedia(r.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var o=Ci(r.href),a=e.querySelector(Cs(o));if(a){e=a._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Jc.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=a,Ze(a);return}a=e.ownerDocument||e,r=$1(r),(o=xn.get(o))&&Wh(r,o),a=a.createElement("link"),Ze(a);var i=a;i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),ut(a,"link",r),n.instance=a}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=Jc.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var sm=0;function aE(t,e){return t.stylesheets&&t.count===0&&kc(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var r=setTimeout(function(){if(t.stylesheets&&kc(t,t.stylesheets),t.unsuspend){var a=t.unsuspend;t.unsuspend=null,a()}},6e4+e);0<t.imgBytes&&sm===0&&(sm=62500*_B());var o=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&kc(t,t.stylesheets),t.unsuspend)){var a=t.unsuspend;t.unsuspend=null,a()}},(t.imgBytes>sm?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(r),clearTimeout(o)}}:null}function Jc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)kc(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var $c=null;function kc(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,$c=new Map,e.forEach(iE,t),$c=null,Jc.call(t))}function iE(t,e){if(!(e.state.loading&4)){var n=$c.get(t);if(n)var r=n.get(null);else{n=new Map,$c.set(t,n);for(var o=t.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<o.length;a++){var i=o[a];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),r=i)}r&&n.set(null,r)}o=e.instance,i=o.getAttribute("data-precedence"),a=n.get(i)||r,a===r&&n.set(null,o),n.set(i,o),this.count++,r=Jc.bind(this),o.addEventListener("load",r),o.addEventListener("error",r),a?a.parentNode.insertBefore(o,a.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(o,t.firstChild)),e.state.loading|=4}}var ds={$$typeof:mr,Provider:null,Consumer:null,_currentValue:Xo,_currentValue2:Xo,_threadCount:0};function lE(t,e,n,r,o,a,i,l,s){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Fp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Fp(0),this.hiddenUpdates=Fp(null),this.identifierPrefix=r,this.onUncaughtError=o,this.onCaughtError=a,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=s,this.incompleteTransitions=new Map}function eS(t,e,n,r,o,a,i,l,s,f,c,u){return t=new lE(t,e,n,i,s,f,c,u,l),e=1,a===!0&&(e|=24),a=Vt(3,null,null,e),t.current=a,a.stateNode=t,e=vh(),e.refCount++,t.pooledCache=e,e.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:e},kh(a),t}function tS(t){return t?(t=ai,t):ai}function nS(t,e,n,r,o,a){o=tS(o),r.context===null?r.context=o:r.pendingContext=o,r=ao(e),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=io(t,r,e),n!==null&&(Et(n,t,e),Ql(n,t,e))}function hv(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Yh(t,e){hv(t,e),(t=t.alternate)&&hv(t,e)}function rS(t){if(t.tag===13||t.tag===31){var e=ia(t,67108864);e!==null&&Et(e,t,67108864),Yh(t,67108864)}}function xv(t){if(t.tag===13||t.tag===31){var e=Kt();e=lh(e);var n=ia(t,e);n!==null&&Et(n,t,e),Yh(t,e)}}var Zc=!0;function sE(t,e,n,r){var o=G.T;G.T=null;var a=ie.p;try{ie.p=2,Jh(t,e,n,r)}finally{ie.p=a,G.T=o}}function fE(t,e,n,r){var o=G.T;G.T=null;var a=ie.p;try{ie.p=8,Jh(t,e,n,r)}finally{ie.p=a,G.T=o}}function Jh(t,e,n,r){if(Zc){var o=nh(r);if(o===null)im(t,e,r,eu,n),gv(t,r);else if(uE(o,t,e,n,r))r.stopPropagation();else if(gv(t,r),e&4&&-1<cE.indexOf(t)){for(;o!==null;){var a=Mi(o);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var i=Vo(a.pendingLanes);if(i!==0){var l=a;for(l.pendingLanes|=2,l.entangledLanes|=2;i;){var s=1<<31-Wt(i);l.entanglements[1]|=s,i&=~s}Kn(a),(ae&6)===0&&(jc=Qt()+500,ks(0,!1))}}break;case 31:case 13:l=ia(a,2),l!==null&&Et(l,a,2),pu(),Yh(a,2)}if(a=nh(r),a===null&&im(t,e,r,eu,n),a===o)break;o=a}o!==null&&r.stopPropagation()}else im(t,e,r,null,n)}}function nh(t){return t=uh(t),$h(t)}var eu=null;function $h(t){if(eu=null,t=Za(t),t!==null){var e=hs(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=Sv(e),t!==null)return t;t=null}else if(n===31){if(t=kv(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return eu=t,null}function oS(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(JO()){case Mv:return 2;case Dv:return 8;case Dc:case $O:return 32;case Ov:return 268435456;default:return 32}default:return 32}}var rh=!1,fo=null,co=null,uo=null,ps=new Map,ms=new Map,Jr=[],cE="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function gv(t,e){switch(t){case"focusin":case"focusout":fo=null;break;case"dragenter":case"dragleave":co=null;break;case"mouseover":case"mouseout":uo=null;break;case"pointerover":case"pointerout":ps.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ms.delete(e.pointerId)}}function Ll(t,e,n,r,o,a){return t===null||t.nativeEvent!==a?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[o]},e!==null&&(e=Mi(e),e!==null&&rS(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,o!==null&&e.indexOf(o)===-1&&e.push(o),t)}function uE(t,e,n,r,o){switch(e){case"focusin":return fo=Ll(fo,t,e,n,r,o),!0;case"dragenter":return co=Ll(co,t,e,n,r,o),!0;case"mouseover":return uo=Ll(uo,t,e,n,r,o),!0;case"pointerover":var a=o.pointerId;return ps.set(a,Ll(ps.get(a)||null,t,e,n,r,o)),!0;case"gotpointercapture":return a=o.pointerId,ms.set(a,Ll(ms.get(a)||null,t,e,n,r,o)),!0}return!1}function aS(t){var e=Za(t.target);if(e!==null){var n=hs(e);if(n!==null){if(e=n.tag,e===13){if(e=Sv(n),e!==null){t.blockedOn=e,eI(t.priority,function(){xv(n)});return}}else if(e===31){if(e=kv(n),e!==null){t.blockedOn=e,eI(t.priority,function(){xv(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Cc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=nh(t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);vm=r,n.target.dispatchEvent(r),vm=null}else return e=Mi(n),e!==null&&rS(e),t.blockedOn=n,!1;e.shift()}return!0}function yv(t,e,n){Cc(t)&&n.delete(e)}function dE(){rh=!1,fo!==null&&Cc(fo)&&(fo=null),co!==null&&Cc(co)&&(co=null),uo!==null&&Cc(uo)&&(uo=null),ps.forEach(yv),ms.forEach(yv)}function fc(t,e){t.blockedOn===e&&(t.blockedOn=null,rh||(rh=!0,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,dE)))}var cc=null;function bv(t){cc!==t&&(cc=t,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,function(){cc===t&&(cc=null);for(var e=0;e<t.length;e+=3){var n=t[e],r=t[e+1],o=t[e+2];if(typeof r!="function"){if($h(r||n)===null)continue;break}var a=Mi(n);a!==null&&(t.splice(e,3),e-=3,qm(a,{pending:!0,data:o,method:n.method,action:r},r,o))}}))}function Ai(t){function e(s){return fc(s,t)}fo!==null&&fc(fo,t),co!==null&&fc(co,t),uo!==null&&fc(uo,t),ps.forEach(e),ms.forEach(e);for(var n=0;n<Jr.length;n++){var r=Jr[n];r.blockedOn===t&&(r.blockedOn=null)}for(;0<Jr.length&&(n=Jr[0],n.blockedOn===null);)aS(n),n.blockedOn===null&&Jr.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var o=n[r],a=n[r+1],i=o[Ft]||null;if(typeof a=="function")i||bv(n);else if(i){var l=null;if(a&&a.hasAttribute("formAction")){if(o=a,i=a[Ft]||null)l=i.formAction;else if($h(o)!==null)continue}else l=i.action;typeof l=="function"?n[r+1]=l:(n.splice(r,3),r-=3),bv(n)}}}function iS(){function t(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(i){return o=i})},focusReset:"manual",scroll:"manual"})}function e(){o!==null&&(o(),o=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var r=!1,o=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){r=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),o!==null&&(o(),o=null)}}}function Zh(t){this._internalRoot=t}xu.prototype.render=Zh.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(D(409));var n=e.current,r=Kt();nS(n,r,t,e,null,null)};xu.prototype.unmount=Zh.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;nS(t.current,2,null,t,null,null),pu(),e[Ti]=null}};function xu(t){this._internalRoot=t}xu.prototype.unstable_scheduleHydration=function(t){if(t){var e=Lv();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Jr.length&&e!==0&&e<Jr[n].priority;n++);Jr.splice(n,0,t),n===0&&aS(t)}};var Iv=vv.version;if(Iv!=="19.2.6")throw Error(D(527,Iv,"19.2.6"));ie.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(D(188)):(t=Object.keys(t).join(","),Error(D(268,t)));return t=VO(e),t=t!==null?Cv(t):null,t=t===null?null:t.stateNode,t};var pE={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:G,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Nl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Nl.isDisabled&&Nl.supportsFiber))try{xs=Nl.inject(pE),Xt=Nl}catch{}var Nl;gu.createRoot=function(t,e){if(!wv(t))throw Error(D(299));var n=!1,r="",o=Jw,a=$w,i=Zw;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onUncaughtError!==void 0&&(o=e.onUncaughtError),e.onCaughtError!==void 0&&(a=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=eS(t,1,!1,null,null,n,r,null,o,a,i,iS),t[Ti]=e.current,Xh(t),new Zh(e)};gu.hydrateRoot=function(t,e,n){if(!wv(t))throw Error(D(299));var r=!1,o="",a=Jw,i=$w,l=Zw,s=null;return n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(l=n.onRecoverableError),n.formState!==void 0&&(s=n.formState)),e=eS(t,1,!0,e,n??null,r,o,s,a,i,l,iS),e.context=tS(null),n=e.current,r=Kt(),r=lh(r),o=ao(r),o.callback=null,io(n,o,r),n=r,e.current.lanes=n,ys(e,n),Kn(e),t[Ti]=e.current,Xh(t),new xu(e)};gu.version="19.2.6"});var cS=An((QP,fS)=>{"use strict";function sS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(sS)}catch(t){console.error(t)}}sS(),fS.exports=lS()});var uS,dS=F(()=>{uS={outline:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},filled:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"currentColor",stroke:"none"}}});var Fi,Q,Re=F(()=>{Fi=J(bt(),1);dS();Q=(t,e,n,r)=>{let o=(0,Fi.forwardRef)(({color:a="currentColor",size:i=24,stroke:l=2,title:s,className:f,children:c,...u},d)=>(0,Fi.createElement)("svg",{ref:d,...uS[t],width:i,height:i,className:["tabler-icon",`tabler-icon-${e}`,f].join(" "),...t==="filled"?{fill:a}:{strokeWidth:l,stroke:a},...u},[s&&(0,Fi.createElement)("title",{key:"svg-title"},s),...r.map(([p,h])=>(0,Fi.createElement)(p,h)),...Array.isArray(c)?c:[c]]));return o.displayName=`${n}`,o}});var mE,yu,pS=F(()=>{Re();mE=[["path",{d:"M12 9v4",key:"svg-0"}],["path",{d:"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0",key:"svg-1"}],["path",{d:"M12 16h.01",key:"svg-2"}]],yu=Q("outline","alert-triangle","AlertTriangle",mE)});var hE,ex,mS=F(()=>{Re();hE=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 13l-6 6",key:"svg-1"}],["path",{d:"M6 13l6 6",key:"svg-2"}]],ex=Q("outline","arrow-down","ArrowDown",hE)});var xE,tx,hS=F(()=>{Re();xE=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 11l-6 -6",key:"svg-1"}],["path",{d:"M6 11l6 -6",key:"svg-2"}]],tx=Q("outline","arrow-up","ArrowUp",xE)});var gE,sa,xS=F(()=>{Re();gE=[["path",{d:"M6 9l6 6l6 -6",key:"svg-0"}]],sa=Q("outline","chevron-down","ChevronDown",gE)});var yE,nx,gS=F(()=>{Re();yE=[["path",{d:"M9 6l6 6l-6 6",key:"svg-0"}]],nx=Q("outline","chevron-right","ChevronRight",yE)});var bE,rx,yS=F(()=>{Re();bE=[["path",{d:"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666",key:"svg-0"}],["path",{d:"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",key:"svg-1"}]],rx=Q("outline","copy","Copy",bE)});var IE,Li,bS=F(()=>{Re();IE=[["path",{d:"M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0",key:"svg-0"}],["path",{d:"M4 6v6a8 3 0 0 0 16 0v-6",key:"svg-1"}],["path",{d:"M4 12v6a8 3 0 0 0 16 0v-6",key:"svg-2"}]],Li=Q("outline","database","Database",IE)});var vE,ox,IS=F(()=>{Re();vE=[["path",{d:"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2",key:"svg-0"}],["path",{d:"M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",key:"svg-1"}],["path",{d:"M14 4l0 4l-6 0l0 -4",key:"svg-2"}]],ox=Q("outline","device-floppy","DeviceFloppy",vE)});var wE,ax,vS=F(()=>{Re();wE=[["path",{d:"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",key:"svg-1"}]],ax=Q("outline","eye","Eye",wE)});var SE,ix,wS=F(()=>{Re();SE=[["path",{d:"M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}]],ix=Q("outline","filter","Filter",SE)});var kE,bu,SS=F(()=>{Re();kE=[["path",{d:"M12 11v8l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M9 7l1 0",key:"svg-1"}],["path",{d:"M14 7l1 0",key:"svg-2"}],["path",{d:"M19 7l1 0",key:"svg-3"}],["path",{d:"M4 7l1 0",key:"svg-4"}]],bu=Q("outline","fold-down","FoldDown",kE)});var CE,Iu,kS=F(()=>{Re();CE=[["path",{d:"M12 3v6l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M12 21v-6l3 3m-6 0l3 -3",key:"svg-1"}],["path",{d:"M4 12l1 0",key:"svg-2"}],["path",{d:"M9 12l1 0",key:"svg-3"}],["path",{d:"M14 12l1 0",key:"svg-4"}],["path",{d:"M19 12l1 0",key:"svg-5"}]],Iu=Q("outline","fold","Fold",CE)});var AE,lx,CS=F(()=>{Re();AE=[["path",{d:"M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2",key:"svg-0"}]],lx=Q("outline","folder-open","FolderOpen",AE)});var TE,sx,AS=F(()=>{Re();TE=[["path",{d:"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0",key:"svg-0"}],["path",{d:"M15 9h.01",key:"svg-1"}]],sx=Q("outline","key","Key",TE)});var ME,fx,TS=F(()=>{Re();ME=[["path",{d:"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6",key:"svg-0"}],["path",{d:"M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-1"}],["path",{d:"M8 11v-5a4 4 0 0 1 8 0",key:"svg-2"}]],fx=Q("outline","lock-open","LockOpen",ME)});var DE,cx,MS=F(()=>{Re();DE=[["path",{d:"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6",key:"svg-0"}],["path",{d:"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",key:"svg-1"}],["path",{d:"M8 11v-4a4 4 0 1 1 8 0v4",key:"svg-2"}]],cx=Q("outline","lock","Lock",DE)});var OE,ux,DS=F(()=>{Re();OE=[["path",{d:"M7 4v16l13 -8l-13 -8",key:"svg-0"}]],ux=Q("outline","player-play","PlayerPlay",OE)});var RE,dx,OS=F(()=>{Re();RE=[["path",{d:"M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10",key:"svg-0"}]],dx=Q("outline","player-stop","PlayerStop",RE)});var BE,px,RS=F(()=>{Re();BE=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M5 12l14 0",key:"svg-1"}]],px=Q("outline","plus","Plus",BE)});var EE,mx,BS=F(()=>{Re();EE=[["path",{d:"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-0"}],["path",{d:"M15.51 15.56a5 5 0 1 0 -3.51 1.44",key:"svg-1"}],["path",{d:"M18.832 17.86a9 9 0 1 0 -6.832 3.14",key:"svg-2"}],["path",{d:"M12 12v9",key:"svg-3"}]],mx=Q("outline","radar-2","Radar2",EE)});var FE,hx,ES=F(()=>{Re();FE=[["path",{d:"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}],["path",{d:"M21 21l-6 -6",key:"svg-1"}]],hx=Q("outline","search","Search",FE)});var LE,xx,FS=F(()=>{Re();LE=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M3 10h18",key:"svg-1"}],["path",{d:"M10 3v18",key:"svg-2"}]],xx=Q("outline","table","Table",LE)});var NE,fa,LS=F(()=>{Re();NE=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],fa=Q("outline","x","X",NE)});var Ar=F(()=>{pS();mS();hS();xS();gS();yS();bS();IS();vS();wS();SS();kS();CS();AS();TS();MS();DS();OS();RS();BS();ES();FS();LS();});var NS,qS,gx=F(()=>{NS=t=>{let e,n=new Set,r=(f,c)=>{let u=typeof f=="function"?f(e):f;if(!Object.is(u,e)){let d=e;e=c??(typeof u!="object"||u===null)?u:Object.assign({},e,u),n.forEach(p=>p(e,d))}},o=()=>e,l={setState:r,getState:o,getInitialState:()=>s,subscribe:f=>(n.add(f),()=>n.delete(f))},s=e=t(r,o,l);return l},qS=(t=>t?NS(t):NS)});function PE(t,e=qE){let n=Ts.default.useSyncExternalStore(t.subscribe,Ts.default.useCallback(()=>e(t.getState()),[t,e]),Ts.default.useCallback(()=>e(t.getInitialState()),[t,e]));return Ts.default.useDebugValue(n),n}var Ts,qE,PS,_S,zS=F(()=>{Ts=J(bt(),1);gx();qE=t=>t;PS=t=>{let e=qS(t),n=r=>PE(e,r);return Object.assign(n,e),n},_S=(t=>t?PS(t):PS)});var HS=F(()=>{gx();zS()});function GS(t,e,n,r){switch(t){case-2:return n<e;case-1:return r>=e&&n<e;case 0:return n<e&&r>e;case 1:return n<=e&&r>e;case 2:return r>e;case 4:return!0}}function Os(t,e,n,r){for(var o;t.from==t.to||(n<1?t.from>=e:t.from>e)||(n>-1?t.to<=e:t.to<e);){let i=!r&&t instanceof Yn&&t.index<0?null:t.parent;if(!i)return t;t=i}let a=r?0:Be.IgnoreOverlays;if(r)for(let i=t,l=i.parent;l;i=l,l=i.parent)i instanceof Yn&&i.index<0&&((o=l.enter(e,n,a))===null||o===void 0?void 0:o.from)!=i.from&&(t=l);for(;;){let i=t.enter(e,n,a);if(!i)return t;t=i}}function jS(t,e,n,r){let o=t.cursor(),a=[];if(!o.firstChild())return a;if(n!=null){for(let i=!1;!i;)if(i=o.type.is(n),!o.nextSibling())return a}for(;;){if(r!=null&&o.type.is(r))return a;if(o.type.is(e)&&a.push(o.node),!o.nextSibling())return r==null?a:[]}}function bx(t,e,n=e.length-1){for(let r=t;n>=0;r=r.parent){if(!r)return!1;if(!r.type.isAnonymous){if(e[n]&&e[n]!=r.name)return!1;n--}}return!0}function QS(t){if(!t.length)return null;let e=0,n=t[0];for(let a=1;a<t.length;a++){let i=t[a];(i.from>n.from||i.to<n.to)&&(n=i,e=a)}let r=n instanceof Yn&&n.index<0?null:n.parent,o=t.slice();return r?o[e]=r:o.splice(e,1),new vx(o,n)}function HE(t,e,n){let r=t.resolveInner(e,n),o=null;for(let a=r instanceof Yn?r:r.context.parent;a;a=a.parent)if(a.index<0){let i=a.parent;(o||(o=[r])).push(i.resolve(e,n)),a=i}else{let i=ca.get(a.tree);if(i&&i.overlay&&i.overlay[0].from<=e&&i.overlay[i.overlay.length-1].to>=e){let l=new Yn(i.tree,i.overlay[0].from+a.from,-1,a);(o||(o=[r])).push(Os(l,e,n,!1))}}return o?QS(o):r}function Sx(t){return t.children.some(e=>e instanceof bo||!e.type.isAnonymous||Sx(e))}function UE(t){var e;let{buffer:n,nodeSet:r,maxBufferLength:o=1024,reused:a=[],minRepeatType:i=r.types.length}=t,l=Array.isArray(n)?new yx(n,n.length):n,s=r.types,f=0,c=0;function u(v,w,S,k,M,C){let{id:_,start:L,end:A,size:T}=l,H=c,U=f;if(T<0)if(l.next(),T==-1){let Je=a[_];S.push(Je),k.push(L-v);return}else if(T==-3){f=_;return}else if(T==-4){c=_;return}else throw new RangeError(`Unrecognized record size: ${T}`);let de=s[_],ee,Me,Hn=L-v;if(A-L<=o&&(Me=b(l.pos-w,M))){let Je=new Uint16Array(Me.size-Me.skip),on=l.pos-Me.size,Un=Je.length;for(;l.pos>on;)Un=m(Me.start,Je,Un);ee=new bo(Je,A-Me.start,r),Hn=Me.start-v}else{let Je=l.pos-T;l.next();let on=[],Un=[],Ho=_>=i?_:-1,Ha=0,Hf=A;for(;l.pos>Je;)Ho>=0&&l.id==Ho&&l.size>=0?(l.end<=Hf-o&&(h(on,Un,L,Ha,l.end,Hf,Ho,H,U),Ha=on.length,Hf=l.end),l.next()):C>2500?d(L,Je,on,Un):u(L,Je,on,Un,Ho,C+1);if(Ho>=0&&Ha>0&&Ha<on.length&&h(on,Un,L,Ha,L,Hf,Ho,H,U),on.reverse(),Un.reverse(),Ho>-1&&Ha>0){let v0=p(de,U);ee=kx(de,on,Un,0,on.length,0,A-L,v0,v0)}else ee=y(de,on,Un,A-L,H-A,U)}S.push(ee),k.push(Hn)}function d(v,w,S,k){let M=[],C=0,_=-1;for(;l.pos>w;){let{id:L,start:A,end:T,size:H}=l;if(H>4)l.next();else{if(_>-1&&A<_)break;_<0&&(_=T-o),M.push(L,A,T),C++,l.next()}}if(C){let L=new Uint16Array(C*4),A=M[M.length-2];for(let T=M.length-3,H=0;T>=0;T-=3)L[H++]=M[T],L[H++]=M[T+1]-A,L[H++]=M[T+2]-A,L[H++]=H;S.push(new bo(L,M[2]-A,r)),k.push(A-v)}}function p(v,w){return(S,k,M)=>{let C=0,_=S.length-1,L,A;if(_>=0&&(L=S[_])instanceof Ue){if(!_&&L.type==v&&L.length==M)return L;(A=L.prop(X.lookAhead))&&(C=k[_]+L.length+A)}return y(v,S,k,M,C,w)}}function h(v,w,S,k,M,C,_,L,A){let T=[],H=[];for(;v.length>k;)T.push(v.pop()),H.push(w.pop()+S-M);v.push(y(r.types[_],T,H,C-M,L-C,A)),w.push(M-S)}function y(v,w,S,k,M,C,_){if(C){let L=[X.contextHash,C];_=_?[L].concat(_):[L]}if(M>25){let L=[X.lookAhead,M];_=_?[L].concat(_):[L]}return new Ue(v,w,S,k,_)}function b(v,w){let S=l.fork(),k=0,M=0,C=0,_=S.end-o,L={size:0,start:0,skip:0};e:for(let A=S.pos-v;S.pos>A;){let T=S.size;if(S.id==w&&T>=0){L.size=k,L.start=M,L.skip=C,C+=4,k+=4,S.next();continue}let H=S.pos-T;if(T<0||H<A||S.start<_)break;let U=S.id>=i?4:0,de=S.start;for(S.next();S.pos>H;){if(S.size<0)if(S.size==-3||S.size==-4)U+=4;else break e;else S.id>=i&&(U+=4);S.next()}M=de,k+=T,C+=U}return(w<0||k==v)&&(L.size=k,L.start=M,L.skip=C),L.size>4?L:void 0}function m(v,w,S){let{id:k,start:M,end:C,size:_}=l;if(l.next(),_>=0&&k<i){let L=S;if(_>4){let A=l.pos-(_-4);for(;l.pos>A;)S=m(v,w,S)}w[--S]=L,w[--S]=C-v,w[--S]=M-v,w[--S]=k}else _==-3?f=k:_==-4&&(c=k);return S}let g=[],x=[];for(;l.pos>0;)u(t.start||0,t.bufferStart||0,g,x,-1,0);let I=(e=t.length)!==null&&e!==void 0?e:g.length?x[0]+g[0].length:0;return new Ue(s[t.topID],g.reverse(),x.reverse(),I)}function wu(t,e){if(!t.isAnonymous||e instanceof bo||e.type!=t)return 1;let n=VS.get(e);if(n==null){n=1;for(let r of e.children){if(r.type!=t||!(r instanceof Ue)){n=1;break}n+=wu(t,r)}VS.set(e,n)}return n}function kx(t,e,n,r,o,a,i,l,s){let f=0;for(let h=r;h<o;h++)f+=wu(t,e[h]);let c=Math.ceil(f*1.5/8),u=[],d=[];function p(h,y,b,m,g){for(let x=b;x<m;){let I=x,v=y[x],w=wu(t,h[x]);for(x++;x<m;x++){let S=wu(t,h[x]);if(w+S>=c)break;w+=S}if(x==I+1){if(w>c){let S=h[I];p(S.children,S.positions,0,S.children.length,y[I]+g);continue}u.push(h[I])}else{let S=y[x-1]+h[x-1].length-v;u.push(kx(t,h,y,I,x,v,S,null,s))}d.push(v+g-a)}}return p(e,n,r,o,0),(l||s)(u,d,i)}var _E,Ms,X,ca,zE,mt,Ds,vu,US,Be,Ue,yx,bo,Su,Yn,Ix,Rs,vx,Bs,VS,ua,Ni,wx,y8,Es=F(()=>{_E=0,Ms=class{constructor(e,n){this.from=e,this.to=n}},X=class{constructor(e={}){this.id=_E++,this.perNode=!!e.perNode,this.deserialize=e.deserialize||(()=>{throw new Error("This node type doesn't define a deserialize function")}),this.combine=e.combine||null}add(e){if(this.perNode)throw new RangeError("Can't add per-node props to node types");return typeof e!="function"&&(e=mt.match(e)),n=>{let r=e(n);return r===void 0?null:[this,r]}}};X.closedBy=new X({deserialize:t=>t.split(" ")});X.openedBy=new X({deserialize:t=>t.split(" ")});X.group=new X({deserialize:t=>t.split(" ")});X.isolate=new X({deserialize:t=>{if(t&&t!="rtl"&&t!="ltr"&&t!="auto")throw new RangeError("Invalid value for isolate: "+t);return t||"auto"}});X.contextHash=new X({perNode:!0});X.lookAhead=new X({perNode:!0});X.mounted=new X({perNode:!0});ca=class{constructor(e,n,r,o=!1){this.tree=e,this.overlay=n,this.parser=r,this.bracketed=o}static get(e){return e&&e.props&&e.props[X.mounted.id]}},zE=Object.create(null),mt=class t{constructor(e,n,r,o=0){this.name=e,this.props=n,this.id=r,this.flags=o}static define(e){let n=e.props&&e.props.length?Object.create(null):zE,r=(e.top?1:0)|(e.skipped?2:0)|(e.error?4:0)|(e.name==null?8:0),o=new t(e.name||"",n,e.id,r);if(e.props){for(let a of e.props)if(Array.isArray(a)||(a=a(o)),a){if(a[0].perNode)throw new RangeError("Can't store a per-node prop on a node type");n[a[0].id]=a[1]}}return o}prop(e){return this.props[e.id]}get isTop(){return(this.flags&1)>0}get isSkipped(){return(this.flags&2)>0}get isError(){return(this.flags&4)>0}get isAnonymous(){return(this.flags&8)>0}is(e){if(typeof e=="string"){if(this.name==e)return!0;let n=this.prop(X.group);return n?n.indexOf(e)>-1:!1}return this.id==e}static match(e){let n=Object.create(null);for(let r in e)for(let o of r.split(" "))n[o]=e[r];return r=>{for(let o=r.prop(X.group),a=-1;a<(o?o.length:0);a++){let i=n[a<0?r.name:o[a]];if(i)return i}}}};mt.none=new mt("",Object.create(null),0,8);Ds=class t{constructor(e){this.types=e;for(let n=0;n<e.length;n++)if(e[n].id!=n)throw new RangeError("Node type ids should correspond to array positions when creating a node set")}extend(...e){let n=[];for(let r of this.types){let o=null;for(let a of e){let i=a(r);if(i){o||(o=Object.assign({},r.props));let l=i[1],s=i[0];s.combine&&s.id in o&&(l=s.combine(o[s.id],l)),o[s.id]=l}}n.push(o?new mt(r.name,o,r.id,r.flags):r)}return new t(n)}},vu=new WeakMap,US=new WeakMap;(function(t){t[t.ExcludeBuffers=1]="ExcludeBuffers",t[t.IncludeAnonymous=2]="IncludeAnonymous",t[t.IgnoreMounts=4]="IgnoreMounts",t[t.IgnoreOverlays=8]="IgnoreOverlays",t[t.EnterBracketed=16]="EnterBracketed"})(Be||(Be={}));Ue=class t{constructor(e,n,r,o,a){if(this.type=e,this.children=n,this.positions=r,this.length=o,this.props=null,a&&a.length){this.props=Object.create(null);for(let[i,l]of a)this.props[typeof i=="number"?i:i.id]=l}}toString(){let e=ca.get(this);if(e&&!e.overlay)return e.tree.toString();let n="";for(let r of this.children){let o=r.toString();o&&(n&&(n+=","),n+=o)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(n.length?"("+n+")":""):n}cursor(e=0){return new Bs(this.topNode,e)}cursorAt(e,n=0,r=0){let o=vu.get(this)||this.topNode,a=new Bs(o);return a.moveTo(e,n),vu.set(this,a._tree),a}get topNode(){return new Yn(this,0,0,null)}resolve(e,n=0){let r=Os(vu.get(this)||this.topNode,e,n,!1);return vu.set(this,r),r}resolveInner(e,n=0){let r=Os(US.get(this)||this.topNode,e,n,!0);return US.set(this,r),r}resolveStack(e,n=0){return HE(this,e,n)}iterate(e){let{enter:n,leave:r,from:o=0,to:a=this.length}=e,i=e.mode||0,l=(i&Be.IncludeAnonymous)>0;for(let s=this.cursor(i|Be.IncludeAnonymous);;){let f=!1;if(s.from<=a&&s.to>=o&&(!l&&s.type.isAnonymous||n(s)!==!1)){if(s.firstChild())continue;f=!0}for(;f&&r&&(l||!s.type.isAnonymous)&&r(s),!s.nextSibling();){if(!s.parent())return;f=!0}}}prop(e){return e.perNode?this.props?this.props[e.id]:void 0:this.type.prop(e)}get propValues(){let e=[];if(this.props)for(let n in this.props)e.push([+n,this.props[n]]);return e}balance(e={}){return this.children.length<=8?this:kx(mt.none,this.children,this.positions,0,this.children.length,0,this.length,(n,r,o)=>new t(this.type,n,r,o,this.propValues),e.makeTree||((n,r,o)=>new t(mt.none,n,r,o)))}static build(e){return UE(e)}};Ue.empty=new Ue(mt.none,[],[],0);yx=class t{constructor(e,n){this.buffer=e,this.index=n}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new t(this.buffer,this.index)}},bo=class t{constructor(e,n,r){this.buffer=e,this.length=n,this.set=r}get type(){return mt.none}toString(){let e=[];for(let n=0;n<this.buffer.length;)e.push(this.childString(n)),n=this.buffer[n+3];return e.join(",")}childString(e){let n=this.buffer[e],r=this.buffer[e+3],o=this.set.types[n],a=o.name;if(/\W/.test(a)&&!o.isError&&(a=JSON.stringify(a)),e+=4,r==e)return a;let i=[];for(;e<r;)i.push(this.childString(e)),e=this.buffer[e+3];return a+"("+i.join(",")+")"}findChild(e,n,r,o,a){let{buffer:i}=this,l=-1;for(let s=e;s!=n&&!(GS(a,o,i[s+1],i[s+2])&&(l=s,r>0));s=i[s+3]);return l}slice(e,n,r){let o=this.buffer,a=new Uint16Array(n-e),i=0;for(let l=e,s=0;l<n;){a[s++]=o[l++],a[s++]=o[l++]-r;let f=a[s++]=o[l++]-r;a[s++]=o[l++]-e,i=Math.max(i,f)}return new t(a,i,this.set)}};Su=class{cursor(e=0){return new Bs(this,e)}getChild(e,n=null,r=null){let o=jS(this,e,n,r);return o.length?o[0]:null}getChildren(e,n=null,r=null){return jS(this,e,n,r)}resolve(e,n=0){return Os(this,e,n,!1)}resolveInner(e,n=0){return Os(this,e,n,!0)}matchContext(e){return bx(this.parent,e)}enterUnfinishedNodesBefore(e){let n=this.childBefore(e),r=this;for(;n;){let o=n.lastChild;if(!o||o.to!=n.to)break;o.type.isError&&o.from==o.to?(r=n,n=o.prevSibling):n=o}return r}get node(){return this}get next(){return this.parent}},Yn=class t extends Su{constructor(e,n,r,o){super(),this._tree=e,this.from=n,this.index=r,this._parent=o}get type(){return this._tree.type}get name(){return this._tree.type.name}get to(){return this.from+this._tree.length}nextChild(e,n,r,o,a=0){for(let i=this;;){for(let{children:l,positions:s}=i._tree,f=n>0?l.length:-1;e!=f;e+=n){let c=l[e],u=s[e]+i.from,d;if(!(!(a&Be.EnterBracketed&&c instanceof Ue&&(d=ca.get(c))&&!d.overlay&&d.bracketed&&r>=u&&r<=u+c.length)&&!GS(o,r,u,u+c.length))){if(c instanceof bo){if(a&Be.ExcludeBuffers)continue;let p=c.findChild(0,c.buffer.length,n,r-u,o);if(p>-1)return new Rs(new Ix(i,c,e,u),null,p)}else if(a&Be.IncludeAnonymous||!c.type.isAnonymous||Sx(c)){let p;if(!(a&Be.IgnoreMounts)&&(p=ca.get(c))&&!p.overlay)return new t(p.tree,u,e,i);let h=new t(c,u,e,i);return a&Be.IncludeAnonymous||!h.type.isAnonymous?h:h.nextChild(n<0?c.children.length-1:0,n,r,o,a)}}}if(a&Be.IncludeAnonymous||!i.type.isAnonymous||(i.index>=0?e=i.index+n:e=n<0?-1:i._parent._tree.children.length,i=i._parent,!i))return null}}get firstChild(){return this.nextChild(0,1,0,4)}get lastChild(){return this.nextChild(this._tree.children.length-1,-1,0,4)}childAfter(e){return this.nextChild(0,1,e,2)}childBefore(e){return this.nextChild(this._tree.children.length-1,-1,e,-2)}prop(e){return this._tree.prop(e)}enter(e,n,r=0){let o;if(!(r&Be.IgnoreOverlays)&&(o=ca.get(this._tree))&&o.overlay){let a=e-this.from,i=r&Be.EnterBracketed&&o.bracketed;for(let{from:l,to:s}of o.overlay)if((n>0||i?l<=a:l<a)&&(n<0||i?s>=a:s>a))return new t(o.tree,o.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,e,n,r)}nextSignificantParent(){let e=this;for(;e.type.isAnonymous&&e._parent;)e=e._parent;return e}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index+1,1,0,4):null}get prevSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index-1,-1,0,4):null}get tree(){return this._tree}toTree(){return this._tree}toString(){return this._tree.toString()}};Ix=class{constructor(e,n,r,o){this.parent=e,this.buffer=n,this.index=r,this.start=o}},Rs=class t extends Su{get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}constructor(e,n,r){super(),this.context=e,this._parent=n,this.index=r,this.type=e.buffer.set.types[e.buffer.buffer[r]]}child(e,n,r){let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.context.start,r);return a<0?null:new t(this.context,this,a)}get firstChild(){return this.child(1,0,4)}get lastChild(){return this.child(-1,0,4)}childAfter(e){return this.child(1,e,2)}childBefore(e){return this.child(-1,e,-2)}prop(e){return this.type.prop(e)}enter(e,n,r=0){if(r&Be.ExcludeBuffers)return null;let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],n>0?1:-1,e-this.context.start,n);return a<0?null:new t(this.context,this,a)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(e){return this._parent?null:this.context.parent.nextChild(this.context.index+e,e,0,4)}get nextSibling(){let{buffer:e}=this.context,n=e.buffer[this.index+3];return n<(this._parent?e.buffer[this._parent.index+3]:e.buffer.length)?new t(this.context,this._parent,n):this.externalSibling(1)}get prevSibling(){let{buffer:e}=this.context,n=this._parent?this._parent.index+4:0;return this.index==n?this.externalSibling(-1):new t(this.context,this._parent,e.findChild(n,this.index,-1,0,4))}get tree(){return null}toTree(){let e=[],n=[],{buffer:r}=this.context,o=this.index+4,a=r.buffer[this.index+3];if(a>o){let i=r.buffer[this.index+1];e.push(r.slice(o,a,i)),n.push(0)}return new Ue(this.type,e,n,this.to-this.from)}toString(){return this.context.buffer.childString(this.index)}};vx=class{constructor(e,n){this.heads=e,this.node=n}get next(){return QS(this.heads)}};Bs=class{get name(){return this.type.name}constructor(e,n=0){if(this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,this.mode=n&~Be.EnterBracketed,e instanceof Yn)this.yieldNode(e);else{this._tree=e.context.parent,this.buffer=e.context;for(let r=e._parent;r;r=r._parent)this.stack.unshift(r.index);this.bufferNode=e,this.yieldBuf(e.index)}}yieldNode(e){return e?(this._tree=e,this.type=e.type,this.from=e.from,this.to=e.to,!0):!1}yieldBuf(e,n){this.index=e;let{start:r,buffer:o}=this.buffer;return this.type=n||o.set.types[o.buffer[e]],this.from=r+o.buffer[e+1],this.to=r+o.buffer[e+2],!0}yield(e){return e?e instanceof Yn?(this.buffer=null,this.yieldNode(e)):(this.buffer=e.context,this.yieldBuf(e.index,e.type)):!1}toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}enterChild(e,n,r){if(!this.buffer)return this.yield(this._tree.nextChild(e<0?this._tree._tree.children.length-1:0,e,n,r,this.mode));let{buffer:o}=this.buffer,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.buffer.start,r);return a<0?!1:(this.stack.push(this.index),this.yieldBuf(a))}firstChild(){return this.enterChild(1,0,4)}lastChild(){return this.enterChild(-1,0,4)}childAfter(e){return this.enterChild(1,e,2)}childBefore(e){return this.enterChild(-1,e,-2)}enter(e,n,r=this.mode){return this.buffer?r&Be.ExcludeBuffers?!1:this.enterChild(1,e,n):this.yield(this._tree.enter(e,n,r))}parent(){if(!this.buffer)return this.yieldNode(this.mode&Be.IncludeAnonymous?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let e=this.mode&Be.IncludeAnonymous?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(e)}sibling(e){if(!this.buffer)return this._tree._parent?this.yield(this._tree.index<0?null:this._tree._parent.nextChild(this._tree.index+e,e,0,4,this.mode)):!1;let{buffer:n}=this.buffer,r=this.stack.length-1;if(e<0){let o=r<0?0:this.stack[r]+4;if(this.index!=o)return this.yieldBuf(n.findChild(o,this.index,-1,0,4))}else{let o=n.buffer[this.index+3];if(o<(r<0?n.buffer.length:n.buffer[this.stack[r]+3]))return this.yieldBuf(o)}return r<0?this.yield(this.buffer.parent.nextChild(this.buffer.index+e,e,0,4,this.mode)):!1}nextSibling(){return this.sibling(1)}prevSibling(){return this.sibling(-1)}atLastNode(e){let n,r,{buffer:o}=this;if(o){if(e>0){if(this.index<o.buffer.buffer.length)return!1}else for(let a=0;a<this.index;a++)if(o.buffer.buffer[a+3]<this.index)return!1;({index:n,parent:r}=o)}else({index:n,_parent:r}=this._tree);for(;r;{index:n,_parent:r}=r)if(n>-1)for(let a=n+e,i=e<0?-1:r._tree.children.length;a!=i;a+=e){let l=r._tree.children[a];if(this.mode&Be.IncludeAnonymous||l instanceof bo||!l.type.isAnonymous||Sx(l))return!1}return!0}move(e,n){if(n&&this.enterChild(e,0,4))return!0;for(;;){if(this.sibling(e))return!0;if(this.atLastNode(e)||!this.parent())return!1}}next(e=!0){return this.move(1,e)}prev(e=!0){return this.move(-1,e)}moveTo(e,n=0){for(;(this.from==this.to||(n<1?this.from>=e:this.from>e)||(n>-1?this.to<=e:this.to<e))&&this.parent(););for(;this.enterChild(1,e,n););return this}get node(){if(!this.buffer)return this._tree;let e=this.bufferNode,n=null,r=0;if(e&&e.context==this.buffer)e:for(let o=this.index,a=this.stack.length;a>=0;){for(let i=e;i;i=i._parent)if(i.index==o){if(o==this.index)return i;n=i,r=a+1;break e}o=this.stack[--a]}for(let o=r;o<this.stack.length;o++)n=new Rs(this.buffer,n,this.stack[o]);return this.bufferNode=new Rs(this.buffer,n,this.index)}get tree(){return this.buffer?null:this._tree._tree}iterate(e,n){for(let r=0;;){let o=!1;if(this.type.isAnonymous||e(this)!==!1){if(this.firstChild()){r++;continue}this.type.isAnonymous||(o=!0)}for(;;){if(o&&n&&n(this),o=this.type.isAnonymous,!r)return;if(this.nextSibling())break;this.parent(),r--,o=!0}}}matchContext(e){if(!this.buffer)return bx(this.node.parent,e);let{buffer:n}=this.buffer,{types:r}=n.set;for(let o=e.length-1,a=this.stack.length-1;o>=0;a--){if(a<0)return bx(this._tree,e,o);let i=r[n.buffer[this.stack[a]]];if(!i.isAnonymous){if(e[o]&&e[o]!=i.name)return!1;o--}}return!0}};VS=new WeakMap;ua=class t{constructor(e,n,r,o,a=!1,i=!1){this.from=e,this.to=n,this.tree=r,this.offset=o,this.open=(a?1:0)|(i?2:0)}get openStart(){return(this.open&1)>0}get openEnd(){return(this.open&2)>0}static addTree(e,n=[],r=!1){let o=[new t(0,e.length,e,0,!1,r)];for(let a of n)a.to>e.length&&o.push(a);return o}static applyChanges(e,n,r=128){if(!n.length)return e;let o=[],a=1,i=e.length?e[0]:null;for(let l=0,s=0,f=0;;l++){let c=l<n.length?n[l]:null,u=c?c.fromA:1e9;if(u-s>=r)for(;i&&i.from<u;){let d=i;if(s>=d.from||u<=d.to||f){let p=Math.max(d.from,s)-f,h=Math.min(d.to,u)-f;d=p>=h?null:new t(p,h,d.tree,d.offset+f,l>0,!!c)}if(d&&o.push(d),i.to>u)break;i=a<e.length?e[a++]:null}if(!c)break;s=c.toA,f=c.toA-c.toB}return o}},Ni=class{startParse(e,n,r){return typeof e=="string"&&(e=new wx(e)),r=r?r.length?r.map(o=>new Ms(o.from,o.to)):[new Ms(0,0)]:[new Ms(0,e.length)],this.createParse(e,n||[],r)}parse(e,n,r){let o=this.startParse(e,n,r);for(;;){let a=o.advance();if(a)return a}}},wx=class{constructor(e){this.string=e}get length(){return this.string.length}chunk(e){return this.string.slice(e)}get lineChunks(){return!1}read(e,n){return this.string.slice(e,n)}},y8=new X({perNode:!0})});function jE(t){if(t<768)return!1;for(let e=0,n=Ax.length;;){let r=e+n>>1;if(t<Ax[r])n=r;else if(t>=YS[r])e=r+1;else return!0;if(e==n)return!1}}function XS(t){return t>=127462&&t<=127487}function JS(t,e,n=!0,r=!0){return(n?$S:VE)(t,e,r)}function $S(t,e,n){if(e==t.length)return e;e&&ZS(t.charCodeAt(e))&&ek(t.charCodeAt(e-1))&&e--;let r=Cx(t,e);for(e+=KS(r);e<t.length;){let o=Cx(t,e);if(r==WS||o==WS||n&&jE(o))e+=KS(o),r=o;else if(XS(o)){let a=0,i=e-2;for(;i>=0&&XS(Cx(t,i));)a++,i-=2;if(a%2==0)break;e+=2}else break}return e}function VE(t,e,n){for(;e>1;){let r=$S(t,e-2,n);if(r<e)return r;e--}return 0}function Cx(t,e){let n=t.charCodeAt(e);if(!ek(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return ZS(r)?(n-55296<<10)+(r-56320)+65536:n}function ZS(t){return t>=56320&&t<57344}function ek(t){return t>=55296&&t<56320}function KS(t){return t<65536?1:2}var Ax,YS,WS,tk=F(()=>{Ax=[],YS=[];(()=>{let t="lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map(e=>e?parseInt(e,36):1);for(let e=0,n=0;e<t.length;e++)(e%2?YS:Ax).push(n=n+t[e])})();WS=8205});function GE(t){let e=-1;for(let n of t)e+=n.length+1;return e}function Tu(t,e,n=0,r=1e9){for(let o=0,a=0,i=!0;a<t.length&&o<=r;a++){let l=t[a],s=o+l.length;s>=n&&(s>r&&(l=l.slice(0,r-o)),o<n&&(l=l.slice(n-o)),i?(e[e.length-1]+=l,i=!1):e.push(l)),o=s+1}return e}function nk(t,e,n){return Tu(t,[""],e,n)}function Hi(t,e,n){return e=Math.max(0,Math.min(t.length,e)),[e,Math.max(e,Math.min(t.length,n))]}function tt(t,e,n=!0,r=!0){return JS(t,e,n,r)}function QE(t){return t>=56320&&t<57344}function XE(t){return t>=55296&&t<56320}function Mr(t,e){let n=t.charCodeAt(e);if(!XE(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return QE(r)?(n-55296<<10)+(r-56320)+65536:n}function lk(t){return t<=65535?String.fromCharCode(t):(t-=65536,String.fromCharCode((t>>10)+55296,(t&1023)+56320))}function vo(t){return t<65536?1:2}function ht(t,e,n,r=!1){if(e==0&&n<=0)return;let o=t.length-2;o>=0&&n<=0&&n==t[o+1]?t[o]+=e:o>=0&&e==0&&t[o]==0?t[o+1]+=n:r?(t[o]+=e,t[o+1]+=n):t.push(e,n)}function Io(t,e,n){if(n.length==0)return;let r=e.length-2>>1;if(r<t.length)t[t.length-1]=t[t.length-1].append(n);else{for(;t.length<r;)t.push(ne.empty);t.push(n)}}function Ox(t,e,n){let r=t.inserted;for(let o=0,a=0,i=0;i<t.sections.length;){let l=t.sections[i++],s=t.sections[i++];if(s<0)o+=l,a+=l;else{let f=o,c=a,u=ne.empty;for(;f+=l,c+=s,s&&r&&(u=u.append(r[i-2>>1])),!(n||i==t.sections.length||t.sections[i+1]<0);)l=t.sections[i++],s=t.sections[i++];e(o,f,a,c,u),o=f,a=c}}}function Rx(t,e,n,r=!1){let o=[],a=r?[]:null,i=new xa(t),l=new xa(e);for(let s=-1;;){if(i.done&&l.len||l.done&&i.len)throw new Error("Mismatched change set lengths");if(i.ins==-1&&l.ins==-1){let f=Math.min(i.len,l.len);ht(o,f,-1),i.forward(f),l.forward(f)}else if(l.ins>=0&&(i.ins<0||s==i.i||i.off==0&&(l.len<i.len||l.len==i.len&&!n))){let f=l.len;for(ht(o,l.ins,-1);f;){let c=Math.min(i.len,f);i.ins>=0&&s<i.i&&i.len<=c&&(ht(o,0,i.ins),a&&Io(a,o,i.text),s=i.i),i.forward(c),f-=c}l.next()}else if(i.ins>=0){let f=0,c=i.len;for(;c;)if(l.ins==-1){let u=Math.min(c,l.len);f+=u,c-=u,l.forward(u)}else if(l.ins==0&&l.len<c)c-=l.len,l.next();else break;ht(o,f,s<i.i?i.ins:0),a&&s<i.i&&Io(a,o,i.text),s=i.i,i.forward(i.len-c)}else{if(i.done&&l.done)return a?kt.createSet(o,a):Tr.create(o);throw new Error("Mismatched change set lengths")}}}function sk(t,e,n=!1){let r=[],o=n?[]:null,a=new xa(t),i=new xa(e);for(let l=!1;;){if(a.done&&i.done)return o?kt.createSet(r,o):Tr.create(r);if(a.ins==0)ht(r,a.len,0,l),a.next();else if(i.len==0&&!i.done)ht(r,0,i.ins,l),o&&Io(o,r,i.text),i.next();else{if(a.done||i.done)throw new Error("Mismatched change set lengths");{let s=Math.min(a.len2,i.len),f=r.length;if(a.ins==-1){let c=i.ins==-1?-1:i.off?0:i.ins;ht(r,s,c,l),o&&c&&Io(o,r,i.text)}else i.ins==-1?(ht(r,a.off?0:a.len,s,l),o&&Io(o,r,a.textBit(s))):(ht(r,a.off?0:a.len,i.off?0:i.ins,l),o&&!i.off&&Io(o,r,i.text));l=(a.ins>s||i.ins>=0&&i.len>s)&&(l||r.length>f),a.forward2(s),i.forward(s)}}}}function fk(t,e){for(let n of t.ranges)if(n.to>e)throw new RangeError("Selection points outside of document")}function Ux(t,e){return t==e||t.length==e.length&&t.every((n,r)=>n===e[r])}function rk(t,e,n){if(t.length!=e.length)return!1;for(let r=0;r<t.length;r++)if(!n(t[r],e[r]))return!1;return!0}function Bx(t,e){let n=!1;for(let r of e)Ls(t,r)&1&&(n=!0);return n}function WE(t,e,n){let r=n.map(s=>t[s.id]),o=n.map(s=>s.type),a=r.filter(s=>!(s&1)),i=t[e.id]>>1;function l(s){let f=[];for(let c=0;c<r.length;c++){let u=Bu(s,r[c]);if(o[c]==2)for(let d of u)f.push(d);else f.push(u)}return e.combine(f)}return{create(s){for(let f of r)Ls(s,f);return s.values[i]=l(s),1},update(s,f){if(!Bx(s,a))return 0;let c=l(s);return e.compare(c,s.values[i])?0:(s.values[i]=c,1)},reconfigure(s,f){let c=Bx(s,r),u=f.config.facets[e.id],d=f.facet(e);if(u&&!c&&Ux(n,u))return s.values[i]=d,0;let p=l(s);return e.compare(p,d)?(s.values[i]=d,0):(s.values[i]=p,1)}}}function Fs(t){return e=>new Ou(e,t)}function KE(t,e,n){let r=[[],[],[],[],[]],o=new Map;function a(i,l){let s=o.get(i);if(s!=null){if(s<=l)return;let f=r[s].indexOf(i);f>-1&&r[s].splice(f,1),i instanceof Ns&&n.delete(i.compartment)}if(o.set(i,l),Array.isArray(i))for(let f of i)a(f,l);else if(i instanceof Ns){if(n.has(i.compartment))throw new RangeError("Duplicate use of compartment in extensions");let f=e.get(i.compartment)||i.inner;n.set(i.compartment,f),a(f,l)}else if(i instanceof Ou)a(i.inner,i.prec);else if(i instanceof xt)r[l].push(i),i.provides&&a(i.provides,l);else if(i instanceof _i)r[l].push(i),i.facet.extensions&&a(i.facet.extensions,pa.default);else{let f=i.extension;if(!f)throw new Error(`Unrecognized extension value in extension set (${i}).`);if(f==i)throw new Error(`Unrecognized extension value in extension set (${i}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);a(f,l)}}return a(t,pa.default),r.reduce((i,l)=>i.concat(l))}function Ls(t,e){if(e&1)return 2;let n=e>>1,r=t.status[n];if(r==4)throw new Error("Cyclic dependency between fields and/or facets");if(r&2)return r;t.status[n]=4;let o=t.computeSlot(t,t.config.dynamicSlots[n]);return t.status[n]=2|o}function Bu(t,e){return e&1?t.config.staticValues[e>>1]:t.values[e>>1]}function YE(t,e){let n=[];for(let r=0,o=0;;){let a,i;if(r<t.length&&(o==e.length||e[o]>=t[r]))a=t[r++],i=t[r++];else if(o<e.length)a=e[o++],i=e[o++];else return n;!n.length||n[n.length-1]<a?n.push(a,i):n[n.length-1]<i&&(n[n.length-1]=i)}}function xk(t,e,n){var r;let o,a,i;return n?(o=e.changes,a=kt.empty(e.changes.length),i=t.changes.compose(e.changes)):(o=e.changes.map(t.changes),a=t.changes.mapDesc(e.changes,!0),i=t.changes.compose(o)),{changes:i,selection:e.selection?e.selection.map(a):(r=t.selection)===null||r===void 0?void 0:r.map(o),effects:le.mapEffects(t.effects,o).concat(le.mapEffects(e.effects,a)),annotations:t.annotations.length?t.annotations.concat(e.annotations):e.annotations,scrollIntoView:t.scrollIntoView||e.scrollIntoView}}function Nx(t,e,n){let r=e.selection,o=zi(e.annotations);return e.userEvent&&(o=o.concat(Ye.userEvent.of(e.userEvent))),{changes:e.changes instanceof kt?e.changes:kt.of(e.changes||[],n,t.facet(uk)),selection:r&&(r instanceof B?r:B.single(r.anchor,r.head)),effects:zi(e.effects),annotations:o,scrollIntoView:!!e.scrollIntoView}}function gk(t,e,n){let r=Nx(t,e.length?e[0]:{},t.doc.length);e.length&&e[0].filter===!1&&(n=!1);for(let a=1;a<e.length;a++){e[a].filter===!1&&(n=!1);let i=!!e[a].sequential;r=xk(r,Nx(t,e[a],i?r.changes.newLength:t.doc.length),i)}let o=Ye.create(t,r.changes,r.selection,r.effects,r.annotations,r.scrollIntoView);return $E(n?JE(o):o)}function JE(t){let e=t.startState,n=!0;for(let o of e.facet(dk)){let a=o(t);if(a===!1){n=!1;break}Array.isArray(a)&&(n=n===!0?a:YE(n,a))}if(n!==!0){let o,a;if(n===!1)a=t.changes.invertedDesc,o=kt.empty(e.doc.length);else{let i=t.changes.filter(n);o=i.changes,a=i.filtered.mapDesc(i.changes).invertedDesc}t=Ye.create(e,o,t.selection&&t.selection.map(a),le.mapEffects(t.effects,a),t.annotations,t.scrollIntoView)}let r=e.facet(pk);for(let o=r.length-1;o>=0;o--){let a=r[o](t);a instanceof Ye?t=a:Array.isArray(a)&&a.length==1&&a[0]instanceof Ye?t=a[0]:t=gk(e,zi(a),!1)}return t}function $E(t){let e=t.startState,n=e.facet(mk),r=t;for(let o=n.length-1;o>=0;o--){let a=n[o](t);a&&Object.keys(a).length&&(r=xk(r,Nx(e,a,t.changes.newLength),!0))}return r==t?t:Ye.create(e,t.changes,t.selection,r.effects,r.annotations,r.scrollIntoView)}function zi(t){return t==null?ZE:Array.isArray(t)?t:[t]}function tF(t){if(qx)return qx.test(t);for(let e=0;e<t.length;e++){let n=t[e];if(/\w/.test(n)||n>"\x80"&&(n.toUpperCase()!=n.toLowerCase()||eF.test(n)))return!0}return!1}function nF(t){return e=>{if(!/\S/.test(e))return gn.Space;if(tF(e))return gn.Word;for(let n=0;n<t.length;n++)if(e.indexOf(t[n])>-1)return gn.Word;return gn.Other}}function wo(t,e,n={}){let r={};for(let o of t)for(let a of Object.keys(o)){let i=o[a],l=r[a];if(l===void 0)r[a]=i;else if(!(l===i||i===void 0))if(Object.hasOwnProperty.call(n,a))r[a]=n[a](l,i);else throw new Error("Config merge conflict for field "+a)}for(let o in e)r[o]===void 0&&(r[o]=e[o]);return r}function jx(t,e){return t==e||t.constructor==e.constructor&&t.eq(e)}function Px(t,e){return t.from-e.from||t.value.startSide-e.value.startSide}function qi(t){return t[t.length-1]}function rF(t){if(t.length>1)for(let e=t[0],n=1;n<t.length;n++){let r=t[n];if(Px(e,r)>0)return t.slice().sort(Px);e=r}return t}function ok(t,e,n){let r=new Map;for(let a of t)for(let i=0;i<a.chunk.length;i++)a.chunk[i].maxPoint<=0&&r.set(a.chunk[i],a.chunkPos[i]);let o=new Set;for(let a of e)for(let i=0;i<a.chunk.length;i++){let l=r.get(a.chunk[i]);l!=null&&(n?n.mapPos(l):l)==a.chunkPos[i]&&!n?.touchesRange(l,l+a.chunk[i].length)&&o.add(a.chunk[i])}return o}function Tx(t,e){for(let n=t[e];;){let r=(e<<1)+1;if(r>=t.length)break;let o=t[r];if(r+1<t.length&&o.compare(t[r+1])>=0&&(o=t[r+1],r++),n.compare(o)<0)break;t[r]=n,t[e]=o,e=r}}function ak(t,e,n,r,o,a){t.goto(e),n.goto(r);let i=r+o,l=r,s=r-e,f=!!a.boundChange;for(let c=!1;;){let u=t.to+s-n.to,d=u||t.endSide-n.endSide,p=d<0?t.to+s:n.to,h=Math.min(p,i);if(t.point||n.point?(t.point&&n.point&&jx(t.point,n.point)&&zx(t.activeForPoint(t.to),n.activeForPoint(n.to))||a.comparePoint(l,h,t.point,n.point),c=!1):(c&&(a.boundChange(l),c=!1),h>l&&!zx(t.active,n.active)&&a.compareRange(l,h,t.active,n.active),f&&h<i&&(u||t.openEnd(p)!=n.openEnd(p))&&(c=!0)),p>i)break;l=p,d<=0&&t.next(),d>=0&&n.next()}}function zx(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!=e[n]&&!jx(t[n],e[n]))return!1;return!0}function Cu(t,e){for(let n=e,r=t.length-1;n<r;n++)t[n]=t[n+1];t.pop()}function Au(t,e,n){for(let r=t.length-1;r>=e;r--)t[r+1]=t[r];t[e]=n}function ik(t,e){let n=-1,r=1e9;for(let o=0;o<e.length;o++)(e[o]-r||t[o].endSide-t[n].endSide)<0&&(n=o,r=e[o]);return n}function ga(t,e,n=t.length){let r=0;for(let o=0;o<n&&o<t.length;)t.charCodeAt(o)==9?(r+=e-r%e,o++):(r++,o=tt(t,o));return r}function yk(t,e,n,r){for(let o=0,a=0;;){if(a>=e)return o;if(o==t.length)break;a+=t.charCodeAt(o)==9?n-a%n:1,o=tt(t,o)}return r===!0?-1:t.length}var ne,$t,Pi,ha,Mu,Du,Mx,Dx,St,Tr,kt,xa,da,B,Hx,z,_i,ku,xt,pa,On,Ou,Ui,Ns,Ru,ck,Ex,uk,dk,pk,mk,hk,Nt,Fx,Lx,le,Ye,ZE,gn,eF,qx,Ee,yn,qs,_x,ce,Jn,Eu,Ps,ma,ji=F(()=>{tk();ne=class t{lineAt(e){if(e<0||e>this.length)throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);return this.lineInner(e,!1,1,0)}line(e){if(e<1||e>this.lines)throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);return this.lineInner(e,!0,1,0)}replace(e,n,r){[e,n]=Hi(this,e,n);let o=[];return this.decompose(0,e,o,2),r.length&&r.decompose(0,r.length,o,3),this.decompose(n,this.length,o,1),Pi.from(o,this.length-(n-e)+r.length)}append(e){return this.replace(this.length,this.length,e)}slice(e,n=this.length){[e,n]=Hi(this,e,n);let r=[];return this.decompose(e,n,r,0),Pi.from(r,n-e)}eq(e){if(e==this)return!0;if(e.length!=this.length||e.lines!=this.lines)return!1;let n=this.scanIdentical(e,1),r=this.length-this.scanIdentical(e,-1),o=new ha(this),a=new ha(e);for(let i=n,l=n;;){if(o.next(i),a.next(i),i=0,o.lineBreak!=a.lineBreak||o.done!=a.done||o.value!=a.value)return!1;if(l+=o.value.length,o.done||l>=r)return!0}}iter(e=1){return new ha(this,e)}iterRange(e,n=this.length){return new Mu(this,e,n)}iterLines(e,n){let r;if(e==null)r=this.iter();else{n==null&&(n=this.lines+1);let o=this.line(e).from;r=this.iterRange(o,Math.max(o,n==this.lines+1?this.length:n<=1?0:this.line(n-1).to))}return new Du(r)}toString(){return this.sliceString(0)}toJSON(){let e=[];return this.flatten(e),e}constructor(){}static of(e){if(e.length==0)throw new RangeError("A document must have at least one line");return e.length==1&&!e[0]?t.empty:e.length<=32?new $t(e):Pi.from($t.split(e,[]))}},$t=class t extends ne{constructor(e,n=GE(e)){super(),this.text=e,this.length=n}get lines(){return this.text.length}get children(){return null}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.text[a],l=o+i.length;if((n?r:l)>=e)return new Mx(o,l,r,i);o=l+1,r++}}decompose(e,n,r,o){let a=e<=0&&n>=this.length?this:new t(nk(this.text,e,n),Math.min(n,this.length)-Math.max(0,e));if(o&1){let i=r.pop(),l=Tu(a.text,i.text.slice(),0,a.length);if(l.length<=32)r.push(new t(l,i.length+a.length));else{let s=l.length>>1;r.push(new t(l.slice(0,s)),new t(l.slice(s)))}}else r.push(a)}replace(e,n,r){if(!(r instanceof t))return super.replace(e,n,r);[e,n]=Hi(this,e,n);let o=Tu(this.text,Tu(r.text,nk(this.text,0,e)),n),a=this.length+r.length-(n-e);return o.length<=32?new t(o,a):Pi.from(t.split(o,[]),a)}sliceString(e,n=this.length,r=`
`){[e,n]=Hi(this,e,n);let o="";for(let a=0,i=0;a<=n&&i<this.text.length;i++){let l=this.text[i],s=a+l.length;a>e&&i&&(o+=r),e<s&&n>a&&(o+=l.slice(Math.max(0,e-a),n-a)),a=s+1}return o}flatten(e){for(let n of this.text)e.push(n)}scanIdentical(){return 0}static split(e,n){let r=[],o=-1;for(let a of e)r.push(a),o+=a.length+1,r.length==32&&(n.push(new t(r,o)),r=[],o=-1);return o>-1&&n.push(new t(r,o)),n}},Pi=class t extends ne{constructor(e,n){super(),this.children=e,this.length=n,this.lines=0;for(let r of e)this.lines+=r.lines}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.children[a],l=o+i.length,s=r+i.lines-1;if((n?s:l)>=e)return i.lineInner(e,n,r,o);o=l+1,r=s+1}}decompose(e,n,r,o){for(let a=0,i=0;i<=n&&a<this.children.length;a++){let l=this.children[a],s=i+l.length;if(e<=s&&n>=i){let f=o&((i<=e?1:0)|(s>=n?2:0));i>=e&&s<=n&&!f?r.push(l):l.decompose(e-i,n-i,r,f)}i=s+1}}replace(e,n,r){if([e,n]=Hi(this,e,n),r.lines<this.lines)for(let o=0,a=0;o<this.children.length;o++){let i=this.children[o],l=a+i.length;if(e>=a&&n<=l){let s=i.replace(e-a,n-a,r),f=this.lines-i.lines+s.lines;if(s.lines<f>>4&&s.lines>f>>6){let c=this.children.slice();return c[o]=s,new t(c,this.length-(n-e)+r.length)}return super.replace(a,l,s)}a=l+1}return super.replace(e,n,r)}sliceString(e,n=this.length,r=`
`){[e,n]=Hi(this,e,n);let o="";for(let a=0,i=0;a<this.children.length&&i<=n;a++){let l=this.children[a],s=i+l.length;i>e&&a&&(o+=r),e<s&&n>i&&(o+=l.sliceString(e-i,n-i,r)),i=s+1}return o}flatten(e){for(let n of this.children)n.flatten(e)}scanIdentical(e,n){if(!(e instanceof t))return 0;let r=0,[o,a,i,l]=n>0?[0,0,this.children.length,e.children.length]:[this.children.length-1,e.children.length-1,-1,-1];for(;;o+=n,a+=n){if(o==i||a==l)return r;let s=this.children[o],f=e.children[a];if(s!=f)return r+s.scanIdentical(f,n);r+=s.length+1}}static from(e,n=e.reduce((r,o)=>r+o.length+1,-1)){let r=0;for(let p of e)r+=p.lines;if(r<32){let p=[];for(let h of e)h.flatten(p);return new $t(p,n)}let o=Math.max(32,r>>5),a=o<<1,i=o>>1,l=[],s=0,f=-1,c=[];function u(p){let h;if(p.lines>a&&p instanceof t)for(let y of p.children)u(y);else p.lines>i&&(s>i||!s)?(d(),l.push(p)):p instanceof $t&&s&&(h=c[c.length-1])instanceof $t&&p.lines+h.lines<=32?(s+=p.lines,f+=p.length+1,c[c.length-1]=new $t(h.text.concat(p.text),h.length+1+p.length)):(s+p.lines>o&&d(),s+=p.lines,f+=p.length+1,c.push(p))}function d(){s!=0&&(l.push(c.length==1?c[0]:t.from(c,f)),f=-1,s=c.length=0)}for(let p of e)u(p);return d(),l.length==1?l[0]:new t(l,n)}};ne.empty=new $t([""],0);ha=class{constructor(e,n=1){this.dir=n,this.done=!1,this.lineBreak=!1,this.value="",this.nodes=[e],this.offsets=[n>0?1:(e instanceof $t?e.text.length:e.children.length)<<1]}nextInner(e,n){for(this.done=this.lineBreak=!1;;){let r=this.nodes.length-1,o=this.nodes[r],a=this.offsets[r],i=a>>1,l=o instanceof $t?o.text.length:o.children.length;if(i==(n>0?l:0)){if(r==0)return this.done=!0,this.value="",this;n>0&&this.offsets[r-1]++,this.nodes.pop(),this.offsets.pop()}else if((a&1)==(n>0?0:1)){if(this.offsets[r]+=n,e==0)return this.lineBreak=!0,this.value=`
`,this;e--}else if(o instanceof $t){let s=o.text[i+(n<0?-1:0)];if(this.offsets[r]+=n,s.length>Math.max(0,e))return this.value=e==0?s:n>0?s.slice(e):s.slice(0,s.length-e),this;e-=s.length}else{let s=o.children[i+(n<0?-1:0)];e>s.length?(e-=s.length,this.offsets[r]+=n):(n<0&&this.offsets[r]--,this.nodes.push(s),this.offsets.push(n>0?1:(s instanceof $t?s.text.length:s.children.length)<<1))}}}next(e=0){return e<0&&(this.nextInner(-e,-this.dir),e=this.value.length),this.nextInner(e,this.dir)}},Mu=class{constructor(e,n,r){this.value="",this.done=!1,this.cursor=new ha(e,n>r?-1:1),this.pos=n>r?e.length:0,this.from=Math.min(n,r),this.to=Math.max(n,r)}nextInner(e,n){if(n<0?this.pos<=this.from:this.pos>=this.to)return this.value="",this.done=!0,this;e+=Math.max(0,n<0?this.pos-this.to:this.from-this.pos);let r=n<0?this.pos-this.from:this.to-this.pos;e>r&&(e=r),r-=e;let{value:o}=this.cursor.next(e);return this.pos+=(o.length+e)*n,this.value=o.length<=r?o:n<0?o.slice(o.length-r):o.slice(0,r),this.done=!this.value,this}next(e=0){return e<0?e=Math.max(e,this.from-this.pos):e>0&&(e=Math.min(e,this.to-this.pos)),this.nextInner(e,this.cursor.dir)}get lineBreak(){return this.cursor.lineBreak&&this.value!=""}},Du=class{constructor(e){this.inner=e,this.afterBreak=!0,this.value="",this.done=!1}next(e=0){let{done:n,lineBreak:r,value:o}=this.inner.next(e);return n&&this.afterBreak?(this.value="",this.afterBreak=!1):n?(this.done=!0,this.value=""):r?this.afterBreak?this.value="":(this.afterBreak=!0,this.next()):(this.value=o,this.afterBreak=!1),this}get lineBreak(){return!1}};typeof Symbol<"u"&&(ne.prototype[Symbol.iterator]=function(){return this.iter()},ha.prototype[Symbol.iterator]=Mu.prototype[Symbol.iterator]=Du.prototype[Symbol.iterator]=function(){return this});Mx=class{constructor(e,n,r,o){this.from=e,this.to=n,this.number=r,this.text=o}get length(){return this.to-this.from}};Dx=/\r\n?|\n/,St=(function(t){return t[t.Simple=0]="Simple",t[t.TrackDel=1]="TrackDel",t[t.TrackBefore=2]="TrackBefore",t[t.TrackAfter=3]="TrackAfter",t})(St||(St={})),Tr=class t{constructor(e){this.sections=e}get length(){let e=0;for(let n=0;n<this.sections.length;n+=2)e+=this.sections[n];return e}get newLength(){let e=0;for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n+1];e+=r<0?this.sections[n]:r}return e}get empty(){return this.sections.length==0||this.sections.length==2&&this.sections[1]<0}iterGaps(e){for(let n=0,r=0,o=0;n<this.sections.length;){let a=this.sections[n++],i=this.sections[n++];i<0?(e(r,o,a),o+=a):o+=i,r+=a}}iterChangedRanges(e,n=!1){Ox(this,e,n)}get invertedDesc(){let e=[];for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];o<0?e.push(r,o):e.push(o,r)}return new t(e)}composeDesc(e){return this.empty?e:e.empty?this:sk(this,e)}mapDesc(e,n=!1){return e.empty?this:Rx(this,e,n)}mapPos(e,n=-1,r=St.Simple){let o=0,a=0;for(let i=0;i<this.sections.length;){let l=this.sections[i++],s=this.sections[i++],f=o+l;if(s<0){if(f>e)return a+(e-o);a+=l}else{if(r!=St.Simple&&f>=e&&(r==St.TrackDel&&o<e&&f>e||r==St.TrackBefore&&o<e||r==St.TrackAfter&&f>e))return null;if(f>e||f==e&&n<0&&!l)return e==o||n<0?a:a+s;a+=s}o=f}if(e>o)throw new RangeError(`Position ${e} is out of range for changeset of length ${o}`);return a}touchesRange(e,n=e){for(let r=0,o=0;r<this.sections.length&&o<=n;){let a=this.sections[r++],i=this.sections[r++],l=o+a;if(i>=0&&o<=n&&l>=e)return o<e&&l>n?"cover":!0;o=l}return!1}toString(){let e="";for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];e+=(e?" ":"")+r+(o>=0?":"+o:"")}return e}toJSON(){return this.sections}static fromJSON(e){if(!Array.isArray(e)||e.length%2||e.some(n=>typeof n!="number"))throw new RangeError("Invalid JSON representation of ChangeDesc");return new t(e)}static create(e){return new t(e)}},kt=class t extends Tr{constructor(e,n){super(e),this.inserted=n}apply(e){if(this.length!=e.length)throw new RangeError("Applying change set to a document with the wrong length");return Ox(this,(n,r,o,a,i)=>e=e.replace(o,o+(r-n),i),!1),e}mapDesc(e,n=!1){return Rx(this,e,n,!0)}invert(e){let n=this.sections.slice(),r=[];for(let o=0,a=0;o<n.length;o+=2){let i=n[o],l=n[o+1];if(l>=0){n[o]=l,n[o+1]=i;let s=o>>1;for(;r.length<s;)r.push(ne.empty);r.push(i?e.slice(a,a+i):ne.empty)}a+=i}return new t(n,r)}compose(e){return this.empty?e:e.empty?this:sk(this,e,!0)}map(e,n=!1){return e.empty?this:Rx(this,e,n,!0)}iterChanges(e,n=!1){Ox(this,e,n)}get desc(){return Tr.create(this.sections)}filter(e){let n=[],r=[],o=[],a=new xa(this);e:for(let i=0,l=0;;){let s=i==e.length?1e9:e[i++];for(;l<s||l==s&&a.len==0;){if(a.done)break e;let c=Math.min(a.len,s-l);ht(o,c,-1);let u=a.ins==-1?-1:a.off==0?a.ins:0;ht(n,c,u),u>0&&Io(r,n,a.text),a.forward(c),l+=c}let f=e[i++];for(;l<f;){if(a.done)break e;let c=Math.min(a.len,f-l);ht(n,c,-1),ht(o,c,a.ins==-1?-1:a.off==0?a.ins:0),a.forward(c),l+=c}}return{changes:new t(n,r),filtered:Tr.create(o)}}toJSON(){let e=[];for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n],o=this.sections[n+1];o<0?e.push(r):o==0?e.push([r]):e.push([r].concat(this.inserted[n>>1].toJSON()))}return e}static of(e,n,r){let o=[],a=[],i=0,l=null;function s(c=!1){if(!c&&!o.length)return;i<n&&ht(o,n-i,-1);let u=new t(o,a);l=l?l.compose(u.map(l)):u,o=[],a=[],i=0}function f(c){if(Array.isArray(c))for(let u of c)f(u);else if(c instanceof t){if(c.length!=n)throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${n})`);s(),l=l?l.compose(c.map(l)):c}else{let{from:u,to:d=u,insert:p}=c;if(u>d||u<0||d>n)throw new RangeError(`Invalid change range ${u} to ${d} (in doc of length ${n})`);let h=p?typeof p=="string"?ne.of(p.split(r||Dx)):p:ne.empty,y=h.length;if(u==d&&y==0)return;u<i&&s(),u>i&&ht(o,u-i,-1),ht(o,d-u,y),Io(a,o,h),i=d}}return f(e),s(!l),l}static empty(e){return new t(e?[e,-1]:[],[])}static fromJSON(e){if(!Array.isArray(e))throw new RangeError("Invalid JSON representation of ChangeSet");let n=[],r=[];for(let o=0;o<e.length;o++){let a=e[o];if(typeof a=="number")n.push(a,-1);else{if(!Array.isArray(a)||typeof a[0]!="number"||a.some((i,l)=>l&&typeof i!="string"))throw new RangeError("Invalid JSON representation of ChangeSet");if(a.length==1)n.push(a[0],0);else{for(;r.length<o;)r.push(ne.empty);r[o]=ne.of(a.slice(1)),n.push(a[0],r[o].length)}}}return new t(n,r)}static createSet(e,n){return new t(e,n)}};xa=class{constructor(e){this.set=e,this.i=0,this.next()}next(){let{sections:e}=this.set;this.i<e.length?(this.len=e[this.i++],this.ins=e[this.i++]):(this.len=0,this.ins=-2),this.off=0}get done(){return this.ins==-2}get len2(){return this.ins<0?this.len:this.ins}get text(){let{inserted:e}=this.set,n=this.i-2>>1;return n>=e.length?ne.empty:e[n]}textBit(e){let{inserted:n}=this.set,r=this.i-2>>1;return r>=n.length&&!e?ne.empty:n[r].slice(this.off,e==null?void 0:this.off+e)}forward(e){e==this.len?this.next():(this.len-=e,this.off+=e)}forward2(e){this.ins==-1?this.forward(e):e==this.ins?this.next():(this.ins-=e,this.off+=e)}},da=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.flags=r,this.goalColumn=o}get anchor(){return this.flags&32?this.to:this.from}get head(){return this.flags&32?this.from:this.to}get empty(){return this.from==this.to}get assoc(){return this.flags&8?-1:this.flags&16?1:0}get undirectional(){return(this.flags&64)>0}get bidiLevel(){let e=this.flags&7;return e==7?null:e}map(e,n=-1){let r,o;return this.empty?r=o=e.mapPos(this.from,n):(r=e.mapPos(this.from,1),o=e.mapPos(this.to,-1)),r==this.from&&o==this.to?this:new t(r,o,this.flags,this.goalColumn)}extend(e,n=e,r=0){if(e<=this.anchor&&n>=this.anchor)return B.range(e,n,void 0,void 0,r);let o=Math.abs(e-this.anchor)>Math.abs(n-this.anchor)?e:n;return B.range(this.anchor,o,void 0,void 0,r)}eq(e,n=!1){return this.anchor==e.anchor&&this.head==e.head&&this.goalColumn==e.goalColumn&&(!n||!this.empty||this.assoc==e.assoc)}toJSON(){return{anchor:this.anchor,head:this.head}}static fromJSON(e){if(!e||typeof e.anchor!="number"||typeof e.head!="number")throw new RangeError("Invalid JSON representation for SelectionRange");return B.range(e.anchor,e.head)}static create(e,n,r,o){return new t(e,n,r,o)}},B=class t{constructor(e,n){this.ranges=e,this.mainIndex=n}map(e,n=-1){return e.empty?this:t.create(this.ranges.map(r=>r.map(e,n)),this.mainIndex)}eq(e,n=!1){if(this.ranges.length!=e.ranges.length||this.mainIndex!=e.mainIndex)return!1;for(let r=0;r<this.ranges.length;r++)if(!this.ranges[r].eq(e.ranges[r],n))return!1;return!0}get main(){return this.ranges[this.mainIndex]}asSingle(){return this.ranges.length==1?this:new t([this.main],0)}addRange(e,n=!0){return t.create([e].concat(this.ranges),n?0:this.mainIndex+1)}replaceRange(e,n=this.mainIndex){let r=this.ranges.slice();return r[n]=e,t.create(r,this.mainIndex)}toJSON(){return{ranges:this.ranges.map(e=>e.toJSON()),main:this.mainIndex}}static fromJSON(e){if(!e||!Array.isArray(e.ranges)||typeof e.main!="number"||e.main>=e.ranges.length)throw new RangeError("Invalid JSON representation for EditorSelection");return new t(e.ranges.map(n=>da.fromJSON(n)),e.main)}static single(e,n=e){return new t([t.range(e,n)],0)}static create(e,n=0){if(e.length==0)throw new RangeError("A selection needs at least one range");for(let r=0,o=0;o<e.length;o++){let a=e[o];if(a.empty?a.from<=r:a.from<r)return t.normalized(e.slice(),n);r=a.to}return new t(e,n)}static cursor(e,n=0,r,o){return da.create(e,e,(n==0?0:n<0?8:16)|(r==null?7:Math.min(6,r)),o)}static range(e,n,r,o,a){let i=o==null?7:Math.min(6,o);return!a&&e!=n&&(a=n<e?1:-1),a&&(i|=a<0?8:16),n<e?da.create(n,e,i|32,r):da.create(e,n,i,r)}static undirectionalRange(e,n){return da.create(e,n,64,void 0)}static normalized(e,n=0){let r=e[n];e.sort((o,a)=>o.from-a.from),n=e.indexOf(r);for(let o=1;o<e.length;o++){let a=e[o],i=e[o-1];if(a.empty?a.from<=i.to:a.from<i.to){let l=i.from,s=Math.max(a.to,i.to);o<=n&&n--,e.splice(--o,2,a.anchor>a.head?t.range(s,l):t.range(l,s))}}return new t(e,n)}};Hx=0,z=class t{constructor(e,n,r,o,a){this.combine=e,this.compareInput=n,this.compare=r,this.isStatic=o,this.id=Hx++,this.default=e([]),this.extensions=typeof a=="function"?a(this):a}get reader(){return this}static define(e={}){return new t(e.combine||(n=>n),e.compareInput||((n,r)=>n===r),e.compare||(e.combine?(n,r)=>n===r:Ux),!!e.static,e.enables)}of(e){return new _i([],this,0,e)}compute(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new _i(e,this,1,n)}computeN(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new _i(e,this,2,n)}from(e,n){return n||(n=r=>r),this.compute([e],r=>n(r.field(e)))}};_i=class{constructor(e,n,r,o){this.dependencies=e,this.facet=n,this.type=r,this.value=o,this.id=Hx++}dynamicSlot(e){var n;let r=this.value,o=this.facet.compareInput,a=this.id,i=e[a]>>1,l=this.type==2,s=!1,f=!1,c=[];for(let u of this.dependencies)u=="doc"?s=!0:u=="selection"?f=!0:(((n=e[u.id])!==null&&n!==void 0?n:1)&1)==0&&c.push(e[u.id]);return{create(u){return u.values[i]=r(u),1},update(u,d){if(s&&d.docChanged||f&&(d.docChanged||d.selection)||Bx(u,c)){let p=r(u);if(l?!rk(p,u.values[i],o):!o(p,u.values[i]))return u.values[i]=p,1}return 0},reconfigure:(u,d)=>{let p,h=d.config.address[a];if(h!=null){let y=Bu(d,h);if(this.dependencies.every(b=>b instanceof z?d.facet(b)===u.facet(b):b instanceof xt?d.field(b,!1)==u.field(b,!1):!0)||(l?rk(p=r(u),y,o):o(p=r(u),y)))return u.values[i]=y,0}else p=r(u);return u.values[i]=p,1}}}get extension(){return this}};ku=z.define({static:!0}),xt=class t{constructor(e,n,r,o,a){this.id=e,this.createF=n,this.updateF=r,this.compareF=o,this.spec=a,this.provides=void 0}static define(e){let n=new t(Hx++,e.create,e.update,e.compare||((r,o)=>r===o),e);return e.provide&&(n.provides=e.provide(n)),n}create(e){let n=e.facet(ku).find(r=>r.field==this);return(n?.create||this.createF)(e)}slot(e){let n=e[this.id]>>1;return{create:r=>(r.values[n]=this.create(r),1),update:(r,o)=>{let a=r.values[n],i=this.updateF(a,o);return this.compareF(a,i)?0:(r.values[n]=i,1)},reconfigure:(r,o)=>{let a=r.facet(ku),i=o.facet(ku),l;return(l=a.find(s=>s.field==this))&&l!=i.find(s=>s.field==this)?(r.values[n]=l.create(r),1):o.config.address[this.id]!=null?(r.values[n]=o.field(this),0):(r.values[n]=this.create(r),1)}}}init(e){return[this,ku.of({field:this,create:e})]}get extension(){return this}},pa={lowest:4,low:3,default:2,high:1,highest:0};On={highest:Fs(pa.highest),high:Fs(pa.high),default:Fs(pa.default),low:Fs(pa.low),lowest:Fs(pa.lowest)},Ou=class{constructor(e,n){this.inner=e,this.prec=n}get extension(){return this}},Ui=class t{of(e){return new Ns(this,e)}reconfigure(e){return t.reconfigure.of({compartment:this,extension:e})}get(e){return e.config.compartments.get(this)}},Ns=class{constructor(e,n){this.compartment=e,this.inner=n}get extension(){return this}},Ru=class t{constructor(e,n,r,o,a,i){for(this.base=e,this.compartments=n,this.dynamicSlots=r,this.address=o,this.staticValues=a,this.facets=i,this.statusTemplate=[];this.statusTemplate.length<r.length;)this.statusTemplate.push(0)}staticFacet(e){let n=this.address[e.id];return n==null?e.default:this.staticValues[n>>1]}static resolve(e,n,r){let o=[],a=Object.create(null),i=new Map;for(let d of KE(e,n,i))d instanceof xt?o.push(d):(a[d.facet.id]||(a[d.facet.id]=[])).push(d);let l=Object.create(null),s=[],f=[];for(let d of o)l[d.id]=f.length<<1,f.push(p=>d.slot(p));let c=r?.config.facets;for(let d in a){let p=a[d],h=p[0].facet,y=c&&c[d]||[];if(p.every(b=>b.type==0))if(l[h.id]=s.length<<1|1,Ux(y,p))s.push(r.facet(h));else{let b=h.combine(p.map(m=>m.value));s.push(r&&h.compare(b,r.facet(h))?r.facet(h):b)}else{for(let b of p)b.type==0?(l[b.id]=s.length<<1|1,s.push(b.value)):(l[b.id]=f.length<<1,f.push(m=>b.dynamicSlot(m)));l[h.id]=f.length<<1,f.push(b=>WE(b,h,p))}}let u=f.map(d=>d(l));return new t(e,i,u,l,s,a)}};ck=z.define(),Ex=z.define({combine:t=>t.some(e=>e),static:!0}),uk=z.define({combine:t=>t.length?t[0]:void 0,static:!0}),dk=z.define(),pk=z.define(),mk=z.define(),hk=z.define({combine:t=>t.length?t[0]:!1}),Nt=class{constructor(e,n){this.type=e,this.value=n}static define(){return new Fx}},Fx=class{of(e){return new Nt(this,e)}},Lx=class{constructor(e){this.map=e}of(e){return new le(this,e)}},le=class t{constructor(e,n){this.type=e,this.value=n}map(e){let n=this.type.map(this.value,e);return n===void 0?void 0:n==this.value?this:new t(this.type,n)}is(e){return this.type==e}static define(e={}){return new Lx(e.map||(n=>n))}static mapEffects(e,n){if(!e.length)return e;let r=[];for(let o of e){let a=o.map(n);a&&r.push(a)}return r}};le.reconfigure=le.define();le.appendConfig=le.define();Ye=class t{constructor(e,n,r,o,a,i){this.startState=e,this.changes=n,this.selection=r,this.effects=o,this.annotations=a,this.scrollIntoView=i,this._doc=null,this._state=null,r&&fk(r,n.newLength),a.some(l=>l.type==t.time)||(this.annotations=a.concat(t.time.of(Date.now())))}static create(e,n,r,o,a,i){return new t(e,n,r,o,a,i)}get newDoc(){return this._doc||(this._doc=this.changes.apply(this.startState.doc))}get newSelection(){return this.selection||this.startState.selection.map(this.changes)}get state(){return this._state||this.startState.applyTransaction(this),this._state}annotation(e){for(let n of this.annotations)if(n.type==e)return n.value}get docChanged(){return!this.changes.empty}get reconfigured(){return this.startState.config!=this.state.config}isUserEvent(e){let n=this.annotation(t.userEvent);return!!(n&&(n==e||n.length>e.length&&n.slice(0,e.length)==e&&n[e.length]=="."))}};Ye.time=Nt.define();Ye.userEvent=Nt.define();Ye.addToHistory=Nt.define();Ye.remote=Nt.define();ZE=[];gn=(function(t){return t[t.Word=0]="Word",t[t.Space=1]="Space",t[t.Other=2]="Other",t})(gn||(gn={})),eF=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;try{qx=new RegExp("[\\p{Alphabetic}\\p{Number}_]","u")}catch{}Ee=class t{constructor(e,n,r,o,a,i){this.config=e,this.doc=n,this.selection=r,this.values=o,this.status=e.statusTemplate.slice(),this.computeSlot=a,i&&(i._state=this);for(let l=0;l<this.config.dynamicSlots.length;l++)Ls(this,l<<1);this.computeSlot=null}field(e,n=!0){let r=this.config.address[e.id];if(r==null){if(n)throw new RangeError("Field is not present in this state");return}return Ls(this,r),Bu(this,r)}update(...e){return gk(this,e,!0)}applyTransaction(e){let n=this.config,{base:r,compartments:o}=n;for(let l of e.effects)l.is(Ui.reconfigure)?(n&&(o=new Map,n.compartments.forEach((s,f)=>o.set(f,s)),n=null),o.set(l.value.compartment,l.value.extension)):l.is(le.reconfigure)?(n=null,r=l.value):l.is(le.appendConfig)&&(n=null,r=zi(r).concat(l.value));let a;n?a=e.startState.values.slice():(n=Ru.resolve(r,o,this),a=new t(n,this.doc,this.selection,n.dynamicSlots.map(()=>null),(s,f)=>f.reconfigure(s,this),null).values);let i=e.startState.facet(Ex)?e.newSelection:e.newSelection.asSingle();new t(n,e.newDoc,i,a,(l,s)=>s.update(l,e),e)}replaceSelection(e){return typeof e=="string"&&(e=this.toText(e)),this.changeByRange(n=>({changes:{from:n.from,to:n.to,insert:e},range:B.cursor(n.from+e.length,-1)}))}changeByRange(e){let n=this.selection,r=e(n.ranges[0]),o=this.changes(r.changes),a=[r.range],i=zi(r.effects);for(let l=1;l<n.ranges.length;l++){let s=e(n.ranges[l]),f=this.changes(s.changes),c=f.map(o);for(let d=0;d<l;d++)a[d]=a[d].map(c);let u=o.mapDesc(f,!0);a.push(s.range.map(u)),o=o.compose(c),i=le.mapEffects(i,c).concat(le.mapEffects(zi(s.effects),u))}return{changes:o,selection:B.create(a,n.mainIndex),effects:i}}changes(e=[]){return e instanceof kt?e:kt.of(e,this.doc.length,this.facet(t.lineSeparator))}toText(e){return ne.of(e.split(this.facet(t.lineSeparator)||Dx))}sliceDoc(e=0,n=this.doc.length){return this.doc.sliceString(e,n,this.lineBreak)}facet(e){let n=this.config.address[e.id];return n==null?e.default:(Ls(this,n),Bu(this,n))}toJSON(e){let n={doc:this.sliceDoc(),selection:this.selection.toJSON()};if(e)for(let r in e){let o=e[r];o instanceof xt&&this.config.address[o.id]!=null&&(n[r]=o.spec.toJSON(this.field(e[r]),this))}return n}static fromJSON(e,n={},r){if(!e||typeof e.doc!="string")throw new RangeError("Invalid JSON representation for EditorState");let o=[];if(r){for(let a in r)if(Object.prototype.hasOwnProperty.call(e,a)){let i=r[a],l=e[a];o.push(i.init(s=>i.spec.fromJSON(l,s)))}}return t.create({doc:e.doc,selection:B.fromJSON(e.selection),extensions:n.extensions?o.concat([n.extensions]):o})}static create(e={}){let n=Ru.resolve(e.extensions||[],new Map),r=e.doc instanceof ne?e.doc:ne.of((e.doc||"").split(n.staticFacet(t.lineSeparator)||Dx)),o=e.selection?e.selection instanceof B?e.selection:B.single(e.selection.anchor,e.selection.head):B.single(0);return fk(o,r.length),n.staticFacet(Ex)||(o=o.asSingle()),new t(n,r,o,n.dynamicSlots.map(()=>null),(a,i)=>i.create(a),null)}get tabSize(){return this.facet(t.tabSize)}get lineBreak(){return this.facet(t.lineSeparator)||`
`}get readOnly(){return this.facet(hk)}phrase(e,...n){for(let r of this.facet(t.phrases))if(Object.prototype.hasOwnProperty.call(r,e)){e=r[e];break}return n.length&&(e=e.replace(/\$(\$|\d*)/g,(r,o)=>{if(o=="$")return"$";let a=+(o||1);return!a||a>n.length?r:n[a-1]})),e}languageDataAt(e,n,r=-1){let o=[];for(let a of this.facet(ck))for(let i of a(this,n,r))Object.prototype.hasOwnProperty.call(i,e)&&o.push(i[e]);return o}charCategorizer(e){let n=this.languageDataAt("wordChars",e);return nF(n.length?n[0]:"")}wordAt(e){let{text:n,from:r,length:o}=this.doc.lineAt(e),a=this.charCategorizer(e),i=e-r,l=e-r;for(;i>0;){let s=tt(n,i,!1);if(a(n.slice(s,i))!=gn.Word)break;i=s}for(;l<o;){let s=tt(n,l);if(a(n.slice(l,s))!=gn.Word)break;l=s}return i==l?null:B.range(i+r,l+r)}};Ee.allowMultipleSelections=Ex;Ee.tabSize=z.define({combine:t=>t.length?t[0]:4});Ee.lineSeparator=uk;Ee.readOnly=hk;Ee.phrases=z.define({compare(t,e){let n=Object.keys(t),r=Object.keys(e);return n.length==r.length&&n.every(o=>t[o]==e[o])}});Ee.languageData=ck;Ee.changeFilter=dk;Ee.transactionFilter=pk;Ee.transactionExtender=mk;Ui.reconfigure=le.define();yn=class{eq(e){return this==e}range(e,n=e){return qs.create(e,n,this)}};yn.prototype.startSide=yn.prototype.endSide=0;yn.prototype.point=!1;yn.prototype.mapMode=St.TrackDel;qs=class t{constructor(e,n,r){this.from=e,this.to=n,this.value=r}static create(e,n,r){return new t(e,n,r)}};_x=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.value=r,this.maxPoint=o}get length(){return qi(this.to)}findIndex(e,n,r,o=0){let a=r?this.to:this.from;for(let i=o,l=a.length;;){if(i==l)return i;let s=i+l>>1,f=a[s]-e||(r?this.value[s].endSide:this.value[s].startSide)-n;if(s==i)return f>=0?i:l;f>=0?l=s:i=s+1}}between(e,n,r,o){for(let a=this.findIndex(n,-1e9,!0),i=this.findIndex(r,1e9,!1,a);a<i;a++)if(o(this.from[a]+e,this.to[a]+e,this.value[a])===!1)return!1}map(e,n,r,o,a){let i=[],l=[],s=[],f=-1,c=-1;e:for(let u=0;u<this.value.length;u++){let d=this.value[u],p=this.from[u]+e,h=this.to[u]+e,y,b;if(p==h){let m=n.mapPos(p,d.startSide,d.mapMode);if(m==null||(y=b=m,d.startSide!=d.endSide&&(b=n.mapPos(p,d.endSide),b<y)))continue}else if(y=n.mapPos(p,d.startSide),b=n.mapPos(h,d.endSide),y>b||y==b&&d.startSide>0&&d.endSide<=0)continue;if(!((b-y||d.endSide-d.startSide)<0))if(f<0&&(f=y),d.point&&(c=Math.max(c,b-y)),(y-r||d.startSide-o)>=0)i.push(d),l.push(y-f),s.push(b-f),r=b,o=d.endSide;else{if(y==b)for(let m=i.length;m>0;m--){if((y-(s[m-1]+f)||d.startSide-i[m-1].endSide)>=0){i.splice(m,0,d),l.splice(m,0,y-f),s.splice(m,0,b-f);continue e}if((y-(l[m-1]+f)||d.endSide-i[m-1].startSide)>0)break}a(y,b,d)}}return{mapped:i.length?new t(l,s,i,c):null,pos:f}}},ce=class t{constructor(e,n,r,o){this.chunkPos=e,this.chunk=n,this.nextLayer=r,this.maxPoint=o}static create(e,n,r,o){return new t(e,n,r,o)}get length(){let e=this.chunk.length-1;return e<0?0:Math.max(this.chunkEnd(e),this.nextLayer.length)}get size(){if(this.isEmpty)return 0;let e=this.nextLayer.size;for(let n of this.chunk)e+=n.value.length;return e}chunkEnd(e){return this.chunkPos[e]+this.chunk[e].length}update(e){let{add:n=[],sort:r=!1,filterFrom:o=0,filterTo:a=this.length}=e,i=e.filter;if(n.length==0&&!i)return this;if(r&&(n=n.slice().sort(Px)),this.isEmpty)return n.length?t.of(n):this;let l=new Eu(this,null,-1).goto(0),s=0,f=[],c=new Jn;for(;l.value||s<n.length;)if(s<n.length&&(l.from-n[s].from||l.startSide-n[s].value.startSide)>=0){let u=n[s++];c.addInner(u.from,u.to,u.value,!1)||f.push(u)}else l.rangeIndex==1&&l.chunkIndex<this.chunk.length&&(s==n.length||this.chunkEnd(l.chunkIndex)<n[s].from)&&(!i||o>this.chunkEnd(l.chunkIndex)||a<this.chunkPos[l.chunkIndex])&&c.addChunk(this.chunkPos[l.chunkIndex],this.chunk[l.chunkIndex])?l.nextChunk():((!i||o>l.to||a<l.from||i(l.from,l.to,l.value))&&(c.addInner(l.from,l.to,l.value,!1)||f.push(qs.create(l.from,l.to,l.value))),l.next());return c.finishInner(this.nextLayer.isEmpty&&!f.length?t.empty:this.nextLayer.update({add:f,filter:i,filterFrom:o,filterTo:a}))}map(e){if(e.empty||this.isEmpty)return this;let n=[],r=[],o=-1,a,i=(s,f,c)=>{a||(a=new Jn),a.addRange(s,f,c,!1)};for(let s=0;s<this.chunk.length;s++){let f=this.chunkPos[s],c=this.chunk[s],u=e.touchesRange(f,f+c.length);if(u===!1)o=Math.max(o,c.maxPoint),n.push(c),r.push(e.mapPos(f));else if(u===!0){let[d,p]=n.length?[qi(r)+qi(n).length,qi(qi(n).value).endSide]:[-1,-1],{mapped:h,pos:y}=c.map(f,e,d,p,i);h&&(o=Math.max(o,h.maxPoint),n.push(h),r.push(y))}}let l=this.nextLayer.map(e);return a&&(l=a.finishInner(l)),n.length==0?l:new t(r,n,l||t.empty,o)}between(e,n,r){if(!this.isEmpty){for(let o=0;o<this.chunk.length;o++){let a=this.chunkPos[o],i=this.chunk[o];if(n>=a&&e<=a+i.length&&i.between(a,e-a,n-a,r)===!1)return}this.nextLayer.between(e,n,r)}}iter(e=0){return Ps.from([this]).goto(e)}get isEmpty(){return this.nextLayer==this}static iter(e,n=0){return Ps.from(e).goto(n)}static compare(e,n,r,o,a=-1){let i=e.filter(u=>u.maxPoint>0||!u.isEmpty&&u.maxPoint>=a),l=n.filter(u=>u.maxPoint>0||!u.isEmpty&&u.maxPoint>=a),s=ok(i,l,r),f=new ma(i,s,a),c=new ma(l,s,a);r.iterGaps((u,d,p)=>ak(f,u,c,d,p,o)),r.empty&&r.length==0&&ak(f,0,c,0,0,o)}static eq(e,n,r=0,o){o==null&&(o=999999999);let a=e.filter(c=>!c.isEmpty&&n.indexOf(c)<0),i=n.filter(c=>!c.isEmpty&&e.indexOf(c)<0);if(a.length!=i.length)return!1;if(!a.length)return!0;let l=ok(a,i),s=new ma(a,l,0).goto(r),f=new ma(i,l,0).goto(r);for(;;){if(s.to!=f.to||!zx(s.active,f.active)||s.point&&(!f.point||!jx(s.point,f.point)))return!1;if(s.to>o)return!0;s.next(),f.next()}}static spans(e,n,r,o,a=-1){let i=new ma(e,null,a).goto(n),l=n,s=i.openStart;for(;;){let f=Math.min(i.to,r);if(i.point){let c=i.activeForPoint(i.to),u=i.pointFrom<n?c.length+1:i.point.startSide<0?c.length:Math.min(c.length,s);o.point(l,f,i.point,c,u,i.pointRank),s=Math.min(i.openEnd(f),c.length)}else f>l&&(o.span(l,f,i.active,s),s=i.openEnd(f));if(i.to>r)return s+(i.point&&i.to>r?1:0);l=i.to,i.next()}}static of(e,n=!1){let r=new Jn;for(let o of e instanceof qs?[e]:n?rF(e):e)r.add(o.from,o.to,o.value);return r.finish()}static join(e){if(!e.length)return t.empty;let n=qi(e);for(let r=e.length-2;r>=0;r--)for(let o=e[r];o!=t.empty;o=o.nextLayer)n=new t(o.chunkPos,o.chunk,n,Math.max(o.maxPoint,n.maxPoint));return n}};ce.empty=new ce([],[],null,-1);ce.empty.nextLayer=ce.empty;Jn=class t{finishChunk(e){this.chunks.push(new _x(this.from,this.to,this.value,this.maxPoint)),this.chunkPos.push(this.chunkStart),this.chunkStart=-1,this.setMaxPoint=Math.max(this.setMaxPoint,this.maxPoint),this.maxPoint=-1,e&&(this.from=[],this.to=[],this.value=[])}constructor(){this.chunks=[],this.chunkPos=[],this.chunkStart=-1,this.last=null,this.lastFrom=-1e9,this.lastTo=-1e9,this.from=[],this.to=[],this.value=[],this.maxPoint=-1,this.setMaxPoint=-1,this.nextLayer=null}add(e,n,r){this.addRange(e,n,r,!0)}addRange(e,n,r,o){this.addInner(e,n,r,o)||(this.nextLayer||(this.nextLayer=new t)).addRange(e,n,r,o)}addInner(e,n,r,o){let a=e-this.lastTo||r.startSide-this.last.endSide;if(o&&a<=0&&(e-this.lastFrom||r.startSide-this.last.startSide)<0)throw new Error("Ranges must be added sorted by `from` position and `startSide`");return a<0?!1:(this.from.length==250&&this.finishChunk(!0),this.chunkStart<0&&(this.chunkStart=e),this.from.push(e-this.chunkStart),this.to.push(n-this.chunkStart),this.last=r,this.lastFrom=e,this.lastTo=n,this.value.push(r),r.point&&(this.maxPoint=Math.max(this.maxPoint,n-e)),!0)}addChunk(e,n){if((e-this.lastTo||n.value[0].startSide-this.last.endSide)<0)return!1;this.from.length&&this.finishChunk(!0),this.setMaxPoint=Math.max(this.setMaxPoint,n.maxPoint),this.chunks.push(n),this.chunkPos.push(e);let r=n.value.length-1;return this.last=n.value[r],this.lastFrom=n.from[r]+e,this.lastTo=n.to[r]+e,!0}finish(){return this.finishInner(ce.empty)}finishInner(e){if(this.from.length&&this.finishChunk(!1),this.chunks.length==0)return e;let n=ce.create(this.chunkPos,this.chunks,this.nextLayer?this.nextLayer.finishInner(e):e,this.setMaxPoint);return this.from=null,n}};Eu=class{constructor(e,n,r,o=0){this.layer=e,this.skip=n,this.minPoint=r,this.rank=o}get startSide(){return this.value?this.value.startSide:0}get endSide(){return this.value?this.value.endSide:0}goto(e,n=-1e9){return this.chunkIndex=this.rangeIndex=0,this.gotoInner(e,n,!1),this}gotoInner(e,n,r){for(;this.chunkIndex<this.layer.chunk.length;){let o=this.layer.chunk[this.chunkIndex];if(!(this.skip&&this.skip.has(o)||this.layer.chunkEnd(this.chunkIndex)<e||o.maxPoint<this.minPoint))break;this.chunkIndex++,r=!1}if(this.chunkIndex<this.layer.chunk.length){let o=this.layer.chunk[this.chunkIndex].findIndex(e-this.layer.chunkPos[this.chunkIndex],n,!0);(!r||this.rangeIndex<o)&&this.setRangeIndex(o)}this.next()}forward(e,n){(this.to-e||this.endSide-n)<0&&this.gotoInner(e,n,!0)}next(){for(;;)if(this.chunkIndex==this.layer.chunk.length){this.from=this.to=1e9,this.value=null;break}else{let e=this.layer.chunkPos[this.chunkIndex],n=this.layer.chunk[this.chunkIndex],r=e+n.from[this.rangeIndex];if(this.from=r,this.to=e+n.to[this.rangeIndex],this.value=n.value[this.rangeIndex],this.setRangeIndex(this.rangeIndex+1),this.minPoint<0||this.value.point&&this.to-this.from>=this.minPoint)break}}setRangeIndex(e){if(e==this.layer.chunk[this.chunkIndex].value.length){if(this.chunkIndex++,this.skip)for(;this.chunkIndex<this.layer.chunk.length&&this.skip.has(this.layer.chunk[this.chunkIndex]);)this.chunkIndex++;this.rangeIndex=0}else this.rangeIndex=e}nextChunk(){this.chunkIndex++,this.rangeIndex=0,this.next()}compare(e){return this.from-e.from||this.startSide-e.startSide||this.rank-e.rank||this.to-e.to||this.endSide-e.endSide}},Ps=class t{constructor(e){this.heap=e}static from(e,n=null,r=-1){let o=[];for(let a=0;a<e.length;a++)for(let i=e[a];!i.isEmpty;i=i.nextLayer)i.maxPoint>=r&&o.push(new Eu(i,n,r,a));return o.length==1?o[0]:new t(o)}get startSide(){return this.value?this.value.startSide:0}goto(e,n=-1e9){for(let r of this.heap)r.goto(e,n);for(let r=this.heap.length>>1;r>=0;r--)Tx(this.heap,r);return this.next(),this}forward(e,n){for(let r of this.heap)r.forward(e,n);for(let r=this.heap.length>>1;r>=0;r--)Tx(this.heap,r);(this.to-e||this.value.endSide-n)<0&&this.next()}next(){if(this.heap.length==0)this.from=this.to=1e9,this.value=null,this.rank=-1;else{let e=this.heap[0];this.from=e.from,this.to=e.to,this.value=e.value,this.rank=e.rank,e.value&&e.next(),Tx(this.heap,0)}}};ma=class{constructor(e,n,r){this.minPoint=r,this.active=[],this.activeTo=[],this.activeRank=[],this.minActive=-1,this.point=null,this.pointFrom=0,this.pointRank=0,this.to=-1e9,this.endSide=0,this.openStart=-1,this.cursor=Ps.from(e,n,r)}goto(e,n=-1e9){return this.cursor.goto(e,n),this.active.length=this.activeTo.length=this.activeRank.length=0,this.minActive=-1,this.to=e,this.endSide=n,this.openStart=-1,this.next(),this}forward(e,n){for(;this.minActive>-1&&(this.activeTo[this.minActive]-e||this.active[this.minActive].endSide-n)<0;)this.removeActive(this.minActive);this.cursor.forward(e,n)}removeActive(e){Cu(this.active,e),Cu(this.activeTo,e),Cu(this.activeRank,e),this.minActive=ik(this.active,this.activeTo)}addActive(e){let n=0,{value:r,to:o,rank:a}=this.cursor;for(;n<this.activeRank.length&&(a-this.activeRank[n]||o-this.activeTo[n])>0;)n++;Au(this.active,n,r),Au(this.activeTo,n,o),Au(this.activeRank,n,a),e&&Au(e,n,this.cursor.from),this.minActive=ik(this.active,this.activeTo)}next(){let e=this.to,n=this.point;this.point=null;let r=this.openStart<0?[]:null;for(;;){let o=this.minActive;if(o>-1&&(this.activeTo[o]-this.cursor.from||this.active[o].endSide-this.cursor.startSide)<0){if(this.activeTo[o]>e){this.to=this.activeTo[o],this.endSide=this.active[o].endSide;break}this.removeActive(o),r&&Cu(r,o)}else if(this.cursor.value)if(this.cursor.from>e){this.to=this.cursor.from,this.endSide=this.cursor.startSide;break}else{let a=this.cursor.value;if(!a.point)this.addActive(r),this.cursor.next();else if(n&&this.cursor.to==this.to&&this.cursor.from<this.cursor.to)this.cursor.next();else{this.point=a,this.pointFrom=this.cursor.from,this.pointRank=this.cursor.rank,this.to=this.cursor.to,this.endSide=a.endSide,this.cursor.next(),this.forward(this.to,this.endSide);break}}else{this.to=this.endSide=1e9;break}}if(r){this.openStart=0;for(let o=r.length-1;o>=0&&r[o]<e;o--)this.openStart++}}activeForPoint(e){if(!this.active.length)return this.active;let n=[];for(let r=this.active.length-1;r>=0&&!(this.activeRank[r]<this.pointRank);r--)(this.activeTo[r]>e||this.activeTo[r]==e&&this.active[r].endSide>=this.point.endSide)&&n.push(this.active[r]);return n.reverse()}openEnd(e){let n=0;for(let r=this.activeTo.length-1;r>=0&&this.activeTo[r]>e;r--)n++;return n}}});var bk,Vx,Ik,bn,vk,Gx,Qx=F(()=>{bk=typeof Symbol>"u"?"__\u037C":Symbol.for("\u037C"),Vx=typeof Symbol>"u"?"__styleSet"+Math.floor(Math.random()*1e8):Symbol("styleSet"),Ik=typeof globalThis<"u"?globalThis:typeof window<"u"?window:{},bn=class{constructor(e,n){this.rules=[];let{finish:r}=n||{};function o(i){return/^@/.test(i)?[i]:i.split(/,\s*/)}function a(i,l,s,f){let c=[],u=/^@(\w+)\b/.exec(i[0]),d=u&&u[1]=="keyframes";if(u&&l==null)return s.push(i[0]+";");for(let p in l){let h=l[p];if(/&/.test(p))a(p.split(/,\s*/).map(y=>i.map(b=>y.replace(/&/,b))).reduce((y,b)=>y.concat(b)),h,s);else if(h&&typeof h=="object"){if(!u)throw new RangeError("The value of a property ("+p+") should be a primitive value.");a(o(p),h,c,d)}else h!=null&&c.push(p.replace(/_.*/,"").replace(/[A-Z]/g,y=>"-"+y.toLowerCase())+": "+h+";")}(c.length||d)&&s.push((r&&!u&&!f?i.map(r):i).join(", ")+" {"+c.join(" ")+"}")}for(let i in e)a(o(i),e[i],this.rules)}getRules(){return this.rules.join(`
`)}static newName(){let e=Ik[bk]||1;return Ik[bk]=e+1,"\u037C"+e.toString(36)}static mount(e,n,r){let o=e[Vx],a=r&&r.nonce;o?a&&o.setNonce(a):o=new Gx(e,a),o.mount(Array.isArray(n)?n:[n],e)}},vk=new Map,Gx=class{constructor(e,n){let r=e.ownerDocument||e,o=r.defaultView;if(!e.head&&e.adoptedStyleSheets&&o.CSSStyleSheet){let a=vk.get(r);if(a)return e[Vx]=a;this.sheet=new o.CSSStyleSheet,vk.set(r,this)}else this.styleTag=r.createElement("style"),n&&this.styleTag.setAttribute("nonce",n);this.modules=[],e[Vx]=this}mount(e,n){let r=this.sheet,o=0,a=0,i=!1;for(let l=0;l<e.length;l++){let s=e[l],f=this.modules.indexOf(s);if(f<a&&f>-1&&(this.modules.splice(f,1),i=!0,a--,f=-1),f==-1){if(this.modules.splice(a++,0,s),i=!0,r)for(let c=0;c<s.rules.length;c++)r.insertRule(s.rules[c],o++)}else{for(;a<f;)o+=this.modules[a++].rules.length;o+=s.rules.length,a++}}if(r)n.adoptedStyleSheets.indexOf(this.sheet)<0&&(n.adoptedStyleSheets=[this.sheet,...n.adoptedStyleSheets]);else{if(i){let s="";for(let f=0;f<this.modules.length;f++)s+=this.modules[f].getRules()+`
`;this.styleTag.textContent=s}let l=n.head||n;this.styleTag.parentNode!=l&&l.insertBefore(this.styleTag,l.firstChild)}}setNonce(e){this.styleTag&&this.styleTag.getAttribute("nonce")!=e&&this.styleTag.setAttribute("nonce",e)}}});function wk(t){var e=oF&&t.metaKey&&t.shiftKey&&!t.ctrlKey&&!t.altKey||aF&&t.shiftKey&&t.key&&t.key.length==1||t.key=="Unidentified",n=!e&&t.key||(t.shiftKey?Vi:Dr)[t.keyCode]||t.key||"Unidentified";return n=="Esc"&&(n="Escape"),n=="Del"&&(n="Delete"),n=="Left"&&(n="ArrowLeft"),n=="Up"&&(n="ArrowUp"),n=="Right"&&(n="ArrowRight"),n=="Down"&&(n="ArrowDown"),n}var Dr,Vi,oF,aF,Xe,Xe,Xe,Fu,Sk=F(()=>{Dr={8:"Backspace",9:"Tab",10:"Enter",12:"NumLock",13:"Enter",16:"Shift",17:"Control",18:"Alt",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",44:"PrintScreen",45:"Insert",46:"Delete",59:";",61:"=",91:"Meta",92:"Meta",106:"*",107:"+",108:",",109:"-",110:".",111:"/",144:"NumLock",145:"ScrollLock",160:"Shift",161:"Shift",162:"Control",163:"Control",164:"Alt",165:"Alt",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},Vi={48:")",49:"!",50:"@",51:"#",52:"$",53:"%",54:"^",55:"&",56:"*",57:"(",59:":",61:"+",173:"_",186:":",187:"+",188:"<",189:"_",190:">",191:"?",192:"~",219:"{",220:"|",221:"}",222:'"'},oF=typeof navigator<"u"&&/Mac/.test(navigator.platform),aF=typeof navigator<"u"&&/MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);for(Xe=0;Xe<10;Xe++)Dr[48+Xe]=Dr[96+Xe]=String(Xe);for(Xe=1;Xe<=24;Xe++)Dr[Xe+111]="F"+Xe;for(Xe=65;Xe<=90;Xe++)Dr[Xe]=String.fromCharCode(Xe+32),Vi[Xe]=String.fromCharCode(Xe);for(Fu in Dr)Vi.hasOwnProperty(Fu)||(Vi[Fu]=Dr[Fu])});var kk=F(()=>{});function Qg(t,e){for(let n in t)n=="class"&&e.class?e.class+=" "+t.class:n=="style"&&e.style?e.style+=";"+t.style:e[n]=t[n];return e}function Xg(t,e,n){if(t==e)return!0;t||(t=Gu),e||(e=Gu);let r=Object.keys(t),o=Object.keys(e);if(r.length-0!=o.length-0)return!1;for(let a of r)if(a!=n&&(o.indexOf(a)==-1||t[a]!==e[a]))return!1;return!0}function iF(t,e){for(let n=t.attributes.length-1;n>=0;n--){let r=t.attributes[n].name;e[r]==null&&t.removeAttribute(r)}for(let n in e){let r=e[n];n=="style"?t.style.cssText=r:t.getAttribute(n)!=r&&t.setAttribute(n,r)}}function Mk(t,e,n){let r=!1;if(e)for(let o in e)n&&o in n||(r=!0,o=="style"?t.style.cssText="":t.removeAttribute(o));if(n)for(let o in n)e&&e[o]==n[o]||(r=!0,o=="style"?t.style.cssText=n[o]:t.setAttribute(o,n[o]));return r}function lF(t){let e=Object.create(null);for(let n=0;n<t.attributes.length;n++){let r=t.attributes[n];e[r.name]=r.value}return e}function rC(t,e=!1){let{inclusiveStart:n,inclusiveEnd:r}=t;return n==null&&(n=t.inclusive),r==null&&(r=t.inclusive),{start:n??e,end:r??e}}function sF(t,e){return t==e||!!(t&&e&&t.compare(e))}function Ki(t,e,n,r=0){let o=n.length-1;o>=0&&n[o]+r>=t?n[o]=Math.max(n[o],e):n.push(t,e)}function $s(t){let e;return t.nodeType==11?e=t.getSelection?t:t.ownerDocument:e=t,e.getSelection()}function ag(t,e){return e?t==e||t.contains(e.nodeType!=1?e.parentNode:e):!1}function Hs(t,e){if(!e.anchorNode)return!1;try{return ag(t,e.anchorNode)}catch{return!1}}function Us(t){return Ji(t)?ef(t,0,t.nodeValue.length).getClientRects():nt(t)?t.getClientRects():[]}function js(t,e,n,r){return n?Dk(t,e,n,r,-1)||Dk(t,e,n,r,1):!1}function Co(t){for(var e=0;;e++)if(t=t.previousSibling,!t)return e}function Xu(t){return nt(t)&&/^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(t.nodeName)}function Dk(t,e,n,r,o){for(;;){if(t==n&&e==r)return!0;if(e==(o<0?0:Er(t))){if(t.nodeName=="DIV")return!1;let a=t.parentNode;if(!a||!nt(a))return!1;e=Co(t)+(o<0?0:1),t=a}else if(nt(t)){if(t=t.childNodes[e+(o<0?-1:0)],nt(t)&&(t.nodeName=="IMG"||t.nodeName=="BR"||t.contentEditable=="false"))return!1;e=o<0?Er(t):0}else return!1}}function Er(t){return Ji(t)?t.nodeValue.length:t.childNodes.length}function Zs(t,e){let{left:n,right:r}=t;if(n==r)return t;let o=e?n:r;return{left:o,right:o,top:t.top,bottom:t.bottom}}function fF(t){let e=t.visualViewport;return e?{left:0,right:e.width,top:0,bottom:e.height}:{left:0,right:t.innerWidth,top:0,bottom:t.innerHeight}}function oC(t,e){let n=e.width/t.offsetWidth,r=e.height/t.offsetHeight;return(n>.995&&n<1.005||!isFinite(n)||Math.abs(e.width-t.offsetWidth)<1)&&(n=1),(r>.995&&r<1.005||!isFinite(r)||Math.abs(e.height-t.offsetHeight)<1)&&(r=1),{scaleX:n,scaleY:r}}function cF(t,e,n,r,o,a,i,l){let s=t.ownerDocument,f=s.defaultView||window;for(let c=t,u=!1;c&&!u;)if(nt(c)){let d,p=c==s.body,h=1,y=1,b=!0,m=!0;if(p)d=fF(f);else{let I=getComputedStyle(c);if(/^(fixed|sticky)$/.test(I.position)&&(u=!0),(c.scrollHeight<=c.clientHeight||!/auto|scroll/.test(I.overflowY))&&(m=!1),(c.scrollWidth<=c.clientWidth||!/auto|scroll/.test(I.overflowX))&&(b=!1),!b&&!m){c=c.assignedSlot||c.parentNode;continue}let v=c.getBoundingClientRect();({scaleX:h,scaleY:y}=oC(c,v)),d={left:v.left,right:v.left+c.clientWidth*h,top:v.top,bottom:v.top+c.clientHeight*y}}let g=0,x=0;if(m)if(o=="nearest")e.top<d.top+i?(x=e.top-(d.top+i),n>0&&e.bottom>d.bottom+x&&(x=e.bottom-d.bottom+i)):e.bottom>d.bottom-i&&(x=e.bottom-d.bottom+i,n<0&&e.top-x<d.top&&(x=e.top-(d.top+i)));else{let I=e.bottom-e.top,v=d.bottom-d.top;x=(o=="center"&&I<=v?e.top+I/2-v/2:o=="start"||o=="center"&&n<0?e.top-i:e.bottom-v+i)-d.top}if(b&&(r=="nearest"?e.left<d.left+a?(g=e.left-(d.left+a),n>0&&e.right>d.right+g&&(g=e.right-d.right+a)):e.right>d.right-a&&(g=e.right-d.right+a,n<0&&e.left<d.left+g&&(g=e.left-(d.left+a))):g=(r=="center"?e.left+(e.right-e.left)/2-(d.right-d.left)/2:r=="start"==l?e.left-a:e.right-(d.right-d.left)+a)-d.left),g||x)if(p)f.scrollBy(g,x);else{let I=0,v=0;if(x){let w=c.scrollTop;c.scrollTop+=x/y,v=(c.scrollTop-w)*y}if(g){let w=c.scrollLeft;c.scrollLeft+=g/h,I=(c.scrollLeft-w)*h}e={left:e.left-I,top:e.top-v,right:e.right-I,bottom:e.bottom-v},I&&Math.abs(I-g)<1&&(r="nearest"),v&&Math.abs(v-x)<1&&(o="nearest")}if(p)break;(e.top<d.top||e.bottom>d.bottom||e.left<d.left||e.right>d.right)&&(e={left:Math.max(e.left,d.left),right:Math.min(e.right,d.right),top:Math.max(e.top,d.top),bottom:Math.min(e.bottom,d.bottom)}),c=c.assignedSlot||c.parentNode}else if(c.nodeType==11)c=c.host;else break}function aC(t,e=!0){let n=t.ownerDocument,r=null,o=null;for(let a=t.parentNode;a&&!(a==n.body||(!e||r)&&o);)if(nt(a))!o&&a.scrollHeight>a.clientHeight&&/scroll|auto/.test(getComputedStyle(a).overflowY)&&(o=a),e&&!r&&a.scrollWidth>a.clientWidth&&/scroll|auto/.test(getComputedStyle(a).overflowX)&&(r=a),a=a.assignedSlot||a.parentNode;else if(a.nodeType==11)a=a.host;else break;return{x:r,y:o}}function iC(t){let e=[];for(let n=t;n;n=n.nodeType==11?n.host:n.parentNode)nt(n)&&e.push({node:n,left:n.scrollLeft,top:n.scrollTop});return e}function lC(t,e=!0){for(let{node:n,left:r,top:o}of t)e&&n.scrollTop!=o&&(n.scrollTop=o),n.scrollLeft!=r&&(n.scrollLeft=r)}function sC(t){if(t.setActive)return t.setActive();if(ya)return t.focus(ya);let e=iC(t);t.focus(ya==null?{get preventScroll(){return ya={preventScroll:!0},!0}}:void 0),ya||(ya=!1,lC(e))}function ef(t,e,n=e){let r=Ok||(Ok=document.createRange());return r.setEnd(t,n),r.setStart(t,e),r}function Yi(t,e,n,r){let o={key:e,code:e,keyCode:n,which:n,cancelable:!0};r&&({altKey:o.altKey,ctrlKey:o.ctrlKey,shiftKey:o.shiftKey,metaKey:o.metaKey}=r);let a=new KeyboardEvent("keydown",o);a.synthetic=!0,t.dispatchEvent(a);let i=new KeyboardEvent("keyup",o);return i.synthetic=!0,t.dispatchEvent(i),a.defaultPrevented||i.defaultPrevented}function uF(t){for(;t;){if(t&&(t.nodeType==9||t.nodeType==11&&t.host))return t;t=t.assignedSlot||t.parentNode}return null}function dF(t,e){let n=e.focusNode,r=e.focusOffset;if(!n||e.anchorNode!=n||e.anchorOffset!=r)return!1;for(r=Math.min(r,Er(n));;)if(r){if(!nt(n))return!1;let o=n.childNodes[r-1];o.contentEditable=="false"?r--:(n=o,r=Er(n))}else{if(n==t)return!0;r=Co(n),n=n.parentNode}}function fC(t){return t instanceof Window?t.pageYOffset>Math.max(0,t.document.documentElement.scrollHeight-t.innerHeight-4):t.scrollTop>Math.max(1,t.scrollHeight-t.clientHeight-4)}function cC(t,e){for(let n=t,r=e;;){if(Ji(n)&&r>0)return{node:n,offset:r};if(nt(n)&&r>0){if(n.contentEditable=="false")return null;n=n.childNodes[r-1],r=Er(n)}else if(n.parentNode&&!Xu(n))r=Co(n),n=n.parentNode;else return null}}function uC(t,e){for(let n=t,r=e;;){if(Ji(n)&&r<n.nodeValue.length)return{node:n,offset:r};if(nt(n)&&r<n.childNodes.length){if(n.contentEditable=="false")return null;n=n.childNodes[r],r=0}else if(n.parentNode&&!Xu(n))r=Co(n)+1,n=n.parentNode;else return null}}function dC(t){let e=[];for(let n=0;n<t.length;n++)e.push(1<<+t[n]);return e}function pC(t){return t<=247?pF[t]:1424<=t&&t<=1524?2:1536<=t&&t<=1785?mF[t-1536]:1774<=t&&t<=2220?4:8192<=t&&t<=8204?256:64336<=t&&t<=65023?4:1}function mC(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++){let r=t[n],o=e[n];if(r.from!=o.from||r.to!=o.to||r.direction!=o.direction||!mC(r.inner,o.inner))return!1}return!0}function xF(t,e,n,r,o){for(let a=0;a<=r.length;a++){let i=a?r[a-1].to:e,l=a<r.length?r[a].from:n,s=a?256:o;for(let f=i,c=s,u=s;f<l;f++){let d=pC(t.charCodeAt(f));d==512?d=c:d==8&&u==4&&(d=16),xe[f]=d==4?2:d,d&7&&(u=d),c=d}for(let f=i,c=s,u=s;f<l;f++){let d=xe[f];if(d==128)f<l-1&&c==xe[f+1]&&c&24?d=xe[f]=c:xe[f]=256;else if(d==64){let p=f+1;for(;p<l&&xe[p]==64;)p++;let h=f&&c==8||p<n&&xe[p]==8?u==1?1:8:256;for(let y=f;y<p;y++)xe[y]=h;f=p-1}else d==8&&u==1&&(xe[f]=1);c=d,d&7&&(u=d)}}}function gF(t,e,n,r,o){let a=o==1?2:1;for(let i=0,l=0,s=0;i<=r.length;i++){let f=i?r[i-1].to:e,c=i<r.length?r[i].from:n;for(let u=f,d,p,h;u<c;u++)if(p=lg[d=t.charCodeAt(u)])if(p<0){for(let y=l-3;y>=0;y-=3)if($n[y+1]==-p){let b=$n[y+2],m=b&2?o:b&4?b&1?a:o:0;m&&(xe[u]=xe[$n[y]]=m),l=y;break}}else{if($n.length==189)break;$n[l++]=u,$n[l++]=d,$n[l++]=s}else if((h=xe[u])==2||h==1){let y=h==o;s=y?0:1;for(let b=l-3;b>=0;b-=3){let m=$n[b+2];if(m&2)break;if(y)$n[b+2]|=2;else{if(m&4)break;$n[b+2]|=4}}}}}function yF(t,e,n,r){for(let o=0,a=r;o<=n.length;o++){let i=o?n[o-1].to:t,l=o<n.length?n[o].from:e;for(let s=i;s<l;){let f=xe[s];if(f==256){let c=s+1;for(;;)if(c==l){if(o==n.length)break;c=n[o++].to,l=o<n.length?n[o].from:e}else if(xe[c]==256)c++;else break;let u=a==1,d=(c<e?xe[c]:r)==1,p=u==d?u?1:2:r;for(let h=c,y=o,b=y?n[y-1].to:t;h>s;)h==b&&(h=n[--y].from,b=y?n[y-1].to:t),xe[--h]=p;s=c}else a=f,s++}}}function sg(t,e,n,r,o,a,i){let l=r%2?2:1;if(r%2==o%2)for(let s=e,f=0;s<n;){let c=!0,u=!1;if(f==a.length||s<a[f].from){let y=xe[s];y!=l&&(c=!1,u=y==16)}let d=!c&&l==1?[]:null,p=c?r:r+1,h=s;e:for(;;)if(f<a.length&&h==a[f].from){if(u)break e;let y=a[f];if(!c)for(let b=y.to,m=f+1;;){if(b==n)break e;if(m<a.length&&a[m].from==b)b=a[m++].to;else{if(xe[b]==l)break e;break}}if(f++,d)d.push(y);else{y.from>s&&i.push(new wn(s,y.from,p));let b=y.direction==$i!=!(p%2);fg(t,b?r+1:r,o,y.inner,y.from,y.to,i),s=y.to}h=y.to}else{if(h==n||(c?xe[h]!=l:xe[h]==l))break;h++}d?sg(t,s,h,r+1,o,d,i):s<h&&i.push(new wn(s,h,p)),s=h}else for(let s=n,f=a.length;s>e;){let c=!0,u=!1;if(!f||s>a[f-1].to){let y=xe[s-1];y!=l&&(c=!1,u=y==16)}let d=!c&&l==1?[]:null,p=c?r:r+1,h=s;e:for(;;)if(f&&h==a[f-1].to){if(u)break e;let y=a[--f];if(!c)for(let b=y.from,m=f;;){if(b==e)break e;if(m&&a[m-1].to==b)b=a[--m].from;else{if(xe[b-1]==l)break e;break}}if(d)d.push(y);else{y.to<s&&i.push(new wn(y.to,s,p));let b=y.direction==$i!=!(p%2);fg(t,b?r+1:r,o,y.inner,y.from,y.to,i),s=y.from}h=y.from}else{if(h==e||(c?xe[h-1]!=l:xe[h-1]==l))break;h--}d?sg(t,h,s,r+1,o,d,i):h<s&&i.push(new wn(h,s,p)),s=h}}function fg(t,e,n,r,o,a,i){let l=e%2?2:1;xF(t,o,a,r,l),gF(t,o,a,r,l),yF(o,a,r,l),sg(t,o,a,e,n,r,i)}function bF(t,e,n){if(!t)return[new wn(0,0,e==Wg?1:0)];if(e==$i&&!n.length&&!hF.test(t))return hC(t.length);if(n.length)for(;t.length>xe.length;)xe[xe.length]=256;let r=[],o=e==$i?0:1;return fg(t,o,o,n,0,t.length,r),r}function hC(t){return[new wn(0,t,0)]}function IF(t,e,n,r,o){var a;if(!t.length)return null;let i=r.head-t.from,l;if(r.head==t.from&&r.assoc<0){if(!o)return null;i=e[l=0].side(!1,n)}else if(r.head==t.to&&r.assoc>0){if(o)return null;i=e[l=e.length-1].side(!0,n)}else l=wn.find(e,i,(a=r.bidiLevel)!==null&&a!==void 0?a:-1,r.assoc);let s=e[l],f=s.side(o,n);if(i==f){let d=l+=o?1:-1;if(d<0||d>=e.length)return null;s=e[l=d],i=s.side(!o,n),f=s.side(o,n)}let c=tt(t.text,i,s.forward(o,n));(c<s.from||c>s.to)&&(c=f),xC=t.text.slice(Math.min(i,c),Math.max(i,c));let u=l==(o?e.length-1:0)?null:e[l+(o?1:-1)];if(c==f){if(!u)return o?B.cursor(t.to,1):B.cursor(t.from,-1);if(u.level+(o?0:1)<s.level)return B.cursor(u.side(!o,n)+t.from,u.forward(o,n)?1:-1,u.level)}return B.cursor(c+t.from,s.forward(o,n)?-1:1,s.level)}function vF(t,e,n){for(let r=e;r<n;r++){let o=pC(t.charCodeAt(r));if(o==1)return $i;if(o==2||o==4)return Wg}}function At(t,e,n){let r=t.facet(IC);r.length?r[0](e):window.onerror&&window.onerror(String(e),n,void 0,void 0,e)||(n?console.error(n+":",e):console.error(e))}function Rk(t,e){let n=t.state.facet(MC);if(!n.length)return n;let r=n.map(a=>a instanceof Function?a(t):a),o=[];return ce.spans(r,e.from,e.to,{point(){},span(a,i,l,s){let f=a-e.from,c=i-e.from,u=o;for(let d=l.length-1;d>=0;d--,s--){let p=l[d].spec.bidiIsolate,h;if(s>0&&u.length&&(h=u[u.length-1]).to==f&&h.direction==p)h.to=c,u=h.inner;else{let y={from:f,to:c,direction:p,inner:[]};u.push(y),u=y.inner}}}}),DC(e.text,o)}function DC(t,e){for(let n of e){if(n.direction==null){for(let r=n.from,o=0;r<n.to;o++){let a=o<n.inner.length?n.inner[o]:null,i=vF(t,r,a?a.from:n.to);if(i){n.direction=i;break}if(!a)break;r=a.to}n.direction==null&&(n.direction=ge.LTR)}DC(t,n.inner)}return e}function Zg(t){let e=0,n=0,r=0,o=0;for(let a of t.state.facet(OC)){let i=a(t);i&&(i.left!=null&&(e=Math.max(e,i.left)),i.right!=null&&(n=Math.max(n,i.right)),i.top!=null&&(r=Math.max(r,i.top)),i.bottom!=null&&(o=Math.max(o,i.bottom)))}return{left:e,right:n,top:r,bottom:o}}function Bk(t){let e=t.nextSibling;return t.parentNode.removeChild(t),e}function CF(t){let e=t.dom.lastChild;if(!e)return t.dom.getBoundingClientRect();let n=Us(e);return n[n.length-1]||null}function AF(t,e){let n=t.coordsIn(0,1),r=e.coordsIn(0,1);return n&&r&&r.top<n.bottom}function Ek(t,e){let n=r=>{for(let o of r.children)if((e?o.isText():o.length)||n(o))return!0;return!1};return n(t)}function TF(t){let e=t.isReplace?(t.startSide<0?64:0)|(t.endSide>0?128:0):t.startSide>0?32:16;return t.block&&(e|=256),e}function MF(t,e){let n=e.spec.attributes,r=e.spec.class;return!n&&!r||(t||(t={class:"cm-line"}),n&&Qg(n,t),r&&(t.class+=" "+r)),t}function DF(t){let e=[];for(let n=t.parents.length;n>1;n--){let r=n==t.parents.length?t.tile:t.parents[n].tile;r instanceof qt&&e.push(r.mark)}return e}function Wx(t){let e=Fe.get(t);return e&&e.setDOM(t.cloneNode()),t}function gg(t,e){let n=e?.get(t);if(n!=1){n==null&&t.destroy();for(let r of t.children)gg(r,e)}}function OF(t){return nt(t.node)&&t.node.firstChild&&(t.offset==0||t.node.childNodes[t.offset-1].contentEditable=="false")&&(t.offset==t.node.childNodes.length||t.node.childNodes[t.offset].contentEditable=="false")}function BC(t,e){let n=t.observer.selectionRange;if(!n.focusNode)return null;let r=cC(n.focusNode,n.focusOffset),o=uC(n.focusNode,n.focusOffset),a=r||o;if(o&&r&&o.node!=r.node){let l=Fe.get(o.node);if(!l||l.isText()&&l.text!=o.node.nodeValue)a=o;else if(t.docView.lastCompositionAfterCursor){let s=Fe.get(r.node);!s||s.isText()&&s.text!=r.node.nodeValue||(a=o)}}if(t.docView.lastCompositionAfterCursor=a!=r,!a)return null;let i=e-a.offset;return{from:i,to:i+a.node.nodeValue.length,node:a.node}}function RF(t,e,n){let r=BC(t,n);if(!r)return null;let{node:o,from:a,to:i}=r,l=o.nodeValue;if(/[\n\r]/.test(l)||t.state.doc.sliceString(r.from,r.to)!=l)return null;let s=e.invertedDesc;return{range:new Bn(s.mapPos(a),s.mapPos(i),a,i),text:o}}function BF(t,e){return nt(t)?(e&&t.childNodes[e-1].contentEditable=="false"?1:0)|(e<t.childNodes.length&&t.childNodes[e].contentEditable=="false"?2:0):0}function FF(t,e,n){let r=new EF;return ce.compare(t,e,n,r),r.changes}function LF(t,e,n){let r=new yg;return ce.compare(t,e,n,r),r.changes}function NF(t,e){for(let n=t;n&&n!=e;n=n.assignedSlot||n.parentNode)if(nt(n)&&n.contentEditable=="false")return!0;return!1}function qF(t,e){let n=!1;return e&&t.iterChangedRanges((r,o)=>{r<e.to&&o>e.from&&(n=!0)}),n}function PF(t,e,n=1){let r=t.charCategorizer(e),o=t.doc.lineAt(e),a=e-o.from;if(o.length==0)return B.cursor(e);a==0?n=1:a==o.length&&(n=-1);let i=a,l=a;n<0?i=tt(o.text,a,!1):l=tt(o.text,a);let s=r(o.text.slice(i,l));for(;i>0;){let f=tt(o.text,i,!1);if(r(o.text.slice(f,i))!=s)break;i=f}for(;l<o.length;){let f=tt(o.text,l);if(r(o.text.slice(l,f))!=s)break;l=f}return B.undirectionalRange(i+o.from,l+o.from)}function _F(t,e,n,r,o){let a=Math.round((r-e.left)*t.defaultCharacterWidth);if(t.lineWrapping&&n.height>t.defaultLineHeight*1.5){let l=t.viewState.heightOracle.textHeight,s=Math.floor((o-n.top-(t.defaultLineHeight-l)*.5)/l);a+=s*t.viewState.heightOracle.lineLength}let i=t.state.sliceDoc(n.from,n.to);return n.from+yk(i,a,t.state.tabSize)}function zF(t,e,n){let r=t.lineBlockAt(e);if(Array.isArray(r.type)){let o;for(let a of r.type){if(a.from>e)break;if(!(a.to<e)){if(a.from<e&&a.to>e)return a;(!o||a.type==Pt.Text&&(o.type!=a.type||(n<0?a.from<e:a.to>e)))&&(o=a)}}return o||r}return r}function HF(t,e,n,r){let o=zF(t,e.head,e.assoc||-1),a=!r||o.type!=Pt.Text||!(t.lineWrapping||o.widgetLineBreaks)?null:t.coordsAtPos(e.assoc<0&&e.head>o.from?e.head-1:e.head);if(a){let i=t.dom.getBoundingClientRect(),l=t.textDirectionAt(o.from),s=t.posAndSideAtCoords({x:n==(l==ge.LTR)?i.right-1:i.left+1,y:(a.top+a.bottom)/2});if(s)return B.cursor(s.pos,s.assoc)}return B.cursor(n?o.to:o.from,n?1:-1)}function Fk(t,e,n,r){let o=t.state.doc.lineAt(e.head),a=t.bidiSpans(o),i=t.textDirectionAt(o.from);for(let l=e,s=null;;){let f=IF(o,a,i,l,n),c=xC;if(!f){if(o.number==(n?t.state.doc.lines:1))return l;c=`
`,o=t.state.doc.line(o.number+(n?1:-1)),a=t.bidiSpans(o),f=n?B.cursor(o.from,-1):B.cursor(o.to,1)}if(s){if(!s(c))return l}else{if(!r)return f;s=r(c)}l=f}}function UF(t,e,n){let r=t.state.charCategorizer(e),o=r(n);return a=>{let i=r(a);return o==gn.Space&&(o=i),o==i}}function jF(t,e,n,r){let o=e.head,a=n?1:-1;if(o==(n?t.state.doc.length:0))return B.cursor(o,e.assoc);let i=e.goalColumn,l,s=t.contentDOM.getBoundingClientRect(),f=t.coordsAtPos(o,e.assoc||((e.empty?n:e.head==e.from)?1:-1)),c=t.documentTop;if(f)i==null&&(i=f.left-s.left),l=a<0?f.top:f.bottom;else{let h=t.viewState.lineBlockAt(o);i==null&&(i=Math.min(s.right-s.left,t.defaultCharacterWidth*(o-h.from))),l=(a<0?h.top:h.bottom)+c}let u=s.left+i,d=t.viewState.heightOracle.textHeight>>1,p=r??d;for(let h=0;;h+=d){let y=l+(p+h)*a,b=bg(t,{x:u,y},!1,a);if(n?y>s.bottom:y<s.top)return B.cursor(b.pos,b.assoc);let m=t.coordsAtPos(b.pos,b.assoc),g=m?(m.top+m.bottom)/2:0;if(!m||(n?g>l:g<l))return B.cursor(b.pos,b.assoc,void 0,i)}}function Xs(t,e,n){for(;;){let r=0;for(let o of t)o.between(e-1,e+1,(a,i,l)=>{if(e>a&&e<i){let s=r||n||(e-a<i-e?-1:1);e=s<0?a:i,r=s}});if(!r)return e}}function EC(t,e){let n=null;for(let r=0;r<e.ranges.length;r++){let o=e.ranges[r],a=null;if(o.empty){let i=Xs(t,o.from,0);i!=o.from&&(a=B.cursor(i,-1))}else{let i=Xs(t,o.from,-1),l=Xs(t,o.to,1);(i!=o.from||l!=o.to)&&(o.undirectional?a=B.undirectionalRange(o.from,o.to):a=B.range(o.from==o.anchor?i:l,o.from==o.head?i:l))}a&&(n||(n=e.ranges.slice()),n[r]=a)}return n?B.create(n,e.mainIndex):e}function Yx(t,e,n){let r=Xs(t.state.facet(tf).map(o=>o(t)),n.from,e.head>n.from?-1:1);return r==n.from?n:B.cursor(r,r<n.from?1:-1)}function bg(t,e,n,r){let o=t.contentDOM.getBoundingClientRect(),a=o.top+t.viewState.paddingTop,{x:i,y:l}=e,s=l-a,f;for(;;){if(s<0)return new vn(0,1);if(s>t.viewState.docHeight)return new vn(t.state.doc.length,-1);if(f=t.elementAtHeight(s),r==null)break;if(f.type==Pt.Text){if(r<0?f.to<t.viewport.from:f.from>t.viewport.to)break;let d=t.docView.coordsAt(r<0?f.from:f.to,r>0?-1:1);if(d&&(r<0?d.top<=s+a:d.bottom>=s+a))break}let u=t.viewState.heightOracle.textHeight/2;s=r>0?f.bottom+u:f.top-u}if(t.viewport.from>=f.to||t.viewport.to<=f.from){if(n)return null;if(f.type==Pt.Text){let u=_F(t,o,f,i,l);return new vn(u,u==f.from?1:-1)}}if(f.type!=Pt.Text)return s<(f.top+f.bottom)/2?new vn(f.from,1):new vn(f.to,-1);let c=t.docView.lineAt(f.from,2);return(!c||c.length!=f.length)&&(c=t.docView.lineAt(f.from,-2)),new Ig(t,i,l,t.textDirectionAt(f.from)).scanTile(c,f.from)}function VF(t,e,n){for(;;){if(!e||n<Er(e))return!1;if(e==t)return!0;n=Co(e)+1,e=e.parentNode}}function GF(t,e){let n;for(;!(t==e||!t);t=t.nextSibling){let r=Fe.get(t);if(!r?.isWidget())return!1;r&&(n||(n=[])).push(r)}if(n)for(let r of n){let o=r.overrideDOMText;if(o?.length)return!1}return!0}function FC(t,e,n,r){if(t.isComposite()){let o=-1,a=-1,i=-1,l=-1;for(let s=0,f=r,c=r;s<t.children.length;s++){let u=t.children[s],d=f+u.length;if(f<e&&d>n)return FC(u,e,n,f);if(d>=e&&o==-1&&(o=s,a=f),f>n&&u.dom.parentNode==t.dom){i=s,l=c;break}c=d,f=d+u.breakAfter}return{from:a,to:l<0?r+t.length:l,startDOM:(o?t.children[o-1].dom.nextSibling:null)||t.dom.firstChild,endDOM:i<t.children.length&&i>=0?t.children[i].dom:null}}else return t.isText()?{from:r,to:r+t.length,startDOM:t.dom,endDOM:t.dom.nextSibling}:null}function LC(t,e){let n,{newSel:r}=e,{state:o}=t,a=o.selection.main,i=t.inputState.lastKeyTime>Date.now()-100?t.inputState.lastKeyCode:-1;if(e.bounds){let{from:l,to:s}=e.bounds,f=a.from,c=null;(i===8||P.android&&e.text.length<s-l)&&(f=a.to,c="end");let u=o.doc.sliceString(l,s,Gi),d,p;!a.empty&&a.from>=l&&a.to<=s&&(e.typeOver||u!=e.text)&&u.slice(0,a.from-l)==e.text.slice(0,a.from-l)&&u.slice(a.to-l)==e.text.slice(d=e.text.length-(u.length-(a.to-l)))?n={from:a.from,to:a.to,insert:ne.of(e.text.slice(a.from-l,d).split(Gi))}:(p=NC(u,e.text,f-l,c))&&(P.chrome&&i==13&&p.toB==p.from+2&&e.text.slice(p.from,p.toB)==Gi+Gi&&p.toB--,n={from:l+p.from,to:l+p.toA,insert:ne.of(e.text.slice(p.from,p.toB).split(Gi))})}else r&&(!t.hasFocus&&o.facet(Or)||Sg(r,a))&&(r=null);if(!n&&!r)return!1;if((P.mac||P.android)&&n&&n.from==n.to&&n.from==a.head-1&&/^\. ?$/.test(n.insert.toString())&&t.contentDOM.getAttribute("autocorrect")=="off"?(r&&n.insert.length==2&&(r=B.single(r.main.anchor-1,r.main.head-1)),n={from:n.from,to:n.to,insert:ne.of([n.insert.toString().replace("."," ")])}):o.doc.lineAt(a.from).to<a.to&&t.docView.lineHasWidget(a.to)&&t.inputState.insertingTextAt>Date.now()-50?n={from:a.from,to:a.to,insert:o.toText(t.inputState.insertingText)}:P.chrome&&n&&n.from==n.to&&n.from==a.head&&n.insert.toString()==`
 `&&t.lineWrapping&&(r&&(r=B.single(r.main.anchor-1,r.main.head-1)),n={from:a.from,to:a.to,insert:ne.of([" "])}),n)return ey(t,n,r,i);if(r&&!Sg(r,a)){let l=!1,s="select";return t.inputState.lastSelectionTime>Date.now()-50&&(t.inputState.lastSelectionOrigin=="select"&&(l=!0),s=t.inputState.lastSelectionOrigin,s=="select.pointer"&&(r=EC(o.facet(tf).map(f=>f(t)),r))),t.dispatch({selection:r,scrollIntoView:l,userEvent:s}),!0}else return!1}function ey(t,e,n,r=-1){if(P.ios&&t.inputState.flushIOSKey(e))return!0;let o=t.state.selection.main;if(P.android&&(e.to==o.to&&(e.from==o.from||e.from==o.from-1&&t.state.sliceDoc(e.from,o.from)==" ")&&e.insert.length==1&&e.insert.lines==2&&Yi(t.contentDOM,"Enter",13)||(e.from==o.from-1&&e.to==o.to&&e.insert.length==0||r==8&&e.insert.length<e.to-e.from&&e.to>o.head)&&Yi(t.contentDOM,"Backspace",8)||e.from==o.from&&e.to==o.to+1&&e.insert.length==0&&Yi(t.contentDOM,"Delete",46)))return!0;let a=e.insert.toString();t.inputState.composing>=0&&t.inputState.composing++;let i,l=()=>i||(i=QF(t,e,n));return t.state.facet(vC).some(s=>s(t,e.from,e.to,a,l))||t.dispatch(l()),!0}function QF(t,e,n){let r,o=t.state,a=o.selection.main,i=-1;if(e.from==e.to&&e.from<a.from||e.from>a.to){let s=e.from<a.from?-1:1,f=s<0?a.from:a.to,c=Xs(o.facet(tf).map(u=>u(t)),f,s);e.from==c&&(i=c)}if(i>-1)r={changes:e,selection:B.cursor(e.from+e.insert.length,-1)};else if(e.from>=a.from&&e.to<=a.to&&e.to-e.from>=(a.to-a.from)/3&&(!n||n.main.empty&&n.main.from==e.from+e.insert.length)&&t.inputState.composing<0){let s=a.from<e.from?o.sliceDoc(a.from,e.from):"",f=a.to>e.to?o.sliceDoc(e.to,a.to):"";r=o.replaceSelection(t.state.toText(s+e.insert.sliceString(0,void 0,t.state.lineBreak)+f))}else{let s=o.changes(e),f=n&&n.main.to<=s.newLength?n.main:void 0;if(o.selection.ranges.length>1&&(t.inputState.composing>=0||t.inputState.compositionPendingChange)&&e.to<=a.to+10&&e.to>=a.to-10){let c=t.state.sliceDoc(e.from,e.to),u,d=n&&BC(t,n.main.head);if(d){let h=e.insert.length-(e.to-e.from);u={from:d.from,to:d.to-h}}else u=t.state.doc.lineAt(a.head);let p=a.to-e.to;r=o.changeByRange(h=>{if(h.from==a.from&&h.to==a.to)return{changes:s,range:f||h.map(s)};let y=h.to-p,b=y-c.length;if(t.state.sliceDoc(b,y)!=c||y>=u.from&&b<=u.to)return{range:h};let m=o.changes({from:b,to:y,insert:e.insert}),g=h.to-a.to;return{changes:m,range:f?B.range(Math.max(0,f.anchor+g),Math.max(0,f.head+g)):h.map(m)}})}else r={changes:s,selection:f&&o.selection.replaceRange(f)}}let l="input.type";return(t.composing||t.inputState.compositionPendingChange&&t.inputState.compositionEndedAt>Date.now()-50)&&(t.inputState.compositionPendingChange=!1,l+=".compose",t.inputState.compositionFirstChange&&(l+=".start",t.inputState.compositionFirstChange=!1)),o.update(r,{userEvent:l,scrollIntoView:!0})}function NC(t,e,n,r){let o=Math.min(t.length,e.length),a=0;for(;a<o&&t.charCodeAt(a)==e.charCodeAt(a);)a++;if(a==o&&t.length==e.length)return null;let i=t.length,l=e.length;for(;i>0&&l>0&&t.charCodeAt(i-1)==e.charCodeAt(l-1);)i--,l--;if(r=="end"){let s=Math.max(0,a-Math.min(i,l));n-=i+s-a}if(i<a&&t.length<e.length){let s=n<=a&&n>=i?a-n:0;a-=s,l=a+(l-i),i=a}else if(l<a){let s=n<=a&&n>=l?a-n:0;a-=s,i=a+(i-l),l=a}return{from:a,toA:i,toB:l}}function XF(t){let e=[];if(t.root.activeElement!=t.contentDOM)return e;let{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}=t.observer.selectionRange;return n&&(e.push(new Ju(n,r)),(o!=n||a!=r)&&e.push(new Ju(o,a))),e}function WF(t,e){if(t.length==0)return null;let n=t[0].pos,r=t.length==2?t[1].pos:n;return n<0||r<0?null:n==r?B.create([B.cursor(r+e,-1)]):B.single(n+e,r+e)}function Sg(t,e){return e.head==t.main.head&&e.anchor==t.main.anchor}function KF(t){return t.visualViewport?t.visualViewport.height*t.visualViewport.scale/t.document.documentElement.clientHeight<.85:!1}function Lk(t,e){return(n,r)=>{try{return e.call(t,r,n)}catch(o){At(n.state,o)}}}function YF(t){let e=Object.create(null);function n(r){return e[r]||(e[r]={observers:[],handlers:[]})}for(let r of t){let o=r.spec,a=o&&o.plugin.domEventHandlers,i=o&&o.plugin.domEventObservers;if(a)for(let l in a){let s=a[l];s&&n(l).handlers.push(Lk(r.value,s))}if(i)for(let l in i){let s=i[l];s&&n(l).observers.push(Lk(r.value,s))}}for(let r in En)n(r).handlers.push(En[r]);for(let r in Tt)n(r).observers.push(Tt[r]);return e}function qu(t){return Math.max(0,t)*.7+8}function $F(t,e){return Math.max(Math.abs(t.clientX-e.clientX),Math.abs(t.clientY-e.clientY))}function ZF(t,e){let n=t.state.facet(gC);return n.length?n[0](e):P.mac?e.metaKey:e.ctrlKey}function eL(t,e){let n=t.state.facet(yC);return n.length?n[0](e):P.mac?!e.altKey:!e.ctrlKey}function tL(t,e){let{main:n}=t.state.selection;if(n.empty)return!1;let r=$s(t.root);if(!r||r.rangeCount==0)return!0;let o=r.getRangeAt(0).getClientRects();for(let a=0;a<o.length;a++){let i=o[a];if(i.left<=e.clientX&&i.right>=e.clientX&&i.top<=e.clientY&&i.bottom>=e.clientY)return!0}return!1}function nL(t,e){if(!e.bubbles)return!0;if(e.defaultPrevented)return!1;for(let n=e.target,r;n!=t.contentDOM;n=n.parentNode)if(!n||n.nodeType==11||(r=Fe.get(n))&&r.isWidget()&&!r.isHidden&&r.widget.ignoreEvent(e))return!1;return!0}function rL(t){let e=t.dom.parentNode;if(!e)return;let n=e.appendChild(document.createElement("textarea"));n.style.cssText="position: fixed; left: -10000px; top: 10px",n.focus(),setTimeout(()=>{t.focus(),n.remove(),zC(t,n.value)},50)}function id(t,e,n){for(let r of t.facet(e))n=r(n,t);return n}function zC(t,e){e=id(t.state,Kg,e);let{state:n}=t,r,o=1,a=n.toText(e),i=a.lines==n.selection.ranges.length;if(Ag!=null&&n.selection.ranges.every(s=>s.empty)&&Ag==a.toString()){let s=-1;r=n.changeByRange(f=>{let c=n.doc.lineAt(f.from);if(c.from==s)return{range:f};s=c.from;let u=n.toText((i?a.line(o++).text:e)+n.lineBreak);return{changes:{from:c.from,insert:u},range:B.cursor(f.from+u.length,-1)}})}else i?r=n.changeByRange(s=>{let f=a.line(o++);return{changes:{from:s.from,to:s.to,insert:f.text},range:B.cursor(s.from+f.length,-1)}}):r=n.replaceSelection(a);t.dispatch(r,{userEvent:"input.paste",scrollIntoView:!0})}function Nk(t,e,n,r){if(r==1)return B.cursor(e,n);if(r==2)return PF(t.state,e,n);{let o=t.docView.lineAt(e,n),a=t.state.doc.lineAt(o?o.posAtEnd:e),i=o?o.posAtStart:a.from,l=o?o.posAtEnd:a.to;return l<t.state.doc.length&&l==a.to&&l++,B.undirectionalRange(i,l)}}function HC(t){if(!oL)return t.detail;let e=qk,n=_k;return qk=t,_k=Date.now(),Pk=!e||n>Date.now()-400&&Math.abs(e.clientX-t.clientX)<2&&Math.abs(e.clientY-t.clientY)<2?(Pk+1)%3:1}function aL(t,e){let n=t.posAndSideAtCoords({x:e.clientX,y:e.clientY},!1),r=HC(e),o=t.state.selection;return{update(a){a.docChanged&&(n.pos=a.changes.mapPos(n.pos),o=o.map(a.changes))},get(a,i,l){let s=t.posAndSideAtCoords({x:a.clientX,y:a.clientY},!1),f,c=Nk(t,s.pos,s.assoc,r);if(n.pos!=s.pos&&!i){let u=Nk(t,n.pos,n.assoc,r),d=Math.min(u.from,c.from),p=Math.max(u.to,c.to);c=d<c.from?B.range(d,p,c.assoc):B.range(p,d,c.assoc)}return i?o.replaceRange(o.main.extend(c.from,c.to,c.assoc)):l&&r==1&&o.ranges.length>1&&(f=iL(o,s.pos))?f:l?o.addRange(c):B.create([c])}}}function iL(t,e){for(let n=0;n<t.ranges.length;n++){let{from:r,to:o}=t.ranges[n];if(r<=e&&o>=e)return B.create(t.ranges.slice(0,n).concat(t.ranges.slice(n+1)),t.mainIndex==n?0:t.mainIndex-(t.mainIndex>n?1:0))}return null}function zk(t,e,n,r){if(n=id(t.state,Kg,n),!n)return;let o=t.posAtCoords({x:e.clientX,y:e.clientY},!1),{draggedContent:a}=t.inputState,i=r&&a&&eL(t,e)?{from:a.from,to:a.to}:null,l={from:o,insert:n},s=t.state.changes(i?[i,l]:l);t.focus(),t.dispatch({changes:s,selection:{anchor:s.mapPos(o,-1),head:s.mapPos(o,1)},userEvent:i?"move.drop":"input.drop"}),t.inputState.draggedContent=null}function lL(t,e){let n=t.dom.parentNode;if(!n)return;let r=n.appendChild(document.createElement("textarea"));r.style.cssText="position: fixed; left: -10000px; top: 10px",r.value=e,r.focus(),r.selectionEnd=e.length,r.selectionStart=0,setTimeout(()=>{r.remove(),t.focus()},50)}function sL(t){let e=[],n=[],r=!1;for(let o of t.selection.ranges)o.empty||(e.push(t.sliceDoc(o.from,o.to)),n.push(o));if(!e.length){let o=-1;for(let{from:a}of t.selection.ranges){let i=t.doc.lineAt(a);i.number>o&&(e.push(i.text),n.push({from:i.from,to:Math.min(t.doc.length,i.to+1)})),o=i.number}r=!0}return{text:id(t,Yg,e.join(t.lineBreak)),ranges:n,linewise:r}}function jC(t,e){let n=[];for(let r of t.facet(wC)){let o=r(t,e);o&&n.push(o)}return n.length?t.update({effects:n,annotations:UC.of(!0)}):null}function VC(t){setTimeout(()=>{let e=t.hasFocus;if(e!=t.inputState.notifiedFocused){let n=jC(t.state,e);n?t.dispatch(n):t.update([])}},10)}function fL(t){Hk.has(t)||(Hk.add(t),t.addEventListener("copy",()=>{}),t.addEventListener("cut",()=>{}))}function jk(){rl=!1}function $u(t,e){return t==e?t:(t.constructor!=e.constructor&&(rl=!0),e)}function Vk(t,e){let n,r;t[e]==null&&(n=t[e-1])instanceof ko&&(r=t[e+1])instanceof ko&&t.splice(e-1,3,new ko(n.length+1+r.length))}function dL(t,e,n){let r=new Rg;return ce.compare(t,e,n,r,0),r.changes}function pL(t,e){let n=t.getBoundingClientRect(),r=t.ownerDocument,o=r.defaultView||window,a=Math.max(0,n.left),i=Math.min(o.innerWidth,n.right),l=Math.max(0,n.top),s=Math.min(o.innerHeight,n.bottom);for(let f=t.parentNode;f&&f!=r.body;)if(nt(f)){let c=window.getComputedStyle(f);if((f.scrollHeight>f.clientHeight||f.scrollWidth>f.clientWidth)&&c.overflow!="visible"){let u=f.getBoundingClientRect();a=Math.max(a,u.left),i=Math.min(i,u.right),l=Math.max(l,u.top),s=Math.min(f==t.parentNode?o.innerHeight:s,u.bottom)}f=c.position=="absolute"||c.position=="fixed"?f.offsetParent:f.parentNode}else if(f.nodeType==11)f=f.host;else break;return{left:a-n.left,right:Math.max(a,i)-n.left,top:l-(n.top+e),bottom:Math.max(l,s)-(n.top+e)}}function mL(t){let e=t.getBoundingClientRect(),n=t.ownerDocument.defaultView||window;return e.left<n.innerWidth&&e.right>0&&e.top<n.innerHeight&&e.bottom>0}function hL(t,e){let n=t.getBoundingClientRect();return{left:0,right:n.right-n.left,top:e,bottom:n.bottom-(n.top+e)}}function xL(t,e,n){let r=[],o=t,a=0;return ce.spans(n,t,e,{span(){},point(i,l){i>o&&(r.push({from:o,to:i}),a+=i-o),o=l}},20),o<e&&(r.push({from:o,to:e}),a+=e-o),{total:a,ranges:r}}function Pu({total:t,ranges:e},n){if(n<=0)return e[0].from;if(n>=1)return e[e.length-1].to;let r=Math.floor(t*n);for(let o=0;;o++){let{from:a,to:i}=e[o],l=i-a;if(r<=l)return a+r;r-=l}}function _u(t,e){let n=0;for(let{from:r,to:o}of t.ranges){if(e<=o){n+=e-r;break}n+=o-r}return n/t.total}function gL(t,e){for(let n of t)if(e(n))return n}function Gk(t){let e=t.facet(ad).filter(r=>typeof r!="function"),n=t.facet($g).filter(r=>typeof r!="function");return n.length&&e.push(ce.join(n)),e}function zs(t,e){if(e.scale==1)return t;let n=e.toDOM(t.top),r=e.toDOM(t.bottom);return new Rn(t.from,t.length,n,r-n,Array.isArray(t._content)?t._content.map(o=>zs(o,e)):t._content)}function qg(t,e,n){return new bn(e,{finish(r){return/&/.test(r)?r.replace(/&\w*/,o=>{if(o=="&")return t;if(!n||!n[o])throw new RangeError(`Unsupported selector: ${o}`);return n[o]}):t+" "+r}})}function Qk(t,e,n){for(;e;){let r=Fe.get(e);if(r&&r.parent==t)return r;let o=e.parentNode;e=o!=t.dom?o:n>0?e.nextSibling:e.previousSibling}return null}function Xk(t,e){let n=e.startContainer,r=e.startOffset,o=e.endContainer,a=e.endOffset,i=t.docView.domAtPos(t.state.selection.main.anchor,1);return js(i.node,i.offset,o,a)&&([n,r,o,a]=[o,a,n,r]),{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}}function IL(t,e){if(e.getComposedRanges){let o=e.getComposedRanges(t.root)[0];if(o)return Xk(t,o)}let n=null;function r(o){o.preventDefault(),o.stopImmediatePropagation(),n=o.getTargetRanges()[0]}return t.contentDOM.addEventListener("beforeinput",r,!0),t.dom.ownerDocument.execCommand("indent"),t.contentDOM.removeEventListener("beforeinput",r,!0),n?Xk(t,n):null}function Kk(t,e,n){for(let r=t.state.facet(e),o=r.length-1;o>=0;o--){let a=r[o],i=typeof a=="function"?a(t):a;i&&Qg(i,n)}return n}function SL(t,e){let n=t.split(/-(?!$)/),r=n[n.length-1];r=="Space"&&(r=" ");let o,a,i,l;for(let s=0;s<n.length-1;++s){let f=n[s];if(/^(cmd|meta|m)$/i.test(f))l=!0;else if(/^a(lt)?$/i.test(f))o=!0;else if(/^(c|ctrl|control)$/i.test(f))a=!0;else if(/^s(hift)?$/i.test(f))i=!0;else if(/^mod$/i.test(f))e=="mac"?l=!0:a=!0;else throw new Error("Unrecognized modifier name: "+f)}return o&&(r="Alt-"+r),a&&(r="Ctrl-"+r),l&&(r="Meta-"+r),i&&(r="Shift-"+r),r}function Hu(t,e,n){return e.altKey&&(t="Alt-"+t),e.ctrlKey&&(t="Ctrl-"+t),e.metaKey&&(t="Meta-"+t),n!==!1&&e.shiftKey&&(t="Shift-"+t),t}function CL(t){let e=t.facet(ol),n=Yk.get(e);return n||Yk.set(e,n=TL(e.reduce((r,o)=>r.concat(o),[]))),n}function TL(t,e=wL){let n=Object.create(null),r=Object.create(null),o=(i,l)=>{let s=r[i];if(s==null)r[i]=l;else if(s!=l)throw new Error("Key binding "+i+" is used both as a regular binding and as a multi-stroke prefix")},a=(i,l,s,f,c)=>{var u,d;let p=n[i]||(n[i]=Object.create(null)),h=l.split(/ (?!$)/).map(m=>SL(m,e));for(let m=1;m<h.length;m++){let g=h.slice(0,m).join(" ");o(g,!0),p[g]||(p[g]={preventDefault:!0,stopPropagation:!1,run:[x=>{let I=So={view:x,prefix:g,scope:i};return setTimeout(()=>{So==I&&(So=null)},AL),!0}]})}let y=h.join(" ");o(y,!1);let b=p[y]||(p[y]={preventDefault:!1,stopPropagation:!1,run:((d=(u=p._any)===null||u===void 0?void 0:u.run)===null||d===void 0?void 0:d.slice())||[]});s&&b.run.push(s),f&&(b.preventDefault=!0),c&&(b.stopPropagation=!0)};for(let i of t){let l=i.scope?i.scope.split(" "):["editor"];if(i.any)for(let f of l){let c=n[f]||(n[f]=Object.create(null));c._any||(c._any={preventDefault:!1,stopPropagation:!1,run:[]});let{any:u}=i;for(let d in c)c[d].run.push(p=>u(p,zg))}let s=i[e]||i.key;if(s)for(let f of l)a(f,s,i.run,i.preventDefault,i.stopPropagation),i.shift&&a(f,"Shift-"+s,i.shift,i.preventDefault,i.stopPropagation)}return n}function ML(t,e,n,r){zg=e;let o=wk(e),a=Mr(o,0),i=vo(a)==o.length&&o!=" ",l="",s=!1,f=!1,c=!1;So&&So.view==n&&So.scope==r&&(l=So.prefix+" ",PC.indexOf(e.keyCode)<0&&(f=!0,So=null));let u=new Set,d=b=>{if(b){for(let m of b.run)if(!u.has(m)&&(u.add(m),m(n)))return b.stopPropagation&&(c=!0),!0;b.preventDefault&&(b.stopPropagation&&(c=!0),f=!0)}return!1},p=t[r],h,y;return p&&(d(p[l+Hu(o,e,!i)])?s=!0:i&&(e.altKey||e.metaKey||e.ctrlKey)&&!(P.windows&&e.ctrlKey&&e.altKey)&&!(P.mac&&e.altKey&&!(e.ctrlKey||e.metaKey))&&(h=Dr[e.keyCode])&&h!=o?(d(p[l+Hu(h,e,!0)])||e.shiftKey&&(y=Vi[e.keyCode])!=o&&y!=h&&d(p[l+Hu(y,e,!1)]))&&(s=!0):i&&e.shiftKey&&d(p[l+Hu(o,e,!0)])&&(s=!0),!s&&d(p._any)&&(s=!0)),f&&(s=!0),s&&c&&e.stopPropagation(),zg=null,s}function WC(){return RL}function KC(t){let e=_t.fromClass(class{constructor(n){this.view=n,this.placeholder=t?Y.set([Y.widget({widget:new Hg(t),side:1}).range(0)]):Y.none}get decorations(){return this.view.state.doc.length?Y.none:this.placeholder}},{decorations:n=>n.decorations});return typeof t=="string"?[e,V.contentAttributes.of({"aria-placeholder":t})]:e}function YC(t){let e=t.dom.ownerDocument.documentElement,n=e.clientWidth,r=getComputedStyle(e);if(!/stable/.test(r.scrollbarGutter||""))return{left:0,right:n};let o=e.getBoundingClientRect(),a=t.win.scrollX;return{left:Math.max(0,o.left+a-parseFloat(r.marginLeft)),right:Math.min(n,o.right+a+parseFloat(r.marginRight))}}function BL(t){let{left:e,right:n}=YC(t);return{top:0,left:e,right:n,bottom:t.dom.ownerDocument.documentElement.clientHeight}}function Zk(t,e){let n=parseInt(t.style.left,10);(isNaN(n)||Math.abs(e-n)>1)&&(t.style.left=e+"px")}function ny(t,e){let n=t.plugin(JC);if(!n)return null;let r=n.manager.tooltips.indexOf(e);return r<0?null:n.manager.tooltipViews[r]}function NL(t){let e=[qL];return t&&t.fixed===!1&&e.push(jg.of(!0)),e}function eC(t){return Array.isArray(t)?t:[t]}function Vg(t,e,n){for(;t.value&&t.from<=n;)t.from==n&&e.push(t.value),t.next()}function PL(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(!t[n].compare(e[n]))return!1;return!0}function eg(t,e){return t.state.facet(Wi).formatNumber(e,t.state)}function $C(t={}){return[Wi.of(t),NL(),HL]}function tC(t){let e=9;for(;e<t;)e=e*10+9;return e}var Ct,tg,ng,nC,rg,od,Ck,Xx,Ak,og,Tk,P,Gu,Br,Pt,Y,Ys,Js,Ia,Qu,nt,Ji,ig,ya,Ok,Zn,ge,$i,Wg,pF,mF,lg,$n,hF,wn,xe,xC,gC,yC,bC,IC,cg,vC,wC,Kg,Yg,SC,wF,kC,Vs,Lu,CC,Or,SF,Qi,_t,Gs,AC,Jg,ad,TC,$g,tf,MC,OC,_s,Bn,Wu,kF,Fe,Zi,el,Rr,tl,qt,ba,va,nl,ug,dg,pg,mg,Ku,hg,xg,RC,Ao,Kx,Yu,EF,yg,Qs,vn,Ig,Gi,vg,Ju,wg,kg,qC,JF,PC,Nu,Cg,En,Tt,_C,oL,qk,Pk,_k,Ag,UC,Hk,Uk,rl,Tg,Mg,Rn,Ie,ju,Zt,cL,Zu,In,ko,Dg,uL,Og,Rg,Ws,Bg,ed,Xi,Eg,Fg,zu,Lg,Ng,GC,QC,XC,yL,bL,Jx,Pg,_g,V,vL,Wk,td,wL,kL,ol,Yk,So,AL,zg,Jk,DL,B8,E8,OL,RL,Hg,Uu,Ug,$x,$k,JC,EL,FL,ty,er,Zx,LL,Vu,jg,qL,Gg,nd,rd,_L,zL,Wi,Ks,HL,nf=F(()=>{ji();Qx();Sk();kk();Ct=typeof navigator<"u"?navigator:{userAgent:"",vendor:"",platform:""},tg=typeof document<"u"?document:{documentElement:{style:{}}},ng=/Edge\/(\d+)/.exec(Ct.userAgent),nC=/MSIE \d/.test(Ct.userAgent),rg=/Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(Ct.userAgent),od=!!(nC||rg||ng),Ck=!od&&/gecko\/(\d+)/i.test(Ct.userAgent),Xx=!od&&/Chrome\/(\d+)/.exec(Ct.userAgent),Ak="webkitFontSmoothing"in tg.documentElement.style,og=!od&&/Apple Computer/.test(Ct.vendor),Tk=og&&(/Mobile\/\w+/.test(Ct.userAgent)||Ct.maxTouchPoints>2),P={mac:Tk||/Mac/.test(Ct.platform),windows:/Win/.test(Ct.platform),linux:/Linux|X11/.test(Ct.platform),ie:od,ie_version:nC?tg.documentMode||6:rg?+rg[1]:ng?+ng[1]:0,gecko:Ck,gecko_version:Ck?+(/Firefox\/(\d+)/.exec(Ct.userAgent)||[0,0])[1]:0,chrome:!!Xx,chrome_version:Xx?+Xx[1]:0,ios:Tk,android:/Android\b/.test(Ct.userAgent),webkit:Ak,webkit_version:Ak?+(/\bAppleWebKit\/(\d+)/.exec(Ct.userAgent)||[0,0])[1]:0,safari:og,safari_version:og?+(/\bVersion\/(\d+(\.\d+)?)/.exec(Ct.userAgent)||[0,0])[1]:0,tabSize:tg.documentElement.style.tabSize!=null?"tab-size":"-moz-tab-size"};Gu=Object.create(null);Br=class{eq(e){return!1}updateDOM(e,n,r){return!1}compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}get estimatedHeight(){return-1}get lineBreaks(){return 0}ignoreEvent(e){return!0}coordsAt(e,n,r){return null}get isHidden(){return!1}get editable(){return!1}destroy(e){}},Pt=(function(t){return t[t.Text=0]="Text",t[t.WidgetBefore=1]="WidgetBefore",t[t.WidgetAfter=2]="WidgetAfter",t[t.WidgetRange=3]="WidgetRange",t})(Pt||(Pt={})),Y=class extends yn{constructor(e,n,r,o){super(),this.startSide=e,this.endSide=n,this.widget=r,this.spec=o}get heightRelevant(){return!1}static mark(e){return new Ys(e)}static widget(e){let n=Math.max(-1e4,Math.min(1e4,e.side||0)),r=!!e.block;return n+=r&&!e.inlineOrder?n>0?3e8:-4e8:n>0?1e8:-1e8,new Ia(e,n,n,r,e.widget||null,!1)}static replace(e){let n=!!e.block,r,o;if(e.isBlockGap)r=-5e8,o=4e8;else{let{start:a,end:i}=rC(e,n);r=(a?n?-3e8:-1:5e8)-1,o=(i?n?2e8:1:-6e8)+1}return new Ia(e,r,o,n,e.widget||null,!0)}static line(e){return new Js(e)}static set(e,n=!1){return ce.of(e,n)}hasHeight(){return this.widget?this.widget.estimatedHeight>-1:!1}};Y.none=ce.empty;Ys=class t extends Y{constructor(e){let{start:n,end:r}=rC(e);super(n?-1:5e8,r?1:-6e8,null,e),this.tagName=e.tagName||"span",this.attrs=e.class&&e.attributes?Qg(e.attributes,{class:e.class}):e.class?{class:e.class}:e.attributes||Gu}eq(e){return this==e||e instanceof t&&this.tagName==e.tagName&&Xg(this.attrs,e.attrs)}range(e,n=e){if(e>=n)throw new RangeError("Mark decorations may not be empty");return super.range(e,n)}};Ys.prototype.point=!1;Js=class t extends Y{constructor(e){super(-2e8,-2e8,null,e)}eq(e){return e instanceof t&&this.spec.class==e.spec.class&&Xg(this.spec.attributes,e.spec.attributes)}range(e,n=e){if(n!=e)throw new RangeError("Line decoration ranges must be zero-length");return super.range(e,n)}};Js.prototype.mapMode=St.TrackBefore;Js.prototype.point=!0;Ia=class t extends Y{constructor(e,n,r,o,a,i){super(n,r,a,e),this.block=o,this.isReplace=i,this.mapMode=o?n<=0?St.TrackBefore:St.TrackAfter:St.TrackDel}get type(){return this.startSide!=this.endSide?Pt.WidgetRange:this.startSide<=0?Pt.WidgetBefore:Pt.WidgetAfter}get heightRelevant(){return this.block||!!this.widget&&(this.widget.estimatedHeight>=5||this.widget.lineBreaks>0)}eq(e){return e instanceof t&&sF(this.widget,e.widget)&&this.block==e.block&&this.startSide==e.startSide&&this.endSide==e.endSide}range(e,n=e){if(this.isReplace&&(e>n||e==n&&this.startSide>0&&this.endSide<=0))throw new RangeError("Invalid range for replacement decoration");if(!this.isReplace&&n!=e)throw new RangeError("Widget decorations can only have zero-length ranges");return super.range(e,n)}};Ia.prototype.point=!0;Qu=class t extends yn{constructor(e,n,r){super(),this.tagName=e,this.attributes=n,this.rank=r}eq(e){return e==this||e instanceof t&&this.tagName==e.tagName&&Xg(this.attributes,e.attributes)}static create(e){return new t(e.tagName,e.attributes||Gu,e.rank==null?50:Math.max(0,Math.min(e.rank,100)))}static set(e,n=!1){return ce.of(e,n)}};Qu.prototype.startSide=Qu.prototype.endSide=-1;nt=t=>t.nodeType==1,Ji=t=>t.nodeType==3;ig=class{constructor(){this.anchorNode=null,this.anchorOffset=0,this.focusNode=null,this.focusOffset=0}eq(e){return this.anchorNode==e.anchorNode&&this.anchorOffset==e.anchorOffset&&this.focusNode==e.focusNode&&this.focusOffset==e.focusOffset}setRange(e){let{anchorNode:n,focusNode:r}=e;this.set(n,Math.min(e.anchorOffset,n?Er(n):0),r,Math.min(e.focusOffset,r?Er(r):0))}set(e,n,r,o){this.anchorNode=e,this.anchorOffset=n,this.focusNode=r,this.focusOffset=o}};ya=null;P.safari&&P.safari_version>=26&&(ya=!1);Zn=class t{constructor(e,n,r=!0){this.node=e,this.offset=n,this.precise=r}static before(e,n){return new t(e.parentNode,Co(e),n)}static after(e,n){return new t(e.parentNode,Co(e)+1,n)}},ge=(function(t){return t[t.LTR=0]="LTR",t[t.RTL=1]="RTL",t})(ge||(ge={})),$i=ge.LTR,Wg=ge.RTL;pF=dC("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"),mF=dC("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"),lg=Object.create(null),$n=[];for(let t of["()","[]","{}"]){let e=t.charCodeAt(0),n=t.charCodeAt(1);lg[e]=n,lg[n]=-e}hF=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/,wn=class{get dir(){return this.level%2?Wg:$i}constructor(e,n,r){this.from=e,this.to=n,this.level=r}side(e,n){return this.dir==n==e?this.to:this.from}forward(e,n){return e==(this.dir==n)}static find(e,n,r,o){let a=-1;for(let i=0;i<e.length;i++){let l=e[i];if(l.from<=n&&l.to>=n){if(l.level==r)return i;(a<0||(o!=0?o<0?l.from<n:l.to>n:e[a].level>l.level))&&(a=i)}}if(a<0)throw new RangeError("Index out of range");return a}};xe=[];xC="";gC=z.define(),yC=z.define(),bC=z.define(),IC=z.define(),cg=z.define(),vC=z.define(),wC=z.define(),Kg=z.define(),Yg=z.define(),SC=z.define({combine:t=>t.some(e=>e)}),wF=z.define({combine:t=>t.some(e=>e)}),kC=z.define(),Vs=class t{constructor(e,n,r,o,a,i=!1){this.range=e,this.y=n,this.x=r,this.yMargin=o,this.xMargin=a,this.isSnapshot=i}map(e){return e.empty?this:new t(this.range.map(e),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}clip(e){return this.range.to<=e.doc.length?this:new t(B.cursor(e.doc.length),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}},Lu=le.define({map:(t,e)=>t.map(e)}),CC=le.define();Or=z.define({combine:t=>t.length?t[0]:!0}),SF=0,Qi=z.define({combine(t){return t.filter((e,n)=>{for(let r=0;r<n;r++)if(t[r].plugin==e.plugin)return!1;return!0})}}),_t=class t{constructor(e,n,r,o,a){this.id=e,this.create=n,this.domEventHandlers=r,this.domEventObservers=o,this.baseExtensions=a(this),this.extension=this.baseExtensions.concat(Qi.of({plugin:this,arg:void 0}))}of(e){return this.baseExtensions.concat(Qi.of({plugin:this,arg:e}))}static define(e,n){let{eventHandlers:r,eventObservers:o,provide:a,decorations:i}=n||{};return new t(SF++,e,r,o,l=>{let s=[];return i&&s.push(ad.of(f=>{let c=f.plugin(l);return c?i(c):Y.none})),a&&s.push(a(l)),s})}static fromClass(e,n){return t.define((r,o)=>new e(r,o),n)}},Gs=class{constructor(e){this.spec=e,this.mustUpdate=null,this.value=null}get plugin(){return this.spec&&this.spec.plugin}update(e){if(this.value){if(this.mustUpdate){let n=this.mustUpdate;if(this.mustUpdate=null,this.value.update)try{this.value.update(n)}catch(r){if(At(n.state,r,"CodeMirror plugin crashed"),this.value.destroy)try{this.value.destroy()}catch{}this.deactivate()}}}else if(this.spec)try{this.value=this.spec.plugin.create(e,this.spec.arg)}catch(n){At(e.state,n,"CodeMirror plugin crashed"),this.deactivate()}return this}destroy(e){var n;if(!((n=this.value)===null||n===void 0)&&n.destroy)try{this.value.destroy()}catch(r){At(e.state,r,"CodeMirror plugin crashed")}}deactivate(){this.spec=this.value=null}},AC=z.define(),Jg=z.define(),ad=z.define(),TC=z.define(),$g=z.define(),tf=z.define(),MC=z.define();OC=z.define();_s=z.define(),Bn=class t{constructor(e,n,r,o){this.fromA=e,this.toA=n,this.fromB=r,this.toB=o}join(e){return new t(Math.min(this.fromA,e.fromA),Math.max(this.toA,e.toA),Math.min(this.fromB,e.fromB),Math.max(this.toB,e.toB))}addToSet(e){let n=e.length,r=this;for(;n>0;n--){let o=e[n-1];if(!(o.fromA>r.toA)){if(o.toA<r.fromA)break;r=r.join(o),e.splice(n-1,1)}}return e.splice(n,0,r),e}static extendWithRanges(e,n){if(n.length==0)return e;let r=[];for(let o=0,a=0,i=0;;){let l=o<e.length?e[o].fromB:1e9,s=a<n.length?n[a]:1e9,f=Math.min(l,s);if(f==1e9)break;let c=f+i,u=f,d=c;for(;;)if(a<n.length&&n[a]<=u){let p=n[a+1];a+=2,u=Math.max(u,p);for(let h=o;h<e.length&&e[h].fromB<=u;h++)i=e[h].toA-e[h].toB;d=Math.max(d,p+i)}else if(o<e.length&&e[o].fromB<=u){let p=e[o++];u=Math.max(u,p.toB),d=Math.max(d,p.toA),i=p.toA-p.toB}else break;r.push(new t(c,d,f,u))}return r}},Wu=class t{constructor(e,n,r){this.view=e,this.state=n,this.transactions=r,this.flags=0,this.startState=e.state,this.changes=kt.empty(this.startState.doc.length);for(let a of r)this.changes=this.changes.compose(a.changes);let o=[];this.changes.iterChangedRanges((a,i,l,s)=>o.push(new Bn(a,i,l,s))),this.changedRanges=o}static create(e,n,r){return new t(e,n,r)}get viewportChanged(){return(this.flags&4)>0}get viewportMoved(){return(this.flags&8)>0}get heightChanged(){return(this.flags&2)>0}get geometryChanged(){return this.docChanged||(this.flags&18)>0}get focusChanged(){return(this.flags&1)>0}get docChanged(){return!this.changes.empty}get selectionSet(){return this.transactions.some(e=>e.selection)}get empty(){return this.flags==0&&this.transactions.length==0}},kF=[],Fe=class{constructor(e,n,r=0){this.dom=e,this.length=n,this.flags=r,this.parent=null,e.cmTile=this}get breakAfter(){return this.flags&1}get children(){return kF}isWidget(){return!1}get isHidden(){return!1}isComposite(){return!1}isLine(){return!1}isText(){return!1}isBlock(){return!1}get domAttrs(){return null}sync(e){if(this.flags|=2,this.flags&4){this.flags&=-5;let n=this.domAttrs;n&&iF(this.dom,n)}}toString(){return this.constructor.name+(this.children.length?`(${this.children})`:"")+(this.breakAfter?"#":"")}destroy(){this.parent=null}setDOM(e){this.dom=e,e.cmTile=this}get posAtStart(){return this.parent?this.parent.posBefore(this):0}get posAtEnd(){return this.posAtStart+this.length}posBefore(e,n=this.posAtStart){let r=n;for(let o of this.children){if(o==e)return r;r+=o.length+o.breakAfter}throw new RangeError("Invalid child in posBefore")}posAfter(e){return this.posBefore(e)+e.length}covers(e){return!0}coordsIn(e,n,r){return null}domPosFor(e,n){let r=Co(this.dom),o=this.length?e>0:n>0;return new Zn(this.parent.dom,r+(o?1:0),e==0||e==this.length)}markDirty(e){this.flags&=-3,e&&(this.flags|=4),this.parent&&this.parent.flags&2&&this.parent.markDirty(!1)}get overrideDOMText(){return null}get root(){for(let e=this;e;e=e.parent)if(e instanceof el)return e;return null}static get(e){return e.cmTile}},Zi=class extends Fe{constructor(e){super(e,0),this._children=[]}isComposite(){return!0}get children(){return this._children}get lastChild(){return this.children.length?this.children[this.children.length-1]:null}append(e){this.children.push(e),e.parent=this}sync(e){if(this.flags&2)return;super.sync(e);let n=this.dom,r=null,o,a=e?.node==n?e:null,i=0;for(let l of this.children){if(l.sync(e),i+=l.length+l.breakAfter,o=r?r.nextSibling:n.firstChild,a&&o!=l.dom&&(a.written=!0),l.dom.parentNode==n)for(;o&&o!=l.dom;)o=Bk(o);else n.insertBefore(l.dom,o);r=l.dom}for(o=r?r.nextSibling:n.firstChild,a&&o&&(a.written=!0);o;)o=Bk(o);this.length=i}};el=class extends Zi{constructor(e,n){super(n),this.view=e}owns(e){for(;e;e=e.parent)if(e==this)return!0;return!1}isBlock(){return!0}nearest(e){for(;;){if(!e)return null;let n=Fe.get(e);if(n&&this.owns(n))return n;e=e.parentNode}}blockTiles(e){for(let n=[],r=this,o=0,a=0;;)if(o==r.children.length){if(!n.length)return;r=r.parent,r.breakAfter&&a++,o=n.pop()}else{let i=r.children[o++];if(i instanceof Rr)n.push(o),r=i,o=0;else{let l=a+i.length,s=e(i,a);if(s!==void 0)return s;a=l+i.breakAfter}}}resolveBlock(e,n){let r,o=-1,a,i=-1;if(this.blockTiles((l,s)=>{let f=s+l.length;if(e>=s&&e<=f){if(l.isWidget()&&n>=-1&&n<=1){if(l.flags&32)return!0;l.flags&16&&(r=void 0)}(s<e||e==f&&(n<-1?l.length:l.covers(1)))&&(!r||!l.isWidget()&&r.isWidget())&&(r=l,o=e-s),(f>e||e==s&&(n>1?l.length:l.covers(-1)))&&(!a||!l.isWidget()&&a.isWidget())&&(a=l,i=e-s)}}),!r&&!a)throw new Error("No tile at position "+e);return r&&n<0||!a?{tile:r,offset:o}:{tile:a,offset:i}}},Rr=class t extends Zi{constructor(e,n){super(e),this.wrapper=n}isBlock(){return!0}covers(e){return this.children.length?e<0?this.children[0].covers(-1):this.lastChild.covers(1):!1}get domAttrs(){return this.wrapper.attributes}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},tl=class t extends Zi{constructor(e,n){super(e),this.attrs=n}isLine(){return!0}static start(e,n,r){let o=new t(n||document.createElement("div"),e);return(!n||!r)&&(o.flags|=4),o}get domAttrs(){return this.attrs}resolveInline(e,n,r=!1){let o=null,a=-1,i=null,l=-1;function s(c,u){for(let d=0,p=0;d<c.children.length&&p<=u;d++){let h=c.children[d],y=p+h.length;y>=u&&(h.isComposite()?s(h,u-p):(!i||r&&i.isHidden&&(n>0&&!(i.flags&32)||r&&AF(i,h)))&&(y>u||h.flags&32&&n<=1)?(i=h,l=u-p):(p<u||h.flags&16&&!(r&&h.isHidden)&&n>=-1)&&(o=h,a=u-p)),p=y}}s(this,e);let f=(n<0?o:i)||o||i;return f?{tile:f,offset:f==o?a:l}:null}coordsIn(e,n,r){let o=this.resolveInline(e,n,!0);return o?o.tile.coordsIn(Math.max(0,o.offset),n,r):CF(this)}domIn(e,n){let r=this.resolveInline(e,n);if(r){let{tile:o,offset:a}=r;if(this.dom.contains(o.dom))return o.isText()?new Zn(o.dom,Math.min(o.dom.nodeValue.length,a)):o.domPosFor(a,o.flags&16?1:o.flags&32?-1:n);let i=r.tile.parent,l=!1;for(let s of i.children){if(l)return new Zn(s.dom,0);s==r.tile&&(l=!0)}}return new Zn(this.dom,0)}};qt=class t extends Zi{constructor(e,n){super(e),this.mark=n}get domAttrs(){return this.mark.attrs}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},ba=class t extends Fe{constructor(e,n){super(e,n.length),this.text=n}sync(e){this.flags&2||(super.sync(e),this.dom.nodeValue!=this.text&&(e&&e.node==this.dom&&(e.written=!0),this.dom.nodeValue=this.text))}isText(){return!0}toString(){return JSON.stringify(this.text)}coordsIn(e,n,r){let o=this.dom.nodeValue.length;e>o&&(e=o);let a=e,i=e,l=0;e==0&&n<0||e==o&&n>=0?P.chrome||P.gecko||(e?(a--,l=1):i<o&&(i++,l=-1)):n<0?a--:i<o&&i++;let s=ef(this.dom,a,i).getClientRects();if(!s.length)return null;let f=s[(l?l<0:n>=0)?0:s.length-1];return P.safari&&!l&&f.width==0&&(f=Array.prototype.find.call(s,c=>c.width)||f),r==null?f:Zs(f,(l?l>0:n<0)==r)}static of(e,n){let r=new t(n||document.createTextNode(e),e);return n||(r.flags|=2),r}},va=class t extends Fe{constructor(e,n,r,o){super(e,n,o),this.widget=r}isWidget(){return!0}get isHidden(){return this.widget.isHidden}covers(e){return this.flags&48?!1:(this.flags&(e<0?64:128))>0}coordsIn(e,n){return this.coordsInWidget(e,n,!1)}coordsInWidget(e,n,r){let o=this.widget.coordsAt(this.dom,e,n);if(o)return o;if(r)return Zs(this.dom.getBoundingClientRect(),this.length?e==0:n<=0);{let a=this.dom.getClientRects(),i=null;if(!a.length)return null;let l=this.flags&16?!0:this.flags&32?!1:e>0;for(let s=l?a.length-1:0;i=a[s],!(e>0?s==0:s==a.length-1||i.top<i.bottom);s+=l?-1:1);return Zs(i,!l)}}get overrideDOMText(){if(!this.length)return ne.empty;let{root:e}=this;if(!e)return ne.empty;let n=this.posAtStart;return e.view.state.doc.slice(n,n+this.length)}destroy(){super.destroy(),this.widget.destroy(this.dom)}static of(e,n,r,o,a){return a||(a=e.toDOM(n),e.editable||(a.contentEditable="false")),new t(a,r,e,o)}},nl=class extends Fe{constructor(e){let n=document.createElement("img");n.className="cm-widgetBuffer",n.setAttribute("aria-hidden","true"),super(n,0,e)}get isHidden(){return!0}get overrideDOMText(){return ne.empty}coordsIn(e,n,r){let o=this.dom.getBoundingClientRect();return r==null?o:Zs(o,n>0==r)}},ug=class{constructor(e){this.index=0,this.beforeBreak=!1,this.parents=[],this.tile=e}advance(e,n,r){let{tile:o,index:a,beforeBreak:i,parents:l}=this;for(;e||n>0;)if(o.isComposite())if(i){if(!e)break;r&&r.break(),e--,i=!1}else if(a==o.children.length){if(!e&&!l.length)break;r&&r.leave(o),i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++}else{let s=o.children[a],f=s.breakAfter;(n>0?s.length<=e:s.length<e)&&(!r||r.skip(s,0,s.length)!==!1||!s.isComposite)?(i=!!f,a++,e-=s.length):(l.push({tile:o,index:a}),o=s,a=0,r&&s.isComposite()&&r.enter(s))}else{let s=o.length;if(a<s&&e){let f=Math.min(e,s-a);r&&r.skip(o,a,a+f),e-=f,a+=f}if(a==s)i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++;else if(!e)break}return this.tile=o,this.index=a,this.beforeBreak=i,this}get root(){return this.parents.length?this.parents[0].tile:this.tile}},dg=class{constructor(e,n,r,o){this.from=e,this.to=n,this.wrapper=r,this.rank=o}},pg=class{constructor(e,n,r){this.cache=e,this.root=n,this.blockWrappers=r,this.curLine=null,this.lastBlock=null,this.afterWidget=null,this.pos=0,this.wrappers=[],this.wrapperPos=0}addText(e,n,r,o){var a;this.flushBuffer();let i=this.ensureMarks(n,r),l=i.lastChild;if(l&&l.isText()&&!(l.flags&8)&&l.length+e.length<512){this.cache.reused.set(l,2);let s=i.children[i.children.length-1]=new ba(l.dom,l.text+e);s.parent=i}else i.append(o||ba.of(e,(a=this.cache.find(ba))===null||a===void 0?void 0:a.dom));this.pos+=e.length,this.afterWidget=null}addComposition(e,n){let r=this.curLine;r.dom!=n.line.dom&&(r.setDOM(this.cache.reused.has(n.line)?Wx(n.line.dom):n.line.dom),this.cache.reused.set(n.line,2));let o=r;for(let l=n.marks.length-1;l>=0;l--){let s=n.marks[l],f=o.lastChild;if(f instanceof qt&&f.mark.eq(s.mark))f.dom!=s.dom&&f.setDOM(Wx(s.dom)),o=f;else{let{dom:c}=s;this.cache.reused.get(s)&&Fe.get(s.dom)&&(c=Wx(s.dom));let u=qt.of(s.mark,c);o.append(u),o=u}this.cache.reused.set(s,2)}let a=Fe.get(e.text);a&&this.cache.reused.set(a,2);let i=new ba(e.text,e.text.nodeValue);i.flags|=8,this.pos=e.range.toB,o.append(i)}addInlineWidget(e,n,r){let o=this.afterWidget&&e.flags&48&&(this.afterWidget.flags&48)==(e.flags&48);o||this.flushBuffer();let a=this.ensureMarks(n,r);!o&&!(e.flags&16)&&a.append(this.getBuffer(1)),a.append(e),this.pos+=e.length,this.afterWidget=e}addMark(e,n,r){this.flushBuffer(),this.ensureMarks(n,r).append(e),this.pos+=e.length,this.afterWidget=null}addBlockWidget(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}continueWidget(e){let n=this.afterWidget||this.lastBlock;n.length+=e,this.pos+=e}addLineStart(e,n){var r;e||(e=RC);let o=tl.start(e,n||((r=this.cache.find(tl))===null||r===void 0?void 0:r.dom),!!n);this.getBlockPos().append(this.lastBlock=this.curLine=o)}addLine(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}addBreak(){this.lastBlock.flags|=1,this.endLine(),this.pos++}addLineStartIfNotCovered(e){this.blockPosCovered()||this.addLineStart(e)}ensureLine(e){this.curLine||this.addLineStart(e)}ensureMarks(e,n){var r;let o=this.curLine;for(let a=e.length-1;a>=0;a--){let i=e[a],l;if(n>0&&(l=o.lastChild)&&l instanceof qt&&l.mark.eq(i))o=l,n--;else{let s=qt.of(i,(r=this.cache.find(qt,f=>f.mark.eq(i)))===null||r===void 0?void 0:r.dom);o.append(s),o=s,n=0}}return o}endLine(){if(this.curLine){this.flushBuffer();let e=this.curLine.lastChild;(!e||!Ek(this.curLine,!1)||e.dom.nodeName!="BR"&&e.isWidget()&&!(P.ios&&Ek(this.curLine,!0)))&&this.curLine.append(this.cache.findWidget(Kx,0,32)||new va(Kx.toDOM(),0,Kx,32)),this.curLine=this.afterWidget=null}}updateBlockWrappers(){this.wrapperPos>this.pos+1e4&&(this.blockWrappers.goto(this.pos),this.wrappers.length=0);for(let e=this.wrappers.length-1;e>=0;e--)this.wrappers[e].to<this.pos&&this.wrappers.splice(e,1);for(let e=this.blockWrappers;e.value&&e.from<=this.pos;e.next())if(e.to>=this.pos){let n=e.rank*102+e.value.rank,r=new dg(e.from,e.to,e.value,n),o=this.wrappers.length;for(;o>0&&(this.wrappers[o-1].rank-r.rank||this.wrappers[o-1].to-r.to)<0;)o--;this.wrappers.splice(o,0,r)}this.wrapperPos=this.pos}getBlockPos(){var e;this.updateBlockWrappers();let n=this.root;for(let r of this.wrappers){let o=n.lastChild;if(r.from<this.pos&&o instanceof Rr&&o.wrapper.eq(r.wrapper))n=o;else{let a=Rr.of(r.wrapper,(e=this.cache.find(Rr,i=>i.wrapper.eq(r.wrapper)))===null||e===void 0?void 0:e.dom);n.append(a),n=a}}return n}blockPosCovered(){let e=this.lastBlock;return e!=null&&!e.breakAfter&&(!e.isWidget()||(e.flags&160)>0)}getBuffer(e){let n=2|(e<0?16:32),r=this.cache.find(nl,void 0,1);return r&&(r.flags=n),r||new nl(n)}flushBuffer(){this.afterWidget&&!(this.afterWidget.flags&32)&&(this.afterWidget.parent.append(this.getBuffer(-1)),this.afterWidget=null)}},mg=class{constructor(e){this.skipCount=0,this.text="",this.textOff=0,this.cursor=e.iter()}skip(e){this.textOff+e<=this.text.length?this.textOff+=e:(this.skipCount+=e-(this.text.length-this.textOff),this.text="",this.textOff=0)}next(e){if(this.textOff==this.text.length){let{value:o,lineBreak:a,done:i}=this.cursor.next(this.skipCount);if(this.skipCount=0,i)throw new Error("Ran out of text content when drawing inline views");this.text=o;let l=this.textOff=Math.min(e,o.length);return a?null:o.slice(0,l)}let n=Math.min(this.text.length,this.textOff+e),r=this.text.slice(this.textOff,n);return this.textOff=n,r}},Ku=[va,tl,ba,qt,nl,Rr,el];for(let t=0;t<Ku.length;t++)Ku[t].bucket=t;hg=class{constructor(e){this.view=e,this.buckets=Ku.map(()=>[]),this.index=Ku.map(()=>0),this.reused=new Map}add(e){let n=e.constructor.bucket,r=this.buckets[n];r.length<6?r.push(e):r[this.index[n]=(this.index[n]+1)%6]=e}find(e,n,r=2){let o=e.bucket,a=this.buckets[o],i=this.index[o];for(let l=0;l<a.length;l++){let s=(l+i)%a.length,f=a[s];if((!n||n(f))&&!this.reused.has(f))return a.splice(s,1),s<i&&this.index[o]--,this.reused.set(f,r),f}return null}findWidget(e,n,r){let o=this.buckets[0];if(o.length)for(let a=0,i=0;;a++){if(a==o.length){if(i)return null;i=1,a=0}let l=o[a];if(!this.reused.has(l)&&(i==0?l.widget.compare(e):l.widget.constructor==e.constructor&&e.updateDOM(l.dom,this.view,l.widget)))return o.splice(a,1),a<this.index[0]&&this.index[0]--,l.widget==e&&l.length==n&&(l.flags&497)==r?(this.reused.set(l,1),l):(this.reused.set(l,2),new va(l.dom,n,e,l.flags&-498|r))}}reuse(e){return this.reused.set(e,1),e}maybeReuse(e,n=2){if(!this.reused.has(e))return this.reused.set(e,n),e.dom}clear(){for(let e=0;e<this.buckets.length;e++)this.buckets[e].length=this.index[e]=0}},xg=class{constructor(e,n,r,o,a){this.view=e,this.decorations=o,this.disallowBlockEffectsFor=a,this.openWidget=!1,this.openMarks=0,this.cache=new hg(e),this.text=new mg(e.state.doc),this.builder=new pg(this.cache,new el(e,e.contentDOM),ce.iter(r)),this.cache.reused.set(n,2),this.old=new ug(n),this.reuseWalker={skip:(i,l,s)=>{if(this.cache.add(i),i.isComposite())return!1},enter:i=>this.cache.add(i),leave:()=>{},break:()=>{}}}run(e,n){let r=n&&this.getCompositionContext(n.text);for(let o=0,a=0,i=0;;){let l=i<e.length?e[i++]:null,s=l?l.fromA:this.old.root.length;if(s>o){let f=s-o;this.preserve(f,!i,!l),o=s,a+=f}if(!l)break;n&&l.fromA<=n.range.fromA&&l.toA>=n.range.toA?(this.forward(l.fromA,n.range.fromA,n.range.fromA<n.range.toA?1:-1),this.emit(a,n.range.fromB),this.builder.flushBuffer(),this.cache.clear(),this.builder.addComposition(n,r),this.text.skip(n.range.toB-n.range.fromB),this.forward(n.range.fromA,l.toA),this.emit(n.range.toB,l.toB)):(this.forward(l.fromA,l.toA),this.emit(a,l.toB)),a=l.toB,o=l.toA}return this.builder.curLine&&this.builder.endLine(),this.builder.root}preserve(e,n,r){let o=DF(this.old),a=this.openMarks;this.old.advance(e,r?1:-1,{skip:(i,l,s)=>{if(i.isWidget())if(this.openWidget)this.builder.continueWidget(s-l);else{let f=s>0||l<i.length?va.of(i.widget,this.view,s-l,i.flags&496,this.cache.maybeReuse(i)):this.cache.reuse(i);f.flags&256?(f.flags&=-2,this.builder.addBlockWidget(f)):(this.builder.ensureLine(null),this.builder.addInlineWidget(f,o,a),a=o.length)}else if(i.isText())this.builder.ensureLine(null),!l&&s==i.length&&!this.cache.reused.has(i)?this.builder.addText(i.text,o,a,this.cache.reuse(i)):(this.cache.add(i),this.builder.addText(i.text.slice(l,s),o,a)),a=o.length;else if(i.isLine())i.flags&=-2,this.cache.reused.set(i,1),this.builder.addLine(i);else if(i instanceof nl)this.cache.add(i);else if(i instanceof qt)this.builder.ensureLine(null),this.builder.addMark(i,o,a),this.cache.reused.set(i,1),a=o.length;else return!1;this.openWidget=!1},enter:i=>{i.isLine()?this.builder.addLineStart(i.attrs,this.cache.maybeReuse(i)):(this.cache.add(i),i instanceof qt&&o.unshift(i.mark)),this.openWidget=!1},leave:i=>{i.isLine()?o.length&&(o.length=a=0):i instanceof qt&&(o.shift(),a=Math.min(a,o.length))},break:()=>{this.builder.addBreak(),this.openWidget=!1}}),this.text.skip(e)}emit(e,n){let r=null,o=this.builder,a=-1,i=ce.spans(this.decorations,e,n,{point:(l,s,f,c,u,d)=>{if(f instanceof Ia){if(this.disallowBlockEffectsFor[d]){if(f.block)throw new RangeError("Block decorations may not be specified via plugins");if(s>this.view.state.doc.lineAt(l).to)throw new RangeError("Decorations that replace line breaks may not be specified via plugins")}if(a=c.length,u>c.length)o.continueWidget(s-l);else{let p=f.widget||(f.block?Ao.block:Ao.inline),h=TF(f),y=this.cache.findWidget(p,s-l,h)||va.of(p,this.view,s-l,h);f.block?(f.startSide>0&&o.addLineStartIfNotCovered(r),o.addBlockWidget(y)):(o.ensureLine(r),o.addInlineWidget(y,c,u))}r=null}else r=MF(r,f);s>l&&this.text.skip(s-l)},span:(l,s,f,c)=>{for(let u=l;u<s;){let d=this.text.next(Math.min(512,s-u));d==null?(o.addLineStartIfNotCovered(r),o.addBreak(),u++):(o.ensureLine(r),o.addText(d,f,u==l?c:f.length),u+=d.length),r=null}a=f.length}});a>-1&&(this.openWidget=i>a),this.openWidget||o.addLineStartIfNotCovered(r),this.openMarks=i}forward(e,n,r=1){n-e<=10?this.old.advance(n-e,r,this.reuseWalker):(this.old.advance(5,-1,this.reuseWalker),this.old.advance(n-e-10,-1),this.old.advance(5,r,this.reuseWalker))}getCompositionContext(e){let n=[],r=null;for(let o=e.parentNode;;o=o.parentNode){let a=Fe.get(o);if(o==this.view.contentDOM)break;a instanceof qt?n.push(a):a?.isLine()?r=a:a instanceof Rr||(o.nodeName=="DIV"&&!r?r=new tl(o,RC):r||n.push(qt.of(new Ys({tagName:o.nodeName.toLowerCase(),attributes:lF(o)}),o)))}return r?{line:r,marks:n}:null}};RC={class:"cm-line"};Ao=class extends Br{constructor(e){super(),this.tag=e}eq(e){return e.tag==this.tag}toDOM(){return document.createElement(this.tag)}updateDOM(e){return e.nodeName.toLowerCase()==this.tag}get isHidden(){return!0}};Ao.inline=new Ao("span");Ao.block=new Ao("div");Kx=new class extends Br{toDOM(){return document.createElement("br")}get isHidden(){return!0}get editable(){return!0}},Yu=class{constructor(e){this.view=e,this.decorations=[],this.blockWrappers=[],this.dynamicDecorationMap=[!1],this.domChanged=null,this.hasComposition=null,this.editContextFormatting=Y.none,this.lastCompositionAfterCursor=!1,this.minWidth=0,this.minWidthFrom=0,this.minWidthTo=0,this.impreciseAnchor=null,this.impreciseHead=null,this.forceSelection=!1,this.lastUpdate=Date.now(),this.updateDeco(),this.tile=new el(e,e.contentDOM),this.updateInner([new Bn(0,0,0,e.state.doc.length)],null)}update(e){var n;let r=e.changedRanges;this.minWidth>0&&r.length&&(r.every(({fromA:c,toA:u})=>u<this.minWidthFrom||c>this.minWidthTo)?(this.minWidthFrom=e.changes.mapPos(this.minWidthFrom,1),this.minWidthTo=e.changes.mapPos(this.minWidthTo,1)):this.minWidth=this.minWidthFrom=this.minWidthTo=0),this.updateEditContextFormatting(e);let o=-1;this.view.inputState.composing>=0&&!this.view.observer.editContext&&(!((n=this.domChanged)===null||n===void 0)&&n.newSel?o=this.domChanged.newSel.head:!qF(e.changes,this.hasComposition)&&!e.selectionSet&&(o=e.state.selection.main.head));let a=o>-1?RF(this.view,e.changes,o):null;if(this.domChanged=null,this.hasComposition){let{from:c,to:u}=this.hasComposition;r=new Bn(c,u,e.changes.mapPos(c,-1),e.changes.mapPos(u,1)).addToSet(r.slice())}this.hasComposition=a?{from:a.range.fromB,to:a.range.toB}:null,(P.ie||P.chrome)&&!a&&e&&e.state.doc.lines!=e.startState.doc.lines&&(this.forceSelection=!0);let i=this.decorations,l=this.blockWrappers;this.updateDeco();let s=FF(i,this.decorations,e.changes);s.length&&(r=Bn.extendWithRanges(r,s));let f=LF(l,this.blockWrappers,e.changes);return f.length&&(r=Bn.extendWithRanges(r,f)),a&&!r.some(c=>c.fromA<=a.range.fromA&&c.toA>=a.range.toA)&&(r=a.range.addToSet(r.slice())),this.tile.flags&2&&r.length==0?!1:(this.updateInner(r,a),e.transactions.length&&(this.lastUpdate=Date.now()),!0)}updateInner(e,n){this.view.viewState.mustMeasureContent=!0;let{observer:r}=this.view;r.ignore(()=>{if(n||e.length){let i=this.tile,l=new xg(this.view,i,this.blockWrappers,this.decorations,this.dynamicDecorationMap);n&&Fe.get(n.text)&&l.cache.reused.set(Fe.get(n.text),2),this.tile=l.run(e,n),gg(i,l.cache.reused)}this.tile.dom.style.height=this.view.viewState.contentHeight/this.view.scaleY+"px",this.tile.dom.style.flexBasis=this.minWidth?this.minWidth+"px":"";let a=P.chrome||P.ios?{node:r.selectionRange.focusNode,written:!1}:void 0;this.tile.sync(a),a&&(a.written||r.selectionRange.focusNode!=a.node||!this.tile.dom.contains(a.node))&&(this.forceSelection=!0),this.tile.dom.style.height=""});let o=[];if(this.view.viewport.from||this.view.viewport.to<this.view.state.doc.length)for(let a of this.tile.children)a.isWidget()&&a.widget instanceof Qs&&o.push(a.dom);r.updateGaps(o)}updateEditContextFormatting(e){this.editContextFormatting=this.editContextFormatting.map(e.changes);for(let n of e.transactions)for(let r of n.effects)r.is(CC)&&(this.editContextFormatting=r.value)}updateSelection(e=!1,n=!1){(e||!this.view.observer.selectionRange.focusNode)&&this.view.observer.readSelectionRange();let{dom:r}=this.tile,o=this.view.root.activeElement,a=o==r,i=!a&&!(this.view.state.facet(Or)||r.tabIndex>-1)&&Hs(r,this.view.observer.selectionRange)&&!(o&&r.contains(o));if(!(a||n||i))return;let l=this.forceSelection;this.forceSelection=!1;let s=this.view.state.selection.main,f,c;if(s.empty?c=f=this.inlineDOMNearPos(s.anchor,s.assoc||1):(c=this.inlineDOMNearPos(s.head,s.head==s.from?1:-1),f=this.inlineDOMNearPos(s.anchor,s.anchor==s.from?1:-1)),P.gecko&&s.empty&&!this.hasComposition&&OF(f)){let d=document.createTextNode("");this.view.observer.ignore(()=>f.node.insertBefore(d,f.node.childNodes[f.offset]||null)),f=c=new Zn(d,0),l=!0}let u=this.view.observer.selectionRange;(l||!u.focusNode||(!js(f.node,f.offset,u.anchorNode,u.anchorOffset)||!js(c.node,c.offset,u.focusNode,u.focusOffset))&&!this.suppressWidgetCursorChange(u,s))&&(this.view.observer.ignore(()=>{P.android&&P.chrome&&r.contains(u.focusNode)&&NF(u.focusNode,r)&&(r.blur(),r.focus({preventScroll:!0}));let d=$s(this.view.root);if(d)if(s.empty){if(P.gecko){let p=BF(f.node,f.offset);if(p&&p!=3){let h=(p==1?cC:uC)(f.node,f.offset);h&&(f=new Zn(h.node,h.offset))}}d.collapse(f.node,f.offset),s.bidiLevel!=null&&d.caretBidiLevel!==void 0&&(d.caretBidiLevel=s.bidiLevel)}else if(d.extend){d.collapse(f.node,f.offset);try{d.extend(c.node,c.offset)}catch{}}else{let p=document.createRange();s.anchor>s.head&&([f,c]=[c,f]),p.setEnd(c.node,c.offset),p.setStart(f.node,f.offset),d.removeAllRanges(),d.addRange(p)}i&&this.view.root.activeElement==r&&(r.blur(),o&&o.focus())}),this.view.observer.setSelectionRange(f,c)),this.impreciseAnchor=f.precise?null:new Zn(u.anchorNode,u.anchorOffset),this.impreciseHead=c.precise?null:new Zn(u.focusNode,u.focusOffset)}suppressWidgetCursorChange(e,n){return this.hasComposition&&n.empty&&js(e.focusNode,e.focusOffset,e.anchorNode,e.anchorOffset)&&this.posFromDOM(e.focusNode,e.focusOffset)==n.head}enforceCursorAssoc(){if(this.hasComposition)return;let{view:e}=this,n=e.state.selection.main,r=$s(e.root),{anchorNode:o,anchorOffset:a}=e.observer.selectionRange;if(!r||!n.empty||!n.assoc||!r.modify)return;let i=this.lineAt(n.head,n.assoc);if(!i)return;let l=i.posAtStart;if(n.head==l||n.head==l+i.length)return;let s=this.coordsAt(n.head,-1),f=this.coordsAt(n.head,1);if(!s||!f||s.bottom>f.top)return;let c=this.domAtPos(n.head+n.assoc,n.assoc);r.collapse(c.node,c.offset),r.modify("move",n.assoc<0?"forward":"backward","lineboundary"),e.observer.readSelectionRange();let u=e.observer.selectionRange;e.docView.posFromDOM(u.anchorNode,u.anchorOffset)!=n.from&&r.collapse(o,a)}posFromDOM(e,n){let r=this.tile.nearest(e);if(!r)return this.tile.dom.compareDocumentPosition(e)&2?0:this.view.state.doc.length;let o=r.posAtStart;if(r.isComposite()){let a;if(e==r.dom)a=r.dom.childNodes[n];else{let i=Er(e)==0?0:n==0?-1:1;for(;;){let l=e.parentNode;if(l==r.dom)break;i==0&&l.firstChild!=l.lastChild&&(e==l.firstChild?i=-1:i=1),e=l}i<0?a=e:a=e.nextSibling}if(a==r.dom.firstChild)return o;for(;a&&!Fe.get(a);)a=a.nextSibling;if(!a)return o+r.length;for(let i=0,l=o;;i++){let s=r.children[i];if(s.dom==a)return l;l+=s.length+s.breakAfter}}else return r.isText()?e==r.dom?o+n:o+(n?r.length:0):o}domAtPos(e,n){let{tile:r,offset:o}=this.tile.resolveBlock(e,n);return r.isWidget()?r.domPosFor(o,n):r.domIn(o,n)}inlineDOMNearPos(e,n){let r,o=-1,a=!1,i,l=-1,s=!1;return this.tile.blockTiles((f,c)=>{if(f.isWidget()){if(f.flags&32&&c>=e)return!0;f.flags&16&&(a=!0)}else{let u=c+f.length;if(c<=e&&(r=f,o=e-c,a=u<e),u>=e&&!i&&(i=f,l=e-c,s=c>e),c>e&&i)return!0}}),!r&&!i?this.domAtPos(e,n):(a&&i?r=null:s&&r&&(i=null),r&&n<0||!i?r.domIn(o,n):i.domIn(l,n))}coordsAt(e,n,r){let{tile:o,offset:a}=this.tile.resolveBlock(e,n);return o.isWidget()?o.widget instanceof Qs?null:o.coordsInWidget(a,n,!0):o.coordsIn(a,n,r)}lineAt(e,n){let{tile:r}=this.tile.resolveBlock(e,n);return r.isLine()?r:null}coordsForChar(e){let{tile:n,offset:r}=this.tile.resolveBlock(e,1);if(!n.isLine())return null;function o(a,i){if(a.isComposite())for(let l of a.children){if(l.length>=i){let s=o(l,i);if(s)return s}if(i-=l.length,i<0)break}else if(a.isText()&&i<a.length){let l=tt(a.text,i);if(l==i)return null;let s=ef(a.dom,i,l).getClientRects();for(let f=0;f<s.length;f++){let c=s[f];if(f==s.length-1||c.top<c.bottom&&c.left<c.right)return c}}return null}return o(n,r)}measureVisibleLineHeights(e){let n=[],{from:r,to:o}=e,a=this.view.contentDOM.clientWidth,i=a>Math.max(this.view.scrollDOM.clientWidth,this.minWidth)+1,l=-1,s=this.view.textDirection==ge.LTR,f=0,c=(u,d,p)=>{for(let h=0;h<u.children.length&&!(d>o);h++){let y=u.children[h],b=d+y.length,m=y.dom.getBoundingClientRect(),{height:g}=m;if(p&&!h&&(f+=m.top-p.top),y instanceof Rr)b>r&&c(y,d,m);else if(d>=r&&(f>0&&n.push(-f),n.push(g+f),f=0,i)){let x=y.dom.lastChild,I=x?Us(x):[];if(I.length){let v=I[I.length-1],w=s?v.right-m.left:m.right-v.left;w>l&&(l=w,this.minWidth=a,this.minWidthFrom=d,this.minWidthTo=b)}}p&&h==u.children.length-1&&(f+=p.bottom-m.bottom),d=b+y.breakAfter}};return c(this.tile,0,null),n}textDirectionAt(e){let{tile:n}=this.tile.resolveBlock(e,1);return getComputedStyle(n.dom).direction=="rtl"?ge.RTL:ge.LTR}measureTextSize(){let e=this.tile.blockTiles(i=>{if(i.isLine()&&i.children.length&&i.length<=20){let l=0,s;for(let f of i.children){if(!f.isText()||/[^ -~]/.test(f.text))return;let c=Us(f.dom);if(c.length!=1)return;l+=c[0].width,s=c[0].height}if(l)return{lineHeight:i.dom.getBoundingClientRect().height,charWidth:l/i.length,textHeight:s}}});if(e)return e;let n=document.createElement("div"),r,o,a;return n.className="cm-line",n.style.width="99999px",n.style.position="absolute",n.textContent="abc def ghi jkl mno pqr stu",this.view.observer.ignore(()=>{this.tile.dom.appendChild(n);let i=Us(n.firstChild)[0];r=n.getBoundingClientRect().height,o=i&&i.width?i.width/27:7,a=i&&i.height?i.height:r,n.remove()}),{lineHeight:r,charWidth:o,textHeight:a}}computeBlockGapDeco(){let e=[],n=this.view.viewState;for(let r=0,o=0;;o++){let a=o==n.viewports.length?null:n.viewports[o],i=a?a.from-1:this.view.state.doc.length;if(i>r){let l=(n.lineBlockAt(i).bottom-n.lineBlockAt(r).top)/this.view.scaleY;e.push(Y.replace({widget:new Qs(l),block:!0,inclusive:!0,isBlockGap:!0}).range(r,i))}if(!a)break;r=a.to+1}return Y.set(e)}updateDeco(){let e=1,n=this.view.state.facet(ad).map(a=>(this.dynamicDecorationMap[e++]=typeof a=="function")?a(this.view):a),r=!1,o=this.view.state.facet($g).map((a,i)=>{let l=typeof a=="function";return l&&(r=!0),l?a(this.view):a});for(o.length&&(this.dynamicDecorationMap[e++]=r,n.push(ce.join(o))),this.decorations=[this.editContextFormatting,...n,this.computeBlockGapDeco(),this.view.viewState.lineGapDeco];e<this.decorations.length;)this.dynamicDecorationMap[e++]=!1;this.blockWrappers=this.view.state.facet(TC).map(a=>typeof a=="function"?a(this.view):a)}scrollIntoView(e){if(e.isSnapshot){let f=this.view.viewState.lineBlockAt(e.range.head);this.view.scrollDOM.scrollTop=f.top-e.yMargin,this.view.scrollDOM.scrollLeft=e.xMargin;return}for(let f of this.view.state.facet(kC))try{if(f(this.view,e.range,e))return!0}catch(c){At(this.view.state,c,"scroll handler")}let{range:n}=e,r=this.coordsAt(n.head,n.assoc||(n.head>n.anchor?-1:1)),o;if(!r)return;!n.empty&&(o=this.coordsAt(n.anchor,n.anchor>n.head?-1:1))&&(r={left:Math.min(r.left,o.left),top:Math.min(r.top,o.top),right:Math.max(r.right,o.right),bottom:Math.max(r.bottom,o.bottom)});let a=Zg(this.view),i={left:r.left-a.left,top:r.top-a.top,right:r.right+a.right,bottom:r.bottom+a.bottom},{offsetWidth:l,offsetHeight:s}=this.view.scrollDOM;if(cF(this.view.scrollDOM,i,n.head<n.anchor?-1:1,e.x,e.y,Math.max(Math.min(e.xMargin,l),-l),Math.max(Math.min(e.yMargin,s),-s),this.view.textDirection==ge.LTR),window.visualViewport&&window.innerHeight-window.visualViewport.height>1&&(r.top>window.visualViewport.offsetTop+window.visualViewport.height||r.bottom<window.visualViewport.offsetTop)){let f=this.view.docView.lineAt(n.head,1);if(f){let c=iC(f.dom);f.dom.scrollIntoView({block:"nearest"}),lC(c,!1)}}}lineHasWidget(e){let n=r=>r.isWidget()||r.children.some(n);return n(this.tile.resolveBlock(e,1).tile)}destroy(){gg(this.tile)}};EF=class{constructor(){this.changes=[]}compareRange(e,n){Ki(e,n,this.changes)}comparePoint(e,n){Ki(e,n,this.changes)}boundChange(e){Ki(e,e,this.changes)}};yg=class{constructor(){this.changes=[]}compareRange(e,n){Ki(e,n,this.changes)}comparePoint(){}boundChange(e){Ki(e,e,this.changes)}};Qs=class extends Br{constructor(e){super(),this.height=e}toDOM(){let e=document.createElement("div");return e.className="cm-gap",this.updateDOM(e),e}eq(e){return e.height==this.height}updateDOM(e){return e.style.height=this.height+"px",!0}get editable(){return!0}get estimatedHeight(){return this.height}ignoreEvent(){return!1}};vn=class{constructor(e,n){this.pos=e,this.assoc=n}};Ig=class{constructor(e,n,r,o){this.view=e,this.x=n,this.y=r,this.baseDir=o,this.line=null,this.spans=null}bidiSpansAt(e){return(!this.line||this.line.from>e||this.line.to<e)&&(this.line=this.view.state.doc.lineAt(e),this.spans=this.view.bidiSpans(this.line)),this}baseDirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[wn.find(o,e-r.from,-1,n)].level==this.baseDir}dirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[wn.find(o,e-r.from,-1,n)].dir}bidiIn(e,n){let{spans:r,line:o}=this.bidiSpansAt(e);return r.length>1||r.length&&(r[0].level!=this.baseDir||r[0].to+o.from<n)}scan(e,n,r=!1){let o=0,a=e.length-1,i=new Set,l=this.bidiIn(e[0],e[a]),s,f,c=-1,u=1e9,d;e:for(;o<a;){let h=a-o,y=o+a>>1;t:if(i.has(y)){for(let g=1;g<h;g++){let x=y+g;if(x>=a&&(x-=h),!i.has(x)){y=x;break t}}break e}i.add(y);let b=n(y),m=0;if(b)for(let g=0;g<b.length;g++){let x=b[g];if(!(x.width==0&&b.length>1))if(x.bottom<this.y)(!s||s.bottom<x.bottom)&&(s=x),m=1;else if(x.top>this.y)(!f||f.top>x.top)&&(f=x),m=-1;else{let I=x.left>this.x?this.x-x.left:x.right<this.x?this.x-x.right:0,v=Math.abs(I);v<u&&(c=y,u=v,d=x),I&&(m=I<0==(this.baseDir==ge.LTR)?-1:1)}}m==-1&&(!l||this.baseDirAt(e[y],1))?a=y:m==1&&(!l||this.baseDirAt(e[y+1],-1))&&(o=y+1)}if(!d){if(!f&&!s)return{i:0,after:!1};let h=s&&(!f||this.y-s.bottom<f.top-this.y)?s:f;return this.y=(h.top+h.bottom)/2,this.scan(e,n,!0)}if(u&&!r){let{top:h,bottom:y}=d;if(s&&s.bottom>(h+h+y)/3)return this.y=s.bottom-1,this.scan(e,n,!0);if(f&&f.top<(h+y+y)/3)return this.y=f.top+1,this.scan(e,n,!0)}let p=(l?this.dirAt(e[c],1):this.baseDir)==ge.LTR;return{i:c,after:this.x>(d.left+d.right)/2==p}}scanText(e,n){let r=[];for(let a=0;a<e.length;a=tt(e.text,a))r.push(n+a);r.push(n+e.length);let o=this.scan(r,a=>{let i=r[a]-n,l=r[a+1]-n;return ef(e.dom,i,l).getClientRects()});return o.after?new vn(r[o.i+1],-1):new vn(r[o.i],1)}scanTile(e,n){if(!e.length)return new vn(n,1);if(e.children.length==1){let l=e.children[0];if(l.isText())return this.scanText(l,n);if(l.isComposite())return this.scanTile(l,n)}let r=[n];for(let l=0,s=n;l<e.children.length;l++)r.push(s+=e.children[l].length);let o=this.scan(r,l=>{let s=e.children[l];return s.flags&48?null:(nt(s.dom)?s.dom:ef(s.dom,0,s.length)).getClientRects()}),a=e.children[o.i],i=r[o.i];return a.isText()?this.scanText(a,i):a.isComposite()?this.scanTile(a,i):o.after?new vn(r[o.i+1],-1):new vn(i,1)}},Gi="\uFFFF",vg=class{constructor(e,n){this.points=e,this.view=n,this.text="",this.lineSeparator=n.state.facet(Ee.lineSeparator)}append(e){this.text+=e}lineBreak(){this.text+=Gi}readRange(e,n){if(!e)return this;let r=e.parentNode;for(let o=e;;){this.findPointBefore(r,o);let a=this.text.length;this.readNode(o);let i=Fe.get(o),l=o.nextSibling;if(l==n){i?.breakAfter&&!l&&r!=this.view.contentDOM&&this.lineBreak();break}let s=Fe.get(l);(i&&s?i.breakAfter:(i?i.breakAfter:Xu(o))||Xu(l)&&(o.nodeName!="BR"||i?.isWidget())&&this.text.length>a)&&!GF(l,n)&&this.lineBreak(),o=l}return this.findPointBefore(r,n),this}readTextNode(e){let n=e.nodeValue;for(let r of this.points)r.node==e&&(r.pos=this.text.length+Math.min(r.offset,n.length));for(let r=0,o=this.lineSeparator?null:/\r\n?|\n/g;;){let a=-1,i=1,l;if(this.lineSeparator?(a=n.indexOf(this.lineSeparator,r),i=this.lineSeparator.length):(l=o.exec(n))&&(a=l.index,i=l[0].length),this.append(n.slice(r,a<0?n.length:a)),a<0)break;if(this.lineBreak(),i>1)for(let s of this.points)s.node==e&&s.pos>this.text.length&&(s.pos-=i-1);r=a+i}}readNode(e){let n=Fe.get(e),r=n&&n.overrideDOMText;if(r!=null){this.findPointInside(e,r.length);for(let o=r.iter();!o.next().done;)o.lineBreak?this.lineBreak():this.append(o.value)}else Ji(e)?this.readTextNode(e):e.nodeName=="BR"?e.nextSibling&&this.lineBreak():nt(e)&&this.readRange(e.firstChild,null)}findPointBefore(e,n){for(let r of this.points)r.node==e&&e.childNodes[r.offset]==n&&(r.pos=this.text.length)}findPointInside(e,n){for(let r of this.points)(Ji(e)?r.node==e:e.contains(r.node))&&(r.pos=this.text.length+(VF(e,r.node,r.offset)?n:0))}};Ju=class{constructor(e,n){this.node=e,this.offset=n,this.pos=-1}},wg=class{constructor(e,n,r,o){this.typeOver=o,this.bounds=null,this.text="",this.domChanged=n>-1;let{impreciseHead:a,impreciseAnchor:i}=e.docView,l=e.state.selection;if(e.state.readOnly&&n>-1)this.newSel=null;else if(n>-1&&(this.bounds=FC(e.docView.tile,n,r,0))){let s=a||i?[]:XF(e),f=new vg(s,e);f.readRange(this.bounds.startDOM,this.bounds.endDOM),this.text=f.text,this.newSel=WF(s,this.bounds.from)}else{let s=e.observer.selectionRange,f=a&&a.node==s.focusNode&&a.offset==s.focusOffset||!ag(e.contentDOM,s.focusNode)?l.main.head:e.docView.posFromDOM(s.focusNode,s.focusOffset),c=i&&i.node==s.anchorNode&&i.offset==s.anchorOffset||!ag(e.contentDOM,s.anchorNode)?l.main.anchor:e.docView.posFromDOM(s.anchorNode,s.anchorOffset),u=e.viewport;if((P.ios||P.chrome)&&f!=c&&Math.min(f,c)<=l.main.from&&Math.max(f,c)>=l.main.to&&(u.from>0||u.to<e.state.doc.length)){let d=Math.min(f,c),p=Math.max(f,c),h=u.from-d,y=u.to-p;(h==0||h==1||d==0)&&(y==0||y==-1||p==e.state.doc.length)&&(f=0,c=e.state.doc.length)}if(e.inputState.composing>-1&&l.ranges.length>1)this.newSel=l.replaceRange(B.range(c,f));else if(e.lineWrapping&&c==f&&!(l.main.empty&&l.main.head==f)&&e.inputState.lastTouchTime>Date.now()-100){let d=e.coordsAtPos(f,-1),p=0;d&&(p=e.inputState.lastTouchY<=d.bottom?-1:1),this.newSel=B.create([B.cursor(f,p)])}else this.newSel=B.single(c,f)}}};kg=class{setSelectionOrigin(e){this.lastSelectionOrigin=e,this.lastSelectionTime=Date.now()}constructor(e){this.view=e,this.lastKeyCode=0,this.lastKeyTime=0,this.touchActive=!1,this.lastTouchTime=0,this.lastTouchX=0,this.lastTouchY=0,this.lastFocusTime=0,this.lastScrollTop=0,this.lastScrollLeft=0,this.lastWheelEvent=0,this.pendingIOSKey=void 0,this.lastIOSMomentumScroll=0,this.tabFocusMode=-1,this.lastSelectionOrigin=null,this.lastSelectionTime=0,this.lastContextMenu=0,this.scrollHandlers=[],this.handlers=Object.create(null),this.composing=-1,this.compositionFirstChange=null,this.compositionEndedAt=0,this.compositionPendingKey=!1,this.compositionPendingChange=!1,this.insertingText="",this.insertingTextAt=0,this.mouseSelection=null,this.draggedContent=null,this.handleEvent=this.handleEvent.bind(this),this.notifiedFocused=e.hasFocus,P.safari&&e.contentDOM.addEventListener("input",()=>null),P.gecko&&fL(e.contentDOM.ownerDocument)}handleEvent(e){!nL(this.view,e)||this.ignoreDuringComposition(e)||e.type=="keydown"&&this.keydown(e)||(this.view.updateState!=0?Promise.resolve().then(()=>this.runHandlers(e.type,e)):this.runHandlers(e.type,e))}runHandlers(e,n){let r=this.handlers[e];if(r){for(let o of r.observers)o(this.view,n);for(let o of r.handlers){if(n.defaultPrevented)break;if(o(this.view,n)){n.preventDefault();break}}}}ensureHandlers(e){let n=YF(e),r=this.handlers,o=this.view.contentDOM;for(let a in n)if(a!="scroll"){let i=!n[a].handlers.length,l=r[a];l&&i!=!l.handlers.length&&(o.removeEventListener(a,this.handleEvent),l=null),l||o.addEventListener(a,this.handleEvent,{passive:i})}for(let a in r)a!="scroll"&&!n[a]&&o.removeEventListener(a,this.handleEvent);this.handlers=n}keydown(e){if(this.lastKeyCode=e.keyCode,this.lastKeyTime=Date.now(),e.keyCode==9&&this.tabFocusMode>-1&&(!this.tabFocusMode||Date.now()<=this.tabFocusMode))return!0;if(this.tabFocusMode>0&&e.keyCode!=27&&PC.indexOf(e.keyCode)<0&&(this.tabFocusMode=-1),P.android&&P.chrome&&!e.synthetic&&(e.keyCode==13||e.keyCode==8))return this.view.observer.delayAndroidKey(e.key,e.keyCode),!0;if(P.ios&&!e.synthetic&&!e.altKey&&!e.metaKey&&(qC.some(n=>n.keyCode==e.keyCode)&&!e.ctrlKey||JF.indexOf(e.key)>-1&&e.ctrlKey)){let n={ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey};n.shiftKey&&P.ios&&!/^(off|none)$/.test(this.view.contentDOM.autocapitalize)&&KF(this.view.win)&&(n.shiftKey=!1);let r=this.pendingIOSKey={key:e.key,keyCode:e.keyCode,mods:n};return setTimeout(()=>{this.pendingIOSKey==r&&this.flushIOSKey()},50),!0}return e.keyCode!=229&&this.view.observer.forceFlush(),!1}flushIOSKey(e){let n=this.pendingIOSKey;return!n||this.view.observer.pendingRecords().length||n.key=="Enter"&&e&&e.from<e.to&&/^\S+$/.test(e.insert.toString())?!1:(this.pendingIOSKey=void 0,Yi(this.view.contentDOM,n.key,n.keyCode,n.mods))}ignoreDuringComposition(e){return!/^key/.test(e.type)||e.synthetic?!1:this.composing>0?!0:P.safari&&!P.ios&&this.compositionPendingKey&&Date.now()-this.compositionEndedAt<100?(this.compositionPendingKey=!1,!0):!1}startMouseSelection(e){this.mouseSelection&&this.mouseSelection.destroy(),this.mouseSelection=e}update(e){this.view.observer.update(e),this.mouseSelection&&this.mouseSelection.update(e),this.draggedContent&&e.docChanged&&(this.draggedContent=this.draggedContent.map(e.changes)),e.transactions.length&&(this.lastKeyCode=this.lastSelectionTime=0)}destroy(){this.mouseSelection&&this.mouseSelection.destroy()}};qC=[{key:"Backspace",keyCode:8,inputType:"deleteContentBackward"},{key:"Enter",keyCode:13,inputType:"insertParagraph"},{key:"Enter",keyCode:13,inputType:"insertLineBreak"},{key:"Delete",keyCode:46,inputType:"deleteContentForward"}],JF="dthko",PC=[16,17,18,20,91,92,224,225],Nu=6;Cg=class{constructor(e,n,r,o){this.view=e,this.startEvent=n,this.style=r,this.mustSelect=o,this.scrollSpeed={x:0,y:0},this.scrolling=-1,this.lastEvent=n,this.scrollParents=aC(e.contentDOM),this.atoms=e.state.facet(tf).map(i=>i(e));let a=e.contentDOM.ownerDocument;a.addEventListener("mousemove",this.move=this.move.bind(this)),a.addEventListener("mouseup",this.up=this.up.bind(this)),this.extend=n.shiftKey,this.multiple=e.state.facet(Ee.allowMultipleSelections)&&ZF(e,n),this.dragging=tL(e,n)&&HC(n)==1?null:!1}start(e){this.dragging===!1&&this.select(e)}move(e){if(e.buttons==0)return this.destroy();if(this.dragging||this.dragging==null&&$F(this.startEvent,e)<10)return;this.select(this.lastEvent=e);let n=0,r=0,o=0,a=0,i=this.view.win.innerWidth,l=this.view.win.innerHeight;this.scrollParents.x&&({left:o,right:i}=this.scrollParents.x.getBoundingClientRect()),this.scrollParents.y&&({top:a,bottom:l}=this.scrollParents.y.getBoundingClientRect());let s=Zg(this.view);e.clientX-s.left<=o+Nu?n=-qu(o-e.clientX):e.clientX+s.right>=i-Nu&&(n=qu(e.clientX-i)),e.clientY-s.top<=a+Nu?r=-qu(a-e.clientY):e.clientY+s.bottom>=l-Nu&&(r=qu(e.clientY-l)),this.setScrollSpeed(n,r)}up(e){this.dragging==null&&this.select(this.lastEvent),this.dragging||e.preventDefault(),this.destroy()}destroy(){this.setScrollSpeed(0,0);let e=this.view.contentDOM.ownerDocument;e.removeEventListener("mousemove",this.move),e.removeEventListener("mouseup",this.up),this.view.inputState.mouseSelection=this.view.inputState.draggedContent=null}setScrollSpeed(e,n){this.scrollSpeed={x:e,y:n},e||n?this.scrolling<0&&(this.scrolling=setInterval(()=>this.scroll(),50)):this.scrolling>-1&&(clearInterval(this.scrolling),this.scrolling=-1)}scroll(){let{x:e,y:n}=this.scrollSpeed;e&&this.scrollParents.x&&(this.scrollParents.x.scrollLeft+=e,e=0),n&&this.scrollParents.y&&(this.scrollParents.y.scrollTop+=n,n=0),(e||n)&&this.view.win.scrollBy(e,n),this.dragging===!1&&this.select(this.lastEvent)}select(e){let{view:n}=this,r=EC(this.atoms,this.style.get(e,this.extend,this.multiple));(this.mustSelect||!r.eq(n.state.selection,this.dragging===!1))&&this.view.dispatch({selection:r,userEvent:"select.pointer"}),this.mustSelect=!1}update(e){e.transactions.some(n=>n.isUserEvent("input.type"))?this.destroy():this.style.update(e)&&setTimeout(()=>this.select(this.lastEvent),20)}};En=Object.create(null),Tt=Object.create(null),_C=P.ie&&P.ie_version<15||P.ios&&P.webkit_version<604;Tt.scroll=t=>{let e=t.inputState;e.lastScrollTop=t.scrollDOM.scrollTop,e.lastScrollLeft=t.scrollDOM.scrollLeft,P.ios&&!e.touchActive&&(e.lastIOSMomentumScroll=Date.now())};Tt.wheel=Tt.mousewheel=t=>{t.inputState.lastWheelEvent=Date.now()};En.keydown=(t,e)=>(t.inputState.setSelectionOrigin("select"),e.keyCode==27&&t.inputState.tabFocusMode!=0&&(t.inputState.tabFocusMode=Date.now()+2e3),!1);Tt.touchstart=(t,e)=>{let n=t.inputState,r=e.targetTouches[0];n.touchActive=!0,n.lastTouchTime=Date.now(),r&&(n.lastTouchX=r.clientX,n.lastTouchY=r.clientY),n.setSelectionOrigin("select.pointer")};Tt.touchmove=t=>{t.inputState.setSelectionOrigin("select.pointer")};Tt.touchend=(t,e)=>{t.inputState.touchActive=!1};En.mousedown=(t,e)=>{if(t.observer.flush(),t.inputState.lastTouchTime>Date.now()-2e3)return!1;let n=null;for(let r of t.state.facet(bC))if(n=r(t,e),n)break;if(!n&&e.button==0&&(n=aL(t,e)),n){let r=!t.hasFocus;t.inputState.startMouseSelection(new Cg(t,e,n,r)),r&&t.observer.ignore(()=>{sC(t.contentDOM);let a=t.root.activeElement;a&&!a.contains(t.contentDOM)&&a.blur()});let o=t.inputState.mouseSelection;if(o)return o.start(e),o.dragging===!1}else t.inputState.setSelectionOrigin("select.pointer");return!1};oL=P.ie&&P.ie_version<=11,qk=null,Pk=0,_k=0;En.dragstart=(t,e)=>{let{selection:{main:n}}=t.state;if(e.target.draggable){let o=t.docView.tile.nearest(e.target);if(o&&o.isWidget()){let a=o.posAtStart,i=a+o.length;(a>=n.to||i<=n.from)&&(n=B.undirectionalRange(a,i))}}let{inputState:r}=t;return r.mouseSelection&&(r.mouseSelection.dragging=!0),r.draggedContent=n,e.dataTransfer&&(e.dataTransfer.setData("Text",id(t.state,Yg,t.state.sliceDoc(n.from,n.to))),e.dataTransfer.effectAllowed="copyMove"),!1};En.dragend=t=>(t.inputState.draggedContent=null,!1);En.drop=(t,e)=>{if(!e.dataTransfer)return!1;if(t.state.readOnly)return!0;let n=e.dataTransfer.files;if(n&&n.length){let r=Array(n.length),o=0,a=()=>{++o==n.length&&zk(t,e,r.filter(i=>i!=null).join(t.state.lineBreak),!1)};for(let i=0;i<n.length;i++){let l=new FileReader;l.onerror=a,l.onload=()=>{/[\x00-\x08\x0e-\x1f]{2}/.test(l.result)||(r[i]=l.result),a()},l.readAsText(n[i])}return!0}else{let r=e.dataTransfer.getData("Text");if(r)return zk(t,e,r,!0),!0}return!1};En.paste=(t,e)=>{if(t.state.readOnly)return!0;t.observer.flush();let n=_C?null:e.clipboardData;return n?(zC(t,n.getData("text/plain")||n.getData("text/uri-list")),!0):(rL(t),!1)};Ag=null;En.copy=En.cut=(t,e)=>{if(!Hs(t.contentDOM,t.observer.selectionRange))return!1;let{text:n,ranges:r,linewise:o}=sL(t.state);if(!n&&!o)return!1;Ag=o?n:null,e.type=="cut"&&!t.state.readOnly&&t.dispatch({changes:r,scrollIntoView:!0,userEvent:"delete.cut"});let a=_C?null:e.clipboardData;return a?(a.clearData(),a.setData("text/plain",n),!0):(lL(t,n),!1)};UC=Nt.define();Tt.focus=t=>{t.inputState.lastFocusTime=Date.now(),!t.scrollDOM.scrollTop&&(t.inputState.lastScrollTop||t.inputState.lastScrollLeft)&&(t.scrollDOM.scrollTop=t.inputState.lastScrollTop,t.scrollDOM.scrollLeft=t.inputState.lastScrollLeft),VC(t)};Tt.blur=t=>{t.observer.clearSelectionRange(),VC(t)};Tt.compositionstart=Tt.compositionupdate=(t,e)=>{if(!t.observer.editContext&&(t.inputState.compositionFirstChange==null&&(t.inputState.compositionFirstChange=!0),t.inputState.composing<0)){let{main:n}=t.state.selection;!n.empty&&t.lineBlockAt(n.from).from!=t.lineBlockAt(n.to).from&&!t.state.readOnly&&t.dispatch({changes:t.state.selection.ranges.filter(r=>!r.empty).map(r=>({from:r.from,to:r.to})),userEvent:"input"}),t.inputState.composing=0}};Tt.compositionend=t=>{t.observer.editContext||(t.inputState.composing=-1,t.inputState.compositionEndedAt=Date.now(),t.inputState.compositionPendingKey=!0,t.inputState.compositionPendingChange=t.observer.pendingRecords().length>0,t.inputState.compositionFirstChange=null,P.chrome&&P.android?t.observer.flushSoon():t.inputState.compositionPendingChange?Promise.resolve().then(()=>t.observer.flush()):setTimeout(()=>{t.inputState.composing<0&&t.docView.hasComposition&&t.update([])},50))};Tt.contextmenu=t=>{t.inputState.lastContextMenu=Date.now()};En.beforeinput=(t,e)=>{var n,r;if((e.inputType=="insertText"||e.inputType=="insertCompositionText")&&(t.inputState.insertingText=e.data,t.inputState.insertingTextAt=Date.now()),e.inputType=="insertReplacementText"&&t.observer.editContext){let a=(n=e.dataTransfer)===null||n===void 0?void 0:n.getData("text/plain"),i=e.getTargetRanges();if(a&&i.length){let l=i[0],s=t.posAtDOM(l.startContainer,l.startOffset),f=t.posAtDOM(l.endContainer,l.endOffset);return ey(t,{from:s,to:f,insert:t.state.toText(a)},null),!0}}let o;if(P.chrome&&P.android&&(o=qC.find(a=>a.inputType==e.inputType))&&(t.observer.delayAndroidKey(o.key,o.keyCode),o.key=="Backspace"||o.key=="Delete")){let a=((r=window.visualViewport)===null||r===void 0?void 0:r.height)||0;setTimeout(()=>{var i;(((i=window.visualViewport)===null||i===void 0?void 0:i.height)||0)>a+10&&t.hasFocus&&(t.contentDOM.blur(),t.focus())},100)}return P.ios&&e.inputType=="deleteContentForward"&&t.observer.flushSoon(),P.safari&&e.inputType=="insertText"&&t.inputState.composing>=0&&setTimeout(()=>Tt.compositionend(t,e),20),!1};Hk=new Set;Uk=["pre-wrap","normal","pre-line","break-spaces"],rl=!1;Tg=class{constructor(e){this.lineWrapping=e,this.doc=ne.empty,this.heightSamples={},this.lineHeight=14,this.charWidth=7,this.textHeight=14,this.lineLength=30}heightForGap(e,n){let r=this.doc.lineAt(n).number-this.doc.lineAt(e).number+1;return this.lineWrapping&&(r+=Math.max(0,Math.ceil((n-e-r*this.lineLength*.5)/this.lineLength))),this.lineHeight*r}heightForLine(e){return this.lineWrapping?(1+Math.max(0,Math.ceil((e-this.lineLength)/Math.max(1,this.lineLength-5))))*this.lineHeight:this.lineHeight}setDoc(e){return this.doc=e,this}mustRefreshForWrapping(e){return Uk.indexOf(e)>-1!=this.lineWrapping}mustRefreshForHeights(e){let n=!1;for(let r=0;r<e.length;r++){let o=e[r];o<0?r++:this.heightSamples[Math.floor(o*10)]||(n=!0,this.heightSamples[Math.floor(o*10)]=!0)}return n}refresh(e,n,r,o,a,i){let l=Uk.indexOf(e)>-1,s=Math.abs(n-this.lineHeight)>.3||this.lineWrapping!=l;if(this.lineWrapping=l,this.lineHeight=n,this.charWidth=r,this.textHeight=o,this.lineLength=a,s){this.heightSamples={};for(let f=0;f<i.length;f++){let c=i[f];c<0?f++:this.heightSamples[Math.floor(c*10)]=!0}}return s}},Mg=class{constructor(e,n){this.from=e,this.heights=n,this.index=0}get more(){return this.index<this.heights.length}},Rn=class t{constructor(e,n,r,o,a){this.from=e,this.length=n,this.top=r,this.height=o,this._content=a}get type(){return typeof this._content=="number"?Pt.Text:Array.isArray(this._content)?this._content:this._content.type}get to(){return this.from+this.length}get bottom(){return this.top+this.height}get widget(){return this._content instanceof Ia?this._content.widget:null}get widgetLineBreaks(){return typeof this._content=="number"?this._content:0}join(e){let n=(Array.isArray(this._content)?this._content:[this]).concat(Array.isArray(e._content)?e._content:[e]);return new t(this.from,this.length+e.length,this.top,this.height+e.height,n)}},Ie=(function(t){return t[t.ByPos=0]="ByPos",t[t.ByHeight=1]="ByHeight",t[t.ByPosNoHeight=2]="ByPosNoHeight",t})(Ie||(Ie={})),ju=.001,Zt=class t{constructor(e,n,r=2){this.length=e,this.height=n,this.flags=r}get outdated(){return(this.flags&2)>0}set outdated(e){this.flags=(e?2:0)|this.flags&-3}setHeight(e){this.height!=e&&(Math.abs(this.height-e)>ju&&(rl=!0),this.height=e)}replace(e,n,r){return t.of(r)}decomposeLeft(e,n){n.push(this)}decomposeRight(e,n){n.push(this)}applyChanges(e,n,r,o){let a=this,i=r.doc;for(let l=o.length-1;l>=0;l--){let{fromA:s,toA:f,fromB:c,toB:u}=o[l],d=a.lineAt(s,Ie.ByPosNoHeight,r.setDoc(n),0,0),p=d.to>=f?d:a.lineAt(f,Ie.ByPosNoHeight,r,0,0);for(u+=p.to-f,f=p.to;l>0&&d.from<=o[l-1].toA;)s=o[l-1].fromA,c=o[l-1].fromB,l--,s<d.from&&(d=a.lineAt(s,Ie.ByPosNoHeight,r,0,0));c+=d.from-s,s=d.from;let h=Og.build(r.setDoc(i),e,c,u);a=$u(a,a.replace(s,f,h))}return a.updateHeight(r,0)}static empty(){return new In(0,0,0)}static of(e){if(e.length==1)return e[0];let n=0,r=e.length,o=0,a=0;for(;;)if(n==r)if(o>a*2){let l=e[n-1];l.break?e.splice(--n,1,l.left,null,l.right):e.splice(--n,1,l.left,l.right),r+=1+l.break,o-=l.size}else if(a>o*2){let l=e[r];l.break?e.splice(r,1,l.left,null,l.right):e.splice(r,1,l.left,l.right),r+=2+l.break,a-=l.size}else break;else if(o<a){let l=e[n++];l&&(o+=l.size)}else{let l=e[--r];l&&(a+=l.size)}let i=!1;return e[n-1]==null?(i=!0,n--):e[n]==null&&(i=!0,r++),new Dg(t.of(e.slice(0,n)),i,t.of(e.slice(r)))}};Zt.prototype.size=1;cL=Y.replace({}),Zu=class extends Zt{constructor(e,n,r){super(e,n),this.deco=r,this.spaceAbove=0}mainBlock(e,n){return new Rn(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.deco||0)}blockAt(e,n,r,o){return this.spaceAbove&&e<r+this.spaceAbove?new Rn(o,0,r,this.spaceAbove,cL):this.mainBlock(r,o)}lineAt(e,n,r,o,a){let i=this.mainBlock(o,a);return this.spaceAbove?this.blockAt(0,r,o,a).join(i):i}forEachLine(e,n,r,o,a,i){e<=a+this.length&&n>=a&&i(this.lineAt(0,Ie.ByPos,r,o,a))}setMeasuredHeight(e){let n=e.heights[e.index++];n<0?(this.spaceAbove=-n,n=e.heights[e.index++]):this.spaceAbove=0,this.setHeight(n)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more&&this.setMeasuredHeight(o),this.outdated=!1,this}toString(){return`block(${this.length})`}},In=class t extends Zu{constructor(e,n,r){super(e,n,null),this.collapsed=0,this.widgetHeight=0,this.breaks=0,this.spaceAbove=r}mainBlock(e,n){return new Rn(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.breaks)}replace(e,n,r){let o=r[0];return r.length==1&&(o instanceof t||o instanceof ko&&o.flags&4)&&Math.abs(this.length-o.length)<10?(o instanceof ko?o=new t(o.length,this.height,this.spaceAbove):o.height=this.height,this.outdated||(o.outdated=!1),o):Zt.of(r)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more?this.setMeasuredHeight(o):(r||this.outdated)&&(this.spaceAbove=0,this.setHeight(Math.max(this.widgetHeight,e.heightForLine(this.length-this.collapsed))+this.breaks*e.lineHeight)),this.outdated=!1,this}toString(){return`line(${this.length}${this.collapsed?-this.collapsed:""}${this.widgetHeight?":"+this.widgetHeight:""})`}},ko=class t extends Zt{constructor(e){super(e,0)}heightMetrics(e,n){let r=e.doc.lineAt(n).number,o=e.doc.lineAt(n+this.length).number,a=o-r+1,i,l=0;if(e.lineWrapping){let s=Math.min(this.height,e.lineHeight*a);i=s/a,this.length>a+1&&(l=(this.height-s)/(this.length-a-1))}else i=this.height/a;return{firstLine:r,lastLine:o,perLine:i,perChar:l}}blockAt(e,n,r,o){let{firstLine:a,lastLine:i,perLine:l,perChar:s}=this.heightMetrics(n,o);if(n.lineWrapping){let f=o+(e<n.lineHeight?0:Math.round(Math.max(0,Math.min(1,(e-r)/this.height))*this.length)),c=n.doc.lineAt(f),u=l+c.length*s,d=Math.max(r,e-u/2);return new Rn(c.from,c.length,d,u,0)}else{let f=Math.max(0,Math.min(i-a,Math.floor((e-r)/l))),{from:c,length:u}=n.doc.line(a+f);return new Rn(c,u,r+l*f,l,0)}}lineAt(e,n,r,o,a){if(n==Ie.ByHeight)return this.blockAt(e,r,o,a);if(n==Ie.ByPosNoHeight){let{from:p,to:h}=r.doc.lineAt(e);return new Rn(p,h-p,0,0,0)}let{firstLine:i,perLine:l,perChar:s}=this.heightMetrics(r,a),f=r.doc.lineAt(e),c=l+f.length*s,u=f.number-i,d=o+l*u+s*(f.from-a-u);return new Rn(f.from,f.length,Math.max(o,Math.min(d,o+this.height-c)),c,0)}forEachLine(e,n,r,o,a,i){e=Math.max(e,a),n=Math.min(n,a+this.length);let{firstLine:l,perLine:s,perChar:f}=this.heightMetrics(r,a);for(let c=e,u=o;c<=n;){let d=r.doc.lineAt(c);if(c==e){let h=d.number-l;u+=s*h+f*(e-a-h)}let p=s+f*d.length;i(new Rn(d.from,d.length,u,p,0)),u+=p,c=d.to+1}}replace(e,n,r){let o=this.length-n;if(o>0){let a=r[r.length-1];a instanceof t?r[r.length-1]=new t(a.length+o):r.push(null,new t(o-1))}if(e>0){let a=r[0];a instanceof t?r[0]=new t(e+a.length):r.unshift(new t(e-1),null)}return Zt.of(r)}decomposeLeft(e,n){n.push(new t(e-1),null)}decomposeRight(e,n){n.push(null,new t(this.length-e-1))}updateHeight(e,n=0,r=!1,o){let a=n+this.length;if(o&&o.from<=n+this.length&&o.more){let i=[],l=Math.max(n,o.from),s=-1;for(o.from>n&&i.push(new t(o.from-n-1).updateHeight(e,n));l<=a&&o.more;){let c=e.doc.lineAt(l).length;i.length&&i.push(null);let u=o.heights[o.index++],d=0;u<0&&(d=-u,u=o.heights[o.index++]),s==-1?s=u:Math.abs(u-s)>=ju&&(s=-2);let p=new In(c,u,d);p.outdated=!1,i.push(p),l+=c+1}l<=a&&i.push(null,new t(a-l).updateHeight(e,l));let f=Zt.of(i);return(s<0||Math.abs(f.height-this.height)>=ju||Math.abs(s-this.heightMetrics(e,n).perLine)>=ju)&&(rl=!0),$u(this,f)}else(r||this.outdated)&&(this.setHeight(e.heightForGap(n,n+this.length)),this.outdated=!1);return this}toString(){return`gap(${this.length})`}},Dg=class extends Zt{constructor(e,n,r){super(e.length+(n?1:0)+r.length,e.height+r.height,(n?1:0)|(e.outdated||r.outdated?2:0)),this.left=e,this.right=r,this.size=e.size+r.size}get break(){return this.flags&1}blockAt(e,n,r,o){let a=r+this.left.height;return e<a?this.left.blockAt(e,n,r,o):this.right.blockAt(e,n,a,o+this.left.length+this.break)}lineAt(e,n,r,o,a){let i=o+this.left.height,l=a+this.left.length+this.break,s=n==Ie.ByHeight?e<i:e<l,f=s?this.left.lineAt(e,n,r,o,a):this.right.lineAt(e,n,r,i,l);if(this.break||(s?f.to<l:f.from>l))return f;let c=n==Ie.ByPosNoHeight?Ie.ByPosNoHeight:Ie.ByPos;return s?f.join(this.right.lineAt(l,c,r,i,l)):this.left.lineAt(l,c,r,o,a).join(f)}forEachLine(e,n,r,o,a,i){let l=o+this.left.height,s=a+this.left.length+this.break;if(this.break)e<s&&this.left.forEachLine(e,n,r,o,a,i),n>=s&&this.right.forEachLine(e,n,r,l,s,i);else{let f=this.lineAt(s,Ie.ByPos,r,o,a);e<f.from&&this.left.forEachLine(e,Math.min(n,f.from-1),r,o,a,i),f.to>=e&&f.from<=n&&i(f),n>f.to&&this.right.forEachLine(Math.max(e,f.to+1),n,r,l,s,i)}}replace(e,n,r){let o=this.left.length+this.break;if(n<o)return this.balanced(this.left.replace(e,n,r),this.right);if(e>this.left.length)return this.balanced(this.left,this.right.replace(e-o,n-o,r));let a=[];e>0&&this.decomposeLeft(e,a);let i=a.length;for(let l of r)a.push(l);if(e>0&&Vk(a,i-1),n<this.length){let l=a.length;this.decomposeRight(n,a),Vk(a,l)}return Zt.of(a)}decomposeLeft(e,n){let r=this.left.length;if(e<=r)return this.left.decomposeLeft(e,n);n.push(this.left),this.break&&(r++,e>=r&&n.push(null)),e>r&&this.right.decomposeLeft(e-r,n)}decomposeRight(e,n){let r=this.left.length,o=r+this.break;if(e>=o)return this.right.decomposeRight(e-o,n);e<r&&this.left.decomposeRight(e,n),this.break&&e<o&&n.push(null),n.push(this.right)}balanced(e,n){return e.size>2*n.size||n.size>2*e.size?Zt.of(this.break?[e,null,n]:[e,n]):(this.left=$u(this.left,e),this.right=$u(this.right,n),this.setHeight(e.height+n.height),this.outdated=e.outdated||n.outdated,this.size=e.size+n.size,this.length=e.length+this.break+n.length,this)}updateHeight(e,n=0,r=!1,o){let{left:a,right:i}=this,l=n+a.length+this.break,s=null;return o&&o.from<=n+a.length&&o.more?s=a=a.updateHeight(e,n,r,o):a.updateHeight(e,n,r),o&&o.from<=l+i.length&&o.more?s=i=i.updateHeight(e,l,r,o):i.updateHeight(e,l,r),s?this.balanced(a,i):(this.height=this.left.height+this.right.height,this.outdated=!1,this)}toString(){return this.left+(this.break?" ":"-")+this.right}};uL=5,Og=class t{constructor(e,n){this.pos=e,this.oracle=n,this.nodes=[],this.lineStart=-1,this.lineEnd=-1,this.covering=null,this.writtenTo=e}get isCovered(){return this.covering&&this.nodes[this.nodes.length-1]==this.covering}span(e,n){if(this.lineStart>-1){let r=Math.min(n,this.lineEnd),o=this.nodes[this.nodes.length-1];o instanceof In?o.length+=r-this.pos:(r>this.pos||!this.isCovered)&&this.nodes.push(new In(r-this.pos,-1,0)),this.writtenTo=r,n>r&&(this.nodes.push(null),this.writtenTo++,this.lineStart=-1)}this.pos=n}point(e,n,r){if(e<n||r.heightRelevant){let o=r.widget?r.widget.estimatedHeight:0,a=r.widget?r.widget.lineBreaks:0;o<0&&(o=this.oracle.lineHeight);let i=n-e;r.block?this.addBlock(new Zu(i,o,r)):(i||a||o>=uL)&&this.addLineDeco(o,a,i)}else n>e&&this.span(e,n);this.lineEnd>-1&&this.lineEnd<this.pos&&(this.lineEnd=this.oracle.doc.lineAt(this.pos).to)}enterLine(){if(this.lineStart>-1)return;let{from:e,to:n}=this.oracle.doc.lineAt(this.pos);this.lineStart=e,this.lineEnd=n,this.writtenTo<e&&((this.writtenTo<e-1||this.nodes[this.nodes.length-1]==null)&&this.nodes.push(this.blankContent(this.writtenTo,e-1)),this.nodes.push(null)),this.pos>e&&this.nodes.push(new In(this.pos-e,-1,0)),this.writtenTo=this.pos}blankContent(e,n){let r=new ko(n-e);return this.oracle.doc.lineAt(e).to==n&&(r.flags|=4),r}ensureLine(){this.enterLine();let e=this.nodes.length?this.nodes[this.nodes.length-1]:null;if(e instanceof In)return e;let n=new In(0,-1,0);return this.nodes.push(n),n}addBlock(e){this.enterLine();let n=e.deco;n&&n.startSide>0&&!this.isCovered&&this.ensureLine(),this.nodes.push(e),this.writtenTo=this.pos=this.pos+e.length,n&&n.endSide>0&&(this.covering=e)}addLineDeco(e,n,r){let o=this.ensureLine();o.length+=r,o.collapsed+=r,o.widgetHeight=Math.max(o.widgetHeight,e),o.breaks+=n,this.writtenTo=this.pos=this.pos+r}finish(e){let n=this.nodes.length==0?null:this.nodes[this.nodes.length-1];this.lineStart>-1&&!(n instanceof In)&&!this.isCovered?this.nodes.push(new In(0,-1,0)):(this.writtenTo<this.pos||n==null)&&this.nodes.push(this.blankContent(this.writtenTo,this.pos));let r=e;for(let o of this.nodes)o instanceof In&&o.updateHeight(this.oracle,r),r+=o?o.length:1;return this.nodes}static build(e,n,r,o){let a=new t(r,e);return ce.spans(n,r,o,a,0),a.finish(r)}};Rg=class{constructor(){this.changes=[]}compareRange(){}comparePoint(e,n,r,o){(e<n||r&&r.heightRelevant||o&&o.heightRelevant)&&Ki(e,n,this.changes,5)}};Ws=class{constructor(e,n,r,o){this.from=e,this.to=n,this.size=r,this.displaySize=o}static same(e,n){if(e.length!=n.length)return!1;for(let r=0;r<e.length;r++){let o=e[r],a=n[r];if(o.from!=a.from||o.to!=a.to||o.size!=a.size)return!1}return!0}draw(e,n){return Y.replace({widget:new Bg(this.displaySize*(n?e.scaleY:e.scaleX),n)}).range(this.from,this.to)}},Bg=class extends Br{constructor(e,n){super(),this.size=e,this.vertical=n}eq(e){return e.size==this.size&&e.vertical==this.vertical}toDOM(){let e=document.createElement("div");return this.vertical?e.style.height=this.size+"px":(e.style.width=this.size+"px",e.style.height="2px",e.style.display="inline-block"),e}get estimatedHeight(){return this.vertical?this.size:-1}},ed=class{constructor(e,n){this.view=e,this.state=n,this.pixelViewport={left:0,right:window.innerWidth,top:0,bottom:0},this.inView=!0,this.paddingTop=0,this.paddingBottom=0,this.contentDOMWidth=0,this.contentDOMHeight=0,this.editorHeight=0,this.editorWidth=0,this.scaleX=1,this.scaleY=1,this.scrollOffset=0,this.scrolledToBottom=!1,this.scrollAnchorPos=0,this.scrollAnchorHeight=-1,this.scaler=Eg,this.scrollTarget=null,this.printing=!1,this.mustMeasureContent=!0,this.defaultTextDirection=ge.LTR,this.visibleRanges=[],this.mustEnforceCursorAssoc=!1;let r=n.facet(Jg).some(o=>typeof o!="function"&&o.class=="cm-lineWrapping");this.heightOracle=new Tg(r),this.stateDeco=Gk(n),this.heightMap=Zt.empty().applyChanges(this.stateDeco,ne.empty,this.heightOracle.setDoc(n.doc),[new Bn(0,0,0,n.doc.length)]);for(let o=0;o<2&&(this.viewport=this.getViewport(0,null),!!this.updateForViewport());o++);this.updateViewportLines(),this.lineGaps=this.ensureLineGaps([]),this.lineGapDeco=Y.set(this.lineGaps.map(o=>o.draw(this,!1))),this.scrollParent=e.scrollDOM,this.computeVisibleRanges()}updateForViewport(){let e=[this.viewport],{main:n}=this.state.selection;for(let r=0;r<=1;r++){let o=r?n.head:n.anchor;if(!e.some(({from:a,to:i})=>o>=a&&o<=i)){let{from:a,to:i}=this.lineBlockAt(o);e.push(new Xi(a,i))}}return this.viewports=e.sort((r,o)=>r.from-o.from),this.updateScaler()}updateScaler(){let e=this.scaler;return this.scaler=this.heightMap.height<=7e6?Eg:Fg.get(this.heightOracle,this.heightMap,this.viewports),e.eq(this.scaler)?0:2}updateViewportLines(){this.viewportLines=[],this.heightMap.forEachLine(this.viewport.from,this.viewport.to,this.heightOracle.setDoc(this.state.doc),0,0,e=>{this.viewportLines.push(zs(e,this.scaler))})}update(e,n=null){this.state=e.state;let r=this.stateDeco;this.stateDeco=Gk(this.state);let o=e.changedRanges,a=Bn.extendWithRanges(o,dL(r,this.stateDeco,e?e.changes:kt.empty(this.state.doc.length))),i=this.heightMap.height,l=this.scrolledToBottom?null:this.scrollAnchorAt(this.scrollOffset);jk(),this.heightMap=this.heightMap.applyChanges(this.stateDeco,e.startState.doc,this.heightOracle.setDoc(this.state.doc),a),(this.heightMap.height!=i||rl)&&(e.flags|=2),l?(this.scrollAnchorPos=e.changes.mapPos(l.from,-1),this.scrollAnchorHeight=l.top):(this.scrollAnchorPos=-1,this.scrollAnchorHeight=i);let s=a.length?this.mapViewport(this.viewport,e.changes):this.viewport;(n&&(n.range.head<s.from||n.range.head>s.to)||!this.viewportIsAppropriate(s))&&(s=this.getViewport(0,n));let f=s.from!=this.viewport.from||s.to!=this.viewport.to;this.viewport=s,e.flags|=this.updateForViewport(),(f||!e.changes.empty||e.flags&2)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps,e.changes))),e.flags|=this.computeVisibleRanges(e.changes),n&&(this.scrollTarget=n),!this.mustEnforceCursorAssoc&&(e.selectionSet||e.focusChanged)&&e.view.lineWrapping&&e.state.selection.main.empty&&e.state.selection.main.assoc&&!e.state.facet(wF)&&(this.mustEnforceCursorAssoc=!0)}measure(){let{view:e}=this,n=e.contentDOM,r=window.getComputedStyle(n),o=this.heightOracle,a=r.whiteSpace;this.defaultTextDirection=r.direction=="rtl"?ge.RTL:ge.LTR;let i=this.heightOracle.mustRefreshForWrapping(a)||this.mustMeasureContent==="refresh",l=n.getBoundingClientRect(),s=i||this.mustMeasureContent||this.contentDOMHeight!=l.height;this.contentDOMHeight=l.height,this.mustMeasureContent=!1;let f=0,c=0;if(l.width&&l.height){let{scaleX:v,scaleY:w}=oC(n,l);(v>.005&&Math.abs(this.scaleX-v)>.005||w>.005&&Math.abs(this.scaleY-w)>.005)&&(this.scaleX=v,this.scaleY=w,f|=16,i=s=!0)}let u=(parseInt(r.paddingTop)||0)*this.scaleY,d=(parseInt(r.paddingBottom)||0)*this.scaleY;(this.paddingTop!=u||this.paddingBottom!=d)&&(this.paddingTop=u,this.paddingBottom=d,f|=18),this.editorWidth!=e.scrollDOM.clientWidth&&(o.lineWrapping&&(s=!0),this.editorWidth=e.scrollDOM.clientWidth,f|=16);let p=aC(this.view.contentDOM,!1).y;p!=this.scrollParent&&(this.scrollParent=p,this.scrollAnchorHeight=-1,this.scrollOffset=0);let h=this.getScrollOffset();this.scrollOffset!=h&&(this.scrollAnchorHeight=-1,this.scrollOffset=h),this.scrolledToBottom=fC(this.scrollParent||e.win);let y=(this.printing?hL:pL)(n,this.paddingTop),b=y.top-this.pixelViewport.top,m=y.bottom-this.pixelViewport.bottom;this.pixelViewport=y;let g=this.pixelViewport.bottom>this.pixelViewport.top&&this.pixelViewport.right>this.pixelViewport.left;if(g!=this.inView&&(this.inView=g,g&&(s=!0)),!this.inView&&!this.scrollTarget&&!mL(e.dom))return 0;let x=l.width;if((this.contentDOMWidth!=x||this.editorHeight!=e.scrollDOM.clientHeight)&&(this.contentDOMWidth=l.width,this.editorHeight=e.scrollDOM.clientHeight,f|=16),s){let v=e.docView.measureVisibleLineHeights(this.viewport);if(o.mustRefreshForHeights(v)&&(i=!0),i||o.lineWrapping&&Math.abs(x-this.contentDOMWidth)>o.charWidth){let{lineHeight:w,charWidth:S,textHeight:k}=e.docView.measureTextSize();i=w>0&&o.refresh(a,w,S,k,Math.max(5,x/S),v),i&&(e.docView.minWidth=0,f|=16)}b>0&&m>0?c=Math.max(b,m):b<0&&m<0&&(c=Math.min(b,m)),jk();for(let w of this.viewports){let S=w.from==this.viewport.from?v:e.docView.measureVisibleLineHeights(w);this.heightMap=(i?Zt.empty().applyChanges(this.stateDeco,ne.empty,this.heightOracle,[new Bn(0,0,0,e.state.doc.length)]):this.heightMap).updateHeight(o,0,i,new Mg(w.from,S))}rl&&(f|=2)}let I=!this.viewportIsAppropriate(this.viewport,c)||this.scrollTarget&&(this.scrollTarget.range.head<this.viewport.from||this.scrollTarget.range.head>this.viewport.to);return I&&(f&2&&(f|=this.updateScaler()),this.viewport=this.getViewport(c,this.scrollTarget),f|=this.updateForViewport()),(f&2||I)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(i?[]:this.lineGaps,e)),f|=this.computeVisibleRanges(),this.mustEnforceCursorAssoc&&(this.mustEnforceCursorAssoc=!1,e.docView.enforceCursorAssoc()),f}get visibleTop(){return this.scaler.fromDOM(this.pixelViewport.top)}get visibleBottom(){return this.scaler.fromDOM(this.pixelViewport.bottom)}getViewport(e,n){let r=.5-Math.max(-.5,Math.min(.5,e/1e3/2)),o=this.heightMap,a=this.heightOracle,{visibleTop:i,visibleBottom:l}=this,s=new Xi(o.lineAt(i-r*1e3,Ie.ByHeight,a,0,0).from,o.lineAt(l+(1-r)*1e3,Ie.ByHeight,a,0,0).to);if(n){let{head:f}=n.range;if(f<s.from||f>s.to){let c=Math.min(this.editorHeight,this.pixelViewport.bottom-this.pixelViewport.top),u=o.lineAt(f,Ie.ByPos,a,0,0),d;n.y=="center"?d=(u.top+u.bottom)/2-c/2:n.y=="start"||n.y=="nearest"&&f<s.from?d=u.top:d=u.bottom-c,s=new Xi(o.lineAt(d-1e3/2,Ie.ByHeight,a,0,0).from,o.lineAt(d+c+1e3/2,Ie.ByHeight,a,0,0).to)}}return s}mapViewport(e,n){let r=n.mapPos(e.from,-1),o=n.mapPos(e.to,1);return new Xi(this.heightMap.lineAt(r,Ie.ByPos,this.heightOracle,0,0).from,this.heightMap.lineAt(o,Ie.ByPos,this.heightOracle,0,0).to)}viewportIsAppropriate({from:e,to:n},r=0){if(!this.inView)return!0;let{top:o}=this.heightMap.lineAt(e,Ie.ByPos,this.heightOracle,0,0),{bottom:a}=this.heightMap.lineAt(n,Ie.ByPos,this.heightOracle,0,0),{visibleTop:i,visibleBottom:l}=this;return(e==0||o<=i-Math.max(10,Math.min(-r,250)))&&(n==this.state.doc.length||a>=l+Math.max(10,Math.min(r,250)))&&o>i-2*1e3&&a<l+2*1e3}mapLineGaps(e,n){if(!e.length||n.empty)return e;let r=[];for(let o of e)n.touchesRange(o.from,o.to)||r.push(new Ws(n.mapPos(o.from),n.mapPos(o.to),o.size,o.displaySize));return r}ensureLineGaps(e,n){let r=this.heightOracle.lineWrapping,o=r?1e4:2e3,a=o>>1,i=o<<1;if(this.defaultTextDirection!=ge.LTR&&!r)return[];let l=[],s=(c,u,d,p)=>{if(u-c<a)return;let h=this.state.selection.main,y=[h.from];h.empty||y.push(h.to);for(let m of y)if(m>c&&m<u){s(c,m-10,d,p),s(m+10,u,d,p);return}let b=gL(e,m=>m.from>=d.from&&m.to<=d.to&&Math.abs(m.from-c)<a&&Math.abs(m.to-u)<a&&!y.some(g=>m.from<g&&m.to>g));if(!b){if(u<d.to&&n&&r&&n.visibleRanges.some(x=>x.from<=u&&x.to>=u)){let x=n.moveToLineBoundary(B.cursor(u),!1,!0).head;x>c&&(u=x)}let m=this.gapSize(d,c,u,p),g=r||m<2e6?m:2e6;b=new Ws(c,u,m,g)}l.push(b)},f=c=>{if(c.length<i||c.type!=Pt.Text)return;let u=xL(c.from,c.to,this.stateDeco);if(u.total<i)return;let d=this.scrollTarget?this.scrollTarget.range.head:null,p,h;if(r){let y=o/this.heightOracle.lineLength*this.heightOracle.lineHeight,b,m;if(d!=null){let g=_u(u,d),x=((this.visibleBottom-this.visibleTop)/2+y)/c.height;b=g-x,m=g+x}else b=(this.visibleTop-c.top-y)/c.height,m=(this.visibleBottom-c.top+y)/c.height;p=Pu(u,b),h=Pu(u,m)}else{let y=u.total*this.heightOracle.charWidth,b=o*this.heightOracle.charWidth,m=0;if(y>2e6)for(let w of e)w.from>=c.from&&w.from<c.to&&w.size!=w.displaySize&&w.from*this.heightOracle.charWidth+m<this.pixelViewport.left&&(m=w.size-w.displaySize);let g=this.pixelViewport.left+m,x=this.pixelViewport.right+m,I,v;if(d!=null){let w=_u(u,d),S=((x-g)/2+b)/y;I=w-S,v=w+S}else I=(g-b)/y,v=(x+b)/y;p=Pu(u,I),h=Pu(u,v)}p>c.from&&s(c.from,p,c,u),h<c.to&&s(h,c.to,c,u)};for(let c of this.viewportLines)Array.isArray(c.type)?c.type.forEach(f):f(c);return l}gapSize(e,n,r,o){let a=_u(o,r)-_u(o,n);return this.heightOracle.lineWrapping?e.height*a:o.total*this.heightOracle.charWidth*a}updateLineGaps(e){Ws.same(e,this.lineGaps)||(this.lineGaps=e,this.lineGapDeco=Y.set(e.map(n=>n.draw(this,this.heightOracle.lineWrapping))))}computeVisibleRanges(e){let n=this.stateDeco;this.lineGaps.length&&(n=n.concat(this.lineGapDeco));let r=[];ce.spans(n,this.viewport.from,this.viewport.to,{span(a,i){r.push({from:a,to:i})},point(){}},20);let o=0;if(r.length!=this.visibleRanges.length)o=12;else for(let a=0;a<r.length&&!(o&8);a++){let i=this.visibleRanges[a],l=r[a];(i.from!=l.from||i.to!=l.to)&&(o|=4,e&&e.mapPos(i.from,-1)==l.from&&e.mapPos(i.to,1)==l.to||(o|=8))}return this.visibleRanges=r,o}lineBlockAt(e){return e>=this.viewport.from&&e<=this.viewport.to&&this.viewportLines.find(n=>n.from<=e&&n.to>=e)||zs(this.heightMap.lineAt(e,Ie.ByPos,this.heightOracle,0,0),this.scaler)}lineBlockAtHeight(e){return e>=this.viewportLines[0].top&&e<=this.viewportLines[this.viewportLines.length-1].bottom&&this.viewportLines.find(n=>n.top<=e&&n.bottom>=e)||zs(this.heightMap.lineAt(this.scaler.fromDOM(e),Ie.ByHeight,this.heightOracle,0,0),this.scaler)}getScrollOffset(){return this.scrollParent==this.view.scrollDOM?this.scrollParent.scrollTop*this.scaleY:(this.scrollParent?this.scrollParent.getBoundingClientRect().top:0)-this.view.contentDOM.getBoundingClientRect().top}scrollAnchorAt(e){let n=this.lineBlockAtHeight(e+12-this.paddingTop);return n.from>=this.viewport.from||this.viewportLines[0].top-e>200?n:this.viewportLines[0]}elementAtHeight(e){return zs(this.heightMap.blockAt(this.scaler.fromDOM(e),this.heightOracle,0,0),this.scaler)}get docHeight(){return this.scaler.toDOM(this.heightMap.height)}get contentHeight(){return this.docHeight+this.paddingTop+this.paddingBottom}},Xi=class{constructor(e,n){this.from=e,this.to=n}};Eg={toDOM(t){return t},fromDOM(t){return t},scale:1,eq(t){return t==this}};Fg=class t{constructor(e,n){this.scale=e,this.viewports=n}static get(e,n,r){let o=0,a=0,i=0,l=r.map(({from:f,to:c})=>{let u=n.lineAt(f,Ie.ByPos,e,0,0).top,d=n.lineAt(c,Ie.ByPos,e,0,0).bottom;return o+=d-u,{from:f,to:c,top:u,bottom:d,domTop:0,domBottom:0}});if(n.height-o<10)return Eg;let s=(7e6-o)/(n.height-o);for(let f of l)f.domTop=i+(f.top-a)*s,i=f.domBottom=f.domTop+(f.bottom-f.top),a=f.bottom;return new t(s,l)}toDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.top)return o+(e-r)*this.scale;if(e<=a.bottom)return a.domTop+(e-a.top);r=a.bottom,o=a.domBottom}}fromDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.domTop)return r+(e-o)/this.scale;if(e<=a.domBottom)return a.top+(e-a.domTop);r=a.bottom,o=a.domBottom}}eq(e){return e instanceof t?this.scale==e.scale&&this.viewports.length==e.viewports.length&&this.viewports.every((n,r)=>n.from==e.viewports[r].from&&n.to==e.viewports[r].to):!1}};zu=z.define({combine:t=>t.join(" ")}),Lg=z.define({combine:t=>t.indexOf(!0)>-1}),Ng=bn.newName(),GC=bn.newName(),QC=bn.newName(),XC={"&light":"."+GC,"&dark":"."+QC};yL=qg("."+Ng,{"&":{position:"relative !important",boxSizing:"border-box","&.cm-focused":{outline:"1px dotted #212121"},display:"flex !important",flexDirection:"column"},".cm-scroller":{display:"flex !important",alignItems:"flex-start !important",fontFamily:"monospace",lineHeight:1.4,height:"100%",overflowX:"auto",position:"relative",zIndex:0,overflowAnchor:"none"},".cm-content":{margin:0,flexGrow:2,flexShrink:0,display:"block",whiteSpace:"pre",wordWrap:"normal",boxSizing:"border-box",minHeight:"100%",padding:"4px 0",outline:"none","&[contenteditable=true]":{WebkitUserModify:"read-write-plaintext-only"}},".cm-lineWrapping":{whiteSpace_fallback:"pre-wrap",whiteSpace:"break-spaces",wordBreak:"break-word",overflowWrap:"anywhere",flexShrink:1},"&light .cm-content":{caretColor:"black"},"&dark .cm-content":{caretColor:"white"},".cm-line":{display:"block",padding:"0 2px 0 6px"},".cm-layer":{userSelect:"none",position:"absolute",left:0,top:0,contain:"size style","& > *":{position:"absolute"}},"&light .cm-selectionBackground":{background:"#d9d9d9"},"&dark .cm-selectionBackground":{background:"#222"},"&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#d7d4f0"},"&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#233"},".cm-cursorLayer":{pointerEvents:"none"},"&.cm-focused > .cm-scroller > .cm-cursorLayer":{animation:"steps(1) cm-blink 1.2s infinite"},"@keyframes cm-blink":{"0%":{},"50%":{opacity:0},"100%":{}},"@keyframes cm-blink2":{"0%":{},"50%":{opacity:0},"100%":{}},".cm-cursor, .cm-dropCursor":{borderLeft:"1.2px solid black",marginLeft:"-0.6px",pointerEvents:"none"},".cm-cursor":{display:"none"},"&dark .cm-cursor":{borderLeftColor:"#ddd"},".cm-selectionHandle":{backgroundColor:"currentColor",width:"1.5px"},".cm-selectionHandle-start::before, .cm-selectionHandle-end::before":{content:'""',backgroundColor:"inherit",borderRadius:"50%",width:"8px",height:"8px",position:"absolute",left:"-3.25px"},".cm-selectionHandle-start::before":{top:"-8px"},".cm-selectionHandle-end::before":{bottom:"-8px"},".cm-dropCursor":{position:"absolute"},"&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor":{display:"block"},".cm-iso":{unicodeBidi:"isolate"},".cm-announced":{position:"fixed",top:"-10000px"},"@media print":{".cm-announced":{display:"none"}},"&light .cm-activeLine":{backgroundColor:"#cceeff44"},"&dark .cm-activeLine":{backgroundColor:"#99eeff33"},"&light .cm-specialChar":{color:"red"},"&dark .cm-specialChar":{color:"#f78"},".cm-gutters":{flexShrink:0,display:"flex",height:"100%",boxSizing:"border-box",zIndex:200},".cm-gutters-before":{insetInlineStart:0},".cm-gutters-after":{insetInlineEnd:0},"&light .cm-gutters":{backgroundColor:"#f5f5f5",color:"#6c6c6c",border:"0px solid #ddd","&.cm-gutters-before":{borderRightWidth:"1px"},"&.cm-gutters-after":{borderLeftWidth:"1px"}},"&dark .cm-gutters":{backgroundColor:"#333338",color:"#ccc"},".cm-gutter":{display:"flex !important",flexDirection:"column",flexShrink:0,boxSizing:"border-box",minHeight:"100%",overflow:"hidden"},".cm-gutterElement":{boxSizing:"border-box"},".cm-lineNumbers .cm-gutterElement":{padding:"0 3px 0 5px",minWidth:"20px",textAlign:"right",whiteSpace:"nowrap"},"&light .cm-activeLineGutter":{backgroundColor:"#e2f2ff"},"&dark .cm-activeLineGutter":{backgroundColor:"#222227"},".cm-panels":{boxSizing:"border-box",position:"sticky",left:0,right:0,zIndex:300},"&light .cm-panels":{backgroundColor:"#f5f5f5",color:"black"},".cm-panels-top":{top:"0"},".cm-panels-bottom":{bottom:"0"},"&light .cm-panels-top":{borderBottom:"1px solid #ddd"},"&light .cm-panels-bottom":{borderTop:"1px solid #ddd"},"&dark .cm-panels":{backgroundColor:"#333338",color:"white"},".cm-dialog":{padding:"2px 19px 4px 6px",position:"relative","& label":{fontSize:"80%"}},".cm-dialog-close":{position:"absolute",top:"3px",right:"4px",backgroundColor:"inherit",border:"none",font:"inherit",fontSize:"14px",padding:"0"},".cm-tab":{display:"inline-block",overflow:"hidden",verticalAlign:"bottom"},".cm-widgetBuffer":{verticalAlign:"baseline",height:"1em",width:0,display:"inline"},".cm-placeholder":{color:"#888",display:"inline-block",verticalAlign:"top",userSelect:"none"},".cm-highlightSpace":{background:"radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",backgroundSize:".4em",backgroundPosition:"calc(min(50%, 0px)) center"},".cm-highlightTab":{backgroundImage:`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,backgroundSize:"auto 100%",backgroundPosition:"right 90%",backgroundRepeat:"no-repeat"},".cm-trailingSpace":{backgroundColor:"#ff332255"},".cm-button":{verticalAlign:"middle",color:"inherit",fontSize:"70%",padding:".2em 1em",borderRadius:"1px"},"&light .cm-button":{backgroundImage:"linear-gradient(#eff1f5, #d9d9df)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#b4b4b4, #d0d3d6)"}},"&dark .cm-button":{backgroundImage:"linear-gradient(#393939, #111)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#111, #333)"}},".cm-textfield":{verticalAlign:"middle",color:"inherit",fontSize:"70%",border:"1px solid silver",padding:".2em .5em"},"&light .cm-textfield":{backgroundColor:"white"},"&dark .cm-textfield":{border:"1px solid #555",backgroundColor:"inherit"}},XC),bL={childList:!0,characterData:!0,subtree:!0,attributes:!0,characterDataOldValue:!0},Jx=P.ie&&P.ie_version<=11,Pg=class{constructor(e){this.view=e,this.active=!1,this.editContext=null,this.selectionRange=new ig,this.selectionChanged=!1,this.delayedFlush=-1,this.resizeTimeout=-1,this.queue=[],this.delayedAndroidKey=null,this.flushingAndroidKey=-1,this.lastChange=0,this.scrollTargets=[],this.intersection=null,this.resizeScroll=null,this.intersecting=!1,this.gapIntersection=null,this.gaps=[],this.printQuery=null,this.parentCheck=-1,this.dom=e.contentDOM,this.observer=new MutationObserver(n=>{for(let r of n)this.queue.push(r);(P.ie&&P.ie_version<=11||P.ios&&e.composing)&&n.some(r=>r.type=="childList"&&r.removedNodes.length||r.type=="characterData"&&r.oldValue.length>r.target.nodeValue.length)?this.flushSoon():this.flush()}),window.EditContext&&P.android&&e.constructor.EDIT_CONTEXT!==!1&&!(P.chrome&&P.chrome_version<126)&&(this.editContext=new _g(e),e.state.facet(Or)&&(e.contentDOM.editContext=this.editContext.editContext)),Jx&&(this.onCharData=n=>{this.queue.push({target:n.target,type:"characterData",oldValue:n.prevValue}),this.flushSoon()}),this.onSelectionChange=this.onSelectionChange.bind(this),this.onResize=this.onResize.bind(this),this.onPrint=this.onPrint.bind(this),this.onScroll=this.onScroll.bind(this),window.matchMedia&&(this.printQuery=window.matchMedia("print")),typeof ResizeObserver=="function"&&(this.resizeScroll=new ResizeObserver(()=>{var n;((n=this.view.docView)===null||n===void 0?void 0:n.lastUpdate)<Date.now()-75&&this.onResize()}),this.resizeScroll.observe(e.scrollDOM)),this.addWindowListeners(this.win=e.win),this.start(),typeof IntersectionObserver=="function"&&(this.intersection=new IntersectionObserver(n=>{this.parentCheck<0&&(this.parentCheck=setTimeout(this.listenForScroll.bind(this),1e3)),n.length>0&&n[n.length-1].intersectionRatio>0!=this.intersecting&&(this.intersecting=!this.intersecting,this.intersecting!=this.view.inView&&this.onScrollChanged(document.createEvent("Event")))},{threshold:[0,.001]}),this.intersection.observe(this.dom),this.gapIntersection=new IntersectionObserver(n=>{n.length>0&&n[n.length-1].intersectionRatio>0&&this.onScrollChanged(document.createEvent("Event"))},{})),this.listenForScroll(),this.readSelectionRange()}onScrollChanged(e){this.view.inputState.runHandlers("scroll",e),this.intersecting&&this.view.measure()}onScroll(e){this.intersecting&&this.flush(this.pendingRecords().length>0),this.editContext&&this.view.requestMeasure(this.editContext.measureReq),this.onScrollChanged(e)}onResize(){this.resizeTimeout<0&&(this.resizeTimeout=setTimeout(()=>{this.resizeTimeout=-1,this.view.requestMeasure()},50))}onPrint(e){(e.type=="change"||!e.type)&&!e.matches||(this.view.viewState.printing=!0,this.view.measure(),setTimeout(()=>{this.view.viewState.printing=!1,this.view.requestMeasure()},500))}updateGaps(e){if(this.gapIntersection&&(e.length!=this.gaps.length||this.gaps.some((n,r)=>n!=e[r]))){this.gapIntersection.disconnect();for(let n of e)this.gapIntersection.observe(n);this.gaps=e}}onSelectionChange(e){let n=this.selectionChanged;if(!this.readSelectionRange()||this.delayedAndroidKey)return;let{view:r}=this,o=this.selectionRange;if(r.state.facet(Or)?r.root.activeElement!=this.dom:!Hs(this.dom,o))return;let a=o.anchorNode&&r.docView.tile.nearest(o.anchorNode);if(a&&a.isWidget()&&a.widget.ignoreEvent(e)){n||(this.selectionChanged=!1);return}(P.ie&&P.ie_version<=11||P.android&&P.chrome)&&!r.state.selection.main.empty&&o.focusNode&&js(o.focusNode,o.focusOffset,o.anchorNode,o.anchorOffset)?this.flushSoon():this.flush(!1)}readSelectionRange(){let{view:e}=this,n=$s(e.root);if(!n)return!1;let r=P.safari&&e.root.nodeType==11&&e.root.activeElement==this.dom&&IL(this.view,n)||n;if(!r||this.selectionRange.eq(r))return!1;let o=Hs(this.dom,r);return o&&!this.selectionChanged&&e.inputState.lastFocusTime>Date.now()-200&&e.inputState.lastTouchTime<Date.now()-300&&dF(this.dom,r)?(this.view.inputState.lastFocusTime=0,e.docView.updateSelection(),!1):(this.selectionRange.setRange(r),o&&(this.selectionChanged=!0),!0)}setSelectionRange(e,n){this.selectionRange.set(e.node,e.offset,n.node,n.offset),this.selectionChanged=!1}clearSelectionRange(){this.selectionRange.set(null,0,null,0)}listenForScroll(){this.parentCheck=-1;let e=0,n=null;for(let r=this.dom;r;)if(nt(r))!n&&e<this.scrollTargets.length&&this.scrollTargets[e]==r?e++:n||(n=this.scrollTargets.slice(0,e)),n&&n.push(r),r=r.assignedSlot||r.parentNode;else if(r.nodeType==11)r=r.host;else break;if(e<this.scrollTargets.length&&!n&&(n=this.scrollTargets.slice(0,e)),n){for(let r of this.scrollTargets)r.removeEventListener("scroll",this.onScroll);for(let r of this.scrollTargets=n)r.addEventListener("scroll",this.onScroll)}}ignore(e){if(!this.active)return e();try{return this.stop(),e()}finally{this.start(),this.clear()}}start(){this.active||(this.observer.observe(this.dom,bL),Jx&&this.dom.addEventListener("DOMCharacterDataModified",this.onCharData),this.active=!0)}stop(){this.active&&(this.active=!1,this.observer.disconnect(),Jx&&this.dom.removeEventListener("DOMCharacterDataModified",this.onCharData))}clear(){this.processRecords(),this.queue.length=0,this.selectionChanged=!1}delayAndroidKey(e,n){var r;if(!this.delayedAndroidKey){let o=()=>{let a=this.delayedAndroidKey;a&&(this.clearDelayedAndroidKey(),this.view.inputState.lastKeyCode=a.keyCode,this.view.inputState.lastKeyTime=Date.now(),!this.flush()&&a.force&&Yi(this.dom,a.key,a.keyCode))};this.flushingAndroidKey=this.view.win.requestAnimationFrame(o)}(!this.delayedAndroidKey||e=="Enter")&&(this.delayedAndroidKey={key:e,keyCode:n,force:this.lastChange<Date.now()-50||!!(!((r=this.delayedAndroidKey)===null||r===void 0)&&r.force)})}clearDelayedAndroidKey(){this.win.cancelAnimationFrame(this.flushingAndroidKey),this.delayedAndroidKey=null,this.flushingAndroidKey=-1}flushSoon(){this.delayedFlush<0&&(this.delayedFlush=this.view.win.requestAnimationFrame(()=>{this.delayedFlush=-1,this.flush()}))}forceFlush(){this.delayedFlush>=0&&(this.view.win.cancelAnimationFrame(this.delayedFlush),this.delayedFlush=-1),this.flush()}pendingRecords(){for(let e of this.observer.takeRecords())this.queue.push(e);return this.queue}processRecords(){let e=this.pendingRecords();e.length&&(this.queue=[]);let n=-1,r=-1,o=!1;for(let a of e){let i=this.readMutation(a);i&&(i.typeOver&&(o=!0),n==-1?{from:n,to:r}=i:(n=Math.min(i.from,n),r=Math.max(i.to,r)))}return{from:n,to:r,typeOver:o}}readChange(){let{from:e,to:n,typeOver:r}=this.processRecords(),o=this.selectionChanged&&Hs(this.dom,this.selectionRange);if(e<0&&!o)return null;e>-1&&(this.lastChange=Date.now()),this.view.inputState.lastFocusTime=0,this.selectionChanged=!1;let a=new wg(this.view,e,n,r);return this.view.docView.domChanged={newSel:a.newSel?a.newSel.main:null},a}flush(e=!0){if(this.delayedFlush>=0||this.delayedAndroidKey)return!1;e&&this.readSelectionRange();let n=this.selectionChanged,r=this.readChange();if(!r)return this.view.requestMeasure(),!1;let o=this.view.state,a=LC(this.view,r);return this.view.state==o&&(r.domChanged||n)&&this.view.update([]),a}readMutation(e){let n=this.view.docView.tile.nearest(e.target);if(!n||n.isWidget())return null;if(n.markDirty(e.type=="attributes"),e.type=="childList"){let r=Qk(n,e.previousSibling||e.target.previousSibling,-1),o=Qk(n,e.nextSibling||e.target.nextSibling,1);return{from:r?n.posAfter(r):n.posAtStart,to:o?n.posBefore(o):n.posAtEnd,typeOver:!1}}else return e.type=="characterData"?{from:n.posAtStart,to:n.posAtEnd,typeOver:e.target.nodeValue==e.oldValue}:null}setWindow(e){e!=this.win&&(this.removeWindowListeners(this.win),this.win=e,this.addWindowListeners(this.win))}addWindowListeners(e){e.addEventListener("resize",this.onResize),this.printQuery?this.printQuery.addEventListener?this.printQuery.addEventListener("change",this.onPrint):this.printQuery.addListener(this.onPrint):e.addEventListener("beforeprint",this.onPrint),e.addEventListener("scroll",this.onScroll),e.document.addEventListener("selectionchange",this.onSelectionChange)}removeWindowListeners(e){e.removeEventListener("scroll",this.onScroll),e.removeEventListener("resize",this.onResize),this.printQuery?this.printQuery.removeEventListener?this.printQuery.removeEventListener("change",this.onPrint):this.printQuery.removeListener(this.onPrint):e.removeEventListener("beforeprint",this.onPrint),e.document.removeEventListener("selectionchange",this.onSelectionChange)}update(e){this.editContext&&(this.editContext.update(e),e.startState.facet(Or)!=e.state.facet(Or)&&(e.view.contentDOM.editContext=e.state.facet(Or)?this.editContext.editContext:null))}destroy(){var e,n,r;this.stop(),(e=this.intersection)===null||e===void 0||e.disconnect(),(n=this.gapIntersection)===null||n===void 0||n.disconnect(),(r=this.resizeScroll)===null||r===void 0||r.disconnect();for(let o of this.scrollTargets)o.removeEventListener("scroll",this.onScroll);this.removeWindowListeners(this.win),clearTimeout(this.parentCheck),clearTimeout(this.resizeTimeout),this.win.cancelAnimationFrame(this.delayedFlush),this.win.cancelAnimationFrame(this.flushingAndroidKey),this.editContext&&(this.view.contentDOM.editContext=null,this.editContext.destroy())}};_g=class{constructor(e){this.from=0,this.to=0,this.pendingContextChange=null,this.handlers=Object.create(null),this.composing=null,this.resetRange(e.state);let n=this.editContext=new window.EditContext({text:e.state.doc.sliceString(this.from,this.to),selectionStart:this.toContextPos(Math.max(this.from,Math.min(this.to,e.state.selection.main.anchor))),selectionEnd:this.toContextPos(e.state.selection.main.head)});this.handlers.textupdate=r=>{let o=e.state.selection.main,{anchor:a,head:i}=o,l=this.toEditorPos(r.updateRangeStart),s=this.toEditorPos(r.updateRangeEnd);e.inputState.composing>=0&&!this.composing&&(this.composing={contextBase:r.updateRangeStart,editorBase:l,drifted:!1});let f=s-l>r.text.length;l==this.from&&a<this.from?l=a:s==this.to&&a>this.to&&(s=a);let c=NC(e.state.sliceDoc(l,s),r.text,(f?o.from:o.to)-l,f?"end":null);if(!c){let d=B.single(this.toEditorPos(r.selectionStart),this.toEditorPos(r.selectionEnd));Sg(d,o)||e.dispatch({selection:d,userEvent:"select"});return}let u={from:c.from+l,to:c.toA+l,insert:ne.of(r.text.slice(c.from,c.toB).split(`
`))};if((P.mac||P.android)&&u.from==i-1&&/^\. ?$/.test(r.text)&&e.contentDOM.getAttribute("autocorrect")=="off"&&(u={from:l,to:s,insert:ne.of([r.text.replace("."," ")])}),this.pendingContextChange=u,!e.state.readOnly){let d=this.to-this.from+(u.to-u.from+u.insert.length);ey(e,u,B.single(this.toEditorPos(r.selectionStart,d),this.toEditorPos(r.selectionEnd,d)))}this.pendingContextChange&&(this.revertPending(e.state),this.setSelection(e.state)),u.from<u.to&&!u.insert.length&&e.inputState.composing>=0&&!/[\\p{Alphabetic}\\p{Number}_]/.test(n.text.slice(Math.max(0,r.updateRangeStart-1),Math.min(n.text.length,r.updateRangeStart+1)))&&this.handlers.compositionend(r)},this.handlers.characterboundsupdate=r=>{let o=[],a=null;for(let i=this.toEditorPos(r.rangeStart),l=this.toEditorPos(r.rangeEnd);i<l;i++){let s=e.coordsForChar(i);a=s&&new DOMRect(s.left,s.top,s.right-s.left,s.bottom-s.top)||a||new DOMRect,o.push(a)}n.updateCharacterBounds(r.rangeStart,o)},this.handlers.textformatupdate=r=>{let o=[];for(let a of r.getTextFormats()){let i=a.underlineStyle,l=a.underlineThickness;if(!/none/i.test(i)&&!/none/i.test(l)){let s=this.toEditorPos(a.rangeStart),f=this.toEditorPos(a.rangeEnd);if(s<f){let c=`text-decoration: underline ${/^[a-z]/.test(i)?i+" ":i=="Dashed"?"dashed ":i=="Squiggle"?"wavy ":""}${/thin/i.test(l)?1:2}px`;o.push(Y.mark({attributes:{style:c}}).range(s,f))}}}e.dispatch({effects:CC.of(Y.set(o))})},this.handlers.compositionstart=()=>{e.inputState.composing<0&&(e.inputState.composing=0,e.inputState.compositionFirstChange=!0)},this.handlers.compositionend=()=>{if(e.inputState.composing=-1,e.inputState.compositionFirstChange=null,this.composing){let{drifted:r}=this.composing;this.composing=null,r&&this.reset(e.state)}};for(let r in this.handlers)n.addEventListener(r,this.handlers[r]);this.measureReq={read:r=>{let o=$s(r.root);o&&o.rangeCount&&this.editContext.updateSelectionBounds(o.getRangeAt(0).getBoundingClientRect())}}}applyEdits(e){let n=0,r=!1,o=this.pendingContextChange;return e.changes.iterChanges((a,i,l,s,f)=>{if(r)return;let c=f.length-(i-a);if(o&&i>=o.to)if(o.from==a&&o.to==i&&o.insert.eq(f)){o=this.pendingContextChange=null,n+=c,this.to+=c;return}else o=null,this.revertPending(e.state);if(a+=n,i+=n,i<=this.from)this.from+=c,this.to+=c;else if(a<this.to){if(a<this.from||i>this.to||this.to-this.from+f.length>3e4){r=!0;return}this.editContext.updateText(this.toContextPos(a),this.toContextPos(i),f.toString()),this.to+=c}n+=c}),o&&!r&&this.revertPending(e.state),!r}update(e){let n=this.pendingContextChange,r=e.startState.selection.main;this.composing&&(this.composing.drifted||!e.changes.touchesRange(r.from,r.to)&&e.transactions.some(o=>!o.isUserEvent("input.type")&&o.changes.touchesRange(this.from,this.to)))?(this.composing.drifted=!0,this.composing.editorBase=e.changes.mapPos(this.composing.editorBase)):!this.applyEdits(e)||!this.rangeIsValid(e.state)?(this.pendingContextChange=null,this.reset(e.state)):(e.docChanged||e.selectionSet||n)&&this.setSelection(e.state),(e.geometryChanged||e.docChanged||e.selectionSet)&&e.view.requestMeasure(this.measureReq)}resetRange(e){let{head:n}=e.selection.main;this.from=Math.max(0,n-1e4),this.to=Math.min(e.doc.length,n+1e4)}reset(e){this.resetRange(e),this.editContext.updateText(0,this.editContext.text.length,e.doc.sliceString(this.from,this.to)),this.setSelection(e)}revertPending(e){let n=this.pendingContextChange;this.pendingContextChange=null,this.editContext.updateText(this.toContextPos(n.from),this.toContextPos(n.from+n.insert.length),e.doc.sliceString(n.from,n.to))}setSelection(e){let{main:n}=e.selection,r=this.toContextPos(Math.max(this.from,Math.min(this.to,n.anchor))),o=this.toContextPos(n.head);(this.editContext.selectionStart!=r||this.editContext.selectionEnd!=o)&&this.editContext.updateSelection(r,o)}rangeIsValid(e){let{head:n}=e.selection.main;return!(this.from>0&&n-this.from<500||this.to<e.doc.length&&this.to-n<500||this.to-this.from>1e4*3)}toEditorPos(e,n=this.to-this.from){e=Math.min(e,n);let r=this.composing;return r&&r.drifted?r.editorBase+(e-r.contextBase):e+this.from}toContextPos(e){let n=this.composing;return n&&n.drifted?n.contextBase+(e-n.editorBase):e-this.from}destroy(){for(let e in this.handlers)this.editContext.removeEventListener(e,this.handlers[e])}},V=class t{get state(){return this.viewState.state}get viewport(){return this.viewState.viewport}get visibleRanges(){return this.viewState.visibleRanges}get inView(){return this.viewState.inView}get composing(){return!!this.inputState&&this.inputState.composing>0}get compositionStarted(){return!!this.inputState&&this.inputState.composing>=0}get root(){return this._root}get win(){return this.dom.ownerDocument.defaultView||window}constructor(e={}){var n;this.plugins=[],this.pluginMap=new Map,this.editorAttrs={},this.contentAttrs={},this.bidiCache=[],this.destroyed=!1,this.updateState=2,this.measureScheduled=-1,this.measureRequests=[],this.clearAnnouncement=-1,this.contentDOM=document.createElement("div"),this.scrollDOM=document.createElement("div"),this.scrollDOM.tabIndex=-1,this.scrollDOM.className="cm-scroller",this.scrollDOM.appendChild(this.contentDOM),this.announceDOM=document.createElement("div"),this.announceDOM.className="cm-announced",this.announceDOM.setAttribute("aria-live","polite"),this.dom=document.createElement("div"),this.dom.appendChild(this.announceDOM),this.dom.appendChild(this.scrollDOM),e.parent&&e.parent.appendChild(this.dom);let{dispatch:r}=e;this.dispatchTransactions=e.dispatchTransactions||r&&(o=>o.forEach(a=>r(a,this)))||(o=>this.update(o)),this.dispatch=this.dispatch.bind(this),this._root=e.root||uF(e.parent)||document,this.viewState=new ed(this,e.state||Ee.create(e)),e.scrollTo&&e.scrollTo.is(Lu)&&(this.viewState.scrollTarget=e.scrollTo.value.clip(this.viewState.state)),this.plugins=this.state.facet(Qi).map(o=>new Gs(o));for(let o of this.plugins)o.update(this);this.observer=new Pg(this),this.inputState=new kg(this),this.inputState.ensureHandlers(this.plugins),this.docView=new Yu(this),this.mountStyles(),this.updateAttrs(),this.updateState=0,this.requestMeasure(),!((n=document.fonts)===null||n===void 0)&&n.ready&&document.fonts.ready.then(()=>{this.viewState.mustMeasureContent="refresh",this.requestMeasure()})}dispatch(...e){let n=e.length==1&&e[0]instanceof Ye?e:e.length==1&&Array.isArray(e[0])?e[0]:[this.state.update(...e)];this.dispatchTransactions(n,this)}update(e){if(this.updateState!=0)throw new Error("Calls to EditorView.update are not allowed while an update is in progress");let n=!1,r=!1,o,a=this.state;for(let d of e){if(d.startState!=a)throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");a=d.state}if(this.destroyed){this.viewState.state=a;return}let i=this.hasFocus,l=0,s=null;e.some(d=>d.annotation(UC))?(this.inputState.notifiedFocused=i,l=1):i!=this.inputState.notifiedFocused&&(this.inputState.notifiedFocused=i,s=jC(a,i),s||(l=1));let f=this.observer.delayedAndroidKey,c=null;if(f?(this.observer.clearDelayedAndroidKey(),c=this.observer.readChange(),(c&&!this.state.doc.eq(a.doc)||!this.state.selection.eq(a.selection))&&(c=null)):this.observer.clear(),a.facet(Ee.phrases)!=this.state.facet(Ee.phrases))return this.setState(a);o=Wu.create(this,a,e),o.flags|=l;let u=this.viewState.scrollTarget;try{this.updateState=2;for(let d of e){if(u&&(u=u.map(d.changes)),d.scrollIntoView){let{main:p}=d.state.selection,{x:h,y}=this.state.facet(t.cursorScrollMargin);u=new Vs(p.empty?p:B.cursor(p.head,p.head>p.anchor?-1:1),"nearest","nearest",y,h)}for(let p of d.effects)p.is(Lu)&&(u=p.value.clip(this.state))}this.viewState.update(o,u),this.bidiCache=td.update(this.bidiCache,o.changes),o.empty||(this.updatePlugins(o),this.inputState.update(o)),n=this.docView.update(o),this.state.facet(_s)!=this.styleModules&&this.mountStyles(),r=this.updateAttrs(),this.showAnnouncements(e),this.docView.updateSelection(n,e.some(d=>d.isUserEvent("select.pointer")))}finally{this.updateState=0}if(o.startState.facet(zu)!=o.state.facet(zu)&&(this.viewState.mustMeasureContent=!0),(n||r||u||this.viewState.mustEnforceCursorAssoc||this.viewState.mustMeasureContent)&&this.requestMeasure(),n&&this.docViewUpdate(),!o.empty)for(let d of this.state.facet(cg))try{d(o)}catch(p){At(this.state,p,"update listener")}(s||c)&&Promise.resolve().then(()=>{s&&this.state==s.startState&&this.dispatch(s),c&&!LC(this,c)&&f.force&&Yi(this.contentDOM,f.key,f.keyCode)})}setState(e){if(this.updateState!=0)throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");if(this.destroyed){this.viewState.state=e;return}this.updateState=2;let n=this.hasFocus;try{for(let r of this.plugins)r.destroy(this);this.viewState=new ed(this,e),this.plugins=e.facet(Qi).map(r=>new Gs(r)),this.pluginMap.clear();for(let r of this.plugins)r.update(this);this.docView.destroy(),this.docView=new Yu(this),this.inputState.ensureHandlers(this.plugins),this.mountStyles(),this.updateAttrs(),this.bidiCache=[]}finally{this.updateState=0}n&&this.focus(),this.requestMeasure()}updatePlugins(e){let n=e.startState.facet(Qi),r=e.state.facet(Qi);if(n!=r){let o=[];for(let a of r){let i=n.indexOf(a);if(i<0)o.push(new Gs(a));else{let l=this.plugins[i];l.mustUpdate=e,o.push(l)}}for(let a of this.plugins)a.mustUpdate!=e&&a.destroy(this);this.plugins=o,this.pluginMap.clear()}else for(let o of this.plugins)o.mustUpdate=e;for(let o=0;o<this.plugins.length;o++)this.plugins[o].update(this);n!=r&&this.inputState.ensureHandlers(this.plugins)}docViewUpdate(){for(let e of this.plugins){let n=e.value;if(n&&n.docViewUpdate)try{n.docViewUpdate(this)}catch(r){At(this.state,r,"doc view update listener")}}}measure(e=!0){if(this.destroyed)return;if(this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.observer.delayedAndroidKey){this.measureScheduled=-1,this.requestMeasure();return}this.measureScheduled=0,e&&this.observer.forceFlush();let n=null,r=this.viewState.scrollParent,o=this.viewState.getScrollOffset(),{scrollAnchorPos:a,scrollAnchorHeight:i,scaleY:l}=this.viewState;Math.abs(o-this.viewState.scrollOffset)>1&&(i=-1),this.viewState.scrollAnchorHeight=-1;try{for(let s=0;;s++){if(i<0){if(fC(r||this.win))a=-1,i=this.viewState.heightMap.height/this.viewState.scaleY;else{let h=this.viewState.scrollAnchorAt(o);a=h.from,i=h.top}l=this.viewState.scaleY}this.updateState=1;let f=this.viewState.measure();if(!f&&!this.measureRequests.length&&this.viewState.scrollTarget==null)break;if(s>5){console.warn(this.measureRequests.length?"Measure loop restarted more than 5 times":"Viewport failed to stabilize");break}let c=[];f&4||([this.measureRequests,c]=[c,this.measureRequests]);let u=c.map(h=>{try{return h.read(this)}catch(y){return At(this.state,y),Wk}}),d=Wu.create(this,this.state,[]),p=!1;d.flags|=f,n?n.flags|=f:n=d,this.updateState=2,d.empty||(this.updatePlugins(d),this.inputState.update(d),this.updateAttrs(),p=this.docView.update(d),p&&this.docViewUpdate());for(let h=0;h<c.length;h++)if(u[h]!=Wk)try{let y=c[h];y.write&&y.write(u[h],this)}catch(y){At(this.state,y)}if(p&&this.docView.updateSelection(!0),!d.viewportChanged&&this.measureRequests.length==0){if(this.viewState.editorHeight)if(this.viewState.scrollTarget){this.docView.scrollIntoView(this.viewState.scrollTarget),this.viewState.scrollTarget=null,i=-1;continue}else{let y=(a<0?this.viewState.heightMap.height:this.viewState.lineBlockAt(a).top)/this.viewState.scaleY-i/l;if((y>1||y<-1)&&!(P.ios&&this.inputState.lastIOSMomentumScroll>Date.now()-100)&&(r==this.scrollDOM||this.hasFocus||Math.max(this.inputState.lastWheelEvent,this.inputState.lastTouchTime)>Date.now()-100)){o=o+y,r?a<0?r.scrollTop=r.scrollHeight:r.scrollTop+=y:this.win.scrollBy(0,y),i=-1;continue}}break}}}finally{this.updateState=0,this.measureScheduled=-1}if(n&&!n.empty)for(let s of this.state.facet(cg))s(n)}get themeClasses(){return Ng+" "+(this.state.facet(Lg)?QC:GC)+" "+this.state.facet(zu)}updateAttrs(){let e=Kk(this,AC,{class:"cm-editor"+(this.hasFocus?" cm-focused ":" ")+this.themeClasses}),n={spellcheck:"false",autocorrect:"off",autocapitalize:"off",writingsuggestions:"false",translate:"no",contenteditable:this.state.facet(Or)?"true":"false",class:"cm-content",style:`${P.tabSize}: ${this.state.tabSize}`,role:"textbox","aria-multiline":"true"};this.state.readOnly&&(n["aria-readonly"]="true"),Kk(this,Jg,n);let r=this.observer.ignore(()=>{let o=Mk(this.contentDOM,this.contentAttrs,n),a=Mk(this.dom,this.editorAttrs,e);return o||a});return this.editorAttrs=e,this.contentAttrs=n,r}showAnnouncements(e){let n=!0;for(let r of e)for(let o of r.effects)if(o.is(t.announce)){n&&(this.announceDOM.textContent="",this.win.clearTimeout(this.clearAnnouncement),this.clearAnnouncement=this.win.setTimeout(()=>{this.announceDOM.textContent="\xA0"},200),n=!1);let a=this.announceDOM.appendChild(document.createElement("div"));a.textContent=o.value}}mountStyles(){this.styleModules=this.state.facet(_s);let e=this.state.facet(t.cspNonce);bn.mount(this.root,this.styleModules.concat(yL).reverse(),e?{nonce:e}:void 0)}readMeasured(){if(this.updateState==2)throw new Error("Reading the editor layout isn't allowed during an update");this.updateState==0&&this.measureScheduled>-1&&this.measure(!1)}requestMeasure(e){if(this.measureScheduled<0&&(this.measureScheduled=this.win.requestAnimationFrame(()=>this.measure())),e){if(this.measureRequests.indexOf(e)>-1)return;if(e.key!=null){for(let n=0;n<this.measureRequests.length;n++)if(this.measureRequests[n].key===e.key){this.measureRequests[n]=e;return}}this.measureRequests.push(e)}}plugin(e){let n=this.pluginMap.get(e);return(n===void 0||n&&n.plugin!=e)&&this.pluginMap.set(e,n=this.plugins.find(r=>r.plugin==e)||null),n&&n.update(this).value}get documentTop(){return this.contentDOM.getBoundingClientRect().top+this.viewState.paddingTop}get documentPadding(){return{top:this.viewState.paddingTop,bottom:this.viewState.paddingBottom}}get scaleX(){return this.viewState.scaleX}get scaleY(){return this.viewState.scaleY}elementAtHeight(e){return this.readMeasured(),this.viewState.elementAtHeight(e)}lineBlockAtHeight(e){return this.readMeasured(),this.viewState.lineBlockAtHeight(e)}get viewportLineBlocks(){return this.viewState.viewportLines}lineBlockAt(e){return this.viewState.lineBlockAt(e)}get contentHeight(){return this.viewState.contentHeight}moveByChar(e,n,r){return Yx(this,e,Fk(this,e,n,r))}moveByGroup(e,n){return Yx(this,e,Fk(this,e,n,r=>UF(this,e.head,r)))}visualLineSide(e,n){return n?B.cursor(e.to,1):B.cursor(e.from,-1)}moveToLineBoundary(e,n,r=!0){return HF(this,e,n,r)}moveVertically(e,n,r){return Yx(this,e,jF(this,e,n,r))}domAtPos(e,n=1){return this.docView.domAtPos(e,n)}posAtDOM(e,n=0){return this.docView.posFromDOM(e,n)}posAtCoords(e,n=!0){this.readMeasured();let r=bg(this,e,n);return r&&r.pos}posAndSideAtCoords(e,n=!0){return this.readMeasured(),bg(this,e,n)}coordsAtPos(e,n=1){this.readMeasured();let r=this.state.doc.lineAt(e),o=this.bidiSpans(r),a=o[wn.find(o,e-r.from,-1,n)];return r.length&&(e==r.from&&n<0||e==r.to&&n>0)&&a.dir!=this.textDirectionAt(r.from)&&(e==r.to?(e=r.from+a.from,n=1):(e=r.from+a.to,n=-1)),this.docView.coordsAt(e,n,a.dir==ge.RTL)}coordsForChar(e){return this.readMeasured(),this.docView.coordsForChar(e)}get defaultCharacterWidth(){return this.viewState.heightOracle.charWidth}get defaultLineHeight(){return this.viewState.heightOracle.lineHeight}get textDirection(){return this.viewState.defaultTextDirection}textDirectionAt(e){return!this.state.facet(SC)||e<this.viewport.from||e>this.viewport.to?this.textDirection:(this.readMeasured(),this.docView.textDirectionAt(e))}get lineWrapping(){return this.viewState.heightOracle.lineWrapping}bidiSpans(e){if(e.length>vL)return hC(e.length);let n=this.textDirectionAt(e.from),r;for(let a of this.bidiCache)if(a.from==e.from&&a.dir==n&&(a.fresh||mC(a.isolates,r=Rk(this,e))))return a.order;r||(r=Rk(this,e));let o=bF(e.text,n,r);return this.bidiCache.push(new td(e.from,e.to,n,r,!0,o)),o}get hasFocus(){var e;return(this.dom.ownerDocument.hasFocus()||P.safari&&((e=this.inputState)===null||e===void 0?void 0:e.lastContextMenu)>Date.now()-3e4)&&this.root.activeElement==this.contentDOM}focus(){this.observer.ignore(()=>{sC(this.contentDOM),this.docView.updateSelection()})}setRoot(e){this._root!=e&&(this._root=e,this.observer.setWindow((e.nodeType==9?e:e.ownerDocument).defaultView||window),this.mountStyles())}destroy(){this.root.activeElement==this.contentDOM&&this.contentDOM.blur();for(let e of this.plugins)e.destroy(this);this.plugins=[],this.inputState.destroy(),this.docView.destroy(),this.dom.remove(),this.observer.destroy(),this.win.clearTimeout(this.clearAnnouncement),this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.destroyed=!0}static scrollIntoView(e,n={}){var r,o,a,i;return Lu.of(new Vs(typeof e=="number"?B.cursor(e):e,(r=n.y)!==null&&r!==void 0?r:"nearest",(o=n.x)!==null&&o!==void 0?o:"nearest",(a=n.yMargin)!==null&&a!==void 0?a:5,(i=n.xMargin)!==null&&i!==void 0?i:5))}scrollSnapshot(){let{scrollTop:e,scrollLeft:n}=this.scrollDOM,r=this.viewState.scrollAnchorAt(e);return Lu.of(new Vs(B.cursor(r.from),"start","start",r.top-e,n,!0))}setTabFocusMode(e){e==null?this.inputState.tabFocusMode=this.inputState.tabFocusMode<0?0:-1:typeof e=="boolean"?this.inputState.tabFocusMode=e?0:-1:this.inputState.tabFocusMode!=0&&(this.inputState.tabFocusMode=Date.now()+e)}static domEventHandlers(e){return _t.define(()=>({}),{eventHandlers:e})}static domEventObservers(e){return _t.define(()=>({}),{eventObservers:e})}static theme(e,n){let r=bn.newName(),o=[zu.of(r),_s.of(qg(`.${r}`,e))];return n&&n.dark&&o.push(Lg.of(!0)),o}static baseTheme(e){return On.lowest(_s.of(qg("."+Ng,e,XC)))}static findFromDOM(e){var n;let r=e.querySelector(".cm-content"),o=r&&Fe.get(r)||Fe.get(e);return((n=o?.root)===null||n===void 0?void 0:n.view)||null}};V.styleModule=_s;V.inputHandler=vC;V.clipboardInputFilter=Kg;V.clipboardOutputFilter=Yg;V.scrollHandler=kC;V.focusChangeEffect=wC;V.perLineTextDirection=SC;V.exceptionSink=IC;V.updateListener=cg;V.editable=Or;V.mouseSelectionStyle=bC;V.dragMovesSelection=yC;V.clickAddsSelectionRange=gC;V.decorations=ad;V.blockWrappers=TC;V.outerDecorations=$g;V.atomicRanges=tf;V.bidiIsolatedRanges=MC;V.cursorScrollMargin=z.define({combine:t=>{let e=5,n=5;for(let r of t)typeof r=="number"?e=n=r:{x:e,y:n}=r;return{x:e,y:n}}});V.scrollMargins=OC;V.darkTheme=Lg;V.cspNonce=z.define({combine:t=>t.length?t[0]:""});V.contentAttributes=Jg;V.editorAttributes=AC;V.lineWrapping=V.contentAttributes.of({class:"cm-lineWrapping"});V.announce=le.define();vL=4096,Wk={},td=class t{constructor(e,n,r,o,a,i){this.from=e,this.to=n,this.dir=r,this.isolates=o,this.fresh=a,this.order=i}static update(e,n){if(n.empty&&!e.some(a=>a.fresh))return e;let r=[],o=e.length?e[e.length-1].dir:ge.LTR;for(let a=Math.max(0,e.length-10);a<e.length;a++){let i=e[a];i.dir==o&&!n.touchesRange(i.from,i.to)&&r.push(new t(n.mapPos(i.from,1),n.mapPos(i.to,-1),i.dir,i.isolates,!1,i.order))}return r}};wL=P.mac?"mac":P.windows?"win":P.linux?"linux":"key";kL=On.default(V.domEventHandlers({keydown(t,e){return ML(CL(e.state),t,e,"editor")}})),ol=z.define({enables:kL}),Yk=new WeakMap;So=null,AL=4e3;zg=null;Jk=!P.ios,DL=P.gecko&&P.gecko_version==153?"#ffffff01":"transparent",B8=On.highest(V.theme({".cm-line":{...Jk?{"& ::selection, &::selection":{backgroundColor:`${DL} !important`}}:{},caretColor:"transparent !important"},".cm-content":{caretColor:"transparent !important","& :focus":{caretColor:"initial !important",...Jk?{"&::selection, & ::selection":{backgroundColor:"Highlight !important"}}:{}}}})),E8=/x/.unicode!=null?"gu":"g";OL=Y.line({class:"cm-activeLine"}),RL=_t.fromClass(class{constructor(t){this.decorations=this.getDeco(t)}update(t){(t.docChanged||t.selectionSet)&&(this.decorations=this.getDeco(t.view))}getDeco(t){let e=-1,n=[];for(let r of t.state.selection.ranges){let o=t.lineBlockAt(r.head);o.from>e&&(n.push(OL.range(o.from)),e=o.from)}return Y.set(n)}},{decorations:t=>t.decorations}),Hg=class extends Br{constructor(e){super(),this.content=e}toDOM(e){let n=document.createElement("span");return n.className="cm-placeholder",n.style.pointerEvents="none",n.appendChild(typeof this.content=="string"?document.createTextNode(this.content):typeof this.content=="function"?this.content(e):this.content.cloneNode(!0)),n.setAttribute("aria-hidden","true"),n}coordsAt(e){let n=e.firstChild?Us(e.firstChild):[];if(!n.length)return null;let r=window.getComputedStyle(e.parentNode),o=Zs(n[0],r.direction!="rtl"),a=parseInt(r.lineHeight);return o.bottom-o.top>a*1.5?{left:o.left,right:o.right,top:o.top,bottom:o.top+a}:o}ignoreEvent(){return!1}};Uu="-10000px",Ug=class{constructor(e,n,r,o){this.facet=n,this.createTooltipView=r,this.removeTooltipView=o,this.input=e.state.facet(n),this.tooltips=this.input.filter(i=>i);let a=null;this.tooltipViews=this.tooltips.map(i=>a=r(i,a))}update(e,n){var r;let o=e.state.facet(this.facet),a=o.filter(s=>s);if(o===this.input){for(let s of this.tooltipViews)s.update&&s.update(e);return!1}let i=[],l=n?[]:null;for(let s=0;s<a.length;s++){let f=a[s],c=-1;if(f){for(let u=0;u<this.tooltips.length;u++){let d=this.tooltips[u];d&&d.create==f.create&&(c=u)}if(c<0)i[s]=this.createTooltipView(f,s?i[s-1]:null),l&&(l[s]=!!f.above);else{let u=i[s]=this.tooltipViews[c];l&&(l[s]=n[c]),u.update&&u.update(e)}}}for(let s of this.tooltipViews)i.indexOf(s)<0&&(this.removeTooltipView(s),(r=s.destroy)===null||r===void 0||r.call(s));return n&&(l.forEach((s,f)=>n[f]=s),n.length=l.length),this.input=o,this.tooltips=a,this.tooltipViews=i,!0}};$x=z.define({combine:t=>{var e,n,r;return{position:P.ios?"absolute":((e=t.find(o=>o.position))===null||e===void 0?void 0:e.position)||"fixed",parent:((n=t.find(o=>o.parent))===null||n===void 0?void 0:n.parent)||null,tooltipSpace:((r=t.find(o=>o.tooltipSpace))===null||r===void 0?void 0:r.tooltipSpace)||BL}}}),$k=new WeakMap,JC=_t.fromClass(class{constructor(t){this.view=t,this.above=[],this.inView=!0,this.madeAbsolute=!1,this.lastTransaction=0,this.measureTimeout=-1;let e=t.state.facet($x);this.position=e.position,this.parent=e.parent,this.classes=t.themeClasses,this.createContainer(),this.measureReq={read:this.readMeasure.bind(this),write:this.writeMeasure.bind(this),key:this},this.resizeObserver=typeof ResizeObserver=="function"?new ResizeObserver(()=>this.measureSoon()):null,this.manager=new Ug(t,ty,(n,r)=>this.createTooltip(n,r),n=>{this.resizeObserver&&this.resizeObserver.unobserve(n.dom),n.dom.remove()}),this.above=this.manager.tooltips.map(n=>!!n.above),this.intersectionObserver=typeof IntersectionObserver=="function"?new IntersectionObserver(n=>{Date.now()>this.lastTransaction-50&&n.length>0&&n[n.length-1].intersectionRatio<1&&this.measureSoon()},{threshold:[1]}):null,this.observeIntersection(),t.win.addEventListener("resize",this.measureSoon=this.measureSoon.bind(this)),this.maybeMeasure()}createContainer(){this.parent?(this.container=document.createElement("div"),this.container.style.position="relative",this.container.className=this.view.themeClasses,this.parent.appendChild(this.container)):this.container=this.view.dom}observeIntersection(){if(this.intersectionObserver){this.intersectionObserver.disconnect();for(let t of this.manager.tooltipViews)this.intersectionObserver.observe(t.dom)}}measureSoon(){this.measureTimeout<0&&(this.measureTimeout=setTimeout(()=>{this.measureTimeout=-1,this.maybeMeasure()},50))}update(t){t.transactions.length&&(this.lastTransaction=Date.now());let e=this.manager.update(t,this.above);e&&this.observeIntersection();let n=e||t.geometryChanged,r=t.state.facet($x);if(r.position!=this.position&&!this.madeAbsolute){this.position=r.position;for(let o of this.manager.tooltipViews)o.dom.style.position=this.position;n=!0}if(r.parent!=this.parent){this.parent&&this.container.remove(),this.parent=r.parent,this.createContainer();for(let o of this.manager.tooltipViews)this.container.appendChild(o.dom);n=!0}else this.parent&&this.view.themeClasses!=this.classes&&(this.classes=this.container.className=this.view.themeClasses);n&&this.maybeMeasure()}createTooltip(t,e){let n=t.create(this.view),r=e?e.dom:null;if(n.dom.classList.add("cm-tooltip"),t.arrow&&!n.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")){let o=document.createElement("div");o.className="cm-tooltip-arrow",n.dom.appendChild(o)}return n.dom.style.position=this.position,n.dom.style.top=Uu,n.dom.style.left="0px",this.container.insertBefore(n.dom,r),n.mount&&n.mount(this.view),this.resizeObserver&&this.resizeObserver.observe(n.dom),n}destroy(){var t,e,n;this.view.win.removeEventListener("resize",this.measureSoon);for(let r of this.manager.tooltipViews)r.dom.remove(),(t=r.destroy)===null||t===void 0||t.call(r);this.parent&&this.container.remove(),(e=this.resizeObserver)===null||e===void 0||e.disconnect(),(n=this.intersectionObserver)===null||n===void 0||n.disconnect(),clearTimeout(this.measureTimeout)}readMeasure(){let t=1,e=1,n=!1,r=0;if(this.position=="fixed"&&this.manager.tooltipViews.length){let{dom:i}=this.manager.tooltipViews[0];if(P.safari){let l=i.getBoundingClientRect();n=Math.abs(l.top+1e4)>1||Math.abs(l.left)>1}else n=!!i.offsetParent&&i.offsetParent!=this.container.ownerDocument.body}if(n||this.position=="absolute")if(this.parent){let i=this.parent.getBoundingClientRect();i.width&&i.height&&(t=i.width/this.parent.offsetWidth,e=i.height/this.parent.offsetHeight)}else({scaleX:t,scaleY:e}=this.view.viewState);else r=YC(this.view).left;let o=this.view.scrollDOM.getBoundingClientRect(),a=Zg(this.view);return{visible:{left:o.left+a.left,top:o.top+a.top,right:o.right-a.right,bottom:o.bottom-a.bottom},parent:this.parent?this.container.getBoundingClientRect():this.view.dom.getBoundingClientRect(),pos:this.manager.tooltips.map((i,l)=>{let s=this.manager.tooltipViews[l];return s.getCoords?s.getCoords(i.pos):this.view.coordsAtPos(i.pos)}),size:this.manager.tooltipViews.map(({dom:i})=>i.getBoundingClientRect()),space:this.view.state.facet($x).tooltipSpace(this.view),scaleX:t,scaleY:e,makeAbsolute:n,fixedLeft:r}}writeMeasure(t){var e;if(t.makeAbsolute){this.madeAbsolute=!0,this.position="absolute";for(let l of this.manager.tooltipViews)l.dom.style.position="absolute"}let{visible:n,space:r,scaleX:o,scaleY:a}=t,i=[];for(let l=0;l<this.manager.tooltips.length;l++){let s=this.manager.tooltips[l],f=this.manager.tooltipViews[l],{dom:c}=f,u=t.pos[l],d=t.size[l];if(!u||s.clip!==!1&&(u.bottom<=Math.max(n.top,r.top)||u.top>=Math.min(n.bottom,r.bottom)||u.right<Math.max(n.left,r.left)-.1||u.left>Math.min(n.right,r.right)+.1)){c.style.top=Uu;continue}let p=s.arrow?f.dom.querySelector(".cm-tooltip-arrow"):null,h=p?7:0,y=d.right-d.left,b=(e=$k.get(f))!==null&&e!==void 0?e:d.bottom-d.top,m=f.offset||FL,g=this.view.textDirection==ge.LTR,x=d.width>r.right-r.left?g?r.left:r.right-d.width:g?Math.max(r.left,Math.min(u.left-(p?14:0)+m.x,r.right-y)):Math.min(Math.max(r.left,u.left-y+(p?14:0)-m.x),r.right-y),I=this.above[l];!s.strictSide&&(I?u.top-b-h-m.y<r.top:u.bottom+b+h+m.y>r.bottom)&&I==r.bottom-u.bottom>u.top-r.top&&(I=this.above[l]=!I);let v=(I?u.top-r.top:r.bottom-u.bottom)-h;if(v<b&&f.resize!==!1){if(v<this.view.defaultLineHeight){c.style.top=Uu;continue}$k.set(f,b),c.style.height=(b=v)/a+"px"}else c.style.height&&(c.style.height="");let w=I?u.top-b-h-m.y:u.bottom+h+m.y,S=x+y;if(f.overlap!==!0)for(let k of i)k.left<S&&k.right>x&&k.top<w+b&&k.bottom>w&&(w=I?k.top-b-2-h:k.bottom+h+2);if(this.position=="absolute"?(c.style.top=(w-t.parent.top)/a+"px",Zk(c,(x-t.parent.left)/o)):(c.style.top=w/a+"px",Zk(c,(x-t.fixedLeft)/o)),p){let k=u.left+(g?m.x:-m.x)-(x+14-7);p.style.left=k/o+"px"}f.overlap!==!0&&i.push({left:x,top:w,right:S,bottom:w+b}),c.classList.toggle("cm-tooltip-above",I),c.classList.toggle("cm-tooltip-below",!I),f.positioned&&f.positioned(t.space)}}maybeMeasure(){if(this.manager.tooltips.length&&(this.view.inView&&this.view.requestMeasure(this.measureReq),this.inView!=this.view.inView&&(this.inView=this.view.inView,!this.inView)))for(let t of this.manager.tooltipViews)t.dom.style.top=Uu}},{eventObservers:{scroll(){this.maybeMeasure()}}});EL=V.baseTheme({".cm-tooltip":{zIndex:500,boxSizing:"border-box"},"&light .cm-tooltip":{border:"1px solid #bbb",backgroundColor:"#f5f5f5"},"&light .cm-tooltip-section:not(:first-child)":{borderTop:"1px solid #bbb"},"&dark .cm-tooltip":{backgroundColor:"#333338",color:"white"},".cm-tooltip-arrow":{height:"7px",width:"14px",position:"absolute",zIndex:-1,overflow:"hidden","&:before, &:after":{content:"''",position:"absolute",width:0,height:0,borderLeft:"7px solid transparent",borderRight:"7px solid transparent"},".cm-tooltip-above &":{bottom:"-7px","&:before":{borderTop:"7px solid #bbb"},"&:after":{borderTop:"7px solid #f5f5f5",bottom:"1px"}},".cm-tooltip-below &":{top:"-7px","&:before":{borderBottom:"7px solid #bbb"},"&:after":{borderBottom:"7px solid #f5f5f5",top:"1px"}}},"&dark .cm-tooltip .cm-tooltip-arrow":{"&:before":{borderTopColor:"#333338",borderBottomColor:"#333338"},"&:after":{borderTopColor:"transparent",borderBottomColor:"transparent"}}}),FL={x:0,y:0},ty=z.define({enables:[JC,EL]});er=class extends yn{compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}eq(e){return!1}destroy(e){}};er.prototype.elementClass="";er.prototype.toDOM=void 0;er.prototype.mapMode=St.TrackBefore;er.prototype.startSide=er.prototype.endSide=-1;er.prototype.point=!0;Zx=z.define(),LL=z.define(),Vu=z.define(),jg=z.define({combine:t=>t.some(e=>e)});qL=_t.fromClass(class{constructor(t){this.view=t,this.domAfter=null,this.prevViewport=t.viewport,this.dom=document.createElement("div"),this.dom.className="cm-gutters cm-gutters-before",this.dom.setAttribute("aria-hidden","true"),this.dom.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.gutters=t.state.facet(Vu).map(e=>new nd(t,e)),this.fixed=!t.state.facet(jg);for(let e of this.gutters)e.config.side=="after"?this.getDOMAfter().appendChild(e.dom):this.dom.appendChild(e.dom);this.fixed&&(this.dom.style.position="sticky"),this.syncGutters(!1),t.scrollDOM.insertBefore(this.dom,t.contentDOM)}getDOMAfter(){return this.domAfter||(this.domAfter=document.createElement("div"),this.domAfter.className="cm-gutters cm-gutters-after",this.domAfter.setAttribute("aria-hidden","true"),this.domAfter.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.domAfter.style.position=this.fixed?"sticky":"",this.view.scrollDOM.appendChild(this.domAfter)),this.domAfter}update(t){if(this.updateGutters(t)){let e=this.prevViewport,n=t.view.viewport,r=Math.min(e.to,n.to)-Math.max(e.from,n.from);this.syncGutters(r<(n.to-n.from)*.8)}if(t.geometryChanged){let e=this.view.contentHeight/this.view.scaleY+"px";this.dom.style.minHeight=e,this.domAfter&&(this.domAfter.style.minHeight=e)}this.view.state.facet(jg)!=!this.fixed&&(this.fixed=!this.fixed,this.dom.style.position=this.fixed?"sticky":"",this.domAfter&&(this.domAfter.style.position=this.fixed?"sticky":"")),this.prevViewport=t.view.viewport}syncGutters(t){let e=this.dom.nextSibling;t&&(this.dom.remove(),this.domAfter&&this.domAfter.remove());let n=ce.iter(this.view.state.facet(Zx),this.view.viewport.from),r=[],o=this.gutters.map(a=>new Gg(a,this.view.viewport,-this.view.documentPadding.top));for(let a of this.view.viewportLineBlocks)if(r.length&&(r=[]),Array.isArray(a.type)){let i=!0;for(let l of a.type)if(l.type==Pt.Text&&i){Vg(n,r,l.from);for(let s of o)s.line(this.view,l,r);i=!1}else if(l.widget)for(let s of o)s.widget(this.view,l)}else if(a.type==Pt.Text){Vg(n,r,a.from);for(let i of o)i.line(this.view,a,r)}else if(a.widget)for(let i of o)i.widget(this.view,a);for(let a of o)a.finish();t&&(this.view.scrollDOM.insertBefore(this.dom,e),this.domAfter&&this.view.scrollDOM.appendChild(this.domAfter))}updateGutters(t){let e=t.startState.facet(Vu),n=t.state.facet(Vu),r=t.docChanged||t.heightChanged||t.viewportChanged||!ce.eq(t.startState.facet(Zx),t.state.facet(Zx),t.view.viewport.from,t.view.viewport.to);if(e==n)for(let o of this.gutters)o.update(t)&&(r=!0);else{r=!0;let o=[];for(let a of n){let i=e.indexOf(a);i<0?o.push(new nd(this.view,a)):(this.gutters[i].update(t),o.push(this.gutters[i]))}for(let a of this.gutters)a.dom.remove(),o.indexOf(a)<0&&a.destroy();for(let a of o)a.config.side=="after"?this.getDOMAfter().appendChild(a.dom):this.dom.appendChild(a.dom);this.gutters=o}return r}destroy(){for(let t of this.gutters)t.destroy();this.dom.remove(),this.domAfter&&this.domAfter.remove()}},{provide:t=>V.scrollMargins.of(e=>{let n=e.plugin(t);if(!n||n.gutters.length==0||!n.fixed)return null;let r=n.dom.offsetWidth*e.scaleX,o=n.domAfter?n.domAfter.offsetWidth*e.scaleX:0;return e.textDirection==ge.LTR?{left:r,right:o}:{right:r,left:o}})});Gg=class{constructor(e,n,r){this.gutter=e,this.height=r,this.i=0,this.cursor=ce.iter(e.markers,n.from)}addElement(e,n,r){let{gutter:o}=this,a=(n.top-this.height)/e.scaleY,i=n.height/e.scaleY;if(this.i==o.elements.length){let l=new rd(e,i,a,r);o.elements.push(l),o.dom.appendChild(l.dom)}else o.elements[this.i].update(e,i,a,r);this.height=n.bottom,this.i++}line(e,n,r){let o=[];Vg(this.cursor,o,n.from),r.length&&(o=o.concat(r));let a=this.gutter.config.lineMarker(e,n,o);a&&o.unshift(a);let i=this.gutter;o.length==0&&!i.config.renderEmptyElements||this.addElement(e,n,o)}widget(e,n){let r=this.gutter.config.widgetMarker(e,n.widget,n),o=r?[r]:null;for(let a of e.state.facet(LL)){let i=a(e,n.widget,n);i&&(o||(o=[])).push(i)}o&&this.addElement(e,n,o)}finish(){let e=this.gutter;for(;e.elements.length>this.i;){let n=e.elements.pop();e.dom.removeChild(n.dom),n.destroy()}}},nd=class{constructor(e,n){this.view=e,this.config=n,this.elements=[],this.spacer=null,this.dom=document.createElement("div"),this.dom.className="cm-gutter"+(this.config.class?" "+this.config.class:"");for(let r in n.domEventHandlers)this.dom.addEventListener(r,o=>{let a=o.target,i;if(a!=this.dom&&this.dom.contains(a)){for(;a.parentNode!=this.dom;)a=a.parentNode;let s=a.getBoundingClientRect();i=(s.top+s.bottom)/2}else i=o.clientY;let l=e.lineBlockAtHeight(i-e.documentTop);n.domEventHandlers[r](e,l,o)&&o.preventDefault()});this.markers=eC(n.markers(e)),n.initialSpacer&&(this.spacer=new rd(e,0,0,[n.initialSpacer(e)]),this.dom.appendChild(this.spacer.dom),this.spacer.dom.style.cssText+="visibility: hidden; pointer-events: none")}update(e){let n=this.markers;if(this.markers=eC(this.config.markers(e.view)),this.spacer&&this.config.updateSpacer){let o=this.config.updateSpacer(this.spacer.markers[0],e);o!=this.spacer.markers[0]&&this.spacer.update(e.view,0,0,[o])}let r=e.view.viewport;return!ce.eq(this.markers,n,r.from,r.to)||(this.config.lineMarkerChange?this.config.lineMarkerChange(e):!1)}destroy(){for(let e of this.elements)e.destroy()}},rd=class{constructor(e,n,r,o){this.height=-1,this.above=0,this.markers=[],this.dom=document.createElement("div"),this.dom.className="cm-gutterElement",this.update(e,n,r,o)}update(e,n,r,o){this.height!=n&&(this.height=n,this.dom.style.height=n+"px"),this.above!=r&&(this.dom.style.marginTop=(this.above=r)?r+"px":""),PL(this.markers,o)||this.setMarkers(e,o)}setMarkers(e,n){let r="cm-gutterElement",o=this.dom.firstChild;for(let a=0,i=0;;){let l=i,s=a<n.length?n[a++]:null,f=!1;if(s){let c=s.elementClass;c&&(r+=" "+c);for(let u=i;u<this.markers.length;u++)if(this.markers[u].compare(s)){l=u,f=!0;break}}else l=this.markers.length;for(;i<l;){let c=this.markers[i++];if(c.toDOM){c.destroy(o);let u=o.nextSibling;o.remove(),o=u}}if(!s)break;s.toDOM&&(f?o=o.nextSibling:this.dom.insertBefore(s.toDOM(e),o)),f&&i++}this.dom.className=r,this.markers=n}destroy(){this.setMarkers(null,[])}};_L=z.define(),zL=z.define(),Wi=z.define({combine(t){return wo(t,{formatNumber:String,domEventHandlers:{}},{domEventHandlers(e,n){let r=Object.assign({},e);for(let o in n){let a=r[o],i=n[o];r[o]=a?(l,s,f)=>a(l,s,f)||i(l,s,f):i}return r}})}}),Ks=class extends er{constructor(e){super(),this.number=e}eq(e){return this.number==e.number}toDOM(){return document.createTextNode(this.number)}};HL=Vu.compute([Wi],t=>({class:"cm-lineNumbers",renderEmptyElements:!1,markers(e){return e.state.facet(_L)},lineMarker(e,n,r){return r.some(o=>o.toDOM)?null:new Ks(eg(e,e.state.doc.lineAt(n.from).number))},widgetMarker:(e,n,r)=>{for(let o of e.state.facet(zL)){let a=o(e,n,r);if(a)return a}return null},lineMarkerChange:e=>e.startState.facet(Wi)!=e.state.facet(Wi),initialSpacer(e){return new Ks(eg(e,tC(e.state.doc.lines)))},updateSpacer(e,n){let r=eg(n.view,tC(n.view.state.doc.lines));return r==e.number?e:new Ks(r)},domEventHandlers:t.facet(Wi).domEventHandlers,side:"before"}))});function VL(t,e){return t.length==e.length&&t.every((n,r)=>n==e[r])}function GL(t){let e=[[]];for(let n=0;n<t.length;n++)for(let r=0,o=e.length;r<o;r++)e.push(e[r].concat(t[n]));return e.sort((n,r)=>r.length-n.length)}function ud(t){let e=Object.create(null);for(let n in t){let r=t[n];Array.isArray(r)||(r=[r]);for(let o of n.split(" "))if(o){let a=[],i=2,l=o;for(let u=0;;){if(l=="..."&&u>0&&u+3==o.length){i=1;break}let d=/^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);if(!d)throw new RangeError("Invalid path: "+o);if(a.push(d[0]=="*"?"":d[0][0]=='"'?JSON.parse(d[0]):d[0]),u+=d[0].length,u==o.length)break;let p=o[u++];if(u==o.length&&p=="!"){i=0;break}if(p!="/")throw new RangeError("Invalid path: "+o);l=o.slice(u)}let s=a.length-1,f=a[s];if(!f)throw new RangeError("Invalid path: "+o);let c=new Sa(r,i,s>0?a.slice(0,s):null);e[f]=c.sort(e[f])}}return t2.add(e)}function iy(t,e){let n=Object.create(null);for(let a of t)if(!Array.isArray(a.tag))n[a.tag.id]=a.class;else for(let i of a.tag)n[i.id]=a.class;let{scope:r,all:o=null}=e||{};return{style:a=>{let i=o;for(let l of a)for(let s of l.set){let f=n[s.id];if(f){i=i?i+" "+f:f;break}}return i},scope:r}}function QL(t,e){let n=null;for(let r of t){let o=r.style(e);o&&(n=n?n+" "+o:o)}return n}function n2(t,e,n,r=0,o=t.length){let a=new oy(r,Array.isArray(e)?e:[e],n);a.highlightRange(t.cursor(),r,o,"",a.highlighters),a.flush(o)}function XL(t){let e=t.type.prop(t2);for(;e&&e.context&&!t.matchContext(e.context);)e=e.next;return e||null}var UL,Fn,jL,cd,t2,Sa,oy,q,ld,To,ZC,e2,Mo,sd,ry,rr,wa,tr,nr,ay,rf,fd,R,H8,ly=F(()=>{Es();UL=0,Fn=class t{constructor(e,n,r,o){this.name=e,this.set=n,this.base=r,this.modified=o,this.id=UL++}toString(){let{name:e}=this;for(let n of this.modified)n.name&&(e=`${n.name}(${e})`);return e}static define(e,n){let r=typeof e=="string"?e:"?";if(e instanceof t&&(n=e),n?.base)throw new Error("Can not derive from a modified tag");let o=new t(r,[],null,[]);if(o.set.push(o),n)for(let a of n.set)o.set.push(a);return o}static defineModifier(e){let n=new cd(e);return r=>r.modified.indexOf(n)>-1?r:cd.get(r.base||r,r.modified.concat(n).sort((o,a)=>o.id-a.id))}},jL=0,cd=class t{constructor(e){this.name=e,this.instances=[],this.id=jL++}static get(e,n){if(!n.length)return e;let r=n[0].instances.find(l=>l.base==e&&VL(n,l.modified));if(r)return r;let o=[],a=new Fn(e.name,o,e,n);for(let l of n)l.instances.push(a);let i=GL(n);for(let l of e.set)if(!l.modified.length)for(let s of i)o.push(t.get(l,s));return a}};t2=new X({combine(t,e){let n,r,o;for(;t||e;){if(!t||e&&t.depth<=e.depth?(o=e,e=e.next):(o=t,t=t.next),n&&n.mode==o.mode&&!o.context&&!n.context)continue;let a=new Sa(o.tags,o.mode,o.context);n?n.next=a:r=a,n=a}return r}}),Sa=class{constructor(e,n,r,o){this.tags=e,this.mode=n,this.context=r,this.next=o}get opaque(){return this.mode==0}get inherit(){return this.mode==1}sort(e){return!e||e.depth<this.depth?(this.next=e,this):(e.next=this.sort(e.next),e)}get depth(){return this.context?this.context.length:0}};Sa.empty=new Sa([],2,null);oy=class{constructor(e,n,r){this.at=e,this.highlighters=n,this.span=r,this.class=""}startSpan(e,n){n!=this.class&&(this.flush(e),e>this.at&&(this.at=e),this.class=n)}flush(e){e>this.at&&this.class&&this.span(this.at,e,this.class)}highlightRange(e,n,r,o,a){let{type:i,from:l,to:s}=e;if(l>=r||s<=n)return;i.isTop&&(a=this.highlighters.filter(p=>!p.scope||p.scope(i)));let f=o,c=XL(e)||Sa.empty,u=QL(a,c.tags);if(u&&(f&&(f+=" "),f+=u,c.mode==1&&(o+=(o?" ":"")+u)),this.startSpan(Math.max(n,l),f),c.opaque)return;let d=e.tree&&e.tree.prop(X.mounted);if(d&&d.overlay){let p=e.node.enter(d.overlay[0].from+l,1),h=this.highlighters.filter(b=>!b.scope||b.scope(d.tree.type)),y=e.firstChild();for(let b=0,m=l;;b++){let g=b<d.overlay.length?d.overlay[b]:null,x=g?g.from+l:s,I=Math.max(n,m),v=Math.min(r,x);if(I<v&&y)for(;e.from<v&&(this.highlightRange(e,I,v,o,a),this.startSpan(Math.min(v,e.to),f),!(e.to>=x||!e.nextSibling())););if(!g||x>r)break;m=g.to+l,m>n&&(this.highlightRange(p.cursor(),Math.max(n,g.from+l),Math.min(r,m),"",h),this.startSpan(Math.min(r,m),f))}y&&e.parent()}else if(e.firstChild()){d&&(o="");do if(!(e.to<=n)){if(e.from>=r)break;this.highlightRange(e,n,r,o,a),this.startSpan(Math.min(r,e.to),f)}while(e.nextSibling());e.parent()}}};q=Fn.define,ld=q(),To=q(),ZC=q(To),e2=q(To),Mo=q(),sd=q(Mo),ry=q(Mo),rr=q(),wa=q(rr),tr=q(),nr=q(),ay=q(),rf=q(ay),fd=q(),R={comment:ld,lineComment:q(ld),blockComment:q(ld),docComment:q(ld),name:To,variableName:q(To),typeName:ZC,tagName:q(ZC),propertyName:e2,attributeName:q(e2),className:q(To),labelName:q(To),namespace:q(To),macroName:q(To),literal:Mo,string:sd,docString:q(sd),character:q(sd),attributeValue:q(sd),number:ry,integer:q(ry),float:q(ry),bool:q(Mo),regexp:q(Mo),escape:q(Mo),color:q(Mo),url:q(Mo),keyword:tr,self:q(tr),null:q(tr),atom:q(tr),unit:q(tr),modifier:q(tr),operatorKeyword:q(tr),controlKeyword:q(tr),definitionKeyword:q(tr),moduleKeyword:q(tr),operator:nr,derefOperator:q(nr),arithmeticOperator:q(nr),logicOperator:q(nr),bitwiseOperator:q(nr),compareOperator:q(nr),updateOperator:q(nr),definitionOperator:q(nr),typeOperator:q(nr),controlOperator:q(nr),punctuation:ay,separator:q(ay),bracket:rf,angleBracket:q(rf),squareBracket:q(rf),paren:q(rf),brace:q(rf),content:rr,heading:wa,heading1:q(wa),heading2:q(wa),heading3:q(wa),heading4:q(wa),heading5:q(wa),heading6:q(wa),contentSeparator:q(rr),list:q(rr),quote:q(rr),emphasis:q(rr),strong:q(rr),link:q(rr),monospace:q(rr),strikethrough:q(rr),inserted:q(),deleted:q(),changed:q(),invalid:q(),meta:fd,documentMeta:q(fd),annotation:q(fd),processingInstruction:q(fd),definition:Fn.defineModifier("definition"),constant:Fn.defineModifier("constant"),function:Fn.defineModifier("function"),standard:Fn.defineModifier("standard"),local:Fn.defineModifier("local"),special:Fn.defineModifier("special")};for(let t in R){let e=R[t];e instanceof Fn&&(e.name=t)}H8=iy([{tag:R.link,class:"tok-link"},{tag:R.heading,class:"tok-heading"},{tag:R.emphasis,class:"tok-emphasis"},{tag:R.strong,class:"tok-strong"},{tag:R.keyword,class:"tok-keyword"},{tag:R.atom,class:"tok-atom"},{tag:R.bool,class:"tok-bool"},{tag:R.url,class:"tok-url"},{tag:R.labelName,class:"tok-labelName"},{tag:R.inserted,class:"tok-inserted"},{tag:R.deleted,class:"tok-deleted"},{tag:R.literal,class:"tok-literal"},{tag:R.string,class:"tok-string"},{tag:R.number,class:"tok-number"},{tag:[R.regexp,R.escape,R.special(R.string)],class:"tok-string2"},{tag:R.variableName,class:"tok-variableName"},{tag:R.local(R.variableName),class:"tok-variableName tok-local"},{tag:R.definition(R.variableName),class:"tok-variableName tok-definition"},{tag:R.special(R.variableName),class:"tok-variableName2"},{tag:R.definition(R.propertyName),class:"tok-propertyName tok-definition"},{tag:R.typeName,class:"tok-typeName"},{tag:R.namespace,class:"tok-namespace"},{tag:R.className,class:"tok-className"},{tag:R.macroName,class:"tok-macroName"},{tag:R.propertyName,class:"tok-propertyName"},{tag:R.operator,class:"tok-operator"},{tag:R.comment,class:"tok-comment"},{tag:R.meta,class:"tok-meta"},{tag:R.invalid,class:"tok-invalid"},{tag:R.punctuation,class:"tok-punctuation"}])});function WL(t){return z.define({combine:t?e=>e.concat(t):void 0})}function r2(t,e,n){let r=t.facet(il),o=gt(t).topNode;if(!r||r.allowsNesting)for(let a=o;a;a=a.enter(e,n,Be.ExcludeBuffers|Be.EnterBracketed))a.type.isTop&&(o=a);return o}function gt(t){let e=t.field(en.state,!1);return e?e.tree:Ue.empty}function o2(t,e,n){return ua.applyChanges(t,[{fromA:e,toA:n,fromB:e,toB:n}])}function sf(t){let e=t.facet(lf);return e.charCodeAt(0)==9?t.tabSize*e.length:e.length}function ff(t,e){let n="",r=t.tabSize,o=t.facet(lf)[0];if(o=="	"){for(;e>=r;)n+="	",e-=r;o=" "}for(let a=0;a<e;a++)n+=o;return n}function by(t,e){t instanceof Ee&&(t=new ka(t));for(let r of t.state.facet(JL)){let o=r(t,e);if(o!==void 0)return o}let n=gt(t.state);return n.length>=e?$L(t,n,e):null}function $L(t,e,n){let r=e.resolveStack(n),o=e.resolveInner(n,-1).resolve(n,0).enterUnfinishedNodesBefore(n);if(o!=r.node){let a=[];for(let i=o;i&&!(i.from<r.node.from||i.to>r.node.to||i.from==r.node.from&&i.type==r.node.type);i=i.parent)a.push(i);for(let i=a.length-1;i>=0;i--)r={node:a[i],next:r}}return c2(r,t,n)}function c2(t,e,n){for(let r=t;r;r=r.next){let o=eN(r.node);if(o)return o(my.create(e,n,r))}return 0}function ZL(t){return t.pos==t.options.simulateBreak&&t.options.simulateDoubleBreak}function eN(t){let e=t.type.prop(Iy);if(e)return e;let n=t.firstChild,r;if(n&&(r=n.type.prop(X.closedBy))){let o=t.lastChild,a=o&&r.indexOf(o.name)>-1;return i=>oN(i,!0,1,void 0,a&&!ZL(i)?o.from:void 0)}return t.parent==null?tN:null}function tN(){return 0}function nN(t,e){for(let n=e;n;n=n.parent)if(t==n)return!0;return!1}function rN(t){let e=t.node,n=e.childAfter(e.from),r=e.lastChild;if(!n)return null;let o=t.options.simulateBreak,a=t.state.doc.lineAt(n.from),i=o==null||o<=a.from?a.to:Math.min(a.to,o);for(let l=n.to;;){let s=e.childAfter(l);if(!s||s==r)return null;if(!s.type.isSkipped){if(s.from>=i)return null;let f=/^ */.exec(a.text.slice(n.to-a.from))[0].length;return{from:n.from,to:n.to+f}}l=s.to}}function oN(t,e,n,r,o){let a=t.textAfter,i=a.match(/^\s*/)[0].length,l=r&&a.slice(i,i+r.length)==r||o==t.pos+i,s=e?rN(t):null;return s?l?t.column(s.from):t.column(s.to):t.baseIndent+(l?0:t.unit*n)}function u2({except:t,units:e=1}={}){return n=>{let r=t&&t.test(n.textAfter);return n.baseIndent+(r?0:e*n.unit)}}function cy(t){let e=t.facet(hy);return e.length?e:t.facet(p2)}function m2(t,e){let n=[aN],r;return t instanceof ll&&(t.module&&n.push(V.styleModule.of(t.module)),r=t.themeType),e?.fallback?n.push(p2.of(t)):r?n.push(hy.computeN([V.darkTheme],o=>o.facet(V.darkTheme)==(r=="dark")?[t]:[])):n.push(hy.of(t)),n}function fN(t){let e=[],n=t.matched?lN:sN;return e.push(n.range(t.start.from,t.start.to)),t.end&&e.push(n.range(t.end.from,t.end.to)),e}function a2(t){let e=[],n=t.facet(y2);for(let r of t.selection.ranges){if(!r.empty)continue;let o=Ln(t,r.head,-1,n)||r.head>0&&Ln(t,r.head-1,1,n)||n.afterCursor&&(Ln(t,r.head,1,n)||r.head<t.doc.length&&Ln(t,r.head+1,-1,n));o&&(e=e.concat(n.renderMatch(o,t)))}return Y.set(e,!0)}function b2(t={}){return[y2.of(t),uN]}function gy(t,e,n){let r=t.prop(e<0?X.openedBy:X.closedBy);if(r)return r;if(t.name.length==1){let o=n.indexOf(t.name);if(o>-1&&o%2==(e<0?1:0))return[n[o+e]]}return null}function yy(t){let e=t.type.prop(dN);return e?e(t.node):t}function Ln(t,e,n,r={}){let o=r.maxScanDistance||x2,a=r.brackets||g2,i=gt(t),l=i.resolveInner(e,n);for(let s=l;s;s=s.parent){let f=gy(s.type,n,a);if(f&&s.from<s.to){let c=yy(s);if(c&&(n>0?e>=c.from&&e<c.to:e>c.from&&e<=c.to))return pN(t,e,n,s,c,f,a)}}return mN(t,e,n,i,l.type,o,a)}function pN(t,e,n,r,o,a,i){let l=r.parent,s={from:o.from,to:o.to},f=0,c=l?.cursor();if(c&&(n<0?c.childBefore(r.from):c.childAfter(r.to)))do if(n<0?c.to<=r.from:c.from>=r.to){if(f==0&&a.indexOf(c.type.name)>-1&&c.from<c.to){let u=yy(c);return{start:s,end:u?{from:u.from,to:u.to}:void 0,matched:!0}}else if(gy(c.type,n,i))f++;else if(gy(c.type,-n,i)){if(f==0){let u=yy(c);return{start:s,end:u&&u.from<u.to?{from:u.from,to:u.to}:void 0,matched:!1}}f--}}while(n<0?c.prevSibling():c.nextSibling());return{start:s,matched:!1}}function mN(t,e,n,r,o,a,i){if(n<0?!e:e==t.doc.length)return null;let l=n<0?t.sliceDoc(e-1,e):t.sliceDoc(e,e+1),s=i.indexOf(l);if(s<0||s%2==0!=n>0)return null;let f={from:n<0?e-1:e,to:n>0?e+1:e},c=t.doc.iterRange(e,n>0?t.doc.length:0),u=0;for(let d=0;!c.next().done&&d<=a;){let p=c.value;n<0&&(d+=p.length);let h=e+d*n;for(let y=n>0?0:p.length-1,b=n>0?p.length:-1;y!=b;y+=n){let m=i.indexOf(p[y]);if(!(m<0||r.resolveInner(h+y,1).type!=o))if(m%2==0==n>0)u++;else{if(u==1)return{start:f,end:{from:h+y,to:h+y+1},matched:m>>1==s>>1};u--}}n>0&&(d+=p.length)}return c.done?{start:f,matched:!1}:null}function uy(t,e){l2.indexOf(t)>-1||(l2.push(t),console.warn(e))}function gN(t,e){let n=[];for(let l of e.split(" ")){let s=[];for(let f of l.split(".")){let c=t[f]||R[f];c?typeof c=="function"?s.length?s=s.map(c):uy(f,`Modifier ${f} used at start of tag`):s.length?uy(f,`Tag ${f} used as modifier`):s=Array.isArray(c)?c:[c]:uy(f,`Unknown highlighting tag ${f}`)}for(let f of s)n.push(f)}if(!n.length)return 0;let r=e.replace(/ /g,"_"),o=r+" "+n.map(l=>l.id),a=s2[o];if(a)return a.id;let i=s2[o]=mt.define({id:i2.length,name:r,props:[ud({[r]:n})]});return i2.push(i),i.id}var sy,al,KL,en,dd,dy,of,py,af,f2,fy,YL,il,pd,JL,lf,ka,Iy,my,d2,ll,hy,p2,xy,aN,h2,iN,x2,g2,y2,lN,sN,cN,uN,dN,hN,i2,l2,s2,xN,Y8,cf=F(()=>{Es();ji();nf();ly();Qx();al=new X;KL=new X,en=class{constructor(e,n,r=[],o=""){this.data=e,this.name=o,Ee.prototype.hasOwnProperty("tree")||Object.defineProperty(Ee.prototype,"tree",{get(){return gt(this)}}),this.parser=n,this.extension=[il.of(this),Ee.languageData.of((a,i,l)=>{let s=r2(a,i,l),f=s.type.prop(al);if(!f)return[];let c=a.facet(f),u=s.type.prop(KL);if(u){let d=s.resolve(i-s.from,l);for(let p of u)if(p.test(d,a)){let h=a.facet(p.facet);return p.type=="replace"?h:h.concat(c)}}return c})].concat(r)}isActiveAt(e,n,r=-1){return r2(e,n,r).type.prop(al)==this.data}findRegions(e){let n=e.facet(il);if(n?.data==this.data)return[{from:0,to:e.doc.length}];if(!n||!n.allowsNesting)return[];let r=[],o=(a,i)=>{if(a.prop(al)==this.data){r.push({from:i,to:i+a.length});return}let l=a.prop(X.mounted);if(l){if(l.tree.prop(al)==this.data){if(l.overlay)for(let s of l.overlay)r.push({from:s.from+i,to:s.to+i});else r.push({from:i,to:i+a.length});return}else if(l.overlay){let s=r.length;if(o(l.tree,l.overlay[0].from+i),r.length>s)return}}for(let s=0;s<a.children.length;s++){let f=a.children[s];f instanceof Ue&&o(f,a.positions[s]+i)}};return o(gt(e),0),r}get allowsNesting(){return!0}};en.setState=le.define();dd=class t extends en{constructor(e,n,r){super(e,n,[],r),this.parser=n}static define(e){let n=WL(e.languageData);return new t(n,e.parser.configure({props:[al.add(r=>r.isTop?n:void 0)]}),e.name)}configure(e,n){return new t(this.data,this.parser.configure(e),n||this.name)}get allowsNesting(){return this.parser.hasWrappers()}};dy=class{constructor(e){this.doc=e,this.cursorPos=0,this.string="",this.cursor=e.iter()}get length(){return this.doc.length}syncTo(e){return this.string=this.cursor.next(e-this.cursorPos).value,this.cursorPos=e+this.string.length,this.cursorPos-this.string.length}chunk(e){return this.syncTo(e),this.string}get lineChunks(){return!0}read(e,n){let r=this.cursorPos-this.string.length;return e<r||n>=this.cursorPos?this.doc.sliceString(e,n):this.string.slice(e-r,n-r)}},of=null,py=class t{constructor(e,n,r=[],o,a,i,l,s){this.parser=e,this.state=n,this.fragments=r,this.tree=o,this.treeLen=a,this.viewport=i,this.skipped=l,this.scheduleOn=s,this.parse=null,this.tempSkipped=[]}static create(e,n,r){return new t(e,n,[],Ue.empty,0,r,[],null)}startParse(){return this.parser.startParse(new dy(this.state.doc),this.fragments)}work(e,n){return n!=null&&n>=this.state.doc.length&&(n=void 0),this.tree!=Ue.empty&&this.isDone(n??this.state.doc.length)?(this.takeTree(),!0):this.withContext(()=>{var r;if(typeof e=="number"){let o=Date.now()+e;e=()=>Date.now()>o}for(this.parse||(this.parse=this.startParse()),n!=null&&(this.parse.stoppedAt==null||this.parse.stoppedAt>n)&&n<this.state.doc.length&&this.parse.stopAt(n);;){let o=this.parse.advance();if(o)if(this.fragments=this.withoutTempSkipped(ua.addTree(o,this.fragments,this.parse.stoppedAt!=null)),this.treeLen=(r=this.parse.stoppedAt)!==null&&r!==void 0?r:this.state.doc.length,this.tree=o,this.parse=null,this.treeLen<(n??this.state.doc.length))this.parse=this.startParse();else return!0;if(e())return!1}})}takeTree(){let e,n;this.parse&&(e=this.parse.parsedPos)>=this.treeLen&&((this.parse.stoppedAt==null||this.parse.stoppedAt>e)&&this.parse.stopAt(e),this.withContext(()=>{for(;!(n=this.parse.advance()););}),this.treeLen=e,this.tree=n,this.fragments=this.withoutTempSkipped(ua.addTree(this.tree,this.fragments,!0)),this.parse=null)}withContext(e){let n=of;of=this;try{return e()}finally{of=n}}withoutTempSkipped(e){for(let n;n=this.tempSkipped.pop();)e=o2(e,n.from,n.to);return e}changes(e,n){let{fragments:r,tree:o,treeLen:a,viewport:i,skipped:l}=this;if(this.takeTree(),!e.empty){let s=[];if(e.iterChangedRanges((f,c,u,d)=>s.push({fromA:f,toA:c,fromB:u,toB:d})),r=ua.applyChanges(r,s),o=Ue.empty,a=0,i={from:e.mapPos(i.from,-1),to:e.mapPos(i.to,1)},this.skipped.length){l=[];for(let f of this.skipped){let c=e.mapPos(f.from,1),u=e.mapPos(f.to,-1);c<u&&l.push({from:c,to:u})}}}return new t(this.parser,n,r,o,a,i,l,this.scheduleOn)}updateViewport(e){if(this.viewport.from==e.from&&this.viewport.to==e.to)return!1;this.viewport=e;let n=this.skipped.length;for(let r=0;r<this.skipped.length;r++){let{from:o,to:a}=this.skipped[r];o<e.to&&a>e.from&&(this.fragments=o2(this.fragments,o,a),this.skipped.splice(r--,1))}return this.skipped.length>=n?!1:(this.reset(),!0)}reset(){this.parse&&(this.takeTree(),this.parse=null)}skipUntilInView(e,n){this.skipped.push({from:e,to:n})}static getSkippingParser(e){return new class extends Ni{createParse(n,r,o){let a=o[0].from,i=o[o.length-1].to;return{parsedPos:a,advance(){let s=of;if(s){for(let f of o)s.tempSkipped.push(f);e&&(s.scheduleOn=s.scheduleOn?Promise.all([s.scheduleOn,e]):e)}return this.parsedPos=i,new Ue(mt.none,[],[],i-a)},stoppedAt:null,stopAt(){}}}}}isDone(e){e=Math.min(e,this.state.doc.length);let n=this.fragments;return this.treeLen>=e&&n.length&&n[0].from==0&&n[0].to>=e}static get(){return of}};af=class t{constructor(e){this.context=e,this.tree=e.tree}apply(e){if(!e.docChanged&&this.tree==this.context.tree)return this;let n=this.context.changes(e.changes,e.state),r=this.context.treeLen==e.startState.doc.length?void 0:Math.max(e.changes.mapPos(this.context.treeLen),n.viewport.to);return n.work(20,r)||n.takeTree(),new t(n)}static init(e){let n=Math.min(3e3,e.doc.length),r=py.create(e.facet(il).parser,e,{from:0,to:n});return r.work(20,n)||r.takeTree(),new t(r)}};en.state=xt.define({create:af.init,update(t,e){for(let n of e.effects)if(n.is(en.setState))return n.value;return e.startState.facet(il)!=e.state.facet(il)?af.init(e.state):t.apply(e)}});f2=t=>{let e=setTimeout(()=>t(),500);return()=>clearTimeout(e)};typeof requestIdleCallback<"u"&&(f2=t=>{let e=-1,n=setTimeout(()=>{e=requestIdleCallback(t,{timeout:400})},100);return()=>e<0?clearTimeout(n):cancelIdleCallback(e)});fy=typeof navigator<"u"&&(!((sy=navigator.scheduling)===null||sy===void 0)&&sy.isInputPending)?()=>navigator.scheduling.isInputPending():null,YL=_t.fromClass(class{constructor(e){this.view=e,this.working=null,this.workScheduled=0,this.chunkEnd=-1,this.chunkBudget=-1,this.work=this.work.bind(this),this.scheduleWork()}update(e){let n=this.view.state.field(en.state).context;(n.updateViewport(e.view.viewport)||this.view.viewport.to>n.treeLen)&&this.scheduleWork(),(e.docChanged||e.selectionSet)&&(this.view.hasFocus&&(this.chunkBudget+=50),this.scheduleWork()),this.checkAsyncSchedule(n)}scheduleWork(){if(this.working)return;let{state:e}=this.view,n=e.field(en.state);(n.tree!=n.context.tree||!n.context.isDone(e.doc.length))&&(this.working=f2(this.work))}work(e){this.working=null;let n=Date.now();if(this.chunkEnd<n&&(this.chunkEnd<0||this.view.hasFocus)&&(this.chunkEnd=n+3e4,this.chunkBudget=3e3),this.chunkBudget<=0)return;let{state:r,viewport:{to:o}}=this.view,a=r.field(en.state);if(a.tree==a.context.tree&&a.context.isDone(o+1e5))return;let i=Date.now()+Math.min(this.chunkBudget,100,e&&!fy?Math.max(25,e.timeRemaining()-5):1e9),l=a.context.treeLen<o&&r.doc.length>o+1e3,s=a.context.work(()=>fy&&fy()||Date.now()>i,o+(l?0:1e5));this.chunkBudget-=Date.now()-n,(s||this.chunkBudget<=0)&&(a.context.takeTree(),this.view.dispatch({effects:en.setState.of(new af(a.context))})),this.chunkBudget>0&&!(s&&!l)&&this.scheduleWork(),this.checkAsyncSchedule(a.context)}checkAsyncSchedule(e){e.scheduleOn&&(this.workScheduled++,e.scheduleOn.then(()=>this.scheduleWork()).catch(n=>At(this.view.state,n)).then(()=>this.workScheduled--),e.scheduleOn=null)}destroy(){this.working&&this.working()}isWorking(){return!!(this.working||this.workScheduled>0)}},{eventHandlers:{focus(){this.scheduleWork()}}}),il=z.define({combine(t){return t.length?t[0]:null},enables:t=>[en.state,YL,V.contentAttributes.compute([t],e=>{let n=e.facet(t);return n&&n.name?{"data-language":n.name}:{}})]}),pd=class{constructor(e,n=[]){this.language=e,this.support=n,this.extension=[e,n]}},JL=z.define(),lf=z.define({combine:t=>{if(!t.length)return"  ";let e=t[0];if(!e||/\S/.test(e)||Array.from(e).some(n=>n!=e[0]))throw new Error("Invalid indent unit: "+JSON.stringify(t[0]));return e}});ka=class{constructor(e,n={}){this.state=e,this.options=n,this.unit=sf(e)}lineAt(e,n=1){let r=this.state.doc.lineAt(e),{simulateBreak:o,simulateDoubleBreak:a}=this.options;return o!=null&&o>=r.from&&o<=r.to?a&&o==e?{text:"",from:e}:(n<0?o<e:o<=e)?{text:r.text.slice(o-r.from),from:o}:{text:r.text.slice(0,o-r.from),from:r.from}:r}textAfterPos(e,n=1){if(this.options.simulateDoubleBreak&&e==this.options.simulateBreak)return"";let{text:r,from:o}=this.lineAt(e,n);return r.slice(e-o,Math.min(r.length,e+100-o))}column(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.countColumn(r,e-o),i=this.options.overrideIndentation?this.options.overrideIndentation(o):-1;return i>-1&&(a+=i-this.countColumn(r,r.search(/\S|$/))),a}countColumn(e,n=e.length){return ga(e,this.state.tabSize,n)}lineIndent(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.options.overrideIndentation;if(a){let i=a(o);if(i>-1)return i}return this.countColumn(r,r.search(/\S|$/))}get simulatedBreak(){return this.options.simulateBreak||null}},Iy=new X;my=class t extends ka{constructor(e,n,r){super(e.state,e.options),this.base=e,this.pos=n,this.context=r}get node(){return this.context.node}static create(e,n,r){return new t(e,n,r)}get textAfter(){return this.textAfterPos(this.pos)}get baseIndent(){return this.baseIndentFor(this.node)}baseIndentFor(e){let n=this.state.doc.lineAt(e.from);for(;;){let r=e.resolve(n.from);for(;r.parent&&r.parent.from==r.from;)r=r.parent;if(nN(r,e))break;n=this.state.doc.lineAt(r.from)}return this.lineIndent(n.from)}continue(){return c2(this.context.next,this.base,this.pos)}};d2=new X,ll=class t{constructor(e,n){this.specs=e;let r;function o(l){let s=bn.newName();return(r||(r=Object.create(null)))["."+s]=l,s}let a=typeof n.all=="string"?n.all:n.all?o(n.all):void 0,i=n.scope;this.scope=i instanceof en?l=>l.prop(al)==i.data:i?l=>l==i:void 0,this.style=iy(e.map(l=>({tag:l.tag,class:l.class||o(Object.assign({},l,{tag:null}))})),{all:a}).style,this.module=r?new bn(r):null,this.themeType=n.themeType}static define(e,n){return new t(e,n||{})}},hy=z.define(),p2=z.define({combine(t){return t.length?[t[0]]:null}});xy=class{constructor(e){this.markCache=Object.create(null),this.tree=gt(e.state),this.decorations=this.buildDeco(e,cy(e.state)),this.decoratedTo=e.viewport.to}update(e){let n=gt(e.state),r=cy(e.state),o=r!=cy(e.startState),{viewport:a}=e.view,i=e.changes.mapPos(this.decoratedTo,1);n.length<a.to&&!o&&n.type==this.tree.type&&i>=a.to?(this.decorations=this.decorations.map(e.changes),this.decoratedTo=i):(n!=this.tree||e.viewportChanged||o)&&(this.tree=n,this.decorations=this.buildDeco(e.view,r),this.decoratedTo=a.to)}buildDeco(e,n){if(!n||!this.tree.length)return Y.none;let r=new Jn;for(let{from:o,to:a}of e.visibleRanges)n2(this.tree,n,(i,l,s)=>{r.add(i,l,this.markCache[s]||(this.markCache[s]=Y.mark({class:s})))},o,a);return r.finish()}},aN=On.high(_t.fromClass(xy,{decorations:t=>t.decorations})),h2=ll.define([{tag:R.meta,color:"#404740"},{tag:R.link,textDecoration:"underline"},{tag:R.heading,textDecoration:"underline",fontWeight:"bold"},{tag:R.emphasis,fontStyle:"italic"},{tag:R.strong,fontWeight:"bold"},{tag:R.strikethrough,textDecoration:"line-through"},{tag:R.keyword,color:"#708"},{tag:[R.atom,R.bool,R.url,R.contentSeparator,R.labelName],color:"#219"},{tag:[R.literal,R.inserted],color:"#164"},{tag:[R.string,R.deleted],color:"#a11"},{tag:[R.regexp,R.escape,R.special(R.string)],color:"#e40"},{tag:R.definition(R.variableName),color:"#00f"},{tag:R.local(R.variableName),color:"#30a"},{tag:[R.typeName,R.namespace],color:"#085"},{tag:R.className,color:"#167"},{tag:[R.special(R.variableName),R.macroName],color:"#256"},{tag:R.definition(R.propertyName),color:"#00c"},{tag:R.comment,color:"#940"},{tag:R.invalid,color:"#f00"}]),iN=V.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),x2=1e4,g2="()[]{}",y2=z.define({combine(t){return wo(t,{afterCursor:!0,brackets:g2,maxScanDistance:x2,renderMatch:fN})}}),lN=Y.mark({class:"cm-matchingBracket"}),sN=Y.mark({class:"cm-nonmatchingBracket"});cN=_t.fromClass(class{constructor(t){this.paused=!1,this.decorations=a2(t.state)}update(t){(t.docChanged||t.selectionSet||this.paused)&&(t.view.composing?(this.decorations=this.decorations.map(t.changes),this.paused=!0):(this.decorations=a2(t.state),this.paused=!1))}},{decorations:t=>t.decorations}),uN=[cN,iN];dN=new X;hN=Object.create(null),i2=[mt.none],l2=[],s2=Object.create(null),xN=Object.create(null);for(let[t,e]of[["variable","variableName"],["variable-2","variableName.special"],["string-2","string.special"],["def","variableName.definition"],["tag","tagName"],["attribute","attributeName"],["type","typeName"],["builtin","variableName.standard"],["qualifier","modifier"],["error","invalid"],["header","heading"],["property","propertyName"]])xN[t]=gN(hN,e);Y8={rtl:Y.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"rtl"},bidiIsolate:ge.RTL}),ltr:Y.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"ltr"},bidiIsolate:ge.LTR}),auto:Y.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"auto"},bidiIsolate:null})}});function uf(t,e=Uint16Array){if(typeof t!="string")return t;let n=null;for(let r=0,o=0;r<t.length;){let a=0;for(;;){let i=t.charCodeAt(r++),l=!1;if(i==126){a=65535;break}i>=92&&i--,i>=34&&i--;let s=i-32;if(s>=46&&(s-=46,l=!0),a+=s,l)break;a*=46}n?n[o++]=a:n=new e(a)}return n}function C2(t,e,n,r,o,a){let i=0,l=1<<r,{dialect:s}=n.p.parser;e:for(;(l&t[i])!=0;){let f=t[i+1];for(let p=i+3;p<f;p+=2)if((t[p+1]&l)>0){let h=t[p];if(s.allows(h)&&(e.token.value==-1||e.token.value==h||bN(h,e.token.value,o,a))){e.acceptToken(h);break}}let c=e.next,u=0,d=t[i+2];if(e.next<0&&d>u&&t[f+d*3-3]==65535){i=t[f+d*3-1];continue e}for(;u<d;){let p=u+d>>1,h=f+p+(p<<1),y=t[h],b=t[h+1]||65536;if(c<y)d=p;else if(c>=b)u=p+1;else{i=t[h+2],e.advance();continue e}}break}}function v2(t,e,n){for(let r=e,o;(o=t[r])!=65535;r++)if(o==n)return r-e;return-1}function bN(t,e,n,r){let o=v2(n,r,e);return o<0||v2(n,r,t)<o}function w2(t,e,n){let r=t.cursor(Be.IncludeAnonymous);for(r.moveTo(e);;)if(!(n<0?r.childBefore(e):r.childAfter(e)))for(;;){if((n<0?r.to<e:r.from>e)&&!r.type.isError)return n<0?Math.max(0,Math.min(r.to-1,e-25)):Math.min(t.length,Math.max(r.from+1,e+25));if(n<0?r.prevSibling():r.nextSibling())break;if(!r.parent())return n<0?0:t.length}}function S2(t,e){for(let n=0;n<e.length;n++){let r=e[n];if(r.pos==t.pos&&r.sameState(t)){e[n].score<t.score&&(e[n]=t);return}}e.push(t)}function Fr(t,e){return t[e]|t[e+1]<<16}function IN(t){let e=null;for(let n of t){let r=n.p.stoppedAt;(n.pos==n.p.stream.end||r!=null&&n.pos>r)&&n.p.parser.stateFlag(n.state,2)&&(!e||e.score<n.score)&&(e=n)}return e}function k2(t){if(t.external){let e=t.extend?1:0;return(n,r)=>t.external(n,r)<<1|e}return t.get}var wy,md,Sy,ky,sl,I2,Cy,Do,Ay,hd,tn,vy,Ty,My,Dy,Oy,xd,A2=F(()=>{Es();wy=class t{constructor(e,n,r,o,a,i,l,s,f,c=0,u){this.p=e,this.stack=n,this.state=r,this.reducePos=o,this.pos=a,this.score=i,this.buffer=l,this.bufferBase=s,this.curContext=f,this.lookAhead=c,this.parent=u}toString(){return`[${this.stack.filter((e,n)=>n%3==0).concat(this.state)}]@${this.pos}${this.score?"!"+this.score:""}`}static start(e,n,r=0){let o=e.parser.context;return new t(e,[],n,r,r,0,[],0,o?new md(o,o.start):null,0,null)}get context(){return this.curContext?this.curContext.context:null}pushState(e,n){this.stack.push(this.state,n,this.bufferBase+this.buffer.length),this.state=e}reduce(e){var n;let r=e>>19,o=e&65535,{parser:a}=this.p,i=this.reducePos<this.pos-25&&this.setLookAhead(this.pos),l=a.dynamicPrecedence(o);if(l&&(this.score+=l),r==0){o<a.minRepeatTerm&&this.reducePos<this.pos&&(this.reducePos=this.pos),this.pushState(a.getGoto(this.state,o,!0),this.reducePos),o<a.minRepeatTerm&&this.storeNode(o,this.reducePos,this.reducePos,i?8:4,!0),this.reduceContext(o,this.reducePos);return}let s=this.stack.length-(r-1)*3-(e&262144?6:0),f=s?this.stack[s-2]:this.p.ranges[0].from;o<a.minRepeatTerm&&f==this.reducePos&&this.reducePos<this.pos&&(this.reducePos=this.pos);let c=this.reducePos-f;c>=2e3&&!(!((n=this.p.parser.nodeSet.types[o])===null||n===void 0)&&n.isAnonymous)&&(f==this.p.lastBigReductionStart?(this.p.bigReductionCount++,this.p.lastBigReductionSize=c):this.p.lastBigReductionSize<c&&(this.p.bigReductionCount=1,this.p.lastBigReductionStart=f,this.p.lastBigReductionSize=c));let u=s?this.stack[s-1]:0,d=this.bufferBase+this.buffer.length-u;if(o<a.minRepeatTerm||e&131072){let p=a.stateFlag(this.state,1)?this.pos:this.reducePos;this.storeNode(o,f,p,d+4,!0)}if(e&262144)this.state=this.stack[s];else{let p=this.stack[s-3];this.state=a.getGoto(p,o,!0)}for(;this.stack.length>s;)this.stack.pop();this.reduceContext(o,f)}storeNode(e,n,r,o=4,a=!1){if(e==0&&(!this.stack.length||this.stack[this.stack.length-1]<this.buffer.length+this.bufferBase)){let i=this.buffer.length;if(i>0&&this.buffer[i-4]==0&&this.buffer[i-1]>-1){if(n==r)return;if(this.buffer[i-2]>=n){this.buffer[i-2]=r;return}}}if(!a||this.pos==r)this.buffer.push(e,n,r,o);else{let i=this.buffer.length;if(i>0&&(this.buffer[i-4]!=0||this.buffer[i-1]<0)){let l=!1;for(let s=i;s>0&&this.buffer[s-2]>r;s-=4)if(this.buffer[s-1]>=0){l=!0;break}if(l)for(;i>0&&this.buffer[i-2]>r;)this.buffer[i]=this.buffer[i-4],this.buffer[i+1]=this.buffer[i-3],this.buffer[i+2]=this.buffer[i-2],this.buffer[i+3]=this.buffer[i-1],i-=4,o>4&&(o-=4)}this.buffer[i]=e,this.buffer[i+1]=n,this.buffer[i+2]=r,this.buffer[i+3]=o}}shift(e,n,r,o){if(e&131072)this.pushState(e&65535,this.pos);else if((e&262144)==0){let a=e,{parser:i}=this.p;this.pos=o;let l=i.stateFlag(a,1);!l&&(o>r||n<=i.maxNode)&&(this.reducePos=o),this.pushState(a,l?r:Math.min(r,this.reducePos)),this.shiftContext(n,r),n<=i.maxNode&&this.buffer.push(n,r,o,4)}else this.pos=o,this.shiftContext(n,r),n<=this.p.parser.maxNode&&this.buffer.push(n,r,o,4)}apply(e,n,r,o){e&65536?this.reduce(e):this.shift(e,n,r,o)}useNode(e,n,r){let o=this.p.reused.length-1;(o<0||this.p.reused[o]!=e)&&(this.p.reused.push(e),o++);let a=this.reducePos=this.pos=r+e.length;this.pushState(n,r),this.buffer.push(o,r,a,-1),this.curContext&&this.updateContext(this.curContext.tracker.reuse(this.curContext.context,e,this,this.p.stream.reset(this.pos-e.length)))}split(){let e=this,n=e.buffer.length;for(n&&e.buffer[n-4]==0&&(n-=4);n>0&&e.buffer[n-2]>e.reducePos;)n-=4;let r=e.buffer.slice(n),o=e.bufferBase+n;for(;e&&o==e.bufferBase;)e=e.parent;return new t(this.p,this.stack.slice(),this.state,this.reducePos,this.pos,this.score,r,o,this.curContext,this.lookAhead,e)}recoverByDelete(e,n){let r=e<=this.p.parser.maxNode;r&&this.storeNode(e,this.pos,n,4),this.storeNode(0,this.pos,n,r?8:4),this.pos=this.reducePos=n,this.score-=190}canShift(e){for(let n=new Sy(this);;){let r=this.p.parser.stateSlot(n.state,4)||this.p.parser.hasAction(n.state,e);if(r==0)return!1;if((r&65536)==0)return!0;n.reduce(r)}}recoverByInsert(e){if(this.stack.length>=300)return[];let n=this.p.parser.nextStates(this.state);if(n.length>8||this.stack.length>=120){let o=[];for(let a=0,i;a<n.length;a+=2)(i=n[a+1])!=this.state&&this.p.parser.hasAction(i,e)&&o.push(n[a],i);if(this.stack.length<120)for(let a=0;o.length<8&&a<n.length;a+=2){let i=n[a+1];o.some((l,s)=>s&1&&l==i)||o.push(n[a],i)}n=o}let r=[];for(let o=0;o<n.length&&r.length<4;o+=2){let a=n[o+1];if(a==this.state)continue;let i=this.split();i.pushState(a,this.pos),i.storeNode(0,i.pos,i.pos,4,!0),i.shiftContext(n[o],this.pos),i.reducePos=this.pos,i.score-=200,r.push(i)}return r}forceReduce(){let{parser:e}=this.p,n=e.stateSlot(this.state,5);if((n&65536)==0)return!1;if(!e.validAction(this.state,n)){let r=n>>19,o=n&65535,a=this.stack.length-r*3;if(a<0||e.getGoto(this.stack[a],o,!1)<0){let i=this.findForcedReduction();if(i==null)return!1;n=i}this.storeNode(0,this.pos,this.pos,4,!0),this.score-=100}return this.reducePos=this.pos,this.reduce(n),!0}findForcedReduction(){let{parser:e}=this.p,n=[],r=(o,a)=>{if(!n.includes(o))return n.push(o),e.allActions(o,i=>{if(!(i&393216))if(i&65536){let l=(i>>19)-a;if(l>1){let s=i&65535,f=this.stack.length-l*3;if(f>=0&&e.getGoto(this.stack[f],s,!1)>=0)return l<<19|65536|s}}else{let l=r(i,a+1);if(l!=null)return l}})};return r(this.state,0)}forceAll(){for(;!this.p.parser.stateFlag(this.state,2);)if(!this.forceReduce()){this.storeNode(0,this.pos,this.pos,4,!0);break}return this}get deadEnd(){if(this.stack.length!=3)return!1;let{parser:e}=this.p;return e.data[e.stateSlot(this.state,1)]==65535&&!e.stateSlot(this.state,4)}restart(){this.storeNode(0,this.pos,this.pos,4,!0),this.state=this.stack[0],this.stack.length=0}sameState(e){if(this.state!=e.state||this.stack.length!=e.stack.length)return!1;for(let n=0;n<this.stack.length;n+=3)if(this.stack[n]!=e.stack[n])return!1;return!0}get parser(){return this.p.parser}dialectEnabled(e){return this.p.parser.dialect.flags[e]}shiftContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.shift(this.curContext.context,e,this,this.p.stream.reset(n)))}reduceContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.reduce(this.curContext.context,e,this,this.p.stream.reset(n)))}emitContext(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-3)&&this.storeNode(this.curContext.hash,this.reducePos,this.reducePos,-3,!0)}emitLookAhead(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-4)&&this.buffer.push(this.lookAhead,this.pos,this.pos,-4)}updateContext(e){if(e!=this.curContext.context){let n=new md(this.curContext.tracker,e);n.hash!=this.curContext.hash&&this.emitContext(),this.curContext=n}}setLookAhead(e){return e<=this.lookAhead?!1:(this.emitLookAhead(),this.lookAhead=e,!0)}close(){this.curContext&&this.curContext.tracker.strict&&this.emitContext(),this.lookAhead>0&&this.emitLookAhead()}},md=class{constructor(e,n){this.tracker=e,this.context=n,this.hash=e.strict?e.hash(n):0}},Sy=class{constructor(e){this.start=e,this.state=e.state,this.stack=e.stack,this.base=this.stack.length}reduce(e){let n=e&65535,r=e>>19;r==0?(this.stack==this.start.stack&&(this.stack=this.stack.slice()),this.stack.push(this.state,0,0),this.base+=3):this.base-=(r-1)*3;let o=this.start.p.parser.getGoto(this.stack[this.base-3],n,!0);this.state=o}},ky=class t{constructor(e,n,r){this.stack=e,this.pos=n,this.index=r,this.buffer=e.buffer,this.index==0&&this.maybeNext()}static create(e,n=e.bufferBase+e.buffer.length){return new t(e,n,n-e.bufferBase)}maybeNext(){let e=this.stack.parent;e!=null&&(this.index=this.stack.bufferBase-e.bufferBase,this.stack=e,this.buffer=e.buffer)}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}next(){this.index-=4,this.pos-=4,this.index==0&&this.maybeNext()}fork(){return new t(this.stack,this.pos,this.index)}};sl=class{constructor(){this.start=-1,this.value=-1,this.end=-1,this.extended=-1,this.lookAhead=0,this.mask=0,this.context=0}},I2=new sl,Cy=class{constructor(e,n){this.input=e,this.ranges=n,this.chunk="",this.chunkOff=0,this.chunk2="",this.chunk2Pos=0,this.next=-1,this.token=I2,this.rangeIndex=0,this.pos=this.chunkPos=n[0].from,this.range=n[0],this.end=n[n.length-1].to,this.readNext()}resolveOffset(e,n){let r=this.range,o=this.rangeIndex,a=this.pos+e;for(;a<r.from;){if(!o)return null;let i=this.ranges[--o];a-=r.from-i.to,r=i}for(;n<0?a>r.to:a>=r.to;){if(o==this.ranges.length-1)return null;let i=this.ranges[++o];a+=i.from-r.to,r=i}return a}clipPos(e){if(e>=this.range.from&&e<this.range.to)return e;for(let n of this.ranges)if(n.to>e)return Math.max(e,n.from);return this.end}peek(e){let n=this.chunkOff+e,r,o;if(n>=0&&n<this.chunk.length)r=this.pos+e,o=this.chunk.charCodeAt(n);else{let a=this.resolveOffset(e,1);if(a==null)return-1;if(r=a,r>=this.chunk2Pos&&r<this.chunk2Pos+this.chunk2.length)o=this.chunk2.charCodeAt(r-this.chunk2Pos);else{let i=this.rangeIndex,l=this.range;for(;l.to<=r;)l=this.ranges[++i];this.chunk2=this.input.chunk(this.chunk2Pos=r),r+this.chunk2.length>l.to&&(this.chunk2=this.chunk2.slice(0,l.to-r)),o=this.chunk2.charCodeAt(0)}}return r>=this.token.lookAhead&&(this.token.lookAhead=r+1),o}acceptToken(e,n=0){let r=n?this.resolveOffset(n,-1):this.pos;if(r==null||r<this.token.start)throw new RangeError("Token end out of bounds");this.token.value=e,this.token.end=r}acceptTokenTo(e,n){this.token.value=e,this.token.end=n}getChunk(){if(this.pos>=this.chunk2Pos&&this.pos<this.chunk2Pos+this.chunk2.length){let{chunk:e,chunkPos:n}=this;this.chunk=this.chunk2,this.chunkPos=this.chunk2Pos,this.chunk2=e,this.chunk2Pos=n,this.chunkOff=this.pos-this.chunkPos}else{this.chunk2=this.chunk,this.chunk2Pos=this.chunkPos;let e=this.input.chunk(this.pos),n=this.pos+e.length;this.chunk=n>this.range.to?e.slice(0,this.range.to-this.pos):e,this.chunkPos=this.pos,this.chunkOff=0}}readNext(){return this.chunkOff>=this.chunk.length&&(this.getChunk(),this.chunkOff==this.chunk.length)?this.next=-1:this.next=this.chunk.charCodeAt(this.chunkOff)}advance(e=1){for(this.chunkOff+=e;this.pos+e>=this.range.to;){if(this.rangeIndex==this.ranges.length-1)return this.setDone();e-=this.range.to-this.pos,this.range=this.ranges[++this.rangeIndex],this.pos=this.range.from}return this.pos+=e,this.pos>=this.token.lookAhead&&(this.token.lookAhead=this.pos+1),this.readNext()}setDone(){return this.pos=this.chunkPos=this.end,this.range=this.ranges[this.rangeIndex=this.ranges.length-1],this.chunk="",this.next=-1}reset(e,n){if(n?(this.token=n,n.start=e,n.lookAhead=e+1,n.value=n.extended=-1):this.token=I2,this.pos!=e){if(this.pos=e,e==this.end)return this.setDone(),this;for(;e<this.range.from;)this.range=this.ranges[--this.rangeIndex];for(;e>=this.range.to;)this.range=this.ranges[++this.rangeIndex];e>=this.chunkPos&&e<this.chunkPos+this.chunk.length?this.chunkOff=e-this.chunkPos:(this.chunk="",this.chunkOff=0),this.readNext()}return this}read(e,n){if(e>=this.chunkPos&&n<=this.chunkPos+this.chunk.length)return this.chunk.slice(e-this.chunkPos,n-this.chunkPos);if(e>=this.chunk2Pos&&n<=this.chunk2Pos+this.chunk2.length)return this.chunk2.slice(e-this.chunk2Pos,n-this.chunk2Pos);if(e>=this.range.from&&n<=this.range.to)return this.input.read(e,n);let r="";for(let o of this.ranges){if(o.from>=n)break;o.to>e&&(r+=this.input.read(Math.max(o.from,e),Math.min(o.to,n)))}return r}},Do=class{constructor(e,n){this.data=e,this.id=n}token(e,n){let{parser:r}=n.p;C2(this.data,e,n,this.id,r.data,r.tokenPrecTable)}};Do.prototype.contextual=Do.prototype.fallback=Do.prototype.extend=!1;Ay=class{constructor(e,n,r){this.precTable=n,this.elseToken=r,this.data=typeof e=="string"?uf(e):e}token(e,n){let r=e.pos,o=0;for(;;){let a=e.next<0,i=e.resolveOffset(1,1);if(C2(this.data,e,n,0,this.data,this.precTable),e.token.value>-1)break;if(this.elseToken==null)return;if(a||o++,i==null)break;e.reset(i,e.token)}o&&(e.reset(r,e.token),e.acceptToken(this.elseToken,o))}};Ay.prototype.contextual=Do.prototype.fallback=Do.prototype.extend=!1;hd=class{constructor(e,n={}){this.token=e,this.contextual=!!n.contextual,this.fallback=!!n.fallback,this.extend=!!n.extend}};tn=typeof process<"u"&&process.env&&/\bparse\b/.test(process.env.LOG),vy=null;Ty=class{constructor(e,n){this.fragments=e,this.minRepeat=n,this.i=0,this.fragment=null,this.safeFrom=-1,this.safeTo=-1,this.trees=[],this.start=[],this.index=[],this.lastRepeat=null,this.lastRepeatPos=-1,this.nextFragment()}nextFragment(){let e=this.fragment=this.i==this.fragments.length?null:this.fragments[this.i++];if(e){for(this.safeFrom=e.openStart?w2(e.tree,e.from+e.offset,1)-e.offset:e.from,this.safeTo=e.openEnd?w2(e.tree,e.to+e.offset,-1)-e.offset:e.to;this.trees.length;)this.trees.pop(),this.start.pop(),this.index.pop();this.trees.push(e.tree),this.start.push(-e.offset),this.index.push(0),this.nextStart=this.safeFrom}else this.nextStart=1e9}nodeAt(e){if(e<this.nextStart)return null;for(;this.fragment&&this.safeTo<=e;)this.nextFragment();if(!this.fragment)return null;for(;;){let n=this.trees.length-1;if(n<0)return this.nextFragment(),null;let r=this.trees[n],o=this.index[n];if(o==r.children.length){this.trees.pop(),this.start.pop(),this.index.pop();continue}let a=r.children[o],i=this.start[n]+r.positions[o];if(i>e)return this.nextStart=i,null;if(a instanceof Ue){let l=i>this.lastRepeatPos&&a.type.id>=this.minRepeat;if(i==e||l){let s=i+a.length,f;if(i>=this.safeFrom&&s<=this.safeTo&&(!(f=a.prop(X.lookAhead))||s+f<this.fragment.to)){if(l&&(this.lastRepeat=a,this.lastRepeatPos=i),i==e)return a}else if(i==e)return null}this.index[n]++,i+a.length>=Math.max(this.safeFrom,e)&&(this.trees.push(a),this.start.push(i),this.index.push(0))}else this.index[n]++,this.nextStart=i+a.length}}},My=class{constructor(e,n){this.stream=n,this.tokens=[],this.mainToken=null,this.actions=[],this.tokens=e.tokenizers.map(r=>new sl)}getActions(e){let n=0,r=null,{parser:o}=e.p,{tokenizers:a}=o,i=o.stateSlot(e.state,3),l=e.curContext?e.curContext.hash:0,s=0;for(let f=0;f<a.length;f++){if((1<<f&i)==0)continue;let c=a[f],u=this.tokens[f];if(!(r&&!c.fallback)&&((c.contextual||u.start!=e.pos||u.mask!=i||u.context!=l)&&(this.updateCachedToken(u,c,e),u.mask=i,u.context=l),u.lookAhead>u.end+25&&(s=Math.max(u.lookAhead,s)),u.value!=0)){let d=n;if(u.extended>-1&&(n=this.addActions(e,u.extended,u.end,n)),n=this.addActions(e,u.value,u.end,n),!c.extend&&(r=u,n>d))break}}for(;this.actions.length>n;)this.actions.pop();return s&&e.setLookAhead(s),!r&&e.pos==this.stream.end&&(r=new sl,r.value=e.p.parser.eofTerm,r.start=r.end=e.pos,n=this.addActions(e,r.value,r.end,n)),this.mainToken=r,this.actions}getMainToken(e){if(this.mainToken)return this.mainToken;let n=new sl,{pos:r,p:o}=e;return n.start=r,n.end=Math.min(r+1,o.stream.end),n.value=r==o.stream.end?o.parser.eofTerm:0,n}updateCachedToken(e,n,r){let o=this.stream.clipPos(r.pos);if(n.token(this.stream.reset(o,e),r),e.value>-1){let{parser:a}=r.p;for(let i=0;i<a.specialized.length;i++)if(a.specialized[i]==e.value){let l=a.specializers[i](this.stream.read(e.start,e.end),r);if(l>=0&&r.p.parser.dialect.allows(l>>1)){(l&1)==0?e.value=l>>1:e.extended=l>>1;break}}}else e.value=0,e.end=this.stream.clipPos(o+1)}putAction(e,n,r,o){for(let a=0;a<o;a+=3)if(this.actions[a]==e)return o;return this.actions[o++]=e,this.actions[o++]=n,this.actions[o++]=r,o}addActions(e,n,r,o){let{state:a}=e,{parser:i}=e.p,{data:l}=i;for(let s=0;s<2;s++)for(let f=i.stateSlot(a,s?2:1);;f+=3){if(l[f]==65535)if(l[f+1]==1)f=Fr(l,f+2);else{o==0&&l[f+1]==2&&(o=this.putAction(Fr(l,f+2),n,r,o));break}l[f]==n&&(o=this.putAction(Fr(l,f+1),n,r,o))}return o}},Dy=class{constructor(e,n,r,o){this.parser=e,this.input=n,this.ranges=o,this.recovering=0,this.nextStackID=9812,this.minStackPos=0,this.reused=[],this.stoppedAt=null,this.lastBigReductionStart=-1,this.lastBigReductionSize=0,this.bigReductionCount=0,this.stream=new Cy(n,o),this.tokens=new My(e,this.stream),this.topTerm=e.top[1];let{from:a}=o[0];this.stacks=[wy.start(this,e.top[0],a)],this.fragments=r.length&&this.stream.end-a>e.bufferLength*4?new Ty(r,e.minRepeatTerm):null}get parsedPos(){return this.minStackPos}advance(){let e=this.stacks,n=this.minStackPos,r=this.stacks=[],o,a;if(this.bigReductionCount>300&&e.length==1){let[i]=e;for(;i.forceReduce()&&i.stack.length&&i.stack[i.stack.length-2]>=this.lastBigReductionStart;);this.bigReductionCount=this.lastBigReductionSize=0}for(let i=0;i<e.length;i++){let l=e[i];for(;;){if(this.tokens.mainToken=null,l.pos>n)r.push(l);else{if(this.advanceStack(l,r,e))continue;{o||(o=[],a=[]),o.push(l);let s=this.tokens.getMainToken(l);a.push(s.value,s.end)}}break}}if(!r.length){let i=o&&IN(o);if(i)return tn&&console.log("Finish with "+this.stackID(i)),this.stackToTree(i);if(this.parser.strict)throw tn&&o&&console.log("Stuck with token "+(this.tokens.mainToken?this.parser.getName(this.tokens.mainToken.value):"none")),new SyntaxError("No parse at "+n);this.recovering||(this.recovering=5)}if(this.recovering&&o){let i=this.stoppedAt!=null&&o[0].pos>this.stoppedAt?o[0]:this.runRecovery(o,a,r);if(i)return tn&&console.log("Force-finish "+this.stackID(i)),this.stackToTree(i.forceAll())}if(this.recovering){let i=this.recovering==1?1:this.recovering*3;if(r.length>i)for(r.sort((l,s)=>s.score-l.score);r.length>i;)r.pop();r.some(l=>l.reducePos>n)&&this.recovering--}else if(r.length>1){e:for(let i=0;i<r.length-1;i++){let l=r[i];for(let s=i+1;s<r.length;s++){let f=r[s];if(l.sameState(f)||l.buffer.length>500&&f.buffer.length>500)if((l.score-f.score||l.buffer.length-f.buffer.length)>0)r.splice(s--,1);else{r.splice(i--,1);continue e}}}r.length>12&&(r.sort((i,l)=>l.score-i.score),r.splice(12,r.length-12))}this.minStackPos=r[0].pos;for(let i=1;i<r.length;i++)r[i].pos<this.minStackPos&&(this.minStackPos=r[i].pos);return null}stopAt(e){if(this.stoppedAt!=null&&this.stoppedAt<e)throw new RangeError("Can't move stoppedAt forward");this.stoppedAt=e}tryReuse(e,n,r,o){if(!r)return null;let a=e.curContext&&e.curContext.tracker.strict,i=a?e.curContext.hash:0;for(;r;){let l=this.parser.nodeSet.types[r.type.id]!=r.type?-1:this.parser.getGoto(e.state,r.type.id);if(l>-1&&r.length&&(!a||(r.prop(X.contextHash)||0)==i))return e.useNode(r,l,n),r;if(r.children.length==0||r.positions[0]>0)break;let s=r.children[0];if(s instanceof Ue&&(!o||s.type.id>=this.parser.minRepeatTerm))r=s;else break}return null}advanceStack(e,n,r){let o=e.pos,{parser:a}=this,i=tn?this.stackID(e)+" -> ":"";if(this.stoppedAt!=null&&o>this.stoppedAt)return e.forceReduce()?e:null;if(this.fragments){let f=e.reducePos<o&&e.buffer.length&&e.buffer[e.buffer.length-2]<=e.reducePos&&this.fragments.lastRepeatPos==e.reducePos&&this.tryReuse(e,e.reducePos,this.fragments.lastRepeat,!0)||this.tryReuse(e,o,this.fragments.nodeAt(o),!1);if(f)return tn&&console.log(i+this.stackID(e)+` (via reuse of ${a.getName(f.type.id)})`),!0}let l=a.stateSlot(e.state,4);if(l>0)return e.reduce(l),tn&&console.log(i+this.stackID(e)+` (via always-reduce ${a.getName(l&65535)})`),!0;if(e.stack.length>=8400)for(;e.stack.length>6e3&&e.forceReduce(););let s=this.tokens.getActions(e);for(let f=0;f<s.length;){let c=s[f++],u=s[f++],d=s[f++],p=f==s.length||!r,h=p?e:e.split(),y=this.tokens.mainToken;if(h.apply(c,u,y?y.start:h.pos,d),tn&&console.log(i+this.stackID(h)+` (via ${(c&65536)==0?"shift":`reduce of ${a.getName(c&65535)}`} for ${a.getName(u)} @ ${o}${h==e?"":", split"})`),p)return!0;h.pos>o?n.push(h):r.push(h)}return!1}advanceFully(e,n){let r=e.pos;for(;;){if(!this.advanceStack(e,null,null))return!1;if(e.pos>r)return S2(e,n),!0}}runRecovery(e,n,r){let o=null,a=!1;for(let i=0;i<e.length;i++){let l=e[i],s=n[i<<1],f=n[(i<<1)+1],c=tn?this.stackID(l)+" -> ":"";if(l.deadEnd&&(a||(a=!0,l.restart(),tn&&console.log(c+this.stackID(l)+" (restarted)"),this.advanceFully(l,r))))continue;let u=l.split(),d=c;for(let p=0;p<10&&u.forceReduce()&&(tn&&console.log(d+this.stackID(u)+" (via force-reduce)"),!this.advanceFully(u,r));p++)tn&&(d=this.stackID(u)+" -> ");for(let p of l.recoverByInsert(s))tn&&console.log(c+this.stackID(p)+" (via recover-insert)"),this.advanceFully(p,r);this.stream.end>l.pos?(f==l.pos&&(f++,s=0),l.recoverByDelete(s,f),tn&&console.log(c+this.stackID(l)+` (via recover-delete ${this.parser.getName(s)})`),S2(l,r)):(!o||o.score<u.score)&&(o=u)}return o}stackToTree(e){return e.close(),Ue.build({buffer:ky.create(e),nodeSet:this.parser.nodeSet,topID:this.topTerm,maxBufferLength:this.parser.bufferLength,reused:this.reused,start:this.ranges[0].from,length:e.pos-this.ranges[0].from,minRepeatType:this.parser.minRepeatTerm})}stackID(e){let n=(vy||(vy=new WeakMap)).get(e);return n||vy.set(e,n=String.fromCodePoint(this.nextStackID++)),n+e}};Oy=class{constructor(e,n,r){this.source=e,this.flags=n,this.disabled=r}allows(e){return!this.disabled||this.disabled[e]==0}},xd=class t extends Ni{constructor(e){if(super(),this.wrappers=[],e.version!=14)throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);let n=e.nodeNames.split(" ");this.minRepeatTerm=n.length;for(let l=0;l<e.repeatNodeCount;l++)n.push("");let r=Object.keys(e.topRules).map(l=>e.topRules[l][1]),o=[];for(let l=0;l<n.length;l++)o.push([]);function a(l,s,f){o[l].push([s,s.deserialize(String(f))])}if(e.nodeProps)for(let l of e.nodeProps){let s=l[0];typeof s=="string"&&(s=X[s]);for(let f=1;f<l.length;){let c=l[f++];if(c>=0)a(c,s,l[f++]);else{let u=l[f+-c];for(let d=-c;d>0;d--)a(l[f++],s,u);f++}}}this.nodeSet=new Ds(n.map((l,s)=>mt.define({name:s>=this.minRepeatTerm?void 0:l,id:s,props:o[s],top:r.indexOf(s)>-1,error:s==0,skipped:e.skippedNodes&&e.skippedNodes.indexOf(s)>-1}))),e.propSources&&(this.nodeSet=this.nodeSet.extend(...e.propSources)),this.strict=!1,this.bufferLength=1024;let i=uf(e.tokenData);this.context=e.context,this.specializerSpecs=e.specialized||[],this.specialized=new Uint16Array(this.specializerSpecs.length);for(let l=0;l<this.specializerSpecs.length;l++)this.specialized[l]=this.specializerSpecs[l].term;this.specializers=this.specializerSpecs.map(k2),this.states=uf(e.states,Uint32Array),this.data=uf(e.stateData),this.goto=uf(e.goto),this.maxTerm=e.maxTerm,this.tokenizers=e.tokenizers.map(l=>typeof l=="number"?new Do(i,l):l),this.topRules=e.topRules,this.dialects=e.dialects||{},this.dynamicPrecedences=e.dynamicPrecedences||null,this.tokenPrecTable=e.tokenPrec,this.termNames=e.termNames||null,this.maxNode=this.nodeSet.types.length-1,this.dialect=this.parseDialect(),this.top=this.topRules[Object.keys(this.topRules)[0]]}createParse(e,n,r){let o=new Dy(this,e,n,r);for(let a of this.wrappers)o=a(o,e,n,r);return o}getGoto(e,n,r=!1){let o=this.goto;if(n>=o[0])return-1;for(let a=o[n+1];;){let i=o[a++],l=i&1,s=o[a++];if(l&&r)return s;for(let f=a+(i>>1);a<f;a++)if(o[a]==e)return s;if(l)return-1}}hasAction(e,n){let r=this.data;for(let o=0;o<2;o++)for(let a=this.stateSlot(e,o?2:1),i;;a+=3){if((i=r[a])==65535)if(r[a+1]==1)i=r[a=Fr(r,a+2)];else{if(r[a+1]==2)return Fr(r,a+2);break}if(i==n||i==0)return Fr(r,a+1)}return 0}stateSlot(e,n){return this.states[e*6+n]}stateFlag(e,n){return(this.stateSlot(e,0)&n)>0}validAction(e,n){return!!this.allActions(e,r=>r==n?!0:null)}allActions(e,n){let r=this.stateSlot(e,4),o=r?n(r):void 0;for(let a=this.stateSlot(e,1);o==null;a+=3){if(this.data[a]==65535)if(this.data[a+1]==1)a=Fr(this.data,a+2);else break;o=n(Fr(this.data,a+1))}return o}nextStates(e){let n=[];for(let r=this.stateSlot(e,1);;r+=3){if(this.data[r]==65535)if(this.data[r+1]==1)r=Fr(this.data,r+2);else break;if((this.data[r+2]&1)==0){let o=this.data[r+1];n.some((a,i)=>i&1&&a==o)||n.push(this.data[r],o)}}return n}configure(e){let n=Object.assign(Object.create(t.prototype),this);if(e.props&&(n.nodeSet=this.nodeSet.extend(...e.props)),e.top){let r=this.topRules[e.top];if(!r)throw new RangeError(`Invalid top rule name ${e.top}`);n.top=r}return e.tokenizers&&(n.tokenizers=this.tokenizers.map(r=>{let o=e.tokenizers.find(a=>a.from==r);return o?o.to:r})),e.specializers&&(n.specializers=this.specializers.slice(),n.specializerSpecs=this.specializerSpecs.map((r,o)=>{let a=e.specializers.find(l=>l.from==r.external);if(!a)return r;let i=Object.assign(Object.assign({},r),{external:a.to});return n.specializers[o]=k2(i),i})),e.contextTracker&&(n.context=e.contextTracker),e.dialect&&(n.dialect=this.parseDialect(e.dialect)),e.strict!=null&&(n.strict=e.strict),e.wrap&&(n.wrappers=n.wrappers.concat(e.wrap)),e.bufferLength!=null&&(n.bufferLength=e.bufferLength),n}hasWrappers(){return this.wrappers.length>0}getName(e){return this.termNames?this.termNames[e]:String(e<=this.maxNode&&this.nodeSet.types[e].name||e)}get eofTerm(){return this.maxNode+1}get topNode(){return this.nodeSet.types[this.top[1]]}dynamicPrecedence(e){let n=this.dynamicPrecedences;return n==null?0:n[e]||0}parseDialect(e){let n=Object.keys(this.dialects),r=n.map(()=>!1);if(e)for(let a of e.split(" ")){let i=n.indexOf(a);i>=0&&(r[i]=!0)}let o=null;for(let a=0;a<n.length;a++)if(!r[a])for(let i=this.dialects[n[a]],l;(l=this.data[i++])!=65535;)(o||(o=new Uint8Array(this.maxTerm+1)))[l]=1;return new Oy(e,r,o)}static deserialize(e){return new t(e)}}});function T2(t){let e=Object.keys(t).join(""),n=/\w/.test(e);return n&&(e=e.replace(/\w/g,"")),`[${n?"\\w":""}${e.replace(/[^\w\s]/g,"\\$&")}]`}function vN(t){let e=Object.create(null),n=Object.create(null);for(let{label:o}of t){e[o[0]]=!0;for(let a=1;a<o.length;a++)n[o[a]]=!0}let r=T2(e)+T2(n)+"*$";return[new RegExp("^"+r),new RegExp(r)]}function _y(t){let e=t.map(o=>typeof o=="string"?{label:o}:o),[n,r]=e.every(o=>/^\w+$/.test(o.label))?[/\w*$/,/\w+$/]:vN(e);return o=>{let a=o.matchBefore(r);return a||o.explicit?{from:a?a.from:o.pos,options:e,validFor:n}:null}}function B2(t,e){return n=>{for(let r=gt(n.state).resolveInner(n.pos,-1);r;r=r.parent){if(t.indexOf(r.name)>-1)return null;if(r.type.isTop)break}return e(n)}}function Ca(t){return t.selection.main.from}function E2(t,e){var n;let{source:r}=t,o=e&&r[0]!="^",a=r[r.length-1]!="$";return!o&&!a?t:new RegExp(`${o?"^":""}(?:${r})${a?"$":""}`,(n=t.flags)!==null&&n!==void 0?n:t.ignoreCase?"i":"")}function wN(t,e,n,r){let{main:o}=t.selection,a=n-o.from,i=r-o.from;return{...t.changeByRange(l=>{if(l!=o&&n!=r&&t.sliceDoc(l.from+a,l.from+i)!=t.sliceDoc(n,r))return{range:l};let s=t.toText(e);return{changes:{from:l.from+a,to:r==o.from?l.to:l.from+i,insert:s},range:B.cursor(l.from+a+s.length)}}),scrollIntoView:!0,userEvent:"input.complete"}}function SN(t){if(!Array.isArray(t))return t;let e=M2.get(t);return e||M2.set(t,e=_y(t)),e}function D2(t,e){return t?e?t+" "+e:t:e}function kN(t,e,n,r,o,a){let i=t.textDirection==ge.RTL,l=i,s=!1,f="top",c,u,d=e.left-o.left,p=o.right-e.right,h=r.right-r.left,y=r.bottom-r.top;if(l&&d<Math.min(h,p)?l=!1:!l&&p<Math.min(h,d)&&(l=!0),h<=(l?d:p))c=Math.max(o.top,Math.min(n.top,o.bottom-y))-e.top,u=Math.min(400,l?d:p);else{s=!0,u=Math.min(400,(i?e.right:o.right-e.left)-30);let g=o.bottom-e.bottom;g>=y||g>e.top?c=n.bottom-e.top:(f="bottom",c=e.bottom-n.top)}let b=(e.bottom-e.top)/a.offsetHeight,m=(e.right-e.left)/a.offsetWidth;return{style:`${f}: ${c/b}px; max-width: ${u/m}px`,class:"cm-completionInfo-"+(s?i?"left-narrow":"right-narrow":l?"left":"right")}}function CN(t){let e=t.addToOptions.slice();return t.icons&&e.push({render(n){let r=document.createElement("div");return r.classList.add("cm-completionIcon"),n.type&&r.classList.add(...n.type.split(/\s+/g).map(o=>"cm-completionIcon-"+o)),r.setAttribute("aria-hidden","true"),r},position:20}),e.push({render(n,r,o,a){let i=document.createElement("span");i.className="cm-completionLabel";let l=n.displayLabel||n.label,s=0;for(let f=0;f<a.length;){let c=a[f++],u=a[f++];c>s&&i.appendChild(document.createTextNode(l.slice(s,c)));let d=i.appendChild(document.createElement("span"));d.appendChild(document.createTextNode(l.slice(c,u))),d.className="cm-completionMatchedText",s=u}return s<l.length&&i.appendChild(document.createTextNode(l.slice(s))),i},position:50},{render(n){if(!n.detail)return null;let r=document.createElement("span");return r.className="cm-completionDetail",r.textContent=n.detail,r},position:80}),e.sort((n,r)=>n.position-r.position).map(n=>n.render)}function Ry(t,e,n){if(t<=n)return{from:0,to:t};if(e<0&&(e=0),e<=t>>1){let o=Math.floor(e/n);return{from:o*n,to:(o+1)*n}}let r=Math.ceil((t-e)/n);return{from:t-r*n,to:t-(r-1)*n}}function AN(t,e){return n=>new Ly(n,t,e)}function TN(t,e){let n=t.getBoundingClientRect(),r=e.getBoundingClientRect(),o=n.height/t.offsetHeight;r.top<n.top?t.scrollTop-=(n.top-r.top)/o:r.bottom>n.bottom&&(t.scrollTop+=(r.bottom-n.bottom)/o)}function O2(t){return(t.boost||0)*100+(t.apply?10:0)+(t.info?5:0)+(t.type?1:0)}function MN(t,e){let n=[],r=null,o=null,a=c=>{n.push(c);let{section:u}=c.completion;if(u){r||(r=[]);let d=typeof u=="string"?u:u.name;r.some(p=>p.name==d)||r.push(typeof u=="string"?{name:d}:u)}},i=e.facet(rt);for(let c of t)if(c.hasResult()){let u=c.result.getMatch;if(c.result.filter===!1)for(let d of c.result.options)a(new bd(d,c.source,u?u(d):[],1e9-n.length));else{let d=e.sliceDoc(c.from,c.to),p,h=i.filterStrict?new Fy(d):new Ey(d);for(let y of c.result.options)if(p=h.match(y.label)){let b=y.displayLabel?u?u(y,p.matched):[]:p.matched,m=p.score+(y.boost||0);if(a(new bd(y,c.source,b,m)),typeof y.section=="object"&&y.section.rank==="dynamic"){let{name:g}=y.section;o||(o=Object.create(null)),o[g]=Math.max(m,o[g]||-1e9)}}}}if(r){let c=Object.create(null),u=0,d=(p,h)=>(p.rank==="dynamic"&&h.rank==="dynamic"?o[h.name]-o[p.name]:0)||(typeof p.rank=="number"?p.rank:1e9)-(typeof h.rank=="number"?h.rank:1e9)||(p.name<h.name?-1:1);for(let p of r.sort(d))u-=1e5,c[p.name]=u;for(let p of n){let{section:h}=p.completion;h&&(p.score+=c[typeof h=="string"?h:h.name])}}let l=[],s=null,f=i.compareCompletions;for(let c of n.sort((u,d)=>d.score-u.score||f(u.completion,d.completion))){let u=c.completion;!s||s.label!=u.label||s.detail!=u.detail||s.type!=null&&u.type!=null&&s.type!=u.type||s.apply!=u.apply||s.boost!=u.boost?l.push(c):O2(c.completion)>O2(s)&&(l[l.length-1]=c),s=c.completion}return l}function DN(t,e){if(t==e)return!0;for(let n=0,r=0;;){for(;n<t.length&&!t[n].hasResult();)n++;for(;r<e.length&&!e[r].hasResult();)r++;let o=n==t.length,a=r==e.length;if(o||a)return o==a;if(t[n++].result!=e[r++].result)return!1}}function R2(t,e){let n={"aria-autocomplete":"list","aria-haspopup":"listbox","aria-controls":t};return e>-1&&(n["aria-activedescendant"]=t+"-"+e),n}function L2(t,e){if(t.isUserEvent("input.complete")){let r=t.annotation(F2);if(r&&e.activateOnCompletion(r))return 12}let n=t.isUserEvent("input.type");return n&&e.activateOnTyping?5:n?1:t.isUserEvent("delete.backward")?2:t.selection?8:t.docChanged?16:0}function EN(t,e,n,r){if(!t)return!1;let o=e.sliceDoc(n,r);return typeof t=="function"?t(o,n,r,e):E2(t,!0).test(o)}function Uy(t,e){let n=e.completion.apply||e.completion.label,r=t.state.field(zt).active.find(o=>o.source==e.source);return r instanceof vd?(typeof n=="string"?t.dispatch({...wN(t.state,n,r.from,r.to),annotations:F2.of(e.completion)}):n(t,e.completion,r.from,r.to),!0):!1}function gd(t,e="option"){return n=>{let r=n.state.field(zt,!1);if(!r||!r.open||r.open.disabled||Date.now()-r.open.timestamp<n.state.facet(rt).interactionDelay)return!1;let o=1,a;e=="page"&&(a=ny(n,r.open.tooltip))&&(o=Math.max(2,Math.floor(a.dom.offsetHeight/a.dom.querySelector("li").offsetHeight)-1));let{length:i}=r.open.options,l=r.open.selected>-1?r.open.selected+o*(t?1:-1):t?0:i-1;return l<0?l=e=="page"?0:i-1:l>=i&&(l=e=="page"?i-1:0),n.dispatch({effects:zy.of(l)}),!0}}function q2(t={}){return[HN,zt,rt.of(t),_N,jN,UN]}var yd,bd,F2,M2,Id,df,Ey,Fy,rt,zy,Ly,Ny,qy,ON,RN,BN,Lr,vd,Hy,zt,FN,LN,By,NN,Py,qN,PN,_N,zN,HN,UN,N2,a5,jy,jN,Vy=F(()=>{ji();nf();cf();yd=class{constructor(e,n,r,o){this.state=e,this.pos=n,this.explicit=r,this.view=o,this.abortListeners=[],this.abortOnDocChange=!1}tokenBefore(e){let n=gt(this.state).resolveInner(this.pos,-1);for(;n&&e.indexOf(n.name)<0;)n=n.parent;return n?{from:n.from,to:this.pos,text:this.state.sliceDoc(n.from,this.pos),type:n.type}:null}matchBefore(e){let n=this.state.doc.lineAt(this.pos),r=Math.max(n.from,this.pos-250),o=n.text.slice(r-n.from,this.pos-n.from),a=o.search(E2(e,!1));return a<0?null:{from:r+a,to:this.pos,text:o.slice(a)}}get aborted(){return this.abortListeners==null}addEventListener(e,n,r){e=="abort"&&this.abortListeners&&(this.abortListeners.push(n),r&&r.onDocChange&&(this.abortOnDocChange=!0))}};bd=class{constructor(e,n,r,o){this.completion=e,this.source=n,this.match=r,this.score=o}};F2=Nt.define();M2=new WeakMap;Id=le.define(),df=le.define(),Ey=class{constructor(e){this.pattern=e,this.chars=[],this.folded=[],this.any=[],this.precise=[],this.byWord=[],this.score=0,this.matched=[];for(let n=0;n<e.length;){let r=Mr(e,n),o=vo(r);this.chars.push(r);let a=e.slice(n,n+o),i=a.toUpperCase();this.folded.push(Mr(i==a?a.toLowerCase():i,0)),n+=o}this.astral=e.length!=this.chars.length}ret(e,n){return this.score=e,this.matched=n,this}match(e){if(this.pattern.length==0)return this.ret(-100,[]);if(e.length<this.pattern.length)return null;let{chars:n,folded:r,any:o,precise:a,byWord:i}=this;if(n.length==1){let g=Mr(e,0),x=vo(g),I=x==e.length?0:-100;if(g!=n[0])if(g==r[0])I+=-200;else return null;return this.ret(I,[0,x])}let l=e.indexOf(this.pattern);if(l==0)return this.ret(e.length==this.pattern.length?0:-100,[0,this.pattern.length]);let s=n.length,f=0;if(l<0){for(let g=0,x=Math.min(e.length,200);g<x&&f<s;){let I=Mr(e,g);(I==n[f]||I==r[f])&&(o[f++]=g),g+=vo(I)}if(f<s)return null}let c=0,u=0,d=!1,p=0,h=-1,y=-1,b=/[a-z]/.test(e),m=!0;for(let g=0,x=Math.min(e.length,200),I=0;g<x&&u<s;){let v=Mr(e,g);l<0&&(c<s&&v==n[c]&&(a[c++]=g),p<s&&(v==n[p]||v==r[p]?(p==0&&(h=g),y=g+1,p++):p=0));let w,S=v<255?v>=48&&v<=57||v>=97&&v<=122?2:v>=65&&v<=90?1:0:(w=lk(v))!=w.toLowerCase()?1:w!=w.toUpperCase()?2:0;(!g||S==1&&b||I==0&&S!=0)&&(n[u]==v||r[u]==v&&(d=!0)?i[u++]=g:i.length&&(m=!1)),I=S,g+=vo(v)}return u==s&&i[0]==0&&m?this.result(-100+(d?-200:0),i,e):p==s&&h==0?this.ret(-200-e.length+(y==e.length?0:-100),[0,y]):l>-1?this.ret(-700-e.length,[l,l+this.pattern.length]):p==s?this.ret(-900-e.length,[h,y]):u==s?this.result(-100+(d?-200:0)+-700+(m?0:-1100),i,e):n.length==2?null:this.result((o[0]?-700:0)+-200+-1100,o,e)}result(e,n,r){let o=[],a=0;for(let i of n){let l=i+(this.astral?vo(Mr(r,i)):1);a&&o[a-1]==i?o[a-1]=l:(o[a++]=i,o[a++]=l)}return this.ret(e-r.length,o)}},Fy=class{constructor(e){this.pattern=e,this.matched=[],this.score=0,this.folded=e.toLowerCase()}match(e){if(e.length<this.pattern.length)return null;let n=e.slice(0,this.pattern.length),r=n==this.pattern?0:n.toLowerCase()==this.folded?-200:null;return r==null?null:(this.matched=[0,n.length],this.score=r+(e.length==this.pattern.length?0:-100),this)}},rt=z.define({combine(t){return wo(t,{activateOnTyping:!0,activateOnCompletion:()=>!1,activateOnTypingDelay:100,selectOnOpen:!0,override:null,closeOnBlur:!0,maxRenderedOptions:100,defaultKeymap:!0,tooltipClass:()=>"",optionClass:()=>"",aboveCursor:!1,icons:!0,addToOptions:[],positionInfo:kN,filterStrict:!1,compareCompletions:(e,n)=>(e.sortText||e.label).localeCompare(n.sortText||n.label),interactionDelay:75,updateSyncTime:100},{defaultKeymap:(e,n)=>e&&n,closeOnBlur:(e,n)=>e&&n,icons:(e,n)=>e&&n,tooltipClass:(e,n)=>r=>D2(e(r),n(r)),optionClass:(e,n)=>r=>D2(e(r),n(r)),addToOptions:(e,n)=>e.concat(n),filterStrict:(e,n)=>e||n})}});zy=le.define();Ly=class{constructor(e,n,r){this.view=e,this.stateField=n,this.applyCompletion=r,this.info=null,this.infoDestroy=null,this.placeInfoReq={read:()=>this.measureInfo(),write:s=>this.placeInfo(s),key:this},this.space=null,this.currentClass="";let o=e.state.field(n),{options:a,selected:i}=o.open,l=e.state.facet(rt);this.optionContent=CN(l),this.optionClass=l.optionClass,this.tooltipClass=l.tooltipClass,this.range=Ry(a.length,i,l.maxRenderedOptions),this.dom=document.createElement("div"),this.dom.className="cm-tooltip-autocomplete",this.updateTooltipClass(e.state),this.dom.addEventListener("mousedown",s=>{let{options:f}=e.state.field(n).open;for(let c=s.target,u;c&&c!=this.dom;c=c.parentNode)if(c.nodeName=="LI"&&(u=/-(\d+)$/.exec(c.id))&&+u[1]<f.length){this.applyCompletion(e,f[+u[1]]),s.preventDefault();return}if(s.target==this.list){let c=this.list.classList.contains("cm-completionListIncompleteTop")&&s.clientY<this.list.firstChild.getBoundingClientRect().top?this.range.from-1:this.list.classList.contains("cm-completionListIncompleteBottom")&&s.clientY>this.list.lastChild.getBoundingClientRect().bottom?this.range.to:null;c!=null&&(e.dispatch({effects:zy.of(c)}),s.preventDefault())}}),this.dom.addEventListener("focusout",s=>{let f=e.state.field(this.stateField,!1);f&&f.tooltip&&e.state.facet(rt).closeOnBlur&&s.relatedTarget!=e.contentDOM&&e.dispatch({effects:df.of(null)})}),this.showOptions(a,o.id)}mount(){this.updateSel()}showOptions(e,n){this.list&&this.list.remove(),this.list=this.dom.appendChild(this.createListBox(e,n,this.range)),this.list.addEventListener("scroll",()=>{this.info&&this.view.requestMeasure(this.placeInfoReq)})}update(e){var n;let r=e.state.field(this.stateField),o=e.startState.field(this.stateField);if(this.updateTooltipClass(e.state),r!=o){let{options:a,selected:i,disabled:l}=r.open;(!o.open||o.open.options!=a)&&(this.range=Ry(a.length,i,e.state.facet(rt).maxRenderedOptions),this.showOptions(a,r.id)),this.updateSel(),l!=((n=o.open)===null||n===void 0?void 0:n.disabled)&&this.dom.classList.toggle("cm-tooltip-autocomplete-disabled",!!l)}}updateTooltipClass(e){let n=this.tooltipClass(e);if(n!=this.currentClass){for(let r of this.currentClass.split(" "))r&&this.dom.classList.remove(r);for(let r of n.split(" "))r&&this.dom.classList.add(r);this.currentClass=n}}positioned(e){this.space=e,this.info&&this.view.requestMeasure(this.placeInfoReq)}updateSel(){let e=this.view.state.field(this.stateField),n=e.open;(n.selected>-1&&n.selected<this.range.from||n.selected>=this.range.to)&&(this.range=Ry(n.options.length,n.selected,this.view.state.facet(rt).maxRenderedOptions),this.showOptions(n.options,e.id));let r=this.updateSelectedOption(n.selected);if(r){this.destroyInfo();let{completion:o}=n.options[n.selected],{info:a}=o;if(!a)return;let i=typeof a=="string"?document.createTextNode(a):a(o);if(!i)return;"then"in i?i.then(l=>{l&&this.view.state.field(this.stateField,!1)==e&&this.addInfoPane(l,o)}).catch(l=>At(this.view.state,l,"completion info")):(this.addInfoPane(i,o),r.setAttribute("aria-describedby",this.info.id))}}addInfoPane(e,n){this.destroyInfo();let r=this.info=document.createElement("div");if(r.className="cm-tooltip cm-completionInfo",r.id="cm-completionInfo-"+Math.floor(Math.random()*65535).toString(16),e.nodeType!=null)r.appendChild(e),this.infoDestroy=null;else{let{dom:o,destroy:a}=e;r.appendChild(o),this.infoDestroy=a||null}this.dom.appendChild(r),this.view.requestMeasure(this.placeInfoReq)}updateSelectedOption(e){let n=null;for(let r=this.list.firstChild,o=this.range.from;r;r=r.nextSibling,o++)r.nodeName!="LI"||!r.id?o--:o==e?r.hasAttribute("aria-selected")||(r.setAttribute("aria-selected","true"),n=r):r.hasAttribute("aria-selected")&&(r.removeAttribute("aria-selected"),r.removeAttribute("aria-describedby"));return n&&TN(this.list,n),n}measureInfo(){let e=this.dom.querySelector("[aria-selected]");if(!e||!this.info)return null;let n=this.dom.getBoundingClientRect(),r=this.info.getBoundingClientRect(),o=e.getBoundingClientRect(),a=this.space;if(!a){let i=this.dom.ownerDocument.documentElement;a={left:0,top:0,right:i.clientWidth,bottom:i.clientHeight}}return o.top>Math.min(a.bottom,n.bottom)-10||o.bottom<Math.max(a.top,n.top)+10?null:this.view.state.facet(rt).positionInfo(this.view,n,o,r,a,this.dom)}placeInfo(e){this.info&&(e?(e.style&&(this.info.style.cssText=e.style),this.info.className="cm-tooltip cm-completionInfo "+(e.class||"")):this.info.style.cssText="top: -1e6px")}createListBox(e,n,r){let o=document.createElement("ul");o.id=n,o.setAttribute("role","listbox"),o.setAttribute("aria-expanded","true"),o.setAttribute("aria-label",this.view.state.phrase("Completions")),o.addEventListener("mousedown",i=>{i.target==o&&i.preventDefault()});let a=null;for(let i=r.from;i<r.to;i++){let{completion:l,match:s}=e[i],{section:f}=l;if(f){let d=typeof f=="string"?f:f.name;if(d!=a&&(i>r.from||r.from==0))if(a=d,typeof f!="string"&&f.header)o.appendChild(f.header(f));else{let p=o.appendChild(document.createElement("completion-section"));p.textContent=d}}let c=o.appendChild(document.createElement("li"));c.id=n+"-"+i,c.setAttribute("role","option");let u=this.optionClass(l);u&&(c.className=u);for(let d of this.optionContent){let p=d(l,this.view.state,this.view,s);p&&c.appendChild(p)}}return r.from&&o.classList.add("cm-completionListIncompleteTop"),r.to<e.length&&o.classList.add("cm-completionListIncompleteBottom"),o}destroyInfo(){this.info&&(this.infoDestroy&&this.infoDestroy(),this.info.remove(),this.info=null)}destroy(){this.destroyInfo()}};Ny=class t{constructor(e,n,r,o,a,i){this.options=e,this.attrs=n,this.tooltip=r,this.timestamp=o,this.selected=a,this.disabled=i}setSelected(e,n){return e==this.selected||e>=this.options.length?this:new t(this.options,R2(n,e),this.tooltip,this.timestamp,e,this.disabled)}static build(e,n,r,o,a,i){if(o&&!i&&e.some(f=>f.isPending))return o.setDisabled();let l=MN(e,n);if(!l.length)return o&&e.some(f=>f.isPending)?o.setDisabled():null;let s=n.facet(rt).selectOnOpen?0:-1;if(o&&o.selected!=s&&o.selected!=-1){let f=o.options[o.selected].completion;for(let c=0;c<l.length;c++)if(l[c].completion==f){s=c;break}}return new t(l,R2(r,s),{pos:e.reduce((f,c)=>c.hasResult()?Math.min(f,c.from):f,1e8),create:FN,above:a.aboveCursor},o?o.timestamp:Date.now(),s,!1)}map(e){return new t(this.options,this.attrs,{...this.tooltip,pos:e.mapPos(this.tooltip.pos)},this.timestamp,this.selected,this.disabled)}setDisabled(){return new t(this.options,this.attrs,this.tooltip,this.timestamp,this.selected,!0)}},qy=class t{constructor(e,n,r){this.active=e,this.id=n,this.open=r}static start(){return new t(BN,"cm-ac-"+Math.floor(Math.random()*2e6).toString(36),null)}update(e){let{state:n}=e,r=n.facet(rt),a=(r.override||n.languageDataAt("autocomplete",Ca(n)).map(SN)).map(s=>(this.active.find(c=>c.source==s)||new Lr(s,this.active.some(c=>c.state!=0)?1:0)).update(e,r));a.length==this.active.length&&a.every((s,f)=>s==this.active[f])&&(a=this.active);let i=this.open,l=e.effects.some(s=>s.is(Hy));i&&e.docChanged&&(i=i.map(e.changes)),e.selection||a.some(s=>s.hasResult()&&e.changes.touchesRange(s.from,s.to))||!DN(a,this.active)||l?i=Ny.build(a,n,this.id,i,r,l):i&&i.disabled&&!a.some(s=>s.isPending)&&(i=null),!i&&a.every(s=>!s.isPending)&&a.some(s=>s.hasResult())&&(a=a.map(s=>s.hasResult()?new Lr(s.source,0):s));for(let s of e.effects)s.is(zy)&&(i=i&&i.setSelected(s.value,this.id));return a==this.active&&i==this.open?this:new t(a,this.id,i)}get tooltip(){return this.open?this.open.tooltip:null}get attrs(){return this.open?this.open.attrs:this.active.length?ON:RN}};ON={"aria-autocomplete":"list"},RN={};BN=[];Lr=class t{constructor(e,n,r=!1){this.source=e,this.state=n,this.explicit=r}hasResult(){return!1}get isPending(){return this.state==1}update(e,n){let r=L2(e,n),o=this;(r&8||r&16&&this.touches(e))&&(o=new t(o.source,0)),r&4&&o.state==0&&(o=new t(this.source,1)),o=o.updateFor(e,r);for(let a of e.effects)if(a.is(Id))o=new t(o.source,1,a.value);else if(a.is(df))o=new t(o.source,0);else if(a.is(Hy))for(let i of a.value)i.source==o.source&&(o=i);return o}updateFor(e,n){return this.map(e.changes)}map(e){return this}touches(e){return e.changes.touchesRange(Ca(e.state))}},vd=class t extends Lr{constructor(e,n,r,o,a,i){super(e,3,n),this.limit=r,this.result=o,this.from=a,this.to=i}hasResult(){return!0}updateFor(e,n){var r;if(!(n&3))return this.map(e.changes);let o=this.result;o.map&&!e.changes.empty&&(o=o.map(o,e.changes));let a=e.changes.mapPos(this.from),i=e.changes.mapPos(this.to,1),l=Ca(e.state);if(l>i||!o||n&2&&(Ca(e.startState)==this.from||l<this.limit))return new Lr(this.source,n&4?1:0);let s=e.changes.mapPos(this.limit);return EN(o.validFor,e.state,a,i)?new t(this.source,this.explicit,s,o,a,i):o.update&&(o=o.update(o,a,i,new yd(e.state,l,!1)))?new t(this.source,this.explicit,s,o,o.from,(r=o.to)!==null&&r!==void 0?r:Ca(e.state)):new Lr(this.source,1,this.explicit)}map(e){if(e.empty)return this;let n=this.result.map?this.result.map(this.result,e):this.result;return n?new t(this.source,this.explicit,e.mapPos(this.limit),n,e.mapPos(this.from),e.mapPos(this.to,1)):new Lr(this.source,0)}touches(e){return e.changes.touchesRange(this.from,this.to)}};Hy=le.define({map(t,e){return t.map(n=>n.map(e))}}),zt=xt.define({create(){return qy.start()},update(t,e){return t.update(e)},provide:t=>[ty.from(t,e=>e.tooltip),V.contentAttributes.from(t,e=>e.attrs)]});FN=AN(zt,Uy);LN=t=>{let e=t.state.field(zt,!1);return t.state.readOnly||!e||!e.open||e.open.selected<0||e.open.disabled||Date.now()-e.open.timestamp<t.state.facet(rt).interactionDelay?!1:Uy(t,e.open.options[e.open.selected])},By=t=>t.state.field(zt,!1)?(t.dispatch({effects:Id.of(!0)}),!0):!1,NN=t=>{let e=t.state.field(zt,!1);return!e||!e.active.some(n=>n.state!=0)?!1:(t.dispatch({effects:df.of(null)}),!0)},Py=class{constructor(e,n){this.active=e,this.context=n,this.time=Date.now(),this.updates=[],this.done=void 0}},qN=50,PN=1e3,_N=_t.fromClass(class{constructor(t){this.view=t,this.debounceUpdate=-1,this.running=[],this.debounceAccept=-1,this.pendingStart=!1,this.composing=0;for(let e of t.state.field(zt).active)e.isPending&&this.startQuery(e)}update(t){let e=t.state.field(zt),n=t.state.facet(rt);if(!t.selectionSet&&!t.docChanged&&t.startState.field(zt)==e)return;let r=t.transactions.some(a=>{let i=L2(a,n);return i&8||(a.selection||a.docChanged)&&!(i&3)});for(let a=0;a<this.running.length;a++){let i=this.running[a];if(r||i.context.abortOnDocChange&&t.docChanged||i.updates.length+t.transactions.length>qN&&Date.now()-i.time>PN){for(let l of i.context.abortListeners)try{l()}catch(s){At(this.view.state,s)}i.context.abortListeners=null,this.running.splice(a--,1)}else i.updates.push(...t.transactions)}this.debounceUpdate>-1&&clearTimeout(this.debounceUpdate),t.transactions.some(a=>a.effects.some(i=>i.is(Id)))&&(this.pendingStart=!0);let o=this.pendingStart?50:n.activateOnTypingDelay;if(this.debounceUpdate=e.active.some(a=>a.isPending&&!this.running.some(i=>i.active.source==a.source))?setTimeout(()=>this.startUpdate(),o):-1,this.composing!=0)for(let a of t.transactions)a.isUserEvent("input.type")?this.composing=2:this.composing==2&&a.selection&&(this.composing=3)}startUpdate(){this.debounceUpdate=-1,this.pendingStart=!1;let{state:t}=this.view,e=t.field(zt);for(let n of e.active)n.isPending&&!this.running.some(r=>r.active.source==n.source)&&this.startQuery(n);this.running.length&&e.open&&e.open.disabled&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(rt).updateSyncTime))}startQuery(t){let{state:e}=this.view,n=Ca(e),r=new yd(e,n,t.explicit,this.view),o=new Py(t,r);this.running.push(o),Promise.resolve(t.source(r)).then(a=>{o.context.aborted||(o.done=a||null,this.scheduleAccept())},a=>{this.view.dispatch({effects:df.of(null)}),At(this.view.state,a)})}scheduleAccept(){this.running.every(t=>t.done!==void 0)?this.accept():this.debounceAccept<0&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(rt).updateSyncTime))}accept(){var t;this.debounceAccept>-1&&clearTimeout(this.debounceAccept),this.debounceAccept=-1;let e=[],n=this.view.state.facet(rt),r=this.view.state.field(zt);for(let o=0;o<this.running.length;o++){let a=this.running[o];if(a.done===void 0)continue;if(this.running.splice(o--,1),a.done){let l=Ca(a.updates.length?a.updates[0].startState:this.view.state),s=Math.min(l,a.done.from+(a.active.explicit?0:1)),f=new vd(a.active.source,a.active.explicit,s,a.done,a.done.from,(t=a.done.to)!==null&&t!==void 0?t:l);for(let c of a.updates)f=f.update(c,n);if(f.hasResult()){e.push(f);continue}}let i=r.active.find(l=>l.source==a.active.source);if(i&&i.isPending)if(a.done==null){let l=new Lr(a.active.source,0);for(let s of a.updates)l=l.update(s,n);l.isPending||e.push(l)}else this.startQuery(i)}(e.length||r.open&&r.open.disabled)&&this.view.dispatch({effects:Hy.of(e)})}},{eventHandlers:{blur(t){let e=this.view.state.field(zt,!1);if(e&&e.tooltip&&this.view.state.facet(rt).closeOnBlur){let n=e.open&&ny(this.view,e.open.tooltip);(!n||!n.dom.contains(t.relatedTarget))&&setTimeout(()=>this.view.dispatch({effects:df.of(null)}),10)}},compositionstart(){this.composing=1},compositionend(){this.composing==3&&setTimeout(()=>this.view.dispatch({effects:Id.of(!1)}),20),this.composing=0}}}),zN=typeof navigator=="object"&&/Win/.test(navigator.platform),HN=On.highest(V.domEventHandlers({keydown(t,e){let n=e.state.field(zt,!1);if(!n||!n.open||n.open.disabled||n.open.selected<0||!t.key||t.key.length>1||t.ctrlKey&&!(zN&&t.altKey)||t.metaKey)return!1;let r=n.open.options[n.open.selected],o=n.active.find(i=>i.source==r.source),a=r.completion.commitCharacters||o.result.commitCharacters;return a&&a.indexOf(t.key)>-1&&Uy(e,r),!1}})),UN=V.baseTheme({".cm-tooltip.cm-tooltip-autocomplete":{"& > ul":{fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden auto",maxWidth_fallback:"700px",maxWidth:"min(700px, 95vw)",minWidth:"250px",maxHeight:"10em",height:"100%",listStyle:"none",margin:0,padding:0,"& > li, & > completion-section":{padding:"1px 3px",lineHeight:1.2},"& > li":{overflowX:"hidden",textOverflow:"ellipsis",cursor:"pointer"},"& > completion-section":{display:"list-item",borderBottom:"1px solid silver",paddingLeft:"0.5em",opacity:.7}}},"&light .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#17c",color:"white"},"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#777"},"&dark .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#347",color:"white"},"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#444"},".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":{content:'"\xB7\xB7\xB7"',opacity:.5,display:"block",textAlign:"center",cursor:"pointer"},".cm-tooltip.cm-completionInfo":{position:"absolute",padding:"3px 9px",width:"max-content",maxWidth:"400px",boxSizing:"border-box",whiteSpace:"pre-line"},".cm-completionInfo.cm-completionInfo-left":{right:"100%"},".cm-completionInfo.cm-completionInfo-right":{left:"100%"},".cm-completionInfo.cm-completionInfo-left-narrow":{right:"30px"},".cm-completionInfo.cm-completionInfo-right-narrow":{left:"30px"},"&light .cm-snippetField":{backgroundColor:"#00000022"},"&dark .cm-snippetField":{backgroundColor:"#ffffff22"},".cm-snippetFieldPosition":{verticalAlign:"text-top",width:0,height:"1.15em",display:"inline-block",margin:"0 -0.7px -.7em",borderLeft:"1.4px dotted #888"},".cm-completionMatchedText":{textDecoration:"underline"},".cm-completionDetail":{marginLeft:"0.5em",fontStyle:"italic"},".cm-completionIcon":{fontSize:"90%",width:".8em",display:"inline-block",textAlign:"center",paddingRight:".6em",opacity:"0.6",boxSizing:"content-box"},".cm-completionIcon-function, .cm-completionIcon-method":{"&:after":{content:"'\u0192'"}},".cm-completionIcon-class":{"&:after":{content:"'\u25CB'"}},".cm-completionIcon-interface":{"&:after":{content:"'\u25CC'"}},".cm-completionIcon-variable":{"&:after":{content:"'\u{1D465}'"}},".cm-completionIcon-constant":{"&:after":{content:"'\u{1D436}'"}},".cm-completionIcon-type":{"&:after":{content:"'\u{1D461}'"}},".cm-completionIcon-enum":{"&:after":{content:"'\u222A'"}},".cm-completionIcon-property":{"&:after":{content:"'\u25A1'"}},".cm-completionIcon-keyword":{"&:after":{content:"'\u{1F511}\uFE0E'"}},".cm-completionIcon-namespace":{"&:after":{content:"'\u25A2'"}},".cm-completionIcon-text":{"&:after":{content:"'abc'",fontSize:"50%",verticalAlign:"middle"}}}),N2=new class extends yn{};N2.startSide=1;N2.endSide=-1;a5=typeof navigator=="object"&&/Android\b/.test(navigator.userAgent);jy=[{key:"Ctrl-Space",run:By},{mac:"Alt-`",run:By},{mac:"Alt-i",run:By},{key:"Escape",run:NN},{key:"ArrowDown",run:gd(!0)},{key:"ArrowUp",run:gd(!1)},{key:"PageDown",run:gd(!0,"page")},{key:"PageUp",run:gd(!1,"page")},{key:"Enter",run:LN}],jN=On.highest(ol.computeN([rt],t=>t.facet(rt).defaultKeymap?[jy]:[]))});function Xy(t){return t>=65&&t<=90||t>=97&&t<=122||t>=48&&t<=57}function s4(t){return t>=48&&t<=57||t>=97&&t<=102||t>=65&&t<=70}function Ta(t,e,n){for(let r=!1;;){if(t.next<0)return;if(t.next==e&&!r){t.advance();return}r=n&&!r&&t.next==92,t.advance()}}function f4(t,e){e:for(;;){if(t.next<0)return;if(t.next==36){t.advance();for(let n=0;n<e.length;n++){if(t.next!=e.charCodeAt(n))continue e;t.advance()}if(t.next==36){t.advance();return}}else t.advance()}}function c4(t,e){let n="[{<(".indexOf(String.fromCharCode(e)),r=n<0?e:"]}>)".charCodeAt(n);for(;;){if(t.next<0)return;if(t.next==r&&t.peek(1)==39){t.advance(2);return}t.advance()}}function Wy(t,e){for(;!(t.next!=95&&!Xy(t.next));)e!=null&&(e+=String.fromCharCode(t.next)),t.advance();return e}function u4(t){if(t.next==39||t.next==34||t.next==96){let e=t.next;t.advance(),Ta(t,e,!1)}else Wy(t)}function H2(t,e){for(;t.next==48||t.next==49;)t.advance();e&&t.next==e&&t.advance()}function U2(t,e){for(;;){if(t.next==46){if(e)break;e=!0}else if(t.next<48||t.next>57)break;t.advance()}if(t.next==69||t.next==101)for(t.advance(),(t.next==43||t.next==45)&&t.advance();t.next>=48&&t.next<=57;)t.advance()}function j2(t){for(;!(t.next<0||t.next==10);)t.advance()}function Aa(t,e){for(let n=0;n<e.length;n++)if(e.charCodeAt(n)==t)return!0;return!1}function K2(t,e,n){let r=Object.create(null);r.true=r.false=QN,r.null=r.unknown=XN;for(let o of t.split(" "))o&&(r[o]=X2);for(let o of e.split(" "))o&&(r[o]=W2);for(let o of(n||"").split(" "))o&&(r[o]=l4);return r}function d4(t,e,n,r){let o={};for(let a in Ky)o[a]=(t.hasOwnProperty(a)?t:Ky)[a];return e&&(o.words=K2(e,n||"",r)),o}function Y2(t){return new hd(e=>{var n;let{next:r}=e;if(e.advance(),Aa(r,Qy)){for(;Aa(e.next,Qy);)e.advance();e.acceptToken(VN)}else if(r==36&&t.doubleDollarQuotedStrings){let o=Wy(e,"");e.next==36&&(e.advance(),f4(e,o),e.acceptToken(fl))}else if(r==39||r==34&&t.doubleQuotedStrings)Ta(e,r,t.backslashEscapes),e.acceptToken(fl);else if(r==35&&t.hashComments||r==47&&e.next==47&&t.slashComments)j2(e),e.acceptToken(P2);else if(r==45&&e.next==45&&(!t.spaceAfterDashes||e.peek(1)==32))j2(e),e.acceptToken(P2);else if(r==47&&e.next==42){e.advance();for(let o=1;;){let a=e.next;if(e.next<0)break;if(e.advance(),a==42&&e.next==47){if(o--,e.advance(),!o)break}else a==47&&e.next==42&&(o++,e.advance())}e.acceptToken(GN)}else if((r==101||r==69)&&e.next==39)e.advance(),Ta(e,39,!0),e.acceptToken(fl);else if((r==110||r==78)&&e.next==39&&t.charSetCasts)e.advance(),Ta(e,39,t.backslashEscapes),e.acceptToken(fl);else if(r==95&&t.charSetCasts)for(let o=0;;o++){if(e.next==39&&o>1){e.advance(),Ta(e,39,t.backslashEscapes),e.acceptToken(fl);break}if(!Xy(e.next))break;e.advance()}else if(t.plsqlQuotingMechanism&&(r==113||r==81)&&e.next==39&&e.peek(1)>0&&!Aa(e.peek(1),Qy)){let o=e.peek(1);e.advance(2),c4(e,o),e.acceptToken(fl)}else if(Aa(r,t.identifierQuotes)){let o=r==91?93:r;Ta(e,o,!1),e.acceptToken(a4)}else if(r==40)e.acceptToken(WN);else if(r==41)e.acceptToken(KN);else if(r==123)e.acceptToken(YN);else if(r==125)e.acceptToken(JN);else if(r==91)e.acceptToken($N);else if(r==93)e.acceptToken(ZN);else if(r==59)e.acceptToken(e4);else if(t.unquotedBitLiterals&&r==48&&e.next==98)e.advance(),H2(e),e.acceptToken(z2);else if((r==98||r==66)&&(e.next==39||e.next==34)){let o=e.next;e.advance(),t.treatBitsAsBytes?(Ta(e,o,t.backslashEscapes),e.acceptToken(i4)):(H2(e,o),e.acceptToken(z2))}else if(r==48&&(e.next==120||e.next==88)||(r==120||r==88)&&e.next==39){let o=e.next==39;for(e.advance();s4(e.next);)e.advance();o&&e.next==39&&e.advance(),e.acceptToken(Gy)}else if(r==46&&e.next>=48&&e.next<=57)U2(e,!0),e.acceptToken(Gy);else if(r==46)e.acceptToken(t4);else if(r>=48&&r<=57)U2(e,!1),e.acceptToken(Gy);else if(Aa(r,t.operatorChars)){for(;Aa(e.next,t.operatorChars);)e.advance();e.acceptToken(n4)}else if(Aa(r,t.specialVar))e.next==r&&e.advance(),u4(e),e.acceptToken(o4);else if(r==58||r==44)e.acceptToken(r4);else if(Xy(r)){let o=Wy(e,String.fromCharCode(r));e.acceptToken(e.next==46||e.peek(-o.length-1)==46?_2:(n=t.words[o.toLowerCase()])!==null&&n!==void 0?n:_2)}})}function Yy(t){let e=t.cursor().moveTo(t.from,-1);for(;/Comment/.test(e.name);)e.moveTo(e.from,-1);return e.node}function pf(t,e){let n=t.sliceString(e.from,e.to),r=/^([`'"\[])(.*)([`'"\]])$/.exec(n);return r?r[2]:n}function wd(t){return t&&(t.name=="Identifier"||t.name=="QuotedIdentifier")}function m4(t,e){if(e.name=="CompositeIdentifier"){let n=[];for(let r=e.firstChild;r;r=r.nextSibling)wd(r)&&n.push(pf(t,r));return n}return[pf(t,e)]}function V2(t,e){for(let n=[];;){if(!e||e.name!=".")return n;let r=Yy(e);if(!wd(r))return n;n.unshift(pf(t,r)),e=Yy(r)}}function h4(t,e){let n=gt(t).resolveInner(e,-1),r=g4(t.doc,n);return n.name=="Identifier"||n.name=="QuotedIdentifier"||n.name=="Keyword"?{from:n.from,quoted:n.name=="QuotedIdentifier"?t.doc.sliceString(n.from,n.from+1):null,parents:V2(t.doc,Yy(n)),aliases:r}:n.name=="."?{from:e,quoted:null,parents:V2(t.doc,n),aliases:r}:{from:e,quoted:null,parents:[],empty:!0,aliases:r}}function g4(t,e){let n;for(let o=e;!n;o=o.parent){if(!o)return null;o.name=="Statement"&&(n=o)}let r=null;for(let o=n.firstChild,a=!1,i=null;o;o=o.nextSibling){let l=o.name=="Keyword"?t.sliceString(o.from,o.to).toLowerCase():null,s=null;if(!a)a=l=="from";else if(l=="as"&&i&&wd(o.nextSibling))s=pf(t,o.nextSibling);else{if(l&&x4.has(l))break;i&&wd(o)&&(s=pf(t,o))}s&&(r||(r=Object.create(null)),r[s]=m4(t,i)),i=/Identifier$/.test(o.name)?o:null}return r}function y4(t,e,n){return n.map(r=>({...r,label:r.label[0]==t?r.label:t+r.label+e,apply:void 0}))}function G2(t){return t.self&&typeof t.self.label=="string"}function Q2(t,e,n,r){return new RegExp("^[a-z_][a-z_\\d]*$",r?"i":"").test(t)?{label:t,type:e}:{label:t,type:e,apply:n+t+$2(n)}}function $2(t){return t==="["?"]":t}function v4(t,e,n,r,o,a){var i;let l=((i=a?.spec.identifierQuotes)===null||i===void 0?void 0:i[0])||'"',s=new Jy(l,!!a?.spec.caseInsensitiveIdentifiers),f=o?s.child(o):null;return s.addNamespace(t),e&&(f||s).addCompletions(e),n&&s.addCompletions(n),f&&s.addCompletions(f.list),r&&s.addCompletions((f||s).child(r).list),c=>{let{parents:u,from:d,quoted:p,empty:h,aliases:y}=h4(c.state,c.pos);if(h&&!c.explicit)return null;y&&u.length==1&&(u=y[u[0]]||u);let b=s;for(let g of u){for(;!b.children||!b.children[g];)if(b==s&&f)b=f;else if(b==f&&r)b=b.child(r);else return null;let x=b.maybeChild(g);if(!x)return null;b=x}let m=b.list;if(b==s&&y&&(m=m.concat(Object.keys(y).map(g=>({label:g,type:"constant"})))),p){let g=p[0],x=$2(g),I=c.state.sliceDoc(c.pos,c.pos+1)==x;return{from:d,to:I?c.pos+1:void 0,options:y4(g,x,m),validFor:I4}}else return{from:d,options:m,validFor:b4}}}function w4(t){return t==W2?"type":t==X2?"keyword":"variable"}function S4(t,e,n){let r=Object.keys(t).map(o=>n(e?o.toUpperCase():o,w4(t[o])));return B2(["QuotedIdentifier","String","LineComment","BlockComment","."],_y(r))}function C4(t,e){return{label:t,type:e,boost:-1}}function A4(t,e=!1,n){return S4(t.dialect.words,e,n||C4)}function T4(t){return t.schema?v4(t.schema,t.tables,t.schemas,t.defaultTable,t.defaultSchema,t.dialect||$y):()=>null}function M4(t){return t.schema?(t.dialect||$y).language.data.of({autocomplete:T4(t)}):[]}function Z2(t={}){let e=t.dialect||$y;return new pd(e.language,[M4(t),e.language.data.of({autocomplete:A4(e,t.upperCaseKeywords,t.keywordCompletion)})])}var VN,P2,GN,fl,Gy,QN,XN,WN,KN,YN,JN,$N,ZN,e4,t4,n4,r4,o4,_2,a4,X2,W2,z2,i4,l4,Qy,Ma,Da,Ky,J2,p4,x4,b4,I4,Jy,k4,or,$y,eA,tA,nA,rA,oA,p5,D4,m5,aA,h5,x5,Zy=F(()=>{cf();ly();A2();Vy();VN=36,P2=1,GN=2,fl=3,Gy=4,QN=5,XN=6,WN=7,KN=8,YN=9,JN=10,$N=11,ZN=12,e4=13,t4=14,n4=15,r4=16,o4=17,_2=18,a4=19,X2=20,W2=21,z2=22,i4=23,l4=24;Qy=` 	\r
`;Ma="array binary bit boolean char character clob date decimal double float int integer interval large national nchar nclob numeric object precision real smallint time timestamp varchar varying ",Da="absolute action add after all allocate alter and any are as asc assertion at authorization before begin between both breadth by call cascade cascaded case cast catalog check close collate collation column commit condition connect connection constraint constraints constructor continue corresponding count create cross cube current current_date current_default_transform_group current_transform_group_for_type current_path current_role current_time current_timestamp current_user cursor cycle data day deallocate declare default deferrable deferred delete depth deref desc describe descriptor deterministic diagnostics disconnect distinct do domain drop dynamic each else elseif end end-exec equals escape except exception exec execute exists exit external fetch first for foreign found from free full function general get global go goto grant group grouping handle having hold hour identity if immediate in indicator initially inner inout input insert intersect into is isolation join key language last lateral leading leave left level like limit local localtime localtimestamp locator loop map match method minute modifies module month names natural nesting new next no none not of old on only open option or order ordinality out outer output overlaps pad parameter partial path prepare preserve primary prior privileges procedure public read reads recursive redo ref references referencing relative release repeat resignal restrict result return returns revoke right role rollback rollup routine row rows savepoint schema scroll search second section select session session_user set sets signal similar size some space specific specifictype sql sqlexception sqlstate sqlwarning start state static system_user table temporary then timezone_hour timezone_minute to trailing transaction translation treat trigger under undo union unique unnest until update usage user using value values view when whenever where while with without work write year zone ",Ky={backslashEscapes:!1,hashComments:!1,spaceAfterDashes:!1,slashComments:!1,doubleQuotedStrings:!1,doubleDollarQuotedStrings:!1,unquotedBitLiterals:!1,treatBitsAsBytes:!1,charSetCasts:!1,plsqlQuotingMechanism:!1,operatorChars:"*+-%<>!=&|~^/",specialVar:"?",identifierQuotes:'"',caseInsensitiveIdentifiers:!1,words:K2(Da,Ma)};J2=Y2(Ky),p4=xd.deserialize({version:14,states:"%vQ]QQOOO#wQRO'#DSO$OQQO'#CwO%eQQO'#CxO%lQQO'#CyO%sQQO'#CzOOQQ'#DS'#DSOOQQ'#C}'#C}O'UQRO'#C{OOQQ'#Cv'#CvOOQQ'#C|'#C|Q]QQOOQOQQOOO'`QQO'#DOO(xQRO,59cO)PQQO,59cO)UQQO'#DSOOQQ,59d,59dO)cQQO,59dOOQQ,59e,59eO)jQQO,59eOOQQ,59f,59fO)qQQO,59fOOQQ-E6{-E6{OOQQ,59b,59bOOQQ-E6z-E6zOOQQ,59j,59jOOQQ-E6|-E6|O+VQRO1G.}O+^QQO,59cOOQQ1G/O1G/OOOQQ1G/P1G/POOQQ1G/Q1G/QP+kQQO'#C}O+rQQO1G.}O)PQQO,59cO,PQQO'#Cw",stateData:",[~OtOSPOSQOS~ORUOSUOTUOUUOVROXSOZTO]XO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O^]ORvXSvXTvXUvXVvXXvXZvX]vX_vX`vXavXbvXcvXdvXevXfvXgvXhvX~OsvX~P!jOa_Ob_Oc_O~ORUOSUOTUOUUOVROXSOZTO^tO_UO`UOa`Ob`Oc`OdUOeUOfUOgUOhUO~OWaO~P$ZOYcO~P$ZO[eO~P$ZORUOSUOTUOUUOVROXSOZTO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O]hOsoX~P%zOajObjOcjO~O^]ORkaSkaTkaUkaVkaXkaZka]ka_ka`kaakabkackadkaekafkagkahka~Oska~P'kO^]O~OWvXYvX[vX~P!jOWnO~P$ZOYoO~P$ZO[pO~P$ZO^]ORkiSkiTkiUkiVkiXkiZki]ki_ki`kiakibkickidkiekifkigkihki~Oski~P)xOWkaYka[ka~P'kO]hO~P$ZOWkiYki[ki~P)xOasObsOcsO~O",goto:"#hwPPPPPPPPPPPPPPPPPPPPPPPPPPx||||!Y!^!d!xPPP#[TYOZeUORSTWZbdfqT[OZQZORiZSWOZQbRQdSQfTZgWbdfqQ^PWk^lmrQl_Qm`RrseVORSTWZbdfq",nodeNames:"\u26A0 LineComment BlockComment String Number Bool Null ( ) { } [ ] ; . Operator Punctuation SpecialVar Identifier QuotedIdentifier Keyword Type Bits Bytes Builtin Script Statement CompositeIdentifier Parens Braces Brackets Statement",maxTerm:38,nodeProps:[["isolate",-4,1,2,3,19,""]],skippedNodes:[0,1,2],repeatNodeCount:3,tokenData:"RORO",tokenizers:[0,J2],topRules:{Script:[0,25]},tokenPrec:0});x4=new Set("where group having order union intersect except all distinct limit offset fetch for".split(" "));b4=/^\w*$/,I4=/^[`'"\[]?\w*[`'"\]]?$/;Jy=class t{constructor(e,n){this.idQuote=e,this.idCaseInsensitive=n,this.list=[],this.children=void 0}child(e){let n=this.children||(this.children=Object.create(null)),r=n[e];return r||(e&&!this.list.some(o=>o.label==e)&&this.list.push(Q2(e,"type",this.idQuote,this.idCaseInsensitive)),n[e]=new t(this.idQuote,this.idCaseInsensitive))}maybeChild(e){return this.children?this.children[e]:null}addCompletion(e){let n=this.list.findIndex(r=>r.label==e.label);n>-1?this.list[n]=e:this.list.push(e)}addCompletions(e){for(let n of e)this.addCompletion(typeof n=="string"?Q2(n,"property",this.idQuote,this.idCaseInsensitive):n)}addNamespace(e){Array.isArray(e)?this.addCompletions(e):G2(e)?this.addNamespace(e.children):this.addNamespaceObject(e)}addNamespaceObject(e){for(let n of Object.keys(e)){let r=e[n],o=null,a=n.replace(/\\?\./g,l=>l=="."?"\0":l).split("\0"),i=this;G2(r)&&(o=r.self,r=r.children);for(let l=0;l<a.length;l++)o&&l==a.length-1&&i.addCompletion(o),i=i.child(a[l].replace(/\\\./g,"."));i.addNamespace(r)}}};k4=p4.configure({props:[Iy.add({Statement:u2()}),d2.add({Statement(t,e){return{from:Math.min(t.from+100,e.doc.lineAt(t.from).to),to:t.to}},BlockComment(t){return{from:t.from+2,to:t.to-2}}}),ud({Keyword:R.keyword,Type:R.typeName,Builtin:R.standard(R.name),Bits:R.number,Bytes:R.string,Bool:R.bool,Null:R.null,Number:R.number,String:R.string,Identifier:R.name,QuotedIdentifier:R.special(R.string),SpecialVar:R.special(R.name),LineComment:R.lineComment,BlockComment:R.blockComment,Operator:R.operator,"Semi Punctuation":R.punctuation,"( )":R.paren,"{ }":R.brace,"[ ]":R.squareBracket})]}),or=class t{constructor(e,n,r){this.dialect=e,this.language=n,this.spec=r}get extension(){return this.language.extension}configureLanguage(e,n){return new t(this.dialect,this.language.configure(e,n),this.spec)}static define(e){let n=d4(e,e.keywords,e.types,e.builtin),r=dd.define({name:"sql",parser:k4.configure({tokenizers:[{from:J2,to:Y2(n)}]}),languageData:{commentTokens:{line:"--",block:{open:"/*",close:"*/"}},closeBrackets:{brackets:["(","[","{","'",'"',"`"]}}});return new t(n,r,e)}};$y=or.define({}),eA=or.define({charSetCasts:!0,doubleDollarQuotedStrings:!0,operatorChars:"+-*/<>=~!@#%^&|`?",specialVar:"",keywords:Da+"abort abs absent access according ada admin aggregate alias also always analyse analyze array_agg array_max_cardinality asensitive assert assignment asymmetric atomic attach attribute attributes avg backward base64 begin_frame begin_partition bernoulli bit_length blocked bom cache called cardinality catalog_name ceil ceiling chain char_length character_length character_set_catalog character_set_name character_set_schema characteristics characters checkpoint class class_origin cluster coalesce cobol collation_catalog collation_name collation_schema collect column_name columns command_function command_function_code comment comments committed concurrently condition_number configuration conflict connection_name constant constraint_catalog constraint_name constraint_schema contains content control conversion convert copy corr cost covar_pop covar_samp csv cume_dist current_catalog current_row current_schema cursor_name database datalink datatype datetime_interval_code datetime_interval_precision db debug defaults defined definer degree delimiter delimiters dense_rank depends derived detach detail dictionary disable discard dispatch dlnewcopy dlpreviouscopy dlurlcomplete dlurlcompleteonly dlurlcompletewrite dlurlpath dlurlpathonly dlurlpathwrite dlurlscheme dlurlserver dlvalue document dump dynamic_function dynamic_function_code element elsif empty enable encoding encrypted end_frame end_partition endexec enforced enum errcode error event every exclude excluding exclusive exp explain expression extension extract family file filter final first_value flag floor following force foreach fortran forward frame_row freeze fs functions fusion generated granted greatest groups handler header hex hierarchy hint id ignore ilike immediately immutable implementation implicit import include including increment indent index indexes info inherit inherits inline insensitive instance instantiable instead integrity intersection invoker isnull key_member key_type label lag last_value lead leakproof least length library like_regex link listen ln load location lock locked log logged lower mapping matched materialized max max_cardinality maxvalue member merge message message_length message_octet_length message_text min minvalue mod mode more move multiset mumps name namespace nfc nfd nfkc nfkd nil normalize normalized nothing notice notify notnull nowait nth_value ntile nullable nullif nulls number occurrences_regex octet_length octets off offset oids operator options ordering others over overlay overriding owned owner parallel parameter_mode parameter_name parameter_ordinal_position parameter_specific_catalog parameter_specific_name parameter_specific_schema parser partition pascal passing passthrough password percent percent_rank percentile_cont percentile_disc perform period permission pg_context pg_datatype_name pg_exception_context pg_exception_detail pg_exception_hint placing plans pli policy portion position position_regex power precedes preceding prepared print_strict_params procedural procedures program publication query quote raise range rank reassign recheck recovery refresh regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy regr_syy reindex rename repeatable replace replica requiring reset respect restart restore result_oid returned_cardinality returned_length returned_octet_length returned_sqlstate returning reverse routine_catalog routine_name routine_schema routines row_count row_number rowtype rule scale schema_name schemas scope scope_catalog scope_name scope_schema security selective self sensitive sequence sequences serializable server server_name setof share show simple skip slice snapshot source specific_name sqlcode sqlerror sqrt stable stacked standalone statement statistics stddev_pop stddev_samp stdin stdout storage strict strip structure style subclass_origin submultiset subscription substring substring_regex succeeds sum symmetric sysid system system_time table_name tables tablesample tablespace temp template ties token top_level_count transaction_active transactions_committed transactions_rolled_back transform transforms translate translate_regex trigger_catalog trigger_name trigger_schema trim trim_array truncate trusted type types uescape unbounded uncommitted unencrypted unlink unlisten unlogged unnamed untyped upper uri use_column use_variable user_defined_type_catalog user_defined_type_code user_defined_type_name user_defined_type_schema vacuum valid validate validator value_of var_pop var_samp varbinary variable_conflict variadic verbose version versioning views volatile warning whitespace width_bucket window within wrapper xmlagg xmlattributes xmlbinary xmlcast xmlcomment xmlconcat xmldeclaration xmldocument xmlelement xmlexists xmlforest xmliterate xmlnamespaces xmlparse xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltext xmlvalidate yes",types:Ma+"bigint int8 bigserial serial8 varbit bool box bytea cidr circle precision float8 inet int4 json jsonb line lseg macaddr macaddr8 money numeric pg_lsn point polygon float4 int2 smallserial serial2 serial serial4 text timetz timestamptz tsquery tsvector txid_snapshot uuid xml"}),tA="accessible algorithm analyze asensitive authors auto_increment autocommit avg avg_row_length binlog btree cache catalog_name chain change changed checkpoint checksum class_origin client_statistics coalesce code collations columns comment committed completion concurrent consistent contains contributors convert database databases day_hour day_microsecond day_minute day_second delay_key_write delayed delimiter des_key_file dev_pop dev_samp deviance directory disable discard distinctrow div dual dumpfile enable enclosed ends engine engines enum errors escaped even event events every explain extended fast field fields flush force found_rows fulltext grants handler hash high_priority hosts hour_microsecond hour_minute hour_second ignore ignore_server_ids import index index_statistics infile innodb insensitive insert_method install invoker iterate keys kill linear lines list load lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modify mutex mysql_errno no_write_to_binlog offline offset one online optimize optionally outfile pack_keys parser partition partitions password phase plugin plugins prev processlist profile profiles purge query quick range read_write rebuild recover regexp relaylog remove rename reorganize repair repeatable replace require resume rlike row_format rtree schedule schema_name schemas second_microsecond security sensitive separator serializable server share show slave slow snapshot soname spatial sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result ssl starting starts std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace terminated triggers truncate uncommitted uninstall unlock upgrade use use_frm user_resources user_statistics utc_date utc_time utc_timestamp variables views warnings xa xor year_month zerofill",nA=Ma+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int1 int2 int3 int4 int8 float4 float8 varbinary varcharacter precision datetime unsigned signed",rA="charset clear edit ego help nopager notee nowarning pager print prompt quit rehash source status system tee",oA=or.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:Da+"group_concat "+tA,types:nA,builtin:rA}),p5=or.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:Da+"always generated groupby_concat hard persistent shutdown soft virtual "+tA,types:nA,builtin:rA}),D4="approx_count_distinct approx_percentile_cont approx_percentile_disc avg checksum_agg count count_big grouping grouping_id max min product stdev stdevp sum var varp ai_generate_embeddings ai_generate_chunks cume_dist first_value lag last_value lead percentile_cont percentile_disc percent_rank left_shift right_shift bit_count get_bit set_bit collationproperty tertiary_weights @@datefirst @@dbts @@langid @@language @@lock_timeout @@max_connections @@max_precision @@nestlevel @@options @@remserver @@servername @@servicename @@spid @@textsize @@version cast convert parse try_cast try_convert try_parse asymkey_id asymkeyproperty certproperty cert_id crypt_gen_random decryptbyasymkey decryptbycert decryptbykey decryptbykeyautoasymkey decryptbykeyautocert decryptbypassphrase encryptbyasymkey encryptbycert encryptbykey encryptbypassphrase hashbytes is_objectsigned key_guid key_id key_name signbyasymkey signbycert symkeyproperty verifysignedbycert verifysignedbyasymkey @@cursor_rows @@fetch_status cursor_status datalength ident_current ident_incr ident_seed identity sql_variant_property @@datefirst current_timestamp current_timezone current_timezone_id date_bucket dateadd datediff datediff_big datefromparts datename datepart datetime2fromparts datetimefromparts datetimeoffsetfromparts datetrunc day eomonth getdate getutcdate isdate month smalldatetimefromparts switchoffset sysdatetime sysdatetimeoffset sysutcdatetime timefromparts todatetimeoffset year edit_distance edit_distance_similarity jaro_winkler_distance jaro_winkler_similarity edge_id_from_parts graph_id_from_edge_id graph_id_from_node_id node_id_from_parts object_id_from_edge_id object_id_from_node_id json isjson json_array json_contains json_modify json_object json_path_exists json_query json_value regexp_like regexp_replace regexp_substr regexp_instr regexp_count regexp_matches regexp_split_to_table abs acos asin atan atn2 ceiling cos cot degrees exp floor log log10 pi power radians rand round sign sin sqrt square tan choose greatest iif least @@procid app_name applock_mode applock_test assemblyproperty col_length col_name columnproperty databasepropertyex db_id db_name file_id file_idex file_name filegroup_id filegroup_name filegroupproperty fileproperty filepropertyex fulltextcatalogproperty fulltextserviceproperty index_col indexkey_property indexproperty next value for object_definition object_id object_name object_schema_name objectproperty objectpropertyex original_db_name parsename schema_id schema_name scope_identity serverproperty stats_date type_id type_name typeproperty dense_rank ntile rank row_number publishingservername certenclosed certprivatekey current_user database_principal_id has_dbaccess has_perms_by_name is_member is_rolemember is_srvrolemember loginproperty original_login permissions pwdencrypt pwdcompare session_user sessionproperty suser_id suser_name suser_sid suser_sname system_user user user_id user_name ascii char charindex concat concat_ws difference format left len lower ltrim nchar patindex quotename replace replicate reverse right rtrim soundex space str string_agg string_escape stuff substring translate trim unicode upper $partition @@error @@identity @@pack_received @@rowcount @@trancount binary_checksum checksum compress connectionproperty context_info current_request_id current_transaction_id decompress error_line error_message error_number error_procedure error_severity error_state formatmessage get_filestream_transaction_context getansinull host_id host_name isnull isnumeric min_active_rowversion newid newsequentialid rowcount_big session_context xact_state @@connections @@cpu_busy @@idle @@io_busy @@pack_sent @@packet_errors @@timeticks @@total_errors @@total_read @@total_write textptr textvalid columns_updated eventdata trigger_nestlevel vector_distance vectorproperty vector_search generate_series opendatasource openjson openquery openrowset openxml predict string_split coalesce nullif apply catch filter force include keep keepfixed modify optimize parameterization parameters partition recompile sequence set",m5=or.define({keywords:Da+"add external procedure all fetch public alter file raiserror and fillfactor read any for readtext as foreign reconfigure asc freetext references authorization freetexttable replication backup from restore begin full restrict between function return break goto revert browse grant revoke bulk group right by having rollback cascade holdlock rowcount case identity rowguidcol check identity_insert rule checkpoint identitycol save close if schema clustered in securityaudit coalesce index select collate inner semantickeyphrasetable column insert semanticsimilaritydetailstable commit intersect semanticsimilaritytable compute into session_user constraint is set contains join setuser containstable key shutdown continue kill some convert left statistics create like system_user cross lineno table current load tablesample current_date merge textsize current_time national then current_timestamp nocheck to current_user nonclustered top cursor not tran database null transaction dbcc nullif trigger deallocate of truncate declare off try_convert default offsets tsequal delete on union deny open unique desc opendatasource unpivot disk openquery update distinct openrowset updatetext distributed openxml use double option user drop or values dump order varying else outer view end over waitfor errlvl percent when escape pivot where except plan while exec precision with execute primary within group exists print writetext exit proc noexpand index forceseek forcescan holdlock nolock nowait paglock readcommitted readcommittedlock readpast readuncommitted repeatableread rowlock serializable snapshot spatial_window_max_cells tablock tablockx updlock xlock keepidentity keepdefaults ignore_constraints ignore_triggers",types:Ma+"smalldatetime datetimeoffset datetime2 datetime bigint smallint smallmoney tinyint money real text nvarchar ntext varbinary image hierarchyid uniqueidentifier sql_variant xml",builtin:D4,operatorChars:"*+-%<>!=^&|/",specialVar:"@",identifierQuotes:'"['}),aA=or.define({keywords:Da+"abort analyze attach autoincrement conflict database detach exclusive fail glob ignore index indexed instead isnull notnull offset plan pragma query raise regexp reindex rename replace temp vacuum virtual",types:Ma+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int2 int8 unsigned signed real",builtin:"auth backup bail changes clone databases dbinfo dump echo eqp explain fullschema headers help import imposter indexes iotrace lint load log mode nullvalue once print prompt quit restore save scanstats separator shell show stats system tables testcase timeout timer trace vfsinfo vfslist vfsname width",operatorChars:"*+-%<>!=&|/~",identifierQuotes:'`"',specialVar:"@:?$"}),h5=or.define({keywords:"add all allow alter and any apply as asc authorize batch begin by clustering columnfamily compact consistency count create custom delete desc distinct drop each_quorum exists filtering from grant if in index insert into key keyspace keyspaces level limit local_one local_quorum modify nan norecursive nosuperuser not of on one order password permission permissions primary quorum rename revoke schema select set storage superuser table three to token truncate ttl two type unlogged update use user users using values where with writetime infinity NaN",types:Ma+"ascii bigint blob counter frozen inet list map static text timeuuid tuple uuid varint",slashComments:!0}),x5=or.define({keywords:Da+"abort accept access add all alter and any arraylen as asc assert assign at attributes audit authorization avg base_table begin between binary_integer body by case cast char_base check close cluster clusters colauth column comment commit compress connected constant constraint crash create current currval cursor data_base database dba deallocate debugoff debugon declare default definition delay delete desc digits dispose distinct do drop else elseif elsif enable end entry exception exception_init exchange exclusive exists external fast fetch file for force form from function generic goto grant group having identified if immediate in increment index indexes indicator initial initrans insert interface intersect into is key level library like limited local lock log logging loop master maxextents maxtrans member minextents minus mislabel mode modify multiset new next no noaudit nocompress nologging noparallel not nowait number_base of off offline on online only option or order out package parallel partition pctfree pctincrease pctused pls_integer positive positiven pragma primary prior private privileges procedure public raise range raw rebuild record ref references refresh rename replace resource restrict return returning returns reverse revoke rollback row rowid rowlabel rownum rows run savepoint schema segment select separate set share snapshot some space split sql start statement storage subtype successful synonym tabauth table tables tablespace task terminate then to trigger truncate type union unique unlimited unrecoverable unusable update use using validate value values variable view views when whenever where while with work",builtin:"appinfo arraysize autocommit autoprint autorecovery autotrace blockterminator break btitle cmdsep colsep compatibility compute concat copycommit copytypecheck define echo editfile embedded feedback flagger flush heading headsep instance linesize lno loboffset logsource longchunksize markup native newpage numformat numwidth pagesize pause pno recsep recsepchar repfooter repheader serveroutput shiftinout show showmode spool sqlblanklines sqlcase sqlcode sqlcontinue sqlnumber sqlpluscompatibility sqlprefix sqlprompt sqlterminator suffix tab term termout timing trimout trimspool ttitle underline verify version wrap",types:Ma+"ascii bfile bfilename bigserial bit blob dec long number nvarchar nvarchar2 serial smallint string text uid varchar2 xml",operatorChars:"*/+-%<>!=~",doubleQuotedStrings:!0,charSetCasts:!0,plsqlQuotingMechanism:!0})});function mf(t){return t==="postgres"?eA:t==="mysql"?oA:aA}function R4(t){let e=t[0]==="create"?1:-1;return e<0?!1:((t[e]==="temp"||t[e]==="temporary")&&e++,t[e]==="trigger"&&t.includes("begin"))}function iA(t,e){let n=mf(e).language.parser.parse(t),r=[],o=n.cursor();if(!o.firstChild())return[];do{if(o.name!=="Statement")continue;let l=[];o.node.toTree().iterate({enter(s){if(O4.has(s.name))return!1;if(s.node.firstChild)return;let f=t.slice(o.from+s.from,o.from+s.to);/^[A-Za-z_]\w*$/.test(f)&&l.push(f.toLowerCase())}}),r.push({from:o.from,to:o.to,words:l})}while(o.nextSibling());let a=[];for(let l=0;l<r.length;l++){let s=r[l],f=s;if(R4(s.words))for(;l+1<r.length&&(f=r[++l],!(f.words.length===1&&f.words[0]==="end")););a.push({from:s.from,to:f.to})}let i=[];for(let{from:l,to:s}of a){let f=l,c=s;for(;c>f&&/\s/.test(t[c-1]);)c--;for(c>f&&t[c-1]===";"&&c--;c>f&&/\s/.test(t[c-1]);)c--;for(;f<c&&/\s/.test(t[f]);)f++;f>=c||i.push({from:f,to:c,text:t.slice(f,c),nodeTo:s})}return i}function hf(t,e){return iA(t,e).map(({from:n,to:r,text:o})=>({from:n,to:r,text:o}))}function Sd(t,e,n){let r=iA(t,n);if(r.length===0)return null;let o=r.find(a=>e>=a.from&&e<a.nodeTo);if(o||(o=r.find(a=>e===a.nodeTo)),!o)for(let a of r)a.nodeTo<e&&(o=a);return o||(o=r.find(a=>a.from>e)),o?{from:o.from,to:o.to,text:o.text}:null}var O4,xf=F(()=>{"use strict";Zy();O4=new Set(["String","LineComment","BlockComment","QuotedIdentifier","Number"])});function N4(t,e){let n=Array.from({length:e.length+1},(r,o)=>o);for(let r=1;r<=t.length;r++){let o=[r];for(let a=1;a<=e.length;a++)o[a]=Math.min(n[a]+1,o[a-1]+1,n[a-1]+(t[r-1]===e[a-1]?0:1));n=o}return n[e.length]}function q4(t){return lA.includes(t)?!1:t.length>=4&&lA.some(e=>e.length>=4&&N4(t,e)<=2)}function P4(t,e){let n=mf(e).language.parser.parse(t),r=-1,o=n.cursor();if(o.firstChild())do if(o.name==="Statement"){r=o.to;break}while(o.nextSibling());let a=[],i=!1,l=0;if(n.iterate({enter(c){if(i||r>=0&&c.from>=r)return!1;if(c.type.isError)return i=!0,!1;if(c.name==="Parens"){l++;return}if(c.name==="Script"||c.name==="Statement")return;let u=t.slice(c.from,c.to);if(/^[A-Za-z_][A-Za-z_0-9]*$/.test(u))a.push({word:u.toLowerCase(),text:u,depth:l});else{if(/^\s*$/.test(u)||/^(--|\/\*|#)/.test(u))return;a.push({word:"",text:u,depth:l})}},leave(c){c.name==="Parens"&&l--}}),i)return null;let s=a.filter(c=>c.text==="(").length,f=a.filter(c=>c.text===")").length;return s!==f?null:a.filter(c=>c.text!=="("&&c.text!==")")}function _4(t){let e=t.map(a=>a.word),n=a=>a===t.length-1&&(e[a]!==""||/^["`[]/.test(t[a].text)),r=1,o=(...a)=>{a.includes(e[r])&&r++};switch(e[0]){case"begin":return o("deferred","immediate","exclusive"),o("transaction"),r===t.length;case"commit":case"end":return o("transaction"),r===t.length;case"rollback":return o("transaction"),r===t.length?!0:e[r]!=="to"?!1:(r++,o("savepoint"),n(r));case"savepoint":return n(1);case"release":return o("savepoint"),n(r);default:return!1}}function z4(t,e){let n=P4(t,e);if(!n||n.length===0)return gf;let r=n.filter(s=>s.word),o=r[0];if(!o||n[0]!==o)return gf;if(_4(n))return{kind:"read",reason:""};let a=0,i=o.word,l=!1;if(i==="explain"){let s=!1,f=1;for(;f<n.length;f++){let c=n[f];if(c.depth>0||c.word&&B4.has(c.word)||!c.word){(c.word==="analyze"||c.word==="analyse")&&(s=!0);continue}break}n.slice(1,f).some(c=>c.word==="analyze"||c.word==="analyse")&&(s=!0),s&&f<n.length?(a=f,i=n[f].word):l=!0}if(i==="with"){let s=n.findIndex((f,c)=>c>a&&f.depth===0&&E4.has(f.word));s>0&&(a=s,i=n[s].word)}if(fA.has(i)&&!l)return{kind:"dangerous",reason:i.toUpperCase()};if((i==="delete"||i==="update")&&!l&&!n.some((f,c)=>c>a&&f.depth===0&&f.word==="where"))return{kind:"dangerous",reason:`${i.toUpperCase()} without WHERE`};for(let s=0;s<n.length;s++){let f=n[s];if(cA.has(f.word)&&!(f.word==="replace"&&s>0&&n[s+1]&&n[s+1].depth>f.depth))return{kind:"write",reason:f.word.toUpperCase()}}if((i==="select"||o.word==="select")&&n.some(s=>s.depth===0&&s.word==="into"))return{kind:"write",reason:"SELECT INTO"};if(o.word==="pragma"){if(n.some(s=>s.depth===0&&s.text==="="))return{kind:"write",reason:"PRAGMA assignment"};if(n.some(s=>s.depth>0)&&!r.slice(1,4).some(s=>s.depth===0&&F4.has(s.word)))return{kind:"write",reason:"PRAGMA assignment"}}if(o.word==="pragma"&&!n.some(s=>s.depth>0)){let s=[...n].reverse().find(f=>f.depth===0&&f.word);if(!s||s===o||!L4.has(s.word))return{kind:"write",reason:"PRAGMA"}}return uA.has(o.word)?{kind:"read",reason:""}:r.length>1&&q4(o.word)?gf:{kind:"write",reason:"unrecognized statement"}}function cl(t,e){let n=hf(t,e);if(n.length===0)return gf;let r=null;for(let o of n){let a=z4(o.text,e);(!r||sA[a.kind]>sA[r.kind])&&(r=a)}return r??gf}var fA,cA,uA,B4,E4,F4,lA,L4,gf,sA,kd=F(()=>{"use strict";xf();fA=new Set(["drop","truncate","alter","grant","revoke"]),cA=new Set(["insert","update","delete","replace","merge","create","attach","detach","vacuum","reindex","copy","call","do","set","reset","lock"]),uA=new Set(["select","with","values","explain","pragma","show","describe","desc","table"]),B4=new Set(["analyze","analyse","verbose","query","plan","costs","buffers","timing","summary","format","json","text","xml","yaml","true","false","on","off","settings","wal"]),E4=new Set(["select","values","insert","update","delete","replace","merge","table"]),F4=new Set(["table_info","table_xinfo","table_list","index_list","index_info","index_xinfo","foreign_key_list","foreign_key_check","integrity_check","quick_check","function_list","collation_list","database_list","compile_options","pragma_list","module_list"]),lA=[...fA,...cA,...uA,"begin","commit","end","rollback","savepoint","release"],L4=new Set(["table_info","table_xinfo","index_list","index_info","index_xinfo","foreign_key_list","database_list","collation_list","function_list","module_list","pragma_list","compile_options","schema_version","user_version","application_id","page_count","page_size","freelist_count","encoding","journal_mode","foreign_keys","query_only","integrity_check","quick_check","foreign_key_check","data_version"]),gf={kind:"dangerous",reason:"could not parse"};sA={read:0,write:1,dangerous:2}});function U4(t){if(typeof t!="object"||t===null)return!1;let e=t;return typeof e.code=="string"&&H4.has(e.code)&&typeof e.message=="string"&&e.message!==""}function j4(t){let e="";return typeof t=="string"?e=t:(t instanceof Error||typeof t=="object"&&t!==null&&typeof t.message=="string")&&(e=t.message),e.trim()===""?"Unknown SQL error.":e}function ot(t,e){if(U4(t))return t;let n=typeof t=="object"&&t!==null?t.name:void 0,r=j4(t);if(n==="AbortError")return{code:"cancelled",message:r==="Unknown SQL error."?"Query cancelled.":r};if(/readonly|read-only|query_only/i.test(r))return{code:"read-only",message:r};if(/not a database|file is not a database|database disk image is malformed/i.test(r))return{code:"not-a-database",message:r};if(/syntax error|near "/i.test(r)){let o={code:"syntax",message:r},a=/near "([^"]*)"/i.exec(r);if(a&&e!==void 0&&a[1]!==""){let i=e.indexOf(a[1]);i>=0&&(o.position=i)}return o}return{code:"server",message:r}}var H4,yf=F(()=>{"use strict";H4=new Set(["helper-missing","helper-outdated","auth-failed","tls-failed","network","timeout","cancelled","read-only","syntax","server","connection-lost","limit-reached","not-a-database"])});function Oo(t,e){let n=typeof t=="string"?t:"",r=n.length,o=0,a=r>0&&n.charCodeAt(0)===65279;a&&(o=1);let i,l=Nn(n,o,r);for(let b of V4)if(n.startsWith(b,l)){i=b,o=l+b.length;break}let s=Y4(e?.contentType);if(G4.has(s)||s===dA){let b=pA(n,o,r,s===dA?Q4:`
`);return bf(n,"ndjson",{t:"arr",items:b},i,a)}dl=0,pl=0,Nr=-1;let f=Nn(n,o,r),c=gA(n,f,r);if(c===null)return bf(n,"json",null,i,a);let u=Sf,d=Nn(n,u,r);if(d>=r)return bf(n,"json",c,i,a);let p=d,h=`${Cd(n,d)} after the JSON value`,y=n.indexOf(`
`,f);if(y>=u&&y<d){let b=pA(n,o,r,`
`);if(b.length>=2)return bf(n,"ndjson",{t:"arr",items:b},i,a)}return Nr=p,ul=h,bf(n,"json",null,i,a)}function Y4(t){if(typeof t!="string")return"";let e=t.indexOf(";");return(e<0?t:t.slice(0,e)).trim().toLowerCase()}function bf(t,e,n,r,o){let a=Nr>=0,i=n===null?0:dl,l=n===null?0:pl,s;return a?s={ok:!1,kind:e,root:n,error:J4(t,Nr,ul),duplicates:i,inexactNumbers:l}:s={ok:!0,kind:e,root:n,duplicates:i,inexactNumbers:l},r!==void 0&&(s.prefix=r),o&&(s.bom=!0),s}function J4(t,e,n){let r=1,o=0,a=t.indexOf(`
`);for(;a!==-1&&a<e;)r+=1,o=a+1,a=t.indexOf(`
`,o);return{pos:e,line:r,col:e-o+1,message:n}}function pA(t,e,n,r){dl=0,pl=0;let o=-1,a="",i=[],l=e;for(;;){let s=t.indexOf(r,l);(s===-1||s>n)&&(s=n);let f=Nn(t,l,s);if(f<s){let c=dl,u=pl;Nr=-1;let d=gA(t,f,s);if(d!==null){let p=Nn(t,Sf,s);p<s&&(Nr=p,ul=`${Cd(t,p)} after the JSON value`,d=null)}d!==null?i.push(d):(dl=c,pl=u,o<0&&(o=Nr,a=ul))}if(s>=n)break;l=s+1}return Nr=o,ul=a,i}function Nn(t,e,n){for(;e<n;){let r=t.charCodeAt(e);if(r>32||r!==32&&r!==10&&r!==13&&r!==9)break;e++}return e}function Pe(t,e){return Nr=t,ul=e,null}function Cd(t,e){let n=t.codePointAt(e)??0;return`Unexpected token ${n>32&&n<127?String.fromCharCode(n):`U+${n.toString(16).toUpperCase().padStart(4,"0")}`}`}function gA(t,e,n){let r=e,o=null,a=[],i=[],l=null,s=null,f="",c,u=!1,d=If;for(;;)if(d===If){if(r=Nn(t,r,n),r>=n)return Pe(r,vf);let p=t.charCodeAt(r),h;if(p===34){if(r=ob(t,r,n),r<0)return null;h=wf===void 0?{t:"str",value:ml}:{t:"str",value:ml,raw:wf}}else if(p===123)h={t:"obj",entries:[]},r++;else if(p===91)h={t:"arr",items:[]},r++;else if(p===45||p>=48&&p<=57){let y=e3(t,r,n);if(y===null)return null;h=y,r=Sf}else if(p===116){if(!eb(t,r,n,"true"))return null;h={t:"bool",value:!0},r+=4}else if(p===102){if(!eb(t,r,n,"false"))return null;h={t:"bool",value:!1},r+=5}else if(p===110){if(!eb(t,r,n,"null"))return null;h={t:"null"},r+=4}else return Pe(r,Cd(t,r));if(l===null)o=h;else if(l.t==="arr")l.items.push(h);else{let y={key:f,value:h};c!==void 0&&(y.keyRaw=c),u&&(y.dup=!0),l.entries.push(y)}if(h.t==="obj"||h.t==="arr")if(r=Nn(t,r,n),r<n&&t.charCodeAt(r)===(h.t==="obj"?125:93))r++;else{l!==null&&(a.push(l),i.push(s)),l=h,s=null,d=h.t==="obj"?hA:If;continue}d=mA}else if(d===mA){if(l===null)return Sf=r,o;if(r=Nn(t,r,n),r>=n)return Pe(r,vf);let p=t.charCodeAt(r),h=l.t==="obj"?125:93;if(p===44){let y=r;if(r=Nn(t,r+1,n),r<n&&t.charCodeAt(r)===h)return Pe(y,"Trailing comma");d=l.t==="obj"?hA:If}else if(p===h)r++,l=a.pop()??null,s=i.pop()??null;else return Pe(r,l.t==="obj"?"Expected ',' or '}' after property value":"Expected ',' or ']' after array element")}else{if(r=Nn(t,r,n),r>=n)return Pe(r,vf);if(t.charCodeAt(r)!==34)return Pe(r,"Expected property name");if(r=ob(t,r,n),r<0)return null;if(f=ml,c=wf,u=!1,s!==null)s.has(f)?u=!0:s.add(f);else{let p=l.entries;for(let h=0;h<p.length;h++)if(p[h].key===f){u=!0;break}if(p.length>=X4){s=new Set;for(let h=0;h<p.length;h++)s.add(p[h].key);s.add(f)}}if(u&&dl++,r=Nn(t,r,n),r>=n)return Pe(r,vf);if(t.charCodeAt(r)!==58)return Pe(r,"Expected ':' after property name");r++,d=If}}function eb(t,e,n,r){for(let o=1;o<r.length;o++){let a=e+o;if(a>=n)return Pe(a,vf),!1;if(t.charCodeAt(a)!==r.charCodeAt(o))return Pe(a,Cd(t,a)),!1}return!0}function ob(t,e,n){let r=!1;for(let o=e+1;o<n;o++){let a=t.charCodeAt(o);if(a===34)return ml=t.slice(e+1,o),wf=r?t.slice(e,o+1):void 0,o+1;if(a===92)return $4(t,e,o,n);if(a<32)return Pe(o,"Bad control character in string"),-1;(a&63488)===55296&&(a<56320&&o+1<n&&(t.charCodeAt(o+1)&64512)===56320?o++:r=!0)}return Pe(e,"Unterminated string"),-1}function $4(t,e,n,r){let o=t.slice(e+1,n),a=n,i=n;for(;i<r;){let l=t.charCodeAt(i);if(l===34){o+=t.slice(a,i);let s=t.slice(e,i+1);return ml=o,wf=JSON.stringify(o)===s?void 0:s,i+1}if(l===92){if(o+=t.slice(a,i),i+1>=r)return Pe(e,"Unterminated string"),-1;let s=t.charCodeAt(i+1),f,c=2;if(s===34)f='"';else if(s===92)f="\\";else if(s===47)f="/";else if(s===98)f="\b";else if(s===102)f="\f";else if(s===110)f=`
`;else if(s===114)f="\r";else if(s===116)f="	";else if(s===117){let u=Z4(t,i+2,r);if(u<0)return Pe(i,"Invalid Unicode escape"),-1;f=String.fromCharCode(u),c=6}else return Pe(i,"Invalid escape sequence"),-1;o+=f,i+=c,a=i;continue}if(l<32)return Pe(i,"Bad control character in string"),-1;i++}return Pe(e,"Unterminated string"),-1}function Z4(t,e,n){if(e+4>n)return-1;let r=0;for(let o=0;o<4;o++){let a=t.charCodeAt(e+o),i;if(a>=48&&a<=57)i=a-48;else if(a>=97&&a<=102)i=a-97+10;else if(a>=65&&a<=70)i=a-65+10;else return-1;r=r*16+i}return r}function e3(t,e,n){let r=e,o=t.charCodeAt(r),a=o===45;if(a&&(r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57))return Pe(r,"No number after minus sign");let i=!1,l=-1,s=0;if(o===48){if(r++,r<n){let d=t.charCodeAt(r);if(d>=48&&d<=57)return Pe(r-1,"Leading zeros are not allowed")}}else for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)s++,r++;if(r<n&&t.charCodeAt(r)===46){if(l=r-e,r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Pe(r,"Unterminated fractional number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)o!==48&&(i=!0),(s>0||o!==48)&&s++,r++}if(r<n&&(o=t.charCodeAt(r),o===101||o===69)){if(i=!0,r++,r<n&&(o=t.charCodeAt(r),(o===43||o===45)&&r++),o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Pe(r,"Exponent part is missing a number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)r++}let f=t.slice(e,r),c=+f,u=t3(f,c,i,l,s,a);return u||pl++,Sf=r,{t:"num",raw:f,value:c,exact:u}}function t3(t,e,n,r,o,a){return e===0?o===0&&!a:Number.isFinite(e)?n||o<=15?!0:BigInt(e)===BigInt(r<0?t:t.slice(0,r)):!1}function ab(t,e){let n=e?.decoded===!0;if(t.t!=="obj"&&t.t!=="arr")return nb(t,n);if(tb(t))return t.t==="obj"?"{}":"[]";let r=n3(e?.indent),o=r>0,a=[],i=u=>{let d=u<64?u:64;return a[d]??(a[d]=`
`+" ".repeat(d*r))},l=o?": ":":",s=t.t==="obj"?"{":"[",f=[t],c=[0];e:for(;f.length>0;){let u=f.length-1,d=f[u];if(d.t==="arr"){let p=d.items;for(let h=c[u];h<p.length;h++){h>0&&(s+=","),o&&(s+=i(u+1));let y=p[h];if(y.t==="obj"||y.t==="arr"){if(tb(y)){s+=y.t==="obj"?"{}":"[]";continue}s+=y.t==="obj"?"{":"[",c[u]=h+1,f.push(y),c.push(0);continue e}s+=nb(y,n)}}else{let p=d.entries;for(let h=c[u];h<p.length;h++){h>0&&(s+=","),o&&(s+=i(u+1));let y=p[h];s+=r3(y,n)+l;let b=y.value;if(b.t==="obj"||b.t==="arr"){if(tb(b)){s+=b.t==="obj"?"{}":"[]";continue}s+=b.t==="obj"?"{":"[",c[u]=h+1,f.push(b),c.push(0);continue e}s+=nb(b,n)}}f.pop(),c.pop(),o&&(s+=i(u)),s+=d.t==="obj"?"}":"]"}return s}function tb(t){return t.t==="obj"?t.entries.length===0:t.items.length===0}function n3(t){return typeof t!="number"||!(t>=1)?0:Math.min(10,Math.floor(t))}function nb(t,e){return t.t==="str"?(e?void 0:yA(t.raw,t.value))??JSON.stringify(t.value):t.t==="num"?Object.is(Number(t.raw),t.value)?t.raw:JSON.stringify(t.value):t.t==="bool"?t.value?"true":"false":"null"}function r3(t,e){return(e?void 0:yA(t.keyRaw,t.key))??JSON.stringify(t.key)}function yA(t,e){if(!(t===void 0||t.charCodeAt(0)!==34))return ob(t,0,t.length)===t.length&&ml===e?t:void 0}function Ad(t,e){let n=e?.bigint===!0;if(t.t!=="obj"&&t.t!=="arr")return rb(t,n);let r=t.t==="obj"?{}:[],o=[t],a=[r],i=[0];e:for(;o.length>0;){let l=o.length-1,s=o[l];if(s.t==="arr"){let f=s.items,c=a[l];for(let u=i[l];u<f.length;u++){let d=f[u];if(d.t==="obj"||d.t==="arr"){let p=d.t==="obj"?{}:[];c.push(p),i[l]=u+1,o.push(d),a.push(p),i.push(0);continue e}c.push(rb(d,n))}}else{let f=s.entries,c=a[l];for(let u=i[l];u<f.length;u++){let d=f[u],p=d.value;if(p.t==="obj"||p.t==="arr"){let h=p.t==="obj"?{}:[];xA(c,d.key,h),i[l]=u+1,o.push(p),a.push(h),i.push(0);continue e}xA(c,d.key,rb(p,n))}}o.pop(),a.pop(),i.pop()}return r}function xA(t,e,n){Object.defineProperty(t,e,{value:n,writable:!0,enumerable:!0,configurable:!0})}function rb(t,e){if(t.t==="num"){let{raw:n,value:r}=t;if(!(Math.abs(r)<=Number.MAX_SAFE_INTEGER)&&K4.test(n)){if(!e)return new qr(n);let o=n.indexOf(".");return BigInt(o<0?n:n.slice(0,o))}return r}return t.t==="str"||t.t==="bool"?t.value:null}var vf,V4,G4,dA,Q4,X4,W4,K4,Sf,Nr,ul,dl,pl,ml,wf,If,mA,hA,qr,Ro=F(()=>{"use strict";vf="Unexpected end of input",V4=[")]}',",")]}'","while(1);","for(;;);","for (;;);"],G4=new Set(["application/x-ndjson","application/jsonl"]),dA="application/json-seq",Q4="",X4=8,W4=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/,K4=/^-?\d+(?:\.0+)?$/,Sf=0,Nr=0,ul="",dl=0,pl=0,ml="";If=0,mA=1,hA=2;qr=class{constructor(e){ar(this,"raw");if(typeof e!="string"||!W4.test(e))throw new TypeError(`Not a JSON number: ${String(e).slice(0,40)}`);this.raw=e}valueOf(){return Number(this.raw)}toString(){return this.raw}toJSON(){let e=JSON.rawJSON;return typeof e=="function"?e.call(JSON,this.raw):this.raw}}});var Td=F(()=>{"use strict"});function Md(t){return typeof t=="object"&&t!==null}function Eo(t,e=""){if(t===null)return{text:"NULL",truncated:!1,kind:"null"};if(typeof t=="number")return{text:String(t),truncated:!1,kind:"number"};if(typeof t=="boolean")return{text:String(t),truncated:!1,kind:"boolean"};if(Md(t))return{text:`\\x${t.hex}\u2026 (${t.length} bytes)`,truncated:!1,kind:"blob"};let n=t.length>bA,r=n?t.slice(0,bA):t;if(i3.test(e)&&l3.test(t))return{text:r,truncated:n,kind:"number"};let o=t.trimStart()[0],a=(o==="{"||o==="[")&&Oo(t).ok;return{text:r,truncated:n,kind:a?"json":"text"}}function IA(t){if(t===null)return"";let e=Md(t)?t.hex:String(t);return/[,"\r\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function vA(t,e){let n=[t.map(r=>IA(r.name)).join(",")];for(let r of e)n.push(r.map(IA).join(","));return n.join(`\r
`)}function s3(t){let e=new Set(t.map(r=>r.name)),n=new Set;return t.map(({name:r})=>{if(!n.has(r))return n.add(r),r;let o=2;for(;e.has(`${r}_${o}`);)o++;let a=`${r}_${o}`;return e.add(a),a})}function wA(t,e){let n=s3(t),r=e.map(o=>{let a={};return n.forEach((i,l)=>{Object.defineProperty(a,i,{value:o[l]??null,enumerable:!0,writable:!0,configurable:!0})}),a});return JSON.stringify(r,null,2)}function Bo(t,e){let n=e==="mysql"?"`":'"';return n+t.split(n).join(n+n)+n}function f3(t){return t===null?"NULL":typeof t=="number"?String(t):typeof t=="boolean"?t?"TRUE":"FALSE":Md(t)?`X'${t.hex}'`:`'${t.replace(/'/g,"''")}'`}function c3(t,e,n,r){let o=`INSERT INTO ${Bo(t,r)} (${e.map(a=>Bo(a.name,r)).join(", ")}) VALUES (`;return n.map(a=>`${o}${a.map(f3).join(", ")});`).join(`
`)}function Dd(t){return Md(t)&&t.hex.length<t.length*2}function SA(t){let e=0;for(let n of t)for(let r of n)Dd(r)&&e++;return e}function ib(t){return`${t} blob values were truncated to ${a3} bytes`}function kA(t,e,n,r){let o=[],a=0;for(let i of n){let l=i.filter(Dd).map(s=>`${s.length} bytes`);l.length&&o.push(`-- blob truncated: ${l.join(", ")}`),a+=l.length,o.push(c3(t,e,[i],r))}return{text:o.join(`
`),truncatedBlobs:a}}function hl(t){return Number.isNaN(t)?1e3:Math.min(5e4,Math.max(1,Math.trunc(t)))}var bA,a3,i3,l3,Pr=F(()=>{"use strict";Ro();Td();bA=65536,a3=256;i3=/INT|NUMERIC|DECIMAL|REAL|FLOAT|DOUBLE/i,l3=/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/});var CA,AA=F(()=>{"use strict";kd();yf();xf();Pr();CA={readOnlyEnforced:!0,cancel:!0,transactions:!0,cursor:!1,multiStatement:!0}});function OA(){let t=typeof chrome<"u"?chrome.runtime?.getURL?.(u3):void 0;if(!t)throw{code:"connection-lost",message:"The SQL worker is only available on the extension page."};return new Worker(t)}function RA(t){let e=null,n=1,r=new Map,o=null,a=!0,i=!1,l=null,s=Promise.resolve();function f(){let x=t();return x.onmessage=I=>{if(x!==e)return;let v=I.data,w=r.get(v.id);w&&(r.delete(v.id),v.ok?w.resolve(v.value):w.reject(ot(v.error)))},x.onerror=()=>{x===e&&(l=MA,c(MA))},e=x,x}function c(x=TA){let I=e;e=null,I?.terminate();for(let v of r.values())v.reject(x);r.clear()}function u(x,I){let v=e;if(!v)return Promise.reject(l??TA);let w=n++;return new Promise((S,k)=>{r.set(w,{resolve:S,reject:k});try{v.postMessage({id:w,...x},I)}catch(M){r.delete(w),k(ot(M))}})}function d(x,I){return Promise.resolve().then(()=>(c(),f(),u({op:"open",bytes:x,readOnly:I})))}async function p(x,I){let v=d(x,I);s=v.catch(()=>{});try{await v}catch(w){throw c(),o=null,l=null,w}o=x.slice(),a=I,i=!1,l=null}async function h(){if(await s,l)throw l}async function y(x,I,v){if(v?.aborted||(await h(),v?.aborted))throw lb;let w=u({op:"execute",sql:x,opts:I}),S=!1,k=()=>{S=!0;let M=o,C=a;c(),M&&(s=d(M,C).then(()=>{i=!1},()=>{c(DA),l=DA}))};v?.addEventListener("abort",k,{once:!0});try{let M=await w;return!a&&cl(x,"sqlite").kind!=="read"&&(i=!0),M}catch(M){throw S?lb:(!a&&M.code!=="cancelled"&&cl(x,"sqlite").kind!=="read"&&(i=!0),M)}finally{v?.removeEventListener("abort",k)}}async function b(){return await h(),u({op:"introspect"})}async function m(){await h();let x=await u({op:"export"});return o=x,i=!1,x.slice()}async function g(){c(),o=null,i=!1,l=null,s=Promise.resolve()}return{dialect:"sqlite",capabilities:CA,open:p,introspect:b,execute:y,exportBytes:m,close:g,get dirty(){return i}}}var lb,TA,MA,DA,u3,BA=F(()=>{"use strict";kd();yf();AA();lb={code:"cancelled",message:"Query cancelled."},TA={code:"connection-lost",message:"No database is open."},MA={code:"connection-lost",message:"The SQL worker stopped. Open the file again."},DA={code:"connection-lost",message:"The database could not be reopened. Open the file again."},u3="dist/sql-worker.js?opfs-disable&opfs-wl-disable"});function FA(t){let e=t??{};return{id:e.id,name:e.name,engine:e.engine,host:e.host,port:e.port,database:e.database,user:e.user,tls:e.tls,caFile:typeof e.caFile=="string"?e.caFile:"",statementTimeoutMs:typeof e.statementTimeoutMs=="number"?e.statementTimeoutMs:null,readOnly:e.readOnly!==!1,hasSavedPassword:e.hasSavedPassword===!0}}function NA(t){let e=null,n=1,r=new Map;function o(c){e===c&&(e=null);for(let[u,d]of[...r])d.port===c&&(r.delete(u),d.reject({...sb}))}function a(){if(e)return e;let c;try{c=t()}catch{throw{...sb}}return c.onMessage.addListener(u=>{if(e!==c)return;let d=u;if(typeof d?.id!="number")return;let p=r.get(d.id);p&&(r.delete(d.id),d.ok===!0?p.resolve(d.value):p.reject(ot(d.error)))}),c.onDisconnect.addListener(()=>o(c)),e=c,c}function i(c,u={},d){return new Promise((p,h)=>{let y;try{y=a()}catch(m){h(m);return}let b=n++;r.set(b,{resolve:p,reject:h,port:y}),d?.(b);try{y.postMessage({id:b,op:c,...u})}catch{o(y);try{y.disconnect()}catch{}}})}function l(c,u){i(c,u).catch(()=>{})}function s(c,u,d,p){let h=u;async function y(b,m,g){if(g?.aborted)throw{...d3};let x=0,I=()=>{x!==0&&l("cancel",{queryId:x})},v=i(b,{sessionId:c,...m},w=>{x=w});g?.addEventListener("abort",I,{once:!0});try{return await v}finally{g?.removeEventListener("abort",I)}}return{dialect:h,capabilities:p,serverVersion:d,introspect:()=>i("introspect",{sessionId:c}),execute:async(b,m,g)=>{if(!m.tabId)throw{...EA};return y("execute",{tabId:m.tabId,sql:b,maxRows:m.maxRows},g)},fetchMore:async(b,m)=>{if(!b)throw{...EA};return y("fetchMore",{tabId:b,n:m})},close:async()=>{try{await i("close",{sessionId:c})}catch(b){if(b.code!=="connection-lost")throw b}}}}let f=async()=>{let c=await i("profiles.list");return Array.isArray(c)?c.map(FA):[]};return{profiles:{list:f,save:async c=>FA(await i("profiles.save",{profile:c})),delete:async c=>{await i("profiles.delete",{profileId:c})}},helperStatus:()=>i("helper.status"),async connect(c,u,d,p){let h=(await f()).find(m=>m.id===c);if(!h)throw{code:"server",message:"Unknown profile."};let y={profileId:c,readOnly:u};d!==void 0&&(y.password=d),p!==void 0&&(y.remember=p);let b=await i("connect",y);if(typeof b?.sessionId!="string"||!b.capabilities)throw{...sb};return s(b.sessionId,h.engine,b.serverVersion??"",b.capabilities)}}}var LA,sb,d3,EA,qA=F(()=>{"use strict";yf();LA="xray-sql",sb={code:"connection-lost",message:"The connection to the database helper was lost."},d3={code:"cancelled",message:"Query cancelled."},EA={code:"server",message:"Missing editor tab id."}});function Od(t,e){let n=typeof e=="object"&&e!==null&&"code"in e&&e.code==="storage-unavailable"?"storage-unavailable":t,r=n==="storage-write-failed"&&typeof e=="object"&&e!==null&&"reason"in e&&e.reason==="quota";return Object.assign(new Error(n),{code:n},r?{reason:"quota"}:{})}async function xl(t,e){if(typeof window.XRAY_Store?.get!="function")throw Od("storage-unavailable");try{return await window.XRAY_Store.get(t,e,!0)??e}catch(n){throw Od("storage-read-failed",n)}}async function PA(t,e){if(typeof window.XRAY_Store?.set!="function")throw Od("storage-unavailable");try{await window.XRAY_Store.set(t,e,!0)}catch(n){throw Od("storage-write-failed",n)}}var fb=F(()=>{"use strict"});function _A(t,e){return t.name===e.name&&t.size===e.size}function cb(t,e,n=5){return[e,...t.filter(r=>!_A(r,e))].sort((r,o)=>o.lastOpened-r.lastOpened).slice(0,n)}function zA(t,e){return t.filter(n=>!_A(n,e))}function HA(t,e=5){if(!Array.isArray(t))return[];let n=t.filter(o=>!!o&&typeof o=="object"&&typeof o.name=="string"&&typeof o.size=="number"&&Number.isFinite(o.lastOpened)&&!!o.handle&&typeof o.handle=="object"),r=[];for(let o of n.slice().sort((a,i)=>a.lastOpened-i.lastOpened))r=cb(r,o,e);return r}function UA(t,e){let n=r=>new Date(r).toDateString();if(n(t)===n(e)){let r=new Date(t);return`Today ${String(r.getHours()).padStart(2,"0")}:${String(r.getMinutes()).padStart(2,"0")}`}return n(t)===n(e-864e5)?"Yesterday":new Date(t).toLocaleDateString()}var ub=F(()=>{"use strict"});function pb(){if(typeof indexedDB>"u"||typeof window.showOpenFilePicker!="function")return!1;if(window.parent===window)return!0;try{return window.parent.location.origin===window.location.origin}catch{return!1}}function m3(){return new Promise((t,e)=>{let n=indexedDB.open(p3,1);n.onupgradeneeded=()=>n.result.createObjectStore(db),n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error)})}async function VA(t,e){let n=await m3();try{return await new Promise((r,o)=>{let a=n.transaction(db,t),i=e(a.objectStore(db));a.oncomplete=()=>r(i.result),a.onerror=()=>o(a.error),a.onabort=()=>o(a.error)})}finally{n.close()}}async function Rd(){return pb()?HA(await VA("readonly",t=>t.get(jA))):[]}async function GA(t){await VA("readwrite",e=>e.put(t,jA))}async function QA(t,e){try{let n=await Rd(),r=await Promise.all(n.map(a=>a.handle.isSameEntry(t).catch(()=>!1))),o=n.filter((a,i)=>!r[i]);await GA(cb(o,{name:e.name,size:e.size,lastOpened:Date.now(),handle:t}))}catch{}}async function XA(t){let e=zA(await Rd(),t);return await GA(e),e}async function WA(t){let e=t.handle;try{let n=await e.queryPermission?.({mode:"read"})??"granted";return n!=="granted"&&(n=await e.requestPermission?.({mode:"read"})??"denied"),n!=="granted"?{error:"Permission to read this file was denied."}:{file:await e.getFile()}}catch(n){let r=n?.name;return r==="NotFoundError"?{error:"This file is no longer there."}:r==="NotAllowedError"||r==="SecurityError"?{error:"Permission to read this file was denied."}:{error:"This file could not be read."}}}var p3,db,jA,mb=F(()=>{"use strict";ub();p3="xray-sql",db="recent-files",jA="list"});function KA(t,e,n){return`SELECT * FROM ${n==="sqlite"&&t==="main"?Bo(e,n):`${Bo(t,n)}.${Bo(e,n)}`} LIMIT 100;`}function YA(t,e="sqlite"){let n={},r=e==="mysql"?null:h3[e];for(let o of t.schemas){let a=e==="mysql"||o.name===r;for(let i of[...o.tables,...o.views])n[a?i.name:`${o.name}.${i.name}`]=i.columns.map(l=>l.name)}return n}var h3,hb=F(()=>{"use strict";Pr();h3={sqlite:"main",postgres:"public",mysql:null}});function JA(t,e,n,r){return typeof t!="number"||!Number.isFinite(t)?r:Math.min(n,Math.max(e,t))}function xb(t){return JA(t,yb,bb,gl.editorPct)}function x3(t){return Math.round(JA(t,Ib,vb,gl.railPx))}function Bd(t){if(!t||typeof t!="object"||Array.isArray(t))return{...gl};let e=t;return{editorPct:xb(e.editorPct),railPx:x3(e.railPx)}}function $A(t,e,n){return n>0?xb(t+e/n*100):xb(t)}var gb,gl,yb,bb,Ib,vb,wb,Ed=F(()=>{"use strict";gb="sql_layout",gl={editorPct:30,railPx:220},yb=15,bb=75,Ib=160,vb=420,wb=24});function Sb(t){if(t<1024)return`${t} B`;let e=t/1024;if(e<1024)return`${e<10?e.toFixed(1):Math.round(e)} KB`;let n=e/1024;return`${n<10?n.toFixed(1):Math.round(n)} MB`}function Fd(t){return/mac|iphone|ipad/i.test(t)}function kb(t){return{mod:t?"Cmd":"Ctrl",run:t?"\u2318 \u21B5":"Ctrl \u21B5",runAll:t?"\u2318 \u21E7 \u21B5":"Ctrl \u21E7 \u21B5",save:t?"\u2318 S":"Ctrl+S",open:t?"\u2318 O":"Ctrl+O"}}function ZA(t){let e=kb(t).mod;return`Write SQL here \u2014 ${e}+Enter runs the statement at the cursor, ${e}+Shift+Enter runs all.`}function eT(t){return t.length?{file:t[0],ignored:t.slice(1).map(e=>e.name)}:{file:null,ignored:[]}}function tT(t,e){if(!e.length)return null;let n=e.length===1?"file":"files";return`Only one file opens at a time: opening ${t}, ignored ${e.length} other ${n}: ${e.join(", ")}.`}function nT(t,e){let n=e.trim().toLowerCase();return!n||t.toLowerCase().includes(n)}var kf=F(()=>{"use strict"});function oT(t,e,n){let r=t[e]??[],o=r[0]&&r[0].sql===n.sql?r.slice(1):r;return{...t,[e]:[n,...o].slice(0,g3)}}function Cf(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():(rT+=1,`tab-${Date.now().toString(36)}-${rT}`)}function Af(t,e){let n=Array.isArray(t)?t:t&&typeof t=="object"?t[e]:void 0,r=[];if(Array.isArray(n))for(let o of n){if(!o||typeof o!="object"||typeof o.sql!="string")continue;let a=o;r.push({id:typeof a.id=="string"&&a.id?a.id:Cf(),title:typeof a.title=="string"&&a.title?a.title:`Query ${r.length+1}`,sql:a.sql,maxRows:typeof a.maxRows=="number"?hl(a.maxRows):1e3})}return r.length?r:[{id:Cf(),title:"Query 1",sql:"",maxRows:1e3}]}function aT(t,e){return`sqlite:${t}:${e}`}function iT(t){return`remote:${t}`}var Cb,Ab,g3,rT,lT=F(()=>{"use strict";Pr();Td();Cb="sql_history",Ab="sql_editor_tabs",g3=200;rT=0});function zr(t){return t?.kind==="remote"?t.engine:"sqlite"}function No(){return Tb??(Tb=RA(OA)),Tb}function Ob(){return Mb??(Mb=NA(()=>{let t=typeof chrome>"u"?void 0:chrome.runtime;if(!t?.connect)throw new Error("The database helper is only available on the extension page.");return t.connect({name:LA})})),Mb}function zd(){return N.getState().connection?.kind==="remote"}function fT(){if(!zd())return No();if(!Ea)throw{...b3};return Ea}function Pd(){let t=Ea;Ea=null,t?.close().catch(()=>{})}function yl(){return zd()?!1:No().dirty||_r}function Fb(t){mT=t}function cT(t){if(!t||typeof t!="object"||Array.isArray(t))return{};let e={};for(let[n,r]of Object.entries(t))Array.isArray(r)&&(e[n]=r);return e}function Hd(){return Db??(Db=Promise.all([xl(Cb,{}).catch(()=>({})),xl(Ab,{}).catch(()=>({})),xl(gb,null).catch(()=>null)]).then(([t,e,n])=>{Ba=cT(t),Lo=cT(e),Mf=Bd(n),N.setState({layout:Mf})})),Db}function w3(t,e){let n=Df.get(t);n&&clearTimeout(n),_d.set(t,e),Df.set(t,setTimeout(()=>{Df.delete(t),_d.delete(t),e()},v3))}function Ud(){for(let[t,e]of Df)clearTimeout(e),_d.get(t)?.();Df.clear(),_d.clear()}function Rb(t,e){w3(t,()=>{PA(t,e()).catch(()=>{})})}function bl(t){return t.code==="not-a-database"?{...t,message:pT,detail:t.message}:t}function qn(t,...e){let n=[...t,...e];return n.length>sT?n.slice(n.length-sT):n}function Eb(t){return`${Math.round(t)} ms`}function Lb(t){return t.columns.length===0?`${t.affected??0} rows affected \xB7 ${Eb(t.durationMs)}`:`${t.rowCount} rows \xB7 ${Eb(t.durationMs)}`}function S3(t){if(t.length===0)return!0;if(t.length<Bb.length)return!1;for(let e=0;e<Bb.length;e++)if(t[e]!==Bb.charCodeAt(e))return!1;return!0}function uT(t){return{id:Cf(),title:`Query ${t}`,sql:"",maxRows:1e3}}function k3(t,e){let n=URL.createObjectURL(new Blob([t],{type:"application/vnd.sqlite3"})),r=document.createElement("a");r.href=n,r.download=e,r.rel="noopener",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),6e4)}var pT,y3,b3,I3,sT,v3,Tb,Mb,Ea,Tf,Ld,Fo,Ra,_r,mT,Nd,qd,Ba,Lo,Mf,Db,Df,_d,Bb,dT,N,Fa=F(()=>{"use strict";HS();BA();qA();fb();mb();kd();yf();hb();xf();Pr();Ed();kf();lT();Td();pT="This file is not a SQLite database.",y3={code:"cancelled",message:"Query cancelled."},b3={code:"connection-lost",message:"The connection to the database was lost."},I3=1e3,sT=500,v3=300,Tb=null,Mb=null,Ea=null,Tf=null,Ld=null,Fo=null,Ra=null,_r=!1,mT=null,Nd=null,qd=null,Ba={},Lo={},Mf=Bd(void 0),Db=null,Df=new Map,_d=new Map;Bb="SQLite format 3\0";dT=Af(void 0,""),N=_S((t,e)=>{function n(){let m=e().connection;m&&(Lo={...Lo,[m.key]:e().tabs},Rb(Ab,()=>Lo))}function r(m){let g=e().connection;g&&(Ba=oT(Ba,g.key,m),t({history:Ba[g.key]??[]}),Rb(Cb,()=>Ba))}function o(...m){t({messages:qn(e().messages,...m)})}function a(m,g){qd=g,t({pendingPrompt:m})}async function i(){try{let m=await fT().introspect();t({schema:m,dirty:yl()})}catch(m){let g=bl(ot(m));t({dirty:yl(),...zd()&&g.code==="connection-lost"?{connectionLost:!0,canFetchMore:!1}:{}}),o(g.message)}}async function l(m,g){await Hd(),Ud();let x=!!e().connection,I=x?!0:e().readOnlyChoice;t({opening:!0,error:null,errorAt:null});let v;try{v=new Uint8Array(await m.arrayBuffer())}catch(C){let _=C instanceof Error?C.message:String(C);t({opening:!1,bottomTab:"messages",messages:qn(e().messages,`${m.name}: ${_}`)});return}if(!S3(v)){let C={code:"not-a-database",message:pT};t({opening:!1,error:C,bottomTab:"messages",messages:qn(e().messages,`${m.name}: ${C.message}`)});return}try{await No().open(v,I)}catch(C){let _=bl(ot(C));Fo=null,Ra=null,_r=!1;let L=x?Af(void 0,""):null;Pd(),t({connectionLost:!1,canFetchMore:!1,...L?{tabs:L,activeTabId:L[0].id,errorAt:null}:{},opening:!1,connection:null,schema:null,result:null,resultTable:null,dirty:!1,history:[],readOnlyChoice:!0,error:_,bottomTab:"messages",messages:qn(e().messages,`${m.name}: ${_.message}`)});return}Fo=v,Ra=g??null,_r=!1,Pd(),g&&QA(g,m);let w=aT(m.name,m.size),S=Lo[w]||x?Af(Lo,w):e().tabs,k=null,M=null;try{k=await No().introspect()}catch(C){M=bl(ot(C)).message}t({opening:!1,connection:{kind:"sqlite",name:m.name,size:m.size,readOnly:I,key:w},connectionLost:!1,canFetchMore:!1,readOnlyChoice:I,schema:k,tabs:S,activeTabId:S[0].id,result:null,resultTable:null,error:null,errorAt:null,dirty:!1,history:Ba[w]??[],bottomTab:"results",messages:qn(e().messages,`Opened ${m.name}${I?" (read-only)":""}.`,...M?[M]:[])}),n()}async function s(m){let g=e().connection;if(!(!g||!Fo)){try{await No().open(Fo,m)}catch(x){let I=bl(ot(x));Fo=null,Ra=null,_r=!1,t({connection:null,schema:null,dirty:!1,error:I,bottomTab:"messages"}),o(I.message);return}_r=!1,t({connection:{...g,readOnly:m},readOnlyChoice:m,dirty:!1}),o(m?`${g.name} is read-only.`:`${g.name} is open for writing. Save writes changes back.`),await i()}}async function f(m,g,x){let I=new AbortController;t({running:{tabId:m.tabId,controller:I},error:null,errorAt:null});let v=Date.now(),w=zd();try{let S=fT(),k=await S.execute(g.text,{maxRows:m.maxRows,tabId:m.tabId},I.signal);r({sql:g.text,at:v,durationMs:Math.round(k.durationMs),rowCount:k.columns.length?k.rowCount:k.affected,ok:!0});let M=[...k.notices];return k.truncatedCells>0&&M.push(`${k.truncatedCells} long text values were cut for display.`),Tf=m.tabId,t({running:null,result:k,resultTable:m.resultTable,canFetchMore:k.hasMore&&S.capabilities.cursor,gridView:{...e().gridView,inspected:null},dirty:yl(),bottomTab:"results",messages:qn(e().messages,Lb(k),...M)}),x!=="read"&&await i(),!0}catch(S){let k=bl(ot(S)),M=w&&k.code==="connection-lost";return w&&I.signal.aborted&&(k.code==="cancelled"||M)&&(k={...y3}),r({sql:g.text,at:v,durationMs:Date.now()-v,rowCount:null,ok:!1,error:k.message}),t({running:null,error:k,...M||m.tabId===Tf?{canFetchMore:!1}:{},...M?{connectionLost:!0}:{},errorAt:k.position===void 0?null:{tabId:m.tabId,position:k.position+g.from},dirty:yl(),bottomTab:"messages",messages:qn(e().messages,k.message)}),k.code==="cancelled"&&!w&&await i(),!1}}async function c(m,g){for(Nd=null;m.index<m.items.length;){let x=e().connection;if(!x)return;if(x.kind==="remote"&&e().connectionLost){o("The connection was lost. Reconnect to run queries.");return}let I=m.items[m.index],v=cl(I.text,zr(x));if(x.readOnly&&v.kind!=="read"&&v.reason!=="could not parse"){let w={code:"read-only",message:`This connection is read-only. Turn off Read-only to run ${v.reason}.`};t({error:w,errorAt:null,bottomTab:"messages",messages:qn(e().messages,w.message)});return}if(!x.readOnly&&v.kind==="dangerous"&&m.index!==g){Nd=m,t({pendingConfirm:{sql:I.text,reason:v.reason}});return}if(!await f(m,I,v.kind))return;m.index+=1}}function u(){let m=e();return!m.running&&!m.opening&&!m.pendingConfirm&&!m.pendingPrompt}function d(){return!!e().connection&&u()}async function p(m,g,x){if(!u())return;let I=e(),v=async()=>{x&&o(x),await l(m,g)};if(I.dirty&&I.connection){a({title:"Discard unsaved changes?",message:`Opening ${m.name} discards the unsaved changes in ${I.connection.name}.`,confirmLabel:"Discard changes"},v);return}await v()}async function h(m,g,x,I,v){try{let w=await Ob().connect(m,x,I,v);return t({helper:{...e().helper,state:"ready"}}),w}catch(w){let S=ot(w);return S.detail==="password-required"?(Ld=x,t({pendingPassword:{profileId:m,name:g}}),null):(S.code==="helper-missing"&&t({helper:{state:"missing"}}),S.code==="helper-outdated"&&t({helper:{...e().helper,state:"outdated"}}),t({error:S,errorAt:null,bottomTab:"messages"}),o(S.message),null)}}async function y(m,g){let x=await h(m.profileId,m.name,g);x&&(Pd(),Ea=x,t({connection:{...m,readOnly:g,serverVersion:x.serverVersion},readOnlyChoice:g,connectionLost:!1,canFetchMore:!1,error:null}),o(g?`${m.name} is read-only.`:`${m.name} is open for writing. Statements commit as they run.`),await i())}async function b(m,g,x){await Hd();let I=x?Ld:null;Ld=null,t({opening:!0,error:null,errorAt:null});try{let v;try{v=await Ob().profiles.list()}catch(H){let U=ot(H);t({error:U,bottomTab:"messages"}),o(U.message);return}t({profiles:v});let w=v.find(H=>H.id===m);if(!w){o("That connection no longer exists.");return}let S=I??w.readOnly,k=await h(w.id,w.name,S,g?.password,g?.remember);if(!k)return;Ud();let M=e().connection;Pd(),Ea=k,M?.kind==="sqlite"&&(Fo=null,Ra=null,_r=!1,No().close().catch(()=>{}));let C=iT(w.id),_=M?.key===C,L=_?e().tabs:Lo[C]||M?Af(Lo,C):e().tabs,A=null,T=null;try{A=await k.introspect()}catch(H){T=ot(H)}Tf=null,t({connection:{kind:"remote",profileId:w.id,name:w.name,engine:w.engine,host:w.host,database:w.database,readOnly:S,key:C,serverVersion:k.serverVersion},readOnlyChoice:S,schema:A,tabs:L,activeTabId:_?e().activeTabId:L[0].id,result:null,resultTable:null,error:null,errorAt:null,dirty:!1,connectionLost:T?.code==="connection-lost",canFetchMore:!1,history:Ba[C]??[],bottomTab:"results",messages:qn(e().messages,`Connected to ${w.name}${S?" (read-only)":""}.`,...T?[T.message]:[])}),n()}finally{t({opening:!1})}}return{connection:null,schema:null,tabs:dT,activeTabId:dT[0].id,running:null,result:null,error:null,messages:[],history:[],pendingConfirm:null,dirty:!1,opening:!1,readOnlyChoice:!0,errorAt:null,resultTable:null,bottomTab:"results",pendingPrompt:null,layout:Mf,cursor:{line:1,col:1},gridView:{key:"",sort:null,inspected:null},rowFilter:"",profiles:[],helper:{state:"unknown"},pendingPassword:null,connectionLost:!1,canFetchMore:!1,async openFile(m,g){await p(m,g,null)},async openDropped(m){let{file:g,ignored:x}=eT(m);g&&await p(g,void 0,tT(g.name,x))},async run(m){if(!d())return;let g=e(),x=g.tabs.find(S=>S.id===g.activeTabId);if(!x)return;let I=x.sql,v=zr(g.connection),w=[];if(m==="all")w=hf(I,v).map(S=>({text:S.text,from:S.from}));else{let S=mT?.()??{from:I.length,to:I.length,head:I.length},k=Math.max(0,Math.min(S.from,I.length)),M=Math.max(k,Math.min(S.to,I.length));if(M>k&&I.slice(k,M).trim())w=[{text:I.slice(k,M),from:k}];else{let C=Sd(I,Math.min(S.head,I.length),v);C&&(w=[{text:C.text,from:C.from}])}}if(!w.length){o("Nothing to run.");return}await c({tabId:x.id,items:w,index:0,maxRows:x.maxRows,resultTable:null},-1)},stop(){let m=e().running;if(m){if(e().connection?.kind==="sqlite"&&No().dirty){a({title:"Stop the query?",message:"Stopping restarts the database and loses unsaved changes.",confirmLabel:"Stop anyway"},()=>e().running?.controller.abort());return}m.controller.abort()}},async confirmPending(){let m=Nd;t({pendingConfirm:null}),m&&await c(m,m.index)},cancelPending(){Nd=null,t({pendingConfirm:null}),o("Statement not run.")},async confirmPrompt(){let m=qd;qd=null,t({pendingPrompt:null}),await m?.()},cancelPrompt(){qd=null,t({pendingPrompt:null})},async previewTable(m,g){if(!d())return;let x=KA(m,g,zr(e().connection)),I=e().tabs.find(w=>w.title===g&&w.sql===x),v=I??{id:Cf(),title:g,sql:x,maxRows:1e3};t({tabs:I?e().tabs:[...e().tabs,v],activeTabId:v.id}),n(),await c({tabId:v.id,items:[{text:x,from:0}],index:0,maxRows:v.maxRows,resultTable:g},-1)},async setReadOnly(m){let g=e();if(!g.connection){t({readOnlyChoice:m});return}if(!(m===g.connection.readOnly||g.running||g.opening)){if(g.connection.kind==="remote"){let x=g.connection;t({readOnlyChoice:m,opening:!0});try{await y(x,m)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}return}if(m&&(g.dirty||yl())){a({title:"Discard unsaved changes?",message:`Turning Read-only back on reopens ${g.connection.name} as last opened or saved. Unsaved changes are lost.`,confirmLabel:"Discard changes"},async()=>{t({readOnlyChoice:!0,opening:!0});try{await s(!0)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}});return}t({readOnlyChoice:m,opening:!0});try{await s(m)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}}},async save(){let m=e(),g=m.connection;if(!g||g.kind!=="sqlite"||!m.dirty||m.running)return;let x;try{x=await No().exportBytes()}catch(I){let v=bl(ot(I));t({error:v,bottomTab:"messages"}),o(`Could not save ${g.name}: ${v.message}`);return}try{if(Ra&&typeof Ra.createWritable=="function"){let I=await Ra.createWritable();await I.write(x),await I.close(),o(`Saved ${g.name}.`),Fo=x,_r=!1,t({dirty:yl()})}else k3(x,g.name),o("Download started \u2014 the file is saved when the download completes."),Fo=x,_r=!0,t({dirty:!0})}catch(I){let v=I instanceof Error?I.message:String(I);_r=!0,t({dirty:!0,bottomTab:"messages"}),o(`Could not save ${g.name}: ${v}`)}},setMaxRows(m){let g=e().activeTabId,x=hl(m);t({tabs:e().tabs.map(I=>I.id===g?{...I,maxRows:x}:I)}),n()},addTab(){let m=uT(e().tabs.length+1);t({tabs:[...e().tabs,m],activeTabId:m.id}),n()},closeTab(m){let g=e();if(g.running?.tabId===m)return;let x=g.tabs.findIndex(w=>w.id===m);if(x<0)return;let I=g.tabs.filter(w=>w.id!==m);I.length||(I=[uT(1)]);let v=g.activeTabId===m?I[Math.min(x,I.length-1)].id:g.activeTabId;t({tabs:I,activeTabId:v,errorAt:g.errorAt?.tabId===m?null:g.errorAt,...m===Tf?{canFetchMore:!1}:{}}),n()},setActiveTab(m){e().tabs.some(g=>g.id===m)&&t({activeTabId:m})},updateTabSql(m,g){let x=e(),I=x.tabs.find(v=>v.id===m);!I||I.sql===g||(t({tabs:x.tabs.map(v=>v.id===m?{...v,sql:g}:v),errorAt:x.errorAt?.tabId===m?null:x.errorAt}),n())},setBottomTab(m){t({bottomTab:m})},setLayout(m){let g=Bd({...e().layout,...m}),x=e().layout;g.editorPct===x.editorPct&&g.railPx===x.railPx||(Mf=g,t({layout:g}),Rb(gb,()=>Mf))},setGridView(m){t({gridView:m})},setRowFilter(m){t({rowFilter:m})},setCursor(m,g){let x=e().cursor;(x.line!==m||x.col!==g)&&t({cursor:{line:m,col:g}})},async connectProfile(m,g){let x=e(),I=x.pendingPassword?.profileId===m;if(x.pendingPassword&&t({pendingPassword:null}),I||(Ld=null),!u())return;let v=()=>b(m,g,I);if(!I&&x.connection?.kind==="sqlite"&&x.dirty){a({title:"Discard unsaved changes?",message:`Connecting discards the unsaved changes in ${x.connection.name}.`,confirmLabel:"Discard changes"},v);return}await v()},async reconnect(){let m=e().connection;if(!(m?.kind!=="remote"||!u())){t({opening:!0});try{await y(m,m.readOnly)}finally{t({opening:!1})}}},async fetchMore(){let m=e(),g=Ea,x=m.result;if(m.connection?.kind!=="remote"||!g||!x||!m.canFetchMore||m.connectionLost||!u())return;if(m.activeTabId!==Tf){o("Fetch more works from the tab that ran this query.");return}let I=m.activeTabId;t({running:{tabId:I,controller:new AbortController},error:null,errorAt:null});try{let v=await g.fetchMore(I,I3),w={...x,rows:[...x.rows,...v.rows],rowCount:x.rowCount+v.rowCount,hasMore:v.hasMore,truncatedCells:x.truncatedCells+v.truncatedCells},S=[...v.notices];v.truncatedCells>0&&S.push(`${v.truncatedCells} long text values were cut for display.`),t({running:null,result:w,canFetchMore:w.hasMore&&g.capabilities.cursor,bottomTab:"results",messages:qn(e().messages,`Fetched ${v.rowCount} more rows \xB7 ${Eb(v.durationMs)}`,...S)})}catch(v){let w=ot(v),S=w.code==="connection-lost";t({running:null,error:w,canFetchMore:!1,...S?{connectionLost:!0}:{},bottomTab:"messages",messages:qn(e().messages,w.message)})}},async refreshRemote(){let m=Ob(),[g,x]=await Promise.allSettled([m.profiles.list(),m.helperStatus()]);g.status==="fulfilled"&&t({profiles:g.value}),x.status==="fulfilled"?t({helper:x.value}):ot(x.reason).code==="helper-missing"&&t({helper:{state:"missing"}})}}})});function jd(t){return typeof t=="string"&&IT.test(t)}function A3(t){return Ht(t,"")!==""}function Ht(t,e){if(typeof t=="string"){let n=t.trim();if(/^[0-9a-fA-F]{6}$/.test(n)&&(n="#"+n),/^#[0-9a-fA-F]{3}$/.test(n)&&(n="#"+n.slice(1).split("").map(r=>r+r).join("")),IT.test(n))return n.toLowerCase()}return e}function vT(t){let e=t||{},n={bg:Ht(e.bg,Sn.bg),surface:Ht(e.surface,Sn.surface),text:Ht(e.text,Sn.text),accent:Ht(e.accent,Sn.accent)};for(let r of C3){let o=e[r];A3(o)&&(n[r]=Ht(o,"#000000"))}return n}function ye(t){let e=parseInt(t.slice(1),16);return[e>>16&255,e>>8&255,e&255]}function ve([t,e,n]){let r=o=>Math.max(0,Math.min(255,Math.round(o))).toString(16).padStart(2,"0");return`#${r(t)}${r(e)}${r(n)}`}function La([t,e,n]){return`${Math.round(t)}, ${Math.round(e)}, ${Math.round(n)}`}function Le(t,e,n){return[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n,t[2]+(e[2]-t[2])*n]}function wT([t,e,n]){return .2126*t+.7152*e+.0722*n}function Nb(t){let e=t/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)}function hT([t,e,n]){return .2126*Nb(t)+.7152*Nb(e)+.0722*Nb(n)}function Vd(t,e){let n=hT(t),r=hT(e);return(Math.max(n,r)+.05)/(Math.min(n,r)+.05)}function ST(t){let e=t/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function T3(t){return(t<=.0031308?12.92*t:1.055*t**.4166666666666667-.055)*255}function Of(t){let[e,n,r]=t.map(ST),o=Math.cbrt(.4122214708*e+.5363325363*n+.0514459929*r),a=Math.cbrt(.2119034982*e+.6806995451*n+.1073969566*r),i=Math.cbrt(.0883024619*e+.2817188376*n+.6299787005*r),l=.2104542553*o+.793617785*a-.0040720468*i,s=1.9779984951*o-2.428592205*a+.4505937099*i,f=.0259040371*o+.7827717662*a-.808675766*i;return[l,Math.hypot(s,f),Math.atan2(f,s)]}function qb(t,e,n){let r=e*Math.cos(n),o=e*Math.sin(n),a=(t+.3963377774*r+.2158037573*o)**3,i=(t-.1055613458*r-.0638541728*o)**3,l=(t-.0894841775*r-1.291485548*o)**3;return[4.0767416621*a-3.3077115913*i+.2309699292*l,-1.2684380046*a+2.6097574011*i-.3413193965*l,-.0041960863*a-.7034186147*i+1.707614701*l]}function M3(t,e,n){let r=i=>i.every(l=>l>=-1e-6&&l<=1.000001),o=0,a=e;if(!r(qb(t,a,n))){for(let i=0;i<24;i++){let l=(o+a)/2;r(qb(t,l,n))?o=l:a=l}a=o}return qb(t,a,n).map(i=>T3(Math.min(1,Math.max(0,i))))}function xT(t){let[e,n,r]=t.map(ST),o=s=>s>216/24389?Math.cbrt(s):(24389/27*s+16)/116,a=o((.4124564*e+.3575761*n+.1804375*r)/.95047),i=o(.2126729*e+.7151522*n+.072175*r),l=o((.0193339*e+.119192*n+.9503041*r)/1.08883);return[116*i-16,500*(a-i),200*(i-l)]}function D3(t,e){let[n,r,o]=xT(t),[a,i,l]=xT(e),s=Math.PI/180,f=(Math.hypot(r,o)+Math.hypot(i,l))/2,c=.5*(1-Math.sqrt(f**7/(f**7+25**7))),u=(1+c)*r,d=(1+c)*i,p=Math.hypot(u,o),h=Math.hypot(d,l),y=(A,T)=>T===0&&A===0?0:(Math.atan2(A,T)/s+360)%360,b=y(o,u),m=y(l,d),g=p*h!==0,x=g?m-b>180?m-b-360:m-b<-180?m-b+360:m-b:0,I=2*Math.sqrt(p*h)*Math.sin(x*s/2),v=(n+a)/2,w=(p+h)/2,S=g?Math.abs(b-m)<=180?(b+m)/2:b+m<360?(b+m+360)/2:(b+m-360)/2:b+m,k=1-.17*Math.cos((S-30)*s)+.24*Math.cos(2*S*s)+.32*Math.cos((3*S+6)*s)-.2*Math.cos((4*S-63)*s),M=1+.015*(v-50)**2/Math.sqrt(20+(v-50)**2),C=1+.045*w,_=1+.015*w*k,L=-Math.sin(60*Math.exp(-(((S-275)/25)**2))*s)*2*Math.sqrt(w**7/(w**7+25**7));return Math.sqrt(((a-n)/M)**2+((h-p)/C)**2+(I/_)**2+L*((h-p)/C)*(I/_))}function Il(t,e,n,r,o=()=>!0){let a=c=>Math.min(...n(c).map(u=>Vd(c,u)))>=r&&o(c);if(a(t))return t;let[i,l,s]=Of(t),f=t;for(let c=i+e*.005;c>=0&&c<=1;c+=e*.005)if(f=ye(ve(M3(c,l,s))),a(f))return f;return f}function kT(t){let e=ye(Ht(t.bg,Sn.bg)),n=ye(Ht(t.surface,Sn.surface)),r=ye(Ht(t.text,Sn.text)),o=Ht(t.accent,Sn.accent),a=wT(e)>140,i=a?R3:O3,l=k=>{let M=t[k];return jd(M)?ye(Ht(M,"#000000")):null},s=l("surface2")??ye(ve(Le(n,r,.1))),f=s,c=s,u=l("hover")??ye(ve(Le(e,r,.08))),d=k=>ye(ve(Le(ye(o),e,1-k))),p=l("selection")??d(a?.09:.12);for(let k=a?.1:.13;!l("selection")&&k<=.18+1e-9&&D3(p,u)<3.6;k+=.01)p=d(k);let h=Of(r)[0]>Of(e)[0]?1:-1,y=4.51,b=Il(ye(ve(Le(r,e,a?.32:.38))),h,()=>[e,n,s,f],y),m=Il(ye(ve(Le(r,e,a?.26:.34))),h,()=>[e,n,s],y,k=>Vd(k,e)>=Vd(b,e)*1.08),g=Il(ye(ve(Le(r,e,a?.34:.46))),h,()=>[e,n,c],y),x=Il(ye(ve(Le(n,r,a?.56:.44))),h,()=>[f,e],3.01),I=k=>[e,n,s,c,p,u,Le(e,k,.1),Le(n,k,.1),Le(s,k,.1),Le(p,k,.1)],v=k=>ve(Il(ye(k),h,I,y)),w={bg:ve(e),surface:ve(n),surface2:ve(Le(n,r,.1)),surface3:ve(Le(n,r,.18)),text:ve(r),subtext:ve(m),hint:ve(b),border:ve(Le(n,r,.16)),"border-control":ve(x),focus:o,selection:ve(p),hover:ve(u),active:ve(Le(ye(o),e,.68)),disabled:ve(Le(r,e,.62)),accent:o,"accent-soft":ve(p),green:v(i.green),red:v(i.red),yellow:v(i.yellow),blue:v(i.blue),mauve:v(i.mauve),teal:v(i.teal),peach:v(i.peach),pending:v(i.yellow),neutral:ve(g),shadow:"#000000",overlay:ve(e)},S={...w};for(let k of bT){let M=t[k];jd(M)&&(S[k]=Ht(M,w[k]))}return S}function gT(t,e){return!yT.includes(e)&&jd(t[e])}function B3(t,e,n,r){for(let o=r;o<1;o=Math.round((o+.02)*100)/100)if([e,n].every(i=>{let l=Le(i,e,.44);return Vd(Le(l,t,o),l)>=3.01}))return o;return 1}function CT(t){let e=kT(t),n=ye(e.bg),r=ye(e.surface),o=ye(e.surface2),a=ye(e.text),i=wT(n)>140,l=jd(t.border)?Ht(t.border,e.border):`rgba(${La(a)}, 0.16)`;return{"--xray-bg":e.bg,"--xray-surface":e.surface,"--xray-surface2":e.surface2,"--xray-surface3":e.surface3,"--xray-text":e.text,"--xray-subtext":e.subtext,"--xray-hint":e.hint,"--xray-bg-rgb":La(n),"--xray-surface-rgb":La(r),"--xray-surface2-rgb":La(o),"--xray-text-rgb":La(a),"--xray-border":l,"--xray-border-control":e["border-control"],"--xray-focus":e.focus,"--xray-selection":e.selection,"--xray-hover":e.hover,"--xray-active":e.active,"--xray-disabled":e.disabled,"--xray-accent":e.accent,"--xray-accent-soft":e["accent-soft"],"--xray-green":e.green,"--xray-red":e.red,"--xray-yellow":e.yellow,"--xray-blue":e.blue,"--xray-mauve":e.mauve,"--xray-teal":e.teal,"--xray-peach":e.peach,"--xray-pending":e.pending,"--xray-neutral":e.neutral,"--xray-shadow":gT(t,"shadow")?e.shadow:"rgba(0, 0, 0, .38)","--xray-overlay":gT(t,"overlay")?e.overlay:`rgba(${La(n)}, .74)`,"--xray-operator-grid":`color-mix(in srgb, ${e.accent} ${i?"4%":"3.5%"}, transparent)`,"--xray-sink":i?"#ffffff":"#000000","--xray-scroll-thumb":`rgba(${La(ye(e.hint))}, ${B3(ye(e.hint),n,r,i?.8:.64)})`}}function Pb(t,e=4.51){let n=kT(t),r=ye(n.bg),o=ye(n.surface),a=ye(n.surface2),i=ye(n.text),l=ye(n.mauve),s=Of(i)[0]>Of(r)[0]?1:-1,f=u=>[Le(o,u,.1),Le(a,u,.1),Le(o,l,.1),Le(a,l,.1),Le(r,u,.14)],c=ve(Il(ye(Ht(t.accent,Sn.accent)),s,f,e));return{...t,accent:c}}var Sn,yT,bT,C3,IT,O3,R3,pz,_b=F(()=>{"use strict";Sn={bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#a99aff"},yT=["bg","surface","text","accent"],bT=["bg","surface","surface2","surface3","text","subtext","hint","border","border-control","focus","selection","hover","active","disabled","accent","accent-soft","green","red","yellow","blue","mauve","teal","peach","pending","neutral","shadow","overlay"],C3=bT.filter(t=>!yT.includes(t)),IT=/^#[0-9a-fA-F]{6}$/;O3={green:"#a6e3a1",red:"#f38ba8",yellow:"#f9e2af",blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",peach:"#fab387"},R3={green:"#0e7e48",red:"#ad2353",yellow:"#805516",blue:"#1970c0",mauve:"#6135e6",teal:"#0b788a",peach:"#a6370b"};pz=[{label:"Slate",theme:{bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#9479ff"}},{label:"Graphite",theme:{bg:"#0e0e10",surface:"#19191c",text:"#ededed",accent:"#22d3ee"}},{label:"Ros\xE9",theme:{bg:"#1a1114",surface:"#241519",text:"#f4e9ec",accent:"#fb7185"}},{label:"Emerald",theme:{bg:"#0b1210",surface:"#131c19",text:"#e6f0ec",accent:"#34d399"}},{label:"Nord",theme:{bg:"#2e3440",surface:"#3b4252",text:"#eceff4",accent:"#88c0d0"}},{label:"Solarized",theme:{bg:"#002b36",surface:"#073642",text:"#eee8d5",accent:"#268bd2"}},{label:"Amber",theme:{bg:"#161207",surface:"#211a0c",text:"#f6ecd6",accent:"#f5a623"}},{label:"Sakura",theme:{bg:"#1c141a",surface:"#281b26",text:"#f6e9f1",accent:"#ec4899"}},{label:"Paper",theme:{bg:"#faf9f6",surface:"#ffffff",text:"#1c1b19",accent:"#2563eb"}},{label:"Sky",theme:{bg:"#eef4fb",surface:"#ffffff",text:"#16273b",accent:"#0284c7"}},{label:"Sage",theme:{bg:"#eef2ec",surface:"#fbfdfa",text:"#1e2a20",accent:"#3f8a4f"}}].map(({label:t,theme:e})=>({label:t,theme:Pb(e)}))});var AT=F(()=>{"use strict";Ro()});function qo(t,e,n,r){if(typeof t=="string"&&t.trim()===""||typeof t!="number"&&typeof t!="string")return e;let o=Number(t);return Number.isFinite(o)?Math.min(r,Math.max(n,Math.round(o))):e}function zb(t,e=2,n=8e4){let r=[],o="";try{o=JSON.stringify(t,function(a,i){if(typeof i=="bigint")return i.toString()+"n";if(i&&typeof i=="object"){for(;r.length>0&&r[r.length-1]!==this;)r.pop();if(r.includes(i))return"[Circular]";r.push(i)}return i},e)??"undefined"}catch{try{o=String(t)}catch{o="[unserializable]"}}return o.length<=n?o:o.slice(0,n)+`
... truncated ${o.length-n} chars`}var kz,Hb=F(()=>{"use strict";AT();Ro();kz=new Intl.DateTimeFormat("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})});function E3(t){return typeof t=="string"&&Object.prototype.hasOwnProperty.call(jb,t)?t:null}function j3(t,e){let n=Vb.find(({id:a})=>a===t.theme);if(!n)return Ub[e]??Ub.blue;let r=`${n.id}:${e}`,o=TT.get(r);if(!o){let a=n.kind==="light"?U3:Ub,i=a[e]??a.blue;o=Pb({bg:n.preview.bg,text:n.preview.text,accent:i,...n.hosts},n.contrast+.01).accent,TT.set(r,o)}return o}function DT(t){return t.theme==="custom"?t.customTheme?.accent??Sn.accent:t.accentChosen?j3(t,t.accent):void 0}function V3(t,e){return L3.includes(t)?t:e}function G3(t,e){return MT.includes(t)?t:e}function Q3(t,e){return N3.includes(t)?t:e}function X3(t,e){return q3.includes(t)?t:e}function W3(t,e){return P3.includes(t)?t:e}function K3(t,e){return _3.includes(t)?t:e}function RT(t){let e=Object.fromEntries(Object.entries(t||{}).filter(([,u])=>u!==void 0)),n={...at,...e},r=MT.includes(n.accent),o=G3(n.accent,at.accent),a=typeof e.themeRefreshPending!="boolean",i=E3(n.theme),l=i?jb[i].to:Q3(n.theme,at.theme),s=i?jb[i].accent:a&&l==="midnight"?"peach":null,f=s?r&&o!==s:typeof e.accentChosen=="boolean"?e.accentChosen:o!==at.accent,c=!!n.themeRefreshPending||i!==null||s!==null&&!f;return{captureFetch:!!n.captureFetch,captureXhr:!!n.captureXhr,captureWs:!!n.captureWs,maxEntries:qo(n.maxEntries,at.maxEntries,50,5e3),slowThresholdMs:qo(n.slowThresholdMs,at.slowThresholdMs,100,5e3),verySlowThresholdMs:qo(n.verySlowThresholdMs,at.verySlowThresholdMs,200,1e4),defaultDetailView:V3(n.defaultDetailView,at.defaultDetailView),compactRows:!!n.compactRows,showHostInPath:!!n.showHostInPath,accent:o,accentChosen:f,theme:l,customTheme:vT(n.customTheme),font:X3(n.font,at.font),density:W3(n.density,at.density),radius:qo(n.radius,at.radius,0,20),glow:!!n.glow,hacker:!!n.hacker,confirmDestructiveActions:!!n.confirmDestructiveActions,panelWidth:qo(n.panelWidth,at.panelWidth,z3,H3),dockSide:K3(n.dockSide,at.dockSide),apiSplit:qo(n.apiSplit,at.apiSplit,0,2e3),logsSplit:qo(n.logsSplit,at.logsSplit,0,2e3),firstRunDismissed:!!n.firstRunDismissed,themeRefreshPending:c,sqlInlineInHud:!!n.sqlInlineInHud}}var Vb,jb,Mz,F3,L3,MT,N3,q3,P3,_3,z3,H3,Ub,U3,TT,OT,at,Gd=F(()=>{"use strict";_b();Hb();Vb=[{id:"xray-dark",label:"XRAY Dark",kind:"dark",contrast:4.5,preview:{bg:"#141517",accent:"#3dc8f5",text:"#eeeff1"},hosts:{surface:"#1b1c1f",surface2:"#25272a",mauve:"#c6a0f2"}},{id:"xray-light",label:"XRAY Light",kind:"light",contrast:4.5,preview:{bg:"#f3f4f6",accent:"#00698f",text:"#16171a"},hosts:{surface:"#ffffff",surface2:"#eaecef",mauve:"#793fad"}},{id:"github-dark",label:"GitHub Dark",kind:"dark",contrast:4.5,preview:{bg:"#0d1117",accent:"#5297ff",text:"#e6edf3"},hosts:{surface:"#161b22",surface2:"#21262d",mauve:"#ad7fff"}},{id:"github-light",label:"GitHub Light",kind:"light",contrast:4.5,preview:{bg:"#f6f8fa",accent:"#005eca",text:"#1f2328"},hosts:{surface:"#ffffff",surface2:"#eaeef2",mauve:"#723cca"}},{id:"tokyo-night",label:"Tokyo Night",kind:"dark",contrast:4.5,preview:{bg:"#16161e",accent:"#7ba4f9",text:"#c0caf5"},hosts:{surface:"#1a1b26",surface2:"#292e42",mauve:"#bb9af7"}},{id:"catppuccin-mocha",label:"Catppuccin Mocha",kind:"dark",contrast:4.5,preview:{bg:"#181825",accent:"#cba6f7",text:"#cdd6f4"},hosts:{surface:"#1e1e2e",surface2:"#313244",mauve:"#f5c2e7"}},{id:"dracula",label:"Dracula",kind:"dark",contrast:4.5,preview:{bg:"#21222c",accent:"#c59dff",text:"#f8f8f2"},hosts:{surface:"#282a36",surface2:"#343746",mauve:"#ff86ca"}},{id:"gruvbox-dark",label:"Gruvbox Dark",kind:"dark",contrast:4.5,preview:{bg:"#1d2021",accent:"#8ec07c",text:"#ebdbb2"},hosts:{surface:"#282828",surface2:"#3c3836",mauve:"#ea9bb0"}},{id:"midnight",label:"High Contrast",kind:"dark",contrast:7,preview:{bg:"#000000",accent:"#00e5ff",text:"#ffffff"},hosts:{surface:"#101010",surface2:"#1d1d1d",mauve:"#d4a8ff"}}],jb={operator:{to:"xray-dark",accent:"blue"},"dev-edition":{to:"xray-dark",accent:"coral"},"light-lab":{to:"xray-light",accent:"blue"},claude:{to:"xray-light",accent:"coral"}};Mz={...Object.fromEntries(Vb.map(({id:t,label:e})=>[t,e])),custom:"Custom"},F3=new Map(Vb.map(({id:t,kind:e})=>[t,e])),L3=["tree","grid","raw","schema","diff","viz","waterfall","headers"],MT=["blue","mauve","teal","green","peach","coral"],N3=[...F3.keys(),"custom"],q3=["jetbrains","cascadia","iosevka","system"],P3=["compact","comfortable","spacious"],_3=["left","right"],z3=360,H3=2e3,Ub={blue:"#d99a2b",mauve:"#cba6f7",teal:"#94e2d5",green:"#a6e3a1",peach:"#f2d457",coral:"#eaa388"},U3={blue:"#845600",mauve:"#7418ec",teal:"#0d696e",green:"#226d15",peach:"#6e6200",coral:"#a23f1e"},TT=new Map;OT={jetbrains:"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",cascadia:"'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",iosevka:"'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",system:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"},at={captureFetch:!0,captureXhr:!0,captureWs:!0,maxEntries:1e3,slowThresholdMs:500,verySlowThresholdMs:1e3,defaultDetailView:"tree",compactRows:!1,showHostInPath:!0,accent:"blue",accentChosen:!1,theme:"xray-dark",customTheme:Sn,font:"jetbrains",density:"compact",radius:10,glow:!1,hacker:!1,confirmDestructiveActions:!0,panelWidth:960,dockSide:"right",apiSplit:0,logsSplit:0,firstRunDismissed:!1,themeRefreshPending:!1,sqlInlineInHud:!1}});var ET=An(Qd=>{"use strict";var Y3=Symbol.for("react.transitional.element"),J3=Symbol.for("react.fragment");function BT(t,e,n){var r=null;if(n!==void 0&&(r=""+n),e.key!==void 0&&(r=""+e.key),"key"in e){n={};for(var o in e)o!=="key"&&(n[o]=e[o])}else n=e;return e=n.ref,{$$typeof:Y3,type:t,key:r,ref:e!==void 0?e:null,props:n}}Qd.Fragment=J3;Qd.jsx=BT;Qd.jsxs=BT});var Te=An((Rz,FT)=>{"use strict";FT.exports=ET()});function Z3(t){let e=t.getRootNode();return e instanceof ShadowRoot?e:document}function Xd(t){let e=t.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function NT(t,e){let n=Xd(e);return Array.from(t.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(r=>r.offsetParent!==null||r===n)}function Qb(t){let e=Array.from(t.querySelectorAll('[role="dialog"]')).filter(n=>Gb.has(n));return e[e.length-1]}function eq(t,e){return Qb(t)===e}function LT(t,e,n){let r=n?.current;if(r&&t.contains(r)){r.focus();return}let o=NT(t,e);(o.find(i=>i.matches('input, select, textarea, [contenteditable="true"]'))||o[0]||null)?.focus()}function Xb({title:t,subtitle:e,icon:n,className:r="",children:o,footer:a,initialFocusRef:i,onClose:l}){let s=(0,vl.useRef)(null);return(0,vl.useLayoutEffect)(()=>{let f=s.current;if(f)return Gb.set(f,l),()=>{Gb.delete(f)}},[l]),(0,vl.useEffect)(()=>{let f=s.current;if(!f)return;let c=Z3(f),u=Xd(c),d=Qb(c);d&&(d===f||!d.contains(u))&&LT(d,c,d===f?i:void 0);function p(h){if(h.key!=="Tab"||!f||!eq(c,f))return;let y=NT(f,c);if(!y.length){h.preventDefault();return}let b=y[0],m=y[y.length-1],g=Xd(c);h.shiftKey&&g===b?(h.preventDefault(),m.focus()):!h.shiftKey&&g===m&&(h.preventDefault(),b.focus())}return document.addEventListener("keydown",p,!0),()=>{document.removeEventListener("keydown",p,!0);let h=Qb(c),y=Xd(c);h&&y&&h.contains(y)||(u instanceof HTMLElement&&u.isConnected&&(!h||h.contains(u))?u.focus():h&&LT(h,c))}},[]),(0,nn.jsx)("div",{className:"xray-modal-backdrop",onMouseDown:l,children:(0,nn.jsxs)("section",{ref:s,className:`xray-modal ${r}`,role:"dialog","aria-modal":"true","aria-label":t,onMouseDown:f=>f.stopPropagation(),children:[(0,nn.jsxs)("header",{className:"xray-modal-head",children:[n&&(0,nn.jsx)("span",{className:"xray-modal-title-icon",children:n}),(0,nn.jsxs)("div",{children:[(0,nn.jsx)("h3",{children:t}),e&&(0,nn.jsx)("div",{className:"xray-modal-subtitle",children:e})]}),(0,nn.jsx)("span",{className:"xray-spacer"}),(0,nn.jsx)("button",{className:"xray-icon-btn",onClick:l,"aria-label":`Close ${t}`,children:(0,nn.jsx)(fa,{...$3})})]}),o,a&&(0,nn.jsx)("footer",{className:"xray-modal-foot",children:a})]})})}var vl,nn,$3,Gb,qT=F(()=>{"use strict";vl=J(bt());Ar();nn=J(Te()),$3={size:16,stroke:1.8},Gb=new WeakMap});function tq(t){return t.columns.map(e=>`${e.name}${e.type?` ${e.type}`:""}${e.pk?" PK":""}`).join(`
`)}function nq(t){return[t.name,t.type,t.pk&&"primary key",!t.nullable&&"not null"].filter(Boolean).join(", ")}function rq({column:t}){return(0,oe.jsxs)("li",{role:"treeitem","aria-level":3,"aria-label":nq(t),className:"xray-sql-rail-column",children:[(0,oe.jsx)("span",{className:"xray-sql-rail-name",children:t.name}),t.type&&(0,oe.jsx)("span",{className:"xray-sql-rail-type",children:t.type}),t.pk&&(0,oe.jsx)("span",{role:"img","aria-label":"primary key",title:"Primary key",className:"xray-sql-rail-marker pk",children:"PK"}),!t.nullable&&(0,oe.jsx)("span",{role:"img","aria-label":"not null",title:"Not null",className:"xray-sql-rail-marker",children:"NN"})]})}function oq({schema:t,table:e,view:n}){let r=N(s=>s.previewTable),o=N(s=>!!s.running||s.opening),[a,i]=(0,Hr.useState)(!1),l=()=>{o||r(t,e.name)};return(0,oe.jsxs)("div",{role:"none",className:"xray-sql-rail-entry",children:[(0,oe.jsxs)("div",{role:"none",className:"xray-sql-rail-row",children:[(0,oe.jsx)("button",{type:"button",className:"xray-sql-rail-toggle","aria-expanded":a,"aria-label":`Columns of ${e.name}`,onClick:()=>i(s=>!s),children:(0,oe.jsx)(nx,{size:12,stroke:2,"aria-hidden":"true"})}),(0,oe.jsxs)("div",{role:"treeitem",tabIndex:0,"aria-level":2,"aria-disabled":o||void 0,className:"xray-sql-rail-item",title:tq(e),onClick:l,onKeyDown:s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),l())},children:[n?(0,oe.jsx)(ax,{size:14,stroke:1.8,"aria-hidden":"true"}):(0,oe.jsx)(xx,{size:14,stroke:1.8,"aria-hidden":"true"}),(0,oe.jsx)("span",{className:"xray-sql-rail-name",children:e.name})]})]}),a&&(0,oe.jsx)("ul",{role:"group","aria-label":`${e.name} columns`,className:"xray-sql-rail-columns",children:e.columns.map(s=>(0,oe.jsx)(rq,{column:s},s.name))})]})}function aq(t){return t?t.closest(".cm-editor")?!0:t instanceof HTMLElement&&(t.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(t.tagName)):!1}function PT(){let t=N(l=>l.connection),e=N(l=>l.schema),[n,r]=(0,Hr.useState)(""),o=(0,Hr.useRef)(null);(0,Hr.useEffect)(()=>{let l=s=>{s.key!=="/"||s.ctrlKey||s.metaKey||s.altKey||aq(document.activeElement)||document.querySelector('[aria-modal="true"]')||o.current&&(s.preventDefault(),o.current.focus(),o.current.select())};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[]);let a=!!e&&e.schemas.some(l=>l.tables.length||l.views.length),i=0;return(0,oe.jsxs)("nav",{className:"xray-sql-rail","aria-label":"Schema",children:[!t&&(0,oe.jsx)("p",{className:"xray-sql-empty",children:"No database open."}),t&&a&&(0,oe.jsxs)("label",{className:"xray-sql-rail-filter",children:[(0,oe.jsx)(hx,{size:13,stroke:1.8,"aria-hidden":"true"}),(0,oe.jsx)("input",{ref:o,className:"xray-input",type:"search","aria-label":"Filter tables",placeholder:"Filter tables","aria-keyshortcuts":"/",value:n,onChange:l=>r(l.target.value),onKeyDown:l=>{l.key==="Escape"&&n&&(l.preventDefault(),r(""))}}),(0,oe.jsx)("kbd",{className:"xray-sql-rail-filter-key","aria-hidden":"true",children:"/"})]}),t&&e&&(0,oe.jsxs)("div",{role:"tree","aria-label":"Tables and views",className:"xray-sql-tree",children:[e.schemas.map(l=>(0,oe.jsxs)(Hr.default.Fragment,{children:[e.schemas.length>1&&(0,oe.jsx)("div",{className:"xray-sql-rail-schema","aria-hidden":"true",children:l.name}),[["Tables",l.tables,!1],["Views",l.views,!0]].map(([s,f,c])=>{let u=f.filter(d=>nT(d.name,n));return i+=u.length,u.length?(0,oe.jsxs)("div",{role:"group","aria-label":e.schemas.length>1?`${l.name} ${s}`:s,children:[(0,oe.jsxs)("div",{className:"xray-sql-rail-heading","aria-hidden":"true",children:[s," ",(0,oe.jsx)("span",{className:"xray-sql-rail-count",children:u.length})]}),u.map(d=>(0,oe.jsx)(oq,{schema:l.name,table:d,view:c},d.name))]},s):null})]},l.name)),!a&&(0,oe.jsx)("p",{className:"xray-sql-empty",children:"No tables or views."}),a&&i===0&&(0,oe.jsxs)("p",{className:"xray-sql-empty",children:["No tables match \u201C",n.trim(),"\u201D."]})]})]})}var Hr,oe,_T=F(()=>{"use strict";Hr=J(bt());Ar();Fa();kf();oe=J(Te())});function zT(){return HT(N.getState().openFile)}async function HT(t){let e=window.showOpenFilePicker;if(typeof e!="function"){Wb?.click();return}let n;try{[n]=await e.call(window,{multiple:!1,types:lq})}catch(r){if(r?.name==="AbortError")return;Wb?.click();return}n&&await t(await n.getFile(),n)}function UT(){let t=N(e=>e.openFile);return(0,Rf.jsx)("input",{ref:e=>{Wb=e},type:"file",accept:iq,hidden:!0,tabIndex:-1,"aria-hidden":"true",onChange:e=>{let n=e.target.files?.[0];e.target.value="",n&&t(n)}})}function Kb({disabled:t,className:e="xray-btn",label:n="Open SQLite file",title:r,onPicked:o}){let a=N(i=>i.openFile);return(0,Rf.jsxs)("button",{type:"button",className:e,disabled:t,title:r,"aria-label":"Open SQLite file",onClick:()=>{o?.(),HT(a)},children:[(0,Rf.jsx)(lx,{size:16,stroke:1.8,"aria-hidden":"true"}),n]})}var Rf,iq,lq,Wb,jT=F(()=>{"use strict";Ar();Fa();Rf=J(Te()),iq=".sqlite,.sqlite3,.db,.db3,application/vnd.sqlite3",lq=[{description:"SQLite database",accept:{"application/vnd.sqlite3":[".sqlite",".sqlite3",".db",".db3"]}}],Wb=null});function Yb({orientation:t,label:e,value:n,valueText:r,min:o,max:a,defaultValue:i,onSet:l,onStep:s,onDrag:f}){let[c,u]=(0,Wd.useState)(!1),d=(0,Wd.useRef)(null),p=t==="horizontal"?"ArrowUp":"ArrowLeft",h=t==="horizontal"?"ArrowDown":"ArrowRight";return(0,VT.jsx)("div",{role:"separator",tabIndex:0,"aria-label":e,"aria-orientation":t,"aria-valuenow":Math.round(n),"aria-valuemin":o,"aria-valuemax":a,"aria-valuetext":r,title:`${e} (double-click to reset)`,className:`xray-sql-divider ${t}${c?" dragging":""}`,onKeyDown:y=>{y.key===p||y.key===h?(y.preventDefault(),s(y.key===p?-wb:wb)):(y.key==="Home"||y.key==="End")&&(y.preventDefault(),l(y.key==="Home"?o:a))},onDoubleClick:()=>l(i),onPointerDown:y=>{y.button===0&&(y.preventDefault(),d.current=y.pointerId,y.currentTarget.setPointerCapture(y.pointerId),u(!0))},onPointerMove:y=>{d.current===y.pointerId&&f(y.clientX,y.clientY)},onPointerUp:y=>{d.current===y.pointerId&&(d.current=null,y.currentTarget.releasePointerCapture(y.pointerId),u(!1))},onPointerCancel:()=>{d.current=null,u(!1)}})}var Wd,VT,GT=F(()=>{"use strict";Wd=J(bt());Ed();VT=J(Te())});function Jb(t){return t.trim()?t.trim().toUpperCase():"\u2014"}function pq(t){return Math.round(Math.min(fq,Math.max(sq,t)))}function JT(t,e,n){let r=e.slice(0,cq);return t.map((o,a)=>{let i=Math.max(n(o.name),n(Jb(o.type)))+uq;for(let l of r){let f=Eo(l[a]??null,o.type).text.slice(0,dq);i=Math.max(i,n(f)+YT)}return pq(i)})}function $T(t,e){return Math.round(Math.min(72,Math.max(40,e(String(Math.max(1,t)))+YT)))}function ZT(t,e){return!t||t.col!==e?{col:e,dir:"asc"}:t.dir==="asc"?{col:e,dir:"desc"}:null}function XT(t){return typeof t=="number"||typeof t=="boolean"?0:typeof t=="string"?mq.test(t)?0:1:2}function WT(t){return typeof t=="boolean"?t?1:0:Number(t)}function hq(t,e){let n=XT(t),r=XT(e);if(n!==r)return n-r;if(n===0){let o=WT(t)-WT(e);return o!==0?o:typeof t=="string"&&typeof e=="string"?QT.compare(t,e):0}return n===1?QT.compare(t,e):t.hex<e.hex?-1:t.hex>e.hex?1:0}function xq(t,e,n){if(!n)return e.slice();let r=n.dir==="asc"?1:-1;return e.slice().sort((o,a)=>{let i=t[o][n.col]??null,l=t[a][n.col]??null;return i===null||l===null?i===l?o-a:i===null?1:-1:r*hq(i,l)||o-a})}function gq(t,e,n){let r=n.trim().toLowerCase(),o=[];for(let a=0;a<t.length;a++)(!r||t[a].some((i,l)=>Eo(i,e[l]?.type).text.toLowerCase().includes(r)))&&o.push(a);return o}function eM(t,e,n,r){return xq(t,gq(t,e,n),r)}function tM(t){return t.map(e=>`${e.name}\0${e.type}`).join("")}function nM(t,e){if(!t||!e)return new Set;let n=t.schemas.find(r=>r.name==="main")?.tables.find(r=>r.name===e);return new Set(n?n.columns.filter(r=>r.pk).map(r=>r.name):[])}function rM(t,e,n){return`${t} of ${e} rows \xB7 ${Math.round(n)} ms`}function oM(t,e=""){if(t===null)return{text:"NULL",truncatedBlob:!1};if(typeof t=="object")return{text:`\\x${t.hex}`,truncatedBlob:Dd(t)};if(typeof t=="string"){if(Eo(t,e).kind==="json"){let r=Oo(t);if(r.ok)return{text:ab(r.root,{indent:2}),truncatedBlob:!1}}return{text:t,truncatedBlob:!1}}return{text:String(t),truncatedBlob:!1}}var sq,fq,KT,cq,YT,uq,dq,mq,QT,$b=F(()=>{"use strict";Ro();Pr();sq=64,fq=480,KT=48,cq=50,YT=16,uq=22,dq=80;mq=/^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/,QT=new Intl.Collator("en",{numeric:!0,sensitivity:"base"})});function we(t,e,n,r){let o=r?`${t}(${r.map(a=>a.name).join(", ")})`:t;return r?{name:t,signature:o,description:n,group:e,params:r}:{name:t,signature:o,description:n,group:e}}function Zb(t,e){let n=t;for(let r of e)typeof r=="number"?n+=`[${r}]`:yq.test(r)?n+=`.${r}`:n+=`[${JSON.stringify(r)}]`;return n}var yq,Bf,Na,Ef,Ur,Kz,aM=F(()=>{"use strict";Ro();yq=/^[A-Za-z_$][\w$]*$/,Bf="Request data",Na="Find entries",Ef="Transform",Ur="Output";Kz=[we("res",Bf,"Parsed response body of the selected request."),we("req",Bf,"Parsed request body of the selected request."),we("entry",Bf,"The full captured entry for the selected request."),we("schema",Ef,"Infer a structural schema of a value.",[{name:"x",description:"Value to describe."}]),we("diff",Ef,"Structural diff of two values.",[{name:"a",description:"The baseline value."},{name:"b",description:"The value to compare against a."}]),we("pick",Ef,"Copy of obj with only the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to keep.",values:"keys"}]),we("omit",Ef,"Copy of obj without the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to drop.",values:"keys"}]),we("flatten",Ef,"Flatten nested keys into dotted paths.",[{name:"obj",description:"Object to flatten."}]),we("toTable",Ur,"Render an array of objects as a table.",[{name:"rows",description:"Array of objects to show."}]),we("table",Ur,"Alias of toTable: render rows as a table.",[{name:"rows",description:"Array of objects to show."}]),we("csv",Ur,"Alias of toCSV: convert rows to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),we("prev",Bf,"Response body of the previous call to this endpoint."),we("next",Bf,"Response body of the next call to this endpoint."),we("toCSV",Ur,"Convert an array of objects to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),we("copy",Ur,"Copy a value to the clipboard.",[{name:"x",description:"Value to copy."}]),we("$prev",Na,"Previous captured entry in the list.",[]),we("$next",Na,"Next captured entry in the list.",[]),we("$all",Na,"Every captured entry.",[]),we("$errors",Na,"Entries with a status of 400 or above.",[]),we("$slow",Na,"Entries slower than ms milliseconds.",[{name:"ms = 1000",description:"Duration threshold in milliseconds.",values:"duration"}]),we("$status",Na,"Entries with the given status code.",[{name:"code",description:"HTTP status code to match.",values:"status"}]),we("$endpoint",Na,"Entries whose URL path contains the text.",[{name:"path",description:"Text the URL path must contain.",values:"endpoint"}]),we("$help",Ur,"List all console helpers."),we("$curl",Ur,"Copy-ready cURL command for the selected request."),we("$fetch",Ur,"Copy-ready fetch() snippet for the selected request."),we("$mock",Ur,"Build a mock response from an entry.",[{name:"entry?",description:"Entry to mock; defaults to the selected request."}])]});var wl,qa,iM=F(()=>{"use strict";wl=class{constructor(e,n){ar(this,"text");ar(this,"tone");this.text=e,this.tone=n}toJSON(){return this.text}},qa=class{constructor(e,n,r,o=r.length){ar(this,"kind");ar(this,"label");ar(this,"children");ar(this,"count");this.kind=e,this.label=n,this.children=r,this.count=o}toJSON(){if(this.kind==="array")return this.children.map(n=>n.value);let e={};for(let n of this.children){let r=n.name??(n.label===void 0?String(n.key):n.label||"\u2026");Object.defineProperty(e,r,{value:n.value,enumerable:!0,configurable:!0,writable:!0})}return e}}});function Yd(){return{all:null,overrides:new Map,shown:new Map,budget:2e4}}function bq(t){return t.t==="obj"||t.t==="arr"}function Kd(t){return t.t==="obj"?t.entries.length:t.items.length}function e0(t,e,n){let r=t.overrides.get(e);return r!==void 0?r:t.all===null?n<4:t.all}function sM(t,e){let n=[],r=Math.max(1,Math.floor(e.budget)),o=[],a=[],i=[],l=[],s=(f,c,u,d)=>{if(!bq(f)||Kd(f)===0){n.push({type:"node",node:f,depth:c,key:u,dup:d,open:null});return}let p=e0(e,f,c);n.push({type:"node",node:f,depth:c,key:u,dup:d,open:p}),p&&(o.push(f),a.push(c),i.push(0),l.push(Math.min(Kd(f),Math.max(1,e.shown.get(f)??100))))};for(s(t,0,null,!1);o.length>0;){if(n.length>=r)return n.push({type:"budget",depth:0}),n;let f=o.length-1,c=o[f],u=a[f],d=i[f];if(d<l[f]){if(i[f]=d+1,c.t==="arr")s(c.items[d],u+1,d,!1);else{let h=c.entries[d];s(h.value,u+1,h.key,h.dup===!0)}continue}let p=Kd(c);l[f]<p&&n.push({type:"more",node:c,depth:u+1,hidden:p-l[f]}),n.push({type:"close",node:c,depth:u}),o.pop(),a.pop(),i.pop(),l.pop()}return n}function fM(t){return t.exact?null:`JavaScript reads this as ${Object.is(t.value,-0)?"0":String(t.value)}`}function cM(t){let e=Kd(t);return t.t==="arr"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function vq(t){let e=lM.get(t);return e===void 0&&(e=++Iq,lM.set(t,e)),e}function uM(t){if(t.type==="budget")return"budget";let e=vq(t.node);return t.type==="node"?`n${e}`:t.type==="close"?`c${e}`:`m${e}`}var lM,Iq,dM=F(()=>{"use strict";lM=new WeakMap,Iq=0});function mM(t){if(!t)return[];if(!wq.test(t))return[t];let e=[],n=0;for(let r=0;r<t.length;r++){let o=t.charCodeAt(r);pM[o]!==void 0&&(r>n&&e.push(t.slice(n,r)),e.push(o),n=r+1)}return n<t.length&&e.push(t.slice(n)),e}function hM(t){return"\\u"+t.toString(16).toUpperCase().padStart(4,"0")}function xM(t){return`U+${t.toString(16).toUpperCase().padStart(4,"0")} ${pM[t]??"BIDI CONTROL"}`}var wq,pM,gM=F(()=>{"use strict";wq=/[‎‏‪-‮⁦-⁩]/,pM={8206:"LEFT-TO-RIGHT MARK",8207:"RIGHT-TO-LEFT MARK",8234:"LEFT-TO-RIGHT EMBEDDING",8235:"RIGHT-TO-LEFT EMBEDDING",8236:"POP DIRECTIONAL FORMATTING",8237:"LEFT-TO-RIGHT OVERRIDE",8238:"RIGHT-TO-LEFT OVERRIDE",8294:"LEFT-TO-RIGHT ISOLATE",8295:"RIGHT-TO-LEFT ISOLATE",8296:"FIRST STRONG ISOLATE",8297:"POP DIRECTIONAL ISOLATE"}});function jr(t){let e=mM(t);return e.length===0||e.length===1&&typeof e[0]=="string"?t:e.map((n,r)=>typeof n=="number"?(0,Jd.jsx)("span",{className:"xray-bidi",title:`${xM(n)}, shown escaped`,children:hM(n)},r):(0,Jd.jsx)(yM.default.Fragment,{children:n},r))}var yM,Jd,bM=F(()=>{"use strict";yM=J(bt());gM();Jd=J(Te())});function IM(t,e,n){let r=new Array(t);return new Proxy(r,{get(o,a,i){if(typeof a=="string"){let l=a.charCodeAt(0);if(l>=48&&l<=57){let s=+a;if(Number.isInteger(s)&&s>=0&&s<t){let f=o[s];if(!f){let c=e[s*2];f=o[s]={index:s,key:n(s),start:c,size:e[s*2+1],end:c+e[s*2+1],lane:0}}return f}}if(a==="length")return t}return Reflect.get(o,a,i)}})}var vM=F(()=>{});function Pa(t,e,n){let r=n.initialDeps??[],o,a=!0;function i(){var l;let f=0,c=t();if(!(c.length!==r.length||c.some((p,h)=>r[h]!==p)))return o;r=c;let d=0;return o=e(...c),n?.onChange&&!(a&&n.skipInitialOnChange)&&n.onChange(o),a=!1,o}return i.updateDeps=l=>{r=l},i}function t0(t,e){if(t===void 0)throw new Error(`Unexpected undefined${e?`: ${e}`:""}`);return t}var n0,wM,SM=F(()=>{n0=(t,e)=>Math.abs(t-e)<1.01,wM=(t,e,n)=>{let r;return function(...o){t.clearTimeout(r),r=t.setTimeout(()=>e.apply(this,o),n)}}});function Dq({measurements:t,outerSize:e,scrollOffset:n,lanes:r,flat:o}){let a=t.length-1,i=o?c=>o[c*2]:c=>t[c].start,l=o?c=>o[c*2]+o[c*2+1]:c=>t[c].end;if(t.length<=r)return{startIndex:0,endIndex:a};let s=DM(0,a,i,n),f=s;if(r===1)for(;f<a&&l(f)<n+e;)f++;else if(r>1){let c=Array(r).fill(0);for(;f<a&&c.some(d=>d<n+e);){let d=t[f];c[d.lane]=d.end,f++}let u=Array(r).fill(n+e);for(;s>=0&&u.some(d=>d>=n);){let d=t[s];u[d.lane]=d.start,s--}s=Math.max(0,s-s%r),f=Math.min(a,f+(r-1-f%r))}return{startIndex:s,endIndex:f}}var Ff,kM,CM,Sq,kq,AM,$d,Cq,Aq,TM,Tq,Mq,MM,Zd,DM,r0=F(()=>{vM();SM();kM=()=>{if(Ff!==void 0)return Ff;if(typeof navigator>"u")return Ff=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return Ff=!0;let t=navigator.maxTouchPoints;return Ff=navigator.platform==="MacIntel"&&t!==void 0&&t>0},CM=t=>{let{offsetWidth:e,offsetHeight:n}=t;return{width:e,height:n}},Sq=t=>t,kq=t=>{let e=Math.max(t.startIndex-t.overscan,0),r=Math.min(t.endIndex+t.overscan,t.count-1)-e+1,o=new Array(r);for(let a=0;a<r;a++)o[a]=e+a;return o},AM=(t,e)=>{let n=t.scrollElement;if(!n)return;let r=t.targetWindow;if(!r)return;let o=i=>{let{width:l,height:s}=i;e({width:Math.round(l),height:Math.round(s)})};if(o(CM(n)),!r.ResizeObserver)return()=>{};let a=new r.ResizeObserver(i=>{let l=()=>{let s=i[0];if(s?.borderBoxSize){let f=s.borderBoxSize[0];if(f){o({width:f.inlineSize,height:f.blockSize});return}}o(CM(n))};t.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(l):l()});return a.observe(n,{box:"border-box"}),()=>{a.unobserve(n)}},$d={passive:!0},Cq=typeof window>"u"?!0:"onscrollend"in window,Aq=(t,e,n)=>{let r=t.scrollElement;if(!r)return;let o=t.targetWindow;if(!o)return;let a=t.options.useScrollendEvent&&Cq,i=0,l=a?null:wM(o,()=>e(i,!1),t.options.isScrollingResetDelay),s=u=>()=>{i=n(r),l?.(),e(i,u)},f=s(!0),c=s(!1);return r.addEventListener("scroll",f,$d),a&&r.addEventListener("scrollend",c,$d),()=>{r.removeEventListener("scroll",f),a&&r.removeEventListener("scrollend",c)}},TM=(t,e)=>Aq(t,e,n=>{let{horizontal:r,isRtl:o}=t.options;return r?n.scrollLeft*(o&&-1||1):n.scrollTop}),Tq=(t,e,n)=>{if(e?.borderBoxSize){let r=e.borderBoxSize[0];if(r)return Math.round(r[n.options.horizontal?"inlineSize":"blockSize"])}return t[n.options.horizontal?"offsetWidth":"offsetHeight"]},Mq=(t,{adjustments:e=0,behavior:n},r)=>{var o,a;(a=(o=r.scrollElement)==null?void 0:o.scrollTo)==null||a.call(o,{[r.options.horizontal?"left":"top"]:t+e,behavior:n})},MM=Mq,Zd=class{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var n,r,o;return((o=(r=(n=this.targetWindow)==null?void 0:n.performance)==null?void 0:r.now)==null?void 0:o.call(r))??Date.now()},this.observer=(()=>{let n=null,r=()=>n||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:n=new this.targetWindow.ResizeObserver(o=>{o.forEach(a=>{let i=()=>{let l=a.target,s=this.indexFromElement(l);if(!l.isConnected){this.observer.unobserve(l);for(let[f,c]of this.elementsCache)if(c===l){this.elementsCache.delete(f);break}return}this.shouldMeasureDuringScroll(s)&&this.resizeItem(s,this.options.measureElement(l,a,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(i):i()})}));return{disconnect:()=>{var o;(o=r())==null||o.disconnect(),n=null},observe:o=>{var a;return(a=r())==null?void 0:a.observe(o,{box:"border-box"})},unobserve:o=>{var a;return(a=r())==null?void 0:a.unobserve(o)}}})(),this.range=null,this.setOptions=n=>{var r,o;let a={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:Sq,rangeExtractor:kq,onChange:()=>{},measureElement:Tq,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,anchorTo:"start",followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate"};for(let f in n){let c=n[f];c!==void 0&&(a[f]=c)}let i=this.options,l=null,s=null;if(i!==void 0&&i.enabled&&a.enabled&&a.anchorTo==="end"&&this.scrollElement!==null){let f=i.count,c=a.count,u=this.getMeasurements(),d=f>0?((r=u[0])==null?void 0:r.key)??i.getItemKey(0):null,p=f>0?((o=u[f-1])==null?void 0:o.key)??i.getItemKey(f-1):null;if(c!==f||f>0&&c>0&&(a.getItemKey(0)!==d||a.getItemKey(c-1)!==p)){let b=f>0?this.getVirtualItemForOffset(this.getScrollOffset())??u[0]:null;b&&(l=[b.key,this.getScrollOffset()-b.start]);let m=a.followOnAppend===!0?"auto":a.followOnAppend||null;m&&c>f&&this.isAtEnd(i.scrollEndThreshold)&&(f===0||a.getItemKey(c-1)!==p)&&(s=m)}}this.options=a,(l||s)&&(this.pendingScrollAnchor=[l?.[0]??null,l?.[1]??0,s])},this.notify=n=>{var r,o;(o=(r=this.options).onChange)==null||o.call(r,this,n)},this.maybeNotify=Pa(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),n=>{this.notify(n)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(n=>n()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var n;let r=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==r){if(this.cleanup(),!r){this.maybeNotify();return}if(this.scrollElement=r,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((n=this.scrollElement)==null?void 0:n.window)??null,this.elementsCache.forEach(a=>{this.observer.observe(a)}),this.unsubs.push(this.options.observeElementRect(this,a=>{this.scrollRect=a,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(a,i)=>{this._intendedScrollOffset!==null&&Math.abs(a-this._intendedScrollOffset)<1.5&&(a=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0,this.scrollDirection=i?this.getScrollOffset()<a?"forward":"backward":null,this.scrollOffset=a,this.isScrolling=i,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),"addEventListener"in this.scrollElement){let a=this.scrollElement,i=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},l=()=>{this._iosTouching=!1,!(!kM()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};a.addEventListener("touchstart",i,$d),a.addEventListener("touchend",l,$d),this.unsubs.push(()=>{a.removeEventListener("touchstart",i),a.removeEventListener("touchend",l),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let o=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,o&&this.scrollElement&&this.options.enabled){let[a,i,l]=o;if(a!==null){let{count:s,getItemKey:f}=this.options,c=0;for(;c<s&&f(c)!==a;)c++;let u=c<s?this.getMeasurements()[c]:void 0;if(u){let d=u.start+i-this.getScrollOffset();n0(d,0)||this.applyScrollAdjustment(d)}}l&&this.scrollToEnd({behavior:l})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let n=this.getScrollOffset(),r=this.getMaxScrollOffset();if(n<0||n>r)return;let o=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(n,{adjustments:this.scrollAdjustments+=o,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(n,r)=>{let o=new Map,a=new Map;for(let i=r-1;i>=0;i--){let l=n[i];if(o.has(l.lane))continue;let s=a.get(l.lane);if(s==null||l.end>s.end?a.set(l.lane,l):l.end<s.end&&o.set(l.lane,!0),o.size===this.options.lanes)break}return a.size===this.options.lanes?Array.from(a.values()).sort((i,l)=>i.end===l.end?i.index-l.index:i.end-l.end)[0]:void 0},this.getMeasurementOptions=Pa(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(n,r,o,a,i,l,s)=>(this.prevLanes!==void 0&&this.prevLanes!==l&&(this.lanesChangedFlag=!0),this.prevLanes=l,this.pendingMin=null,{count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s}),{key:!1}),this.getMeasurements=Pa(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s},f)=>{let c=this.itemSizeCache;if(!i)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>n)for(let h of this.laneAssignments.keys())h>=n&&this.laneAssignments.delete(h);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(h=>{this.itemSizeCache.set(h.key,h.size)}));let u=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===n&&(this.lanesSettling=!1),l===1){let h=this.options.gap,y=n*2,b=this._flatMeasurements;if(!b||b.length<y){let x=new Float64Array(y);b&&u>0&&x.set(b.subarray(0,u*2)),b=x,this._flatMeasurements=b}let m;if(u===0)m=r+o;else{let x=u-1;m=b[x*2]+b[x*2+1]+h}for(let x=u;x<n;x++){let I=a(x),v=c.get(I),w=typeof v=="number"?v:this.options.estimateSize(x);b[x*2]=m,b[x*2+1]=w,m+=w+h}let g=IM(n,b,a);return this.measurementsCache=g,g}let d=this.measurementsCache.slice(0,u),p=new Array(l).fill(void 0);for(let h=0;h<u;h++){let y=d[h];y&&(p[y.lane]=h)}for(let h=u;h<n;h++){let y=a(h),b=this.laneAssignments.get(h),m,g,x=s==="estimate"||c.has(y);if(b!==void 0&&this.options.lanes>1){m=b;let S=p[m],k=S!==void 0?d[S]:void 0;g=k?k.end+this.options.gap:r+o}else{let S=this.options.lanes===1?d[h-1]:this.getFurthestMeasurement(d,h);g=S?S.end+this.options.gap:r+o,m=S?S.lane:h%this.options.lanes,this.options.lanes>1&&x&&this.laneAssignments.set(h,m)}let I=c.get(y),v=typeof I=="number"?I:this.options.estimateSize(h),w=g+v;d[h]={index:h,start:g,size:v,end:w,key:y,lane:m},p[m]=h}return this.measurementsCache=d,d},{key:!1,debug:()=>this.options.debug}),this.calculateRange=Pa(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(n,r,o,a)=>this.range=n.length>0&&r>0?Dq({measurements:n,outerSize:r,scrollOffset:o,lanes:a,flat:a===1&&this._flatMeasurements!=null?this._flatMeasurements:null}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=Pa(()=>{let n=null,r=null,o=this.calculateRange();return o&&(n=o.startIndex,r=o.endIndex),this.maybeNotify.updateDeps([this.isScrolling,n,r]),[this.options.rangeExtractor,this.options.overscan,this.options.count,n,r]},(n,r,o,a,i)=>a===null||i===null?[]:n({startIndex:a,endIndex:i,overscan:r,count:o}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=n=>{let r=this.options.indexAttribute,o=n.getAttribute(r);return o?parseInt(o,10):(console.warn(`Missing attribute name '${r}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=n=>{var r;if(!this.scrollState||this.scrollState.behavior!=="smooth")return!0;let o=this.scrollState.index??((r=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))==null?void 0:r.index);if(o!==void 0&&this.range){let a=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),i=Math.max(0,o-a),l=Math.min(this.options.count-1,o+a);return n>=i&&n<=l}return!0},this.measureElement=n=>{if(!n){this.elementsCache.forEach((i,l)=>{i.isConnected||(this.observer.unobserve(i),this.elementsCache.delete(l))});return}let r=this.indexFromElement(n),o=this.options.getItemKey(r),a=this.elementsCache.get(o);a!==n&&(a&&this.observer.unobserve(a),this.observer.observe(n),this.elementsCache.set(o,n)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(r)&&this.resizeItem(r,this.options.measureElement(n,void 0,this))},this.resizeItem=(n,r)=>{var o,a;if(n<0||n>=this.options.count)return;let i,l,s,f=this._flatMeasurements;if(this.options.lanes===1&&f!==null)s=this.options.getItemKey(n),l=f[n*2],i=f[n*2+1];else{let d=this.measurementsCache[n];if(!d)return;s=d.key,l=d.start,i=d.size}let c=this.itemSizeCache.get(s)??i,u=r-c;if(u!==0){let d=this.options.anchorTo==="end"&&((o=this.scrollState)==null?void 0:o.behavior)!=="smooth"&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,p=d?this.getTotalSize():0,h=((a=this.scrollState)==null?void 0:a.behavior)!=="smooth"&&(this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[n]??{index:n,key:s,start:l,size:i,end:l+i,lane:0},u,this):l<this.getScrollOffset()+this.scrollAdjustments&&this.scrollDirection!=="backward");(this.pendingMin===null||n<this.pendingMin)&&(this.pendingMin=n),this.itemSizeCache.set(s,r),this.itemSizeCacheVersion++,d?this.applyScrollAdjustment(this.getTotalSize()-p):h&&this.applyScrollAdjustment(u),this.notify(!1)}},this.getVirtualItems=Pa(()=>[this.getVirtualIndexes(),this.getMeasurements()],(n,r)=>{let o=[];for(let a=0,i=n.length;a<i;a++){let l=n[a],s=r[l];o.push(s)}return o},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=n=>{let r=this.getMeasurements();if(r.length===0)return;let o=this._flatMeasurements,a=this.options.lanes===1&&o!=null,i=DM(0,r.length-1,a?l=>o[l*2]:l=>t0(r[l]).start,n);return t0(r[i])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let n=this.scrollElement.document.documentElement;return this.options.horizontal?n.scrollWidth-this.scrollElement.innerWidth:n.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(n=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=n,this.getOffsetForAlignment=(n,r,o=0)=>{if(!this.scrollElement)return 0;let a=this.getSize(),i=this.getScrollOffset();r==="auto"&&(r=n>=i+a?"end":"start"),r==="center"?n+=(o-a)/2:r==="end"&&(n-=a);let l=this.getMaxScrollOffset();return Math.max(Math.min(l,n),0)},this.getOffsetForIndex=(n,r="auto")=>{n=Math.max(0,Math.min(n,this.options.count-1));let o=this.getSize(),a=this.getScrollOffset(),i=this.measurementsCache[n];if(!i)return;if(r==="auto")if(i.end>=a+o-this.options.scrollPaddingEnd)r="end";else if(i.start<=a+this.options.scrollPaddingStart)r="start";else return[a,r];if(r==="end"&&n===this.options.count-1)return[this.getMaxScrollOffset(),r];let l=r==="end"?i.end+this.options.scrollPaddingEnd:i.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(l,r,i.size),r]},this.scrollToOffset=(n,{align:r="start",behavior:o="auto"}={})=>{let a=this.getOffsetForAlignment(n,r),i=this.now();this.scrollState={index:null,align:r,behavior:o,startedAt:i,lastTargetOffset:a,stableFrames:0},this._scrollToOffset(a,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollToIndex=(n,{align:r="auto",behavior:o="auto"}={})=>{n=Math.max(0,Math.min(n,this.options.count-1));let a=this.getOffsetForIndex(n,r);if(!a)return;let[i,l]=a,s=this.now();this.scrollState={index:n,align:l,behavior:o,startedAt:s,lastTargetOffset:i,stableFrames:0},this._scrollToOffset(i,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollBy=(n,{behavior:r="auto"}={})=>{let o=this.getScrollOffset()+n,a=this.now();this.scrollState={index:null,align:"start",behavior:r,startedAt:a,lastTargetOffset:o,stableFrames:0},this._scrollToOffset(o,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:n="auto"}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:"end",behavior:n});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:n})},this.getTotalSize=()=>{var n;let r=this.getMeasurements(),o;if(r.length===0)o=this.options.paddingStart;else if(this.options.lanes===1){let a=r.length-1,i=this._flatMeasurements;i!=null?o=i[a*2]+i[a*2+1]:o=((n=r[a])==null?void 0:n.end)??0}else{let a=Array(this.options.lanes).fill(null),i=r.length-1;for(;i>=0&&a.some(l=>l===null);){let l=r[i];a[l.lane]===null&&(a[l.lane]=l.end),i--}o=Math.max(...a.filter(l=>l!==null))}return Math.max(o-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let n=[];if(this.itemSizeCache.size===0)return n;let r=this.getMeasurements();for(let o of r)o&&this.itemSizeCache.has(o.key)&&n.push({index:o.index,key:o.key,start:o.start,size:o.size,end:o.end,lane:o.lane});return n},this._scrollToOffset=(n,{adjustments:r,behavior:o})=>{this._intendedScrollOffset=n+(r??0),this.options.scrollToFn(n,{behavior:o,adjustments:r},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(e)}applyScrollAdjustment(e,n){e!==0&&(kM()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=e:this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=e,behavior:n}))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId==null&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let r=this.scrollState.index!=null?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,o=r?r[0]:this.scrollState.lastTargetOffset,a=1,i=o!==this.scrollState.lastTargetOffset;if(!i&&n0(o,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=a){this.getScrollOffset()!==o&&this._scrollToOffset(o,{adjustments:void 0,behavior:"auto"}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,i){let l=this.getSize()||600,s=Math.abs(o-this.getScrollOffset()),f=this.scrollState.behavior==="smooth"&&s>l;this.scrollState.lastTargetOffset=o,f||(this.scrollState.behavior="auto"),this._scrollToOffset(o,{adjustments:void 0,behavior:f?"smooth":"auto"})}this.scheduleScrollReconcile()}},DM=(t,e,n,r)=>{for(;t<=e;){let o=(t+e)/2|0,a=n(o);if(a<r)t=o+1;else if(a>r)e=o-1;else return o}return t>0?t-1:0}});function Oq({useFlushSync:t=!0,...e}){let n=Po.useReducer(a=>a+1,0)[1],r={...e,onChange:(a,i)=>{var l;t&&i?(0,RM.flushSync)(n):n(),(l=e.onChange)==null||l.call(e,a,i)}},[o]=Po.useState(()=>new Zd(r));return o.setOptions(r),OM(()=>o._didMount(),[]),OM(()=>o._willUpdate()),o}function Lf(t){return Oq({observeElementRect:AM,observeElementOffset:TM,scrollToFn:MM,...t})}var Po,RM,OM,o0=F(()=>{Po=J(bt(),1),RM=J(Dp(),1);r0();r0();OM=typeof document<"u"?Po.useLayoutEffect:Po.useEffect});function BM({count:t,scrollRef:e,estimateSize:n,getItemKey:r,overscan:o=10}){return Lf({count:t,getScrollElement:()=>e.current,estimateSize:n,getItemKey:r,measureElement:a=>a.getBoundingClientRect().height,overscan:o,initialRect:{width:800,height:480}})}var EM=F(()=>{"use strict";o0()});function qf(t){return t instanceof wl||t instanceof qr?null:t instanceof qa?t.kind:Array.isArray(t)?"array":t!==null&&typeof t=="object"?"object":null}function l0(t){return t instanceof wl?Nq[t.tone]:typeof t=="string"?"xray-json-string":typeof t=="number"||t instanceof qr?"xray-json-number":typeof t=="boolean"?"xray-json-bool":t==null?"xray-json-null":"xray-json-punct"}function s0(t){return t instanceof wl?jr(t.text):t instanceof qr?t.raw:typeof t=="string"?jr(JSON.stringify(t)):t===void 0?"undefined":t===null?"null":String(t)}function f0(t,e){return t instanceof qa?t.children.map(n=>[n.key,n.value,n.label,n.name]):e==="array"?t.map((n,r)=>[r,n]):Object.entries(t)}function _M(t,e){return t==="array"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function zM(t,e){return t instanceof qa?t.count:e==="array"?t.length:Object.keys(t).length}function HM(t){return t instanceof qa&&t.label?(0,E.jsxs)("span",{className:"xray-json-typed xray-json-label",children:[t.label," "]}):null}function UM(t,e,n){return n!==void 0?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)("span",{className:"xray-json-key",children:jr(JSON.stringify(n))}),(0,E.jsx)("span",{className:"xray-json-punct",children:": "})]}):e!==void 0?e?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)("span",{className:"xray-json-key",children:jr(e)}),(0,E.jsx)("span",{className:"xray-json-punct",children:" "})]}):null:t===null?null:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:jr(JSON.stringify(t))}),(0,E.jsx)("span",{className:"xray-json-punct",children:": "})]})}function qq(t){let e=Zb("",[t]);return e.startsWith(".")?e.slice(1):e}function Pq(t,e){let n=e.trim().toLowerCase(),r=new Set,o=new Set,a=/[.[\]]/.test(n),i=PM,l=(s,f,c,u)=>{let d=qf(s);if(!d||u>=Eq)return!1;let p=!1;for(let[h,y]of f0(s,d)){if(--i<0)break;let b=f+_a+h,m=a?[...c,h]:c,g=a?Zb("",m).toLowerCase().includes(n):String(h).toLowerCase().includes(n);g&&r.add(b);let x=l(y,b,m,u+1);x&&o.add(b),(g||x)&&(p=!0)}return p};return l(t,"$",[],0)&&o.add("$"),{matched:r,ancestors:o,limited:i<0}}function _q(t,e,n,r){let o=[],a=(i,l,s,f,c,u,d,p)=>{let h=qf(l);if(!h){o.push({id:s,kind:"leaf",depth:c,nodeKey:i,label:d,name:p,value:l,segments:f});return}let y=e(s,c);if(o.push({id:s,kind:"branch",depth:c,nodeKey:i,label:d,name:p,value:l,segments:f,open:y}),!y)return;let b=f0(l,h);n&&!u&&(b=b.filter(([x])=>n.matched.has(s+_a+x)||n.ancestors.has(s+_a+x)));let m=r(s),g=b.length>m?b.slice(0,m):b;for(let[x,I,v,w]of g){let S=s+_a+x;a(x,I,S,[...f,x],c+1,u||!!n&&n.matched.has(S),v,w)}b.length>g.length&&o.push({id:s+Fq,kind:"more",depth:c+1,nodeKey:null,segments:f,parentId:s,hidden:b.length-g.length}),o.push({id:s+Lq,kind:"close",depth:c,nodeKey:null,segments:f,bracket:h==="array"?"]":"}"})};return a(null,t,"$",[],0,!1),o}function zq({value:t,isOpen:e,setOpen:n,filter:r,shown:o,showMore:a,selected:i,active:l,setActive:s,onSelect:f}){let c=ue.default.useMemo(()=>_q(t,e,r,o),[t,e,r,o]),u=ue.default.useRef(null),d=ue.default.useRef(null),p=c.filter(x=>x.kind!=="close"),h=x=>!!x&&p.some(I=>I.id===x),y=h(l)?l:h(i)?i:p[0]?.id??null;ue.default.useLayoutEffect(()=>{let x=d.current;if(x===null)return;d.current=null;let I=c[x];!I||I.kind==="close"||(I.id!==l&&s(I.id),u.current?.querySelector(`[data-row="${x}"]`)?.focus())});function b(x){x&&(x.id!==l&&s(x.id),u.current?.querySelector(`[data-row="${c.indexOf(x)}"]`)?.focus())}function m(x){if(x.kind==="more"&&x.parentId){a(x.parentId),d.current=c.indexOf(x);return}f(x)}function g(x){let I=x.target.closest("[data-row]");if(!I)return;let v=Number(I.dataset.row),w=c[v];if(!w)return;let S=p.indexOf(w);switch(x.key){case"ArrowDown":b(p[S+1]);break;case"ArrowUp":b(p[S-1]);break;case"Home":b(p[0]);break;case"End":b(p[p.length-1]);break;case"ArrowRight":if(w.kind!=="branch")return;w.open?c[v+1]&&c[v+1].depth>w.depth&&c[v+1].kind!=="close"&&b(c[v+1]):n(w.id,w.depth,!0);break;case"ArrowLeft":if(w.kind==="branch"&&w.open){n(w.id,w.depth,!1);break}for(let k=v-1;k>=0;k--)if(c[k].kind==="branch"&&c[k].depth===w.depth-1){b(c[k]);break}break;case"Enter":case" ":m(w);break;default:return}x.preventDefault()}return(0,E.jsx)("div",{className:"xray-json-tree-body",role:"tree","aria-label":"JSON viewer",ref:u,onKeyDown:g,children:c.map((x,I)=>{if(x.kind==="close")return(0,E.jsxs)("div",{className:"xray-json-row",role:"none","aria-hidden":"true",style:{paddingLeft:x.depth*14+8},children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),(0,E.jsx)("span",{className:"xray-json-punct",children:x.bracket})]},x.id);let v={"data-row":I,role:"treeitem","aria-level":x.depth+1,tabIndex:x.id===y?0:-1,onFocus:()=>{l!==x.id&&s(x.id)}};if(x.kind==="more")return(0,E.jsx)("div",{...v,className:"xray-json-row xray-json-flatrow xray-json-more-row",style:{paddingLeft:x.depth*14+8},onClick:()=>m(x),children:(0,E.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(x.hidden??0,tp)," more \xB7 ",x.hidden," hidden"]})},x.id);let w=UM(x.nodeKey,x.label,x.name),S=i===x.id;if(x.kind==="leaf")return(0,E.jsxs)("div",{...v,"aria-selected":S,className:"xray-json-row xray-json-flatrow",style:{paddingLeft:x.depth*14+8},onClick:()=>f(x),children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),w,(0,E.jsx)("span",{className:`xray-json-value ${l0(x.value)}`,children:s0(x.value)})]},x.id);let k=qf(x.value),M=zM(x.value,k),C=x.nodeKey===null?"value":qq(x.nodeKey);return(0,E.jsxs)("div",{...v,"aria-expanded":!!x.open,"aria-selected":S,className:"xray-json-row xray-json-flatrow xray-json-branch-row",style:{paddingLeft:x.depth*14},onClick:()=>f(x),onDoubleClick:()=>n(x.id,x.depth),children:[(0,E.jsx)("span",{className:"xray-json-toggle","aria-hidden":"true",title:`${x.open?"Collapse":"Expand"} ${C}`,onClick:_=>{_.stopPropagation(),s(x.id),n(x.id,x.depth)},onDoubleClick:_=>_.stopPropagation(),children:(0,E.jsx)(sa,{size:13,stroke:2.2,className:`xray-json-chevron ${x.open?"":"closed"}`})}),w,HM(x.value),(0,E.jsx)("span",{className:"xray-json-punct",children:k==="array"?"[":"{"}),!x.open&&(0,E.jsx)("span",{className:"xray-json-summary",children:_M(k,M)}),!x.open&&(0,E.jsx)("span",{className:"xray-json-punct",children:k==="array"?"]":"}"})]},x.id)})})}function VM({nodeKey:t,label:e,name:n,value:r,path:o,depth:a,isOpen:i,toggle:l}){let s=qf(r),f=UM(t,e,n);if(!s)return(0,E.jsxs)("div",{className:"xray-json-row",role:"treeitem",style:{paddingLeft:a*14+8},children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),f,(0,E.jsx)("span",{className:`xray-json-value ${l0(r)}`,children:s0(r)})]});let c=f0(r,s),u=i(o,a),d=s==="array"?["[","]"]:["{","}"],p=_M(s,zM(r,s));return(0,E.jsxs)("div",{className:"xray-json-node",role:"treeitem","aria-expanded":u,children:[(0,E.jsxs)("button",{className:"xray-json-row xray-json-branch",style:{paddingLeft:a*14},onClick:()=>l(o,a),children:[(0,E.jsx)(sa,{size:13,stroke:2.2,className:`xray-json-chevron ${u?"":"closed"}`}),f,HM(r),(0,E.jsx)("span",{className:"xray-json-punct",children:d[0]}),!u&&(0,E.jsx)("span",{className:"xray-json-summary",children:p}),!u&&(0,E.jsx)("span",{className:"xray-json-punct",children:d[1]})]}),u&&(0,E.jsxs)("div",{className:"xray-json-children",children:[c.map(([h,y,b,m])=>(0,E.jsx)(VM,{nodeKey:h,label:b,name:m,value:y,path:o+_a+h,depth:a+1,isOpen:i,toggle:l},h)),(0,E.jsxs)("div",{className:"xray-json-row",style:{paddingLeft:a*14+8},children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),(0,E.jsx)("span",{className:"xray-json-punct",children:d[1]})]})]})]})}function ep(t){return Math.min(t,GM)*14}function jq(t){return t.t==="str"?"xray-json-string":t.t==="num"?"xray-json-number":t.t==="bool"?"xray-json-bool":t.t==="null"?"xray-json-null":"xray-json-punct"}function Vq(t){return t.t==="str"?jr(JSON.stringify(t.value)):t.t==="num"?t.raw:t.t==="bool"?t.value?"true":"false":t.t==="null"?"null":t.t==="arr"?"[]":"{}"}function NM(t){return t===null?null:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:jr(JSON.stringify(t))}),(0,E.jsx)("span",{className:"xray-json-punct",children:": "})]})}function i0(t){return t>GM?(0,E.jsx)("span",{className:"xray-json-depth",title:`Nesting depth ${t}`,children:t}):null}function qM(t){return t.type==="node"&&t.dup?(0,E.jsx)("span",{className:"xray-json-tag dup",title:Uq,children:"duplicate"}):null}function Gq(t){return t?(0,E.jsx)("span",{className:"xray-json-tag inexact",title:t,children:"inexact in JS"}):null}var ue,E,FM,Rq,Bq,LM,tp,PM,Eq,_a,Fq,Lq,Nq,jM,Hq,GM,Uq,kH,QM=F(()=>{"use strict";ue=J(bt());Ar();Hb();aM();iM();Ro();dM();bM();EM();E=J(Te()),FM=6e4,Rq=4,Bq=1,LM=4,tp=100,PM=2e5,Eq=32,_a="\0",Fq=_a+"more",Lq=_a+"close";Nq={string:"xray-json-string",number:"xray-json-number",bool:"xray-json-bool",null:"xray-json-null",typed:"xray-json-typed",muted:"xray-json-muted"};jM=ue.default.memo(function({value:e,onSelectPath:n,filter:r=""}){let o=!!n,a=ue.default.useMemo(()=>!o&&zb(e,0,FM+1).length>FM,[e,o]),i=o?Bq:Rq,l=o?r.trim():"",s=ue.default.useMemo(()=>l?Pq(e,l):null,[e,l]),[f,c]=ue.default.useState(()=>new Map),[u,d]=ue.default.useState(null),[p,h]=ue.default.useState(null),[y,b]=ue.default.useState(null),[m,g]=ue.default.useState(()=>new Map),[x,I]=ue.default.useState({value:e,query:l}),v=!Object.is(x.value,e);(v||x.query!==l)&&(v&&(d(null),h(null),b(null)),I({value:e,query:l}),c(new Map),g(new Map));let w=ue.default.useCallback((L,A)=>u!==null?u&&(!o||A<LM):s?.ancestors.has(L)?!0:A<i,[u,o,s,i]),S=ue.default.useCallback((L,A)=>{let T=f.get(L);return T!==void 0?T:w(L,A)},[f,w]),k=ue.default.useCallback((L,A,T)=>{c(H=>{let U=new Map(H),de=H.get(L)??w(L,A);return U.set(L,T??!de),U})},[w]),M=ue.default.useCallback(L=>m.get(L)??tp,[m]),C=ue.default.useCallback(L=>{g(A=>new Map(A).set(L,(A.get(L)??tp)+tp))},[]),_=(0,E.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,E.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{d(!0),c(new Map)},title:o?`Expand nodes up to ${LM} levels deep`:"Expand all nodes",children:[(0,E.jsx)(bu,{size:13,stroke:2}),"Expand all"]}),(0,E.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{d(!1),c(new Map)},title:"Collapse all nodes",children:[(0,E.jsx)(Iu,{size:13,stroke:2}),"Collapse all"]})]});if(a){let L=zb(e);return(0,E.jsx)("pre",{className:"xray-json xray-json-editor xray-json-text",children:jr(L)})}return qf(e)===null?(0,E.jsx)("pre",{className:"xray-json xray-json-scalar",children:(0,E.jsx)("span",{className:l0(e),children:s0(e)})}):o?(0,E.jsxs)("div",{className:"xray-json xray-json-tree is-selectable",children:[_,s?.limited&&(0,E.jsxs)("p",{className:"xray-json-empty",children:["Filter limited to the first ",PM.toLocaleString("en-US")," nodes."]}),s&&!s.ancestors.has("$")?(0,E.jsxs)("p",{className:"xray-json-empty",children:["No keys or paths match \u201C",l,"\u201D."]}):(0,E.jsx)(zq,{value:e,isOpen:S,setOpen:k,filter:s,shown:M,showMore:C,selected:p,active:y,setActive:b,onSelect:L=>{h(L.id),n?.(L.segments)}})]}):(0,E.jsxs)("div",{className:"xray-json xray-json-tree",role:"tree","aria-label":"JSON viewer",children:[_,(0,E.jsx)("div",{className:"xray-json-tree-body",children:(0,E.jsx)(VM,{nodeKey:null,value:e,path:"$",depth:0,isOpen:S,toggle:(L,A)=>k(L,A)})})]})});Hq=19,GM=40,Uq="This key repeats an earlier key of the same object. JSON.parse keeps only the last value, at the first key\u2019s position.";kH=ue.default.memo(function({root:e,label:n="JSON viewer",notes:r}){let[o,a]=ue.default.useState(Yd),[i,l]=ue.default.useState(0),[s,f]=ue.default.useState(e),c=s!==e;c&&(f(e),a(Yd()),l(0));let u=c?null:o,d=ue.default.useMemo(()=>sM(e,u??Yd()),[e,u]),p=ue.default.useRef(null),h=ue.default.useRef(null),y=BM({count:d.length,scrollRef:p,estimateSize:()=>Hq,getItemKey:A=>d[A]?uM(d[A]):A,overscan:12}),b=ue.default.useCallback((A,T,H)=>{a(U=>({...U,overrides:new Map(U.overrides).set(A,H??!e0(U,A,T))}))},[]),m=A=>{a(T=>({...T,shown:new Map(T.shown).set(A,(T.shown.get(A)??100)+100)}))},g=()=>a(A=>({...A,budget:A.budget+2e4})),x=A=>a(T=>({...T,all:A,overrides:new Map,budget:2e4})),I=ue.default.useCallback(()=>{let A=h.current;if(A===null)return;let T=p.current?.querySelector(`[data-index="${A}"]`);T&&(h.current=null,T.focus({preventScroll:!0}))},[]);ue.default.useLayoutEffect(()=>{I()});let v=A=>A>=0&&A<d.length&&d[A].type!=="close",w=(A,T)=>{for(let H=A+T;H>=0&&H<d.length;H+=T)if(v(H))return H;return-1};function S(A){v(A)&&(l(A),h.current=A,y.scrollToIndex(A,{align:"auto"}),I())}function k(A){A.type==="node"&&A.open!==null?b(A.node,A.depth):A.type==="more"?m(A.node):A.type==="budget"&&g()}function M(A){let T=A.target.closest("[data-index]");if(!T)return;let H=Number(T.dataset.index),U=d[H];if(U){switch(A.key){case"ArrowDown":S(w(H,1));break;case"ArrowUp":S(w(H,-1));break;case"Home":S(w(-1,1));break;case"End":S(w(d.length,-1));break;case"ArrowRight":if(U.type!=="node"||U.open===null)return;U.open?S(w(H,1)):b(U.node,U.depth,!0);break;case"ArrowLeft":if(U.type==="node"&&U.open===!0){b(U.node,U.depth,!1);break}for(let de=H-1;de>=0;de--){let ee=d[de];if(ee.type==="node"&&ee.depth===U.depth-1){S(de);break}}break;case"Enter":case" ":k(U);break;default:return}A.preventDefault()}}let C=y.getVirtualItems(),_=C.some(A=>A.index===i&&v(i))?i:C.find(A=>v(A.index))?.index??-1;function L(A,T,H,U){let de={transform:`translateY(${H}px)`};if(A.type==="close")return(0,E.jsxs)("div",{"data-index":T,ref:y.measureElement,className:"xray-json-row xray-json-vrow",role:"none","aria-hidden":"true",style:{...de,paddingLeft:ep(A.depth)+8},children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),i0(A.depth),(0,E.jsx)("span",{className:"xray-json-punct",children:A.node.t==="arr"?"]":"}"})]},U);let ee={"data-index":T,ref:y.measureElement,role:"treeitem","aria-level":A.depth+1,tabIndex:T===_?0:-1,onFocus:()=>{i!==T&&l(T)}};if(A.type==="more"||A.type==="budget")return(0,E.jsx)("div",{...ee,className:`xray-json-row xray-json-vrow xray-json-flatrow ${A.type==="more"?"xray-json-more-row":"xray-json-budget-row"}`,style:{...de,paddingLeft:ep(A.depth)+8},onClick:()=>k(A),children:A.type==="more"?(0,E.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(A.hidden,100)," more \xB7 ",A.hidden.toLocaleString("en-US")," hidden"]}):(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",2e4.toLocaleString("en-US")," more rows"]}),(0,E.jsxs)("span",{className:"xray-json-muted",children:["The tree stops after ",(u?.budget??2e4).toLocaleString("en-US")," rows; Raw has the whole text."]})]})},U);let Me=A.node;if(A.open!==null){let Je=Me;return(0,E.jsxs)("div",{...ee,"aria-expanded":A.open,className:"xray-json-row xray-json-vrow xray-json-flatrow xray-json-branch-row",style:{...de,paddingLeft:ep(A.depth)},onClick:()=>{window.getSelection?.()?.toString()||(l(T),b(Je,A.depth))},children:[(0,E.jsx)(sa,{size:13,stroke:2.2,"aria-hidden":"true",className:`xray-json-chevron ${A.open?"":"closed"}`}),i0(A.depth),NM(A.key),qM(A),(0,E.jsx)("span",{className:"xray-json-punct",children:Je.t==="arr"?"[":"{"}),!A.open&&(0,E.jsx)("span",{className:"xray-json-summary",children:cM(Je)}),!A.open&&(0,E.jsx)("span",{className:"xray-json-punct",children:Je.t==="arr"?"]":"}"})]},U)}let Hn=Me.t==="num"?fM(Me):null;return(0,E.jsxs)("div",{...ee,className:`xray-json-row xray-json-vrow xray-json-flatrow${Hn?" has-hint":""}`,style:{...de,paddingLeft:ep(A.depth)+8},children:[(0,E.jsx)("span",{className:"xray-json-gutter"}),i0(A.depth),NM(A.key),qM(A),(0,E.jsx)("span",{className:`xray-json-value ${jq(Me)}`,children:Vq(Me)}),Gq(Hn)]},U)}return(0,E.jsxs)("div",{className:"xray-json xray-json-tree is-virtual",children:[(0,E.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,E.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>x(!0),title:`Expand all nodes (${2e4.toLocaleString("en-US")} rows at a time)`,children:[(0,E.jsx)(bu,{size:13,stroke:2}),"Expand all"]}),(0,E.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>x(!1),title:"Collapse all nodes",children:[(0,E.jsx)(Iu,{size:13,stroke:2}),"Collapse all"]}),r]}),(0,E.jsx)("div",{ref:p,className:"xray-json-vscroll",children:(0,E.jsx)("div",{className:"xray-json-vlist",role:"tree","aria-label":n,style:{height:y.getTotalSize()},onKeyDown:M,children:C.map(A=>L(d[A.index],A.index,A.start,A.key))})})]})})});function KM({result:t,rows:e,sort:n,onSort:r,pkColumns:o,inspected:a,onInspect:i}){let l=(0,Mt.useRef)(null),s=(0,Mt.useMemo)(()=>JT(t.columns,t.rows,WM),[t.columns,t.rows]),[f,c]=(0,Mt.useState)({}),u=(0,Mt.useMemo)(()=>s.map((T,H)=>f[H]??T),[s,f]),d=$T(e.length,WM),[p,h]=(0,Mt.useState)({row:0,col:0}),[y,b]=(0,Mt.useState)(0),m=(0,Mt.useRef)(null),[,g]=(0,Mt.useState)(0),x=(0,Mt.useRef)(null),I=Lf({count:e.length,getScrollElement:()=>l.current,estimateSize:()=>XM,overscan:12,initialRect:{width:1e3,height:400}}),v=Lf({horizontal:!0,count:t.columns.length,getScrollElement:()=>l.current,estimateSize:T=>u[T]??120,overscan:3,initialRect:{width:1e3,height:400}});(0,Mt.useEffect)(()=>{v.measure()},[v,u]);let w=Math.min(p.row,Math.max(0,e.length-1)),S=Math.min(p.col,Math.max(0,t.columns.length-1)),k=Math.min(y,Math.max(0,t.columns.length-1));(0,Mt.useEffect)(()=>{let T=m.current;if(!T)return;m.current=null;let H=T==="head"?`[data-head="${k}"]`:`[data-cell="${w}:${S}"]`;l.current?.querySelector(H)?.focus({preventScroll:!0})});let M=d+v.getTotalSize(),C=v.getVirtualItems();function _(T,H){g(ee=>ee+1);let U=Math.max(0,Math.min(t.columns.length-1,H));if(v.scrollToIndex(U),T<0||!e.length){b(U),l.current&&(l.current.scrollTop=0),m.current="head";return}let de=Math.min(e.length-1,T);h({row:de,col:U}),I.scrollToIndex(de),m.current="cell"}function L(T){let H={ArrowLeft:k-1,ArrowRight:k+1,Home:0,End:t.columns.length-1};T.key in H?(T.preventDefault(),_(-1,H[T.key])):T.key==="ArrowDown"&&e.length?(T.preventDefault(),_(0,k)):(T.key==="Enter"||T.key===" ")&&(T.preventDefault(),r(k))}function A(T){let H=T.target;if(H.getAttribute("role")==="columnheader"){L(T);return}if(H.getAttribute("role")!=="gridcell")return;let U=Math.max(1,Math.floor((l.current?.clientHeight??400)/XM)-2),ee={ArrowUp:[w-1,S],ArrowDown:[w+1,S],ArrowLeft:[w,S-1],ArrowRight:[w,S+1],PageUp:[Math.max(0,w-U),S],PageDown:[w+U,S],Home:[w,0],End:[w,t.columns.length-1]}[T.key];ee?(T.preventDefault(),_(ee[0],ee[1])):T.key==="Enter"&&(T.preventDefault(),i({row:w,col:S}))}return(0,dt.jsx)("div",{ref:l,className:"xray-sql-grid",role:"grid","aria-label":"Query results","aria-rowcount":e.length+1,"aria-colcount":t.columns.length+1,onKeyDown:A,children:(0,dt.jsxs)("div",{style:{width:M,height:Pf+I.getTotalSize(),position:"relative"},children:[(0,dt.jsxs)("div",{className:"xray-sql-grid-head",role:"row","aria-rowindex":1,style:{width:M,height:Pf},children:[(0,dt.jsx)("div",{className:"xray-sql-grid-index",role:"columnheader",style:{width:d,height:Pf},children:"#"}),C.map(T=>{let H=t.columns[T.index],U=n?.col===T.index?n.dir:null,de=o.has(H.name);return(0,dt.jsxs)("div",{className:`xray-sql-grid-th${U?" sorted":""}`,role:"columnheader","aria-colindex":T.index+2,"aria-sort":U==="asc"?"ascending":U==="desc"?"descending":"none",tabIndex:k===T.index?0:-1,"data-head":T.index,onFocus:()=>b(T.index),title:`${H.name}${H.type?` ${H.type}`:""} \u2014 click to sort`,style:{left:d+T.start,width:T.size,height:Pf},onClick:()=>{b(T.index),r(T.index)},children:[(0,dt.jsxs)("span",{className:"xray-sql-th-name",children:[de&&(0,dt.jsx)(sx,{size:12,stroke:2,role:"img","aria-label":"primary key",className:"xray-sql-th-key"}),(0,dt.jsx)("span",{className:"xray-sql-th-label",children:H.name}),U&&(U==="asc"?(0,dt.jsx)(tx,{size:12,stroke:2.2,"aria-hidden":"true",className:"xray-sql-th-sort"}):(0,dt.jsx)(ex,{size:12,stroke:2.2,"aria-hidden":"true",className:"xray-sql-th-sort"}))]}),(0,dt.jsx)("span",{className:"xray-sql-th-type",children:Jb(H.type)}),(0,dt.jsx)("span",{className:"xray-sql-col-resize","aria-hidden":"true",onClick:ee=>ee.stopPropagation(),onDoubleClick:ee=>{ee.stopPropagation(),c(({[T.index]:Me,...Hn})=>Hn)},onPointerDown:ee=>{ee.button===0&&(ee.preventDefault(),ee.stopPropagation(),ee.currentTarget.setPointerCapture(ee.pointerId),x.current={col:T.index,startX:ee.clientX,startWidth:u[T.index]})},onPointerMove:ee=>{let Me=x.current;if(!Me||Me.col!==T.index)return;let Hn=Math.max(KT,Math.round(Me.startWidth+ee.clientX-Me.startX));c(Je=>Je[Me.col]===Hn?Je:{...Je,[Me.col]:Hn})},onPointerUp:ee=>{x.current=null,ee.currentTarget.releasePointerCapture(ee.pointerId)},onPointerCancel:()=>{x.current=null}})]},T.key)})]}),I.getVirtualItems().map(T=>{let H=e[T.index];return(0,dt.jsxs)("div",{className:`xray-sql-grid-row${a?.row===T.index?" inspected":""}`,role:"row","aria-rowindex":T.index+2,style:{top:Pf+T.start,height:T.size,width:M},children:[(0,dt.jsx)("div",{className:"xray-sql-grid-index",role:"rowheader",style:{width:d,height:T.size},children:T.index+1}),C.map(U=>{let de=Eo(H[U.index]??null,t.columns[U.index].type),ee=a?.row===T.index&&a.col===U.index,Me=w===T.index&&S===U.index;return(0,dt.jsx)("div",{role:"gridcell","aria-colindex":U.index+2,"aria-selected":ee,tabIndex:Me?0:-1,"data-cell":`${T.index}:${U.index}`,onFocus:()=>{Me||h({row:T.index,col:U.index})},className:`xray-sql-grid-cell kind-${de.kind}${ee?" selected":""}`,style:{left:d+U.start,width:U.size,height:T.size},onClick:()=>{h({row:T.index,col:U.index}),i({row:T.index,col:U.index})},children:de.text.length>400?de.text.slice(0,400):de.text},U.key)})]},T.key)})]})})}var Mt,dt,XM,Pf,Qq,WM,YM=F(()=>{"use strict";Mt=J(bt());o0();Ar();Pr();$b();dt=J(Te()),XM=26,Pf=40,Qq=7.3,WM=t=>t.length*Qq});function Xq(t,e,n){if(t==="INSERT"){let{text:o,truncatedBlobs:a}=kA(n,e.columns,e.rows,zr(N.getState().connection));return{text:o,truncated:a}}return{text:t==="CSV"?vA(e.columns,e.rows):wA(e.columns,e.rows),truncated:SA(e.rows)}}function Wq({result:t,rows:e,cell:n,onClose:r,onToast:o}){let a=t.columns[n.col],i=e[n.row]?.[n.col]??null,l=Eo(i,a?.type),s=it.default.useMemo(()=>{if(l.kind!=="json")return null;let c=Oo(l.text);return c.ok?{value:Ad(c.root)}:null},[l.kind,l.text]);async function f(){let{text:c,truncatedBlob:u}=oM(i,a?.type);try{await navigator.clipboard.writeText(c)}catch{o("Could not copy to the clipboard.");return}u?o("Copied the value.",ib(1)):o("Copied the value.")}return(0,j.jsxs)("aside",{className:"xray-sql-inspector","aria-label":"Cell inspector",children:[(0,j.jsxs)("header",{className:"xray-sql-inspector-head",children:[(0,j.jsxs)("span",{className:"xray-sql-inspector-title",children:[a?.name??""," ",(0,j.jsxs)("span",{className:"xray-sql-muted",children:["row ",n.row+1," \xB7 ",l.kind]})]}),(0,j.jsxs)("button",{className:"xray-btn xray-btn-sm",onClick:()=>{f()},children:[(0,j.jsx)(rx,{size:13,stroke:1.8,"aria-hidden":"true"}),"Copy value"]}),(0,j.jsx)("button",{className:"xray-icon-btn","aria-label":"Close cell inspector",title:"Close (Escape)",onClick:r,children:(0,j.jsx)(fa,{size:14,stroke:1.8})})]}),(0,j.jsxs)("div",{className:"xray-sql-inspector-body",children:[s?(0,j.jsx)(jM,{value:s.value}):(0,j.jsx)("pre",{className:"xray-sql-inspector-text",children:l.text}),l.truncated&&(0,j.jsx)("p",{className:"xray-sql-muted",children:"Showing the first 65,536 characters."})]})]})}function JM(){let t=N(l=>l.tabs.find(s=>s.id===l.activeTabId)?.maxRows??1e3),e=N(l=>l.setMaxRows),[n,r]=(0,it.useState)(String(t)),[o,a]=(0,it.useState)(t);o!==t&&(a(t),r(String(t)));function i(){let l=hl(Number(n));e(l),r(String(l))}return(0,j.jsxs)("label",{className:"xray-sql-field xray-sql-max-rows-field",title:"The most rows a query returns (1\u201350,000)",children:[(0,j.jsx)("span",{children:"Max rows"}),(0,j.jsx)("input",{className:"xray-input xray-sql-max-rows",type:"number",min:1,max:5e4,value:n,onChange:l=>r(l.target.value),onBlur:i,onKeyDown:l=>{l.key==="Enter"&&i()}})]})}function Kq(){let t=N(C=>C.result),e=N(C=>C.resultTable),n=N(C=>C.schema),r=N(C=>C.rowFilter),o=N(C=>C.gridView),{setRowFilter:a,setGridView:i}=N.getState(),[l,s]=(0,it.useState)(!$M),[f,c]=(0,it.useState)(null),u=(0,it.useRef)(null),d=(0,it.useRef)(null);(0,it.useEffect)(()=>()=>{u.current&&clearTimeout(u.current)},[]);let p=t?tM(t.columns):"",h=o.key===p?o:{key:p,sort:null,inspected:null},y=(0,it.useMemo)(()=>t?eM(t.rows,t.columns,r,h.sort):[],[t,r,h.sort]),b=(0,it.useMemo)(()=>t?y.map(C=>t.rows[C]):[],[t,y]),m=(0,it.useMemo)(()=>nM(n,e),[n,e]);if(!t)return(0,j.jsxs)("div",{className:"xray-sql-results",children:[(0,j.jsx)("div",{className:"xray-sql-results-head",children:(0,j.jsx)(JM,{})}),(0,j.jsx)("p",{className:"xray-sql-empty",children:"Run a query, or click a table on the left to preview it."})]});let g=h.inspected?y.indexOf(h.inspected.row):-1,x=h.inspected&&g>=0?{row:g,col:h.inspected.col}:null,I=r.trim()!=="";function v(...C){c(C),u.current&&clearTimeout(u.current),u.current=setTimeout(()=>c(null),4e3)}async function w(C){if(!t)return;let{text:_,truncated:L}=Xq(C,{...t,rows:b},e??"query_result");try{await navigator.clipboard.writeText(_)}catch{v("Could not copy to the clipboard.");return}let A=`Copied ${b.length} rows as ${C}.`;L?v(A,ib(L)):v(A)}function S(C){$M=!0,s(!1),i({...h,inspected:{row:y[C.row],col:C.col}})}function k(){i({...h,inspected:null}),d.current?.querySelector('[role="gridcell"][tabindex="0"]')?.focus()}let M=t.columns.length>0;return(0,j.jsxs)("div",{className:"xray-sql-results",children:[(0,j.jsxs)("div",{className:"xray-sql-results-head",children:[(0,j.jsxs)("span",{className:"xray-sql-results-summary",children:[I&&M?rM(b.length,t.rows.length,t.durationMs):Lb(t),t.hasMore?" \xB7 more rows available, Run with higher limit":""]}),(0,j.jsx)(JM,{}),M&&(0,j.jsxs)("label",{className:"xray-sql-filter",children:[(0,j.jsx)(ix,{size:13,stroke:1.8,"aria-hidden":"true"}),(0,j.jsx)("input",{className:"xray-input",type:"search","aria-label":"Filter rows",placeholder:"Filter rows",title:"Filter the loaded rows (Escape clears)",value:r,onChange:C=>a(C.target.value),onKeyDown:C=>{C.key==="Escape"&&r&&(C.preventDefault(),C.stopPropagation(),a(""))}})]}),M&&l&&!f&&(0,j.jsx)("span",{className:"xray-sql-hint",children:"Click a cell to inspect it"}),(0,j.jsx)("span",{className:"xray-spacer"}),f&&(0,j.jsx)("span",{className:"xray-sql-toast",role:"status",children:f.map(C=>(0,j.jsx)("span",{className:"xray-sql-toast-line",children:C},C))}),M&&(0,j.jsxs)("div",{className:"xray-sql-copy",role:"group","aria-label":"Copy results",children:[(0,j.jsx)("span",{className:"xray-sql-muted",children:"Copy"}),["CSV","JSON","INSERT"].map(C=>(0,j.jsx)("button",{className:"xray-btn xray-btn-sm",onClick:()=>{w(C)},"aria-label":`Copy as ${C}`,children:C},C))]})]}),M?(0,j.jsxs)("div",{ref:d,className:"xray-sql-results-body",onKeyDown:C=>{C.key==="Escape"&&x&&(C.preventDefault(),k())},children:[(0,j.jsx)(KM,{result:t,rows:b,sort:h.sort,onSort:C=>i({...h,sort:ZT(h.sort,C)}),pkColumns:m,inspected:x,onInspect:S},p),x&&(0,j.jsx)(Wq,{result:t,rows:b,cell:x,onClose:k,onToast:v})]}):(0,j.jsx)("p",{className:"xray-sql-empty",children:"The statement returned no rows."})]})}function Yq(){let t=N(r=>r.messages),e=N(r=>r.error),n=(0,it.useRef)(null);return(0,it.useEffect)(()=>{n.current?.scrollIntoView({block:"nearest"})},[t]),(0,j.jsxs)("div",{className:"xray-sql-messages",role:"log","aria-label":"Messages",children:[t.length===0&&(0,j.jsx)("p",{className:"xray-sql-empty",children:"No messages yet."}),t.map((r,o)=>(0,j.jsx)("div",{className:`xray-sql-message${e&&o===t.length-1&&r.endsWith(e.message)?" error":""}`,children:r},o)),e&&(e.hint||e.detail)&&(0,j.jsx)("div",{className:"xray-sql-message xray-sql-muted",children:[e.hint,e.detail].filter(Boolean).join(" \xB7 ")}),(0,j.jsx)("div",{ref:n})]})}function Jq(){let t=N(r=>r.history),e=N(r=>r.connection),{updateTabSql:n}=N.getState();return e?t.length?(0,j.jsx)("ul",{className:"xray-sql-history","aria-label":"Query history",children:t.map((r,o)=>(0,j.jsx)("li",{children:(0,j.jsxs)("button",{className:"xray-sql-history-item",title:"Load into the editor",onClick:()=>{let a=N.getState();n(a.activeTabId,r.sql)},children:[(0,j.jsx)("code",{className:"xray-sql-history-sql",children:r.sql}),(0,j.jsxs)("span",{className:`xray-sql-history-meta${r.ok?"":" error"}`,children:[new Date(r.at).toLocaleTimeString()," \xB7"," ",r.ok?`${r.rowCount??0} rows \xB7 ${r.durationMs} ms`:r.error??"failed"]})]})},`${r.at}-${o}`))}):(0,j.jsxs)("p",{className:"xray-sql-empty",children:["Queries you run on ",e.name," appear here."]}):(0,j.jsx)("p",{className:"xray-sql-empty",children:"History is kept per database file."})}function ZM(){let t=N(r=>r.bottomTab),e=N(r=>!!r.running),n=N(r=>r.setBottomTab);return(0,j.jsxs)("section",{className:"xray-sql-bottom","aria-label":"Output",children:[(0,j.jsxs)("div",{className:"xray-sql-bottom-tabs",role:"tablist","aria-label":"Output",children:[$q.map(r=>(0,j.jsx)("button",{role:"tab",id:`xray-sql-tab-${r.id}`,"aria-selected":t===r.id,"aria-controls":"xray-sql-bottom-panel",className:`xray-tab${t===r.id?" active":""}`,onClick:()=>n(r.id),children:r.label},r.id)),(0,j.jsx)("span",{className:"xray-spacer"}),e&&(0,j.jsx)("span",{className:"xray-sql-running",role:"status",children:"Running\u2026"})]}),(0,j.jsxs)("div",{className:"xray-sql-bottom-panel",id:"xray-sql-bottom-panel",role:"tabpanel","aria-labelledby":`xray-sql-tab-${t}`,children:[t==="results"&&(0,j.jsx)(Kq,{}),t==="messages"&&(0,j.jsx)(Yq,{}),t==="history"&&(0,j.jsx)(Jq,{})]})]})}var it,j,$M,$q,eD=F(()=>{"use strict";it=J(bt());Ar();Fa();Pr();Ro();$b();QM();YM();j=J(Te());$M=!1;$q=[{id:"results",label:"Results"},{id:"messages",label:"Messages"},{id:"history",label:"History"}]});function h0(t,e){return({state:n,dispatch:r})=>{if(n.readOnly)return!1;let o=t(e,n);return o?(r(n.update(o)),!0):!1}}function x0(t,e){let n=t.languageDataAt("commentTokens",e,1);return n.length?n[0]:{}}function r6(t,{open:e,close:n},r,o){let a=t.sliceDoc(r-_f,r),i=t.sliceDoc(o,o+_f),l=/\s*$/.exec(a)[0].length,s=/^\s*/.exec(i)[0].length,f=a.length-l;if(a.slice(f-e.length,f)==e&&i.slice(s,s+n.length)==n)return{open:{pos:r-l,margin:l&&1},close:{pos:o+s,margin:s&&1}};let c,u;o-r<=2*_f?c=u=t.sliceDoc(r,o):(c=t.sliceDoc(r,r+_f),u=t.sliceDoc(o-_f,o));let d=/^\s*/.exec(c)[0].length,p=/\s*$/.exec(u)[0].length,h=u.length-p-n.length;return c.slice(d,d+e.length)==e&&u.slice(h,h+n.length)==n?{open:{pos:r+d+e.length,margin:/\s/.test(c.charAt(d+e.length))?1:0},close:{pos:o-p-n.length,margin:/\s/.test(u.charAt(h-1))?1:0}}:null}function o6(t){let e=[];for(let n of t.selection.ranges){let r=t.doc.lineAt(n.from),o=n.to<=r.to?r:t.doc.lineAt(n.to);o.from>r.from&&o.from==n.to&&(o=n.to==r.to+1?r:t.doc.lineAt(n.to-1));let a=e.length-1;a>=0&&e[a].to>r.from?e[a].to=o.to:e.push({from:r.from+/^\s*/.exec(r.text)[0].length,to:o.to})}return e}function fD(t,e,n=e.selection.ranges){let r=n.map(a=>x0(e,a.from).block);if(!r.every(a=>a))return null;let o=n.map((a,i)=>r6(e,r[i],a.from,a.to));if(t!=2&&!o.every(a=>a))return{changes:e.changes(n.map((a,i)=>o[i]?[]:[{from:a.from,insert:r[i].open+" "},{from:a.to,insert:" "+r[i].close}]))};if(t!=1&&o.some(a=>a)){let a=[];for(let i=0,l;i<o.length;i++)if(l=o[i]){let s=r[i],{open:f,close:c}=l;a.push({from:f.pos-s.open.length,to:f.pos+f.margin},{from:c.pos-c.margin,to:c.pos+s.close.length})}return{changes:a}}return null}function a6(t,e,n=e.selection.ranges){let r=[],o=-1;e:for(let{from:a,to:i}of n){let l=r.length,s=1e9,f;for(let c=a;c<=i;){let u=e.doc.lineAt(c);if(f==null&&(f=x0(e,u.from).line,!f))continue e;if(u.from>o&&(a==i||i>u.from)){o=u.from;let d=/^\s*/.exec(u.text)[0].length,p=d==u.length,h=u.text.slice(d,d+f.length)==f?d:-1;d<u.text.length&&d<s&&(s=d),r.push({line:u,comment:h,token:f,indent:d,empty:p,single:!1})}c=u.to+1}if(s<1e9)for(let c=l;c<r.length;c++)r[c].indent<r[c].line.text.length&&(r[c].indent=s);r.length==l+1&&(r[l].single=!0)}if(t!=2&&r.some(a=>a.comment<0&&(!a.empty||a.single))){let a=[];for(let{line:l,token:s,indent:f,empty:c,single:u}of r)(u||!c)&&a.push({from:l.from+f,insert:s+" "});let i=e.changes(a);return{changes:i,selection:e.selection.map(i,1)}}else if(t!=1&&r.some(a=>a.comment>=0)){let a=[];for(let{line:i,comment:l,token:s}of r)if(l>=0){let f=i.from+l,c=f+s.length;i.text[c-i.from]==" "&&c++,a.push({from:f,to:c})}return{changes:a}}return null}function dD(t={}){return[uD,cD.of(t),V.domEventHandlers({beforeinput(e,n){let r=e.inputType=="historyUndo"?pD:e.inputType=="historyRedo"?d0:null;return r?(e.preventDefault(),r(n)):!1}})]}function op(t,e){return function({state:n,dispatch:r}){if(!e&&n.readOnly)return!1;let o=n.field(uD,!1);if(!o)return!1;let a=o.pop(t,n,e);return a?(r(a),!0):!1}}function rp(t,e,n,r){let o=e+1>n+20?e-n-1:0,a=t.slice(o,e);return a.push(r),a}function c6(t,e){let n=[],r=!1;return t.iterChangedRanges((o,a)=>n.push(o,a)),e.iterChangedRanges((o,a,i,l)=>{for(let s=0;s<n.length;){let f=n[s++],c=n[s++];l>=f&&i<=c&&(r=!0)}}),r}function u6(t,e){return t.ranges.length==e.ranges.length&&t.ranges.filter((n,r)=>n.empty!=e.ranges[r].empty).length===0}function mD(t,e){return t.length?e.length?t.concat(e):t:e}function hD(t,e){if(t.length){let n=t[t.length-1],r=n.selectionsAfter.slice(Math.max(0,n.selectionsAfter.length-d6));return r.length&&r[r.length-1].eq(e)?t:(r.push(e),rp(t,t.length-1,1e9,n.setSelAfter(r)))}else return[Pn.selection([e])]}function p6(t){let e=t[t.length-1],n=t.slice();return n[t.length-1]=e.setSelAfter(e.selectionsAfter.slice(0,e.selectionsAfter.length-1)),n}function c0(t,e){if(!t.length)return t;let n=t.length,r=kn;for(;n;){let o=m6(t[n-1],e,r);if(o.changes&&!o.changes.empty||o.effects.length){let a=t.slice(0,n);return a[n-1]=o,a}else e=o.mapped,n--,r=o.selectionsAfter}return r.length?[Pn.selection(r)]:kn}function m6(t,e,n){let r=mD(t.selectionsAfter.length?t.selectionsAfter.map(l=>l.map(e)):kn,n);if(!t.changes)return Pn.selection(r);let o=t.changes.map(e),a=e.mapDesc(t.changes,!0),i=t.mapped?t.mapped.composeDesc(a):a;return new Pn(o,le.mapEffects(t.effects,e),i,t.startSelection.map(a),r)}function Sl(t,e){return B.create(t.ranges.map(e),t.mainIndex)}function _n(t,e){return t.update({selection:e,scrollIntoView:!0,userEvent:"select"})}function zn({state:t,dispatch:e},n){let r=Sl(t.selection,n);return r.eq(t.selection,!0)?!1:(e(_n(t,r)),!0)}function ap(t,e){return B.cursor(e?t.to:t.from)}function gD(t,e){return zn(t,n=>n.empty?t.moveByChar(n,e):ap(n,e))}function yt(t){return t.textDirectionAt(t.state.selection.main.head)==ge.LTR}function ID(t,e){return zn(t,n=>n.empty?t.moveByGroup(n,e):ap(n,e))}function y6(t,e,n){if(e.type.prop(n))return!0;let r=e.to-e.from;return r&&(r>2||/[^\s,.;:]/.test(t.sliceDoc(e.from,e.to)))||e.firstChild}function ip(t,e,n){let r=gt(t).resolveInner(e.head),o=n?X.closedBy:X.openedBy;for(let s=e.head;;){let f=n?r.childAfter(s):r.childBefore(s);if(!f)break;y6(t,f,o)?r=f:s=n?f.to:f.from}let a=r.type.prop(o),i,l;return a&&(i=n?Ln(t,r.from,1):Ln(t,r.to,-1))&&i.matched?l=n?i.end.to:i.end.from:l=n?r.to:r.from,B.cursor(l,n?-1:1)}function vD(t,e){return zn(t,n=>{if(!n.empty)return ap(n,e);let r=t.moveVertically(n,e);return r.head!=n.head?r:t.moveToLineBoundary(n,e)})}function kD(t){let e=t.scrollDOM.clientHeight<t.scrollDOM.scrollHeight-2,n=0,r=0,o;if(e){for(let a of t.state.facet(V.scrollMargins)){let i=a(t);i?.top&&(n=Math.max(i?.top,n)),i?.bottom&&(r=Math.max(i?.bottom,r))}o=t.scrollDOM.clientHeight-n-r}else o=(t.dom.ownerDocument.defaultView||window).innerHeight;return{marginTop:n,marginBottom:r,selfScroll:e,height:Math.max(t.defaultLineHeight,o-5)}}function CD(t,e){let n=kD(t),{state:r}=t,o=Sl(r.selection,i=>i.empty?t.moveVertically(i,e,n.height):ap(i,e));if(o.eq(r.selection))return!1;let a;if(n.selfScroll){let i=t.coordsAtPos(r.selection.main.head),l=t.scrollDOM.getBoundingClientRect(),s=l.top+n.marginTop,f=l.bottom-n.marginBottom;i&&i.top>s&&i.bottom<f&&(a=V.scrollIntoView(o.main.head,{y:"start",yMargin:i.top-s}))}return t.dispatch(_n(r,o),{effects:a}),!0}function _o(t,e,n){let r=t.lineBlockAt(e.head),o=t.moveToLineBoundary(e,n);if(o.head==e.head&&o.head!=(n?r.to:r.from)&&(o=t.moveToLineBoundary(e,n,!1)),!n&&o.head==r.from&&r.length){let a=/^\s*/.exec(t.state.sliceDoc(r.from,Math.min(r.from+100,r.to)))[0].length;a&&e.head!=r.from+a&&(o=B.cursor(r.from+a))}return o}function T6(t,e,n){let r=!1,o=Sl(t.selection,a=>{let i=Ln(t,a.head,-1)||Ln(t,a.head,1)||a.head>0&&Ln(t,a.head-1,1)||a.head<t.doc.length&&Ln(t,a.head+1,-1);if(!i||!i.end)return a;r=!0;let l=i.start.from==a.head?i.end.to:i.end.from;return n?B.range(a.anchor,l):B.cursor(l)});return r?(e(_n(t,o)),!0):!1}function Cn(t,e,n){let r=Sl(t.state.selection,o=>{o.undirectional&&o.head>=o.anchor!=e&&(o=B.range(o.head,o.anchor));let a=n(o);return B.range(o.anchor,a.head,a.goalColumn,a.bidiLevel||void 0,a.assoc)});return r.eq(t.state.selection)?!1:(t.dispatch(_n(t.state,r)),!0)}function AD(t,e){return Cn(t,e,n=>t.moveByChar(n,e))}function DD(t,e){return Cn(t,e,n=>t.moveByGroup(n,e))}function OD(t,e){return Cn(t,e,n=>t.moveVertically(n,e))}function ED(t,e){return Cn(t,e,n=>t.moveVertically(n,e,kD(t).height))}function FD(t,e){let{state:n}=t,r=n.selection,o=n.selection.ranges.slice();for(let a of n.selection.ranges){let i=n.doc.lineAt(a.head);if(e?i.to<t.state.doc.length:i.from>0)for(let l=a;;){let s=t.moveVertically(l,e);if(s.head<i.from||s.head>i.to){o.some(f=>f.head==s.head)||o.push(s);break}else{if(s.head==l.head)break;l=s}}}return o.length==r.ranges.length?!1:(t.dispatch(_n(n,B.create(o,o.length-1))),!0)}function zf(t,e){if(t.state.readOnly)return!1;let n="delete.selection",{state:r}=t,o=r.changeByRange(a=>{let{from:i,to:l}=a;if(i==l){let s=e(a);s<i?(n="delete.backward",s=np(t,s,!1)):s>i&&(n="delete.forward",s=np(t,s,!0)),i=Math.min(i,s),l=Math.max(l,s)}else i=np(t,i,!1),l=np(t,l,!0);return i==l?{range:a}:{changes:{from:i,to:l},range:B.cursor(i,i<a.head?-1:1)}});return o.changes.empty?!1:(t.dispatch(r.update(o,{scrollIntoView:!0,userEvent:n,effects:n=="delete.selection"?V.announce.of(r.phrase("Selection deleted")):void 0})),!0)}function np(t,e,n){if(t instanceof V)for(let r of t.state.facet(V.atomicRanges).map(o=>o(t)))r.between(e,e,(o,a)=>{o<e&&a>e&&(e=n?a:o)});return e}function lp(t){let e=[],n=-1;for(let r of t.selection.ranges){let o=t.doc.lineAt(r.from),a=t.doc.lineAt(r.to);if(!r.empty&&r.to==a.from&&(a=t.doc.lineAt(r.to-1)),n>=o.number){let i=e[e.length-1];i.to=a.to,i.ranges.push(r)}else e.push({from:o.from,to:a.to,ranges:[r]});n=a.number+1}return e}function _D(t,e,n){if(t.readOnly)return!1;let r=[],o=[];for(let a of lp(t)){if(n?a.to==t.doc.length:a.from==0)continue;let i=t.doc.lineAt(n?a.to+1:a.from-1),l=i.length+1;if(n){r.push({from:a.to,to:i.to},{from:a.from,insert:i.text+t.lineBreak});for(let s of a.ranges)o.push(B.range(Math.min(t.doc.length,s.anchor+l),Math.min(t.doc.length,s.head+l)))}else{r.push({from:i.from,to:a.from},{from:a.to,insert:t.lineBreak+i.text});for(let s of a.ranges)o.push(B.range(s.anchor-l,s.head-l))}}return r.length?(e(t.update({changes:r,scrollIntoView:!0,selection:B.create(o,t.selection.mainIndex),userEvent:"move.line"})),!0):!1}function zD(t,e,n){if(t.readOnly)return!1;let r=[];for(let a of lp(t))n?r.push({from:a.from,insert:t.doc.slice(a.from,a.to)+t.lineBreak}):r.push({from:a.to,insert:t.lineBreak+t.doc.slice(a.from,a.to)});let o=t.changes(r);return e(t.update({changes:o,selection:t.selection.map(o,n?1:-1),scrollIntoView:!0,userEvent:"input.copyline"})),!0}function nP(t,e){if(/\(\)|\[\]|\{\}/.test(t.sliceDoc(e-1,e+1)))return{from:e,to:e};let n=gt(t).resolveInner(e),r=n.childBefore(e),o=n.childAfter(e),a;return r&&o&&r.to<=e&&o.from>=e&&(a=r.type.prop(X.closedBy))&&a.indexOf(o.name)>-1&&t.doc.lineAt(r.to).from==t.doc.lineAt(o.from).from&&!/\S/.test(t.sliceDoc(r.to,o.from))?{from:r.to,to:o.from}:null}function HD(t){return({state:e,dispatch:n})=>{if(e.readOnly)return!1;let r=e.changeByRange(o=>{let{from:a,to:i}=o,l=e.doc.lineAt(a),s=!t&&a==i&&nP(e,a);t&&(a=i=(i<=l.to?l:e.doc.lineAt(i)).to);let f=new ka(e,{simulateBreak:a,simulateDoubleBreak:!!s}),c=by(f,a);for(c==null&&(c=ga(/^\s*/.exec(e.doc.lineAt(a).text)[0],e.tabSize));i<l.to&&/\s/.test(l.text[i-l.from]);)i++;s?{from:a,to:i}=s:a>l.from&&a<l.from+100&&!/\S/.test(l.text.slice(0,a))&&(a=l.from);let u=["",ff(e,c)];return s&&u.push(ff(e,f.lineIndent(l.from,-1))),{changes:{from:a,to:i,insert:ne.of(u)},range:B.cursor(a+1+u[1].length)}});return n(e.update(r,{scrollIntoView:!0,userEvent:"input"})),!0}}function g0(t,e){let n=-1;return t.changeByRange(r=>{let o=[];for(let i=r.from;i<=r.to;){let l=t.doc.lineAt(i);l.number>n&&(r.empty||r.to>l.from)&&(e(l,o,r),n=l.number),i=l.to+1}let a=t.changes(o);return{changes:o,range:B.range(a.mapPos(r.anchor,1),a.mapPos(r.head,1))}})}var Zq,e6,t6,n6,_f,u0,i6,l6,cD,uD,pD,d0,s6,f6,Pn,kn,d6,h6,za,xD,yD,bD,x6,g6,VH,b6,I6,wD,SD,tD,p0,v6,w6,S6,k6,C6,A6,M6,TD,MD,D6,O6,R6,B6,RD,BD,nD,rD,E6,F6,L6,N6,q6,P6,oD,aD,iD,lD,_6,z6,H6,U6,j6,V6,LD,m0,ND,qD,PD,G6,Q6,X6,W6,K6,Y6,J6,$6,Z6,eP,tP,sD,rP,oP,aP,iP,lP,sP,fP,UD,jD=F(()=>{ji();nf();cf();Es();Zq=t=>{let{state:e}=t,n=e.doc.lineAt(e.selection.main.from),r=x0(t.state,n.from);return r.line?e6(t):r.block?n6(t):!1};e6=h0(a6,0),t6=h0(fD,0),n6=h0((t,e)=>fD(t,e,o6(e)),0);_f=50;u0=Nt.define(),i6=Nt.define(),l6=z.define(),cD=z.define({combine(t){return wo(t,{minDepth:100,newGroupDelay:500,joinToEvent:(e,n)=>n},{minDepth:Math.max,newGroupDelay:Math.min,joinToEvent:(e,n)=>(r,o)=>e(r,o)||n(r,o)})}}),uD=xt.define({create(){return za.empty},update(t,e){let n=e.state.facet(cD),r=e.annotation(u0);if(r){let s=Pn.fromTransaction(e,r.selection),f=r.side,c=f==0?t.undone:t.done;return s?c=rp(c,c.length,n.minDepth,s):c=hD(c,e.startState.selection),new za(f==0?r.rest:c,f==0?c:r.rest)}let o=e.annotation(i6);if((o=="full"||o=="before")&&(t=t.isolate()),e.annotation(Ye.addToHistory)===!1)return e.changes.empty?t:t.addMapping(e.changes.desc);let a=Pn.fromTransaction(e),i=e.annotation(Ye.time),l=e.annotation(Ye.userEvent);return a?t=t.addChanges(a,i,l,n,e):e.selection&&(t=t.addSelection(e.startState.selection,i,l,n.newGroupDelay)),(o=="full"||o=="after")&&(t=t.isolate()),t},toJSON(t){return{done:t.done.map(e=>e.toJSON()),undone:t.undone.map(e=>e.toJSON())}},fromJSON(t){return new za(t.done.map(Pn.fromJSON),t.undone.map(Pn.fromJSON))}});pD=op(0,!1),d0=op(1,!1),s6=op(0,!0),f6=op(1,!0),Pn=class t{constructor(e,n,r,o,a){this.changes=e,this.effects=n,this.mapped=r,this.startSelection=o,this.selectionsAfter=a}setSelAfter(e){return new t(this.changes,this.effects,this.mapped,this.startSelection,e)}toJSON(){var e,n,r;return{changes:(e=this.changes)===null||e===void 0?void 0:e.toJSON(),mapped:(n=this.mapped)===null||n===void 0?void 0:n.toJSON(),startSelection:(r=this.startSelection)===null||r===void 0?void 0:r.toJSON(),selectionsAfter:this.selectionsAfter.map(o=>o.toJSON())}}static fromJSON(e){return new t(e.changes&&kt.fromJSON(e.changes),[],e.mapped&&Tr.fromJSON(e.mapped),e.startSelection&&B.fromJSON(e.startSelection),e.selectionsAfter.map(B.fromJSON))}static fromTransaction(e,n){let r=kn;for(let o of e.startState.facet(l6)){let a=o(e);a.length&&(r=r.concat(a))}return!r.length&&e.changes.empty?null:new t(e.changes.invert(e.startState.doc),r,void 0,n||e.startState.selection,kn)}static selection(e){return new t(void 0,kn,void 0,void 0,e)}};kn=[],d6=200;h6=/^(input\.type|delete)($|\.)/,za=class t{constructor(e,n,r=0,o=void 0){this.done=e,this.undone=n,this.prevTime=r,this.prevUserEvent=o}isolate(){return this.prevTime?new t(this.done,this.undone):this}addChanges(e,n,r,o,a){let i=this.done,l=i[i.length-1];return l&&l.changes&&!l.changes.empty&&e.changes&&(!r||h6.test(r))&&(!l.selectionsAfter.length&&n-this.prevTime<o.newGroupDelay&&o.joinToEvent(a,c6(l.changes,e.changes))||r=="input.type.compose")?i=rp(i,i.length-1,o.minDepth,new Pn(e.changes.compose(l.changes),mD(le.mapEffects(e.effects,l.changes),l.effects),l.mapped,l.startSelection,kn)):i=rp(i,i.length,o.minDepth,e),new t(i,kn,n,r)}addSelection(e,n,r,o){let a=this.done.length?this.done[this.done.length-1].selectionsAfter:kn;return a.length>0&&n-this.prevTime<o&&r==this.prevUserEvent&&r&&/^select($|\.)/.test(r)&&u6(a[a.length-1],e)?this:new t(hD(this.done,e),this.undone,n,r)}addMapping(e){return new t(c0(this.done,e),c0(this.undone,e),this.prevTime,this.prevUserEvent)}pop(e,n,r){let o=e==0?this.done:this.undone;if(o.length==0)return null;let a=o[o.length-1],i=a.selectionsAfter[0]||(a.startSelection?a.startSelection.map(a.changes.invertedDesc,1):n.selection);if(r&&a.selectionsAfter.length)return n.update({selection:a.selectionsAfter[a.selectionsAfter.length-1],annotations:u0.of({side:e,rest:p6(o),selection:i}),userEvent:e==0?"select.undo":"select.redo",scrollIntoView:!0});if(a.changes){let l=o.length==1?kn:o.slice(0,o.length-1);return a.mapped&&(l=c0(l,a.mapped)),n.update({changes:a.changes,selection:a.startSelection,effects:a.effects,annotations:u0.of({side:e,rest:l,selection:i}),filter:!1,userEvent:e==0?"undo":"redo",scrollIntoView:!0})}else return null}};za.empty=new za(kn,kn);xD=[{key:"Mod-z",run:pD,preventDefault:!0},{key:"Mod-y",mac:"Mod-Shift-z",run:d0,preventDefault:!0},{linux:"Ctrl-Shift-z",run:d0,preventDefault:!0},{key:"Mod-u",run:s6,preventDefault:!0},{key:"Alt-u",mac:"Mod-Shift-u",run:f6,preventDefault:!0}];yD=t=>gD(t,!yt(t)),bD=t=>gD(t,yt(t));x6=t=>ID(t,!yt(t)),g6=t=>ID(t,yt(t)),VH=typeof Intl<"u"&&Intl.Segmenter?new Intl.Segmenter(void 0,{granularity:"word"}):null;b6=t=>zn(t,e=>ip(t.state,e,!yt(t))),I6=t=>zn(t,e=>ip(t.state,e,yt(t)));wD=t=>vD(t,!1),SD=t=>vD(t,!0);tD=t=>CD(t,!1),p0=t=>CD(t,!0);v6=t=>zn(t,e=>_o(t,e,!0)),w6=t=>zn(t,e=>_o(t,e,!1)),S6=t=>zn(t,e=>_o(t,e,!yt(t))),k6=t=>zn(t,e=>_o(t,e,yt(t))),C6=t=>zn(t,e=>t.moveToLineBoundary(e,!1,!1)),A6=t=>zn(t,e=>t.moveToLineBoundary(e,!0,!1));M6=({state:t,dispatch:e})=>T6(t,e,!1);TD=t=>AD(t,!yt(t)),MD=t=>AD(t,yt(t));D6=t=>DD(t,!yt(t)),O6=t=>DD(t,yt(t)),R6=t=>{let e=!yt(t);return Cn(t,e,n=>ip(t.state,n,e))},B6=t=>{let e=yt(t);return Cn(t,e,n=>ip(t.state,n,e))};RD=t=>OD(t,!1),BD=t=>OD(t,!0);nD=t=>ED(t,!1),rD=t=>ED(t,!0),E6=t=>Cn(t,!0,e=>_o(t,e,!0)),F6=t=>Cn(t,!1,e=>_o(t,e,!1)),L6=t=>{let e=!yt(t);return Cn(t,e,n=>_o(t,n,e))},N6=t=>{let e=yt(t);return Cn(t,e,n=>_o(t,n,e))},q6=t=>Cn(t,!1,e=>B.cursor(t.lineBlockAt(e.head).from)),P6=t=>Cn(t,!0,e=>B.cursor(t.lineBlockAt(e.head).to)),oD=({state:t,dispatch:e})=>(e(_n(t,{anchor:0})),!0),aD=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.doc.length})),!0),iD=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.selection.main.anchor,head:0})),!0),lD=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.selection.main.anchor,head:t.doc.length})),!0),_6=({state:t,dispatch:e})=>(e(t.update({selection:{anchor:0,head:t.doc.length},userEvent:"select"})),!0),z6=({state:t,dispatch:e})=>{let n=lp(t).map(({from:r,to:o})=>B.undirectionalRange(r,Math.min(o+1,t.doc.length)));return e(t.update({selection:B.create(n),userEvent:"select"})),!0},H6=({state:t,dispatch:e})=>{let n=Sl(t.selection,r=>{let o=gt(t),a=o.resolveStack(r.from,1);if(r.empty){let i=o.resolveStack(r.from,-1);i.node.from>=a.node.from&&i.node.to<=a.node.to&&(a=i)}for(let i=a;i;i=i.next){let{node:l}=i;if((l.from<r.from&&l.to>=r.to||l.to>r.to&&l.from<=r.from)&&i.next)return B.undirectionalRange(l.from,l.to)}return r});return n.eq(t.selection)?!1:(e(_n(t,n)),!0)};U6=t=>FD(t,!1),j6=t=>FD(t,!0),V6=({state:t,dispatch:e})=>{let n=t.selection,r=null;return n.ranges.length>1?r=B.create([n.main]):n.main.empty||(r=B.create([B.cursor(n.main.head)])),r?(e(_n(t,r)),!0):!1};LD=(t,e,n)=>zf(t,r=>{let o=r.from,{state:a}=t,i=a.doc.lineAt(o),l,s;if(n&&!e&&o>i.from&&o<i.from+200&&!/[^ \t]/.test(l=i.text.slice(0,o-i.from))){if(l[l.length-1]=="	")return o-1;let f=ga(l,a.tabSize),c=f%sf(a)||sf(a);for(let u=0;u<c&&l[l.length-1-u]==" ";u++)o--;s=o}else s=tt(i.text,o-i.from,e,e)+i.from,s==o&&i.number!=(e?a.doc.lines:1)?s+=e?1:-1:!e&&/[\ufe00-\ufe0f]/.test(i.text.slice(s-i.from,o-i.from))&&(s=tt(i.text,s-i.from,!1,!1)+i.from);return s}),m0=t=>LD(t,!1,!0),ND=t=>LD(t,!0,!1),qD=(t,e)=>zf(t,n=>{let r=n.head,{state:o}=t,a=o.doc.lineAt(r),i=o.charCategorizer(r);for(let l=null;;){if(r==(e?a.to:a.from)){r==n.head&&a.number!=(e?o.doc.lines:1)&&(r+=e?1:-1);break}let s=tt(a.text,r-a.from,e)+a.from,f=a.text.slice(Math.min(r,s)-a.from,Math.max(r,s)-a.from),c=i(f);if(l!=null&&c!=l)break;(f!=" "||r!=n.head)&&(l=c),r=s}return r}),PD=t=>qD(t,!1),G6=t=>qD(t,!0),Q6=t=>zf(t,e=>{let n=t.lineBlockAt(e.head).to;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),X6=t=>zf(t,e=>{let n=t.moveToLineBoundary(e,!1).head;return e.head>n?n:Math.max(0,e.head-1)}),W6=t=>zf(t,e=>{let n=t.moveToLineBoundary(e,!0).head;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),K6=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>({changes:{from:r.from,to:r.to,insert:ne.of(["",""])},range:B.cursor(r.from)}));return e(t.update(n,{scrollIntoView:!0,userEvent:"input"})),!0},Y6=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>{if(!r.empty||r.from==0||r.from==t.doc.length)return{range:r};let o=r.from,a=t.doc.lineAt(o),i=o==a.from?o-1:tt(a.text,o-a.from,!1)+a.from,l=o==a.to?o+1:tt(a.text,o-a.from,!0)+a.from;return{changes:{from:i,to:l,insert:t.doc.slice(o,l).append(t.doc.slice(i,o))},range:B.cursor(l)}});return n.changes.empty?!1:(e(t.update(n,{scrollIntoView:!0,userEvent:"move.character"})),!0)};J6=({state:t,dispatch:e})=>_D(t,e,!1),$6=({state:t,dispatch:e})=>_D(t,e,!0);Z6=({state:t,dispatch:e})=>zD(t,e,!1),eP=({state:t,dispatch:e})=>zD(t,e,!0),tP=t=>{if(t.state.readOnly)return!1;let{state:e}=t,n=e.changes(lp(e).map(({from:o,to:a})=>(o>0?o--:a<e.doc.length&&a++,{from:o,to:a}))),r=Sl(e.selection,o=>{let a;if(t.lineWrapping){let i=t.lineBlockAt(o.head),l=t.coordsAtPos(o.head,o.assoc||1);l&&(a=i.bottom+t.documentTop-l.bottom+t.defaultLineHeight/2)}return t.moveVertically(o,!0,a)}).map(n);return t.dispatch({changes:n,selection:r,scrollIntoView:!0,userEvent:"delete.line"}),!0};sD=HD(!1),rP=HD(!0);oP=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=Object.create(null),r=new ka(t,{overrideIndentation:a=>{let i=n[a];return i??-1}}),o=g0(t,(a,i,l)=>{let s=by(r,a.from);if(s==null)return;/\S/.test(a.text)||(s=0);let f=/^\s*/.exec(a.text)[0],c=ff(t,s);(f!=c||l.from<a.from+f.length)&&(n[a.from]=s,i.push({from:a.from,to:a.from+f.length,insert:c}))});return o.changes.empty||e(t.update(o,{userEvent:"indent"})),!0},aP=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(g0(t,(n,r)=>{r.push({from:n.from,insert:t.facet(lf)})}),{userEvent:"input.indent"})),!0),iP=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(g0(t,(n,r)=>{let o=/^\s*/.exec(n.text)[0];if(!o)return;let a=ga(o,t.tabSize),i=0,l=ff(t,Math.max(0,a-sf(t)));for(;i<o.length&&i<l.length&&o.charCodeAt(i)==l.charCodeAt(i);)i++;r.push({from:n.from+i,to:n.from+o.length,insert:l.slice(i)})}),{userEvent:"delete.dedent"})),!0),lP=t=>(t.setTabFocusMode(),!0),sP=[{key:"Ctrl-b",run:yD,shift:TD,preventDefault:!0},{key:"Ctrl-f",run:bD,shift:MD},{key:"Ctrl-p",run:wD,shift:RD},{key:"Ctrl-n",run:SD,shift:BD},{key:"Ctrl-a",run:C6,shift:q6},{key:"Ctrl-e",run:A6,shift:P6},{key:"Ctrl-d",run:ND},{key:"Ctrl-h",run:m0},{key:"Ctrl-k",run:Q6},{key:"Ctrl-Alt-h",run:PD},{key:"Ctrl-o",run:K6},{key:"Ctrl-t",run:Y6},{key:"Ctrl-v",run:p0}],fP=[{key:"ArrowLeft",run:yD,shift:TD,preventDefault:!0},{key:"Mod-ArrowLeft",mac:"Alt-ArrowLeft",run:x6,shift:D6,preventDefault:!0},{mac:"Cmd-ArrowLeft",run:S6,shift:L6,preventDefault:!0},{key:"ArrowRight",run:bD,shift:MD,preventDefault:!0},{key:"Mod-ArrowRight",mac:"Alt-ArrowRight",run:g6,shift:O6,preventDefault:!0},{mac:"Cmd-ArrowRight",run:k6,shift:N6,preventDefault:!0},{key:"ArrowUp",run:wD,shift:RD,preventDefault:!0},{mac:"Cmd-ArrowUp",run:oD,shift:iD},{mac:"Ctrl-ArrowUp",run:tD,shift:nD},{key:"ArrowDown",run:SD,shift:BD,preventDefault:!0},{mac:"Cmd-ArrowDown",run:aD,shift:lD},{mac:"Ctrl-ArrowDown",run:p0,shift:rD},{key:"PageUp",run:tD,shift:nD},{key:"PageDown",run:p0,shift:rD},{key:"Home",run:w6,shift:F6,preventDefault:!0},{key:"Mod-Home",run:oD,shift:iD},{key:"End",run:v6,shift:E6,preventDefault:!0},{key:"Mod-End",run:aD,shift:lD},{key:"Enter",run:sD,shift:sD},{key:"Mod-a",run:_6},{key:"Backspace",run:m0,shift:m0,preventDefault:!0},{key:"Delete",run:ND,preventDefault:!0},{key:"Mod-Backspace",mac:"Alt-Backspace",run:PD,preventDefault:!0},{key:"Mod-Delete",mac:"Alt-Delete",run:G6,preventDefault:!0},{mac:"Mod-Backspace",run:X6,preventDefault:!0},{mac:"Mod-Delete",run:W6,preventDefault:!0}].concat(sP.map(t=>({mac:t.key,run:t.run,shift:t.shift}))),UD=[{key:"Alt-ArrowLeft",mac:"Ctrl-ArrowLeft",run:b6,shift:R6},{key:"Alt-ArrowRight",mac:"Ctrl-ArrowRight",run:I6,shift:B6},{key:"Alt-ArrowUp",run:J6},{key:"Shift-Alt-ArrowUp",run:Z6},{key:"Alt-ArrowDown",run:$6},{key:"Shift-Alt-ArrowDown",run:eP},{key:"Mod-Alt-ArrowUp",run:U6},{key:"Mod-Alt-ArrowDown",run:j6},{key:"Escape",run:V6},{key:"Mod-Enter",run:rP},{key:"Alt-l",mac:"Ctrl-l",run:z6},{key:"Mod-i",run:H6,preventDefault:!0},{key:"Mod-[",run:iP},{key:"Mod-]",run:aP},{key:"Mod-Alt-\\",run:oP},{key:"Shift-Mod-k",run:tP},{key:"Shift-Mod-\\",run:M6},{key:"Mod-/",run:Zq},{key:"Alt-A",mac:"Ctrl-A",run:t6},{key:"Ctrl-m",mac:"Shift-Alt-m",run:lP}].concat(fP)});function VD(t){return`'${t.replace(/'/g,"''")}'`}function cP(t){let e=t?.schemas.find(n=>n.name==="main")??t?.schemas[0];return e?e.tables.map(n=>n.name):[]}function GD(t){let e=[{label:"List tables",sql:"SELECT name, type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name;"}],n=cP(t);if(n.length){let r=n.map(o=>`SELECT ${VD(o)} AS table_name, count(*) AS rows FROM ${Bo(o,"sqlite")}`);e.push({label:"Row counts",sql:`${r.join(`
UNION ALL
`)}
ORDER BY table_name;`}),e.push({label:"Table columns",sql:`SELECT * FROM pragma_table_info(${VD(n[0])});`})}return e}var QD=F(()=>{"use strict";Pr()});function XD(t){let e=t.selection.main;if(!e.empty||t.doc.length===0)return Y.none;let n=Sd(t.doc.toString(),e.head,zr(N.getState().connection));if(!n||!n.text.trim())return Y.none;let r=new Jn,o=t.doc.lineAt(n.from).number,a=t.doc.lineAt(Math.max(n.from,n.to)).number;for(let i=o;i<=a;i++)r.add(t.doc.line(i).from,t.doc.line(i).from,dP);return r.finish()}function mP(t){let e=sp;e&&(e.dispatch({changes:{from:0,to:e.state.doc.length,insert:t},selection:{anchor:t.length}}),e.focus())}function y0(t){let e=t.selection.main.head,n=t.doc.lineAt(e);N.getState().setCursor(n.number,e-n.from+1)}function WD(t,e){return Z2({dialect:mf(e),schema:t?YA(t,e):{},upperCaseKeywords:!1})}function IP(t,e){if(!t.length)return null;let n=Math.max(0,Math.min(e,t.length-1)),r=/^[\w$"'`[\].]+/.exec(t.slice(n,n+200));return{from:n,to:Math.min(t.length,n+(r?r[0].length:1))}}function YD(){let t=(0,rn.useRef)(null),e=(0,rn.useRef)(null),n=(0,rn.useRef)(new Ui),r=N(u=>u.activeTabId),o=N(u=>u.tabs.find(d=>d.id===u.activeTabId)?.sql??""),a=N(u=>u.schema),i=N(u=>u.errorAt),l=N(u=>zr(u.connection)),s=(0,rn.useRef)({tabId:r,schema:a,dialect:l}),f=(0,rn.useRef)(null);function c(u){let{run:d}=N.getState();return Ee.create({doc:u,extensions:[On.highest(ol.of([{key:"Mod-Enter",run:()=>(d("current"),!0)},{key:"Mod-Shift-Enter",run:()=>(d("all"),!0)}])),$C(),WC(),dD(),b2(),q2(),ol.of([...jy,...UD,...xD]),n.current.of(WD(s.current.schema,s.current.dialect)),m2(yP),bP,xP,pP,KC(ZA(uP)),V.contentAttributes.of({"aria-label":"SQL editor"}),V.updateListener.of(p=>{p.docChanged&&N.getState().updateTabSql(s.current.tabId,p.state.doc.toString()),(p.docChanged||p.selectionSet)&&y0(p.state)})]})}return(0,rn.useEffect)(()=>{let u=t.current;if(!u)return;let d=new V({state:c(o),parent:u});return e.current=d,sp=d,f.current=r,y0(d.state),Fb(()=>{let p=d.state.selection.main;return{from:p.from,to:p.to,head:p.head}}),()=>{Fb(null),sp===d&&(sp=null),d.destroy(),e.current=null}},[]),(0,rn.useEffect)(()=>{s.current.tabId=r;let u=e.current;u&&(f.current!==r?(f.current=r,u.setState(c(o)),y0(u.state)):u.state.doc.toString()!==o&&u.dispatch({changes:{from:0,to:u.state.doc.length,insert:o}}))},[r,o]),(0,rn.useEffect)(()=>{s.current.schema=a,s.current.dialect=l,e.current?.dispatch({effects:n.current.reconfigure(WD(a,l))})},[a,l]),(0,rn.useEffect)(()=>{let u=e.current;if(!u)return;let d=i&&i.tabId===r?IP(u.state.doc.toString(),i.position):null;u.dispatch({effects:KD.of(d)}),d&&u.dispatch({effects:V.scrollIntoView(d.from,{y:"nearest"})})},[i,r]),(0,kl.jsx)("div",{ref:t,className:"xray-sql-editor"})}function JD(){let t=N(o=>!o.tabs.find(a=>a.id===o.activeTabId)?.sql.trim()),e=N(o=>o.schema),n=N(o=>zr(o.connection)==="sqlite"),r=rn.default.useMemo(()=>GD(e),[e]);return!t||!n?null:(0,kl.jsxs)("div",{className:"xray-sql-quickstarts",role:"group","aria-label":"Quick starts",children:[(0,kl.jsx)("span",{className:"xray-sql-quickstarts-label",children:"Start with"}),r.map(o=>(0,kl.jsx)("button",{type:"button",className:"xray-btn xray-btn-sm",title:o.sql,onClick:()=>mP(o.sql),children:o.label},o.label))]})}var rn,kl,uP,dP,pP,sp,KD,hP,xP,gP,yP,bP,$D=F(()=>{"use strict";rn=J(bt());ji();nf();jD();Vy();cf();Zy();Fa();xf();hb();QD();kf();kl=J(Te()),uP=Fd(typeof navigator>"u"?"":navigator.platform),dP=Y.line({class:"xray-sql-active-statement"});pP=xt.define({create:XD,update:(t,e)=>e.docChanged||e.selection?XD(e.state):t,provide:t=>V.decorations.from(t)}),sp=null;KD=le.define(),hP=Y.mark({class:"xray-sql-error-mark"}),xP=xt.define({create:()=>Y.none,update(t,e){let n=e.docChanged?Y.none:t;for(let r of e.effects)r.is(KD)&&(n=r.value?Y.set([hP.range(r.value.from,r.value.to)]):Y.none);return n},provide:t=>V.decorations.from(t)}),gP={"#708":"var(--xray-mauve)","#219":"var(--xray-peach)","#164":"var(--xray-peach)","#a11":"var(--xray-green)","#e40":"var(--xray-yellow)","#00f":"var(--xray-blue)","#30a":"var(--xray-blue)","#085":"var(--xray-teal)","#167":"var(--xray-teal)","#256":"var(--xray-blue)","#00c":"var(--xray-blue)","#940":"var(--xray-hint)","#f00":"var(--xray-red)","#404740":"var(--xray-subtext)"},yP=ll.define(h2.specs.map(t=>t.color?{...t,color:gP[t.color]??"var(--xray-text)"}:t)),bP=V.theme({"&":{height:"100%",color:"var(--xray-text)",backgroundColor:"var(--xray-bg)",fontSize:"13px"},"&.cm-focused":{outline:"none"},".cm-scroller":{fontFamily:"var(--xray-font)",lineHeight:"1.55"},".cm-content":{caretColor:"var(--xray-accent)"},".cm-cursor, .cm-dropCursor":{borderLeftColor:"var(--xray-accent)"},"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":{backgroundColor:"var(--xray-active)"},".cm-activeLine":{backgroundColor:"rgba(var(--xray-text-rgb), .04)"},".cm-gutters":{backgroundColor:"var(--xray-surface)",color:"var(--xray-hint)",border:"none",borderRight:"1px solid var(--xray-border)"},".cm-activeLineGutter":{backgroundColor:"rgba(var(--xray-text-rgb), .06)",color:"var(--xray-subtext)"},".cm-matchingBracket":{backgroundColor:"var(--xray-selection)",outline:"1px solid var(--xray-border-control)"},".cm-tooltip":{backgroundColor:"var(--xray-surface2)",color:"var(--xray-text)",border:"1px solid var(--xray-border)"},".cm-tooltip-autocomplete > ul":{fontFamily:"var(--xray-font)"},".cm-tooltip-autocomplete > ul > li[aria-selected]":{backgroundColor:"var(--xray-active)",color:"var(--xray-text)"},".xray-sql-error-mark":{textDecoration:"underline wavy var(--xray-red)",textUnderlineOffset:"3px"},".cm-placeholder":{color:"var(--xray-hint)",fontStyle:"normal"},".xray-sql-active-statement":{backgroundColor:"color-mix(in srgb, var(--xray-accent) 6%, transparent)",boxShadow:"inset 2px 0 0 color-mix(in srgb, var(--xray-accent) 55%, transparent)"},".xray-sql-active-statement.cm-activeLine":{backgroundColor:"color-mix(in srgb, var(--xray-accent) 9%, transparent)"}})});function vP(){let t=N(r=>r.readOnlyChoice),e=N(r=>!!r.running||r.opening||!!r.pendingConfirm||!!r.pendingPrompt),n=N(r=>r.setReadOnly);return(0,O.jsxs)("button",{type:"button",role:"switch","aria-checked":t,"aria-label":"Read-only",className:`xray-sql-mode-badge ${t?"read-only":"editable"}`,disabled:e,title:t?"Read-only: writes are refused. Click to allow writes.":"Editable: writes run, and Save writes them to the file. Click to make it read-only.",onClick:()=>{n(!t)},children:[t?(0,O.jsx)(cx,{size:11,stroke:2.2,"aria-hidden":"true"}):(0,O.jsx)(fx,{size:11,stroke:2.2,"aria-hidden":"true"}),t?"Read-only":"Editable"]})}function wP(){let t=N(s=>s.connection),e=N(s=>!!s.running||s.opening),[n,r]=(0,_e.useState)(!1),o=(0,_e.useRef)(null),a=(0,_e.useRef)(null),i=(0,_e.useRef)(null);if((0,_e.useEffect)(()=>{if(!n)return;i.current?.querySelector("button:not([disabled])")?.focus();let s=f=>{o.current?.contains(f.target)||r(!1)};return document.addEventListener("pointerdown",s),()=>document.removeEventListener("pointerdown",s)},[n]),!t)return null;let l=()=>{r(!1),a.current?.focus()};return(0,O.jsxs)("div",{ref:o,className:"xray-sql-source-wrap",onKeyDown:s=>{s.key==="Escape"&&n&&(s.stopPropagation(),l())},onBlur:s=>{n&&!o.current?.contains(s.relatedTarget)&&r(!1)},children:[(0,O.jsxs)("button",{ref:a,type:"button",className:`xray-sql-source${t.readOnly?"":" editable"}`,"aria-haspopup":"dialog","aria-expanded":n,title:t.name,onClick:()=>r(s=>!s),children:[(0,O.jsx)(Li,{size:15,stroke:1.8,"aria-hidden":"true"}),(0,O.jsx)("span",{className:"xray-sql-source-name",children:t.name})," ",(0,O.jsx)("span",{className:"xray-sql-source-meta",children:t.kind==="sqlite"?`\xB7 SQLite \xB7 ${Sb(t.size)}`:`\xB7 ${t.engine==="postgres"?"PostgreSQL":"MySQL"} \xB7 ${t.host}`}),(0,O.jsx)(sa,{size:14,stroke:2,"aria-hidden":"true",className:"xray-sql-source-chevron"})]}),(0,O.jsx)(vP,{}),n&&(0,O.jsxs)("div",{ref:i,className:"xray-sql-source-menu",role:"dialog","aria-label":"Database file",children:[(0,O.jsx)(Kb,{className:"xray-menu-item",label:"Open SQLite file\u2026",title:`Open another database (${Cl.open})`,disabled:e,onPicked:l}),(0,O.jsx)("p",{className:"xray-sql-source-note",children:"Files open read-only. The Read-only switch beside the file allows writes; Save writes them back."})]})]})}function SP(){let t=N(c=>c.connection),e=N(c=>c.running),n=N(c=>c.opening),r=N(c=>c.dirty),{run:o,stop:a,save:i}=N.getState(),l=(0,_e.useRef)(null),s=(0,_e.useRef)(!1);return(0,_e.useEffect)(()=>{s.current&&(s.current=!1,l.current?.focus())},[!!e]),(0,O.jsxs)("header",{className:"xray-sql-toolbar",children:[(0,O.jsx)("span",{className:"xray-sql-brand",children:"XRAY SQL"}),(0,O.jsx)(wP,{}),(0,O.jsx)("span",{className:"xray-spacer"}),t&&r&&(0,O.jsxs)("button",{className:"xray-btn primary xray-sql-save",disabled:!!e,onClick:()=>{i()},"aria-keyshortcuts":up?"Meta+S":"Control+S",title:`Write the changes back to the file (${Cl.save})`,children:[(0,O.jsx)("span",{className:"xray-sql-save-dot","aria-hidden":"true"}),(0,O.jsx)(ox,{...cp,"aria-hidden":"true"}),"Save"]}),t&&(e?(0,O.jsxs)("button",{ref:l,className:"xray-btn danger xray-sql-run",onClick:c=>{s.current=document.activeElement===c.currentTarget,a()},children:[(0,O.jsx)(dx,{...cp,"aria-hidden":"true"}),"Stop"]}):(0,O.jsxs)("button",{className:"xray-btn primary xray-sql-run",ref:l,disabled:n,"aria-keyshortcuts":up?"Meta+Enter":"Control+Enter",onClick:c=>{s.current=document.activeElement===c.currentTarget,o("current")},title:`Run the selection or the statement at the cursor (${Cl.run}). ${Cl.runAll} runs all.`,children:[(0,O.jsx)(ux,{...cp,"aria-hidden":"true"}),"Run",(0,O.jsx)("kbd",{className:"xray-sql-kbd","aria-hidden":"true",children:Cl.run})]}))]})}function kP(){let t=N(s=>s.opening),[e,n]=(0,_e.useState)([]),[r,o]=(0,_e.useState)(null),[a]=(0,_e.useState)(()=>Date.now());if((0,_e.useEffect)(()=>{let s=!0;return Rd().then(f=>{s&&n(f)}).catch(()=>{}),()=>{s=!1}},[]),!e.length)return null;async function i(s){o(null);let f=await WA(s);if("error"in f){o({name:s.name,size:s.size,message:f.error});return}await N.getState().openFile(f.file,s.handle)}async function l(s){o(null),n(await XA(s).catch(()=>e.filter(f=>f!==s)))}return(0,O.jsxs)("section",{className:"xray-sql-recent","aria-labelledby":"xray-sql-recent-title",children:[(0,O.jsx)("h2",{id:"xray-sql-recent-title",children:"Recent"}),(0,O.jsx)("ul",{children:e.map(s=>{let f=r&&r.name===s.name&&r.size===s.size?r.message:null;return(0,O.jsxs)("li",{children:[(0,O.jsxs)("button",{type:"button",className:"xray-sql-recent-item",disabled:t,onClick:()=>{i(s)},children:[(0,O.jsx)(Li,{size:14,stroke:1.8,"aria-hidden":"true"}),(0,O.jsx)("span",{className:"xray-sql-recent-name",children:s.name}),(0,O.jsxs)("span",{className:"xray-sql-recent-meta",children:[Sb(s.size)," \xB7 ",UA(s.lastOpened,a)]})]}),f&&(0,O.jsxs)("div",{className:"xray-sql-recent-error",role:"alert",children:[(0,O.jsx)("span",{children:f}),(0,O.jsx)("button",{type:"button",className:"xray-btn xray-btn-sm","aria-label":`Remove ${s.name} from recent files`,onClick:()=>{l(s)},children:"Remove"})]})]},`${s.name}:${s.size}`)})})]})}function CP(){let t=N(r=>r.opening),e=N(r=>r.error),n=N(r=>r.messages[r.messages.length-1]);return(0,O.jsxs)("section",{className:"xray-sql-welcome","aria-labelledby":"xray-sql-welcome-title",children:[(0,O.jsx)(Li,{size:36,stroke:1.4,"aria-hidden":"true",className:"xray-sql-welcome-icon"}),(0,O.jsx)("h1",{id:"xray-sql-welcome-title",children:"Open a SQLite database"}),(0,O.jsx)(Kb,{className:"xray-btn primary xray-sql-welcome-open",title:`Open a database (${Cl.open})`,disabled:t}),(0,O.jsx)("p",{className:"xray-sql-welcome-drop",children:"or drop a .sqlite / .db file anywhere on this page"}),(0,O.jsx)("p",{className:"xray-sql-welcome-note",children:"Files open read-only. Nothing leaves your machine."}),pb()&&(0,O.jsx)(kP,{}),t&&(0,O.jsx)("p",{className:"xray-sql-welcome-note",role:"status",children:"Opening\u2026"}),!t&&e&&n&&(0,O.jsx)("p",{className:"xray-sql-welcome-error",role:"alert",children:n})]})}function AP(){let t=N(a=>a.connection),e=N(a=>a.dirty),n=N(a=>a.result?.durationMs),r=N(a=>!!a.running),o=N(a=>a.cursor);return(0,O.jsx)("footer",{className:"xray-sql-status",children:t&&(0,O.jsxs)(O.Fragment,{children:[r?(0,O.jsx)("span",{children:"Running\u2026"}):n!==void 0&&(0,O.jsxs)("span",{children:["Last run ",Math.round(n)," ms"]}),e&&(0,O.jsx)("span",{className:"xray-sql-connection-meta",children:"unsaved changes"}),(0,O.jsx)("span",{className:"xray-spacer"}),(0,O.jsxs)("span",{className:"xray-sql-status-cursor",children:["Ln ",o.line,", Col ",o.col]})]})})}function fp(t){return Array.from(t.dataTransfer?.types??[]).includes("Files")}function ZD(t){return t.target instanceof Element&&!!t.target.closest(".cm-editor")}function TP(){let[t,e]=(0,_e.useState)(!1);return(0,_e.useEffect)(()=>{let n=0,r=l=>{fp(l)&&(l.preventDefault(),n+=1,e(!0))},o=l=>{if(!fp(l)){ZD(l)||(l.preventDefault(),l.dataTransfer&&(l.dataTransfer.dropEffect="none"));return}l.preventDefault(),l.stopPropagation(),l.dataTransfer&&(l.dataTransfer.dropEffect="copy")},a=l=>{fp(l)&&(n=Math.max(0,n-1),n===0&&e(!1))},i=l=>{if(!fp(l)){ZD(l)||l.preventDefault();return}l.preventDefault(),l.stopPropagation(),n=0,e(!1),N.getState().openDropped(Array.from(l.dataTransfer?.files??[]))};return window.addEventListener("dragenter",r,!0),window.addEventListener("dragover",o,!0),window.addEventListener("dragleave",a,!0),window.addEventListener("drop",i,!0),()=>{window.removeEventListener("dragenter",r,!0),window.removeEventListener("dragover",o,!0),window.removeEventListener("dragleave",a,!0),window.removeEventListener("drop",i,!0)}},[]),t}function MP(){(0,_e.useEffect)(()=>{let t=e=>{if(!(up?e.metaKey&&!e.ctrlKey:e.ctrlKey&&!e.metaKey)||e.shiftKey||e.altKey)return;let r=e.key.toLowerCase();if(r!=="s"&&r!=="o")return;e.preventDefault();let o=N.getState();document.querySelector('[aria-modal="true"]')||o.running||o.opening||o.pendingConfirm||o.pendingPrompt||(r==="s"?o.connection&&o.dirty&&o.save():zT())};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[])}function DP(){let t=N(o=>o.layout.editorPct),e=N(o=>o.setLayout),n=(0,_e.useRef)(null),r=()=>n.current?.getBoundingClientRect().height??0;return(0,O.jsxs)("div",{ref:n,className:"xray-sql-split",style:{gridTemplateRows:`minmax(0, ${t}fr) auto minmax(0, ${100-t}fr)`},children:[(0,O.jsxs)("div",{className:"xray-sql-editor-wrap",children:[(0,O.jsx)(YD,{}),(0,O.jsx)(JD,{})]}),(0,O.jsx)(Yb,{orientation:"horizontal",label:"Resize editor and results",value:t,valueText:`Editor ${Math.round(t)}%`,min:yb,max:bb,defaultValue:gl.editorPct,onSet:o=>e({editorPct:o}),onStep:o=>e({editorPct:$A(t,o,r())}),onDrag:(o,a)=>{let i=n.current?.getBoundingClientRect();i&&i.height>0&&e({editorPct:(a-i.top)/i.height*100})}}),(0,O.jsx)(ZM,{})]})}function OP(){let t=N(i=>i.tabs),e=N(i=>i.activeTabId),n=N(i=>i.running?.tabId),{setActiveTab:r,addTab:o,closeTab:a}=N.getState();return(0,O.jsxs)("div",{className:"xray-sql-editor-tabs",role:"tablist","aria-label":"Queries",children:[t.map(i=>(0,O.jsxs)("div",{className:`xray-sql-editor-tab${i.id===e?" active":""}`,children:[(0,O.jsx)("button",{role:"tab","aria-selected":i.id===e,className:"xray-sql-editor-tab-name",onClick:()=>r(i.id),title:i.title,children:i.title}),(0,O.jsx)("button",{className:"xray-sql-editor-tab-close","aria-label":`Close ${i.title}`,disabled:n===i.id,onClick:()=>a(i.id),children:(0,O.jsx)(fa,{size:12,stroke:2})})]},i.id)),(0,O.jsx)("button",{className:"xray-icon-btn xray-sql-add-tab","aria-label":"New query tab",title:"New query tab",onClick:o,children:(0,O.jsx)(px,{...cp})})]})}function RP(t){return t==="could not parse"?"Run a statement that could not be parsed?":`Run ${t}?`}function BP(){let t=N(l=>l.pendingConfirm),e=N(l=>l.pendingPrompt),{confirmPending:n,cancelPending:r,confirmPrompt:o,cancelPrompt:a}=N.getState(),i=(0,_e.useRef)(null);return t?(0,O.jsx)(Xb,{title:RP(t.reason),icon:(0,O.jsx)(yu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:r,footer:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)("span",{className:"xray-spacer"}),(0,O.jsx)("button",{ref:i,className:"xray-btn",onClick:r,children:"Cancel"}),(0,O.jsx)("button",{className:"xray-btn danger",onClick:()=>{n()},children:"Run anyway"})]}),children:(0,O.jsx)("div",{className:"xray-modal-body",children:(0,O.jsx)("pre",{className:"xray-sql-confirm-sql",children:t.sql})})}):e?(0,O.jsx)(Xb,{title:e.title,icon:(0,O.jsx)(yu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:a,footer:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)("span",{className:"xray-spacer"}),(0,O.jsx)("button",{ref:i,className:"xray-btn",onClick:a,children:"Cancel"}),(0,O.jsx)("button",{className:"xray-btn danger",onClick:()=>{o()},children:e.confirmLabel})]}),children:(0,O.jsx)("div",{className:"xray-modal-body",children:(0,O.jsx)("p",{className:"xray-confirm-message",children:e.message})})}):null}function eO({settings:t}){let e=N(f=>f.dirty),n=N(f=>!!f.connection),r=N(f=>f.layout.railPx),o=N(f=>f.setLayout),a=(0,_e.useRef)(null),i=TP();MP(),(0,_e.useEffect)(()=>{if(!e)return;let f=c=>c.preventDefault();return window.addEventListener("beforeunload",f),()=>window.removeEventListener("beforeunload",f)},[e]);let l=DT(t),s={...l?{"--xray-accent":l}:{},"--xray-font":OT[t.font],"--xray-radius":`${t.radius}px`,...t.theme==="custom"?CT(t.customTheme):{}};return(0,O.jsxs)("div",{className:`xray-theme-scope xray-theme-${t.theme} xray-font-${t.font}`,style:s,children:[(0,O.jsxs)("div",{className:"xray-sql-app",children:[(0,O.jsx)(SP,{}),(0,O.jsxs)("div",{ref:a,className:"xray-sql-body",style:{gridTemplateColumns:`${r}px auto minmax(0, 1fr)`},children:[(0,O.jsx)(PT,{}),(0,O.jsx)(Yb,{orientation:"vertical",label:"Resize schema rail",value:r,valueText:`${r} pixels`,min:Ib,max:vb,defaultValue:gl.railPx,onSet:f=>o({railPx:f}),onStep:f=>o({railPx:r+f}),onDrag:f=>{let c=a.current?.getBoundingClientRect().left??0;o({railPx:f-c})}}),(0,O.jsx)("main",{className:"xray-sql-main","aria-label":"SQL workspace",children:n?(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(OP,{}),(0,O.jsx)(DP,{})]}):(0,O.jsx)(CP,{})})]}),(0,O.jsx)(AP,{}),i&&(0,O.jsx)("div",{className:"xray-sql-drop","aria-hidden":"true",children:(0,O.jsxs)("div",{className:"xray-sql-drop-card",children:[(0,O.jsx)(Li,{size:28,stroke:1.5}),(0,O.jsx)("span",{children:"Drop to open the SQLite file"}),(0,O.jsx)("span",{className:"xray-sql-drop-note",children:"Opens read-only. Nothing leaves your machine."})]})})]}),(0,O.jsx)(UT,{}),(0,O.jsx)(BP,{})]})}var _e,O,cp,up,Cl,tO=F(()=>{"use strict";_e=J(bt());Ar();Fa();Gd();_b();Ed();kf();ub();mb();qT();_T();jT();GT();eD();$D();O=J(Te()),cp={size:16,stroke:1.8},up=Fd(typeof navigator>"u"?"":navigator.platform),Cl=kb(up)});function FP(t){return Array.isArray(t)?t.filter(n=>n&&typeof n.id=="string"&&typeof n.code=="string").slice(0,30).map(n=>({id:n.id,title:n.title,code:n.code})):void 0}function rO(t){let e=FP(t.snippets);return{...t.activeTab&&EP.includes(t.activeTab)?{activeTab:t.activeTab}:{},...t.detailView?{detailView:t.detailView}:{},...t.detailTab?{detailTab:t.detailTab}:{},...t.consoleMiniTab?{consoleMiniTab:t.consoleMiniTab}:{},...t.networkFilter?{networkFilter:t.networkFilter}:{},...typeof t.apiSearchQuery=="string"?{apiSearchQuery:t.apiSearchQuery}:{},...t.apiQuickFilter?{apiQuickFilter:t.apiQuickFilter}:{},...t.apiGroupingMode?{apiGroupingMode:t.apiGroupingMode}:{},...typeof t.apiDetailOpen=="boolean"?{apiDetailOpen:t.apiDetailOpen}:{},...t.apiDrawerPlacement?{apiDrawerPlacement:t.apiDrawerPlacement}:{},...Array.isArray(t.methodFilters)?{methodFilters:new Set(t.methodFilters)}:{},...Array.isArray(t.statusFilters)?{statusFilters:new Set(t.statusFilters)}:{},...Array.isArray(t.typeFilters)?{typeFilters:new Set(t.typeFilters)}:{},...Array.isArray(t.expandedGroups)?{expandedGroups:new Set(t.expandedGroups)}:{},...Array.isArray(t.collapsedSections)?{collapsedSections:new Set(t.collapsedSections)}:{},...t.sortField?{sortField:t.sortField}:{},...t.sortOrder?{sortOrder:t.sortOrder}:{},...typeof t.recording=="boolean"?{recording:t.recording}:{},...Array.isArray(t.pinnedIds)?{pinnedIds:new Set(t.pinnedIds)}:{},...e?{snippets:e}:{},...t.settings?{settings:RT(t.settings)}:{}}}var nO,EP,oO=F(()=>{"use strict";Gd();nO="react_panel_preferences",EP=["console","api","logs","rules","insights","sql"]});function iO(t,e){return e||t.every(n=>LP.test(n))}var aO,LP,lO=F(()=>{"use strict";aO="xray:sql-frame-ready",LP=/^(chrome-extension|devtools):\/\//});function sO({label:t,hint:e,icon:n,action:r}){return(0,zo.jsxs)("div",{className:"xray-empty",role:"status",children:[(0,zo.jsx)("span",{className:"xray-empty-glyph",children:n||(0,zo.jsx)(mx,{size:26,stroke:1.5})}),(0,zo.jsx)("p",{className:"xray-empty-title",children:t}),e&&(0,zo.jsx)("p",{className:"xray-empty-hint",children:e}),r&&(0,zo.jsx)("div",{className:"xray-empty-action",children:r})]})}var zo,fO=F(()=>{"use strict";Ar();zo=J(Te())});var cO,uO=F(()=>{cO=`:host,
.xray-app-root {
  /* Fallback contract for anything rendered outside a theme class (the first paint of
     the HUD and window before mount): the XRAY Dark default's palette, value for value
     (test/theming-tokens.test.js pins it to the .xray-theme-xray-dark block). Preset
     classes and custom inline variables override these values inside the panel scope. */
  --xray-bg: #141517;
  --xray-surface: #1b1c1f;
  --xray-surface2: #25272a;
  --xray-surface3: #303235;
  /* RGB triples so translucent surfaces (rgba(var(--\u2026-rgb), a)) adapt per theme */
  --xray-bg-rgb: 20, 21, 23;
  --xray-surface-rgb: 27, 28, 31;
  --xray-surface2-rgb: 37, 39, 42;
  --xray-text-rgb: 238, 239, 241;
  /* corner-radius scale \u2014 base is set inline per-panel from settings.radius */
  --xray-radius: 10px;
  --xray-radius-sm: calc(var(--xray-radius) * 0.6);
  --xray-radius-lg: calc(var(--xray-radius) * 1.4);
  /* motion system \u2014 one easing/duration language across the UI */
  --xray-ease: cubic-bezier(0.22, 0.8, 0.28, 1);
  --xray-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --xray-dur-fast: 120ms;
  --xray-dur: 180ms;
  --xray-text: #eeeff1;
  --xray-subtext: #bcbfc5;
  --xray-hint: #90949b;
  --xray-border: #34363a;
  --xray-border-control: #71757b;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #25272a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #5a5e63;
  --xray-accent: #3dc8f5;
  --xray-accent-soft: var(--xray-selection);
  --xray-green: #65d68a;
  --xray-blue: #96b2fb;
  --xray-yellow: #f6c65b;
  --xray-red: #f8767a;
  --xray-mauve: #c6a0f2;
  --xray-teal: #5cd5c7;
  --xray-peach: #f5a166;
  --xray-pending: #f6c65b;
  --xray-neutral: #90949b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(20, 21, 23, .74);
  --xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  /* Spec S2: chrome (tabs, buttons, menus, Settings, modals, toasts) uses the platform UI sans;
     --xray-font above (the Font stack setting) stays the monospace data font. No web fonts. */
  --xray-font-ui: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
`});var dO,pO=F(()=>{dO=`* {
  box-sizing: border-box;
}

.xray-app-root {
  all: initial;
  color: var(--xray-text);
  font-family: var(--xray-font-ui);
}

/* Spec S2, two type roles: chrome reads in --xray-font-ui, data in --xray-font (the Font stack
   setting, monospace). Form controls don't inherit a font, so they get the UI stack here; code-ish
   elements get the data stack. Zero specificity: any component rule (a console input, a JSON
   editor, a rule body) still picks its own role. */
:where(.xray-app-root) :where(button, input, select, textarea) {
  font-family: var(--xray-font-ui);
}

:where(.xray-app-root) :where(pre, code, kbd, samp) {
  font-family: var(--xray-font);
}

.xray-app-root *,
.xray-hud * {
  scrollbar-color: var(--xray-scroll-thumb, color-mix(in srgb, var(--xray-hint) 62%, transparent)) rgba(var(--xray-bg-rgb), .44);
  scrollbar-width: thin;
  /* Absorb overscroll inside the panel so scrolling a list/detail to its edge
     never chains through to the website behind an injected side panel or HUD. */
  overscroll-behavior: contain;
}

/* ...but anything nested inside a scroll region hands its overscroll up to that
   region, which still contains it. Otherwise an inner element that is a scroll
   container in name only (e.g. a tree with overflow-x:auto, whose overflow-y then
   computes to auto) latches the wheel and nothing scrolls at all. */
:is(.xray-console-stream, .xray-result-body, .xray-inspector-body, .xray-cell-stack-body,
  .xray-virtual-list, .xray-detail, .xray-detail-panel, .xray-detail-content,
  .xray-api-table-scroll, .xray-request-context-content, .xray-modal-body,
  .xray-settings-content, .xray-export-rail, .xray-log-detail-body, .xray-logs-detail-body,
  .xray-frames-list, .xray-command-list, .xray-gsearch-list) * {
  overscroll-behavior: auto;
}

.xray-app-root *::-webkit-scrollbar,
.xray-hud *::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.xray-app-root *::-webkit-scrollbar-track,
.xray-hud *::-webkit-scrollbar-track {
  background: rgba(var(--xray-bg-rgb), .44);
}

.xray-app-root *::-webkit-scrollbar-thumb,
.xray-hud *::-webkit-scrollbar-thumb {
  border: 2px solid rgba(var(--xray-bg-rgb), .44);
  border-radius: 999px;
  background: var(--xray-scroll-thumb, color-mix(in srgb, var(--xray-hint) 72%, transparent));
}

.xray-app-root *::-webkit-scrollbar-thumb:hover,
.xray-hud *::-webkit-scrollbar-thumb:hover {
  /* Neutral, a step stronger than the resting thumb (not the status blue; --xray-hover would
     vanish against the track). */
  background: color-mix(in srgb, var(--xray-hint) 92%, transparent);
}

.xray-panel {
  /* The panel is a size container: everything inside responds to the PANEL's
     width via @container rules, not the window's \u2014 a 380px docked panel on a
     4K monitor must stack exactly like a small window. Modals are DOM siblings
     of the panel (see App.tsx), so the layout containment this creates never
     affects their fixed positioning. */
  container-type: inline-size;
  container-name: xray;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 2147483647;
  width: var(--xray-panel-width, min(960px, 94vw));
  max-width: 96vw;
  height: 100vh;
  display: none;
  flex-direction: column;
  color: var(--xray-text);
  background: var(--xray-bg);
  border-left: 1px solid var(--xray-border);
  box-shadow: -20px 0 80px var(--xray-shadow);
  font: 12px/1.45 var(--xray-font-ui);
  overflow: hidden;
}

/* Left-dock mirror of the base (right-docked) side panel. Only added in the docked
   side panel; the floating HUD's hud.css neutralizes it, and devtools/window modes
   never get the dock class. */
.xray-panel.xray-dock-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid var(--xray-border);
  box-shadow: 20px 0 80px var(--xray-shadow);
}

/* Slide-in on open (docked side panel). One-shot animation, not a persistent
   transform, so it never leaves a containing block behind for fixed children.
   The right/left keyframes match the dock edge. Neutralized by reduced-motion. */
@keyframes xray-panel-slide-right {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes xray-panel-slide-left {
  from { transform: translateX(-24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.xray-panel.xray-mode-hud.xray-dock-right.xray-open {
  animation: xray-panel-slide-right .22s var(--xray-ease-out, cubic-bezier(.2, .7, .3, 1));
}

.xray-panel.xray-mode-hud.xray-dock-left.xray-open {
  animation: xray-panel-slide-left .22s var(--xray-ease-out, cubic-bezier(.2, .7, .3, 1));
}

/* Drag grabber on the panel's inner edge (toward the page). Scoped as a direct
   child of .xray-panel so it outranks the broad \`.xray-panel > * { position:
   relative }\` rule below \u2014 otherwise the handle collapses to 0 height (top:0 +
   bottom:0 on a position:relative box) and can't be grabbed. */
.xray-panel > .xray-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  z-index: 6;
  cursor: ew-resize;
  touch-action: none;
  background: transparent;
  transition: background var(--xray-dur-fast, .12s) ease;
}

.xray-panel.xray-dock-right .xray-resize-handle { left: -1px; }
.xray-panel.xray-dock-left .xray-resize-handle { right: -1px; }

.xray-resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 44px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--xray-hint);
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease, background var(--xray-dur-fast, .12s) ease;
}

/* A drag affordance is neutral (spec A1); keyboard focus marks it with the focus colour. */
.xray-resize-handle:hover,
.xray-resize-handle.dragging {
  background: rgba(var(--xray-text-rgb), .08);
}

.xray-resize-handle:focus-visible {
  background: color-mix(in srgb, var(--xray-focus) 22%, transparent);
  outline: none;
}

.xray-resize-handle:hover::after,
.xray-resize-handle.dragging::after {
  opacity: 1;
}

.xray-resize-handle:focus-visible::after {
  opacity: 1;
  background: var(--xray-focus);
}

/* Dock / close cluster, separated from the mode switcher by a hairline. */
.xray-dock-controls {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px solid var(--xray-border);
}

.xray-close-btn:hover {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

/* The theme scope carries color tokens to the panel AND its sibling modals via
   inheritance; display:contents means it adds no layout box. */
.xray-theme-scope {
  display: contents;
}

/* Theme token blocks key off the theme class alone (present on both .xray-theme-scope
   and .xray-panel), so popups rendered outside .xray-panel inherit the active theme. */
.xray-theme-midnight {
  /* High Contrast \u2014 compatibility \`midnight\` ID. The accent is a cyan at 7:1, apart from the gold
     warning colour and the blue, teal and green; the selection tints are a third and two fifths of it. */
  --xray-bg: #000000;
  --xray-surface: #101010;
  --xray-surface2: #1d1d1d;
  --xray-surface3: #2b2b2b;
  --xray-bg-rgb: 0, 0, 0;
  --xray-surface-rgb: 16, 16, 16;
  --xray-surface2-rgb: 29, 29, 29;
  --xray-text-rgb: 255, 255, 255;
  --xray-text: #ffffff;
  --xray-subtext: #eeeeee;
  --xray-hint: #c8c8c8;
  --xray-border: #ffffff;
  --xray-border-control: #ffffff;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 13.5%, var(--xray-bg));
  --xray-hover: #2a2a2a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 40%, var(--xray-bg));
  --xray-disabled: #a0a0a0;
  --xray-accent: #00e5ff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #70c7ff;
  --xray-mauve: #d4a8ff;
  --xray-green: #75e6a8;
  --xray-yellow: #ffd166;
  --xray-red: #ff9da3;
  --xray-teal: #6de0d0;
  --xray-peach: #ffd166;
  --xray-pending: #ffd166;
  --xray-neutral: #c8c8c8;
  --xray-shadow: rgba(0, 0, 0, .7);
  --xray-overlay: rgba(0, 0, 0, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}

/* Preset lineup (Settings \u2192 Appearance, in picker order; High Contrast is .xray-theme-midnight
   above). Each block owns its accent; a picked accent swatch is set inline over it. Values:
   docs/superpowers/specs/assets/2026-10-14-theme-lineup.css, moved in OKLCH lightness only where
   test/unit/themeContrast.test.mjs (every preset \xD7 every accent swatch) or the distinct-meanings
   test (test/unit/themePresets.test.mjs) required it.
   --xray-focus is var(--xray-accent): the inline accent sits on the same elements as the theme
   class, so focus rings follow the effective accent (the block's own or a picked swatch). The
   accent-derived state tints follow it the same way: --xray-selection (the selected row, spec S5;
   --xray-accent-soft, the active tab's fill, is the same tint), --xray-active (pressed controls)
   and --xray-operator-grid (the Glow grid) are color-mix()es of var(--xray-accent) whose
   percentages reproduce the lineup's values for the block's own accent.
   Light presets set --xray-sink: #ffffff; dark ones keep the black fallback. */

/* XRAY Dark: neutral graphite, one cyan accent that no status colour shares. */
.xray-theme-xray-dark {
  --xray-bg: #141517;
  --xray-surface: #1b1c1f;
  --xray-surface2: #25272a;
  --xray-surface3: #303235;
  --xray-bg-rgb: 20, 21, 23;
  --xray-surface-rgb: 27, 28, 31;
  --xray-surface2-rgb: 37, 39, 42;
  --xray-text-rgb: 238, 239, 241;
  --xray-text: #eeeff1;
  --xray-subtext: #bcbfc5;
  --xray-hint: #90949b;
  --xray-border: #34363a;
  --xray-border-control: #71757b;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #25272a;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #5a5e63;
  --xray-accent: #3dc8f5;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #96b2fb;
  --xray-mauve: #c6a0f2;
  --xray-green: #65d68a;
  --xray-yellow: #f6c65b;
  --xray-red: #f8767a;
  --xray-teal: #5cd5c7;
  --xray-peach: #f5a166;
  --xray-pending: #f6c65b;
  --xray-neutral: #90949b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(20, 21, 23, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* XRAY Light: cool white panes, same accent hue as XRAY Dark. */
.xray-theme-xray-light {
  --xray-bg: #f3f4f6;
  --xray-surface: #ffffff;
  --xray-surface2: #eaecef;
  --xray-surface3: #dde0e4;
  --xray-bg-rgb: 243, 244, 246;
  --xray-surface-rgb: 255, 255, 255;
  --xray-surface2-rgb: 234, 236, 239;
  --xray-text-rgb: 22, 23, 26;
  --xray-text: #16171a;
  --xray-subtext: #4b4f55;
  --xray-hint: #646971;
  --xray-border: #d7d9dd;
  --xray-border-control: #83878f;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 9.5%, var(--xray-bg));
  --xray-hover: #dddfe2;
  --xray-active: color-mix(in srgb, var(--xray-accent) 21.5%, var(--xray-bg));
  --xray-disabled: #a1a5ab;
  --xray-accent: #00698f;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #3d5abe;
  --xray-mauve: #793fad;
  --xray-green: #007138;
  --xray-yellow: #7d5300;
  --xray-red: #b01e27;
  --xray-teal: #006d69;
  --xray-peach: #9c3e00;
  --xray-pending: #7d5300;
  --xray-neutral: #646971;
  --xray-shadow: rgba(22, 23, 26, .16);
  --xray-overlay: rgba(243, 244, 246, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 4%, transparent);
  --xray-sink: #ffffff;
  --xray-scroll-thumb: color-mix(in srgb, var(--xray-hint) 74%, transparent);
}

/* GitHub Dark: Primer dark. */
.xray-theme-github-dark {
  --xray-bg: #0d1117;
  --xray-surface: #161b22;
  --xray-surface2: #21262d;
  --xray-surface3: #30363d;
  --xray-bg-rgb: 13, 17, 23;
  --xray-surface-rgb: 22, 27, 34;
  --xray-surface2-rgb: 33, 38, 45;
  --xray-text-rgb: 230, 237, 243;
  --xray-text: #e6edf3;
  --xray-subtext: #c9d1d9;
  --xray-hint: #8a939d;
  --xray-border: #30363d;
  --xray-border-control: #6e7681;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 10.5%, var(--xray-bg));
  --xray-hover: #21262d;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27%, var(--xray-bg));
  --xray-disabled: #484f58;
  --xray-accent: #5297ff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #79c0ff;
  --xray-mauve: #ad7fff;
  --xray-green: #3fb950;
  --xray-yellow: #d29922;
  --xray-red: #ff6056;
  --xray-teal: #39c5cf;
  --xray-peach: #e77835;
  --xray-pending: #d29922;
  --xray-neutral: #8a939d;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(13, 17, 23, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* GitHub Light: Primer light (fg roles). */
.xray-theme-github-light {
  --xray-bg: #f6f8fa;
  --xray-surface: #ffffff;
  --xray-surface2: #eaeef2;
  --xray-surface3: #d0d7de;
  --xray-bg-rgb: 246, 248, 250;
  --xray-surface-rgb: 255, 255, 255;
  --xray-surface2-rgb: 234, 238, 242;
  --xray-text-rgb: 31, 35, 40;
  --xray-text: #1f2328;
  --xray-subtext: #424a53;
  --xray-hint: #646c75;
  --xray-border: #d0d7de;
  --xray-border-control: #6e7781;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 8%, var(--xray-bg));
  --xray-hover: #dadee1;
  --xray-active: color-mix(in srgb, var(--xray-accent) 21.5%, var(--xray-bg));
  --xray-disabled: #8c959f;
  --xray-accent: #005eca;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #004498;
  --xray-mauve: #723cca;
  --xray-green: #00722b;
  --xray-yellow: #815500;
  --xray-red: #b9001f;
  --xray-teal: #006d74;
  --xray-peach: #a03f00;
  --xray-pending: #815500;
  --xray-neutral: #646c75;
  --xray-shadow: rgba(31, 35, 40, .16);
  --xray-overlay: rgba(246, 248, 250, .86);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 4%, transparent);
  --xray-sink: #ffffff;
  --xray-scroll-thumb: color-mix(in srgb, var(--xray-hint) 74%, transparent);
}

/* Tokyo Night: navy + periwinkle. */
.xray-theme-tokyo-night {
  --xray-bg: #16161e;
  --xray-surface: #1a1b26;
  --xray-surface2: #292e42;
  --xray-surface3: #3b4261;
  --xray-bg-rgb: 22, 22, 30;
  --xray-surface-rgb: 26, 27, 38;
  --xray-surface2-rgb: 41, 46, 66;
  --xray-text-rgb: 192, 202, 245;
  --xray-text: #c0caf5;
  --xray-subtext: #a9b1d6;
  --xray-hint: #9094b2;
  --xray-border: #101014;
  --xray-border-control: #6d769a;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 12.5%, var(--xray-bg));
  --xray-hover: #2f3449;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27.5%, var(--xray-bg));
  --xray-disabled: #545c7e;
  --xray-accent: #7ba4f9;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #7dcfff;
  --xray-mauve: #bb9af7;
  --xray-green: #9ece6a;
  --xray-yellow: #e0af68;
  --xray-red: #fa7990;
  --xray-teal: #73daca;
  --xray-peach: #ff9e64;
  --xray-pending: #e0af68;
  --xray-neutral: #9094b2;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(22, 22, 30, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Catppuccin Mocha: mauve + pastels. */
.xray-theme-catppuccin-mocha {
  --xray-bg: #181825;
  --xray-surface: #1e1e2e;
  --xray-surface2: #313244;
  --xray-surface3: #45475a;
  --xray-bg-rgb: 24, 24, 37;
  --xray-surface-rgb: 30, 30, 46;
  --xray-surface2-rgb: 49, 50, 68;
  --xray-text-rgb: 205, 214, 244;
  --xray-text: #cdd6f4;
  --xray-subtext: #a6adc8;
  --xray-hint: #959ab3;
  --xray-border: #45475a;
  --xray-border-control: #777b92;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 14%, var(--xray-bg));
  --xray-hover: #313244;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #6c7086;
  --xray-accent: #cba6f7;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #89b4fa;
  /* Data mauve is the palette's pink: Catppuccin's mauve is this preset's accent (\u0394E2000 \u2265 10). */
  --xray-mauve: #f5c2e7;
  --xray-green: #a6e3a1;
  --xray-yellow: #f9e2af;
  --xray-red: #f38ba8;
  --xray-teal: #94e2d5;
  --xray-peach: #fab387;
  --xray-pending: #f9e2af;
  --xray-neutral: #959ab3;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(24, 24, 37, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Dracula: purple accent, neon status hues. Blue is the palette's cyan; teal is that cyan, darkened
   until the two read apart (Dracula has no second blue). */
.xray-theme-dracula {
  --xray-bg: #21222c;
  --xray-surface: #282a36;
  --xray-surface2: #343746;
  --xray-surface3: #44475a;
  --xray-bg-rgb: 33, 34, 44;
  --xray-surface-rgb: 40, 42, 54;
  --xray-surface2-rgb: 52, 55, 70;
  --xray-text-rgb: 248, 248, 242;
  --xray-text: #f8f8f2;
  --xray-subtext: #adb5cb;
  --xray-hint: #8d9fd4;
  --xray-border: #424450;
  --xray-border-control: #6f80b2;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 11.5%, var(--xray-bg));
  --xray-hover: #343746;
  --xray-active: color-mix(in srgb, var(--xray-accent) 27%, var(--xray-bg));
  --xray-disabled: #6272a4;
  --xray-accent: #c59dff;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #8be9fd;
  --xray-mauve: #ff86ca;
  --xray-green: #50fa7b;
  --xray-yellow: #f1fa8c;
  --xray-red: #ff8f88;
  --xray-teal: #62c0d4;
  --xray-peach: #ffb86c;
  --xray-pending: #f1fa8c;
  --xray-neutral: #8d9fd4;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(33, 34, 44, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Gruvbox Dark: warm brown-grey with the palette's aqua as the accent, apart from error red, warning
   yellow and peach (orange). Teal is the palette's neutral blue, lightened to read and to stay clear of
   the accent and --xray-blue. */
.xray-theme-gruvbox-dark {
  --xray-bg: #1d2021;
  --xray-surface: #282828;
  --xray-surface2: #3c3836;
  --xray-surface3: #504945;
  --xray-bg-rgb: 29, 32, 33;
  --xray-surface-rgb: 40, 40, 40;
  --xray-surface2-rgb: 60, 56, 54;
  --xray-text-rgb: 235, 219, 178;
  --xray-text: #ebdbb2;
  --xray-subtext: #bdae93;
  --xray-hint: #afa08b;
  --xray-border: #504945;
  --xray-border-control: #8e8075;
  --xray-focus: var(--xray-accent);
  --xray-selection: color-mix(in srgb, var(--xray-accent) 13.5%, var(--xray-bg));
  --xray-hover: #44403e;
  --xray-active: color-mix(in srgb, var(--xray-accent) 28%, var(--xray-bg));
  --xray-disabled: #7c6f64;
  --xray-accent: #8ec07c;
  --xray-accent-soft: var(--xray-selection);
  --xray-blue: #96b9ab;
  --xray-mauve: #ea9bb0;
  --xray-green: #b8bb26;
  --xray-yellow: #fabd2f;
  --xray-red: #ff9380;
  --xray-teal: #8ecfd2;
  --xray-peach: #ff9651;
  --xray-pending: #fabd2f;
  --xray-neutral: #afa08b;
  --xray-shadow: rgba(0, 0, 0, .40);
  --xray-overlay: rgba(29, 32, 33, .74);
  --xray-operator-grid: color-mix(in srgb, var(--xray-accent) 3.5%, transparent);
}

/* Semantic interaction roles keep keyboard and pointer states consistent across
   presets, custom themes, sibling modals, and the HUD. */
.xray-app-root :is(button, input, textarea, select, [tabindex]):focus-visible,
.xray-hud :is(button, input, textarea, select, [tabindex]):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-panel {
  box-shadow: -20px 0 80px var(--xray-shadow);
}

.xray-panel .xray-input,
.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea,
.xray-panel .xray-select {
  border-color: var(--xray-border-control);
}

.xray-panel .xray-input:focus,
.xray-panel .xray-prompt input:focus,
.xray-panel .xray-prompt textarea:focus,
.xray-panel .xray-select:focus {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 38%, transparent);
}

/* Calm accent (spec A1): the active top tab sits on the accent-soft fill. Active chips, selected
   rows and primary buttons paint their own fills below (neutral, or the primary's flat accent). */
.xray-panel .xray-tab.active {
  background: var(--xray-accent-soft);
}


.xray-panel .xray-modal-backdrop,
.xray-panel + .xray-modal-backdrop {
  background: var(--xray-overlay);
}

.xray-panel.xray-density-compact {
  --xray-density-scale: .88;
  --xray-row-h: 42px;
  --xray-chrome-h: 40px;
}

.xray-panel.xray-density-comfortable {
  --xray-density-scale: 1;
  --xray-row-h: 52px;
  --xray-chrome-h: 46px;
}

.xray-panel.xray-density-spacious {
  --xray-density-scale: 1.14;
  --xray-row-h: 64px;
  --xray-chrome-h: 52px;
}

.xray-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Surfaces are flat token colours (spec A3): the background grid is part of the opt-in Glow
   effect, and nothing washes the panel with the accent or mauve. */
.xray-panel.xray-glow::before {
  background:
    linear-gradient(90deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    linear-gradient(180deg, var(--xray-operator-grid, transparent) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: .8;
}

.xray-panel > * {
  position: relative;
  z-index: 1;
}

.xray-panel.xray-open,
.xray-panel.xray-devtools {
  display: flex;
}

.xray-panel.xray-devtools {
  position: fixed;
  inset: 0;
  width: 100vw;
  /* max-width beats width, and the base rule caps the DOCKED panel at 96vw so it can
     never fully cover a small page. Without this reset the fullscreen surfaces
     inherited that cap and leaked a 4vw strip of raw document background. */
  max-width: 100vw;
  height: 100vh;
  border: 0;
  box-shadow: none;
}

.xray-panel.xray-mode-window {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  border: 0;
  box-shadow: none;
}

.xray-topbar {
  height: var(--xray-chrome-h, 44px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
  flex-shrink: 0;
}

.xray-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.xray-drag-handle {
  cursor: grab;
}

.xray-drag-handle:active {
  cursor: grabbing;
}

.xray-brand-mark {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Neutral (spec A1, A2): the brand is not a state, so it carries neither the accent nor mauve. */
  color: var(--xray-text);
  background: var(--xray-surface3);
  border-radius: var(--xray-radius);
}

.xray-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--xray-hint);
}

.xray-live-dot.on {
  background: var(--xray-green);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-green) 18%, transparent), 0 0 16px color-mix(in srgb, var(--xray-green) 55%, transparent);
}

.xray-tabs,
.xray-filter-chips {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* The tablist claims its content width first and absorbs any deficit by scrolling.
   It used to have no shrink priority of its own, so the flex deficit was paid by the
   trailing icon buttons instead: they collapsed from a declared 28px to 18px at the
   DEFAULT 960px panel width, under the 24px floor a pointer target needs. */
.xray-tabs {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  /* Room for the focus ring. Turning this into a scroll container makes it clip on
     BOTH axes, and the ring is drawn 2px outside the tab, so without the padding a
     keyboard user sees it sliced into two vertical fragments. */
  padding: 3px 0;
}

.xray-topbar > .xray-icon-btn,
.xray-topbar .xray-mode-switcher,
.xray-topbar .xray-dock-controls,
.xray-topbar .xray-theme-switcher {
  flex: 0 0 auto;
}

.xray-tab,
.xray-btn,
.xray-chip,
.xray-icon-btn {
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 12px/1 var(--xray-font-ui);
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
}

.xray-tab {
  height: calc(var(--xray-chrome-h, 44px) - 12px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: var(--xray-radius);
  letter-spacing: 0;
  font-size: calc(12px * var(--xray-density-scale, 1));
}

.xray-tab:hover,
.xray-btn:hover,
.xray-chip:hover,
.xray-icon-btn:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

/* Calm accent (spec A1): the active top tab is one of the few things the accent paints (its fill,
   --xray-accent-soft, comes from the semantic rule above; ::after draws its indicator). */
.xray-tab.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 64%, transparent);
}

/* Glow is opt-in (spec A3): a halo on the active tab. */
.xray-glow .xray-tab.active {
  box-shadow: 0 0 22px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

/* Every other active or pressed control is neutral: text on --xray-surface3, outlined with the
   control border, which reads at 3:1 without the accent. */
.xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-no-glow .xray-live-dot.on {
  box-shadow: none;
}

.xray-badge {
  min-width: 18px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-hint) 28%, transparent);
  font-size: 9px;
}

.xray-spacer {
  flex: 1;
}

/* Pushes the trailing cluster right without an extra flex child. The header used to
   use a .xray-spacer for this, which claimed the same leftover space as the tablist
   beside it and took half of whatever survived. */
.xray-topbar > .xray-summary {
  margin-left: auto;
}

.xray-summary {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext);
  font-size: calc(11px * var(--xray-density-scale, 1));
  letter-spacing: .02em;
}

.xray-mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.xray-mode-switcher .xray-icon-btn.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--xray-bg);
}

.xray-console-head {
  display: flex;
  align-items: center;
  min-height: 44px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-console-title {
  min-width: 0;
  padding: 0 12px;
  color: var(--xray-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
}

.xray-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-right: 8px;
}

.xray-btn,
.xray-icon-btn {
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border-color: var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .74);
  color: var(--xray-text);
}

/* The primary action's flat accent tint (spec A2) has one source: the theme-scope rule in the
   operator override layer, which also reaches modals (siblings of .xray-panel). */

.xray-btn.danger {
  color: var(--xray-red);
  border-color: color-mix(in srgb, var(--xray-red) 42%, transparent);
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
}

.xray-icon-btn {
  width: 32px;
  justify-content: center;
  padding: 0;
}

.xray-filterbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(0, auto);
  gap: 8px;
  padding: 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-search {
  position: relative;
  min-width: 0;
}

.xray-search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--xray-hint);
}

.xray-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 0 12px 0 38px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .5);
  font: 700 13px/1 var(--xray-font-ui);
}

.xray-input:focus,
.xray-prompt input:focus,
.xray-prompt textarea:focus {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-focus) 48%, transparent);
}

/* Chips wrap onto multiple rows rather than overflowing/clipping \u2014 a narrow
   panel must never hide filters behind an invisible horizontal scroll. */
.xray-filter-chips {
  flex-wrap: wrap;
  row-gap: 5px;
}

.xray-console-workspace .xray-filter-chips {
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
  white-space: nowrap;
}

.xray-filter-chips.compact {
  gap: 6px;
  flex-wrap: wrap;
}

.xray-chip {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border-color: var(--xray-border);
  border-radius: var(--xray-radius);
  white-space: nowrap;
}

.xray-filter-chips.compact .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.xray-virtual-list {
  position: relative;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.xray-method {
  color: var(--xray-green);
}

.xray-method.post,
.xray-method.put {
  color: var(--xray-yellow);
}

.xray-method.delete,
.xray-method.del {
  color: var(--xray-red);
}

.xray-status.ok {
  color: var(--xray-green);
}

.xray-status.warn {
  color: var(--xray-yellow);
}

.xray-status.error {
  color: var(--xray-red);
}

/* In flight: no response yet (spec S5). */
.xray-status.pending {
  color: var(--xray-pending);
}

.xray-path {
  min-width: 0;
  /* Inside the panel this is overridden by \`.xray-panel .xray-path\` below, which
     is why the Catppuccin lavender that used to sit here was invisible in an
     audit of the rendered UI \u2014 it only ever painted outside a .xray-panel
     ancestor. Same value as that rule so the two cannot drift apart: plain
     text, not tinted toward the accent (spec A1). */
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-muted {
  color: var(--xray-hint);
}

.xray-timing {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 6px;
}

.xray-bar-track {
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-hint) 34%, transparent);
  overflow: hidden;
}

/* Blockified so width/height apply at all. As a plain inline span this measured
   0x0 in every theme, so the Insights status-mix chart never drew and all twenty
   duration bars in the API list were invisible. The track above is a grid item, so
   it was blockified implicitly and looked fine \u2014 which is why this went unnoticed. */
.xray-bar {
  display: block;
  min-width: 3px;
  height: 100%;
  border-radius: 999px;
  background: var(--xray-blue);
}

.xray-bar.slow {
  background: var(--xray-yellow);
}

.xray-bar.error {
  background: var(--xray-red);
}

.xray-console-stream-wrap {
  position: relative;
  min-height: 28px;
  flex: 1 1 28px;
  display: flex;
}

.xray-console-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* The inspector docks by the Console's own width (spec C7), not the panel's. */
  container: xray-console / inline-size;
}

/* \u2500\u2500 Console inspector (spec C6\u2013C7) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Below 900 px of Console width the inspector is a full-height overlay with
   Back; at \u2265 900 px it docks right of the stream, resizable by PaneDivider.
   ConsoleWorkspace reads --xray-console-docked back, so the semantics (dialog
   vs complementary) always match what this query paints. */
.xray-console-layout {
  --xray-console-docked: 0;
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}

.xray-console-column {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.xray-inspector-pane {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  min-width: 0;
  min-height: 0;
}

.xray-inspector-pane > .xray-pane-divider {
  left: -5px;
  right: auto;
}

@container xray-console (min-width: 900px) {
  .xray-console-layout {
    --xray-console-docked: 1;
  }

  .xray-inspector-pane {
    position: relative;
    inset: auto;
    z-index: auto;
    flex: 0 0 clamp(320px, 38%, 640px);
    border-left: 1px solid var(--xray-border);
  }

  .xray-console-layout[data-split] > .xray-console-column {
    flex: 0 0 var(--xray-console-split);
  }

  .xray-console-layout[data-split] > .xray-inspector-pane {
    flex: 1 1 0;
    min-width: 320px;
  }
}

.xray-inspector {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  color: var(--xray-text);
  background: var(--xray-bg);
}

.xray-inspector:focus-visible {
  outline: none;
}

.xray-inspector-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-inspector-back {
  flex: 0 0 auto;
}

.xray-inspector-title {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.xray-inspector-kicker {
  color: var(--xray-subtext);
  font: 700 10px/1.3 var(--xray-font-ui);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.xray-inspector-label {
  overflow: hidden;
  font: 700 12px/1.4 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-inspector-close {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
}

/* The inspected value's stated cap, on its own line under the header (spec J8). */
.xray-inspector-notice {
  margin: 0;
  padding: 6px 10px 0;
}

.xray-inspector-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
}

.xray-inspector-filter {
  flex: 1 1 160px;
  min-width: 0;
}

.xray-inspector-filter .xray-input {
  height: 30px;
  font-size: 12px;
}

.xray-inspector-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 10px 8px;
}

.xray-inspector-body .xray-result-json {
  margin: 0;
}

.xray-inspector-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
  padding: 8px 10px;
  border-top: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface2-rgb), .5);
}

.xray-inspector-path {
  flex: 1 1 160px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-inspector-path.is-empty {
  color: var(--xray-subtext);
  font-weight: 600;
}

.xray-inspector-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  margin-left: auto;
}

.xray-inspector-actions .xray-btn:disabled {
  opacity: .5;
  cursor: default;
}

/* C6: a big result in its cell \u2014 summary line and Open in inspector. */
.xray-result-big {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
}

.xray-result-summary {
  flex: 1 1 220px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 600 11.5px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-inspect {
  flex: 0 0 auto;
}

.xray-console-inspect {
  flex: 0 0 auto;
  width: 24px;
  height: 22px;
}

/* overflow: hidden here made the stream wheel-unscrollable \u2014 the virtualizer
   could move it programmatically but the user could not. */
.xray-console-stream {
  min-height: 28px;
  flex: 1;
  background: var(--xray-bg);
  overflow-y: auto;
}

.xray-newmsg-pill {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .95);
  box-shadow: 0 6px 18px var(--xray-shadow);
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
  /* "N new messages \xB7 Jump to latest" stays one line, even at 420 px. */
  white-space: nowrap;
  max-width: calc(100% - 24px);
}

.xray-newmsg-pill:hover {
  /* Opaque: the pill floats over stream text. */
  background: color-mix(in srgb, var(--xray-text) 8%, rgb(var(--xray-surface2-rgb)));
}

.xray-newmsg-pill:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-newmsg-sep {
  opacity: .6;
}

.xray-repeat-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 0;
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 600;
}

.xray-truncated-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 0;
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
  color: var(--xray-yellow);
  font-size: 10px;
  font-weight: 600;
}

.xray-error-stack {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--xray-red);
  font: 600 11px/1.5 var(--xray-font);
}

/* Filter counts are quiet data (spec A1): subtext, never the accent. */
.xray-chip-count {
  margin-left: 5px;
  padding: 0 6px;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface2-rgb), .9);
  font-size: 10px;
}

.xray-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-spin {
  animation: xray-spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .xray-spin { animation: none; }
}

.xray-console-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  /* Denser rows for a log stream where scan-density matters (research). */
  min-height: 26px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

/* Glyph + message: the row's expand toggle, a sibling of the aside's controls. */
.xray-console-toggle {
  display: grid;
  grid-column: 1 / 3;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
}

.xray-console-toggle[role="button"] {
  cursor: pointer;
}

.xray-console-toggle:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

/* Right-side cell: optional source location + timestamp. Timestamps read as
   optional clutter (Firefox/Chrome default them off), so keep them quiet and
   reveal on row hover; the source location stays for error provenance. */
.xray-console-aside {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.xray-console-source {
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-console-time {
  color: var(--xray-hint, var(--xray-subtext));
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease;
}

.xray-console-row:hover .xray-console-time,
.xray-console-row.command .xray-console-time,
.xray-console-row.result .xray-console-time {
  opacity: .65;
}

.xray-console-row.error {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
  border-left: 2px solid var(--xray-red);
}

.xray-console-row.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
  border-left: 2px solid var(--xray-yellow);
}

/* The REPL input/output stands apart from page-log noise by its full text colour (page logs are
   softened below) and its glyphs, not by a tint: mauve and the accent are not chrome colours
   (spec A2). */
.xray-console-row.command {
  color: var(--xray-text);
}

.xray-console-row.result {
  border-left: 2px solid var(--xray-border);
}

/* Leading gutter marker: quiet by default, colored only where it carries a status
   (error, warning); input and output read from their chevrons' shape, in the hint
   colour. Centered on the first text line. */
.xray-console-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  color: var(--xray-hint);
}

.xray-console-row.error .xray-console-glyph { color: var(--xray-red); }
.xray-console-row.warn .xray-console-glyph { color: var(--xray-yellow); }

/* A plain page log needs no icon \u2014 a small dot holds the gutter rhythm without
   stamping a terminal glyph on every single line. */
.xray-console-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--xray-hint) 70%, transparent);
}

.xray-console-message {
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Soften ordinary logs so errors, warnings and REPL results carry the eye. */
.xray-console-row.log .xray-console-message {
  color: color-mix(in srgb, var(--xray-text) 78%, var(--xray-hint));
}

.xray-detail {
  grid-column: 2 / 4;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface2);
}

/* \u2500\u2500 Command cells (spec C1\u2013C5): a command and its result as one card. \u2500\u2500
   A neutral card (spec A2: mauve is a data colour, not a second accent): its leading edge is
   the card's own outline, wider; an error (red) or a cancelled run (--xray-neutral, \u2265 3:1 on the card)
   gives it a colour of its own. */
.xray-command-cell {
  margin: 6px 10px;
  border: 1px solid var(--xray-border);
  border-left-width: 2px;
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  font-variant-numeric: tabular-nums;
}

.xray-command-cell.is-error {
  border-left-color: var(--xray-red);
}

.xray-command-cell.is-cancelled {
  border-left-color: var(--xray-neutral);
}

.xray-cell-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
  min-height: 34px;
  padding: 4px 6px 4px 8px;
}

.xray-cell-glyph {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--xray-hint);
}

.xray-cell-command {
  flex: 1 1 120px;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-command-cell.is-scalar .xray-cell-command {
  flex: 0 1 auto;
}

.xray-cell-lines {
  flex: 0 0 auto;
  padding: 1px 7px;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
  font-size: 10px;
  font-weight: 700;
}

.xray-cell-tail {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.xray-cell-time {
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-cell-actions,
.xray-result-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.xray-result-actions {
  margin-left: auto;
}

.xray-cell-action,
.xray-result-action {
  width: 26px;
  height: 24px;
  flex: 0 0 auto;
}

.xray-cell-action:disabled,
.xray-result-action:disabled {
  opacity: .45;
  cursor: default;
}

.xray-cell-menu-wrap {
  position: relative;
  display: inline-flex;
}

.xray-cell-menu {
  position: absolute;
  top: calc(100% + 4px);
  inset-inline-end: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 170px;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-cell-menu.is-up {
  top: auto;
  bottom: calc(100% + 4px);
}

.xray-cell-menu .xray-menu-item:disabled {
  opacity: .5;
  cursor: default;
}

/* Each virtual row is its own stacking context (transform); lift the one whose
   menu is open so the menu paints over its neighbours. */
.xray-console-stream [data-index]:has(.xray-cell-menu) {
  z-index: 5;
}

.xray-cell-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 2px 10px 8px 30px;
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 700;
}

.xray-cell-error {
  display: grid;
  gap: 6px;
  padding: 2px 10px 10px 30px;
}

.xray-cell-error-line,
.xray-cell-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  min-width: 0;
}

.xray-cell-error-line {
  color: var(--xray-red);
  font: 700 12px/1.5 var(--xray-font);
}

.xray-cell-error-line > svg,
.xray-cell-hint > svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.xray-cell-error-message {
  min-width: 0;
  color: var(--xray-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-cell-hint {
  color: var(--xray-subtext);
  font-size: 12px;
}

.xray-cell-hint > svg {
  color: var(--xray-yellow);
}

.xray-cell-stack {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  padding: 2px 6px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1.4 var(--xray-font);
  cursor: pointer;
}

.xray-cell-stack:hover,
.xray-cell-stack:focus-visible {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-hint) 16%, transparent);
}

.xray-cell-stack-body {
  max-height: 240px;
  overflow: auto;
}

.xray-cell-variable {
  padding: 1px 8px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  font: 700 11px/1.5 var(--xray-font);
}

/* Scalar results: one compact line inside the cell header. */
.xray-result-inline {
  display: inline-flex;
  flex: 1 1 140px;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.xray-result-arrow {
  color: var(--xray-subtext);
}

.xray-result-scalar {
  min-width: 0;
  overflow: hidden;
  font: 700 12px/1.5 var(--xray-font);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-badge {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* A console cap, stated beside the badge ("Showing 1,000 of 5,000 items", spec J8). */
.xray-result-notice {
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 700;
}

.xray-result {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 0 10px 10px 30px;
}

.xray-result-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
}

.xray-result-views {
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
}

.xray-result-view-btn {
  min-height: 22px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
  transition: background var(--xray-dur-fast) var(--xray-ease), color var(--xray-dur-fast) var(--xray-ease);
}

.xray-result-view-btn:hover {
  color: var(--xray-text);
}

.xray-result-view-btn[aria-pressed="true"] {
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-result-body {
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
}

.xray-result-table-wrap {
  min-width: 0;
}

.xray-table.xray-result-table {
  width: auto;
  min-width: min(100%, 320px);
}

.xray-result-table th {
  position: sticky;
  top: 0;
}

.xray-result-table td {
  max-width: 280px;
  overflow: hidden;
  color: var(--xray-text);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-result-more {
  margin: 0;
  padding: 6px 8px;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 700;
}

.xray-result-text,
.xray-result-json {
  margin: 0;
  padding: 8px 10px;
  white-space: pre-wrap;
  word-break: break-word;
  font: 600 11px/1.5 var(--xray-font);
}

.xray-result-body .xray-json-tree {
  padding: 4px 0;
}

/* The result body already draws the frame; drop the JSON skin's second border. */
.xray-panel .xray-result-body .xray-json {
  min-height: 100%;
  border: 0;
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  .xray-result-view-btn { transition: none; }
}

.xray-prompt {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
  padding: 8px 10px;
  border-top: 1px solid var(--xray-border);
  background: var(--xray-surface);
  flex-shrink: 0;
}

.xray-prompt-command-row,
.xray-prompt-context-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.xray-prompt-command-row > svg {
  flex: 0 0 auto;
}

.xray-prompt-command-row textarea {
  flex: 1 1 auto;
}

.xray-prompt-context-row {
  overflow: hidden;
}

.xray-prompt input,
.xray-prompt textarea {
  min-height: 34px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 9px 10px;
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 700 12px/1.3 var(--xray-font);
  resize: none;
  overflow-y: auto;
  max-height: 110px;
}

.xray-statusbar {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px;
  color: var(--xray-subtext);
  background: var(--xray-surface);
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 500;
}

.xray-page {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-page-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.xray-page-head h3 {
  margin: 0 0 3px;
}

.xray-page-head p {
  margin: 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-split {
  min-height: 0;
  flex: 1;
  display: grid;
  /* Split is the MAX of a minmax, never a fixed track: the list caps at the
     dragged width but yields down to its min when the panel shrinks, so a wide
     split can't starve the detail pane. */
  /* S24: nothing open -> the list takes the full width. */
  grid-template-columns: minmax(0, 1fr);
}

.xray-split.detail-open {
  grid-template-columns: minmax(240px, var(--xray-logs-split, 42%)) minmax(300px, 1fr);
}

.xray-list-panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--xray-border);
  overflow: hidden;
}

.xray-list-panel > .xray-virtual-list {
  flex: 1;
  min-height: 0;
  height: auto;
}

.xray-api-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(180px, 1.4fr);
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-bg);
}

.xray-api-top-endpoint {
  min-width: 0;
  min-height: 44px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 7px 9px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .64);
}

.xray-api-top-endpoint {
  min-height: 36px;
}

.xray-api-top-endpoint span {
  min-width: 0;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-api-top-endpoint strong {
  min-width: 0;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-api-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--xray-bg);
}

.xray-api-body {
  position: relative;
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: grid;
  /* First track = list pane. --xray-api-split (set inline when the user drags
     the divider) replaces the auto min/max; container queries below override
     the whole property, so the split is dropped when the panel stacks. */
  grid-template-columns: minmax(260px, var(--xray-api-split, 440px)) minmax(260px, .64fr) minmax(400px, 1.55fr);
  overflow: hidden;
}

.xray-api-collection-pane,
.xray-request-context-pane,
.xray-api-detail-drawer {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Anchors the draggable list/detail divider on the pane's trailing edge. */
.xray-api-collection-pane {
  position: relative;
}

.xray-pane-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -4px;
  width: 9px;
  z-index: 4;
  cursor: ew-resize;
  touch-action: none;
  background: transparent;
}

.xray-pane-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 46px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--xray-hint);
  opacity: 0;
  transition: opacity var(--xray-dur-fast, .12s) ease, background var(--xray-dur-fast, .12s) ease;
}

/* Neutral like the panel's resize handle (spec A1); keyboard focus uses the focus colour. */
.xray-pane-divider:hover,
.xray-pane-divider.dragging {
  background: rgba(var(--xray-text-rgb), .08);
}

.xray-pane-divider:focus-visible {
  background: color-mix(in srgb, var(--xray-focus) 20%, transparent);
  outline: none;
}

.xray-pane-divider:hover::after,
.xray-pane-divider.dragging::after {
  opacity: 1;
}

.xray-pane-divider:focus-visible::after {
  opacity: 1;
  background: var(--xray-focus);
}

.xray-api-collection-pane {
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-bg-rgb), .42);
}

/* S16: one summary line ("10 requests \xB7 1 error \xB7 2 slow \xB7 avg 499ms \xB7 27.6kb")
   replaces the summary cards; error/slow counts are filter shortcuts. */
.xray-api-summary-line {
  flex-shrink: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 2px 6px;
  overflow: hidden;
  padding: 5px 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .88);
  font: 600 12px/18px var(--xray-font-ui);
  white-space: nowrap;
}

.xray-api-summary-line > * {
  flex: 0 0 auto;
}

.xray-api-summary-line .xray-api-request-count {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-api-summary-sep {
  color: var(--xray-hint);
}

.xray-api-summary-muted {
  color: var(--xray-subtext);
}

/* Low-priority stats give way first in a narrow list pane. */
.xray-api-summary-stat {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-api-summary-link {
  padding: 0 4px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}

.xray-api-summary-link.errors {
  color: var(--xray-red);
}

.xray-api-summary-link.slow {
  color: var(--xray-yellow);
}

.xray-api-summary-link:hover,
.xray-api-summary-link.active {
  border-color: color-mix(in srgb, currentColor 40%, transparent);
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.xray-pane-kicker {
  color: var(--xray-subtext);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.xray-api-main {
  position: relative;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* New requests insert at the top under LATEST sort \u2014 the pill floats near the
   top of the list, unlike the console variant that anchors at the bottom. */
.xray-newreq-pill {
  top: 46px;
  bottom: auto;
}

/* S17: one toolbar row. The search grows; the filter group (quick chips, active
   filters, Clear filters, the Filters & Sort toggle) sits beside it and drops
   under it as a unit when the list pane is narrow. The secondary panel always
   takes its own full-width line. */
.xray-api-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-api-search {
  flex: 1 1 220px;
  min-width: 0;
  height: 32px;
}

.xray-api-search .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-api-filter-row {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.xray-api-primary-filters,
.xray-api-active-filters {
  justify-content: flex-start;
  min-width: 0;
  flex-wrap: wrap;
  gap: 4px;
  overflow: visible;
}

.xray-api-filters-collapsible {
  display: flex;
  min-width: 0;
}

.xray-api-filters-toggle,
.xray-api-clear-filters {
  width: 30px;
  height: 30px;
}

.xray-api-secondary-panel {
  flex: 1 1 100%;
  min-width: 0;
}

.xray-api-secondary-controls {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.xray-filter-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

/* S18 single-line rows: method | path \xB7 flags \xB7 meta | status | bar + ms | actions. */
.xray-api-table-head,
.xray-api-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 40px 84px auto;
  align-items: center;
  gap: 8px;
}

.xray-api-table-head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 30px;
  padding: 0 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-hint);
  background: var(--xray-bg);
  font: 600 10px/1 var(--xray-font-ui);
  letter-spacing: 0;
}

.xray-api-table-scroll {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}

.xray-api-row {
  width: 100%;
  min-height: 44px;
  padding: 0 10px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.28 var(--xray-font);
  outline: none;
  transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;
}

/* Hover, keyboard focus and selection fills live in the operator override layer (spec S5: one
   source each, --xray-hover and --xray-selection); the accent bar is drawn by the selection rule. */

.xray-api-row.has-error {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-red) 82%, transparent);
}

.xray-api-row.has-slow:not(.has-error) {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-yellow) 72%, transparent);
}

/* The selection bar takes the place of the error/slow edge. */
.xray-api-row.selected.has-error,
.xray-api-row.selected.has-slow {
  box-shadow: inset 3px 0 0 var(--xray-accent);
}

.xray-api-row.group {
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-api-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .46);
}

.xray-api-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 10%, transparent), transparent 52%);
}

.xray-api-path-cell {
  min-width: 0;
  height: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;
  gap: 8px 8px;
  overflow: hidden;
  white-space: nowrap;
}

/* One visible line, by priority: the path always stays on it (shrinking with an
   ellipsis only when it alone is too long); flags and then the dimmed meta
   (host \xB7 source \xB7 size \xB7 time) join it only when they fit, otherwise they wrap
   to the clipped second line instead of showing as unreadable stubs. Errors and
   slow calls still read from the status colour, the bar and the row edge. */
.xray-api-path-cell > .xray-path,
.xray-api-path-cell > .xray-entry-meta {
  line-height: 20px;
}

.xray-api-path-cell > .xray-path {
  flex: 0 1 auto;
}

.xray-api-path-cell > .xray-api-flags {
  flex: 0 0 auto;
  flex-wrap: nowrap;
}

.xray-api-path-cell > .xray-entry-meta {
  flex: 1 1 14ch;
  min-width: 14ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.xray-api-flags {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  overflow: hidden;
}

.xray-api-flags.muted {
  display: none;
}

.xray-api-flag {
  min-width: 0;
  max-width: 78px;
  padding: 3px 6px;
  border: 0;
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.xray-method.post {
  color: var(--xray-teal);
}

.xray-method.patch {
  color: var(--xray-peach);
}

.xray-method.put {
  color: var(--xray-yellow);
}

.xray-api-flag.error {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-api-flag.slow,
.xray-api-flag.repeated,
.xray-api-flag.large {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-api-flag.empty {
  color: var(--xray-peach);
  background: color-mix(in srgb, var(--xray-peach) 10%, transparent);
}

/* Categorical chrome is a neutral chip (spec S1, A2 \u2014 mauve is a data colour): text on a soft text tint, no outline. */
.xray-api-flag.pinned {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-api-row-actions {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  opacity: .62;
  transition: opacity .15s ease;
}

.xray-api-row:hover .xray-api-row-actions,
.xray-api-row:focus-visible .xray-api-row-actions,
.xray-api-row.selected .xray-api-row-actions {
  opacity: 1;
}

.xray-icon-btn {
  width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  cursor: pointer;
}

/* Hover and pressed icon buttons are neutral (spec A1); focus draws the shared focus ring. */
.xray-icon-btn:hover,
.xray-icon-btn:focus-visible {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-icon-btn.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-request-context-pane {
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .78);
}

.xray-request-context-pane.empty {
  justify-content: center;
}

.xray-request-context-head {
  flex-shrink: 0;
  display: grid;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-request-line {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.xray-request-line code {
  min-width: 0;
  height: 32px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-bg-rgb), .76);
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 700 11px/1 var(--xray-font);
}

.xray-request-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.xray-request-meta-grid span {
  min-width: 0;
  display: grid;
  gap: 2px;
  padding: 7px 8px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .48);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.xray-request-meta-grid strong {
  color: var(--xray-hint);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-request-context-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .45);
}

.xray-request-context-content .xray-json-editor {
  min-width: 0;
}

.xray-request-context-content .xray-json-line-text {
  overflow-wrap: anywhere;
}

.xray-request-context-footer {
  flex-shrink: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--xray-border);
  color: var(--xray-hint);
  background: rgba(var(--xray-bg-rgb), .35);
  font-size: 10px;
}

.xray-request-context-footer span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-request-tabs {
  flex-shrink: 0;
  padding: 0 10px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-bg-rgb), .30);
}

.xray-api-detail-drawer {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--xray-surface);
}

.xray-api-drawer-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.xray-entry-row {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 52px 76px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.35 var(--xray-font);
}

.xray-entry-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .45);
}

.xray-entry-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 8%, transparent), transparent 45%);
}

.xray-entry-main {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.xray-entry-meta {
  /* subtext, not hint: this 10px line carries the row's key facts and the
     hint gray fell below WCAG AA contrast on the dark surfaces */
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 700;
}

.xray-entry-duration {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(24px, 1fr) auto;
  align-items: center;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 10px;
}

.xray-pin {
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .74);
  font-size: 10px;
  white-space: nowrap;
}

.xray-pin {
  width: 26px;
  padding: 0;
  color: var(--xray-hint);
  cursor: pointer;
  transition: color var(--xray-dur-fast, .12s) var(--xray-ease, ease),
              border-color var(--xray-dur-fast, .12s) var(--xray-ease, ease),
              background-color var(--xray-dur-fast, .12s) var(--xray-ease, ease);
}

.xray-pin:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-pin.active {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 34%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-detail-panel {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-request-detail {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--xray-bg);
}

.xray-detail-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-response-heading {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.xray-response-heading h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-response-chips {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.xray-response-chip {
  height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border: 0;
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .68);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.xray-response-chip.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-response-chip.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-response-chip.error {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-detail-nav {
  flex-shrink: 0;
  display: grid;
  gap: 0;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-detail-tabs,
.xray-detail-views {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-detail-tabs::-webkit-scrollbar,
.xray-detail-views::-webkit-scrollbar {
  display: none;
}

.xray-detail-tabs {
  padding: 0 12px;
}

.xray-detail-tab {
  height: 38px;
  padding: 0 12px;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--xray-hint);
  background: transparent;
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
  text-transform: capitalize;
}

/* A secondary tab: neutral when active (spec A1, A2 \u2014 mauve is not a chrome colour). */
.xray-detail-tab:hover,
.xray-detail-tab.active {
  color: var(--xray-text);
  border-bottom-color: var(--xray-border-control);
}

.xray-detail-views {
  padding: 7px 12px;
  border-top: 1px solid var(--xray-border);
}

.xray-detail-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-detail-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-top: 1px solid var(--xray-border);
  background: var(--xray-surface);
  overflow-x: auto;
}

.xray-smart-ops {
  min-width: 0;
}

.xray-action-btn {
  min-width: 0;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-action-btn:hover,
.xray-action-btn:focus-visible {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-hover);
}

.xray-operation-groups {
  flex-shrink: 0;
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-bg-rgb), .45);
}

.xray-operation-group {
  min-width: 0;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
}

.xray-operation-group > span {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.xray-operation-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  overflow: visible;
}

.xray-operation-bar .xray-chip {
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border-radius: var(--xray-radius);
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
}

.xray-api-drawer-body .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-card,
.xray-modal {
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
}

.xray-card {
  padding: 12px;
}

.xray-card h3,
.xray-detail-panel h3,
.xray-page h3 {
  margin: 0 0 10px;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-json {
  margin: 0;
  color: var(--xray-text);
  white-space: pre-wrap;
  word-break: break-word;
  font: 700 11px/1.6 var(--xray-font);
}

.xray-json-editor {
  min-width: max-content;
  padding: 10px 0;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius);
  background:
    linear-gradient(90deg, rgba(var(--xray-bg-rgb), .84) 0 42px, rgba(var(--xray-surface-rgb), .52) 42px),
    rgba(var(--xray-bg-rgb), .52);
  box-shadow: inset 0 1px 0 rgba(var(--xray-text-rgb), .04);
}

.xray-json-line {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  min-height: 18px;
}

/* Inside the JSON well (--xray-surface2, spec S6) --xray-hover would match the well itself, so a
   hovered line takes a neutral text tint instead (no status blue). */
.xray-json-line:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-json-line-no {
  padding: 0 10px 0 0;
  color: var(--xray-hint);
  text-align: right;
  user-select: none;
  border-right: 1px solid var(--xray-border);
}

.xray-json-line-text {
  min-width: 0;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-json-key {
  color: var(--xray-blue);
}

.xray-json-string {
  color: var(--xray-green);
}

.xray-json-number {
  color: var(--xray-peach);
}

/* Spec A2: booleans are the data mauve, in the panel and every modal alike (one source). */
.xray-json-bool {
  color: var(--xray-mauve);
}

.xray-json-null {
  color: var(--xray-neutral);
}

.xray-json-punct {
  color: var(--xray-subtext);
}

/* Typed log values (spec J7): functions, Symbols, Dates, DOM nodes and container labels
   (Map(3), TypeError) read as values rather than strings; notes (\u2026 3 more, [Circular])
   recede. */
.xray-json-typed {
  color: var(--xray-teal);
  font-style: italic;
}

.xray-json-muted {
  color: var(--xray-hint);
  font-style: italic;
}

.xray-table {
  width: 100%;
  border-collapse: collapse;
  font: 700 11px/1.4 var(--xray-font);
}

.xray-table th,
.xray-table td {
  padding: 6px 8px;
  border: 1px solid var(--xray-border);
  text-align: left;
  vertical-align: top;
}

/* Column headers are quiet labels (spec A1, A2): hint, not mauve or the accent. */
.xray-table th {
  color: var(--xray-hint);
  background: var(--xray-bg);
}

.xray-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(var(--xray-bg-rgb), .72);
  z-index: 2147483647;
}

/* Receipts are App siblings of modal backdrops, and must remain actionable while
   a modal is open without displacing the permanently mounted live region. */
.xray-toast-region {
  position: fixed;
  inset: 0;
  z-index: 2147483648;
  pointer-events: none;
}

.xray-toast-region .xray-toast {
  pointer-events: auto;
}

/* The theme-refresh notice (spec V2) has its own slot, so a toast never replaces it; it stays
   until dismissed. A strip inside the panel between the header and the body, like
   .xray-save-notice (final review I-4): it pushes the body down instead of floating over the
   console prompt or, from a HUD, the host page. Its own class: .xray-notice is the shared
   in-flow callout (Notice.tsx). */
.xray-notice-region {
  flex: 0 0 auto;
}

.xray-theme-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 12px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  background: var(--xray-surface);
  font: 600 11px/1.4 var(--xray-font-ui);
}

.xray-theme-notice > span {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-notice-dismiss {
  flex: 0 0 auto;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
  color: var(--xray-text);
  font: inherit;
  cursor: pointer;
}

/* Spec J9: "Couldn't save the session \u2014 <reason>", once per failure streak (store.ts). A strip
   between the header and the body: it pushes the body down rather than covering any of it, like
   .xray-theme-notice above. */
.xray-save-notice {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-yellow) 40%, var(--xray-border));
  background: color-mix(in srgb, var(--xray-yellow) 12%, var(--xray-surface));
  color: var(--xray-text);
  font: 600 11px/1.4 var(--xray-font-ui);
}

.xray-save-notice-icon {
  flex: 0 0 auto;
  color: var(--xray-yellow);
}

.xray-save-notice-text {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-modal {
  width: min(820px, 92vw);
  max-height: min(82vh, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-modal {
  /* One body size (12px) and one hint size (11px) for every modal; headers stay 13px. */
  color: var(--xray-text);
  font-family: var(--xray-font-ui);
  font-size: 12px;
  line-height: 1.5;
}

.xray-modal h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-modal-hint {
  margin: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.xray-modal-eyebrow {
  color: var(--xray-subtext);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
}

.xray-modal-head > div {
  min-width: 0;
}

.xray-modal-head h3,
.xray-modal-head .xray-modal-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The title block gives way, never the icon or the close button. */
.xray-modal-title-icon,
.xray-modal-head > .xray-icon-btn {
  flex: 0 0 auto;
}

/* Modal form fields: the global .xray-input reserves 38px for a leading icon, which
   only .xray-search wrappers draw. */
.xray-modal .xray-input {
  padding-left: 12px;
}

.xray-modal .xray-search .xray-input {
  padding-left: 38px;
}

.xray-modal textarea.xray-input {
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 1.5;
}

.xray-modal-title-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* A label, not a state: neutral (spec A1). */
  color: var(--xray-subtext);
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-export-modal {
  width: min(980px, 94vw);
  /* Definite height so the preview can fill the body instead of collapsing. */
  height: min(82vh, 760px);
  /* The modal is its own size container: the narrow layout follows the modal's width
     (L5), not the window's. Its children query it by name; the panel's own
     container is a sibling of the modal and never applies here. */
  container-type: inline-size;
  container-name: xray-export;
  --xray-export-control-h: 26px;
}

.xray-compare-modal {
  width: min(1100px, 100%);
}

.xray-compare-body {
  flex: 1;
  min-width: 0;
}

.xray-compare-selectors,
.xray-compare-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.xray-compare-selectors label,
.xray-compare-values > div {
  min-width: 0;
}

.xray-compare-selectors label {
  display: grid;
  gap: 6px;
  color: var(--xray-subtext);
}

.xray-compare-selectors select {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-compare-result {
  font-weight: 700;
}

.xray-compare-result.changed {
  /* Raw --xray-yellow is ~3.6:1 on custom light themes; mixing toward text keeps >=4.5:1 everywhere. */
  color: color-mix(in srgb, var(--xray-yellow) 50%, var(--xray-text));
}

.xray-compare-result.equal {
  color: var(--xray-subtext);
  font-weight: 400;
}

.xray-compare-result.unavailable {
  color: var(--xray-subtext);
  font-style: italic;
  font-weight: 400;
}

.xray-compare-equal-toggle {
  margin-top: 6px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--xray-accent);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.xray-compare-equal-toggle:hover {
  text-decoration: underline;
}

.xray-compare-section {
  margin-top: 20px;
}

.xray-compare-section h4 {
  margin: 0 0 8px;
}

.xray-compare-notice {
  padding: 10px 12px;
  border-left: 2px solid var(--xray-yellow);
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
  overflow-wrap: anywhere;
}

ul.xray-compare-notice {
  padding-left: 28px;
}

.xray-compare-table {
  table-layout: fixed;
}

.xray-compare-table th,
.xray-compare-table td {
  overflow-wrap: anywhere;
  min-width: 0;
}

.xray-compare-table small {
  display: block;
  color: var(--xray-subtext);
}

.xray-compare-text {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-compare-modal .xray-json {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-width: 0;
}

.xray-compare-captured {
  margin-top: 10px;
}

.xray-compare-captured summary {
  cursor: pointer;
  color: var(--xray-subtext);
}

.xray-detail-comparison {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 12px;
}

@media (max-width: 560px) {
  .xray-compare-selectors,
  .xray-compare-values {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-compare-table th,
  .xray-compare-table td {
    padding: 5px 4px;
  }
}

.xray-modal-head,
.xray-modal-foot {
  display: flex;
  /* Never the thing that gets squeezed: the footer carries the primary action, and
     on a short viewport flex shrinking used to push it outside the modal's own
     overflow: hidden box, where no scrollbar could reach it. */
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-modal-foot {
  border-top: 1px solid var(--xray-border);
  border-bottom: 0;
}

.xray-modal-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  padding: 12px;
}

/* Footer: [meta/status] \xB7\xB7\xB7 [secondary \u2026 primary]. Buttons never wrap their label. */
.xray-modal-foot .xray-btn {
  flex: 0 0 auto;
  white-space: nowrap;
}

.xray-modal-foot-meta {
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.xray-toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-toggle-field {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.xray-toggle-field.disabled {
  cursor: not-allowed;
  color: var(--xray-disabled);
}

/* Settings toggle look on a real checkbox. */
.xray-switch {
  appearance: none;
  -webkit-appearance: none;
  width: 36px;
  height: 20px;
  flex: 0 0 auto;
  position: relative;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: var(--xray-surface2);
  cursor: inherit;
}

.xray-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--xray-hint);
  transition: transform .15s ease, background .15s ease;
}

.xray-switch:checked {
  background: var(--xray-accent, var(--xray-blue));
}

.xray-switch:checked::after {
  transform: translateX(16px);
  background: var(--xray-bg);
}

.xray-switch:disabled {
  opacity: .5;
}

.xray-switch:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .xray-switch::after { transition: none; }
}

.xray-btn.xray-btn-sm {
  height: 26px;
  padding: 0 9px;
  font-size: 11px;
}

/* AI destination + model, one compact line at the top of AI modals. */
.xray-ai-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 10px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-text-rgb), .04);
  font-size: 11px;
}

.xray-ai-banner strong {
  color: var(--xray-text);
}

.xray-ai-banner span {
  min-width: 0;
  color: var(--xray-subtext);
  overflow-wrap: anywhere;
}

.xray-prompt-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-prompt-preview-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-prompt-preview-code {
  max-height: 260px;
  margin: 0;
  padding: 10px 12px;
  overflow: auto;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-text);
  font: 600 11px/1.55 var(--xray-font);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-prompt-preview-code:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-finding-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-finding-list ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.xray-finding-list li {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.xray-finding-list-title {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.xray-modal-subtitle,
.xray-export-subtitle {
  max-width: 520px;
  margin-top: 2px;
  color: var(--xray-subtext);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
}

.xray-modal-version {
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
}

.xray-export-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.xray-export-rail {
  flex: 0 0 auto;
  max-height: 46%;
  overflow: auto;
  padding: 10px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-export-mode {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

/* The scope switch uses the same control height as the format chips (L6). */
.xray-export-mode .xray-chip {
  height: var(--xray-export-control-h);
  padding: 0 12px;
  font-size: 11px;
}

.xray-export-select {
  display: none;
  width: 100%;
  margin-bottom: 6px;
}

.xray-export-group {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  margin-bottom: 6px;
}

.xray-export-group-label {
  padding-top: 5px;
  color: var(--xray-hint);
  font-size: 11px;
  font-weight: 600;
}

.xray-export-group-items {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xray-export-format {
  height: var(--xray-export-control-h);
  flex: 0 0 auto;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  padding: 0 8px;
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 600 11px/1.2 var(--xray-font-ui);
  text-align: left;
}

.xray-export-format:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

/* The picked format is a neutral pressed state (spec A1), like the active chips. */
.xray-export-format.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-export-format:disabled {
  opacity: .42;
  cursor: not-allowed;
}

.xray-export-format small {
  color: var(--xray-hint);
  font-size: 10px;
}

/* On the neutral pressed fill (--xray-surface3) the description reads in the text colour. */
.xray-export-format.active small {
  color: var(--xray-text);
}

.xray-export-import {
  border-style: dashed;
}

.xray-export-preview {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-export-preview-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-export-preview-head h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 12px;
}

.xray-export-preview-head p {
  margin: 3px 0 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-export-preview-head .xray-export-privacy {
  color: var(--xray-subtext);
}

/* L5: below 640px of modal width the format rail becomes one grouped select above a
   full-height preview. Import stays reachable as the only chip left in the rail. */
@container xray-export (max-width: 639px) {
  .xray-export-select {
    display: block;
  }

  .xray-export-rail {
    max-height: none;
    overflow: visible;
  }

  .xray-export-group-label,
  .xray-export-format:not(.xray-export-import) {
    display: none;
  }

  .xray-export-group {
    display: block;
    margin-bottom: 0;
  }

  .xray-export-group:not(:has(.xray-export-import)) {
    display: none;
  }

  .xray-export-preview {
    min-height: 0;
  }
}

.xray-export-code {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .54);
}

.xray-toast {
  position: absolute;
  right: 14px;
  bottom: 38px;
  max-width: min(420px, calc(100% - 28px));
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--xray-teal) 42%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-surface-rgb), .94);
  box-shadow: 0 12px 38px var(--xray-shadow);
  font: 700 11px/1.35 var(--xray-font-ui);
  cursor: pointer;
}

.xray-insight-columns,
.xray-settings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.xray-insight-row {
  width: 100%;
  min-height: 34px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 0;
  border-bottom: 1px solid var(--xray-border);
  padding: 7px 0;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1.35 var(--xray-font);
}

.xray-insight-row:hover {
  color: var(--xray-blue);
}

.xray-insight-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-status-mix-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  color: var(--xray-subtext);
  font: 700 11px/1.35 var(--xray-font);
}

.xray-settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-settings-modal {
  width: min(780px, 94vw);
  /* L1: a fixed height, so switching sections never resizes the dialog; the
     content pane scrolls instead. */
  height: min(640px, 90vh);
  max-height: none;
}

.xray-settings-modal-body {
  /* Let the modal's fixed head and foot determine the available pane height. The
     nav and content panes own their overflow instead of escaping this clipped grid. */
  min-height: 0;
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  overflow: hidden;
}

.xray-settings-nav {
  min-height: 0;
  overflow: auto;
  padding: 8px 0;
  border-right: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-settings-nav-group-title {
  padding: 8px 14px 4px;
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.xray-settings-nav-item {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  border-left: 2px solid transparent;
  padding: 0 14px;
  color: var(--xray-hint);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-settings-nav-item:hover {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-settings-nav-item span {
  white-space: nowrap;
}

/* The active Settings item is one of the states the accent marks (spec A1). */
.xray-settings-nav-item.active {
  color: var(--xray-text);
  border-left-color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}

.xray-settings-content {
  min-height: 0;
  overflow: auto;
  padding: 16px;
  /* The theme grid follows the content pane's own width. */
  container-type: inline-size;
  container-name: xray-settings-content;
}

.xray-settings-section-title {
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 600;
}

.xray-settings-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--xray-border);
  color: var(--xray-text);
  font: 700 11px/1.35 var(--xray-font-ui);
}

.xray-settings-row.read-only {
  align-items: flex-start;
}

.xray-settings-diagnostics {
  border-bottom: 1px solid var(--xray-border);
}

.xray-settings-diagnostics > summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--xray-text);
  font: 700 11px/1.35 var(--xray-font-ui);
}

.xray-settings-diagnostics > summary:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

/* display:flex drops the native ::marker, so draw the disclosure chevron. */
.xray-settings-diagnostics > summary::-webkit-details-marker {
  display: none;
}

.xray-settings-diagnostics > summary::before {
  content: "";
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  margin: 0 10px 0 2px;
  border-right: 2px solid var(--xray-hint);
  border-bottom: 2px solid var(--xray-hint);
  transform: rotate(-45deg);
  transition: transform .15s ease;
}

.xray-settings-diagnostics[open] > summary::before {
  transform: rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .xray-settings-diagnostics > summary::before {
    transition: none;
  }
}

.xray-settings-row strong,
.xray-settings-row small {
  display: block;
}

.xray-settings-row small {
  margin-top: 2px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
}

.xray-toggle {
  width: 36px;
  height: 20px;
  flex: 0 0 auto;
  position: relative;
  border: 0;
  border-radius: 999px;
  background: var(--xray-surface2);
  cursor: pointer;
}

.xray-toggle::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--xray-hint);
  transition: transform .15s ease, background .15s ease;
}

.xray-toggle.on {
  background: var(--xray-accent, var(--xray-blue));
}

.xray-toggle.on::after {
  transform: translateX(16px);
  /* The "on" track is --xray-accent, which resolveAccentValue() flips between a
     light pastel (dark themes) and a darkened variant (light themes). --xray-bg
     inverts with it, so the knob is dark-on-pastel or light-on-ink. Measured
     against the track: 9.13 on Operator, 8.77 Dev Edition, 9.58 Midnight, where
     the flat white it replaces managed 2.11. Light Lab/Claude give up a little
     (4.91 -> 4.40/4.23) because --xray-bg is near-white there anyway. */
  background: var(--xray-bg);
}

.xray-number-input {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.xray-number-input input,
.xray-select {
  height: 30px;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-number-input input {
  width: 76px;
  padding: 0 8px;
  text-align: right;
}

.xray-select {
  min-width: 118px;
  padding: 0 8px;
}

/* A select in a settings row keeps its full selected label; the description wraps instead. */
.xray-settings-row > .xray-select {
  flex: 0 0 auto;
  max-width: 70%;
}

.xray-settings-row > span {
  min-width: 0;
}

.xray-color-row {
  display: flex;
  flex-wrap: nowrap;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 6px;
}

.xray-color-swatch {
  width: 23px;
  height: 23px;
  border: 2px solid transparent;
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-color-swatch.active {
  border-color: var(--xray-text);
}

/* "Use theme accent" (spec P2): pressed while the preset's own accent applies. Like the swatches,
   only the pressed state draws a border (High Contrast's --xray-border is as bright as its text). */
.xray-color-theme {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 23px;
  padding: 0 8px 0 5px;
  border: 2px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-surface2);
  color: var(--xray-subtext);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.xray-color-theme.active {
  border-color: var(--xray-text);
  color: var(--xray-text);
}

.xray-settings-danger {
  margin-top: 18px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 22%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 4%, transparent);
}

.xray-danger-title {
  margin-bottom: 8px;
  color: var(--xray-red);
  font-size: 10px;
  font-weight: 600;
}

.xray-danger-row {
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: var(--xray-radius-sm);
  padding: 0 8px;
  color: var(--xray-red);
  background: transparent;
  cursor: pointer;
  font: 700 11px/1 var(--xray-font-ui);
}

.xray-danger-row:hover {
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
}

.xray-confirm-modal {
  width: min(460px, 92vw);
}

.xray-confirm-message {
  margin: 0;
  color: var(--xray-subtext);
  font: 600 12px/1.55 var(--xray-font-ui);
}

.xray-compact-rows .xray-api-row {
  min-height: 32px;
}

.xray-compact-rows .xray-api-row .xray-entry-meta,
.xray-compact-rows .xray-api-row .xray-api-flags {
  display: none;
}

.xray-command-modal {
  width: min(680px, 92vw);
}

.xray-command-search {
  display: block;
  padding: 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-command-list {
  display: grid;
  gap: 4px;
}

.xray-command-row {
  width: 100%;
  min-height: 40px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  padding: 0 10px;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 700 12px/1.25 var(--xray-font-ui);
}

.xray-command-row:hover {
  border-color: var(--xray-border);
  background: var(--xray-hover);
}

.xray-command-row small {
  color: var(--xray-hint);
  font-size: 10px;
}

@container xray (max-width: 1700px) {
  .xray-api-body {
    /* Single-line rows use extra width well: the list takes ~38% (440-640px). */
    grid-template-columns: minmax(260px, var(--xray-api-split, clamp(440px, 38%, 640px))) minmax(340px, 1fr);
  }

  .xray-request-context-pane {
    display: none;
  }
}

/* Window-coupled rules stay media-based: the panel's own width, and the modal
   overlays that live OUTSIDE the panel and size against the viewport. */
@media (max-width: 760px) {
  .xray-panel {
    width: 100vw;
  }

  .xray-export-modal {
    width: 96vw;
  }

  .xray-settings-modal {
    width: 96vw;
  }

  .xray-settings-modal-body {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .xray-settings-nav {
    display: flex;
    align-items: flex-start;
    min-height: 140px;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: 0;
    border-bottom: 1px solid var(--xray-border);
  }

  .xray-settings-nav-group {
    flex: 0 0 auto;
  }

  .xray-settings-nav-item {
    flex: 0 0 auto;
    width: auto;
    border-left: 0;
    border-bottom: 2px solid transparent;
  }

  .xray-settings-nav-item span {
    white-space: nowrap;
  }

  .xray-settings-nav-item.active {
    border-bottom-color: var(--xray-accent);
  }

  .xray-settings-grid {
    grid-template-columns: 1fr;
  }
}

/* Narrow: every modal is a full-height sheet. This is deliberately a viewport
   @media query, not a container query: modals are position: fixed viewport overlays
   that render outside the .xray container, so no container query can apply.
   Header and footer stay pinned (flex: 0 0 auto); the body is the only scroller. */
@media (max-width: 600px) {
  .xray-modal-backdrop {
    align-items: stretch;
    padding: 0;
  }

  .xray-modal-backdrop > .xray-modal {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    border-radius: 0;
    border-width: 0;
  }

  .xray-gsearch-list {
    flex: 1 1 auto;
    max-height: none;
  }

  /* The format picker may take most of a phone-height sheet so every format and
     Import stay reachable; the preview keeps a minimum and scrolls itself. */
  .xray-export-rail {
    max-height: 64%;
  }

  .xray-export-group {
    grid-template-columns: 60px minmax(0, 1fr);
    gap: 6px;
  }

  .xray-export-preview {
    min-height: 120px;
  }

  .xray-modal-foot {
    flex-wrap: wrap;
  }

  .xray-modal-foot .xray-muted,
  .xray-modal-foot .xray-modal-version,
  .xray-modal-foot-meta {
    flex: 1 1 100%;
  }

  .xray-modal-foot .xray-spacer {
    display: none;
  }

  .xray-modal-foot .xray-btn {
    flex: 1 1 auto;
  }

  /* Fieldless confirmations are content-height bottom sheets, not full screen. */
  .xray-modal-backdrop > .xray-modal.xray-confirm-modal {
    height: auto;
    max-height: 100%;
    align-self: flex-end;
  }

  /* Extra .xray-replay-body keeps these above the base .xray-replay-line rules below. */
  .xray-replay-body .xray-replay-line .xray-select {
    flex: 0 0 100%;
  }

  .xray-replay-body .xray-replay-line .xray-input {
    flex: 1 1 100%;
  }
}

@container xray (max-width: 760px) {
  /* Stacked layout: the panes are full-width, so there's nothing to split. */
  .xray-pane-divider {
    display: none;
  }

  .xray-topbar {
    gap: 6px;
    padding: 0 8px;
    overflow: hidden;
  }

  .xray-brand {
    min-width: 0;
  }

  .xray-brand-ver {
    display: none;
  }

  .xray-tabs::-webkit-scrollbar,
  .xray-filter-chips::-webkit-scrollbar {
    display: none;
  }

  .xray-tab {
    flex: 0 0 auto;
  }

  .xray-toolbar {
    flex: 0 0 auto;
  }

  .xray-toolbar {
    padding-right: 8px;
  }

  .xray-filterbar {
    grid-template-columns: 1fr;
  }

  .xray-filter-chips {
    padding-bottom: 2px;
  }

  /* API workspace narrow layouts (stacked split / full-height detail) live in
     the "S20" section near the end of this file. */

  .xray-detail-content .xray-json-editor {
    min-width: 0;
  }

  .xray-json-line {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .xray-json-line-no {
    padding-right: 8px;
  }

  .xray-json-line-text {
    padding: 0 9px;
    overflow-wrap: anywhere;
  }

  .xray-detail-tabs,
  .xray-detail-views,
  .xray-operation-bar {
    max-width: 100%;
  }

  .xray-operation-group {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .xray-operation-bar {
    display: grid;
    grid-template-columns: 1fr;
  }

  .xray-operation-bar .xray-chip {
    justify-content: center;
  }

  .xray-detail-footer {
    display: grid;
    grid-template-columns: 1fr;
    overflow-x: visible;
    align-items: stretch;
  }

  .xray-detail-footer .xray-action-btn {
    min-width: 0;
    overflow: hidden;
  }

  .xray-list-panel > .xray-virtual-list {
    min-height: 168px;
  }

  .xray-entry-duration {
    display: none;
  }

  .xray-insight-columns {
    grid-template-columns: 1fr;
  }

  .xray-page-head {
    display: grid;
  }
}

/* The tablist is the only flex item left that can shrink, so anything the header
   cannot fit is taken out of the TABS unless something else gives way first. Two
   tiers do the giving way, in the order that costs the user least.

   First the session summary, which is the cheapest thing on the bar: two of its three
   numbers already appear as tab badges, and it is not interactive. It used to survive
   down to 760px and cost two tabs on the way. */
@container xray (max-width: 1120px) {
  .xray-topbar > .xray-summary {
    display: none;
  }
}

/* Header give-way tiers, widest first. Each gives way only when the tablist would
   otherwise be squeezed (measured: tabs need ~460-500px with labels, ~160px as icons).

   1. Below 880px the three surface buttons step aside. They are redundant there: the
      command palette carries "Open in separate window", "Float over page (HUD)" and
      "Open in DevTools" (CommandPalette.tsx, group Actions). An earlier revision hid
      them while that was NOT true, which left the pop-out and the HUD with no entry
      point; test/responsive-motion-css.test.js guards the palette entries. Above 880px
      they fit alongside labelled tabs, so they stay.
   2. Below 680px the tab labels go (measured: six tight labelled tabs need ~410px, which the
      header only has from ~680px; spec target was ~600px), leaving the six icons (each tab carries an
      aria-label, so the accessible name survives). Labels stay visible down to here.
   3. Below 420px even icons can overflow, so the strip scrolls -- and gets its
      scrollbar back. Suppressing the scrollbar on a strip that overflows is what made
      clipped tabs unreachable by mouse in the first place. Keyboard users have arrow
      keys, and the active tab is scrolled into view whenever it changes. */
@container xray (max-width: 880px) {
  .xray-mode-switcher {
    display: none;
  }
}

/* Tight labelled tabs: six of them since the SQL tab. Between the 680px label tier and
   the 880px surface switcher the header has no other give-way left, so the strip
   reclaims its own padding and gaps instead of scrolling. Measured on the default sans
   and with DejaVu Sans (~25px wider, like the Ubuntu CI runner's) the six labelled
   tabs then leave at least 24px spare across this band; with the old 8-12px padding
   they scrolled at 700 and 720 on CI fonts, and at 780 even locally. Below 680px the
   icon-only tier keeps its own spacing. */
@container xray (680px < width <= 880px) {
  .xray-tabs {
    gap: 2px;
  }

  .xray-tab {
    gap: 4px;
    padding: 0 6px;
  }
}

/* Just above 880px the surface switcher is back and takes ~100px from the strip, so the
   six labelled tabs need a lighter trim up to 940px: measured with DejaVu Sans they
   scrolled 26px at 900 and 11px at 920 at the base padding, and leave at least 27px
   with this one. From 960px up the base spacing leaves at least 25px. */
@container xray (880px < width <= 940px) {
  .xray-tab {
    gap: 4px;
    padding: 0 8px;
  }
}

@container xray (max-width: 680px) {
  .xray-tab span {
    display: none;
  }

  .xray-tab {
    padding: 0 8px;
  }
}

@container xray (max-width: 420px) {
  .xray-tabs {
    scrollbar-width: thin;
    padding-bottom: 0;
  }

  .xray-tabs::-webkit-scrollbar {
    display: block;
    height: 4px;
  }

  .xray-tabs::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--xray-hint) 60%, transparent);
  }
}

/* Six icon-only tabs (SQL joined the strip) fit a 420px HUD: 28px targets, 2px apart. */
@container xray (max-width: 420px) {
  .xray-tabs {
    gap: 2px;
  }

  .xray-tab {
    padding: 0 5px;
  }
}

@container xray (max-width: 420px) {
  .xray-detail-footer {
    flex-wrap: wrap;
  }

  .xray-detail-footer {
    overflow-x: visible;
    align-items: stretch;
  }

  .xray-detail-footer .xray-action-btn {
    flex: 1 1 calc(50% - 8px);
  }

  .xray-operation-group {
    grid-template-columns: 1fr;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI override layer
   Configurable developer cockpit skin applied across existing tabs.
   Calm accent (spec A1\u2013A3): surfaces are flat token colours; the accent marks
   only the active tab, the primary action, focus, the selection bar, links and
   on/off controls; mauve is a data colour.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-api-workspace,
.xray-panel .xray-console-workspace,
.xray-panel .xray-insights,
.xray-panel .xray-settings-page,
.xray-panel .xray-logs-workspace {
  background: var(--xray-bg);
}

/* Pane layering (spec S6): panel chrome (top bar, toolbars, detail hero and nav, prompt,
   statusbar) is --xray-surface; content panes (lists, the detail pane, the console stream) are
   --xray-bg; wells and inputs (JSON, fields) are --xray-surface2; raised menus and modals stay
   --xray-surface, lifted by --xray-border and --xray-shadow (surface3 would fail hint/subtext
   contrast on most presets \u2014 see the Task 6 report). These layers are the flat tokens; a few
   secondary strips (summary line, request context, Settings nav, export rail, insight strip)
   keep a translucent fill over their layer's token. */
.xray-panel .xray-api-collection-pane,
.xray-panel .xray-api-detail-pane {
  border-color: var(--xray-border);
  background: var(--xray-bg);
}

.xray-panel .xray-card,
.xray-panel .xray-settings-card,
.xray-panel .xray-modal-card {
  border-color: var(--xray-border);
  background: var(--xray-surface);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 3.5%, transparent), 0 18px 50px var(--xray-shadow);
}

.xray-panel .xray-api-row,
.xray-panel .xray-entry-row,
.xray-panel .xray-console-row,
.xray-panel .xray-log-row {
  min-height: var(--xray-row-h, 52px);
  border-color: color-mix(in srgb, var(--xray-border) 72%, transparent);
  background: transparent;
  transition: background .12s ease, border-color .12s ease, transform .12s ease, box-shadow .12s ease;
}

/* Row states (spec S5): hover and keyboard focus are --xray-hover; the selection is
   --xray-selection (a tint of the effective accent, so it follows a picked swatch) marked by the
   accent bar (A1). Selected comes last: same specificity, so a hovered selected row stays selected. */
.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row):is(:hover, :focus-visible) {
  background: var(--xray-hover);
  border-color: var(--xray-border);
}

.xray-panel :is(.xray-api-row, .xray-entry-row, .xray-console-row, .xray-log-row).selected {
  background: var(--xray-selection);
  border-color: var(--xray-border);
}

/* Pressed (spec S5): a control under the pointer fills with --xray-active, a tint of the effective
   accent, for the moment it is held. Persistent active states (filter chips, detail tabs, menu
   toggles) stay neutral (A1); the primary button keeps its own accent fill. */
.xray-theme-scope :is(.xray-btn, .xray-icon-btn, .xray-chip, .xray-action-btn, .xray-menu-item):not(.primary):not(:disabled):active {
  background: var(--xray-active);
}

.xray-glow .xray-api-row.selected,
.xray-glow .xray-entry-row.selected,
.xray-glow .xray-console-row.selected,
.xray-glow .xray-log-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent), 0 0 28px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

/* Unboxed tokens (spec S1): method and status are coloured text, response chips, flags and badges
   a soft tint with no outline, all at 600. Filter chips are actions (toggle buttons), so they keep
   the neutral line colour (spec A1). */
.xray-theme-scope .xray-method,
.xray-theme-scope .xray-status,
.xray-theme-scope .xray-response-chip,
.xray-theme-scope .xray-api-flag,
.xray-theme-scope .xray-badge {
  border: 0;
  font-weight: 600;
  letter-spacing: .02em;
}

.xray-panel .xray-chip {
  border: 1px solid var(--xray-border);
  font-weight: 600;
  letter-spacing: .02em;
}

/* No text weight above 700 (spec S3): <b>/<strong> default to \`bolder\`, which is 900 inside a
   600\u2013700 parent. Zero specificity, so any class rule that sets a weight still wins. */
:where(.xray-theme-scope) :where(b, strong) {
  font-weight: 700;
}

/* Icon(-only) buttons \u2014 .xray-icon-btn, the request-detail actions, the console prompt's expand
   and help \u2014 are outlined only while hovered or keyboard-focused (spec S1), with no resting fill
   so they never read as boxes (e.g. on the selected row). Pressed, expanded and primary ones keep
   their state outline and fill. Hover keeps each button's own hover fill. */
.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):not(:hover):not(:focus-visible) {
  border-color: transparent;
  background: transparent;
}

.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):not(:disabled):hover,
.xray-theme-scope :is(.xray-icon-btn, .xray-detail-action, .xray-editor-expand, .xray-prompt-help):not(.active):not(.primary):not([aria-pressed="true"]):not([aria-expanded="true"]):focus-visible {
  border-color: var(--xray-border);
}

/* The active chip keeps its control outline (.xray-chip.active), so its state reads at 3:1. */
.xray-panel .xray-chip.active {
  border-color: var(--xray-border-control);
}

/* Counts are quiet data (spec A1), never the accent. */
.xray-panel .xray-badge {
  color: var(--xray-subtext);
  background: rgba(var(--xray-text-rgb), .06);
}

/* In the active tab the count reads in the text colour, like the tab's label. */
.xray-panel .xray-tab.active .xray-badge {
  color: var(--xray-text);
}

.xray-panel .xray-method.get { color: var(--xray-green); }
.xray-panel .xray-method.post { color: var(--xray-blue); }
.xray-panel .xray-method.put,
.xray-panel .xray-method.patch { color: var(--xray-yellow); }
.xray-panel .xray-method.delete { color: var(--xray-red); }

.xray-panel .xray-input,
.xray-panel .xray-select,
.xray-panel textarea,
.xray-panel input,
.xray-panel select {
  background: var(--xray-surface2);
  border-color: var(--xray-border-control);
  color: var(--xray-text);
}

/* Placeholders follow the theme's faint text (the console editor keeps its own rule). */
.xray-panel :is(.xray-input, input, textarea)::placeholder {
  color: var(--xray-hint);
  opacity: 1;
}

.xray-panel .xray-input:focus,
.xray-panel .xray-select:focus,
.xray-panel textarea:focus,
.xray-panel input:focus,
.xray-panel select:focus {
  outline: none;
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-focus) 18%, transparent);
}

.xray-panel .xray-json,
.xray-panel .xray-json-editor,
.xray-panel pre,
.xray-panel code,
.xray-panel kbd {
  font-family: var(--xray-font);
}

.xray-panel .xray-json,
.xray-panel .xray-json-editor {
  background: var(--xray-surface2);
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
}

.xray-panel .xray-json-line-no {
  color: color-mix(in srgb, var(--xray-hint) 82%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--xray-border) 72%, transparent);
}

.xray-panel .xray-detail-hero,
.xray-panel .xray-console-head,
.xray-panel .xray-api-toolbar,
.xray-panel .xray-api-command-bar,
.xray-panel .xray-detail-nav {
  background: var(--xray-surface);
  border-color: var(--xray-border);
}

.xray-panel .xray-detail-tabs button,
.xray-panel .xray-view-btn,
.xray-panel .xray-action-btn,
.xray-panel .xray-btn,
.xray-panel .xray-icon-btn {
  border-radius: var(--xray-radius);
}

/* The primary action: accent text and border on a flat 10 % accent fill (spec A2 \u2014 no
   accent\u2192mauve gradient). The one source for every primary button, in the panel and in modals. */
.xray-theme-scope .xray-action-btn.primary,
.xray-theme-scope .xray-btn.primary {
  color: var(--xray-accent);
  border-color: color-mix(in srgb, var(--xray-accent) 48%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
}

.xray-glow .xray-action-btn.primary:hover,
.xray-glow .xray-btn.primary:hover {
  box-shadow: 0 0 24px color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

/* Titles are plain text and section labels hint: neither is tinted toward the accent (spec A1).
   Section titles read in real case at 600 (spec S3): uppercase is kept only for the small
   Settings nav group labels. */
.xray-panel .xray-settings-section-title,
.xray-panel .xray-danger-title,
.xray-panel h4 {
  color: var(--xray-hint);
}

.xray-theme-scope .xray-settings-section-title,
.xray-theme-scope .xray-danger-title,
.xray-theme-scope h4 {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

/* h3 carries real titles (detail and finding titles, page heads): real case. */
.xray-panel h3 {
  letter-spacing: 0;
  color: var(--xray-text);
}

.xray-panel.xray-density-compact .xray-api-row,
.xray-panel.xray-density-compact .xray-console-row,
.xray-panel.xray-density-compact .xray-settings-row {
  font-size: 11px;
}

.xray-panel.xray-density-spacious .xray-api-row,
.xray-panel.xray-density-spacious .xray-console-row,
.xray-panel.xray-density-spacious .xray-settings-row {
  font-size: 13px;
}

@media (prefers-reduced-motion: reduce) {
  .xray-panel,
  .xray-panel *,
  .xray-panel *::before,
  .xray-panel *::after {
    transition: none !important;
    animation: none !important;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI tab-specific polish
   Firefox DevTools density + terminal-grade inspector ergonomics.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-filterbar {
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-panel .xray-search {
  min-height: 38px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface2);
}

/* Column headers are quiet labels (spec A1): hint, not the accent. */
.xray-panel .xray-api-table-head {
  min-height: 32px;
  color: var(--xray-hint);
  background: var(--xray-bg);
  border-bottom: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.xray-panel .xray-api-row {
  font-variant-numeric: tabular-nums;
}

.xray-panel .xray-path,
.xray-panel .xray-api-path,
.xray-panel .xray-response-heading h3 {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-panel .xray-bar-track {
  background: color-mix(in srgb, var(--xray-surface3, var(--xray-surface2)) 78%, var(--xray-sink, black) 22%);
  border: 1px solid color-mix(in srgb, var(--xray-border) 70%, transparent);
  overflow: hidden;
}

/* A neutral timing bar; slow and failed calls keep their status colours. */
.xray-panel .xray-bar {
  background: color-mix(in srgb, var(--xray-hint) 70%, transparent);
}

.xray-panel .xray-bar.slow { background: linear-gradient(90deg, var(--xray-yellow), var(--xray-peach)); }
.xray-panel .xray-bar.error { background: linear-gradient(90deg, var(--xray-red), color-mix(in srgb, var(--xray-red) 62%, var(--xray-peach))); }

.xray-panel .xray-request-detail {
  background: var(--xray-bg);
}

.xray-panel .xray-detail-hero {
  padding: calc(14px * var(--xray-density-scale, 1));
}

.xray-panel .xray-detail-tab,
.xray-panel .xray-detail-views .xray-chip {
  height: 30px;
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 700 11px/1 var(--xray-font-ui);
  letter-spacing: 0;
}

/* Facet tabs and body views are secondary choices: neutral when active (spec A1). */
.xray-panel .xray-detail-tab.active,
.xray-panel .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-panel .xray-operation-groups {
  padding: 10px 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-panel .xray-operation-group-label {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-console-head {
  min-height: var(--xray-chrome-h, 44px);
}

.xray-panel .xray-console-row {
  font-variant-numeric: tabular-nums;
  /* Message stream scans best dense \u2014 override the shared 52px operator row
     height (that height is tuned for the API/log tables, not a log stream). */
  min-height: 28px;
}

.xray-panel .xray-statusbar {
  min-height: 28px;
  padding: 0 12px;
  color: var(--xray-subtext);
  background: var(--xray-surface);
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: lowercase;
}

.xray-panel .xray-page-head {
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-panel .xray-page-head h3 {
  margin: 0;
  font-size: 14px;
}

.xray-panel .xray-page-head p {
  color: var(--xray-subtext);
}

.xray-panel .xray-card {
  position: relative;
  overflow: hidden;
}

.xray-panel .xray-insight-row {
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-surface2) 44%, transparent);
}

.xray-panel .xray-insight-row:hover {
  border-color: var(--xray-border);
  background: var(--xray-surface2);
}

/* Console controls are two explicit rows so a resized panel never asks the
   command editor, context picker, and actions to share one grid track. */
.xray-panel .xray-prompt {
  padding: 10px 14px;
  border-top-color: color-mix(in srgb, var(--xray-border) 78%, transparent);
  background: var(--xray-surface);
}

.xray-panel .xray-prompt-command-row > svg { color: var(--xray-subtext); }

.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea {
  min-width: 0;
  min-height: 38px;
  padding: 10px 13px;
  border-radius: var(--xray-radius-lg);
  font: inherit;
}

@container xray (max-width: 620px) {
  .xray-console-action > span,
  .xray-prompt-help > span,
  .xray-console-run > span,
  .xray-console-cancel > span,
  .xray-prompt-context-row .xray-console-action > span,
  .xray-context-inspect > span,
  .xray-snippet-trigger > .xray-chip-count {
    display: none;
  }

  .xray-console-action,
  .xray-prompt-help,
  .xray-console-run,
  .xray-console-cancel {
    width: 34px;
    justify-content: center;
    padding: 0;
  }

  .xray-prompt-context-row {
    gap: 6px;
  }

}

@container xray (max-width: 420px) {
  .xray-console-head {
    min-height: 40px;
  }

  .xray-console-title {
    padding-inline: 8px;
  }

  .xray-toolbar {
    gap: 4px;
    padding-right: 6px;
  }

  .xray-filterbar {
    gap: 6px;
    padding: 8px;
  }

  .xray-prompt {
    padding: 6px 8px;
  }

  .xray-prompt-command-row,
  .xray-prompt-context-row {
    gap: 5px;
  }

  .xray-prompt textarea {
    max-height: 50px;
  }
}


/* \u2500\u2500 God-tier feature styling: flags, drift, actions, waterfall, frames, tokens, rules, replay, AI \u2500\u2500 */

/* Categorical chrome is a neutral chip (spec S1, A2 \u2014 mauve is a data colour): text on a soft text tint, no outline. */
.xray-api-flag.drift,
.xray-api-flag.graphql {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-api-flag.ws {
  color: var(--xray-teal);
  background: color-mix(in srgb, var(--xray-teal) 10%, transparent);
}

.xray-api-flag.mocked,
.xray-api-flag.replayed {
  color: var(--xray-blue);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-drift-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 0;
  padding: 8px 12px;
  border: 0;
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
  font-size: 11px;
}

.xray-drift-banner span {
  flex: 1;
}

.xray-waterfall-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-waterfall-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.xray-waterfall-track {
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: var(--xray-radius-sm);
  overflow: hidden;
  background: rgba(var(--xray-bg-rgb), .55);
}

.xray-waterfall-seg {
  height: 100%;
  min-width: 2px;
}

.xray-waterfall-seg.dns,
.xray-waterfall-dot.dns { background: var(--xray-mauve); }
.xray-waterfall-seg.connect,
.xray-waterfall-dot.connect { background: var(--xray-blue); }
.xray-waterfall-seg.tls,
.xray-waterfall-dot.tls { background: var(--xray-teal); }
.xray-waterfall-seg.ttfb,
.xray-waterfall-dot.ttfb { background: var(--xray-yellow); }
.xray-waterfall-seg.download,
.xray-waterfall-dot.download { background: var(--xray-green); }
.xray-waterfall-seg.total,
.xray-waterfall-dot.total { background: var(--xray-subtext); }

.xray-waterfall-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.xray-waterfall-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--xray-subtext);
}

.xray-waterfall-legend strong {
  color: var(--xray-text);
}

.xray-waterfall-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--xray-radius-sm);
}

/* Frames (WebSocket / SSE) */
.xray-frames {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.xray-frames-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
}

.xray-ws-state {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-ws-state.open { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-ws-state.closed { color: var(--xray-subtext); }
.xray-ws-state.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }

.xray-frames-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: auto;
}

.xray-frame-row {
  display: grid;
  grid-template-columns: 52px 64px 56px 1fr;
  gap: 8px;
  align-items: center;
  padding: 5px 8px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-bg-rgb), .4);
  font-size: 11px;
}

.xray-frame-row.out { background: color-mix(in srgb, var(--xray-blue) 8%, transparent); }

.xray-frame-dir {
  font-weight: 700;
  font-size: 10px;
}

.xray-frame-dir.in { color: var(--xray-green); }
.xray-frame-dir.out { color: var(--xray-blue); }

.xray-frame-time,
.xray-frame-size {
  color: var(--xray-hint);
}

.xray-frame-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
}

.xray-initiator-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-initiator-list code {
  color: var(--xray-subtext);
  font-size: 11px;
}

/* JWT tokens */
.xray-tokens {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-token-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.xray-token-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-token-exp {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.xray-token-exp.valid { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-token-exp.expired { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }

.xray-token-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.xray-token-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-hint);
}

/* Controlled experiments live alongside the existing Rules workspace. */
.xray-experiments { min-width: 0; margin-bottom: 24px; }
.xray-experiment-list { display: grid; gap: 12px; min-width: 0; }
.xray-experiment-card { min-width: 0; overflow-wrap: anywhere; }
.xray-experiment-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.xray-experiment-head h4 { margin: 0; }
.xray-experiment-status { border: 1px solid var(--xray-border); border-radius: var(--xray-radius-sm); padding: 3px 7px; text-transform: capitalize; }
.xray-experiment-status.running, .xray-experiment-status.armed { color: var(--xray-text); }
.xray-experiment-status.failed { color: var(--xray-red); }
.xray-experiment-status.observed { color: var(--xray-green); }
.xray-experiment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.xray-experiment-url { grid-column: span 2; }
.xray-experiment-grid .xray-field, .xray-experiment-grid input, .xray-experiment-grid select { min-width: 0; width: 100%; }
.xray-experiment-options { display: grid; gap: 8px; margin: 12px 0; }
.xray-experiment-options label { display: flex; align-items: flex-start; gap: 6px; }
.xray-experiment-card details { margin: 12px 0; }
.xray-experiment-card pre { max-height: 180px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.xray-experiment-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; }
.xray-experiment-results ul { padding-left: 20px; }
/* Rules tab */
.xray-subtabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-subtabs::-webkit-scrollbar {
  display: none;
}

.xray-subtab {
  flex: 0 1 auto;
  min-width: 0;
  padding-inline: 8px;
  white-space: nowrap;
}

.xray-subpanel[hidden] {
  display: none;
}

.xray-section-hint {
  margin: 0;
  min-width: 0;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-investigations-bar {
  display: flex;
  align-items: center;
  gap: 8px 12px;
  flex-wrap: wrap;
}

.xray-investigations-bar .xray-section-hint {
  flex: 1 1 200px;
}

.xray-rules-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border) 70%, transparent);
}

.xray-rules-hint {
  flex: 1 1 320px;
  min-width: 0;
  margin: 0;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-rules-toolbar > .xray-spacer {
  display: none;
}

/* When the hint takes its own row, the actions stay right-aligned. */
.xray-rules-toolbar > .xray-toolbar-menu:first-of-type {
  margin-inline-start: auto;
}

.xray-toolbar-menu {
  position: relative;
  flex: 0 0 auto;
}

.xray-toolbar-menu-list {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 4px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 180px;
  max-width: calc(100cqw - 24px);
  max-height: min(320px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-rules-import {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.xray-rules-import-field {
  min-height: 96px;
  resize: vertical;
  font-family: var(--xray-font);
  font-size: 11px;
}

.xray-rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-rules-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: var(--xray-subtext);
  padding: 32px;
}

.xray-rule-card.disabled {
  opacity: .6;
}

.xray-rule-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.xray-rule-label {
  flex: 1;
  font-weight: 700;
}

.xray-rule-summary {
  font-size: 10px;
  font-weight: 700;
  color: var(--xray-subtext);
  white-space: nowrap;
}

.xray-rule-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.xray-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 180px;
}

.xray-field > span {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--xray-hint);
}

.xray-field-narrow {
  flex: 0 0 120px;
  min-width: 120px;
}

.xray-rule-body,
.xray-replay-headers,
.xray-replay-bodyfield {
  min-height: 96px;
  resize: vertical;
  font-family: var(--xray-font);
  line-height: 1.5;
}

.xray-rule-body {
  margin-top: 10px;
}

/* Replay modal */
.xray-replay-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-replay-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-replay-body > .xray-field {
  flex: 0 0 auto;
  min-width: 0;
}

/* The body is the free-form field: it takes the spare height. */
.xray-replay-body > .xray-field:has(.xray-replay-bodyfield) {
  flex: 1 1 auto;
}

.xray-replay-bodyfield {
  flex: 1 1 auto;
}

.xray-replay-line .xray-select {
  flex: 0 0 110px;
}

.xray-replay-line .xray-input {
  flex: 1 1 200px;
  min-width: 0;
  width: auto;
}

/* AI Explain modal */
.xray-explain-body {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-explain-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--xray-subtext);
  padding: 12px 0;
}

.xray-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--xray-border);
  border-top-color: var(--xray-subtext);
  border-radius: 50%;
  animation: xray-spin .7s linear infinite;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-explain-error {
  display: flex;
  gap: 10px;
  margin: 0;
  color: var(--xray-red);
  padding: 4px 0;
}

.xray-explain-error .xray-btn {
  margin-top: 8px;
}

.xray-explain-result {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--xray-text);
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* \u2500\u2500 Console snippet bar (folded-in Notebook) \u2500\u2500 */
.xray-snippet-load {
  max-width: 190px;
  padding: 4px 4px 4px 10px;
  border: none;
  background: transparent;
  color: var(--xray-subtext);
  font: inherit;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.xray-snippet-load:hover {
  color: var(--xray-text);
}

.xray-snippet-remove {
  display: inline-flex;
  align-items: center;
  padding: 0 7px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
}

.xray-snippet-remove:hover { color: var(--xray-red); }
/* \u2500\u2500 Console live/paused stream toggle \u2500\u2500 */
.xray-btn.xray-live {
  color: var(--xray-green);
  border-color: color-mix(in srgb, var(--xray-green) 32%, transparent);
  background: color-mix(in srgb, var(--xray-green) 8%, transparent);
}

.xray-btn.xray-paused {
  color: var(--xray-hint);
}

.xray-btn.xray-paused svg {
  opacity: .6;
}

/* \u2500\u2500 Log detail (Logs tab) \u2500\u2500 */
.xray-log-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 10px;
}

.xray-log-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.xray-log-level {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
}

.xray-log-level.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }
.xray-log-level.warn { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 10%, transparent); }
.xray-log-level.info { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 10%, transparent); }

.xray-log-load {
  margin-left: auto;
}

.xray-log-message {
  padding: 8px 10px;
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .5);
  color: var(--xray-text);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-log-detail-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.xray-log-hint {
  font-size: 11px;
}

/* \u2500\u2500 Visualize view: single-series horizontal bars \u2500\u2500 */
.xray-viz {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px;
}

.xray-viz-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.xray-viz-head h3 {
  margin: 0;
  font-size: 13px;
}

.xray-viz-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.xray-viz-row {
  display: grid;
  grid-template-columns: minmax(60px, 160px) 1fr minmax(48px, auto);
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.xray-viz-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--xray-subtext);
}

.xray-viz-track {
  position: relative;
  height: 14px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
}

.xray-viz-fill {
  display: block;
  height: 100%;
  min-width: 3px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-subtext);
}

.xray-viz-fill.negative {
  background: var(--xray-red);
}

.xray-viz-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-text);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.xray-viz-foot {
  font-size: 11px;
}

/* \u2500\u2500 Theme picker swatches (Settings \u2192 Appearance) \u2500\u2500 */
.xray-theme-picker-row {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.xray-theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

/* Two columns hold down to 560px of content width; below that one column keeps names whole. */
@container xray-settings-content (max-width: 559px) {
  .xray-theme-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.xray-theme-swatch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.xray-theme-swatch:hover {
  transform: translateY(-1px);
}

.xray-theme-swatch.active {
  border-color: var(--xray-accent);
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue)), 0 6px 18px var(--xray-shadow);
}

.xray-theme-swatch-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.xray-theme-swatch-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

/* \u2500\u2500 Toast: slide in, auto-dismiss \u2500\u2500 */
.xray-toast {
  animation: xray-toast-in .18s cubic-bezier(.2, .8, .3, 1);
}

@keyframes xray-toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* \u2500\u2500 Visualize bars: grow-in for perceived speed \u2500\u2500 */
.xray-viz-fill {
  transform-origin: left center;
  animation: xray-bar-grow .32s cubic-bezier(.2, .8, .3, 1);
}

@keyframes xray-bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* \u2500\u2500 Consistent focus-visible + interaction transitions \u2500\u2500 */
.xray-app-root button:focus-visible,
.xray-hud button:focus-visible,
.xray-app-root [role="button"]:focus-visible,
.xray-hud [role="button"]:focus-visible,
.xray-app-root .xray-input:focus-visible,
.xray-hud .xray-input:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-chip,
.xray-icon-btn,
.xray-btn,
.xray-api-row,
.xray-entry-row {
  transition: background-color .12s ease, border-color .12s ease, color .12s ease, transform .12s ease, box-shadow .12s ease;
}

.xray-icon-btn:hover {
  transform: translateY(-1px);
}

/* In-row action buttons live inside a scrolling virtualized list; the hover lift
   reads as jitter there while the row itself stays put. Keep them flat. */
.xray-api-row .xray-icon-btn:hover,
.xray-api-row-actions .xray-icon-btn:hover,
.xray-console-row .xray-icon-btn:hover,
.xray-log-row .xray-icon-btn:hover {
  transform: none;
}

/* Disabled controls read as disabled everywhere in the theme scope \u2014 the panel, its sibling modals
   and action buttons (final review M-5). After the primary rule, so a disabled primary is disabled. */
.xray-theme-scope :is(.xray-btn, .xray-action-btn, .xray-icon-btn, .xray-chip, .xray-input, .xray-select):disabled {
  color: var(--xray-disabled);
  border-color: color-mix(in srgb, var(--xray-disabled) 48%, transparent);
  cursor: not-allowed;
}

/* A host page in quirks mode resets colour and font size on tables (final review M-3). Zero
   specificity beyond the element: it beats only that UA quirk, never an authored table rule. */
:where(.xray-app-root, .xray-hud) table {
  color: inherit;
  font: inherit;
}

/* The request list and the Logs listbox: their rows are aria-activedescendant options, so the
   list's own ring is the only keyboard focus indicator. Full-strength --xray-focus at 2px (\u2265 3:1,
   High Contrast \u2265 7:1 on --xray-bg; test/unit/themeContrast.test.mjs), drawn inside the list so
   the scroller cannot clip it. [tabindex] lifts it over the generic focus rule's offset. */
.xray-panel :is(.xray-api-table-scroll, .xray-logs-list)[tabindex]:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .xray-toast,
  .xray-viz-fill {
    animation: none;
  }
}

/* \u2500\u2500 Custom theme builder (Settings \u2192 Appearance) \u2500\u2500 */
.xray-custom-theme {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 8px 0 4px;
  padding: 14px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-lg);
  background: rgba(var(--xray-surface-rgb), .5);
}

.xray-custom-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-custom-presets-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--xray-hint);
  margin-right: 2px;
}

.xray-custom-preset-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.xray-custom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.xray-custom-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.xray-custom-meta strong {
  font-size: 12px;
  color: var(--xray-text);
}

.xray-custom-meta small {
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-custom-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.xray-color-input {
  width: 34px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: transparent;
  cursor: pointer;
}

.xray-color-input::-webkit-color-swatch-wrapper { padding: 3px; }
.xray-color-input::-webkit-color-swatch { border: none; border-radius: var(--xray-radius-sm); }

.xray-custom-hex {
  width: 92px;
  text-transform: lowercase;
  font-variant-ligatures: none;
}

.xray-custom-hex.invalid {
  border-color: var(--xray-red);
}

.xray-custom-note {
  margin: 2px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--xray-hint);
}

/* \u2500\u2500 Live theme preview (painted with the resolved theme vars) \u2500\u2500 */
.xray-theme-preview {
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-bg);
  color: var(--xray-text);
  overflow: hidden;
  font-size: 11px;
  box-shadow: 0 8px 30px var(--xray-shadow);
}

.xray-tp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-tp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  /* The preview's brand mark: neutral, like the panel's (spec A1). */
  background: var(--xray-subtext);
}

.xray-tp-brand {
  font-weight: 700;
  letter-spacing: .12em;
  font-size: 10px;
}

.xray-tp-tab {
  padding: 2px 8px;
  border-radius: 999px;
  color: var(--xray-subtext);
}

.xray-tp-tab.active {
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
}

.xray-tp-grow { flex: 1; }

.xray-tp-btn {
  padding: 2px 10px;
  border-radius: var(--xray-radius-sm, 6px);
  font-weight: 700;
  color: var(--xray-bg);
  background: var(--xray-accent);
}

.xray-tp-rows {
  display: flex;
  flex-direction: column;
}

.xray-tp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border) 55%, transparent);
}

.xray-tp-row.selected {
  background: var(--xray-selection);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-tp-method {
  font-weight: 700;
  font-size: 10px;
  min-width: 44px;
}

.xray-tp-method.get { color: var(--xray-green); }
.xray-tp-method.post { color: var(--xray-blue); }
.xray-tp-method.delete { color: var(--xray-red); }

.xray-tp-path {
  flex: 1;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-tp-code {
  font-weight: 700;
  font-size: 10px;
}

.xray-tp-code.ok { color: var(--xray-green); }
.xray-tp-code.warn { color: var(--xray-yellow); }
.xray-tp-code.err { color: var(--xray-red); }

.xray-tp-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 9px 10px;
  background: var(--xray-surface);
}

.xray-tp-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.xray-tp-badge.green { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 10%, transparent); }
.xray-tp-badge.yellow { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 10%, transparent); }
.xray-tp-badge.red { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 10%, transparent); }
.xray-tp-badge.blue { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 10%, transparent); }
.xray-tp-badge.mauve { color: var(--xray-mauve); background: color-mix(in srgb, var(--xray-mauve) 10%, transparent); }

/* \u2500\u2500 Full-freedom token editor (grouped swatch grid) \u2500\u2500 */
.xray-custom-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-custom-group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.xray-custom-group-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--xray-subtext);
}

.xray-custom-group-hint {
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-custom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.xray-token-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-border) 60%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .45);
  transition: border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

/* A pinned token is a neutral pressed state (spec A1): the control outline and a stronger pill. */
.xray-token-field.pinned {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-token-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.xray-token-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--xray-text);
}

.xray-token-state {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 999px;
  color: var(--xray-hint);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-token-field.pinned .xray-token-state {
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-token-meta .xray-custom-hex {
  width: 100%;
  height: 24px;
  padding: 2px 6px;
  font-size: 11px;
}

.xray-token-actions {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.xray-token-btn,
.xray-token-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  /* Not --xray-hint: that measures 2.89:1 on --xray-surface, under the 3:1 floor for
     a control glyph, and this is the only interactive element in the component. */
  color: var(--xray-subtext);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--xray-dur-fast) var(--xray-ease), color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-token-field:hover .xray-token-btn,
.xray-token-field:focus-within .xray-token-btn,
.xray-token-field:hover .xray-token-reset,
.xray-token-field:focus-within .xray-token-reset,
.xray-token-field.pinned .xray-token-reset {
  opacity: 1;
}

.xray-token-btn:hover,
.xray-token-reset:hover:not(:disabled) {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-token-reset:disabled {
  opacity: 0;
  cursor: default;
}

.xray-custom-footnote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  color: var(--xray-subtext);
}

@media (max-width: 560px) {
  .xray-custom-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Themeable corner radius: every rounded-rect radius across the stylesheet is
   driven by the --xray-radius scale (pills at 999px and 50% circles keep their
   shape). The base --xray-radius is set inline per panel from settings.radius. */

/* \u2500\u2500 Range slider (radius) \u2500\u2500 */
.xray-range-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.xray-range {
  width: 120px;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-surface2) 80%, transparent);
  outline: none;
  cursor: pointer;
}

.xray-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--xray-accent, var(--xray-blue));
  border: 2px solid var(--xray-surface);
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue));
}

.xray-range::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border: 2px solid var(--xray-surface);
  border-radius: 50%;
  background: var(--xray-accent, var(--xray-blue));
}

.xray-range-value {
  min-width: 34px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--xray-subtext);
}

/* \u2500\u2500 Theme Studio toolbar + import \u2500\u2500 */
.xray-custom-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-custom-import {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-custom-import-field {
  width: 100%;
  min-height: 84px;
  resize: vertical;
  font-family: var(--xray-font);
  font-size: 11px;
  line-height: 1.5;
}

/* \u2500\u2500 Hacker mode: CRT scanlines + vignette + moving scan sweep + phosphor bloom \u2500\u2500
   Cosmetic, opt-in, pointer-events:none. Layer 1 (sweep) is the only layer the
   keyframes move; scanlines and vignette stay put. \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel.xray-hacker::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  background:
    linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--xray-accent) 16%, transparent) 45%, transparent 90%),
    linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, .18) 50%),
    radial-gradient(ellipse 130% 100% at 50% 50%, transparent 50%, rgba(0, 0, 0, .34) 100%);
  background-size: 100% 42%, 100% 3px, 100% 100%;
  background-repeat: no-repeat, repeat, no-repeat;
  background-position: 0 -42%, 0 0, 0 0;
}

/* phosphor bloom on text + a faint scanned tint over the whole panel */
.xray-panel.xray-hacker {
  text-shadow: 0 0 4px color-mix(in srgb, var(--xray-accent) 30%, transparent);
}

.xray-panel.xray-hacker .xray-json-line-text,
.xray-panel.xray-hacker .xray-console-message,
.xray-panel.xray-hacker .xray-path,
.xray-panel.xray-hacker .xray-method {
  text-shadow: 0 0 7px color-mix(in srgb, var(--xray-green) 42%, transparent);
}

.xray-panel.xray-hacker .xray-brand-mark {
  box-shadow: 0 0 18px color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

@keyframes xray-crt-sweep {
  0% { background-position: 0 -42%, 0 0, 0 0; }
  100% { background-position: 0 142%, 0 0, 0 0; }
}

@keyframes xray-crt-flicker {
  0%, 96%, 100% { opacity: 1; }
  97% { opacity: .82; }
  98% { opacity: 1; }
  99% { opacity: .9; }
}

@media (prefers-reduced-motion: no-preference) {
  .xray-panel.xray-hacker::after {
    animation: xray-crt-sweep 5.5s linear infinite, xray-crt-flicker 7s steps(1) infinite;
  }
}

/* \u2500\u2500 Contrast report (Theme Studio) \u2500\u2500 */
.xray-contrast {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius, 8px);
  background: rgba(var(--xray-bg-rgb), .4);
}

.xray-contrast-title {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--xray-hint);
  margin-bottom: 2px;
}

.xray-contrast-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}

.xray-contrast-label {
  color: var(--xray-subtext);
}

.xray-contrast-row strong {
  color: var(--xray-text);
  font-variant-numeric: tabular-nums;
}

.xray-contrast-grade {
  min-width: 58px;
  text-align: center;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.xray-contrast-grade.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-contrast-grade.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-contrast-grade.fail {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Frontend elevation \u2014 command center, empty states, motion, micro-interactions
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 Command center \u2500\u2500 */
.xray-command-modal {
  width: min(620px, 94vw);
}

.xray-command-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--xray-border);
  border-radius: 0;
  background: transparent;
}

/* The shared .xray-search icon is absolutely positioned and the input's left padding
   used to be zeroed here, so the icon sat on top of the placeholder. Lay it out inline. */
.xray-command-search svg {
  position: static;
  transform: none;
  flex: 0 0 auto;
}

.xray-modal .xray-command-search .xray-input {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 14px;
  border: none;
  background: transparent;
  padding: 0;
  text-overflow: ellipsis;
}

.xray-command-search .xray-input:focus {
  box-shadow: none;
  outline: none;
}

.xray-command-list {
  grid-template-columns: minmax(0, 1fr);
  max-height: min(56vh, 460px);
  overflow-y: auto;
  padding: 6px;
  scroll-padding: 40px 0;
}

.xray-command-group {
  min-width: 0;
}

.xray-command-group + .xray-command-group {
  margin-top: 2px;
}

.xray-command-group-label.request {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
}

.xray-command-group-label {
  padding: 8px 10px 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .7px;
  text-transform: uppercase;
  color: var(--xray-hint);
}

.xray-command-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--xray-dur-fast) var(--xray-ease);
}

.xray-command-row {
  min-width: 0;
  max-width: 100%;
}

/* The keyboard-active row: a neutral fill and the accent indicator bar (spec A1). */
.xray-command-row.active {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-command-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
  color: var(--xray-subtext);
}

.xray-command-row.active .xray-command-icon {
  color: var(--xray-text);
}

.xray-command-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-command-label mark {
  background: transparent;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-cmd-method {
  min-width: 34px;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  color: currentColor;
}

.xray-command-hint {
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--xray-hint);
}

.xray-command-enter {
  color: var(--xray-text);
  flex-shrink: 0;
}

.xray-command-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 36px 16px;
  text-align: center;
  color: var(--xray-subtext);
}

.xray-command-empty svg { color: var(--xray-hint); }
.xray-command-empty small { color: var(--xray-hint); font-size: 11px; }

.xray-command-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 14px;
  border-top: 1px solid var(--xray-border);
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-command-foot kbd {
  display: inline-block;
  min-width: 16px;
  margin-right: 2px;
  padding: 1px 5px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-surface-rgb), .8);
  font-family: var(--xray-font);
  font-size: 10px;
  color: var(--xray-subtext);
}

/* \u2500\u2500 Global search (Find in traffic) \u2500\u2500 */
.xray-gsearch-modal {
  width: min(720px, 94vw);
}

.xray-gsearch-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-gsearch-input {
  flex: 1;
  margin: 0;
}

/* The limits sentence wraps in full; it is never an ellipsised or clipped line. */
.xray-gsearch-limits {
  display: block;
  padding-top: 8px;
  padding-bottom: 8px;
}

.xray-gsearch-list {
  max-height: min(56vh, 520px);
  overflow-y: auto;
  padding: 6px;
}

.xray-gsearch-error {
  padding: 14px 16px;
  color: var(--xray-red);
  font-size: 12px;
}

.xray-gsearch-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  text-align: left;
  cursor: pointer;
}

.xray-gsearch-row.active {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-gsearch-row .xray-cmd-method {
  margin-top: 1px;
  flex-shrink: 0;
}

.xray-gsearch-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.xray-gsearch-path {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-gsearch-field {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 999px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-gsearch-snippet {
  font-family: var(--xray-font);
  font-size: 11px;
  line-height: 1.4;
  color: var(--xray-subtext);
  word-break: break-word;
}

/* A find highlight, not a state: the marker yellow (spec A1 keeps the accent off it). */
.xray-gsearch-snippet mark {
  background: color-mix(in srgb, var(--xray-yellow) 24%, transparent);
  color: var(--xray-text);
  border-radius: var(--xray-radius-sm);
  padding: 0 1px;
}

.xray-gsearch-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* \u2500\u2500 Elegant empty states \u2500\u2500 */
.xray-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 160px;
  padding: 28px 20px;
  margin: auto;
  text-align: center;
  animation: xray-empty-in 320ms var(--xray-ease-out);
}

@keyframes xray-empty-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.xray-empty-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  /* An illustration, not a state: neutral (spec A1). */
  color: var(--xray-subtext);
  background: rgba(var(--xray-text-rgb), .04);
  box-shadow: 0 0 0 1px var(--xray-border);
}

.xray-empty-title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-empty-hint {
  margin: 0;
  max-width: 320px;
  font-size: 11px;
  line-height: 1.55;
  color: var(--xray-subtext);
}

.xray-empty-action {
  margin-top: 6px;
}

/* \u2500\u2500 First-run introduction (replaces the API empty state until dismissed) \u2500\u2500 */
/* Denser than .xray-empty on purpose: this is an operator console, so the first
   screen should look like the product rather than like an onboarding splash. */
.xray-firstrun {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: auto;
  padding: 20px;
  max-width: 620px;
  border-radius: var(--xray-radius);
  border: 1px solid var(--xray-border);
  background: var(--xray-surface);
  animation: xray-empty-in 320ms var(--xray-ease-out);
}

.xray-firstrun-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.xray-firstrun-title {
  margin: 0 0 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-firstrun-lede {
  margin: 0;
  max-width: 46ch;
  font-size: 11px;
  line-height: 1.55;
  color: var(--xray-subtext);
}

.xray-firstrun-dismiss {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
  transition: color var(--xray-dur-fast) var(--xray-ease),
              background-color var(--xray-dur-fast) var(--xray-ease);
}

.xray-firstrun-dismiss:hover {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-text) 8%, transparent);
}

.xray-firstrun-dismiss:focus-visible {
  outline: none;
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 45%, transparent);
}

.xray-firstrun-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--xray-radius-sm);
  overflow: hidden;
  background: color-mix(in srgb, var(--xray-text) 10%, transparent);
}

.xray-firstrun-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--xray-bg);
}

.xray-firstrun-cell-head {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.xray-firstrun-cell-icon {
  display: inline-flex;
  color: var(--xray-subtext);
}

.xray-firstrun-cell-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--xray-text);
}

.xray-firstrun-cell-body {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--xray-subtext);
}

.xray-firstrun-foot {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 10.5px;
  /* --xray-hint is 2.89:1 here, under AA for 10.5px body text. */
  color: var(--xray-subtext);
}

.xray-firstrun-plus {
  color: var(--xray-subtext);
}

/* These forms live inside the size-contained panel; keep the rules after their
   default declarations so the narrow layout wins the cascade on wide monitors. */
@container xray (max-width: 600px) {
  .xray-experiment-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-experiment-url {
    grid-column: auto;
  }

  .xray-experiment-actions .xray-spacer {
    display: none;
  }
}

@container xray (max-width: 560px) {
  .xray-firstrun-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* \u2500\u2500 Animated active-tab indicator \u2500\u2500 */
.xray-tab {
  position: relative;
}

.xray-tab::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 999px;
  background: var(--xray-accent, var(--xray-blue));
  transform: scaleX(0);
  transform-origin: center;
  opacity: 0;
  transition: transform var(--xray-dur) var(--xray-ease-out), opacity var(--xray-dur) var(--xray-ease-out);
}

.xray-tab.active::after {
  transform: scaleX(1);
  opacity: 1;
}

/* \u2500\u2500 Refined modal entrance \u2500\u2500 */
.xray-modal {
  animation: xray-modal-in 200ms var(--xray-ease-out);
}

.xray-modal-backdrop {
  animation: xray-fade-in 160ms ease-out;
  backdrop-filter: blur(3px);
}

@keyframes xray-modal-in {
  from { opacity: 0; transform: translateY(10px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes xray-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* \u2500\u2500 Selection & row micro-interactions \u2500\u2500 */
/* The selected row's indicator bar: one of the few things the accent paints (spec A1). */
.xray-api-row.selected,
.xray-entry-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent);
}

.xray-live-dot.on {
  animation: xray-pulse 2.4s var(--xray-ease) infinite;
}

@keyframes xray-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--xray-green) 55%, transparent); }
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--xray-green) 0%, transparent); }
}

@media (prefers-reduced-motion: reduce) {
  .xray-empty,
  .xray-firstrun,
  .xray-modal,
  .xray-modal-backdrop,
  .xray-spinner,
  .xray-live-dot.on {
    animation: none;
  }
  .xray-tab::after {
    transition: none;
  }
}

/* \u2500\u2500 Version tag in the header brand \u2500\u2500 */
.xray-brand-ver {
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--xray-border);
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  cursor: help;
}

/* \u2500\u2500 API tab rework: headers grid, structural diff, initiator frames \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-headers-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xray-headers-filter {
  max-width: 340px;
}

.xray-headers-section h4 {
  margin: 0 0 6px;
  font-size: 11px;
  color: var(--xray-subtext, var(--xray-text));
}

.xray-headers-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  overflow: hidden;
}

.xray-header-row {
  display: grid;
  grid-template-columns: minmax(120px, 220px) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid var(--xray-border);
  font-size: 11px;
}

.xray-header-row:last-child {
  border-bottom: none;
}

.xray-header-row:hover {
  background: var(--xray-hover);
}

.xray-header-name {
  color: var(--xray-subtext);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-header-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
}

.xray-header-row .xray-icon-btn {
  opacity: 0;
}

.xray-header-row:hover .xray-icon-btn,
.xray-header-row .xray-icon-btn:focus-visible {
  opacity: 1;
}

.xray-diff {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-diff-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.xray-diff-lines {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  overflow: hidden;
  font-size: 11px;
}

.xray-diff-line {
  display: grid;
  grid-template-columns: 18px minmax(120px, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-diff-line:last-child {
  border-bottom: none;
}

.xray-diff-line.added {
  background: color-mix(in srgb, var(--xray-green) 9%, transparent);
}

.xray-diff-line.removed {
  background: color-mix(in srgb, var(--xray-red) 9%, transparent);
}

.xray-diff-line.changed {
  background: color-mix(in srgb, var(--xray-yellow) 7%, transparent);
}

.xray-diff-kind {
  font-weight: 700;
}

.xray-diff-line.added .xray-diff-kind { color: var(--xray-green); }
.xray-diff-line.removed .xray-diff-kind { color: var(--xray-red); }
.xray-diff-line.changed .xray-diff-kind { color: var(--xray-yellow); }

.xray-diff-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-diff-before,
.xray-diff-after {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-diff-before { color: var(--xray-red); }
.xray-diff-after { color: var(--xray-green); }

.xray-initiator-frame {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 2px 0;
}

.xray-initiator-fn {
  font-weight: 700;
  color: var(--xray-text);
}

.xray-initiator-loc {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext, var(--xray-hint));
}

.xray-initiator-frame .xray-icon-btn {
  opacity: 0;
}

.xray-initiator-frame:hover .xray-icon-btn,
.xray-initiator-frame .xray-icon-btn:focus-visible {
  opacity: 1;
}

.xray-json-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Closed drawer: give the space back to the list and context panes instead of
   parking a 560px "Nothing selected" column (the detail-open hook previously
   matched no CSS at all). */
.xray-api-workspace:not(.detail-open) .xray-api-detail-drawer.empty {
  display: none;
}

.xray-api-workspace:not(.detail-open) .xray-api-body {
  grid-template-columns: minmax(260px, var(--xray-api-split, 1fr)) minmax(300px, 1.1fr);
}

/* Nothing selected at all: the (auto-hidden) context pane frees its column too. */
.xray-api-workspace:not(.detail-open) .xray-api-body:has(.xray-request-context-pane.empty) {
  grid-template-columns: minmax(0, 1fr);
}

/* S18: ~44px single-line request rows. Comes after the operator layer, whose
   \`.xray-panel .xray-api-row { min-height: var(--xray-row-h) }\` would otherwise
   win; density still scales it, and the compact-rows setting goes denser. */
.xray-panel .xray-api-workspace .xray-api-row {
  min-height: calc(44px * var(--xray-density-scale, 1));
}

.xray-panel.xray-compact-rows .xray-api-workspace .xray-api-row {
  min-height: 32px;
}

.xray-api-row-actions .xray-icon-btn {
  width: 26px;
  height: 26px;
}

/* \u2500\u2500 S20: narrow API layouts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   > 900px   list | detail side by side (draggable column divider).
   600\u2013900   list on top, detail below; a row divider resizes the list (40\u201375%).
   < 600     the detail replaces the list at full height; "Requests" goes back.
   Selectors carry the workspace class so they outrank the closed-drawer grid
   rules above (which only apply side by side). */
.xray-api-detail-back {
  display: none;
}

.xray-pane-divider.xray-pane-divider-rows {
  display: none;
  top: auto;
  right: 0;
  bottom: -4px;
  left: 0;
  width: auto;
  height: 9px;
  cursor: ns-resize;
}

.xray-pane-divider.xray-pane-divider-rows::after {
  width: 46px;
  height: 3px;
}

@container xray (max-width: 900px) {
  .xray-api-workspace .xray-api-body,
  .xray-api-workspace:not(.detail-open) .xray-api-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-api-workspace.detail-open .xray-api-body {
    grid-template-rows: minmax(0, var(--xray-api-vlist, 50fr)) minmax(0, var(--xray-api-vrest, 50fr));
  }

  .xray-api-workspace .xray-pane-divider:not(.xray-pane-divider-rows) {
    display: none;
  }

  .xray-api-workspace .xray-api-collection-pane {
    border-right: 0;
  }

  .xray-api-workspace .xray-api-detail-drawer {
    border-top: 1px solid var(--xray-border);
  }

  .xray-api-workspace .xray-api-detail-drawer.empty {
    display: none;
  }

  /* Short stacked detail: let the whole drawer scroll so the response keeps a
     usable height under the header and facet row instead of being squeezed. */
  .xray-api-workspace .xray-api-drawer-body {
    overflow: auto;
  }

  .xray-api-workspace .xray-request-detail {
    height: auto;
    min-height: 100%;
  }

  .xray-api-workspace .xray-detail-content {
    flex: 1 0 200px;
  }

  /* The base \u2264760px rule hides \`.xray-entry-duration\` for Logs; API rows keep it. */
  .xray-api-workspace .xray-api-row > .xray-entry-duration {
    display: grid;
  }
}

@container xray (600px <= width <= 900px) {
  .xray-api-workspace.detail-open .xray-pane-divider.xray-pane-divider-rows {
    display: block;
  }
}

@container xray (width < 600px) {
  .xray-api-workspace.detail-open .xray-api-body {
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-api-workspace.detail-open .xray-api-collection-pane {
    display: none;
  }

  .xray-api-workspace .xray-api-detail-drawer {
    border-top: 0;
  }

  .xray-api-workspace.detail-open .xray-api-detail-back {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid var(--xray-border);
    background: var(--xray-surface);
  }

  .xray-api-back-btn {
    height: 30px;
    gap: 6px;
    padding: 0 10px;
  }

  /* "Requests" is the way back here; the header close would duplicate it. */
  .xray-api-workspace .xray-detail-close {
    display: none;
  }

  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 44px minmax(0, 1fr) 34px 54px auto;
    gap: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .xray-api-row .xray-bar-track {
    display: none;
  }

  .xray-api-row > .xray-entry-duration {
    grid-template-columns: auto;
    justify-content: end;
  }
}

/* \u2500\u2500 Collapsible section primitive (CollapsibleSection.tsx) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-collapsible {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.xray-collapsible-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: 0;
  background: transparent;
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 700 10px/1 var(--xray-font-ui);
  letter-spacing: .07em;
  text-transform: uppercase;
  text-align: left;
}

.xray-collapsible-header:hover {
  color: var(--xray-text);
}

/* One knob for the whole collapse/expand feel. Deliberately slow + even-paced
   so sections unfold like a drawer, not a snap. */
.xray-collapsible {
  --xray-collapse-dur: 420ms;
  --xray-collapse-ease: cubic-bezier(.4, 0, .2, 1);
}

.xray-collapsible-chevron {
  flex: 0 0 auto;
  color: var(--xray-hint, var(--xray-subtext));
  transition: transform var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed .xray-collapsible-chevron {
  transform: rotate(-90deg);
}

.xray-collapsible-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-collapsible-right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  letter-spacing: 0;
}

.xray-collapsible-body {
  min-height: 0;
  /* grid trick animates height from 0 without knowing the content height */
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed > .xray-collapsible-body {
  grid-template-rows: 0fr;
}

.xray-collapsible-body > .xray-collapsible-inner {
  min-height: 0;
  overflow: hidden;
  /* Fade + slight rise so content eases in with the height, rather than being
     hard-clipped \u2014 this reads far gentler than a pure height reveal. */
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--xray-collapse-dur) var(--xray-collapse-ease),
              transform var(--xray-collapse-dur) var(--xray-collapse-ease);
}

.xray-collapsible.collapsed > .xray-collapsible-body > .xray-collapsible-inner {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .xray-collapsible-chevron,
  .xray-collapsible-body,
  .xray-collapsible-body > .xray-collapsible-inner {
    transition: none;
  }
}

/* Insight cards use the collapsible header in place of the old <h3>. Keep the
   card's inner padding but let the header title read like the old heading. */
.xray-card.xray-collapsible {
  padding: 12px;
}

.xray-card.xray-collapsible > .xray-collapsible-header {
  padding: 0 0 8px;
  font-size: 12px;
}

/* Density toggle in the API table header (last column, right-aligned). */
.xray-api-table-tools {
  display: flex;
  justify-content: flex-end;
}

/* Phase 2 response-first workspace: keep the response readable, then disclose
   metadata and secondary operations without changing the token contract. */
.xray-request-detail:not(.compact) {
  container-type: inline-size;
  container-name: xray-detail;
}

/* S19 header: request line, status chips and the request actions (Copy, Export,
   Console, More actions) share one row; the bottom action bar is gone. Nothing
   here may clip overflow: the More menu is positioned against .xray-detail-more. */
.xray-request-detail:not(.compact) .xray-detail-hero {
  flex-wrap: nowrap;
  gap: 6px;
  padding: 8px 10px 8px 12px;
}

.xray-request-detail:not(.compact) .xray-response-heading {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-request-detail:not(.compact) .xray-response-chips {
  flex: 0 0 auto;
  gap: 4px;
}

.xray-request-detail:not(.compact) .xray-response-chip {
  height: 24px;
  padding: 0 7px;
  font-size: 11px;
}

.xray-detail-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.xray-request-detail:not(.compact) .xray-detail-action {
  flex: 0 0 auto;
  height: 30px;
  gap: 5px;
  padding: 0 9px;
  font: 700 12px/1 var(--xray-font-ui);
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-action[aria-expanded="true"] {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
}

.xray-request-detail:not(.compact) .xray-detail-close {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
}

/* One facet row (Response \xB7 Request \xB7 Headers \xB7 Timing \u2026) with the lens as a
   compact segmented control on the right. When both do not fit, the lens drops
   to its own line; the facet row scrolls (visible thin scrollbar) rather than
   wrapping or clipping. */
.xray-request-detail:not(.compact) .xray-detail-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  padding: 4px 10px 4px 12px;
}

.xray-request-detail:not(.compact) .xray-detail-tabs {
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: nowrap;
  gap: 2px;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.xray-request-detail:not(.compact) .xray-detail-tabs::-webkit-scrollbar {
  display: block;
  height: 4px;
}

.xray-request-detail:not(.compact) .xray-detail-tabs::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-hint) 60%, transparent);
}

.xray-request-detail:not(.compact) .xray-detail-tab {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 8px;
  color: var(--xray-subtext);
  font-size: 12px;
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-tab.active {
  color: var(--xray-text);
}

.xray-request-detail:not(.compact) .xray-detail-views {
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 0;
  margin-left: auto;
  padding: 2px;
  overflow: visible;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .5);
}

.xray-request-detail:not(.compact) .xray-detail-views .xray-chip {
  min-width: 0;
  height: 24px;
  justify-content: center;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius-sm);
  font: 600 11px/1 var(--xray-font-ui);
  white-space: nowrap;
}

.xray-request-detail:not(.compact) .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
  background: var(--xray-surface3);
}

.xray-detail-more {
  position: relative;
  min-width: 0;
}

.xray-detail-action-list {
  position: absolute;
  inset-inline-end: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 232px;
  max-width: calc(100vw - 24px);
  max-height: min(420px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
  bottom: calc(100% + 4px);
}

.xray-detail-action-list[data-placement="down"] {
  bottom: auto;
  top: calc(100% + 4px);
}

.xray-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: inherit;
  font-size: 12px;
  text-align: start;
  white-space: nowrap;
  cursor: pointer;
}

.xray-menu-item svg {
  flex: 0 0 auto;
  color: var(--xray-subtext);
}

.xray-menu-item:hover,
.xray-menu-item:focus-visible {
  background: var(--xray-surface2);
}

/* A pressed menu toggle is a neutral pressed state (spec A1). */
.xray-menu-item[aria-pressed="true"] {
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-menu-sep {
  flex: 0 0 auto;
  height: 1px;
  margin: 3px 4px;
  background: var(--xray-border);
}

.xray-detail-metadata,
.xray-detail-recommendations {
  min-width: 0;
  padding: 6px 12px;
}

.xray-detail-metadata {
  display: grid;
  gap: 6px;
}

.xray-detail-metadata label {
  display: grid;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 12px;
}

.xray-detail-metadata .xray-input {
  width: 100%;
  min-width: 0;
}

.xray-detail-recommendations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.xray-api-toolbar .xray-filter-chips,
.xray-api-active-filters,
.xray-api-filters-collapsible {
  min-width: 0;
}

.xray-api-toolbar .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-api-filter-remove {
  min-width: 0;
  max-width: 100%;
}

.xray-api-filter-remove > svg {
  flex: 0 0 auto;
}

.xray-api-toolbar .xray-chip {
  min-height: 30px;
  height: auto;
  padding: 4px 9px;
  font-size: 12px;
}

.xray-panel .xray-api-toolbar .xray-api-search {
  min-height: 32px;
}

.xray-api-toolbar .xray-filter-label,
.xray-api-toolbar .xray-chip-count {
  font-size: 12px;
}

.xray-request-detail:not(.compact) :is(button, input):focus-visible,
.xray-api-toolbar :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

/* Narrower detail: the action labels collapse to icons (the label text stays in
   the accessibility tree, so names and \`title\`s are unchanged). */
@container xray-detail (max-width: 940px) {
  .xray-request-detail:not(.compact) .xray-detail-action {
    width: 30px;
    padding: 0;
  }

  .xray-request-detail:not(.compact) .xray-detail-action-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

/* Phone-width detail: the request line takes its own row; chips and actions
   share the second. The lens spans the width as one equal-segment row. */
@container xray-detail (max-width: 560px) {
  .xray-request-detail:not(.compact) .xray-detail-hero {
    flex-wrap: wrap;
  }

  .xray-request-detail:not(.compact) .xray-response-heading {
    flex: 1 0 100%;
  }

  .xray-request-detail:not(.compact) .xray-response-chips {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .xray-request-detail:not(.compact) .xray-detail-views {
    flex: 1 1 100%;
    margin-left: 0;
  }

  .xray-request-detail:not(.compact) .xray-detail-views .xray-chip {
    flex: 1 1 0;
    padding: 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.xray-density-toggle {
  width: 24px;
  height: 24px;
}

/* \u2500\u2500 Interactive JSON tree (JsonView.tsx) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-json-tree {
  display: flex;
  flex-direction: column;
  min-height: 0;
  font: 600 11.5px/1.6 var(--xray-font);
}

.xray-json-tree-toolbar {
  display: flex;
  gap: 6px;
  padding: 0 0 6px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.xray-json-tree-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .6);
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 700 10px/1 var(--xray-font-ui);
  letter-spacing: .02em;
}

.xray-json-tree-btn:hover {
  color: var(--xray-text);
  border-color: var(--xray-border-control);
}

.xray-json-tree-body {
  min-width: 0;
  overflow-x: auto;
}

.xray-json-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding-right: 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-align: left;
}

/* S21: a long value never shreds its key. Keys, separators and brackets keep
   their width on one line; only the value wraps, inside its own box. A key
   wider than the pane scrolls with the tree body instead of breaking. */
.xray-json-row > .xray-json-key,
.xray-json-row > .xray-json-punct,
.xray-json-row > .xray-json-label {
  flex: 0 0 auto;
  white-space: pre;
}

.xray-json-row > .xray-json-value {
  flex: 1 1 auto;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.xray-json-branch {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.xray-json-branch:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-json-gutter {
  flex: 0 0 13px;
}

.xray-json-chevron {
  flex: 0 0 auto;
  margin-top: 3px;
  color: var(--xray-hint, var(--xray-subtext));
  transition: transform var(--xray-dur-fast, .12s) var(--xray-ease, ease);
}

.xray-json-chevron.closed {
  transform: rotate(-90deg);
}

.xray-json-summary {
  margin: 0 6px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .7);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 700;
}

.xray-json-scalar {
  margin: 0;
}

/* Selectable tree (Console inspector): flat rows, one roving tab stop; the
   chevron toggles on click, the row selects. */
.xray-json-flatrow {
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-json-flatrow:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-json-flatrow:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

/* A selected node: the selection fill and the accent indicator bar, like a selected request. */
.xray-json-flatrow[aria-selected="true"] {
  background: var(--xray-selection);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-json-toggle {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--xray-radius-sm);
  cursor: pointer;
}

.xray-json-toggle:hover {
  background: rgba(var(--xray-surface2-rgb), .7);
}

.xray-json-toggle .xray-json-chevron {
  margin-top: 0;
}

.xray-json-more {
  margin: 2px 0;
}

.xray-json-empty {
  margin: 8px 0;
  color: var(--xray-subtext);
  font: 600 12px/1.5 var(--xray-font-ui);
}

@media (prefers-reduced-motion: reduce) {
  .xray-json-chevron {
    transition: none;
  }
}

/* \u2500\u2500 API detail body views: Raw and Tree from the captured text (JSON fidelity J2, J3, J13) \u2500\u2500
   The Tree and Raw fill the detail content and window their rows inside their own scroller, so
   the content is a column: notices take their height, the view takes the rest (never less than a
   usable minimum, even where the content area has no fixed height). */
.xray-detail-content.has-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xray-detail-content.has-pane > .xray-body-pane,
.xray-detail-content.has-pane > .xray-raw,
.xray-detail-content.has-pane > .xray-body-scroll {
  flex: 1 1 0;
  min-height: 280px;
}

.xray-body-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.xray-body-pane > .xray-json-tree.is-virtual,
.xray-body-pane > .xray-raw {
  flex: 1 1 0;
  min-height: 0;
}

.xray-body-scroll {
  min-width: 0;
  overflow: auto;
}

.xray-json-tree.is-virtual {
  padding: 8px 0 0;
}

.xray-json-tree.is-virtual > .xray-json-tree-toolbar {
  flex-wrap: wrap;
  align-items: center;
  padding: 0 8px 6px;
}

.xray-json-vscroll {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
}

.xray-json-vlist {
  position: relative;
  width: 100%;
}

.xray-json-vrow {
  position: absolute;
  top: 0;
  left: 0;
}

.xray-json-budget-row {
  flex-wrap: wrap;
  gap: 8px;
}

/* A repeated key (after the key) and a number JavaScript cannot hold (after the number). */
.xray-json-tag {
  flex: 0 0 auto;
  align-self: center;
  margin: 0 6px 0 0;
  padding: 0 6px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--xray-tag-color, var(--xray-yellow)) 10%, transparent);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.xray-json-tag.inexact {
  --xray-tag-color: var(--xray-peach);
  margin: 0 0 0 6px;
}

.xray-json-row.has-hint > .xray-json-value {
  flex: 0 1 auto;
}

.xray-json-note {
  color: var(--xray-subtext);
  font: 700 10px/1.4 var(--xray-font-ui);
}

.xray-json-depth {
  flex: 0 0 auto;
  margin-right: 4px;
  padding: 0 4px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-surface2-rgb), .7);
  color: var(--xray-hint);
  font-size: 10px;
}

/* A bidi control shown as its escape: set apart from the text around it. */
.xray-bidi {
  padding: 0 1px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-red) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-red) 42%, transparent);
  color: var(--xray-text);
  font-style: normal;
}

.xray-raw-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
}

.xray-raw-toolbar .xray-json-tree-btn[aria-pressed="true"] {
  border-color: var(--xray-border-control);
  color: var(--xray-text);
  background: var(--xray-surface3);
}

.xray-raw-toolbar .xray-json-tree-btn:disabled {
  cursor: default;
  opacity: .55;
}

.xray-raw-error {
  color: var(--xray-red);
  font: 700 11px/1.4 var(--xray-font-ui);
}

.xray-raw {
  position: relative;
  min-width: 0;
  overflow: auto;
  padding: 8px 0;
}

.xray-raw:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

.xray-raw-list {
  position: relative;
  width: 100%;
}

.xray-raw-block {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.xray-raw.no-gutter .xray-json-line {
  grid-template-columns: minmax(0, 1fr);
}

.xray-json-line.has-mark {
  background: color-mix(in srgb, var(--xray-red) 9%, transparent);
}

.xray-raw-mark {
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-red) 34%, transparent);
  box-shadow: 0 0 0 1px var(--xray-red);
  color: var(--xray-text);
}

.xray-raw-mark.gap {
  display: inline-block;
  min-width: .6em;
}

.xray-body-notices {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xray-body-notice {
  margin: 0;
  padding: 6px 10px;
  /* The notice's tone: info (blue) unless a modifier sets another. Defined here so the border
     (which reads it with no fallback) is never invalid. */
  --xray-body-notice: var(--xray-blue);
  border: 1px solid color-mix(in srgb, var(--xray-body-notice) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-body-notice) 10%, transparent);
  color: var(--xray-text);
  font: 600 12px/1.4 var(--xray-font-ui);
}

.xray-body-notice.warning {
  --xray-body-notice: var(--xray-yellow);
}

/* Table view: the "Showing R of N rows \xB7 C of K columns" notice sits above the table. */
.xray-table-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.xray-link-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--xray-accent);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.xray-body-status {
  margin: 8px 0;
  color: var(--xray-subtext);
  font: 600 12px/1.5 var(--xray-font-ui);
}

.xray-binary-body h3 {
  margin: 0 0 6px;
}

.xray-binary-prefix {
  display: block;
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: var(--xray-text);
}

/* \u2500\u2500 Console: rendered errors (ErrorBlock) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-error-name {
  color: var(--xray-red);
  font-weight: 700;
}

.xray-error-frames {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font: 600 11px/1.5 var(--xray-font);
}

.xray-error-frames li {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 1px 0;
}

/* Keep the console chrome within the short viewport after the operator skin's
   later rules have set its comfortable defaults. */
@media (max-height: 400px) {
  .xray-panel .xray-console-head { min-height: 36px; }
  .xray-panel .xray-filterbar { padding-block: 5px; }
  .xray-panel .xray-filterbar .xray-input { height: 32px; }
  .xray-panel .xray-filter-chips .xray-chip { height: 28px; padding-inline: 8px; }
  .xray-panel .xray-prompt { gap: 4px; padding-block: 4px; }
  .xray-panel .xray-prompt textarea { min-height: 30px; max-height: 40px; padding-block: 6px; }
  .xray-panel .xray-prompt .xray-btn { height: 28px; }
  .xray-panel .xray-statusbar { min-height: 22px; height: 22px; font-size: 9px; }
}

.xray-error-fn {
  color: var(--xray-text);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-error-loc {
  min-width: 0;
  color: var(--xray-subtext, var(--xray-hint));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* \u2500\u2500 Record control (header runtime-diagnostics button) \u2500\u2500
   Recording is a red dot, not an accent ring. The ring is reserved for :focus-visible,
   which the shared focus rules draw. Specificity (not source order) keeps these ahead
   of the generic .xray-icon-btn hover/active rules. */
.xray-topbar .xray-icon-btn.xray-record-btn:not(:focus-visible) {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  outline: none;
}

.xray-topbar .xray-icon-btn.xray-record-btn:not(:focus-visible):hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-topbar .xray-record-btn.recording .xray-live-dot {
  background: var(--xray-red);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-red) 20%, transparent);
  animation: none;
}

/* \u2500\u2500 Shared notice / callout \u2500\u2500 */
.xray-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, var(--xray-notice-color) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-notice-color) 10%, transparent);
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.4;
  --xray-notice-color: var(--xray-blue);
}

.xray-notice.warning { --xray-notice-color: var(--xray-yellow); }
.xray-notice.error { --xray-notice-color: var(--xray-red); }

.xray-notice-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--xray-notice-color);
}

.xray-notice-text {
  flex: 1 1 auto;
  min-width: 0;
}

.xray-notice-action {
  flex: 0 0 auto;
}

/* \u2500\u2500 J12: a view that failed to render (ErrorBoundary) \u2500\u2500
   Same tinted callout as the error notice, in place of the view that failed. */
.xray-render-fallback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin: 8px;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.4;
}

.xray-render-fallback-icon {
  flex: 0 0 auto;
  color: var(--xray-red);
}

.xray-render-fallback-text {
  flex: 1 1 12em;
  min-width: 0;
}

.xray-render-fallback-actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* The root boundary's fallback (RootErrorBoundary): inside the panel's own frame, so it sits where
   the panel does on every surface. */
.xray-root-fallback {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin: 16px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 36%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-red) 10%, var(--xray-surface));
  color: var(--xray-text);
  font-size: 12px;
  line-height: 1.45;
}

.xray-root-fallback-icon {
  color: var(--xray-red);
}

.xray-root-fallback-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.xray-root-fallback-text {
  margin: 0;
  max-width: 60ch;
}

.xray-root-fallback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}


/* \u2500\u2500 S22\u2013S24: Logs tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Same visual language as the API tab: one toolbar row, 32px single-line rows,
   and the detail beside the list only once a log is open.
   > 900px   list | detail side by side (draggable column divider).
   600\u2013900   list on top, detail below; a row divider resizes the list (40\u201375%).
   < 600     the detail replaces the list at full height; "Logs" goes back. */
.xray-logs-workspace .xray-list-panel,
.xray-logs-workspace .xray-detail-panel {
  background: var(--xray-bg);
}

.xray-logs-workspace:not(.detail-open) .xray-pane-divider,
.xray-logs-workspace:not(.detail-open) .xray-logs-detail {
  display: none;
}

.xray-logs-workspace:not(.detail-open) .xray-list-panel {
  border-right: 0;
}

.xray-logs-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-logs-search {
  flex: 1 1 180px;
  min-width: 0;
  height: 32px;
}

.xray-logs-search .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-logs-levels {
  flex: 0 1 auto;
  min-width: 0;
  gap: 4px;
}

.xray-logs-levels .xray-chip {
  min-height: 30px;
  height: auto;
  padding: 4px 9px;
  font-size: 12px;
}

.xray-logs-levels .xray-chip-count {
  font-size: 12px;
}

.xray-logs-toolbar :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 2px;
}

.xray-panel .xray-logs-list .xray-entry-row {
  min-height: calc(32px * var(--xray-density-scale, 1));
  height: calc(32px * var(--xray-density-scale, 1));
  font-weight: 600;
}

.xray-logs-list .xray-entry-main,
.xray-logs-list .xray-path {
  min-width: 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-log-row-level,
.xray-log-row-time {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-log-row-level {
  color: var(--xray-subtext);
  font-weight: 700;
}

.xray-log-row-level.error { color: var(--xray-red); }
.xray-log-row-level.warn { color: var(--xray-yellow); }
.xray-log-row-level.info { color: var(--xray-blue); }

.xray-log-row-time {
  color: var(--xray-subtext);
  font-variant-numeric: tabular-nums;
}

.xray-logs-workspace .xray-logs-detail {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-logs-detail-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.xray-logs-detail-back {
  display: none;
}

.xray-log-close.solo {
  margin-left: auto;
}

@container xray (max-width: 900px) {
  .xray-logs-workspace.detail-open {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, var(--xray-logs-vlist, 50fr)) minmax(0, var(--xray-logs-vrest, 50fr));
  }

  .xray-logs-workspace .xray-pane-divider:not(.xray-pane-divider-rows) {
    display: none;
  }

  .xray-logs-workspace .xray-list-panel {
    border-right: 0;
  }

  .xray-logs-workspace .xray-logs-detail {
    border-top: 1px solid var(--xray-border);
  }
}

@container xray (600px <= width <= 900px) {
  .xray-logs-workspace.detail-open .xray-pane-divider.xray-pane-divider-rows {
    display: block;
  }
}

@container xray (width < 600px) {
  .xray-logs-workspace.detail-open {
    grid-template-rows: minmax(0, 1fr);
  }

  .xray-logs-workspace.detail-open .xray-list-panel {
    display: none;
  }

  .xray-logs-workspace .xray-logs-detail {
    border-top: 0;
  }

  .xray-logs-workspace.detail-open .xray-logs-detail-back {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid var(--xray-border);
    background: var(--xray-surface);
  }

  /* "Logs" is the way back here; the header close would duplicate it. */
  .xray-logs-workspace .xray-log-close {
    display: none;
  }

  .xray-logs-list .xray-entry-row {
    grid-template-columns: 44px 70px minmax(0, 1fr) 28px;
    gap: 6px;
    padding-left: 8px;
    padding-right: 8px;
  }
}


/* \u2500\u2500 Console tab layout refresh (S25-S29) \u2500\u2500 */

/* S26: search + level chips share one compact row (matches the Logs toolbar).
   The chips never wrap; when they do not fit they scroll with an edge fade. */
.xray-panel .xray-console-workspace .xray-filterbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding: 6px 10px;
}

.xray-console-workspace .xray-filterbar .xray-search {
  /* Wide enough to read "Filter console messages\u2026"; with the five S2 chips this
     puts the chips on their own row below ~800 px instead of squeezing the field. */
  flex: 1 1 240px;
  min-width: 0;
  min-height: 32px;
  height: 32px;
}

.xray-console-workspace .xray-filterbar .xray-input {
  height: 32px;
  font-size: 12px;
}

.xray-console-workspace .xray-console-levels {
  flex: 0 1 auto;
  max-width: 100%;
  min-width: 0;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-console-workspace .xray-console-levels::-webkit-scrollbar {
  display: none;
}

.xray-console-workspace .xray-console-levels .xray-chip {
  flex: 0 0 auto;
  min-height: 30px;
  height: 30px;
  padding: 0 9px;
  font-size: 12px;
}

.xray-console-workspace .xray-console-levels[data-overflow="end"] {
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
}

.xray-console-workspace .xray-console-levels[data-overflow="start"] {
  -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to left, #000 calc(100% - 28px), transparent);
}

.xray-console-workspace .xray-console-levels[data-overflow="both"] {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent);
}

/* S25 / P1: request context is one line above the prompt:
   res = GET /path \xB7 200 \xB7 14 kb  [a \xD7] [b \xD7]  Change \u25BE  [inspect].
   The picker menu is a sibling of the line (the line clips its overflow). */
.xray-context-wrap {
  position: relative;
  min-width: 0;
}

.xray-prompt .xray-context-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
  min-height: 32px;
  padding: 2px 4px 2px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface2-rgb), .5);
  overflow: hidden;
}

.xray-context-line:focus-within {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-focus) 48%, transparent);
}

.xray-context-summary {
  /* A small basis keeps the picker on the first row; pins wrap below when crowded. */
  flex: 1 1 160px;
  min-width: 0;
  display: flex;
  align-items: baseline;
  overflow: hidden;
  white-space: nowrap;
  color: var(--xray-text);
  font: 700 12px/26px var(--xray-font);
}

.xray-context-prefix {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font: 700 12px/1 var(--xray-font);
  white-space: pre;
}

.xray-context-request {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-context-meta {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: pre;
}

.xray-context-age {
  /* Collapses first when the line is tight (large shrink weight), then the path. */
  flex: 0 100 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--xray-hint);
  font-weight: 600;
  white-space: pre;
}

.xray-context-summary.xray-context-none {
  display: block;
  text-overflow: ellipsis;
  color: var(--xray-subtext);
  font-family: var(--xray-font-ui);
  font-weight: 600;
}

.xray-pin-chips {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.xray-pin-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 150px;
  height: 22px;
  padding: 0 2px 0 7px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font: 600 11px/1 var(--xray-font);
}

.xray-pin-chip-name {
  flex: 0 0 auto;
  color: var(--xray-text);
  font-weight: 700;
}

.xray-pin-chip-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--xray-subtext);
}

.xray-pin-chip-remove {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  cursor: pointer;
}

.xray-pin-chip-remove:hover {
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-text) 10%, transparent);
}

.xray-pin-chip-remove:focus-visible,
.xray-context-change:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

/* Change \u25BE and Inspect wrap together, never leaving an orphan icon on its own row. */
.xray-context-actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-inline-start: auto;
}

.xray-context-change {
  flex: 0 0 auto;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-accent, var(--xray-blue));
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
}

.xray-context-change:hover,
.xray-context-change[aria-expanded="true"] {
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-context-change[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.xray-context-menu {
  position: absolute;
  inset-inline-end: 0;
  bottom: calc(100% + 6px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 440px;
  max-width: calc(100cqw - 20px);
  max-height: min(360px, 60vh);
  padding: 6px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-prompt .xray-context-menu .xray-context-filter {
  flex: 0 0 auto;
  min-height: 0;
  height: 30px;
  max-height: none;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
}

.xray-context-options {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
}

.xray-context-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font);
  text-align: start;
  cursor: pointer;
}

.xray-context-option:hover,
.xray-context-option:focus-visible {
  background: color-mix(in srgb, var(--xray-text) 8%, transparent);
  outline: none;
}

.xray-context-option:focus-visible {
  box-shadow: inset 0 0 0 2px var(--xray-text);
}

.xray-context-option[aria-current="true"] {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-context-option-method {
  flex: 0 0 42px;
  color: var(--xray-subtext);
  font-weight: 700;
  font-size: 11px;
}

.xray-context-option-path {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-context-option-meta {
  flex: 0 0 auto;
  color: var(--xray-subtext);
  font-variant-numeric: tabular-nums;
}

.xray-context-option-pin {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: rgba(var(--xray-text-rgb), .06);
  color: var(--xray-text);
  font-weight: 700;
}

.xray-context-empty {
  margin: 6px 8px;
  font-size: 12px;
}

.xray-context-menu .xray-context-pin:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.xray-context-inspect {
  flex: 0 0 auto;
  width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  font: 700 11px/1 var(--xray-font-ui);
  cursor: pointer;
}

.xray-context-inspect:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-context-inspect:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

@container xray (max-width: 760px) {
  .xray-pin-chip-path {
    display: none;
  }
}

/* Narrow: Change \u25BE becomes its chevron (it keeps its accessible name), leaving the
   request path room. "Pick request" stays spelled out. */
@container xray (max-width: 460px) {
  .xray-context-change:not(.pick) > .xray-context-change-text {
    display: none;
  }

  .xray-context-change:not(.pick) {
    width: 28px;
    justify-content: center;
    padding: 0;
  }
}

/* S27: Snippets menu beside Run. */
.xray-snippet-menu-wrap {
  position: relative;
  flex: 0 0 auto;
}

.xray-snippet-menu {
  position: absolute;
  inset-inline-end: 0;
  bottom: calc(100% + 6px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 280px;
  max-width: calc(100cqw - 20px);
  max-height: min(320px, 60vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px rgba(var(--xray-bg-rgb), .28);
}

.xray-snippet-menu .xray-snippet-save:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.xray-snippet-naming {
  display: flex;
  align-items: center;
  gap: 6px;
}

.xray-snippet-menu .xray-snippet-rename {
  flex: 1 1 auto;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.xray-snippet-empty {
  margin: 4px 8px;
  font-size: 12px;
}

.xray-snippet-item {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
}

.xray-snippet-item:hover {
  background: rgba(var(--xray-text-rgb), .07);
}

.xray-snippet-menu .xray-snippet-load {
  flex: 1 1 auto;
  min-width: 0;
  max-width: none;
  min-height: 28px;
  padding: 0 8px;
  text-align: start;
  color: var(--xray-text);
  font-size: 12px;
}

.xray-snippet-action {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
}

.xray-snippet-action:hover {
  color: var(--xray-text);
}

.xray-snippet-action.xray-snippet-remove:hover {
  color: var(--xray-red);
}

.xray-snippet-menu :is(button, input):focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: 1px;
}

.xray-snippet-undo {
  align-self: flex-start;
  margin: 2px 4px;
}

/* S28: example commands in the empty stream. */
.xray-console-examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.xray-console-example {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.xray-console-example code {
  font: 700 12px/1 var(--xray-font);
}

/* S29: the status bar is always a single line; low-priority items drop first. */
.xray-panel .xray-statusbar {
  flex-wrap: nowrap;
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;
}

.xray-statusbar > .xray-status-item {
  flex: 0 0 auto;
}

.xray-statusbar > .xray-status-total {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@container xray (max-width: 620px) {
  .xray-statusbar .xray-status-avg {
    display: none;
  }
}

@container xray (max-width: 420px) {
  .xray-statusbar .xray-status-slow {
    display: none;
  }
}

/* S33: Insights overview is one strip of label/value pairs (same register as the
   API tab's summary line); Findings follow, breakdown cards after. */
.xray-insight-strip {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 16px;
  margin-bottom: 12px;
  padding: 6px 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .88);
  font: 600 12px/18px var(--xray-font-ui);
}

.xray-insight-stat {
  min-width: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.xray-insight-stat-label {
  color: var(--xray-subtext);
}

.xray-insight-stat strong {
  color: var(--xray-text);
  font-weight: 700;
}

.xray-insight-stat.warn strong { color: var(--xray-yellow); }
.xray-insight-stat.error strong { color: var(--xray-red); }

/* S34: compact finding rows grouped under their request. */
.xray-findings {
  margin-bottom: 12px;
  padding: 10px 12px;
}

.xray-findings-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin-bottom: 6px;
}

.xray-findings-toolbar h4 {
  margin: 0 4px 0 0;
}

.xray-findings-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xray-findings .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.xray-finding-group {
  margin-top: 8px;
  border-top: 1px solid var(--xray-border);
}

.xray-finding-request {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0 2px;
  font: 700 12px/1.35 var(--xray-font);
}

.xray-finding-path {
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-finding-request-meta {
  flex: 0 0 auto;
  white-space: nowrap;
}

.xray-finding-row {
  min-width: 0;
  padding: 1px 0 1px 12px;
}

.xray-finding-line {
  min-width: 0;
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-finding-line input[type='checkbox'] {
  flex: 0 0 auto;
  margin: 0;
}

.xray-finding-severity {
  flex: 0 0 auto;
  display: inline-flex;
  color: var(--xray-blue);
}

.xray-finding-severity.warning { color: var(--xray-yellow); }
.xray-finding-severity.error { color: var(--xray-red); }

.xray-finding-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}

.xray-finding-row.dismissed .xray-finding-title {
  color: var(--xray-subtext);
}

.xray-finding-tags {
  flex: 0 0 auto;
  font-size: 11px;
  white-space: nowrap;
}

.xray-finding-action {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
}

.xray-finding-chevron {
  transition: transform .15s ease;
}

.xray-finding-chevron.open {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .xray-finding-chevron { transition: none; }
}

.xray-finding-details {
  padding: 2px 0 6px 52px;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-finding-details[hidden] {
  display: none;
}

.xray-finding-details p {
  margin: 0 0 4px;
}

.xray-finding-evidence {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
  overflow-wrap: anywhere;
}

@container xray (max-width: 420px) {
  .xray-finding-request-meta { display: none; }
  .xray-finding-details { padding-left: 12px; }
}

/* \u2500\u2500 Console prompt editor (spec P3\u2013P7, P9) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   The textarea is the real input (transparent text, native caret/selection/IME);
   the aria-hidden overlay behind it paints the token colours. Both share one box
   model so every glyph lines up. Grows to 8 lines (8 \xD7 18px + 2 \xD7 8px), then
   scrolls. */
.xray-editor {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.xray-panel .xray-prompt .xray-editor .xray-prompt-command-row {
  align-items: flex-start;
}

.xray-panel .xray-prompt .xray-editor .xray-prompt-command-row > svg {
  margin-top: 10px;
}

.xray-editor-field {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  border: 1px solid var(--xray-border-control);
  border-radius: var(--xray-radius-lg, var(--xray-radius));
  background: var(--xray-surface2);
}

.xray-editor-field:focus-within {
  border-color: var(--xray-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-focus) 38%, transparent);
}

.xray-panel .xray-prompt .xray-editor-input,
.xray-panel .xray-prompt .xray-editor-highlight {
  box-sizing: border-box;
  margin: 0;
  border: 0;
  padding: 8px 10px;
  font: 500 12px/18px var(--xray-font);
  font-variant-ligatures: none;
  letter-spacing: normal;
  tab-size: 2;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
  scrollbar-gutter: stable;
}

.xray-panel .xray-prompt .xray-editor-input {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 160px;
  border-radius: inherit;
  background: transparent;
  color: transparent;
  caret-color: var(--xray-text);
  box-shadow: none;
  outline: none;
  resize: none;
  overflow-x: hidden;
  overflow-y: auto;
}

.xray-panel .xray-prompt .xray-editor-input:focus {
  border: 0;
  box-shadow: none;
}

.xray-panel .xray-prompt .xray-editor-input::placeholder {
  color: var(--xray-hint);
  opacity: 1;
}

.xray-panel .xray-prompt .xray-editor-input::selection {
  background: color-mix(in srgb, var(--xray-text) 24%, transparent);
  color: transparent;
}

.xray-panel .xray-prompt .xray-editor-highlight {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  color: var(--xray-text);
  background: transparent;
}

.xray-tok-keyword { color: var(--xray-mauve); }
.xray-tok-string { color: var(--xray-green); }
.xray-tok-number { color: var(--xray-peach); }
.xray-tok-comment { color: var(--xray-hint); font-style: italic; }
.xray-tok-punct { color: var(--xray-subtext); }
.xray-tok-plain { color: var(--xray-text); }

/* P5: suggestions open above the field (the prompt sits at the bottom). */
.xray-editor-suggestions {
  position: absolute;
  left: 0;
  bottom: calc(100% + 4px);
  z-index: 30;
  width: min(420px, 100%);
  max-height: 232px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 10px 28px var(--xray-shadow);
}

/* Expanded (P10): the field is the tall pane, and at full height it starts at the top
   of the Console, so "above the field" is off-screen. The list opens inside the field,
   next to the caret's line (ConsoleEditor sets top/max-height: below the line, or above
   it when there is more room there), and never outgrows the field. */
.xray-editor.is-expanded .xray-editor-suggestions {
  top: 4px;
  bottom: auto;
  left: 4px;
  width: min(420px, calc(100% - 8px));
  max-height: min(232px, calc(100% - 8px));
}

.xray-editor-group {
  list-style: none;
}

.xray-editor-group-options {
  margin: 0;
  padding: 0;
  list-style: none;
}

.xray-editor-group-label {
  padding: 6px 8px 2px;
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  pointer-events: none;
}

.xray-editor-option {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  padding: 5px 8px;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  font: 500 12px/16px var(--xray-font);
  cursor: pointer;
}

.xray-editor-option:hover {
  background: color-mix(in srgb, var(--xray-text) 7%, transparent);
}

.xray-editor-option.active {
  background: var(--xray-surface2);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-editor-option-label {
  flex: 0 0 auto;
  font-weight: 700;
}

.xray-editor-option-detail {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--xray-subtext);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* P6/P7: one muted line under the editor \u2014 a helper signature or a live preview. */
.xray-editor-hint {
  min-width: 0;
  padding-left: 24px;
  overflow: hidden;
  color: var(--xray-subtext);
  font: 500 11px/16px var(--xray-font);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-editor-hint.signature .xray-editor-hint-main { color: var(--xray-text); font-weight: 700; }
.xray-editor-hint.signature .xray-editor-hint-main .xray-editor-hint-param {
  color: var(--xray-text);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.xray-editor-hint-note { color: var(--xray-hint); }

/* Manual open (Ctrl+Space) with nothing to offer: a visible, non-interactive row. */
.xray-editor-suggestions-empty {
  padding: 8px 12px;
  overflow: visible;
  color: var(--xray-hint);
  font: 500 12px/16px var(--xray-font-ui);
  pointer-events: none;
}

/* P9: chips insert at the caret. They wrap rather than scroll out of reach. */
.xray-editor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  padding-left: 24px;
}

.xray-editor-chip {
  height: 22px;
  padding: 0 7px;
  border: 1px solid color-mix(in srgb, var(--xray-border) 90%, transparent);
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-subtext);
  font: 600 11px/1 var(--xray-font);
  cursor: pointer;
  transition: color var(--xray-dur-fast) var(--xray-ease), border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-editor-chip:hover {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .07);
  color: var(--xray-text);
}

@media (prefers-reduced-motion: reduce) {
  .xray-editor-chip { transition: none; }
}

@container xray (max-width: 420px) {
  .xray-editor-hint,
  .xray-editor-chips { padding-left: 0; }
}

/* Short viewports keep the stream usable: the editor stops growing at 3 lines. */
@media (max-height: 400px) {
  .xray-panel .xray-prompt .xray-editor-input { max-height: 70px; padding-block: 8px; }
  .xray-editor-chip { height: 20px; }
}

/* \u2500\u2500 Smart starters (spec P8) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Chips generated from the selected response. In the empty stream they replace the
   fixed examples; above the editor they show while the draft is empty. */
.xray-starter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.xray-console-examples.xray-starter-chips { justify-content: center; }

.xray-starter-row { padding-left: 24px; gap: 4px; }

.xray-panel .xray-starter-chip {
  height: 28px;
  padding: 0 10px;
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font);
  cursor: pointer;
}

.xray-panel .xray-starter-row .xray-starter-chip {
  height: 24px;
  padding: 0 8px;
  border-style: dashed;
  color: var(--xray-subtext);
  font-size: 11px;
}

.xray-panel .xray-starter-chip:hover {
  border-color: var(--xray-border-control);
  background: rgba(var(--xray-text-rgb), .07);
  color: var(--xray-text);
}

@container xray (max-width: 420px) {
  .xray-starter-row { padding-left: 0; }
}

/* \u2500\u2500 Expanded editor (spec P10) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   The prompt grows to ~70% of the Console column (the field itself \u2248 60%); on a
   narrow Console (< 600 px wide) or a short viewport it takes the whole column and
   the stream steps aside. Lines never wrap, so the gutter's numbers stay on their
   lines; the overlay and gutter follow the textarea's scroll. ConsolePrompt reads
   --xray-editor-full back to know when the stream is covered. */
.xray-editor-code {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  border-radius: inherit;
}

.xray-editor-actions { display: contents; }

.xray-panel .xray-prompt.is-expanded {
  flex: 0 0 70%;
  min-height: 0;
}

.xray-prompt.is-expanded .xray-editor {
  flex: 1 1 0;
  min-height: 0;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-prompt-command-row {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 6px 8px;
  align-items: center;
}

.xray-editor.is-expanded .xray-prompt-command-row > svg { display: none; }

.xray-editor.is-expanded .xray-editor-tools {
  grid-row: 1;
  grid-column: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.xray-editor-tools-hint {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-hint);
  font: 500 11px/16px var(--xray-font-ui);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-editor.is-expanded .xray-editor-actions {
  grid-row: 1;
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xray-editor.is-expanded .xray-editor-field {
  grid-row: 2;
  grid-column: 1 / -1;
  align-self: stretch;
  min-height: 0;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-editor-input {
  align-self: stretch;
  height: auto;
  max-height: none;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}

.xray-panel .xray-prompt .xray-editor.is-expanded .xray-editor-highlight {
  white-space: pre;
  overflow-wrap: normal;
  /* A longer scroll range than the textarea's (its scrollbars take room the
     overlay does not have), so the overlay can always follow it. */
  padding-right: 40px;
  padding-bottom: 40px;
}

.xray-editor-gutter {
  flex: 0 0 auto;
  min-width: 3.5ch;
  padding: 8px 8px 48px 10px;
  overflow: hidden;
  border-right: 1px solid color-mix(in srgb, var(--xray-border) 80%, transparent);
  color: var(--xray-hint);
  font: 500 12px/18px var(--xray-font);
  font-variant-numeric: tabular-nums;
  text-align: right;
  pointer-events: none;
  user-select: none;
}

.xray-editor-gutter > span { display: block; }

.xray-editor-expand {
  width: 34px;
  justify-content: center;
  padding: 0;
}

.xray-editor-expand[aria-pressed="true"] {
  border-color: var(--xray-border-control);
  color: var(--xray-text);
}

@container xray-console (max-width: 599px) {
  .xray-panel .xray-prompt.is-expanded {
    --xray-editor-full: 1;
    flex: 1 1 0;
  }

  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-filterbar,
  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-console-stream-wrap {
    display: none;
  }

  .xray-editor-tools-hint { display: none; }
}

@media (max-height: 600px) {
  .xray-panel .xray-prompt.is-expanded {
    --xray-editor-full: 1;
    flex: 1 1 0;
  }

  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-filterbar,
  .xray-console-column:has(> .xray-prompt.is-expanded) > .xray-console-stream-wrap {
    display: none;
  }
}

/* An empty editor stays one line: the placeholder is clipped with an ellipsis
   instead of wrapping the field to two or three lines in a narrow prompt (the
   full text is in the field's title). Wrapping resumes with the first character. */
.xray-panel .xray-prompt .xray-editor-input:placeholder-shown {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-panel .xray-prompt .xray-editor-input::placeholder {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.xray-editor-tools .xray-btn { flex: 0 0 auto; white-space: nowrap; }

/* Below ~720 px the tool labels give way to icons (names stay in aria-label/title). */
@container xray (max-width: 720px) {
  .xray-editor-tools .xray-btn > span { display: none; }
  .xray-editor-tools .xray-btn { width: 34px; justify-content: center; padding: 0; }
}

/* The shortcut hint only shows where it fits whole (the tooltips carry it too). */
@container xray (max-width: 900px) {
  .xray-editor-tools-hint { display: none; }
}

/* Spec S2, two type roles \u2014 data opt-ins. The panel's chrome reads in --xray-font-ui; these are
   data and keep the mono Font stack (--xray-font): the request heading's method, path, status,
   timing and size; header names and values; URL entry fields (.xray-input-data); timings and sizes
   wherever they appear (.xray-num, .xray-status-num); chart and frame values; diffs, initiators and
   tokens; console lines, log messages, their times and run times.
   Labels inside data (flags, JSON tags, console badges) stay chrome. Prefixed with the root so
   they win over single-class rules that set a whole \`font\`. */
.xray-app-root .xray-response-heading .xray-method,
.xray-app-root .xray-response-heading h3,
.xray-app-root .xray-response-chip,
.xray-app-root .xray-input-data,
.xray-app-root .xray-num,
.xray-app-root .xray-log-message,
.xray-app-root .xray-header-name,
.xray-app-root .xray-header-value,
.xray-app-root .xray-waterfall-legend strong,
.xray-app-root .xray-viz-value,
.xray-app-root .xray-frame-row,
.xray-app-root .xray-diff-path,
.xray-app-root .xray-diff-lines,
.xray-app-root .xray-initiator-list,
.xray-app-root .xray-token-body,
.xray-app-root .xray-console-row,
.xray-app-root .xray-console-time,
.xray-app-root .xray-cell-time,
.xray-app-root .xray-status-num {
  font-family: var(--xray-font);
}

.xray-app-root .xray-api-flag,
.xray-app-root .xray-json-tag,
.xray-app-root .xray-repeat-badge,
.xray-app-root .xray-truncated-badge,
.xray-app-root .xray-editor-hint-note {
  font-family: var(--xray-font-ui);
}

/* SQL tab: the extension's sql.html framed in the DevTools panel and pop-out window. */
.xray-sql-frame {
  display: block;
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 0;
  background: var(--xray-bg);
}

/* Kept mounted across tab switches (hidden, not removed): the class's display would beat [hidden]. */
.xray-sql-frame[hidden] {
  display: none;
}
`});var mO,hO=F(()=>{mO=`/* SQL page (sql.html). The theme scope is display:contents, so the app sizes itself to the
   viewport. Colours come only from --xray-* tokens. */

.xray-sql-app {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--xray-bg);
  color: var(--xray-text);
  font: 13px/1.4 var(--xray-font-ui);
}

.xray-sql-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-brand {
  flex: none;
  font-weight: 800;
  letter-spacing: .04em;
  color: var(--xray-accent);
  margin-right: 6px;
}

.xray-sql-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-check input {
  accent-color: var(--xray-accent);
  width: 14px;
  height: 14px;
  margin: 0;
}

/* Source control: the open file, its menu and the Read-only / Editable badge */
.xray-sql-source-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.xray-sql-source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: min(460px, 50vw);
  height: 32px;
  padding: 0 8px 0 10px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-bg);
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font-ui);
  cursor: pointer;
  transition: border-color var(--xray-dur-fast) ease, background var(--xray-dur-fast) ease;
}

.xray-sql-source:hover,
.xray-sql-source[aria-expanded="true"] {
  border-color: var(--xray-border-control);
  background: var(--xray-hover);
}

.xray-sql-source svg {
  flex: none;
  color: var(--xray-hint);
}

/* A writable database is obvious at a glance: the source control takes the warning tone. */
.xray-sql-source.editable {
  border-color: color-mix(in srgb, var(--xray-yellow) 55%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 8%, var(--xray-bg));
}

.xray-sql-source.editable > svg:first-child {
  color: var(--xray-yellow);
}

.xray-sql-source-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--xray-font);
}

.xray-sql-source-meta {
  flex: none;
  color: var(--xray-hint);
  font-weight: 500;
  white-space: nowrap;
}

.xray-sql-source-chevron {
  transition: transform var(--xray-dur-fast) ease;
}

.xray-sql-source[aria-expanded="true"] .xray-sql-source-chevron {
  transform: rotate(180deg);
}

.xray-sql-source-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: 260px;
  padding: 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  box-shadow: 0 12px 28px var(--xray-shadow);
}

.xray-sql-source-menu .xray-menu-item {
  min-height: 32px;
}

.xray-sql-source-menu .xray-sql-check {
  gap: 8px;
  color: var(--xray-text);
  font-weight: 600;
}

.xray-sql-source-note {
  margin: 2px 8px 6px;
  color: var(--xray-hint);
  font-size: 11px;
  line-height: 1.45;
}

.xray-sql-mode-badge {
  flex: none;
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border: 1px solid var(--xray-border);
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-text-rgb), .04);
  font: 700 10px/1 var(--xray-font-ui);
  letter-spacing: .03em;
  white-space: nowrap;
}

button.xray-sql-mode-badge {
  gap: 4px;
  height: 22px;
  padding: 0 9px;
  cursor: pointer;
  transition: border-color var(--xray-dur-fast) ease, background var(--xray-dur-fast) ease;
}

button.xray-sql-mode-badge:hover:not(:disabled) {
  border-color: var(--xray-border-control);
  color: var(--xray-text);
}

button.xray-sql-mode-badge:disabled {
  opacity: .6;
  cursor: default;
}

button.xray-sql-mode-badge.editable:hover:not(:disabled) {
  border-color: var(--xray-yellow);
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 16%, transparent);
}

.xray-sql-mode-badge.editable {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 45%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

/* Run / Stop / Save */
.xray-sql-run,
.xray-sql-save {
  flex: none;
}

.xray-sql-kbd {
  margin-left: 2px;
  padding: 2px 5px;
  border: 1px solid currentColor;
  border-radius: var(--xray-radius-sm);
  font: 600 10px/1 var(--xray-font-ui);
  opacity: .7;
}

.xray-sql-save {
  position: relative;
}

.xray-sql-save-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--xray-yellow);
}

.xray-sql-toolbar .xray-btn:disabled {
  opacity: .5;
  cursor: default;
}

.xray-sql-muted {
  color: var(--xray-hint);
  font-size: 12px;
  font-weight: 500;
}

.xray-sql-body {
  display: grid;
  grid-template-columns: 220px auto minmax(0, 1fr);
  min-height: 0;
}

/* Dividers: a 1 px rule with a wider hit area; the accent on hover and while dragging, the focus
   colour on keyboard focus. */
.xray-sql-divider {
  position: relative;
  z-index: 3;
  flex: none;
  background: var(--xray-border);
  touch-action: none;
}

.xray-sql-divider.vertical {
  width: 1px;
  cursor: col-resize;
}

.xray-sql-divider.horizontal {
  height: 1px;
  cursor: row-resize;
}

.xray-sql-divider::before {
  content: "";
  position: absolute;
  inset: 0;
}

.xray-sql-divider.vertical::before {
  left: -4px;
  right: -4px;
}

.xray-sql-divider.horizontal::before {
  top: -4px;
  bottom: -4px;
}

.xray-sql-divider:hover,
.xray-sql-divider.dragging {
  background: var(--xray-accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-accent) 45%, transparent);
}

.xray-app-root .xray-sql-divider:focus-visible {
  outline: none;
  background: var(--xray-focus);
  box-shadow: 0 0 0 1px var(--xray-focus);
}

/* Status bar */
.xray-sql-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 24px;
  padding: 0 12px;
  border-top: 1px solid var(--xray-border);
  background: var(--xray-surface);
  color: var(--xray-hint);
  font: 500 11px/1 var(--xray-font-ui);
  white-space: nowrap;
}

.xray-sql-status-file {
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--xray-subtext);
  font-family: var(--xray-font);
}

.xray-sql-connection-meta {
  color: var(--xray-yellow);
  font-weight: 600;
}

/* Drop overlay */
.xray-sql-app {
  position: relative;
}

.xray-sql-drop {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--xray-overlay);
  pointer-events: none;
}

.xray-sql-drop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(420px, 100%);
  padding: 32px 24px;
  border: 2px dashed var(--xray-accent);
  border-radius: var(--xray-radius-lg);
  background: var(--xray-surface);
  color: var(--xray-text);
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.xray-sql-drop-card svg {
  color: var(--xray-accent);
}

.xray-sql-drop-note {
  color: var(--xray-hint);
  font-size: 12px;
  font-weight: 500;
}

/* First screen */
.xray-sql-welcome {
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 0;
  padding: 24px;
  text-align: center;
}

.xray-sql-welcome-icon {
  color: var(--xray-accent);
  margin-bottom: 4px;
}

.xray-sql-welcome h1 {
  margin: 0 0 6px;
  color: var(--xray-text);
  font: 700 20px/1.25 var(--xray-font-ui);
  letter-spacing: -.01em;
}

.xray-sql-welcome-open {
  height: 38px;
  padding: 0 18px;
  font-size: 13px;
}

.xray-sql-welcome-drop {
  margin: 4px 0 0;
  color: var(--xray-subtext);
  font-size: 13px;
}

.xray-sql-welcome-note {
  margin: 0;
  color: var(--xray-hint);
  font-size: 12px;
}

.xray-sql-recent {
  width: min(420px, 100%);
  margin-top: 14px;
  text-align: left;
}

.xray-sql-recent h2 {
  margin: 0 0 6px;
  padding: 0 4px;
  color: var(--xray-hint);
  font: 700 11px/1 var(--xray-font-ui);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.xray-sql-recent ul {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius);
  background: var(--xray-surface);
  overflow: hidden;
}

.xray-sql-recent li + li {
  border-top: 1px solid var(--xray-border);
}

.xray-sql-recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--xray-text);
  font: 600 12px/1 var(--xray-font-ui);
  text-align: left;
  cursor: pointer;
}

.xray-sql-recent-item:hover:not(:disabled) {
  background: var(--xray-hover);
}

.xray-sql-recent-item svg {
  flex: none;
  color: var(--xray-hint);
}

.xray-sql-recent-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--xray-font);
}

.xray-sql-recent-meta {
  flex: none;
  margin-left: auto;
  color: var(--xray-hint);
  font-weight: 500;
}

.xray-sql-recent-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 8px 34px;
  color: var(--xray-red);
  font-size: 12px;
}

.xray-sql-recent-error .xray-btn {
  height: 24px;
  padding: 0 8px;
  margin-left: auto;
}

.xray-sql-welcome-error {
  max-width: 520px;
  margin: 8px 0 0;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--xray-red) 40%, transparent);
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-red) 8%, transparent);
  color: var(--xray-red);
  font: 12px/1.5 var(--xray-font);
}

/* Schema rail */
.xray-sql-rail {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 8px 6px;
  background: var(--xray-surface);
}

.xray-sql-rail-filter {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 2px 6px;
}

.xray-sql-rail-filter svg {
  position: absolute;
  left: 8px;
  color: var(--xray-hint);
  pointer-events: none;
}

.xray-sql-rail-filter .xray-input {
  height: 28px;
  padding: 0 26px 0 26px;
  border-color: var(--xray-border);
  border-radius: var(--xray-radius-sm);
  font: 500 12px/1 var(--xray-font-ui);
}

.xray-sql-rail-filter-key {
  position: absolute;
  right: 6px;
  padding: 1px 5px;
  border: 1px solid var(--xray-border);
  border-radius: 4px;
  color: var(--xray-hint);
  font: 600 10px/1.2 var(--xray-font-ui);
  pointer-events: none;
}

.xray-sql-rail-filter:focus-within .xray-sql-rail-filter-key {
  display: none;
}

.xray-sql-rail-schema,
.xray-sql-rail-heading {
  padding: 8px 8px 4px;
  color: var(--xray-hint);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.xray-sql-rail-count {
  margin-left: 4px;
  font-weight: 500;
}

.xray-sql-rail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--xray-radius-sm);
  color: var(--xray-subtext);
  font-family: var(--xray-font);
  font-size: 12px;
  cursor: pointer;
}

.xray-sql-rail-item:hover,
.xray-sql-rail-item:focus-visible {
  background: var(--xray-hover);
  color: var(--xray-text);
}

.xray-sql-rail-item[aria-disabled="true"] {
  cursor: progress;
}

.xray-sql-rail-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-sql-rail-row {
  display: flex;
  align-items: center;
}

.xray-sql-rail-row .xray-sql-rail-item {
  flex: 1;
  min-width: 0;
  padding-left: 2px;
}

.xray-sql-rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 18px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--xray-radius-sm);
  background: transparent;
  color: var(--xray-hint);
  cursor: pointer;
}

.xray-sql-rail-toggle:hover,
.xray-sql-rail-toggle:focus-visible {
  background: var(--xray-hover);
  color: var(--xray-text);
}

.xray-sql-rail-toggle svg {
  transition: transform .12s ease;
}

.xray-sql-rail-toggle[aria-expanded="true"] svg {
  transform: rotate(90deg);
}

.xray-sql-rail-columns {
  margin: 0 0 4px;
  padding: 0 0 0 26px;
  list-style: none;
}

.xray-sql-rail-column {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 8px 0 4px;
  color: var(--xray-subtext);
  font-family: var(--xray-font);
  font-size: 11px;
}

.xray-sql-rail-type {
  overflow: hidden;
  color: var(--xray-hint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-sql-rail-marker {
  flex: none;
  padding: 0 4px;
  border: 1px solid var(--xray-border);
  border-radius: var(--xray-radius-sm);
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
}

.xray-sql-rail-marker.pk {
  color: var(--xray-peach);
}

.xray-sql-empty {
  margin: 0;
  padding: 12px;
  color: var(--xray-hint);
  font-size: 12px;
}

/* Editor column */
.xray-sql-main {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
}

.xray-sql-split {
  display: grid;
  min-height: 0;
}

.xray-sql-editor-wrap {
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.xray-sql-editor-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  padding: 4px 8px 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-editor-tab {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  max-width: 220px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--xray-radius-sm) var(--xray-radius-sm) 0 0;
  color: var(--xray-subtext);
}

.xray-sql-editor-tab.active {
  border-color: var(--xray-border);
  background: var(--xray-bg);
  color: var(--xray-text);
}

.xray-sql-editor-tab-name,
.xray-sql-editor-tab-close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.xray-sql-editor-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 6px 4px 6px 10px;
  font: 600 12px/1 var(--xray-font-ui);
}

.xray-sql-editor-tab-close {
  display: inline-flex;
  padding: 4px 6px;
  opacity: .7;
}

.xray-sql-editor-tab-close:hover {
  opacity: 1;
}

.xray-sql-add-tab {
  width: 26px;
  height: 26px;
  margin-left: 4px;
}

.xray-sql-quickstarts {
  position: absolute;
  top: 36px;
  left: 44px;
  right: 12px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.xray-sql-quickstarts-label {
  color: var(--xray-hint);
  font-size: 11px;
  font-weight: 600;
  margin-right: 2px;
}

.xray-sql-quickstarts .xray-btn {
  height: 26px;
  padding: 0 10px;
  border-style: dashed;
  color: var(--xray-subtext);
}

.xray-sql-quickstarts .xray-btn:hover {
  border-style: solid;
  color: var(--xray-text);
}

.xray-sql-editor {
  min-height: 0;
  overflow: hidden;
  background: var(--xray-bg);
}

/* Bottom pane */
.xray-sql-bottom {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
}

.xray-sql-bottom-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 0 8px;
  background: var(--xray-surface);
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-bottom-tabs .xray-tab {
  height: 28px;
}

.xray-sql-running {
  color: var(--xray-pending);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-bottom-panel {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.xray-sql-results {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.xray-sql-results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-max-rows-field {
  font-size: 11px;
  font-weight: 600;
  color: var(--xray-hint);
}

.xray-sql-results-head .xray-input {
  height: 26px;
  padding: 0 8px;
  border-color: var(--xray-border);
  border-radius: var(--xray-radius-sm);
  font: 500 12px/1 var(--xray-font-ui);
}

.xray-sql-results-head .xray-sql-max-rows {
  width: 76px;
}

.xray-sql-results-summary {
  white-space: nowrap;
  color: var(--xray-subtext);
  font-size: 12px;
  font-weight: 600;
}

.xray-sql-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.xray-sql-filter svg {
  position: absolute;
  left: 8px;
  color: var(--xray-hint);
  pointer-events: none;
}

.xray-sql-results-head .xray-sql-filter .xray-input {
  width: 180px;
  padding-left: 26px;
}

.xray-sql-hint {
  color: var(--xray-hint);
  font-size: 11px;
  white-space: nowrap;
}

.xray-sql-toast {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--xray-green);
  font-size: 12px;
}

.xray-sql-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.xray-sql-copy .xray-btn {
  height: 26px;
  padding: 0 8px;
}

.xray-sql-results-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  flex: 1;
  min-height: 0;
}

/* Grid */
.xray-sql-grid {
  position: relative;
  min-height: 0;
  overflow: auto;
  font-family: var(--xray-font);
  font-size: 12px;
}

.xray-sql-grid-head {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--xray-surface2);
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-grid-th,
.xray-sql-grid-cell {
  position: absolute;
  top: 0;
  overflow: hidden;
  padding: 0 8px;
  white-space: pre;
  text-overflow: ellipsis;
  border-right: 1px solid var(--xray-border);
}

.xray-sql-grid-th {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  color: var(--xray-text);
  cursor: pointer;
  user-select: none;
}

.xray-sql-grid-th:hover {
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-app-root .xray-sql-grid-th:focus-visible,
.xray-app-root .xray-sql-grid-cell:focus-visible {
  outline: 2px solid var(--xray-focus);
  outline-offset: -2px;
}

.xray-sql-th-name {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-weight: 700;
  line-height: 14px;
}

.xray-sql-th-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.xray-sql-th-key {
  flex: none;
  color: var(--xray-peach);
}

.xray-sql-th-sort {
  flex: none;
  color: var(--xray-accent);
}

.xray-sql-th-type {
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: .02em;
}

.xray-sql-grid-th.sorted .xray-sql-th-label {
  color: var(--xray-accent);
}

.xray-sql-col-resize {
  position: absolute;
  top: 0;
  right: -4px;
  z-index: 1;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
}

.xray-sql-col-resize::after {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 3px;
  width: 2px;
  border-radius: 1px;
  background: transparent;
  transition: background var(--xray-dur-fast) ease;
}

.xray-sql-col-resize:hover::after,
.xray-sql-col-resize:active::after {
  background: var(--xray-border-control);
}

.xray-sql-grid-row {
  position: absolute;
  left: 0;
  border-bottom: 1px solid rgba(var(--xray-text-rgb), .05);
}

/* A subtle band follows the pointer's row; the inspected row's number is marked. */
.xray-sql-grid-row:hover {
  background: rgba(var(--xray-text-rgb), .045);
}

.xray-sql-grid-row:hover .xray-sql-grid-index {
  color: var(--xray-subtext);
}

.xray-sql-grid-row.inspected .xray-sql-grid-index {
  color: var(--xray-accent);
  font-weight: 700;
  background: var(--xray-selection);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-sql-grid-cell {
  line-height: 26px;
  color: var(--xray-text);
  cursor: pointer;
}

.xray-sql-grid-cell:hover {
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-sql-grid-cell.selected {
  background: var(--xray-selection);
  outline: 2px solid var(--xray-accent);
  outline-offset: -2px;
}

.xray-sql-grid-cell.kind-null {
  color: var(--xray-hint);
  font-style: italic;
}

.xray-sql-grid-cell.kind-number {
  color: var(--xray-peach);
  text-align: right;
}

.xray-sql-grid-cell.kind-blob {
  color: var(--xray-mauve);
}

.xray-sql-grid-cell.kind-json {
  color: var(--xray-teal);
}

.xray-sql-grid-index {
  position: sticky;
  left: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  color: var(--xray-hint);
  background: var(--xray-surface);
  border-right: 1px solid var(--xray-border);
}

/* Cell inspector */
.xray-sql-inspector {
  display: flex;
  flex-direction: column;
  width: min(380px, 40vw);
  min-height: 0;
  border-left: 1px solid var(--xray-border);
  background: var(--xray-surface);
}

.xray-sql-inspector-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 4px 10px;
  border-bottom: 1px solid var(--xray-border);
}

.xray-sql-inspector-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}

.xray-sql-inspector-head .xray-icon-btn {
  width: 26px;
  height: 26px;
}

.xray-sql-inspector-head .xray-btn {
  flex: none;
  height: 26px;
  padding: 0 8px;
  gap: 5px;
}

.xray-sql-inspector-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 10px;
}

.xray-sql-inspector-text,
.xray-sql-confirm-sql {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font: 12px/1.5 var(--xray-font);
  color: var(--xray-text);
}

.xray-sql-confirm-sql {
  max-height: 240px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-bg);
  border: 1px solid var(--xray-border);
}

/* Messages and History */
.xray-sql-messages,
.xray-sql-history {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 6px 0;
  list-style: none;
}

.xray-sql-message {
  padding: 3px 12px;
  font: 12px/1.5 var(--xray-font);
  color: var(--xray-subtext);
  white-space: pre-wrap;
}

.xray-sql-message.error {
  color: var(--xray-red);
}

.xray-sql-history-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 100%;
  padding: 6px 12px;
  border: 0;
  border-bottom: 1px solid rgba(var(--xray-text-rgb), .05);
  background: transparent;
  color: var(--xray-text);
  text-align: left;
  cursor: pointer;
}

.xray-sql-history-item:hover {
  background: var(--xray-hover);
}

.xray-sql-history-sql {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 12px/1.4 var(--xray-font);
}

.xray-sql-history-meta {
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-sql-history-meta.error {
  color: var(--xray-red);
}

@media (max-width: 720px) {
  .xray-sql-source-meta,
  .xray-sql-kbd {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xray-sql-app *,
  .xray-sql-app *::before,
  .xray-sql-app *::after {
    transition: none !important;
    animation: none !important;
  }
}
`});var qP=An(()=>{var b0=J(cS());tO();Fa();fb();oO();Gd();lO();fO();uO();pO();hO();var I0=J(Te()),dp=document.getElementById("xray-sql-root");async function NP(){try{let t=await xl(nO,{});return rO(t??{}).settings??at}catch{return at}}dp&&(async()=>{let t=document.createElement("style");t.setAttribute("data-xray-sql-ui","1"),t.textContent=`${cO.replace(/:host/g,"#xray-sql-root")}
${dO}
${mO}`,document.head.appendChild(t),dp.className="xray-app-root";let e=await NP();if(!iO(Array.from(location.ancestorOrigins??[]),e.sqlInlineInHud)){(0,b0.createRoot)(dp).render((0,I0.jsx)(sO,{label:"The SQL client is not enabled for this page."}));return}await Hd(),window.addEventListener("pagehide",Ud),(0,b0.createRoot)(dp).render((0,I0.jsx)(eO,{settings:e})),window.parent!==window&&chrome?.runtime?.sendMessage?.({type:aO},()=>{chrome?.runtime?.lastError})})()});return qP();})();
/*! Bundled license information:

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertTriangle.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowDown.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowUp.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronDown.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs:
@tabler/icons-react/dist/esm/icons/IconCopy.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabase.mjs:
@tabler/icons-react/dist/esm/icons/IconDeviceFloppy.mjs:
@tabler/icons-react/dist/esm/icons/IconEye.mjs:
@tabler/icons-react/dist/esm/icons/IconFilter.mjs:
@tabler/icons-react/dist/esm/icons/IconFoldDown.mjs:
@tabler/icons-react/dist/esm/icons/IconFold.mjs:
@tabler/icons-react/dist/esm/icons/IconFolderOpen.mjs:
@tabler/icons-react/dist/esm/icons/IconKey.mjs:
@tabler/icons-react/dist/esm/icons/IconLockOpen.mjs:
@tabler/icons-react/dist/esm/icons/IconLock.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerStop.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconRadar2.mjs:
@tabler/icons-react/dist/esm/icons/IconSearch.mjs:
@tabler/icons-react/dist/esm/icons/IconTable.mjs:
@tabler/icons-react/dist/esm/icons/IconX.mjs:
@tabler/icons-react/dist/esm/tabler-icons-react.mjs:
  (**
   * @license @tabler/icons-react v3.44.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
