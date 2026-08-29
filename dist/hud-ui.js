"use strict";var XRAYHudUI=(()=>{var j1=Object.create;var ym=Object.defineProperty;var V1=Object.getOwnPropertyDescriptor;var Y1=Object.getOwnPropertyNames;var Q1=Object.getPrototypeOf,K1=Object.prototype.hasOwnProperty;var E=(e,t,a)=>()=>{if(a)throw a[0];try{return e&&(t=e(e=0)),t}catch(o){throw a=[o],o}};var da=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var Z1=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Y1(t))!K1.call(e,r)&&r!==a&&ym(e,r,{get:()=>t[r],enumerable:!(o=V1(t,r))||o.enumerable});return e};var H=(e,t,a)=>(a=e!=null?j1(Q1(e)):{},Z1(t||!e||!e.__esModule?ym(a,"default",{value:e,enumerable:!0}):a,e));var Am=da(Ae=>{"use strict";function oc(e,t){var a=e.length;e.push(t);e:for(;0<a;){var o=a-1>>>1,r=e[o];if(0<ks(r,t))e[o]=t,e[a]=r,a=o;else break e}}function Sa(e){return e.length===0?null:e[0]}function Rs(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var o=0,r=e.length,n=r>>>1;o<n;){var l=2*(o+1)-1,s=e[l],i=l+1,f=e[i];if(0>ks(s,a))i<r&&0>ks(f,s)?(e[o]=f,e[i]=a,o=i):(e[o]=s,e[l]=a,o=l);else if(i<r&&0>ks(f,a))e[o]=f,e[i]=a,o=i;else break e}}return t}function ks(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Ae.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(gm=performance,Ae.unstable_now=function(){return gm.now()}):(ec=Date,hm=ec.now(),Ae.unstable_now=function(){return ec.now()-hm});var gm,ec,hm,Oa=[],po=[],W1=1,Zt=null,xt=3,rc=!1,Kn=!1,Zn=!1,nc=!1,vm=typeof setTimeout=="function"?setTimeout:null,Sm=typeof clearTimeout=="function"?clearTimeout:null,Im=typeof setImmediate<"u"?setImmediate:null;function As(e){for(var t=Sa(po);t!==null;){if(t.callback===null)Rs(po);else if(t.startTime<=e)Rs(po),t.sortIndex=t.expirationTime,oc(Oa,t);else break;t=Sa(po)}}function lc(e){if(Zn=!1,As(e),!Kn)if(Sa(Oa)!==null)Kn=!0,zr||(zr=!0,Lr());else{var t=Sa(po);t!==null&&sc(lc,t.startTime-e)}}var zr=!1,Wn=-1,wm=5,Cm=-1;function km(){return nc?!0:!(Ae.unstable_now()-Cm<wm)}function tc(){if(nc=!1,zr){var e=Ae.unstable_now();Cm=e;var t=!0;try{e:{Kn=!1,Zn&&(Zn=!1,Sm(Wn),Wn=-1),rc=!0;var a=xt;try{t:{for(As(e),Zt=Sa(Oa);Zt!==null&&!(Zt.expirationTime>e&&km());){var o=Zt.callback;if(typeof o=="function"){Zt.callback=null,xt=Zt.priorityLevel;var r=o(Zt.expirationTime<=e);if(e=Ae.unstable_now(),typeof r=="function"){Zt.callback=r,As(e),t=!0;break t}Zt===Sa(Oa)&&Rs(Oa),As(e)}else Rs(Oa);Zt=Sa(Oa)}if(Zt!==null)t=!0;else{var n=Sa(po);n!==null&&sc(lc,n.startTime-e),t=!1}}break e}finally{Zt=null,xt=a,rc=!1}t=void 0}}finally{t?Lr():zr=!1}}}var Lr;typeof Im=="function"?Lr=function(){Im(tc)}:typeof MessageChannel<"u"?(ac=new MessageChannel,bm=ac.port2,ac.port1.onmessage=tc,Lr=function(){bm.postMessage(null)}):Lr=function(){vm(tc,0)};var ac,bm;function sc(e,t){Wn=vm(function(){e(Ae.unstable_now())},t)}Ae.unstable_IdlePriority=5;Ae.unstable_ImmediatePriority=1;Ae.unstable_LowPriority=4;Ae.unstable_NormalPriority=3;Ae.unstable_Profiling=null;Ae.unstable_UserBlockingPriority=2;Ae.unstable_cancelCallback=function(e){e.callback=null};Ae.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):wm=0<e?Math.floor(1e3/e):5};Ae.unstable_getCurrentPriorityLevel=function(){return xt};Ae.unstable_next=function(e){switch(xt){case 1:case 2:case 3:var t=3;break;default:t=xt}var a=xt;xt=t;try{return e()}finally{xt=a}};Ae.unstable_requestPaint=function(){nc=!0};Ae.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=xt;xt=e;try{return t()}finally{xt=a}};Ae.unstable_scheduleCallback=function(e,t,a){var o=Ae.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?o+a:o):a=o,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:W1++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>o?(e.sortIndex=a,oc(po,e),Sa(Oa)===null&&e===Sa(po)&&(Zn?(Sm(Wn),Wn=-1):Zn=!0,sc(lc,a-o))):(e.sortIndex=r,oc(Oa,e),Kn||rc||(Kn=!0,zr||(zr=!0,Lr()))),e};Ae.unstable_shouldYield=km;Ae.unstable_wrapCallback=function(e){var t=xt;return function(){var a=xt;xt=t;try{return e.apply(this,arguments)}finally{xt=a}}}});var Mm=da((hM,Rm)=>{"use strict";Rm.exports=Am()});var _m=da(V=>{"use strict";var cc=Symbol.for("react.transitional.element"),$1=Symbol.for("react.portal"),J1=Symbol.for("react.fragment"),eS=Symbol.for("react.strict_mode"),tS=Symbol.for("react.profiler"),aS=Symbol.for("react.consumer"),oS=Symbol.for("react.context"),rS=Symbol.for("react.forward_ref"),nS=Symbol.for("react.suspense"),lS=Symbol.for("react.memo"),Nm=Symbol.for("react.lazy"),sS=Symbol.for("react.activity"),Tm=Symbol.iterator;function iS(e){return e===null||typeof e!="object"?null:(e=Tm&&e[Tm]||e["@@iterator"],typeof e=="function"?e:null)}var Bm={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Om=Object.assign,Lm={};function _r(e,t,a){this.props=e,this.context=t,this.refs=Lm,this.updater=a||Bm}_r.prototype.isReactComponent={};_r.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};_r.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function zm(){}zm.prototype=_r.prototype;function uc(e,t,a){this.props=e,this.context=t,this.refs=Lm,this.updater=a||Bm}var dc=uc.prototype=new zm;dc.constructor=uc;Om(dc,_r.prototype);dc.isPureReactComponent=!0;var Em=Array.isArray;function fc(){}var ve={H:null,A:null,T:null,S:null},Hm=Object.prototype.hasOwnProperty;function pc(e,t,a){var o=a.ref;return{$$typeof:cc,type:e,key:t,ref:o!==void 0?o:null,props:a}}function fS(e,t){return pc(e.type,t,e.props)}function mc(e){return typeof e=="object"&&e!==null&&e.$$typeof===cc}function cS(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Dm=/\/+/g;function ic(e,t){return typeof e=="object"&&e!==null&&e.key!=null?cS(""+e.key):t.toString(36)}function uS(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(fc,fc):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Hr(e,t,a,o,r){var n=typeof e;(n==="undefined"||n==="boolean")&&(e=null);var l=!1;if(e===null)l=!0;else switch(n){case"bigint":case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case cc:case $1:l=!0;break;case Nm:return l=e._init,Hr(l(e._payload),t,a,o,r)}}if(l)return r=r(e),l=o===""?"."+ic(e,0):o,Em(r)?(a="",l!=null&&(a=l.replace(Dm,"$&/")+"/"),Hr(r,t,a,"",function(f){return f})):r!=null&&(mc(r)&&(r=fS(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(Dm,"$&/")+"/")+l)),t.push(r)),1;l=0;var s=o===""?".":o+":";if(Em(e))for(var i=0;i<e.length;i++)o=e[i],n=s+ic(o,i),l+=Hr(o,t,a,n,r);else if(i=iS(e),typeof i=="function")for(e=i.call(e),i=0;!(o=e.next()).done;)o=o.value,n=s+ic(o,i++),l+=Hr(o,t,a,n,r);else if(n==="object"){if(typeof e.then=="function")return Hr(uS(e),t,a,o,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return l}function Ms(e,t,a){if(e==null)return e;var o=[],r=0;return Hr(e,o,"","",function(n){return t.call(a,n,r++)}),o}function dS(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(a){(e._status===0||e._status===-1)&&(e._status=1,e._result=a)},function(a){(e._status===0||e._status===-1)&&(e._status=2,e._result=a)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var Fm=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},pS={map:Ms,forEach:function(e,t,a){Ms(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Ms(e,function(){t++}),t},toArray:function(e){return Ms(e,function(t){return t})||[]},only:function(e){if(!mc(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};V.Activity=sS;V.Children=pS;V.Component=_r;V.Fragment=J1;V.Profiler=tS;V.PureComponent=uc;V.StrictMode=eS;V.Suspense=nS;V.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ve;V.__COMPILER_RUNTIME={__proto__:null,c:function(e){return ve.H.useMemoCache(e)}};V.cache=function(e){return function(){return e.apply(null,arguments)}};V.cacheSignal=function(){return null};V.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var o=Om({},e.props),r=e.key;if(t!=null)for(n in t.key!==void 0&&(r=""+t.key),t)!Hm.call(t,n)||n==="key"||n==="__self"||n==="__source"||n==="ref"&&t.ref===void 0||(o[n]=t[n]);var n=arguments.length-2;if(n===1)o.children=a;else if(1<n){for(var l=Array(n),s=0;s<n;s++)l[s]=arguments[s+2];o.children=l}return pc(e.type,r,o)};V.createContext=function(e){return e={$$typeof:oS,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:aS,_context:e},e};V.createElement=function(e,t,a){var o,r={},n=null;if(t!=null)for(o in t.key!==void 0&&(n=""+t.key),t)Hm.call(t,o)&&o!=="key"&&o!=="__self"&&o!=="__source"&&(r[o]=t[o]);var l=arguments.length-2;if(l===1)r.children=a;else if(1<l){for(var s=Array(l),i=0;i<l;i++)s[i]=arguments[i+2];r.children=s}if(e&&e.defaultProps)for(o in l=e.defaultProps,l)r[o]===void 0&&(r[o]=l[o]);return pc(e,n,r)};V.createRef=function(){return{current:null}};V.forwardRef=function(e){return{$$typeof:rS,render:e}};V.isValidElement=mc;V.lazy=function(e){return{$$typeof:Nm,_payload:{_status:-1,_result:e},_init:dS}};V.memo=function(e,t){return{$$typeof:lS,type:e,compare:t===void 0?null:t}};V.startTransition=function(e){var t=ve.T,a={};ve.T=a;try{var o=e(),r=ve.S;r!==null&&r(a,o),typeof o=="object"&&o!==null&&typeof o.then=="function"&&o.then(fc,Fm)}catch(n){Fm(n)}finally{t!==null&&a.types!==null&&(t.types=a.types),ve.T=t}};V.unstable_useCacheRefresh=function(){return ve.H.useCacheRefresh()};V.use=function(e){return ve.H.use(e)};V.useActionState=function(e,t,a){return ve.H.useActionState(e,t,a)};V.useCallback=function(e,t){return ve.H.useCallback(e,t)};V.useContext=function(e){return ve.H.useContext(e)};V.useDebugValue=function(){};V.useDeferredValue=function(e,t){return ve.H.useDeferredValue(e,t)};V.useEffect=function(e,t){return ve.H.useEffect(e,t)};V.useEffectEvent=function(e){return ve.H.useEffectEvent(e)};V.useId=function(){return ve.H.useId()};V.useImperativeHandle=function(e,t,a){return ve.H.useImperativeHandle(e,t,a)};V.useInsertionEffect=function(e,t){return ve.H.useInsertionEffect(e,t)};V.useLayoutEffect=function(e,t){return ve.H.useLayoutEffect(e,t)};V.useMemo=function(e,t){return ve.H.useMemo(e,t)};V.useOptimistic=function(e,t){return ve.H.useOptimistic(e,t)};V.useReducer=function(e,t,a){return ve.H.useReducer(e,t,a)};V.useRef=function(e){return ve.H.useRef(e)};V.useState=function(e){return ve.H.useState(e)};V.useSyncExternalStore=function(e,t,a){return ve.H.useSyncExternalStore(e,t,a)};V.useTransition=function(){return ve.H.useTransition()};V.version="19.2.6"});var ze=da((bM,Pm)=>{"use strict";Pm.exports=_m()});var Um=da(It=>{"use strict";var mS=ze();function qm(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function mo(){}var ht={d:{f:mo,r:function(){throw Error(qm(522))},D:mo,C:mo,L:mo,m:mo,X:mo,S:mo,M:mo},p:0,findDOMNode:null},xS=Symbol.for("react.portal");function yS(e,t,a){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:xS,key:o==null?null:""+o,children:e,containerInfo:t,implementation:a}}var $n=mS.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ts(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}It.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ht;It.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(qm(299));return yS(e,t,null,a)};It.flushSync=function(e){var t=$n.T,a=ht.p;try{if($n.T=null,ht.p=2,e)return e()}finally{$n.T=t,ht.p=a,ht.d.f()}};It.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,ht.d.C(e,t))};It.prefetchDNS=function(e){typeof e=="string"&&ht.d.D(e)};It.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,o=Ts(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,n=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?ht.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:o,integrity:r,fetchPriority:n}):a==="script"&&ht.d.X(e,{crossOrigin:o,integrity:r,fetchPriority:n,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};It.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Ts(t.as,t.crossOrigin);ht.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&ht.d.M(e)};It.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,o=Ts(a,t.crossOrigin);ht.d.L(e,a,{crossOrigin:o,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};It.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Ts(t.as,t.crossOrigin);ht.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else ht.d.m(e)};It.requestFormReset=function(e){ht.d.r(e)};It.unstable_batchedUpdates=function(e,t){return e(t)};It.useFormState=function(e,t,a){return $n.H.useFormState(e,t,a)};It.useFormStatus=function(){return $n.H.useHostTransitionStatus()};It.version="19.2.6"});var xc=da((SM,Gm)=>{"use strict";function Xm(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Xm)}catch(e){console.error(e)}}Xm(),Gm.exports=Um()});var aI=da(ef=>{"use strict";var Ke=Mm(),yy=ze(),gS=xc();function F(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function gy(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Hl(e){var t=e,a=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(a=t.return),e=t.return;while(e)}return t.tag===3?a:null}function hy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Iy(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function jm(e){if(Hl(e)!==e)throw Error(F(188))}function hS(e){var t=e.alternate;if(!t){if(t=Hl(e),t===null)throw Error(F(188));return t!==e?null:e}for(var a=e,o=t;;){var r=a.return;if(r===null)break;var n=r.alternate;if(n===null){if(o=r.return,o!==null){a=o;continue}break}if(r.child===n.child){for(n=r.child;n;){if(n===a)return jm(r),e;if(n===o)return jm(r),t;n=n.sibling}throw Error(F(188))}if(a.return!==o.return)a=r,o=n;else{for(var l=!1,s=r.child;s;){if(s===a){l=!0,a=r,o=n;break}if(s===o){l=!0,o=r,a=n;break}s=s.sibling}if(!l){for(s=n.child;s;){if(s===a){l=!0,a=n,o=r;break}if(s===o){l=!0,o=n,a=r;break}s=s.sibling}if(!l)throw Error(F(189))}}if(a.alternate!==o)throw Error(F(190))}if(a.tag!==3)throw Error(F(188));return a.stateNode.current===a?e:t}function by(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=by(e),t!==null)return t;e=e.sibling}return null}var Ce=Object.assign,IS=Symbol.for("react.element"),Es=Symbol.for("react.transitional.element"),ll=Symbol.for("react.portal"),jr=Symbol.for("react.fragment"),vy=Symbol.for("react.strict_mode"),Kc=Symbol.for("react.profiler"),Sy=Symbol.for("react.consumer"),Xa=Symbol.for("react.context"),Gu=Symbol.for("react.forward_ref"),Zc=Symbol.for("react.suspense"),Wc=Symbol.for("react.suspense_list"),ju=Symbol.for("react.memo"),xo=Symbol.for("react.lazy"),$c=Symbol.for("react.activity"),bS=Symbol.for("react.memo_cache_sentinel"),Vm=Symbol.iterator;function Jn(e){return e===null||typeof e!="object"?null:(e=Vm&&e[Vm]||e["@@iterator"],typeof e=="function"?e:null)}var vS=Symbol.for("react.client.reference");function Jc(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===vS?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case jr:return"Fragment";case Kc:return"Profiler";case vy:return"StrictMode";case Zc:return"Suspense";case Wc:return"SuspenseList";case $c:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case ll:return"Portal";case Xa:return e.displayName||"Context";case Sy:return(e._context.displayName||"Context")+".Consumer";case Gu:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case ju:return t=e.displayName||null,t!==null?t:Jc(e.type)||"Memo";case xo:t=e._payload,e=e._init;try{return Jc(e(t))}catch{}}return null}var sl=Array.isArray,j=yy.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,fe=gS.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,rr={pending:!1,data:null,method:null,action:null},eu=[],Vr=-1;function Ra(e){return{current:e}}function at(e){0>Vr||(e.current=eu[Vr],eu[Vr]=null,Vr--)}function he(e,t){Vr++,eu[Vr]=e.current,e.current=t}var Aa=Ra(null),Cl=Ra(null),Ao=Ra(null),fi=Ra(null);function ci(e,t){switch(he(Ao,t),he(Cl,e),he(Aa,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Jx(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Jx(t),e=Uh(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}at(Aa),he(Aa,e)}function un(){at(Aa),at(Cl),at(Ao)}function tu(e){e.memoizedState!==null&&he(fi,e);var t=Aa.current,a=Uh(t,e.type);t!==a&&(he(Cl,e),he(Aa,a))}function ui(e){Cl.current===e&&(at(Aa),at(Cl)),fi.current===e&&(at(fi),Ol._currentValue=rr)}var yc,Ym;function er(e){if(yc===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);yc=t&&t[1]||"",Ym=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+yc+e+Ym}var gc=!1;function hc(e,t){if(!e||gc)return"";gc=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var o={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(p){var d=p}Reflect.construct(e,[],x)}else{try{x.call()}catch(p){d=p}e.call(x.prototype)}}else{try{throw Error()}catch(p){d=p}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(p){if(p&&d&&typeof p.stack=="string")return[p.stack,d.stack]}return[null,null]}};o.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(o.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var n=o.DetermineComponentFrameRoot(),l=n[0],s=n[1];if(l&&s){var i=l.split(`
`),f=s.split(`
`);for(r=o=0;o<i.length&&!i[o].includes("DetermineComponentFrameRoot");)o++;for(;r<f.length&&!f[r].includes("DetermineComponentFrameRoot");)r++;if(o===i.length||r===f.length)for(o=i.length-1,r=f.length-1;1<=o&&0<=r&&i[o]!==f[r];)r--;for(;1<=o&&0<=r;o--,r--)if(i[o]!==f[r]){if(o!==1||r!==1)do if(o--,r--,0>r||i[o]!==f[r]){var u=`
`+i[o].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=o&&0<=r);break}}}finally{gc=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?er(a):""}function SS(e,t){switch(e.tag){case 26:case 27:case 5:return er(e.type);case 16:return er("Lazy");case 13:return e.child!==t&&t!==null?er("Suspense Fallback"):er("Suspense");case 19:return er("SuspenseList");case 0:case 15:return hc(e.type,!1);case 11:return hc(e.type.render,!1);case 1:return hc(e.type,!0);case 31:return er("Activity");default:return""}}function Qm(e){try{var t="",a=null;do t+=SS(e,a),a=e,e=e.return;while(e);return t}catch(o){return`
Error generating stack: `+o.message+`
`+o.stack}}var au=Object.prototype.hasOwnProperty,Vu=Ke.unstable_scheduleCallback,Ic=Ke.unstable_cancelCallback,wS=Ke.unstable_shouldYield,CS=Ke.unstable_requestPaint,_t=Ke.unstable_now,kS=Ke.unstable_getCurrentPriorityLevel,wy=Ke.unstable_ImmediatePriority,Cy=Ke.unstable_UserBlockingPriority,di=Ke.unstable_NormalPriority,AS=Ke.unstable_LowPriority,ky=Ke.unstable_IdlePriority,RS=Ke.log,MS=Ke.unstable_setDisableYieldValue,_l=null,Pt=null;function vo(e){if(typeof RS=="function"&&MS(e),Pt&&typeof Pt.setStrictMode=="function")try{Pt.setStrictMode(_l,e)}catch{}}var qt=Math.clz32?Math.clz32:DS,TS=Math.log,ES=Math.LN2;function DS(e){return e>>>=0,e===0?32:31-(TS(e)/ES|0)|0}var Ds=256,Fs=262144,Ns=4194304;function tr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Hi(e,t,a){var o=e.pendingLanes;if(o===0)return 0;var r=0,n=e.suspendedLanes,l=e.pingedLanes;e=e.warmLanes;var s=o&134217727;return s!==0?(o=s&~n,o!==0?r=tr(o):(l&=s,l!==0?r=tr(l):a||(a=s&~e,a!==0&&(r=tr(a))))):(s=o&~n,s!==0?r=tr(s):l!==0?r=tr(l):a||(a=o&~e,a!==0&&(r=tr(a)))),r===0?0:t!==0&&t!==r&&(t&n)===0&&(n=r&-r,a=t&-t,n>=a||n===32&&(a&4194048)!==0)?t:r}function Pl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function FS(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ay(){var e=Ns;return Ns<<=1,(Ns&62914560)===0&&(Ns=4194304),e}function bc(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function ql(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function NS(e,t,a,o,r,n){var l=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var s=e.entanglements,i=e.expirationTimes,f=e.hiddenUpdates;for(a=l&~a;0<a;){var u=31-qt(a),x=1<<u;s[u]=0,i[u]=-1;var d=f[u];if(d!==null)for(f[u]=null,u=0;u<d.length;u++){var p=d[u];p!==null&&(p.lane&=-536870913)}a&=~x}o!==0&&Ry(e,o,0),n!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=n&~(l&~t))}function Ry(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var o=31-qt(t);e.entangledLanes|=t,e.entanglements[o]=e.entanglements[o]|1073741824|a&261930}function My(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var o=31-qt(a),r=1<<o;r&t|e[o]&t&&(e[o]|=t),a&=~r}}function Ty(e,t){var a=t&-t;return a=(a&42)!==0?1:Yu(a),(a&(e.suspendedLanes|t))!==0?0:a}function Yu(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Qu(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Ey(){var e=fe.p;return e!==0?e:(e=window.event,e===void 0?32:Jh(e.type))}function Km(e,t){var a=fe.p;try{return fe.p=e,t()}finally{fe.p=a}}var _o=Math.random().toString(36).slice(2),it="__reactFiber$"+_o,Rt="__reactProps$"+_o,Sn="__reactContainer$"+_o,ou="__reactEvents$"+_o,BS="__reactListeners$"+_o,OS="__reactHandles$"+_o,Zm="__reactResources$"+_o,Ul="__reactMarker$"+_o;function Ku(e){delete e[it],delete e[Rt],delete e[ou],delete e[BS],delete e[OS]}function Yr(e){var t=e[it];if(t)return t;for(var a=e.parentNode;a;){if(t=a[Sn]||a[it]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=ry(e);e!==null;){if(a=e[it])return a;e=ry(e)}return t}e=a,a=e.parentNode}return null}function wn(e){if(e=e[it]||e[Sn]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function il(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(F(33))}function on(e){var t=e[Zm];return t||(t=e[Zm]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function tt(e){e[Ul]=!0}var Dy=new Set,Fy={};function mr(e,t){dn(e,t),dn(e+"Capture",t)}function dn(e,t){for(Fy[e]=t,e=0;e<t.length;e++)Dy.add(t[e])}var LS=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Wm={},$m={};function zS(e){return au.call($m,e)?!0:au.call(Wm,e)?!1:LS.test(e)?$m[e]=!0:(Wm[e]=!0,!1)}function Qs(e,t,a){if(zS(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var o=t.toLowerCase().slice(0,5);if(o!=="data-"&&o!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+a)}}function Bs(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+a)}}function La(e,t,a,o){if(o===null)e.removeAttribute(a);else{switch(typeof o){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,""+o)}}function $t(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Ny(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function HS(e,t,a){var o=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var r=o.get,n=o.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(l){a=""+l,n.call(this,l)}}),Object.defineProperty(e,t,{enumerable:o.enumerable}),{getValue:function(){return a},setValue:function(l){a=""+l},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function ru(e){if(!e._valueTracker){var t=Ny(e)?"checked":"value";e._valueTracker=HS(e,t,""+e[t])}}function By(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),o="";return e&&(o=Ny(e)?e.checked?"true":"false":e.value),e=o,e!==a?(t.setValue(e),!0):!1}function pi(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var _S=/[\n"\\]/g;function ta(e){return e.replace(_S,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function nu(e,t,a,o,r,n,l,s){e.name="",l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?e.type=l:e.removeAttribute("type"),t!=null?l==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+$t(t)):e.value!==""+$t(t)&&(e.value=""+$t(t)):l!=="submit"&&l!=="reset"||e.removeAttribute("value"),t!=null?lu(e,l,$t(t)):a!=null?lu(e,l,$t(a)):o!=null&&e.removeAttribute("value"),r==null&&n!=null&&(e.defaultChecked=!!n),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.name=""+$t(s):e.removeAttribute("name")}function Oy(e,t,a,o,r,n,l,s){if(n!=null&&typeof n!="function"&&typeof n!="symbol"&&typeof n!="boolean"&&(e.type=n),t!=null||a!=null){if(!(n!=="submit"&&n!=="reset"||t!=null)){ru(e);return}a=a!=null?""+$t(a):"",t=t!=null?""+$t(t):a,s||t===e.value||(e.value=t),e.defaultValue=t}o=o??r,o=typeof o!="function"&&typeof o!="symbol"&&!!o,e.checked=s?e.checked:!!o,e.defaultChecked=!!o,l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.name=l),ru(e)}function lu(e,t,a){t==="number"&&pi(e.ownerDocument)===e||e.defaultValue===""+a||(e.defaultValue=""+a)}function rn(e,t,a,o){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&o&&(e[a].defaultSelected=!0)}else{for(a=""+$t(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,o&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Ly(e,t,a){if(t!=null&&(t=""+$t(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+$t(a):""}function zy(e,t,a,o){if(t==null){if(o!=null){if(a!=null)throw Error(F(92));if(sl(o)){if(1<o.length)throw Error(F(93));o=o[0]}a=o}a==null&&(a=""),t=a}a=$t(t),e.defaultValue=a,o=e.textContent,o===a&&o!==""&&o!==null&&(e.value=o),ru(e)}function pn(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var PS=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Jm(e,t,a){var o=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?o?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":o?e.setProperty(t,a):typeof a!="number"||a===0||PS.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Hy(e,t,a){if(t!=null&&typeof t!="object")throw Error(F(62));if(e=e.style,a!=null){for(var o in a)!a.hasOwnProperty(o)||t!=null&&t.hasOwnProperty(o)||(o.indexOf("--")===0?e.setProperty(o,""):o==="float"?e.cssFloat="":e[o]="");for(var r in t)o=t[r],t.hasOwnProperty(r)&&a[r]!==o&&Jm(e,r,o)}else for(var n in t)t.hasOwnProperty(n)&&Jm(e,n,t[n])}function Zu(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var qS=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),US=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Ks(e){return US.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Ga(){}var su=null;function Wu(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Qr=null,nn=null;function ex(e){var t=wn(e);if(t&&(e=t.stateNode)){var a=e[Rt]||null;e:switch(e=t.stateNode,t.type){case"input":if(nu(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+ta(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var o=a[t];if(o!==e&&o.form===e.form){var r=o[Rt]||null;if(!r)throw Error(F(90));nu(o,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)o=a[t],o.form===e.form&&By(o)}break e;case"textarea":Ly(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&rn(e,!!a.multiple,t,!1)}}}var vc=!1;function _y(e,t,a){if(vc)return e(t,a);vc=!0;try{var o=e(t);return o}finally{if(vc=!1,(Qr!==null||nn!==null)&&(Zi(),Qr&&(t=Qr,e=nn,nn=Qr=null,ex(t),e)))for(t=0;t<e.length;t++)ex(e[t])}}function kl(e,t){var a=e.stateNode;if(a===null)return null;var o=a[Rt]||null;if(o===null)return null;a=o[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(F(231,t,typeof a));return a}var Ka=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),iu=!1;if(Ka)try{Pr={},Object.defineProperty(Pr,"passive",{get:function(){iu=!0}}),window.addEventListener("test",Pr,Pr),window.removeEventListener("test",Pr,Pr)}catch{iu=!1}var Pr,So=null,$u=null,Zs=null;function Py(){if(Zs)return Zs;var e,t=$u,a=t.length,o,r="value"in So?So.value:So.textContent,n=r.length;for(e=0;e<a&&t[e]===r[e];e++);var l=a-e;for(o=1;o<=l&&t[a-o]===r[n-o];o++);return Zs=r.slice(e,1<o?1-o:void 0)}function Ws(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Os(){return!0}function tx(){return!1}function Mt(e){function t(a,o,r,n,l){this._reactName=a,this._targetInst=r,this.type=o,this.nativeEvent=n,this.target=l,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(a=e[s],this[s]=a?a(n):n[s]);return this.isDefaultPrevented=(n.defaultPrevented!=null?n.defaultPrevented:n.returnValue===!1)?Os:tx,this.isPropagationStopped=tx,this}return Ce(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Os)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Os)},persist:function(){},isPersistent:Os}),t}var xr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},_i=Mt(xr),Xl=Ce({},xr,{view:0,detail:0}),XS=Mt(Xl),Sc,wc,el,Pi=Ce({},Xl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ju,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==el&&(el&&e.type==="mousemove"?(Sc=e.screenX-el.screenX,wc=e.screenY-el.screenY):wc=Sc=0,el=e),Sc)},movementY:function(e){return"movementY"in e?e.movementY:wc}}),ax=Mt(Pi),GS=Ce({},Pi,{dataTransfer:0}),jS=Mt(GS),VS=Ce({},Xl,{relatedTarget:0}),Cc=Mt(VS),YS=Ce({},xr,{animationName:0,elapsedTime:0,pseudoElement:0}),QS=Mt(YS),KS=Ce({},xr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),ZS=Mt(KS),WS=Ce({},xr,{data:0}),ox=Mt(WS),$S={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},JS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},ew={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function tw(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=ew[e])?!!t[e]:!1}function Ju(){return tw}var aw=Ce({},Xl,{key:function(e){if(e.key){var t=$S[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Ws(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?JS[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ju,charCode:function(e){return e.type==="keypress"?Ws(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Ws(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),ow=Mt(aw),rw=Ce({},Pi,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),rx=Mt(rw),nw=Ce({},Xl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ju}),lw=Mt(nw),sw=Ce({},xr,{propertyName:0,elapsedTime:0,pseudoElement:0}),iw=Mt(sw),fw=Ce({},Pi,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),cw=Mt(fw),uw=Ce({},xr,{newState:0,oldState:0}),dw=Mt(uw),pw=[9,13,27,32],ed=Ka&&"CompositionEvent"in window,ul=null;Ka&&"documentMode"in document&&(ul=document.documentMode);var mw=Ka&&"TextEvent"in window&&!ul,qy=Ka&&(!ed||ul&&8<ul&&11>=ul),nx=" ",lx=!1;function Uy(e,t){switch(e){case"keyup":return pw.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Xy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Kr=!1;function xw(e,t){switch(e){case"compositionend":return Xy(t);case"keypress":return t.which!==32?null:(lx=!0,nx);case"textInput":return e=t.data,e===nx&&lx?null:e;default:return null}}function yw(e,t){if(Kr)return e==="compositionend"||!ed&&Uy(e,t)?(e=Py(),Zs=$u=So=null,Kr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return qy&&t.locale!=="ko"?null:t.data;default:return null}}var gw={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function sx(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!gw[e.type]:t==="textarea"}function Gy(e,t,a,o){Qr?nn?nn.push(o):nn=[o]:Qr=o,t=Di(t,"onChange"),0<t.length&&(a=new _i("onChange","change",null,a,o),e.push({event:a,listeners:t}))}var dl=null,Al=null;function hw(e){_h(e,0)}function qi(e){var t=il(e);if(By(t))return e}function ix(e,t){if(e==="change")return t}var jy=!1;Ka&&(Ka?(zs="oninput"in document,zs||(kc=document.createElement("div"),kc.setAttribute("oninput","return;"),zs=typeof kc.oninput=="function"),Ls=zs):Ls=!1,jy=Ls&&(!document.documentMode||9<document.documentMode));var Ls,zs,kc;function fx(){dl&&(dl.detachEvent("onpropertychange",Vy),Al=dl=null)}function Vy(e){if(e.propertyName==="value"&&qi(Al)){var t=[];Gy(t,Al,e,Wu(e)),_y(hw,t)}}function Iw(e,t,a){e==="focusin"?(fx(),dl=t,Al=a,dl.attachEvent("onpropertychange",Vy)):e==="focusout"&&fx()}function bw(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return qi(Al)}function vw(e,t){if(e==="click")return qi(t)}function Sw(e,t){if(e==="input"||e==="change")return qi(t)}function ww(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Xt=typeof Object.is=="function"?Object.is:ww;function Rl(e,t){if(Xt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),o=Object.keys(t);if(a.length!==o.length)return!1;for(o=0;o<a.length;o++){var r=a[o];if(!au.call(t,r)||!Xt(e[r],t[r]))return!1}return!0}function cx(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ux(e,t){var a=cx(e);e=0;for(var o;a;){if(a.nodeType===3){if(o=e+a.textContent.length,e<=t&&o>=t)return{node:a,offset:t-e};e=o}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=cx(a)}}function Yy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Yy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Qy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=pi(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=pi(e.document)}return t}function td(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Cw=Ka&&"documentMode"in document&&11>=document.documentMode,Zr=null,fu=null,pl=null,cu=!1;function dx(e,t,a){var o=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;cu||Zr==null||Zr!==pi(o)||(o=Zr,"selectionStart"in o&&td(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),pl&&Rl(pl,o)||(pl=o,o=Di(fu,"onSelect"),0<o.length&&(t=new _i("onSelect","select",null,t,a),e.push({event:t,listeners:o}),t.target=Zr)))}function Jo(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Wr={animationend:Jo("Animation","AnimationEnd"),animationiteration:Jo("Animation","AnimationIteration"),animationstart:Jo("Animation","AnimationStart"),transitionrun:Jo("Transition","TransitionRun"),transitionstart:Jo("Transition","TransitionStart"),transitioncancel:Jo("Transition","TransitionCancel"),transitionend:Jo("Transition","TransitionEnd")},Ac={},Ky={};Ka&&(Ky=document.createElement("div").style,"AnimationEvent"in window||(delete Wr.animationend.animation,delete Wr.animationiteration.animation,delete Wr.animationstart.animation),"TransitionEvent"in window||delete Wr.transitionend.transition);function yr(e){if(Ac[e])return Ac[e];if(!Wr[e])return e;var t=Wr[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Ky)return Ac[e]=t[a];return e}var Zy=yr("animationend"),Wy=yr("animationiteration"),$y=yr("animationstart"),kw=yr("transitionrun"),Aw=yr("transitionstart"),Rw=yr("transitioncancel"),Jy=yr("transitionend"),eg=new Map,uu="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");uu.push("scrollEnd");function xa(e,t){eg.set(e,t),mr(t,[e])}var mi=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Wt=[],$r=0,ad=0;function Ui(){for(var e=$r,t=ad=$r=0;t<e;){var a=Wt[t];Wt[t++]=null;var o=Wt[t];Wt[t++]=null;var r=Wt[t];Wt[t++]=null;var n=Wt[t];if(Wt[t++]=null,o!==null&&r!==null){var l=o.pending;l===null?r.next=r:(r.next=l.next,l.next=r),o.pending=r}n!==0&&tg(a,r,n)}}function Xi(e,t,a,o){Wt[$r++]=e,Wt[$r++]=t,Wt[$r++]=a,Wt[$r++]=o,ad|=o,e.lanes|=o,e=e.alternate,e!==null&&(e.lanes|=o)}function od(e,t,a,o){return Xi(e,t,a,o),xi(e)}function gr(e,t){return Xi(e,null,null,t),xi(e)}function tg(e,t,a){e.lanes|=a;var o=e.alternate;o!==null&&(o.lanes|=a);for(var r=!1,n=e.return;n!==null;)n.childLanes|=a,o=n.alternate,o!==null&&(o.childLanes|=a),n.tag===22&&(e=n.stateNode,e===null||e._visibility&1||(r=!0)),e=n,n=n.return;return e.tag===3?(n=e.stateNode,r&&t!==null&&(r=31-qt(a),e=n.hiddenUpdates,o=e[r],o===null?e[r]=[t]:o.push(t),t.lane=a|536870912),n):null}function xi(e){if(50<Sl)throw Sl=0,Fu=null,Error(F(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Jr={};function Mw(e,t,a,o){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function zt(e,t,a,o){return new Mw(e,t,a,o)}function rd(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Va(e,t){var a=e.alternate;return a===null?(a=zt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&65011712,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function ag(e,t){e.flags&=65011714;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function $s(e,t,a,o,r,n){var l=0;if(o=e,typeof e=="function")rd(e)&&(l=1);else if(typeof e=="string")l=DC(e,a,Aa.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case $c:return e=zt(31,a,t,r),e.elementType=$c,e.lanes=n,e;case jr:return nr(a.children,r,n,t);case vy:l=8,r|=24;break;case Kc:return e=zt(12,a,t,r|2),e.elementType=Kc,e.lanes=n,e;case Zc:return e=zt(13,a,t,r),e.elementType=Zc,e.lanes=n,e;case Wc:return e=zt(19,a,t,r),e.elementType=Wc,e.lanes=n,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Xa:l=10;break e;case Sy:l=9;break e;case Gu:l=11;break e;case ju:l=14;break e;case xo:l=16,o=null;break e}l=29,a=Error(F(130,e===null?"null":typeof e,"")),o=null}return t=zt(l,a,t,r),t.elementType=e,t.type=o,t.lanes=n,t}function nr(e,t,a,o){return e=zt(7,e,o,t),e.lanes=a,e}function Rc(e,t,a){return e=zt(6,e,null,t),e.lanes=a,e}function og(e){var t=zt(18,null,null,0);return t.stateNode=e,t}function Mc(e,t,a){return t=zt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var px=new WeakMap;function aa(e,t){if(typeof e=="object"&&e!==null){var a=px.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Qm(t)},px.set(e,t),t)}return{value:e,source:t,stack:Qm(t)}}var en=[],tn=0,yi=null,Ml=0,Jt=[],ea=0,Oo=null,wa=1,Ca="";function qa(e,t){en[tn++]=Ml,en[tn++]=yi,yi=e,Ml=t}function rg(e,t,a){Jt[ea++]=wa,Jt[ea++]=Ca,Jt[ea++]=Oo,Oo=e;var o=wa;e=Ca;var r=32-qt(o)-1;o&=~(1<<r),a+=1;var n=32-qt(t)+r;if(30<n){var l=r-r%5;n=(o&(1<<l)-1).toString(32),o>>=l,r-=l,wa=1<<32-qt(t)+r|a<<r|o,Ca=n+e}else wa=1<<n|a<<r|o,Ca=e}function nd(e){e.return!==null&&(qa(e,1),rg(e,1,0))}function ld(e){for(;e===yi;)yi=en[--tn],en[tn]=null,Ml=en[--tn],en[tn]=null;for(;e===Oo;)Oo=Jt[--ea],Jt[ea]=null,Ca=Jt[--ea],Jt[ea]=null,wa=Jt[--ea],Jt[ea]=null}function ng(e,t){Jt[ea++]=wa,Jt[ea++]=Ca,Jt[ea++]=Oo,wa=t.id,Ca=t.overflow,Oo=e}var ft=null,we=null,oe=!1,Ro=null,oa=!1,du=Error(F(519));function Lo(e){var t=Error(F(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Tl(aa(t,e)),du}function mx(e){var t=e.stateNode,a=e.type,o=e.memoizedProps;switch(t[it]=e,t[Rt]=o,a){case"dialog":ee("cancel",t),ee("close",t);break;case"iframe":case"object":case"embed":ee("load",t);break;case"video":case"audio":for(a=0;a<Nl.length;a++)ee(Nl[a],t);break;case"source":ee("error",t);break;case"img":case"image":case"link":ee("error",t),ee("load",t);break;case"details":ee("toggle",t);break;case"input":ee("invalid",t),Oy(t,o.value,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name,!0);break;case"select":ee("invalid",t);break;case"textarea":ee("invalid",t),zy(t,o.value,o.defaultValue,o.children)}a=o.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||o.suppressHydrationWarning===!0||qh(t.textContent,a)?(o.popover!=null&&(ee("beforetoggle",t),ee("toggle",t)),o.onScroll!=null&&ee("scroll",t),o.onScrollEnd!=null&&ee("scrollend",t),o.onClick!=null&&(t.onclick=Ga),t=!0):t=!1,t||Lo(e,!0)}function xx(e){for(ft=e.return;ft;)switch(ft.tag){case 5:case 31:case 13:oa=!1;return;case 27:case 3:oa=!0;return;default:ft=ft.return}}function qr(e){if(e!==ft)return!1;if(!oe)return xx(e),oe=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||zu(e.type,e.memoizedProps)),a=!a),a&&we&&Lo(e),xx(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(317));we=oy(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(317));we=oy(e)}else t===27?(t=we,Po(e.type)?(e=qu,qu=null,we=e):we=t):we=ft?na(e.stateNode.nextSibling):null;return!0}function fr(){we=ft=null,oe=!1}function Tc(){var e=Ro;return e!==null&&(kt===null?kt=e:kt.push.apply(kt,e),Ro=null),e}function Tl(e){Ro===null?Ro=[e]:Ro.push(e)}var pu=Ra(null),hr=null,ja=null;function go(e,t,a){he(pu,t._currentValue),t._currentValue=a}function Ya(e){e._currentValue=pu.current,at(pu)}function mu(e,t,a){for(;e!==null;){var o=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,o!==null&&(o.childLanes|=t)):o!==null&&(o.childLanes&t)!==t&&(o.childLanes|=t),e===a)break;e=e.return}}function xu(e,t,a,o){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var n=r.dependencies;if(n!==null){var l=r.child;n=n.firstContext;e:for(;n!==null;){var s=n;n=r;for(var i=0;i<t.length;i++)if(s.context===t[i]){n.lanes|=a,s=n.alternate,s!==null&&(s.lanes|=a),mu(n.return,a,e),o||(l=null);break e}n=s.next}}else if(r.tag===18){if(l=r.return,l===null)throw Error(F(341));l.lanes|=a,n=l.alternate,n!==null&&(n.lanes|=a),mu(l,a,e),l=null}else l=r.child;if(l!==null)l.return=r;else for(l=r;l!==null;){if(l===e){l=null;break}if(r=l.sibling,r!==null){r.return=l.return,l=r;break}l=l.return}r=l}}function Cn(e,t,a,o){e=null;for(var r=t,n=!1;r!==null;){if(!n){if((r.flags&524288)!==0)n=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var l=r.alternate;if(l===null)throw Error(F(387));if(l=l.memoizedProps,l!==null){var s=r.type;Xt(r.pendingProps.value,l.value)||(e!==null?e.push(s):e=[s])}}else if(r===fi.current){if(l=r.alternate,l===null)throw Error(F(387));l.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(Ol):e=[Ol])}r=r.return}e!==null&&xu(t,e,a,o),t.flags|=262144}function gi(e){for(e=e.firstContext;e!==null;){if(!Xt(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function cr(e){hr=e,ja=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ct(e){return lg(hr,e)}function Hs(e,t){return hr===null&&cr(e),lg(e,t)}function lg(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},ja===null){if(e===null)throw Error(F(308));ja=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ja=ja.next=t;return a}var Tw=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,o){e.push(o)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},Ew=Ke.unstable_scheduleCallback,Dw=Ke.unstable_NormalPriority,Ve={$$typeof:Xa,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function sd(){return{controller:new Tw,data:new Map,refCount:0}}function Gl(e){e.refCount--,e.refCount===0&&Ew(Dw,function(){e.controller.abort()})}var ml=null,yu=0,mn=0,ln=null;function Fw(e,t){if(ml===null){var a=ml=[];yu=0,mn=Fd(),ln={status:"pending",value:void 0,then:function(o){a.push(o)}}}return yu++,t.then(yx,yx),t}function yx(){if(--yu===0&&ml!==null){ln!==null&&(ln.status="fulfilled");var e=ml;ml=null,mn=0,ln=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Nw(e,t){var a=[],o={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){o.status="fulfilled",o.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(o.status="rejected",o.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),o}var gx=j.S;j.S=function(e,t){bh=_t(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Fw(e,t),gx!==null&&gx(e,t)};var lr=Ra(null);function id(){var e=lr.current;return e!==null?e:ge.pooledCache}function Js(e,t){t===null?he(lr,lr.current):he(lr,t.pool)}function sg(){var e=id();return e===null?null:{parent:Ve._currentValue,pool:e}}var kn=Error(F(460)),fd=Error(F(474)),Gi=Error(F(542)),hi={then:function(){}};function hx(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ig(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(Ga,Ga),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,bx(e),e;default:if(typeof t.status=="string")t.then(Ga,Ga);else{if(e=ge,e!==null&&100<e.shellSuspendCounter)throw Error(F(482));e=t,e.status="pending",e.then(function(o){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=o}},function(o){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=o}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,bx(e),e}throw sr=t,kn}}function ar(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(sr=a,kn):a}}var sr=null;function Ix(){if(sr===null)throw Error(F(459));var e=sr;return sr=null,e}function bx(e){if(e===kn||e===Gi)throw Error(F(483))}var sn=null,El=0;function _s(e){var t=El;return El+=1,sn===null&&(sn=[]),ig(sn,e,t)}function tl(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Ps(e,t){throw t.$$typeof===IS?Error(F(525)):(e=Object.prototype.toString.call(t),Error(F(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function fg(e){function t(y,c){if(e){var m=y.deletions;m===null?(y.deletions=[c],y.flags|=16):m.push(c)}}function a(y,c){if(!e)return null;for(;c!==null;)t(y,c),c=c.sibling;return null}function o(y){for(var c=new Map;y!==null;)y.key!==null?c.set(y.key,y):c.set(y.index,y),y=y.sibling;return c}function r(y,c){return y=Va(y,c),y.index=0,y.sibling=null,y}function n(y,c,m){return y.index=m,e?(m=y.alternate,m!==null?(m=m.index,m<c?(y.flags|=67108866,c):m):(y.flags|=67108866,c)):(y.flags|=1048576,c)}function l(y){return e&&y.alternate===null&&(y.flags|=67108866),y}function s(y,c,m,g){return c===null||c.tag!==6?(c=Rc(m,y.mode,g),c.return=y,c):(c=r(c,m),c.return=y,c)}function i(y,c,m,g){var A=m.type;return A===jr?u(y,c,m.props.children,g,m.key):c!==null&&(c.elementType===A||typeof A=="object"&&A!==null&&A.$$typeof===xo&&ar(A)===c.type)?(c=r(c,m.props),tl(c,m),c.return=y,c):(c=$s(m.type,m.key,m.props,null,y.mode,g),tl(c,m),c.return=y,c)}function f(y,c,m,g){return c===null||c.tag!==4||c.stateNode.containerInfo!==m.containerInfo||c.stateNode.implementation!==m.implementation?(c=Mc(m,y.mode,g),c.return=y,c):(c=r(c,m.children||[]),c.return=y,c)}function u(y,c,m,g,A){return c===null||c.tag!==7?(c=nr(m,y.mode,g,A),c.return=y,c):(c=r(c,m),c.return=y,c)}function x(y,c,m){if(typeof c=="string"&&c!==""||typeof c=="number"||typeof c=="bigint")return c=Rc(""+c,y.mode,m),c.return=y,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case Es:return m=$s(c.type,c.key,c.props,null,y.mode,m),tl(m,c),m.return=y,m;case ll:return c=Mc(c,y.mode,m),c.return=y,c;case xo:return c=ar(c),x(y,c,m)}if(sl(c)||Jn(c))return c=nr(c,y.mode,m,null),c.return=y,c;if(typeof c.then=="function")return x(y,_s(c),m);if(c.$$typeof===Xa)return x(y,Hs(y,c),m);Ps(y,c)}return null}function d(y,c,m,g){var A=c!==null?c.key:null;if(typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint")return A!==null?null:s(y,c,""+m,g);if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Es:return m.key===A?i(y,c,m,g):null;case ll:return m.key===A?f(y,c,m,g):null;case xo:return m=ar(m),d(y,c,m,g)}if(sl(m)||Jn(m))return A!==null?null:u(y,c,m,g,null);if(typeof m.then=="function")return d(y,c,_s(m),g);if(m.$$typeof===Xa)return d(y,c,Hs(y,m),g);Ps(y,m)}return null}function p(y,c,m,g,A){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return y=y.get(m)||null,s(c,y,""+g,A);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Es:return y=y.get(g.key===null?m:g.key)||null,i(c,y,g,A);case ll:return y=y.get(g.key===null?m:g.key)||null,f(c,y,g,A);case xo:return g=ar(g),p(y,c,m,g,A)}if(sl(g)||Jn(g))return y=y.get(m)||null,u(c,y,g,A,null);if(typeof g.then=="function")return p(y,c,m,_s(g),A);if(g.$$typeof===Xa)return p(y,c,m,Hs(c,g),A);Ps(c,g)}return null}function v(y,c,m,g){for(var A=null,B=null,b=c,N=c=0,S=null;b!==null&&N<m.length;N++){b.index>N?(S=b,b=null):S=b.sibling;var _=d(y,b,m[N],g);if(_===null){b===null&&(b=S);break}e&&b&&_.alternate===null&&t(y,b),c=n(_,c,N),B===null?A=_:B.sibling=_,B=_,b=S}if(N===m.length)return a(y,b),oe&&qa(y,N),A;if(b===null){for(;N<m.length;N++)b=x(y,m[N],g),b!==null&&(c=n(b,c,N),B===null?A=b:B.sibling=b,B=b);return oe&&qa(y,N),A}for(b=o(b);N<m.length;N++)S=p(b,y,N,m[N],g),S!==null&&(e&&S.alternate!==null&&b.delete(S.key===null?N:S.key),c=n(S,c,N),B===null?A=S:B.sibling=S,B=S);return e&&b.forEach(function(ne){return t(y,ne)}),oe&&qa(y,N),A}function k(y,c,m,g){if(m==null)throw Error(F(151));for(var A=null,B=null,b=c,N=c=0,S=null,_=m.next();b!==null&&!_.done;N++,_=m.next()){b.index>N?(S=b,b=null):S=b.sibling;var ne=d(y,b,_.value,g);if(ne===null){b===null&&(b=S);break}e&&b&&ne.alternate===null&&t(y,b),c=n(ne,c,N),B===null?A=ne:B.sibling=ne,B=ne,b=S}if(_.done)return a(y,b),oe&&qa(y,N),A;if(b===null){for(;!_.done;N++,_=m.next())_=x(y,_.value,g),_!==null&&(c=n(_,c,N),B===null?A=_:B.sibling=_,B=_);return oe&&qa(y,N),A}for(b=o(b);!_.done;N++,_=m.next())_=p(b,y,N,_.value,g),_!==null&&(e&&_.alternate!==null&&b.delete(_.key===null?N:_.key),c=n(_,c,N),B===null?A=_:B.sibling=_,B=_);return e&&b.forEach(function(nt){return t(y,nt)}),oe&&qa(y,N),A}function D(y,c,m,g){if(typeof m=="object"&&m!==null&&m.type===jr&&m.key===null&&(m=m.props.children),typeof m=="object"&&m!==null){switch(m.$$typeof){case Es:e:{for(var A=m.key;c!==null;){if(c.key===A){if(A=m.type,A===jr){if(c.tag===7){a(y,c.sibling),g=r(c,m.props.children),g.return=y,y=g;break e}}else if(c.elementType===A||typeof A=="object"&&A!==null&&A.$$typeof===xo&&ar(A)===c.type){a(y,c.sibling),g=r(c,m.props),tl(g,m),g.return=y,y=g;break e}a(y,c);break}else t(y,c);c=c.sibling}m.type===jr?(g=nr(m.props.children,y.mode,g,m.key),g.return=y,y=g):(g=$s(m.type,m.key,m.props,null,y.mode,g),tl(g,m),g.return=y,y=g)}return l(y);case ll:e:{for(A=m.key;c!==null;){if(c.key===A)if(c.tag===4&&c.stateNode.containerInfo===m.containerInfo&&c.stateNode.implementation===m.implementation){a(y,c.sibling),g=r(c,m.children||[]),g.return=y,y=g;break e}else{a(y,c);break}else t(y,c);c=c.sibling}g=Mc(m,y.mode,g),g.return=y,y=g}return l(y);case xo:return m=ar(m),D(y,c,m,g)}if(sl(m))return v(y,c,m,g);if(Jn(m)){if(A=Jn(m),typeof A!="function")throw Error(F(150));return m=A.call(m),k(y,c,m,g)}if(typeof m.then=="function")return D(y,c,_s(m),g);if(m.$$typeof===Xa)return D(y,c,Hs(y,m),g);Ps(y,m)}return typeof m=="string"&&m!==""||typeof m=="number"||typeof m=="bigint"?(m=""+m,c!==null&&c.tag===6?(a(y,c.sibling),g=r(c,m),g.return=y,y=g):(a(y,c),g=Rc(m,y.mode,g),g.return=y,y=g),l(y)):a(y,c)}return function(y,c,m,g){try{El=0;var A=D(y,c,m,g);return sn=null,A}catch(b){if(b===kn||b===Gi)throw b;var B=zt(29,b,null,y.mode);return B.lanes=g,B.return=y,B}}}var ur=fg(!0),cg=fg(!1),yo=!1;function cd(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function gu(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Mo(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function To(e,t,a){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,(ie&2)!==0){var r=o.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),o.pending=t,t=xi(e),tg(e,null,a),t}return Xi(e,o,t,a),xi(e)}function xl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var o=t.lanes;o&=e.pendingLanes,a|=o,t.lanes=a,My(e,a)}}function Ec(e,t){var a=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,a===o)){var r=null,n=null;if(a=a.firstBaseUpdate,a!==null){do{var l={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};n===null?r=n=l:n=n.next=l,a=a.next}while(a!==null);n===null?r=n=t:n=n.next=t}else r=n=t;a={baseState:o.baseState,firstBaseUpdate:r,lastBaseUpdate:n,shared:o.shared,callbacks:o.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var hu=!1;function yl(){if(hu){var e=ln;if(e!==null)throw e}}function gl(e,t,a,o){hu=!1;var r=e.updateQueue;yo=!1;var n=r.firstBaseUpdate,l=r.lastBaseUpdate,s=r.shared.pending;if(s!==null){r.shared.pending=null;var i=s,f=i.next;i.next=null,l===null?n=f:l.next=f,l=i;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==l&&(s===null?u.firstBaseUpdate=f:s.next=f,u.lastBaseUpdate=i))}if(n!==null){var x=r.baseState;l=0,u=f=i=null,s=n;do{var d=s.lane&-536870913,p=d!==s.lane;if(p?(ae&d)===d:(o&d)===d){d!==0&&d===mn&&(hu=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});e:{var v=e,k=s;d=t;var D=a;switch(k.tag){case 1:if(v=k.payload,typeof v=="function"){x=v.call(D,x,d);break e}x=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=k.payload,d=typeof v=="function"?v.call(D,x,d):v,d==null)break e;x=Ce({},x,d);break e;case 2:yo=!0}}d=s.callback,d!==null&&(e.flags|=64,p&&(e.flags|=8192),p=r.callbacks,p===null?r.callbacks=[d]:p.push(d))}else p={lane:d,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(f=u=p,i=x):u=u.next=p,l|=d;if(s=s.next,s===null){if(s=r.shared.pending,s===null)break;p=s,s=p.next,p.next=null,r.lastBaseUpdate=p,r.shared.pending=null}}while(!0);u===null&&(i=x),r.baseState=i,r.firstBaseUpdate=f,r.lastBaseUpdate=u,n===null&&(r.shared.lanes=0),Ho|=l,e.lanes=l,e.memoizedState=x}}function ug(e,t){if(typeof e!="function")throw Error(F(191,e));e.call(t)}function dg(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)ug(a[e],t)}var xn=Ra(null),Ii=Ra(0);function vx(e,t){e=Ja,he(Ii,e),he(xn,t),Ja=e|t.baseLanes}function Iu(){he(Ii,Ja),he(xn,xn.current)}function ud(){Ja=Ii.current,at(xn),at(Ii)}var Gt=Ra(null),ra=null;function ho(e){var t=e.alternate;he(He,He.current&1),he(Gt,e),ra===null&&(t===null||xn.current!==null||t.memoizedState!==null)&&(ra=e)}function bu(e){he(He,He.current),he(Gt,e),ra===null&&(ra=e)}function pg(e){e.tag===22?(he(He,He.current),he(Gt,e),ra===null&&(ra=e)):Io(e)}function Io(){he(He,He.current),he(Gt,Gt.current)}function Lt(e){at(Gt),ra===e&&(ra=null),at(He)}var He=Ra(0);function bi(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||_u(a)||Pu(a)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Za=0,Q=null,xe=null,Ge=null,vi=!1,fn=!1,dr=!1,Si=0,Dl=0,cn=null,Bw=0;function Fe(){throw Error(F(321))}function dd(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Xt(e[a],t[a]))return!1;return!0}function pd(e,t,a,o,r,n){return Za=n,Q=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,j.H=e===null||e.memoizedState===null?Gg:Cd,dr=!1,n=a(o,r),dr=!1,fn&&(n=xg(t,a,o,r)),mg(e),n}function mg(e){j.H=Fl;var t=xe!==null&&xe.next!==null;if(Za=0,Ge=xe=Q=null,vi=!1,Dl=0,cn=null,t)throw Error(F(300));e===null||Ye||(e=e.dependencies,e!==null&&gi(e)&&(Ye=!0))}function xg(e,t,a,o){Q=e;var r=0;do{if(fn&&(cn=null),Dl=0,fn=!1,25<=r)throw Error(F(301));if(r+=1,Ge=xe=null,e.updateQueue!=null){var n=e.updateQueue;n.lastEffect=null,n.events=null,n.stores=null,n.memoCache!=null&&(n.memoCache.index=0)}j.H=jg,n=t(a,o)}while(fn);return n}function Ow(){var e=j.H,t=e.useState()[0];return t=typeof t.then=="function"?jl(t):t,e=e.useState()[0],(xe!==null?xe.memoizedState:null)!==e&&(Q.flags|=1024),t}function md(){var e=Si!==0;return Si=0,e}function xd(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function yd(e){if(vi){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}vi=!1}Za=0,Ge=xe=Q=null,fn=!1,Dl=Si=0,cn=null}function bt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ge===null?Q.memoizedState=Ge=e:Ge=Ge.next=e,Ge}function _e(){if(xe===null){var e=Q.alternate;e=e!==null?e.memoizedState:null}else e=xe.next;var t=Ge===null?Q.memoizedState:Ge.next;if(t!==null)Ge=t,xe=e;else{if(e===null)throw Q.alternate===null?Error(F(467)):Error(F(310));xe=e,e={memoizedState:xe.memoizedState,baseState:xe.baseState,baseQueue:xe.baseQueue,queue:xe.queue,next:null},Ge===null?Q.memoizedState=Ge=e:Ge=Ge.next=e}return Ge}function ji(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function jl(e){var t=Dl;return Dl+=1,cn===null&&(cn=[]),e=ig(cn,e,t),t=Q,(Ge===null?t.memoizedState:Ge.next)===null&&(t=t.alternate,j.H=t===null||t.memoizedState===null?Gg:Cd),e}function Vi(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return jl(e);if(e.$$typeof===Xa)return ct(e)}throw Error(F(438,String(e)))}function gd(e){var t=null,a=Q.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var o=Q.alternate;o!==null&&(o=o.updateQueue,o!==null&&(o=o.memoCache,o!=null&&(t={data:o.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=ji(),Q.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),o=0;o<e;o++)a[o]=bS;return t.index++,a}function Wa(e,t){return typeof t=="function"?t(e):t}function ei(e){var t=_e();return hd(t,xe,e)}function hd(e,t,a){var o=e.queue;if(o===null)throw Error(F(311));o.lastRenderedReducer=a;var r=e.baseQueue,n=o.pending;if(n!==null){if(r!==null){var l=r.next;r.next=n.next,n.next=l}t.baseQueue=r=n,o.pending=null}if(n=e.baseState,r===null)e.memoizedState=n;else{t=r.next;var s=l=null,i=null,f=t,u=!1;do{var x=f.lane&-536870913;if(x!==f.lane?(ae&x)===x:(Za&x)===x){var d=f.revertLane;if(d===0)i!==null&&(i=i.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),x===mn&&(u=!0);else if((Za&d)===d){f=f.next,d===mn&&(u=!0);continue}else x={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},i===null?(s=i=x,l=n):i=i.next=x,Q.lanes|=d,Ho|=d;x=f.action,dr&&a(n,x),n=f.hasEagerState?f.eagerState:a(n,x)}else d={lane:x,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},i===null?(s=i=d,l=n):i=i.next=d,Q.lanes|=x,Ho|=x;f=f.next}while(f!==null&&f!==t);if(i===null?l=n:i.next=s,!Xt(n,e.memoizedState)&&(Ye=!0,u&&(a=ln,a!==null)))throw a;e.memoizedState=n,e.baseState=l,e.baseQueue=i,o.lastRenderedState=n}return r===null&&(o.lanes=0),[e.memoizedState,o.dispatch]}function Dc(e){var t=_e(),a=t.queue;if(a===null)throw Error(F(311));a.lastRenderedReducer=e;var o=a.dispatch,r=a.pending,n=t.memoizedState;if(r!==null){a.pending=null;var l=r=r.next;do n=e(n,l.action),l=l.next;while(l!==r);Xt(n,t.memoizedState)||(Ye=!0),t.memoizedState=n,t.baseQueue===null&&(t.baseState=n),a.lastRenderedState=n}return[n,o]}function yg(e,t,a){var o=Q,r=_e(),n=oe;if(n){if(a===void 0)throw Error(F(407));a=a()}else a=t();var l=!Xt((xe||r).memoizedState,a);if(l&&(r.memoizedState=a,Ye=!0),r=r.queue,Id(Ig.bind(null,o,r,e),[e]),r.getSnapshot!==t||l||Ge!==null&&Ge.memoizedState.tag&1){if(o.flags|=2048,yn(9,{destroy:void 0},hg.bind(null,o,r,a,t),null),ge===null)throw Error(F(349));n||(Za&127)!==0||gg(o,t,a)}return a}function gg(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=Q.updateQueue,t===null?(t=ji(),Q.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function hg(e,t,a,o){t.value=a,t.getSnapshot=o,bg(t)&&vg(e)}function Ig(e,t,a){return a(function(){bg(t)&&vg(e)})}function bg(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Xt(e,a)}catch{return!0}}function vg(e){var t=gr(e,2);t!==null&&At(t,e,2)}function vu(e){var t=bt();if(typeof e=="function"){var a=e;if(e=a(),dr){vo(!0);try{a()}finally{vo(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wa,lastRenderedState:e},t}function Sg(e,t,a,o){return e.baseState=a,hd(e,xe,typeof o=="function"?o:Wa)}function Lw(e,t,a,o,r){if(Qi(e))throw Error(F(485));if(e=t.action,e!==null){var n={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(l){n.listeners.push(l)}};j.T!==null?a(!0):n.isTransition=!1,o(n),a=t.pending,a===null?(n.next=t.pending=n,wg(t,n)):(n.next=a.next,t.pending=a.next=n)}}function wg(e,t){var a=t.action,o=t.payload,r=e.state;if(t.isTransition){var n=j.T,l={};j.T=l;try{var s=a(r,o),i=j.S;i!==null&&i(l,s),Sx(e,t,s)}catch(f){Su(e,t,f)}finally{n!==null&&l.types!==null&&(n.types=l.types),j.T=n}}else try{n=a(r,o),Sx(e,t,n)}catch(f){Su(e,t,f)}}function Sx(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(o){wx(e,t,o)},function(o){return Su(e,t,o)}):wx(e,t,a)}function wx(e,t,a){t.status="fulfilled",t.value=a,Cg(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,wg(e,a)))}function Su(e,t,a){var o=e.pending;if(e.pending=null,o!==null){o=o.next;do t.status="rejected",t.reason=a,Cg(t),t=t.next;while(t!==o)}e.action=null}function Cg(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function kg(e,t){return t}function Cx(e,t){if(oe){var a=ge.formState;if(a!==null){e:{var o=Q;if(oe){if(we){t:{for(var r=we,n=oa;r.nodeType!==8;){if(!n){r=null;break t}if(r=na(r.nextSibling),r===null){r=null;break t}}n=r.data,r=n==="F!"||n==="F"?r:null}if(r){we=na(r.nextSibling),o=r.data==="F!";break e}}Lo(o)}o=!1}o&&(t=a[0])}}return a=bt(),a.memoizedState=a.baseState=t,o={pending:null,lanes:0,dispatch:null,lastRenderedReducer:kg,lastRenderedState:t},a.queue=o,a=qg.bind(null,Q,o),o.dispatch=a,o=vu(!1),n=wd.bind(null,Q,!1,o.queue),o=bt(),r={state:t,dispatch:null,action:e,pending:null},o.queue=r,a=Lw.bind(null,Q,r,n,a),r.dispatch=a,o.memoizedState=e,[t,a,!1]}function kx(e){var t=_e();return Ag(t,xe,e)}function Ag(e,t,a){if(t=hd(e,t,kg)[0],e=ei(Wa)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var o=jl(t)}catch(l){throw l===kn?Gi:l}else o=t;t=_e();var r=t.queue,n=r.dispatch;return a!==t.memoizedState&&(Q.flags|=2048,yn(9,{destroy:void 0},zw.bind(null,r,a),null)),[o,n,e]}function zw(e,t){e.action=t}function Ax(e){var t=_e(),a=xe;if(a!==null)return Ag(t,a,e);_e(),t=t.memoizedState,a=_e();var o=a.queue.dispatch;return a.memoizedState=e,[t,o,!1]}function yn(e,t,a,o){return e={tag:e,create:a,deps:o,inst:t,next:null},t=Q.updateQueue,t===null&&(t=ji(),Q.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(o=a.next,a.next=e,e.next=o,t.lastEffect=e),e}function Rg(){return _e().memoizedState}function ti(e,t,a,o){var r=bt();Q.flags|=e,r.memoizedState=yn(1|t,{destroy:void 0},a,o===void 0?null:o)}function Yi(e,t,a,o){var r=_e();o=o===void 0?null:o;var n=r.memoizedState.inst;xe!==null&&o!==null&&dd(o,xe.memoizedState.deps)?r.memoizedState=yn(t,n,a,o):(Q.flags|=e,r.memoizedState=yn(1|t,n,a,o))}function Rx(e,t){ti(8390656,8,e,t)}function Id(e,t){Yi(2048,8,e,t)}function Hw(e){Q.flags|=4;var t=Q.updateQueue;if(t===null)t=ji(),Q.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Mg(e){var t=_e().memoizedState;return Hw({ref:t,nextImpl:e}),function(){if((ie&2)!==0)throw Error(F(440));return t.impl.apply(void 0,arguments)}}function Tg(e,t){return Yi(4,2,e,t)}function Eg(e,t){return Yi(4,4,e,t)}function Dg(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Fg(e,t,a){a=a!=null?a.concat([e]):null,Yi(4,4,Dg.bind(null,t,e),a)}function bd(){}function Ng(e,t){var a=_e();t=t===void 0?null:t;var o=a.memoizedState;return t!==null&&dd(t,o[1])?o[0]:(a.memoizedState=[e,t],e)}function Bg(e,t){var a=_e();t=t===void 0?null:t;var o=a.memoizedState;if(t!==null&&dd(t,o[1]))return o[0];if(o=e(),dr){vo(!0);try{e()}finally{vo(!1)}}return a.memoizedState=[o,t],o}function vd(e,t,a){return a===void 0||(Za&1073741824)!==0&&(ae&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Sh(),Q.lanes|=e,Ho|=e,a)}function Og(e,t,a,o){return Xt(a,t)?a:xn.current!==null?(e=vd(e,a,o),Xt(e,t)||(Ye=!0),e):(Za&42)===0||(Za&1073741824)!==0&&(ae&261930)===0?(Ye=!0,e.memoizedState=a):(e=Sh(),Q.lanes|=e,Ho|=e,t)}function Lg(e,t,a,o,r){var n=fe.p;fe.p=n!==0&&8>n?n:8;var l=j.T,s={};j.T=s,wd(e,!1,t,a);try{var i=r(),f=j.S;if(f!==null&&f(s,i),i!==null&&typeof i=="object"&&typeof i.then=="function"){var u=Nw(i,o);hl(e,t,u,Ut(e))}else hl(e,t,o,Ut(e))}catch(x){hl(e,t,{then:function(){},status:"rejected",reason:x},Ut())}finally{fe.p=n,l!==null&&s.types!==null&&(l.types=s.types),j.T=l}}function _w(){}function wu(e,t,a,o){if(e.tag!==5)throw Error(F(476));var r=zg(e).queue;Lg(e,r,t,rr,a===null?_w:function(){return Hg(e),a(o)})}function zg(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:rr,baseState:rr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wa,lastRenderedState:rr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wa,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Hg(e){var t=zg(e);t.next===null&&(t=e.alternate.memoizedState),hl(e,t.next.queue,{},Ut())}function Sd(){return ct(Ol)}function _g(){return _e().memoizedState}function Pg(){return _e().memoizedState}function Pw(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Ut();e=Mo(a);var o=To(t,e,a);o!==null&&(At(o,t,a),xl(o,t,a)),t={cache:sd()},e.payload=t;return}t=t.return}}function qw(e,t,a){var o=Ut();a={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Qi(e)?Ug(t,a):(a=od(e,t,a,o),a!==null&&(At(a,e,o),Xg(a,t,o)))}function qg(e,t,a){var o=Ut();hl(e,t,a,o)}function hl(e,t,a,o){var r={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Qi(e))Ug(t,r);else{var n=e.alternate;if(e.lanes===0&&(n===null||n.lanes===0)&&(n=t.lastRenderedReducer,n!==null))try{var l=t.lastRenderedState,s=n(l,a);if(r.hasEagerState=!0,r.eagerState=s,Xt(s,l))return Xi(e,t,r,0),ge===null&&Ui(),!1}catch{}if(a=od(e,t,r,o),a!==null)return At(a,e,o),Xg(a,t,o),!0}return!1}function wd(e,t,a,o){if(o={lane:2,revertLane:Fd(),gesture:null,action:o,hasEagerState:!1,eagerState:null,next:null},Qi(e)){if(t)throw Error(F(479))}else t=od(e,a,o,2),t!==null&&At(t,e,2)}function Qi(e){var t=e.alternate;return e===Q||t!==null&&t===Q}function Ug(e,t){fn=vi=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Xg(e,t,a){if((a&4194048)!==0){var o=t.lanes;o&=e.pendingLanes,a|=o,t.lanes=a,My(e,a)}}var Fl={readContext:ct,use:Vi,useCallback:Fe,useContext:Fe,useEffect:Fe,useImperativeHandle:Fe,useLayoutEffect:Fe,useInsertionEffect:Fe,useMemo:Fe,useReducer:Fe,useRef:Fe,useState:Fe,useDebugValue:Fe,useDeferredValue:Fe,useTransition:Fe,useSyncExternalStore:Fe,useId:Fe,useHostTransitionStatus:Fe,useFormState:Fe,useActionState:Fe,useOptimistic:Fe,useMemoCache:Fe,useCacheRefresh:Fe};Fl.useEffectEvent=Fe;var Gg={readContext:ct,use:Vi,useCallback:function(e,t){return bt().memoizedState=[e,t===void 0?null:t],e},useContext:ct,useEffect:Rx,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,ti(4194308,4,Dg.bind(null,t,e),a)},useLayoutEffect:function(e,t){return ti(4194308,4,e,t)},useInsertionEffect:function(e,t){ti(4,2,e,t)},useMemo:function(e,t){var a=bt();t=t===void 0?null:t;var o=e();if(dr){vo(!0);try{e()}finally{vo(!1)}}return a.memoizedState=[o,t],o},useReducer:function(e,t,a){var o=bt();if(a!==void 0){var r=a(t);if(dr){vo(!0);try{a(t)}finally{vo(!1)}}}else r=t;return o.memoizedState=o.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},o.queue=e,e=e.dispatch=qw.bind(null,Q,e),[o.memoizedState,e]},useRef:function(e){var t=bt();return e={current:e},t.memoizedState=e},useState:function(e){e=vu(e);var t=e.queue,a=qg.bind(null,Q,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:bd,useDeferredValue:function(e,t){var a=bt();return vd(a,e,t)},useTransition:function(){var e=vu(!1);return e=Lg.bind(null,Q,e.queue,!0,!1),bt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var o=Q,r=bt();if(oe){if(a===void 0)throw Error(F(407));a=a()}else{if(a=t(),ge===null)throw Error(F(349));(ae&127)!==0||gg(o,t,a)}r.memoizedState=a;var n={value:a,getSnapshot:t};return r.queue=n,Rx(Ig.bind(null,o,n,e),[e]),o.flags|=2048,yn(9,{destroy:void 0},hg.bind(null,o,n,a,t),null),a},useId:function(){var e=bt(),t=ge.identifierPrefix;if(oe){var a=Ca,o=wa;a=(o&~(1<<32-qt(o)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Si++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=Bw++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Sd,useFormState:Cx,useActionState:Cx,useOptimistic:function(e){var t=bt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=wd.bind(null,Q,!0,a),a.dispatch=t,[e,t]},useMemoCache:gd,useCacheRefresh:function(){return bt().memoizedState=Pw.bind(null,Q)},useEffectEvent:function(e){var t=bt(),a={impl:e};return t.memoizedState=a,function(){if((ie&2)!==0)throw Error(F(440));return a.impl.apply(void 0,arguments)}}},Cd={readContext:ct,use:Vi,useCallback:Ng,useContext:ct,useEffect:Id,useImperativeHandle:Fg,useInsertionEffect:Tg,useLayoutEffect:Eg,useMemo:Bg,useReducer:ei,useRef:Rg,useState:function(){return ei(Wa)},useDebugValue:bd,useDeferredValue:function(e,t){var a=_e();return Og(a,xe.memoizedState,e,t)},useTransition:function(){var e=ei(Wa)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:jl(e),t]},useSyncExternalStore:yg,useId:_g,useHostTransitionStatus:Sd,useFormState:kx,useActionState:kx,useOptimistic:function(e,t){var a=_e();return Sg(a,xe,e,t)},useMemoCache:gd,useCacheRefresh:Pg};Cd.useEffectEvent=Mg;var jg={readContext:ct,use:Vi,useCallback:Ng,useContext:ct,useEffect:Id,useImperativeHandle:Fg,useInsertionEffect:Tg,useLayoutEffect:Eg,useMemo:Bg,useReducer:Dc,useRef:Rg,useState:function(){return Dc(Wa)},useDebugValue:bd,useDeferredValue:function(e,t){var a=_e();return xe===null?vd(a,e,t):Og(a,xe.memoizedState,e,t)},useTransition:function(){var e=Dc(Wa)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:jl(e),t]},useSyncExternalStore:yg,useId:_g,useHostTransitionStatus:Sd,useFormState:Ax,useActionState:Ax,useOptimistic:function(e,t){var a=_e();return xe!==null?Sg(a,xe,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:gd,useCacheRefresh:Pg};jg.useEffectEvent=Mg;function Fc(e,t,a,o){t=e.memoizedState,a=a(o,t),a=a==null?t:Ce({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Cu={enqueueSetState:function(e,t,a){e=e._reactInternals;var o=Ut(),r=Mo(o);r.payload=t,a!=null&&(r.callback=a),t=To(e,r,o),t!==null&&(At(t,e,o),xl(t,e,o))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var o=Ut(),r=Mo(o);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=To(e,r,o),t!==null&&(At(t,e,o),xl(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Ut(),o=Mo(a);o.tag=2,t!=null&&(o.callback=t),t=To(e,o,a),t!==null&&(At(t,e,a),xl(t,e,a))}};function Mx(e,t,a,o,r,n,l){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,n,l):t.prototype&&t.prototype.isPureReactComponent?!Rl(a,o)||!Rl(r,n):!0}function Tx(e,t,a,o){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,o),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,o),t.state!==e&&Cu.enqueueReplaceState(t,t.state,null)}function pr(e,t){var a=t;if("ref"in t){a={};for(var o in t)o!=="ref"&&(a[o]=t[o])}if(e=e.defaultProps){a===t&&(a=Ce({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function Vg(e){mi(e)}function Yg(e){console.error(e)}function Qg(e){mi(e)}function wi(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(o){setTimeout(function(){throw o})}}function Ex(e,t,a){try{var o=e.onCaughtError;o(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function ku(e,t,a){return a=Mo(a),a.tag=3,a.payload={element:null},a.callback=function(){wi(e,t)},a}function Kg(e){return e=Mo(e),e.tag=3,e}function Zg(e,t,a,o){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var n=o.value;e.payload=function(){return r(n)},e.callback=function(){Ex(t,a,o)}}var l=a.stateNode;l!==null&&typeof l.componentDidCatch=="function"&&(e.callback=function(){Ex(t,a,o),typeof r!="function"&&(Eo===null?Eo=new Set([this]):Eo.add(this));var s=o.stack;this.componentDidCatch(o.value,{componentStack:s!==null?s:""})})}function Uw(e,t,a,o,r){if(a.flags|=32768,o!==null&&typeof o=="object"&&typeof o.then=="function"){if(t=a.alternate,t!==null&&Cn(t,a,r,!0),a=Gt.current,a!==null){switch(a.tag){case 31:case 13:return ra===null?Mi():a.alternate===null&&Ne===0&&(Ne=3),a.flags&=-257,a.flags|=65536,a.lanes=r,o===hi?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([o]):t.add(o),Xc(e,o,r)),!1;case 22:return a.flags|=65536,o===hi?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([o])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([o]):a.add(o)),Xc(e,o,r)),!1}throw Error(F(435,a.tag))}return Xc(e,o,r),Mi(),!1}if(oe)return t=Gt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,o!==du&&(e=Error(F(422),{cause:o}),Tl(aa(e,a)))):(o!==du&&(t=Error(F(423),{cause:o}),Tl(aa(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,o=aa(o,a),r=ku(e.stateNode,o,r),Ec(e,r),Ne!==4&&(Ne=2)),!1;var n=Error(F(520),{cause:o});if(n=aa(n,a),vl===null?vl=[n]:vl.push(n),Ne!==4&&(Ne=2),t===null)return!0;o=aa(o,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=ku(a.stateNode,o,e),Ec(a,e),!1;case 1:if(t=a.type,n=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||n!==null&&typeof n.componentDidCatch=="function"&&(Eo===null||!Eo.has(n))))return a.flags|=65536,r&=-r,a.lanes|=r,r=Kg(r),Zg(r,e,a,o),Ec(a,r),!1}a=a.return}while(a!==null);return!1}var kd=Error(F(461)),Ye=!1;function st(e,t,a,o){t.child=e===null?cg(t,null,a,o):ur(t,e.child,a,o)}function Dx(e,t,a,o,r){a=a.render;var n=t.ref;if("ref"in o){var l={};for(var s in o)s!=="ref"&&(l[s]=o[s])}else l=o;return cr(t),o=pd(e,t,a,l,n,r),s=md(),e!==null&&!Ye?(xd(e,t,r),$a(e,t,r)):(oe&&s&&nd(t),t.flags|=1,st(e,t,o,r),t.child)}function Fx(e,t,a,o,r){if(e===null){var n=a.type;return typeof n=="function"&&!rd(n)&&n.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=n,Wg(e,t,n,o,r)):(e=$s(a.type,null,o,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(n=e.child,!Ad(e,r)){var l=n.memoizedProps;if(a=a.compare,a=a!==null?a:Rl,a(l,o)&&e.ref===t.ref)return $a(e,t,r)}return t.flags|=1,e=Va(n,o),e.ref=t.ref,e.return=t,t.child=e}function Wg(e,t,a,o,r){if(e!==null){var n=e.memoizedProps;if(Rl(n,o)&&e.ref===t.ref)if(Ye=!1,t.pendingProps=o=n,Ad(e,r))(e.flags&131072)!==0&&(Ye=!0);else return t.lanes=e.lanes,$a(e,t,r)}return Au(e,t,a,o,r)}function $g(e,t,a,o){var r=o.children,n=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),o.mode==="hidden"){if((t.flags&128)!==0){if(n=n!==null?n.baseLanes|a:a,e!==null){for(o=t.child=e.child,r=0;o!==null;)r=r|o.lanes|o.childLanes,o=o.sibling;o=r&~n}else o=0,t.child=null;return Nx(e,t,n,a,o)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Js(t,n!==null?n.cachePool:null),n!==null?vx(t,n):Iu(),pg(t);else return o=t.lanes=536870912,Nx(e,t,n!==null?n.baseLanes|a:a,a,o)}else n!==null?(Js(t,n.cachePool),vx(t,n),Io(t),t.memoizedState=null):(e!==null&&Js(t,null),Iu(),Io(t));return st(e,t,r,a),t.child}function fl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Nx(e,t,a,o,r){var n=id();return n=n===null?null:{parent:Ve._currentValue,pool:n},t.memoizedState={baseLanes:a,cachePool:n},e!==null&&Js(t,null),Iu(),pg(t),e!==null&&Cn(e,t,o,!0),t.childLanes=r,null}function ai(e,t){return t=Ci({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Bx(e,t,a){return ur(t,e.child,null,a),e=ai(t,t.pendingProps),e.flags|=2,Lt(t),t.memoizedState=null,e}function Xw(e,t,a){var o=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(oe){if(o.mode==="hidden")return e=ai(t,o),t.lanes=536870912,fl(null,e);if(bu(t),(e=we)?(e=Gh(e,oa),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Oo!==null?{id:wa,overflow:Ca}:null,retryLane:536870912,hydrationErrors:null},a=og(e),a.return=t,t.child=a,ft=t,we=null)):e=null,e===null)throw Lo(t);return t.lanes=536870912,null}return ai(t,o)}var n=e.memoizedState;if(n!==null){var l=n.dehydrated;if(bu(t),r)if(t.flags&256)t.flags&=-257,t=Bx(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(F(558));else if(Ye||Cn(e,t,a,!1),r=(a&e.childLanes)!==0,Ye||r){if(o=ge,o!==null&&(l=Ty(o,a),l!==0&&l!==n.retryLane))throw n.retryLane=l,gr(e,l),At(o,e,l),kd;Mi(),t=Bx(e,t,a)}else e=n.treeContext,we=na(l.nextSibling),ft=t,oe=!0,Ro=null,oa=!1,e!==null&&ng(t,e),t=ai(t,o),t.flags|=4096;return t}return e=Va(e.child,{mode:o.mode,children:o.children}),e.ref=t.ref,t.child=e,e.return=t,e}function oi(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(F(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Au(e,t,a,o,r){return cr(t),a=pd(e,t,a,o,void 0,r),o=md(),e!==null&&!Ye?(xd(e,t,r),$a(e,t,r)):(oe&&o&&nd(t),t.flags|=1,st(e,t,a,r),t.child)}function Ox(e,t,a,o,r,n){return cr(t),t.updateQueue=null,a=xg(t,o,a,r),mg(e),o=md(),e!==null&&!Ye?(xd(e,t,n),$a(e,t,n)):(oe&&o&&nd(t),t.flags|=1,st(e,t,a,n),t.child)}function Lx(e,t,a,o,r){if(cr(t),t.stateNode===null){var n=Jr,l=a.contextType;typeof l=="object"&&l!==null&&(n=ct(l)),n=new a(o,n),t.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=Cu,t.stateNode=n,n._reactInternals=t,n=t.stateNode,n.props=o,n.state=t.memoizedState,n.refs={},cd(t),l=a.contextType,n.context=typeof l=="object"&&l!==null?ct(l):Jr,n.state=t.memoizedState,l=a.getDerivedStateFromProps,typeof l=="function"&&(Fc(t,a,l,o),n.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof n.getSnapshotBeforeUpdate=="function"||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(l=n.state,typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount(),l!==n.state&&Cu.enqueueReplaceState(n,n.state,null),gl(t,o,n,r),yl(),n.state=t.memoizedState),typeof n.componentDidMount=="function"&&(t.flags|=4194308),o=!0}else if(e===null){n=t.stateNode;var s=t.memoizedProps,i=pr(a,s);n.props=i;var f=n.context,u=a.contextType;l=Jr,typeof u=="object"&&u!==null&&(l=ct(u));var x=a.getDerivedStateFromProps;u=typeof x=="function"||typeof n.getSnapshotBeforeUpdate=="function",s=t.pendingProps!==s,u||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(s||f!==l)&&Tx(t,n,o,l),yo=!1;var d=t.memoizedState;n.state=d,gl(t,o,n,r),yl(),f=t.memoizedState,s||d!==f||yo?(typeof x=="function"&&(Fc(t,a,x,o),f=t.memoizedState),(i=yo||Mx(t,a,i,o,d,f,l))?(u||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount()),typeof n.componentDidMount=="function"&&(t.flags|=4194308)):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=o,t.memoizedState=f),n.props=o,n.state=f,n.context=l,o=i):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),o=!1)}else{n=t.stateNode,gu(e,t),l=t.memoizedProps,u=pr(a,l),n.props=u,x=t.pendingProps,d=n.context,f=a.contextType,i=Jr,typeof f=="object"&&f!==null&&(i=ct(f)),s=a.getDerivedStateFromProps,(f=typeof s=="function"||typeof n.getSnapshotBeforeUpdate=="function")||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(l!==x||d!==i)&&Tx(t,n,o,i),yo=!1,d=t.memoizedState,n.state=d,gl(t,o,n,r),yl();var p=t.memoizedState;l!==x||d!==p||yo||e!==null&&e.dependencies!==null&&gi(e.dependencies)?(typeof s=="function"&&(Fc(t,a,s,o),p=t.memoizedState),(u=yo||Mx(t,a,u,o,d,p,i)||e!==null&&e.dependencies!==null&&gi(e.dependencies))?(f||typeof n.UNSAFE_componentWillUpdate!="function"&&typeof n.componentWillUpdate!="function"||(typeof n.componentWillUpdate=="function"&&n.componentWillUpdate(o,p,i),typeof n.UNSAFE_componentWillUpdate=="function"&&n.UNSAFE_componentWillUpdate(o,p,i)),typeof n.componentDidUpdate=="function"&&(t.flags|=4),typeof n.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof n.componentDidUpdate!="function"||l===e.memoizedProps&&d===e.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&d===e.memoizedState||(t.flags|=1024),t.memoizedProps=o,t.memoizedState=p),n.props=o,n.state=p,n.context=i,o=u):(typeof n.componentDidUpdate!="function"||l===e.memoizedProps&&d===e.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||l===e.memoizedProps&&d===e.memoizedState||(t.flags|=1024),o=!1)}return n=o,oi(e,t),o=(t.flags&128)!==0,n||o?(n=t.stateNode,a=o&&typeof a.getDerivedStateFromError!="function"?null:n.render(),t.flags|=1,e!==null&&o?(t.child=ur(t,e.child,null,r),t.child=ur(t,null,a,r)):st(e,t,a,r),t.memoizedState=n.state,e=t.child):e=$a(e,t,r),e}function zx(e,t,a,o){return fr(),t.flags|=256,st(e,t,a,o),t.child}var Nc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Bc(e){return{baseLanes:e,cachePool:sg()}}function Oc(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Ht),e}function Jg(e,t,a){var o=t.pendingProps,r=!1,n=(t.flags&128)!==0,l;if((l=n)||(l=e!==null&&e.memoizedState===null?!1:(He.current&2)!==0),l&&(r=!0,t.flags&=-129),l=(t.flags&32)!==0,t.flags&=-33,e===null){if(oe){if(r?ho(t):Io(t),(e=we)?(e=Gh(e,oa),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Oo!==null?{id:wa,overflow:Ca}:null,retryLane:536870912,hydrationErrors:null},a=og(e),a.return=t,t.child=a,ft=t,we=null)):e=null,e===null)throw Lo(t);return Pu(e)?t.lanes=32:t.lanes=536870912,null}var s=o.children;return o=o.fallback,r?(Io(t),r=t.mode,s=Ci({mode:"hidden",children:s},r),o=nr(o,r,a,null),s.return=t,o.return=t,s.sibling=o,t.child=s,o=t.child,o.memoizedState=Bc(a),o.childLanes=Oc(e,l,a),t.memoizedState=Nc,fl(null,o)):(ho(t),Ru(t,s))}var i=e.memoizedState;if(i!==null&&(s=i.dehydrated,s!==null)){if(n)t.flags&256?(ho(t),t.flags&=-257,t=Lc(e,t,a)):t.memoizedState!==null?(Io(t),t.child=e.child,t.flags|=128,t=null):(Io(t),s=o.fallback,r=t.mode,o=Ci({mode:"visible",children:o.children},r),s=nr(s,r,a,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,ur(t,e.child,null,a),o=t.child,o.memoizedState=Bc(a),o.childLanes=Oc(e,l,a),t.memoizedState=Nc,t=fl(null,o));else if(ho(t),Pu(s)){if(l=s.nextSibling&&s.nextSibling.dataset,l)var f=l.dgst;l=f,o=Error(F(419)),o.stack="",o.digest=l,Tl({value:o,source:null,stack:null}),t=Lc(e,t,a)}else if(Ye||Cn(e,t,a,!1),l=(a&e.childLanes)!==0,Ye||l){if(l=ge,l!==null&&(o=Ty(l,a),o!==0&&o!==i.retryLane))throw i.retryLane=o,gr(e,o),At(l,e,o),kd;_u(s)||Mi(),t=Lc(e,t,a)}else _u(s)?(t.flags|=192,t.child=e.child,t=null):(e=i.treeContext,we=na(s.nextSibling),ft=t,oe=!0,Ro=null,oa=!1,e!==null&&ng(t,e),t=Ru(t,o.children),t.flags|=4096);return t}return r?(Io(t),s=o.fallback,r=t.mode,i=e.child,f=i.sibling,o=Va(i,{mode:"hidden",children:o.children}),o.subtreeFlags=i.subtreeFlags&65011712,f!==null?s=Va(f,s):(s=nr(s,r,a,null),s.flags|=2),s.return=t,o.return=t,o.sibling=s,t.child=o,fl(null,o),o=t.child,s=e.child.memoizedState,s===null?s=Bc(a):(r=s.cachePool,r!==null?(i=Ve._currentValue,r=r.parent!==i?{parent:i,pool:i}:r):r=sg(),s={baseLanes:s.baseLanes|a,cachePool:r}),o.memoizedState=s,o.childLanes=Oc(e,l,a),t.memoizedState=Nc,fl(e.child,o)):(ho(t),a=e.child,e=a.sibling,a=Va(a,{mode:"visible",children:o.children}),a.return=t,a.sibling=null,e!==null&&(l=t.deletions,l===null?(t.deletions=[e],t.flags|=16):l.push(e)),t.child=a,t.memoizedState=null,a)}function Ru(e,t){return t=Ci({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Ci(e,t){return e=zt(22,e,null,t),e.lanes=0,e}function Lc(e,t,a){return ur(t,e.child,null,a),e=Ru(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Hx(e,t,a){e.lanes|=t;var o=e.alternate;o!==null&&(o.lanes|=t),mu(e.return,t,a)}function zc(e,t,a,o,r,n){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:o,tail:a,tailMode:r,treeForkCount:n}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=o,l.tail=a,l.tailMode=r,l.treeForkCount=n)}function eh(e,t,a){var o=t.pendingProps,r=o.revealOrder,n=o.tail;o=o.children;var l=He.current,s=(l&2)!==0;if(s?(l=l&1|2,t.flags|=128):l&=1,he(He,l),st(e,t,o,a),o=oe?Ml:0,!s&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Hx(e,a,t);else if(e.tag===19)Hx(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"forwards":for(a=t.child,r=null;a!==null;)e=a.alternate,e!==null&&bi(e)===null&&(r=a),a=a.sibling;a=r,a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),zc(t,!1,r,a,n,o);break;case"backwards":case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&bi(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}zc(t,!0,a,null,n,o);break;case"together":zc(t,!1,null,null,void 0,o);break;default:t.memoizedState=null}return t.child}function $a(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Ho|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Cn(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(F(153));if(t.child!==null){for(e=t.child,a=Va(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Va(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Ad(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&gi(e)))}function Gw(e,t,a){switch(t.tag){case 3:ci(t,t.stateNode.containerInfo),go(t,Ve,e.memoizedState.cache),fr();break;case 27:case 5:tu(t);break;case 4:ci(t,t.stateNode.containerInfo);break;case 10:go(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,bu(t),null;break;case 13:var o=t.memoizedState;if(o!==null)return o.dehydrated!==null?(ho(t),t.flags|=128,null):(a&t.child.childLanes)!==0?Jg(e,t,a):(ho(t),e=$a(e,t,a),e!==null?e.sibling:null);ho(t);break;case 19:var r=(e.flags&128)!==0;if(o=(a&t.childLanes)!==0,o||(Cn(e,t,a,!1),o=(a&t.childLanes)!==0),r){if(o)return eh(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),he(He,He.current),o)break;return null;case 22:return t.lanes=0,$g(e,t,a,t.pendingProps);case 24:go(t,Ve,e.memoizedState.cache)}return $a(e,t,a)}function th(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Ye=!0;else{if(!Ad(e,a)&&(t.flags&128)===0)return Ye=!1,Gw(e,t,a);Ye=(e.flags&131072)!==0}else Ye=!1,oe&&(t.flags&1048576)!==0&&rg(t,Ml,t.index);switch(t.lanes=0,t.tag){case 16:e:{var o=t.pendingProps;if(e=ar(t.elementType),t.type=e,typeof e=="function")rd(e)?(o=pr(e,o),t.tag=1,t=Lx(null,t,e,o,a)):(t.tag=0,t=Au(null,t,e,o,a));else{if(e!=null){var r=e.$$typeof;if(r===Gu){t.tag=11,t=Dx(null,t,e,o,a);break e}else if(r===ju){t.tag=14,t=Fx(null,t,e,o,a);break e}}throw t=Jc(e)||e,Error(F(306,t,""))}}return t;case 0:return Au(e,t,t.type,t.pendingProps,a);case 1:return o=t.type,r=pr(o,t.pendingProps),Lx(e,t,o,r,a);case 3:e:{if(ci(t,t.stateNode.containerInfo),e===null)throw Error(F(387));o=t.pendingProps;var n=t.memoizedState;r=n.element,gu(e,t),gl(t,o,null,a);var l=t.memoizedState;if(o=l.cache,go(t,Ve,o),o!==n.cache&&xu(t,[Ve],a,!0),yl(),o=l.element,n.isDehydrated)if(n={element:o,isDehydrated:!1,cache:l.cache},t.updateQueue.baseState=n,t.memoizedState=n,t.flags&256){t=zx(e,t,o,a);break e}else if(o!==r){r=aa(Error(F(424)),t),Tl(r),t=zx(e,t,o,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,we=na(e.firstChild),ft=t,oe=!0,Ro=null,oa=!0,a=cg(t,null,o,a),t.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(fr(),o===r){t=$a(e,t,a);break e}st(e,t,o,a)}t=t.child}return t;case 26:return oi(e,t),e===null?(a=ly(t.type,null,t.pendingProps,null))?t.memoizedState=a:oe||(a=t.type,e=t.pendingProps,o=Fi(Ao.current).createElement(a),o[it]=t,o[Rt]=e,ut(o,a,e),tt(o),t.stateNode=o):t.memoizedState=ly(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return tu(t),e===null&&oe&&(o=t.stateNode=jh(t.type,t.pendingProps,Ao.current),ft=t,oa=!0,r=we,Po(t.type)?(qu=r,we=na(o.firstChild)):we=r),st(e,t,t.pendingProps.children,a),oi(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&oe&&((r=o=we)&&(o=hC(o,t.type,t.pendingProps,oa),o!==null?(t.stateNode=o,ft=t,we=na(o.firstChild),oa=!1,r=!0):r=!1),r||Lo(t)),tu(t),r=t.type,n=t.pendingProps,l=e!==null?e.memoizedProps:null,o=n.children,zu(r,n)?o=null:l!==null&&zu(r,l)&&(t.flags|=32),t.memoizedState!==null&&(r=pd(e,t,Ow,null,null,a),Ol._currentValue=r),oi(e,t),st(e,t,o,a),t.child;case 6:return e===null&&oe&&((e=a=we)&&(a=IC(a,t.pendingProps,oa),a!==null?(t.stateNode=a,ft=t,we=null,e=!0):e=!1),e||Lo(t)),null;case 13:return Jg(e,t,a);case 4:return ci(t,t.stateNode.containerInfo),o=t.pendingProps,e===null?t.child=ur(t,null,o,a):st(e,t,o,a),t.child;case 11:return Dx(e,t,t.type,t.pendingProps,a);case 7:return st(e,t,t.pendingProps,a),t.child;case 8:return st(e,t,t.pendingProps.children,a),t.child;case 12:return st(e,t,t.pendingProps.children,a),t.child;case 10:return o=t.pendingProps,go(t,t.type,o.value),st(e,t,o.children,a),t.child;case 9:return r=t.type._context,o=t.pendingProps.children,cr(t),r=ct(r),o=o(r),t.flags|=1,st(e,t,o,a),t.child;case 14:return Fx(e,t,t.type,t.pendingProps,a);case 15:return Wg(e,t,t.type,t.pendingProps,a);case 19:return eh(e,t,a);case 31:return Xw(e,t,a);case 22:return $g(e,t,a,t.pendingProps);case 24:return cr(t),o=ct(Ve),e===null?(r=id(),r===null&&(r=ge,n=sd(),r.pooledCache=n,n.refCount++,n!==null&&(r.pooledCacheLanes|=a),r=n),t.memoizedState={parent:o,cache:r},cd(t),go(t,Ve,r)):((e.lanes&a)!==0&&(gu(e,t),gl(t,null,null,a),yl()),r=e.memoizedState,n=t.memoizedState,r.parent!==o?(r={parent:o,cache:o},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),go(t,Ve,o)):(o=n.cache,go(t,Ve,o),o!==r.cache&&xu(t,[Ve],a,!0))),st(e,t,t.pendingProps.children,a),t.child;case 29:throw t.pendingProps}throw Error(F(156,t.tag))}function za(e){e.flags|=4}function Hc(e,t,a,o,r){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(kh())e.flags|=8192;else throw sr=hi,fd}else e.flags&=-16777217}function _x(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Qh(t))if(kh())e.flags|=8192;else throw sr=hi,fd}function qs(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Ay():536870912,e.lanes|=t,gn|=t)}function al(e,t){if(!oe)switch(e.tailMode){case"hidden":t=e.tail;for(var a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null;break;case"collapsed":a=e.tail;for(var o=null;a!==null;)a.alternate!==null&&(o=a),a=a.sibling;o===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null}}function Se(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,o=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,o|=r.subtreeFlags&65011712,o|=r.flags&65011712,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,o|=r.subtreeFlags,o|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=o,e.childLanes=a,t}function jw(e,t,a){var o=t.pendingProps;switch(ld(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Se(t),null;case 1:return Se(t),null;case 3:return a=t.stateNode,o=null,e!==null&&(o=e.memoizedState.cache),t.memoizedState.cache!==o&&(t.flags|=2048),Ya(Ve),un(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(qr(t)?za(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Tc())),Se(t),null;case 26:var r=t.type,n=t.memoizedState;return e===null?(za(t),n!==null?(Se(t),_x(t,n)):(Se(t),Hc(t,r,null,o,a))):n?n!==e.memoizedState?(za(t),Se(t),_x(t,n)):(Se(t),t.flags&=-16777217):(e=e.memoizedProps,e!==o&&za(t),Se(t),Hc(t,r,e,o,a)),null;case 27:if(ui(t),a=Ao.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==o&&za(t);else{if(!o){if(t.stateNode===null)throw Error(F(166));return Se(t),null}e=Aa.current,qr(t)?mx(t,e):(e=jh(r,o,a),t.stateNode=e,za(t))}return Se(t),null;case 5:if(ui(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==o&&za(t);else{if(!o){if(t.stateNode===null)throw Error(F(166));return Se(t),null}if(n=Aa.current,qr(t))mx(t,n);else{var l=Fi(Ao.current);switch(n){case 1:n=l.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:n=l.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":n=l.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":n=l.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":n=l.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild);break;case"select":n=typeof o.is=="string"?l.createElement("select",{is:o.is}):l.createElement("select"),o.multiple?n.multiple=!0:o.size&&(n.size=o.size);break;default:n=typeof o.is=="string"?l.createElement(r,{is:o.is}):l.createElement(r)}}n[it]=t,n[Rt]=o;e:for(l=t.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.tag!==27&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===t)break e;for(;l.sibling===null;){if(l.return===null||l.return===t)break e;l=l.return}l.sibling.return=l.return,l=l.sibling}t.stateNode=n;e:switch(ut(n,r,o),r){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}o&&za(t)}}return Se(t),Hc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==o&&za(t);else{if(typeof o!="string"&&t.stateNode===null)throw Error(F(166));if(e=Ao.current,qr(t)){if(e=t.stateNode,a=t.memoizedProps,o=null,r=ft,r!==null)switch(r.tag){case 27:case 5:o=r.memoizedProps}e[it]=t,e=!!(e.nodeValue===a||o!==null&&o.suppressHydrationWarning===!0||qh(e.nodeValue,a)),e||Lo(t,!0)}else e=Fi(e).createTextNode(o),e[it]=t,t.stateNode=e}return Se(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(o=qr(t),a!==null){if(e===null){if(!o)throw Error(F(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(F(557));e[it]=t}else fr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Se(t),e=!1}else a=Tc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(Lt(t),t):(Lt(t),null);if((t.flags&128)!==0)throw Error(F(558))}return Se(t),null;case 13:if(o=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=qr(t),o!==null&&o.dehydrated!==null){if(e===null){if(!r)throw Error(F(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(F(317));r[it]=t}else fr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Se(t),r=!1}else r=Tc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(Lt(t),t):(Lt(t),null)}return Lt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=o!==null,e=e!==null&&e.memoizedState!==null,a&&(o=t.child,r=null,o.alternate!==null&&o.alternate.memoizedState!==null&&o.alternate.memoizedState.cachePool!==null&&(r=o.alternate.memoizedState.cachePool.pool),n=null,o.memoizedState!==null&&o.memoizedState.cachePool!==null&&(n=o.memoizedState.cachePool.pool),n!==r&&(o.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),qs(t,t.updateQueue),Se(t),null);case 4:return un(),e===null&&Nd(t.stateNode.containerInfo),Se(t),null;case 10:return Ya(t.type),Se(t),null;case 19:if(at(He),o=t.memoizedState,o===null)return Se(t),null;if(r=(t.flags&128)!==0,n=o.rendering,n===null)if(r)al(o,!1);else{if(Ne!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(n=bi(e),n!==null){for(t.flags|=128,al(o,!1),e=n.updateQueue,t.updateQueue=e,qs(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)ag(a,e),a=a.sibling;return he(He,He.current&1|2),oe&&qa(t,o.treeForkCount),t.child}e=e.sibling}o.tail!==null&&_t()>Ai&&(t.flags|=128,r=!0,al(o,!1),t.lanes=4194304)}else{if(!r)if(e=bi(n),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,qs(t,e),al(o,!0),o.tail===null&&o.tailMode==="hidden"&&!n.alternate&&!oe)return Se(t),null}else 2*_t()-o.renderingStartTime>Ai&&a!==536870912&&(t.flags|=128,r=!0,al(o,!1),t.lanes=4194304);o.isBackwards?(n.sibling=t.child,t.child=n):(e=o.last,e!==null?e.sibling=n:t.child=n,o.last=n)}return o.tail!==null?(e=o.tail,o.rendering=e,o.tail=e.sibling,o.renderingStartTime=_t(),e.sibling=null,a=He.current,he(He,r?a&1|2:a&1),oe&&qa(t,o.treeForkCount),e):(Se(t),null);case 22:case 23:return Lt(t),ud(),o=t.memoizedState!==null,e!==null?e.memoizedState!==null!==o&&(t.flags|=8192):o&&(t.flags|=8192),o?(a&536870912)!==0&&(t.flags&128)===0&&(Se(t),t.subtreeFlags&6&&(t.flags|=8192)):Se(t),a=t.updateQueue,a!==null&&qs(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),o=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(o=t.memoizedState.cachePool.pool),o!==a&&(t.flags|=2048),e!==null&&at(lr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Ya(Ve),Se(t),null;case 25:return null;case 30:return null}throw Error(F(156,t.tag))}function Vw(e,t){switch(ld(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Ya(Ve),un(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ui(t),null;case 31:if(t.memoizedState!==null){if(Lt(t),t.alternate===null)throw Error(F(340));fr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Lt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(F(340));fr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return at(He),null;case 4:return un(),null;case 10:return Ya(t.type),null;case 22:case 23:return Lt(t),ud(),e!==null&&at(lr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Ya(Ve),null;case 25:return null;default:return null}}function ah(e,t){switch(ld(t),t.tag){case 3:Ya(Ve),un();break;case 26:case 27:case 5:ui(t);break;case 4:un();break;case 31:t.memoizedState!==null&&Lt(t);break;case 13:Lt(t);break;case 19:at(He);break;case 10:Ya(t.type);break;case 22:case 23:Lt(t),ud(),e!==null&&at(lr);break;case 24:Ya(Ve)}}function Vl(e,t){try{var a=t.updateQueue,o=a!==null?a.lastEffect:null;if(o!==null){var r=o.next;a=r;do{if((a.tag&e)===e){o=void 0;var n=a.create,l=a.inst;o=n(),l.destroy=o}a=a.next}while(a!==r)}}catch(s){de(t,t.return,s)}}function zo(e,t,a){try{var o=t.updateQueue,r=o!==null?o.lastEffect:null;if(r!==null){var n=r.next;o=n;do{if((o.tag&e)===e){var l=o.inst,s=l.destroy;if(s!==void 0){l.destroy=void 0,r=t;var i=a,f=s;try{f()}catch(u){de(r,i,u)}}}o=o.next}while(o!==n)}}catch(u){de(t,t.return,u)}}function oh(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{dg(t,a)}catch(o){de(e,e.return,o)}}}function rh(e,t,a){a.props=pr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(o){de(e,t,o)}}function Il(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var o=e.stateNode;break;case 30:o=e.stateNode;break;default:o=e.stateNode}typeof a=="function"?e.refCleanup=a(o):a.current=o}}catch(r){de(e,t,r)}}function ka(e,t){var a=e.ref,o=e.refCleanup;if(a!==null)if(typeof o=="function")try{o()}catch(r){de(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){de(e,t,r)}else a.current=null}function nh(e){var t=e.type,a=e.memoizedProps,o=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&o.focus();break e;case"img":a.src?o.src=a.src:a.srcSet&&(o.srcset=a.srcSet)}}catch(r){de(e,e.return,r)}}function _c(e,t,a){try{var o=e.stateNode;dC(o,e.type,a,t),o[Rt]=t}catch(r){de(e,e.return,r)}}function lh(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Po(e.type)||e.tag===4}function Pc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||lh(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Po(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Mu(e,t,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(e,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(e),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=Ga));else if(o!==4&&(o===27&&Po(e.type)&&(a=e.stateNode,t=null),e=e.child,e!==null))for(Mu(e,t,a),e=e.sibling;e!==null;)Mu(e,t,a),e=e.sibling}function ki(e,t,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?a.insertBefore(e,t):a.appendChild(e);else if(o!==4&&(o===27&&Po(e.type)&&(a=e.stateNode),e=e.child,e!==null))for(ki(e,t,a),e=e.sibling;e!==null;)ki(e,t,a),e=e.sibling}function sh(e){var t=e.stateNode,a=e.memoizedProps;try{for(var o=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);ut(t,o,a),t[it]=e,t[Rt]=a}catch(n){de(e,e.return,n)}}var Ua=!1,je=!1,qc=!1,Px=typeof WeakSet=="function"?WeakSet:Set,et=null;function Yw(e,t){if(e=e.containerInfo,Ou=Li,e=Qy(e),td(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else e:{a=(a=e.ownerDocument)&&a.defaultView||window;var o=a.getSelection&&a.getSelection();if(o&&o.rangeCount!==0){a=o.anchorNode;var r=o.anchorOffset,n=o.focusNode;o=o.focusOffset;try{a.nodeType,n.nodeType}catch{a=null;break e}var l=0,s=-1,i=-1,f=0,u=0,x=e,d=null;t:for(;;){for(var p;x!==a||r!==0&&x.nodeType!==3||(s=l+r),x!==n||o!==0&&x.nodeType!==3||(i=l+o),x.nodeType===3&&(l+=x.nodeValue.length),(p=x.firstChild)!==null;)d=x,x=p;for(;;){if(x===e)break t;if(d===a&&++f===r&&(s=l),d===n&&++u===o&&(i=l),(p=x.nextSibling)!==null)break;x=d,d=x.parentNode}x=p}a=s===-1||i===-1?null:{start:s,end:i}}else a=null}a=a||{start:0,end:0}}else a=null;for(Lu={focusedElem:e,selectionRange:a},Li=!1,et=t;et!==null;)if(t=et,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,et=e;else for(;et!==null;){switch(t=et,n=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(a=0;a<e.length;a++)r=e[a],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&n!==null){e=void 0,a=t,r=n.memoizedProps,n=n.memoizedState,o=a.stateNode;try{var v=pr(a.type,r);e=o.getSnapshotBeforeUpdate(v,n),o.__reactInternalSnapshotBeforeUpdate=e}catch(k){de(a,a.return,k)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,a=e.nodeType,a===9)Hu(e);else if(a===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Hu(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(F(163))}if(e=t.sibling,e!==null){e.return=t.return,et=e;break}et=t.return}}function ih(e,t,a){var o=a.flags;switch(a.tag){case 0:case 11:case 15:_a(e,a),o&4&&Vl(5,a);break;case 1:if(_a(e,a),o&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(l){de(a,a.return,l)}else{var r=pr(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(l){de(a,a.return,l)}}o&64&&oh(a),o&512&&Il(a,a.return);break;case 3:if(_a(e,a),o&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{dg(e,t)}catch(l){de(a,a.return,l)}}break;case 27:t===null&&o&4&&sh(a);case 26:case 5:_a(e,a),t===null&&o&4&&nh(a),o&512&&Il(a,a.return);break;case 12:_a(e,a);break;case 31:_a(e,a),o&4&&uh(e,a);break;case 13:_a(e,a),o&4&&dh(e,a),o&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=aC.bind(null,a),bC(e,a))));break;case 22:if(o=a.memoizedState!==null||Ua,!o){t=t!==null&&t.memoizedState!==null||je,r=Ua;var n=je;Ua=o,(je=t)&&!n?Pa(e,a,(a.subtreeFlags&8772)!==0):_a(e,a),Ua=r,je=n}break;case 30:break;default:_a(e,a)}}function fh(e){var t=e.alternate;t!==null&&(e.alternate=null,fh(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Ku(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Re=null,Ct=!1;function Ha(e,t,a){for(a=a.child;a!==null;)ch(e,t,a),a=a.sibling}function ch(e,t,a){if(Pt&&typeof Pt.onCommitFiberUnmount=="function")try{Pt.onCommitFiberUnmount(_l,a)}catch{}switch(a.tag){case 26:je||ka(a,t),Ha(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:je||ka(a,t);var o=Re,r=Ct;Po(a.type)&&(Re=a.stateNode,Ct=!1),Ha(e,t,a),wl(a.stateNode),Re=o,Ct=r;break;case 5:je||ka(a,t);case 6:if(o=Re,r=Ct,Re=null,Ha(e,t,a),Re=o,Ct=r,Re!==null)if(Ct)try{(Re.nodeType===9?Re.body:Re.nodeName==="HTML"?Re.ownerDocument.body:Re).removeChild(a.stateNode)}catch(n){de(a,t,n)}else try{Re.removeChild(a.stateNode)}catch(n){de(a,t,n)}break;case 18:Re!==null&&(Ct?(e=Re,ty(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),vn(e)):ty(Re,a.stateNode));break;case 4:o=Re,r=Ct,Re=a.stateNode.containerInfo,Ct=!0,Ha(e,t,a),Re=o,Ct=r;break;case 0:case 11:case 14:case 15:zo(2,a,t),je||zo(4,a,t),Ha(e,t,a);break;case 1:je||(ka(a,t),o=a.stateNode,typeof o.componentWillUnmount=="function"&&rh(a,t,o)),Ha(e,t,a);break;case 21:Ha(e,t,a);break;case 22:je=(o=je)||a.memoizedState!==null,Ha(e,t,a),je=o;break;default:Ha(e,t,a)}}function uh(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{vn(e)}catch(a){de(t,t.return,a)}}}function dh(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{vn(e)}catch(a){de(t,t.return,a)}}function Qw(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Px),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Px),t;default:throw Error(F(435,e.tag))}}function Us(e,t){var a=Qw(e);t.forEach(function(o){if(!a.has(o)){a.add(o);var r=oC.bind(null,e,o);o.then(r,r)}})}function St(e,t){var a=t.deletions;if(a!==null)for(var o=0;o<a.length;o++){var r=a[o],n=e,l=t,s=l;e:for(;s!==null;){switch(s.tag){case 27:if(Po(s.type)){Re=s.stateNode,Ct=!1;break e}break;case 5:Re=s.stateNode,Ct=!1;break e;case 3:case 4:Re=s.stateNode.containerInfo,Ct=!0;break e}s=s.return}if(Re===null)throw Error(F(160));ch(n,l,r),Re=null,Ct=!1,n=r.alternate,n!==null&&(n.return=null),r.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ph(t,e),t=t.sibling}var ma=null;function ph(e,t){var a=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:St(t,e),wt(e),o&4&&(zo(3,e,e.return),Vl(3,e),zo(5,e,e.return));break;case 1:St(t,e),wt(e),o&512&&(je||a===null||ka(a,a.return)),o&64&&Ua&&(e=e.updateQueue,e!==null&&(o=e.callbacks,o!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?o:a.concat(o))));break;case 26:var r=ma;if(St(t,e),wt(e),o&512&&(je||a===null||ka(a,a.return)),o&4){var n=a!==null?a.memoizedState:null;if(o=e.memoizedState,a===null)if(o===null)if(e.stateNode===null){e:{o=e.type,a=e.memoizedProps,r=r.ownerDocument||r;t:switch(o){case"title":n=r.getElementsByTagName("title")[0],(!n||n[Ul]||n[it]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=r.createElement(o),r.head.insertBefore(n,r.querySelector("head > title"))),ut(n,o,a),n[it]=e,tt(n),o=n;break e;case"link":var l=iy("link","href",r).get(o+(a.href||""));if(l){for(var s=0;s<l.length;s++)if(n=l[s],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(s,1);break t}}n=r.createElement(o),ut(n,o,a),r.head.appendChild(n);break;case"meta":if(l=iy("meta","content",r).get(o+(a.content||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(s,1);break t}}n=r.createElement(o),ut(n,o,a),r.head.appendChild(n);break;default:throw Error(F(468,o))}n[it]=e,tt(n),o=n}e.stateNode=o}else fy(r,e.type,e.stateNode);else e.stateNode=sy(r,o,e.memoizedProps);else n!==o?(n===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):n.count--,o===null?fy(r,e.type,e.stateNode):sy(r,o,e.memoizedProps)):o===null&&e.stateNode!==null&&_c(e,e.memoizedProps,a.memoizedProps)}break;case 27:St(t,e),wt(e),o&512&&(je||a===null||ka(a,a.return)),a!==null&&o&4&&_c(e,e.memoizedProps,a.memoizedProps);break;case 5:if(St(t,e),wt(e),o&512&&(je||a===null||ka(a,a.return)),e.flags&32){r=e.stateNode;try{pn(r,"")}catch(v){de(e,e.return,v)}}o&4&&e.stateNode!=null&&(r=e.memoizedProps,_c(e,r,a!==null?a.memoizedProps:r)),o&1024&&(qc=!0);break;case 6:if(St(t,e),wt(e),o&4){if(e.stateNode===null)throw Error(F(162));o=e.memoizedProps,a=e.stateNode;try{a.nodeValue=o}catch(v){de(e,e.return,v)}}break;case 3:if(li=null,r=ma,ma=Ni(t.containerInfo),St(t,e),ma=r,wt(e),o&4&&a!==null&&a.memoizedState.isDehydrated)try{vn(t.containerInfo)}catch(v){de(e,e.return,v)}qc&&(qc=!1,mh(e));break;case 4:o=ma,ma=Ni(e.stateNode.containerInfo),St(t,e),wt(e),ma=o;break;case 12:St(t,e),wt(e);break;case 31:St(t,e),wt(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Us(e,o)));break;case 13:St(t,e),wt(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Ki=_t()),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Us(e,o)));break;case 22:r=e.memoizedState!==null;var i=a!==null&&a.memoizedState!==null,f=Ua,u=je;if(Ua=f||r,je=u||i,St(t,e),je=u,Ua=f,wt(e),o&8192)e:for(t=e.stateNode,t._visibility=r?t._visibility&-2:t._visibility|1,r&&(a===null||i||Ua||je||or(e)),a=null,t=e;;){if(t.tag===5||t.tag===26){if(a===null){i=a=t;try{if(n=i.stateNode,r)l=n.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none";else{s=i.stateNode;var x=i.memoizedProps.style,d=x!=null&&x.hasOwnProperty("display")?x.display:null;s.style.display=d==null||typeof d=="boolean"?"":(""+d).trim()}}catch(v){de(i,i.return,v)}}}else if(t.tag===6){if(a===null){i=t;try{i.stateNode.nodeValue=r?"":i.memoizedProps}catch(v){de(i,i.return,v)}}}else if(t.tag===18){if(a===null){i=t;try{var p=i.stateNode;r?ay(p,!0):ay(i.stateNode,!1)}catch(v){de(i,i.return,v)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;a===t&&(a=null),t=t.return}a===t&&(a=null),t.sibling.return=t.return,t=t.sibling}o&4&&(o=e.updateQueue,o!==null&&(a=o.retryQueue,a!==null&&(o.retryQueue=null,Us(e,a))));break;case 19:St(t,e),wt(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Us(e,o)));break;case 30:break;case 21:break;default:St(t,e),wt(e)}}function wt(e){var t=e.flags;if(t&2){try{for(var a,o=e.return;o!==null;){if(lh(o)){a=o;break}o=o.return}if(a==null)throw Error(F(160));switch(a.tag){case 27:var r=a.stateNode,n=Pc(e);ki(e,n,r);break;case 5:var l=a.stateNode;a.flags&32&&(pn(l,""),a.flags&=-33);var s=Pc(e);ki(e,s,l);break;case 3:case 4:var i=a.stateNode.containerInfo,f=Pc(e);Mu(e,f,i);break;default:throw Error(F(161))}}catch(u){de(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function mh(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;mh(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function _a(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)ih(e,t.alternate,t),t=t.sibling}function or(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:zo(4,t,t.return),or(t);break;case 1:ka(t,t.return);var a=t.stateNode;typeof a.componentWillUnmount=="function"&&rh(t,t.return,a),or(t);break;case 27:wl(t.stateNode);case 26:case 5:ka(t,t.return),or(t);break;case 22:t.memoizedState===null&&or(t);break;case 30:or(t);break;default:or(t)}e=e.sibling}}function Pa(e,t,a){for(a=a&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var o=t.alternate,r=e,n=t,l=n.flags;switch(n.tag){case 0:case 11:case 15:Pa(r,n,a),Vl(4,n);break;case 1:if(Pa(r,n,a),o=n,r=o.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(f){de(o,o.return,f)}if(o=n,r=o.updateQueue,r!==null){var s=o.stateNode;try{var i=r.shared.hiddenCallbacks;if(i!==null)for(r.shared.hiddenCallbacks=null,r=0;r<i.length;r++)ug(i[r],s)}catch(f){de(o,o.return,f)}}a&&l&64&&oh(n),Il(n,n.return);break;case 27:sh(n);case 26:case 5:Pa(r,n,a),a&&o===null&&l&4&&nh(n),Il(n,n.return);break;case 12:Pa(r,n,a);break;case 31:Pa(r,n,a),a&&l&4&&uh(r,n);break;case 13:Pa(r,n,a),a&&l&4&&dh(r,n);break;case 22:n.memoizedState===null&&Pa(r,n,a),Il(n,n.return);break;case 30:break;default:Pa(r,n,a)}t=t.sibling}}function Rd(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Gl(a))}function Md(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gl(e))}function pa(e,t,a,o){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)xh(e,t,a,o),t=t.sibling}function xh(e,t,a,o){var r=t.flags;switch(t.tag){case 0:case 11:case 15:pa(e,t,a,o),r&2048&&Vl(9,t);break;case 1:pa(e,t,a,o);break;case 3:pa(e,t,a,o),r&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gl(e)));break;case 12:if(r&2048){pa(e,t,a,o),e=t.stateNode;try{var n=t.memoizedProps,l=n.id,s=n.onPostCommit;typeof s=="function"&&s(l,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(i){de(t,t.return,i)}}else pa(e,t,a,o);break;case 31:pa(e,t,a,o);break;case 13:pa(e,t,a,o);break;case 23:break;case 22:n=t.stateNode,l=t.alternate,t.memoizedState!==null?n._visibility&2?pa(e,t,a,o):bl(e,t):n._visibility&2?pa(e,t,a,o):(n._visibility|=2,Xr(e,t,a,o,(t.subtreeFlags&10256)!==0||!1)),r&2048&&Rd(l,t);break;case 24:pa(e,t,a,o),r&2048&&Md(t.alternate,t);break;default:pa(e,t,a,o)}}function Xr(e,t,a,o,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var n=e,l=t,s=a,i=o,f=l.flags;switch(l.tag){case 0:case 11:case 15:Xr(n,l,s,i,r),Vl(8,l);break;case 23:break;case 22:var u=l.stateNode;l.memoizedState!==null?u._visibility&2?Xr(n,l,s,i,r):bl(n,l):(u._visibility|=2,Xr(n,l,s,i,r)),r&&f&2048&&Rd(l.alternate,l);break;case 24:Xr(n,l,s,i,r),r&&f&2048&&Md(l.alternate,l);break;default:Xr(n,l,s,i,r)}t=t.sibling}}function bl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,o=t,r=o.flags;switch(o.tag){case 22:bl(a,o),r&2048&&Rd(o.alternate,o);break;case 24:bl(a,o),r&2048&&Md(o.alternate,o);break;default:bl(a,o)}t=t.sibling}}var cl=8192;function Ur(e,t,a){if(e.subtreeFlags&cl)for(e=e.child;e!==null;)yh(e,t,a),e=e.sibling}function yh(e,t,a){switch(e.tag){case 26:Ur(e,t,a),e.flags&cl&&e.memoizedState!==null&&FC(a,ma,e.memoizedState,e.memoizedProps);break;case 5:Ur(e,t,a);break;case 3:case 4:var o=ma;ma=Ni(e.stateNode.containerInfo),Ur(e,t,a),ma=o;break;case 22:e.memoizedState===null&&(o=e.alternate,o!==null&&o.memoizedState!==null?(o=cl,cl=16777216,Ur(e,t,a),cl=o):Ur(e,t,a));break;default:Ur(e,t,a)}}function gh(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ol(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var o=t[a];et=o,Ih(o,e)}gh(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)hh(e),e=e.sibling}function hh(e){switch(e.tag){case 0:case 11:case 15:ol(e),e.flags&2048&&zo(9,e,e.return);break;case 3:ol(e);break;case 12:ol(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,ri(e)):ol(e);break;default:ol(e)}}function ri(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var o=t[a];et=o,Ih(o,e)}gh(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:zo(8,t,t.return),ri(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,ri(t));break;default:ri(t)}e=e.sibling}}function Ih(e,t){for(;et!==null;){var a=et;switch(a.tag){case 0:case 11:case 15:zo(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var o=a.memoizedState.cachePool.pool;o!=null&&o.refCount++}break;case 24:Gl(a.memoizedState.cache)}if(o=a.child,o!==null)o.return=a,et=o;else e:for(a=e;et!==null;){o=et;var r=o.sibling,n=o.return;if(fh(o),o===a){et=null;break e}if(r!==null){r.return=n,et=r;break e}et=n}}}var Kw={getCacheForType:function(e){var t=ct(Ve),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return ct(Ve).controller.signal}},Zw=typeof WeakMap=="function"?WeakMap:Map,ie=0,ge=null,te=null,ae=0,ue=0,Ot=null,wo=!1,An=!1,Td=!1,Ja=0,Ne=0,Ho=0,ir=0,Ed=0,Ht=0,gn=0,vl=null,kt=null,Tu=!1,Ki=0,bh=0,Ai=1/0,Ri=null,Eo=null,Qe=0,Do=null,hn=null,Qa=0,Eu=0,Du=null,vh=null,Sl=0,Fu=null;function Ut(){return(ie&2)!==0&&ae!==0?ae&-ae:j.T!==null?Fd():Ey()}function Sh(){if(Ht===0)if((ae&536870912)===0||oe){var e=Fs;Fs<<=1,(Fs&3932160)===0&&(Fs=262144),Ht=e}else Ht=536870912;return e=Gt.current,e!==null&&(e.flags|=32),Ht}function At(e,t,a){(e===ge&&(ue===2||ue===9)||e.cancelPendingCommit!==null)&&(In(e,0),Co(e,ae,Ht,!1)),ql(e,a),((ie&2)===0||e!==ge)&&(e===ge&&((ie&2)===0&&(ir|=a),Ne===4&&Co(e,ae,Ht,!1)),Ma(e))}function wh(e,t,a){if((ie&6)!==0)throw Error(F(327));var o=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Pl(e,t),r=o?Jw(e,t):Uc(e,t,!0),n=o;do{if(r===0){An&&!o&&Co(e,t,0,!1);break}else{if(a=e.current.alternate,n&&!Ww(a)){r=Uc(e,t,!1),n=!1;continue}if(r===2){if(n=t,e.errorRecoveryDisabledLanes&n)var l=0;else l=e.pendingLanes&-536870913,l=l!==0?l:l&536870912?536870912:0;if(l!==0){t=l;e:{var s=e;r=vl;var i=s.current.memoizedState.isDehydrated;if(i&&(In(s,l).flags|=256),l=Uc(s,l,!1),l!==2){if(Td&&!i){s.errorRecoveryDisabledLanes|=n,ir|=n,r=4;break e}n=kt,kt=r,n!==null&&(kt===null?kt=n:kt.push.apply(kt,n))}r=l}if(n=!1,r!==2)continue}}if(r===1){In(e,0),Co(e,t,0,!0);break}e:{switch(o=e,n=r,n){case 0:case 1:throw Error(F(345));case 4:if((t&4194048)!==t)break;case 6:Co(o,t,Ht,!wo);break e;case 2:kt=null;break;case 3:case 5:break;default:throw Error(F(329))}if((t&62914560)===t&&(r=Ki+300-_t(),10<r)){if(Co(o,t,Ht,!wo),Hi(o,0,!0)!==0)break e;Qa=t,o.timeoutHandle=Xh(qx.bind(null,o,a,kt,Ri,Tu,t,Ht,ir,gn,wo,n,"Throttled",-0,0),r);break e}qx(o,a,kt,Ri,Tu,t,Ht,ir,gn,wo,n,null,-0,0)}}break}while(!0);Ma(e)}function qx(e,t,a,o,r,n,l,s,i,f,u,x,d,p){if(e.timeoutHandle=-1,x=t.subtreeFlags,x&8192||(x&16785408)===16785408){x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Ga},yh(t,n,x);var v=(n&62914560)===n?Ki-_t():(n&4194048)===n?bh-_t():0;if(v=NC(x,v),v!==null){Qa=n,e.cancelPendingCommit=v(Xx.bind(null,e,t,n,a,o,r,l,s,i,u,x,null,d,p)),Co(e,n,l,!f);return}}Xx(e,t,n,a,o,r,l,s,i)}function Ww(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var o=0;o<a.length;o++){var r=a[o],n=r.getSnapshot;r=r.value;try{if(!Xt(n(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Co(e,t,a,o){t&=~Ed,t&=~ir,e.suspendedLanes|=t,e.pingedLanes&=~t,o&&(e.warmLanes|=t),o=e.expirationTimes;for(var r=t;0<r;){var n=31-qt(r),l=1<<n;o[n]=-1,r&=~l}a!==0&&Ry(e,a,t)}function Zi(){return(ie&6)===0?(Yl(0,!1),!1):!0}function Dd(){if(te!==null){if(ue===0)var e=te.return;else e=te,ja=hr=null,yd(e),sn=null,El=0,e=te;for(;e!==null;)ah(e.alternate,e),e=e.return;te=null}}function In(e,t){var a=e.timeoutHandle;a!==-1&&(e.timeoutHandle=-1,xC(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Qa=0,Dd(),ge=e,te=a=Va(e.current,null),ae=t,ue=0,Ot=null,wo=!1,An=Pl(e,t),Td=!1,gn=Ht=Ed=ir=Ho=Ne=0,kt=vl=null,Tu=!1,(t&8)!==0&&(t|=t&32);var o=e.entangledLanes;if(o!==0)for(e=e.entanglements,o&=t;0<o;){var r=31-qt(o),n=1<<r;t|=e[r],o&=~n}return Ja=t,Ui(),a}function Ch(e,t){Q=null,j.H=Fl,t===kn||t===Gi?(t=Ix(),ue=3):t===fd?(t=Ix(),ue=4):ue=t===kd?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ot=t,te===null&&(Ne=1,wi(e,aa(t,e.current)))}function kh(){var e=Gt.current;return e===null?!0:(ae&4194048)===ae?ra===null:(ae&62914560)===ae||(ae&536870912)!==0?e===ra:!1}function Ah(){var e=j.H;return j.H=Fl,e===null?Fl:e}function Rh(){var e=j.A;return j.A=Kw,e}function Mi(){Ne=4,wo||(ae&4194048)!==ae&&Gt.current!==null||(An=!0),(Ho&134217727)===0&&(ir&134217727)===0||ge===null||Co(ge,ae,Ht,!1)}function Uc(e,t,a){var o=ie;ie|=2;var r=Ah(),n=Rh();(ge!==e||ae!==t)&&(Ri=null,In(e,t)),t=!1;var l=Ne;e:do try{if(ue!==0&&te!==null){var s=te,i=Ot;switch(ue){case 8:Dd(),l=6;break e;case 3:case 2:case 9:case 6:Gt.current===null&&(t=!0);var f=ue;if(ue=0,Ot=null,an(e,s,i,f),a&&An){l=0;break e}break;default:f=ue,ue=0,Ot=null,an(e,s,i,f)}}$w(),l=Ne;break}catch(u){Ch(e,u)}while(!0);return t&&e.shellSuspendCounter++,ja=hr=null,ie=o,j.H=r,j.A=n,te===null&&(ge=null,ae=0,Ui()),l}function $w(){for(;te!==null;)Mh(te)}function Jw(e,t){var a=ie;ie|=2;var o=Ah(),r=Rh();ge!==e||ae!==t?(Ri=null,Ai=_t()+500,In(e,t)):An=Pl(e,t);e:do try{if(ue!==0&&te!==null){t=te;var n=Ot;t:switch(ue){case 1:ue=0,Ot=null,an(e,t,n,1);break;case 2:case 9:if(hx(n)){ue=0,Ot=null,Ux(t);break}t=function(){ue!==2&&ue!==9||ge!==e||(ue=7),Ma(e)},n.then(t,t);break e;case 3:ue=7;break e;case 4:ue=5;break e;case 7:hx(n)?(ue=0,Ot=null,Ux(t)):(ue=0,Ot=null,an(e,t,n,7));break;case 5:var l=null;switch(te.tag){case 26:l=te.memoizedState;case 5:case 27:var s=te;if(l?Qh(l):s.stateNode.complete){ue=0,Ot=null;var i=s.sibling;if(i!==null)te=i;else{var f=s.return;f!==null?(te=f,Wi(f)):te=null}break t}}ue=0,Ot=null,an(e,t,n,5);break;case 6:ue=0,Ot=null,an(e,t,n,6);break;case 8:Dd(),Ne=6;break e;default:throw Error(F(462))}}eC();break}catch(u){Ch(e,u)}while(!0);return ja=hr=null,j.H=o,j.A=r,ie=a,te!==null?0:(ge=null,ae=0,Ui(),Ne)}function eC(){for(;te!==null&&!wS();)Mh(te)}function Mh(e){var t=th(e.alternate,e,Ja);e.memoizedProps=e.pendingProps,t===null?Wi(e):te=t}function Ux(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Ox(a,t,t.pendingProps,t.type,void 0,ae);break;case 11:t=Ox(a,t,t.pendingProps,t.type.render,t.ref,ae);break;case 5:yd(t);default:ah(a,t),t=te=ag(t,Ja),t=th(a,t,Ja)}e.memoizedProps=e.pendingProps,t===null?Wi(e):te=t}function an(e,t,a,o){ja=hr=null,yd(t),sn=null,El=0;var r=t.return;try{if(Uw(e,r,t,a,ae)){Ne=1,wi(e,aa(a,e.current)),te=null;return}}catch(n){if(r!==null)throw te=r,n;Ne=1,wi(e,aa(a,e.current)),te=null;return}t.flags&32768?(oe||o===1?e=!0:An||(ae&536870912)!==0?e=!1:(wo=e=!0,(o===2||o===9||o===3||o===6)&&(o=Gt.current,o!==null&&o.tag===13&&(o.flags|=16384))),Th(t,e)):Wi(t)}function Wi(e){var t=e;do{if((t.flags&32768)!==0){Th(t,wo);return}e=t.return;var a=jw(t.alternate,t,Ja);if(a!==null){te=a;return}if(t=t.sibling,t!==null){te=t;return}te=t=e}while(t!==null);Ne===0&&(Ne=5)}function Th(e,t){do{var a=Vw(e.alternate,e);if(a!==null){a.flags&=32767,te=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){te=e;return}te=e=a}while(e!==null);Ne=6,te=null}function Xx(e,t,a,o,r,n,l,s,i){e.cancelPendingCommit=null;do $i();while(Qe!==0);if((ie&6)!==0)throw Error(F(327));if(t!==null){if(t===e.current)throw Error(F(177));if(n=t.lanes|t.childLanes,n|=ad,NS(e,a,n,l,s,i),e===ge&&(te=ge=null,ae=0),hn=t,Do=e,Qa=a,Eu=n,Du=r,vh=o,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,rC(di,function(){return Bh(),null})):(e.callbackNode=null,e.callbackPriority=0),o=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||o){o=j.T,j.T=null,r=fe.p,fe.p=2,l=ie,ie|=4;try{Yw(e,t,a)}finally{ie=l,fe.p=r,j.T=o}}Qe=1,Eh(),Dh(),Fh()}}function Eh(){if(Qe===1){Qe=0;var e=Do,t=hn,a=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||a){a=j.T,j.T=null;var o=fe.p;fe.p=2;var r=ie;ie|=4;try{ph(t,e);var n=Lu,l=Qy(e.containerInfo),s=n.focusedElem,i=n.selectionRange;if(l!==s&&s&&s.ownerDocument&&Yy(s.ownerDocument.documentElement,s)){if(i!==null&&td(s)){var f=i.start,u=i.end;if(u===void 0&&(u=f),"selectionStart"in s)s.selectionStart=f,s.selectionEnd=Math.min(u,s.value.length);else{var x=s.ownerDocument||document,d=x&&x.defaultView||window;if(d.getSelection){var p=d.getSelection(),v=s.textContent.length,k=Math.min(i.start,v),D=i.end===void 0?k:Math.min(i.end,v);!p.extend&&k>D&&(l=D,D=k,k=l);var y=ux(s,k),c=ux(s,D);if(y&&c&&(p.rangeCount!==1||p.anchorNode!==y.node||p.anchorOffset!==y.offset||p.focusNode!==c.node||p.focusOffset!==c.offset)){var m=x.createRange();m.setStart(y.node,y.offset),p.removeAllRanges(),k>D?(p.addRange(m),p.extend(c.node,c.offset)):(m.setEnd(c.node,c.offset),p.addRange(m))}}}}for(x=[],p=s;p=p.parentNode;)p.nodeType===1&&x.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<x.length;s++){var g=x[s];g.element.scrollLeft=g.left,g.element.scrollTop=g.top}}Li=!!Ou,Lu=Ou=null}finally{ie=r,fe.p=o,j.T=a}}e.current=t,Qe=2}}function Dh(){if(Qe===2){Qe=0;var e=Do,t=hn,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=j.T,j.T=null;var o=fe.p;fe.p=2;var r=ie;ie|=4;try{ih(e,t.alternate,t)}finally{ie=r,fe.p=o,j.T=a}}Qe=3}}function Fh(){if(Qe===4||Qe===3){Qe=0,CS();var e=Do,t=hn,a=Qa,o=vh;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?Qe=5:(Qe=0,hn=Do=null,Nh(e,e.pendingLanes));var r=e.pendingLanes;if(r===0&&(Eo=null),Qu(a),t=t.stateNode,Pt&&typeof Pt.onCommitFiberRoot=="function")try{Pt.onCommitFiberRoot(_l,t,void 0,(t.current.flags&128)===128)}catch{}if(o!==null){t=j.T,r=fe.p,fe.p=2,j.T=null;try{for(var n=e.onRecoverableError,l=0;l<o.length;l++){var s=o[l];n(s.value,{componentStack:s.stack})}}finally{j.T=t,fe.p=r}}(Qa&3)!==0&&$i(),Ma(e),r=e.pendingLanes,(a&261930)!==0&&(r&42)!==0?e===Fu?Sl++:(Sl=0,Fu=e):Sl=0,Yl(0,!1)}}function Nh(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Gl(t)))}function $i(){return Eh(),Dh(),Fh(),Bh()}function Bh(){if(Qe!==5)return!1;var e=Do,t=Eu;Eu=0;var a=Qu(Qa),o=j.T,r=fe.p;try{fe.p=32>a?32:a,j.T=null,a=Du,Du=null;var n=Do,l=Qa;if(Qe=0,hn=Do=null,Qa=0,(ie&6)!==0)throw Error(F(331));var s=ie;if(ie|=4,hh(n.current),xh(n,n.current,l,a),ie=s,Yl(0,!1),Pt&&typeof Pt.onPostCommitFiberRoot=="function")try{Pt.onPostCommitFiberRoot(_l,n)}catch{}return!0}finally{fe.p=r,j.T=o,Nh(e,t)}}function Gx(e,t,a){t=aa(a,t),t=ku(e.stateNode,t,2),e=To(e,t,2),e!==null&&(ql(e,2),Ma(e))}function de(e,t,a){if(e.tag===3)Gx(e,e,a);else for(;t!==null;){if(t.tag===3){Gx(t,e,a);break}else if(t.tag===1){var o=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Eo===null||!Eo.has(o))){e=aa(a,e),a=Kg(2),o=To(t,a,2),o!==null&&(Zg(a,o,t,e),ql(o,2),Ma(o));break}}t=t.return}}function Xc(e,t,a){var o=e.pingCache;if(o===null){o=e.pingCache=new Zw;var r=new Set;o.set(t,r)}else r=o.get(t),r===void 0&&(r=new Set,o.set(t,r));r.has(a)||(Td=!0,r.add(a),e=tC.bind(null,e,t,a),t.then(e,e))}function tC(e,t,a){var o=e.pingCache;o!==null&&o.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,ge===e&&(ae&a)===a&&(Ne===4||Ne===3&&(ae&62914560)===ae&&300>_t()-Ki?(ie&2)===0&&In(e,0):Ed|=a,gn===ae&&(gn=0)),Ma(e)}function Oh(e,t){t===0&&(t=Ay()),e=gr(e,t),e!==null&&(ql(e,t),Ma(e))}function aC(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Oh(e,a)}function oC(e,t){var a=0;switch(e.tag){case 31:case 13:var o=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:o=e.stateNode;break;case 22:o=e.stateNode._retryCache;break;default:throw Error(F(314))}o!==null&&o.delete(t),Oh(e,a)}function rC(e,t){return Vu(e,t)}var Ti=null,Gr=null,Nu=!1,Ei=!1,Gc=!1,ko=0;function Ma(e){e!==Gr&&e.next===null&&(Gr===null?Ti=Gr=e:Gr=Gr.next=e),Ei=!0,Nu||(Nu=!0,lC())}function Yl(e,t){if(!Gc&&Ei){Gc=!0;do for(var a=!1,o=Ti;o!==null;){if(!t)if(e!==0){var r=o.pendingLanes;if(r===0)var n=0;else{var l=o.suspendedLanes,s=o.pingedLanes;n=(1<<31-qt(42|e)+1)-1,n&=r&~(l&~s),n=n&201326741?n&201326741|1:n?n|2:0}n!==0&&(a=!0,jx(o,n))}else n=ae,n=Hi(o,o===ge?n:0,o.cancelPendingCommit!==null||o.timeoutHandle!==-1),(n&3)===0||Pl(o,n)||(a=!0,jx(o,n));o=o.next}while(a);Gc=!1}}function nC(){Lh()}function Lh(){Ei=Nu=!1;var e=0;ko!==0&&mC()&&(e=ko);for(var t=_t(),a=null,o=Ti;o!==null;){var r=o.next,n=zh(o,t);n===0?(o.next=null,a===null?Ti=r:a.next=r,r===null&&(Gr=a)):(a=o,(e!==0||(n&3)!==0)&&(Ei=!0)),o=r}Qe!==0&&Qe!==5||Yl(e,!1),ko!==0&&(ko=0)}function zh(e,t){for(var a=e.suspendedLanes,o=e.pingedLanes,r=e.expirationTimes,n=e.pendingLanes&-62914561;0<n;){var l=31-qt(n),s=1<<l,i=r[l];i===-1?((s&a)===0||(s&o)!==0)&&(r[l]=FS(s,t)):i<=t&&(e.expiredLanes|=s),n&=~s}if(t=ge,a=ae,a=Hi(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o=e.callbackNode,a===0||e===t&&(ue===2||ue===9)||e.cancelPendingCommit!==null)return o!==null&&o!==null&&Ic(o),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Pl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(o!==null&&Ic(o),Qu(a)){case 2:case 8:a=Cy;break;case 32:a=di;break;case 268435456:a=ky;break;default:a=di}return o=Hh.bind(null,e),a=Vu(a,o),e.callbackPriority=t,e.callbackNode=a,t}return o!==null&&o!==null&&Ic(o),e.callbackPriority=2,e.callbackNode=null,2}function Hh(e,t){if(Qe!==0&&Qe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if($i()&&e.callbackNode!==a)return null;var o=ae;return o=Hi(e,e===ge?o:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o===0?null:(wh(e,o,t),zh(e,_t()),e.callbackNode!=null&&e.callbackNode===a?Hh.bind(null,e):null)}function jx(e,t){if($i())return null;wh(e,t,!0)}function lC(){yC(function(){(ie&6)!==0?Vu(wy,nC):Lh()})}function Fd(){if(ko===0){var e=mn;e===0&&(e=Ds,Ds<<=1,(Ds&261888)===0&&(Ds=256)),ko=e}return ko}function Vx(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Ks(""+e)}function Yx(e,t){var a=t.ownerDocument.createElement("input");return a.name=t.name,a.value=t.value,e.id&&a.setAttribute("form",e.id),t.parentNode.insertBefore(a,t),e=new FormData(e),a.parentNode.removeChild(a),e}function sC(e,t,a,o,r){if(t==="submit"&&a&&a.stateNode===r){var n=Vx((r[Rt]||null).action),l=o.submitter;l&&(t=(t=l[Rt]||null)?Vx(t.formAction):l.getAttribute("formAction"),t!==null&&(n=t,l=null));var s=new _i("action","action",null,o,r);e.push({event:s,listeners:[{instance:null,listener:function(){if(o.defaultPrevented){if(ko!==0){var i=l?Yx(r,l):new FormData(r);wu(a,{pending:!0,data:i,method:r.method,action:n},null,i)}}else typeof n=="function"&&(s.preventDefault(),i=l?Yx(r,l):new FormData(r),wu(a,{pending:!0,data:i,method:r.method,action:n},n,i))},currentTarget:r}]})}}for(Xs=0;Xs<uu.length;Xs++)Gs=uu[Xs],Qx=Gs.toLowerCase(),Kx=Gs[0].toUpperCase()+Gs.slice(1),xa(Qx,"on"+Kx);var Gs,Qx,Kx,Xs;xa(Zy,"onAnimationEnd");xa(Wy,"onAnimationIteration");xa($y,"onAnimationStart");xa("dblclick","onDoubleClick");xa("focusin","onFocus");xa("focusout","onBlur");xa(kw,"onTransitionRun");xa(Aw,"onTransitionStart");xa(Rw,"onTransitionCancel");xa(Jy,"onTransitionEnd");dn("onMouseEnter",["mouseout","mouseover"]);dn("onMouseLeave",["mouseout","mouseover"]);dn("onPointerEnter",["pointerout","pointerover"]);dn("onPointerLeave",["pointerout","pointerover"]);mr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));mr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));mr("onBeforeInput",["compositionend","keypress","textInput","paste"]);mr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));mr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));mr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Nl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),iC=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Nl));function _h(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var o=e[a],r=o.event;o=o.listeners;e:{var n=void 0;if(t)for(var l=o.length-1;0<=l;l--){var s=o[l],i=s.instance,f=s.currentTarget;if(s=s.listener,i!==n&&r.isPropagationStopped())break e;n=s,r.currentTarget=f;try{n(r)}catch(u){mi(u)}r.currentTarget=null,n=i}else for(l=0;l<o.length;l++){if(s=o[l],i=s.instance,f=s.currentTarget,s=s.listener,i!==n&&r.isPropagationStopped())break e;n=s,r.currentTarget=f;try{n(r)}catch(u){mi(u)}r.currentTarget=null,n=i}}}}function ee(e,t){var a=t[ou];a===void 0&&(a=t[ou]=new Set);var o=e+"__bubble";a.has(o)||(Ph(t,e,2,!1),a.add(o))}function jc(e,t,a){var o=0;t&&(o|=4),Ph(a,e,o,t)}var js="_reactListening"+Math.random().toString(36).slice(2);function Nd(e){if(!e[js]){e[js]=!0,Dy.forEach(function(a){a!=="selectionchange"&&(iC.has(a)||jc(a,!1,e),jc(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[js]||(t[js]=!0,jc("selectionchange",!1,t))}}function Ph(e,t,a,o){switch(Jh(t)){case 2:var r=LC;break;case 8:r=zC;break;default:r=zd}a=r.bind(null,t,a,e),r=void 0,!iu||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),o?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function Vc(e,t,a,o,r){var n=o;if((t&1)===0&&(t&2)===0&&o!==null)e:for(;;){if(o===null)return;var l=o.tag;if(l===3||l===4){var s=o.stateNode.containerInfo;if(s===r)break;if(l===4)for(l=o.return;l!==null;){var i=l.tag;if((i===3||i===4)&&l.stateNode.containerInfo===r)return;l=l.return}for(;s!==null;){if(l=Yr(s),l===null)return;if(i=l.tag,i===5||i===6||i===26||i===27){o=n=l;continue e}s=s.parentNode}}o=o.return}_y(function(){var f=n,u=Wu(a),x=[];e:{var d=eg.get(e);if(d!==void 0){var p=_i,v=e;switch(e){case"keypress":if(Ws(a)===0)break e;case"keydown":case"keyup":p=ow;break;case"focusin":v="focus",p=Cc;break;case"focusout":v="blur",p=Cc;break;case"beforeblur":case"afterblur":p=Cc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=ax;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=jS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=lw;break;case Zy:case Wy:case $y:p=QS;break;case Jy:p=iw;break;case"scroll":case"scrollend":p=XS;break;case"wheel":p=cw;break;case"copy":case"cut":case"paste":p=ZS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=rx;break;case"toggle":case"beforetoggle":p=dw}var k=(t&4)!==0,D=!k&&(e==="scroll"||e==="scrollend"),y=k?d!==null?d+"Capture":null:d;k=[];for(var c=f,m;c!==null;){var g=c;if(m=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||m===null||y===null||(g=kl(c,y),g!=null&&k.push(Bl(c,g,m))),D)break;c=c.return}0<k.length&&(d=new p(d,v,null,a,u),x.push({event:d,listeners:k}))}}if((t&7)===0){e:{if(d=e==="mouseover"||e==="pointerover",p=e==="mouseout"||e==="pointerout",d&&a!==su&&(v=a.relatedTarget||a.fromElement)&&(Yr(v)||v[Sn]))break e;if((p||d)&&(d=u.window===u?u:(d=u.ownerDocument)?d.defaultView||d.parentWindow:window,p?(v=a.relatedTarget||a.toElement,p=f,v=v?Yr(v):null,v!==null&&(D=Hl(v),k=v.tag,v!==D||k!==5&&k!==27&&k!==6)&&(v=null)):(p=null,v=f),p!==v)){if(k=ax,g="onMouseLeave",y="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(k=rx,g="onPointerLeave",y="onPointerEnter",c="pointer"),D=p==null?d:il(p),m=v==null?d:il(v),d=new k(g,c+"leave",p,a,u),d.target=D,d.relatedTarget=m,g=null,Yr(u)===f&&(k=new k(y,c+"enter",v,a,u),k.target=m,k.relatedTarget=D,g=k),D=g,p&&v)t:{for(k=fC,y=p,c=v,m=0,g=y;g;g=k(g))m++;g=0;for(var A=c;A;A=k(A))g++;for(;0<m-g;)y=k(y),m--;for(;0<g-m;)c=k(c),g--;for(;m--;){if(y===c||c!==null&&y===c.alternate){k=y;break t}y=k(y),c=k(c)}k=null}else k=null;p!==null&&Zx(x,d,p,k,!1),v!==null&&D!==null&&Zx(x,D,v,k,!0)}}e:{if(d=f?il(f):window,p=d.nodeName&&d.nodeName.toLowerCase(),p==="select"||p==="input"&&d.type==="file")var B=ix;else if(sx(d))if(jy)B=Sw;else{B=bw;var b=Iw}else p=d.nodeName,!p||p.toLowerCase()!=="input"||d.type!=="checkbox"&&d.type!=="radio"?f&&Zu(f.elementType)&&(B=ix):B=vw;if(B&&(B=B(e,f))){Gy(x,B,a,u);break e}b&&b(e,d,f),e==="focusout"&&f&&d.type==="number"&&f.memoizedProps.value!=null&&lu(d,"number",d.value)}switch(b=f?il(f):window,e){case"focusin":(sx(b)||b.contentEditable==="true")&&(Zr=b,fu=f,pl=null);break;case"focusout":pl=fu=Zr=null;break;case"mousedown":cu=!0;break;case"contextmenu":case"mouseup":case"dragend":cu=!1,dx(x,a,u);break;case"selectionchange":if(Cw)break;case"keydown":case"keyup":dx(x,a,u)}var N;if(ed)e:{switch(e){case"compositionstart":var S="onCompositionStart";break e;case"compositionend":S="onCompositionEnd";break e;case"compositionupdate":S="onCompositionUpdate";break e}S=void 0}else Kr?Uy(e,a)&&(S="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(S="onCompositionStart");S&&(qy&&a.locale!=="ko"&&(Kr||S!=="onCompositionStart"?S==="onCompositionEnd"&&Kr&&(N=Py()):(So=u,$u="value"in So?So.value:So.textContent,Kr=!0)),b=Di(f,S),0<b.length&&(S=new ox(S,e,null,a,u),x.push({event:S,listeners:b}),N?S.data=N:(N=Xy(a),N!==null&&(S.data=N)))),(N=mw?xw(e,a):yw(e,a))&&(S=Di(f,"onBeforeInput"),0<S.length&&(b=new ox("onBeforeInput","beforeinput",null,a,u),x.push({event:b,listeners:S}),b.data=N)),sC(x,e,f,a,u)}_h(x,t)})}function Bl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Di(e,t){for(var a=t+"Capture",o=[];e!==null;){var r=e,n=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||n===null||(r=kl(e,a),r!=null&&o.unshift(Bl(e,r,n)),r=kl(e,t),r!=null&&o.push(Bl(e,r,n))),e.tag===3)return o;e=e.return}return[]}function fC(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Zx(e,t,a,o,r){for(var n=t._reactName,l=[];a!==null&&a!==o;){var s=a,i=s.alternate,f=s.stateNode;if(s=s.tag,i!==null&&i===o)break;s!==5&&s!==26&&s!==27||f===null||(i=f,r?(f=kl(a,n),f!=null&&l.unshift(Bl(a,f,i))):r||(f=kl(a,n),f!=null&&l.push(Bl(a,f,i)))),a=a.return}l.length!==0&&e.push({event:t,listeners:l})}var cC=/\r\n?/g,uC=/\u0000|\uFFFD/g;function Wx(e){return(typeof e=="string"?e:""+e).replace(cC,`
`).replace(uC,"")}function qh(e,t){return t=Wx(t),Wx(e)===t}function me(e,t,a,o,r,n){switch(a){case"children":typeof o=="string"?t==="body"||t==="textarea"&&o===""||pn(e,o):(typeof o=="number"||typeof o=="bigint")&&t!=="body"&&pn(e,""+o);break;case"className":Bs(e,"class",o);break;case"tabIndex":Bs(e,"tabindex",o);break;case"dir":case"role":case"viewBox":case"width":case"height":Bs(e,a,o);break;case"style":Hy(e,o,n);break;case"data":if(t!=="object"){Bs(e,"data",o);break}case"src":case"href":if(o===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(o==null||typeof o=="function"||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=Ks(""+o),e.setAttribute(a,o);break;case"action":case"formAction":if(typeof o=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof n=="function"&&(a==="formAction"?(t!=="input"&&me(e,t,"name",r.name,r,null),me(e,t,"formEncType",r.formEncType,r,null),me(e,t,"formMethod",r.formMethod,r,null),me(e,t,"formTarget",r.formTarget,r,null)):(me(e,t,"encType",r.encType,r,null),me(e,t,"method",r.method,r,null),me(e,t,"target",r.target,r,null)));if(o==null||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=Ks(""+o),e.setAttribute(a,o);break;case"onClick":o!=null&&(e.onclick=Ga);break;case"onScroll":o!=null&&ee("scroll",e);break;case"onScrollEnd":o!=null&&ee("scrollend",e);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(F(61));if(a=o.__html,a!=null){if(r.children!=null)throw Error(F(60));e.innerHTML=a}}break;case"multiple":e.multiple=o&&typeof o!="function"&&typeof o!="symbol";break;case"muted":e.muted=o&&typeof o!="function"&&typeof o!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(o==null||typeof o=="function"||typeof o=="boolean"||typeof o=="symbol"){e.removeAttribute("xlink:href");break}a=Ks(""+o),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""+o):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":o&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":o===!0?e.setAttribute(a,""):o!==!1&&o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,o):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":o!=null&&typeof o!="function"&&typeof o!="symbol"&&!isNaN(o)&&1<=o?e.setAttribute(a,o):e.removeAttribute(a);break;case"rowSpan":case"start":o==null||typeof o=="function"||typeof o=="symbol"||isNaN(o)?e.removeAttribute(a):e.setAttribute(a,o);break;case"popover":ee("beforetoggle",e),ee("toggle",e),Qs(e,"popover",o);break;case"xlinkActuate":La(e,"http://www.w3.org/1999/xlink","xlink:actuate",o);break;case"xlinkArcrole":La(e,"http://www.w3.org/1999/xlink","xlink:arcrole",o);break;case"xlinkRole":La(e,"http://www.w3.org/1999/xlink","xlink:role",o);break;case"xlinkShow":La(e,"http://www.w3.org/1999/xlink","xlink:show",o);break;case"xlinkTitle":La(e,"http://www.w3.org/1999/xlink","xlink:title",o);break;case"xlinkType":La(e,"http://www.w3.org/1999/xlink","xlink:type",o);break;case"xmlBase":La(e,"http://www.w3.org/XML/1998/namespace","xml:base",o);break;case"xmlLang":La(e,"http://www.w3.org/XML/1998/namespace","xml:lang",o);break;case"xmlSpace":La(e,"http://www.w3.org/XML/1998/namespace","xml:space",o);break;case"is":Qs(e,"is",o);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=qS.get(a)||a,Qs(e,a,o))}}function Bu(e,t,a,o,r,n){switch(a){case"style":Hy(e,o,n);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(F(61));if(a=o.__html,a!=null){if(r.children!=null)throw Error(F(60));e.innerHTML=a}}break;case"children":typeof o=="string"?pn(e,o):(typeof o=="number"||typeof o=="bigint")&&pn(e,""+o);break;case"onScroll":o!=null&&ee("scroll",e);break;case"onScrollEnd":o!=null&&ee("scrollend",e);break;case"onClick":o!=null&&(e.onclick=Ga);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Fy.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),t=a.slice(2,r?a.length-7:void 0),n=e[Rt]||null,n=n!=null?n[a]:null,typeof n=="function"&&e.removeEventListener(t,n,r),typeof o=="function")){typeof n!="function"&&n!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(t,o,r);break e}a in e?e[a]=o:o===!0?e.setAttribute(a,""):Qs(e,a,o)}}}function ut(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ee("error",e),ee("load",e);var o=!1,r=!1,n;for(n in a)if(a.hasOwnProperty(n)){var l=a[n];if(l!=null)switch(n){case"src":o=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(F(137,t));default:me(e,t,n,l,a,null)}}r&&me(e,t,"srcSet",a.srcSet,a,null),o&&me(e,t,"src",a.src,a,null);return;case"input":ee("invalid",e);var s=n=l=r=null,i=null,f=null;for(o in a)if(a.hasOwnProperty(o)){var u=a[o];if(u!=null)switch(o){case"name":r=u;break;case"type":l=u;break;case"checked":i=u;break;case"defaultChecked":f=u;break;case"value":n=u;break;case"defaultValue":s=u;break;case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(F(137,t));break;default:me(e,t,o,u,a,null)}}Oy(e,n,s,i,f,l,r,!1);return;case"select":ee("invalid",e),o=l=n=null;for(r in a)if(a.hasOwnProperty(r)&&(s=a[r],s!=null))switch(r){case"value":n=s;break;case"defaultValue":l=s;break;case"multiple":o=s;default:me(e,t,r,s,a,null)}t=n,a=l,e.multiple=!!o,t!=null?rn(e,!!o,t,!1):a!=null&&rn(e,!!o,a,!0);return;case"textarea":ee("invalid",e),n=r=o=null;for(l in a)if(a.hasOwnProperty(l)&&(s=a[l],s!=null))switch(l){case"value":o=s;break;case"defaultValue":r=s;break;case"children":n=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(F(91));break;default:me(e,t,l,s,a,null)}zy(e,o,r,n);return;case"option":for(i in a)a.hasOwnProperty(i)&&(o=a[i],o!=null)&&(i==="selected"?e.selected=o&&typeof o!="function"&&typeof o!="symbol":me(e,t,i,o,a,null));return;case"dialog":ee("beforetoggle",e),ee("toggle",e),ee("cancel",e),ee("close",e);break;case"iframe":case"object":ee("load",e);break;case"video":case"audio":for(o=0;o<Nl.length;o++)ee(Nl[o],e);break;case"image":ee("error",e),ee("load",e);break;case"details":ee("toggle",e);break;case"embed":case"source":case"link":ee("error",e),ee("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in a)if(a.hasOwnProperty(f)&&(o=a[f],o!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(F(137,t));default:me(e,t,f,o,a,null)}return;default:if(Zu(t)){for(u in a)a.hasOwnProperty(u)&&(o=a[u],o!==void 0&&Bu(e,t,u,o,a,void 0));return}}for(s in a)a.hasOwnProperty(s)&&(o=a[s],o!=null&&me(e,t,s,o,a,null))}function dC(e,t,a,o){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,n=null,l=null,s=null,i=null,f=null,u=null;for(p in a){var x=a[p];if(a.hasOwnProperty(p)&&x!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":i=x;default:o.hasOwnProperty(p)||me(e,t,p,null,o,x)}}for(var d in o){var p=o[d];if(x=a[d],o.hasOwnProperty(d)&&(p!=null||x!=null))switch(d){case"type":n=p;break;case"name":r=p;break;case"checked":f=p;break;case"defaultChecked":u=p;break;case"value":l=p;break;case"defaultValue":s=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(F(137,t));break;default:p!==x&&me(e,t,d,p,o,x)}}nu(e,l,s,i,f,u,n,r);return;case"select":p=l=s=d=null;for(n in a)if(i=a[n],a.hasOwnProperty(n)&&i!=null)switch(n){case"value":break;case"multiple":p=i;default:o.hasOwnProperty(n)||me(e,t,n,null,o,i)}for(r in o)if(n=o[r],i=a[r],o.hasOwnProperty(r)&&(n!=null||i!=null))switch(r){case"value":d=n;break;case"defaultValue":s=n;break;case"multiple":l=n;default:n!==i&&me(e,t,r,n,o,i)}t=s,a=l,o=p,d!=null?rn(e,!!a,d,!1):!!o!=!!a&&(t!=null?rn(e,!!a,t,!0):rn(e,!!a,a?[]:"",!1));return;case"textarea":p=d=null;for(s in a)if(r=a[s],a.hasOwnProperty(s)&&r!=null&&!o.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:me(e,t,s,null,o,r)}for(l in o)if(r=o[l],n=a[l],o.hasOwnProperty(l)&&(r!=null||n!=null))switch(l){case"value":d=r;break;case"defaultValue":p=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(F(91));break;default:r!==n&&me(e,t,l,r,o,n)}Ly(e,d,p);return;case"option":for(var v in a)d=a[v],a.hasOwnProperty(v)&&d!=null&&!o.hasOwnProperty(v)&&(v==="selected"?e.selected=!1:me(e,t,v,null,o,d));for(i in o)d=o[i],p=a[i],o.hasOwnProperty(i)&&d!==p&&(d!=null||p!=null)&&(i==="selected"?e.selected=d&&typeof d!="function"&&typeof d!="symbol":me(e,t,i,d,o,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)d=a[k],a.hasOwnProperty(k)&&d!=null&&!o.hasOwnProperty(k)&&me(e,t,k,null,o,d);for(f in o)if(d=o[f],p=a[f],o.hasOwnProperty(f)&&d!==p&&(d!=null||p!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error(F(137,t));break;default:me(e,t,f,d,o,p)}return;default:if(Zu(t)){for(var D in a)d=a[D],a.hasOwnProperty(D)&&d!==void 0&&!o.hasOwnProperty(D)&&Bu(e,t,D,void 0,o,d);for(u in o)d=o[u],p=a[u],!o.hasOwnProperty(u)||d===p||d===void 0&&p===void 0||Bu(e,t,u,d,o,p);return}}for(var y in a)d=a[y],a.hasOwnProperty(y)&&d!=null&&!o.hasOwnProperty(y)&&me(e,t,y,null,o,d);for(x in o)d=o[x],p=a[x],!o.hasOwnProperty(x)||d===p||d==null&&p==null||me(e,t,x,d,o,p)}function $x(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function pC(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),o=0;o<a.length;o++){var r=a[o],n=r.transferSize,l=r.initiatorType,s=r.duration;if(n&&s&&$x(l)){for(l=0,s=r.responseEnd,o+=1;o<a.length;o++){var i=a[o],f=i.startTime;if(f>s)break;var u=i.transferSize,x=i.initiatorType;u&&$x(x)&&(i=i.responseEnd,l+=u*(i<s?1:(s-f)/(i-f)))}if(--o,t+=8*(n+l)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Ou=null,Lu=null;function Fi(e){return e.nodeType===9?e:e.ownerDocument}function Jx(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Uh(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function zu(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Yc=null;function mC(){var e=window.event;return e&&e.type==="popstate"?e===Yc?!1:(Yc=e,!0):(Yc=null,!1)}var Xh=typeof setTimeout=="function"?setTimeout:void 0,xC=typeof clearTimeout=="function"?clearTimeout:void 0,ey=typeof Promise=="function"?Promise:void 0,yC=typeof queueMicrotask=="function"?queueMicrotask:typeof ey<"u"?function(e){return ey.resolve(null).then(e).catch(gC)}:Xh;function gC(e){setTimeout(function(){throw e})}function Po(e){return e==="head"}function ty(e,t){var a=t,o=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(o===0){e.removeChild(r),vn(t);return}o--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")o++;else if(a==="html")wl(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,wl(a);for(var n=a.firstChild;n;){var l=n.nextSibling,s=n.nodeName;n[Ul]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&n.rel.toLowerCase()==="stylesheet"||a.removeChild(n),n=l}}else a==="body"&&wl(e.ownerDocument.body);a=r}while(a);vn(t)}function ay(e,t){var a=e;e=0;do{var o=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),o&&o.nodeType===8)if(a=o.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=o}while(a)}function Hu(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Hu(a),Ku(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function hC(e,t,a,o){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!o&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(o){if(!e[Ul])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(n=e.getAttribute("rel"),n==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(n!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(n=e.getAttribute("src"),(n!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&n&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var n=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===n)return e}else return e;if(e=na(e.nextSibling),e===null)break}return null}function IC(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=na(e.nextSibling),e===null))return null;return e}function Gh(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=na(e.nextSibling),e===null))return null;return e}function _u(e){return e.data==="$?"||e.data==="$~"}function Pu(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function bC(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var o=function(){t(),a.removeEventListener("DOMContentLoaded",o)};a.addEventListener("DOMContentLoaded",o),e._reactRetry=o}}function na(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var qu=null;function oy(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return na(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function ry(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function jh(e,t,a){switch(t=Fi(a),e){case"html":if(e=t.documentElement,!e)throw Error(F(452));return e;case"head":if(e=t.head,!e)throw Error(F(453));return e;case"body":if(e=t.body,!e)throw Error(F(454));return e;default:throw Error(F(451))}}function wl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Ku(e)}var la=new Map,ny=new Set;function Ni(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var eo=fe.d;fe.d={f:vC,r:SC,D:wC,C:CC,L:kC,m:AC,X:MC,S:RC,M:TC};function vC(){var e=eo.f(),t=Zi();return e||t}function SC(e){var t=wn(e);t!==null&&t.tag===5&&t.type==="form"?Hg(t):eo.r(e)}var Rn=typeof document>"u"?null:document;function Vh(e,t,a){var o=Rn;if(o&&typeof t=="string"&&t){var r=ta(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),ny.has(r)||(ny.add(r),e={rel:e,crossOrigin:a,href:t},o.querySelector(r)===null&&(t=o.createElement("link"),ut(t,"link",e),tt(t),o.head.appendChild(t)))}}function wC(e){eo.D(e),Vh("dns-prefetch",e,null)}function CC(e,t){eo.C(e,t),Vh("preconnect",e,t)}function kC(e,t,a){eo.L(e,t,a);var o=Rn;if(o&&e&&t){var r='link[rel="preload"][as="'+ta(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+ta(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+ta(a.imageSizes)+'"]')):r+='[href="'+ta(e)+'"]';var n=r;switch(t){case"style":n=bn(e);break;case"script":n=Mn(e)}la.has(n)||(e=Ce({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),la.set(n,e),o.querySelector(r)!==null||t==="style"&&o.querySelector(Ql(n))||t==="script"&&o.querySelector(Kl(n))||(t=o.createElement("link"),ut(t,"link",e),tt(t),o.head.appendChild(t)))}}function AC(e,t){eo.m(e,t);var a=Rn;if(a&&e){var o=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+ta(o)+'"][href="'+ta(e)+'"]',n=r;switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":n=Mn(e)}if(!la.has(n)&&(e=Ce({rel:"modulepreload",href:e},t),la.set(n,e),a.querySelector(r)===null)){switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Kl(n)))return}o=a.createElement("link"),ut(o,"link",e),tt(o),a.head.appendChild(o)}}}function RC(e,t,a){eo.S(e,t,a);var o=Rn;if(o&&e){var r=on(o).hoistableStyles,n=bn(e);t=t||"default";var l=r.get(n);if(!l){var s={loading:0,preload:null};if(l=o.querySelector(Ql(n)))s.loading=5;else{e=Ce({rel:"stylesheet",href:e,"data-precedence":t},a),(a=la.get(n))&&Bd(e,a);var i=l=o.createElement("link");tt(i),ut(i,"link",e),i._p=new Promise(function(f,u){i.onload=f,i.onerror=u}),i.addEventListener("load",function(){s.loading|=1}),i.addEventListener("error",function(){s.loading|=2}),s.loading|=4,ni(l,t,o)}l={type:"stylesheet",instance:l,count:1,state:s},r.set(n,l)}}}function MC(e,t){eo.X(e,t);var a=Rn;if(a&&e){var o=on(a).hoistableScripts,r=Mn(e),n=o.get(r);n||(n=a.querySelector(Kl(r)),n||(e=Ce({src:e,async:!0},t),(t=la.get(r))&&Od(e,t),n=a.createElement("script"),tt(n),ut(n,"link",e),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},o.set(r,n))}}function TC(e,t){eo.M(e,t);var a=Rn;if(a&&e){var o=on(a).hoistableScripts,r=Mn(e),n=o.get(r);n||(n=a.querySelector(Kl(r)),n||(e=Ce({src:e,async:!0,type:"module"},t),(t=la.get(r))&&Od(e,t),n=a.createElement("script"),tt(n),ut(n,"link",e),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},o.set(r,n))}}function ly(e,t,a,o){var r=(r=Ao.current)?Ni(r):null;if(!r)throw Error(F(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(t=bn(a.href),a=on(r).hoistableStyles,o=a.get(t),o||(o={type:"style",instance:null,count:0,state:null},a.set(t,o)),o):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=bn(a.href);var n=on(r).hoistableStyles,l=n.get(e);if(l||(r=r.ownerDocument||r,l={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},n.set(e,l),(n=r.querySelector(Ql(e)))&&!n._p&&(l.instance=n,l.state.loading=5),la.has(e)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},la.set(e,a),n||EC(r,e,a,l.state))),t&&o===null)throw Error(F(528,""));return l}if(t&&o!==null)throw Error(F(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Mn(a),a=on(r).hoistableScripts,o=a.get(t),o||(o={type:"script",instance:null,count:0,state:null},a.set(t,o)),o):{type:"void",instance:null,count:0,state:null};default:throw Error(F(444,e))}}function bn(e){return'href="'+ta(e)+'"'}function Ql(e){return'link[rel="stylesheet"]['+e+"]"}function Yh(e){return Ce({},e,{"data-precedence":e.precedence,precedence:null})}function EC(e,t,a,o){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?o.loading=1:(t=e.createElement("link"),o.preload=t,t.addEventListener("load",function(){return o.loading|=1}),t.addEventListener("error",function(){return o.loading|=2}),ut(t,"link",a),tt(t),e.head.appendChild(t))}function Mn(e){return'[src="'+ta(e)+'"]'}function Kl(e){return"script[async]"+e}function sy(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var o=e.querySelector('style[data-href~="'+ta(a.href)+'"]');if(o)return t.instance=o,tt(o),o;var r=Ce({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return o=(e.ownerDocument||e).createElement("style"),tt(o),ut(o,"style",r),ni(o,a.precedence,e),t.instance=o;case"stylesheet":r=bn(a.href);var n=e.querySelector(Ql(r));if(n)return t.state.loading|=4,t.instance=n,tt(n),n;o=Yh(a),(r=la.get(r))&&Bd(o,r),n=(e.ownerDocument||e).createElement("link"),tt(n);var l=n;return l._p=new Promise(function(s,i){l.onload=s,l.onerror=i}),ut(n,"link",o),t.state.loading|=4,ni(n,a.precedence,e),t.instance=n;case"script":return n=Mn(a.src),(r=e.querySelector(Kl(n)))?(t.instance=r,tt(r),r):(o=a,(r=la.get(n))&&(o=Ce({},a),Od(o,r)),e=e.ownerDocument||e,r=e.createElement("script"),tt(r),ut(r,"link",o),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(F(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(o=t.instance,t.state.loading|=4,ni(o,a.precedence,e));return t.instance}function ni(e,t,a){for(var o=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=o.length?o[o.length-1]:null,n=r,l=0;l<o.length;l++){var s=o[l];if(s.dataset.precedence===t)n=s;else if(n!==r)break}n?n.parentNode.insertBefore(e,n.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Bd(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Od(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var li=null;function iy(e,t,a){if(li===null){var o=new Map,r=li=new Map;r.set(a,o)}else r=li,o=r.get(a),o||(o=new Map,r.set(a,o));if(o.has(e))return o;for(o.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var n=a[r];if(!(n[Ul]||n[it]||e==="link"&&n.getAttribute("rel")==="stylesheet")&&n.namespaceURI!=="http://www.w3.org/2000/svg"){var l=n.getAttribute(t)||"";l=e+l;var s=o.get(l);s?s.push(n):o.set(l,[n])}}return o}function fy(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function DC(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Qh(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function FC(e,t,a,o){if(a.type==="stylesheet"&&(typeof o.media!="string"||matchMedia(o.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=bn(o.href),n=t.querySelector(Ql(r));if(n){t=n._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Bi.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=n,tt(n);return}n=t.ownerDocument||t,o=Yh(o),(r=la.get(r))&&Bd(o,r),n=n.createElement("link"),tt(n);var l=n;l._p=new Promise(function(s,i){l.onload=s,l.onerror=i}),ut(n,"link",o),a.instance=n}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Bi.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Qc=0;function NC(e,t){return e.stylesheets&&e.count===0&&si(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var o=setTimeout(function(){if(e.stylesheets&&si(e,e.stylesheets),e.unsuspend){var n=e.unsuspend;e.unsuspend=null,n()}},6e4+t);0<e.imgBytes&&Qc===0&&(Qc=62500*pC());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&si(e,e.stylesheets),e.unsuspend)){var n=e.unsuspend;e.unsuspend=null,n()}},(e.imgBytes>Qc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(o),clearTimeout(r)}}:null}function Bi(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)si(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Oi=null;function si(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Oi=new Map,t.forEach(BC,e),Oi=null,Bi.call(e))}function BC(e,t){if(!(t.state.loading&4)){var a=Oi.get(e);if(a)var o=a.get(null);else{a=new Map,Oi.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),n=0;n<r.length;n++){var l=r[n];(l.nodeName==="LINK"||l.getAttribute("media")!=="not all")&&(a.set(l.dataset.precedence,l),o=l)}o&&a.set(null,o)}r=t.instance,l=r.getAttribute("data-precedence"),n=a.get(l)||o,n===o&&a.set(null,r),a.set(l,r),this.count++,o=Bi.bind(this),r.addEventListener("load",o),r.addEventListener("error",o),n?n.parentNode.insertBefore(r,n.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var Ol={$$typeof:Xa,Provider:null,Consumer:null,_currentValue:rr,_currentValue2:rr,_threadCount:0};function OC(e,t,a,o,r,n,l,s,i){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=bc(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=bc(0),this.hiddenUpdates=bc(null),this.identifierPrefix=o,this.onUncaughtError=r,this.onCaughtError=n,this.onRecoverableError=l,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=i,this.incompleteTransitions=new Map}function Kh(e,t,a,o,r,n,l,s,i,f,u,x){return e=new OC(e,t,a,l,i,f,u,x,s),t=1,n===!0&&(t|=24),n=zt(3,null,null,t),e.current=n,n.stateNode=e,t=sd(),t.refCount++,e.pooledCache=t,t.refCount++,n.memoizedState={element:o,isDehydrated:a,cache:t},cd(n),e}function Zh(e){return e?(e=Jr,e):Jr}function Wh(e,t,a,o,r,n){r=Zh(r),o.context===null?o.context=r:o.pendingContext=r,o=Mo(t),o.payload={element:a},n=n===void 0?null:n,n!==null&&(o.callback=n),a=To(e,o,t),a!==null&&(At(a,e,t),xl(a,e,t))}function cy(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Ld(e,t){cy(e,t),(e=e.alternate)&&cy(e,t)}function $h(e){if(e.tag===13||e.tag===31){var t=gr(e,67108864);t!==null&&At(t,e,67108864),Ld(e,67108864)}}function uy(e){if(e.tag===13||e.tag===31){var t=Ut();t=Yu(t);var a=gr(e,t);a!==null&&At(a,e,t),Ld(e,t)}}var Li=!0;function LC(e,t,a,o){var r=j.T;j.T=null;var n=fe.p;try{fe.p=2,zd(e,t,a,o)}finally{fe.p=n,j.T=r}}function zC(e,t,a,o){var r=j.T;j.T=null;var n=fe.p;try{fe.p=8,zd(e,t,a,o)}finally{fe.p=n,j.T=r}}function zd(e,t,a,o){if(Li){var r=Uu(o);if(r===null)Vc(e,t,o,zi,a),dy(e,o);else if(_C(r,e,t,a,o))o.stopPropagation();else if(dy(e,o),t&4&&-1<HC.indexOf(e)){for(;r!==null;){var n=wn(r);if(n!==null)switch(n.tag){case 3:if(n=n.stateNode,n.current.memoizedState.isDehydrated){var l=tr(n.pendingLanes);if(l!==0){var s=n;for(s.pendingLanes|=2,s.entangledLanes|=2;l;){var i=1<<31-qt(l);s.entanglements[1]|=i,l&=~i}Ma(n),(ie&6)===0&&(Ai=_t()+500,Yl(0,!1))}}break;case 31:case 13:s=gr(n,2),s!==null&&At(s,n,2),Zi(),Ld(n,2)}if(n=Uu(o),n===null&&Vc(e,t,o,zi,a),n===r)break;r=n}r!==null&&o.stopPropagation()}else Vc(e,t,o,null,a)}}function Uu(e){return e=Wu(e),Hd(e)}var zi=null;function Hd(e){if(zi=null,e=Yr(e),e!==null){var t=Hl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=hy(t),e!==null)return e;e=null}else if(a===31){if(e=Iy(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return zi=e,null}function Jh(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(kS()){case wy:return 2;case Cy:return 8;case di:case AS:return 32;case ky:return 268435456;default:return 32}default:return 32}}var Xu=!1,Fo=null,No=null,Bo=null,Ll=new Map,zl=new Map,bo=[],HC="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function dy(e,t){switch(e){case"focusin":case"focusout":Fo=null;break;case"dragenter":case"dragleave":No=null;break;case"mouseover":case"mouseout":Bo=null;break;case"pointerover":case"pointerout":Ll.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":zl.delete(t.pointerId)}}function rl(e,t,a,o,r,n){return e===null||e.nativeEvent!==n?(e={blockedOn:t,domEventName:a,eventSystemFlags:o,nativeEvent:n,targetContainers:[r]},t!==null&&(t=wn(t),t!==null&&$h(t)),e):(e.eventSystemFlags|=o,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function _C(e,t,a,o,r){switch(t){case"focusin":return Fo=rl(Fo,e,t,a,o,r),!0;case"dragenter":return No=rl(No,e,t,a,o,r),!0;case"mouseover":return Bo=rl(Bo,e,t,a,o,r),!0;case"pointerover":var n=r.pointerId;return Ll.set(n,rl(Ll.get(n)||null,e,t,a,o,r)),!0;case"gotpointercapture":return n=r.pointerId,zl.set(n,rl(zl.get(n)||null,e,t,a,o,r)),!0}return!1}function eI(e){var t=Yr(e.target);if(t!==null){var a=Hl(t);if(a!==null){if(t=a.tag,t===13){if(t=hy(a),t!==null){e.blockedOn=t,Km(e.priority,function(){uy(a)});return}}else if(t===31){if(t=Iy(a),t!==null){e.blockedOn=t,Km(e.priority,function(){uy(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function ii(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Uu(e.nativeEvent);if(a===null){a=e.nativeEvent;var o=new a.constructor(a.type,a);su=o,a.target.dispatchEvent(o),su=null}else return t=wn(a),t!==null&&$h(t),e.blockedOn=a,!1;t.shift()}return!0}function py(e,t,a){ii(e)&&a.delete(t)}function PC(){Xu=!1,Fo!==null&&ii(Fo)&&(Fo=null),No!==null&&ii(No)&&(No=null),Bo!==null&&ii(Bo)&&(Bo=null),Ll.forEach(py),zl.forEach(py)}function Vs(e,t){e.blockedOn===t&&(e.blockedOn=null,Xu||(Xu=!0,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,PC)))}var Ys=null;function my(e){Ys!==e&&(Ys=e,Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority,function(){Ys===e&&(Ys=null);for(var t=0;t<e.length;t+=3){var a=e[t],o=e[t+1],r=e[t+2];if(typeof o!="function"){if(Hd(o||a)===null)continue;break}var n=wn(a);n!==null&&(e.splice(t,3),t-=3,wu(n,{pending:!0,data:r,method:a.method,action:o},o,r))}}))}function vn(e){function t(i){return Vs(i,e)}Fo!==null&&Vs(Fo,e),No!==null&&Vs(No,e),Bo!==null&&Vs(Bo,e),Ll.forEach(t),zl.forEach(t);for(var a=0;a<bo.length;a++){var o=bo[a];o.blockedOn===e&&(o.blockedOn=null)}for(;0<bo.length&&(a=bo[0],a.blockedOn===null);)eI(a),a.blockedOn===null&&bo.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(o=0;o<a.length;o+=3){var r=a[o],n=a[o+1],l=r[Rt]||null;if(typeof n=="function")l||my(a);else if(l){var s=null;if(n&&n.hasAttribute("formAction")){if(r=n,l=n[Rt]||null)s=l.formAction;else if(Hd(r)!==null)continue}else s=l.action;typeof s=="function"?a[o+1]=s:(a.splice(o,3),o-=3),my(a)}}}function tI(){function e(n){n.canIntercept&&n.info==="react-transition"&&n.intercept({handler:function(){return new Promise(function(l){return r=l})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),o||setTimeout(a,20)}function a(){if(!o&&!navigation.transition){var n=navigation.currentEntry;n&&n.url!=null&&navigation.navigate(n.url,{state:n.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var o=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){o=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function _d(e){this._internalRoot=e}Ji.prototype.render=_d.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(F(409));var a=t.current,o=Ut();Wh(a,o,e,t,null,null)};Ji.prototype.unmount=_d.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Wh(e.current,2,null,e,null,null),Zi(),t[Sn]=null}};function Ji(e){this._internalRoot=e}Ji.prototype.unstable_scheduleHydration=function(e){if(e){var t=Ey();e={blockedOn:null,target:e,priority:t};for(var a=0;a<bo.length&&t!==0&&t<bo[a].priority;a++);bo.splice(a,0,e),a===0&&eI(e)}};var xy=yy.version;if(xy!=="19.2.6")throw Error(F(527,xy,"19.2.6"));fe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(F(188)):(e=Object.keys(e).join(","),Error(F(268,e)));return e=hS(t),e=e!==null?by(e):null,e=e===null?null:e.stateNode,e};var qC={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:j,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(nl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!nl.isDisabled&&nl.supportsFiber))try{_l=nl.inject(qC),Pt=nl}catch{}var nl;ef.createRoot=function(e,t){if(!gy(e))throw Error(F(299));var a=!1,o="",r=Vg,n=Yg,l=Qg;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(o=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(n=t.onCaughtError),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=Kh(e,1,!1,null,null,a,o,null,r,n,l,tI),e[Sn]=t.current,Nd(e),new _d(t)};ef.hydrateRoot=function(e,t,a){if(!gy(e))throw Error(F(299));var o=!1,r="",n=Vg,l=Yg,s=Qg,i=null;return a!=null&&(a.unstable_strictMode===!0&&(o=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(n=a.onUncaughtError),a.onCaughtError!==void 0&&(l=a.onCaughtError),a.onRecoverableError!==void 0&&(s=a.onRecoverableError),a.formState!==void 0&&(i=a.formState)),t=Kh(e,1,!0,t,a??null,o,r,i,n,l,s,tI),t.context=Zh(null),a=t.current,o=Ut(),o=Yu(o),r=Mo(o),r.callback=null,To(a,r,o),a=o,t.current.lanes=a,ql(t,a),Ma(t),e[Sn]=t.current,Nd(e),new Ji(t)};ef.version="19.2.6"});var nI=da((CM,rI)=>{"use strict";function oI(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(oI)}catch(e){console.error(e)}}oI(),rI.exports=aI()});var lI,sI,Pd=E(()=>{lI=e=>{let t,a=new Set,o=(f,u)=>{let x=typeof f=="function"?f(t):f;if(!Object.is(x,t)){let d=t;t=u??(typeof x!="object"||x===null)?x:Object.assign({},t,x),a.forEach(p=>p(t,d))}},r=()=>t,s={setState:o,getState:r,getInitialState:()=>i,subscribe:f=>(a.add(f),()=>a.delete(f))},i=t=e(o,r,s);return s},sI=(e=>e?lI(e):lI)});function XC(e,t=UC){let a=Zl.default.useSyncExternalStore(e.subscribe,Zl.default.useCallback(()=>t(e.getState()),[e,t]),Zl.default.useCallback(()=>t(e.getInitialState()),[e,t]));return Zl.default.useDebugValue(a),a}var Zl,UC,iI,fI,cI=E(()=>{Zl=H(ze(),1);Pd();UC=e=>e;iI=e=>{let t=sI(e),a=o=>XC(t,o);return Object.assign(a,t),a},fI=(e=>e?iI(e):iI)});var uI=E(()=>{Pd();cI()});function Tn(e){if(e==null||e==="")return null;if(typeof e!="string")return e;let t=e.trim();if(!t||!t.startsWith("{")&&!t.startsWith("["))return e;try{return JSON.parse(t)}catch{return e}}function ya(e,t,a,o){if(typeof e=="string"&&e.trim()===""||typeof e!="number"&&typeof e!="string")return t;let r=Number(e);return Number.isFinite(r)?Math.min(o,Math.max(a,Math.round(r))):t}function pe(e){if(!e)return null;if(qd.has(e))return qd.get(e);let t=Tn(e.responseDecrypted??e.responseRaw??e.response??null);return qd.set(e,t),t}function Xd(e){if(!e)return null;if(Ud.has(e))return Ud.get(e);let t=sa(pe(e));return Ud.set(e,t),t}function ia(e){return e?Tn(e.requestBody??null):null}function Ta(e){let t=e||Date.now(),a=Math.floor(t/1e3),o=tf.get(a);if(o!==void 0)return o;tf.size>512&&tf.clear();let r=GC.format(t);return tf.set(a,r),r}function af(e,t=6){if(e==null||typeof e!="object"||t<=0)return e;if(Array.isArray(e))return e.map(o=>af(o,t-1));let a={};for(let[o,r]of Object.entries(e))o!=="__xray_ref__"&&(a[o]=af(r,t-1));return a}function Tt(e){let t=Number(e)||0;return t>=1024*1024?(t/(1024*1024)).toFixed(1)+"mb":t>=1024?(t/1024).toFixed(1)+"kb":t+"b"}function fa(e,t=220){if(e===void 0)return"undefined";if(e===null)return"null";if(typeof e=="string")return e.length>t?e.slice(0,t)+"...":e;if(typeof e=="number"||typeof e=="boolean")return String(e);try{let a=JSON.stringify(e);return a.length>t?a.slice(0,t)+"...":a}catch{return String(e)}}function W(e,t=2,a=8e4){let o=[],r="";try{r=JSON.stringify(e,function(n,l){if(typeof l=="bigint")return l.toString()+"n";if(l&&typeof l=="object"){for(;o.length>0&&o[o.length-1]!==this;)o.pop();if(o.includes(l))return"[Circular]";o.push(l)}return l},t)??"undefined"}catch{r=String(e)}return r.length<=a?r:r.slice(0,a)+`
... truncated ${r.length-a} chars`}function ca(e){return(e||"GET").toLowerCase()}function jt(e){let t=Number(e)||0;return t>=400?"error":t>=300?"warn":t>=200?"ok":""}function of(e){return e.type==="network"&&e.args?.[0]&&typeof e.args[0]=="object"?e.args[0]:null}function dI(e){return`'${String(e??"").replace(/'/g,"'\\''")}'`}function rf(e){return window.XRAY_ConsoleHelpers?.generateCurl?window.XRAY_ConsoleHelpers.generateCurl(e):e?`curl ${dI(e.url||"")} -X ${dI((e.method||"GET").toUpperCase())}`:"// Select an API request first"}function nf(e){return window.XRAY_ConsoleHelpers?.generateFetch?window.XRAY_ConsoleHelpers.generateFetch(e):e?`fetch(${JSON.stringify(e.url||"")})`:"// Select an API request first"}function pI(e){let t=window.XRAY_ConsoleHelpers?.buildMock?.(e)||pe(e);return W(t,2,12e4)}async function dt(e){try{await navigator.clipboard?.writeText?.(e)}catch{}}function mI(e,t,a="text/plain;charset=utf-8"){let o=new Blob([t],{type:a}),r=URL.createObjectURL(o),n=document.createElement("a");n.href=r,n.download=e,n.click(),URL.revokeObjectURL(r)}function sa(e){return window.XRAY_ConsoleHelpers?.schema?window.XRAY_ConsoleHelpers.schema(e):e===null?"null":Array.isArray(e)?e.length?[sa(e[0])]:"array":typeof e=="object"?Object.fromEntries(Object.entries(e||{}).map(([t,a])=>[t,sa(a)])):typeof e}var qd,Ud,GC,tf,ke=E(()=>{"use strict";qd=new WeakMap,Ud=new WeakMap;GC=new Intl.DateTimeFormat("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"}),tf=new Map});function Pe(e){return e.type==="api"}function Gd(e){return e.type==="log"}function re(e){return String(e.urlPath||e.url||"(unknown)")}function Et(e){let t=re(e);return e.graphql?.operationName?`${t}#${e.graphql.operationName}`:t}function Wl(e){return e.graphql?.operationName?`${e.graphql.operationType} ${e.graphql.operationName}`:re(e)}function lf(e){let t=String(e.url||"");if(!t)return"";try{return new URL(t).host}catch{return""}}function xI(e,t){if(!e||typeof e!="object")return"";let a=t.toLowerCase(),o=Object.entries(e).find(([r])=>r.toLowerCase()===a);return o?String(o[1]??""):""}function qo(e){return String(e.contentType||xI(e.responseHeaders,"content-type")||xI(e.requestHeaders,"content-type")||"")}function se(e){return Math.max(0,Number(e?.duration)||0)}function jC(e){let t=Number(e.status)||0;return t>=500?"5xx":t>=400?"4xx":t>=300?"3xx":t>=200?"2xx":"other"}function bI(e,t,a=500){let o=e.filter(Pe),r=o.reduce((s,i)=>s+se(i),0),n=new Map;o.forEach(s=>{let i=re(s);n.set(i,(n.get(i)||0)+1)});let l=Array.from(n.entries()).sort((s,i)=>i[1]-s[1])[0]?.[0]||"No endpoint yet";return{total:o.length,errors:o.filter(s=>Number(s.status)>=400).length,slow:o.filter(s=>se(s)>=a).length,pinned:o.filter(s=>t.has(s.id)).length,avgDuration:o.length?r/o.length:0,totalBytes:o.reduce((s,i)=>s+(Number(i.size)||0),0),topEndpoint:l,repeatedEndpoints:Array.from(n.values()).filter(s=>s>=3).length}}function VC(e){let t=yI.get(e);if(t)return t;t=new Map;let a=new Map;for(let o of e){if(!Pe(o))continue;let r=Et(o),n=t.get(r)||{count:0,errors:0,avgDuration:0,maxDuration:0},l=se(o);n.count+=1,Number(o.status)>=400&&(n.errors+=1),n.maxDuration=Math.max(n.maxDuration,l),a.set(r,(a.get(r)||0)+l),t.set(r,n)}for(let[o,r]of t)r.avgDuration=r.count?(a.get(o)||0)/r.count:0;return yI.set(e,t),t}function sf(e,t){return VC(t).get(Et(e))||{count:0,errors:0,avgDuration:0,maxDuration:0}}function vI(e){let t=gI.get(e);if(t)return t;let a=e.responseDecrypted??e.responseRaw??e.response,o=!1;if(Number(e.status)===204||a==null||a==="")o=!0;else{let l=pe(e);Array.isArray(l)?o=l.length===0:l&&typeof l=="object"&&(o=Object.keys(l).length===0)}let r=Number(e.size)>=1e5;r||(typeof a=="string"?r=a.length>=1e5:a!=null&&(r=W(a,0,12e4).length>=1e5));let n={empty:o,large:r};return gI.set(e,n),n}function SI(e){return vI(e).empty}function wI(e){return vI(e).large}function YC(e,t,a=new Set,o=500){if(!Pe(e))return a.has(e.id)?["pinned"]:[];let r=[],n=Number(e.status)||0,l=sf(e,t);return n>=400&&r.push("error"),e.driftFromId&&r.push("drift"),e.mocked&&r.push("mocked"),e.replayed&&r.push("replayed"),e.graphql&&r.push("graphql"),(e.source==="ws"||e.source==="sse")&&r.push("ws"),se(e)>=o&&r.push("slow"),l.count>=3&&r.push("repeated"),wI(e)&&r.push("large"),SI(e)&&r.push("empty"),a.has(e.id)&&r.push("pinned"),r}function QC(e,t,a,o=new Set,r=500){return t==="all"?!0:t==="drift"?!!e.driftFromId:t==="graphql"?!!e.graphql:t==="ws"?e.source==="ws"||e.source==="sse":t==="mocked"?!!e.mocked:t==="replayed"?!!e.replayed:t==="errors"?(Number(e.status)||0)>=400:t==="slow"?se(e)>=r:t==="pinned"?o.has(e.id):t==="repeated"?sf(e,a).count>=3:t==="large"?wI(e):t==="empty"?SI(e):!0}function KC(e,t){if(!t)return!0;let a=hI.get(e);return a===void 0&&(a=[e.method,e.status,e.url,e.urlPath,e.source,lf(e),qo(e),e.logLevel,e.message,fa(e.logData,240)].join(" ").toLowerCase(),hI.set(e,a)),a.includes(t.toLowerCase())}function ZC(e){let t=new Map;return e.filter(Pe).forEach(a=>{let o=Et(a),r=t.get(o)||[];r.push(a),t.set(o,r)}),Array.from(t.entries()).map(([a,o])=>{let r=o.slice().sort((s,i)=>Number(i.timestamp)-Number(s.timestamp)),n=r.reduce((s,i)=>s+se(i),0),l=Wl(r[0]);return{key:"api:"+a,path:l,entries:r,latestEntry:r[0],count:r.length,errors:r.filter(s=>Number(s.status)>=400).length,avgDuration:r.length?n/r.length:0,maxDuration:r.reduce((s,i)=>Math.max(s,se(i)),0),totalBytes:r.reduce((s,i)=>s+(Number(i.size)||0),0),lastSeen:Number(r[0]?.timestamp)||0,methods:Array.from(new Set(r.map(s=>String(s.method||"GET").toUpperCase()))),sources:Array.from(new Set(r.map(s=>String(s.source||"fetch").toLowerCase())))}})}function II(e,t,a,o){let r=o==="asc"?1:-1,n=i=>a==="method"?String(i.method||""):a==="status"?Number(i.status)||0:a==="url"?re(i):a==="duration"?Number(i.duration)||0:a==="size"?Number(i.size)||0:Number(i.timestamp)||0,l=n(e),s=n(t);return typeof l=="number"&&typeof s=="number"?(l-s)*r:String(l).localeCompare(String(s))*r}function CI(e){let{mode:t,entries:a,query:o,statusFilters:r,typeFilters:n,methodFilters:l=new Set,expandedGroups:s,pinnedIds:i,sortField:f,sortOrder:u,slowThresholdMs:x=500,apiQuickFilter:d="all",apiGroupingMode:p="endpoint"}=e,v=a.filter(t==="api"?Pe:Gd).filter(m=>KC(m,o)).filter(m=>t!=="api"||QC(m,d,a,i,x)).filter(m=>t!=="api"||!l.size||l.has(String(m.method||"GET").toUpperCase())).filter(m=>t!=="api"||!r.size||r.has(jC(m))).filter(m=>t!=="api"||!n.size||n.has(String(m.source||"fetch").toLowerCase())),k=(m,g)=>{let A=i.has(m.id)?1:0;return(i.has(g.id)?1:0)-A||II(m,g,f,u)},D=m=>YC(m,a,i,x);if(t==="logs")return v.slice().sort(k).map(m=>({key:m.id,entry:m,flags:D(m)}));if(p==="flat")return v.slice().sort(k).map(m=>({key:m.id,entry:m,flags:D(m)}));let y=ZC(v).sort((m,g)=>{let A=m.entries.some(b=>i.has(b.id))?1:0;return(g.entries.some(b=>i.has(b.id))?1:0)-A||II(m.latestEntry,g.latestEntry,f,u)}),c=[];return y.forEach(m=>{let g=m.entries.slice().sort(k),A=s.has(m.key);c.push({key:m.key,entry:g[0],flags:D(g[0]),groupKey:m.key,groupCount:g.length,groupExpanded:A,groupStats:m}),A&&g.length>1&&g.slice(1).forEach(B=>c.push({key:B.id,entry:B,flags:D(B),groupKey:m.key,groupChild:!0}))}),c}function ff(e){let t=new Set(e.pinnedIds);return e.selectedId&&t.add(e.selectedId),t}function cf(e,t,a){if(e.length<=t)return{entries:e,dropped:new Set};let o=e.filter(u=>a.has(u.id)),r=e.filter(u=>!a.has(u.id)),n=Math.max(0,t-o.length),l=new Set(r.slice(-n).map(u=>u.id)),s=new Set(o.slice(-t).map(u=>u.id)),i=[],f=new Set;for(let u of e)l.has(u.id)||s.has(u.id)?i.push(u):f.add(u.id);return{entries:i,dropped:f}}var yI,gI,hI,Dt=E(()=>{"use strict";ke();yI=new WeakMap;gI=new WeakMap;hI=new WeakMap});function jd(e){window.XRAY_Console?.setContext(e)}async function kI(e){return window.XRAY_Console?.execute(e)??null}function Vd(e){return window.XRAY_Console?.navigateHistory(e)??null}var Yd=E(()=>{"use strict"});function AI(e,t){console.warn(`[XRAY] XRAY_Store unavailable; skipping ${e} of "${t}".`)}async function $l(e,t){return window.XRAY_Store?.get?await window.XRAY_Store.get(e)??t:(AI("read",e),t)}async function Ir(e,t){if(window.XRAY_Store?.set){await window.XRAY_Store.set(e,t);return}AI("write",e)}var RI=E(()=>{"use strict"});function Fn(e){return typeof e=="string"&&FI.test(e)}function WC(e){return Ze(e,"")!==""}function Ze(e,t){if(typeof e=="string"){let a=e.trim();if(/^[0-9a-fA-F]{6}$/.test(a)&&(a="#"+a),/^#[0-9a-fA-F]{3}$/.test(a)&&(a="#"+a.slice(1).split("").map(o=>o+o).join("")),FI.test(a))return a.toLowerCase()}return t}function es(e){let t=e||{},a={bg:Ze(t.bg,ga.bg),surface:Ze(t.surface,ga.surface),text:Ze(t.text,ga.text),accent:Ze(t.accent,ga.accent)};for(let o of ts){let r=t[o];WC(r)&&(a[o]=Ze(r,"#000000"))}return a}function $C(e){let t={};for(let a of ts)Fn(e[a])&&(t[a]=Ze(e[a],"#000000"));return t}function Ea(e){let t=parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function to([e,t,a]){let o=r=>Math.max(0,Math.min(255,Math.round(r))).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(a)}`}function En([e,t,a]){return`${Math.round(e)}, ${Math.round(t)}, ${Math.round(a)}`}function Jl(e,t,a){return[e[0]+(t[0]-e[0])*a,e[1]+(t[1]-e[1])*a,e[2]+(t[2]-e[2])*a]}function JC([e,t,a]){return .2126*e+.7152*t+.0722*a}function e2([e,t,a]){e/=255,t/=255,a/=255;let o=Math.max(e,t,a),r=Math.min(e,t,a),n=(o+r)/2,l=0,s=0;if(o!==r){let i=o-r;s=n>.5?i/(2-o-r):i/(o+r),o===e?l=(t-a)/i+(t<a?6:0):o===t?l=(a-e)/i+2:l=(e-t)/i+4,l/=6}return[l*360,s*100,n*100]}function Dn(e,t,a){e=(e%360+360)%360,t=Math.max(0,Math.min(100,t))/100,a=Math.max(0,Math.min(100,a))/100;let o=(1-Math.abs(2*a-1))*t,r=o*(1-Math.abs(e/60%2-1)),n=a-o/2,l=0,s=0,i=0;return e<60?(l=o,s=r):e<120?(l=r,s=o):e<180?(s=o,i=r):e<240?(s=r,i=o):e<300?(l=r,i=o):(l=o,i=r),to([(l+n)*255,(s+n)*255,(i+n)*255])}function br(e,t){let a=Ze(e,ga.accent),[o]=e2(Ea(a));return t==="light"?{bg:Dn(o,30,96),surface:Dn(o,42,99),text:Dn(o,22,12),accent:a}:{bg:Dn(o,22,7),surface:Dn(o,18,11),text:Dn(o,16,92),accent:a}}function uf(e){let t=Number.isFinite(e)?e:0,a=MI.length,o=MI[(Math.floor(t*a)%a+a)%a],r=(t*100%5+5)%5<1?"light":"dark";return br(o,r)}function NI(e){let t=Sr(e);return`/* XRAY custom theme */
.xray-theme {
${Object.entries(t).map(([o,r])=>`  ${o}: ${r};`).join(`
`)}
}`}function Qd(e){let t=e/255;return t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4)}function TI([e,t,a]){return .2126*Qd(e)+.7152*Qd(t)+.0722*Qd(a)}function vr(e,t){let a=TI(Ea(Ze(e,"#000000"))),o=TI(Ea(Ze(t,"#ffffff"))),r=Math.max(a,o),n=Math.min(a,o);return(r+.05)/(n+.05)}function BI(e){return e>=7?"AAA":e>=4.5?"AA":e>=3?"AA Large":"Fail"}function OI(e){return{theme:"custom",customTheme:e.colors,...e.font?{font:e.font}:{},...e.radius!=null?{radius:e.radius}:{},...e.hacker!=null?{hacker:e.hacker}:{}}}function t2(e){return btoa(unescape(encodeURIComponent(e)))}function a2(e){let t=e+"=".repeat((4-e.length%4)%4);return decodeURIComponent(escape(atob(t)))}function LI(e){let t=$C(e.colors),a={c:[e.colors.bg,e.colors.surface,e.colors.text,e.colors.accent],o:Object.keys(t).length?t:void 0,f:e.font,r:e.radius,h:e.hacker?1:0};return Kd+t2(JSON.stringify(a)).replace(/=+$/,"")}function zI(e){try{let t=String(e||"").trim();if(t=t.replace(/^#?/,"").replace(/^theme=/,""),t.startsWith(Kd)&&(t=t.slice(Kd.length)),!t)return null;let a=JSON.parse(a2(t));if(!a||!Array.isArray(a.c))return null;let o=a.o&&typeof a.o=="object"?a.o:{};return{colors:es({bg:a.c[0],surface:a.c[1],text:a.c[2],accent:a.c[3],...o}),font:typeof a.f=="string"?a.f:void 0,radius:typeof a.r=="number"?a.r:void 0,hacker:a.h===1}}catch{return null}}function HI(e){let t=String(e||"").trim();if(!t)return null;try{let i=JSON.parse(t);if(i&&typeof i=="object"&&(i.bg||i.accent))return es(i)}catch{}let a=i=>{let f=t.match(new RegExp(`--xray-${i}\\s*:\\s*(#[0-9a-fA-F]{3,6})`));return f?f[1]:void 0},o=a("bg"),r=a("surface"),n=a("text"),l=a("accent");if(!o&&!r&&!n&&!l)return null;let s={};for(let i of ts){let f=a(i);f&&(s[i]=f)}return es({bg:o,surface:r,text:n,accent:l,...s})}function df(e){let t=Ea(Ze(e.bg,ga.bg)),a=Ea(Ze(e.surface,ga.surface)),o=Ea(Ze(e.text,ga.text)),r=Ze(e.accent,ga.accent),l=JC(t)>140?r2:o2,s={bg:to(t),surface:to(a),surface2:to(Jl(a,o,.1)),surface3:to(Jl(a,o,.18)),text:to(o),subtext:to(Jl(o,t,.34)),hint:to(Jl(o,t,.55)),border:to(Jl(a,o,.16)),accent:r,green:l.green,red:l.red,yellow:l.yellow,blue:l.blue,mauve:l.mauve,teal:l.teal,peach:l.peach},i={...s};for(let f of DI)Fn(e[f])&&(i[f]=Ze(e[f],s[f]));return i}function Zd(e,t){return!EI.includes(t)&&Fn(e[t])}function Sr(e){let t=df(e),a=Ea(t.bg),o=Ea(t.surface),r=Ea(t.surface2),n=Ea(t.text),l=Fn(e.border)?Ze(e.border,t.border):`rgba(${En(n)}, 0.16)`;return{"--xray-bg":t.bg,"--xray-surface":t.surface,"--xray-surface2":t.surface2,"--xray-surface3":t.surface3,"--xray-text":t.text,"--xray-subtext":t.subtext,"--xray-hint":t.hint,"--xray-bg-rgb":En(a),"--xray-surface-rgb":En(o),"--xray-surface2-rgb":En(r),"--xray-text-rgb":En(n),"--xray-border":l,"--xray-accent":t.accent,"--xray-green":t.green,"--xray-red":t.red,"--xray-yellow":t.yellow,"--xray-blue":t.blue,"--xray-mauve":t.mauve,"--xray-teal":t.teal,"--xray-peach":t.peach,"--xray-operator-grid":`rgba(${En(n)}, 0.03)`}}var ga,EI,DI,ts,FI,MI,Kd,o2,r2,Nn=E(()=>{"use strict";ga={bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#7c5cff"},EI=["bg","surface","text","accent"],DI=["bg","surface","surface2","surface3","text","subtext","hint","border","accent","green","red","yellow","blue","mauve","teal","peach"],ts=DI.filter(e=>!EI.includes(e)),FI=/^#[0-9a-fA-F]{6}$/;MI=["#7c5cff","#22d3ee","#fb7185","#34d399","#f59e0b","#a78bfa","#38bdf8","#f472b6","#4ade80","#e879f9"];Kd="xray1:";o2={green:"#a6e3a1",red:"#f38ba8",yellow:"#f9e2af",blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",peach:"#fab387"},r2={green:"#0f8a4f",red:"#d6336c",yellow:"#b7791f",blue:"#1971c2",mauve:"#7048e8",teal:"#0c8599",peach:"#d9480f"}});function p2(e){let t=e.replace("#","");if(t.length!==6)return!1;let a=[0,2,4].map(l=>{let s=parseInt(t.slice(l,l+2),16)/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4}),[o,r,n]=a;return .2126*o+.7152*r+.0722*n>.35}function m2(e){return e.theme==="custom"?p2(e.customTheme?.bg??""):d2.has(e.theme)}function Bn(e){let t=m2(e)?u2:Wd;return t[e.accent]??t.blue}function x2(e,t){return n2.includes(e)?e:t}function y2(e,t){return l2.includes(e)?e:t}function g2(e,t){return s2.includes(e)?e:t}function h2(e,t){return i2.includes(e)?e:t}function I2(e,t){return f2.includes(e)?e:t}function b2(e,t){return c2.includes(e)?e:t}function yf(e){let t=Object.fromEntries(Object.entries(e||{}).filter(([,o])=>o!==void 0)),a={...We,...t};return{captureFetch:!!a.captureFetch,captureXhr:!!a.captureXhr,captureWs:!!a.captureWs,maxEntries:ya(a.maxEntries,We.maxEntries,50,5e3),slowThresholdMs:ya(a.slowThresholdMs,We.slowThresholdMs,100,5e3),verySlowThresholdMs:ya(a.verySlowThresholdMs,We.verySlowThresholdMs,200,1e4),defaultDetailView:x2(a.defaultDetailView,We.defaultDetailView),compactRows:!!a.compactRows,showHostInPath:!!a.showHostInPath,accent:y2(a.accent,We.accent),theme:g2(a.theme,We.theme),customTheme:es(a.customTheme),font:h2(a.font,We.font),density:I2(a.density,We.density),radius:ya(a.radius,We.radius,0,20),glow:!!a.glow,hacker:!!a.hacker,confirmDestructiveActions:!!a.confirmDestructiveActions,panelWidth:ya(a.panelWidth,We.panelWidth,pf,mf),dockSide:b2(a.dockSide,We.dockSide),apiSplit:ya(a.apiSplit,We.apiSplit,0,2e3),logsSplit:ya(a.logsSplit,We.logsSplit,0,2e3),firstRunDismissed:!!a.firstRunDismissed}}var n2,l2,s2,i2,f2,c2,pf,mf,Wd,u2,d2,xf,We,On=E(()=>{"use strict";Nn();ke();n2=["tree","grid","raw","schema","diff","viz","waterfall","headers"],l2=["blue","mauve","teal","green","peach","coral"],s2=["operator","dev-edition","midnight","light-lab","claude","custom"],i2=["jetbrains","cascadia","iosevka","system"],f2=["compact","comfortable","spacious"],c2=["left","right"],pf=360,mf=2e3,Wd={blue:"#89b4fa",mauve:"#cba6f7",teal:"#94e2d5",green:"#a6e3a1",peach:"#fab387",coral:"#d97757"},u2={blue:"#1e66f5",mauve:"#8839ef",teal:"#0f7a80",green:"#2f8a1f",peach:"#c4560a",coral:"#b84a24"},d2=new Set(["light-lab","claude"]);xf={jetbrains:"'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",cascadia:"'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono', monospace",iosevka:"'Iosevka', 'JetBrains Mono', 'Fira Code', monospace",system:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"},We={captureFetch:!0,captureXhr:!0,captureWs:!0,maxEntries:1e3,slowThresholdMs:500,verySlowThresholdMs:1e3,defaultDetailView:"tree",compactRows:!1,showHostInPath:!0,accent:"blue",theme:"operator",customTheme:ga,font:"jetbrains",density:"compact",radius:10,glow:!0,hacker:!1,confirmDestructiveActions:!0,panelWidth:960,dockSide:"right",apiSplit:0,logsSplit:0,firstRunDismissed:!1}});function _I(e){return{activeTab:e.activeTab,detailView:e.detailView,detailTab:e.detailTab,consoleMiniTab:e.consoleMiniTab,networkFilter:e.networkFilter,apiSearchQuery:e.apiSearchQuery,apiQuickFilter:e.apiQuickFilter,apiGroupingMode:e.apiGroupingMode,apiDetailOpen:e.apiDetailOpen,apiDrawerPlacement:e.apiDrawerPlacement,methodFilters:Array.from(e.methodFilters),statusFilters:Array.from(e.statusFilters),typeFilters:Array.from(e.typeFilters),expandedGroups:Array.from(e.expandedGroups),collapsedSections:Array.from(e.collapsedSections),sortField:e.sortField,sortOrder:e.sortOrder,recording:e.recording,pinnedIds:Array.from(e.pinnedIds),snippets:e.snippets,settings:e.settings}}function S2(e){return Array.isArray(e)?e.filter(a=>a&&typeof a.id=="string"&&typeof a.code=="string").slice(0,30).map(a=>({id:a.id,title:a.title,code:a.code})):void 0}function PI(e){let t=S2(e.snippets);return{...e.activeTab&&v2.includes(e.activeTab)?{activeTab:e.activeTab}:{},...e.detailView?{detailView:e.detailView}:{},...e.detailTab?{detailTab:e.detailTab}:{},...e.consoleMiniTab?{consoleMiniTab:e.consoleMiniTab}:{},...e.networkFilter?{networkFilter:e.networkFilter}:{},...typeof e.apiSearchQuery=="string"?{apiSearchQuery:e.apiSearchQuery}:{},...e.apiQuickFilter?{apiQuickFilter:e.apiQuickFilter}:{},...e.apiGroupingMode?{apiGroupingMode:e.apiGroupingMode}:{},...typeof e.apiDetailOpen=="boolean"?{apiDetailOpen:e.apiDetailOpen}:{},...e.apiDrawerPlacement?{apiDrawerPlacement:e.apiDrawerPlacement}:{},...Array.isArray(e.methodFilters)?{methodFilters:new Set(e.methodFilters)}:{},...Array.isArray(e.statusFilters)?{statusFilters:new Set(e.statusFilters)}:{},...Array.isArray(e.typeFilters)?{typeFilters:new Set(e.typeFilters)}:{},...Array.isArray(e.expandedGroups)?{expandedGroups:new Set(e.expandedGroups)}:{},...Array.isArray(e.collapsedSections)?{collapsedSections:new Set(e.collapsedSections)}:{},...e.sortField?{sortField:e.sortField}:{},...e.sortOrder?{sortOrder:e.sortOrder}:{},...typeof e.recording=="boolean"?{recording:e.recording}:{},...Array.isArray(e.pinnedIds)?{pinnedIds:new Set(e.pinnedIds)}:{},...t?{snippets:t}:{},...e.settings?{settings:yf(e.settings)}:{}}}var $d,v2,qI=E(()=>{"use strict";On();$d="react_panel_preferences",v2=["console","api","logs","rules","insights"]});function Jd(){return"rule_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}function UI(){return{id:Jd(),label:"New rule",enabled:!0,match:{url:"",method:""},action:{type:"mock",status:200,body:`{
  "mocked": true
}`,headers:{},delayMs:0}}}function hf(e){let t=e||{},a=t.match||{url:"",method:""},o=t.action||{type:"mock",status:200,body:"",headers:{},delayMs:0},r=["mock","delay","fail","passthrough"].includes(o.type)?o.type:"mock",n={};return o.headers&&typeof o.headers=="object"&&Object.entries(o.headers).forEach(([l,s])=>{typeof l=="string"&&l&&(n[l]=String(s))}),{id:typeof t.id=="string"&&t.id?t.id:Jd(),label:typeof t.label=="string"?t.label.slice(0,120):"Rule",enabled:t.enabled!==!1,match:{url:typeof a.url=="string"?a.url.slice(0,2e3):"",method:typeof a.method=="string"?a.method.toUpperCase().slice(0,12):""},action:{type:r,status:ya(o.status,200,200,599),body:typeof o.body=="string"?o.body.slice(0,1e5):"",headers:n,delayMs:ya(o.delayMs,0,0,6e4)}}}function If(e){return Array.isArray(e)?e.slice(0,w2).map(t=>hf(t)):[]}function XI(e){return e.filter(t=>t.enabled&&t.match.url.trim()).map(t=>({id:t.id,enabled:!0,match:{url:t.match.url.trim(),method:t.match.method},action:t.action}))}function GI(e){let t=e.match.method||"ANY";return e.action.type==="mock"?`${t} \u2192 mock ${e.action.status}`:e.action.type==="fail"?`${t} \u2192 network failure`:e.action.type==="delay"?`${t} \u2192 delay ${e.action.delayMs}ms`:`${t} \u2192 passthrough`}function VI(e){return JSON.stringify({[C2]:1,rules:e},null,2)}function YI(e){let t=String(e||"").trim();if(!t)return null;let a;try{a=JSON.parse(t)}catch{return null}let o=Array.isArray(a)?a:a&&typeof a=="object"&&Array.isArray(a.rules)?a.rules:null;if(!o||!o.length)return null;let r=If(o).map(n=>({...n,id:Jd()}));return r.length?r:null}var gf,w2,jI,C2,bf=E(()=>{"use strict";ke();gf="traffic_rules",w2=50;jI=[{label:"Throttle all (+2s)",rule:{label:"Throttle all (+2s)",match:{url:"re:.*",method:""},action:{type:"delay",status:200,body:"",headers:{},delayMs:2e3}}},{label:"Offline (fail all)",rule:{label:"Offline (fail all)",match:{url:"re:.*",method:""},action:{type:"fail",status:0,body:"",headers:{},delayMs:0}}},{label:"Force 500 on /api",rule:{label:"Force 500 on /api",match:{url:"/api/",method:""},action:{type:"mock",status:500,body:`{
  "error": "Injected server error"
}`,headers:{},delayMs:0}}},{label:"Empty list on /api",rule:{label:"Empty list on /api",match:{url:"/api/",method:"GET"},action:{type:"mock",status:200,body:"[]",headers:{},delayMs:0}}},{label:"Rate limit (429)",rule:{label:"Rate limit (429)",match:{url:"/api/",method:""},action:{type:"mock",status:429,body:`{
  "error": "Too many requests"
}`,headers:{},delayMs:0}}}],C2="xray-rules"});function k2(){return window.__XRAY_BRIDGE_TOKEN__||window.__XRAY_bridgeToken||void 0}function A2(){try{let e=chrome.devtools?.inspectedWindow?.tabId;return typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}catch{return null}}function vf(e,t){let a=k2(),o=e==="config"?"__xray_config__":"__xray_replay__";if(a)try{return window.postMessage({[o]:!0,source:"xray-react-ui",token:a,...t},"*"),!0}catch{return!1}let r=A2(),n=typeof chrome<"u"?chrome.runtime:void 0;if(r!=null&&n?.sendMessage)try{return n.sendMessage({type:"xray:page-bridge",tabId:r,kind:e,...t},()=>{n.lastError}),!0}catch{return!1}return!1}function Sf(e){vf("config",{config:{captureFetch:e.captureFetch,captureXhr:e.captureXhr,captureWs:e.captureWs}})}function wf(e){vf("config",{config:{rules:XI(e)}})}var QI=E(()=>{"use strict";bf()});function Af(e){if(!Pe(e))return"";let t=Number(e.status)||0;if(t>=400||t===0)return"";let a=Cf.get(e.id);if(a!==void 0)return a;let o=pe(e),r=o==null?"":W(sa(o),0,2e4);return Cf.size>4096&&Cf.clear(),Cf.set(e.id,r),r}function ep(e){let t=kf.get(e.id);if(t!==void 0)return t;let a=Et(e);return kf.size>4096&&kf.clear(),kf.set(e.id,a),a}function KI(e){let t=new Map;for(let a of e)tp(t,a);return t}function tp(e,t){!Pe(t)||!Af(t)||e.set(ep(t),t)}function ZI(e,t,a){let o=Af(e);if(!o)return{driftFromId:null};let r=ep(e);if(a){let n=a.get(r);if(!n||n.id===e.id)return{driftFromId:null};let l=Af(n);return{driftFromId:!l||l===o?null:n.id}}for(let n=t.length-1;n>=0;n-=1){let l=t[n];if(!Pe(l)||l.id===e.id||ep(l)!==r)continue;let s=Af(l);if(s)return{driftFromId:s===o?null:l.id}}return{driftFromId:null}}var Cf,kf,WI=E(()=>{"use strict";Dt();ke();Cf=new Map;kf=new Map});function Ln(e){if(typeof e=="string")return e.length>2e4?e.slice(0,2e4)+"\u2026":e;if(!e||typeof e!="object")return e;try{let t=JSON.stringify(e);return!t||t.length<=2e4?e:t.slice(0,2e4)+"\u2026"}catch{return}}function $I(e){return e.slice(-500).map(t=>{let a={...t};return a.responseRaw=Ln(t.responseRaw),a.responseDecrypted=Ln(t.responseDecrypted),a.requestBody=Ln(t.requestBody),a.logData=Ln(t.logData),a.message=typeof t.message=="string"?Ln(t.message):t.message,Array.isArray(t.args)&&(a.args=t.args.slice(0,20).map(Ln)),Array.isArray(t.wsFrames)&&t.wsFrames.length>50&&(a.wsFrames=t.wsFrames.slice(-50)),a})}function JI(e){return Array.isArray(e)?e.filter(t=>!!t&&typeof t=="object"&&typeof t.id=="string").slice(-500):[]}var Rf,ap,eb=E(()=>{"use strict";Rf="session_entries",ap="ai_settings"});function ob(e){if(e.type==="api"){let o=Number(e.status)||0;return{id:"evt_"+e.id,type:"network",level:o>=400?"error":o>=300?"warn":"info",timestamp:Number(e.timestamp)||Date.now(),message:`${e.method||"GET"} ${e.status||""} ${e.urlPath||e.url||""}`.trim(),args:[e],entryId:e.id}}let t=e.logLevel||"log",a=Array.isArray(e.args)?e.args:Array.isArray(e.logData)?e.logData:[e.logData??e.message??""];return{id:"evt_"+e.id,type:"log",level:t,timestamp:Number(e.timestamp)||Date.now(),message:String(e.message??a.map(o=>typeof o=="string"?o:R2(o)).join(" ")).slice(0,600),args:a,entryId:e.id}}function R2(e){try{return JSON.stringify(e,(t,a)=>t==="__xray_ref__"?void 0:a)??String(e)}catch{return String(e)}}function rb(e){op||(op=setTimeout(()=>{op=null;try{Ir(Rf,$I(e().entries))}catch{}},4e3))}function Ef(e){wr&&(clearTimeout(wr),wr=null),Ir(gf,e),wf(e)}function M2(e){wr&&clearTimeout(wr),wr=setTimeout(()=>{wr=null,Ir(gf,e),wf(e)},300)}function Ie(e){Ir($d,_I(e))}function nb(){let{entries:e,selectedId:t}=I.getState();return t&&e.find(a=>a.id===t)||null}var tb,as,ab,op,Mf,Uo,Tf,rp,I,wr,$e=E(()=>{"use strict";uI();Dt();Yd();RI();qI();On();QI();WI();bf();eb();tb=1e3,as=2e3,ab={provider:"anthropic",model:"claude-fable-5",apiKey:"",baseUrl:"",authHeader:"authorization",authPrefix:"Bearer "},op=null,Mf=null;Uo=[],Tf=new Map,rp=null,I=fI((e,t)=>({initialized:!1,open:!1,devtoolsMode:!1,activeTab:"console",detailView:"tree",detailTab:"response",consoleMiniTab:"network",networkFilter:"all",searchQuery:"",apiSearchQuery:"",apiQuickFilter:"all",apiGroupingMode:"flat",apiDetailOpen:!1,apiDrawerPlacement:"right",methodFilters:new Set,statusFilters:new Set,typeFilters:new Set,expandedGroups:new Set,collapsedSections:new Set,sortField:"timestamp",sortOrder:"desc",recording:!0,pausedCount:0,entries:[],consoleEvents:[],consoleDraft:"",snippets:[{id:"snip_default",title:"Response schema",code:"schema(res)"}],rules:[],aiSettings:ab,selectedId:null,expandedId:null,pinnedIds:new Set,exportOpen:!1,settingsOpen:!1,settingsSection:"general",commandOpen:!1,globalSearchOpen:!1,replayEditorEntry:null,explainEntry:null,pendingConfirmation:null,settings:We,toastMessage:null,setInitialized:a=>e({initialized:a}),setOpen:a=>{window.__XRAY_focusTrapActive=a;let o=!t().devtoolsMode;if(a&&o){let r=document.activeElement;Mf=r instanceof HTMLElement&&r.id!=="__xray_root__"?r:null}if(e({open:a}),!a&&o&&Mf){let r=Mf;Mf=null;try{r.focus()}catch{}}},setDevtoolsMode:a=>e({devtoolsMode:a,open:a?!0:t().open}),setActiveTab:a=>{e({activeTab:a}),Ie(t())},setDetailView:a=>{e({detailView:a}),Ie(t())},setDetailTab:a=>{e({detailTab:a}),Ie(t())},setConsoleMiniTab:a=>{e({consoleMiniTab:a}),Ie(t())},setNetworkFilter:a=>{e({networkFilter:a}),Ie(t())},setSearchQuery:a=>e({searchQuery:a}),setApiSearchQuery:a=>{e({apiSearchQuery:a}),Ie(t())},setApiQuickFilter:a=>{e({apiQuickFilter:a}),Ie(t())},setApiGroupingMode:a=>{e({apiGroupingMode:a}),Ie(t())},setApiDetailOpen:a=>{e({apiDetailOpen:a}),Ie(t())},setApiDrawerPlacement:a=>{e({apiDrawerPlacement:a}),Ie(t())},toggleMethodFilter:a=>{let o=new Set(t().methodFilters),r=a.toUpperCase();o.has(r)?o.delete(r):o.add(r),e({methodFilters:o}),Ie(t())},toggleStatusFilter:a=>{let o=new Set(t().statusFilters);o.has(a)?o.delete(a):o.add(a),e({statusFilters:o}),Ie(t())},toggleTypeFilter:a=>{let o=new Set(t().typeFilters);o.has(a)?o.delete(a):o.add(a),e({typeFilters:o}),Ie(t())},clearApiFilters:()=>{e({apiQuickFilter:"all",methodFilters:new Set,statusFilters:new Set,typeFilters:new Set}),Ie(t())},togglePinned:a=>{let o=new Set(t().pinnedIds);o.has(a)?o.delete(a):o.add(a),e({pinnedIds:o}),Ie(t())},clearPinned:()=>{e({pinnedIds:new Set}),Ie(t())},toggleGroup:a=>{let o=new Set(t().expandedGroups);o.has(a)?o.delete(a):o.add(a),e({expandedGroups:o}),Ie(t())},toggleSection:a=>{let o=new Set(t().collapsedSections);o.has(a)?o.delete(a):o.add(a),e({collapsedSections:o}),Ie(t())},setSort:a=>{let{sortField:o,sortOrder:r}=t();e({sortField:a,sortOrder:o===a&&r==="desc"?"asc":"desc"}),Ie(t())},setRecording:a=>{if(a&&Uo.length){let o=Uo;Uo=[],e({recording:!0,pausedCount:0,consoleEvents:[...t().consoleEvents,...o].slice(-as)})}else e({recording:a,...a?{pausedCount:0}:{}});Ie(t())},addEntry:a=>t().addEntries([a]),addEntries:a=>{if(!a.length)return;let o=t(),r=Math.max(50,Math.min(5e3,Number(o.settings.maxEntries)||tb)),n=o.entries.slice(),l=KI(n),s=[];for(let u of a){if(!u)continue;let x=u.id||"entry_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8),d=ZI({...u,id:x},n,l),p={...u,id:x,...d.driftFromId?{driftFromId:d.driftFromId}:{}};n.push(p),tp(l,p),s.push(ob(p))}let i=cf(n,r,ff(o)),f={entries:i.entries};if(i.dropped.size){let u=new Set([...o.pinnedIds].filter(x=>!i.dropped.has(x)));u.size!==o.pinnedIds.size&&(f.pinnedIds=u)}o.recording?f.consoleEvents=[...o.consoleEvents,...s].slice(-as):(Uo=[...Uo,...s].slice(-as),f.pausedCount=Uo.length),e(f),rb(t)},updateEntry:a=>{let o=Tf.get(a.id);Tf.set(a.id,o?{...o,...a}:a),rp===null&&(rp=window.setTimeout(()=>{rp=null;let r=Tf;if(!r.size)return;Tf=new Map;let n=!1,l=t().entries.map(s=>{let i=r.get(s.id);return i?(n=!0,{...s,...i}):s});n&&(e({entries:l}),rb(t))},50))},restoreEntries:a=>{if(!a.length)return;let o=Math.max(50,Math.min(5e3,Number(t().settings.maxEntries)||tb)),r=new Set(t().entries.map(d=>d.id)),n=a.filter(d=>!r.has(d.id)),l=n.slice(-o),s=Math.max(0,o-l.length),i=cf(t().entries,s,ff(t())).entries,f=[...l,...i],u=new Set(f.map(d=>d.id)),x=n.filter(d=>u.has(d.id)).map(ob);e({entries:f,consoleEvents:[...x,...t().consoleEvents].slice(-as)})},addRule:a=>{let o=hf({...UI(),...a||{}}),r=[...t().rules,o].slice(0,50);e({rules:r,activeTab:"rules"}),Ef(r)},updateRule:(a,o)=>{let r=t().rules.map(n=>n.id===a?hf({...n,...o,match:{...n.match,...o.match||{}},action:{...n.action,...o.action||{}}}):n);e({rules:r}),M2(r)},removeRule:a=>{let o=t().rules.filter(r=>r.id!==a);e({rules:o}),Ef(o)},toggleRule:a=>{let o=t().rules.map(r=>r.id===a?{...r,enabled:!r.enabled}:r);e({rules:o}),Ef(o)},setRules:a=>{let o=If(a);e({rules:o}),Ef(o)},setAiSettings:a=>{let o={...t().aiSettings,...a};e({aiSettings:o}),Ir(ap,o)},replayEntry:(a,o)=>{let r={...a,...o||{}},n={url:String(r.url||""),method:String(r.method||"GET"),headers:r.requestHeaders||{},body:r.requestBody??null,replayOf:a.id};vf("replay",{request:n})?t().showToast("Replaying request\u2026"):t().showToast("Replay needs a live page \u2014 open XRAY on the page itself.")},openReplayEditor:a=>e({replayEditorEntry:a}),closeReplayEditor:()=>e({replayEditorEntry:null}),openExplain:a=>e({explainEntry:a}),closeExplain:()=>e({explainEntry:null}),clearConsole:()=>{Uo=[],e({consoleEvents:[],expandedId:null,pausedCount:0})},clearEntries:()=>{Uo=[],jd(null),e({entries:[],consoleEvents:[],selectedId:null,expandedId:null,pinnedIds:new Set,pausedCount:0}),Ie(t()),Ir(Rf,[])},addConsoleEvent:a=>{let o=[...t().consoleEvents,a].slice(-as);e({consoleEvents:o,expandedId:a.type==="result"||a.type==="error"?a.id:t().expandedId})},setConsoleDraft:a=>e({consoleDraft:a}),insertConsoleCommand:a=>e({consoleDraft:a,activeTab:"console"}),saveSnippet:a=>{let o=a.code.trim();if(!o)return;let r=t().snippets.filter(s=>s.code!==o),l=[{id:"snip_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8),title:a.title,code:o},...r].slice(0,30);e({snippets:l,activeTab:"console"}),Ie(t())},renameSnippet:(a,o)=>{let r=o.trim();e({snippets:t().snippets.map(n=>n.id===a?{...n,title:r||void 0}:n)}),Ie(t())},removeSnippet:a=>{e({snippets:t().snippets.filter(o=>o.id!==a)}),Ie(t())},selectEntry:(a,o)=>{let r=a&&t().entries.find(l=>l.id===a)||null;jd(r);let n=o?.openDetail!==!1;e({selectedId:a,expandedId:a?"evt_"+a:null,apiDetailOpen:r?.type==="api"&&n?!0:t().apiDetailOpen})},toggleExpanded:a=>e({expandedId:t().expandedId===a?null:a}),setExportOpen:a=>e({exportOpen:a}),setSettingsOpen:a=>e({settingsOpen:a}),openSettings:a=>e({settingsSection:a,settingsOpen:!0}),setCommandOpen:a=>e({commandOpen:a}),setGlobalSearchOpen:a=>e({globalSearchOpen:a}),updateSettings:a=>{let o=yf({...t().settings,...a});e({settings:o,detailView:a.defaultDetailView?o.defaultDetailView:t().detailView,entries:cf(t().entries,o.maxEntries,ff(t())).entries}),Sf(o),Ie(t())},resetSettings:()=>{let a=We;e({settings:a,detailView:a.defaultDetailView}),Sf(a),Ie(t())},requestConfirmation:a=>e({pendingConfirmation:{id:a.id||"confirm_"+Date.now().toString(36),title:a.title,message:a.message,confirmLabel:a.confirmLabel,cancelLabel:a.cancelLabel,tone:a.tone,onConfirm:a.onConfirm}}),closeConfirmation:()=>e({pendingConfirmation:null}),confirmPending:()=>{let a=t().pendingConfirmation;a&&(e({pendingConfirmation:null}),a.onConfirm())},showToast:a=>e({toastMessage:a}),clearToast:()=>e({toastMessage:null}),restorePreferences:async()=>{let[a,o,r,n]=await Promise.all([$l($d,{}),$l(gf,[]),$l(ap,null),$l(Rf,[])]),l=PI(a),s=If(o);e({...l,rules:s,...r?{aiSettings:{...ab,...r}}:{}});let i=I.getState().settings;Sf(i),wf(s);let f=JI(n);f.length&&!I.getState().entries.length&&I.getState().restoreEntries(f)}}));wr=null});function lb(e,t,a){let o=new Array(e);return new Proxy(o,{get(r,n,l){if(typeof n=="string"){let s=n.charCodeAt(0);if(s>=48&&s<=57){let i=+n;if(Number.isInteger(i)&&i>=0&&i<e){let f=r[i];if(!f){let u=t[i*2];f=r[i]={index:i,key:a(i),start:u,size:t[i*2+1],end:u+t[i*2+1],lane:0}}return f}}if(n==="length")return e}return Reflect.get(r,n,l)}})}var sb=E(()=>{});function Cr(e,t,a){let o=a.initialDeps??[],r,n=!0;function l(){var s;let f=0,u=e();if(!(u.length!==o.length||u.some((p,v)=>o[v]!==p)))return r;o=u;let d=0;return r=t(...u),a?.onChange&&!(n&&a.skipInitialOnChange)&&a.onChange(r),n=!1,r}return l.updateDeps=s=>{o=s},l}function np(e,t){if(e===void 0)throw new Error(`Unexpected undefined${t?`: ${t}`:""}`);return e}var lp,ib,fb=E(()=>{lp=(e,t)=>Math.abs(e-t)<1.01,ib=(e,t,a)=>{let o;return function(...r){e.clearTimeout(o),o=e.setTimeout(()=>t.apply(this,r),a)}}});function O2({measurements:e,outerSize:t,scrollOffset:a,lanes:o,flat:r}){let n=e.length-1,l=r?u=>r[u*2]:u=>e[u].start,s=r?u=>r[u*2]+r[u*2+1]:u=>e[u].end;if(e.length<=o)return{startIndex:0,endIndex:n};let i=xb(0,n,l,a),f=i;if(o===1)for(;f<n&&s(f)<a+t;)f++;else if(o>1){let u=Array(o).fill(0);for(;f<n&&u.some(d=>d<a+t);){let d=e[f];u[d.lane]=d.end,f++}let x=Array(o).fill(a+t);for(;i>=0&&x.some(d=>d>=a);){let d=e[i];x[d.lane]=d.start,i--}i=Math.max(0,i-i%o),f=Math.min(n,f+(o-1-f%o))}return{startIndex:i,endIndex:f}}var os,cb,ub,T2,E2,db,Df,D2,F2,pb,N2,B2,mb,Ff,xb,sp=E(()=>{sb();fb();cb=()=>{if(os!==void 0)return os;if(typeof navigator>"u")return os=!1;if(/iP(hone|od|ad)/.test(navigator.userAgent))return os=!0;let e=navigator.maxTouchPoints;return os=navigator.platform==="MacIntel"&&e!==void 0&&e>0},ub=e=>{let{offsetWidth:t,offsetHeight:a}=e;return{width:t,height:a}},T2=e=>e,E2=e=>{let t=Math.max(e.startIndex-e.overscan,0),o=Math.min(e.endIndex+e.overscan,e.count-1)-t+1,r=new Array(o);for(let n=0;n<o;n++)r[n]=t+n;return r},db=(e,t)=>{let a=e.scrollElement;if(!a)return;let o=e.targetWindow;if(!o)return;let r=l=>{let{width:s,height:i}=l;t({width:Math.round(s),height:Math.round(i)})};if(r(ub(a)),!o.ResizeObserver)return()=>{};let n=new o.ResizeObserver(l=>{let s=()=>{let i=l[0];if(i?.borderBoxSize){let f=i.borderBoxSize[0];if(f){r({width:f.inlineSize,height:f.blockSize});return}}r(ub(a))};e.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(s):s()});return n.observe(a,{box:"border-box"}),()=>{n.unobserve(a)}},Df={passive:!0},D2=typeof window>"u"?!0:"onscrollend"in window,F2=(e,t,a)=>{let o=e.scrollElement;if(!o)return;let r=e.targetWindow;if(!r)return;let n=e.options.useScrollendEvent&&D2,l=0,s=n?null:ib(r,()=>t(l,!1),e.options.isScrollingResetDelay),i=x=>()=>{l=a(o),s?.(),t(l,x)},f=i(!0),u=i(!1);return o.addEventListener("scroll",f,Df),n&&o.addEventListener("scrollend",u,Df),()=>{o.removeEventListener("scroll",f),n&&o.removeEventListener("scrollend",u)}},pb=(e,t)=>F2(e,t,a=>{let{horizontal:o,isRtl:r}=e.options;return o?a.scrollLeft*(r&&-1||1):a.scrollTop}),N2=(e,t,a)=>{if(t?.borderBoxSize){let o=t.borderBoxSize[0];if(o)return Math.round(o[a.options.horizontal?"inlineSize":"blockSize"])}return e[a.options.horizontal?"offsetWidth":"offsetHeight"]},B2=(e,{adjustments:t=0,behavior:a},o)=>{var r,n;(n=(r=o.scrollElement)==null?void 0:r.scrollTo)==null||n.call(r,{[o.options.horizontal?"left":"top"]:e+t,behavior:a})},mb=B2,Ff=class{constructor(t){this.unsubs=[],this.scrollElement=null,this.targetWindow=null,this.isScrolling=!1,this.scrollState=null,this.measurementsCache=[],this._flatMeasurements=null,this.itemSizeCache=new Map,this.itemSizeCacheVersion=0,this.laneAssignments=new Map,this.pendingMin=null,this.prevLanes=void 0,this.lanesChangedFlag=!1,this.lanesSettling=!1,this.pendingScrollAnchor=null,this.scrollRect=null,this.scrollOffset=null,this.scrollDirection=null,this.scrollAdjustments=0,this._iosDeferredAdjustment=0,this._iosTouching=!1,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._intendedScrollOffset=null,this.elementsCache=new Map,this.now=()=>{var a,o,r;return((r=(o=(a=this.targetWindow)==null?void 0:a.performance)==null?void 0:o.now)==null?void 0:r.call(o))??Date.now()},this.observer=(()=>{let a=null,o=()=>a||(!this.targetWindow||!this.targetWindow.ResizeObserver?null:a=new this.targetWindow.ResizeObserver(r=>{r.forEach(n=>{let l=()=>{let s=n.target,i=this.indexFromElement(s);if(!s.isConnected){this.observer.unobserve(s);for(let[f,u]of this.elementsCache)if(u===s){this.elementsCache.delete(f);break}return}this.shouldMeasureDuringScroll(i)&&this.resizeItem(i,this.options.measureElement(s,n,this))};this.options.useAnimationFrameWithResizeObserver?requestAnimationFrame(l):l()})}));return{disconnect:()=>{var r;(r=o())==null||r.disconnect(),a=null},observe:r=>{var n;return(n=o())==null?void 0:n.observe(r,{box:"border-box"})},unobserve:r=>{var n;return(n=o())==null?void 0:n.unobserve(r)}}})(),this.range=null,this.setOptions=a=>{var o,r;let n={debug:!1,initialOffset:0,overscan:1,paddingStart:0,paddingEnd:0,scrollPaddingStart:0,scrollPaddingEnd:0,horizontal:!1,getItemKey:T2,rangeExtractor:E2,onChange:()=>{},measureElement:N2,initialRect:{width:0,height:0},scrollMargin:0,gap:0,indexAttribute:"data-index",initialMeasurementsCache:[],lanes:1,anchorTo:"start",followOnAppend:!1,scrollEndThreshold:1,isScrollingResetDelay:150,enabled:!0,isRtl:!1,useScrollendEvent:!1,useAnimationFrameWithResizeObserver:!1,laneAssignmentMode:"estimate"};for(let f in a){let u=a[f];u!==void 0&&(n[f]=u)}let l=this.options,s=null,i=null;if(l!==void 0&&l.enabled&&n.enabled&&n.anchorTo==="end"&&this.scrollElement!==null){let f=l.count,u=n.count,x=this.getMeasurements(),d=f>0?((o=x[0])==null?void 0:o.key)??l.getItemKey(0):null,p=f>0?((r=x[f-1])==null?void 0:r.key)??l.getItemKey(f-1):null;if(u!==f||f>0&&u>0&&(n.getItemKey(0)!==d||n.getItemKey(u-1)!==p)){let D=f>0?this.getVirtualItemForOffset(this.getScrollOffset())??x[0]:null;D&&(s=[D.key,this.getScrollOffset()-D.start]);let y=n.followOnAppend===!0?"auto":n.followOnAppend||null;y&&u>f&&this.isAtEnd(l.scrollEndThreshold)&&(f===0||n.getItemKey(u-1)!==p)&&(i=y)}}this.options=n,(s||i)&&(this.pendingScrollAnchor=[s?.[0]??null,s?.[1]??0,i])},this.notify=a=>{var o,r;(r=(o=this.options).onChange)==null||r.call(o,this,a)},this.maybeNotify=Cr(()=>(this.calculateRange(),[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]),a=>{this.notify(a)},{key:!1,debug:()=>this.options.debug,initialDeps:[this.isScrolling,this.range?this.range.startIndex:null,this.range?this.range.endIndex:null]}),this.cleanup=()=>{this.unsubs.filter(Boolean).forEach(a=>a()),this.unsubs=[],this.observer.disconnect(),this.rafId!=null&&this.targetWindow&&(this.targetWindow.cancelAnimationFrame(this.rafId),this.rafId=null),this.scrollState=null,this.scrollElement=null,this.targetWindow=null},this._didMount=()=>()=>{this.cleanup()},this._willUpdate=()=>{var a;let o=this.options.enabled?this.options.getScrollElement():null;if(this.scrollElement!==o){if(this.cleanup(),!o){this.maybeNotify();return}if(this.scrollElement=o,this.scrollElement&&"ownerDocument"in this.scrollElement?this.targetWindow=this.scrollElement.ownerDocument.defaultView:this.targetWindow=((a=this.scrollElement)==null?void 0:a.window)??null,this.elementsCache.forEach(n=>{this.observer.observe(n)}),this.unsubs.push(this.options.observeElementRect(this,n=>{this.scrollRect=n,this.maybeNotify()})),this.unsubs.push(this.options.observeElementOffset(this,(n,l)=>{this._intendedScrollOffset!==null&&Math.abs(n-this._intendedScrollOffset)<1.5&&(n=this._intendedScrollOffset),this._intendedScrollOffset=null,this.scrollAdjustments=0,this.scrollDirection=l?this.getScrollOffset()<n?"forward":"backward":null,this.scrollOffset=n,this.isScrolling=l,this._flushIosDeferredIfReady(),this.scrollState&&this.scheduleScrollReconcile(),this.maybeNotify()})),"addEventListener"in this.scrollElement){let n=this.scrollElement,l=()=>{this._iosTouching=!0,this._iosJustTouchEnded=!1,this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)},s=()=>{this._iosTouching=!1,!(!cb()||this.targetWindow==null)&&(this._iosJustTouchEnded=!0,this._iosTouchEndTimerId=this.targetWindow.setTimeout(()=>{this._iosJustTouchEnded=!1,this._iosTouchEndTimerId=null,this._flushIosDeferredIfReady()},150))};n.addEventListener("touchstart",l,Df),n.addEventListener("touchend",s,Df),this.unsubs.push(()=>{n.removeEventListener("touchstart",l),n.removeEventListener("touchend",s),this._iosTouchEndTimerId!==null&&this.targetWindow!=null&&(this.targetWindow.clearTimeout(this._iosTouchEndTimerId),this._iosTouchEndTimerId=null)})}this._scrollToOffset(this.getScrollOffset(),{adjustments:void 0,behavior:void 0})}let r=this.pendingScrollAnchor;if(this.pendingScrollAnchor=null,r&&this.scrollElement&&this.options.enabled){let[n,l,s]=r;if(n!==null){let{count:i,getItemKey:f}=this.options,u=0;for(;u<i&&f(u)!==n;)u++;let x=u<i?this.getMeasurements()[u]:void 0;if(x){let d=x.start+l-this.getScrollOffset();lp(d,0)||this.applyScrollAdjustment(d)}}s&&this.scrollToEnd({behavior:s})}},this._flushIosDeferredIfReady=()=>{if(this._iosDeferredAdjustment===0||this.isScrolling||this._iosTouching||this._iosJustTouchEnded)return;let a=this.getScrollOffset(),o=this.getMaxScrollOffset();if(a<0||a>o)return;let r=this._iosDeferredAdjustment;this._iosDeferredAdjustment=0,this._scrollToOffset(a,{adjustments:this.scrollAdjustments+=r,behavior:void 0})},this.rafId=null,this.getSize=()=>this.options.enabled?(this.scrollRect=this.scrollRect??this.options.initialRect,this.scrollRect[this.options.horizontal?"width":"height"]):(this.scrollRect=null,0),this.getScrollOffset=()=>this.options.enabled?(this.scrollOffset=this.scrollOffset??(typeof this.options.initialOffset=="function"?this.options.initialOffset():this.options.initialOffset),this.scrollOffset):(this.scrollOffset=null,0),this.getFurthestMeasurement=(a,o)=>{let r=new Map,n=new Map;for(let l=o-1;l>=0;l--){let s=a[l];if(r.has(s.lane))continue;let i=n.get(s.lane);if(i==null||s.end>i.end?n.set(s.lane,s):s.end<i.end&&r.set(s.lane,!0),r.size===this.options.lanes)break}return n.size===this.options.lanes?Array.from(n.values()).sort((l,s)=>l.end===s.end?l.index-s.index:l.end-s.end)[0]:void 0},this.getMeasurementOptions=Cr(()=>[this.options.count,this.options.paddingStart,this.options.scrollMargin,this.options.getItemKey,this.options.enabled,this.options.lanes,this.options.laneAssignmentMode],(a,o,r,n,l,s,i)=>(this.prevLanes!==void 0&&this.prevLanes!==s&&(this.lanesChangedFlag=!0),this.prevLanes=s,this.pendingMin=null,{count:a,paddingStart:o,scrollMargin:r,getItemKey:n,enabled:l,lanes:s,laneAssignmentMode:i}),{key:!1}),this.getMeasurements=Cr(()=>[this.getMeasurementOptions(),this.itemSizeCacheVersion],({count:a,paddingStart:o,scrollMargin:r,getItemKey:n,enabled:l,lanes:s,laneAssignmentMode:i},f)=>{let u=this.itemSizeCache;if(!l)return this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),[];if(this.laneAssignments.size>a)for(let v of this.laneAssignments.keys())v>=a&&this.laneAssignments.delete(v);this.lanesChangedFlag&&(this.lanesChangedFlag=!1,this.lanesSettling=!0,this.measurementsCache=[],this.itemSizeCache.clear(),this.laneAssignments.clear(),this.pendingMin=null),this.measurementsCache.length===0&&!this.lanesSettling&&(this.measurementsCache=this.options.initialMeasurementsCache,this.measurementsCache.forEach(v=>{this.itemSizeCache.set(v.key,v.size)}));let x=this.lanesSettling?0:this.pendingMin??0;if(this.pendingMin=null,this.lanesSettling&&this.measurementsCache.length===a&&(this.lanesSettling=!1),s===1){let v=this.options.gap,k=a*2,D=this._flatMeasurements;if(!D||D.length<k){let m=new Float64Array(k);D&&x>0&&m.set(D.subarray(0,x*2)),D=m,this._flatMeasurements=D}let y;if(x===0)y=o+r;else{let m=x-1;y=D[m*2]+D[m*2+1]+v}for(let m=x;m<a;m++){let g=n(m),A=u.get(g),B=typeof A=="number"?A:this.options.estimateSize(m);D[m*2]=y,D[m*2+1]=B,y+=B+v}let c=lb(a,D,n);return this.measurementsCache=c,c}let d=this.measurementsCache.slice(0,x),p=new Array(s).fill(void 0);for(let v=0;v<x;v++){let k=d[v];k&&(p[k.lane]=v)}for(let v=x;v<a;v++){let k=n(v),D=this.laneAssignments.get(v),y,c,m=i==="estimate"||u.has(k);if(D!==void 0&&this.options.lanes>1){y=D;let b=p[y],N=b!==void 0?d[b]:void 0;c=N?N.end+this.options.gap:o+r}else{let b=this.options.lanes===1?d[v-1]:this.getFurthestMeasurement(d,v);c=b?b.end+this.options.gap:o+r,y=b?b.lane:v%this.options.lanes,this.options.lanes>1&&m&&this.laneAssignments.set(v,y)}let g=u.get(k),A=typeof g=="number"?g:this.options.estimateSize(v),B=c+A;d[v]={index:v,start:c,size:A,end:B,key:k,lane:y},p[y]=v}return this.measurementsCache=d,d},{key:!1,debug:()=>this.options.debug}),this.calculateRange=Cr(()=>[this.getMeasurements(),this.getSize(),this.getScrollOffset(),this.options.lanes],(a,o,r,n)=>this.range=a.length>0&&o>0?O2({measurements:a,outerSize:o,scrollOffset:r,lanes:n,flat:n===1&&this._flatMeasurements!=null?this._flatMeasurements:null}):null,{key:!1,debug:()=>this.options.debug}),this.getVirtualIndexes=Cr(()=>{let a=null,o=null,r=this.calculateRange();return r&&(a=r.startIndex,o=r.endIndex),this.maybeNotify.updateDeps([this.isScrolling,a,o]),[this.options.rangeExtractor,this.options.overscan,this.options.count,a,o]},(a,o,r,n,l)=>n===null||l===null?[]:a({startIndex:n,endIndex:l,overscan:o,count:r}),{key:!1,debug:()=>this.options.debug}),this.indexFromElement=a=>{let o=this.options.indexAttribute,r=a.getAttribute(o);return r?parseInt(r,10):(console.warn(`Missing attribute name '${o}={index}' on measured element.`),-1)},this.shouldMeasureDuringScroll=a=>{var o;if(!this.scrollState||this.scrollState.behavior!=="smooth")return!0;let r=this.scrollState.index??((o=this.getVirtualItemForOffset(this.scrollState.lastTargetOffset))==null?void 0:o.index);if(r!==void 0&&this.range){let n=Math.max(this.options.overscan,Math.ceil((this.range.endIndex-this.range.startIndex)/2)),l=Math.max(0,r-n),s=Math.min(this.options.count-1,r+n);return a>=l&&a<=s}return!0},this.measureElement=a=>{if(!a){this.elementsCache.forEach((l,s)=>{l.isConnected||(this.observer.unobserve(l),this.elementsCache.delete(s))});return}let o=this.indexFromElement(a),r=this.options.getItemKey(o),n=this.elementsCache.get(r);n!==a&&(n&&this.observer.unobserve(n),this.observer.observe(a),this.elementsCache.set(r,a)),(!this.isScrolling||this.scrollState)&&this.shouldMeasureDuringScroll(o)&&this.resizeItem(o,this.options.measureElement(a,void 0,this))},this.resizeItem=(a,o)=>{var r,n;if(a<0||a>=this.options.count)return;let l,s,i,f=this._flatMeasurements;if(this.options.lanes===1&&f!==null)i=this.options.getItemKey(a),s=f[a*2],l=f[a*2+1];else{let d=this.measurementsCache[a];if(!d)return;i=d.key,s=d.start,l=d.size}let u=this.itemSizeCache.get(i)??l,x=o-u;if(x!==0){let d=this.options.anchorTo==="end"&&((r=this.scrollState)==null?void 0:r.behavior)!=="smooth"&&this.getVirtualDistanceFromEnd()<=this.options.scrollEndThreshold,p=d?this.getTotalSize():0,v=((n=this.scrollState)==null?void 0:n.behavior)!=="smooth"&&(this.shouldAdjustScrollPositionOnItemSizeChange!==void 0?this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[a]??{index:a,key:i,start:s,size:l,end:s+l,lane:0},x,this):s<this.getScrollOffset()+this.scrollAdjustments&&this.scrollDirection!=="backward");(this.pendingMin===null||a<this.pendingMin)&&(this.pendingMin=a),this.itemSizeCache.set(i,o),this.itemSizeCacheVersion++,d?this.applyScrollAdjustment(this.getTotalSize()-p):v&&this.applyScrollAdjustment(x),this.notify(!1)}},this.getVirtualItems=Cr(()=>[this.getVirtualIndexes(),this.getMeasurements()],(a,o)=>{let r=[];for(let n=0,l=a.length;n<l;n++){let s=a[n],i=o[s];r.push(i)}return r},{key:!1,debug:()=>this.options.debug}),this.getVirtualItemForOffset=a=>{let o=this.getMeasurements();if(o.length===0)return;let r=this._flatMeasurements,n=this.options.lanes===1&&r!=null,l=xb(0,o.length-1,n?s=>r[s*2]:s=>np(o[s]).start,a);return np(o[l])},this.getMaxScrollOffset=()=>{if(!this.scrollElement)return 0;if("scrollHeight"in this.scrollElement)return this.options.horizontal?this.scrollElement.scrollWidth-this.scrollElement.clientWidth:this.scrollElement.scrollHeight-this.scrollElement.clientHeight;{let a=this.scrollElement.document.documentElement;return this.options.horizontal?a.scrollWidth-this.scrollElement.innerWidth:a.scrollHeight-this.scrollElement.innerHeight}},this.getVirtualDistanceFromEnd=()=>Math.max(this.getTotalSize()-this.getSize()-this.getScrollOffset(),0),this.getDistanceFromEnd=()=>Math.max(this.getMaxScrollOffset()-this.getScrollOffset(),0),this.isAtEnd=(a=this.options.scrollEndThreshold)=>this.getDistanceFromEnd()<=a,this.getOffsetForAlignment=(a,o,r=0)=>{if(!this.scrollElement)return 0;let n=this.getSize(),l=this.getScrollOffset();o==="auto"&&(o=a>=l+n?"end":"start"),o==="center"?a+=(r-n)/2:o==="end"&&(a-=n);let s=this.getMaxScrollOffset();return Math.max(Math.min(s,a),0)},this.getOffsetForIndex=(a,o="auto")=>{a=Math.max(0,Math.min(a,this.options.count-1));let r=this.getSize(),n=this.getScrollOffset(),l=this.measurementsCache[a];if(!l)return;if(o==="auto")if(l.end>=n+r-this.options.scrollPaddingEnd)o="end";else if(l.start<=n+this.options.scrollPaddingStart)o="start";else return[n,o];if(o==="end"&&a===this.options.count-1)return[this.getMaxScrollOffset(),o];let s=o==="end"?l.end+this.options.scrollPaddingEnd:l.start-this.options.scrollPaddingStart;return[this.getOffsetForAlignment(s,o,l.size),o]},this.scrollToOffset=(a,{align:o="start",behavior:r="auto"}={})=>{let n=this.getOffsetForAlignment(a,o),l=this.now();this.scrollState={index:null,align:o,behavior:r,startedAt:l,lastTargetOffset:n,stableFrames:0},this._scrollToOffset(n,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollToIndex=(a,{align:o="auto",behavior:r="auto"}={})=>{a=Math.max(0,Math.min(a,this.options.count-1));let n=this.getOffsetForIndex(a,o);if(!n)return;let[l,s]=n,i=this.now();this.scrollState={index:a,align:s,behavior:r,startedAt:i,lastTargetOffset:l,stableFrames:0},this._scrollToOffset(l,{adjustments:void 0,behavior:r}),this.scheduleScrollReconcile()},this.scrollBy=(a,{behavior:o="auto"}={})=>{let r=this.getScrollOffset()+a,n=this.now();this.scrollState={index:null,align:"start",behavior:o,startedAt:n,lastTargetOffset:r,stableFrames:0},this._scrollToOffset(r,{adjustments:void 0,behavior:o}),this.scheduleScrollReconcile()},this.scrollToEnd=({behavior:a="auto"}={})=>{if(this.options.count>0){this.scrollToIndex(this.options.count-1,{align:"end",behavior:a});return}this.scrollToOffset(Math.max(this.getTotalSize()-this.getSize(),0),{behavior:a})},this.getTotalSize=()=>{var a;let o=this.getMeasurements(),r;if(o.length===0)r=this.options.paddingStart;else if(this.options.lanes===1){let n=o.length-1,l=this._flatMeasurements;l!=null?r=l[n*2]+l[n*2+1]:r=((a=o[n])==null?void 0:a.end)??0}else{let n=Array(this.options.lanes).fill(null),l=o.length-1;for(;l>=0&&n.some(s=>s===null);){let s=o[l];n[s.lane]===null&&(n[s.lane]=s.end),l--}r=Math.max(...n.filter(s=>s!==null))}return Math.max(r-this.options.scrollMargin+this.options.paddingEnd,0)},this.takeSnapshot=()=>{let a=[];if(this.itemSizeCache.size===0)return a;let o=this.getMeasurements();for(let r of o)r&&this.itemSizeCache.has(r.key)&&a.push({index:r.index,key:r.key,start:r.start,size:r.size,end:r.end,lane:r.lane});return a},this._scrollToOffset=(a,{adjustments:o,behavior:r})=>{this._intendedScrollOffset=a+(o??0),this.options.scrollToFn(a,{behavior:r,adjustments:o},this)},this.measure=()=>{this.pendingMin=null,this.itemSizeCache.clear(),this.laneAssignments.clear(),this.itemSizeCacheVersion++,this.notify(!1)},this.setOptions(t)}applyScrollAdjustment(t,a){t!==0&&(cb()&&(this.isScrolling||this._iosTouching||this._iosJustTouchEnded)?this._iosDeferredAdjustment+=t:this._scrollToOffset(this.getScrollOffset(),{adjustments:this.scrollAdjustments+=t,behavior:a}))}scheduleScrollReconcile(){if(!this.targetWindow){this.scrollState=null;return}this.rafId==null&&(this.rafId=this.targetWindow.requestAnimationFrame(()=>{this.rafId=null,this.reconcileScroll()}))}reconcileScroll(){if(!this.scrollState||!this.scrollElement)return;if(this.now()-this.scrollState.startedAt>5e3){this.scrollState=null;return}let o=this.scrollState.index!=null?this.getOffsetForIndex(this.scrollState.index,this.scrollState.align):void 0,r=o?o[0]:this.scrollState.lastTargetOffset,n=1,l=r!==this.scrollState.lastTargetOffset;if(!l&&lp(r,this.getScrollOffset())){if(this.scrollState.stableFrames++,this.scrollState.stableFrames>=n){this.getScrollOffset()!==r&&this._scrollToOffset(r,{adjustments:void 0,behavior:"auto"}),this.scrollState=null;return}}else if(this.scrollState.stableFrames=0,l){let s=this.getSize()||600,i=Math.abs(r-this.getScrollOffset()),f=this.scrollState.behavior==="smooth"&&i>s;this.scrollState.lastTargetOffset=r,f||(this.scrollState.behavior="auto"),this._scrollToOffset(r,{adjustments:void 0,behavior:f?"smooth":"auto"})}this.scheduleScrollReconcile()}},xb=(e,t,a,o)=>{for(;e<=t;){let r=(e+t)/2|0,n=a(r);if(n<o)e=r+1;else if(n>o)t=r-1;else return r}return e>0?e-1:0}});function L2({useFlushSync:e=!0,...t}){let a=Xo.useReducer(n=>n+1,0)[1],o={...t,onChange:(n,l)=>{var s;e&&l?(0,gb.flushSync)(a):a(),(s=t.onChange)==null||s.call(t,n,l)}},[r]=Xo.useState(()=>new Ff(o));return r.setOptions(o),yb(()=>r._didMount(),[]),yb(()=>r._willUpdate()),r}function zn(e){return L2({observeElementRect:db,observeElementOffset:pb,scrollToFn:mb,...e})}var Xo,gb,yb,ip=E(()=>{Xo=H(ze(),1),gb=H(xc(),1);sp();sp();yb=typeof document<"u"?Xo.useLayoutEffect:Xo.useEffect});var hb,Ib=E(()=>{hb={outline:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},filled:{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"currentColor",stroke:"none"}}});var Hn,M,z=E(()=>{Hn=H(ze(),1);Ib();M=(e,t,a,o)=>{let r=(0,Hn.forwardRef)(({color:n="currentColor",size:l=24,stroke:s=2,title:i,className:f,children:u,...x},d)=>(0,Hn.createElement)("svg",{ref:d,...hb[e],width:l,height:l,className:["tabler-icon",`tabler-icon-${t}`,f].join(" "),...e==="filled"?{fill:n}:{strokeWidth:s,stroke:n},...x},[i&&(0,Hn.createElement)("title",{key:"svg-title"},i),...o.map(([p,v])=>(0,Hn.createElement)(p,v)),...Array.isArray(u)?u:[u]]));return r.displayName=`${a}`,r}});var z2,fp,bb=E(()=>{z();z2=[["path",{d:"M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M6 4v4",key:"svg-1"}],["path",{d:"M6 12v8",key:"svg-2"}],["path",{d:"M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-3"}],["path",{d:"M12 4v10",key:"svg-4"}],["path",{d:"M12 18v2",key:"svg-5"}],["path",{d:"M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-6"}],["path",{d:"M18 4v1",key:"svg-7"}],["path",{d:"M18 9v11",key:"svg-8"}]],fp=M("outline","adjustments","Adjustments",z2)});var H2,ao,vb=E(()=>{z();H2=[["path",{d:"M12 9v4",key:"svg-0"}],["path",{d:"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0",key:"svg-1"}],["path",{d:"M12 16h.01",key:"svg-2"}]],ao=M("outline","alert-triangle","AlertTriangle",H2)});var _2,Nf,Sb=E(()=>{z();_2=[["path",{d:"M9 14l-4 -4l4 -4",key:"svg-0"}],["path",{d:"M5 10h11a4 4 0 1 1 0 8h-1",key:"svg-1"}]],Nf=M("outline","arrow-back-up","ArrowBackUp",_2)});var P2,cp,wb=E(()=>{z();P2=[["path",{d:"M17 7l-10 10",key:"svg-0"}],["path",{d:"M16 17l-9 0l0 -9",key:"svg-1"}]],cp=M("outline","arrow-down-left","ArrowDownLeft",P2)});var q2,_n,Cb=E(()=>{z();q2=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 13l-6 6",key:"svg-1"}],["path",{d:"M6 13l6 6",key:"svg-2"}]],_n=M("outline","arrow-down","ArrowDown",q2)});var U2,rs,kb=E(()=>{z();U2=[["path",{d:"M5 12l14 0",key:"svg-0"}],["path",{d:"M13 18l6 -6",key:"svg-1"}],["path",{d:"M13 6l6 6",key:"svg-2"}]],rs=M("outline","arrow-right","ArrowRight",U2)});var X2,up,Ab=E(()=>{z();X2=[["path",{d:"M17 7l-10 10",key:"svg-0"}],["path",{d:"M8 7l9 0l0 9",key:"svg-1"}]],up=M("outline","arrow-up-right","ArrowUpRight",X2)});var G2,Bf,Rb=E(()=>{z();G2=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M18 11l-6 -6",key:"svg-1"}],["path",{d:"M6 11l6 -6",key:"svg-2"}]],Bf=M("outline","arrow-up","ArrowUp",G2)});var j2,dp,Mb=E(()=>{z();j2=[["path",{d:"M7 10h14l-4 -4",key:"svg-0"}],["path",{d:"M17 14h-14l4 4",key:"svg-1"}]],dp=M("outline","arrows-exchange","ArrowsExchange",j2)});var V2,ns,Tb=E(()=>{z();V2=[["path",{d:"M16 4l4 0l0 4",key:"svg-0"}],["path",{d:"M14 10l6 -6",key:"svg-1"}],["path",{d:"M8 20l-4 0l0 -4",key:"svg-2"}],["path",{d:"M4 20l6 -6",key:"svg-3"}],["path",{d:"M16 20l4 0l0 -4",key:"svg-4"}],["path",{d:"M14 14l6 6",key:"svg-5"}],["path",{d:"M8 4l-4 0l0 4",key:"svg-6"}],["path",{d:"M4 4l6 6",key:"svg-7"}]],ns=M("outline","arrows-maximize","ArrowsMaximize",V2)});var Y2,Pn,Eb=E(()=>{z();Y2=[["path",{d:"M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11",key:"svg-0"}]],Pn=M("outline","bolt","Bolt",Y2)});var Q2,pp,Db=E(()=>{z();Q2=[["path",{d:"M12 17l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v5",key:"svg-0"}],["path",{d:"M16 19h6",key:"svg-1"}],["path",{d:"M19 16v6",key:"svg-2"}]],pp=M("outline","bookmark-plus","BookmarkPlus",Q2)});var K2,Go,Fb=E(()=>{z();K2=[["path",{d:"M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4",key:"svg-0"}]],Go=M("outline","bookmark","Bookmark",K2)});var Z2,mp,Nb=E(()=>{z();Z2=[["path",{d:"M7 4a2 2 0 0 0 -2 2v3a2 3 0 0 1 -2 3a2 3 0 0 1 2 3v3a2 2 0 0 0 2 2",key:"svg-0"}],["path",{d:"M17 4a2 2 0 0 1 2 2v3a2 3 0 0 0 2 3a2 3 0 0 0 -2 3v3a2 2 0 0 1 -2 2",key:"svg-1"}]],mp=M("outline","braces","Braces",Z2)});var W2,kr,Bb=E(()=>{z();W2=[["path",{d:"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6",key:"svg-0"}],["path",{d:"M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10",key:"svg-1"}],["path",{d:"M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14",key:"svg-2"}],["path",{d:"M4 20h14",key:"svg-3"}]],kr=M("outline","chart-bar","ChartBar",W2)});var $2,ls,Ob=E(()=>{z();$2=[["path",{d:"M5 12l5 5l10 -10",key:"svg-0"}]],ls=M("outline","check","Check",$2)});var J2,oo,Lb=E(()=>{z();J2=[["path",{d:"M6 9l6 6l6 -6",key:"svg-0"}]],oo=M("outline","chevron-down","ChevronDown",J2)});var ek,xp,zb=E(()=>{z();ek=[["path",{d:"M15 6l-6 6l6 6",key:"svg-0"}]],xp=M("outline","chevron-left","ChevronLeft",ek)});var tk,qn,Hb=E(()=>{z();tk=[["path",{d:"M9 6l6 6l-6 6",key:"svg-0"}]],qn=M("outline","chevron-right","ChevronRight",tk)});var ak,yp,_b=E(()=>{z();ak=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 12l2 2l4 -4",key:"svg-1"}]],yp=M("outline","circle-check","CircleCheck",ak)});var ok,Of,Pb=E(()=>{z();ok=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M10 10l4 4m0 -4l-4 4",key:"svg-1"}]],Of=M("outline","circle-x","CircleX",ok)});var rk,ss,qb=E(()=>{z();rk=[["path",{d:"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2",key:"svg-0"}],["path",{d:"M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2",key:"svg-1"}]],ss=M("outline","clipboard","Clipboard",rk)});var nk,is,Ub=E(()=>{z();nk=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M12 7v5l3 3",key:"svg-1"}]],is=M("outline","clock","Clock",nk)});var lk,gp,Xb=E(()=>{z();lk=[["path",{d:"M7 8l-4 4l4 4",key:"svg-0"}],["path",{d:"M17 8l4 4l-4 4",key:"svg-1"}],["path",{d:"M14 4l-4 16",key:"svg-2"}]],gp=M("outline","code","Code",lk)});var sk,hp,Gb=E(()=>{z();sk=[["path",{d:"M11 7l6 6",key:"svg-0"}],["path",{d:"M4 16l11.7 -11.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-11.7 11.7h-4v-4",key:"svg-1"}]],hp=M("outline","color-picker","ColorPicker",sk)});var ik,pt,jb=E(()=>{z();ik=[["path",{d:"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666",key:"svg-0"}],["path",{d:"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",key:"svg-1"}]],pt=M("outline","copy","Copy",ik)});var fk,Ip,Vb=E(()=>{z();fk=[["path",{d:"M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3",key:"svg-0"}],["path",{d:"M4 6v6c0 1.657 3.582 3 8 3c.856 0 1.68 -.05 2.454 -.144m5.546 -2.856v-6",key:"svg-1"}],["path",{d:"M4 12v6c0 1.657 3.582 3 8 3c.171 0 .341 -.002 .51 -.006",key:"svg-2"}],["path",{d:"M19 22v-6",key:"svg-3"}],["path",{d:"M22 19l-3 -3l-3 3",key:"svg-4"}]],Ip=M("outline","database-import","DatabaseImport",fk)});var ck,jo,Yb=E(()=>{z();ck=[["path",{d:"M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0",key:"svg-0"}],["path",{d:"M4 6v6a8 3 0 0 0 16 0v-6",key:"svg-1"}],["path",{d:"M4 12v6a8 3 0 0 0 16 0v-6",key:"svg-2"}]],jo=M("outline","database","Database",ck)});var uk,fs,Qb=E(()=>{z();uk=[["path",{d:"M3 19l18 0",key:"svg-0"}],["path",{d:"M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8",key:"svg-1"}]],fs=M("outline","device-laptop","DeviceLaptop",uk)});var dk,cs,Kb=E(()=>{z();dk=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M8 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-1"}],["path",{d:"M15 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-2"}],["path",{d:"M15 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-3"}],["path",{d:"M8 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0",fill:"currentColor",key:"svg-4"}]],cs=M("outline","dice","Dice",dk)});var pk,Ft,Zb=E(()=>{z();pk=[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 11l5 5l5 -5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]],Ft=M("outline","download","Download",pk)});var mk,Lf,Wb=E(()=>{z();mk=[["path",{d:"M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3",key:"svg-0"}],["path",{d:"M18 13.3l-6.3 -6.3",key:"svg-1"}]],Lf=M("outline","eraser","Eraser",mk)});var xk,bp,$b=E(()=>{z();xk=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2",key:"svg-1"}],["path",{d:"M12 10l0 4",key:"svg-2"}],["path",{d:"M10 12l4 0",key:"svg-3"}],["path",{d:"M10 17l4 0",key:"svg-4"}]],bp=M("outline","file-diff","FileDiff",xk)});var yk,vp,Jb=E(()=>{z();yk=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3",key:"svg-1"}]],vp=M("outline","file-export","FileExport",yk)});var gk,Sp,ev=E(()=>{z();gk=[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M5 13v-8a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5.5m-9.5 -2h7m-3 -3l3 3l-3 3",key:"svg-1"}]],Sp=M("outline","file-import","FileImport",gk)});var hk,Ar,tv=E(()=>{z();hk=[["path",{d:"M8 4h12v2.172a2 2 0 0 1 -.586 1.414l-3.914 3.914m-.5 3.5v4l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}],["path",{d:"M3 3l18 18",key:"svg-1"}]],Ar=M("outline","filter-off","FilterOff",hk)});var Ik,us,av=E(()=>{z();Ik=[["path",{d:"M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227",key:"svg-0"}]],us=M("outline","filter","Filter",Ik)});var bk,wp,ov=E(()=>{z();bk=[["path",{d:"M12 11v8l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M9 7l1 0",key:"svg-1"}],["path",{d:"M14 7l1 0",key:"svg-2"}],["path",{d:"M19 7l1 0",key:"svg-3"}],["path",{d:"M4 7l1 0",key:"svg-4"}]],wp=M("outline","fold-down","FoldDown",bk)});var vk,Cp,rv=E(()=>{z();vk=[["path",{d:"M12 3v6l3 -3m-6 0l3 3",key:"svg-0"}],["path",{d:"M12 21v-6l3 3m-6 0l3 -3",key:"svg-1"}],["path",{d:"M4 12l1 0",key:"svg-2"}],["path",{d:"M9 12l1 0",key:"svg-3"}],["path",{d:"M14 12l1 0",key:"svg-4"}],["path",{d:"M19 12l1 0",key:"svg-5"}]],Cp=M("outline","fold","Fold",vk)});var Sk,kp,nv=E(()=>{z();Sk=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M12 17l0 .01",key:"svg-1"}],["path",{d:"M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4",key:"svg-2"}]],kp=M("outline","help","Help",Sk)});var wk,Ap,lv=E(()=>{z();wk=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M12 9h.01",key:"svg-1"}],["path",{d:"M11 12h1v4h1",key:"svg-2"}]],Ap=M("outline","info-circle","InfoCircle",wk)});var Ck,Rp,sv=E(()=>{z();Ck=[["path",{d:"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0",key:"svg-0"}],["path",{d:"M15 9h.01",key:"svg-1"}]],Rp=M("outline","key","Key",Ck)});var kk,Mp,iv=E(()=>{z();kk=[["path",{d:"M2 8a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2l0 -8",key:"svg-0"}],["path",{d:"M6 10l0 .01",key:"svg-1"}],["path",{d:"M10 10l0 .01",key:"svg-2"}],["path",{d:"M14 10l0 .01",key:"svg-3"}],["path",{d:"M18 10l0 .01",key:"svg-4"}],["path",{d:"M6 14l0 .01",key:"svg-5"}],["path",{d:"M18 14l0 .01",key:"svg-6"}],["path",{d:"M10 14l4 .01",key:"svg-7"}]],Mp=M("outline","keyboard","Keyboard",kk)});var Ak,Tp,fv=E(()=>{z();Ak=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2",key:"svg-0"}],["path",{d:"M4 16a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -2",key:"svg-1"}]],Tp=M("outline","layout-list","LayoutList",Ak)});var Rk,Ep,cv=E(()=>{z();Rk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M4 12l16 0",key:"svg-1"}]],Ep=M("outline","layout-rows","LayoutRows",Rk)});var Mk,Dp,uv=E(()=>{z();Mk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M9 4v16",key:"svg-1"}],["path",{d:"M14 10l2 2l-2 2",key:"svg-2"}]],Dp=M("outline","layout-sidebar-left-expand","LayoutSidebarLeftExpand",Mk)});var Tk,Fp,dv=E(()=>{z();Tk=[["path",{d:"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12",key:"svg-0"}],["path",{d:"M15 4v16",key:"svg-1"}],["path",{d:"M10 10l-2 2l2 2",key:"svg-2"}]],Fp=M("outline","layout-sidebar-right-expand","LayoutSidebarRightExpand",Tk)});var Ek,Np,pv=E(()=>{z();Ek=[["path",{d:"M14 15.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0",key:"svg-0"}],["path",{d:"M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5",key:"svg-1"}],["path",{d:"M3 13h7",key:"svg-2"}],["path",{d:"M21 12v7",key:"svg-3"}]],Np=M("outline","letter-case","LetterCase",Ek)});var Dk,Bp,mv=E(()=>{z();Dk=[["path",{d:"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6",key:"svg-0"}],["path",{d:"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0",key:"svg-1"}],["path",{d:"M8 11v-4a4 4 0 1 1 8 0v4",key:"svg-2"}]],Bp=M("outline","lock","Lock",Dk)});var Fk,Rr,xv=E(()=>{z();Fk=[["path",{d:"M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0",key:"svg-0"}],["path",{d:"M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6",key:"svg-1"}],["path",{d:"M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6",key:"svg-2"}],["path",{d:"M6 9h12",key:"svg-3"}],["path",{d:"M3 20h7",key:"svg-4"}],["path",{d:"M14 20h7",key:"svg-5"}],["path",{d:"M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-6"}],["path",{d:"M12 15v3",key:"svg-7"}]],Rr=M("outline","network","Network",Fk)});var Nk,Mr,yv=E(()=>{z();Nk=[["path",{d:"M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25",key:"svg-0"}],["path",{d:"M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-1"}],["path",{d:"M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-2"}],["path",{d:"M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-3"}]],Mr=M("outline","palette","Palette",Nk)});var Bk,ds,gv=E(()=>{z();Bk=[["path",{d:"M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4",key:"svg-0"}],["path",{d:"M14 15a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1l0 -3",key:"svg-1"}]],ds=M("outline","picture-in-picture","PictureInPicture",Bk)});var Ok,zf,hv=E(()=>{z();Ok=[["path",{d:"M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4",key:"svg-0"}],["path",{d:"M9 15l-4.5 4.5",key:"svg-1"}],["path",{d:"M14.5 4l5.5 5.5",key:"svg-2"}]],zf=M("outline","pin","Pin",Ok)});var Lk,Op,Iv=E(()=>{z();Lk=[["path",{d:"M3 3l18 18",key:"svg-0"}],["path",{d:"M15 4.5l-3.249 3.249m-2.57 1.433l-2.181 .818l-1.5 1.5l7 7l1.5 -1.5l.82 -2.186m1.43 -2.563l3.25 -3.251",key:"svg-1"}],["path",{d:"M9 15l-4.5 4.5",key:"svg-2"}],["path",{d:"M14.5 4l5.5 5.5",key:"svg-3"}]],Op=M("outline","pinned-off","PinnedOff",Lk)});var zk,Lp,bv=E(()=>{z();zk=[["path",{d:"M7 4v16l13 -8l-13 -8",key:"svg-0"}]],Lp=M("outline","player-play","PlayerPlay",zk)});var Hk,zp,vv=E(()=>{z();Hk=[["path",{d:"M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}]],zp=M("outline","player-record","PlayerRecord",Hk)});var _k,Tr,Sv=E(()=>{z();_k=[["path",{d:"M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5",key:"svg-0"}],["path",{d:"M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5",key:"svg-1"}],["path",{d:"M3 21l2.5 -2.5",key:"svg-2"}],["path",{d:"M18.5 5.5l2.5 -2.5",key:"svg-3"}],["path",{d:"M10 11l-2 2",key:"svg-4"}],["path",{d:"M13 14l-2 2",key:"svg-5"}]],Tr=M("outline","plug-connected","PlugConnected",_k)});var Pk,Hp,wv=E(()=>{z();Pk=[["path",{d:"M12 5l0 14",key:"svg-0"}],["path",{d:"M5 12l14 0",key:"svg-1"}]],Hp=M("outline","plus","Plus",Pk)});var qk,_p,Cv=E(()=>{z();qk=[["path",{d:"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-0"}],["path",{d:"M15.51 15.56a5 5 0 1 0 -3.51 1.44",key:"svg-1"}],["path",{d:"M18.832 17.86a9 9 0 1 0 -6.832 3.14",key:"svg-2"}],["path",{d:"M12 12v9",key:"svg-3"}]],_p=M("outline","radar-2","Radar2",qk)});var Uk,Un,kv=E(()=>{z();Uk=[["path",{d:"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4",key:"svg-0"}],["path",{d:"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",key:"svg-1"}]],Un=M("outline","refresh","Refresh",Uk)});var Xk,Pp,Av=E(()=>{z();Xk=[["path",{d:"M6.5 15a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0 -5",key:"svg-0"}],["path",{d:"M17 7.875l3 -1.687",key:"svg-1"}],["path",{d:"M17 7.875v3.375",key:"svg-2"}],["path",{d:"M17 7.875l-3 -1.687",key:"svg-3"}],["path",{d:"M17 7.875l3 1.688",key:"svg-4"}],["path",{d:"M17 4.5v3.375",key:"svg-5"}],["path",{d:"M17 7.875l-3 1.688",key:"svg-6"}]],Pp=M("outline","regex","Regex",Xk)});var Gk,ro,Rv=E(()=>{z();Gk=[["path",{d:"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3",key:"svg-0"}],["path",{d:"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3",key:"svg-1"}]],ro=M("outline","repeat","Repeat",Gk)});var jk,Er,Mv=E(()=>{z();jk=[["path",{d:"M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",key:"svg-0"}],["path",{d:"M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4",key:"svg-1"}],["path",{d:"M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5",key:"svg-2"}]],Er=M("outline","route","Route",jk)});var Vk,ot,Tv=E(()=>{z();Vk=[["path",{d:"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}],["path",{d:"M21 21l-6 -6",key:"svg-1"}]],ot=M("outline","search","Search",Vk)});var Yk,Dr,Ev=E(()=>{z();Yk=[["path",{d:"M10 14l11 -11",key:"svg-0"}],["path",{d:"M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5",key:"svg-1"}]],Dr=M("outline","send","Send",Yk)});var Qk,ps,Dv=E(()=>{z();Qk=[["path",{d:"M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3",key:"svg-0"}],["path",{d:"M3 15a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -2",key:"svg-1"}],["path",{d:"M7 8l0 .01",key:"svg-2"}],["path",{d:"M7 16l0 .01",key:"svg-3"}]],ps=M("outline","server","Server",Qk)});var Kk,Fr,Fv=E(()=>{z();Kk=[["path",{d:"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065",key:"svg-0"}],["path",{d:"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0",key:"svg-1"}]],Fr=M("outline","settings","Settings",Kk)});var Zk,qp,Nv=E(()=>{z();Zk=[["path",{d:"M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-0"}],["path",{d:"M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-1"}],["path",{d:"M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",key:"svg-2"}],["path",{d:"M8.7 10.7l6.6 -3.4",key:"svg-3"}],["path",{d:"M8.7 13.3l6.6 3.4",key:"svg-4"}]],qp=M("outline","share","Share",Zk)});var Wk,no,Bv=E(()=>{z();Wk=[["path",{d:"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6",key:"svg-0"}]],no=M("outline","sparkles","Sparkles",Wk)});var $k,Up,Ov=E(()=>{z();$k=[["path",{d:"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14",key:"svg-0"}],["path",{d:"M3 10h18",key:"svg-1"}],["path",{d:"M10 3v18",key:"svg-2"}]],Up=M("outline","table","Table",$k)});var Jk,rt,Lv=E(()=>{z();Jk=[["path",{d:"M8 9l3 3l-3 3",key:"svg-0"}],["path",{d:"M13 15l3 0",key:"svg-1"}],["path",{d:"M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12",key:"svg-2"}]],rt=M("outline","terminal-2","Terminal2",Jk)});var eA,Xp,zv=E(()=>{z();eA=[["path",{d:"M4 16l6 -7l5 5l5 -6",key:"svg-0"}],["path",{d:"M14 14a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-1"}],["path",{d:"M9 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-2"}],["path",{d:"M3 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-3"}],["path",{d:"M19 8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",key:"svg-4"}]],Xp=M("outline","timeline","Timeline",eA)});var tA,Vo,Hv=E(()=>{z();tA=[["path",{d:"M4 7l16 0",key:"svg-0"}],["path",{d:"M10 11l0 6",key:"svg-1"}],["path",{d:"M14 11l0 6",key:"svg-2"}],["path",{d:"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12",key:"svg-3"}],["path",{d:"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3",key:"svg-4"}]],Vo=M("outline","trash","Trash",tA)});var aA,Nr,_v=E(()=>{z();aA=[["path",{d:"M6 21l15 -15l-3 -3l-15 15l3 3",key:"svg-0"}],["path",{d:"M15 6l3 3",key:"svg-1"}],["path",{d:"M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2",key:"svg-2"}],["path",{d:"M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2",key:"svg-3"}]],Nr=M("outline","wand","Wand",aA)});var oA,Gp,Pv=E(()=>{z();oA=[["path",{d:"M21 12h-2c-.894 0 -1.662 -.857 -1.761 -2c-.296 -3.45 -.749 -6 -2.749 -6s-2.5 3.582 -2.5 8s-.5 8 -2.5 8s-2.452 -2.547 -2.749 -6c-.1 -1.147 -.867 -2 -1.763 -2h-2",key:"svg-0"}]],Gp=M("outline","wave-sine","WaveSine",oA)});var rA,jp,qv=E(()=>{z();rA=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M3.6 9h16.8",key:"svg-1"}],["path",{d:"M3.6 15h16.8",key:"svg-2"}],["path",{d:"M11.5 3a17 17 0 0 0 0 18",key:"svg-3"}],["path",{d:"M12.5 3a17 17 0 0 1 0 18",key:"svg-4"}]],jp=M("outline","world","World",rA)});var nA,ha,Uv=E(()=>{z();nA=[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]],ha=M("outline","x","X",nA)});var Be=E(()=>{bb();vb();Sb();wb();Cb();kb();Ab();Rb();Mb();Tb();Eb();Db();Fb();Nb();Bb();Ob();Lb();zb();Hb();_b();Pb();qb();Ub();Xb();Gb();jb();Vb();Yb();Qb();Kb();Zb();Wb();$b();Jb();ev();tv();av();ov();rv();nv();lv();sv();iv();fv();cv();uv();dv();pv();mv();xv();yv();gv();hv();Iv();bv();vv();Sv();wv();Cv();kv();Av();Rv();Mv();Tv();Ev();Dv();Fv();Nv();Bv();Ov();Lv();zv();Hv();_v();Pv();qv();Uv();});var Gv=da(Hf=>{"use strict";var lA=Symbol.for("react.transitional.element"),sA=Symbol.for("react.fragment");function Xv(e,t,a){var o=null;if(a!==void 0&&(o=""+a),t.key!==void 0&&(o=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:lA,type:e,key:o,ref:t!==void 0?t:null,props:a}}Hf.Fragment=sA;Hf.jsx=Xv;Hf.jsxs=Xv});var X=da((HN,jv)=>{"use strict";jv.exports=Gv()});function Yo({id:e,title:t,icon:a,right:o,bodyClassName:r,className:n,children:l}){let s=I(u=>u.collapsedSections.has(e)),i=I(u=>u.toggleSection),f=`xray-sec-${e}`;return(0,Da.jsxs)("section",{className:`xray-collapsible ${s?"collapsed":""} ${n||""}`,children:[(0,Da.jsxs)("button",{type:"button",className:"xray-collapsible-header","aria-expanded":!s,"aria-controls":f,onClick:()=>i(e),children:[(0,Da.jsx)(oo,{size:15,stroke:2,className:"xray-collapsible-chevron"}),a&&(0,Da.jsx)("span",{className:"xray-collapsible-icon",children:a}),(0,Da.jsx)("span",{className:"xray-collapsible-title",children:t}),o&&(0,Da.jsx)("span",{className:"xray-collapsible-right",onClick:u=>u.stopPropagation(),children:o})]}),(0,Da.jsx)("div",{id:f,className:"xray-collapsible-body",inert:s,"aria-hidden":s,children:(0,Da.jsx)("div",{className:`xray-collapsible-inner ${r||""}`,children:l})})]})}var Da,Vp=E(()=>{"use strict";Be();$e();Da=H(X())});function Je({label:e,hint:t,icon:a,action:o}){return(0,Qo.jsxs)("div",{className:"xray-empty",role:"status",children:[(0,Qo.jsx)("span",{className:"xray-empty-glyph",children:a||(0,Qo.jsx)(_p,{size:26,stroke:1.5})}),(0,Qo.jsx)("p",{className:"xray-empty-title",children:e}),t&&(0,Qo.jsx)("p",{className:"xray-empty-hint",children:t}),o&&(0,Qo.jsx)("div",{className:"xray-empty-action",children:o})]})}var Qo,ms=E(()=>{"use strict";Be();Qo=H(X())});function Vv(){let e=I(t=>t.updateSettings);return(0,Oe.jsxs)("section",{className:"xray-firstrun",role:"status","aria-labelledby":"xray-firstrun-title",children:[(0,Oe.jsxs)("div",{className:"xray-firstrun-head",children:[(0,Oe.jsxs)("div",{children:[(0,Oe.jsx)("h3",{className:"xray-firstrun-title",id:"xray-firstrun-title",children:"Listening for traffic"}),(0,Oe.jsx)("p",{className:"xray-firstrun-lede",children:"Browse the page or trigger a call. Every fetch, XHR, WebSocket, SSE and GraphQL request lands in this list, with real timings and the response body intact."})]}),(0,Oe.jsx)("button",{type:"button",className:"xray-firstrun-dismiss",onClick:()=>e({firstRunDismissed:!0}),"aria-label":"Dismiss the introduction",title:"Dismiss",children:(0,Oe.jsx)(ha,{size:14,stroke:2})})]}),(0,Oe.jsx)("ul",{className:"xray-firstrun-grid",children:iA.map(t=>(0,Oe.jsxs)("li",{className:"xray-firstrun-cell",children:[(0,Oe.jsxs)("span",{className:"xray-firstrun-cell-head",children:[(0,Oe.jsx)("span",{className:"xray-firstrun-cell-icon","aria-hidden":"true",children:t.icon}),(0,Oe.jsx)("span",{className:"xray-firstrun-cell-title",children:t.title})]}),(0,Oe.jsx)("p",{className:"xray-firstrun-cell-body",children:t.body})]},t.title))}),(0,Oe.jsxs)("p",{className:"xray-firstrun-foot",children:["Nothing leaves this machine. Press ",(0,Oe.jsx)("kbd",{className:"xray-kbd",children:"Ctrl"}),(0,Oe.jsx)("span",{className:"xray-firstrun-plus",children:"+"}),(0,Oe.jsx)("kbd",{className:"xray-kbd",children:"K"})," to jump anywhere."]})]})}var Oe,iA,Yv=E(()=>{"use strict";Be();$e();Oe=H(X()),iA=[{icon:(0,Oe.jsx)(Er,{size:15,stroke:1.7}),title:"Mock",body:"Match by URL or method and return your own body, status, or failure. Applied in the page, before the real call."},{icon:(0,Oe.jsx)(dp,{size:15,stroke:1.7}),title:"Replay",body:"Re-fire any captured request, editing it first if you like. Auth survives, and the result is diffed against the original."},{icon:(0,Oe.jsx)(Gp,{size:15,stroke:1.7}),title:"Drift",body:"Every endpoint keeps a schema baseline. When a response changes shape, the row is flagged with a one-click diff."}]});function Yp(e){let{stored:t,varName:a,minList:o,minRest:r}=e,n=Ia.default.useRef(null),l=Ia.default.useRef(null),[s,i]=Ia.default.useState(null),[f,u]=Ia.default.useState(0),[x,d]=Ia.default.useState(0);Ia.default.useEffect(()=>{let c=n.current;if(!c||typeof ResizeObserver>"u")return;let m=()=>{u(Math.round(c.getBoundingClientRect().width)),l.current&&d(Math.round(l.current.getBoundingClientRect().width))};m();let g=new ResizeObserver(m);return g.observe(c),()=>g.disconnect()},[]);let p=f>0?Math.max(o,f-r):Math.max(o,1200),k=Math.min(p,Math.max(o,s??(t||x||o))),D=s??t,y=D>0?{[a]:`${Math.min(p,Math.max(o,D))}px`}:void 0;return{containerRef:n,paneRef:l,value:k,max:p,min:o,splitStyle:y,setLive:i}}function Qp({label:e,value:t,min:a,max:o,step:r=24,onLiveChange:n,onCommit:l,onReset:s}){let i=Ia.default.useRef(null),f=Ia.default.useRef(0),[u,x]=Ia.default.useState(!1),d=y=>Math.max(a,Math.min(o,Math.round(y)));Ia.default.useEffect(()=>()=>{f.current&&cancelAnimationFrame(f.current)},[]);function p(y){y.button===0&&(y.preventDefault(),y.currentTarget.setPointerCapture(y.pointerId),i.current={startX:y.clientX,width:t,latest:y.clientX},x(!0),n(t))}function v(y){let c=i.current;c&&(c.latest=y.clientX,!f.current&&(f.current=requestAnimationFrame(()=>{f.current=0;let m=i.current;m&&n(d(m.width+(m.latest-m.startX)))})))}function k(y){let c=i.current;if(c){i.current=null,f.current&&(cancelAnimationFrame(f.current),f.current=0),x(!1);try{y.currentTarget.releasePointerCapture(y.pointerId)}catch{}l(d(c.width+(y.clientX-c.startX)))}}function D(y){y.key!=="ArrowLeft"&&y.key!=="ArrowRight"||(y.preventDefault(),l(d(t+(y.key==="ArrowRight"?r:-r))))}return(0,Qv.jsx)("div",{className:`xray-pane-divider ${u?"dragging":""}`,role:"separator","aria-orientation":"vertical","aria-label":`${e} - drag, or use arrow keys`,"aria-valuenow":t,"aria-valuemin":a,"aria-valuemax":o,tabIndex:0,onPointerDown:p,onPointerMove:v,onPointerUp:k,onPointerCancel:k,onKeyDown:D,onDoubleClick:s,title:"Drag to resize \xB7 double-click to reset"})}var Ia,Qv,Kv=E(()=>{"use strict";Ia=H(ze()),Qv=H(X())});function fA(e){return Math.max(0,Number(e.duration)||0)}function $v(e){let t=e.timing;if(t&&Number(t.totalMs)>0)return{phases:[{label:"DNS",ms:Number(t.dnsMs)||0,className:"dns"},{label:"Connect",ms:Math.max(0,(Number(t.connectMs)||0)-(Number(t.tlsMs)||0)),className:"connect"},{label:"TLS",ms:Number(t.tlsMs)||0,className:"tls"},{label:"Wait (TTFB)",ms:Number(t.ttfbMs)||0,className:"ttfb"},{label:"Download",ms:Number(t.downloadMs)||0,className:"download"}].filter(r=>r.ms>0),totalMs:Number(t.totalMs),real:!0};let a=fA(e);return{phases:[{label:"Total",ms:a,className:"total"}],totalMs:a,real:!1}}function Kp(e,t){return t==="request"?ia(e):t==="headers"?{requestHeaders:e.requestHeaders||{},responseHeaders:e.responseHeaders||{}}:pe(e)}function Zv(e){try{return JSON.stringify(e)??"undefined"}catch{return String(e)}}function Zp(e){let t=Object.values(e).filter(Array.isArray);if(!t.length)return null;let a=t.filter(o=>o.length);return a.length?a.reduce((o,r)=>r.length>o.length?r:o):t[0]}function Jv(e){let a=(Array.isArray(e)?e:e&&typeof e=="object"?Zp(e)||[e]:[]).filter(r=>r&&typeof r=="object"&&!Array.isArray(r)).slice(0,200),o=Array.from(a.reduce((r,n)=>(Object.keys(n).slice(0,20).forEach(l=>r.add(l)),r),new Set));return{objects:a,columns:o}}function e0(e,t,a=200){let o=[],r=(n,l,s,i)=>{if(o.length>=a||i>6)return;if(n===void 0&&l!==void 0){o.push({path:s,kind:"added",after:l});return}if(n!==void 0&&l===void 0){o.push({path:s,kind:"removed",before:n});return}if(!(n!==null&&typeof n=="object")||!(l!==null&&typeof l=="object")){Object.is(n,l)||o.push({path:s,kind:"changed",before:n,after:l});return}if(Array.isArray(n)!==Array.isArray(l)){o.push({path:s,kind:"changed",before:n,after:l});return}if(Array.isArray(n)&&Array.isArray(l)){let d=Math.max(n.length,l.length);for(let p=0;p<Math.min(d,50);p+=1)r(n[p],l[p],`${s}[${p}]`,i+1);d>50&&o.length<a&&(n.length!==l.length||n.slice(50).some((v,k)=>Zv(v)!==Zv(l[50+k])))&&o.push({path:`${s}[\u2026]`,kind:"changed",before:`${n.length} items`,after:`${l.length} items`});return}let x=new Set([...Object.keys(n),...Object.keys(l)]);for(let d of x)r(n[d],l[d],s?`${s}.${d}`:d,i+1)};return r(e,t,"",0),o}var Wv,Wp=E(()=>{"use strict";ke();Wv=["tree","grid","raw","schema","diff","viz","waterfall","headers"]});function Xn(e){return typeof e=="number"&&Number.isFinite(e)}function cA(e,t){if(e==null)return`#${t+1}`;let a=typeof e=="string"?e:String(e);return a.length>40?a.slice(0,40)+"\u2026":a||`#${t+1}`}function uA(e){return Array.isArray(e)?e:e&&typeof e=="object"?Zp(e):null}function t0(e){let t=new Map;for(let a of e){let o=a==null?"null":typeof a=="object"?"[object]":String(a);t.set(o,(t.get(o)||0)+1)}return Array.from(t.entries()).sort((a,o)=>o[1]-a[1]).map(([a,o])=>({label:a,value:o,negative:!1}))}function dA(e){let t=new Map,a=[],o=new Set;for(let l of e)for(let[s,i]of Object.entries(l))Xn(i)?t.set(s,(t.get(s)||0)+1):typeof i=="string"&&!o.has(s)&&(o.add(s),a.push(s));let r=Array.from(t.entries()).sort((l,s)=>s[1]-l[1])[0]?.[0],n=a[0];if(r){let l=e.filter(i=>Xn(i[r])).slice(0,xs).map((i,f)=>{let u=i[r];return{label:n?cA(i[n],f):`#${f+1}`,value:u,negative:u<0}});if(!l.length)return null;let s=e.filter(i=>Xn(i[r])).length;return{kind:"bars",title:`${r} across ${s} rows`,subtitle:n?`Labeled by ${n}`:void 0,bars:l,truncated:Math.max(0,s-l.length),maxAbs:Math.max(...l.map(i=>Math.abs(i.value)),0)}}if(n){let l=t0(e.map(i=>i[n])),s=l.slice(0,xs);return{kind:"bars",title:`Distribution of ${n}`,subtitle:`${e.length} rows`,bars:s,truncated:Math.max(0,l.length-s.length),maxAbs:Math.max(...s.map(i=>i.value),0)}}return null}function a0(e){let t=o=>({kind:"none",title:o,bars:[],truncated:0,maxAbs:0}),a=uA(e);if(a&&a.length){if(a.every(Xn)){let o=a.slice(0,xs).map((r,n)=>({label:`#${n+1}`,value:r,negative:r<0}));return{kind:"bars",title:`${a.length} values`,bars:o,truncated:Math.max(0,a.length-o.length),maxAbs:Math.max(...o.map(r=>Math.abs(r.value)),0)}}if(a.every(o=>o&&typeof o=="object"&&!Array.isArray(o))){let o=dA(a);if(o)return o}if(a.every(o=>o==null||typeof o!="object")){let o=t0(a),r=o.slice(0,xs);return{kind:"bars",title:`Distribution of ${a.length} values`,bars:r,truncated:Math.max(0,o.length-r.length),maxAbs:Math.max(...r.map(n=>n.value),0)}}return t("This array has no numeric or categorical field to chart.")}if(e&&typeof e=="object"){let o=Object.entries(e).filter(([,r])=>Xn(r));if(o.length){let r=o.slice(0,xs).map(([n,l])=>({label:n,value:l,negative:l<0}));return{kind:"bars",title:`${o.length} numeric fields`,bars:r,truncated:Math.max(0,o.length-r.length),maxAbs:Math.max(...r.map(n=>Math.abs(n.value)),0)}}return t("No numeric fields in this object to chart.")}return Xn(e)?{kind:"bars",title:"Single value",bars:[{label:"value",value:e,negative:e<0}],truncated:0,maxAbs:Math.abs(e)}:t("Select a response with arrays or numbers to visualize.")}function $p(e){return Number.isInteger(e)?e.toLocaleString("en-US"):Math.abs(e)>=1e3?e.toLocaleString("en-US",{maximumFractionDigits:1}):String(Number(e.toFixed(3)))}var xs,o0=E(()=>{"use strict";Wp();xs=40});function r0(e){let t=e.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(e.length/4)*4,"=");try{let a=atob(t),o=Uint8Array.from(a,r=>r.charCodeAt(0));return new TextDecoder().decode(o)}catch{return""}}function n0(e){try{return JSON.parse(e)}catch{return null}}function _f(e){let t=Number(e);if(!Number.isFinite(t)||t<=0)return null;let a=t*1e3;return Math.abs(a)>864e13?null:new Date(a).toISOString()}function mA(e,t){let a=e.split(".");if(a.length<2)return null;let o=n0(r0(a[0])),r=n0(r0(a[1]));if(o==null&&r==null)return null;let n=r&&typeof r=="object"?r:{},l=_f(n.exp);return{source:t,raw:e,header:o,payload:r,expiresAt:l,issuedAt:_f(n.iat),expired:l?Number(n.exp)*1e3<Date.now():null}}function Gn(e,t,a,o=0){if(!(o>4||t.length>200)){if(typeof e=="string"){t.push({text:e,source:a});return}if(Array.isArray(e)){e.forEach((r,n)=>Gn(r,t,`${a}[${n}]`,o+1));return}e&&typeof e=="object"&&Object.entries(e).forEach(([r,n])=>Gn(n,t,a?`${a}.${r}`:r,o+1))}}function l0(e){let t=[],a=new Set,o=[],r=Array.isArray(e.jwtLenses)?e.jwtLenses:[];for(let l of r){if(!l||typeof l!="object")continue;let s=l.payload&&typeof l.payload=="object"?l.payload:{},i=_f(s.exp);if(t.push({source:`requestHeaders.${String(l.source||"authorization")}`,raw:"[redacted]",header:l.header??null,payload:l.payload??null,expiresAt:i,issuedAt:_f(s.iat),expired:i?Number(s.exp)*1e3<Date.now():null}),t.length>=20)return t}Gn(e.requestHeaders,o,"requestHeaders"),Gn(e.responseHeaders,o,"responseHeaders"),Gn(e.requestBody,o,"requestBody");let n=e.responseDecrypted??e.responseRaw;Gn(n,o,"response");for(let l of o){let s=l.text.match(pA);if(s)for(let i of s){if(a.has(i))continue;a.add(i);let f=mA(i,l.source);if(f&&t.push(f),t.length>=20)return t}}return t}var pA,s0=E(()=>{"use strict";pA=/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g});function i0(e){return!!e&&typeof e=="object"}function xA(e){return e==null||e===""?!0:Array.isArray(e)?e.length===0:i0(e)?Object.keys(e).length===0:!1}function yA(e,t){return Number(e.size)>8e4?!0:W(t,0,12e4).length>8e4}function f0(e,t){return Pe(e)&&Pe(t)&&Et(e)===Et(t)}function gA(e,t){return t.filter(o=>o.id!==e.id&&f0(o,e)).filter(o=>Number(o.timestamp)<=Number(e.timestamp||Date.now())).sort((o,r)=>Number(r.timestamp)-Number(o.timestamp))[0]||null}function hA(e,t){if(e.driftFromId)return!0;let a=gA(e,t);return a?W(Xd(a),0,2e4)!==W(Xd(e),0,2e4):!1}function be(e,t){let a=e.findIndex(o=>o.id===t.id);if(a===-1){e.push(t);return}t.priority>e[a].priority&&(e[a]=t)}function c0(e,t){let a=pe(e),o=Number(e.status)||0,r=re(e),n=t.filter(i=>i.id!==e.id&&f0(i,e)),l=t.filter(i=>Pe(i)&&Number(i.status)>=400),s=[];return o>=400&&(be(s,{id:"inspect-error",label:"Inspect Error",kind:"view",view:"tree",priority:100}),be(s,{id:"compare-previous",label:"Compare Previous",kind:"console",command:"diff(prev, res)",priority:95}),l.length&&be(s,{id:"related-errors",label:"Related Errors",kind:"console",command:`$errors().filter(e => (e.urlPath || e.url || '').includes(${JSON.stringify(r)}))`,priority:90})),se(e)>500&&(be(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:82}),be(s,{id:"waterfall",label:"Waterfall",kind:"view",view:"waterfall",priority:80}),be(s,{id:"compare-previous",label:"Compare Previous",kind:"console",command:"diff(prev, res)",priority:78})),(Array.isArray(a)||i0(a))&&(be(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:75}),be(s,{id:"table",label:"Table",kind:"view",view:"grid",command:"table(res.items || res)",priority:74}),be(s,{id:"visualize",label:"Visualize",kind:"view",view:"viz",command:"table(res.items || res)",priority:73})),hA(e,t)&&(be(s,{id:"diff",label:"Diff",kind:"view",view:"diff",command:"diff(prev, res)",priority:88}),be(s,{id:"compare-previous",label:"Compare Previous",kind:"view",view:"diff",command:"diff(prev, res)",priority:87}),be(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:86})),yA(e,a)&&(be(s,{id:"copy-full",label:"Copy Full",kind:"copy",lazyCommand:()=>W(a,2,5e5),toast:"Full response copied.",priority:70}),be(s,{id:"schema",label:"Schema",kind:"view",view:"schema",command:"schema(res)",priority:69})),xA(a)&&(be(s,{id:"headers",label:"Headers",kind:"view",view:"headers",priority:65}),be(s,{id:"request",label:"Request",kind:"view",view:"raw",priority:64}),n.length&&be(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:63})),n.length>=3&&(be(s,{id:"similar-calls",label:"Similar Calls",kind:"console",command:`$endpoint(${JSON.stringify(r)})`,priority:62}),be(s,{id:"waterfall",label:"Waterfall",kind:"view",view:"waterfall",priority:61}),be(s,{id:"slow-calls",label:"Slow Calls",kind:"console",command:"$slow(500)",priority:60})),be(s,{id:"copy-curl",label:"Copy cURL",kind:"copy",command:rf(e),toast:"cURL copied.",priority:45}),be(s,{id:"copy-fetch",label:"Copy fetch",kind:"copy",command:nf(e),toast:"fetch snippet copied.",priority:44}),be(s,{id:"mock",label:"Mock",kind:"copy",lazyCommand:()=>pI(e),toast:"Mock response copied.",priority:43}),be(s,{id:"send-console",label:"Send to Console",kind:"console",command:"res",priority:43}),be(s,{id:"save-snippet",label:"Save Snippet",kind:"snippet",command:"schema(res)",priority:42}),be(s,{id:"export",label:"Export",kind:"export",priority:41}),s.sort((i,f)=>f.priority-i.priority).slice(0,14)}var u0=E(()=>{"use strict";Dt();ke()});function m0(e){return Array.isArray(e)?"array":e!==null&&typeof e=="object"?"object":null}function x0(e){return typeof e=="string"?"xray-json-string":typeof e=="number"?"xray-json-number":typeof e=="boolean"?"xray-json-bool":e==null?"xray-json-null":"xray-json-punct"}function y0(e){return typeof e=="string"?JSON.stringify(e):e===void 0?"undefined":e===null?"null":String(e)}function g0({nodeKey:e,value:t,path:a,depth:o,isOpen:r,toggle:n}){let l=m0(t),s=e===null?null:(0,ce.jsx)("span",{className:"xray-json-key",children:typeof e=="number"?e:JSON.stringify(e)});if(!l)return(0,ce.jsxs)("div",{className:"xray-json-row",role:"treeitem",style:{paddingLeft:o*14+8},children:[(0,ce.jsx)("span",{className:"xray-json-gutter"}),s,s&&(0,ce.jsx)("span",{className:"xray-json-punct",children:": "}),(0,ce.jsx)("span",{className:x0(t),children:y0(t)})]});let i=l==="array"?t.map((d,p)=>[p,d]):Object.entries(t),f=r(a,o),u=l==="array"?["[","]"]:["{","}"],x=l==="array"?`${i.length} ${i.length===1?"item":"items"}`:`${i.length} ${i.length===1?"key":"keys"}`;return(0,ce.jsxs)("div",{className:"xray-json-node",role:"treeitem","aria-expanded":f,children:[(0,ce.jsxs)("button",{className:"xray-json-row xray-json-branch",style:{paddingLeft:o*14},onClick:()=>n(a,o),children:[(0,ce.jsx)(oo,{size:13,stroke:2.2,className:`xray-json-chevron ${f?"":"closed"}`}),s,s&&(0,ce.jsx)("span",{className:"xray-json-punct",children:": "}),(0,ce.jsx)("span",{className:"xray-json-punct",children:u[0]}),!f&&(0,ce.jsx)("span",{className:"xray-json-summary",children:x}),!f&&(0,ce.jsx)("span",{className:"xray-json-punct",children:u[1]})]}),f&&(0,ce.jsxs)("div",{className:"xray-json-children",children:[i.map(([d,p])=>(0,ce.jsx)(g0,{nodeKey:d,value:p,path:`${a}.${d}`,depth:o+1,isOpen:r,toggle:n},d)),(0,ce.jsxs)("div",{className:"xray-json-row",style:{paddingLeft:o*14+8},children:[(0,ce.jsx)("span",{className:"xray-json-gutter"}),(0,ce.jsx)("span",{className:"xray-json-punct",children:u[1]})]})]})]})}var Ko,ce,d0,p0,Vt,ys=E(()=>{"use strict";Ko=H(ze());Be();ke();ce=H(X()),d0=6e4,p0=4;Vt=Ko.default.memo(function({value:t}){let a=Ko.default.useMemo(()=>W(t,0,d0+1).length>d0,[t]),[o,r]=Ko.default.useState(()=>new Map),[n,l]=Ko.default.useState(null);Ko.default.useEffect(()=>{r(new Map),l(null)},[t]);let s=Ko.default.useCallback((f,u)=>{let x=o.get(f);return x!==void 0?x:n!==null?n:u<p0},[o,n]),i=Ko.default.useCallback((f,u)=>{r(x=>{let d=new Map(x),p=x.get(f)??(n!==null?n:u<p0);return d.set(f,!p),d})},[n]);if(a){let f=W(t);return(0,ce.jsx)("pre",{className:"xray-json xray-json-editor xray-json-text",children:f})}return m0(t)===null?(0,ce.jsx)("pre",{className:"xray-json xray-json-scalar",children:(0,ce.jsx)("span",{className:x0(t),children:y0(t)})}):(0,ce.jsxs)("div",{className:"xray-json xray-json-tree",role:"tree","aria-label":"JSON viewer",children:[(0,ce.jsxs)("div",{className:"xray-json-tree-toolbar",children:[(0,ce.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{l(!0),r(new Map)},title:"Expand all nodes",children:[(0,ce.jsx)(wp,{size:13,stroke:2}),"Expand all"]}),(0,ce.jsxs)("button",{className:"xray-json-tree-btn",onClick:()=>{l(!1),r(new Map)},title:"Collapse all nodes",children:[(0,ce.jsx)(Cp,{size:13,stroke:2}),"Collapse all"]})]}),(0,ce.jsx)("div",{className:"xray-json-tree-body",children:(0,ce.jsx)(g0,{nodeKey:null,value:t,path:"$",depth:0,isOpen:s,toggle:i})})]})})});function SA(e){return e.startsWith("requestHeaders")?"Request header":e.startsWith("responseHeaders")?"Response header":e.startsWith("requestBody")?"Request body":"Response body"}function gs({entry:e,compact:t=!1,onClose:a}){let o=I(w=>w.detailView),r=I(w=>w.setDetailView),n=I(w=>w.detailTab),l=I(w=>w.setDetailTab),s=I(w=>w.insertConsoleCommand),i=I(w=>w.saveSnippet),f=I(w=>w.setExportOpen),u=I(w=>w.showToast),x=I(w=>w.entries.length),d=I(w=>w.replayEntry),p=I(w=>w.openReplayEditor),v=I(w=>w.openExplain),[k,D]=qe.default.useState("response"),y=qe.default.useMemo(()=>RA(e),[e]),c=Object.keys(y).length>0,m=qe.default.useMemo(()=>l0(e),[e]),g=Array.isArray(e.wsFrames),A=Array.isArray(e.initiator)&&e.initiator.length>0,B=qe.default.useMemo(()=>e.driftFromId&&I.getState().entries.find(w=>w.id===e.driftFromId)||null,[e.driftFromId,x]),b=qe.default.useMemo(()=>k==="headers"?kA(e):k==="cookies"?y:k==="timeline"?AA(e):Kp(e,n),[y,n,e,k]),N=qe.default.useMemo(()=>c0(e,I.getState().entries),[e,x]),S=qe.default.useMemo(()=>wA(N),[N]),_=qe.default.useMemo(()=>B??MA(e,I.getState().entries),[B,e,x]),ne=qe.default.useMemo(()=>_?pe(_):null,[_]),[nt,mt]=qe.default.useState(null);qe.default.useEffect(()=>{D(w=>w==="frames"&&!g||w==="initiator"&&!A||w==="tokens"&&!m.length?"response":w)},[e.id,g,A,m.length]),qe.default.useEffect(()=>{let w=!1;if(mt(null),!!window.XRAY_Worker?.detailAnalysis)return window.XRAY_Worker.detailAnalysis(b,ne).then(le=>{!w&&le&&typeof le=="object"&&mt(le)}).catch(()=>{}),()=>{w=!0}},[b,ne]),qe.default.useEffect(()=>{k==="cookies"&&!c&&D("response")},[c,k]);function co(w){if(D(w),w==="headers"){l("headers"),r("tree");return}if(l("response"),w==="timeline"){r("waterfall");return}(o==="headers"||o==="waterfall")&&r("tree")}function Wo(w){if(r(w),w==="headers"){l("headers"),D("headers");return}if(w==="waterfall"){l("response"),D("timeline");return}l("response"),D("response")}async function va(){await dt(typeof b=="string"?b:W(b,2,5e5)),u("Response copied.")}async function O(w){if(w.kind==="view"){w.id==="headers"||w.view==="headers"?(D("headers"),l("headers"),r("tree")):w.view==="waterfall"?(D("timeline"),l("response"),r("waterfall")):(D("response"),l(w.id==="request"?"request":"response"),w.view&&r(w.view)),u(`${w.label} opened.`);return}if(w.kind==="console"&&w.command){s(w.command),u(`${w.label} inserted in Console.`);return}if(w.kind==="snippet"&&w.command){i({title:`${e.method||"GET"} ${re(e)}`,code:w.command}),u("Saved to Console snippets.");return}if(w.kind==="copy"){let le=w.command??w.lazyCommand?.();if(!le)return;await dt(le),u(w.toast||`${w.label} copied.`);return}w.kind==="export"&&(f(!0),u("Export opened."))}let G=IA.filter(w=>w.id==="cookies"?c:w.id==="frames"?g:w.id==="initiator"?A:w.id==="tokens"?m.length>0:!0),Te=Number(e.status)||0;function Bt(){d(e)}return(0,C.jsxs)("div",{className:`xray-request-detail ${t?"compact":""}`,children:[!t&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)("div",{className:"xray-detail-hero",children:[(0,C.jsxs)("div",{className:"xray-response-heading",children:[(0,C.jsx)("span",{className:`xray-method ${ca(e.method)}`,children:e.method||"GET"}),(0,C.jsx)("h3",{children:re(e)})]}),(0,C.jsxs)("div",{className:"xray-response-chips",children:[(0,C.jsx)("span",{className:`xray-response-chip ${jt(Te)}`,children:e.status||e.logLevel||"log"}),(0,C.jsxs)("span",{className:"xray-response-chip",children:[Math.round(se(e)),"ms"]}),(0,C.jsx)("span",{className:"xray-response-chip",children:Tt(e.size)})]}),a&&(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":"Close selected request detail",onClick:a,children:(0,C.jsx)(ha,{...Le})})]}),B&&(0,C.jsxs)("div",{className:"xray-drift-banner",role:"status",children:[(0,C.jsx)(Er,{...Le}),(0,C.jsx)("span",{children:"Response schema changed versus the previous call to this endpoint."}),(0,C.jsx)("button",{className:"xray-chip",onClick:()=>{D("response"),l("response"),r("diff")},children:"View diff"})]}),(0,C.jsxs)("div",{className:"xray-detail-actionbar","aria-label":"Request actions",children:[(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:Bt,title:"Replay this request from the page",children:[(0,C.jsx)(ro,{...Le}),"Replay"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>p(e),title:"Edit method, headers, or body then replay",children:[(0,C.jsx)(ro,{...Le}),"Edit & Replay"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>v(e),title:"Explain this request with AI",children:[(0,C.jsx)(no,{...Le}),"Explain"]}),(0,C.jsxs)("button",{className:"xray-chip xray-operation-chip",onClick:()=>I.getState().addRule({label:`${e.method||"GET"} ${re(e)}`,match:{url:String(e.urlPath||e.url||""),method:String(e.method||"")},action:{type:"mock",status:Number(e.status)||200,body:typeof pe(e)=="string"?String(pe(e)):W(pe(e),2,1e5),headers:{},delayMs:0}}),title:"Create a mock rule from this response",children:[(0,C.jsx)(Tr,{...Le}),"Mock this"]})]}),(0,C.jsxs)("div",{className:"xray-detail-nav",children:[(0,C.jsx)("div",{className:"xray-detail-tabs","aria-label":"Response tabs",children:G.map(w=>(0,C.jsx)("button",{className:`xray-detail-tab ${k===w.id?"active":""}`,onClick:()=>co(w.id),children:w.label},w.id))}),(0,C.jsx)("div",{className:"xray-detail-views","aria-label":"View modes",children:Wv.map(w=>(0,C.jsx)("button",{className:`xray-chip ${o===w?"active":""}`,onClick:()=>Wo(w),children:bA[w]||w},w))})]}),(0,C.jsx)("div",{className:"xray-operation-groups xray-smart-ops","aria-label":"Smart response operations",children:S.map(w=>(0,C.jsxs)("div",{className:"xray-operation-group",children:[(0,C.jsx)("span",{children:w.label}),(0,C.jsx)("div",{className:"xray-operation-bar",children:w.operations.map(le=>(0,C.jsxs)("button",{className:`xray-chip xray-operation-chip ${le.kind}`,onClick:()=>{O(le)},children:[(0,C.jsx)(CA,{operation:le}),le.label.replace("Send to ","")]},le.id))})]},w.label))})]}),(0,C.jsxs)("div",{className:"xray-detail-content",children:[!t&&k==="frames"&&(0,C.jsx)(OA,{frames:e.wsFrames||[],state:e.wsState}),!t&&k==="initiator"&&(0,C.jsx)(zA,{entry:e}),!t&&k==="tokens"&&(0,C.jsx)(HA,{jwts:m}),(t||k!=="frames"&&k!=="initiator"&&k!=="tokens")&&(0,C.jsxs)(C.Fragment,{children:[(t||o==="tree")&&(0,C.jsx)(TA,{compact:t,entry:e,detailTab:n,responseTab:k,activeValue:b,hasFrames:g}),!t&&o==="grid"&&(0,C.jsx)(FA,{value:b,workerGrid:nt?.grid}),!t&&o==="raw"&&(0,C.jsx)(EA,{value:b}),!t&&o==="schema"&&(0,C.jsx)(DA,{value:b,workerSchema:nt?.schema}),!t&&o==="diff"&&(0,C.jsx)(_A,{current:b,previous:ne,baselineId:B?.id||null,baselineIsDrift:!!B}),!t&&o==="viz"&&(0,C.jsx)(NA,{value:b}),!t&&o==="waterfall"&&(0,C.jsx)(BA,{entry:e}),!t&&o==="headers"&&(0,C.jsx)(I0,{entry:e})]})]}),!t&&(0,C.jsxs)("div",{className:"xray-detail-footer",children:[(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>s("res"),children:[(0,C.jsx)(Dr,{...Le}),"Console"]}),(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>i({title:`${e.method||"GET"} ${re(e)}`,code:"schema(res)"}),children:[(0,C.jsx)(Go,{...Le}),"Snippet"]}),(0,C.jsxs)("button",{className:"xray-action-btn",onClick:()=>{va()},children:[(0,C.jsx)(pt,{...Le}),"Copy"]}),(0,C.jsxs)("button",{className:"xray-action-btn primary",onClick:()=>f(!0),children:[(0,C.jsx)(Ft,{...Le}),"Export"]})]})]})}function wA(e){let t=new Set,a=vA.map(r=>{let n=r.ids,l=e.filter(s=>n.includes(s.id));return l.forEach(s=>t.add(s.id)),{label:r.label,operations:l}}).filter(r=>r.operations.length),o=e.filter(r=>!t.has(r.id));return o.length?[...a,{label:"More",operations:o}]:a}function CA({operation:e}){return e.id==="schema"?(0,C.jsx)(mp,{...Le}):e.id==="table"?(0,C.jsx)(Up,{...Le}):e.id==="visualize"?(0,C.jsx)(kr,{...Le}):e.id==="diff"||e.id==="compare-previous"?(0,C.jsx)(bp,{...Le}):e.id==="waterfall"?(0,C.jsx)(Xp,{...Le}):e.kind==="copy"?(0,C.jsx)(pt,{...Le}):e.kind==="console"?(0,C.jsx)(rt,{...Le}):e.kind==="snippet"?(0,C.jsx)(Go,{...Le}):e.kind==="export"?(0,C.jsx)(Ft,{...Le}):(0,C.jsx)(gp,{...Le})}function kA(e){return{requestHeaders:e.requestHeaders||{},responseHeaders:e.responseHeaders||{}}}function AA(e){return{startedAt:e.timestamp?new Date(e.timestamp).toISOString():null,durationMs:Math.round(se(e)),status:e.status||null,size:Number(e.size)||0,source:e.source||"fetch"}}function RA(e){let t=h0(e.requestHeaders,"cookie"),a=h0(e.responseHeaders,"set-cookie");return{...t?{requestCookie:t}:{},...a?{setCookie:a}:{}}}function h0(e,t){if(!e||typeof e!="object")return"";let a=t.toLowerCase(),o=Object.entries(e).find(([r])=>r.toLowerCase()===a);return o?String(o[1]??""):""}function MA(e,t){let a=Et(e);return t.filter(o=>o.id!==e.id&&o.type==="api"&&Et(o)===a).filter(o=>Number(o.timestamp)<=Number(e.timestamp||Date.now())).sort((o,r)=>Number(r.timestamp)-Number(o.timestamp))[0]||null}function TA({compact:e,entry:t,detailTab:a,responseTab:o,activeValue:r,hasFrames:n}){return e?(0,C.jsx)(Vt,{value:Kp(t,a)}):o==="headers"?(0,C.jsx)(I0,{entry:t}):typeof r=="string"?(0,C.jsx)("pre",{className:"xray-json xray-json-text",children:r}):r==null&&n&&o==="response"?(0,C.jsx)(Je,{label:"Streaming entry",hint:"This is a WebSocket/SSE stream - open the Frames tab to inspect the messages."}):(0,C.jsx)(Vt,{value:r})}function EA({value:e}){let t=qe.default.useMemo(()=>typeof e=="string"?e:W(e),[e]);return(0,C.jsx)("pre",{className:"xray-json",children:t})}function DA({value:e,workerSchema:t}){let a=qe.default.useMemo(()=>t??sa(e),[t,e]);return(0,C.jsx)(Vt,{value:a})}function I0({entry:e}){let[t,a]=qe.default.useState(""),o=I(l=>l.showToast),r=qe.default.useMemo(()=>[{label:"Request headers",headers:Object.entries(e.requestHeaders||{})},{label:"Response headers",headers:Object.entries(e.responseHeaders||{})}],[e]),n=t.trim().toLowerCase();return(0,C.jsxs)("div",{className:"xray-headers-view",children:[(0,C.jsxs)("label",{className:"xray-search xray-headers-filter",children:[(0,C.jsx)(ot,{...Le}),(0,C.jsx)("input",{className:"xray-input",placeholder:"Filter headers...",value:t,onChange:l=>a(l.currentTarget.value)})]}),r.map(l=>{let s=l.headers.filter(([i,f])=>!n||i.toLowerCase().includes(n)||String(f??"").toLowerCase().includes(n));return(0,C.jsxs)("section",{className:"xray-headers-section",children:[(0,C.jsxs)("h4",{children:[l.label,(0,C.jsxs)("span",{className:"xray-muted",children:[" ",s.length]})]}),s.length===0?(0,C.jsx)("p",{className:"xray-muted",children:n?"No headers match.":"No headers captured."}):(0,C.jsx)("div",{className:"xray-headers-grid",children:s.map(([i,f])=>(0,C.jsxs)("div",{className:"xray-header-row",children:[(0,C.jsx)("span",{className:"xray-header-name",children:i}),(0,C.jsx)("span",{className:"xray-header-value",title:String(f??""),children:String(f??"")}),(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":`Copy ${i} value`,onClick:()=>{dt(String(f??"")),o(`${i} copied.`)},children:(0,C.jsx)(pt,{size:13,stroke:2})})]},i))})]},l.label)})]})}function FA({value:e,workerGrid:t}){let{objects:a,columns:o}=t||Jv(e);return a.length?(0,C.jsxs)("table",{className:"xray-table",children:[(0,C.jsx)("thead",{children:(0,C.jsx)("tr",{children:o.map(r=>(0,C.jsx)("th",{children:r},r))})}),(0,C.jsx)("tbody",{children:a.map((r,n)=>(0,C.jsx)("tr",{children:o.map(l=>(0,C.jsx)("td",{children:fa(r[l],160)},l))},n))})]}):(0,C.jsx)(Je,{label:"No object rows found"})}function NA({value:e}){let t=qe.default.useMemo(()=>a0(e),[e]);if(t.kind==="none"||!t.bars.length)return(0,C.jsx)(Je,{label:t.title});let a=t.maxAbs||1;return(0,C.jsxs)("div",{className:"xray-viz",role:"figure","aria-label":t.title,children:[(0,C.jsxs)("div",{className:"xray-viz-head",children:[(0,C.jsx)("h3",{children:t.title}),t.subtitle&&(0,C.jsx)("span",{className:"xray-muted",children:t.subtitle})]}),(0,C.jsx)("div",{className:"xray-viz-bars",children:t.bars.map((o,r)=>(0,C.jsxs)("div",{className:"xray-viz-row",title:`${o.label}: ${$p(o.value)}`,children:[(0,C.jsx)("span",{className:"xray-viz-label",children:o.label}),(0,C.jsx)("span",{className:"xray-viz-track",children:(0,C.jsx)("span",{className:`xray-viz-fill ${o.negative?"negative":""}`,style:{width:`${Math.max(2,Math.abs(o.value)/a*100)}%`}})}),(0,C.jsx)("span",{className:"xray-viz-value",children:$p(o.value)})]},r))}),t.truncated>0&&(0,C.jsxs)("p",{className:"xray-muted xray-viz-foot",children:["+",t.truncated," more not shown"]})]})}function BA({entry:e}){let{phases:t,totalMs:a,real:o}=$v(e),r=Math.max(1,a);return(0,C.jsxs)("div",{className:"xray-card xray-waterfall-card",children:[(0,C.jsxs)("div",{className:"xray-waterfall-head",children:[(0,C.jsx)("h3",{children:"Timing"}),(0,C.jsxs)("span",{className:"xray-muted",children:[o?"Resource Timing":"Wall clock"," \xB7 ",Math.round(a),"ms"]})]}),(0,C.jsx)("div",{className:"xray-waterfall-track",children:t.map(n=>(0,C.jsx)("span",{className:`xray-waterfall-seg ${n.className}`,style:{width:`${Math.max(1,n.ms/r*100)}%`},title:`${n.label}: ${Math.round(n.ms)}ms`},n.label))}),(0,C.jsx)("ul",{className:"xray-waterfall-legend",children:t.map(n=>(0,C.jsxs)("li",{children:[(0,C.jsx)("span",{className:`xray-waterfall-dot ${n.className}`}),(0,C.jsx)("span",{children:n.label}),(0,C.jsxs)("strong",{children:[Math.round(n.ms),"ms"]})]},n.label))}),e.timing?.transferSize?(0,C.jsxs)("p",{className:"xray-muted",children:["Transfer size ",Tt(e.timing.transferSize)]}):null]})}function OA({frames:e,state:t}){return e.length?(0,C.jsxs)("div",{className:"xray-frames",children:[(0,C.jsxs)("div",{className:"xray-frames-head",children:[(0,C.jsx)("span",{className:`xray-ws-state ${t||""}`,children:t||"stream"}),(0,C.jsxs)("span",{className:"xray-muted",children:[e.length," frames"]})]}),(0,C.jsx)("div",{className:"xray-frames-list",children:e.slice().reverse().map((a,o)=>(0,C.jsxs)("div",{className:`xray-frame-row ${a.dir}`,children:[(0,C.jsx)("span",{className:`xray-frame-dir ${a.dir}`,children:a.dir==="in"?"\u2193 in":"\u2191 out"}),(0,C.jsx)("span",{className:"xray-frame-time",children:Ta(a.ts)}),(0,C.jsx)("span",{className:"xray-frame-size",children:Tt(a.size)}),(0,C.jsx)("code",{className:"xray-frame-preview",children:a.preview})]},e.length-o))})]}):(0,C.jsx)(Je,{label:t==="connecting"?"Waiting for stream frames\u2026":"No frames captured"})}function LA(e){let t=e.match(/^\s*(?:at\s+)?(.*?)\s*\(?((?:https?|chrome-extension|webpack|file):[^)\s]+)\)?\s*$/);return t&&t[2]?{fn:t[1]||"(anonymous)",location:t[2]}:{fn:e,location:""}}function zA({entry:e}){let t=I(o=>o.showToast),a=e.initiator||[];return a.length?(0,C.jsxs)("div",{className:"xray-card",children:[(0,C.jsx)("h3",{children:"Call stack"}),(0,C.jsx)("p",{className:"xray-muted",children:"Where this request was initiated from on the page."}),(0,C.jsx)("ol",{className:"xray-initiator-list",children:a.map((o,r)=>{let n=LA(o);return(0,C.jsxs)("li",{className:"xray-initiator-frame",children:[(0,C.jsx)("span",{className:"xray-initiator-fn",children:n.fn}),n.location&&(0,C.jsx)("code",{className:"xray-initiator-loc",title:n.location,children:n.location}),(0,C.jsx)("button",{className:"xray-icon-btn","aria-label":"Copy stack frame",onClick:()=>{dt(o),t("Frame copied.")},children:(0,C.jsx)(pt,{size:13,stroke:2})})]},r)})})]}):(0,C.jsx)(Je,{label:"No initiator captured"})}function HA({jwts:e}){return e.length?(0,C.jsx)("div",{className:"xray-tokens",children:e.map((t,a)=>(0,C.jsxs)("div",{className:"xray-card xray-token-card",children:[(0,C.jsxs)("div",{className:"xray-token-head",children:[(0,C.jsxs)("span",{className:"xray-token-source",children:[(0,C.jsx)(Rp,{...Le}),SA(t.source)]}),t.expiresAt&&(0,C.jsxs)("span",{className:`xray-token-exp ${t.expired?"expired":"valid"}`,children:[t.expired?"Expired":"Valid"," \xB7 exp ",t.expiresAt]})]}),(0,C.jsxs)("div",{className:"xray-token-body",children:[(0,C.jsxs)("div",{children:[(0,C.jsx)("span",{className:"xray-token-label",children:"Header"}),(0,C.jsx)(Vt,{value:t.header})]}),(0,C.jsxs)("div",{children:[(0,C.jsx)("span",{className:"xray-token-label",children:"Payload"}),(0,C.jsx)(Vt,{value:t.payload})]})]})]},a))}):(0,C.jsx)(Je,{label:"No JWT tokens found"})}var qe,C,Le,IA,bA,vA,_A,Jp=E(()=>{"use strict";qe=H(ze());Be();ms();$e();Wp();o0();Dt();s0();u0();ke();ys();C=H(X()),Le={size:16,stroke:1.8},IA=[{id:"response",label:"Preview"},{id:"headers",label:"Headers"},{id:"cookies",label:"Cookies"},{id:"frames",label:"Frames"},{id:"initiator",label:"Initiator"},{id:"tokens",label:"Tokens"},{id:"timeline",label:"Timeline"}],bA={tree:"Tree",raw:"Raw",grid:"Table",schema:"Schema",diff:"Diff",viz:"Visualize",waterfall:"Waterfall",headers:"Headers"},vA=[{label:"Inspect",ids:["inspect-error","schema","table","visualize","headers","waterfall","request"]},{label:"Transform",ids:["compare-previous","diff","mock","related-errors","similar-calls","slow-calls"]},{label:"Copy",ids:["copy-curl","copy-fetch","copy-full"]},{label:"Send",ids:["send-console","save-snippet","export"]}];_A=qe.default.memo(function({current:t,previous:a,baselineId:o,baselineIsDrift:r}){let n=I(s=>s.selectEntry),l=qe.default.useMemo(()=>a==null?[]:e0(a,t),[a,t]);return a==null?(0,C.jsx)(Je,{label:"No previous matching response",hint:"A second call to this endpoint (or a recorded drift baseline) is needed to diff against."}):(0,C.jsxs)("div",{className:"xray-diff",children:[(0,C.jsxs)("div",{className:"xray-diff-head",children:[(0,C.jsx)("span",{className:"xray-muted",children:l.length?`${l.length} difference${l.length===1?"":"s"} vs ${r?"the drift baseline":"the previous call"}`:"No structural differences"}),o&&(0,C.jsx)("button",{className:"xray-chip",onClick:()=>n(o),children:"Jump to baseline"})]}),l.length>0&&(0,C.jsx)("div",{className:"xray-diff-lines",children:l.map((s,i)=>(0,C.jsxs)("div",{className:`xray-diff-line ${s.kind}`,children:[(0,C.jsx)("span",{className:"xray-diff-kind",children:s.kind==="added"?"+":s.kind==="removed"?"\u2212":"\xB1"}),(0,C.jsx)("code",{className:"xray-diff-path",children:s.path||"(root)"}),s.kind!=="added"&&(0,C.jsx)("code",{className:"xray-diff-before",children:fa(s.before,90)}),s.kind!=="removed"&&(0,C.jsx)("code",{className:"xray-diff-after",children:fa(s.after,90)})]},i))})]})})});function PA(e){if(!e||typeof e!="object")return null;let t=e.__xray_ref__;return typeof t=="string"?t:null}function em(e){return PA(e)?!0:Array.isArray(e)?e.some(em):!1}function b0(){let e=window;return typeof e.__XRAY_fetchLogObject__=="function"||typeof e.__XRAY_getLogObject__=="function"}async function v0(e){let t=window;try{if(typeof t.__XRAY_fetchLogObject__=="function")return await t.__XRAY_fetchLogObject__(e);if(typeof t.__XRAY_getLogObject__=="function")return t.__XRAY_getLogObject__(e)}catch{return null}return null}var S0=E(()=>{"use strict"});function hs({entry:e}){let t=e.logData!==void 0?e.logData:e.args??e.message??null,a=Array.isArray(e.objectRefs)?e.objectRefs.filter(u=>typeof u=="string"):[],o=(a.length>0||em(t))&&b0(),[r,n]=Pf.default.useState(void 0),[l,s]=Pf.default.useState(!1);Pf.default.useEffect(()=>{n(void 0),s(!1)},[e.id]);async function i(){s(!0);let u=await Promise.all(a.map(x=>v0(x)));s(!1),n(u.length===1?u[0]:u)}let f=e.logLevel||"log";return(0,vt.jsxs)("div",{className:"xray-log-detail",children:[(0,vt.jsxs)("div",{className:"xray-log-detail-head",children:[(0,vt.jsxs)("span",{className:`xray-log-level ${f}`,children:[(0,vt.jsx)(rt,{...w0}),f]}),(0,vt.jsx)("span",{className:"xray-muted",children:Ta(e.timestamp)}),o&&(0,vt.jsxs)("button",{className:"xray-btn xray-log-load",disabled:l,onClick:()=>{i()},children:[(0,vt.jsx)(Ip,{...w0}),l?"Loading\u2026":r===void 0?"Load full object":"Reload"]})]}),e.message&&typeof e.message=="string"&&(0,vt.jsx)("div",{className:"xray-log-message",children:fa(e.message,400)}),(0,vt.jsx)("div",{className:"xray-log-detail-body",children:r!==void 0?(0,vt.jsx)(Vt,{value:r}):t==null?(0,vt.jsx)(Je,{label:"No log payload"}):(0,vt.jsx)(Vt,{value:t})}),o&&r===void 0&&(0,vt.jsx)("p",{className:"xray-muted xray-log-hint",children:"This is a lightweight preview. Load the full object to inspect deep or truncated values."})]})}var Pf,vt,w0,tm=E(()=>{"use strict";Pf=H(ze());Be();ys();ms();ke();S0();vt=H(X()),w0={size:16,stroke:1.8}});function k0(e){let t=I(p=>p.entries),a=I(p=>p.apiSearchQuery.trim()),o=I(p=>p.statusFilters),r=I(p=>p.typeFilters),n=I(p=>p.methodFilters),l=I(p=>p.expandedGroups),s=I(p=>p.pinnedIds),i=I(p=>p.sortField),f=I(p=>p.sortOrder),u=I(p=>p.apiQuickFilter),x=I(p=>p.apiGroupingMode),d=I(p=>p.settings.slowThresholdMs);return(0,ye.useMemo)(()=>CI({mode:e,entries:t,query:a,statusFilters:o,typeFilters:r,methodFilters:n,expandedGroups:l,pinnedIds:s,sortField:i,sortOrder:f,slowThresholdMs:d,apiQuickFilter:u,apiGroupingMode:x}),[x,u,t,l,n,e,s,a,d,i,f,o,r])}function am({mode:e}){return e==="api"?(0,R.jsx)(jA,{}):(0,R.jsx)(VA,{})}function jA(){let e=I(w=>w.settings.firstRunDismissed),t=I(w=>w.entries),a=I(w=>w.selectedId),o=I(w=>w.apiDetailOpen),r=I(w=>w.selectEntry),n=I(w=>w.setApiDetailOpen),l=I(w=>w.togglePinned),s=I(w=>w.toggleGroup),i=I(w=>w.pinnedIds),f=I(w=>w.settings.compactRows),u=I(w=>w.settings.slowThresholdMs),x=I(w=>w.settings.showHostInPath),d=I(w=>w.sortField),p=I(w=>w.sortOrder),v=I(w=>w.settings.apiSplit),k=I(w=>w.updateSettings),D=k0("api"),y=a&&t.find(w=>w.id===a&&w.type==="api")||null,c=(0,ye.useMemo)(()=>Math.max(100,...t.filter(Pe).map(w=>se(w))),[t]),m=(0,ye.useMemo)(()=>bI(t,i,u),[t,i,u]),g=(0,ye.useRef)(null),A=(0,ye.useCallback)(w=>D[w]?.key||w,[D]),B=(0,ye.useCallback)(()=>f?42:68,[f]),b=zn({count:D.length,getScrollElement:()=>g.current,estimateSize:B,getItemKey:A,overscan:14}),N=d==="timestamp"&&p==="desc",S=(0,ye.useRef)(!1),[_,ne]=(0,ye.useState)(0),nt=(0,ye.useRef)(0);(0,ye.useEffect)(()=>{let w=m.total,le=w-nt.current;nt.current=w,le>0&&N&&S.current&&ne(lt=>lt+le)},[m.total,N]);let mt=(0,ye.useCallback)(()=>{let w=g.current;if(!w)return;let le=w.scrollTop>120;S.current=le,le||ne(0)},[]),co=(0,ye.useCallback)(()=>{ne(0),S.current=!1;let w=g.current;w&&(w.scrollTop=0)},[]),Wo=(0,ye.useCallback)(w=>{r(w.id),n(!0)},[r,n]),va=(0,ye.useCallback)(w=>{w&&s(w)},[s]),O=(0,ye.useCallback)(w=>l(w),[l]),G=Yp({stored:v,varName:"--xray-api-split",minList:260,minRest:340}),Te=10;function Bt(w){if(!["ArrowDown","ArrowUp","Home","End","PageDown","PageUp"].includes(w.key)&&w.key!=="Enter"&&w.key!==" "||!D.length)return;let Na=D.findIndex(Ba=>Ba.entry.id===a);if(w.key==="Enter"||w.key===" "){Na>=0&&(n(!0),w.preventDefault());return}w.preventDefault();let uo=D.length-1,L;if(w.key==="Home")L=0;else if(w.key==="End")L=uo;else{let Ba=w.key==="ArrowDown"?1:w.key==="ArrowUp"?-1:w.key==="PageDown"?Te:-Te;L=Na<0?Ba>0?0:uo:Math.min(uo,Math.max(0,Na+Ba))}let Xe=D[L];Xe&&(r(Xe.entry.id,{openDetail:!1}),b.scrollToIndex(L,{align:"auto"}))}return(0,R.jsx)("section",{className:`xray-api-workspace ${y&&o?"detail-open":""}`,children:(0,R.jsxs)("div",{className:"xray-api-body",style:G.splitStyle,ref:G.containerRef,children:[(0,R.jsxs)("div",{className:"xray-api-collection-pane",ref:G.paneRef,children:[(0,R.jsx)(Qp,{label:"Resize request list",value:G.value,min:G.min,max:G.max,onLiveChange:G.setLive,onCommit:w=>{G.setLive(null),k({apiSplit:w})},onReset:()=>{G.setLive(null),k({apiSplit:0})}}),(0,R.jsx)(YA,{summary:m,visibleCount:D.length}),(0,R.jsx)(QA,{summary:m}),(0,R.jsxs)("div",{className:"xray-api-main",children:[(0,R.jsx)(KA,{}),(0,R.jsxs)("div",{className:"xray-api-table-scroll",ref:g,tabIndex:0,role:"listbox","aria-label":"Captured requests",onKeyDown:Bt,onScroll:mt,children:[(0,R.jsx)("div",{style:{height:b.getTotalSize(),position:"relative"},children:b.getVirtualItems().map(w=>{let le=D[w.index],lt=le.entry;return(0,R.jsx)("div",{"data-index":w.index,ref:b.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${w.start}px)`},children:(0,R.jsx)(WA,{row:le,entries:t,maxDuration:c,selected:a===lt.id,pinned:i.has(lt.id),slowThresholdMs:u,showHostInPath:x,onSelect:Wo,onToggleGroup:va,onTogglePinned:O})},w.key)})}),!D.length&&(e?(0,R.jsx)(Je,{label:"No API requests yet",hint:"Browse the page or trigger a call. Fetch, XHR, GraphQL and WebSocket traffic streams in here live. Press Ctrl/Cmd+K to jump anywhere."}):(0,R.jsx)(Vv,{}))]}),_>0&&(0,R.jsxs)("button",{className:"xray-newmsg-pill xray-newreq-pill",onClick:co,children:[(0,R.jsx)(Bf,{size:14,stroke:2}),_," new"]})]})]}),(0,R.jsx)(JA,{entry:y}),(0,R.jsx)(aR,{entry:y&&o?y:null,onClose:()=>n(!1)})]})})}function VA(){let e=I(d=>d.entries),t=I(d=>d.selectedId),a=I(d=>d.selectEntry),o=I(d=>d.togglePinned),r=I(d=>d.pinnedIds),n=I(d=>d.settings.logsSplit),l=I(d=>d.updateSettings),s=Yp({stored:n,varName:"--xray-logs-split",minList:240,minRest:300}),i=k0("logs"),f=t&&e.find(d=>d.id===t)||null,u=(0,ye.useRef)(null),x=zn({count:i.length,getScrollElement:()=>u.current,estimateSize:()=>46,getItemKey:d=>i[d]?.key||d,measureElement:d=>d.getBoundingClientRect().height,overscan:10});return(0,R.jsxs)("section",{className:"xray-split",style:s.splitStyle,ref:s.containerRef,children:[(0,R.jsxs)("div",{className:"xray-list-panel",ref:s.paneRef,children:[(0,R.jsx)(Qp,{label:"Resize log list",value:s.value,min:s.min,max:s.max,onLiveChange:s.setLive,onCommit:d=>{s.setLive(null),l({logsSplit:d})},onReset:()=>{s.setLive(null),l({logsSplit:0})}}),(0,R.jsx)(nR,{mode:"logs"}),(0,R.jsxs)("div",{className:"xray-virtual-list",ref:u,children:[(0,R.jsx)("div",{style:{height:x.getTotalSize(),position:"relative"},children:x.getVirtualItems().map(d=>{let p=i[d.index];return(0,R.jsx)("div",{"data-index":d.index,ref:x.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${d.start}px)`},children:(0,R.jsx)(oR,{row:p,selected:t===p.entry.id,pinned:r.has(p.entry.id),onSelect:()=>a(p.entry.id),onTogglePinned:()=>o(p.entry.id)})},d.key)})}),!i.length&&(0,R.jsx)(Je,{label:"No logs captured",hint:"Page console.log output and captured objects land here - trigger some activity on the page to populate the list."})]}),(0,R.jsx)(rR,{entry:f})]}),(0,R.jsx)("div",{className:"xray-detail-panel",children:f?(0,R.jsx)(hs,{entry:f}):(0,R.jsx)(Je,{label:"Select an entry",hint:"Pick a log on the left to inspect its arguments and expand nested objects."})})]})}function YA({summary:e,visibleCount:t}){return(0,R.jsxs)("div",{className:"xray-api-collection-head",children:[(0,R.jsxs)("div",{className:"xray-api-collection-title",children:[(0,R.jsx)("span",{children:"Captured Requests"}),(0,R.jsxs)("strong",{children:[e.total," APIs"]})]}),(0,R.jsxs)("div",{className:"xray-api-env-pill",title:"Environment inferred from captured browser traffic",children:[(0,R.jsx)(jp,{...yt}),(0,R.jsx)("span",{children:"Live page"})]}),(0,R.jsx)(Yo,{id:"api-stats",title:"Summary",className:"xray-api-stats-collapsible",children:(0,R.jsxs)("div",{className:"xray-api-summary-strip","aria-label":"Captured request summary",children:[(0,R.jsx)(qf,{tone:"ok",icon:(0,R.jsx)(jo,{...yt}),label:"Visible",value:String(t)}),(0,R.jsx)(qf,{tone:e.errors?"error":"ok",icon:(0,R.jsx)(ps,{...yt}),label:"Errors",value:String(e.errors)}),(0,R.jsx)(qf,{tone:e.slow?"warn":"ok",icon:(0,R.jsx)(is,{...yt}),label:"Avg",value:`${Math.round(e.avgDuration)}ms`}),(0,R.jsx)(qf,{tone:"info",icon:(0,R.jsx)(jo,{...yt}),label:"Bytes",value:Tt(e.totalBytes)})]})})]})}function qf({icon:e,label:t,value:a,tone:o}){return(0,R.jsxs)("span",{className:`xray-api-summary-pill ${o}`,children:[e,(0,R.jsx)("span",{children:t}),(0,R.jsx)("strong",{children:a})]})}function QA({summary:e}){let t=I(b=>b.apiSearchQuery),a=I(b=>b.setApiSearchQuery),o=I(b=>b.apiQuickFilter),r=I(b=>b.setApiQuickFilter),n=I(b=>b.apiGroupingMode),l=I(b=>b.setApiGroupingMode),s=I(b=>b.statusFilters),i=I(b=>b.typeFilters),f=I(b=>b.methodFilters),u=I(b=>b.toggleMethodFilter),x=I(b=>b.toggleStatusFilter),d=I(b=>b.toggleTypeFilter),p=I(b=>b.clearApiFilters),v=I(b=>b.setSort),k=I(b=>b.sortField),D=I(b=>b.sortOrder),y=I(b=>b.entries),c=(0,ye.useMemo)(()=>y.reduce((b,N)=>b+(N.driftFromId?1:0),0),[y]),m=b=>r(o===b?"all":b),g=b=>b==="errors"?e.errors:b==="slow"?e.slow:b==="pinned"?e.pinned:b==="repeated"?e.repeatedEndpoints:b==="drift"?c:null,A=b=>{let N=g(b.id);return(0,R.jsxs)("button",{className:`xray-chip ${o===b.id?"active":""}`,onClick:()=>m(b.id),"aria-pressed":o===b.id,children:[b.label,N!=null&&N>0&&(0,R.jsx)("span",{className:"xray-chip-count",children:N})]},b.id)},B=f.size+i.size+s.size+(o!=="all"?1:0);return(0,R.jsxs)("div",{className:"xray-api-toolbar",children:[(0,R.jsxs)("label",{className:"xray-search xray-api-search",children:[(0,R.jsx)(ot,{...yt}),(0,R.jsx)("input",{className:"xray-input",value:t,onChange:b=>a(b.currentTarget.value),placeholder:"Filter method, status, path, domain, source, content type..."})]}),(0,R.jsxs)(Yo,{id:"api-filters",title:"Filters & Sort",className:"xray-api-filters-collapsible",right:B>0?(0,R.jsx)("span",{className:"xray-chip-count",children:B}):void 0,children:[(0,R.jsxs)("div",{className:"xray-filter-chips xray-api-primary-filters","aria-label":"Primary API filters",children:[(0,R.jsx)("button",{className:`xray-chip ${o==="all"&&!f.size&&!i.size&&!s.size?"active":""}`,onClick:p,children:"All"}),["GET","POST"].map(b=>(0,R.jsx)("button",{className:`xray-chip ${f.has(b)?"active":""}`,onClick:()=>u(b),children:b},b)),["xhr","fetch"].map(b=>(0,R.jsx)("button",{className:`xray-chip ${i.has(b)?"active":""}`,onClick:()=>d(b),children:b==="xhr"?"XHR":"Fetch"},b)),qA.map(A)]}),(0,R.jsxs)("div",{className:"xray-api-secondary-controls",children:[(0,R.jsxs)("div",{className:"xray-filter-chips compact","aria-label":"Status and source filters",children:[(0,R.jsxs)("span",{className:"xray-filter-label",children:[(0,R.jsx)(us,{...yt}),"Match"]}),["2xx","3xx","4xx","5xx"].map(b=>(0,R.jsx)("button",{className:`xray-chip ${s.has(b)?"active":""}`,onClick:()=>x(b),children:b},b)),UA.map(A)]}),(0,R.jsxs)("div",{className:"xray-filter-chips compact","aria-label":"API sort and grouping",children:[(0,R.jsx)("span",{className:"xray-filter-label",children:"Sort"}),XA.map(b=>(0,R.jsxs)("button",{className:`xray-chip ${k===b.id?"active":""}`,onClick:()=>v(b.id),"aria-pressed":k===b.id,children:[b.label,k===b.id&&(D==="asc"?(0,R.jsx)(Bf,{size:13,stroke:2.2}):(0,R.jsx)(_n,{size:13,stroke:2.2}))]},b.id)),["flat","endpoint"].map(b=>(0,R.jsx)("button",{className:`xray-chip ${n===b?"active":""}`,onClick:()=>l(b),children:b==="flat"?"Flat":"Endpoint Groups"},b)),(0,R.jsxs)("button",{className:"xray-chip",onClick:p,children:[(0,R.jsx)(Ar,{...yt}),"Reset"]})]})]})]})]})}function KA(){return(0,R.jsxs)("div",{className:"xray-api-table-head",role:"row",children:[(0,R.jsx)("span",{children:"Method"}),(0,R.jsx)("span",{children:"Request"}),(0,R.jsx)("span",{children:"Status"}),(0,R.jsx)("span",{children:"Timing"}),(0,R.jsx)("span",{className:"xray-api-table-tools",children:(0,R.jsx)(ZA,{})})]})}function ZA(){let e=I(a=>a.settings.compactRows),t=I(a=>a.updateSettings);return(0,R.jsx)("button",{className:"xray-icon-btn xray-density-toggle","aria-pressed":e,title:e?"Switch to expanded (two-line) rows":"Switch to compact (single-line) rows",onClick:()=>t({compactRows:!e}),children:e?(0,R.jsx)(Ep,{...yt}):(0,R.jsx)(Tp,{...yt})})}function $A({flags:e}){if(!e.length)return(0,R.jsx)("span",{className:"xray-api-flags muted",children:"None"});let t=e.slice(0,3);return(0,R.jsxs)("span",{className:"xray-api-flags",title:e.map(a=>C0[a]).join(", "),children:[t.map(a=>(0,R.jsx)("span",{className:`xray-api-flag ${a}`,children:C0[a]},a)),e.length>t.length&&(0,R.jsxs)("span",{className:"xray-api-flag more",children:["+",e.length-t.length]})]})}function eR(e){let t=String(e.url||"");if(!t)return{};try{return Object.fromEntries(new URL(t).searchParams.entries())}catch{return{}}}function tR(e,t,a){return t==="params"?a:t==="headers"?e.requestHeaders||{}:t==="body"?ia(e):t==="timeline"?{startedAt:Ta(e.timestamp),durationMs:Math.round(se(e)),status:e.status||null,source:e.source||"fetch",size:Number(e.size)||0}:{method:String(e.method||"GET").toUpperCase(),url:e.url||e.urlPath||"",path:re(e),source:e.source||"fetch",status:e.status||null,contentType:qo(e)||null}}function aR({entry:e,onClose:t}){return(0,R.jsx)("aside",{className:`xray-api-detail-drawer ${e?"":"empty"}`,"aria-label":"Selected API request detail",children:(0,R.jsx)("div",{className:"xray-api-drawer-body",children:e?(0,R.jsx)(gs,{entry:e,onClose:t}):(0,R.jsx)(Je,{label:"Nothing selected",hint:"Choose a request to open the detail drawer - preview, schema, diff, replay, and more."})})})}function oR({row:e,selected:t,pinned:a,onSelect:o,onTogglePinned:r}){let n=e.entry,l=Number(n.status)||0;return(0,R.jsxs)("button",{className:`xray-entry-row ${t?"selected":""} ${a?"pinned":""}`,onClick:o,children:[(0,R.jsx)("span",{className:`xray-status-dot ${jt(l)}`}),(0,R.jsx)("span",{className:`xray-method ${ca(n.method)}`,children:n.logLevel||"log"}),(0,R.jsx)("span",{className:`xray-status ${jt(l)}`,children:Ta(n.timestamp)}),(0,R.jsx)("span",{className:"xray-entry-main",children:(0,R.jsx)("span",{className:"xray-path",children:fa(n.message??n.logData,160)})}),(0,R.jsx)("span",{className:`xray-pin ${a?"active":""}`,onClick:s=>{s.stopPropagation(),r()},children:(0,R.jsx)(zf,{...yt})})]})}function rR({entry:e}){return e?(0,R.jsx)("div",{className:"xray-mobile-detail-panel",children:e.type==="log"?(0,R.jsx)(hs,{entry:e}):(0,R.jsx)(gs,{entry:e})}):null}function nR({mode:e}){let t=I(o=>o.apiSearchQuery),a=I(o=>o.setApiSearchQuery);return(0,R.jsx)("div",{className:"xray-list-controls",children:(0,R.jsxs)("label",{className:"xray-search",children:[(0,R.jsx)(ot,{...yt}),(0,R.jsx)("input",{className:"xray-input",value:t,onChange:o=>a(o.currentTarget.value),placeholder:e==="api"?"Search path, method, status...":"Search logs..."})]})})}var ye,R,yt,qA,UA,XA,C0,GA,WA,JA,A0=E(()=>{"use strict";ye=H(ze());ip();Be();Vp();ms();Yv();Kv();Jp();tm();ys();$e();Dt();ke();R=H(X()),yt={size:16,stroke:1.8},qA=[{id:"errors",label:"Errors"},{id:"slow",label:"Slow"}],UA=[{id:"repeated",label:"Repeated"},{id:"pinned",label:"Pinned"},{id:"large",label:"Large"},{id:"empty",label:"Empty"},{id:"drift",label:"Drift"},{id:"graphql",label:"GraphQL"},{id:"ws",label:"Streams"},{id:"mocked",label:"Mocked"},{id:"replayed",label:"Replays"}],XA=[{id:"timestamp",label:"Latest"},{id:"duration",label:"Slowest"},{id:"status",label:"Status"},{id:"size",label:"Size"}],C0={error:"Error",slow:"Slow",repeated:"Repeated",large:"Large",empty:"Empty",pinned:"Pinned",drift:"Drift",graphql:"GraphQL",ws:"Stream",mocked:"Mocked",replayed:"Replay"},GA=[{id:"request",label:"Request"},{id:"params",label:"Params"},{id:"headers",label:"Headers"},{id:"body",label:"Body"},{id:"timeline",label:"Timeline"}];WA=ye.default.memo(function({row:t,entries:a,maxDuration:o,selected:r,pinned:n,slowThresholdMs:l,showHostInPath:s,onSelect:i,onToggleGroup:f,onTogglePinned:u}){let x=t.entry,d=Number(x.status)||0,p=re(x),v=Wl(x),k=lf(x)||"local",D=String(x.source||"fetch").toLowerCase(),y=t.groupStats||sf(x,a),c=t.groupStats?.totalBytes??x.size,m=t.flags,g=Math.max(8,Math.min(100,se(x)/o*100)),A=!!(t.groupCount&&t.groupCount>1&&!t.groupChild),B=qo(x)||"response";function b(S){(S.key==="Enter"||S.key===" ")&&(S.preventDefault(),i(x))}async function N(S){S.stopPropagation(),await dt(String(x.url||p))}return(0,R.jsxs)("div",{className:`xray-api-row ${r?"selected":""} ${t.groupChild?"child":""} ${n?"pinned":""} ${A?"group":""} ${d>=400?"has-error":""} ${se(x)>=l?"has-slow":""}`,role:"option","aria-selected":r,tabIndex:r?0:-1,onClick:()=>i(x),onKeyDown:b,children:[(0,R.jsx)("span",{className:`xray-method ${ca(x.method)}`,children:String(x.method||"GET").toUpperCase().replace("DELETE","DEL")}),(0,R.jsxs)("span",{className:"xray-api-path-cell",children:[(0,R.jsx)("span",{className:"xray-path",title:String(x.url||p),children:v}),(0,R.jsx)("span",{className:"xray-entry-meta",children:A?`${y.count} calls - ${y.errors} errors - avg ${Math.round(y.avgDuration)}ms`:`${s?k:B} - ${D.toUpperCase()} - ${Tt(c)} - ${Ta(x.timestamp)}`}),(0,R.jsx)($A,{flags:m})]}),(0,R.jsx)("span",{className:`xray-status ${jt(d)}`,children:x.status||"---"}),(0,R.jsxs)("span",{className:"xray-entry-duration",children:[(0,R.jsx)("span",{className:"xray-bar-track",children:(0,R.jsx)("span",{className:`xray-bar ${se(x)>=l?"slow":""} ${d>=400?"error":""}`,style:{width:`${g}%`}})}),(0,R.jsxs)("span",{children:[Math.round(se(x)),"ms"]})]}),(0,R.jsxs)("span",{className:"xray-api-row-actions",children:[t.groupCount&&t.groupCount>1&&(0,R.jsx)("button",{className:"xray-icon-btn",tabIndex:-1,"aria-label":t.groupExpanded?"Collapse endpoint group":"Expand endpoint group",onClick:S=>{S.stopPropagation(),f(t.groupKey)},children:t.groupExpanded?(0,R.jsx)(oo,{...yt}):(0,R.jsx)(qn,{...yt})}),(0,R.jsx)("button",{className:"xray-icon-btn",tabIndex:-1,"aria-label":"Copy request URL",onClick:S=>{N(S)},children:(0,R.jsx)(pt,{...yt})}),(0,R.jsx)("button",{className:`xray-icon-btn ${n?"active":""}`,tabIndex:-1,"aria-label":n?"Unpin request":"Pin request",onClick:S=>{S.stopPropagation(),u(x.id)},children:(0,R.jsx)(zf,{...yt})})]})]})});JA=ye.default.memo(function({entry:t}){let[a,o]=ye.default.useState("request"),r=(0,ye.useMemo)(()=>t?eR(t):{},[t]),n=(0,ye.useMemo)(()=>t?tR(t,a,r):null,[t,a,r]);if(!t)return(0,R.jsx)("aside",{className:"xray-request-context-pane empty","aria-label":"Selected request context",children:(0,R.jsx)(Je,{label:"Select a request",hint:"Pick a request from the list to inspect its response, headers, timing, and smart operations."})});let l=Number(t.status)||0,s=re(t),i=lf(t)||"local";return(0,R.jsxs)("aside",{className:"xray-request-context-pane","aria-label":"Selected request context",children:[(0,R.jsxs)("div",{className:"xray-request-context-head",children:[(0,R.jsx)("span",{className:"xray-pane-kicker",children:"Request Context"}),(0,R.jsxs)("div",{className:"xray-request-line",children:[(0,R.jsx)("span",{className:`xray-method ${ca(t.method)}`,children:String(t.method||"GET").toUpperCase()}),(0,R.jsx)("code",{title:String(t.url||s),children:s})]}),(0,R.jsxs)("div",{className:"xray-request-meta-grid",children:[(0,R.jsxs)("span",{children:[(0,R.jsx)("strong",{children:"Host"}),i]}),(0,R.jsxs)("span",{children:[(0,R.jsx)("strong",{children:"Status"}),(0,R.jsx)("b",{className:`xray-status ${jt(l)}`,children:t.status||"---"})]}),(0,R.jsxs)("span",{children:[(0,R.jsx)("strong",{children:"Time"}),Math.round(se(t)),"ms"]}),(0,R.jsxs)("span",{children:[(0,R.jsx)("strong",{children:"Size"}),Tt(t.size)]})]})]}),(0,R.jsx)("div",{className:"xray-detail-tabs xray-request-tabs","aria-label":"Request tabs",children:GA.map(f=>(0,R.jsx)("button",{className:`xray-detail-tab ${a===f.id?"active":""}`,onClick:()=>o(f.id),children:f.label},f.id))}),(0,R.jsx)("div",{className:"xray-request-context-content",children:(0,R.jsx)(Vt,{value:n})}),(0,R.jsxs)("div",{className:"xray-request-context-footer",children:[(0,R.jsx)("span",{children:String(t.source||"fetch").toUpperCase()}),(0,R.jsx)("span",{children:qo(t)||"unknown content"})]})]})})});function Uf(e,t){return t==="all"?!0:t==="error"?e.level==="error"||e.type==="error":t==="warn"?e.level==="warn":t==="result"?e.type==="result"||e.type==="command":e.type==="log"&&e.level!=="warn"&&e.level!=="error"}function fR(){let e=I(o=>o.consoleEvents),t=I(o=>o.networkFilter),a=I(o=>o.searchQuery.trim().toLowerCase());return(0,P.useMemo)(()=>e.filter(o=>{if(o.type!=="network")return!1;let r=of(o);if(!r)return!1;let n=String(r.source||"").toLowerCase(),l=Number(r.status)||0;return t==="errors"&&l<400||t!=="all"&&t!=="errors"&&n!==t?!1:a?String(r.method||"").toLowerCase().includes(a)||String(r.status||"").includes(a)||re(r).toLowerCase().includes(a)||n.includes(a):!0}),[e,t,a])}function R0(){let e=I(t=>t.consoleEvents);return(0,P.useMemo)(()=>e.filter(t=>t.type!=="network"),[e])}function M0(){let e=I(c=>c.consoleMiniTab),t=I(c=>c.setConsoleMiniTab),a=I(c=>c.recording),o=I(c=>c.pausedCount),r=I(c=>c.setRecording),n=I(c=>c.clearConsole),l=I(c=>c.requestConfirmation),s=I(c=>c.setExportOpen),i=I(c=>c.searchQuery),f=I(c=>c.setSearchQuery),u=I(c=>c.networkFilter),x=I(c=>c.setNetworkFilter),[d,p]=(0,P.useState)("all"),[v,k]=(0,P.useState)(""),D=R0(),y=(0,P.useMemo)(()=>{let c={all:D.length,log:0,warn:0,error:0,result:0};for(let m of D)Uf(m,"error")?c.error+=1:Uf(m,"warn")?c.warn+=1:Uf(m,"result")?c.result+=1:c.log+=1;return c},[D]);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)("section",{className:"xray-console-head",children:[(0,T.jsx)("div",{className:"xray-console-tabs",children:sR.map(c=>(0,T.jsxs)("button",{className:`xray-mini-tab ${e===c.id?"active":""}`,onClick:()=>t(c.id),children:[c.icon,(0,T.jsx)("span",{children:c.label})]},c.id))}),(0,T.jsxs)("div",{className:"xray-toolbar",children:[(0,T.jsxs)("button",{className:"xray-btn",onClick:()=>l({title:"Clear console stream?",message:"This clears the React console stream only. Captured API entries remain available.",confirmLabel:"Clear console",tone:"danger",onConfirm:n}),children:[(0,T.jsx)(Vo,{...Ee}),"Clear"]}),(0,T.jsxs)("button",{className:`xray-btn ${a?"xray-live":"xray-paused"}`,title:"Pause the live console stream. Messages keep buffering and flush back in when you resume; capture itself is toggled in Settings \u2192 Capture.","aria-pressed":a,onClick:()=>r(!a),children:[(0,T.jsx)(zp,{...Ee}),a?"Live":o>0?`Paused \xB7 ${o} new`:"Paused"]}),(0,T.jsxs)("button",{className:"xray-btn",onClick:()=>s(!0),children:[(0,T.jsx)(Ft,{...Ee}),"Export"]})]})]}),e==="network"&&(0,T.jsxs)("section",{className:"xray-filterbar",children:[(0,T.jsxs)("label",{className:"xray-search",children:[(0,T.jsx)(ot,{...Ee}),(0,T.jsx)("input",{className:"xray-input",placeholder:"Filter by path, method, status...",value:i,onChange:c=>f(c.currentTarget.value)})]}),(0,T.jsx)("div",{className:"xray-filter-chips",children:lR.map(c=>(0,T.jsxs)("button",{className:`xray-chip ${u===c.id?"active":""}`,onClick:()=>x(c.id),children:[c.icon,c.label]},c.id))})]}),e==="console"&&(0,T.jsxs)("section",{className:"xray-filterbar",children:[(0,T.jsxs)("label",{className:"xray-search",children:[(0,T.jsx)(ot,{...Ee}),(0,T.jsx)("input",{className:"xray-input",placeholder:"Filter console messages...",value:v,onChange:c=>k(c.currentTarget.value)})]}),(0,T.jsx)("div",{className:"xray-filter-chips",children:iR.map(c=>(0,T.jsxs)("button",{className:`xray-chip ${d===c.id?"active":""}`,onClick:()=>p(c.id),children:[c.label,(0,T.jsx)("span",{className:"xray-chip-count",children:y[c.id]})]},c.id))})]}),e==="network"&&(0,T.jsx)(uR,{}),e==="console"&&(0,T.jsx)(hR,{levelFilter:d,query:v,onClearFilter:()=>{p("all"),k("")}}),(0,T.jsx)(cR,{}),(0,T.jsx)(bR,{}),(0,T.jsx)(vR,{})]})}function cR(){let e=I(g=>g.snippets),t=I(g=>g.setConsoleDraft),a=I(g=>g.removeSnippet),o=I(g=>g.renameSnippet),r=I(g=>g.saveSnippet),n=I(g=>g.consoleDraft),[l,s]=(0,P.useState)(!1),[i,f]=(0,P.useState)(""),[u,x]=(0,P.useState)(null),[d,p]=(0,P.useState)(""),[v,k]=(0,P.useState)(null),D=(0,P.useRef)(void 0);function y(){r({code:n,title:i.trim()||void 0}),s(!1),f("")}function c(g){a(g.id),k(g),window.clearTimeout(D.current),D.current=window.setTimeout(()=>k(null),6e3)}function m(g){o(g,d),x(null)}return(0,T.jsxs)("div",{className:"xray-snippet-bar","aria-label":"Saved console snippets",children:[(0,T.jsxs)("span",{className:"xray-snippet-label",children:[(0,T.jsx)(Go,{...Ee}),"Snippets"]}),(0,T.jsxs)("div",{className:"xray-snippet-chips",children:[e.length===0&&!v&&(0,T.jsx)("span",{className:"xray-muted",children:"Save reusable commands here."}),e.map(g=>(0,T.jsxs)("span",{className:"xray-snippet-chip",children:[u===g.id?(0,T.jsx)("input",{className:"xray-input xray-snippet-rename",value:d,autoFocus:!0,placeholder:"Snippet name",onChange:A=>p(A.currentTarget.value),onKeyDown:A=>{A.key==="Enter"?m(g.id):A.key==="Escape"&&x(null)},onBlur:()=>m(g.id)}):(0,T.jsx)("button",{className:"xray-snippet-load",title:`${g.code}

Double-click to rename`,onClick:()=>t(g.code),onDoubleClick:()=>{x(g.id),p(g.title||"")},children:g.title||g.code}),(0,T.jsx)("button",{className:"xray-snippet-remove","aria-label":"Delete snippet",onClick:()=>c(g),children:(0,T.jsx)(ha,{size:12,stroke:2})})]},g.id)),v&&(0,T.jsx)("button",{className:"xray-btn xray-snippet-undo",onClick:()=>{r({code:v.code,title:v.title}),k(null)},children:"Undo delete"})]}),l?(0,T.jsxs)("span",{className:"xray-snippet-chip xray-snippet-naming",children:[(0,T.jsx)("input",{className:"xray-input xray-snippet-rename",value:i,autoFocus:!0,placeholder:"Name (optional) - Enter to save",onChange:g=>f(g.currentTarget.value),onKeyDown:g=>{g.key==="Enter"?y():g.key==="Escape"&&(s(!1),f(""))}}),(0,T.jsx)("button",{className:"xray-btn",onClick:y,children:"Save"})]}):(0,T.jsxs)("button",{className:"xray-btn xray-snippet-save",disabled:!n.trim(),title:n.trim()?"Save current command as a snippet":"Type a command to save it",onClick:()=>s(!0),children:[(0,T.jsx)(pp,{...Ee}),"Save"]})]})}function uR(){let e=fR(),t=I(A=>A.networkFilter),a=I(A=>A.searchQuery),o=I(A=>A.setNetworkFilter),r=I(A=>A.setSearchQuery),n=t!=="all"||a.trim().length>0,l=(0,P.useRef)(null),s=(0,P.useRef)(!1),i=(0,P.useRef)(0),f=(0,P.useRef)(!1),u=(0,P.useRef)(0),x=(0,P.useRef)(`${t}\0${a}`),[d,p]=(0,P.useState)(!1),[v,k]=(0,P.useState)(0),D=(0,P.useMemo)(()=>{let A=1/0,B=-1/0;for(let b of e){let N=of(b);if(!N)continue;let S=Number(N.timestamp)||0;A=Math.min(A,S),B=Math.max(B,S+se(N))}return Number.isFinite(A)?{minStart:A,span:Math.max(1,B-A)}:{minStart:0,span:1}},[e]),y=zn({count:e.length,getScrollElement:()=>l.current,estimateSize:A=>I.getState().expandedId===e[A]?.id?420:34,getItemKey:A=>e[A]?.id||A,measureElement:A=>A.getBoundingClientRect().height,overscan:8}),c=(0,P.useCallback)(()=>{e.length&&y.scrollToIndex(e.length-1,{align:"end"});let A=()=>{if(!s.current)return;let B=l.current;B&&(B.scrollTop=B.scrollHeight)};requestAnimationFrame(()=>{A(),requestAnimationFrame(A)}),window.clearTimeout(u.current),u.current=window.setTimeout(A,80)},[e.length,y]);(0,P.useEffect)(()=>()=>window.clearTimeout(u.current),[]);let m=(0,P.useCallback)(A=>{s.current=!1,p(!1),requestAnimationFrame(()=>y.scrollToIndex(A,{align:"start"}))},[y]);(0,P.useEffect)(()=>{let A=e.length,B=`${t} ${a}`;if(x.current!==B){x.current=B,i.current=A,k(0);return}let b=A-i.current;if(i.current=A,!f.current){f.current=!0;return}b>0&&(s.current?c():k(N=>N+b))},[e.length,t,a,c]);let g=(0,P.useCallback)(()=>{let A=l.current;if(!A)return;let B=A.scrollHeight-A.scrollTop-A.clientHeight<48;s.current=B,p(B),B&&k(0)},[]);return(0,P.useEffect)(()=>{g()},[g]),(0,T.jsxs)("section",{className:"xray-network",children:[(0,T.jsxs)("div",{className:"xray-network-head",children:[(0,T.jsx)("span",{children:"Status"}),(0,T.jsx)("span",{children:"Method"}),(0,T.jsx)("span",{children:"Name"}),(0,T.jsx)("span",{children:"Type"}),(0,T.jsx)("span",{children:"Size"}),(0,T.jsx)("span",{children:"Waterfall"})]}),(0,T.jsxs)("div",{className:"xray-virtual-list",ref:l,onScroll:g,children:[(0,T.jsx)("div",{style:{height:y.getTotalSize(),position:"relative"},children:y.getVirtualItems().map(A=>(0,T.jsx)("div",{"data-index":A.index,ref:y.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${A.start}px)`},children:(0,T.jsx)(mR,{event:e[A.index],waterfall:D,index:A.index,onExpand:m})},A.key))}),!e.length&&(0,T.jsx)(Je,{label:n?"No matching requests":"No network activity yet",hint:n?"Nothing matches the current filter and search.":"Trigger a request on the page - fetch, XHR, and WebSocket traffic streams in here live.",action:n?(0,T.jsx)("button",{className:"xray-btn",onClick:()=>{o("all"),r("")},children:"Clear filter"}):void 0})]}),!d&&v>0&&(0,T.jsxs)("button",{className:"xray-newmsg-pill",onClick:()=>{k(0),s.current=!0,p(!0),c()},children:[(0,T.jsx)(_n,{size:14,stroke:2}),v," new"]})]})}function dR(e){let t=String(e.source||"fetch").toLowerCase();if(t==="ws")return"ws";if(t==="sse")return"eventsource";if(e.graphql)return"graphql";let a=qo(e).toLowerCase();return a.includes("json")?"json":a.includes("html")?"document":a.includes("javascript")?"script":a.includes("css")?"stylesheet":a.includes("image")?"img":t}function pR({entry:e}){let t=String(e.source||"").toLowerCase(),a=Number(e.status)||0;if(t==="ws"||t==="sse"){let o=e.wsState||(a===101?"open":"connecting");return(0,T.jsxs)("span",{className:`xray-status-chip stream ${o==="closed"||o==="error"?"closed":"open"}`,title:`${t.toUpperCase()} ${o}`,children:[(0,T.jsx)("span",{className:"xray-stream-dot"}),t.toUpperCase()]})}return(0,T.jsx)("span",{className:`xray-status-swatch ${jt(a)}`,children:a||"-"})}function xR(e){let t=r=>/\n\s*at\s/.test(r)||/^\w*Error\b/.test(r),a=r=>{if(!r||typeof r!="object")return null;let n=r;return n.__type__==="Error"||typeof n.stack=="string"&&typeof n.message=="string"&&"name"in n&&t(n.stack)?{name:String(n.name||"Error"),message:String(n.message||""),stack:String(n.stack||"")}:null},o=a(e.data)||(e.args||[]).map(a).find(Boolean)||null;if(o)return o;if(e.type==="error"&&e.data&&typeof e.data=="object"){let r=e.data;return{name:"Error",message:String(r.message||e.message||"Execution failed"),stack:String(r.stack||"")}}return null}function om(e){for(let t of e.stack.split(`
`)){let a=t.match(/((?:https?|chrome-extension|webpack|file|blob):[^)\s]+:\d+:\d+)/);if(a)return a[1]}return""}function yR(e){let t=e.split("?")[0],a=t.split("/").pop()||t,o=a.split(":"),r=o[0]||"(index)";return o.length>=2?`${r}:${o[1]}`:a}function gR({error:e}){let t=P.default.useMemo(()=>{let a=e.stack.split(`
`).map(r=>r.trim()).filter(Boolean),o=a[0]&&(a[0]===`${e.name}: ${e.message}`||a[0].startsWith(e.name))?1:0;return a.slice(o).map(r=>{let n=r.replace(/^at\s+/,"").match(/^(.*?)\s*\(?((?:https?|chrome-extension|webpack|file|blob):[^)\s]+|<anonymous>[^)]*)\)?$/);return n&&n[2]?{fn:n[1]||"(anonymous)",loc:n[2]}:{fn:r,loc:""}})},[e]);return t.length?(0,T.jsx)("ol",{className:"xray-error-frames",children:t.map((a,o)=>(0,T.jsxs)("li",{children:[(0,T.jsx)("span",{className:"xray-error-fn",children:a.fn}),a.loc&&(0,T.jsx)("code",{className:"xray-error-loc",title:a.loc,children:a.loc})]},o))}):(0,T.jsx)("p",{className:"xray-muted",children:"No stack trace available."})}function hR({levelFilter:e,query:t,onClearFilter:a}){let o=R0(),r=I(g=>g.expandedId),n=(0,P.useRef)(null),l=(0,P.useRef)(!0),s=(0,P.useRef)(0),i=(0,P.useRef)(0),f=(0,P.useRef)(`${e} ${t}`),[u,x]=(0,P.useState)(!0),[d,p]=(0,P.useState)(0),v=(0,P.useMemo)(()=>{let g=t.trim().toLowerCase();return o.filter(A=>Uf(A,e)&&(!g||A.message.toLowerCase().includes(g)))},[o,e,t]),k=(0,P.useMemo)(()=>{let g=[];for(let A of v){let B=g[g.length-1];if(B&&A.type==="log"&&B.event.type==="log"&&B.event.level===A.level&&B.event.message===A.message){B.count+=1;continue}g.push({event:A,count:1})}return g},[v]),D=zn({count:k.length,getScrollElement:()=>n.current,estimateSize:g=>r===k[g]?.event.id?220:36,getItemKey:g=>k[g]?.event.id||g,measureElement:g=>g.getBoundingClientRect().height,overscan:10}),y=(0,P.useCallback)(()=>{k.length&&D.scrollToIndex(k.length-1,{align:"end"});let g=()=>{if(!l.current)return;let A=n.current;A&&(A.scrollTop=A.scrollHeight)};requestAnimationFrame(()=>{g(),requestAnimationFrame(g)}),window.clearTimeout(i.current),i.current=window.setTimeout(g,80)},[k.length,D]);(0,P.useEffect)(()=>()=>window.clearTimeout(i.current),[]),(0,P.useEffect)(()=>{let g=v.length,A=`${e} ${t}`;if(f.current!==A){f.current=A,s.current=g,p(0);return}let B=g-s.current;s.current=g,B>0&&(l.current?y():p(b=>b+B))},[v.length,e,t,y]);let c=(0,P.useCallback)(()=>{let g=n.current;if(!g)return;let A=g.scrollHeight-g.scrollTop-g.clientHeight<48;l.current=A,x(A),A&&p(0)},[]),m=e!=="all"||t.trim().length>0;return(0,T.jsxs)("section",{className:"xray-console-stream-wrap",children:[(0,T.jsxs)("div",{className:"xray-console-stream",ref:n,onScroll:c,children:[(0,T.jsx)("div",{style:{height:D.getTotalSize(),position:"relative"},children:D.getVirtualItems().map(g=>{let A=k[g.index];return A?(0,T.jsx)("div",{"data-index":g.index,ref:D.measureElement,style:{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${g.start}px)`},children:(0,T.jsx)(IR,{event:A.event,count:A.count})},g.key):null})}),!k.length&&(0,T.jsx)(Je,{label:m?"No matching messages":"No console messages",hint:m?"Nothing matches the current level filter and search.":"console.log / warn / error from the page appear here, alongside results from commands you run below.",action:m?(0,T.jsx)("button",{className:"xray-btn",onClick:a,children:"Clear filter"}):void 0})]}),!u&&d>0&&(0,T.jsxs)("button",{className:"xray-newmsg-pill",onClick:()=>{p(0),l.current=!0,x(!0),y()},children:[(0,T.jsx)(_n,{size:14,stroke:2}),d," new"]})]})}function bR(){let e=I(p=>p.selectedId&&p.entries.find(v=>v.id===p.selectedId)||null),t=I(p=>p.addConsoleEvent),a=I(p=>p.consoleDraft),o=I(p=>p.setConsoleDraft),r=I(p=>p.setConsoleMiniTab),[n,l]=(0,P.useState)(!1),[s,i]=(0,P.useState)(""),f=(0,P.useRef)(null),u=(0,P.useRef)({active:!1,draft:""});(0,P.useEffect)(()=>{let p=f.current;p&&(p.style.height="auto",p.style.height=Math.min(p.scrollHeight,110)+"px")},[a]);async function x(p){let v=(p??a).trim();if(!v||n)return;u.current={active:!1,draft:""},o(""),l(!0);let k="cmd_"+Date.now().toString(36);t({id:k,type:"command",level:"info",timestamp:Date.now(),message:v,args:[v],commandId:k}),r("console");try{let D=await kI(v);if(!D||D.type==="empty")return;if(D.type==="error"){let y=D.error?.message||"Execution failed";t({id:"res_"+k,type:"error",level:"error",timestamp:Date.now(),message:y,data:D.error,commandId:k}),p||o(v),i(`Error: ${y}`)}else{let y=fa(D.result,260);t({id:"res_"+k,type:"result",level:"info",timestamp:Date.now(),message:y,data:D.result,commandId:k,truncated:!!D.truncated}),i(`Result: ${y.slice(0,140)}`)}}finally{l(!1)}}function d(p){let v=p.currentTarget;if(p.key==="Enter"&&!p.shiftKey){p.preventDefault(),x();return}if(p.key==="ArrowUp"&&(u.current.active||!a||v.selectionStart===0&&v.selectionEnd===0)){p.preventDefault(),u.current.active||(u.current={active:!0,draft:a});let k=Vd("up");k&&o(k);return}if(p.key==="ArrowDown"&&u.current.active&&v.selectionEnd===a.length){p.preventDefault();let k=Vd("down");k===""?(o(u.current.draft),u.current={active:!1,draft:""}):k!=null&&o(k);return}p.key==="Escape"&&u.current.active&&(p.preventDefault(),p.stopPropagation(),o(u.current.draft),u.current={active:!1,draft:""})}return(0,T.jsxs)("div",{className:"xray-prompt",children:[(0,T.jsx)(qn,{...Ee}),(0,T.jsxs)("div",{className:"xray-prompt-command",children:[(0,T.jsx)("textarea",{ref:f,rows:1,value:a,onChange:p=>{u.current.active=!1,o(p.currentTarget.value)},onKeyDown:d,placeholder:e?"Try res.data, Object.keys(res), schema(res) - Shift+Enter for a new line":"Select a request, then try res.data","aria-label":"Console command"}),(0,T.jsx)("button",{className:"xray-btn xray-prompt-help",title:"Show the console helpers cheatsheet ($help)",onClick:()=>{x("$help")},children:(0,T.jsx)(kp,{...Ee})}),(0,T.jsxs)("button",{className:"xray-btn",disabled:n,onClick:()=>{x()},children:[n?(0,T.jsx)(Un,{...Ee,className:"xray-spin"}):(0,T.jsx)(Lp,{...Ee}),n?"Running\u2026":"Run"]})]}),(0,T.jsx)("button",{className:"xray-context-chip",title:e?"The prompt evaluates res/req against this request. Click to open the request strip.":"Pick a request in the Network strip to give the prompt a res/req context.",onClick:()=>r("network"),children:e?`Selected ${e.method||"GET"} ${re(e)}`:"No request selected"}),(0,T.jsx)("span",{className:"xray-visually-hidden","aria-live":"polite",children:s})]})}function vR(){let e=I(o=>o.entries),t=I(o=>o.settings.slowThresholdMs),a=(0,P.useMemo)(()=>{let o=e.filter(Pe),r=o.filter(s=>Number(s.status)>=400),n=o.filter(s=>se(s)>=t),l=o.length?o.reduce((s,i)=>s+se(i),0)/o.length:0;return{total:o.length,errors:r.length,slow:n.length,avg:l}},[e,t]);return(0,T.jsxs)("footer",{className:"xray-statusbar",children:[(0,T.jsxs)("span",{style:{color:"var(--xray-green)"},children:[a.total-a.errors," ok"]}),(0,T.jsxs)("span",{style:{color:"var(--xray-red)"},children:[a.errors," errors"]}),(0,T.jsxs)("span",{style:{color:"var(--xray-yellow)"},children:[a.slow," slow (>",t,"ms)"]}),(0,T.jsx)("span",{className:"xray-spacer"}),(0,T.jsxs)("span",{children:[a.total," requests - avg ",Math.round(a.avg),"ms"]})]})}var P,T,Ee,lR,sR,iR,mR,IR,T0=E(()=>{"use strict";P=H(ze());ip();Be();ms();Jp();tm();ys();$e();Dt();Yd();ke();T=H(X()),Ee={size:16,stroke:1.8},lR=[{id:"all",label:"All",icon:(0,T.jsx)(us,{...Ee})},{id:"xhr",label:"XHR",icon:(0,T.jsx)(up,{...Ee})},{id:"fetch",label:"Fetch",icon:(0,T.jsx)(cp,{...Ee})},{id:"ws",label:"WS",icon:(0,T.jsx)(Un,{...Ee})},{id:"errors",label:"Errors",icon:(0,T.jsx)(Of,{...Ee})}],sR=[{id:"network",label:"Network",icon:(0,T.jsx)(Rr,{...Ee})},{id:"console",label:"Console",icon:(0,T.jsx)(rt,{...Ee})}],iR=[{id:"all",label:"All"},{id:"log",label:"Logs"},{id:"warn",label:"Warnings"},{id:"error",label:"Errors"},{id:"result",label:"Results"}];mR=P.default.memo(function({event:t,waterfall:a,index:o,onExpand:r}){let n=of(t),l=I(B=>B.settings.slowThresholdMs),s=I(B=>B.selectedId),i=I(B=>B.expandedId),f=I(B=>B.selectEntry),u=I(B=>B.toggleExpanded);if(!n)return(0,T.jsx)("div",{});let x=Number(n.status)||0,d=s===n.id,p=i===t.id,v=se(n),k=((Number(n.timestamp)||0)-a.minStart)/a.span,D=Math.max(0,Math.min(99,k*100)),y=Math.max(1.5,Math.min(100-D,v/a.span*100)),c=Number(n.timing?.ttfbMs)||0,m=Number(n.timing?.downloadMs)||0,g=c&&c+m>0?c/Math.max(v,c+m):.6,A=()=>{if(i===t.id){u(t.id);return}f(n.id,{openDetail:!1}),r(o)};return(0,T.jsxs)("div",{children:[(0,T.jsxs)("div",{className:`xray-network-row ${d?"selected":""} ${p?"expanded":""}`,role:"button",tabIndex:0,"aria-expanded":p,onClick:A,onKeyDown:B=>{(B.key==="Enter"||B.key===" ")&&(B.preventDefault(),A())},children:[(0,T.jsx)(pR,{entry:n}),(0,T.jsx)("span",{className:`xray-method ${ca(n.method)}`,children:String(n.method||"GET").toUpperCase().replace("DELETE","DEL")}),(0,T.jsx)("span",{className:"xray-path",title:String(n.url||""),children:re(n)}),(0,T.jsx)("span",{className:"xray-net-type",title:qo(n)||void 0,children:dR(n)}),(0,T.jsx)("span",{className:"xray-muted xray-net-size",children:Tt(n.size)}),(0,T.jsxs)("span",{className:"xray-waterfall-cell",children:[(0,T.jsx)("span",{className:"xray-waterfall-track",children:(0,T.jsx)("span",{className:`xray-waterfall-bar ${v>=l?"slow":""} ${x>=400?"error":""}`,style:{left:`${D}%`,width:`${y}%`},children:(0,T.jsx)("span",{className:"xray-waterfall-wait",style:{width:`${Math.round(g*100)}%`}})})}),(0,T.jsxs)("span",{className:"xray-waterfall-ms",children:[Math.round(v),"ms"]})]})]}),p&&(0,T.jsx)("div",{className:"xray-detail",children:(0,T.jsx)(gs,{entry:n,compact:!0})})]})});IR=P.default.memo(function({event:t,count:a}){let o=I(x=>x.expandedId),r=I(x=>x.toggleExpanded),n=o===t.id,l=(0,P.useMemo)(()=>xR(t),[t]),s=t.type==="result"||(l?!!l.stack:!1)||t.data!==void 0||!!t.args?.some(x=>x&&typeof x=="object"),i=t.type==="command"?(0,T.jsx)(qn,{...Ee}):t.type==="result"?(0,T.jsx)(xp,{...Ee}):t.level==="error"?(0,T.jsx)(Of,{...Ee}):t.level==="warn"?(0,T.jsx)(ao,{...Ee}):(0,T.jsx)("span",{className:"xray-console-dot","aria-hidden":"true"}),f=n&&t.type==="log"&&t.entryId&&!l&&I.getState().entries.find(x=>x.id===t.entryId)||null,u=(0,P.useMemo)(()=>n&&!f&&!l?af(t.data??t.args??t.message):null,[n,f,l,t]);return(0,T.jsxs)("div",{className:`xray-console-row ${t.type} ${t.level} ${l?"is-error":""}`,role:s?"button":void 0,tabIndex:s?0:void 0,"aria-expanded":s?n:void 0,onClick:()=>s&&r(t.id),onKeyDown:s?x=>{(x.key==="Enter"||x.key===" ")&&(x.preventDefault(),r(t.id))}:void 0,children:[(0,T.jsx)("span",{className:"xray-console-glyph",children:n?(0,T.jsx)(oo,{...Ee}):i}),(0,T.jsxs)("span",{className:"xray-console-message",children:[l?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)("span",{className:"xray-error-name",children:l.name}),l.message?`: ${l.message}`:""]}):t.message,a>1&&(0,T.jsxs)("span",{className:"xray-repeat-badge",title:`${a} identical consecutive messages`,children:["\xD7",a]}),t.truncated&&(0,T.jsx)("span",{className:"xray-truncated-badge",title:"The result was truncated to fit the transfer limit",children:"truncated"})]}),(0,T.jsxs)("span",{className:"xray-console-aside",children:[l&&om(l)&&(0,T.jsx)("span",{className:"xray-console-source",title:om(l),children:yR(om(l))}),(0,T.jsx)("span",{className:"xray-console-time",children:Ta(t.timestamp)})]}),n&&(0,T.jsx)("div",{className:"xray-detail",children:l?(0,T.jsx)(gR,{error:l}):f?(0,T.jsx)(hs,{entry:f}):(0,T.jsx)(Vt,{value:u})})]})})});function nm(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}function E0(e){return e.replace(/[^a-zA-Z0-9]+/g," ").trim().split(/\s+/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join("")||"XrayResponse"}function lm(e){return nm(e?.requestHeaders)}function Xf(e){let t=nm(e?.responseHeaders),a=t["content-type"]??t["Content-Type"]??e?.contentType??"application/json";return String(a)}function SR(e,t="XrayResponse"){let a=sa(e);function o(r,n=0){if(r==="string")return"string";if(r==="number")return"number";if(r==="boolean")return"boolean";if(r==="null")return"null";if(Array.isArray(r))return`${o(r[0],n+1)}[]`;if(r&&typeof r=="object"){let l="  ".repeat(n+1),s="  ".repeat(n);return`{
${Object.entries(r).map(([i,f])=>`${l}${JSON.stringify(i)}: ${o(f,n+1)};`).join(`
`)}
${s}}`}return"unknown"}return`export type ${t} = ${o(a)};`}function wR(e,t="XrayResponse"){let a=sa(e);function o(r){return r==="string"?"z.string()":r==="number"?"z.number()":r==="boolean"?"z.boolean()":r==="null"?"z.null()":Array.isArray(r)?`z.array(${o(r[0])})`:r&&typeof r=="object"?`z.object({
${Object.entries(r).map(([l,s])=>`  ${JSON.stringify(l)}: ${o(s)},`).join(`
`)}
})`:"z.unknown()"}return`import { z } from 'zod';

export const ${E0(t).charAt(0).toLowerCase()}${E0(t).slice(1)}Schema = ${o(a)};`}function CR(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=ia(e),o={method:t,url:String(e.url||""),headers:lm(e),...a==null?{}:{data:a}};return`import axios from 'axios';

const response = await axios(${W(o,2,12e4)});
const data = response.data;`}function kR(e){let t=o=>{let r=String(o??"");return/[",\n]/.test(r)?`"${r.replace(/"/g,'""')}"`:r},a=e.filter(o=>o.type==="api").map(o=>[o.id,o.method||"",o.status||"",o.url||o.urlPath||"",o.source||"",o.duration||"",o.size||"",D0(o.timestamp)]);return[["id","method","status","url","source","durationMs","sizeBytes","timestamp"],...a].map(o=>o.map(t).join(",")).join(`
`)}function D0(e,t=""){let a=Number(e);return!Number.isFinite(a)||Math.abs(a)>AR?t:new Date(a).toISOString()}function RR(e){let t=pe(e),a=t==null?"":typeof t=="string"?t:W(t,2,12e4);return{size:Number(e.size)||a.length,mimeType:Xf(e),text:a}}function MR(e){let t=e.filter(a=>a.type==="api").map(a=>({startedDateTime:D0(a.timestamp,new Date().toISOString()),time:Number(a.duration)||0,request:{method:a.method||"GET",url:a.url||a.urlPath||"",httpVersion:"HTTP/1.1",headers:Object.entries(lm(a)).map(([o,r])=>({name:o,value:String(r)})),queryString:[],cookies:[],headersSize:-1,bodySize:a.requestBody?W(a.requestBody,0).length:0,postData:a.requestBody?{mimeType:"application/json",text:W(ia(a),2,12e4)}:void 0},response:{status:Number(a.status)||0,statusText:"",httpVersion:"HTTP/1.1",headers:Object.entries(nm(a.responseHeaders)).map(([o,r])=>({name:o,value:String(r)})),cookies:[],content:RR(a),redirectURL:"",headersSize:-1,bodySize:Number(a.size)||-1},cache:{},timings:{blocked:0,dns:-1,connect:-1,send:0,wait:Number(a.duration)||0,receive:0,ssl:-1}}));return W({log:{version:"1.2",creator:{name:"XRAY",version:"react-preview"},entries:t}},2,1/0)}function TR(e){if(!e)return"// Select an API request first";let t=pe(e);return`global.fetch = jest.fn();

describe(${JSON.stringify(String(e.urlPath||e.url||"captured request"))}, () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: ${Number(e.status)<400},
      status: ${Number(e.status)||200},
      headers: { get: () => ${JSON.stringify(Xf(e))} },
      json: async () => (${W(t,2,12e4)}),
      text: async () => ${JSON.stringify(typeof t=="string"?t:W(t,0,12e4))},
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('handles the captured response', async () => {
    const response = await fetch(${JSON.stringify(String(e.url||e.urlPath||""))});
    expect(response.status).toBe(${Number(e.status)||200});
  });
});`}function ER(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=pe(e),r=Xf(e).toLowerCase().includes("json")?`HttpResponse.json(${W(a,2,12e4)}, { status: ${Number(e.status)||200} })`:`new HttpResponse(${JSON.stringify(typeof a=="string"?a:W(a,0,12e4))}, { status: ${Number(e.status)||200} })`;return`import { http, HttpResponse } from 'msw';

export const handlers = [
  http.${t}(${JSON.stringify(String(e.url||e.urlPath||""))}, async () => {
    return ${r};
  }),
];`}function DR(e){if(!e)return"// Select an API request first";let t=String(e.method||"GET").toLowerCase(),a=String(e.url||e.urlPath||""),o=Number(e.status)||200,r=`${String(e.method||"GET").toUpperCase()} ${String(e.urlPath||a||"request")}`,n=lm(e),l=ia(e),s=["get","post","put","patch","delete","head"].includes(t),i={};s||(i.method=String(e.method||"GET").toUpperCase()),Object.keys(n).length&&(i.headers=n),l!=null&&t!=="get"&&t!=="head"&&(i.data=l);let f=Object.keys(i).length?`, ${W(i,2,12e4)}`:"",u=s?`request.${t}(${JSON.stringify(a)}${f})`:`request.fetch(${JSON.stringify(a)}${f})`,d=Xf(e).toLowerCase().includes("json")?"  const body = await response.json();":"  const body = await response.text();";return`import { test, expect } from '@playwright/test';

test(${JSON.stringify(r)}, async ({ request }) => {
  const response = await ${u};
  expect(response.status()).toBe(${o});
${d}
  expect(body).toBeTruthy();
});`}function F0(e,t){let a=String(e?.urlPath||e?.url||"session").replace(/^https?:\/\//,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"session",o=Is[t];return`xray-${a}-${t}.${o.extension}`}function N0(e){return e==="session-csv"?"text/csv;charset=utf-8":e==="session-har"||e==="session-json"||e==="json"||e==="schema"||e==="mock"?"application/json;charset=utf-8":e==="raw"?"text/plain;charset=utf-8":e==="curl"?"text/x-shellscript;charset=utf-8":"text/typescript;charset=utf-8"}function B0(e,t,a){if(a==="session-json")return W({entries:t},2,1/0);if(a==="session-csv")return kR(t);if(a==="session-har")return MR(t);if(!e||e.type!=="api")return"// Select an API request first";if(a==="curl")return rf(e);if(a==="fetch")return nf(e);if(a==="axios")return CR(e);if(a==="schema")return W(sa(pe(e)));if(a==="mock"){let o=window.XRAY_ConsoleHelpers?.buildMock?.(e)||pe(e);return W(o,2,12e4)}if(a==="typescript")return SR(pe(e));if(a==="zod")return wR(pe(e));if(a==="jest")return TR(e);if(a==="msw")return ER(e);if(a==="playwright")return DR(e);if(a==="raw"){let o=e.responseDecrypted??e.responseRaw??pe(e);return typeof o=="string"?o:W(o,2,12e4)}return W(e?{entry:e,response:pe(e)}:{entries:t},2,12e4)}var rm,QB,Is,AR,O0=E(()=>{"use strict";ke();rm=[{label:"Request",formats:["curl","fetch","axios"]},{label:"Response",formats:["json","raw","schema","mock"]},{label:"Types",formats:["typescript","zod"]},{label:"Tests",formats:["jest","msw","playwright"]},{label:"Session",formats:["session-json","session-csv","session-har"]}],QB=rm.flatMap(e=>e.formats),Is={curl:{title:"cURL command",desc:"Universal shell command with method, headers, and body.",extension:"sh"},fetch:{title:"fetch() request",desc:"Async JavaScript request with status handling.",extension:"ts"},axios:{title:"Axios request",desc:"Axios call with method, URL, headers, and body.",extension:"ts"},json:{title:"Selected JSON",desc:"Captured request metadata plus parsed response.",extension:"json"},raw:{title:"Raw response",desc:"The selected response body as text or JSON.",extension:"txt"},schema:{title:"Response schema",desc:"Inferred structural schema from the selected response.",extension:"json"},mock:{title:"Mock response",desc:"Generated mock payload using XRAY helpers when available.",extension:"json"},typescript:{title:"TypeScript type",desc:"Static TypeScript shape inferred from response data.",extension:"ts"},zod:{title:"Zod schema",desc:"Runtime validation schema inferred from response data.",extension:"ts"},jest:{title:"Jest test",desc:"Starter test with mocked response behavior.",extension:"test.ts"},msw:{title:"MSW handler",desc:"Mock Service Worker handler for the captured endpoint.",extension:"ts"},playwright:{title:"Playwright test",desc:"API test that re-fires the request and asserts its status.",extension:"spec.ts"},"session-json":{title:"Session JSON",desc:"All captured entries in XRAY session format.",extension:"json"},"session-csv":{title:"Session CSV",desc:"Flat API request summary for spreadsheets.",extension:"csv"},"session-har":{title:"Session HAR",desc:"HTTP Archive compatible export.",extension:"har"}};AR=864e13});function L0(e){let t={};return Array.isArray(e)&&e.forEach(a=>{a&&typeof a=="object"&&"name"in a&&(t[String(a.name)]=String(a.value??""))}),t}function FR(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}function NR(e,t){for(let a of[e,t]){let o=Number(a);if(Number.isFinite(o)&&o>0)return Math.round(o)}return 0}function BR(e){let t=e.request,a=e.response;if(!t)return null;let o=String(t.url||""),r=o;try{r=new URL(o).pathname}catch{}let n=a?.content,l=t.postData,s=Tn(l?.text??null),i=e.timings;return{id:FR("har"),type:"api",timestamp:e.startedDateTime&&Date.parse(String(e.startedDateTime))||Date.now(),source:"import",method:String(t.method||"GET"),url:o,urlPath:r,status:Number(a?.status)||0,duration:NR(e.time,i?.wait),size:Number(n?.size)||0,requestHeaders:L0(t.headers),responseHeaders:L0(a?.headers),requestBody:s,responseRaw:typeof n?.text=="string"?n.text:null,responseDecrypted:null,imported:!0,pinned:!1}}function z0(e){let t;try{t=JSON.parse(e)}catch{return{entries:[],format:"unknown",error:"File is not valid JSON."}}let a=t?.log;if(a&&Array.isArray(a.entries))return{entries:a.entries.map(n=>BR(n)).filter(n=>!!n),format:"har"};let o=t?.entries;if(Array.isArray(o))return{entries:o.filter(n=>!!n&&typeof n=="object"&&typeof n.id=="string").map(n=>({...n,imported:!0})),format:"session"};if(Array.isArray(t)){let r=t.filter(n=>!!n&&typeof n=="object"&&typeof n.id=="string").map(n=>({...n,imported:!0}));if(r.length)return{entries:r,format:"session"}}return{entries:[],format:"unknown",error:"Unrecognized file. Expected a HAR file or XRAY session export."}}var H0=E(()=>{"use strict";ke()});function _0(e){return Array.from(e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(t=>t.offsetParent!==null||t===document.activeElement)}function Nt({title:e,subtitle:t,icon:a,className:o="",children:r,footer:n,onClose:l}){let s=(0,Gf.useRef)(null);return(0,Gf.useEffect)(()=>{let i=document.activeElement instanceof HTMLElement?document.activeElement:null,f=s.current;(f?_0(f)[0]:null)?.focus();function x(d){if(d.key==="Escape"){d.preventDefault(),l();return}if(d.key!=="Tab"||!f)return;let p=_0(f);if(!p.length){d.preventDefault();return}let v=p[0],k=p[p.length-1];d.shiftKey&&document.activeElement===v?(d.preventDefault(),k.focus()):!d.shiftKey&&document.activeElement===k&&(d.preventDefault(),v.focus())}return document.addEventListener("keydown",x,!0),()=>{document.removeEventListener("keydown",x,!0),i?.focus()}},[l]),(0,Yt.jsx)("div",{className:"xray-modal-backdrop",onMouseDown:l,children:(0,Yt.jsxs)("section",{ref:s,className:`xray-modal ${o}`,role:"dialog","aria-modal":"true","aria-label":e,onMouseDown:i=>i.stopPropagation(),children:[(0,Yt.jsxs)("header",{className:"xray-modal-head",children:[a&&(0,Yt.jsx)("span",{className:"xray-modal-title-icon",children:a}),(0,Yt.jsxs)("div",{children:[(0,Yt.jsx)("h3",{children:e}),t&&(0,Yt.jsx)("div",{className:"xray-modal-subtitle",children:t})]}),(0,Yt.jsx)("span",{className:"xray-spacer"}),(0,Yt.jsx)("button",{className:"xray-icon-btn",onClick:l,"aria-label":`Close ${e}`,children:(0,Yt.jsx)(ha,{...OR})})]}),r,n&&(0,Yt.jsx)("footer",{className:"xray-modal-foot",children:n})]})})}var Gf,Yt,OR,Zo=E(()=>{"use strict";Gf=H(ze());Be();Yt=H(X()),OR={size:16,stroke:1.8}});function bs(e){return e.startsWith("session-")}function P0(){let e=I(N=>N.exportOpen),t=I(N=>N.setExportOpen),a=I(N=>N.entries),o=I(N=>N.showToast),r=I(N=>N.insertConsoleCommand),n=I(N=>N.saveSnippet),l=I(N=>N.restoreEntries),s=(0,lo.useRef)(null),i=nb(),[f,u]=(0,lo.useState)("session"),[x,d]=(0,lo.useState)("curl"),p=f==="selected"?i:null,v=(0,lo.useMemo)(()=>B0(p,a,x),[a,x,p]),k=Is[x],D=F0(p,x);if((0,lo.useEffect)(()=>{if(!e)return;let N=i?"selected":"session";u(N),d(N==="selected"?"curl":"session-json")},[e,i?.id]),!e)return null;function y(N){u(N),d(N==="selected"?"curl":"session-json")}async function c(){await dt(v),o(`${k.title} copied.`)}function m(){mI(D,v,N0(x)),o(`${k.title} downloaded.`)}function g(){r(v),t(!1),o("Export snippet inserted in Console.")}function A(){n({title:k.title,code:v}),t(!1),o("Saved to Console snippets.")}async function B(N){let S=N.currentTarget.files?.[0];if(N.currentTarget.value="",!!S)try{let _=await S.text(),ne=z0(_);if(ne.error||!ne.entries.length){o(ne.error||"No entries found in file.");return}l(ne.entries),t(!1),o(`Imported ${ne.entries.length} ${ne.format==="har"?"HAR":"session"} entries.`)}catch{o("Could not read the selected file.")}}let b=f==="selected"&&i?`${i.method||"GET"} ${i.urlPath||i.url||""}`:`${a.length} captured entries`;return(0,$.jsx)(Nt,{title:f==="selected"?"Export selected request":"Export session",subtitle:b,icon:(0,$.jsx)(vp,{...jn}),className:"xray-export-modal",onClose:()=>t(!1),footer:(0,$.jsxs)($.Fragment,{children:[(0,$.jsxs)("span",{className:"xray-muted",children:[v.length.toLocaleString()," chars"]}),(0,$.jsx)("input",{ref:s,type:"file",accept:".har,.json,application/json",style:{display:"none"},onChange:N=>{B(N)}}),(0,$.jsxs)("button",{className:"xray-btn",onClick:()=>s.current?.click(),children:[(0,$.jsx)(Sp,{...jn}),"Import HAR / session"]}),(0,$.jsx)("span",{className:"xray-spacer"}),f==="selected"&&(0,$.jsxs)($.Fragment,{children:[(0,$.jsxs)("button",{className:"xray-btn",onClick:g,children:[(0,$.jsx)(Dr,{...jn}),"Console"]}),(0,$.jsxs)("button",{className:"xray-btn",onClick:A,children:[(0,$.jsx)(Go,{...jn}),"Snippet"]})]}),(0,$.jsxs)("button",{className:"xray-btn",onClick:()=>{c()},children:[(0,$.jsx)(pt,{...jn}),"Copy"]}),(0,$.jsxs)("button",{className:"xray-btn primary",onClick:m,children:[(0,$.jsx)(Ft,{...jn}),"Download"]})]}),children:(0,$.jsxs)("div",{className:"xray-export-body",children:[(0,$.jsxs)("nav",{className:"xray-export-rail","aria-label":"Export formats",children:[(0,$.jsxs)("div",{className:"xray-export-mode",children:[(0,$.jsx)("button",{className:`xray-chip ${f==="selected"?"active":""}`,disabled:!i,title:i?"Use selected request":"Select an API request first",onClick:()=>y("selected"),children:"Selected"}),(0,$.jsx)("button",{className:`xray-chip ${f==="session"?"active":""}`,onClick:()=>y("session"),children:"Session"})]}),rm.map(N=>(0,$.jsxs)("div",{className:"xray-export-group",children:[(0,$.jsx)("div",{className:"xray-export-group-label",children:N.label}),N.formats.map(S=>{let _=f==="session"?!bs(S):bs(S)||!i,ne=!i&&!bs(S)?"Select a request first":f==="session"&&!bs(S)?"Switch to Selected mode":bs(S)&&f==="selected"?"Switch to Session mode":void 0;return(0,$.jsxs)("button",{disabled:_,className:`xray-export-format ${x===S?"active":""}`,title:ne,onClick:()=>d(S),children:[(0,$.jsx)("span",{children:Is[S].title}),(0,$.jsx)("small",{children:Is[S].extension})]},S)})]},N.label))]}),(0,$.jsxs)("section",{className:"xray-export-preview",children:[(0,$.jsxs)("header",{className:"xray-export-preview-head",children:[(0,$.jsxs)("div",{children:[(0,$.jsx)("h3",{children:k.title}),(0,$.jsx)("p",{children:k.desc})]}),(0,$.jsx)("span",{className:"xray-count-pill",children:D})]}),(0,$.jsx)("pre",{className:"xray-json xray-export-code",children:v})]})]})})}var lo,$,jn,q0=E(()=>{"use strict";lo=H(ze());Be();$e();O0();H0();ke();Zo();$=H(X()),jn={size:16,stroke:1.8}});function U0(){let e=I(o=>o.pendingConfirmation),t=I(o=>o.closeConfirmation),a=I(o=>o.confirmPending);return e?(0,ua.jsx)(Nt,{title:e.title,subtitle:"Confirm this action before XRAY changes the current session.",icon:(0,ua.jsx)(ao,{...LR}),className:"xray-confirm-modal",onClose:t,footer:(0,ua.jsxs)(ua.Fragment,{children:[(0,ua.jsx)("span",{className:"xray-spacer"}),(0,ua.jsx)("button",{className:"xray-btn",onClick:t,children:e.cancelLabel||"Cancel"}),(0,ua.jsx)("button",{className:`xray-btn ${e.tone==="danger"?"danger":"primary"}`,onClick:a,children:e.confirmLabel})]}),children:(0,ua.jsx)("div",{className:"xray-modal-body",children:(0,ua.jsx)("p",{className:"xray-confirm-message",children:e.message})})}):null}var ua,LR,X0=E(()=>{"use strict";Be();$e();Zo();ua=H(X()),LR={size:17,stroke:1.8}});function zR(e){return e.reduce((t,a)=>{let o=Et(a);return t[o]=(t[o]||0)+1,t},{})}function HR(e){let t=Number(e.status)||0;return t>=500?"5xx":t>=400?"4xx":t>=300?"3xx":t>=200?"2xx":"other"}function G0(e,t=500){let a=e.filter(Pe),o=a.filter(s=>Number(s.status)>=400),r=a.filter(s=>se(s)>=t),n=zR(a),l=a.reduce((s,i)=>{let f=HR(i);return s[f]=(s[f]||0)+1,s},{});return{requests:a.length,errors:o.length,slow:r.length,avgDuration:a.length?a.reduce((s,i)=>s+se(i),0)/a.length:0,totalBytes:a.reduce((s,i)=>s+(Number(i.size)||0),0),statusCounts:l,repeatedEndpoints:n,nPlusOneCandidates:Object.entries(n).filter(([,s])=>s>=3).map(([s,i])=>{let f=a.filter(x=>Et(x)===s),u=f[0];return{path:u?re(u):s,label:u?Wl(u):s,count:i,avgDuration:f.length?f.reduce((x,d)=>x+se(d),0)/f.length:0}}).sort((s,i)=>i.count-s.count).slice(0,8),topSlowRequests:a.slice().sort((s,i)=>se(i)-se(s)).slice(0,8).map(s=>({id:s.id,method:String(s.method||"GET"),path:re(s),duration:se(s),status:Number(s.status)||0}))}}var j0=E(()=>{"use strict";Dt()});var Vn,K,Br,vs=E(()=>{"use strict";Be();Vn=H(X()),K={size:16,stroke:1.8},Br=[{id:"console",label:"Console",icon:(0,Vn.jsx)(rt,{...K})},{id:"api",label:"API",icon:(0,Vn.jsx)(Rr,{...K})},{id:"logs",label:"Logs",icon:(0,Vn.jsx)(yp,{...K})},{id:"rules",label:"Rules",icon:(0,Vn.jsx)(Tr,{...K})},{id:"insights",label:"Insights",icon:(0,Vn.jsx)(kr,{...K})}]});function V0(){let e=I(l=>l.entries),t=I(l=>l.setApiSearchQuery),a=I(l=>l.setActiveTab),o=I(l=>l.settings.slowThresholdMs),r=G0(e,o);function n(l){t(l),a("api")}return(0,Z.jsxs)("section",{className:"xray-page",children:[(0,Z.jsx)("header",{className:"xray-page-head",children:(0,Z.jsxs)("div",{children:[(0,Z.jsx)("h3",{children:"Insights"}),(0,Z.jsx)("p",{children:"Deterministic local signals from captured requests. No external AI service is used."})]})}),(0,Z.jsx)(Yo,{id:"insights-overview",title:"Overview",className:"xray-insight-overview",children:(0,Z.jsxs)("div",{className:"xray-insight-grid",children:[(0,Z.jsx)(Ss,{icon:(0,Z.jsx)(jo,{...K}),label:"Requests",value:String(r.requests)}),(0,Z.jsx)(Ss,{icon:(0,Z.jsx)(ao,{...K}),label:"Errors",value:String(r.errors),tone:r.errors?"error":"ok"}),(0,Z.jsx)(Ss,{icon:(0,Z.jsx)(Pn,{...K}),label:"Slow",value:String(r.slow),tone:r.slow?"warn":"ok"}),(0,Z.jsx)(Ss,{icon:(0,Z.jsx)(is,{...K}),label:"Average",value:`${Math.round(r.avgDuration)}ms`}),(0,Z.jsx)(Ss,{icon:(0,Z.jsx)(ps,{...K}),label:"Payload",value:Tt(r.totalBytes)})]})}),(0,Z.jsxs)("div",{className:"xray-insight-columns",children:[(0,Z.jsx)(Yo,{id:"insights-repeated",title:"Repeated endpoints",className:"xray-card",children:r.nPlusOneCandidates.length?r.nPlusOneCandidates.map(l=>(0,Z.jsxs)("button",{className:"xray-insight-row",onClick:()=>n(l.path),children:[(0,Z.jsx)(Er,{...K}),(0,Z.jsx)("span",{children:l.label}),(0,Z.jsxs)("strong",{children:[l.count,"x"]})]},l.label)):(0,Z.jsx)("p",{className:"xray-muted",children:"No repeated endpoint pattern above threshold."})}),(0,Z.jsx)(Yo,{id:"insights-slowest",title:"Slowest requests",className:"xray-card",children:r.topSlowRequests.map(l=>(0,Z.jsxs)("button",{className:"xray-insight-row",onClick:()=>n(l.path),children:[(0,Z.jsx)("span",{className:"xray-method",children:l.method}),(0,Z.jsx)("span",{children:l.path}),(0,Z.jsxs)("strong",{children:[Math.round(l.duration),"ms"]})]},l.id))}),(0,Z.jsx)(Yo,{id:"insights-status",title:"Status mix",className:"xray-card",children:Object.entries(r.statusCounts).map(([l,s])=>(0,Z.jsxs)("div",{className:"xray-status-mix-row",children:[(0,Z.jsx)("span",{children:l}),(0,Z.jsx)("span",{className:"xray-bar-track",children:(0,Z.jsx)("span",{className:"xray-bar",style:{width:`${Math.max(8,s/Math.max(1,r.requests)*100)}%`}})}),(0,Z.jsx)("strong",{children:s})]},l))})]})]})}function Ss({icon:e,label:t,value:a,tone:o=""}){return(0,Z.jsxs)("div",{className:`xray-api-metric ${o}`,children:[e,(0,Z.jsx)("span",{children:t}),(0,Z.jsx)("strong",{children:a})]})}var Z,Y0=E(()=>{"use strict";Be();$e();j0();ke();Vp();vs();Z=H(X())});function Q0(){let e=I(u=>u.rules),t=I(u=>u.addRule),a=I(u=>u.setRules),o=I(u=>u.showToast),[r,n]=(0,sm.useState)(!1),[l,s]=(0,sm.useState)("");function i(){if(!e.length){o("No rules to export.");return}dt(VI(e)),o(`Copied ${e.length} rule${e.length===1?"":"s"} to clipboard.`)}function f(){let u=YI(l);if(!u){o("Could not read a rule set from that text.");return}a([...e,...u]),s(""),n(!1),o(`Imported ${u.length} rule${u.length===1?"":"s"}.`)}return(0,q.jsxs)("section",{className:"xray-page xray-rules-page",children:[(0,q.jsxs)("header",{className:"xray-page-head",children:[(0,q.jsxs)("div",{children:[(0,q.jsx)("h3",{children:"Traffic Rules"}),(0,q.jsx)("p",{children:"Intercept matching requests to mock responses, inject latency, or force failures. Rules run in the page before the real network call."})]}),(0,q.jsxs)("button",{className:"xray-btn primary",onClick:()=>t(),children:[(0,q.jsx)(Hp,{...K}),"New rule"]})]}),(0,q.jsxs)("div",{className:"xray-rules-toolbar",children:[(0,q.jsx)("span",{className:"xray-rules-toolbar-label",children:"Presets"}),jI.map(u=>(0,q.jsx)("button",{className:"xray-chip",onClick:()=>{t(u.rule),o(`Added preset \u201C${u.label}\u201D.`)},children:u.label},u.label)),(0,q.jsx)("span",{className:"xray-spacer"}),(0,q.jsxs)("button",{className:"xray-chip",onClick:i,title:"Copy all rules as portable JSON",children:[(0,q.jsx)(pt,{...K}),"Export"]}),(0,q.jsxs)("button",{className:"xray-chip",onClick:()=>n(u=>!u),title:"Paste a rule set to load",children:[(0,q.jsx)(ss,{...K}),"Import"]})]}),r&&(0,q.jsxs)("div",{className:"xray-rules-import",children:[(0,q.jsx)("textarea",{className:"xray-input xray-rules-import-field",placeholder:"Paste a rule set exported from XRAY (JSON)",value:l,spellCheck:!1,onChange:u=>s(u.currentTarget.value)}),(0,q.jsx)("button",{className:"xray-btn primary",onClick:f,children:"Load rules"})]}),e.length?(0,q.jsx)("div",{className:"xray-rules-list",children:e.map(u=>(0,q.jsx)(PR,{rule:u},u.id))}):(0,q.jsxs)("div",{className:"xray-card xray-rules-empty",children:[(0,q.jsx)(Tr,{size:22,stroke:1.6}),(0,q.jsx)("p",{children:"No rules yet. Create one here, or use \u201CMock this\u201D on any captured response to seed a rule from real traffic."})]})]})}function PR({rule:e}){let t=I(r=>r.updateRule),a=I(r=>r.removeRule),o=I(r=>r.toggleRule);return(0,q.jsxs)("div",{className:`xray-card xray-rule-card ${e.enabled?"":"disabled"}`,children:[(0,q.jsxs)("div",{className:"xray-rule-head",children:[(0,q.jsx)("button",{className:`xray-toggle ${e.enabled?"on":""}`,"aria-label":"Toggle rule","aria-pressed":e.enabled,onClick:()=>o(e.id)}),(0,q.jsx)("input",{className:"xray-input xray-rule-label",value:e.label,onChange:r=>t(e.id,{label:r.currentTarget.value}),placeholder:"Rule name"}),(0,q.jsx)("span",{className:"xray-rule-summary",children:GI(e)}),(0,q.jsx)("button",{className:"xray-icon-btn","aria-label":"Delete rule",onClick:()=>a(e.id),children:(0,q.jsx)(Vo,{...K})})]}),(0,q.jsxs)("div",{className:"xray-rule-grid",children:[(0,q.jsxs)("label",{className:"xray-field",children:[(0,q.jsx)("span",{children:"URL contains / re:pattern"}),(0,q.jsx)("input",{className:"xray-input",value:e.match.url,onChange:r=>t(e.id,{match:{...e.match,url:r.currentTarget.value}}),placeholder:"/api/users or re:\\\\/v2\\\\/.*"})]}),(0,q.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,q.jsx)("span",{children:"Method"}),(0,q.jsxs)("select",{className:"xray-select",value:e.match.method,onChange:r=>t(e.id,{match:{...e.match,method:r.currentTarget.value}}),children:[(0,q.jsx)("option",{value:"",children:"ANY"}),["GET","POST","PUT","PATCH","DELETE"].map(r=>(0,q.jsx)("option",{value:r,children:r},r))]})]}),(0,q.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,q.jsx)("span",{children:"Action"}),(0,q.jsx)("select",{className:"xray-select",value:e.action.type,onChange:r=>t(e.id,{action:{...e.action,type:r.currentTarget.value}}),children:_R.map(r=>(0,q.jsx)("option",{value:r.id,children:r.label},r.id))})]}),e.action.type==="mock"&&(0,q.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,q.jsx)("span",{children:"Status"}),(0,q.jsx)("input",{className:"xray-input",type:"number",min:200,max:599,value:e.action.status,onChange:r=>t(e.id,{action:{...e.action,status:Number(r.currentTarget.value)}})})]}),(e.action.type==="mock"||e.action.type==="delay")&&(0,q.jsxs)("label",{className:"xray-field xray-field-narrow",children:[(0,q.jsx)("span",{children:"Delay (ms)"}),(0,q.jsx)("input",{className:"xray-input",type:"number",min:0,max:6e4,step:100,value:e.action.delayMs,onChange:r=>t(e.id,{action:{...e.action,delayMs:Number(r.currentTarget.value)}})})]})]}),e.action.type==="mock"&&(0,q.jsxs)("label",{className:"xray-field",children:[(0,q.jsx)("span",{children:"Response body"}),(0,q.jsx)("textarea",{className:"xray-input xray-rule-body",value:e.action.body,spellCheck:!1,onChange:r=>t(e.id,{action:{...e.action,body:r.currentTarget.value}}),placeholder:'{ "mocked": true }'})]})]})}var sm,q,_R,K0=E(()=>{"use strict";sm=H(ze());Be();$e();bf();ke();vs();q=H(X()),_R=[{id:"mock",label:"Mock response"},{id:"delay",label:"Add delay"},{id:"fail",label:"Force failure"},{id:"passthrough",label:"Passthrough"}]});var ws,jf,im=E(()=>{"use strict";ws="0.3.0",jf="2026-08-29 02:09 UTC"});function W0(){let e=I(S=>S.settingsOpen),t=I(S=>S.setSettingsOpen),a=I(S=>S.settings),o=I(S=>S.recording),r=I(S=>S.setRecording),n=I(S=>S.updateSettings),l=I(S=>S.resetSettings),s=I(S=>S.aiSettings),i=I(S=>S.setAiSettings),f=I(S=>S.clearEntries),u=I(S=>S.clearConsole),x=I(S=>S.clearPinned),d=I(S=>S.clearApiFilters),p=I(S=>S.setExportOpen),v=I(S=>S.entries),k=I(S=>S.consoleEvents),D=I(S=>S.pinnedIds),y=I(S=>S.requestConfirmation),c=I(S=>S.showToast),m=I(S=>S.settingsSection),[g,A]=(0,ba.useState)("general");if(ba.default.useEffect(()=>{e&&A(m)},[e,m]),!e)return null;function B(S,_,ne,nt){if(!a.confirmDestructiveActions){nt();return}y({title:S,message:_,confirmLabel:ne,tone:"danger",onConfirm:nt})}function b(){B("Reset XRAY settings?","This restores panel preferences to defaults. Captured requests are not deleted.","Reset settings",()=>{l(),c("Settings reset.")})}function N(){B("Clear all captured entries?","This removes requests, logs, console events, and pins from the React UI session.","Clear data",()=>{f(),c("Captured data cleared.")})}return(0,h.jsx)(Nt,{title:"Settings",subtitle:"Runtime controls and UI preferences",icon:(0,h.jsx)(Fr,{...Me}),className:"xray-settings-modal",onClose:()=>t(!1),footer:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)("span",{className:"xray-modal-version",children:"XRAY React UI - local deterministic runtime"}),(0,h.jsx)("span",{className:"xray-spacer"}),(0,h.jsx)("button",{className:"xray-btn",onClick:()=>t(!1),children:"Cancel"}),(0,h.jsxs)("button",{className:"xray-btn primary",onClick:()=>{t(!1),c("Settings saved.")},children:[(0,h.jsx)(ls,{...Me}),"Save"]})]}),children:(0,h.jsxs)("div",{className:"xray-settings-modal-body",children:[(0,h.jsx)("nav",{className:"xray-settings-nav","aria-label":"Settings sections",children:UR.map(S=>(0,h.jsxs)("button",{className:`xray-settings-nav-item ${g===S.id?"active":""}`,onClick:()=>A(S.id),children:[S.icon,(0,h.jsx)("span",{children:S.label})]},S.id))}),(0,h.jsxs)("div",{className:"xray-settings-content",children:[g==="general"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"General"}),(0,h.jsx)(io,{label:"Stream to console live",desc:"Append newly captured events to the console stream as they arrive. Pausing this does not stop capture - that's under Capture.",checked:o,onChange:r}),(0,h.jsx)(Cs,{label:"Default detail view",desc:"Switches the detail pane to this view now, and whenever settings are reset.",value:a.defaultDetailView,options:VR,onChange:S=>n({defaultDetailView:S})}),(0,h.jsx)(io,{label:"Confirm destructive actions",desc:"Ask before clearing data, pins, or settings.",checked:a.confirmDestructiveActions,onChange:S=>n({confirmDestructiveActions:S})})]}),g==="capture"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Capture"}),(0,h.jsx)(io,{label:"Intercept fetch",desc:"Capture native fetch() requests from the page.",checked:a.captureFetch,onChange:S=>n({captureFetch:S})}),(0,h.jsx)(io,{label:"Intercept XHR",desc:"Capture XMLHttpRequest calls from the page.",checked:a.captureXhr,onChange:S=>n({captureXhr:S})}),(0,h.jsx)(io,{label:"Capture WebSocket & SSE",desc:"Stream WebSocket and Server-Sent Event frames into the timeline.",checked:a.captureWs,onChange:S=>n({captureWs:S})}),(0,h.jsx)(fm,{label:"Max entries",desc:"Trim oldest entries after this limit.",value:a.maxEntries,min:50,max:5e3,step:50,suffix:"entries",onChange:S=>n({maxEntries:S})})]}),g==="session"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Session"}),(0,h.jsx)(Or,{label:"Captured data",desc:`${v.length} entries \xB7 ${k.length} console events \xB7 ${D.size} pinned.`}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Export session"}),(0,h.jsx)("small",{children:"Open the export modal for JSON, CSV, HAR, and per-request formats."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>{t(!1),p(!0)},children:[(0,h.jsx)(Ft,{...Me}),"Export"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear API filters"}),(0,h.jsx)("small",{children:"Reset search, quick filters, method/status/source, sort, and grouping."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>{d(),c("API filters cleared.")},children:[(0,h.jsx)(Ar,{...Me}),"Clear filters"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear pinned"}),(0,h.jsx)("small",{children:"Remove all pinned request markers."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>B("Clear pinned requests?","This removes all pinned request markers.","Clear pinned",()=>{x(),c("Pinned requests cleared.")}),children:[(0,h.jsx)(Op,{...Me}),"Clear pinned"]})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Clear console stream"}),(0,h.jsx)("small",{children:"Clear console UI events but keep captured API entries."})]}),(0,h.jsxs)("button",{className:"xray-btn",onClick:()=>B("Clear console stream?","This clears console UI events but keeps captured API entries.","Clear console",()=>{u(),c("Console stream cleared.")}),children:[(0,h.jsx)(Vo,{...Me}),"Clear console"]})]})]}),g==="ai"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"AI (bring your own key)"}),(0,h.jsx)(Or,{label:"Local & private",desc:"Your key is stored only in this browser's extension storage. XRAY calls the provider directly from the extension background - nothing is sent anywhere else."}),(0,h.jsx)(Cs,{label:"Provider",desc:"Anthropic and OpenAI are built in. Custom works with any OpenAI-compatible endpoint - OpenRouter, Groq, Together, DeepSeek, Mistral, Azure, or a local Ollama or LM Studio server.",value:s.provider,options:["anthropic","openai","custom"],onChange:S=>{let _=S;i({provider:_,model:Z0[_][0]??""})}}),s.provider==="custom"?(0,h.jsx)(Vf,{label:"Model",desc:"Model name exactly as your endpoint expects it.",value:s.model,placeholder:"llama3.1:8b",onChange:S=>i({model:S})}):(0,h.jsx)(Cs,{label:"Model",desc:"Model used for request explanations.",value:s.model,options:Z0[s.provider],onChange:S=>i({model:S})}),s.provider==="custom"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(Vf,{label:"Endpoint",desc:"Base URL or full chat-completions URL. Must be https, except localhost for a local model server.",value:s.baseUrl,placeholder:"https://openrouter.ai/api/v1",onChange:S=>i({baseUrl:S})}),(0,h.jsx)(Vf,{label:"Auth header",desc:"Header carrying the key. Almost every provider uses authorization.",value:s.authHeader,placeholder:"authorization",onChange:S=>i({authHeader:S})}),(0,h.jsx)(Vf,{label:"Auth prefix",desc:"Text before the key. Usually 'Bearer ' - leave blank to send the key on its own.",value:s.authPrefix,placeholder:"Bearer ",onChange:S=>i({authPrefix:S})})]}),(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"API key"}),(0,h.jsx)("small",{children:"Stored locally. Used only for Explain requests."})]}),(0,h.jsx)("input",{className:"xray-input",type:"password",value:s.apiKey,placeholder:"sk-...",onChange:S=>i({apiKey:S.currentTarget.value}),autoComplete:"off"})]})]}),g==="appearance"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Appearance"}),(0,h.jsxs)("div",{className:"xray-settings-row xray-theme-picker-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Theme"}),(0,h.jsx)("small",{children:"Pick a preset, or build your own with full color freedom. Themes only restyle this panel - never the page or the extension."})]}),(0,h.jsxs)("div",{className:"xray-theme-grid",children:[XR.map(S=>(0,h.jsxs)("button",{className:`xray-theme-swatch ${a.theme===S.id?"active":""}`,style:{background:S.bg,color:S.text},onClick:()=>n(S.accentPref?{theme:S.id,accent:S.accentPref}:{theme:S.id}),"aria-pressed":a.theme===S.id,children:[(0,h.jsx)("span",{className:"xray-theme-swatch-dot",style:{background:S.accent}}),(0,h.jsx)("span",{className:"xray-theme-swatch-label",children:S.label}),a.theme===S.id&&(0,h.jsx)(ls,{size:13,stroke:2.6})]},S.id)),(0,h.jsxs)("button",{className:`xray-theme-swatch ${a.theme==="custom"?"active":""}`,style:{background:a.customTheme.bg,color:a.customTheme.text},onClick:()=>n({theme:"custom"}),"aria-pressed":a.theme==="custom",children:[(0,h.jsx)("span",{className:"xray-theme-swatch-dot",style:{background:a.customTheme.accent}}),(0,h.jsx)("span",{className:"xray-theme-swatch-label",children:"Custom"}),a.theme==="custom"&&(0,h.jsx)(ls,{size:13,stroke:2.6})]})]})]}),a.theme==="custom"&&(0,h.jsx)(KR,{}),(0,h.jsx)(Cs,{label:"Font stack",desc:"Choose the code-first monospace stack used across tables, JSON, and console.",value:a.font,options:YR,onChange:S=>n({font:S})}),(0,h.jsx)(Cs,{label:"Density",desc:"Control global spacing, row heights, and panel chrome.",value:a.density,options:QR,onChange:S=>n({density:S})}),(0,h.jsx)($R,{label:"Corner radius",desc:"Roundness of cards, buttons, inputs, and drawers.",value:a.radius,min:0,max:20,step:1,suffix:"px",onChange:S=>n({radius:S})}),(0,h.jsx)(eM,{settings:a,onChange:S=>n({accent:S})}),(0,h.jsx)(io,{label:"Operator glow",desc:"Enable subtle cyan/purple terminal glow and active-focus lighting.",checked:a.glow,onChange:S=>n({glow:S})}),(0,h.jsx)(io,{label:"Hacker mode",desc:"CRT scanlines, vignette, a moving scan sweep, and phosphor glow. Close Settings to see it - it styles the panel behind this dialog. Respects reduced-motion.",checked:a.hacker,onChange:S=>{n({hacker:S}),c(S?"Hacker mode ON - close Settings to see the CRT.":"Hacker mode off.")}}),(0,h.jsx)(io,{label:"Compact rows",desc:"Reduce request row height for dense API sessions.",checked:a.compactRows,onChange:S=>n({compactRows:S})}),(0,h.jsx)(io,{label:"Show host in path column",desc:"Display request host below endpoint paths.",checked:a.showHostInPath,onChange:S=>n({showHostInPath:S})})]}),g==="console"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Console"}),(0,h.jsx)(fm,{label:"Slow threshold",desc:"Highlight requests above this in yellow.",value:a.slowThresholdMs,min:100,max:5e3,step:50,suffix:"ms",onChange:S=>n({slowThresholdMs:S})}),(0,h.jsx)(fm,{label:"Very slow threshold",desc:"Reserved red threshold for heavier timing views.",value:a.verySlowThresholdMs,min:200,max:1e4,step:100,suffix:"ms",onChange:S=>n({verySlowThresholdMs:S})})]}),g==="decrypt"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Decrypt"}),(0,h.jsx)(Or,{label:"Runtime boundary",desc:"Decrypt bridge stays in the vanilla runtime. React only displays decrypted fields when the runtime provides them."}),(0,h.jsx)(Or,{label:"Network access",desc:"No AI provider or remote analysis is used by this settings surface."})]}),g==="shortcuts"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"Shortcuts"}),(0,h.jsx)(Yf,{keys:"Ctrl/\u2318 + Shift + X",label:"Toggle XRAY"}),(0,h.jsx)(Yf,{keys:"Ctrl/\u2318 + K",label:"Open command palette"}),(0,h.jsx)(Yf,{keys:"Ctrl/\u2318 + Shift + F",label:"Find in traffic (search bodies)"}),(0,h.jsx)(Yf,{keys:"Esc",label:"Close modal or panel surface"})]}),g==="about"&&(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(so,{label:"About"}),(0,h.jsx)(Or,{label:"Version",desc:`XRAY ${ws} \xB7 built ${jf}`}),(0,h.jsx)(Or,{label:"UI stack",desc:"React, TypeScript, Zustand, TanStack Virtual, and Tabler icons."}),(0,h.jsx)(Or,{label:"Theme",desc:"Fully token-driven themes (5 presets + a custom Theme Studio) scoped to the panel via inline CSS variables."})]}),(0,h.jsxs)("div",{className:"xray-settings-danger",children:[(0,h.jsx)("div",{className:"xray-danger-title",children:"Danger zone"}),(0,h.jsxs)("button",{className:"xray-danger-row",onClick:N,children:[(0,h.jsx)("span",{children:"Clear all captured sessions"}),(0,h.jsx)(Vo,{...Me})]}),(0,h.jsxs)("button",{className:"xray-danger-row",onClick:b,children:[(0,h.jsx)("span",{children:"Reset all settings to defaults"}),(0,h.jsx)(Un,{...Me})]})]})]})]})})}function KR(){let e=I(m=>m.settings.customTheme),t=I(m=>m.settings.font),a=I(m=>m.settings.radius),o=I(m=>m.settings.hacker),r=I(m=>m.updateSettings),n=I(m=>m.showToast),[l,s]=(0,ba.useState)(""),[i,f]=(0,ba.useState)(!1),u=df(e),x=ts.filter(m=>Zd(e,m)).length;function d(m){r({theme:"custom",customTheme:m})}function p(m,g){d({...e,[m]:g})}function v(m){let g={...e};delete g[m],d(g)}function k(){let m={bg:e.bg,surface:e.surface,text:e.text,accent:e.accent};d(m),n("Reverted every token to auto.")}function D(){dt(NI(e)),n("Theme CSS copied to clipboard.")}function y(){dt(LI({colors:e,font:t,radius:a,hacker:o})),n("Share code copied - colors, font, radius & effects included.")}function c(){let m=zI(l);if(m){r(OI(m)),s(""),f(!1),n("Theme imported.");return}let g=HI(l);if(!g){n("Could not read a theme from that text.");return}d(g),s(""),f(!1),n("Theme imported.")}return(0,h.jsxs)("div",{className:"xray-custom-theme",children:[(0,h.jsx)(ZR,{theme:e}),(0,h.jsxs)("div",{className:"xray-custom-toolbar",children:[(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>d(br(e.accent,"dark")),title:"Build a dark theme around the current accent",children:[(0,h.jsx)(Nr,{...Me}),"Dark from accent"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>d(br(e.accent,"light")),title:"Build a light theme around the current accent",children:[(0,h.jsx)(Nr,{...Me}),"Light from accent"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>d(uf(Math.random())),title:"Roll a coherent random theme",children:[(0,h.jsx)(cs,{...Me}),"Surprise me"]}),(0,h.jsx)("span",{className:"xray-spacer"}),(0,h.jsxs)("button",{className:"xray-chip",onClick:y,title:"Copy a portable share code (colors + font + radius + effects)",children:[(0,h.jsx)(qp,{...Me}),"Share"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:D,title:"Copy this theme as CSS variables",children:[(0,h.jsx)(pt,{...Me}),"CSS"]}),(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>f(m=>!m),title:"Paste a theme to load",children:[(0,h.jsx)(ss,{...Me}),"Import"]})]}),i&&(0,h.jsxs)("div",{className:"xray-custom-import",children:[(0,h.jsx)("textarea",{className:"xray-input xray-custom-import-field",placeholder:'Paste a share code (xray1:\u2026), JSON { "bg": "#\u2026" }, or an exported --xray-* CSS block',value:l,spellCheck:!1,onChange:m=>s(m.currentTarget.value)}),(0,h.jsx)("button",{className:"xray-btn primary",onClick:c,children:"Load theme"})]}),(0,h.jsx)(WR,{theme:e}),(0,h.jsxs)("div",{className:"xray-custom-presets",children:[(0,h.jsx)("span",{className:"xray-custom-presets-label",children:"Start from"}),jR.map(m=>(0,h.jsxs)("button",{className:"xray-chip",onClick:()=>d(m.theme),children:[(0,h.jsx)("span",{className:"xray-custom-preset-dot",style:{background:m.theme.accent}}),m.label]},m.label))]}),GR.map(m=>(0,h.jsxs)("div",{className:"xray-custom-group",children:[(0,h.jsxs)("div",{className:"xray-custom-group-head",children:[(0,h.jsx)("span",{className:"xray-custom-group-title",children:m.title}),(0,h.jsx)("span",{className:"xray-custom-group-hint",children:m.hint})]}),(0,h.jsx)("div",{className:"xray-custom-grid",children:m.fields.map(g=>(0,h.jsx)(JR,{label:g.label,value:u[g.key],overridden:Zd(e,g.key),onChange:A=>p(g.key,A),onReset:()=>v(g.key),onCopy:()=>{dt(u[g.key]),n(`Copied ${u[g.key]}`)}},g.key))})]},m.title)),(0,h.jsxs)("div",{className:"xray-custom-footnote",children:[(0,h.jsx)("span",{children:x>0?`${x} token${x===1?"":"s"} pinned \xB7 the rest auto-derive from your base colors.`:"Every token auto-derives from your four base colors - pin any swatch for full control."}),x>0&&(0,h.jsxs)("button",{className:"xray-chip",onClick:k,title:"Revert every token to auto-derived",children:[(0,h.jsx)(Nf,{...Me}),"Reset all to auto"]})]}),(0,h.jsx)("p",{className:"xray-custom-note",children:"Themes are applied as inline CSS variables on this panel only - they never touch the page or the extension's capture runtime."})]})}function ZR({theme:e}){let t=Sr(e);return(0,h.jsxs)("div",{className:"xray-theme-preview",style:t,"aria-label":"Live theme preview",children:[(0,h.jsxs)("div",{className:"xray-tp-bar",children:[(0,h.jsx)("span",{className:"xray-tp-dot"}),(0,h.jsx)("span",{className:"xray-tp-brand",children:"CONSOLE"}),(0,h.jsx)("span",{className:"xray-tp-tab active",children:"Network"}),(0,h.jsx)("span",{className:"xray-tp-tab",children:"Console"}),(0,h.jsx)("span",{className:"xray-tp-grow"}),(0,h.jsx)("span",{className:"xray-tp-btn",children:"Explain"})]}),(0,h.jsxs)("div",{className:"xray-tp-rows",children:[(0,h.jsxs)("div",{className:"xray-tp-row",children:[(0,h.jsx)("span",{className:"xray-tp-method get",children:"GET"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/users"}),(0,h.jsx)("span",{className:"xray-tp-code ok",children:"200"})]}),(0,h.jsxs)("div",{className:"xray-tp-row selected",children:[(0,h.jsx)("span",{className:"xray-tp-method post",children:"POST"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/session/login"}),(0,h.jsx)("span",{className:"xray-tp-code warn",children:"302"})]}),(0,h.jsxs)("div",{className:"xray-tp-row",children:[(0,h.jsx)("span",{className:"xray-tp-method delete",children:"DELETE"}),(0,h.jsx)("span",{className:"xray-tp-path",children:"/api/cart/item"}),(0,h.jsx)("span",{className:"xray-tp-code err",children:"500"})]})]}),(0,h.jsxs)("div",{className:"xray-tp-badges",children:[(0,h.jsx)("span",{className:"xray-tp-badge green",children:"success"}),(0,h.jsx)("span",{className:"xray-tp-badge yellow",children:"slow"}),(0,h.jsx)("span",{className:"xray-tp-badge red",children:"error"}),(0,h.jsx)("span",{className:"xray-tp-badge blue",children:"info"}),(0,h.jsx)("span",{className:"xray-tp-badge mauve",children:"graphql"})]})]})}function WR({theme:e}){let t=df(e),a=[{label:"Text on background",ratio:vr(t.text,t.bg)},{label:"Muted on background",ratio:vr(t.subtext,t.bg)},{label:"Text on surface",ratio:vr(t.text,t.surface)},{label:"Text on elevated",ratio:vr(t.text,t.surface2)},{label:"Accent on background",ratio:vr(t.accent,t.bg)},{label:"Text on accent",ratio:vr(t.text,t.accent)}];return(0,h.jsxs)("div",{className:"xray-contrast","aria-label":"WCAG contrast","aria-live":"polite",children:[(0,h.jsx)("span",{className:"xray-contrast-title",children:"Contrast"}),a.map(o=>{let r=BI(o.ratio),n=r==="Fail"?"fail":r==="AA Large"?"warn":"ok";return(0,h.jsxs)("div",{className:"xray-contrast-row",children:[(0,h.jsx)("span",{className:"xray-contrast-label",children:o.label}),(0,h.jsxs)("strong",{children:[o.ratio.toFixed(2),":1"]}),(0,h.jsx)("span",{className:`xray-contrast-grade ${n}`,children:r})]},o.label)})]})}function $R({label:e,desc:t,value:a,min:o,max:r,step:n,suffix:l,onChange:s}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsxs)("span",{className:"xray-range-control",children:[(0,h.jsx)("input",{type:"range",className:"xray-range",value:a,min:o,max:r,step:n,onChange:i=>s(Number(i.currentTarget.value))}),(0,h.jsxs)("small",{className:"xray-range-value",children:[a,l]})]})]})}function JR({label:e,value:t,overridden:a,onChange:o,onReset:r,onCopy:n}){let[l,s]=(0,ba.useState)(t);ba.default.useEffect(()=>{s(t)},[t]);function i(u){s(u);let x=Ze(u,"");x&&o(x)}async function f(){let u=window.EyeDropper;if(u)try{let x=await new u().open();x?.sRGBHex&&o(x.sRGBHex)}catch{}}return(0,h.jsxs)("div",{className:`xray-token-field ${a?"pinned":"auto"}`,children:[(0,h.jsx)("input",{type:"color",className:"xray-color-input",value:Ze(t,"#000000"),onChange:u=>{s(u.currentTarget.value),o(u.currentTarget.value)},"aria-label":`${e} color`}),(0,h.jsxs)("span",{className:"xray-token-meta",children:[(0,h.jsxs)("span",{className:"xray-token-label",children:[e,(0,h.jsx)("span",{className:"xray-token-state",children:a?"pinned":"auto"})]}),(0,h.jsx)("input",{className:`xray-input xray-custom-hex ${Fn(l)?"":"invalid"}`,value:l,spellCheck:!1,maxLength:7,onChange:u=>i(u.currentTarget.value),onBlur:()=>s(t),"aria-label":`${e} hex`})]}),(0,h.jsxs)("span",{className:"xray-token-actions",children:[qR&&(0,h.jsx)("button",{type:"button",className:"xray-token-btn",onClick:f,title:`Pick ${e} from screen`,"aria-label":`Pick ${e} color from screen`,children:(0,h.jsx)(hp,{size:14,stroke:1.8})}),(0,h.jsx)("button",{type:"button",className:"xray-token-btn",onClick:n,title:`Copy ${e} hex`,"aria-label":`Copy ${e} hex`,children:(0,h.jsx)(pt,{size:14,stroke:1.8})}),(0,h.jsx)("button",{type:"button",className:"xray-token-reset",onClick:r,disabled:!a,title:a?`Revert ${e} to auto`:`${e} is auto-derived`,"aria-label":`Revert ${e} to auto`,children:(0,h.jsx)(Nf,{size:14,stroke:1.8})})]})]})}function so({label:e}){return(0,h.jsx)("div",{className:"xray-settings-section-title",children:e})}function io({label:e,desc:t,checked:a,onChange:o}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("button",{className:`xray-toggle ${a?"on":""}`,"aria-label":e,"aria-pressed":a,onClick:()=>o(!a)})]})}function fm({label:e,desc:t,value:a,min:o,max:r,step:n,suffix:l,onChange:s}){let[i,f]=ba.default.useState(String(a)),[u,x]=ba.default.useState(!1);ba.default.useEffect(()=>{u||f(String(a))},[a,u]);function d(){x(!1);let p=Number(i);if(i.trim()===""||!Number.isFinite(p)){f(String(a));return}let v=Math.min(r,Math.max(o,Math.round(p)));f(String(v)),v!==a&&s(v)}return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsxs)("span",{className:"xray-number-input",children:[(0,h.jsx)("input",{type:"number",value:i,min:o,max:r,step:n,onFocus:()=>x(!0),onChange:p=>f(p.currentTarget.value),onBlur:d,onKeyDown:p=>{p.key==="Enter"&&(p.preventDefault(),p.currentTarget.blur()),p.key==="Escape"&&(f(String(a)),x(!1),p.currentTarget.blur())}}),(0,h.jsx)("small",{children:l})]})]})}function Cs({label:e,desc:t,value:a,options:o,onChange:r}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("select",{className:"xray-select",value:a,onChange:n=>r(n.currentTarget.value),children:o.map(n=>(0,h.jsx)("option",{value:n,children:n},n))})]})}function Vf({label:e,desc:t,value:a,placeholder:o,onChange:r}){return(0,h.jsxs)("label",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]}),(0,h.jsx)("input",{className:"xray-input",type:"text",value:a,placeholder:o,spellCheck:!1,autoComplete:"off",autoCapitalize:"off",onChange:n=>r(n.currentTarget.value)})]})}function eM({settings:e,onChange:t}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:"Accent color"}),(0,h.jsx)("small",{children:"Selections, active states, and primary actions."})]}),(0,h.jsx)("div",{className:"xray-color-row",children:Object.keys(Wd).map(a=>(0,h.jsx)("button",{className:`xray-color-swatch ${e.accent===a?"active":""}`,"aria-label":`Use ${a} accent`,"aria-pressed":e.accent===a,style:{background:Bn({...e,accent:a})},onClick:()=>t(a)},a))})]})}function Or({label:e,desc:t}){return(0,h.jsx)("div",{className:"xray-settings-row read-only",children:(0,h.jsxs)("span",{children:[(0,h.jsx)("strong",{children:e}),(0,h.jsx)("small",{children:t})]})})}function Yf({keys:e,label:t}){return(0,h.jsxs)("div",{className:"xray-settings-row",children:[(0,h.jsx)("span",{children:(0,h.jsx)("strong",{children:t})}),(0,h.jsx)("kbd",{children:e})]})}var ba,h,Me,qR,UR,Z0,XR,GR,jR,VR,YR,QR,$0=E(()=>{"use strict";ba=H(ze());Be();$e();On();Nn();ke();im();Zo();h=H(X()),Me={size:16,stroke:1.8},qR=typeof window<"u"&&"EyeDropper"in window,UR=[{id:"general",label:"General",icon:(0,h.jsx)(fp,{...Me})},{id:"capture",label:"Capture",icon:(0,h.jsx)(Rr,{...Me})},{id:"session",label:"Session",icon:(0,h.jsx)(jo,{...Me})},{id:"appearance",label:"Appearance",icon:(0,h.jsx)(Mr,{...Me})},{id:"console",label:"Console",icon:(0,h.jsx)(rt,{...Me})},{id:"ai",label:"AI",icon:(0,h.jsx)(no,{...Me})},{id:"decrypt",label:"Decrypt",icon:(0,h.jsx)(Bp,{...Me})},{id:"shortcuts",label:"Shortcuts",icon:(0,h.jsx)(Mp,{...Me})},{id:"about",label:"About",icon:(0,h.jsx)(Ap,{...Me})}],Z0={anthropic:["claude-opus-5","claude-sonnet-5","claude-fable-5","claude-haiku-4-5-20251001"],openai:["gpt-4o","gpt-4o-mini","gpt-4.1"],custom:[]},XR=[{id:"operator",label:"Operator",bg:"#0b0f14",accent:"#37d5ff",text:"#d8e2ef"},{id:"dev-edition",label:"Dev",bg:"#11131f",accent:"#b18cff",text:"#e1e7ff"},{id:"midnight",label:"Midnight",bg:"#05070a",accent:"#00e5ff",text:"#d7f7ff"},{id:"light-lab",label:"Light",bg:"#edf3fb",accent:"#006adc",text:"#172033"},{id:"claude",label:"Claude",bg:"#f0eee6",accent:"#d97757",text:"#23221f",accentPref:"coral"}],GR=[{title:"Base",hint:"Canvas and stacked surfaces",fields:[{key:"bg",label:"Background"},{key:"surface",label:"Surface"},{key:"surface2",label:"Elevated"},{key:"surface3",label:"Overlay"}]},{title:"Foreground",hint:"Text ramp and separators",fields:[{key:"text",label:"Text"},{key:"subtext",label:"Muted"},{key:"hint",label:"Faint"},{key:"border",label:"Border"}]},{title:"Accent",hint:"Selections and primary actions",fields:[{key:"accent",label:"Accent"}]},{title:"Status",hint:"Method, status, and severity colors",fields:[{key:"green",label:"Success"},{key:"red",label:"Error"},{key:"yellow",label:"Warning"},{key:"blue",label:"Info"},{key:"mauve",label:"Accent 2"},{key:"teal",label:"Teal"},{key:"peach",label:"Peach"}]}],jR=[{label:"Slate",theme:{bg:"#0f1117",surface:"#171a23",text:"#e7e9f0",accent:"#7c5cff"}},{label:"Graphite",theme:{bg:"#0e0e10",surface:"#19191c",text:"#ededed",accent:"#22d3ee"}},{label:"Ros\xE9",theme:{bg:"#1a1114",surface:"#241519",text:"#f4e9ec",accent:"#fb7185"}},{label:"Emerald",theme:{bg:"#0b1210",surface:"#131c19",text:"#e6f0ec",accent:"#34d399"}},{label:"Nord",theme:{bg:"#2e3440",surface:"#3b4252",text:"#eceff4",accent:"#88c0d0"}},{label:"Solarized",theme:{bg:"#002b36",surface:"#073642",text:"#eee8d5",accent:"#268bd2"}},{label:"Amber",theme:{bg:"#161207",surface:"#211a0c",text:"#f6ecd6",accent:"#f5a623"}},{label:"Sakura",theme:{bg:"#1c141a",surface:"#281b26",text:"#f6e9f1",accent:"#ec4899"}},{label:"Paper",theme:{bg:"#faf9f6",surface:"#ffffff",text:"#1c1b19",accent:"#2563eb"}},{label:"Sky",theme:{bg:"#eef4fb",surface:"#ffffff",text:"#16273b",accent:"#0284c7"}},{label:"Sage",theme:{bg:"#eef2ec",surface:"#fbfdfa",text:"#1e2a20",accent:"#3f8a4f"}}],VR=["tree","raw","grid","schema","diff","waterfall","viz","headers"],YR=["jetbrains","cascadia","iosevka","system"],QR=["compact","comfortable","spacious"]});function aM(e){return!e||typeof e!="object"?"":Object.entries(e).filter(([,t])=>String(t)!=="[redacted]").map(([t,a])=>`${t}: ${a}`).join(`
`)}function oM(e){let t={};return e.split(`
`).forEach(a=>{let o=a.indexOf(":");if(o<=0)return;let r=a.slice(0,o).trim(),n=a.slice(o+1).trim();r&&(t[r]=n)}),t}function rM(e){return e.requestBody==null?"":typeof e.requestBody=="string"?e.requestBody:W(e.requestBody,2,1e5)}function e1(){let e=I(p=>p.replayEditorEntry),t=I(p=>p.closeReplayEditor),a=I(p=>p.replayEntry),o=(0,fo.useMemo)(()=>e?{method:String(e.method||"GET").toUpperCase(),url:String(e.url||e.urlPath||""),headers:aM(e.requestHeaders),body:rM(e)}:null,[e]),[r,n]=(0,fo.useState)("GET"),[l,s]=(0,fo.useState)(""),[i,f]=(0,fo.useState)(""),[u,x]=(0,fo.useState)("");if(fo.default.useEffect(()=>{o&&(n(o.method),s(o.url),f(o.headers),x(o.body))},[o]),!e||!o)return null;function d(){if(!e)return;let p=Tn(u);a(e,{method:r,url:l,requestHeaders:oM(i),requestBody:p}),t()}return(0,De.jsx)(Nt,{title:"Edit & Replay",subtitle:`${e.method||"GET"} ${re(e)}`,icon:(0,De.jsx)(ro,{...J0}),className:"xray-replay-modal",onClose:t,footer:(0,De.jsxs)(De.Fragment,{children:[(0,De.jsx)("span",{className:"xray-muted",children:"Replays run from the inspected page and are recaptured as new entries."}),(0,De.jsx)("span",{className:"xray-spacer"}),(0,De.jsx)("button",{className:"xray-btn",onClick:t,children:"Cancel"}),(0,De.jsxs)("button",{className:"xray-btn primary",onClick:d,children:[(0,De.jsx)(Dr,{...J0}),"Send replay"]})]}),children:(0,De.jsxs)("div",{className:"xray-replay-body",children:[(0,De.jsxs)("div",{className:"xray-replay-line",children:[(0,De.jsx)("select",{className:"xray-select",value:r,onChange:p=>n(p.currentTarget.value),children:tM.map(p=>(0,De.jsx)("option",{value:p,children:p},p))}),(0,De.jsx)("input",{className:"xray-input",value:l,onChange:p=>s(p.currentTarget.value),placeholder:"https://api.example.com/endpoint"})]}),(0,De.jsxs)("label",{className:"xray-field",children:[(0,De.jsx)("span",{children:"Headers (one per line)"}),(0,De.jsx)("textarea",{className:"xray-input xray-replay-headers",spellCheck:!1,value:i,onChange:p=>f(p.currentTarget.value),placeholder:"content-type: application/json"})]}),(0,De.jsxs)("label",{className:"xray-field",children:[(0,De.jsx)("span",{children:"Body"}),(0,De.jsx)("textarea",{className:"xray-input xray-replay-bodyfield",spellCheck:!1,value:u,onChange:p=>x(p.currentTarget.value),placeholder:'{ "key": "value" }'})]})]})})}var fo,De,J0,tM,t1=E(()=>{"use strict";fo=H(ze());Be();$e();Zo();Dt();ke();De=H(X()),J0={size:16,stroke:1.8},tM=["GET","POST","PUT","PATCH","DELETE","HEAD"]});function a1(e,t){let a={method:e.method,url:e.url||e.urlPath,status:e.status,durationMs:Math.round(Number(e.duration)||0),graphql:e.graphql||void 0,requestHeaders:e.requestHeaders,requestBody:ia(e),response:pe(e),recentSameEndpoint:t.slice(0,4).map(o=>({status:o.status,durationMs:Math.round(Number(o.duration)||0),timestamp:o.timestamp}))};return["You are an API debugging assistant embedded in a browser devtools extension.","Analyze this captured HTTP request and its response. Be concise and specific.","Explain: (1) what this call does, (2) whether it succeeded or failed and why,","(3) anything notable in the payload or timing, and (4) one concrete next step for the developer.","","Captured request:",W(a,2,4e4)].join(`
`)}async function o1(e,t){if(!e.apiKey)return{ok:!1,error:"Add an API key in Settings \u2192 AI to enable explanations."};if(typeof chrome>"u"||!chrome?.runtime?.sendMessage)return{ok:!1,error:"AI explanations require the extension runtime (open XRAY on an inspected page)."};let a=chrome?.runtime,o=a?.sendMessage;return!a||!o?{ok:!1,error:"AI explanations require the extension runtime (open XRAY on an inspected page)."}:new Promise(r=>{try{o({type:"xray:ai-explain",prompt:t},n=>{let l=a.lastError;if(l){r({ok:!1,error:l.message||"AI request failed"});return}r(n||{ok:!1,error:"No response from AI provider."})})}catch(n){r({ok:!1,error:n instanceof Error?n.message:String(n)})}})}function r1(e,t){let a=re(e);return t.filter(o=>o.id!==e.id&&o.type==="api"&&re(o)===a)}var n1=E(()=>{"use strict";Dt();ke()});function l1(){let e=I(d=>d.explainEntry),t=I(d=>d.closeExplain),a=I(d=>d.entries),o=I(d=>d.aiSettings),r=I(d=>d.setSettingsOpen),[n,l]=(0,Yn.useState)(!1),[s,i]=(0,Yn.useState)(null),[f,u]=(0,Yn.useState)(null);if(Yn.default.useEffect(()=>{if(!e)return;let d=!1;if(i(null),u(null),!o.apiKey){u("Add an API key in Settings \u2192 AI to enable explanations.");return}l(!0);let p=a1(e,r1(e,a));return o1(o,p).then(v=>{d||(l(!1),v.ok&&v.text?i(v.text):u(v.error||"AI request failed."))}),()=>{d=!0}},[e?.id]),!e)return null;function x(){t(),r(!0)}return(0,Ue.jsx)(Nt,{title:"Explain with AI",subtitle:`${e.method||"GET"} ${re(e)}`,icon:(0,Ue.jsx)(no,{...cm}),className:"xray-explain-modal",onClose:t,footer:(0,Ue.jsxs)(Ue.Fragment,{children:[(0,Ue.jsxs)("span",{className:"xray-muted",children:[o.provider," \xB7 ",o.model]}),(0,Ue.jsx)("span",{className:"xray-spacer"}),s&&(0,Ue.jsxs)("button",{className:"xray-btn",onClick:()=>{dt(s)},children:[(0,Ue.jsx)(pt,{...cm}),"Copy"]}),(0,Ue.jsx)("button",{className:"xray-btn",onClick:t,children:"Close"})]}),children:(0,Ue.jsxs)("div",{className:"xray-explain-body",children:[n&&(0,Ue.jsxs)("div",{className:"xray-explain-loading",children:[(0,Ue.jsx)("span",{className:"xray-spinner"}),"Analyzing request\u2026"]}),f&&(0,Ue.jsxs)("div",{className:"xray-explain-error",children:[(0,Ue.jsx)(ao,{...cm}),(0,Ue.jsxs)("div",{children:[(0,Ue.jsx)("p",{children:f}),(0,Ue.jsx)("button",{className:"xray-btn",onClick:x,children:"Open AI settings"})]})]}),s&&(0,Ue.jsx)("div",{className:"xray-explain-result",children:s})]})})}var Yn,Ue,cm,s1=E(()=>{"use strict";Yn=H(ze());Be();$e();Zo();Dt();n1();ke();Ue=H(X()),cm={size:16,stroke:1.8}});function i1(e,t,a){if(typeof chrome<"u"&&chrome?.runtime?.sendMessage)try{chrome.runtime.sendMessage(e,()=>{});return}catch{}a.showToast(t)}function Qf(e){if(window.XRAY_HUD?.isVisible?.()){window.XRAY_HUD.collapse();return}i1({type:"XRAY_HUD_TOGGLE_ACTIVE"},"Open a normal page tab, then use XRAY from the extension icon.",e)}function Kf(e){i1({type:"XRAY_OPEN_WINDOW"},"Pop-out window is available when the extension runtime is loaded.",e)}function Zf(e){e.showToast("Press F12, then open the XRAY tab.")}var um=E(()=>{"use strict"});function dm(e,t){let a=e.trim().toLowerCase();if(!a)return{score:1,ranges:[]};let o=t.toLowerCase();if(o.includes(a)){let i=o.indexOf(a);return{score:120+(i===0||f1.test(o[i-1])?40:0)-i-Math.max(0,o.length-a.length)*.2,ranges:[[i,i+a.length]]}}let r=0,n=0,l=-2,s=[];for(let i=0;i<o.length&&r<a.length;i+=1){if(o[i]!==a[r])continue;n+=l===i-1?6:1,(i===0||f1.test(o[i-1]))&&(n+=10);let f=s[s.length-1];f&&f[1]===i?f[1]=i+1:s.push([i,i+1]),l=i,r+=1}return r<a.length?null:(n+=Math.max(0,18-o.length/4),{score:n,ranges:s})}function c1(e,t){if(!t.length)return[{text:e,match:!1}];let a=[],o=0;for(let[r,n]of t)r>o&&a.push({text:e.slice(o,r),match:!1}),a.push({text:e.slice(r,n),match:!0}),o=n;return o<e.length&&a.push({text:e.slice(o),match:!1}),a}var f1,u1=E(()=>{"use strict";f1=/[\s\-_/.:]/});function p1(){let e=I(O=>O.commandOpen),t=I(O=>O.setCommandOpen),a=I(O=>O.setActiveTab),o=I(O=>O.setExportOpen),r=I(O=>O.setGlobalSearchOpen),n=I(O=>O.openSettings),l=I(O=>O.clearConsole),s=I(O=>O.clearApiFilters),i=I(O=>O.clearEntries),f=I(O=>O.insertConsoleCommand),u=I(O=>O.requestConfirmation),x=I(O=>O.entries),d=I(O=>O.selectedId),p=I(O=>O.selectEntry),v=I(O=>O.replayEntry),k=I(O=>O.openReplayEditor),D=I(O=>O.openExplain),y=I(O=>O.updateSettings),c=I(O=>O.settings.customTheme),m=I(O=>O.settings.hacker),g=I(O=>O.showToast),[A,B]=(0,Qt.useState)(""),[b,N]=(0,Qt.useState)(0),S=(0,Qt.useRef)(null),_=d&&x.find(O=>O.id===d)||null,ne=(0,Qt.useMemo)(()=>{let O=[];if(_){let G=`${_.method||"GET"} ${re(_)}`;O.push({id:"sel-replay",label:`Replay ${G}`,group:"Selection",icon:(0,U.jsx)(ro,{...K}),run:()=>v(_)},{id:"sel-edit",label:`Edit & replay ${G}`,group:"Selection",icon:(0,U.jsx)(ro,{...K}),run:()=>k(_)},{id:"sel-explain",label:`Explain ${G}`,group:"Selection",icon:(0,U.jsx)(no,{...K}),run:()=>D(_)})}return Br.map(G=>O.push({id:`tab-${G.id}`,label:`Go to ${G.label}`,group:"Go to",icon:G.icon,run:()=>a(G.id)})),O.push({id:"export",label:"Export session",group:"Actions",icon:(0,U.jsx)(Ft,{...K}),run:()=>o(!0)},{id:"find",label:"Find in traffic (bodies, headers, URLs)",group:"Actions",icon:(0,U.jsx)(ot,{...K}),keywords:"search grep regex response body header ctrl shift f",run:()=>r(!0)},{id:"appearance",label:"Open Theme Studio",group:"Appearance",icon:(0,U.jsx)(Mr,{...K}),keywords:"theme color radius",run:()=>n("appearance")},{id:"settings",label:"Open Settings",group:"Actions",icon:(0,U.jsx)(Fr,{...K}),run:()=>n("general")},{id:"insights",label:"Open Insights",group:"Actions",icon:(0,U.jsx)(kr,{...K}),run:()=>a("insights")},{id:"surface-window",label:"Open in separate window",group:"Actions",icon:(0,U.jsx)(ns,{...K}),keywords:"popout pop-out detach surface",run:()=>Kf({showToast:g})},{id:"surface-hud",label:"Float over page (HUD)",group:"Actions",icon:(0,U.jsx)(ds,{...K}),keywords:"hud overlay float surface",run:()=>Qf({showToast:g})},{id:"surface-devtools",label:"Open in DevTools",group:"Actions",icon:(0,U.jsx)(fs,{...K}),keywords:"devtools f12 surface",run:()=>Zf({showToast:g})},{id:"clear-filters",label:"Reset API filters",group:"Actions",icon:(0,U.jsx)(Ar,{...K}),run:s},{id:"clear-console",label:"Clear console stream",group:"Actions",icon:(0,U.jsx)(Lf,{...K}),run:()=>u({title:"Clear console stream?",message:"This clears console UI events but keeps captured API requests.",confirmLabel:"Clear console",tone:"danger",onConfirm:l})},{id:"clear-all",label:"Clear all captured entries",group:"Actions",icon:(0,U.jsx)(Lf,{...K}),run:()=>u({title:"Clear all captured entries?",message:"This removes requests, logs, console events, and pins.",confirmLabel:"Clear all",tone:"danger",onConfirm:i})},{id:"theme-random",label:"Randomize theme",group:"Appearance",icon:(0,U.jsx)(cs,{...K}),keywords:"surprise color",run:()=>{y({theme:"custom",customTheme:uf(Math.random())}),g("Rolled a fresh theme.")}},{id:"theme-dark",label:"Custom theme: dark from accent",group:"Appearance",icon:(0,U.jsx)(Nr,{...K}),run:()=>y({theme:"custom",customTheme:br(c.accent,"dark")})},{id:"theme-light",label:"Custom theme: light from accent",group:"Appearance",icon:(0,U.jsx)(Nr,{...K}),run:()=>y({theme:"custom",customTheme:br(c.accent,"light")})},{id:"hacker",label:m?"Turn off hacker mode":"Turn on hacker mode",group:"Appearance",icon:(0,U.jsx)(Pn,{...K}),keywords:"crt scanline",run:()=>{y({hacker:!m}),g(m?"Hacker mode off.":"Hacker mode on - close this to see it.")}},{id:"cmd-errors",label:"Prepare $errors()",group:"Console",icon:(0,U.jsx)(rt,{...K}),run:()=>f("$errors()")},{id:"cmd-slow",label:"Prepare $slow(500)",group:"Console",icon:(0,U.jsx)(rt,{...K}),run:()=>f("$slow(500)")},{id:"cmd-schema",label:"Prepare schema(res)",group:"Console",icon:(0,U.jsx)(rt,{...K}),run:()=>f("schema(res)")},{id:"cmd-diff",label:"Prepare diff(prev, res)",group:"Console",icon:(0,U.jsx)(rt,{...K}),run:()=>f("diff(prev, res)")}),O},[s,l,i,c,m,f,D,k,n,v,u,_,a,o,r,g,y]),nt=(0,Qt.useMemo)(()=>x.slice(-300).reverse().map(O=>{let G=re(O),Te=String(O.method||O.logLevel||"GET").toUpperCase();return{id:`req-${O.id}`,label:`${Te} ${G}`,group:"Requests",icon:(0,U.jsx)("span",{className:`xray-cmd-method ${ca(O.method)}`,children:Te.slice(0,4)}),hint:O.status?String(O.status):void 0,keywords:`${O.url||""} ${O.status||""}`,run:()=>{p(O.id),a(O.type==="api"?"api":"logs")}}}),[x,p,a]),mt=(0,Qt.useMemo)(()=>{let O=A.trim(),G=(w,le)=>{let lt=d1.indexOf(w.command.group),Na=d1.indexOf(le.command.group),uo=lt<0?99:lt,L=Na<0?99:Na;return uo!==L?uo-L:le.score-w.score};if(!O){let w=ne.filter(lt=>lt.group!=="Requests"),le=nt.slice(0,5);return[...w,...le].map(lt=>({command:lt,ranges:[],score:0})).sort(G)}let Te=[...ne,...nt],Bt=[];for(let w of Te){let le=dm(O,w.label);if(le){Bt.push({command:w,ranges:le.ranges,score:le.score+25});continue}let lt=dm(O,`${w.group} ${w.keywords||""}`);lt&&Bt.push({command:w,ranges:[],score:lt.score})}return Bt.sort(G).slice(0,60)},[ne,A,nt]);Qt.default.useEffect(()=>{N(0)},[A,e]),Qt.default.useEffect(()=>{if(!e){B("");return}},[e]),Qt.default.useEffect(()=>{S.current?.querySelector(`[data-cmd-index="${b}"]`)?.scrollIntoView({block:"nearest"})},[b]);function co(O){let G=mt[O];G&&(G.command.run(),t(!1))}function Wo(O){O.key==="ArrowDown"?(O.preventDefault(),N(G=>(G+1)%Math.max(1,mt.length))):O.key==="ArrowUp"?(O.preventDefault(),N(G=>(G-1+mt.length)%Math.max(1,mt.length))):O.key==="Enter"?(O.preventDefault(),co(b)):O.key==="Home"?(O.preventDefault(),N(0)):O.key==="End"&&(O.preventDefault(),N(mt.length-1))}if(!e)return null;let va=[];return mt.forEach((O,G)=>{let Te=va[va.length-1];Te&&Te.group===O.command.group?Te.items.push({scored:O,index:G}):va.push({group:O.command.group,items:[{scored:O,index:G}]})}),(0,U.jsxs)(Nt,{title:"Command center",subtitle:"Jump anywhere \xB7 run actions \xB7 find requests",icon:(0,U.jsx)(Pn,{...K}),className:"xray-command-modal",onClose:()=>t(!1),children:[(0,U.jsxs)("label",{className:"xray-search xray-command-search",children:[(0,U.jsx)(ot,{...K}),(0,U.jsx)("input",{className:"xray-input",autoFocus:!0,value:A,onChange:O=>B(O.currentTarget.value),onKeyDown:Wo,placeholder:"Type a command, tab, or search captured requests\u2026"})]}),(0,U.jsxs)("div",{className:"xray-modal-body xray-command-list",ref:S,children:[mt.length===0&&(0,U.jsxs)("div",{className:"xray-command-empty",children:[(0,U.jsx)(ot,{size:20,stroke:1.6}),(0,U.jsxs)("span",{children:["No matches for \u201C",A,"\u201D"]}),(0,U.jsx)("small",{children:"Try a tab name, an action, or part of a request path."})]}),va.map(O=>(0,U.jsxs)("div",{className:"xray-command-group",children:[(0,U.jsx)("div",{className:"xray-command-group-label",children:O.group}),O.items.map(({scored:G,index:Te})=>(0,U.jsxs)("button",{"data-cmd-index":Te,className:`xray-command-row ${Te===b?"active":""}`,onMouseMove:()=>N(Te),onClick:()=>co(Te),children:[(0,U.jsx)("span",{className:"xray-command-icon",children:G.command.icon}),(0,U.jsx)("span",{className:"xray-command-label",children:c1(G.command.label,G.ranges).map((Bt,w)=>Bt.match?(0,U.jsx)("mark",{children:Bt.text},w):(0,U.jsx)("span",{children:Bt.text},w))}),G.command.hint&&(0,U.jsx)("span",{className:`xray-command-hint ${jt(Number(G.command.hint))}`,children:G.command.hint}),Te===b&&(0,U.jsx)(rs,{size:14,stroke:2,className:"xray-command-enter"})]},G.command.id))]},O.group))]}),(0,U.jsxs)("div",{className:"xray-command-foot",children:[(0,U.jsxs)("span",{children:[(0,U.jsx)("kbd",{children:"\u2191"}),(0,U.jsx)("kbd",{children:"\u2193"})," navigate"]}),(0,U.jsxs)("span",{children:[(0,U.jsx)("kbd",{children:"\u21B5"})," run"]}),(0,U.jsxs)("span",{children:[(0,U.jsx)("kbd",{children:"esc"})," close"]}),(0,U.jsx)("span",{className:"xray-spacer"}),(0,U.jsxs)("span",{children:[mt.length," result",mt.length===1?"":"s"]})]})]})}var Qt,U,d1,m1=E(()=>{"use strict";Qt=H(ze());Be();$e();um();vs();Zo();u1();Nn();Dt();ke();U=H(X()),d1=["Selection","Go to","Requests","Actions","Appearance","Console"]});function lM(e){let t=[],a=(l,s)=>{s&&t.push([l,s.length>pm?s.slice(0,pm):s])},o=l=>typeof l=="string"?l:W(l,0,pm);a("Method",e.method?String(e.method).toUpperCase():""),a("URL",String(e.url||e.urlPath||"")),e.status&&a("Status",String(e.status)),e.requestHeaders&&typeof e.requestHeaders=="object"&&a("Request headers",o(e.requestHeaders));let r=ia(e);r!=null&&a("Request body",o(r)),e.responseHeaders&&typeof e.responseHeaders=="object"&&a("Response headers",o(e.responseHeaders));let n=pe(e);return n!=null&&a("Response body",o(n)),e.message&&a("Message",String(e.message)),t}function sM(e,t,a,o,r){if(o){o.lastIndex=0;let s=o.exec(e);return s?{index:s.index,length:s[0].length||1}:null}let l=(r?e:e.toLowerCase()).indexOf(r?a:t);return l>=0?{index:l,length:a.length}:null}function y1(e,t,a={}){let o=String(t||"").trim();if(!o)return{matches:[],error:null,truncated:!1};let r=!!a.caseSensitive,n=null;if(a.regex)try{n=new RegExp(o,r?"":"i")}catch{return{matches:[],error:"Invalid regular expression",truncated:!1}}let l=o.toLowerCase(),s=[],i=!1;for(let f=e.length-1;f>=0;f--){if(s.length>=nM){i=!0;break}let u=e[f];for(let[x,d]of lM(u)){let p=sM(d,l,o,n,r);if(!p)continue;let v=Math.max(0,p.index-x1),k=Math.min(d.length,p.index+p.length+x1),D=v>0?"\u2026":"",y=k<d.length?"\u2026":"",c=d.slice(v,k).replace(/[\n\r\t]/g," ");s.push({id:u.id,entry:u,field:x,snippet:D+c+y,matchStart:D.length+(p.index-v),matchLength:Math.min(p.length,k-p.index)});break}}return{matches:s,error:null,truncated:i}}var nM,x1,pm,g1=E(()=>{"use strict";ke();nM=200,x1=44,pm=2e4});function iM({match:e}){let{snippet:t,matchStart:a,matchLength:o}=e;if(a<0||a>=t.length)return(0,Y.jsx)("span",{className:"xray-gsearch-snippet",children:t});let r=t.slice(0,a),n=t.slice(a,a+o),l=t.slice(a+o);return(0,Y.jsxs)("span",{className:"xray-gsearch-snippet",children:[r,(0,Y.jsx)("mark",{children:n}),l]})}function h1(){let e=I(c=>c.globalSearchOpen),t=I(c=>c.setGlobalSearchOpen),a=I(c=>c.entries),o=I(c=>c.selectEntry),r=I(c=>c.setActiveTab),[n,l]=(0,Kt.useState)(""),[s,i]=(0,Kt.useState)(!1),[f,u]=(0,Kt.useState)(!1),[x,d]=(0,Kt.useState)(0),p=(0,Kt.useRef)(null),v=(0,Kt.useMemo)(()=>y1(a,n,{regex:s,caseSensitive:f}),[a,n,s,f]),k=v.matches;Kt.default.useEffect(()=>{d(0)},[n,s,f,e]),Kt.default.useEffect(()=>{e||l("")},[e]),Kt.default.useEffect(()=>{p.current?.querySelector(`[data-match-index="${x}"]`)?.scrollIntoView({block:"nearest"})},[x]);function D(c){let m=k[c];m&&(o(m.entry.id),r(m.entry.type==="api"?"api":"logs"),t(!1))}function y(c){c.key==="ArrowDown"?(c.preventDefault(),d(m=>(m+1)%Math.max(1,k.length))):c.key==="ArrowUp"?(c.preventDefault(),d(m=>(m-1+k.length)%Math.max(1,k.length))):c.key==="Enter"?(c.preventDefault(),D(x)):c.key==="Home"?(c.preventDefault(),d(0)):c.key==="End"&&(c.preventDefault(),d(k.length-1))}return e?(0,Y.jsxs)(Nt,{title:"Find in traffic",subtitle:"Search across every captured URL, header, and request/response body",icon:(0,Y.jsx)(ot,{...Wf}),className:"xray-gsearch-modal",onClose:()=>t(!1),children:[(0,Y.jsxs)("div",{className:"xray-gsearch-controls",children:[(0,Y.jsxs)("label",{className:"xray-search xray-gsearch-input",children:[(0,Y.jsx)(ot,{...Wf}),(0,Y.jsx)("input",{className:"xray-input",autoFocus:!0,value:n,onChange:c=>l(c.currentTarget.value),onKeyDown:y,placeholder:s?"Regular expression\u2026":"Search text across all captured traffic\u2026",spellCheck:!1})]}),(0,Y.jsxs)("button",{className:`xray-chip ${s?"active":""}`,onClick:()=>i(c=>!c),"aria-pressed":s,title:"Match with a regular expression",children:[(0,Y.jsx)(Pp,{...Wf}),"Regex"]}),(0,Y.jsxs)("button",{className:`xray-chip ${f?"active":""}`,onClick:()=>u(c=>!c),"aria-pressed":f,title:"Case-sensitive matching",children:[(0,Y.jsx)(Np,{...Wf}),"Case"]})]}),(0,Y.jsxs)("div",{className:"xray-modal-body xray-gsearch-list",ref:p,children:[v.error&&(0,Y.jsx)("div",{className:"xray-gsearch-error",children:v.error}),!v.error&&!n.trim()&&(0,Y.jsxs)("div",{className:"xray-command-empty",children:[(0,Y.jsx)(ot,{size:20,stroke:1.6}),(0,Y.jsx)("span",{children:"Search inside your captured traffic"}),(0,Y.jsx)("small",{children:"Matches URLs, methods, status, headers, and request & response bodies. Toggle Regex for patterns."})]}),!v.error&&n.trim()&&k.length===0&&(0,Y.jsxs)("div",{className:"xray-command-empty",children:[(0,Y.jsx)(ot,{size:20,stroke:1.6}),(0,Y.jsxs)("span",{children:["No matches for \u201C",n,"\u201D"]}),(0,Y.jsx)("small",{children:"Try different text, or enable Regex."})]}),k.map((c,m)=>{let g=String(c.entry.method||c.entry.logLevel||"GET").toUpperCase();return(0,Y.jsxs)("button",{"data-match-index":m,className:`xray-gsearch-row ${m===x?"active":""}`,onMouseMove:()=>d(m),onClick:()=>D(m),children:[(0,Y.jsx)("span",{className:`xray-cmd-method ${ca(c.entry.method)}`,children:g.slice(0,4)}),(0,Y.jsxs)("span",{className:"xray-gsearch-main",children:[(0,Y.jsxs)("span",{className:"xray-gsearch-path",children:[re(c.entry),(0,Y.jsx)("span",{className:"xray-gsearch-field",children:c.field})]}),(0,Y.jsx)(iM,{match:c})]}),c.entry.status?(0,Y.jsx)("span",{className:`xray-gsearch-status ${jt(Number(c.entry.status))}`,children:c.entry.status}):null,m===x&&(0,Y.jsx)(rs,{size:14,stroke:2,className:"xray-command-enter"})]},`${c.id}-${m}`)})]}),(0,Y.jsxs)("div",{className:"xray-command-foot",children:[(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"\u2191"}),(0,Y.jsx)("kbd",{children:"\u2193"})," navigate"]}),(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"\u21B5"})," open"]}),(0,Y.jsxs)("span",{children:[(0,Y.jsx)("kbd",{children:"esc"})," close"]}),(0,Y.jsx)("span",{className:"xray-spacer"}),(0,Y.jsxs)("span",{children:[k.length,v.truncated?"+":""," match",k.length===1?"":"es"]})]})]}):null}var Kt,Y,Wf,I1=E(()=>{"use strict";Kt=H(ze());Be();$e();Zo();g1();Dt();ke();Y=H(X()),Wf={size:16,stroke:1.8}});function b1(e){let t=e.filter(Pe);return{apiCount:t.length,logCount:e.filter(Gd).length,errorCount:t.filter(a=>Number(a.status)>=400).length,totalBytes:t.reduce((a,o)=>a+(Number(o.size)||0),0)}}var v1=E(()=>{"use strict";Dt()});function S1(){let e=I(t=>t.openSettings);return(0,mm.jsx)("button",{className:"xray-icon-btn",title:"Theme & appearance","aria-label":"Theme and appearance",onClick:()=>e("appearance"),children:(0,mm.jsx)(Mr,{...fM})})}var mm,fM,w1=E(()=>{"use strict";Be();$e();mm=H(X()),fM={size:16,stroke:1.8}});function k1(){let e=typeof window<"u"?Math.round(window.innerWidth*.96):mf;return Math.min(mf,e)}function xm(e){return Math.max(pf,Math.min(k1(),Math.round(e)))}function A1({children:e,mode:t}){let a=I(L=>L.open),o=I(L=>L.devtoolsMode),r=I(L=>L.activeTab),n=I(L=>L.setActiveTab),l=I(L=>L.entries),s=I(L=>L.settings),i=I(L=>L.updateSettings),f=I(L=>L.setExportOpen),u=I(L=>L.setSettingsOpen),x=I(L=>L.showToast),d=I(L=>L.toastMessage),p=I(L=>L.clearToast),v=I(L=>L.setOpen),{apiCount:k,logCount:D,errorCount:y,totalBytes:c}=b1(l),m=t==="hud",g=s.dockSide,[A,B]=Fa.default.useState(null),b=Fa.default.useRef(null),N=Fa.default.useRef(0),S=A??s.panelWidth;Fa.default.useEffect(()=>()=>{N.current&&cancelAnimationFrame(N.current)},[]);function _(L){L.button===0&&(L.preventDefault(),L.currentTarget.setPointerCapture(L.pointerId),b.current={startX:L.clientX,startWidth:s.panelWidth,latest:s.panelWidth},B(s.panelWidth))}function ne(L){let Xe=b.current;if(!Xe)return;let Ba=g==="right"?Xe.startX-L.clientX:L.clientX-Xe.startX;Xe.latest=xm(Xe.startWidth+Ba),!N.current&&(N.current=requestAnimationFrame(()=>{N.current=0,b.current&&B(b.current.latest)}))}function nt(L){let Xe=b.current;if(Xe){b.current=null,N.current&&(cancelAnimationFrame(N.current),N.current=0);try{L.currentTarget.releasePointerCapture(L.pointerId)}catch{}B(null),Xe.latest!==s.panelWidth&&i({panelWidth:Xe.latest})}}function mt(L){let Xe=g==="right"?"ArrowLeft":"ArrowRight",Ba=g==="right"?"ArrowRight":"ArrowLeft";if(L.key===Xe||L.key===Ba){L.preventDefault();let $o=L.key===Xe?C1:-C1;i({panelWidth:xm(s.panelWidth+$o)})}}function co(){i({panelWidth:xm(We.panelWidth)})}function Wo(){i({dockSide:g==="right"?"left":"right"})}function va(){let L=window.XRAY_Panel;L?.hide?L.hide():v(!1)}let[O,G]=Fa.default.useState(!1);Fa.default.useEffect(()=>{if(!d||O)return;let L=window.setTimeout(p,2800);return()=>window.clearTimeout(L)},[d,O,p]);let Te=Fa.default.useMemo(()=>({showToast:x}),[x]),Bt=()=>Zf(Te),w=()=>Qf(Te),le=()=>Kf(Te);function lt(L,Xe){if(!["ArrowLeft","ArrowRight","Home","End"].includes(L.key))return;L.preventDefault();let $o=Br.findIndex(G1=>G1.id===Xe);if($o<0)return;let $f=Br.length-1,X1=L.key==="Home"?0:L.key==="End"?$f:L.key==="ArrowLeft"?$o===0?$f:$o-1:$o===$f?0:$o+1,Jf=Br[X1];if(!Jf)return;n(Jf.id),L.currentTarget.getRootNode().getElementById?.(`xray-tab-${Jf.id}`)?.focus()}let Na=Fa.default.useRef(null);Fa.default.useEffect(()=>{let L=Na.current;if(!L)return;L.querySelector(`#xray-tab-${r}`)?.scrollIntoView?.({block:"nearest",inline:"nearest"})},[r]);let uo=s.theme==="custom"?Sr(s.customTheme):{};return(0,J.jsxs)("div",{className:`xray-panel xray-mode-${t} ${m?`xray-dock-${g}`:""} xray-theme-${s.theme} xray-density-${s.density} xray-font-${s.font} ${s.glow?"xray-glow":"xray-no-glow"} ${s.hacker?"xray-hacker":""} ${a?"xray-open":""} ${o?"xray-devtools":""} ${s.compactRows?"xray-compact-rows":""}`,style:{"--xray-accent":Bn(s),"--xray-font":xf[s.font],"--xray-radius":`${s.radius}px`,"--xray-panel-width":`${S}px`,...uo},children:[m&&(0,J.jsx)("div",{className:`xray-resize-handle ${A!==null?"dragging":""}`,role:"separator","aria-orientation":"vertical","aria-label":"Resize panel - drag, or use arrow keys","aria-valuenow":S,"aria-valuemin":pf,"aria-valuemax":k1(),tabIndex:0,onPointerDown:_,onPointerMove:ne,onPointerUp:nt,onPointerCancel:nt,onKeyDown:mt,onDoubleClick:co,title:"Drag to resize \xB7 double-click to reset"}),(0,J.jsxs)("header",{className:"xray-topbar",children:[(0,J.jsxs)("div",{className:"xray-brand xray-drag-handle",children:[(0,J.jsx)("span",{className:"xray-brand-mark",children:(0,J.jsx)(rt,{size:18,stroke:2})}),(0,J.jsx)("span",{children:"XRAY"}),(0,J.jsxs)("span",{className:"xray-brand-ver",title:`XRAY ${ws} \xB7 built ${jf}`,children:["v",ws]}),(0,J.jsx)("span",{className:`xray-live-dot ${a?"on":""}`})]}),(0,J.jsx)("nav",{className:"xray-tabs",role:"tablist","aria-label":"XRAY panel tabs",ref:Na,children:Br.map(L=>(0,J.jsxs)("button",{id:`xray-tab-${L.id}`,role:"tab","aria-selected":r===L.id,"aria-controls":"xray-tabpanel",tabIndex:r===L.id?0:-1,"aria-label":L.label,className:`xray-tab ${r===L.id?"active":""}`,onClick:()=>n(L.id),onKeyDown:Xe=>lt(Xe,L.id),children:[L.icon,(0,J.jsx)("span",{children:L.label}),L.id==="api"&&k>0&&(0,J.jsx)("span",{className:"xray-badge",children:k}),L.id==="logs"&&D>0&&(0,J.jsx)("span",{className:"xray-badge",children:D})]},L.id))}),(0,J.jsxs)("div",{className:"xray-summary",children:[k," APIs \xB7 ",y," ",y===1?"Error":"Errors"," \xB7 ",Tt(c)]}),(0,J.jsxs)("div",{className:"xray-mode-switcher","aria-label":"XRAY display mode",children:[(0,J.jsx)("button",{className:`xray-icon-btn ${t==="devtools"?"active":""}`,title:"Open in DevTools","aria-label":"Open in DevTools",onClick:Bt,children:(0,J.jsx)(fs,{...Qn})}),(0,J.jsx)("button",{className:`xray-icon-btn ${t==="hud"?"active":""}`,title:"Float over page","aria-label":"Float over page",onClick:w,children:(0,J.jsx)(ds,{...Qn})}),(0,J.jsx)("button",{className:`xray-icon-btn ${t==="window"?"active":""}`,title:"Open in separate window","aria-label":"Open in separate window",onClick:le,children:(0,J.jsx)(ns,{...Qn})})]}),(0,J.jsx)(S1,{}),(0,J.jsx)("button",{className:"xray-icon-btn","aria-label":"Open export modal",onClick:()=>f(!0),children:(0,J.jsx)(Ft,{size:16,stroke:1.8})}),(0,J.jsx)("button",{className:"xray-icon-btn","aria-label":"Open settings",onClick:()=>u(!0),children:(0,J.jsx)(Fr,{size:16,stroke:1.8})}),m&&(0,J.jsxs)("div",{className:"xray-dock-controls","aria-label":"Panel position",children:[(0,J.jsx)("button",{className:"xray-icon-btn",title:g==="right"?"Dock to left edge":"Dock to right edge","aria-label":g==="right"?"Dock to left edge":"Dock to right edge",onClick:Wo,children:g==="right"?(0,J.jsx)(Dp,{...Qn}):(0,J.jsx)(Fp,{...Qn})}),(0,J.jsx)("button",{className:"xray-icon-btn xray-close-btn",title:"Close panel (Esc)","aria-label":"Close panel",onClick:va,children:(0,J.jsx)(ha,{...Qn})})]})]}),(0,J.jsx)("main",{className:"xray-body",id:"xray-tabpanel",role:"tabpanel","aria-labelledby":`xray-tab-${r}`,children:e}),(0,J.jsx)("div",{className:"xray-toast-region",role:"status","aria-live":"polite","aria-atomic":"true",children:d&&(0,J.jsx)("button",{className:"xray-toast",onClick:p,onMouseEnter:()=>G(!0),onMouseLeave:()=>G(!1),onFocus:()=>G(!0),onBlur:()=>G(!1),"aria-label":"Dismiss notification",children:d})})]})}var Fa,J,Qn,C1,R1=E(()=>{"use strict";Fa=H(ze());Be();$e();On();v1();Nn();ke();im();vs();w1();um();J=H(X()),Qn={size:16,stroke:1.8},C1=24});function M1({mode:e="hud"}){let t=I(r=>r.activeTab),a=I(r=>r.settings),o={"--xray-accent":Bn(a),"--xray-font":xf[a.font],"--xray-radius":`${a.radius}px`,...a.theme==="custom"?Sr(a.customTheme):{}};return(0,gt.jsxs)("div",{className:`xray-theme-scope xray-theme-${a.theme} xray-font-${a.font}`,style:o,children:[(0,gt.jsxs)(A1,{mode:e,children:[t==="console"&&(0,gt.jsx)(M0,{}),t==="api"&&(0,gt.jsx)(am,{mode:"api"}),t==="logs"&&(0,gt.jsx)(am,{mode:"logs"}),t==="rules"&&(0,gt.jsx)(Q0,{}),t==="insights"&&(0,gt.jsx)(V0,{})]}),(0,gt.jsx)(P0,{}),(0,gt.jsx)(W0,{}),(0,gt.jsx)(e1,{}),(0,gt.jsx)(l1,{}),(0,gt.jsx)(p1,{}),(0,gt.jsx)(h1,{}),(0,gt.jsx)(U0,{})]})}var gt,T1=E(()=>{"use strict";$e();On();Nn();A0();T0();q0();X0();Y0();K0();$0();t1();s1();m1();I1();R1();gt=H(X())});function D1(e){if(e.dataset[E1]==="1")return;e.dataset[E1]="1";let t=a=>{a.stopPropagation()};for(let a of cM)e.addEventListener(a,t)}var cM,E1,F1=E(()=>{"use strict";cM=["wheel","mousedown","mouseup","click","dblclick","contextmenu","pointerdown","pointerup","keydown","keyup","keypress","input","beforeinput","touchstart","touchmove","touchend","focusin","focusout","dragstart","drag","dragover","drop","dragend","copy","cut","paste"],E1="xrayIsolated"});var N1,B1=E(()=>{N1=`:host,
.xray-app-root {
  --xray-bg: #1e1e2e;
  --xray-surface: #181825;
  --xray-surface2: #313244;
  /* RGB triples so translucent surfaces (rgba(var(--\u2026-rgb), a)) adapt per theme */
  --xray-bg-rgb: 30, 30, 46;
  --xray-surface-rgb: 24, 24, 37;
  --xray-surface2-rgb: 49, 50, 68;
  --xray-text-rgb: 205, 214, 244;
  /* corner-radius scale \u2014 base is set inline per-panel from settings.radius */
  --xray-radius: 10px;
  --xray-radius-sm: calc(var(--xray-radius) * 0.6);
  --xray-radius-lg: calc(var(--xray-radius) * 1.4);
  /* motion system \u2014 one easing/duration language across the UI */
  --xray-ease: cubic-bezier(0.22, 0.8, 0.28, 1);
  --xray-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --xray-dur-fast: 120ms;
  --xray-dur: 180ms;
  --xray-text: #cdd6f4;
  --xray-green: #a6e3a1;
  --xray-blue: #89b4fa;
  --xray-yellow: #f9e2af;
  --xray-red: #f38ba8;
  --xray-mauve: #cba6f7;
  --xray-teal: #94e2d5;
  --xray-peach: #fab387;
  --xray-hint: #6c7086;
  --xray-subtext: #a6adc8;
  --xray-font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
`});var O1,L1=E(()=>{O1=`* {
  box-sizing: border-box;
}

.xray-app-root {
  all: initial;
  color: var(--xray-text);
  font-family: var(--xray-font);
}

.xray-app-root *,
.xray-hud * {
  scrollbar-color: color-mix(in srgb, var(--xray-hint) 62%, transparent) rgba(var(--xray-bg-rgb), .44);
  scrollbar-width: thin;
  /* Absorb overscroll inside the panel so scrolling a list/detail to its edge
     never chains through to the website behind an injected side panel or HUD. */
  overscroll-behavior: contain;
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
  background: color-mix(in srgb, var(--xray-hint) 72%, transparent);
}

.xray-app-root *::-webkit-scrollbar-thumb:hover,
.xray-hud *::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--xray-blue) 72%, transparent);
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
  border-left: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  box-shadow: -20px 0 80px rgba(0, 0, 0, .38);
  font: 12px/1.45 var(--xray-font);
  overflow: hidden;
}

/* Left-dock mirror of the base (right-docked) side panel. Only added in the docked
   side panel; the floating HUD's hud.css neutralizes it, and devtools/window modes
   never get the dock class. */
.xray-panel.xray-dock-left {
  right: auto;
  left: 0;
  border-left: 0;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  box-shadow: 20px 0 80px rgba(0, 0, 0, .38);
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

.xray-resize-handle:hover,
.xray-resize-handle:focus-visible,
.xray-resize-handle.dragging {
  background: color-mix(in srgb, var(--xray-accent) 22%, transparent);
  outline: none;
}

.xray-resize-handle:hover::after,
.xray-resize-handle:focus-visible::after,
.xray-resize-handle.dragging::after {
  opacity: 1;
  background: var(--xray-accent);
}

/* Dock / close cluster, separated from the mode switcher by a hairline. */
.xray-dock-controls {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
}

.xray-close-btn:hover {
  color: var(--xray-red, #ff5c7a);
  background: color-mix(in srgb, var(--xray-red, #ff5c7a) 16%, transparent);
}

/* The theme scope carries color tokens to the panel AND its sibling modals via
   inheritance; display:contents means it adds no layout box. */
.xray-theme-scope {
  display: contents;
}

/* Theme token blocks key off the theme class alone (present on both .xray-theme-scope
   and .xray-panel), so popups rendered outside .xray-panel inherit the active theme. */
.xray-theme-operator {
  --xray-bg: #0b0f14;
  --xray-surface: #101720;
  --xray-surface2: #151f2b;
  --xray-surface3: #1b2836;
  --xray-bg-rgb: 11, 15, 20;
  --xray-surface-rgb: 16, 23, 32;
  --xray-surface2-rgb: 21, 31, 43;
  --xray-text-rgb: 216, 226, 239;
  --xray-text: #d8e2ef;
  --xray-subtext: #8fa1b7;
  --xray-hint: #536274;
  --xray-blue: #37d5ff;
  --xray-mauve: #8b5cf6;
  --xray-green: #38f29b;
  --xray-yellow: #f6c76f;
  --xray-red: #ff5c7a;
  --xray-teal: #2ee6c5;
  --xray-peach: #ff9e64;
  --xray-border: rgba(80, 114, 148, .42);
  --xray-operator-grid: rgba(55, 213, 255, .035);
}

.xray-theme-dev-edition {
  --xray-bg: #11131f;
  --xray-surface: #171a2b;
  --xray-surface2: #20243a;
  --xray-surface3: #282d49;
  --xray-bg-rgb: 17, 19, 31;
  --xray-surface-rgb: 23, 26, 43;
  --xray-surface2-rgb: 32, 36, 58;
  --xray-text-rgb: 225, 231, 255;
  --xray-text: #e1e7ff;
  --xray-subtext: #a8b0cf;
  --xray-hint: #6f789d;
  --xray-blue: #75ddff;
  --xray-mauve: #b18cff;
  --xray-green: #62e6a8;
  --xray-yellow: #ffd37a;
  --xray-red: #ff6f91;
  --xray-teal: #5fe3d0;
  --xray-peach: #ffab70;
  --xray-border: rgba(124, 138, 189, .36);
  --xray-operator-grid: rgba(177, 140, 255, .04);
}

.xray-theme-midnight {
  --xray-bg: #05070a;
  --xray-surface: #090d12;
  --xray-surface2: #0f151d;
  --xray-surface3: #151d29;
  --xray-bg-rgb: 5, 7, 10;
  --xray-surface-rgb: 9, 13, 18;
  --xray-surface2-rgb: 15, 21, 29;
  --xray-text-rgb: 215, 247, 255;
  --xray-text: #d7f7ff;
  --xray-subtext: #83a4ad;
  --xray-hint: #49626b;
  --xray-blue: #00e5ff;
  --xray-mauve: #7c3aed;
  --xray-green: #00ff95;
  --xray-yellow: #ffd166;
  --xray-red: #ff3b6b;
  --xray-teal: #00e5c7;
  --xray-peach: #ff9e5e;
  --xray-border: rgba(0, 229, 255, .28);
  --xray-operator-grid: rgba(0, 229, 255, .045);
}

.xray-theme-light-lab {
  --xray-bg: #edf3fb;
  --xray-surface: #f8fbff;
  --xray-surface2: #e6eef9;
  --xray-surface3: #d9e5f5;
  --xray-bg-rgb: 237, 243, 251;
  --xray-surface-rgb: 248, 251, 255;
  --xray-surface2-rgb: 230, 238, 249;
  --xray-text-rgb: 23, 32, 51;
  --xray-text: #172033;
  --xray-subtext: #526173;
  --xray-hint: #75869a;
  --xray-blue: #006adc;
  --xray-mauve: #7048e8;
  --xray-green: #087f5b;
  --xray-yellow: #8f6212;
  --xray-red: #b5195a;
  --xray-teal: #0b7285;
  --xray-peach: #c2410c;
  --xray-border: rgba(82, 97, 115, .28);
  --xray-operator-grid: rgba(0, 106, 220, .035);
}

.xray-theme-claude {
  --xray-bg: #f0eee6;
  --xray-surface: #faf9f5;
  --xray-surface2: #eceae0;
  --xray-surface3: #e4e1d5;
  --xray-bg-rgb: 240, 238, 230;
  --xray-surface-rgb: 250, 249, 245;
  --xray-surface2-rgb: 236, 234, 224;
  --xray-text-rgb: 35, 34, 31;
  --xray-text: #23221f;
  --xray-subtext: #6b675f;
  --xray-hint: #9a968c;
  --xray-blue: #4a6fa5;
  --xray-mauve: #8a5cc4;
  --xray-green: #3f8a4f;
  --xray-yellow: #8a6215;
  --xray-red: #c0392b;
  --xray-teal: #1c6b6b;
  --xray-peach: #d97757;
  --xray-border: rgba(60, 55, 48, .18);
  --xray-operator-grid: rgba(217, 119, 87, .05);
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
  background:
    linear-gradient(90deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    linear-gradient(180deg, var(--xray-operator-grid, transparent) 1px, transparent 1px),
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--xray-accent) 16%, transparent), transparent 32%),
    radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--xray-mauve) 12%, transparent), transparent 30%);
  background-size: 28px 28px, 28px 28px, auto, auto;
  opacity: .8;
}

.xray-panel.xray-no-glow::before {
  opacity: .28;
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
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, var(--xray-text) 6%), var(--xray-surface));
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--xray-accent) 18%, transparent);
  flex-shrink: 0;
}

.xray-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  font-weight: 900;
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
  color: white;
  background: linear-gradient(135deg, var(--xray-accent, var(--xray-blue)), var(--xray-mauve));
  border-radius: var(--xray-radius);
  box-shadow: 0 0 22px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 32%, transparent);
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
.xray-console-tabs,
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
.xray-mini-tab,
.xray-btn,
.xray-chip,
.xray-icon-btn {
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 800 12px/1 var(--xray-font);
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
  text-transform: uppercase;
  letter-spacing: .04em;
  font-size: calc(11px * var(--xray-density-scale, 1));
}

.xray-tab:hover,
.xray-mini-tab:hover,
.xray-btn:hover,
.xray-chip:hover,
.xray-icon-btn:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-tab.active,
.xray-mini-tab.active,
.xray-chip.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 64%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 16%, transparent), 0 0 22px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-no-glow .xray-tab.active,
.xray-no-glow .xray-mini-tab.active,
.xray-no-glow .xray-chip.active,
.xray-no-glow .xray-brand-mark,
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
  font-size: calc(10px * var(--xray-density-scale, 1));
  text-transform: uppercase;
  letter-spacing: .08em;
}

.xray-mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.xray-mode-switcher .xray-icon-btn.active {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
}

.xray-body {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--xray-bg) 96%, var(--xray-accent) 4%);
}

.xray-console-head {
  display: flex;
  align-items: center;
  min-height: 44px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
}

.xray-mini-tab {
  height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
  border-bottom: 2px solid transparent;
}

.xray-mini-tab.active {
  border-bottom-color: var(--xray-blue);
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
  border-color: color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .74);
  color: var(--xray-text);
}

.xray-btn.primary {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 48%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 13%, transparent);
}

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
  grid-template-columns: minmax(180px, 1fr) auto;
  gap: 8px;
  padding: 12px;
  background: var(--xray-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 55%, transparent);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 0 12px 0 38px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .5);
  font: 800 13px/1 var(--xray-font);
}

.xray-input:focus,
.xray-prompt input:focus,
.xray-prompt textarea:focus {
  border-color: var(--xray-accent, var(--xray-blue));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 48%, transparent);
}

/* Chips wrap onto multiple rows rather than overflowing/clipping \u2014 a narrow
   panel must never hide filters behind an invisible horizontal scroll. */
.xray-filter-chips {
  flex-wrap: wrap;
  row-gap: 5px;
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
  border-color: color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  white-space: nowrap;
}

.xray-filter-chips.compact .xray-chip {
  height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

/* Grows to fill the body, mirroring its sibling .xray-console-stream-wrap. It used
   to be pinned at max-height: min(44vh, 380px) with no flex-grow, so at 1600x1000
   the workspace ended 332px above the panel's bottom edge while the request list was
   capped to five of twenty rows. The prompt, snippet bar and status bar keep their
   space on their own -- they are auto-sized siblings, so the cap was never what
   protected them. */
.xray-network {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  flex: 1 1 auto;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-bg);
  overflow: hidden;
}

.xray-network-head,
.xray-network-row {
  display: grid;
  /* Status \xB7 Method \xB7 Name \xB7 Type \xB7 Size \xB7 Waterfall \u2014 the waterfall takes the
     remaining flexible width (2fr) so wide rows have no dead gap. */
  grid-template-columns: 52px 52px minmax(120px, 1.3fr) 76px 66px minmax(140px, 2fr);
  align-items: center;
  gap: 10px;
}

.xray-network-head {
  height: 28px;
  padding: 0 12px;
  color: var(--xray-mauve);
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 10px;
  font-weight: 900;
}

.xray-virtual-list {
  position: relative;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.xray-network-row {
  min-height: 32px;
  padding: 0 12px;
  cursor: pointer;
  font-weight: 800;
}

.xray-network-row:hover {
  background: rgba(var(--xray-text-rgb), .04);
}

.xray-network-row.selected {
  background: color-mix(in srgb, var(--xray-accent) 15%, transparent);
  box-shadow: inset 2px 0 0 var(--xray-accent, var(--xray-blue));
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

.xray-path {
  min-width: 0;
  /* Inside the panel this is overridden by \`.xray-panel .xray-path\` below, which
     is why the Catppuccin lavender that used to sit here was invisible in an
     audit of the rendered UI \u2014 it only ever painted outside a .xray-panel
     ancestor. Same formula as that rule so the two cannot drift apart. */
  color: color-mix(in srgb, var(--xray-text) 86%, var(--xray-accent, var(--xray-mauve)) 14%);
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
  min-height: 0;
  flex: 1;
  display: flex;
}

/* overflow: hidden here made the stream wheel-unscrollable \u2014 the virtualizer
   could move it programmatically but the user could not. */
.xray-console-stream {
  min-height: 0;
  flex: 1;
  background: var(--xray-surface);
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
  border: 1px solid rgba(var(--xray-accent-rgb), .6);
  border-radius: 999px;
  color: var(--xray-text);
  background: rgba(var(--xray-surface2-rgb), .95);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .3);
  cursor: pointer;
  font: 800 11px/1 var(--xray-font);
}

.xray-newmsg-pill:hover {
  background: rgba(var(--xray-accent-rgb), .2);
}

.xray-repeat-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid rgba(var(--xray-accent-rgb), .45);
  background: rgba(var(--xray-accent-rgb), .14);
  color: var(--xray-text);
  font-size: 10px;
  font-weight: 800;
}

.xray-truncated-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--xray-yellow) 50%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 12%, transparent);
  color: var(--xray-yellow);
  font-size: 10px;
  font-weight: 800;
}

.xray-error-stack {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--xray-red);
  font: 600 11px/1.5 var(--xray-font);
}

.xray-chip-count {
  margin-left: 5px;
  padding: 0 6px;
  border-radius: 999px;
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 16%, transparent);
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

.xray-console-row.command {
  color: var(--xray-mauve);
  /* Set the REPL input/output apart from page-log noise the way DevTools tints
     its own prompt echo \u2014 the command/result pair reads as one "turn". */
  background: color-mix(in srgb, var(--xray-mauve) 7%, transparent);
}

.xray-console-row.result {
  border-left: 2px solid rgba(var(--xray-accent-rgb), .55);
  background: color-mix(in srgb, var(--xray-accent) 5%, transparent);
}

/* Leading gutter marker: quiet by default, colored only where it carries
   meaning (input, output, error, warning). Centered on the first text line. */
.xray-console-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  color: var(--xray-hint);
}

.xray-console-row.error .xray-console-glyph { color: var(--xray-red); }
.xray-console-row.warn .xray-console-glyph { color: var(--xray-yellow); }
.xray-console-row.command .xray-console-glyph { color: var(--xray-mauve); }
.xray-console-row.result .xray-console-glyph { color: var(--xray-accent); }

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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-prompt {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-surface);
  flex-shrink: 0;
}

.xray-prompt input,
.xray-prompt textarea {
  min-height: 34px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 55%, transparent);
  border-radius: var(--xray-radius);
  outline: none;
  padding: 9px 10px;
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 800 12px/1.3 var(--xray-font);
  resize: none;
  overflow-y: auto;
  max-height: 110px;
}

.xray-context-chip {
  max-width: 260px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--xray-blue) 50%, transparent);
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-blue) 12%, transparent);
  cursor: pointer;
  font: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-statusbar {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px;
  color: var(--xray-subtext);
  background: var(--xray-bg);
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  font-size: 10px;
  font-weight: 900;
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
  grid-template-columns: minmax(240px, var(--xray-logs-split, 42%)) minmax(300px, 1fr);
}

.xray-list-panel {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  overflow: hidden;
}

.xray-list-panel > .xray-virtual-list {
  flex: 1;
  min-height: 0;
  height: auto;
}

.xray-list-controls {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--xray-mauve) 10%, transparent), transparent 36%),
    var(--xray-surface);
}

.xray-api-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) minmax(180px, 1.4fr);
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: var(--xray-bg);
}

.xray-api-metric,
.xray-api-top-endpoint {
  min-width: 0;
  min-height: 44px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 7px 9px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .64);
}

.xray-api-top-endpoint {
  min-height: 36px;
}

.xray-api-metric {
  grid-template-columns: 18px minmax(0, 1fr);
}

.xray-api-metric svg {
  grid-row: 1 / 3;
  align-self: center;
  color: var(--xray-blue);
}

.xray-api-metric span,
.xray-api-top-endpoint span {
  min-width: 0;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.xray-api-metric strong,
.xray-api-top-endpoint strong {
  min-width: 0;
  color: var(--xray-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.xray-api-metric.ok strong,
.xray-api-metric.ok svg {
  color: var(--xray-green);
}

.xray-api-metric.warn strong,
.xray-api-metric.warn svg {
  color: var(--xray-yellow);
}

.xray-api-metric.error strong,
.xray-api-metric.error svg {
  color: var(--xray-red);
}

.xray-api-workspace {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(var(--xray-bg-rgb), .24), transparent 180px),
    var(--xray-bg);
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

.xray-pane-divider:hover,
.xray-pane-divider:focus-visible,
.xray-pane-divider.dragging {
  background: color-mix(in srgb, var(--xray-accent) 20%, transparent);
  outline: none;
}

.xray-pane-divider:hover::after,
.xray-pane-divider:focus-visible::after,
.xray-pane-divider.dragging::after {
  opacity: 1;
  background: var(--xray-accent);
}

.xray-api-collection-pane {
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-bg-rgb), .42);
}

.xray-api-collection-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 32%, transparent);
  background:
    radial-gradient(circle at 20% -20%, color-mix(in srgb, var(--xray-blue) 15%, transparent), transparent 42%),
    rgba(var(--xray-surface-rgb), .88);
}

.xray-api-collection-title {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.xray-api-collection-title span,
.xray-pane-kicker,
.xray-api-summary-pill span {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.xray-api-collection-title strong {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.xray-api-env-pill {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--xray-teal) 30%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-teal);
  background: color-mix(in srgb, var(--xray-teal) 8%, transparent);
  font-size: 10px;
  font-weight: 900;
}

.xray-api-stats-collapsible {
  grid-column: 1 / -1;
  min-width: 0;
}

/* The stats collapsible carries its own header, so drop the strip's padding. */
.xray-api-stats-collapsible .xray-collapsible-header {
  padding: 2px 0 6px;
}

.xray-api-summary-strip {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.xray-api-summary-pill {
  min-width: 0;
  height: 38px;
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  align-content: center;
  align-items: center;
  gap: 1px 6px;
  padding: 5px 7px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-bg-rgb), .66);
}

.xray-api-summary-pill svg {
  grid-row: 1 / 3;
  color: var(--xray-blue);
}

.xray-api-summary-pill strong {
  min-width: 0;
  overflow: hidden;
  color: var(--xray-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.xray-api-summary-pill.ok svg,
.xray-api-summary-pill.ok strong {
  color: var(--xray-green);
}

.xray-api-summary-pill.warn svg,
.xray-api-summary-pill.warn strong {
  color: var(--xray-yellow);
}

.xray-api-summary-pill.error svg,
.xray-api-summary-pill.error strong {
  color: var(--xray-red);
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

.xray-api-toolbar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .72);
}

.xray-api-search {
  min-width: 0;
  height: 36px;
  align-self: start;
}

.xray-api-search .xray-input {
  height: 36px;
  font-size: 11px;
}

.xray-api-primary-filters {
  justify-content: flex-start;
  min-width: 0;
  flex-wrap: wrap;
  overflow: visible;
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
  font-weight: 900;
  text-transform: uppercase;
}

.xray-api-table-head,
.xray-api-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px 76px 66px;
  align-items: center;
  gap: 7px;
}

.xray-api-table-head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 30px;
  padding: 0 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  color: var(--xray-hint);
  background: rgba(var(--xray-surface-rgb), .96);
  font: 900 10px/1 var(--xray-font);
  text-transform: uppercase;
  letter-spacing: .08em;
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
  min-height: 68px;
  padding: 9px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 18%, transparent);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.28 var(--xray-font);
  outline: none;
  transition: background .15s ease, box-shadow .15s ease, border-color .15s ease;
}

.xray-api-row:hover,
.xray-api-row:focus-visible {
  background: rgba(var(--xray-text-rgb), .055);
}

.xray-api-row.selected {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 27%, transparent), color-mix(in srgb, var(--xray-accent) 8%, transparent)),
    rgba(var(--xray-surface2-rgb), .42);
  box-shadow:
    inset 4px 0 0 var(--xray-accent, var(--xray-blue)),
    inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 30%, transparent),
    0 8px 22px rgba(0, 0, 0, .14);
}

.xray-api-row.has-error {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-red) 82%, transparent);
}

.xray-api-row.has-slow:not(.has-error) {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--xray-yellow) 72%, transparent);
}

.xray-api-row.selected.has-error,
.xray-api-row.selected.has-slow {
  box-shadow:
    inset 4px 0 0 var(--xray-accent, var(--xray-blue)),
    inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 30%, transparent),
    0 8px 22px rgba(0, 0, 0, .14);
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
  display: grid;
  gap: 4px;
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: 999px;
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 900;
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
  border-color: color-mix(in srgb, var(--xray-red) 38%, transparent);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-api-flag.slow,
.xray-api-flag.repeated,
.xray-api-flag.large {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 34%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-api-flag.empty {
  color: var(--xray-peach);
  border-color: color-mix(in srgb, var(--xray-peach) 34%, transparent);
  background: color-mix(in srgb, var(--xray-peach) 10%, transparent);
}

.xray-api-flag.pinned {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 36%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 10%, transparent);
}

.xray-api-row-actions {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface-rgb), .72);
  cursor: pointer;
}

.xray-icon-btn:hover,
.xray-icon-btn:focus-visible,
.xray-icon-btn.active {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent) 42%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-request-context-pane {
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background:
    linear-gradient(180deg, rgba(var(--xray-surface2-rgb), .30), transparent 160px),
    rgba(var(--xray-surface-rgb), .78);
}

.xray-request-context-pane.empty {
  justify-content: center;
}

.xray-request-context-head {
  flex-shrink: 0;
  display: grid;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 44%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-text);
  background: rgba(var(--xray-bg-rgb), .76);
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 800 11px/1 var(--xray-font);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
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
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
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
  grid-template-columns: 10px 50px 48px minmax(0, 1fr) 92px auto 30px;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.35 var(--xray-font);
}

.xray-entry-row:hover {
  background: rgba(var(--xray-text-rgb), .05);
}

.xray-entry-row.selected {
  background: color-mix(in srgb, var(--xray-blue) 16%, transparent);
  box-shadow: inset 3px 0 0 var(--xray-blue);
}

.xray-entry-row.child {
  padding-left: 24px;
  background: rgba(var(--xray-surface-rgb), .45);
}

.xray-entry-row.pinned {
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--xray-yellow) 8%, transparent), transparent 45%);
}

.xray-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--xray-hint);
}

.xray-status-dot.ok {
  background: var(--xray-green);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-green) 12%, transparent);
}

.xray-status-dot.warn {
  background: var(--xray-yellow);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-yellow) 12%, transparent);
}

.xray-status-dot.error {
  background: var(--xray-red);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-red) 12%, transparent);
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

.xray-count-pill,
.xray-pin {
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 40%, transparent);
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
  background: var(--xray-surface);
}

.xray-mobile-detail-panel {
  display: none;
}

.xray-request-detail {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--xray-mauve) 6%, transparent), transparent 220px),
    var(--xray-bg);
}

.xray-detail-hero {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 32%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: rgba(var(--xray-bg-rgb), .68);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.xray-response-chip.ok {
  color: var(--xray-green);
  border-color: color-mix(in srgb, var(--xray-green) 30%, transparent);
  background: color-mix(in srgb, var(--xray-green) 10%, transparent);
}

.xray-response-chip.warn {
  color: var(--xray-yellow);
  border-color: color-mix(in srgb, var(--xray-yellow) 30%, transparent);
  background: color-mix(in srgb, var(--xray-yellow) 10%, transparent);
}

.xray-response-chip.error {
  color: var(--xray-red);
  border-color: color-mix(in srgb, var(--xray-red) 30%, transparent);
  background: color-mix(in srgb, var(--xray-red) 10%, transparent);
}

.xray-detail-nav {
  flex-shrink: 0;
  display: grid;
  gap: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .92);
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
  font: 900 11px/1 var(--xray-font);
  text-transform: capitalize;
}

.xray-detail-tab:hover,
.xray-detail-tab.active {
  color: var(--xray-text);
  border-bottom-color: var(--xray-mauve);
}

.xray-detail-views {
  padding: 7px 12px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-detail-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px;
  background:
    radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--xray-blue) 6%, transparent), transparent 30%),
    rgba(var(--xray-bg-rgb), .74);
}

.xray-detail-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 42%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 900 11px/1 var(--xray-font);
}

.xray-action-btn:hover,
.xray-action-btn:focus-visible {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-blue) 44%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-action-btn.primary {
  color: var(--xray-accent, var(--xray-blue));
  border-color: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 46%, transparent);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 12%, transparent);
}

.xray-operation-groups {
  flex-shrink: 0;
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  font-weight: 900;
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

.xray-operation-chip.view {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 28%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 7%, transparent);
}

.xray-operation-chip.console {
  color: var(--xray-blue);
  border-color: color-mix(in srgb, var(--xray-blue) 30%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 8%, transparent);
}

.xray-operation-chip.snippet {
  color: var(--xray-teal);
  border-color: color-mix(in srgb, var(--xray-teal) 30%, transparent);
  background: color-mix(in srgb, var(--xray-teal) 8%, transparent);
}

.xray-operation-chip.copy {
  color: var(--xray-subtext);
}

.xray-operation-chip.export {
  color: var(--xray-peach);
  border-color: color-mix(in srgb, var(--xray-peach) 32%, transparent);
  background: color-mix(in srgb, var(--xray-peach) 8%, transparent);
}

.xray-api-drawer-body .xray-filter-chips {
  flex-wrap: wrap;
  overflow: visible;
}

.xray-card,
.xray-modal {
  border: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 22%, transparent);
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

.xray-json-line:hover {
  background: color-mix(in srgb, var(--xray-blue) 6%, transparent);
}

.xray-json-line-no {
  padding: 0 10px 0 0;
  color: var(--xray-hint);
  text-align: right;
  user-select: none;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-json-line-text {
  min-width: 0;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xray-json-key {
  color: var(--xray-mauve);
}

.xray-json-string {
  color: var(--xray-green);
}

.xray-json-number {
  color: var(--xray-teal);
}

.xray-json-bool {
  color: var(--xray-peach);
}

.xray-json-null {
  color: var(--xray-hint);
}

.xray-json-punct {
  color: var(--xray-subtext);
}

.xray-table {
  width: 100%;
  border-collapse: collapse;
  font: 700 11px/1.4 var(--xray-font);
}

.xray-table th,
.xray-table td {
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 28%, transparent);
  text-align: left;
  vertical-align: top;
}

.xray-table th {
  color: var(--xray-mauve);
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

.xray-modal {
  width: min(820px, 92vw);
  max-height: min(82vh, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xray-modal h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-modal-title-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--xray-accent, var(--xray-blue));
  border: 1px solid color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 28%, transparent);
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 11%, transparent);
}

.xray-export-modal {
  width: min(980px, 94vw);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-modal-foot {
  border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  border-bottom: 0;
}

.xray-modal-body {
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.xray-modal-subtitle,
.xray-export-subtitle {
  max-width: 520px;
  margin-top: 2px;
  color: var(--xray-hint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 800;
}

.xray-modal-version {
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 800;
}

.xray-export-body {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}

.xray-export-rail {
  min-height: 0;
  overflow: auto;
  padding: 10px;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .55);
}

.xray-export-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.xray-export-group {
  margin-bottom: 12px;
}

.xray-export-group-label {
  margin: 0 0 6px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.xray-export-format {
  width: 100%;
  min-height: 38px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  border-radius: var(--xray-radius);
  padding: 0 10px;
  color: var(--xray-subtext);
  background: transparent;
  cursor: pointer;
  font: 800 11px/1.2 var(--xray-font);
  text-align: left;
}

.xray-export-format:hover {
  color: var(--xray-text);
  background: rgba(var(--xray-text-rgb), .06);
}

.xray-export-format.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-blue) 55%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 13%, transparent);
}

.xray-export-format:disabled {
  opacity: .42;
  cursor: not-allowed;
}

.xray-export-format small {
  color: var(--xray-hint);
  font-size: 9px;
  text-transform: uppercase;
}

.xray-export-preview {
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
}

.xray-export-preview-head h3 {
  margin: 0;
  color: var(--xray-text);
  font-size: 13px;
}

.xray-export-preview-head p {
  margin: 3px 0 0;
  color: var(--xray-hint);
  font-size: 11px;
}

.xray-export-code {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  background: rgba(var(--xray-bg-rgb), .54);
}

.xray-textarea {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 50%, transparent);
  border-radius: var(--xray-radius);
  padding: 10px;
  color: var(--xray-text);
  background: var(--xray-surface);
  font: 800 12px/1.45 var(--xray-font);
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
  box-shadow: 0 12px 38px rgba(0, 0, 0, .32);
  font: 800 11px/1.35 var(--xray-font);
  cursor: pointer;
}

.xray-insight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 20%, transparent);
  padding: 7px 0;
  color: var(--xray-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: 800 11px/1.35 var(--xray-font);
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
  font: 800 11px/1.35 var(--xray-font);
}

.xray-settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xray-settings-modal {
  width: min(620px, 94vw);
}

.xray-settings-modal-body {
  /* A flat min-height: 400px could not shrink, so head + body + foot demanded 513px
     and the footer fell off the bottom below a 626px viewport -- the normal height of
     a docked DevTools drawer. The nav and content panes already scroll. */
  min-height: min(400px, 100%);
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  overflow: hidden;
}

.xray-settings-nav {
  padding: 8px 0;
  border-right: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  background: rgba(var(--xray-surface-rgb), .72);
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
  font: 800 11px/1 var(--xray-font);
}

.xray-settings-nav-item:hover {
  color: var(--xray-subtext);
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-settings-nav-item.active {
  color: var(--xray-text);
  border-left-color: var(--xray-accent, var(--xray-mauve));
  background: color-mix(in srgb, var(--xray-accent, var(--xray-mauve)) 8%, transparent);
}

.xray-settings-content {
  min-height: 0;
  overflow: auto;
  padding: 16px;
}

.xray-settings-section-title {
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
}

.xray-settings-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 25%, transparent));
  color: var(--xray-text);
  font: 800 11px/1.35 var(--xray-font);
}

.xray-settings-row.read-only {
  align-items: flex-start;
}

.xray-settings-row strong,
.xray-settings-row small {
  display: block;
}

.xray-settings-row small {
  margin-top: 2px;
  color: var(--xray-hint);
  font-size: 10px;
  font-weight: 800;
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 45%, transparent);
  border-radius: var(--xray-radius-sm);
  color: var(--xray-text);
  background: var(--xray-surface2);
  font: 800 11px/1 var(--xray-font);
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

.xray-color-row {
  display: flex;
  flex-wrap: wrap;
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
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
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
  font: 800 11px/1 var(--xray-font);
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
  font: 800 12px/1.55 var(--xray-font);
}

.xray-compact-rows .xray-api-row {
  min-height: 42px;
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
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
  font: 800 12px/1.25 var(--xray-font);
}

.xray-command-row:hover {
  border-color: color-mix(in srgb, var(--xray-blue) 42%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 10%, transparent);
}

.xray-command-row small {
  color: var(--xray-hint);
  font-size: 10px;
}

@container xray (max-width: 1700px) {
  .xray-api-body {
    grid-template-columns: minmax(260px, var(--xray-api-split, 480px)) minmax(340px, 1fr);
  }

  .xray-request-context-pane {
    display: none;
  }

  .xray-api-summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    max-height: 88vh;
  }

  .xray-settings-modal-body {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .xray-settings-nav {
    display: flex;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
  }

  .xray-settings-nav-item {
    flex: 0 0 auto;
    width: auto;
    border-left: 0;
    border-bottom: 2px solid transparent;
  }

  .xray-settings-nav-item.active {
    border-bottom-color: var(--xray-accent, var(--xray-mauve));
  }

  .xray-export-body {
    grid-template-columns: 1fr;
  }

  .xray-export-rail {
    display: flex;
    gap: 8px;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
    overflow-x: auto;
  }

  .xray-export-group {
    min-width: 170px;
    margin-bottom: 0;
  }

  .xray-export-preview-head {
    display: grid;
  }

  .xray-settings-grid {
    grid-template-columns: 1fr;
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
  .xray-console-head::-webkit-scrollbar,
  .xray-filter-chips::-webkit-scrollbar {
    display: none;
  }

  .xray-tab {
    flex: 0 0 auto;
    padding: 0 10px;
  }

  .xray-console-head {
    overflow-x: auto;
  }

  .xray-console-tabs,
  .xray-toolbar {
    flex: 0 0 auto;
  }

  .xray-toolbar {
    padding-right: 8px;
  }

  .xray-network-row > :nth-child(5),
  .xray-network-row > :nth-child(6),
  .xray-network-head > :nth-child(5),
  .xray-network-head > :nth-child(6) {
    display: none;
  }

  .xray-filterbar {
    grid-template-columns: 1fr;
  }

  .xray-filter-chips {
    padding-bottom: 2px;
  }

  .xray-network-head,
  .xray-network-row {
    grid-template-columns: 52px 46px minmax(120px, 1fr) 92px;
  }

  .xray-split {
    grid-template-columns: 1fr;
  }

  .xray-detail-panel {
    display: none;
  }

  .xray-api-workspace {
    overflow: hidden;
  }

  .xray-api-body {
    grid-template-columns: 1fr;
  }

  .xray-api-toolbar {
    grid-template-columns: 1fr;
    padding: 8px;
  }

  .xray-api-collection-pane {
    border-right: 0;
  }

  .xray-api-collection-head {
    grid-template-columns: minmax(0, 1fr);
  }

  .xray-api-env-pill {
    justify-self: start;
  }

  .xray-api-summary-strip {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .xray-api-summary-strip::-webkit-scrollbar {
    display: none;
  }

  .xray-api-summary-pill {
    flex: 0 0 112px;
  }

  .xray-api-primary-filters,
  .xray-api-secondary-controls,
  .xray-api-secondary-controls .xray-filter-chips {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .xray-api-secondary-controls {
    display: grid;
    gap: 6px;
  }

  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 48px minmax(0, 1fr) 46px 58px;
  }

  .xray-api-table-head > :nth-child(4),
  .xray-api-row > .xray-entry-duration {
    display: none;
  }

  .xray-api-row-actions {
    gap: 2px;
  }

  .xray-api-row-actions .xray-icon-btn[aria-label="Copy request URL"] {
    display: none;
  }

  .xray-api-detail-drawer {
    position: absolute;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: min(68vh, 560px);
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--xray-blue) 34%, transparent);
    border-radius: var(--xray-radius-lg) var(--xray-radius-lg) 0 0;
    background: var(--xray-surface);
    box-shadow: 0 -22px 44px rgba(0, 0, 0, .28);
    z-index: 8;
    overflow: hidden;
  }

  .xray-api-drawer-body,
  .xray-request-detail,
  .xray-detail-content {
    max-width: 100%;
    overflow-x: hidden;
  }

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

  .xray-detail-views {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow-x: visible;
  }

  .xray-detail-views .xray-chip {
    min-width: 0;
    justify-content: center;
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

  .xray-api-detail-drawer.empty {
    display: none;
  }

  .xray-entry-row {
    grid-template-columns: 9px 44px 42px minmax(0, 1fr) auto 28px;
  }

  .xray-list-panel > .xray-virtual-list {
    min-height: 168px;
  }

  .xray-entry-duration {
    display: none;
  }

  .xray-mobile-detail-panel {
    display: block;
    flex-shrink: 0;
    max-height: 38vh;
    overflow: auto;
    border-top: 1px solid color-mix(in srgb, var(--xray-hint) 35%, transparent);
    background: var(--xray-surface);
  }

  .xray-prompt {
    grid-template-columns: 20px minmax(120px, 1fr) auto;
    gap: 6px;
    padding: 8px;
  }

  .xray-context-chip {
    display: none;
  }

  .xray-insight-grid,
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

/* Then the tab labels, leaving the five icons. Measured: five labelled tabs need
   ~478px, five icons need ~160px, and below ~900px the header cannot seat the labels
   alongside eight buttons without pushing tabs off the end. Each button carries an
   aria-label, so the accessible name survives the label going away.

   Nothing here hides the mode switcher. An earlier revision did, on the grounds that
   its three surfaces were reachable from the command palette -- they are not, and
   hiding it left the pop-out window and the HUD with no entry point at all. */
@container xray (max-width: 900px) {
  .xray-tab span {
    display: none;
  }

  .xray-tab {
    padding: 0 8px;
  }
}

/* Narrower than this, five icons and eight buttons genuinely do not fit, so the strip
   scrolls -- and it gets its scrollbar back. Suppressing the scrollbar on a strip that
   overflows is what made the clipped tabs unreachable by mouse in the first place;
   nothing is removed from the header here, it just becomes scrollable with a visible
   affordance. Keyboard users already have arrow keys, and the active tab is scrolled
   into view whenever it changes. */
/* The three surface buttons step aside here. They are now genuinely redundant: the
   command palette carries "Open in separate window", "Float over page (HUD)" and
   "Open in DevTools" (CommandPalette.tsx, group Actions). An earlier revision hid them
   while that was NOT true, which left the pop-out and the HUD with no entry point. */
@container xray (max-width: 620px) {
  .xray-mode-switcher {
    display: none;
  }
}

@container xray (max-width: 620px) {
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

@container xray (max-width: 420px) {
  .xray-api-table-head,
  .xray-api-row {
    grid-template-columns: 42px minmax(0, 1fr) 42px 48px;
    gap: 5px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .xray-api-table-head > :nth-child(4),
  .xray-api-row > .xray-entry-duration {
    display: none;
  }

  .xray-response-chips,
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

  .xray-detail-views {
    flex-wrap: wrap;
    overflow-x: visible;
  }

  .xray-detail-views .xray-chip {
    flex: 1 1 auto;
    justify-content: center;
  }

  .xray-operation-group {
    grid-template-columns: 1fr;
  }

  .xray-api-row-actions .xray-icon-btn {
    width: 25px;
  }
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   XRAY Operator UI override layer
   Configurable developer cockpit skin applied across existing tabs.
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-panel .xray-api-workspace,
.xray-panel .xray-console-workspace,
.xray-panel .xray-insights,
.xray-panel .xray-settings-page,
.xray-panel .xray-logs-workspace {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--xray-bg) 92%, var(--xray-accent) 8%), var(--xray-bg));
}

.xray-panel .xray-api-collection-pane,
.xray-panel .xray-api-detail-pane,
.xray-panel .xray-console-main,
.xray-panel .xray-card,
.xray-panel .xray-settings-card,
.xray-panel .xray-modal-card {
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, var(--xray-text) 6%), var(--xray-surface));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 3.5%, transparent), 0 18px 50px rgba(0,0,0,.18);
}

.xray-panel .xray-api-row,
.xray-panel .xray-entry-row,
.xray-panel .xray-console-row,
.xray-panel .xray-log-row {
  min-height: var(--xray-row-h, 52px);
  border-color: color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 72%, transparent);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--xray-accent) 2%, transparent));
  transition: background .12s ease, border-color .12s ease, transform .12s ease, box-shadow .12s ease;
}

.xray-panel .xray-api-row:hover,
.xray-panel .xray-entry-row:hover,
.xray-panel .xray-console-row:hover,
.xray-panel .xray-log-row:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 9%, transparent), color-mix(in srgb, var(--xray-surface2) 72%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
}

.xray-glow .xray-api-row.selected,
.xray-glow .xray-entry-row.selected,
.xray-glow .xray-console-row.selected,
.xray-glow .xray-log-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent), 0 0 28px color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-panel .xray-method,
.xray-panel .xray-status,
.xray-panel .xray-response-chip,
.xray-panel .xray-chip,
.xray-panel .xray-badge {
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
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
  background: color-mix(in srgb, var(--xray-surface2) 88%, black 12%);
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  color: var(--xray-text);
  font-family: var(--xray-font);
}

.xray-panel .xray-input:focus,
.xray-panel .xray-select:focus,
.xray-panel textarea:focus,
.xray-panel input:focus,
.xray-panel select:focus {
  outline: none;
  border-color: var(--xray-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-accent) 18%, transparent);
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
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 5%, transparent), transparent 16%),
    color-mix(in srgb, var(--xray-bg) 86%, black 14%);
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  border-radius: var(--xray-radius);
}

.xray-panel .xray-json-line-no {
  color: color-mix(in srgb, var(--xray-hint) 82%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 72%, transparent);
}

.xray-panel .xray-json-key { color: var(--xray-blue); }
.xray-panel .xray-json-string { color: var(--xray-green); }
.xray-panel .xray-json-number { color: var(--xray-peach); }
.xray-panel .xray-json-bool { color: var(--xray-mauve); }
.xray-panel .xray-json-null { color: var(--xray-hint); }

.xray-panel .xray-detail-hero,
.xray-panel .xray-console-head,
.xray-panel .xray-api-toolbar,
.xray-panel .xray-api-command-bar,
.xray-panel .xray-detail-nav {
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 92%, var(--xray-accent) 8%), var(--xray-surface));
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-detail-tabs button,
.xray-panel .xray-view-btn,
.xray-panel .xray-operation-btn,
.xray-panel .xray-action-btn,
.xray-panel .xray-btn,
.xray-panel .xray-icon-btn {
  border-radius: var(--xray-radius);
}

.xray-panel .xray-operation-btn,
.xray-panel .xray-action-btn.primary,
.xray-panel .xray-btn.primary {
  background: linear-gradient(135deg, color-mix(in srgb, var(--xray-accent) 20%, transparent), color-mix(in srgb, var(--xray-mauve) 14%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 48%, transparent);
}

.xray-glow .xray-operation-btn:hover,
.xray-glow .xray-action-btn.primary:hover,
.xray-glow .xray-btn.primary:hover {
  box-shadow: 0 0 24px color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

.xray-panel .xray-settings-section-title,
.xray-panel .xray-danger-title,
.xray-panel h3,
.xray-panel h4 {
  text-transform: uppercase;
  letter-spacing: .12em;
  color: color-mix(in srgb, var(--xray-text) 88%, var(--xray-accent) 12%);
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
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: color-mix(in srgb, var(--xray-surface) 84%, transparent);
}

.xray-panel .xray-search {
  min-height: 38px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  border-radius: var(--xray-radius);
  background: color-mix(in srgb, var(--xray-bg) 72%, var(--xray-surface2) 28%);
}

.xray-panel .xray-network-head,
.xray-panel .xray-api-table-head {
  min-height: 32px;
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-bg) 86%, black 14%);
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-network-row,
.xray-panel .xray-api-row {
  font-variant-numeric: tabular-nums;
}

.xray-panel .xray-network-row.selected,
.xray-panel .xray-api-row.selected {
  background: linear-gradient(90deg, color-mix(in srgb, var(--xray-accent) 18%, transparent), color-mix(in srgb, var(--xray-surface2) 80%, transparent));
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

.xray-panel .xray-path,
.xray-panel .xray-api-path,
.xray-panel .xray-response-heading h3 {
  color: color-mix(in srgb, var(--xray-text) 86%, var(--xray-accent) 14%);
  font-weight: 800;
}

.xray-panel .xray-bar-track {
  background: color-mix(in srgb, var(--xray-surface3, var(--xray-surface2)) 78%, black 22%);
  border: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent)) 70%, transparent);
  overflow: hidden;
}

.xray-panel .xray-bar {
  background: linear-gradient(90deg, var(--xray-accent), var(--xray-green));
  box-shadow: 0 0 16px color-mix(in srgb, var(--xray-accent) 28%, transparent);
}

.xray-panel .xray-bar.slow { background: linear-gradient(90deg, var(--xray-yellow), var(--xray-peach)); }
.xray-panel .xray-bar.error { background: linear-gradient(90deg, var(--xray-red), color-mix(in srgb, var(--xray-red) 62%, var(--xray-peach))); }

.xray-panel .xray-request-detail {
  background: color-mix(in srgb, var(--xray-bg) 92%, black 8%);
}

.xray-panel .xray-detail-hero {
  padding: calc(14px * var(--xray-density-scale, 1));
  box-shadow: inset 3px 0 0 var(--xray-accent);
}

.xray-panel .xray-detail-tab,
.xray-panel .xray-detail-views .xray-chip {
  height: 30px;
  border: 1px solid transparent;
  color: var(--xray-subtext);
  background: transparent;
  font: 900 10px/1 var(--xray-font);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.xray-panel .xray-detail-tab.active,
.xray-panel .xray-detail-views .xray-chip.active {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 55%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
}

.xray-panel .xray-operation-groups {
  padding: 10px 12px;
  background: color-mix(in srgb, var(--xray-surface) 75%, transparent);
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-operation-group-label {
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.xray-panel .xray-operation-btn {
  min-height: 30px;
  color: var(--xray-text);
  font-size: 10px;
}

.xray-panel .xray-console-head {
  min-height: var(--xray-chrome-h, 44px);
}

.xray-panel .xray-console-tabs .xray-mini-tab {
  text-transform: none;
  letter-spacing: .04em;
}

.xray-panel .xray-console-row {
  font-variant-numeric: tabular-nums;
  /* Message stream scans best dense \u2014 override the shared 52px operator row
     height (that height is tuned for the API/log tables, not a log stream). */
  min-height: 28px;
}

.xray-panel .xray-prompt {
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 82%, transparent), color-mix(in srgb, var(--xray-bg) 96%, black 4%));
  border-top: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
}

.xray-panel .xray-prompt::before {
  content: '>';
  color: var(--xray-accent);
  font: 900 18px/1 var(--xray-font);
  text-shadow: 0 0 12px color-mix(in srgb, var(--xray-accent) 55%, transparent);
}

.xray-panel .xray-prompt .xray-input {
  min-height: 40px;
  border-radius: var(--xray-radius);
}

.xray-panel .xray-statusbar {
  min-height: 28px;
  padding: 0 12px;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-bg) 90%, black 10%);
  border-top: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: lowercase;
}

.xray-panel .xray-page-head {
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 88%, var(--xray-accent) 12%), var(--xray-surface));
}

.xray-panel .xray-page-head h3 {
  margin: 0;
  font-size: 14px;
}

.xray-panel .xray-page-head p {
  color: var(--xray-subtext);
}

.xray-panel .xray-insight-columns,
.xray-panel .xray-insight-grid {
  padding: 14px;
}

.xray-panel .xray-card::before,
.xray-panel .xray-api-metric::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--xray-accent), transparent);
  opacity: .75;
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
  border-color: color-mix(in srgb, var(--xray-accent) 42%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 10%, var(--xray-surface2) 60%);
}

.xray-panel .xray-api-metric {
  position: relative;
  overflow: hidden;
  border-color: var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: linear-gradient(145deg, color-mix(in srgb, var(--xray-surface) 88%, white 7%), color-mix(in srgb, var(--xray-bg) 90%, black 10%));
}

.xray-panel .xray-api-metric strong {
  font-size: 18px;
  color: var(--xray-text);
  text-shadow: 0 0 16px color-mix(in srgb, var(--xray-accent) 20%, transparent);
}

/* XRAY Operator UI prompt layout hardening */
.xray-panel .xray-prompt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(180px, auto);
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-top: 1px solid color-mix(in srgb, var(--xray-border) 78%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--xray-bg-elevated) 92%, transparent), color-mix(in srgb, var(--xray-bg) 92%, transparent)),
    linear-gradient(180deg, color-mix(in srgb, var(--xray-accent) 12%, transparent), transparent 60%);
}

.xray-panel .xray-prompt::before {
  display: none;
}

.xray-panel .xray-prompt > svg {
  color: var(--xray-accent-2);
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--xray-accent-2) 32%, transparent));
}

.xray-panel .xray-prompt-command {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
}

.xray-panel .xray-prompt input,
.xray-panel .xray-prompt textarea {
  min-width: 0;
  width: 100%;
  min-height: 38px;
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--xray-border) 90%, var(--xray-accent));
  border-radius: var(--xray-radius-lg);
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-bg-elevated) 82%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xray-text) 4%, transparent);
  font: inherit;
}

.xray-panel .xray-prompt input:focus,
.xray-panel .xray-prompt textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--xray-accent) 78%, var(--xray-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xray-accent) 16%, transparent);
}

.xray-panel .xray-context-chip {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: end;
  max-width: min(28vw, 460px);
  padding: 8px 13px;
  border: 1px solid color-mix(in srgb, var(--xray-accent) 55%, var(--xray-border));
  border-radius: 999px;
  color: var(--xray-text);
  background: color-mix(in srgb, var(--xray-accent) 10%, transparent);
}

@container xray (max-width: 860px) {
  .xray-panel .xray-prompt {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .xray-panel .xray-prompt-command {
    grid-column: 2 / -1;
  }

  .xray-panel .xray-context-chip {
    grid-column: 2 / -1;
    justify-self: stretch;
    max-width: none;
  }
}


/* \u2500\u2500 God-tier feature styling: flags, drift, actions, waterfall, frames, tokens, rules, replay, AI \u2500\u2500 */

.xray-api-flag.drift,
.xray-api-flag.graphql {
  color: var(--xray-mauve);
  border-color: color-mix(in srgb, var(--xray-mauve) 40%, transparent);
  background: color-mix(in srgb, var(--xray-mauve) 12%, transparent);
}

.xray-api-flag.ws {
  color: var(--xray-teal);
  border-color: color-mix(in srgb, var(--xray-teal) 38%, transparent);
  background: color-mix(in srgb, var(--xray-teal) 12%, transparent);
}

.xray-api-flag.mocked,
.xray-api-flag.replayed {
  color: var(--xray-blue);
  border-color: color-mix(in srgb, var(--xray-blue) 38%, transparent);
  background: color-mix(in srgb, var(--xray-blue) 12%, transparent);
}

.xray-drift-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 0;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--xray-mauve) 40%, transparent);
  border-radius: var(--xray-radius);
  color: var(--xray-mauve);
  background: color-mix(in srgb, var(--xray-mauve) 10%, transparent);
  font-size: 11px;
}

.xray-drift-banner span {
  flex: 1;
}

.xray-detail-actionbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px 0;
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
.xray-waterfall-dot.total { background: var(--xray-accent, var(--xray-blue)); }

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
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 20%, transparent);
}

.xray-ws-state.open { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 14%, transparent); }
.xray-ws-state.closed { color: var(--xray-subtext); }
.xray-ws-state.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }

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
  font-weight: 800;
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
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.xray-token-exp.valid { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 14%, transparent); }
.xray-token-exp.expired { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }

.xray-token-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.xray-token-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-hint);
}

/* Rules tab */
.xray-rules-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 70%, transparent);
}

.xray-rules-toolbar-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--xray-subtext);
  margin-right: 2px;
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
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-accent, var(--xray-blue));
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
  padding: 4px 2px;
}

.xray-replay-line {
  display: flex;
  gap: 8px;
}

.xray-replay-line .xray-select {
  flex: 0 0 110px;
}

.xray-replay-line .xray-input {
  flex: 1;
}

/* AI Explain modal */
.xray-explain-body {
  min-height: 160px;
  padding: 6px 2px;
}

.xray-explain-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--xray-subtext);
  padding: 24px 0;
}

.xray-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid color-mix(in srgb, var(--xray-blue) 30%, transparent);
  border-top-color: var(--xray-accent, var(--xray-blue));
  border-radius: 50%;
  animation: xray-spin .7s linear infinite;
}

@keyframes xray-spin {
  to { transform: rotate(360deg); }
}

.xray-explain-error {
  display: flex;
  gap: 10px;
  color: var(--xray-red);
  padding: 16px 0;
}

.xray-explain-error .xray-btn {
  margin-top: 8px;
}

.xray-explain-result {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--xray-text);
  font-size: 12px;
}

/* \u2500\u2500 Console snippet bar (folded-in Notebook) \u2500\u2500 */
.xray-snippet-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  background: color-mix(in srgb, var(--xray-surface) 82%, transparent);
  overflow: hidden;
}

.xray-snippet-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .4px;
  color: var(--xray-hint);
}

.xray-snippet-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.xray-snippet-chips::-webkit-scrollbar { display: none; }

.xray-snippet-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 220px;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 36%, transparent);
  border-radius: 999px;
  background: rgba(var(--xray-surface-rgb), .6);
  overflow: hidden;
}

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
  color: var(--xray-accent, var(--xray-blue));
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

.xray-snippet-save {
  flex-shrink: 0;
  padding: 5px 10px;
}

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
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--xray-subtext);
  background: color-mix(in srgb, var(--xray-hint) 18%, transparent);
}

.xray-log-level.error { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 14%, transparent); }
.xray-log-level.warn { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 14%, transparent); }
.xray-log-level.info { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 14%, transparent); }

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
  background: var(--xray-accent, var(--xray-blue));
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
  align-items: flex-start;
}

.xray-theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  min-width: 220px;
}

.xray-theme-swatch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 28%, transparent));
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
  border-color: var(--xray-accent, var(--xray-blue));
  box-shadow: 0 0 0 1px var(--xray-accent, var(--xray-blue)), 0 6px 18px rgba(0, 0, 0, .3);
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
  outline: 2px solid var(--xray-accent, var(--xray-blue));
  outline-offset: 1px;
}

.xray-chip,
.xray-icon-btn,
.xray-btn,
.xray-api-row,
.xray-network-row,
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
.xray-network-row .xray-icon-btn:hover,
.xray-console-row .xray-icon-btn:hover,
.xray-log-row .xray-icon-btn:hover {
  transform: none;
}

.xray-api-table-scroll:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent, var(--xray-blue)) 45%, transparent);
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
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius-lg);
  background: rgba(var(--xray-surface-rgb), .5);
}

.xray-custom-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-custom-presets-label {
  font-size: 10px;
  font-weight: 800;
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
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 40%, transparent));
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
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius);
  background: var(--xray-bg);
  color: var(--xray-text);
  overflow: hidden;
  font-size: 11px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .18);
}

.xray-tp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--xray-surface) 94%, var(--xray-text) 6%), var(--xray-surface));
  border-bottom: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--xray-accent) 18%, transparent);
}

.xray-tp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--xray-accent);
  box-shadow: 0 0 8px var(--xray-accent);
}

.xray-tp-brand {
  font-weight: 900;
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
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 55%, transparent);
}

.xray-tp-row.selected {
  background: color-mix(in srgb, var(--xray-accent) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--xray-accent);
}

.xray-tp-method {
  font-weight: 800;
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
  font-weight: 800;
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
  font-weight: 800;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.xray-tp-badge.green { color: var(--xray-green); background: color-mix(in srgb, var(--xray-green) 16%, transparent); }
.xray-tp-badge.yellow { color: var(--xray-yellow); background: color-mix(in srgb, var(--xray-yellow) 16%, transparent); }
.xray-tp-badge.red { color: var(--xray-red); background: color-mix(in srgb, var(--xray-red) 16%, transparent); }
.xray-tp-badge.blue { color: var(--xray-blue); background: color-mix(in srgb, var(--xray-blue) 16%, transparent); }
.xray-tp-badge.mauve { color: var(--xray-mauve); background: color-mix(in srgb, var(--xray-mauve) 16%, transparent); }

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
  font-weight: 800;
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
  border: 1px solid color-mix(in srgb, var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent)) 60%, transparent);
  border-radius: var(--xray-radius);
  background: rgba(var(--xray-surface-rgb), .45);
  transition: border-color var(--xray-dur-fast) var(--xray-ease), background var(--xray-dur-fast) var(--xray-ease);
}

.xray-token-field.pinned {
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
  background: color-mix(in srgb, var(--xray-accent) 7%, rgba(var(--xray-surface-rgb), .45));
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
  font-weight: 800;
  letter-spacing: .5px;
  text-transform: uppercase;
  padding: 1px 4px;
  border-radius: 999px;
  color: var(--xray-hint);
  background: color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-token-field.pinned .xray-token-state {
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 16%, transparent);
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
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
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
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
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
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 30%, transparent));
  border-radius: var(--xray-radius, 8px);
  background: rgba(var(--xray-bg-rgb), .4);
}

.xray-contrast-title {
  font-size: 9px;
  font-weight: 800;
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
  font-weight: 800;
  text-transform: uppercase;
}

.xray-contrast-grade.ok {
  color: var(--xray-green);
  background: color-mix(in srgb, var(--xray-green) 16%, transparent);
}

.xray-contrast-grade.warn {
  color: var(--xray-yellow);
  background: color-mix(in srgb, var(--xray-yellow) 16%, transparent);
}

.xray-contrast-grade.fail {
  color: var(--xray-red);
  background: color-mix(in srgb, var(--xray-red) 18%, transparent);
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Frontend elevation \u2014 command center, empty states, motion, micro-interactions
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 Command center \u2500\u2500 */
.xray-command-modal {
  width: min(620px, 94vw);
}

.xray-command-search {
  margin: 0;
  padding: 14px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  border-radius: 0;
  background: transparent;
}

.xray-command-search .xray-input {
  font-size: 14px;
  border: none;
  background: transparent;
  padding: 0;
}

.xray-command-search .xray-input:focus {
  box-shadow: none;
  outline: none;
}

.xray-command-list {
  max-height: min(56vh, 460px);
  overflow-y: auto;
  padding: 6px;
  scroll-padding: 40px 0;
}

.xray-command-group + .xray-command-group {
  margin-top: 2px;
}

.xray-command-group-label {
  padding: 8px 10px 4px;
  font-size: 9px;
  font-weight: 800;
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

.xray-command-row.active {
  background: color-mix(in srgb, var(--xray-accent) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--xray-accent) 40%, transparent);
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
  color: var(--xray-accent);
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
  color: var(--xray-accent);
  font-weight: 800;
}

.xray-cmd-method {
  min-width: 34px;
  padding: 2px 5px;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  font-size: 9px;
  font-weight: 800;
  text-align: center;
  color: currentColor;
}

.xray-command-hint {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--xray-hint);
}

.xray-command-enter {
  color: var(--xray-accent);
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
  border-top: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
  font-size: 10px;
  color: var(--xray-hint);
}

.xray-command-foot kbd {
  display: inline-block;
  min-width: 16px;
  margin-right: 2px;
  padding: 1px 5px;
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 40%, transparent));
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
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-surface2) 70%, transparent);
}

.xray-gsearch-input {
  flex: 1;
  margin: 0;
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
  background: color-mix(in srgb, var(--xray-accent) 14%, transparent);
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
  font-weight: 800;
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

.xray-gsearch-snippet mark {
  background: color-mix(in srgb, var(--xray-accent) 34%, transparent);
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
  color: var(--xray-accent);
  background: color-mix(in srgb, var(--xray-accent) 12%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--xray-accent) 22%, transparent), 0 0 28px color-mix(in srgb, var(--xray-accent) 16%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--xray-accent) 20%, transparent);
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
  border-color: var(--xray-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--xray-accent) 45%, transparent);
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
  color: var(--xray-accent);
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

/* One column below the docked panel's narrow width, where three cells would each
   be ~60px wide and the body copy would break every second word. */
@media (max-width: 560px) {
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
.xray-api-row.selected,
.xray-network-row.selected,
.xray-entry-row.selected {
  box-shadow: inset 3px 0 0 var(--xray-accent, var(--xray-blue));
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
  border: 1px solid var(--xray-border, color-mix(in srgb, var(--xray-hint) 35%, transparent));
  background: rgba(var(--xray-surface2-rgb), .5);
  color: var(--xray-hint);
  font-size: 9px;
  font-weight: 800;
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
  letter-spacing: .4px;
  text-transform: uppercase;
  color: var(--xray-subtext, var(--xray-text));
}

.xray-headers-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
  border-radius: var(--xray-radius);
  overflow: hidden;
}

.xray-header-row {
  display: grid;
  grid-template-columns: minmax(120px, 220px) minmax(0, 1fr) 26px;
  gap: 8px;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 18%, transparent);
  font-size: 11px;
}

.xray-header-row:last-child {
  border-bottom: none;
}

.xray-header-row:hover {
  background: rgba(var(--xray-surface2-rgb), .55);
}

.xray-header-name {
  color: var(--xray-accent, var(--xray-blue));
  font-weight: 800;
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 30%, transparent);
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
  border-bottom: 1px solid color-mix(in srgb, var(--xray-hint) 16%, transparent);
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
  font-weight: 900;
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
  font-weight: 800;
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
  font: 800 10px/1 var(--xray-font);
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

/* API filters collapsible: keep the chip blocks spaced like the old toolbar. */
.xray-api-filters-collapsible .xray-collapsible-header {
  padding: 0 0 2px;
}

.xray-api-filters-collapsible .xray-collapsible-inner {
  display: grid;
  gap: 8px;
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

.xray-insight-overview .xray-collapsible-header {
  padding: 0 0 6px;
}

/* Density toggle in the API table header (last column, right-aligned). */
.xray-api-table-tools {
  display: flex;
  justify-content: flex-end;
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
  border: 1px solid color-mix(in srgb, var(--xray-hint) 40%, transparent);
  border-radius: 999px;
  background: rgba(var(--xray-surface2-rgb), .6);
  color: var(--xray-subtext, var(--xray-text));
  cursor: pointer;
  font: 800 10px/1 var(--xray-font);
  letter-spacing: .02em;
}

.xray-json-tree-btn:hover {
  color: var(--xray-text);
  border-color: color-mix(in srgb, var(--xray-accent) 45%, transparent);
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

.xray-json-branch {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.xray-json-branch:hover {
  background: rgba(var(--xray-surface2-rgb), .4);
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
  font-weight: 800;
}

.xray-json-scalar {
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .xray-json-chevron {
    transition: none;
  }
}

/* \u2500\u2500 Console: rendered errors (ErrorBlock) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.xray-error-name {
  color: var(--xray-red);
  font-weight: 900;
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

.xray-error-fn {
  color: var(--xray-text);
  font-weight: 800;
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

/* \u2500\u2500 Network sub-tab: status swatch, stream chip, type, waterfall \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.xray-status-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 1px 6px;
  border-radius: var(--xray-radius-sm);
  font-weight: 900;
  font-size: 11px;
  /* tinted background so unusual codes pop (Firefox Network Monitor) */
  background: color-mix(in srgb, currentColor 16%, transparent);
}

.xray-status-swatch.ok { color: var(--xray-green); }
.xray-status-swatch.redirect { color: var(--xray-yellow); }
.xray-status-swatch.warn { color: var(--xray-peach); }
.xray-status-swatch.error { color: var(--xray-red); }
.xray-status-swatch.pending { color: var(--xray-subtext, var(--xray-hint)); }

.xray-status-chip.stream {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid color-mix(in srgb, var(--xray-mauve) 45%, transparent);
  color: var(--xray-mauve);
  background: color-mix(in srgb, var(--xray-mauve) 12%, transparent);
}

.xray-stream-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.xray-status-chip.stream.open .xray-stream-dot {
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent);
}

.xray-status-chip.stream.closed {
  color: var(--xray-subtext, var(--xray-hint));
  border-color: color-mix(in srgb, var(--xray-hint) 40%, transparent);
  background: transparent;
}

.xray-net-type {
  color: var(--xray-subtext, var(--xray-hint));
  font-weight: 700;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xray-net-size {
  text-align: right;
  font-size: 11px;
}

.xray-waterfall-cell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.xray-waterfall-track {
  position: relative;
  height: 12px;
  min-width: 0;
  border-radius: var(--xray-radius-sm);
  background: color-mix(in srgb, var(--xray-surface2) 60%, transparent);
  overflow: hidden;
}

/* Positioned on the shared time axis; the outer bar = downloading, the inner
   contrasting segment = waiting/TTFB (Chrome's two-tone waterfall). */
.xray-waterfall-bar {
  position: absolute;
  top: 2px;
  bottom: 2px;
  /* Floor the width so a fast, near-instant request still reads as a legible
     pill instead of a 2px dot; slow requests stay proportionally wider. */
  min-width: 10px;
  border-radius: var(--xray-radius-sm);
  background: var(--xray-accent, var(--xray-blue));
}

.xray-waterfall-bar.slow { background: var(--xray-yellow); }
.xray-waterfall-bar.error { background: var(--xray-red); }

.xray-waterfall-wait {
  display: block;
  height: 100%;
  border-radius: var(--xray-radius-sm) 0 0 var(--xray-radius-sm);
  /* Sits on top of the bar, which is painted --xray-accent (a light pastel on
     dark themes, a darkened variant on light ones). Washing toward --xray-bg
     tracks that inversion. Measured against the bar, the dark themes go
     1.39 -> 2.36/2.43/2.55; the light ones stay level (2.04 -> ~1.9) since
     --xray-bg is close to the white this replaces. */
  background: color-mix(in srgb, var(--xray-bg) 42%, transparent);
}

.xray-waterfall-ms {
  color: var(--xray-subtext, var(--xray-hint));
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.xray-network-row.expanded {
  background: color-mix(in srgb, var(--xray-accent) 8%, transparent);
}
`});var z1,H1=E(()=>{z1=`:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--xray-surface2);
  border-radius: var(--xray-radius, 10px);
  background: var(--xray-bg);
  box-shadow: 0 18px 60px rgba(0, 0, 0, .38);
}

#xray-hud-root,
.xray-app-root {
  width: 100%;
  height: 100%;
}

.xray-panel.xray-mode-hud {
  position: relative;
  inset: auto;
  top: auto;
  right: auto;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  border: 0;
  border-left: 0;
  border-radius: var(--xray-radius);
  box-shadow: none;
}

.xray-panel.xray-mode-hud .xray-topbar {
  border-radius: var(--xray-radius) var(--xray-radius) 0 0;
}

.xray-panel.xray-mode-hud .xray-drag-handle {
  cursor: grab;
}

.xray-panel.xray-mode-hud .xray-drag-handle:active {
  cursor: grabbing;
}

/* The floating HUD carries its own drag/resize/collapse chrome (hud-mount.js), so
   the docked side panel's resize grabber and dock/close cluster don't belong here.
   These rules only exist in the HUD because hud.css is loaded only there. */
.xray-panel.xray-mode-hud .xray-resize-handle,
.xray-panel.xray-mode-hud .xray-dock-controls {
  display: none;
}

/* Container-based: the HUD's width is user-dragged and independent of the window. */
@container xray (max-width: 520px) {
  .xray-panel.xray-mode-hud .xray-summary,
  .xray-panel.xray-mode-hud .xray-tab span:not(.xray-badge) {
    display: none;
  }
}
`});var mM=da(()=>{var P1=H(nI());T1();F1();$e();B1();L1();H1();var U1=H(X());function uM(){let e=window;e.__xray_hud_capture__||(e.__xray_hud_capture__=!0,window.addEventListener("message",t=>{if(t.source!==window)return;let a=t.data;if(!a||!a.__xray_capture__)return;let o=e.__XRAY_BRIDGE_TOKEN__||e.__XRAY_bridgeToken;if(!o||a.token!==o)return;let r=I.getState();if(a.update&&a.entry){r.updateEntry(a.entry);return}if(a.batch&&Array.isArray(a.entries)){r.addEntries(a.entries.filter(Boolean));return}a.entry&&r.addEntry(a.entry)}))}async function q1(){let e=window,a=document.currentScript?.getRootNode?.(),o=e.__xrayHudShadow instanceof ShadowRoot?e.__xrayHudShadow:a instanceof ShadowRoot?a:null;if(!o)return;if(o.host instanceof HTMLElement&&D1(o.host),!o.querySelector("style[data-xray-hud-ui]")){let n=document.createElement("style");n.setAttribute("data-xray-hud-ui","1"),n.textContent=`${N1}
${O1}
${z1}`,o.appendChild(n)}let r=o.querySelector("#xray-hud-root");r||(r=document.createElement("div"),r.id="xray-hud-root",r.className="xray-app-root",o.appendChild(r)),uM(),await I.getState().restorePreferences(),I.getState().setOpen(!0),I.getState().setDevtoolsMode(!1),I.getState().setInitialized(!0),(0,P1.createRoot)(r).render((0,U1.jsx)(M1,{mode:"hud"})),pM(o)}var dM=["--xray-radius","--xray-bg","--xray-surface","--xray-surface2","--xray-text","--xray-accent"],_1=null;function pM(e){let t=e.host;if(!(t instanceof HTMLElement))return;let a=()=>{let n=e.querySelector(".xray-panel");if(!n)return;let l=getComputedStyle(n);for(let s of dM){let i=l.getPropertyValue(s).trim();i&&t.style.setProperty(s,i)}},o=0,r=()=>{o||(o=requestAnimationFrame(()=>{o=0,a()}))};requestAnimationFrame(()=>requestAnimationFrame(a)),_1?.(),_1=I.subscribe(r)}window.__xrayHudRemount=()=>{q1()};q1()});return mM();})();
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
@tabler/icons-react/dist/esm/icons/IconAdjustments.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertTriangle.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowBackUp.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowDownLeft.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowDown.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowRight.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowUpRight.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowUp.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowsExchange.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowsMaximize.mjs:
@tabler/icons-react/dist/esm/icons/IconBolt.mjs:
@tabler/icons-react/dist/esm/icons/IconBookmarkPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconBookmark.mjs:
@tabler/icons-react/dist/esm/icons/IconBraces.mjs:
@tabler/icons-react/dist/esm/icons/IconChartBar.mjs:
@tabler/icons-react/dist/esm/icons/IconCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronDown.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs:
@tabler/icons-react/dist/esm/icons/IconCircleCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconCircleX.mjs:
@tabler/icons-react/dist/esm/icons/IconClipboard.mjs:
@tabler/icons-react/dist/esm/icons/IconClock.mjs:
@tabler/icons-react/dist/esm/icons/IconCode.mjs:
@tabler/icons-react/dist/esm/icons/IconColorPicker.mjs:
@tabler/icons-react/dist/esm/icons/IconCopy.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabaseImport.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabase.mjs:
@tabler/icons-react/dist/esm/icons/IconDeviceLaptop.mjs:
@tabler/icons-react/dist/esm/icons/IconDice.mjs:
@tabler/icons-react/dist/esm/icons/IconDownload.mjs:
@tabler/icons-react/dist/esm/icons/IconEraser.mjs:
@tabler/icons-react/dist/esm/icons/IconFileDiff.mjs:
@tabler/icons-react/dist/esm/icons/IconFileExport.mjs:
@tabler/icons-react/dist/esm/icons/IconFileImport.mjs:
@tabler/icons-react/dist/esm/icons/IconFilterOff.mjs:
@tabler/icons-react/dist/esm/icons/IconFilter.mjs:
@tabler/icons-react/dist/esm/icons/IconFoldDown.mjs:
@tabler/icons-react/dist/esm/icons/IconFold.mjs:
@tabler/icons-react/dist/esm/icons/IconHelp.mjs:
@tabler/icons-react/dist/esm/icons/IconInfoCircle.mjs:
@tabler/icons-react/dist/esm/icons/IconKey.mjs:
@tabler/icons-react/dist/esm/icons/IconKeyboard.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutList.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutRows.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutSidebarLeftExpand.mjs:
@tabler/icons-react/dist/esm/icons/IconLayoutSidebarRightExpand.mjs:
@tabler/icons-react/dist/esm/icons/IconLetterCase.mjs:
@tabler/icons-react/dist/esm/icons/IconLock.mjs:
@tabler/icons-react/dist/esm/icons/IconNetwork.mjs:
@tabler/icons-react/dist/esm/icons/IconPalette.mjs:
@tabler/icons-react/dist/esm/icons/IconPictureInPicture.mjs:
@tabler/icons-react/dist/esm/icons/IconPin.mjs:
@tabler/icons-react/dist/esm/icons/IconPinnedOff.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerRecord.mjs:
@tabler/icons-react/dist/esm/icons/IconPlugConnected.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconRadar2.mjs:
@tabler/icons-react/dist/esm/icons/IconRefresh.mjs:
@tabler/icons-react/dist/esm/icons/IconRegex.mjs:
@tabler/icons-react/dist/esm/icons/IconRepeat.mjs:
@tabler/icons-react/dist/esm/icons/IconRoute.mjs:
@tabler/icons-react/dist/esm/icons/IconSearch.mjs:
@tabler/icons-react/dist/esm/icons/IconSend.mjs:
@tabler/icons-react/dist/esm/icons/IconServer.mjs:
@tabler/icons-react/dist/esm/icons/IconSettings.mjs:
@tabler/icons-react/dist/esm/icons/IconShare.mjs:
@tabler/icons-react/dist/esm/icons/IconSparkles.mjs:
@tabler/icons-react/dist/esm/icons/IconTable.mjs:
@tabler/icons-react/dist/esm/icons/IconTerminal2.mjs:
@tabler/icons-react/dist/esm/icons/IconTimeline.mjs:
@tabler/icons-react/dist/esm/icons/IconTrash.mjs:
@tabler/icons-react/dist/esm/icons/IconWand.mjs:
@tabler/icons-react/dist/esm/icons/IconWaveSine.mjs:
@tabler/icons-react/dist/esm/icons/IconWorld.mjs:
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
