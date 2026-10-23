"use strict";var XRAYSqlUI=(()=>{var AD=Object.create;var ep=Object.defineProperty;var TD=Object.getOwnPropertyDescriptor;var MD=Object.getOwnPropertyNames;var DD=Object.getPrototypeOf,OD=Object.prototype.hasOwnProperty;var BD=(t,e,n)=>e in t?ep(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var E=(t,e,n)=>()=>{if(n)throw n[0];try{return t&&(e=t(t=0)),e}catch(r){throw n=[r],r}};var Cn=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var RD=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of MD(e))!OD.call(t,o)&&o!==n&&ep(t,o,{get:()=>e[o],enumerable:!(r=TD(e,o))||r.enumerable});return t};var Y=(t,e,n)=>(n=t!=null?AD(DD(t)):{},RD(e||!t||!t.__esModule?ep(n,"default",{value:t,enumerable:!0}):n,t));var rr=(t,e,n)=>BD(t,typeof e!="symbol"?e+"":e,n);var f0=Cn(Ae=>{"use strict";function op(t,e){var n=t.length;t.push(e);e:for(;0<n;){var r=n-1>>>1,o=t[r];if(0<Ef(o,e))t[r]=e,t[n]=o,n=r;else break e}}function Hn(t){return t.length===0?null:t[0]}function Lf(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var r=0,o=t.length,a=o>>>1;r<a;){var i=2*(r+1)-1,l=t[i],s=i+1,f=t[s];if(0>Ef(l,n))s<o&&0>Ef(f,l)?(t[r]=f,t[s]=n,r=s):(t[r]=l,t[i]=n,r=i);else if(s<o&&0>Ef(f,n))t[r]=f,t[s]=n,r=s;else break e}}return e}function Ef(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Ae.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(e0=performance,Ae.unstable_now=function(){return e0.now()}):(tp=Date,t0=tp.now(),Ae.unstable_now=function(){return tp.now()-t0});var e0,tp,t0,or=[],Pr=[],ED=1,rn=null,st=3,ap=!1,Il=!1,vl=!1,ip=!1,o0=typeof setTimeout=="function"?setTimeout:null,a0=typeof clearTimeout=="function"?clearTimeout:null,n0=typeof setImmediate<"u"?setImmediate:null;function Ff(t){for(var e=Hn(Pr);e!==null;){if(e.callback===null)Lf(Pr);else if(e.startTime<=t)Lf(Pr),e.sortIndex=e.expirationTime,op(or,e);else break;e=Hn(Pr)}}function lp(t){if(vl=!1,Ff(t),!Il)if(Hn(or)!==null)Il=!0,Na||(Na=!0,La());else{var e=Hn(Pr);e!==null&&sp(lp,e.startTime-t)}}var Na=!1,wl=-1,i0=5,l0=-1;function s0(){return ip?!0:!(Ae.unstable_now()-l0<i0)}function np(){if(ip=!1,Na){var t=Ae.unstable_now();l0=t;var e=!0;try{e:{Il=!1,vl&&(vl=!1,a0(wl),wl=-1),ap=!0;var n=st;try{t:{for(Ff(t),rn=Hn(or);rn!==null&&!(rn.expirationTime>t&&s0());){var r=rn.callback;if(typeof r=="function"){rn.callback=null,st=rn.priorityLevel;var o=r(rn.expirationTime<=t);if(t=Ae.unstable_now(),typeof o=="function"){rn.callback=o,Ff(t),e=!0;break t}rn===Hn(or)&&Lf(or),Ff(t)}else Lf(or);rn=Hn(or)}if(rn!==null)e=!0;else{var a=Hn(Pr);a!==null&&sp(lp,a.startTime-t),e=!1}}break e}finally{rn=null,st=n,ap=!1}e=void 0}}finally{e?La():Na=!1}}}var La;typeof n0=="function"?La=function(){n0(np)}:typeof MessageChannel<"u"?(rp=new MessageChannel,r0=rp.port2,rp.port1.onmessage=np,La=function(){r0.postMessage(null)}):La=function(){o0(np,0)};var rp,r0;function sp(t,e){wl=o0(function(){t(Ae.unstable_now())},e)}Ae.unstable_IdlePriority=5;Ae.unstable_ImmediatePriority=1;Ae.unstable_LowPriority=4;Ae.unstable_NormalPriority=3;Ae.unstable_Profiling=null;Ae.unstable_UserBlockingPriority=2;Ae.unstable_cancelCallback=function(t){t.callback=null};Ae.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):i0=0<t?Math.floor(1e3/t):5};Ae.unstable_getCurrentPriorityLevel=function(){return st};Ae.unstable_next=function(t){switch(st){case 1:case 2:case 3:var e=3;break;default:e=st}var n=st;st=e;try{return t()}finally{st=n}};Ae.unstable_requestPaint=function(){ip=!0};Ae.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=st;st=t;try{return e()}finally{st=n}};Ae.unstable_scheduleCallback=function(t,e,n){var r=Ae.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,t){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,t={id:ED++,callback:e,priorityLevel:t,startTime:n,expirationTime:o,sortIndex:-1},n>r?(t.sortIndex=n,op(Pr,t),Hn(or)===null&&t===Hn(Pr)&&(vl?(a0(wl),wl=-1):vl=!0,sp(lp,n-r))):(t.sortIndex=o,op(or,t),Il||ap||(Il=!0,Na||(Na=!0,La()))),t};Ae.unstable_shouldYield=s0;Ae.unstable_wrapCallback=function(t){var e=st;return function(){var n=st;st=e;try{return t.apply(this,arguments)}finally{st=n}}}});var u0=Cn((qq,c0)=>{"use strict";c0.exports=f0()});var w0=Cn(G=>{"use strict";var up=Symbol.for("react.transitional.element"),FD=Symbol.for("react.portal"),LD=Symbol.for("react.fragment"),ND=Symbol.for("react.strict_mode"),qD=Symbol.for("react.profiler"),_D=Symbol.for("react.consumer"),PD=Symbol.for("react.context"),zD=Symbol.for("react.forward_ref"),HD=Symbol.for("react.suspense"),UD=Symbol.for("react.memo"),x0=Symbol.for("react.lazy"),jD=Symbol.for("react.activity"),d0=Symbol.iterator;function VD(t){return t===null||typeof t!="object"?null:(t=d0&&t[d0]||t["@@iterator"],typeof t=="function"?t:null)}var g0={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},y0=Object.assign,b0={};function _a(t,e,n){this.props=t,this.context=e,this.refs=b0,this.updater=n||g0}_a.prototype.isReactComponent={};_a.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};_a.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function I0(){}I0.prototype=_a.prototype;function dp(t,e,n){this.props=t,this.context=e,this.refs=b0,this.updater=n||g0}var pp=dp.prototype=new I0;pp.constructor=dp;y0(pp,_a.prototype);pp.isPureReactComponent=!0;var p0=Array.isArray;function cp(){}var ve={H:null,A:null,T:null,S:null},v0=Object.prototype.hasOwnProperty;function mp(t,e,n){var r=n.ref;return{$$typeof:up,type:t,key:e,ref:r!==void 0?r:null,props:n}}function GD(t,e){return mp(t.type,e,t.props)}function hp(t){return typeof t=="object"&&t!==null&&t.$$typeof===up}function XD(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var m0=/\/+/g;function fp(t,e){return typeof t=="object"&&t!==null&&t.key!=null?XD(""+t.key):e.toString(36)}function QD(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(cp,cp):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function qa(t,e,n,r,o){var a=typeof t;(a==="undefined"||a==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(a){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case up:case FD:i=!0;break;case x0:return i=t._init,qa(i(t._payload),e,n,r,o)}}if(i)return o=o(t),i=r===""?"."+fp(t,0):r,p0(o)?(n="",i!=null&&(n=i.replace(m0,"$&/")+"/"),qa(o,e,n,"",function(f){return f})):o!=null&&(hp(o)&&(o=GD(o,n+(o.key==null||t&&t.key===o.key?"":(""+o.key).replace(m0,"$&/")+"/")+i)),e.push(o)),1;i=0;var l=r===""?".":r+":";if(p0(t))for(var s=0;s<t.length;s++)r=t[s],a=l+fp(r,s),i+=qa(r,e,n,a,o);else if(s=VD(t),typeof s=="function")for(t=s.call(t),s=0;!(r=t.next()).done;)r=r.value,a=l+fp(r,s++),i+=qa(r,e,n,a,o);else if(a==="object"){if(typeof t.then=="function")return qa(QD(t),e,n,r,o);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function Nf(t,e,n){if(t==null)return t;var r=[],o=0;return qa(t,r,"","",function(a){return e.call(n,a,o++)}),r}function WD(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var h0=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},KD={map:Nf,forEach:function(t,e,n){Nf(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Nf(t,function(){e++}),e},toArray:function(t){return Nf(t,function(e){return e})||[]},only:function(t){if(!hp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};G.Activity=jD;G.Children=KD;G.Component=_a;G.Fragment=LD;G.Profiler=qD;G.PureComponent=dp;G.StrictMode=ND;G.Suspense=HD;G.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ve;G.__COMPILER_RUNTIME={__proto__:null,c:function(t){return ve.H.useMemoCache(t)}};G.cache=function(t){return function(){return t.apply(null,arguments)}};G.cacheSignal=function(){return null};G.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var r=y0({},t.props),o=t.key;if(e!=null)for(a in e.key!==void 0&&(o=""+e.key),e)!v0.call(e,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&e.ref===void 0||(r[a]=e[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var i=Array(a),l=0;l<a;l++)i[l]=arguments[l+2];r.children=i}return mp(t.type,o,r)};G.createContext=function(t){return t={$$typeof:PD,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:_D,_context:t},t};G.createElement=function(t,e,n){var r,o={},a=null;if(e!=null)for(r in e.key!==void 0&&(a=""+e.key),e)v0.call(e,r)&&r!=="key"&&r!=="__self"&&r!=="__source"&&(o[r]=e[r]);var i=arguments.length-2;if(i===1)o.children=n;else if(1<i){for(var l=Array(i),s=0;s<i;s++)l[s]=arguments[s+2];o.children=l}if(t&&t.defaultProps)for(r in i=t.defaultProps,i)o[r]===void 0&&(o[r]=i[r]);return mp(t,a,o)};G.createRef=function(){return{current:null}};G.forwardRef=function(t){return{$$typeof:zD,render:t}};G.isValidElement=hp;G.lazy=function(t){return{$$typeof:x0,_payload:{_status:-1,_result:t},_init:WD}};G.memo=function(t,e){return{$$typeof:UD,type:t,compare:e===void 0?null:e}};G.startTransition=function(t){var e=ve.T,n={};ve.T=n;try{var r=t(),o=ve.S;o!==null&&o(n,r),typeof r=="object"&&r!==null&&typeof r.then=="function"&&r.then(cp,h0)}catch(a){h0(a)}finally{e!==null&&n.types!==null&&(e.types=n.types),ve.T=e}};G.unstable_useCacheRefresh=function(){return ve.H.useCacheRefresh()};G.use=function(t){return ve.H.use(t)};G.useActionState=function(t,e,n){return ve.H.useActionState(t,e,n)};G.useCallback=function(t,e){return ve.H.useCallback(t,e)};G.useContext=function(t){return ve.H.useContext(t)};G.useDebugValue=function(){};G.useDeferredValue=function(t,e){return ve.H.useDeferredValue(t,e)};G.useEffect=function(t,e){return ve.H.useEffect(t,e)};G.useEffectEvent=function(t){return ve.H.useEffectEvent(t)};G.useId=function(){return ve.H.useId()};G.useImperativeHandle=function(t,e,n){return ve.H.useImperativeHandle(t,e,n)};G.useInsertionEffect=function(t,e){return ve.H.useInsertionEffect(t,e)};G.useLayoutEffect=function(t,e){return ve.H.useLayoutEffect(t,e)};G.useMemo=function(t,e){return ve.H.useMemo(t,e)};G.useOptimistic=function(t,e){return ve.H.useOptimistic(t,e)};G.useReducer=function(t,e,n){return ve.H.useReducer(t,e,n)};G.useRef=function(t){return ve.H.useRef(t)};G.useState=function(t){return ve.H.useState(t)};G.useSyncExternalStore=function(t,e,n){return ve.H.useSyncExternalStore(t,e,n)};G.useTransition=function(){return ve.H.useTransition()};G.version="19.2.6"});var mt=Cn((Pq,S0)=>{"use strict";S0.exports=w0()});var C0=Cn(xt=>{"use strict";var YD=mt();function k0(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function zr(){}var ht={d:{f:zr,r:function(){throw Error(k0(522))},D:zr,C:zr,L:zr,m:zr,X:zr,S:zr,M:zr},p:0,findDOMNode:null},JD=Symbol.for("react.portal");function $D(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:JD,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}var Sl=YD.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function qf(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}xt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ht;xt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(k0(299));return $D(t,e,null,n)};xt.flushSync=function(t){var e=Sl.T,n=ht.p;try{if(Sl.T=null,ht.p=2,t)return t()}finally{Sl.T=e,ht.p=n,ht.d.f()}};xt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,ht.d.C(t,e))};xt.prefetchDNS=function(t){typeof t=="string"&&ht.d.D(t)};xt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,r=qf(n,e.crossOrigin),o=typeof e.integrity=="string"?e.integrity:void 0,a=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?ht.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:r,integrity:o,fetchPriority:a}):n==="script"&&ht.d.X(t,{crossOrigin:r,integrity:o,fetchPriority:a,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};xt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=qf(e.as,e.crossOrigin);ht.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&ht.d.M(t)};xt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,r=qf(n,e.crossOrigin);ht.d.L(t,n,{crossOrigin:r,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};xt.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=qf(e.as,e.crossOrigin);ht.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else ht.d.m(t)};xt.requestFormReset=function(t){ht.d.r(t)};xt.unstable_batchedUpdates=function(t,e){return t(e)};xt.useFormState=function(t,e,n){return Sl.H.useFormState(t,e,n)};xt.useFormStatus=function(){return Sl.H.useHostTransitionStatus()};xt.version="19.2.6"});var xp=Cn((Hq,T0)=>{"use strict";function A0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(A0)}catch(t){console.error(t)}}A0(),T0.exports=C0()});var Pw=Cn(su=>{"use strict";var Ge=u0(),ZI=mt(),ZD=xp();function T(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ev(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function fs(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function tv(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function nv(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function M0(t){if(fs(t)!==t)throw Error(T(188))}function eO(t){var e=t.alternate;if(!e){if(e=fs(t),e===null)throw Error(T(188));return e!==t?null:t}for(var n=t,r=e;;){var o=n.return;if(o===null)break;var a=o.alternate;if(a===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===a.child){for(a=o.child;a;){if(a===n)return M0(o),t;if(a===r)return M0(o),e;a=a.sibling}throw Error(T(188))}if(n.return!==r.return)n=o,r=a;else{for(var i=!1,l=o.child;l;){if(l===n){i=!0,n=o,r=a;break}if(l===r){i=!0,r=o,n=a;break}l=l.sibling}if(!i){for(l=a.child;l;){if(l===n){i=!0,n=a,r=o;break}if(l===r){i=!0,r=a,n=o;break}l=l.sibling}if(!i)throw Error(T(189))}}if(n.alternate!==r)throw Error(T(190))}if(n.tag!==3)throw Error(T(188));return n.stateNode.current===n?t:e}function rv(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=rv(t),e!==null)return e;t=t.sibling}return null}var ke=Object.assign,tO=Symbol.for("react.element"),_f=Symbol.for("react.transitional.element"),Bl=Symbol.for("react.portal"),Va=Symbol.for("react.fragment"),ov=Symbol.for("react.strict_mode"),Yp=Symbol.for("react.profiler"),av=Symbol.for("react.consumer"),dr=Symbol.for("react.context"),Gm=Symbol.for("react.forward_ref"),Jp=Symbol.for("react.suspense"),$p=Symbol.for("react.suspense_list"),Xm=Symbol.for("react.memo"),Hr=Symbol.for("react.lazy"),Zp=Symbol.for("react.activity"),nO=Symbol.for("react.memo_cache_sentinel"),D0=Symbol.iterator;function kl(t){return t===null||typeof t!="object"?null:(t=D0&&t[D0]||t["@@iterator"],typeof t=="function"?t:null)}var rO=Symbol.for("react.client.reference");function em(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===rO?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Va:return"Fragment";case Yp:return"Profiler";case ov:return"StrictMode";case Jp:return"Suspense";case $p:return"SuspenseList";case Zp:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Bl:return"Portal";case dr:return t.displayName||"Context";case av:return(t._context.displayName||"Context")+".Consumer";case Gm:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Xm:return e=t.displayName||null,e!==null?e:em(t.type)||"Memo";case Hr:e=t._payload,t=t._init;try{return em(t(e))}catch{}}return null}var Rl=Array.isArray,j=ZI.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,oe=ZD.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ho={pending:!1,data:null,method:null,action:null},tm=[],Ga=-1;function Xn(t){return{current:t}}function Ye(t){0>Ga||(t.current=tm[Ga],tm[Ga]=null,Ga--)}function ge(t,e){Ga++,tm[Ga]=t.current,t.current=e}var Gn=Xn(null),Kl=Xn(null),$r=Xn(null),gc=Xn(null);function yc(t,e){switch(ge($r,e),ge(Kl,t),ge(Gn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?NI(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=NI(e),t=Cw(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Ye(Gn),ge(Gn,t)}function fi(){Ye(Gn),Ye(Kl),Ye($r)}function nm(t){t.memoizedState!==null&&ge(gc,t);var e=Gn.current,n=Cw(e,t.type);e!==n&&(ge(Kl,t),ge(Gn,n))}function bc(t){Kl.current===t&&(Ye(Gn),Ye(Kl)),gc.current===t&&(Ye(gc),is._currentValue=Ho)}var gp,O0;function qo(t){if(gp===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);gp=e&&e[1]||"",O0=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+gp+t+O0}var yp=!1;function bp(t,e){if(!t||yp)return"";yp=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(e){var d=function(){throw Error()};if(Object.defineProperty(d.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(d,[])}catch(p){var u=p}Reflect.construct(t,[],d)}else{try{d.call()}catch(p){u=p}t.call(d.prototype)}}else{try{throw Error()}catch(p){u=p}(d=t())&&typeof d.catch=="function"&&d.catch(function(){})}}catch(p){if(p&&u&&typeof p.stack=="string")return[p.stack,u.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=r.DetermineComponentFrameRoot(),i=a[0],l=a[1];if(i&&l){var s=i.split(`
`),f=l.split(`
`);for(o=r=0;r<s.length&&!s[r].includes("DetermineComponentFrameRoot");)r++;for(;o<f.length&&!f[o].includes("DetermineComponentFrameRoot");)o++;if(r===s.length||o===f.length)for(r=s.length-1,o=f.length-1;1<=r&&0<=o&&s[r]!==f[o];)o--;for(;1<=r&&0<=o;r--,o--)if(s[r]!==f[o]){if(r!==1||o!==1)do if(r--,o--,0>o||s[r]!==f[o]){var c=`
`+s[r].replace(" at new "," at ");return t.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",t.displayName)),c}while(1<=r&&0<=o);break}}}finally{yp=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?qo(n):""}function oO(t,e){switch(t.tag){case 26:case 27:case 5:return qo(t.type);case 16:return qo("Lazy");case 13:return t.child!==e&&e!==null?qo("Suspense Fallback"):qo("Suspense");case 19:return qo("SuspenseList");case 0:case 15:return bp(t.type,!1);case 11:return bp(t.type.render,!1);case 1:return bp(t.type,!0);case 31:return qo("Activity");default:return""}}function B0(t){try{var e="",n=null;do e+=oO(t,n),n=t,t=t.return;while(t);return e}catch(r){return`
Error generating stack: `+r.message+`
`+r.stack}}var rm=Object.prototype.hasOwnProperty,Qm=Ge.unstable_scheduleCallback,Ip=Ge.unstable_cancelCallback,aO=Ge.unstable_shouldYield,iO=Ge.unstable_requestPaint,jt=Ge.unstable_now,lO=Ge.unstable_getCurrentPriorityLevel,iv=Ge.unstable_ImmediatePriority,lv=Ge.unstable_UserBlockingPriority,Ic=Ge.unstable_NormalPriority,sO=Ge.unstable_LowPriority,sv=Ge.unstable_IdlePriority,fO=Ge.log,cO=Ge.unstable_setDisableYieldValue,cs=null,Vt=null;function Qr(t){if(typeof fO=="function"&&cO(t),Vt&&typeof Vt.setStrictMode=="function")try{Vt.setStrictMode(cs,t)}catch{}}var Gt=Math.clz32?Math.clz32:pO,uO=Math.log,dO=Math.LN2;function pO(t){return t>>>=0,t===0?32:31-(uO(t)/dO|0)|0}var Pf=256,zf=262144,Hf=4194304;function _o(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Xc(t,e,n){var r=t.pendingLanes;if(r===0)return 0;var o=0,a=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var l=r&134217727;return l!==0?(r=l&~a,r!==0?o=_o(r):(i&=l,i!==0?o=_o(i):n||(n=l&~t,n!==0&&(o=_o(n))))):(l=r&~a,l!==0?o=_o(l):i!==0?o=_o(i):n||(n=r&~t,n!==0&&(o=_o(n)))),o===0?0:e!==0&&e!==o&&(e&a)===0&&(a=o&-o,n=e&-e,a>=n||a===32&&(n&4194048)!==0)?e:o}function us(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function mO(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function fv(){var t=Hf;return Hf<<=1,(Hf&62914560)===0&&(Hf=4194304),t}function vp(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ds(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function hO(t,e,n,r,o,a){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var l=t.entanglements,s=t.expirationTimes,f=t.hiddenUpdates;for(n=i&~n;0<n;){var c=31-Gt(n),d=1<<c;l[c]=0,s[c]=-1;var u=f[c];if(u!==null)for(f[c]=null,c=0;c<u.length;c++){var p=u[c];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&cv(t,r,0),a!==0&&o===0&&t.tag!==0&&(t.suspendedLanes|=a&~(i&~e))}function cv(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var r=31-Gt(e);t.entangledLanes|=e,t.entanglements[r]=t.entanglements[r]|1073741824|n&261930}function uv(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-Gt(n),o=1<<r;o&e|t[r]&e&&(t[r]|=e),n&=~o}}function dv(t,e){var n=e&-e;return n=(n&42)!==0?1:Wm(n),(n&(t.suspendedLanes|e))!==0?0:n}function Wm(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Km(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function pv(){var t=oe.p;return t!==0?t:(t=window.event,t===void 0?32:Nw(t.type))}function R0(t,e){var n=oe.p;try{return oe.p=t,e()}finally{oe.p=n}}var uo=Math.random().toString(36).slice(2),rt="__reactFiber$"+uo,Dt="__reactProps$"+uo,Ii="__reactContainer$"+uo,om="__reactEvents$"+uo,xO="__reactListeners$"+uo,gO="__reactHandles$"+uo,E0="__reactResources$"+uo,ps="__reactMarker$"+uo;function Ym(t){delete t[rt],delete t[Dt],delete t[om],delete t[xO],delete t[gO]}function Xa(t){var e=t[rt];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Ii]||n[rt]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=HI(t);t!==null;){if(n=t[rt])return n;t=HI(t)}return e}t=n,n=t.parentNode}return null}function vi(t){if(t=t[rt]||t[Ii]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function El(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(T(33))}function ni(t){var e=t[E0];return e||(e=t[E0]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Ke(t){t[ps]=!0}var mv=new Set,hv={};function Jo(t,e){ci(t,e),ci(t+"Capture",e)}function ci(t,e){for(hv[t]=e,t=0;t<e.length;t++)mv.add(e[t])}var yO=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),F0={},L0={};function bO(t){return rm.call(L0,t)?!0:rm.call(F0,t)?!1:yO.test(t)?L0[t]=!0:(F0[t]=!0,!1)}function nc(t,e,n){if(bO(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var r=e.toLowerCase().slice(0,5);if(r!=="data-"&&r!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Uf(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function ar(t,e,n,r){if(r===null)t.removeAttribute(n);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+r)}}function an(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function xv(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function IO(t,e,n){var r=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var o=r.get,a=r.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return o.call(this)},set:function(i){n=""+i,a.call(this,i)}}),Object.defineProperty(t,e,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function am(t){if(!t._valueTracker){var e=xv(t)?"checked":"value";t._valueTracker=IO(t,e,""+t[e])}}function gv(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=xv(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function vc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var vO=/[\n"\\]/g;function fn(t){return t.replace(vO,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function im(t,e,n,r,o,a,i,l){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+an(e)):t.value!==""+an(e)&&(t.value=""+an(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?lm(t,i,an(e)):n!=null?lm(t,i,an(n)):r!=null&&t.removeAttribute("value"),o==null&&a!=null&&(t.defaultChecked=!!a),o!=null&&(t.checked=o&&typeof o!="function"&&typeof o!="symbol"),l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?t.name=""+an(l):t.removeAttribute("name")}function yv(t,e,n,r,o,a,i,l){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(t.type=a),e!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||e!=null)){am(t);return}n=n!=null?""+an(n):"",e=e!=null?""+an(e):n,l||e===t.value||(t.value=e),t.defaultValue=e}r=r??o,r=typeof r!="function"&&typeof r!="symbol"&&!!r,t.checked=l?t.checked:!!r,t.defaultChecked=!!r,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),am(t)}function lm(t,e,n){e==="number"&&vc(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function ri(t,e,n,r){if(t=t.options,e){e={};for(var o=0;o<n.length;o++)e["$"+n[o]]=!0;for(n=0;n<t.length;n++)o=e.hasOwnProperty("$"+t[n].value),t[n].selected!==o&&(t[n].selected=o),o&&r&&(t[n].defaultSelected=!0)}else{for(n=""+an(n),e=null,o=0;o<t.length;o++){if(t[o].value===n){t[o].selected=!0,r&&(t[o].defaultSelected=!0);return}e!==null||t[o].disabled||(e=t[o])}e!==null&&(e.selected=!0)}}function bv(t,e,n){if(e!=null&&(e=""+an(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+an(n):""}function Iv(t,e,n,r){if(e==null){if(r!=null){if(n!=null)throw Error(T(92));if(Rl(r)){if(1<r.length)throw Error(T(93));r=r[0]}n=r}n==null&&(n=""),e=n}n=an(e),t.defaultValue=n,r=t.textContent,r===n&&r!==""&&r!==null&&(t.value=r),am(t)}function ui(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var wO=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function N0(t,e,n){var r=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?r?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":r?t.setProperty(e,n):typeof n!="number"||n===0||wO.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function vv(t,e,n){if(e!=null&&typeof e!="object")throw Error(T(62));if(t=t.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||e!=null&&e.hasOwnProperty(r)||(r.indexOf("--")===0?t.setProperty(r,""):r==="float"?t.cssFloat="":t[r]="");for(var o in e)r=e[o],e.hasOwnProperty(o)&&n[o]!==r&&N0(t,o,r)}else for(var a in e)e.hasOwnProperty(a)&&N0(t,a,e[a])}function Jm(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var SO=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),kO=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function rc(t){return kO.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function pr(){}var sm=null;function $m(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Qa=null,oi=null;function q0(t){var e=vi(t);if(e&&(t=e.stateNode)){var n=t[Dt]||null;e:switch(t=e.stateNode,e.type){case"input":if(im(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+fn(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var o=r[Dt]||null;if(!o)throw Error(T(90));im(r,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(e=0;e<n.length;e++)r=n[e],r.form===t.form&&gv(r)}break e;case"textarea":bv(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&ri(t,!!n.multiple,e,!1)}}}var wp=!1;function wv(t,e,n){if(wp)return t(e,n);wp=!0;try{var r=t(e);return r}finally{if(wp=!1,(Qa!==null||oi!==null)&&(ou(),Qa&&(e=Qa,t=oi,oi=Qa=null,q0(e),t)))for(e=0;e<t.length;e++)q0(t[e])}}function Yl(t,e){var n=t.stateNode;if(n===null)return null;var r=n[Dt]||null;if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(T(231,e,typeof n));return n}var yr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),fm=!1;if(yr)try{Pa={},Object.defineProperty(Pa,"passive",{get:function(){fm=!0}}),window.addEventListener("test",Pa,Pa),window.removeEventListener("test",Pa,Pa)}catch{fm=!1}var Pa,Wr=null,Zm=null,oc=null;function Sv(){if(oc)return oc;var t,e=Zm,n=e.length,r,o="value"in Wr?Wr.value:Wr.textContent,a=o.length;for(t=0;t<n&&e[t]===o[t];t++);var i=n-t;for(r=1;r<=i&&e[n-r]===o[a-r];r++);return oc=o.slice(t,1<r?1-r:void 0)}function ac(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function jf(){return!0}function _0(){return!1}function Ot(t){function e(n,r,o,a,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=a,this.target=i,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(a):a[l]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?jf:_0,this.isPropagationStopped=_0,this}return ke(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=jf)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=jf)},persist:function(){},isPersistent:jf}),e}var $o={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Qc=Ot($o),ms=ke({},$o,{view:0,detail:0}),CO=Ot(ms),Sp,kp,Cl,Wc=ke({},ms,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:eh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Cl&&(Cl&&t.type==="mousemove"?(Sp=t.screenX-Cl.screenX,kp=t.screenY-Cl.screenY):kp=Sp=0,Cl=t),Sp)},movementY:function(t){return"movementY"in t?t.movementY:kp}}),P0=Ot(Wc),AO=ke({},Wc,{dataTransfer:0}),TO=Ot(AO),MO=ke({},ms,{relatedTarget:0}),Cp=Ot(MO),DO=ke({},$o,{animationName:0,elapsedTime:0,pseudoElement:0}),OO=Ot(DO),BO=ke({},$o,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),RO=Ot(BO),EO=ke({},$o,{data:0}),z0=Ot(EO),FO={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},LO={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},NO={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function qO(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=NO[t])?!!e[t]:!1}function eh(){return qO}var _O=ke({},ms,{key:function(t){if(t.key){var e=FO[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=ac(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?LO[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:eh,charCode:function(t){return t.type==="keypress"?ac(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?ac(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),PO=Ot(_O),zO=ke({},Wc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),H0=Ot(zO),HO=ke({},ms,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:eh}),UO=Ot(HO),jO=ke({},$o,{propertyName:0,elapsedTime:0,pseudoElement:0}),VO=Ot(jO),GO=ke({},Wc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),XO=Ot(GO),QO=ke({},$o,{newState:0,oldState:0}),WO=Ot(QO),KO=[9,13,27,32],th=yr&&"CompositionEvent"in window,Nl=null;yr&&"documentMode"in document&&(Nl=document.documentMode);var YO=yr&&"TextEvent"in window&&!Nl,kv=yr&&(!th||Nl&&8<Nl&&11>=Nl),U0=" ",j0=!1;function Cv(t,e){switch(t){case"keyup":return KO.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Av(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Wa=!1;function JO(t,e){switch(t){case"compositionend":return Av(e);case"keypress":return e.which!==32?null:(j0=!0,U0);case"textInput":return t=e.data,t===U0&&j0?null:t;default:return null}}function $O(t,e){if(Wa)return t==="compositionend"||!th&&Cv(t,e)?(t=Sv(),oc=Zm=Wr=null,Wa=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return kv&&e.locale!=="ko"?null:e.data;default:return null}}var ZO={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function V0(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!ZO[t.type]:e==="textarea"}function Tv(t,e,n,r){Qa?oi?oi.push(r):oi=[r]:Qa=r,e=Pc(e,"onChange"),0<e.length&&(n=new Qc("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var ql=null,Jl=null;function eB(t){ww(t,0)}function Kc(t){var e=El(t);if(gv(e))return t}function G0(t,e){if(t==="change")return e}var Mv=!1;yr&&(yr?(Gf="oninput"in document,Gf||(Ap=document.createElement("div"),Ap.setAttribute("oninput","return;"),Gf=typeof Ap.oninput=="function"),Vf=Gf):Vf=!1,Mv=Vf&&(!document.documentMode||9<document.documentMode));var Vf,Gf,Ap;function X0(){ql&&(ql.detachEvent("onpropertychange",Dv),Jl=ql=null)}function Dv(t){if(t.propertyName==="value"&&Kc(Jl)){var e=[];Tv(e,Jl,t,$m(t)),wv(eB,e)}}function tB(t,e,n){t==="focusin"?(X0(),ql=e,Jl=n,ql.attachEvent("onpropertychange",Dv)):t==="focusout"&&X0()}function nB(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Kc(Jl)}function rB(t,e){if(t==="click")return Kc(e)}function oB(t,e){if(t==="input"||t==="change")return Kc(e)}function aB(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Qt=typeof Object.is=="function"?Object.is:aB;function $l(t,e){if(Qt(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!rm.call(e,o)||!Qt(t[o],e[o]))return!1}return!0}function Q0(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function W0(t,e){var n=Q0(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Q0(n)}}function Ov(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Ov(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Bv(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=vc(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=vc(t.document)}return e}function nh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var iB=yr&&"documentMode"in document&&11>=document.documentMode,Ka=null,cm=null,_l=null,um=!1;function K0(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;um||Ka==null||Ka!==vc(r)||(r=Ka,"selectionStart"in r&&nh(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),_l&&$l(_l,r)||(_l=r,r=Pc(cm,"onSelect"),0<r.length&&(e=new Qc("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=Ka)))}function No(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Ya={animationend:No("Animation","AnimationEnd"),animationiteration:No("Animation","AnimationIteration"),animationstart:No("Animation","AnimationStart"),transitionrun:No("Transition","TransitionRun"),transitionstart:No("Transition","TransitionStart"),transitioncancel:No("Transition","TransitionCancel"),transitionend:No("Transition","TransitionEnd")},Tp={},Rv={};yr&&(Rv=document.createElement("div").style,"AnimationEvent"in window||(delete Ya.animationend.animation,delete Ya.animationiteration.animation,delete Ya.animationstart.animation),"TransitionEvent"in window||delete Ya.transitionend.transition);function Zo(t){if(Tp[t])return Tp[t];if(!Ya[t])return t;var e=Ya[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Rv)return Tp[t]=e[n];return t}var Ev=Zo("animationend"),Fv=Zo("animationiteration"),Lv=Zo("animationstart"),lB=Zo("transitionrun"),sB=Zo("transitionstart"),fB=Zo("transitioncancel"),Nv=Zo("transitionend"),qv=new Map,dm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");dm.push("scrollEnd");function Mn(t,e){qv.set(t,e),Jo(e,[t])}var wc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},on=[],Ja=0,rh=0;function Yc(){for(var t=Ja,e=rh=Ja=0;e<t;){var n=on[e];on[e++]=null;var r=on[e];on[e++]=null;var o=on[e];on[e++]=null;var a=on[e];if(on[e++]=null,r!==null&&o!==null){var i=r.pending;i===null?o.next=o:(o.next=i.next,i.next=o),r.pending=o}a!==0&&_v(n,o,a)}}function Jc(t,e,n,r){on[Ja++]=t,on[Ja++]=e,on[Ja++]=n,on[Ja++]=r,rh|=r,t.lanes|=r,t=t.alternate,t!==null&&(t.lanes|=r)}function oh(t,e,n,r){return Jc(t,e,n,r),Sc(t)}function ea(t,e){return Jc(t,null,null,e),Sc(t)}function _v(t,e,n){t.lanes|=n;var r=t.alternate;r!==null&&(r.lanes|=n);for(var o=!1,a=t.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(t=a.stateNode,t===null||t._visibility&1||(o=!0)),t=a,a=a.return;return t.tag===3?(a=t.stateNode,o&&e!==null&&(o=31-Gt(n),t=a.hiddenUpdates,r=t[o],r===null?t[o]=[e]:r.push(e),e.lane=n|536870912),a):null}function Sc(t){if(50<Ql)throw Ql=0,Em=null,Error(T(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var $a={};function cB(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ht(t,e,n,r){return new cB(t,e,n,r)}function ah(t){return t=t.prototype,!(!t||!t.isReactComponent)}function hr(t,e){var n=t.alternate;return n===null?(n=Ht(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function Pv(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function ic(t,e,n,r,o,a){var i=0;if(r=t,typeof t=="function")ah(t)&&(i=1);else if(typeof t=="string")i=pR(t,n,Gn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Zp:return t=Ht(31,n,e,o),t.elementType=Zp,t.lanes=a,t;case Va:return Uo(n.children,o,a,e);case ov:i=8,o|=24;break;case Yp:return t=Ht(12,n,e,o|2),t.elementType=Yp,t.lanes=a,t;case Jp:return t=Ht(13,n,e,o),t.elementType=Jp,t.lanes=a,t;case $p:return t=Ht(19,n,e,o),t.elementType=$p,t.lanes=a,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case dr:i=10;break e;case av:i=9;break e;case Gm:i=11;break e;case Xm:i=14;break e;case Hr:i=16,r=null;break e}i=29,n=Error(T(130,t===null?"null":typeof t,"")),r=null}return e=Ht(i,n,e,o),e.elementType=t,e.type=r,e.lanes=a,e}function Uo(t,e,n,r){return t=Ht(7,t,r,e),t.lanes=n,t}function Mp(t,e,n){return t=Ht(6,t,null,e),t.lanes=n,t}function zv(t){var e=Ht(18,null,null,0);return e.stateNode=t,e}function Dp(t,e,n){return e=Ht(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var Y0=new WeakMap;function cn(t,e){if(typeof t=="object"&&t!==null){var n=Y0.get(t);return n!==void 0?n:(e={value:t,source:e,stack:B0(e)},Y0.set(t,e),e)}return{value:t,source:e,stack:B0(e)}}var Za=[],ei=0,kc=null,Zl=0,ln=[],sn=0,lo=null,Un=1,jn="";function cr(t,e){Za[ei++]=Zl,Za[ei++]=kc,kc=t,Zl=e}function Hv(t,e,n){ln[sn++]=Un,ln[sn++]=jn,ln[sn++]=lo,lo=t;var r=Un;t=jn;var o=32-Gt(r)-1;r&=~(1<<o),n+=1;var a=32-Gt(e)+o;if(30<a){var i=o-o%5;a=(r&(1<<i)-1).toString(32),r>>=i,o-=i,Un=1<<32-Gt(e)+o|n<<o|r,jn=a+t}else Un=1<<a|n<<o|r,jn=t}function ih(t){t.return!==null&&(cr(t,1),Hv(t,1,0))}function lh(t){for(;t===kc;)kc=Za[--ei],Za[ei]=null,Zl=Za[--ei],Za[ei]=null;for(;t===lo;)lo=ln[--sn],ln[sn]=null,jn=ln[--sn],ln[sn]=null,Un=ln[--sn],ln[sn]=null}function Uv(t,e){ln[sn++]=Un,ln[sn++]=jn,ln[sn++]=lo,Un=e.id,jn=e.overflow,lo=t}var ot=null,Se=null,ne=!1,Zr=null,un=!1,pm=Error(T(519));function so(t){var e=Error(T(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw es(cn(e,t)),pm}function J0(t){var e=t.stateNode,n=t.type,r=t.memoizedProps;switch(e[rt]=t,e[Dt]=r,n){case"dialog":$("cancel",e),$("close",e);break;case"iframe":case"object":case"embed":$("load",e);break;case"video":case"audio":for(n=0;n<os.length;n++)$(os[n],e);break;case"source":$("error",e);break;case"img":case"image":case"link":$("error",e),$("load",e);break;case"details":$("toggle",e);break;case"input":$("invalid",e),yv(e,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case"select":$("invalid",e);break;case"textarea":$("invalid",e),Iv(e,r.value,r.defaultValue,r.children)}n=r.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||r.suppressHydrationWarning===!0||kw(e.textContent,n)?(r.popover!=null&&($("beforetoggle",e),$("toggle",e)),r.onScroll!=null&&$("scroll",e),r.onScrollEnd!=null&&$("scrollend",e),r.onClick!=null&&(e.onclick=pr),e=!0):e=!1,e||so(t,!0)}function $0(t){for(ot=t.return;ot;)switch(ot.tag){case 5:case 31:case 13:un=!1;return;case 27:case 3:un=!0;return;default:ot=ot.return}}function za(t){if(t!==ot)return!1;if(!ne)return $0(t),ne=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||_m(t.type,t.memoizedProps)),n=!n),n&&Se&&so(t),$0(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(T(317));Se=zI(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(T(317));Se=zI(t)}else e===27?(e=Se,po(t.type)?(t=Um,Um=null,Se=t):Se=e):Se=ot?pn(t.stateNode.nextSibling):null;return!0}function Xo(){Se=ot=null,ne=!1}function Op(){var t=Zr;return t!==null&&(Tt===null?Tt=t:Tt.push.apply(Tt,t),Zr=null),t}function es(t){Zr===null?Zr=[t]:Zr.push(t)}var mm=Xn(null),ta=null,mr=null;function jr(t,e,n){ge(mm,e._currentValue),e._currentValue=n}function xr(t){t._currentValue=mm.current,Ye(mm)}function hm(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function xm(t,e,n,r){var o=t.child;for(o!==null&&(o.return=t);o!==null;){var a=o.dependencies;if(a!==null){var i=o.child;a=a.firstContext;e:for(;a!==null;){var l=a;a=o;for(var s=0;s<e.length;s++)if(l.context===e[s]){a.lanes|=n,l=a.alternate,l!==null&&(l.lanes|=n),hm(a.return,n,t),r||(i=null);break e}a=l.next}}else if(o.tag===18){if(i=o.return,i===null)throw Error(T(341));i.lanes|=n,a=i.alternate,a!==null&&(a.lanes|=n),hm(i,n,t),i=null}else i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===t){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}}function wi(t,e,n,r){t=null;for(var o=e,a=!1;o!==null;){if(!a){if((o.flags&524288)!==0)a=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var i=o.alternate;if(i===null)throw Error(T(387));if(i=i.memoizedProps,i!==null){var l=o.type;Qt(o.pendingProps.value,i.value)||(t!==null?t.push(l):t=[l])}}else if(o===gc.current){if(i=o.alternate,i===null)throw Error(T(387));i.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(t!==null?t.push(is):t=[is])}o=o.return}t!==null&&xm(e,t,n,r),e.flags|=262144}function Cc(t){for(t=t.firstContext;t!==null;){if(!Qt(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Qo(t){ta=t,mr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function at(t){return jv(ta,t)}function Xf(t,e){return ta===null&&Qo(t),jv(t,e)}function jv(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},mr===null){if(t===null)throw Error(T(308));mr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else mr=mr.next=e;return n}var uB=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,r){t.push(r)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},dB=Ge.unstable_scheduleCallback,pB=Ge.unstable_NormalPriority,He={$$typeof:dr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function sh(){return{controller:new uB,data:new Map,refCount:0}}function hs(t){t.refCount--,t.refCount===0&&dB(pB,function(){t.controller.abort()})}var Pl=null,gm=0,di=0,ai=null;function mB(t,e){if(Pl===null){var n=Pl=[];gm=0,di=Eh(),ai={status:"pending",value:void 0,then:function(r){n.push(r)}}}return gm++,e.then(Z0,Z0),e}function Z0(){if(--gm===0&&Pl!==null){ai!==null&&(ai.status="fulfilled");var t=Pl;Pl=null,di=0,ai=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function hB(t,e){var n=[],r={status:"pending",value:null,reason:null,then:function(o){n.push(o)}};return t.then(function(){r.status="fulfilled",r.value=e;for(var o=0;o<n.length;o++)(0,n[o])(e)},function(o){for(r.status="rejected",r.reason=o,o=0;o<n.length;o++)(0,n[o])(void 0)}),r}var eI=j.S;j.S=function(t,e){rw=jt(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&mB(t,e),eI!==null&&eI(t,e)};var jo=Xn(null);function fh(){var t=jo.current;return t!==null?t:de.pooledCache}function lc(t,e){e===null?ge(jo,jo.current):ge(jo,e.pool)}function Vv(){var t=fh();return t===null?null:{parent:He._currentValue,pool:t}}var Si=Error(T(460)),ch=Error(T(474)),$c=Error(T(542)),Ac={then:function(){}};function tI(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Gv(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(pr,pr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,rI(t),t;default:if(typeof e.status=="string")e.then(pr,pr);else{if(t=de,t!==null&&100<t.shellSuspendCounter)throw Error(T(482));t=e,t.status="pending",t.then(function(r){if(e.status==="pending"){var o=e;o.status="fulfilled",o.value=r}},function(r){if(e.status==="pending"){var o=e;o.status="rejected",o.reason=r}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,rI(t),t}throw Vo=e,Si}}function Po(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Vo=n,Si):n}}var Vo=null;function nI(){if(Vo===null)throw Error(T(459));var t=Vo;return Vo=null,t}function rI(t){if(t===Si||t===$c)throw Error(T(483))}var ii=null,ts=0;function Qf(t){var e=ts;return ts+=1,ii===null&&(ii=[]),Gv(ii,t,e)}function Al(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Wf(t,e){throw e.$$typeof===tO?Error(T(525)):(t=Object.prototype.toString.call(e),Error(T(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Xv(t){function e(h,y){if(t){var g=h.deletions;g===null?(h.deletions=[y],h.flags|=16):g.push(y)}}function n(h,y){if(!t)return null;for(;y!==null;)e(h,y),y=y.sibling;return null}function r(h){for(var y=new Map;h!==null;)h.key!==null?y.set(h.key,h):y.set(h.index,h),h=h.sibling;return y}function o(h,y){return h=hr(h,y),h.index=0,h.sibling=null,h}function a(h,y,g){return h.index=g,t?(g=h.alternate,g!==null?(g=g.index,g<y?(h.flags|=67108866,y):g):(h.flags|=67108866,y)):(h.flags|=1048576,y)}function i(h){return t&&h.alternate===null&&(h.flags|=67108866),h}function l(h,y,g,I){return y===null||y.tag!==6?(y=Mp(g,h.mode,I),y.return=h,y):(y=o(y,g),y.return=h,y)}function s(h,y,g,I){var v=g.type;return v===Va?c(h,y,g.props.children,I,g.key):y!==null&&(y.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Hr&&Po(v)===y.type)?(y=o(y,g.props),Al(y,g),y.return=h,y):(y=ic(g.type,g.key,g.props,null,h.mode,I),Al(y,g),y.return=h,y)}function f(h,y,g,I){return y===null||y.tag!==4||y.stateNode.containerInfo!==g.containerInfo||y.stateNode.implementation!==g.implementation?(y=Dp(g,h.mode,I),y.return=h,y):(y=o(y,g.children||[]),y.return=h,y)}function c(h,y,g,I,v){return y===null||y.tag!==7?(y=Uo(g,h.mode,I,v),y.return=h,y):(y=o(y,g),y.return=h,y)}function d(h,y,g){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=Mp(""+y,h.mode,g),y.return=h,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case _f:return g=ic(y.type,y.key,y.props,null,h.mode,g),Al(g,y),g.return=h,g;case Bl:return y=Dp(y,h.mode,g),y.return=h,y;case Hr:return y=Po(y),d(h,y,g)}if(Rl(y)||kl(y))return y=Uo(y,h.mode,g,null),y.return=h,y;if(typeof y.then=="function")return d(h,Qf(y),g);if(y.$$typeof===dr)return d(h,Xf(h,y),g);Wf(h,y)}return null}function u(h,y,g,I){var v=y!==null?y.key:null;if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return v!==null?null:l(h,y,""+g,I);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case _f:return g.key===v?s(h,y,g,I):null;case Bl:return g.key===v?f(h,y,g,I):null;case Hr:return g=Po(g),u(h,y,g,I)}if(Rl(g)||kl(g))return v!==null?null:c(h,y,g,I,null);if(typeof g.then=="function")return u(h,y,Qf(g),I);if(g.$$typeof===dr)return u(h,y,Xf(h,g),I);Wf(h,g)}return null}function p(h,y,g,I,v){if(typeof I=="string"&&I!==""||typeof I=="number"||typeof I=="bigint")return h=h.get(g)||null,l(y,h,""+I,v);if(typeof I=="object"&&I!==null){switch(I.$$typeof){case _f:return h=h.get(I.key===null?g:I.key)||null,s(y,h,I,v);case Bl:return h=h.get(I.key===null?g:I.key)||null,f(y,h,I,v);case Hr:return I=Po(I),p(h,y,g,I,v)}if(Rl(I)||kl(I))return h=h.get(g)||null,c(y,h,I,v,null);if(typeof I.then=="function")return p(h,y,g,Qf(I),v);if(I.$$typeof===dr)return p(h,y,g,Xf(y,I),v);Wf(y,I)}return null}function m(h,y,g,I){for(var v=null,S=null,w=y,k=y=0,A=null;w!==null&&k<g.length;k++){w.index>k?(A=w,w=null):A=w.sibling;var R=u(h,w,g[k],I);if(R===null){w===null&&(w=A);break}t&&w&&R.alternate===null&&e(h,w),y=a(R,y,k),S===null?v=R:S.sibling=R,S=R,w=A}if(k===g.length)return n(h,w),ne&&cr(h,k),v;if(w===null){for(;k<g.length;k++)w=d(h,g[k],I),w!==null&&(y=a(w,y,k),S===null?v=w:S.sibling=w,S=w);return ne&&cr(h,k),v}for(w=r(w);k<g.length;k++)A=p(w,h,k,g[k],I),A!==null&&(t&&A.alternate!==null&&w.delete(A.key===null?k:A.key),y=a(A,y,k),S===null?v=A:S.sibling=A,S=A);return t&&w.forEach(function(F){return e(h,F)}),ne&&cr(h,k),v}function x(h,y,g,I){if(g==null)throw Error(T(151));for(var v=null,S=null,w=y,k=y=0,A=null,R=g.next();w!==null&&!R.done;k++,R=g.next()){w.index>k?(A=w,w=null):A=w.sibling;var F=u(h,w,R.value,I);if(F===null){w===null&&(w=A);break}t&&w&&F.alternate===null&&e(h,w),y=a(F,y,k),S===null?v=F:S.sibling=F,S=F,w=A}if(R.done)return n(h,w),ne&&cr(h,k),v;if(w===null){for(;!R.done;k++,R=g.next())R=d(h,R.value,I),R!==null&&(y=a(R,y,k),S===null?v=R:S.sibling=R,S=R);return ne&&cr(h,k),v}for(w=r(w);!R.done;k++,R=g.next())R=p(w,h,k,R.value,I),R!==null&&(t&&R.alternate!==null&&w.delete(R.key===null?k:R.key),y=a(R,y,k),S===null?v=R:S.sibling=R,S=R);return t&&w.forEach(function(L){return e(h,L)}),ne&&cr(h,k),v}function b(h,y,g,I){if(typeof g=="object"&&g!==null&&g.type===Va&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case _f:e:{for(var v=g.key;y!==null;){if(y.key===v){if(v=g.type,v===Va){if(y.tag===7){n(h,y.sibling),I=o(y,g.props.children),I.return=h,h=I;break e}}else if(y.elementType===v||typeof v=="object"&&v!==null&&v.$$typeof===Hr&&Po(v)===y.type){n(h,y.sibling),I=o(y,g.props),Al(I,g),I.return=h,h=I;break e}n(h,y);break}else e(h,y);y=y.sibling}g.type===Va?(I=Uo(g.props.children,h.mode,I,g.key),I.return=h,h=I):(I=ic(g.type,g.key,g.props,null,h.mode,I),Al(I,g),I.return=h,h=I)}return i(h);case Bl:e:{for(v=g.key;y!==null;){if(y.key===v)if(y.tag===4&&y.stateNode.containerInfo===g.containerInfo&&y.stateNode.implementation===g.implementation){n(h,y.sibling),I=o(y,g.children||[]),I.return=h,h=I;break e}else{n(h,y);break}else e(h,y);y=y.sibling}I=Dp(g,h.mode,I),I.return=h,h=I}return i(h);case Hr:return g=Po(g),b(h,y,g,I)}if(Rl(g))return m(h,y,g,I);if(kl(g)){if(v=kl(g),typeof v!="function")throw Error(T(150));return g=v.call(g),x(h,y,g,I)}if(typeof g.then=="function")return b(h,y,Qf(g),I);if(g.$$typeof===dr)return b(h,y,Xf(h,g),I);Wf(h,g)}return typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint"?(g=""+g,y!==null&&y.tag===6?(n(h,y.sibling),I=o(y,g),I.return=h,h=I):(n(h,y),I=Mp(g,h.mode,I),I.return=h,h=I),i(h)):n(h,y)}return function(h,y,g,I){try{ts=0;var v=b(h,y,g,I);return ii=null,v}catch(w){if(w===Si||w===$c)throw w;var S=Ht(29,w,null,h.mode);return S.lanes=I,S.return=h,S}}}var Wo=Xv(!0),Qv=Xv(!1),Ur=!1;function uh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function ym(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function eo(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function to(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,(re&2)!==0){var o=r.pending;return o===null?e.next=e:(e.next=o.next,o.next=e),r.pending=e,e=Sc(t),_v(t,null,n),e}return Jc(t,r,e,n),Sc(t)}function zl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,uv(t,n)}}function Bp(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?o=a=i:a=a.next=i,n=n.next}while(n!==null);a===null?o=a=e:a=a.next=e}else o=a=e;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var bm=!1;function Hl(){if(bm){var t=ai;if(t!==null)throw t}}function Ul(t,e,n,r){bm=!1;var o=t.updateQueue;Ur=!1;var a=o.firstBaseUpdate,i=o.lastBaseUpdate,l=o.shared.pending;if(l!==null){o.shared.pending=null;var s=l,f=s.next;s.next=null,i===null?a=f:i.next=f,i=s;var c=t.alternate;c!==null&&(c=c.updateQueue,l=c.lastBaseUpdate,l!==i&&(l===null?c.firstBaseUpdate=f:l.next=f,c.lastBaseUpdate=s))}if(a!==null){var d=o.baseState;i=0,c=f=s=null,l=a;do{var u=l.lane&-536870913,p=u!==l.lane;if(p?(ee&u)===u:(r&u)===u){u!==0&&u===di&&(bm=!0),c!==null&&(c=c.next={lane:0,tag:l.tag,payload:l.payload,callback:null,next:null});e:{var m=t,x=l;u=e;var b=n;switch(x.tag){case 1:if(m=x.payload,typeof m=="function"){d=m.call(b,d,u);break e}d=m;break e;case 3:m.flags=m.flags&-65537|128;case 0:if(m=x.payload,u=typeof m=="function"?m.call(b,d,u):m,u==null)break e;d=ke({},d,u);break e;case 2:Ur=!0}}u=l.callback,u!==null&&(t.flags|=64,p&&(t.flags|=8192),p=o.callbacks,p===null?o.callbacks=[u]:p.push(u))}else p={lane:u,tag:l.tag,payload:l.payload,callback:l.callback,next:null},c===null?(f=c=p,s=d):c=c.next=p,i|=u;if(l=l.next,l===null){if(l=o.shared.pending,l===null)break;p=l,l=p.next,p.next=null,o.lastBaseUpdate=p,o.shared.pending=null}}while(!0);c===null&&(s=d),o.baseState=s,o.firstBaseUpdate=f,o.lastBaseUpdate=c,a===null&&(o.shared.lanes=0),co|=i,t.lanes=i,t.memoizedState=d}}function Wv(t,e){if(typeof t!="function")throw Error(T(191,t));t.call(e)}function Kv(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)Wv(n[t],e)}var pi=Xn(null),Tc=Xn(0);function oI(t,e){t=wr,ge(Tc,t),ge(pi,e),wr=t|e.baseLanes}function Im(){ge(Tc,wr),ge(pi,pi.current)}function dh(){wr=Tc.current,Ye(pi),Ye(Tc)}var Wt=Xn(null),dn=null;function Vr(t){var e=t.alternate;ge(Le,Le.current&1),ge(Wt,t),dn===null&&(e===null||pi.current!==null||e.memoizedState!==null)&&(dn=t)}function vm(t){ge(Le,Le.current),ge(Wt,t),dn===null&&(dn=t)}function Yv(t){t.tag===22?(ge(Le,Le.current),ge(Wt,t),dn===null&&(dn=t)):Gr(t)}function Gr(){ge(Le,Le.current),ge(Wt,Wt.current)}function zt(t){Ye(Wt),dn===t&&(dn=null),Ye(Le)}var Le=Xn(0);function Mc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||zm(n)||Hm(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var br=0,X=null,ue=null,Pe=null,Dc=!1,li=!1,Ko=!1,Oc=0,ns=0,si=null,xB=0;function Re(){throw Error(T(321))}function ph(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Qt(t[n],e[n]))return!1;return!0}function mh(t,e,n,r,o,a){return br=a,X=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,j.H=t===null||t.memoizedState===null?T1:Ch,Ko=!1,a=n(r,o),Ko=!1,li&&(a=$v(e,n,r,o)),Jv(t),a}function Jv(t){j.H=rs;var e=ue!==null&&ue.next!==null;if(br=0,Pe=ue=X=null,Dc=!1,ns=0,si=null,e)throw Error(T(300));t===null||Ue||(t=t.dependencies,t!==null&&Cc(t)&&(Ue=!0))}function $v(t,e,n,r){X=t;var o=0;do{if(li&&(si=null),ns=0,li=!1,25<=o)throw Error(T(301));if(o+=1,Pe=ue=null,t.updateQueue!=null){var a=t.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}j.H=M1,a=e(n,r)}while(li);return a}function gB(){var t=j.H,e=t.useState()[0];return e=typeof e.then=="function"?xs(e):e,t=t.useState()[0],(ue!==null?ue.memoizedState:null)!==t&&(X.flags|=1024),e}function hh(){var t=Oc!==0;return Oc=0,t}function xh(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function gh(t){if(Dc){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Dc=!1}br=0,Pe=ue=X=null,li=!1,ns=Oc=0,si=null}function gt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Pe===null?X.memoizedState=Pe=t:Pe=Pe.next=t,Pe}function Ne(){if(ue===null){var t=X.alternate;t=t!==null?t.memoizedState:null}else t=ue.next;var e=Pe===null?X.memoizedState:Pe.next;if(e!==null)Pe=e,ue=t;else{if(t===null)throw X.alternate===null?Error(T(467)):Error(T(310));ue=t,t={memoizedState:ue.memoizedState,baseState:ue.baseState,baseQueue:ue.baseQueue,queue:ue.queue,next:null},Pe===null?X.memoizedState=Pe=t:Pe=Pe.next=t}return Pe}function Zc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function xs(t){var e=ns;return ns+=1,si===null&&(si=[]),t=Gv(si,t,e),e=X,(Pe===null?e.memoizedState:Pe.next)===null&&(e=e.alternate,j.H=e===null||e.memoizedState===null?T1:Ch),t}function eu(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return xs(t);if(t.$$typeof===dr)return at(t)}throw Error(T(438,String(t)))}function yh(t){var e=null,n=X.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var r=X.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(e={data:r.data.map(function(o){return o.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Zc(),X.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),r=0;r<t;r++)n[r]=nO;return e.index++,n}function Ir(t,e){return typeof e=="function"?e(t):e}function sc(t){var e=Ne();return bh(e,ue,t)}function bh(t,e,n){var r=t.queue;if(r===null)throw Error(T(311));r.lastRenderedReducer=n;var o=t.baseQueue,a=r.pending;if(a!==null){if(o!==null){var i=o.next;o.next=a.next,a.next=i}e.baseQueue=o=a,r.pending=null}if(a=t.baseState,o===null)t.memoizedState=a;else{e=o.next;var l=i=null,s=null,f=e,c=!1;do{var d=f.lane&-536870913;if(d!==f.lane?(ee&d)===d:(br&d)===d){var u=f.revertLane;if(u===0)s!==null&&(s=s.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),d===di&&(c=!0);else if((br&u)===u){f=f.next,u===di&&(c=!0);continue}else d={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=d,i=a):s=s.next=d,X.lanes|=u,co|=u;d=f.action,Ko&&n(a,d),a=f.hasEagerState?f.eagerState:n(a,d)}else u={lane:d,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},s===null?(l=s=u,i=a):s=s.next=u,X.lanes|=d,co|=d;f=f.next}while(f!==null&&f!==e);if(s===null?i=a:s.next=l,!Qt(a,t.memoizedState)&&(Ue=!0,c&&(n=ai,n!==null)))throw n;t.memoizedState=a,t.baseState=i,t.baseQueue=s,r.lastRenderedState=a}return o===null&&(r.lanes=0),[t.memoizedState,r.dispatch]}function Rp(t){var e=Ne(),n=e.queue;if(n===null)throw Error(T(311));n.lastRenderedReducer=t;var r=n.dispatch,o=n.pending,a=e.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do a=t(a,i.action),i=i.next;while(i!==o);Qt(a,e.memoizedState)||(Ue=!0),e.memoizedState=a,e.baseQueue===null&&(e.baseState=a),n.lastRenderedState=a}return[a,r]}function Zv(t,e,n){var r=X,o=Ne(),a=ne;if(a){if(n===void 0)throw Error(T(407));n=n()}else n=e();var i=!Qt((ue||o).memoizedState,n);if(i&&(o.memoizedState=n,Ue=!0),o=o.queue,Ih(n1.bind(null,r,o,t),[t]),o.getSnapshot!==e||i||Pe!==null&&Pe.memoizedState.tag&1){if(r.flags|=2048,mi(9,{destroy:void 0},t1.bind(null,r,o,n,e),null),de===null)throw Error(T(349));a||(br&127)!==0||e1(r,e,n)}return n}function e1(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=X.updateQueue,e===null?(e=Zc(),X.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function t1(t,e,n,r){e.value=n,e.getSnapshot=r,r1(e)&&o1(t)}function n1(t,e,n){return n(function(){r1(e)&&o1(t)})}function r1(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Qt(t,n)}catch{return!0}}function o1(t){var e=ea(t,2);e!==null&&Mt(e,t,2)}function wm(t){var e=gt();if(typeof t=="function"){var n=t;if(t=n(),Ko){Qr(!0);try{n()}finally{Qr(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ir,lastRenderedState:t},e}function a1(t,e,n,r){return t.baseState=n,bh(t,ue,typeof r=="function"?r:Ir)}function yB(t,e,n,r,o){if(nu(t))throw Error(T(485));if(t=e.action,t!==null){var a={payload:o,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){a.listeners.push(i)}};j.T!==null?n(!0):a.isTransition=!1,r(a),n=e.pending,n===null?(a.next=e.pending=a,i1(e,a)):(a.next=n.next,e.pending=n.next=a)}}function i1(t,e){var n=e.action,r=e.payload,o=t.state;if(e.isTransition){var a=j.T,i={};j.T=i;try{var l=n(o,r),s=j.S;s!==null&&s(i,l),aI(t,e,l)}catch(f){Sm(t,e,f)}finally{a!==null&&i.types!==null&&(a.types=i.types),j.T=a}}else try{a=n(o,r),aI(t,e,a)}catch(f){Sm(t,e,f)}}function aI(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(r){iI(t,e,r)},function(r){return Sm(t,e,r)}):iI(t,e,n)}function iI(t,e,n){e.status="fulfilled",e.value=n,l1(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,i1(t,n)))}function Sm(t,e,n){var r=t.pending;if(t.pending=null,r!==null){r=r.next;do e.status="rejected",e.reason=n,l1(e),e=e.next;while(e!==r)}t.action=null}function l1(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function s1(t,e){return e}function lI(t,e){if(ne){var n=de.formState;if(n!==null){e:{var r=X;if(ne){if(Se){t:{for(var o=Se,a=un;o.nodeType!==8;){if(!a){o=null;break t}if(o=pn(o.nextSibling),o===null){o=null;break t}}a=o.data,o=a==="F!"||a==="F"?o:null}if(o){Se=pn(o.nextSibling),r=o.data==="F!";break e}}so(r)}r=!1}r&&(e=n[0])}}return n=gt(),n.memoizedState=n.baseState=e,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:s1,lastRenderedState:e},n.queue=r,n=k1.bind(null,X,r),r.dispatch=n,r=wm(!1),a=kh.bind(null,X,!1,r.queue),r=gt(),o={state:e,dispatch:null,action:t,pending:null},r.queue=o,n=yB.bind(null,X,o,a,n),o.dispatch=n,r.memoizedState=t,[e,n,!1]}function sI(t){var e=Ne();return f1(e,ue,t)}function f1(t,e,n){if(e=bh(t,e,s1)[0],t=sc(Ir)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var r=xs(e)}catch(i){throw i===Si?$c:i}else r=e;e=Ne();var o=e.queue,a=o.dispatch;return n!==e.memoizedState&&(X.flags|=2048,mi(9,{destroy:void 0},bB.bind(null,o,n),null)),[r,a,t]}function bB(t,e){t.action=e}function fI(t){var e=Ne(),n=ue;if(n!==null)return f1(e,n,t);Ne(),e=e.memoizedState,n=Ne();var r=n.queue.dispatch;return n.memoizedState=t,[e,r,!1]}function mi(t,e,n,r){return t={tag:t,create:n,deps:r,inst:e,next:null},e=X.updateQueue,e===null&&(e=Zc(),X.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t),t}function c1(){return Ne().memoizedState}function fc(t,e,n,r){var o=gt();X.flags|=t,o.memoizedState=mi(1|e,{destroy:void 0},n,r===void 0?null:r)}function tu(t,e,n,r){var o=Ne();r=r===void 0?null:r;var a=o.memoizedState.inst;ue!==null&&r!==null&&ph(r,ue.memoizedState.deps)?o.memoizedState=mi(e,a,n,r):(X.flags|=t,o.memoizedState=mi(1|e,a,n,r))}function cI(t,e){fc(8390656,8,t,e)}function Ih(t,e){tu(2048,8,t,e)}function IB(t){X.flags|=4;var e=X.updateQueue;if(e===null)e=Zc(),X.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function u1(t){var e=Ne().memoizedState;return IB({ref:e,nextImpl:t}),function(){if((re&2)!==0)throw Error(T(440));return e.impl.apply(void 0,arguments)}}function d1(t,e){return tu(4,2,t,e)}function p1(t,e){return tu(4,4,t,e)}function m1(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function h1(t,e,n){n=n!=null?n.concat([t]):null,tu(4,4,m1.bind(null,e,t),n)}function vh(){}function x1(t,e){var n=Ne();e=e===void 0?null:e;var r=n.memoizedState;return e!==null&&ph(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function g1(t,e){var n=Ne();e=e===void 0?null:e;var r=n.memoizedState;if(e!==null&&ph(e,r[1]))return r[0];if(r=t(),Ko){Qr(!0);try{t()}finally{Qr(!1)}}return n.memoizedState=[r,e],r}function wh(t,e,n){return n===void 0||(br&1073741824)!==0&&(ee&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=aw(),X.lanes|=t,co|=t,n)}function y1(t,e,n,r){return Qt(n,e)?n:pi.current!==null?(t=wh(t,n,r),Qt(t,e)||(Ue=!0),t):(br&42)===0||(br&1073741824)!==0&&(ee&261930)===0?(Ue=!0,t.memoizedState=n):(t=aw(),X.lanes|=t,co|=t,e)}function b1(t,e,n,r,o){var a=oe.p;oe.p=a!==0&&8>a?a:8;var i=j.T,l={};j.T=l,kh(t,!1,e,n);try{var s=o(),f=j.S;if(f!==null&&f(l,s),s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=hB(s,r);jl(t,e,c,Xt(t))}else jl(t,e,r,Xt(t))}catch(d){jl(t,e,{then:function(){},status:"rejected",reason:d},Xt())}finally{oe.p=a,i!==null&&l.types!==null&&(i.types=l.types),j.T=i}}function vB(){}function km(t,e,n,r){if(t.tag!==5)throw Error(T(476));var o=I1(t).queue;b1(t,o,e,Ho,n===null?vB:function(){return v1(t),n(r)})}function I1(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Ho,baseState:Ho,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ir,lastRenderedState:Ho},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ir,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function v1(t){var e=I1(t);e.next===null&&(e=t.alternate.memoizedState),jl(t,e.next.queue,{},Xt())}function Sh(){return at(is)}function w1(){return Ne().memoizedState}function S1(){return Ne().memoizedState}function wB(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Xt();t=eo(n);var r=to(e,t,n);r!==null&&(Mt(r,e,n),zl(r,e,n)),e={cache:sh()},t.payload=e;return}e=e.return}}function SB(t,e,n){var r=Xt();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},nu(t)?C1(e,n):(n=oh(t,e,n,r),n!==null&&(Mt(n,t,r),A1(n,e,r)))}function k1(t,e,n){var r=Xt();jl(t,e,n,r)}function jl(t,e,n,r){var o={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(nu(t))C1(e,o);else{var a=t.alternate;if(t.lanes===0&&(a===null||a.lanes===0)&&(a=e.lastRenderedReducer,a!==null))try{var i=e.lastRenderedState,l=a(i,n);if(o.hasEagerState=!0,o.eagerState=l,Qt(l,i))return Jc(t,e,o,0),de===null&&Yc(),!1}catch{}if(n=oh(t,e,o,r),n!==null)return Mt(n,t,r),A1(n,e,r),!0}return!1}function kh(t,e,n,r){if(r={lane:2,revertLane:Eh(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},nu(t)){if(e)throw Error(T(479))}else e=oh(t,n,r,2),e!==null&&Mt(e,t,2)}function nu(t){var e=t.alternate;return t===X||e!==null&&e===X}function C1(t,e){li=Dc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function A1(t,e,n){if((n&4194048)!==0){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,uv(t,n)}}var rs={readContext:at,use:eu,useCallback:Re,useContext:Re,useEffect:Re,useImperativeHandle:Re,useLayoutEffect:Re,useInsertionEffect:Re,useMemo:Re,useReducer:Re,useRef:Re,useState:Re,useDebugValue:Re,useDeferredValue:Re,useTransition:Re,useSyncExternalStore:Re,useId:Re,useHostTransitionStatus:Re,useFormState:Re,useActionState:Re,useOptimistic:Re,useMemoCache:Re,useCacheRefresh:Re};rs.useEffectEvent=Re;var T1={readContext:at,use:eu,useCallback:function(t,e){return gt().memoizedState=[t,e===void 0?null:e],t},useContext:at,useEffect:cI,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,fc(4194308,4,m1.bind(null,e,t),n)},useLayoutEffect:function(t,e){return fc(4194308,4,t,e)},useInsertionEffect:function(t,e){fc(4,2,t,e)},useMemo:function(t,e){var n=gt();e=e===void 0?null:e;var r=t();if(Ko){Qr(!0);try{t()}finally{Qr(!1)}}return n.memoizedState=[r,e],r},useReducer:function(t,e,n){var r=gt();if(n!==void 0){var o=n(e);if(Ko){Qr(!0);try{n(e)}finally{Qr(!1)}}}else o=e;return r.memoizedState=r.baseState=o,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:o},r.queue=t,t=t.dispatch=SB.bind(null,X,t),[r.memoizedState,t]},useRef:function(t){var e=gt();return t={current:t},e.memoizedState=t},useState:function(t){t=wm(t);var e=t.queue,n=k1.bind(null,X,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:vh,useDeferredValue:function(t,e){var n=gt();return wh(n,t,e)},useTransition:function(){var t=wm(!1);return t=b1.bind(null,X,t.queue,!0,!1),gt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var r=X,o=gt();if(ne){if(n===void 0)throw Error(T(407));n=n()}else{if(n=e(),de===null)throw Error(T(349));(ee&127)!==0||e1(r,e,n)}o.memoizedState=n;var a={value:n,getSnapshot:e};return o.queue=a,cI(n1.bind(null,r,a,t),[t]),r.flags|=2048,mi(9,{destroy:void 0},t1.bind(null,r,a,n,e),null),n},useId:function(){var t=gt(),e=de.identifierPrefix;if(ne){var n=jn,r=Un;n=(r&~(1<<32-Gt(r)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Oc++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=xB++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Sh,useFormState:lI,useActionState:lI,useOptimistic:function(t){var e=gt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=kh.bind(null,X,!0,n),n.dispatch=e,[t,e]},useMemoCache:yh,useCacheRefresh:function(){return gt().memoizedState=wB.bind(null,X)},useEffectEvent:function(t){var e=gt(),n={impl:t};return e.memoizedState=n,function(){if((re&2)!==0)throw Error(T(440));return n.impl.apply(void 0,arguments)}}},Ch={readContext:at,use:eu,useCallback:x1,useContext:at,useEffect:Ih,useImperativeHandle:h1,useInsertionEffect:d1,useLayoutEffect:p1,useMemo:g1,useReducer:sc,useRef:c1,useState:function(){return sc(Ir)},useDebugValue:vh,useDeferredValue:function(t,e){var n=Ne();return y1(n,ue.memoizedState,t,e)},useTransition:function(){var t=sc(Ir)[0],e=Ne().memoizedState;return[typeof t=="boolean"?t:xs(t),e]},useSyncExternalStore:Zv,useId:w1,useHostTransitionStatus:Sh,useFormState:sI,useActionState:sI,useOptimistic:function(t,e){var n=Ne();return a1(n,ue,t,e)},useMemoCache:yh,useCacheRefresh:S1};Ch.useEffectEvent=u1;var M1={readContext:at,use:eu,useCallback:x1,useContext:at,useEffect:Ih,useImperativeHandle:h1,useInsertionEffect:d1,useLayoutEffect:p1,useMemo:g1,useReducer:Rp,useRef:c1,useState:function(){return Rp(Ir)},useDebugValue:vh,useDeferredValue:function(t,e){var n=Ne();return ue===null?wh(n,t,e):y1(n,ue.memoizedState,t,e)},useTransition:function(){var t=Rp(Ir)[0],e=Ne().memoizedState;return[typeof t=="boolean"?t:xs(t),e]},useSyncExternalStore:Zv,useId:w1,useHostTransitionStatus:Sh,useFormState:fI,useActionState:fI,useOptimistic:function(t,e){var n=Ne();return ue!==null?a1(n,ue,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:yh,useCacheRefresh:S1};M1.useEffectEvent=u1;function Ep(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:ke({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Cm={enqueueSetState:function(t,e,n){t=t._reactInternals;var r=Xt(),o=eo(r);o.payload=e,n!=null&&(o.callback=n),e=to(t,o,r),e!==null&&(Mt(e,t,r),zl(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=Xt(),o=eo(r);o.tag=1,o.payload=e,n!=null&&(o.callback=n),e=to(t,o,r),e!==null&&(Mt(e,t,r),zl(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Xt(),r=eo(n);r.tag=2,e!=null&&(r.callback=e),e=to(t,r,n),e!==null&&(Mt(e,t,n),zl(e,t,n))}};function uI(t,e,n,r,o,a,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,a,i):e.prototype&&e.prototype.isPureReactComponent?!$l(n,r)||!$l(o,a):!0}function dI(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Cm.enqueueReplaceState(e,e.state,null)}function Yo(t,e){var n=e;if("ref"in e){n={};for(var r in e)r!=="ref"&&(n[r]=e[r])}if(t=t.defaultProps){n===e&&(n=ke({},n));for(var o in t)n[o]===void 0&&(n[o]=t[o])}return n}function D1(t){wc(t)}function O1(t){console.error(t)}function B1(t){wc(t)}function Bc(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(r){setTimeout(function(){throw r})}}function pI(t,e,n){try{var r=t.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Am(t,e,n){return n=eo(n),n.tag=3,n.payload={element:null},n.callback=function(){Bc(t,e)},n}function R1(t){return t=eo(t),t.tag=3,t}function E1(t,e,n,r){var o=n.type.getDerivedStateFromError;if(typeof o=="function"){var a=r.value;t.payload=function(){return o(a)},t.callback=function(){pI(e,n,r)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){pI(e,n,r),typeof o!="function"&&(no===null?no=new Set([this]):no.add(this));var l=r.stack;this.componentDidCatch(r.value,{componentStack:l!==null?l:""})})}function kB(t,e,n,r,o){if(n.flags|=32768,r!==null&&typeof r=="object"&&typeof r.then=="function"){if(e=n.alternate,e!==null&&wi(e,n,o,!0),n=Wt.current,n!==null){switch(n.tag){case 31:case 13:return dn===null?Nc():n.alternate===null&&Ee===0&&(Ee=3),n.flags&=-257,n.flags|=65536,n.lanes=o,r===Ac?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([r]):e.add(r),Vp(t,r,o)),!1;case 22:return n.flags|=65536,r===Ac?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([r]):n.add(r)),Vp(t,r,o)),!1}throw Error(T(435,n.tag))}return Vp(t,r,o),Nc(),!1}if(ne)return e=Wt.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=o,r!==pm&&(t=Error(T(422),{cause:r}),es(cn(t,n)))):(r!==pm&&(e=Error(T(423),{cause:r}),es(cn(e,n))),t=t.current.alternate,t.flags|=65536,o&=-o,t.lanes|=o,r=cn(r,n),o=Am(t.stateNode,r,o),Bp(t,o),Ee!==4&&(Ee=2)),!1;var a=Error(T(520),{cause:r});if(a=cn(a,n),Xl===null?Xl=[a]:Xl.push(a),Ee!==4&&(Ee=2),e===null)return!0;r=cn(r,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=o&-o,n.lanes|=t,t=Am(n.stateNode,r,t),Bp(n,t),!1;case 1:if(e=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(no===null||!no.has(a))))return n.flags|=65536,o&=-o,n.lanes|=o,o=R1(o),E1(o,t,n,r),Bp(n,o),!1}n=n.return}while(n!==null);return!1}var Ah=Error(T(461)),Ue=!1;function nt(t,e,n,r){e.child=t===null?Qv(e,null,n,r):Wo(e,t.child,n,r)}function mI(t,e,n,r,o){n=n.render;var a=e.ref;if("ref"in r){var i={};for(var l in r)l!=="ref"&&(i[l]=r[l])}else i=r;return Qo(e),r=mh(t,e,n,i,a,o),l=hh(),t!==null&&!Ue?(xh(t,e,o),vr(t,e,o)):(ne&&l&&ih(e),e.flags|=1,nt(t,e,r,o),e.child)}function hI(t,e,n,r,o){if(t===null){var a=n.type;return typeof a=="function"&&!ah(a)&&a.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=a,F1(t,e,a,r,o)):(t=ic(n.type,null,r,e,e.mode,o),t.ref=e.ref,t.return=e,e.child=t)}if(a=t.child,!Th(t,o)){var i=a.memoizedProps;if(n=n.compare,n=n!==null?n:$l,n(i,r)&&t.ref===e.ref)return vr(t,e,o)}return e.flags|=1,t=hr(a,r),t.ref=e.ref,t.return=e,e.child=t}function F1(t,e,n,r,o){if(t!==null){var a=t.memoizedProps;if($l(a,r)&&t.ref===e.ref)if(Ue=!1,e.pendingProps=r=a,Th(t,o))(t.flags&131072)!==0&&(Ue=!0);else return e.lanes=t.lanes,vr(t,e,o)}return Tm(t,e,n,r,o)}function L1(t,e,n,r){var o=r.children,a=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode==="hidden"){if((e.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,t!==null){for(r=e.child=t.child,o=0;r!==null;)o=o|r.lanes|r.childLanes,r=r.sibling;r=o&~a}else r=0,e.child=null;return xI(t,e,a,n,r)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&lc(e,a!==null?a.cachePool:null),a!==null?oI(e,a):Im(),Yv(e);else return r=e.lanes=536870912,xI(t,e,a!==null?a.baseLanes|n:n,n,r)}else a!==null?(lc(e,a.cachePool),oI(e,a),Gr(e),e.memoizedState=null):(t!==null&&lc(e,null),Im(),Gr(e));return nt(t,e,o,n),e.child}function Fl(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function xI(t,e,n,r,o){var a=fh();return a=a===null?null:{parent:He._currentValue,pool:a},e.memoizedState={baseLanes:n,cachePool:a},t!==null&&lc(e,null),Im(),Yv(e),t!==null&&wi(t,e,r,!0),e.childLanes=o,null}function cc(t,e){return e=Rc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function gI(t,e,n){return Wo(e,t.child,null,n),t=cc(e,e.pendingProps),t.flags|=2,zt(e),e.memoizedState=null,t}function CB(t,e,n){var r=e.pendingProps,o=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(ne){if(r.mode==="hidden")return t=cc(e,r),e.lanes=536870912,Fl(null,t);if(vm(e),(t=Se)?(t=Tw(t,un),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:lo!==null?{id:Un,overflow:jn}:null,retryLane:536870912,hydrationErrors:null},n=zv(t),n.return=e,e.child=n,ot=e,Se=null)):t=null,t===null)throw so(e);return e.lanes=536870912,null}return cc(e,r)}var a=t.memoizedState;if(a!==null){var i=a.dehydrated;if(vm(e),o)if(e.flags&256)e.flags&=-257,e=gI(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(T(558));else if(Ue||wi(t,e,n,!1),o=(n&t.childLanes)!==0,Ue||o){if(r=de,r!==null&&(i=dv(r,n),i!==0&&i!==a.retryLane))throw a.retryLane=i,ea(t,i),Mt(r,t,i),Ah;Nc(),e=gI(t,e,n)}else t=a.treeContext,Se=pn(i.nextSibling),ot=e,ne=!0,Zr=null,un=!1,t!==null&&Uv(e,t),e=cc(e,r),e.flags|=4096;return e}return t=hr(t.child,{mode:r.mode,children:r.children}),t.ref=e.ref,e.child=t,t.return=e,t}function uc(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(T(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Tm(t,e,n,r,o){return Qo(e),n=mh(t,e,n,r,void 0,o),r=hh(),t!==null&&!Ue?(xh(t,e,o),vr(t,e,o)):(ne&&r&&ih(e),e.flags|=1,nt(t,e,n,o),e.child)}function yI(t,e,n,r,o,a){return Qo(e),e.updateQueue=null,n=$v(e,r,n,o),Jv(t),r=hh(),t!==null&&!Ue?(xh(t,e,a),vr(t,e,a)):(ne&&r&&ih(e),e.flags|=1,nt(t,e,n,a),e.child)}function bI(t,e,n,r,o){if(Qo(e),e.stateNode===null){var a=$a,i=n.contextType;typeof i=="object"&&i!==null&&(a=at(i)),a=new n(r,a),e.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Cm,e.stateNode=a,a._reactInternals=e,a=e.stateNode,a.props=r,a.state=e.memoizedState,a.refs={},uh(e),i=n.contextType,a.context=typeof i=="object"&&i!==null?at(i):$a,a.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Ep(e,n,i,r),a.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(i=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),i!==a.state&&Cm.enqueueReplaceState(a,a.state,null),Ul(e,r,a,o),Hl(),a.state=e.memoizedState),typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!0}else if(t===null){a=e.stateNode;var l=e.memoizedProps,s=Yo(n,l);a.props=s;var f=a.context,c=n.contextType;i=$a,typeof c=="object"&&c!==null&&(i=at(c));var d=n.getDerivedStateFromProps;c=typeof d=="function"||typeof a.getSnapshotBeforeUpdate=="function",l=e.pendingProps!==l,c||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(l||f!==i)&&dI(e,a,r,i),Ur=!1;var u=e.memoizedState;a.state=u,Ul(e,r,a,o),Hl(),f=e.memoizedState,l||u!==f||Ur?(typeof d=="function"&&(Ep(e,n,d,r),f=e.memoizedState),(s=Ur||uI(e,n,s,r,u,f,i))?(c||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=f),a.props=r,a.state=f,a.context=i,r=s):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{a=e.stateNode,ym(t,e),i=e.memoizedProps,c=Yo(n,i),a.props=c,d=e.pendingProps,u=a.context,f=n.contextType,s=$a,typeof f=="object"&&f!==null&&(s=at(f)),l=n.getDerivedStateFromProps,(f=typeof l=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(i!==d||u!==s)&&dI(e,a,r,s),Ur=!1,u=e.memoizedState,a.state=u,Ul(e,r,a,o),Hl();var p=e.memoizedState;i!==d||u!==p||Ur||t!==null&&t.dependencies!==null&&Cc(t.dependencies)?(typeof l=="function"&&(Ep(e,n,l,r),p=e.memoizedState),(c=Ur||uI(e,n,c,r,u,p,s)||t!==null&&t.dependencies!==null&&Cc(t.dependencies))?(f||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(r,p,s),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(r,p,s)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&u===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&u===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=p),a.props=r,a.state=p,a.context=s,r=c):(typeof a.componentDidUpdate!="function"||i===t.memoizedProps&&u===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&u===t.memoizedState||(e.flags|=1024),r=!1)}return a=r,uc(t,e),r=(e.flags&128)!==0,a||r?(a=e.stateNode,n=r&&typeof n.getDerivedStateFromError!="function"?null:a.render(),e.flags|=1,t!==null&&r?(e.child=Wo(e,t.child,null,o),e.child=Wo(e,null,n,o)):nt(t,e,n,o),e.memoizedState=a.state,t=e.child):t=vr(t,e,o),t}function II(t,e,n,r){return Xo(),e.flags|=256,nt(t,e,n,r),e.child}var Fp={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Lp(t){return{baseLanes:t,cachePool:Vv()}}function Np(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Ut),t}function N1(t,e,n){var r=e.pendingProps,o=!1,a=(e.flags&128)!==0,i;if((i=a)||(i=t!==null&&t.memoizedState===null?!1:(Le.current&2)!==0),i&&(o=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(ne){if(o?Vr(e):Gr(e),(t=Se)?(t=Tw(t,un),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:lo!==null?{id:Un,overflow:jn}:null,retryLane:536870912,hydrationErrors:null},n=zv(t),n.return=e,e.child=n,ot=e,Se=null)):t=null,t===null)throw so(e);return Hm(t)?e.lanes=32:e.lanes=536870912,null}var l=r.children;return r=r.fallback,o?(Gr(e),o=e.mode,l=Rc({mode:"hidden",children:l},o),r=Uo(r,o,n,null),l.return=e,r.return=e,l.sibling=r,e.child=l,r=e.child,r.memoizedState=Lp(n),r.childLanes=Np(t,i,n),e.memoizedState=Fp,Fl(null,r)):(Vr(e),Mm(e,l))}var s=t.memoizedState;if(s!==null&&(l=s.dehydrated,l!==null)){if(a)e.flags&256?(Vr(e),e.flags&=-257,e=qp(t,e,n)):e.memoizedState!==null?(Gr(e),e.child=t.child,e.flags|=128,e=null):(Gr(e),l=r.fallback,o=e.mode,r=Rc({mode:"visible",children:r.children},o),l=Uo(l,o,n,null),l.flags|=2,r.return=e,l.return=e,r.sibling=l,e.child=r,Wo(e,t.child,null,n),r=e.child,r.memoizedState=Lp(n),r.childLanes=Np(t,i,n),e.memoizedState=Fp,e=Fl(null,r));else if(Vr(e),Hm(l)){if(i=l.nextSibling&&l.nextSibling.dataset,i)var f=i.dgst;i=f,r=Error(T(419)),r.stack="",r.digest=i,es({value:r,source:null,stack:null}),e=qp(t,e,n)}else if(Ue||wi(t,e,n,!1),i=(n&t.childLanes)!==0,Ue||i){if(i=de,i!==null&&(r=dv(i,n),r!==0&&r!==s.retryLane))throw s.retryLane=r,ea(t,r),Mt(i,t,r),Ah;zm(l)||Nc(),e=qp(t,e,n)}else zm(l)?(e.flags|=192,e.child=t.child,e=null):(t=s.treeContext,Se=pn(l.nextSibling),ot=e,ne=!0,Zr=null,un=!1,t!==null&&Uv(e,t),e=Mm(e,r.children),e.flags|=4096);return e}return o?(Gr(e),l=r.fallback,o=e.mode,s=t.child,f=s.sibling,r=hr(s,{mode:"hidden",children:r.children}),r.subtreeFlags=s.subtreeFlags&65011712,f!==null?l=hr(f,l):(l=Uo(l,o,n,null),l.flags|=2),l.return=e,r.return=e,r.sibling=l,e.child=r,Fl(null,r),r=e.child,l=t.child.memoizedState,l===null?l=Lp(n):(o=l.cachePool,o!==null?(s=He._currentValue,o=o.parent!==s?{parent:s,pool:s}:o):o=Vv(),l={baseLanes:l.baseLanes|n,cachePool:o}),r.memoizedState=l,r.childLanes=Np(t,i,n),e.memoizedState=Fp,Fl(t.child,r)):(Vr(e),n=t.child,t=n.sibling,n=hr(n,{mode:"visible",children:r.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Mm(t,e){return e=Rc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Rc(t,e){return t=Ht(22,t,null,e),t.lanes=0,t}function qp(t,e,n){return Wo(e,t.child,null,n),t=Mm(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function vI(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),hm(t.return,e,n)}function _p(t,e,n,r,o,a){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o,treeForkCount:a}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=o,i.treeForkCount=a)}function q1(t,e,n){var r=e.pendingProps,o=r.revealOrder,a=r.tail;r=r.children;var i=Le.current,l=(i&2)!==0;if(l?(i=i&1|2,e.flags|=128):i&=1,ge(Le,i),nt(t,e,r,n),r=ne?Zl:0,!l&&t!==null&&(t.flags&128)!==0)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&vI(t,n,e);else if(t.tag===19)vI(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(o){case"forwards":for(n=e.child,o=null;n!==null;)t=n.alternate,t!==null&&Mc(t)===null&&(o=n),n=n.sibling;n=o,n===null?(o=e.child,e.child=null):(o=n.sibling,n.sibling=null),_p(e,!1,o,n,a,r);break;case"backwards":case"unstable_legacy-backwards":for(n=null,o=e.child,e.child=null;o!==null;){if(t=o.alternate,t!==null&&Mc(t)===null){e.child=o;break}t=o.sibling,o.sibling=n,n=o,o=t}_p(e,!0,n,null,a,r);break;case"together":_p(e,!1,null,null,void 0,r);break;default:e.memoizedState=null}return e.child}function vr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),co|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(wi(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(T(153));if(e.child!==null){for(t=e.child,n=hr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=hr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Th(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&Cc(t)))}function AB(t,e,n){switch(e.tag){case 3:yc(e,e.stateNode.containerInfo),jr(e,He,t.memoizedState.cache),Xo();break;case 27:case 5:nm(e);break;case 4:yc(e,e.stateNode.containerInfo);break;case 10:jr(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,vm(e),null;break;case 13:var r=e.memoizedState;if(r!==null)return r.dehydrated!==null?(Vr(e),e.flags|=128,null):(n&e.child.childLanes)!==0?N1(t,e,n):(Vr(e),t=vr(t,e,n),t!==null?t.sibling:null);Vr(e);break;case 19:var o=(t.flags&128)!==0;if(r=(n&e.childLanes)!==0,r||(wi(t,e,n,!1),r=(n&e.childLanes)!==0),o){if(r)return q1(t,e,n);e.flags|=128}if(o=e.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),ge(Le,Le.current),r)break;return null;case 22:return e.lanes=0,L1(t,e,n,e.pendingProps);case 24:jr(e,He,t.memoizedState.cache)}return vr(t,e,n)}function _1(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Ue=!0;else{if(!Th(t,n)&&(e.flags&128)===0)return Ue=!1,AB(t,e,n);Ue=(t.flags&131072)!==0}else Ue=!1,ne&&(e.flags&1048576)!==0&&Hv(e,Zl,e.index);switch(e.lanes=0,e.tag){case 16:e:{var r=e.pendingProps;if(t=Po(e.elementType),e.type=t,typeof t=="function")ah(t)?(r=Yo(t,r),e.tag=1,e=bI(null,e,t,r,n)):(e.tag=0,e=Tm(null,e,t,r,n));else{if(t!=null){var o=t.$$typeof;if(o===Gm){e.tag=11,e=mI(null,e,t,r,n);break e}else if(o===Xm){e.tag=14,e=hI(null,e,t,r,n);break e}}throw e=em(t)||t,Error(T(306,e,""))}}return e;case 0:return Tm(t,e,e.type,e.pendingProps,n);case 1:return r=e.type,o=Yo(r,e.pendingProps),bI(t,e,r,o,n);case 3:e:{if(yc(e,e.stateNode.containerInfo),t===null)throw Error(T(387));r=e.pendingProps;var a=e.memoizedState;o=a.element,ym(t,e),Ul(e,r,null,n);var i=e.memoizedState;if(r=i.cache,jr(e,He,r),r!==a.cache&&xm(e,[He],n,!0),Hl(),r=i.element,a.isDehydrated)if(a={element:r,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=a,e.memoizedState=a,e.flags&256){e=II(t,e,r,n);break e}else if(r!==o){o=cn(Error(T(424)),e),es(o),e=II(t,e,r,n);break e}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,Se=pn(t.firstChild),ot=e,ne=!0,Zr=null,un=!0,n=Qv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Xo(),r===o){e=vr(t,e,n);break e}nt(t,e,r,n)}e=e.child}return e;case 26:return uc(t,e),t===null?(n=jI(e.type,null,e.pendingProps,null))?e.memoizedState=n:ne||(n=e.type,t=e.pendingProps,r=zc($r.current).createElement(n),r[rt]=e,r[Dt]=t,it(r,n,t),Ke(r),e.stateNode=r):e.memoizedState=jI(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return nm(e),t===null&&ne&&(r=e.stateNode=Mw(e.type,e.pendingProps,$r.current),ot=e,un=!0,o=Se,po(e.type)?(Um=o,Se=pn(r.firstChild)):Se=o),nt(t,e,e.pendingProps.children,n),uc(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&ne&&((o=r=Se)&&(r=eR(r,e.type,e.pendingProps,un),r!==null?(e.stateNode=r,ot=e,Se=pn(r.firstChild),un=!1,o=!0):o=!1),o||so(e)),nm(e),o=e.type,a=e.pendingProps,i=t!==null?t.memoizedProps:null,r=a.children,_m(o,a)?r=null:i!==null&&_m(o,i)&&(e.flags|=32),e.memoizedState!==null&&(o=mh(t,e,gB,null,null,n),is._currentValue=o),uc(t,e),nt(t,e,r,n),e.child;case 6:return t===null&&ne&&((t=n=Se)&&(n=tR(n,e.pendingProps,un),n!==null?(e.stateNode=n,ot=e,Se=null,t=!0):t=!1),t||so(e)),null;case 13:return N1(t,e,n);case 4:return yc(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Wo(e,null,r,n):nt(t,e,r,n),e.child;case 11:return mI(t,e,e.type,e.pendingProps,n);case 7:return nt(t,e,e.pendingProps,n),e.child;case 8:return nt(t,e,e.pendingProps.children,n),e.child;case 12:return nt(t,e,e.pendingProps.children,n),e.child;case 10:return r=e.pendingProps,jr(e,e.type,r.value),nt(t,e,r.children,n),e.child;case 9:return o=e.type._context,r=e.pendingProps.children,Qo(e),o=at(o),r=r(o),e.flags|=1,nt(t,e,r,n),e.child;case 14:return hI(t,e,e.type,e.pendingProps,n);case 15:return F1(t,e,e.type,e.pendingProps,n);case 19:return q1(t,e,n);case 31:return CB(t,e,n);case 22:return L1(t,e,n,e.pendingProps);case 24:return Qo(e),r=at(He),t===null?(o=fh(),o===null&&(o=de,a=sh(),o.pooledCache=a,a.refCount++,a!==null&&(o.pooledCacheLanes|=n),o=a),e.memoizedState={parent:r,cache:o},uh(e),jr(e,He,o)):((t.lanes&n)!==0&&(ym(t,e),Ul(e,null,null,n),Hl()),o=t.memoizedState,a=e.memoizedState,o.parent!==r?(o={parent:r,cache:r},e.memoizedState=o,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=o),jr(e,He,r)):(r=a.cache,jr(e,He,r),r!==o.cache&&xm(e,[He],n,!0))),nt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(T(156,e.tag))}function ir(t){t.flags|=4}function Pp(t,e,n,r,o){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(o&335544128)===o)if(t.stateNode.complete)t.flags|=8192;else if(sw())t.flags|=8192;else throw Vo=Ac,ch}else t.flags&=-16777217}function wI(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!Bw(e))if(sw())t.flags|=8192;else throw Vo=Ac,ch}function Kf(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?fv():536870912,t.lanes|=e,hi|=e)}function Tl(t,e){if(!ne)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function we(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&65011712,r|=o.flags&65011712,o.return=t,o=o.sibling;else for(o=t.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=t,o=o.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function TB(t,e,n){var r=e.pendingProps;switch(lh(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return we(e),null;case 1:return we(e),null;case 3:return n=e.stateNode,r=null,t!==null&&(r=t.memoizedState.cache),e.memoizedState.cache!==r&&(e.flags|=2048),xr(He),fi(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(za(e)?ir(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,Op())),we(e),null;case 26:var o=e.type,a=e.memoizedState;return t===null?(ir(e),a!==null?(we(e),wI(e,a)):(we(e),Pp(e,o,null,r,n))):a?a!==t.memoizedState?(ir(e),we(e),wI(e,a)):(we(e),e.flags&=-16777217):(t=t.memoizedProps,t!==r&&ir(e),we(e),Pp(e,o,t,r,n)),null;case 27:if(bc(e),n=$r.current,o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&ir(e);else{if(!r){if(e.stateNode===null)throw Error(T(166));return we(e),null}t=Gn.current,za(e)?J0(e,t):(t=Mw(o,r,n),e.stateNode=t,ir(e))}return we(e),null;case 5:if(bc(e),o=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&ir(e);else{if(!r){if(e.stateNode===null)throw Error(T(166));return we(e),null}if(a=Gn.current,za(e))J0(e,a);else{var i=zc($r.current);switch(a){case 1:a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":a=i.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":a=i.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":a=i.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof r.is=="string"?i.createElement("select",{is:r.is}):i.createElement("select"),r.multiple?a.multiple=!0:r.size&&(a.size=r.size);break;default:a=typeof r.is=="string"?i.createElement(o,{is:r.is}):i.createElement(o)}}a[rt]=e,a[Dt]=r;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)a.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=a;e:switch(it(a,o,r),o){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}r&&ir(e)}}return we(e),Pp(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==r&&ir(e);else{if(typeof r!="string"&&e.stateNode===null)throw Error(T(166));if(t=$r.current,za(e)){if(t=e.stateNode,n=e.memoizedProps,r=null,o=ot,o!==null)switch(o.tag){case 27:case 5:r=o.memoizedProps}t[rt]=e,t=!!(t.nodeValue===n||r!==null&&r.suppressHydrationWarning===!0||kw(t.nodeValue,n)),t||so(e,!0)}else t=zc(t).createTextNode(r),t[rt]=e,e.stateNode=t}return we(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(r=za(e),n!==null){if(t===null){if(!r)throw Error(T(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(T(557));t[rt]=e}else Xo(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;we(e),t=!1}else n=Op(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(zt(e),e):(zt(e),null);if((e.flags&128)!==0)throw Error(T(558))}return we(e),null;case 13:if(r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(o=za(e),r!==null&&r.dehydrated!==null){if(t===null){if(!o)throw Error(T(318));if(o=e.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(T(317));o[rt]=e}else Xo(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;we(e),o=!1}else o=Op(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=o),o=!0;if(!o)return e.flags&256?(zt(e),e):(zt(e),null)}return zt(e),(e.flags&128)!==0?(e.lanes=n,e):(n=r!==null,t=t!==null&&t.memoizedState!==null,n&&(r=e.child,o=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(o=r.alternate.memoizedState.cachePool.pool),a=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(a=r.memoizedState.cachePool.pool),a!==o&&(r.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Kf(e,e.updateQueue),we(e),null);case 4:return fi(),t===null&&Fh(e.stateNode.containerInfo),we(e),null;case 10:return xr(e.type),we(e),null;case 19:if(Ye(Le),r=e.memoizedState,r===null)return we(e),null;if(o=(e.flags&128)!==0,a=r.rendering,a===null)if(o)Tl(r,!1);else{if(Ee!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(a=Mc(t),a!==null){for(e.flags|=128,Tl(r,!1),t=a.updateQueue,e.updateQueue=t,Kf(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)Pv(n,t),n=n.sibling;return ge(Le,Le.current&1|2),ne&&cr(e,r.treeForkCount),e.child}t=t.sibling}r.tail!==null&&jt()>Fc&&(e.flags|=128,o=!0,Tl(r,!1),e.lanes=4194304)}else{if(!o)if(t=Mc(a),t!==null){if(e.flags|=128,o=!0,t=t.updateQueue,e.updateQueue=t,Kf(e,t),Tl(r,!0),r.tail===null&&r.tailMode==="hidden"&&!a.alternate&&!ne)return we(e),null}else 2*jt()-r.renderingStartTime>Fc&&n!==536870912&&(e.flags|=128,o=!0,Tl(r,!1),e.lanes=4194304);r.isBackwards?(a.sibling=e.child,e.child=a):(t=r.last,t!==null?t.sibling=a:e.child=a,r.last=a)}return r.tail!==null?(t=r.tail,r.rendering=t,r.tail=t.sibling,r.renderingStartTime=jt(),t.sibling=null,n=Le.current,ge(Le,o?n&1|2:n&1),ne&&cr(e,r.treeForkCount),t):(we(e),null);case 22:case 23:return zt(e),dh(),r=e.memoizedState!==null,t!==null?t.memoizedState!==null!==r&&(e.flags|=8192):r&&(e.flags|=8192),r?(n&536870912)!==0&&(e.flags&128)===0&&(we(e),e.subtreeFlags&6&&(e.flags|=8192)):we(e),n=e.updateQueue,n!==null&&Kf(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),r=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),r!==n&&(e.flags|=2048),t!==null&&Ye(jo),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),xr(He),we(e),null;case 25:return null;case 30:return null}throw Error(T(156,e.tag))}function MB(t,e){switch(lh(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return xr(He),fi(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return bc(e),null;case 31:if(e.memoizedState!==null){if(zt(e),e.alternate===null)throw Error(T(340));Xo()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(zt(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(T(340));Xo()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Ye(Le),null;case 4:return fi(),null;case 10:return xr(e.type),null;case 22:case 23:return zt(e),dh(),t!==null&&Ye(jo),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return xr(He),null;case 25:return null;default:return null}}function P1(t,e){switch(lh(e),e.tag){case 3:xr(He),fi();break;case 26:case 27:case 5:bc(e);break;case 4:fi();break;case 31:e.memoizedState!==null&&zt(e);break;case 13:zt(e);break;case 19:Ye(Le);break;case 10:xr(e.type);break;case 22:case 23:zt(e),dh(),t!==null&&Ye(jo);break;case 24:xr(He)}}function gs(t,e){try{var n=e.updateQueue,r=n!==null?n.lastEffect:null;if(r!==null){var o=r.next;n=o;do{if((n.tag&t)===t){r=void 0;var a=n.create,i=n.inst;r=a(),i.destroy=r}n=n.next}while(n!==o)}}catch(l){le(e,e.return,l)}}function fo(t,e,n){try{var r=e.updateQueue,o=r!==null?r.lastEffect:null;if(o!==null){var a=o.next;r=a;do{if((r.tag&t)===t){var i=r.inst,l=i.destroy;if(l!==void 0){i.destroy=void 0,o=e;var s=n,f=l;try{f()}catch(c){le(o,s,c)}}}r=r.next}while(r!==a)}}catch(c){le(e,e.return,c)}}function z1(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{Kv(e,n)}catch(r){le(t,t.return,r)}}}function H1(t,e,n){n.props=Yo(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(r){le(t,e,r)}}function Vl(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var r=t.stateNode;break;case 30:r=t.stateNode;break;default:r=t.stateNode}typeof n=="function"?t.refCleanup=n(r):n.current=r}}catch(o){le(t,e,o)}}function Vn(t,e){var n=t.ref,r=t.refCleanup;if(n!==null)if(typeof r=="function")try{r()}catch(o){le(t,e,o)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(o){le(t,e,o)}else n.current=null}function U1(t){var e=t.type,n=t.memoizedProps,r=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&r.focus();break e;case"img":n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(o){le(t,t.return,o)}}function zp(t,e,n){try{var r=t.stateNode;WB(r,t.type,n,e),r[Dt]=e}catch(o){le(t,t.return,o)}}function j1(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&po(t.type)||t.tag===4}function Hp(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||j1(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&po(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Dm(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=pr));else if(r!==4&&(r===27&&po(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Dm(t,e,n),t=t.sibling;t!==null;)Dm(t,e,n),t=t.sibling}function Ec(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(r===27&&po(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(Ec(t,e,n),t=t.sibling;t!==null;)Ec(t,e,n),t=t.sibling}function V1(t){var e=t.stateNode,n=t.memoizedProps;try{for(var r=t.type,o=e.attributes;o.length;)e.removeAttributeNode(o[0]);it(e,r,n),e[rt]=t,e[Dt]=n}catch(a){le(t,t.return,a)}}var ur=!1,ze=!1,Up=!1,SI=typeof WeakSet=="function"?WeakSet:Set,We=null;function DB(t,e){if(t=t.containerInfo,Nm=Vc,t=Bv(t),nh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,a=r.focusNode;r=r.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break e}var i=0,l=-1,s=-1,f=0,c=0,d=t,u=null;t:for(;;){for(var p;d!==n||o!==0&&d.nodeType!==3||(l=i+o),d!==a||r!==0&&d.nodeType!==3||(s=i+r),d.nodeType===3&&(i+=d.nodeValue.length),(p=d.firstChild)!==null;)u=d,d=p;for(;;){if(d===t)break t;if(u===n&&++f===o&&(l=i),u===a&&++c===r&&(s=i),(p=d.nextSibling)!==null)break;d=u,u=d.parentNode}d=p}n=l===-1||s===-1?null:{start:l,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(qm={focusedElem:t,selectionRange:n},Vc=!1,We=e;We!==null;)if(e=We,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,We=t;else for(;We!==null;){switch(e=We,a=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)o=t[n],o.ref.impl=o.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&a!==null){t=void 0,n=e,o=a.memoizedProps,a=a.memoizedState,r=n.stateNode;try{var m=Yo(n.type,o);t=r.getSnapshotBeforeUpdate(m,a),r.__reactInternalSnapshotBeforeUpdate=t}catch(x){le(n,n.return,x)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Pm(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Pm(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(T(163))}if(t=e.sibling,t!==null){t.return=e.return,We=t;break}We=e.return}}function G1(t,e,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:sr(t,n),r&4&&gs(5,n);break;case 1:if(sr(t,n),r&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){le(n,n.return,i)}else{var o=Yo(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(o,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){le(n,n.return,i)}}r&64&&z1(n),r&512&&Vl(n,n.return);break;case 3:if(sr(t,n),r&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{Kv(t,e)}catch(i){le(n,n.return,i)}}break;case 27:e===null&&r&4&&V1(n);case 26:case 5:sr(t,n),e===null&&r&4&&U1(n),r&512&&Vl(n,n.return);break;case 12:sr(t,n);break;case 31:sr(t,n),r&4&&W1(t,n);break;case 13:sr(t,n),r&4&&K1(t,n),r&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=_B.bind(null,n),nR(t,n))));break;case 22:if(r=n.memoizedState!==null||ur,!r){e=e!==null&&e.memoizedState!==null||ze,o=ur;var a=ze;ur=r,(ze=e)&&!a?fr(t,n,(n.subtreeFlags&8772)!==0):sr(t,n),ur=o,ze=a}break;case 30:break;default:sr(t,n)}}function X1(t){var e=t.alternate;e!==null&&(t.alternate=null,X1(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&Ym(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Te=null,At=!1;function lr(t,e,n){for(n=n.child;n!==null;)Q1(t,e,n),n=n.sibling}function Q1(t,e,n){if(Vt&&typeof Vt.onCommitFiberUnmount=="function")try{Vt.onCommitFiberUnmount(cs,n)}catch{}switch(n.tag){case 26:ze||Vn(n,e),lr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:ze||Vn(n,e);var r=Te,o=At;po(n.type)&&(Te=n.stateNode,At=!1),lr(t,e,n),Wl(n.stateNode),Te=r,At=o;break;case 5:ze||Vn(n,e);case 6:if(r=Te,o=At,Te=null,lr(t,e,n),Te=r,At=o,Te!==null)if(At)try{(Te.nodeType===9?Te.body:Te.nodeName==="HTML"?Te.ownerDocument.body:Te).removeChild(n.stateNode)}catch(a){le(n,e,a)}else try{Te.removeChild(n.stateNode)}catch(a){le(n,e,a)}break;case 18:Te!==null&&(At?(t=Te,_I(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),bi(t)):_I(Te,n.stateNode));break;case 4:r=Te,o=At,Te=n.stateNode.containerInfo,At=!0,lr(t,e,n),Te=r,At=o;break;case 0:case 11:case 14:case 15:fo(2,n,e),ze||fo(4,n,e),lr(t,e,n);break;case 1:ze||(Vn(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"&&H1(n,e,r)),lr(t,e,n);break;case 21:lr(t,e,n);break;case 22:ze=(r=ze)||n.memoizedState!==null,lr(t,e,n),ze=r;break;default:lr(t,e,n)}}function W1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{bi(t)}catch(n){le(e,e.return,n)}}}function K1(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{bi(t)}catch(n){le(e,e.return,n)}}function OB(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new SI),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new SI),e;default:throw Error(T(435,t.tag))}}function Yf(t,e){var n=OB(t);e.forEach(function(r){if(!n.has(r)){n.add(r);var o=PB.bind(null,t,r);r.then(o,o)}})}function kt(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r],a=t,i=e,l=i;e:for(;l!==null;){switch(l.tag){case 27:if(po(l.type)){Te=l.stateNode,At=!1;break e}break;case 5:Te=l.stateNode,At=!1;break e;case 3:case 4:Te=l.stateNode.containerInfo,At=!0;break e}l=l.return}if(Te===null)throw Error(T(160));Q1(a,i,o),Te=null,At=!1,a=o.alternate,a!==null&&(a.return=null),o.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Y1(e,t),e=e.sibling}var Tn=null;function Y1(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:kt(e,t),Ct(t),r&4&&(fo(3,t,t.return),gs(3,t),fo(5,t,t.return));break;case 1:kt(e,t),Ct(t),r&512&&(ze||n===null||Vn(n,n.return)),r&64&&ur&&(t=t.updateQueue,t!==null&&(r=t.callbacks,r!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var o=Tn;if(kt(e,t),Ct(t),r&512&&(ze||n===null||Vn(n,n.return)),r&4){var a=n!==null?n.memoizedState:null;if(r=t.memoizedState,n===null)if(r===null)if(t.stateNode===null){e:{r=t.type,n=t.memoizedProps,o=o.ownerDocument||o;t:switch(r){case"title":a=o.getElementsByTagName("title")[0],(!a||a[ps]||a[rt]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=o.createElement(r),o.head.insertBefore(a,o.querySelector("head > title"))),it(a,r,n),a[rt]=t,Ke(a),r=a;break e;case"link":var i=GI("link","href",o).get(r+(n.href||""));if(i){for(var l=0;l<i.length;l++)if(a=i[l],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(l,1);break t}}a=o.createElement(r),it(a,r,n),o.head.appendChild(a);break;case"meta":if(i=GI("meta","content",o).get(r+(n.content||""))){for(l=0;l<i.length;l++)if(a=i[l],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(l,1);break t}}a=o.createElement(r),it(a,r,n),o.head.appendChild(a);break;default:throw Error(T(468,r))}a[rt]=t,Ke(a),r=a}t.stateNode=r}else XI(o,t.type,t.stateNode);else t.stateNode=VI(o,r,t.memoizedProps);else a!==r?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,r===null?XI(o,t.type,t.stateNode):VI(o,r,t.memoizedProps)):r===null&&t.stateNode!==null&&zp(t,t.memoizedProps,n.memoizedProps)}break;case 27:kt(e,t),Ct(t),r&512&&(ze||n===null||Vn(n,n.return)),n!==null&&r&4&&zp(t,t.memoizedProps,n.memoizedProps);break;case 5:if(kt(e,t),Ct(t),r&512&&(ze||n===null||Vn(n,n.return)),t.flags&32){o=t.stateNode;try{ui(o,"")}catch(m){le(t,t.return,m)}}r&4&&t.stateNode!=null&&(o=t.memoizedProps,zp(t,o,n!==null?n.memoizedProps:o)),r&1024&&(Up=!0);break;case 6:if(kt(e,t),Ct(t),r&4){if(t.stateNode===null)throw Error(T(162));r=t.memoizedProps,n=t.stateNode;try{n.nodeValue=r}catch(m){le(t,t.return,m)}}break;case 3:if(mc=null,o=Tn,Tn=Hc(e.containerInfo),kt(e,t),Tn=o,Ct(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{bi(e.containerInfo)}catch(m){le(t,t.return,m)}Up&&(Up=!1,J1(t));break;case 4:r=Tn,Tn=Hc(t.stateNode.containerInfo),kt(e,t),Ct(t),Tn=r;break;case 12:kt(e,t),Ct(t);break;case 31:kt(e,t),Ct(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,Yf(t,r)));break;case 13:kt(e,t),Ct(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(ru=jt()),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,Yf(t,r)));break;case 22:o=t.memoizedState!==null;var s=n!==null&&n.memoizedState!==null,f=ur,c=ze;if(ur=f||o,ze=c||s,kt(e,t),ze=c,ur=f,Ct(t),r&8192)e:for(e=t.stateNode,e._visibility=o?e._visibility&-2:e._visibility|1,o&&(n===null||s||ur||ze||zo(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){s=n=e;try{if(a=s.stateNode,o)i=a.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{l=s.stateNode;var d=s.memoizedProps.style,u=d!=null&&d.hasOwnProperty("display")?d.display:null;l.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(m){le(s,s.return,m)}}}else if(e.tag===6){if(n===null){s=e;try{s.stateNode.nodeValue=o?"":s.memoizedProps}catch(m){le(s,s.return,m)}}}else if(e.tag===18){if(n===null){s=e;try{var p=s.stateNode;o?PI(p,!0):PI(s.stateNode,!1)}catch(m){le(s,s.return,m)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}r&4&&(r=t.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,Yf(t,n))));break;case 19:kt(e,t),Ct(t),r&4&&(r=t.updateQueue,r!==null&&(t.updateQueue=null,Yf(t,r)));break;case 30:break;case 21:break;default:kt(e,t),Ct(t)}}function Ct(t){var e=t.flags;if(e&2){try{for(var n,r=t.return;r!==null;){if(j1(r)){n=r;break}r=r.return}if(n==null)throw Error(T(160));switch(n.tag){case 27:var o=n.stateNode,a=Hp(t);Ec(t,a,o);break;case 5:var i=n.stateNode;n.flags&32&&(ui(i,""),n.flags&=-33);var l=Hp(t);Ec(t,l,i);break;case 3:case 4:var s=n.stateNode.containerInfo,f=Hp(t);Dm(t,f,s);break;default:throw Error(T(161))}}catch(c){le(t,t.return,c)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function J1(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;J1(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function sr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)G1(t,e.alternate,e),e=e.sibling}function zo(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:fo(4,e,e.return),zo(e);break;case 1:Vn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&H1(e,e.return,n),zo(e);break;case 27:Wl(e.stateNode);case 26:case 5:Vn(e,e.return),zo(e);break;case 22:e.memoizedState===null&&zo(e);break;case 30:zo(e);break;default:zo(e)}t=t.sibling}}function fr(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var r=e.alternate,o=t,a=e,i=a.flags;switch(a.tag){case 0:case 11:case 15:fr(o,a,n),gs(4,a);break;case 1:if(fr(o,a,n),r=a,o=r.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(f){le(r,r.return,f)}if(r=a,o=r.updateQueue,o!==null){var l=r.stateNode;try{var s=o.shared.hiddenCallbacks;if(s!==null)for(o.shared.hiddenCallbacks=null,o=0;o<s.length;o++)Wv(s[o],l)}catch(f){le(r,r.return,f)}}n&&i&64&&z1(a),Vl(a,a.return);break;case 27:V1(a);case 26:case 5:fr(o,a,n),n&&r===null&&i&4&&U1(a),Vl(a,a.return);break;case 12:fr(o,a,n);break;case 31:fr(o,a,n),n&&i&4&&W1(o,a);break;case 13:fr(o,a,n),n&&i&4&&K1(o,a);break;case 22:a.memoizedState===null&&fr(o,a,n),Vl(a,a.return);break;case 30:break;default:fr(o,a,n)}e=e.sibling}}function Mh(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&hs(n))}function Dh(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&hs(t))}function An(t,e,n,r){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)$1(t,e,n,r),e=e.sibling}function $1(t,e,n,r){var o=e.flags;switch(e.tag){case 0:case 11:case 15:An(t,e,n,r),o&2048&&gs(9,e);break;case 1:An(t,e,n,r);break;case 3:An(t,e,n,r),o&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&hs(t)));break;case 12:if(o&2048){An(t,e,n,r),t=e.stateNode;try{var a=e.memoizedProps,i=a.id,l=a.onPostCommit;typeof l=="function"&&l(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(s){le(e,e.return,s)}}else An(t,e,n,r);break;case 31:An(t,e,n,r);break;case 13:An(t,e,n,r);break;case 23:break;case 22:a=e.stateNode,i=e.alternate,e.memoizedState!==null?a._visibility&2?An(t,e,n,r):Gl(t,e):a._visibility&2?An(t,e,n,r):(a._visibility|=2,Ua(t,e,n,r,(e.subtreeFlags&10256)!==0||!1)),o&2048&&Mh(i,e);break;case 24:An(t,e,n,r),o&2048&&Dh(e.alternate,e);break;default:An(t,e,n,r)}}function Ua(t,e,n,r,o){for(o=o&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var a=t,i=e,l=n,s=r,f=i.flags;switch(i.tag){case 0:case 11:case 15:Ua(a,i,l,s,o),gs(8,i);break;case 23:break;case 22:var c=i.stateNode;i.memoizedState!==null?c._visibility&2?Ua(a,i,l,s,o):Gl(a,i):(c._visibility|=2,Ua(a,i,l,s,o)),o&&f&2048&&Mh(i.alternate,i);break;case 24:Ua(a,i,l,s,o),o&&f&2048&&Dh(i.alternate,i);break;default:Ua(a,i,l,s,o)}e=e.sibling}}function Gl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,r=e,o=r.flags;switch(r.tag){case 22:Gl(n,r),o&2048&&Mh(r.alternate,r);break;case 24:Gl(n,r),o&2048&&Dh(r.alternate,r);break;default:Gl(n,r)}e=e.sibling}}var Ll=8192;function Ha(t,e,n){if(t.subtreeFlags&Ll)for(t=t.child;t!==null;)Z1(t,e,n),t=t.sibling}function Z1(t,e,n){switch(t.tag){case 26:Ha(t,e,n),t.flags&Ll&&t.memoizedState!==null&&mR(n,Tn,t.memoizedState,t.memoizedProps);break;case 5:Ha(t,e,n);break;case 3:case 4:var r=Tn;Tn=Hc(t.stateNode.containerInfo),Ha(t,e,n),Tn=r;break;case 22:t.memoizedState===null&&(r=t.alternate,r!==null&&r.memoizedState!==null?(r=Ll,Ll=16777216,Ha(t,e,n),Ll=r):Ha(t,e,n));break;default:Ha(t,e,n)}}function ew(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Ml(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];We=r,nw(r,t)}ew(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)tw(t),t=t.sibling}function tw(t){switch(t.tag){case 0:case 11:case 15:Ml(t),t.flags&2048&&fo(9,t,t.return);break;case 3:Ml(t);break;case 12:Ml(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,dc(t)):Ml(t);break;default:Ml(t)}}function dc(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var r=e[n];We=r,nw(r,t)}ew(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:fo(8,e,e.return),dc(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,dc(e));break;default:dc(e)}t=t.sibling}}function nw(t,e){for(;We!==null;){var n=We;switch(n.tag){case 0:case 11:case 15:fo(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:hs(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,We=r;else e:for(n=t;We!==null;){r=We;var o=r.sibling,a=r.return;if(X1(r),r===n){We=null;break e}if(o!==null){o.return=a,We=o;break e}We=a}}}var BB={getCacheForType:function(t){var e=at(He),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return at(He).controller.signal}},RB=typeof WeakMap=="function"?WeakMap:Map,re=0,de=null,Z=null,ee=0,ie=0,Pt=null,Kr=!1,ki=!1,Oh=!1,wr=0,Ee=0,co=0,Go=0,Bh=0,Ut=0,hi=0,Xl=null,Tt=null,Om=!1,ru=0,rw=0,Fc=1/0,Lc=null,no=null,Ve=0,ro=null,xi=null,gr=0,Bm=0,Rm=null,ow=null,Ql=0,Em=null;function Xt(){return(re&2)!==0&&ee!==0?ee&-ee:j.T!==null?Eh():pv()}function aw(){if(Ut===0)if((ee&536870912)===0||ne){var t=zf;zf<<=1,(zf&3932160)===0&&(zf=262144),Ut=t}else Ut=536870912;return t=Wt.current,t!==null&&(t.flags|=32),Ut}function Mt(t,e,n){(t===de&&(ie===2||ie===9)||t.cancelPendingCommit!==null)&&(gi(t,0),Yr(t,ee,Ut,!1)),ds(t,n),((re&2)===0||t!==de)&&(t===de&&((re&2)===0&&(Go|=n),Ee===4&&Yr(t,ee,Ut,!1)),Qn(t))}function iw(t,e,n){if((re&6)!==0)throw Error(T(327));var r=!n&&(e&127)===0&&(e&t.expiredLanes)===0||us(t,e),o=r?LB(t,e):jp(t,e,!0),a=r;do{if(o===0){ki&&!r&&Yr(t,e,0,!1);break}else{if(n=t.current.alternate,a&&!EB(n)){o=jp(t,e,!1),a=!1;continue}if(o===2){if(a=e,t.errorRecoveryDisabledLanes&a)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var l=t;o=Xl;var s=l.current.memoizedState.isDehydrated;if(s&&(gi(l,i).flags|=256),i=jp(l,i,!1),i!==2){if(Oh&&!s){l.errorRecoveryDisabledLanes|=a,Go|=a,o=4;break e}a=Tt,Tt=o,a!==null&&(Tt===null?Tt=a:Tt.push.apply(Tt,a))}o=i}if(a=!1,o!==2)continue}}if(o===1){gi(t,0),Yr(t,e,0,!0);break}e:{switch(r=t,a=o,a){case 0:case 1:throw Error(T(345));case 4:if((e&4194048)!==e)break;case 6:Yr(r,e,Ut,!Kr);break e;case 2:Tt=null;break;case 3:case 5:break;default:throw Error(T(329))}if((e&62914560)===e&&(o=ru+300-jt(),10<o)){if(Yr(r,e,Ut,!Kr),Xc(r,0,!0)!==0)break e;gr=e,r.timeoutHandle=Aw(kI.bind(null,r,n,Tt,Lc,Om,e,Ut,Go,hi,Kr,a,"Throttled",-0,0),o);break e}kI(r,n,Tt,Lc,Om,e,Ut,Go,hi,Kr,a,null,-0,0)}}break}while(!0);Qn(t)}function kI(t,e,n,r,o,a,i,l,s,f,c,d,u,p){if(t.timeoutHandle=-1,d=e.subtreeFlags,d&8192||(d&16785408)===16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:pr},Z1(e,a,d);var m=(a&62914560)===a?ru-jt():(a&4194048)===a?rw-jt():0;if(m=hR(d,m),m!==null){gr=a,t.cancelPendingCommit=m(AI.bind(null,t,e,a,n,r,o,i,l,s,c,d,null,u,p)),Yr(t,a,i,!f);return}}AI(t,e,a,n,r,o,i,l,s)}function EB(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var o=n[r],a=o.getSnapshot;o=o.value;try{if(!Qt(a(),o))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Yr(t,e,n,r){e&=~Bh,e&=~Go,t.suspendedLanes|=e,t.pingedLanes&=~e,r&&(t.warmLanes|=e),r=t.expirationTimes;for(var o=e;0<o;){var a=31-Gt(o),i=1<<a;r[a]=-1,o&=~i}n!==0&&cv(t,n,e)}function ou(){return(re&6)===0?(ys(0,!1),!1):!0}function Rh(){if(Z!==null){if(ie===0)var t=Z.return;else t=Z,mr=ta=null,gh(t),ii=null,ts=0,t=Z;for(;t!==null;)P1(t.alternate,t),t=t.return;Z=null}}function gi(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,JB(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),gr=0,Rh(),de=t,Z=n=hr(t.current,null),ee=e,ie=0,Pt=null,Kr=!1,ki=us(t,e),Oh=!1,hi=Ut=Bh=Go=co=Ee=0,Tt=Xl=null,Om=!1,(e&8)!==0&&(e|=e&32);var r=t.entangledLanes;if(r!==0)for(t=t.entanglements,r&=e;0<r;){var o=31-Gt(r),a=1<<o;e|=t[o],r&=~a}return wr=e,Yc(),n}function lw(t,e){X=null,j.H=rs,e===Si||e===$c?(e=nI(),ie=3):e===ch?(e=nI(),ie=4):ie=e===Ah?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Pt=e,Z===null&&(Ee=1,Bc(t,cn(e,t.current)))}function sw(){var t=Wt.current;return t===null?!0:(ee&4194048)===ee?dn===null:(ee&62914560)===ee||(ee&536870912)!==0?t===dn:!1}function fw(){var t=j.H;return j.H=rs,t===null?rs:t}function cw(){var t=j.A;return j.A=BB,t}function Nc(){Ee=4,Kr||(ee&4194048)!==ee&&Wt.current!==null||(ki=!0),(co&134217727)===0&&(Go&134217727)===0||de===null||Yr(de,ee,Ut,!1)}function jp(t,e,n){var r=re;re|=2;var o=fw(),a=cw();(de!==t||ee!==e)&&(Lc=null,gi(t,e)),e=!1;var i=Ee;e:do try{if(ie!==0&&Z!==null){var l=Z,s=Pt;switch(ie){case 8:Rh(),i=6;break e;case 3:case 2:case 9:case 6:Wt.current===null&&(e=!0);var f=ie;if(ie=0,Pt=null,ti(t,l,s,f),n&&ki){i=0;break e}break;default:f=ie,ie=0,Pt=null,ti(t,l,s,f)}}FB(),i=Ee;break}catch(c){lw(t,c)}while(!0);return e&&t.shellSuspendCounter++,mr=ta=null,re=r,j.H=o,j.A=a,Z===null&&(de=null,ee=0,Yc()),i}function FB(){for(;Z!==null;)uw(Z)}function LB(t,e){var n=re;re|=2;var r=fw(),o=cw();de!==t||ee!==e?(Lc=null,Fc=jt()+500,gi(t,e)):ki=us(t,e);e:do try{if(ie!==0&&Z!==null){e=Z;var a=Pt;t:switch(ie){case 1:ie=0,Pt=null,ti(t,e,a,1);break;case 2:case 9:if(tI(a)){ie=0,Pt=null,CI(e);break}e=function(){ie!==2&&ie!==9||de!==t||(ie=7),Qn(t)},a.then(e,e);break e;case 3:ie=7;break e;case 4:ie=5;break e;case 7:tI(a)?(ie=0,Pt=null,CI(e)):(ie=0,Pt=null,ti(t,e,a,7));break;case 5:var i=null;switch(Z.tag){case 26:i=Z.memoizedState;case 5:case 27:var l=Z;if(i?Bw(i):l.stateNode.complete){ie=0,Pt=null;var s=l.sibling;if(s!==null)Z=s;else{var f=l.return;f!==null?(Z=f,au(f)):Z=null}break t}}ie=0,Pt=null,ti(t,e,a,5);break;case 6:ie=0,Pt=null,ti(t,e,a,6);break;case 8:Rh(),Ee=6;break e;default:throw Error(T(462))}}NB();break}catch(c){lw(t,c)}while(!0);return mr=ta=null,j.H=r,j.A=o,re=n,Z!==null?0:(de=null,ee=0,Yc(),Ee)}function NB(){for(;Z!==null&&!aO();)uw(Z)}function uw(t){var e=_1(t.alternate,t,wr);t.memoizedProps=t.pendingProps,e===null?au(t):Z=e}function CI(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=yI(n,e,e.pendingProps,e.type,void 0,ee);break;case 11:e=yI(n,e,e.pendingProps,e.type.render,e.ref,ee);break;case 5:gh(e);default:P1(n,e),e=Z=Pv(e,wr),e=_1(n,e,wr)}t.memoizedProps=t.pendingProps,e===null?au(t):Z=e}function ti(t,e,n,r){mr=ta=null,gh(e),ii=null,ts=0;var o=e.return;try{if(kB(t,o,e,n,ee)){Ee=1,Bc(t,cn(n,t.current)),Z=null;return}}catch(a){if(o!==null)throw Z=o,a;Ee=1,Bc(t,cn(n,t.current)),Z=null;return}e.flags&32768?(ne||r===1?t=!0:ki||(ee&536870912)!==0?t=!1:(Kr=t=!0,(r===2||r===9||r===3||r===6)&&(r=Wt.current,r!==null&&r.tag===13&&(r.flags|=16384))),dw(e,t)):au(e)}function au(t){var e=t;do{if((e.flags&32768)!==0){dw(e,Kr);return}t=e.return;var n=TB(e.alternate,e,wr);if(n!==null){Z=n;return}if(e=e.sibling,e!==null){Z=e;return}Z=e=t}while(e!==null);Ee===0&&(Ee=5)}function dw(t,e){do{var n=MB(t.alternate,t);if(n!==null){n.flags&=32767,Z=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){Z=t;return}Z=t=n}while(t!==null);Ee=6,Z=null}function AI(t,e,n,r,o,a,i,l,s){t.cancelPendingCommit=null;do iu();while(Ve!==0);if((re&6)!==0)throw Error(T(327));if(e!==null){if(e===t.current)throw Error(T(177));if(a=e.lanes|e.childLanes,a|=rh,hO(t,n,a,i,l,s),t===de&&(Z=de=null,ee=0),xi=e,ro=t,gr=n,Bm=a,Rm=o,ow=r,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,zB(Ic,function(){return gw(),null})):(t.callbackNode=null,t.callbackPriority=0),r=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||r){r=j.T,j.T=null,o=oe.p,oe.p=2,i=re,re|=4;try{DB(t,e,n)}finally{re=i,oe.p=o,j.T=r}}Ve=1,pw(),mw(),hw()}}function pw(){if(Ve===1){Ve=0;var t=ro,e=xi,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=j.T,j.T=null;var r=oe.p;oe.p=2;var o=re;re|=4;try{Y1(e,t);var a=qm,i=Bv(t.containerInfo),l=a.focusedElem,s=a.selectionRange;if(i!==l&&l&&l.ownerDocument&&Ov(l.ownerDocument.documentElement,l)){if(s!==null&&nh(l)){var f=s.start,c=s.end;if(c===void 0&&(c=f),"selectionStart"in l)l.selectionStart=f,l.selectionEnd=Math.min(c,l.value.length);else{var d=l.ownerDocument||document,u=d&&d.defaultView||window;if(u.getSelection){var p=u.getSelection(),m=l.textContent.length,x=Math.min(s.start,m),b=s.end===void 0?x:Math.min(s.end,m);!p.extend&&x>b&&(i=b,b=x,x=i);var h=W0(l,x),y=W0(l,b);if(h&&y&&(p.rangeCount!==1||p.anchorNode!==h.node||p.anchorOffset!==h.offset||p.focusNode!==y.node||p.focusOffset!==y.offset)){var g=d.createRange();g.setStart(h.node,h.offset),p.removeAllRanges(),x>b?(p.addRange(g),p.extend(y.node,y.offset)):(g.setEnd(y.node,y.offset),p.addRange(g))}}}}for(d=[],p=l;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<d.length;l++){var I=d[l];I.element.scrollLeft=I.left,I.element.scrollTop=I.top}}Vc=!!Nm,qm=Nm=null}finally{re=o,oe.p=r,j.T=n}}t.current=e,Ve=2}}function mw(){if(Ve===2){Ve=0;var t=ro,e=xi,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=j.T,j.T=null;var r=oe.p;oe.p=2;var o=re;re|=4;try{G1(t,e.alternate,e)}finally{re=o,oe.p=r,j.T=n}}Ve=3}}function hw(){if(Ve===4||Ve===3){Ve=0,iO();var t=ro,e=xi,n=gr,r=ow;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?Ve=5:(Ve=0,xi=ro=null,xw(t,t.pendingLanes));var o=t.pendingLanes;if(o===0&&(no=null),Km(n),e=e.stateNode,Vt&&typeof Vt.onCommitFiberRoot=="function")try{Vt.onCommitFiberRoot(cs,e,void 0,(e.current.flags&128)===128)}catch{}if(r!==null){e=j.T,o=oe.p,oe.p=2,j.T=null;try{for(var a=t.onRecoverableError,i=0;i<r.length;i++){var l=r[i];a(l.value,{componentStack:l.stack})}}finally{j.T=e,oe.p=o}}(gr&3)!==0&&iu(),Qn(t),o=t.pendingLanes,(n&261930)!==0&&(o&42)!==0?t===Em?Ql++:(Ql=0,Em=t):Ql=0,ys(0,!1)}}function xw(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,hs(e)))}function iu(){return pw(),mw(),hw(),gw()}function gw(){if(Ve!==5)return!1;var t=ro,e=Bm;Bm=0;var n=Km(gr),r=j.T,o=oe.p;try{oe.p=32>n?32:n,j.T=null,n=Rm,Rm=null;var a=ro,i=gr;if(Ve=0,xi=ro=null,gr=0,(re&6)!==0)throw Error(T(331));var l=re;if(re|=4,tw(a.current),$1(a,a.current,i,n),re=l,ys(0,!1),Vt&&typeof Vt.onPostCommitFiberRoot=="function")try{Vt.onPostCommitFiberRoot(cs,a)}catch{}return!0}finally{oe.p=o,j.T=r,xw(t,e)}}function TI(t,e,n){e=cn(n,e),e=Am(t.stateNode,e,2),t=to(t,e,2),t!==null&&(ds(t,2),Qn(t))}function le(t,e,n){if(t.tag===3)TI(t,t,n);else for(;e!==null;){if(e.tag===3){TI(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(no===null||!no.has(r))){t=cn(n,t),n=R1(2),r=to(e,n,2),r!==null&&(E1(n,r,e,t),ds(r,2),Qn(r));break}}e=e.return}}function Vp(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new RB;var o=new Set;r.set(e,o)}else o=r.get(e),o===void 0&&(o=new Set,r.set(e,o));o.has(n)||(Oh=!0,o.add(n),t=qB.bind(null,t,e,n),e.then(t,t))}function qB(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,de===t&&(ee&n)===n&&(Ee===4||Ee===3&&(ee&62914560)===ee&&300>jt()-ru?(re&2)===0&&gi(t,0):Bh|=n,hi===ee&&(hi=0)),Qn(t)}function yw(t,e){e===0&&(e=fv()),t=ea(t,e),t!==null&&(ds(t,e),Qn(t))}function _B(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),yw(t,n)}function PB(t,e){var n=0;switch(t.tag){case 31:case 13:var r=t.stateNode,o=t.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=t.stateNode;break;case 22:r=t.stateNode._retryCache;break;default:throw Error(T(314))}r!==null&&r.delete(e),yw(t,n)}function zB(t,e){return Qm(t,e)}var qc=null,ja=null,Fm=!1,_c=!1,Gp=!1,Jr=0;function Qn(t){t!==ja&&t.next===null&&(ja===null?qc=ja=t:ja=ja.next=t),_c=!0,Fm||(Fm=!0,UB())}function ys(t,e){if(!Gp&&_c){Gp=!0;do for(var n=!1,r=qc;r!==null;){if(!e)if(t!==0){var o=r.pendingLanes;if(o===0)var a=0;else{var i=r.suspendedLanes,l=r.pingedLanes;a=(1<<31-Gt(42|t)+1)-1,a&=o&~(i&~l),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,MI(r,a))}else a=ee,a=Xc(r,r===de?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),(a&3)===0||us(r,a)||(n=!0,MI(r,a));r=r.next}while(n);Gp=!1}}function HB(){bw()}function bw(){_c=Fm=!1;var t=0;Jr!==0&&YB()&&(t=Jr);for(var e=jt(),n=null,r=qc;r!==null;){var o=r.next,a=Iw(r,e);a===0?(r.next=null,n===null?qc=o:n.next=o,o===null&&(ja=n)):(n=r,(t!==0||(a&3)!==0)&&(_c=!0)),r=o}Ve!==0&&Ve!==5||ys(t,!1),Jr!==0&&(Jr=0)}function Iw(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,o=t.expirationTimes,a=t.pendingLanes&-62914561;0<a;){var i=31-Gt(a),l=1<<i,s=o[i];s===-1?((l&n)===0||(l&r)!==0)&&(o[i]=mO(l,e)):s<=e&&(t.expiredLanes|=l),a&=~l}if(e=de,n=ee,n=Xc(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r=t.callbackNode,n===0||t===e&&(ie===2||ie===9)||t.cancelPendingCommit!==null)return r!==null&&r!==null&&Ip(r),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||us(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(r!==null&&Ip(r),Km(n)){case 2:case 8:n=lv;break;case 32:n=Ic;break;case 268435456:n=sv;break;default:n=Ic}return r=vw.bind(null,t),n=Qm(n,r),t.callbackPriority=e,t.callbackNode=n,e}return r!==null&&r!==null&&Ip(r),t.callbackPriority=2,t.callbackNode=null,2}function vw(t,e){if(Ve!==0&&Ve!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(iu()&&t.callbackNode!==n)return null;var r=ee;return r=Xc(t,t===de?r:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r===0?null:(iw(t,r,e),Iw(t,jt()),t.callbackNode!=null&&t.callbackNode===n?vw.bind(null,t):null)}function MI(t,e){if(iu())return null;iw(t,e,!0)}function UB(){$B(function(){(re&6)!==0?Qm(iv,HB):bw()})}function Eh(){if(Jr===0){var t=di;t===0&&(t=Pf,Pf<<=1,(Pf&261888)===0&&(Pf=256)),Jr=t}return Jr}function DI(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:rc(""+t)}function OI(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function jB(t,e,n,r,o){if(e==="submit"&&n&&n.stateNode===o){var a=DI((o[Dt]||null).action),i=r.submitter;i&&(e=(e=i[Dt]||null)?DI(e.formAction):i.getAttribute("formAction"),e!==null&&(a=e,i=null));var l=new Qc("action","action",null,r,o);t.push({event:l,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(Jr!==0){var s=i?OI(o,i):new FormData(o);km(n,{pending:!0,data:s,method:o.method,action:a},null,s)}}else typeof a=="function"&&(l.preventDefault(),s=i?OI(o,i):new FormData(o),km(n,{pending:!0,data:s,method:o.method,action:a},a,s))},currentTarget:o}]})}}for(Jf=0;Jf<dm.length;Jf++)$f=dm[Jf],BI=$f.toLowerCase(),RI=$f[0].toUpperCase()+$f.slice(1),Mn(BI,"on"+RI);var $f,BI,RI,Jf;Mn(Ev,"onAnimationEnd");Mn(Fv,"onAnimationIteration");Mn(Lv,"onAnimationStart");Mn("dblclick","onDoubleClick");Mn("focusin","onFocus");Mn("focusout","onBlur");Mn(lB,"onTransitionRun");Mn(sB,"onTransitionStart");Mn(fB,"onTransitionCancel");Mn(Nv,"onTransitionEnd");ci("onMouseEnter",["mouseout","mouseover"]);ci("onMouseLeave",["mouseout","mouseover"]);ci("onPointerEnter",["pointerout","pointerover"]);ci("onPointerLeave",["pointerout","pointerover"]);Jo("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Jo("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Jo("onBeforeInput",["compositionend","keypress","textInput","paste"]);Jo("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Jo("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Jo("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var os="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),VB=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(os));function ww(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],o=r.event;r=r.listeners;e:{var a=void 0;if(e)for(var i=r.length-1;0<=i;i--){var l=r[i],s=l.instance,f=l.currentTarget;if(l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){wc(c)}o.currentTarget=null,a=s}else for(i=0;i<r.length;i++){if(l=r[i],s=l.instance,f=l.currentTarget,l=l.listener,s!==a&&o.isPropagationStopped())break e;a=l,o.currentTarget=f;try{a(o)}catch(c){wc(c)}o.currentTarget=null,a=s}}}}function $(t,e){var n=e[om];n===void 0&&(n=e[om]=new Set);var r=t+"__bubble";n.has(r)||(Sw(e,t,2,!1),n.add(r))}function Xp(t,e,n){var r=0;e&&(r|=4),Sw(n,t,r,e)}var Zf="_reactListening"+Math.random().toString(36).slice(2);function Fh(t){if(!t[Zf]){t[Zf]=!0,mv.forEach(function(n){n!=="selectionchange"&&(VB.has(n)||Xp(n,!1,t),Xp(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Zf]||(e[Zf]=!0,Xp("selectionchange",!1,e))}}function Sw(t,e,n,r){switch(Nw(e)){case 2:var o=yR;break;case 8:o=bR;break;default:o=_h}n=o.bind(null,e,n,t),o=void 0,!fm||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(o=!0),r?o!==void 0?t.addEventListener(e,n,{capture:!0,passive:o}):t.addEventListener(e,n,!0):o!==void 0?t.addEventListener(e,n,{passive:o}):t.addEventListener(e,n,!1)}function Qp(t,e,n,r,o){var a=r;if((e&1)===0&&(e&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var l=r.stateNode.containerInfo;if(l===o)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&i.stateNode.containerInfo===o)return;i=i.return}for(;l!==null;){if(i=Xa(l),i===null)return;if(s=i.tag,s===5||s===6||s===26||s===27){r=a=i;continue e}l=l.parentNode}}r=r.return}wv(function(){var f=a,c=$m(n),d=[];e:{var u=qv.get(t);if(u!==void 0){var p=Qc,m=t;switch(t){case"keypress":if(ac(n)===0)break e;case"keydown":case"keyup":p=PO;break;case"focusin":m="focus",p=Cp;break;case"focusout":m="blur",p=Cp;break;case"beforeblur":case"afterblur":p=Cp;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=P0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=TO;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=UO;break;case Ev:case Fv:case Lv:p=OO;break;case Nv:p=VO;break;case"scroll":case"scrollend":p=CO;break;case"wheel":p=XO;break;case"copy":case"cut":case"paste":p=RO;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=H0;break;case"toggle":case"beforetoggle":p=WO}var x=(e&4)!==0,b=!x&&(t==="scroll"||t==="scrollend"),h=x?u!==null?u+"Capture":null:u;x=[];for(var y=f,g;y!==null;){var I=y;if(g=I.stateNode,I=I.tag,I!==5&&I!==26&&I!==27||g===null||h===null||(I=Yl(y,h),I!=null&&x.push(as(y,I,g))),b)break;y=y.return}0<x.length&&(u=new p(u,m,null,n,c),d.push({event:u,listeners:x}))}}if((e&7)===0){e:{if(u=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",u&&n!==sm&&(m=n.relatedTarget||n.fromElement)&&(Xa(m)||m[Ii]))break e;if((p||u)&&(u=c.window===c?c:(u=c.ownerDocument)?u.defaultView||u.parentWindow:window,p?(m=n.relatedTarget||n.toElement,p=f,m=m?Xa(m):null,m!==null&&(b=fs(m),x=m.tag,m!==b||x!==5&&x!==27&&x!==6)&&(m=null)):(p=null,m=f),p!==m)){if(x=P0,I="onMouseLeave",h="onMouseEnter",y="mouse",(t==="pointerout"||t==="pointerover")&&(x=H0,I="onPointerLeave",h="onPointerEnter",y="pointer"),b=p==null?u:El(p),g=m==null?u:El(m),u=new x(I,y+"leave",p,n,c),u.target=b,u.relatedTarget=g,I=null,Xa(c)===f&&(x=new x(h,y+"enter",m,n,c),x.target=g,x.relatedTarget=b,I=x),b=I,p&&m)t:{for(x=GB,h=p,y=m,g=0,I=h;I;I=x(I))g++;I=0;for(var v=y;v;v=x(v))I++;for(;0<g-I;)h=x(h),g--;for(;0<I-g;)y=x(y),I--;for(;g--;){if(h===y||y!==null&&h===y.alternate){x=h;break t}h=x(h),y=x(y)}x=null}else x=null;p!==null&&EI(d,u,p,x,!1),m!==null&&b!==null&&EI(d,b,m,x,!0)}}e:{if(u=f?El(f):window,p=u.nodeName&&u.nodeName.toLowerCase(),p==="select"||p==="input"&&u.type==="file")var S=G0;else if(V0(u))if(Mv)S=oB;else{S=nB;var w=tB}else p=u.nodeName,!p||p.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?f&&Jm(f.elementType)&&(S=G0):S=rB;if(S&&(S=S(t,f))){Tv(d,S,n,c);break e}w&&w(t,u,f),t==="focusout"&&f&&u.type==="number"&&f.memoizedProps.value!=null&&lm(u,"number",u.value)}switch(w=f?El(f):window,t){case"focusin":(V0(w)||w.contentEditable==="true")&&(Ka=w,cm=f,_l=null);break;case"focusout":_l=cm=Ka=null;break;case"mousedown":um=!0;break;case"contextmenu":case"mouseup":case"dragend":um=!1,K0(d,n,c);break;case"selectionchange":if(iB)break;case"keydown":case"keyup":K0(d,n,c)}var k;if(th)e:{switch(t){case"compositionstart":var A="onCompositionStart";break e;case"compositionend":A="onCompositionEnd";break e;case"compositionupdate":A="onCompositionUpdate";break e}A=void 0}else Wa?Cv(t,n)&&(A="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(kv&&n.locale!=="ko"&&(Wa||A!=="onCompositionStart"?A==="onCompositionEnd"&&Wa&&(k=Sv()):(Wr=c,Zm="value"in Wr?Wr.value:Wr.textContent,Wa=!0)),w=Pc(f,A),0<w.length&&(A=new z0(A,t,null,n,c),d.push({event:A,listeners:w}),k?A.data=k:(k=Av(n),k!==null&&(A.data=k)))),(k=YO?JO(t,n):$O(t,n))&&(A=Pc(f,"onBeforeInput"),0<A.length&&(w=new z0("onBeforeInput","beforeinput",null,n,c),d.push({event:w,listeners:A}),w.data=k)),jB(d,t,f,n,c)}ww(d,e)})}function as(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Pc(t,e){for(var n=e+"Capture",r=[];t!==null;){var o=t,a=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||a===null||(o=Yl(t,n),o!=null&&r.unshift(as(t,o,a)),o=Yl(t,e),o!=null&&r.push(as(t,o,a))),t.tag===3)return r;t=t.return}return[]}function GB(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function EI(t,e,n,r,o){for(var a=e._reactName,i=[];n!==null&&n!==r;){var l=n,s=l.alternate,f=l.stateNode;if(l=l.tag,s!==null&&s===r)break;l!==5&&l!==26&&l!==27||f===null||(s=f,o?(f=Yl(n,a),f!=null&&i.unshift(as(n,f,s))):o||(f=Yl(n,a),f!=null&&i.push(as(n,f,s)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var XB=/\r\n?/g,QB=/\u0000|\uFFFD/g;function FI(t){return(typeof t=="string"?t:""+t).replace(XB,`
`).replace(QB,"")}function kw(t,e){return e=FI(e),FI(t)===e}function ce(t,e,n,r,o,a){switch(n){case"children":typeof r=="string"?e==="body"||e==="textarea"&&r===""||ui(t,r):(typeof r=="number"||typeof r=="bigint")&&e!=="body"&&ui(t,""+r);break;case"className":Uf(t,"class",r);break;case"tabIndex":Uf(t,"tabindex",r);break;case"dir":case"role":case"viewBox":case"width":case"height":Uf(t,n,r);break;case"style":vv(t,r,a);break;case"data":if(e!=="object"){Uf(t,"data",r);break}case"src":case"href":if(r===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(r==null||typeof r=="function"||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=rc(""+r),t.setAttribute(n,r);break;case"action":case"formAction":if(typeof r=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(e!=="input"&&ce(t,e,"name",o.name,o,null),ce(t,e,"formEncType",o.formEncType,o,null),ce(t,e,"formMethod",o.formMethod,o,null),ce(t,e,"formTarget",o.formTarget,o,null)):(ce(t,e,"encType",o.encType,o,null),ce(t,e,"method",o.method,o,null),ce(t,e,"target",o.target,o,null)));if(r==null||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(n);break}r=rc(""+r),t.setAttribute(n,r);break;case"onClick":r!=null&&(t.onclick=pr);break;case"onScroll":r!=null&&$("scroll",t);break;case"onScrollEnd":r!=null&&$("scrollend",t);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(T(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(T(60));t.innerHTML=n}}break;case"multiple":t.multiple=r&&typeof r!="function"&&typeof r!="symbol";break;case"muted":t.muted=r&&typeof r!="function"&&typeof r!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(r==null||typeof r=="function"||typeof r=="boolean"||typeof r=="symbol"){t.removeAttribute("xlink:href");break}n=rc(""+r),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""+r):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":r&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":r===!0?t.setAttribute(n,""):r!==!1&&r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(n,r):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":r!=null&&typeof r!="function"&&typeof r!="symbol"&&!isNaN(r)&&1<=r?t.setAttribute(n,r):t.removeAttribute(n);break;case"rowSpan":case"start":r==null||typeof r=="function"||typeof r=="symbol"||isNaN(r)?t.removeAttribute(n):t.setAttribute(n,r);break;case"popover":$("beforetoggle",t),$("toggle",t),nc(t,"popover",r);break;case"xlinkActuate":ar(t,"http://www.w3.org/1999/xlink","xlink:actuate",r);break;case"xlinkArcrole":ar(t,"http://www.w3.org/1999/xlink","xlink:arcrole",r);break;case"xlinkRole":ar(t,"http://www.w3.org/1999/xlink","xlink:role",r);break;case"xlinkShow":ar(t,"http://www.w3.org/1999/xlink","xlink:show",r);break;case"xlinkTitle":ar(t,"http://www.w3.org/1999/xlink","xlink:title",r);break;case"xlinkType":ar(t,"http://www.w3.org/1999/xlink","xlink:type",r);break;case"xmlBase":ar(t,"http://www.w3.org/XML/1998/namespace","xml:base",r);break;case"xmlLang":ar(t,"http://www.w3.org/XML/1998/namespace","xml:lang",r);break;case"xmlSpace":ar(t,"http://www.w3.org/XML/1998/namespace","xml:space",r);break;case"is":nc(t,"is",r);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=SO.get(n)||n,nc(t,n,r))}}function Lm(t,e,n,r,o,a){switch(n){case"style":vv(t,r,a);break;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(T(61));if(n=r.__html,n!=null){if(o.children!=null)throw Error(T(60));t.innerHTML=n}}break;case"children":typeof r=="string"?ui(t,r):(typeof r=="number"||typeof r=="bigint")&&ui(t,""+r);break;case"onScroll":r!=null&&$("scroll",t);break;case"onScrollEnd":r!=null&&$("scrollend",t);break;case"onClick":r!=null&&(t.onclick=pr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!hv.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(o=n.endsWith("Capture"),e=n.slice(2,o?n.length-7:void 0),a=t[Dt]||null,a=a!=null?a[n]:null,typeof a=="function"&&t.removeEventListener(e,a,o),typeof r=="function")){typeof a!="function"&&a!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,r,o);break e}n in t?t[n]=r:r===!0?t.setAttribute(n,""):nc(t,n,r)}}}function it(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":$("error",t),$("load",t);var r=!1,o=!1,a;for(a in n)if(n.hasOwnProperty(a)){var i=n[a];if(i!=null)switch(a){case"src":r=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(T(137,e));default:ce(t,e,a,i,n,null)}}o&&ce(t,e,"srcSet",n.srcSet,n,null),r&&ce(t,e,"src",n.src,n,null);return;case"input":$("invalid",t);var l=a=i=o=null,s=null,f=null;for(r in n)if(n.hasOwnProperty(r)){var c=n[r];if(c!=null)switch(r){case"name":o=c;break;case"type":i=c;break;case"checked":s=c;break;case"defaultChecked":f=c;break;case"value":a=c;break;case"defaultValue":l=c;break;case"children":case"dangerouslySetInnerHTML":if(c!=null)throw Error(T(137,e));break;default:ce(t,e,r,c,n,null)}}yv(t,a,l,s,f,i,o,!1);return;case"select":$("invalid",t),r=i=a=null;for(o in n)if(n.hasOwnProperty(o)&&(l=n[o],l!=null))switch(o){case"value":a=l;break;case"defaultValue":i=l;break;case"multiple":r=l;default:ce(t,e,o,l,n,null)}e=a,n=i,t.multiple=!!r,e!=null?ri(t,!!r,e,!1):n!=null&&ri(t,!!r,n,!0);return;case"textarea":$("invalid",t),a=o=r=null;for(i in n)if(n.hasOwnProperty(i)&&(l=n[i],l!=null))switch(i){case"value":r=l;break;case"defaultValue":o=l;break;case"children":a=l;break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(T(91));break;default:ce(t,e,i,l,n,null)}Iv(t,r,o,a);return;case"option":for(s in n)n.hasOwnProperty(s)&&(r=n[s],r!=null)&&(s==="selected"?t.selected=r&&typeof r!="function"&&typeof r!="symbol":ce(t,e,s,r,n,null));return;case"dialog":$("beforetoggle",t),$("toggle",t),$("cancel",t),$("close",t);break;case"iframe":case"object":$("load",t);break;case"video":case"audio":for(r=0;r<os.length;r++)$(os[r],t);break;case"image":$("error",t),$("load",t);break;case"details":$("toggle",t);break;case"embed":case"source":case"link":$("error",t),$("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in n)if(n.hasOwnProperty(f)&&(r=n[f],r!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(T(137,e));default:ce(t,e,f,r,n,null)}return;default:if(Jm(e)){for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!==void 0&&Lm(t,e,c,r,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(r=n[l],r!=null&&ce(t,e,l,r,n,null))}function WB(t,e,n,r){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,a=null,i=null,l=null,s=null,f=null,c=null;for(p in n){var d=n[p];if(n.hasOwnProperty(p)&&d!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":s=d;default:r.hasOwnProperty(p)||ce(t,e,p,null,r,d)}}for(var u in r){var p=r[u];if(d=n[u],r.hasOwnProperty(u)&&(p!=null||d!=null))switch(u){case"type":a=p;break;case"name":o=p;break;case"checked":f=p;break;case"defaultChecked":c=p;break;case"value":i=p;break;case"defaultValue":l=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(T(137,e));break;default:p!==d&&ce(t,e,u,p,r,d)}}im(t,i,l,s,f,c,a,o);return;case"select":p=i=l=u=null;for(a in n)if(s=n[a],n.hasOwnProperty(a)&&s!=null)switch(a){case"value":break;case"multiple":p=s;default:r.hasOwnProperty(a)||ce(t,e,a,null,r,s)}for(o in r)if(a=r[o],s=n[o],r.hasOwnProperty(o)&&(a!=null||s!=null))switch(o){case"value":u=a;break;case"defaultValue":l=a;break;case"multiple":i=a;default:a!==s&&ce(t,e,o,a,r,s)}e=l,n=i,r=p,u!=null?ri(t,!!n,u,!1):!!r!=!!n&&(e!=null?ri(t,!!n,e,!0):ri(t,!!n,n?[]:"",!1));return;case"textarea":p=u=null;for(l in n)if(o=n[l],n.hasOwnProperty(l)&&o!=null&&!r.hasOwnProperty(l))switch(l){case"value":break;case"children":break;default:ce(t,e,l,null,r,o)}for(i in r)if(o=r[i],a=n[i],r.hasOwnProperty(i)&&(o!=null||a!=null))switch(i){case"value":u=o;break;case"defaultValue":p=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(T(91));break;default:o!==a&&ce(t,e,i,o,r,a)}bv(t,u,p);return;case"option":for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!=null&&!r.hasOwnProperty(m)&&(m==="selected"?t.selected=!1:ce(t,e,m,null,r,u));for(s in r)u=r[s],p=n[s],r.hasOwnProperty(s)&&u!==p&&(u!=null||p!=null)&&(s==="selected"?t.selected=u&&typeof u!="function"&&typeof u!="symbol":ce(t,e,s,u,r,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)u=n[x],n.hasOwnProperty(x)&&u!=null&&!r.hasOwnProperty(x)&&ce(t,e,x,null,r,u);for(f in r)if(u=r[f],p=n[f],r.hasOwnProperty(f)&&u!==p&&(u!=null||p!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(T(137,e));break;default:ce(t,e,f,u,r,p)}return;default:if(Jm(e)){for(var b in n)u=n[b],n.hasOwnProperty(b)&&u!==void 0&&!r.hasOwnProperty(b)&&Lm(t,e,b,void 0,r,u);for(c in r)u=r[c],p=n[c],!r.hasOwnProperty(c)||u===p||u===void 0&&p===void 0||Lm(t,e,c,u,r,p);return}}for(var h in n)u=n[h],n.hasOwnProperty(h)&&u!=null&&!r.hasOwnProperty(h)&&ce(t,e,h,null,r,u);for(d in r)u=r[d],p=n[d],!r.hasOwnProperty(d)||u===p||u==null&&p==null||ce(t,e,d,u,r,p)}function LI(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function KB(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),r=0;r<n.length;r++){var o=n[r],a=o.transferSize,i=o.initiatorType,l=o.duration;if(a&&l&&LI(i)){for(i=0,l=o.responseEnd,r+=1;r<n.length;r++){var s=n[r],f=s.startTime;if(f>l)break;var c=s.transferSize,d=s.initiatorType;c&&LI(d)&&(s=s.responseEnd,i+=c*(s<l?1:(l-f)/(s-f)))}if(--r,e+=8*(a+i)/(o.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Nm=null,qm=null;function zc(t){return t.nodeType===9?t:t.ownerDocument}function NI(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Cw(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function _m(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Wp=null;function YB(){var t=window.event;return t&&t.type==="popstate"?t===Wp?!1:(Wp=t,!0):(Wp=null,!1)}var Aw=typeof setTimeout=="function"?setTimeout:void 0,JB=typeof clearTimeout=="function"?clearTimeout:void 0,qI=typeof Promise=="function"?Promise:void 0,$B=typeof queueMicrotask=="function"?queueMicrotask:typeof qI<"u"?function(t){return qI.resolve(null).then(t).catch(ZB)}:Aw;function ZB(t){setTimeout(function(){throw t})}function po(t){return t==="head"}function _I(t,e){var n=e,r=0;do{var o=n.nextSibling;if(t.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"||n==="/&"){if(r===0){t.removeChild(o),bi(e);return}r--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")r++;else if(n==="html")Wl(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Wl(n);for(var a=n.firstChild;a;){var i=a.nextSibling,l=a.nodeName;a[ps]||l==="SCRIPT"||l==="STYLE"||l==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=i}}else n==="body"&&Wl(t.ownerDocument.body);n=o}while(n);bi(e)}function PI(t,e){var n=t;t=0;do{var r=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=r}while(n)}function Pm(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Pm(n),Ym(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function eR(t,e,n,r){for(;t.nodeType===1;){var o=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!r&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(r){if(!t[ps])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(a=t.getAttribute("rel"),a==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(a!==o.rel||t.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||t.getAttribute("title")!==(o.title==null?null:o.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(a=t.getAttribute("src"),(a!==(o.src==null?null:o.src)||t.getAttribute("type")!==(o.type==null?null:o.type)||t.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&a&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var a=o.name==null?null:""+o.name;if(o.type==="hidden"&&t.getAttribute("name")===a)return t}else return t;if(t=pn(t.nextSibling),t===null)break}return null}function tR(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=pn(t.nextSibling),t===null))return null;return t}function Tw(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=pn(t.nextSibling),t===null))return null;return t}function zm(t){return t.data==="$?"||t.data==="$~"}function Hm(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function nR(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var r=function(){e(),n.removeEventListener("DOMContentLoaded",r)};n.addEventListener("DOMContentLoaded",r),t._reactRetry=r}}function pn(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Um=null;function zI(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return pn(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function HI(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function Mw(t,e,n){switch(e=zc(n),t){case"html":if(t=e.documentElement,!t)throw Error(T(452));return t;case"head":if(t=e.head,!t)throw Error(T(453));return t;case"body":if(t=e.body,!t)throw Error(T(454));return t;default:throw Error(T(451))}}function Wl(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);Ym(t)}var mn=new Map,UI=new Set;function Hc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Sr=oe.d;oe.d={f:rR,r:oR,D:aR,C:iR,L:lR,m:sR,X:cR,S:fR,M:uR};function rR(){var t=Sr.f(),e=ou();return t||e}function oR(t){var e=vi(t);e!==null&&e.tag===5&&e.type==="form"?v1(e):Sr.r(t)}var Ci=typeof document>"u"?null:document;function Dw(t,e,n){var r=Ci;if(r&&typeof e=="string"&&e){var o=fn(e);o='link[rel="'+t+'"][href="'+o+'"]',typeof n=="string"&&(o+='[crossorigin="'+n+'"]'),UI.has(o)||(UI.add(o),t={rel:t,crossOrigin:n,href:e},r.querySelector(o)===null&&(e=r.createElement("link"),it(e,"link",t),Ke(e),r.head.appendChild(e)))}}function aR(t){Sr.D(t),Dw("dns-prefetch",t,null)}function iR(t,e){Sr.C(t,e),Dw("preconnect",t,e)}function lR(t,e,n){Sr.L(t,e,n);var r=Ci;if(r&&t&&e){var o='link[rel="preload"][as="'+fn(e)+'"]';e==="image"&&n&&n.imageSrcSet?(o+='[imagesrcset="'+fn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(o+='[imagesizes="'+fn(n.imageSizes)+'"]')):o+='[href="'+fn(t)+'"]';var a=o;switch(e){case"style":a=yi(t);break;case"script":a=Ai(t)}mn.has(a)||(t=ke({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),mn.set(a,t),r.querySelector(o)!==null||e==="style"&&r.querySelector(bs(a))||e==="script"&&r.querySelector(Is(a))||(e=r.createElement("link"),it(e,"link",t),Ke(e),r.head.appendChild(e)))}}function sR(t,e){Sr.m(t,e);var n=Ci;if(n&&t){var r=e&&typeof e.as=="string"?e.as:"script",o='link[rel="modulepreload"][as="'+fn(r)+'"][href="'+fn(t)+'"]',a=o;switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Ai(t)}if(!mn.has(a)&&(t=ke({rel:"modulepreload",href:t},e),mn.set(a,t),n.querySelector(o)===null)){switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Is(a)))return}r=n.createElement("link"),it(r,"link",t),Ke(r),n.head.appendChild(r)}}}function fR(t,e,n){Sr.S(t,e,n);var r=Ci;if(r&&t){var o=ni(r).hoistableStyles,a=yi(t);e=e||"default";var i=o.get(a);if(!i){var l={loading:0,preload:null};if(i=r.querySelector(bs(a)))l.loading=5;else{t=ke({rel:"stylesheet",href:t,"data-precedence":e},n),(n=mn.get(a))&&Lh(t,n);var s=i=r.createElement("link");Ke(s),it(s,"link",t),s._p=new Promise(function(f,c){s.onload=f,s.onerror=c}),s.addEventListener("load",function(){l.loading|=1}),s.addEventListener("error",function(){l.loading|=2}),l.loading|=4,pc(i,e,r)}i={type:"stylesheet",instance:i,count:1,state:l},o.set(a,i)}}}function cR(t,e){Sr.X(t,e);var n=Ci;if(n&&t){var r=ni(n).hoistableScripts,o=Ai(t),a=r.get(o);a||(a=n.querySelector(Is(o)),a||(t=ke({src:t,async:!0},e),(e=mn.get(o))&&Nh(t,e),a=n.createElement("script"),Ke(a),it(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function uR(t,e){Sr.M(t,e);var n=Ci;if(n&&t){var r=ni(n).hoistableScripts,o=Ai(t),a=r.get(o);a||(a=n.querySelector(Is(o)),a||(t=ke({src:t,async:!0,type:"module"},e),(e=mn.get(o))&&Nh(t,e),a=n.createElement("script"),Ke(a),it(a,"link",t),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},r.set(o,a))}}function jI(t,e,n,r){var o=(o=$r.current)?Hc(o):null;if(!o)throw Error(T(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=yi(n.href),n=ni(o).hoistableStyles,r=n.get(e),r||(r={type:"style",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=yi(n.href);var a=ni(o).hoistableStyles,i=a.get(t);if(i||(o=o.ownerDocument||o,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(t,i),(a=o.querySelector(bs(t)))&&!a._p&&(i.instance=a,i.state.loading=5),mn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mn.set(t,n),a||dR(o,t,n,i.state))),e&&r===null)throw Error(T(528,""));return i}if(e&&r!==null)throw Error(T(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Ai(n),n=ni(o).hoistableScripts,r=n.get(e),r||(r={type:"script",instance:null,count:0,state:null},n.set(e,r)),r):{type:"void",instance:null,count:0,state:null};default:throw Error(T(444,t))}}function yi(t){return'href="'+fn(t)+'"'}function bs(t){return'link[rel="stylesheet"]['+t+"]"}function Ow(t){return ke({},t,{"data-precedence":t.precedence,precedence:null})}function dR(t,e,n,r){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?r.loading=1:(e=t.createElement("link"),r.preload=e,e.addEventListener("load",function(){return r.loading|=1}),e.addEventListener("error",function(){return r.loading|=2}),it(e,"link",n),Ke(e),t.head.appendChild(e))}function Ai(t){return'[src="'+fn(t)+'"]'}function Is(t){return"script[async]"+t}function VI(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var r=t.querySelector('style[data-href~="'+fn(n.href)+'"]');if(r)return e.instance=r,Ke(r),r;var o=ke({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(t.ownerDocument||t).createElement("style"),Ke(r),it(r,"style",o),pc(r,n.precedence,t),e.instance=r;case"stylesheet":o=yi(n.href);var a=t.querySelector(bs(o));if(a)return e.state.loading|=4,e.instance=a,Ke(a),a;r=Ow(n),(o=mn.get(o))&&Lh(r,o),a=(t.ownerDocument||t).createElement("link"),Ke(a);var i=a;return i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),it(a,"link",r),e.state.loading|=4,pc(a,n.precedence,t),e.instance=a;case"script":return a=Ai(n.src),(o=t.querySelector(Is(a)))?(e.instance=o,Ke(o),o):(r=n,(o=mn.get(a))&&(r=ke({},n),Nh(r,o)),t=t.ownerDocument||t,o=t.createElement("script"),Ke(o),it(o,"link",r),t.head.appendChild(o),e.instance=o);case"void":return null;default:throw Error(T(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(r=e.instance,e.state.loading|=4,pc(r,n.precedence,t));return e.instance}function pc(t,e,n){for(var r=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=r.length?r[r.length-1]:null,a=o,i=0;i<r.length;i++){var l=r[i];if(l.dataset.precedence===e)a=l;else if(a!==o)break}a?a.parentNode.insertBefore(t,a.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Lh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Nh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var mc=null;function GI(t,e,n){if(mc===null){var r=new Map,o=mc=new Map;o.set(n,r)}else o=mc,r=o.get(n),r||(r=new Map,o.set(n,r));if(r.has(t))return r;for(r.set(t,null),n=n.getElementsByTagName(t),o=0;o<n.length;o++){var a=n[o];if(!(a[ps]||a[rt]||t==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var i=a.getAttribute(e)||"";i=t+i;var l=r.get(i);l?l.push(a):r.set(i,[a])}}return r}function XI(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function pR(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function Bw(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function mR(t,e,n,r){if(n.type==="stylesheet"&&(typeof r.media!="string"||matchMedia(r.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var o=yi(r.href),a=e.querySelector(bs(o));if(a){e=a._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Uc.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=a,Ke(a);return}a=e.ownerDocument||e,r=Ow(r),(o=mn.get(o))&&Lh(r,o),a=a.createElement("link"),Ke(a);var i=a;i._p=new Promise(function(l,s){i.onload=l,i.onerror=s}),it(a,"link",r),n.instance=a}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=Uc.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Kp=0;function hR(t,e){return t.stylesheets&&t.count===0&&hc(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var r=setTimeout(function(){if(t.stylesheets&&hc(t,t.stylesheets),t.unsuspend){var a=t.unsuspend;t.unsuspend=null,a()}},6e4+e);0<t.imgBytes&&Kp===0&&(Kp=62500*KB());var o=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&hc(t,t.stylesheets),t.unsuspend)){var a=t.unsuspend;t.unsuspend=null,a()}},(t.imgBytes>Kp?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(r),clearTimeout(o)}}:null}function Uc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)hc(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var jc=null;function hc(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,jc=new Map,e.forEach(xR,t),jc=null,Uc.call(t))}function xR(t,e){if(!(e.state.loading&4)){var n=jc.get(t);if(n)var r=n.get(null);else{n=new Map,jc.set(t,n);for(var o=t.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<o.length;a++){var i=o[a];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),r=i)}r&&n.set(null,r)}o=e.instance,i=o.getAttribute("data-precedence"),a=n.get(i)||r,a===r&&n.set(null,o),n.set(i,o),this.count++,r=Uc.bind(this),o.addEventListener("load",r),o.addEventListener("error",r),a?a.parentNode.insertBefore(o,a.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(o,t.firstChild)),e.state.loading|=4}}var is={$$typeof:dr,Provider:null,Consumer:null,_currentValue:Ho,_currentValue2:Ho,_threadCount:0};function gR(t,e,n,r,o,a,i,l,s){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=vp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=vp(0),this.hiddenUpdates=vp(null),this.identifierPrefix=r,this.onUncaughtError=o,this.onCaughtError=a,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=s,this.incompleteTransitions=new Map}function Rw(t,e,n,r,o,a,i,l,s,f,c,d){return t=new gR(t,e,n,i,s,f,c,d,l),e=1,a===!0&&(e|=24),a=Ht(3,null,null,e),t.current=a,a.stateNode=t,e=sh(),e.refCount++,t.pooledCache=e,e.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:e},uh(a),t}function Ew(t){return t?(t=$a,t):$a}function Fw(t,e,n,r,o,a){o=Ew(o),r.context===null?r.context=o:r.pendingContext=o,r=eo(e),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=to(t,r,e),n!==null&&(Mt(n,t,e),zl(n,t,e))}function QI(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function qh(t,e){QI(t,e),(t=t.alternate)&&QI(t,e)}function Lw(t){if(t.tag===13||t.tag===31){var e=ea(t,67108864);e!==null&&Mt(e,t,67108864),qh(t,67108864)}}function WI(t){if(t.tag===13||t.tag===31){var e=Xt();e=Wm(e);var n=ea(t,e);n!==null&&Mt(n,t,e),qh(t,e)}}var Vc=!0;function yR(t,e,n,r){var o=j.T;j.T=null;var a=oe.p;try{oe.p=2,_h(t,e,n,r)}finally{oe.p=a,j.T=o}}function bR(t,e,n,r){var o=j.T;j.T=null;var a=oe.p;try{oe.p=8,_h(t,e,n,r)}finally{oe.p=a,j.T=o}}function _h(t,e,n,r){if(Vc){var o=jm(r);if(o===null)Qp(t,e,r,Gc,n),KI(t,r);else if(vR(o,t,e,n,r))r.stopPropagation();else if(KI(t,r),e&4&&-1<IR.indexOf(t)){for(;o!==null;){var a=vi(o);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var i=_o(a.pendingLanes);if(i!==0){var l=a;for(l.pendingLanes|=2,l.entangledLanes|=2;i;){var s=1<<31-Gt(i);l.entanglements[1]|=s,i&=~s}Qn(a),(re&6)===0&&(Fc=jt()+500,ys(0,!1))}}break;case 31:case 13:l=ea(a,2),l!==null&&Mt(l,a,2),ou(),qh(a,2)}if(a=jm(r),a===null&&Qp(t,e,r,Gc,n),a===o)break;o=a}o!==null&&r.stopPropagation()}else Qp(t,e,r,null,n)}}function jm(t){return t=$m(t),Ph(t)}var Gc=null;function Ph(t){if(Gc=null,t=Xa(t),t!==null){var e=fs(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=tv(e),t!==null)return t;t=null}else if(n===31){if(t=nv(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Gc=t,null}function Nw(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(lO()){case iv:return 2;case lv:return 8;case Ic:case sO:return 32;case sv:return 268435456;default:return 32}default:return 32}}var Vm=!1,oo=null,ao=null,io=null,ls=new Map,ss=new Map,Xr=[],IR="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function KI(t,e){switch(t){case"focusin":case"focusout":oo=null;break;case"dragenter":case"dragleave":ao=null;break;case"mouseover":case"mouseout":io=null;break;case"pointerover":case"pointerout":ls.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ss.delete(e.pointerId)}}function Dl(t,e,n,r,o,a){return t===null||t.nativeEvent!==a?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[o]},e!==null&&(e=vi(e),e!==null&&Lw(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,o!==null&&e.indexOf(o)===-1&&e.push(o),t)}function vR(t,e,n,r,o){switch(e){case"focusin":return oo=Dl(oo,t,e,n,r,o),!0;case"dragenter":return ao=Dl(ao,t,e,n,r,o),!0;case"mouseover":return io=Dl(io,t,e,n,r,o),!0;case"pointerover":var a=o.pointerId;return ls.set(a,Dl(ls.get(a)||null,t,e,n,r,o)),!0;case"gotpointercapture":return a=o.pointerId,ss.set(a,Dl(ss.get(a)||null,t,e,n,r,o)),!0}return!1}function qw(t){var e=Xa(t.target);if(e!==null){var n=fs(e);if(n!==null){if(e=n.tag,e===13){if(e=tv(n),e!==null){t.blockedOn=e,R0(t.priority,function(){WI(n)});return}}else if(e===31){if(e=nv(n),e!==null){t.blockedOn=e,R0(t.priority,function(){WI(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function xc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=jm(t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);sm=r,n.target.dispatchEvent(r),sm=null}else return e=vi(n),e!==null&&Lw(e),t.blockedOn=n,!1;e.shift()}return!0}function YI(t,e,n){xc(t)&&n.delete(e)}function wR(){Vm=!1,oo!==null&&xc(oo)&&(oo=null),ao!==null&&xc(ao)&&(ao=null),io!==null&&xc(io)&&(io=null),ls.forEach(YI),ss.forEach(YI)}function ec(t,e){t.blockedOn===e&&(t.blockedOn=null,Vm||(Vm=!0,Ge.unstable_scheduleCallback(Ge.unstable_NormalPriority,wR)))}var tc=null;function JI(t){tc!==t&&(tc=t,Ge.unstable_scheduleCallback(Ge.unstable_NormalPriority,function(){tc===t&&(tc=null);for(var e=0;e<t.length;e+=3){var n=t[e],r=t[e+1],o=t[e+2];if(typeof r!="function"){if(Ph(r||n)===null)continue;break}var a=vi(n);a!==null&&(t.splice(e,3),e-=3,km(a,{pending:!0,data:o,method:n.method,action:r},r,o))}}))}function bi(t){function e(s){return ec(s,t)}oo!==null&&ec(oo,t),ao!==null&&ec(ao,t),io!==null&&ec(io,t),ls.forEach(e),ss.forEach(e);for(var n=0;n<Xr.length;n++){var r=Xr[n];r.blockedOn===t&&(r.blockedOn=null)}for(;0<Xr.length&&(n=Xr[0],n.blockedOn===null);)qw(n),n.blockedOn===null&&Xr.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var o=n[r],a=n[r+1],i=o[Dt]||null;if(typeof a=="function")i||JI(n);else if(i){var l=null;if(a&&a.hasAttribute("formAction")){if(o=a,i=a[Dt]||null)l=i.formAction;else if(Ph(o)!==null)continue}else l=i.action;typeof l=="function"?n[r+1]=l:(n.splice(r,3),r-=3),JI(n)}}}function _w(){function t(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(i){return o=i})},focusReset:"manual",scroll:"manual"})}function e(){o!==null&&(o(),o=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var r=!1,o=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){r=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),o!==null&&(o(),o=null)}}}function zh(t){this._internalRoot=t}lu.prototype.render=zh.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(T(409));var n=e.current,r=Xt();Fw(n,r,t,e,null,null)};lu.prototype.unmount=zh.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Fw(t.current,2,null,t,null,null),ou(),e[Ii]=null}};function lu(t){this._internalRoot=t}lu.prototype.unstable_scheduleHydration=function(t){if(t){var e=pv();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Xr.length&&e!==0&&e<Xr[n].priority;n++);Xr.splice(n,0,t),n===0&&qw(t)}};var $I=ZI.version;if($I!=="19.2.6")throw Error(T(527,$I,"19.2.6"));oe.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(T(188)):(t=Object.keys(t).join(","),Error(T(268,t)));return t=eO(e),t=t!==null?rv(t):null,t=t===null?null:t.stateNode,t};var SR={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:j,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ol=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ol.isDisabled&&Ol.supportsFiber))try{cs=Ol.inject(SR),Vt=Ol}catch{}var Ol;su.createRoot=function(t,e){if(!ev(t))throw Error(T(299));var n=!1,r="",o=D1,a=O1,i=B1;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onUncaughtError!==void 0&&(o=e.onUncaughtError),e.onCaughtError!==void 0&&(a=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=Rw(t,1,!1,null,null,n,r,null,o,a,i,_w),t[Ii]=e.current,Fh(t),new zh(e)};su.hydrateRoot=function(t,e,n){if(!ev(t))throw Error(T(299));var r=!1,o="",a=D1,i=O1,l=B1,s=null;return n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(l=n.onRecoverableError),n.formState!==void 0&&(s=n.formState)),e=Rw(t,1,!0,e,n??null,r,o,s,a,i,l,_w),e.context=Ew(null),n=e.current,r=Xt(),r=Wm(r),o=eo(r),o.callback=null,to(n,o,r),n=r,e.current.lanes=n,ds(e,n),Qn(e),t[Ii]=e.current,Fh(t),new lu(e)};su.version="19.2.6"});var Uw=Cn((jq,Hw)=>{"use strict";function zw(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(zw)}catch(t){console.error(t)}}zw(),Hw.exports=Pw()});var jw,Vw=E(()=>{jw={outline:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},filled:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"currentColor",stroke:"none"}}});var Ti,K,qe=E(()=>{Ti=Y(mt(),1);Vw();K=(t,e,n,r)=>{let o=(0,Ti.forwardRef)(({color:a="currentColor",size:i=24,stroke:l=2,title:s,className:f,children:c,...d},u)=>(0,Ti.createElement)("svg",{ref:u,...jw[t],width:i,height:i,className:["tabler-icon",`tabler-icon-${e}`,f].join(" "),...t==="filled"?{fill:a}:{strokeWidth:l,stroke:a},...d},[s&&(0,Ti.createElement)("title",{key:"svg-title"},s),...r.map(([p,m])=>(0,Ti.createElement)(p,m)),...Array.isArray(c)?c:[c]]));return o.displayName=`${n}`,o}});var kR,fu,Gw=E(()=>{qe();kR=[["path",{d:"M12 9v4",key:"svg-0"}],["path",{d:"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0",key:"svg-1"}],["path",{d:"M12 16h.01",key:"svg-2"}]],fu=K("outline","alert-triangle","AlertTriangle",kR)});var CR,Hh,Xw=E(()=>{qe();CR=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 13l-6 6",key:"svg-1"}],["path",{d:"M6 13l6 6",key:"svg-2"}]],Hh=K("outline","arrow-down","ArrowDown",CR)});var AR,Uh,Qw=E(()=>{qe();AR=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 11l-6 -6",key:"svg-1"}],["path",{d:"M6 11l6 -6",key:"svg-2"}]],Uh=K("outline","arrow-up","ArrowUp",AR)});var TR,na,Ww=E(()=>{qe();TR=[["path",{d:"M6 9l6 6l6 -6",key:"svg-0"}]],na=K("outline","chevron-down","ChevronDown",TR)});var MR,jh,Kw=E(()=>{qe();MR=[["path",{d:"M9 6l6 6l-6 6",key:"svg-0"}]],jh=K("outline","chevron-right","ChevronRight",MR)});var DR,Vh,Yw=E(()=>{qe();DR=[["path",{d:"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666",key:"svg-0"}],["path",{d:"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",key:"svg-1"}]],Vh=K("outline","copy","Copy",DR)});var OR,cu,Jw=E(()=>{qe();OR=[["path",{d:"M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0",key:"svg-0"}],["path",{d:"M4 6v6a8 3 0 0 0 16 0v-6",key:"svg-1"}],["path",{d:"M4 12v6a8 3 0 0 0 16 0v-6",key:"svg-2"}]],cu=K("outline","database","Database",OR)});var BR,Gh,$w=E(()=>{qe();BR=[["path",{d:"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2",key:"svg-0"}],["path",{d:"M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",key:"svg-1"}],["path",{d:"M14 4l0 4l-6 0l0 -4",key:"svg-2"}]],Gh=K("outline","device-floppy","DeviceFloppy",BR)});var RR,Xh,Zw=E(()=>{qe();RR=[["path",{d:"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",key:"svg-1"}]],Xh=K("outline","eye","Eye",RR)});var ER,Qh,eS=E(()=>{qe();ER=[["path",{d:"M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}]],Qh=K("outline","filter","Filter",ER)});var FR,uu,tS=E(()=>{qe();FR=[["path",{d:"M12 11v8l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M9 7l1 0",key:"svg-1"}],["path",{d:"M14 7l1 0",key:"svg-2"}],["path",{d:"M19 7l1 0",key:"svg-3"}],["path",{d:"M4 7l1 0",key:"svg-4"}]],uu=K("outline","fold-down","FoldDown",FR)});var LR,du,nS=E(()=>{qe();LR=[["path",{d:"M12 3v6l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M12 21v-6l3 3m-6 0l3 -3",key:"svg-1"}],["path",{d:"M4 12l1 0",key:"svg-2"}],["path",{d:"M9 12l1 0",key:"svg-3"}],["path",{d:"M14 12l1 0",key:"svg-4"}],["path",{d:"M19 12l1 0",key:"svg-5"}]],du=K("outline","fold","Fold",LR)});var NR,Wh,rS=E(()=>{qe();NR=[["path",{d:"M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2",key:"svg-0"}]],Wh=K("outline","folder-open","FolderOpen",NR)});var qR,Kh,oS=E(()=>{qe();qR=[["path",{d:"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0",key:"svg-0"}],["path",{d:"M15 9h.01",key:"svg-1"}]],Kh=K("outline","key","Key",qR)});var _R,Yh,aS=E(()=>{qe();_R=[["path",{d:"M7 4v16l13 -8l-13 -8",key:"svg-0"}]],Yh=K("outline","player-play","PlayerPlay",_R)});var PR,Jh,iS=E(()=>{qe();PR=[["path",{d:"M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10",key:"svg-0"}]],Jh=K("outline","player-stop","PlayerStop",PR)});var zR,$h,lS=E(()=>{qe();zR=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M5 12l14 0",key:"svg-1"}]],$h=K("outline","plus","Plus",zR)});var HR,Zh,sS=E(()=>{qe();HR=[["path",{d:"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-0"}],["path",{d:"M15.51 15.56a5 5 0 1 0 -3.51 1.44",key:"svg-1"}],["path",{d:"M18.832 17.86a9 9 0 1 0 -6.832 3.14",key:"svg-2"}],["path",{d:"M12 12v9",key:"svg-3"}]],Zh=K("outline","radar-2","Radar2",HR)});var UR,ex,fS=E(()=>{qe();UR=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M3 10h18",key:"svg-1"}],["path",{d:"M10 3v18",key:"svg-2"}]],ex=K("outline","table","Table",UR)});var jR,ra,cS=E(()=>{qe();jR=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],ra=K("outline","x","X",jR)});var kr=E(()=>{Gw();Xw();Qw();Ww();Kw();Yw();Jw();$w();Zw();eS();tS();nS();rS();oS();aS();iS();lS();sS();fS();cS();});var uS,dS,tx=E(()=>{uS=t=>{let e,n=new Set,r=(f,c)=>{let d=typeof f=="function"?f(e):f;if(!Object.is(d,e)){let u=e;e=c??(typeof d!="object"||d===null)?d:Object.assign({},e,d),n.forEach(p=>p(e,u))}},o=()=>e,l={setState:r,getState:o,getInitialState:()=>s,subscribe:f=>(n.add(f),()=>n.delete(f))},s=e=t(r,o,l);return l},dS=(t=>t?uS(t):uS)});function GR(t,e=VR){let n=vs.default.useSyncExternalStore(t.subscribe,vs.default.useCallback(()=>e(t.getState()),[t,e]),vs.default.useCallback(()=>e(t.getInitialState()),[t,e]));return vs.default.useDebugValue(n),n}var vs,VR,pS,mS,hS=E(()=>{vs=Y(mt(),1);tx();VR=t=>t;pS=t=>{let e=dS(t),n=r=>GR(e,r);return Object.assign(n,e),n},mS=(t=>t?pS(t):pS)});var xS=E(()=>{tx();hS()});function IS(t,e,n,r){switch(t){case-2:return n<e;case-1:return r>=e&&n<e;case 0:return n<e&&r>e;case 1:return n<=e&&r>e;case 2:return r>e;case 4:return!0}}function ks(t,e,n,r){for(var o;t.from==t.to||(n<1?t.from>=e:t.from>e)||(n>-1?t.to<=e:t.to<e);){let i=!r&&t instanceof Wn&&t.index<0?null:t.parent;if(!i)return t;t=i}let a=r?0:Me.IgnoreOverlays;if(r)for(let i=t,l=i.parent;l;i=l,l=i.parent)i instanceof Wn&&i.index<0&&((o=l.enter(e,n,a))===null||o===void 0?void 0:o.from)!=i.from&&(t=l);for(;;){let i=t.enter(e,n,a);if(!i)return t;t=i}}function yS(t,e,n,r){let o=t.cursor(),a=[];if(!o.firstChild())return a;if(n!=null){for(let i=!1;!i;)if(i=o.type.is(n),!o.nextSibling())return a}for(;;){if(r!=null&&o.type.is(r))return a;if(o.type.is(e)&&a.push(o.node),!o.nextSibling())return r==null?a:[]}}function rx(t,e,n=e.length-1){for(let r=t;n>=0;r=r.parent){if(!r)return!1;if(!r.type.isAnonymous){if(e[n]&&e[n]!=r.name)return!1;n--}}return!0}function vS(t){if(!t.length)return null;let e=0,n=t[0];for(let a=1;a<t.length;a++){let i=t[a];(i.from>n.from||i.to<n.to)&&(n=i,e=a)}let r=n instanceof Wn&&n.index<0?null:n.parent,o=t.slice();return r?o[e]=r:o.splice(e,1),new ax(o,n)}function WR(t,e,n){let r=t.resolveInner(e,n),o=null;for(let a=r instanceof Wn?r:r.context.parent;a;a=a.parent)if(a.index<0){let i=a.parent;(o||(o=[r])).push(i.resolve(e,n)),a=i}else{let i=oa.get(a.tree);if(i&&i.overlay&&i.overlay[0].from<=e&&i.overlay[i.overlay.length-1].to>=e){let l=new Wn(i.tree,i.overlay[0].from+a.from,-1,a);(o||(o=[r])).push(ks(l,e,n,!1))}}return o?vS(o):r}function lx(t){return t.children.some(e=>e instanceof mo||!e.type.isAnonymous||lx(e))}function KR(t){var e;let{buffer:n,nodeSet:r,maxBufferLength:o=1024,reused:a=[],minRepeatType:i=r.types.length}=t,l=Array.isArray(n)?new nx(n,n.length):n,s=r.types,f=0,c=0;function d(v,S,w,k,A,R){let{id:F,start:L,end:C,size:_}=l,Q=c,J=f;if(_<0)if(l.next(),_==-1){let St=a[F];w.push(St),k.push(L-v);return}else if(_==-3){f=F;return}else if(_==-4){c=F;return}else throw new RangeError(`Unrecognized record size: ${_}`);let tt=s[F],kn,_t,bl=L-v;if(C-L<=o&&(_t=b(l.pos-S,A))){let St=new Uint16Array(_t.size-_t.skip),nn=l.pos-_t.size,zn=St.length;for(;l.pos>nn;)zn=h(_t.start,St,zn);kn=new mo(St,C-_t.start,r),bl=_t.start-v}else{let St=l.pos-_;l.next();let nn=[],zn=[],Lo=F>=i?F:-1,Fa=0,Rf=C;for(;l.pos>St;)Lo>=0&&l.id==Lo&&l.size>=0?(l.end<=Rf-o&&(m(nn,zn,L,Fa,l.end,Rf,Lo,Q,J),Fa=nn.length,Rf=l.end),l.next()):R>2500?u(L,St,nn,zn):d(L,St,nn,zn,Lo,R+1);if(Lo>=0&&Fa>0&&Fa<nn.length&&m(nn,zn,L,Fa,L,Rf,Lo,Q,J),nn.reverse(),zn.reverse(),Lo>-1&&Fa>0){let Zb=p(tt,J);kn=sx(tt,nn,zn,0,nn.length,0,C-L,Zb,Zb)}else kn=x(tt,nn,zn,C-L,Q-C,J)}w.push(kn),k.push(bl)}function u(v,S,w,k){let A=[],R=0,F=-1;for(;l.pos>S;){let{id:L,start:C,end:_,size:Q}=l;if(Q>4)l.next();else{if(F>-1&&C<F)break;F<0&&(F=_-o),A.push(L,C,_),R++,l.next()}}if(R){let L=new Uint16Array(R*4),C=A[A.length-2];for(let _=A.length-3,Q=0;_>=0;_-=3)L[Q++]=A[_],L[Q++]=A[_+1]-C,L[Q++]=A[_+2]-C,L[Q++]=Q;w.push(new mo(L,A[2]-C,r)),k.push(C-v)}}function p(v,S){return(w,k,A)=>{let R=0,F=w.length-1,L,C;if(F>=0&&(L=w[F])instanceof _e){if(!F&&L.type==v&&L.length==A)return L;(C=L.prop(V.lookAhead))&&(R=k[F]+L.length+C)}return x(v,w,k,A,R,S)}}function m(v,S,w,k,A,R,F,L,C){let _=[],Q=[];for(;v.length>k;)_.push(v.pop()),Q.push(S.pop()+w-A);v.push(x(r.types[F],_,Q,R-A,L-R,C)),S.push(A-w)}function x(v,S,w,k,A,R,F){if(R){let L=[V.contextHash,R];F=F?[L].concat(F):[L]}if(A>25){let L=[V.lookAhead,A];F=F?[L].concat(F):[L]}return new _e(v,S,w,k,F)}function b(v,S){let w=l.fork(),k=0,A=0,R=0,F=w.end-o,L={size:0,start:0,skip:0};e:for(let C=w.pos-v;w.pos>C;){let _=w.size;if(w.id==S&&_>=0){L.size=k,L.start=A,L.skip=R,R+=4,k+=4,w.next();continue}let Q=w.pos-_;if(_<0||Q<C||w.start<F)break;let J=w.id>=i?4:0,tt=w.start;for(w.next();w.pos>Q;){if(w.size<0)if(w.size==-3||w.size==-4)J+=4;else break e;else w.id>=i&&(J+=4);w.next()}A=tt,k+=_,R+=J}return(S<0||k==v)&&(L.size=k,L.start=A,L.skip=R),L.size>4?L:void 0}function h(v,S,w){let{id:k,start:A,end:R,size:F}=l;if(l.next(),F>=0&&k<i){let L=w;if(F>4){let C=l.pos-(F-4);for(;l.pos>C;)w=h(v,S,w)}S[--w]=L,S[--w]=R-v,S[--w]=A-v,S[--w]=k}else F==-3?f=k:F==-4&&(c=k);return w}let y=[],g=[];for(;l.pos>0;)d(t.start||0,t.bufferStart||0,y,g,-1,0);let I=(e=t.length)!==null&&e!==void 0?e:y.length?g[0]+y[0].length:0;return new _e(s[t.topID],y.reverse(),g.reverse(),I)}function mu(t,e){if(!t.isAnonymous||e instanceof mo||e.type!=t)return 1;let n=bS.get(e);if(n==null){n=1;for(let r of e.children){if(r.type!=t||!(r instanceof _e)){n=1;break}n+=mu(t,r)}bS.set(e,n)}return n}function sx(t,e,n,r,o,a,i,l,s){let f=0;for(let m=r;m<o;m++)f+=mu(t,e[m]);let c=Math.ceil(f*1.5/8),d=[],u=[];function p(m,x,b,h,y){for(let g=b;g<h;){let I=g,v=x[g],S=mu(t,m[g]);for(g++;g<h;g++){let w=mu(t,m[g]);if(S+w>=c)break;S+=w}if(g==I+1){if(S>c){let w=m[I];p(w.children,w.positions,0,w.children.length,x[I]+y);continue}d.push(m[I])}else{let w=x[g-1]+m[g-1].length-v;d.push(sx(t,m,x,I,g,v,w,null,s))}u.push(v+y-a)}}return p(e,n,r,o,0),(l||s)(d,u,i)}var XR,ws,V,oa,QR,ft,Ss,pu,gS,Me,_e,nx,mo,hu,Wn,ox,Cs,ax,As,bS,aa,Mi,ix,i_,Ts=E(()=>{XR=0,ws=class{constructor(e,n){this.from=e,this.to=n}},V=class{constructor(e={}){this.id=XR++,this.perNode=!!e.perNode,this.deserialize=e.deserialize||(()=>{throw new Error("This node type doesn't define a deserialize function")}),this.combine=e.combine||null}add(e){if(this.perNode)throw new RangeError("Can't add per-node props to node types");return typeof e!="function"&&(e=ft.match(e)),n=>{let r=e(n);return r===void 0?null:[this,r]}}};V.closedBy=new V({deserialize:t=>t.split(" ")});V.openedBy=new V({deserialize:t=>t.split(" ")});V.group=new V({deserialize:t=>t.split(" ")});V.isolate=new V({deserialize:t=>{if(t&&t!="rtl"&&t!="ltr"&&t!="auto")throw new RangeError("Invalid value for isolate: "+t);return t||"auto"}});V.contextHash=new V({perNode:!0});V.lookAhead=new V({perNode:!0});V.mounted=new V({perNode:!0});oa=class{constructor(e,n,r,o=!1){this.tree=e,this.overlay=n,this.parser=r,this.bracketed=o}static get(e){return e&&e.props&&e.props[V.mounted.id]}},QR=Object.create(null),ft=class t{constructor(e,n,r,o=0){this.name=e,this.props=n,this.id=r,this.flags=o}static define(e){let n=e.props&&e.props.length?Object.create(null):QR,r=(e.top?1:0)|(e.skipped?2:0)|(e.error?4:0)|(e.name==null?8:0),o=new t(e.name||"",n,e.id,r);if(e.props){for(let a of e.props)if(Array.isArray(a)||(a=a(o)),a){if(a[0].perNode)throw new RangeError("Can't store a per-node prop on a node type");n[a[0].id]=a[1]}}return o}prop(e){return this.props[e.id]}get isTop(){return(this.flags&1)>0}get isSkipped(){return(this.flags&2)>0}get isError(){return(this.flags&4)>0}get isAnonymous(){return(this.flags&8)>0}is(e){if(typeof e=="string"){if(this.name==e)return!0;let n=this.prop(V.group);return n?n.indexOf(e)>-1:!1}return this.id==e}static match(e){let n=Object.create(null);for(let r in e)for(let o of r.split(" "))n[o]=e[r];return r=>{for(let o=r.prop(V.group),a=-1;a<(o?o.length:0);a++){let i=n[a<0?r.name:o[a]];if(i)return i}}}};ft.none=new ft("",Object.create(null),0,8);Ss=class t{constructor(e){this.types=e;for(let n=0;n<e.length;n++)if(e[n].id!=n)throw new RangeError("Node type ids should correspond to array positions when creating a node set")}extend(...e){let n=[];for(let r of this.types){let o=null;for(let a of e){let i=a(r);if(i){o||(o=Object.assign({},r.props));let l=i[1],s=i[0];s.combine&&s.id in o&&(l=s.combine(o[s.id],l)),o[s.id]=l}}n.push(o?new ft(r.name,o,r.id,r.flags):r)}return new t(n)}},pu=new WeakMap,gS=new WeakMap;(function(t){t[t.ExcludeBuffers=1]="ExcludeBuffers",t[t.IncludeAnonymous=2]="IncludeAnonymous",t[t.IgnoreMounts=4]="IgnoreMounts",t[t.IgnoreOverlays=8]="IgnoreOverlays",t[t.EnterBracketed=16]="EnterBracketed"})(Me||(Me={}));_e=class t{constructor(e,n,r,o,a){if(this.type=e,this.children=n,this.positions=r,this.length=o,this.props=null,a&&a.length){this.props=Object.create(null);for(let[i,l]of a)this.props[typeof i=="number"?i:i.id]=l}}toString(){let e=oa.get(this);if(e&&!e.overlay)return e.tree.toString();let n="";for(let r of this.children){let o=r.toString();o&&(n&&(n+=","),n+=o)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(n.length?"("+n+")":""):n}cursor(e=0){return new As(this.topNode,e)}cursorAt(e,n=0,r=0){let o=pu.get(this)||this.topNode,a=new As(o);return a.moveTo(e,n),pu.set(this,a._tree),a}get topNode(){return new Wn(this,0,0,null)}resolve(e,n=0){let r=ks(pu.get(this)||this.topNode,e,n,!1);return pu.set(this,r),r}resolveInner(e,n=0){let r=ks(gS.get(this)||this.topNode,e,n,!0);return gS.set(this,r),r}resolveStack(e,n=0){return WR(this,e,n)}iterate(e){let{enter:n,leave:r,from:o=0,to:a=this.length}=e,i=e.mode||0,l=(i&Me.IncludeAnonymous)>0;for(let s=this.cursor(i|Me.IncludeAnonymous);;){let f=!1;if(s.from<=a&&s.to>=o&&(!l&&s.type.isAnonymous||n(s)!==!1)){if(s.firstChild())continue;f=!0}for(;f&&r&&(l||!s.type.isAnonymous)&&r(s),!s.nextSibling();){if(!s.parent())return;f=!0}}}prop(e){return e.perNode?this.props?this.props[e.id]:void 0:this.type.prop(e)}get propValues(){let e=[];if(this.props)for(let n in this.props)e.push([+n,this.props[n]]);return e}balance(e={}){return this.children.length<=8?this:sx(ft.none,this.children,this.positions,0,this.children.length,0,this.length,(n,r,o)=>new t(this.type,n,r,o,this.propValues),e.makeTree||((n,r,o)=>new t(ft.none,n,r,o)))}static build(e){return KR(e)}};_e.empty=new _e(ft.none,[],[],0);nx=class t{constructor(e,n){this.buffer=e,this.index=n}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new t(this.buffer,this.index)}},mo=class t{constructor(e,n,r){this.buffer=e,this.length=n,this.set=r}get type(){return ft.none}toString(){let e=[];for(let n=0;n<this.buffer.length;)e.push(this.childString(n)),n=this.buffer[n+3];return e.join(",")}childString(e){let n=this.buffer[e],r=this.buffer[e+3],o=this.set.types[n],a=o.name;if(/\W/.test(a)&&!o.isError&&(a=JSON.stringify(a)),e+=4,r==e)return a;let i=[];for(;e<r;)i.push(this.childString(e)),e=this.buffer[e+3];return a+"("+i.join(",")+")"}findChild(e,n,r,o,a){let{buffer:i}=this,l=-1;for(let s=e;s!=n&&!(IS(a,o,i[s+1],i[s+2])&&(l=s,r>0));s=i[s+3]);return l}slice(e,n,r){let o=this.buffer,a=new Uint16Array(n-e),i=0;for(let l=e,s=0;l<n;){a[s++]=o[l++],a[s++]=o[l++]-r;let f=a[s++]=o[l++]-r;a[s++]=o[l++]-e,i=Math.max(i,f)}return new t(a,i,this.set)}};hu=class{cursor(e=0){return new As(this,e)}getChild(e,n=null,r=null){let o=yS(this,e,n,r);return o.length?o[0]:null}getChildren(e,n=null,r=null){return yS(this,e,n,r)}resolve(e,n=0){return ks(this,e,n,!1)}resolveInner(e,n=0){return ks(this,e,n,!0)}matchContext(e){return rx(this.parent,e)}enterUnfinishedNodesBefore(e){let n=this.childBefore(e),r=this;for(;n;){let o=n.lastChild;if(!o||o.to!=n.to)break;o.type.isError&&o.from==o.to?(r=n,n=o.prevSibling):n=o}return r}get node(){return this}get next(){return this.parent}},Wn=class t extends hu{constructor(e,n,r,o){super(),this._tree=e,this.from=n,this.index=r,this._parent=o}get type(){return this._tree.type}get name(){return this._tree.type.name}get to(){return this.from+this._tree.length}nextChild(e,n,r,o,a=0){for(let i=this;;){for(let{children:l,positions:s}=i._tree,f=n>0?l.length:-1;e!=f;e+=n){let c=l[e],d=s[e]+i.from,u;if(!(!(a&Me.EnterBracketed&&c instanceof _e&&(u=oa.get(c))&&!u.overlay&&u.bracketed&&r>=d&&r<=d+c.length)&&!IS(o,r,d,d+c.length))){if(c instanceof mo){if(a&Me.ExcludeBuffers)continue;let p=c.findChild(0,c.buffer.length,n,r-d,o);if(p>-1)return new Cs(new ox(i,c,e,d),null,p)}else if(a&Me.IncludeAnonymous||!c.type.isAnonymous||lx(c)){let p;if(!(a&Me.IgnoreMounts)&&(p=oa.get(c))&&!p.overlay)return new t(p.tree,d,e,i);let m=new t(c,d,e,i);return a&Me.IncludeAnonymous||!m.type.isAnonymous?m:m.nextChild(n<0?c.children.length-1:0,n,r,o,a)}}}if(a&Me.IncludeAnonymous||!i.type.isAnonymous||(i.index>=0?e=i.index+n:e=n<0?-1:i._parent._tree.children.length,i=i._parent,!i))return null}}get firstChild(){return this.nextChild(0,1,0,4)}get lastChild(){return this.nextChild(this._tree.children.length-1,-1,0,4)}childAfter(e){return this.nextChild(0,1,e,2)}childBefore(e){return this.nextChild(this._tree.children.length-1,-1,e,-2)}prop(e){return this._tree.prop(e)}enter(e,n,r=0){let o;if(!(r&Me.IgnoreOverlays)&&(o=oa.get(this._tree))&&o.overlay){let a=e-this.from,i=r&Me.EnterBracketed&&o.bracketed;for(let{from:l,to:s}of o.overlay)if((n>0||i?l<=a:l<a)&&(n<0||i?s>=a:s>a))return new t(o.tree,o.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,e,n,r)}nextSignificantParent(){let e=this;for(;e.type.isAnonymous&&e._parent;)e=e._parent;return e}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index+1,1,0,4):null}get prevSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index-1,-1,0,4):null}get tree(){return this._tree}toTree(){return this._tree}toString(){return this._tree.toString()}};ox=class{constructor(e,n,r,o){this.parent=e,this.buffer=n,this.index=r,this.start=o}},Cs=class t extends hu{get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}constructor(e,n,r){super(),this.context=e,this._parent=n,this.index=r,this.type=e.buffer.set.types[e.buffer.buffer[r]]}child(e,n,r){let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.context.start,r);return a<0?null:new t(this.context,this,a)}get firstChild(){return this.child(1,0,4)}get lastChild(){return this.child(-1,0,4)}childAfter(e){return this.child(1,e,2)}childBefore(e){return this.child(-1,e,-2)}prop(e){return this.type.prop(e)}enter(e,n,r=0){if(r&Me.ExcludeBuffers)return null;let{buffer:o}=this.context,a=o.findChild(this.index+4,o.buffer[this.index+3],n>0?1:-1,e-this.context.start,n);return a<0?null:new t(this.context,this,a)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(e){return this._parent?null:this.context.parent.nextChild(this.context.index+e,e,0,4)}get nextSibling(){let{buffer:e}=this.context,n=e.buffer[this.index+3];return n<(this._parent?e.buffer[this._parent.index+3]:e.buffer.length)?new t(this.context,this._parent,n):this.externalSibling(1)}get prevSibling(){let{buffer:e}=this.context,n=this._parent?this._parent.index+4:0;return this.index==n?this.externalSibling(-1):new t(this.context,this._parent,e.findChild(n,this.index,-1,0,4))}get tree(){return null}toTree(){let e=[],n=[],{buffer:r}=this.context,o=this.index+4,a=r.buffer[this.index+3];if(a>o){let i=r.buffer[this.index+1];e.push(r.slice(o,a,i)),n.push(0)}return new _e(this.type,e,n,this.to-this.from)}toString(){return this.context.buffer.childString(this.index)}};ax=class{constructor(e,n){this.heads=e,this.node=n}get next(){return vS(this.heads)}};As=class{get name(){return this.type.name}constructor(e,n=0){if(this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,this.mode=n&~Me.EnterBracketed,e instanceof Wn)this.yieldNode(e);else{this._tree=e.context.parent,this.buffer=e.context;for(let r=e._parent;r;r=r._parent)this.stack.unshift(r.index);this.bufferNode=e,this.yieldBuf(e.index)}}yieldNode(e){return e?(this._tree=e,this.type=e.type,this.from=e.from,this.to=e.to,!0):!1}yieldBuf(e,n){this.index=e;let{start:r,buffer:o}=this.buffer;return this.type=n||o.set.types[o.buffer[e]],this.from=r+o.buffer[e+1],this.to=r+o.buffer[e+2],!0}yield(e){return e?e instanceof Wn?(this.buffer=null,this.yieldNode(e)):(this.buffer=e.context,this.yieldBuf(e.index,e.type)):!1}toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}enterChild(e,n,r){if(!this.buffer)return this.yield(this._tree.nextChild(e<0?this._tree._tree.children.length-1:0,e,n,r,this.mode));let{buffer:o}=this.buffer,a=o.findChild(this.index+4,o.buffer[this.index+3],e,n-this.buffer.start,r);return a<0?!1:(this.stack.push(this.index),this.yieldBuf(a))}firstChild(){return this.enterChild(1,0,4)}lastChild(){return this.enterChild(-1,0,4)}childAfter(e){return this.enterChild(1,e,2)}childBefore(e){return this.enterChild(-1,e,-2)}enter(e,n,r=this.mode){return this.buffer?r&Me.ExcludeBuffers?!1:this.enterChild(1,e,n):this.yield(this._tree.enter(e,n,r))}parent(){if(!this.buffer)return this.yieldNode(this.mode&Me.IncludeAnonymous?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let e=this.mode&Me.IncludeAnonymous?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(e)}sibling(e){if(!this.buffer)return this._tree._parent?this.yield(this._tree.index<0?null:this._tree._parent.nextChild(this._tree.index+e,e,0,4,this.mode)):!1;let{buffer:n}=this.buffer,r=this.stack.length-1;if(e<0){let o=r<0?0:this.stack[r]+4;if(this.index!=o)return this.yieldBuf(n.findChild(o,this.index,-1,0,4))}else{let o=n.buffer[this.index+3];if(o<(r<0?n.buffer.length:n.buffer[this.stack[r]+3]))return this.yieldBuf(o)}return r<0?this.yield(this.buffer.parent.nextChild(this.buffer.index+e,e,0,4,this.mode)):!1}nextSibling(){return this.sibling(1)}prevSibling(){return this.sibling(-1)}atLastNode(e){let n,r,{buffer:o}=this;if(o){if(e>0){if(this.index<o.buffer.buffer.length)return!1}else for(let a=0;a<this.index;a++)if(o.buffer.buffer[a+3]<this.index)return!1;({index:n,parent:r}=o)}else({index:n,_parent:r}=this._tree);for(;r;{index:n,_parent:r}=r)if(n>-1)for(let a=n+e,i=e<0?-1:r._tree.children.length;a!=i;a+=e){let l=r._tree.children[a];if(this.mode&Me.IncludeAnonymous||l instanceof mo||!l.type.isAnonymous||lx(l))return!1}return!0}move(e,n){if(n&&this.enterChild(e,0,4))return!0;for(;;){if(this.sibling(e))return!0;if(this.atLastNode(e)||!this.parent())return!1}}next(e=!0){return this.move(1,e)}prev(e=!0){return this.move(-1,e)}moveTo(e,n=0){for(;(this.from==this.to||(n<1?this.from>=e:this.from>e)||(n>-1?this.to<=e:this.to<e))&&this.parent(););for(;this.enterChild(1,e,n););return this}get node(){if(!this.buffer)return this._tree;let e=this.bufferNode,n=null,r=0;if(e&&e.context==this.buffer)e:for(let o=this.index,a=this.stack.length;a>=0;){for(let i=e;i;i=i._parent)if(i.index==o){if(o==this.index)return i;n=i,r=a+1;break e}o=this.stack[--a]}for(let o=r;o<this.stack.length;o++)n=new Cs(this.buffer,n,this.stack[o]);return this.bufferNode=new Cs(this.buffer,n,this.index)}get tree(){return this.buffer?null:this._tree._tree}iterate(e,n){for(let r=0;;){let o=!1;if(this.type.isAnonymous||e(this)!==!1){if(this.firstChild()){r++;continue}this.type.isAnonymous||(o=!0)}for(;;){if(o&&n&&n(this),o=this.type.isAnonymous,!r)return;if(this.nextSibling())break;this.parent(),r--,o=!0}}}matchContext(e){if(!this.buffer)return rx(this.node.parent,e);let{buffer:n}=this.buffer,{types:r}=n.set;for(let o=e.length-1,a=this.stack.length-1;o>=0;a--){if(a<0)return rx(this._tree,e,o);let i=r[n.buffer[this.stack[a]]];if(!i.isAnonymous){if(e[o]&&e[o]!=i.name)return!1;o--}}return!0}};bS=new WeakMap;aa=class t{constructor(e,n,r,o,a=!1,i=!1){this.from=e,this.to=n,this.tree=r,this.offset=o,this.open=(a?1:0)|(i?2:0)}get openStart(){return(this.open&1)>0}get openEnd(){return(this.open&2)>0}static addTree(e,n=[],r=!1){let o=[new t(0,e.length,e,0,!1,r)];for(let a of n)a.to>e.length&&o.push(a);return o}static applyChanges(e,n,r=128){if(!n.length)return e;let o=[],a=1,i=e.length?e[0]:null;for(let l=0,s=0,f=0;;l++){let c=l<n.length?n[l]:null,d=c?c.fromA:1e9;if(d-s>=r)for(;i&&i.from<d;){let u=i;if(s>=u.from||d<=u.to||f){let p=Math.max(u.from,s)-f,m=Math.min(u.to,d)-f;u=p>=m?null:new t(p,m,u.tree,u.offset+f,l>0,!!c)}if(u&&o.push(u),i.to>d)break;i=a<e.length?e[a++]:null}if(!c)break;s=c.toA,f=c.toA-c.toB}return o}},Mi=class{startParse(e,n,r){return typeof e=="string"&&(e=new ix(e)),r=r?r.length?r.map(o=>new ws(o.from,o.to)):[new ws(0,0)]:[new ws(0,e.length)],this.createParse(e,n||[],r)}parse(e,n,r){let o=this.startParse(e,n,r);for(;;){let a=o.advance();if(a)return a}}},ix=class{constructor(e){this.string=e}get length(){return this.string.length}chunk(e){return this.string.slice(e)}get lineChunks(){return!1}read(e,n){return this.string.slice(e,n)}},i_=new V({perNode:!0})});function YR(t){if(t<768)return!1;for(let e=0,n=cx.length;;){let r=e+n>>1;if(t<cx[r])n=r;else if(t>=CS[r])e=r+1;else return!0;if(e==n)return!1}}function wS(t){return t>=127462&&t<=127487}function AS(t,e,n=!0,r=!0){return(n?TS:JR)(t,e,r)}function TS(t,e,n){if(e==t.length)return e;e&&MS(t.charCodeAt(e))&&DS(t.charCodeAt(e-1))&&e--;let r=fx(t,e);for(e+=kS(r);e<t.length;){let o=fx(t,e);if(r==SS||o==SS||n&&YR(o))e+=kS(o),r=o;else if(wS(o)){let a=0,i=e-2;for(;i>=0&&wS(fx(t,i));)a++,i-=2;if(a%2==0)break;e+=2}else break}return e}function JR(t,e,n){for(;e>1;){let r=TS(t,e-2,n);if(r<e)return r;e--}return 0}function fx(t,e){let n=t.charCodeAt(e);if(!DS(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return MS(r)?(n-55296<<10)+(r-56320)+65536:n}function MS(t){return t>=56320&&t<57344}function DS(t){return t>=55296&&t<56320}function kS(t){return t<65536?1:2}var cx,CS,SS,OS=E(()=>{cx=[],CS=[];(()=>{let t="lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map(e=>e?parseInt(e,36):1);for(let e=0,n=0;e<t.length;e++)(e%2?CS:cx).push(n=n+t[e])})();SS=8205});function $R(t){let e=-1;for(let n of t)e+=n.length+1;return e}function bu(t,e,n=0,r=1e9){for(let o=0,a=0,i=!0;a<t.length&&o<=r;a++){let l=t[a],s=o+l.length;s>=n&&(s>r&&(l=l.slice(0,r-o)),o<n&&(l=l.slice(n-o)),i?(e[e.length-1]+=l,i=!1):e.push(l)),o=s+1}return e}function BS(t,e,n){return bu(t,[""],e,n)}function Ei(t,e,n){return e=Math.max(0,Math.min(t.length,e)),[e,Math.max(e,Math.min(t.length,n))]}function Je(t,e,n=!0,r=!0){return AS(t,e,n,r)}function ZR(t){return t>=56320&&t<57344}function eE(t){return t>=55296&&t<56320}function Ar(t,e){let n=t.charCodeAt(e);if(!eE(n)||e+1==t.length)return n;let r=t.charCodeAt(e+1);return ZR(r)?(n-55296<<10)+(r-56320)+65536:n}function NS(t){return t<=65535?String.fromCharCode(t):(t-=65536,String.fromCharCode((t>>10)+55296,(t&1023)+56320))}function xo(t){return t<65536?1:2}function ct(t,e,n,r=!1){if(e==0&&n<=0)return;let o=t.length-2;o>=0&&n<=0&&n==t[o+1]?t[o]+=e:o>=0&&e==0&&t[o]==0?t[o+1]+=n:r?(t[o]+=e,t[o+1]+=n):t.push(e,n)}function ho(t,e,n){if(n.length==0)return;let r=e.length-2>>1;if(r<t.length)t[t.length-1]=t[t.length-1].append(n);else{for(;t.length<r;)t.push(te.empty);t.push(n)}}function mx(t,e,n){let r=t.inserted;for(let o=0,a=0,i=0;i<t.sections.length;){let l=t.sections[i++],s=t.sections[i++];if(s<0)o+=l,a+=l;else{let f=o,c=a,d=te.empty;for(;f+=l,c+=s,s&&r&&(d=d.append(r[i-2>>1])),!(n||i==t.sections.length||t.sections[i+1]<0);)l=t.sections[i++],s=t.sections[i++];e(o,f,a,c,d),o=f,a=c}}}function hx(t,e,n,r=!1){let o=[],a=r?[]:null,i=new ca(t),l=new ca(e);for(let s=-1;;){if(i.done&&l.len||l.done&&i.len)throw new Error("Mismatched change set lengths");if(i.ins==-1&&l.ins==-1){let f=Math.min(i.len,l.len);ct(o,f,-1),i.forward(f),l.forward(f)}else if(l.ins>=0&&(i.ins<0||s==i.i||i.off==0&&(l.len<i.len||l.len==i.len&&!n))){let f=l.len;for(ct(o,l.ins,-1);f;){let c=Math.min(i.len,f);i.ins>=0&&s<i.i&&i.len<=c&&(ct(o,0,i.ins),a&&ho(a,o,i.text),s=i.i),i.forward(c),f-=c}l.next()}else if(i.ins>=0){let f=0,c=i.len;for(;c;)if(l.ins==-1){let d=Math.min(c,l.len);f+=d,c-=d,l.forward(d)}else if(l.ins==0&&l.len<c)c-=l.len,l.next();else break;ct(o,f,s<i.i?i.ins:0),a&&s<i.i&&ho(a,o,i.text),s=i.i,i.forward(i.len-c)}else{if(i.done&&l.done)return a?bt.createSet(o,a):Cr.create(o);throw new Error("Mismatched change set lengths")}}}function qS(t,e,n=!1){let r=[],o=n?[]:null,a=new ca(t),i=new ca(e);for(let l=!1;;){if(a.done&&i.done)return o?bt.createSet(r,o):Cr.create(r);if(a.ins==0)ct(r,a.len,0,l),a.next();else if(i.len==0&&!i.done)ct(r,0,i.ins,l),o&&ho(o,r,i.text),i.next();else{if(a.done||i.done)throw new Error("Mismatched change set lengths");{let s=Math.min(a.len2,i.len),f=r.length;if(a.ins==-1){let c=i.ins==-1?-1:i.off?0:i.ins;ct(r,s,c,l),o&&c&&ho(o,r,i.text)}else i.ins==-1?(ct(r,a.off?0:a.len,s,l),o&&ho(o,r,a.textBit(s))):(ct(r,a.off?0:a.len,i.off?0:i.ins,l),o&&!i.off&&ho(o,r,i.text));l=(a.ins>s||i.ins>=0&&i.len>s)&&(l||r.length>f),a.forward2(s),i.forward(s)}}}}function _S(t,e){for(let n of t.ranges)if(n.to>e)throw new RangeError("Selection points outside of document")}function Ax(t,e){return t==e||t.length==e.length&&t.every((n,r)=>n===e[r])}function RS(t,e,n){if(t.length!=e.length)return!1;for(let r=0;r<t.length;r++)if(!n(t[r],e[r]))return!1;return!0}function xx(t,e){let n=!1;for(let r of e)Ds(t,r)&1&&(n=!0);return n}function tE(t,e,n){let r=n.map(s=>t[s.id]),o=n.map(s=>s.type),a=r.filter(s=>!(s&1)),i=t[e.id]>>1;function l(s){let f=[];for(let c=0;c<r.length;c++){let d=ku(s,r[c]);if(o[c]==2)for(let u of d)f.push(u);else f.push(d)}return e.combine(f)}return{create(s){for(let f of r)Ds(s,f);return s.values[i]=l(s),1},update(s,f){if(!xx(s,a))return 0;let c=l(s);return e.compare(c,s.values[i])?0:(s.values[i]=c,1)},reconfigure(s,f){let c=xx(s,r),d=f.config.facets[e.id],u=f.facet(e);if(d&&!c&&Ax(n,d))return s.values[i]=u,0;let p=l(s);return e.compare(p,u)?(s.values[i]=u,0):(s.values[i]=p,1)}}}function Ms(t){return e=>new wu(e,t)}function nE(t,e,n){let r=[[],[],[],[],[]],o=new Map;function a(i,l){let s=o.get(i);if(s!=null){if(s<=l)return;let f=r[s].indexOf(i);f>-1&&r[s].splice(f,1),i instanceof Os&&n.delete(i.compartment)}if(o.set(i,l),Array.isArray(i))for(let f of i)a(f,l);else if(i instanceof Os){if(n.has(i.compartment))throw new RangeError("Duplicate use of compartment in extensions");let f=e.get(i.compartment)||i.inner;n.set(i.compartment,f),a(f,l)}else if(i instanceof wu)a(i.inner,i.prec);else if(i instanceof ut)r[l].push(i),i.provides&&a(i.provides,l);else if(i instanceof Bi)r[l].push(i),i.facet.extensions&&a(i.facet.extensions,la.default);else{let f=i.extension;if(!f)throw new Error(`Unrecognized extension value in extension set (${i}).`);if(f==i)throw new Error(`Unrecognized extension value in extension set (${i}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);a(f,l)}}return a(t,la.default),r.reduce((i,l)=>i.concat(l))}function Ds(t,e){if(e&1)return 2;let n=e>>1,r=t.status[n];if(r==4)throw new Error("Cyclic dependency between fields and/or facets");if(r&2)return r;t.status[n]=4;let o=t.computeSlot(t,t.config.dynamicSlots[n]);return t.status[n]=2|o}function ku(t,e){return e&1?t.config.staticValues[e>>1]:t.values[e>>1]}function rE(t,e){let n=[];for(let r=0,o=0;;){let a,i;if(r<t.length&&(o==e.length||e[o]>=t[r]))a=t[r++],i=t[r++];else if(o<e.length)a=e[o++],i=e[o++];else return n;!n.length||n[n.length-1]<a?n.push(a,i):n[n.length-1]<i&&(n[n.length-1]=i)}}function GS(t,e,n){var r;let o,a,i;return n?(o=e.changes,a=bt.empty(e.changes.length),i=t.changes.compose(e.changes)):(o=e.changes.map(t.changes),a=t.changes.mapDesc(e.changes,!0),i=t.changes.compose(o)),{changes:i,selection:e.selection?e.selection.map(a):(r=t.selection)===null||r===void 0?void 0:r.map(o),effects:ae.mapEffects(t.effects,o).concat(ae.mapEffects(e.effects,a)),annotations:t.annotations.length?t.annotations.concat(e.annotations):e.annotations,scrollIntoView:t.scrollIntoView||e.scrollIntoView}}function Ix(t,e,n){let r=e.selection,o=Ri(e.annotations);return e.userEvent&&(o=o.concat(Xe.userEvent.of(e.userEvent))),{changes:e.changes instanceof bt?e.changes:bt.of(e.changes||[],n,t.facet(zS)),selection:r&&(r instanceof O?r:O.single(r.anchor,r.head)),effects:Ri(e.effects),annotations:o,scrollIntoView:!!e.scrollIntoView}}function XS(t,e,n){let r=Ix(t,e.length?e[0]:{},t.doc.length);e.length&&e[0].filter===!1&&(n=!1);for(let a=1;a<e.length;a++){e[a].filter===!1&&(n=!1);let i=!!e[a].sequential;r=GS(r,Ix(t,e[a],i?r.changes.newLength:t.doc.length),i)}let o=Xe.create(t,r.changes,r.selection,r.effects,r.annotations,r.scrollIntoView);return aE(n?oE(o):o)}function oE(t){let e=t.startState,n=!0;for(let o of e.facet(HS)){let a=o(t);if(a===!1){n=!1;break}Array.isArray(a)&&(n=n===!0?a:rE(n,a))}if(n!==!0){let o,a;if(n===!1)a=t.changes.invertedDesc,o=bt.empty(e.doc.length);else{let i=t.changes.filter(n);o=i.changes,a=i.filtered.mapDesc(i.changes).invertedDesc}t=Xe.create(e,o,t.selection&&t.selection.map(a),ae.mapEffects(t.effects,a),t.annotations,t.scrollIntoView)}let r=e.facet(US);for(let o=r.length-1;o>=0;o--){let a=r[o](t);a instanceof Xe?t=a:Array.isArray(a)&&a.length==1&&a[0]instanceof Xe?t=a[0]:t=XS(e,Ri(a),!1)}return t}function aE(t){let e=t.startState,n=e.facet(jS),r=t;for(let o=n.length-1;o>=0;o--){let a=n[o](t);a&&Object.keys(a).length&&(r=GS(r,Ix(e,a,t.changes.newLength),!0))}return r==t?t:Xe.create(e,t.changes,t.selection,r.effects,r.annotations,r.scrollIntoView)}function Ri(t){return t==null?iE:Array.isArray(t)?t:[t]}function sE(t){if(vx)return vx.test(t);for(let e=0;e<t.length;e++){let n=t[e];if(/\w/.test(n)||n>"\x80"&&(n.toUpperCase()!=n.toLowerCase()||lE.test(n)))return!0}return!1}function fE(t){return e=>{if(!/\S/.test(e))return hn.Space;if(sE(e))return hn.Word;for(let n=0;n<t.length;n++)if(e.indexOf(t[n])>-1)return hn.Word;return hn.Other}}function go(t,e,n={}){let r={};for(let o of t)for(let a of Object.keys(o)){let i=o[a],l=r[a];if(l===void 0)r[a]=i;else if(!(l===i||i===void 0))if(Object.hasOwnProperty.call(n,a))r[a]=n[a](l,i);else throw new Error("Config merge conflict for field "+a)}for(let o in e)r[o]===void 0&&(r[o]=e[o]);return r}function Tx(t,e){return t==e||t.constructor==e.constructor&&t.eq(e)}function wx(t,e){return t.from-e.from||t.value.startSide-e.value.startSide}function Di(t){return t[t.length-1]}function cE(t){if(t.length>1)for(let e=t[0],n=1;n<t.length;n++){let r=t[n];if(wx(e,r)>0)return t.slice().sort(wx);e=r}return t}function ES(t,e,n){let r=new Map;for(let a of t)for(let i=0;i<a.chunk.length;i++)a.chunk[i].maxPoint<=0&&r.set(a.chunk[i],a.chunkPos[i]);let o=new Set;for(let a of e)for(let i=0;i<a.chunk.length;i++){let l=r.get(a.chunk[i]);l!=null&&(n?n.mapPos(l):l)==a.chunkPos[i]&&!n?.touchesRange(l,l+a.chunk[i].length)&&o.add(a.chunk[i])}return o}function ux(t,e){for(let n=t[e];;){let r=(e<<1)+1;if(r>=t.length)break;let o=t[r];if(r+1<t.length&&o.compare(t[r+1])>=0&&(o=t[r+1],r++),n.compare(o)<0)break;t[r]=n,t[e]=o,e=r}}function FS(t,e,n,r,o,a){t.goto(e),n.goto(r);let i=r+o,l=r,s=r-e,f=!!a.boundChange;for(let c=!1;;){let d=t.to+s-n.to,u=d||t.endSide-n.endSide,p=u<0?t.to+s:n.to,m=Math.min(p,i);if(t.point||n.point?(t.point&&n.point&&Tx(t.point,n.point)&&kx(t.activeForPoint(t.to),n.activeForPoint(n.to))||a.comparePoint(l,m,t.point,n.point),c=!1):(c&&(a.boundChange(l),c=!1),m>l&&!kx(t.active,n.active)&&a.compareRange(l,m,t.active,n.active),f&&m<i&&(d||t.openEnd(p)!=n.openEnd(p))&&(c=!0)),p>i)break;l=p,u<=0&&t.next(),u>=0&&n.next()}}function kx(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(t[n]!=e[n]&&!Tx(t[n],e[n]))return!1;return!0}function gu(t,e){for(let n=e,r=t.length-1;n<r;n++)t[n]=t[n+1];t.pop()}function yu(t,e,n){for(let r=t.length-1;r>=e;r--)t[r+1]=t[r];t[e]=n}function LS(t,e){let n=-1,r=1e9;for(let o=0;o<e.length;o++)(e[o]-r||t[o].endSide-t[n].endSide)<0&&(n=o,r=e[o]);return n}function ua(t,e,n=t.length){let r=0;for(let o=0;o<n&&o<t.length;)t.charCodeAt(o)==9?(r+=e-r%e,o++):(r++,o=Je(t,o));return r}function QS(t,e,n,r){for(let o=0,a=0;;){if(a>=e)return o;if(o==t.length)break;a+=t.charCodeAt(o)==9?n-a%n:1,o=Je(t,o)}return r===!0?-1:t.length}var te,Kt,Oi,fa,Iu,vu,dx,px,yt,Cr,bt,ca,ia,O,Cx,z,Bi,xu,ut,la,Dn,wu,Fi,Os,Su,PS,gx,zS,HS,US,jS,VS,Bt,yx,bx,ae,Xe,iE,hn,lE,vx,De,xn,Bs,Sx,se,Kn,Cu,Rs,sa,Li=E(()=>{OS();te=class t{lineAt(e){if(e<0||e>this.length)throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);return this.lineInner(e,!1,1,0)}line(e){if(e<1||e>this.lines)throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);return this.lineInner(e,!0,1,0)}replace(e,n,r){[e,n]=Ei(this,e,n);let o=[];return this.decompose(0,e,o,2),r.length&&r.decompose(0,r.length,o,3),this.decompose(n,this.length,o,1),Oi.from(o,this.length-(n-e)+r.length)}append(e){return this.replace(this.length,this.length,e)}slice(e,n=this.length){[e,n]=Ei(this,e,n);let r=[];return this.decompose(e,n,r,0),Oi.from(r,n-e)}eq(e){if(e==this)return!0;if(e.length!=this.length||e.lines!=this.lines)return!1;let n=this.scanIdentical(e,1),r=this.length-this.scanIdentical(e,-1),o=new fa(this),a=new fa(e);for(let i=n,l=n;;){if(o.next(i),a.next(i),i=0,o.lineBreak!=a.lineBreak||o.done!=a.done||o.value!=a.value)return!1;if(l+=o.value.length,o.done||l>=r)return!0}}iter(e=1){return new fa(this,e)}iterRange(e,n=this.length){return new Iu(this,e,n)}iterLines(e,n){let r;if(e==null)r=this.iter();else{n==null&&(n=this.lines+1);let o=this.line(e).from;r=this.iterRange(o,Math.max(o,n==this.lines+1?this.length:n<=1?0:this.line(n-1).to))}return new vu(r)}toString(){return this.sliceString(0)}toJSON(){let e=[];return this.flatten(e),e}constructor(){}static of(e){if(e.length==0)throw new RangeError("A document must have at least one line");return e.length==1&&!e[0]?t.empty:e.length<=32?new Kt(e):Oi.from(Kt.split(e,[]))}},Kt=class t extends te{constructor(e,n=$R(e)){super(),this.text=e,this.length=n}get lines(){return this.text.length}get children(){return null}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.text[a],l=o+i.length;if((n?r:l)>=e)return new dx(o,l,r,i);o=l+1,r++}}decompose(e,n,r,o){let a=e<=0&&n>=this.length?this:new t(BS(this.text,e,n),Math.min(n,this.length)-Math.max(0,e));if(o&1){let i=r.pop(),l=bu(a.text,i.text.slice(),0,a.length);if(l.length<=32)r.push(new t(l,i.length+a.length));else{let s=l.length>>1;r.push(new t(l.slice(0,s)),new t(l.slice(s)))}}else r.push(a)}replace(e,n,r){if(!(r instanceof t))return super.replace(e,n,r);[e,n]=Ei(this,e,n);let o=bu(this.text,bu(r.text,BS(this.text,0,e)),n),a=this.length+r.length-(n-e);return o.length<=32?new t(o,a):Oi.from(t.split(o,[]),a)}sliceString(e,n=this.length,r=`
`){[e,n]=Ei(this,e,n);let o="";for(let a=0,i=0;a<=n&&i<this.text.length;i++){let l=this.text[i],s=a+l.length;a>e&&i&&(o+=r),e<s&&n>a&&(o+=l.slice(Math.max(0,e-a),n-a)),a=s+1}return o}flatten(e){for(let n of this.text)e.push(n)}scanIdentical(){return 0}static split(e,n){let r=[],o=-1;for(let a of e)r.push(a),o+=a.length+1,r.length==32&&(n.push(new t(r,o)),r=[],o=-1);return o>-1&&n.push(new t(r,o)),n}},Oi=class t extends te{constructor(e,n){super(),this.children=e,this.length=n,this.lines=0;for(let r of e)this.lines+=r.lines}lineInner(e,n,r,o){for(let a=0;;a++){let i=this.children[a],l=o+i.length,s=r+i.lines-1;if((n?s:l)>=e)return i.lineInner(e,n,r,o);o=l+1,r=s+1}}decompose(e,n,r,o){for(let a=0,i=0;i<=n&&a<this.children.length;a++){let l=this.children[a],s=i+l.length;if(e<=s&&n>=i){let f=o&((i<=e?1:0)|(s>=n?2:0));i>=e&&s<=n&&!f?r.push(l):l.decompose(e-i,n-i,r,f)}i=s+1}}replace(e,n,r){if([e,n]=Ei(this,e,n),r.lines<this.lines)for(let o=0,a=0;o<this.children.length;o++){let i=this.children[o],l=a+i.length;if(e>=a&&n<=l){let s=i.replace(e-a,n-a,r),f=this.lines-i.lines+s.lines;if(s.lines<f>>4&&s.lines>f>>6){let c=this.children.slice();return c[o]=s,new t(c,this.length-(n-e)+r.length)}return super.replace(a,l,s)}a=l+1}return super.replace(e,n,r)}sliceString(e,n=this.length,r=`
`){[e,n]=Ei(this,e,n);let o="";for(let a=0,i=0;a<this.children.length&&i<=n;a++){let l=this.children[a],s=i+l.length;i>e&&a&&(o+=r),e<s&&n>i&&(o+=l.sliceString(e-i,n-i,r)),i=s+1}return o}flatten(e){for(let n of this.children)n.flatten(e)}scanIdentical(e,n){if(!(e instanceof t))return 0;let r=0,[o,a,i,l]=n>0?[0,0,this.children.length,e.children.length]:[this.children.length-1,e.children.length-1,-1,-1];for(;;o+=n,a+=n){if(o==i||a==l)return r;let s=this.children[o],f=e.children[a];if(s!=f)return r+s.scanIdentical(f,n);r+=s.length+1}}static from(e,n=e.reduce((r,o)=>r+o.length+1,-1)){let r=0;for(let p of e)r+=p.lines;if(r<32){let p=[];for(let m of e)m.flatten(p);return new Kt(p,n)}let o=Math.max(32,r>>5),a=o<<1,i=o>>1,l=[],s=0,f=-1,c=[];function d(p){let m;if(p.lines>a&&p instanceof t)for(let x of p.children)d(x);else p.lines>i&&(s>i||!s)?(u(),l.push(p)):p instanceof Kt&&s&&(m=c[c.length-1])instanceof Kt&&p.lines+m.lines<=32?(s+=p.lines,f+=p.length+1,c[c.length-1]=new Kt(m.text.concat(p.text),m.length+1+p.length)):(s+p.lines>o&&u(),s+=p.lines,f+=p.length+1,c.push(p))}function u(){s!=0&&(l.push(c.length==1?c[0]:t.from(c,f)),f=-1,s=c.length=0)}for(let p of e)d(p);return u(),l.length==1?l[0]:new t(l,n)}};te.empty=new Kt([""],0);fa=class{constructor(e,n=1){this.dir=n,this.done=!1,this.lineBreak=!1,this.value="",this.nodes=[e],this.offsets=[n>0?1:(e instanceof Kt?e.text.length:e.children.length)<<1]}nextInner(e,n){for(this.done=this.lineBreak=!1;;){let r=this.nodes.length-1,o=this.nodes[r],a=this.offsets[r],i=a>>1,l=o instanceof Kt?o.text.length:o.children.length;if(i==(n>0?l:0)){if(r==0)return this.done=!0,this.value="",this;n>0&&this.offsets[r-1]++,this.nodes.pop(),this.offsets.pop()}else if((a&1)==(n>0?0:1)){if(this.offsets[r]+=n,e==0)return this.lineBreak=!0,this.value=`
`,this;e--}else if(o instanceof Kt){let s=o.text[i+(n<0?-1:0)];if(this.offsets[r]+=n,s.length>Math.max(0,e))return this.value=e==0?s:n>0?s.slice(e):s.slice(0,s.length-e),this;e-=s.length}else{let s=o.children[i+(n<0?-1:0)];e>s.length?(e-=s.length,this.offsets[r]+=n):(n<0&&this.offsets[r]--,this.nodes.push(s),this.offsets.push(n>0?1:(s instanceof Kt?s.text.length:s.children.length)<<1))}}}next(e=0){return e<0&&(this.nextInner(-e,-this.dir),e=this.value.length),this.nextInner(e,this.dir)}},Iu=class{constructor(e,n,r){this.value="",this.done=!1,this.cursor=new fa(e,n>r?-1:1),this.pos=n>r?e.length:0,this.from=Math.min(n,r),this.to=Math.max(n,r)}nextInner(e,n){if(n<0?this.pos<=this.from:this.pos>=this.to)return this.value="",this.done=!0,this;e+=Math.max(0,n<0?this.pos-this.to:this.from-this.pos);let r=n<0?this.pos-this.from:this.to-this.pos;e>r&&(e=r),r-=e;let{value:o}=this.cursor.next(e);return this.pos+=(o.length+e)*n,this.value=o.length<=r?o:n<0?o.slice(o.length-r):o.slice(0,r),this.done=!this.value,this}next(e=0){return e<0?e=Math.max(e,this.from-this.pos):e>0&&(e=Math.min(e,this.to-this.pos)),this.nextInner(e,this.cursor.dir)}get lineBreak(){return this.cursor.lineBreak&&this.value!=""}},vu=class{constructor(e){this.inner=e,this.afterBreak=!0,this.value="",this.done=!1}next(e=0){let{done:n,lineBreak:r,value:o}=this.inner.next(e);return n&&this.afterBreak?(this.value="",this.afterBreak=!1):n?(this.done=!0,this.value=""):r?this.afterBreak?this.value="":(this.afterBreak=!0,this.next()):(this.value=o,this.afterBreak=!1),this}get lineBreak(){return!1}};typeof Symbol<"u"&&(te.prototype[Symbol.iterator]=function(){return this.iter()},fa.prototype[Symbol.iterator]=Iu.prototype[Symbol.iterator]=vu.prototype[Symbol.iterator]=function(){return this});dx=class{constructor(e,n,r,o){this.from=e,this.to=n,this.number=r,this.text=o}get length(){return this.to-this.from}};px=/\r\n?|\n/,yt=(function(t){return t[t.Simple=0]="Simple",t[t.TrackDel=1]="TrackDel",t[t.TrackBefore=2]="TrackBefore",t[t.TrackAfter=3]="TrackAfter",t})(yt||(yt={})),Cr=class t{constructor(e){this.sections=e}get length(){let e=0;for(let n=0;n<this.sections.length;n+=2)e+=this.sections[n];return e}get newLength(){let e=0;for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n+1];e+=r<0?this.sections[n]:r}return e}get empty(){return this.sections.length==0||this.sections.length==2&&this.sections[1]<0}iterGaps(e){for(let n=0,r=0,o=0;n<this.sections.length;){let a=this.sections[n++],i=this.sections[n++];i<0?(e(r,o,a),o+=a):o+=i,r+=a}}iterChangedRanges(e,n=!1){mx(this,e,n)}get invertedDesc(){let e=[];for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];o<0?e.push(r,o):e.push(o,r)}return new t(e)}composeDesc(e){return this.empty?e:e.empty?this:qS(this,e)}mapDesc(e,n=!1){return e.empty?this:hx(this,e,n)}mapPos(e,n=-1,r=yt.Simple){let o=0,a=0;for(let i=0;i<this.sections.length;){let l=this.sections[i++],s=this.sections[i++],f=o+l;if(s<0){if(f>e)return a+(e-o);a+=l}else{if(r!=yt.Simple&&f>=e&&(r==yt.TrackDel&&o<e&&f>e||r==yt.TrackBefore&&o<e||r==yt.TrackAfter&&f>e))return null;if(f>e||f==e&&n<0&&!l)return e==o||n<0?a:a+s;a+=s}o=f}if(e>o)throw new RangeError(`Position ${e} is out of range for changeset of length ${o}`);return a}touchesRange(e,n=e){for(let r=0,o=0;r<this.sections.length&&o<=n;){let a=this.sections[r++],i=this.sections[r++],l=o+a;if(i>=0&&o<=n&&l>=e)return o<e&&l>n?"cover":!0;o=l}return!1}toString(){let e="";for(let n=0;n<this.sections.length;){let r=this.sections[n++],o=this.sections[n++];e+=(e?" ":"")+r+(o>=0?":"+o:"")}return e}toJSON(){return this.sections}static fromJSON(e){if(!Array.isArray(e)||e.length%2||e.some(n=>typeof n!="number"))throw new RangeError("Invalid JSON representation of ChangeDesc");return new t(e)}static create(e){return new t(e)}},bt=class t extends Cr{constructor(e,n){super(e),this.inserted=n}apply(e){if(this.length!=e.length)throw new RangeError("Applying change set to a document with the wrong length");return mx(this,(n,r,o,a,i)=>e=e.replace(o,o+(r-n),i),!1),e}mapDesc(e,n=!1){return hx(this,e,n,!0)}invert(e){let n=this.sections.slice(),r=[];for(let o=0,a=0;o<n.length;o+=2){let i=n[o],l=n[o+1];if(l>=0){n[o]=l,n[o+1]=i;let s=o>>1;for(;r.length<s;)r.push(te.empty);r.push(i?e.slice(a,a+i):te.empty)}a+=i}return new t(n,r)}compose(e){return this.empty?e:e.empty?this:qS(this,e,!0)}map(e,n=!1){return e.empty?this:hx(this,e,n,!0)}iterChanges(e,n=!1){mx(this,e,n)}get desc(){return Cr.create(this.sections)}filter(e){let n=[],r=[],o=[],a=new ca(this);e:for(let i=0,l=0;;){let s=i==e.length?1e9:e[i++];for(;l<s||l==s&&a.len==0;){if(a.done)break e;let c=Math.min(a.len,s-l);ct(o,c,-1);let d=a.ins==-1?-1:a.off==0?a.ins:0;ct(n,c,d),d>0&&ho(r,n,a.text),a.forward(c),l+=c}let f=e[i++];for(;l<f;){if(a.done)break e;let c=Math.min(a.len,f-l);ct(n,c,-1),ct(o,c,a.ins==-1?-1:a.off==0?a.ins:0),a.forward(c),l+=c}}return{changes:new t(n,r),filtered:Cr.create(o)}}toJSON(){let e=[];for(let n=0;n<this.sections.length;n+=2){let r=this.sections[n],o=this.sections[n+1];o<0?e.push(r):o==0?e.push([r]):e.push([r].concat(this.inserted[n>>1].toJSON()))}return e}static of(e,n,r){let o=[],a=[],i=0,l=null;function s(c=!1){if(!c&&!o.length)return;i<n&&ct(o,n-i,-1);let d=new t(o,a);l=l?l.compose(d.map(l)):d,o=[],a=[],i=0}function f(c){if(Array.isArray(c))for(let d of c)f(d);else if(c instanceof t){if(c.length!=n)throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${n})`);s(),l=l?l.compose(c.map(l)):c}else{let{from:d,to:u=d,insert:p}=c;if(d>u||d<0||u>n)throw new RangeError(`Invalid change range ${d} to ${u} (in doc of length ${n})`);let m=p?typeof p=="string"?te.of(p.split(r||px)):p:te.empty,x=m.length;if(d==u&&x==0)return;d<i&&s(),d>i&&ct(o,d-i,-1),ct(o,u-d,x),ho(a,o,m),i=u}}return f(e),s(!l),l}static empty(e){return new t(e?[e,-1]:[],[])}static fromJSON(e){if(!Array.isArray(e))throw new RangeError("Invalid JSON representation of ChangeSet");let n=[],r=[];for(let o=0;o<e.length;o++){let a=e[o];if(typeof a=="number")n.push(a,-1);else{if(!Array.isArray(a)||typeof a[0]!="number"||a.some((i,l)=>l&&typeof i!="string"))throw new RangeError("Invalid JSON representation of ChangeSet");if(a.length==1)n.push(a[0],0);else{for(;r.length<o;)r.push(te.empty);r[o]=te.of(a.slice(1)),n.push(a[0],r[o].length)}}}return new t(n,r)}static createSet(e,n){return new t(e,n)}};ca=class{constructor(e){this.set=e,this.i=0,this.next()}next(){let{sections:e}=this.set;this.i<e.length?(this.len=e[this.i++],this.ins=e[this.i++]):(this.len=0,this.ins=-2),this.off=0}get done(){return this.ins==-2}get len2(){return this.ins<0?this.len:this.ins}get text(){let{inserted:e}=this.set,n=this.i-2>>1;return n>=e.length?te.empty:e[n]}textBit(e){let{inserted:n}=this.set,r=this.i-2>>1;return r>=n.length&&!e?te.empty:n[r].slice(this.off,e==null?void 0:this.off+e)}forward(e){e==this.len?this.next():(this.len-=e,this.off+=e)}forward2(e){this.ins==-1?this.forward(e):e==this.ins?this.next():(this.ins-=e,this.off+=e)}},ia=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.flags=r,this.goalColumn=o}get anchor(){return this.flags&32?this.to:this.from}get head(){return this.flags&32?this.from:this.to}get empty(){return this.from==this.to}get assoc(){return this.flags&8?-1:this.flags&16?1:0}get undirectional(){return(this.flags&64)>0}get bidiLevel(){let e=this.flags&7;return e==7?null:e}map(e,n=-1){let r,o;return this.empty?r=o=e.mapPos(this.from,n):(r=e.mapPos(this.from,1),o=e.mapPos(this.to,-1)),r==this.from&&o==this.to?this:new t(r,o,this.flags,this.goalColumn)}extend(e,n=e,r=0){if(e<=this.anchor&&n>=this.anchor)return O.range(e,n,void 0,void 0,r);let o=Math.abs(e-this.anchor)>Math.abs(n-this.anchor)?e:n;return O.range(this.anchor,o,void 0,void 0,r)}eq(e,n=!1){return this.anchor==e.anchor&&this.head==e.head&&this.goalColumn==e.goalColumn&&(!n||!this.empty||this.assoc==e.assoc)}toJSON(){return{anchor:this.anchor,head:this.head}}static fromJSON(e){if(!e||typeof e.anchor!="number"||typeof e.head!="number")throw new RangeError("Invalid JSON representation for SelectionRange");return O.range(e.anchor,e.head)}static create(e,n,r,o){return new t(e,n,r,o)}},O=class t{constructor(e,n){this.ranges=e,this.mainIndex=n}map(e,n=-1){return e.empty?this:t.create(this.ranges.map(r=>r.map(e,n)),this.mainIndex)}eq(e,n=!1){if(this.ranges.length!=e.ranges.length||this.mainIndex!=e.mainIndex)return!1;for(let r=0;r<this.ranges.length;r++)if(!this.ranges[r].eq(e.ranges[r],n))return!1;return!0}get main(){return this.ranges[this.mainIndex]}asSingle(){return this.ranges.length==1?this:new t([this.main],0)}addRange(e,n=!0){return t.create([e].concat(this.ranges),n?0:this.mainIndex+1)}replaceRange(e,n=this.mainIndex){let r=this.ranges.slice();return r[n]=e,t.create(r,this.mainIndex)}toJSON(){return{ranges:this.ranges.map(e=>e.toJSON()),main:this.mainIndex}}static fromJSON(e){if(!e||!Array.isArray(e.ranges)||typeof e.main!="number"||e.main>=e.ranges.length)throw new RangeError("Invalid JSON representation for EditorSelection");return new t(e.ranges.map(n=>ia.fromJSON(n)),e.main)}static single(e,n=e){return new t([t.range(e,n)],0)}static create(e,n=0){if(e.length==0)throw new RangeError("A selection needs at least one range");for(let r=0,o=0;o<e.length;o++){let a=e[o];if(a.empty?a.from<=r:a.from<r)return t.normalized(e.slice(),n);r=a.to}return new t(e,n)}static cursor(e,n=0,r,o){return ia.create(e,e,(n==0?0:n<0?8:16)|(r==null?7:Math.min(6,r)),o)}static range(e,n,r,o,a){let i=o==null?7:Math.min(6,o);return!a&&e!=n&&(a=n<e?1:-1),a&&(i|=a<0?8:16),n<e?ia.create(n,e,i|32,r):ia.create(e,n,i,r)}static undirectionalRange(e,n){return ia.create(e,n,64,void 0)}static normalized(e,n=0){let r=e[n];e.sort((o,a)=>o.from-a.from),n=e.indexOf(r);for(let o=1;o<e.length;o++){let a=e[o],i=e[o-1];if(a.empty?a.from<=i.to:a.from<i.to){let l=i.from,s=Math.max(a.to,i.to);o<=n&&n--,e.splice(--o,2,a.anchor>a.head?t.range(s,l):t.range(l,s))}}return new t(e,n)}};Cx=0,z=class t{constructor(e,n,r,o,a){this.combine=e,this.compareInput=n,this.compare=r,this.isStatic=o,this.id=Cx++,this.default=e([]),this.extensions=typeof a=="function"?a(this):a}get reader(){return this}static define(e={}){return new t(e.combine||(n=>n),e.compareInput||((n,r)=>n===r),e.compare||(e.combine?(n,r)=>n===r:Ax),!!e.static,e.enables)}of(e){return new Bi([],this,0,e)}compute(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new Bi(e,this,1,n)}computeN(e,n){if(this.isStatic)throw new Error("Can't compute a static facet");return new Bi(e,this,2,n)}from(e,n){return n||(n=r=>r),this.compute([e],r=>n(r.field(e)))}};Bi=class{constructor(e,n,r,o){this.dependencies=e,this.facet=n,this.type=r,this.value=o,this.id=Cx++}dynamicSlot(e){var n;let r=this.value,o=this.facet.compareInput,a=this.id,i=e[a]>>1,l=this.type==2,s=!1,f=!1,c=[];for(let d of this.dependencies)d=="doc"?s=!0:d=="selection"?f=!0:(((n=e[d.id])!==null&&n!==void 0?n:1)&1)==0&&c.push(e[d.id]);return{create(d){return d.values[i]=r(d),1},update(d,u){if(s&&u.docChanged||f&&(u.docChanged||u.selection)||xx(d,c)){let p=r(d);if(l?!RS(p,d.values[i],o):!o(p,d.values[i]))return d.values[i]=p,1}return 0},reconfigure:(d,u)=>{let p,m=u.config.address[a];if(m!=null){let x=ku(u,m);if(this.dependencies.every(b=>b instanceof z?u.facet(b)===d.facet(b):b instanceof ut?u.field(b,!1)==d.field(b,!1):!0)||(l?RS(p=r(d),x,o):o(p=r(d),x)))return d.values[i]=x,0}else p=r(d);return d.values[i]=p,1}}}get extension(){return this}};xu=z.define({static:!0}),ut=class t{constructor(e,n,r,o,a){this.id=e,this.createF=n,this.updateF=r,this.compareF=o,this.spec=a,this.provides=void 0}static define(e){let n=new t(Cx++,e.create,e.update,e.compare||((r,o)=>r===o),e);return e.provide&&(n.provides=e.provide(n)),n}create(e){let n=e.facet(xu).find(r=>r.field==this);return(n?.create||this.createF)(e)}slot(e){let n=e[this.id]>>1;return{create:r=>(r.values[n]=this.create(r),1),update:(r,o)=>{let a=r.values[n],i=this.updateF(a,o);return this.compareF(a,i)?0:(r.values[n]=i,1)},reconfigure:(r,o)=>{let a=r.facet(xu),i=o.facet(xu),l;return(l=a.find(s=>s.field==this))&&l!=i.find(s=>s.field==this)?(r.values[n]=l.create(r),1):o.config.address[this.id]!=null?(r.values[n]=o.field(this),0):(r.values[n]=this.create(r),1)}}}init(e){return[this,xu.of({field:this,create:e})]}get extension(){return this}},la={lowest:4,low:3,default:2,high:1,highest:0};Dn={highest:Ms(la.highest),high:Ms(la.high),default:Ms(la.default),low:Ms(la.low),lowest:Ms(la.lowest)},wu=class{constructor(e,n){this.inner=e,this.prec=n}get extension(){return this}},Fi=class t{of(e){return new Os(this,e)}reconfigure(e){return t.reconfigure.of({compartment:this,extension:e})}get(e){return e.config.compartments.get(this)}},Os=class{constructor(e,n){this.compartment=e,this.inner=n}get extension(){return this}},Su=class t{constructor(e,n,r,o,a,i){for(this.base=e,this.compartments=n,this.dynamicSlots=r,this.address=o,this.staticValues=a,this.facets=i,this.statusTemplate=[];this.statusTemplate.length<r.length;)this.statusTemplate.push(0)}staticFacet(e){let n=this.address[e.id];return n==null?e.default:this.staticValues[n>>1]}static resolve(e,n,r){let o=[],a=Object.create(null),i=new Map;for(let u of nE(e,n,i))u instanceof ut?o.push(u):(a[u.facet.id]||(a[u.facet.id]=[])).push(u);let l=Object.create(null),s=[],f=[];for(let u of o)l[u.id]=f.length<<1,f.push(p=>u.slot(p));let c=r?.config.facets;for(let u in a){let p=a[u],m=p[0].facet,x=c&&c[u]||[];if(p.every(b=>b.type==0))if(l[m.id]=s.length<<1|1,Ax(x,p))s.push(r.facet(m));else{let b=m.combine(p.map(h=>h.value));s.push(r&&m.compare(b,r.facet(m))?r.facet(m):b)}else{for(let b of p)b.type==0?(l[b.id]=s.length<<1|1,s.push(b.value)):(l[b.id]=f.length<<1,f.push(h=>b.dynamicSlot(h)));l[m.id]=f.length<<1,f.push(b=>tE(b,m,p))}}let d=f.map(u=>u(l));return new t(e,i,d,l,s,a)}};PS=z.define(),gx=z.define({combine:t=>t.some(e=>e),static:!0}),zS=z.define({combine:t=>t.length?t[0]:void 0,static:!0}),HS=z.define(),US=z.define(),jS=z.define(),VS=z.define({combine:t=>t.length?t[0]:!1}),Bt=class{constructor(e,n){this.type=e,this.value=n}static define(){return new yx}},yx=class{of(e){return new Bt(this,e)}},bx=class{constructor(e){this.map=e}of(e){return new ae(this,e)}},ae=class t{constructor(e,n){this.type=e,this.value=n}map(e){let n=this.type.map(this.value,e);return n===void 0?void 0:n==this.value?this:new t(this.type,n)}is(e){return this.type==e}static define(e={}){return new bx(e.map||(n=>n))}static mapEffects(e,n){if(!e.length)return e;let r=[];for(let o of e){let a=o.map(n);a&&r.push(a)}return r}};ae.reconfigure=ae.define();ae.appendConfig=ae.define();Xe=class t{constructor(e,n,r,o,a,i){this.startState=e,this.changes=n,this.selection=r,this.effects=o,this.annotations=a,this.scrollIntoView=i,this._doc=null,this._state=null,r&&_S(r,n.newLength),a.some(l=>l.type==t.time)||(this.annotations=a.concat(t.time.of(Date.now())))}static create(e,n,r,o,a,i){return new t(e,n,r,o,a,i)}get newDoc(){return this._doc||(this._doc=this.changes.apply(this.startState.doc))}get newSelection(){return this.selection||this.startState.selection.map(this.changes)}get state(){return this._state||this.startState.applyTransaction(this),this._state}annotation(e){for(let n of this.annotations)if(n.type==e)return n.value}get docChanged(){return!this.changes.empty}get reconfigured(){return this.startState.config!=this.state.config}isUserEvent(e){let n=this.annotation(t.userEvent);return!!(n&&(n==e||n.length>e.length&&n.slice(0,e.length)==e&&n[e.length]=="."))}};Xe.time=Bt.define();Xe.userEvent=Bt.define();Xe.addToHistory=Bt.define();Xe.remote=Bt.define();iE=[];hn=(function(t){return t[t.Word=0]="Word",t[t.Space=1]="Space",t[t.Other=2]="Other",t})(hn||(hn={})),lE=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;try{vx=new RegExp("[\\p{Alphabetic}\\p{Number}_]","u")}catch{}De=class t{constructor(e,n,r,o,a,i){this.config=e,this.doc=n,this.selection=r,this.values=o,this.status=e.statusTemplate.slice(),this.computeSlot=a,i&&(i._state=this);for(let l=0;l<this.config.dynamicSlots.length;l++)Ds(this,l<<1);this.computeSlot=null}field(e,n=!0){let r=this.config.address[e.id];if(r==null){if(n)throw new RangeError("Field is not present in this state");return}return Ds(this,r),ku(this,r)}update(...e){return XS(this,e,!0)}applyTransaction(e){let n=this.config,{base:r,compartments:o}=n;for(let l of e.effects)l.is(Fi.reconfigure)?(n&&(o=new Map,n.compartments.forEach((s,f)=>o.set(f,s)),n=null),o.set(l.value.compartment,l.value.extension)):l.is(ae.reconfigure)?(n=null,r=l.value):l.is(ae.appendConfig)&&(n=null,r=Ri(r).concat(l.value));let a;n?a=e.startState.values.slice():(n=Su.resolve(r,o,this),a=new t(n,this.doc,this.selection,n.dynamicSlots.map(()=>null),(s,f)=>f.reconfigure(s,this),null).values);let i=e.startState.facet(gx)?e.newSelection:e.newSelection.asSingle();new t(n,e.newDoc,i,a,(l,s)=>s.update(l,e),e)}replaceSelection(e){return typeof e=="string"&&(e=this.toText(e)),this.changeByRange(n=>({changes:{from:n.from,to:n.to,insert:e},range:O.cursor(n.from+e.length,-1)}))}changeByRange(e){let n=this.selection,r=e(n.ranges[0]),o=this.changes(r.changes),a=[r.range],i=Ri(r.effects);for(let l=1;l<n.ranges.length;l++){let s=e(n.ranges[l]),f=this.changes(s.changes),c=f.map(o);for(let u=0;u<l;u++)a[u]=a[u].map(c);let d=o.mapDesc(f,!0);a.push(s.range.map(d)),o=o.compose(c),i=ae.mapEffects(i,c).concat(ae.mapEffects(Ri(s.effects),d))}return{changes:o,selection:O.create(a,n.mainIndex),effects:i}}changes(e=[]){return e instanceof bt?e:bt.of(e,this.doc.length,this.facet(t.lineSeparator))}toText(e){return te.of(e.split(this.facet(t.lineSeparator)||px))}sliceDoc(e=0,n=this.doc.length){return this.doc.sliceString(e,n,this.lineBreak)}facet(e){let n=this.config.address[e.id];return n==null?e.default:(Ds(this,n),ku(this,n))}toJSON(e){let n={doc:this.sliceDoc(),selection:this.selection.toJSON()};if(e)for(let r in e){let o=e[r];o instanceof ut&&this.config.address[o.id]!=null&&(n[r]=o.spec.toJSON(this.field(e[r]),this))}return n}static fromJSON(e,n={},r){if(!e||typeof e.doc!="string")throw new RangeError("Invalid JSON representation for EditorState");let o=[];if(r){for(let a in r)if(Object.prototype.hasOwnProperty.call(e,a)){let i=r[a],l=e[a];o.push(i.init(s=>i.spec.fromJSON(l,s)))}}return t.create({doc:e.doc,selection:O.fromJSON(e.selection),extensions:n.extensions?o.concat([n.extensions]):o})}static create(e={}){let n=Su.resolve(e.extensions||[],new Map),r=e.doc instanceof te?e.doc:te.of((e.doc||"").split(n.staticFacet(t.lineSeparator)||px)),o=e.selection?e.selection instanceof O?e.selection:O.single(e.selection.anchor,e.selection.head):O.single(0);return _S(o,r.length),n.staticFacet(gx)||(o=o.asSingle()),new t(n,r,o,n.dynamicSlots.map(()=>null),(a,i)=>i.create(a),null)}get tabSize(){return this.facet(t.tabSize)}get lineBreak(){return this.facet(t.lineSeparator)||`
`}get readOnly(){return this.facet(VS)}phrase(e,...n){for(let r of this.facet(t.phrases))if(Object.prototype.hasOwnProperty.call(r,e)){e=r[e];break}return n.length&&(e=e.replace(/\$(\$|\d*)/g,(r,o)=>{if(o=="$")return"$";let a=+(o||1);return!a||a>n.length?r:n[a-1]})),e}languageDataAt(e,n,r=-1){let o=[];for(let a of this.facet(PS))for(let i of a(this,n,r))Object.prototype.hasOwnProperty.call(i,e)&&o.push(i[e]);return o}charCategorizer(e){let n=this.languageDataAt("wordChars",e);return fE(n.length?n[0]:"")}wordAt(e){let{text:n,from:r,length:o}=this.doc.lineAt(e),a=this.charCategorizer(e),i=e-r,l=e-r;for(;i>0;){let s=Je(n,i,!1);if(a(n.slice(s,i))!=hn.Word)break;i=s}for(;l<o;){let s=Je(n,l);if(a(n.slice(l,s))!=hn.Word)break;l=s}return i==l?null:O.range(i+r,l+r)}};De.allowMultipleSelections=gx;De.tabSize=z.define({combine:t=>t.length?t[0]:4});De.lineSeparator=zS;De.readOnly=VS;De.phrases=z.define({compare(t,e){let n=Object.keys(t),r=Object.keys(e);return n.length==r.length&&n.every(o=>t[o]==e[o])}});De.languageData=PS;De.changeFilter=HS;De.transactionFilter=US;De.transactionExtender=jS;Fi.reconfigure=ae.define();xn=class{eq(e){return this==e}range(e,n=e){return Bs.create(e,n,this)}};xn.prototype.startSide=xn.prototype.endSide=0;xn.prototype.point=!1;xn.prototype.mapMode=yt.TrackDel;Bs=class t{constructor(e,n,r){this.from=e,this.to=n,this.value=r}static create(e,n,r){return new t(e,n,r)}};Sx=class t{constructor(e,n,r,o){this.from=e,this.to=n,this.value=r,this.maxPoint=o}get length(){return Di(this.to)}findIndex(e,n,r,o=0){let a=r?this.to:this.from;for(let i=o,l=a.length;;){if(i==l)return i;let s=i+l>>1,f=a[s]-e||(r?this.value[s].endSide:this.value[s].startSide)-n;if(s==i)return f>=0?i:l;f>=0?l=s:i=s+1}}between(e,n,r,o){for(let a=this.findIndex(n,-1e9,!0),i=this.findIndex(r,1e9,!1,a);a<i;a++)if(o(this.from[a]+e,this.to[a]+e,this.value[a])===!1)return!1}map(e,n,r,o,a){let i=[],l=[],s=[],f=-1,c=-1;e:for(let d=0;d<this.value.length;d++){let u=this.value[d],p=this.from[d]+e,m=this.to[d]+e,x,b;if(p==m){let h=n.mapPos(p,u.startSide,u.mapMode);if(h==null||(x=b=h,u.startSide!=u.endSide&&(b=n.mapPos(p,u.endSide),b<x)))continue}else if(x=n.mapPos(p,u.startSide),b=n.mapPos(m,u.endSide),x>b||x==b&&u.startSide>0&&u.endSide<=0)continue;if(!((b-x||u.endSide-u.startSide)<0))if(f<0&&(f=x),u.point&&(c=Math.max(c,b-x)),(x-r||u.startSide-o)>=0)i.push(u),l.push(x-f),s.push(b-f),r=b,o=u.endSide;else{if(x==b)for(let h=i.length;h>0;h--){if((x-(s[h-1]+f)||u.startSide-i[h-1].endSide)>=0){i.splice(h,0,u),l.splice(h,0,x-f),s.splice(h,0,b-f);continue e}if((x-(l[h-1]+f)||u.endSide-i[h-1].startSide)>0)break}a(x,b,u)}}return{mapped:i.length?new t(l,s,i,c):null,pos:f}}},se=class t{constructor(e,n,r,o){this.chunkPos=e,this.chunk=n,this.nextLayer=r,this.maxPoint=o}static create(e,n,r,o){return new t(e,n,r,o)}get length(){let e=this.chunk.length-1;return e<0?0:Math.max(this.chunkEnd(e),this.nextLayer.length)}get size(){if(this.isEmpty)return 0;let e=this.nextLayer.size;for(let n of this.chunk)e+=n.value.length;return e}chunkEnd(e){return this.chunkPos[e]+this.chunk[e].length}update(e){let{add:n=[],sort:r=!1,filterFrom:o=0,filterTo:a=this.length}=e,i=e.filter;if(n.length==0&&!i)return this;if(r&&(n=n.slice().sort(wx)),this.isEmpty)return n.length?t.of(n):this;let l=new Cu(this,null,-1).goto(0),s=0,f=[],c=new Kn;for(;l.value||s<n.length;)if(s<n.length&&(l.from-n[s].from||l.startSide-n[s].value.startSide)>=0){let d=n[s++];c.addInner(d.from,d.to,d.value,!1)||f.push(d)}else l.rangeIndex==1&&l.chunkIndex<this.chunk.length&&(s==n.length||this.chunkEnd(l.chunkIndex)<n[s].from)&&(!i||o>this.chunkEnd(l.chunkIndex)||a<this.chunkPos[l.chunkIndex])&&c.addChunk(this.chunkPos[l.chunkIndex],this.chunk[l.chunkIndex])?l.nextChunk():((!i||o>l.to||a<l.from||i(l.from,l.to,l.value))&&(c.addInner(l.from,l.to,l.value,!1)||f.push(Bs.create(l.from,l.to,l.value))),l.next());return c.finishInner(this.nextLayer.isEmpty&&!f.length?t.empty:this.nextLayer.update({add:f,filter:i,filterFrom:o,filterTo:a}))}map(e){if(e.empty||this.isEmpty)return this;let n=[],r=[],o=-1,a,i=(s,f,c)=>{a||(a=new Kn),a.addRange(s,f,c,!1)};for(let s=0;s<this.chunk.length;s++){let f=this.chunkPos[s],c=this.chunk[s],d=e.touchesRange(f,f+c.length);if(d===!1)o=Math.max(o,c.maxPoint),n.push(c),r.push(e.mapPos(f));else if(d===!0){let[u,p]=n.length?[Di(r)+Di(n).length,Di(Di(n).value).endSide]:[-1,-1],{mapped:m,pos:x}=c.map(f,e,u,p,i);m&&(o=Math.max(o,m.maxPoint),n.push(m),r.push(x))}}let l=this.nextLayer.map(e);return a&&(l=a.finishInner(l)),n.length==0?l:new t(r,n,l||t.empty,o)}between(e,n,r){if(!this.isEmpty){for(let o=0;o<this.chunk.length;o++){let a=this.chunkPos[o],i=this.chunk[o];if(n>=a&&e<=a+i.length&&i.between(a,e-a,n-a,r)===!1)return}this.nextLayer.between(e,n,r)}}iter(e=0){return Rs.from([this]).goto(e)}get isEmpty(){return this.nextLayer==this}static iter(e,n=0){return Rs.from(e).goto(n)}static compare(e,n,r,o,a=-1){let i=e.filter(d=>d.maxPoint>0||!d.isEmpty&&d.maxPoint>=a),l=n.filter(d=>d.maxPoint>0||!d.isEmpty&&d.maxPoint>=a),s=ES(i,l,r),f=new sa(i,s,a),c=new sa(l,s,a);r.iterGaps((d,u,p)=>FS(f,d,c,u,p,o)),r.empty&&r.length==0&&FS(f,0,c,0,0,o)}static eq(e,n,r=0,o){o==null&&(o=999999999);let a=e.filter(c=>!c.isEmpty&&n.indexOf(c)<0),i=n.filter(c=>!c.isEmpty&&e.indexOf(c)<0);if(a.length!=i.length)return!1;if(!a.length)return!0;let l=ES(a,i),s=new sa(a,l,0).goto(r),f=new sa(i,l,0).goto(r);for(;;){if(s.to!=f.to||!kx(s.active,f.active)||s.point&&(!f.point||!Tx(s.point,f.point)))return!1;if(s.to>o)return!0;s.next(),f.next()}}static spans(e,n,r,o,a=-1){let i=new sa(e,null,a).goto(n),l=n,s=i.openStart;for(;;){let f=Math.min(i.to,r);if(i.point){let c=i.activeForPoint(i.to),d=i.pointFrom<n?c.length+1:i.point.startSide<0?c.length:Math.min(c.length,s);o.point(l,f,i.point,c,d,i.pointRank),s=Math.min(i.openEnd(f),c.length)}else f>l&&(o.span(l,f,i.active,s),s=i.openEnd(f));if(i.to>r)return s+(i.point&&i.to>r?1:0);l=i.to,i.next()}}static of(e,n=!1){let r=new Kn;for(let o of e instanceof Bs?[e]:n?cE(e):e)r.add(o.from,o.to,o.value);return r.finish()}static join(e){if(!e.length)return t.empty;let n=Di(e);for(let r=e.length-2;r>=0;r--)for(let o=e[r];o!=t.empty;o=o.nextLayer)n=new t(o.chunkPos,o.chunk,n,Math.max(o.maxPoint,n.maxPoint));return n}};se.empty=new se([],[],null,-1);se.empty.nextLayer=se.empty;Kn=class t{finishChunk(e){this.chunks.push(new Sx(this.from,this.to,this.value,this.maxPoint)),this.chunkPos.push(this.chunkStart),this.chunkStart=-1,this.setMaxPoint=Math.max(this.setMaxPoint,this.maxPoint),this.maxPoint=-1,e&&(this.from=[],this.to=[],this.value=[])}constructor(){this.chunks=[],this.chunkPos=[],this.chunkStart=-1,this.last=null,this.lastFrom=-1e9,this.lastTo=-1e9,this.from=[],this.to=[],this.value=[],this.maxPoint=-1,this.setMaxPoint=-1,this.nextLayer=null}add(e,n,r){this.addRange(e,n,r,!0)}addRange(e,n,r,o){this.addInner(e,n,r,o)||(this.nextLayer||(this.nextLayer=new t)).addRange(e,n,r,o)}addInner(e,n,r,o){let a=e-this.lastTo||r.startSide-this.last.endSide;if(o&&a<=0&&(e-this.lastFrom||r.startSide-this.last.startSide)<0)throw new Error("Ranges must be added sorted by `from` position and `startSide`");return a<0?!1:(this.from.length==250&&this.finishChunk(!0),this.chunkStart<0&&(this.chunkStart=e),this.from.push(e-this.chunkStart),this.to.push(n-this.chunkStart),this.last=r,this.lastFrom=e,this.lastTo=n,this.value.push(r),r.point&&(this.maxPoint=Math.max(this.maxPoint,n-e)),!0)}addChunk(e,n){if((e-this.lastTo||n.value[0].startSide-this.last.endSide)<0)return!1;this.from.length&&this.finishChunk(!0),this.setMaxPoint=Math.max(this.setMaxPoint,n.maxPoint),this.chunks.push(n),this.chunkPos.push(e);let r=n.value.length-1;return this.last=n.value[r],this.lastFrom=n.from[r]+e,this.lastTo=n.to[r]+e,!0}finish(){return this.finishInner(se.empty)}finishInner(e){if(this.from.length&&this.finishChunk(!1),this.chunks.length==0)return e;let n=se.create(this.chunkPos,this.chunks,this.nextLayer?this.nextLayer.finishInner(e):e,this.setMaxPoint);return this.from=null,n}};Cu=class{constructor(e,n,r,o=0){this.layer=e,this.skip=n,this.minPoint=r,this.rank=o}get startSide(){return this.value?this.value.startSide:0}get endSide(){return this.value?this.value.endSide:0}goto(e,n=-1e9){return this.chunkIndex=this.rangeIndex=0,this.gotoInner(e,n,!1),this}gotoInner(e,n,r){for(;this.chunkIndex<this.layer.chunk.length;){let o=this.layer.chunk[this.chunkIndex];if(!(this.skip&&this.skip.has(o)||this.layer.chunkEnd(this.chunkIndex)<e||o.maxPoint<this.minPoint))break;this.chunkIndex++,r=!1}if(this.chunkIndex<this.layer.chunk.length){let o=this.layer.chunk[this.chunkIndex].findIndex(e-this.layer.chunkPos[this.chunkIndex],n,!0);(!r||this.rangeIndex<o)&&this.setRangeIndex(o)}this.next()}forward(e,n){(this.to-e||this.endSide-n)<0&&this.gotoInner(e,n,!0)}next(){for(;;)if(this.chunkIndex==this.layer.chunk.length){this.from=this.to=1e9,this.value=null;break}else{let e=this.layer.chunkPos[this.chunkIndex],n=this.layer.chunk[this.chunkIndex],r=e+n.from[this.rangeIndex];if(this.from=r,this.to=e+n.to[this.rangeIndex],this.value=n.value[this.rangeIndex],this.setRangeIndex(this.rangeIndex+1),this.minPoint<0||this.value.point&&this.to-this.from>=this.minPoint)break}}setRangeIndex(e){if(e==this.layer.chunk[this.chunkIndex].value.length){if(this.chunkIndex++,this.skip)for(;this.chunkIndex<this.layer.chunk.length&&this.skip.has(this.layer.chunk[this.chunkIndex]);)this.chunkIndex++;this.rangeIndex=0}else this.rangeIndex=e}nextChunk(){this.chunkIndex++,this.rangeIndex=0,this.next()}compare(e){return this.from-e.from||this.startSide-e.startSide||this.rank-e.rank||this.to-e.to||this.endSide-e.endSide}},Rs=class t{constructor(e){this.heap=e}static from(e,n=null,r=-1){let o=[];for(let a=0;a<e.length;a++)for(let i=e[a];!i.isEmpty;i=i.nextLayer)i.maxPoint>=r&&o.push(new Cu(i,n,r,a));return o.length==1?o[0]:new t(o)}get startSide(){return this.value?this.value.startSide:0}goto(e,n=-1e9){for(let r of this.heap)r.goto(e,n);for(let r=this.heap.length>>1;r>=0;r--)ux(this.heap,r);return this.next(),this}forward(e,n){for(let r of this.heap)r.forward(e,n);for(let r=this.heap.length>>1;r>=0;r--)ux(this.heap,r);(this.to-e||this.value.endSide-n)<0&&this.next()}next(){if(this.heap.length==0)this.from=this.to=1e9,this.value=null,this.rank=-1;else{let e=this.heap[0];this.from=e.from,this.to=e.to,this.value=e.value,this.rank=e.rank,e.value&&e.next(),ux(this.heap,0)}}};sa=class{constructor(e,n,r){this.minPoint=r,this.active=[],this.activeTo=[],this.activeRank=[],this.minActive=-1,this.point=null,this.pointFrom=0,this.pointRank=0,this.to=-1e9,this.endSide=0,this.openStart=-1,this.cursor=Rs.from(e,n,r)}goto(e,n=-1e9){return this.cursor.goto(e,n),this.active.length=this.activeTo.length=this.activeRank.length=0,this.minActive=-1,this.to=e,this.endSide=n,this.openStart=-1,this.next(),this}forward(e,n){for(;this.minActive>-1&&(this.activeTo[this.minActive]-e||this.active[this.minActive].endSide-n)<0;)this.removeActive(this.minActive);this.cursor.forward(e,n)}removeActive(e){gu(this.active,e),gu(this.activeTo,e),gu(this.activeRank,e),this.minActive=LS(this.active,this.activeTo)}addActive(e){let n=0,{value:r,to:o,rank:a}=this.cursor;for(;n<this.activeRank.length&&(a-this.activeRank[n]||o-this.activeTo[n])>0;)n++;yu(this.active,n,r),yu(this.activeTo,n,o),yu(this.activeRank,n,a),e&&yu(e,n,this.cursor.from),this.minActive=LS(this.active,this.activeTo)}next(){let e=this.to,n=this.point;this.point=null;let r=this.openStart<0?[]:null;for(;;){let o=this.minActive;if(o>-1&&(this.activeTo[o]-this.cursor.from||this.active[o].endSide-this.cursor.startSide)<0){if(this.activeTo[o]>e){this.to=this.activeTo[o],this.endSide=this.active[o].endSide;break}this.removeActive(o),r&&gu(r,o)}else if(this.cursor.value)if(this.cursor.from>e){this.to=this.cursor.from,this.endSide=this.cursor.startSide;break}else{let a=this.cursor.value;if(!a.point)this.addActive(r),this.cursor.next();else if(n&&this.cursor.to==this.to&&this.cursor.from<this.cursor.to)this.cursor.next();else{this.point=a,this.pointFrom=this.cursor.from,this.pointRank=this.cursor.rank,this.to=this.cursor.to,this.endSide=a.endSide,this.cursor.next(),this.forward(this.to,this.endSide);break}}else{this.to=this.endSide=1e9;break}}if(r){this.openStart=0;for(let o=r.length-1;o>=0&&r[o]<e;o--)this.openStart++}}activeForPoint(e){if(!this.active.length)return this.active;let n=[];for(let r=this.active.length-1;r>=0&&!(this.activeRank[r]<this.pointRank);r--)(this.activeTo[r]>e||this.activeTo[r]==e&&this.active[r].endSide>=this.point.endSide)&&n.push(this.active[r]);return n.reverse()}openEnd(e){let n=0;for(let r=this.activeTo.length-1;r>=0&&this.activeTo[r]>e;r--)n++;return n}}});var WS,Mx,KS,gn,YS,Dx,Ox=E(()=>{WS=typeof Symbol>"u"?"__\u037C":Symbol.for("\u037C"),Mx=typeof Symbol>"u"?"__styleSet"+Math.floor(Math.random()*1e8):Symbol("styleSet"),KS=typeof globalThis<"u"?globalThis:typeof window<"u"?window:{},gn=class{constructor(e,n){this.rules=[];let{finish:r}=n||{};function o(i){return/^@/.test(i)?[i]:i.split(/,\s*/)}function a(i,l,s,f){let c=[],d=/^@(\w+)\b/.exec(i[0]),u=d&&d[1]=="keyframes";if(d&&l==null)return s.push(i[0]+";");for(let p in l){let m=l[p];if(/&/.test(p))a(p.split(/,\s*/).map(x=>i.map(b=>x.replace(/&/,b))).reduce((x,b)=>x.concat(b)),m,s);else if(m&&typeof m=="object"){if(!d)throw new RangeError("The value of a property ("+p+") should be a primitive value.");a(o(p),m,c,u)}else m!=null&&c.push(p.replace(/_.*/,"").replace(/[A-Z]/g,x=>"-"+x.toLowerCase())+": "+m+";")}(c.length||u)&&s.push((r&&!d&&!f?i.map(r):i).join(", ")+" {"+c.join(" ")+"}")}for(let i in e)a(o(i),e[i],this.rules)}getRules(){return this.rules.join(`
`)}static newName(){let e=KS[WS]||1;return KS[WS]=e+1,"\u037C"+e.toString(36)}static mount(e,n,r){let o=e[Mx],a=r&&r.nonce;o?a&&o.setNonce(a):o=new Dx(e,a),o.mount(Array.isArray(n)?n:[n],e)}},YS=new Map,Dx=class{constructor(e,n){let r=e.ownerDocument||e,o=r.defaultView;if(!e.head&&e.adoptedStyleSheets&&o.CSSStyleSheet){let a=YS.get(r);if(a)return e[Mx]=a;this.sheet=new o.CSSStyleSheet,YS.set(r,this)}else this.styleTag=r.createElement("style"),n&&this.styleTag.setAttribute("nonce",n);this.modules=[],e[Mx]=this}mount(e,n){let r=this.sheet,o=0,a=0,i=!1;for(let l=0;l<e.length;l++){let s=e[l],f=this.modules.indexOf(s);if(f<a&&f>-1&&(this.modules.splice(f,1),i=!0,a--,f=-1),f==-1){if(this.modules.splice(a++,0,s),i=!0,r)for(let c=0;c<s.rules.length;c++)r.insertRule(s.rules[c],o++)}else{for(;a<f;)o+=this.modules[a++].rules.length;o+=s.rules.length,a++}}if(r)n.adoptedStyleSheets.indexOf(this.sheet)<0&&(n.adoptedStyleSheets=[this.sheet,...n.adoptedStyleSheets]);else{if(i){let s="";for(let f=0;f<this.modules.length;f++)s+=this.modules[f].getRules()+`
`;this.styleTag.textContent=s}let l=n.head||n;this.styleTag.parentNode!=l&&l.insertBefore(this.styleTag,l.firstChild)}}setNonce(e){this.styleTag&&this.styleTag.getAttribute("nonce")!=e&&this.styleTag.setAttribute("nonce",e)}}});function JS(t){var e=uE&&t.metaKey&&t.shiftKey&&!t.ctrlKey&&!t.altKey||dE&&t.shiftKey&&t.key&&t.key.length==1||t.key=="Unidentified",n=!e&&t.key||(t.shiftKey?Ni:Tr)[t.keyCode]||t.key||"Unidentified";return n=="Esc"&&(n="Escape"),n=="Del"&&(n="Delete"),n=="Left"&&(n="ArrowLeft"),n=="Up"&&(n="ArrowUp"),n=="Right"&&(n="ArrowRight"),n=="Down"&&(n="ArrowDown"),n}var Tr,Ni,uE,dE,je,je,je,Au,$S=E(()=>{Tr={8:"Backspace",9:"Tab",10:"Enter",12:"NumLock",13:"Enter",16:"Shift",17:"Control",18:"Alt",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",44:"PrintScreen",45:"Insert",46:"Delete",59:";",61:"=",91:"Meta",92:"Meta",106:"*",107:"+",108:",",109:"-",110:".",111:"/",144:"NumLock",145:"ScrollLock",160:"Shift",161:"Shift",162:"Control",163:"Control",164:"Alt",165:"Alt",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},Ni={48:")",49:"!",50:"@",51:"#",52:"$",53:"%",54:"^",55:"&",56:"*",57:"(",59:":",61:"+",173:"_",186:":",187:"+",188:"<",189:"_",190:">",191:"?",192:"~",219:"{",220:"|",221:"}",222:'"'},uE=typeof navigator<"u"&&/Mac/.test(navigator.platform),dE=typeof navigator<"u"&&/MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);for(je=0;je<10;je++)Tr[48+je]=Tr[96+je]=String(je);for(je=1;je<=24;je++)Tr[je+111]="F"+je;for(je=65;je<=90;je++)Tr[je]=String.fromCharCode(je+32),Ni[je]=String.fromCharCode(je);for(Au in Tr)Ni.hasOwnProperty(Au)||(Ni[Au]=Tr[Au])});var ZS=E(()=>{});function Og(t,e){for(let n in t)n=="class"&&e.class?e.class+=" "+t.class:n=="style"&&e.style?e.style+=";"+t.style:e[n]=t[n];return e}function Bg(t,e,n){if(t==e)return!0;t||(t=qu),e||(e=qu);let r=Object.keys(t),o=Object.keys(e);if(r.length-0!=o.length-0)return!1;for(let a of r)if(a!=n&&(o.indexOf(a)==-1||t[a]!==e[a]))return!1;return!0}function pE(t,e){for(let n=t.attributes.length-1;n>=0;n--){let r=t.attributes[n].name;e[r]==null&&t.removeAttribute(r)}for(let n in e){let r=e[n];n=="style"?t.style.cssText=r:t.getAttribute(n)!=r&&t.setAttribute(n,r)}}function rk(t,e,n){let r=!1;if(e)for(let o in e)n&&o in n||(r=!0,o=="style"?t.style.cssText="":t.removeAttribute(o));if(n)for(let o in n)e&&e[o]==n[o]||(r=!0,o=="style"?t.style.cssText=n[o]:t.setAttribute(o,n[o]));return r}function mE(t){let e=Object.create(null);for(let n=0;n<t.attributes.length;n++){let r=t.attributes[n];e[r.name]=r.value}return e}function Rk(t,e=!1){let{inclusiveStart:n,inclusiveEnd:r}=t;return n==null&&(n=t.inclusive),r==null&&(r=t.inclusive),{start:n??e,end:r??e}}function hE(t,e){return t==e||!!(t&&e&&t.compare(e))}function Hi(t,e,n,r=0){let o=n.length-1;o>=0&&n[o]+r>=t?n[o]=Math.max(n[o],e):n.push(t,e)}function Xs(t){let e;return t.nodeType==11?e=t.getSelection?t:t.ownerDocument:e=t,e.getSelection()}function jx(t,e){return e?t==e||t.contains(e.nodeType!=1?e.parentNode:e):!1}function Ls(t,e){if(!e.anchorNode)return!1;try{return jx(t,e.anchorNode)}catch{return!1}}function Ns(t){return ji(t)?Ws(t,0,t.nodeValue.length).getClientRects():$e(t)?t.getClientRects():[]}function qs(t,e,n,r){return n?ok(t,e,n,r,-1)||ok(t,e,n,r,1):!1}function Io(t){for(var e=0;;e++)if(t=t.previousSibling,!t)return e}function Pu(t){return $e(t)&&/^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(t.nodeName)}function ok(t,e,n,r,o){for(;;){if(t==n&&e==r)return!0;if(e==(o<0?0:Br(t))){if(t.nodeName=="DIV")return!1;let a=t.parentNode;if(!a||!$e(a))return!1;e=Io(t)+(o<0?0:1),t=a}else if($e(t)){if(t=t.childNodes[e+(o<0?-1:0)],$e(t)&&(t.nodeName=="IMG"||t.nodeName=="BR"||t.contentEditable=="false"))return!1;e=o<0?Br(t):0}else return!1}}function Br(t){return ji(t)?t.nodeValue.length:t.childNodes.length}function Qs(t,e){let{left:n,right:r}=t;if(n==r)return t;let o=e?n:r;return{left:o,right:o,top:t.top,bottom:t.bottom}}function xE(t){let e=t.visualViewport;return e?{left:0,right:e.width,top:0,bottom:e.height}:{left:0,right:t.innerWidth,top:0,bottom:t.innerHeight}}function Ek(t,e){let n=e.width/t.offsetWidth,r=e.height/t.offsetHeight;return(n>.995&&n<1.005||!isFinite(n)||Math.abs(e.width-t.offsetWidth)<1)&&(n=1),(r>.995&&r<1.005||!isFinite(r)||Math.abs(e.height-t.offsetHeight)<1)&&(r=1),{scaleX:n,scaleY:r}}function gE(t,e,n,r,o,a,i,l){let s=t.ownerDocument,f=s.defaultView||window;for(let c=t,d=!1;c&&!d;)if($e(c)){let u,p=c==s.body,m=1,x=1,b=!0,h=!0;if(p)u=xE(f);else{let I=getComputedStyle(c);if(/^(fixed|sticky)$/.test(I.position)&&(d=!0),(c.scrollHeight<=c.clientHeight||!/auto|scroll/.test(I.overflowY))&&(h=!1),(c.scrollWidth<=c.clientWidth||!/auto|scroll/.test(I.overflowX))&&(b=!1),!b&&!h){c=c.assignedSlot||c.parentNode;continue}let v=c.getBoundingClientRect();({scaleX:m,scaleY:x}=Ek(c,v)),u={left:v.left,right:v.left+c.clientWidth*m,top:v.top,bottom:v.top+c.clientHeight*x}}let y=0,g=0;if(h)if(o=="nearest")e.top<u.top+i?(g=e.top-(u.top+i),n>0&&e.bottom>u.bottom+g&&(g=e.bottom-u.bottom+i)):e.bottom>u.bottom-i&&(g=e.bottom-u.bottom+i,n<0&&e.top-g<u.top&&(g=e.top-(u.top+i)));else{let I=e.bottom-e.top,v=u.bottom-u.top;g=(o=="center"&&I<=v?e.top+I/2-v/2:o=="start"||o=="center"&&n<0?e.top-i:e.bottom-v+i)-u.top}if(b&&(r=="nearest"?e.left<u.left+a?(y=e.left-(u.left+a),n>0&&e.right>u.right+y&&(y=e.right-u.right+a)):e.right>u.right-a&&(y=e.right-u.right+a,n<0&&e.left<u.left+y&&(y=e.left-(u.left+a))):y=(r=="center"?e.left+(e.right-e.left)/2-(u.right-u.left)/2:r=="start"==l?e.left-a:e.right-(u.right-u.left)+a)-u.left),y||g)if(p)f.scrollBy(y,g);else{let I=0,v=0;if(g){let S=c.scrollTop;c.scrollTop+=g/x,v=(c.scrollTop-S)*x}if(y){let S=c.scrollLeft;c.scrollLeft+=y/m,I=(c.scrollLeft-S)*m}e={left:e.left-I,top:e.top-v,right:e.right-I,bottom:e.bottom-v},I&&Math.abs(I-y)<1&&(r="nearest"),v&&Math.abs(v-g)<1&&(o="nearest")}if(p)break;(e.top<u.top||e.bottom>u.bottom||e.left<u.left||e.right>u.right)&&(e={left:Math.max(e.left,u.left),right:Math.min(e.right,u.right),top:Math.max(e.top,u.top),bottom:Math.min(e.bottom,u.bottom)}),c=c.assignedSlot||c.parentNode}else if(c.nodeType==11)c=c.host;else break}function Fk(t,e=!0){let n=t.ownerDocument,r=null,o=null;for(let a=t.parentNode;a&&!(a==n.body||(!e||r)&&o);)if($e(a))!o&&a.scrollHeight>a.clientHeight&&/scroll|auto/.test(getComputedStyle(a).overflowY)&&(o=a),e&&!r&&a.scrollWidth>a.clientWidth&&/scroll|auto/.test(getComputedStyle(a).overflowX)&&(r=a),a=a.assignedSlot||a.parentNode;else if(a.nodeType==11)a=a.host;else break;return{x:r,y:o}}function Lk(t){let e=[];for(let n=t;n;n=n.nodeType==11?n.host:n.parentNode)$e(n)&&e.push({node:n,left:n.scrollLeft,top:n.scrollTop});return e}function Nk(t,e=!0){for(let{node:n,left:r,top:o}of t)e&&n.scrollTop!=o&&(n.scrollTop=o),n.scrollLeft!=r&&(n.scrollLeft=r)}function qk(t){if(t.setActive)return t.setActive();if(da)return t.focus(da);let e=Lk(t);t.focus(da==null?{get preventScroll(){return da={preventScroll:!0},!0}}:void 0),da||(da=!1,Nk(e))}function Ws(t,e,n=e){let r=ak||(ak=document.createRange());return r.setEnd(t,n),r.setStart(t,e),r}function Ui(t,e,n,r){let o={key:e,code:e,keyCode:n,which:n,cancelable:!0};r&&({altKey:o.altKey,ctrlKey:o.ctrlKey,shiftKey:o.shiftKey,metaKey:o.metaKey}=r);let a=new KeyboardEvent("keydown",o);a.synthetic=!0,t.dispatchEvent(a);let i=new KeyboardEvent("keyup",o);return i.synthetic=!0,t.dispatchEvent(i),a.defaultPrevented||i.defaultPrevented}function yE(t){for(;t;){if(t&&(t.nodeType==9||t.nodeType==11&&t.host))return t;t=t.assignedSlot||t.parentNode}return null}function bE(t,e){let n=e.focusNode,r=e.focusOffset;if(!n||e.anchorNode!=n||e.anchorOffset!=r)return!1;for(r=Math.min(r,Br(n));;)if(r){if(!$e(n))return!1;let o=n.childNodes[r-1];o.contentEditable=="false"?r--:(n=o,r=Br(n))}else{if(n==t)return!0;r=Io(n),n=n.parentNode}}function _k(t){return t instanceof Window?t.pageYOffset>Math.max(0,t.document.documentElement.scrollHeight-t.innerHeight-4):t.scrollTop>Math.max(1,t.scrollHeight-t.clientHeight-4)}function Pk(t,e){for(let n=t,r=e;;){if(ji(n)&&r>0)return{node:n,offset:r};if($e(n)&&r>0){if(n.contentEditable=="false")return null;n=n.childNodes[r-1],r=Br(n)}else if(n.parentNode&&!Pu(n))r=Io(n),n=n.parentNode;else return null}}function zk(t,e){for(let n=t,r=e;;){if(ji(n)&&r<n.nodeValue.length)return{node:n,offset:r};if($e(n)&&r<n.childNodes.length){if(n.contentEditable=="false")return null;n=n.childNodes[r],r=0}else if(n.parentNode&&!Pu(n))r=Io(n)+1,n=n.parentNode;else return null}}function Hk(t){let e=[];for(let n=0;n<t.length;n++)e.push(1<<+t[n]);return e}function Uk(t){return t<=247?IE[t]:1424<=t&&t<=1524?2:1536<=t&&t<=1785?vE[t-1536]:1774<=t&&t<=2220?4:8192<=t&&t<=8204?256:64336<=t&&t<=65023?4:1}function jk(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++){let r=t[n],o=e[n];if(r.from!=o.from||r.to!=o.to||r.direction!=o.direction||!jk(r.inner,o.inner))return!1}return!0}function SE(t,e,n,r,o){for(let a=0;a<=r.length;a++){let i=a?r[a-1].to:e,l=a<r.length?r[a].from:n,s=a?256:o;for(let f=i,c=s,d=s;f<l;f++){let u=Uk(t.charCodeAt(f));u==512?u=c:u==8&&d==4&&(u=16),pe[f]=u==4?2:u,u&7&&(d=u),c=u}for(let f=i,c=s,d=s;f<l;f++){let u=pe[f];if(u==128)f<l-1&&c==pe[f+1]&&c&24?u=pe[f]=c:pe[f]=256;else if(u==64){let p=f+1;for(;p<l&&pe[p]==64;)p++;let m=f&&c==8||p<n&&pe[p]==8?d==1?1:8:256;for(let x=f;x<p;x++)pe[x]=m;f=p-1}else u==8&&d==1&&(pe[f]=1);c=u,u&7&&(d=u)}}}function kE(t,e,n,r,o){let a=o==1?2:1;for(let i=0,l=0,s=0;i<=r.length;i++){let f=i?r[i-1].to:e,c=i<r.length?r[i].from:n;for(let d=f,u,p,m;d<c;d++)if(p=Gx[u=t.charCodeAt(d)])if(p<0){for(let x=l-3;x>=0;x-=3)if(Yn[x+1]==-p){let b=Yn[x+2],h=b&2?o:b&4?b&1?a:o:0;h&&(pe[d]=pe[Yn[x]]=h),l=x;break}}else{if(Yn.length==189)break;Yn[l++]=d,Yn[l++]=u,Yn[l++]=s}else if((m=pe[d])==2||m==1){let x=m==o;s=x?0:1;for(let b=l-3;b>=0;b-=3){let h=Yn[b+2];if(h&2)break;if(x)Yn[b+2]|=2;else{if(h&4)break;Yn[b+2]|=4}}}}}function CE(t,e,n,r){for(let o=0,a=r;o<=n.length;o++){let i=o?n[o-1].to:t,l=o<n.length?n[o].from:e;for(let s=i;s<l;){let f=pe[s];if(f==256){let c=s+1;for(;;)if(c==l){if(o==n.length)break;c=n[o++].to,l=o<n.length?n[o].from:e}else if(pe[c]==256)c++;else break;let d=a==1,u=(c<e?pe[c]:r)==1,p=d==u?d?1:2:r;for(let m=c,x=o,b=x?n[x-1].to:t;m>s;)m==b&&(m=n[--x].from,b=x?n[x-1].to:t),pe[--m]=p;s=c}else a=f,s++}}}function Xx(t,e,n,r,o,a,i){let l=r%2?2:1;if(r%2==o%2)for(let s=e,f=0;s<n;){let c=!0,d=!1;if(f==a.length||s<a[f].from){let x=pe[s];x!=l&&(c=!1,d=x==16)}let u=!c&&l==1?[]:null,p=c?r:r+1,m=s;e:for(;;)if(f<a.length&&m==a[f].from){if(d)break e;let x=a[f];if(!c)for(let b=x.to,h=f+1;;){if(b==n)break e;if(h<a.length&&a[h].from==b)b=a[h++].to;else{if(pe[b]==l)break e;break}}if(f++,u)u.push(x);else{x.from>s&&i.push(new In(s,x.from,p));let b=x.direction==Vi!=!(p%2);Qx(t,b?r+1:r,o,x.inner,x.from,x.to,i),s=x.to}m=x.to}else{if(m==n||(c?pe[m]!=l:pe[m]==l))break;m++}u?Xx(t,s,m,r+1,o,u,i):s<m&&i.push(new In(s,m,p)),s=m}else for(let s=n,f=a.length;s>e;){let c=!0,d=!1;if(!f||s>a[f-1].to){let x=pe[s-1];x!=l&&(c=!1,d=x==16)}let u=!c&&l==1?[]:null,p=c?r:r+1,m=s;e:for(;;)if(f&&m==a[f-1].to){if(d)break e;let x=a[--f];if(!c)for(let b=x.from,h=f;;){if(b==e)break e;if(h&&a[h-1].to==b)b=a[--h].from;else{if(pe[b-1]==l)break e;break}}if(u)u.push(x);else{x.to<s&&i.push(new In(x.to,s,p));let b=x.direction==Vi!=!(p%2);Qx(t,b?r+1:r,o,x.inner,x.from,x.to,i),s=x.from}m=x.from}else{if(m==e||(c?pe[m-1]!=l:pe[m-1]==l))break;m--}u?Xx(t,m,s,r+1,o,u,i):m<s&&i.push(new In(m,s,p)),s=m}}function Qx(t,e,n,r,o,a,i){let l=e%2?2:1;SE(t,o,a,r,l),kE(t,o,a,r,l),CE(o,a,r,l),Xx(t,o,a,e,n,r,i)}function AE(t,e,n){if(!t)return[new In(0,0,e==Rg?1:0)];if(e==Vi&&!n.length&&!wE.test(t))return Vk(t.length);if(n.length)for(;t.length>pe.length;)pe[pe.length]=256;let r=[],o=e==Vi?0:1;return Qx(t,o,o,n,0,t.length,r),r}function Vk(t){return[new In(0,t,0)]}function TE(t,e,n,r,o){var a;if(!t.length)return null;let i=r.head-t.from,l;if(r.head==t.from&&r.assoc<0){if(!o)return null;i=e[l=0].side(!1,n)}else if(r.head==t.to&&r.assoc>0){if(o)return null;i=e[l=e.length-1].side(!0,n)}else l=In.find(e,i,(a=r.bidiLevel)!==null&&a!==void 0?a:-1,r.assoc);let s=e[l],f=s.side(o,n);if(i==f){let u=l+=o?1:-1;if(u<0||u>=e.length)return null;s=e[l=u],i=s.side(!o,n),f=s.side(o,n)}let c=Je(t.text,i,s.forward(o,n));(c<s.from||c>s.to)&&(c=f),Gk=t.text.slice(Math.min(i,c),Math.max(i,c));let d=l==(o?e.length-1:0)?null:e[l+(o?1:-1)];if(c==f){if(!d)return o?O.cursor(t.to,1):O.cursor(t.from,-1);if(d.level+(o?0:1)<s.level)return O.cursor(d.side(!o,n)+t.from,d.forward(o,n)?1:-1,d.level)}return O.cursor(c+t.from,s.forward(o,n)?-1:1,s.level)}function ME(t,e,n){for(let r=e;r<n;r++){let o=Uk(t.charCodeAt(r));if(o==1)return Vi;if(o==2||o==4)return Rg}}function vt(t,e,n){let r=t.facet(Kk);r.length?r[0](e):window.onerror&&window.onerror(String(e),n,void 0,void 0,e)||(n?console.error(n+":",e):console.error(e))}function ik(t,e){let n=t.state.facet(rC);if(!n.length)return n;let r=n.map(a=>a instanceof Function?a(t):a),o=[];return se.spans(r,e.from,e.to,{point(){},span(a,i,l,s){let f=a-e.from,c=i-e.from,d=o;for(let u=l.length-1;u>=0;u--,s--){let p=l[u].spec.bidiIsolate,m;if(s>0&&d.length&&(m=d[d.length-1]).to==f&&m.direction==p)m.to=c,d=m.inner;else{let x={from:f,to:c,direction:p,inner:[]};d.push(x),d=x.inner}}}}),oC(e.text,o)}function oC(t,e){for(let n of e){if(n.direction==null){for(let r=n.from,o=0;r<n.to;o++){let a=o<n.inner.length?n.inner[o]:null,i=ME(t,r,a?a.from:n.to);if(i){n.direction=i;break}if(!a)break;r=a.to}n.direction==null&&(n.direction=me.LTR)}oC(t,n.inner)}return e}function qg(t){let e=0,n=0,r=0,o=0;for(let a of t.state.facet(aC)){let i=a(t);i&&(i.left!=null&&(e=Math.max(e,i.left)),i.right!=null&&(n=Math.max(n,i.right)),i.top!=null&&(r=Math.max(r,i.top)),i.bottom!=null&&(o=Math.max(o,i.bottom)))}return{left:e,right:n,top:r,bottom:o}}function lk(t){let e=t.nextSibling;return t.parentNode.removeChild(t),e}function RE(t){let e=t.dom.lastChild;if(!e)return t.dom.getBoundingClientRect();let n=Ns(e);return n[n.length-1]||null}function EE(t,e){let n=t.coordsIn(0,1),r=e.coordsIn(0,1);return n&&r&&r.top<n.bottom}function sk(t,e){let n=r=>{for(let o of r.children)if((e?o.isText():o.length)||n(o))return!0;return!1};return n(t)}function FE(t){let e=t.isReplace?(t.startSide<0?64:0)|(t.endSide>0?128:0):t.startSide>0?32:16;return t.block&&(e|=256),e}function LE(t,e){let n=e.spec.attributes,r=e.spec.class;return!n&&!r||(t||(t={class:"cm-line"}),n&&Og(n,t),r&&(t.class+=" "+r)),t}function NE(t){let e=[];for(let n=t.parents.length;n>1;n--){let r=n==t.parents.length?t.tile:t.parents[n].tile;r instanceof Rt&&e.push(r.mark)}return e}function Rx(t){let e=Oe.get(t);return e&&e.setDOM(t.cloneNode()),t}function tg(t,e){let n=e?.get(t);if(n!=1){n==null&&t.destroy();for(let r of t.children)tg(r,e)}}function qE(t){return $e(t.node)&&t.node.firstChild&&(t.offset==0||t.node.childNodes[t.offset-1].contentEditable=="false")&&(t.offset==t.node.childNodes.length||t.node.childNodes[t.offset].contentEditable=="false")}function lC(t,e){let n=t.observer.selectionRange;if(!n.focusNode)return null;let r=Pk(n.focusNode,n.focusOffset),o=zk(n.focusNode,n.focusOffset),a=r||o;if(o&&r&&o.node!=r.node){let l=Oe.get(o.node);if(!l||l.isText()&&l.text!=o.node.nodeValue)a=o;else if(t.docView.lastCompositionAfterCursor){let s=Oe.get(r.node);!s||s.isText()&&s.text!=r.node.nodeValue||(a=o)}}if(t.docView.lastCompositionAfterCursor=a!=r,!a)return null;let i=e-a.offset;return{from:i,to:i+a.node.nodeValue.length,node:a.node}}function _E(t,e,n){let r=lC(t,n);if(!r)return null;let{node:o,from:a,to:i}=r,l=o.nodeValue;if(/[\n\r]/.test(l)||t.state.doc.sliceString(r.from,r.to)!=l)return null;let s=e.invertedDesc;return{range:new Bn(s.mapPos(a),s.mapPos(i),a,i),text:o}}function PE(t,e){return $e(t)?(e&&t.childNodes[e-1].contentEditable=="false"?1:0)|(e<t.childNodes.length&&t.childNodes[e].contentEditable=="false"?2:0):0}function HE(t,e,n){let r=new zE;return se.compare(t,e,n,r),r.changes}function UE(t,e,n){let r=new ng;return se.compare(t,e,n,r),r.changes}function jE(t,e){for(let n=t;n&&n!=e;n=n.assignedSlot||n.parentNode)if($e(n)&&n.contentEditable=="false")return!0;return!1}function VE(t,e){let n=!1;return e&&t.iterChangedRanges((r,o)=>{r<e.to&&o>e.from&&(n=!0)}),n}function GE(t,e,n=1){let r=t.charCategorizer(e),o=t.doc.lineAt(e),a=e-o.from;if(o.length==0)return O.cursor(e);a==0?n=1:a==o.length&&(n=-1);let i=a,l=a;n<0?i=Je(o.text,a,!1):l=Je(o.text,a);let s=r(o.text.slice(i,l));for(;i>0;){let f=Je(o.text,i,!1);if(r(o.text.slice(f,i))!=s)break;i=f}for(;l<o.length;){let f=Je(o.text,l);if(r(o.text.slice(l,f))!=s)break;l=f}return O.undirectionalRange(i+o.from,l+o.from)}function XE(t,e,n,r,o){let a=Math.round((r-e.left)*t.defaultCharacterWidth);if(t.lineWrapping&&n.height>t.defaultLineHeight*1.5){let l=t.viewState.heightOracle.textHeight,s=Math.floor((o-n.top-(t.defaultLineHeight-l)*.5)/l);a+=s*t.viewState.heightOracle.lineLength}let i=t.state.sliceDoc(n.from,n.to);return n.from+QS(i,a,t.state.tabSize)}function QE(t,e,n){let r=t.lineBlockAt(e);if(Array.isArray(r.type)){let o;for(let a of r.type){if(a.from>e)break;if(!(a.to<e)){if(a.from<e&&a.to>e)return a;(!o||a.type==Et.Text&&(o.type!=a.type||(n<0?a.from<e:a.to>e)))&&(o=a)}}return o||r}return r}function WE(t,e,n,r){let o=QE(t,e.head,e.assoc||-1),a=!r||o.type!=Et.Text||!(t.lineWrapping||o.widgetLineBreaks)?null:t.coordsAtPos(e.assoc<0&&e.head>o.from?e.head-1:e.head);if(a){let i=t.dom.getBoundingClientRect(),l=t.textDirectionAt(o.from),s=t.posAndSideAtCoords({x:n==(l==me.LTR)?i.right-1:i.left+1,y:(a.top+a.bottom)/2});if(s)return O.cursor(s.pos,s.assoc)}return O.cursor(n?o.to:o.from,n?1:-1)}function fk(t,e,n,r){let o=t.state.doc.lineAt(e.head),a=t.bidiSpans(o),i=t.textDirectionAt(o.from);for(let l=e,s=null;;){let f=TE(o,a,i,l,n),c=Gk;if(!f){if(o.number==(n?t.state.doc.lines:1))return l;c=`
`,o=t.state.doc.line(o.number+(n?1:-1)),a=t.bidiSpans(o),f=n?O.cursor(o.from,-1):O.cursor(o.to,1)}if(s){if(!s(c))return l}else{if(!r)return f;s=r(c)}l=f}}function KE(t,e,n){let r=t.state.charCategorizer(e),o=r(n);return a=>{let i=r(a);return o==hn.Space&&(o=i),o==i}}function YE(t,e,n,r){let o=e.head,a=n?1:-1;if(o==(n?t.state.doc.length:0))return O.cursor(o,e.assoc);let i=e.goalColumn,l,s=t.contentDOM.getBoundingClientRect(),f=t.coordsAtPos(o,e.assoc||((e.empty?n:e.head==e.from)?1:-1)),c=t.documentTop;if(f)i==null&&(i=f.left-s.left),l=a<0?f.top:f.bottom;else{let m=t.viewState.lineBlockAt(o);i==null&&(i=Math.min(s.right-s.left,t.defaultCharacterWidth*(o-m.from))),l=(a<0?m.top:m.bottom)+c}let d=s.left+i,u=t.viewState.heightOracle.textHeight>>1,p=r??u;for(let m=0;;m+=u){let x=l+(p+m)*a,b=rg(t,{x:d,y:x},!1,a);if(n?x>s.bottom:x<s.top)return O.cursor(b.pos,b.assoc);let h=t.coordsAtPos(b.pos,b.assoc),y=h?(h.top+h.bottom)/2:0;if(!h||(n?y>l:y<l))return O.cursor(b.pos,b.assoc,void 0,i)}}function Hs(t,e,n){for(;;){let r=0;for(let o of t)o.between(e-1,e+1,(a,i,l)=>{if(e>a&&e<i){let s=r||n||(e-a<i-e?-1:1);e=s<0?a:i,r=s}});if(!r)return e}}function sC(t,e){let n=null;for(let r=0;r<e.ranges.length;r++){let o=e.ranges[r],a=null;if(o.empty){let i=Hs(t,o.from,0);i!=o.from&&(a=O.cursor(i,-1))}else{let i=Hs(t,o.from,-1),l=Hs(t,o.to,1);(i!=o.from||l!=o.to)&&(o.undirectional?a=O.undirectionalRange(o.from,o.to):a=O.range(o.from==o.anchor?i:l,o.from==o.head?i:l))}a&&(n||(n=e.ranges.slice()),n[r]=a)}return n?O.create(n,e.mainIndex):e}function Fx(t,e,n){let r=Hs(t.state.facet(Ks).map(o=>o(t)),n.from,e.head>n.from?-1:1);return r==n.from?n:O.cursor(r,r<n.from?1:-1)}function rg(t,e,n,r){let o=t.contentDOM.getBoundingClientRect(),a=o.top+t.viewState.paddingTop,{x:i,y:l}=e,s=l-a,f;for(;;){if(s<0)return new bn(0,1);if(s>t.viewState.docHeight)return new bn(t.state.doc.length,-1);if(f=t.elementAtHeight(s),r==null)break;if(f.type==Et.Text){if(r<0?f.to<t.viewport.from:f.from>t.viewport.to)break;let u=t.docView.coordsAt(r<0?f.from:f.to,r>0?-1:1);if(u&&(r<0?u.top<=s+a:u.bottom>=s+a))break}let d=t.viewState.heightOracle.textHeight/2;s=r>0?f.bottom+d:f.top-d}if(t.viewport.from>=f.to||t.viewport.to<=f.from){if(n)return null;if(f.type==Et.Text){let d=XE(t,o,f,i,l);return new bn(d,d==f.from?1:-1)}}if(f.type!=Et.Text)return s<(f.top+f.bottom)/2?new bn(f.from,1):new bn(f.to,-1);let c=t.docView.lineAt(f.from,2);return(!c||c.length!=f.length)&&(c=t.docView.lineAt(f.from,-2)),new og(t,i,l,t.textDirectionAt(f.from)).scanTile(c,f.from)}function JE(t,e,n){for(;;){if(!e||n<Br(e))return!1;if(e==t)return!0;n=Io(e)+1,e=e.parentNode}}function $E(t,e){let n;for(;!(t==e||!t);t=t.nextSibling){let r=Oe.get(t);if(!r?.isWidget())return!1;r&&(n||(n=[])).push(r)}if(n)for(let r of n){let o=r.overrideDOMText;if(o?.length)return!1}return!0}function fC(t,e,n,r){if(t.isComposite()){let o=-1,a=-1,i=-1,l=-1;for(let s=0,f=r,c=r;s<t.children.length;s++){let d=t.children[s],u=f+d.length;if(f<e&&u>n)return fC(d,e,n,f);if(u>=e&&o==-1&&(o=s,a=f),f>n&&d.dom.parentNode==t.dom){i=s,l=c;break}c=u,f=u+d.breakAfter}return{from:a,to:l<0?r+t.length:l,startDOM:(o?t.children[o-1].dom.nextSibling:null)||t.dom.firstChild,endDOM:i<t.children.length&&i>=0?t.children[i].dom:null}}else return t.isText()?{from:r,to:r+t.length,startDOM:t.dom,endDOM:t.dom.nextSibling}:null}function cC(t,e){let n,{newSel:r}=e,{state:o}=t,a=o.selection.main,i=t.inputState.lastKeyTime>Date.now()-100?t.inputState.lastKeyCode:-1;if(e.bounds){let{from:l,to:s}=e.bounds,f=a.from,c=null;(i===8||q.android&&e.text.length<s-l)&&(f=a.to,c="end");let d=o.doc.sliceString(l,s,qi),u,p;!a.empty&&a.from>=l&&a.to<=s&&(e.typeOver||d!=e.text)&&d.slice(0,a.from-l)==e.text.slice(0,a.from-l)&&d.slice(a.to-l)==e.text.slice(u=e.text.length-(d.length-(a.to-l)))?n={from:a.from,to:a.to,insert:te.of(e.text.slice(a.from-l,u).split(qi))}:(p=uC(d,e.text,f-l,c))&&(q.chrome&&i==13&&p.toB==p.from+2&&e.text.slice(p.from,p.toB)==qi+qi&&p.toB--,n={from:l+p.from,to:l+p.toA,insert:te.of(e.text.slice(p.from,p.toB).split(qi))})}else r&&(!t.hasFocus&&o.facet(Mr)||lg(r,a))&&(r=null);if(!n&&!r)return!1;if((q.mac||q.android)&&n&&n.from==n.to&&n.from==a.head-1&&/^\. ?$/.test(n.insert.toString())&&t.contentDOM.getAttribute("autocorrect")=="off"?(r&&n.insert.length==2&&(r=O.single(r.main.anchor-1,r.main.head-1)),n={from:n.from,to:n.to,insert:te.of([n.insert.toString().replace("."," ")])}):o.doc.lineAt(a.from).to<a.to&&t.docView.lineHasWidget(a.to)&&t.inputState.insertingTextAt>Date.now()-50?n={from:a.from,to:a.to,insert:o.toText(t.inputState.insertingText)}:q.chrome&&n&&n.from==n.to&&n.from==a.head&&n.insert.toString()==`
 `&&t.lineWrapping&&(r&&(r=O.single(r.main.anchor-1,r.main.head-1)),n={from:a.from,to:a.to,insert:te.of([" "])}),n)return _g(t,n,r,i);if(r&&!lg(r,a)){let l=!1,s="select";return t.inputState.lastSelectionTime>Date.now()-50&&(t.inputState.lastSelectionOrigin=="select"&&(l=!0),s=t.inputState.lastSelectionOrigin,s=="select.pointer"&&(r=sC(o.facet(Ks).map(f=>f(t)),r))),t.dispatch({selection:r,scrollIntoView:l,userEvent:s}),!0}else return!1}function _g(t,e,n,r=-1){if(q.ios&&t.inputState.flushIOSKey(e))return!0;let o=t.state.selection.main;if(q.android&&(e.to==o.to&&(e.from==o.from||e.from==o.from-1&&t.state.sliceDoc(e.from,o.from)==" ")&&e.insert.length==1&&e.insert.lines==2&&Ui(t.contentDOM,"Enter",13)||(e.from==o.from-1&&e.to==o.to&&e.insert.length==0||r==8&&e.insert.length<e.to-e.from&&e.to>o.head)&&Ui(t.contentDOM,"Backspace",8)||e.from==o.from&&e.to==o.to+1&&e.insert.length==0&&Ui(t.contentDOM,"Delete",46)))return!0;let a=e.insert.toString();t.inputState.composing>=0&&t.inputState.composing++;let i,l=()=>i||(i=ZE(t,e,n));return t.state.facet(Yk).some(s=>s(t,e.from,e.to,a,l))||t.dispatch(l()),!0}function ZE(t,e,n){let r,o=t.state,a=o.selection.main,i=-1;if(e.from==e.to&&e.from<a.from||e.from>a.to){let s=e.from<a.from?-1:1,f=s<0?a.from:a.to,c=Hs(o.facet(Ks).map(d=>d(t)),f,s);e.from==c&&(i=c)}if(i>-1)r={changes:e,selection:O.cursor(e.from+e.insert.length,-1)};else if(e.from>=a.from&&e.to<=a.to&&e.to-e.from>=(a.to-a.from)/3&&(!n||n.main.empty&&n.main.from==e.from+e.insert.length)&&t.inputState.composing<0){let s=a.from<e.from?o.sliceDoc(a.from,e.from):"",f=a.to>e.to?o.sliceDoc(e.to,a.to):"";r=o.replaceSelection(t.state.toText(s+e.insert.sliceString(0,void 0,t.state.lineBreak)+f))}else{let s=o.changes(e),f=n&&n.main.to<=s.newLength?n.main:void 0;if(o.selection.ranges.length>1&&(t.inputState.composing>=0||t.inputState.compositionPendingChange)&&e.to<=a.to+10&&e.to>=a.to-10){let c=t.state.sliceDoc(e.from,e.to),d,u=n&&lC(t,n.main.head);if(u){let m=e.insert.length-(e.to-e.from);d={from:u.from,to:u.to-m}}else d=t.state.doc.lineAt(a.head);let p=a.to-e.to;r=o.changeByRange(m=>{if(m.from==a.from&&m.to==a.to)return{changes:s,range:f||m.map(s)};let x=m.to-p,b=x-c.length;if(t.state.sliceDoc(b,x)!=c||x>=d.from&&b<=d.to)return{range:m};let h=o.changes({from:b,to:x,insert:e.insert}),y=m.to-a.to;return{changes:h,range:f?O.range(Math.max(0,f.anchor+y),Math.max(0,f.head+y)):m.map(h)}})}else r={changes:s,selection:f&&o.selection.replaceRange(f)}}let l="input.type";return(t.composing||t.inputState.compositionPendingChange&&t.inputState.compositionEndedAt>Date.now()-50)&&(t.inputState.compositionPendingChange=!1,l+=".compose",t.inputState.compositionFirstChange&&(l+=".start",t.inputState.compositionFirstChange=!1)),o.update(r,{userEvent:l,scrollIntoView:!0})}function uC(t,e,n,r){let o=Math.min(t.length,e.length),a=0;for(;a<o&&t.charCodeAt(a)==e.charCodeAt(a);)a++;if(a==o&&t.length==e.length)return null;let i=t.length,l=e.length;for(;i>0&&l>0&&t.charCodeAt(i-1)==e.charCodeAt(l-1);)i--,l--;if(r=="end"){let s=Math.max(0,a-Math.min(i,l));n-=i+s-a}if(i<a&&t.length<e.length){let s=n<=a&&n>=i?a-n:0;a-=s,l=a+(l-i),i=a}else if(l<a){let s=n<=a&&n>=l?a-n:0;a-=s,i=a+(i-l),l=a}return{from:a,toA:i,toB:l}}function eF(t){let e=[];if(t.root.activeElement!=t.contentDOM)return e;let{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}=t.observer.selectionRange;return n&&(e.push(new ju(n,r)),(o!=n||a!=r)&&e.push(new ju(o,a))),e}function tF(t,e){if(t.length==0)return null;let n=t[0].pos,r=t.length==2?t[1].pos:n;return n<0||r<0?null:n==r?O.create([O.cursor(r+e,-1)]):O.single(n+e,r+e)}function lg(t,e){return e.head==t.main.head&&e.anchor==t.main.anchor}function nF(t){return t.visualViewport?t.visualViewport.height*t.visualViewport.scale/t.document.documentElement.clientHeight<.85:!1}function ck(t,e){return(n,r)=>{try{return e.call(t,r,n)}catch(o){vt(n.state,o)}}}function rF(t){let e=Object.create(null);function n(r){return e[r]||(e[r]={observers:[],handlers:[]})}for(let r of t){let o=r.spec,a=o&&o.plugin.domEventHandlers,i=o&&o.plugin.domEventObservers;if(a)for(let l in a){let s=a[l];s&&n(l).handlers.push(ck(r.value,s))}if(i)for(let l in i){let s=i[l];s&&n(l).observers.push(ck(r.value,s))}}for(let r in Rn)n(r).handlers.push(Rn[r]);for(let r in wt)n(r).observers.push(wt[r]);return e}function Du(t){return Math.max(0,t)*.7+8}function aF(t,e){return Math.max(Math.abs(t.clientX-e.clientX),Math.abs(t.clientY-e.clientY))}function iF(t,e){let n=t.state.facet(Xk);return n.length?n[0](e):q.mac?e.metaKey:e.ctrlKey}function lF(t,e){let n=t.state.facet(Qk);return n.length?n[0](e):q.mac?!e.altKey:!e.ctrlKey}function sF(t,e){let{main:n}=t.state.selection;if(n.empty)return!1;let r=Xs(t.root);if(!r||r.rangeCount==0)return!0;let o=r.getRangeAt(0).getClientRects();for(let a=0;a<o.length;a++){let i=o[a];if(i.left<=e.clientX&&i.right>=e.clientX&&i.top<=e.clientY&&i.bottom>=e.clientY)return!0}return!1}function fF(t,e){if(!e.bubbles)return!0;if(e.defaultPrevented)return!1;for(let n=e.target,r;n!=t.contentDOM;n=n.parentNode)if(!n||n.nodeType==11||(r=Oe.get(n))&&r.isWidget()&&!r.isHidden&&r.widget.ignoreEvent(e))return!1;return!0}function cF(t){let e=t.dom.parentNode;if(!e)return;let n=e.appendChild(document.createElement("textarea"));n.style.cssText="position: fixed; left: -10000px; top: 10px",n.focus(),setTimeout(()=>{t.focus(),n.remove(),hC(t,n.value)},50)}function $u(t,e,n){for(let r of t.facet(e))n=r(n,t);return n}function hC(t,e){e=$u(t.state,Eg,e);let{state:n}=t,r,o=1,a=n.toText(e),i=a.lines==n.selection.ranges.length;if(cg!=null&&n.selection.ranges.every(s=>s.empty)&&cg==a.toString()){let s=-1;r=n.changeByRange(f=>{let c=n.doc.lineAt(f.from);if(c.from==s)return{range:f};s=c.from;let d=n.toText((i?a.line(o++).text:e)+n.lineBreak);return{changes:{from:c.from,insert:d},range:O.cursor(f.from+d.length,-1)}})}else i?r=n.changeByRange(s=>{let f=a.line(o++);return{changes:{from:s.from,to:s.to,insert:f.text},range:O.cursor(s.from+f.length,-1)}}):r=n.replaceSelection(a);t.dispatch(r,{userEvent:"input.paste",scrollIntoView:!0})}function uk(t,e,n,r){if(r==1)return O.cursor(e,n);if(r==2)return GE(t.state,e,n);{let o=t.docView.lineAt(e,n),a=t.state.doc.lineAt(o?o.posAtEnd:e),i=o?o.posAtStart:a.from,l=o?o.posAtEnd:a.to;return l<t.state.doc.length&&l==a.to&&l++,O.undirectionalRange(i,l)}}function xC(t){if(!uF)return t.detail;let e=dk,n=mk;return dk=t,mk=Date.now(),pk=!e||n>Date.now()-400&&Math.abs(e.clientX-t.clientX)<2&&Math.abs(e.clientY-t.clientY)<2?(pk+1)%3:1}function dF(t,e){let n=t.posAndSideAtCoords({x:e.clientX,y:e.clientY},!1),r=xC(e),o=t.state.selection;return{update(a){a.docChanged&&(n.pos=a.changes.mapPos(n.pos),o=o.map(a.changes))},get(a,i,l){let s=t.posAndSideAtCoords({x:a.clientX,y:a.clientY},!1),f,c=uk(t,s.pos,s.assoc,r);if(n.pos!=s.pos&&!i){let d=uk(t,n.pos,n.assoc,r),u=Math.min(d.from,c.from),p=Math.max(d.to,c.to);c=u<c.from?O.range(u,p,c.assoc):O.range(p,u,c.assoc)}return i?o.replaceRange(o.main.extend(c.from,c.to,c.assoc)):l&&r==1&&o.ranges.length>1&&(f=pF(o,s.pos))?f:l?o.addRange(c):O.create([c])}}}function pF(t,e){for(let n=0;n<t.ranges.length;n++){let{from:r,to:o}=t.ranges[n];if(r<=e&&o>=e)return O.create(t.ranges.slice(0,n).concat(t.ranges.slice(n+1)),t.mainIndex==n?0:t.mainIndex-(t.mainIndex>n?1:0))}return null}function hk(t,e,n,r){if(n=$u(t.state,Eg,n),!n)return;let o=t.posAtCoords({x:e.clientX,y:e.clientY},!1),{draggedContent:a}=t.inputState,i=r&&a&&lF(t,e)?{from:a.from,to:a.to}:null,l={from:o,insert:n},s=t.state.changes(i?[i,l]:l);t.focus(),t.dispatch({changes:s,selection:{anchor:s.mapPos(o,-1),head:s.mapPos(o,1)},userEvent:i?"move.drop":"input.drop"}),t.inputState.draggedContent=null}function mF(t,e){let n=t.dom.parentNode;if(!n)return;let r=n.appendChild(document.createElement("textarea"));r.style.cssText="position: fixed; left: -10000px; top: 10px",r.value=e,r.focus(),r.selectionEnd=e.length,r.selectionStart=0,setTimeout(()=>{r.remove(),t.focus()},50)}function hF(t){let e=[],n=[],r=!1;for(let o of t.selection.ranges)o.empty||(e.push(t.sliceDoc(o.from,o.to)),n.push(o));if(!e.length){let o=-1;for(let{from:a}of t.selection.ranges){let i=t.doc.lineAt(a);i.number>o&&(e.push(i.text),n.push({from:i.from,to:Math.min(t.doc.length,i.to+1)})),o=i.number}r=!0}return{text:$u(t,Fg,e.join(t.lineBreak)),ranges:n,linewise:r}}function yC(t,e){let n=[];for(let r of t.facet(Jk)){let o=r(t,e);o&&n.push(o)}return n.length?t.update({effects:n,annotations:gC.of(!0)}):null}function bC(t){setTimeout(()=>{let e=t.hasFocus;if(e!=t.inputState.notifiedFocused){let n=yC(t.state,e);n?t.dispatch(n):t.update([])}},10)}function xF(t){xk.has(t)||(xk.add(t),t.addEventListener("copy",()=>{}),t.addEventListener("cut",()=>{}))}function yk(){Ki=!1}function Vu(t,e){return t==e?t:(t.constructor!=e.constructor&&(Ki=!0),e)}function bk(t,e){let n,r;t[e]==null&&(n=t[e-1])instanceof bo&&(r=t[e+1])instanceof bo&&t.splice(e-1,3,new bo(n.length+1+r.length))}function bF(t,e,n){let r=new hg;return se.compare(t,e,n,r,0),r.changes}function IF(t,e){let n=t.getBoundingClientRect(),r=t.ownerDocument,o=r.defaultView||window,a=Math.max(0,n.left),i=Math.min(o.innerWidth,n.right),l=Math.max(0,n.top),s=Math.min(o.innerHeight,n.bottom);for(let f=t.parentNode;f&&f!=r.body;)if($e(f)){let c=window.getComputedStyle(f);if((f.scrollHeight>f.clientHeight||f.scrollWidth>f.clientWidth)&&c.overflow!="visible"){let d=f.getBoundingClientRect();a=Math.max(a,d.left),i=Math.min(i,d.right),l=Math.max(l,d.top),s=Math.min(f==t.parentNode?o.innerHeight:s,d.bottom)}f=c.position=="absolute"||c.position=="fixed"?f.offsetParent:f.parentNode}else if(f.nodeType==11)f=f.host;else break;return{left:a-n.left,right:Math.max(a,i)-n.left,top:l-(n.top+e),bottom:Math.max(l,s)-(n.top+e)}}function vF(t){let e=t.getBoundingClientRect(),n=t.ownerDocument.defaultView||window;return e.left<n.innerWidth&&e.right>0&&e.top<n.innerHeight&&e.bottom>0}function wF(t,e){let n=t.getBoundingClientRect();return{left:0,right:n.right-n.left,top:e,bottom:n.bottom-(n.top+e)}}function SF(t,e,n){let r=[],o=t,a=0;return se.spans(n,t,e,{span(){},point(i,l){i>o&&(r.push({from:o,to:i}),a+=i-o),o=l}},20),o<e&&(r.push({from:o,to:e}),a+=e-o),{total:a,ranges:r}}function Ou({total:t,ranges:e},n){if(n<=0)return e[0].from;if(n>=1)return e[e.length-1].to;let r=Math.floor(t*n);for(let o=0;;o++){let{from:a,to:i}=e[o],l=i-a;if(r<=l)return a+r;r-=l}}function Bu(t,e){let n=0;for(let{from:r,to:o}of t.ranges){if(e<=o){n+=e-r;break}n+=o-r}return n/t.total}function kF(t,e){for(let n of t)if(e(n))return n}function Ik(t){let e=t.facet(Ju).filter(r=>typeof r!="function"),n=t.facet(Ng).filter(r=>typeof r!="function");return n.length&&e.push(se.join(n)),e}function Fs(t,e){if(e.scale==1)return t;let n=e.toDOM(t.top),r=e.toDOM(t.bottom);return new On(t.from,t.length,n,r-n,Array.isArray(t._content)?t._content.map(o=>Fs(o,e)):t._content)}function vg(t,e,n){return new gn(e,{finish(r){return/&/.test(r)?r.replace(/&\w*/,o=>{if(o=="&")return t;if(!n||!n[o])throw new RangeError(`Unsupported selector: ${o}`);return n[o]}):t+" "+r}})}function vk(t,e,n){for(;e;){let r=Oe.get(e);if(r&&r.parent==t)return r;let o=e.parentNode;e=o!=t.dom?o:n>0?e.nextSibling:e.previousSibling}return null}function wk(t,e){let n=e.startContainer,r=e.startOffset,o=e.endContainer,a=e.endOffset,i=t.docView.domAtPos(t.state.selection.main.anchor,1);return qs(i.node,i.offset,o,a)&&([n,r,o,a]=[o,a,n,r]),{anchorNode:n,anchorOffset:r,focusNode:o,focusOffset:a}}function TF(t,e){if(e.getComposedRanges){let o=e.getComposedRanges(t.root)[0];if(o)return wk(t,o)}let n=null;function r(o){o.preventDefault(),o.stopImmediatePropagation(),n=o.getTargetRanges()[0]}return t.contentDOM.addEventListener("beforeinput",r,!0),t.dom.ownerDocument.execCommand("indent"),t.contentDOM.removeEventListener("beforeinput",r,!0),n?wk(t,n):null}function kk(t,e,n){for(let r=t.state.facet(e),o=r.length-1;o>=0;o--){let a=r[o],i=typeof a=="function"?a(t):a;i&&Og(i,n)}return n}function OF(t,e){let n=t.split(/-(?!$)/),r=n[n.length-1];r=="Space"&&(r=" ");let o,a,i,l;for(let s=0;s<n.length-1;++s){let f=n[s];if(/^(cmd|meta|m)$/i.test(f))l=!0;else if(/^a(lt)?$/i.test(f))o=!0;else if(/^(c|ctrl|control)$/i.test(f))a=!0;else if(/^s(hift)?$/i.test(f))i=!0;else if(/^mod$/i.test(f))e=="mac"?l=!0:a=!0;else throw new Error("Unrecognized modifier name: "+f)}return o&&(r="Alt-"+r),a&&(r="Ctrl-"+r),l&&(r="Meta-"+r),i&&(r="Shift-"+r),r}function Eu(t,e,n){return e.altKey&&(t="Alt-"+t),e.ctrlKey&&(t="Ctrl-"+t),e.metaKey&&(t="Meta-"+t),n!==!1&&e.shiftKey&&(t="Shift-"+t),t}function RF(t){let e=t.facet(Yi),n=Ck.get(e);return n||Ck.set(e,n=FF(e.reduce((r,o)=>r.concat(o),[]))),n}function FF(t,e=DF){let n=Object.create(null),r=Object.create(null),o=(i,l)=>{let s=r[i];if(s==null)r[i]=l;else if(s!=l)throw new Error("Key binding "+i+" is used both as a regular binding and as a multi-stroke prefix")},a=(i,l,s,f,c)=>{var d,u;let p=n[i]||(n[i]=Object.create(null)),m=l.split(/ (?!$)/).map(h=>OF(h,e));for(let h=1;h<m.length;h++){let y=m.slice(0,h).join(" ");o(y,!0),p[y]||(p[y]={preventDefault:!0,stopPropagation:!1,run:[g=>{let I=yo={view:g,prefix:y,scope:i};return setTimeout(()=>{yo==I&&(yo=null)},EF),!0}]})}let x=m.join(" ");o(x,!1);let b=p[x]||(p[x]={preventDefault:!1,stopPropagation:!1,run:((u=(d=p._any)===null||d===void 0?void 0:d.run)===null||u===void 0?void 0:u.slice())||[]});s&&b.run.push(s),f&&(b.preventDefault=!0),c&&(b.stopPropagation=!0)};for(let i of t){let l=i.scope?i.scope.split(" "):["editor"];if(i.any)for(let f of l){let c=n[f]||(n[f]=Object.create(null));c._any||(c._any={preventDefault:!1,stopPropagation:!1,run:[]});let{any:d}=i;for(let u in c)c[u].run.push(p=>d(p,kg))}let s=i[e]||i.key;if(s)for(let f of l)a(f,s,i.run,i.preventDefault,i.stopPropagation),i.shift&&a(f,"Shift-"+s,i.shift,i.preventDefault,i.stopPropagation)}return n}function LF(t,e,n,r){kg=e;let o=JS(e),a=Ar(o,0),i=xo(a)==o.length&&o!=" ",l="",s=!1,f=!1,c=!1;yo&&yo.view==n&&yo.scope==r&&(l=yo.prefix+" ",pC.indexOf(e.keyCode)<0&&(f=!0,yo=null));let d=new Set,u=b=>{if(b){for(let h of b.run)if(!d.has(h)&&(d.add(h),h(n)))return b.stopPropagation&&(c=!0),!0;b.preventDefault&&(b.stopPropagation&&(c=!0),f=!0)}return!1},p=t[r],m,x;return p&&(u(p[l+Eu(o,e,!i)])?s=!0:i&&(e.altKey||e.metaKey||e.ctrlKey)&&!(q.windows&&e.ctrlKey&&e.altKey)&&!(q.mac&&e.altKey&&!(e.ctrlKey||e.metaKey))&&(m=Tr[e.keyCode])&&m!=o?(u(p[l+Eu(m,e,!0)])||e.shiftKey&&(x=Ni[e.keyCode])!=o&&x!=m&&u(p[l+Eu(x,e,!1)]))&&(s=!0):i&&e.shiftKey&&u(p[l+Eu(o,e,!0)])&&(s=!0),!s&&u(p._any)&&(s=!0)),f&&(s=!0),s&&c&&e.stopPropagation(),kg=null,s}function SC(){return _F}function kC(t){let e=Ft.fromClass(class{constructor(n){this.view=n,this.placeholder=t?W.set([W.widget({widget:new Cg(t),side:1}).range(0)]):W.none}get decorations(){return this.view.state.doc.length?W.none:this.placeholder}},{decorations:n=>n.decorations});return typeof t=="string"?[e,U.contentAttributes.of({"aria-placeholder":t})]:e}function CC(t){let e=t.dom.ownerDocument.documentElement,n=e.clientWidth,r=getComputedStyle(e);if(!/stable/.test(r.scrollbarGutter||""))return{left:0,right:n};let o=e.getBoundingClientRect(),a=t.win.scrollX;return{left:Math.max(0,o.left+a-parseFloat(r.marginLeft)),right:Math.min(n,o.right+a+parseFloat(r.marginRight))}}function PF(t){let{left:e,right:n}=CC(t);return{top:0,left:e,right:n,bottom:t.dom.ownerDocument.documentElement.clientHeight}}function Mk(t,e){let n=parseInt(t.style.left,10);(isNaN(n)||Math.abs(e-n)>1)&&(t.style.left=e+"px")}function zg(t,e){let n=t.plugin(AC);if(!n)return null;let r=n.manager.tooltips.indexOf(e);return r<0?null:n.manager.tooltipViews[r]}function jF(t){let e=[VF];return t&&t.fixed===!1&&e.push(Tg.of(!0)),e}function Dk(t){return Array.isArray(t)?t:[t]}function Mg(t,e,n){for(;t.value&&t.from<=n;)t.from==n&&e.push(t.value),t.next()}function GF(t,e){if(t.length!=e.length)return!1;for(let n=0;n<t.length;n++)if(!t[n].compare(e[n]))return!1;return!0}function _x(t,e){return t.state.facet(zi).formatNumber(e,t.state)}function TC(t={}){return[zi.of(t),jF(),WF]}function Ok(t){let e=9;for(;e<t;)e=e*10+9;return e}var It,Px,zx,Bk,Hx,Yu,ek,Bx,tk,Ux,nk,q,qu,Or,Et,W,Vs,Gs,ma,_u,$e,ji,Vx,da,ak,Jn,me,Vi,Rg,IE,vE,Gx,Yn,wE,In,pe,Gk,Xk,Qk,Wk,Kk,Wx,Yk,Jk,Eg,Fg,$k,DE,Zk,_s,Tu,eC,Mr,OE,_i,Ft,Ps,tC,Lg,Ju,nC,Ng,Ks,rC,aC,Es,Bn,zu,BE,Oe,Gi,Xi,Dr,Qi,Rt,pa,ha,Wi,Kx,Yx,Jx,$x,Hu,Zx,eg,iC,vo,Ex,Uu,zE,ng,zs,bn,og,qi,ag,ju,ig,sg,dC,oF,pC,Mu,fg,Rn,wt,mC,uF,dk,pk,mk,cg,gC,xk,gk,Ki,ug,dg,On,ye,Lu,Yt,gF,Gu,yn,bo,pg,yF,mg,hg,Us,xg,Xu,Pi,gg,yg,Ru,bg,Ig,IC,vC,wC,CF,AF,Lx,wg,Sg,U,MF,Sk,Qu,DF,BF,Yi,Ck,yo,EF,kg,Ak,NF,I_,v_,qF,_F,Cg,Fu,Ag,Nx,Tk,AC,zF,HF,Pg,$n,qx,UF,Nu,Tg,VF,Dg,Wu,Ku,XF,QF,zi,js,WF,Ys=E(()=>{Li();Ox();$S();ZS();It=typeof navigator<"u"?navigator:{userAgent:"",vendor:"",platform:""},Px=typeof document<"u"?document:{documentElement:{style:{}}},zx=/Edge\/(\d+)/.exec(It.userAgent),Bk=/MSIE \d/.test(It.userAgent),Hx=/Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(It.userAgent),Yu=!!(Bk||Hx||zx),ek=!Yu&&/gecko\/(\d+)/i.test(It.userAgent),Bx=!Yu&&/Chrome\/(\d+)/.exec(It.userAgent),tk="webkitFontSmoothing"in Px.documentElement.style,Ux=!Yu&&/Apple Computer/.test(It.vendor),nk=Ux&&(/Mobile\/\w+/.test(It.userAgent)||It.maxTouchPoints>2),q={mac:nk||/Mac/.test(It.platform),windows:/Win/.test(It.platform),linux:/Linux|X11/.test(It.platform),ie:Yu,ie_version:Bk?Px.documentMode||6:Hx?+Hx[1]:zx?+zx[1]:0,gecko:ek,gecko_version:ek?+(/Firefox\/(\d+)/.exec(It.userAgent)||[0,0])[1]:0,chrome:!!Bx,chrome_version:Bx?+Bx[1]:0,ios:nk,android:/Android\b/.test(It.userAgent),webkit:tk,webkit_version:tk?+(/\bAppleWebKit\/(\d+)/.exec(It.userAgent)||[0,0])[1]:0,safari:Ux,safari_version:Ux?+(/\bVersion\/(\d+(\.\d+)?)/.exec(It.userAgent)||[0,0])[1]:0,tabSize:Px.documentElement.style.tabSize!=null?"tab-size":"-moz-tab-size"};qu=Object.create(null);Or=class{eq(e){return!1}updateDOM(e,n,r){return!1}compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}get estimatedHeight(){return-1}get lineBreaks(){return 0}ignoreEvent(e){return!0}coordsAt(e,n,r){return null}get isHidden(){return!1}get editable(){return!1}destroy(e){}},Et=(function(t){return t[t.Text=0]="Text",t[t.WidgetBefore=1]="WidgetBefore",t[t.WidgetAfter=2]="WidgetAfter",t[t.WidgetRange=3]="WidgetRange",t})(Et||(Et={})),W=class extends xn{constructor(e,n,r,o){super(),this.startSide=e,this.endSide=n,this.widget=r,this.spec=o}get heightRelevant(){return!1}static mark(e){return new Vs(e)}static widget(e){let n=Math.max(-1e4,Math.min(1e4,e.side||0)),r=!!e.block;return n+=r&&!e.inlineOrder?n>0?3e8:-4e8:n>0?1e8:-1e8,new ma(e,n,n,r,e.widget||null,!1)}static replace(e){let n=!!e.block,r,o;if(e.isBlockGap)r=-5e8,o=4e8;else{let{start:a,end:i}=Rk(e,n);r=(a?n?-3e8:-1:5e8)-1,o=(i?n?2e8:1:-6e8)+1}return new ma(e,r,o,n,e.widget||null,!0)}static line(e){return new Gs(e)}static set(e,n=!1){return se.of(e,n)}hasHeight(){return this.widget?this.widget.estimatedHeight>-1:!1}};W.none=se.empty;Vs=class t extends W{constructor(e){let{start:n,end:r}=Rk(e);super(n?-1:5e8,r?1:-6e8,null,e),this.tagName=e.tagName||"span",this.attrs=e.class&&e.attributes?Og(e.attributes,{class:e.class}):e.class?{class:e.class}:e.attributes||qu}eq(e){return this==e||e instanceof t&&this.tagName==e.tagName&&Bg(this.attrs,e.attrs)}range(e,n=e){if(e>=n)throw new RangeError("Mark decorations may not be empty");return super.range(e,n)}};Vs.prototype.point=!1;Gs=class t extends W{constructor(e){super(-2e8,-2e8,null,e)}eq(e){return e instanceof t&&this.spec.class==e.spec.class&&Bg(this.spec.attributes,e.spec.attributes)}range(e,n=e){if(n!=e)throw new RangeError("Line decoration ranges must be zero-length");return super.range(e,n)}};Gs.prototype.mapMode=yt.TrackBefore;Gs.prototype.point=!0;ma=class t extends W{constructor(e,n,r,o,a,i){super(n,r,a,e),this.block=o,this.isReplace=i,this.mapMode=o?n<=0?yt.TrackBefore:yt.TrackAfter:yt.TrackDel}get type(){return this.startSide!=this.endSide?Et.WidgetRange:this.startSide<=0?Et.WidgetBefore:Et.WidgetAfter}get heightRelevant(){return this.block||!!this.widget&&(this.widget.estimatedHeight>=5||this.widget.lineBreaks>0)}eq(e){return e instanceof t&&hE(this.widget,e.widget)&&this.block==e.block&&this.startSide==e.startSide&&this.endSide==e.endSide}range(e,n=e){if(this.isReplace&&(e>n||e==n&&this.startSide>0&&this.endSide<=0))throw new RangeError("Invalid range for replacement decoration");if(!this.isReplace&&n!=e)throw new RangeError("Widget decorations can only have zero-length ranges");return super.range(e,n)}};ma.prototype.point=!0;_u=class t extends xn{constructor(e,n,r){super(),this.tagName=e,this.attributes=n,this.rank=r}eq(e){return e==this||e instanceof t&&this.tagName==e.tagName&&Bg(this.attributes,e.attributes)}static create(e){return new t(e.tagName,e.attributes||qu,e.rank==null?50:Math.max(0,Math.min(e.rank,100)))}static set(e,n=!1){return se.of(e,n)}};_u.prototype.startSide=_u.prototype.endSide=-1;$e=t=>t.nodeType==1,ji=t=>t.nodeType==3;Vx=class{constructor(){this.anchorNode=null,this.anchorOffset=0,this.focusNode=null,this.focusOffset=0}eq(e){return this.anchorNode==e.anchorNode&&this.anchorOffset==e.anchorOffset&&this.focusNode==e.focusNode&&this.focusOffset==e.focusOffset}setRange(e){let{anchorNode:n,focusNode:r}=e;this.set(n,Math.min(e.anchorOffset,n?Br(n):0),r,Math.min(e.focusOffset,r?Br(r):0))}set(e,n,r,o){this.anchorNode=e,this.anchorOffset=n,this.focusNode=r,this.focusOffset=o}};da=null;q.safari&&q.safari_version>=26&&(da=!1);Jn=class t{constructor(e,n,r=!0){this.node=e,this.offset=n,this.precise=r}static before(e,n){return new t(e.parentNode,Io(e),n)}static after(e,n){return new t(e.parentNode,Io(e)+1,n)}},me=(function(t){return t[t.LTR=0]="LTR",t[t.RTL=1]="RTL",t})(me||(me={})),Vi=me.LTR,Rg=me.RTL;IE=Hk("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"),vE=Hk("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"),Gx=Object.create(null),Yn=[];for(let t of["()","[]","{}"]){let e=t.charCodeAt(0),n=t.charCodeAt(1);Gx[e]=n,Gx[n]=-e}wE=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/,In=class{get dir(){return this.level%2?Rg:Vi}constructor(e,n,r){this.from=e,this.to=n,this.level=r}side(e,n){return this.dir==n==e?this.to:this.from}forward(e,n){return e==(this.dir==n)}static find(e,n,r,o){let a=-1;for(let i=0;i<e.length;i++){let l=e[i];if(l.from<=n&&l.to>=n){if(l.level==r)return i;(a<0||(o!=0?o<0?l.from<n:l.to>n:e[a].level>l.level))&&(a=i)}}if(a<0)throw new RangeError("Index out of range");return a}};pe=[];Gk="";Xk=z.define(),Qk=z.define(),Wk=z.define(),Kk=z.define(),Wx=z.define(),Yk=z.define(),Jk=z.define(),Eg=z.define(),Fg=z.define(),$k=z.define({combine:t=>t.some(e=>e)}),DE=z.define({combine:t=>t.some(e=>e)}),Zk=z.define(),_s=class t{constructor(e,n,r,o,a,i=!1){this.range=e,this.y=n,this.x=r,this.yMargin=o,this.xMargin=a,this.isSnapshot=i}map(e){return e.empty?this:new t(this.range.map(e),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}clip(e){return this.range.to<=e.doc.length?this:new t(O.cursor(e.doc.length),this.y,this.x,this.yMargin,this.xMargin,this.isSnapshot)}},Tu=ae.define({map:(t,e)=>t.map(e)}),eC=ae.define();Mr=z.define({combine:t=>t.length?t[0]:!0}),OE=0,_i=z.define({combine(t){return t.filter((e,n)=>{for(let r=0;r<n;r++)if(t[r].plugin==e.plugin)return!1;return!0})}}),Ft=class t{constructor(e,n,r,o,a){this.id=e,this.create=n,this.domEventHandlers=r,this.domEventObservers=o,this.baseExtensions=a(this),this.extension=this.baseExtensions.concat(_i.of({plugin:this,arg:void 0}))}of(e){return this.baseExtensions.concat(_i.of({plugin:this,arg:e}))}static define(e,n){let{eventHandlers:r,eventObservers:o,provide:a,decorations:i}=n||{};return new t(OE++,e,r,o,l=>{let s=[];return i&&s.push(Ju.of(f=>{let c=f.plugin(l);return c?i(c):W.none})),a&&s.push(a(l)),s})}static fromClass(e,n){return t.define((r,o)=>new e(r,o),n)}},Ps=class{constructor(e){this.spec=e,this.mustUpdate=null,this.value=null}get plugin(){return this.spec&&this.spec.plugin}update(e){if(this.value){if(this.mustUpdate){let n=this.mustUpdate;if(this.mustUpdate=null,this.value.update)try{this.value.update(n)}catch(r){if(vt(n.state,r,"CodeMirror plugin crashed"),this.value.destroy)try{this.value.destroy()}catch{}this.deactivate()}}}else if(this.spec)try{this.value=this.spec.plugin.create(e,this.spec.arg)}catch(n){vt(e.state,n,"CodeMirror plugin crashed"),this.deactivate()}return this}destroy(e){var n;if(!((n=this.value)===null||n===void 0)&&n.destroy)try{this.value.destroy()}catch(r){vt(e.state,r,"CodeMirror plugin crashed")}}deactivate(){this.spec=this.value=null}},tC=z.define(),Lg=z.define(),Ju=z.define(),nC=z.define(),Ng=z.define(),Ks=z.define(),rC=z.define();aC=z.define();Es=z.define(),Bn=class t{constructor(e,n,r,o){this.fromA=e,this.toA=n,this.fromB=r,this.toB=o}join(e){return new t(Math.min(this.fromA,e.fromA),Math.max(this.toA,e.toA),Math.min(this.fromB,e.fromB),Math.max(this.toB,e.toB))}addToSet(e){let n=e.length,r=this;for(;n>0;n--){let o=e[n-1];if(!(o.fromA>r.toA)){if(o.toA<r.fromA)break;r=r.join(o),e.splice(n-1,1)}}return e.splice(n,0,r),e}static extendWithRanges(e,n){if(n.length==0)return e;let r=[];for(let o=0,a=0,i=0;;){let l=o<e.length?e[o].fromB:1e9,s=a<n.length?n[a]:1e9,f=Math.min(l,s);if(f==1e9)break;let c=f+i,d=f,u=c;for(;;)if(a<n.length&&n[a]<=d){let p=n[a+1];a+=2,d=Math.max(d,p);for(let m=o;m<e.length&&e[m].fromB<=d;m++)i=e[m].toA-e[m].toB;u=Math.max(u,p+i)}else if(o<e.length&&e[o].fromB<=d){let p=e[o++];d=Math.max(d,p.toB),u=Math.max(u,p.toA),i=p.toA-p.toB}else break;r.push(new t(c,u,f,d))}return r}},zu=class t{constructor(e,n,r){this.view=e,this.state=n,this.transactions=r,this.flags=0,this.startState=e.state,this.changes=bt.empty(this.startState.doc.length);for(let a of r)this.changes=this.changes.compose(a.changes);let o=[];this.changes.iterChangedRanges((a,i,l,s)=>o.push(new Bn(a,i,l,s))),this.changedRanges=o}static create(e,n,r){return new t(e,n,r)}get viewportChanged(){return(this.flags&4)>0}get viewportMoved(){return(this.flags&8)>0}get heightChanged(){return(this.flags&2)>0}get geometryChanged(){return this.docChanged||(this.flags&18)>0}get focusChanged(){return(this.flags&1)>0}get docChanged(){return!this.changes.empty}get selectionSet(){return this.transactions.some(e=>e.selection)}get empty(){return this.flags==0&&this.transactions.length==0}},BE=[],Oe=class{constructor(e,n,r=0){this.dom=e,this.length=n,this.flags=r,this.parent=null,e.cmTile=this}get breakAfter(){return this.flags&1}get children(){return BE}isWidget(){return!1}get isHidden(){return!1}isComposite(){return!1}isLine(){return!1}isText(){return!1}isBlock(){return!1}get domAttrs(){return null}sync(e){if(this.flags|=2,this.flags&4){this.flags&=-5;let n=this.domAttrs;n&&pE(this.dom,n)}}toString(){return this.constructor.name+(this.children.length?`(${this.children})`:"")+(this.breakAfter?"#":"")}destroy(){this.parent=null}setDOM(e){this.dom=e,e.cmTile=this}get posAtStart(){return this.parent?this.parent.posBefore(this):0}get posAtEnd(){return this.posAtStart+this.length}posBefore(e,n=this.posAtStart){let r=n;for(let o of this.children){if(o==e)return r;r+=o.length+o.breakAfter}throw new RangeError("Invalid child in posBefore")}posAfter(e){return this.posBefore(e)+e.length}covers(e){return!0}coordsIn(e,n,r){return null}domPosFor(e,n){let r=Io(this.dom),o=this.length?e>0:n>0;return new Jn(this.parent.dom,r+(o?1:0),e==0||e==this.length)}markDirty(e){this.flags&=-3,e&&(this.flags|=4),this.parent&&this.parent.flags&2&&this.parent.markDirty(!1)}get overrideDOMText(){return null}get root(){for(let e=this;e;e=e.parent)if(e instanceof Xi)return e;return null}static get(e){return e.cmTile}},Gi=class extends Oe{constructor(e){super(e,0),this._children=[]}isComposite(){return!0}get children(){return this._children}get lastChild(){return this.children.length?this.children[this.children.length-1]:null}append(e){this.children.push(e),e.parent=this}sync(e){if(this.flags&2)return;super.sync(e);let n=this.dom,r=null,o,a=e?.node==n?e:null,i=0;for(let l of this.children){if(l.sync(e),i+=l.length+l.breakAfter,o=r?r.nextSibling:n.firstChild,a&&o!=l.dom&&(a.written=!0),l.dom.parentNode==n)for(;o&&o!=l.dom;)o=lk(o);else n.insertBefore(l.dom,o);r=l.dom}for(o=r?r.nextSibling:n.firstChild,a&&o&&(a.written=!0);o;)o=lk(o);this.length=i}};Xi=class extends Gi{constructor(e,n){super(n),this.view=e}owns(e){for(;e;e=e.parent)if(e==this)return!0;return!1}isBlock(){return!0}nearest(e){for(;;){if(!e)return null;let n=Oe.get(e);if(n&&this.owns(n))return n;e=e.parentNode}}blockTiles(e){for(let n=[],r=this,o=0,a=0;;)if(o==r.children.length){if(!n.length)return;r=r.parent,r.breakAfter&&a++,o=n.pop()}else{let i=r.children[o++];if(i instanceof Dr)n.push(o),r=i,o=0;else{let l=a+i.length,s=e(i,a);if(s!==void 0)return s;a=l+i.breakAfter}}}resolveBlock(e,n){let r,o=-1,a,i=-1;if(this.blockTiles((l,s)=>{let f=s+l.length;if(e>=s&&e<=f){if(l.isWidget()&&n>=-1&&n<=1){if(l.flags&32)return!0;l.flags&16&&(r=void 0)}(s<e||e==f&&(n<-1?l.length:l.covers(1)))&&(!r||!l.isWidget()&&r.isWidget())&&(r=l,o=e-s),(f>e||e==s&&(n>1?l.length:l.covers(-1)))&&(!a||!l.isWidget()&&a.isWidget())&&(a=l,i=e-s)}}),!r&&!a)throw new Error("No tile at position "+e);return r&&n<0||!a?{tile:r,offset:o}:{tile:a,offset:i}}},Dr=class t extends Gi{constructor(e,n){super(e),this.wrapper=n}isBlock(){return!0}covers(e){return this.children.length?e<0?this.children[0].covers(-1):this.lastChild.covers(1):!1}get domAttrs(){return this.wrapper.attributes}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},Qi=class t extends Gi{constructor(e,n){super(e),this.attrs=n}isLine(){return!0}static start(e,n,r){let o=new t(n||document.createElement("div"),e);return(!n||!r)&&(o.flags|=4),o}get domAttrs(){return this.attrs}resolveInline(e,n,r=!1){let o=null,a=-1,i=null,l=-1;function s(c,d){for(let u=0,p=0;u<c.children.length&&p<=d;u++){let m=c.children[u],x=p+m.length;x>=d&&(m.isComposite()?s(m,d-p):(!i||r&&i.isHidden&&(n>0&&!(i.flags&32)||r&&EE(i,m)))&&(x>d||m.flags&32&&n<=1)?(i=m,l=d-p):(p<d||m.flags&16&&!(r&&m.isHidden)&&n>=-1)&&(o=m,a=d-p)),p=x}}s(this,e);let f=(n<0?o:i)||o||i;return f?{tile:f,offset:f==o?a:l}:null}coordsIn(e,n,r){let o=this.resolveInline(e,n,!0);return o?o.tile.coordsIn(Math.max(0,o.offset),n,r):RE(this)}domIn(e,n){let r=this.resolveInline(e,n);if(r){let{tile:o,offset:a}=r;if(this.dom.contains(o.dom))return o.isText()?new Jn(o.dom,Math.min(o.dom.nodeValue.length,a)):o.domPosFor(a,o.flags&16?1:o.flags&32?-1:n);let i=r.tile.parent,l=!1;for(let s of i.children){if(l)return new Jn(s.dom,0);s==r.tile&&(l=!0)}}return new Jn(this.dom,0)}};Rt=class t extends Gi{constructor(e,n){super(e),this.mark=n}get domAttrs(){return this.mark.attrs}static of(e,n){let r=new t(n||document.createElement(e.tagName),e);return n||(r.flags|=4),r}},pa=class t extends Oe{constructor(e,n){super(e,n.length),this.text=n}sync(e){this.flags&2||(super.sync(e),this.dom.nodeValue!=this.text&&(e&&e.node==this.dom&&(e.written=!0),this.dom.nodeValue=this.text))}isText(){return!0}toString(){return JSON.stringify(this.text)}coordsIn(e,n,r){let o=this.dom.nodeValue.length;e>o&&(e=o);let a=e,i=e,l=0;e==0&&n<0||e==o&&n>=0?q.chrome||q.gecko||(e?(a--,l=1):i<o&&(i++,l=-1)):n<0?a--:i<o&&i++;let s=Ws(this.dom,a,i).getClientRects();if(!s.length)return null;let f=s[(l?l<0:n>=0)?0:s.length-1];return q.safari&&!l&&f.width==0&&(f=Array.prototype.find.call(s,c=>c.width)||f),r==null?f:Qs(f,(l?l>0:n<0)==r)}static of(e,n){let r=new t(n||document.createTextNode(e),e);return n||(r.flags|=2),r}},ha=class t extends Oe{constructor(e,n,r,o){super(e,n,o),this.widget=r}isWidget(){return!0}get isHidden(){return this.widget.isHidden}covers(e){return this.flags&48?!1:(this.flags&(e<0?64:128))>0}coordsIn(e,n){return this.coordsInWidget(e,n,!1)}coordsInWidget(e,n,r){let o=this.widget.coordsAt(this.dom,e,n);if(o)return o;if(r)return Qs(this.dom.getBoundingClientRect(),this.length?e==0:n<=0);{let a=this.dom.getClientRects(),i=null;if(!a.length)return null;let l=this.flags&16?!0:this.flags&32?!1:e>0;for(let s=l?a.length-1:0;i=a[s],!(e>0?s==0:s==a.length-1||i.top<i.bottom);s+=l?-1:1);return Qs(i,!l)}}get overrideDOMText(){if(!this.length)return te.empty;let{root:e}=this;if(!e)return te.empty;let n=this.posAtStart;return e.view.state.doc.slice(n,n+this.length)}destroy(){super.destroy(),this.widget.destroy(this.dom)}static of(e,n,r,o,a){return a||(a=e.toDOM(n),e.editable||(a.contentEditable="false")),new t(a,r,e,o)}},Wi=class extends Oe{constructor(e){let n=document.createElement("img");n.className="cm-widgetBuffer",n.setAttribute("aria-hidden","true"),super(n,0,e)}get isHidden(){return!0}get overrideDOMText(){return te.empty}coordsIn(e,n,r){let o=this.dom.getBoundingClientRect();return r==null?o:Qs(o,n>0==r)}},Kx=class{constructor(e){this.index=0,this.beforeBreak=!1,this.parents=[],this.tile=e}advance(e,n,r){let{tile:o,index:a,beforeBreak:i,parents:l}=this;for(;e||n>0;)if(o.isComposite())if(i){if(!e)break;r&&r.break(),e--,i=!1}else if(a==o.children.length){if(!e&&!l.length)break;r&&r.leave(o),i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++}else{let s=o.children[a],f=s.breakAfter;(n>0?s.length<=e:s.length<e)&&(!r||r.skip(s,0,s.length)!==!1||!s.isComposite)?(i=!!f,a++,e-=s.length):(l.push({tile:o,index:a}),o=s,a=0,r&&s.isComposite()&&r.enter(s))}else{let s=o.length;if(a<s&&e){let f=Math.min(e,s-a);r&&r.skip(o,a,a+f),e-=f,a+=f}if(a==s)i=!!o.breakAfter,{tile:o,index:a}=l.pop(),a++;else if(!e)break}return this.tile=o,this.index=a,this.beforeBreak=i,this}get root(){return this.parents.length?this.parents[0].tile:this.tile}},Yx=class{constructor(e,n,r,o){this.from=e,this.to=n,this.wrapper=r,this.rank=o}},Jx=class{constructor(e,n,r){this.cache=e,this.root=n,this.blockWrappers=r,this.curLine=null,this.lastBlock=null,this.afterWidget=null,this.pos=0,this.wrappers=[],this.wrapperPos=0}addText(e,n,r,o){var a;this.flushBuffer();let i=this.ensureMarks(n,r),l=i.lastChild;if(l&&l.isText()&&!(l.flags&8)&&l.length+e.length<512){this.cache.reused.set(l,2);let s=i.children[i.children.length-1]=new pa(l.dom,l.text+e);s.parent=i}else i.append(o||pa.of(e,(a=this.cache.find(pa))===null||a===void 0?void 0:a.dom));this.pos+=e.length,this.afterWidget=null}addComposition(e,n){let r=this.curLine;r.dom!=n.line.dom&&(r.setDOM(this.cache.reused.has(n.line)?Rx(n.line.dom):n.line.dom),this.cache.reused.set(n.line,2));let o=r;for(let l=n.marks.length-1;l>=0;l--){let s=n.marks[l],f=o.lastChild;if(f instanceof Rt&&f.mark.eq(s.mark))f.dom!=s.dom&&f.setDOM(Rx(s.dom)),o=f;else{let{dom:c}=s;this.cache.reused.get(s)&&Oe.get(s.dom)&&(c=Rx(s.dom));let d=Rt.of(s.mark,c);o.append(d),o=d}this.cache.reused.set(s,2)}let a=Oe.get(e.text);a&&this.cache.reused.set(a,2);let i=new pa(e.text,e.text.nodeValue);i.flags|=8,this.pos=e.range.toB,o.append(i)}addInlineWidget(e,n,r){let o=this.afterWidget&&e.flags&48&&(this.afterWidget.flags&48)==(e.flags&48);o||this.flushBuffer();let a=this.ensureMarks(n,r);!o&&!(e.flags&16)&&a.append(this.getBuffer(1)),a.append(e),this.pos+=e.length,this.afterWidget=e}addMark(e,n,r){this.flushBuffer(),this.ensureMarks(n,r).append(e),this.pos+=e.length,this.afterWidget=null}addBlockWidget(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}continueWidget(e){let n=this.afterWidget||this.lastBlock;n.length+=e,this.pos+=e}addLineStart(e,n){var r;e||(e=iC);let o=Qi.start(e,n||((r=this.cache.find(Qi))===null||r===void 0?void 0:r.dom),!!n);this.getBlockPos().append(this.lastBlock=this.curLine=o)}addLine(e){this.getBlockPos().append(e),this.pos+=e.length,this.lastBlock=e,this.endLine()}addBreak(){this.lastBlock.flags|=1,this.endLine(),this.pos++}addLineStartIfNotCovered(e){this.blockPosCovered()||this.addLineStart(e)}ensureLine(e){this.curLine||this.addLineStart(e)}ensureMarks(e,n){var r;let o=this.curLine;for(let a=e.length-1;a>=0;a--){let i=e[a],l;if(n>0&&(l=o.lastChild)&&l instanceof Rt&&l.mark.eq(i))o=l,n--;else{let s=Rt.of(i,(r=this.cache.find(Rt,f=>f.mark.eq(i)))===null||r===void 0?void 0:r.dom);o.append(s),o=s,n=0}}return o}endLine(){if(this.curLine){this.flushBuffer();let e=this.curLine.lastChild;(!e||!sk(this.curLine,!1)||e.dom.nodeName!="BR"&&e.isWidget()&&!(q.ios&&sk(this.curLine,!0)))&&this.curLine.append(this.cache.findWidget(Ex,0,32)||new ha(Ex.toDOM(),0,Ex,32)),this.curLine=this.afterWidget=null}}updateBlockWrappers(){this.wrapperPos>this.pos+1e4&&(this.blockWrappers.goto(this.pos),this.wrappers.length=0);for(let e=this.wrappers.length-1;e>=0;e--)this.wrappers[e].to<this.pos&&this.wrappers.splice(e,1);for(let e=this.blockWrappers;e.value&&e.from<=this.pos;e.next())if(e.to>=this.pos){let n=e.rank*102+e.value.rank,r=new Yx(e.from,e.to,e.value,n),o=this.wrappers.length;for(;o>0&&(this.wrappers[o-1].rank-r.rank||this.wrappers[o-1].to-r.to)<0;)o--;this.wrappers.splice(o,0,r)}this.wrapperPos=this.pos}getBlockPos(){var e;this.updateBlockWrappers();let n=this.root;for(let r of this.wrappers){let o=n.lastChild;if(r.from<this.pos&&o instanceof Dr&&o.wrapper.eq(r.wrapper))n=o;else{let a=Dr.of(r.wrapper,(e=this.cache.find(Dr,i=>i.wrapper.eq(r.wrapper)))===null||e===void 0?void 0:e.dom);n.append(a),n=a}}return n}blockPosCovered(){let e=this.lastBlock;return e!=null&&!e.breakAfter&&(!e.isWidget()||(e.flags&160)>0)}getBuffer(e){let n=2|(e<0?16:32),r=this.cache.find(Wi,void 0,1);return r&&(r.flags=n),r||new Wi(n)}flushBuffer(){this.afterWidget&&!(this.afterWidget.flags&32)&&(this.afterWidget.parent.append(this.getBuffer(-1)),this.afterWidget=null)}},$x=class{constructor(e){this.skipCount=0,this.text="",this.textOff=0,this.cursor=e.iter()}skip(e){this.textOff+e<=this.text.length?this.textOff+=e:(this.skipCount+=e-(this.text.length-this.textOff),this.text="",this.textOff=0)}next(e){if(this.textOff==this.text.length){let{value:o,lineBreak:a,done:i}=this.cursor.next(this.skipCount);if(this.skipCount=0,i)throw new Error("Ran out of text content when drawing inline views");this.text=o;let l=this.textOff=Math.min(e,o.length);return a?null:o.slice(0,l)}let n=Math.min(this.text.length,this.textOff+e),r=this.text.slice(this.textOff,n);return this.textOff=n,r}},Hu=[ha,Qi,pa,Rt,Wi,Dr,Xi];for(let t=0;t<Hu.length;t++)Hu[t].bucket=t;Zx=class{constructor(e){this.view=e,this.buckets=Hu.map(()=>[]),this.index=Hu.map(()=>0),this.reused=new Map}add(e){let n=e.constructor.bucket,r=this.buckets[n];r.length<6?r.push(e):r[this.index[n]=(this.index[n]+1)%6]=e}find(e,n,r=2){let o=e.bucket,a=this.buckets[o],i=this.index[o];for(let l=0;l<a.length;l++){let s=(l+i)%a.length,f=a[s];if((!n||n(f))&&!this.reused.has(f))return a.splice(s,1),s<i&&this.index[o]--,this.reused.set(f,r),f}return null}findWidget(e,n,r){let o=this.buckets[0];if(o.length)for(let a=0,i=0;;a++){if(a==o.length){if(i)return null;i=1,a=0}let l=o[a];if(!this.reused.has(l)&&(i==0?l.widget.compare(e):l.widget.constructor==e.constructor&&e.updateDOM(l.dom,this.view,l.widget)))return o.splice(a,1),a<this.index[0]&&this.index[0]--,l.widget==e&&l.length==n&&(l.flags&497)==r?(this.reused.set(l,1),l):(this.reused.set(l,2),new ha(l.dom,n,e,l.flags&-498|r))}}reuse(e){return this.reused.set(e,1),e}maybeReuse(e,n=2){if(!this.reused.has(e))return this.reused.set(e,n),e.dom}clear(){for(let e=0;e<this.buckets.length;e++)this.buckets[e].length=this.index[e]=0}},eg=class{constructor(e,n,r,o,a){this.view=e,this.decorations=o,this.disallowBlockEffectsFor=a,this.openWidget=!1,this.openMarks=0,this.cache=new Zx(e),this.text=new $x(e.state.doc),this.builder=new Jx(this.cache,new Xi(e,e.contentDOM),se.iter(r)),this.cache.reused.set(n,2),this.old=new Kx(n),this.reuseWalker={skip:(i,l,s)=>{if(this.cache.add(i),i.isComposite())return!1},enter:i=>this.cache.add(i),leave:()=>{},break:()=>{}}}run(e,n){let r=n&&this.getCompositionContext(n.text);for(let o=0,a=0,i=0;;){let l=i<e.length?e[i++]:null,s=l?l.fromA:this.old.root.length;if(s>o){let f=s-o;this.preserve(f,!i,!l),o=s,a+=f}if(!l)break;n&&l.fromA<=n.range.fromA&&l.toA>=n.range.toA?(this.forward(l.fromA,n.range.fromA,n.range.fromA<n.range.toA?1:-1),this.emit(a,n.range.fromB),this.builder.flushBuffer(),this.cache.clear(),this.builder.addComposition(n,r),this.text.skip(n.range.toB-n.range.fromB),this.forward(n.range.fromA,l.toA),this.emit(n.range.toB,l.toB)):(this.forward(l.fromA,l.toA),this.emit(a,l.toB)),a=l.toB,o=l.toA}return this.builder.curLine&&this.builder.endLine(),this.builder.root}preserve(e,n,r){let o=NE(this.old),a=this.openMarks;this.old.advance(e,r?1:-1,{skip:(i,l,s)=>{if(i.isWidget())if(this.openWidget)this.builder.continueWidget(s-l);else{let f=s>0||l<i.length?ha.of(i.widget,this.view,s-l,i.flags&496,this.cache.maybeReuse(i)):this.cache.reuse(i);f.flags&256?(f.flags&=-2,this.builder.addBlockWidget(f)):(this.builder.ensureLine(null),this.builder.addInlineWidget(f,o,a),a=o.length)}else if(i.isText())this.builder.ensureLine(null),!l&&s==i.length&&!this.cache.reused.has(i)?this.builder.addText(i.text,o,a,this.cache.reuse(i)):(this.cache.add(i),this.builder.addText(i.text.slice(l,s),o,a)),a=o.length;else if(i.isLine())i.flags&=-2,this.cache.reused.set(i,1),this.builder.addLine(i);else if(i instanceof Wi)this.cache.add(i);else if(i instanceof Rt)this.builder.ensureLine(null),this.builder.addMark(i,o,a),this.cache.reused.set(i,1),a=o.length;else return!1;this.openWidget=!1},enter:i=>{i.isLine()?this.builder.addLineStart(i.attrs,this.cache.maybeReuse(i)):(this.cache.add(i),i instanceof Rt&&o.unshift(i.mark)),this.openWidget=!1},leave:i=>{i.isLine()?o.length&&(o.length=a=0):i instanceof Rt&&(o.shift(),a=Math.min(a,o.length))},break:()=>{this.builder.addBreak(),this.openWidget=!1}}),this.text.skip(e)}emit(e,n){let r=null,o=this.builder,a=-1,i=se.spans(this.decorations,e,n,{point:(l,s,f,c,d,u)=>{if(f instanceof ma){if(this.disallowBlockEffectsFor[u]){if(f.block)throw new RangeError("Block decorations may not be specified via plugins");if(s>this.view.state.doc.lineAt(l).to)throw new RangeError("Decorations that replace line breaks may not be specified via plugins")}if(a=c.length,d>c.length)o.continueWidget(s-l);else{let p=f.widget||(f.block?vo.block:vo.inline),m=FE(f),x=this.cache.findWidget(p,s-l,m)||ha.of(p,this.view,s-l,m);f.block?(f.startSide>0&&o.addLineStartIfNotCovered(r),o.addBlockWidget(x)):(o.ensureLine(r),o.addInlineWidget(x,c,d))}r=null}else r=LE(r,f);s>l&&this.text.skip(s-l)},span:(l,s,f,c)=>{for(let d=l;d<s;){let u=this.text.next(Math.min(512,s-d));u==null?(o.addLineStartIfNotCovered(r),o.addBreak(),d++):(o.ensureLine(r),o.addText(u,f,d==l?c:f.length),d+=u.length),r=null}a=f.length}});a>-1&&(this.openWidget=i>a),this.openWidget||o.addLineStartIfNotCovered(r),this.openMarks=i}forward(e,n,r=1){n-e<=10?this.old.advance(n-e,r,this.reuseWalker):(this.old.advance(5,-1,this.reuseWalker),this.old.advance(n-e-10,-1),this.old.advance(5,r,this.reuseWalker))}getCompositionContext(e){let n=[],r=null;for(let o=e.parentNode;;o=o.parentNode){let a=Oe.get(o);if(o==this.view.contentDOM)break;a instanceof Rt?n.push(a):a?.isLine()?r=a:a instanceof Dr||(o.nodeName=="DIV"&&!r?r=new Qi(o,iC):r||n.push(Rt.of(new Vs({tagName:o.nodeName.toLowerCase(),attributes:mE(o)}),o)))}return r?{line:r,marks:n}:null}};iC={class:"cm-line"};vo=class extends Or{constructor(e){super(),this.tag=e}eq(e){return e.tag==this.tag}toDOM(){return document.createElement(this.tag)}updateDOM(e){return e.nodeName.toLowerCase()==this.tag}get isHidden(){return!0}};vo.inline=new vo("span");vo.block=new vo("div");Ex=new class extends Or{toDOM(){return document.createElement("br")}get isHidden(){return!0}get editable(){return!0}},Uu=class{constructor(e){this.view=e,this.decorations=[],this.blockWrappers=[],this.dynamicDecorationMap=[!1],this.domChanged=null,this.hasComposition=null,this.editContextFormatting=W.none,this.lastCompositionAfterCursor=!1,this.minWidth=0,this.minWidthFrom=0,this.minWidthTo=0,this.impreciseAnchor=null,this.impreciseHead=null,this.forceSelection=!1,this.lastUpdate=Date.now(),this.updateDeco(),this.tile=new Xi(e,e.contentDOM),this.updateInner([new Bn(0,0,0,e.state.doc.length)],null)}update(e){var n;let r=e.changedRanges;this.minWidth>0&&r.length&&(r.every(({fromA:c,toA:d})=>d<this.minWidthFrom||c>this.minWidthTo)?(this.minWidthFrom=e.changes.mapPos(this.minWidthFrom,1),this.minWidthTo=e.changes.mapPos(this.minWidthTo,1)):this.minWidth=this.minWidthFrom=this.minWidthTo=0),this.updateEditContextFormatting(e);let o=-1;this.view.inputState.composing>=0&&!this.view.observer.editContext&&(!((n=this.domChanged)===null||n===void 0)&&n.newSel?o=this.domChanged.newSel.head:!VE(e.changes,this.hasComposition)&&!e.selectionSet&&(o=e.state.selection.main.head));let a=o>-1?_E(this.view,e.changes,o):null;if(this.domChanged=null,this.hasComposition){let{from:c,to:d}=this.hasComposition;r=new Bn(c,d,e.changes.mapPos(c,-1),e.changes.mapPos(d,1)).addToSet(r.slice())}this.hasComposition=a?{from:a.range.fromB,to:a.range.toB}:null,(q.ie||q.chrome)&&!a&&e&&e.state.doc.lines!=e.startState.doc.lines&&(this.forceSelection=!0);let i=this.decorations,l=this.blockWrappers;this.updateDeco();let s=HE(i,this.decorations,e.changes);s.length&&(r=Bn.extendWithRanges(r,s));let f=UE(l,this.blockWrappers,e.changes);return f.length&&(r=Bn.extendWithRanges(r,f)),a&&!r.some(c=>c.fromA<=a.range.fromA&&c.toA>=a.range.toA)&&(r=a.range.addToSet(r.slice())),this.tile.flags&2&&r.length==0?!1:(this.updateInner(r,a),e.transactions.length&&(this.lastUpdate=Date.now()),!0)}updateInner(e,n){this.view.viewState.mustMeasureContent=!0;let{observer:r}=this.view;r.ignore(()=>{if(n||e.length){let i=this.tile,l=new eg(this.view,i,this.blockWrappers,this.decorations,this.dynamicDecorationMap);n&&Oe.get(n.text)&&l.cache.reused.set(Oe.get(n.text),2),this.tile=l.run(e,n),tg(i,l.cache.reused)}this.tile.dom.style.height=this.view.viewState.contentHeight/this.view.scaleY+"px",this.tile.dom.style.flexBasis=this.minWidth?this.minWidth+"px":"";let a=q.chrome||q.ios?{node:r.selectionRange.focusNode,written:!1}:void 0;this.tile.sync(a),a&&(a.written||r.selectionRange.focusNode!=a.node||!this.tile.dom.contains(a.node))&&(this.forceSelection=!0),this.tile.dom.style.height=""});let o=[];if(this.view.viewport.from||this.view.viewport.to<this.view.state.doc.length)for(let a of this.tile.children)a.isWidget()&&a.widget instanceof zs&&o.push(a.dom);r.updateGaps(o)}updateEditContextFormatting(e){this.editContextFormatting=this.editContextFormatting.map(e.changes);for(let n of e.transactions)for(let r of n.effects)r.is(eC)&&(this.editContextFormatting=r.value)}updateSelection(e=!1,n=!1){(e||!this.view.observer.selectionRange.focusNode)&&this.view.observer.readSelectionRange();let{dom:r}=this.tile,o=this.view.root.activeElement,a=o==r,i=!a&&!(this.view.state.facet(Mr)||r.tabIndex>-1)&&Ls(r,this.view.observer.selectionRange)&&!(o&&r.contains(o));if(!(a||n||i))return;let l=this.forceSelection;this.forceSelection=!1;let s=this.view.state.selection.main,f,c;if(s.empty?c=f=this.inlineDOMNearPos(s.anchor,s.assoc||1):(c=this.inlineDOMNearPos(s.head,s.head==s.from?1:-1),f=this.inlineDOMNearPos(s.anchor,s.anchor==s.from?1:-1)),q.gecko&&s.empty&&!this.hasComposition&&qE(f)){let u=document.createTextNode("");this.view.observer.ignore(()=>f.node.insertBefore(u,f.node.childNodes[f.offset]||null)),f=c=new Jn(u,0),l=!0}let d=this.view.observer.selectionRange;(l||!d.focusNode||(!qs(f.node,f.offset,d.anchorNode,d.anchorOffset)||!qs(c.node,c.offset,d.focusNode,d.focusOffset))&&!this.suppressWidgetCursorChange(d,s))&&(this.view.observer.ignore(()=>{q.android&&q.chrome&&r.contains(d.focusNode)&&jE(d.focusNode,r)&&(r.blur(),r.focus({preventScroll:!0}));let u=Xs(this.view.root);if(u)if(s.empty){if(q.gecko){let p=PE(f.node,f.offset);if(p&&p!=3){let m=(p==1?Pk:zk)(f.node,f.offset);m&&(f=new Jn(m.node,m.offset))}}u.collapse(f.node,f.offset),s.bidiLevel!=null&&u.caretBidiLevel!==void 0&&(u.caretBidiLevel=s.bidiLevel)}else if(u.extend){u.collapse(f.node,f.offset);try{u.extend(c.node,c.offset)}catch{}}else{let p=document.createRange();s.anchor>s.head&&([f,c]=[c,f]),p.setEnd(c.node,c.offset),p.setStart(f.node,f.offset),u.removeAllRanges(),u.addRange(p)}i&&this.view.root.activeElement==r&&(r.blur(),o&&o.focus())}),this.view.observer.setSelectionRange(f,c)),this.impreciseAnchor=f.precise?null:new Jn(d.anchorNode,d.anchorOffset),this.impreciseHead=c.precise?null:new Jn(d.focusNode,d.focusOffset)}suppressWidgetCursorChange(e,n){return this.hasComposition&&n.empty&&qs(e.focusNode,e.focusOffset,e.anchorNode,e.anchorOffset)&&this.posFromDOM(e.focusNode,e.focusOffset)==n.head}enforceCursorAssoc(){if(this.hasComposition)return;let{view:e}=this,n=e.state.selection.main,r=Xs(e.root),{anchorNode:o,anchorOffset:a}=e.observer.selectionRange;if(!r||!n.empty||!n.assoc||!r.modify)return;let i=this.lineAt(n.head,n.assoc);if(!i)return;let l=i.posAtStart;if(n.head==l||n.head==l+i.length)return;let s=this.coordsAt(n.head,-1),f=this.coordsAt(n.head,1);if(!s||!f||s.bottom>f.top)return;let c=this.domAtPos(n.head+n.assoc,n.assoc);r.collapse(c.node,c.offset),r.modify("move",n.assoc<0?"forward":"backward","lineboundary"),e.observer.readSelectionRange();let d=e.observer.selectionRange;e.docView.posFromDOM(d.anchorNode,d.anchorOffset)!=n.from&&r.collapse(o,a)}posFromDOM(e,n){let r=this.tile.nearest(e);if(!r)return this.tile.dom.compareDocumentPosition(e)&2?0:this.view.state.doc.length;let o=r.posAtStart;if(r.isComposite()){let a;if(e==r.dom)a=r.dom.childNodes[n];else{let i=Br(e)==0?0:n==0?-1:1;for(;;){let l=e.parentNode;if(l==r.dom)break;i==0&&l.firstChild!=l.lastChild&&(e==l.firstChild?i=-1:i=1),e=l}i<0?a=e:a=e.nextSibling}if(a==r.dom.firstChild)return o;for(;a&&!Oe.get(a);)a=a.nextSibling;if(!a)return o+r.length;for(let i=0,l=o;;i++){let s=r.children[i];if(s.dom==a)return l;l+=s.length+s.breakAfter}}else return r.isText()?e==r.dom?o+n:o+(n?r.length:0):o}domAtPos(e,n){let{tile:r,offset:o}=this.tile.resolveBlock(e,n);return r.isWidget()?r.domPosFor(o,n):r.domIn(o,n)}inlineDOMNearPos(e,n){let r,o=-1,a=!1,i,l=-1,s=!1;return this.tile.blockTiles((f,c)=>{if(f.isWidget()){if(f.flags&32&&c>=e)return!0;f.flags&16&&(a=!0)}else{let d=c+f.length;if(c<=e&&(r=f,o=e-c,a=d<e),d>=e&&!i&&(i=f,l=e-c,s=c>e),c>e&&i)return!0}}),!r&&!i?this.domAtPos(e,n):(a&&i?r=null:s&&r&&(i=null),r&&n<0||!i?r.domIn(o,n):i.domIn(l,n))}coordsAt(e,n,r){let{tile:o,offset:a}=this.tile.resolveBlock(e,n);return o.isWidget()?o.widget instanceof zs?null:o.coordsInWidget(a,n,!0):o.coordsIn(a,n,r)}lineAt(e,n){let{tile:r}=this.tile.resolveBlock(e,n);return r.isLine()?r:null}coordsForChar(e){let{tile:n,offset:r}=this.tile.resolveBlock(e,1);if(!n.isLine())return null;function o(a,i){if(a.isComposite())for(let l of a.children){if(l.length>=i){let s=o(l,i);if(s)return s}if(i-=l.length,i<0)break}else if(a.isText()&&i<a.length){let l=Je(a.text,i);if(l==i)return null;let s=Ws(a.dom,i,l).getClientRects();for(let f=0;f<s.length;f++){let c=s[f];if(f==s.length-1||c.top<c.bottom&&c.left<c.right)return c}}return null}return o(n,r)}measureVisibleLineHeights(e){let n=[],{from:r,to:o}=e,a=this.view.contentDOM.clientWidth,i=a>Math.max(this.view.scrollDOM.clientWidth,this.minWidth)+1,l=-1,s=this.view.textDirection==me.LTR,f=0,c=(d,u,p)=>{for(let m=0;m<d.children.length&&!(u>o);m++){let x=d.children[m],b=u+x.length,h=x.dom.getBoundingClientRect(),{height:y}=h;if(p&&!m&&(f+=h.top-p.top),x instanceof Dr)b>r&&c(x,u,h);else if(u>=r&&(f>0&&n.push(-f),n.push(y+f),f=0,i)){let g=x.dom.lastChild,I=g?Ns(g):[];if(I.length){let v=I[I.length-1],S=s?v.right-h.left:h.right-v.left;S>l&&(l=S,this.minWidth=a,this.minWidthFrom=u,this.minWidthTo=b)}}p&&m==d.children.length-1&&(f+=p.bottom-h.bottom),u=b+x.breakAfter}};return c(this.tile,0,null),n}textDirectionAt(e){let{tile:n}=this.tile.resolveBlock(e,1);return getComputedStyle(n.dom).direction=="rtl"?me.RTL:me.LTR}measureTextSize(){let e=this.tile.blockTiles(i=>{if(i.isLine()&&i.children.length&&i.length<=20){let l=0,s;for(let f of i.children){if(!f.isText()||/[^ -~]/.test(f.text))return;let c=Ns(f.dom);if(c.length!=1)return;l+=c[0].width,s=c[0].height}if(l)return{lineHeight:i.dom.getBoundingClientRect().height,charWidth:l/i.length,textHeight:s}}});if(e)return e;let n=document.createElement("div"),r,o,a;return n.className="cm-line",n.style.width="99999px",n.style.position="absolute",n.textContent="abc def ghi jkl mno pqr stu",this.view.observer.ignore(()=>{this.tile.dom.appendChild(n);let i=Ns(n.firstChild)[0];r=n.getBoundingClientRect().height,o=i&&i.width?i.width/27:7,a=i&&i.height?i.height:r,n.remove()}),{lineHeight:r,charWidth:o,textHeight:a}}computeBlockGapDeco(){let e=[],n=this.view.viewState;for(let r=0,o=0;;o++){let a=o==n.viewports.length?null:n.viewports[o],i=a?a.from-1:this.view.state.doc.length;if(i>r){let l=(n.lineBlockAt(i).bottom-n.lineBlockAt(r).top)/this.view.scaleY;e.push(W.replace({widget:new zs(l),block:!0,inclusive:!0,isBlockGap:!0}).range(r,i))}if(!a)break;r=a.to+1}return W.set(e)}updateDeco(){let e=1,n=this.view.state.facet(Ju).map(a=>(this.dynamicDecorationMap[e++]=typeof a=="function")?a(this.view):a),r=!1,o=this.view.state.facet(Ng).map((a,i)=>{let l=typeof a=="function";return l&&(r=!0),l?a(this.view):a});for(o.length&&(this.dynamicDecorationMap[e++]=r,n.push(se.join(o))),this.decorations=[this.editContextFormatting,...n,this.computeBlockGapDeco(),this.view.viewState.lineGapDeco];e<this.decorations.length;)this.dynamicDecorationMap[e++]=!1;this.blockWrappers=this.view.state.facet(nC).map(a=>typeof a=="function"?a(this.view):a)}scrollIntoView(e){if(e.isSnapshot){let f=this.view.viewState.lineBlockAt(e.range.head);this.view.scrollDOM.scrollTop=f.top-e.yMargin,this.view.scrollDOM.scrollLeft=e.xMargin;return}for(let f of this.view.state.facet(Zk))try{if(f(this.view,e.range,e))return!0}catch(c){vt(this.view.state,c,"scroll handler")}let{range:n}=e,r=this.coordsAt(n.head,n.assoc||(n.head>n.anchor?-1:1)),o;if(!r)return;!n.empty&&(o=this.coordsAt(n.anchor,n.anchor>n.head?-1:1))&&(r={left:Math.min(r.left,o.left),top:Math.min(r.top,o.top),right:Math.max(r.right,o.right),bottom:Math.max(r.bottom,o.bottom)});let a=qg(this.view),i={left:r.left-a.left,top:r.top-a.top,right:r.right+a.right,bottom:r.bottom+a.bottom},{offsetWidth:l,offsetHeight:s}=this.view.scrollDOM;if(gE(this.view.scrollDOM,i,n.head<n.anchor?-1:1,e.x,e.y,Math.max(Math.min(e.xMargin,l),-l),Math.max(Math.min(e.yMargin,s),-s),this.view.textDirection==me.LTR),window.visualViewport&&window.innerHeight-window.visualViewport.height>1&&(r.top>window.visualViewport.offsetTop+window.visualViewport.height||r.bottom<window.visualViewport.offsetTop)){let f=this.view.docView.lineAt(n.head,1);if(f){let c=Lk(f.dom);f.dom.scrollIntoView({block:"nearest"}),Nk(c,!1)}}}lineHasWidget(e){let n=r=>r.isWidget()||r.children.some(n);return n(this.tile.resolveBlock(e,1).tile)}destroy(){tg(this.tile)}};zE=class{constructor(){this.changes=[]}compareRange(e,n){Hi(e,n,this.changes)}comparePoint(e,n){Hi(e,n,this.changes)}boundChange(e){Hi(e,e,this.changes)}};ng=class{constructor(){this.changes=[]}compareRange(e,n){Hi(e,n,this.changes)}comparePoint(){}boundChange(e){Hi(e,e,this.changes)}};zs=class extends Or{constructor(e){super(),this.height=e}toDOM(){let e=document.createElement("div");return e.className="cm-gap",this.updateDOM(e),e}eq(e){return e.height==this.height}updateDOM(e){return e.style.height=this.height+"px",!0}get editable(){return!0}get estimatedHeight(){return this.height}ignoreEvent(){return!1}};bn=class{constructor(e,n){this.pos=e,this.assoc=n}};og=class{constructor(e,n,r,o){this.view=e,this.x=n,this.y=r,this.baseDir=o,this.line=null,this.spans=null}bidiSpansAt(e){return(!this.line||this.line.from>e||this.line.to<e)&&(this.line=this.view.state.doc.lineAt(e),this.spans=this.view.bidiSpans(this.line)),this}baseDirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[In.find(o,e-r.from,-1,n)].level==this.baseDir}dirAt(e,n){let{line:r,spans:o}=this.bidiSpansAt(e);return o[In.find(o,e-r.from,-1,n)].dir}bidiIn(e,n){let{spans:r,line:o}=this.bidiSpansAt(e);return r.length>1||r.length&&(r[0].level!=this.baseDir||r[0].to+o.from<n)}scan(e,n,r=!1){let o=0,a=e.length-1,i=new Set,l=this.bidiIn(e[0],e[a]),s,f,c=-1,d=1e9,u;e:for(;o<a;){let m=a-o,x=o+a>>1;t:if(i.has(x)){for(let y=1;y<m;y++){let g=x+y;if(g>=a&&(g-=m),!i.has(g)){x=g;break t}}break e}i.add(x);let b=n(x),h=0;if(b)for(let y=0;y<b.length;y++){let g=b[y];if(!(g.width==0&&b.length>1))if(g.bottom<this.y)(!s||s.bottom<g.bottom)&&(s=g),h=1;else if(g.top>this.y)(!f||f.top>g.top)&&(f=g),h=-1;else{let I=g.left>this.x?this.x-g.left:g.right<this.x?this.x-g.right:0,v=Math.abs(I);v<d&&(c=x,d=v,u=g),I&&(h=I<0==(this.baseDir==me.LTR)?-1:1)}}h==-1&&(!l||this.baseDirAt(e[x],1))?a=x:h==1&&(!l||this.baseDirAt(e[x+1],-1))&&(o=x+1)}if(!u){if(!f&&!s)return{i:0,after:!1};let m=s&&(!f||this.y-s.bottom<f.top-this.y)?s:f;return this.y=(m.top+m.bottom)/2,this.scan(e,n,!0)}if(d&&!r){let{top:m,bottom:x}=u;if(s&&s.bottom>(m+m+x)/3)return this.y=s.bottom-1,this.scan(e,n,!0);if(f&&f.top<(m+x+x)/3)return this.y=f.top+1,this.scan(e,n,!0)}let p=(l?this.dirAt(e[c],1):this.baseDir)==me.LTR;return{i:c,after:this.x>(u.left+u.right)/2==p}}scanText(e,n){let r=[];for(let a=0;a<e.length;a=Je(e.text,a))r.push(n+a);r.push(n+e.length);let o=this.scan(r,a=>{let i=r[a]-n,l=r[a+1]-n;return Ws(e.dom,i,l).getClientRects()});return o.after?new bn(r[o.i+1],-1):new bn(r[o.i],1)}scanTile(e,n){if(!e.length)return new bn(n,1);if(e.children.length==1){let l=e.children[0];if(l.isText())return this.scanText(l,n);if(l.isComposite())return this.scanTile(l,n)}let r=[n];for(let l=0,s=n;l<e.children.length;l++)r.push(s+=e.children[l].length);let o=this.scan(r,l=>{let s=e.children[l];return s.flags&48?null:($e(s.dom)?s.dom:Ws(s.dom,0,s.length)).getClientRects()}),a=e.children[o.i],i=r[o.i];return a.isText()?this.scanText(a,i):a.isComposite()?this.scanTile(a,i):o.after?new bn(r[o.i+1],-1):new bn(i,1)}},qi="\uFFFF",ag=class{constructor(e,n){this.points=e,this.view=n,this.text="",this.lineSeparator=n.state.facet(De.lineSeparator)}append(e){this.text+=e}lineBreak(){this.text+=qi}readRange(e,n){if(!e)return this;let r=e.parentNode;for(let o=e;;){this.findPointBefore(r,o);let a=this.text.length;this.readNode(o);let i=Oe.get(o),l=o.nextSibling;if(l==n){i?.breakAfter&&!l&&r!=this.view.contentDOM&&this.lineBreak();break}let s=Oe.get(l);(i&&s?i.breakAfter:(i?i.breakAfter:Pu(o))||Pu(l)&&(o.nodeName!="BR"||i?.isWidget())&&this.text.length>a)&&!$E(l,n)&&this.lineBreak(),o=l}return this.findPointBefore(r,n),this}readTextNode(e){let n=e.nodeValue;for(let r of this.points)r.node==e&&(r.pos=this.text.length+Math.min(r.offset,n.length));for(let r=0,o=this.lineSeparator?null:/\r\n?|\n/g;;){let a=-1,i=1,l;if(this.lineSeparator?(a=n.indexOf(this.lineSeparator,r),i=this.lineSeparator.length):(l=o.exec(n))&&(a=l.index,i=l[0].length),this.append(n.slice(r,a<0?n.length:a)),a<0)break;if(this.lineBreak(),i>1)for(let s of this.points)s.node==e&&s.pos>this.text.length&&(s.pos-=i-1);r=a+i}}readNode(e){let n=Oe.get(e),r=n&&n.overrideDOMText;if(r!=null){this.findPointInside(e,r.length);for(let o=r.iter();!o.next().done;)o.lineBreak?this.lineBreak():this.append(o.value)}else ji(e)?this.readTextNode(e):e.nodeName=="BR"?e.nextSibling&&this.lineBreak():$e(e)&&this.readRange(e.firstChild,null)}findPointBefore(e,n){for(let r of this.points)r.node==e&&e.childNodes[r.offset]==n&&(r.pos=this.text.length)}findPointInside(e,n){for(let r of this.points)(ji(e)?r.node==e:e.contains(r.node))&&(r.pos=this.text.length+(JE(e,r.node,r.offset)?n:0))}};ju=class{constructor(e,n){this.node=e,this.offset=n,this.pos=-1}},ig=class{constructor(e,n,r,o){this.typeOver=o,this.bounds=null,this.text="",this.domChanged=n>-1;let{impreciseHead:a,impreciseAnchor:i}=e.docView,l=e.state.selection;if(e.state.readOnly&&n>-1)this.newSel=null;else if(n>-1&&(this.bounds=fC(e.docView.tile,n,r,0))){let s=a||i?[]:eF(e),f=new ag(s,e);f.readRange(this.bounds.startDOM,this.bounds.endDOM),this.text=f.text,this.newSel=tF(s,this.bounds.from)}else{let s=e.observer.selectionRange,f=a&&a.node==s.focusNode&&a.offset==s.focusOffset||!jx(e.contentDOM,s.focusNode)?l.main.head:e.docView.posFromDOM(s.focusNode,s.focusOffset),c=i&&i.node==s.anchorNode&&i.offset==s.anchorOffset||!jx(e.contentDOM,s.anchorNode)?l.main.anchor:e.docView.posFromDOM(s.anchorNode,s.anchorOffset),d=e.viewport;if((q.ios||q.chrome)&&f!=c&&Math.min(f,c)<=l.main.from&&Math.max(f,c)>=l.main.to&&(d.from>0||d.to<e.state.doc.length)){let u=Math.min(f,c),p=Math.max(f,c),m=d.from-u,x=d.to-p;(m==0||m==1||u==0)&&(x==0||x==-1||p==e.state.doc.length)&&(f=0,c=e.state.doc.length)}if(e.inputState.composing>-1&&l.ranges.length>1)this.newSel=l.replaceRange(O.range(c,f));else if(e.lineWrapping&&c==f&&!(l.main.empty&&l.main.head==f)&&e.inputState.lastTouchTime>Date.now()-100){let u=e.coordsAtPos(f,-1),p=0;u&&(p=e.inputState.lastTouchY<=u.bottom?-1:1),this.newSel=O.create([O.cursor(f,p)])}else this.newSel=O.single(c,f)}}};sg=class{setSelectionOrigin(e){this.lastSelectionOrigin=e,this.lastSelectionTime=Date.now()}constructor(e){this.view=e,this.lastKeyCode=0,this.lastKeyTime=0,this.touchActive=!1,this.lastTouchTime=0,this.lastTouchX=0,this.lastTouchY=0,this.lastFocusTime=0,this.lastScrollTop=0,this.lastScrollLeft=0,this.lastWheelEvent=0,this.pendingIOSKey=void 0,this.lastIOSMomentumScroll=0,this.tabFocusMode=-1,this.lastSelectionOrigin=null,this.lastSelectionTime=0,this.lastContextMenu=0,this.scrollHandlers=[],this.handlers=Object.create(null),this.composing=-1,this.compositionFirstChange=null,this.compositionEndedAt=0,this.compositionPendingKey=!1,this.compositionPendingChange=!1,this.insertingText="",this.insertingTextAt=0,this.mouseSelection=null,this.draggedContent=null,this.handleEvent=this.handleEvent.bind(this),this.notifiedFocused=e.hasFocus,q.safari&&e.contentDOM.addEventListener("input",()=>null),q.gecko&&xF(e.contentDOM.ownerDocument)}handleEvent(e){!fF(this.view,e)||this.ignoreDuringComposition(e)||e.type=="keydown"&&this.keydown(e)||(this.view.updateState!=0?Promise.resolve().then(()=>this.runHandlers(e.type,e)):this.runHandlers(e.type,e))}runHandlers(e,n){let r=this.handlers[e];if(r){for(let o of r.observers)o(this.view,n);for(let o of r.handlers){if(n.defaultPrevented)break;if(o(this.view,n)){n.preventDefault();break}}}}ensureHandlers(e){let n=rF(e),r=this.handlers,o=this.view.contentDOM;for(let a in n)if(a!="scroll"){let i=!n[a].handlers.length,l=r[a];l&&i!=!l.handlers.length&&(o.removeEventListener(a,this.handleEvent),l=null),l||o.addEventListener(a,this.handleEvent,{passive:i})}for(let a in r)a!="scroll"&&!n[a]&&o.removeEventListener(a,this.handleEvent);this.handlers=n}keydown(e){if(this.lastKeyCode=e.keyCode,this.lastKeyTime=Date.now(),e.keyCode==9&&this.tabFocusMode>-1&&(!this.tabFocusMode||Date.now()<=this.tabFocusMode))return!0;if(this.tabFocusMode>0&&e.keyCode!=27&&pC.indexOf(e.keyCode)<0&&(this.tabFocusMode=-1),q.android&&q.chrome&&!e.synthetic&&(e.keyCode==13||e.keyCode==8))return this.view.observer.delayAndroidKey(e.key,e.keyCode),!0;if(q.ios&&!e.synthetic&&!e.altKey&&!e.metaKey&&(dC.some(n=>n.keyCode==e.keyCode)&&!e.ctrlKey||oF.indexOf(e.key)>-1&&e.ctrlKey)){let n={ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey};n.shiftKey&&q.ios&&!/^(off|none)$/.test(this.view.contentDOM.autocapitalize)&&nF(this.view.win)&&(n.shiftKey=!1);let r=this.pendingIOSKey={key:e.key,keyCode:e.keyCode,mods:n};return setTimeout(()=>{this.pendingIOSKey==r&&this.flushIOSKey()},50),!0}return e.keyCode!=229&&this.view.observer.forceFlush(),!1}flushIOSKey(e){let n=this.pendingIOSKey;return!n||this.view.observer.pendingRecords().length||n.key=="Enter"&&e&&e.from<e.to&&/^\S+$/.test(e.insert.toString())?!1:(this.pendingIOSKey=void 0,Ui(this.view.contentDOM,n.key,n.keyCode,n.mods))}ignoreDuringComposition(e){return!/^key/.test(e.type)||e.synthetic?!1:this.composing>0?!0:q.safari&&!q.ios&&this.compositionPendingKey&&Date.now()-this.compositionEndedAt<100?(this.compositionPendingKey=!1,!0):!1}startMouseSelection(e){this.mouseSelection&&this.mouseSelection.destroy(),this.mouseSelection=e}update(e){this.view.observer.update(e),this.mouseSelection&&this.mouseSelection.update(e),this.draggedContent&&e.docChanged&&(this.draggedContent=this.draggedContent.map(e.changes)),e.transactions.length&&(this.lastKeyCode=this.lastSelectionTime=0)}destroy(){this.mouseSelection&&this.mouseSelection.destroy()}};dC=[{key:"Backspace",keyCode:8,inputType:"deleteContentBackward"},{key:"Enter",keyCode:13,inputType:"insertParagraph"},{key:"Enter",keyCode:13,inputType:"insertLineBreak"},{key:"Delete",keyCode:46,inputType:"deleteContentForward"}],oF="dthko",pC=[16,17,18,20,91,92,224,225],Mu=6;fg=class{constructor(e,n,r,o){this.view=e,this.startEvent=n,this.style=r,this.mustSelect=o,this.scrollSpeed={x:0,y:0},this.scrolling=-1,this.lastEvent=n,this.scrollParents=Fk(e.contentDOM),this.atoms=e.state.facet(Ks).map(i=>i(e));let a=e.contentDOM.ownerDocument;a.addEventListener("mousemove",this.move=this.move.bind(this)),a.addEventListener("mouseup",this.up=this.up.bind(this)),this.extend=n.shiftKey,this.multiple=e.state.facet(De.allowMultipleSelections)&&iF(e,n),this.dragging=sF(e,n)&&xC(n)==1?null:!1}start(e){this.dragging===!1&&this.select(e)}move(e){if(e.buttons==0)return this.destroy();if(this.dragging||this.dragging==null&&aF(this.startEvent,e)<10)return;this.select(this.lastEvent=e);let n=0,r=0,o=0,a=0,i=this.view.win.innerWidth,l=this.view.win.innerHeight;this.scrollParents.x&&({left:o,right:i}=this.scrollParents.x.getBoundingClientRect()),this.scrollParents.y&&({top:a,bottom:l}=this.scrollParents.y.getBoundingClientRect());let s=qg(this.view);e.clientX-s.left<=o+Mu?n=-Du(o-e.clientX):e.clientX+s.right>=i-Mu&&(n=Du(e.clientX-i)),e.clientY-s.top<=a+Mu?r=-Du(a-e.clientY):e.clientY+s.bottom>=l-Mu&&(r=Du(e.clientY-l)),this.setScrollSpeed(n,r)}up(e){this.dragging==null&&this.select(this.lastEvent),this.dragging||e.preventDefault(),this.destroy()}destroy(){this.setScrollSpeed(0,0);let e=this.view.contentDOM.ownerDocument;e.removeEventListener("mousemove",this.move),e.removeEventListener("mouseup",this.up),this.view.inputState.mouseSelection=this.view.inputState.draggedContent=null}setScrollSpeed(e,n){this.scrollSpeed={x:e,y:n},e||n?this.scrolling<0&&(this.scrolling=setInterval(()=>this.scroll(),50)):this.scrolling>-1&&(clearInterval(this.scrolling),this.scrolling=-1)}scroll(){let{x:e,y:n}=this.scrollSpeed;e&&this.scrollParents.x&&(this.scrollParents.x.scrollLeft+=e,e=0),n&&this.scrollParents.y&&(this.scrollParents.y.scrollTop+=n,n=0),(e||n)&&this.view.win.scrollBy(e,n),this.dragging===!1&&this.select(this.lastEvent)}select(e){let{view:n}=this,r=sC(this.atoms,this.style.get(e,this.extend,this.multiple));(this.mustSelect||!r.eq(n.state.selection,this.dragging===!1))&&this.view.dispatch({selection:r,userEvent:"select.pointer"}),this.mustSelect=!1}update(e){e.transactions.some(n=>n.isUserEvent("input.type"))?this.destroy():this.style.update(e)&&setTimeout(()=>this.select(this.lastEvent),20)}};Rn=Object.create(null),wt=Object.create(null),mC=q.ie&&q.ie_version<15||q.ios&&q.webkit_version<604;wt.scroll=t=>{let e=t.inputState;e.lastScrollTop=t.scrollDOM.scrollTop,e.lastScrollLeft=t.scrollDOM.scrollLeft,q.ios&&!e.touchActive&&(e.lastIOSMomentumScroll=Date.now())};wt.wheel=wt.mousewheel=t=>{t.inputState.lastWheelEvent=Date.now()};Rn.keydown=(t,e)=>(t.inputState.setSelectionOrigin("select"),e.keyCode==27&&t.inputState.tabFocusMode!=0&&(t.inputState.tabFocusMode=Date.now()+2e3),!1);wt.touchstart=(t,e)=>{let n=t.inputState,r=e.targetTouches[0];n.touchActive=!0,n.lastTouchTime=Date.now(),r&&(n.lastTouchX=r.clientX,n.lastTouchY=r.clientY),n.setSelectionOrigin("select.pointer")};wt.touchmove=t=>{t.inputState.setSelectionOrigin("select.pointer")};wt.touchend=(t,e)=>{t.inputState.touchActive=!1};Rn.mousedown=(t,e)=>{if(t.observer.flush(),t.inputState.lastTouchTime>Date.now()-2e3)return!1;let n=null;for(let r of t.state.facet(Wk))if(n=r(t,e),n)break;if(!n&&e.button==0&&(n=dF(t,e)),n){let r=!t.hasFocus;t.inputState.startMouseSelection(new fg(t,e,n,r)),r&&t.observer.ignore(()=>{qk(t.contentDOM);let a=t.root.activeElement;a&&!a.contains(t.contentDOM)&&a.blur()});let o=t.inputState.mouseSelection;if(o)return o.start(e),o.dragging===!1}else t.inputState.setSelectionOrigin("select.pointer");return!1};uF=q.ie&&q.ie_version<=11,dk=null,pk=0,mk=0;Rn.dragstart=(t,e)=>{let{selection:{main:n}}=t.state;if(e.target.draggable){let o=t.docView.tile.nearest(e.target);if(o&&o.isWidget()){let a=o.posAtStart,i=a+o.length;(a>=n.to||i<=n.from)&&(n=O.undirectionalRange(a,i))}}let{inputState:r}=t;return r.mouseSelection&&(r.mouseSelection.dragging=!0),r.draggedContent=n,e.dataTransfer&&(e.dataTransfer.setData("Text",$u(t.state,Fg,t.state.sliceDoc(n.from,n.to))),e.dataTransfer.effectAllowed="copyMove"),!1};Rn.dragend=t=>(t.inputState.draggedContent=null,!1);Rn.drop=(t,e)=>{if(!e.dataTransfer)return!1;if(t.state.readOnly)return!0;let n=e.dataTransfer.files;if(n&&n.length){let r=Array(n.length),o=0,a=()=>{++o==n.length&&hk(t,e,r.filter(i=>i!=null).join(t.state.lineBreak),!1)};for(let i=0;i<n.length;i++){let l=new FileReader;l.onerror=a,l.onload=()=>{/[\x00-\x08\x0e-\x1f]{2}/.test(l.result)||(r[i]=l.result),a()},l.readAsText(n[i])}return!0}else{let r=e.dataTransfer.getData("Text");if(r)return hk(t,e,r,!0),!0}return!1};Rn.paste=(t,e)=>{if(t.state.readOnly)return!0;t.observer.flush();let n=mC?null:e.clipboardData;return n?(hC(t,n.getData("text/plain")||n.getData("text/uri-list")),!0):(cF(t),!1)};cg=null;Rn.copy=Rn.cut=(t,e)=>{if(!Ls(t.contentDOM,t.observer.selectionRange))return!1;let{text:n,ranges:r,linewise:o}=hF(t.state);if(!n&&!o)return!1;cg=o?n:null,e.type=="cut"&&!t.state.readOnly&&t.dispatch({changes:r,scrollIntoView:!0,userEvent:"delete.cut"});let a=mC?null:e.clipboardData;return a?(a.clearData(),a.setData("text/plain",n),!0):(mF(t,n),!1)};gC=Bt.define();wt.focus=t=>{t.inputState.lastFocusTime=Date.now(),!t.scrollDOM.scrollTop&&(t.inputState.lastScrollTop||t.inputState.lastScrollLeft)&&(t.scrollDOM.scrollTop=t.inputState.lastScrollTop,t.scrollDOM.scrollLeft=t.inputState.lastScrollLeft),bC(t)};wt.blur=t=>{t.observer.clearSelectionRange(),bC(t)};wt.compositionstart=wt.compositionupdate=(t,e)=>{if(!t.observer.editContext&&(t.inputState.compositionFirstChange==null&&(t.inputState.compositionFirstChange=!0),t.inputState.composing<0)){let{main:n}=t.state.selection;!n.empty&&t.lineBlockAt(n.from).from!=t.lineBlockAt(n.to).from&&!t.state.readOnly&&t.dispatch({changes:t.state.selection.ranges.filter(r=>!r.empty).map(r=>({from:r.from,to:r.to})),userEvent:"input"}),t.inputState.composing=0}};wt.compositionend=t=>{t.observer.editContext||(t.inputState.composing=-1,t.inputState.compositionEndedAt=Date.now(),t.inputState.compositionPendingKey=!0,t.inputState.compositionPendingChange=t.observer.pendingRecords().length>0,t.inputState.compositionFirstChange=null,q.chrome&&q.android?t.observer.flushSoon():t.inputState.compositionPendingChange?Promise.resolve().then(()=>t.observer.flush()):setTimeout(()=>{t.inputState.composing<0&&t.docView.hasComposition&&t.update([])},50))};wt.contextmenu=t=>{t.inputState.lastContextMenu=Date.now()};Rn.beforeinput=(t,e)=>{var n,r;if((e.inputType=="insertText"||e.inputType=="insertCompositionText")&&(t.inputState.insertingText=e.data,t.inputState.insertingTextAt=Date.now()),e.inputType=="insertReplacementText"&&t.observer.editContext){let a=(n=e.dataTransfer)===null||n===void 0?void 0:n.getData("text/plain"),i=e.getTargetRanges();if(a&&i.length){let l=i[0],s=t.posAtDOM(l.startContainer,l.startOffset),f=t.posAtDOM(l.endContainer,l.endOffset);return _g(t,{from:s,to:f,insert:t.state.toText(a)},null),!0}}let o;if(q.chrome&&q.android&&(o=dC.find(a=>a.inputType==e.inputType))&&(t.observer.delayAndroidKey(o.key,o.keyCode),o.key=="Backspace"||o.key=="Delete")){let a=((r=window.visualViewport)===null||r===void 0?void 0:r.height)||0;setTimeout(()=>{var i;(((i=window.visualViewport)===null||i===void 0?void 0:i.height)||0)>a+10&&t.hasFocus&&(t.contentDOM.blur(),t.focus())},100)}return q.ios&&e.inputType=="deleteContentForward"&&t.observer.flushSoon(),q.safari&&e.inputType=="insertText"&&t.inputState.composing>=0&&setTimeout(()=>wt.compositionend(t,e),20),!1};xk=new Set;gk=["pre-wrap","normal","pre-line","break-spaces"],Ki=!1;ug=class{constructor(e){this.lineWrapping=e,this.doc=te.empty,this.heightSamples={},this.lineHeight=14,this.charWidth=7,this.textHeight=14,this.lineLength=30}heightForGap(e,n){let r=this.doc.lineAt(n).number-this.doc.lineAt(e).number+1;return this.lineWrapping&&(r+=Math.max(0,Math.ceil((n-e-r*this.lineLength*.5)/this.lineLength))),this.lineHeight*r}heightForLine(e){return this.lineWrapping?(1+Math.max(0,Math.ceil((e-this.lineLength)/Math.max(1,this.lineLength-5))))*this.lineHeight:this.lineHeight}setDoc(e){return this.doc=e,this}mustRefreshForWrapping(e){return gk.indexOf(e)>-1!=this.lineWrapping}mustRefreshForHeights(e){let n=!1;for(let r=0;r<e.length;r++){let o=e[r];o<0?r++:this.heightSamples[Math.floor(o*10)]||(n=!0,this.heightSamples[Math.floor(o*10)]=!0)}return n}refresh(e,n,r,o,a,i){let l=gk.indexOf(e)>-1,s=Math.abs(n-this.lineHeight)>.3||this.lineWrapping!=l;if(this.lineWrapping=l,this.lineHeight=n,this.charWidth=r,this.textHeight=o,this.lineLength=a,s){this.heightSamples={};for(let f=0;f<i.length;f++){let c=i[f];c<0?f++:this.heightSamples[Math.floor(c*10)]=!0}}return s}},dg=class{constructor(e,n){this.from=e,this.heights=n,this.index=0}get more(){return this.index<this.heights.length}},On=class t{constructor(e,n,r,o,a){this.from=e,this.length=n,this.top=r,this.height=o,this._content=a}get type(){return typeof this._content=="number"?Et.Text:Array.isArray(this._content)?this._content:this._content.type}get to(){return this.from+this.length}get bottom(){return this.top+this.height}get widget(){return this._content instanceof ma?this._content.widget:null}get widgetLineBreaks(){return typeof this._content=="number"?this._content:0}join(e){let n=(Array.isArray(this._content)?this._content:[this]).concat(Array.isArray(e._content)?e._content:[e]);return new t(this.from,this.length+e.length,this.top,this.height+e.height,n)}},ye=(function(t){return t[t.ByPos=0]="ByPos",t[t.ByHeight=1]="ByHeight",t[t.ByPosNoHeight=2]="ByPosNoHeight",t})(ye||(ye={})),Lu=.001,Yt=class t{constructor(e,n,r=2){this.length=e,this.height=n,this.flags=r}get outdated(){return(this.flags&2)>0}set outdated(e){this.flags=(e?2:0)|this.flags&-3}setHeight(e){this.height!=e&&(Math.abs(this.height-e)>Lu&&(Ki=!0),this.height=e)}replace(e,n,r){return t.of(r)}decomposeLeft(e,n){n.push(this)}decomposeRight(e,n){n.push(this)}applyChanges(e,n,r,o){let a=this,i=r.doc;for(let l=o.length-1;l>=0;l--){let{fromA:s,toA:f,fromB:c,toB:d}=o[l],u=a.lineAt(s,ye.ByPosNoHeight,r.setDoc(n),0,0),p=u.to>=f?u:a.lineAt(f,ye.ByPosNoHeight,r,0,0);for(d+=p.to-f,f=p.to;l>0&&u.from<=o[l-1].toA;)s=o[l-1].fromA,c=o[l-1].fromB,l--,s<u.from&&(u=a.lineAt(s,ye.ByPosNoHeight,r,0,0));c+=u.from-s,s=u.from;let m=mg.build(r.setDoc(i),e,c,d);a=Vu(a,a.replace(s,f,m))}return a.updateHeight(r,0)}static empty(){return new yn(0,0,0)}static of(e){if(e.length==1)return e[0];let n=0,r=e.length,o=0,a=0;for(;;)if(n==r)if(o>a*2){let l=e[n-1];l.break?e.splice(--n,1,l.left,null,l.right):e.splice(--n,1,l.left,l.right),r+=1+l.break,o-=l.size}else if(a>o*2){let l=e[r];l.break?e.splice(r,1,l.left,null,l.right):e.splice(r,1,l.left,l.right),r+=2+l.break,a-=l.size}else break;else if(o<a){let l=e[n++];l&&(o+=l.size)}else{let l=e[--r];l&&(a+=l.size)}let i=!1;return e[n-1]==null?(i=!0,n--):e[n]==null&&(i=!0,r++),new pg(t.of(e.slice(0,n)),i,t.of(e.slice(r)))}};Yt.prototype.size=1;gF=W.replace({}),Gu=class extends Yt{constructor(e,n,r){super(e,n),this.deco=r,this.spaceAbove=0}mainBlock(e,n){return new On(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.deco||0)}blockAt(e,n,r,o){return this.spaceAbove&&e<r+this.spaceAbove?new On(o,0,r,this.spaceAbove,gF):this.mainBlock(r,o)}lineAt(e,n,r,o,a){let i=this.mainBlock(o,a);return this.spaceAbove?this.blockAt(0,r,o,a).join(i):i}forEachLine(e,n,r,o,a,i){e<=a+this.length&&n>=a&&i(this.lineAt(0,ye.ByPos,r,o,a))}setMeasuredHeight(e){let n=e.heights[e.index++];n<0?(this.spaceAbove=-n,n=e.heights[e.index++]):this.spaceAbove=0,this.setHeight(n)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more&&this.setMeasuredHeight(o),this.outdated=!1,this}toString(){return`block(${this.length})`}},yn=class t extends Gu{constructor(e,n,r){super(e,n,null),this.collapsed=0,this.widgetHeight=0,this.breaks=0,this.spaceAbove=r}mainBlock(e,n){return new On(n,this.length,e+this.spaceAbove,this.height-this.spaceAbove,this.breaks)}replace(e,n,r){let o=r[0];return r.length==1&&(o instanceof t||o instanceof bo&&o.flags&4)&&Math.abs(this.length-o.length)<10?(o instanceof bo?o=new t(o.length,this.height,this.spaceAbove):o.height=this.height,this.outdated||(o.outdated=!1),o):Yt.of(r)}updateHeight(e,n=0,r=!1,o){return o&&o.from<=n&&o.more?this.setMeasuredHeight(o):(r||this.outdated)&&(this.spaceAbove=0,this.setHeight(Math.max(this.widgetHeight,e.heightForLine(this.length-this.collapsed))+this.breaks*e.lineHeight)),this.outdated=!1,this}toString(){return`line(${this.length}${this.collapsed?-this.collapsed:""}${this.widgetHeight?":"+this.widgetHeight:""})`}},bo=class t extends Yt{constructor(e){super(e,0)}heightMetrics(e,n){let r=e.doc.lineAt(n).number,o=e.doc.lineAt(n+this.length).number,a=o-r+1,i,l=0;if(e.lineWrapping){let s=Math.min(this.height,e.lineHeight*a);i=s/a,this.length>a+1&&(l=(this.height-s)/(this.length-a-1))}else i=this.height/a;return{firstLine:r,lastLine:o,perLine:i,perChar:l}}blockAt(e,n,r,o){let{firstLine:a,lastLine:i,perLine:l,perChar:s}=this.heightMetrics(n,o);if(n.lineWrapping){let f=o+(e<n.lineHeight?0:Math.round(Math.max(0,Math.min(1,(e-r)/this.height))*this.length)),c=n.doc.lineAt(f),d=l+c.length*s,u=Math.max(r,e-d/2);return new On(c.from,c.length,u,d,0)}else{let f=Math.max(0,Math.min(i-a,Math.floor((e-r)/l))),{from:c,length:d}=n.doc.line(a+f);return new On(c,d,r+l*f,l,0)}}lineAt(e,n,r,o,a){if(n==ye.ByHeight)return this.blockAt(e,r,o,a);if(n==ye.ByPosNoHeight){let{from:p,to:m}=r.doc.lineAt(e);return new On(p,m-p,0,0,0)}let{firstLine:i,perLine:l,perChar:s}=this.heightMetrics(r,a),f=r.doc.lineAt(e),c=l+f.length*s,d=f.number-i,u=o+l*d+s*(f.from-a-d);return new On(f.from,f.length,Math.max(o,Math.min(u,o+this.height-c)),c,0)}forEachLine(e,n,r,o,a,i){e=Math.max(e,a),n=Math.min(n,a+this.length);let{firstLine:l,perLine:s,perChar:f}=this.heightMetrics(r,a);for(let c=e,d=o;c<=n;){let u=r.doc.lineAt(c);if(c==e){let m=u.number-l;d+=s*m+f*(e-a-m)}let p=s+f*u.length;i(new On(u.from,u.length,d,p,0)),d+=p,c=u.to+1}}replace(e,n,r){let o=this.length-n;if(o>0){let a=r[r.length-1];a instanceof t?r[r.length-1]=new t(a.length+o):r.push(null,new t(o-1))}if(e>0){let a=r[0];a instanceof t?r[0]=new t(e+a.length):r.unshift(new t(e-1),null)}return Yt.of(r)}decomposeLeft(e,n){n.push(new t(e-1),null)}decomposeRight(e,n){n.push(null,new t(this.length-e-1))}updateHeight(e,n=0,r=!1,o){let a=n+this.length;if(o&&o.from<=n+this.length&&o.more){let i=[],l=Math.max(n,o.from),s=-1;for(o.from>n&&i.push(new t(o.from-n-1).updateHeight(e,n));l<=a&&o.more;){let c=e.doc.lineAt(l).length;i.length&&i.push(null);let d=o.heights[o.index++],u=0;d<0&&(u=-d,d=o.heights[o.index++]),s==-1?s=d:Math.abs(d-s)>=Lu&&(s=-2);let p=new yn(c,d,u);p.outdated=!1,i.push(p),l+=c+1}l<=a&&i.push(null,new t(a-l).updateHeight(e,l));let f=Yt.of(i);return(s<0||Math.abs(f.height-this.height)>=Lu||Math.abs(s-this.heightMetrics(e,n).perLine)>=Lu)&&(Ki=!0),Vu(this,f)}else(r||this.outdated)&&(this.setHeight(e.heightForGap(n,n+this.length)),this.outdated=!1);return this}toString(){return`gap(${this.length})`}},pg=class extends Yt{constructor(e,n,r){super(e.length+(n?1:0)+r.length,e.height+r.height,(n?1:0)|(e.outdated||r.outdated?2:0)),this.left=e,this.right=r,this.size=e.size+r.size}get break(){return this.flags&1}blockAt(e,n,r,o){let a=r+this.left.height;return e<a?this.left.blockAt(e,n,r,o):this.right.blockAt(e,n,a,o+this.left.length+this.break)}lineAt(e,n,r,o,a){let i=o+this.left.height,l=a+this.left.length+this.break,s=n==ye.ByHeight?e<i:e<l,f=s?this.left.lineAt(e,n,r,o,a):this.right.lineAt(e,n,r,i,l);if(this.break||(s?f.to<l:f.from>l))return f;let c=n==ye.ByPosNoHeight?ye.ByPosNoHeight:ye.ByPos;return s?f.join(this.right.lineAt(l,c,r,i,l)):this.left.lineAt(l,c,r,o,a).join(f)}forEachLine(e,n,r,o,a,i){let l=o+this.left.height,s=a+this.left.length+this.break;if(this.break)e<s&&this.left.forEachLine(e,n,r,o,a,i),n>=s&&this.right.forEachLine(e,n,r,l,s,i);else{let f=this.lineAt(s,ye.ByPos,r,o,a);e<f.from&&this.left.forEachLine(e,Math.min(n,f.from-1),r,o,a,i),f.to>=e&&f.from<=n&&i(f),n>f.to&&this.right.forEachLine(Math.max(e,f.to+1),n,r,l,s,i)}}replace(e,n,r){let o=this.left.length+this.break;if(n<o)return this.balanced(this.left.replace(e,n,r),this.right);if(e>this.left.length)return this.balanced(this.left,this.right.replace(e-o,n-o,r));let a=[];e>0&&this.decomposeLeft(e,a);let i=a.length;for(let l of r)a.push(l);if(e>0&&bk(a,i-1),n<this.length){let l=a.length;this.decomposeRight(n,a),bk(a,l)}return Yt.of(a)}decomposeLeft(e,n){let r=this.left.length;if(e<=r)return this.left.decomposeLeft(e,n);n.push(this.left),this.break&&(r++,e>=r&&n.push(null)),e>r&&this.right.decomposeLeft(e-r,n)}decomposeRight(e,n){let r=this.left.length,o=r+this.break;if(e>=o)return this.right.decomposeRight(e-o,n);e<r&&this.left.decomposeRight(e,n),this.break&&e<o&&n.push(null),n.push(this.right)}balanced(e,n){return e.size>2*n.size||n.size>2*e.size?Yt.of(this.break?[e,null,n]:[e,n]):(this.left=Vu(this.left,e),this.right=Vu(this.right,n),this.setHeight(e.height+n.height),this.outdated=e.outdated||n.outdated,this.size=e.size+n.size,this.length=e.length+this.break+n.length,this)}updateHeight(e,n=0,r=!1,o){let{left:a,right:i}=this,l=n+a.length+this.break,s=null;return o&&o.from<=n+a.length&&o.more?s=a=a.updateHeight(e,n,r,o):a.updateHeight(e,n,r),o&&o.from<=l+i.length&&o.more?s=i=i.updateHeight(e,l,r,o):i.updateHeight(e,l,r),s?this.balanced(a,i):(this.height=this.left.height+this.right.height,this.outdated=!1,this)}toString(){return this.left+(this.break?" ":"-")+this.right}};yF=5,mg=class t{constructor(e,n){this.pos=e,this.oracle=n,this.nodes=[],this.lineStart=-1,this.lineEnd=-1,this.covering=null,this.writtenTo=e}get isCovered(){return this.covering&&this.nodes[this.nodes.length-1]==this.covering}span(e,n){if(this.lineStart>-1){let r=Math.min(n,this.lineEnd),o=this.nodes[this.nodes.length-1];o instanceof yn?o.length+=r-this.pos:(r>this.pos||!this.isCovered)&&this.nodes.push(new yn(r-this.pos,-1,0)),this.writtenTo=r,n>r&&(this.nodes.push(null),this.writtenTo++,this.lineStart=-1)}this.pos=n}point(e,n,r){if(e<n||r.heightRelevant){let o=r.widget?r.widget.estimatedHeight:0,a=r.widget?r.widget.lineBreaks:0;o<0&&(o=this.oracle.lineHeight);let i=n-e;r.block?this.addBlock(new Gu(i,o,r)):(i||a||o>=yF)&&this.addLineDeco(o,a,i)}else n>e&&this.span(e,n);this.lineEnd>-1&&this.lineEnd<this.pos&&(this.lineEnd=this.oracle.doc.lineAt(this.pos).to)}enterLine(){if(this.lineStart>-1)return;let{from:e,to:n}=this.oracle.doc.lineAt(this.pos);this.lineStart=e,this.lineEnd=n,this.writtenTo<e&&((this.writtenTo<e-1||this.nodes[this.nodes.length-1]==null)&&this.nodes.push(this.blankContent(this.writtenTo,e-1)),this.nodes.push(null)),this.pos>e&&this.nodes.push(new yn(this.pos-e,-1,0)),this.writtenTo=this.pos}blankContent(e,n){let r=new bo(n-e);return this.oracle.doc.lineAt(e).to==n&&(r.flags|=4),r}ensureLine(){this.enterLine();let e=this.nodes.length?this.nodes[this.nodes.length-1]:null;if(e instanceof yn)return e;let n=new yn(0,-1,0);return this.nodes.push(n),n}addBlock(e){this.enterLine();let n=e.deco;n&&n.startSide>0&&!this.isCovered&&this.ensureLine(),this.nodes.push(e),this.writtenTo=this.pos=this.pos+e.length,n&&n.endSide>0&&(this.covering=e)}addLineDeco(e,n,r){let o=this.ensureLine();o.length+=r,o.collapsed+=r,o.widgetHeight=Math.max(o.widgetHeight,e),o.breaks+=n,this.writtenTo=this.pos=this.pos+r}finish(e){let n=this.nodes.length==0?null:this.nodes[this.nodes.length-1];this.lineStart>-1&&!(n instanceof yn)&&!this.isCovered?this.nodes.push(new yn(0,-1,0)):(this.writtenTo<this.pos||n==null)&&this.nodes.push(this.blankContent(this.writtenTo,this.pos));let r=e;for(let o of this.nodes)o instanceof yn&&o.updateHeight(this.oracle,r),r+=o?o.length:1;return this.nodes}static build(e,n,r,o){let a=new t(r,e);return se.spans(n,r,o,a,0),a.finish(r)}};hg=class{constructor(){this.changes=[]}compareRange(){}comparePoint(e,n,r,o){(e<n||r&&r.heightRelevant||o&&o.heightRelevant)&&Hi(e,n,this.changes,5)}};Us=class{constructor(e,n,r,o){this.from=e,this.to=n,this.size=r,this.displaySize=o}static same(e,n){if(e.length!=n.length)return!1;for(let r=0;r<e.length;r++){let o=e[r],a=n[r];if(o.from!=a.from||o.to!=a.to||o.size!=a.size)return!1}return!0}draw(e,n){return W.replace({widget:new xg(this.displaySize*(n?e.scaleY:e.scaleX),n)}).range(this.from,this.to)}},xg=class extends Or{constructor(e,n){super(),this.size=e,this.vertical=n}eq(e){return e.size==this.size&&e.vertical==this.vertical}toDOM(){let e=document.createElement("div");return this.vertical?e.style.height=this.size+"px":(e.style.width=this.size+"px",e.style.height="2px",e.style.display="inline-block"),e}get estimatedHeight(){return this.vertical?this.size:-1}},Xu=class{constructor(e,n){this.view=e,this.state=n,this.pixelViewport={left:0,right:window.innerWidth,top:0,bottom:0},this.inView=!0,this.paddingTop=0,this.paddingBottom=0,this.contentDOMWidth=0,this.contentDOMHeight=0,this.editorHeight=0,this.editorWidth=0,this.scaleX=1,this.scaleY=1,this.scrollOffset=0,this.scrolledToBottom=!1,this.scrollAnchorPos=0,this.scrollAnchorHeight=-1,this.scaler=gg,this.scrollTarget=null,this.printing=!1,this.mustMeasureContent=!0,this.defaultTextDirection=me.LTR,this.visibleRanges=[],this.mustEnforceCursorAssoc=!1;let r=n.facet(Lg).some(o=>typeof o!="function"&&o.class=="cm-lineWrapping");this.heightOracle=new ug(r),this.stateDeco=Ik(n),this.heightMap=Yt.empty().applyChanges(this.stateDeco,te.empty,this.heightOracle.setDoc(n.doc),[new Bn(0,0,0,n.doc.length)]);for(let o=0;o<2&&(this.viewport=this.getViewport(0,null),!!this.updateForViewport());o++);this.updateViewportLines(),this.lineGaps=this.ensureLineGaps([]),this.lineGapDeco=W.set(this.lineGaps.map(o=>o.draw(this,!1))),this.scrollParent=e.scrollDOM,this.computeVisibleRanges()}updateForViewport(){let e=[this.viewport],{main:n}=this.state.selection;for(let r=0;r<=1;r++){let o=r?n.head:n.anchor;if(!e.some(({from:a,to:i})=>o>=a&&o<=i)){let{from:a,to:i}=this.lineBlockAt(o);e.push(new Pi(a,i))}}return this.viewports=e.sort((r,o)=>r.from-o.from),this.updateScaler()}updateScaler(){let e=this.scaler;return this.scaler=this.heightMap.height<=7e6?gg:yg.get(this.heightOracle,this.heightMap,this.viewports),e.eq(this.scaler)?0:2}updateViewportLines(){this.viewportLines=[],this.heightMap.forEachLine(this.viewport.from,this.viewport.to,this.heightOracle.setDoc(this.state.doc),0,0,e=>{this.viewportLines.push(Fs(e,this.scaler))})}update(e,n=null){this.state=e.state;let r=this.stateDeco;this.stateDeco=Ik(this.state);let o=e.changedRanges,a=Bn.extendWithRanges(o,bF(r,this.stateDeco,e?e.changes:bt.empty(this.state.doc.length))),i=this.heightMap.height,l=this.scrolledToBottom?null:this.scrollAnchorAt(this.scrollOffset);yk(),this.heightMap=this.heightMap.applyChanges(this.stateDeco,e.startState.doc,this.heightOracle.setDoc(this.state.doc),a),(this.heightMap.height!=i||Ki)&&(e.flags|=2),l?(this.scrollAnchorPos=e.changes.mapPos(l.from,-1),this.scrollAnchorHeight=l.top):(this.scrollAnchorPos=-1,this.scrollAnchorHeight=i);let s=a.length?this.mapViewport(this.viewport,e.changes):this.viewport;(n&&(n.range.head<s.from||n.range.head>s.to)||!this.viewportIsAppropriate(s))&&(s=this.getViewport(0,n));let f=s.from!=this.viewport.from||s.to!=this.viewport.to;this.viewport=s,e.flags|=this.updateForViewport(),(f||!e.changes.empty||e.flags&2)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps,e.changes))),e.flags|=this.computeVisibleRanges(e.changes),n&&(this.scrollTarget=n),!this.mustEnforceCursorAssoc&&(e.selectionSet||e.focusChanged)&&e.view.lineWrapping&&e.state.selection.main.empty&&e.state.selection.main.assoc&&!e.state.facet(DE)&&(this.mustEnforceCursorAssoc=!0)}measure(){let{view:e}=this,n=e.contentDOM,r=window.getComputedStyle(n),o=this.heightOracle,a=r.whiteSpace;this.defaultTextDirection=r.direction=="rtl"?me.RTL:me.LTR;let i=this.heightOracle.mustRefreshForWrapping(a)||this.mustMeasureContent==="refresh",l=n.getBoundingClientRect(),s=i||this.mustMeasureContent||this.contentDOMHeight!=l.height;this.contentDOMHeight=l.height,this.mustMeasureContent=!1;let f=0,c=0;if(l.width&&l.height){let{scaleX:v,scaleY:S}=Ek(n,l);(v>.005&&Math.abs(this.scaleX-v)>.005||S>.005&&Math.abs(this.scaleY-S)>.005)&&(this.scaleX=v,this.scaleY=S,f|=16,i=s=!0)}let d=(parseInt(r.paddingTop)||0)*this.scaleY,u=(parseInt(r.paddingBottom)||0)*this.scaleY;(this.paddingTop!=d||this.paddingBottom!=u)&&(this.paddingTop=d,this.paddingBottom=u,f|=18),this.editorWidth!=e.scrollDOM.clientWidth&&(o.lineWrapping&&(s=!0),this.editorWidth=e.scrollDOM.clientWidth,f|=16);let p=Fk(this.view.contentDOM,!1).y;p!=this.scrollParent&&(this.scrollParent=p,this.scrollAnchorHeight=-1,this.scrollOffset=0);let m=this.getScrollOffset();this.scrollOffset!=m&&(this.scrollAnchorHeight=-1,this.scrollOffset=m),this.scrolledToBottom=_k(this.scrollParent||e.win);let x=(this.printing?wF:IF)(n,this.paddingTop),b=x.top-this.pixelViewport.top,h=x.bottom-this.pixelViewport.bottom;this.pixelViewport=x;let y=this.pixelViewport.bottom>this.pixelViewport.top&&this.pixelViewport.right>this.pixelViewport.left;if(y!=this.inView&&(this.inView=y,y&&(s=!0)),!this.inView&&!this.scrollTarget&&!vF(e.dom))return 0;let g=l.width;if((this.contentDOMWidth!=g||this.editorHeight!=e.scrollDOM.clientHeight)&&(this.contentDOMWidth=l.width,this.editorHeight=e.scrollDOM.clientHeight,f|=16),s){let v=e.docView.measureVisibleLineHeights(this.viewport);if(o.mustRefreshForHeights(v)&&(i=!0),i||o.lineWrapping&&Math.abs(g-this.contentDOMWidth)>o.charWidth){let{lineHeight:S,charWidth:w,textHeight:k}=e.docView.measureTextSize();i=S>0&&o.refresh(a,S,w,k,Math.max(5,g/w),v),i&&(e.docView.minWidth=0,f|=16)}b>0&&h>0?c=Math.max(b,h):b<0&&h<0&&(c=Math.min(b,h)),yk();for(let S of this.viewports){let w=S.from==this.viewport.from?v:e.docView.measureVisibleLineHeights(S);this.heightMap=(i?Yt.empty().applyChanges(this.stateDeco,te.empty,this.heightOracle,[new Bn(0,0,0,e.state.doc.length)]):this.heightMap).updateHeight(o,0,i,new dg(S.from,w))}Ki&&(f|=2)}let I=!this.viewportIsAppropriate(this.viewport,c)||this.scrollTarget&&(this.scrollTarget.range.head<this.viewport.from||this.scrollTarget.range.head>this.viewport.to);return I&&(f&2&&(f|=this.updateScaler()),this.viewport=this.getViewport(c,this.scrollTarget),f|=this.updateForViewport()),(f&2||I)&&this.updateViewportLines(),(this.lineGaps.length||this.viewport.to-this.viewport.from>4e3)&&this.updateLineGaps(this.ensureLineGaps(i?[]:this.lineGaps,e)),f|=this.computeVisibleRanges(),this.mustEnforceCursorAssoc&&(this.mustEnforceCursorAssoc=!1,e.docView.enforceCursorAssoc()),f}get visibleTop(){return this.scaler.fromDOM(this.pixelViewport.top)}get visibleBottom(){return this.scaler.fromDOM(this.pixelViewport.bottom)}getViewport(e,n){let r=.5-Math.max(-.5,Math.min(.5,e/1e3/2)),o=this.heightMap,a=this.heightOracle,{visibleTop:i,visibleBottom:l}=this,s=new Pi(o.lineAt(i-r*1e3,ye.ByHeight,a,0,0).from,o.lineAt(l+(1-r)*1e3,ye.ByHeight,a,0,0).to);if(n){let{head:f}=n.range;if(f<s.from||f>s.to){let c=Math.min(this.editorHeight,this.pixelViewport.bottom-this.pixelViewport.top),d=o.lineAt(f,ye.ByPos,a,0,0),u;n.y=="center"?u=(d.top+d.bottom)/2-c/2:n.y=="start"||n.y=="nearest"&&f<s.from?u=d.top:u=d.bottom-c,s=new Pi(o.lineAt(u-1e3/2,ye.ByHeight,a,0,0).from,o.lineAt(u+c+1e3/2,ye.ByHeight,a,0,0).to)}}return s}mapViewport(e,n){let r=n.mapPos(e.from,-1),o=n.mapPos(e.to,1);return new Pi(this.heightMap.lineAt(r,ye.ByPos,this.heightOracle,0,0).from,this.heightMap.lineAt(o,ye.ByPos,this.heightOracle,0,0).to)}viewportIsAppropriate({from:e,to:n},r=0){if(!this.inView)return!0;let{top:o}=this.heightMap.lineAt(e,ye.ByPos,this.heightOracle,0,0),{bottom:a}=this.heightMap.lineAt(n,ye.ByPos,this.heightOracle,0,0),{visibleTop:i,visibleBottom:l}=this;return(e==0||o<=i-Math.max(10,Math.min(-r,250)))&&(n==this.state.doc.length||a>=l+Math.max(10,Math.min(r,250)))&&o>i-2*1e3&&a<l+2*1e3}mapLineGaps(e,n){if(!e.length||n.empty)return e;let r=[];for(let o of e)n.touchesRange(o.from,o.to)||r.push(new Us(n.mapPos(o.from),n.mapPos(o.to),o.size,o.displaySize));return r}ensureLineGaps(e,n){let r=this.heightOracle.lineWrapping,o=r?1e4:2e3,a=o>>1,i=o<<1;if(this.defaultTextDirection!=me.LTR&&!r)return[];let l=[],s=(c,d,u,p)=>{if(d-c<a)return;let m=this.state.selection.main,x=[m.from];m.empty||x.push(m.to);for(let h of x)if(h>c&&h<d){s(c,h-10,u,p),s(h+10,d,u,p);return}let b=kF(e,h=>h.from>=u.from&&h.to<=u.to&&Math.abs(h.from-c)<a&&Math.abs(h.to-d)<a&&!x.some(y=>h.from<y&&h.to>y));if(!b){if(d<u.to&&n&&r&&n.visibleRanges.some(g=>g.from<=d&&g.to>=d)){let g=n.moveToLineBoundary(O.cursor(d),!1,!0).head;g>c&&(d=g)}let h=this.gapSize(u,c,d,p),y=r||h<2e6?h:2e6;b=new Us(c,d,h,y)}l.push(b)},f=c=>{if(c.length<i||c.type!=Et.Text)return;let d=SF(c.from,c.to,this.stateDeco);if(d.total<i)return;let u=this.scrollTarget?this.scrollTarget.range.head:null,p,m;if(r){let x=o/this.heightOracle.lineLength*this.heightOracle.lineHeight,b,h;if(u!=null){let y=Bu(d,u),g=((this.visibleBottom-this.visibleTop)/2+x)/c.height;b=y-g,h=y+g}else b=(this.visibleTop-c.top-x)/c.height,h=(this.visibleBottom-c.top+x)/c.height;p=Ou(d,b),m=Ou(d,h)}else{let x=d.total*this.heightOracle.charWidth,b=o*this.heightOracle.charWidth,h=0;if(x>2e6)for(let S of e)S.from>=c.from&&S.from<c.to&&S.size!=S.displaySize&&S.from*this.heightOracle.charWidth+h<this.pixelViewport.left&&(h=S.size-S.displaySize);let y=this.pixelViewport.left+h,g=this.pixelViewport.right+h,I,v;if(u!=null){let S=Bu(d,u),w=((g-y)/2+b)/x;I=S-w,v=S+w}else I=(y-b)/x,v=(g+b)/x;p=Ou(d,I),m=Ou(d,v)}p>c.from&&s(c.from,p,c,d),m<c.to&&s(m,c.to,c,d)};for(let c of this.viewportLines)Array.isArray(c.type)?c.type.forEach(f):f(c);return l}gapSize(e,n,r,o){let a=Bu(o,r)-Bu(o,n);return this.heightOracle.lineWrapping?e.height*a:o.total*this.heightOracle.charWidth*a}updateLineGaps(e){Us.same(e,this.lineGaps)||(this.lineGaps=e,this.lineGapDeco=W.set(e.map(n=>n.draw(this,this.heightOracle.lineWrapping))))}computeVisibleRanges(e){let n=this.stateDeco;this.lineGaps.length&&(n=n.concat(this.lineGapDeco));let r=[];se.spans(n,this.viewport.from,this.viewport.to,{span(a,i){r.push({from:a,to:i})},point(){}},20);let o=0;if(r.length!=this.visibleRanges.length)o=12;else for(let a=0;a<r.length&&!(o&8);a++){let i=this.visibleRanges[a],l=r[a];(i.from!=l.from||i.to!=l.to)&&(o|=4,e&&e.mapPos(i.from,-1)==l.from&&e.mapPos(i.to,1)==l.to||(o|=8))}return this.visibleRanges=r,o}lineBlockAt(e){return e>=this.viewport.from&&e<=this.viewport.to&&this.viewportLines.find(n=>n.from<=e&&n.to>=e)||Fs(this.heightMap.lineAt(e,ye.ByPos,this.heightOracle,0,0),this.scaler)}lineBlockAtHeight(e){return e>=this.viewportLines[0].top&&e<=this.viewportLines[this.viewportLines.length-1].bottom&&this.viewportLines.find(n=>n.top<=e&&n.bottom>=e)||Fs(this.heightMap.lineAt(this.scaler.fromDOM(e),ye.ByHeight,this.heightOracle,0,0),this.scaler)}getScrollOffset(){return this.scrollParent==this.view.scrollDOM?this.scrollParent.scrollTop*this.scaleY:(this.scrollParent?this.scrollParent.getBoundingClientRect().top:0)-this.view.contentDOM.getBoundingClientRect().top}scrollAnchorAt(e){let n=this.lineBlockAtHeight(e+12-this.paddingTop);return n.from>=this.viewport.from||this.viewportLines[0].top-e>200?n:this.viewportLines[0]}elementAtHeight(e){return Fs(this.heightMap.blockAt(this.scaler.fromDOM(e),this.heightOracle,0,0),this.scaler)}get docHeight(){return this.scaler.toDOM(this.heightMap.height)}get contentHeight(){return this.docHeight+this.paddingTop+this.paddingBottom}},Pi=class{constructor(e,n){this.from=e,this.to=n}};gg={toDOM(t){return t},fromDOM(t){return t},scale:1,eq(t){return t==this}};yg=class t{constructor(e,n){this.scale=e,this.viewports=n}static get(e,n,r){let o=0,a=0,i=0,l=r.map(({from:f,to:c})=>{let d=n.lineAt(f,ye.ByPos,e,0,0).top,u=n.lineAt(c,ye.ByPos,e,0,0).bottom;return o+=u-d,{from:f,to:c,top:d,bottom:u,domTop:0,domBottom:0}});if(n.height-o<10)return gg;let s=(7e6-o)/(n.height-o);for(let f of l)f.domTop=i+(f.top-a)*s,i=f.domBottom=f.domTop+(f.bottom-f.top),a=f.bottom;return new t(s,l)}toDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.top)return o+(e-r)*this.scale;if(e<=a.bottom)return a.domTop+(e-a.top);r=a.bottom,o=a.domBottom}}fromDOM(e){for(let n=0,r=0,o=0;;n++){let a=n<this.viewports.length?this.viewports[n]:null;if(!a||e<a.domTop)return r+(e-o)/this.scale;if(e<=a.domBottom)return a.top+(e-a.domTop);r=a.bottom,o=a.domBottom}}eq(e){return e instanceof t?this.scale==e.scale&&this.viewports.length==e.viewports.length&&this.viewports.every((n,r)=>n.from==e.viewports[r].from&&n.to==e.viewports[r].to):!1}};Ru=z.define({combine:t=>t.join(" ")}),bg=z.define({combine:t=>t.indexOf(!0)>-1}),Ig=gn.newName(),IC=gn.newName(),vC=gn.newName(),wC={"&light":"."+IC,"&dark":"."+vC};CF=vg("."+Ig,{"&":{position:"relative !important",boxSizing:"border-box","&.cm-focused":{outline:"1px dotted #212121"},display:"flex !important",flexDirection:"column"},".cm-scroller":{display:"flex !important",alignItems:"flex-start !important",fontFamily:"monospace",lineHeight:1.4,height:"100%",overflowX:"auto",position:"relative",zIndex:0,overflowAnchor:"none"},".cm-content":{margin:0,flexGrow:2,flexShrink:0,display:"block",whiteSpace:"pre",wordWrap:"normal",boxSizing:"border-box",minHeight:"100%",padding:"4px 0",outline:"none","&[contenteditable=true]":{WebkitUserModify:"read-write-plaintext-only"}},".cm-lineWrapping":{whiteSpace_fallback:"pre-wrap",whiteSpace:"break-spaces",wordBreak:"break-word",overflowWrap:"anywhere",flexShrink:1},"&light .cm-content":{caretColor:"black"},"&dark .cm-content":{caretColor:"white"},".cm-line":{display:"block",padding:"0 2px 0 6px"},".cm-layer":{userSelect:"none",position:"absolute",left:0,top:0,contain:"size style","& > *":{position:"absolute"}},"&light .cm-selectionBackground":{background:"#d9d9d9"},"&dark .cm-selectionBackground":{background:"#222"},"&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#d7d4f0"},"&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":{background:"#233"},".cm-cursorLayer":{pointerEvents:"none"},"&.cm-focused > .cm-scroller > .cm-cursorLayer":{animation:"steps(1) cm-blink 1.2s infinite"},"@keyframes cm-blink":{"0%":{},"50%":{opacity:0},"100%":{}},"@keyframes cm-blink2":{"0%":{},"50%":{opacity:0},"100%":{}},".cm-cursor, .cm-dropCursor":{borderLeft:"1.2px solid black",marginLeft:"-0.6px",pointerEvents:"none"},".cm-cursor":{display:"none"},"&dark .cm-cursor":{borderLeftColor:"#ddd"},".cm-selectionHandle":{backgroundColor:"currentColor",width:"1.5px"},".cm-selectionHandle-start::before, .cm-selectionHandle-end::before":{content:'""',backgroundColor:"inherit",borderRadius:"50%",width:"8px",height:"8px",position:"absolute",left:"-3.25px"},".cm-selectionHandle-start::before":{top:"-8px"},".cm-selectionHandle-end::before":{bottom:"-8px"},".cm-dropCursor":{position:"absolute"},"&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor":{display:"block"},".cm-iso":{unicodeBidi:"isolate"},".cm-announced":{position:"fixed",top:"-10000px"},"@media print":{".cm-announced":{display:"none"}},"&light .cm-activeLine":{backgroundColor:"#cceeff44"},"&dark .cm-activeLine":{backgroundColor:"#99eeff33"},"&light .cm-specialChar":{color:"red"},"&dark .cm-specialChar":{color:"#f78"},".cm-gutters":{flexShrink:0,display:"flex",height:"100%",boxSizing:"border-box",zIndex:200},".cm-gutters-before":{insetInlineStart:0},".cm-gutters-after":{insetInlineEnd:0},"&light .cm-gutters":{backgroundColor:"#f5f5f5",color:"#6c6c6c",border:"0px solid #ddd","&.cm-gutters-before":{borderRightWidth:"1px"},"&.cm-gutters-after":{borderLeftWidth:"1px"}},"&dark .cm-gutters":{backgroundColor:"#333338",color:"#ccc"},".cm-gutter":{display:"flex !important",flexDirection:"column",flexShrink:0,boxSizing:"border-box",minHeight:"100%",overflow:"hidden"},".cm-gutterElement":{boxSizing:"border-box"},".cm-lineNumbers .cm-gutterElement":{padding:"0 3px 0 5px",minWidth:"20px",textAlign:"right",whiteSpace:"nowrap"},"&light .cm-activeLineGutter":{backgroundColor:"#e2f2ff"},"&dark .cm-activeLineGutter":{backgroundColor:"#222227"},".cm-panels":{boxSizing:"border-box",position:"sticky",left:0,right:0,zIndex:300},"&light .cm-panels":{backgroundColor:"#f5f5f5",color:"black"},".cm-panels-top":{top:"0"},".cm-panels-bottom":{bottom:"0"},"&light .cm-panels-top":{borderBottom:"1px solid #ddd"},"&light .cm-panels-bottom":{borderTop:"1px solid #ddd"},"&dark .cm-panels":{backgroundColor:"#333338",color:"white"},".cm-dialog":{padding:"2px 19px 4px 6px",position:"relative","& label":{fontSize:"80%"}},".cm-dialog-close":{position:"absolute",top:"3px",right:"4px",backgroundColor:"inherit",border:"none",font:"inherit",fontSize:"14px",padding:"0"},".cm-tab":{display:"inline-block",overflow:"hidden",verticalAlign:"bottom"},".cm-widgetBuffer":{verticalAlign:"baseline",height:"1em",width:0,display:"inline"},".cm-placeholder":{color:"#888",display:"inline-block",verticalAlign:"top",userSelect:"none"},".cm-highlightSpace":{background:"radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",backgroundSize:".4em",backgroundPosition:"calc(min(50%, 0px)) center"},".cm-highlightTab":{backgroundImage:`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,backgroundSize:"auto 100%",backgroundPosition:"right 90%",backgroundRepeat:"no-repeat"},".cm-trailingSpace":{backgroundColor:"#ff332255"},".cm-button":{verticalAlign:"middle",color:"inherit",fontSize:"70%",padding:".2em 1em",borderRadius:"1px"},"&light .cm-button":{backgroundImage:"linear-gradient(#eff1f5, #d9d9df)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#b4b4b4, #d0d3d6)"}},"&dark .cm-button":{backgroundImage:"linear-gradient(#393939, #111)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#111, #333)"}},".cm-textfield":{verticalAlign:"middle",color:"inherit",fontSize:"70%",border:"1px solid silver",padding:".2em .5em"},"&light .cm-textfield":{backgroundColor:"white"},"&dark .cm-textfield":{border:"1px solid #555",backgroundColor:"inherit"}},wC),AF={childList:!0,characterData:!0,subtree:!0,attributes:!0,characterDataOldValue:!0},Lx=q.ie&&q.ie_version<=11,wg=class{constructor(e){this.view=e,this.active=!1,this.editContext=null,this.selectionRange=new Vx,this.selectionChanged=!1,this.delayedFlush=-1,this.resizeTimeout=-1,this.queue=[],this.delayedAndroidKey=null,this.flushingAndroidKey=-1,this.lastChange=0,this.scrollTargets=[],this.intersection=null,this.resizeScroll=null,this.intersecting=!1,this.gapIntersection=null,this.gaps=[],this.printQuery=null,this.parentCheck=-1,this.dom=e.contentDOM,this.observer=new MutationObserver(n=>{for(let r of n)this.queue.push(r);(q.ie&&q.ie_version<=11||q.ios&&e.composing)&&n.some(r=>r.type=="childList"&&r.removedNodes.length||r.type=="characterData"&&r.oldValue.length>r.target.nodeValue.length)?this.flushSoon():this.flush()}),window.EditContext&&q.android&&e.constructor.EDIT_CONTEXT!==!1&&!(q.chrome&&q.chrome_version<126)&&(this.editContext=new Sg(e),e.state.facet(Mr)&&(e.contentDOM.editContext=this.editContext.editContext)),Lx&&(this.onCharData=n=>{this.queue.push({target:n.target,type:"characterData",oldValue:n.prevValue}),this.flushSoon()}),this.onSelectionChange=this.onSelectionChange.bind(this),this.onResize=this.onResize.bind(this),this.onPrint=this.onPrint.bind(this),this.onScroll=this.onScroll.bind(this),window.matchMedia&&(this.printQuery=window.matchMedia("print")),typeof ResizeObserver=="function"&&(this.resizeScroll=new ResizeObserver(()=>{var n;((n=this.view.docView)===null||n===void 0?void 0:n.lastUpdate)<Date.now()-75&&this.onResize()}),this.resizeScroll.observe(e.scrollDOM)),this.addWindowListeners(this.win=e.win),this.start(),typeof IntersectionObserver=="function"&&(this.intersection=new IntersectionObserver(n=>{this.parentCheck<0&&(this.parentCheck=setTimeout(this.listenForScroll.bind(this),1e3)),n.length>0&&n[n.length-1].intersectionRatio>0!=this.intersecting&&(this.intersecting=!this.intersecting,this.intersecting!=this.view.inView&&this.onScrollChanged(document.createEvent("Event")))},{threshold:[0,.001]}),this.intersection.observe(this.dom),this.gapIntersection=new IntersectionObserver(n=>{n.length>0&&n[n.length-1].intersectionRatio>0&&this.onScrollChanged(document.createEvent("Event"))},{})),this.listenForScroll(),this.readSelectionRange()}onScrollChanged(e){this.view.inputState.runHandlers("scroll",e),this.intersecting&&this.view.measure()}onScroll(e){this.intersecting&&this.flush(this.pendingRecords().length>0),this.editContext&&this.view.requestMeasure(this.editContext.measureReq),this.onScrollChanged(e)}onResize(){this.resizeTimeout<0&&(this.resizeTimeout=setTimeout(()=>{this.resizeTimeout=-1,this.view.requestMeasure()},50))}onPrint(e){(e.type=="change"||!e.type)&&!e.matches||(this.view.viewState.printing=!0,this.view.measure(),setTimeout(()=>{this.view.viewState.printing=!1,this.view.requestMeasure()},500))}updateGaps(e){if(this.gapIntersection&&(e.length!=this.gaps.length||this.gaps.some((n,r)=>n!=e[r]))){this.gapIntersection.disconnect();for(let n of e)this.gapIntersection.observe(n);this.gaps=e}}onSelectionChange(e){let n=this.selectionChanged;if(!this.readSelectionRange()||this.delayedAndroidKey)return;let{view:r}=this,o=this.selectionRange;if(r.state.facet(Mr)?r.root.activeElement!=this.dom:!Ls(this.dom,o))return;let a=o.anchorNode&&r.docView.tile.nearest(o.anchorNode);if(a&&a.isWidget()&&a.widget.ignoreEvent(e)){n||(this.selectionChanged=!1);return}(q.ie&&q.ie_version<=11||q.android&&q.chrome)&&!r.state.selection.main.empty&&o.focusNode&&qs(o.focusNode,o.focusOffset,o.anchorNode,o.anchorOffset)?this.flushSoon():this.flush(!1)}readSelectionRange(){let{view:e}=this,n=Xs(e.root);if(!n)return!1;let r=q.safari&&e.root.nodeType==11&&e.root.activeElement==this.dom&&TF(this.view,n)||n;if(!r||this.selectionRange.eq(r))return!1;let o=Ls(this.dom,r);return o&&!this.selectionChanged&&e.inputState.lastFocusTime>Date.now()-200&&e.inputState.lastTouchTime<Date.now()-300&&bE(this.dom,r)?(this.view.inputState.lastFocusTime=0,e.docView.updateSelection(),!1):(this.selectionRange.setRange(r),o&&(this.selectionChanged=!0),!0)}setSelectionRange(e,n){this.selectionRange.set(e.node,e.offset,n.node,n.offset),this.selectionChanged=!1}clearSelectionRange(){this.selectionRange.set(null,0,null,0)}listenForScroll(){this.parentCheck=-1;let e=0,n=null;for(let r=this.dom;r;)if($e(r))!n&&e<this.scrollTargets.length&&this.scrollTargets[e]==r?e++:n||(n=this.scrollTargets.slice(0,e)),n&&n.push(r),r=r.assignedSlot||r.parentNode;else if(r.nodeType==11)r=r.host;else break;if(e<this.scrollTargets.length&&!n&&(n=this.scrollTargets.slice(0,e)),n){for(let r of this.scrollTargets)r.removeEventListener("scroll",this.onScroll);for(let r of this.scrollTargets=n)r.addEventListener("scroll",this.onScroll)}}ignore(e){if(!this.active)return e();try{return this.stop(),e()}finally{this.start(),this.clear()}}start(){this.active||(this.observer.observe(this.dom,AF),Lx&&this.dom.addEventListener("DOMCharacterDataModified",this.onCharData),this.active=!0)}stop(){this.active&&(this.active=!1,this.observer.disconnect(),Lx&&this.dom.removeEventListener("DOMCharacterDataModified",this.onCharData))}clear(){this.processRecords(),this.queue.length=0,this.selectionChanged=!1}delayAndroidKey(e,n){var r;if(!this.delayedAndroidKey){let o=()=>{let a=this.delayedAndroidKey;a&&(this.clearDelayedAndroidKey(),this.view.inputState.lastKeyCode=a.keyCode,this.view.inputState.lastKeyTime=Date.now(),!this.flush()&&a.force&&Ui(this.dom,a.key,a.keyCode))};this.flushingAndroidKey=this.view.win.requestAnimationFrame(o)}(!this.delayedAndroidKey||e=="Enter")&&(this.delayedAndroidKey={key:e,keyCode:n,force:this.lastChange<Date.now()-50||!!(!((r=this.delayedAndroidKey)===null||r===void 0)&&r.force)})}clearDelayedAndroidKey(){this.win.cancelAnimationFrame(this.flushingAndroidKey),this.delayedAndroidKey=null,this.flushingAndroidKey=-1}flushSoon(){this.delayedFlush<0&&(this.delayedFlush=this.view.win.requestAnimationFrame(()=>{this.delayedFlush=-1,this.flush()}))}forceFlush(){this.delayedFlush>=0&&(this.view.win.cancelAnimationFrame(this.delayedFlush),this.delayedFlush=-1),this.flush()}pendingRecords(){for(let e of this.observer.takeRecords())this.queue.push(e);return this.queue}processRecords(){let e=this.pendingRecords();e.length&&(this.queue=[]);let n=-1,r=-1,o=!1;for(let a of e){let i=this.readMutation(a);i&&(i.typeOver&&(o=!0),n==-1?{from:n,to:r}=i:(n=Math.min(i.from,n),r=Math.max(i.to,r)))}return{from:n,to:r,typeOver:o}}readChange(){let{from:e,to:n,typeOver:r}=this.processRecords(),o=this.selectionChanged&&Ls(this.dom,this.selectionRange);if(e<0&&!o)return null;e>-1&&(this.lastChange=Date.now()),this.view.inputState.lastFocusTime=0,this.selectionChanged=!1;let a=new ig(this.view,e,n,r);return this.view.docView.domChanged={newSel:a.newSel?a.newSel.main:null},a}flush(e=!0){if(this.delayedFlush>=0||this.delayedAndroidKey)return!1;e&&this.readSelectionRange();let n=this.selectionChanged,r=this.readChange();if(!r)return this.view.requestMeasure(),!1;let o=this.view.state,a=cC(this.view,r);return this.view.state==o&&(r.domChanged||n)&&this.view.update([]),a}readMutation(e){let n=this.view.docView.tile.nearest(e.target);if(!n||n.isWidget())return null;if(n.markDirty(e.type=="attributes"),e.type=="childList"){let r=vk(n,e.previousSibling||e.target.previousSibling,-1),o=vk(n,e.nextSibling||e.target.nextSibling,1);return{from:r?n.posAfter(r):n.posAtStart,to:o?n.posBefore(o):n.posAtEnd,typeOver:!1}}else return e.type=="characterData"?{from:n.posAtStart,to:n.posAtEnd,typeOver:e.target.nodeValue==e.oldValue}:null}setWindow(e){e!=this.win&&(this.removeWindowListeners(this.win),this.win=e,this.addWindowListeners(this.win))}addWindowListeners(e){e.addEventListener("resize",this.onResize),this.printQuery?this.printQuery.addEventListener?this.printQuery.addEventListener("change",this.onPrint):this.printQuery.addListener(this.onPrint):e.addEventListener("beforeprint",this.onPrint),e.addEventListener("scroll",this.onScroll),e.document.addEventListener("selectionchange",this.onSelectionChange)}removeWindowListeners(e){e.removeEventListener("scroll",this.onScroll),e.removeEventListener("resize",this.onResize),this.printQuery?this.printQuery.removeEventListener?this.printQuery.removeEventListener("change",this.onPrint):this.printQuery.removeListener(this.onPrint):e.removeEventListener("beforeprint",this.onPrint),e.document.removeEventListener("selectionchange",this.onSelectionChange)}update(e){this.editContext&&(this.editContext.update(e),e.startState.facet(Mr)!=e.state.facet(Mr)&&(e.view.contentDOM.editContext=e.state.facet(Mr)?this.editContext.editContext:null))}destroy(){var e,n,r;this.stop(),(e=this.intersection)===null||e===void 0||e.disconnect(),(n=this.gapIntersection)===null||n===void 0||n.disconnect(),(r=this.resizeScroll)===null||r===void 0||r.disconnect();for(let o of this.scrollTargets)o.removeEventListener("scroll",this.onScroll);this.removeWindowListeners(this.win),clearTimeout(this.parentCheck),clearTimeout(this.resizeTimeout),this.win.cancelAnimationFrame(this.delayedFlush),this.win.cancelAnimationFrame(this.flushingAndroidKey),this.editContext&&(this.view.contentDOM.editContext=null,this.editContext.destroy())}};Sg=class{constructor(e){this.from=0,this.to=0,this.pendingContextChange=null,this.handlers=Object.create(null),this.composing=null,this.resetRange(e.state);let n=this.editContext=new window.EditContext({text:e.state.doc.sliceString(this.from,this.to),selectionStart:this.toContextPos(Math.max(this.from,Math.min(this.to,e.state.selection.main.anchor))),selectionEnd:this.toContextPos(e.state.selection.main.head)});this.handlers.textupdate=r=>{let o=e.state.selection.main,{anchor:a,head:i}=o,l=this.toEditorPos(r.updateRangeStart),s=this.toEditorPos(r.updateRangeEnd);e.inputState.composing>=0&&!this.composing&&(this.composing={contextBase:r.updateRangeStart,editorBase:l,drifted:!1});let f=s-l>r.text.length;l==this.from&&a<this.from?l=a:s==this.to&&a>this.to&&(s=a);let c=uC(e.state.sliceDoc(l,s),r.text,(f?o.from:o.to)-l,f?"end":null);if(!c){let u=O.single(this.toEditorPos(r.selectionStart),this.toEditorPos(r.selectionEnd));lg(u,o)||e.dispatch({selection:u,userEvent:"select"});return}let d={from:c.from+l,to:c.toA+l,insert:te.of(r.text.slice(c.from,c.toB).split(`
`))};if((q.mac||q.android)&&d.from==i-1&&/^\. ?$/.test(r.text)&&e.contentDOM.getAttribute("autocorrect")=="off"&&(d={from:l,to:s,insert:te.of([r.text.replace("."," ")])}),this.pendingContextChange=d,!e.state.readOnly){let u=this.to-this.from+(d.to-d.from+d.insert.length);_g(e,d,O.single(this.toEditorPos(r.selectionStart,u),this.toEditorPos(r.selectionEnd,u)))}this.pendingContextChange&&(this.revertPending(e.state),this.setSelection(e.state)),d.from<d.to&&!d.insert.length&&e.inputState.composing>=0&&!/[\\p{Alphabetic}\\p{Number}_]/.test(n.text.slice(Math.max(0,r.updateRangeStart-1),Math.min(n.text.length,r.updateRangeStart+1)))&&this.handlers.compositionend(r)},this.handlers.characterboundsupdate=r=>{let o=[],a=null;for(let i=this.toEditorPos(r.rangeStart),l=this.toEditorPos(r.rangeEnd);i<l;i++){let s=e.coordsForChar(i);a=s&&new DOMRect(s.left,s.top,s.right-s.left,s.bottom-s.top)||a||new DOMRect,o.push(a)}n.updateCharacterBounds(r.rangeStart,o)},this.handlers.textformatupdate=r=>{let o=[];for(let a of r.getTextFormats()){let i=a.underlineStyle,l=a.underlineThickness;if(!/none/i.test(i)&&!/none/i.test(l)){let s=this.toEditorPos(a.rangeStart),f=this.toEditorPos(a.rangeEnd);if(s<f){let c=`text-decoration: underline ${/^[a-z]/.test(i)?i+" ":i=="Dashed"?"dashed ":i=="Squiggle"?"wavy ":""}${/thin/i.test(l)?1:2}px`;o.push(W.mark({attributes:{style:c}}).range(s,f))}}}e.dispatch({effects:eC.of(W.set(o))})},this.handlers.compositionstart=()=>{e.inputState.composing<0&&(e.inputState.composing=0,e.inputState.compositionFirstChange=!0)},this.handlers.compositionend=()=>{if(e.inputState.composing=-1,e.inputState.compositionFirstChange=null,this.composing){let{drifted:r}=this.composing;this.composing=null,r&&this.reset(e.state)}};for(let r in this.handlers)n.addEventListener(r,this.handlers[r]);this.measureReq={read:r=>{let o=Xs(r.root);o&&o.rangeCount&&this.editContext.updateSelectionBounds(o.getRangeAt(0).getBoundingClientRect())}}}applyEdits(e){let n=0,r=!1,o=this.pendingContextChange;return e.changes.iterChanges((a,i,l,s,f)=>{if(r)return;let c=f.length-(i-a);if(o&&i>=o.to)if(o.from==a&&o.to==i&&o.insert.eq(f)){o=this.pendingContextChange=null,n+=c,this.to+=c;return}else o=null,this.revertPending(e.state);if(a+=n,i+=n,i<=this.from)this.from+=c,this.to+=c;else if(a<this.to){if(a<this.from||i>this.to||this.to-this.from+f.length>3e4){r=!0;return}this.editContext.updateText(this.toContextPos(a),this.toContextPos(i),f.toString()),this.to+=c}n+=c}),o&&!r&&this.revertPending(e.state),!r}update(e){let n=this.pendingContextChange,r=e.startState.selection.main;this.composing&&(this.composing.drifted||!e.changes.touchesRange(r.from,r.to)&&e.transactions.some(o=>!o.isUserEvent("input.type")&&o.changes.touchesRange(this.from,this.to)))?(this.composing.drifted=!0,this.composing.editorBase=e.changes.mapPos(this.composing.editorBase)):!this.applyEdits(e)||!this.rangeIsValid(e.state)?(this.pendingContextChange=null,this.reset(e.state)):(e.docChanged||e.selectionSet||n)&&this.setSelection(e.state),(e.geometryChanged||e.docChanged||e.selectionSet)&&e.view.requestMeasure(this.measureReq)}resetRange(e){let{head:n}=e.selection.main;this.from=Math.max(0,n-1e4),this.to=Math.min(e.doc.length,n+1e4)}reset(e){this.resetRange(e),this.editContext.updateText(0,this.editContext.text.length,e.doc.sliceString(this.from,this.to)),this.setSelection(e)}revertPending(e){let n=this.pendingContextChange;this.pendingContextChange=null,this.editContext.updateText(this.toContextPos(n.from),this.toContextPos(n.from+n.insert.length),e.doc.sliceString(n.from,n.to))}setSelection(e){let{main:n}=e.selection,r=this.toContextPos(Math.max(this.from,Math.min(this.to,n.anchor))),o=this.toContextPos(n.head);(this.editContext.selectionStart!=r||this.editContext.selectionEnd!=o)&&this.editContext.updateSelection(r,o)}rangeIsValid(e){let{head:n}=e.selection.main;return!(this.from>0&&n-this.from<500||this.to<e.doc.length&&this.to-n<500||this.to-this.from>1e4*3)}toEditorPos(e,n=this.to-this.from){e=Math.min(e,n);let r=this.composing;return r&&r.drifted?r.editorBase+(e-r.contextBase):e+this.from}toContextPos(e){let n=this.composing;return n&&n.drifted?n.contextBase+(e-n.editorBase):e-this.from}destroy(){for(let e in this.handlers)this.editContext.removeEventListener(e,this.handlers[e])}},U=class t{get state(){return this.viewState.state}get viewport(){return this.viewState.viewport}get visibleRanges(){return this.viewState.visibleRanges}get inView(){return this.viewState.inView}get composing(){return!!this.inputState&&this.inputState.composing>0}get compositionStarted(){return!!this.inputState&&this.inputState.composing>=0}get root(){return this._root}get win(){return this.dom.ownerDocument.defaultView||window}constructor(e={}){var n;this.plugins=[],this.pluginMap=new Map,this.editorAttrs={},this.contentAttrs={},this.bidiCache=[],this.destroyed=!1,this.updateState=2,this.measureScheduled=-1,this.measureRequests=[],this.clearAnnouncement=-1,this.contentDOM=document.createElement("div"),this.scrollDOM=document.createElement("div"),this.scrollDOM.tabIndex=-1,this.scrollDOM.className="cm-scroller",this.scrollDOM.appendChild(this.contentDOM),this.announceDOM=document.createElement("div"),this.announceDOM.className="cm-announced",this.announceDOM.setAttribute("aria-live","polite"),this.dom=document.createElement("div"),this.dom.appendChild(this.announceDOM),this.dom.appendChild(this.scrollDOM),e.parent&&e.parent.appendChild(this.dom);let{dispatch:r}=e;this.dispatchTransactions=e.dispatchTransactions||r&&(o=>o.forEach(a=>r(a,this)))||(o=>this.update(o)),this.dispatch=this.dispatch.bind(this),this._root=e.root||yE(e.parent)||document,this.viewState=new Xu(this,e.state||De.create(e)),e.scrollTo&&e.scrollTo.is(Tu)&&(this.viewState.scrollTarget=e.scrollTo.value.clip(this.viewState.state)),this.plugins=this.state.facet(_i).map(o=>new Ps(o));for(let o of this.plugins)o.update(this);this.observer=new wg(this),this.inputState=new sg(this),this.inputState.ensureHandlers(this.plugins),this.docView=new Uu(this),this.mountStyles(),this.updateAttrs(),this.updateState=0,this.requestMeasure(),!((n=document.fonts)===null||n===void 0)&&n.ready&&document.fonts.ready.then(()=>{this.viewState.mustMeasureContent="refresh",this.requestMeasure()})}dispatch(...e){let n=e.length==1&&e[0]instanceof Xe?e:e.length==1&&Array.isArray(e[0])?e[0]:[this.state.update(...e)];this.dispatchTransactions(n,this)}update(e){if(this.updateState!=0)throw new Error("Calls to EditorView.update are not allowed while an update is in progress");let n=!1,r=!1,o,a=this.state;for(let u of e){if(u.startState!=a)throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");a=u.state}if(this.destroyed){this.viewState.state=a;return}let i=this.hasFocus,l=0,s=null;e.some(u=>u.annotation(gC))?(this.inputState.notifiedFocused=i,l=1):i!=this.inputState.notifiedFocused&&(this.inputState.notifiedFocused=i,s=yC(a,i),s||(l=1));let f=this.observer.delayedAndroidKey,c=null;if(f?(this.observer.clearDelayedAndroidKey(),c=this.observer.readChange(),(c&&!this.state.doc.eq(a.doc)||!this.state.selection.eq(a.selection))&&(c=null)):this.observer.clear(),a.facet(De.phrases)!=this.state.facet(De.phrases))return this.setState(a);o=zu.create(this,a,e),o.flags|=l;let d=this.viewState.scrollTarget;try{this.updateState=2;for(let u of e){if(d&&(d=d.map(u.changes)),u.scrollIntoView){let{main:p}=u.state.selection,{x:m,y:x}=this.state.facet(t.cursorScrollMargin);d=new _s(p.empty?p:O.cursor(p.head,p.head>p.anchor?-1:1),"nearest","nearest",x,m)}for(let p of u.effects)p.is(Tu)&&(d=p.value.clip(this.state))}this.viewState.update(o,d),this.bidiCache=Qu.update(this.bidiCache,o.changes),o.empty||(this.updatePlugins(o),this.inputState.update(o)),n=this.docView.update(o),this.state.facet(Es)!=this.styleModules&&this.mountStyles(),r=this.updateAttrs(),this.showAnnouncements(e),this.docView.updateSelection(n,e.some(u=>u.isUserEvent("select.pointer")))}finally{this.updateState=0}if(o.startState.facet(Ru)!=o.state.facet(Ru)&&(this.viewState.mustMeasureContent=!0),(n||r||d||this.viewState.mustEnforceCursorAssoc||this.viewState.mustMeasureContent)&&this.requestMeasure(),n&&this.docViewUpdate(),!o.empty)for(let u of this.state.facet(Wx))try{u(o)}catch(p){vt(this.state,p,"update listener")}(s||c)&&Promise.resolve().then(()=>{s&&this.state==s.startState&&this.dispatch(s),c&&!cC(this,c)&&f.force&&Ui(this.contentDOM,f.key,f.keyCode)})}setState(e){if(this.updateState!=0)throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");if(this.destroyed){this.viewState.state=e;return}this.updateState=2;let n=this.hasFocus;try{for(let r of this.plugins)r.destroy(this);this.viewState=new Xu(this,e),this.plugins=e.facet(_i).map(r=>new Ps(r)),this.pluginMap.clear();for(let r of this.plugins)r.update(this);this.docView.destroy(),this.docView=new Uu(this),this.inputState.ensureHandlers(this.plugins),this.mountStyles(),this.updateAttrs(),this.bidiCache=[]}finally{this.updateState=0}n&&this.focus(),this.requestMeasure()}updatePlugins(e){let n=e.startState.facet(_i),r=e.state.facet(_i);if(n!=r){let o=[];for(let a of r){let i=n.indexOf(a);if(i<0)o.push(new Ps(a));else{let l=this.plugins[i];l.mustUpdate=e,o.push(l)}}for(let a of this.plugins)a.mustUpdate!=e&&a.destroy(this);this.plugins=o,this.pluginMap.clear()}else for(let o of this.plugins)o.mustUpdate=e;for(let o=0;o<this.plugins.length;o++)this.plugins[o].update(this);n!=r&&this.inputState.ensureHandlers(this.plugins)}docViewUpdate(){for(let e of this.plugins){let n=e.value;if(n&&n.docViewUpdate)try{n.docViewUpdate(this)}catch(r){vt(this.state,r,"doc view update listener")}}}measure(e=!0){if(this.destroyed)return;if(this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.observer.delayedAndroidKey){this.measureScheduled=-1,this.requestMeasure();return}this.measureScheduled=0,e&&this.observer.forceFlush();let n=null,r=this.viewState.scrollParent,o=this.viewState.getScrollOffset(),{scrollAnchorPos:a,scrollAnchorHeight:i,scaleY:l}=this.viewState;Math.abs(o-this.viewState.scrollOffset)>1&&(i=-1),this.viewState.scrollAnchorHeight=-1;try{for(let s=0;;s++){if(i<0){if(_k(r||this.win))a=-1,i=this.viewState.heightMap.height/this.viewState.scaleY;else{let m=this.viewState.scrollAnchorAt(o);a=m.from,i=m.top}l=this.viewState.scaleY}this.updateState=1;let f=this.viewState.measure();if(!f&&!this.measureRequests.length&&this.viewState.scrollTarget==null)break;if(s>5){console.warn(this.measureRequests.length?"Measure loop restarted more than 5 times":"Viewport failed to stabilize");break}let c=[];f&4||([this.measureRequests,c]=[c,this.measureRequests]);let d=c.map(m=>{try{return m.read(this)}catch(x){return vt(this.state,x),Sk}}),u=zu.create(this,this.state,[]),p=!1;u.flags|=f,n?n.flags|=f:n=u,this.updateState=2,u.empty||(this.updatePlugins(u),this.inputState.update(u),this.updateAttrs(),p=this.docView.update(u),p&&this.docViewUpdate());for(let m=0;m<c.length;m++)if(d[m]!=Sk)try{let x=c[m];x.write&&x.write(d[m],this)}catch(x){vt(this.state,x)}if(p&&this.docView.updateSelection(!0),!u.viewportChanged&&this.measureRequests.length==0){if(this.viewState.editorHeight)if(this.viewState.scrollTarget){this.docView.scrollIntoView(this.viewState.scrollTarget),this.viewState.scrollTarget=null,i=-1;continue}else{let x=(a<0?this.viewState.heightMap.height:this.viewState.lineBlockAt(a).top)/this.viewState.scaleY-i/l;if((x>1||x<-1)&&!(q.ios&&this.inputState.lastIOSMomentumScroll>Date.now()-100)&&(r==this.scrollDOM||this.hasFocus||Math.max(this.inputState.lastWheelEvent,this.inputState.lastTouchTime)>Date.now()-100)){o=o+x,r?a<0?r.scrollTop=r.scrollHeight:r.scrollTop+=x:this.win.scrollBy(0,x),i=-1;continue}}break}}}finally{this.updateState=0,this.measureScheduled=-1}if(n&&!n.empty)for(let s of this.state.facet(Wx))s(n)}get themeClasses(){return Ig+" "+(this.state.facet(bg)?vC:IC)+" "+this.state.facet(Ru)}updateAttrs(){let e=kk(this,tC,{class:"cm-editor"+(this.hasFocus?" cm-focused ":" ")+this.themeClasses}),n={spellcheck:"false",autocorrect:"off",autocapitalize:"off",writingsuggestions:"false",translate:"no",contenteditable:this.state.facet(Mr)?"true":"false",class:"cm-content",style:`${q.tabSize}: ${this.state.tabSize}`,role:"textbox","aria-multiline":"true"};this.state.readOnly&&(n["aria-readonly"]="true"),kk(this,Lg,n);let r=this.observer.ignore(()=>{let o=rk(this.contentDOM,this.contentAttrs,n),a=rk(this.dom,this.editorAttrs,e);return o||a});return this.editorAttrs=e,this.contentAttrs=n,r}showAnnouncements(e){let n=!0;for(let r of e)for(let o of r.effects)if(o.is(t.announce)){n&&(this.announceDOM.textContent="",this.win.clearTimeout(this.clearAnnouncement),this.clearAnnouncement=this.win.setTimeout(()=>{this.announceDOM.textContent="\xA0"},200),n=!1);let a=this.announceDOM.appendChild(document.createElement("div"));a.textContent=o.value}}mountStyles(){this.styleModules=this.state.facet(Es);let e=this.state.facet(t.cspNonce);gn.mount(this.root,this.styleModules.concat(CF).reverse(),e?{nonce:e}:void 0)}readMeasured(){if(this.updateState==2)throw new Error("Reading the editor layout isn't allowed during an update");this.updateState==0&&this.measureScheduled>-1&&this.measure(!1)}requestMeasure(e){if(this.measureScheduled<0&&(this.measureScheduled=this.win.requestAnimationFrame(()=>this.measure())),e){if(this.measureRequests.indexOf(e)>-1)return;if(e.key!=null){for(let n=0;n<this.measureRequests.length;n++)if(this.measureRequests[n].key===e.key){this.measureRequests[n]=e;return}}this.measureRequests.push(e)}}plugin(e){let n=this.pluginMap.get(e);return(n===void 0||n&&n.plugin!=e)&&this.pluginMap.set(e,n=this.plugins.find(r=>r.plugin==e)||null),n&&n.update(this).value}get documentTop(){return this.contentDOM.getBoundingClientRect().top+this.viewState.paddingTop}get documentPadding(){return{top:this.viewState.paddingTop,bottom:this.viewState.paddingBottom}}get scaleX(){return this.viewState.scaleX}get scaleY(){return this.viewState.scaleY}elementAtHeight(e){return this.readMeasured(),this.viewState.elementAtHeight(e)}lineBlockAtHeight(e){return this.readMeasured(),this.viewState.lineBlockAtHeight(e)}get viewportLineBlocks(){return this.viewState.viewportLines}lineBlockAt(e){return this.viewState.lineBlockAt(e)}get contentHeight(){return this.viewState.contentHeight}moveByChar(e,n,r){return Fx(this,e,fk(this,e,n,r))}moveByGroup(e,n){return Fx(this,e,fk(this,e,n,r=>KE(this,e.head,r)))}visualLineSide(e,n){return n?O.cursor(e.to,1):O.cursor(e.from,-1)}moveToLineBoundary(e,n,r=!0){return WE(this,e,n,r)}moveVertically(e,n,r){return Fx(this,e,YE(this,e,n,r))}domAtPos(e,n=1){return this.docView.domAtPos(e,n)}posAtDOM(e,n=0){return this.docView.posFromDOM(e,n)}posAtCoords(e,n=!0){this.readMeasured();let r=rg(this,e,n);return r&&r.pos}posAndSideAtCoords(e,n=!0){return this.readMeasured(),rg(this,e,n)}coordsAtPos(e,n=1){this.readMeasured();let r=this.state.doc.lineAt(e),o=this.bidiSpans(r),a=o[In.find(o,e-r.from,-1,n)];return r.length&&(e==r.from&&n<0||e==r.to&&n>0)&&a.dir!=this.textDirectionAt(r.from)&&(e==r.to?(e=r.from+a.from,n=1):(e=r.from+a.to,n=-1)),this.docView.coordsAt(e,n,a.dir==me.RTL)}coordsForChar(e){return this.readMeasured(),this.docView.coordsForChar(e)}get defaultCharacterWidth(){return this.viewState.heightOracle.charWidth}get defaultLineHeight(){return this.viewState.heightOracle.lineHeight}get textDirection(){return this.viewState.defaultTextDirection}textDirectionAt(e){return!this.state.facet($k)||e<this.viewport.from||e>this.viewport.to?this.textDirection:(this.readMeasured(),this.docView.textDirectionAt(e))}get lineWrapping(){return this.viewState.heightOracle.lineWrapping}bidiSpans(e){if(e.length>MF)return Vk(e.length);let n=this.textDirectionAt(e.from),r;for(let a of this.bidiCache)if(a.from==e.from&&a.dir==n&&(a.fresh||jk(a.isolates,r=ik(this,e))))return a.order;r||(r=ik(this,e));let o=AE(e.text,n,r);return this.bidiCache.push(new Qu(e.from,e.to,n,r,!0,o)),o}get hasFocus(){var e;return(this.dom.ownerDocument.hasFocus()||q.safari&&((e=this.inputState)===null||e===void 0?void 0:e.lastContextMenu)>Date.now()-3e4)&&this.root.activeElement==this.contentDOM}focus(){this.observer.ignore(()=>{qk(this.contentDOM),this.docView.updateSelection()})}setRoot(e){this._root!=e&&(this._root=e,this.observer.setWindow((e.nodeType==9?e:e.ownerDocument).defaultView||window),this.mountStyles())}destroy(){this.root.activeElement==this.contentDOM&&this.contentDOM.blur();for(let e of this.plugins)e.destroy(this);this.plugins=[],this.inputState.destroy(),this.docView.destroy(),this.dom.remove(),this.observer.destroy(),this.win.clearTimeout(this.clearAnnouncement),this.measureScheduled>-1&&this.win.cancelAnimationFrame(this.measureScheduled),this.destroyed=!0}static scrollIntoView(e,n={}){var r,o,a,i;return Tu.of(new _s(typeof e=="number"?O.cursor(e):e,(r=n.y)!==null&&r!==void 0?r:"nearest",(o=n.x)!==null&&o!==void 0?o:"nearest",(a=n.yMargin)!==null&&a!==void 0?a:5,(i=n.xMargin)!==null&&i!==void 0?i:5))}scrollSnapshot(){let{scrollTop:e,scrollLeft:n}=this.scrollDOM,r=this.viewState.scrollAnchorAt(e);return Tu.of(new _s(O.cursor(r.from),"start","start",r.top-e,n,!0))}setTabFocusMode(e){e==null?this.inputState.tabFocusMode=this.inputState.tabFocusMode<0?0:-1:typeof e=="boolean"?this.inputState.tabFocusMode=e?0:-1:this.inputState.tabFocusMode!=0&&(this.inputState.tabFocusMode=Date.now()+e)}static domEventHandlers(e){return Ft.define(()=>({}),{eventHandlers:e})}static domEventObservers(e){return Ft.define(()=>({}),{eventObservers:e})}static theme(e,n){let r=gn.newName(),o=[Ru.of(r),Es.of(vg(`.${r}`,e))];return n&&n.dark&&o.push(bg.of(!0)),o}static baseTheme(e){return Dn.lowest(Es.of(vg("."+Ig,e,wC)))}static findFromDOM(e){var n;let r=e.querySelector(".cm-content"),o=r&&Oe.get(r)||Oe.get(e);return((n=o?.root)===null||n===void 0?void 0:n.view)||null}};U.styleModule=Es;U.inputHandler=Yk;U.clipboardInputFilter=Eg;U.clipboardOutputFilter=Fg;U.scrollHandler=Zk;U.focusChangeEffect=Jk;U.perLineTextDirection=$k;U.exceptionSink=Kk;U.updateListener=Wx;U.editable=Mr;U.mouseSelectionStyle=Wk;U.dragMovesSelection=Qk;U.clickAddsSelectionRange=Xk;U.decorations=Ju;U.blockWrappers=nC;U.outerDecorations=Ng;U.atomicRanges=Ks;U.bidiIsolatedRanges=rC;U.cursorScrollMargin=z.define({combine:t=>{let e=5,n=5;for(let r of t)typeof r=="number"?e=n=r:{x:e,y:n}=r;return{x:e,y:n}}});U.scrollMargins=aC;U.darkTheme=bg;U.cspNonce=z.define({combine:t=>t.length?t[0]:""});U.contentAttributes=Lg;U.editorAttributes=tC;U.lineWrapping=U.contentAttributes.of({class:"cm-lineWrapping"});U.announce=ae.define();MF=4096,Sk={},Qu=class t{constructor(e,n,r,o,a,i){this.from=e,this.to=n,this.dir=r,this.isolates=o,this.fresh=a,this.order=i}static update(e,n){if(n.empty&&!e.some(a=>a.fresh))return e;let r=[],o=e.length?e[e.length-1].dir:me.LTR;for(let a=Math.max(0,e.length-10);a<e.length;a++){let i=e[a];i.dir==o&&!n.touchesRange(i.from,i.to)&&r.push(new t(n.mapPos(i.from,1),n.mapPos(i.to,-1),i.dir,i.isolates,!1,i.order))}return r}};DF=q.mac?"mac":q.windows?"win":q.linux?"linux":"key";BF=Dn.default(U.domEventHandlers({keydown(t,e){return LF(RF(e.state),t,e,"editor")}})),Yi=z.define({enables:BF}),Ck=new WeakMap;yo=null,EF=4e3;kg=null;Ak=!q.ios,NF=q.gecko&&q.gecko_version==153?"#ffffff01":"transparent",I_=Dn.highest(U.theme({".cm-line":{...Ak?{"& ::selection, &::selection":{backgroundColor:`${NF} !important`}}:{},caretColor:"transparent !important"},".cm-content":{caretColor:"transparent !important","& :focus":{caretColor:"initial !important",...Ak?{"&::selection, & ::selection":{backgroundColor:"Highlight !important"}}:{}}}})),v_=/x/.unicode!=null?"gu":"g";qF=W.line({class:"cm-activeLine"}),_F=Ft.fromClass(class{constructor(t){this.decorations=this.getDeco(t)}update(t){(t.docChanged||t.selectionSet)&&(this.decorations=this.getDeco(t.view))}getDeco(t){let e=-1,n=[];for(let r of t.state.selection.ranges){let o=t.lineBlockAt(r.head);o.from>e&&(n.push(qF.range(o.from)),e=o.from)}return W.set(n)}},{decorations:t=>t.decorations}),Cg=class extends Or{constructor(e){super(),this.content=e}toDOM(e){let n=document.createElement("span");return n.className="cm-placeholder",n.style.pointerEvents="none",n.appendChild(typeof this.content=="string"?document.createTextNode(this.content):typeof this.content=="function"?this.content(e):this.content.cloneNode(!0)),n.setAttribute("aria-hidden","true"),n}coordsAt(e){let n=e.firstChild?Ns(e.firstChild):[];if(!n.length)return null;let r=window.getComputedStyle(e.parentNode),o=Qs(n[0],r.direction!="rtl"),a=parseInt(r.lineHeight);return o.bottom-o.top>a*1.5?{left:o.left,right:o.right,top:o.top,bottom:o.top+a}:o}ignoreEvent(){return!1}};Fu="-10000px",Ag=class{constructor(e,n,r,o){this.facet=n,this.createTooltipView=r,this.removeTooltipView=o,this.input=e.state.facet(n),this.tooltips=this.input.filter(i=>i);let a=null;this.tooltipViews=this.tooltips.map(i=>a=r(i,a))}update(e,n){var r;let o=e.state.facet(this.facet),a=o.filter(s=>s);if(o===this.input){for(let s of this.tooltipViews)s.update&&s.update(e);return!1}let i=[],l=n?[]:null;for(let s=0;s<a.length;s++){let f=a[s],c=-1;if(f){for(let d=0;d<this.tooltips.length;d++){let u=this.tooltips[d];u&&u.create==f.create&&(c=d)}if(c<0)i[s]=this.createTooltipView(f,s?i[s-1]:null),l&&(l[s]=!!f.above);else{let d=i[s]=this.tooltipViews[c];l&&(l[s]=n[c]),d.update&&d.update(e)}}}for(let s of this.tooltipViews)i.indexOf(s)<0&&(this.removeTooltipView(s),(r=s.destroy)===null||r===void 0||r.call(s));return n&&(l.forEach((s,f)=>n[f]=s),n.length=l.length),this.input=o,this.tooltips=a,this.tooltipViews=i,!0}};Nx=z.define({combine:t=>{var e,n,r;return{position:q.ios?"absolute":((e=t.find(o=>o.position))===null||e===void 0?void 0:e.position)||"fixed",parent:((n=t.find(o=>o.parent))===null||n===void 0?void 0:n.parent)||null,tooltipSpace:((r=t.find(o=>o.tooltipSpace))===null||r===void 0?void 0:r.tooltipSpace)||PF}}}),Tk=new WeakMap,AC=Ft.fromClass(class{constructor(t){this.view=t,this.above=[],this.inView=!0,this.madeAbsolute=!1,this.lastTransaction=0,this.measureTimeout=-1;let e=t.state.facet(Nx);this.position=e.position,this.parent=e.parent,this.classes=t.themeClasses,this.createContainer(),this.measureReq={read:this.readMeasure.bind(this),write:this.writeMeasure.bind(this),key:this},this.resizeObserver=typeof ResizeObserver=="function"?new ResizeObserver(()=>this.measureSoon()):null,this.manager=new Ag(t,Pg,(n,r)=>this.createTooltip(n,r),n=>{this.resizeObserver&&this.resizeObserver.unobserve(n.dom),n.dom.remove()}),this.above=this.manager.tooltips.map(n=>!!n.above),this.intersectionObserver=typeof IntersectionObserver=="function"?new IntersectionObserver(n=>{Date.now()>this.lastTransaction-50&&n.length>0&&n[n.length-1].intersectionRatio<1&&this.measureSoon()},{threshold:[1]}):null,this.observeIntersection(),t.win.addEventListener("resize",this.measureSoon=this.measureSoon.bind(this)),this.maybeMeasure()}createContainer(){this.parent?(this.container=document.createElement("div"),this.container.style.position="relative",this.container.className=this.view.themeClasses,this.parent.appendChild(this.container)):this.container=this.view.dom}observeIntersection(){if(this.intersectionObserver){this.intersectionObserver.disconnect();for(let t of this.manager.tooltipViews)this.intersectionObserver.observe(t.dom)}}measureSoon(){this.measureTimeout<0&&(this.measureTimeout=setTimeout(()=>{this.measureTimeout=-1,this.maybeMeasure()},50))}update(t){t.transactions.length&&(this.lastTransaction=Date.now());let e=this.manager.update(t,this.above);e&&this.observeIntersection();let n=e||t.geometryChanged,r=t.state.facet(Nx);if(r.position!=this.position&&!this.madeAbsolute){this.position=r.position;for(let o of this.manager.tooltipViews)o.dom.style.position=this.position;n=!0}if(r.parent!=this.parent){this.parent&&this.container.remove(),this.parent=r.parent,this.createContainer();for(let o of this.manager.tooltipViews)this.container.appendChild(o.dom);n=!0}else this.parent&&this.view.themeClasses!=this.classes&&(this.classes=this.container.className=this.view.themeClasses);n&&this.maybeMeasure()}createTooltip(t,e){let n=t.create(this.view),r=e?e.dom:null;if(n.dom.classList.add("cm-tooltip"),t.arrow&&!n.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")){let o=document.createElement("div");o.className="cm-tooltip-arrow",n.dom.appendChild(o)}return n.dom.style.position=this.position,n.dom.style.top=Fu,n.dom.style.left="0px",this.container.insertBefore(n.dom,r),n.mount&&n.mount(this.view),this.resizeObserver&&this.resizeObserver.observe(n.dom),n}destroy(){var t,e,n;this.view.win.removeEventListener("resize",this.measureSoon);for(let r of this.manager.tooltipViews)r.dom.remove(),(t=r.destroy)===null||t===void 0||t.call(r);this.parent&&this.container.remove(),(e=this.resizeObserver)===null||e===void 0||e.disconnect(),(n=this.intersectionObserver)===null||n===void 0||n.disconnect(),clearTimeout(this.measureTimeout)}readMeasure(){let t=1,e=1,n=!1,r=0;if(this.position=="fixed"&&this.manager.tooltipViews.length){let{dom:i}=this.manager.tooltipViews[0];if(q.safari){let l=i.getBoundingClientRect();n=Math.abs(l.top+1e4)>1||Math.abs(l.left)>1}else n=!!i.offsetParent&&i.offsetParent!=this.container.ownerDocument.body}if(n||this.position=="absolute")if(this.parent){let i=this.parent.getBoundingClientRect();i.width&&i.height&&(t=i.width/this.parent.offsetWidth,e=i.height/this.parent.offsetHeight)}else({scaleX:t,scaleY:e}=this.view.viewState);else r=CC(this.view).left;let o=this.view.scrollDOM.getBoundingClientRect(),a=qg(this.view);return{visible:{left:o.left+a.left,top:o.top+a.top,right:o.right-a.right,bottom:o.bottom-a.bottom},parent:this.parent?this.container.getBoundingClientRect():this.view.dom.getBoundingClientRect(),pos:this.manager.tooltips.map((i,l)=>{let s=this.manager.tooltipViews[l];return s.getCoords?s.getCoords(i.pos):this.view.coordsAtPos(i.pos)}),size:this.manager.tooltipViews.map(({dom:i})=>i.getBoundingClientRect()),space:this.view.state.facet(Nx).tooltipSpace(this.view),scaleX:t,scaleY:e,makeAbsolute:n,fixedLeft:r}}writeMeasure(t){var e;if(t.makeAbsolute){this.madeAbsolute=!0,this.position="absolute";for(let l of this.manager.tooltipViews)l.dom.style.position="absolute"}let{visible:n,space:r,scaleX:o,scaleY:a}=t,i=[];for(let l=0;l<this.manager.tooltips.length;l++){let s=this.manager.tooltips[l],f=this.manager.tooltipViews[l],{dom:c}=f,d=t.pos[l],u=t.size[l];if(!d||s.clip!==!1&&(d.bottom<=Math.max(n.top,r.top)||d.top>=Math.min(n.bottom,r.bottom)||d.right<Math.max(n.left,r.left)-.1||d.left>Math.min(n.right,r.right)+.1)){c.style.top=Fu;continue}let p=s.arrow?f.dom.querySelector(".cm-tooltip-arrow"):null,m=p?7:0,x=u.right-u.left,b=(e=Tk.get(f))!==null&&e!==void 0?e:u.bottom-u.top,h=f.offset||HF,y=this.view.textDirection==me.LTR,g=u.width>r.right-r.left?y?r.left:r.right-u.width:y?Math.max(r.left,Math.min(d.left-(p?14:0)+h.x,r.right-x)):Math.min(Math.max(r.left,d.left-x+(p?14:0)-h.x),r.right-x),I=this.above[l];!s.strictSide&&(I?d.top-b-m-h.y<r.top:d.bottom+b+m+h.y>r.bottom)&&I==r.bottom-d.bottom>d.top-r.top&&(I=this.above[l]=!I);let v=(I?d.top-r.top:r.bottom-d.bottom)-m;if(v<b&&f.resize!==!1){if(v<this.view.defaultLineHeight){c.style.top=Fu;continue}Tk.set(f,b),c.style.height=(b=v)/a+"px"}else c.style.height&&(c.style.height="");let S=I?d.top-b-m-h.y:d.bottom+m+h.y,w=g+x;if(f.overlap!==!0)for(let k of i)k.left<w&&k.right>g&&k.top<S+b&&k.bottom>S&&(S=I?k.top-b-2-m:k.bottom+m+2);if(this.position=="absolute"?(c.style.top=(S-t.parent.top)/a+"px",Mk(c,(g-t.parent.left)/o)):(c.style.top=S/a+"px",Mk(c,(g-t.fixedLeft)/o)),p){let k=d.left+(y?h.x:-h.x)-(g+14-7);p.style.left=k/o+"px"}f.overlap!==!0&&i.push({left:g,top:S,right:w,bottom:S+b}),c.classList.toggle("cm-tooltip-above",I),c.classList.toggle("cm-tooltip-below",!I),f.positioned&&f.positioned(t.space)}}maybeMeasure(){if(this.manager.tooltips.length&&(this.view.inView&&this.view.requestMeasure(this.measureReq),this.inView!=this.view.inView&&(this.inView=this.view.inView,!this.inView)))for(let t of this.manager.tooltipViews)t.dom.style.top=Fu}},{eventObservers:{scroll(){this.maybeMeasure()}}});zF=U.baseTheme({".cm-tooltip":{zIndex:500,boxSizing:"border-box"},"&light .cm-tooltip":{border:"1px solid #bbb",backgroundColor:"#f5f5f5"},"&light .cm-tooltip-section:not(:first-child)":{borderTop:"1px solid #bbb"},"&dark .cm-tooltip":{backgroundColor:"#333338",color:"white"},".cm-tooltip-arrow":{height:"7px",width:"14px",position:"absolute",zIndex:-1,overflow:"hidden","&:before, &:after":{content:"''",position:"absolute",width:0,height:0,borderLeft:"7px solid transparent",borderRight:"7px solid transparent"},".cm-tooltip-above &":{bottom:"-7px","&:before":{borderTop:"7px solid #bbb"},"&:after":{borderTop:"7px solid #f5f5f5",bottom:"1px"}},".cm-tooltip-below &":{top:"-7px","&:before":{borderBottom:"7px solid #bbb"},"&:after":{borderBottom:"7px solid #f5f5f5",top:"1px"}}},"&dark .cm-tooltip .cm-tooltip-arrow":{"&:before":{borderTopColor:"#333338",borderBottomColor:"#333338"},"&:after":{borderTopColor:"transparent",borderBottomColor:"transparent"}}}),HF={x:0,y:0},Pg=z.define({enables:[AC,zF]});$n=class extends xn{compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}eq(e){return!1}destroy(e){}};$n.prototype.elementClass="";$n.prototype.toDOM=void 0;$n.prototype.mapMode=yt.TrackBefore;$n.prototype.startSide=$n.prototype.endSide=-1;$n.prototype.point=!0;qx=z.define(),UF=z.define(),Nu=z.define(),Tg=z.define({combine:t=>t.some(e=>e)});VF=Ft.fromClass(class{constructor(t){this.view=t,this.domAfter=null,this.prevViewport=t.viewport,this.dom=document.createElement("div"),this.dom.className="cm-gutters cm-gutters-before",this.dom.setAttribute("aria-hidden","true"),this.dom.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.gutters=t.state.facet(Nu).map(e=>new Wu(t,e)),this.fixed=!t.state.facet(Tg);for(let e of this.gutters)e.config.side=="after"?this.getDOMAfter().appendChild(e.dom):this.dom.appendChild(e.dom);this.fixed&&(this.dom.style.position="sticky"),this.syncGutters(!1),t.scrollDOM.insertBefore(this.dom,t.contentDOM)}getDOMAfter(){return this.domAfter||(this.domAfter=document.createElement("div"),this.domAfter.className="cm-gutters cm-gutters-after",this.domAfter.setAttribute("aria-hidden","true"),this.domAfter.style.minHeight=this.view.contentHeight/this.view.scaleY+"px",this.domAfter.style.position=this.fixed?"sticky":"",this.view.scrollDOM.appendChild(this.domAfter)),this.domAfter}update(t){if(this.updateGutters(t)){let e=this.prevViewport,n=t.view.viewport,r=Math.min(e.to,n.to)-Math.max(e.from,n.from);this.syncGutters(r<(n.to-n.from)*.8)}if(t.geometryChanged){let e=this.view.contentHeight/this.view.scaleY+"px";this.dom.style.minHeight=e,this.domAfter&&(this.domAfter.style.minHeight=e)}this.view.state.facet(Tg)!=!this.fixed&&(this.fixed=!this.fixed,this.dom.style.position=this.fixed?"sticky":"",this.domAfter&&(this.domAfter.style.position=this.fixed?"sticky":"")),this.prevViewport=t.view.viewport}syncGutters(t){let e=this.dom.nextSibling;t&&(this.dom.remove(),this.domAfter&&this.domAfter.remove());let n=se.iter(this.view.state.facet(qx),this.view.viewport.from),r=[],o=this.gutters.map(a=>new Dg(a,this.view.viewport,-this.view.documentPadding.top));for(let a of this.view.viewportLineBlocks)if(r.length&&(r=[]),Array.isArray(a.type)){let i=!0;for(let l of a.type)if(l.type==Et.Text&&i){Mg(n,r,l.from);for(let s of o)s.line(this.view,l,r);i=!1}else if(l.widget)for(let s of o)s.widget(this.view,l)}else if(a.type==Et.Text){Mg(n,r,a.from);for(let i of o)i.line(this.view,a,r)}else if(a.widget)for(let i of o)i.widget(this.view,a);for(let a of o)a.finish();t&&(this.view.scrollDOM.insertBefore(this.dom,e),this.domAfter&&this.view.scrollDOM.appendChild(this.domAfter))}updateGutters(t){let e=t.startState.facet(Nu),n=t.state.facet(Nu),r=t.docChanged||t.heightChanged||t.viewportChanged||!se.eq(t.startState.facet(qx),t.state.facet(qx),t.view.viewport.from,t.view.viewport.to);if(e==n)for(let o of this.gutters)o.update(t)&&(r=!0);else{r=!0;let o=[];for(let a of n){let i=e.indexOf(a);i<0?o.push(new Wu(this.view,a)):(this.gutters[i].update(t),o.push(this.gutters[i]))}for(let a of this.gutters)a.dom.remove(),o.indexOf(a)<0&&a.destroy();for(let a of o)a.config.side=="after"?this.getDOMAfter().appendChild(a.dom):this.dom.appendChild(a.dom);this.gutters=o}return r}destroy(){for(let t of this.gutters)t.destroy();this.dom.remove(),this.domAfter&&this.domAfter.remove()}},{provide:t=>U.scrollMargins.of(e=>{let n=e.plugin(t);if(!n||n.gutters.length==0||!n.fixed)return null;let r=n.dom.offsetWidth*e.scaleX,o=n.domAfter?n.domAfter.offsetWidth*e.scaleX:0;return e.textDirection==me.LTR?{left:r,right:o}:{right:r,left:o}})});Dg=class{constructor(e,n,r){this.gutter=e,this.height=r,this.i=0,this.cursor=se.iter(e.markers,n.from)}addElement(e,n,r){let{gutter:o}=this,a=(n.top-this.height)/e.scaleY,i=n.height/e.scaleY;if(this.i==o.elements.length){let l=new Ku(e,i,a,r);o.elements.push(l),o.dom.appendChild(l.dom)}else o.elements[this.i].update(e,i,a,r);this.height=n.bottom,this.i++}line(e,n,r){let o=[];Mg(this.cursor,o,n.from),r.length&&(o=o.concat(r));let a=this.gutter.config.lineMarker(e,n,o);a&&o.unshift(a);let i=this.gutter;o.length==0&&!i.config.renderEmptyElements||this.addElement(e,n,o)}widget(e,n){let r=this.gutter.config.widgetMarker(e,n.widget,n),o=r?[r]:null;for(let a of e.state.facet(UF)){let i=a(e,n.widget,n);i&&(o||(o=[])).push(i)}o&&this.addElement(e,n,o)}finish(){let e=this.gutter;for(;e.elements.length>this.i;){let n=e.elements.pop();e.dom.removeChild(n.dom),n.destroy()}}},Wu=class{constructor(e,n){this.view=e,this.config=n,this.elements=[],this.spacer=null,this.dom=document.createElement("div"),this.dom.className="cm-gutter"+(this.config.class?" "+this.config.class:"");for(let r in n.domEventHandlers)this.dom.addEventListener(r,o=>{let a=o.target,i;if(a!=this.dom&&this.dom.contains(a)){for(;a.parentNode!=this.dom;)a=a.parentNode;let s=a.getBoundingClientRect();i=(s.top+s.bottom)/2}else i=o.clientY;let l=e.lineBlockAtHeight(i-e.documentTop);n.domEventHandlers[r](e,l,o)&&o.preventDefault()});this.markers=Dk(n.markers(e)),n.initialSpacer&&(this.spacer=new Ku(e,0,0,[n.initialSpacer(e)]),this.dom.appendChild(this.spacer.dom),this.spacer.dom.style.cssText+="visibility: hidden; pointer-events: none")}update(e){let n=this.markers;if(this.markers=Dk(this.config.markers(e.view)),this.spacer&&this.config.updateSpacer){let o=this.config.updateSpacer(this.spacer.markers[0],e);o!=this.spacer.markers[0]&&this.spacer.update(e.view,0,0,[o])}let r=e.view.viewport;return!se.eq(this.markers,n,r.from,r.to)||(this.config.lineMarkerChange?this.config.lineMarkerChange(e):!1)}destroy(){for(let e of this.elements)e.destroy()}},Ku=class{constructor(e,n,r,o){this.height=-1,this.above=0,this.markers=[],this.dom=document.createElement("div"),this.dom.className="cm-gutterElement",this.update(e,n,r,o)}update(e,n,r,o){this.height!=n&&(this.height=n,this.dom.style.height=n+"px"),this.above!=r&&(this.dom.style.marginTop=(this.above=r)?r+"px":""),GF(this.markers,o)||this.setMarkers(e,o)}setMarkers(e,n){let r="cm-gutterElement",o=this.dom.firstChild;for(let a=0,i=0;;){let l=i,s=a<n.length?n[a++]:null,f=!1;if(s){let c=s.elementClass;c&&(r+=" "+c);for(let d=i;d<this.markers.length;d++)if(this.markers[d].compare(s)){l=d,f=!0;break}}else l=this.markers.length;for(;i<l;){let c=this.markers[i++];if(c.toDOM){c.destroy(o);let d=o.nextSibling;o.remove(),o=d}}if(!s)break;s.toDOM&&(f?o=o.nextSibling:this.dom.insertBefore(s.toDOM(e),o)),f&&i++}this.dom.className=r,this.markers=n}destroy(){this.setMarkers(null,[])}};XF=z.define(),QF=z.define(),zi=z.define({combine(t){return go(t,{formatNumber:String,domEventHandlers:{}},{domEventHandlers(e,n){let r=Object.assign({},e);for(let o in n){let a=r[o],i=n[o];r[o]=a?(l,s,f)=>a(l,s,f)||i(l,s,f):i}return r}})}}),js=class extends $n{constructor(e){super(),this.number=e}eq(e){return this.number==e.number}toDOM(){return document.createTextNode(this.number)}};WF=Nu.compute([zi],t=>({class:"cm-lineNumbers",renderEmptyElements:!1,markers(e){return e.state.facet(XF)},lineMarker(e,n,r){return r.some(o=>o.toDOM)?null:new js(_x(e,e.state.doc.lineAt(n.from).number))},widgetMarker:(e,n,r)=>{for(let o of e.state.facet(QF)){let a=o(e,n,r);if(a)return a}return null},lineMarkerChange:e=>e.startState.facet(zi)!=e.state.facet(zi),initialSpacer(e){return new js(_x(e,Ok(e.state.doc.lines)))},updateSpacer(e,n){let r=_x(n.view,Ok(n.view.state.doc.lines));return r==e.number?e:new js(r)},domEventHandlers:t.facet(zi).domEventHandlers,side:"before"}))});function JF(t,e){return t.length==e.length&&t.every((n,r)=>n==e[r])}function $F(t){let e=[[]];for(let n=0;n<t.length;n++)for(let r=0,o=e.length;r<o;r++)e.push(e[r].concat(t[n]));return e.sort((n,r)=>r.length-n.length)}function rd(t){let e=Object.create(null);for(let n in t){let r=t[n];Array.isArray(r)||(r=[r]);for(let o of n.split(" "))if(o){let a=[],i=2,l=o;for(let d=0;;){if(l=="..."&&d>0&&d+3==o.length){i=1;break}let u=/^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);if(!u)throw new RangeError("Invalid path: "+o);if(a.push(u[0]=="*"?"":u[0][0]=='"'?JSON.parse(u[0]):u[0]),d+=u[0].length,d==o.length)break;let p=o[d++];if(d==o.length&&p=="!"){i=0;break}if(p!="/")throw new RangeError("Invalid path: "+o);l=o.slice(d)}let s=a.length-1,f=a[s];if(!f)throw new RangeError("Invalid path: "+o);let c=new ga(r,i,s>0?a.slice(0,s):null);e[f]=c.sort(e[f])}}return OC.add(e)}function Vg(t,e){let n=Object.create(null);for(let a of t)if(!Array.isArray(a.tag))n[a.tag.id]=a.class;else for(let i of a.tag)n[i.id]=a.class;let{scope:r,all:o=null}=e||{};return{style:a=>{let i=o;for(let l of a)for(let s of l.set){let f=n[s.id];if(f){i=i?i+" "+f:f;break}}return i},scope:r}}function ZF(t,e){let n=null;for(let r of t){let o=r.style(e);o&&(n=n?n+" "+o:o)}return n}function BC(t,e,n,r=0,o=t.length){let a=new Ug(r,Array.isArray(e)?e:[e],n);a.highlightRange(t.cursor(),r,o,"",a.highlighters),a.flush(o)}function eL(t){let e=t.type.prop(OC);for(;e&&e.context&&!t.matchContext(e.context);)e=e.next;return e||null}var KF,En,YF,nd,OC,ga,Ug,N,Zu,wo,MC,DC,So,ed,Hg,tr,xa,Zn,er,jg,Js,td,M,D_,Gg=E(()=>{Ts();KF=0,En=class t{constructor(e,n,r,o){this.name=e,this.set=n,this.base=r,this.modified=o,this.id=KF++}toString(){let{name:e}=this;for(let n of this.modified)n.name&&(e=`${n.name}(${e})`);return e}static define(e,n){let r=typeof e=="string"?e:"?";if(e instanceof t&&(n=e),n?.base)throw new Error("Can not derive from a modified tag");let o=new t(r,[],null,[]);if(o.set.push(o),n)for(let a of n.set)o.set.push(a);return o}static defineModifier(e){let n=new nd(e);return r=>r.modified.indexOf(n)>-1?r:nd.get(r.base||r,r.modified.concat(n).sort((o,a)=>o.id-a.id))}},YF=0,nd=class t{constructor(e){this.name=e,this.instances=[],this.id=YF++}static get(e,n){if(!n.length)return e;let r=n[0].instances.find(l=>l.base==e&&JF(n,l.modified));if(r)return r;let o=[],a=new En(e.name,o,e,n);for(let l of n)l.instances.push(a);let i=$F(n);for(let l of e.set)if(!l.modified.length)for(let s of i)o.push(t.get(l,s));return a}};OC=new V({combine(t,e){let n,r,o;for(;t||e;){if(!t||e&&t.depth<=e.depth?(o=e,e=e.next):(o=t,t=t.next),n&&n.mode==o.mode&&!o.context&&!n.context)continue;let a=new ga(o.tags,o.mode,o.context);n?n.next=a:r=a,n=a}return r}}),ga=class{constructor(e,n,r,o){this.tags=e,this.mode=n,this.context=r,this.next=o}get opaque(){return this.mode==0}get inherit(){return this.mode==1}sort(e){return!e||e.depth<this.depth?(this.next=e,this):(e.next=this.sort(e.next),e)}get depth(){return this.context?this.context.length:0}};ga.empty=new ga([],2,null);Ug=class{constructor(e,n,r){this.at=e,this.highlighters=n,this.span=r,this.class=""}startSpan(e,n){n!=this.class&&(this.flush(e),e>this.at&&(this.at=e),this.class=n)}flush(e){e>this.at&&this.class&&this.span(this.at,e,this.class)}highlightRange(e,n,r,o,a){let{type:i,from:l,to:s}=e;if(l>=r||s<=n)return;i.isTop&&(a=this.highlighters.filter(p=>!p.scope||p.scope(i)));let f=o,c=eL(e)||ga.empty,d=ZF(a,c.tags);if(d&&(f&&(f+=" "),f+=d,c.mode==1&&(o+=(o?" ":"")+d)),this.startSpan(Math.max(n,l),f),c.opaque)return;let u=e.tree&&e.tree.prop(V.mounted);if(u&&u.overlay){let p=e.node.enter(u.overlay[0].from+l,1),m=this.highlighters.filter(b=>!b.scope||b.scope(u.tree.type)),x=e.firstChild();for(let b=0,h=l;;b++){let y=b<u.overlay.length?u.overlay[b]:null,g=y?y.from+l:s,I=Math.max(n,h),v=Math.min(r,g);if(I<v&&x)for(;e.from<v&&(this.highlightRange(e,I,v,o,a),this.startSpan(Math.min(v,e.to),f),!(e.to>=g||!e.nextSibling())););if(!y||g>r)break;h=y.to+l,h>n&&(this.highlightRange(p.cursor(),Math.max(n,y.from+l),Math.min(r,h),"",m),this.startSpan(Math.min(r,h),f))}x&&e.parent()}else if(e.firstChild()){u&&(o="");do if(!(e.to<=n)){if(e.from>=r)break;this.highlightRange(e,n,r,o,a),this.startSpan(Math.min(r,e.to),f)}while(e.nextSibling());e.parent()}}};N=En.define,Zu=N(),wo=N(),MC=N(wo),DC=N(wo),So=N(),ed=N(So),Hg=N(So),tr=N(),xa=N(tr),Zn=N(),er=N(),jg=N(),Js=N(jg),td=N(),M={comment:Zu,lineComment:N(Zu),blockComment:N(Zu),docComment:N(Zu),name:wo,variableName:N(wo),typeName:MC,tagName:N(MC),propertyName:DC,attributeName:N(DC),className:N(wo),labelName:N(wo),namespace:N(wo),macroName:N(wo),literal:So,string:ed,docString:N(ed),character:N(ed),attributeValue:N(ed),number:Hg,integer:N(Hg),float:N(Hg),bool:N(So),regexp:N(So),escape:N(So),color:N(So),url:N(So),keyword:Zn,self:N(Zn),null:N(Zn),atom:N(Zn),unit:N(Zn),modifier:N(Zn),operatorKeyword:N(Zn),controlKeyword:N(Zn),definitionKeyword:N(Zn),moduleKeyword:N(Zn),operator:er,derefOperator:N(er),arithmeticOperator:N(er),logicOperator:N(er),bitwiseOperator:N(er),compareOperator:N(er),updateOperator:N(er),definitionOperator:N(er),typeOperator:N(er),controlOperator:N(er),punctuation:jg,separator:N(jg),bracket:Js,angleBracket:N(Js),squareBracket:N(Js),paren:N(Js),brace:N(Js),content:tr,heading:xa,heading1:N(xa),heading2:N(xa),heading3:N(xa),heading4:N(xa),heading5:N(xa),heading6:N(xa),contentSeparator:N(tr),list:N(tr),quote:N(tr),emphasis:N(tr),strong:N(tr),link:N(tr),monospace:N(tr),strikethrough:N(tr),inserted:N(),deleted:N(),changed:N(),invalid:N(),meta:td,documentMeta:N(td),annotation:N(td),processingInstruction:N(td),definition:En.defineModifier("definition"),constant:En.defineModifier("constant"),function:En.defineModifier("function"),standard:En.defineModifier("standard"),local:En.defineModifier("local"),special:En.defineModifier("special")};for(let t in M){let e=M[t];e instanceof En&&(e.name=t)}D_=Vg([{tag:M.link,class:"tok-link"},{tag:M.heading,class:"tok-heading"},{tag:M.emphasis,class:"tok-emphasis"},{tag:M.strong,class:"tok-strong"},{tag:M.keyword,class:"tok-keyword"},{tag:M.atom,class:"tok-atom"},{tag:M.bool,class:"tok-bool"},{tag:M.url,class:"tok-url"},{tag:M.labelName,class:"tok-labelName"},{tag:M.inserted,class:"tok-inserted"},{tag:M.deleted,class:"tok-deleted"},{tag:M.literal,class:"tok-literal"},{tag:M.string,class:"tok-string"},{tag:M.number,class:"tok-number"},{tag:[M.regexp,M.escape,M.special(M.string)],class:"tok-string2"},{tag:M.variableName,class:"tok-variableName"},{tag:M.local(M.variableName),class:"tok-variableName tok-local"},{tag:M.definition(M.variableName),class:"tok-variableName tok-definition"},{tag:M.special(M.variableName),class:"tok-variableName2"},{tag:M.definition(M.propertyName),class:"tok-propertyName tok-definition"},{tag:M.typeName,class:"tok-typeName"},{tag:M.namespace,class:"tok-namespace"},{tag:M.className,class:"tok-className"},{tag:M.macroName,class:"tok-macroName"},{tag:M.propertyName,class:"tok-propertyName"},{tag:M.operator,class:"tok-operator"},{tag:M.comment,class:"tok-comment"},{tag:M.meta,class:"tok-meta"},{tag:M.invalid,class:"tok-invalid"},{tag:M.punctuation,class:"tok-punctuation"}])});function tL(t){return z.define({combine:t?e=>e.concat(t):void 0})}function RC(t,e,n){let r=t.facet($i),o=dt(t).topNode;if(!r||r.allowsNesting)for(let a=o;a;a=a.enter(e,n,Me.ExcludeBuffers|Me.EnterBracketed))a.type.isTop&&(o=a);return o}function dt(t){let e=t.field(Jt.state,!1);return e?e.tree:_e.empty}function EC(t,e,n){return aa.applyChanges(t,[{fromA:e,toA:n,fromB:e,toB:n}])}function tf(t){let e=t.facet(ef);return e.charCodeAt(0)==9?t.tabSize*e.length:e.length}function nf(t,e){let n="",r=t.tabSize,o=t.facet(ef)[0];if(o=="	"){for(;e>=r;)n+="	",e-=r;o=" "}for(let a=0;a<e;a++)n+=o;return n}function ry(t,e){t instanceof De&&(t=new ya(t));for(let r of t.state.facet(oL)){let o=r(t,e);if(o!==void 0)return o}let n=dt(t.state);return n.length>=e?aL(t,n,e):null}function aL(t,e,n){let r=e.resolveStack(n),o=e.resolveInner(n,-1).resolve(n,0).enterUnfinishedNodesBefore(n);if(o!=r.node){let a=[];for(let i=o;i&&!(i.from<r.node.from||i.to>r.node.to||i.from==r.node.from&&i.type==r.node.type);i=i.parent)a.push(i);for(let i=a.length-1;i>=0;i--)r={node:a[i],next:r}}return PC(r,t,n)}function PC(t,e,n){for(let r=t;r;r=r.next){let o=lL(r.node);if(o)return o($g.create(e,n,r))}return 0}function iL(t){return t.pos==t.options.simulateBreak&&t.options.simulateDoubleBreak}function lL(t){let e=t.type.prop(oy);if(e)return e;let n=t.firstChild,r;if(n&&(r=n.type.prop(V.closedBy))){let o=t.lastChild,a=o&&r.indexOf(o.name)>-1;return i=>uL(i,!0,1,void 0,a&&!iL(i)?o.from:void 0)}return t.parent==null?sL:null}function sL(){return 0}function fL(t,e){for(let n=e;n;n=n.parent)if(t==n)return!0;return!1}function cL(t){let e=t.node,n=e.childAfter(e.from),r=e.lastChild;if(!n)return null;let o=t.options.simulateBreak,a=t.state.doc.lineAt(n.from),i=o==null||o<=a.from?a.to:Math.min(a.to,o);for(let l=n.to;;){let s=e.childAfter(l);if(!s||s==r)return null;if(!s.type.isSkipped){if(s.from>=i)return null;let f=/^ */.exec(a.text.slice(n.to-a.from))[0].length;return{from:n.from,to:n.to+f}}l=s.to}}function uL(t,e,n,r,o){let a=t.textAfter,i=a.match(/^\s*/)[0].length,l=r&&a.slice(i,i+r.length)==r||o==t.pos+i,s=e?cL(t):null;return s?l?t.column(s.from):t.column(s.to):t.baseIndent+(l?0:t.unit*n)}function zC({except:t,units:e=1}={}){return n=>{let r=t&&t.test(n.textAfter);return n.baseIndent+(r?0:e*n.unit)}}function Wg(t){let e=t.facet(Zg);return e.length?e:t.facet(UC)}function jC(t,e){let n=[dL],r;return t instanceof Zi&&(t.module&&n.push(U.styleModule.of(t.module)),r=t.themeType),e?.fallback?n.push(UC.of(t)):r?n.push(Zg.computeN([U.darkTheme],o=>o.facet(U.darkTheme)==(r=="dark")?[t]:[])):n.push(Zg.of(t)),n}function xL(t){let e=[],n=t.matched?mL:hL;return e.push(n.range(t.start.from,t.start.to)),t.end&&e.push(n.range(t.end.from,t.end.to)),e}function FC(t){let e=[],n=t.facet(QC);for(let r of t.selection.ranges){if(!r.empty)continue;let o=Fn(t,r.head,-1,n)||r.head>0&&Fn(t,r.head-1,1,n)||n.afterCursor&&(Fn(t,r.head,1,n)||r.head<t.doc.length&&Fn(t,r.head+1,-1,n));o&&(e=e.concat(n.renderMatch(o,t)))}return W.set(e,!0)}function WC(t={}){return[QC.of(t),yL]}function ty(t,e,n){let r=t.prop(e<0?V.openedBy:V.closedBy);if(r)return r;if(t.name.length==1){let o=n.indexOf(t.name);if(o>-1&&o%2==(e<0?1:0))return[n[o+e]]}return null}function ny(t){let e=t.type.prop(bL);return e?e(t.node):t}function Fn(t,e,n,r={}){let o=r.maxScanDistance||GC,a=r.brackets||XC,i=dt(t),l=i.resolveInner(e,n);for(let s=l;s;s=s.parent){let f=ty(s.type,n,a);if(f&&s.from<s.to){let c=ny(s);if(c&&(n>0?e>=c.from&&e<c.to:e>c.from&&e<=c.to))return IL(t,e,n,s,c,f,a)}}return vL(t,e,n,i,l.type,o,a)}function IL(t,e,n,r,o,a,i){let l=r.parent,s={from:o.from,to:o.to},f=0,c=l?.cursor();if(c&&(n<0?c.childBefore(r.from):c.childAfter(r.to)))do if(n<0?c.to<=r.from:c.from>=r.to){if(f==0&&a.indexOf(c.type.name)>-1&&c.from<c.to){let d=ny(c);return{start:s,end:d?{from:d.from,to:d.to}:void 0,matched:!0}}else if(ty(c.type,n,i))f++;else if(ty(c.type,-n,i)){if(f==0){let d=ny(c);return{start:s,end:d&&d.from<d.to?{from:d.from,to:d.to}:void 0,matched:!1}}f--}}while(n<0?c.prevSibling():c.nextSibling());return{start:s,matched:!1}}function vL(t,e,n,r,o,a,i){if(n<0?!e:e==t.doc.length)return null;let l=n<0?t.sliceDoc(e-1,e):t.sliceDoc(e,e+1),s=i.indexOf(l);if(s<0||s%2==0!=n>0)return null;let f={from:n<0?e-1:e,to:n>0?e+1:e},c=t.doc.iterRange(e,n>0?t.doc.length:0),d=0;for(let u=0;!c.next().done&&u<=a;){let p=c.value;n<0&&(u+=p.length);let m=e+u*n;for(let x=n>0?0:p.length-1,b=n>0?p.length:-1;x!=b;x+=n){let h=i.indexOf(p[x]);if(!(h<0||r.resolveInner(m+x,1).type!=o))if(h%2==0==n>0)d++;else{if(d==1)return{start:f,end:{from:m+x,to:m+x+1},matched:h>>1==s>>1};d--}}n>0&&(u+=p.length)}return c.done?{start:f,matched:!1}:null}function Kg(t,e){NC.indexOf(t)>-1||(NC.push(t),console.warn(e))}function kL(t,e){let n=[];for(let l of e.split(" ")){let s=[];for(let f of l.split(".")){let c=t[f]||M[f];c?typeof c=="function"?s.length?s=s.map(c):Kg(f,`Modifier ${f} used at start of tag`):s.length?Kg(f,`Tag ${f} used as modifier`):s=Array.isArray(c)?c:[c]:Kg(f,`Unknown highlighting tag ${f}`)}for(let f of s)n.push(f)}if(!n.length)return 0;let r=e.replace(/ /g,"_"),o=r+" "+n.map(l=>l.id),a=qC[o];if(a)return a.id;let i=qC[o]=ft.define({id:LC.length,name:r,props:[rd({[r]:n})]});return LC.push(i),i.id}var Xg,Ji,nL,Jt,od,Yg,$s,Jg,Zs,_C,Qg,rL,$i,ad,oL,ef,ya,oy,$g,HC,Zi,Zg,UC,ey,dL,VC,pL,GC,XC,QC,mL,hL,gL,yL,bL,wL,LC,NC,qC,SL,__,rf=E(()=>{Ts();Li();Ys();Gg();Ox();Ji=new V;nL=new V,Jt=class{constructor(e,n,r=[],o=""){this.data=e,this.name=o,De.prototype.hasOwnProperty("tree")||Object.defineProperty(De.prototype,"tree",{get(){return dt(this)}}),this.parser=n,this.extension=[$i.of(this),De.languageData.of((a,i,l)=>{let s=RC(a,i,l),f=s.type.prop(Ji);if(!f)return[];let c=a.facet(f),d=s.type.prop(nL);if(d){let u=s.resolve(i-s.from,l);for(let p of d)if(p.test(u,a)){let m=a.facet(p.facet);return p.type=="replace"?m:m.concat(c)}}return c})].concat(r)}isActiveAt(e,n,r=-1){return RC(e,n,r).type.prop(Ji)==this.data}findRegions(e){let n=e.facet($i);if(n?.data==this.data)return[{from:0,to:e.doc.length}];if(!n||!n.allowsNesting)return[];let r=[],o=(a,i)=>{if(a.prop(Ji)==this.data){r.push({from:i,to:i+a.length});return}let l=a.prop(V.mounted);if(l){if(l.tree.prop(Ji)==this.data){if(l.overlay)for(let s of l.overlay)r.push({from:s.from+i,to:s.to+i});else r.push({from:i,to:i+a.length});return}else if(l.overlay){let s=r.length;if(o(l.tree,l.overlay[0].from+i),r.length>s)return}}for(let s=0;s<a.children.length;s++){let f=a.children[s];f instanceof _e&&o(f,a.positions[s]+i)}};return o(dt(e),0),r}get allowsNesting(){return!0}};Jt.setState=ae.define();od=class t extends Jt{constructor(e,n,r){super(e,n,[],r),this.parser=n}static define(e){let n=tL(e.languageData);return new t(n,e.parser.configure({props:[Ji.add(r=>r.isTop?n:void 0)]}),e.name)}configure(e,n){return new t(this.data,this.parser.configure(e),n||this.name)}get allowsNesting(){return this.parser.hasWrappers()}};Yg=class{constructor(e){this.doc=e,this.cursorPos=0,this.string="",this.cursor=e.iter()}get length(){return this.doc.length}syncTo(e){return this.string=this.cursor.next(e-this.cursorPos).value,this.cursorPos=e+this.string.length,this.cursorPos-this.string.length}chunk(e){return this.syncTo(e),this.string}get lineChunks(){return!0}read(e,n){let r=this.cursorPos-this.string.length;return e<r||n>=this.cursorPos?this.doc.sliceString(e,n):this.string.slice(e-r,n-r)}},$s=null,Jg=class t{constructor(e,n,r=[],o,a,i,l,s){this.parser=e,this.state=n,this.fragments=r,this.tree=o,this.treeLen=a,this.viewport=i,this.skipped=l,this.scheduleOn=s,this.parse=null,this.tempSkipped=[]}static create(e,n,r){return new t(e,n,[],_e.empty,0,r,[],null)}startParse(){return this.parser.startParse(new Yg(this.state.doc),this.fragments)}work(e,n){return n!=null&&n>=this.state.doc.length&&(n=void 0),this.tree!=_e.empty&&this.isDone(n??this.state.doc.length)?(this.takeTree(),!0):this.withContext(()=>{var r;if(typeof e=="number"){let o=Date.now()+e;e=()=>Date.now()>o}for(this.parse||(this.parse=this.startParse()),n!=null&&(this.parse.stoppedAt==null||this.parse.stoppedAt>n)&&n<this.state.doc.length&&this.parse.stopAt(n);;){let o=this.parse.advance();if(o)if(this.fragments=this.withoutTempSkipped(aa.addTree(o,this.fragments,this.parse.stoppedAt!=null)),this.treeLen=(r=this.parse.stoppedAt)!==null&&r!==void 0?r:this.state.doc.length,this.tree=o,this.parse=null,this.treeLen<(n??this.state.doc.length))this.parse=this.startParse();else return!0;if(e())return!1}})}takeTree(){let e,n;this.parse&&(e=this.parse.parsedPos)>=this.treeLen&&((this.parse.stoppedAt==null||this.parse.stoppedAt>e)&&this.parse.stopAt(e),this.withContext(()=>{for(;!(n=this.parse.advance()););}),this.treeLen=e,this.tree=n,this.fragments=this.withoutTempSkipped(aa.addTree(this.tree,this.fragments,!0)),this.parse=null)}withContext(e){let n=$s;$s=this;try{return e()}finally{$s=n}}withoutTempSkipped(e){for(let n;n=this.tempSkipped.pop();)e=EC(e,n.from,n.to);return e}changes(e,n){let{fragments:r,tree:o,treeLen:a,viewport:i,skipped:l}=this;if(this.takeTree(),!e.empty){let s=[];if(e.iterChangedRanges((f,c,d,u)=>s.push({fromA:f,toA:c,fromB:d,toB:u})),r=aa.applyChanges(r,s),o=_e.empty,a=0,i={from:e.mapPos(i.from,-1),to:e.mapPos(i.to,1)},this.skipped.length){l=[];for(let f of this.skipped){let c=e.mapPos(f.from,1),d=e.mapPos(f.to,-1);c<d&&l.push({from:c,to:d})}}}return new t(this.parser,n,r,o,a,i,l,this.scheduleOn)}updateViewport(e){if(this.viewport.from==e.from&&this.viewport.to==e.to)return!1;this.viewport=e;let n=this.skipped.length;for(let r=0;r<this.skipped.length;r++){let{from:o,to:a}=this.skipped[r];o<e.to&&a>e.from&&(this.fragments=EC(this.fragments,o,a),this.skipped.splice(r--,1))}return this.skipped.length>=n?!1:(this.reset(),!0)}reset(){this.parse&&(this.takeTree(),this.parse=null)}skipUntilInView(e,n){this.skipped.push({from:e,to:n})}static getSkippingParser(e){return new class extends Mi{createParse(n,r,o){let a=o[0].from,i=o[o.length-1].to;return{parsedPos:a,advance(){let s=$s;if(s){for(let f of o)s.tempSkipped.push(f);e&&(s.scheduleOn=s.scheduleOn?Promise.all([s.scheduleOn,e]):e)}return this.parsedPos=i,new _e(ft.none,[],[],i-a)},stoppedAt:null,stopAt(){}}}}}isDone(e){e=Math.min(e,this.state.doc.length);let n=this.fragments;return this.treeLen>=e&&n.length&&n[0].from==0&&n[0].to>=e}static get(){return $s}};Zs=class t{constructor(e){this.context=e,this.tree=e.tree}apply(e){if(!e.docChanged&&this.tree==this.context.tree)return this;let n=this.context.changes(e.changes,e.state),r=this.context.treeLen==e.startState.doc.length?void 0:Math.max(e.changes.mapPos(this.context.treeLen),n.viewport.to);return n.work(20,r)||n.takeTree(),new t(n)}static init(e){let n=Math.min(3e3,e.doc.length),r=Jg.create(e.facet($i).parser,e,{from:0,to:n});return r.work(20,n)||r.takeTree(),new t(r)}};Jt.state=ut.define({create:Zs.init,update(t,e){for(let n of e.effects)if(n.is(Jt.setState))return n.value;return e.startState.facet($i)!=e.state.facet($i)?Zs.init(e.state):t.apply(e)}});_C=t=>{let e=setTimeout(()=>t(),500);return()=>clearTimeout(e)};typeof requestIdleCallback<"u"&&(_C=t=>{let e=-1,n=setTimeout(()=>{e=requestIdleCallback(t,{timeout:400})},100);return()=>e<0?clearTimeout(n):cancelIdleCallback(e)});Qg=typeof navigator<"u"&&(!((Xg=navigator.scheduling)===null||Xg===void 0)&&Xg.isInputPending)?()=>navigator.scheduling.isInputPending():null,rL=Ft.fromClass(class{constructor(e){this.view=e,this.working=null,this.workScheduled=0,this.chunkEnd=-1,this.chunkBudget=-1,this.work=this.work.bind(this),this.scheduleWork()}update(e){let n=this.view.state.field(Jt.state).context;(n.updateViewport(e.view.viewport)||this.view.viewport.to>n.treeLen)&&this.scheduleWork(),(e.docChanged||e.selectionSet)&&(this.view.hasFocus&&(this.chunkBudget+=50),this.scheduleWork()),this.checkAsyncSchedule(n)}scheduleWork(){if(this.working)return;let{state:e}=this.view,n=e.field(Jt.state);(n.tree!=n.context.tree||!n.context.isDone(e.doc.length))&&(this.working=_C(this.work))}work(e){this.working=null;let n=Date.now();if(this.chunkEnd<n&&(this.chunkEnd<0||this.view.hasFocus)&&(this.chunkEnd=n+3e4,this.chunkBudget=3e3),this.chunkBudget<=0)return;let{state:r,viewport:{to:o}}=this.view,a=r.field(Jt.state);if(a.tree==a.context.tree&&a.context.isDone(o+1e5))return;let i=Date.now()+Math.min(this.chunkBudget,100,e&&!Qg?Math.max(25,e.timeRemaining()-5):1e9),l=a.context.treeLen<o&&r.doc.length>o+1e3,s=a.context.work(()=>Qg&&Qg()||Date.now()>i,o+(l?0:1e5));this.chunkBudget-=Date.now()-n,(s||this.chunkBudget<=0)&&(a.context.takeTree(),this.view.dispatch({effects:Jt.setState.of(new Zs(a.context))})),this.chunkBudget>0&&!(s&&!l)&&this.scheduleWork(),this.checkAsyncSchedule(a.context)}checkAsyncSchedule(e){e.scheduleOn&&(this.workScheduled++,e.scheduleOn.then(()=>this.scheduleWork()).catch(n=>vt(this.view.state,n)).then(()=>this.workScheduled--),e.scheduleOn=null)}destroy(){this.working&&this.working()}isWorking(){return!!(this.working||this.workScheduled>0)}},{eventHandlers:{focus(){this.scheduleWork()}}}),$i=z.define({combine(t){return t.length?t[0]:null},enables:t=>[Jt.state,rL,U.contentAttributes.compute([t],e=>{let n=e.facet(t);return n&&n.name?{"data-language":n.name}:{}})]}),ad=class{constructor(e,n=[]){this.language=e,this.support=n,this.extension=[e,n]}},oL=z.define(),ef=z.define({combine:t=>{if(!t.length)return"  ";let e=t[0];if(!e||/\S/.test(e)||Array.from(e).some(n=>n!=e[0]))throw new Error("Invalid indent unit: "+JSON.stringify(t[0]));return e}});ya=class{constructor(e,n={}){this.state=e,this.options=n,this.unit=tf(e)}lineAt(e,n=1){let r=this.state.doc.lineAt(e),{simulateBreak:o,simulateDoubleBreak:a}=this.options;return o!=null&&o>=r.from&&o<=r.to?a&&o==e?{text:"",from:e}:(n<0?o<e:o<=e)?{text:r.text.slice(o-r.from),from:o}:{text:r.text.slice(0,o-r.from),from:r.from}:r}textAfterPos(e,n=1){if(this.options.simulateDoubleBreak&&e==this.options.simulateBreak)return"";let{text:r,from:o}=this.lineAt(e,n);return r.slice(e-o,Math.min(r.length,e+100-o))}column(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.countColumn(r,e-o),i=this.options.overrideIndentation?this.options.overrideIndentation(o):-1;return i>-1&&(a+=i-this.countColumn(r,r.search(/\S|$/))),a}countColumn(e,n=e.length){return ua(e,this.state.tabSize,n)}lineIndent(e,n=1){let{text:r,from:o}=this.lineAt(e,n),a=this.options.overrideIndentation;if(a){let i=a(o);if(i>-1)return i}return this.countColumn(r,r.search(/\S|$/))}get simulatedBreak(){return this.options.simulateBreak||null}},oy=new V;$g=class t extends ya{constructor(e,n,r){super(e.state,e.options),this.base=e,this.pos=n,this.context=r}get node(){return this.context.node}static create(e,n,r){return new t(e,n,r)}get textAfter(){return this.textAfterPos(this.pos)}get baseIndent(){return this.baseIndentFor(this.node)}baseIndentFor(e){let n=this.state.doc.lineAt(e.from);for(;;){let r=e.resolve(n.from);for(;r.parent&&r.parent.from==r.from;)r=r.parent;if(fL(r,e))break;n=this.state.doc.lineAt(r.from)}return this.lineIndent(n.from)}continue(){return PC(this.context.next,this.base,this.pos)}};HC=new V,Zi=class t{constructor(e,n){this.specs=e;let r;function o(l){let s=gn.newName();return(r||(r=Object.create(null)))["."+s]=l,s}let a=typeof n.all=="string"?n.all:n.all?o(n.all):void 0,i=n.scope;this.scope=i instanceof Jt?l=>l.prop(Ji)==i.data:i?l=>l==i:void 0,this.style=Vg(e.map(l=>({tag:l.tag,class:l.class||o(Object.assign({},l,{tag:null}))})),{all:a}).style,this.module=r?new gn(r):null,this.themeType=n.themeType}static define(e,n){return new t(e,n||{})}},Zg=z.define(),UC=z.define({combine(t){return t.length?[t[0]]:null}});ey=class{constructor(e){this.markCache=Object.create(null),this.tree=dt(e.state),this.decorations=this.buildDeco(e,Wg(e.state)),this.decoratedTo=e.viewport.to}update(e){let n=dt(e.state),r=Wg(e.state),o=r!=Wg(e.startState),{viewport:a}=e.view,i=e.changes.mapPos(this.decoratedTo,1);n.length<a.to&&!o&&n.type==this.tree.type&&i>=a.to?(this.decorations=this.decorations.map(e.changes),this.decoratedTo=i):(n!=this.tree||e.viewportChanged||o)&&(this.tree=n,this.decorations=this.buildDeco(e.view,r),this.decoratedTo=a.to)}buildDeco(e,n){if(!n||!this.tree.length)return W.none;let r=new Kn;for(let{from:o,to:a}of e.visibleRanges)BC(this.tree,n,(i,l,s)=>{r.add(i,l,this.markCache[s]||(this.markCache[s]=W.mark({class:s})))},o,a);return r.finish()}},dL=Dn.high(Ft.fromClass(ey,{decorations:t=>t.decorations})),VC=Zi.define([{tag:M.meta,color:"#404740"},{tag:M.link,textDecoration:"underline"},{tag:M.heading,textDecoration:"underline",fontWeight:"bold"},{tag:M.emphasis,fontStyle:"italic"},{tag:M.strong,fontWeight:"bold"},{tag:M.strikethrough,textDecoration:"line-through"},{tag:M.keyword,color:"#708"},{tag:[M.atom,M.bool,M.url,M.contentSeparator,M.labelName],color:"#219"},{tag:[M.literal,M.inserted],color:"#164"},{tag:[M.string,M.deleted],color:"#a11"},{tag:[M.regexp,M.escape,M.special(M.string)],color:"#e40"},{tag:M.definition(M.variableName),color:"#00f"},{tag:M.local(M.variableName),color:"#30a"},{tag:[M.typeName,M.namespace],color:"#085"},{tag:M.className,color:"#167"},{tag:[M.special(M.variableName),M.macroName],color:"#256"},{tag:M.definition(M.propertyName),color:"#00c"},{tag:M.comment,color:"#940"},{tag:M.invalid,color:"#f00"}]),pL=U.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),GC=1e4,XC="()[]{}",QC=z.define({combine(t){return go(t,{afterCursor:!0,brackets:XC,maxScanDistance:GC,renderMatch:xL})}}),mL=W.mark({class:"cm-matchingBracket"}),hL=W.mark({class:"cm-nonmatchingBracket"});gL=Ft.fromClass(class{constructor(t){this.paused=!1,this.decorations=FC(t.state)}update(t){(t.docChanged||t.selectionSet||this.paused)&&(t.view.composing?(this.decorations=this.decorations.map(t.changes),this.paused=!0):(this.decorations=FC(t.state),this.paused=!1))}},{decorations:t=>t.decorations}),yL=[gL,pL];bL=new V;wL=Object.create(null),LC=[ft.none],NC=[],qC=Object.create(null),SL=Object.create(null);for(let[t,e]of[["variable","variableName"],["variable-2","variableName.special"],["string-2","string.special"],["def","variableName.definition"],["tag","tagName"],["attribute","attributeName"],["type","typeName"],["builtin","variableName.standard"],["qualifier","modifier"],["error","invalid"],["header","heading"],["property","propertyName"]])SL[t]=kL(wL,e);__={rtl:W.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"rtl"},bidiIsolate:me.RTL}),ltr:W.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"ltr"},bidiIsolate:me.LTR}),auto:W.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"auto"},bidiIsolate:null})}});function of(t,e=Uint16Array){if(typeof t!="string")return t;let n=null;for(let r=0,o=0;r<t.length;){let a=0;for(;;){let i=t.charCodeAt(r++),l=!1;if(i==126){a=65535;break}i>=92&&i--,i>=34&&i--;let s=i-32;if(s>=46&&(s-=46,l=!0),a+=s,l)break;a*=46}n?n[o++]=a:n=new e(a)}return n}function e2(t,e,n,r,o,a){let i=0,l=1<<r,{dialect:s}=n.p.parser;e:for(;(l&t[i])!=0;){let f=t[i+1];for(let p=i+3;p<f;p+=2)if((t[p+1]&l)>0){let m=t[p];if(s.allows(m)&&(e.token.value==-1||e.token.value==m||AL(m,e.token.value,o,a))){e.acceptToken(m);break}}let c=e.next,d=0,u=t[i+2];if(e.next<0&&u>d&&t[f+u*3-3]==65535){i=t[f+u*3-1];continue e}for(;d<u;){let p=d+u>>1,m=f+p+(p<<1),x=t[m],b=t[m+1]||65536;if(c<x)u=p;else if(c>=b)d=p+1;else{i=t[m+2],e.advance();continue e}}break}}function YC(t,e,n){for(let r=e,o;(o=t[r])!=65535;r++)if(o==n)return r-e;return-1}function AL(t,e,n,r){let o=YC(n,r,e);return o<0||YC(n,r,t)<o}function JC(t,e,n){let r=t.cursor(Me.IncludeAnonymous);for(r.moveTo(e);;)if(!(n<0?r.childBefore(e):r.childAfter(e)))for(;;){if((n<0?r.to<e:r.from>e)&&!r.type.isError)return n<0?Math.max(0,Math.min(r.to-1,e-25)):Math.min(t.length,Math.max(r.from+1,e+25));if(n<0?r.prevSibling():r.nextSibling())break;if(!r.parent())return n<0?0:t.length}}function $C(t,e){for(let n=0;n<e.length;n++){let r=e[n];if(r.pos==t.pos&&r.sameState(t)){e[n].score<t.score&&(e[n]=t);return}}e.push(t)}function Rr(t,e){return t[e]|t[e+1]<<16}function TL(t){let e=null;for(let n of t){let r=n.p.stoppedAt;(n.pos==n.p.stream.end||r!=null&&n.pos>r)&&n.p.parser.stateFlag(n.state,2)&&(!e||e.score<n.score)&&(e=n)}return e}function ZC(t){if(t.external){let e=t.extend?1:0;return(n,r)=>t.external(n,r)<<1|e}return t.get}var iy,id,ly,sy,el,KC,fy,ko,cy,ld,$t,ay,uy,dy,py,my,sd,t2=E(()=>{Ts();iy=class t{constructor(e,n,r,o,a,i,l,s,f,c=0,d){this.p=e,this.stack=n,this.state=r,this.reducePos=o,this.pos=a,this.score=i,this.buffer=l,this.bufferBase=s,this.curContext=f,this.lookAhead=c,this.parent=d}toString(){return`[${this.stack.filter((e,n)=>n%3==0).concat(this.state)}]@${this.pos}${this.score?"!"+this.score:""}`}static start(e,n,r=0){let o=e.parser.context;return new t(e,[],n,r,r,0,[],0,o?new id(o,o.start):null,0,null)}get context(){return this.curContext?this.curContext.context:null}pushState(e,n){this.stack.push(this.state,n,this.bufferBase+this.buffer.length),this.state=e}reduce(e){var n;let r=e>>19,o=e&65535,{parser:a}=this.p,i=this.reducePos<this.pos-25&&this.setLookAhead(this.pos),l=a.dynamicPrecedence(o);if(l&&(this.score+=l),r==0){o<a.minRepeatTerm&&this.reducePos<this.pos&&(this.reducePos=this.pos),this.pushState(a.getGoto(this.state,o,!0),this.reducePos),o<a.minRepeatTerm&&this.storeNode(o,this.reducePos,this.reducePos,i?8:4,!0),this.reduceContext(o,this.reducePos);return}let s=this.stack.length-(r-1)*3-(e&262144?6:0),f=s?this.stack[s-2]:this.p.ranges[0].from;o<a.minRepeatTerm&&f==this.reducePos&&this.reducePos<this.pos&&(this.reducePos=this.pos);let c=this.reducePos-f;c>=2e3&&!(!((n=this.p.parser.nodeSet.types[o])===null||n===void 0)&&n.isAnonymous)&&(f==this.p.lastBigReductionStart?(this.p.bigReductionCount++,this.p.lastBigReductionSize=c):this.p.lastBigReductionSize<c&&(this.p.bigReductionCount=1,this.p.lastBigReductionStart=f,this.p.lastBigReductionSize=c));let d=s?this.stack[s-1]:0,u=this.bufferBase+this.buffer.length-d;if(o<a.minRepeatTerm||e&131072){let p=a.stateFlag(this.state,1)?this.pos:this.reducePos;this.storeNode(o,f,p,u+4,!0)}if(e&262144)this.state=this.stack[s];else{let p=this.stack[s-3];this.state=a.getGoto(p,o,!0)}for(;this.stack.length>s;)this.stack.pop();this.reduceContext(o,f)}storeNode(e,n,r,o=4,a=!1){if(e==0&&(!this.stack.length||this.stack[this.stack.length-1]<this.buffer.length+this.bufferBase)){let i=this.buffer.length;if(i>0&&this.buffer[i-4]==0&&this.buffer[i-1]>-1){if(n==r)return;if(this.buffer[i-2]>=n){this.buffer[i-2]=r;return}}}if(!a||this.pos==r)this.buffer.push(e,n,r,o);else{let i=this.buffer.length;if(i>0&&(this.buffer[i-4]!=0||this.buffer[i-1]<0)){let l=!1;for(let s=i;s>0&&this.buffer[s-2]>r;s-=4)if(this.buffer[s-1]>=0){l=!0;break}if(l)for(;i>0&&this.buffer[i-2]>r;)this.buffer[i]=this.buffer[i-4],this.buffer[i+1]=this.buffer[i-3],this.buffer[i+2]=this.buffer[i-2],this.buffer[i+3]=this.buffer[i-1],i-=4,o>4&&(o-=4)}this.buffer[i]=e,this.buffer[i+1]=n,this.buffer[i+2]=r,this.buffer[i+3]=o}}shift(e,n,r,o){if(e&131072)this.pushState(e&65535,this.pos);else if((e&262144)==0){let a=e,{parser:i}=this.p;this.pos=o;let l=i.stateFlag(a,1);!l&&(o>r||n<=i.maxNode)&&(this.reducePos=o),this.pushState(a,l?r:Math.min(r,this.reducePos)),this.shiftContext(n,r),n<=i.maxNode&&this.buffer.push(n,r,o,4)}else this.pos=o,this.shiftContext(n,r),n<=this.p.parser.maxNode&&this.buffer.push(n,r,o,4)}apply(e,n,r,o){e&65536?this.reduce(e):this.shift(e,n,r,o)}useNode(e,n,r){let o=this.p.reused.length-1;(o<0||this.p.reused[o]!=e)&&(this.p.reused.push(e),o++);let a=this.reducePos=this.pos=r+e.length;this.pushState(n,r),this.buffer.push(o,r,a,-1),this.curContext&&this.updateContext(this.curContext.tracker.reuse(this.curContext.context,e,this,this.p.stream.reset(this.pos-e.length)))}split(){let e=this,n=e.buffer.length;for(n&&e.buffer[n-4]==0&&(n-=4);n>0&&e.buffer[n-2]>e.reducePos;)n-=4;let r=e.buffer.slice(n),o=e.bufferBase+n;for(;e&&o==e.bufferBase;)e=e.parent;return new t(this.p,this.stack.slice(),this.state,this.reducePos,this.pos,this.score,r,o,this.curContext,this.lookAhead,e)}recoverByDelete(e,n){let r=e<=this.p.parser.maxNode;r&&this.storeNode(e,this.pos,n,4),this.storeNode(0,this.pos,n,r?8:4),this.pos=this.reducePos=n,this.score-=190}canShift(e){for(let n=new ly(this);;){let r=this.p.parser.stateSlot(n.state,4)||this.p.parser.hasAction(n.state,e);if(r==0)return!1;if((r&65536)==0)return!0;n.reduce(r)}}recoverByInsert(e){if(this.stack.length>=300)return[];let n=this.p.parser.nextStates(this.state);if(n.length>8||this.stack.length>=120){let o=[];for(let a=0,i;a<n.length;a+=2)(i=n[a+1])!=this.state&&this.p.parser.hasAction(i,e)&&o.push(n[a],i);if(this.stack.length<120)for(let a=0;o.length<8&&a<n.length;a+=2){let i=n[a+1];o.some((l,s)=>s&1&&l==i)||o.push(n[a],i)}n=o}let r=[];for(let o=0;o<n.length&&r.length<4;o+=2){let a=n[o+1];if(a==this.state)continue;let i=this.split();i.pushState(a,this.pos),i.storeNode(0,i.pos,i.pos,4,!0),i.shiftContext(n[o],this.pos),i.reducePos=this.pos,i.score-=200,r.push(i)}return r}forceReduce(){let{parser:e}=this.p,n=e.stateSlot(this.state,5);if((n&65536)==0)return!1;if(!e.validAction(this.state,n)){let r=n>>19,o=n&65535,a=this.stack.length-r*3;if(a<0||e.getGoto(this.stack[a],o,!1)<0){let i=this.findForcedReduction();if(i==null)return!1;n=i}this.storeNode(0,this.pos,this.pos,4,!0),this.score-=100}return this.reducePos=this.pos,this.reduce(n),!0}findForcedReduction(){let{parser:e}=this.p,n=[],r=(o,a)=>{if(!n.includes(o))return n.push(o),e.allActions(o,i=>{if(!(i&393216))if(i&65536){let l=(i>>19)-a;if(l>1){let s=i&65535,f=this.stack.length-l*3;if(f>=0&&e.getGoto(this.stack[f],s,!1)>=0)return l<<19|65536|s}}else{let l=r(i,a+1);if(l!=null)return l}})};return r(this.state,0)}forceAll(){for(;!this.p.parser.stateFlag(this.state,2);)if(!this.forceReduce()){this.storeNode(0,this.pos,this.pos,4,!0);break}return this}get deadEnd(){if(this.stack.length!=3)return!1;let{parser:e}=this.p;return e.data[e.stateSlot(this.state,1)]==65535&&!e.stateSlot(this.state,4)}restart(){this.storeNode(0,this.pos,this.pos,4,!0),this.state=this.stack[0],this.stack.length=0}sameState(e){if(this.state!=e.state||this.stack.length!=e.stack.length)return!1;for(let n=0;n<this.stack.length;n+=3)if(this.stack[n]!=e.stack[n])return!1;return!0}get parser(){return this.p.parser}dialectEnabled(e){return this.p.parser.dialect.flags[e]}shiftContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.shift(this.curContext.context,e,this,this.p.stream.reset(n)))}reduceContext(e,n){this.curContext&&this.updateContext(this.curContext.tracker.reduce(this.curContext.context,e,this,this.p.stream.reset(n)))}emitContext(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-3)&&this.storeNode(this.curContext.hash,this.reducePos,this.reducePos,-3,!0)}emitLookAhead(){let e=this.buffer.length-1;(e<0||this.buffer[e]!=-4)&&this.buffer.push(this.lookAhead,this.pos,this.pos,-4)}updateContext(e){if(e!=this.curContext.context){let n=new id(this.curContext.tracker,e);n.hash!=this.curContext.hash&&this.emitContext(),this.curContext=n}}setLookAhead(e){return e<=this.lookAhead?!1:(this.emitLookAhead(),this.lookAhead=e,!0)}close(){this.curContext&&this.curContext.tracker.strict&&this.emitContext(),this.lookAhead>0&&this.emitLookAhead()}},id=class{constructor(e,n){this.tracker=e,this.context=n,this.hash=e.strict?e.hash(n):0}},ly=class{constructor(e){this.start=e,this.state=e.state,this.stack=e.stack,this.base=this.stack.length}reduce(e){let n=e&65535,r=e>>19;r==0?(this.stack==this.start.stack&&(this.stack=this.stack.slice()),this.stack.push(this.state,0,0),this.base+=3):this.base-=(r-1)*3;let o=this.start.p.parser.getGoto(this.stack[this.base-3],n,!0);this.state=o}},sy=class t{constructor(e,n,r){this.stack=e,this.pos=n,this.index=r,this.buffer=e.buffer,this.index==0&&this.maybeNext()}static create(e,n=e.bufferBase+e.buffer.length){return new t(e,n,n-e.bufferBase)}maybeNext(){let e=this.stack.parent;e!=null&&(this.index=this.stack.bufferBase-e.bufferBase,this.stack=e,this.buffer=e.buffer)}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}next(){this.index-=4,this.pos-=4,this.index==0&&this.maybeNext()}fork(){return new t(this.stack,this.pos,this.index)}};el=class{constructor(){this.start=-1,this.value=-1,this.end=-1,this.extended=-1,this.lookAhead=0,this.mask=0,this.context=0}},KC=new el,fy=class{constructor(e,n){this.input=e,this.ranges=n,this.chunk="",this.chunkOff=0,this.chunk2="",this.chunk2Pos=0,this.next=-1,this.token=KC,this.rangeIndex=0,this.pos=this.chunkPos=n[0].from,this.range=n[0],this.end=n[n.length-1].to,this.readNext()}resolveOffset(e,n){let r=this.range,o=this.rangeIndex,a=this.pos+e;for(;a<r.from;){if(!o)return null;let i=this.ranges[--o];a-=r.from-i.to,r=i}for(;n<0?a>r.to:a>=r.to;){if(o==this.ranges.length-1)return null;let i=this.ranges[++o];a+=i.from-r.to,r=i}return a}clipPos(e){if(e>=this.range.from&&e<this.range.to)return e;for(let n of this.ranges)if(n.to>e)return Math.max(e,n.from);return this.end}peek(e){let n=this.chunkOff+e,r,o;if(n>=0&&n<this.chunk.length)r=this.pos+e,o=this.chunk.charCodeAt(n);else{let a=this.resolveOffset(e,1);if(a==null)return-1;if(r=a,r>=this.chunk2Pos&&r<this.chunk2Pos+this.chunk2.length)o=this.chunk2.charCodeAt(r-this.chunk2Pos);else{let i=this.rangeIndex,l=this.range;for(;l.to<=r;)l=this.ranges[++i];this.chunk2=this.input.chunk(this.chunk2Pos=r),r+this.chunk2.length>l.to&&(this.chunk2=this.chunk2.slice(0,l.to-r)),o=this.chunk2.charCodeAt(0)}}return r>=this.token.lookAhead&&(this.token.lookAhead=r+1),o}acceptToken(e,n=0){let r=n?this.resolveOffset(n,-1):this.pos;if(r==null||r<this.token.start)throw new RangeError("Token end out of bounds");this.token.value=e,this.token.end=r}acceptTokenTo(e,n){this.token.value=e,this.token.end=n}getChunk(){if(this.pos>=this.chunk2Pos&&this.pos<this.chunk2Pos+this.chunk2.length){let{chunk:e,chunkPos:n}=this;this.chunk=this.chunk2,this.chunkPos=this.chunk2Pos,this.chunk2=e,this.chunk2Pos=n,this.chunkOff=this.pos-this.chunkPos}else{this.chunk2=this.chunk,this.chunk2Pos=this.chunkPos;let e=this.input.chunk(this.pos),n=this.pos+e.length;this.chunk=n>this.range.to?e.slice(0,this.range.to-this.pos):e,this.chunkPos=this.pos,this.chunkOff=0}}readNext(){return this.chunkOff>=this.chunk.length&&(this.getChunk(),this.chunkOff==this.chunk.length)?this.next=-1:this.next=this.chunk.charCodeAt(this.chunkOff)}advance(e=1){for(this.chunkOff+=e;this.pos+e>=this.range.to;){if(this.rangeIndex==this.ranges.length-1)return this.setDone();e-=this.range.to-this.pos,this.range=this.ranges[++this.rangeIndex],this.pos=this.range.from}return this.pos+=e,this.pos>=this.token.lookAhead&&(this.token.lookAhead=this.pos+1),this.readNext()}setDone(){return this.pos=this.chunkPos=this.end,this.range=this.ranges[this.rangeIndex=this.ranges.length-1],this.chunk="",this.next=-1}reset(e,n){if(n?(this.token=n,n.start=e,n.lookAhead=e+1,n.value=n.extended=-1):this.token=KC,this.pos!=e){if(this.pos=e,e==this.end)return this.setDone(),this;for(;e<this.range.from;)this.range=this.ranges[--this.rangeIndex];for(;e>=this.range.to;)this.range=this.ranges[++this.rangeIndex];e>=this.chunkPos&&e<this.chunkPos+this.chunk.length?this.chunkOff=e-this.chunkPos:(this.chunk="",this.chunkOff=0),this.readNext()}return this}read(e,n){if(e>=this.chunkPos&&n<=this.chunkPos+this.chunk.length)return this.chunk.slice(e-this.chunkPos,n-this.chunkPos);if(e>=this.chunk2Pos&&n<=this.chunk2Pos+this.chunk2.length)return this.chunk2.slice(e-this.chunk2Pos,n-this.chunk2Pos);if(e>=this.range.from&&n<=this.range.to)return this.input.read(e,n);let r="";for(let o of this.ranges){if(o.from>=n)break;o.to>e&&(r+=this.input.read(Math.max(o.from,e),Math.min(o.to,n)))}return r}},ko=class{constructor(e,n){this.data=e,this.id=n}token(e,n){let{parser:r}=n.p;e2(this.data,e,n,this.id,r.data,r.tokenPrecTable)}};ko.prototype.contextual=ko.prototype.fallback=ko.prototype.extend=!1;cy=class{constructor(e,n,r){this.precTable=n,this.elseToken=r,this.data=typeof e=="string"?of(e):e}token(e,n){let r=e.pos,o=0;for(;;){let a=e.next<0,i=e.resolveOffset(1,1);if(e2(this.data,e,n,0,this.data,this.precTable),e.token.value>-1)break;if(this.elseToken==null)return;if(a||o++,i==null)break;e.reset(i,e.token)}o&&(e.reset(r,e.token),e.acceptToken(this.elseToken,o))}};cy.prototype.contextual=ko.prototype.fallback=ko.prototype.extend=!1;ld=class{constructor(e,n={}){this.token=e,this.contextual=!!n.contextual,this.fallback=!!n.fallback,this.extend=!!n.extend}};$t=typeof process<"u"&&process.env&&/\bparse\b/.test(process.env.LOG),ay=null;uy=class{constructor(e,n){this.fragments=e,this.minRepeat=n,this.i=0,this.fragment=null,this.safeFrom=-1,this.safeTo=-1,this.trees=[],this.start=[],this.index=[],this.lastRepeat=null,this.lastRepeatPos=-1,this.nextFragment()}nextFragment(){let e=this.fragment=this.i==this.fragments.length?null:this.fragments[this.i++];if(e){for(this.safeFrom=e.openStart?JC(e.tree,e.from+e.offset,1)-e.offset:e.from,this.safeTo=e.openEnd?JC(e.tree,e.to+e.offset,-1)-e.offset:e.to;this.trees.length;)this.trees.pop(),this.start.pop(),this.index.pop();this.trees.push(e.tree),this.start.push(-e.offset),this.index.push(0),this.nextStart=this.safeFrom}else this.nextStart=1e9}nodeAt(e){if(e<this.nextStart)return null;for(;this.fragment&&this.safeTo<=e;)this.nextFragment();if(!this.fragment)return null;for(;;){let n=this.trees.length-1;if(n<0)return this.nextFragment(),null;let r=this.trees[n],o=this.index[n];if(o==r.children.length){this.trees.pop(),this.start.pop(),this.index.pop();continue}let a=r.children[o],i=this.start[n]+r.positions[o];if(i>e)return this.nextStart=i,null;if(a instanceof _e){let l=i>this.lastRepeatPos&&a.type.id>=this.minRepeat;if(i==e||l){let s=i+a.length,f;if(i>=this.safeFrom&&s<=this.safeTo&&(!(f=a.prop(V.lookAhead))||s+f<this.fragment.to)){if(l&&(this.lastRepeat=a,this.lastRepeatPos=i),i==e)return a}else if(i==e)return null}this.index[n]++,i+a.length>=Math.max(this.safeFrom,e)&&(this.trees.push(a),this.start.push(i),this.index.push(0))}else this.index[n]++,this.nextStart=i+a.length}}},dy=class{constructor(e,n){this.stream=n,this.tokens=[],this.mainToken=null,this.actions=[],this.tokens=e.tokenizers.map(r=>new el)}getActions(e){let n=0,r=null,{parser:o}=e.p,{tokenizers:a}=o,i=o.stateSlot(e.state,3),l=e.curContext?e.curContext.hash:0,s=0;for(let f=0;f<a.length;f++){if((1<<f&i)==0)continue;let c=a[f],d=this.tokens[f];if(!(r&&!c.fallback)&&((c.contextual||d.start!=e.pos||d.mask!=i||d.context!=l)&&(this.updateCachedToken(d,c,e),d.mask=i,d.context=l),d.lookAhead>d.end+25&&(s=Math.max(d.lookAhead,s)),d.value!=0)){let u=n;if(d.extended>-1&&(n=this.addActions(e,d.extended,d.end,n)),n=this.addActions(e,d.value,d.end,n),!c.extend&&(r=d,n>u))break}}for(;this.actions.length>n;)this.actions.pop();return s&&e.setLookAhead(s),!r&&e.pos==this.stream.end&&(r=new el,r.value=e.p.parser.eofTerm,r.start=r.end=e.pos,n=this.addActions(e,r.value,r.end,n)),this.mainToken=r,this.actions}getMainToken(e){if(this.mainToken)return this.mainToken;let n=new el,{pos:r,p:o}=e;return n.start=r,n.end=Math.min(r+1,o.stream.end),n.value=r==o.stream.end?o.parser.eofTerm:0,n}updateCachedToken(e,n,r){let o=this.stream.clipPos(r.pos);if(n.token(this.stream.reset(o,e),r),e.value>-1){let{parser:a}=r.p;for(let i=0;i<a.specialized.length;i++)if(a.specialized[i]==e.value){let l=a.specializers[i](this.stream.read(e.start,e.end),r);if(l>=0&&r.p.parser.dialect.allows(l>>1)){(l&1)==0?e.value=l>>1:e.extended=l>>1;break}}}else e.value=0,e.end=this.stream.clipPos(o+1)}putAction(e,n,r,o){for(let a=0;a<o;a+=3)if(this.actions[a]==e)return o;return this.actions[o++]=e,this.actions[o++]=n,this.actions[o++]=r,o}addActions(e,n,r,o){let{state:a}=e,{parser:i}=e.p,{data:l}=i;for(let s=0;s<2;s++)for(let f=i.stateSlot(a,s?2:1);;f+=3){if(l[f]==65535)if(l[f+1]==1)f=Rr(l,f+2);else{o==0&&l[f+1]==2&&(o=this.putAction(Rr(l,f+2),n,r,o));break}l[f]==n&&(o=this.putAction(Rr(l,f+1),n,r,o))}return o}},py=class{constructor(e,n,r,o){this.parser=e,this.input=n,this.ranges=o,this.recovering=0,this.nextStackID=9812,this.minStackPos=0,this.reused=[],this.stoppedAt=null,this.lastBigReductionStart=-1,this.lastBigReductionSize=0,this.bigReductionCount=0,this.stream=new fy(n,o),this.tokens=new dy(e,this.stream),this.topTerm=e.top[1];let{from:a}=o[0];this.stacks=[iy.start(this,e.top[0],a)],this.fragments=r.length&&this.stream.end-a>e.bufferLength*4?new uy(r,e.minRepeatTerm):null}get parsedPos(){return this.minStackPos}advance(){let e=this.stacks,n=this.minStackPos,r=this.stacks=[],o,a;if(this.bigReductionCount>300&&e.length==1){let[i]=e;for(;i.forceReduce()&&i.stack.length&&i.stack[i.stack.length-2]>=this.lastBigReductionStart;);this.bigReductionCount=this.lastBigReductionSize=0}for(let i=0;i<e.length;i++){let l=e[i];for(;;){if(this.tokens.mainToken=null,l.pos>n)r.push(l);else{if(this.advanceStack(l,r,e))continue;{o||(o=[],a=[]),o.push(l);let s=this.tokens.getMainToken(l);a.push(s.value,s.end)}}break}}if(!r.length){let i=o&&TL(o);if(i)return $t&&console.log("Finish with "+this.stackID(i)),this.stackToTree(i);if(this.parser.strict)throw $t&&o&&console.log("Stuck with token "+(this.tokens.mainToken?this.parser.getName(this.tokens.mainToken.value):"none")),new SyntaxError("No parse at "+n);this.recovering||(this.recovering=5)}if(this.recovering&&o){let i=this.stoppedAt!=null&&o[0].pos>this.stoppedAt?o[0]:this.runRecovery(o,a,r);if(i)return $t&&console.log("Force-finish "+this.stackID(i)),this.stackToTree(i.forceAll())}if(this.recovering){let i=this.recovering==1?1:this.recovering*3;if(r.length>i)for(r.sort((l,s)=>s.score-l.score);r.length>i;)r.pop();r.some(l=>l.reducePos>n)&&this.recovering--}else if(r.length>1){e:for(let i=0;i<r.length-1;i++){let l=r[i];for(let s=i+1;s<r.length;s++){let f=r[s];if(l.sameState(f)||l.buffer.length>500&&f.buffer.length>500)if((l.score-f.score||l.buffer.length-f.buffer.length)>0)r.splice(s--,1);else{r.splice(i--,1);continue e}}}r.length>12&&(r.sort((i,l)=>l.score-i.score),r.splice(12,r.length-12))}this.minStackPos=r[0].pos;for(let i=1;i<r.length;i++)r[i].pos<this.minStackPos&&(this.minStackPos=r[i].pos);return null}stopAt(e){if(this.stoppedAt!=null&&this.stoppedAt<e)throw new RangeError("Can't move stoppedAt forward");this.stoppedAt=e}tryReuse(e,n,r,o){if(!r)return null;let a=e.curContext&&e.curContext.tracker.strict,i=a?e.curContext.hash:0;for(;r;){let l=this.parser.nodeSet.types[r.type.id]!=r.type?-1:this.parser.getGoto(e.state,r.type.id);if(l>-1&&r.length&&(!a||(r.prop(V.contextHash)||0)==i))return e.useNode(r,l,n),r;if(r.children.length==0||r.positions[0]>0)break;let s=r.children[0];if(s instanceof _e&&(!o||s.type.id>=this.parser.minRepeatTerm))r=s;else break}return null}advanceStack(e,n,r){let o=e.pos,{parser:a}=this,i=$t?this.stackID(e)+" -> ":"";if(this.stoppedAt!=null&&o>this.stoppedAt)return e.forceReduce()?e:null;if(this.fragments){let f=e.reducePos<o&&e.buffer.length&&e.buffer[e.buffer.length-2]<=e.reducePos&&this.fragments.lastRepeatPos==e.reducePos&&this.tryReuse(e,e.reducePos,this.fragments.lastRepeat,!0)||this.tryReuse(e,o,this.fragments.nodeAt(o),!1);if(f)return $t&&console.log(i+this.stackID(e)+` (via reuse of ${a.getName(f.type.id)})`),!0}let l=a.stateSlot(e.state,4);if(l>0)return e.reduce(l),$t&&console.log(i+this.stackID(e)+` (via always-reduce ${a.getName(l&65535)})`),!0;if(e.stack.length>=8400)for(;e.stack.length>6e3&&e.forceReduce(););let s=this.tokens.getActions(e);for(let f=0;f<s.length;){let c=s[f++],d=s[f++],u=s[f++],p=f==s.length||!r,m=p?e:e.split(),x=this.tokens.mainToken;if(m.apply(c,d,x?x.start:m.pos,u),$t&&console.log(i+this.stackID(m)+` (via ${(c&65536)==0?"shift":`reduce of ${a.getName(c&65535)}`} for ${a.getName(d)} @ ${o}${m==e?"":", split"})`),p)return!0;m.pos>o?n.push(m):r.push(m)}return!1}advanceFully(e,n){let r=e.pos;for(;;){if(!this.advanceStack(e,null,null))return!1;if(e.pos>r)return $C(e,n),!0}}runRecovery(e,n,r){let o=null,a=!1;for(let i=0;i<e.length;i++){let l=e[i],s=n[i<<1],f=n[(i<<1)+1],c=$t?this.stackID(l)+" -> ":"";if(l.deadEnd&&(a||(a=!0,l.restart(),$t&&console.log(c+this.stackID(l)+" (restarted)"),this.advanceFully(l,r))))continue;let d=l.split(),u=c;for(let p=0;p<10&&d.forceReduce()&&($t&&console.log(u+this.stackID(d)+" (via force-reduce)"),!this.advanceFully(d,r));p++)$t&&(u=this.stackID(d)+" -> ");for(let p of l.recoverByInsert(s))$t&&console.log(c+this.stackID(p)+" (via recover-insert)"),this.advanceFully(p,r);this.stream.end>l.pos?(f==l.pos&&(f++,s=0),l.recoverByDelete(s,f),$t&&console.log(c+this.stackID(l)+` (via recover-delete ${this.parser.getName(s)})`),$C(l,r)):(!o||o.score<d.score)&&(o=d)}return o}stackToTree(e){return e.close(),_e.build({buffer:sy.create(e),nodeSet:this.parser.nodeSet,topID:this.topTerm,maxBufferLength:this.parser.bufferLength,reused:this.reused,start:this.ranges[0].from,length:e.pos-this.ranges[0].from,minRepeatType:this.parser.minRepeatTerm})}stackID(e){let n=(ay||(ay=new WeakMap)).get(e);return n||ay.set(e,n=String.fromCodePoint(this.nextStackID++)),n+e}};my=class{constructor(e,n,r){this.source=e,this.flags=n,this.disabled=r}allows(e){return!this.disabled||this.disabled[e]==0}},sd=class t extends Mi{constructor(e){if(super(),this.wrappers=[],e.version!=14)throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);let n=e.nodeNames.split(" ");this.minRepeatTerm=n.length;for(let l=0;l<e.repeatNodeCount;l++)n.push("");let r=Object.keys(e.topRules).map(l=>e.topRules[l][1]),o=[];for(let l=0;l<n.length;l++)o.push([]);function a(l,s,f){o[l].push([s,s.deserialize(String(f))])}if(e.nodeProps)for(let l of e.nodeProps){let s=l[0];typeof s=="string"&&(s=V[s]);for(let f=1;f<l.length;){let c=l[f++];if(c>=0)a(c,s,l[f++]);else{let d=l[f+-c];for(let u=-c;u>0;u--)a(l[f++],s,d);f++}}}this.nodeSet=new Ss(n.map((l,s)=>ft.define({name:s>=this.minRepeatTerm?void 0:l,id:s,props:o[s],top:r.indexOf(s)>-1,error:s==0,skipped:e.skippedNodes&&e.skippedNodes.indexOf(s)>-1}))),e.propSources&&(this.nodeSet=this.nodeSet.extend(...e.propSources)),this.strict=!1,this.bufferLength=1024;let i=of(e.tokenData);this.context=e.context,this.specializerSpecs=e.specialized||[],this.specialized=new Uint16Array(this.specializerSpecs.length);for(let l=0;l<this.specializerSpecs.length;l++)this.specialized[l]=this.specializerSpecs[l].term;this.specializers=this.specializerSpecs.map(ZC),this.states=of(e.states,Uint32Array),this.data=of(e.stateData),this.goto=of(e.goto),this.maxTerm=e.maxTerm,this.tokenizers=e.tokenizers.map(l=>typeof l=="number"?new ko(i,l):l),this.topRules=e.topRules,this.dialects=e.dialects||{},this.dynamicPrecedences=e.dynamicPrecedences||null,this.tokenPrecTable=e.tokenPrec,this.termNames=e.termNames||null,this.maxNode=this.nodeSet.types.length-1,this.dialect=this.parseDialect(),this.top=this.topRules[Object.keys(this.topRules)[0]]}createParse(e,n,r){let o=new py(this,e,n,r);for(let a of this.wrappers)o=a(o,e,n,r);return o}getGoto(e,n,r=!1){let o=this.goto;if(n>=o[0])return-1;for(let a=o[n+1];;){let i=o[a++],l=i&1,s=o[a++];if(l&&r)return s;for(let f=a+(i>>1);a<f;a++)if(o[a]==e)return s;if(l)return-1}}hasAction(e,n){let r=this.data;for(let o=0;o<2;o++)for(let a=this.stateSlot(e,o?2:1),i;;a+=3){if((i=r[a])==65535)if(r[a+1]==1)i=r[a=Rr(r,a+2)];else{if(r[a+1]==2)return Rr(r,a+2);break}if(i==n||i==0)return Rr(r,a+1)}return 0}stateSlot(e,n){return this.states[e*6+n]}stateFlag(e,n){return(this.stateSlot(e,0)&n)>0}validAction(e,n){return!!this.allActions(e,r=>r==n?!0:null)}allActions(e,n){let r=this.stateSlot(e,4),o=r?n(r):void 0;for(let a=this.stateSlot(e,1);o==null;a+=3){if(this.data[a]==65535)if(this.data[a+1]==1)a=Rr(this.data,a+2);else break;o=n(Rr(this.data,a+1))}return o}nextStates(e){let n=[];for(let r=this.stateSlot(e,1);;r+=3){if(this.data[r]==65535)if(this.data[r+1]==1)r=Rr(this.data,r+2);else break;if((this.data[r+2]&1)==0){let o=this.data[r+1];n.some((a,i)=>i&1&&a==o)||n.push(this.data[r],o)}}return n}configure(e){let n=Object.assign(Object.create(t.prototype),this);if(e.props&&(n.nodeSet=this.nodeSet.extend(...e.props)),e.top){let r=this.topRules[e.top];if(!r)throw new RangeError(`Invalid top rule name ${e.top}`);n.top=r}return e.tokenizers&&(n.tokenizers=this.tokenizers.map(r=>{let o=e.tokenizers.find(a=>a.from==r);return o?o.to:r})),e.specializers&&(n.specializers=this.specializers.slice(),n.specializerSpecs=this.specializerSpecs.map((r,o)=>{let a=e.specializers.find(l=>l.from==r.external);if(!a)return r;let i=Object.assign(Object.assign({},r),{external:a.to});return n.specializers[o]=ZC(i),i})),e.contextTracker&&(n.context=e.contextTracker),e.dialect&&(n.dialect=this.parseDialect(e.dialect)),e.strict!=null&&(n.strict=e.strict),e.wrap&&(n.wrappers=n.wrappers.concat(e.wrap)),e.bufferLength!=null&&(n.bufferLength=e.bufferLength),n}hasWrappers(){return this.wrappers.length>0}getName(e){return this.termNames?this.termNames[e]:String(e<=this.maxNode&&this.nodeSet.types[e].name||e)}get eofTerm(){return this.maxNode+1}get topNode(){return this.nodeSet.types[this.top[1]]}dynamicPrecedence(e){let n=this.dynamicPrecedences;return n==null?0:n[e]||0}parseDialect(e){let n=Object.keys(this.dialects),r=n.map(()=>!1);if(e)for(let a of e.split(" ")){let i=n.indexOf(a);i>=0&&(r[i]=!0)}let o=null;for(let a=0;a<n.length;a++)if(!r[a])for(let i=this.dialects[n[a]],l;(l=this.data[i++])!=65535;)(o||(o=new Uint8Array(this.maxTerm+1)))[l]=1;return new my(e,r,o)}static deserialize(e){return new t(e)}}});function n2(t){let e=Object.keys(t).join(""),n=/\w/.test(e);return n&&(e=e.replace(/\w/g,"")),`[${n?"\\w":""}${e.replace(/[^\w\s]/g,"\\$&")}]`}function ML(t){let e=Object.create(null),n=Object.create(null);for(let{label:o}of t){e[o[0]]=!0;for(let a=1;a<o.length;a++)n[o[a]]=!0}let r=n2(e)+n2(n)+"*$";return[new RegExp("^"+r),new RegExp(r)]}function Sy(t){let e=t.map(o=>typeof o=="string"?{label:o}:o),[n,r]=e.every(o=>/^\w+$/.test(o.label))?[/\w*$/,/\w+$/]:ML(e);return o=>{let a=o.matchBefore(r);return a||o.explicit?{from:a?a.from:o.pos,options:e,validFor:n}:null}}function l2(t,e){return n=>{for(let r=dt(n.state).resolveInner(n.pos,-1);r;r=r.parent){if(t.indexOf(r.name)>-1)return null;if(r.type.isTop)break}return e(n)}}function ba(t){return t.selection.main.from}function s2(t,e){var n;let{source:r}=t,o=e&&r[0]!="^",a=r[r.length-1]!="$";return!o&&!a?t:new RegExp(`${o?"^":""}(?:${r})${a?"$":""}`,(n=t.flags)!==null&&n!==void 0?n:t.ignoreCase?"i":"")}function DL(t,e,n,r){let{main:o}=t.selection,a=n-o.from,i=r-o.from;return{...t.changeByRange(l=>{if(l!=o&&n!=r&&t.sliceDoc(l.from+a,l.from+i)!=t.sliceDoc(n,r))return{range:l};let s=t.toText(e);return{changes:{from:l.from+a,to:r==o.from?l.to:l.from+i,insert:s},range:O.cursor(l.from+a+s.length)}}),scrollIntoView:!0,userEvent:"input.complete"}}function OL(t){if(!Array.isArray(t))return t;let e=r2.get(t);return e||r2.set(t,e=Sy(t)),e}function o2(t,e){return t?e?t+" "+e:t:e}function BL(t,e,n,r,o,a){let i=t.textDirection==me.RTL,l=i,s=!1,f="top",c,d,u=e.left-o.left,p=o.right-e.right,m=r.right-r.left,x=r.bottom-r.top;if(l&&u<Math.min(m,p)?l=!1:!l&&p<Math.min(m,u)&&(l=!0),m<=(l?u:p))c=Math.max(o.top,Math.min(n.top,o.bottom-x))-e.top,d=Math.min(400,l?u:p);else{s=!0,d=Math.min(400,(i?e.right:o.right-e.left)-30);let y=o.bottom-e.bottom;y>=x||y>e.top?c=n.bottom-e.top:(f="bottom",c=e.bottom-n.top)}let b=(e.bottom-e.top)/a.offsetHeight,h=(e.right-e.left)/a.offsetWidth;return{style:`${f}: ${c/b}px; max-width: ${d/h}px`,class:"cm-completionInfo-"+(s?i?"left-narrow":"right-narrow":l?"left":"right")}}function RL(t){let e=t.addToOptions.slice();return t.icons&&e.push({render(n){let r=document.createElement("div");return r.classList.add("cm-completionIcon"),n.type&&r.classList.add(...n.type.split(/\s+/g).map(o=>"cm-completionIcon-"+o)),r.setAttribute("aria-hidden","true"),r},position:20}),e.push({render(n,r,o,a){let i=document.createElement("span");i.className="cm-completionLabel";let l=n.displayLabel||n.label,s=0;for(let f=0;f<a.length;){let c=a[f++],d=a[f++];c>s&&i.appendChild(document.createTextNode(l.slice(s,c)));let u=i.appendChild(document.createElement("span"));u.appendChild(document.createTextNode(l.slice(c,d))),u.className="cm-completionMatchedText",s=d}return s<l.length&&i.appendChild(document.createTextNode(l.slice(s))),i},position:50},{render(n){if(!n.detail)return null;let r=document.createElement("span");return r.className="cm-completionDetail",r.textContent=n.detail,r},position:80}),e.sort((n,r)=>n.position-r.position).map(n=>n.render)}function hy(t,e,n){if(t<=n)return{from:0,to:t};if(e<0&&(e=0),e<=t>>1){let o=Math.floor(e/n);return{from:o*n,to:(o+1)*n}}let r=Math.ceil((t-e)/n);return{from:t-r*n,to:t-(r-1)*n}}function EL(t,e){return n=>new by(n,t,e)}function FL(t,e){let n=t.getBoundingClientRect(),r=e.getBoundingClientRect(),o=n.height/t.offsetHeight;r.top<n.top?t.scrollTop-=(n.top-r.top)/o:r.bottom>n.bottom&&(t.scrollTop+=(r.bottom-n.bottom)/o)}function a2(t){return(t.boost||0)*100+(t.apply?10:0)+(t.info?5:0)+(t.type?1:0)}function LL(t,e){let n=[],r=null,o=null,a=c=>{n.push(c);let{section:d}=c.completion;if(d){r||(r=[]);let u=typeof d=="string"?d:d.name;r.some(p=>p.name==u)||r.push(typeof d=="string"?{name:u}:d)}},i=e.facet(Ze);for(let c of t)if(c.hasResult()){let d=c.result.getMatch;if(c.result.filter===!1)for(let u of c.result.options)a(new ud(u,c.source,d?d(u):[],1e9-n.length));else{let u=e.sliceDoc(c.from,c.to),p,m=i.filterStrict?new yy(u):new gy(u);for(let x of c.result.options)if(p=m.match(x.label)){let b=x.displayLabel?d?d(x,p.matched):[]:p.matched,h=p.score+(x.boost||0);if(a(new ud(x,c.source,b,h)),typeof x.section=="object"&&x.section.rank==="dynamic"){let{name:y}=x.section;o||(o=Object.create(null)),o[y]=Math.max(h,o[y]||-1e9)}}}}if(r){let c=Object.create(null),d=0,u=(p,m)=>(p.rank==="dynamic"&&m.rank==="dynamic"?o[m.name]-o[p.name]:0)||(typeof p.rank=="number"?p.rank:1e9)-(typeof m.rank=="number"?m.rank:1e9)||(p.name<m.name?-1:1);for(let p of r.sort(u))d-=1e5,c[p.name]=d;for(let p of n){let{section:m}=p.completion;m&&(p.score+=c[typeof m=="string"?m:m.name])}}let l=[],s=null,f=i.compareCompletions;for(let c of n.sort((d,u)=>u.score-d.score||f(d.completion,u.completion))){let d=c.completion;!s||s.label!=d.label||s.detail!=d.detail||s.type!=null&&d.type!=null&&s.type!=d.type||s.apply!=d.apply||s.boost!=d.boost?l.push(c):a2(c.completion)>a2(s)&&(l[l.length-1]=c),s=c.completion}return l}function NL(t,e){if(t==e)return!0;for(let n=0,r=0;;){for(;n<t.length&&!t[n].hasResult();)n++;for(;r<e.length&&!e[r].hasResult();)r++;let o=n==t.length,a=r==e.length;if(o||a)return o==a;if(t[n++].result!=e[r++].result)return!1}}function i2(t,e){let n={"aria-autocomplete":"list","aria-haspopup":"listbox","aria-controls":t};return e>-1&&(n["aria-activedescendant"]=t+"-"+e),n}function c2(t,e){if(t.isUserEvent("input.complete")){let r=t.annotation(f2);if(r&&e.activateOnCompletion(r))return 12}let n=t.isUserEvent("input.type");return n&&e.activateOnTyping?5:n?1:t.isUserEvent("delete.backward")?2:t.selection?8:t.docChanged?16:0}function zL(t,e,n,r){if(!t)return!1;let o=e.sliceDoc(n,r);return typeof t=="function"?t(o,n,r,e):s2(t,!0).test(o)}function Ay(t,e){let n=e.completion.apply||e.completion.label,r=t.state.field(Lt).active.find(o=>o.source==e.source);return r instanceof pd?(typeof n=="string"?t.dispatch({...DL(t.state,n,r.from,r.to),annotations:f2.of(e.completion)}):n(t,e.completion,r.from,r.to),!0):!1}function fd(t,e="option"){return n=>{let r=n.state.field(Lt,!1);if(!r||!r.open||r.open.disabled||Date.now()-r.open.timestamp<n.state.facet(Ze).interactionDelay)return!1;let o=1,a;e=="page"&&(a=zg(n,r.open.tooltip))&&(o=Math.max(2,Math.floor(a.dom.offsetHeight/a.dom.querySelector("li").offsetHeight)-1));let{length:i}=r.open.options,l=r.open.selected>-1?r.open.selected+o*(t?1:-1):t?0:i-1;return l<0?l=e=="page"?0:i-1:l>=i&&(l=e=="page"?i-1:0),n.dispatch({effects:ky.of(l)}),!0}}function d2(t={}){return[WL,Lt,Ze.of(t),XL,YL,KL]}var cd,ud,f2,r2,dd,af,gy,yy,Ze,ky,by,Iy,vy,qL,_L,PL,Er,pd,Cy,Lt,HL,UL,xy,jL,wy,VL,GL,XL,QL,WL,KL,u2,Q_,Ty,YL,My=E(()=>{Li();Ys();rf();cd=class{constructor(e,n,r,o){this.state=e,this.pos=n,this.explicit=r,this.view=o,this.abortListeners=[],this.abortOnDocChange=!1}tokenBefore(e){let n=dt(this.state).resolveInner(this.pos,-1);for(;n&&e.indexOf(n.name)<0;)n=n.parent;return n?{from:n.from,to:this.pos,text:this.state.sliceDoc(n.from,this.pos),type:n.type}:null}matchBefore(e){let n=this.state.doc.lineAt(this.pos),r=Math.max(n.from,this.pos-250),o=n.text.slice(r-n.from,this.pos-n.from),a=o.search(s2(e,!1));return a<0?null:{from:r+a,to:this.pos,text:o.slice(a)}}get aborted(){return this.abortListeners==null}addEventListener(e,n,r){e=="abort"&&this.abortListeners&&(this.abortListeners.push(n),r&&r.onDocChange&&(this.abortOnDocChange=!0))}};ud=class{constructor(e,n,r,o){this.completion=e,this.source=n,this.match=r,this.score=o}};f2=Bt.define();r2=new WeakMap;dd=ae.define(),af=ae.define(),gy=class{constructor(e){this.pattern=e,this.chars=[],this.folded=[],this.any=[],this.precise=[],this.byWord=[],this.score=0,this.matched=[];for(let n=0;n<e.length;){let r=Ar(e,n),o=xo(r);this.chars.push(r);let a=e.slice(n,n+o),i=a.toUpperCase();this.folded.push(Ar(i==a?a.toLowerCase():i,0)),n+=o}this.astral=e.length!=this.chars.length}ret(e,n){return this.score=e,this.matched=n,this}match(e){if(this.pattern.length==0)return this.ret(-100,[]);if(e.length<this.pattern.length)return null;let{chars:n,folded:r,any:o,precise:a,byWord:i}=this;if(n.length==1){let y=Ar(e,0),g=xo(y),I=g==e.length?0:-100;if(y!=n[0])if(y==r[0])I+=-200;else return null;return this.ret(I,[0,g])}let l=e.indexOf(this.pattern);if(l==0)return this.ret(e.length==this.pattern.length?0:-100,[0,this.pattern.length]);let s=n.length,f=0;if(l<0){for(let y=0,g=Math.min(e.length,200);y<g&&f<s;){let I=Ar(e,y);(I==n[f]||I==r[f])&&(o[f++]=y),y+=xo(I)}if(f<s)return null}let c=0,d=0,u=!1,p=0,m=-1,x=-1,b=/[a-z]/.test(e),h=!0;for(let y=0,g=Math.min(e.length,200),I=0;y<g&&d<s;){let v=Ar(e,y);l<0&&(c<s&&v==n[c]&&(a[c++]=y),p<s&&(v==n[p]||v==r[p]?(p==0&&(m=y),x=y+1,p++):p=0));let S,w=v<255?v>=48&&v<=57||v>=97&&v<=122?2:v>=65&&v<=90?1:0:(S=NS(v))!=S.toLowerCase()?1:S!=S.toUpperCase()?2:0;(!y||w==1&&b||I==0&&w!=0)&&(n[d]==v||r[d]==v&&(u=!0)?i[d++]=y:i.length&&(h=!1)),I=w,y+=xo(v)}return d==s&&i[0]==0&&h?this.result(-100+(u?-200:0),i,e):p==s&&m==0?this.ret(-200-e.length+(x==e.length?0:-100),[0,x]):l>-1?this.ret(-700-e.length,[l,l+this.pattern.length]):p==s?this.ret(-900-e.length,[m,x]):d==s?this.result(-100+(u?-200:0)+-700+(h?0:-1100),i,e):n.length==2?null:this.result((o[0]?-700:0)+-200+-1100,o,e)}result(e,n,r){let o=[],a=0;for(let i of n){let l=i+(this.astral?xo(Ar(r,i)):1);a&&o[a-1]==i?o[a-1]=l:(o[a++]=i,o[a++]=l)}return this.ret(e-r.length,o)}},yy=class{constructor(e){this.pattern=e,this.matched=[],this.score=0,this.folded=e.toLowerCase()}match(e){if(e.length<this.pattern.length)return null;let n=e.slice(0,this.pattern.length),r=n==this.pattern?0:n.toLowerCase()==this.folded?-200:null;return r==null?null:(this.matched=[0,n.length],this.score=r+(e.length==this.pattern.length?0:-100),this)}},Ze=z.define({combine(t){return go(t,{activateOnTyping:!0,activateOnCompletion:()=>!1,activateOnTypingDelay:100,selectOnOpen:!0,override:null,closeOnBlur:!0,maxRenderedOptions:100,defaultKeymap:!0,tooltipClass:()=>"",optionClass:()=>"",aboveCursor:!1,icons:!0,addToOptions:[],positionInfo:BL,filterStrict:!1,compareCompletions:(e,n)=>(e.sortText||e.label).localeCompare(n.sortText||n.label),interactionDelay:75,updateSyncTime:100},{defaultKeymap:(e,n)=>e&&n,closeOnBlur:(e,n)=>e&&n,icons:(e,n)=>e&&n,tooltipClass:(e,n)=>r=>o2(e(r),n(r)),optionClass:(e,n)=>r=>o2(e(r),n(r)),addToOptions:(e,n)=>e.concat(n),filterStrict:(e,n)=>e||n})}});ky=ae.define();by=class{constructor(e,n,r){this.view=e,this.stateField=n,this.applyCompletion=r,this.info=null,this.infoDestroy=null,this.placeInfoReq={read:()=>this.measureInfo(),write:s=>this.placeInfo(s),key:this},this.space=null,this.currentClass="";let o=e.state.field(n),{options:a,selected:i}=o.open,l=e.state.facet(Ze);this.optionContent=RL(l),this.optionClass=l.optionClass,this.tooltipClass=l.tooltipClass,this.range=hy(a.length,i,l.maxRenderedOptions),this.dom=document.createElement("div"),this.dom.className="cm-tooltip-autocomplete",this.updateTooltipClass(e.state),this.dom.addEventListener("mousedown",s=>{let{options:f}=e.state.field(n).open;for(let c=s.target,d;c&&c!=this.dom;c=c.parentNode)if(c.nodeName=="LI"&&(d=/-(\d+)$/.exec(c.id))&&+d[1]<f.length){this.applyCompletion(e,f[+d[1]]),s.preventDefault();return}if(s.target==this.list){let c=this.list.classList.contains("cm-completionListIncompleteTop")&&s.clientY<this.list.firstChild.getBoundingClientRect().top?this.range.from-1:this.list.classList.contains("cm-completionListIncompleteBottom")&&s.clientY>this.list.lastChild.getBoundingClientRect().bottom?this.range.to:null;c!=null&&(e.dispatch({effects:ky.of(c)}),s.preventDefault())}}),this.dom.addEventListener("focusout",s=>{let f=e.state.field(this.stateField,!1);f&&f.tooltip&&e.state.facet(Ze).closeOnBlur&&s.relatedTarget!=e.contentDOM&&e.dispatch({effects:af.of(null)})}),this.showOptions(a,o.id)}mount(){this.updateSel()}showOptions(e,n){this.list&&this.list.remove(),this.list=this.dom.appendChild(this.createListBox(e,n,this.range)),this.list.addEventListener("scroll",()=>{this.info&&this.view.requestMeasure(this.placeInfoReq)})}update(e){var n;let r=e.state.field(this.stateField),o=e.startState.field(this.stateField);if(this.updateTooltipClass(e.state),r!=o){let{options:a,selected:i,disabled:l}=r.open;(!o.open||o.open.options!=a)&&(this.range=hy(a.length,i,e.state.facet(Ze).maxRenderedOptions),this.showOptions(a,r.id)),this.updateSel(),l!=((n=o.open)===null||n===void 0?void 0:n.disabled)&&this.dom.classList.toggle("cm-tooltip-autocomplete-disabled",!!l)}}updateTooltipClass(e){let n=this.tooltipClass(e);if(n!=this.currentClass){for(let r of this.currentClass.split(" "))r&&this.dom.classList.remove(r);for(let r of n.split(" "))r&&this.dom.classList.add(r);this.currentClass=n}}positioned(e){this.space=e,this.info&&this.view.requestMeasure(this.placeInfoReq)}updateSel(){let e=this.view.state.field(this.stateField),n=e.open;(n.selected>-1&&n.selected<this.range.from||n.selected>=this.range.to)&&(this.range=hy(n.options.length,n.selected,this.view.state.facet(Ze).maxRenderedOptions),this.showOptions(n.options,e.id));let r=this.updateSelectedOption(n.selected);if(r){this.destroyInfo();let{completion:o}=n.options[n.selected],{info:a}=o;if(!a)return;let i=typeof a=="string"?document.createTextNode(a):a(o);if(!i)return;"then"in i?i.then(l=>{l&&this.view.state.field(this.stateField,!1)==e&&this.addInfoPane(l,o)}).catch(l=>vt(this.view.state,l,"completion info")):(this.addInfoPane(i,o),r.setAttribute("aria-describedby",this.info.id))}}addInfoPane(e,n){this.destroyInfo();let r=this.info=document.createElement("div");if(r.className="cm-tooltip cm-completionInfo",r.id="cm-completionInfo-"+Math.floor(Math.random()*65535).toString(16),e.nodeType!=null)r.appendChild(e),this.infoDestroy=null;else{let{dom:o,destroy:a}=e;r.appendChild(o),this.infoDestroy=a||null}this.dom.appendChild(r),this.view.requestMeasure(this.placeInfoReq)}updateSelectedOption(e){let n=null;for(let r=this.list.firstChild,o=this.range.from;r;r=r.nextSibling,o++)r.nodeName!="LI"||!r.id?o--:o==e?r.hasAttribute("aria-selected")||(r.setAttribute("aria-selected","true"),n=r):r.hasAttribute("aria-selected")&&(r.removeAttribute("aria-selected"),r.removeAttribute("aria-describedby"));return n&&FL(this.list,n),n}measureInfo(){let e=this.dom.querySelector("[aria-selected]");if(!e||!this.info)return null;let n=this.dom.getBoundingClientRect(),r=this.info.getBoundingClientRect(),o=e.getBoundingClientRect(),a=this.space;if(!a){let i=this.dom.ownerDocument.documentElement;a={left:0,top:0,right:i.clientWidth,bottom:i.clientHeight}}return o.top>Math.min(a.bottom,n.bottom)-10||o.bottom<Math.max(a.top,n.top)+10?null:this.view.state.facet(Ze).positionInfo(this.view,n,o,r,a,this.dom)}placeInfo(e){this.info&&(e?(e.style&&(this.info.style.cssText=e.style),this.info.className="cm-tooltip cm-completionInfo "+(e.class||"")):this.info.style.cssText="top: -1e6px")}createListBox(e,n,r){let o=document.createElement("ul");o.id=n,o.setAttribute("role","listbox"),o.setAttribute("aria-expanded","true"),o.setAttribute("aria-label",this.view.state.phrase("Completions")),o.addEventListener("mousedown",i=>{i.target==o&&i.preventDefault()});let a=null;for(let i=r.from;i<r.to;i++){let{completion:l,match:s}=e[i],{section:f}=l;if(f){let u=typeof f=="string"?f:f.name;if(u!=a&&(i>r.from||r.from==0))if(a=u,typeof f!="string"&&f.header)o.appendChild(f.header(f));else{let p=o.appendChild(document.createElement("completion-section"));p.textContent=u}}let c=o.appendChild(document.createElement("li"));c.id=n+"-"+i,c.setAttribute("role","option");let d=this.optionClass(l);d&&(c.className=d);for(let u of this.optionContent){let p=u(l,this.view.state,this.view,s);p&&c.appendChild(p)}}return r.from&&o.classList.add("cm-completionListIncompleteTop"),r.to<e.length&&o.classList.add("cm-completionListIncompleteBottom"),o}destroyInfo(){this.info&&(this.infoDestroy&&this.infoDestroy(),this.info.remove(),this.info=null)}destroy(){this.destroyInfo()}};Iy=class t{constructor(e,n,r,o,a,i){this.options=e,this.attrs=n,this.tooltip=r,this.timestamp=o,this.selected=a,this.disabled=i}setSelected(e,n){return e==this.selected||e>=this.options.length?this:new t(this.options,i2(n,e),this.tooltip,this.timestamp,e,this.disabled)}static build(e,n,r,o,a,i){if(o&&!i&&e.some(f=>f.isPending))return o.setDisabled();let l=LL(e,n);if(!l.length)return o&&e.some(f=>f.isPending)?o.setDisabled():null;let s=n.facet(Ze).selectOnOpen?0:-1;if(o&&o.selected!=s&&o.selected!=-1){let f=o.options[o.selected].completion;for(let c=0;c<l.length;c++)if(l[c].completion==f){s=c;break}}return new t(l,i2(r,s),{pos:e.reduce((f,c)=>c.hasResult()?Math.min(f,c.from):f,1e8),create:HL,above:a.aboveCursor},o?o.timestamp:Date.now(),s,!1)}map(e){return new t(this.options,this.attrs,{...this.tooltip,pos:e.mapPos(this.tooltip.pos)},this.timestamp,this.selected,this.disabled)}setDisabled(){return new t(this.options,this.attrs,this.tooltip,this.timestamp,this.selected,!0)}},vy=class t{constructor(e,n,r){this.active=e,this.id=n,this.open=r}static start(){return new t(PL,"cm-ac-"+Math.floor(Math.random()*2e6).toString(36),null)}update(e){let{state:n}=e,r=n.facet(Ze),a=(r.override||n.languageDataAt("autocomplete",ba(n)).map(OL)).map(s=>(this.active.find(c=>c.source==s)||new Er(s,this.active.some(c=>c.state!=0)?1:0)).update(e,r));a.length==this.active.length&&a.every((s,f)=>s==this.active[f])&&(a=this.active);let i=this.open,l=e.effects.some(s=>s.is(Cy));i&&e.docChanged&&(i=i.map(e.changes)),e.selection||a.some(s=>s.hasResult()&&e.changes.touchesRange(s.from,s.to))||!NL(a,this.active)||l?i=Iy.build(a,n,this.id,i,r,l):i&&i.disabled&&!a.some(s=>s.isPending)&&(i=null),!i&&a.every(s=>!s.isPending)&&a.some(s=>s.hasResult())&&(a=a.map(s=>s.hasResult()?new Er(s.source,0):s));for(let s of e.effects)s.is(ky)&&(i=i&&i.setSelected(s.value,this.id));return a==this.active&&i==this.open?this:new t(a,this.id,i)}get tooltip(){return this.open?this.open.tooltip:null}get attrs(){return this.open?this.open.attrs:this.active.length?qL:_L}};qL={"aria-autocomplete":"list"},_L={};PL=[];Er=class t{constructor(e,n,r=!1){this.source=e,this.state=n,this.explicit=r}hasResult(){return!1}get isPending(){return this.state==1}update(e,n){let r=c2(e,n),o=this;(r&8||r&16&&this.touches(e))&&(o=new t(o.source,0)),r&4&&o.state==0&&(o=new t(this.source,1)),o=o.updateFor(e,r);for(let a of e.effects)if(a.is(dd))o=new t(o.source,1,a.value);else if(a.is(af))o=new t(o.source,0);else if(a.is(Cy))for(let i of a.value)i.source==o.source&&(o=i);return o}updateFor(e,n){return this.map(e.changes)}map(e){return this}touches(e){return e.changes.touchesRange(ba(e.state))}},pd=class t extends Er{constructor(e,n,r,o,a,i){super(e,3,n),this.limit=r,this.result=o,this.from=a,this.to=i}hasResult(){return!0}updateFor(e,n){var r;if(!(n&3))return this.map(e.changes);let o=this.result;o.map&&!e.changes.empty&&(o=o.map(o,e.changes));let a=e.changes.mapPos(this.from),i=e.changes.mapPos(this.to,1),l=ba(e.state);if(l>i||!o||n&2&&(ba(e.startState)==this.from||l<this.limit))return new Er(this.source,n&4?1:0);let s=e.changes.mapPos(this.limit);return zL(o.validFor,e.state,a,i)?new t(this.source,this.explicit,s,o,a,i):o.update&&(o=o.update(o,a,i,new cd(e.state,l,!1)))?new t(this.source,this.explicit,s,o,o.from,(r=o.to)!==null&&r!==void 0?r:ba(e.state)):new Er(this.source,1,this.explicit)}map(e){if(e.empty)return this;let n=this.result.map?this.result.map(this.result,e):this.result;return n?new t(this.source,this.explicit,e.mapPos(this.limit),n,e.mapPos(this.from),e.mapPos(this.to,1)):new Er(this.source,0)}touches(e){return e.changes.touchesRange(this.from,this.to)}};Cy=ae.define({map(t,e){return t.map(n=>n.map(e))}}),Lt=ut.define({create(){return vy.start()},update(t,e){return t.update(e)},provide:t=>[Pg.from(t,e=>e.tooltip),U.contentAttributes.from(t,e=>e.attrs)]});HL=EL(Lt,Ay);UL=t=>{let e=t.state.field(Lt,!1);return t.state.readOnly||!e||!e.open||e.open.selected<0||e.open.disabled||Date.now()-e.open.timestamp<t.state.facet(Ze).interactionDelay?!1:Ay(t,e.open.options[e.open.selected])},xy=t=>t.state.field(Lt,!1)?(t.dispatch({effects:dd.of(!0)}),!0):!1,jL=t=>{let e=t.state.field(Lt,!1);return!e||!e.active.some(n=>n.state!=0)?!1:(t.dispatch({effects:af.of(null)}),!0)},wy=class{constructor(e,n){this.active=e,this.context=n,this.time=Date.now(),this.updates=[],this.done=void 0}},VL=50,GL=1e3,XL=Ft.fromClass(class{constructor(t){this.view=t,this.debounceUpdate=-1,this.running=[],this.debounceAccept=-1,this.pendingStart=!1,this.composing=0;for(let e of t.state.field(Lt).active)e.isPending&&this.startQuery(e)}update(t){let e=t.state.field(Lt),n=t.state.facet(Ze);if(!t.selectionSet&&!t.docChanged&&t.startState.field(Lt)==e)return;let r=t.transactions.some(a=>{let i=c2(a,n);return i&8||(a.selection||a.docChanged)&&!(i&3)});for(let a=0;a<this.running.length;a++){let i=this.running[a];if(r||i.context.abortOnDocChange&&t.docChanged||i.updates.length+t.transactions.length>VL&&Date.now()-i.time>GL){for(let l of i.context.abortListeners)try{l()}catch(s){vt(this.view.state,s)}i.context.abortListeners=null,this.running.splice(a--,1)}else i.updates.push(...t.transactions)}this.debounceUpdate>-1&&clearTimeout(this.debounceUpdate),t.transactions.some(a=>a.effects.some(i=>i.is(dd)))&&(this.pendingStart=!0);let o=this.pendingStart?50:n.activateOnTypingDelay;if(this.debounceUpdate=e.active.some(a=>a.isPending&&!this.running.some(i=>i.active.source==a.source))?setTimeout(()=>this.startUpdate(),o):-1,this.composing!=0)for(let a of t.transactions)a.isUserEvent("input.type")?this.composing=2:this.composing==2&&a.selection&&(this.composing=3)}startUpdate(){this.debounceUpdate=-1,this.pendingStart=!1;let{state:t}=this.view,e=t.field(Lt);for(let n of e.active)n.isPending&&!this.running.some(r=>r.active.source==n.source)&&this.startQuery(n);this.running.length&&e.open&&e.open.disabled&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(Ze).updateSyncTime))}startQuery(t){let{state:e}=this.view,n=ba(e),r=new cd(e,n,t.explicit,this.view),o=new wy(t,r);this.running.push(o),Promise.resolve(t.source(r)).then(a=>{o.context.aborted||(o.done=a||null,this.scheduleAccept())},a=>{this.view.dispatch({effects:af.of(null)}),vt(this.view.state,a)})}scheduleAccept(){this.running.every(t=>t.done!==void 0)?this.accept():this.debounceAccept<0&&(this.debounceAccept=setTimeout(()=>this.accept(),this.view.state.facet(Ze).updateSyncTime))}accept(){var t;this.debounceAccept>-1&&clearTimeout(this.debounceAccept),this.debounceAccept=-1;let e=[],n=this.view.state.facet(Ze),r=this.view.state.field(Lt);for(let o=0;o<this.running.length;o++){let a=this.running[o];if(a.done===void 0)continue;if(this.running.splice(o--,1),a.done){let l=ba(a.updates.length?a.updates[0].startState:this.view.state),s=Math.min(l,a.done.from+(a.active.explicit?0:1)),f=new pd(a.active.source,a.active.explicit,s,a.done,a.done.from,(t=a.done.to)!==null&&t!==void 0?t:l);for(let c of a.updates)f=f.update(c,n);if(f.hasResult()){e.push(f);continue}}let i=r.active.find(l=>l.source==a.active.source);if(i&&i.isPending)if(a.done==null){let l=new Er(a.active.source,0);for(let s of a.updates)l=l.update(s,n);l.isPending||e.push(l)}else this.startQuery(i)}(e.length||r.open&&r.open.disabled)&&this.view.dispatch({effects:Cy.of(e)})}},{eventHandlers:{blur(t){let e=this.view.state.field(Lt,!1);if(e&&e.tooltip&&this.view.state.facet(Ze).closeOnBlur){let n=e.open&&zg(this.view,e.open.tooltip);(!n||!n.dom.contains(t.relatedTarget))&&setTimeout(()=>this.view.dispatch({effects:af.of(null)}),10)}},compositionstart(){this.composing=1},compositionend(){this.composing==3&&setTimeout(()=>this.view.dispatch({effects:dd.of(!1)}),20),this.composing=0}}}),QL=typeof navigator=="object"&&/Win/.test(navigator.platform),WL=Dn.highest(U.domEventHandlers({keydown(t,e){let n=e.state.field(Lt,!1);if(!n||!n.open||n.open.disabled||n.open.selected<0||!t.key||t.key.length>1||t.ctrlKey&&!(QL&&t.altKey)||t.metaKey)return!1;let r=n.open.options[n.open.selected],o=n.active.find(i=>i.source==r.source),a=r.completion.commitCharacters||o.result.commitCharacters;return a&&a.indexOf(t.key)>-1&&Ay(e,r),!1}})),KL=U.baseTheme({".cm-tooltip.cm-tooltip-autocomplete":{"& > ul":{fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden auto",maxWidth_fallback:"700px",maxWidth:"min(700px, 95vw)",minWidth:"250px",maxHeight:"10em",height:"100%",listStyle:"none",margin:0,padding:0,"& > li, & > completion-section":{padding:"1px 3px",lineHeight:1.2},"& > li":{overflowX:"hidden",textOverflow:"ellipsis",cursor:"pointer"},"& > completion-section":{display:"list-item",borderBottom:"1px solid silver",paddingLeft:"0.5em",opacity:.7}}},"&light .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#17c",color:"white"},"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#777"},"&dark .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#347",color:"white"},"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#444"},".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":{content:'"\xB7\xB7\xB7"',opacity:.5,display:"block",textAlign:"center",cursor:"pointer"},".cm-tooltip.cm-completionInfo":{position:"absolute",padding:"3px 9px",width:"max-content",maxWidth:"400px",boxSizing:"border-box",whiteSpace:"pre-line"},".cm-completionInfo.cm-completionInfo-left":{right:"100%"},".cm-completionInfo.cm-completionInfo-right":{left:"100%"},".cm-completionInfo.cm-completionInfo-left-narrow":{right:"30px"},".cm-completionInfo.cm-completionInfo-right-narrow":{left:"30px"},"&light .cm-snippetField":{backgroundColor:"#00000022"},"&dark .cm-snippetField":{backgroundColor:"#ffffff22"},".cm-snippetFieldPosition":{verticalAlign:"text-top",width:0,height:"1.15em",display:"inline-block",margin:"0 -0.7px -.7em",borderLeft:"1.4px dotted #888"},".cm-completionMatchedText":{textDecoration:"underline"},".cm-completionDetail":{marginLeft:"0.5em",fontStyle:"italic"},".cm-completionIcon":{fontSize:"90%",width:".8em",display:"inline-block",textAlign:"center",paddingRight:".6em",opacity:"0.6",boxSizing:"content-box"},".cm-completionIcon-function, .cm-completionIcon-method":{"&:after":{content:"'\u0192'"}},".cm-completionIcon-class":{"&:after":{content:"'\u25CB'"}},".cm-completionIcon-interface":{"&:after":{content:"'\u25CC'"}},".cm-completionIcon-variable":{"&:after":{content:"'\u{1D465}'"}},".cm-completionIcon-constant":{"&:after":{content:"'\u{1D436}'"}},".cm-completionIcon-type":{"&:after":{content:"'\u{1D461}'"}},".cm-completionIcon-enum":{"&:after":{content:"'\u222A'"}},".cm-completionIcon-property":{"&:after":{content:"'\u25A1'"}},".cm-completionIcon-keyword":{"&:after":{content:"'\u{1F511}\uFE0E'"}},".cm-completionIcon-namespace":{"&:after":{content:"'\u25A2'"}},".cm-completionIcon-text":{"&:after":{content:"'abc'",fontSize:"50%",verticalAlign:"middle"}}}),u2=new class extends xn{};u2.startSide=1;u2.endSide=-1;Q_=typeof navigator=="object"&&/Android\b/.test(navigator.userAgent);Ty=[{key:"Ctrl-Space",run:xy},{mac:"Alt-`",run:xy},{mac:"Alt-i",run:xy},{key:"Escape",run:jL},{key:"ArrowDown",run:fd(!0)},{key:"ArrowUp",run:fd(!1)},{key:"PageDown",run:fd(!0,"page")},{key:"PageUp",run:fd(!1,"page")},{key:"Enter",run:UL}],YL=Dn.highest(Yi.computeN([Ze],t=>t.facet(Ze).defaultKeymap?[Ty]:[]))});function By(t){return t>=65&&t<=90||t>=97&&t<=122||t>=48&&t<=57}function hN(t){return t>=48&&t<=57||t>=97&&t<=102||t>=65&&t<=70}function va(t,e,n){for(let r=!1;;){if(t.next<0)return;if(t.next==e&&!r){t.advance();return}r=n&&!r&&t.next==92,t.advance()}}function xN(t,e){e:for(;;){if(t.next<0)return;if(t.next==36){t.advance();for(let n=0;n<e.length;n++){if(t.next!=e.charCodeAt(n))continue e;t.advance()}if(t.next==36){t.advance();return}}else t.advance()}}function gN(t,e){let n="[{<(".indexOf(String.fromCharCode(e)),r=n<0?e:"]}>)".charCodeAt(n);for(;;){if(t.next<0)return;if(t.next==r&&t.peek(1)==39){t.advance(2);return}t.advance()}}function Ry(t,e){for(;!(t.next!=95&&!By(t.next));)e!=null&&(e+=String.fromCharCode(t.next)),t.advance();return e}function yN(t){if(t.next==39||t.next==34||t.next==96){let e=t.next;t.advance(),va(t,e,!1)}else Ry(t)}function x2(t,e){for(;t.next==48||t.next==49;)t.advance();e&&t.next==e&&t.advance()}function g2(t,e){for(;;){if(t.next==46){if(e)break;e=!0}else if(t.next<48||t.next>57)break;t.advance()}if(t.next==69||t.next==101)for(t.advance(),(t.next==43||t.next==45)&&t.advance();t.next>=48&&t.next<=57;)t.advance()}function y2(t){for(;!(t.next<0||t.next==10);)t.advance()}function Ia(t,e){for(let n=0;n<e.length;n++)if(e.charCodeAt(n)==t)return!0;return!1}function k2(t,e,n){let r=Object.create(null);r.true=r.false=ZL,r.null=r.unknown=eN;for(let o of t.split(" "))o&&(r[o]=w2);for(let o of e.split(" "))o&&(r[o]=S2);for(let o of(n||"").split(" "))o&&(r[o]=mN);return r}function bN(t,e,n,r){let o={};for(let a in Ey)o[a]=(t.hasOwnProperty(a)?t:Ey)[a];return e&&(o.words=k2(e,n||"",r)),o}function C2(t){return new ld(e=>{var n;let{next:r}=e;if(e.advance(),Ia(r,Oy)){for(;Ia(e.next,Oy);)e.advance();e.acceptToken(JL)}else if(r==36&&t.doubleDollarQuotedStrings){let o=Ry(e,"");e.next==36&&(e.advance(),xN(e,o),e.acceptToken(tl))}else if(r==39||r==34&&t.doubleQuotedStrings)va(e,r,t.backslashEscapes),e.acceptToken(tl);else if(r==35&&t.hashComments||r==47&&e.next==47&&t.slashComments)y2(e),e.acceptToken(p2);else if(r==45&&e.next==45&&(!t.spaceAfterDashes||e.peek(1)==32))y2(e),e.acceptToken(p2);else if(r==47&&e.next==42){e.advance();for(let o=1;;){let a=e.next;if(e.next<0)break;if(e.advance(),a==42&&e.next==47){if(o--,e.advance(),!o)break}else a==47&&e.next==42&&(o++,e.advance())}e.acceptToken($L)}else if((r==101||r==69)&&e.next==39)e.advance(),va(e,39,!0),e.acceptToken(tl);else if((r==110||r==78)&&e.next==39&&t.charSetCasts)e.advance(),va(e,39,t.backslashEscapes),e.acceptToken(tl);else if(r==95&&t.charSetCasts)for(let o=0;;o++){if(e.next==39&&o>1){e.advance(),va(e,39,t.backslashEscapes),e.acceptToken(tl);break}if(!By(e.next))break;e.advance()}else if(t.plsqlQuotingMechanism&&(r==113||r==81)&&e.next==39&&e.peek(1)>0&&!Ia(e.peek(1),Oy)){let o=e.peek(1);e.advance(2),gN(e,o),e.acceptToken(tl)}else if(Ia(r,t.identifierQuotes)){let o=r==91?93:r;va(e,o,!1),e.acceptToken(dN)}else if(r==40)e.acceptToken(tN);else if(r==41)e.acceptToken(nN);else if(r==123)e.acceptToken(rN);else if(r==125)e.acceptToken(oN);else if(r==91)e.acceptToken(aN);else if(r==93)e.acceptToken(iN);else if(r==59)e.acceptToken(lN);else if(t.unquotedBitLiterals&&r==48&&e.next==98)e.advance(),x2(e),e.acceptToken(h2);else if((r==98||r==66)&&(e.next==39||e.next==34)){let o=e.next;e.advance(),t.treatBitsAsBytes?(va(e,o,t.backslashEscapes),e.acceptToken(pN)):(x2(e,o),e.acceptToken(h2))}else if(r==48&&(e.next==120||e.next==88)||(r==120||r==88)&&e.next==39){let o=e.next==39;for(e.advance();hN(e.next);)e.advance();o&&e.next==39&&e.advance(),e.acceptToken(Dy)}else if(r==46&&e.next>=48&&e.next<=57)g2(e,!0),e.acceptToken(Dy);else if(r==46)e.acceptToken(sN);else if(r>=48&&r<=57)g2(e,!1),e.acceptToken(Dy);else if(Ia(r,t.operatorChars)){for(;Ia(e.next,t.operatorChars);)e.advance();e.acceptToken(fN)}else if(Ia(r,t.specialVar))e.next==r&&e.advance(),yN(e),e.acceptToken(uN);else if(r==58||r==44)e.acceptToken(cN);else if(By(r)){let o=Ry(e,String.fromCharCode(r));e.acceptToken(e.next==46||e.peek(-o.length-1)==46?m2:(n=t.words[o.toLowerCase()])!==null&&n!==void 0?n:m2)}})}function Fy(t){let e=t.cursor().moveTo(t.from,-1);for(;/Comment/.test(e.name);)e.moveTo(e.from,-1);return e.node}function lf(t,e){let n=t.sliceString(e.from,e.to),r=/^([`'"\[])(.*)([`'"\]])$/.exec(n);return r?r[2]:n}function md(t){return t&&(t.name=="Identifier"||t.name=="QuotedIdentifier")}function vN(t,e){if(e.name=="CompositeIdentifier"){let n=[];for(let r=e.firstChild;r;r=r.nextSibling)md(r)&&n.push(lf(t,r));return n}return[lf(t,e)]}function b2(t,e){for(let n=[];;){if(!e||e.name!=".")return n;let r=Fy(e);if(!md(r))return n;n.unshift(lf(t,r)),e=Fy(r)}}function wN(t,e){let n=dt(t).resolveInner(e,-1),r=kN(t.doc,n);return n.name=="Identifier"||n.name=="QuotedIdentifier"||n.name=="Keyword"?{from:n.from,quoted:n.name=="QuotedIdentifier"?t.doc.sliceString(n.from,n.from+1):null,parents:b2(t.doc,Fy(n)),aliases:r}:n.name=="."?{from:e,quoted:null,parents:b2(t.doc,n),aliases:r}:{from:e,quoted:null,parents:[],empty:!0,aliases:r}}function kN(t,e){let n;for(let o=e;!n;o=o.parent){if(!o)return null;o.name=="Statement"&&(n=o)}let r=null;for(let o=n.firstChild,a=!1,i=null;o;o=o.nextSibling){let l=o.name=="Keyword"?t.sliceString(o.from,o.to).toLowerCase():null,s=null;if(!a)a=l=="from";else if(l=="as"&&i&&md(o.nextSibling))s=lf(t,o.nextSibling);else{if(l&&SN.has(l))break;i&&md(o)&&(s=lf(t,o))}s&&(r||(r=Object.create(null)),r[s]=vN(t,i)),i=/Identifier$/.test(o.name)?o:null}return r}function CN(t,e,n){return n.map(r=>({...r,label:r.label[0]==t?r.label:t+r.label+e,apply:void 0}))}function I2(t){return t.self&&typeof t.self.label=="string"}function v2(t,e,n,r){return new RegExp("^[a-z_][a-z_\\d]*$",r?"i":"").test(t)?{label:t,type:e}:{label:t,type:e,apply:n+t+T2(n)}}function T2(t){return t==="["?"]":t}function MN(t,e,n,r,o,a){var i;let l=((i=a?.spec.identifierQuotes)===null||i===void 0?void 0:i[0])||'"',s=new Ly(l,!!a?.spec.caseInsensitiveIdentifiers),f=o?s.child(o):null;return s.addNamespace(t),e&&(f||s).addCompletions(e),n&&s.addCompletions(n),f&&s.addCompletions(f.list),r&&s.addCompletions((f||s).child(r).list),c=>{let{parents:d,from:u,quoted:p,empty:m,aliases:x}=wN(c.state,c.pos);if(m&&!c.explicit)return null;x&&d.length==1&&(d=x[d[0]]||d);let b=s;for(let y of d){for(;!b.children||!b.children[y];)if(b==s&&f)b=f;else if(b==f&&r)b=b.child(r);else return null;let g=b.maybeChild(y);if(!g)return null;b=g}let h=b.list;if(b==s&&x&&(h=h.concat(Object.keys(x).map(y=>({label:y,type:"constant"})))),p){let y=p[0],g=T2(y),I=c.state.sliceDoc(c.pos,c.pos+1)==g;return{from:u,to:I?c.pos+1:void 0,options:CN(y,g,h),validFor:TN}}else return{from:u,options:h,validFor:AN}}}function DN(t){return t==S2?"type":t==w2?"keyword":"variable"}function ON(t,e,n){let r=Object.keys(t).map(o=>n(e?o.toUpperCase():o,DN(t[o])));return l2(["QuotedIdentifier","String","LineComment","BlockComment","."],Sy(r))}function RN(t,e){return{label:t,type:e,boost:-1}}function EN(t,e=!1,n){return ON(t.dialect.words,e,n||RN)}function FN(t){return t.schema?MN(t.schema,t.tables,t.schemas,t.defaultTable,t.defaultSchema,t.dialect||Ny):()=>null}function LN(t){return t.schema?(t.dialect||Ny).language.data.of({autocomplete:FN(t)}):[]}function M2(t={}){let e=t.dialect||Ny;return new ad(e.language,[LN(t),e.language.data.of({autocomplete:EN(e,t.upperCaseKeywords,t.keywordCompletion)})])}var JL,p2,$L,tl,Dy,ZL,eN,tN,nN,rN,oN,aN,iN,lN,sN,fN,cN,uN,m2,dN,w2,S2,h2,pN,mN,Oy,wa,Sa,Ey,A2,IN,SN,AN,TN,Ly,BN,nr,Ny,D2,O2,B2,R2,E2,tP,NN,nP,F2,rP,oP,qy=E(()=>{rf();Gg();t2();My();JL=36,p2=1,$L=2,tl=3,Dy=4,ZL=5,eN=6,tN=7,nN=8,rN=9,oN=10,aN=11,iN=12,lN=13,sN=14,fN=15,cN=16,uN=17,m2=18,dN=19,w2=20,S2=21,h2=22,pN=23,mN=24;Oy=` 	\r
`;wa="array binary bit boolean char character clob date decimal double float int integer interval large national nchar nclob numeric object precision real smallint time timestamp varchar varying ",Sa="absolute action add after all allocate alter and any are as asc assertion at authorization before begin between both breadth by call cascade cascaded case cast catalog check close collate collation column commit condition connect connection constraint constraints constructor continue corresponding count create cross cube current current_date current_default_transform_group current_transform_group_for_type current_path current_role current_time current_timestamp current_user cursor cycle data day deallocate declare default deferrable deferred delete depth deref desc describe descriptor deterministic diagnostics disconnect distinct do domain drop dynamic each else elseif end end-exec equals escape except exception exec execute exists exit external fetch first for foreign found from free full function general get global go goto grant group grouping handle having hold hour identity if immediate in indicator initially inner inout input insert intersect into is isolation join key language last lateral leading leave left level like limit local localtime localtimestamp locator loop map match method minute modifies module month names natural nesting new next no none not of old on only open option or order ordinality out outer output overlaps pad parameter partial path prepare preserve primary prior privileges procedure public read reads recursive redo ref references referencing relative release repeat resignal restrict result return returns revoke right role rollback rollup routine row rows savepoint schema scroll search second section select session session_user set sets signal similar size some space specific specifictype sql sqlexception sqlstate sqlwarning start state static system_user table temporary then timezone_hour timezone_minute to trailing transaction translation treat trigger under undo union unique unnest until update usage user using value values view when whenever where while with without work write year zone ",Ey={backslashEscapes:!1,hashComments:!1,spaceAfterDashes:!1,slashComments:!1,doubleQuotedStrings:!1,doubleDollarQuotedStrings:!1,unquotedBitLiterals:!1,treatBitsAsBytes:!1,charSetCasts:!1,plsqlQuotingMechanism:!1,operatorChars:"*+-%<>!=&|~^/",specialVar:"?",identifierQuotes:'"',caseInsensitiveIdentifiers:!1,words:k2(Sa,wa)};A2=C2(Ey),IN=sd.deserialize({version:14,states:"%vQ]QQOOO#wQRO'#DSO$OQQO'#CwO%eQQO'#CxO%lQQO'#CyO%sQQO'#CzOOQQ'#DS'#DSOOQQ'#C}'#C}O'UQRO'#C{OOQQ'#Cv'#CvOOQQ'#C|'#C|Q]QQOOQOQQOOO'`QQO'#DOO(xQRO,59cO)PQQO,59cO)UQQO'#DSOOQQ,59d,59dO)cQQO,59dOOQQ,59e,59eO)jQQO,59eOOQQ,59f,59fO)qQQO,59fOOQQ-E6{-E6{OOQQ,59b,59bOOQQ-E6z-E6zOOQQ,59j,59jOOQQ-E6|-E6|O+VQRO1G.}O+^QQO,59cOOQQ1G/O1G/OOOQQ1G/P1G/POOQQ1G/Q1G/QP+kQQO'#C}O+rQQO1G.}O)PQQO,59cO,PQQO'#Cw",stateData:",[~OtOSPOSQOS~ORUOSUOTUOUUOVROXSOZTO]XO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O^]ORvXSvXTvXUvXVvXXvXZvX]vX_vX`vXavXbvXcvXdvXevXfvXgvXhvX~OsvX~P!jOa_Ob_Oc_O~ORUOSUOTUOUUOVROXSOZTO^tO_UO`UOa`Ob`Oc`OdUOeUOfUOgUOhUO~OWaO~P$ZOYcO~P$ZO[eO~P$ZORUOSUOTUOUUOVROXSOZTO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O]hOsoX~P%zOajObjOcjO~O^]ORkaSkaTkaUkaVkaXkaZka]ka_ka`kaakabkackadkaekafkagkahka~Oska~P'kO^]O~OWvXYvX[vX~P!jOWnO~P$ZOYoO~P$ZO[pO~P$ZO^]ORkiSkiTkiUkiVkiXkiZki]ki_ki`kiakibkickidkiekifkigkihki~Oski~P)xOWkaYka[ka~P'kO]hO~P$ZOWkiYki[ki~P)xOasObsOcsO~O",goto:"#hwPPPPPPPPPPPPPPPPPPPPPPPPPPx||||!Y!^!d!xPPP#[TYOZeUORSTWZbdfqT[OZQZORiZSWOZQbRQdSQfTZgWbdfqQ^PWk^lmrQl_Qm`RrseVORSTWZbdfq",nodeNames:"\u26A0 LineComment BlockComment String Number Bool Null ( ) { } [ ] ; . Operator Punctuation SpecialVar Identifier QuotedIdentifier Keyword Type Bits Bytes Builtin Script Statement CompositeIdentifier Parens Braces Brackets Statement",maxTerm:38,nodeProps:[["isolate",-4,1,2,3,19,""]],skippedNodes:[0,1,2],repeatNodeCount:3,tokenData:"RORO",tokenizers:[0,A2],topRules:{Script:[0,25]},tokenPrec:0});SN=new Set("where group having order union intersect except all distinct limit offset fetch for".split(" "));AN=/^\w*$/,TN=/^[`'"\[]?\w*[`'"\]]?$/;Ly=class t{constructor(e,n){this.idQuote=e,this.idCaseInsensitive=n,this.list=[],this.children=void 0}child(e){let n=this.children||(this.children=Object.create(null)),r=n[e];return r||(e&&!this.list.some(o=>o.label==e)&&this.list.push(v2(e,"type",this.idQuote,this.idCaseInsensitive)),n[e]=new t(this.idQuote,this.idCaseInsensitive))}maybeChild(e){return this.children?this.children[e]:null}addCompletion(e){let n=this.list.findIndex(r=>r.label==e.label);n>-1?this.list[n]=e:this.list.push(e)}addCompletions(e){for(let n of e)this.addCompletion(typeof n=="string"?v2(n,"property",this.idQuote,this.idCaseInsensitive):n)}addNamespace(e){Array.isArray(e)?this.addCompletions(e):I2(e)?this.addNamespace(e.children):this.addNamespaceObject(e)}addNamespaceObject(e){for(let n of Object.keys(e)){let r=e[n],o=null,a=n.replace(/\\?\./g,l=>l=="."?"\0":l).split("\0"),i=this;I2(r)&&(o=r.self,r=r.children);for(let l=0;l<a.length;l++)o&&l==a.length-1&&i.addCompletion(o),i=i.child(a[l].replace(/\\\./g,"."));i.addNamespace(r)}}};BN=IN.configure({props:[oy.add({Statement:zC()}),HC.add({Statement(t,e){return{from:Math.min(t.from+100,e.doc.lineAt(t.from).to),to:t.to}},BlockComment(t){return{from:t.from+2,to:t.to-2}}}),rd({Keyword:M.keyword,Type:M.typeName,Builtin:M.standard(M.name),Bits:M.number,Bytes:M.string,Bool:M.bool,Null:M.null,Number:M.number,String:M.string,Identifier:M.name,QuotedIdentifier:M.special(M.string),SpecialVar:M.special(M.name),LineComment:M.lineComment,BlockComment:M.blockComment,Operator:M.operator,"Semi Punctuation":M.punctuation,"( )":M.paren,"{ }":M.brace,"[ ]":M.squareBracket})]}),nr=class t{constructor(e,n,r){this.dialect=e,this.language=n,this.spec=r}get extension(){return this.language.extension}configureLanguage(e,n){return new t(this.dialect,this.language.configure(e,n),this.spec)}static define(e){let n=bN(e,e.keywords,e.types,e.builtin),r=od.define({name:"sql",parser:BN.configure({tokenizers:[{from:A2,to:C2(n)}]}),languageData:{commentTokens:{line:"--",block:{open:"/*",close:"*/"}},closeBrackets:{brackets:["(","[","{","'",'"',"`"]}}});return new t(n,r,e)}};Ny=nr.define({}),D2=nr.define({charSetCasts:!0,doubleDollarQuotedStrings:!0,operatorChars:"+-*/<>=~!@#%^&|`?",specialVar:"",keywords:Sa+"abort abs absent access according ada admin aggregate alias also always analyse analyze array_agg array_max_cardinality asensitive assert assignment asymmetric atomic attach attribute attributes avg backward base64 begin_frame begin_partition bernoulli bit_length blocked bom cache called cardinality catalog_name ceil ceiling chain char_length character_length character_set_catalog character_set_name character_set_schema characteristics characters checkpoint class class_origin cluster coalesce cobol collation_catalog collation_name collation_schema collect column_name columns command_function command_function_code comment comments committed concurrently condition_number configuration conflict connection_name constant constraint_catalog constraint_name constraint_schema contains content control conversion convert copy corr cost covar_pop covar_samp csv cume_dist current_catalog current_row current_schema cursor_name database datalink datatype datetime_interval_code datetime_interval_precision db debug defaults defined definer degree delimiter delimiters dense_rank depends derived detach detail dictionary disable discard dispatch dlnewcopy dlpreviouscopy dlurlcomplete dlurlcompleteonly dlurlcompletewrite dlurlpath dlurlpathonly dlurlpathwrite dlurlscheme dlurlserver dlvalue document dump dynamic_function dynamic_function_code element elsif empty enable encoding encrypted end_frame end_partition endexec enforced enum errcode error event every exclude excluding exclusive exp explain expression extension extract family file filter final first_value flag floor following force foreach fortran forward frame_row freeze fs functions fusion generated granted greatest groups handler header hex hierarchy hint id ignore ilike immediately immutable implementation implicit import include including increment indent index indexes info inherit inherits inline insensitive instance instantiable instead integrity intersection invoker isnull key_member key_type label lag last_value lead leakproof least length library like_regex link listen ln load location lock locked log logged lower mapping matched materialized max max_cardinality maxvalue member merge message message_length message_octet_length message_text min minvalue mod mode more move multiset mumps name namespace nfc nfd nfkc nfkd nil normalize normalized nothing notice notify notnull nowait nth_value ntile nullable nullif nulls number occurrences_regex octet_length octets off offset oids operator options ordering others over overlay overriding owned owner parallel parameter_mode parameter_name parameter_ordinal_position parameter_specific_catalog parameter_specific_name parameter_specific_schema parser partition pascal passing passthrough password percent percent_rank percentile_cont percentile_disc perform period permission pg_context pg_datatype_name pg_exception_context pg_exception_detail pg_exception_hint placing plans pli policy portion position position_regex power precedes preceding prepared print_strict_params procedural procedures program publication query quote raise range rank reassign recheck recovery refresh regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy regr_syy reindex rename repeatable replace replica requiring reset respect restart restore result_oid returned_cardinality returned_length returned_octet_length returned_sqlstate returning reverse routine_catalog routine_name routine_schema routines row_count row_number rowtype rule scale schema_name schemas scope scope_catalog scope_name scope_schema security selective self sensitive sequence sequences serializable server server_name setof share show simple skip slice snapshot source specific_name sqlcode sqlerror sqrt stable stacked standalone statement statistics stddev_pop stddev_samp stdin stdout storage strict strip structure style subclass_origin submultiset subscription substring substring_regex succeeds sum symmetric sysid system system_time table_name tables tablesample tablespace temp template ties token top_level_count transaction_active transactions_committed transactions_rolled_back transform transforms translate translate_regex trigger_catalog trigger_name trigger_schema trim trim_array truncate trusted type types uescape unbounded uncommitted unencrypted unlink unlisten unlogged unnamed untyped upper uri use_column use_variable user_defined_type_catalog user_defined_type_code user_defined_type_name user_defined_type_schema vacuum valid validate validator value_of var_pop var_samp varbinary variable_conflict variadic verbose version versioning views volatile warning whitespace width_bucket window within wrapper xmlagg xmlattributes xmlbinary xmlcast xmlcomment xmlconcat xmldeclaration xmldocument xmlelement xmlexists xmlforest xmliterate xmlnamespaces xmlparse xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltext xmlvalidate yes",types:wa+"bigint int8 bigserial serial8 varbit bool box bytea cidr circle precision float8 inet int4 json jsonb line lseg macaddr macaddr8 money numeric pg_lsn point polygon float4 int2 smallserial serial2 serial serial4 text timetz timestamptz tsquery tsvector txid_snapshot uuid xml"}),O2="accessible algorithm analyze asensitive authors auto_increment autocommit avg avg_row_length binlog btree cache catalog_name chain change changed checkpoint checksum class_origin client_statistics coalesce code collations columns comment committed completion concurrent consistent contains contributors convert database databases day_hour day_microsecond day_minute day_second delay_key_write delayed delimiter des_key_file dev_pop dev_samp deviance directory disable discard distinctrow div dual dumpfile enable enclosed ends engine engines enum errors escaped even event events every explain extended fast field fields flush force found_rows fulltext grants handler hash high_priority hosts hour_microsecond hour_minute hour_second ignore ignore_server_ids import index index_statistics infile innodb insensitive insert_method install invoker iterate keys kill linear lines list load lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modify mutex mysql_errno no_write_to_binlog offline offset one online optimize optionally outfile pack_keys parser partition partitions password phase plugin plugins prev processlist profile profiles purge query quick range read_write rebuild recover regexp relaylog remove rename reorganize repair repeatable replace require resume rlike row_format rtree schedule schema_name schemas second_microsecond security sensitive separator serializable server share show slave slow snapshot soname spatial sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result ssl starting starts std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace terminated triggers truncate uncommitted uninstall unlock upgrade use use_frm user_resources user_statistics utc_date utc_time utc_timestamp variables views warnings xa xor year_month zerofill",B2=wa+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int1 int2 int3 int4 int8 float4 float8 varbinary varcharacter precision datetime unsigned signed",R2="charset clear edit ego help nopager notee nowarning pager print prompt quit rehash source status system tee",E2=nr.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:Sa+"group_concat "+O2,types:B2,builtin:R2}),tP=nr.define({operatorChars:"*+-%<>!=&|^",charSetCasts:!0,doubleQuotedStrings:!0,unquotedBitLiterals:!0,hashComments:!0,spaceAfterDashes:!0,specialVar:"@?",identifierQuotes:"`",keywords:Sa+"always generated groupby_concat hard persistent shutdown soft virtual "+O2,types:B2,builtin:R2}),NN="approx_count_distinct approx_percentile_cont approx_percentile_disc avg checksum_agg count count_big grouping grouping_id max min product stdev stdevp sum var varp ai_generate_embeddings ai_generate_chunks cume_dist first_value lag last_value lead percentile_cont percentile_disc percent_rank left_shift right_shift bit_count get_bit set_bit collationproperty tertiary_weights @@datefirst @@dbts @@langid @@language @@lock_timeout @@max_connections @@max_precision @@nestlevel @@options @@remserver @@servername @@servicename @@spid @@textsize @@version cast convert parse try_cast try_convert try_parse asymkey_id asymkeyproperty certproperty cert_id crypt_gen_random decryptbyasymkey decryptbycert decryptbykey decryptbykeyautoasymkey decryptbykeyautocert decryptbypassphrase encryptbyasymkey encryptbycert encryptbykey encryptbypassphrase hashbytes is_objectsigned key_guid key_id key_name signbyasymkey signbycert symkeyproperty verifysignedbycert verifysignedbyasymkey @@cursor_rows @@fetch_status cursor_status datalength ident_current ident_incr ident_seed identity sql_variant_property @@datefirst current_timestamp current_timezone current_timezone_id date_bucket dateadd datediff datediff_big datefromparts datename datepart datetime2fromparts datetimefromparts datetimeoffsetfromparts datetrunc day eomonth getdate getutcdate isdate month smalldatetimefromparts switchoffset sysdatetime sysdatetimeoffset sysutcdatetime timefromparts todatetimeoffset year edit_distance edit_distance_similarity jaro_winkler_distance jaro_winkler_similarity edge_id_from_parts graph_id_from_edge_id graph_id_from_node_id node_id_from_parts object_id_from_edge_id object_id_from_node_id json isjson json_array json_contains json_modify json_object json_path_exists json_query json_value regexp_like regexp_replace regexp_substr regexp_instr regexp_count regexp_matches regexp_split_to_table abs acos asin atan atn2 ceiling cos cot degrees exp floor log log10 pi power radians rand round sign sin sqrt square tan choose greatest iif least @@procid app_name applock_mode applock_test assemblyproperty col_length col_name columnproperty databasepropertyex db_id db_name file_id file_idex file_name filegroup_id filegroup_name filegroupproperty fileproperty filepropertyex fulltextcatalogproperty fulltextserviceproperty index_col indexkey_property indexproperty next value for object_definition object_id object_name object_schema_name objectproperty objectpropertyex original_db_name parsename schema_id schema_name scope_identity serverproperty stats_date type_id type_name typeproperty dense_rank ntile rank row_number publishingservername certenclosed certprivatekey current_user database_principal_id has_dbaccess has_perms_by_name is_member is_rolemember is_srvrolemember loginproperty original_login permissions pwdencrypt pwdcompare session_user sessionproperty suser_id suser_name suser_sid suser_sname system_user user user_id user_name ascii char charindex concat concat_ws difference format left len lower ltrim nchar patindex quotename replace replicate reverse right rtrim soundex space str string_agg string_escape stuff substring translate trim unicode upper $partition @@error @@identity @@pack_received @@rowcount @@trancount binary_checksum checksum compress connectionproperty context_info current_request_id current_transaction_id decompress error_line error_message error_number error_procedure error_severity error_state formatmessage get_filestream_transaction_context getansinull host_id host_name isnull isnumeric min_active_rowversion newid newsequentialid rowcount_big session_context xact_state @@connections @@cpu_busy @@idle @@io_busy @@pack_sent @@packet_errors @@timeticks @@total_errors @@total_read @@total_write textptr textvalid columns_updated eventdata trigger_nestlevel vector_distance vectorproperty vector_search generate_series opendatasource openjson openquery openrowset openxml predict string_split coalesce nullif apply catch filter force include keep keepfixed modify optimize parameterization parameters partition recompile sequence set",nP=nr.define({keywords:Sa+"add external procedure all fetch public alter file raiserror and fillfactor read any for readtext as foreign reconfigure asc freetext references authorization freetexttable replication backup from restore begin full restrict between function return break goto revert browse grant revoke bulk group right by having rollback cascade holdlock rowcount case identity rowguidcol check identity_insert rule checkpoint identitycol save close if schema clustered in securityaudit coalesce index select collate inner semantickeyphrasetable column insert semanticsimilaritydetailstable commit intersect semanticsimilaritytable compute into session_user constraint is set contains join setuser containstable key shutdown continue kill some convert left statistics create like system_user cross lineno table current load tablesample current_date merge textsize current_time national then current_timestamp nocheck to current_user nonclustered top cursor not tran database null transaction dbcc nullif trigger deallocate of truncate declare off try_convert default offsets tsequal delete on union deny open unique desc opendatasource unpivot disk openquery update distinct openrowset updatetext distributed openxml use double option user drop or values dump order varying else outer view end over waitfor errlvl percent when escape pivot where except plan while exec precision with execute primary within group exists print writetext exit proc noexpand index forceseek forcescan holdlock nolock nowait paglock readcommitted readcommittedlock readpast readuncommitted repeatableread rowlock serializable snapshot spatial_window_max_cells tablock tablockx updlock xlock keepidentity keepdefaults ignore_constraints ignore_triggers",types:wa+"smalldatetime datetimeoffset datetime2 datetime bigint smallint smallmoney tinyint money real text nvarchar ntext varbinary image hierarchyid uniqueidentifier sql_variant xml",builtin:NN,operatorChars:"*+-%<>!=^&|/",specialVar:"@",identifierQuotes:'"['}),F2=nr.define({keywords:Sa+"abort analyze attach autoincrement conflict database detach exclusive fail glob ignore index indexed instead isnull notnull offset plan pragma query raise regexp reindex rename replace temp vacuum virtual",types:wa+"bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int2 int8 unsigned signed real",builtin:"auth backup bail changes clone databases dbinfo dump echo eqp explain fullschema headers help import imposter indexes iotrace lint load log mode nullvalue once print prompt quit restore save scanstats separator shell show stats system tables testcase timeout timer trace vfsinfo vfslist vfsname width",operatorChars:"*+-%<>!=&|/~",identifierQuotes:'`"',specialVar:"@:?$"}),rP=nr.define({keywords:"add all allow alter and any apply as asc authorize batch begin by clustering columnfamily compact consistency count create custom delete desc distinct drop each_quorum exists filtering from grant if in index insert into key keyspace keyspaces level limit local_one local_quorum modify nan norecursive nosuperuser not of on one order password permission permissions primary quorum rename revoke schema select set storage superuser table three to token truncate ttl two type unlogged update use user users using values where with writetime infinity NaN",types:wa+"ascii bigint blob counter frozen inet list map static text timeuuid tuple uuid varint",slashComments:!0}),oP=nr.define({keywords:Sa+"abort accept access add all alter and any arraylen as asc assert assign at attributes audit authorization avg base_table begin between binary_integer body by case cast char_base check close cluster clusters colauth column comment commit compress connected constant constraint crash create current currval cursor data_base database dba deallocate debugoff debugon declare default definition delay delete desc digits dispose distinct do drop else elseif elsif enable end entry exception exception_init exchange exclusive exists external fast fetch file for force form from function generic goto grant group having identified if immediate in increment index indexes indicator initial initrans insert interface intersect into is key level library like limited local lock log logging loop master maxextents maxtrans member minextents minus mislabel mode modify multiset new next no noaudit nocompress nologging noparallel not nowait number_base of off offline on online only option or order out package parallel partition pctfree pctincrease pctused pls_integer positive positiven pragma primary prior private privileges procedure public raise range raw rebuild record ref references refresh rename replace resource restrict return returning returns reverse revoke rollback row rowid rowlabel rownum rows run savepoint schema segment select separate set share snapshot some space split sql start statement storage subtype successful synonym tabauth table tables tablespace task terminate then to trigger truncate type union unique unlimited unrecoverable unusable update use using validate value values variable view views when whenever where while with work",builtin:"appinfo arraysize autocommit autoprint autorecovery autotrace blockterminator break btitle cmdsep colsep compatibility compute concat copycommit copytypecheck define echo editfile embedded feedback flagger flush heading headsep instance linesize lno loboffset logsource longchunksize markup native newpage numformat numwidth pagesize pause pno recsep recsepchar repfooter repheader serveroutput shiftinout show showmode spool sqlblanklines sqlcase sqlcode sqlcontinue sqlnumber sqlpluscompatibility sqlprefix sqlprompt sqlterminator suffix tab term termout timing trimout trimspool ttitle underline verify version wrap",types:wa+"ascii bfile bfilename bigserial bit blob dec long number nvarchar nvarchar2 serial smallint string text uid varchar2 xml",operatorChars:"*/+-%<>!=~",doubleQuotedStrings:!0,charSetCasts:!0,plsqlQuotingMechanism:!0})});function sf(t){return t==="postgres"?D2:t==="mysql"?E2:F2}function _N(t){let e=t[0]==="create"?1:-1;return e<0?!1:((t[e]==="temp"||t[e]==="temporary")&&e++,t[e]==="trigger"&&t.includes("begin"))}function L2(t,e){let n=sf(e).language.parser.parse(t),r=[],o=n.cursor();if(!o.firstChild())return[];do{if(o.name!=="Statement")continue;let l=[];o.node.toTree().iterate({enter(s){if(qN.has(s.name))return!1;if(s.node.firstChild)return;let f=t.slice(o.from+s.from,o.from+s.to);/^[A-Za-z_]\w*$/.test(f)&&l.push(f.toLowerCase())}}),r.push({from:o.from,to:o.to,words:l})}while(o.nextSibling());let a=[];for(let l=0;l<r.length;l++){let s=r[l],f=s;if(_N(s.words))for(;l+1<r.length&&(f=r[++l],!(f.words.length===1&&f.words[0]==="end")););a.push({from:s.from,to:f.to})}let i=[];for(let{from:l,to:s}of a){let f=l,c=s;for(;c>f&&/\s/.test(t[c-1]);)c--;for(c>f&&t[c-1]===";"&&c--;c>f&&/\s/.test(t[c-1]);)c--;for(;f<c&&/\s/.test(t[f]);)f++;f>=c||i.push({from:f,to:c,text:t.slice(f,c),nodeTo:s})}return i}function ff(t,e){return L2(t,e).map(({from:n,to:r,text:o})=>({from:n,to:r,text:o}))}function hd(t,e,n){let r=L2(t,n);if(r.length===0)return null;let o=r.find(a=>e>=a.from&&e<a.nodeTo);if(o||(o=r.find(a=>e===a.nodeTo)),!o)for(let a of r)a.nodeTo<e&&(o=a);return o||(o=r.find(a=>a.from>e)),o?{from:o.from,to:o.to,text:o.text}:null}var qN,cf=E(()=>{"use strict";qy();qN=new Set(["String","LineComment","BlockComment","QuotedIdentifier","Number"])});function jN(t,e){let n=Array.from({length:e.length+1},(r,o)=>o);for(let r=1;r<=t.length;r++){let o=[r];for(let a=1;a<=e.length;a++)o[a]=Math.min(n[a]+1,o[a-1]+1,n[a-1]+(t[r-1]===e[a-1]?0:1));n=o}return n[e.length]}function VN(t){return N2.includes(t)?!1:t.length>=4&&N2.some(e=>e.length>=4&&jN(t,e)<=2)}function GN(t,e){let n=sf(e).language.parser.parse(t),r=-1,o=n.cursor();if(o.firstChild())do if(o.name==="Statement"){r=o.to;break}while(o.nextSibling());let a=[],i=!1,l=0;if(n.iterate({enter(c){if(i||r>=0&&c.from>=r)return!1;if(c.type.isError)return i=!0,!1;if(c.name==="Parens"){l++;return}if(c.name==="Script"||c.name==="Statement")return;let d=t.slice(c.from,c.to);if(/^[A-Za-z_][A-Za-z_0-9]*$/.test(d))a.push({word:d.toLowerCase(),text:d,depth:l});else{if(/^\s*$/.test(d)||/^(--|\/\*|#)/.test(d))return;a.push({word:"",text:d,depth:l})}},leave(c){c.name==="Parens"&&l--}}),i)return null;let s=a.filter(c=>c.text==="(").length,f=a.filter(c=>c.text===")").length;return s!==f?null:a.filter(c=>c.text!=="("&&c.text!==")")}function XN(t){let e=t.map(a=>a.word),n=a=>a===t.length-1&&(e[a]!==""||/^["`[]/.test(t[a].text)),r=1,o=(...a)=>{a.includes(e[r])&&r++};switch(e[0]){case"begin":return o("deferred","immediate","exclusive"),o("transaction"),r===t.length;case"commit":case"end":return o("transaction"),r===t.length;case"rollback":return o("transaction"),r===t.length?!0:e[r]!=="to"?!1:(r++,o("savepoint"),n(r));case"savepoint":return n(1);case"release":return o("savepoint"),n(r);default:return!1}}function QN(t,e){let n=GN(t,e);if(!n||n.length===0)return uf;let r=n.filter(s=>s.word),o=r[0];if(!o||n[0]!==o)return uf;if(XN(n))return{kind:"read",reason:""};let a=0,i=o.word,l=!1;if(i==="explain"){let s=!1,f=1;for(;f<n.length;f++){let c=n[f];if(c.depth>0||c.word&&PN.has(c.word)||!c.word){(c.word==="analyze"||c.word==="analyse")&&(s=!0);continue}break}n.slice(1,f).some(c=>c.word==="analyze"||c.word==="analyse")&&(s=!0),s&&f<n.length?(a=f,i=n[f].word):l=!0}if(i==="with"){let s=n.findIndex((f,c)=>c>a&&f.depth===0&&zN.has(f.word));s>0&&(a=s,i=n[s].word)}if(_2.has(i)&&!l)return{kind:"dangerous",reason:i.toUpperCase()};if((i==="delete"||i==="update")&&!l&&!n.some((f,c)=>c>a&&f.depth===0&&f.word==="where"))return{kind:"dangerous",reason:`${i.toUpperCase()} without WHERE`};for(let s=0;s<n.length;s++){let f=n[s];if(P2.has(f.word)&&!(f.word==="replace"&&s>0&&n[s+1]&&n[s+1].depth>f.depth))return{kind:"write",reason:f.word.toUpperCase()}}if((i==="select"||o.word==="select")&&n.some(s=>s.depth===0&&s.word==="into"))return{kind:"write",reason:"SELECT INTO"};if(o.word==="pragma"){if(n.some(s=>s.depth===0&&s.text==="="))return{kind:"write",reason:"PRAGMA assignment"};if(n.some(s=>s.depth>0)&&!r.slice(1,4).some(s=>s.depth===0&&HN.has(s.word)))return{kind:"write",reason:"PRAGMA assignment"}}if(o.word==="pragma"&&!n.some(s=>s.depth>0)){let s=[...n].reverse().find(f=>f.depth===0&&f.word);if(!s||s===o||!UN.has(s.word))return{kind:"write",reason:"PRAGMA"}}return z2.has(o.word)?{kind:"read",reason:""}:r.length>1&&VN(o.word)?uf:{kind:"write",reason:"unrecognized statement"}}function nl(t,e){let n=ff(t,e);if(n.length===0)return uf;let r=null;for(let o of n){let a=QN(o.text,e);(!r||q2[a.kind]>q2[r.kind])&&(r=a)}return r??uf}var _2,P2,z2,PN,zN,HN,N2,UN,uf,q2,xd=E(()=>{"use strict";cf();_2=new Set(["drop","truncate","alter","grant","revoke"]),P2=new Set(["insert","update","delete","replace","merge","create","attach","detach","vacuum","reindex","copy","call","do","set","reset","lock"]),z2=new Set(["select","with","values","explain","pragma","show","describe","desc","table"]),PN=new Set(["analyze","analyse","verbose","query","plan","costs","buffers","timing","summary","format","json","text","xml","yaml","true","false","on","off","settings","wal"]),zN=new Set(["select","values","insert","update","delete","replace","merge","table"]),HN=new Set(["table_info","table_xinfo","table_list","index_list","index_info","index_xinfo","foreign_key_list","foreign_key_check","integrity_check","quick_check","function_list","collation_list","database_list","compile_options","pragma_list","module_list"]),N2=[..._2,...P2,...z2,"begin","commit","end","rollback","savepoint","release"],UN=new Set(["table_info","table_xinfo","index_list","index_info","index_xinfo","foreign_key_list","database_list","collation_list","function_list","module_list","pragma_list","compile_options","schema_version","user_version","application_id","page_count","page_size","freelist_count","encoding","journal_mode","foreign_keys","query_only","integrity_check","quick_check","foreign_key_check","data_version"]),uf={kind:"dangerous",reason:"could not parse"};q2={read:0,write:1,dangerous:2}});function KN(t){if(typeof t!="object"||t===null)return!1;let e=t;return typeof e.code=="string"&&WN.has(e.code)&&typeof e.message=="string"&&e.message!==""}function YN(t){let e="";return typeof t=="string"?e=t:(t instanceof Error||typeof t=="object"&&t!==null&&typeof t.message=="string")&&(e=t.message),e.trim()===""?"Unknown SQL error.":e}function Ln(t,e){if(KN(t))return t;let n=typeof t=="object"&&t!==null?t.name:void 0,r=YN(t);if(n==="AbortError")return{code:"cancelled",message:r==="Unknown SQL error."?"Query cancelled.":r};if(/readonly|read-only|query_only/i.test(r))return{code:"read-only",message:r};if(/not a database|file is not a database|database disk image is malformed/i.test(r))return{code:"not-a-database",message:r};if(/syntax error|near "/i.test(r)){let o={code:"syntax",message:r},a=/near "([^"]*)"/i.exec(r);if(a&&e!==void 0&&a[1]!==""){let i=e.indexOf(a[1]);i>=0&&(o.position=i)}return o}return{code:"server",message:r}}var WN,gd=E(()=>{"use strict";WN=new Set(["helper-missing","helper-outdated","auth-failed","tls-failed","network","timeout","cancelled","read-only","syntax","server","connection-lost","limit-reached","not-a-database"])});function Co(t,e){let n=typeof t=="string"?t:"",r=n.length,o=0,a=r>0&&n.charCodeAt(0)===65279;a&&(o=1);let i,l=Nn(n,o,r);for(let b of JN)if(n.startsWith(b,l)){i=b,o=l+b.length;break}let s=r4(e?.contentType);if($N.has(s)||s===H2){let b=U2(n,o,r,s===H2?ZN:`
`);return df(n,"ndjson",{t:"arr",items:b},i,a)}ol=0,al=0,Fr=-1;let f=Nn(n,o,r),c=X2(n,f,r);if(c===null)return df(n,"json",null,i,a);let d=xf,u=Nn(n,d,r);if(u>=r)return df(n,"json",c,i,a);let p=u,m=`${yd(n,u)} after the JSON value`,x=n.indexOf(`
`,f);if(x>=d&&x<u){let b=U2(n,o,r,`
`);if(b.length>=2)return df(n,"ndjson",{t:"arr",items:b},i,a)}return Fr=p,rl=m,df(n,"json",null,i,a)}function r4(t){if(typeof t!="string")return"";let e=t.indexOf(";");return(e<0?t:t.slice(0,e)).trim().toLowerCase()}function df(t,e,n,r,o){let a=Fr>=0,i=n===null?0:ol,l=n===null?0:al,s;return a?s={ok:!1,kind:e,root:n,error:o4(t,Fr,rl),duplicates:i,inexactNumbers:l}:s={ok:!0,kind:e,root:n,duplicates:i,inexactNumbers:l},r!==void 0&&(s.prefix=r),o&&(s.bom=!0),s}function o4(t,e,n){let r=1,o=0,a=t.indexOf(`
`);for(;a!==-1&&a<e;)r+=1,o=a+1,a=t.indexOf(`
`,o);return{pos:e,line:r,col:e-o+1,message:n}}function U2(t,e,n,r){ol=0,al=0;let o=-1,a="",i=[],l=e;for(;;){let s=t.indexOf(r,l);(s===-1||s>n)&&(s=n);let f=Nn(t,l,s);if(f<s){let c=ol,d=al;Fr=-1;let u=X2(t,f,s);if(u!==null){let p=Nn(t,xf,s);p<s&&(Fr=p,rl=`${yd(t,p)} after the JSON value`,u=null)}u!==null?i.push(u):(ol=c,al=d,o<0&&(o=Fr,a=rl))}if(s>=n)break;l=s+1}return Fr=o,rl=a,i}function Nn(t,e,n){for(;e<n;){let r=t.charCodeAt(e);if(r>32||r!==32&&r!==10&&r!==13&&r!==9)break;e++}return e}function Fe(t,e){return Fr=t,rl=e,null}function yd(t,e){let n=t.codePointAt(e)??0;return`Unexpected token ${n>32&&n<127?String.fromCharCode(n):`U+${n.toString(16).toUpperCase().padStart(4,"0")}`}`}function X2(t,e,n){let r=e,o=null,a=[],i=[],l=null,s=null,f="",c,d=!1,u=pf;for(;;)if(u===pf){if(r=Nn(t,r,n),r>=n)return Fe(r,mf);let p=t.charCodeAt(r),m;if(p===34){if(r=Uy(t,r,n),r<0)return null;m=hf===void 0?{t:"str",value:il}:{t:"str",value:il,raw:hf}}else if(p===123)m={t:"obj",entries:[]},r++;else if(p===91)m={t:"arr",items:[]},r++;else if(p===45||p>=48&&p<=57){let x=l4(t,r,n);if(x===null)return null;m=x,r=xf}else if(p===116){if(!_y(t,r,n,"true"))return null;m={t:"bool",value:!0},r+=4}else if(p===102){if(!_y(t,r,n,"false"))return null;m={t:"bool",value:!1},r+=5}else if(p===110){if(!_y(t,r,n,"null"))return null;m={t:"null"},r+=4}else return Fe(r,yd(t,r));if(l===null)o=m;else if(l.t==="arr")l.items.push(m);else{let x={key:f,value:m};c!==void 0&&(x.keyRaw=c),d&&(x.dup=!0),l.entries.push(x)}if(m.t==="obj"||m.t==="arr")if(r=Nn(t,r,n),r<n&&t.charCodeAt(r)===(m.t==="obj"?125:93))r++;else{l!==null&&(a.push(l),i.push(s)),l=m,s=null,u=m.t==="obj"?V2:pf;continue}u=j2}else if(u===j2){if(l===null)return xf=r,o;if(r=Nn(t,r,n),r>=n)return Fe(r,mf);let p=t.charCodeAt(r),m=l.t==="obj"?125:93;if(p===44){let x=r;if(r=Nn(t,r+1,n),r<n&&t.charCodeAt(r)===m)return Fe(x,"Trailing comma");u=l.t==="obj"?V2:pf}else if(p===m)r++,l=a.pop()??null,s=i.pop()??null;else return Fe(r,l.t==="obj"?"Expected ',' or '}' after property value":"Expected ',' or ']' after array element")}else{if(r=Nn(t,r,n),r>=n)return Fe(r,mf);if(t.charCodeAt(r)!==34)return Fe(r,"Expected property name");if(r=Uy(t,r,n),r<0)return null;if(f=il,c=hf,d=!1,s!==null)s.has(f)?d=!0:s.add(f);else{let p=l.entries;for(let m=0;m<p.length;m++)if(p[m].key===f){d=!0;break}if(p.length>=e4){s=new Set;for(let m=0;m<p.length;m++)s.add(p[m].key);s.add(f)}}if(d&&ol++,r=Nn(t,r,n),r>=n)return Fe(r,mf);if(t.charCodeAt(r)!==58)return Fe(r,"Expected ':' after property name");r++,u=pf}}function _y(t,e,n,r){for(let o=1;o<r.length;o++){let a=e+o;if(a>=n)return Fe(a,mf),!1;if(t.charCodeAt(a)!==r.charCodeAt(o))return Fe(a,yd(t,a)),!1}return!0}function Uy(t,e,n){let r=!1;for(let o=e+1;o<n;o++){let a=t.charCodeAt(o);if(a===34)return il=t.slice(e+1,o),hf=r?t.slice(e,o+1):void 0,o+1;if(a===92)return a4(t,e,o,n);if(a<32)return Fe(o,"Bad control character in string"),-1;(a&63488)===55296&&(a<56320&&o+1<n&&(t.charCodeAt(o+1)&64512)===56320?o++:r=!0)}return Fe(e,"Unterminated string"),-1}function a4(t,e,n,r){let o=t.slice(e+1,n),a=n,i=n;for(;i<r;){let l=t.charCodeAt(i);if(l===34){o+=t.slice(a,i);let s=t.slice(e,i+1);return il=o,hf=JSON.stringify(o)===s?void 0:s,i+1}if(l===92){if(o+=t.slice(a,i),i+1>=r)return Fe(e,"Unterminated string"),-1;let s=t.charCodeAt(i+1),f,c=2;if(s===34)f='"';else if(s===92)f="\\";else if(s===47)f="/";else if(s===98)f="\b";else if(s===102)f="\f";else if(s===110)f=`
`;else if(s===114)f="\r";else if(s===116)f="	";else if(s===117){let d=i4(t,i+2,r);if(d<0)return Fe(i,"Invalid Unicode escape"),-1;f=String.fromCharCode(d),c=6}else return Fe(i,"Invalid escape sequence"),-1;o+=f,i+=c,a=i;continue}if(l<32)return Fe(i,"Bad control character in string"),-1;i++}return Fe(e,"Unterminated string"),-1}function i4(t,e,n){if(e+4>n)return-1;let r=0;for(let o=0;o<4;o++){let a=t.charCodeAt(e+o),i;if(a>=48&&a<=57)i=a-48;else if(a>=97&&a<=102)i=a-97+10;else if(a>=65&&a<=70)i=a-65+10;else return-1;r=r*16+i}return r}function l4(t,e,n){let r=e,o=t.charCodeAt(r),a=o===45;if(a&&(r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57))return Fe(r,"No number after minus sign");let i=!1,l=-1,s=0;if(o===48){if(r++,r<n){let u=t.charCodeAt(r);if(u>=48&&u<=57)return Fe(r-1,"Leading zeros are not allowed")}}else for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)s++,r++;if(r<n&&t.charCodeAt(r)===46){if(l=r-e,r++,o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Fe(r,"Unterminated fractional number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)o!==48&&(i=!0),(s>0||o!==48)&&s++,r++}if(r<n&&(o=t.charCodeAt(r),o===101||o===69)){if(i=!0,r++,r<n&&(o=t.charCodeAt(r),(o===43||o===45)&&r++),o=r<n?t.charCodeAt(r):-1,o<48||o>57)return Fe(r,"Exponent part is missing a number");for(;r<n&&(o=t.charCodeAt(r),!(o<48||o>57));)r++}let f=t.slice(e,r),c=+f,d=s4(f,c,i,l,s,a);return d||al++,xf=r,{t:"num",raw:f,value:c,exact:d}}function s4(t,e,n,r,o,a){return e===0?o===0&&!a:Number.isFinite(e)?n||o<=15?!0:BigInt(e)===BigInt(r<0?t:t.slice(0,r)):!1}function jy(t,e){let n=e?.decoded===!0;if(t.t!=="obj"&&t.t!=="arr")return zy(t,n);if(Py(t))return t.t==="obj"?"{}":"[]";let r=f4(e?.indent),o=r>0,a=[],i=d=>{let u=d<64?d:64;return a[u]??(a[u]=`
`+" ".repeat(u*r))},l=o?": ":":",s=t.t==="obj"?"{":"[",f=[t],c=[0];e:for(;f.length>0;){let d=f.length-1,u=f[d];if(u.t==="arr"){let p=u.items;for(let m=c[d];m<p.length;m++){m>0&&(s+=","),o&&(s+=i(d+1));let x=p[m];if(x.t==="obj"||x.t==="arr"){if(Py(x)){s+=x.t==="obj"?"{}":"[]";continue}s+=x.t==="obj"?"{":"[",c[d]=m+1,f.push(x),c.push(0);continue e}s+=zy(x,n)}}else{let p=u.entries;for(let m=c[d];m<p.length;m++){m>0&&(s+=","),o&&(s+=i(d+1));let x=p[m];s+=c4(x,n)+l;let b=x.value;if(b.t==="obj"||b.t==="arr"){if(Py(b)){s+=b.t==="obj"?"{}":"[]";continue}s+=b.t==="obj"?"{":"[",c[d]=m+1,f.push(b),c.push(0);continue e}s+=zy(b,n)}}f.pop(),c.pop(),o&&(s+=i(d)),s+=u.t==="obj"?"}":"]"}return s}function Py(t){return t.t==="obj"?t.entries.length===0:t.items.length===0}function f4(t){return typeof t!="number"||!(t>=1)?0:Math.min(10,Math.floor(t))}function zy(t,e){return t.t==="str"?(e?void 0:Q2(t.raw,t.value))??JSON.stringify(t.value):t.t==="num"?Object.is(Number(t.raw),t.value)?t.raw:JSON.stringify(t.value):t.t==="bool"?t.value?"true":"false":"null"}function c4(t,e){return(e?void 0:Q2(t.keyRaw,t.key))??JSON.stringify(t.key)}function Q2(t,e){if(!(t===void 0||t.charCodeAt(0)!==34))return Uy(t,0,t.length)===t.length&&il===e?t:void 0}function bd(t,e){let n=e?.bigint===!0;if(t.t!=="obj"&&t.t!=="arr")return Hy(t,n);let r=t.t==="obj"?{}:[],o=[t],a=[r],i=[0];e:for(;o.length>0;){let l=o.length-1,s=o[l];if(s.t==="arr"){let f=s.items,c=a[l];for(let d=i[l];d<f.length;d++){let u=f[d];if(u.t==="obj"||u.t==="arr"){let p=u.t==="obj"?{}:[];c.push(p),i[l]=d+1,o.push(u),a.push(p),i.push(0);continue e}c.push(Hy(u,n))}}else{let f=s.entries,c=a[l];for(let d=i[l];d<f.length;d++){let u=f[d],p=u.value;if(p.t==="obj"||p.t==="arr"){let m=p.t==="obj"?{}:[];G2(c,u.key,m),i[l]=d+1,o.push(p),a.push(m),i.push(0);continue e}G2(c,u.key,Hy(p,n))}}o.pop(),a.pop(),i.pop()}return r}function G2(t,e,n){Object.defineProperty(t,e,{value:n,writable:!0,enumerable:!0,configurable:!0})}function Hy(t,e){if(t.t==="num"){let{raw:n,value:r}=t;if(!(Math.abs(r)<=Number.MAX_SAFE_INTEGER)&&n4.test(n)){if(!e)return new Lr(n);let o=n.indexOf(".");return BigInt(o<0?n:n.slice(0,o))}return r}return t.t==="str"||t.t==="bool"?t.value:null}var mf,JN,$N,H2,ZN,e4,t4,n4,xf,Fr,rl,ol,al,il,hf,pf,j2,V2,Lr,Ao=E(()=>{"use strict";mf="Unexpected end of input",JN=[")]}',",")]}'","while(1);","for(;;);","for (;;);"],$N=new Set(["application/x-ndjson","application/jsonl"]),H2="application/json-seq",ZN="",e4=8,t4=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/,n4=/^-?\d+(?:\.0+)?$/,xf=0,Fr=0,rl="",ol=0,al=0,il="";pf=0,j2=1,V2=2;Lr=class{constructor(e){rr(this,"raw");if(typeof e!="string"||!t4.test(e))throw new TypeError(`Not a JSON number: ${String(e).slice(0,40)}`);this.raw=e}valueOf(){return Number(this.raw)}toString(){return this.raw}toJSON(){let e=JSON.rawJSON;return typeof e=="function"?e.call(JSON,this.raw):this.raw}}});var Id=E(()=>{"use strict"});function vd(t){return typeof t=="object"&&t!==null}function Ca(t,e=""){if(t===null)return{text:"NULL",truncated:!1,kind:"null"};if(typeof t=="number")return{text:String(t),truncated:!1,kind:"number"};if(typeof t=="boolean")return{text:String(t),truncated:!1,kind:"boolean"};if(vd(t))return{text:`\\x${t.hex}\u2026 (${t.length} bytes)`,truncated:!1,kind:"blob"};let n=t.length>W2,r=n?t.slice(0,W2):t;if(p4.test(e)&&m4.test(t))return{text:r,truncated:n,kind:"number"};let o=t.trimStart()[0],a=(o==="{"||o==="[")&&Co(t).ok;return{text:r,truncated:n,kind:a?"json":"text"}}function K2(t){if(t===null)return"";let e=vd(t)?t.hex:String(t);return/[,"\r\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function Y2(t,e){let n=[t.map(r=>K2(r.name)).join(",")];for(let r of e)n.push(r.map(K2).join(","));return n.join(`\r
`)}function h4(t){let e=new Set(t.map(r=>r.name)),n=new Set;return t.map(({name:r})=>{if(!n.has(r))return n.add(r),r;let o=2;for(;e.has(`${r}_${o}`);)o++;let a=`${r}_${o}`;return e.add(a),a})}function J2(t,e){let n=h4(t),r=e.map(o=>{let a={};return n.forEach((i,l)=>{Object.defineProperty(a,i,{value:o[l]??null,enumerable:!0,writable:!0,configurable:!0})}),a});return JSON.stringify(r,null,2)}function To(t,e){let n=e==="mysql"?"`":'"';return n+t.split(n).join(n+n)+n}function x4(t){return t===null?"NULL":typeof t=="number"?String(t):typeof t=="boolean"?t?"TRUE":"FALSE":vd(t)?`X'${t.hex}'`:`'${t.replace(/'/g,"''")}'`}function g4(t,e,n,r){let o=`INSERT INTO ${To(t,r)} (${e.map(a=>To(a.name,r)).join(", ")}) VALUES (`;return n.map(a=>`${o}${a.map(x4).join(", ")});`).join(`
`)}function wd(t){return vd(t)&&t.hex.length<t.length*2}function $2(t){let e=0;for(let n of t)for(let r of n)wd(r)&&e++;return e}function Vy(t){return`${t} blob values were truncated to ${d4} bytes`}function Z2(t,e,n,r){let o=[],a=0;for(let i of n){let l=i.filter(wd).map(s=>`${s.length} bytes`);l.length&&o.push(`-- blob truncated: ${l.join(", ")}`),a+=l.length,o.push(g4(t,e,[i],r))}return{text:o.join(`
`),truncatedBlobs:a}}function ll(t){return Number.isNaN(t)?1e3:Math.min(5e4,Math.max(1,Math.trunc(t)))}var W2,d4,p4,m4,Nr=E(()=>{"use strict";Ao();Id();W2=65536,d4=256;p4=/INT|NUMERIC|DECIMAL|REAL|FLOAT|DOUBLE/i,m4=/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/});var eA,tA=E(()=>{"use strict";xd();gd();cf();Nr();eA={readOnlyEnforced:!0,cancel:!0,transactions:!0,cursor:!1,multiStatement:!0}});function aA(){let t=typeof chrome<"u"?chrome.runtime?.getURL?.(y4):void 0;if(!t)throw{code:"connection-lost",message:"The SQL worker is only available on the extension page."};return new Worker(t)}function iA(t){let e=null,n=1,r=new Map,o=null,a=!0,i=!1,l=null,s=Promise.resolve();function f(){let g=t();return g.onmessage=I=>{if(g!==e)return;let v=I.data,S=r.get(v.id);S&&(r.delete(v.id),v.ok?S.resolve(v.value):S.reject(Ln(v.error)))},g.onerror=()=>{g===e&&(l=rA,c(rA))},e=g,g}function c(g=nA){let I=e;e=null,I?.terminate();for(let v of r.values())v.reject(g);r.clear()}function d(g,I){let v=e;if(!v)return Promise.reject(l??nA);let S=n++;return new Promise((w,k)=>{r.set(S,{resolve:w,reject:k});try{v.postMessage({id:S,...g},I)}catch(A){r.delete(S),k(Ln(A))}})}function u(g,I){return Promise.resolve().then(()=>(c(),f(),d({op:"open",bytes:g,readOnly:I})))}async function p(g,I){let v=u(g,I);s=v.catch(()=>{});try{await v}catch(S){throw c(),o=null,l=null,S}o=g.slice(),a=I,i=!1,l=null}async function m(){if(await s,l)throw l}async function x(g,I,v){if(v?.aborted||(await m(),v?.aborted))throw Gy;let S=d({op:"execute",sql:g,opts:I}),w=!1,k=()=>{w=!0;let A=o,R=a;c(),A&&(s=u(A,R).then(()=>{i=!1},()=>{c(oA),l=oA}))};v?.addEventListener("abort",k,{once:!0});try{let A=await S;return!a&&nl(g,"sqlite").kind!=="read"&&(i=!0),A}catch(A){throw w?Gy:(!a&&A.code!=="cancelled"&&nl(g,"sqlite").kind!=="read"&&(i=!0),A)}finally{v?.removeEventListener("abort",k)}}async function b(){return await m(),d({op:"introspect"})}async function h(){await m();let g=await d({op:"export"});return o=g,i=!1,g.slice()}async function y(){c(),o=null,i=!1,l=null,s=Promise.resolve()}return{dialect:"sqlite",capabilities:eA,open:p,introspect:b,execute:x,exportBytes:h,close:y,get dirty(){return i}}}var Gy,nA,rA,oA,y4,lA=E(()=>{"use strict";xd();gd();tA();Gy={code:"cancelled",message:"Query cancelled."},nA={code:"connection-lost",message:"No database is open."},rA={code:"connection-lost",message:"The SQL worker stopped. Open the file again."},oA={code:"connection-lost",message:"The database could not be reopened. Open the file again."},y4="dist/sql-worker.js?opfs-disable&opfs-wl-disable"});function Sd(t,e){let n=typeof e=="object"&&e!==null&&"code"in e&&e.code==="storage-unavailable"?"storage-unavailable":t,r=n==="storage-write-failed"&&typeof e=="object"&&e!==null&&"reason"in e&&e.reason==="quota";return Object.assign(new Error(n),{code:n},r?{reason:"quota"}:{})}async function sl(t,e){if(typeof window.XRAY_Store?.get!="function")throw Sd("storage-unavailable");try{return await window.XRAY_Store.get(t,e,!0)??e}catch(n){throw Sd("storage-read-failed",n)}}async function sA(t,e){if(typeof window.XRAY_Store?.set!="function")throw Sd("storage-unavailable");try{await window.XRAY_Store.set(t,e,!0)}catch(n){throw Sd("storage-write-failed",n)}}var Xy=E(()=>{"use strict"});function fA(t,e,n){return`SELECT * FROM ${n==="sqlite"&&t==="main"?To(e,n):`${To(t,n)}.${To(e,n)}`} LIMIT 100;`}function cA(t,e="sqlite"){let n={},r=e==="mysql"?null:b4[e];for(let o of t.schemas){let a=e==="mysql"||o.name===r;for(let i of[...o.tables,...o.views])n[a?i.name:`${o.name}.${i.name}`]=i.columns.map(l=>l.name)}return n}var b4,Qy=E(()=>{"use strict";Nr();b4={sqlite:"main",postgres:"public",mysql:null}});function uA(t,e,n,r){return typeof t!="number"||!Number.isFinite(t)?r:Math.min(n,Math.max(e,t))}function Wy(t){return uA(t,Jy,$y,Yy.editorPct)}function I4(t){return Math.round(uA(t,Zy,eb,Yy.railPx))}function kd(t){if(!t||typeof t!="object"||Array.isArray(t))return{...Yy};let e=t;return{editorPct:Wy(e.editorPct),railPx:I4(e.railPx)}}function dA(t,e,n){return n>0?Wy(t+e/n*100):Wy(t)}var Ky,Yy,Jy,$y,Zy,eb,tb,Cd=E(()=>{"use strict";Ky="sql_layout",Yy={editorPct:30,railPx:220},Jy=15,$y=75,Zy=160,eb=420,tb=24});function mA(t,e,n){let r=t[e]??[],o=r[0]&&r[0].sql===n.sql?r.slice(1):r;return{...t,[e]:[n,...o].slice(0,v4)}}function gf(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():(pA+=1,`tab-${Date.now().toString(36)}-${pA}`)}function Ad(t,e){let n=Array.isArray(t)?t:t&&typeof t=="object"?t[e]:void 0,r=[];if(Array.isArray(n))for(let o of n){if(!o||typeof o!="object"||typeof o.sql!="string")continue;let a=o;r.push({id:typeof a.id=="string"&&a.id?a.id:gf(),title:typeof a.title=="string"&&a.title?a.title:`Query ${r.length+1}`,sql:a.sql,maxRows:typeof a.maxRows=="number"?ll(a.maxRows):1e3})}return r.length?r:[{id:gf(),title:"Query 1",sql:"",maxRows:1e3}]}function hA(t,e){return`sqlite:${t}:${e}`}var nb,rb,v4,pA,xA=E(()=>{"use strict";Nr();Id();nb="sql_history",rb="sql_editor_tabs",v4=200;pA=0});function Oo(){return ob??(ob=iA(aA)),ob}function cl(){return Oo().dirty||Do}function sb(t){SA=t}function yA(t){if(!t||typeof t!="object"||Array.isArray(t))return{};let e={};for(let[n,r]of Object.entries(t))Array.isArray(r)&&(e[n]=r);return e}function fb(){return ab??(ab=Promise.all([sl(nb,{}).catch(()=>({})),sl(rb,{}).catch(()=>({})),sl(Ky,null).catch(()=>null)]).then(([t,e,n])=>{dl=yA(t),pl=yA(e),yf=kd(n),P.setState({layout:yf})})),ab}function S4(t,e){let n=bf.get(t);n&&clearTimeout(n),Dd.set(t,e),bf.set(t,setTimeout(()=>{bf.delete(t),Dd.delete(t),e()},w4))}function cb(){for(let[t,e]of bf)clearTimeout(e),Dd.get(t)?.();bf.clear(),Dd.clear()}function ib(t,e){S4(t,()=>{sA(t,e()).catch(()=>{})})}function ul(t){return t.code==="not-a-database"?{...t,message:wA,detail:t.message}:t}function Mo(t,...e){let n=[...t,...e];return n.length>gA?n.slice(n.length-gA):n}function bA(t){return`${Math.round(t)} ms`}function If(t){return t.columns.length===0?`${t.affected??0} rows affected \xB7 ${bA(t.durationMs)}`:`${t.rowCount} rows \xB7 ${bA(t.durationMs)}`}function k4(t){if(t.length===0)return!0;if(t.length<lb.length)return!1;for(let e=0;e<lb.length;e++)if(t[e]!==lb.charCodeAt(e))return!1;return!0}function IA(t){return{id:gf(),title:`Query ${t}`,sql:"",maxRows:1e3}}function C4(t,e){let n=URL.createObjectURL(new Blob([t],{type:"application/vnd.sqlite3"})),r=document.createElement("a");r.href=n,r.download=e,r.rel="noopener",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),6e4)}var wA,gA,w4,ob,Aa,fl,Do,SA,Td,Md,dl,pl,yf,ab,bf,Dd,lb,vA,P,Ta=E(()=>{"use strict";xS();lA();Xy();xd();gd();Qy();cf();Nr();Cd();xA();Id();wA="This file is not a SQLite database.",gA=500,w4=300,ob=null,Aa=null,fl=null,Do=!1,SA=null,Td=null,Md=null,dl={},pl={},yf=kd(void 0),ab=null,bf=new Map,Dd=new Map;lb="SQLite format 3\0";vA=Ad(void 0,""),P=mS((t,e)=>{function n(){let u=e().connection;u&&(pl={...pl,[u.key]:e().tabs},ib(rb,()=>pl))}function r(u){let p=e().connection;p&&(dl=mA(dl,p.key,u),t({history:dl[p.key]??[]}),ib(nb,()=>dl))}function o(...u){t({messages:Mo(e().messages,...u)})}function a(u,p){Md=p,t({pendingPrompt:u})}async function i(){try{let u=await Oo().introspect();t({schema:u,dirty:cl()})}catch(u){let p=ul(Ln(u));t({dirty:cl()}),o(p.message)}}async function l(u,p){await fb(),cb();let m=!!e().connection,x=m?!0:e().readOnlyChoice;t({opening:!0,error:null,errorAt:null});let b;try{b=new Uint8Array(await u.arrayBuffer())}catch(v){let S=v instanceof Error?v.message:String(v);t({opening:!1,bottomTab:"messages",messages:Mo(e().messages,`${u.name}: ${S}`)});return}if(!k4(b)){let v={code:"not-a-database",message:wA};t({opening:!1,error:v,bottomTab:"messages",messages:Mo(e().messages,`${u.name}: ${v.message}`)});return}try{await Oo().open(b,x)}catch(v){let S=ul(Ln(v));Aa=null,fl=null,Do=!1;let w=m?Ad(void 0,""):null;t({...w?{tabs:w,activeTabId:w[0].id,errorAt:null}:{},opening:!1,connection:null,schema:null,result:null,resultTable:null,dirty:!1,history:[],readOnlyChoice:!0,error:S,bottomTab:"messages",messages:Mo(e().messages,`${u.name}: ${S.message}`)});return}Aa=b,fl=p??null,Do=!1;let h=hA(u.name,u.size),y=pl[h]||m?Ad(pl,h):e().tabs,g=null,I=null;try{g=await Oo().introspect()}catch(v){I=ul(Ln(v)).message}t({opening:!1,connection:{name:u.name,size:u.size,readOnly:x,key:h},readOnlyChoice:x,schema:g,tabs:y,activeTabId:y[0].id,result:null,resultTable:null,error:null,errorAt:null,dirty:!1,history:dl[h]??[],bottomTab:"results",messages:Mo(e().messages,`Opened ${u.name}${x?" (read-only)":""}.`,...I?[I]:[])}),n()}async function s(u){let p=e().connection;if(!(!p||!Aa)){try{await Oo().open(Aa,u)}catch(m){let x=ul(Ln(m));Aa=null,fl=null,Do=!1,t({connection:null,schema:null,dirty:!1,error:x,bottomTab:"messages"}),o(x.message);return}Do=!1,t({connection:{...p,readOnly:u},readOnlyChoice:u,dirty:!1}),o(u?`${p.name} is read-only.`:`${p.name} is open for writing. Save writes changes back.`),await i()}}async function f(u,p,m){let x=new AbortController;t({running:{tabId:u.tabId,controller:x},error:null,errorAt:null});let b=Date.now();try{let h=await Oo().execute(p.text,{maxRows:u.maxRows},x.signal);r({sql:p.text,at:b,durationMs:Math.round(h.durationMs),rowCount:h.columns.length?h.rowCount:h.affected,ok:!0});let y=[...h.notices];return h.truncatedCells>0&&y.push(`${h.truncatedCells} long text values were cut for display.`),t({running:null,result:h,resultTable:u.resultTable,dirty:cl(),bottomTab:"results",messages:Mo(e().messages,If(h),...y)}),m!=="read"&&await i(),!0}catch(h){let y=ul(Ln(h));return r({sql:p.text,at:b,durationMs:Date.now()-b,rowCount:null,ok:!1,error:y.message}),t({running:null,error:y,errorAt:y.position===void 0?null:{tabId:u.tabId,position:y.position+p.from},dirty:cl(),bottomTab:"messages",messages:Mo(e().messages,y.message)}),y.code==="cancelled"&&await i(),!1}}async function c(u,p){for(Td=null;u.index<u.items.length;){let m=e().connection;if(!m)return;let x=u.items[u.index],b=nl(x.text,"sqlite");if(m.readOnly&&b.kind!=="read"&&b.reason!=="could not parse"){let h={code:"read-only",message:`This connection is read-only. Turn off Read-only to run ${b.reason}.`};t({error:h,errorAt:null,bottomTab:"messages",messages:Mo(e().messages,h.message)});return}if(!m.readOnly&&b.kind==="dangerous"&&u.index!==p){Td=u,t({pendingConfirm:{sql:x.text,reason:b.reason}});return}if(!await f(u,x,b.kind))return;u.index+=1}}function d(){let u=e();return!!u.connection&&!u.running&&!u.opening&&!u.pendingConfirm&&!u.pendingPrompt}return{connection:null,schema:null,tabs:vA,activeTabId:vA[0].id,running:null,result:null,error:null,messages:[],history:[],pendingConfirm:null,dirty:!1,opening:!1,readOnlyChoice:!0,errorAt:null,resultTable:null,bottomTab:"results",pendingPrompt:null,layout:yf,cursor:{line:1,col:1},async openFile(u,p){let m=e();if(!(m.running||m.opening)){if(m.dirty&&m.connection){a({title:"Discard unsaved changes?",message:`Opening ${u.name} discards the unsaved changes in ${m.connection.name}.`,confirmLabel:"Discard changes"},()=>l(u,p));return}await l(u,p)}},async run(u){if(!d())return;let p=e(),m=p.tabs.find(h=>h.id===p.activeTabId);if(!m)return;let x=m.sql,b=[];if(u==="all")b=ff(x,"sqlite").map(h=>({text:h.text,from:h.from}));else{let h=SA?.()??{from:x.length,to:x.length,head:x.length},y=Math.max(0,Math.min(h.from,x.length)),g=Math.max(y,Math.min(h.to,x.length));if(g>y&&x.slice(y,g).trim())b=[{text:x.slice(y,g),from:y}];else{let I=hd(x,Math.min(h.head,x.length),"sqlite");I&&(b=[{text:I.text,from:I.from}])}}if(!b.length){o("Nothing to run.");return}await c({tabId:m.id,items:b,index:0,maxRows:m.maxRows,resultTable:null},-1)},stop(){let u=e().running;if(u){if(Oo().dirty){a({title:"Stop the query?",message:"Stopping restarts the database and loses unsaved changes.",confirmLabel:"Stop anyway"},()=>e().running?.controller.abort());return}u.controller.abort()}},async confirmPending(){let u=Td;t({pendingConfirm:null}),u&&await c(u,u.index)},cancelPending(){Td=null,t({pendingConfirm:null}),o("Statement not run.")},async confirmPrompt(){let u=Md;Md=null,t({pendingPrompt:null}),await u?.()},cancelPrompt(){Md=null,t({pendingPrompt:null})},async previewTable(u,p){if(!d())return;let m=fA(u,p,"sqlite"),x=e().tabs.find(h=>h.title===p&&h.sql===m),b=x??{id:gf(),title:p,sql:m,maxRows:1e3};t({tabs:x?e().tabs:[...e().tabs,b],activeTabId:b.id}),n(),await c({tabId:b.id,items:[{text:m,from:0}],index:0,maxRows:b.maxRows,resultTable:p},-1)},async setReadOnly(u){let p=e();if(!p.connection){t({readOnlyChoice:u});return}if(!(u===p.connection.readOnly||p.running||p.opening)){if(u&&(p.dirty||cl())){a({title:"Discard unsaved changes?",message:`Turning Read-only back on reopens ${p.connection.name} as last opened or saved. Unsaved changes are lost.`,confirmLabel:"Discard changes"},async()=>{t({readOnlyChoice:!0,opening:!0});try{await s(!0)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}});return}t({readOnlyChoice:u,opening:!0});try{await s(u)}finally{t({opening:!1,readOnlyChoice:e().connection?.readOnly??!0})}}},async save(){let u=e(),p=u.connection;if(!p||!u.dirty||u.running)return;let m;try{m=await Oo().exportBytes()}catch(x){let b=ul(Ln(x));t({error:b,bottomTab:"messages"}),o(`Could not save ${p.name}: ${b.message}`);return}try{if(fl&&typeof fl.createWritable=="function"){let x=await fl.createWritable();await x.write(m),await x.close(),o(`Saved ${p.name}.`),Aa=m,Do=!1,t({dirty:cl()})}else C4(m,p.name),o("Download started \u2014 the file is saved when the download completes."),Aa=m,Do=!0,t({dirty:!0})}catch(x){let b=x instanceof Error?x.message:String(x);Do=!0,t({dirty:!0,bottomTab:"messages"}),o(`Could not save ${p.name}: ${b}`)}},setMaxRows(u){let p=e().activeTabId,m=ll(u);t({tabs:e().tabs.map(x=>x.id===p?{...x,maxRows:m}:x)}),n()},addTab(){let u=IA(e().tabs.length+1);t({tabs:[...e().tabs,u],activeTabId:u.id}),n()},closeTab(u){let p=e();if(p.running?.tabId===u)return;let m=p.tabs.findIndex(h=>h.id===u);if(m<0)return;let x=p.tabs.filter(h=>h.id!==u);x.length||(x=[IA(1)]);let b=p.activeTabId===u?x[Math.min(m,x.length-1)].id:p.activeTabId;t({tabs:x,activeTabId:b,errorAt:p.errorAt?.tabId===u?null:p.errorAt}),n()},setActiveTab(u){e().tabs.some(p=>p.id===u)&&t({activeTabId:u})},updateTabSql(u,p){let m=e(),x=m.tabs.find(b=>b.id===u);!x||x.sql===p||(t({tabs:m.tabs.map(b=>b.id===u?{...b,sql:p}:b),errorAt:m.errorAt?.tabId===u?null:m.errorAt}),n())},setBottomTab(u){t({bottomTab:u})},setLayout(u){let p=kd({...e().layout,...u}),m=e().layout;p.editorPct===m.editorPct&&p.railPx===m.railPx||(yf=p,t({layout:p}),ib(Ky,()=>yf))},setCursor(u,p){let m=e().cursor;(m.line!==u||m.col!==p)&&t({cursor:{line:u,col:p}})}}})});function Od(t){return typeof t=="string"&&DA.test(t)}function T4(t){return Nt(t,"")!==""}function Nt(t,e){if(typeof t=="string"){let n=t.trim();if(/^[0-9a-fA-F]{6}$/.test(n)&&(n="#"+n),/^#[0-9a-fA-F]{3}$/.test(n)&&(n="#"+n.slice(1).split("").map(r=>r+r).join("")),DA.test(n))return n.toLowerCase()}return e}function OA(t){let e=t||{},n={bg:Nt(e.bg,vn.bg),surface:Nt(e.surface,vn.surface),text:Nt(e.text,vn.text),accent:Nt(e.accent,vn.accent)};for(let r of A4){let o=e[r];T4(o)&&(n[r]=Nt(o,"#000000"))}return n}function he(t){let e=parseInt(t.slice(1),16);return[e>>16&255,e>>8&255,e&255]}function be([t,e,n]){let r=o=>Math.max(0,Math.min(255,Math.round(o))).toString(16).padStart(2,"0");return`#${r(t)}${r(e)}${r(n)}`}function Ma([t,e,n]){return`${Math.round(t)}, ${Math.round(e)}, ${Math.round(n)}`}function Be(t,e,n){return[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n,t[2]+(e[2]-t[2])*n]}function BA([t,e,n]){return .2126*t+.7152*e+.0722*n}function ub(t){let e=t/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)}function kA([t,e,n]){return .2126*ub(t)+.7152*ub(e)+.0722*ub(n)}function Bd(t,e){let n=kA(t),r=kA(e);return(Math.max(n,r)+.05)/(Math.min(n,r)+.05)}function RA(t){let e=t/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function M4(t){return(t<=.0031308?12.92*t:1.055*t**.4166666666666667-.055)*255}function vf(t){let[e,n,r]=t.map(RA),o=Math.cbrt(.4122214708*e+.5363325363*n+.0514459929*r),a=Math.cbrt(.2119034982*e+.6806995451*n+.1073969566*r),i=Math.cbrt(.0883024619*e+.2817188376*n+.6299787005*r),l=.2104542553*o+.793617785*a-.0040720468*i,s=1.9779984951*o-2.428592205*a+.4505937099*i,f=.0259040371*o+.7827717662*a-.808675766*i;return[l,Math.hypot(s,f),Math.atan2(f,s)]}function db(t,e,n){let r=e*Math.cos(n),o=e*Math.sin(n),a=(t+.3963377774*r+.2158037573*o)**3,i=(t-.1055613458*r-.0638541728*o)**3,l=(t-.0894841775*r-1.291485548*o)**3;return[4.0767416621*a-3.3077115913*i+.2309699292*l,-1.2684380046*a+2.6097574011*i-.3413193965*l,-.0041960863*a-.7034186147*i+1.707614701*l]}function D4(t,e,n){let r=i=>i.every(l=>l>=-1e-6&&l<=1.000001),o=0,a=e;if(!r(db(t,a,n))){for(let i=0;i<24;i++){let l=(o+a)/2;r(db(t,l,n))?o=l:a=l}a=o}return db(t,a,n).map(i=>M4(Math.min(1,Math.max(0,i))))}function CA(t){let[e,n,r]=t.map(RA),o=s=>s>216/24389?Math.cbrt(s):(24389/27*s+16)/116,a=o((.4124564*e+.3575761*n+.1804375*r)/.95047),i=o(.2126729*e+.7151522*n+.072175*r),l=o((.0193339*e+.119192*n+.9503041*r)/1.08883);return[116*i-16,500*(a-i),200*(i-l)]}function O4(t,e){let[n,r,o]=CA(t),[a,i,l]=CA(e),s=Math.PI/180,f=(Math.hypot(r,o)+Math.hypot(i,l))/2,c=.5*(1-Math.sqrt(f**7/(f**7+25**7))),d=(1+c)*r,u=(1+c)*i,p=Math.hypot(d,o),m=Math.hypot(u,l),x=(C,_)=>_===0&&C===0?0:(Math.atan2(C,_)/s+360)%360,b=x(o,d),h=x(l,u),y=p*m!==0,g=y?h-b>180?h-b-360:h-b<-180?h-b+360:h-b:0,I=2*Math.sqrt(p*m)*Math.sin(g*s/2),v=(n+a)/2,S=(p+m)/2,w=y?Math.abs(b-h)<=180?(b+h)/2:b+h<360?(b+h+360)/2:(b+h-360)/2:b+h,k=1-.17*Math.cos((w-30)*s)+.24*Math.cos(2*w*s)+.32*Math.cos((3*w+6)*s)-.2*Math.cos((4*w-63)*s),A=1+.015*(v-50)**2/Math.sqrt(20+(v-50)**2),R=1+.045*S,F=1+.015*S*k,L=-Math.sin(60*Math.exp(-(((w-275)/25)**2))*s)*2*Math.sqrt(S**7/(S**7+25**7));return Math.sqrt(((a-n)/A)**2+((m-p)/R)**2+(I/F)**2+L*((m-p)/R)*(I/F))}function ml(t,e,n,r,o=()=>!0){let a=c=>Math.min(...n(c).map(d=>Bd(c,d)))>=r&&o(c);if(a(t))return t;let[i,l,s]=vf(t),f=t;for(let c=i+e*.005;c>=0&&c<=1;c+=e*.005)if(f=he(be(D4(c,l,s))),a(f))return f;return f}function EA(t){let e=he(Nt(t.bg,vn.bg)),n=he(Nt(t.surface,vn.surface)),r=he(Nt(t.text,vn.text)),o=Nt(t.accent,vn.accent),a=BA(e)>140,i=a?R4:B4,l=k=>{let A=t[k];return Od(A)?he(Nt(A,"#000000")):null},s=l("surface2")??he(be(Be(n,r,.1))),f=s,c=s,d=l("hover")??he(be(Be(e,r,.08))),u=k=>he(be(Be(he(o),e,1-k))),p=l("selection")??u(a?.09:.12);for(let k=a?.1:.13;!l("selection")&&k<=.18+1e-9&&O4(p,d)<3.6;k+=.01)p=u(k);let m=vf(r)[0]>vf(e)[0]?1:-1,x=4.51,b=ml(he(be(Be(r,e,a?.32:.38))),m,()=>[e,n,s,f],x),h=ml(he(be(Be(r,e,a?.26:.34))),m,()=>[e,n,s],x,k=>Bd(k,e)>=Bd(b,e)*1.08),y=ml(he(be(Be(r,e,a?.34:.46))),m,()=>[e,n,c],x),g=ml(he(be(Be(n,r,a?.56:.44))),m,()=>[f,e],3.01),I=k=>[e,n,s,c,p,d,Be(e,k,.1),Be(n,k,.1),Be(s,k,.1),Be(p,k,.1)],v=k=>be(ml(he(k),m,I,x)),S={bg:be(e),surface:be(n),surface2:be(Be(n,r,.1)),surface3:be(Be(n,r,.18)),text:be(r),subtext:be(h),hint:be(b),border:be(Be(n,r,.16)),"border-control":be(g),focus:o,selection:be(p),hover:be(d),active:be(Be(he(o),e,.68)),disabled:be(Be(r,e,.62)),accent:o,"accent-soft":be(p),green:v(i.green),red:v(i.red),yellow:v(i.yellow),blue:v(i.blue),mauve:v(i.mauve),teal:v(i.teal),peach:v(i.peach),pending:v(i.yellow),neutral:be(y),shadow:"#000000",overlay:be(e)},w={...S};for(let k of MA){let A=t[k];Od(A)&&(w[k]=Nt(A,S[k]))}return w}function AA(t,e){return!TA.includes(e)&&Od(t[e])}function E4(t,e,n,r){for(let o=r;o<1;o=Math.round((o+.02)*100)/100)if([e,n].every(i=>{let l=Be(i,e,.44);return Bd(Be(l,t,o),l)>=3.01}))return o;return 1}function FA(t){let e=EA(t),n=he(e.bg),r=he(e.surface),o=he(e.surface2),a=he(e.text),i=BA(n)>140,l=Od(t.border)?Nt(t.border,e.border):`rgba(${Ma(a)}, 0.16)`;return{"--xray-bg":e.bg,"--xray-surface":e.surface,"--xray-surface2":e.surface2,"--xray-surface3":e.surface3,"--xray-text":e.text,"--xray-subtext":e.subtext,"--xray-hint":e.hint,"--xray-bg-rgb":Ma(n),"--xray-surface-rgb":Ma(r),"--xray-surface2-rgb":Ma(o),"--xray-text-rgb":Ma(a),"--xray-border":l,"--xray-border-control":e["border-control"],"--xray-focus":e.focus,"--xray-selection":e.selection,"--xray-hover":e.hover,"--xray-active":e.active,"--xray-disabled":e.disabled,"--xray-accent":e.accent,"--xray-accent-soft":e["accent-soft"],"--xray-green":e.green,"--xray-red":e.red,"--xray-yellow":e.yellow,"--xray-blue":e.blue,"--xray-mauve":e.mauve,"--xray-teal":e.teal,"--xray-peach":e.peach,"--xray-pending":e.pending,"--xray-neutral":e.neutral,"--xray-shadow":AA(t,"shadow")?e.shadow:"rgba(0, 0, 0, .38)","--xray-overlay":AA(t,"overlay")?e.overlay:`rgba(${Ma(n)}, .74)`,"--xray-operator-grid":`color-mix(in srgb, ${e.accent} ${i?"4%":"3.5%"}, transparent)`,"--xray-sink":i?"#ffffff":"#000000","--xray-scroll-thumb":`rgba(${Ma(he(e.hint))}, ${E4(he(e.hint),n,r,i?.8:.64)})`}}function pb(t,e=4.51){let n=EA(t),r=he(n.bg),o=he(n.surface),a=he(n.surface2),i=he(n.text),l=he(n.mauve),s=vf(i)[0]>vf(r)[0]?1:-1,f=d=>[Be(o,d,.1),Be(a,d,.1),Be(o,l,.1),Be(a,l,.1),Be(r,d,.14)],c=be(ml(he(Nt(t.accent,vn.accent)),s,f,e));return{...t,accent:c}}var vn,TA,MA,A4,DA,B4,R4,XP,mb=E(()=>{"use strict";vn={bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#a99aff"},TA=["bg","surface","text","accent"],MA=["bg","surface","surface2","surface3","text","subtext","hint","border","border-control","focus","selection","hover","active","disabled","accent","accent-soft","green","red","yellow","blue","mauve","teal","peach","pending","neutral","shadow","overlay"],A4=MA.filter(t=>!TA.includes(t)),DA=/^#[0-9a-fA-F]{6}$/;B4={green:"#a6e3a1",red:"#f38ba8",yellow:"#f9e2af",blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",peach:"#fab387"},R4={green:"#0e7e48",red:"#ad2353",yellow:"#805516",blue:"#1970c0",mauve:"#6135e6",teal:"#0b788a",peach:"#a6370b"};XP=[{label:"Slate",theme:{bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#9479ff"}},{label:"Graphite",theme:{bg:"#0e0e10",surface:"#19191c",text:"#ededed",accent:"#22d3ee"}},{label:"Ros\xE9",theme:{bg:"#1a1114",surface:"#241519",text:"#f4e9ec",accent:"#fb7185"}},{label:"Emerald",theme:{bg:"#0b1210",surface:"#131c19",text:"#e6f0ec",accent:"#34d399"}},{label:"Nord",theme:{bg:"#2e3440",surface:"#3b4252",text:"#eceff4",accent:"#88c0d0"}},{label:"Solarized",theme:{bg:"#002b36",surface:"#073642",text:"#eee8d5",accent:"#268bd2"}},{label:"Amber",theme:{bg:"#161207",surface:"#211a0c",text:"#f6ecd6",accent:"#f5a623"}},{label:"Sakura",theme:{bg:"#1c141a",surface:"#281b26",text:"#f6e9f1",accent:"#ec4899"}},{label:"Paper",theme:{bg:"#faf9f6",surface:"#ffffff",text:"#1c1b19",accent:"#2563eb"}},{label:"Sky",theme:{bg:"#eef4fb",surface:"#ffffff",text:"#16273b",accent:"#0284c7"}},{label:"Sage",theme:{bg:"#eef2ec",surface:"#fbfdfa",text:"#1e2a20",accent:"#3f8a4f"}}].map(({label:t,theme:e})=>({label:t,theme:pb(e)}))});var LA=E(()=>{"use strict";Ao()});function Bo(t,e,n,r){if(typeof t=="string"&&t.trim()===""||typeof t!="number"&&typeof t!="string")return e;let o=Number(t);return Number.isFinite(o)?Math.min(r,Math.max(n,Math.round(o))):e}function hb(t,e=2,n=8e4){let r=[],o="";try{o=JSON.stringify(t,function(a,i){if(typeof i=="bigint")return i.toString()+"n";if(i&&typeof i=="object"){for(;r.length>0&&r[r.length-1]!==this;)r.pop();if(r.includes(i))return"[Circular]";r.push(i)}return i},e)??"undefined"}catch{try{o=String(t)}catch{o="[unserializable]"}}return o.length<=n?o:o.slice(0,n)+`
... truncated ${o.length-n} chars`}var r5,xb=E(()=>{"use strict";LA();Ao();r5=new Intl.DateTimeFormat("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})});function F4(t){return typeof t=="string"&&Object.prototype.hasOwnProperty.call(yb,t)?t:null}function V4(t,e){let n=bb.find(({id:a})=>a===t.theme);if(!n)return gb[e]??gb.blue;let r=`${n.id}:${e}`,o=NA.get(r);if(!o){let a=n.kind==="light"?j4:gb,i=a[e]??a.blue;o=pb({bg:n.preview.bg,text:n.preview.text,accent:i,...n.hosts},n.contrast+.01).accent,NA.set(r,o)}return o}function _A(t){return t.theme==="custom"?t.customTheme?.accent??vn.accent:t.accentChosen?V4(t,t.accent):void 0}function G4(t,e){return N4.includes(t)?t:e}function X4(t,e){return qA.includes(t)?t:e}function Q4(t,e){return q4.includes(t)?t:e}function W4(t,e){return _4.includes(t)?t:e}function K4(t,e){return P4.includes(t)?t:e}function Y4(t,e){return z4.includes(t)?t:e}function zA(t){let e=Object.fromEntries(Object.entries(t||{}).filter(([,d])=>d!==void 0)),n={...et,...e},r=qA.includes(n.accent),o=X4(n.accent,et.accent),a=typeof e.themeRefreshPending!="boolean",i=F4(n.theme),l=i?yb[i].to:Q4(n.theme,et.theme),s=i?yb[i].accent:a&&l==="midnight"?"peach":null,f=s?r&&o!==s:typeof e.accentChosen=="boolean"?e.accentChosen:o!==et.accent,c=!!n.themeRefreshPending||i!==null||s!==null&&!f;return{captureFetch:!!n.captureFetch,captureXhr:!!n.captureXhr,captureWs:!!n.captureWs,maxEntries:Bo(n.maxEntries,et.maxEntries,50,5e3),slowThresholdMs:Bo(n.slowThresholdMs,et.slowThresholdMs,100,5e3),verySlowThresholdMs:Bo(n.verySlowThresholdMs,et.verySlowThresholdMs,200,1e4),defaultDetailView:G4(n.defaultDetailView,et.defaultDetailView),compactRows:!!n.compactRows,showHostInPath:!!n.showHostInPath,accent:o,accentChosen:f,theme:l,customTheme:OA(n.customTheme),font:W4(n.font,et.font),density:K4(n.density,et.density),radius:Bo(n.radius,et.radius,0,20),glow:!!n.glow,hacker:!!n.hacker,confirmDestructiveActions:!!n.confirmDestructiveActions,panelWidth:Bo(n.panelWidth,et.panelWidth,H4,U4),dockSide:Y4(n.dockSide,et.dockSide),apiSplit:Bo(n.apiSplit,et.apiSplit,0,2e3),logsSplit:Bo(n.logsSplit,et.logsSplit,0,2e3),firstRunDismissed:!!n.firstRunDismissed,themeRefreshPending:c,sqlInlineInHud:!!n.sqlInlineInHud}}var bb,yb,l5,L4,N4,qA,q4,_4,P4,z4,H4,U4,gb,j4,NA,PA,et,Rd=E(()=>{"use strict";mb();xb();bb=[{id:"xray-dark",label:"XRAY Dark",kind:"dark",contrast:4.5,preview:{bg:"#141517",accent:"#3dc8f5",text:"#eeeff1"},hosts:{surface:"#1b1c1f",surface2:"#25272a",mauve:"#c6a0f2"}},{id:"xray-light",label:"XRAY Light",kind:"light",contrast:4.5,preview:{bg:"#f3f4f6",accent:"#00698f",text:"#16171a"},hosts:{surface:"#ffffff",surface2:"#eaecef",mauve:"#793fad"}},{id:"github-dark",label:"GitHub Dark",kind:"dark",contrast:4.5,preview:{bg:"#0d1117",accent:"#5297ff",text:"#e6edf3"},hosts:{surface:"#161b22",surface2:"#21262d",mauve:"#ad7fff"}},{id:"github-light",label:"GitHub Light",kind:"light",contrast:4.5,preview:{bg:"#f6f8fa",accent:"#005eca",text:"#1f2328"},hosts:{surface:"#ffffff",surface2:"#eaeef2",mauve:"#723cca"}},{id:"tokyo-night",label:"Tokyo Night",kind:"dark",contrast:4.5,preview:{bg:"#16161e",accent:"#7ba4f9",text:"#c0caf5"},hosts:{surface:"#1a1b26",surface2:"#292e42",mauve:"#bb9af7"}},{id:"catppuccin-mocha",label:"Catppuccin Mocha",kind:"dark",contrast:4.5,preview:{bg:"#181825",accent:"#cba6f7",text:"#cdd6f4"},hosts:{surface:"#1e1e2e",surface2:"#313244",mauve:"#f5c2e7"}},{id:"dracula",label:"Dracula",kind:"dark",contrast:4.5,preview:{bg:"#21222c",accent:"#c59dff",text:"#f8f8f2"},hosts:{surface:"#282a36",surface2:"#343746",mauve:"#ff86ca"}},{id:"gruvbox-dark",label:"Gruvbox Dark",kind:"dark",contrast:4.5,preview:{bg:"#1d2021",accent:"#8ec07c",text:"#ebdbb2"},hosts:{surface:"#282828",surface2:"#3c3836",mauve:"#ea9bb0"}},{id:"midnight",label:"High Contrast",kind:"dark",contrast:7,preview:{bg:"#000000",accent:"#00e5ff",text:"#ffffff"},hosts:{surface:"#101010",surface2:"#1d1d1d",mauve:"#d4a8ff"}}],yb={operator:{to:"xray-dark",accent:"blue"},"dev-edition":{to:"xray-dark",accent:"coral"},"light-lab":{to:"xray-light",accent:"blue"},claude:{to:"xray-light",accent:"coral"}};l5={...Object.fromEntries(bb.map(({id:t,label:e})=>[t,e])),custom:"Custom"},L4=new Map(bb.map(({id:t,kind:e})=>[t,e])),N4=["tree","grid","raw","schema","diff","viz","waterfall","headers"],qA=["blue","mauve","teal","green","peach","coral"],q4=[...L4.keys(),"custom"],_4=["jetbrains","cascadia","iosevka","system"],P4=["compact","comfortable","spacious"],z4=["left","right"],H4=360,U4=2e3,gb={blue:"#d99a2b",mauve:"#cba6f7",teal:"#94e2d5",green:"#a6e3a1",peach:"#f2d457",coral:"#eaa388"},j4={blue:"#845600",mauve:"#7418ec",teal:"#0d696e",green:"#226d15",peach:"#6e6200",coral:"#a23f1e"},NA=new Map;PA={jetbrains:"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",cascadia:"'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",iosevka:"'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",system:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"},et={captureFetch:!0,captureXhr:!0,captureWs:!0,maxEntries:1e3,slowThresholdMs:500,verySlowThresholdMs:1e3,defaultDetailView:"tree",compactRows:!1,showHostInPath:!0,accent:"blue",accentChosen:!1,theme:"xray-dark",customTheme:vn,font:"jetbrains",density:"compact",radius:10,glow:!1,hacker:!1,confirmDestructiveActions:!0,panelWidth:960,dockSide:"right",apiSplit:0,logsSplit:0,firstRunDismissed:!1,themeRefreshPending:!1,sqlInlineInHud:!1}});function HA(t){if(t<1024)return`${t} B`;let e=t/1024;if(e<1024)return`${e<10?e.toFixed(1):Math.round(e)} KB`;let n=e/1024;return`${n<10?n.toFixed(1):Math.round(n)} MB`}function Ed(t){return/mac|iphone|ipad/i.test(t)}function Ib(t){return{mod:t?"Cmd":"Ctrl",run:t?"\u2318 \u21B5":"Ctrl \u21B5",runAll:t?"\u2318 \u21E7 \u21B5":"Ctrl \u21E7 \u21B5"}}function UA(t){let e=Ib(t).mod;return`Write SQL here \u2014 ${e}+Enter runs the statement at the cursor, ${e}+Shift+Enter runs all.`}var vb=E(()=>{"use strict"});var VA=Cn(Fd=>{"use strict";var J4=Symbol.for("react.transitional.element"),$4=Symbol.for("react.fragment");function jA(t,e,n){var r=null;if(n!==void 0&&(r=""+n),e.key!==void 0&&(r=""+e.key),"key"in e){n={};for(var o in e)o!=="key"&&(n[o]=e[o])}else n=e;return e=n.ref,{$$typeof:J4,type:t,key:r,ref:e!==void 0?e:null,props:n}}Fd.Fragment=$4;Fd.jsx=jA;Fd.jsxs=jA});var Ce=Cn((u5,GA)=>{"use strict";GA.exports=VA()});function e3(t){let e=t.getRootNode();return e instanceof ShadowRoot?e:document}function Ld(t){let e=t.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function QA(t,e){let n=Ld(e);return Array.from(t.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(r=>r.offsetParent!==null||r===n)}function Sb(t){let e=Array.from(t.querySelectorAll('[role="dialog"]')).filter(n=>wb.has(n));return e[e.length-1]}function t3(t,e){return Sb(t)===e}function XA(t,e,n){let r=n?.current;if(r&&t.contains(r)){r.focus();return}let o=QA(t,e);(o.find(i=>i.matches('input, select, textarea, [contenteditable="true"]'))||o[0]||null)?.focus()}function kb({title:t,subtitle:e,icon:n,className:r="",children:o,footer:a,initialFocusRef:i,onClose:l}){let s=(0,hl.useRef)(null);return(0,hl.useLayoutEffect)(()=>{let f=s.current;if(f)return wb.set(f,l),()=>{wb.delete(f)}},[l]),(0,hl.useEffect)(()=>{let f=s.current;if(!f)return;let c=e3(f),d=Ld(c),u=Sb(c);u&&(u===f||!u.contains(d))&&XA(u,c,u===f?i:void 0);function p(m){if(m.key!=="Tab"||!f||!t3(c,f))return;let x=QA(f,c);if(!x.length){m.preventDefault();return}let b=x[0],h=x[x.length-1],y=Ld(c);m.shiftKey&&y===b?(m.preventDefault(),h.focus()):!m.shiftKey&&y===h&&(m.preventDefault(),b.focus())}return document.addEventListener("keydown",p,!0),()=>{document.removeEventListener("keydown",p,!0);let m=Sb(c),x=Ld(c);m&&x&&m.contains(x)||(d instanceof HTMLElement&&d.isConnected&&(!m||m.contains(d))?d.focus():m&&XA(m,c))}},[]),(0,Zt.jsx)("div",{className:"xray-modal-backdrop",onMouseDown:l,children:(0,Zt.jsxs)("section",{ref:s,className:`xray-modal ${r}`,role:"dialog","aria-modal":"true","aria-label":t,onMouseDown:f=>f.stopPropagation(),children:[(0,Zt.jsxs)("header",{className:"xray-modal-head",children:[n&&(0,Zt.jsx)("span",{className:"xray-modal-title-icon",children:n}),(0,Zt.jsxs)("div",{children:[(0,Zt.jsx)("h3",{children:t}),e&&(0,Zt.jsx)("div",{className:"xray-modal-subtitle",children:e})]}),(0,Zt.jsx)("span",{className:"xray-spacer"}),(0,Zt.jsx)("button",{className:"xray-icon-btn",onClick:l,"aria-label":`Close ${t}`,children:(0,Zt.jsx)(ra,{...Z4})})]}),o,a&&(0,Zt.jsx)("footer",{className:"xray-modal-foot",children:a})]})})}var hl,Zt,Z4,wb,WA=E(()=>{"use strict";hl=Y(mt());kr();Zt=Y(Ce()),Z4={size:16,stroke:1.8},wb=new WeakMap});function n3(t){return t.columns.map(e=>`${e.name}${e.type?` ${e.type}`:""}${e.pk?" PK":""}`).join(`
`)}function r3(t){return[t.name,t.type,t.pk&&"primary key",!t.nullable&&"not null"].filter(Boolean).join(", ")}function o3({column:t}){return(0,xe.jsxs)("li",{role:"treeitem","aria-level":3,"aria-label":r3(t),className:"xray-sql-rail-column",children:[(0,xe.jsx)("span",{className:"xray-sql-rail-name",children:t.name}),t.type&&(0,xe.jsx)("span",{className:"xray-sql-rail-type",children:t.type}),t.pk&&(0,xe.jsx)("span",{role:"img","aria-label":"primary key",title:"Primary key",className:"xray-sql-rail-marker pk",children:"PK"}),!t.nullable&&(0,xe.jsx)("span",{role:"img","aria-label":"not null",title:"Not null",className:"xray-sql-rail-marker",children:"NN"})]})}function a3({schema:t,table:e,view:n}){let r=P(s=>s.previewTable),o=P(s=>!!s.running||s.opening),[a,i]=(0,Nd.useState)(!1),l=()=>{o||r(t,e.name)};return(0,xe.jsxs)("div",{role:"none",className:"xray-sql-rail-entry",children:[(0,xe.jsxs)("div",{role:"none",className:"xray-sql-rail-row",children:[(0,xe.jsx)("button",{type:"button",className:"xray-sql-rail-toggle","aria-expanded":a,"aria-label":`Columns of ${e.name}`,onClick:()=>i(s=>!s),children:(0,xe.jsx)(jh,{size:12,stroke:2,"aria-hidden":"true"})}),(0,xe.jsxs)("div",{role:"treeitem",tabIndex:0,"aria-level":2,"aria-disabled":o||void 0,className:"xray-sql-rail-item",title:n3(e),onClick:l,onKeyDown:s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),l())},children:[n?(0,xe.jsx)(Xh,{size:14,stroke:1.8,"aria-hidden":"true"}):(0,xe.jsx)(ex,{size:14,stroke:1.8,"aria-hidden":"true"}),(0,xe.jsx)("span",{className:"xray-sql-rail-name",children:e.name})]})]}),a&&(0,xe.jsx)("ul",{role:"group","aria-label":`${e.name} columns`,className:"xray-sql-rail-columns",children:e.columns.map(s=>(0,xe.jsx)(o3,{column:s},s.name))})]})}function KA(){let t=P(n=>n.connection),e=P(n=>n.schema);return(0,xe.jsxs)("nav",{className:"xray-sql-rail","aria-label":"Schema",children:[!t&&(0,xe.jsx)("p",{className:"xray-sql-empty",children:"No database open."}),t&&e&&(0,xe.jsxs)("div",{role:"tree","aria-label":"Tables and views",className:"xray-sql-tree",children:[e.schemas.map(n=>(0,xe.jsxs)(Nd.default.Fragment,{children:[e.schemas.length>1&&(0,xe.jsx)("div",{className:"xray-sql-rail-schema","aria-hidden":"true",children:n.name}),[["Tables",n.tables,!1],["Views",n.views,!0]].map(([r,o,a])=>o.length?(0,xe.jsxs)("div",{role:"group","aria-label":e.schemas.length>1?`${n.name} ${r}`:r,children:[(0,xe.jsxs)("div",{className:"xray-sql-rail-heading","aria-hidden":"true",children:[r," ",(0,xe.jsx)("span",{className:"xray-sql-rail-count",children:o.length})]}),o.map(i=>(0,xe.jsx)(a3,{schema:n.name,table:i,view:a},i.name))]},r):null)]},n.name)),e.schemas.every(n=>!n.tables.length&&!n.views.length)&&(0,xe.jsx)("p",{className:"xray-sql-empty",children:"No tables or views."})]})]})}var Nd,xe,YA=E(()=>{"use strict";Nd=Y(mt());kr();Ta();xe=Y(Ce())});async function s3(t){let e=window.showOpenFilePicker;if(typeof e!="function"){Cb?.click();return}let n;try{[n]=await e.call(window,{multiple:!1,types:l3})}catch(r){if(r?.name==="AbortError")return;Cb?.click();return}n&&await t(await n.getFile(),n)}function JA(){let t=P(e=>e.openFile);return(0,wf.jsx)("input",{ref:e=>{Cb=e},type:"file",accept:i3,hidden:!0,tabIndex:-1,"aria-hidden":"true",onChange:e=>{let n=e.target.files?.[0];e.target.value="",n&&t(n)}})}function Ab({disabled:t,className:e="xray-btn",label:n="Open SQLite file",onPicked:r}){let o=P(a=>a.openFile);return(0,wf.jsxs)("button",{type:"button",className:e,disabled:t,"aria-label":"Open SQLite file",onClick:()=>{r?.(),s3(o)},children:[(0,wf.jsx)(Wh,{size:16,stroke:1.8,"aria-hidden":"true"}),n]})}var wf,i3,l3,Cb,$A=E(()=>{"use strict";kr();Ta();wf=Y(Ce()),i3=".sqlite,.sqlite3,.db,.db3,application/vnd.sqlite3",l3=[{description:"SQLite database",accept:{"application/vnd.sqlite3":[".sqlite",".sqlite3",".db",".db3"]}}],Cb=null});function Tb({orientation:t,label:e,value:n,min:r,max:o,onStep:a,onDrag:i}){let[l,s]=(0,qd.useState)(!1),f=(0,qd.useRef)(null),c=t==="horizontal"?"ArrowUp":"ArrowLeft",d=t==="horizontal"?"ArrowDown":"ArrowRight";return(0,ZA.jsx)("div",{role:"separator",tabIndex:0,"aria-label":e,"aria-orientation":t,"aria-valuenow":Math.round(n),"aria-valuemin":r,"aria-valuemax":o,className:`xray-sql-divider ${t}${l?" dragging":""}`,onKeyDown:u=>{(u.key===c||u.key===d)&&(u.preventDefault(),a(u.key===c?-tb:tb))},onPointerDown:u=>{u.button===0&&(u.preventDefault(),f.current=u.pointerId,u.currentTarget.setPointerCapture(u.pointerId),s(!0))},onPointerMove:u=>{f.current===u.pointerId&&i(u.clientX,u.clientY)},onPointerUp:u=>{f.current===u.pointerId&&(f.current=null,u.currentTarget.releasePointerCapture(u.pointerId),s(!1))},onPointerCancel:()=>{f.current=null,s(!1)}})}var qd,ZA,eT=E(()=>{"use strict";qd=Y(mt());Cd();ZA=Y(Ce())});function Mb(t){return t.trim()?t.trim().toUpperCase():"\u2014"}function m3(t){return Math.round(Math.min(c3,Math.max(f3,t)))}function iT(t,e,n){let r=e.slice(0,u3);return t.map((o,a)=>{let i=Math.max(n(o.name),n(Mb(o.type)))+d3;for(let l of r){let f=Ca(l[a]??null,o.type).text.slice(0,p3);i=Math.max(i,n(f)+aT)}return m3(i)})}function lT(t,e){return Math.round(Math.min(72,Math.max(40,e(String(Math.max(1,t)))+aT)))}function sT(t,e){return!t||t.col!==e?{col:e,dir:"asc"}:t.dir==="asc"?{col:e,dir:"desc"}:null}function nT(t){return typeof t=="number"||typeof t=="boolean"?0:typeof t=="string"?h3.test(t)?0:1:2}function rT(t){return typeof t=="boolean"?t?1:0:Number(t)}function x3(t,e){let n=nT(t),r=nT(e);if(n!==r)return n-r;if(n===0){let o=rT(t)-rT(e);return o!==0?o:typeof t=="string"&&typeof e=="string"?tT.compare(t,e):0}return n===1?tT.compare(t,e):t.hex<e.hex?-1:t.hex>e.hex?1:0}function fT(t,e){if(!e)return t.slice();let n=e.dir==="asc"?1:-1;return t.map((r,o)=>({row:r,index:o})).sort((r,o)=>{let a=r.row[e.col]??null,i=o.row[e.col]??null;return a===null||i===null?a===i?r.index-o.index:a===null?1:-1:n*x3(a,i)||r.index-o.index}).map(r=>r.row)}function g3(t){return t===null?"":typeof t=="object"?t.hex:String(t)}function cT(t,e){let n=e.trim().toLowerCase();return n?t.filter(r=>r.some(o=>g3(o).toLowerCase().includes(n))):t.slice()}function uT(t,e,n){return`${t} of ${e} rows \xB7 ${Math.round(n)} ms`}function dT(t,e=""){if(t===null)return{text:"NULL",truncatedBlob:!1};if(typeof t=="object")return{text:t.hex,truncatedBlob:wd(t)};if(typeof t=="string"){if(Ca(t,e).kind==="json"){let r=Co(t);if(r.ok)return{text:jy(r.root,{indent:2}),truncatedBlob:!1}}return{text:t,truncatedBlob:!1}}return{text:String(t),truncatedBlob:!1}}var f3,c3,oT,u3,aT,d3,p3,h3,tT,Db=E(()=>{"use strict";Ao();Nr();f3=64,c3=480,oT=48,u3=50,aT=16,d3=22,p3=80;h3=/^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/,tT=new Intl.Collator("en",{numeric:!0,sensitivity:"base"})});function Ie(t,e,n,r){let o=r?`${t}(${r.map(a=>a.name).join(", ")})`:t;return r?{name:t,signature:o,description:n,group:e,params:r}:{name:t,signature:o,description:n,group:e}}function Ob(t,e){let n=t;for(let r of e)typeof r=="number"?n+=`[${r}]`:y3.test(r)?n+=`.${r}`:n+=`[${JSON.stringify(r)}]`;return n}var y3,Sf,Da,kf,qr,M5,pT=E(()=>{"use strict";Ao();y3=/^[A-Za-z_$][\w$]*$/,Sf="Request data",Da="Find entries",kf="Transform",qr="Output";M5=[Ie("res",Sf,"Parsed response body of the selected request."),Ie("req",Sf,"Parsed request body of the selected request."),Ie("entry",Sf,"The full captured entry for the selected request."),Ie("schema",kf,"Infer a structural schema of a value.",[{name:"x",description:"Value to describe."}]),Ie("diff",kf,"Structural diff of two values.",[{name:"a",description:"The baseline value."},{name:"b",description:"The value to compare against a."}]),Ie("pick",kf,"Copy of obj with only the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to keep.",values:"keys"}]),Ie("omit",kf,"Copy of obj without the listed keys.",[{name:"obj",description:"Object to copy from."},{name:"keys",description:"Array of key names to drop.",values:"keys"}]),Ie("flatten",kf,"Flatten nested keys into dotted paths.",[{name:"obj",description:"Object to flatten."}]),Ie("toTable",qr,"Render an array of objects as a table.",[{name:"rows",description:"Array of objects to show."}]),Ie("table",qr,"Alias of toTable: render rows as a table.",[{name:"rows",description:"Array of objects to show."}]),Ie("csv",qr,"Alias of toCSV: convert rows to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),Ie("prev",Sf,"Response body of the previous call to this endpoint."),Ie("next",Sf,"Response body of the next call to this endpoint."),Ie("toCSV",qr,"Convert an array of objects to CSV text.",[{name:"rows",description:"Array of objects to convert."}]),Ie("copy",qr,"Copy a value to the clipboard.",[{name:"x",description:"Value to copy."}]),Ie("$prev",Da,"Previous captured entry in the list.",[]),Ie("$next",Da,"Next captured entry in the list.",[]),Ie("$all",Da,"Every captured entry.",[]),Ie("$errors",Da,"Entries with a status of 400 or above.",[]),Ie("$slow",Da,"Entries slower than ms milliseconds.",[{name:"ms = 1000",description:"Duration threshold in milliseconds.",values:"duration"}]),Ie("$status",Da,"Entries with the given status code.",[{name:"code",description:"HTTP status code to match.",values:"status"}]),Ie("$endpoint",Da,"Entries whose URL path contains the text.",[{name:"path",description:"Text the URL path must contain.",values:"endpoint"}]),Ie("$help",qr,"List all console helpers."),Ie("$curl",qr,"Copy-ready cURL command for the selected request."),Ie("$fetch",qr,"Copy-ready fetch() snippet for the selected request."),Ie("$mock",qr,"Build a mock response from an entry.",[{name:"entry?",description:"Entry to mock; defaults to the selected request."}])]});var xl,Oa,mT=E(()=>{"use strict";xl=class{constructor(e,n){rr(this,"text");rr(this,"tone");this.text=e,this.tone=n}toJSON(){return this.text}},Oa=class{constructor(e,n,r,o=r.length){rr(this,"kind");rr(this,"label");rr(this,"children");rr(this,"count");this.kind=e,this.label=n,this.children=r,this.count=o}toJSON(){if(this.kind==="array")return this.children.map(n=>n.value);let e={};for(let n of this.children){let r=n.name??(n.label===void 0?String(n.key):n.label||"\u2026");Object.defineProperty(e,r,{value:n.value,enumerable:!0,configurable:!0,writable:!0})}return e}}});function Pd(){return{all:null,overrides:new Map,shown:new Map,budget:2e4}}function b3(t){return t.t==="obj"||t.t==="arr"}function _d(t){return t.t==="obj"?t.entries.length:t.items.length}function Bb(t,e,n){let r=t.overrides.get(e);return r!==void 0?r:t.all===null?n<4:t.all}function xT(t,e){let n=[],r=Math.max(1,Math.floor(e.budget)),o=[],a=[],i=[],l=[],s=(f,c,d,u)=>{if(!b3(f)||_d(f)===0){n.push({type:"node",node:f,depth:c,key:d,dup:u,open:null});return}let p=Bb(e,f,c);n.push({type:"node",node:f,depth:c,key:d,dup:u,open:p}),p&&(o.push(f),a.push(c),i.push(0),l.push(Math.min(_d(f),Math.max(1,e.shown.get(f)??100))))};for(s(t,0,null,!1);o.length>0;){if(n.length>=r)return n.push({type:"budget",depth:0}),n;let f=o.length-1,c=o[f],d=a[f],u=i[f];if(u<l[f]){if(i[f]=u+1,c.t==="arr")s(c.items[u],d+1,u,!1);else{let m=c.entries[u];s(m.value,d+1,m.key,m.dup===!0)}continue}let p=_d(c);l[f]<p&&n.push({type:"more",node:c,depth:d+1,hidden:p-l[f]}),n.push({type:"close",node:c,depth:d}),o.pop(),a.pop(),i.pop(),l.pop()}return n}function gT(t){return t.exact?null:`JavaScript reads this as ${Object.is(t.value,-0)?"0":String(t.value)}`}function yT(t){let e=_d(t);return t.t==="arr"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function v3(t){let e=hT.get(t);return e===void 0&&(e=++I3,hT.set(t,e)),e}function bT(t){if(t.type==="budget")return"budget";let e=v3(t.node);return t.type==="node"?`n${e}`:t.type==="close"?`c${e}`:`m${e}`}var hT,I3,IT=E(()=>{"use strict";hT=new WeakMap,I3=0});function wT(t){if(!t)return[];if(!w3.test(t))return[t];let e=[],n=0;for(let r=0;r<t.length;r++){let o=t.charCodeAt(r);vT[o]!==void 0&&(r>n&&e.push(t.slice(n,r)),e.push(o),n=r+1)}return n<t.length&&e.push(t.slice(n)),e}function ST(t){return"\\u"+t.toString(16).toUpperCase().padStart(4,"0")}function kT(t){return`U+${t.toString(16).toUpperCase().padStart(4,"0")} ${vT[t]??"BIDI CONTROL"}`}var w3,vT,CT=E(()=>{"use strict";w3=/[‎‏‪-‮⁦-⁩]/,vT={8206:"LEFT-TO-RIGHT MARK",8207:"RIGHT-TO-LEFT MARK",8234:"LEFT-TO-RIGHT EMBEDDING",8235:"RIGHT-TO-LEFT EMBEDDING",8236:"POP DIRECTIONAL FORMATTING",8237:"LEFT-TO-RIGHT OVERRIDE",8238:"RIGHT-TO-LEFT OVERRIDE",8294:"LEFT-TO-RIGHT ISOLATE",8295:"RIGHT-TO-LEFT ISOLATE",8296:"FIRST STRONG ISOLATE",8297:"POP DIRECTIONAL ISOLATE"}});function _r(t){let e=wT(t);return e.length===0||e.length===1&&typeof e[0]=="string"?t:e.map((n,r)=>typeof n=="number"?(0,zd.jsx)("span",{className:"xray-bidi",title:`${kT(n)}, shown escaped`,children:ST(n)},r):(0,zd.jsx)(AT.default.Fragment,{children:n},r))}var AT,zd,TT=E(()=>{"use strict";AT=Y(mt());CT();zd=Y(Ce())});function MT(t,e,n){let r=new Array(t);return new Proxy(r,{get(o,a,i){if(typeof a=="string"){let l=a.charCodeAt(0);if(l>=48&&l<=57){let s=+a;if(Number.isInteger(s)&&s>=0&&s<t){let f=o[s];if(!f){let c=e[s*2];f=o[s]={index:s,key:n(s),start:c,size:e[s*2+1],end:c+e[s*2+1],lane:0}}return f}}if(a==="length")return t}return Reflect.get(o,a,i)}})}var DT=E(()=>{});function Ba(t,e,n){let r=n.initialDeps??[],o,a=!0;function i(){var l;let f=0,c=t();if(!(c.length!==r.length||c.some((p,m)=>r[m]!==p)))return o;r=c;let u=0;return o=e(...c),n?.onChange&&!(a&&n.skipInitialOnChange)&&n.onChange(o),a=!1,o}return i.updateDeps=l=>{r=l},i}function Rb(t,e){if(t===void 0)throw new Error(`Unexpected undefined${e?`: ${e}`:""}`);return t}var Eb,OT,BT=E(()=>{Eb=(t,e)=>Math.abs(t-e)<1.01,OT=(t,e,n)=>{let r;return function(...o){t.clearTimeout(r),r=t.setTimeout(()=>e.apply(this,o),n)}}});function D3({measurements:t,outerSize:e,scrollOffset:n,lanes:r,flat:o}){let a=t.length-1,i=o?c=>o[c*2]:c=>t[c].start,l=o?c=>o[c*2]+o[c*2+1]:c=>t[c].end;if(t.length<=r)return{startIndex:0,endIndex:a};let s=qT(0,a,i,n),f=s;if(r===1)for(;f<a&&l(f)<n+e;)f++;else if(r>1){let c=Array(r).fill(0);for(;f<a&&c.some(u=>u<n+e);){let u=t[f];c[u.lane]=u.end,f++}let d=Array(r).fill(n+e);for(;s>=0&&d.some(u=>u>=n);){let u=t[s];d[u.lane]=u.start,s--}s=Math.max(0,s-s%r),f=Math.min(a,f+(r-1-f%r))}return{startIndex:s,endIndex:f}}var Cf,RT,ET,S3,k3,FT,Hd,C3,A3,LT,T3,M3,NT,Ud,qT,Fb=E(()=>{DT();BT();RT=()=>{if(Cf!==void 0)return Cf;if(typeof navigator>"u")return Cf=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return Cf=!0;let t=navigator.maxTouchPoints;return Cf=navigator.platform==="MacIntel"&&t!==void 0&&t>0},ET=t=>{let{offsetWidth:e,offsetHeight:n}=t;return{width:e,height:n}},S3=t=>t,k3=t=>{let e=Math.max(t.startIndex-t.overscan,0),r=Math.min(t.endIndex+t.overscan,t.count-1)-e+1,o=new Array(r);for(let a=0;a<r;a++)o[a]=e+a;return o},FT=(t,e)=>{let n=t.scrollElement;if(!n)return;let r=t.targetWindow;if(!r)return;let o=i=>{let{width:l,height:s}=i;e({width:Math.round(l),height:Math.round(s)})};if(o(ET(n)),!r.ResizeObserver)return()=>{};let a=new r.ResizeObserver(i=>{let l=()=>{let s=i[0];if(s?.borderBoxSize){let f=s.borderBoxSize[0];if(f){o({width:f.inlineSize,height:f.blockSize});return}}o(ET(n))};t.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(l):l()});return a.observe(n,{box:"border-box"}),()=>{a.unobserve(n)}},Hd={passive:!0},C3=typeof window>"u"?!0:"onscrollend"in window,A3=(t,e,n)=>{let r=t.scrollElement;if(!r)return;let o=t.targetWindow;if(!o)return;let a=t.options.useScrollendEvent&&C3,i=0,l=a?null:OT(o,()=>e(i,!1),t.options.isScrollingResetDelay),s=d=>()=>{i=n(r),l?.(),e(i,d)},f=s(!0),c=s(!1);return r.addEventListener("scroll",f,Hd),a&&r.addEventListener("scrollend",c,Hd),()=>{r.removeEventListener("scroll",f),a&&r.removeEventListener("scrollend",c)}},LT=(t,e)=>A3(t,e,n=>{let{horizontal:r,isRtl:o}=t.options;return r?n.scrollLeft*(o&&-1||1):n.scrollTop}),T3=(t,e,n)=>{if(e?.borderBoxSize){let r=e.borderBoxSize[0];if(r)return Math.round(r[n.options.horizontal?"inlineSize":"blockSize"])}return t[n.options.horizontal?"offsetWidth":"offsetHeight"]},M3=(t,{adjustments:e=0,behavior:n},r)=>{var o,a;(a=(o=r.scrollElement)==null?void 0:o.scrollTo)==null||a.call(o,{[r.options.horizontal?"left":"top"]:t+e,behavior:n})},NT=M3,Ud=class{constructor(e){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var n,r,o;return((o=(r=(n=this.targetWindow)==null?void 0:n.performance)==null?void 0:r.now)==null?void 0:o.call(r))??Date.now()},this.observer=(()=>{let n=null,r=()=>n||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:n=new this.targetWindow.ResizeObserver(o=>{o.forEach(a=>{let i=()=>{let l=a.target,s=this.indexFromElement(l);if(!l.isConnected){this.observer.unobserve(l);for(let[f,c]of this.elementsCache)if(c===l){this.elementsCache.delete(f);break}return}this.shouldMeasureDuringScroll(s)&&this.resizeItem(s,this.options.measureElement(l,a,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(i):i()})}));return{disconnect:()=>{var o;(o=r())==null||o.disconnect(),n=null},observe:o=>{var a;return(a=r())==null?void 0:a.observe(o,{box:"border-box"})},unobserve:o=>{var a;return(a=r())==null?void 0:a.unobserve(o)}}})(),this.range=null,this.setOptions=n=>{var r,o;let a={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:S3,rangeExtractor:k3,onChange:()=>{},measureElement:T3,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,anchorTo:"start",followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate"};for(let f in n){let c=n[f];c!==void 0&&(a[f]=c)}let i=this.options,l=null,s=null;if(i!==void 0&&i.enabled&&a.enabled&&a.anchorTo==="end"&&this.scrollElement!==null){let f=i.count,c=a.count,d=this.getMeasurements(),u=f>0?((r=d[0])==null?void 0:r.key)??i.getItemKey(0):null,p=f>0?((o=d[f-1])==null?void 0:o.key)??i.getItemKey(f-1):null;if(c!==f||f>0&&c>0&&(a.getItemKey(0)!==u||a.getItemKey(c-1)!==p)){let b=f>0?this.getVirtualItemForOffset(this.getScrollOffset())??d[0]:null;b&&(l=[b.key,this.getScrollOffset()-b.start]);let h=a.followOnAppend===!0?"auto":a.followOnAppend||null;h&&c>f&&this.isAtEnd(i.scrollEndThreshold)&&(f===0||a.getItemKey(c-1)!==p)&&(s=h)}}this.options=a,(l||s)&&(this.pendingScrollAnchor=[l?.[0]??null,l?.[1]??0,s])},this.notify=n=>{var r,o;(o=(r=this.options).onChange)==null||o.call(r,this,n)},this.maybeNotify=Ba(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),n=>{this.notify(n)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(n=>n()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var n;let r=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==r){if(this.cleanup(),!r){this.maybeNotify();return}if(this.scrollElement=r,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((n=this.scrollElement)==null?void 0:n.window)??null,this.elementsCache.forEach(a=>{this.observer.observe(a)}),this.unsubs.push(this.options.observeElementRect(this,a=>{this.scrollRect=a,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(a,i)=>{this._intendedScrollOffset!==null&&Math.abs(a-this._intendedScrollOffset)<1.5&&(a=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0,this.scrollDirection=i?this.getScrollOffset()<a?"forward":"backward":null,this.scrollOffset=a,this.isScrolling=i,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),"addEventListener"in this.scrollElement){let a=this.scrollElement,i=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},l=()=>{this._iosTouching=!1,!(!RT()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};a.addEventListener("touchstart",i,Hd),a.addEventListener("touchend",l,Hd),this.unsubs.push(()=>{a.removeEventListener("touchstart",i),a.removeEventListener("touchend",l),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let o=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,o&&this.scrollElement&&this.options.enabled){let[a,i,l]=o;if(a!==null){let{count:s,getItemKey:f}=this.options,c=0;for(;c<s&&f(c)!==a;)c++;let d=c<s?this.getMeasurements()[c]:void 0;if(d){let u=d.start+i-this.getScrollOffset();Eb(u,0)||this.applyScrollAdjustment(u)}}l&&this.scrollToEnd({behavior:l})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let n=this.getScrollOffset(),r=this.getMaxScrollOffset();if(n<0||n>r)return;let o=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(n,{adjustments:this.scrollAdjustments+=o,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(n,r)=>{let o=new Map,a=new Map;for(let i=r-1;i>=0;i--){let l=n[i];if(o.has(l.lane))continue;let s=a.get(l.lane);if(s==null||l.end>s.end?a.set(l.lane,l):l.end<s.end&&o.set(l.lane,!0),o.size===this.options.lanes)break}return a.size===this.options.lanes?Array.from(a.values()).sort((i,l)=>i.end===l.end?i.index-l.index:i.end-l.end)[0]:void 0},this.getMeasurementOptions=Ba(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(n,r,o,a,i,l,s)=>(this.prevLanes!==void 0&&this.prevLanes!==l&&(this.lanesChangedFlag=!0),this.prevLanes=l,this.pendingMin=null,{count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s}),{key:!1}),this.getMeasurements=Ba(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:n,paddingStart:r,scrollMargin:o,getItemKey:a,enabled:i,lanes:l,laneAssignmentMode:s},f)=>{let c=this.itemSizeCache;if(!i)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>n)for(let m of this.laneAssignments.keys())m>=n&&this.laneAssignments.delete(m);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(m=>{this.itemSizeCache.set(m.key,m.size)}));let d=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===n&&(this.lanesSettling=!1),l===1){let m=this.options.gap,x=n*2,b=this._flatMeasurements;if(!b||b.length<x){let g=new Float64Array(x);b&&d>0&&g.set(b.subarray(0,d*2)),b=g,this._flatMeasurements=b}let h;if(d===0)h=r+o;else{let g=d-1;h=b[g*2]+b[g*2+1]+m}for(let g=d;g<n;g++){let I=a(g),v=c.get(I),S=typeof v=="number"?v:this.options.estimateSize(g);b[g*2]=h,b[g*2+1]=S,h+=S+m}let y=MT(n,b,a);return this.measurementsCache=y,y}let u=this.measurementsCache.slice(0,d),p=new Array(l).fill(void 0);for(let m=0;m<d;m++){let x=u[m];x&&(p[x.lane]=m)}for(let m=d;m<n;m++){let x=a(m),b=this.laneAssignments.get(m),h,y,g=s==="estimate"||c.has(x);if(b!==void 0&&this.options.lanes>1){h=b;let w=p[h],k=w!==void 0?u[w]:void 0;y=k?k.end+this.options.gap:r+o}else{let w=this.options.lanes===1?u[m-1]:this.getFurthestMeasurement(u,m);y=w?w.end+this.options.gap:r+o,h=w?w.lane:m%this.options.lanes,this.options.lanes>1&&g&&this.laneAssignments.set(m,h)}let I=c.get(x),v=typeof I=="number"?I:this.options.estimateSize(m),S=y+v;u[m]={index:m,start:y,size:v,end:S,key:x,lane:h},p[h]=m}return this.measurementsCache=u,u},{key:!1,debug:()=>this.options.debug}),this.calculateRange=Ba(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(n,r,o,a)=>this.range=n.length>0&&r>0?D3({measurements:n,outerSize:r,scrollOffset:o,lanes:a,flat:a===1&&this._flatMeasurements!=null?this._flatMeasurements:null}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=Ba(()=>{let n=null,r=null,o=this.calculateRange();return o&&(n=o.startIndex,r=o.endIndex),this.maybeNotify.updateDeps([this.isScrolling,n,r]),[this.options.rangeExtractor,this.options.overscan,this.options.count,n,r]},(n,r,o,a,i)=>a===null||i===null?[]:n({startIndex:a,endIndex:i,overscan:r,count:o}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=n=>{let r=this.options.indexAttribute,o=n.getAttribute(r);return o?parseInt(o,10):(console.warn(`Missing attribute name '${r}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=n=>{var r;if(!this.scrollState||this.scrollState.behavior!=="smooth")return!0;let o=this.scrollState.index??((r=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))==null?void 0:r.index);if(o!==void 0&&this.range){let a=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),i=Math.max(0,o-a),l=Math.min(this.options.count-1,o+a);return n>=i&&n<=l}return!0},this.measureElement=n=>{if(!n){this.elementsCache.forEach((i,l)=>{i.isConnected||(this.observer.unobserve(i),this.elementsCache.delete(l))});return}let r=this.indexFromElement(n),o=this.options.getItemKey(r),a=this.elementsCache.get(o);a!==n&&(a&&this.observer.unobserve(a),this.observer.observe(n),this.elementsCache.set(o,n)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(r)&&this.resizeItem(r,this.options.measureElement(n,void 0,this))},this.resizeItem=(n,r)=>{var o,a;if(n<0||n>=this.options.count)return;let i,l,s,f=this._flatMeasurements;if(this.options.lanes===1&&f!==null)s=this.options.getItemKey(n),l=f[n*2],i=f[n*2+1];else{let u=this.measurementsCache[n];if(!u)return;s=u.key,l=u.start,i=u.size}let c=this.itemSizeCache.get(s)??i,d=r-c;if(d!==0){let u=this.options.anchorTo==="end"&&((o=this.scrollState)==null?void 0:o.behavior)!=="smooth"&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,p=u?this.getTotalSize():0,m=((a=this.scrollState)==null?void 0:a.behavior)!=="smooth"&&(this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[n]??{index:n,key:s,start:l,size:i,end:l+i,lane:0},d,this):l<this.getScrollOffset()+this.scrollAdjustments&&this.scrollDirection!=="backward");(this.pendingMin===null||n<this.pendingMin)&&(this.pendingMin=n),this.itemSizeCache.set(s,r),this.itemSizeCacheVersion++,u?this.applyScrollAdjustment(this.getTotalSize()-p):m&&this.applyScrollAdjustment(d),this.notify(!1)}},this.getVirtualItems=Ba(()=>[this.getVirtualIndexes(),this.getMeasurements()],(n,r)=>{let o=[];for(let a=0,i=n.length;a<i;a++){let l=n[a],s=r[l];o.push(s)}return o},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=n=>{let r=this.getMeasurements();if(r.length===0)return;let o=this._flatMeasurements,a=this.options.lanes===1&&o!=null,i=qT(0,r.length-1,a?l=>o[l*2]:l=>Rb(r[l]).start,n);return Rb(r[i])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let n=this.scrollElement.document.documentElement;return this.options.horizontal?n.scrollWidth-this.scrollElement.innerWidth:n.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(n=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=n,this.getOffsetForAlignment=(n,r,o=0)=>{if(!this.scrollElement)return 0;let a=this.getSize(),i=this.getScrollOffset();r==="auto"&&(r=n>=i+a?"end":"start"),r==="center"?n+=(o-a)/2:r==="end"&&(n-=a);let l=this.getMaxScrollOffset();return Math.max(Math.min(l,n),0)},this.getOffsetForIndex=(n,r="auto")=>{n=Math.max(0,Math.min(n,this.options.count-1));let o=this.getSize(),a=this.getScrollOffset(),i=this.measurementsCache[n];if(!i)return;if(r==="auto")if(i.end>=a+o-this.options.scrollPaddingEnd)r="end";else if(i.start<=a+this.options.scrollPaddingStart)r="start";else return[a,r];if(r==="end"&&n===this.options.count-1)return[this.getMaxScrollOffset(),r];let l=r==="end"?i.end+this.options.scrollPaddingEnd:i.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(l,r,i.size),r]},this.scrollToOffset=(n,{align:r="start",behavior:o="auto"}={})=>{let a=this.getOffsetForAlignment(n,r),i=this.now();this.scrollState={index:null,align:r,behavior:o,startedAt:i,lastTargetOffset:a,stableFrames:0},this._scrollToOffset(a,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollToIndex=(n,{align:r="auto",behavior:o="auto"}={})=>{n=Math.max(0,Math.min(n,this.options.count-1));let a=this.getOffsetForIndex(n,r);if(!a)return;let[i,l]=a,s=this.now();this.scrollState={index:n,align:l,behavior:o,startedAt:s,lastTargetOffset:i,stableFrames:0},this._scrollToOffset(i,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollBy=(n,{behavior:r="auto"}={})=>{let o=this.getScrollOffset()+n,a=this.now();this.scrollState={index:null,align:"start",behavior:r,startedAt:a,lastTargetOffset:o,stableFrames:0},this._scrollToOffset(o,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:n="auto"}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:"end",behavior:n});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:n})},this.getTotalSize=()=>{var n;let r=this.getMeasurements(),o;if(r.length===0)o=this.options.paddingStart;else if(this.options.lanes===1){let a=r.length-1,i=this._flatMeasurements;i!=null?o=i[a*2]+i[a*2+1]:o=((n=r[a])==null?void 0:n.end)??0}else{let a=Array(this.options.lanes).fill(null),i=r.length-1;for(;i>=0&&a.some(l=>l===null);){let l=r[i];a[l.lane]===null&&(a[l.lane]=l.end),i--}o=Math.max(...a.filter(l=>l!==null))}return Math.max(o-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let n=[];if(this.itemSizeCache.size===0)return n;let r=this.getMeasurements();for(let o of r)o&&this.itemSizeCache.has(o.key)&&n.push({index:o.index,key:o.key,start:o.start,size:o.size,end:o.end,lane:o.lane});return n},this._scrollToOffset=(n,{adjustments:r,behavior:o})=>{this._intendedScrollOffset=n+(r??0),this.options.scrollToFn(n,{behavior:o,adjustments:r},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(e)}applyScrollAdjustment(e,n){e!==0&&(RT()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=e:this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=e,behavior:n}))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId==null&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let r=this.scrollState.index!=null?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,o=r?r[0]:this.scrollState.lastTargetOffset,a=1,i=o!==this.scrollState.lastTargetOffset;if(!i&&Eb(o,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=a){this.getScrollOffset()!==o&&this._scrollToOffset(o,{adjustments:void 0,behavior:"auto"}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,i){let l=this.getSize()||600,s=Math.abs(o-this.getScrollOffset()),f=this.scrollState.behavior==="smooth"&&s>l;this.scrollState.lastTargetOffset=o,f||(this.scrollState.behavior="auto"),this._scrollToOffset(o,{adjustments:void 0,behavior:f?"smooth":"auto"})}this.scheduleScrollReconcile()}},qT=(t,e,n,r)=>{for(;t<=e;){let o=(t+e)/2|0,a=n(o);if(a<r)t=o+1;else if(a>r)e=o-1;else return o}return t>0?t-1:0}});function O3({useFlushSync:t=!0,...e}){let n=Ro.useReducer(a=>a+1,0)[1],r={...e,onChange:(a,i)=>{var l;t&&i?(0,PT.flushSync)(n):n(),(l=e.onChange)==null||l.call(e,a,i)}},[o]=Ro.useState(()=>new Ud(r));return o.setOptions(r),_T(()=>o._didMount(),[]),_T(()=>o._willUpdate()),o}function Af(t){return O3({observeElementRect:FT,observeElementOffset:LT,scrollToFn:NT,...t})}var Ro,PT,_T,Lb=E(()=>{Ro=Y(mt(),1),PT=Y(xp(),1);Fb();Fb();_T=typeof document<"u"?Ro.useLayoutEffect:Ro.useEffect});function zT({count:t,scrollRef:e,estimateSize:n,getItemKey:r,overscan:o=10}){return Af({count:t,getScrollElement:()=>e.current,estimateSize:n,getItemKey:r,measureElement:a=>a.getBoundingClientRect().height,overscan:o,initialRect:{width:800,height:480}})}var HT=E(()=>{"use strict";Lb()});function Mf(t){return t instanceof xl||t instanceof Lr?null:t instanceof Oa?t.kind:Array.isArray(t)?"array":t!==null&&typeof t=="object"?"object":null}function _b(t){return t instanceof xl?N3[t.tone]:typeof t=="string"?"xray-json-string":typeof t=="number"||t instanceof Lr?"xray-json-number":typeof t=="boolean"?"xray-json-bool":t==null?"xray-json-null":"xray-json-punct"}function Pb(t){return t instanceof xl?_r(t.text):t instanceof Lr?t.raw:typeof t=="string"?_r(JSON.stringify(t)):t===void 0?"undefined":t===null?"null":String(t)}function zb(t,e){return t instanceof Oa?t.children.map(n=>[n.key,n.value,n.label,n.name]):e==="array"?t.map((n,r)=>[r,n]):Object.entries(t)}function QT(t,e){return t==="array"?`${e} ${e===1?"item":"items"}`:`${e} ${e===1?"key":"keys"}`}function WT(t,e){return t instanceof Oa?t.count:e==="array"?t.length:Object.keys(t).length}function KT(t){return t instanceof Oa&&t.label?(0,B.jsxs)("span",{className:"xray-json-typed xray-json-label",children:[t.label," "]}):null}function YT(t,e,n){return n!==void 0?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:_r(JSON.stringify(n))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]}):e!==void 0?e?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:_r(e)}),(0,B.jsx)("span",{className:"xray-json-punct",children:" "})]}):null:t===null?null:(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:_r(JSON.stringify(t))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]})}function q3(t){let e=Ob("",[t]);return e.startsWith(".")?e.slice(1):e}function _3(t,e){let n=e.trim().toLowerCase(),r=new Set,o=new Set,a=/[.[\]]/.test(n),i=XT,l=(s,f,c,d)=>{let u=Mf(s);if(!u||d>=E3)return!1;let p=!1;for(let[m,x]of zb(s,u)){if(--i<0)break;let b=f+Ra+m,h=a?[...c,m]:c,y=a?Ob("",h).toLowerCase().includes(n):String(m).toLowerCase().includes(n);y&&r.add(b);let g=l(x,b,h,d+1);g&&o.add(b),(y||g)&&(p=!0)}return p};return l(t,"$",[],0)&&o.add("$"),{matched:r,ancestors:o,limited:i<0}}function P3(t,e,n,r){let o=[],a=(i,l,s,f,c,d,u,p)=>{let m=Mf(l);if(!m){o.push({id:s,kind:"leaf",depth:c,nodeKey:i,label:u,name:p,value:l,segments:f});return}let x=e(s,c);if(o.push({id:s,kind:"branch",depth:c,nodeKey:i,label:u,name:p,value:l,segments:f,open:x}),!x)return;let b=zb(l,m);n&&!d&&(b=b.filter(([g])=>n.matched.has(s+Ra+g)||n.ancestors.has(s+Ra+g)));let h=r(s),y=b.length>h?b.slice(0,h):b;for(let[g,I,v,S]of y){let w=s+Ra+g;a(g,I,w,[...f,g],c+1,d||!!n&&n.matched.has(w),v,S)}b.length>y.length&&o.push({id:s+F3,kind:"more",depth:c+1,nodeKey:null,segments:f,parentId:s,hidden:b.length-y.length}),o.push({id:s+L3,kind:"close",depth:c,nodeKey:null,segments:f,bracket:m==="array"?"]":"}"})};return a(null,t,"$",[],0,!1),o}function z3({value:t,isOpen:e,setOpen:n,filter:r,shown:o,showMore:a,selected:i,active:l,setActive:s,onSelect:f}){let c=fe.default.useMemo(()=>P3(t,e,r,o),[t,e,r,o]),d=fe.default.useRef(null),u=fe.default.useRef(null),p=c.filter(g=>g.kind!=="close"),m=g=>!!g&&p.some(I=>I.id===g),x=m(l)?l:m(i)?i:p[0]?.id??null;fe.default.useLayoutEffect(()=>{let g=u.current;if(g===null)return;u.current=null;let I=c[g];!I||I.kind==="close"||(I.id!==l&&s(I.id),d.current?.querySelector(`[data-row="${g}"]`)?.focus())});function b(g){g&&(g.id!==l&&s(g.id),d.current?.querySelector(`[data-row="${c.indexOf(g)}"]`)?.focus())}function h(g){if(g.kind==="more"&&g.parentId){a(g.parentId),u.current=c.indexOf(g);return}f(g)}function y(g){let I=g.target.closest("[data-row]");if(!I)return;let v=Number(I.dataset.row),S=c[v];if(!S)return;let w=p.indexOf(S);switch(g.key){case"ArrowDown":b(p[w+1]);break;case"ArrowUp":b(p[w-1]);break;case"Home":b(p[0]);break;case"End":b(p[p.length-1]);break;case"ArrowRight":if(S.kind!=="branch")return;S.open?c[v+1]&&c[v+1].depth>S.depth&&c[v+1].kind!=="close"&&b(c[v+1]):n(S.id,S.depth,!0);break;case"ArrowLeft":if(S.kind==="branch"&&S.open){n(S.id,S.depth,!1);break}for(let k=v-1;k>=0;k--)if(c[k].kind==="branch"&&c[k].depth===S.depth-1){b(c[k]);break}break;case"Enter":case" ":h(S);break;default:return}g.preventDefault()}return(0,B.jsx)("div",{className:"xray-json-tree-body",role:"tree","aria-label":"JSON viewer",ref:d,onKeyDown:y,children:c.map((g,I)=>{if(g.kind==="close")return(0,B.jsxs)("div",{className:"xray-json-row",role:"none","aria-hidden":"true",style:{paddingLeft:g.depth*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),(0,B.jsx)("span",{className:"xray-json-punct",children:g.bracket})]},g.id);let v={"data-row":I,role:"treeitem","aria-level":g.depth+1,tabIndex:g.id===x?0:-1,onFocus:()=>{l!==g.id&&s(g.id)}};if(g.kind==="more")return(0,B.jsx)("div",{...v,className:"xray-json-row xray-json-flatrow xray-json-more-row",style:{paddingLeft:g.depth*14+8},onClick:()=>h(g),children:(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(g.hidden??0,Vd)," more \xB7 ",g.hidden," hidden"]})},g.id);let S=YT(g.nodeKey,g.label,g.name),w=i===g.id;if(g.kind==="leaf")return(0,B.jsxs)("div",{...v,"aria-selected":w,className:"xray-json-row xray-json-flatrow",style:{paddingLeft:g.depth*14+8},onClick:()=>f(g),children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),S,(0,B.jsx)("span",{className:`xray-json-value ${_b(g.value)}`,children:Pb(g.value)})]},g.id);let k=Mf(g.value),A=WT(g.value,k),R=g.nodeKey===null?"value":q3(g.nodeKey);return(0,B.jsxs)("div",{...v,"aria-expanded":!!g.open,"aria-selected":w,className:"xray-json-row xray-json-flatrow xray-json-branch-row",style:{paddingLeft:g.depth*14},onClick:()=>f(g),onDoubleClick:()=>n(g.id,g.depth),children:[(0,B.jsx)("span",{className:"xray-json-toggle","aria-hidden":"true",title:`${g.open?"Collapse":"Expand"} ${R}`,onClick:F=>{F.stopPropagation(),s(g.id),n(g.id,g.depth)},onDoubleClick:F=>F.stopPropagation(),children:(0,B.jsx)(na,{size:13,stroke:2.2,className:`xray-json-chevron ${g.open?"":"closed"}`})}),S,KT(g.value),(0,B.jsx)("span",{className:"xray-json-punct",children:k==="array"?"[":"{"}),!g.open&&(0,B.jsx)("span",{className:"xray-json-summary",children:QT(k,A)}),!g.open&&(0,B.jsx)("span",{className:"xray-json-punct",children:k==="array"?"]":"}"})]},g.id)})})}function $T({nodeKey:t,label:e,name:n,value:r,path:o,depth:a,isOpen:i,toggle:l}){let s=Mf(r),f=YT(t,e,n);if(!s)return(0,B.jsxs)("div",{className:"xray-json-row",role:"treeitem",style:{paddingLeft:a*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),f,(0,B.jsx)("span",{className:`xray-json-value ${_b(r)}`,children:Pb(r)})]});let c=zb(r,s),d=i(o,a),u=s==="array"?["[","]"]:["{","}"],p=QT(s,WT(r,s));return(0,B.jsxs)("div",{className:"xray-json-node",role:"treeitem","aria-expanded":d,children:[(0,B.jsxs)("button",{className:"xray-json-row xray-json-branch",style:{paddingLeft:a*14},onClick:()=>l(o,a),children:[(0,B.jsx)(na,{size:13,stroke:2.2,className:`xray-json-chevron ${d?"":"closed"}`}),f,KT(r),(0,B.jsx)("span",{className:"xray-json-punct",children:u[0]}),!d&&(0,B.jsx)("span",{className:"xray-json-summary",children:p}),!d&&(0,B.jsx)("span",{className:"xray-json-punct",children:u[1]})]}),d&&(0,B.jsxs)("div",{className:"xray-json-children",children:[c.map(([m,x,b,h])=>(0,B.jsx)($T,{nodeKey:m,label:b,name:h,value:x,path:o+Ra+m,depth:a+1,isOpen:i,toggle:l},m)),(0,B.jsxs)("div",{className:"xray-json-row",style:{paddingLeft:a*14+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),(0,B.jsx)("span",{className:"xray-json-punct",children:u[1]})]})]})]})}function jd(t){return Math.min(t,ZT)*14}function j3(t){return t.t==="str"?"xray-json-string":t.t==="num"?"xray-json-number":t.t==="bool"?"xray-json-bool":t.t==="null"?"xray-json-null":"xray-json-punct"}function V3(t){return t.t==="str"?_r(JSON.stringify(t.value)):t.t==="num"?t.raw:t.t==="bool"?t.value?"true":"false":t.t==="null"?"null":t.t==="arr"?"[]":"{}"}function VT(t){return t===null?null:(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)("span",{className:"xray-json-key",children:typeof t=="number"?t:_r(JSON.stringify(t))}),(0,B.jsx)("span",{className:"xray-json-punct",children:": "})]})}function qb(t){return t>ZT?(0,B.jsx)("span",{className:"xray-json-depth",title:`Nesting depth ${t}`,children:t}):null}function GT(t){return t.type==="node"&&t.dup?(0,B.jsx)("span",{className:"xray-json-tag dup",title:U3,children:"duplicate"}):null}function G3(t){return t?(0,B.jsx)("span",{className:"xray-json-tag inexact",title:t,children:"inexact in JS"}):null}var fe,B,UT,B3,R3,jT,Vd,XT,E3,Ra,F3,L3,N3,JT,H3,ZT,U3,rz,eM=E(()=>{"use strict";fe=Y(mt());kr();xb();pT();mT();Ao();IT();TT();HT();B=Y(Ce()),UT=6e4,B3=4,R3=1,jT=4,Vd=100,XT=2e5,E3=32,Ra="\0",F3=Ra+"more",L3=Ra+"close";N3={string:"xray-json-string",number:"xray-json-number",bool:"xray-json-bool",null:"xray-json-null",typed:"xray-json-typed",muted:"xray-json-muted"};JT=fe.default.memo(function({value:e,onSelectPath:n,filter:r=""}){let o=!!n,a=fe.default.useMemo(()=>!o&&hb(e,0,UT+1).length>UT,[e,o]),i=o?R3:B3,l=o?r.trim():"",s=fe.default.useMemo(()=>l?_3(e,l):null,[e,l]),[f,c]=fe.default.useState(()=>new Map),[d,u]=fe.default.useState(null),[p,m]=fe.default.useState(null),[x,b]=fe.default.useState(null),[h,y]=fe.default.useState(()=>new Map),[g,I]=fe.default.useState({value:e,query:l}),v=!Object.is(g.value,e);(v||g.query!==l)&&(v&&(u(null),m(null),b(null)),I({value:e,query:l}),c(new Map),y(new Map));let S=fe.default.useCallback((L,C)=>d!==null?d&&(!o||C<jT):s?.ancestors.has(L)?!0:C<i,[d,o,s,i]),w=fe.default.useCallback((L,C)=>{let _=f.get(L);return _!==void 0?_:S(L,C)},[f,S]),k=fe.default.useCallback((L,C,_)=>{c(Q=>{let J=new Map(Q),tt=Q.get(L)??S(L,C);return J.set(L,_??!tt),J})},[S]),A=fe.default.useCallback(L=>h.get(L)??Vd,[h]),R=fe.default.useCallback(L=>{y(C=>new Map(C).set(L,(C.get(L)??Vd)+Vd))},[]),F=(0,B.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,B.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{u(!0),c(new Map)},title:o?`Expand nodes up to ${jT} levels deep`:"Expand all nodes",children:[(0,B.jsx)(uu,{size:13,stroke:2}),"Expand all"]}),(0,B.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{u(!1),c(new Map)},title:"Collapse all nodes",children:[(0,B.jsx)(du,{size:13,stroke:2}),"Collapse all"]})]});if(a){let L=hb(e);return(0,B.jsx)("pre",{className:"xray-json xray-json-editor xray-json-text",children:_r(L)})}return Mf(e)===null?(0,B.jsx)("pre",{className:"xray-json xray-json-scalar",children:(0,B.jsx)("span",{className:_b(e),children:Pb(e)})}):o?(0,B.jsxs)("div",{className:"xray-json xray-json-tree is-selectable",children:[F,s?.limited&&(0,B.jsxs)("p",{className:"xray-json-empty",children:["Filter limited to the first ",XT.toLocaleString("en-US")," nodes."]}),s&&!s.ancestors.has("$")?(0,B.jsxs)("p",{className:"xray-json-empty",children:["No keys or paths match \u201C",l,"\u201D."]}):(0,B.jsx)(z3,{value:e,isOpen:w,setOpen:k,filter:s,shown:A,showMore:R,selected:p,active:x,setActive:b,onSelect:L=>{m(L.id),n?.(L.segments)}})]}):(0,B.jsxs)("div",{className:"xray-json xray-json-tree",role:"tree","aria-label":"JSON viewer",children:[F,(0,B.jsx)("div",{className:"xray-json-tree-body",children:(0,B.jsx)($T,{nodeKey:null,value:e,path:"$",depth:0,isOpen:w,toggle:(L,C)=>k(L,C)})})]})});H3=19,ZT=40,U3="This key repeats an earlier key of the same object. JSON.parse keeps only the last value, at the first key\u2019s position.";rz=fe.default.memo(function({root:e,label:n="JSON viewer",notes:r}){let[o,a]=fe.default.useState(Pd),[i,l]=fe.default.useState(0),[s,f]=fe.default.useState(e),c=s!==e;c&&(f(e),a(Pd()),l(0));let d=c?null:o,u=fe.default.useMemo(()=>xT(e,d??Pd()),[e,d]),p=fe.default.useRef(null),m=fe.default.useRef(null),x=zT({count:u.length,scrollRef:p,estimateSize:()=>H3,getItemKey:C=>u[C]?bT(u[C]):C,overscan:12}),b=fe.default.useCallback((C,_,Q)=>{a(J=>({...J,overrides:new Map(J.overrides).set(C,Q??!Bb(J,C,_))}))},[]),h=C=>{a(_=>({..._,shown:new Map(_.shown).set(C,(_.shown.get(C)??100)+100)}))},y=()=>a(C=>({...C,budget:C.budget+2e4})),g=C=>a(_=>({..._,all:C,overrides:new Map,budget:2e4})),I=fe.default.useCallback(()=>{let C=m.current;if(C===null)return;let _=p.current?.querySelector(`[data-index="${C}"]`);_&&(m.current=null,_.focus({preventScroll:!0}))},[]);fe.default.useLayoutEffect(()=>{I()});let v=C=>C>=0&&C<u.length&&u[C].type!=="close",S=(C,_)=>{for(let Q=C+_;Q>=0&&Q<u.length;Q+=_)if(v(Q))return Q;return-1};function w(C){v(C)&&(l(C),m.current=C,x.scrollToIndex(C,{align:"auto"}),I())}function k(C){C.type==="node"&&C.open!==null?b(C.node,C.depth):C.type==="more"?h(C.node):C.type==="budget"&&y()}function A(C){let _=C.target.closest("[data-index]");if(!_)return;let Q=Number(_.dataset.index),J=u[Q];if(J){switch(C.key){case"ArrowDown":w(S(Q,1));break;case"ArrowUp":w(S(Q,-1));break;case"Home":w(S(-1,1));break;case"End":w(S(u.length,-1));break;case"ArrowRight":if(J.type!=="node"||J.open===null)return;J.open?w(S(Q,1)):b(J.node,J.depth,!0);break;case"ArrowLeft":if(J.type==="node"&&J.open===!0){b(J.node,J.depth,!1);break}for(let tt=Q-1;tt>=0;tt--){let kn=u[tt];if(kn.type==="node"&&kn.depth===J.depth-1){w(tt);break}}break;case"Enter":case" ":k(J);break;default:return}C.preventDefault()}}let R=x.getVirtualItems(),F=R.some(C=>C.index===i&&v(i))?i:R.find(C=>v(C.index))?.index??-1;function L(C,_,Q,J){let tt={transform:`translateY(${Q}px)`};if(C.type==="close")return(0,B.jsxs)("div",{"data-index":_,ref:x.measureElement,className:"xray-json-row xray-json-vrow",role:"none","aria-hidden":"true",style:{...tt,paddingLeft:jd(C.depth)+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),qb(C.depth),(0,B.jsx)("span",{className:"xray-json-punct",children:C.node.t==="arr"?"]":"}"})]},J);let kn={"data-index":_,ref:x.measureElement,role:"treeitem","aria-level":C.depth+1,tabIndex:_===F?0:-1,onFocus:()=>{i!==_&&l(_)}};if(C.type==="more"||C.type==="budget")return(0,B.jsx)("div",{...kn,className:`xray-json-row xray-json-vrow xray-json-flatrow ${C.type==="more"?"xray-json-more-row":"xray-json-budget-row"}`,style:{...tt,paddingLeft:jd(C.depth)+8},onClick:()=>k(C),children:C.type==="more"?(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",Math.min(C.hidden,100)," more \xB7 ",C.hidden.toLocaleString("en-US")," hidden"]}):(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)("span",{className:"xray-json-tree-btn xray-json-more",children:["Show ",2e4.toLocaleString("en-US")," more rows"]}),(0,B.jsxs)("span",{className:"xray-json-muted",children:["The tree stops after ",(d?.budget??2e4).toLocaleString("en-US")," rows; Raw has the whole text."]})]})},J);let _t=C.node;if(C.open!==null){let St=_t;return(0,B.jsxs)("div",{...kn,"aria-expanded":C.open,className:"xray-json-row xray-json-vrow xray-json-flatrow xray-json-branch-row",style:{...tt,paddingLeft:jd(C.depth)},onClick:()=>{window.getSelection?.()?.toString()||(l(_),b(St,C.depth))},children:[(0,B.jsx)(na,{size:13,stroke:2.2,"aria-hidden":"true",className:`xray-json-chevron ${C.open?"":"closed"}`}),qb(C.depth),VT(C.key),GT(C),(0,B.jsx)("span",{className:"xray-json-punct",children:St.t==="arr"?"[":"{"}),!C.open&&(0,B.jsx)("span",{className:"xray-json-summary",children:yT(St)}),!C.open&&(0,B.jsx)("span",{className:"xray-json-punct",children:St.t==="arr"?"]":"}"})]},J)}let bl=_t.t==="num"?gT(_t):null;return(0,B.jsxs)("div",{...kn,className:`xray-json-row xray-json-vrow xray-json-flatrow${bl?" has-hint":""}`,style:{...tt,paddingLeft:jd(C.depth)+8},children:[(0,B.jsx)("span",{className:"xray-json-gutter"}),qb(C.depth),VT(C.key),GT(C),(0,B.jsx)("span",{className:`xray-json-value ${j3(_t)}`,children:V3(_t)}),G3(bl)]},J)}return(0,B.jsxs)("div",{className:"xray-json xray-json-tree is-virtual",children:[(0,B.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,B.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>g(!0),title:`Expand all nodes (${2e4.toLocaleString("en-US")} rows at a time)`,children:[(0,B.jsx)(uu,{size:13,stroke:2}),"Expand all"]}),(0,B.jsxs)("button",{type:"button",className:"xray-json-tree-btn",onClick:()=>g(!1),title:"Collapse all nodes",children:[(0,B.jsx)(du,{size:13,stroke:2}),"Collapse all"]}),r]}),(0,B.jsx)("div",{ref:p,className:"xray-json-vscroll",children:(0,B.jsx)("div",{className:"xray-json-vlist",role:"tree","aria-label":n,style:{height:x.getTotalSize()},onKeyDown:A,children:R.map(C=>L(u[C.index],C.index,C.start,C.key))})})]})})});function rM({result:t,rows:e,sort:n,onSort:r,pkColumns:o,inspected:a,onInspect:i}){let l=(0,en.useRef)(null),s=(0,en.useMemo)(()=>iT(t.columns,t.rows,nM),[t.columns,t.rows]),[f,c]=(0,en.useState)({}),d=(0,en.useMemo)(()=>s.map((A,R)=>f[R]??A),[s,f]),u=lT(e.length,nM),[p,m]=(0,en.useState)({row:0,col:0}),x=(0,en.useRef)(!1),b=(0,en.useRef)(null),h=Af({count:e.length,getScrollElement:()=>l.current,estimateSize:()=>tM,overscan:12,initialRect:{width:1e3,height:400}}),y=Af({horizontal:!0,count:t.columns.length,getScrollElement:()=>l.current,estimateSize:A=>d[A]??120,overscan:3,initialRect:{width:1e3,height:400}});(0,en.useEffect)(()=>{y.measure()},[y,d]);let g=Math.min(p.row,Math.max(0,e.length-1)),I=Math.min(p.col,Math.max(0,t.columns.length-1));(0,en.useEffect)(()=>{x.current&&(x.current=!1,l.current?.querySelector(`[data-cell="${g}:${I}"]`)?.focus({preventScroll:!0}))});let v=u+y.getTotalSize(),S=y.getVirtualItems();function w(A,R){let F=Math.max(0,Math.min(e.length-1,A)),L=Math.max(0,Math.min(t.columns.length-1,R));m({row:F,col:L}),h.scrollToIndex(F),y.scrollToIndex(L),x.current=!0}function k(A){if(A.target.getAttribute("role")!=="gridcell")return;let F=Math.max(1,Math.floor((l.current?.clientHeight??400)/tM)-2),C={ArrowUp:[g-1,I],ArrowDown:[g+1,I],ArrowLeft:[g,I-1],ArrowRight:[g,I+1],PageUp:[g-F,I],PageDown:[g+F,I],Home:[g,0],End:[g,t.columns.length-1]}[A.key];C?(A.preventDefault(),w(C[0],C[1])):A.key==="Enter"&&(A.preventDefault(),i({row:g,col:I}))}return(0,lt.jsx)("div",{ref:l,className:"xray-sql-grid",role:"grid","aria-label":"Query results","aria-rowcount":e.length+1,"aria-colcount":t.columns.length+1,onKeyDown:k,children:(0,lt.jsxs)("div",{style:{width:v,height:Df+h.getTotalSize(),position:"relative"},children:[(0,lt.jsxs)("div",{className:"xray-sql-grid-head",role:"row","aria-rowindex":1,style:{width:v,height:Df},children:[(0,lt.jsx)("div",{className:"xray-sql-grid-index",role:"columnheader",style:{width:u,height:Df},children:"#"}),S.map(A=>{let R=t.columns[A.index],F=n?.col===A.index?n.dir:null,L=o.has(R.name);return(0,lt.jsxs)("div",{className:`xray-sql-grid-th${F?" sorted":""}`,role:"columnheader","aria-colindex":A.index+2,"aria-sort":F==="asc"?"ascending":F==="desc"?"descending":"none",tabIndex:0,title:`${R.name}${R.type?` ${R.type}`:""} \u2014 click to sort`,style:{left:u+A.start,width:A.size,height:Df},onClick:()=>r(A.index),onKeyDown:C=>{(C.key==="Enter"||C.key===" ")&&(C.preventDefault(),r(A.index))},children:[(0,lt.jsxs)("span",{className:"xray-sql-th-name",children:[L&&(0,lt.jsx)(Kh,{size:12,stroke:2,role:"img","aria-label":"primary key",className:"xray-sql-th-key"}),(0,lt.jsx)("span",{className:"xray-sql-th-label",children:R.name}),F&&(F==="asc"?(0,lt.jsx)(Uh,{size:12,stroke:2.2,"aria-hidden":"true",className:"xray-sql-th-sort"}):(0,lt.jsx)(Hh,{size:12,stroke:2.2,"aria-hidden":"true",className:"xray-sql-th-sort"}))]}),(0,lt.jsx)("span",{className:"xray-sql-th-type",children:Mb(R.type)}),(0,lt.jsx)("span",{className:"xray-sql-col-resize","aria-hidden":"true",onClick:C=>C.stopPropagation(),onDoubleClick:C=>{C.stopPropagation(),c(({[A.index]:_,...Q})=>Q)},onPointerDown:C=>{C.button===0&&(C.preventDefault(),C.stopPropagation(),C.currentTarget.setPointerCapture(C.pointerId),b.current={col:A.index,startX:C.clientX,startWidth:d[A.index]})},onPointerMove:C=>{let _=b.current;if(!_||_.col!==A.index)return;let Q=Math.max(oT,Math.round(_.startWidth+C.clientX-_.startX));c(J=>J[_.col]===Q?J:{...J,[_.col]:Q})},onPointerUp:C=>{b.current=null,C.currentTarget.releasePointerCapture(C.pointerId)},onPointerCancel:()=>{b.current=null}})]},A.key)})]}),h.getVirtualItems().map(A=>{let R=e[A.index];return(0,lt.jsxs)("div",{className:"xray-sql-grid-row",role:"row","aria-rowindex":A.index+2,style:{top:Df+A.start,height:A.size,width:v},children:[(0,lt.jsx)("div",{className:"xray-sql-grid-index",role:"rowheader",style:{width:u,height:A.size},children:A.index+1}),S.map(F=>{let L=Ca(R[F.index]??null,t.columns[F.index].type),C=a?.row===A.index&&a.col===F.index,_=g===A.index&&I===F.index;return(0,lt.jsx)("div",{role:"gridcell","aria-colindex":F.index+2,"aria-selected":C,tabIndex:_?0:-1,"data-cell":`${A.index}:${F.index}`,className:`xray-sql-grid-cell kind-${L.kind}${C?" selected":""}`,style:{left:u+F.start,width:F.size,height:A.size},onClick:()=>{m({row:A.index,col:F.index}),i({row:A.index,col:F.index})},children:L.text.length>400?L.text.slice(0,400):L.text},F.key)})]},A.key)})]})})}var en,lt,tM,Df,X3,nM,oM=E(()=>{"use strict";en=Y(mt());Lb();kr();Nr();Db();lt=Y(Ce()),tM=26,Df=40,X3=7.3,nM=t=>t.length*X3});function Q3(t,e,n){if(t==="INSERT"){let{text:o,truncatedBlobs:a}=Z2(n,e.columns,e.rows,"sqlite");return{text:o,truncated:a}}return{text:t==="CSV"?Y2(e.columns,e.rows):J2(e.columns,e.rows),truncated:$2(e.rows)}}function W3({result:t,rows:e,cell:n,onClose:r,onToast:o}){let a=t.columns[n.col],i=e[n.row]?.[n.col]??null,l=Ca(i,a?.type),s=Qe.default.useMemo(()=>{if(l.kind!=="json")return null;let c=Co(l.text);return c.ok?{value:bd(c.root)}:null},[l.kind,l.text]);async function f(){let{text:c,truncatedBlob:d}=dT(i,a?.type);try{await navigator.clipboard.writeText(c)}catch{o("Could not copy to the clipboard.");return}d?o("Copied the value.",Vy(1)):o("Copied the value.")}return(0,H.jsxs)("aside",{className:"xray-sql-inspector","aria-label":"Cell inspector",children:[(0,H.jsxs)("header",{className:"xray-sql-inspector-head",children:[(0,H.jsxs)("span",{className:"xray-sql-inspector-title",children:[a?.name??""," ",(0,H.jsxs)("span",{className:"xray-sql-muted",children:["row ",n.row+1," \xB7 ",l.kind]})]}),(0,H.jsxs)("button",{className:"xray-btn xray-btn-sm",onClick:()=>{f()},children:[(0,H.jsx)(Vh,{size:13,stroke:1.8,"aria-hidden":"true"}),"Copy value"]}),(0,H.jsx)("button",{className:"xray-icon-btn","aria-label":"Close cell inspector",title:"Close (Escape)",onClick:r,children:(0,H.jsx)(ra,{size:14,stroke:1.8})})]}),(0,H.jsxs)("div",{className:"xray-sql-inspector-body",children:[s?(0,H.jsx)(JT,{value:s.value}):(0,H.jsx)("pre",{className:"xray-sql-inspector-text",children:l.text}),l.truncated&&(0,H.jsx)("p",{className:"xray-sql-muted",children:"Showing the first 65,536 characters."})]})]})}function aM(){let t=P(l=>l.tabs.find(s=>s.id===l.activeTabId)?.maxRows??1e3),e=P(l=>l.setMaxRows),[n,r]=(0,Qe.useState)(String(t)),[o,a]=(0,Qe.useState)(t);o!==t&&(a(t),r(String(t)));function i(){let l=ll(Number(n));e(l),r(String(l))}return(0,H.jsxs)("label",{className:"xray-sql-field xray-sql-max-rows-field",title:"The most rows a query returns (1\u201350,000)",children:[(0,H.jsx)("span",{children:"Max rows"}),(0,H.jsx)("input",{className:"xray-input xray-sql-max-rows",type:"number",min:1,max:5e4,value:n,onChange:l=>r(l.target.value),onBlur:i,onKeyDown:l=>{l.key==="Enter"&&i()}})]})}function K3(t,e){if(!t||!e)return lM;let n=t.schemas.find(r=>r.name==="main")?.tables.find(r=>r.name===e);return n?new Set(n.columns.filter(r=>r.pk).map(r=>r.name)):lM}function Y3(){let t=P(k=>k.result),e=P(k=>k.resultTable),n=P(k=>k.schema),[r,o]=(0,Qe.useState)(""),[a,i]=(0,Qe.useState)(null),[l,s]=(0,Qe.useState)(null),[f,c]=(0,Qe.useState)(!iM),[d,u]=(0,Qe.useState)(null),p=(0,Qe.useRef)(null);(0,Qe.useEffect)(()=>()=>{p.current&&clearTimeout(p.current)},[]);let m=a&&a.result===t?a.sort:null,x=(0,Qe.useMemo)(()=>t?fT(cT(t.rows,r),m):[],[t,r,m]),b=(0,Qe.useMemo)(()=>K3(n,e),[n,e]);if(!t)return(0,H.jsxs)("div",{className:"xray-sql-results",children:[(0,H.jsx)("div",{className:"xray-sql-results-head",children:(0,H.jsx)(aM,{})}),(0,H.jsx)("p",{className:"xray-sql-empty",children:"Run a query, or click a table on the left to preview it."})]});let h=l&&l.rows===x?l.cell:null,y=r.trim()!=="";function g(...k){u(k),p.current&&clearTimeout(p.current),p.current=setTimeout(()=>u(null),4e3)}async function I(k){if(!t)return;let{text:A,truncated:R}=Q3(k,{...t,rows:x},e??"query_result");try{await navigator.clipboard.writeText(A)}catch{g("Could not copy to the clipboard.");return}let F=`Copied ${x.length} rows as ${k}.`;R?g(F,Vy(R)):g(F)}function v(k){iM=!0,c(!1),s({rows:x,cell:k})}let S=t.columns.length>0,w=t.columns.map(k=>`${k.name}\0${k.type}`).join("");return(0,H.jsxs)("div",{className:"xray-sql-results",children:[(0,H.jsxs)("div",{className:"xray-sql-results-head",children:[(0,H.jsxs)("span",{className:"xray-sql-results-summary",children:[y&&S?uT(x.length,t.rows.length,t.durationMs):If(t),t.hasMore?" \xB7 more rows available, Run with higher limit":""]}),(0,H.jsx)(aM,{}),S&&(0,H.jsxs)("label",{className:"xray-sql-filter",children:[(0,H.jsx)(Qh,{size:13,stroke:1.8,"aria-hidden":"true"}),(0,H.jsx)("input",{className:"xray-input",type:"search","aria-label":"Filter rows",placeholder:"Filter rows",value:r,onChange:k=>o(k.target.value)})]}),S&&f&&!d&&(0,H.jsx)("span",{className:"xray-sql-hint",children:"Click a cell to inspect it"}),(0,H.jsx)("span",{className:"xray-spacer"}),d&&(0,H.jsx)("span",{className:"xray-sql-toast",role:"status",children:d.map(k=>(0,H.jsx)("span",{className:"xray-sql-toast-line",children:k},k))}),S&&(0,H.jsxs)("div",{className:"xray-sql-copy",role:"group","aria-label":"Copy results",children:[(0,H.jsx)("span",{className:"xray-sql-muted",children:"Copy"}),["CSV","JSON","INSERT"].map(k=>(0,H.jsx)("button",{className:"xray-btn xray-btn-sm",onClick:()=>{I(k)},"aria-label":`Copy as ${k}`,children:k},k))]})]}),S?(0,H.jsxs)("div",{className:"xray-sql-results-body",onKeyDown:k=>{k.key==="Escape"&&h&&(k.preventDefault(),s(null))},children:[(0,H.jsx)(rM,{result:t,rows:x,sort:m,onSort:k=>i({result:t,sort:sT(m,k)}),pkColumns:b,inspected:h,onInspect:v},w),h&&(0,H.jsx)(W3,{result:t,rows:x,cell:h,onClose:()=>s(null),onToast:g})]}):(0,H.jsx)("p",{className:"xray-sql-empty",children:"The statement returned no rows."})]})}function J3(){let t=P(r=>r.messages),e=P(r=>r.error),n=(0,Qe.useRef)(null);return(0,Qe.useEffect)(()=>{n.current?.scrollIntoView({block:"nearest"})},[t]),(0,H.jsxs)("div",{className:"xray-sql-messages",role:"log","aria-label":"Messages",children:[t.length===0&&(0,H.jsx)("p",{className:"xray-sql-empty",children:"No messages yet."}),t.map((r,o)=>(0,H.jsx)("div",{className:`xray-sql-message${e&&o===t.length-1&&r.endsWith(e.message)?" error":""}`,children:r},o)),e&&(e.hint||e.detail)&&(0,H.jsx)("div",{className:"xray-sql-message xray-sql-muted",children:[e.hint,e.detail].filter(Boolean).join(" \xB7 ")}),(0,H.jsx)("div",{ref:n})]})}function $3(){let t=P(r=>r.history),e=P(r=>r.connection),{updateTabSql:n}=P.getState();return e?t.length?(0,H.jsx)("ul",{className:"xray-sql-history","aria-label":"Query history",children:t.map((r,o)=>(0,H.jsx)("li",{children:(0,H.jsxs)("button",{className:"xray-sql-history-item",title:"Load into the editor",onClick:()=>{let a=P.getState();n(a.activeTabId,r.sql)},children:[(0,H.jsx)("code",{className:"xray-sql-history-sql",children:r.sql}),(0,H.jsxs)("span",{className:`xray-sql-history-meta${r.ok?"":" error"}`,children:[new Date(r.at).toLocaleTimeString()," \xB7"," ",r.ok?`${r.rowCount??0} rows \xB7 ${r.durationMs} ms`:r.error??"failed"]})]})},`${r.at}-${o}`))}):(0,H.jsxs)("p",{className:"xray-sql-empty",children:["Queries you run on ",e.name," appear here."]}):(0,H.jsx)("p",{className:"xray-sql-empty",children:"History is kept per database file."})}function sM(){let t=P(r=>r.bottomTab),e=P(r=>!!r.running),n=P(r=>r.setBottomTab);return(0,H.jsxs)("section",{className:"xray-sql-bottom","aria-label":"Output",children:[(0,H.jsxs)("div",{className:"xray-sql-bottom-tabs",role:"tablist","aria-label":"Output",children:[Z3.map(r=>(0,H.jsx)("button",{role:"tab",id:`xray-sql-tab-${r.id}`,"aria-selected":t===r.id,"aria-controls":"xray-sql-bottom-panel",className:`xray-tab${t===r.id?" active":""}`,onClick:()=>n(r.id),children:r.label},r.id)),(0,H.jsx)("span",{className:"xray-spacer"}),e&&(0,H.jsx)("span",{className:"xray-sql-running",role:"status",children:"Running\u2026"})]}),(0,H.jsxs)("div",{className:"xray-sql-bottom-panel",id:"xray-sql-bottom-panel",role:"tabpanel","aria-labelledby":`xray-sql-tab-${t}`,children:[t==="results"&&(0,H.jsx)(Y3,{}),t==="messages"&&(0,H.jsx)(J3,{}),t==="history"&&(0,H.jsx)($3,{})]})]})}var Qe,H,iM,lM,Z3,fM=E(()=>{"use strict";Qe=Y(mt());kr();Ta();Nr();Ao();Db();eM();oM();H=Y(Ce());iM=!1;lM=new Set;Z3=[{id:"results",label:"Results"},{id:"messages",label:"Messages"},{id:"history",label:"History"}]});function Xb(t,e){return({state:n,dispatch:r})=>{if(n.readOnly)return!1;let o=t(e,n);return o?(r(n.update(o)),!0):!1}}function Qb(t,e){let n=t.languageDataAt("commentTokens",e,1);return n.length?n[0]:{}}function o6(t,{open:e,close:n},r,o){let a=t.sliceDoc(r-Of,r),i=t.sliceDoc(o,o+Of),l=/\s*$/.exec(a)[0].length,s=/^\s*/.exec(i)[0].length,f=a.length-l;if(a.slice(f-e.length,f)==e&&i.slice(s,s+n.length)==n)return{open:{pos:r-l,margin:l&&1},close:{pos:o+s,margin:s&&1}};let c,d;o-r<=2*Of?c=d=t.sliceDoc(r,o):(c=t.sliceDoc(r,r+Of),d=t.sliceDoc(o-Of,o));let u=/^\s*/.exec(c)[0].length,p=/\s*$/.exec(d)[0].length,m=d.length-p-n.length;return c.slice(u,u+e.length)==e&&d.slice(m,m+n.length)==n?{open:{pos:r+u+e.length,margin:/\s/.test(c.charAt(u+e.length))?1:0},close:{pos:o-p-n.length,margin:/\s/.test(d.charAt(m-1))?1:0}}:null}function a6(t){let e=[];for(let n of t.selection.ranges){let r=t.doc.lineAt(n.from),o=n.to<=r.to?r:t.doc.lineAt(n.to);o.from>r.from&&o.from==n.to&&(o=n.to==r.to+1?r:t.doc.lineAt(n.to-1));let a=e.length-1;a>=0&&e[a].to>r.from?e[a].to=o.to:e.push({from:r.from+/^\s*/.exec(r.text)[0].length,to:o.to})}return e}function yM(t,e,n=e.selection.ranges){let r=n.map(a=>Qb(e,a.from).block);if(!r.every(a=>a))return null;let o=n.map((a,i)=>o6(e,r[i],a.from,a.to));if(t!=2&&!o.every(a=>a))return{changes:e.changes(n.map((a,i)=>o[i]?[]:[{from:a.from,insert:r[i].open+" "},{from:a.to,insert:" "+r[i].close}]))};if(t!=1&&o.some(a=>a)){let a=[];for(let i=0,l;i<o.length;i++)if(l=o[i]){let s=r[i],{open:f,close:c}=l;a.push({from:f.pos-s.open.length,to:f.pos+f.margin},{from:c.pos-c.margin,to:c.pos+s.close.length})}return{changes:a}}return null}function i6(t,e,n=e.selection.ranges){let r=[],o=-1;e:for(let{from:a,to:i}of n){let l=r.length,s=1e9,f;for(let c=a;c<=i;){let d=e.doc.lineAt(c);if(f==null&&(f=Qb(e,d.from).line,!f))continue e;if(d.from>o&&(a==i||i>d.from)){o=d.from;let u=/^\s*/.exec(d.text)[0].length,p=u==d.length,m=d.text.slice(u,u+f.length)==f?u:-1;u<d.text.length&&u<s&&(s=u),r.push({line:d,comment:m,token:f,indent:u,empty:p,single:!1})}c=d.to+1}if(s<1e9)for(let c=l;c<r.length;c++)r[c].indent<r[c].line.text.length&&(r[c].indent=s);r.length==l+1&&(r[l].single=!0)}if(t!=2&&r.some(a=>a.comment<0&&(!a.empty||a.single))){let a=[];for(let{line:l,token:s,indent:f,empty:c,single:d}of r)(d||!c)&&a.push({from:l.from+f,insert:s+" "});let i=e.changes(a);return{changes:i,selection:e.selection.map(i,1)}}else if(t!=1&&r.some(a=>a.comment>=0)){let a=[];for(let{line:i,comment:l,token:s}of r)if(l>=0){let f=i.from+l,c=f+s.length;i.text[c-i.from]==" "&&c++,a.push({from:f,to:c})}return{changes:a}}return null}function vM(t={}){return[IM,bM.of(t),U.domEventHandlers({beforeinput(e,n){let r=e.inputType=="historyUndo"?wM:e.inputType=="historyRedo"?jb:null;return r?(e.preventDefault(),r(n)):!1}})]}function Qd(t,e){return function({state:n,dispatch:r}){if(!e&&n.readOnly)return!1;let o=n.field(IM,!1);if(!o)return!1;let a=o.pop(t,n,e);return a?(r(a),!0):!1}}function Xd(t,e,n,r){let o=e+1>n+20?e-n-1:0,a=t.slice(o,e);return a.push(r),a}function u6(t,e){let n=[],r=!1;return t.iterChangedRanges((o,a)=>n.push(o,a)),e.iterChangedRanges((o,a,i,l)=>{for(let s=0;s<n.length;){let f=n[s++],c=n[s++];l>=f&&i<=c&&(r=!0)}}),r}function d6(t,e){return t.ranges.length==e.ranges.length&&t.ranges.filter((n,r)=>n.empty!=e.ranges[r].empty).length===0}function SM(t,e){return t.length?e.length?t.concat(e):t:e}function kM(t,e){if(t.length){let n=t[t.length-1],r=n.selectionsAfter.slice(Math.max(0,n.selectionsAfter.length-p6));return r.length&&r[r.length-1].eq(e)?t:(r.push(e),Xd(t,t.length-1,1e9,n.setSelAfter(r)))}else return[qn.selection([e])]}function m6(t){let e=t[t.length-1],n=t.slice();return n[t.length-1]=e.setSelAfter(e.selectionsAfter.slice(0,e.selectionsAfter.length-1)),n}function Hb(t,e){if(!t.length)return t;let n=t.length,r=wn;for(;n;){let o=h6(t[n-1],e,r);if(o.changes&&!o.changes.empty||o.effects.length){let a=t.slice(0,n);return a[n-1]=o,a}else e=o.mapped,n--,r=o.selectionsAfter}return r.length?[qn.selection(r)]:wn}function h6(t,e,n){let r=SM(t.selectionsAfter.length?t.selectionsAfter.map(l=>l.map(e)):wn,n);if(!t.changes)return qn.selection(r);let o=t.changes.map(e),a=e.mapDesc(t.changes,!0),i=t.mapped?t.mapped.composeDesc(a):a;return new qn(o,ae.mapEffects(t.effects,e),i,t.startSelection.map(a),r)}function gl(t,e){return O.create(t.ranges.map(e),t.mainIndex)}function _n(t,e){return t.update({selection:e,scrollIntoView:!0,userEvent:"select"})}function Pn({state:t,dispatch:e},n){let r=gl(t.selection,n);return r.eq(t.selection,!0)?!1:(e(_n(t,r)),!0)}function Wd(t,e){return O.cursor(e?t.to:t.from)}function AM(t,e){return Pn(t,n=>n.empty?t.moveByChar(n,e):Wd(n,e))}function pt(t){return t.textDirectionAt(t.state.selection.main.head)==me.LTR}function DM(t,e){return Pn(t,n=>n.empty?t.moveByGroup(n,e):Wd(n,e))}function b6(t,e,n){if(e.type.prop(n))return!0;let r=e.to-e.from;return r&&(r>2||/[^\s,.;:]/.test(t.sliceDoc(e.from,e.to)))||e.firstChild}function Kd(t,e,n){let r=dt(t).resolveInner(e.head),o=n?V.closedBy:V.openedBy;for(let s=e.head;;){let f=n?r.childAfter(s):r.childBefore(s);if(!f)break;b6(t,f,o)?r=f:s=n?f.to:f.from}let a=r.type.prop(o),i,l;return a&&(i=n?Fn(t,r.from,1):Fn(t,r.to,-1))&&i.matched?l=n?i.end.to:i.end.from:l=n?r.to:r.from,O.cursor(l,n?-1:1)}function OM(t,e){return Pn(t,n=>{if(!n.empty)return Wd(n,e);let r=t.moveVertically(n,e);return r.head!=n.head?r:t.moveToLineBoundary(n,e)})}function EM(t){let e=t.scrollDOM.clientHeight<t.scrollDOM.scrollHeight-2,n=0,r=0,o;if(e){for(let a of t.state.facet(U.scrollMargins)){let i=a(t);i?.top&&(n=Math.max(i?.top,n)),i?.bottom&&(r=Math.max(i?.bottom,r))}o=t.scrollDOM.clientHeight-n-r}else o=(t.dom.ownerDocument.defaultView||window).innerHeight;return{marginTop:n,marginBottom:r,selfScroll:e,height:Math.max(t.defaultLineHeight,o-5)}}function FM(t,e){let n=EM(t),{state:r}=t,o=gl(r.selection,i=>i.empty?t.moveVertically(i,e,n.height):Wd(i,e));if(o.eq(r.selection))return!1;let a;if(n.selfScroll){let i=t.coordsAtPos(r.selection.main.head),l=t.scrollDOM.getBoundingClientRect(),s=l.top+n.marginTop,f=l.bottom-n.marginBottom;i&&i.top>s&&i.bottom<f&&(a=U.scrollIntoView(o.main.head,{y:"start",yMargin:i.top-s}))}return t.dispatch(_n(r,o),{effects:a}),!0}function Eo(t,e,n){let r=t.lineBlockAt(e.head),o=t.moveToLineBoundary(e,n);if(o.head==e.head&&o.head!=(n?r.to:r.from)&&(o=t.moveToLineBoundary(e,n,!1)),!n&&o.head==r.from&&r.length){let a=/^\s*/.exec(t.state.sliceDoc(r.from,Math.min(r.from+100,r.to)))[0].length;a&&e.head!=r.from+a&&(o=O.cursor(r.from+a))}return o}function M6(t,e,n){let r=!1,o=gl(t.selection,a=>{let i=Fn(t,a.head,-1)||Fn(t,a.head,1)||a.head>0&&Fn(t,a.head-1,1)||a.head<t.doc.length&&Fn(t,a.head+1,-1);if(!i||!i.end)return a;r=!0;let l=i.start.from==a.head?i.end.to:i.end.from;return n?O.range(a.anchor,l):O.cursor(l)});return r?(e(_n(t,o)),!0):!1}function Sn(t,e,n){let r=gl(t.state.selection,o=>{o.undirectional&&o.head>=o.anchor!=e&&(o=O.range(o.head,o.anchor));let a=n(o);return O.range(o.anchor,a.head,a.goalColumn,a.bidiLevel||void 0,a.assoc)});return r.eq(t.state.selection)?!1:(t.dispatch(_n(t.state,r)),!0)}function LM(t,e){return Sn(t,e,n=>t.moveByChar(n,e))}function _M(t,e){return Sn(t,e,n=>t.moveByGroup(n,e))}function PM(t,e){return Sn(t,e,n=>t.moveVertically(n,e))}function UM(t,e){return Sn(t,e,n=>t.moveVertically(n,e,EM(t).height))}function jM(t,e){let{state:n}=t,r=n.selection,o=n.selection.ranges.slice();for(let a of n.selection.ranges){let i=n.doc.lineAt(a.head);if(e?i.to<t.state.doc.length:i.from>0)for(let l=a;;){let s=t.moveVertically(l,e);if(s.head<i.from||s.head>i.to){o.some(f=>f.head==s.head)||o.push(s);break}else{if(s.head==l.head)break;l=s}}}return o.length==r.ranges.length?!1:(t.dispatch(_n(n,O.create(o,o.length-1))),!0)}function Bf(t,e){if(t.state.readOnly)return!1;let n="delete.selection",{state:r}=t,o=r.changeByRange(a=>{let{from:i,to:l}=a;if(i==l){let s=e(a);s<i?(n="delete.backward",s=Gd(t,s,!1)):s>i&&(n="delete.forward",s=Gd(t,s,!0)),i=Math.min(i,s),l=Math.max(l,s)}else i=Gd(t,i,!1),l=Gd(t,l,!0);return i==l?{range:a}:{changes:{from:i,to:l},range:O.cursor(i,i<a.head?-1:1)}});return o.changes.empty?!1:(t.dispatch(r.update(o,{scrollIntoView:!0,userEvent:n,effects:n=="delete.selection"?U.announce.of(r.phrase("Selection deleted")):void 0})),!0)}function Gd(t,e,n){if(t instanceof U)for(let r of t.state.facet(U.atomicRanges).map(o=>o(t)))r.between(e,e,(o,a)=>{o<e&&a>e&&(e=n?a:o)});return e}function Yd(t){let e=[],n=-1;for(let r of t.selection.ranges){let o=t.doc.lineAt(r.from),a=t.doc.lineAt(r.to);if(!r.empty&&r.to==a.from&&(a=t.doc.lineAt(r.to-1)),n>=o.number){let i=e[e.length-1];i.to=a.to,i.ranges.push(r)}else e.push({from:o.from,to:a.to,ranges:[r]});n=a.number+1}return e}function WM(t,e,n){if(t.readOnly)return!1;let r=[],o=[];for(let a of Yd(t)){if(n?a.to==t.doc.length:a.from==0)continue;let i=t.doc.lineAt(n?a.to+1:a.from-1),l=i.length+1;if(n){r.push({from:a.to,to:i.to},{from:a.from,insert:i.text+t.lineBreak});for(let s of a.ranges)o.push(O.range(Math.min(t.doc.length,s.anchor+l),Math.min(t.doc.length,s.head+l)))}else{r.push({from:i.from,to:a.from},{from:a.to,insert:t.lineBreak+i.text});for(let s of a.ranges)o.push(O.range(s.anchor-l,s.head-l))}}return r.length?(e(t.update({changes:r,scrollIntoView:!0,selection:O.create(o,t.selection.mainIndex),userEvent:"move.line"})),!0):!1}function KM(t,e,n){if(t.readOnly)return!1;let r=[];for(let a of Yd(t))n?r.push({from:a.from,insert:t.doc.slice(a.from,a.to)+t.lineBreak}):r.push({from:a.to,insert:t.lineBreak+t.doc.slice(a.from,a.to)});let o=t.changes(r);return e(t.update({changes:o,selection:t.selection.map(o,n?1:-1),scrollIntoView:!0,userEvent:"input.copyline"})),!0}function rq(t,e){if(/\(\)|\[\]|\{\}/.test(t.sliceDoc(e-1,e+1)))return{from:e,to:e};let n=dt(t).resolveInner(e),r=n.childBefore(e),o=n.childAfter(e),a;return r&&o&&r.to<=e&&o.from>=e&&(a=r.type.prop(V.closedBy))&&a.indexOf(o.name)>-1&&t.doc.lineAt(r.to).from==t.doc.lineAt(o.from).from&&!/\S/.test(t.sliceDoc(r.to,o.from))?{from:r.to,to:o.from}:null}function YM(t){return({state:e,dispatch:n})=>{if(e.readOnly)return!1;let r=e.changeByRange(o=>{let{from:a,to:i}=o,l=e.doc.lineAt(a),s=!t&&a==i&&rq(e,a);t&&(a=i=(i<=l.to?l:e.doc.lineAt(i)).to);let f=new ya(e,{simulateBreak:a,simulateDoubleBreak:!!s}),c=ry(f,a);for(c==null&&(c=ua(/^\s*/.exec(e.doc.lineAt(a).text)[0],e.tabSize));i<l.to&&/\s/.test(l.text[i-l.from]);)i++;s?{from:a,to:i}=s:a>l.from&&a<l.from+100&&!/\S/.test(l.text.slice(0,a))&&(a=l.from);let d=["",nf(e,c)];return s&&d.push(nf(e,f.lineIndent(l.from,-1))),{changes:{from:a,to:i,insert:te.of(d)},range:O.cursor(a+1+d[1].length)}});return n(e.update(r,{scrollIntoView:!0,userEvent:"input"})),!0}}function Wb(t,e){let n=-1;return t.changeByRange(r=>{let o=[];for(let i=r.from;i<=r.to;){let l=t.doc.lineAt(i);l.number>n&&(r.empty||r.to>l.from)&&(e(l,o,r),n=l.number),i=l.to+1}let a=t.changes(o);return{changes:o,range:O.range(a.mapPos(r.anchor,1),a.mapPos(r.head,1))}})}var e6,t6,n6,r6,Of,Ub,l6,s6,bM,IM,wM,jb,f6,c6,qn,wn,p6,x6,Ea,CM,TM,MM,g6,y6,Sz,I6,v6,BM,RM,cM,Vb,w6,S6,k6,C6,A6,T6,D6,NM,qM,O6,B6,R6,E6,zM,HM,uM,dM,F6,L6,N6,q6,_6,P6,pM,mM,hM,xM,z6,H6,U6,j6,V6,G6,VM,Gb,GM,XM,QM,X6,Q6,W6,K6,Y6,J6,$6,Z6,eq,tq,nq,gM,oq,aq,iq,lq,sq,fq,cq,JM,$M=E(()=>{Li();Ys();rf();Ts();e6=t=>{let{state:e}=t,n=e.doc.lineAt(e.selection.main.from),r=Qb(t.state,n.from);return r.line?t6(t):r.block?r6(t):!1};t6=Xb(i6,0),n6=Xb(yM,0),r6=Xb((t,e)=>yM(t,e,a6(e)),0);Of=50;Ub=Bt.define(),l6=Bt.define(),s6=z.define(),bM=z.define({combine(t){return go(t,{minDepth:100,newGroupDelay:500,joinToEvent:(e,n)=>n},{minDepth:Math.max,newGroupDelay:Math.min,joinToEvent:(e,n)=>(r,o)=>e(r,o)||n(r,o)})}}),IM=ut.define({create(){return Ea.empty},update(t,e){let n=e.state.facet(bM),r=e.annotation(Ub);if(r){let s=qn.fromTransaction(e,r.selection),f=r.side,c=f==0?t.undone:t.done;return s?c=Xd(c,c.length,n.minDepth,s):c=kM(c,e.startState.selection),new Ea(f==0?r.rest:c,f==0?c:r.rest)}let o=e.annotation(l6);if((o=="full"||o=="before")&&(t=t.isolate()),e.annotation(Xe.addToHistory)===!1)return e.changes.empty?t:t.addMapping(e.changes.desc);let a=qn.fromTransaction(e),i=e.annotation(Xe.time),l=e.annotation(Xe.userEvent);return a?t=t.addChanges(a,i,l,n,e):e.selection&&(t=t.addSelection(e.startState.selection,i,l,n.newGroupDelay)),(o=="full"||o=="after")&&(t=t.isolate()),t},toJSON(t){return{done:t.done.map(e=>e.toJSON()),undone:t.undone.map(e=>e.toJSON())}},fromJSON(t){return new Ea(t.done.map(qn.fromJSON),t.undone.map(qn.fromJSON))}});wM=Qd(0,!1),jb=Qd(1,!1),f6=Qd(0,!0),c6=Qd(1,!0),qn=class t{constructor(e,n,r,o,a){this.changes=e,this.effects=n,this.mapped=r,this.startSelection=o,this.selectionsAfter=a}setSelAfter(e){return new t(this.changes,this.effects,this.mapped,this.startSelection,e)}toJSON(){var e,n,r;return{changes:(e=this.changes)===null||e===void 0?void 0:e.toJSON(),mapped:(n=this.mapped)===null||n===void 0?void 0:n.toJSON(),startSelection:(r=this.startSelection)===null||r===void 0?void 0:r.toJSON(),selectionsAfter:this.selectionsAfter.map(o=>o.toJSON())}}static fromJSON(e){return new t(e.changes&&bt.fromJSON(e.changes),[],e.mapped&&Cr.fromJSON(e.mapped),e.startSelection&&O.fromJSON(e.startSelection),e.selectionsAfter.map(O.fromJSON))}static fromTransaction(e,n){let r=wn;for(let o of e.startState.facet(s6)){let a=o(e);a.length&&(r=r.concat(a))}return!r.length&&e.changes.empty?null:new t(e.changes.invert(e.startState.doc),r,void 0,n||e.startState.selection,wn)}static selection(e){return new t(void 0,wn,void 0,void 0,e)}};wn=[],p6=200;x6=/^(input\.type|delete)($|\.)/,Ea=class t{constructor(e,n,r=0,o=void 0){this.done=e,this.undone=n,this.prevTime=r,this.prevUserEvent=o}isolate(){return this.prevTime?new t(this.done,this.undone):this}addChanges(e,n,r,o,a){let i=this.done,l=i[i.length-1];return l&&l.changes&&!l.changes.empty&&e.changes&&(!r||x6.test(r))&&(!l.selectionsAfter.length&&n-this.prevTime<o.newGroupDelay&&o.joinToEvent(a,u6(l.changes,e.changes))||r=="input.type.compose")?i=Xd(i,i.length-1,o.minDepth,new qn(e.changes.compose(l.changes),SM(ae.mapEffects(e.effects,l.changes),l.effects),l.mapped,l.startSelection,wn)):i=Xd(i,i.length,o.minDepth,e),new t(i,wn,n,r)}addSelection(e,n,r,o){let a=this.done.length?this.done[this.done.length-1].selectionsAfter:wn;return a.length>0&&n-this.prevTime<o&&r==this.prevUserEvent&&r&&/^select($|\.)/.test(r)&&d6(a[a.length-1],e)?this:new t(kM(this.done,e),this.undone,n,r)}addMapping(e){return new t(Hb(this.done,e),Hb(this.undone,e),this.prevTime,this.prevUserEvent)}pop(e,n,r){let o=e==0?this.done:this.undone;if(o.length==0)return null;let a=o[o.length-1],i=a.selectionsAfter[0]||(a.startSelection?a.startSelection.map(a.changes.invertedDesc,1):n.selection);if(r&&a.selectionsAfter.length)return n.update({selection:a.selectionsAfter[a.selectionsAfter.length-1],annotations:Ub.of({side:e,rest:m6(o),selection:i}),userEvent:e==0?"select.undo":"select.redo",scrollIntoView:!0});if(a.changes){let l=o.length==1?wn:o.slice(0,o.length-1);return a.mapped&&(l=Hb(l,a.mapped)),n.update({changes:a.changes,selection:a.startSelection,effects:a.effects,annotations:Ub.of({side:e,rest:l,selection:i}),filter:!1,userEvent:e==0?"undo":"redo",scrollIntoView:!0})}else return null}};Ea.empty=new Ea(wn,wn);CM=[{key:"Mod-z",run:wM,preventDefault:!0},{key:"Mod-y",mac:"Mod-Shift-z",run:jb,preventDefault:!0},{linux:"Ctrl-Shift-z",run:jb,preventDefault:!0},{key:"Mod-u",run:f6,preventDefault:!0},{key:"Alt-u",mac:"Mod-Shift-u",run:c6,preventDefault:!0}];TM=t=>AM(t,!pt(t)),MM=t=>AM(t,pt(t));g6=t=>DM(t,!pt(t)),y6=t=>DM(t,pt(t)),Sz=typeof Intl<"u"&&Intl.Segmenter?new Intl.Segmenter(void 0,{granularity:"word"}):null;I6=t=>Pn(t,e=>Kd(t.state,e,!pt(t))),v6=t=>Pn(t,e=>Kd(t.state,e,pt(t)));BM=t=>OM(t,!1),RM=t=>OM(t,!0);cM=t=>FM(t,!1),Vb=t=>FM(t,!0);w6=t=>Pn(t,e=>Eo(t,e,!0)),S6=t=>Pn(t,e=>Eo(t,e,!1)),k6=t=>Pn(t,e=>Eo(t,e,!pt(t))),C6=t=>Pn(t,e=>Eo(t,e,pt(t))),A6=t=>Pn(t,e=>t.moveToLineBoundary(e,!1,!1)),T6=t=>Pn(t,e=>t.moveToLineBoundary(e,!0,!1));D6=({state:t,dispatch:e})=>M6(t,e,!1);NM=t=>LM(t,!pt(t)),qM=t=>LM(t,pt(t));O6=t=>_M(t,!pt(t)),B6=t=>_M(t,pt(t)),R6=t=>{let e=!pt(t);return Sn(t,e,n=>Kd(t.state,n,e))},E6=t=>{let e=pt(t);return Sn(t,e,n=>Kd(t.state,n,e))};zM=t=>PM(t,!1),HM=t=>PM(t,!0);uM=t=>UM(t,!1),dM=t=>UM(t,!0),F6=t=>Sn(t,!0,e=>Eo(t,e,!0)),L6=t=>Sn(t,!1,e=>Eo(t,e,!1)),N6=t=>{let e=!pt(t);return Sn(t,e,n=>Eo(t,n,e))},q6=t=>{let e=pt(t);return Sn(t,e,n=>Eo(t,n,e))},_6=t=>Sn(t,!1,e=>O.cursor(t.lineBlockAt(e.head).from)),P6=t=>Sn(t,!0,e=>O.cursor(t.lineBlockAt(e.head).to)),pM=({state:t,dispatch:e})=>(e(_n(t,{anchor:0})),!0),mM=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.doc.length})),!0),hM=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.selection.main.anchor,head:0})),!0),xM=({state:t,dispatch:e})=>(e(_n(t,{anchor:t.selection.main.anchor,head:t.doc.length})),!0),z6=({state:t,dispatch:e})=>(e(t.update({selection:{anchor:0,head:t.doc.length},userEvent:"select"})),!0),H6=({state:t,dispatch:e})=>{let n=Yd(t).map(({from:r,to:o})=>O.undirectionalRange(r,Math.min(o+1,t.doc.length)));return e(t.update({selection:O.create(n),userEvent:"select"})),!0},U6=({state:t,dispatch:e})=>{let n=gl(t.selection,r=>{let o=dt(t),a=o.resolveStack(r.from,1);if(r.empty){let i=o.resolveStack(r.from,-1);i.node.from>=a.node.from&&i.node.to<=a.node.to&&(a=i)}for(let i=a;i;i=i.next){let{node:l}=i;if((l.from<r.from&&l.to>=r.to||l.to>r.to&&l.from<=r.from)&&i.next)return O.undirectionalRange(l.from,l.to)}return r});return n.eq(t.selection)?!1:(e(_n(t,n)),!0)};j6=t=>jM(t,!1),V6=t=>jM(t,!0),G6=({state:t,dispatch:e})=>{let n=t.selection,r=null;return n.ranges.length>1?r=O.create([n.main]):n.main.empty||(r=O.create([O.cursor(n.main.head)])),r?(e(_n(t,r)),!0):!1};VM=(t,e,n)=>Bf(t,r=>{let o=r.from,{state:a}=t,i=a.doc.lineAt(o),l,s;if(n&&!e&&o>i.from&&o<i.from+200&&!/[^ \t]/.test(l=i.text.slice(0,o-i.from))){if(l[l.length-1]=="	")return o-1;let f=ua(l,a.tabSize),c=f%tf(a)||tf(a);for(let d=0;d<c&&l[l.length-1-d]==" ";d++)o--;s=o}else s=Je(i.text,o-i.from,e,e)+i.from,s==o&&i.number!=(e?a.doc.lines:1)?s+=e?1:-1:!e&&/[\ufe00-\ufe0f]/.test(i.text.slice(s-i.from,o-i.from))&&(s=Je(i.text,s-i.from,!1,!1)+i.from);return s}),Gb=t=>VM(t,!1,!0),GM=t=>VM(t,!0,!1),XM=(t,e)=>Bf(t,n=>{let r=n.head,{state:o}=t,a=o.doc.lineAt(r),i=o.charCategorizer(r);for(let l=null;;){if(r==(e?a.to:a.from)){r==n.head&&a.number!=(e?o.doc.lines:1)&&(r+=e?1:-1);break}let s=Je(a.text,r-a.from,e)+a.from,f=a.text.slice(Math.min(r,s)-a.from,Math.max(r,s)-a.from),c=i(f);if(l!=null&&c!=l)break;(f!=" "||r!=n.head)&&(l=c),r=s}return r}),QM=t=>XM(t,!1),X6=t=>XM(t,!0),Q6=t=>Bf(t,e=>{let n=t.lineBlockAt(e.head).to;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),W6=t=>Bf(t,e=>{let n=t.moveToLineBoundary(e,!1).head;return e.head>n?n:Math.max(0,e.head-1)}),K6=t=>Bf(t,e=>{let n=t.moveToLineBoundary(e,!0).head;return e.head<n?n:Math.min(t.state.doc.length,e.head+1)}),Y6=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>({changes:{from:r.from,to:r.to,insert:te.of(["",""])},range:O.cursor(r.from)}));return e(t.update(n,{scrollIntoView:!0,userEvent:"input"})),!0},J6=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=t.changeByRange(r=>{if(!r.empty||r.from==0||r.from==t.doc.length)return{range:r};let o=r.from,a=t.doc.lineAt(o),i=o==a.from?o-1:Je(a.text,o-a.from,!1)+a.from,l=o==a.to?o+1:Je(a.text,o-a.from,!0)+a.from;return{changes:{from:i,to:l,insert:t.doc.slice(o,l).append(t.doc.slice(i,o))},range:O.cursor(l)}});return n.changes.empty?!1:(e(t.update(n,{scrollIntoView:!0,userEvent:"move.character"})),!0)};$6=({state:t,dispatch:e})=>WM(t,e,!1),Z6=({state:t,dispatch:e})=>WM(t,e,!0);eq=({state:t,dispatch:e})=>KM(t,e,!1),tq=({state:t,dispatch:e})=>KM(t,e,!0),nq=t=>{if(t.state.readOnly)return!1;let{state:e}=t,n=e.changes(Yd(e).map(({from:o,to:a})=>(o>0?o--:a<e.doc.length&&a++,{from:o,to:a}))),r=gl(e.selection,o=>{let a;if(t.lineWrapping){let i=t.lineBlockAt(o.head),l=t.coordsAtPos(o.head,o.assoc||1);l&&(a=i.bottom+t.documentTop-l.bottom+t.defaultLineHeight/2)}return t.moveVertically(o,!0,a)}).map(n);return t.dispatch({changes:n,selection:r,scrollIntoView:!0,userEvent:"delete.line"}),!0};gM=YM(!1),oq=YM(!0);aq=({state:t,dispatch:e})=>{if(t.readOnly)return!1;let n=Object.create(null),r=new ya(t,{overrideIndentation:a=>{let i=n[a];return i??-1}}),o=Wb(t,(a,i,l)=>{let s=ry(r,a.from);if(s==null)return;/\S/.test(a.text)||(s=0);let f=/^\s*/.exec(a.text)[0],c=nf(t,s);(f!=c||l.from<a.from+f.length)&&(n[a.from]=s,i.push({from:a.from,to:a.from+f.length,insert:c}))});return o.changes.empty||e(t.update(o,{userEvent:"indent"})),!0},iq=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(Wb(t,(n,r)=>{r.push({from:n.from,insert:t.facet(ef)})}),{userEvent:"input.indent"})),!0),lq=({state:t,dispatch:e})=>t.readOnly?!1:(e(t.update(Wb(t,(n,r)=>{let o=/^\s*/.exec(n.text)[0];if(!o)return;let a=ua(o,t.tabSize),i=0,l=nf(t,Math.max(0,a-tf(t)));for(;i<o.length&&i<l.length&&o.charCodeAt(i)==l.charCodeAt(i);)i++;r.push({from:n.from+i,to:n.from+o.length,insert:l.slice(i)})}),{userEvent:"delete.dedent"})),!0),sq=t=>(t.setTabFocusMode(),!0),fq=[{key:"Ctrl-b",run:TM,shift:NM,preventDefault:!0},{key:"Ctrl-f",run:MM,shift:qM},{key:"Ctrl-p",run:BM,shift:zM},{key:"Ctrl-n",run:RM,shift:HM},{key:"Ctrl-a",run:A6,shift:_6},{key:"Ctrl-e",run:T6,shift:P6},{key:"Ctrl-d",run:GM},{key:"Ctrl-h",run:Gb},{key:"Ctrl-k",run:Q6},{key:"Ctrl-Alt-h",run:QM},{key:"Ctrl-o",run:Y6},{key:"Ctrl-t",run:J6},{key:"Ctrl-v",run:Vb}],cq=[{key:"ArrowLeft",run:TM,shift:NM,preventDefault:!0},{key:"Mod-ArrowLeft",mac:"Alt-ArrowLeft",run:g6,shift:O6,preventDefault:!0},{mac:"Cmd-ArrowLeft",run:k6,shift:N6,preventDefault:!0},{key:"ArrowRight",run:MM,shift:qM,preventDefault:!0},{key:"Mod-ArrowRight",mac:"Alt-ArrowRight",run:y6,shift:B6,preventDefault:!0},{mac:"Cmd-ArrowRight",run:C6,shift:q6,preventDefault:!0},{key:"ArrowUp",run:BM,shift:zM,preventDefault:!0},{mac:"Cmd-ArrowUp",run:pM,shift:hM},{mac:"Ctrl-ArrowUp",run:cM,shift:uM},{key:"ArrowDown",run:RM,shift:HM,preventDefault:!0},{mac:"Cmd-ArrowDown",run:mM,shift:xM},{mac:"Ctrl-ArrowDown",run:Vb,shift:dM},{key:"PageUp",run:cM,shift:uM},{key:"PageDown",run:Vb,shift:dM},{key:"Home",run:S6,shift:L6,preventDefault:!0},{key:"Mod-Home",run:pM,shift:hM},{key:"End",run:w6,shift:F6,preventDefault:!0},{key:"Mod-End",run:mM,shift:xM},{key:"Enter",run:gM,shift:gM},{key:"Mod-a",run:z6},{key:"Backspace",run:Gb,shift:Gb,preventDefault:!0},{key:"Delete",run:GM,preventDefault:!0},{key:"Mod-Backspace",mac:"Alt-Backspace",run:QM,preventDefault:!0},{key:"Mod-Delete",mac:"Alt-Delete",run:X6,preventDefault:!0},{mac:"Mod-Backspace",run:W6,preventDefault:!0},{mac:"Mod-Delete",run:K6,preventDefault:!0}].concat(fq.map(t=>({mac:t.key,run:t.run,shift:t.shift}))),JM=[{key:"Alt-ArrowLeft",mac:"Ctrl-ArrowLeft",run:I6,shift:R6},{key:"Alt-ArrowRight",mac:"Ctrl-ArrowRight",run:v6,shift:E6},{key:"Alt-ArrowUp",run:$6},{key:"Shift-Alt-ArrowUp",run:eq},{key:"Alt-ArrowDown",run:Z6},{key:"Shift-Alt-ArrowDown",run:tq},{key:"Mod-Alt-ArrowUp",run:j6},{key:"Mod-Alt-ArrowDown",run:V6},{key:"Escape",run:G6},{key:"Mod-Enter",run:oq},{key:"Alt-l",mac:"Ctrl-l",run:H6},{key:"Mod-i",run:U6,preventDefault:!0},{key:"Mod-[",run:lq},{key:"Mod-]",run:iq},{key:"Mod-Alt-\\",run:aq},{key:"Shift-Mod-k",run:nq},{key:"Shift-Mod-\\",run:D6},{key:"Mod-/",run:e6},{key:"Alt-A",mac:"Ctrl-A",run:n6},{key:"Ctrl-m",mac:"Shift-Alt-m",run:sq}].concat(cq)});function ZM(t){return`'${t.replace(/'/g,"''")}'`}function uq(t){let e=t?.schemas.find(n=>n.name==="main")??t?.schemas[0];return e?e.tables.map(n=>n.name):[]}function eD(t){let e=[{label:"List tables",sql:"SELECT name, type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name;"}],n=uq(t);if(n.length){let r=n.map(o=>`SELECT ${ZM(o)} AS table_name, count(*) AS rows FROM ${To(o,"sqlite")}`);e.push({label:"Row counts",sql:`${r.join(`
UNION ALL
`)}
ORDER BY table_name;`}),e.push({label:"Table columns",sql:`SELECT * FROM pragma_table_info(${ZM(n[0])});`})}return e}var tD=E(()=>{"use strict";Nr()});function nD(t){let e=t.selection.main;if(!e.empty||t.doc.length===0)return W.none;let n=hd(t.doc.toString(),e.head,"sqlite");if(!n||!n.text.trim())return W.none;let r=new Kn,o=t.doc.lineAt(n.from).number,a=t.doc.lineAt(Math.max(n.from,n.to)).number;for(let i=o;i<=a;i++)r.add(t.doc.line(i).from,t.doc.line(i).from,pq);return r.finish()}function hq(t){let e=Jd;e&&(e.dispatch({changes:{from:0,to:e.state.doc.length,insert:t},selection:{anchor:t.length}}),e.focus())}function Kb(t){let e=t.selection.main.head,n=t.doc.lineAt(e);P.getState().setCursor(n.number,e-n.from+1)}function rD(t){return M2({dialect:sf("sqlite"),schema:t?cA(t,"sqlite"):{},upperCaseKeywords:!1})}function vq(t,e){if(!t.length)return null;let n=Math.max(0,Math.min(e,t.length-1)),r=/^[\w$"'`[\].]+/.exec(t.slice(n,n+200));return{from:n,to:Math.min(t.length,n+(r?r[0].length:1))}}function aD(){let t=(0,tn.useRef)(null),e=(0,tn.useRef)(null),n=(0,tn.useRef)(new Fi),r=P(c=>c.activeTabId),o=P(c=>c.tabs.find(d=>d.id===c.activeTabId)?.sql??""),a=P(c=>c.schema),i=P(c=>c.errorAt),l=(0,tn.useRef)({tabId:r,schema:a}),s=(0,tn.useRef)(null);function f(c){let{run:d}=P.getState();return De.create({doc:c,extensions:[Dn.highest(Yi.of([{key:"Mod-Enter",run:()=>(d("current"),!0)},{key:"Mod-Shift-Enter",run:()=>(d("all"),!0)}])),TC(),SC(),vM(),WC(),d2(),Yi.of([...Ty,...JM,...CM]),n.current.of(rD(l.current.schema)),jC(bq),Iq,gq,mq,kC(UA(dq)),U.contentAttributes.of({"aria-label":"SQL editor"}),U.updateListener.of(u=>{u.docChanged&&P.getState().updateTabSql(l.current.tabId,u.state.doc.toString()),(u.docChanged||u.selectionSet)&&Kb(u.state)})]})}return(0,tn.useEffect)(()=>{let c=t.current;if(!c)return;let d=new U({state:f(o),parent:c});return e.current=d,Jd=d,s.current=r,Kb(d.state),sb(()=>{let u=d.state.selection.main;return{from:u.from,to:u.to,head:u.head}}),()=>{sb(null),Jd===d&&(Jd=null),d.destroy(),e.current=null}},[]),(0,tn.useEffect)(()=>{l.current.tabId=r;let c=e.current;c&&(s.current!==r?(s.current=r,c.setState(f(o)),Kb(c.state)):c.state.doc.toString()!==o&&c.dispatch({changes:{from:0,to:c.state.doc.length,insert:o}}))},[r,o]),(0,tn.useEffect)(()=>{l.current.schema=a,e.current?.dispatch({effects:n.current.reconfigure(rD(a))})},[a]),(0,tn.useEffect)(()=>{let c=e.current;if(!c)return;let d=i&&i.tabId===r?vq(c.state.doc.toString(),i.position):null;c.dispatch({effects:oD.of(d)}),d&&c.dispatch({effects:U.scrollIntoView(d.from,{y:"nearest"})})},[i,r]),(0,yl.jsx)("div",{ref:t,className:"xray-sql-editor"})}function iD(){let t=P(r=>!r.tabs.find(o=>o.id===r.activeTabId)?.sql.trim()),e=P(r=>r.schema),n=tn.default.useMemo(()=>eD(e),[e]);return t?(0,yl.jsxs)("div",{className:"xray-sql-quickstarts",role:"group","aria-label":"Quick starts",children:[(0,yl.jsx)("span",{className:"xray-sql-quickstarts-label",children:"Start with"}),n.map(r=>(0,yl.jsx)("button",{type:"button",className:"xray-btn xray-btn-sm",title:r.sql,onClick:()=>hq(r.sql),children:r.label},r.label))]}):null}var tn,yl,dq,pq,mq,Jd,oD,xq,gq,yq,bq,Iq,lD=E(()=>{"use strict";tn=Y(mt());Li();Ys();$M();My();rf();qy();Ta();cf();Qy();tD();vb();yl=Y(Ce()),dq=Ed(typeof navigator>"u"?"":navigator.platform),pq=W.line({class:"xray-sql-active-statement"});mq=ut.define({create:nD,update:(t,e)=>e.docChanged||e.selection?nD(e.state):t,provide:t=>U.decorations.from(t)}),Jd=null;oD=ae.define(),xq=W.mark({class:"xray-sql-error-mark"}),gq=ut.define({create:()=>W.none,update(t,e){let n=e.docChanged?W.none:t;for(let r of e.effects)r.is(oD)&&(n=r.value?W.set([xq.range(r.value.from,r.value.to)]):W.none);return n},provide:t=>U.decorations.from(t)}),yq={"#708":"var(--xray-mauve)","#219":"var(--xray-peach)","#164":"var(--xray-peach)","#a11":"var(--xray-green)","#e40":"var(--xray-yellow)","#00f":"var(--xray-blue)","#30a":"var(--xray-blue)","#085":"var(--xray-teal)","#167":"var(--xray-teal)","#256":"var(--xray-blue)","#00c":"var(--xray-blue)","#940":"var(--xray-hint)","#f00":"var(--xray-red)","#404740":"var(--xray-subtext)"},bq=Zi.define(VC.specs.map(t=>t.color?{...t,color:yq[t.color]??"var(--xray-text)"}:t)),Iq=U.theme({"&":{height:"100%",color:"var(--xray-text)",backgroundColor:"var(--xray-bg)",fontSize:"13px"},"&.cm-focused":{outline:"none"},".cm-scroller":{fontFamily:"var(--xray-font)",lineHeight:"1.55"},".cm-content":{caretColor:"var(--xray-accent)"},".cm-cursor, .cm-dropCursor":{borderLeftColor:"var(--xray-accent)"},"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection":{backgroundColor:"var(--xray-active)"},".cm-activeLine":{backgroundColor:"rgba(var(--xray-text-rgb), .04)"},".cm-gutters":{backgroundColor:"var(--xray-surface)",color:"var(--xray-hint)",border:"none",borderRight:"1px solid var(--xray-border)"},".cm-activeLineGutter":{backgroundColor:"rgba(var(--xray-text-rgb), .06)",color:"var(--xray-subtext)"},".cm-matchingBracket":{backgroundColor:"var(--xray-selection)",outline:"1px solid var(--xray-border-control)"},".cm-tooltip":{backgroundColor:"var(--xray-surface2)",color:"var(--xray-text)",border:"1px solid var(--xray-border)"},".cm-tooltip-autocomplete > ul":{fontFamily:"var(--xray-font)"},".cm-tooltip-autocomplete > ul > li[aria-selected]":{backgroundColor:"var(--xray-active)",color:"var(--xray-text)"},".xray-sql-error-mark":{textDecoration:"underline wavy var(--xray-red)",textUnderlineOffset:"3px"},".cm-placeholder":{color:"var(--xray-hint)",fontStyle:"normal"},".xray-sql-active-statement":{backgroundColor:"color-mix(in srgb, var(--xray-accent) 6%, transparent)",boxShadow:"inset 2px 0 0 color-mix(in srgb, var(--xray-accent) 55%, transparent)"},".xray-sql-active-statement.cm-activeLine":{backgroundColor:"color-mix(in srgb, var(--xray-accent) 9%, transparent)"}})});function fD({readOnly:t}){return(0,D.jsx)("span",{className:`xray-sql-mode-badge ${t?"read-only":"editable"}`,children:t?"Read-only":"Editable"})}function wq(){let t=P(f=>f.connection),e=P(f=>f.readOnlyChoice),n=P(f=>!!f.running||f.opening),r=P(f=>f.setReadOnly),[o,a]=(0,qt.useState)(!1),i=(0,qt.useRef)(null),l=(0,qt.useRef)(null);if((0,qt.useEffect)(()=>{if(!o)return;let f=c=>{i.current?.contains(c.target)||a(!1)};return document.addEventListener("pointerdown",f),()=>document.removeEventListener("pointerdown",f)},[o]),!t)return null;let s=()=>{a(!1),l.current?.focus()};return(0,D.jsxs)("div",{ref:i,className:"xray-sql-source-wrap",onKeyDown:f=>{f.key==="Escape"&&o&&(f.stopPropagation(),s())},children:[(0,D.jsxs)("button",{ref:l,type:"button",className:`xray-sql-source${t.readOnly?"":" editable"}`,"aria-haspopup":"dialog","aria-expanded":o,title:t.name,onClick:()=>a(f=>!f),children:[(0,D.jsx)(cu,{size:15,stroke:1.8,"aria-hidden":"true"}),(0,D.jsx)("span",{className:"xray-sql-source-name",children:t.name})," ",(0,D.jsxs)("span",{className:"xray-sql-source-meta",children:["\xB7 SQLite \xB7 ",HA(t.size)]}),(0,D.jsx)(na,{size:14,stroke:2,"aria-hidden":"true",className:"xray-sql-source-chevron"})]}),(0,D.jsx)(fD,{readOnly:t.readOnly}),o&&(0,D.jsxs)("div",{className:"xray-sql-source-menu",role:"dialog","aria-label":"Database file",children:[(0,D.jsx)(Ab,{className:"xray-menu-item",label:"Open SQLite file\u2026",disabled:n,onPicked:()=>a(!1)}),(0,D.jsx)("div",{className:"xray-menu-sep"}),(0,D.jsxs)("label",{className:"xray-menu-item xray-sql-check",children:[(0,D.jsx)("input",{type:"checkbox",checked:e,disabled:n,onChange:f=>{r(f.target.checked)}}),(0,D.jsx)("span",{children:"Read-only"})]}),(0,D.jsx)("p",{className:"xray-sql-source-note",children:"Turn off Read-only to run writes; Save writes them back to the file."})]})]})}function Sq(){let t=P(c=>c.connection),e=P(c=>c.running),n=P(c=>c.opening),r=P(c=>c.dirty),{run:o,stop:a,save:i}=P.getState(),l=(0,qt.useRef)(null),s=(0,qt.useRef)(!1);return(0,qt.useEffect)(()=>{s.current&&(s.current=!1,l.current?.focus())},[!!e]),(0,D.jsxs)("header",{className:"xray-sql-toolbar",children:[(0,D.jsx)("span",{className:"xray-sql-brand",children:"XRAY SQL"}),(0,D.jsx)(wq,{}),(0,D.jsx)("span",{className:"xray-spacer"}),t&&r&&(0,D.jsxs)("button",{className:"xray-btn primary xray-sql-save",disabled:!!e,onClick:()=>{i()},title:"Write the changes back to the file",children:[(0,D.jsx)("span",{className:"xray-sql-save-dot","aria-hidden":"true"}),(0,D.jsx)(Gh,{...$d,"aria-hidden":"true"}),"Save"]}),t&&(e?(0,D.jsxs)("button",{ref:l,className:"xray-btn danger xray-sql-run",onClick:c=>{s.current=document.activeElement===c.currentTarget,a()},children:[(0,D.jsx)(Jh,{...$d,"aria-hidden":"true"}),"Stop"]}):(0,D.jsxs)("button",{className:"xray-btn primary xray-sql-run",ref:l,disabled:n,"aria-keyshortcuts":sD?"Meta+Enter":"Control+Enter",onClick:c=>{s.current=document.activeElement===c.currentTarget,o("current")},title:`Run the selection or the statement at the cursor (${Yb.run}). ${Yb.runAll} runs all.`,children:[(0,D.jsx)(Yh,{...$d,"aria-hidden":"true"}),"Run",(0,D.jsx)("kbd",{className:"xray-sql-kbd","aria-hidden":"true",children:Yb.run})]}))]})}function kq(){let t=P(r=>r.opening),e=P(r=>r.error),n=P(r=>r.messages[r.messages.length-1]);return(0,D.jsxs)("section",{className:"xray-sql-welcome","aria-labelledby":"xray-sql-welcome-title",children:[(0,D.jsx)(cu,{size:36,stroke:1.4,"aria-hidden":"true",className:"xray-sql-welcome-icon"}),(0,D.jsx)("h1",{id:"xray-sql-welcome-title",children:"Open a SQLite database"}),(0,D.jsx)(Ab,{className:"xray-btn primary xray-sql-welcome-open",disabled:t}),(0,D.jsx)("p",{className:"xray-sql-welcome-drop",children:"or drop a .sqlite / .db file anywhere on this page"}),(0,D.jsx)("p",{className:"xray-sql-welcome-note",children:"Files open read-only. Nothing leaves your machine."}),t&&(0,D.jsx)("p",{className:"xray-sql-welcome-note",role:"status",children:"Opening\u2026"}),!t&&e&&n&&(0,D.jsx)("p",{className:"xray-sql-welcome-error",role:"alert",children:n})]})}function Cq(){let t=P(a=>a.connection),e=P(a=>a.dirty),n=P(a=>a.result),r=P(a=>!!a.running),o=P(a=>a.cursor);return(0,D.jsx)("footer",{className:"xray-sql-status",children:t?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)("span",{className:"xray-sql-status-file",title:t.name,children:t.name}),(0,D.jsx)("span",{className:"xray-sql-status-sep","aria-hidden":"true",children:"\xB7"}),(0,D.jsx)("span",{children:"SQLite"}),(0,D.jsx)(fD,{readOnly:t.readOnly}),e&&(0,D.jsx)("span",{className:"xray-sql-connection-meta",children:"unsaved changes"}),(0,D.jsx)("span",{className:"xray-spacer"}),r?(0,D.jsx)("span",{children:"Running\u2026"}):n&&(0,D.jsx)("span",{children:If(n)}),(r||n)&&(0,D.jsx)("span",{className:"xray-sql-status-sep","aria-hidden":"true",children:"\xB7"}),(0,D.jsxs)("span",{className:"xray-sql-status-cursor",children:["Ln ",o.line,", Col ",o.col]})]}):(0,D.jsx)("span",{children:"No database open"})})}function Aq(){let t=P(o=>o.layout.editorPct),e=P(o=>o.setLayout),n=(0,qt.useRef)(null),r=()=>n.current?.getBoundingClientRect().height??0;return(0,D.jsxs)("div",{ref:n,className:"xray-sql-split",style:{gridTemplateRows:`minmax(0, ${t}fr) auto minmax(0, ${100-t}fr)`},children:[(0,D.jsxs)("div",{className:"xray-sql-editor-wrap",children:[(0,D.jsx)(aD,{}),(0,D.jsx)(iD,{})]}),(0,D.jsx)(Tb,{orientation:"horizontal",label:"Resize editor and results",value:t,min:Jy,max:$y,onStep:o=>e({editorPct:dA(t,o,r())}),onDrag:(o,a)=>{let i=n.current?.getBoundingClientRect();i&&i.height>0&&e({editorPct:(a-i.top)/i.height*100})}}),(0,D.jsx)(sM,{})]})}function Tq(){let t=P(i=>i.tabs),e=P(i=>i.activeTabId),n=P(i=>i.running?.tabId),{setActiveTab:r,addTab:o,closeTab:a}=P.getState();return(0,D.jsxs)("div",{className:"xray-sql-editor-tabs",role:"tablist","aria-label":"Queries",children:[t.map(i=>(0,D.jsxs)("div",{className:`xray-sql-editor-tab${i.id===e?" active":""}`,children:[(0,D.jsx)("button",{role:"tab","aria-selected":i.id===e,className:"xray-sql-editor-tab-name",onClick:()=>r(i.id),title:i.title,children:i.title}),(0,D.jsx)("button",{className:"xray-sql-editor-tab-close","aria-label":`Close ${i.title}`,disabled:n===i.id,onClick:()=>a(i.id),children:(0,D.jsx)(ra,{size:12,stroke:2})})]},i.id)),(0,D.jsx)("button",{className:"xray-icon-btn xray-sql-add-tab","aria-label":"New query tab",title:"New query tab",onClick:o,children:(0,D.jsx)($h,{...$d})})]})}function Mq(t){return t==="could not parse"?"Run a statement that could not be parsed?":`Run ${t}?`}function Dq(){let t=P(l=>l.pendingConfirm),e=P(l=>l.pendingPrompt),{confirmPending:n,cancelPending:r,confirmPrompt:o,cancelPrompt:a}=P.getState(),i=(0,qt.useRef)(null);return t?(0,D.jsx)(kb,{title:Mq(t.reason),icon:(0,D.jsx)(fu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:r,footer:(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)("span",{className:"xray-spacer"}),(0,D.jsx)("button",{ref:i,className:"xray-btn",onClick:r,children:"Cancel"}),(0,D.jsx)("button",{className:"xray-btn danger",onClick:()=>{n()},children:"Run anyway"})]}),children:(0,D.jsx)("div",{className:"xray-modal-body",children:(0,D.jsx)("pre",{className:"xray-sql-confirm-sql",children:t.sql})})}):e?(0,D.jsx)(kb,{title:e.title,icon:(0,D.jsx)(fu,{size:17,stroke:1.8}),className:"xray-confirm-modal",initialFocusRef:i,onClose:a,footer:(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)("span",{className:"xray-spacer"}),(0,D.jsx)("button",{ref:i,className:"xray-btn",onClick:a,children:"Cancel"}),(0,D.jsx)("button",{className:"xray-btn danger",onClick:()=>{o()},children:e.confirmLabel})]}),children:(0,D.jsx)("div",{className:"xray-modal-body",children:(0,D.jsx)("p",{className:"xray-confirm-message",children:e.message})})}):null}function cD({settings:t}){let e=P(s=>s.dirty),n=P(s=>!!s.connection),r=P(s=>s.layout.railPx),o=P(s=>s.setLayout),a=(0,qt.useRef)(null);(0,qt.useEffect)(()=>{if(!e)return;let s=f=>f.preventDefault();return window.addEventListener("beforeunload",s),()=>window.removeEventListener("beforeunload",s)},[e]);let i=_A(t),l={...i?{"--xray-accent":i}:{},"--xray-font":PA[t.font],"--xray-radius":`${t.radius}px`,...t.theme==="custom"?FA(t.customTheme):{}};return(0,D.jsxs)("div",{className:`xray-theme-scope xray-theme-${t.theme} xray-font-${t.font}`,style:l,children:[(0,D.jsxs)("div",{className:"xray-sql-app",children:[(0,D.jsx)(Sq,{}),(0,D.jsxs)("div",{ref:a,className:"xray-sql-body",style:{gridTemplateColumns:`${r}px auto minmax(0, 1fr)`},children:[(0,D.jsx)(KA,{}),(0,D.jsx)(Tb,{orientation:"vertical",label:"Resize schema rail",value:r,min:Zy,max:eb,onStep:s=>o({railPx:r+s}),onDrag:s=>{let f=a.current?.getBoundingClientRect().left??0;o({railPx:s-f})}}),(0,D.jsx)("main",{className:"xray-sql-main","aria-label":"SQL workspace",children:n?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(Tq,{}),(0,D.jsx)(Aq,{})]}):(0,D.jsx)(kq,{})})]}),(0,D.jsx)(Cq,{})]}),(0,D.jsx)(JA,{}),(0,D.jsx)(Dq,{})]})}var qt,D,$d,sD,Yb,uD=E(()=>{"use strict";qt=Y(mt());kr();Ta();Rd();mb();Cd();vb();WA();YA();$A();eT();fM();lD();D=Y(Ce()),$d={size:16,stroke:1.8},sD=Ed(typeof navigator>"u"?"":navigator.platform),Yb=Ib(sD)});function Bq(t){return Array.isArray(t)?t.filter(n=>n&&typeof n.id=="string"&&typeof n.code=="string").slice(0,30).map(n=>({id:n.id,title:n.title,code:n.code})):void 0}function pD(t){let e=Bq(t.snippets);return{...t.activeTab&&Oq.includes(t.activeTab)?{activeTab:t.activeTab}:{},...t.detailView?{detailView:t.detailView}:{},...t.detailTab?{detailTab:t.detailTab}:{},...t.consoleMiniTab?{consoleMiniTab:t.consoleMiniTab}:{},...t.networkFilter?{networkFilter:t.networkFilter}:{},...typeof t.apiSearchQuery=="string"?{apiSearchQuery:t.apiSearchQuery}:{},...t.apiQuickFilter?{apiQuickFilter:t.apiQuickFilter}:{},...t.apiGroupingMode?{apiGroupingMode:t.apiGroupingMode}:{},...typeof t.apiDetailOpen=="boolean"?{apiDetailOpen:t.apiDetailOpen}:{},...t.apiDrawerPlacement?{apiDrawerPlacement:t.apiDrawerPlacement}:{},...Array.isArray(t.methodFilters)?{methodFilters:new Set(t.methodFilters)}:{},...Array.isArray(t.statusFilters)?{statusFilters:new Set(t.statusFilters)}:{},...Array.isArray(t.typeFilters)?{typeFilters:new Set(t.typeFilters)}:{},...Array.isArray(t.expandedGroups)?{expandedGroups:new Set(t.expandedGroups)}:{},...Array.isArray(t.collapsedSections)?{collapsedSections:new Set(t.collapsedSections)}:{},...t.sortField?{sortField:t.sortField}:{},...t.sortOrder?{sortOrder:t.sortOrder}:{},...typeof t.recording=="boolean"?{recording:t.recording}:{},...Array.isArray(t.pinnedIds)?{pinnedIds:new Set(t.pinnedIds)}:{},...e?{snippets:e}:{},...t.settings?{settings:zA(t.settings)}:{}}}var dD,Oq,mD=E(()=>{"use strict";Rd();dD="react_panel_preferences",Oq=["console","api","logs","rules","insights","sql"]});function xD(t,e){return e||t.every(n=>Rq.test(n))}var hD,Rq,gD=E(()=>{"use strict";hD="xray:sql-frame-ready",Rq=/^(chrome-extension|devtools):\/\//});function yD({label:t,hint:e,icon:n,action:r}){return(0,Fo.jsxs)("div",{className:"xray-empty",role:"status",children:[(0,Fo.jsx)("span",{className:"xray-empty-glyph",children:n||(0,Fo.jsx)(Zh,{size:26,stroke:1.5})}),(0,Fo.jsx)("p",{className:"xray-empty-title",children:t}),e&&(0,Fo.jsx)("p",{className:"xray-empty-hint",children:e}),r&&(0,Fo.jsx)("div",{className:"xray-empty-action",children:r})]})}var Fo,bD=E(()=>{"use strict";kr();Fo=Y(Ce())});var ID,vD=E(()=>{ID=`:host,
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
`});var wD,SD=E(()=>{wD=`* {
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
`});var kD,CD=E(()=>{kD=`/* SQL page (sql.html). The theme scope is display:contents, so the app sizes itself to the
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

/* Dividers: a 1 px rule with a wider hit area; neutral on hover, the focus colour on keyboard focus. */
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
  background: var(--xray-border-control);
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

.xray-sql-status .xray-sql-mode-badge {
  height: 16px;
  font-size: 9.5px;
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

.xray-sql-grid-row:hover {
  background: rgba(var(--xray-text-rgb), .03);
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
`});var Fq=Cn(()=>{var Jb=Y(Uw());uD();Ta();Xy();mD();Rd();gD();bD();vD();SD();CD();var $b=Y(Ce()),Zd=document.getElementById("xray-sql-root");async function Eq(){try{let t=await sl(dD,{});return pD(t??{}).settings??et}catch{return et}}Zd&&(async()=>{let t=document.createElement("style");t.setAttribute("data-xray-sql-ui","1"),t.textContent=`${ID.replace(/:host/g,"#xray-sql-root")}
${wD}
${kD}`,document.head.appendChild(t),Zd.className="xray-app-root";let e=await Eq();if(!xD(Array.from(location.ancestorOrigins??[]),e.sqlInlineInHud)){(0,Jb.createRoot)(Zd).render((0,$b.jsx)(yD,{label:"The SQL client is not enabled for this page."}));return}await fb(),window.addEventListener("pagehide",cb),(0,Jb.createRoot)(Zd).render((0,$b.jsx)(cD,{settings:e})),window.parent!==window&&chrome?.runtime?.sendMessage?.({type:hD},()=>{chrome?.runtime?.lastError})})()});return Fq();})();
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
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerStop.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconRadar2.mjs:
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
